import mongoose, { Schema, type Document } from 'mongoose';
import type { IDonation } from '../../types';

export interface DonationDocument extends Omit<IDonation, 'id'>, Document {}

const DonationSchema = new Schema<DonationDocument>(
  {
    userId: { type: String, index: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String },
    donorPhone: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    isAnonymous: { type: Boolean, default: false },
    showInDonorList: { type: Boolean, default: true },
    receipt: { type: String },
  },
  { timestamps: true }
);

DonationSchema.index({ status: 1, createdAt: -1 });

DonationSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const DonationModel =
  mongoose.models.Donation || mongoose.model<DonationDocument>('Donation', DonationSchema);
