'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Mail, 
  Layout, 
  Clock, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  X,
  Plus,
  ArrowRight,
  Database,
  History,
  Search,
  Check
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Textarea } from '@/components/atoms/Textarea';
import Image from 'next/image';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';

// Theme Colors
const GREEN = '#2D5016';
const GOLD = '#F5C542';
const BG_WARM = '#EFF1EC';

const TEMPLATES = [
  { id: 'reminder', name: 'Event Reminder', subject: 'Get Ready for NGT1.0!', body: 'Hello {name}, this is a reminder that the Talent Stardom event is happening on {event_date} at {event_venue}. See you there!' },
  { id: 'payment', name: 'Payment Confirmation', subject: 'Payment Received', body: 'Hello {name}, your payment for ticket {ticket_code} has been confirmed. You can download your ticket from your dashboard.' },
  { id: 'delivery', name: 'Ticket Delivery', subject: 'Your Ticket is Ready', body: 'Hello {name}, your digital ticket for NGT1.0 is now available. Unique Code: {ticket_code}. Prepare for stardom!' },
];

const RECIPIENT_FILTER_DEFAULTS = [
  { id: 'all', label: 'All Ticket Holders', count: 0 },
  { id: 'contestant', label: 'Contestants Only', count: 0 },
  { id: 'audience', label: 'Audience Only', count: 0 },
  { id: 'verified', label: 'Verified Tickets', count: 0 },
  { id: 'pending', label: 'Pending Transfers', count: 0 },
];

