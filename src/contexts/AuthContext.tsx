'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, signInWithGoogle, logout, isAdmin } from '@/lib/firebase/auth';
import { createDocument, getDocument } from '@/lib/firebase/firestore';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Check if user exists in Firestore
          let userData = await getDocument<User>('users', firebaseUser.uid);

          if (!userData) {
            // Create new user document
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous',
              photoURL: firebaseUser.photoURL || undefined,
              role: isAdmin(firebaseUser.email) ? 'admin' : 'user',
              createdAt: new Date(),
              lastLogin: new Date(),
            };
            await createDocument('users', firebaseUser.uid, userData);
          } else {
            // Update last login
            await createDocument('users', firebaseUser.uid, {
              ...userData,
              lastLogin: new Date(),
            });
          }

          setUser(userData);
        } catch (err: any) {
          console.error('Error syncing user to Firestore:', err);
          setError(err.message || 'Failed to sync user data');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      await logout();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: isAdmin(user?.email),
        signIn: handleSignIn,
        signOut: handleSignOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
