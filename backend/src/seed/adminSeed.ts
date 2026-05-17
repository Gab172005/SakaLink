import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
dotenv.config();

const seed = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGO_URI as string);

  const existing = await User.findOne({ userType: 'admin' });
  const hashed = await bcrypt.hash('admin123', 10);
  if (!existing) {
    await User.create({
      firstName: 'DA',
      lastName: 'Admin',
      email: 'admin@da.gov.ph',
      password: hashed,
      userType: 'admin',
    });
    console.log('Admin account seeded!');
  } else {
    console.log('Admin already exists.');
  }

  await mongoose.disconnect();
};

seed().catch(console.error);