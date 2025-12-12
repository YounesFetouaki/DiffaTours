import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  userClerkId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passport: string;
  city: string;
  accommodationType: string;
  hotelName?: string;
  address?: string;
  paymentMethod: string;
  cartItems: string;
  totalMad: number;
  status: string;
  paymentStatus: string;
  transactionId?: string;
  authCode?: string;
  paymentResponse?: string;
  paidAt?: number;
  locale?: string;
  currency?: string;
  totalInCurrency?: number;
  exchangeRate?: number;
  createdAt: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  userClerkId: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  passport: { type: String, required: true },
  city: { type: String, required: true },
  accommodationType: { type: String, required: true },
  hotelName: { type: String },
  address: { type: String },
  paymentMethod: { type: String, required: true },
  cartItems: { type: String, required: true },
  totalMad: { type: Number, required: true },
  status: { type: String, required: true, default: 'pending' },
  paymentStatus: { type: String, required: true, default: 'pending' },
  transactionId: { type: String },
  authCode: { type: String },
  paymentResponse: { type: String },
  paidAt: { type: Number },
  locale: { type: String, default: 'fr' },
  currency: { type: String, default: 'MAD' },
  totalInCurrency: { type: Number },
  exchangeRate: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);