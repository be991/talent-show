'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  PieChart, 
  Calendar, 
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase/config';

const BG_WARM = '#EFF1EC';

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const idToken = await auth.currentUser?.getIdToken();
        const response = await fetch('/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const result = await response.json();
        if (result.success) setData(result.data);
      } catch (e) {
        console.error('Analytics fetch failed', e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  if (loading) {
     return (
        <AdminGuard>
           <div className="min-h-screen pb-20 flex items-center justify-center" style={{ backgroundColor: BG_WARM }}>
              <div className="flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"/>
                 <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Intelligence...</p>
              </div>
           </div>
        </AdminGuard>
     );
  }

  const { revenue, tickets, avgOrder, chart, categories } = data || {};

  // Find max value in chart for scaling
  const maxChartVal = chart ? Math.max(...chart.map((c: any) => c.value)) : 100;

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-none">Performance Intelligence</h1>
            <p className="text-sm text-gray-500 mt-1">Deep dive into revenue and growth metrics</p>
          </div>
          <div className="flex gap-4 items-center">
             <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
                {['24h', '7d', '30d', 'All'].map(t => (
                   <button key={t} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${t === '30d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{t}</button>
                ))}
             </div>
             <Button variant="outline" className="rounded-xl border-gray-200 h-10">
                Custom Range
             </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <KPICard label="Total Revenue" value={`₦${(revenue?.total || 0).toLocaleString()}`} trend={revenue?.trend} isUp={true} icon={<DollarSign/>} />
           <KPICard label="Tickets Sold" value={tickets?.total || 0} trend={tickets?.trend} isUp={true} icon={<Users/>} />
           <KPICard label="Admission Rate" value={`${tickets?.total ? Math.round((tickets.admitted / tickets.total) * 100) : 0}%`} trend="Live" isUp={true} icon={<Target/>} />
           <KPICard label="Avg. Order" value={`₦${Math.round(avgOrder?.value || 0).toLocaleString()}`} trend={avgOrder?.trend} isUp={true} icon={<TrendingUp/>} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
           {/* Main Revenue Chart */}
           <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-lg font-black text-gray-900">Revenue Trajectory</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Income over recent period</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600"/> <span className="text-[10px] font-black">GROSS</span></div>
                 </div>
              </div>
              <div className="flex-grow flex items-end justify-between gap-4 mt-12 bg-gray-50/50 rounded-[2rem] p-8 border border-dashed border-gray-200">
                 {chart?.map((point: any, i: number) => {
                    const heightPercent = maxChartVal > 0 ? (point.value / maxChartVal) * 100 : 0;
                    return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="w-full bg-gradient-to-t from-green-700 to-green-500 rounded-t-xl relative group min-h-[10px]"
                    >
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          ₦{point.value.toLocaleString()}
                          <br/>
                          <span className="text-[9px] font-normal text-gray-300">{point.date}</span>
                       </div>
                    </motion.div>
                 )})}
              </div>
           </div>

           {/* Distribution */}
           <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-col">
              <h3 className="text-lg font-black text-gray-900 mb-2">Participant Mix</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Tickets by category</p>

              <div className="flex-grow flex items-center justify-center relative">
                 <div className="w-48 h-48 rounded-full border-[20px] border-green-700 relative flex items-center justify-center">
                    <div className="text-center">
                       <p className="text-2xl font-black text-gray-900 leading-none">{tickets?.total || 0}</p>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total</p>
                    </div>
                 </div>
              </div>

              <div className="mt-8 space-y-4">
                 {categories?.slice(0, 3).map((cat: any, i: number) => (
                    <DistributionRow key={i} label={cat.label} val={`${Math.round((cat.count / (tickets?.total || 1)) * 100)}%`} color={i === 0 ? "bg-green-700" : "bg-amber-400"} />
                 ))}
                 {!categories?.length && <p className="text-sm text-gray-400 text-center">No categories data</p>}
              </div>
           </div>
        </div>

        {/* Categories Bar Chart */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200">
           <h3 className="text-lg font-black text-gray-900 mb-6">Contestant Categories</h3>
           <div className="space-y-6">
              {categories?.map((cat: any, i: number) => (
                 <CategoryBar
                    key={i}
                    label={cat.label}
                    count={cat.count}
                    total={tickets?.total || 1}
                    color={i % 2 === 0 ? "bg-blue-500" : "bg-pink-500"}
                 />
              ))}
              {!categories?.length && <p className="text-gray-400 text-center py-4">No category data available yet.</p>}
           </div>
        </section>
      </main>
    </div>
    </AdminGuard>
  );
}


function KPICard({ label, value, trend, isUp, icon }: any) {
   return (
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
         <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
               {icon}
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
               {isUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
               {trend}
            </div>
         </div>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
         <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      </div>
   );
}

function DistributionRow({ label, val, color }: any) {
   return (
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
         </div>
         <span className="text-xs font-black text-gray-900">{val}</span>
      </div>
   );
}

function CategoryBar({ label, count, total, color }: any) {
   const perc = (count / total) * 100;
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-end">
            <span className="text-xs font-black uppercase tracking-widest text-gray-900">{label}</span>
            <span className="text-xs font-black text-gray-500">{count} Performance{count !== 1 ? 's' : ''}</span>
         </div>
         <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${perc}%` }}
               transition={{ duration: 1.5, ease: 'easeOut' }}
               className={`h-full ${color}`}
            />
         </div>
      </div>
   );
}
