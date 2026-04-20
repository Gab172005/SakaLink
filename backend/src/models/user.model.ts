import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";//used for security by hashing the password

export interface userDocument extends Document {
  firstName: string;
  middleName?: string;//optional
  lastName: string;
  role: 'admin' | 'customer';
  email: string;
  password: string;
  cart: Map<string, number>;
  comparePassword: (password: string) => Promise<boolean>;//promise is asynchronous, because bsync is time-consuming, promise is used so the website doesn't freeze for other users
  //while it's checking the password.
}

const userSchema = new Schema<userDocument>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    role: {
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
      select: false,//exclude the pw from the query for security stuff
    },
    cart: {//adds persistency for the project spec
      type: Map,//this is a map of productId to quantity, i.e a key-value pair. w/ productid and quantity
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {//doesn't hash if password wasnt changed
    return;
  }
  const salt = await bcrypt.genSalt(10);//the number of hashing rounds
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<userDocument>("User", userSchema);