import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../../backend/src/services/documentService';

test('Document Validation - accepts valid PDF file under 10 MB', async () => {
  const service = new DocumentService();
  const result = await service.validateDocumentUpload({
    filename: 'legal_agreement.pdf',
    contentType: 'application/pdf',
    size: 2 * 1024 * 1024, // 2 MB
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
});

test('Document Validation - accepts valid DOCX file under 10 MB', async () => {
  const service = new DocumentService();
  const result = await service.validateDocumentUpload({
    filename: 'employment_contract.docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 5 * 1024 * 1024, // 5 MB
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
});

test('Document Validation - accepts valid TXT file under 10 MB', async () => {
  const service = new DocumentService();
  const result = await service.validateDocumentUpload({
    filename: 'notes.txt',
    contentType: 'text/plain',
    size: 50 * 1024, // 50 KB
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
});

test('Document Validation - rejects file exceeding 10 MB limit', async () => {
  const service = new DocumentService();
  const result = await service.validateDocumentUpload({
    filename: 'huge_document.pdf',
    contentType: 'application/pdf',
    size: 11 * 1024 * 1024, // 11 MB
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((err) => err.includes('10 MB')));
});

test('Document Validation - rejects empty file (0 bytes)', async () => {
  const service = new DocumentService();
  const result = await service.validateDocumentUpload({
    filename: 'empty.pdf',
    contentType: 'application/pdf',
    size: 0,
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((err) => err.includes('empty')));
});

test('Document Validation - rejects unsupported file extensions (.exe, .jpg, .html)', async () => {
  const service = new DocumentService();
  const result = await service.validateDocumentUpload({
    filename: 'malicious.exe',
    contentType: 'application/pdf',
    size: 1024,
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.some((err) => err.includes('extension')));
});

test('Document Validation - sanitizes malicious path traversal filenames', () => {
  const service = new DocumentService();
  const sanitized = service.sanitizeFilename('../../../etc/passwd');
  assert.equal(sanitized.includes('/'), false);
  assert.equal(sanitized.includes('..'), true);
});
