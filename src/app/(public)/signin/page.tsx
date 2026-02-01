'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { toast } from 'sonner';

// Theme colors matching landing page
const GREEN = '#2D5016';
const BG_CREAM = '#EAECE6';
const BG_WARM = '#EFF1EC';

function SignInContent() {
  const { user, loading, signIn, error: authError, isAdmin } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      if (redirectPath) {
        router.push(redirectPath);
      } else if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, isAdmin, router, redirectPath]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn();
      // Redirect is handled by the useEffect above
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in with Google');
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm">
        <div className="animate-spin w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: `linear-gradient(to bottom, ${BG_WARM}, ${BG_CREAM})` }}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20" style={{ backgroundColor: GREEN }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20" style={{ backgroundColor: GREEN }} />
      </div>

      {/* Back Button */}
      <Link href="/" className="absolute top-8 left-8 group">
        <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </div>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div 
          className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12 text-center"
          style={{ borderColor: 'rgba(45,80,22,0.1)' }}
        >
          {/* Logo Badge */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3"
            style={{ backgroundColor: GREEN }}
          >
            <span className="text-white font-black text-2xl">NGT</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500 mb-10">
              Sign in to get your ticket or register as a contestant for <span className="font-bold whitespace-nowrap" style={{ color: GREEN }}>Season 1.0</span>
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full relative group overflow-hidden bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md"
          >
            {isSigningIn ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </motion.button>

          <p className="mt-8 text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-warm">
        <div className="animate-spin w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
