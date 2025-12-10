import mongoose, { Schema, Document } from 'mongoose';

export interface IExcursionSetting extends Document {
  section: string;
  showPrice: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExcursionSettingSchema = new Schema<IExcursionSetting>({
  section: { type: String, required: true, unique: true },
  showPrice: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ExcursionSetting || mongoose.model<IExcursionSetting>('ExcursionSetting', ExcursionSettingSchema);
