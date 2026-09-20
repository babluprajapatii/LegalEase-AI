import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';
import { STANDARD_LEGAL_DISCLAIMER } from '../../backend/src/services/aiService';

test('Integration - Phase 3 GenAI Document Analysis Pipeline & Authorization', async () => {
  process.env.NODE_ENV = 'test';
  const service = new DocumentService();
  const userId = 'user_legal_tester_101';
  const unauthorizedUser = 'user_unauthorized_999';

  // 1. Upload & process sample legal agreement
  const uploadResult = await service.initiateUpload(userId, {
    filename: 'Lease_Agreement_2024.txt',
    contentType: 'text/plain',
    size: 1024,
  });

  const sampleAgreementText = `COMMERCIAL LEASE AGREEMENT
Landlord: Metro Real Estate LLC
Tenant: Tech Solutions Inc.
1. Monthly Rent: Tenant shall pay $8,500 on or before the 1st of each calendar month.
2. Term & Renewal: 3-year term ending December 31, 2027. Written notice of non-renewal required 90 days prior.
3. Indemnification & Liability: Tenant agrees to defend, indemnify, and hold harmless Landlord against any and all claims, liabilities, loss, or damages.
4. Security Deposit: $17,000 due upon signing.`;

  await service.confirmAndProcessUpload(
    uploadResult.documentId,
    userId,
    Buffer.from(sampleAgreementText),
  );

  // 2. Perform AI Document Analysis
  const analysisRecord = await service.analyzeDocument(uploadResult.documentId, userId);

  assert.ok(analysisRecord.id.startsWith('an_'));
  assert.equal(analysisRecord.documentId, uploadResult.documentId);
  assert.equal(analysisRecord.userId, userId);
  assert.equal(analysisRecord.status, 'complete');
  assert.ok(analysisRecord.processingTimeMs >= 0);

  // Validate results structure & grounding
  const { results } = analysisRecord;
  assert.equal(results.grounded, true);
  assert.equal(results.disclaimer, STANDARD_LEGAL_DISCLAIMER);
  assert.ok(results.summary.length > 0);
  assert.ok(results.clauses.length > 0);
  assert.ok(results.obligations.length > 0);
  assert.ok(results.risks.length > 0);

  // 3. Retrieve analysis record
  const fetchedAnalysis = await service.getDocumentAnalysis(uploadResult.documentId, userId);
  assert.ok(fetchedAnalysis);
  assert.equal(fetchedAnalysis?.id, analysisRecord.id);

  // 4. Cross-user access authorization check (User B cannot analyze or view User A's document)
  await assert.rejects(
    async () => {
      await service.analyzeDocument(uploadResult.documentId, unauthorizedUser);
    },
    (err: Error) => err.message.includes('Access denied'),
  );

  await assert.rejects(
    async () => {
      await service.getDocumentAnalysis(uploadResult.documentId, unauthorizedUser);
    },
    (err: Error) => err.message.includes('Access denied'),
  );
});
