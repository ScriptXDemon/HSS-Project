import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { AppError } from './errors';

const PHOTO_SIZE_LIMIT_BYTES = 2 * 1024 * 1024;
const GALLERY_SIZE_LIMIT_BYTES = 5 * 1024 * 1024;
const VIDEO_SIZE_LIMIT_BYTES = 25 * 1024 * 1024;
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MEDIA_MIME_TYPES = new Set([
  ...Array.from(IMAGE_MIME_TYPES),
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);
const MEDIA_EXTENSIONS = new Set([
  ...Array.from(IMAGE_EXTENSIONS),
  '.mp4',
  '.webm',
  '.mov',
]);

export interface UploadResult {
  key: string;
  url: string;
}

export interface UploadOptions {
  folder: string;
  maxSizeBytes: number;
}

interface ValidationOptions {
  mimeTypes: Set<string>;
  extensions: Set<string>;
  maxSizeBytes: number;
  emptyMessage: string;
  invalidMessage: string;
}

function getStorageProtocol() {
  return process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
}

function getStorageBucket() {
  const bucket = process.env.MINIO_BUCKET;

  if (!bucket) {
    throw new AppError('MINIO_BUCKET is not configured', 500);
  }

  return bucket;
}

function getStorageEndpoint() {
  const endpoint = process.env.MINIO_ENDPOINT;

  if (!endpoint) {
    throw new AppError('MINIO_ENDPOINT is not configured', 500);
  }

  return endpoint.replace(/\/$/, '');
}

function getStoragePort() {
  return process.env.MINIO_PORT || '9000';
}

function isS3Configured() {
  return Boolean(
    process.env.MINIO_ENDPOINT &&
      process.env.MINIO_BUCKET &&
      process.env.MINIO_ACCESS_KEY &&
      process.env.MINIO_SECRET_KEY
  );
}

function getS3Client() {
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new AppError('S3-compatible storage credentials are not configured', 500);
  }

  return new S3Client({
    endpoint: `${getStorageProtocol()}://${getStorageEndpoint()}:${getStoragePort()}`,
    region: 'auto',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  });
}

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
}

function buildPublicUrl(key: string) {
  const customBase = process.env.UPLOAD_PUBLIC_URL_BASE?.replace(/\/$/, '');

  if (customBase) {
    return `${customBase}/${key}`;
  }

  return `${getStorageProtocol()}://${getStorageEndpoint()}:${getStoragePort()}/${getStorageBucket()}/${key}`;
}

function getLocalUploadRoot() {
  return path.join(process.cwd(), 'public', 'uploads');
}

function getLocalUploadPath(key: string) {
  return path.join(getLocalUploadRoot(), ...key.split('/'));
}

async function uploadFileLocally(key: string, body: Buffer) {
  const targetPath = getLocalUploadPath(key);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, body);

  return {
    key,
    url: `/uploads/${key}`,
  };
}

function validateUploadFile(file: File, options: ValidationOptions) {
  if (!file || file.size === 0) {
    throw new AppError(options.emptyMessage, 400);
  }

  const extension = path.extname(file.name).toLowerCase();

  if (!options.mimeTypes.has(file.type) || !options.extensions.has(extension)) {
    throw new AppError(options.invalidMessage, 400);
  }

  if (file.size > options.maxSizeBytes) {
    throw new AppError(
      `File exceeds the ${Math.round(options.maxSizeBytes / 1024 / 1024)}MB size limit`,
      400
    );
  }
}

async function uploadValidatedFile(file: File, options: UploadOptions) {
  const extension = path.extname(file.name).toLowerCase();
  const fileBaseName = sanitizeFilename(path.basename(file.name, extension));
  const key = `${options.folder}/${randomUUID()}-${fileBaseName}${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  if (!isS3Configured()) {
    return uploadFileLocally(key, body);
  }

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getStorageBucket(),
        Key: key,
        Body: body,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    return {
      key,
      url: buildPublicUrl(key),
    };
  } catch (error) {
    console.warn('Remote upload failed, falling back to local storage.', error);
    return uploadFileLocally(key, body);
  }
}

export function validateImageFile(file: File, maxSizeBytes: number) {
  validateUploadFile(file, {
    mimeTypes: IMAGE_MIME_TYPES,
    extensions: IMAGE_EXTENSIONS,
    maxSizeBytes,
    emptyMessage: 'Please upload an image file',
    invalidMessage: 'Only JPG, PNG, and WebP images are allowed',
  });
}

export function validateMediaFile(file: File, maxSizeBytes: number) {
  validateUploadFile(file, {
    mimeTypes: MEDIA_MIME_TYPES,
    extensions: MEDIA_EXTENSIONS,
    maxSizeBytes,
    emptyMessage: 'Please upload a media file',
    invalidMessage: 'Only JPG, PNG, WebP, MP4, WebM, and MOV files are allowed',
  });
}

export async function uploadImageFile(file: File, options: UploadOptions): Promise<UploadResult> {
  validateImageFile(file, options.maxSizeBytes);
  return uploadValidatedFile(file, options);
}

export async function uploadMediaFile(file: File, options: UploadOptions): Promise<UploadResult> {
  validateMediaFile(file, options.maxSizeBytes);
  return uploadValidatedFile(file, options);
}

export async function deleteUploadedFile(key: string) {
  if (!key) {
    return;
  }

  const localPath = getLocalUploadPath(key);

  try {
    await fs.unlink(localPath);
    return;
  } catch {
    // Ignore local deletion failures and try remote deletion when configured.
  }

  if (!isS3Configured()) {
    return;
  }

  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: getStorageBucket(),
      Key: key,
    })
  );
}

export const uploadLimits = {
  memberPhoto: PHOTO_SIZE_LIMIT_BYTES,
  galleryAsset: GALLERY_SIZE_LIMIT_BYTES,
  donationProof: GALLERY_SIZE_LIMIT_BYTES,
  eventVideo: VIDEO_SIZE_LIMIT_BYTES,
};
