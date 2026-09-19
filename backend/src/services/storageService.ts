import { getGCSBucket } from '../config/storage';
import { logger } from '../utils/logging';

export class StorageService {
  /**
   * Generates a user-scoped GCS object path.
   * Path structure: users/{userId}/documents/{documentId}/original
   */
  getStoragePath(userId: string, documentId: string): string {
    return `users/${userId}/documents/${documentId}/original`;
  }

  /**
   * Generates a v4 signed URL for uploading a document directly to GCS.
   */
  async generateSignedUploadUrl(
    userId: string,
    documentId: string,
    contentType: string,
  ): Promise<{ signedUrl: string; storagePath: string }> {
    const storagePath = this.getStoragePath(userId, documentId);
    const bucket = getGCSBucket();
    const file = bucket.file(storagePath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    logger.info('Generated signed upload URL', { userId, documentId, storagePath });

    return { signedUrl, storagePath };
  }

  /**
   * Generates a v4 signed URL for downloading/viewing a document.
   */
  async generateSignedDownloadUrl(storagePath: string): Promise<string> {
    const bucket = getGCSBucket();
    const file = bucket.file(storagePath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return signedUrl;
  }

  /**
   * Downloads file buffer from Cloud Storage for text extraction.
   */
  async downloadFileBuffer(storagePath: string): Promise<Buffer> {
    const bucket = getGCSBucket();
    const file = bucket.file(storagePath);

    const [buffer] = await file.download();
    return buffer;
  }

  /**
   * Deletes a file from Cloud Storage.
   */
  async deleteStorageFile(storagePath: string): Promise<void> {
    try {
      const bucket = getGCSBucket();
      const file = bucket.file(storagePath);
      await file.delete({ ignoreNotFound: true });
      logger.info('Deleted file from Cloud Storage', { storagePath });
    } catch (error) {
      logger.error('Failed to delete file from Cloud Storage', { storagePath, error });
      throw error;
    }
  }
}
