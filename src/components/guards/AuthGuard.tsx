'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
      } else if (requireAdmin && !isAdmin) {
        toast.error('Unauthorized access. Admin privileges required.');
        router.push('/dashboard');
      }
    }
  }, [user, loading, isAdmin, requireAdmin, router, pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary-green" />
        <p className="mt-4 font-bold text-gray-900 uppercase tracking-widest">Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
