import { type Response, type NextFunction } from 'express';
import { type AuthRequest } from '../types/index.js';
export declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const adminOnly: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map