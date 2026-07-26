import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI environment variable is not defined.');
    return null;
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const dbName = process.env.MONGODB_DB || 'tripeloo_crm';
    cached!.promise = mongoose
      .connect(uri, {
        dbName,
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000
      })
      .then((m) => m);
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    console.error('❌ Error connecting to MongoDB:', e);
    return null;
  }

  return cached!.conn;
}
