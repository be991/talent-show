import { Resend } from 'resend';
import { 
  ticketEmailTemplate, 
  paymentConfirmationTemplate, 
  transferApprovedTemplate, 
  transferRejectedTemplate,
  adminNotificationTemplate,
  eventReminderTemplate
} from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendTicketEmail(to: string, ticketData: any, qrCodeUrl: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `NGT10 Tickets <${FROM_EMAIL}>`,
      to: [to],
      subject: `Your NGT10 Ticket - ${ticketData.uniqueCode}`,
      html: ticketEmailTemplate(ticketData, qrCodeUrl),
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending ticket email:', error);
    throw error;
  }
}

export async function sendPaymentConfirmation(to: string, paymentData: any) {
  try {
    await resend.emails.send({
      from: `NGT10 Payments <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Payment Received - NGT10 Talent Stardom',
      html: paymentConfirmationTemplate(paymentData),
    });
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
  }
}

export async function sendTransferApproved(to: string, fullName: string) {
  try {
    await resend.emails.send({
      from: `NGT10 Support <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Bank Transfer Approved - NGT10',
      html: transferApprovedTemplate(fullName),
    });
  } catch (error) {
    console.error('Error sending transfer approved email:', error);
  }
}

export async function sendTransferRejected(to: string, fullName: string, reason: string) {
  try {
    await resend.emails.send({
      from: `NGT10 Support <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Update Regarding Your Payment - NGT10',
      html: transferRejectedTemplate(fullName, reason),
    });
  } catch (error) {
    console.error('Error sending transfer rejected email:', error);
  }
}

export async function sendAdminNotification(subject: string, message: string) {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  if (adminEmails.length === 0) return;

  try {
    await resend.emails.send({
      from: `NGT10 System <${FROM_EMAIL}>`,
      to: adminEmails,
      subject: `[ADMIN] ${subject}`,
      html: adminNotificationTemplate(subject, message),
    });
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

export async function sendEventReminder(to: string, eventData: any) {
  try {
    await resend.emails.send({
      from: `NGT10 Info <${FROM_EMAIL}>`,
      to: [to],
      subject: `Reminder: ${eventData.name || 'NGT10 Talent Stardom'}`,
      html: eventReminderTemplate(to, eventData),
    });
  } catch (error) {
    console.error('Error sending event reminder email:', error);
  }
}

export async function sendBroadcastEmail(recipients: { email: string; name: string; [key: string]: any }[], subject: string, messageBody: string) {
  try {
    const batch = recipients.map(recipient => {
      let personalizedBody = messageBody;
      Object.keys(recipient).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        personalizedBody = personalizedBody.replace(regex, recipient[key]);
      });

      return {
        from: `NGT10 Announcements <${FROM_EMAIL}>`,
        to: [recipient.email],
        subject: subject,
        html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="background-color: #2D5016; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">NGT10 STARDOM</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                  <h2 style="color: #2D5016; margin-top: 0;">${subject}</h2>
                  <div style="white-space: pre-wrap;">${personalizedBody}</div>
                </div>
                <div style="padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
                  &copy; 2024 NUTESA Got Talent Season 10. All rights reserved.
                </div>
              </div>`,
      };
    });

    // Resend batch limit is 100 emails per batch call
    const chunks = [];
    for (let i = 0; i < batch.length; i += 100) {
      chunks.push(batch.slice(i, i + 100));
    }

    const results = [];
    for (const chunk of chunks) {
      // Correct API is resend.batch.send (singular)
      const { data, error } = await resend.batch.send(chunk);
      if (error) {
        console.error('Resend Batch Error:', error);
        throw error;
      }
      results.push(data);
    }

    return results;
  } catch (error) {
    console.error('Error sending broadcast email:', error);
    throw error;
  }
}
