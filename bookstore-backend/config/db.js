const mongoose = require('mongoose');

// Global cache survives Vercel warm starts within the same execution context
let cached = global._mongoConn || (global._mongoConn = { conn: null, promise: null });

const connectDB = async () => {
  // Already connected and healthy
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Reset if connection dropped
  if (mongoose.connection.readyState === 0 && cached.conn) {
    cached.conn    = null;
    cached.promise = null;
  }

  if (!process.env.MONGO_URI) {
    console.error('[DB] MONGO_URI not set');
    return null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
      connectTimeoutMS:         10000,
      maxPoolSize:              10,
      minPoolSize:              1,
      bufferCommands:           false,
    })
    .then((conn) => {
      console.log('[DB] Connected:', conn.connection.host);
      return conn;
    })
    .catch((err) => {
      cached.promise = null; // allow retry on next request
      console.error('[DB] Failed:', err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
