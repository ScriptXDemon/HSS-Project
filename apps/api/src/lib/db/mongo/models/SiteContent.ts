import mongoose, { Schema, type Document } from 'mongoose';
import type { ISiteContent } from '../../types';

export interface SiteContentDocument extends Omit<ISiteContent, 'id'>, Document {}

const SiteContentSchema = new Schema<SiteContentDocument>(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

SiteContentSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SiteContentModel =
  mongoose.models.SiteContent || mongoose.model<SiteContentDocument>('SiteContent', SiteContentSchema);
