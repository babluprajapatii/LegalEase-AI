import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';
import { ProcessingStatus } from '../../backend/src/types';

/**
 * Regression test for the 422 "Document processing failed" regression introduced after
 * the responsive frontend changes (commit 0b84454).
 *
 * ROOT CAUSE:
 * When the direct GCS upload succeeded, directGcsUploadFailed=false on the frontend,
 * so no base64Data was included in the confirmUpload body.
 * The backend confirmAndProcessUpload then attempted downloadFileBuffer().
 * In local development (no live GCS credentials), the download threw a storage error.
 * The original catch block silently converted that storage error into
 * processingStatus=FAILED and returned — which the handler converted into HTTP 422.
 *
 * The fix: storage download errors (storage_unavailable) are now re-thrown from
 * confirmAndProcessUpload instead of silently being set to processingStatus=FAILED.
 * This allows the handler to return 503, and the frontend retries with the file buffer.
 */

test('confirmUploadRegression - GCS download failure does NOT set processingStatus=failed (must throw)', async () => {
  // Create a mock StorageService that simulates GCS unavailability.
  const mockStorageService = {
    generateSignedUploadUrl: async () => ({ signedUrl: 'http://mock', storagePath: 'mock/path' }),
    uploadFileBuffer: async () => {},
    // Simulates GCS being unreachable in local dev
    downloadFileBuffer: async (_path: string) => {
      throw new Error('Cloud Storage: Could not authenticate (UNAUTHENTICATED)');
    },
    deleteStorageFile: async () => {},
    getStoragePath: (_u: string, _d: string) => 'mock/path',
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
    deleteDocument: async (_id: string) => {},
    getUserDocuments: async () => [],
    createAnalysis: async (_r: any) => {},
    getAnalysisByDocumentId: async () => null,
    saveQASession: async (_r: any) => {},
    getQASessionsByDocumentId: async () => [],
    saveComparison: async (_r: any) => {},
    getComparisonsByUserId: async () => [],
  };

  const mockExtractionService = {
    validateFileSignature: () => true,
    extractText: async () => ({
      text: 'Sample contract text for testing',
      pageCount: 1,
      wordCount: 4,
      chunks: [{ chunkIndex: 0, text: 'Sample contract text for testing', wordCount: 4 }],
    }),
    normalizeText: (t: string) => t,
    countWords: (t: string) => t.split(' ').length,
    chunkText: (t: string) => [{ chunkIndex: 0, text: t, wordCount: t.split(' ').length }],
  };

  const mockAIService = { analyzeDocument: async () => ({ results: {}, disclaimer: '' }) } as any;

  const svc = new DocumentService(
    mockStorageService as any,
    mockExtractionService as any,
    mockFirestoreService as any,
    mockAIService,
  );

  // Seed Firestore with a valid document record
  mockFirestoreService._store['doc_test_regression'] = {
    id: 'doc_test_regression',
    userId: 'user_abc',
    filename: 'test.txt',
    contentType: 'text/plain',
    size: 100,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.UPLOADING,
    storagePath: 'users/user_abc/documents/doc_test_regression/original',
    analysisIds: [],
  };

  // When no buffer is provided and GCS download fails, the service MUST THROW
  // (not return processingStatus=FAILED which would cause a misleading 422).
  await assert.rejects(
    async () => {
      await svc.confirmAndProcessUpload('doc_test_regression', 'user_abc', undefined);
    },
    (err: Error) => {
      // Must throw with storage_unavailable prefix so handler returns 503 (not 422)
      assert.ok(
        err.message.startsWith('storage_unavailable:'),
        `Expected storage_unavailable error, got: ${err.message}`,
      );
      return true;
    },
    'GCS download failure must throw storage_unavailable, not silently return processingStatus=failed',
  );

  // Also confirm that the document was NOT set to processingStatus=failed
  // (it should remain VALIDATING, or unchanged, since the error was rethrown before processing)
  const docAfter = mockFirestoreService._store['doc_test_regression'];
  assert.notEqual(
    docAfter.processingStatus,
    ProcessingStatus.FAILED,
    'processingStatus must NOT be set to FAILED for a GCS storage infrastructure error',
  );
});

test('confirmUploadRegression - provided buffer avoids GCS download; processes successfully', async () => {
  const mockStorageService = {
    generateSignedUploadUrl: async () => ({ signedUrl: 'http://mock', storagePath: 'mock/path' }),
    uploadFileBuffer: async () => {}, // GCS upload attempt is non-fatal, so it can succeed or fail
    downloadFileBuffer: async () => {
      throw new Error('Should never be called when buffer is provided');
    },
    deleteStorageFile: async () => {},
    getStoragePath: (_u: string, _d: string) => 'mock/path',
  };

  const sampleText = 'This is a sample lease agreement for testing purposes.';
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

  const mockExtractionService = {
    validateFileSignature: () => true,
    extractText: async () => ({
      text: sampleText,
      pageCount: 1,
      wordCount: sampleText.split(' ').length,
      chunks: [{ chunkIndex: 0, text: sampleText, wordCount: sampleText.split(' ').length }],
    }),
    normalizeText: (t: string) => t,
    countWords: (t: string) => t.split(' ').length,
    chunkText: (t: string) => [{ chunkIndex: 0, text: t, wordCount: t.split(' ').length }],
  };

  const mockAIService = { analyzeDocument: async () => ({}) } as any;

  const svc = new DocumentService(
    mockStorageService as any,
    mockExtractionService as any,
    mockFirestoreService as any,
    mockAIService,
  );

  mockFirestoreService._store['doc_buf_regression'] = {
    id: 'doc_buf_regression',
    userId: 'user_xyz',
    filename: 'agreement.txt',
    contentType: 'text/plain',
    size: sampleText.length,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.UPLOADING,
    storagePath: 'users/user_xyz/documents/doc_buf_regression/original',
    analysisIds: [],
  };

  const providedBuffer = Buffer.from(sampleText, 'utf-8');
  const result = await svc.confirmAndProcessUpload(
    'doc_buf_regression',
    'user_xyz',
    providedBuffer,
  );

  assert.equal(
    result.processingStatus,
    ProcessingStatus.COMPLETE,
    'Document with provided buffer must complete successfully',
  );
  assert.ok(result.extractedText?.includes('lease agreement'), 'Extracted text must be present');
});
