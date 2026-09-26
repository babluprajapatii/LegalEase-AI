import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { env } from './env';
import { logger } from '../utils/logging';

let firebaseApp: App;

export function parsePrivateKey(rawKey?: string): string | undefined {
  if (!rawKey) return undefined;
  let key = rawKey.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n');
}

export function getFirebaseAdmin(): App {
  if (firebaseApp) {
    return firebaseApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    firebaseApp = existingApps[0];
    return firebaseApp;
  }

  const projectId =
    env.FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'legalease-ai-78a55';
  const clientEmail = env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = parsePrivateKey(env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY);

  try {
    if (clientEmail && privateKey) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: env.GCS_BUCKET_NAME,
      });
      logger.info('Firebase Admin SDK initialized with service account certificate.', {
        projectId,
      });
    } else {
      firebaseApp = initializeApp({
        projectId,
        storageBucket: env.GCS_BUCKET_NAME,
      });
      logger.info('Firebase Admin SDK initialized with default project ID.', { projectId });
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', { error });
    firebaseApp = initializeApp({ projectId }, 'fallback-app');
  }

  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseAdmin());
}

export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseAdmin());
}

export function getStorageBucket() {
  const bucketName =
    env.GCS_BUCKET_NAME && env.GCS_BUCKET_NAME !== 'your_bucket_name_here'
      ? env.GCS_BUCKET_NAME
      : env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'legalease-ai-78a55.firebasestorage.app';

  return getStorage(getFirebaseAdmin()).bucket(bucketName);
}
