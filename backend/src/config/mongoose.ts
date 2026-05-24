import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: No MongoDB URI found in environment variables!');
}

let cachedConnection: any = null;

export const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGO_URI as string, {
      bufferCommands: false,
    });
    cachedConnection = conn;
    console.log('✅ MongoDB connected successfully');
    return cachedConnection;
  } catch (err: any) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};
