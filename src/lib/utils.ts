import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string | number) {
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function getWhatsAppTicketLink(ticket: any) {
  const baseUrl = "https://wa.me/";
  const domain = "https://talent-show-ngt10.vercel.app";
  
  const text = `🎟️ *NGT10 - TALENT STARDOM TICKET* 🎟️

Hello *${ticket.fullName}*,

Your ticket for NUTESA Got Talent Season 10 is ready! 🎉

----------------------------------
🎫 *TICKET DETAILS*
----------------------------------
👤 *Name:* ${ticket.fullName}
🎭 *Type:* ${ticket.ticketType?.toUpperCase()}
🔢 *Unique Code:* ${ticket.uniqueCode}
📅 *Date:* March 2026
📍 *Venue:* University Main Auditorium
----------------------------------

📲 *Digital Ticket Link:*
${domain}/ticket/${ticket.id}

Please present the unique code above or open the digital ticket link for the QR scan at the entrance.

See you at the stardom! 🌟`;

  return `${baseUrl}?text=${encodeURIComponent(text)}`;
}
