import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId?: mongoose.Types.ObjectId;
  reservationId?: mongoose.Types.ObjectId;
  excursionSlug: string;
  excursionName: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const ReviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
  excursionSlug: { type: String, required: true },
  excursionName: { type: String, required: true },
  rating: { type: Number, required: true },
  title: { type: String },
  comment: { type: String, required: true },
  images: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
