'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  ChevronRight, 
  CreditCard, 
  Sparkles,
  Ticket,
  Users
} from 'lucide-react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { mockUsers } from '@/lib/mockData';
import Image from 'next/image';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';
const BG_CREAM = '#EAECE6';

// Mock current user
const currentUser = mockUsers[0];

// Mock Options
const FACULTIES = ['Engineering', 'Science', 'Arts', 'Social Sciences', 'Education', 'Management'];
const LEVELS = ['100', '200', '300', '400', '500'];
const CATEGORIES = ['Musician', 'Singer', 'Dancer', 'Comedian', 'Artist', 'Poet', 'Spoken Word', 'Other'];

export default function ContestantRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: currentUser.displayName,
    stageName: '',
    phone: '',
    whatsappSame: false,
    whatsapp: '',
    faculty: '',
    department: '',
    level: '',
    category: '',
    gender: '',
    photo: null as File | null,
    audienceCount: 0,
  });

  const [audienceGuests, setAudienceGuests] = useState<{ name: string; phone: string }[]>([]);
  const [totalPrice, setTotalPrice] = useState(10000);

  // Update audience guests array when count changes
  useEffect(() => {
    const count = Number(formData.audienceCount);
    if (count < 0) return;
    
    setAudienceGuests(prev => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill({ name: '', phone: '' })];
      }
      return prev.slice(0, count);
    });
  }, [formData.audienceCount]);

  // Calculate Price
  useEffect(() => {
    const basePrice = 10000;
    const audiencePrice = audienceGuests.length * 1500;
    setTotalPrice(basePrice + audiencePrice);
  }, [audienceGuests.length]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestChange = (index: number, field: 'name' | 'phone', value: string) => {
    const newGuests = [...audienceGuests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setAudienceGuests(newGuests);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const handleSubmit = () => {
    console.log('Form Submitted:', { ...formData, audienceGuests, totalPrice });
    setStep(2); // Move to "Payment" (simulated)
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden" style={{ backgroundColor: BG_WARM }}>
      {/* Spacer for Navbar */}
      <div className="h-24" />

      <main className="max-w-4xl mx-auto px-4">
        
        {/* Header Section with Unique Animation */}
        <div className="mb-12 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Registration
            </h1>
            <p className="text-gray-500 text-lg flex items-center gap-2">
              Join the stars of <span className="font-bold whitespace-nowrap" style={{ color: GREEN }}>Season 10</span>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </p>
          </motion.div>
          
          {/* Animated Progress Line */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-4">
            {['Details', 'Payment', 'Confirmation'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full transition-colors duration-500 ${step > i ? 'bg-green-600' : step === i + 1 ? 'bg-orange-500' : 'bg-gray-200'}`}
                />
                <span className={`text-sm font-medium ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s}
                </span>
                {i < 2 && <div className="w-10 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: FORM */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-white/50 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-600 to-green-400" />

              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <User className="w-6 h-6 text-green-700" />
                Contestant Details
              </h2>

              <div className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    value={formData.fullName} 
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                  <Input 
                    label="Stage Name" 
                    placeholder="e.g. The Voice"
                    value={formData.stageName}
                    onChange={(e) => handleInputChange('stageName', e.target.value)}
                  />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Phone Number" 
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                  <div>
                    <Input 
                      label="WhatsApp Number" 
                      placeholder="+234..."
                      disabled={formData.whatsappSame}
                      value={formData.whatsappSame ? formData.phone : formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    />
                    <label className="flex items-center gap-2 mt-2 text-sm text-gray-500 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={formData.whatsappSame}
                        onChange={(e) => handleInputChange('whatsappSame', e.target.checked)}
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                      value={formData.faculty}
                      onChange={(e) => handleInputChange('faculty', e.target.value)}
                    >
                      <option value="">Select Faculty</option>
                      {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                   </div>
                   
                   <Input 
                     label="Department"
                     placeholder="e.g. Computer Science"
                     value={formData.department}
                     onChange={(e) => handleInputChange('department', e.target.value)}
                   />

                   <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Level</label>
                    <select 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                    >
                      <option value="">Select Level</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                   </div>
                </div>

                {/* Row 4: Talent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Talent Category</label>
                    <select 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <div className="flex gap-4">
                      {['Male', 'Female'].map(g => (
                        <button
                          key={g}
                          onClick={() => handleInputChange('gender', g)}
                          className={`flex-1 py-3 px-4 rounded-lg border transition-all ${formData.gender === g ? 'bg-green-50 border-green-500 text-green-700 font-semibold' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${formData.photo ? 'border-green-500 bg-green-50/50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}`}>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      id="photo-upload"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                      {formData.photo ? (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 relative rounded-full overflow-hidden mb-3 border-4 border-white shadow-md">
                            <Image 
                              fill 
                              src={URL.createObjectURL(formData.photo)} 
                              alt="Preview" 
                              className="object-cover"
                            />
                          </div>
                          <p className="text-green-700 font-medium">{formData.photo.name}</p>
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
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-white/50"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-700" />
                  Audience Tickets
                </h2>
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                  <button 
                    onClick={() => handleInputChange('audienceCount', Math.max(0, formData.audienceCount - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:scale-110 transition-transform text-gray-600"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg w-4 text-center">{formData.audienceCount}</span>
                  <button 
                    onClick={() => handleInputChange('audienceCount', Math.min(10, formData.audienceCount + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 shadow-sm hover:scale-110 transition-transform text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

               <AnimatePresence>
                 {audienceGuests.map((guest, index) => (
                   <motion.div
                     key={index}
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
                             value={guest.name}
                             onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                           />
                           <Input 
                             placeholder="Guest Phone Number"
                             value={guest.phone}
                             onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                           />
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
               
               {audienceGuests.length === 0 && (
                 <p className="text-gray-400 italic text-center py-4">
                   No audience tickets added properly. Use the counter above to add friends/family.
                 </p>
               )}

            </motion.div>
          </div>

          {/* RIGHT COLUMN: PRICE SUMMARY (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
              >
                  {/* Decorative blobs */}
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
                    {formData.audienceCount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-400">Audience Tickets ({formData.audienceCount})</span>
                         <span className="font-mono">₦{(formData.audienceCount * 1500).toLocaleString()}</span>
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
                    variant="primary" 
                    fullWidth 
                    size="lg"
                    className="bg-green-600 hover:bg-green-500 text-white border-none shadow-lg shadow-green-900/20"
                    onClick={handleSubmit}
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

        </div>
      </main>
    </div>
  );
}
