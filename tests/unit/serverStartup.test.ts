import test from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler, notFoundHandler, AppError } from '../../backend/src/middleware/errorHandler';
import { ZodError } from 'zod';

test('serverStartup - notFoundHandler returns 404 with route description', () => {
  let statusSet = 0;
  let responseData: any = null;

  const mockReq: any = { method: 'POST', path: '/api/nonexistent-route' };
  const mockRes: any = {
    status: (code: number) => {
      statusSet = code;
      return {
        json: (data: any) => {
          responseData = data;
        },
      };
    },
  };

  notFoundHandler(mockReq, mockRes);

  assert.equal(statusSet, 404);
  assert.equal(responseData?.error, 'Route POST /api/nonexistent-route not found');
});

test('serverStartup - errorHandler returns 500 without leaking stack traces in production mode', () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  let statusSet = 0;
  let responseData: any = null;

  const mockError: AppError = new Error('Database connection failed');
  const mockReq: any = {};
  const mockRes: any = {
    status: (code: number) => {
      statusSet = code;
      return {
        json: (data: any) => {
          responseData = data;
        },
      };
    },
  };

  errorHandler(mockError, mockReq, mockRes, () => {});

  assert.equal(statusSet, 500);
  assert.equal(responseData?.error, 'Database connection failed');
  assert.equal(responseData?.stack, undefined);

  process.env.NODE_ENV = originalEnv;
});

test('serverStartup - errorHandler formats ZodError as HTTP 400 Validation Error', () => {
  let statusSet = 0;
  let responseData: any = null;

  const mockZodError = new ZodError([]);
  const mockReq: any = {};
  const mockRes: any = {
    status: (code: number) => {
      statusSet = code;
      return {
        json: (data: any) => {
          responseData = data;
        },
      };
    },
  };

  errorHandler(mockZodError, mockReq, mockRes, () => {});

  assert.equal(statusSet, 400);
  assert.equal(responseData?.error, 'Validation Error');
});
