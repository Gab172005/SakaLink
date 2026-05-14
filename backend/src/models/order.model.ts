import mongoose, { Schema, Document } from "mongoose";

export interface OrderDocument extends Document {
  user: mongoose.Types.ObjectId;     
  productId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: number;                   
  email: string;                     
}

const orderSchema = new Schema<OrderDocument>(
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
      enum: [0, 1, 2], // 0: pending, 1: completed, 2: cancelled
      default: 0, 
    },
    email: { 
      type: String, 
      required: true 
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ productId: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);