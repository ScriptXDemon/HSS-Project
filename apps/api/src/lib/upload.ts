import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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
const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

export type UploadVisibility = 'public' | 'private';

export interface UploadResult {
  key: string;
  url: string;
  visibility: UploadVisibility;
  contentType: string;
}

export interface UploadOptions {
  folder: string;
  maxSizeBytes: number;
  visibility?: UploadVisibility;
}

export interface StoredFileContent {
  body: Buffer;
  contentType: string;
  fileName: string;
  visibility: UploadVisibility;
}

interface ValidationOptions {
  mimeTypes: Set<string>;
  extensions: Set<string>;
  maxSizeBytes: number;
  emptyMessage: string;
  invalidMessage: string;
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function shouldDisableLocalFallback() {
  return isProduction() || process.env.DISABLE_LOCAL_UPLOAD_FALLBACK === 'true';
}

function getStorageBucket() {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET || process.env.MINIO_BUCKET;

  if (!bucket) {
    throw new AppError('Object storage bucket is not configured', 500);
  }

  return bucket;
}

function getStorageEndpoint() {
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || process.env.MINIO_ENDPOINT;

  if (!endpoint) {
    throw new AppError('Object storage endpoint is not configured', 500);
  }

  return endpoint.replace(/\/$/, '');
}

function getStoragePort() {
  return process.env.MINIO_PORT || '9000';
}

function buildStorageBaseUrl() {
  const endpoint = getStorageEndpoint();

  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  return `${protocol}://${endpoint}:${getStoragePort()}`;
}

function getPublicStorageBaseUrl() {
  return (
    process.env.UPLOAD_PUBLIC_URL_BASE?.replace(/\/$/, '') ||
    process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    `${buildStorageBaseUrl()}/${getStorageBucket()}`
  );
}

function getStorageCredentials() {
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.MINIO_ACCESS_KEY;
  const secretAccessKey =
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.MINIO_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new AppError('Object storage credentials are not configured', 500);
  }

  return { accessKeyId, secretAccessKey };
}

function getConfiguredStorageValue(kind: 'endpoint' | 'bucket' | 'accessKeyId' | 'secretAccessKey') {
  switch (kind) {
    case 'endpoint':
      return process.env.CLOUDFLARE_R2_ENDPOINT || process.env.MINIO_ENDPOINT;
    case 'bucket':
      return process.env.CLOUDFLARE_R2_BUCKET || process.env.MINIO_BUCKET;
    case 'accessKeyId':
      return process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.MINIO_ACCESS_KEY;
    case 'secretAccessKey':
      return process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.MINIO_SECRET_KEY;
    default:
      return undefined;
  }
}

function isS3Configured() {
  return Boolean(
    getConfiguredStorageValue('endpoint') &&
      getConfiguredStorageValue('bucket') &&
      getConfiguredStorageValue('accessKeyId') &&
      getConfiguredStorageValue('secretAccessKey')
  );
}

