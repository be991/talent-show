'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
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
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { uploadFile } from '@/lib/firebase/storage';

// Dynamic import to avoid SSR issues with react-paystack
const PaystackButton = dynamic(() => import('@/components/payment/PaystackButton'), {
  ssr: false,
  loading: () => <Button size="lg" className="w-full max-w-sm bg-blue-600 text-white py-4 rounded-xl" disabled>Loading...</Button>
});

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

export default function PaymentPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [transferReference, setTransferReference] = useState('');
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Load Registration Data
  useEffect(() => {
    const data = sessionStorage.getItem('registrationData');
    if (!data) {
      toast.error('No registration found. Redirecting...');
      router.push('/dashboard');
      return;
    }
    setRegistrationData(JSON.parse(data));
  }, [router]);

  // Handle Loading State
  if (!registrationData || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF1EC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  // --- PAYSTACK CONFIG ---
  const config = {
    reference: `NGT-${nanoid(10)}`,
    email: user.email || 'user@example.com', // fallback
    amount: (registrationData.totalAmount || 0) * 100, // kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    metadata: {
      userId: user.id, // Use the id from the User type
      ticketType: registrationData.ticketType,
      numberOfTickets: registrationData.ticketCount || 1,
      custom_fields: []
    },
  };

  const onPaystackSuccess = async (reference: any) => {
    console.log('Payment successful:', reference);
    toast.success('Payment verified! generating tickets...');
    
    try {
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationData: { ...registrationData, userId: user.id },
          paymentReference: reference.reference,
          paymentMethod: 'card',
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        sessionStorage.removeItem('registrationData');
        router.push(`/payment/success?ticketId=${result.ticketId}`);
      } else {
        toast.error('Ticket creation failed. Contact support.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error during ticket creation.');
    }
  };

  const onPaystackClose = () => {
    toast.info('Payment cancelled');
  };

  // PaystackButton is dynamically imported at the top

  // --- BANK TRANSFER LOGIC ---
  const handleCopy = () => {
    navigator.clipboard.writeText('0123456789');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Account number copied');
  };

  const handleBankTransfer = async () => {
     if (showTransferDetails) return; // Already showing

     try {
       const reference = `NGT-TRF-${nanoid(10)}`;
       setTransferReference(reference);
       
       // Call API to init transfer (log it as pending)
       const response = await fetch('/api/payments/initiate-transfer', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           userId: user.id,
           userEmail: user.email,
           amount: registrationData.totalAmount,
           purpose: `${registrationData.ticketType} Registration`,
         }),
       });
       
       const result = await response.json();
       
       if (result.success) {
         setShowTransferDetails(true);
         toast.success('Transfer details loaded. Please make payment.');
       } else {
         setShowTransferDetails(true);
       }
     } catch (error) {
       console.error(error);
       setShowTransferDetails(true);
     }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const submitProof = async () => {
    if (!proofFile) {
      toast.error('Please upload your payment proof');
      return;
    }
    setUploading(true);

    try {
        // 1. Upload to Firebase Storage
        const proofPath = `payments/proofs/${user.id}_${Date.now()}_${proofFile.name}`;
        const proofURL = await uploadFile(proofFile, proofPath);

        // 2. Create Ticket record (pending status)
        const ticketRes = await fetch('/api/tickets/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationData: { ...registrationData, userId: user.id },
            paymentReference: transferReference,
            paymentMethod: 'bank_transfer',
          }),
        });
        
        const ticketData = await ticketRes.json();
        
        if (ticketData.success) {
          // 3. Update Payment with proof URL
          await fetch('/api/payments/upload-proof', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  paymentId: ticketData.paymentId,
                  proofUrl: proofURL,
              }),
          });

          sessionStorage.removeItem('registrationData');
          toast.success('Proof uploaded! Awaiting approval.');
          router.push(`/payment/success?ticketId=${ticketData.ticketId}&status=pending`);
        } else {
          toast.error('Ticket creation failed. Please contact admin.');
        }

    } catch (error) {
        console.error(error);
        toast.error('Failed to submit proof. Please try again.');
    } finally {
        setUploading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 overflow-x-hidden" style={{ backgroundColor: BG_WARM }}>
        <div className="h-24" />

        <main className="max-w-6xl mx-auto px-4">
          
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Secure Payment
            </h1>
            <p className="text-gray-500">Complete your registration for {registrationData.ticketType}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Method Selection */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-white/50">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Select Payment Method</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('card'); setShowTransferDetails(false); }}
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
                    type="button"
                    onClick={() => { setPaymentMethod('transfer'); handleBankTransfer(); }}
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
                      
                      <PaystackButton 
                        config={config}
                        amount={registrationData.totalAmount} 
                        onSuccess={onPaystackSuccess}
                        onClose={onPaystackClose}
                      />

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
                          Reference: <span className="font-mono">{transferReference || 'Generating...'}</span>
                        </span>
                      </div>

                      {/* Account Details */}
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
                                <p className="text-3xl md:text-4xl font-mono font-black text-green-400 tracking-wider">0123456789</p>
                                <button type="button" onClick={handleCopy} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
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
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="proof-upload" />
                            <label htmlFor="proof-upload" className="cursor-pointer w-full h-full block">
                              {proofFile ? (
                                <div className="flex items-center justify-center gap-4">
                                  <div className="p-3 bg-green-100 rounded-full text-green-700"><Check className="w-6 h-6" /></div>
                                  <div className="text-left">
                                    <p className="font-medium text-green-900">{proofFile.name}</p>
                                    <p className="text-sm text-green-600">Click to change file</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="p-3 bg-gray-100 rounded-full text-gray-500 mb-2"><Upload className="w-6 h-6" /></div>
                                  <p className="font-medium text-gray-700">Click to upload screenshot</p>
                                  <p className="text-sm text-gray-400">JPG, PNG up to 5MB</p>
                                </div>
                              )}
                            </label>
                          </div>

                          <Button 
                            size="lg" fullWidth 
                            className="mt-6 rounded-xl py-4" 
                            style={{ backgroundColor: GREEN }} 
                            disabled={!proofFile || uploading} 
                            loading={uploading}
                            onClick={submitProof}
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
                      <div className="flex justify-between items-start text-sm">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{registrationData.ticketType} Registration</p>
                          <p className="text-gray-500">Qty: {registrationData.ticketCount || 1}</p>
                        </div>
                        <p className="font-mono font-medium">₦{registrationData.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-8">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-black text-2xl" style={{ color: GREEN }}>₦{registrationData.totalAmount.toLocaleString()}</span>
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
    </AuthGuard>
  );
}
