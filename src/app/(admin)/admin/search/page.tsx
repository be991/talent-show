'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search as SearchIcon, 
  Ticket, 
  User, 
  DollarSign, 
  Clock, 
  ArrowRight,
  Filter,
  Layers,
  Zap
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { mockTickets } from '@/lib/mockData';
import { AdminGuard } from '@/components/guards/AdminGuard';

const BG_WARM = '#EFF1EC';

type SearchFilter = 'all' | 'tickets' | 'users' | 'payments';

export default function AdminSearchPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');

  const results = useMemo(() => {
    if (!query) return [];
    
    const items = [
      ...mockTickets.map(t => ({ ...t, typeId: 'ticket' })),
      { id: 'u1', name: 'Debrain Admin', email: 'admin@ngt.com', typeId: 'user', role: 'admin' },
      { id: 'p1', reference: 'REF-8392-XX', amount: 10000, typeId: 'payment', status: 'success' }
    ];

    return items.filter(item => {
      const q = query.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(q);
      const emailMatch = (item as any).email?.toLowerCase().includes(q);
      const codeMatch = (item as any).code?.toLowerCase().includes(q);
      const refMatch = (item as any).reference?.toLowerCase().includes(q);
      
      const filterMatch = activeFilter === 'all' || 
                         (activeFilter === 'tickets' && item.typeId === 'ticket') ||
                         (activeFilter === 'users' && item.typeId === 'user') ||
                         (activeFilter === 'payments' && item.typeId === 'payment');

      return (nameMatch || emailMatch || codeMatch || refMatch) && filterMatch;
    });
  }, [query, activeFilter]);

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-8">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-green-600" size={24} />
            <input 
              type="text" 
              autoFocus
              placeholder="Deep search tickets, users, references..."
              className="w-full h-14 bg-gray-50 border-none rounded-[1.5rem] pl-16 pr-8 text-lg font-black outline-none focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-300 transition-all font-sans"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Zap className="text-amber-400 hidden sm:block animate-pulse" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {!query ? (
           <div className="text-center py-20 px-8">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border border-gray-100">
                 <SearchIcon className="text-gray-200" size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Global Command Search</h2>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">Instantly reach any ticket, transaction, or user account across the entire NGT10 ecosystem.</p>
              
              <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3">
                 {['Contestants', 'Pending Proofs', 'Recent Sales', 'Admins', 'Family Linked', 'Singing'].map(tag => (
                    <button key={tag} onClick={() => setQuery(tag)} className="bg-white px-6 py-4 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-700 hover:border-green-200 hover:shadow-md transition-all">
                       {tag}
                    </button>
                 ))}
              </div>
           </div>
        ) : (
           <div className="space-y-8">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                 {['all', 'tickets', 'users', 'payments'].map(f => (
                    <button 
                       key={f}
                       onClick={() => setActiveFilter(f as any)}
                       className={`px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          activeFilter === f 
                          ? 'bg-green-600 text-white shadow-lg' 
                          : 'bg-white text-gray-400 hover:bg-gray-50'
                       }`}
                    >
                       {f}
                    </button>
                 ))}
              </div>

              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                 Showing {results.length} results for "{query}"
              </p>

              <div className="space-y-3">
                 {results.map((res, i) => (
                    <motion.div 
                       key={i}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all cursor-pointer flex items-center gap-6 group"
                    >
                       <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                          {res.typeId === 'ticket' && <Ticket className="text-green-600" />}
                          {res.typeId === 'user' && <User className="text-blue-600" />}
                          {res.typeId === 'payment' && <DollarSign className="text-amber-600" />}
                       </div>
                       
                       <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                             <Badge className="text-[9px] uppercase font-black border-none bg-gray-50">{res.typeId}</Badge>
                             <h4 className="font-black text-gray-900">{res.name || (res as any).reference}</h4>
                          </div>
                          <p className="text-xs text-gray-400 font-medium">
                             {(res as any).code || (res as any).email || (res as any).status} • Result {i+1}
                          </p>
                       </div>

                       <ArrowRight className="text-gray-200 group-hover:text-green-600 transition-colors" />
                    </motion.div>
                 ))}
              </div>

              {results.length === 0 && (
                 <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                    <p className="text-gray-400 font-bold">No results matching your query.</p>
                 </div>
              )}
           </div>
        )}
      </main>
      </div>
    </AdminGuard>
  );
}
