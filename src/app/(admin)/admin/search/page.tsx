'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search as SearchIcon, 
  Ticket, 
  User, 
  DollarSign, 
  ArrowRight,
  Zap,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';

const BG_WARM = '#EFF1EC';

type SearchFilter = 'all' | 'tickets' | 'users' | 'payments';

export default function AdminSearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        if (query.trim().length > 1 && user) {
            performSearch(query, activeFilter);
        } else if (query.trim().length === 0) {
            setResults([]);
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, activeFilter, user]);

  const performSearch = async (q: string, filter: string) => {
    try {
        setLoading(true);
        const idToken = await auth.currentUser?.getIdToken();
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}&type=${filter}`, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            setResults(data.results);
        } else {
            console.error('Search failed:', data.error);
        }
    } catch (err) {
        console.error('Search error:', err);
    } finally {
        setLoading(false);
    }
  };

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
          <Zap className={`text-amber-400 hidden sm:block ${loading ? 'animate-spin' : 'animate-pulse'}`} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {!query && results.length === 0 ? (
           <div className="text-center py-20 px-8">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border border-gray-100">
                 <SearchIcon className="text-gray-200" size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Global Command Search</h2>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">Instantly reach any ticket, transaction, or user account across the entire NGT10 ecosystem.</p>
              
              <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3">
                 {['Contestants', 'Pending', 'Admin', 'Ticket', 'NGT-', 'REF-'].map(tag => (
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

              <div className="flex items-center gap-3 px-2">
                 {loading && <Loader2 className="animate-spin text-green-600" size={16} />}
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Showing {results.length} results for "{query}"
                 </p>
              </div>

              <div className="space-y-3">
                 {results.map((res, i) => (
                    <motion.div 
                       key={res.id || i}
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
                             <h4 className="font-black text-gray-900">{res.name || res.reference || 'Unknown Item'}</h4>
                          </div>
                          <p className="text-xs text-gray-400 font-medium">
                             {res.code || res.email || res.status || res.reference}
                             {res.amount ? ` • ₦${res.amount.toLocaleString()}` : ''}
                          </p>
                       </div>

                       <ArrowRight className="text-gray-200 group-hover:text-green-600 transition-colors" />
                    </motion.div>
                 ))}
              </div>

              {!loading && results.length === 0 && (
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
