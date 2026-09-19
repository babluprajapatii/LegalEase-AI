import { Storage } from '@google-cloud/storage';
import { env } from './env';
import { getStorageBucket } from './firebase';
import { logger } from '../utils/logging';

let storageClient: Storage | null = null;

export function getGCSBucket() {
  const bucketName = env.GCS_BUCKET_NAME || 'legalease-ai-documents-dev';

  try {
    return getStorageBucket();
  } catch (error) {
    logger.warn('Falling back to direct Google Cloud Storage client', { error });
    if (!storageClient) {
      storageClient = new Storage({
        projectId: env.FIREBASE_PROJECT_ID,
      });
    }
    return storageClient.bucket(bucketName);
  }
}
