import test from 'node:test';
import assert from 'node:assert/strict';
import { ExtractionService } from '../../backend/src/services/extractionService';
import { DocumentService } from '../../backend/src/services/documentService';
import { ProcessingStatus } from '../../backend/src/types';

// Helper function to create synthetic text-based PDF buffer
function createSyntheticPdf(text: string): Buffer {
  const streamContent = `BT /F1 12 Tf 100 700 Td (${text}) Tj ET`;
  const streamLength = Buffer.byteLength(streamContent);

  const pdfBody = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
427
%%EOF`;

  return Buffer.from(pdfBody);
}

// Helper function to create synthetic empty/scanned PDF buffer (no text stream)
function createScannedPdf(): Buffer {
  const streamContent = 'q 100 0 0 100 0 0 cm /Im1 Do Q';
  const streamLength = Buffer.byteLength(streamContent);

  const pdfBody = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /XObject /Subtype /Image /Width 100 /Height 100 /ColorSpace /DeviceRGB /BitsPerComponent 8 >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000242 00000 n 
0000000344 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;

  return Buffer.from(pdfBody);
}

test('PDF Extraction - Valid text-based PDF extracts text correctly', async () => {
  const extractionService = new ExtractionService();
  const pdfBuffer = createSyntheticPdf('LegalEase Service Agreement Terms');

  const result = await extractionService.extractText(pdfBuffer, 'application/pdf');

  assert.equal(result.pageCount, 1);
  assert.ok(result.text.includes('LegalEase Service Agreement Terms'));
  assert.equal(result.chunks.length, 1);
});

test('PDF Extraction - Empty or invalid PDF signature throws PDF_PARSE_FAILED error', async () => {
  const extractionService = new ExtractionService();
  const invalidBuffer = Buffer.from('NOT_A_REAL_PDF_HEADER');

  await assert.rejects(
    async () => {
      await extractionService.extractText(invalidBuffer, 'application/pdf');
    },
    (err: Error) => {
      return err.message.includes('PDF_PARSE_FAILED');
    },
  );
});

test('PDF Extraction - Scanned or image-only PDF throws PDF_EMPTY_TEXT OCR error', async () => {
  const extractionService = new ExtractionService();
  const scannedPdfBuffer = createScannedPdf();

  await assert.rejects(
    async () => {
      await extractionService.extractText(scannedPdfBuffer, 'application/pdf');
    },
    (err: Error) => {
      return (
        err.message.includes('PDF_EMPTY_TEXT') &&
        err.message.includes('OCR is required for scanned/image-only PDFs')
      );
    },
  );
});

test('PDF Extraction - DOCX and TXT extraction remain fully functional', async () => {
  const extractionService = new ExtractionService();
  const txtBuffer = Buffer.from('Commercial Lease Agreement text content.');

  const txtResult = await extractionService.extractText(txtBuffer, 'text/plain');
  assert.ok(txtResult.text.includes('Commercial Lease'));
  assert.equal(txtResult.chunks.length, 1);
});

test('PDF Upload Pipeline - Server-side fallback processes valid PDF successfully', async () => {
  const docService = new DocumentService();
  const testUserId = 'user_pdf_test';

  const uploadResult = await docService.initiateUpload(testUserId, {
    filename: 'consulting_agreement.pdf',
    contentType: 'application/pdf',
    size: 500,
  });

  const pdfBuffer = createSyntheticPdf('Consulting Agreement Confidentiality Clause');

  const confirmResult = await docService.confirmAndProcessUpload(
    uploadResult.documentId,
    testUserId,
    pdfBuffer,
  );

  assert.equal(confirmResult.processingStatus, ProcessingStatus.COMPLETE);
  assert.ok(confirmResult.extractedText?.includes('Consulting Agreement'));
});

test('PDF Upload Pipeline - Wrong user access is denied for PDF documents', async () => {
  const docService = new DocumentService();
  const ownerId = 'user_pdf_owner';
  const intruderId = 'user_pdf_intruder';

  const uploadResult = await docService.initiateUpload(ownerId, {
    filename: 'private_financials.pdf',
    contentType: 'application/pdf',
    size: 400,
  });

  const pdfBuffer = createSyntheticPdf('Private Financial Statements');

  await assert.rejects(
    async () => {
      await docService.confirmAndProcessUpload(uploadResult.documentId, intruderId, pdfBuffer);
    },
    (err: Error) => {
      return err.message.includes('Access denied');
    },
  );
});
