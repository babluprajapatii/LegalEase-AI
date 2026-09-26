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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type FilterStatus = 'all' | 'analyzed' | 'processing' | 'uploaded';

/**
 * Documents list page — matches Figma 04-documents.png / History() in Figma export.
 * All user documents with search, category filter pills, and real Firestore status badges.
 */
function DocumentsContent() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');

  const [deleteDocTarget, setDeleteDocTarget] = useState<DocumentMetadata | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const handleDeleteConfirm = async () => {
    if (!deleteDocTarget || !token) return;
    try {
      setDeleting(true);
      const { deleteDocument } = await import('../../lib/api-client');
      await deleteDocument(token, deleteDocTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteDocTarget.id));
      setFeedback(`Successfully deleted "${deleteDocTarget.filename}".`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete document: ${msg}`);
    } finally {
      setDeleting(false);
      setDeleteDocTarget(null);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'analyzed')
      return (
        matchesSearch &&
        (doc.processingStatus === 'completed' || doc.processingStatus === 'analyzed')
      );
    if (filter === 'processing') return matchesSearch && doc.processingStatus === 'processing';
    if (filter === 'uploaded') return matchesSearch && doc.processingStatus === 'uploaded';
    return matchesSearch;
  });

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div
          className="animate-page"
          style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 24,
            }}
          >
            <div>
              <h1 className="t-h1">All Documents</h1>
              <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
                View, filter, and manage your analyzed legal documents.
              </p>
            </div>
            <Link
              href="/upload"
              className="le-btn le-btn-primary"
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
                textDecoration: 'none',
              }}
            >
              <IconUpload size={18} /> Upload Document
            </Link>
          </div>

          {feedback && (
            <div
              style={{
                background: 'var(--color-success-bg, #e6f4ea)',
                border: '1px solid var(--color-success, #34a853)',
                color: 'var(--color-success, #1e8e3e)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              {feedback}
            </div>
          )}

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 480, marginBottom: 16 }}>
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
              id="all-documents-search"
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

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {(['all', 'analyzed', 'processing', 'uploaded'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="t-body-sm"
                style={{
                  padding: '8px 14px',
                  minHeight: 36,
                  borderRadius: 999,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  border: `1px solid ${filter === f ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: filter === f ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  color: filter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: filter === f ? 600 : 400,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Document List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0, 1, 2, 3].map((i) => (
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
                  <div className="skeleton" style={{ width: '60%', height: 12, marginTop: 10 }} />
                </div>
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
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
                <IconDocument size={48} />
              </div>
              <h3 className="t-h3" style={{ fontSize: 18, marginBottom: 8 }}>
                No documents found
              </h3>
              <p
                className="t-body-sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 380,
                  margin: '0 auto 16px',
                }}
              >
                {searchQuery
                  ? `No documents match “${searchQuery}”. Try adjusting your query.`
                  : 'No documents match the selected filter category.'}
              </p>
              <button
                className="le-btn le-btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
                style={{
                  height: 36,
                  padding: '0 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: 500,
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-primary)',
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredDocs.map((doc) => (
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
                      {formatDate(doc.uploadDate)} · {formatFileSize(doc.size)}
                      {doc.pageCount ? ` · ${doc.pageCount} pages` : ''}
                    </div>
                  </div>
                  <StatusBadge status={doc.processingStatus} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    <button
                      onClick={() => setDeleteDocTarget(doc)}
                      aria-label={`Delete ${doc.filename}`}
                      style={{
                        height: 36,
                        padding: '0 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 13,
                        fontWeight: 500,
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-error, #ea4335)',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteDocTarget && (
        <div
          onClick={() => setDeleteDocTarget(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-elevated)',
              padding: 24,
              width: '100%',
              maxWidth: 480,
            }}
          >
            <h2 className="t-h3" style={{ marginBottom: 12, color: 'var(--color-error, #ea4335)' }}>
              Delete Document?
            </h2>
            <p
              className="t-body-sm"
              style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
            >
              Are you sure you want to delete <strong>"{deleteDocTarget.filename}"</strong>? This
              will permanently remove the file, grounded AI analysis, and Q&amp;A history. This
              action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button
                disabled={deleting}
                onClick={() => setDeleteDocTarget(null)}
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteConfirm}
                style={{
                  height: 36,
                  padding: '0 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-error, #ea4335)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  );
}
