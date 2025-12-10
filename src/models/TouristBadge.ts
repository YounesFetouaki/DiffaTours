import mongoose, { Schema, Document } from 'mongoose';

export interface ITouristBadge extends Document {
  orderId?: mongoose.Types.ObjectId;
  orderNumber: string;
  badgeCode: string;
  touristName: string;
  email: string;
  phone: string;
  tripDetails: string;
  status: string;
  validFrom: Date;
  validUntil: Date;
  generatedAt: Date;
  revokedAt?: Date;
  revokedBy?: mongoose.Types.ObjectId;
  revokedReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const TouristBadgeSchema = new Schema<ITouristBadge>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  orderNumber: { type: String, required: true, unique: true },
  badgeCode: { type: String, required: true, unique: true },
  touristName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  tripDetails: { type: String, required: true },
  status: { type: String, required: true, default: 'active' },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  generatedAt: { type: Date, default: Date.now },
  revokedAt: { type: Date },
  revokedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  revokedReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.models.TouristBadge || mongoose.model<ITouristBadge>('TouristBadge', TouristBadgeSchema);