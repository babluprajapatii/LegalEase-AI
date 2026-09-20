'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../lib/auth-context';
import { listDocuments } from '../../lib/api-client';
import type { DocumentMetadata } from '../../lib/api';

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Documents list page — shows all user documents with search and filter.
 * Matches Figma 04-documents.png.
 */
function DocumentsContent() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchDocuments() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const docs = await listDocuments(token);
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [token]);

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div className="dashboard">
          <div className="section-header">
            <h1>All Documents</h1>
            <Link href="/upload" className="btn-primary">
              ⬆ Upload New
            </Link>
          </div>

          <div className="search-bar">
            <span className="search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              id="all-documents-search"
              type="search"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search documents"
            />
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner-lg" />
              <p>Loading documents...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                📄
              </div>
              {documents.length === 0 ? (
                <>
                  <h3>No documents yet</h3>
                  <p>Upload your first legal document to get started.</p>
                  <Link href="/upload" className="btn-primary">
                    Upload a Document
                  </Link>
                </>
              ) : (
                <>
                  <h3>No matching documents</h3>
                  <p>Try adjusting your search query.</p>
                </>
              )}
            </div>
          ) : (
            <div className="document-list" role="list" aria-label="All documents">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="document-card" role="listitem">
                  <div className="document-icon" aria-hidden="true">
                    📄
                  </div>
                  <div className="document-info">
                    <h3>{doc.filename}</h3>
                    <span className="document-meta">
                      {formatDate(doc.uploadDate)}
                      {' · '}
                      {formatFileSize(doc.size)}
                      {doc.pageCount ? ` · ${doc.pageCount} pages` : ''}
                    </span>
                  </div>
                  <div className="document-actions">
                    <StatusBadge status={doc.processingStatus} />
                    <Link href={`/documents/${doc.id}`} className="view-btn">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  );
}
