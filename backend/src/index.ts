import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimitMiddleware } from './middleware/rateLimit';
import healthRoutes from './routes/health';
import apiRoutes from './routes/api';
import { logger } from './utils/logging';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : env.PORT;
const HOST = '0.0.0.0';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        styleSrc: ["'self'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  }),
);

const allowedOrigins = (env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, server-side fetch)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        allowedOrigins.includes('*') ||
        env.NODE_ENV !== 'production' ||
        normalizedOrigin.startsWith('http://localhost')
      ) {
        return callback(null, true);
      }

      logger.warn(`CORS request rejected for origin: ${origin}`);
      return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    },
    credentials: true,
  }),
);

app.use(rateLimitMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoutes);
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST}:${PORT} in ${env.NODE_ENV} mode`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
  });
});

export default app;
