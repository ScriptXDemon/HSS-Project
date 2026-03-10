# Hindu Suraksha Sangh Monorepo

This repository is split for deployment:

- `apps/web`: Next.js frontend for Netlify
- `apps/api`: Next.js API/Auth backend for Render
- `packages/domain`: shared DTOs, validators, and contracts

## Local development

1. Install dependencies from the repo root:

```bash
npm install
```

2. Copy env templates:

```bash
copy .env.example .env.local
copy apps\web\.env.example apps\web\.env.local
copy apps\api\.env.example apps\api\.env.local
```

3. Fill the required values:

- `apps/api/.env.local`
  - `MONGODB_URI`
  - `NEXTAUTH_SECRET`
  - `ENCRYPTION_KEY`
  - `ADMIN_BOOTSTRAP_TOKEN`
- `apps/web/.env.local`
  - `NEXT_PUBLIC_SITE_URL`
  - `BACKEND_INTERNAL_URL`

4. Run the backend:

```bash
npm run dev:api
```

5. Run the frontend in a second terminal:

```bash
npm run dev:web
```

6. Open:

- `http://localhost:3000`
- `http://localhost:3001/api/health/live`

## Bootstrap the first admin

The demo hardcoded admin has been removed. Create the first admin once with:

```http
POST /api/auth/bootstrap-admin
Content-Type: application/json

{
  "token": "<ADMIN_BOOTSTRAP_TOKEN>",
  "name": "Your Admin Name",
  "email": "admin@example.com",
  "phone": "9876543210",
  "password": "StrongPass@123"
}
```

The bootstrap route only works while no admin or super-admin exists.

## Production deployment

### Netlify

- deploy from the repo root
- build command: `npm run build:web`
- publish directory: `apps/web/.next`
- proxy `/api/*` to the Render backend using `netlify.toml`

### Render

- create a web service from the repo root
- use `render.yaml`
- set `NEXTAUTH_URL` to the Render API origin
- use MongoDB Atlas, not local MongoDB
- use Cloudflare R2 for uploads and set `DISABLE_LOCAL_UPLOAD_FALLBACK=true`

## Verification

```bash
npm run typecheck
npm run test
npm run build
```

See `REQUIREMENTS.md` for environment and deployment requirements.