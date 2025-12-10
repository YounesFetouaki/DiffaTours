import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  userId?: mongoose.Types.ObjectId;
  excursionSlug: string;
  excursionName: string;
  destination: string;
  reservationDate: string;
  reservationTime: string;
  bookingDate: string;
  adults: number;
  children: number;
  totalPriceMad: number;
  selectedItems?: string;
  status: string;
  paymentStatus?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const ReservationSchema = new Schema<IReservation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  excursionSlug: { type: String, required: true },
  excursionName: { type: String, required: true },
  destination: { type: String, required: true },
  reservationDate: { type: String, required: true },
  reservationTime: { type: String, required: true },
  bookingDate: { type: String, required: true },
  adults: { type: Number, required: true, default: 1 },
  children: { type: Number, default: 0 },
  totalPriceMad: { type: Number, required: true },
  selectedItems: { type: String },
  status: { type: String, required: true, default: 'pending' },
  paymentStatus: { type: String, default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);
