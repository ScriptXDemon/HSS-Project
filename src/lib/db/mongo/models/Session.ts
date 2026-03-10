import mongoose, { Schema, type Document } from 'mongoose';
import type { ISession } from '../../types';

export interface SessionDocument extends Omit<ISession, 'id'>, Document {}

const SessionSchema = new Schema<SessionDocument>(
  {
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

SessionSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SessionModel =
  mongoose.models.Session || mongoose.model<SessionDocument>('Session', SessionSchema);
