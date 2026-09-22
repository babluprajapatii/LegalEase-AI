/**
 * Client-Side File Upload Validation Utility
 * Enforces file size limits (10 MB), allowed MIME types (PDF, DOCX, TXT), and extension checks.
 */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateClientFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMB} MB) exceeds maximum allowed limit of 10 MB`,
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

  if (!hasValidExt) {
    return {
      valid: false,
      error: `Unsupported file type. Only PDF (.pdf), Word (.docx), and Text (.txt) files are allowed.`,
    };
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    // If MIME type is present and not in allowed list, reject unless it's text/plain variant
    if (!file.type.startsWith('text/')) {
      return {
        valid: false,
        error: `Invalid file MIME type (${file.type}). Only PDF, Word, and Plain Text files are supported.`,
      };
    }
  }

  return { valid: true };
}
