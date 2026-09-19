import test from 'node:test';
import assert from 'node:assert/strict';
import { ExtractionService } from '../../backend/src/services/extractionService';

test('ExtractionService - magic byte signature validation', () => {
  const service = new ExtractionService();

  // Valid PDF signature %PDF-
  const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
  assert.equal(service.validateFileSignature(pdfBuffer, 'application/pdf'), true);

  // Invalid PDF signature
  const fakePdfBuffer = Buffer.from('NOT_A_PDF_HEADER');
  assert.equal(service.validateFileSignature(fakePdfBuffer, 'application/pdf'), false);

  // Valid DOCX signature PK\x03\x04
  const docxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
  assert.equal(
    service.validateFileSignature(
      docxBuffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ),
    true,
  );

  // Valid TXT signature (no null bytes)
  const txtBuffer = Buffer.from('Standard plaintext legal agreement contents.');
  assert.equal(service.validateFileSignature(txtBuffer, 'text/plain'), true);

  // Invalid TXT signature (contains null byte)
  const binaryBuffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x00, 0x6f]);
  assert.equal(service.validateFileSignature(binaryBuffer, 'text/plain'), false);
});

test('ExtractionService - text normalization', () => {
  const service = new ExtractionService();
  const rawInput = '   Section 1.0 \r\n\r\n\r\n   This agreement   contains \0 null bytes.  ';
  const normalized = service.normalizeText(rawInput);

  assert.equal(normalized.includes('\r'), false);
  assert.equal(normalized.includes('\0'), false);
  assert.equal(normalized.includes('   '), false);
  assert.equal(normalized, 'Section 1.0\n\nThis agreement contains null bytes.');
});

test('ExtractionService - text chunking (<= 3,000 words)', () => {
  const service = new ExtractionService();
  const words = Array.from({ length: 7000 }, (_, i) => `word${i + 1}`).join(' ');
  const chunks = service.chunkText(words, 3000);

  assert.equal(chunks.length, 3);
  assert.equal(chunks[0]!.wordCount, 3000);
  assert.equal(chunks[1]!.wordCount, 3000);
  assert.equal(chunks[2]!.wordCount, 1000);
});

test('ExtractionService - TXT document extraction', async () => {
  const service = new ExtractionService();
  const sampleTxt = Buffer.from(
    'LEGAL AGREEMENT\n\n1. Obligations\nThe tenant agrees to pay rent on time.',
  );

  const result = await service.extractText(sampleTxt, 'text/plain');
  assert.equal(result.wordCount > 5, true);
  assert.equal(result.chunks.length, 1);
  assert.ok(result.text.includes('LEGAL AGREEMENT'));
});
