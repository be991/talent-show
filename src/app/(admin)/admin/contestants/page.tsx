'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Music,
  User,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { mockTickets } from '@/lib/mockData';
import Image from 'next/image';
import { AdminGuard } from '@/components/guards/AdminGuard';

const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

export default function AdminContestantsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter mock data for contestants
  const contestants = mockTickets.filter(t => t.type === 'contestant');

  const filteredContestants = contestants.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          (c.stageName?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-none">Contestants</h1>
            <p className="text-sm text-gray-500 mt-1">Manage talent registration and performers</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl border-gray-200 h-10 hidden sm:flex"
            leftIcon={<Download size={16} />}
            onClick={() => console.log('Exporting contestants...')}
          >
            Export List
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
              placeholder="Search by name or stage name..."
              className="w-full h-12 bg-gray-50 border-none rounded-2xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="h-12 bg-gray-50 border-none rounded-2xl px-4 outline-none font-bold text-gray-600 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Singing">Singing</option>
              <option value="Dance">Dance</option>
              <option value="Comedy">Comedy</option>
            </select>
            <select 
              className="h-12 bg-gray-50 border-none rounded-2xl px-4 outline-none font-bold text-gray-600 text-sm"
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
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contestant</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stage Identity</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {filteredContestants.map((c, i) => (
                    <motion.tr 
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm relative shrink-0">
                            <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} alt={c.name} fill />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-none mb-1">{c.name}</p>
                            <p className="text-xs text-gray-400 font-medium">Joined {c.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-green-700 uppercase tracking-tight">{c.stageName || 'No Stage Name'}</span>
                          <span className="text-[10px] font-bold text-gray-400 italic">#{c.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-amber-50 text-amber-700 border-none font-black text-[10px]">
                           {c.category?.toUpperCase() || 'GENERAL'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           {c.status === 'verified' ? (
                             <div className="w-2 h-2 rounded-full bg-green-500" />
                           ) : (
                             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                           )}
                           <span className={`text-[11px] font-black uppercase tracking-widest ${c.status === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>
                              {c.status}
                           </span>
                        </div>
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
          
          {filteredContestants.length === 0 && (
            <div className="p-20 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="text-gray-300" size={32} />
               </div>
               <h3 className="text-xl font-black text-gray-900 mb-2">No Contestants Found</h3>
               <p className="text-gray-500 text-sm">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </main>
      </div>
    </AdminGuard>
  );
}
