'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { IconDocument, IconGoogle, IconWarning } from '../../components/ui/Icons';

/**
 * Login page — matches Figma 02-login.png / Auth() in Figma export.
 * Centered card with Google OAuth sign-in, handling real Firebase Auth state.
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
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 12 }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div
      className="animate-page"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 24,
        position: 'relative',
        background: 'var(--color-background)',
      }}
    >
      <Link
        href="/"
        className="t-body-sm"
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
        }}
      >
        ← Back
      </Link>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: '#fff',
          }}
        >
          <IconDocument size={20} />
        </span>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>
          LegalEase-AI
        </span>
      </div>

      {/* Auth Card */}
      <div
        style={{
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          padding: 32,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h1 className="t-h2" style={{ marginBottom: 8 }}>
          Welcome to LegalEase-AI
        </h1>
        <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          Sign in to upload and understand your legal documents.
        </p>

        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16,
            }}
          >
            <IconWarning size={16} />
            <span className="t-body-sm">{error}</span>
          </div>
        )}

        <button
          id="google-signin-btn"
          className="le-btn le-btn-primary"
          onClick={handleSignIn}
          disabled={signingIn}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            height: 44,
            borderRadius: 'var(--radius-md)',
            fontSize: 15,
            fontWeight: 600,
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            cursor: signingIn ? 'not-allowed' : 'pointer',
          }}
        >
          {signingIn ? (
            <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} />
          ) : (
            <IconGoogle size={18} />
          )}
          {signingIn ? 'Connecting…' : 'Continue with Google'}
        </button>

        <p className="t-caption" style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>
          Your documents are private and stored securely.
        </p>
        <div style={{ marginTop: 20, textAlign: 'left' }}>
          <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
            This tool helps you understand documents. It does not provide legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
