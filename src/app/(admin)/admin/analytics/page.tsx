'use client';

import { useState } from 'react';
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

const BG_WARM = '#EFF1EC';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

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
           <KPICard label="Total Revenue" value="₦1.2M" trend="+12.5%" isUp={true} icon={<DollarSign/>} />
           <KPICard label="Tickets Sold" value="156" trend="+8.2%" isUp={true} icon={<Users/>} />
           <KPICard label="Conv. Rate" value="4.8%" trend="-1.2%" isUp={false} icon={<Target/>} />
           <KPICard label="Avg. Order" value="₦7,692" trend="+5.0%" isUp={true} icon={<TrendingUp/>} />
        </div>

        {/* Charts Section (Placeholders) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
           {/* Main Revenue Chart Placeholder */}
           <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-lg font-black text-gray-900">Revenue Trajectory</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Income over the past 30 days</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600"/> <span className="text-[10px] font-black">GROSS</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"/> <span className="text-[10px] font-black">NET</span></div>
                 </div>
              </div>
              <div className="flex-grow flex items-end justify-between gap-4 mt-12 bg-gray-50/50 rounded-[2rem] p-8 border border-dashed border-gray-200">
                 {[40, 70, 45, 90, 65, 80, 55, 95, 85, 60, 75, 100].map((h, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }} 
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="w-full bg-gradient-to-t from-green-700 to-green-500 rounded-t-xl relative group"
                    >
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          ₦{(h*1000).toLocaleString()}
                       </div>
                    </motion.div>
                 ))}
              </div>
              <div className="flex justify-between mt-6 px-4">
                 {['Jan 01', 'Jan 10', 'Jan 20', 'Jan 30'].map(d => (
                    <span key={d} className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</span>
                 ))}
              </div>
           </div>

           {/* Distribution Placeholder */}
           <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-col">
              <h3 className="text-lg font-black text-gray-900 mb-2">Participant Mix</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Tickets by category</p>
              
              <div className="flex-grow flex items-center justify-center relative">
                 <div className="w-48 h-48 rounded-full border-[20px] border-green-700 relative flex items-center justify-center">
                    <div className="absolute inset-0 border-[20px] border-amber-400 rounded-full clip-path-half rotate-45" />
                    <div className="text-center">
                       <p className="text-2xl font-black text-gray-900 leading-none">156</p>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total</p>
                    </div>
                 </div>
              </div>

              <div className="mt-8 space-y-4">
                 <DistributionRow label="Audience Tickets" val="64%" color="bg-green-700" />
                 <DistributionRow label="Contestant Entry" val="36%" color="bg-amber-400" />
                 <DistributionRow label="VIP Access" val="0%" color="bg-purple-500" />
              </div>
           </div>
        </div>

        {/* Categories Bar Chart */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200">
           <h3 className="text-lg font-black text-gray-900 mb-6">Contestant Categories</h3>
           <div className="space-y-6">
              <CategoryBar label="Music & Singing" count={45} total={156} color="bg-blue-500" />
              <CategoryBar label="Dance & Choreography" count={32} total={156} color="bg-pink-500" />
              <CategoryBar label="Comedy / Spoken Word" count={18} total={156} color="bg-amber-500" />
              <CategoryBar label="Drama & Performance" count={12} total={156} color="bg-green-500" />
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
