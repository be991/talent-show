'use client';

import { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';

const BG_WARM = '#EFF1EC';

const MOCK_LOGS = [
  { id: 1, admin: 'Debrain', action: 'Verify Ticket', target: 'NGT-1234-ABCD', desc: 'Approved bank transfer proof for John Doe', time: '2 mins ago', type: 'security' },
  { id: 2, admin: 'Sarah', action: 'Update Price', target: 'Audience Ticket', desc: 'Changed price from 1500 to 2000', time: '1 hour ago', type: 'settings' },
  { id: 3, admin: 'John', action: 'Delete Draft', target: 'Email Template', desc: 'Removed "Old Reminder" draft message', time: '3 hours ago', type: 'delete' },
  { id: 4, admin: 'Debrain', action: 'Login Success', target: 'Admin Portal', desc: 'New login session from Lagos, Nigeria', time: '5 hours ago', type: 'auth' },
  { id: 5, admin: 'SuperAdmin', action: 'Ban User', target: 'UID-8392-XX', desc: 'Banned user for fraudulent payment activity', time: '1 day ago', type: 'security' },
];

export default function AdminLogsPage() {
  const [search, setSearch] = useState('');

  return (
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
                 placeholder="Search registry by admin, action or description..."
                 className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-16 pr-8 font-medium outline-none focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-300 transition-all"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Timeline List */}
        <div className="space-y-4">
           {MOCK_LOGS.map((log, i) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-xl hover:border-green-200 transition-all group"
              >
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    log.type === 'security' ? 'bg-green-50 text-green-700' :
                    log.type === 'settings' ? 'bg-amber-50 text-amber-700' :
                    log.type === 'delete' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                 }`}>
                    {log.type === 'security' && <Shield size={24} />}
                    {log.type === 'settings' && <Settings size={24} />}
                    {log.type === 'delete' && <AlertCircle size={24} />}
                    {log.type === 'auth' && <Clock size={24} />}
                 </div>

                 <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-black uppercase text-gray-300 tracking-[0.2em]">{log.time}</span>
                          <Badge className="bg-gray-100 text-gray-600 border-none px-3 font-black text-[10px]">
                             {log.admin}
                          </Badge>
                       </div>
                       <Badge variant="outline" className="border-gray-200 text-gray-400 font-bold text-[9px] uppercase tracking-tighter">
                          ID: #{log.id}0392
                       </Badge>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                       <h4 className="font-black text-gray-900 leading-tight">
                          {log.action} <span className="text-green-600">→</span> {log.target}
                       </h4>
                    </div>
                    
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                       {log.desc}
                    </p>
                 </div>

                 <button className="p-3 rounded-xl bg-gray-50 text-gray-300 group-hover:bg-green-600 group-hover:text-white transition-all self-center shadow-inner">
                    <FileText size={18} />
                 </button>
              </motion.div>
           ))}
        </div>
        
        <div className="mt-12 text-center">
           <button className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-green-600 transition-colors">
              Load Archival Registry (Phase 1-3)
           </button>
        </div>
      </main>
    </div>
  );
}
