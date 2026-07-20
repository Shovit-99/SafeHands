import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Loader2,
  CheckCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { fetchChatHistory, buildChatId, fetchConversations } from '../api/chat';
import type { Message } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Conversation {
  peerId: string;
  peerName: string;
  chatId: string;
  lastMessage: Message;
  unreadCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (date: string): string => {
  const d = new Date(date);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatFull = (date: string): string =>
  new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

// ─── Initial Avatar ───────────────────────────────────────────────────────────
const PeerAvatar: React.FC<{ name: string; size?: number }> = ({ name, size = 48 }) => (
  <div
    style={{
      width: size, height: size,
      borderRadius: '1.25rem',
      background: 'var(--accent-gradient)',
      boxShadow: '0 8px 24px var(--accent-light)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#ffffff', fontWeight: 800,
      fontSize: size * 0.4,
      fontFamily: 'var(--font-family-display)',
      flexShrink: 0,
    }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-8">
    <div
      style={{
        width: 96, height: 96, borderRadius: '2rem',
        background: 'var(--accent-light)',
        border: '1px solid var(--accent-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <MessageCircle size={40} style={{ color: 'var(--accent-primary)' }} />
    </div>
    <div>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>
        No conversation selected
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
        Select a conversation from the sidebar or start one from an item page.
      </p>
    </div>
  </div>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: Message; isMine: boolean }> = ({ msg, isMine }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}
      style={{ animation: 'fadeIn 0.2s ease forwards' }}
    >
      <div
        style={{ maxWidth: '75%' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: isMine ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
            background: isMine ? 'var(--accent-gradient)' : 'var(--card-bg)',
            border: isMine ? 'none' : '1px solid var(--card-border)',
            boxShadow: isMine ? '0 4px 12px var(--accent-light)' : '0 2px 8px rgba(0,0,0,0.02)',
            color: isMine ? '#ffffff' : 'var(--text-primary)',
            fontSize: '1rem',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            fontWeight: isMine ? 500 : 400,
          }}
        >
          {msg.messageText}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMine ? 'flex-end' : 'flex-start',
            gap: 6,
            marginTop: 6,
            opacity: hovered ? 1 : 0.7,
            transition: 'opacity 0.2s ease',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {formatFull(msg.createdAt)}
          </span>
          {isMine && (
            msg.read
              ? <CheckCheck size={14} style={{ color: 'var(--accent-primary)' }} />
              : <Check size={14} style={{ color: 'var(--text-secondary)' }} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Conversation Row ─────────────────────────────────────────────────────────
const ConvRow: React.FC<{
  conv: Conversation; isActive: boolean; myId: string; onClick: () => void;
}> = ({ conv, isActive, myId, onClick }) => {
  const isMine = conv.lastMessage.senderId === myId;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-3xl transition-all flex items-center gap-4 mb-2 border ${isActive ? 'bg-[var(--accent-light)] border-[var(--accent-light)] shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
    >
      <PeerAvatar name={conv.peerName} size={48} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-base truncate" style={{ fontFamily: 'var(--font-family-display)', color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
            {conv.peerName}
          </span>
          <span className="text-xs font-semibold shrink-0" style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
            {formatTime(conv.lastMessage.createdAt)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm truncate opacity-80" style={{ color: 'var(--text-secondary)' }}>
            {isMine ? 'You: ' : ''}{conv.lastMessage.messageText}
          </span>
          {conv.unreadCount > 0 && (
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-black" style={{ background: 'var(--accent-gradient)', color: '#ffffff', minWidth: 22, textAlign: 'center' }}>
              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── Main ChatPage ────────────────────────────────────────────────────────────
const ChatPage: React.FC = () => {
  const { user, token } = useAuth();
  const socket = useSocket(token);
  const [searchParams] = useSearchParams();

  const withId = searchParams.get('with');
  const peerNameFromUrl = searchParams.get('peerName') || 'User';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [activePeerName, setActivePeerName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const openConversation = useCallback(
    async (peerId: string, peerName: string) => {
      if (!user) return;
      const chatId = buildChatId(user.id, peerId);
      setActivePeerId(peerId);
      setActivePeerName(peerName);
      setActiveChatId(chatId);
      setLoadingHistory(true);
      socket?.emit('join:chat', { receiverId: peerId });
      try {
        const history = await fetchChatHistory(chatId);
        setMessages(history);
      } catch { setMessages([]); }
      finally { setLoadingHistory(false); }
      socket?.emit('message:read', { chatId });
      setConversations((prev) => prev.map((c) => c.chatId === chatId ? { ...c, unreadCount: 0 } : c));
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [user, socket]
  );

  useEffect(() => {
    if (!user) return;
    fetchConversations().then((data) => {
      setConversations(data);
    }).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!withId || !user || !socket) return;
    openConversation(withId, peerNameFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withId, user?.id, socket]);

  useEffect(() => {
    if (!socket || !user) return;
    const onReceive = (msg: Message) => {
      const isForActiveChat = msg.chatId === activeChatId;
      if (isForActiveChat) {
        setMessages((prev) => prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]);
        socket.emit('message:read', { chatId: msg.chatId });
      }
      const peerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const peerName = msg.senderId === user.id ? activePeerName : peerNameFromUrl;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.chatId === msg.chatId);
        const updated: Conversation = {
          chatId: msg.chatId, peerId: peerId as string,
          peerName: peerName || 'User', lastMessage: msg,
          unreadCount: isForActiveChat ? 0 : (prev[idx]?.unreadCount ?? 0) + 1,
        };
        if (idx === -1) return [updated, ...prev];
        const next = [...prev]; next.splice(idx, 1);
        return [updated, ...next];
      });
    };
    socket.on('message:receive', onReceive);
    return () => { socket.off('message:receive', onReceive); };
  }, [socket, user, activeChatId, activePeerName, peerNameFromUrl]);

  useEffect(() => {
    if (!socket) return;
    const onRead = ({ chatId }: { chatId: string }) => {
      if (chatId === activeChatId) setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    };
    socket.on('message:read', onRead);
    return () => { socket.off('message:read', onRead); };
  }, [socket, activeChatId]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !socket || !activePeerId || sending) return;
    const payload = text.trim();
    setText('');
    setSending(true);
    socket.emit('message:send', { receiverId: activePeerId, messageText: payload });
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [text, socket, activePeerId, sending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  const groupedMessages = useMemo(() =>
    messages.map((msg, idx) => {
      if (idx === 0) return { msg, showSep: true };
      const gap = new Date(msg.createdAt).getTime() - new Date(messages[idx - 1].createdAt).getTime() > 5 * 60 * 1000;
      return { msg, showSep: gap };
    }),
  [messages]);

  return (
    <div className="flex-1 flex" style={{ height: 'calc(100vh - 80px)' }}>

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: sidebarOpen ? 340 : 0, minWidth: sidebarOpen ? 340 : 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden',
          borderRight: '1px solid var(--divider)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-color)',
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: '2rem 1.5rem 1rem', borderBottom: '1px solid var(--divider)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
            <h1 className="font-black text-2xl" style={{ fontFamily: 'var(--font-family-display)' }}>
              Messages
            </h1>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <MessageCircle size={32} style={{ opacity: 0.5 }} />
              </div>
              <p className="font-semibold mb-1 text-base">No conversations yet.</p>
              <p style={{ fontSize: '0.85rem' }}>Start one from an item page.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConvRow
                key={conv.chatId}
                conv={conv}
                isActive={conv.chatId === activeChatId}
                myId={user?.id ?? ''}
                onClick={() => openConversation(conv.peerId, conv.peerName)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Main Pane ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-color)' }}>
        {/* Chat Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1.25rem 2rem',
            borderBottom: '1px solid var(--divider)',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(16px)',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="p-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
            id="sidebar-toggle"
          >
            <ArrowLeft size={20} style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </button>

          {activePeerId ? (
            <>
              <PeerAvatar name={activePeerName} size={44} />
              <div className="flex flex-col">
                <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-family-display)' }}>
                  {activePeerName}
                </p>
                <div className="flex items-center gap-1.5" style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"></div> Online
                </div>
              </div>
            </>
          ) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>Select a conversation</span>
          )}
        </div>

        {/* Messages */}
        <div
          id="messages-container"
          style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column' }}
        >
          {!activePeerId ? (
            <EmptyState />
          ) : loadingHistory ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={32} style={{ color: 'var(--accent-primary)', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <PeerAvatar name={activePeerName} size={80} />
              <h3 className="font-bold text-2xl mt-6 mb-2" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--text-primary)' }}>
                Start a conversation
              </h3>
              <p style={{ fontSize: '1rem', maxWidth: 300 }}>
                Send the first message to <strong>{activePeerName}</strong> and get connected.
              </p>
            </div>
          ) : (
            <>
              {groupedMessages.map(({ msg, showSep }) => (
                <React.Fragment key={msg._id}>
                  {showSep && (
                    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                      <span className="font-semibold" style={{
                        fontSize: '0.75rem', color: 'var(--text-secondary)',
                        background: 'var(--accent-light)',
                        border: '1px solid var(--accent-light)',
                        borderRadius: 999, padding: '0.3rem 1rem',
                      }}>
                        {formatFull(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble msg={msg} isMine={msg.senderId === user?.id} />
                </React.Fragment>
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input bar */}
        {activePeerId && (
          <div
            style={{
              padding: '1.5rem 2rem',
              borderTop: '1px solid var(--divider)',
              background: 'var(--card-bg)',
              backdropFilter: 'blur(16px)',
              display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              id="chat-input"
              className="input-field"
              style={{ flex: 1, borderRadius: 999, padding: '1rem 1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
              placeholder={`Message ${activePeerName}…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={2000}
              autoComplete="off"
            />
            <button
              id="send-btn"
              className="btn-primary"
              style={{
                padding: '1rem', borderRadius: 999,
                flexShrink: 0, opacity: !text.trim() || sending ? 0.45 : 1,
                aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onClick={() => void handleSend()}
              disabled={!text.trim() || sending}
              aria-label="Send message"
            >
              {sending
                ? <Loader2 size={20} style={{ animation: 'spin 0.7s linear infinite' }} />
                : <Send size={20} style={{ transform: 'translateX(2px)' }} />
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
