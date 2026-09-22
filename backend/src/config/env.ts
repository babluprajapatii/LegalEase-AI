import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Pre-load environment variables from root or backend directory before schema validation
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(1).default('dev-secret-change-in-production'),

  // Firebase Admin & GCP Storage Configuration
  FIREBASE_PROJECT_ID: z.string().default('legalease-ai-78a55'),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  GCS_BUCKET_NAME: z.string().optional(),

  // Frontend Firebase Public Config (for context reference)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().default('legalease-ai-78a55'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),

  // Phase 3 Gemini / Vertex AI Configuration
  GCP_PROJECT_ID: z.string().default('legalease-ai-78a55'),
  GCP_LOCATION: z.string().default('us-central1'),
  VERTEX_AI_MODEL: z.string().default('gemini-1.5-pro'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    process.exit(1);
  }

  if (
    result.data.JWT_SECRET === 'dev-secret-change-in-production' &&
    result.data.NODE_ENV === 'production'
  ) {
    console.warn('⚠️  JWT_SECRET is using the default value in production mode.');
  }

  return result.data;
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
