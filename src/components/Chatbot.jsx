import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaPaperPlane,
  FaUser,
  FaTimes
} from 'react-icons/fa';
import PolyhedraButton from './PolyhedraButton';
import { useAuth } from '../context/AuthContext';
import { BinderCooClient } from '../api/binderCooClient';
import './Chatbot.css';

// COO gateway config — read from Vite env at build time. Frontend-direct mode:
// the authToken is bundled, fine for staging. For production swap back to the
// /api/auth/me/coo-chat-config/ endpoint and feed those values in here instead.
const COO_GATEWAY_URL = import.meta.env.VITE_COO_GATEWAY_URL || '';
const COO_AUTH_TOKEN = import.meta.env.VITE_COO_AUTH_TOKEN || '';
const COO_DEFAULT_USER_ID = import.meta.env.VITE_COO_DEFAULT_USER_ID || '';

const STORAGE_KEY_USER_ID = 'binder_coo_user_id';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_SUBTITLES = {
  idle:           'Awaiting user ID',
  connecting:     'Connecting…',
  authenticating: 'Authenticating…',
  ready:          'Always here to help',
  retrying:       'Reconnecting…',
  disconnected:   'Reconnecting…',
  'auth-failed':  'Chat unavailable',
};

const INITIAL_GREETING = {
  id: 1,
  text: "Hello! I'm here to help you with any questions about our software. How can I assist you today?",
  isBot: true,
  timestamp: new Date(),
};

