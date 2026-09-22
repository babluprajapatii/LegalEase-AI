import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';
import { StorageService } from '../../backend/src/services/storageService';
import { ProcessingStatus } from '../../backend/src/types';

test('Analysis & Upload Fallback - confirmAndProcessUpload with provided buffer completes extraction', async () => {
  const docService = new DocumentService();
  const testUserId = 'user_fallback_test';

  const uploadResult = await docService.initiateUpload(testUserId, {
    filename: 'test_agreement.txt',
    contentType: 'text/plain',
    size: 200,
  });

  const testContent = Buffer.from(
    'LEASE AGREEMENT\nRent is $1500 per month due on the 1st of each month.\nTenant must provide 30 days written notice to terminate.\nIndemnification: Tenant shall indemnify Landlord for damages.',
  );

  const confirmResult = await docService.confirmAndProcessUpload(
    uploadResult.documentId,
    testUserId,
    testContent,
  );

  assert.equal(confirmResult.processingStatus, ProcessingStatus.COMPLETE);
  assert.ok(confirmResult.extractedText);
  assert.ok(confirmResult.extractedText.includes('LEASE AGREEMENT'));
  assert.equal(confirmResult.chunksCount, 1);
});

test('Analysis & Upload Fallback - analyzeDocument auto-recovers and returns analysis record', async () => {
  const docService = new DocumentService();
  const testUserId = 'user_recovery_test';

  const uploadResult = await docService.initiateUpload(testUserId, {
    filename: 'recovery_contract.txt',
    contentType: 'text/plain',
    size: 250,
  });

  const testContent = Buffer.from(
    'EMPLOYMENT AGREEMENT\nEmployee agrees to non-disclosure obligations.\nSalary is paid monthly.\nTermination requires 14 days written notice.',
  );

  // Confirm with buffer
  await docService.confirmAndProcessUpload(uploadResult.documentId, testUserId, testContent);

  // Analyze document
  const analysisRecord = await docService.analyzeDocument(uploadResult.documentId, testUserId);

  assert.ok(analysisRecord.id);
  assert.equal(analysisRecord.documentId, uploadResult.documentId);
  assert.equal(analysisRecord.userId, testUserId);
  assert.ok(analysisRecord.results.summary);
  assert.ok(analysisRecord.results.disclaimer.includes('DISCLAIMER'));
});

test('Analysis & Upload Fallback - rejects unauthorized user during analysis', async () => {
  const docService = new DocumentService();
  const ownerId = 'user_owner';
  const intruderId = 'user_intruder';

  const uploadResult = await docService.initiateUpload(ownerId, {
    filename: 'private_doc.txt',
    contentType: 'text/plain',
    size: 100,
  });

  await assert.rejects(
    async () => {
      await docService.analyzeDocument(uploadResult.documentId, intruderId);
    },
    (err: Error) => {
      return err.message.includes('Access denied');
    },
  );
});

test('StorageService - uploadFileBuffer saves buffer without throwing uncaught errors', async () => {
  const storageService = new StorageService();
  const path = 'users/test_user/documents/test_doc/original';
  const buffer = Buffer.from('Sample test file content');

  await assert.doesNotReject(async () => {
    await storageService.uploadFileBuffer(path, buffer, 'text/plain');
  });
});
