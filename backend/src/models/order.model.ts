import mongoose, { Schema, Document } from "mongoose";

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;              // Snapshot of the name at checkout time
  quantity: number;
  priceAtPurchase: number;   // Snapshot of the price at checkout time
}

export interface OrderDocument extends Document {
  user: mongoose.Types.ObjectId;
  email: string;
  items: OrderItem[];        // Supports multiple cart items in one checkout
  deliveryAddress: string;   // FIX: Flat string per your frontend spec
  paymentMethod: string;     // GCash, Maya, COD, Bank Transfer
  totalToPay: number;        // Direct mapping to your "Total to Pay" label
  status: number;            // 0: Pending, 1: Out for Delivery, 2: Completed, 3: Cancelled
}

const orderSchema = new Schema<OrderDocument>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    email: { 
      type: String, 
      required: true,
      trim: true
    },
    // Allows checkout of a whole cart at once
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number, required: true, min: 0 }
      }
    ],
    // Saved exactly as the single text string passed from your frontend input
    deliveryAddress: { 
      type: String, 
      required: true 
    },
    paymentMethod: {
      type: String,
      enum: ["GCash", "Maya", "Cash on Delivery", "Bank Transfer"],
      required: true
    },
    totalToPay: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    status: {
      type: Number,
      enum: [0, 1, 2, 3], 
      default: 0, 
    },
  },
  { timestamps: true }
);

// Performance Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, status: 1 });

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);