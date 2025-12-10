import mongoose, { Schema, Document } from 'mongoose';

export interface IExcursionCapacity extends Document {
  excursionId: string;
  date: string; // ISO date string YYYY-MM-DD
  maxCapacity: number;
  currentBookings: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExcursionCapacitySchema = new Schema<IExcursionCapacity>({
  excursionId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  maxCapacity: { type: Number, required: true },
  currentBookings: { type: Number, required: true, default: 0 },
  isAvailable: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  collection: 'excursioncapacities'
});

// Compound index for unique excursion-date pairs
ExcursionCapacitySchema.index({ excursionId: 1, date: 1 }, { unique: true });

export default mongoose.models.ExcursionCapacity || mongoose.model<IExcursionCapacity>('ExcursionCapacity', ExcursionCapacitySchema);
