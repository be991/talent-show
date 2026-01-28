import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminField } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { ticketId, admittedCount, adminId, adminName } = await req.json();

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // 1. Update ticket record
    await adminDb.collection('tickets').doc(ticketId).update({
      admittedAt: adminField.serverTimestamp(),
      admittedCount: admittedCount || 1,
      admittedBy: adminId || 'scanner',
      updatedAt: adminField.serverTimestamp(),
    });

    // 2. Log admin action
    await adminDb.collection('adminLogs').add({
      adminId: adminId || 'scanner',
      adminName: adminName || 'Gate Admin',
      action: `Admitted ${admittedCount || 1} person(s)`,
      targetType: 'ticket',
      targetId: ticketId,
      timestamp: adminField.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Admission confirmed successfully',
    });

  } catch (error) {
    console.error('Admit ticket error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm admission' },
      { status: 500 }
    );
  }
}
