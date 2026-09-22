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

      let providedBuffer: Buffer | undefined;
      const { fileData } = req.body || {};
      if (fileData && typeof fileData === 'string') {
        providedBuffer = Buffer.from(fileData, 'base64');
      }

      const updatedMetadata = await documentService.confirmAndProcessUpload(
        documentId,
        req.user.uid,
        providedBuffer,
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
 * POST /api/documents/compare
 * Compares 2 user documents with dual-document ownership authorization.
 */
router.post(
  '/compare',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { documentId1, documentId2 } = req.body || {};
      if (!documentId1 || !documentId2) {
        res.status(400).json({
          success: false,
          error: 'Both documentId1 and documentId2 are required in request body',
        });
        return;
      }

      const comparisonRecord = await documentService.compareDocuments(
        documentId1,
        documentId2,
        req.user.uid,
      );

      res.status(200).json({
        success: true,
        data: comparisonRecord,
        message: 'Document comparison completed successfully',
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
      res.status(500).json({ success: false, error: message || 'Document comparison failed' });
    }
  },
);

/**
 * GET /api/documents/comparisons
 * Lists user comparison history.
 */
router.get(
  '/comparisons',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const comparisons = await documentService.getUserComparisons(req.user.uid);
      res.status(200).json({
        success: true,
        data: comparisons,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: message || 'Failed to list comparisons' });
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

/**
 * POST /api/documents/:id/analyze
 * Triggers GenAI document analysis and persists output.
 */
router.post(
  '/:id/analyze',
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

      const analysisRecord = await documentService.analyzeDocument(documentId, req.user.uid);

      res.status(200).json({
        success: true,
        data: analysisRecord,
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

      logger.error('Document analysis request failed', {
        documentId: req.params.id,
        error: message,
      });
      res.status(500).json({
        success: false,
        error: message || 'Failed to complete document analysis',
      });
    }
  },
);

/**
 * GET /api/documents/:id/analysis
 * Fetches existing AI analysis result for document.
 */
router.get(
  '/:id/analysis',
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

      const analysisRecord = await documentService.getDocumentAnalysis(documentId, req.user.uid);
      if (!analysisRecord) {
        res
          .status(404)
          .json({ success: false, error: 'Analysis record not found for this document' });
        return;
      }

      res.status(200).json({
        success: true,
        data: analysisRecord,
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

      logger.error('Get document analysis failed', { documentId: req.params.id, error: message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
);

/**
 * POST /api/documents/:id/qa
 * Grounded Q&A for a user document.
 */
router.post(
  '/:id/qa',
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
      const { question } = req.body || {};

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        res.status(400).json({ success: false, error: 'question string is required' });
        return;
      }

      const qaRecord = await documentService.askDocumentQuestion(
        documentId,
        req.user.uid,
        question,
      );

      res.status(200).json({
        success: true,
        data: qaRecord,
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

      logger.error('Document Q&A failed', { documentId: req.params.id, error: message });
      res.status(500).json({ success: false, error: message || 'Document Q&A failed' });
    }
  },
);

/**
 * GET /api/documents/:id/qa
 * Fetches Q&A history for a document.
 */
router.get(
  '/:id/qa',
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

      const qaHistory = await documentService.getQASessions(documentId, req.user.uid);

      res.status(200).json({
        success: true,
        data: qaHistory,
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

      res.status(500).json({ success: false, error: message || 'Failed to fetch Q&A history' });
    }
  },
);

/**
 * POST /api/documents/:id/explain-clause
 * Generates plain-language explanation for a selected clause.
 */
router.post(
  '/:id/explain-clause',
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
      const { clauseName, originalText } = req.body || {};

      if (!clauseName || typeof clauseName !== 'string') {
        res.status(400).json({ success: false, error: 'clauseName is required' });
        return;
      }

      const explanation = await documentService.explainClause(
        documentId,
        req.user.uid,
        clauseName,
        originalText,
      );

      res.status(200).json({
        success: true,
        data: explanation,
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

      res.status(500).json({ success: false, error: message || 'Failed to explain clause' });
    }
  },
);

export default router;
