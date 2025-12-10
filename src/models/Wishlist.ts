import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  userClerkId: string;
  excursionId: string;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  userClerkId: { type: String, required: true, index: true },
  excursionId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound index for unique user-excursion pairs
WishlistSchema.index({ userClerkId: 1, excursionId: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
