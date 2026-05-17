import mongoose, { Schema, Document } from "mongoose";

export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId; // recipient
  type: string;                    // event type, ex. "order_confirmed"
  message: string;                 // human-readable message
  isRead: boolean;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    type:    { type: String, required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<NotificationDocument>("Notification", notificationSchema);