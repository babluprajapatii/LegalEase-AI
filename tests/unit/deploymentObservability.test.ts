import test from 'node:test';
import assert from 'node:assert/strict';
import { healthCheckHandler, metricsHandler } from '../../backend/src/handlers/observability';
import { getSecret } from '../../backend/src/config/secrets';

test('deploymentObservability - healthCheckHandler returns HTTP 200 with healthy status and services breakdown', async () => {
  let statusSet = 0;
  let jsonResponse: any = null;

  const mockReq: any = {};
  const mockRes: any = {
    status: (code: number) => {
      statusSet = code;
      return {
        json: (data: any) => {
          jsonResponse = data;
        },
      };
    },
  };

  await healthCheckHandler(mockReq, mockRes);

  assert.equal(statusSet, 200);
  assert.equal(jsonResponse.status, 'healthy');
  assert.ok(jsonResponse.timestamp);
  assert.ok(typeof jsonResponse.uptimeSeconds === 'number');
  assert.equal(jsonResponse.services.firebaseAuth, 'connected');
  assert.equal(jsonResponse.services.firestore, 'connected');
  assert.equal(jsonResponse.services.cloudStorage, 'connected');
  assert.equal(jsonResponse.services.vertexAI, 'connected');
});

test('deploymentObservability - metricsHandler returns HTTP 200 with system telemetry and memory stats', async () => {
  let statusSet = 0;
  let jsonResponse: any = null;

  const mockReq: any = {};
  const mockRes: any = {
    status: (code: number) => {
      statusSet = code;
      return {
        json: (data: any) => {
          jsonResponse = data;
        },
      };
    },
  };

  await metricsHandler(mockReq, mockRes);

  assert.equal(statusSet, 200);
  assert.ok(jsonResponse.timestamp);
  assert.ok(typeof jsonResponse.memoryUsageMB === 'number');
  assert.ok(jsonResponse.system.platform);
  assert.ok(jsonResponse.metrics);
});

test('deploymentObservability - getSecret falls back to process.env in local development environment', async () => {
  process.env.TEST_SECRET_KEY = 'mock_secret_value';
  const val = await getSecret('TEST_SECRET_KEY');

  assert.equal(val, 'mock_secret_value');
  delete process.env.TEST_SECRET_KEY;
});

test('deploymentObservability - getSecret gracefully handles production fallback when Secret Manager is unauthenticated', async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  delete process.env.USE_LOCAL_SECRETS;
  process.env.TEST_PROD_SECRET = 'prod_env_fallback';

  const val = await getSecret('TEST_PROD_SECRET');
  assert.equal(val, 'prod_env_fallback');

  process.env.NODE_ENV = originalEnv;
  delete process.env.TEST_PROD_SECRET;
});

test('deploymentObservability - verifies no server private secrets exist in frontend directory', () => {
  const fs = require('fs');
  const path = require('path');

  const frontendDir = path.resolve(__dirname, '../../frontend/src');
  const files: string[] = [];

  function walk(dir: string) {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  walk(frontendDir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    assert.equal(
      content.includes('FIREBASE_PRIVATE_KEY'),
      false,
      `File ${file} contains FIREBASE_PRIVATE_KEY`,
    );
    assert.equal(
      content.includes('FIREBASE_CLIENT_EMAIL'),
      false,
      `File ${file} contains FIREBASE_CLIENT_EMAIL`,
    );
    assert.equal(content.includes('JWT_SECRET'), false, `File ${file} contains JWT_SECRET`);
  }
});
