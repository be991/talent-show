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
    
    // Check admin email
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(decodedToken.email || '')) {
      return NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
    }

    // 2. Fetch Data High-Level Stats
    // NOTE: In production with millions of docs, use distributed counters or aggregation queries.
    // For this size (likely thousands), client-side SDK aggregation or simple queries work okay, 
    // but Admin SDK `count()` and `sum()` aggregation is best.

    // A. Revenue
    const paymentsRef = adminDb.collection('payments');
    const successfulPaymentsQuery = paymentsRef.where('status', '==', 'success');
    const paymentsSnapshot = await successfulPaymentsQuery.get();
    
    let totalRevenue = 0;
    let paymentCount = 0;
    const dailyRevenue: Record<string, number> = {};

    paymentsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      const amount = Number(data.amount) || 0;
      totalRevenue += amount;
      paymentCount++;

      // Daily trend (last 30 days)
      if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          dailyRevenue[key] = (dailyRevenue[key] || 0) + amount;
      }
    });

    // B. Tickets
    const ticketsRef = adminDb.collection('tickets');
    const ticketsSnapshot = await ticketsRef.get(); // Get metadata only ideally if just counting
    const totalTickets = ticketsSnapshot.size;
    
    const categoryCounts: Record<string, number> = {};
    let verifiedTickets = 0;
    let admittedTickets = 0;

    ticketsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data.status === 'verified') verifiedTickets++;
      if (data.admittedAt) admittedTickets++; // Assuming admittedAt exists if admitted
      
      const cat = data.category || 'Standard';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Calculate Average Order
    const avgOrder = paymentCount > 0 ? totalRevenue / paymentCount : 0;

    // Format Daily Revenue for Chart (Last 12 days for simplicity layout)
    const today = new Date();
    const chartData = [];
    for(let i=11; i>=0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const val = dailyRevenue[key] || 0;
        chartData.push({ date: key, value: val });
    }

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
            total: totalRevenue,
            trend: '+0%', // Dynamic trend calc is complex without historical periods, placeholder for now
        },
        tickets: {
            total: totalTickets,
            verified: verifiedTickets,
            admitted: admittedTickets,
            trend: '+0%'
        },
        avgOrder: {
            value: avgOrder,
            trend: '+0%'
        },
        chart: chartData,
        categories: Object.entries(categoryCounts).map(([k, v]) => ({ label: k, count: v }))
      }
    });

  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
