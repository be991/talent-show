'use client';

import { useState, useEffect } from 'react';
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

// Theme Colors
const GREEN = '#2D5016';
const GOLD = '#F5C542';
const BG_WARM = '#EFF1EC';

const TEMPLATES = [
  { id: 'reminder', name: 'Event Reminder', subject: 'Get Ready for NGT10!', body: 'Hello {name}, this is a reminder that the Talent Stardom event is happening on {event_date} at {event_venue}. See you there!' },
  { id: 'payment', name: 'Payment Confirmation', subject: 'Payment Received', body: 'Hello {name}, your payment for ticket {ticket_code} has been confirmed. You can download your ticket from your dashboard.' },
  { id: 'delivery', name: 'Ticket Delivery', subject: 'Your Ticket is Ready', body: 'Hello {name}, your digital ticket for NGT10 is now available. Unique Code: {ticket_code}. Prepare for stardom!' },
];

const RECIPIENT_FILTERS = [
  { id: 'all', label: 'All Ticket Holders', count: 35 },
  { id: 'contestant', label: 'Contestants Only', count: 15 },
  { id: 'audience', label: 'Audience Only', count: 20 },
  { id: 'verified', label: 'Verified Tickets', count: 30 },
  { id: 'pending', label: 'Pending Transfers', count: 5 },
];

const MOCK_HISTORY = [
  { id: 1, type: 'Event Reminder', recipients: 35, channel: 'Both', sentBy: 'Debrain', date: '2024-01-20 10:30', status: 'Sent', rate: '35/35' },
  { id: 2, type: 'Ticket Delivery', recipients: 15, channel: 'WhatsApp', sentBy: 'Sarah', date: '2024-01-18 14:15', status: 'Sent', rate: '14/15' },
  { id: 3, type: 'Payment Follow-up', recipients: 5, channel: 'Email', sentBy: 'John', date: '2024-01-15 09:00', status: 'Failed', rate: '2/5' },
];

export default function AdminMessagingPage() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'both'>('whatsapp');
  const [template, setTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSend = () => {
    setIsSending(true);
    setSendProgress(0);
    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSending(false);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const totalSelected = selectedFilters.includes('all') ? 35 : 15; // Rough mock logic

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
                    {RECIPIENT_FILTERS.map(filter => (
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
                    {MOCK_HISTORY.map(log => (
                       <div 
                         key={log.id} 
                         className="p-5 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer group"
                       >
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-2">
                                {log.channel === 'WhatsApp' ? <MessageSquare size={14} className="text-green-600" /> : <Mail size={14} className="text-blue-600" />}
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{log.channel}</span>
                             </div>
                             <Badge variant={log.status === 'Sent' ? 'success' : 'error'} className="text-[10px]">
                                {log.status}
                             </Badge>
                          </div>
                          <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-1">{log.type}</h4>
                          <div className="flex items-center justify-between mt-4">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white overflow-hidden relative">
                                   <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.sentBy}`} alt="" fill />
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{log.sentBy}</span>
                             </div>
                             <span className="text-[10px] font-bold text-gray-400">{log.rate} Sent</span>
                          </div>
                       </div>
                    ))}
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
                                       <h2 className="text-white font-black uppercase tracking-tighter text-lg">NGT10 STARDOM</h2>
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
                  <p className="text-[10px] text-gray-400">Message sent successfully to recipients.</p>
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
