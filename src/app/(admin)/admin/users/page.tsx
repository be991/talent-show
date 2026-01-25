'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Ban, 
  MoreVertical, 
  Search, 
  Filter,
  Ticket,
  DollarSign,
  Mail,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import Image from 'next/image';
import { AdminGuard } from '@/components/guards/AdminGuard';

const BG_WARM = '#EFF1EC';

const MOCK_USERS = [
  { id: 1, name: 'Tunde Afolayan', email: 'tunde@unilag.edu.ng', role: 'admin', tickets: 2, spent: 11500, joined: '2024-01-10' },
  { id: 2, name: 'Sarah Omotola', email: 'sarah.o@gmail.com', role: 'user', tickets: 5, spent: 7500, joined: '2024-01-12' },
  { id: 3, name: 'Chinaza Okoro', email: 'chi.ok@outlook.com', role: 'user', tickets: 1, spent: 10000, joined: '2024-01-15' },
  { id: 4, name: 'Ahmed Musa', email: 'ahmed.m@yahoo.com', role: 'user', tickets: 0, spent: 0, joined: '2024-01-18' },
  { id: 5, name: 'Fatima Bello', email: 'f.bello@gmail.com', role: 'admin', tickets: 1, spent: 1500, joined: '2024-01-20' },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredUsers = MOCK_USERS.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminGuard>
      <div className="min-h-screen pb-20" style={{ backgroundColor: BG_WARM }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-none">User Directory</h1>
            <p className="text-sm text-gray-500 mt-1">Manage accounts and administrative roles</p>
          </div>
          <Button 
            className="bg-gray-900 text-white border-none rounded-xl"
            leftIcon={<UserPlus size={16} />}
          >
            Add New User
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
           <div className="lg:col-span-8 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex gap-4">
              <div className="relative flex-grow">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                    type="text" 
                    placeholder="Search by name or email..."
                    className="w-full h-12 bg-gray-50 border-none rounded-2xl pl-12 font-medium outline-none focus:ring-2 focus:ring-green-500/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <select 
                className="h-12 bg-gray-50 border-none rounded-2xl px-6 font-bold text-gray-600 outline-none hidden md:block"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                 <option value="All">All Roles</option>
                 <option value="user">Users</option>
                 <option value="admin">Admins</option>
              </select>
           </div>
           <div className="lg:col-span-4 bg-green-700 p-6 rounded-[2rem] shadow-lg flex items-center justify-between text-white">
              <div>
                 <p className="text-xs font-black uppercase tracking-widest text-green-200 mb-1">Active Accounts</p>
                 <h3 className="text-3xl font-black">1,248</h3>
              </div>
              <Users size={40} className="text-green-500/50" />
           </div>
        </div>

        {/* User List */}
        <div className="space-y-4">
           {filteredUsers.map((u, i) => (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-6 group hover:shadow-xl hover:border-green-200 transition-all cursor-pointer"
              >
                 <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 overflow-hidden relative border-2 border-white shadow-md flex-shrink-0">
                    <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" fill />
                 </div>
                 
                 <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                       <h4 className="text-lg font-black text-gray-900">{u.name}</h4>
                       <Badge className={u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}>
                          {u.role.toUpperCase()}
                       </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-400 flex items-center justify-center md:justify-start gap-2">
                       <Mail size={14} /> {u.email}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-8 px-8 border-x border-gray-100 hidden lg:grid">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Tickets</p>
                       <p className="font-black text-gray-900 flex items-center gap-1 justify-center"><Ticket size={14} className="text-green-600"/> {u.tickets}</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Spent</p>
                       <p className="font-black text-gray-900">₦{u.spent.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <button className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all" title="Ban User">
                       <Ban size={20} />
                    </button>
                    <button className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Permissions">
                       <Shield size={20} />
                    </button>
                    <button className="h-12 px-6 rounded-2xl bg-gray-50 text-gray-900 font-black text-xs uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-sm">
                       View Details
                    </button>
                 </div>
              </motion.div>
           ))}
        </div>
      </main>
      </div>
    </AdminGuard>
  );
}
