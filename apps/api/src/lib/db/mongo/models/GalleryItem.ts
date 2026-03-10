import mongoose, { Schema, type Document } from 'mongoose';
import type { IGalleryItem } from '../../types';

export interface GalleryItemDocument extends Omit<IGalleryItem, 'id'>, Document {}

const GalleryItemSchema = new Schema<GalleryItemDocument>(
  {
    albumId: { type: String, required: true, index: true },
    type: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
    url: { type: String, required: true },
    thumbnail: { type: String },
    caption: { type: String },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

GalleryItemSchema.index({ albumId: 1, sortOrder: 1 });

GalleryItemSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const GalleryItemModel =
  mongoose.models.GalleryItem || mongoose.model<GalleryItemDocument>('GalleryItem', GalleryItemSchema);
