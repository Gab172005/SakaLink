import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load env vars at the very top for ESM
dotenv.config();

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js'; 
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Log env status (without leaking secrets)
console.log('Environment check:', {
  hasMongoUri: !!process.env.MONGODB_URI,
  hasMongoUriAlt: !!process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV
});

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: No MongoDB URI found in environment variables!');
}

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'https://saka-link.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        console.warn(`CORS blocked: ${origin}`);
        // Instead of returning an error, we return false to let CORS middleware handle it
        // and avoid potential 500 errors that skip CORS headers
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

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

console.log('Attempting MongoDB connection...');
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
}

// For Vercel, we export the app but also listen for local dev
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;