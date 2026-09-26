'use client';

import { API_URL, type DocumentMetadata, type ApiResponse } from './api';

export async function upsertUser(token: string) {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to upsert user: ${response.statusText}`);
  }
  return response.json() as Promise<ApiResponse<{ uid: string; email?: string }>>;
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
  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filename, contentType, size }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Could not initiate upload');
  }

  const data = (await response.json()) as ApiResponse<InitiateUploadResponse>;
  if (!data.data) throw new Error('Invalid response from server');
  return data.data;
}

export async function confirmUpload(
  token: string,
  documentId: string,
  fileData?: string,
): Promise<DocumentMetadata> {
  const response = await fetch(`${API_URL}/documents/${documentId}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fileData ? { fileData } : {}),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Document processing failed');
  }

  const data = (await response.json()) as ApiResponse<DocumentMetadata>;
  if (!data.data) throw new Error('Invalid response from server');
  return data.data;
}

export async function listDocuments(token: string): Promise<DocumentMetadata[]> {
  const response = await fetch(`${API_URL}/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  const data = (await response.json()) as ApiResponse<DocumentMetadata[]>;
  return data.data || [];
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
  const response = await fetch(`${API_URL}/documents/${documentId}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Analysis failed');
  }

  return response.json();
}

export async function getAnalysis(token: string, documentId: string) {
  const response = await fetch(`${API_URL}/documents/${documentId}/analysis`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Could not fetch analysis');
  }

  return response.json();
}

export async function askQuestion(token: string, documentId: string, question: string) {
  const response = await fetch(`${API_URL}/documents/${documentId}/qa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Q&A request failed');
  }

  return response.json();
}

export async function getQASessions(token: string, documentId: string) {
  const response = await fetch(`${API_URL}/documents/${documentId}/qa`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Could not fetch Q&A history');
  }

  return response.json();
}

export async function compareDocuments(token: string, documentId1: string, documentId2: string) {
  const response = await fetch(`${API_URL}/documents/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ documentId1, documentId2 }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Document comparison failed');
  }

  return response.json();
}

export async function getComparisons(token: string) {
  const response = await fetch(`${API_URL}/documents/comparisons`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Could not fetch comparisons');
  }

  return response.json();
}

export async function explainClause(
  token: string,
  documentId: string,
  clauseName: string,
  originalText?: string,
) {
  const response = await fetch(`${API_URL}/documents/${documentId}/explain-clause`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ clauseName, originalText }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Could not explain clause');
  }

  return response.json();
}

export async function deleteDocument(token: string, documentId: string): Promise<void> {
  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Could not delete document');
  }
}

