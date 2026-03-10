import mongoose, { Schema, type Document } from 'mongoose';
import type { IEvent } from '../../types';

export interface EventDocument extends Omit<IEvent, 'id'>, Document {}

const EventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    coverImage: { type: String },
    videoUrl: { type: String },
    date: { type: Date, required: true },
    endDate: { type: Date },
    venue: { type: String },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EventSchema.index({ isPublished: 1, date: -1 });

EventSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const EventModel =
  mongoose.models.Event || mongoose.model<EventDocument>('Event', EventSchema);
