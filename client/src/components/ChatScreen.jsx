import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import MessageBubble from './MessageBubble';
import OnlinePanel from './OnlinePanel';
import TypingIndicator from './TypingIndicator';

const TYPING_TIMEOUT = 2000; // ms of silence before stop-typing fires

export default function ChatScreen({ session }) {
  const { username, roomnumber, avatarSeed } = session;

  const [messages,    setMessages]    = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userCount,   setUserCount]   = useState(0);
  const [typers,      setTypers]      = useState([]);
  const [inputVal,    setInputVal]    = useState('');
  const [panelOpen,   setPanelOpen]   = useState(false);

  const socketRef      = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer    = useRef(null);
  const isTyping       = useRef(false);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(scrollToBottom, [messages, typers]);

  // ── Socket setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io({ transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { username, roomnumber, avatarSeed });
    });

    // Chat history from DB
    socket.on('chat-history', (history) => {
      setMessages(history.map(m => ({
        user:      m.username,
        text:      m.text,
        avatarSeed: m.avatarSeed,
        timestamp: m.timestamp,
        isSystem:  false
      })));
    });

    // Incoming message
    socket.on('message', ({ user, text, avatarSeed: seed, timestamp }) => {
      setMessages(prev => [...prev, {
        user, text, avatarSeed: seed, timestamp: timestamp ?? new Date(), isSystem: false
      }]);
    });

    // System notifications (join/leave)
    socket.on('user-joined', (msg) => {
      setMessages(prev => [...prev, { isSystem: true, text: msg, timestamp: new Date() }]);
    });

    // Online users list
    socket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    // User count
    socket.on('user-count', (count) => {
      setUserCount(count);
    });

    // Typing events
    socket.on('typing', ({ username: typer }) => {
      setTypers(prev => prev.includes(typer) ? prev : [...prev, typer]);
    });

    socket.on('stop-typing', ({ username: typer }) => {
      setTypers(prev => prev.filter(t => t !== typer));
    });

    return () => {
      socket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const socket = socketRef.current;
    const text = inputVal.trim();
    if (!text || !socket) return;

    socket.emit('newMessage', text);
    setInputVal('');

    // Stop typing
    if (isTyping.current) {
      socket.emit('stop-typing');
      isTyping.current = false;
    }
    clearTimeout(typingTimer.current);
  }, [inputVal]);

  // ── Typing logic ──────────────────────────────────────────────────────────
  function handleInputChange(e) {
    setInputVal(e.target.value);
    const socket = socketRef.current;
    if (!socket) return;

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit('typing');
    }

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (isTyping.current) {
        isTyping.current = false;
        socket.emit('stop-typing');
      }
    }, TYPING_TIMEOUT);
  }

  function handleInputBlur() {
    const socket = socketRef.current;
    if (socket && isTyping.current) {
      isTyping.current = false;
      socket.emit('stop-typing');
      clearTimeout(typingTimer.current);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="chat-root">
      {/* Header */}
      <header className="chat-header" id="chat-header">
        <div className="header-room-icon">💬</div>
        <div className="header-info">
          <div className="header-room" id="header-room-name">#{roomnumber}</div>
          <div className="header-sub" id="header-user-info">
            Welcome, <strong>{username}</strong>!
          </div>
        </div>
        <div className="header-right">
          <div className="user-count-badge" id="user-count-badge">
            <span className="dot" />
            <span id="user-count-text">{userCount} online</span>
          </div>
          {/* Mobile: toggle panel */}
          <button
            className="panel-toggle-btn"
            onClick={() => setPanelOpen(o => !o)}
            aria-label="Toggle online users panel"
          >
            👥
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="chat-body">
        {/* Messages */}
        <div className="messages-area">
          <div className="messages-list" id="message-display">
            <div className="date-divider">Today</div>

            {messages.map((msg, i) =>
              msg.isSystem
                ? (
                  <div className="sys-msg" key={i}>
                    <span>🔔 {msg.text}</span>
                  </div>
                )
                : (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    currentUser={username}
                  />
                )
            )}

            {/* Typing indicator inside list */}
            {typers.length > 0 && (
              <div className="msg-row recv" style={{ marginTop: 4 }}>
                <div className="avatar" style={{ background: 'var(--surface3)', color: 'var(--muted)', fontSize: 16 }}>💬</div>
                <TypingIndicator typers={typers} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Typing bar (desktop — below messages, above input) */}
          <div className="typing-bar" id="typing-bar">
            {typers.length > 0 && <TypingIndicator typers={typers} />}
          </div>

          {/* Input */}
          <div className="input-bar" id="input-bar">
            <form onSubmit={handleSubmit} style={{ display: 'contents' }} id="message-form">
              <input
                id="message-input"
                className="msg-input"
                type="text"
                placeholder="Type a message…"
                autoComplete="off"
                value={inputVal}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
              />
              <button
                id="send-btn"
                className="send-btn"
                type="submit"
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Online panel */}
        <OnlinePanel
          users={onlineUsers}
          currentUser={username}
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
        />
      </div>
    </div>
  );
}
