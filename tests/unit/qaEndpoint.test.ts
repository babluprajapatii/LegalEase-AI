import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';
import {
  FirestoreService,
  ExtendedDocumentMetadata,
} from '../../backend/src/services/firestoreService';
import { AIService } from '../../backend/src/services/aiService';
import { ProcessingStatus } from '../../shared/types';

test('qaEndpoint - processes document Q&A and returns grounded response matching schema', async () => {
  const firestoreService = new FirestoreService();
  const aiService = new AIService();
  const documentService = new DocumentService(undefined, undefined, firestoreService, aiService);

  const mockDoc: ExtendedDocumentMetadata = {
    id: 'doc-qa-1',
    userId: 'user-qa-alice',
    filename: 'Lease_QA.pdf',
    contentType: 'application/pdf',
    size: 1500,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Section 1. Rent is $3,500 per month due on the 1st. Grace period is 5 days.',
  };

  await firestoreService.createDocument(mockDoc);

  const res = await documentService.askDocumentQuestion(
    'doc-qa-1',
    'user-qa-alice',
    'What is the rent amount?',
  );

  assert.ok(res.id);
  assert.equal(res.documentId, 'doc-qa-1');
  assert.equal(res.question, 'What is the rent amount?');
  assert.ok(res.answer);
  assert.ok(
    ['highly confident', 'moderately confident', 'limited information'].includes(res.confidence),
  );
  assert.ok(Array.isArray(res.sources));
  assert.ok(res.disclaimer);
});

test('qaEndpoint - persists Q&A session history in Firestore qa_sessions collection', async () => {
  const firestoreService = new FirestoreService();
  const aiService = new AIService();
  const documentService = new DocumentService(undefined, undefined, firestoreService, aiService);

  const mockDoc: ExtendedDocumentMetadata = {
    id: 'doc-qa-2',
    userId: 'user-qa-alice',
    filename: 'Lease_QA.pdf',
    contentType: 'application/pdf',
    size: 1500,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Section 2. Security deposit is $3,500.',
  };

  await firestoreService.createDocument(mockDoc);
  const qaRes = await documentService.askDocumentQuestion(
    'doc-qa-2',
    'user-qa-alice',
    'What is the deposit?',
  );

  const history = await documentService.getQASessions('doc-qa-2', 'user-qa-alice');

  assert.ok(Array.isArray(history));
  assert.ok(history.length >= 1);
  assert.equal(history[0].id, qaRes.id);
  assert.equal(history[0].question, 'What is the deposit?');
});

test('qaEndpoint - rejects cross-user Q&A access attempts', async () => {
  const firestoreService = new FirestoreService();
  const aiService = new AIService();
  const documentService = new DocumentService(undefined, undefined, firestoreService, aiService);

  const mockDocBob: ExtendedDocumentMetadata = {
    id: 'doc-qa-bob',
    userId: 'user-qa-bob',
    filename: 'Bob_Private.pdf',
    contentType: 'application/pdf',
    size: 2000,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Confidential corporate strategy text.',
  };

  await firestoreService.createDocument(mockDocBob);

  await assert.rejects(
    async () => {
      // Alice attempts to ask a question on Bob's private document
      await documentService.askDocumentQuestion(
        'doc-qa-bob',
        'user-qa-alice',
        'What is the strategy?',
      );
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

test('qaEndpoint - rejects missing or empty question payload', async () => {
  const firestoreService = new FirestoreService();
  const aiService = new AIService();
  const documentService = new DocumentService(undefined, undefined, firestoreService, aiService);

  const mockDoc: ExtendedDocumentMetadata = {
    id: 'doc-qa-empty',
    userId: 'user-qa-alice',
    filename: 'Lease.pdf',
    contentType: 'application/pdf',
    size: 1000,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: 'Sample text.',
  };

  await firestoreService.createDocument(mockDoc);

  await assert.rejects(
    async () => {
      await documentService.askDocumentQuestion('doc-qa-empty', 'user-qa-alice', '   ');
    },
    (err: Error) => {
      assert.ok(
        err.message.includes('required') ||
          err.message.includes('empty') ||
          err.message.includes('Invalid') ||
          err.message.includes('Question must not be empty'),
      );
      return true;
    },
  );
});
