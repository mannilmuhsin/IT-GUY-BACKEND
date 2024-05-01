import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    userId?: number; // userId property is optional
  }

// Secret key for JWT
const SECRET_KEY = 'your-secret-key';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Assuming the token is in the format 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = (decoded as { userId: number }).userId; // Attach the userId to the request object
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: 'Invalid token' });
  }
};