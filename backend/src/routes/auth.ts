import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const router = Router();

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

    await User.create({
      firstName, 
      middleName, 
      lastName,
      email, 
      password, 
      userType: 'customer',
    });

    res.status(201).json({ message: 'Registered successfully' });
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
    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET as string,
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const user = await User.findById(decoded.id).select('firstName lastName email userType');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid session' });
  }
});

export default router;