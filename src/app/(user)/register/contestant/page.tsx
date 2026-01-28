'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Upload, 
  Plus, 
  ChevronRight, 
  CreditCard, 
  Sparkles,
  Users
} from 'lucide-react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import Image from 'next/image';
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

// Options
const FACULTIES = ['Engineering', 'Science', 'Arts', 'Social Sciences', 'Education', 'Management'];
const LEVELS = ['100', '200', '300', '400', '500'];
const CATEGORIES = ['Musician', 'Singer', 'Dancer', 'Comedian', 'Artist', 'Poet', 'Spoken Word', 'Other'];

// Zod Schema
const contestantSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  stageName: z.string().min(2, "Stage name is required"),
  phone: z.string().regex(/^(\+234|0)[789]\d{9}$/, "Invalid Nigerian phone number"),
  whatsappSame: z.boolean(),
  whatsapp: z.string().optional(),
  faculty: z.string().min(1, "Select a faculty"),
  department: z.string().min(2, "Enter your department"),
  level: z.string().min(1, "Select your level"),
  category: z.string().min(1, "Select your category"),
  gender: z.string().min(1, "Select gender"),
  audienceGuests: z.array(z.object({
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

type ContestantFormData = z.infer<typeof contestantSchema>;

export default function ContestantRegisterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [audienceCount, setAudienceCount] = useState(0);

  // React Hook Form Setup
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ContestantFormData>({
    resolver: zodResolver(contestantSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      stageName: '',
      phone: '',
      whatsappSame: false,
      whatsapp: '',
      faculty: '',
      department: '',
      level: '',
      category: '',
      gender: '',
      audienceGuests: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "audienceGuests"
  });

  const whatsappSame = watch('whatsappSame');
  const phone = watch('phone');

  // Price Calculation
  const basePrice = 10000;
  const audiencePrice = audienceCount * 1500;
  const totalPrice = basePrice + audiencePrice;

  // Sync user data
  useEffect(() => {
    if (user && !watch('fullName')) {
      setValue('fullName', user.displayName || '');
    }
  }, [user, setValue, watch]);

  // Handle Audience Count Changes
  useEffect(() => {
    const currentLength = fields.length;
    if (audienceCount > currentLength) {
      for (let i = 0; i < audienceCount - currentLength; i++) {
        append({ name: '', phone: '' });
      }
    } else if (audienceCount < currentLength) {
      for (let i = 0; i < currentLength - audienceCount; i++) {
        remove(currentLength - 1 - i);
      }
    }
  }, [audienceCount, append, remove, fields.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  // Form Submission
  const onSubmit = async (data: ContestantFormData) => {
    if (!photo) {
      toast.error('Please upload a profile photo');
      return;
    }

    setSubmitting(true);
    
    try {
      // Prepare registration data for payment page
      const registrationPayload = {
        ...data,
        whatsapp: data.whatsappSame ? data.phone : data.whatsapp,
        totalAmount: totalPrice,
        ticketType: 'contestant',
        ticketCount: 1 + audienceCount, // 1 contestant + audience tickets
        audienceTicketCount: audienceCount,
        userId: user?.id,
        userEmail: user?.email,
        hasPhoto: true, // Photo will be uploaded after payment
        photoName: photo.name,
        timestamp: new Date().toISOString()
      };
      
      // Store in sessionStorage
      sessionStorage.setItem('registrationData', JSON.stringify(registrationPayload));
      
      // Store photo temporarily (base64 for small files, or handle differently)
      // For now, we'll handle photo upload in a follow-up step after payment
      
      toast.success('Details saved! Proceeding to payment...');
      
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12 relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Contestant Registration
              </h1>
              <p className="text-gray-500 text-lg flex items-center gap-2">
                Join the stars of <span className="font-bold whitespace-nowrap" style={{ color: GREEN }}>Season 10</span>
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: FORM */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2.5rem] p-6 md:p-8 lg:p-10 shadow-sm border border-white/50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-600 to-green-400" />

                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  <User className="w-6 h-6 text-green-700" />
                  Your Details
                </h2>

                <div className="space-y-6">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Full Name" 
                      {...register('fullName')}
                      error={errors.fullName?.message}
                    />
                    <Input 
                      label="Stage Name" 
                      placeholder="e.g. The Voice"
                      {...register('stageName')}
                      error={errors.stageName?.message}
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Phone Number" 
                      placeholder="+234..."
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                    <div>
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

                  {/* Row 3: Selects */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Faculty</label>
                      <select 
                        className={`w-full px-4 py-3 rounded-lg border ${errors.faculty ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white`}
                        {...register('faculty')}
                      >
                        <option value="">Select Faculty</option>
                        {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      {errors.faculty && <p className="text-red-500 text-xs mt-1">{errors.faculty.message}</p>}
                    </div>
                    
                    <Input 
                      label="Department"
                      placeholder="e.g. Computer Science"
                      {...register('department')}
                      error={errors.department?.message}
                    />

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Level</label>
                      <select 
                        className={`w-full px-4 py-3 rounded-lg border ${errors.level ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white`}
                        {...register('level')}
                      >
                        <option value="">Select Level</option>
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level.message}</p>}
                    </div>
                  </div>

                  {/* Row 4: Talent */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Talent Category</label>
                      <select 
                        className={`w-full px-4 py-3 rounded-lg border ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white`}
                        {...register('category')}
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <div className="flex gap-4">
                        {['Male', 'Female'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setValue('gender', g)}
                            className={`flex-1 py-3 px-4 rounded-lg border transition-all ${watch('gender') === g ? 'bg-green-50 border-green-500 text-green-700 font-semibold' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Profile Photo <span className="text-red-500">*</span></label>
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${photo ? 'border-green-500 bg-green-50/50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}`}>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        id="photo-upload"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                        {photo ? (
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 relative rounded-full overflow-hidden mb-3 border-4 border-white shadow-md">
                              <Image 
                                fill 
                                src={URL.createObjectURL(photo)} 
                                alt="Preview" 
                                className="object-cover"
                              />
                            </div>
                            <p className="text-green-700 font-medium">{photo.name}</p>
                            <p className="text-xs text-green-500 mt-1">Click to change</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                              <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-gray-600 font-medium">Click to upload photo</p>
                            <p className="text-sm text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AUDIENCE TICKETS SECTION */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-[2.5rem] p-6 md:p-8 lg:p-10 shadow-sm border border-white/50"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6 text-green-700" />
                    Audience Tickets
                  </h2>
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                    <button 
                      type="button"
                      onClick={() => setAudienceCount(Math.max(0, audienceCount - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:scale-110 transition-transform text-gray-600"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg w-4 text-center">{audienceCount}</span>
                    <button 
                      type="button"
                      onClick={() => setAudienceCount(Math.min(10, audienceCount + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 shadow-sm hover:scale-110 transition-transform text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {fields.map((guest, index) => (
                    <motion.div
                      key={guest.id}
                      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group">
                          <div className="absolute -left-3 top-6 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                            {index + 1}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-500 mb-4 pl-4 uppercase tracking-wider">Guest Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                              placeholder="Guest Full Name"
                              {...register(`audienceGuests.${index}.name` as const)}
                              error={errors.audienceGuests?.[index]?.name?.message}
                            />
                            <Input 
                              placeholder="Guest Phone Number"
                              {...register(`audienceGuests.${index}.phone` as const)}
                              error={errors.audienceGuests?.[index]?.phone?.message}
                            />
                          </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {audienceCount === 0 && (
                  <p className="text-gray-400 italic text-center py-4">
                    No audience tickets added. Use the counter above to add friends/family.
                  </p>
                )}

              </motion.div>
            </div>

            {/* RIGHT COLUMN: PRICE SUMMARY (Sticky) */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-28 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />

                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-400" />
                      Payment Summary
                    </h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Contestant Fee</span>
                        <span className="font-mono">₦10,000</span>
                      </div>
                      {audienceCount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Audience Tickets ({audienceCount})</span>
                          <span className="font-mono">₦{(audienceCount * 1500).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold">TOTAL</span>
                        <motion.span 
                          key={totalPrice}
                          initial={{ scale: 1.2, color: '#4ade80' }}
                          animate={{ scale: 1, color: '#ffffff' }}
                          className="font-black text-3xl tracking-tight"
                        >
                          ₦{totalPrice.toLocaleString()}
                        </motion.span>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      variant="primary" 
                      fullWidth 
                      size="lg"
                      loading={submitting}
                      className="bg-green-600 hover:bg-green-500 text-white border-none shadow-lg shadow-green-900/20"
                    >
                      Proceed to Payment
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                    
                    <p className="text-center text-xs text-gray-500 mt-4">
                      Secure payment via Paystack
                    </p>
                </motion.div>

                {/* Tips Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
                >
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Registration Tips
                  </h4>
                  <ul className="text-sm text-gray-500 space-y-2 list-disc list-inside">
                    <li>Use a clear, high-quality photo.</li>
                    <li>Ensure your phone number is on WhatsApp.</li>
                    <li>Double-check your talent category.</li>
                  </ul>
                </motion.div>
              </div>
            </div>

          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
