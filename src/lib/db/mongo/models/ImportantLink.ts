import mongoose, { Schema, type Document } from 'mongoose';
import type { IImportantLink } from '../../types';

export interface ImportantLinkDocument extends Omit<IImportantLink, 'id'>, Document {}

const ImportantLinkSchema = new Schema<ImportantLinkDocument>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ImportantLinkSchema.index({ sortOrder: 1 });

ImportantLinkSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ImportantLinkModel =
  mongoose.models.ImportantLink || mongoose.model<ImportantLinkDocument>('ImportantLink', ImportantLinkSchema);
