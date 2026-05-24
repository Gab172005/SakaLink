import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js'; 
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

let lastError: string | null = null;

// Middleware to ensure DB connection - Most stable for Vercel
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  
  if (!MONGO_URI) {
    lastError = "MONGODB_URI is missing in environment variables";
    return next();
  }

  try {
    // Adding options to fail faster if the IP is blocked or credentials are wrong
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    lastError = null;
    next();
  } catch (err) {
    lastError = (err as Error).message;
    console.error('DB Connection Error:', err);
    next(); 
  }
});

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'SakaLink API is online', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    error: lastError,
    uri_present: !!MONGO_URI
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;