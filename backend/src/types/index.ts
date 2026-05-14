import { type Request } from 'express';

export interface JwtPayload {
  id: string;
  email: string;
  userType: 'customer' | 'admin';
}

// Extend Express Request to include user from JWT
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type SortOrder = 'asc' | 'desc';
export type SalesPeriod = 'weekly' | 'monthly' | 'annual';