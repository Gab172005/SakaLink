import { Router, type Response } from 'express';
import { User } from '../models/user.model.js';
import { Order } from '../models/order.model.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { type AuthRequest, type SalesPeriod } from '../types/index.js';

const router = Router();

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ userType: 'customer' }).select('-password');
    res.json({ total: users.length, users });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.userType === 'admin') {
      res.status(403).json({ message: 'Cannot delete admin users' });
      return;
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/admin/orders
// FIXED: Removed the broken root .populate() since product details now live in the items array snapshot
router.get('/orders', protect, adminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // Newest orders first
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
    //filter for completed
    const orders = await Order.find({
      status: 2, 
      createdAt: { $gte: startDate },
    });

    const breakdown: Record<string, { quantitySold: number; income: number }> = {};
    const dailyTrendMap: Record<string, number> = {};
    let totalSales = 0;

    //main loop scales through each order envelope, then inner loop counts individual items
    for (const order of orders) {
      const orderTotal = order.totalToPay || 0;
      totalSales += orderTotal; 

      // Track daily trend
      const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
      dailyTrendMap[dateKey] = (dailyTrendMap[dateKey] || 0) + orderTotal;

      for (const item of order.items) {
        const name = item.name ?? 'Unknown Product';
        //Multiply quantity by purchase price snapshot for true product revenue tracking
        const itemIncome = item.quantity * item.priceAtPurchase;

        if (!breakdown[name]) {
          breakdown[name] = { quantitySold: 0, income: 0 };
        }

        breakdown[name].quantitySold += item.quantity;
        breakdown[name].income += itemIncome;
      }
    }

    // Convert dailyTrendMap to sorted array
    const dailyTrend = Object.entries(dailyTrendMap)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ period, totalSales, breakdown, dailyTrend });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;