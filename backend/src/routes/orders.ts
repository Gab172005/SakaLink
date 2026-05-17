import { Router, type Response } from 'express';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { Notification } from '../models/notification.model.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { type AuthRequest } from '../types/index.js';

const router = Router();

// POST /api/orders — Place order (customer)
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, orderQuantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    // Use lowercase 'quantity' as defined in product.model.ts
    if (product.quantity < orderQuantity) {
      res.status(400).json({ message: 'Insufficient stock' });
      return;
    }

    // Fixed: Added missing required fields 'user' and 'totalPrice'
    const order = await Order.create({
      user: req.user!.id, 
      productId,
      quantity: orderQuantity,
      totalPrice: product.price * orderQuantity, 
      email: req.user!.email,
      // 'status' defaults to 0 (pending)
    });

    res.status(201).json(order);

    // Notify all admins of the new order
    const admins = await User.find({ userType: 'admin' }).select('_id');
    await Notification.insertMany(
      admins.map((a) => ({
        userId:  a._id,
        type:    'new_order',
        message: `New order placed for "${product.name}".`,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/orders/my-orders — Customer's own orders
router.get('/my-orders', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ email: req.user!.email }).populate('productId');
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

    // Notify the customer their cancellation was processed
    await Notification.create({
      userId:  order.user,
      type:    'order_cancelled',
      message: 'Your order has been cancelled.',
    });

    // Also notify admins
    const admins = await User.find({ userType: 'admin' }).select('_id');
    await Notification.insertMany(
      admins.map((a) => ({
        userId:  a._id,
        type:    'order_cancelled',
        message: 'A customer cancelled their order.',
      }))
    );

  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PATCH /api/orders/:id/confirm — Confirm order (admin)
router.patch('/:id/confirm', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const product = await Product.findById(order.productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Fixed: Use 'quantity' instead of 'productQuantity'
    if (product.quantity < order.quantity) {
      res.status(400).json({ message: 'Insufficient stock to fulfill order' });
      return;
    }

    product.quantity -= order.quantity;
    await product.save();

    // Fixed: Use 'status' instead of 'orderStatus'
    order.status = 1; // Completed
    await order.save();
    res.json(order);

    // Notify the customer their order was confirmed
    const product2 = await Product.findById(order.productId);
    await Notification.create({
      userId:  order.user,
      type:    'order_confirmed',
      message: `Your order for "${product2?.name ?? 'an item'}" has been confirmed!`,
    });

  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;