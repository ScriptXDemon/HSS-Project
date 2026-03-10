import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { AppError } from './errors';

const KEY_LENGTH_BYTES = 32;
const IV_LENGTH_BYTES = 12;
const ENCRYPTION_VERSION = 'v1';

function getEncryptionKey() {
  const rawKey = process.env.ENCRYPTION_KEY;

  if (!rawKey) {
    throw new AppError('ENCRYPTION_KEY is not configured', 500);
  }

  const key = Buffer.from(rawKey.trim(), 'hex');

  if (key.length !== KEY_LENGTH_BYTES) {
    throw new AppError('ENCRYPTION_KEY must be a 32-byte hex string', 500);
  }

  return key;
}

export function encryptSensitiveValue(value: string) {
  if (!value) {
    return '';
  }

  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

export function decryptSensitiveValue(payload: string) {
  if (!payload) {
    return '';
  }

  const [version, ivHex, authTagHex, encryptedHex] = payload.split(':');

  if (version !== ENCRYPTION_VERSION || !ivHex || !authTagHex || !encryptedHex) {
    throw new AppError('Invalid encrypted payload format', 400);
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
