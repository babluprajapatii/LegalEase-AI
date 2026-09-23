import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';
import { ExtractionService } from '../../backend/src/services/extractionService';
import { ProcessingStatus } from '../../backend/src/types';

/**
 * PDF Document Pipeline & Authorization Tests
 */

const singlePagePdfBinary =
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n5 0 obj<</Length 56>>stream\nBT /F1 12 Tf 72 712 Td (LEGAL LEASE AGREEMENT SECTION 1) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000313 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n419\n%%EOF';

const scannedPdfBinary =
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R>>endobj\n4 0 obj<</Length 0>>stream\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000213 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n264\n%%EOF';

test('PDF Pipeline - server-side buffer fallback confirms & processes PDF successfully', async () => {
  const pdfBuffer = Buffer.from(singlePagePdfBinary);

  const mockStorageService = {
    generateSignedUploadUrl: async () => ({ signedUrl: 'http://mock', storagePath: 'mock/path' }),
    uploadFileBuffer: async () => {},
    downloadFileBuffer: async () => {
      throw new Error('Should not be called when buffer is provided');
    },
    deleteStorageFile: async () => {},
    getStoragePath: () => 'mock/path',
  };

  const mockFirestoreService = {
    _store: {} as Record<string, any>,
    createDocument: async (doc: any) => {
      mockFirestoreService._store[doc.id] = { ...doc };
    },
    getDocument: async (id: string) => mockFirestoreService._store[id] ?? null,
    updateDocument: async (id: string, updates: any) => {
      if (!mockFirestoreService._store[id]) throw new Error(`Document ${id} not found`);
      mockFirestoreService._store[id] = { ...mockFirestoreService._store[id], ...updates };
      return mockFirestoreService._store[id];
    },
    deleteDocument: async () => {},
    getUserDocuments: async () => [],
    createAnalysis: async () => {},
    getAnalysisByDocumentId: async () => null,
    saveQASession: async () => {},
    getQASessionsByDocumentId: async () => [],
    saveComparison: async () => {},
    getComparisonsByUserId: async () => [],
  };

  const extractionService = new ExtractionService();
  const mockAIService = { analyzeDocument: async () => ({}) } as any;

  const docService = new DocumentService(
    mockStorageService as any,
    extractionService,
    mockFirestoreService as any,
    mockAIService,
  );

  mockFirestoreService._store['doc_pdf_fallback'] = {
    id: 'doc_pdf_fallback',
    userId: 'user_pdf_owner',
    filename: 'contract.pdf',
    contentType: 'application/pdf',
    size: pdfBuffer.length,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.UPLOADING,
    storagePath: 'users/user_pdf_owner/documents/doc_pdf_fallback/original',
    analysisIds: [],
  };

  const result = await docService.confirmAndProcessUpload(
    'doc_pdf_fallback',
    'user_pdf_owner',
    pdfBuffer,
  );

  assert.equal(result.processingStatus, ProcessingStatus.COMPLETE);
  assert.equal(result.pageCount, 1);
  assert.ok(result.extractedText?.includes('LEGAL LEASE AGREEMENT'));
});

test('PDF Pipeline - unauthorized user cannot confirm another user PDF', async () => {
  const mockStorageService = {} as any;
  const mockFirestoreService = {
    _store: {
      doc_pdf_secret: {
        id: 'doc_pdf_secret',
        userId: 'user_owner_alice',
        filename: 'secret.pdf',
        contentType: 'application/pdf',
        size: 100,
        uploadDate: new Date(),
        processingStatus: ProcessingStatus.UPLOADING,
        storagePath: 'users/user_owner_alice/documents/doc_pdf_secret/original',
        analysisIds: [],
      },
    },
    getDocument: async (id: string) => mockFirestoreService._store[id] ?? null,
  };

  const extractionService = new ExtractionService();
  const mockAIService = {} as any;

  const docService = new DocumentService(
    mockStorageService,
    extractionService,
    mockFirestoreService as any,
    mockAIService,
  );

  await assert.rejects(
    async () => {
      await docService.confirmAndProcessUpload(
        'doc_pdf_secret',
        'user_attacker_bob',
        Buffer.from(singlePagePdfBinary),
      );
    },
    (err: Error) => {
      assert.ok(err.message.includes('Access denied'));
      return true;
    },
  );
});

test('PDF Pipeline - scanned PDF returns FAILED status with OCR required message', async () => {
  const scannedBuffer = Buffer.from(scannedPdfBinary);

  const mockStorageService = {
    uploadFileBuffer: async () => {},
  };

  const mockFirestoreService = {
    _store: {
      doc_scanned_pdf: {
        id: 'doc_scanned_pdf',
        userId: 'user_pdf_scanned',
        filename: 'scanned_contract.pdf',
        contentType: 'application/pdf',
        size: scannedBuffer.length,
        uploadDate: new Date(),
        processingStatus: ProcessingStatus.UPLOADING,
        storagePath: 'users/user_pdf_scanned/documents/doc_scanned_pdf/original',
        analysisIds: [],
      },
    },
    getDocument: async (id: string) => mockFirestoreService._store[id] ?? null,
    updateDocument: async (id: string, updates: any) => {
      mockFirestoreService._store[id] = { ...mockFirestoreService._store[id], ...updates };
      return mockFirestoreService._store[id];
    },
  };

  const extractionService = new ExtractionService();
  const mockAIService = {} as any;

  const docService = new DocumentService(
    mockStorageService as any,
    extractionService,
    mockFirestoreService as any,
    mockAIService,
  );

  const result = await docService.confirmAndProcessUpload(
    'doc_scanned_pdf',
    'user_pdf_scanned',
    scannedBuffer,
  );

  assert.equal(result.processingStatus, ProcessingStatus.FAILED);
  assert.ok(result.errorMessage?.includes('OCR is required'));
});
