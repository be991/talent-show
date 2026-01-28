import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Ticket code is required' },
        { status: 400 }
      );
    }

    // Query ticket by uniqueCode
    const ticketsQuery = await adminDb.collection('tickets')
      .where('uniqueCode', '==', code)
      .limit(1)
      .get();

    if (ticketsQuery.empty) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const ticketDoc = ticketsQuery.docs[0];
    const ticketData = ticketDoc.data();

    // Check if ticket is verified (paid)
    if (ticketData.status !== 'verified') {
      return NextResponse.json({
        success: false,
        error: 'Ticket is not verified. Payment might still be pending.',
        ticket: { id: ticketDoc.id, ...ticketData }
      });
    }

    // Check if ticket has already been used
    if (ticketData.admittedAt) {
      return NextResponse.json({
        success: false,
        error: `Ticket already used at ${ticketData.admittedAt.toDate().toLocaleString()}`,
        ticket: { id: ticketDoc.id, ...ticketData }
      });
    }

    return NextResponse.json({
      success: true,
      ticket: { id: ticketDoc.id, ...ticketData }
    });

  } catch (error) {
    console.error('Verify ticket error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while verifying ticket' },
      { status: 500 }
    );
  }
}
