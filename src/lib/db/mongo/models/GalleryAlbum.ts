import mongoose, { Schema, type Document } from 'mongoose';
import type { IGalleryAlbum } from '../../types';

export interface GalleryAlbumDocument extends Omit<IGalleryAlbum, 'id'>, Document {}

const GalleryAlbumSchema = new Schema<GalleryAlbumDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
  },
  { timestamps: true }
);

GalleryAlbumSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const GalleryAlbumModel =
  mongoose.models.GalleryAlbum || mongoose.model<GalleryAlbumDocument>('GalleryAlbum', GalleryAlbumSchema);
