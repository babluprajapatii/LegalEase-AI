/**
 * Shared types between frontend and backend.
 *
 * Phase 1: Re-exports core domain types from backend to establish the shared
 * types contract. As the project grows, genuinely shared types should be
 * defined here and imported by both workspaces.
 */

// ─── Document domain types ──────────────────────────────────────────────────
export enum ProcessingStatus {
  UPLOADING = 'uploading',
  VALIDATING = 'validating',
  EXTRACTING = 'extracting',
  ANALYSIS = 'analysis',
  COMPLETE = 'complete',
  FAILED = 'failed',
}

export enum AnalysisType {
  SUMMARY = 'summary',
  QNA = 'qna',
  COMPARISON = 'comparison',
  SIMPLIFICATION = 'simplification',
  RISK_DETECTION = 'risk_detection',
  NEXT_STEPS = 'next_steps',
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  FAILED = 'failed',
}

// ─── API response envelope ──────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Document metadata (subset safe for frontend) ───────────────────────────
export interface DocumentMetadata {
  id: string;
  userId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadDate: string;
  processingStatus: ProcessingStatus;
  analysisIds?: string[];
}

// ─── Security / grounding types ─────────────────────────────────────────────
export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AIGroundingResult<T> {
  grounded: boolean;
  sources: Array<{ text: string; page?: number; section?: string }>;
  confidence: 'high' | 'medium' | 'low';
  result: T;
}
