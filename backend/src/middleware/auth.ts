import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret-change-in-production',
    ) as any;

    req.user = {
      uid: decoded.uid || decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  authenticateToken(req, res, () => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    next();
  });
}

export function requireOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  resourceUserId?: string,
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const resourceOwnerId = resourceUserId || req.params.userId;

  if (req.user.uid !== resourceOwnerId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  next();
}
