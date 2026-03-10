import mongoose, { Schema, type Document } from 'mongoose';
import type { ISiteSetting } from '../../types';

export interface SiteSettingDocument extends Omit<ISiteSetting, 'id'>, Document {}

const SiteSettingSchema = new Schema<SiteSettingDocument>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

SiteSettingSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SiteSettingModel =
  mongoose.models.SiteSetting || mongoose.model<SiteSettingDocument>('SiteSetting', SiteSettingSchema);
