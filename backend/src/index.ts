import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import connectDB from './config/db';
import { errorHandler } from './middleware/validators';
import authRoutes from './routes/auth';
import itemRoutes from './routes/items';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import { initializeSocket } from './sockets';

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL?.trim() || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'SafeHands API' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Initialize Socket.IO ─────────────────────────────────────────────────────
initializeSocket(httpServer);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 SafeHands API running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('❌ Server startup failed:', err);
  process.exit(1);
});

export default app;
