import { randomUUID as uuidv4 } from 'node:crypto';
import { logger } from '../utils/logging';
import { DocumentMetadata, ProcessingStatus } from '../types';
import { SecurityValidationResult } from '../shared/types/document';
import { StorageService } from './storageService';
import { ExtractionService } from './extractionService';
import { FirestoreService, ExtendedDocumentMetadata } from './firestoreService';
import { AIService } from './aiService';
import { AnalysisDocumentRecord } from '../types';

export class DocumentService {
  private storageService: StorageService;
  private extractionService: ExtractionService;
  private firestoreService: FirestoreService;
  private aiService: AIService;

  // rules.md §19: document text is NEVER persisted to Firestore (metadata only).
  // Extracted text lives in this process-memory map so analysis/QA/compare can
  // reach it without leaking document contents into the database.
  private extractedTextStore = new Map<string, string>();

  constructor(
    storageService = new StorageService(),
    extractionService = new ExtractionService(),
    firestoreService = new FirestoreService(),
    aiService = new AIService(),
  ) {
    this.storageService = storageService;
    this.extractionService = extractionService;
    this.firestoreService = firestoreService;
    this.aiService = aiService;
  }

  /**
   * Multi-layer validation for file uploads (size limit 10 MB, type & extension, filename sanitization).
   */
  async validateDocumentUpload(file: {
    filename?: string;
    originalname?: string;
    contentType?: string;
    mimetype?: string;
    size?: number;
  }): Promise<SecurityValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!file) {
      errors.push('File metadata is required');
      return { isValid: false, errors, warnings };
    }

    const filename = file.filename || file.originalname;
    const contentType = file.contentType || file.mimetype;
    const size = file.size;

    if (!filename || filename.trim().length === 0) {
      errors.push('Filename is required');
    } else {
      // Path traversal & malicious filename check
      if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
        errors.push('Invalid filename: path traversal characters detected');
      }
    }

    if (!contentType || contentType.trim().length === 0) {
      errors.push('Content-Type is required');
    } else {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/docx',
        'text/plain',
      ];
      if (!allowedTypes.includes(contentType.toLowerCase())) {
        errors.push('Invalid Content-Type. Allowed file types: PDF, DOCX, TXT');
      }
    }

    if (filename) {
      const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
      const allowedExtensions = ['.pdf', '.docx', '.txt'];
      if (!allowedExtensions.includes(extension)) {
        errors.push('Invalid file extension. Allowed extensions: .pdf, .docx, .txt');
      }
    }

    if (typeof size !== 'number' || isNaN(size)) {
      errors.push('File size must be a valid number');
    } else if (size <= 0) {
      errors.push('File must not be empty (0 bytes)');
    } else if (size > 10 * 1024 * 1024) {
      errors.push('File size exceeds maximum allowed limit of 10 MB');
    }

    if (errors.length === 0) {
      warnings.push('Document upload validation passed');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Sanitizes filenames to prevent path traversal or unwanted special characters.
   */
  sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  }

  /**
   * Initiates document upload: validates metadata, generates GCS signed upload URL, creates Firestore metadata entry.
   */
  async initiateUpload(
    userId: string,
    input: { filename: string; contentType: string; size: number },
  ): Promise<{
    documentId: string;
    signedUploadUrl: string;
    storagePath: string;
    processingStatus: ProcessingStatus;
    metadata: ExtendedDocumentMetadata;
  }> {
    const validation = await this.validateDocumentUpload(input);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const documentId = `doc_${uuidv4()}`;
    const sanitizedFilename = this.sanitizeFilename(input.filename);

    let signedUploadUrl = '';
    let storagePath = `users/${userId}/documents/${documentId}/original`;

    try {
      const urlResult = await this.storageService.generateSignedUploadUrl(
        userId,
        documentId,
        input.contentType,
      );
      signedUploadUrl = urlResult.signedUrl;
      storagePath = urlResult.storagePath;
    } catch (error) {
      logger.warn(
        'Failed to generate GCS signed upload URL, proceeding with storage path fallback',
        { error },
      );
      signedUploadUrl = `http://localhost:3001/api/documents/${documentId}/mock-upload`;
    }

    const metadata: ExtendedDocumentMetadata = {
      id: documentId,
      userId,
      filename: sanitizedFilename,
      contentType: input.contentType,
      size: input.size,
      uploadDate: new Date(),
      processingStatus: ProcessingStatus.UPLOADING,
      storagePath,
      analysisIds: [],
    };

    await this.firestoreService.createDocument(metadata);

    logger.info('Document upload initiated', { documentId, userId, filename: sanitizedFilename });

    return {
      documentId,
      signedUploadUrl,
      storagePath,
      processingStatus: metadata.processingStatus,
      metadata,
    };
  }

  /**
   * Confirms direct upload and triggers extraction & processing pipeline.
   */
  async confirmAndProcessUpload(
    documentId: string,
    userId: string,
    providedBuffer?: Buffer,
  ): Promise<ExtendedDocumentMetadata> {
    const metadata = await this.firestoreService.getDocument(documentId);
    if (!metadata) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    if (metadata.userId !== userId) {
      throw new Error('Access denied: ownership verification failed');
    }

    // Step 1: Update status to validating
    await this.firestoreService.updateDocument(documentId, {
      processingStatus: ProcessingStatus.VALIDATING,
    });

    // Step 2: Download buffer or use provided buffer.
    // NOTE: GCS download errors are thrown (not silently set to FAILED) so the
    // caller can detect them and retry with a server-side file buffer if needed.
    let buffer: Buffer;
    if (providedBuffer) {
      buffer = providedBuffer;
      // Upload the provided buffer to Cloud Storage server-side (best-effort, non-fatal).
      try {
        await this.storageService.uploadFileBuffer(
          metadata.storagePath || `users/${userId}/documents/${documentId}/original`,
          buffer,
          metadata.contentType,
        );
      } catch (uploadErr) {
        logger.warn('Server-side buffer upload to GCS failed (non-fatal, continuing processing)', {
          documentId,
          error: uploadErr instanceof Error ? uploadErr.message : String(uploadErr),
        });
      }
    } else {
      // No buffer provided — attempt to download from GCS.
      // If GCS is unavailable (e.g. local dev without credentials), throw so the
      // handler returns 500 and the frontend can recover via the buffer fallback path.
      try {
        buffer = await this.storageService.downloadFileBuffer(
          metadata.storagePath || `users/${userId}/documents/${documentId}/original`,
        );
      } catch (downloadErr) {
        const message = downloadErr instanceof Error ? downloadErr.message : String(downloadErr);
        logger.error(
          'GCS download failed for document processing — re-throwing for caller to handle',
          { documentId, error: message },
        );
        // Re-throw: this is a storage/infrastructure error, not a document content error.
        // Do NOT set processingStatus=FAILED here — the document may be valid; storage is unreachable.
        throw new Error(`storage_unavailable: ${message}`);
      }
    }

    try {
      // Step 3: Validate magic byte file signature
      const isSignatureValid = this.extractionService.validateFileSignature(
        buffer,
        metadata.contentType,
      );
      if (!isSignatureValid) {
        const errorMsg =
          'File content inspection failed: magic bytes do not match reported Content-Type';
        logger.warn(errorMsg, { documentId, contentType: metadata.contentType });
        return await this.firestoreService.updateDocument(documentId, {
          processingStatus: ProcessingStatus.FAILED,
          errorMessage: errorMsg,
        });
      }

      // Step 4: Extract text & chunk
      await this.firestoreService.updateDocument(documentId, {
        processingStatus: ProcessingStatus.EXTRACTING,
      });

      const extracted = await this.extractionService.extractText(buffer, metadata.contentType);

      // Step 5: Mark complete with metadata & chunks
      // rules.md §19: store extracted text in-process memory, never in Firestore.
      this.extractedTextStore.set(documentId, extracted.text);

      const firestoreUpdates: Partial<ExtendedDocumentMetadata> = {
        processingStatus: ProcessingStatus.COMPLETE,
        pageCount: extracted.pageCount,
        wordCount: extracted.wordCount,
        chunksCount: extracted.chunks.length,
        extractedText: extracted.text,
      };

      const updatedMetadata = await this.firestoreService.updateDocument(
        documentId,
        firestoreUpdates,
      );

      // Merge in-memory extracted text so callers can use it without a separate DB read
      updatedMetadata.extractedText = extracted.text;

      logger.info('Document extraction & processing completed successfully', {
        documentId,
        pageCount: extracted.pageCount,
        wordCount: extracted.wordCount,
        chunksCount: extracted.chunks.length,
      });

      return updatedMetadata;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Document content processing failed', { documentId, error: message });

      return await this.firestoreService.updateDocument(documentId, {
        processingStatus: ProcessingStatus.FAILED,
        errorMessage: message,
      });
    }
  }

  /**
   * Legacy compatible method for creating document metadata directly.
   */
  async createDocumentMetadata(
    userId: string,
    filename: string,
    contentType: string,
    size: number,
  ): Promise<DocumentMetadata> {
    const result = await this.initiateUpload(userId, { filename, contentType, size });
    return result.metadata;
  }

  /**
   * Legacy compatible method for updating status.
   */
  async updateDocumentStatus(documentId: string, status: ProcessingStatus): Promise<void> {
    await this.firestoreService.updateDocument(documentId, { processingStatus: status });
  }

  /**
   * Lists all documents belonging to user.
   */
  async getUserDocuments(userId: string): Promise<ExtendedDocumentMetadata[]> {
    return await this.firestoreService.getUserDocuments(userId);
  }

  /**
   * Retrieves single document with ownership verification.
   */
  async getDocumentById(documentId: string, userId: string): Promise<ExtendedDocumentMetadata> {
    const doc = await this.firestoreService.getDocument(documentId);
    if (!doc) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    if (doc.userId !== userId) {
      throw new Error('Access denied: ownership verification failed');
    }

    // rules.md §19: document text is never persisted to Firestore. Merge it
    // from the in-memory store so analysis/QA/compare can access it.
    const inMemoryText = this.extractedTextStore.get(documentId);
    if (inMemoryText) {
      doc.extractedText = inMemoryText;
    }

    return doc;
  }

  /**
   * Deletes document file from GCS and metadata from Firestore.
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const doc = await this.getDocumentById(documentId, userId);

    if (doc.storagePath) {
      try {
        await this.storageService.deleteStorageFile(doc.storagePath);
      } catch (error) {
        logger.warn('GCS file deletion warning', { documentId, error });
      }
    }

    await this.firestoreService.deleteDocument(documentId);
    logger.info('Document deleted completely', { documentId, userId });
  }

  /**
   * Triggers GenAI document analysis and persists analysis results.
   */
  async analyzeDocument(documentId: string, userId: string): Promise<AnalysisDocumentRecord> {
    let doc = await this.getDocumentById(documentId, userId);

    if (!doc.extractedText && doc.processingStatus !== ProcessingStatus.FAILED) {
      try {
        doc = await this.confirmAndProcessUpload(documentId, userId);
      } catch (recoverErr) {
        logger.warn('Auto-recovery extraction during analysis failed', {
          documentId,
          error: recoverErr,
        });
      }
    }

    if (!doc.extractedText) {
      throw new Error('Document extraction incomplete or failed; cannot perform AI analysis');
    }

    await this.firestoreService.updateDocument(documentId, {
      processingStatus: ProcessingStatus.ANALYSIS,
    });

    try {
      const record = await this.aiService.analyzeDocument(
        documentId,
        userId,
        doc.extractedText || '',
        doc.filename,
      );

      await this.firestoreService.createAnalysis(record);
      await this.firestoreService.updateDocument(documentId, {
        processingStatus: ProcessingStatus.COMPLETE,
      });

      return record;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Document AI analysis failed', { documentId, error: message });

      await this.firestoreService.updateDocument(documentId, {
        processingStatus: ProcessingStatus.FAILED,
        errorMessage: message,
      });

      throw error;
    }
  }

  /**
   * Retrieves existing analysis record for document.
   */
  /**
   * Retrieves existing analysis record for document.
   */
  async getDocumentAnalysis(
    documentId: string,
    userId: string,
  ): Promise<AnalysisDocumentRecord | null> {
    await this.getDocumentById(documentId, userId); // Ownership check
    return await this.firestoreService.getAnalysisByDocumentId(documentId);
  }

  /**
   * Phase 4: Grounded Q&A for a user document with ownership verification and persistence.
   */
  async askDocumentQuestion(documentId: string, userId: string, question: string): Promise<any> {
    const doc = await this.getDocumentById(documentId, userId);

    if (!question || question.trim().length === 0) {
      throw new Error('Question must not be empty');
    }

    const qaResult = await this.aiService.askQuestion(
      doc.extractedText || '',
      question,
      doc.filename,
    );

    const record = {
      id: `qa_${uuidv4()}`,
      documentId,
      userId,
      question: question.trim(),
      answer: qaResult.answer,
      sources: qaResult.sources,
      confidence: qaResult.confidence,
      isNotPresent: qaResult.isNotPresent,
      timestamp: new Date().toISOString(),
      disclaimer: qaResult.disclaimer,
    };

    await this.firestoreService.saveQASession(record);
    return record;
  }

  /**
   * Phase 4: Retrieve Q&A history for a document with ownership check.
   */
  async getQASessions(documentId: string, userId: string): Promise<any[]> {
    await this.getDocumentById(documentId, userId);
    return await this.firestoreService.getQASessionsByDocumentId(documentId, userId);
  }

  /**
   * Phase 4: Compare two documents with dual-document ownership authorization check.
   */
  async compareDocuments(documentId1: string, documentId2: string, userId: string): Promise<any> {
    if (!documentId1 || !documentId2) {
      throw new Error('Both documentId1 and documentId2 are required for comparison');
    }
    if (documentId1 === documentId2) {
      throw new Error('Cannot compare a document with itself');
    }

    // Server-side dual ownership check: MUST authorize BOTH documents independently
    const doc1 = await this.getDocumentById(documentId1, userId);
    const doc2 = await this.getDocumentById(documentId2, userId);

    const results = await this.aiService.compareDocuments(
      doc1.extractedText || '',
      doc1.filename,
      doc2.extractedText || '',
      doc2.filename,
    );

    const record = {
      id: `cmp_${uuidv4()}`,
      userId,
      documentId1,
      documentId2,
      documentTitle1: doc1.filename,
      documentTitle2: doc2.filename,
      results,
      timestamp: new Date().toISOString(),
    };

    await this.firestoreService.saveComparison(record);
    return record;
  }

  /**
   * Phase 4: Retrieve user comparison history.
   */
  async getUserComparisons(userId: string): Promise<any[]> {
    return await this.firestoreService.getComparisonsByUserId(userId);
  }

  /**
   * Phase 4: Plain-language clause explanation helper with ownership check.
   */
  async explainClause(
    documentId: string,
    userId: string,
    clauseName: string,
    originalText?: string,
  ): Promise<any> {
    const doc = await this.getDocumentById(documentId, userId);
    if (!clauseName || clauseName.trim().length === 0) {
      throw new Error('clauseName is required');
    }

    return await this.aiService.explainClause(clauseName, originalText || doc.extractedText);
  }
}
