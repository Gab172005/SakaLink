import { type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { type AuthRequest, type JwtPayload } from '../types/index.js';

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token, access denied' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.userType !== 'admin') {
    res.status(403).json({ message: 'Admin access only' });
    return;
  }
  next();
};