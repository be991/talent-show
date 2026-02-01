import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminField } from '@/lib/firebase/admin';
import { sendTicketEmail } from '@/lib/email/send';

export async function POST(req: NextRequest) {
  try {
    const { ticketId, userId } = await req.json();

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // 1. Fetch ticket
    const ticketDoc = await adminDb.collection('tickets').doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const ticketData = { id: ticketDoc.id, ...ticketDoc.data() } as any;

    // 2. Verify ownership
    if (userId && ticketData.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 3. Only resend verified tickets
    if (ticketData.status !== 'verified') {
      return NextResponse.json(
        { success: false, error: 'Ticket not yet verified. Please wait for payment approval.' },
        { status: 400 }
      );
    }

    // 4. Get user email
    const userDoc = await adminDb.collection('users').doc(ticketData.userId).get();
    const userEmail = userDoc.data()?.email;

    // 5. Send email
    let emailSent = false;
    if (userEmail) {
      try {
        await sendTicketEmail(userEmail, ticketData, ticketData.qrCode);
        emailSent = true;
      } catch (error) {
        console.error('Email resend failed:', error);
      }
    }

    // 6. Generate WhatsApp link (client-side generation is preferred, but we return ticket data)
    const domain = "https://talent-show-ngt1.0.vercel.app";
    const whatsappText = `🎟️ *NGT1.0 - TALENT STARDOM TICKET* 🎟️

Hello *${ticketData.fullName}*,

Your ticket for NUTESA Got Talent Season 10 is ready! 🎉

----------------------------------
🎫 *TICKET DETAILS*
----------------------------------
👤 *Name:* ${ticketData.fullName}
🎭 *Type:* ${ticketData.ticketType?.toUpperCase()}
🔢 *Unique Code:* ${ticketData.uniqueCode}
📅 *Date:* March 2026
📍 *Venue:* University Main Auditorium
----------------------------------

📲 *Digital Ticket Link:*
${domain}/ticket/${ticketData.id}

Please present the unique code above or open the digital ticket link for the QR scan at the entrance.

See you at the stardom! 🌟`;

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

    // 7. Update ticket with resend tracking
    await adminDb.collection('tickets').doc(ticketId).update({
      lastResentAt: adminField.serverTimestamp(),
      resentCount: (ticketData.resentCount || 0) + 1,
    });

    return NextResponse.json({
      success: true,
      emailSent,
      whatsappLink,
      message: 'Ticket resent successfully',
    });

  } catch (error) {
    console.error('Resend ticket error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend ticket' },
      { status: 500 }
    );
  }
}
