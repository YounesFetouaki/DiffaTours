import mongoose, { Schema, Document } from 'mongoose';

export interface IBadgeScan extends Document {
  badgeId?: mongoose.Types.ObjectId;
  badgeCode: string;
  scannedBy?: mongoose.Types.ObjectId;
  scannerName: string;
  scannerEmail: string;
  scanResult: string;
  scanLocation?: string;
  deviceInfo?: string;
  scannedAt: string;
  createdAt: Date;
}

const BadgeScanSchema = new Schema<IBadgeScan>({
  badgeId: { type: Schema.Types.ObjectId, ref: 'TouristBadge' },
  badgeCode: { type: String, required: true },
  scannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  scannerName: { type: String, required: true },
  scannerEmail: { type: String, required: true },
  scanResult: { type: String, required: true },
  scanLocation: { type: String },
  deviceInfo: { type: String },
  scannedAt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.BadgeScan || mongoose.model<IBadgeScan>('BadgeScan', BadgeScanSchema);
