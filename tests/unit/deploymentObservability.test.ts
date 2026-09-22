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
