import { NextRequest, NextResponse } from 'next/server';
import { sendTicketEmail } from '@/lib/email/send';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, ticketData, qrCodeUrl } = body;

    if (!to || !ticketData || !qrCodeUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: to, ticketData, qrCodeUrl' },
        { status: 400 }
      );
    }

    const result = await sendTicketEmail(to, ticketData, qrCodeUrl);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('API Email Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
