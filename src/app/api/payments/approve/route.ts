import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminField } from '@/lib/firebase/admin';
import { sendTransferApproved, sendTicketEmail } from '@/lib/email/send';

export async function POST(req: NextRequest) {
  try {
    const { paymentId, adminId, adminName } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // 0. Fetch payment and user info
    const paymentDoc = await adminDb.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
       return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }
    const paymentData = paymentDoc.data();
    const userDoc = await adminDb.collection('users').doc(paymentData?.userId).get();
    const userEmail = userDoc.data()?.email;

    // 1. Update payment record
    await adminDb.collection('payments').doc(paymentId).update({
      status: 'success',
      verifiedAt: adminField.serverTimestamp(),
      verifiedBy: adminId || 'system',
      updatedAt: adminField.serverTimestamp(),
    });

    // 2. Find associated tickets and update them
    const ticketsQuery = await adminDb.collection('tickets')
      .where('paymentId', '==', paymentId)
      .get();

    const batch = adminDb.batch();
    const updatedTickets: any[] = [];

    ticketsQuery.docs.forEach((doc: any) => {
      const ticketData = doc.data();
      batch.update(doc.ref, {
        status: 'verified',
        updatedAt: adminField.serverTimestamp(),
      });
      updatedTickets.push(ticketData);
    });

    await batch.commit();

    // 3. Log admin action
    await adminDb.collection('adminLogs').add({
      adminId: adminId || 'unknown',
      adminName: adminName || 'Admin',
      action: 'Approved bank transfer',
      targetType: 'payment',
      targetId: paymentId,
      timestamp: adminField.serverTimestamp(),
    });

    // 4. Trigger ticket delivery via Email
    if (userEmail) {
      await sendTransferApproved(userEmail, updatedTickets[0]?.fullName || 'User');
      for (const ticket of updatedTickets) {
        await sendTicketEmail(userEmail, ticket, ticket.qrCode);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer approved and tickets verified successfully',
    });

  } catch (error) {
    console.error('Approve transfer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve transfer' },
      { status: 500 }
    );
  }
}
