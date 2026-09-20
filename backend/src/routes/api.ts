import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import documentHandlers from '../handlers/documents';
import userHandlers from '../handlers/users';

const router = Router();

// Document Ingestion & Storage Endpoints (Phase 2)
router.use('/documents', documentHandlers);

// Alias for POST /api/upload → same as /api/documents/upload
router.use('/upload', documentHandlers);

// User Profile Upsert Endpoint (POST /api/users/me)
router.use('/users', userHandlers);

// Phase 3 Endpoint (GenAI Legal Analysis)
router.post(
  '/analyze',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { documentId } = req.body || {};
      if (!documentId) {
        res.status(400).json({ success: false, error: 'documentId is required in request body' });
        return;
      }

      const { DocumentService } = await import('../services/documentService');
      const docService = new DocumentService();
      const result = await docService.analyzeDocument(documentId, req.user.uid);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Document analysis completed successfully',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('not found')) {
        res.status(404).json({ success: false, error: message });
        return;
      }
      if (message.includes('Access denied')) {
        res.status(403).json({ success: false, error: message });
        return;
      }
      res.status(500).json({ success: false, error: message || 'Document analysis failed' });
    }
  },
);

export default router;
