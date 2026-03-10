import { createHmac } from 'crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { decryptSensitiveValue, encryptSensitiveValue } from '../encryption';
import { AppError } from '../errors';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '../razorpay';
import { parseLeadershipEntries } from '../services/public-content';
import { uploadLimits, validateImageFile } from '../upload';

const validEncryptionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('encryption', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = validEncryptionKey;
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  it('round-trips encrypted values', () => {
    const encrypted = encryptSensitiveValue('123456789012');
    const decrypted = decryptSensitiveValue(encrypted);

    expect(encrypted).not.toBe('123456789012');
    expect(decrypted).toBe('123456789012');
  });

  it('rejects an invalid key configuration', () => {
    process.env.ENCRYPTION_KEY = 'abcd';

    expect(() => encryptSensitiveValue('123456789012')).toThrowError(AppError);
  });
});

describe('leadership parsing', () => {
  it('returns parsed structured leadership records', () => {
    const parsed = parseLeadershipEntries(
      JSON.stringify([
        {
          name: 'Aditi Sharma',
          role: 'State Convenor',
          photoUrl: 'https://example.com/aditi.jpg',
          bio: 'Coordinates state initiatives.',
        },
      ])
    );

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.name).toBe('Aditi Sharma');
    expect(parsed[0]?.role).toBe('State Convenor');
  });

  it('falls back when leadership content is invalid', () => {
    const parsed = parseLeadershipEntries('not-json');

    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]?.role).toBeTruthy();
  });
});

describe('upload validation', () => {
  it('accepts a valid member photo', () => {
    const file = new File(['avatar'], 'profile.png', {
      type: 'image/png',
    });

    expect(() => validateImageFile(file, uploadLimits.memberPhoto)).not.toThrow();
  });

  it('rejects unsupported file types', () => {
    const file = new File(['avatar'], 'profile.txt', {
      type: 'text/plain',
    });

    expect(() => validateImageFile(file, uploadLimits.memberPhoto)).toThrowError(AppError);
  });
});

describe('razorpay verification', () => {
  afterEach(() => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  it('verifies a valid signature payload', () => {
    const payload = JSON.stringify({ event: 'payment.captured' });
    const secret = 'super-secret';
    const signature = createHmac('sha256', secret).update(payload).digest('hex');

    expect(verifyRazorpaySignature(payload, signature, secret)).toBe(true);
    expect(verifyRazorpaySignature(payload, 'bad-signature', secret)).toBe(false);
  });

  it('rejects invalid webhook signatures', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'secret';

    expect(() => verifyRazorpayWebhookSignature('payload', 'invalid')).toThrowError(AppError);
  });
});
