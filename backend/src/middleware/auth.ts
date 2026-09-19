import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth } from '../config/firebase';
import { logger } from '../utils/logging';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Support mock tokens strictly during test environment if explicitly set
    if (process.env.NODE_ENV === 'test' && token.startsWith('mock-token-')) {
      const mockUid = token.replace('mock-token-', '');
      req.user = {
        uid: mockUid,
        email: `${mockUid}@example.com`,
      };
      next();
      return;
    }

    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('Firebase ID token verification failed', { error: message });
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}

export function requireOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const resourceOwnerId = req.params.userId || req.body?.userId;

  if (resourceOwnerId && req.user.uid !== resourceOwnerId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  next();
}
