'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Sidebar from '../../../../components/Sidebar';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { useAuth } from '../../../../lib/auth-context';
import { getAnalysis, analyzeDocument } from '../../../../lib/api-client';
import type { AnalysisDocumentRecord } from '../../../../../../shared/types';
import {
  IconArrowRight,
  IconCheckCircle,
  IconWarning,
  IconDocument,
  IconCompare,
} from '../../../../components/ui/Icons';

interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  section?: string;
  page?: number;
}

function NextStepsContent({ documentId }: { documentId: string }) {
  const { user, token } = useAuth();
  const [record, setRecord] = useState<AnalysisDocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Checklist State
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);

  // Citation Drawer state
  const [selectedCitation, setSelectedCitation] = useState<{
    title: string;
    text: string;
    section?: string;
    page?: number;
  } | null>(null);

  useEffect(() => {
    async function fetchRecord() {
      if (!user || !token) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getAnalysis(token, documentId);
        if (res.data) {
          setRecord(res.data);
        } else {
          const analyzeRes = await analyzeDocument(token, documentId);
          if (analyzeRes.data) setRecord(analyzeRes.data);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [user, token, documentId]);

  const toggleChecklist = (id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyQuestion = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(text);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  if (loading) {
    return (
      <div className="authenticated-layout">
        <Sidebar />
        <main className="authenticated-content" role="main">
          <div className="empty-state" style={{ minHeight: '60vh' }}>
            <div className="loading-spinner-lg" />
            <h2 style={{ marginTop: '16px', fontSize: '20px', fontWeight: 600 }}>
              Loading Actionable Next Steps...
            </h2>
            <p
              style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '400px' }}
            >
              Preparing your personalized action checklist and legal consultation guide.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="authenticated-layout">
        <Sidebar />
        <main className="authenticated-content" role="main">
          <div className="empty-state" style={{ minHeight: '60vh' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
              }}
            >
              !
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-error)' }}>
              Could Not Load Next Steps
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                marginBottom: '24px',
              }}
            >
              {error || 'Document analysis record not found'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/dashboard" className="le-btn le-btn-secondary">
                Back to Dashboard
              </Link>
              <Link href={`/documents/${documentId}`} className="le-btn le-btn-primary">
                View Document Analysis
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { results } = record;

  // Build complete checklist items from guidance and obligations
  const checklistItems: ChecklistItem[] = [
    ...results.guidance.nextSteps.map((step, i) => ({
      id: `step-${i}`,
      title: step,
      category: 'Action Item',
    })),
    ...results.obligations.map((ob) => ({
      id: ob.id,
      title: `${ob.party}: ${ob.duty} ${ob.deadline ? `(Due: ${ob.deadline})` : ''}`,
      category: 'Obligation',
      section: ob.section,
      page: ob.page,
    })),
  ];

  const totalChecklist = checklistItems.length;
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercent =
    totalChecklist > 0 ? Math.round((completedCount / totalChecklist) * 100) : 0;

  // Build lawyer questions list combining guidance questions & risk questions
  const lawyerQuestions = [
    ...results.guidance.lawyerQuestions,
    ...results.risks.map((r) => r.suggestedQuestion).filter(Boolean),
  ];
  // Remove duplicates
  const uniqueLawyerQuestions = Array.from(new Set(lawyerQuestions));

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div
          className="animate-page"
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Header Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}
              >
                <Link
                  href={`/documents/${documentId}`}
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  ← Back to Analysis Report
                </Link>
                <StatusBadge status="complete" />
              </div>
              <h1 className="t-h1">Actionable Next Steps & Guidance</h1>
              <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Review key action items, prepare attorney consultation questions, and track
                requirements.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href={`/compare?doc1=${documentId}`}
                className="le-btn le-btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 38,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: 500,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
              >
                <IconCompare size={16} /> Compare Document
              </Link>
              <Link
                href={`/documents/${documentId}`}
                className="le-btn le-btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 38,
                  padding: '0 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                View Full Analysis <IconArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Educational Disclaimer Banner */}
          <div
            style={{
              background: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }}>
              <IconWarning size={22} />
            </span>
            <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--color-warning)' }}>
                EDUCATIONAL PURPOSE DISCLAIMER:
              </strong>{' '}
              {results.disclaimer}
            </div>
          </div>

          {/* Action Checklist & Progress Card */}
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
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <h2 className="t-h3" style={{ fontSize: 18 }}>
                  ✅ Action Items & Obligation Checklist
                </h2>
                <p
                  className="t-body-sm"
                  style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}
                >
                  Check off tasks as you complete or review them with your team.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'var(--color-background)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span
                  className="t-body-sm"
                  style={{ fontWeight: 600, color: 'var(--color-primary)' }}
                >
                  {completedCount} of {totalChecklist} completed
                </span>
                <div
                  style={{
                    width: 80,
                    height: 8,
                    borderRadius: 999,
                    background: 'var(--color-border)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: 'var(--color-success)',
                      transition: 'width 200ms ease',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {checklistItems.map((item) => {
                const isChecked = !!completedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    style={{
                      background: isChecked ? 'var(--color-background)' : 'var(--color-surface)',
                      border: `1px solid ${isChecked ? 'var(--color-border)' : 'var(--color-border-strong)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by parent div
                      style={{
                        width: 18,
                        height: 18,
                        marginTop: 2,
                        accentColor: 'var(--color-primary)',
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <span
                        className="t-body"
                        style={{
                          fontSize: 14,
                          textDecoration: isChecked ? 'line-through' : 'none',
                          color: isChecked
                            ? 'var(--color-text-muted)'
                            : 'var(--color-text-primary)',
                          lineHeight: 1.5,
                        }}
                      >
                        {item.title}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginTop: 4,
                          fontSize: 12,
                        }}
                      >
                        <span
                          className="t-caption t-mono"
                          style={{
                            background: 'var(--color-primary-light)',
                            color: 'var(--color-primary)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontWeight: 500,
                          }}
                        >
                          {item.category}
                        </span>
                        {item.section && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCitation({
                                title: item.title,
                                text: item.title,
                                section: item.section,
                                page: item.page,
                              });
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-info)',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              padding: 0,
                              fontSize: 12,
                            }}
                          >
                            Source: {item.section}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid: Questions for Legal Professional & Missing Info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {/* Questions to Ask a Lawyer */}
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h2
                className="t-h3"
                style={{ fontSize: 17, marginBottom: 6, color: 'var(--color-warning)' }}
              >
                ⚖️ Questions for Your Attorney Consultation
              </h2>
              <p
                className="t-body-sm"
                style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}
              >
                Prepared questions based on highlighted document risks and clauses. Click to copy.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {uniqueLawyerQuestions.map((question, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                      }}
                    >
                      "{question}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyQuestion(question)}
                        className="le-btn le-btn-secondary"
                        style={{
                          height: 28,
                          padding: '0 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 12,
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-surface)',
                          color:
                            copiedQuestion === question
                              ? 'var(--color-success)'
                              : 'var(--color-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedQuestion === question ? '✓ Copied!' : '📋 Copy Question'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Information & Omissions */}
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h2
                className="t-h3"
                style={{ fontSize: 17, marginBottom: 6, color: 'var(--color-info)' }}
              >
                📋 Information & Document Checklist
              </h2>
              <p
                className="t-body-sm"
                style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}
              >
                Gather these documents and clarifications before signing or negotiating.
              </p>

              {/* Clarifications for Counterparty */}
              <div style={{ marginBottom: 20 }}>
                <h3
                  className="t-h4"
                  style={{ fontSize: 14, marginBottom: 8, color: 'var(--color-text-primary)' }}
                >
                  💬 Counterparty Clarifications
                </h3>
                <ul
                  style={{
                    paddingLeft: 18,
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {results.guidance.clarifications.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 6, lineHeight: 1.5 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Omitted / Missing Details */}
              {results.unpresentInformation && results.unpresentInformation.length > 0 && (
                <div
                  style={{
                    background: 'var(--color-warning-bg)',
                    borderLeft: '4px solid var(--color-warning)',
                    padding: 14,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <h3
                    className="t-h4"
                    style={{ fontSize: 14, marginBottom: 8, color: 'var(--color-warning)' }}
                  >
                    🔍 Missing or Unspecified Information
                  </h3>
                  <ul
                    style={{
                      paddingLeft: 18,
                      margin: 0,
                      fontSize: 13,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {results.unpresentInformation.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: 6, lineHeight: 1.5 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action CTAs */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h3 className="t-h4">Need to ask custom questions?</h3>
              <p
                className="t-body-sm"
                style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}
              >
                Use our Grounded Document Q&amp;A Assistant to ask specific questions about this
                document.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                href={`/documents/${documentId}`}
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
                Open Q&amp;A Assistant <IconArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Grounding Source Citation Slide-Over / Modal */}
        {selectedCitation && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(2px)',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                background: 'var(--color-surface)',
                borderLeft: '1px solid var(--color-border)',
                maxWidth: '500px',
                width: '100%',
                height: '100%',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '12px',
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Source Grounding Citation</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedCitation(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {selectedCitation.title}
                  </span>
                  {selectedCitation.section && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'monospace',
                        marginTop: '4px',
                      }}
                    >
                      Section: {selectedCitation.section}{' '}
                      {selectedCitation.page ? `· Page ${selectedCitation.page}` : ''}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    background: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'var(--color-text-primary)',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}
                >
                  "{selectedCitation.text}"
                </div>
              </div>

              <div
                style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCitation(null)}
                  className="le-btn le-btn-primary"
                  style={{
                    height: 36,
                    padding: '0 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function NextStepsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <ProtectedRoute>
      <NextStepsContent documentId={resolvedParams.id} />
    </ProtectedRoute>
  );
}
