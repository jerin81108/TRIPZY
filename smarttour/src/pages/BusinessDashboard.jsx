import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { DEMO_BUSINESS } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const weeklyRevenue = [
  { day: 'Mon', revenue: 12400, bookings: 4 },
  { day: 'Tue', revenue: 9600, bookings: 3 },
  { day: 'Wed', revenue: 14200, bookings: 5 },
  { day: 'Thu', revenue: 18800, bookings: 6 },
  { day: 'Fri', revenue: 22400, bookings: 8 },
  { day: 'Sat', revenue: 31600, bookings: 11 },
  { day: 'Sun', revenue: 28000, bookings: 10 },
];

const statusColor = { confirmed: '#10b981', pending: '#eab308', cancelled: '#ef4444' };
const ratingColor = { 5: '#22c55e', 4: '#10b981', 3: '#eab308', 2: '#f97316', 1: '#ef4444' };

const REACTION_EMOJIS = ['👍', '❤️', '💡', '🔥', '🙏'];

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: s <= value ? '#fbbf24' : 'var(--border)' }}
        >★</button>
      ))}
    </div>
  );
}

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { opinions, addOpinion, reactToOpinion, respondToOpinion, posts, issueBusinessReward, verifyRewardCode } = useApp();
  const biz = DEMO_BUSINESS;

  // Active business ID (supports demo or logged-in business)
  const currentBizId = user?.id || 'biz-demo-01';

  // Opinion form state (for tourist submitting opinion to this business)
  const [showOpinionForm, setShowOpinionForm] = useState(false);
  const [opRating, setOpRating] = useState(5);
  const [opComment, setOpComment] = useState('');
  const [opSubmitted, setOpSubmitted] = useState(false);

  // Business Reply State
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Business Reward State
  const [activeRewardOpId, setActiveRewardOpId] = useState(null);
  const [rewardTitle, setRewardTitle] = useState('Free Coffee ☕');
  const [rewardDesc, setRewardDesc] = useState('Thank you for your visit and review!');
  const [rewardSentMsg, setRewardSentMsg] = useState(null);

  // Reward Verification State
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState(null);

  function handleVerifyCode() {
    if (!verifyCode.trim()) return;
    const res = verifyRewardCode(verifyCode.trim().toUpperCase(), currentBizId);
    if (res.success) {
      setVerifyMsg({ type: 'success', text: `Verified! Reward claimed by ${res.touristName}.` });
    } else {
      setVerifyMsg({ type: 'error', text: 'Invalid or already claimed code.' });
    }
    setTimeout(() => setVerifyMsg(null), 5000);
    setVerifyCode('');
  }

  // Business's own posts
  const bizPosts = posts.filter(p => p.userRole === 'business').slice(0, 4);

  // All opinions for this business
  const bizOpinions = opinions.filter(o => o.businessId === currentBizId || o.businessId === 'biz-demo-01' || o.businessId === 'biz-u01');

  function submitOpinion() {
    if (!opComment.trim()) return;
    addOpinion({
      businessId: currentBizId,
      businessName: biz.name,
      touristId: user?.id || 'user-demo-01',
      touristName: user?.name || 'Tourist Explorer',
      rating: opRating,
      comment: opComment.trim(),
    });
    setOpComment('');
    setOpRating(5);
    setShowOpinionForm(false);
    setOpSubmitted(true);
    setTimeout(() => setOpSubmitted(false), 3000);
  }

  function handleSendReply(opinionId) {
    if (!replyText.trim()) return;
    respondToOpinion(opinionId, replyText, {
      id: currentBizId,
      name: biz.name,
    });
    setReplyText('');
    setActiveReplyId(null);
  }

  function handleSendReward(op) {
    issueBusinessReward(op.touristId, currentBizId, biz.name, rewardTitle, rewardDesc);
    setRewardSentMsg(`Reward "${rewardTitle}" sent to ${op.touristName}!`);
    setActiveRewardOpId(null);
    setRewardTitle('Free Coffee ☕');
    setRewardDesc('Thank you for your visit and review!');
    setTimeout(() => setRewardSentMsg(null), 4000);
  }

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 style={{ fontSize: 18, fontWeight: 800 }}>{biz.name}</h1>
              <span className="badge badge-verified">✅ Verified Business</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Business ID: <code style={{ color: '#38bdf8' }}>{currentBizId}</code> · Local Guide & Experience Host
            </p>
          </div>
          <div className="avatar" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>RK</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '10px 4px' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>₹{(biz.monthlyRevenue / 1000).toFixed(0)}K</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Monthly Revenue</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '10px 4px' }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{biz.pendingBookings}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Pending</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '10px 4px' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#fbbf24' }}>⭐{biz.rating}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rating</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16, paddingBottom: 100 }}>

        {/* Quick Actions */}
        <div className="grid-2 mb-4">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/upload')}
          >
            📸 Upload Experience Reel
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/recommendations')}>
            🧠 Mindset AI Matcher
          </button>
        </div>

        {/* Verify Reward Code */}
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))', borderColor: 'rgba(16,185,129,0.3)' }}>
          <div className="card-body">
            <h2 style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: '#10b981' }}>🔐 Verify Tourist Reward</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Enter the 6-character secret code shown by the tourist to redeem their reward.</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. X8B9K2"
                className="input"
                style={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleVerifyCode}>Verify</button>
            </div>
            {verifyMsg && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: verifyMsg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: verifyMsg.type === 'success' ? '#10b981' : '#ef4444' }}>
                {verifyMsg.text}
              </div>
            )}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid-2 mb-4">
          <div className="stat-card">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Today's Bookings</div>
            <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--primary)' }}>{biz.todayBookings.length}</div>
            <div style={{ fontSize: 12, color: 'var(--accent)' }}>↑ 2 from yesterday</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tourist Opinions</div>
            <div style={{ fontWeight: 800, fontSize: 24, color: '#fbbf24' }}>{bizOpinions.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Received & Active</div>
          </div>
        </div>

        {/* Weekly Revenue Chart */}
        <div className="card mb-4">
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>📊 Weekly Revenue Overview</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weeklyRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tourist Opinions & Interactive Reaction/Response Section */}
        <div className="mb-4">
          <div className="section-header">
            <div>
              <h2 className="section-title">💬 Tourist Opinions & Feedback</h2>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                React with emojis and send official business replies
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowOpinionForm(v => !v)}
            >+ Send Opinion</button>
          </div>

          {opSubmitted && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 12, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
              ✅ Opinion submitted to {biz.name}! +15 XP earned.
            </div>
          )}

          {rewardSentMsg && (
            <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 12, color: '#fbbf24', fontSize: 13, fontWeight: 600 }}>
              🎁 {rewardSentMsg}
            </div>
          )}

          {showOpinionForm && (
            <div className="card mb-3 animate-in">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>✍️ Submit Opinion to {biz.name}</div>
                <StarRating value={opRating} onChange={setOpRating} />
                <textarea
                  value={opComment}
                  onChange={e => setOpComment(e.target.value)}
                  placeholder="Share your experience, tips, and constructive thoughts…"
                  rows={3}
                  style={{
                    width: '100%', marginTop: 12,
                    background: 'var(--bg-glass)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '10px 12px',
                    color: 'var(--text-primary)', fontSize: 14, resize: 'none',
                  }}
                />
                <div className="flex gap-2 mt-3">
                  <button className="btn btn-primary btn-sm" onClick={submitOpinion} style={{ flex: 1 }}>
                    Submit Opinion
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowOpinionForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Opinions List */}
          {bizOpinions.map(op => {
            const hasReactions = op.reactions && op.reactions.length > 0;
            const hasResponses = op.responses && op.responses.length > 0;

            return (
              <div key={op.id} className="card mb-3" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                      {op.touristName?.slice(0, 2).toUpperCase() || 'TR'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{op.touristName}</div>
                      <div style={{ fontSize: 11, color: ratingColor[op.rating] || '#fbbf24' }}>
                        {'★'.repeat(op.rating || 5)} {op.rating}/5
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(op.timestamp).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 10 }}>
                    "{op.comment}"
                  </p>

                  {/* Reaction Toolbar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 2 }}>React:</span>
                      {REACTION_EMOJIS.map(emoji => {
                        const isReacted = (op.reactions || []).some(r => r.emoji === emoji && r.from === currentBizId);
                        return (
                          <button
                            key={emoji}
                            onClick={() => reactToOpinion(op.id, emoji, currentBizId)}
                            style={{
                              background: isReacted ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-glass)',
                              border: `1px solid ${isReacted ? 'var(--primary)' : 'transparent'}`,
                              borderRadius: 99,
                              padding: '2px 6px',
                              fontSize: 14,
                              cursor: 'pointer',
                              transition: 'transform 0.15s',
                            }}
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setActiveRewardOpId(activeRewardOpId === op.id ? null : op.id)}
                        style={{ fontSize: 12, padding: '4px 10px', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
                      >
                        🎁 Award
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setActiveReplyId(activeReplyId === op.id ? null : op.id)}
                        style={{ fontSize: 12, padding: '4px 10px' }}
                      >
                        💬 {hasResponses ? 'Add Reply' : 'Respond'}
                      </button>
                    </div>
                  </div>

                  {/* Reward Input Box */}
                  {activeRewardOpId === op.id && (
                    <div style={{
                      marginTop: 10, marginBottom: 10, padding: 12,
                      background: 'rgba(251,191,36,0.05)',
                      border: '1px solid rgba(251,191,36,0.2)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 8 }}>
                        Send Streak Reward to {op.touristName}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                        <select
                          value={rewardTitle}
                          onChange={e => setRewardTitle(e.target.value)}
                          style={{
                            width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)', padding: '8px', color: 'var(--text-primary)', fontSize: 13
                          }}
                        >
                          <option value="Free Coffee ☕">Free Coffee ☕</option>
                          <option value="10% Off Next Booking 🎟️">10% Off Next Booking 🎟️</option>
                          <option value="Complimentary Snack 🥨">Complimentary Snack 🥨</option>
                        </select>
                        <input
                          value={rewardDesc}
                          onChange={e => setRewardDesc(e.target.value)}
                          placeholder={`Message for ${op.touristName}…`}
                          style={{
                            width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)', padding: '8px', color: 'var(--text-primary)', fontSize: 13
                          }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSendReward(op)}
                          style={{ alignSelf: 'flex-start', background: '#fbbf24', color: '#000', fontWeight: 800 }}
                        >
                          Send Reward 🎁
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Display Current Reactions */}
                  {hasReactions && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      {op.reactions.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            padding: '2px 8px',
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#38bdf8',
                          }}
                        >
                          {r.emoji} Reacted by {r.from === currentBizId ? 'You (Business)' : r.from}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Business Official Threaded Responses */}
                  {hasResponses && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      marginTop: 8,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>🏢 Official Business Response</span>
                      </div>
                      {op.responses.map(resp => (
                        <div key={resp.id} style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {resp.text}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(resp.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {resp.responderName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Box */}
                  {activeReplyId === op.id && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={`Write official reply to ${op.touristName}…`}
                        style={{
                          flex: 1,
                          background: 'var(--bg-glass)',
                          border: '1px solid var(--border)',
                          borderRadius: 99,
                          padding: '8px 14px',
                          color: 'var(--text-primary)',
                          fontSize: 13,
                        }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSendReply(op.id)}
                        disabled={!replyText.trim()}
                      >
                        Send Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Business Media Posts */}
        {bizPosts.length > 0 && (
          <div className="mb-4">
            <div className="section-header">
              <h2 className="section-title">📸 Business Posts</h2>
              <button className="section-link" onClick={() => navigate('/feed')}>See all</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {bizPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => navigate('/feed')}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                  }}
                >
                  <img src={post.mediaUrl} alt="" style={{ width: '100%', height: 90, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                  <div style={{ padding: '6px 8px', fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ❤️ {post.likes.length} · 💬 {post.comments.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-ghost btn-full mb-4" onClick={() => navigate('/profile')}>
          👤 Manage Profile
        </button>
      </div>
    </div>
  );
}
