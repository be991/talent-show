import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { sendBroadcastEmail } from '@/lib/email/send';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(decodedToken.email || '')) {
      return NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
    }

    // 2. Parse Request
    const { filters, channel, subject, messageBody } = await req.json();

    if (!filters || filters.length === 0) {
      return NextResponse.json({ success: false, error: 'Recipients filter required' }, { status: 400 });
    }

    // 3. Query Recipients from Firestore
    let query: any = adminDb.collection('tickets');

    // Simple filtering logic based on standard filters
    // Note: Multiple where clauses might require composite indexes. 
    // We'll fetch all then filter in memory if needed for simplicity in development,
    // but a production app would use optimized queries.
    const snapshot = await query.get();
    let tickets = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Apply Filters
    if (!filters.includes('all')) {
      tickets = tickets.filter((t: any) => {
        const matchesType = (filters.includes('contestant') && t.ticketType === 'contestant') ||
                           (filters.includes('audience') && t.ticketType === 'audience');
        const matchesStatus = (filters.includes('verified') && t.status === 'verified') ||
                             (filters.includes('pending') && (t.status === 'pending' || t.status === 'awaiting_approval'));
        
        return matchesType || matchesStatus;
      });
    }

    // Deduplicate by email and phone
    const uniqueRecipients = new Map();
    
    // Fetch user emails from users collection if not on ticket
    const usersSnapshot = await adminDb.collection('users').get();
    const userMap = new Map(usersSnapshot.docs.map((doc: any) => [doc.id, doc.data()]));

    tickets.forEach((t: any) => {
      const user = userMap.get(t.userId);
      const email = t.email || user?.email;
      const phone = t.phoneNumber || t.whatsappNumber || user?.phone;
      const name = t.fullName || user?.displayName || 'Recipient';

      if (email && !uniqueRecipients.has(email)) {
        uniqueRecipients.set(email, {
          email,
          phone,
          name,
          ticket_code: t.uniqueCode,
          userId: t.userId
        });
      }
    });

    const finalRecipients = Array.from(uniqueRecipients.values());

    if (finalRecipients.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0, message: 'No recipients found' });
    }

    // 4. Fetch Event Settings for Template Variables
    const settingsDoc = await adminDb.collection('eventSettings').doc('settings').get();
    const eventSettings = settingsDoc.data() || {};
    
    const contextRecipients = finalRecipients.map(r => ({
      ...r,
      event_date: eventSettings.eventDate ? new Date(eventSettings.eventDate).toLocaleDateString() : 'TBA',
      event_venue: eventSettings.eventVenue || 'TBA',
    }));

    // 5. Execute Sending
    let emailResults = null;
    if (channel === 'email' || channel === 'both') {
      emailResults = await sendBroadcastEmail(contextRecipients, subject, messageBody);
    }

    // 6. Log the Broadcast
    await adminDb.collection('broadcasts').add({
      type: filters.join(', '),
      recipients: finalRecipients.length,
      channel,
      sentBy: decodedToken.email,
      subject,
      body: messageBody,
      timestamp: new Date(),
      status: 'Sent'
    });

    return NextResponse.json({
      success: true,
      sentCount: finalRecipients.length,
      recipients: contextRecipients, // Return for WhatsApp manual flow
      emailResults
    });

  } catch (error: any) {
    console.error('Blast Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
