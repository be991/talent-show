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
  Tv,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { getMockTicketById } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// Theme Colors
const GREEN = '#2D5016';
const GOLD = '#F5C542';
const BG_WARM = '#EFF1EC';

import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/AuthGuard';

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  // Unwrap params using React.use()
  const { id } = use(params);
  
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    // Simulate data fetch
    const foundTicket = getMockTicketById(id);
    if (foundTicket) {
       setTicket(foundTicket);
    }
    setIsLoading(false);
  }, [id]);

  if (!isLoading && !ticket) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isContestant = ticket.ticketType === 'contestant';

  const handleCopy = () => {
    navigator.clipboard.writeText(ticket.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen py-20 px-4 overflow-hidden" style={{ backgroundColor: BG_WARM }}>
        <main className="max-w-4xl mx-auto relative perspective-1000">
          
          {/* Floating Background Particles */}
          <div className="absolute inset-0 pointer-events-none -z-10">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-20 blur-xl"
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
            initial={{ rotateX: 20, opacity: 0, y: 100 }}
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            className="relative z-10"
          >
            {/* THE TICKET */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative group">
              
              {/* LEFT SIDE: MAIN INFO */}
              <div className="flex-grow p-8 md:p-10 relative overflow-hidden">
                  {/* Decorative Texture */}
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                          <h1 className="text-3xl font-black text-gray-900 leading-tight">
                            NUTESA GOT TALENT <span style={{ color: GOLD }}>S10</span>
                          </h1>
                          <p className="text-gray-400 font-medium tracking-wide text-sm mt-1 uppercase">Talent Stardom</p>
                        </div>
                        <motion.div 
                          initial={{ rotate: -10, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest shadow-lg border border-gray-700"
                        >
                          OFFICIAL TICKET
                        </motion.div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        {/* Photo or Icon */}
                        <div className="flex-shrink-0">
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
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Name</p>
                                <p className="font-bold text-gray-900 text-lg sm:text-xl truncate">{ticket.fullName}</p>
                              </div>
                              {isContestant && (
                                <div>
                                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Stage Name</p>
                                  <p className="font-bold text-gray-900 text-lg sm:text-xl text-green-700">{ticket.stageName}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Type</p>
                                <Badge variant={isContestant ? 'warning' : 'success'} className="uppercase">
                                  {ticket.ticketType} PASS
                                </Badge>
                              </div>
                              {isContestant && (
                                <div>
                                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Category</p>
                                  <div className="flex items-center gap-1 font-medium text-gray-700">
                                    <Music className="w-4 h-4 text-orange-500" />
                                    {ticket.category}
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-600" />
                                <span>March 15, 2024</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span>4:00 PM</span>
                              </div>
                              <div className="col-span-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <span>Main Auditorium, University Complex</span>
                              </div>
                          </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center md:text-left">
                      Valid for {ticket.numberOfTickets} person(s) • Non-refundable • Present at gate
                    </p>
                  </div>
              </div>

              {/* PERFORATOR LINE (Desktop: Vertical, Mobile: Horizontal) */}
              <div className="relative md:w-0 md:border-l-2 border-t-2 md:border-t-0 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="absolute -left-3 top-[-14px] md:left-[-14px] md:top-[-14px] w-7 h-7 bg-[#EFF1EC] rounded-full" />
                  <div className="absolute -left-3 bottom-[-14px] md:left-[-14px] md:bottom-[-14px] w-7 h-7 bg-[#EFF1EC] rounded-full" />
              </div>

              {/* RIGHT SIDE: QR */}
              <div className="w-full md:w-80 bg-gray-50 p-8 flex flex-col items-center justify-center text-center border-l-0 md:border-l-2 border-dashed border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Scan for Entry</p>
                  
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 group-hover:scale-105 transition-transform duration-500">
                    <img src={ticket.qrCode} alt="QR" className="w-40 h-40 opacity-90 mix-blend-multiply" />
                  </div>

                  <div 
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-green-400 transition-colors"
                  >
                    <span className="font-mono font-bold text-gray-900 tracking-wider font-lg">{ticket.uniqueCode}</span>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </div>
              </div>
            </div>
            
            {/* Action Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="rounded-xl shadow-lg hover:shadow-xl bg-gray-900 text-white border-none"
                leftIcon={<Download className="w-5 h-5" />}
                onClick={() => console.log('Download Ticket', id)}
              >
                Download PDF
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="rounded-xl bg-white border-gray-200 hover:bg-green-50 hover:border-green-200"
                leftIcon={<Share2 className="w-5 h-5 text-green-700" />}
                onClick={() => console.log('Share WhatsApp', id)}
              >
                Send to WhatsApp
              </Button>
              <Button 
                size="lg" 
                variant="ghost"
                className="rounded-xl text-gray-500 hover:text-gray-900"
                leftIcon={<Mail className="w-5 h-5" />}
                onClick={() => console.log('Resend Email', id)}
              >
                Resend Email
              </Button>
            </motion.div>

          </motion.div>

          {/* Footer Credit */}
          <div className="mt-12 text-center text-gray-400 text-xs font-medium tracking-widest uppercase">
            Organized by NUTESA Team Raise
          </div>

        </main>
      </div>
    </AuthGuard>
  );
}
