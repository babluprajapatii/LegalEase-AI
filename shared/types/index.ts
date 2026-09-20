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

// ─── Phase 3: AI Document Analysis Domain Types ─────────────────────────────
export type RiskLevel = 'low' | 'medium' | 'high';

export interface ClauseItem {
  id: string;
  name: string;
  description: string;
  originalText?: string;
  page?: number;
  section?: string;
  riskLevel: RiskLevel;
  whyAttention?: string;
}

export interface ObligationItem {
  id: string;
  party: string;
  duty: string;
  page?: number;
  section?: string;
  deadline?: string;
}

export interface ImportantDateItem {
  id: string;
  date: string;
  description: string;
  page?: number;
  section?: string;
  actionRequired?: string;
}

export interface RiskItem {
  id: string;
  clauseName: string;
  description: string;
  page?: number;
  section?: string;
  riskLevel: RiskLevel;
  whyAttention: string;
  suggestedQuestion: string;
}

export interface GuidanceItem {
  nextSteps: string[];
  lawyerQuestions: string[];
  clarifications: string[];
}

export interface AnalysisOutput {
  summary: string;
  clauses: ClauseItem[];
  obligations: ObligationItem[];
  importantDates: ImportantDateItem[];
  risks: RiskItem[];
  guidance: GuidanceItem;
  disclaimer: string;
  grounded: boolean;
  uncertaintyNotes?: string[];
  unpresentInformation?: string[];
}

export interface AnalysisDocumentRecord {
  id: string;
  documentId: string;
  userId: string;
  timestamp: string;
  processingTimeMs: number;
  modelName: string;
  promptTokens?: number;
  candidateTokens?: number;
  results: AnalysisOutput;
  status: AnalysisStatus;
}
