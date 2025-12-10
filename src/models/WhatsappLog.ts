import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsappLog extends Document {
  messageId?: string;
  recipientPhone: string;
  messageText: string;
  templateName?: string;
  messageType: 'booking_confirmation' | 'reminder' | 'pickup_notification';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  orderId?: number;
  errorMessage?: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsappLogSchema = new Schema<IWhatsappLog>({
  messageId: { type: String, unique: true, sparse: true },
  recipientPhone: { type: String, required: true, index: true },
  messageText: { type: String, required: true },
  templateName: { type: String },
  messageType: { 
    type: String, 
    required: true,
    enum: ['booking_confirmation', 'reminder', 'pickup_notification']
  },
  status: { 
    type: String, 
    required: true, 
    default: 'sent',
    enum: ['sent', 'delivered', 'read', 'failed']
  },
  orderId: { type: Number, index: true },
  errorMessage: { type: String },
  sentAt: { type: Date, required: true, default: Date.now },
  deliveredAt: { type: Date },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.WhatsappLog || mongoose.model<IWhatsappLog>('WhatsappLog', WhatsappLogSchema);
