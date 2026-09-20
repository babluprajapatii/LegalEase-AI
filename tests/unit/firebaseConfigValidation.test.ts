import test from 'node:test';
import assert from 'node:assert';
import { validateFirebaseConfig } from '../../frontend/src/lib/firebase';

test('validateFirebaseConfig - detects missing or placeholder variables safely', () => {
  const originalEnv = { ...process.env };

  try {
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    const result = validateFirebaseConfig();
    assert.strictEqual(result.valid, false);
    assert.ok(result.missingVars.includes('NEXT_PUBLIC_FIREBASE_API_KEY'));
    assert.ok(result.missingVars.includes('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'));
    assert.ok(result.missingVars.includes('NEXT_PUBLIC_FIREBASE_PROJECT_ID'));

    result.missingVars.forEach((varName) => {
      assert.ok(varName.startsWith('NEXT_PUBLIC_FIREBASE_'));
    });
  } finally {
    process.env = originalEnv;
  }
});

test('validateFirebaseConfig - rejects fallback placeholders', () => {
  const originalEnv = { ...process.env };

  try {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyDevMockApiKeyForBuild12345678';
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'YOUR_AUTH_DOMAIN';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'valid-project-id';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'valid-bucket';
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456:web:abc';

    const result = validateFirebaseConfig();
    assert.strictEqual(result.valid, false);
    assert.ok(result.missingVars.includes('NEXT_PUBLIC_FIREBASE_API_KEY'));
    assert.ok(result.missingVars.includes('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'));
  } finally {
    process.env = originalEnv;
  }
});
