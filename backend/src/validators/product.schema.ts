import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.number().int().positive().optional(),
  price: z.number().nonnegative(),
  quantity: z.number().nonnegative(),
  unit: z.string().optional(),
  region: z.string().optional(),
  image: z.string().url().optional(),
  promoted: z.boolean().optional(),
  certifications: z.array(z.string()).optional(),
});

// For updates we allow partial fields but still validate types when present
export const updateProductSchema = createProductSchema.partial();

export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
