import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  createdAt: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  role: { type: String, required: true, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
