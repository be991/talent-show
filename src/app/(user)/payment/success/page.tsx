'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  ArrowRight,
  Ticket,
  Calendar,
  MapPin 
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import { generateMockQRCode } from '@/lib/mockQRCode';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/AuthGuard';

export default function PaymentSuccessPage() {
  const { user } = useAuth();
  const qrCode = generateMockQRCode('sample', 'NGT-12345');


  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: BG_WARM }}>
        {/* Background Confetti/Ambience */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/confetti.png')] opacity-10 bg-repeat animate-pulse" />
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
            <div className="bg-green-600 p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </motion.div>
                <h1 className="text-3xl font-black text-white mb-2">Payment Successful!</h1>
                <p className="text-green-100">You are ready to shine ✨</p>
            </div>

            <div className="p-8">
                {/* Ticket Preview Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 relative group">
                  {/* Perforated holes illusion */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-gray-200" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-gray-200" />
                  
                  <div className="flex flex-col items-center text-center">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Ticket Preview</p>
                      
                      <h2 className="text-2xl font-black text-gray-900 mb-2">NGT10 - Talent Stardom</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> March 15</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Main Auditorium</span>
                      </div>

                      {/* QR Code */}
                      <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                        <img src={qrCode} alt="QR Code" className="w-32 h-32 opacity-90" />
                      </div>
                      <p className="font-mono font-bold text-gray-900 text-lg tracking-wider">NGT-C7X9K</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="rounded-xl"
                    style={{ backgroundColor: GREEN }}
                    onClick={() => console.log('Download Ticket')}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download Ticket
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => console.log('Share to WhatsApp')}
                      leftIcon={<Share2 className="w-4 h-4" />}
                    >
                      WhatsApp
                    </Button>
                    <Link href="/dashboard" className="w-full">
                      <Button 
                        variant="ghost"
                        fullWidth
                        className="rounded-xl bg-gray-50 hover:bg-gray-100"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
            </div>
          </motion.div>

          <p className="text-center text-gray-400 text-sm mt-8">
            A copy has been sent to your email
          </p>
        </main>
      </div>
    </AuthGuard>
  );
}
