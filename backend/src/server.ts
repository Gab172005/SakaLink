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

// Middleware to ensure DB connection - Most stable for Vercel
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  
  if (!MONGO_URI) {
    return next(); // Let the route handle missing DB if needed, or it will just fail on query
  }

  try {
    await mongoose.connect(MONGO_URI);
    next();
  } catch (err) {
    console.error('DB Connection Error:', err);
    next(); // Continue even if DB fails so we can see the root message
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
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;