import {
  User,
  ContestantTicket,
  AudienceTicket,
  Payment,
  EventSettings,
  AdminStats,
  AdminLog,
  TalentCategory,
} from '@/types';
import { generateMockQRCode } from './mockQRCode';

// ============================================
// MOCK USERS (15+)
// ============================================

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@student.edu.ng',
    displayName: 'John Doe',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    role: 'user',
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date('2024-01-21'),
  },
  {
    id: 'user-2',
    email: 'jane.smith@student.edu.ng',
    displayName: 'Jane Smith',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    role: 'user',
    createdAt: new Date('2024-01-12'),
    lastLogin: new Date('2024-01-20'),
  },
  {
    id: 'user-3',
    email: 'bisi.ade@student.edu.ng',
    displayName: 'Bisi Ade',
    role: 'user',
    createdAt: new Date('2024-01-13'),
    lastLogin: new Date('2024-01-18'),
  },
  {
    id: 'user-4',
    email: 'chidi.okafor@student.edu.ng',
    displayName: 'Chidi Okafor',
    role: 'user',
    createdAt: new Date('2024-01-14'),
    lastLogin: new Date('2024-01-19'),
  },
  {
    id: 'user-5',
    email: 'emeka.nwosu@student.edu.ng',
    displayName: 'Emeka Nwosu',
    role: 'user',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-16'),
  },
  {
    id: 'user-6',
    email: 'fatima.idris@student.edu.ng',
    displayName: 'Fatima Idris',
    role: 'user',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-15'),
  },
  {
    id: 'user-7',
    email: 'tunde.bakare@student.edu.ng',
    displayName: 'Tunde Bakare',
    role: 'user',
    createdAt: new Date('2024-01-16'),
    lastLogin: new Date('2024-01-20'),
  },
  {
    id: 'user-8',
    email: 'ngozi.eze@student.edu.ng',
    displayName: 'Ngozi Eze',
    role: 'user',
    createdAt: new Date('2024-01-16'),
    lastLogin: new Date('2024-01-16'),
  },
  {
    id: 'user-9',
    email: 'sani.abacha@student.edu.ng',
    displayName: 'Sani Abacha',
    role: 'user',
    createdAt: new Date('2024-01-17'),
    lastLogin: new Date('2024-01-17'),
  },
  {
    id: 'user-10',
    email: 'amina.mohammed@student.edu.ng',
    displayName: 'Amina Mohammed',
    role: 'user',
    createdAt: new Date('2024-01-18'),
    lastLogin: new Date('2024-01-18'),
  },
  {
    id: 'user-11',
    email: 'olumide.femi@student.edu.ng',
    displayName: 'Olumide Femi',
    role: 'user',
    createdAt: new Date('2024-01-19'),
    lastLogin: new Date('2024-01-21'),
  },
  {
    id: 'user-12',
    email: 'kelechi.iheanacho@student.edu.ng',
    displayName: 'Kelechi Iheanacho',
    role: 'user',
    createdAt: new Date('2024-01-20'),
    lastLogin: new Date('2024-01-20'),
  },
  {
    id: 'admin-1',
    email: 'admin@nutesa.org',
    displayName: 'Debrain (DOS)',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-01-21'),
  },
  {
    id: 'admin-2',
    email: 'registrar@nutesa.org',
    displayName: 'Sarah Registrar',
    role: 'admin',
    createdAt: new Date('2024-01-02'),
    lastLogin: new Date('2024-01-20'),
  },
  {
    id: 'admin-3',
    email: 'finance@nutesa.org',
    displayName: 'John Finance',
    role: 'admin',
    createdAt: new Date('2024-01-03'),
    lastLogin: new Date('2024-01-21'),
  },
];

// ============================================
// MOCK CONTESTANT TICKETS (20+)
// ============================================

