import { Router, Response } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { DocumentService } from '../services/documentService';
import { logger } from '../utils/logging';

const router = Router();
const documentService = new DocumentService();

/**
 * POST /api/upload (or /api/documents/upload)
 * Initiates document upload: validates metadata, creates record, returns signed GCS upload URL.
 */
router.post(
  '/upload',
  authenticateToken,
  body('filename').notEmpty().withMessage('Filename is required'),
  body('contentType').notEmpty().withMessage('contentType is required'),
  body('size').isNumeric().withMessage('size must be numeric'),
  validate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { filename, contentType, size } = req.body;
      const parsedSize = parseInt(size, 10);

      const validationResult = await documentService.validateDocumentUpload({
        filename,
        contentType,
        size: parsedSize,
      });

      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Document validation failed',
          details: validationResult.errors,
        });
        return;
      }

      const uploadResult = await documentService.initiateUpload(req.user.uid, {
        filename,
        contentType,
        size: parsedSize,
      });

      res.status(202).json({
        success: true,
        data: uploadResult,
        message: 'Document upload initiated successfully',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Document upload initiation failed', { error: message, userId: req.user?.uid });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },
);

/**
 * POST /api/documents/:id/confirm
 * Confirms direct upload and triggers extraction & processing pipeline.
 */
router.post(
  '/:id/confirm',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const documentId = Array.isArray(req.params.id)
        ? req.params.id[0]!
        : (req.params.id as string);
      const updatedMetadata = await documentService.confirmAndProcessUpload(
        documentId,
        req.user.uid,
      );

      if (updatedMetadata.processingStatus === 'failed') {
        res.status(422).json({
          success: false,
          error: 'Document processing failed',
          details: updatedMetadata.errorMessage,
          data: updatedMetadata,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedMetadata,
        message: 'Document extraction and processing complete',
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

      logger.error('Confirm and process upload failed', {
        documentId: req.params.id,
        error: message,
      });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
);

/**
 * GET /api/documents
 * Returns list of documents owned by the authenticated user.
 */
router.get(
  '/',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const documents = await documentService.getUserDocuments(req.user.uid);

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Document listing failed', { error: message, userId: req.user?.uid });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },
);

/**
 * GET /api/documents/:id
 * Retrieves document details with server-side ownership authorization.
 */
router.get(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const documentId = Array.isArray(req.params.id)
        ? req.params.id[0]!
        : (req.params.id as string);
      const document = await documentService.getDocumentById(documentId, req.user.uid);

      res.status(200).json({
        success: true,
        data: document,
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

      logger.error('Document retrieval failed', { documentId: req.params.id, error: message });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },
);

/**
 * DELETE /api/documents/:id
 * Deletes document file and metadata with server-side ownership authorization.
 */
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const documentId = Array.isArray(req.params.id)
        ? req.params.id[0]!
        : (req.params.id as string);
      await documentService.deleteDocument(documentId, req.user.uid);

      res.status(200).json({
        success: true,
        data: { id: documentId },
        message: 'Document deleted successfully',
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

      logger.error('Document deletion failed', { documentId: req.params.id, error: message });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },
);

export default router;
