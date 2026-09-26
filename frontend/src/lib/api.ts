function getApiUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

export const API_URL = getApiUrl();

export interface DocumentMetadata {
  id: string;
  userId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadDate: Date;
  processingStatus: string;
  storagePath: string;
  pageCount?: number;
  wordCount?: number;
  chunksCount?: number;
  extractedText?: string;
  errorMessage?: string;
  analysisIds: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function fetchWithAuth(
  input: string,
  init: RequestInit = {},
  token?: string,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
