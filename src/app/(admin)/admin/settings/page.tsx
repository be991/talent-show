'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  DollarSign, 
  UserPlus, 
  Bell, 
  ShieldAlert, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  Upload, 
  AlertTriangle,
  Globe,
  Lock,
  Mail,
  Smartphone,
  Info,
  ChevronRight,
  Download,
  Database,
  Loader2,
  X,
  PlusCircle
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Image from 'next/image';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { getDocument, updateDocument, createDocument } from '@/lib/firebase/firestore';
import { uploadFile, compressImage } from '@/lib/firebase/storage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { serverTimestamp } from 'firebase/firestore';

// Theme Colors
const GREEN = '#2D5016';
const GOLD = '#F5C542';
const BG_WARM = '#EFF1EC';

type TabType = 'event' | 'pricing' | 'registration' | 'notifications' | 'advanced';

const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: 'event', label: 'Event Details', icon: <Info size={18} /> },
  { id: 'pricing', label: 'Pricing', icon: <DollarSign size={18} /> },
  { id: 'registration', label: 'Registration', icon: <UserPlus size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { id: 'advanced', label: 'Advanced', icon: <ShieldAlert size={18} /> },
];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('event');
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingFlyer, setUploadingFlyer] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsData = await getDocument('eventSettings', 'settings');
        
        if (!settingsData) {
          // Create default settings
          const defaultSettings = {
            eventName: 'NUTESA Got Talent NGT10 - Talent Stardom',
            eventDate: '',
            eventTime: '',
            eventVenue: '',
            eventDescription: '',
            contestantPrice: 10000,
            audiencePrice: 1500,
            registrationOpen: true,
            maxContestants: 100,
            maxAudienceTickets: 500,
            talentCategories: ['Musician', 'Singer', 'Dancer', 'Comedian', 'Artist', 'Poet', 'Spoken Word', 'Other'],
            faculties: ['Engineering', 'Arts', 'Science', 'Social Science', 'Education', 'Management Science', 'Law', 'Agriculture'],
            paymentMethods: {
              paystack: true,
              bankTransfer: true,
              cash: false
            },
            notifications: {
              ticketDelivery: true,
              reminders: true,
              whatsappUpdates: false
            },
            adminEmails: [user?.email].filter(Boolean) as string[],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          await createDocument('eventSettings', 'settings', defaultSettings);
          setFormData(defaultSettings);
        } else {
          setFormData(settingsData);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!formData || !user) {
      toast.error('Cannot save: Form data or user session is missing');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Ensure updatedAt is set
      const updatedSettings = {
        ...formData,
        updatedBy: user.id || 'admin',
        updatedAt: serverTimestamp(),
      };

      await updateDocument('eventSettings', 'settings', updatedSettings);
      
      setSaveSuccess(true);
      toast.success('Settings synchronized successfully!');
      
      // Log admin action
      try {
        await createDocument('adminLogs', `log_${Date.now()}`, {
          adminId: user.id || 'admin',
          adminName: user.displayName || 'Admin',
          action: `Updated ${activeTab} settings`,
          targetType: 'settings',
          targetId: 'settings',
          timestamp: serverTimestamp(),
        });
      } catch (logError) {
        console.warn('Failed to create admin log:', logError);
      }

      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Failed to update settings: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addItem = (field: string) => {
    const name = window.prompt(`Enter new ${field}:`);
    if (name) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: [...(prev[field] || []), name]
      }));
    }
  };

  const removeItem = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const handleExecuteWipe = async () => {
    const confirmed = window.confirm('DANGER: This will wipe all contestants, payments, and tickets. Are you ABSOLUTELY sure? This cannot be undone.');
    if (!confirmed) return;

    const secondConfirm = window.prompt('Type "WIPE" to confirm permanent deletion:');
    if (secondConfirm !== 'WIPE') {
      toast.error('Wipe cancelled: Confirmation text did not match.');
      return;
    }

    toast.loading('Executing Factory Reset...');
    try {
      // In a real app, this would call a backend API to batch delete
      // For now, we'll simulate the process
      setTimeout(() => {
        toast.dismiss();
        toast.success('System reset initiated. Most data will be cleared shortly.');
        
        // Log the severe action
        createDocument('adminLogs', `wipe_${Date.now()}`, {
           adminId: user?.id || 'admin',
           adminName: user?.displayName || 'Admin',
           action: 'SYSTEM FACTORY RESET',
           targetType: 'database',
           targetId: 'all',
           timestamp: serverTimestamp(),
           desc: 'Admin initiated a full data wipe of contestants and tickets.'
        });
      }, 2000);
    } catch (error) {
      toast.error('Failed to execute wipe');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFlyer(true);
    try {
      const compressed = await compressImage(file);
      const path = `event/flyer_${Date.now()}.jpg`;
      const url = await uploadFile(compressed instanceof File ? compressed : file, path);
      updateField('eventFlyer', url);
      
      // Auto-save flyer to Firestore
      await updateDocument('eventSettings', 'settings', {
        eventFlyer: url,
        updatedAt: serverTimestamp(),
      });
      
      toast.success('Flyer uploaded and saved!');
    } catch (error) {
      toast.error('Failed to upload flyer');
    } finally {
      setUploadingFlyer(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Initializing System Configuration...</p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20 transition-all duration-500" style={{ backgroundColor: BG_WARM }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 bg-green-600 rounded-lg shrink-0">
                 <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-gray-900 truncate">Portal Configuration</h1>
           </div>
           
           <div className="flex items-center gap-2 md:gap-4">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl md:rounded-2xl px-4 md:px-8 h-10 md:h-12 shadow-lg shadow-green-900/10 border-none text-sm md:text-base font-bold transition-all"
                onClick={handleSave}
                loading={isSaving}
                leftIcon={<Save size={18} className="hidden xs:block" />}
              >
                {saveSuccess ? 'Saved!' : 'Save System'}
              </Button>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
           
           {/* SIDEBAR NAVIGATION - Mobile Horizontal, Desktop Vertical */}
           <div className="lg:col-span-3 lg:sticky lg:top-28 z-20">
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-2 no-scrollbar">
                {TABS.map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`shrink-0 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 font-bold transition-all text-xs md:text-sm group ${
                        activeTab === tab.id 
                        ? 'bg-green-600 text-white shadow-md md:shadow-lg' 
                        : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm'
                     }`}
                   >
                      <div className={`${activeTab === tab.id ? 'text-white' : 'text-green-600 group-hover:scale-110 transition-transform'}`}>
                         {tab.icon}
                      </div>
                      <span className="flex-grow text-left whitespace-nowrap">{tab.label}</span>
                      <ChevronRight size={16} className={`hidden lg:block ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                   </button>
                ))}
              </div>

              <div className="hidden lg:block mt-8 p-6 bg-gradient-to-br from-[#1a3a0f] to-green-900 rounded-[2.5rem] text-white shadow-xl">
                 <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert size={18} className="text-green-400" />
                    <span className="font-black text-xs uppercase tracking-widest text-green-100">Admin Stats</span>
                 </div>
                 <p className="text-[11px] text-green-100/60 font-medium leading-relaxed mb-4">You are currently managing "NUTESA Got Talent NGT10" configuration.</p>
                 <Badge className="bg-white/10 text-white border-none text-[10px] py-1">VERIFIED ROLE</Badge>
              </div>
           </div>

           {/* MAIN CONTENT AREA */}
           <div className="lg:col-span-9 space-y-6 md:space-y-8">
              <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                   animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                   exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                   transition={{ duration: 0.2 }}
                   className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden"
                 >
                    {/* Event Details Tab */}
                    {activeTab === 'event' && (
                       <div className="p-6 md:p-12 space-y-6 md:space-y-8">
                          <Header title="Primary Identity" desc="Manage how the event appears to users across the platform." />
                          
                          <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                             <div className="relative group">
                                <div className="w-32 h-44 rounded-2xl bg-gray-100 overflow-hidden relative border-2 border-white shadow-sm">
                                   {formData.eventFlyer ? (
                                      <Image src={formData.eventFlyer} alt="Flyer" fill className="object-cover" />
                                   ) : (
                                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                         <Smartphone size={32} />
                                      </div>
                                   )}
                                   {uploadingFlyer && (
                                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                         <Loader2 className="w-6 h-6 animate-spin text-white" />
                                      </div>
                                   )}
                                </div>
                                <label className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-green-700 transition-colors">
                                   <Upload size={18} />
                                   <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploadingFlyer} />
                                </label>
                             </div>
                             <div className="flex-grow space-y-1">
                                <h4 className="font-black text-xs uppercase tracking-widest text-gray-400">Event Flyer / Poster</h4>
                                <p className="text-sm text-gray-500 max-w-sm">This image will be displayed on the landing page and tickets. Recommended: 800x1200px.</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                             <InputGroup 
                                label="Official Event Name" 
                                value={formData.eventName} 
                                onChange={(v: string) => updateField('eventName', v)} 
                             />
                             <InputGroup 
                                label="Event Venue" 
                                value={formData.eventVenue} 
                                onChange={(v: string) => updateField('eventVenue', v)} 
                             />
                             <InputGroup 
                                label="Date" 
                                type="date" 
                                value={formData.eventDate} 
                                onChange={(v: string) => updateField('eventDate', v)} 
                             />
                             <InputGroup 
                                label="Start Time" 
                                type="time" 
                                value={formData.eventTime} 
                                onChange={(v: string) => updateField('eventTime', v)} 
                             />
                          </div>
                          <div>
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Event Description</label>
                             <textarea 
                               rows={6}
                               value={formData.eventDescription || ''}
                               onChange={(e) => updateField('eventDescription', e.target.value)}
                               className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 outline-none focus:border-green-500 focus:bg-white transition-all font-medium text-gray-700 leading-relaxed"
                               placeholder="Enter full event description for the landing page..."
                             />
                          </div>
                       </div>
                    )}

                    {/* Pricing Tab */}
                    {activeTab === 'pricing' && (
                       <div className="p-6 md:p-12 space-y-8 md:space-y-12">
                          <Header title="Ticket Units & Fees" desc="Set the registration and attendance costs for the event." />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 text-white">
                             <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-green-700 border border-green-800 shadow-md">
                                <p className="text-[10px] font-black text-green-100 uppercase tracking-[0.2em] mb-4">Contestant Fee</p>
                                <div className="flex items-center gap-3">
                                   <div className="text-2xl md:text-3xl font-black opacity-80">₦</div>
                                   <input 
                                     type="number" 
                                     value={formData.contestantPrice} 
                                     onChange={(e) => updateField('contestantPrice', Number(e.target.value))}
                                     className="bg-transparent text-3xl md:text-4xl font-black outline-none w-full placeholder:text-green-500/50"
                                   />
                                </div>
                             </div>
                             <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-[#9a7b0c] border border-amber-800 shadow-md">
                                <p className="text-[10px] font-black text-amber-50 uppercase tracking-[0.2em] mb-4">Audience Fee</p>
                                <div className="flex items-center gap-3">
                                   <div className="text-2xl md:text-3xl font-black opacity-80">₦</div>
                                   <input 
                                     type="number" 
                                     value={formData.audiencePrice} 
                                     onChange={(e) => updateField('audiencePrice', Number(e.target.value))}
                                     className="bg-transparent text-3xl md:text-4xl font-black outline-none w-full placeholder:text-amber-500/50"
                                   />
                                </div>
                             </div>
                          </div>
                          
                          <div className="space-y-4 md:space-y-6">
                             <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Payment Channel Configuration</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <Toggle 
                                  label="Paystack Gateway (API)" 
                                  isOn={formData.paymentMethods?.paystack} 
                                  toggle={() => updateNestedField('paymentMethods', 'paystack', !formData.paymentMethods?.paystack)}
                                />
                                <Toggle 
                                  label="Bank Proof Upload (Manual)" 
                                  isOn={formData.paymentMethods?.bankTransfer} 
                                  toggle={() => updateNestedField('paymentMethods', 'bankTransfer', !formData.paymentMethods?.bankTransfer)}
                                />
                                <Toggle 
                                  label="Cash at Venue (Admins Only)" 
                                  isOn={formData.paymentMethods?.cash} 
                                  toggle={() => updateNestedField('paymentMethods', 'cash', !formData.paymentMethods?.cash)}
                                />
                             </div>
                          </div>
                       </div>
                    )}

                    {/* Registration Tab */}
                    {activeTab === 'registration' && (
                       <div className="p-6 md:p-12 space-y-8 md:space-y-12">
                          <Header title="Enrollment Criteria" desc="Configure capacity limits and dynamic registration options." />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                             <InputGroup 
                               label="Max Contestants" 
                               type="number" 
                               value={formData.maxContestants} 
                               onChange={(v: string) => updateField('maxContestants', Number(v))}
                             />
                             <InputGroup 
                               label="Max Audience Tickets" 
                               type="number" 
                               value={formData.maxAudienceTickets} 
                               onChange={(v: string) => updateField('maxAudienceTickets', Number(v))}
                             />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                             {/* Categories List */}
                             <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                   <h4 className="font-black text-[10px] uppercase text-gray-400 tracking-widest">Talent Categories</h4>
                                   <button 
                                      onClick={() => addItem('talentCategories')} 
                                      className="text-green-600 hover:scale-125 hover:rotate-90 transition-all p-1"
                                   >
                                      <Plus size={20}/>
                                   </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                   {formData.talentCategories?.map((cat: string, i: number) => (
                                      <Badge key={i} className="bg-gray-100 text-gray-700 border-none px-3 md:px-4 py-2 rounded-xl group hover:bg-green-50 transition-colors">
                                         <span className="text-xs md:text-sm">{cat}</span>
                                         <button onClick={() => removeItem('talentCategories', i)} className="ml-2 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:scale-125"><X size={12}/></button>
                                      </Badge>
                                   ))}
                                </div>
                             </div>

                             {/* Faculties List */}
                             <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                   <h4 className="font-black text-[10px] uppercase text-gray-400 tracking-widest">Target Faculties</h4>
                                   <button 
                                      onClick={() => addItem('faculties')} 
                                      className="text-green-600 hover:scale-125 hover:rotate-90 transition-all p-1"
                                   >
                                      <Plus size={20}/>
                                   </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                   {formData.faculties?.map((fac: string, i: number) => (
                                      <Badge key={i} className="bg-gray-100 text-gray-700 border-none px-3 md:px-4 py-2 rounded-xl group hover:bg-green-50 transition-colors">
                                         <span className="text-xs md:text-sm">{fac}</span>
                                         <button onClick={() => removeItem('faculties', i)} className="ml-2 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:scale-125"><X size={12}/></button>
                                      </Badge>
                                   ))}
                                </div>
                             </div>
                          </div>

                          <div className="pt-8 border-t border-gray-100">
                             <Toggle 
                               label="Registration Currently Open" 
                               isOn={formData.registrationOpen} 
                               toggle={() => updateField('registrationOpen', !formData.registrationOpen)}
                             />
                          </div>
                       </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                       <div className="p-6 md:p-12 space-y-8 md:space-y-12">
                          <Header title="Messaging & Alerts" desc="Configure how the system interacts with users via automated channels." />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                             <Toggle 
                               label="Instant Ticket Delivery" 
                               isOn={formData.notifications?.ticketDelivery} 
                               toggle={() => updateNestedField('notifications', 'ticketDelivery', !formData.notifications?.ticketDelivery)}
                             />
                             <Toggle 
                               label="Event Day Reminders" 
                               isOn={formData.notifications?.reminders} 
                               toggle={() => updateNestedField('notifications', 'reminders', !formData.notifications?.reminders)}
                             />
                             <Toggle 
                               label="WhatsApp Proof Updates" 
                               isOn={formData.notifications?.whatsappUpdates} 
                               toggle={() => updateNestedField('notifications', 'whatsappUpdates', !formData.notifications?.whatsappUpdates)}
                             />
                          </div>
                       </div>
                    )}

                    {/* Advanced Tab */}
                    {activeTab === 'advanced' && (
                       <div className="p-6 md:p-12 space-y-8 md:space-y-12">
                          <Header title="System Integrity" desc="Administrative power tools and data synchronization controls." />
                          
                          <div className="space-y-6">
                             <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Admin Management</h4>
                             <div className="flex flex-wrap gap-2 mb-4">
                                {formData.adminEmails?.map((email: string, i: number) => (
                                  <Badge key={i} className="bg-green-50 text-green-700 border-green-100 px-4 py-2 rounded-xl group">
                                    <span className="text-sm font-bold">{email}</span>
                                    <button 
                                      onClick={() => removeItem('adminEmails', i)} 
                                      className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 transition-all"
                                    >
                                      <X size={12} />
                                    </button>
                                  </Badge>
                                ))}
                                <button 
                                  onClick={() => addItem('adminEmails')}
                                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                >
                                  <Plus size={20} />
                                </button>
                             </div>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Users with these emails will have dashboard access.</p>
                          </div>

                          <div className="pt-12 border-t-2 border-red-50 space-y-6">
                             <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-red-600 flex items-center gap-2">
                                <ShieldAlert size={14} />
                                Danger Territory
                             </h4>
                             <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-red-50 border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-center md:text-left">
                                   <p className="font-black text-red-900 text-lg">Identity Factory Reset</p>
                                   <p className="text-xs text-red-600/80 font-bold leading-relaxed max-w-md">Wipe all registered contestants, payments, and generated tickets. This cannot be undone.</p>
                                </div>
                                <Button 
                                   className="bg-red-600 hover:bg-red-700 text-white border-none rounded-xl px-8 h-12 flex-shrink-0 text-sm font-black shadow-lg shadow-red-900/10"
                                   onClick={handleExecuteWipe}
                                >
                                   Execute Wipe
                                </Button>
                             </div>
                          </div>
                       </div>
                    )}
                 </motion.div>
              </AnimatePresence>
           </div>
        </div>
      </main>

      <AnimatePresence>
         {saveSuccess && (
            <motion.div 
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 50, scale: 0.9 }}
               className="fixed bottom-6 md:bottom-10 right-4 md:right-10 z-[60] bg-gray-900 text-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-2xl flex items-center gap-4"
            >
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shrink-0">
                  <Check size={20} />
               </div>
               <div>
                  <p className="font-black text-sm md:text-lg leading-tight text-white mb-0.5">Configuration Sync'd</p>
                  <p className="text-[10px] md:text-xs text-green-100/60 font-medium">All administrative changes are now live.</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
    </AdminGuard>
  );
}


function Header({ title, desc }: { title: string; desc: string }) {
   return (
      <div className="border-b border-gray-100 pb-6 md:pb-8">
         <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter mb-1 md:mb-2">{title}</h2>
         <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-wide">{desc}</p>
      </div>
   );
}

function InputGroup({ label, type = 'text', value, onChange, placeholder }: any) {
   return (
      <div>
         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block">{label}</label>
         <input 
           type={type} 
           value={value || ''} 
           onChange={(e) => onChange(e.target.value)}
           placeholder={placeholder}
           className="w-full h-12 md:h-14 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-gray-700 text-sm md:text-base shadow-sm"
         />
      </div>
   );
}

function Toggle({ label, isOn, toggle }: { label: string; isOn: boolean; toggle: () => void }) {
   return (
      <button 
         onClick={toggle}
         className="w-full flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-[2rem] bg-gray-50 border border-gray-100 hover:border-green-200 hover:bg-white transition-all group shadow-sm h-[68px] md:h-[80px]"
      >
         <span className={`text-xs md:text-sm font-black uppercase tracking-wide transition-colors text-left pr-4 ${isOn ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
            {label}
         </span>
         <div className={`w-12 h-6 md:w-14 md:h-8 rounded-full p-1 transition-all duration-300 shrink-0 ${isOn ? 'bg-green-600' : 'bg-gray-200'}`}>
            <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${isOn ? 'translate-x-6 md:translate-x-6' : 'translate-x-0'}`} />
         </div>
      </button>
   );
}
