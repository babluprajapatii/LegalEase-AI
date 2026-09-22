import { Router } from 'express';
import { healthCheckHandler, metricsHandler } from '../handlers/observability';

const router = Router();

router.get('/', healthCheckHandler);
router.get('/metrics', metricsHandler);

export default router;
