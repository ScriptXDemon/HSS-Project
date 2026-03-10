import mongoose, { Schema, type Document } from 'mongoose';
import type { IMember } from '../../types';

export interface MemberDocument extends Omit<IMember, 'id'>, Document {}

const MemberSchema = new Schema<MemberDocument>(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String },
    aadharNumber: { type: String },
    address: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    occupation: { type: String },
    photo: { type: String },
    idCardNumber: { type: String, unique: true, sparse: true },
    idCardGeneratedAt: { type: Date },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

MemberSchema.index({ fullName: 'text', fatherName: 'text', district: 'text' });
MemberSchema.index({ status: 1, createdAt: -1 });

MemberSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MemberModel =
  mongoose.models.Member || mongoose.model<MemberDocument>('Member', MemberSchema);
