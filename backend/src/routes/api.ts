import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import documentHandlers from '../handlers/documents';

const router = Router();

// Document Ingestion & Storage Endpoints (Phase 2)
router.use('/documents', documentHandlers);

// Alias for POST /api/upload
router.use('/upload', documentHandlers);

// User Profile Upsert Endpoint
router.use('/users', documentHandlers);

// Phase 3 Endpoint (GenAI Legal Analysis) — stubbed until Phase 3
router.post('/analyze', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  res.status(501).json({
    success: false,
    error: 'Document analysis endpoint not yet implemented - coming in Phase 3',
  });
});

export default router;
