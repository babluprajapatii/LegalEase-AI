import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';
import { ProcessingStatus } from '../../backend/src/types';

test('Upload Confirm Regression - confirmAndProcessUpload succeeds with valid text buffer', async () => {
  const docService = new DocumentService();
  const userId = 'user_confirm_regression';

  const uploadResult = await docService.initiateUpload(userId, {
    filename: 'legal_notice.txt',
    contentType: 'text/plain',
    size: 120,
  });

  const buffer = Buffer.from(
    'LEGAL NOTICE: This document contains confidential terms and termination conditions requiring 30 days notice.',
  );

  const confirmedDoc = await docService.confirmAndProcessUpload(
    uploadResult.documentId,
    userId,
    buffer,
  );

  assert.equal(confirmedDoc.processingStatus, ProcessingStatus.COMPLETE);
  assert.equal(confirmedDoc.chunksCount, 1);
  assert.ok(confirmedDoc.extractedText?.includes('LEGAL NOTICE'));
});

test('Upload Confirm Regression - rejects invalid magic byte signature gracefully with status FAILED', async () => {
  const docService = new DocumentService();
  const userId = 'user_bad_signature';

  const uploadResult = await docService.initiateUpload(userId, {
    filename: 'fake_document.pdf',
    contentType: 'application/pdf',
    size: 100,
  });

  // Plain text buffer pretending to be a PDF
  const invalidPdfBuffer = Buffer.from('This is plain text, not a PDF magic header.');

  const confirmedDoc = await docService.confirmAndProcessUpload(
    uploadResult.documentId,
    userId,
    invalidPdfBuffer,
  );

  assert.equal(confirmedDoc.processingStatus, ProcessingStatus.FAILED);
  assert.ok(confirmedDoc.errorMessage?.includes('magic bytes do not match'));
});

test('Upload Confirm Regression - enforces ownership check during confirmAndProcessUpload', async () => {
  const docService = new DocumentService();
  const ownerId = 'user_real_owner';
  const unauthorizedId = 'user_unauthorized';

  const uploadResult = await docService.initiateUpload(ownerId, {
    filename: 'private_agreement.txt',
    contentType: 'text/plain',
    size: 80,
  });

  const buffer = Buffer.from('Private contract terms.');

  await assert.rejects(
    async () => {
      await docService.confirmAndProcessUpload(uploadResult.documentId, unauthorizedId, buffer);
    },
    (err: Error) => {
      return err.message.includes('Access denied');
    },
  );
});
