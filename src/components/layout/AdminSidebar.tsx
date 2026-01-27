'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Ticket, 
  FileCheck, 
  Scan, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Sparkles,
  Search,
  History,
  Users,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { label: 'Tickets', icon: Ticket, href: '/admin/tickets' },
  { label: 'Approvals', icon: FileCheck, href: '/admin/approvals' },
  { label: 'Scanner', icon: Scan, href: '/admin/scanner' },
  { label: 'Messaging', icon: MessageSquare, href: '/admin/messaging' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Search', icon: Search, href: '/admin/search' },
  { label: 'Logs', icon: History, href: '/admin/logs' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1a3a0f] z-[60] flex items-center px-4 shadow-md">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 mr-4 rounded-lg bg-green-800 text-white shadow-sm hover:bg-green-700 transition-colors"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-header font-bold text-white text-lg tracking-wide">Admin Portal</span>
      </div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-[55] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[#1a3a0f] text-white flex flex-col z-[60] transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-lg">
               <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter">
              NGT<span className="text-green-400">10</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'text-green-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-green-400 group-hover:text-white'}`} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
