import { Router, type Response } from 'express';
import { Notification } from '../models/notification.model.js';
import { Order } from '../models/order.model.js';
import { protect } from '../middleware/auth.js';
import { type AuthRequest } from '../types/index.js';

const router = Router();

// GET /api/notifications —> Fetch the caller's notifications (newest first)
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50);

    if (req.user!.userType === 'admin') {
      const pendingCount = await Order.countDocuments({ status: 0 });
      if (pendingCount > 0) {
        const summary = {
          _id: 'pending-summary', 
          type: 'pending_orders',
          message: `There are ${pendingCount} pending order${pendingCount > 1 ? 's' : ''} from customers.`,
          isRead: false,
          createdAt: new Date(),
        };
        res.json([summary, ...notifications]);
        return;
      }
    }
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

  router.get('/unread-count', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      let unreadCount = await Notification.countDocuments({ 
        userId: req.user!.id, 
        isRead: false 
      });

      if (req.user!.userType === 'admin') {
        const pendingCount = await Order.countDocuments({ status: 0 });
        if (pendingCount > 0) {
          unreadCount += 1; 
        }
      }

      res.json({ count: unreadCount });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });
// PATCH /api/notifications/read-all —> Mark all of the caller's notifications as read
router.patch('/read-all', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user!.id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PATCH /api/notifications/:id/read —> Mark one notification as read
router.patch('/:id/read', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Prevent database crashes if frontend tries to mark the virtual admin summary as read
  if (id === 'pending-summary') {
    res.status(400).json({ message: 'The active dashboard summary cannot be individually marked as read.' });
    return;
  }

  try {
    const notification = await Notification.findById(id);

    if (!notification || notification.userId.toString() !== req.user!.id) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;