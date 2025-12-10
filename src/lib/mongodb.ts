import mongoose, { Mongoose } from 'mongoose';

interface CachedConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable');
}

export async function connectDB(): Promise<Mongoose> {
  // Return existing connection if ready
  if (cached.conn?.connection.readyState === 1) {
    return cached.conn;
  }

  // Wait for pending connection
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // Create new connection with serverless-optimized settings
  // MONGODB_URI is guaranteed to be string here due to the check above
  cached.promise = mongoose.connect(MONGODB_URI!, {
    bufferCommands: false,
    maxPoolSize: 1, // Serverless: minimize connections
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
    maxIdleTimeMS: 10000,
    waitQueueTimeoutMS: 5000,
  });

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected');
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Default export for backwards compatibility
export default connectDB;