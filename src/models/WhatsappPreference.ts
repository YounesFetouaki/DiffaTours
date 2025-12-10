import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsappPreference extends Document {
  userId: string;
  phoneNumber: string;
  notificationsEnabled: boolean;
  bookingConfirmations: boolean;
  reminders: boolean;
  pickupNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsappPreferenceSchema = new Schema<IWhatsappPreference>({
  userId: { type: String, required: true, unique: true, index: true },
  phoneNumber: { type: String, required: true },
  notificationsEnabled: { type: Boolean, required: true, default: true },
  bookingConfirmations: { type: Boolean, required: true, default: true },
  reminders: { type: Boolean, required: true, default: true },
  pickupNotifications: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.WhatsappPreference || mongoose.model<IWhatsappPreference>('WhatsappPreference', WhatsappPreferenceSchema);
