'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../lib/auth-context';
import { initiateUpload, uploadToStorage, confirmUpload } from '../../lib/api-client';
import {
  IconUpload,
  IconDocument,
  IconArrowRight,
  IconCheck,
  IconCheckCircle,
  IconWarning,
  IconClose,
} from '../../components/ui/Icons';

/* --------------------------------
   Constants — matches PRD/rules
   -------------------------------- */
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type ProcessingStage = 'uploading' | 'validating' | 'extracting' | 'complete' | 'failed';

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES[file.type]) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx' && ext !== '.txt') {
      return 'Please upload a PDF, DOCX, or TXT file.';
    }
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File exceeds 10 MB limit. Please upload a smaller file.`;
  }
  if (file.size === 0) {
    return 'Document contains no readable text. Try a different file.';
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

/**
 * Upload page — matches Figma 05-upload.png / Upload() in Figma export.
 * Drag-and-drop zone, ready preview state, stage list progress indicators,
 * sample document selector, and real GCS signed-URL upload pipeline.
 */
function UploadContent() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<ProcessingStage | null>(null);
  const [success, setSuccess] = useState(false);
  const [resultDocId, setResultDocId] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    setUploading(false);
    setProgress(0);
    setStage(null);
    setSuccess(false);
    setResultDocId(null);
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      resetState();
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setSelectedFile(file);
    },
    [resetState],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  // Upload pipeline using real GCS signed URL
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !token) return;

    setUploading(true);
    setError(null);
    setStage('uploading');
    setProgress(0);

    try {
      const uploadData = await initiateUpload(
        token,
        selectedFile.name,
        selectedFile.type || 'application/octet-stream',
        selectedFile.size,
      );

      await uploadToStorage(uploadData.signedUploadUrl, selectedFile, (loaded, total) => {
        setProgress(Math.round((loaded / total) * 100));
      });

      setStage('validating');
      setProgress(100);

      const result = await confirmUpload(token, uploadData.documentId);

      if (result.processingStatus === 'failed') {
        setStage('failed');
        setError('Document processing failed. Please try a different file.');
        return;
      }

      setStage('extracting');
      await new Promise((r) => setTimeout(r, 600));

      setStage('complete');
      setSuccess(true);
      setResultDocId(uploadData.documentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
      setStage('failed');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, token]);

  const handleUseSample = useCallback(async () => {
    resetState();
    try {
      const res = await fetch('/samples/sample-lease-agreement.txt');
      if (!res.ok) throw new Error('Could not load sample document');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'Sample_Lease_Agreement_2024.txt', {
        type: 'text/plain',
      });
      handleFileSelect(sampleFile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load sample document';
      setError(message);
    }
  }, [resetState, handleFileSelect]);

  const stageState = (target: ProcessingStage): 'done' | 'active' | 'pending' => {
    if (!stage) return 'pending';
    const stages: ProcessingStage[] = ['uploading', 'validating', 'extracting', 'complete'];
    const currentIdx = stages.indexOf(stage);
    const targetIdx = stages.indexOf(target);

    if (currentIdx > targetIdx || stage === 'complete') return 'done';
    if (currentIdx === targetIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div
          className="animate-page"
          style={{ maxWidth: 'var(--container-reading)', margin: '0 auto', width: '100%' }}
        >
          <Link
            href="/dashboard"
            className="t-body-sm"
            style={{
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            ← Back to Dashboard
          </Link>

          <h1 className="t-h1" style={{ marginBottom: 24 }}>
            Upload Document
          </h1>

          {/* Success card */}
          {success && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <span
                className="t-label"
                style={{
                  color: 'var(--color-success)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IconCheck size={16} /> Document Uploaded Successfully
              </span>
              <p className="t-body" style={{ margin: '16px 0 20px' }}>
                Your file is processed and ready for analysis.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {resultDocId && (
                  <Link
                    href={`/documents/${resultDocId}`}
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
                    View Document Analysis <IconArrowRight size={18} />
                  </Link>
                )}
                <button
                  className="le-btn le-btn-secondary"
                  onClick={resetState}
                  style={{
                    height: 40,
                    padding: '0 18px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14,
                    fontWeight: 600,
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-primary)',
                  }}
                >
                  Upload Another Document
                </button>
              </div>
            </div>
          )}

          {/* Error card */}
          {error && !uploading && !success && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
                marginBottom: 20,
              }}
            >
              <div
                role="alert"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 12,
                }}
              >
                <span style={{ color: 'var(--color-error)' }}>
                  <IconWarning size={40} />
                </span>
                <h3 className="t-h3" style={{ fontSize: 18 }}>
                  Couldn’t use that file
                </h3>
                <p
                  className="t-body-sm"
                  style={{ color: 'var(--color-text-secondary)', maxWidth: 380 }}
                >
                  {error}
                </p>
                <button
                  className="le-btn le-btn-primary"
                  onClick={resetState}
                  style={{
                    height: 40,
                    padding: '0 18px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14,
                    fontWeight: 600,
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  Choose a different file
                </button>
              </div>
            </div>
          )}

          {/* Ready Preview State */}
          {selectedFile && !uploading && !success && !error && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <span
                className="t-label"
                style={{
                  color: 'var(--color-success)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IconCheck size={16} /> Ready to analyze
              </span>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 20px' }}
              >
                <span style={{ color: 'var(--color-secondary)', display: 'flex' }}>
                  <IconDocument size={28} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="t-h4"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {selectedFile.name}
                  </div>
                  <div
                    className="t-caption t-mono"
                    style={{ color: 'var(--color-text-muted)', marginTop: 2 }}
                  >
                    {formatFileSize(selectedFile.size)} · ready
                  </div>
                </div>
                <StatusBadge status="uploaded" />
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  id="upload-btn"
                  className="le-btn le-btn-primary"
                  onClick={handleUpload}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 40,
                    padding: '0 20px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14,
                    fontWeight: 600,
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Analyze document <IconArrowRight size={18} />
                </button>
                <button
                  className="le-btn le-btn-secondary"
                  onClick={resetState}
                  style={{
                    height: 40,
                    padding: '0 18px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14,
                    fontWeight: 600,
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                  }}
                >
                  Choose a different file
                </button>
              </div>
            </div>
          )}

          {/* Uploading progress card */}
          {uploading && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="t-h4" style={{ marginBottom: 16 }}>
                {selectedFile?.name || 'Document'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 999,
                    background: 'var(--color-border)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'var(--color-primary)',
                      transition: 'width 170ms linear',
                    }}
                  />
                </div>
                <span
                  className="t-mono t-body-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                  aria-live="polite"
                >
                  {progress}%
                </span>
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {[
                  { key: 'uploading', label: 'Uploading to secure storage' },
                  { key: 'validating', label: 'Validating file format' },
                  { key: 'extracting', label: 'Extracting text content' },
                  { key: 'complete', label: 'Ready' },
                ].map((s) => {
                  const state = stageState(s.key as ProcessingStage);
                  return (
                    <li key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {state === 'done' && (
                        <span style={{ color: 'var(--color-success)', display: 'flex' }}>
                          <IconCheckCircle size={20} />
                        </span>
                      )}
                      {state === 'active' && <span className="spinner" />}
                      {state === 'pending' && (
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: '2px solid var(--color-border)',
                            display: 'inline-block',
                          }}
                        />
                      )}
                      <span
                        className="t-body"
                        style={{
                          color:
                            state === 'pending'
                              ? 'var(--color-text-muted)'
                              : 'var(--color-text-primary)',
                          fontWeight: state === 'active' ? 600 : 400,
                        }}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Idle Upload Zone */}
          {!selectedFile && !uploading && !success && (
            <>
              <div
                id="upload-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload document drop zone"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                }}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                  background: dragOver ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 48,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <span style={{ color: 'var(--color-secondary)', display: 'inline-flex' }}>
                  <IconUpload size={44} />
                </span>
                <h3 className="t-h3" style={{ margin: '16px 0 6px' }}>
                  Drop your document here
                </h3>
                <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  or click to browse files
                </p>
                <p
                  className="t-caption t-mono"
                  style={{ color: 'var(--color-text-muted)', marginTop: 16 }}
                >
                  Supported: PDF, DOCX, TXT · Max: 10 MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                id="file-input"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                hidden
                onChange={handleInputChange}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                <span className="t-caption" style={{ color: 'var(--color-text-muted)' }}>
                  OR
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              </div>

              <button
                id="sample-doc-btn"
                className="le-btn le-btn-secondary"
                onClick={handleUseSample}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                }}
              >
                Use a sample document
              </button>

              <p
                className="t-body-sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  marginTop: 24,
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <IconCheck size={16} /> Documents are processed securely and stored only for your
                account.
              </p>
              <div style={{ marginTop: 12 }}>
                <p className="t-caption" style={{ color: 'var(--color-text-secondary)' }}>
                  LegalEase-AI provides automated document analysis for educational purposes only.
                  It does not provide legal advice.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadContent />
    </ProtectedRoute>
  );
}
