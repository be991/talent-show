import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminField } from '@/lib/firebase/admin';
import { sendEventReminder } from '@/lib/email/send';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get event settings
    const settingsDoc = await adminDb.collection('eventSettings').doc('settings').get();
    const settings = settingsDoc.data();

    if (!settings?.eventDate) {
      return NextResponse.json({
        success: false,
        message: 'No event date set in settings',
      });
    }

    // 2. Calculate days until event
    const eventDate = new Date(settings.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 3. Only send reminders at 7, 3, and 1 day(s) before
    if (![7, 3, 1].includes(daysUntil)) {
      return NextResponse.json({
        success: true,
        message: `No reminders scheduled today (${daysUntil} days until event)`,
        daysUntil,
      });
    }

    // 4. Get all verified tickets
    const ticketsSnapshot = await adminDb
      .collection('tickets')
      .where('status', '==', 'verified')
      .get();

    const tickets = ticketsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (tickets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No verified tickets to send reminders to',
        daysUntil,
      });
    }

    // 5. Send reminders
    const reminderKey = `reminder_${daysUntil}days`;
    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const ticket of tickets as any[]) {
      // Skip if reminder already sent for this interval
      if (ticket[reminderKey]) {
        skippedCount++;
        continue;
      }

      // Get user email
      const userDoc = await adminDb.collection('users').doc(ticket.userId).get();
      const userEmail = userDoc.data()?.email;

      if (!userEmail) {
        failedCount++;
        continue;
      }

      try {
        await sendEventReminder(userEmail, {
          name: settings.eventName || 'NGT10 - Talent Stardom',
          venue: settings.venue || 'Main Auditorium',
          date: settings.eventDate,
          time: settings.eventTime || '4:00 PM',
          daysUntil,
          ticketHolder: ticket.fullName,
        });

        // Mark reminder as sent
        await adminDb.collection('tickets').doc(ticket.id).update({
          [reminderKey]: true,
          [`${reminderKey}_sentAt`]: adminField.serverTimestamp(),
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send reminder to ${userEmail}:`, error);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      daysUntil,
      sentCount,
      failedCount,
      skippedCount,
      totalTickets: tickets.length,
      message: `Sent ${sentCount} reminders for ${daysUntil}-day notice`,
    });

  } catch (error) {
    console.error('Reminder cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}
