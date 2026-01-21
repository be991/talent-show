// ============================================
// PRICING CONSTANTS
// ============================================

export const PRICING = {
  CONTESTANT: 10000,
  AUDIENCE: 1500,
} as const;

// ============================================
// TALENT CATEGORIES
// ============================================

export const TALENT_CATEGORIES = [
  'Musician',
  'Singer',
  'Dancer',
  'Comedian',
  'Artist',
  'Poet',
  'Spoken Word',
  'Other',
] as const;

// ============================================
// FACULTIES (NUTESA/University Example)
// ============================================

export const FACULTIES = [
  'Engineering',
  'Physical Sciences',
  'Life Sciences',
  'Social Sciences',
  'Arts',
  'Education',
  'Environmental Sciences',
  'Management Sciences',
  'Basic Medical Sciences',
  'Agriculture',
] as const;

// ============================================
// LEVELS
// ============================================

export const LEVELS = ['100', '200', '300', '400', '500', '600'] as const;

// ============================================
// TICKET LIMITS
// ============================================

export const TICKET_LIMITS = {
  MIN_AUDIENCE_TICKETS: 1,
  MAX_AUDIENCE_TICKETS: 10,
  MAX_ADDITIONAL_AUDIENCE_BY_CONTESTANT: 10,
} as const;

// ============================================
// PAYMENT SETTINGS
// ============================================

export const PAYMENT_SETTINGS = {
  TRANSFER_PROOF_DEADLINE_HOURS: 24,
} as const;

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION_RULES = {
  PHONE_REGEX: /^(\+234|0)[789]\d{9}$/,
  UNIQUE_CODE_LENGTH: 9,
  MIN_STAGE_NAME_LENGTH: 3,
  MAX_STAGE_NAME_LENGTH: 50,
  MAX_PHOTO_SIZE_MB: 5,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// ============================================
// ROUTE CONSTANTS
// ============================================

export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  DASHBOARD: '/dashboard',
  REGISTER_CONTESTANT: '/register/contestant',
  REGISTER_AUDIENCE: '/register/audience',
  PAYMENT: '/payment',
  PAYMENT_SUCCESS: '/payment/success',
  TICKET: (id: string) => `/ticket/${id}`,

  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_TICKETS: '/admin/tickets',
  ADMIN_TICKET_DETAIL: (id: string) => `/admin/tickets/${id}`,
  ADMIN_APPROVALS: '/admin/approvals',
  ADMIN_APPROVAL_DETAIL: (id: string) => `/admin/approvals/${id}`,
  ADMIN_SCANNER: '/admin/scanner',
  ADMIN_MESSAGING: '/admin/messaging',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_CONTESTANTS: '/admin/contestants',
  ADMIN_AUDIENCE: '/admin/audience',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SEARCH: '/admin/search',
  ADMIN_USERS: '/admin/users',
  ADMIN_LOGS: '/admin/logs',
} as const;

// ============================================
// STATUS OPTIONS
// ============================================

export const TICKET_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', color: 'warning' },
  { label: 'Verified', value: 'verified', color: 'success' },
  { label: 'Rejected', value: 'rejected', color: 'error' },
  { label: 'Used', value: 'used', color: 'info' },
] as const;
