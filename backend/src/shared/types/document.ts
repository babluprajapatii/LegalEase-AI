import { z } from 'zod';

export const DocumentUploadSchema = z.object({
  filename: z.string().min(1, 'Filename required'),
  contentType: z.string().min(1, 'Content type required'),
  size: z.number().positive('Size must be positive'),
});

export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>;

export interface DocumentProcessingResult {
  success: boolean;
  documentId: string;
  processingStatus: 'pending' | 'processing' | 'complete' | 'failed';
  extractedText?: string;
  chunks?: string[];
  error?: string;
}

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
