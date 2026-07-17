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
import { fetchChatHistory, buildChatId } from '../api/chat';
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
const PeerAvatar: React.FC<{ name: string; size?: number }> = ({ name, size = 40 }) => (
  <div
    style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00bfa5 0%, #5ff0de 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#06080c', fontWeight: 700,
      fontSize: size * 0.38,
      fontFamily: 'Space Grotesk, sans-serif',
      flexShrink: 0,
    }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8">
    <div
      style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(0,212,184,0.08)',
        border: '1px solid rgba(0,212,184,0.14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <MessageCircle size={30} style={{ color: '#00d4b8' }} />
    </div>
    <div>
      <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        No conversation selected
      </h2>
      <p style={{ color: '#374151', fontSize: '0.875rem' }}>
        Select a conversation or start one from an item page.
      </p>
    </div>
  </div>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: Message; isMine: boolean }> = ({ msg, isMine }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1.5`}
      style={{ animation: 'fadeIn 0.2s ease forwards' }}
    >
      <div
        style={{ maxWidth: '70%' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          style={{
            padding: '0.6rem 1rem',
            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isMine
              ? 'linear-gradient(135deg, #00bfa5 0%, #5ff0de 100%)'
              : 'rgba(255,255,255,0.06)',
            border: isMine ? 'none' : '1px solid rgba(255,255,255,0.08)',
            color: isMine ? '#06080c' : '#e2e8f0',
            fontSize: '0.9rem',
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
            gap: 4,
            marginTop: 2,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          <span style={{ fontSize: '0.68rem', color: '#374151' }}>{formatFull(msg.createdAt)}</span>
          {isMine && (
            msg.read
              ? <CheckCheck size={11} style={{ color: '#00d4b8' }} />
              : <Check size={11} style={{ color: '#374151' }} />
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
      style={{
        width: '100%', textAlign: 'left',
        padding: '0.75rem 0.875rem',
        borderRadius: 14,
        background: isActive ? 'rgba(0,212,184,0.08)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(0,212,184,0.2)' : 'transparent'}`,
        cursor: 'pointer', transition: 'all 0.15s ease',
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        marginBottom: '2px',
      }}
      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      <PeerAvatar name={conv.peerName} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Space Grotesk, sans-serif' }}>
            {conv.peerName}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#374151', flexShrink: 0 }}>
            {formatTime(conv.lastMessage.createdAt)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
            {isMine ? 'You: ' : ''}{conv.lastMessage.messageText}
          </span>
          {conv.unreadCount > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #00bfa5, #5ff0de)',
              color: '#06080c', fontSize: '0.65rem', fontWeight: 700,
              borderRadius: 999, padding: '0.1rem 0.45rem', minWidth: 18, textAlign: 'center', flexShrink: 0,
            }}>
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
    <div className="flex-1" style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: sidebarOpen ? 280 : 0, minWidth: sidebarOpen ? 280 : 0,
          transition: 'all 0.25s ease', overflow: 'hidden',
          borderRight: '1px solid rgba(0,212,184,0.07)',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(6,8,12,0.6)',
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: '1.25rem 1rem 0.75rem', borderBottom: '1px solid rgba(0,212,184,0.07)' }}>
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={14} style={{ color: '#00d4b8' }} />
            <h1 className="gradient-text font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem' }}>
              Messages
            </h1>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#374151' }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.625rem' }}>
          {conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0.75rem', color: '#374151', fontSize: '0.8rem' }}>
              <MessageCircle size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <p>No conversations yet.</p>
              <p style={{ marginTop: 4, fontSize: '0.72rem' }}>Start one from an item page.</p>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.875rem 1.25rem',
            borderBottom: '1px solid rgba(0,212,184,0.07)',
            background: 'rgba(6,8,12,0.4)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            style={{
              background: 'none',
              border: '1px solid rgba(0,212,184,0.15)',
              borderRadius: 8, padding: '0.4rem',
              cursor: 'pointer', color: '#374151',
              display: 'flex', alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,184,0.4)'; (e.currentTarget as HTMLElement).style.color = '#00d4b8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,184,0.15)'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
            id="sidebar-toggle"
          >
            <ArrowLeft size={15} style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s ease' }} />
          </button>

          {activePeerId ? (
            <>
              <PeerAvatar name={activePeerName} size={36} />
              <div>
                <p className="font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.95rem' }}>
                  {activePeerName}
                </p>
                <p style={{ fontSize: '0.7rem', color: '#00d4b8' }}>● Connected</p>
              </div>
            </>
          ) : (
            <span style={{ color: '#374151', fontSize: '0.875rem' }}>Select a conversation</span>
          )}
        </div>

        {/* Messages */}
        <div
          id="messages-container"
          style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}
        >
          {!activePeerId ? (
            <EmptyState />
          ) : loadingHistory ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={24} style={{ color: '#00d4b8', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#374151', textAlign: 'center' }}>
              <PeerAvatar name={activePeerName} size={48} />
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                No messages yet with <strong style={{ color: '#94a3b8' }}>{activePeerName}</strong>.
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Send the first message!</p>
            </div>
          ) : (
            <>
              {groupedMessages.map(({ msg, showSep }) => (
                <React.Fragment key={msg._id}>
                  {showSep && (
                    <div style={{ textAlign: 'center', margin: '0.75rem 0 0.5rem' }}>
                      <span style={{
                        fontSize: '0.68rem', color: '#374151',
                        background: 'rgba(0,212,184,0.05)',
                        border: '1px solid rgba(0,212,184,0.08)',
                        borderRadius: 999, padding: '0.2rem 0.75rem',
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
              padding: '0.875rem 1.25rem',
              borderTop: '1px solid rgba(0,212,184,0.07)',
              background: 'rgba(6,8,12,0.4)',
              display: 'flex', gap: '0.625rem', alignItems: 'center', flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              id="chat-input"
              className="input-field"
              style={{ flex: 1, borderRadius: 999 }}
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
                padding: '0.65rem 1rem', borderRadius: 999,
                flexShrink: 0, opacity: !text.trim() || sending ? 0.45 : 1,
              }}
              onClick={() => void handleSend()}
              disabled={!text.trim() || sending}
              aria-label="Send message"
            >
              {sending
                ? <Loader2 size={17} style={{ animation: 'spin 0.7s linear infinite' }} />
                : <Send size={17} />
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
