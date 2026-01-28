export const ticketEmailTemplate = (ticket: any, qrCodeUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2D5016; }
    .ticket-box { background: #f9f9f9; padding: 20px; border-radius: 15px; border: 2px dashed #F5C542; margin-bottom: 20px; text-align: center; }
    .qr-code { width: 200px; height: 200px; margin: 20px auto; }
    .details { margin-top: 20px; text-align: left; }
    .footer { text-align: center; font-size: 12px; color: #888; margin-top: 30px; }
    .btn { display: inline-block; padding: 12px 25px; background: #2D5016; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">NGT10 - TALENT STARDOM</div>
      <h2>Your Ticket is Ready!</h2>
    </div>
    
    <div class="ticket-box">
      <p style="text-transform: uppercase; letter-spacing: 2px; font-weight: bold; color: #666;">Official Entry Ticket</p>
      <h3 style="margin: 10px 0;">${ticket.ticketType === 'contestant' ? 'CONTESTANT' : 'AUDIENCE'}</h3>
      <p style="font-size: 18px; font-weight: bold; color: #2D5016;">${ticket.fullName}</p>
      
      <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
      
      <p style="font-family: monospace; font-size: 18px; letter-spacing: 3px; background: #eee; padding: 5px 10px; display: inline-block;">${ticket.uniqueCode}</p>
    </div>

    <div class="details">
      <p><strong>Event:</strong> NUTESA Got Talent NGT10</p>
      <p><strong>Venue:</strong> University Main Auditorium</p>
      <p><strong>Date:</strong> Check portal for actual date/time</p>
    </div>

    <center>
      <a href="https://talent-show-ngt10.vercel.app/dashboard" class="btn">View on Dashboard</a>
    </center>

    <div class="footer">
      <p>&copy; 2024 NUTESA. All rights reserved.</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const paymentConfirmationTemplate = (payment: any) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { color: #2D5016; border-bottom: 2px solid #F5C542; padding-bottom: 10px; }
    .amount { font-size: 32px; font-weight: bold; color: #2D5016; }
    .footer { font-size: 12px; color: #999; margin-top: 50px; }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Payment Received</h2>
    <p>Hi ${payment.fullName},</p>
    <p>We've successfully received your payment for <strong>NGT10 - Talent Stardom</strong>.</p>
    
    <div style="background: #f4f7f2; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <p style="margin: 0; color: #666;">Amount Paid:</p>
      <div class="amount">₦${payment.amount.toLocaleString()}</div>
      <p style="margin: 10px 0 0; color: #888; font-size: 14px;">Ref: ${payment.reference}</p>
    </div>

    <p>Your tickets are being generated and will be sent to your email shortly. You can also view them in your dashboard.</p>
    
    <div class="footer">
       NUTESA Got Talent NGT10 Team
    </div>
  </div>
</body>
</html>
`;

export const transferApprovedTemplate = (fullName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.5; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .status { color: #2D5016; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Bank Transfer <span class="status">Approved</span> ✅</h2>
    <p>Hi ${fullName},</p>
    <p>Your bank transfer proof has been verified and approved by the admins.</p>
    <p>Your tickets have been activated. You should receive them in a separate email now.</p>
    <p>See you at the show!</p>
  </div>
</body>
</html>
`;

export const transferRejectedTemplate = (fullName: string, reason: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.5; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .status { color: #cc0000; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Bank Transfer <span class="status">Declined</span> ❌</h2>
    <p>Hi ${fullName},</p>
    <p>Your bank transfer proof was not approved for the following reason:</p>
    <div style="background: #fff0f0; padding: 15px; border-left: 4px solid #cc0000; margin: 20px 0;">
      ${reason}
    </div>
    <p>Please log in to your dashboard to re-upload a valid proof of payment or contact support.</p>
  </div>
</body>
</html>
`;

export const adminNotificationTemplate = (subject: string, message: string) => `
<!DOCTYPE html>
<html>
<body>
  <h2>Admin Notification: ${subject}</h2>
  <p>${message}</p>
  <hr />
  <p>System Log Timestamp: ${new Date().toLocaleString()}</p>
</body>
</html>
`;

export const eventReminderTemplate = (to: string, eventData: any) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.5; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #2D5016; border-radius: 10px; }
    .header { background: #2D5016; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Event Reminder!</h1>
    </div>
    <div style="padding: 20px;">
      <h2>${eventData.name || 'NGT10 - Talent Stardom'}</h2>
      <p>Hello,</p>
      <p>This is a reminder for the upcoming talent show. We are excited to see you!</p>
      <p><strong>Venue:</strong> ${eventData.venue || 'Main Auditorium'}</p>
      <p><strong>Date:</strong> ${eventData.date || 'TBA'}</p>
      <p><strong>Time:</strong> ${eventData.time || 'TBA'}</p>
      <p>Don't forget to have your QR code ready on your phone or printed out for easy entry.</p>
    </div>
  </div>
</body>
</html>
`;
