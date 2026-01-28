'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Ticket, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Scan,
  MessageSquare,
  FileCheck,
  Search,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { queryDocuments } from '@/lib/firebase/firestore';
import { where } from 'firebase/firestore';
import { Ticket as TicketType, Payment, AdminLog } from '@/types';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    totalContestants: 0,
    totalAudience: 0,
    pendingApprovals: 0,
    verifiedTickets: 0,
  });
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [allTickets, allPayments, logs] = await Promise.all([
          queryDocuments<TicketType>('tickets', []),
          queryDocuments<Payment>('payments', []),
          queryDocuments<AdminLog>('adminLogs', []) // We'll assume logs are stored here
        ]);

        // Calculate Stats
        const calculatedStats = {
          totalRevenue: allPayments
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + p.amount, 0),
          totalTickets: allTickets.length,
          totalContestants: allTickets.filter(t => t.ticketType === 'contestant').length,
          totalAudience: allTickets.filter(t => t.ticketType === 'audience').length,
          pendingApprovals: allPayments.filter(p => p.status === 'pending').length,
          verifiedTickets: allTickets.filter(t => t.status === 'verified').length,
        };

        setStats(calculatedStats);

        // Sort and slice recent items (assuming client-side sort for now for flexibility)
        // In production with large data, this should be done via Firestore query constraints
        const recent = allTickets
          .sort((a, b) => {
             const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
             const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
             return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);
        
        setRecentTickets(recent);

        // Sort logs (mock logic or real timestamp)
        const sortedLogs = logs
           .sort((a, b) => {
              const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
              const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
              return dateB.getTime() - dateA.getTime();
           })
           .slice(0, 6);
        setAdminLogs(sortedLogs);

      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminGuard>
      <div className="min-h-screen" style={{ backgroundColor: BG_WARM }}>
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <h1 className="font-bold text-gray-900">Admin Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-500" />
                {stats.pendingApprovals > 0 && (
                   <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                <Image 
                  src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} 
                  alt="Admin" 
                  fill 
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Welcome & Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-500">Welcome back, {user?.displayName || 'Admin'}</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <select className="bg-transparent text-sm font-medium text-gray-600 outline-none px-2 py-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>All time</option>
              </select>
            </div>
          </div>

          {loading ? (
             <DashboardSkeleton />
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Total Revenue" 
                  value={`₦${stats.totalRevenue.toLocaleString()}`} 
                  // change="+12%" 
                  icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                  // trend="up"
                />
                <StatCard 
                  title="Total Tickets" 
                  value={stats.totalTickets} 
                  subtitle={`${stats.totalContestants} Contestants • ${stats.totalAudience} Audience`}
                  icon={<Ticket className="w-5 h-5 text-blue-600" />}
                />
                <StatCard 
                  title="Pending Approvals" 
                  value={stats.pendingApprovals} 
                  subtitle="Requires attention"
                  icon={<AlertCircle className="w-5 h-5 text-orange-600" />}
                  highlight={stats.pendingApprovals > 0}
                />
                <StatCard 
                  title="Verified Rate" 
                  value={`${stats.totalTickets > 0 ? Math.round((stats.verifiedTickets / stats.totalTickets) * 100) : 0}%`} 
                  subtitle={`${stats.verifiedTickets} tickets verified`}
                  icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />}
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <QuickAction 
                  title="Approve Transfers" 
                  desc={`${stats.pendingApprovals} items pending`} 
                  icon={<FileCheck className="w-5 h-5" />}
                  href="/admin/approvals" 
                  badge={stats.pendingApprovals > 0 ? stats.pendingApprovals : undefined}
                />
                <QuickAction 
                  title="Scan QR Codes" 
                  desc="Open scanner" 
                  icon={<Scan className="w-5 h-5" />}
                  href="/admin/scanner" 
                />
                <QuickAction 
                  title="Send Messages" 
                  desc="Bulk SMS/Email" 
                  icon={<MessageSquare className="w-5 h-5" />}
                  href="/admin/messaging" 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recent Registrations */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Recent Registrations</h3>
                    <Link href="/admin/tickets" className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1">
                      View All <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-6 py-3 font-medium">User</th>
                          <th className="px-6 py-3 font-medium">Type</th>
                          <th className="px-6 py-3 font-medium">Amount</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentTickets.map((ticket: any) => (
                          <tr key={ticket.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden relative">
                                  <Image 
                                    src={ticket.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.userId}`} 
                                    alt="" 
                                    fill 
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{ticket.fullName}</p>
                                  <p className="text-xs text-gray-400">{ticket.uniqueCode}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="capitalize text-xs">
                                {ticket.ticketType}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-600">
                              ₦{ticket.totalAmount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <Badge 
                                variant={ticket.status === 'verified' ? 'success' : ticket.status === 'pending' ? 'warning' : 'error'} 
                                dot
                                className="capitalize"
                              >
                                {ticket.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        {recentTickets.length === 0 && (
                           <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                 No recent registrations found.
                              </td>
                           </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Activity Log */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {adminLogs.length > 0 ? adminLogs.map((log, i) => (
                      <div key={log.id} className="flex gap-4 items-start relative">
                        {i !== adminLogs.length - 1 && <div className="absolute left-2.5 top-8 bottom-0 w-px bg-gray-100 -mb-6" />}
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 z-10 text-green-600 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-current" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{log.adminName}</span> {log.action.toLowerCase()}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                             {/* Basic time formatting */}
                             {new Date(log.timestamp as any).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    )) : (
                       <p className="text-sm text-gray-500 text-center">No activity logs found.</p>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100 text-center">
                    <Link href="/admin/logs">
                       <button className="text-sm text-gray-500 hover:text-gray-900 font-medium">View Full Log</button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}


function StatCard({ title, value, change, icon, subtitle, trend, highlight }: any) {
   return (
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className={`p-6 rounded-2xl shadow-sm border ${highlight ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-200'}`}
      >
         <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${highlight ? 'bg-white' : 'bg-gray-50'}`}>
               {icon}
            </div>
            {change && (
               <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {change}
               </span>
            )}
         </div>
         <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
         <h3 className="text-2xl font-black text-gray-900 mb-1">{value}</h3>
         {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </motion.div>
   );
}

function QuickAction({ title, desc, icon, href, badge }: any) {
   return (
      <Link href={href}>
         <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 group cursor-pointer hover:border-green-300 transition-colors"
         >
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
               {icon}
            </div>
            <div className="flex-grow">
               <h4 className="font-bold text-gray-900">{title}</h4>
               <p className="text-xs text-gray-500">{desc}</p>
            </div>
            {badge && (
               <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {badge}
               </div>
            )}
         </motion.div>
      </Link>
   );
}

function DashboardSkeleton() {
   return (
      <div className="animate-pulse space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="bg-white h-32 rounded-2xl border border-gray-200" />)}
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="bg-white h-20 rounded-xl border border-gray-200" />)}
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white h-96 rounded-2xl border border-gray-200" />
            <div className="bg-white h-96 rounded-2xl border border-gray-200" />
         </div>
      </div>
   );
}
