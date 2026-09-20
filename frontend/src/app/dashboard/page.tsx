'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../lib/auth-context';
import { listDocuments } from '../../lib/api-client';
import type { DocumentMetadata } from '../../lib/api';
import {
  IconUpload,
  IconCompare,
  IconDocument,
  IconSearch,
  IconArrowRight,
  IconClose,
} from '../../components/ui/Icons';

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Dashboard page — matches Figma 03-dashboard1.png / Dashboard() in Figma export.
 * Welcome greeting, quick action tiles (Upload / Compare),
 * recent documents list with real Firestore documents and status badges.
 */
function DashboardContent() {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

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
        console.error('Failed to fetch documents:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [token]);

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div
          className="animate-page"
          style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}
        >
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 className="t-h1">Welcome back, {displayName} 👋</h1>
            <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Your document workspace.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              marginBottom: 32,
            }}
          >
            <Link
              href="/upload"
              id="quick-upload"
              className="le-quick"
              style={{
                textAlign: 'left',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color var(--transition-normal)',
              }}
            >
              <span
                style={{
                  color: 'var(--color-primary)',
                  display: 'inline-flex',
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary-light)',
                }}
              >
                <IconUpload size={22} />
              </span>
              <span>
                <span className="t-h4" style={{ display: 'block' }}>
                  Upload Document
                </span>
                <span className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Add a new legal document
                </span>
              </span>
              <IconArrowRight
                size={18}
                style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}
              />
            </Link>

            <Link
              href="/compare"
              id="quick-compare"
              className="le-quick"
              style={{
                textAlign: 'left',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color var(--transition-normal)',
              }}
            >
              <span
                style={{
                  color: 'var(--color-primary)',
                  display: 'inline-flex',
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary-light)',
                }}
              >
                <IconCompare size={22} />
              </span>
              <span>
                <span className="t-h4" style={{ display: 'block' }}>
                  Compare Documents
                </span>
                <span className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Find differences between two files
                </span>
              </span>
              <IconArrowRight
                size={18}
                style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}
              />
            </Link>
          </div>

          {/* Recent Documents Section */}
          {documents.length === 0 && !loading ? (
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
                <IconDocument size={56} />
              </div>
              <h3 className="t-h3" style={{ fontSize: 18, marginBottom: 8 }}>
                No documents yet
              </h3>
              <p
                className="t-body-sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 380,
                  margin: '0 auto 20px',
                }}
              >
                Upload your first legal document to get started. Supports PDF, DOCX, and TXT files
                (max 10 MB).
              </p>
              <Link
                href="/upload"
                id="upload-first-doc"
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  marginBottom: 12,
                  flexWrap: 'wrap',
                }}
              >
                <h2 className="t-h3">Recent Documents</h2>
                <Link
                  href="/documents"
                  className="t-body-sm"
                  style={{
                    color: 'var(--color-info)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  View All <IconArrowRight size={16} />
                </Link>
              </div>

              <div style={{ position: 'relative', maxWidth: 420, marginBottom: 16 }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                  }}
                >
                  <IconSearch size={18} />
                </span>
                <input
                  type="search"
                  id="document-search"
                  aria-label="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  style={{
                    height: 44,
                    width: '100%',
                    padding: '0 40px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 16,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                {searchQuery && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      padding: 4,
                    }}
                  >
                    <IconClose size={18} />
                  </button>
                )}
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[0, 1, 2].map((i) => (
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
                      <div
                        className="skeleton"
                        style={{ width: '60%', height: 12, marginTop: 10 }}
                      />
                    </div>
                  ))}
                </div>
              ) : filteredDocs.length === 0 ? (
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 40,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    <IconSearch size={40} />
                  </div>
                  <h3 className="t-h4">No results found</h3>
                  <p
                    className="t-body-sm"
                    style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}
                  >
                    No documents match “{searchQuery}”.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredDocs.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px 20px',
                        boxShadow: 'var(--shadow-card)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ color: 'var(--color-secondary)', display: 'flex' }}>
                        <IconDocument size={24} />
                      </span>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div className="t-h4">{doc.filename}</div>
                        <div
                          className="t-caption t-mono"
                          style={{ color: 'var(--color-text-muted)', marginTop: 4 }}
                        >
                          {formatDate(doc.uploadDate)}
                          {doc.pageCount ? ` · ${doc.pageCount} pages` : ''}
                        </div>
                      </div>
                      <StatusBadge status={doc.processingStatus} />
                      <Link
                        href={`/documents/${doc.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          height: 36,
                          padding: '0 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 14,
                          fontWeight: 500,
                          border: '1px solid var(--color-border)',
                          background: 'transparent',
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                        }}
                      >
                        View <IconArrowRight size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Legal Disclaimer Footer */}
          <div style={{ marginTop: 32 }}>
            <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
              LegalEase-AI provides automated legal document analysis for educational purposes only
              and does not provide legal advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
