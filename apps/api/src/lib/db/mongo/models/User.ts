import mongoose, { Schema, type Document } from 'mongoose';
import type { IUser } from '../../types';

export interface UserDocument extends Omit<IUser, 'id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'MEMBER'], default: 'MEMBER' },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    avatar: { type: String },
  },
  { timestamps: true }
);

UserSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const UserModel =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);