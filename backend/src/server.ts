import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import authRoutes    from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes   from './routes/orders.js';
import adminRoutes   from './routes/admin.js';

dotenv.config();
const app  = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:4173",
];

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/test";


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS: origin ${origin} not allowed`);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);

console.log('Connecting to MongoDB...');
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('CRITICAL: DB connection error:', err.message);
    console.log('Ensure MongoDB is running and your MONGO_URI is correct.');
    // Start server anyway so frontend can at least get a 500 instead of "failed to fetch"
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (WITHOUT DB CONNECTION)`));
  });