export const mockContestantTickets: ContestantTicket[] = [
  {
    id: 'ticket-contestant-1',
    userId: 'user-1',
    ticketType: 'contestant',
    status: 'verified',
    uniqueCode: 'NGT-C7X9K',
    qrCode: generateMockQRCode('ticket-contestant-1', 'NGT-C7X9K'),
    numberOfTickets: 3,
    totalAmount: 13000,
    paymentReference: 'PAY-REF-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    fullName: 'John Doe',
    stageName: 'J-Dizzle',
    phoneNumber: '+2348012345678',
    whatsappNumber: '+2348012345678',
    faculty: 'Engineering',
    department: 'Computer Science',
    level: '300',
    category: 'Singer',
    gender: 'Male',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    id: 'ticket-contestant-2',
    userId: 'user-3',
    ticketType: 'contestant',
    status: 'pending',
    uniqueCode: 'NGT-C2M4P',
    qrCode: generateMockQRCode('ticket-contestant-2', 'NGT-C2M4P'),
    numberOfTickets: 1,
    totalAmount: 10000,
    paymentReference: 'PAY-REF-003',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    fullName: 'Bisi Ade',
    stageName: 'B-Star',
    phoneNumber: '+2348123456789',
    whatsappNumber: '+2348123456789',
    faculty: 'Arts',
    department: 'Theatre Arts',
    level: '200',
    category: 'Dancer',
    gender: 'Female',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bisi',
  },
];

