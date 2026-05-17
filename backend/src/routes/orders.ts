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

    // Notify all admins of the new pending order
    const admins = await User.find({ userType: 'admin' }).select('_id');
    await Notification.insertMany(
      admins.map((a) => ({
        userId: a._id,
        type: 'new_order',
        message: `A new order has been placed.`,
      }))
    );
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

    order.status = 3; // Cancelled
    await order.save();
    res.json(order);

    // Notify the customer their cancellation was processed
    await Notification.create({
      userId: order.user,
      type: 'order_cancelled',
      message: 'Your order has been cancelled.',
    });

    // Also notify admins
    const admins = await User.find({ userType: 'admin' }).select('_id');
    await Notification.insertMany(
      admins.map((a) => ({
        userId: a._id,
        type: 'order_cancelled',
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

    order.status = 1; // Out for Delivery
    await order.save();


    // Notify the customer their order was confirmed
    await Notification.create({
      userId: order.user,
      type: 'order_confirmed',
      message: `Your order has been confirmed and is now out for delivery!`,
    });

    // If any product is now out of stock, notify all customers with pending orders for it
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product && product.quantity === 0) {
        const affectedOrders = await Order.find({
          'items.productId': product._id,
          status: 0, // pending only
        });

        if (affectedOrders.length > 0) {
          const userIds = [...new Set(affectedOrders.map(o => o.user.toString()))];
          await Notification.insertMany(
            userIds.map((uid) => ({
              userId: uid,
              type: 'out_of_stock',
              message: `"${product.name}" is now out of stock. Your pending order may be affected.`,
            }))
          );
        }
      }
    }
    res.json(order);
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PATCH /api/orders/:id/admin-cancel — Cancel order (Admin Isolation)
// Put this right underneath your working confirmation route block!
router.patch('/:id/admin-cancel', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: 'Order ID is required' });
    return;
  }

  try {

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.status = 3;
    await order.save();

    await Notification.create({
      userId: order.user,
      type: 'order_cancelled',
      message: 'Your order has been cancelled by the system administration.',
    });

    res.status(200).json({
      message: 'Order cancelled by admin successfully.',
      order
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});


router.patch('/:id/deliver', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status !== 1) {
      res.status(400).json({ message: 'Only orders marked "Out for Delivery" can be set to Delivered' });
      return;
    }


    order.status = 2;
    await order.save();


    await Notification.create({
      userId: order.user,
      type: 'order_delivered',
      message: `Your order has been successfully delivered! Thank you for shopping with us.`,
    });


    res.json(order);
    return;

  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});


// GET /api/orders/pending-count — Pending order count (admin)
// Used by the notifications route to generate the pending orders summary


router.get('/pending-count', protect, adminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await Order.countDocuments({ status: 0 });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});




export default router;