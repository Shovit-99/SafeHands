import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types';

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messageText: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for Chat History Queries ──────────────────────────────────────────
MessageSchema.index({ chatId: 1, createdAt: 1 });

// Expose createdAt as timestamp for frontend convenience
MessageSchema.virtual('timestamp').get(function (this: { createdAt?: Date }) {
  return this.createdAt;
});

MessageSchema.set('toJSON', { virtuals: true });

const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
