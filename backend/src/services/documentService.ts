import { logger } from '../utils/logging';
import { DocumentMetadata, ProcessingStatus } from '../types';
import { SecurityValidationResult } from '../shared/types/document';

export class DocumentService {
  async validateDocumentUpload(file: any): Promise<SecurityValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors, warnings };
    }

    if (!file.originalname || !file.mimetype) {
      errors.push('File must have a name and type');
    }

    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size must not exceed 10 MB');
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('File type must be PDF, DOCX, or TXT');
    }

    if (file.size === 0) {
      errors.push('File must not be empty');
    }

    if (errors.length === 0) {
      warnings.push('File validation passed');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  async createDocumentMetadata(
    userId: string,
    filename: string,
    contentType: string,
    size: number,
  ): Promise<DocumentMetadata> {
    const documentId = this.generateDocumentId();

    const metadata: DocumentMetadata = {
      id: documentId,
      userId,
      filename,
      contentType,
      size,
      uploadDate: new Date(),
      processingStatus: ProcessingStatus.UPLOADING,
      analysisIds: [],
    };

    logger.info('Document metadata created', {
      documentId,
      userId,
      filename,
      contentType,
      size,
    });

    return metadata;
  }

  async updateDocumentStatus(documentId: string, status: ProcessingStatus): Promise<void> {
    logger.info('Document processing status updated', {
      documentId,
      status,
    });
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
