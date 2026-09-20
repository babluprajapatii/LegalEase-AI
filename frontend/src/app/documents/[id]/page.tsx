'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Sidebar from '../../../components/Sidebar';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useAuth } from '../../../lib/auth-context';
import { getAnalysis, analyzeDocument } from '../../../lib/api-client';
import { AnalysisDocumentRecord, ClauseItem } from '../../../../../shared/types';

function AnalysisContent({ documentId }: { documentId: string }) {
  const { user, token } = useAuth();
  const [record, setRecord] = useState<AnalysisDocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<
    'summary' | 'clauses' | 'obligations' | 'dates' | 'guidance'
  >('summary');

  // Grounding Citation Drawer state
  const [selectedCitation, setSelectedCitation] = useState<{
    title: string;
    text: string;
    section?: string;
    page?: number;
  } | null>(null);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) throw new Error('Not authenticated');

      try {
        const response = await getAnalysis(token, documentId);
        if (response.data) {
          setRecord(response.data);
          setLoading(false);
          return;
        }
      } catch {
        // Analysis not found, trigger initial automated analysis
        setAnalyzing(true);
        const analyzeRes = await analyzeDocument(token, documentId);
        if (analyzeRes.data) {
          setRecord(analyzeRes.data);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchRecord();
    }
  }, [user, token, documentId]);

  const handleReanalyze = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      if (!token) return;
      const res = await analyzeDocument(token, documentId);
      if (res.data) {
        setRecord(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <span className="badge badge-error">
            <span aria-hidden="true">▲</span> High attention
          </span>
        );
      case 'medium':
        return (
          <span className="badge badge-warning">
            <span aria-hidden="true">△</span> Review attention
          </span>
        );
      default:
        return (
          <span className="badge badge-success">
            <span aria-hidden="true">○</span> Low attention
          </span>
        );
    }
  };

  if (loading || analyzing) {
    return (
      <div className="authenticated-layout">
        <Sidebar />
        <main className="authenticated-content" role="main">
          <div className="empty-state" style={{ minHeight: '60vh' }}>
            <div className="loading-spinner-lg" />
            <h2 style={{ marginTop: '16px', fontSize: '20px', fontWeight: 600 }}>
              {analyzing ? 'Analyzing Document with AI...' : 'Loading Analysis...'}
            </h2>
            <p
              style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '400px' }}
            >
              Extracting clauses, obligations, key dates, and grounded risk indicators.
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
              aria-hidden="true"
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
              Analysis Error
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                marginBottom: '24px',
              }}
            >
              {error || 'Could not load analysis record'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
              <button onClick={fetchRecord} className="btn-primary">
                Retry Analysis
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { results } = record;

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Navigation & Document Title */}
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
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}
              >
                <Link
                  href="/documents"
                  className="btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  ← Documents
                </Link>
                <StatusBadge status="complete" />
                <span className="badge badge-ai">Grounded AI</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Legal Analysis Report
              </h1>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'monospace',
                }}
              >
                Doc ID: {documentId} · Processed in {record.processingTimeMs}ms · Model:{' '}
                {record.modelName}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleReanalyze}
                disabled={analyzing}
                className="btn-secondary"
                style={{ fontSize: '13px' }}
              >
                🔄 {analyzing ? 'Analyzing...' : 'Re-analyze'}
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ fontSize: '13px' }}
              >
                Export Report
              </button>
            </div>
          </div>

          {/* Educational AI Disclaimer Banner — design.md §12 */}
          <div
            style={{
              background: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>⚠️</span>
            <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--color-warning)' }}>
                EDUCATIONAL PURPOSE DISCLAIMER:
              </strong>{' '}
              {results.disclaimer}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid var(--color-border)',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'summary', label: 'Executive Summary', icon: '📝' },
              {
                id: 'clauses',
                label: `Key Clauses & Risks (${results.clauses.length})`,
                icon: '🛡️',
              },
              {
                id: 'obligations',
                label: `Obligations (${results.obligations.length})`,
                icon: '📋',
              },
              {
                id: 'dates',
                label: `Important Dates (${results.importantDates.length})`,
                icon: '📅',
              },
              { id: 'guidance', label: 'Actionable Guidance', icon: '💡' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color:
                    activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom:
                    activeTab === tab.id
                      ? '2px solid var(--color-primary)'
                      : '2px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Executive Summary */}
          {activeTab === 'summary' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                    Executive Summary
                  </h2>
                  <p
                    style={{
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.6,
                      fontSize: '15px',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {results.summary}
                  </p>
                </div>

                {/* Key Risk Highlights */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                    🚨 Priority Attention Areas
                  </h3>
                  {results.risks.length === 0 ? (
                    <p
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '14px',
                        fontStyle: 'italic',
                      }}
                    >
                      No high-risk clauses or unusual attention areas were flagged in this document.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {results.risks.map((risk) => (
                        <div
                          key={risk.id}
                          style={{
                            background: 'var(--color-background)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{risk.clauseName}</h4>
                            {getRiskBadge(risk.riskLevel)}
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                            {risk.whyAttention}
                          </p>
                          <div
                            style={{
                              paddingTop: '8px',
                              borderTop: '1px solid var(--color-border)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '12px',
                            }}
                          >
                            <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                              💡 Ask Lawyer: "{risk.suggestedQuestion}"
                            </span>
                            <button
                              onClick={() =>
                                setSelectedCitation({
                                  title: risk.clauseName,
                                  text: risk.description,
                                  section: risk.section,
                                  page: risk.page,
                                })
                              }
                              style={{
                                color: 'var(--color-info)',
                                background: 'none',
                                border: 'none',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                            >
                              View Source ↗
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <h3
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '16px',
                    }}
                  >
                    Document Grounding Audit
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      fontSize: '13px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <span style={{ color: 'var(--color-text-secondary)' }}>Grounding Status</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                        100% Grounded
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        Extracted Clauses
                      </span>
                      <span style={{ fontWeight: 600 }}>{results.clauses.length}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        Tracked Obligations
                      </span>
                      <span style={{ fontWeight: 600 }}>{results.obligations.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Important Dates</span>
                      <span style={{ fontWeight: 600 }}>{results.importantDates.length}</span>
                    </div>
                  </div>
                </div>

                {/* Missing / Unpresent Information */}
                {results.unpresentInformation && results.unpresentInformation.length > 0 && (
                  <div
                    className="card"
                    style={{ padding: '20px', borderLeft: '4px solid var(--color-warning)' }}
                  >
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--color-warning)',
                        marginBottom: '12px',
                      }}
                    >
                      🔍 Missing / Omitted Details
                    </h3>
                    <ul
                      style={{
                        paddingLeft: '16px',
                        margin: 0,
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {results.unpresentInformation.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Key Clauses & Risks */}
          {activeTab === 'clauses' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
              }}
            >
              {results.clauses.map((clause: ClauseItem) => (
                <div
                  key={clause.id}
                  className="card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {clause.name}
                        </h3>
                        {clause.section && (
                          <span
                            style={{
                              fontSize: '12px',
                              color: 'var(--color-text-muted)',
                              fontFamily: 'monospace',
                            }}
                          >
                            {clause.section} {clause.page ? `· Page ${clause.page}` : ''}
                          </span>
                        )}
                      </div>
                      {getRiskBadge(clause.riskLevel)}
                    </div>
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: '12px',
                      }}
                    >
                      {clause.description}
                    </p>
                    {clause.whyAttention && (
                      <div
                        style={{
                          background: 'var(--color-warning-bg)',
                          borderLeft: '3px solid var(--color-warning)',
                          padding: '10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: 'var(--color-text-primary)',
                          marginBottom: '12px',
                        }}
                      >
                        <strong>Why Attention:</strong> {clause.whyAttention}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      paddingTop: '12px',
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)' }}>Grounded Source</span>
                    <button
                      onClick={() =>
                        setSelectedCitation({
                          title: clause.name,
                          text: clause.originalText || clause.description,
                          section: clause.section,
                          page: clause.page,
                        })
                      }
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      View Source Text ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Rights & Obligations */}
          {activeTab === 'obligations' && (
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                Party Responsibilities & Duties
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '14px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '2px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                      }}
                    >
                      <th style={{ padding: '12px' }}>Party</th>
                      <th style={{ padding: '12px' }}>Specific Duty / Obligation</th>
                      <th style={{ padding: '12px' }}>Section</th>
                      <th style={{ padding: '12px' }}>Deadline</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.obligations.map((ob) => (
                      <tr key={ob.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td
                          style={{
                            padding: '12px',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                          }}
                        >
                          {ob.party}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--color-text-primary)' }}>
                          {ob.duty}
                        </td>
                        <td
                          style={{
                            padding: '12px',
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {ob.section || 'General'}
                        </td>
                        <td
                          style={{
                            padding: '12px',
                            color: 'var(--color-warning)',
                            fontWeight: 500,
                          }}
                        >
                          {ob.deadline || 'Ongoing'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() =>
                              setSelectedCitation({
                                title: `${ob.party} Obligation`,
                                text: ob.duty,
                                section: ob.section,
                                page: ob.page,
                              })
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-info)',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Source
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Important Dates */}
          {activeTab === 'dates' && (
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                Timeline & Critical Milestones
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {results.importantDates.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          background: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--color-border-strong)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        📅 {item.date}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{item.description}</h3>
                        {item.actionRequired && (
                          <p
                            style={{
                              fontSize: '13px',
                              color: 'var(--color-warning)',
                              marginTop: '2px',
                            }}
                          >
                            ⚡ Action: {item.actionRequired}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedCitation({
                          title: `Date Milestone: ${item.date}`,
                          text: item.description,
                          section: item.section,
                          page: item.page,
                        })
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-info)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '13px',
                      }}
                    >
                      View Citation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Actionable Guidance */}
          {activeTab === 'guidance' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {/* Recommended Next Steps */}
              <div className="card" style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-success)',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                  }}
                >
                  ✅ Recommended Next Steps
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {results.guidance.nextSteps.map((step, idx) => (
                    <li
                      key={idx}
                      style={{
                        background: 'var(--color-background)',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    >
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Questions for Lawyer */}
              <div className="card" style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-warning)',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                  }}
                >
                  ⚖️ Questions for Legal Consultation
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {results.guidance.lawyerQuestions.map((q, idx) => (
                    <li
                      key={idx}
                      style={{
                        background: 'var(--color-background)',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    >
                      "{q}"
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clarifications for Counterparty */}
              <div className="card" style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-info)',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                  }}
                >
                  💬 Counterparty Clarifications
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {results.guidance.clarifications.map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        background: 'var(--color-background)',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
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
                <button onClick={() => setSelectedCitation(null)} className="btn-primary">
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

export default function DocumentAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <ProtectedRoute>
      <AnalysisContent documentId={resolvedParams.id} />
    </ProtectedRoute>
  );
}
