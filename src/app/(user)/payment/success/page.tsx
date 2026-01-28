'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  ArrowRight,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDocument } from '@/lib/firebase/firestore';
import { getWhatsAppTicketLink } from '@/lib/utils';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/AuthGuard';

import { Suspense } from 'react';

function PaymentSuccessContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticketId = searchParams.get('ticketId');
  const status = searchParams.get('status'); // 'pending' for transfers
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      return;
    }
    
    const fetchTicket = async () => {
      try {
        const ticketData = await getDocument('tickets', ticketId);
        setTicket(ticketData);
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicket();
  }, [ticketId]);

  const getMessage = () => {
    if (status === 'pending' || ticket?.status === 'pending') {
      return {
        title: 'Transfer Proof Submitted!',
        message: 'Your payment is being verified. You will receive your ticket via email and WhatsApp once approved (usually within 24 hours).',
        icon: <Clock className="w-10 h-10 text-amber-600" />,
        bannerBg: 'bg-amber-600',
        textStyle: 'text-amber-100'
      };
    }
    
    return {
      title: 'Payment Successful!',
      message: 'Your ticket has been generated and sent to your email and WhatsApp.',
      icon: <CheckCircle2 className="w-10 h-10 text-green-600" />,
      bannerBg: 'bg-green-600',
      textStyle: 'text-green-100'
    };
  };

  const content = getMessage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG_WARM }}>
        <Loader2 className="w-10 h-10 animate-spin text-green-700" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: BG_WARM }}>
        {/* Background Confetti/Ambience */}
        <div className="absolute inset-0 pointer-events-none">
          {status !== 'pending' && <div className="absolute top-0 left-0 w-full h-full bg-[url('/confetti.png')] opacity-10 bg-repeat animate-pulse" />}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[100px]" />
        </div>

        <main className="relative z-10 max-w-lg w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50"
          >
            {/* Success Banner */}
            <div className={`${content.bannerBg} p-10 text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  {content.icon}
                </motion.div>
                <h1 className="text-3xl font-black text-white mb-2">{content.title}</h1>
                <p className={content.textStyle}>{content.message}</p>
            </div>

            <div className="p-8">
                {/* Ticket Preview Card */}
                {ticket ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 relative group">
                    {/* Perforated holes illusion */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-gray-200" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-gray-200" />
                    
                    <div className="flex flex-col items-center text-center">
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">
                          {ticket.ticketType === 'contestant' ? 'Contestant' : 'Audience'} Ticket Preview
                        </p>
                        
                        <h2 className="text-2xl font-black text-gray-900 mb-1">NUTESA Got Talent</h2>
                        <p className="text-green-700 font-bold text-sm mb-2">Season 10 - Talent Stardom</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-medium">
                          <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                            <Calendar className="w-3.5 h-3.5 text-green-600" /> March 2026
                          </span>
                          <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                            <MapPin className="w-3.5 h-3.5 text-green-600" /> Main Hall
                          </span>
                        </div>

                        {ticket.status === 'verified' ? (
                          <>
                            {/* QR Code */}
                            <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100 mb-4 transition-transform group-hover:scale-105">
                              <img src={ticket.qrCode} alt="QR Code" className="w-40 h-40 object-contain" />
                            </div>
                            <p className="text-xs text-gray-400 mb-1 font-bold tracking-tight uppercase">Unique Code</p>
                            <p className="font-mono font-black text-gray-900 text-2xl tracking-widest bg-gray-100 px-4 py-1.5 rounded-lg border border-gray-200">
                              {ticket.uniqueCode}
                            </p>
                          </>
                        ) : (
                          <div className="py-12 px-6 bg-amber-50 rounded-xl border border-amber-100 flex flex-col items-center">
                            <Clock className="w-12 h-12 text-amber-500 mb-4 animate-pulse" />
                            <p className="text-amber-800 font-bold">Verification Pending</p>
                            <p className="text-xs text-amber-600 mt-1 max-w-[200px]">Once your transfer is approved, your unique ticket code will appear here.</p>
                          </div>
                        )}
                        
                        <div className="mt-6 w-full pt-6 border-t border-dashed border-gray-200">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Registered to</p>
                          <p className="font-bold text-gray-900">{ticket.fullName}</p>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Ticket information not found.</p>
                  </div>
                )}

                <div className="space-y-3">
                  {ticket && (
                    <Button 
                      fullWidth 
                      size="lg" 
                      className="rounded-xl shadow-lg shadow-green-900/10"
                      style={{ backgroundColor: GREEN }}
                      onClick={() => router.push(`/ticket/${ticketId}`)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      View Full Ticket
                    </Button>
                  )}
                  
                  {ticket?.status === 'verified' && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline"
                        className="rounded-xl border-gray-200 text-gray-700 font-bold"
                        onClick={() => window.print()}
                        leftIcon={<Download className="w-4 h-4" />}
                      >
                        Print/Save
                      </Button>
                      <Button 
                        variant="outline"
                        className="rounded-xl border-green-200 text-green-700 font-bold hover:bg-green-50"
                        onClick={() => {
                          const link = getWhatsAppTicketLink({
                            ...ticket,
                            id: ticketId
                          });
                          window.open(link, '_blank');
                        }}
                        leftIcon={<Share2 className="w-4 h-4" />}
                      >
                        WhatsApp
                      </Button>
                    </div>
                  )}

                  <Link href="/dashboard" className="block w-full">
                    <Button 
                      variant="ghost"
                      fullWidth
                      className="rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
            </div>
          </motion.div>

          <p className="text-center text-gray-400 text-sm mt-8 font-medium">
            {ticket?.status === 'verified' 
              ? 'A digital copy has been sent to your email and WhatsApp' 
              : 'You will receive an update once verified'}
          </p>
        </main>
      </div>
    </AuthGuard>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#EFF1EC]">
        <Loader2 className="w-10 h-10 animate-spin text-green-700" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

