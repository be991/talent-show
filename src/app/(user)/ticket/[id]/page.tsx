'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Copy, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Music,
  CheckCircle2,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { getDocument } from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { getWhatsAppTicketLink } from '@/lib/utils';

// Theme Colors
const GREEN = '#2D5016';
const GOLD = '#F5C542';
const BG_WARM = '#EFF1EC';

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  // Unwrap params using React.use()
  const { id } = use(params);
  
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!user) return;
      
      try {
        const ticketData = await getDocument('tickets', id);
        
        if (!ticketData) {
          setTicket(null);
          setIsLoading(false);
          return;
        }

        // Security check: user must own the ticket
        if (ticketData.userId !== user.id && ticketData.purchasedBy !== user.id) {
          toast.error("You don't have permission to view this ticket");
          router.push('/dashboard');
          return;
        }

        setTicket(ticketData);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        toast.error('Failed to load ticket data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [id, user, router]);

  if (!isLoading && !ticket) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF1EC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-green-700" />
          <p className="text-gray-500 font-medium">Fetching your ticket...</p>
        </div>
      </div>
    );
  }

  const isContestant = ticket.ticketType === 'contestant';
  const isVerified = ticket.status === 'verified';

  const handleCopy = () => {
    navigator.clipboard.writeText(ticket.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Ticket code copied!');
  };

  const handleDownload = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const link = getWhatsAppTicketLink(ticket);
    window.open(link, '_blank');
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/tickets/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: id, userId: user?.id }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.emailSent ? 'Ticket resent to your email!' : 'Ticket resent (email may have failed).');
        
        // Offer to open WhatsApp
        if (result.whatsappLink) {
          const openWhatsApp = window.confirm('Open WhatsApp to send ticket to yourself?');
          if (openWhatsApp) {
            window.open(result.whatsappLink, '_blank');
          }
        }
      } else {
        toast.error(result.error || 'Failed to resend ticket.');
      }
    } catch (error) {
      toast.error('Could not resend ticket. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen py-20 px-4 overflow-hidden" style={{ backgroundColor: BG_WARM }}>
        <main className="max-w-4xl mx-auto relative">
          
          {/* Header Actions */}
          <div className="mb-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-gray-600">
              ← Back to Dashboard
            </Button>
            {!isVerified && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100 animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Verification Pending</span>
              </div>
            )}
          </div>

          {/* Floating Background Particles */}
          <div className="absolute inset-0 pointer-events-none -z-10">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-10 blur-xl"
                style={{
                  background: i % 2 === 0 ? GREEN : GOLD,
                  width: Math.random() * 200 + 100,
                  height: Math.random() * 200 + 100,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -50, 0],
                  x: [0, 30, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 10 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* 3D TILT TICKET CONTAINER */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            {/* THE TICKET */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative print:shadow-none print:border print:border-gray-200">
              
              {/* LEFT SIDE: MAIN INFO */}
              <div className="flex-grow p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                            NUTESA GOT TALENT <span style={{ color: GOLD }}>S10</span>
                          </h1>
                          <p className="text-gray-400 font-medium tracking-wide text-sm mt-1 uppercase">Talent Stardom</p>
                        </div>
                        <div className="bg-gray-900 text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-widest shadow-lg border border-gray-700 uppercase">
                          Official Ticket
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        {/* Photo or Icon */}
                        <div className="flex-shrink-0 flex justify-center">
                          {isContestant ? (
                            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 relative">
                                <Image 
                                  src={ticket.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.userId}`} 
                                  alt="Profile" 
                                  fill 
                                  className="object-cover"
                                />
                            </div>
                          ) : (
                            <div className="w-32 h-32 rounded-2xl bg-green-50 flex items-center justify-center border-4 border-white shadow-xl text-green-700">
                              <User className="w-12 h-12" />
                            </div>
                          )}
                        </div>

                        <div className="flex-grow space-y-4">
                          <div className="grid grid-cols-2 gap-4 sm:gap-6">
                              <div className="col-span-2 sm:col-span-1">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Full Name</p>
                                <p className="font-bold text-gray-900 text-lg sm:text-xl truncate">{ticket.fullName}</p>
                              </div>
                              {isContestant && (
                                <div className="col-span-2 sm:col-span-1">
                                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Stage Name</p>
                                  <p className="font-bold text-gray-900 text-lg sm:text-xl text-green-700">{ticket.stageName}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Ticket Type</p>
                                <Badge variant={isContestant ? 'warning' : 'success'} className="uppercase">
                                  {ticket.ticketType} PASS
                                </Badge>
                              </div>
                              {isContestant && (
                                <div>
                                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Category</p>
                                  <div className="flex items-center gap-1 font-medium text-gray-700 text-sm">
                                    <Music className="w-4 h-4 text-orange-500" />
                                    {ticket.category}
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs sm:text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-600" />
                                <span>March 2026</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span>4:00 PM</span>
                              </div>
                              <div className="col-span-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <span>University Main Auditorium</span>
                              </div>
                          </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center md:text-left font-medium">
                      Valid for {ticket.numberOfTickets || 1} person(s) • Non-transferable • Present QR code at the entrance
                    </p>
                  </div>
              </div>

              {/* PERFORATOR LINE */}
              <div className="relative md:w-0 md:border-l-2 border-t-2 md:border-t-0 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="absolute -left-3 top-[-14px] md:left-[-14px] md:top-[-14px] w-7 h-7 bg-[#EFF1EC] rounded-full print:hidden" />
                  <div className="absolute -left-3 bottom-[-14px] md:left-[-14px] md:bottom-[-14px] w-7 h-7 bg-[#EFF1EC] rounded-full print:hidden" />
              </div>

              {/* RIGHT SIDE: QR */}
              <div className="w-full md:w-80 bg-gray-50 p-8 flex flex-col items-center justify-center text-center border-l-0 md:border-l-2 border-dashed border-gray-100 print:bg-white">
                  {isVerified ? (
                    <>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-[0.2em]">Scan for Entry</p>
                      
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 group-hover:scale-105 transition-transform duration-500 print:shadow-none">
                        <img src={ticket.qrCode} alt="Ticket QR Code" className="w-40 h-40 object-contain" />
                      </div>

                      <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-green-400 transition-colors print:border-none group shadow-sm active:scale-95 transition-all"
                      >
                        <span className="font-mono font-black text-gray-900 tracking-widest text-lg">{ticket.uniqueCode}</span>
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors print:hidden" />
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center py-6">
                       <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                          <Clock className="w-8 h-8 animate-pulse" />
                       </div>
                       <p className="text-amber-800 font-bold mb-1">Verification Pending</p>
                       <p className="text-xs text-amber-600 max-w-[180px]">Your QR code and unique ID will appear once payment is verified.</p>
                       
                       <div className="mt-6 font-mono text-gray-300 text-sm tracking-widest">
                         XXX-XXX-XXX
                       </div>
                    </div>
                  )}
              </div>
            </div>
            
            {/* Action Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center print:hidden px-4"
            >
              {isVerified && (
                <>
                  <Button 
                    size="lg" 
                    className="rounded-xl shadow-lg bg-gray-900 text-white hover:bg-black transition-all"
                    leftIcon={<Download className="w-5 h-5" />}
                    onClick={handleDownload}
                  >
                    Download / Print
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="rounded-xl bg-white border-gray-200 hover:bg-green-50 hover:border-green-200 transition-all"
                    leftIcon={<Share2 className="w-5 h-5 text-green-700" />}
                    onClick={handleWhatsAppShare}
                  >
                    Share to WhatsApp
                  </Button>
                </>
              )}
              
              <Button 
                size="lg" 
                variant="ghost"
                className="rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                leftIcon={<Mail className="w-5 h-5" />}
                onClick={handleResend}
                loading={isResending}
                disabled={isResending}
              >
                Resend to Email/WA
              </Button>
            </motion.div>

          </motion.div>

          {/* Footer Credit */}
          <div className="mt-12 text-center text-gray-400 text-[10px] font-bold tracking-[0.3em] uppercase opacity-50">
            Powered by NUTESA Talent Management
          </div>

        </main>
      </div>
    </AuthGuard>
  );
}
