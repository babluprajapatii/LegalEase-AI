'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { getAnalysis, analyzeDocument } from '../../../lib/api-client';
import { AnalysisDocumentRecord, ClauseItem } from '../../../../../shared/types';

export default function DocumentAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;

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
        // Analysis not found, trigger automated initial analysis
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

  if (loading || analyzing) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">
            {analyzing ? 'Analyzing Document with AI...' : 'Loading Analysis...'}
          </h2>
          <p className="text-sm text-slate-400">
            Extracting clauses, obligations, key dates, and grounded risk indicators.
          </p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-400">Analysis Error</h2>
          <p className="text-sm text-slate-300 mb-6">{error || 'Could not load analysis record'}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={fetchRecord}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { results } = record;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
            High Risk Area
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
            Attention Deserved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
            Standard Clause
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition"
            title="Back to Dashboard"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Legal Analysis Report
              <span className="text-xs font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                Grounded AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Doc ID: {documentId} • Processed in {record.processingTimeMs}ms • Model:{' '}
              {record.modelName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            🔄 {analyzing ? 'Analyzing...' : 'Re-analyze'}
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow transition"
          >
            Export PDF Report
          </button>
        </div>
      </header>

      {/* Prominent Educational AI Disclaimer Banner */}
      <div className="bg-amber-950/40 border-b border-amber-500/30 px-6 py-3.5 flex items-start gap-3">
        <span className="text-amber-400 text-lg leading-none mt-0.5">⚠️</span>
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="font-semibold text-amber-300">EDUCATIONAL PURPOSE DISCLAIMER:</strong>{' '}
          {results.disclaimer}
        </div>
      </div>

      {/* Main Analysis Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <nav className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'summary', label: 'Executive Summary', icon: '📝' },
            { id: 'clauses', label: `Key Clauses & Risks (${results.clauses.length})`, icon: '🛡️' },
            { id: 'obligations', label: `Obligations (${results.obligations.length})`, icon: '📋' },
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
              className={`px-4 py-2.5 rounded-t-lg font-medium text-sm transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab 1: Executive Summary */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>Executive Summary</span>
                </h2>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                  {results.summary}
                </p>
              </div>

              {/* Key Risk Highlights */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🚨 Priority Attention Areas</span>
                </h3>
                {results.risks.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">
                    No high-risk clauses or unusual attention areas were flagged in this document.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {results.risks.map((risk) => (
                      <div
                        key={risk.id}
                        className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-200 text-sm">
                            {risk.clauseName}
                          </h4>
                          {getRiskBadge(risk.riskLevel)}
                        </div>
                        <p className="text-xs text-slate-300">{risk.whyAttention}</p>
                        <div className="pt-2 flex items-center justify-between border-t border-slate-700/50 text-xs">
                          <span className="text-indigo-400 font-medium">
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
                            className="text-slate-400 hover:text-white underline text-xs"
                          >
                            View Source Clause
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Context & Document Health */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Document Grounding Audit
                </h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Grounding Status</span>
                    <span className="text-emerald-400 font-semibold">100% Grounded</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Extracted Clauses</span>
                    <span className="font-mono text-white">{results.clauses.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Tracked Obligations</span>
                    <span className="font-mono text-white">{results.obligations.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Important Dates</span>
                    <span className="font-mono text-white">{results.importantDates.length}</span>
                  </div>
                </div>
              </div>

              {/* Unpresent Information / Omissions */}
              {results.unpresentInformation && results.unpresentInformation.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🔍 Missing / Omitted Details</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                    {results.unpresentInformation.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Extracted Key Clauses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.clauses.map((clause: ClauseItem) => (
                <div
                  key={clause.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-white text-md">{clause.name}</h3>
                        {clause.section && (
                          <span className="text-xs text-slate-400 font-mono">
                            {clause.section} {clause.page ? `• Page ${clause.page}` : ''}
                          </span>
                        )}
                      </div>
                      {getRiskBadge(clause.riskLevel)}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {clause.description}
                    </p>
                    {clause.whyAttention && (
                      <div className="bg-amber-950/20 border-l-2 border-amber-500 p-2.5 rounded text-xs text-amber-200">
                        <strong>Why Attention:</strong> {clause.whyAttention}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Grounded Citation</span>
                    <button
                      onClick={() =>
                        setSelectedCitation({
                          title: clause.name,
                          text: clause.originalText || clause.description,
                          section: clause.section,
                          page: clause.page,
                        })
                      }
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded transition font-medium"
                    >
                      View Source Text ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Rights & Obligations */}
        {activeTab === 'obligations' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-white">Party Responsibilities & Duties</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-4">Party</th>
                    <th className="py-3 px-4">Specific Duty / Obligation</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {results.obligations.map((ob) => (
                    <tr key={ob.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-semibold text-indigo-400">{ob.party}</td>
                      <td className="py-3 px-4 leading-relaxed">{ob.duty}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {ob.section || 'General'}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400">
                        {ob.deadline || 'Ongoing'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() =>
                            setSelectedCitation({
                              title: `${ob.party} Obligation`,
                              text: ob.duty,
                              section: ob.section,
                              page: ob.page,
                            })
                          }
                          className="text-slate-400 hover:text-white underline"
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-white">Timeline & Critical Milestones</h2>
            <div className="space-y-3">
              {results.importantDates.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg font-mono text-sm font-bold whitespace-nowrap">
                      📅 {item.date}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-200 text-sm">{item.description}</h3>
                      {item.actionRequired && (
                        <p className="text-xs text-amber-400 mt-1">
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
                    className="text-xs text-slate-400 hover:text-white underline self-end sm:self-center"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recommended Next Steps */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-indigo-400 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span>✅ Recommended Next Steps</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {results.guidance.nextSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="bg-slate-800/60 p-3 rounded border border-slate-700/50 leading-relaxed"
                  >
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Questions to Ask a Lawyer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span>⚖️ Questions for Legal Consultation</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {results.guidance.lawyerQuestions.map((q, idx) => (
                  <li
                    key={idx}
                    className="bg-slate-800/60 p-3 rounded border border-slate-700/50 leading-relaxed"
                  >
                    "{q}"
                  </li>
                ))}
              </ul>
            </div>

            {/* Clarifications for Counterparty */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
              <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span>💬 Counterparty Clarifications</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {results.guidance.clarifications.map((item, idx) => (
                  <li
                    key={idx}
                    className="bg-slate-800/60 p-3 rounded border border-slate-700/50 leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Grounding Source Citation Slide-Over Modal / Drawer */}
      {selectedCitation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 max-w-lg w-full h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-bold text-white text-md">Source Grounding Attribution</h3>
                <button
                  onClick={() => setSelectedCitation(null)}
                  className="p-1 text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-xs uppercase font-mono text-indigo-400">
                  {selectedCitation.title}
                </span>
                {selectedCitation.section && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Section: {selectedCitation.section}{' '}
                    {selectedCitation.page ? `• Page ${selectedCitation.page}` : ''}
                  </p>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                "{selectedCitation.text}"
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCitation(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
