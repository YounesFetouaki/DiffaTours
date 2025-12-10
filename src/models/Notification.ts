import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string; // Clerk user ID
  type: 'order_created' | 'order_confirmed' | 'order_rejected';
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true, enum: ['order_created', 'order_confirmed', 'order_rejected'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  orderId: { type: String },
  orderNumber: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
