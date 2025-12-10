import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: Record<string, string>;
  description: Record<string, string>;
  icon: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  title: { type: Schema.Types.Mixed, required: true },
  description: { type: Schema.Types.Mixed, required: true },
  icon: { type: String, required: true },
  order: { type: Number, required: true, default: 0 },
  active: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
