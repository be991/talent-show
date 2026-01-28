import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminField } from '@/lib/firebase/admin';
import { sendTransferRejected } from '@/lib/email/send';

export async function POST(req: NextRequest) {
  try {
    const { paymentId, reason, adminId, adminName } = await req.json();

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
    const fullName = userDoc.data()?.fullName || 'User';

    // 1. Update payment record
    await adminDb.collection('payments').doc(paymentId).update({
      status: 'failed',
      rejectionReason: reason || 'Information verification failed',
      rejectedAt: adminField.serverTimestamp(),
      rejectedBy: adminId || 'system',
      updatedAt: adminField.serverTimestamp(),
    });

    // 2. Add admin action to log
    await adminDb.collection('adminLogs').add({
      adminId: adminId || 'unknown',
      adminName: adminName || 'Admin',
      action: `Rejected transfer: ${reason || 'N/A'}`,
      targetType: 'payment',
      targetId: paymentId,
      timestamp: adminField.serverTimestamp(),
    });

    // 3. Send notification to user about rejection
    if (userEmail) {
      await sendTransferRejected(userEmail, fullName, reason || 'Information verification failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer rejected successfully',
    });

  } catch (error) {
    console.error('Reject transfer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject transfer' },
      { status: 500 }
    );
  }
}
