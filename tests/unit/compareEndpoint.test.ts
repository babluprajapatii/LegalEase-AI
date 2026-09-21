import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';
import {
  FirestoreService,
  ExtendedDocumentMetadata,
} from '../../backend/src/services/firestoreService';
import { AIService } from '../../backend/src/services/aiService';
import { ProcessingStatus } from '../../shared/types';

test('compareEndpoint - compares two documents and returns structural diff output', async () => {
  const firestoreService = new FirestoreService();
  const aiService = new AIService();
  const documentService = new DocumentService(undefined, undefined, firestoreService, aiService);

  const docA: ExtendedDocumentMetadata = {
    id: 'doc-cmp-a',
    userId: 'user-cmp-alice',
    filename: 'Lease_v1.pdf',
    contentType: 'application/pdf',
    size: 2000,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Section 1. Rent is $3,000 per month. Section 2. Term is 1 year.',
  };

  const docB: ExtendedDocumentMetadata = {
    id: 'doc-cmp-b',
    userId: 'user-cmp-alice',
    filename: 'Lease_v2.pdf',
    contentType: 'application/pdf',
    size: 2100,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText:
      'Section 1. Rent is $3,500 per month. Section 2. Term is 2 years. Section 3. Late fee $50.',
  };

  await firestoreService.createDocument(docA);
  await firestoreService.createDocument(docB);

  const result = await documentService.compareDocuments('doc-cmp-a', 'doc-cmp-b', 'user-cmp-alice');

  assert.ok(result.id);
  assert.equal(result.userId, 'user-cmp-alice');
  assert.equal(result.documentId1, 'doc-cmp-a');
  assert.equal(result.documentId2, 'doc-cmp-b');
  assert.ok(result.results);
  assert.equal(typeof result.results.addedCount, 'number');
  assert.equal(typeof result.results.removedCount, 'number');
  assert.equal(typeof result.results.modifiedCount, 'number');
  assert.ok(Array.isArray(result.results.differences));
});

test('compareEndpoint - enforces dual-document ownership authorizing both Doc A AND Doc B', async () => {
  const firestoreService = new FirestoreService();
  const aiService = new AIService();
  const documentService = new DocumentService(undefined, undefined, firestoreService, aiService);

  const docAlice: ExtendedDocumentMetadata = {
    id: 'doc-alice-1',
    userId: 'user-cmp-alice',
    filename: 'Alice_Lease.pdf',
    contentType: 'application/pdf',
    size: 1500,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Alice contract terms.',
  };

  const docBob: ExtendedDocumentMetadata = {
    id: 'doc-bob-1',
    userId: 'user-cmp-bob',
    filename: 'Bob_Lease.pdf',
    contentType: 'application/pdf',
    size: 1800,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Bob private contract terms.',
  };

  await firestoreService.createDocument(docAlice);
  await firestoreService.createDocument(docBob);

  await assert.rejects(
    async () => {
      // Alice attempts to compare her document with Bob's private document
      await documentService.compareDocuments('doc-alice-1', 'doc-bob-1', 'user-cmp-alice');
    },
    (err: Error) => {
      assert.ok(
        err.message.includes('Ownership verification failed') ||
          err.message.includes('Unauthorized access') ||
          err.message.includes('Access denied') ||
          err.message.includes('Document not found'),
      );
      return true;
    },
  );
});

test('compareEndpoint - persists comparison history in Firestore comparisons collection', async () => {
  const firestoreService = new FirestoreService();
  const aiService = new AIService();
  const documentService = new DocumentService(undefined, undefined, firestoreService, aiService);

  const docA: ExtendedDocumentMetadata = {
    id: 'doc-hist-a',
    userId: 'user-cmp-alice',
    filename: 'Doc_v1.pdf',
    contentType: 'application/pdf',
    size: 1000,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Original terms.',
  };

  const docB: ExtendedDocumentMetadata = {
    id: 'doc-hist-b',
    userId: 'user-cmp-alice',
    filename: 'Doc_v2.pdf',
    contentType: 'application/pdf',
    size: 1100,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Revised terms.',
  };

  await firestoreService.createDocument(docA);
  await firestoreService.createDocument(docB);

  const compRes = await documentService.compareDocuments(
    'doc-hist-a',
    'doc-hist-b',
    'user-cmp-alice',
  );

  const history = await documentService.getUserComparisons('user-cmp-alice');

  assert.ok(Array.isArray(history));
  assert.ok(history.length >= 1);
  assert.ok(history.some((c) => c.id === compRes.id));
});

test('compareEndpoint - prevents self-comparison and validates document ID parameters', async () => {
  const firestoreService = new FirestoreService();
  const aiService = new AIService();
  const documentService = new DocumentService(undefined, undefined, firestoreService, aiService);

  const docSelf: ExtendedDocumentMetadata = {
    id: 'doc-self-1',
    userId: 'user-cmp-alice',
    filename: 'Single_Doc.pdf',
    contentType: 'application/pdf',
    size: 1200,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Contract text.',
  };

  await firestoreService.createDocument(docSelf);

  await assert.rejects(
    async () => {
      // Attempt to compare a document with itself
      await documentService.compareDocuments('doc-self-1', 'doc-self-1', 'user-cmp-alice');
    },
    (err: Error) => {
      assert.ok(
        err.message.includes('Cannot compare a document with itself') ||
          err.message.includes('same'),
      );
      return true;
    },
  );
});
