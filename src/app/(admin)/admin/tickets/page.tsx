'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  User,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Ticket as TicketIcon
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Image from 'next/image';
import Link from 'next/link';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { queryDocuments } from '@/lib/firebase/firestore';
import { Ticket } from '@/types';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

export default function AdminTicketsPage() {
  // State
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, contestant, audience
  const [filterStatus, setFilterStatus] = useState('all'); // all, verified, pending
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  const [sortField, setSortField] = useState<'createdAt' | 'fullName' | 'ticketType' | 'totalAmount' | 'status'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch Data
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const tickets = await queryDocuments<Ticket>('tickets', []);
        setAllTickets(tickets);
        setFilteredTickets(tickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);

  // Filter & Search Effect
  useEffect(() => {
    let result = [...allTickets];
    
    // Type Filter
    if (filterType !== 'all') {
      result = result.filter(t => t.ticketType === filterType);
    }
    
    // Status Filter
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }
    
    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.fullName?.toLowerCase().includes(query) || 
        t.uniqueCode?.toLowerCase().includes(query) ||
        (t.ticketType === 'contestant' && (t as any).stageName?.toLowerCase().includes(query)) ||
        t.phoneNumber?.includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Handle specific fields
      if (sortField === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredTickets(result);
    setPage(1); // Reset to first page on filter change
  }, [allTickets, filterType, filterStatus, searchQuery, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
       setSelectedTickets(paginatedTickets.map(t => t.id));
    } else {
       setSelectedTickets([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedTickets(prev => 
      prev.includes(id) ? prev.filter(ticketId => ticketId !== id) : [...prev, id]
    );
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>

       {/* Header - Mobile Responsive */}
       <header className="bg-white border-b border-gray-200 static lg:sticky lg:top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-0 lg:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-green-100 p-2 rounded-lg text-green-700 shrink-0">
                <TicketIcon className="w-5 h-5" />
             </div>
             <div>
                <h1 className="font-bold text-gray-900 text-lg leading-tight break-words">Ticket Management</h1>
                <p className="text-xs text-gray-500">{allTickets.length} total records</p>
             </div>
          </div>
          <Link href="/admin" className="w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="text-gray-500 w-full sm:w-auto justify-start sm:justify-center">
               <ChevronLeft className="w-4 h-4 mr-1" />
               <span className="inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Bar - Mobile First Stack */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col gap-4 w-full max-w-full">
           
           <div className="flex flex-col lg:flex-row gap-4 justify-between">
             {/* Search */}
             <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search name, code, phone..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-green-500 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>

             {/* Mobile Filters Stack */}
             <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <select 
                   className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none cursor-pointer hover:border-gray-300"
                   value={filterType}
                   onChange={(e) => setFilterType(e.target.value)}
                >
                   <option value="all">All Types</option>
                   <option value="contestant">Contestants</option>
                   <option value="audience">Audience</option>
                </select>

                <select 
                   className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none cursor-pointer hover:border-gray-300"
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value)}
                >
                   <option value="all">All Status</option>
                   <option value="verified">Verified</option>
                   <option value="pending">Pending</option>
                   <option value="rejected">Rejected</option>
                </select>

                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto justify-center"
                >
                  Refresh
                </Button>
             </div>
           </div>
        </div>

        {/* Selected Banner */}
        {selectedTickets.length > 0 && (
           <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-green-600 text-white p-3 rounded-lg flex items-center justify-between mb-4 shadow-md"
           >
              <span className="font-medium text-sm px-2">{selectedTickets.length} tickets selected</span>
              <div className="flex items-center gap-2">
                 <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors">
                    Approve Selected
                 </button>
                 <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors">
                    Delete Selected
                 </button>
              </div>
           </motion.div>
        )}

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-full">
           {loading ? (
              <div className="p-12 text-center">
                 <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
                 <p className="text-gray-500">Loading tickets...</p>
              </div>
           ) : (
             <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm min-w-[800px]">
                   <thead className="bg-gray-50 text-gray-500">
                      <tr>
                         <th className="px-6 py-4 w-10">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              onChange={handleSelectAll}
                              checked={selectedTickets.length === paginatedTickets.length && paginatedTickets.length > 0}
                            />
                         </th>
                         <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('fullName')}>
                            User / Ticket {sortField === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}
                         </th>
                         <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('ticketType')}>
                            Type {sortField === 'ticketType' && (sortDirection === 'asc' ? '↑' : '↓')}
                         </th>
                         <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('createdAt')}>
                            Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                         </th>
                         <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('status')}>
                            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                         </th>
                         <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {paginatedTickets.length > 0 ? (
                         paginatedTickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                               <td className="px-6 py-4">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    checked={selectedTickets.includes(ticket.id)}
                                    onChange={() => handleSelectRow(ticket.id)}
                                  />
                               </td>
                               <td className="px-6 py-4">
                                  <Link href={`/admin/tickets/${ticket.id}`} className="flex items-center gap-3">
                                     {ticket.ticketType === 'contestant' ? (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200 flex-shrink-0">
                                           <Image 
                                             src={(ticket as any).photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.userId}`} 
                                             alt="" 
                                             fill 
                                             className="object-cover"
                                           />
                                        </div>
                                     ) : (
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold text-xs uppercase flex-shrink-0">
                                           AUD
                                        </div>
                                     )}
                                     <div>
                                        <p className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                                           {ticket.fullName}
                                        </p>
                                        <p className="text-xs text-gray-400 font-mono tracking-wide">
                                           {ticket.uniqueCode}
                                        </p>
                                        {ticket.ticketType === 'contestant' && (
                                           <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                              {(ticket as any).stageName}
                                           </p>
                                        )}
                                     </div>
                                  </Link>
                               </td>
                               <td className="px-6 py-4">
                                  <Badge variant={ticket.ticketType === 'contestant' ? 'warning' : 'default'}>
                                     {ticket.ticketType}
                                  </Badge>
                               </td>
                               <td className="px-6 py-4 text-gray-500 text-xs">
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                  <br/>
                                  {new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </td>
                               <td className="px-6 py-4">
                                  <Badge 
                                    variant={ticket.status === 'verified' ? 'success' : ticket.status === 'pending' ? 'warning' : 'error'} 
                                    dot
                                  >
                                     {ticket.status}
                                  </Badge>
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Link href={`/admin/tickets/${ticket.id}`}>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="View Details">
                                           <Eye className="w-4 h-4" />
                                        </button>
                                     </Link>
                                     <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Download Ticket">
                                        <Download className="w-4 h-4" />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))
                      ) : (
                         <tr>
                            <td colSpan={6} className="text-center py-12 text-gray-500">
                               No tickets found matching your filters.
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
           )}

           {/* Pagination */}
           {!loading && totalPages > 1 && (
             <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                   Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setPage(p => Math.max(1, p - 1))}
                     disabled={page === 1}
                     className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <ChevronLeft className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                     disabled={page === totalPages}
                     className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
    </AdminGuard>
  );
}
