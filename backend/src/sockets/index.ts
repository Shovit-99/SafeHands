import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import Message from '../models/Message';
import Notification from '../models/Notification';
import { buildChatId } from '../utils/jwt';

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin.includes('localhost') ||
          origin.includes('vercel.app') ||
          origin === process.env.CLIENT_URL?.trim()
        ) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
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

    // ─── Join Personal Room ──────────────────────────────────────────────────
    socket.join(`user:${user.id}`);

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

        // Create a notification for the receiver
        const notification = await Notification.create({
          recipientId: receiverId,
          senderId: user.id,
          type: 'message',
          title: 'New Message',
          message: `You have a new message from ${user.email}`, // We don't have user.name in socket data, but email is fine
          link: `/chat/${chatId}`,
        });
        
        await notification.populate('senderId', 'name');

        // Emit to both sender and receiver's personal rooms so they get it anywhere in the app
        io.to(`user:${user.id}`).to(`user:${receiverId}`).emit('message:receive', saved);
        
        // Emit the notification badge update
        io.to(`user:${receiverId}`).emit('notification:new', notification);
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
