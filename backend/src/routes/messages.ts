import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import Message from '../models/Message';
import User from '../models/User';

const router = Router();

// ─── GET /api/messages/conversations ──────────────────────────────────────────
// Fetch all conversations for the current user.
router.get(
  '/conversations',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      
      const messages = await Message.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      })
        .sort({ createdAt: -1 })
        .lean();

      const map = new Map<string, any>();
      messages.forEach((msg) => {
        if (!map.has(msg.chatId)) {
          map.set(msg.chatId, { lastMessage: msg, unreadCount: 0 });
        }
        if (!msg.read && msg.receiverId.toString() === userId.toString()) {
          map.get(msg.chatId).unreadCount += 1;
        }
      });

      const conversations = [];
      for (const [chatId, data] of map.entries()) {
        const parts = chatId.split('_');
        const peerId = parts[0] === userId.toString() ? parts[1] : parts[0];
        const peerUser = await User.findById(peerId).select('name').lean();
        if (peerUser) {
          conversations.push({
            chatId,
            peerId,
            peerName: peerUser.name,
            lastMessage: data.lastMessage,
            unreadCount: data.unreadCount,
          });
        }
      }

      res.json({ success: true, data: conversations });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ─── GET /api/messages/:chatId ────────────────────────────────────────────────
// Fetch paginated chat history for a given chatId.
// Security: user must be one of the two participants encoded in the chatId.
router.get(
  '/:chatId',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const chatId = req.params.chatId as string;
    const userId = req.user!.id;

    // chatId is built as [userAId, userBId].sort().join('_')
    // so the current user's ID must appear as a segment
    const participants = chatId.split('_');
    if (!participants.includes(userId)) {
      res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation.',
      });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ chatId }),
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  }
);

export default router;
