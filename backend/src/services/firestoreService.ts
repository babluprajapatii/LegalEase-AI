import { getFirestoreDb } from '../config/firebase';
import { env } from '../config/env';
import { logger } from '../utils/logging';
import { DocumentMetadata } from '../types';

export interface ExtendedDocumentMetadata extends DocumentMetadata {
  storagePath?: string;
  pageCount?: number;
  wordCount?: number;
  chunksCount?: number;
  extractedText?: string; // Never persisted to Firestore per rules.md §19
  errorMessage?: string;
  updatedAt?: Date;
}

export class FirestoreService {
  private inMemoryStore: Map<string, ExtendedDocumentMetadata> = new Map();
  private userStore: Map<string, { uid: string; email?: string; updatedAt: Date }> = new Map();

  /**
   * Helper to check if Firestore instance is accessible and credentials exist.
   */
  private isFirestoreAvailable(): boolean {
    if (env.NODE_ENV === 'test') {
      return false;
    }

    if (
      !env.FIREBASE_PRIVATE_KEY &&
      !env.FIREBASE_CLIENT_EMAIL &&
      !process.env.GOOGLE_APPLICATION_CREDENTIALS
    ) {
      return false;
    }

    try {
      const db = getFirestoreDb();
      return Boolean(db);
    } catch {
      return false;
    }
  }

