import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authenticateToken,
  requireOwnership,
  AuthenticatedRequest,
} from '../../backend/src/middleware/auth';

test('Auth Middleware - returns 401 when Authorization header is missing', async () => {
  const req = { headers: {} } as AuthenticatedRequest;
  let statusSent = 0;
  let responseData: any = null;

  const res = {
    status(code: number) {
      statusSent = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
  } as any;

  let nextCalled = false;
  await authenticateToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(statusSent, 401);
  assert.equal(responseData?.error, 'Access token required');
});

test('Auth Middleware - sets req.user for mock test token in test environment', async () => {
  process.env.NODE_ENV = 'test';
  const req = {
    headers: { authorization: 'Bearer mock-token-user-abc' },
  } as AuthenticatedRequest;

  const res = {} as any;
  let nextCalled = false;

  await authenticateToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user?.uid, 'user-abc');
  assert.equal(req.user?.email, 'user-abc@example.com');
});

test('Ownership Check - blocks access when resource user ID does not match authenticated user ID', () => {
  const req = {
    user: { uid: 'user_123' },
    params: { userId: 'user_999' },
  } as unknown as AuthenticatedRequest;

  let statusSent = 0;
  let responseData: any = null;

  const res = {
    status(code: number) {
      statusSent = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
  } as any;

  let nextCalled = false;
  requireOwnership(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(statusSent, 403);
  assert.equal(responseData?.error, 'Access denied');
});

test('Ownership Check - permits access when resource user ID matches authenticated user ID', () => {
  const req = {
    user: { uid: 'user_123' },
    params: { userId: 'user_123' },
  } as unknown as AuthenticatedRequest;

  const res = {} as any;
  let nextCalled = false;

  requireOwnership(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});
