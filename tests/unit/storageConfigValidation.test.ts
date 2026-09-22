import test from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../../backend/src/config/env';
import { StorageService } from '../../backend/src/services/storageService';

test('Storage Config Validation - resolves real bucket name and avoids placeholder', () => {
  assert.notEqual(env.GCS_BUCKET_NAME, 'your_bucket_name_here');
  assert.ok(env.GCS_BUCKET_NAME && env.GCS_BUCKET_NAME.includes('legalease-ai-78a55'));
});

test('Storage Config Validation - storage path is user-scoped', () => {
  const service = new StorageService();
  const path = service.getStoragePath('test-user-123', 'doc-456');
  assert.equal(path, 'users/test-user-123/documents/doc-456/original');
});
