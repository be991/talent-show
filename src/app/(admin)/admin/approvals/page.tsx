'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  CreditCard,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { mockPayments } from '@/lib/mockData';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Image from 'next/image';
import { AdminGuard } from '@/components/guards/AdminGuard';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

export default function AdminApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // Filter Payments
  const payments = mockPayments.filter(p => {
     if (activeTab === 'pending') return p.status === 'pending';
     return p.status === activeTab;
  });

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>

      
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <h1 className="text-2xl font-black text-gray-900 mb-2">Transfer Approvals</h1>
           <p className="text-gray-500">Review and verify bank transfer payments</p>
           
           <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
              {['pending', 'approved', 'rejected'].map(tab => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                      activeTab === tab 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                   }`}
                 >
                    {tab} ({mockPayments.filter(p => p.status === tab).length})
                 </button>
              ))}
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         
         {payments.length === 0 ? (
            <div className="text-center py-20">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-bold text-gray-900">No {activeTab} approvals</h3>
               <p className="text-gray-500">All caught up!</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {payments.map((payment) => (
                  <ApprovalCard key={payment.id} payment={payment} />
               ))}
            </div>
         )}

      </main>

      {/* Image Modal (Mock) */}
      {selectedProof && (
         <div 
           className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
           onClick={() => setSelectedProof(null)}
         >
            <div className="relative max-w-4xl max-h-screen">
               <img src={selectedProof} alt="Proof" className="rounded-lg shadow-2xl max-h-[90vh]" />
            </div>
         </div>
      )}

    </div>
    </AdminGuard>
  );
}


function ApprovalCard({ payment }: { payment: any }) {
   const timeLeft = "23h allow"; // Mock countdown

   return (
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row"
      >
         {/* Left: Details */}
         <div className="p-6 flex-grow flex flex-col justify-between">
            <div>
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-100 relative overflow-hidden">
                        <Image 
                           src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${payment.userId}`}
                           alt=""
                           fill
                           className="object-cover"
                        />
                     </div>
                     <div>
                        <p className="font-bold text-gray-900">User {payment.userId}</p>
                        <p className="text-xs text-gray-500">Ticket Payment</p>
                     </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                     {payment.paystackReference}
                  </Badge>
               </div>

               <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Amount Paid</p>
                  <p className="text-2xl font-black text-green-700">₦{payment.amount.toLocaleString()}</p>
               </div>

               <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                     <Calendar className="w-4 h-4" />
                     {new Date(payment.transactionDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-orange-600 font-medium">
                     <Clock className="w-4 h-4" />
                     {timeLeft} left
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="w-full text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
               >
                 Approve
               </Button>
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="w-full text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
               >
                 Reject
               </Button>
            </div>
         </div>

         {/* Right: Proof Preview */}
         <div className="w-full md:w-48 bg-gray-100 relative group cursor-pointer border-l border-gray-200">
             {payment.transferProofURL ? (
                <>
                  <Image 
                     src={payment.transferProofURL} 
                     alt="Proof" 
                     fill 
                     className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                     <ExternalLink className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </>
             ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                   <AlertCircle className="w-8 h-8 mb-2" />
                   <p className="text-xs">No Image Preview</p>
                </div>
             )}
         </div>
      </motion.div>
   );
}
