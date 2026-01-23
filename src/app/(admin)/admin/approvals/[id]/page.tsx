'use client';

import { useState, use, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Search, 
  Clock, 
  User, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle,
  ExternalLink,
  ZoomIn,
  History,
  CheckSquare
} from 'lucide-react';
import { mockPayments, mockContestantTickets, mockAudienceTickets } from '@/lib/mockData';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Theme Colors
const GREEN = '#2D5016';
const GOLD = '#F5C542';
const BG_WARM = '#EFF1EC';

export default function ApprovalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [payment, setPayment] = useState<any>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [checklist, setChecklist] = useState({
    amount: false,
    account: false,
    date: false,
    clear: false,
  });

  useEffect(() => {
    const found = mockPayments.find(p => p.id === id);
    if (found) setPayment(found);
  }, [id]);

  if (!payment && id !== 'payment-2') { // Mocking payment-2 if not found in filtered list
    // In real app, we fetch from DB. For mock, we'll try to find or show notFound
    if (!payment) return <div className="p-20 text-center">Loading or Payment Not Found...</div>;
  }

  // Fallback for mock if specific ID missing
  const data = payment || mockPayments.find(p => p.paymentMethod === 'bank_transfer') || mockPayments[0];

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      {/* Breadcrumb & Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/approvals">
               <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
               </Button>
            </Link>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin / Approvals</span>
                  <Badge variant={data.status === 'verified' || data.status === 'success' ? 'success' : data.status === 'pending' ? 'warning' : 'error'}>
                    {data.status}
                  </Badge>
               </div>
               <h1 className="text-xl font-black text-gray-900 leading-none">
                 {data.paystackReference || 'TRF-PAYMENT-REF'}
               </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
             <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase">Amount to Verify</p>
                <p className="text-2xl font-black text-green-700">₦{data.amount.toLocaleString()}</p>
             </div>
             <div className="h-10 w-px bg-gray-200" />
             <div className="flex gap-2">
                {data.status === 'pending' && (
                  <>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" leftIcon={<XCircle className="w-4 h-4" />}>
                       Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white border-none" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                       Approve
                    </Button>
                  </>
                )}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: PROOF DISPLAY */}
          <div className="lg:col-span-4 space-y-6">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-4 sticky top-28"
             >
                <div className="relative group rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4]">
                   {data.transferProofURL ? (
                      <Image 
                        src={data.transferProofURL} 
                        alt="Proof" 
                        fill 
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                   ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                         <Image src="/placeholder-proof.png" alt="" width={100} height={100} className="opacity-20 mb-4" />
                         <p>No proof image found</p>
                      </div>
                   )}
                   
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                   
                   <button 
                     onClick={() => setIsZoomed(true)}
                     className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                      <ZoomIn className="w-5 h-5 text-gray-700" />
                   </button>
                </div>

                <div className="mt-4 flex gap-3">
                   <Button variant="outline" fullWidth size="sm" leftIcon={<Download className="w-4 h-4" />}>
                      Download
                   </Button>
                   <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 px-2">
                      <AlertTriangle className="w-4 h-4" />
                   </Button>
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mt-4 text-center">
                  Verify image carefully for digital manipulation
                </p>
             </motion.div>
          </div>

          {/* MIDDLE: DETAILS */}
          <div className="lg:col-span-5 space-y-8">
             {/* Payment Details */}
             <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <CreditCard className="w-5 h-5 text-green-700" />
                   Payment Details
                </h3>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <DetailItem label="Payment Method" value="Bank Transfer" />
                      <DetailItem label="Amount Expected" value={`₦${data.amount.toLocaleString()}`} bold />
                      <DetailItem label="Reference" value={data.paystackReference || 'N/A'} isMono />
                      <DetailItem label="Time Since Upload" value="2 hours ago" />
                   </div>

                   <div className="pt-6 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-4">Transfer Information</p>
                      <div className="grid grid-cols-1 gap-4">
                         <div className="flex justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                               <p className="text-[10px] text-gray-400 uppercase font-black">Recipient Bank</p>
                               <p className="font-bold text-gray-900">Wema Bank</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] text-gray-400 uppercase font-black">Target Account</p>
                               <p className="font-mono font-bold text-gray-900">0123456789</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* User Details */}
             <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <User className="w-5 h-5 text-green-700" />
                   User Information
                </h3>
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-16 h-16 rounded-full bg-gray-100 relative overflow-hidden ring-4 ring-green-50">
                      <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.userId}`} alt="" fill />
                   </div>
                   <div>
                      <p className="text-xl font-black text-gray-900">User ID: {data.userId}</p>
                      <p className="text-sm text-gray-500">Registered on Jan 15, 2024</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                   <Button variant="outline" size="sm" className="w-full">View User Profile</Button>
                   <Button variant="outline" size="sm" className="w-full">Messaging</Button>
                </div>
             </div>

             {/* Recent Activity Mini-List */}
             <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <History className="w-5 h-5 text-green-700" />
                   Other Transactions
                </h3>
                <div className="space-y-4">
                   <p className="text-sm text-gray-400 italic">No other pending transactions for this user.</p>
                </div>
             </div>
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-200 p-8 sticky top-28 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-green-600" />
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <CheckSquare className="w-5 h-5 text-green-700" />
                   Verification Checklist
                </h3>

                <div className="space-y-4 mb-8">
                   <CheckItem 
                     label="Amount Matches Exactly" 
                     checked={checklist.amount} 
                     onChange={() => toggleCheck('amount')} 
                   />
                   <CheckItem 
                     label="Account Details Verified" 
                     checked={checklist.account} 
                     onChange={() => toggleCheck('account')} 
                   />
                   <CheckItem 
                     label="Date is Recent & Valid" 
                     checked={checklist.date} 
                     onChange={() => toggleCheck('date')} 
                   />
                   <CheckItem 
                     label="Proof Image is Clear" 
                     checked={checklist.clear} 
                     onChange={() => toggleCheck('clear')} 
                   />
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-100">
                   <Button 
                     fullWidth 
                     className="bg-green-600 hover:bg-green-700 text-white border-none shadow-lg h-14 rounded-2xl"
                     disabled={Object.values(checklist).some(v => v === false)}
                   >
                      Confirm Approval
                   </Button>
                   <Button variant="ghost" fullWidth className="text-red-500 hover:bg-red-50 rounded-2xl h-14">
                      Reject Payment
                   </Button>
                </div>

                <p className="text-[10px] text-gray-400 mt-6 text-center italic">
                  Approval will generate and send the ticket instantly via email and WhatsApp.
                </p>
             </div>

             <div className="bg-orange-50 rounded-[2rem] border border-orange-100 p-6">
                <h4 className="flex items-center gap-2 font-bold text-orange-900 text-sm mb-3">
                   <AlertTriangle className="w-4 h-4" />
                   Fraud Prevention
                </h4>
                <p className="text-xs text-orange-800 leading-relaxed">
                   Check for signs of overlaying text, mismatched fonts, or blurred bank logos. If unsure, request a clearer proof or reject.
                </p>
             </div>
          </div>

        </div>
      </main>

      {/* ZOOM MODAL */}
      <AnimatePresence>
         {isZoomed && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsZoomed(false)}
               className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-8 cursor-zoom-out"
            >
               <motion.div 
                 initial={{ scale: 0.9 }}
                 animate={{ scale: 1 }}
                 exit={{ scale: 0.9 }}
                 className="relative w-full max-w-4xl h-full flex items-center justify-center"
               >
                  <img src={data.transferProofURL} alt="Proof Full size" className="max-w-full max-h-full rounded-lg shadow-2xl" />
               </motion.div>
               <div className="absolute top-8 right-8 text-white flex flex-col items-end">
                  <p className="font-bold text-lg mb-1">{data.paystackReference}</p>
                  <p className="text-sm opacity-60">Click anywhere to close</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, isMono, bold }: any) {
   return (
      <div>
         <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">{label}</p>
         <p className={`${bold ? 'font-black text-lg text-gray-900' : 'font-bold text-gray-700'} ${isMono ? 'font-mono' : ''}`}>
            {value}
         </p>
      </div>
   );
}

function CheckItem({ label, checked, onChange }: any) {
   return (
      <label className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer group hover:bg-white hover:border-green-200 transition-all">
         <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200 bg-white'}`}>
            {checked && <ShieldCheck className="w-4 h-4" />}
         </div>
         <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
         <span className={`text-sm font-medium transition-colors ${checked ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
            {label}
         </span>
      </label>
   );
}
