'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  ExternalLink,
  AlertCircle,
  Loader2,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Image from 'next/image';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { useAuth } from '@/hooks/useAuth';
import { queryDocuments } from '@/lib/firebase/firestore';
import { where } from 'firebase/firestore';
import { toast } from 'sonner';

import { PaymentStatus } from '@/types';

// Theme Colors
const GREEN = '#2D5016';
const FG_GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

export default function AdminApprovalsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const statusMap: Record<string, string> = {
        'pending': 'review_pending',
        'approved': 'success',
        'rejected': 'failed'
      };

      const results = await queryDocuments('payments', [
        where('status', '==', statusMap[activeTab]),
        where('paymentMethod', '==', 'bank_transfer')
      ]);

      // Sort in-memory to avoid needing a Firestore composite index
      const sortedResults = results.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setPayments(sortedResults);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  const handleApprove = async (paymentId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          adminId: user.id,
          adminName: user.displayName,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Transfer approved! User will be notified.');
        setPayments(prev => prev.filter(p => p.id !== paymentId));
      } else {
        throw new Error(result.error || 'Failed to approve');
      }
    } catch (error) {
      toast.error('Failed to approve transfer');
    }
  };

  const handleReject = async (paymentId: string) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason === null) return;
    
    try {
      const response = await fetch('/api/payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          reason,
          adminId: user?.id,
          adminName: user?.displayName,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Transfer rejected.');
        setPayments(prev => prev.filter(p => p.id !== paymentId));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to reject transfer');
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <h1 className="text-2xl font-black text-gray-900 mb-2">Transfer Approvals</h1>
           <p className="text-gray-500">Review and verify bank transfer payments</p>
           
           <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
              {(['pending', 'approved', 'rejected'] as const).map(tab => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                      activeTab === tab 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                   }`}
                 >
                    {tab}
                 </button>
              ))}
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         
         {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-green-700" />
                <p className="text-gray-500 font-medium tracking-wide">Fetching proof files...</p>
             </div>
         ) : payments.length === 0 ? (
            <div className="text-center py-20">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-bold text-gray-900">No {activeTab} approvals</h3>
               <p className="text-gray-500 font-medium">All caught up!</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {payments.map((payment) => (
                        <ApprovalCard 
                            key={payment.id} 
                            payment={payment} 
                            onApprove={() => handleApprove(payment.id)}
                            onReject={() => handleReject(payment.id)}
                            onViewProof={() => setSelectedProof(payment.proofUrl)}
                        />
                    ))}
                </AnimatePresence>
            </div>
         )}

      </main>

      {/* Image Modal */}
      {selectedProof && (
         <div 
           className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
           onClick={() => setSelectedProof(null)}
         >
            <div className="relative max-w-4xl max-h-screen">
               <img src={selectedProof} alt="Proof" className="rounded-lg shadow-2xl max-h-[90vh]" />
               <p className="text-white text-center mt-4 font-bold tracking-widest uppercase text-xs">Click anywhere to close</p>
            </div>
         </div>
      )}

    </div>
    </AdminGuard>
  );
}


function ApprovalCard({ payment, onApprove, onReject, onViewProof }: any) {
   const [isSubmitting, setIsSubmitting] = useState(false);

   const wrapAction = async (fn: () => Promise<void>) => {
      setIsSubmitting(true);
      try {
         await fn();
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <motion.div 
         layout
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row relative group"
      >
         {/* Left: Details */}
         <div className="p-6 flex-grow flex flex-col justify-between">
            <div>
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-400" />
                     </div>
                     <div>
                        <p className="font-bold text-gray-900 truncate max-w-[150px]">{payment.userEmail || 'User'}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{payment.id}</p>
                     </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] py-0 px-2">
                     {payment.paymentMethod?.replace('_', ' ') || 'BANK'}
                  </Badge>
               </div>

               <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-100/50">
                  <p className="text-[10px] text-green-700 uppercase font-black mb-1 opacity-70">Amount Paid</p>
                  <p className="text-2xl font-black text-green-900">₦{payment.amount.toLocaleString()}</p>
               </div>

               <div className="flex flex-col gap-2 text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                     <Calendar className="w-3.5 h-3.5" />
                     {payment.createdAt?.toDate ? payment.createdAt.toDate().toLocaleString() : 'Just now'}
                  </div>
                  {payment.purpose && (
                     <div className="flex items-center gap-1.5 capitalize">
                        <Clock className="w-3.5 h-3.5" />
                        {payment.purpose.replace('_', ' ')}
                     </div>
                  )}
               </div>
            </div>

            {payment.status === 'review_pending' && (
               <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button 
                    size="sm" 
                    className="w-full bg-green-700 text-white hover:bg-green-800"
                    disabled={isSubmitting}
                    onClick={() => wrapAction(onApprove)}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    disabled={isSubmitting}
                    onClick={() => wrapAction(onReject)}
                  >
                    Reject
                  </Button>
               </div>
            )}
            
            {payment.status === 'failed' && payment.rejectionReason && (
               <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-[10px] text-red-800 font-black uppercase mb-1">Rejection Reason</p>
                  <p className="text-xs text-red-700 italic">"{payment.rejectionReason}"</p>
               </div>
            )}
         </div>

         {/* Right: Proof Preview */}
         <div 
           className="w-full sm:w-48 h-48 sm:h-auto bg-gray-100 relative group cursor-pointer border-t sm:border-t-0 sm:border-l border-gray-200 shrink-0"
           onClick={onViewProof}
         >
             {payment.proofUrl ? (
                <>
                  <Image 
                     src={payment.proofUrl} 
                     alt="Transfer Proof" 
                     fill 
                     className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                     <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                        <ExternalLink className="w-6 h-6 text-white" />
                     </div>
                  </div>
                </>
             ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                   <AlertCircle className="w-8 h-8 mb-2" />
                   <p className="text-xs font-bold uppercase tracking-tight">Missing Proof</p>
                </div>
             )}
         </div>
      </motion.div>
   );
}
