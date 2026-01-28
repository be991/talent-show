import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { adminDb, adminField } from '@/lib/firebase/admin';
import QRCode from 'qrcode';
import { sendTicketEmail, sendPaymentConfirmation } from '@/lib/email/send';

export async function POST(req: NextRequest) {
  try {
    const { registrationData, paymentReference, paymentMethod } = await req.json();
    
    // 1. Generate unique ticket code (9 chars: ABC-123-XYZ)
    const uniqueCode = `${nanoid(3).toUpperCase()}-${nanoid(3).toUpperCase()}-${nanoid(3).toUpperCase()}`;
    
    // 2. Generate QR code
    const qrData = `TICKET_${uniqueCode}_${Date.now()}`;
    const qrCode = await QRCode.toDataURL(qrData);
    
    // 3. Create payment record
    const paymentData = {
      userId: registrationData.userId,
      amount: registrationData.totalAmount || 0,
      paymentMethod,
      status: paymentMethod === 'card' ? 'success' : 'pending',
      paystackReference: paymentReference || null,
      transactionDate: adminField.serverTimestamp(),
    };
    
    const paymentRef = await adminDb.collection('payments').add(paymentData);
    
    // 4. Create main ticket (contestant or audience)
    if (registrationData.ticketType === 'contestant') {
      // Create contestant ticket
      const contestantTicketData = {
        userId: registrationData.userId,
        ticketType: 'contestant',
        status: paymentMethod === 'card' ? 'verified' : 'pending',
        uniqueCode,
        qrCode,
        
        // Contestant details
        fullName: registrationData.fullName || 'Guest',
        stageName: registrationData.stageName || '',
        phoneNumber: registrationData.phone || registrationData.phoneNumber || '',
        whatsappNumber: registrationData.whatsapp || registrationData.whatsappNumber || '',
        faculty: registrationData.faculty,
        department: registrationData.department,
        level: registrationData.level,
        category: registrationData.category,
        gender: registrationData.gender,
        photoURL: registrationData.photoURL || null,
        
        // Payment info
        numberOfTickets: 1 + (registrationData.audienceTicketCount || 0),
        totalAmount: registrationData.totalAmount || 10000,
        paymentReference: paymentReference || null,
        paymentId: paymentRef.id,
        
        createdAt: adminField.serverTimestamp(),
        updatedAt: adminField.serverTimestamp(),
      };
      
      const contestantTicketRef = await adminDb.collection('tickets').add(contestantTicketData);
      
      // Send Email if verified
      if (paymentMethod === 'card') {
        const userDoc = await adminDb.collection('users').doc(registrationData.userId).get();
        const userEmail = userDoc.data()?.email;
        if (userEmail) {
          await sendPaymentConfirmation(userEmail, {
            fullName: contestantTicketData.fullName,
            amount: contestantTicketData.totalAmount,
            reference: paymentReference
          });
          await sendTicketEmail(userEmail, contestantTicketData, contestantTicketData.qrCode);
        }
      }
      
      // 5. Create linked audience tickets (if any)
      const audienceGuests = registrationData.audienceGuests || registrationData.audienceTickets;
      
      if (audienceGuests && audienceGuests.length > 0) {
        for (const audienceData of audienceGuests) {
          const audienceUniqueCode = `${nanoid(3).toUpperCase()}-${nanoid(3).toUpperCase()}-${nanoid(3).toUpperCase()}`;
          const audienceQrCode = await QRCode.toDataURL(`TICKET_${audienceUniqueCode}_${Date.now()}`);
          
          const audienceTicketData = {
            userId: registrationData.userId,
            ticketType: 'audience',
            status: paymentMethod === 'card' ? 'verified' : 'pending',
            uniqueCode: audienceUniqueCode,
            qrCode: audienceQrCode,
            
            fullName: audienceData.name || audienceData.fullName || 'Guest',
            phoneNumber: audienceData.phone || audienceData.phoneNumber || '',
            
            // Linked to contestant
            purchasedBy: registrationData.userId,
            linkedToContestantTicket: contestantTicketRef.id,
            
            numberOfTickets: 1,
            totalAmount: 1500,
            paymentReference: paymentReference || null,
            paymentId: paymentRef.id,
            
            createdAt: adminField.serverTimestamp(),
            updatedAt: adminField.serverTimestamp(),
          };
          
          await adminDb.collection('tickets').add(audienceTicketData);
          
          if (paymentMethod === 'card') {
            const userDoc = await adminDb.collection('users').doc(registrationData.userId).get();
            const userEmail = userDoc.data()?.email;
            if (userEmail) {
              await sendTicketEmail(userEmail, audienceTicketData, audienceTicketData.qrCode);
            }
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        ticketId: contestantTicketRef.id,
        paymentId: paymentRef.id,
        message: 'Ticket created successfully',
      });
      
    } else {
      // Create audience ticket(s)
      const ticketsToCreate = registrationData.tickets || [registrationData];
      let firstTicketId = '';
      
      for (const [index, ticketData] of ticketsToCreate.entries()) {
        const audienceUniqueCode = `${nanoid(3).toUpperCase()}-${nanoid(3).toUpperCase()}-${nanoid(3).toUpperCase()}`;
        const audienceQrCode = await QRCode.toDataURL(`TICKET_${audienceUniqueCode}_${Date.now()}`);
        
        const audienceTicketData = {
          userId: registrationData.userId,
          ticketType: 'audience',
          status: paymentMethod === 'card' ? 'verified' : 'pending',
          uniqueCode: audienceUniqueCode,
          qrCode: audienceQrCode,
          
          fullName: ticketData.fullName || registrationData.fullName || 'Guest',
          phoneNumber: ticketData.phoneNumber || registrationData.phoneNumber || '',
          
          numberOfTickets: 1,
          totalAmount: 1500,
          paymentReference: paymentReference || null,
          paymentId: paymentRef.id,
          
          createdAt: adminField.serverTimestamp(),
          updatedAt: adminField.serverTimestamp(),
        };
        
        const ticketRef = await adminDb.collection('tickets').add(audienceTicketData);
        if (index === 0) firstTicketId = ticketRef.id;

        if (paymentMethod === 'card') {
          const userDoc = await adminDb.collection('users').doc(registrationData.userId).get();
          const userEmail = userDoc.data()?.email;
          if (userEmail) {
            if (index === 0) {
              await sendPaymentConfirmation(userEmail, {
                fullName: audienceTicketData.fullName,
                amount: registrationData.totalAmount,
                reference: paymentReference
              });
            }
            await sendTicketEmail(userEmail, audienceTicketData, audienceTicketData.qrCode);
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        ticketId: firstTicketId,
        paymentId: paymentRef.id,
        message: 'Tickets created successfully',
      });
    }
    
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
