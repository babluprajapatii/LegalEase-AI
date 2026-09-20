export interface User {
  uid: string;
  email?: string;
}

export interface DocumentMetadata {
  id: string;
  userId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadDate: Date;
  processingStatus: ProcessingStatus;
  analysisIds?: string[];
}

export enum ProcessingStatus {
  UPLOADING = 'uploading',
  VALIDATING = 'validating',
  EXTRACTING = 'extracting',
  ANALYSIS = 'analysis',
  COMPLETE = 'complete',
  FAILED = 'failed',
}

export interface AnalysisResult {
  id: string;
  userId: string;
  documentId: string;
  analysisType: AnalysisType;
  status: AnalysisStatus;
  results?: any;
  processingTime?: number;
  createdAt: Date;
  completedAt?: Date;
}

export enum AnalysisType {
  SUMMARY = 'summary',
  QNA = 'qna',
  COMPARISON = 'comparison',
  SIMPLIFICATION = 'simplification',
  RISK_DETECTION = 'risk_detection',
  NEXT_STEPS = 'next_steps',
}

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

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  FAILED = 'failed',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
