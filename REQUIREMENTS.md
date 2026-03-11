# Requirements

## Runtime stack

- Node.js 20+
- npm 10+
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- NextAuth v5
- MongoDB Atlas for staging/production
- Cloudflare R2 for media storage
- Upstash Redis for shared rate limiting and account lockout

## Monorepo layout

- `apps/web`: frontend for Netlify
- `apps/api`: backend for Render
- `packages/domain`: shared contracts

## Production environment requirements

### Frontend (`apps/web`)

- `NEXT_PUBLIC_API_BASE=/api`
- `NEXT_PUBLIC_SITE_URL`
- `BACKEND_INTERNAL_URL` optional; in Netlify production prefer empty so SSR uses the same `/api` proxy origin
- `NEXT_PUBLIC_MEDIA_BASE_URL` when media is served from a separate public base

### Backend (`apps/api`)

- `MONGODB_URI` pointing to MongoDB Atlas
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` set to the public frontend origin when auth is proxied through Netlify
- `AUTH_TRUST_HOST=true`
- `ENCRYPTION_KEY`
- `ADMIN_BOOTSTRAP_TOKEN`
- `APP_ORIGIN`
- `ALLOWED_APP_ORIGINS`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CLOUDFLARE_R2_ENDPOINT`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_PUBLIC_BASE_URL`
- `UPLOAD_PUBLIC_URL_BASE`
- `DISABLE_LOCAL_UPLOAD_FALLBACK=true`

## Security posture implemented in code

- hardcoded demo admin removed
- first-admin bootstrap route gated by `ADMIN_BOOTSTRAP_TOKEN`
- Redis-backed rate limiting on auth, contact, member apply, donation submission, and admin mutation routes
- Redis-backed login lockout after repeated failures
- origin enforcement on authenticated and sensitive write routes
- stronger security headers in backend middleware
- production uploads require object storage and do not silently fall back to local files
- member photos and donation proofs are stored as private uploads, not public media
- admin user removal is now account deactivation plus session invalidation

## Local development notes

- local MongoDB is fine for development only
- Redis may fall back to in-memory storage only in development/test
- local upload fallback remains available in development when object storage is not configured
- for production use Atlas + R2 + Upstash Redis

## Verification commands

```bash
npm run typecheck
npm run test
npm run build
```
