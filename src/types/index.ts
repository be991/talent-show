// ============================================
// USER TYPES
// ============================================

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
}

// ============================================
// TICKET TYPES
// ============================================

export type TicketType = 'contestant' | 'audience';
export type TicketStatus = 'pending' | 'verified' | 'rejected' | 'used';

export interface BaseTicket {
  id: string;
  userId: string;
  ticketType: TicketType;
  status: TicketStatus;
  uniqueCode: string; // 9-character code
  qrCode: string; // Base64 or URL to QR code
  numberOfTickets: number;
  totalAmount: number;
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContestantTicket extends BaseTicket {
  ticketType: 'contestant';
  // Contestant-specific fields
  fullName: string;
  stageName: string;
  phoneNumber: string;
  whatsappNumber: string;
  faculty: string;
  department: string;
  level: string;
  category: TalentCategory;
  gender: 'Male' | 'Female';
  photoURL: string;
  // Audience tickets purchased by this contestant
  audienceTickets?: AudienceTicket[];
}

export interface AudienceTicket extends BaseTicket {
  ticketType: 'audience';
  // Audience-specific fields
  fullName: string;
  phoneNumber: string;
  // If purchased by a contestant
  purchasedBy?: string; // Contestant userId
  linkedToContestantTicket?: string; // Contestant ticket ID
}

export type Ticket = ContestantTicket | AudienceTicket;

// Talent Categories
export type TalentCategory =
  | 'Musician'
  | 'Singer'
  | 'Dancer'
  | 'Comedian'
  | 'Artist'
  | 'Poet'
  | 'Spoken Word'
  | 'Other';

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentMethod = 'card' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paystackReference: string;
  transactionDate: Date;
  // For bank transfers
  transferProofURL?: string;
  transferProofUploadedAt?: Date;
  adminReviewedBy?: string;
  adminReviewedAt?: Date;
  rejectionReason?: string;
}

// ============================================
// FORM DATA TYPES (for registration forms)
// ============================================

export interface ContestantFormData {
  fullName: string;
  stageName: string;
  phoneNumber: string;
  whatsappNumber: string;
  faculty: string;
  department: string;
  level: string;
  category: TalentCategory;
  gender: 'Male' | 'Female';
  photo: File;
  numberOfAudienceTickets: number; // 0-10
  audienceTickets: Array<{
    fullName: string;
    phoneNumber: string;
  }>;
}

export interface AudienceFormData {
  fullName: string;
  phoneNumber: string;
  numberOfTickets: number; // 1-10
  tickets: Array<{
    fullName: string;
    phoneNumber: string;
  }>;
}

// ============================================
// EVENT SETTINGS TYPES (for admin)
// ============================================

export interface EventSettings {
  eventName: string;
  eventDate?: Date;
  eventTime?: string;
  eventVenue?: string;
  contestantPrice: number; // ₦10,000
  audiencePrice: number; // ₦1,500
  registrationOpen: boolean;
  maxContestants?: number;
  maxAudienceTickets?: number;
  updatedBy: string;
  updatedAt: Date;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'ticket' | 'payment' | 'user' | 'settings';
  targetId?: string;
  description: string;
  timestamp: Date;
}

export interface AdminStats {
  totalTickets: number;
  totalContestants: number;
  totalAudience: number;
  totalRevenue: number;
  pendingApprovals: number;
  verifiedTickets: number;
  rejectedPayments: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

export type Maybe<T> = T | null | undefined;

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
