'use client';

import { motion } from 'framer-motion';
import { 
  Ticket as TicketIcon, 
  CreditCard, 
  QrCode, 
  ExternalLink,
  Calendar,
  MapPin,
  Download,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { queryDocuments } from '@/lib/firebase/firestore';
import { where } from 'firebase/firestore';
import { Ticket } from '@/types';
import Link from 'next/link';

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'contestant' | 'audience'>('all');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      if (!user) return;
      
      try {
        const userTickets = await queryDocuments<Ticket>('tickets', [
          where('userId', '==', user.id)
        ]);
        setTickets(userTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [user]);

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'all') return true;
    return ticket.ticketType === activeTab;
  });

  const totalSpent = tickets.reduce((sum, ticket) => sum + ticket.totalAmount, 0);

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 bg-[#EFF1EC]">
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
              Welcome back, {user?.displayName ? user.displayName.split(' ')[0] : 'User'}!
            </h1>
            <p className="text-gray-500 mt-2">
              Here's an overview of your tickets and event participation.
            </p>
          </motion.div>

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
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
                    <TicketIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">Total Tickets</p>
                    <p className="text-2xl font-black text-gray-900">{tickets.length}</p>
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

              {/* Content Area */}
              {tickets.length === 0 ? (
                /* Empty State / Registration Options */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-sm"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TicketIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tickets Yet</h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    You haven't purchased any tickets for NGT10 yet. Select an option below to get started.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <Link href="/register/contestant" className="block">
                      <div className="p-6 rounded-2xl border-2 border-orange-100 bg-orange-50/50 hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer h-full flex flex-col items-center">
                        <h3 className="font-bold text-orange-900 mb-2">Register as Contestant</h3>
                        <p className="text-sm text-orange-800/70 mb-4">Compete for the stardom title</p>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 border-none text-white">
                          Register (₦10,000)
                        </Button>
                      </div>
                    </Link>
                    
                    <Link href="/register/audience" className="block">
                      <div className="p-6 rounded-2xl border-2 border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-200 transition-all cursor-pointer h-full flex flex-col items-center">
                        <h3 className="font-bold text-green-900 mb-2">Buy Audience Ticket</h3>
                        <p className="text-sm text-green-800/70 mb-4">Watch the live performances</p>
                        <Button className="w-full bg-green-600 hover:bg-green-700 border-none text-white">
                          Buy Ticket (₦1,500)
                        </Button>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* Tickets List */
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
                  
                  {filteredTickets.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      No {activeTab} tickets found.
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

function TicketCard({ ticket, index }: { ticket: any, index: number }) {
  const isContestant = ticket.ticketType === 'contestant';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200 hover:border-green-200 transition-all duration-300 flex flex-col h-full"
    >
      {/* Top Banner */}
      <div 
        className={`h-2 relative ${isContestant ? 'bg-orange-400' : 'bg-green-600'}`} 
      />
      
      <div className="p-6 flex flex-col flex-grow">
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
        <div className="mb-6 flex-grow">
          <h3 className="text-xl font-bold text-gray-900 truncate" title={isContestant ? ticket.stageName : ticket.fullName}>
            {isContestant ? ticket.stageName || ticket.fullName : ticket.fullName}
          </h3>
          <p className="text-sm text-gray-500">
            {isContestant ? ticket.fullName : (ticket.purchasedBy ? 'Linked Ticket' : 'Standard Admission')}
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
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center justify-between border border-dashed border-gray-200 mt-auto">
          <div>
            <p className="text-xs uppercase text-gray-400 font-bold mb-1">Ticket Code</p>
            <p className="font-mono font-bold text-gray-900 tracking-wider">
              {ticket.uniqueCode}
            </p>
          </div>
          <div className="bg-white p-2 rounded-lg shadow-sm">
             <div className="w-10 h-10 bg-gray-900 rounded flex items-center justify-center text-white">
                <QrCode className="w-6 h-6" />
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/ticket/${ticket.id}`} className="w-full">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full text-xs"
              leftIcon={<ExternalLink className="w-3 h-3" />}
            >
              View
            </Button>
          </Link>
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

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-24" />
        ))}
      </div>
      <div>
        <div className="h-8 w-40 bg-gray-200 rounded-lg mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl h-96 border border-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
