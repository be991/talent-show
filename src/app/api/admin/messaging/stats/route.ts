import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const ticketsRef = adminDb.collection('tickets');
    const snapshot = await ticketsRef.get();

    let all = 0;
    let contestant = 0;
    let audience = 0;
    let verified = 0;
    let pending = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        all++;
        if (data.ticketType === 'contestant') contestant++;
        else audience++; // assume audience if not contestant
        
        if (data.status === 'verified') verified++;
        if (data.status === 'pending') pending++;
    });

    return NextResponse.json({
      success: true,
      stats: {
        all,
        contestant,
        audience,
        verified,
        pending
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
