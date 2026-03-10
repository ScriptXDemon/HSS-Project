import mongoose, { Schema, type Document } from 'mongoose';
import type { IContactMessage } from '../../types';

export interface ContactMessageDocument extends Omit<IContactMessage, 'id'>, Document {}

const ContactMessageSchema = new Schema<ContactMessageDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ContactMessageSchema.index({ isRead: 1, createdAt: -1 });

ContactMessageSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ContactMessageModel =
  mongoose.models.ContactMessage || mongoose.model<ContactMessageDocument>('ContactMessage', ContactMessageSchema);
