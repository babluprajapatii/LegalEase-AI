import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { FirestoreService } from '../services/firestoreService';
import { logger } from '../utils/logging';

const router = Router();
const firestoreService = new FirestoreService();

/**
 * POST /api/users/me
 * Upserts authenticated user record in Firestore on login.
 */
router.post(
  '/me',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      await firestoreService.upsertUser({
        uid: req.user.uid,
        email: req.user.email,
      });

      res.status(200).json({
        success: true,
        data: {
          uid: req.user.uid,
          email: req.user.email,
        },
        message: 'User record upserted successfully',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('User upsert failed', { error: message, userId: req.user?.uid });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
);

export default router;
