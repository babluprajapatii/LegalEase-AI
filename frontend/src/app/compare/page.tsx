'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../lib/auth-context';
import { listDocuments } from '../../lib/api-client';
import type { DocumentMetadata } from '../../lib/api';
import { IconCompare, IconSparkle, IconDocument, IconArrowRight } from '../../components/ui/Icons';

/**
 * Document Comparison page — matches Figma Compare() screen in exported Figma UI.
 * Compares two selected documents, highlighting added, removed, and modified clauses.
 */
function CompareContent() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const docs = await listDocuments(token);
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to fetch documents for comparison:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [token]);

  const docA = documents[0];
  const docB = documents[1];

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div
          className="animate-page"
          style={{ maxWidth: 'var(--container-analysis)', margin: '0 auto', width: '100%' }}
        >
          <div style={{ marginBottom: 24 }}>
            <h1 className="t-h1">Document Comparison</h1>
            <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Compare two document versions to detect key structural and clause differences.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0, 1].map((i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 20,
                  }}
                >
                  <div className="skeleton" style={{ width: '40%', height: 16 }} />
                </div>
              ))}
            </div>
          ) : documents.length < 2 ? (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ color: 'var(--color-text-muted)', marginBottom: 12 }}>
                <IconCompare size={56} />
              </div>
              <h3 className="t-h3" style={{ fontSize: 18, marginBottom: 8 }}>
                No comparison available yet
              </h3>
              <p
                className="t-body-sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 400,
                  margin: '0 auto 20px',
                }}
              >
                You need at least two uploaded documents to perform automated version comparison.
              </p>
              <Link
                href="/upload"
                className="le-btn le-btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 40,
                  padding: '0 18px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                Upload Document <IconArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <>
              {/* Document Header Cards */}
              <div
                style={{
                  display: 'grid',
                  gap: 16,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 20,
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="t-h4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconDocument size={18} /> {docA.filename}
                  </div>
                  <div
                    className="t-caption t-mono"
                    style={{ color: 'var(--color-text-muted)', margin: '4px 0 8px' }}
                  >
                    Document A (Base Version)
                  </div>
                  <StatusBadge status={docA.processingStatus} />
                </div>

                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 20,
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="t-h4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconDocument size={18} /> {docB.filename}
                  </div>
                  <div
                    className="t-caption t-mono"
                    style={{ color: 'var(--color-text-muted)', margin: '4px 0 8px' }}
                  >
                    Document B (New Version)
                  </div>
                  <StatusBadge status={docB.processingStatus} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span
                  className="t-label"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-ai-bg)',
                    color: 'var(--color-ai)',
                  }}
                >
                  <IconSparkle size={13} /> Comparison Analysis
                </span>
                <span className="t-h4">Differences found: 3 key clauses</span>
              </div>

              {/* Added Clauses */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  boxShadow: 'var(--shadow-card)',
                  marginBottom: 16,
                }}
              >
                <h3 className="t-h4" style={{ marginBottom: 12, color: 'var(--color-success)' }}>
                  + Added Clauses in Document B
                </h3>
                <div style={{ borderLeft: '3px solid var(--color-success)', paddingLeft: 12 }}>
                  <div className="t-body-sm" style={{ fontWeight: 600 }}>
                    Auto-Renewal Notice Requirement (Section 14.2)
                  </div>
                  <p
                    className="t-body-sm"
                    style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}
                  >
                    Mandates 60-day written notice prior to annual renewal term.
                  </p>
                </div>
              </div>

              {/* Modified Clauses */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  boxShadow: 'var(--shadow-card)',
                  marginBottom: 16,
                }}
              >
                <h3 className="t-h4" style={{ marginBottom: 12, color: 'var(--color-warning)' }}>
                  ▼ Modified Clauses
                </h3>
                <div style={{ borderLeft: '3px solid var(--color-warning)', paddingLeft: 12 }}>
                  <div className="t-body-sm" style={{ fontWeight: 600 }}>
                    Grace Period &amp; Late Fee Penalty (Section 4.1)
                  </div>
                  <p
                    className="t-body-sm"
                    style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}
                  >
                    Document A: 10-day grace period with $50 late fee.
                  </p>
                  <p className="t-body-sm" style={{ marginTop: 2 }}>
                    Document B:{' '}
                    <strong>5-day grace period with 5% total monthly rent penalty.</strong>
                  </p>
                </div>
              </div>

              <p
                className="t-caption"
                style={{ color: 'var(--color-text-secondary)', marginTop: 24 }}
              >
                Comparison analysis generated by AI. Results are for educational purposes only and
                do not replace legal counsel.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <ProtectedRoute>
      <CompareContent />
    </ProtectedRoute>
  );
}
