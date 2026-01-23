'use client';

import { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { 
  mockContestantTickets, 
  mockAudienceTickets 
} from '@/lib/mockData';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Image from 'next/image';
import Link from 'next/link';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

export default function AdminTicketsPage() {
  const [filterType, setFilterType] = useState('all'); // all, contestant, audience
  const [filterStatus, setFilterStatus] = useState('all'); // all, verified, pending
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Combine Data
  const allTickets = [...mockContestantTickets, ...mockAudienceTickets];

  // Filter Data
  const filteredTickets = allTickets.filter(ticket => {
    const matchesType = filterType === 'all' || ticket.ticketType === filterType;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = 
       ticket.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       ticket.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (ticket as any).stageName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
       {/* Simple Header */}
       <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="font-bold text-gray-900 text-lg">Ticket Management</h1>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-gray-500">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
           
           {/* Search */}
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name, code..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-green-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>

           {/* Filters */}
           <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select 
                 className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none cursor-pointer hover:border-gray-300"
                 value={filterType}
                 onChange={(e) => setFilterType(e.target.value)}
              >
                 <option value="all">All Types</option>
                 <option value="contestant">Contestants</option>
                 <option value="audience">Audience</option>
              </select>

              <select 
                 className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none cursor-pointer hover:border-gray-300"
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
              >
                 <option value="all">All Status</option>
                 <option value="verified">Verified</option>
                 <option value="pending">Pending</option>
                 <option value="rejected">Rejected</option>
              </select>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => console.log('Export CSV')}
              >
                Export
              </Button>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
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
                       <th className="px-6 py-4 font-medium">User / Ticket</th>
                       <th className="px-6 py-4 font-medium">Type</th>
                       <th className="px-6 py-4 font-medium">Date</th>
                       <th className="px-6 py-4 font-medium">Status</th>
                       <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {paginatedTickets.length > 0 ? (
                       paginatedTickets.map((ticket: any) => (
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
                                <Link href={`/ticket/${ticket.id}`} className="flex items-center gap-3">
                                   {ticket.ticketType === 'contestant' ? (
                                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
                                         <Image 
                                           src={ticket.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.userId}`} 
                                           alt="" 
                                           fill 
                                           className="object-cover"
                                         />
                                      </div>
                                   ) : (
                                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold text-xs uppercase">
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
                                   </div>
                                </Link>
                             </td>
                             <td className="px-6 py-4">
                                <Badge variant={ticket.ticketType === 'contestant' ? 'warning' : 'default'}>
                                   {ticket.ticketType}
                                </Badge>
                             </td>
                             <td className="px-6 py-4 text-gray-500">
                                {new Date(ticket.createdAt).toLocaleDateString()}
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
                                   <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="View">
                                      <Eye className="w-4 h-4" />
                                   </button>
                                   <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Download">
                                      <Download className="w-4 h-4" />
                                   </button>
                                   <button className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Delete">
                                      <Trash2 className="w-4 h-4" />
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

           {/* Pagination */}
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
        </div>
      </main>
    </div>
  );
}
