'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import {
  IconDocument,
  IconUpload,
  IconSparkle,
  IconCompare,
  IconChat,
  IconArrowRight,
  IconGoogle,
} from '../components/ui/Icons';

/**
 * Landing page — matches Figma 01-landing1.png / Landing() in Figma export.
 * Header with logo + Sign In CTA, split Hero section with preview graphic,
 * 4 capability cards, private security banner, and general legal disclaimer footer.
 */
export default function Home() {
  const { user } = useAuth();

  const capabilities = [
    {
      icon: <IconUpload size={22} />,
      title: 'Upload',
      text: 'Add a PDF, DOCX, or TXT document securely.',
    },
    {
      icon: <IconSparkle size={22} />,
      title: 'Analyze',
      text: 'Get a plain-language summary and key clauses.',
    },
    {
      icon: <IconCompare size={22} />,
      title: 'Compare',
      text: 'See meaningful differences between two documents.',
    },
    {
      icon: <IconChat size={22} />,
      title: 'Q&A',
      text: 'Ask questions and get answers grounded in your document.',
    },
  ];

  return (
    <div
      className="animate-page"
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px clamp(16px, 4vw, 48px)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
        }}
      >
        <Logo />
        <nav>
          {user ? (
            <Link
              href="/dashboard"
              className="le-btn le-btn-primary"
              id="go-dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 40,
                padding: '0 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 600,
                background: 'var(--color-primary)',
                color: '#fff',
              }}
            >
              Dashboard <IconArrowRight size={16} />
            </Link>
          ) : (
            <Link
              href="/login"
              className="le-btn le-btn-secondary"
              id="signin-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 36,
                padding: '0 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-primary)',
              }}
            >
              <IconGoogle size={16} />
              Sign In
            </Link>
          )}
        </nav>
      </header>

      <main id="main" style={{ flex: 1 }}>
        {/* Hero Section */}
        <section
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px)',
            display: 'grid',
            gap: 48,
            gridTemplateColumns: 'minmax(0,1fr)',
            alignItems: 'center',
          }}
          className="landing-hero"
        >
          <div style={{ maxWidth: 620 }}>
            <span className="t-label" style={{ color: 'var(--color-secondary)' }}>
              Modern legal clarity, responsible AI
            </span>
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                margin: '12px 0 16px',
              }}
            >
              Understand your legal documents without being a legal expert.
            </h1>
            <p
              className="t-body-lg"
              style={{ color: 'var(--color-text-secondary)', maxWidth: 540 }}
            >
              LegalEase-AI reads your contracts, leases, and agreements and explains them in plain
              language — with sources, so you always know where each insight comes from.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
              <Link
                href={user ? '/upload' : '/login'}
                id="hero-upload-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 44,
                  padding: '0 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  fontWeight: 600,
                  background: 'var(--color-primary)',
                  color: '#fff',
                }}
              >
                Upload a Document <IconArrowRight size={18} />
              </Link>
              <a
                href="#how"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 44,
                  padding: '0 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-primary)',
                }}
              >
                Learn How It Works
              </a>
            </div>
            <p
              className="t-caption"
              style={{
                color: 'var(--color-text-muted)',
                marginTop: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <IconSparkle size={14} /> Powered by Google Gemini AI
            </p>
          </div>

          <HeroGraphic />
        </section>

        {/* How it works */}
        <section
          id="how"
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: '0 clamp(16px, 4vw, 48px) 64px',
          }}
        >
          <h2 className="t-h2" style={{ marginBottom: 24 }}>
            How it works
          </h2>
          <div
            style={{
              display: 'grid',
              gap: 24,
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            {capabilities.map((c) => (
              <div
                key={c.title}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-primary)',
                    display: 'inline-flex',
                    padding: 10,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-light)',
                  }}
                >
                  {c.icon}
                </span>
                <h3 className="t-h3" style={{ margin: '16px 0 8px' }}>
                  {c.title}
                </h3>
                <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Section */}
        <section
          style={{
            background: 'var(--color-primary-light)',
            padding: '48px clamp(16px, 4vw, 48px)',
          }}
        >
          <div
            style={{ maxWidth: 'var(--container-reading)', margin: '0 auto', textAlign: 'center' }}
          >
            <h2 className="t-h2">Private and secure by design</h2>
            <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginTop: 12 }}>
              Your documents are stored securely in your account and processed only for analysis
              purposes. They are not shared with third parties.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '32px clamp(16px, 4vw, 48px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--color-surface)',
        }}
      >
        <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
          LegalEase-AI provides automated legal document analysis for educational and informational
          purposes only. It is not a substitute for professional legal advice from a licensed
          attorney.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Logo small />
          <p className="t-caption" style={{ color: 'var(--color-text-muted)' }}>
            LegalEase-AI helps you understand legal documents. It does not replace a lawyer.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Logo({ small }: { small?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: small ? 28 : 34,
          height: small ? 28 : 34,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary)',
          color: '#fff',
        }}
      >
        <IconDocument size={small ? 16 : 20} />
      </span>
      <span style={{ fontWeight: 700, fontSize: small ? 15 : 18, letterSpacing: '-0.01em' }}>
        LegalEase-AI
      </span>
    </div>
  );
}

function HeroGraphic() {
  return (
    <div aria-hidden style={{ position: 'relative', minHeight: 240 }}>
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <IconDocument size={18} />
          <span className="t-body-sm" style={{ fontWeight: 600 }}>
            Lease_Agreement.pdf
          </span>
          <span
            className="t-caption"
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              fontWeight: 600,
            }}
          >
            Analyzed
          </span>
        </div>
        {[92, 78, 85, 60].map((w, i) => (
          <div
            key={i}
            style={{
              height: 8,
              width: `${w}%`,
              borderRadius: 4,
              background: 'var(--color-primary-light)',
              marginBottom: 10,
            }}
          />
        ))}
        <div
          style={{
            marginTop: 16,
            background: 'var(--color-ai-bg)',
            borderLeft: '3px solid var(--color-ai)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
          }}
        >
          <span className="t-body-sm">
            This is a 12-month lease with an auto-renewal clause.{' '}
            <span style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>
              Section 12.3 · Page 11
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
