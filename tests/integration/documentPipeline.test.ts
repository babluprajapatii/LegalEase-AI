import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';

test('Integration - Document Pipeline: initiate, extract, retrieve, list, and delete', async () => {
  process.env.NODE_ENV = 'test';
  const service = new DocumentService();
  const userId = 'test_user_777';

  // 1. Initiate upload
  const uploadResult = await service.initiateUpload(userId, {
    filename: 'rental_contract.txt',
    contentType: 'text/plain',
    size: 512,
  });

  assert.ok(uploadResult.documentId.startsWith('doc_'));
  assert.equal(uploadResult.processingStatus, 'uploading');

  // 2. Confirm direct upload and execute extraction pipeline
  const textBuffer = Buffer.from(
    'RENTAL AGREEMENT\n\n1. Rent: The tenant shall pay $1,500 monthly.\n2. Security Deposit: $1,500 due at signing.',
  );
  const processedDoc = await service.confirmAndProcessUpload(
    uploadResult.documentId,
    userId,
    textBuffer,
  );

  assert.equal(processedDoc.processingStatus, 'complete');
  assert.equal(processedDoc.wordCount! > 10, true);
  assert.equal(processedDoc.chunksCount, 1);

  // 3. Retrieve document with ownership check
  const retrievedDoc = await service.getDocumentById(uploadResult.documentId, userId);
  assert.equal(retrievedDoc.id, uploadResult.documentId);

  // 4. Cross-user access check -> must throw error
  await assert.rejects(
    async () => {
      await service.getDocumentById(uploadResult.documentId, 'unauthorized_user_999');
    },
    (err: Error) => err.message.includes('Access denied'),
  );

  // 5. User documents listing
  const userDocs = await service.getUserDocuments(userId);
  assert.equal(
    userDocs.some((d) => d.id === uploadResult.documentId),
    true,
  );

  // 6. Delete document
  await service.deleteDocument(uploadResult.documentId, userId);
  const userDocsAfterDelete = await service.getUserDocuments(userId);
  assert.equal(
    userDocsAfterDelete.some((d) => d.id === uploadResult.documentId),
    false,
  );
});
