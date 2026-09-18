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
