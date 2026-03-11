import { getDb } from '@/lib/db';
import type { IDonation } from '@/lib/db/types';
import { AppError } from '@/lib/errors';
import {
  createRazorpayOrder,
  getRazorpayPublicKey,
  verifyRazorpayWebhookSignature,
} from '@/lib/razorpay';
import { deleteUploadedFile, uploadImageFile, uploadLimits } from '@/lib/upload';
import { donationSchema } from '@/lib/validators';
import { normalizeOptionalString } from './users';

interface DonationOrderInput {
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  isAnonymous?: boolean;
}

interface ManualDonationInput extends DonationOrderInput {
  screenshot: File;
}

interface RazorpayPaymentEntity {
  id?: string;
  order_id?: string;
  status?: string;
  email?: string;
  contact?: string;
}

interface RazorpayWebhookEvent {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
    refund?: {
      entity?: {
        payment_id?: string;
      };
    };
  };
}

function buildReceiptId(donationId: string) {
  return `don_${donationId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32)}`;
}

function getPaymentEntity(event: RazorpayWebhookEvent) {
  return event.payload?.payment?.entity;
}

async function findDonationFromWebhook(event: RazorpayWebhookEvent) {
  const db = await getDb();
  const payment = getPaymentEntity(event);

  if (payment?.id) {
    const byPayment = await db.donation.findByRazorpayPaymentId(payment.id);
    if (byPayment) {
      return byPayment;
    }
  }

  if (payment?.order_id) {
    return db.donation.findByRazorpayOrderId(payment.order_id);
  }

  const refundPaymentId = event.payload?.refund?.entity?.payment_id;
  if (refundPaymentId) {
    return db.donation.findByRazorpayPaymentId(refundPaymentId);
  }

  return null;
}

function mapWebhookStatus(eventName?: string): IDonation['status'] | null {
  if (!eventName) {
    return null;
  }

  if (eventName === 'payment.captured' || eventName === 'order.paid') {
    return 'SUCCESS';
  }

  if (eventName === 'payment.failed') {
    return 'FAILED';
  }

  if (eventName.startsWith('refund.')) {
    return 'REFUNDED';
  }

  return null;
}

export async function createDonationOrderService(input: DonationOrderInput) {
  const parsed = donationSchema.safeParse({
    ...input,
    donorEmail: normalizeOptionalString(input.donorEmail),
    donorPhone: normalizeOptionalString(input.donorPhone),
  });

  if (!parsed.success) {
    throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  const db = await getDb();
  const donation = await db.donation.create({
    donorName: parsed.data.donorName.trim(),
    donorEmail: normalizeOptionalString(parsed.data.donorEmail),
    donorPhone: normalizeOptionalString(parsed.data.donorPhone),
    amount: parsed.data.amount,
    currency: 'INR',
    status: 'PENDING',
    isAnonymous: parsed.data.isAnonymous,
    showInDonorList: !parsed.data.isAnonymous,
    userId: undefined,
    razorpayOrderId: undefined,
    razorpayPaymentId: undefined,
    receipt: undefined,
    paymentMode: 'RAZORPAY',
    paymentProofStatus: 'NOT_REQUIRED',
    paymentProofKey: undefined,
    verifiedBy: undefined,
    verifiedAt: undefined,
    verificationNotes: undefined,
  });

  try {
    const order = await createRazorpayOrder({
      amountInPaise: Math.round(parsed.data.amount * 100),
      receipt: buildReceiptId(donation.id),
      notes: {
        donationId: donation.id,
        donorName: donation.donorName,
      },
    });

    await db.donation.update(donation.id, {
      razorpayOrderId: order.id,
    });

    return {
      donationId: donation.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: getRazorpayPublicKey(),
      donor: {
        name: donation.donorName,
        email: donation.donorEmail,
        contact: donation.donorPhone,
      },
    };
  } catch (error) {
    await db.donation.update(donation.id, { status: 'FAILED' });
    throw error;
  }
}

export async function submitManualDonationService(input: ManualDonationInput) {
  const parsed = donationSchema.safeParse({
    ...input,
    donorEmail: normalizeOptionalString(input.donorEmail),
    donorPhone: normalizeOptionalString(input.donorPhone),
  });

  if (!parsed.success) {
    throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  if (!input.screenshot || input.screenshot.size === 0) {
    throw new AppError('Payment screenshot is required', 400, {
      screenshot: ['Payment screenshot is required'],
    });
  }

  const uploadedProof = await uploadImageFile(input.screenshot, {
    folder: 'donations/proofs',
    maxSizeBytes: uploadLimits.donationProof,
    visibility: 'private',
  });

  try {
    const db = await getDb();
    const donation = await db.donation.create({
      donorName: parsed.data.donorName.trim(),
      donorEmail: normalizeOptionalString(parsed.data.donorEmail),
      donorPhone: normalizeOptionalString(parsed.data.donorPhone),
      amount: parsed.data.amount,
      currency: 'INR',
      status: 'PENDING',
      isAnonymous: parsed.data.isAnonymous,
      showInDonorList: !parsed.data.isAnonymous,
      userId: undefined,
      razorpayOrderId: undefined,
      razorpayPaymentId: undefined,
      receipt: undefined,
      paymentMode: 'MANUAL_UPI',
      paymentProofKey: uploadedProof.key,
      paymentProofStatus: 'PENDING_REVIEW',
      verifiedBy: undefined,
      verifiedAt: undefined,
      verificationNotes: undefined,
    });

    return {
      donationId: donation.id,
      status: donation.status,
      proofUrl: uploadedProof.url,
      message:
        'Donation details submitted successfully. The payment proof is pending admin verification.',
    };
  } catch (error) {
    await deleteUploadedFile(uploadedProof.key).catch(() => undefined);
    throw error;
  }
}

export async function handleRazorpayWebhook(payload: string, signature: string) {
  verifyRazorpayWebhookSignature(payload, signature);

  const event = JSON.parse(payload) as RazorpayWebhookEvent;
  const nextStatus = mapWebhookStatus(event.event);

  if (!nextStatus) {
    return {
      processed: false,
      reason: 'Ignored webhook event',
    };
  }

  const donation = await findDonationFromWebhook(event);

  if (!donation) {
    return {
      processed: false,
      reason: 'Donation not found',
    };
  }

  const payment = getPaymentEntity(event);

  if (
    donation.status === nextStatus &&
    (!payment?.id || donation.razorpayPaymentId === payment.id)
  ) {
    return {
      processed: false,
      reason: 'Duplicate webhook',
      donationId: donation.id,
    };
  }

  const db = await getDb();
  await db.donation.update(donation.id, {
    status: nextStatus,
    razorpayPaymentId: payment?.id || donation.razorpayPaymentId,
    donorEmail: donation.donorEmail || payment?.email || undefined,
    donorPhone: donation.donorPhone || payment?.contact || undefined,
    paymentMode: donation.paymentMode || 'RAZORPAY',
    paymentProofStatus: nextStatus === 'SUCCESS' ? 'NOT_REQUIRED' : donation.paymentProofStatus,
  });

  return {
    processed: true,
    donationId: donation.id,
    status: nextStatus,
  };
}
