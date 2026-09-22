import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';
import { ProcessingStatus } from '../../backend/src/types';

test('Confirm Upload Regression - confirmAndProcessUpload with base64 providedBuffer succeeds', async () => {
  const docService = new DocumentService();
  const testUserId = 'user_regression_confirm';

  // Step 1: Initiate upload
  const uploadResult = await docService.initiateUpload(testUserId, {
    filename: 'regression_contract.txt',
    contentType: 'text/plain',
    size: 500,
  });

  const textBuffer = Buffer.from(
    'LEGAL SERVICES AGREEMENT\nThis agreement is made between Party A and Party B.\nTerm: 12 months.\nTermination: 30 days notice required.',
  );

  // Step 2: Confirm with provided buffer
  const confirmResult = await docService.confirmAndProcessUpload(
    uploadResult.documentId,
    testUserId,
    textBuffer,
  );

  assert.equal(confirmResult.processingStatus, ProcessingStatus.COMPLETE);
  assert.equal(confirmResult.userId, testUserId);
  assert.ok(confirmResult.extractedText);
  assert.equal(confirmResult.chunksCount, 1);
});

test('Confirm Upload Regression - handles missing buffer gracefully without crashing', async () => {
  const docService = new DocumentService();
  const testUserId = 'user_regression_missing';

  const uploadResult = await docService.initiateUpload(testUserId, {
    filename: 'missing_file.txt',
    contentType: 'text/plain',
    size: 300,
  });

  // Call confirm without buffer (simulating missing GCS object + no providedBuffer)
  const result = await docService.confirmAndProcessUpload(
    uploadResult.documentId,
    testUserId,
    undefined,
  );

  // Must mark status as failed with explanatory errorMessage, not throw unhandled rejection
  assert.equal(result.processingStatus, ProcessingStatus.FAILED);
  assert.ok(result.errorMessage);
});
