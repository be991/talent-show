'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/atoms/Button';
import { 
  User, 
  LogOut, 
  LayoutDashboard, 
  Ticket, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GREEN = '#2D5016';

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isPublicPage = pathname === '/';

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-[#2D5016] flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-gray-900">
            NGT<span style={{ color: GREEN }}>1.0</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-bold uppercase tracking-widest hover:text-[#2D5016] transition-colors ${mounted && pathname === '/' ? 'text-[#2D5016]' : 'text-gray-500'}`}>
            Home
          </Link>
          <Link href="/register/contestant" className={`text-sm font-bold uppercase tracking-widest hover:text-[#2D5016] transition-colors ${mounted && pathname?.includes('contestant') ? 'text-[#2D5016]' : 'text-gray-500'}`}>
            Contestant
          </Link>
          <Link href="/register/audience" className={`text-sm font-bold uppercase tracking-widest hover:text-[#2D5016] transition-colors ${mounted && pathname?.includes('audience') ? 'text-[#2D5016]' : 'text-gray-500'}`}>
            Tickets
          </Link>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="font-bold flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm hover:scale-105 transition-transform">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-gray-100">
                  <DropdownMenuLabel className="font-bold px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-gray-900">{user.displayName}</span>
                      <span className="text-xs text-gray-400 font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem className="rounded-xl flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem 
                    className="rounded-xl flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/signin">
              <Button 
                style={{ backgroundColor: GREEN }} 
                className="text-white font-bold px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          className="md:hidden p-2 text-gray-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              <Link href="/" className="text-lg font-bold text-gray-900 py-2">Home</Link>
              <Link href="/register/contestant" className="text-lg font-bold text-gray-900 py-2">Contestant Registration</Link>
              <Link href="/register/audience" className="text-lg font-bold text-gray-900 py-2">Get Tickets</Link>
              
              <DropdownMenuSeparator />
              
              {user ? (
                <>
                  <Link href="/dashboard" className="text-lg font-bold text-gray-900 py-2 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="text-lg font-bold text-red-600 py-2 flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/signin">
                  <Button 
                    fullWidth 
                    style={{ backgroundColor: GREEN }} 
                    className="text-white font-bold py-4 rounded-xl"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
