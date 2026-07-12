import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import Message from '../models/Message';
import { buildChatId } from '../utils/jwt';

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // ─── Auth Handshake ─────────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const user = verifyToken(token);
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`🔌 Socket connected: ${user.email} (${socket.id})`);

    // ─── Join Item Room (for match alerts) ──────────────────────────────────
    socket.on('join:item', (itemId: string) => {
      socket.join(`item:${itemId}`);
    });

    // ─── Join Chat Room ──────────────────────────────────────────────────────
    socket.on('join:chat', ({ receiverId }: { receiverId: string }) => {
      const chatId = buildChatId(user.id, receiverId);
      socket.join(`chat:${chatId}`);
      socket.emit('chat:joined', { chatId });
    });

    // ─── Send Message ────────────────────────────────────────────────────────
    socket.on(
      'message:send',
      async ({
        receiverId,
        messageText,
      }: {
        receiverId: string;
        messageText: string;
      }) => {
        const chatId = buildChatId(user.id, receiverId);

        const saved = await Message.create({
          chatId,
          senderId: user.id,
          receiverId,
          messageText,
        });

        io.to(`chat:${chatId}`).emit('message:receive', saved);
      }
    );

    // ─── Mark Messages Read ──────────────────────────────────────────────────
    socket.on('message:read', async ({ chatId }: { chatId: string }) => {
      await Message.updateMany(
        { chatId, receiverId: user.id, read: false },
        { read: true }
      );
      io.to(`chat:${chatId}`).emit('message:read', { chatId });
    });

    // ─── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.email}`);
    });
  });

  return io;
};

export default initializeSocket;
