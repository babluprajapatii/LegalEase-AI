'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../lib/auth-context';
import { listDocuments, compareDocuments } from '../../lib/api-client';
import type { DocumentMetadata } from '../../lib/api';
import { ComparisonRecord } from '../../../../shared/types';
import { IconCompare, IconSparkle, IconArrowRight } from '../../components/ui/Icons';

function CompareContent() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [selectedDocA, setSelectedDocA] = useState<string>('');
  const [selectedDocB, setSelectedDocB] = useState<string>('');

  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      if (!token) {
        setLoadingDocs(false);
        return;
      }
      try {
        const docs = await listDocuments(token);
        setDocuments(docs);
        if (docs.length >= 2) {
          setSelectedDocA(docs[0].id);
          setSelectedDocB(docs[1].id);
        } else if (docs.length === 1) {
          setSelectedDocA(docs[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch documents for comparison:', err);
      } finally {
        setLoadingDocs(false);
      }
    }
    fetchDocuments();
  }, [token]);

  const handleRunComparison = async () => {
    if (!token || !selectedDocA || !selectedDocB) return;
    if (selectedDocA === selectedDocB) {
      setError('Please select two different documents to compare.');
      return;
    }

    try {
      setComparing(true);
      setError(null);
      const res = await compareDocuments(token, selectedDocA, selectedDocB);
      if (res.data) {
        setComparisonResult(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div
          className="animate-page"
          style={{ maxWidth: 'var(--container-analysis)', margin: '0 auto', width: '100%' }}
        >
          <div style={{ marginBottom: 24 }}>
            <h1 className="t-h1">Document Comparison & Versioning</h1>
            <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Compare two document versions side-by-side to detect added, removed, and modified
              clauses with grounded AI analysis.
            </p>
          </div>

          {loadingDocs ? (
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
                At Least 2 Documents Required
              </h3>
              <p
                className="t-body-sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 400,
                  margin: '0 auto 20px',
                }}
              >
                Upload at least two legal documents to unlock automated version-to-version clause
                comparison.
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Document Selector Controls */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                  Select Documents to Compare
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 20,
                    marginBottom: 20,
                  }}
                >
                  {/* Select Doc A */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        marginBottom: 6,
                      }}
                    >
                      Document A (Original / Base)
                    </label>
                    <select
                      value={selectedDocA}
                      onChange={(e) => setSelectedDocA(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-background)',
                        color: 'var(--color-text-primary)',
                        fontSize: 14,
                      }}
                    >
                      {documents.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.filename} ({doc.contentType})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Doc B */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        marginBottom: 6,
                      }}
                    >
                      Document B (New / Revised)
                    </label>
                    <select
                      value={selectedDocB}
                      onChange={(e) => setSelectedDocB(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-background)',
                        color: 'var(--color-text-primary)',
                        fontSize: 14,
                      }}
                    >
                      {documents.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.filename} ({doc.contentType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div
                    style={{
                      background: 'var(--color-error-bg)',
                      border: '1px solid var(--color-error)',
                      color: 'var(--color-error)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  onClick={handleRunComparison}
                  disabled={
                    comparing || !selectedDocA || !selectedDocB || selectedDocA === selectedDocB
                  }
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px 24px', fontSize: 15 }}
                >
                  {comparing
                    ? 'Analyzing Structural & Clause Differences...'
                    : '⚡ Run AI Document Comparison'}
                </button>
              </div>

              {/* Comparison Results Area */}
              {comparisonResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Summary & Metrics */}
                  <div
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 24,
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}
                    >
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
                        <IconSparkle size={13} /> Grounded AI Analysis
                      </span>
                      <span className="t-h4">Comparison Result</span>
                    </div>

                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: 'var(--color-text-primary)',
                        marginBottom: 16,
                      }}
                    >
                      {comparisonResult.results.summary}
                    </p>

                    {/* Diff Counters */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span className="badge badge-success">
                        +{comparisonResult.results.addedCount} Added
                      </span>
                      <span className="badge badge-error">
                        -{comparisonResult.results.removedCount} Removed
                      </span>
                      <span className="badge badge-warning">
                        ▼{comparisonResult.results.modifiedCount} Modified
                      </span>
                    </div>
                  </div>

                  {/* Type Compatibility Warning */}
                  {comparisonResult.results.typeCompatibilityWarning && (
                    <div
                      style={{
                        background: 'var(--color-warning-bg)',
                        border: '1px solid var(--color-warning)',
                        borderRadius: 'var(--radius-md)',
                        padding: 16,
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>⚠️</span>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--color-text-primary)',
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Document Compatibility Warning:</strong>{' '}
                        {comparisonResult.results.typeCompatibilityWarning}
                      </div>
                    </div>
                  )}

                  {/* Clause Differences List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>
                      Detailed Clause & Structural Changes
                    </h3>

                    {comparisonResult.results.differences.map((diff) => (
                      <div
                        key={diff.id}
                        style={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderLeft: `4px solid ${
                            diff.changeType === 'added'
                              ? 'var(--color-success)'
                              : diff.changeType === 'removed'
                                ? 'var(--color-error)'
                                : 'var(--color-warning)'
                          }`,
                          borderRadius: 'var(--radius-lg)',
                          padding: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          boxShadow: 'var(--shadow-card)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h4 style={{ fontSize: 16, fontWeight: 600 }}>{diff.title}</h4>
                          <span
                            className={`badge ${
                              diff.changeType === 'added'
                                ? 'badge-success'
                                : diff.changeType === 'removed'
                                  ? 'badge-error'
                                  : 'badge-warning'
                            }`}
                          >
                            {diff.changeType.toUpperCase()}
                          </span>
                        </div>

                        <p style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
                          {diff.explanation}
                        </p>

                        {(diff.docAText || diff.docBText) && (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                              gap: 12,
                              background: 'var(--color-background)',
                              padding: 12,
                              borderRadius: 'var(--radius-md)',
                              fontSize: 12,
                              fontFamily: 'monospace',
                            }}
                          >
                            {diff.docAText && (
                              <div>
                                <strong style={{ color: 'var(--color-text-secondary)' }}>
                                  Doc A:
                                </strong>{' '}
                                {diff.docAText}
                              </div>
                            )}
                            {diff.docBText && (
                              <div>
                                <strong style={{ color: 'var(--color-text-secondary)' }}>
                                  Doc B:
                                </strong>{' '}
                                {diff.docBText}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Disclaimer */}
                  <p
                    className="t-caption"
                    style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}
                  >
                    {comparisonResult.results.disclaimer}
                  </p>
                </div>
              )}
            </div>
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
