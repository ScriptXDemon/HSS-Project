import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI && process.env.DEFAULT_DB_ENGINE !== 'postgres') {
      return NextResponse.json(
        { status: 'not_ready', service: 'hss-api', reason: 'MONGODB_URI is not configured' },
        { status: 503 }
      );
    }

    const db = await getDb();
    await db.user.count();

    return NextResponse.json({ status: 'ready', service: 'hss-api' });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown readiness failure';
    return NextResponse.json({ status: 'not_ready', service: 'hss-api', reason }, { status: 503 });
  }
}