import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt"; // used for security by hashing the password

export interface userDocument extends Document {
  firstName: string;
  middleName?: string; // optional
  lastName: string;
  userType: 'admin' | 'customer'; // Changed from 'role' to 'userType'
  email: string;
  password: string;
  cart: Map<string, number>;
  comparePassword: (password: string) => Promise<boolean>; 
}

const userSchema = new Schema<userDocument>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    userType: { // Changed from 'role' to 'userType'
      type: String,
      enum: ['admin', 'customer'],
      default: "customer",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // exclude the pw from the query for security stuff
    },
    cart: { 
      type: Map, 
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) { 
    return;
  }
  const salt = await bcrypt.genSalt(10); 
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<userDocument>("User", userSchema);