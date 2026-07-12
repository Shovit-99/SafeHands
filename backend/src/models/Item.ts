import mongoose, { Schema } from 'mongoose';
import { IItem } from '../types';

const ItemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Clothing',
        'Accessories',
        'Books',
        'ID & Cards',
        'Keys',
        'Bags',
        'Sports',
        'Other',
      ],
    },
    status: {
      type: String,
      enum: ['Lost', 'Found', 'Claimed'],
      default: 'Lost',
    },
    locationName: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: 'Maximum 5 images allowed per item',
      },
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    claimToken: {
      type: String,
      default: null,
      select: false, // Hidden from standard queries
    },
  },
  {
    timestamps: true,
  }
);

// ─── Text Index for Full-Text Search ─────────────────────────────────────────
ItemSchema.index({ title: 'text', description: 'text', locationName: 'text' });

// ─── Compound Indexes for Filter Queries ──────────────────────────────────────
ItemSchema.index({ status: 1, category: 1, createdAt: -1 });
ItemSchema.index({ reporterId: 1 });

const Item = mongoose.model<IItem>('Item', ItemSchema);
export default Item;
