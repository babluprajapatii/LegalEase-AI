import { Router } from 'express';

const router = Router();

// Phase 2: Firebase Authentication only.
// The legacy jsonwebtoken /login endpoint has been removed.
// Authentication is handled via Firebase ID tokens verified in authenticateToken middleware.
// POST /api/users/me (via handlers/users.ts) handles user profile upsert on sign-in.

export default router;
