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
