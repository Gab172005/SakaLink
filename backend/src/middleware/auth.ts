import { type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { type AuthRequest, type JwtPayload } from '../types/index.js';

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Read strictly from cookies since you dropped authorization headers
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: 'No session token, access denied' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_SECRET environment variable is missing.");
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.userType !== 'admin') {
    res.status(403).json({ message: 'Admin access only' });
    return;
  }
  next();
};