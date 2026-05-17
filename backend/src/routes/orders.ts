import { Router, type Response } from 'express';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { type AuthRequest } from '../types/index.js';

const router = Router();

// POST /api/orders — Place order (customer)
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const { items, deliveryAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'No items in order' });
    return;
  }

  try {
    const orderItems = [];
    let totalToPay = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ message: `Product ${item.productId} not found` });
        return;
      }

      if (product.quantity < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        return;
      }

      orderItems.push({
        productId: product._id as any,
        name: product.name,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });

      totalToPay += product.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user!.id,
      email: req.user!.email,
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      totalToPay,
      status: 0 // Pending
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/orders/my-orders — Customer's own orders
router.get('/my-orders', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Search by both user ID and email for robustness and backward compatibility
    const orders = await Order.find({
      $or: [
        { user: req.user!.id },
        { email: req.user!.email }
      ]
    })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});
// PATCH /api/orders/:id/cancel — Cancel order (customer, pending only)
router.patch('/:id/cancel', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // 1. Guard clause to satisfy strict TypeScript checks
  if (!id) {
    res.status(400).json({ message: 'Order ID is required' });
    return;
  }

  try {
    // 2. Pass the filter. Casting 'id' to string ensures it's not a string[]
    const order = await Order.findOne({ 
      _id: id as string, 
      email: req.user!.email 
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Use lowercase 'status' to match your order.model.ts
    if (order.status !== 0) {
      res.status(400).json({ message: 'Can only cancel pending orders' });
      return;
    }

    order.status = 2; // Cancelled
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PATCH /api/orders/:id/confirm — Confirm order (admin)
router.patch('/:id/confirm', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order found' });
      return;
    }

    if (order.status !== 0) {
      res.status(400).json({ message: 'Only pending orders can be confirmed' });
      return;
    }

    // Check stock for all items first
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ message: `Product ${item.name} not found` });
        return;
      }
      if (product.quantity < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        return;
      }
    }

    // Decrement stock for all items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity }
      });
    }

    order.status = 1; // Completed (or Out for Delivery depending on enum)
    // Model says 1: Out for Delivery, 2: Completed. 
    // Wait, let me check model status enum again.
    // 0: Pending, 1: Out for Delivery, 2: Completed, 3: Cancelled
    
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;