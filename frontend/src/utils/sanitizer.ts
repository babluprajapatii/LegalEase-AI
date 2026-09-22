/**
 * Sanitization Utility for XSS Prevention and HTML Tag Stripping
 * Ensures AI outputs and user text inputs are safely neutralized before rendering or processing.
 */

/**
 * Strips HTML tags and script elements from a string to prevent XSS.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  return input
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Escapes special HTML entities for safe inclusion in plain text contexts.
 */
export function escapeHtml(input: string): string {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Neutralizes potential prompt injection markers (<document_content>, System:, etc.) from user inputs.
 */
export function sanitizePromptText(input: string): string {
  if (!input) return '';

  return input
    .replace(/<\/?document_content>/gi, '[filtered_tag]')
    .replace(/<\/?system>/gi, '[filtered_tag]')
    .replace(/<\/?instruction>/gi, '[filtered_tag]');
}
