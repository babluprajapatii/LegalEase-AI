import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password required',
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    const token = jwt.sign({ uid: `user_${Date.now()}`, email }, secret, { expiresIn: '24h' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          uid: `user_${Date.now()}`, // In real implementation, use actual user ID from database
          email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