  /**
   * Upsert user profile record in `users` collection.
   */
  async upsertUser(user: { uid: string; email?: string }): Promise<void> {
    const record = {
      uid: user.uid,
      email: user.email,
      updatedAt: new Date(),
    };

    this.userStore.set(user.uid, record);

    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        await db.collection('users').doc(user.uid).set(record, { merge: true });
        logger.info('User record upserted in Firestore', { uid: user.uid });
      } catch (error) {
        logger.warn('Firestore user upsert failed, using fallback in-memory store', { error });
      }
    }
  }

  /**
   * Creates a new document metadata entry in `documents` collection.
   */
  async createDocument(metadata: ExtendedDocumentMetadata): Promise<ExtendedDocumentMetadata> {
    const record: ExtendedDocumentMetadata = {
      ...metadata,
      uploadDate: metadata.uploadDate || new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryStore.set(record.id, record);

    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        await db
          .collection('documents')
          .doc(record.id)
          .set({
            ...record,
            uploadDate: record.uploadDate.toISOString(),
            updatedAt: (record.updatedAt || new Date()).toISOString(),
          });
        logger.info('Document metadata saved to Firestore', {
          documentId: record.id,
          userId: record.userId,
        });
      } catch (error) {
        logger.warn('Firestore create document failed, using in-memory store fallback', { error });
      }
    }

    return record;
  }

  /**
   * Updates fields of an existing document metadata record.
   */
  async updateDocument(
    id: string,
    updates: Partial<ExtendedDocumentMetadata>,
  ): Promise<ExtendedDocumentMetadata> {
    const existing = await this.getDocument(id);
    if (!existing) {
      throw new Error(`Document metadata with ID ${id} not found.`);
    }

    const updated: ExtendedDocumentMetadata = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.inMemoryStore.set(id, updated);

    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        const firestoreUpdates: Record<string, any> = { ...updates };
        firestoreUpdates.updatedAt = (updated.updatedAt || new Date()).toISOString();
        if (updates.uploadDate) {
          firestoreUpdates.uploadDate = updates.uploadDate.toISOString();
        }
        await db.collection('documents').doc(id).update(firestoreUpdates);
        logger.info('Document metadata updated in Firestore', {
          documentId: id,
          status: updated.processingStatus,
        });
      } catch (error) {
        logger.warn('Firestore update document failed, updated in-memory store fallback', {
          error,
        });
      }
    }

    return updated;
  }

  /**
   * Retrieves a document metadata record by ID.
   */
  async getDocument(id: string): Promise<ExtendedDocumentMetadata | null> {
    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        const doc = await db.collection('documents').doc(id).get();
        if (doc.exists) {
          const data = doc.data() as Record<string, any>;
          const record: ExtendedDocumentMetadata = {
            ...data,
            id: data.id || doc.id,
            userId: data.userId,
            filename: data.filename,
            contentType: data.contentType,
            size: data.size,
            processingStatus: data.processingStatus,
            uploadDate: new Date(data.uploadDate),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
          };
          if (!record.extractedText && this.inMemoryStore.has(id)) {
            record.extractedText = this.inMemoryStore.get(id)?.extractedText;
          }
          return record;
        }
      } catch (error) {
        logger.warn('Firestore get document failed, falling back to in-memory store', { error });
      }
    }

    return this.inMemoryStore.get(id) || null;
  }

  /**
   * Lists all documents belonging to a user (user-scoped query).
   */
  async getUserDocuments(userId: string): Promise<ExtendedDocumentMetadata[]> {
    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        const snapshot = await db
          .collection('documents')
          .where('userId', '==', userId)
          .orderBy('uploadDate', 'desc')
          .get();

        const docs: ExtendedDocumentMetadata[] = [];
        snapshot.forEach((docSnapshot: any) => {
          const data = docSnapshot.data();
          docs.push({
            ...data,
            id: data.id || docSnapshot.id,
            userId: data.userId,
            filename: data.filename,
            contentType: data.contentType,
            size: data.size,
            processingStatus: data.processingStatus,
            uploadDate: new Date(data.uploadDate),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
          });
        });
        return docs;
      } catch (error) {
        logger.warn('Firestore query user documents failed, falling back to in-memory store', {
          error,
        });
      }
    }

    const results: ExtendedDocumentMetadata[] = [];
    for (const doc of this.inMemoryStore.values()) {
      if (doc.userId === userId) {
        results.push(doc);
      }
    }
    return results.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }

  /**
   * Deletes a document metadata record.
   */
  async deleteDocument(id: string): Promise<void> {
    this.inMemoryStore.delete(id);

    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        await db.collection('documents').doc(id).delete();
        logger.info('Document metadata deleted from Firestore', { documentId: id });
      } catch (error) {
        logger.warn('Firestore delete document failed', { error });
      }
    }
  }

  private analysisStore: Map<string, any> = new Map();

  /**
   * Stores an analysis record in `analyses` collection.
   */
  async createAnalysis(record: any): Promise<void> {
    this.analysisStore.set(record.id, record);
    // Also associate with in-memory document record if present
    const doc = this.inMemoryStore.get(record.documentId);
    if (doc) {
      doc.analysisIds = doc.analysisIds || [];
      if (!doc.analysisIds.includes(record.id)) {
        doc.analysisIds.push(record.id);
      }
    }

    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        await db.collection('analyses').doc(record.id).set(record);
        logger.info('Analysis record saved to Firestore', {
          analysisId: record.id,
          documentId: record.documentId,
        });
      } catch (error) {
        logger.warn('Firestore create analysis failed, using in-memory fallback', { error });
      }
    }
  }

  /**
   * Retrieves an analysis record by document ID.
   */
  async getAnalysisByDocumentId(documentId: string): Promise<any | null> {
    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        const snapshot = await db
          .collection('analyses')
          .where('documentId', '==', documentId)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          return snapshot.docs[0].data();
        }
      } catch (error) {
        logger.warn('Firestore get analysis by document ID failed, using fallback', { error });
      }
    }

    for (const record of this.analysisStore.values()) {
      if (record.documentId === documentId) {
        return record;
      }
    }

    return null;
  }

  private qaStore: Map<string, any> = new Map();
  private comparisonStore: Map<string, any> = new Map();

  /**
   * Stores a Q&A session record in `qa_sessions` collection.
   */
  async saveQASession(record: any): Promise<void> {
    this.qaStore.set(record.id, record);

    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        await db.collection('qa_sessions').doc(record.id).set(record);
        logger.info('Q&A session record saved to Firestore', {
          qaId: record.id,
          documentId: record.documentId,
          userId: record.userId,
        });
      } catch (error) {
        logger.warn('Firestore create Q&A session failed, using in-memory fallback', { error });
      }
    }
  }

  /**
   * Retrieves Q&A history records for a specific document and user.
   */
  async getQASessionsByDocumentId(documentId: string, userId: string): Promise<any[]> {
    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        const snapshot = await db
          .collection('qa_sessions')
          .where('documentId', '==', documentId)
          .where('userId', '==', userId)
          .orderBy('timestamp', 'desc')
          .get();

        const results: any[] = [];
        snapshot.forEach((doc) => results.push(doc.data()));
        return results;
      } catch (error) {
        logger.warn('Firestore query Q&A sessions failed, falling back to in-memory store', {
          error,
        });
      }
    }

    const results: any[] = [];
    for (const record of this.qaStore.values()) {
      if (record.documentId === documentId && record.userId === userId) {
        results.push(record);
      }
    }
    return results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Stores a comparison record in `comparisons` collection.
   */
  async saveComparison(record: any): Promise<void> {
    this.comparisonStore.set(record.id, record);

    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        await db.collection('comparisons').doc(record.id).set(record);
        logger.info('Comparison record saved to Firestore', {
          comparisonId: record.id,
          userId: record.userId,
          documentId1: record.documentId1,
          documentId2: record.documentId2,
        });
      } catch (error) {
        logger.warn('Firestore create comparison failed, using in-memory fallback', { error });
      }
    }
  }

  /**
   * Lists comparison history records for a user.
   */
  async getComparisonsByUserId(userId: string): Promise<any[]> {
    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        const snapshot = await db
          .collection('comparisons')
          .where('userId', '==', userId)
          .orderBy('timestamp', 'desc')
          .get();

        const results: any[] = [];
        snapshot.forEach((doc) => results.push(doc.data()));
        return results;
      } catch (error) {
        logger.warn('Firestore query user comparisons failed, falling back to in-memory store', {
          error,
        });
      }
    }

    const results: any[] = [];
    for (const record of this.comparisonStore.values()) {
      if (record.userId === userId) {
        results.push(record);
      }
    }
    return results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Retrieves a single comparison record by ID with user ownership check.
   */
  async getComparisonById(id: string, userId: string): Promise<any | null> {
    if (this.isFirestoreAvailable()) {
      try {
        const db = getFirestoreDb();
        const doc = await db.collection('comparisons').doc(id).get();
        if (doc.exists) {
          const data = doc.data();
          if (data && data.userId === userId) {
            return data;
          }
        }
      } catch (error) {
        logger.warn('Firestore get comparison by ID failed, falling back to in-memory store', {
          error,
        });
      }
    }

    const record = this.comparisonStore.get(id);
    if (record && record.userId === userId) {
      return record;
    }

    return null;
  }
}
