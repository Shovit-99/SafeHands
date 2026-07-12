import React from 'react';
import { MessageCircle } from 'lucide-react';

const ChatPage: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
    <MessageCircle size={48} className="text-violet-400 mb-4" />
    <h1 className="text-3xl font-bold text-white mb-2">Secure Chat</h1>
    <p className="text-slate-400 text-lg">
      Coming in Day 8 — real-time Socket.IO messaging.
    </p>
  </div>
);

export default ChatPage;
