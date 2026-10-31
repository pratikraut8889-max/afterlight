import mongoose from 'mongoose';

let connectionPromise: Promise<typeof mongoose> | undefined;

export function connectDatabase(): Promise<typeof mongoose> {
  const uri = process.env['MONGODB_URI'];
  console.log('Connecting to MongoDB with URI:', uri);

  if (!uri) {
    return Promise.reject(
      new Error('MONGODB_URI is not configured.'),
    );
  }

  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10_000,
      })
      .catch((error: unknown) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}