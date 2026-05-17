import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().positive('Quantity must be positive'),
    })
  ).nonempty('At least one item is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required').optional(),
  paymentMethod: z.string().min(1, 'Payment method is required').optional(),
});

export type CreateOrder = z.infer<typeof createOrderSchema>;
