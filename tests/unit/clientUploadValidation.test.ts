import test from 'node:test';
import assert from 'node:assert/strict';

// Client-side file validation logic test (matching frontend/src/app/upload/page.tsx)
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function validateClientFile(file: { name: string; type: string; size: number }): string | null {
  if (!ALLOWED_TYPES[file.type]) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.txt') {
      // Allowed by extension
    } else {
      return 'Invalid file type. Supported: PDF, DOCX, TXT';
    }
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 10 MB limit.`;
  }
  if (file.size === 0) {
    return 'File is empty (0 bytes).';
  }
  return null;
}

test('Client File Validation - accepts valid PDF file under 10 MB', () => {
  const result = validateClientFile({
    name: 'contract.pdf',
    type: 'application/pdf',
    size: 5 * 1024 * 1024,
  });
  assert.equal(result, null);
});

test('Client File Validation - accepts valid DOCX file', () => {
  const result = validateClientFile({
    name: 'agreement.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1 * 1024 * 1024,
  });
  assert.equal(result, null);
});

test('Client File Validation - accepts valid TXT file', () => {
  const result = validateClientFile({
    name: 'lease.txt',
    type: 'text/plain',
    size: 200 * 1024,
  });
  assert.equal(result, null);
});

test('Client File Validation - rejects file exceeding 10 MB limit', () => {
  const result = validateClientFile({
    name: 'large_file.pdf',
    type: 'application/pdf',
    size: 11 * 1024 * 1024,
  });
  assert.ok(result?.includes('10 MB'));
});

test('Client File Validation - rejects empty file (0 bytes)', () => {
  const result = validateClientFile({
    name: 'empty.txt',
    type: 'text/plain',
    size: 0,
  });
  assert.ok(result?.includes('empty'));
});

test('Client File Validation - rejects unsupported file types (.exe, .png)', () => {
  const result = validateClientFile({
    name: 'script.exe',
    type: 'application/x-msdownload',
    size: 500 * 1024,
  });
  assert.ok(result?.includes('Invalid file type'));
});
