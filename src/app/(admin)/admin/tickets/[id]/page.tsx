'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard, 
  User, 
  MoreVertical,
  Calendar,
  MapPin,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { getMockTicketById } from '@/lib/mockData';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Theme Colors
const GREEN = '#2D5016';
const BG_WARM = '#EFF1EC';

export default function AdminTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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

  const handleCopy = () => {
    navigator.clipboard.writeText(ticket.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isContestant = ticket.ticketType === 'contestant';

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/tickets">
              <Button variant="ghost" size="icon" className="text-gray-500">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <h1 className="font-bold text-gray-900 leading-none">Ticket Details</h1>
                 <Badge variant="default" className="text-xs">{ticket.uniqueCode}</Badge>
               </div>
               <p className="text-xs text-gray-500 mt-1">ID: {ticket.id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <Button 
               variant="outline" 
               size="sm"
               leftIcon={<Download className="w-4 h-4" />}
             >
               PDF
             </Button>
             <Button 
               size="sm"
               className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
               leftIcon={<Trash2 className="w-4 h-4" />}
             >
               Delete
             </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: Ticket & Info */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* Ticket Preview Card */}
             <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                   <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Ticket Preview</h3>
                   <Badge variant={ticket.status === 'verified' ? 'success' : 'warning'}>
                      {ticket.status}
                   </Badge>
                </div>
                
                <div className="p-8">
                   <div className="flex flex-col md:flex-row gap-8">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                         <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-200">
                            <Image 
                              src={ticket.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.userId}`} 
                              alt="Profile" 
                              fill 
                              className="object-cover"
                            />
                         </div>
                      </div>

                      <div className="flex-grow space-y-4">
                         <div>
                            <p className="text-2xl font-black text-gray-900">{ticket.fullName}</p>
                            {isContestant && <p className="text-lg text-green-700 font-bold">{ticket.stageName}</p>}
                         </div>

                         <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                               <p className="text-gray-400 text-xs uppercase font-bold mb-1">Ticket Type</p>
                               <p className="font-medium capitalize">{ticket.ticketType}</p>
                            </div>
                            <div>
                               <p className="text-gray-400 text-xs uppercase font-bold mb-1">Quantity</p>
                               <p className="font-medium">{ticket.numberOfTickets} Admit(s)</p>
                            </div>
                            <div>
                               <p className="text-gray-400 text-xs uppercase font-bold mb-1">Faculty</p>
                               <p className="font-medium">{ticket.faculty || '—'}</p>
                            </div>
                            <div>
                               <p className="text-gray-400 text-xs uppercase font-bold mb-1">Department</p>
                               <p className="font-medium">{ticket.department || '—'}</p>
                            </div>
                         </div>
                      </div>

                      {/* QR Stub */}
                      <div className="md:border-l border-dashed border-gray-200 md:pl-8 flex flex-col items-center justify-center text-center">
                         <div className="w-24 h-24 bg-gray-900 rounded-lg mb-2 relative overflow-hidden">
                            <Image src={ticket.qrCode} alt="QR" fill className="opacity-80" />
                         </div>
                         <p className="font-mono text-xs font-bold text-gray-500">{ticket.uniqueCode}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Personal Info */}
             <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <User className="w-5 h-5 text-green-600" />
                   Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <InfoItem label="Email Address" value="user@example.com" icon={<Mail className="w-4 h-4" />} />
                   <InfoItem label="Phone Number" value={ticket.phoneNumber} icon={<Phone className="w-4 h-4" />} />
                   <InfoItem label="WhatsApp" value={ticket.whatsappNumber || ticket.phoneNumber} icon={<MessageSquare className="w-4 h-4" />} />
                   {isContestant && (
                      <>
                        <InfoItem label="Level" value={ticket.level} />
                        <InfoItem label="Gender" value={ticket.gender} />
                        <InfoItem label="Category" value={ticket.category}  />
                      </>
                   )}
                </div>
             </div>
             
             {/* Linked Tickets (Audience) */}
             {ticket.linkedTickets && ticket.linkedTickets.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                   <h3 className="font-bold text-gray-900 mb-6">Linked Audience Tickets</h3>
                   {/* Mock list */}
                   <p className="text-gray-400 italic">No linked tickets data in view yet.</p>
                </div>
             )}

          </div>

          {/* RIGHT COL: Actions & Payment */}
          <div className="space-y-8">
             
             {/* Admin Actions */}
             <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                   {ticket.status === 'pending' && (
                      <>
                        <Button fullWidth className="bg-green-600 hover:bg-green-700 border-none" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                           Approve Ticket
                        </Button>
                        <Button fullWidth variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" leftIcon={<XCircle className="w-4 h-4" />}>
                           Reject Ticket
                        </Button>
                      </>
                   )}
                   <Button fullWidth variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
                      Resend Confirmation
                   </Button>
                   <Button fullWidth variant="outline" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                      Mark as Used
                   </Button>
                </div>
             </div>

             {/* Payment Info */}
             <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <CreditCard className="w-5 h-5 text-green-600" />
                   Payment Details
                </h3>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">Amount Paid</span>
                      <span className="text-lg font-black text-gray-900">₦{ticket.totalAmount.toLocaleString()}</span>
                   </div>
                   
                   <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                         <span className="text-gray-500">Reference</span>
                         <span className="font-mono text-gray-900">{ticket.paymentReference}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-500">Date</span>
                         <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-500">Method</span>
                         <span className="capitalize">{ticket.paymentMethod || 'Paystack'}</span>
                      </div>
                   </div>

                   {/* Mock Transfer Proof */}
                   <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Transfer Proof</p>
                      <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                         No proof Image
                      </div>
                   </div>
                </div>
             </div>

             {/* Timeline */}
             <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Activity Timeline</h3>
                <div className="space-y-6 relative pl-2">
                   <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-100" />
                   
                   <TimelineItem 
                     title="Ticket Created" 
                     date={new Date(ticket.createdAt).toLocaleString()} 
                     active 
                   />
                   <TimelineItem 
                     title="Payment Verified" 
                     date={new Date(ticket.createdAt).toLocaleString()} 
                     active 
                   />
                   <TimelineItem 
                     title="Ticket Sent" 
                     date="Pending" 
                     active={false} 
                   />
                </div>
             </div>

          </div>

        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value, icon }: any) {
  return (
    <div className="flex items-start gap-3">
       {icon && <div className="mt-0.5 text-gray-400">{icon}</div>}
       <div>
          <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">{label}</p>
          <p className="font-medium text-gray-900">{value}</p>
       </div>
    </div>
  );
}

function TimelineItem({ title, date, active }: any) {
   return (
      <div className="flex gap-4 relative z-10">
         <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 bg-white ${active ? 'border-green-500' : 'border-gray-200'}`} />
         <div>
            <p className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{title}</p>
            <p className="text-xs text-gray-400">{date}</p>
         </div>
      </div>
   );
}
