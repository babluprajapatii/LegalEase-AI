'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth-context';

/**
 * Landing page — matches Figma 01-landing1.png.
 * Top bar with logo + Sign In CTA, hero section with taglines and action buttons.
 */
export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* Top bar */}
      <header className="app-header" role="banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="sidebar-logo"
            aria-hidden="true"
            style={{ width: 32, height: 32, fontSize: 14 }}
          >
            §
          </div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>LegalEase-AI</span>
        </div>
        <nav>
          {user ? (
            <Link href="/dashboard" className="btn-primary" id="go-dashboard">
              Dashboard →
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-secondary"
              id="signin-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  background: '#EA4335',
                  color: '#fff',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                G
              </span>
              Sign In
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '64px 48px',
          maxWidth: 900,
        }}
      >
        <div>
          <p
            style={{
              color: 'var(--color-primary)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Modern Legal Clarity, Responsible AI
          </p>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 24,
              maxWidth: 650,
            }}
          >
            Understand your legal documents without being a legal expert.
          </h1>
          <p
            style={{
              fontSize: 16,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              marginBottom: 32,
              maxWidth: 560,
            }}
          >
            LegalEase-AI reads your contracts, leases, and agreements and explains them in plain
            language — with sources, so you always know where each insight comes from.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href={user ? '/upload' : '/login'} className="btn-primary" id="hero-upload-btn">
              Upload a Document →
            </Link>
            <Link href="#how-it-works" className="btn-secondary" id="hero-learn-btn">
              Learn How It Works
            </Link>
          </div>
          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              color: 'var(--color-text-muted)',
            }}
          >
            ✦ Powered by Google Gemini AI
          </p>
        </div>
      </main>
    </>
  );
}
