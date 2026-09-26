'use client';

import { API_URL, type DocumentMetadata, type ApiResponse } from './api';

/**
 * Helper wrapper for fetch that catches network-level failures ("TypeError: Failed to fetch")
 * and converts them into clear, user-friendly error messages.
 */
async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
      throw new Error('Unable to reach the LegalEase-AI server. Please try again.');
    }
    throw err;
  }
}

/**
 * Helper to parse response JSON and map HTTP status codes to clean user-friendly messages.
 */
async function handleResponse<T>(response: Response, fallbackErrorMsg: string): Promise<T> {
  if (!response.ok) {
    let serverMessage: string | undefined;
    try {
      const errorData = await response.json();
      serverMessage = errorData.error || errorData.message;
    } catch {
      // Ignore JSON parse error if body is empty or non-JSON
    }

    if (serverMessage) {
      throw new Error(serverMessage);
    }

    switch (response.status) {
      case 401:
        throw new Error('Your session has expired. Please sign in again.');
      case 403:
        throw new Error('You do not have permission to access this document.');
      case 404:
        throw new Error('Document not found.');
      case 500:
        throw new Error('Something went wrong while processing this request.');
      default:
        throw new Error(fallbackErrorMsg);
    }
  }

  return response.json() as Promise<T>;
}

export async function upsertUser(token: string) {
  const response = await safeFetch(`${API_URL}/users/me`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ApiResponse<{ uid: string; email?: string }>>(
    response,
    'Failed to update user profile',
  );
}

export interface InitiateUploadResponse {
  documentId: string;
  signedUploadUrl: string;
  storagePath: string;
  processingStatus: string;
  metadata: DocumentMetadata;
}

export async function initiateUpload(
  token: string,
  filename: string,
  contentType: string,
  size: number,
): Promise<InitiateUploadResponse> {
  const response = await safeFetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filename, contentType, size }),
  });

  const data = await handleResponse<ApiResponse<InitiateUploadResponse>>(
    response,
    'Could not initiate upload',
  );
  if (!data.data) throw new Error('Invalid response from server');
  return data.data;
}

export async function confirmUpload(
  token: string,
  documentId: string,
  fileData?: string,
): Promise<DocumentMetadata> {
  const response = await safeFetch(`${API_URL}/documents/${documentId}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fileData ? { fileData } : {}),
  });

  const data = await handleResponse<ApiResponse<DocumentMetadata>>(
    response,
    'Document processing failed',
  );
  if (!data.data) throw new Error('Invalid response from server');
  return data.data;
}

export async function listDocuments(token: string): Promise<DocumentMetadata[]> {
  const response = await safeFetch(`${API_URL}/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await handleResponse<ApiResponse<DocumentMetadata[]>>(
    response,
    'Failed to fetch documents',
  );
  return data.data || [];
}

export async function getDocument(token: string, documentId: string): Promise<DocumentMetadata> {
  const response = await safeFetch(`${API_URL}/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await handleResponse<ApiResponse<DocumentMetadata>>(
    response,
    'Could not fetch document details',
  );
  if (!data.data) throw new Error('Document not found');
  return data.data;
}

export type UploadProgressCallback = (loaded: number, total: number) => void;

export function uploadToStorage(
  signedUrl: string,
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded, event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed due to network error'));
    xhr.send(file);
  });
}

export async function analyzeDocument(token: string, documentId: string) {
  const response = await safeFetch(`${API_URL}/documents/${documentId}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse<any>(response, 'Analysis failed');
}

export async function getAnalysis(token: string, documentId: string) {
  const response = await safeFetch(`${API_URL}/documents/${documentId}/analysis`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse<any>(response, 'Could not fetch analysis');
}

export async function askQuestion(token: string, documentId: string, question: string) {
  const response = await safeFetch(`${API_URL}/documents/${documentId}/qa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question }),
  });

  return handleResponse<any>(response, 'Q&A request failed');
}

export async function getQASessions(token: string, documentId: string) {
  const response = await safeFetch(`${API_URL}/documents/${documentId}/qa`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse<any>(response, 'Could not fetch Q&A history');
}

export async function compareDocuments(token: string, documentId1: string, documentId2: string) {
  const response = await safeFetch(`${API_URL}/documents/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ documentId1, documentId2 }),
  });

  return handleResponse<any>(response, 'Document comparison failed');
}

export async function getComparisons(token: string) {
  const response = await safeFetch(`${API_URL}/documents/comparisons`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse<any>(response, 'Could not fetch comparisons');
}

export async function explainClause(
  token: string,
  documentId: string,
  clauseName: string,
  originalText?: string,
) {
  const response = await safeFetch(`${API_URL}/documents/${documentId}/explain-clause`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ clauseName, originalText }),
  });

  return handleResponse<any>(response, 'Could not explain clause');
}

export async function deleteDocument(token: string, documentId: string): Promise<void> {
  const response = await safeFetch(`${API_URL}/documents/${documentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  await handleResponse<any>(response, 'Could not delete document');
}
