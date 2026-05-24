import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: No MongoDB URI found in environment variables!');
}

// Disable buffering globally to ensure we always have a connection before querying
mongoose.set('bufferCommands', false);

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!MONGO_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  if (cachedPromise) {
    console.log('⏳ Waiting for existing MongoDB connection attempt...');
    return cachedPromise;
  }

  console.log('🔄 Initiating new MongoDB connection...');
  cachedPromise = mongoose.connect(MONGO_URI as string, {
    // These options are for the driver and Mongoose connection behavior
    autoIndex: true, // Keep this true if you rely on mongoose to create indexes
  }).then((m) => {
    console.log('✅ MongoDB connected successfully');
    return m;
  }).catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    cachedPromise = null; // Reset promise so we can retry on next request
    throw err;
  });

  return cachedPromise;
};
