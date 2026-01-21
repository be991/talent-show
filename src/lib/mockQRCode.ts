/**
 * Generates a mock QR code as a base64-encoded SVG string.
 * This is used for UI demonstration before real QR code generation is implemented.
 */
export const generateMockQRCode = (ticketId: string, uniqueCode: string): string => {
  const qrData = `TICKET_${ticketId}_${uniqueCode}`;
  
  // Create a simple SVG with the ticket data and styling
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#F5C542"/>
      <rect x="20" y="20" width="160" height="160" fill="white"/>
      <rect x="40" y="40" width="30" height="30" fill="#2D5016"/>
      <rect x="130" y="40" width="30" height="30" fill="#2D5016"/>
      <rect x="40" y="130" width="30" height="30" fill="#2D5016"/>
      <rect x="80" y="80" width="40" height="40" fill="#2D5016"/>
      <text x="50%" y="90%" text-anchor="middle" font-family="monospace" font-size="8" fill="#2D5016">${qrData}</text>
    </svg>
  `;
  
  // Use Buffer for base64 encoding (Next.js environment)
  const base64 = typeof window === 'undefined' 
    ? Buffer.from(svg).toString('base64') 
    : btoa(svg);
    
  return `data:image/svg+xml;base64,${base64}`;
};