function getS3Client() {
  const { accessKeyId, secretAccessKey } = getStorageCredentials();

  return new S3Client({
    endpoint: buildStorageBaseUrl(),
    region: process.env.CLOUDFLARE_R2_REGION || 'auto',
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
  return `${getPublicStorageBaseUrl()}/${key}`;
}

function buildProtectedFileUrl(key: string) {
  return `/api/admin/files?key=${encodeURIComponent(key)}`;
}

function getVisibilityPrefix(visibility: UploadVisibility) {
  return visibility === 'private' ? 'private' : 'public';
}

function getLocalUploadRoot(visibility: UploadVisibility) {
  if (visibility === 'private') {
    return path.join(process.cwd(), '.uploads', 'private');
  }

  return path.join(process.cwd(), 'public', 'uploads');
}

function getVisibilityFromKey(key: string): UploadVisibility {
  return key.startsWith('private/') ? 'private' : 'public';
}

function getLocalUploadPath(key: string) {
  const visibility = getVisibilityFromKey(key);
  const prefix = visibility === 'private' ? 'private/' : 'public/';
  const relativeKey = key.startsWith(prefix) ? key.slice(prefix.length) : key;
  return path.join(getLocalUploadRoot(visibility), ...relativeKey.split('/'));
}

function buildFileUrl(key: string, visibility: UploadVisibility) {
  if (visibility === 'private') {
    return buildProtectedFileUrl(key);
  }

  return buildPublicUrl(key);
}

async function uploadFileLocally(
  key: string,
  body: Buffer,
  contentType: string,
  visibility: UploadVisibility
) {
  if (shouldDisableLocalFallback()) {
    throw new AppError('Object storage is required in production deployments', 500);
  }

  const targetPath = getLocalUploadPath(key);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, body);

  return {
    key,
    url:
      visibility === 'private'
        ? buildProtectedFileUrl(key)
        : `/uploads/${key.startsWith('public/') ? key.slice('public/'.length) : key}`,
    visibility,
    contentType,
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
  const visibility = options.visibility ?? 'public';
  const key = `${getVisibilityPrefix(visibility)}/${options.folder}/${randomUUID()}-${fileBaseName}${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  if (!isS3Configured()) {
    return uploadFileLocally(key, body, file.type, visibility);
  }

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getStorageBucket(),
        Key: key,
        Body: body,
        ContentType: file.type,
        CacheControl:
          visibility === 'public' ? 'public, max-age=31536000, immutable' : 'private, no-store',
      })
    );

    return {
      key,
      url: buildFileUrl(key, visibility),
      visibility,
      contentType: file.type,
    };
  } catch (error) {
    if (shouldDisableLocalFallback()) {
      throw new AppError('Object storage upload failed', 500, {
        reason: error instanceof Error ? error.message : 'Unknown upload failure',
      });
    }

    console.warn('Remote upload failed, falling back to local storage.', error);
    return uploadFileLocally(key, body, file.type, visibility);
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

  if (!shouldDisableLocalFallback()) {
    try {
      await fs.unlink(localPath);
      return;
    } catch {
      // Ignore local deletion failures and try remote deletion when configured.
    }
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

function inferContentType(key: string) {
  return MIME_TYPES_BY_EXTENSION[path.extname(key).toLowerCase()] || 'application/octet-stream';
}

function inferFileName(key: string) {
  return path.basename(key);
}

async function streamToBuffer(body: unknown) {
  if (!body) {
    return Buffer.alloc(0);
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  if (typeof body === 'string') {
    return Buffer.from(body);
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    'transformToByteArray' in body &&
    typeof body.transformToByteArray === 'function'
  ) {
    const byteArray = await body.transformToByteArray();
    return Buffer.from(byteArray);
  }

  if (typeof (body as NodeJS.ReadableStream | undefined)?.[Symbol.asyncIterator] === 'function') {
    const chunks: Buffer[] = [];
    for await (const chunk of body as AsyncIterable<Buffer | Uint8Array | string>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  throw new AppError('Unable to read uploaded file content', 500);
}

export async function readUploadedFile(key: string): Promise<StoredFileContent> {
  if (!key) {
    throw new AppError('Uploaded file key is required', 400);
  }

  const visibility = getVisibilityFromKey(key);
  const localPath = getLocalUploadPath(key);

  if (!shouldDisableLocalFallback()) {
    try {
      const body = await fs.readFile(localPath);
      return {
        body,
        contentType: inferContentType(key),
        fileName: inferFileName(key),
        visibility,
      };
    } catch {
      // Fall through to remote fetch when local fallback does not exist.
    }
  }

  if (!isS3Configured()) {
    throw new AppError('Object storage is not configured', 500);
  }

  const response = await getS3Client().send(
    new GetObjectCommand({
      Bucket: getStorageBucket(),
      Key: key,
    })
  );

  return {
    body: await streamToBuffer(response.Body),
    contentType: response.ContentType || inferContentType(key),
    fileName: inferFileName(key),
    visibility,
  };
}

export function buildPrivateFileUrl(key: string) {
  return buildProtectedFileUrl(key);
}

export const uploadLimits = {
  memberPhoto: PHOTO_SIZE_LIMIT_BYTES,
  galleryAsset: GALLERY_SIZE_LIMIT_BYTES,
  donationProof: GALLERY_SIZE_LIMIT_BYTES,
  eventVideo: VIDEO_SIZE_LIMIT_BYTES,
};
