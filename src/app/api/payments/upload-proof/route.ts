import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminField } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { paymentId, proofUrl } = await req.json();

    if (!paymentId || !proofUrl) {
      return NextResponse.json(
        { success: false, error: 'Payment ID and proof URL are required' },
        { status: 400 }
      );
    }

    // Update payment record
    const paymentRef = adminDb.collection('payments').doc(paymentId);
    
    await paymentRef.update({
      proofUrl,
      status: 'review_pending',
      uploadedAt: adminField.serverTimestamp(),
      updatedAt: adminField.serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: 'Payment proof uploaded successfully',
    });

  } catch (error) {
    console.error('Upload proof error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload proof' },
      { status: 500 }
    );
  }
}
