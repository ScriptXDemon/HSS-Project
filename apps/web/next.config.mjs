const uploadBaseUrl = process.env.UPLOAD_PUBLIC_URL_BASE;
const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || uploadBaseUrl;
const localApiBaseUrl = 'http://localhost:3001/api';
const remotePatterns = [];

function getAbsoluteUrl(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

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

const apiProxyTarget =
  getAbsoluteUrl(process.env.BACKEND_INTERNAL_URL) ||
  getAbsoluteUrl(process.env.NEXT_PUBLIC_API_BASE) ||
  (process.env.NODE_ENV === 'development' ? localApiBaseUrl : null);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hss/domain'],
  images: {
    unoptimized: true,
    remotePatterns,
  },
  async rewrites() {
    if (!apiProxyTarget) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
