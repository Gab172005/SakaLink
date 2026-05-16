import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
dotenv.config();
const seed = async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGODB_URI or MONGO_URI must be defined in .env');
    }
    await mongoose.connect(uri);
    const existing = await User.findOne({ userType: 'admin' });
    if (!existing) {
        await User.create({
            firstName: 'DA',
            lastName: 'Admin',
            email: 'admin@da.gov.ph',
            password: 'admin123',
            userType: 'admin',
        });
        console.log('Admin account seeded!');
    }
    else {
        console.log('Admin already exists.');
    }
    await mongoose.disconnect();
};
seed().catch(console.error);
//# sourceMappingURL=adminSeed.js.map