import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { status: 'not_ready', service: 'hss-api', reason: 'MONGODB_URI is not configured' },
        { status: 503 }
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return NextResponse.json(
          { status: 'not_ready', service: 'hss-api', reason: 'Upstash Redis is not configured' },
          { status: 503 }
        );
      }

      if (!process.env.APP_ORIGIN) {
        return NextResponse.json(
          { status: 'not_ready', service: 'hss-api', reason: 'APP_ORIGIN is not configured' },
          { status: 503 }
        );
      }
    }

    const db = await getDb();
    await db.user.count();

    return NextResponse.json({ status: 'ready', service: 'hss-api' });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown readiness failure';
    return NextResponse.json({ status: 'not_ready', service: 'hss-api', reason }, { status: 503 });
  }
}
