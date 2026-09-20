'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../lib/auth-context';
import { initiateUpload, uploadToStorage, confirmUpload } from '../../lib/api-client';

/* --------------------------------
   Constants — matches PRD/rules
   -------------------------------- */
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/* --------------------------------
   Processing stage display
   -------------------------------- */
type ProcessingStage = 'uploading' | 'validating' | 'extracting' | 'complete' | 'failed';

const STAGES: { key: ProcessingStage; label: string }[] = [
  { key: 'uploading', label: 'Uploading to secure storage' },
  { key: 'validating', label: 'Validating document integrity' },
  { key: 'extracting', label: 'Extracting text content' },
  { key: 'complete', label: 'Processing complete' },
];

function getStageState(
  currentStage: ProcessingStage,
  stage: ProcessingStage,
): 'completed' | 'in-progress' | 'pending' {
  const order: ProcessingStage[] = ['uploading', 'validating', 'extracting', 'complete'];
  const currentIdx = order.indexOf(currentStage);
  const stageIdx = order.indexOf(stage);
  if (stageIdx < currentIdx) return 'completed';
  if (stageIdx === currentIdx) return 'in-progress';
  return 'pending';
}

/* --------------------------------
   File validation — client-side
   -------------------------------- */
function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES[file.type]) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.txt') {
      // Allow by extension if MIME is not perfectly matched
    } else {
      return 'Invalid file type. Supported: PDF, DOCX, TXT';
    }
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 10 MB limit.`;
  }
  if (file.size === 0) {
    return 'File is empty (0 bytes).';
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Upload page — matches Figma 05-upload.png.
 * Drag-and-drop zone, file picker, client-side validation,
 * upload progress bar, processing stages, success/error states.
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

  // Handle file selection
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

  // Drag-and-drop handlers
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

  // Upload pipeline
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !token) return;

    setUploading(true);
    setError(null);
    setStage('uploading');

    try {
      // Step 1: Initiate upload — get signed URL
      const uploadData = await initiateUpload(
        token,
        selectedFile.name,
        selectedFile.type || 'application/octet-stream',
        selectedFile.size,
      );

      // Step 2: Upload to GCS via signed URL
      await uploadToStorage(uploadData.signedUploadUrl, selectedFile, (loaded, total) => {
        setProgress(Math.round((loaded / total) * 100));
      });

      // Step 3: Confirm + trigger processing
      setStage('validating');
      setProgress(100);

      const result = await confirmUpload(token, uploadData.documentId);

      if (result.processingStatus === 'failed') {
        setStage('failed');
        setError('Document processing failed. Please try a different file.');
        return;
      }

      setStage('extracting');

      // Brief delay for UX — then show complete
      await new Promise((r) => setTimeout(r, 800));
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

  // Handle sample document selection — uses real safe sample file
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

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div className="upload-page">
          {/* Back link */}
          <Link href="/dashboard" className="upload-back-link">
            ← Back to Dashboard
          </Link>

          <h1>Upload Document</h1>

          {/* Success state */}
          {success && (
            <div className="upload-success" role="status">
              <span aria-hidden="true">✅</span>
              <span>
                Document uploaded and processed successfully!{' '}
                {resultDocId && <Link href={`/documents/${resultDocId}`}>View document →</Link>}
              </span>
            </div>
          )}

          {/* Error state */}
          {error && !uploading && (
            <div className="upload-error" role="alert" aria-live="assertive">
              <span className="upload-error-icon" aria-hidden="true">
                ⚠
              </span>
              <div className="upload-error-text">
                {error}
                <div className="upload-error-actions">
                  <button className="btn-secondary" onClick={resetState}>
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload zone — drag-and-drop + click */}
          {!success && !uploading && (
            <>
              <div
                id="upload-zone"
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Drop your document here or click to browse files"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div className="upload-zone-icon" aria-hidden="true">
                  ⬆
                </div>
                <h3>Drop your document here</h3>
                <p>or click to browse files</p>
                <span className="file-types">Supported: PDF, DOCX, TXT · Max: 10 MB</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="upload-input"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleInputChange}
                aria-label="Select document file"
                id="file-input"
              />

              {/* Selected file preview */}
              {selectedFile && !error && (
                <div className="selected-file">
                  <div className="selected-file-info">
                    <span aria-hidden="true">📄</span>
                    <span className="selected-file-name">{selectedFile.name}</span>
                    <span className="selected-file-size">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                  <button
                    className="selected-file-remove"
                    onClick={resetState}
                    aria-label="Remove selected file"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Upload button */}
              {selectedFile && !error && (
                <button
                  id="upload-btn"
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '14px',
                    marginBottom: '24px',
                  }}
                >
                  Upload Document
                </button>
              )}

              {/* OR divider + sample */}
              {!selectedFile && (
                <>
                  <div className="upload-divider">OR</div>
                  <button className="sample-btn" id="sample-doc-btn" onClick={handleUseSample}>
                    Use a sample document
                  </button>
                </>
              )}
            </>
          )}

          {/* Upload progress + stages */}
          {uploading && stage && (
            <div>
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="progress-text">{progress}% uploaded</div>
              </div>

              <div className="stages" role="status" aria-label="Processing stages">
                {STAGES.map((s) => {
                  const state = getStageState(stage, s.key);
                  return (
                    <div key={s.key} className={`stage-item ${state}`}>
                      <span className="stage-icon" aria-hidden="true">
                        {state === 'completed' ? '✓' : state === 'in-progress' ? '⟳' : '○'}
                      </span>
                      {s.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Privacy & disclaimer */}
          <div className="privacy-note">
            <span className="check-icon" aria-hidden="true">
              ✓
            </span>
            Documents are processed securely and stored only for your account.
          </div>
          <p className="upload-disclaimer">
            This tool uses AI for informational purposes. It does not provide legal advice and may
            contain errors.
          </p>
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
