import { Router, type Response } from 'express';
import { User } from '../models/user.model.js';
import { Order } from '../models/order.model.js';
import { type productDocument } from '../models/product.model.js'; // Use the interface for typing
import { protect, adminOnly } from '../middleware/auth.js';
import { type AuthRequest, type SalesPeriod } from '../types/index.js';

const router = Router();

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Assuming 'role' or 'userType' exists in your User model
    const users = await User.find({ userType: 'customer' }).select('-password');
    res.json({ total: users.length, users });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/admin/orders
router.get('/orders', protect, adminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate('productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/admin/sales?period=monthly
router.get('/sales', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  const period = req.query.period as SalesPeriod;
  const now = new Date();
  let startDate: Date;

  if (period === 'weekly') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (period === 'monthly') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (period === 'annual') startDate = new Date(now.getFullYear(), 0, 1);
  else startDate = new Date(0);

  try {
    const orders = await Order.find({
      status: 1, // Changed from orderStatus to status
      createdAt: { $gte: startDate }, // Changed from dateOrdered to createdAt
    }).populate('productId');

    const breakdown: Record<string, { quantitySold: number; income: number }> = {};
    let totalSales = 0;

    for (const order of orders) {
      // Cast the populated productId to the ProductDocument type
      const product = order.productId as unknown as productDocument;
      const name = product?.name ?? 'Unknown'; // Changed from productName to name
      
      // Use the totalPrice already calculated in the Order schema
      const income = order.totalPrice || 0; 

      if (!breakdown[name]) breakdown[name] = { quantitySold: 0, income: 0 };
      breakdown[name].quantitySold += order.quantity;
      breakdown[name].income += income;
      totalSales += income;
    }

    res.json({ period, totalSales, breakdown });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;