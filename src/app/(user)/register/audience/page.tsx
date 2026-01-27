'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Minus, 
  Plus, 
  ChevronRight, 
  CreditCard, 
  Sparkles,
  Ticket
} from 'lucide-react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { toast } from 'sonner';

// Form & Validation
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

// 1. Zod Validation Schema
const audienceSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  phone: z.string().regex(/^(\+234|0)[789]\d{9}$/, "Invalid Nigerian phone number"),
  whatsappSame: z.boolean(),
  whatsapp: z.string().optional(),
  ticketCount: z.number().min(1).max(10),
  guests: z.array(z.object({
    name: z.string().min(3, "Guest name is required"),
    phone: z.string().regex(/^(\+234|0)[789]\d{9}$/, "Invalid phone number"),
  }))
}).refine((data) => {
  if (!data.whatsappSame) {
    return /^(\+234|0)[789]\d{9}$/.test(data.whatsapp || '');
  }
  return true;
}, {
  message: "WhatsApp number is required if different from phone",
  path: ["whatsapp"],
});

type AudienceFormData = z.infer<typeof audienceSchema>;

export default function AudienceRegisterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // 2. React Hook Form Setup
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<AudienceFormData>({
    resolver: zodResolver(audienceSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      phone: '',
      whatsappSame: false,
      whatsapp: '',
      ticketCount: 1,
      guests: [{ name: user?.displayName || '', phone: '' }] 
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "guests"
  });

  // Watch values for UI updates
  const ticketCount = watch('ticketCount');
  const whatsappSame = watch('whatsappSame');
  const phone = watch('phone');
  
  // Calculate Price
  const totalPrice = ticketCount * 1500;

  // Sync with user data
  useEffect(() => {
    if (user) {
      if (!watch('fullName')) setValue('fullName', user.displayName || '');
      // Update first guest name if empty
      const currentGuests = watch('guests');
      if (currentGuests[0]?.name === '') {
        setValue(`guests.0.name`, user.displayName || '');
      }
    }
  }, [user, setValue, watch]);

  // Handle Dynamic Guests
  useEffect(() => {
    const currentLength = fields.length;
    if (ticketCount > currentLength) {
      for (let i = 0; i < ticketCount - currentLength; i++) {
        append({ name: '', phone: '' });
      }
    } else if (ticketCount < currentLength) {
      for (let i = 0; i < currentLength - ticketCount; i++) {
        remove(currentLength - 1 - i);
      }
    }
  }, [ticketCount, append, remove, fields.length]);

  // 3. Form Submission
  const onSubmit = async (data: AudienceFormData) => {
    setSubmitting(true);
    
    try {
      // Store in sessionStorage
      const registrationPayload = {
        ...data,
        whatsapp: data.whatsappSame ? data.phone : data.whatsapp,
        totalAmount: totalPrice,
        ticketType: 'audience',
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem('registrationData', JSON.stringify(registrationPayload));
      
      toast.success('Ticket details saved! Proceeding to payment...');
      
      // Short delay for UX
      setTimeout(() => {
        router.push('/payment');
      }, 1000);

    } catch (err) {
      console.error(err);
      toast.error('Failed to submit. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 overflow-x-hidden" style={{ backgroundColor: BG_WARM }}>
        <div className="h-24" />

        <main className="max-w-4xl mx-auto px-4">
          
          <div className="mb-12 relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Audience <span style={{ color: GREEN }}>Tickets</span>
              </h1>
              <p className="text-gray-500 text-lg flex items-center gap-2">
                Experience the magic of Season 10 live!
                <Ticket className="w-5 h-5 text-green-500 rotate-12" />
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: FORM */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Purchaser Details */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2rem] p-8 shadow-sm border border-white/50 relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-50 rounded-lg text-green-700">
                      <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Your Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input 
                      label="Full Name"
                      {...register('fullName')}
                      error={errors.fullName?.message}
                    />
                  </div>
                  <div>
                    <Input 
                      label="Phone Number"
                      {...register('phone')}
                      error={errors.phone?.message}
                      onChange={(e) => {
                        register('phone').onChange(e);
                        // Auto-update first guest phone if empty
                        if (!watch('guests.0.phone')) {
                          setValue('guests.0.phone', e.target.value);
                        }
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                      <Input 
                        label="WhatsApp Number" 
                        placeholder="+234..."
                        disabled={whatsappSame}
                        {...register('whatsapp')}
                        error={errors.whatsapp?.message}
                        value={whatsappSame ? phone : watch('whatsapp')}
                      />
                      <label className="flex items-center gap-2 mt-2 text-sm text-gray-500 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          {...register('whatsappSame')}
                          className="rounded text-green-600 focus:ring-green-500"
                        />
                        Same as phone number
                      </label>
                  </div>
                </div>
              </motion.div>

              {/* Ticket Counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${GREEN}, #1a4d1a)` }}
              >
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white blur-3xl" />
                </div>

                <div>
                  <h2 className="text-2xl text-white font-bold flex items-center gap-2">
                    How many tickets?
                  </h2>
                  <p className="text-green-200 text-sm">₦1,500 per person</p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-2 rounded-full border border-white/20">
                    <button 
                      type="button"
                      onClick={() => setValue('ticketCount', Math.max(1, ticketCount - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white text-white hover:text-green-900 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-mono text-3xl font-bold w-12 text-center text-white">{ticketCount}</span>
                    <button 
                      type="button"
                      onClick={() => setValue('ticketCount', Math.min(10, ticketCount + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-green-900 hover:scale-110 transition-transform shadow-lg"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                </div>
              </motion.div>

              {/* Guest Details List */}
              <div className="space-y-4">
                <h3 className="text-gray-500 font-medium pl-2">Guest Information</h3>
                <AnimatePresence>
                  {fields.map((guest, index) => (
                    <motion.div
                      key={guest.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="bg-white rounded-2xl p-6 border border-gray-100 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Input 
                              label="Name on Ticket"
                              placeholder="Enter Name"
                              {...register(`guests.${index}.name` as const)}
                              error={errors.guests?.[index]?.name?.message}
                            />
                          </div>
                          <div className="space-y-1">
                            <Input 
                              label="Phone Number"
                              placeholder="Enter Phone"
                              {...register(`guests.${index}.phone` as const)}
                              error={errors.guests?.[index]?.phone?.message}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>

            {/* RIGHT COLUMN: SUMMARY (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100"
                >
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Summary
                    </h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                        <span className="text-gray-500 text-sm">Tickets</span>
                        <span className="font-bold text-gray-900">x{ticketCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-4">
                        <span className="text-gray-400">Total Price</span>
                        <span className="font-black text-3xl text-green-600">
                          ₦{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button 
                      fullWidth 
                      type="submit"
                      size="lg"
                      loading={submitting}
                      className="text-white rounded-xl py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all border-none"
                      style={{ backgroundColor: GREEN }}
                    >
                      Pay ₦{totalPrice.toLocaleString()}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
                      <CreditCard className="w-3 h-3" />
                      <span>Paystack Secure</span>
                    </div>
                </motion.div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
