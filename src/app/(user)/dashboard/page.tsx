'use client';

import { motion } from 'framer-motion';
import { 
  Ticket, 
  CreditCard, 
  QrCode, 
  ExternalLink,
  Send,
  Calendar,
  MapPin,
  Clock,
  MoreVertical,
  Download
} from 'lucide-react';
import { useState } from 'react';
import { 
  mockContestantTickets, 
  mockAudienceTickets, 
  mockUsers 
} from '@/lib/mockData';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';

// Helper to simulate "User has tickets" scenario (Scenario B)
// We'll use the user from the first contestant ticket
const currentUser = mockUsers[0]; 
const userContestantTickets = mockContestantTickets.filter(t => t.userId === currentUser.id);
const userAudienceTickets = mockAudienceTickets.filter(t => t.userId === currentUser.id);
const allTickets = [...userContestantTickets, ...userAudienceTickets];

const totalSpent = allTickets.reduce((sum, ticket) => sum + ticket.totalAmount, 0);

// Colors matching the theme
const GREEN = '#2D5016';
const BG_CREAM = '#EAECE6';
const BG_WARM = '#EFF1EC';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'contestant' | 'audience'>('all');

  const filteredTickets = allTickets.filter(ticket => {
    if (activeTab === 'all') return true;
    return ticket.ticketType === activeTab;
  });

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      {/* Spacer for Navbar */}
      <div className="h-20" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-black text-gray-900">
            Welcome back, {currentUser.displayName}!
          </h1>
          <p className="text-gray-500 mt-2">
            Here's an overview of your tickets and event participation.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Tickets Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Tickets</p>
              <p className="text-2xl font-black text-gray-900">{allTickets.length}</p>
            </div>
          </motion.div>

          {/* Total Spent Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="p-3 rounded-xl text-green-700" style={{ backgroundColor: '#E8F5E9' }}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Spent</p>
              <p className="text-2xl font-black text-gray-900">₦{totalSpent.toLocaleString()}</p>
            </div>
          </motion.div>
        </div>

        {/* Tickets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
            
            {/* Filter Tabs */}
            <div className="flex p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
              {['all', 'contestant', 'audience'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                    activeTab === tab 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket, index) => (
              <TicketCard key={ticket.id} ticket={ticket} index={index} />
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function TicketCard({ ticket, index }: { ticket: any, index: number }) {
  const isContestant = ticket.ticketType === 'contestant';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200 hover:border-green-200 transition-all duration-300"
    >
      {/* Top Banner */}
      <div 
        className={`h-2 relative ${isContestant ? 'bg-orange-400' : 'bg-green-600'}`} 
      />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <Badge 
            variant={isContestant ? 'warning' : 'success'} 
            className="uppercase tracking-wider text-[10px] py-1"
          >
            {ticket.ticketType} TICKET
          </Badge>
          <Badge variant={ticket.status === 'verified' ? 'success' : 'default'} dot>
            {ticket.status}
          </Badge>
        </div>

        {/* Ticket Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 truncate">
            {isContestant ? ticket.stageName : ticket.fullName}
          </h3>
          <p className="text-sm text-gray-500">
            {isContestant ? ticket.fullName : 'Guest Admission'}
          </p>
          <div className="h-px w-full bg-gray-100 my-4" />
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>March 15, 2024</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>Main Auditorium</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center justify-between border border-dashed border-gray-200">
          <div>
            <p className="text-xs uppercase text-gray-400 font-bold mb-1">Ticket Code</p>
            <p className="font-mono font-bold text-gray-900 tracking-wider">
              {ticket.uniqueCode}
            </p>
          </div>
          <div className="bg-white p-2 rounded-lg shadow-sm">
             {/* Mock QR Placeholder */}
             <div className="w-10 h-10 bg-gray-900 rounded flex items-center justify-center text-white">
                <QrCode className="w-6 h-6" />
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-xs"
            onClick={() => console.log('View Full Ticket', ticket.id)}
            leftIcon={<ExternalLink className="w-3 h-3" />}
          >
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full text-xs bg-gray-50 hover:bg-gray-100 text-gray-600"
            onClick={() => console.log('Download Ticket', ticket.id)}
            leftIcon={<Download className="w-3 h-3" />}
          >
            Save
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
