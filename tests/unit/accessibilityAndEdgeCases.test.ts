import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateClientFile,
  MAX_FILE_SIZE_BYTES,
} from '../../frontend/src/utils/clientUploadValidation';
import { AIService } from '../../backend/src/services/aiService';

test('accessibilityAndEdgeCases - rejects files exceeding 10 MB maximum size limit', () => {
  const hugeFile = {
    name: 'huge_document.pdf',
    size: MAX_FILE_SIZE_BYTES + 1024,
    type: 'application/pdf',
  } as any;

  const result = validateClientFile(hugeFile);
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('exceeds maximum allowed limit of 10 MB'));
});

test('accessibilityAndEdgeCases - rejects 0-byte empty files', () => {
  const emptyFile = {
    name: 'empty.txt',
    size: 0,
    type: 'text/plain',
  } as any;

  const result = validateClientFile(emptyFile);
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('empty'));
});

test('accessibilityAndEdgeCases - handles empty document text gracefully in AI Service', async () => {
  const aiService = new AIService();
  const res = await aiService.analyzeDocument('doc_empty', 'user_1', '');

  assert.ok(res.results);
  assert.ok(res.results.summary);
  assert.ok(Array.isArray(res.results.clauses));
  assert.ok(res.results.disclaimer);
});

test('accessibilityAndEdgeCases - accepts valid PDF and DOCX files', () => {
  const pdfFile = {
    name: 'contract.pdf',
    size: 2 * 1024 * 1024,
    type: 'application/pdf',
  } as any;

  const docxFile = {
    name: 'agreement.docx',
    size: 1 * 1024 * 1024,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  } as any;

  assert.equal(validateClientFile(pdfFile).valid, true);
  assert.equal(validateClientFile(docxFile).valid, true);
});
