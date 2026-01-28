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

    // 2. Get Search Params
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const filter = searchParams.get('type') || 'all';

    if (!query) {
      return NextResponse.json({ success: true, results: [] });
    }

    // 3. Execute Search
    // Note: Firestore does not support full-text search. 
    // We will perform basic prefix selection and/or fetching recent items to filter in memory 
    // for a better experience without external services like Algolia.
    // We will prioritize ID/Code matches.

    const results: any[] = [];
    const limit = 20;

    // --- Search Tickets ---
    if (filter === 'all' || filter === 'tickets') {
        const ticketCollection = adminDb.collection('tickets');
        // Try strict match on code
        const codeSnapshot = await ticketCollection.where('uniqueCode', '>=', query.toUpperCase()).where('uniqueCode', '<=', query.toUpperCase() + '\uf8ff').limit(5).get();
        codeSnapshot.forEach((doc: any) => results.push({ id: doc.id, typeId: 'ticket', ...doc.data() }));

        // Try match on email
        const emailSnapshot = await ticketCollection.where('email', '>=', query).where('email', '<=', query + '\uf8ff').limit(5).get();
        emailSnapshot.forEach((doc: any) => {
            if (!results.find(r => r.id === doc.id)) {
                results.push({ id: doc.id, typeId: 'ticket', ...doc.data() });
            }
        });
    }

    // --- Search Users ---
    if (filter === 'all' || filter === 'users') {
        const usersCollection = adminDb.collection('users');
        // Try match on email
        const userEmailSnap = await usersCollection.where('email', '>=', query).where('email', '<=', query + '\uf8ff').limit(5).get();
        userEmailSnap.forEach((doc: any) => results.push({ id: doc.id, typeId: 'user', ...doc.data() }));

        // Try match on displayName (case sensitive in Firestore, so this is best effort)
        // We really should use a proper search engine, but this is a "fix" for now.
    }

    // --- Search Payments ---
    if (filter === 'all' || filter === 'payments') {
        const paymentsCollection = adminDb.collection('payments');
        // Try match on reference (often stored as 'reference' or the ID itself)
        // Checks if query looks like a reference (often starts with REF or is numeric)
        // We'll search `reference` field
        
        // Exact match or close match
        // Note: Check if field is 'reference' or 'paymentReference' based on schema
        // Based on previous code, it seems to be 'reference' or 'id'
        
        // Fetch recent payments and filter if query is generic, or specific query if it looks like a ref
        const paymentSnap = await paymentsCollection.orderBy('createdAt', 'desc').limit(50).get();
        paymentSnap.forEach((doc: any) => {
            const data = doc.data();
            const ref = data.reference || data.paymentReference || doc.id;
            const userEmail = data.userEmail || '';
            
            if (
                ref.toLowerCase().includes(query) || 
                userEmail.toLowerCase().includes(query)
            ) {
                if (!results.find(r => r.id === doc.id)) {
                    results.push({ 
                        id: doc.id, 
                        typeId: 'payment', 
                        ...data,
                        // Ensure standard fields
                        reference: ref
                    });
                }
            }
        });
    }

    // Deduplicate and Sort?
    // The client handles display.
    
    // Normalize Data for UI
    const finalResults = results.map((item: any) => ({
        id: item.id,
        typeId: item.typeId,
        name: item.fullName || item.displayName || item.name || 'Unknown',
        email: item.email || item.userEmail,
        code: item.uniqueCode,
        reference: item.reference || item.paymentReference,
        status: item.status,
        amount: item.amount,
        createdAt: item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt
    }));

    return NextResponse.json({
      success: true,
      results: finalResults
    });

  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