const Chatbot = () => {
  const { user, isAuthenticated } = useAuth();

  const [chatMessages, setChatMessages] = useState([INITIAL_GREETING]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connState, setConnState] = useState('idle');
  const [identityHandle, setIdentityHandle] = useState(null);

  // The COO user UUID the gateway will authenticate as. Persisted in
  // localStorage so a single browser keeps the same conversation across reloads.
  // Auth context user.id is offered as the default but the user can paste any
  // UUID (e.g. the PDF's staging example) to test without provisioning.
  const [cooUserId, setCooUserId] = useState(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEY_USER_ID) ||
        COO_DEFAULT_USER_ID ||
        ''
      );
    } catch {
      return COO_DEFAULT_USER_ID || '';
    }
  });
  const [uuidDraft, setUuidDraft] = useState('');
  const [uuidError, setUuidError] = useState(null);

  const chatMessagesRef = useRef(null);
  const clientRef = useRef(null);
  const streamingBubbleIdRef = useRef(null);

  // Auto-scroll on new messages / typing
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Squeeze main app content when the panel is open
  useEffect(() => {
    if (isChatOpen) {
      document.body.classList.add('ai-panel-open');
    } else {
      document.body.classList.remove('ai-panel-open');
    }
    return () => document.body.classList.remove('ai-panel-open');
  }, [isChatOpen]);

  const upsertStreamingBubble = useCallback((text) => {
    setChatMessages((prev) => {
      const id = streamingBubbleIdRef.current;
      if (id == null) {
        const newId = Date.now() + 1;
        streamingBubbleIdRef.current = newId;
        return [
          ...prev,
          { id: newId, text, isBot: true, timestamp: new Date() },
        ];
      }
      return prev.map((m) => (m.id === id ? { ...m, text } : m));
    });
  }, []);

  const finaliseStreamingBubble = useCallback((text) => {
    setChatMessages((prev) => {
      const id = streamingBubbleIdRef.current;
      if (id == null) {
        return [
          ...prev,
          { id: Date.now() + 1, text, isBot: true, timestamp: new Date() },
        ];
      }
      return prev.map((m) => (m.id === id ? { ...m, text } : m));
    });
    streamingBubbleIdRef.current = null;
    setIsTyping(false);
  }, []);

  const pushSystemBubble = useCallback((text) => {
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text, isBot: true, timestamp: new Date() },
    ]);
    streamingBubbleIdRef.current = null;
    setIsTyping(false);
  }, []);

  // Open the WebSocket whenever we have a UUID + the user is logged into Binder.
  // Tearing down on logout / UUID change keeps the auth context and the COO
  // session in sync.
  useEffect(() => {
    if (!isAuthenticated || !cooUserId) {
      clientRef.current?.close();
      clientRef.current = null;
      setConnState('idle');
      setIdentityHandle(null);
      return undefined;
    }
    if (!COO_GATEWAY_URL || !COO_AUTH_TOKEN) {
      setConnState('auth-failed');
      pushSystemBubble(
        'Chat is not configured. Ask an admin to set VITE_COO_GATEWAY_URL and VITE_COO_AUTH_TOKEN.'
      );
      return undefined;
    }

    let cancelled = false;

    const client = new BinderCooClient({
      gatewayUrl: COO_GATEWAY_URL,
      authToken: COO_AUTH_TOKEN,
      userId: cooUserId,
    });

    client.on('state', (s) => {
      if (cancelled) return;
      setConnState(s);
    });
    client.on('identity', (id) => {
      if (cancelled) return;
      setIdentityHandle(id?.handle || null);
    });
    client.on('delta', (text) => {
      if (cancelled || !text) return;
      upsertStreamingBubble(text);
    });
    client.on('final', (text) => {
      if (cancelled) return;
      finaliseStreamingBubble(text || '');
    });
    client.on('error', (err) => {
      if (cancelled) return;
      console.warn('[Chatbot] COO error:', err);
      if (streamingBubbleIdRef.current != null) {
        finaliseStreamingBubble('Sorry, I lost the connection mid-reply. Please try again.');
      }
      if (err?.code === 'unknown-user') {
        pushSystemBubble(
          'That user UUID is not provisioned on the COO side. Click "change" below and paste a UUID that exists in agent_user_mapping.'
        );
      } else if (err?.code === 'unauthorized') {
        pushSystemBubble('Auth token rejected by the COO gateway. Check VITE_COO_AUTH_TOKEN.');
      }
    });

    clientRef.current = client;
    client.connect();

    return () => {
      cancelled = true;
      client.close();
      clientRef.current = null;
    };
  }, [
    isAuthenticated,
    cooUserId,
    upsertStreamingBubble,
    finaliseStreamingBubble,
    pushSystemBubble,
  ]);

  const saveCooUserId = (raw) => {
    const candidate = (raw || '').trim();
    if (!UUID_RE.test(candidate)) {
      setUuidError('Enter a valid UUID, e.g. 69ab5277-cd49-4677-a7e6-9c5687f60417');
      return;
    }
    setUuidError(null);
    try {
      localStorage.setItem(STORAGE_KEY_USER_ID, candidate);
    } catch { /* ignore quota / private mode */ }
    streamingBubbleIdRef.current = null;
    setIdentityHandle(null);
    setCooUserId(candidate);
    setUuidDraft('');
  };

  const clearCooUserId = () => {
    try { localStorage.removeItem(STORAGE_KEY_USER_ID); } catch { /* ignore */ }
    setUuidDraft(cooUserId);
    setCooUserId('');
    setIdentityHandle(null);
  };

  // Convert markdown-style **bold** into <strong>…</strong>
  const formatMessageText = (text) => {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const sendMessage = async () => {
    const trimmed = currentMessage.trim();
    if (!trimmed) return;

    const client = clientRef.current;
    if (!client || connState !== 'ready') {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now(), text: trimmed, isBot: false, timestamp: new Date() },
        {
          id: Date.now() + 1,
          text: !cooUserId
            ? 'Connect first — paste your Binder COO user UUID below.'
            : connState === 'auth-failed'
              ? 'Chat is unavailable. Check the UUID or contact the admin.'
              : 'Still connecting — please try again in a second.',
          isBot: true,
          timestamp: new Date(),
        },
      ]);
      setCurrentMessage('');
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, isBot: false, timestamp: new Date() },
    ]);
    setCurrentMessage('');
    setIsTyping(true);
    streamingBubbleIdRef.current = null;

    try {
      client.send(trimmed);
    } catch (err) {
      console.error('[Chatbot] send failed:', err);
      pushSystemBubble('Could not send that message — please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleUuidKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveCooUserId(uuidDraft);
    }
  };

  const subtitle = identityHandle
    ? `Connected as ${identityHandle}`
    : (STATUS_SUBTITLES[connState] || 'Always here to help');

  const inputDisabled = isTyping || connState !== 'ready';
  const inputPlaceholder = connState === 'ready'
    ? 'Ask me anything about Binder...'
    : !cooUserId
      ? 'Enter your COO user UUID below to start'
      : 'Connecting to assistant…';

  // Pre-fill the UUID draft with auth user.id (sensible default) once.
  useEffect(() => {
    if (!cooUserId && !uuidDraft && user?.id) {
      setUuidDraft(user.id);
    }
  }, [user?.id, cooUserId, uuidDraft]);

  return (
    <>
      {/* Floating Polyhedra Chat Button */}
      <PolyhedraButton
        size={64}
        isOpen={isChatOpen}
        onClick={() => setIsChatOpen(!isChatOpen)}
      />

      {/* AI Assistant Side Panel */}
      <aside
        className={`ai-side-panel${isChatOpen ? ' open' : ''}`}
        role="dialog"
        aria-label="Binder AI Assistant"
        aria-hidden={!isChatOpen}
      >
        <div className="ai-side-panel-header">
          <div className="ai-side-panel-header-left">
            <span className="ai-side-panel-avatar">
              <img src="/android-chrome-192x192.png" alt="" className="bot-logo-img" />
            </span>
            <div className="ai-side-panel-titles">
              <span className="ai-side-panel-title">Binder AI Assistant</span>
              <span className="ai-side-panel-subtitle">{subtitle}</span>
            </div>
          </div>
          <button
            className="ai-side-panel-close"
            onClick={() => setIsChatOpen(false)}
            aria-label="Close AI Assistant"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {/* COO connect strip — sits between header and messages */}
        <div className="coo-connect-strip">
          {!cooUserId ? (
            <>
              <label className="coo-connect-label">Connect as (UUID):</label>
              <div className="coo-connect-row">
                <input
                  type="text"
                  className="coo-connect-input"
                  placeholder="69ab5277-cd49-4677-a7e6-9c5687f60417"
                  value={uuidDraft}
                  onChange={(e) => setUuidDraft(e.target.value)}
                  onKeyPress={handleUuidKeyPress}
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="coo-connect-btn"
                  onClick={() => saveCooUserId(uuidDraft)}
                  disabled={!uuidDraft.trim()}
                >
                  Connect
                </button>
              </div>
              {uuidError && <div className="coo-connect-error">{uuidError}</div>}
            </>
          ) : (
            <div className="coo-connect-status">
              <span className="coo-connect-uuid">
                <span
                  className={`coo-state-dot coo-state-${connState}`}
                  aria-hidden="true"
                />
                {cooUserId.slice(0, 8)}…{cooUserId.slice(-4)}
              </span>
              <button
                type="button"
                className="coo-connect-change"
                onClick={clearCooUserId}
              >
                change
              </button>
            </div>
          )}
        </div>

        <div className="chat-messages" ref={chatMessagesRef}>
          {chatMessages.map(message => (
            <div key={message.id} className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}>
              <div className="message-avatar">
                {message.isBot
                  ? <img src="/android-chrome-192x192.png" alt="" className="bot-logo-img" />
                  : <FaUser />}
              </div>
              <div className="message-content">
                <div
                  className="message-text"
                  dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                />
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && streamingBubbleIdRef.current == null && (
            <div className="message bot-message">
              <div className="message-avatar">
                <img src="/android-chrome-192x192.png" alt="" className="bot-logo-img" />
              </div>
              <div className="message-content">
                <div className="message-text typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder={inputPlaceholder}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="message-input"
            disabled={inputDisabled}
          />
          <button
            onClick={sendMessage}
            className="send-button"
            disabled={inputDisabled || !currentMessage.trim()}
            aria-label="Send message"
          >
            <FaPaperPlane />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Chatbot;
