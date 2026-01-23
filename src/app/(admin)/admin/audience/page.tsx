'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Link2,
  Download,
  Ticket,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { mockTickets } from '@/lib/mockData';

const BG_WARM = '#EFF1EC';

export default function AdminAudiencePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter mock data for audience
  const audience = mockTickets.filter(t => t.type === 'audience');

  const filteredAudience = audience.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-none">Audience Management</h1>
            <p className="text-sm text-gray-500 mt-1">Total Spectators: {audience.length}</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl border-gray-200 h-10 hidden sm:flex"
            leftIcon={<Download size={16} />}
            onClick={() => console.log('Exporting audience...')}
          >
            Export CSV
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, phone or code..."
              className="w-full h-12 bg-gray-50 border-none rounded-2xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="h-12 bg-gray-50 border-none rounded-2xl px-6 outline-none font-bold text-gray-600 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table/Cards */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Audience Name</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone / Code</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Linked To</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {filteredAudience.map((a, i) => (
                    <motion.tr 
                      key={a.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700">
                              <UserCheck size={18} />
                           </div>
                           <p className="font-bold text-gray-900">{a.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-700">{a.phone || 'N/A'}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{a.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {i % 3 === 0 ? (
                          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                             <Link2 size={12} />
                             <span className="text-[10px] font-black uppercase tracking-widest">NGT-CONT-01</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Standalone</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={a.status === 'verified' ? 'success' : 'warning'} className="text-[10px] px-3">
                           {a.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 transition-colors">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
