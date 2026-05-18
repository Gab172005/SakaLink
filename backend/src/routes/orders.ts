import { Router, type Response } from 'express';
import { Order, type OrderItem } from '../models/order.model.js';
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
    const orderItems: OrderItem[] = [];
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

    // Send response quickly
    res.status(201).json(order);

    // Safely defer the background notification processing using setImmediate
    setImmediate(async () => {
      try {
        const primaryItemName = orderItems[0]?.name || 'Marketplace Items';
        const totalItemsCount = orderItems.length;
        const summaryText = totalItemsCount > 1 
          ? `"${primaryItemName}" and ${totalItemsCount - 1} other item(s)`
          : `"${primaryItemName}"`;

        const admins = await User.find({ userType: 'admin' }).select('_id');
        if (admins.length > 0) {
          await Notification.insertMany(
            admins.map((a) => ({
              userId: a._id,
              type: 'new_order',
              message: `New order placed for ${summaryText}.`,
            }))
          );
        }
      } catch (bgErr) {
        console.error('Background Notification Processing Error:', bgErr);
      }
    });

  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/orders/my-orders — Customer's own orders
router.get('/my-orders', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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

  if (!id) {
    res.status(400).json({ message: 'Order ID is required' });
    return;
  }

  try {
    // If admin, they can find any order. If customer, only their own email-matched order.
    const query = req.user?.userType === 'admin' 
      ? { _id: id } 
      : { _id: id, email: req.user!.email };

    const order = await Order.findOne(query);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status !== 0) {
      res.status(400).json({ message: 'Can only cancel pending orders' });
      return;
    }

    order.status = 3; // Cancelled
    await order.save();
    res.json(order);

    // Run clean notifications
    const admins = await User.find({ userType: 'admin' }).select('_id');
    const isByAdmin = req.user?.userType === 'admin';

    await Promise.all([
      Notification.create({
        userId: order.user,
        type: 'order_cancelled',
        message: isByAdmin 
          ? 'Your order has been cancelled by an administrator.' 
          : 'Your order has been cancelled.',
      }),
      (admins.length > 0 && !isByAdmin) ? Notification.insertMany(
        admins.map((a) => ({
          userId: a._id,
          type: 'order_cancelled',
          message: 'A customer cancelled their order.',
        }))
      ) : Promise.resolve()
    ]);

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

    // Atomic updates array to verify stocks concurrently safely
    const outOfStockProductIds: string[] = [];
    const outOfStockProductNames: string[] = [];

    for (const item of order.items) {
      // Find and update item stock atomically while checking if current quantity meets the minimum requirement
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        res.status(400).json({ message: `Insufficient stock or product modified for item: ${item.name}` });
        return;
      }

      if (updatedProduct.quantity === 0) {
        outOfStockProductIds.push(updatedProduct._id.toString());
        outOfStockProductNames.push(updatedProduct.name);
      }
    }

    order.status = 1; // Out for Delivery
    await order.save();
    res.json(order);

    const orderRef = order._id.toString().slice(-6).toUpperCase();

    // Fire confirmation notification
    await Notification.create({
      userId: order.user,
      type: 'order_confirmed',
      message: `Your order #${orderRef} has been confirmed and is preparing for delivery! 🎉`,
    });

    // Batch out-of-stock notifications efficiently outside the update loops
    if (outOfStockProductIds.length > 0) {
      const affectedOrders = await Order.find({
        'items.productId': { $in: outOfStockProductIds },
        status: 0, 
      });

      if (affectedOrders.length > 0) {
        // Build clear, human-scannable notification labels
        const productsLabel = outOfStockProductNames.map(name => `"${name}"`).join(', ');
        await Notification.insertMany(
          affectedOrders.map((o) => ({
            userId: o.user,
            type: 'out_of_stock',
            message: `${productsLabel} item(s) are now out of stock. Your pending order may be affected.`,
          }))
        );
      }
    }
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PATCH /api/orders/:id/deliver — Mark delivered (admin)
router.patch('/:id/deliver', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status !== 1) {
      res.status(400).json({ message: 'Only orders out for delivery can be marked as delivered' });
      return;
    }

    order.status = 2; // Delivered / Completed
    await order.save();
    res.json(order);

    await Notification.create({
      userId: order.user,
      type: 'order_delivered',
      message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been delivered successfully! Thank you.`,
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/orders/pending-count — Pending order count (admin)
router.get('/pending-count', protect, adminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await Order.countDocuments({ status: 0 });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;