import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ChatPage() {
  const { userId: otherId } = useParams();
  const navigate = useNavigate();
  const { user, accounts, loginAsAccount } = useAuth();
  const { users, messages, sendMessage } = useApp();

  const [text, setText] = useState('');
  const bottomRef = useRef();

  // Current authenticated user
  const currentUser = user || accounts?.[0] || { id: 'user-demo-01', name: 'Arjun Mehta', role: 'tourist' };
  const currentUserId = currentUser.id;

  // The recipient user object (or looked up from users/accounts or generated from ID)
  const allKnown = [...(accounts || []), ...(users || [])];
  const otherUser = allKnown.find(u => u.id === otherId) || {
    id: otherId,
    name: otherId?.startsWith('biz') ? `Business (${otherId})` : `User (${otherId})`,
    avatar: otherId ? otherId.slice(0, 2).toUpperCase() : '??',
    role: otherId?.startsWith('biz') ? 'business' : 'tourist',
    location: 'Tamil Nadu',
  };

  // Two-way conversation key strictly between currentUserId and otherId
  const convId = [currentUserId, otherId].sort().join('_');
  const convMessages = (messages[convId] || []).slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length]);

  function handleSend(e) {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    // Send from current account to recipient account
    sendMessage(currentUserId, otherId, trimmed);
    setText('');
  }

  // Switch active account (e.g. switch to otherId to test receiver side like WhatsApp on other phone)
  function handleSwitchToUser(targetAcc) {
    if (!targetAcc) return;
    loginAsAccount(targetAcc);
  }

  // Quick switch between the two chatting parties
  function handleQuickToggleParty() {
    const target = allKnown.find(a => a.id === otherId) || {
      id: otherId,
      name: otherUser.name,
      role: otherUser.role || 'tourist',
      avatar: otherUser.avatar,
      email: `${otherId}@smarttour.in`,
      location: otherUser.location || 'Tamil Nadu',
    };
    loginAsAccount(target);
  }

  // Group messages by date
  const groups = [];
  let lastDate = null;
  for (const msg of convMessages) {
    const d = formatDate(msg.timestamp);
    if (d !== lastDate) {
      groups.push({ type: 'date', label: d });
      lastDate = d;
    }
    groups.push({ type: 'msg', ...msg });
  }

  const QUICK_REPLIES = [
    'Hi! 👋 Is your booking available tomorrow?',
    'What is the ticket fee & visiting timing?',
    'Can you recommend a peaceful route nearby?',
    'Thanks a lot! See you soon 🙌',
    'Just sent you an opinion on the dashboard ⭐',
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0b141a', // WhatsApp Dark Background
      color: '#e9edef',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* WhatsApp Two-Way Identity Bar */}
      <div style={{
        background: '#182229',
        padding: '6px 14px',
        fontSize: 11,
        color: '#8696a0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Logged in as:</span>
          <span style={{ color: '#00a884', fontWeight: 700 }}>
            {currentUser.name}
          </span>
          <code style={{ background: 'rgba(0,0,0,0.5)', padding: '1px 5px', borderRadius: 4, color: '#25d366', fontSize: 10 }}>
            {currentUserId}
          </code>
        </div>

        {/* Instant Two-Way Switcher button */}
        <button
          onClick={handleQuickToggleParty}
          style={{
            background: 'rgba(0, 168, 132, 0.15)',
            border: '1px solid rgba(0, 168, 132, 0.4)',
            borderRadius: 99,
            padding: '3px 10px',
            color: '#00a884',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          title="Switch to recipient account to see incoming messages and reply back"
        >
          <span>🔄 Switch to {otherUser.name.split(' ')[0]}</span>
          <span style={{ fontSize: 9, opacity: 0.8 }}>({otherId})</span>
        </button>
      </div>

      {/* WhatsApp Header */}
      <div style={{
        background: '#202c33',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/search')}
            style={{
              background: 'none',
              border: 'none',
              color: '#aebac1',
              fontSize: 20,
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            ←
          </button>

          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00a884, #056162)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            flexShrink: 0,
          }}>
            {otherUser.avatar || otherUser.name.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e9edef', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{otherUser.name}</span>
            </div>
            <div style={{ fontSize: 11, color: '#8696a0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00a884', display: 'inline-block' }} />
              <span>online · ID: {otherId}</span>
            </div>
          </div>
        </div>

        {/* Top actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#aebac1' }}>
          <button
            onClick={() => navigate('/search')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 99,
              padding: '5px 12px',
              color: '#e9edef',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            All Chats
          </button>
        </div>
      </div>

      {/* Chat Messages Wallpaper Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        {/* End-to-End Encryption Notice */}
        <div style={{ textAlign: 'center', margin: '8px auto 14px', maxWidth: 360 }}>
          <span style={{
            fontSize: 11,
            color: '#ffd279',
            background: '#182229',
            padding: '6px 12px',
            borderRadius: 8,
            display: 'inline-block',
            lineHeight: 1.4,
            border: '1px solid rgba(255, 210, 121, 0.15)',
          }}>
            🔒 Messages between <strong>{currentUser.name}</strong> and <strong>{otherUser.name}</strong> are private to these two accounts.
          </span>
        </div>

        {groups.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8696a0', padding: '36px 16px' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e9edef', marginBottom: 4 }}>
              Two-Way Communication Started
            </div>
            <div style={{ fontSize: 12 }}>
              Send a message below. Messages sent will only be visible when viewing as <strong>{currentUser.name}</strong> or <strong>{otherUser.name}</strong>.
            </div>
          </div>
        )}

        {groups.map((item, i) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${i}`} style={{ textAlign: 'center', margin: '12px 0 6px' }}>
                <span style={{
                  fontSize: 11,
                  color: '#8696a0',
                  background: '#182229',
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontWeight: 600,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}>
                  {item.label}
                </span>
              </div>
            );
          }

          // In this two-way communication:
          // isMe: True if the message was sent by the current active logged-in user
          const isMe = item.senderId === currentUserId;

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                marginBottom: 2,
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  minWidth: 100,
                  padding: '7px 10px 6px 12px',
                  borderRadius: isMe ? '8px 0px 8px 8px' : '0px 8px 8px 8px',
                  background: isMe ? '#005c4b' : '#202c33', // WhatsApp Green (sent) vs WhatsApp Dark Grey (received)
                  color: '#e9edef',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  position: 'relative',
                  wordBreak: 'break-word',
                }}
              >
                {!isMe && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#53bdeb', marginBottom: 2 }}>
                    {otherUser.name}
                  </div>
                )}

                <div style={{ fontSize: 13.5, lineHeight: 1.45, paddingRight: isMe ? 42 : 36 }}>
                  {item.content}
                </div>

                <div style={{
                  float: 'right',
                  fontSize: 10,
                  color: isMe ? '#8696a0' : '#8696a0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  marginTop: -6,
                  marginLeft: 10,
                }}>
                  <span>{formatTime(item.timestamp)}</span>
                  {isMe && (
                    <span style={{ color: '#53bdeb', fontSize: 12, fontWeight: 700 }} title="Delivered & Read">
                      ✓✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies Bar */}
      <div style={{
        padding: '6px 12px',
        background: '#111b21',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {QUICK_REPLIES.map(q => (
          <button
            key={q}
            onClick={() => setText(q)}
            style={{
              padding: '5px 10px',
              borderRadius: 99,
              whiteSpace: 'nowrap',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#202c33',
              color: '#d1d7db',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* WhatsApp Message Input Toolbar */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '10px 14px',
          background: '#202c33',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{
          flex: 1,
          background: '#2a3942',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
        }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Message ${otherUser.name.split(' ')[0]}…`}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '11px 0',
              color: '#e9edef',
              fontSize: 14,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: text.trim() ? '#00a884' : '#2a3942',
            border: 'none',
            color: '#fff',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: text.trim() ? 'pointer' : 'default',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
