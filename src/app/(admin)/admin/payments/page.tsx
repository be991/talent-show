'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  CreditCard, 
  Banknote,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { mockTickets } from '@/lib/mockData';
import { AdminGuard } from '@/components/guards/AdminGuard';

const BG_WARM = '#EFF1EC';
const GREEN = '#2D5016';

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');

  // Revenue Stats Calculation (Mock)
  const totalRevenue = 450000;
  const cardPayments = 320000;
  const transfers = 130000;

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-none">Financial Ledger</h1>
            <p className="text-sm text-gray-500 mt-1">Audit and track all system transactions</p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white border-none rounded-xl"
            leftIcon={<Download size={16} />}
          >
            Export Ledger
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <StatCard label="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={<DollarSign/>} color="bg-green-600" />
           <StatCard label="Card (Paystack)" value={`₦${cardPayments.toLocaleString()}`} icon={<CreditCard/>} color="bg-blue-600" />
           <StatCard label="Bank Transfers" value={`₦${transfers.toLocaleString()}`} icon={<Banknote/>} color="bg-amber-600" />
           <StatCard label="Success Rate" value="94.2%" icon={<TrendingUp/>} color="bg-purple-600" />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
           <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                 type="text" 
                 placeholder="Search by reference, name or user ID..."
                 className="w-full h-12 bg-gray-50 border-none rounded-2xl pl-12 font-medium outline-none focus:ring-2 focus:ring-green-500/20"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <select 
             className="h-12 bg-gray-50 border-none rounded-2xl px-6 font-bold text-gray-600 outline-none"
             value={methodFilter}
             onChange={(e) => setMethodFilter(e.target.value)}
           >
              <option value="All">All Methods</option>
              <option value="Card">Card</option>
              <option value="Transfer">Transfer</option>
           </select>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reference</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Method</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Date</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {mockTickets.slice(0, 10).map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50/80 transition-colors cursor-pointer group">
                       <td className="px-8 py-5">
                          <span className="font-mono font-bold text-xs text-gray-400 group-hover:text-green-700">#PAY-{p.code}</span>
                       </td>
                       <td className="px-6 py-5">
                          <p className="font-bold text-gray-900 leading-none mb-1">{p.name}</p>
                          <p className="text-[10px] font-black text-gray-300 uppercase">UID-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                       </td>
                       <td className="px-6 py-5 font-black text-gray-900">
                          ₦{p.type === 'contestant' ? '10,000' : '1,500'}
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                             {i % 3 === 0 ? <Banknote size={14} className="text-amber-500" /> : <CreditCard size={14} className="text-blue-500" />}
                             <span className="text-xs font-bold text-gray-600">{i % 3 === 0 ? 'Transfer' : 'Card'}</span>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'verified' ? 'bg-green-500' : 'bg-amber-500'}`} />
                             <span className={`text-[11px] font-black uppercase tracking-widest ${p.status === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>{p.status === 'verified' ? 'Success' : 'Pending'}</span>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-right font-medium text-gray-400 text-sm">{p.date}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </main>
      </div>
    </AdminGuard>
  );
}

function StatCard({ label, value, icon, color }: any) {
   return (
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-2xl font-black text-gray-900">{value}</h3>
         </div>
         <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg`}>
            {icon}
         </div>
      </div>
   );
}
