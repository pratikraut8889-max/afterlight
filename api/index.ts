import 'dotenv/config';
import express from 'express';
import { connectDatabase } from './config/database';
const api = express();
import memoriesRouter from './routes/memories.routes';

// Keep your existing health endpoints above this.

// Register before the API's catch-all 404 handler.
api.use('/memories', memoriesRouter);
api.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'afterlight-api',
    message: 'Afterlight API is running',
    timestamp: new Date().toISOString(),
  });
});
api.get('/health/database', async (_req, res) => {
  try {
    await connectDatabase();

    res.status(200).json({
      success: true,
      service: 'mongodb',
      status: 'connected',
    });
  } catch (error) {
    console.error(
      'MongoDB connection failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    res.status(503).json({
      success: false,
      service: 'mongodb',
      status: 'disconnected',
      message:
        'Database unavailable. Check the connection configuration.',
    });
  }
});
// Unmatched API routes should never fall through to Angular SSR.
api.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

export default api;