export default function AdminMessagingPage() {
  const [filters, setFilters] = useState(RECIPIENT_FILTER_DEFAULTS);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'both'>('whatsapp');
  const [template, setTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [whatsappQueue, setWhatsappQueue] = useState<any[]>([]);
  const [currentWhatsappIndex, setCurrentWhatsappIndex] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingHistory(true);
      if (!auth) return;
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;

      const headers = { 'Authorization': `Bearer ${idToken}` };

      // Fetch History
      const histRes = await fetch('/api/admin/messaging/history', { headers });
      const histData = await histRes.json();
      if (histData.success) {
        setHistory(histData.history);
      }

      // Fetch Stats
      const statsRes = await fetch('/api/admin/messaging/stats', { headers });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setFilters(prev => prev.map(f => ({
            ...f,
            count: statsData.stats[f.id] || 0
        })));
      }

    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoadingHistory(false);
    }
  };
  // ... (keep handleTemplateChange, insertVariable, handleSend, handleNextWhatsapp, skipWhatsapp, sendWhatsapp) ...

  const totalSelected = useMemo(() => {
     let total = 0;
     // Simple logic: if 'all' selected, return 'all' count. Else sum others (but arguably they overlap).
     // For now, if 'all', use 'all' count. If specific, sum specific unique if possible, but simpler to just show 'all' count if 'all' is selected.
     if (selectedFilters.includes('all')) {
        return filters.find(f => f.id === 'all')?.count || 0;
     }
     
     // Be careful of overlapping if we just sum. But for simple UI estimates:
     // If user selects 'contestant' and 'audience', that matches 'all' (usually).
     // Since we don't do complex server-side pre-calculation of overlap here yet:
     return selectedFilters.reduce((acc, fid) => acc + (filters.find(f => f.id === fid)?.count || 0), 0);
  }, [selectedFilters, filters]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const t = TEMPLATES.find(temp => temp.id === e.target.value);
    if (t) {
      setTemplate(t.id);
      setSubject(t.subject);
      setMessage(t.body);
    } else {
      setTemplate('');
      setSubject('');
      setMessage('');
    }
  };

  const insertVariable = (variable: string) => {
    setMessage(prev => prev + `{${variable}}`);
  };

  const handleSend = async () => {
    if (!subject && (channel === 'email' || channel === 'both')) {
      toast.error('Please enter a subject line for email');
      return;
    }
    if (!message) {
      toast.error('Please enter a message body');
      return;
    }

    setIsSending(true);
    setSendProgress(0);
    
    try {
      if (!auth) throw new Error('Auth not initialized');
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/messaging/blast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          filters: selectedFilters,
          channel,
          subject,
          messageBody: message
        })
      });

      const result = await response.json();

      if (!result.success) {
        // Handle Resend onboarding limitation specifically
        if (result.error?.includes('testing email address') || result.error?.includes('onboarding')) {
          throw new Error('Resend Restriction: Since you are using a trial account, you can only send emails to yourself. Please verify your domain in Resend to send to others.');
        }
        throw new Error(result.error || 'Failed to send broadcast');
      }

      setSendProgress(100);
      setRecipients(result.recipients || []);
      
      if (channel === 'whatsapp' || channel === 'both') {
        setWhatsappQueue(result.recipients || []);
        setCurrentWhatsappIndex(0);
      }

      setTimeout(() => {
        setIsSending(false);
        setIsSuccess(true);
        fetchData();
        setTimeout(() => setIsSuccess(false), 3000);
      }, 500);

      toast.success(`Successfully processed ${result.sentCount} recipients`);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong while sending');
      setIsSending(false);
    }
  };

  const handleNextWhatsapp = () => {
    if (currentWhatsappIndex < whatsappQueue.length - 1) {
      setCurrentWhatsappIndex(prev => prev + 1);
    } else {
      setWhatsappQueue([]);
    }
  };

  const skipWhatsapp = () => {
    handleNextWhatsapp();
  };

  const sendWhatsapp = (recipient: any) => {
    const text = message
      .replace(/{name}/g, recipient.name || '')
      .replace(/{ticket_code}/g, recipient.ticket_code || '')
      .replace(/{event_date}/g, recipient.event_date || '')
      .replace(/{event_venue}/g, recipient.event_venue || '');
    
    const url = `https://wa.me/${recipient.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    handleNextWhatsapp();
  };


  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">Bulk Messaging</h1>
            <p className="text-sm text-gray-500 mt-1">Send WhatsApp messages or Emails to ticket holders</p>
          </div>
          <div className="flex items-center gap-3">
             <Badge className="bg-green-100 text-green-700 border-none px-4 py-1.5 h-10 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {totalSelected} Recipients
             </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* LEFT: COMPOSE */}
           <div className="lg:col-span-8 space-y-8">
              
              {/* Recipient Selection */}
              <section className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8">
                 <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-green-600" />
                    1. Select Recipients
                 </h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filters.map(filter => (
                       <button 
                         key={filter.id}
                         onClick={() => setSelectedFilters(prev => 
                           prev.includes(filter.id) ? prev.filter(f => f !== filter.id) : [...prev, filter.id]
                         )}
                         className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-24 ${
                           selectedFilters.includes(filter.id) 
                           ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                           : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-green-200'
                         }`}
                       >
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80">{filter.label}</span>
                          <span className="text-2xl font-black">{filter.count}</span>
                       </button>
                    ))}
                    <button className="p-4 rounded-2xl border border-dashed border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-600 transition-all flex items-center justify-center gap-2 font-bold h-24">
                       <Plus size={20} />
                       Custom
                    </button>
                 </div>
              </section>

              {/* Message Composer */}
              <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 p-8">
                 <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    2. Compose Message
                 </h3>

                 <div className="space-y-6">
                    {/* Channel Toggle */}
                    <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
                       {['whatsapp', 'email', 'both'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setChannel(type as any)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                               channel === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                             {type}
                          </button>
                       ))}
                    </div>

                    {/* Template Selector */}
                    <div>
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Choose Template</label>
                       <select 
                         value={template} 
                         onChange={handleTemplateChange}
                         className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-4 outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-700"
                       >
                          <option value="">Custom Message (No Template)</option>
                          {TEMPLATES.map(t => (
                             <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                       </select>
                    </div>

                    {/* Subject line (Email only) */}
                    {(channel === 'email' || channel === 'both') && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                       >
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Subject</label>
                          <input 
                            type="text" 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-4 outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-700"
                            placeholder="Enter subject line..."
                          />
                       </motion.div>
                    )}

                    {/* TextArea */}
                    <div>
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Message Body</label>
                       <div className="relative">
                          <Textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            className="rounded-3xl bg-gray-50 border-gray-100 pt-4"
                            placeholder="Type your message here..."
                          />
                          <div className="mt-4 flex flex-wrap gap-2">
                             {['name', 'ticket_code', 'event_date', 'event_venue'].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => insertVariable(v)}
                                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black uppercase hover:bg-green-50 hover:text-green-700 transition-colors"
                                >
                                   +{v}
                                </button>
                             ))}
                          </div>
                          <span className="absolute right-4 bottom-[72px] text-[10px] font-bold text-gray-400">
                             {message.length} characters
                          </span>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Review & Send */}
              <section className="bg-white rounded-[2.5rem] shadow-lg border border-gray-200 p-8 overflow-hidden relative">
                 {isSending && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-12 text-center transition-opacity">
                       <div className="w-20 h-20 relative mb-6">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle cx="40" cy="40" r="36" fill="transparent" stroke="#E5E7EB" strokeWidth="8" />
                             <circle 
                               cx="40" cy="40" r="36" fill="transparent" stroke={GREEN} strokeWidth="8" 
                               strokeDasharray={226}
                               strokeDashoffset={226 - (226 * sendProgress) / 100}
                               strokeLinecap="round"
                               className="transition-all duration-300"
                             />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-black text-lg">
                             {Math.round(sendProgress)}%
                          </div>
                       </div>
                       <h4 className="text-xl font-black text-gray-900 mb-2">Sending Broadcast...</h4>
                       <p className="text-gray-500">Processing message to {totalSelected} recipients via {channel}.</p>
                    </div>
                 )}

                 <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-700">
                          <Send size={24} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-gray-900 leading-tight">Ready to Broadcast</p>
                          <p className="text-xs text-gray-500">Verified for {totalSelected} people</p>
                       </div>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto h-14">
                       <Button 
                         variant="outline" 
                         className="rounded-2xl px-8 h-full border-gray-200"
                         onClick={() => setIsPreviewOpen(true)}
                       >
                          Preview
                       </Button>
                       <Button 
                         className="rounded-2xl px-12 h-full border-none shadow-xl shadow-green-900/10"
                         style={{ backgroundColor: GREEN }}
                         onClick={handleSend}
                       >
                          Blast Now
                       </Button>
                    </div>
                 </div>
              </section>
           </div>

           {/* RIGHT: HISTORY */}
           <div className="lg:col-span-4 space-y-8">
              <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-col min-h-[600px]">
                  <div className="p-8 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                       <History className="w-5 h-5 text-gray-400" />
                       Recent Broadcasts
                    </h3>
                 </div>
                 
                 <div className="flex-grow p-4 space-y-3">
                    {loadingHistory ? (
                      <div className="flex items-center justify-center p-12">
                         <div className="animate-spin w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full" />
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center p-12 text-gray-400">
                         <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                         <p className="text-sm">No recent broadcasts</p>
                      </div>
                    ) : (
                      history.map((log: any) => (
                        <div 
                          key={log.id} 
                          className="p-5 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer group"
                        >
                           <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                 {log.channel === 'whatsapp' ? <MessageSquare size={14} className="text-green-600" /> : <Mail size={14} className="text-blue-600" />}
                                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{log.channel}</span>
                              </div>
                              <Badge variant={log.status === 'Sent' ? 'success' : 'error'} className="text-[10px]">
                                 {log.status}
                              </Badge>
                           </div>
                           <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-1 truncate">{log.type}</h4>
                           <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white overflow-hidden relative">
                                    <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.sentBy}`} alt="" fill unoptimized />
                                 </div>
                                 <span className="text-xs text-gray-500 font-medium truncate max-w-[80px]">{log.sentBy?.split('@')[0]}</span>
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">{log.recipients} Recipients</span>
                           </div>
                        </div>
                      ))
                    )}
                 </div>

                 <div className="p-8 border-t border-gray-100 text-center">
                    <button className="text-sm font-black text-gray-400 hover:text-green-600 transition-colors uppercase tracking-widest">
                       View Complete History
                    </button>
                 </div>
              </section>
           </div>
        </div>
      </main>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
         {isPreviewOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white rounded-[3rem] p-4 max-w-2xl w-full shadow-2xl relative"
               >
                  <button onClick={() => setIsPreviewOpen(false)} className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors z-20">
                     <X size={20} />
                  </button>

                  <div className="p-6">
                     <h3 className="text-xl font-black text-gray-900 mb-8">Message Preview</h3>
                     
                     <div className="space-y-8">
                        {/* WhatsApp Format */}
                        {(channel === 'whatsapp' || channel === 'both') && (
                           <div className="space-y-3">
                              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-4">WhatsApp Preview</span>
                              <div className="bg-[#E5DDD5] p-6 rounded-[2rem] relative shadow-inner overflow-hidden">
                                 {/* Background pattern */}
                                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2ad4.png")' }} />
                                 <div className="max-w-[85%] bg-white p-4 rounded-xl rounded-tl-none shadow-sm relative z-10">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                       {message.replace(/{name}/g, 'John Doe').replace(/{ticket_code}/g, 'NGT-1234-ABCD').replace(/{event_date}/g, 'March 15th').replace(/{event_venue}/g, 'Main Hall')}
                                    </p>
                                    <span className="text-[9px] text-gray-400 text-right block mt-2">12:45 PM</span>
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* Email Format */}
                        {(channel === 'email' || channel === 'both') && (
                           <div className="space-y-3">
                              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-4">Email Preview</span>
                              <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 shadow-inner">
                                 <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-green-700 p-6 text-center">
                                       <h2 className="text-white font-black uppercase tracking-tighter text-lg">NGT1.0 STARDOM</h2>
                                    </div>
                                    <div className="p-8">
                                       <p className="text-lg font-black text-gray-900 mb-4">{subject}</p>
                                       <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                          {message.replace(/{name}/g, 'John Doe').replace(/{ticket_code}/g, 'NGT-1234-ABCD').replace(/{event_date}/g, 'March 15th').replace(/{event_venue}/g, 'Main Hall')}
                                       </p>
                                    </div>
                                    <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                                       <button className="px-6 py-2 bg-green-600 text-white font-bold text-xs rounded-full uppercase">View Your Ticket</button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="flex gap-4 mt-8">
                        <Button variant="ghost" fullWidth onClick={() => setIsPreviewOpen(false)} className="rounded-2xl bg-gray-50">Back to Edit</Button>
                        <Button fullWidth onClick={() => { setIsPreviewOpen(false); handleSend(); }} className="bg-green-600 border-none rounded-2xl shadow-lg h-14" style={{ backgroundColor: GREEN }}>
                           Looks Good, Blast It
                        </Button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* WhatsApp Queue Modal */}
      <AnimatePresence>
         {whatsappQueue.length > 0 && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-green-900/20">
               <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-green-100"
               >
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-black text-xl text-gray-900">WhatsApp Dispatch</h3>
                     <Badge className="bg-green-100 text-green-700 border-none">{currentWhatsappIndex + 1} of {whatsappQueue.length}</Badge>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                     <p className="text-xs font-black text-gray-400 uppercase mb-2">Recipient</p>
                     <p className="font-bold text-lg text-gray-900">{whatsappQueue[currentWhatsappIndex].name}</p>
                     <p className="text-sm text-gray-500">{whatsappQueue[currentWhatsappIndex].phone}</p>
                  </div>

                  <div className="space-y-3">
                     <Button 
                       fullWidth 
                       onClick={() => sendWhatsapp(whatsappQueue[currentWhatsappIndex])}
                       className="h-16 rounded-2xl bg-green-600 text-lg shadow-lg shadow-green-200 border-none"
                       style={{ backgroundColor: GREEN }}
                     >
                        <MessageSquare className="mr-2" />
                        Send Message
                     </Button>
                     <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          fullWidth 
                          onClick={skipWhatsapp}
                          className="rounded-xl h-12 text-gray-400 border-gray-100"
                        >
                           Skip
                        </Button>
                        <Button 
                          variant="outline" 
                          fullWidth 
                          onClick={() => setWhatsappQueue([])}
                          className="rounded-xl h-12 text-red-400 border-gray-100"
                        >
                           Cancel Queue
                        </Button>
                     </div>
                  </div>
                  
                  <p className="mt-6 text-[10px] text-gray-400 text-center leading-relaxed">
                     Clicking "Send Message" will open WhatsApp in a new tab.<br/>
                     Come back here to trigger the next message.
                  </p>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
         {isSuccess && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
            >
               <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={18} />
               </div>
               <div>
                  <p className="font-black text-sm">Campaign Launched!</p>
                  <p className="text-[10px] text-gray-400">Message processed successfully.</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      </div>
    </AdminGuard>
  );
}

function CheckItem({ label, checked, onChange }: any) {
   return (
      <label className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer group hover:bg-white hover:border-green-200 transition-all">
         <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200 bg-white'}`}>
            {checked && <Check size={14} />}
         </div>
         <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
         <span className={`text-sm font-bold transition-colors ${checked ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
            {label}
         </span>
      </label>
   );
}
