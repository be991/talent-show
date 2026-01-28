import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminField } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail, amount, purpose } = await req.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a pending payment record
    const paymentData = {
      userId,
      userEmail,
      amount,
      purpose: purpose || 'ticket_purchase',
      paymentMethod: 'bank_transfer',
      status: 'pending',
      createdAt: adminField.serverTimestamp(),
    };

    const paymentRef = await adminDb.collection('payments').add(paymentData);

    // Bank Account Details
    const bankDetails = {
      bankName: "GTBank",
      accountNumber: "0123456789",
      accountName: "NUTESA Talent Show",
      reference: paymentRef.id // Use payment ID as reference
    };

    return NextResponse.json({
      success: true,
      paymentId: paymentRef.id,
      bankDetails,
      message: 'Transfer initiated successfully',
    });

  } catch (error) {
    console.error('Initiate transfer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate transfer' },
      { status: 500 }
    );
  }
}
