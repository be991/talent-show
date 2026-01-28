'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Shield, 
  Settings,
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const BG_WARM = '#EFF1EC';

export default function AdminLogsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const idToken = await auth.currentUser?.getIdToken();
        const response = await fetch('/api/admin/logs', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setLogs(result.logs);
        } else {
          toast.error(result.error || 'Failed to fetch logs');
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        toast.error('Network error while fetching logs');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchLogs();
  }, [user]);

  const filteredLogs = logs.filter(log => {
    const searchLower = search.toLowerCase();
    return (
      log.adminName?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.targetId?.toLowerCase().includes(searchLower)
    );
  });

  const getLogType = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('delete') || a.includes('remove') || a.includes('reject')) return 'delete';
    if (a.includes('update') || a.includes('change') || a.includes('settings')) return 'settings';
    if (a.includes('verify') || a.includes('login') || a.includes('admit')) return 'security';
    return 'auth';
  };

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-none">Activity Registry</h1>
            <p className="text-sm text-gray-500 mt-1">Audit trail of all administrative operations</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl border-gray-200 h-10"
            leftIcon={<Download size={16} />}
            onClick={() => console.log('Exporting security logs...')}
          >
            Export Logs
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 mb-8 flex gap-4">
           <div className="relative flex-grow">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                 type="text" 
                 placeholder="Search registry by admin, action or target..."
                 className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-16 pr-8 font-medium outline-none focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-300 transition-all"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Timeline List */}
        <div className="space-y-4">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Accessing Database Registry...</p>
             </div>
           ) : filteredLogs.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No matches found in history</p>
             </div>
           ) : (
             filteredLogs.map((log, i) => {
               const type = getLogType(log.action);
               return (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-xl hover:border-green-200 transition-all group"
                >
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      type === 'security' ? 'bg-green-50 text-green-700' :
                      type === 'settings' ? 'bg-amber-50 text-amber-700' :
                      type === 'delete' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                   }`}>
                      {type === 'security' && <Shield size={24} />}
                      {type === 'settings' && <Settings size={24} />}
                      {type === 'delete' && <AlertCircle size={24} />}
                      {type === 'auth' && <Clock size={24} />}
                   </div>

                   <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase text-gray-300 tracking-[0.2em]">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                            <Badge className="bg-gray-100 text-gray-600 border-none px-3 font-black text-[10px]">
                               {log.adminName}
                            </Badge>
                         </div>
                         <Badge variant="outline" className="border-gray-200 text-gray-400 font-bold text-[9px] uppercase tracking-tighter">
                            ID: #{log.id.slice(-8)}
                         </Badge>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                         <h4 className="font-black text-gray-900 leading-tight">
                            {log.action} <span className="text-green-600">→</span> {log.targetId || log.targetType}
                         </h4>
                      </div>
                      
                      {log.desc && (
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                           {log.desc}
                        </p>
                      )}
                   </div>

                   <button className="p-3 rounded-xl bg-gray-50 text-gray-300 group-hover:bg-green-600 group-hover:text-white transition-all self-center shadow-inner">
                      <FileText size={18} />
                   </button>
                </motion.div>
             )})
           )}
        </div>
      </main>
      </div>
    </AdminGuard>
  );
}
