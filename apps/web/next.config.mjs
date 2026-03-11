const uploadBaseUrl = process.env.UPLOAD_PUBLIC_URL_BASE;
const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || uploadBaseUrl;
const remotePatterns = [];

if (mediaBaseUrl) {
  try {
    const parsed = new URL(mediaBaseUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || '',
      pathname: `${parsed.pathname.replace(/\/$/, '')}/**`,
    });
  } catch {
    // Ignore malformed external media base URLs.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hss/domain'],
  images: {
    unoptimized: true,
    remotePatterns,
  },
};

export default nextConfig;
