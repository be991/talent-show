'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Building2, 
  Copy, 
  Check, 
  Upload, 
  ChevronRight, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

export default function PaymentPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [copied, setCopied] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Mock Order Data
  const orderTotal = 13000;
  const orderBreakdown = [
    { label: 'Contestant Registration', qty: 1, price: 10000 },
    { label: 'Audience Ticket', qty: 2, price: 1500 },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText('0123456789');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    console.log('Account number copied');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handlePayment = () => {
    console.log(`Processing ${paymentMethod} payment...`);
    // Simulate processing
    setTimeout(() => {
      router.push('/payment/success');
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden" style={{ backgroundColor: BG_WARM }}>
      <div className="h-24" />

      <main className="max-w-6xl mx-auto px-4">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Secure Payment
          </h1>
          <p className="text-gray-500">Complete your registration to get your tickets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Method Selection */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-white/50">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Select Payment Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                    paymentMethod === 'card' 
                      ? 'border-green-600 bg-green-50 shadow-md transform scale-[1.02]' 
                      : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${paymentMethod === 'card' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-bold text-lg mb-1 ${paymentMethod === 'card' ? 'text-green-900' : 'text-gray-900'}`}>Pay Online</h3>
                  <p className="text-sm text-gray-500">Instant verification via Paystack</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                    paymentMethod === 'transfer' 
                      ? 'border-green-600 bg-green-50 shadow-md transform scale-[1.02]' 
                      : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${paymentMethod === 'transfer' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    {paymentMethod === 'transfer' && (
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-bold text-lg mb-1 ${paymentMethod === 'transfer' ? 'text-green-900' : 'text-gray-900'}`}>Bank Transfer</h3>
                  <p className="text-sm text-gray-500">Manual verification (24hrs)</p>
                </button>
              </div>
            </div>

            {/* Dynamic Payment Content */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-white/50 min-h-[300px]">
              <AnimatePresence mode="wait">
                {paymentMethod === 'card' ? (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-10 text-center"
                  >
                     <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                       <CreditCard className="w-10 h-10 text-blue-600" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2">Pay with Card</h3>
                     <p className="text-gray-500 max-w-md mb-8">
                       You will be redirected to Paystack's secure checkout to complete your payment.
                     </p>
                     <Button 
                       size="lg"
                       className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                       onClick={handlePayment}
                     >
                       Pay Securely Now
                       <ChevronRight className="w-5 h-5 ml-2" />
                     </Button>
                     <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Secured by Paystack</span>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="transfer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                     <div className="flex items-center gap-2 mb-6">
                       <AlertCircle className="w-5 h-5 text-orange-500" />
                       <span className="text-sm font-medium text-orange-700 bg-orange-50 px-3 py-1 rounded-full">
                         Please transfer the exact amount
                       </span>
                     </div>

                     {/* Account Details Card */}
                     <div className="bg-gray-900 text-white rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Bank Name</p>
                            <p className="text-xl font-bold">Wema Bank</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Account Name</p>
                            <p className="text-xl font-bold">NUTESA Got Talent</p>
                          </div>
                          <div className="md:col-span-2">
                             <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Account Number</p>
                             <div className="flex items-center gap-4">
                               <p className="text-3xl md:text-4xl font-mono font-black text-green-400 tracking-wider">
                                 0123456789
                               </p>
                               <button 
                                 onClick={handleCopy}
                                 className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                                 title="Copy Account Number"
                               >
                                 {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                               </button>
                             </div>
                          </div>
                        </div>
                     </div>

                     {/* Upload Section */}
                     <div className="border-t border-gray-100 pt-8">
                        <h3 className="font-bold text-gray-900 mb-4">Upload Payment Proof</h3>
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${proofFile ? 'border-green-500 bg-green-50/30' : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'}`}>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden" 
                            id="proof-upload"
                          />
                          <label htmlFor="proof-upload" className="cursor-pointer w-full h-full block">
                            {proofFile ? (
                              <div className="flex items-center justify-center gap-4">
                                <div className="p-3 bg-green-100 rounded-full text-green-700">
                                  <Check className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                  <p className="font-medium text-green-900">{proofFile.name}</p>
                                  <p className="text-sm text-green-600">Click to change file</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <div className="p-3 bg-gray-100 rounded-full text-gray-500 mb-2">
                                  <Upload className="w-6 h-6" />
                                </div>
                                <p className="font-medium text-gray-700">Click to upload screenshot</p>
                                <p className="text-sm text-gray-400">JPG, PNG up to 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>

                        <Button 
                           size="lg"
                           fullWidth
                           className="mt-6 rounded-xl py-4"
                           style={{ backgroundColor: GREEN }}
                           disabled={!proofFile}
                           onClick={handlePayment}
                        >
                           Submit Payment Proof
                        </Button>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
               <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                  <h3 className="font-bold text-lg mb-6 text-gray-900 border-b border-gray-100 pb-4">
                    Order Summary
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {orderBreakdown.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-gray-500">Qty: {item.qty}</p>
                        </div>
                        <p className="font-mono font-medium">₦{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-8">
                     <span className="font-bold text-gray-900">Total</span>
                     <span className="font-black text-2xl" style={{ color: GREEN }}>₦{orderTotal.toLocaleString()}</span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 leading-relaxed">
                    <p className="font-bold mb-1">Important:</p>
                    Tickets will be generated automatically after payment confirmation. Please check your email and WhatsApp.
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
