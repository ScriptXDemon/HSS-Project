import mongoose from 'mongoose';
import { AppError } from '@/lib/errors';

interface MongoCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongo = globalThis as unknown as { __mongoose: MongoCache };

if (!globalForMongo.__mongoose) {
  globalForMongo.__mongoose = { conn: null, promise: null };
}

export async function connectMongo(): Promise<typeof mongoose> {
  const cached = globalForMongo.__mongoose;
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new AppError('MONGODB_URI is not configured', 503);
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
