import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // 2. Fetch Users
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.limit(50).get();

    const users = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.displayName || data.fullName || 'No Name',
            email: data.email || 'No Email',
            role: data.role || 'user',
            tickets: data.ticketsCount || 0, // Assuming denormalized or 0
            spent: data.totalSpent || 0,     // Assuming denormalized
            joined: data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : '2024-01-01',
            photoURL: data.photoURL
        };
    });

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error: any) {
    console.error('Users API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
