import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { env } from './env';
import { logger } from '../utils/logging';

let firebaseApp: App;

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
    '';
  const clientEmail = env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

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
  return getStorage(getFirebaseAdmin()).bucket(env.GCS_BUCKET_NAME);
}
