'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';

/**
 * Login page — matches Figma 02-login.png.
 * Centered card with Google OAuth sign-in. Redirects to /dashboard on success.
 */
export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signIn();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setError(message);
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page" role="status" aria-label="Loading">
        <div className="loading-content">
          <div className="loading-spinner-lg" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="auth-page">
      <Link href="/" className="auth-back-link" aria-label="Back to home">
        ← Back
      </Link>

      {/* Brand */}
      <div className="auth-brand">
        <div className="auth-brand-logo" aria-hidden="true">
          §
        </div>
        <span className="auth-brand-name">LegalEase-AI</span>
      </div>

      {/* Auth Card */}
      <div className="auth-card">
        <h1 id="login-heading">Welcome to LegalEase-AI</h1>
        <p className="auth-subtitle">Sign in to upload and understand your legal documents.</p>

        {error && (
          <div className="auth-error" role="alert" aria-live="assertive">
            <span aria-hidden="true">⚠</span> {error}
          </div>
        )}

        <button
          id="google-signin-btn"
          className="google-signin-btn"
          onClick={handleSignIn}
          disabled={signingIn}
          aria-describedby="login-heading"
          aria-busy={signingIn}
        >
          {signingIn ? (
            <span className="spinner" />
          ) : (
            <span className="google-icon" aria-hidden="true">
              G
            </span>
          )}
          {signingIn ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="auth-security">🔒 Your documents are private and stored securely.</p>
        <p className="auth-disclaimer">
          This tool helps you understand documents. It does not provide legal advice.
        </p>
      </div>
    </div>
  );
}
