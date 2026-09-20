'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  onAuthStateChangedListener,
  getCurrentUser,
  getUserToken,
} from './firebase';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);

    const unsubscribe = onAuthStateChangedListener(async (user) => {
      setUser(user);
      if (user) {
        const userToken = await getUserToken();
        setToken(userToken);
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const { user: newUser, error } = await signInWithGoogle();
    if (error) {
      throw error;
    }
    if (newUser) {
      setUser(newUser);
      const userToken = await getUserToken();
      setToken(userToken);

      // Upsert user to Firestore
      if (userToken) {
        try {
          await upsertUser(userToken);
        } catch (upsertError) {
          console.warn('Failed to upsert user:', upsertError);
        }
      }
    }
  };

  const signOut = async () => {
    const { error } = await signOutUser();
    if (error) {
      throw error;
    }
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function (since useAuth can't be called at top level)
export async function upsertUser(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to upsert user: ${response.statusText}`);
  }
  return response.json();
}
