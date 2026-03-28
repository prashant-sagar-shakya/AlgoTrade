import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

// Log the URI (masked) so we can verify it's loaded correctly
const maskedUri = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log('🔗 MongoDB URI loaded:', maskedUri);

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('⏳ Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGO_URI!, {
      bufferCommands: false,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    }).then((mongoose) => {
      console.log('✅ MongoDB CONNECTED! Database:', mongoose.connection.db?.databaseName);
      return mongoose;
    }).catch((e) => {
      console.error('❌ MongoDB FAILED:', e.message);
      cached.promise = null;
      throw e;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

export default dbConnect;
