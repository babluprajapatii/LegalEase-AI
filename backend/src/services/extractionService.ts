import mammoth from 'mammoth';
import { logger } from '../utils/logging';

export interface ExtractedDocument {
  text: string;
  pageCount: number;
  wordCount: number;
  chunks: DocumentChunk[];
}

export interface DocumentChunk {
  chunkIndex: number;
  text: string;
  wordCount: number;
}

export class ExtractionService {
  /**
   * Inspects magic bytes to verify file integrity matches claimed content type.
   */
  validateFileSignature(buffer: Buffer, contentType: string): boolean {
    if (!buffer || buffer.length === 0) return false;

    if (contentType === 'application/pdf') {
      // PDF header: %PDF- (0x25 0x50 0x44 0x46 0x2D)
      const isPdf =
        buffer.length >= 5 &&
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46 &&
        buffer[4] === 0x2d;
      return isPdf;
    }

    if (
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      contentType === 'application/docx'
    ) {
      // DOCX (ZIP archive) header: PK\x03\x04 (0x50 0x4B 0x03 0x04)
      const isZip =
        buffer.length >= 4 &&
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04;
      return isZip;
    }

    if (contentType === 'text/plain') {
      // Text file check: no binary null bytes in first 512 bytes
      const sample = buffer.subarray(0, Math.min(buffer.length, 512));
      for (let i = 0; i < sample.length; i++) {
        if (sample[i] === 0) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Main entry point for extracting text based on file type.
   */
  async extractText(buffer: Buffer, contentType: string): Promise<ExtractedDocument> {
    if (!buffer || buffer.length === 0) {
      throw new Error('Document buffer is empty (0 bytes).');
    }

    let rawText = '';
    let pageCount = 1;

    if (contentType === 'application/pdf') {
      const pdfResult = await this.extractPdfText(buffer);
      rawText = pdfResult.text;
      pageCount = pdfResult.pageCount;
    } else if (
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      contentType === 'application/docx'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
      // Estimate 500 words per page for DOCX
      const wordEstimate = rawText.trim().split(/\s+/).filter(Boolean).length;
      pageCount = Math.max(1, Math.ceil(wordEstimate / 500));
    } else if (contentType === 'text/plain') {
      rawText = buffer.toString('utf-8');
      const wordEstimate = rawText.trim().split(/\s+/).filter(Boolean).length;
      pageCount = Math.max(1, Math.ceil(wordEstimate / 500));
    } else {
      throw new Error(`Unsupported content type for text extraction: ${contentType}`);
    }

    const normalizedText = this.normalizeText(rawText);
    const contentWithoutMarkers = normalizedText.replace(/-- \d+ of \d+ --/g, '').trim();
    const wordCount = this.countWords(contentWithoutMarkers);

    if (wordCount === 0 || contentWithoutMarkers.length === 0) {
      if (contentType === 'application/pdf') {
        throw new Error(
          'UNSUPPORTED_PDF_CONTENT: This PDF does not contain extractable text. OCR is required for scanned/image-only PDFs.',
        );
      }
      throw new Error('Empty or unextractable document content.');
    }

    const chunks = this.chunkText(normalizedText, 3000);

    logger.info('Text extracted successfully', {
      contentType,
      pageCount,
      wordCount,
      chunksCount: chunks.length,
    });

    return {
      text: normalizedText,
      pageCount,
      wordCount,
      chunks,
    };
  }

  /**
   * Dedicated PDF extraction function that parses PDF binary data via PDFParse,
   * handles multi-page documents, and detects empty/scanned PDFs.
   */
  async extractPdfText(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF_EMPTY_BUFFER: PDF buffer is empty (0 bytes).');
    }

    let rawText = '';
    let pageCount = 1;
    let parser: any = null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PDFParse } = require('pdf-parse');
      const uint8Array = new Uint8Array(buffer);
      parser = new PDFParse({ data: uint8Array });
      const result = await parser.getText();
      rawText = result.text || '';
      pageCount = result.total || 1;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.startsWith('PDF_') || message.startsWith('UNSUPPORTED_')) {
        throw err;
      }
      logger.error('PDF parsing failed', { error: message });
      throw new Error(
        `PDF_PARSE_FAILED: Failed to parse PDF document. The file may be corrupt or password protected. (${message})`,
      );
    } finally {
      if (parser && typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    }

    return {
      text: rawText,
      pageCount,
    };
  }

  /**
   * Normalizes extracted text: standardizes line endings, strips null bytes & excess space per line.
   */
  normalizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\0/g, '') // remove null characters
      .replace(/\r\n/g, '\n') // standardize Windows CRLF to LF
      .replace(/\r/g, '\n') // standardize Mac CR to LF
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // collapse multi-newlines
      .trim();
  }

  /**
   * Counts words in text string.
   */
  countWords(text: string): number {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  /**
   * Splits normalized text into chunks of at most maxWords per chunk (default <= 3000 words).
   */
  chunkText(text: string, maxWordsPerChunk = 3000): DocumentChunk[] {
    const words = text.trim().split(/\s+/).filter(Boolean);

    if (words.length <= maxWordsPerChunk) {
      return [
        {
          chunkIndex: 0,
          text,
          wordCount: words.length,
        },
      ];
    }

    const chunks: DocumentChunk[] = [];
    let currentIndex = 0;
    let currentChunkWords: string[] = [];

    for (const word of words) {
      currentChunkWords.push(word);
      if (currentChunkWords.length >= maxWordsPerChunk) {
        const chunkText = currentChunkWords.join(' ');
        chunks.push({
          chunkIndex: currentIndex++,
          text: chunkText,
          wordCount: currentChunkWords.length,
        });
        currentChunkWords = [];
      }
    }

    if (currentChunkWords.length > 0) {
      const chunkText = currentChunkWords.join(' ');
      chunks.push({
        chunkIndex: currentIndex,
        text: chunkText,
        wordCount: currentChunkWords.length,
      });
    }

    return chunks;
  }
}
