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

// Synthetic single-page text PDF
const singlePagePdfBinary =
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n5 0 obj<</Length 56>>stream\nBT /F1 12 Tf 72 712 Td (LEGAL LEASE AGREEMENT SECTION 1) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000313 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n419\n%%EOF';

// Synthetic multi-page text PDF
const multiPagePdfBinary =
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 2/Kids[3 0 R 6 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n5 0 obj<</Length 44>>stream\nBT /F1 12 Tf 72 712 Td (PAGE ONE OBLIGATIONS) Tj ET\nendstream\nendobj\n6 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 7 0 R>>endobj\n7 0 obj<</Length 44>>stream\nBT /F1 12 Tf 72 712 Td (PAGE TWO TERMINATION) Tj ET\nendstream\nendobj\nxref\n0 8\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000121 00000 n \n0000000250 00000 n \n0000000319 00000 n \n0000000413 00000 n \n0000000542 00000 n \ntrailer<</Size 8/Root 1 0 R>>\nstartxref\n636\n%%EOF';

// Synthetic scanned PDF (no text streams)
const scannedPdfBinary =
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R>>endobj\n4 0 obj<</Length 0>>stream\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000213 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n264\n%%EOF';

test('ExtractionService - PDF document extraction (valid text-based PDF)', async () => {
  const service = new ExtractionService();
  const pdfBuffer = Buffer.from(singlePagePdfBinary);

  const result = await service.extractText(pdfBuffer, 'application/pdf');
  assert.equal(result.pageCount, 1);
  assert.ok(result.wordCount >= 4);
  assert.ok(result.text.includes('LEGAL LEASE AGREEMENT'));
});

test('ExtractionService - PDF document extraction (multi-page text PDF)', async () => {
  const service = new ExtractionService();
  const pdfBuffer = Buffer.from(multiPagePdfBinary);

  const result = await service.extractText(pdfBuffer, 'application/pdf');
  assert.equal(result.pageCount, 2);
  assert.ok(result.text.includes('PAGE ONE OBLIGATIONS'));
  assert.ok(result.text.includes('PAGE TWO TERMINATION'));
});

test('ExtractionService - PDF document extraction (scanned/image-only PDF produces clear OCR error)', async () => {
  const service = new ExtractionService();
  const pdfBuffer = Buffer.from(scannedPdfBinary);

  await assert.rejects(
    async () => {
      await service.extractText(pdfBuffer, 'application/pdf');
    },
    (err: Error) => {
      assert.ok(err.message.includes('UNSUPPORTED_PDF_CONTENT'));
      assert.ok(err.message.includes('OCR is required'));
      return true;
    },
  );
});

test('ExtractionService - PDF document extraction (corrupted PDF produces controlled parse error)', async () => {
  const service = new ExtractionService();
  // Valid magic byte header but corrupt body
  const corruptPdfBuffer = Buffer.from('%PDF-1.4\nCorrupted garbage data that is not a valid PDF');

  await assert.rejects(
    async () => {
      await service.extractText(corruptPdfBuffer, 'application/pdf');
    },
    (err: Error) => {
      assert.ok(err.message.includes('PDF_PARSE_FAILED'));
      return true;
    },
  );
});
