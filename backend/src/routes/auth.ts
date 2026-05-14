import { Router, type Request, type Response } from 'express';
// Note: You imported 'bcryptjs' here, but 'bcrypt' in the model. 
// It's best to stick to just 'bcrypt' across the whole project to avoid bloating dependencies!
import bcrypt from 'bcrypt'; 
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

    // FIX: Removed manual bcrypt.hash here. 
    // Your user.model.ts pre('save') hook will handle hashing automatically!
    await User.create({
      firstName, 
      middleName, 
      lastName,
      email, 
      password, // Send raw password, the model will hash it
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
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, userType: user.userType });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;