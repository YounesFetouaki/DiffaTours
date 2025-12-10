import mongoose, { Schema, Document } from 'mongoose';

export interface ISmsPreference extends Document {
  userId: string;
  bookingConfirmations: boolean;
  reminders: boolean;
  pickupNotifications: boolean;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SmsPreferenceSchema = new Schema<ISmsPreference>({
  userId: { type: String, required: true, unique: true, index: true },
  bookingConfirmations: { type: Boolean, required: true, default: true },
  reminders: { type: Boolean, required: true, default: true },
  pickupNotifications: { type: Boolean, required: true, default: true },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SmsPreference || mongoose.model<ISmsPreference>('SmsPreference', SmsPreferenceSchema);
