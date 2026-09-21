import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AIService } from './aiService';
import { DocumentService } from './documentService';
import { FirestoreService, ExtendedDocumentMetadata } from './firestoreService';
import { DocumentMetadata, ProcessingStatus } from '../types';

describe('Phase 4 Interactive AI Services & Dual-Document Ownership', () => {
  const aiService = new AIService();
  const firestoreService = new FirestoreService();
  const documentService = new DocumentService(undefined, undefined, firestoreService, aiService);

  const dummyTextString =
    'Section 1. Term and Renewal. This Agreement commences on January 1, 2026 and shall continue for 1 year. Section 2. Payment Terms. Rent is $5,000 per month due on the 1st of each month with a 5-day grace period. Late fee is $100.';

  const dummyDocA: ExtendedDocumentMetadata = {
    id: 'doc-101',
    userId: 'user-alice',
    filename: 'Lease_v1.pdf',
    contentType: 'application/pdf',
    size: 2048,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: dummyTextString,
  };

  const dummyDocB: ExtendedDocumentMetadata = {
    id: 'doc-102',
    userId: 'user-alice',
    filename: 'Lease_v2.pdf',
    contentType: 'application/pdf',
    size: 2100,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
    extractedText: dummyTextString,
  };

  const dummyDocBob: DocumentMetadata = {
    id: 'doc-999',
    userId: 'user-bob',
    filename: 'Bob_Secret.pdf',
    contentType: 'application/pdf',
    size: 3000,
    uploadDate: new Date(),
    processingStatus: ProcessingStatus.COMPLETE,
  };

  it('AIService.askQuestion produces a valid grounded QA response with confidence and sources', async () => {
    const res = await aiService.askQuestion(
      dummyTextString,
      'What are the payment terms and grace period?',
    );
    assert.ok(res.answer);
    assert.ok(
      ['highly confident', 'moderately confident', 'limited information'].includes(res.confidence),
    );
    assert.ok(Array.isArray(res.sources));
    assert.strictEqual(typeof res.isNotPresent, 'boolean');
  });

  it('AIService.compareDocuments produces structural diffs with added, removed, and modified counts', async () => {
    const res = await aiService.compareDocuments(
      dummyTextString,
      'Lease_v1.pdf',
      dummyTextString,
      'Lease_v2.pdf',
    );
    assert.ok(res.summary);
    assert.strictEqual(typeof res.addedCount, 'number');
    assert.strictEqual(typeof res.removedCount, 'number');
    assert.strictEqual(typeof res.modifiedCount, 'number');
    assert.ok(Array.isArray(res.differences));
    assert.ok(res.disclaimer.length > 0);
  });

  it('AIService.explainClause produces plain English explanation, why it matters, and clarifications', async () => {
    const res = await aiService.explainClause(
      'Payment Terms',
      'Rent is $5,000 per month due on 1st.',
    );
    assert.strictEqual(res.clauseName, 'Payment Terms');
    assert.ok(res.plainExplanation);
    assert.ok(res.whyItMatters);
    assert.ok(Array.isArray(res.whatToClarify));
  });

  it('DocumentService dual-document ownership check allows owner of both files', async () => {
    // Seed in-memory records
    await firestoreService.createDocument(dummyDocA);
    await firestoreService.createDocument(dummyDocB);

    const result = await documentService.compareDocuments('doc-101', 'doc-102', 'user-alice');
    assert.ok(result.id);
    assert.strictEqual(result.userId, 'user-alice');
    assert.strictEqual(result.documentId1, 'doc-101');
    assert.strictEqual(result.documentId2, 'doc-102');
    assert.ok(result.results);
  });

  it('DocumentService dual-document ownership check rejects if user does not own document B', async () => {
    await firestoreService.createDocument(dummyDocBob);

    await assert.rejects(async () => {
      await documentService.compareDocuments('doc-101', 'doc-999', 'user-alice');
    }, /Access denied/);
  });
});
