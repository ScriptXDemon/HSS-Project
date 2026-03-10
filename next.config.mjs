const uploadBaseUrl = process.env.UPLOAD_PUBLIC_URL_BASE;
const minioProtocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost';
const minioPort = process.env.MINIO_PORT || '9000';
const minioBucket = process.env.MINIO_BUCKET || 'hss-uploads';

const remotePatterns = [];

if (uploadBaseUrl) {
  try {
    const parsed = new URL(uploadBaseUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || '',
      pathname: `${parsed.pathname.replace(/\/$/, '')}/**`,
    });
  } catch {
    // Ignore malformed custom upload base URLs so local defaults still work.
  }
}

remotePatterns.push({
  protocol: minioProtocol,
  hostname: minioEndpoint,
  port: minioPort,
  pathname: `/${minioBucket}/**`,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
