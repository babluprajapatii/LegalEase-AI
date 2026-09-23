'use client';

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

// Placeholders that indicate unconfigured environment variables
const PLACEHOLDER_PATTERNS = ['AIzaSyDevMock', 'YOUR_', 'mock-', 'placeholder'];

export interface FirebaseValidationResult {
  valid: boolean;
  missingVars: string[];
}

/**
 * Safely validates required Firebase NEXT_PUBLIC environment variables.
 * Returns missing variable names WITHOUT exposing any secret values.
 */
export function validateFirebaseConfig(): FirebaseValidationResult {
  const missingVars: string[] = [];

  const configMap: Record<(typeof REQUIRED_ENV_VARS)[number], string | undefined> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  for (const varName of REQUIRED_ENV_VARS) {
    const val = configMap[varName];
    if (!val || val.trim() === '' || PLACEHOLDER_PATTERNS.some((p) => val.includes(p))) {
      missingVars.push(varName);
    }
  }

  return {
    valid: missingVars.length === 0,
    missingVars,
  };
}

function getFirebaseConfig(): FirebaseOptions | null {
  const { valid, missingVars } = validateFirebaseConfig();
  if (!valid) {
    if (typeof window !== 'undefined') {
      console.warn(
        `[LegalEase-AI] Missing or unconfigured Firebase variables: ${missingVars.join(', ')}. Please check your .env file.`,
      );
    }
    return null;
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

const initialConfig = getFirebaseConfig();

if (initialConfig) {
  appInstance = getApps().length === 0 ? initializeApp(initialConfig) : getApps()[0];
  authInstance = getAuth(appInstance);
} else if (getApps().length > 0) {
  appInstance = getApps()[0];
  authInstance = getAuth(appInstance);
}

export const googleProvider = new GoogleAuthProvider();

export const getFirebaseAuth = (): Auth | null => {
  if (!authInstance && typeof window !== 'undefined') {
    const freshConfig = getFirebaseConfig();
    if (freshConfig) {
      appInstance = getApps().length === 0 ? initializeApp(freshConfig) : getApps()[0];
      authInstance = getAuth(appInstance);
    }
  }
  return authInstance;
};

// Export auth instance for direct access when initialized
export const auth = authInstance;

export const signInWithGoogle = async () => {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    const { missingVars } = validateFirebaseConfig();
    const errorMsg = `Firebase is not properly configured. Missing required variables: ${missingVars.join(', ')}. Check your .env file.`;
    return { user: null, error: new Error(errorMsg) };
  }

  try {
    const result = await signInWithPopup(currentAuth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { user: null, error: error as Error };
  }
};

export const signOutUser = async () => {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    return { error: null };
  }

  try {
    await signOut(currentAuth);
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
};

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(currentAuth, callback);
};

export const getCurrentUser = (): User | null => {
  const currentAuth = getFirebaseAuth();
  return currentAuth ? currentAuth.currentUser : null;
};

export const getUserToken = async (forceRefresh = false): Promise<string | null> => {
  try {
    const currentAuth = getFirebaseAuth();
    if (!currentAuth) return null;
    const user = currentAuth.currentUser;
    if (!user) return null;
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
};
