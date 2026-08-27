import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAIResponse } from '../utils/aiEngine';

const QUICK_PROMPTS = [
  'Where should I go now?',
  'Which beach is less crowded?',
  'Find cheap local food',
  'I have ₹2,000. Plan my day.',
  'Where is the nearest hospital?',
  'Is ₹500 for auto fair for 10 km?',
];

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: `👋 **Namaste! I'm Tripzy AI.**\n\nI'm your intelligent travel companion. I can help you find less-crowded destinations, check fair prices, plan your budget, locate emergency services, and discover local experiences.\n\nWhat would you like to explore today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(text) {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response = getAIResponse(msg);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: response.text, type: response.type }]);
      setLoading(false);
    }, 800);
  }

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/#{1,3} (.+)/g, '<strong style="font-size:15px">$1</strong>');
  }

  return (
    <div className="page-full" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px 16px 12px', flexShrink: 0, zIndex: 10 }}>
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={() => navigate('/home')}>←</button>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: 18, fontWeight: 800 }}>🤖 Tripzy AI</h1>
              <div className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--accent)' }}>
                <div className="live-dot"></div>
                Online
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>AI-powered tourism assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, alignSelf: 'flex-end' }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%',
              padding: '12px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-glass)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: 14,
              lineHeight: 1.6,
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
            }}>
              {msg.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ padding: '12px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-dot 1.2s infinite' }}></div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-dot 1.2s 0.2s infinite' }}></div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-dot 1.2s 0.4s infinite' }}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0 }}>
        <div className="chip-row">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} className="chip" style={{ fontSize: 12 }} onClick={() => sendMessage(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', paddingBottom: 'calc(12px + var(--nav-height))', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          className="form-input"
          placeholder="Ask me anything about tourism..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{ padding: '0 16px', flexShrink: 0 }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
