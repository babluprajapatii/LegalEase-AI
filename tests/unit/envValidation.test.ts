import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv } from '../../backend/src/config/env';
import { parsePrivateKey } from '../../backend/src/config/firebase';

test('envValidation - permits production startup without JWT_SECRET when using Firebase Auth', () => {
  const sampleEnv = {
    NODE_ENV: 'production',
    PORT: '3001',
    FIREBASE_PROJECT_ID: 'legalease-test-proj',
    GCS_BUCKET_NAME: 'legalease-test-bucket',
  };

  const config = validateEnv(sampleEnv);
  assert.equal(config.NODE_ENV, 'production');
  assert.equal(config.PORT, 3001);
  assert.equal(config.JWT_SECRET, undefined);
});

test('envValidation - supports comma-separated multi-origin FRONTEND_URL in production', () => {
  const sampleEnv = {
    NODE_ENV: 'production',
    FRONTEND_URL: 'https://legalease-ai.pages.dev,https://app.legalease.ai',
    FIREBASE_PROJECT_ID: 'legalease-test-proj',
  };

  const config = validateEnv(sampleEnv);
  assert.equal(config.FRONTEND_URL, 'https://legalease-ai.pages.dev,https://app.legalease.ai');
});

test('envValidation - throws descriptive error when invalid environment variable values are passed', () => {
  const sampleEnv = {
    NODE_ENV: 'invalid_environment_name',
  };

  assert.throws(
    () => {
      validateEnv(sampleEnv);
    },
    (err: any) => {
      return err instanceof Error && err.message.includes('Invalid environment variables');
    },
  );
});

test('firebasePrivateKeyParsing - correctly parses single and double quoted RSA keys and escaped newlines', () => {
  const quotedWithEscapes = '"-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3\\n-----END PRIVATE KEY-----\\n"';
  const parsed = parsePrivateKey(quotedWithEscapes);

  assert.ok(parsed);
  assert.equal(parsed.startsWith('"'), false);
  assert.equal(parsed.endsWith('"'), false);
  assert.equal(parsed.includes('\\n'), false);
  assert.equal(parsed.includes('\n'), true);
  assert.ok(parsed.startsWith('-----BEGIN PRIVATE KEY-----'));
});

test('firebasePrivateKeyParsing - handles unquoted keys with real or escaped newlines safely', () => {
  const rawKey = '-----BEGIN PRIVATE KEY-----\\nline1\\nline2\\n-----END PRIVATE KEY-----';
  const parsed = parsePrivateKey(rawKey);

  assert.ok(parsed);
  assert.equal(parsed.includes('\n'), true);
  assert.equal(parsed.split('\n').length, 4);
});
