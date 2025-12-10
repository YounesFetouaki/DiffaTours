import mongoose, { Schema, Document } from 'mongoose';

export interface ISmsLog extends Document {
  messageSid?: string;
  orderId?: number;
  phoneNumber: string;
  messageBody: string;
  messageType: 'booking_confirmation' | 'reminder_24h' | 'pickup_notification';
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  scheduledFor?: Date;
  sentAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SmsLogSchema = new Schema<ISmsLog>({
  messageSid: { type: String, unique: true, sparse: true },
  orderId: { type: Number, index: true },
  phoneNumber: { type: String, required: true, index: true },
  messageBody: { type: String, required: true },
  messageType: { 
    type: String, 
    required: true,
    enum: ['booking_confirmation', 'reminder_24h', 'pickup_notification']
  },
  status: { 
    type: String, 
    required: true, 
    default: 'queued',
    enum: ['queued', 'sent', 'delivered', 'failed', 'undelivered']
  },
  scheduledFor: { type: Date },
  sentAt: { type: Date },
  errorCode: { type: String },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SmsLog || mongoose.model<ISmsLog>('SmsLog', SmsLogSchema);
