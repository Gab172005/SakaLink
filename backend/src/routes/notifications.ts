import { Router, type Response } from 'express';
import { Notification } from '../models/notification.model.js';
import { protect } from '../middleware/auth.js';
import { type AuthRequest } from '../types/index.js';

const router = Router();

// GET /api/notifications —> fetch the caller's notifications (newest first)
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PATCH /api/notifications/:id/read —> mark one notification as read
router.patch('/:id/read', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

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

// PATCH /api/notifications/read-all —> mark all of the caller's notifications as read
router.patch('/read-all', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user!.id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;