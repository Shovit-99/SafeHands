import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import Message from '../models/Message';

const router = Router();

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
