import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

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

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