// Generate more contestant tickets
for (let i = 4; i <= 22; i++) {
  const categories: TalentCategory[] = ['Musician', 'Singer', 'Dancer', 'Comedian', 'Artist', 'Poet', 'Spoken Word', 'Other'];
  const faculties = ['Engineering', 'Science', 'Arts', 'Social Sciences'];
  
  mockContestantTickets.push({
    id: `ticket-contestant-${i}`,
    userId: `user-${i}`,
    ticketType: 'contestant',
    status: i % 5 === 0 ? 'pending' : i % 7 === 0 ? 'rejected' : 'verified',
    uniqueCode: `NGT-C${(i * 12345).toString(36).substring(0, 5).toUpperCase()}`,
    qrCode: generateMockQRCode(`ticket-contestant-${i}`, `NGT-C${i}`),
    numberOfTickets: 1 + (i % 3),
    totalAmount: 10000 + (i % 3) * 1500,
    paymentReference: `PAY-REF-C${i}`,
    createdAt: new Date(2024, 0, 10 + (i % 10)),
    updatedAt: new Date(2024, 0, 10 + (i % 10)),
    fullName: `User ${i} FullName`,
    stageName: `StageName-${i}`,
    phoneNumber: `+23480${i}000000`.substring(0, 14),
    whatsappNumber: `+23480${i}000000`.substring(0, 14),
    faculty: faculties[i % faculties.length],
    department: 'General Studies',
    level: '100',
    category: categories[i % categories.length],
    gender: i % 2 === 0 ? 'Male' : 'Female',
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`,
  });
}

// ============================================
// MOCK AUDIENCE TICKETS (30+)
// ============================================

export const mockAudienceTickets: AudienceTicket[] = [
  {
    id: 'ticket-audience-1',
    userId: 'user-1',
    ticketType: 'audience',
    status: 'verified',
    uniqueCode: 'NGT-A2M4P',
    qrCode: generateMockQRCode('ticket-audience-1', 'NGT-A2M4P'),
    numberOfTickets: 1,
    totalAmount: 1500,
    paymentReference: 'PAY-REF-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    fullName: 'Sarah Doe (Guest)',
    phoneNumber: '+2348087654321',
    purchasedBy: 'user-1',
    linkedToContestantTicket: 'ticket-contestant-1',
  },
];

// Generate more audience tickets
for (let i = 2; i <= 40; i++) {
  const isLinked = i % 3 === 0;
  mockAudienceTickets.push({
    id: `ticket-audience-${i}`,
    userId: isLinked ? 'user-1' : `user-${(i % 12) + 1}`,
    ticketType: 'audience',
    status: i % 10 === 0 ? 'pending' : 'verified',
    uniqueCode: `NGT-A${(i * 67890).toString(36).substring(0, 5).toUpperCase()}`,
    qrCode: generateMockQRCode(`ticket-audience-${i}`, `NGT-A${i}`),
    numberOfTickets: 1,
    totalAmount: 1500,
    paymentReference: isLinked ? 'PAY-REF-001' : `PAY-REF-A${i}`,
    createdAt: new Date(2024, 0, 15 + (i % 5)),
    updatedAt: new Date(2024, 0, 15 + (i % 5)),
    fullName: `Audience Guest ${i}`,
    phoneNumber: `+23490${i}000000`.substring(0, 14),
    purchasedBy: isLinked ? 'user-1' : undefined,
    linkedToContestantTicket: isLinked ? 'ticket-contestant-1' : undefined,
  });
}

// ============================================
// MOCK PAYMENTS (50+)
// ============================================

export const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    userId: 'user-1',
    amount: 13000,
    paymentMethod: 'card',
    status: 'success',
    paystackReference: 'PST-ABC123XYZ',
    transactionDate: new Date('2024-01-15'),
  },
];

for (let i = 2; i <= 55; i++) {
  const isTransfer = i % 4 === 0;
  mockPayments.push({
    id: `payment-${i}`,
    userId: `user-${(i % 12) + 1}`,
    amount: i % 5 === 0 ? 10000 : 1500 * (1 + (i % 5)),
    paymentMethod: isTransfer ? 'bank_transfer' : 'card',
    status: i % 15 === 0 ? 'failed' : isTransfer && i % 8 === 0 ? 'pending' : 'success',
    paystackReference: `PST-REF-${(i * 9876).toString(36).toUpperCase()}`,
    transactionDate: new Date(2024, 0, 10 + (i % 10)),
    transferProofURL: isTransfer ? 'https://storage.example.com/proofs/proof.jpg' : undefined,
    transferProofUploadedAt: isTransfer ? new Date(2024, 0, 10 + (i % 10)) : undefined,
  });
}

// ============================================
// MOCK EVENT SETTINGS
// ============================================

export const mockEventSettings: EventSettings = {
  eventName: 'NUTESA Got Talent NGT1.0 - Talent Stardom',
  eventDate: new Date('2024-03-15'),
  eventTime: '16:00',
  eventVenue: 'Main Auditorium, University Complex',
  contestantPrice: 10000,
  audiencePrice: 1500,
  registrationOpen: true,
  maxContestants: 50,
  maxAudienceTickets: 500,
  updatedBy: 'admin-1',
  updatedAt: new Date('2024-01-10'),
};

// ============================================
// MOCK ADMIN STATS
// ============================================

export const mockAdminStats: AdminStats = {
  totalTickets: mockContestantTickets.length + mockAudienceTickets.length,
  totalContestants: mockContestantTickets.length,
  totalAudience: mockAudienceTickets.length,
  totalRevenue: 450000,
  pendingApprovals: 5,
  verifiedTickets: 45,
  rejectedPayments: 3,
};

// ============================================
// MOCK ADMIN LOGS (50+)
// ============================================

export const mockAdminLogs: AdminLog[] = [];

for (let i = 1; i <= 60; i++) {
  const adminId = `admin-${(i % 3) + 1}`;
  const adminName = adminId === 'admin-1' ? 'Debrain (DOS)' : adminId === 'admin-2' ? 'Sarah Registrar' : 'John Finance';
  
  mockAdminLogs.push({
    id: `log-${i}`,
    adminId,
    adminName,
    action: i % 5 === 0 ? 'Updated Settings' : i % 3 === 0 ? 'Rejected Proof' : 'Approved Ticket',
    targetType: i % 5 === 0 ? 'settings' : i % 3 === 0 ? 'payment' : 'ticket',
    targetId: `target-${i}`,
    description: `Admin ${adminName} performed action ${i} on target ${i}`,
    timestamp: new Date(2024, 0, 10 + (i % 10), 10 + (i % 8), i % 60),
  });
}

// ============================================
// COMBINED TICKETS FOR COMPATIBILITY
// ============================================

export const mockTickets = [
  ...mockContestantTickets.map(t => ({
    ...t,
    name: t.fullName,
    code: t.uniqueCode,
    type: t.ticketType,
    date: t.createdAt.toLocaleDateString()
  })),
  ...mockAudienceTickets.map(t => ({
    ...t,
    name: t.fullName,
    code: t.uniqueCode,
    type: t.ticketType,
    date: t.createdAt.toLocaleDateString()
  }))
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const getMockTicketsByUserId = (userId: string): (ContestantTicket | AudienceTicket)[] => {
  const contestantTickets = mockContestantTickets.filter((t) => t.userId === userId);
  const audienceTickets = mockAudienceTickets.filter((t) => t.userId === userId);
  return [...contestantTickets, ...audienceTickets];
};

export const getMockTicketById = (id: string): ContestantTicket | AudienceTicket | undefined => {
  return [...mockContestantTickets, ...mockAudienceTickets].find((t) => t.id === id);
};

export const getMockPendingPayments = (): Payment[] => {
  return mockPayments.filter((p) => p.status === 'pending');
};

export const calculateTotalRevenue = (): number => {
  return mockPayments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);
};
