'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  Terminal, 
  Search, 
  User, 
  CheckCircle2, 
  XCircle, 
  History, 
  Clock, 
  Smartphone,
  Zap,
  Ticket,
  Users,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Image from 'next/image';
import Link from 'next/link';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { QrReader } from 'react-qr-reader';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Theme Colors
const GREEN = '#2D5016';
const GOLD = '#F5C542';
const BG_WARM = '#EFF1EC';

export default function AdminScannerPage() {
  const { user } = useAuth();
  const [manualCode, setManualCode] = useState('');
  const [scanState, setScanState] = useState<'idle' | 'success' | 'error' | 'verifying'>('idle');
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [admitCount, setAdmitCount] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  
  const lastScannedCode = useRef<string | null>(null);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScan = async (data: string | null) => {
    if (!data || scanState === 'verifying' || data === lastScannedCode.current) return;
    
    // Simple debouncing
    lastScannedCode.current = data;
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
    scanTimeout.current = setTimeout(() => { lastScannedCode.current = null; }, 3000);

    const actualCode = data.includes('TICKET_') ? data.split('_')[1] : data;
    await verifyCode(actualCode);
  };

  const handleManualVerify = () => {
    if (!manualCode) return;
    verifyCode(manualCode);
  };

  const verifyCode = async (code: string) => {
    setScanState('verifying');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/admin/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setActiveTicket(result.ticket);
        setScanState('success');
        setAdmitCount(result.ticket.numberOfTickets || 1);
        toast.success('Ticket Verified!');
      } else {
        setScanState('error');
        setErrorMessage(result.error || 'Invalid Ticket');
        setActiveTicket(result.ticket || null);
        toast.error(result.error || 'Invalid Ticket');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setScanState('error');
      setErrorMessage('Network error while verifying');
    }
  };

  const confirmAdmit = async () => {
    if (!activeTicket || !user) return;
    
    setScanState('verifying');
    try {
      const response = await fetch('/api/admin/tickets/admit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: activeTicket.id,
          admittedCount: admitCount,
          adminId: user.id,
          adminName: user.displayName,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const newLog = {
          id: Date.now(),
          name: activeTicket.fullName,
          type: activeTicket.ticketType,
          admitted: admitCount,
          time: new Date().toLocaleTimeString(),
          status: 'admitted'
        };
        setHistory(prev => [newLog, ...prev].slice(0, 10));
        toast.success('Admission Confirmed');
        resetScanner();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to confirm admission');
      setScanState('success');
    }
  };

  const resetScanner = () => {
    setScanState('idle');
    setActiveTicket(null);
    setManualCode('');
    setErrorMessage('');
  };

  return (
    <AdminGuard>
      <div className="min-h-screen text-gray-900 overflow-hidden relative transition-colors duration-500" style={{ backgroundColor: BG_WARM }}>
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-200 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-100 rounded-full blur-[120px]" />
      </div>

      {/* TOP STATS BAR */}
      <div className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Button>
              </Link>
              <div className="p-2 bg-green-600 rounded-lg">
                 <Scan className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter text-gray-900">NGT10 Entry Port</h1>
           </div>

           <div className="hidden md:flex items-center gap-8">
              <StatItem label="Live Admitted" value="56 / 450" icon={<Users className="w-4 h-4" />} />
              <StatItem label="Verified Today" value="24" icon={<Ticket className="w-4 h-4" />} />
              <div className="text-right border-l border-gray-200 pl-8">
                 <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">System Time</p>
                 <p className="font-mono text-lg text-gray-900">
                    {isMounted ? currentTime.toLocaleTimeString() : '--:--:--'}
                 </p>
              </div>
           </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* LEFT: SCANNER INTERFACE */}
         <div className="lg:col-span-8 space-y-8 h-full flex flex-col">
            
            {/* REAL QR READER */}
            <div className="relative flex-grow min-h-[400px] rounded-[3rem] border-8 border-white bg-black overflow-hidden group shadow-xl">
                {isMounted && scanState === 'idle' && (
                  <QrReader
                    onResult={(result, error) => {
                      if (result) handleScan(result.getText());
                    }}
                    constraints={{ facingMode: 'environment' }}
                    className="w-full h-full object-cover"
                    containerStyle={{ width: '100%', height: '100%' }}
                    videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}

                {scanState === 'verifying' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 animate-spin text-green-500" />
                      <p className="text-white font-bold tracking-widest uppercase text-sm">Validating...</p>
                    </div>
                  </div>
                )}

                {/* Scanner Viewfinder Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-72 h-72 border-2 border-white/30 rounded-[2.5rem] relative">
                       {/* Corner Markings */}
                       <div className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 border-green-500 rounded-tl-2xl" />
                       <div className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 border-green-500 rounded-tr-2xl" />
                       <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 border-green-500 rounded-bl-2xl" />
                       <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 border-green-500 rounded-br-2xl" />
                       
                       {/* Laser Line */}
                       {scanState === 'idle' && (
                         <motion.div 
                           animate={{ top: ['10%', '90%', '10%'] }}
                           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                           className="absolute left-4 right-4 h-0.5 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)] z-10"
                         />
                       )}
                   </div>
                </div>

                {/* Overlay Text */}
                <div className="absolute bottom-10 left-0 right-0 text-center px-10">
                   <p className="text-white/60 text-xs font-bold tracking-widest uppercase">
                     {scanState === 'idle' ? 'Align QR code to scan' : 'Processing Ticket...'}
                   </p>
                </div>

                {/* Torch Toggle Placeholder */}
                <button 
                  className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                   <Zap className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* MANUAL ENTRY */}
            <div className="bg-white border border-gray-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-6 items-center shadow-lg">
               <div className="flex-grow w-full">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Or Enter Unique Code</p>
                  <div className="relative">
                     <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                     <input 
                       type="text" 
                       placeholder="NGT-XXXX-XXXX"
                       value={manualCode}
                       onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                       onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
                       className="w-full bg-gray-50 border border-gray-200 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-mono text-lg tracking-widest text-gray-900"
                     />
                  </div>
               </div>
               <div className="flex gap-3 w-full md:w-auto h-[60px]">
                  <Button 
                    variant="primary" 
                    className="h-full px-10 rounded-2xl border-none shadow-lg shadow-green-900/20"
                    style={{ backgroundColor: GREEN }}
                    onClick={handleManualVerify}
                    loading={scanState === 'verifying'}
                  >
                    Verify
                  </Button>
               </div>
            </div>
         </div>

         {/* RIGHT: HISTORY */}
         <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white border border-gray-200 rounded-[2.5rem] flex-grow flex flex-col shadow-sm">
               <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                     <History className="w-5 h-5 text-green-600" />
                     Session Scans
                  </h3>
               </div>
               
               <div className="flex-grow p-4 overflow-y-auto max-h-[500px] space-y-3 custom-scrollbar">
                  {history.length > 0 ? (
                    history.map(item => (
                       <motion.div 
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         key={item.id} 
                         className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all"
                       >
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                {item.admitted}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{item.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{item.time}</p>
                             </div>
                          </div>
                          <Badge variant="success" className="text-[10px] h-5">Admitted</Badge>
                       </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-24 opacity-60">
                       <Smartphone className="w-12 h-12 mb-4" />
                       <p className="text-sm font-medium text-center">No active scans in this session.<br/>Ready to verify tickets.</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-gradient-to-br from-green-900 to-[#1a3a0f] p-8 rounded-[2.5rem] text-white shadow-xl shadow-green-900/10 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4 relative z-10">
                   <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shadow-lg backdrop-blur">
                      <Zap className="w-5 h-5" />
                   </div>
                   <h4 className="font-bold text-lg">Entry Protocol</h4>
                </div>
                <ul className="space-y-3 text-sm text-green-100/80 relative z-10">
                   <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      Tickets must be 'Verified' to grant entry.
                   </li>
                   <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      Check IDs for all Contestant passes.
                   </li>
                </ul>
            </div>
         </div>
      </main>

      {/* RESULT MODALS */}
      <AnimatePresence>
         {(scanState === 'success' || scanState === 'error') && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-green-900/40">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white text-gray-900 rounded-[3rem] p-8 max-w-lg w-full shadow-2xl relative border border-white/50"
               >
                  <div className={`absolute top-0 left-0 w-full h-3 ${scanState === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                  
                  <div className="text-center mb-8 pt-4">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${scanState === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                         {scanState === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 mb-2 leading-none uppercase tracking-tighter">
                        {scanState === 'success' ? 'Access Granted' : 'Access Denied'}
                      </h2>
                      <p className="text-gray-500 font-medium">
                        {scanState === 'success' ? 'Verified Official Ticket' : errorMessage}
                      </p>
                  </div>

                  {activeTicket && (
                     <div className={`rounded-[2rem] p-6 border mb-8 ${scanState === 'success' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-16 h-16 rounded-2xl bg-white p-1 overflow-hidden relative shadow-sm border border-gray-100">
                              <Image 
                                src={activeTicket.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeTicket.userId}`} 
                                alt="" 
                                fill 
                                className="object-cover rounded-xl" 
                              />
                           </div>
                           <div className="text-left">
                              <h3 className="font-black text-xl leading-tight text-gray-900">{activeTicket.fullName}</h3>
                              <p className="text-xs text-green-700 font-bold uppercase tracking-widest">{activeTicket.uniqueCode}</p>
                           </div>
                           <div className="ml-auto">
                              <Badge variant={activeTicket.ticketType === 'contestant' ? 'warning' : 'success'} className="uppercase px-4 py-1.5">
                                {activeTicket.ticketType}
                              </Badge>
                           </div>
                        </div>

                        {scanState === 'success' && (
                           <div className="space-y-4 pt-4 border-t border-green-100">
                              <div className="flex justify-between items-center text-sm">
                                 <span className="text-gray-400 font-black uppercase tracking-widest">Entry Limit</span>
                                 <span className="font-black text-gray-900">{activeTicket.numberOfTickets || 1} PEOPLE</span>
                              </div>
                              
                              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-green-200">
                                 <span className="text-xs font-black text-gray-400 uppercase tracking-wide">Admit Count</span>
                                 <input 
                                   type="number" 
                                   min="1" 
                                   max={activeTicket.numberOfTickets || 1}
                                   value={admitCount}
                                   onChange={(e) => setAdmitCount(Math.min(Number(e.target.value), activeTicket.numberOfTickets || 1))}
                                   className="text-right flex-grow outline-none font-black text-3xl text-green-700 bg-transparent"
                                 />
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                     <Button 
                        variant="ghost" 
                        fullWidth 
                        size="lg" 
                        className="rounded-2xl bg-gray-100 hover:bg-gray-200 h-14" 
                        onClick={resetScanner}
                     >
                        Cancel
                     </Button>
                     {scanState === 'success' ? (
                        <Button 
                           variant="primary" 
                           fullWidth 
                           size="lg" 
                           className="bg-green-600 hover:bg-green-700 border-none rounded-2xl shadow-xl shadow-green-900/20 h-14"
                           style={{ backgroundColor: GREEN }}
                           onClick={confirmAdmit}
                        >
                           Admit Now
                        </Button>
                     ) : (
                        <Button 
                           variant="outline" 
                           fullWidth 
                           size="lg" 
                           className="text-gray-500 border-gray-200 rounded-2xl h-14"
                           onClick={resetScanner}
                        >
                           Dismiss
                        </Button>
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 197, 94, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.5); }
      `}</style>

    </div>
    </AdminGuard>
  );
}

function StatItem({ label, value, icon }: any) {
   return (
      <div className="text-center group cursor-default">
         <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1 group-hover:text-green-600 transition-colors">
            {label}
         </p>
         <div className="flex items-center justify-center gap-2">
            <div className="text-green-600">{icon}</div>
            <p className="font-black text-xl tracking-tight text-gray-900">{value}</p>
         </div>
      </div>
   );
}
