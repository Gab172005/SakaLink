import { type Request, type Response, type NextFunction } from 'express';
import { type ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.issues.map((e) => ({ path: e.path.join('.'), message: e.message }));
        res.status(400).json({ message: 'Invalid request body', errors });
        return;
      }

      // Replace body with the parsed value
      (req as any).body = parsed.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}
