import express, { type Request, type Response, type NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load env vars at the very top for ESM
dotenv.config();

// Import DB config early to set global mongoose behaviors
import { connectDB } from './config/mongoose.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js'; 
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to ensure DB connection
const ensureDbConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// Log env status (without leaking secrets)
console.log('Environment check:', {
  nodeEnv: process.env.NODE_ENV
});

const ALLOWED_ORIGINS: string[] = [
  process.env.CLIENT_URL,
  'https://saka-link.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter((origin): origin is string => Boolean(origin)); // Clean type guard for filtering undefined strings

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const isAllowed = 
        ALLOWED_ORIGINS.includes(origin) || 
        origin.endsWith('.vercel.app') || 
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(ensureDbConnection);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

// For Vercel, we export the app but also listen for local dev
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;