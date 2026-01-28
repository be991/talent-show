import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Admin Session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(decodedToken.email || '')) {
      return NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
    }

    // 2. Fetch history
    const snapshot = await adminDb.collection('broadcasts')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const history = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Timestamp to ISO string for JSON
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp
      };
    });

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error: any) {
    console.error('Fetch History Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
