import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { protect } from '../middleware/auth.js';
import { type AuthRequest } from '../types/index.js';

const router = Router();

const getJwtSecret = (res: Response): string | null => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: 'Internal Server Configuration Error' });
    return null;
  }
  return secret;
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, middleName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const newUser = await User.create({
      firstName,
      middleName,
      lastName,
      email,
      password,
      userType: 'customer',
    });

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, userType: newUser.userType },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      userType: newUser.userType,
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // FIX: Added .select('+password') because you have select: false in your schema!
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const match = await user.comparePassword(password);

    if (!match) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true, //prevents js from reading the token in case site gets breached
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', //prevent cross site forgery
      maxAge: 7 * 24 * 60 * 60 * 1000 //xprires after a week

    });
    res.status(200).json({
      userType: user.userType,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    })
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  //deletes our cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const decoded = jwt.verify(token, jwtSecret) as any;

    const user = await User.findById(decoded.id).select('firstName lastName email userType');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // FIX: Match the structured response design pattern of your /login endpoint!
    res.status(200).json({
      userType: user.userType,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid session' });
  }
});

// PATCH /api/auth/profile
// Updates first name and last name safely.
router.patch('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // FIX: Use your dynamic function getJwtSecret instead of a hardcoded environment fallback
    const jwtSecret = getJwtSecret(res);
    if (!jwtSecret) return;

    const decoded = jwt.verify(token, jwtSecret) as { id: string };

    // Explicit string cast: prevents ".trim is not a function" if body sends non-strings
    const firstName = String(req.body.firstName ?? '');
    const lastName = String(req.body.lastName ?? '');

    if (!firstName.trim() || !lastName.trim()) {
      res.status(400).json({ message: 'First name and last name are required.' });
      return;
    }

    // Only name fields are updated (email and password are intentionally excluded)
    const updated = await User.findByIdAndUpdate(
      decoded.id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      { new: true, runValidators: true }
    ).select('firstName lastName email userType');

    if (!updated) {
      res.status(404).json({ message: 'Target profile user not found' });
      return;
    }

    // FIX: Match response envelope footprint symmetry here too
    res.status(200).json({
      userType: updated.userType,
      user: {
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/auth/cart
// Fetches the current user's cart, populated with product details.
router.get('/cart', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).populate('cart.product');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user.cart);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/auth/cart
// Syncs the frontend cart with the backend.
// Body: { cart: [ { productId, quantity } ] }
router.post('/cart', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cart } = req.body;
    if (!Array.isArray(cart)) {
      res.status(400).json({ message: 'Cart must be an array' });
      return;
    }

    const formattedCart = cart.map((item: any) => ({
      product: item.productId || item._id,
      quantity: item.quantity
    }));

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { cart: formattedCart },
      { new: true }
    ).populate('cart.product');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user.cart);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;