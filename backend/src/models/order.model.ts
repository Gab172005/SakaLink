import mongoose, { Schema, Document } from "mongoose";

export interface orderDocument extends Document {
  user: mongoose.Types.ObjectId;     
  productId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: number;                   
  email: string;                     
  orderDate: Date;
}

const orderSchema = new Schema<orderDocument>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    productId: { 
      type: Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    totalPrice: { 
      type: Number, 
      required: true 
    },
    status: {
      type: Number,
      enum: [0, 1, 2], //pending completed & cancelled
      default: 0, 
    },
    email: { 
      type: String, 
      required: true 
    },
  },
  { timestamps: true }
);
//allows the DA to easily sort through orders easily.
orderSchema.index({ user: 1 });
orderSchema.index({ productId: 1 });
orderSchema.index({ createdAt: -1 }); // Sort by newest orders first

export const Order = mongoose.model<orderDocument>("Order", orderSchema);