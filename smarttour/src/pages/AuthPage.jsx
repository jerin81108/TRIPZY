import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_TABS = [
  { id: 'all', label: '👥 All Profiles' },
  { id: 'tourist', label: '🧳 Tourists' },
  { id: 'business', label: '🏪 Businesses' },
  { id: 'admin', label: '🏛️ Admins' },
  { id: 'custom', label: '✨ Create User' },
];

const roleBadgeColor = {
  tourist: '#0ea5e9',
  business: '#10b981',
  admin: '#8b5cf6',
  responder: '#ef4444',
};

const routeMap = {
  tourist: '/home',
  business: '/business',
  admin: '/admin',
  responder: '/emergency',
};

export default function AuthPage() {
  const { accounts, loginAsAccount, registerUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id || 'user-demo-01');
  const [loading, setLoading] = useState(false);

  // Pending approval state
  const [pendingResult, setPendingResult] = useState(null);

  // Custom user form state
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('tourist');
  const [customCity, setCustomCity] = useState('');
  const [customBio, setCustomBio] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🎒');

  const filteredAccounts = accounts.filter(acc => {
    if (activeTab === 'all') return true;
    return acc.role === activeTab;
  });

  const selectedAccount = accounts.find(a => a.id === selectedAccId) || accounts[0];

  function handleLoginSelected() {
    if (!selectedAccount) return;
    setLoading(true);
    setTimeout(() => {
      loginAsAccount(selectedAccount);
      navigate(routeMap[selectedAccount.role] || '/home');
    }, 400);
  }

  function handleQuickLogin(acc) {
    setSelectedAccId(acc.id);
    setLoading(true);
    setTimeout(() => {
      loginAsAccount(acc);
      navigate(routeMap[acc.role] || '/home');
    }, 300);
  }

  function handleRegister(e) {
    e.preventDefault();
    if (!customName.trim()) return;

    setLoading(true);
    const result = registerUser({
      name: customName.trim(),
      role: customRole,
      location: customCity.trim() ? `${customCity.trim()}, Tamil Nadu` : 'Chennai, Tamil Nadu',
      bio: customBio.trim() || 'Excited to explore Tamil Nadu and join Stranger Trips!',
      avatar: customEmoji || customName.slice(0, 2).toUpperCase(),
    });

    // Check if this is a pending approval request
    if (result && result.pending) {
      setLoading(false);
      setPendingResult(result.request);
      return;
    }

    setTimeout(() => {
      navigate(routeMap[result.role] || '/home');
    }, 400);
  }

  function handleBackToLogin() {
    setPendingResult(null);
    setLoading(false);
    setCustomName('');
    setCustomRole('tourist');
    setCustomCity('');
    setCustomBio('');
    setActiveTab('all');
  }

  // ─── Pending Approval Confirmation Screen ───
  if (pendingResult) {
    const roleColor = roleBadgeColor[pendingResult.role] || '#8b5cf6';
    const roleEmoji = pendingResult.role === 'admin' ? '🏛️' : '🚨';

    return (
      <div className="auth-page" style={{ padding: '24px 16px 40px', maxWidth: 520, margin: '0 auto' }}>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          {/* Animated waiting icon */}
          <div style={{
            fontSize: 64,
            marginBottom: 16,
            animation: 'pulse 2s infinite',
          }}>
            ⏳
          </div>

          <h2 style={{
            fontSize: 22,
            fontWeight: 900,
            marginBottom: 8,
            background: `linear-gradient(135deg, ${roleColor}, #fbbf24)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Request Submitted!
          </h2>

          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 24,
            maxWidth: 360,
            margin: '0 auto 24px',
          }}>
            Your registration as <strong style={{ color: roleColor }}>{roleEmoji} {pendingResult.role.charAt(0).toUpperCase() + pendingResult.role.slice(1)}</strong> has been submitted for review. An existing admin will approve your access.
          </p>

          {/* Request Details Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${roleColor}30`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: 24,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `${roleColor}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 800,
                color: roleColor,
                flexShrink: 0,
              }}>
                {pendingResult.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{pendingResult.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pendingResult.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Role</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: roleColor }}>{roleEmoji} {pendingResult.role}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Status</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>⏳ Pending</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Location</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>📍 {pendingResult.location}</div>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div style={{
            padding: '12px 16px',
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
          }}>
            <p style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.5, margin: 0 }}>
              🔒 <strong>Admin approval required.</strong> Your account will be activated once an admin reviews and approves your request. You'll be able to log in after approval.
            </p>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleBackToLogin}
            style={{ fontWeight: 800, fontSize: 15 }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'linear-gradient(-45deg, #0f172a, #1e293b, #0ea5e9, #8b5cf6)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 300, height: 300, background: 'rgba(14, 165, 233, 0.4)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 350, height: 350, background: 'rgba(139, 92, 246, 0.4)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }} />

      <div className="auth-page" style={{ 
        width: '100%', 
        maxWidth: 520, 
        position: 'relative', 
        zIndex: 10,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '32px 24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div className="auth-header" style={{ marginBottom: 28, textAlign: 'center' }}>
          <div className="auth-logo" style={{ fontSize: 56, marginBottom: 12, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>🗺️</div>
          <h1 className="auth-title" style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tripzy Tamil Nadu
          </h1>
          <p className="auth-subtitle" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
            Log in as any traveler or business persona to test interactive chats, posts & Stranger Trips
          </p>
        </div>

      {/* Role Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 6,
        marginBottom: 18,
        borderBottom: '1px solid var(--border)',
      }}>
        {ROLE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '7px 14px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: `1px solid ${activeTab === tab.id ? 'var(--primary)' : 'var(--border)'}`,
              background: activeTab === tab.id ? 'rgba(14,165,233,0.15)' : 'var(--bg-glass)',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'custom' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Choose a Profile ({filteredAccounts.length})
            </span>
            <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
              ⚡ 1-Tap Instant Sign In
            </span>
          </div>

          {/* Accounts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, maxHeight: 380, overflowY: 'auto', paddingRight: 2 }}>
            {filteredAccounts.map(acc => {
              const isSelected = selectedAccId === acc.id;
              const color = roleBadgeColor[acc.role] || '#0ea5e9';

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccId(acc.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'rgba(14,165,233,0.1)' : 'var(--bg-card)',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    className="avatar"
                    style={{
                      width: 44,
                      height: 44,
                      fontSize: 16,
                      background: `${color}20`,
                      color: color,
                      flexShrink: 0,
                      fontWeight: 800,
                    }}
                  >
                    {acc.avatar}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>{acc.name}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 99,
                          background: `${color}18`,
                          color: color,
                          textTransform: 'capitalize',
                        }}
                      >
                        {acc.role}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📍 {acc.location}
                    </div>

                    {acc.badge && (
                      <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 2, fontWeight: 600 }}>
                        {acc.badge}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLogin(acc);
                    }}
                    style={{
                      background: isSelected ? 'var(--grad-primary)' : 'rgba(255,255,255,0.06)',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      border: isSelected ? 'none' : '1px solid var(--border)',
                      borderRadius: 99,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {isSelected ? 'Enter →' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Primary CTA */}
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleLoginSelected}
            disabled={loading || !selectedAccount}
            style={{ fontWeight: 800, fontSize: 15 }}
          >
            {loading ? '⏳ Logging in…' : `Continue as ${selectedAccount?.name || 'Explorer'} (${selectedAccount?.role})`}
          </button>
        </>
      ) : (
        /* Create Custom Account Form */
        <form onSubmit={handleRegister} className="card" style={{ padding: 18, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✨</span> Create New Persona Account
          </div>

          {/* Admin/Responder approval notice */}
          {(customRole === 'admin' || customRole === 'responder') && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 14,
            }}>
              <p style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.5, margin: 0 }}>
                🔒 <strong>{customRole === 'admin' ? 'Admin' : 'Responder'} accounts require approval.</strong> Your registration will be sent to an existing admin for review before activation.
              </p>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Full Name *
            </label>
            <input
              required
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="e.g. Jerin George"
              style={{
                width: '100%',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Role
              </label>
              <select
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 8px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
              >
                <option value="tourist">🧳 Tourist</option>
                <option value="business">🏪 Local Business</option>
                <option value="admin">🏛️ Municipality Admin</option>
                <option value="responder">🚨 Responder</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Avatar Icon
              </label>
              <select
                value={customEmoji}
                onChange={e => setCustomEmoji(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 8px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
              >
                <option value="🎒">🎒 Backpacker</option>
                <option value="📸">📸 Vlogger</option>
                <option value="🧭">🧭 Explorer</option>
                <option value="🌴">🌴 Beach Lover</option>
                <option value="⛰️">⛰️ Trekker</option>
                <option value="🏛️">🏛️ Historian</option>
                <option value="🏪">🏪 Shop Owner</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              City / Location in Tamil Nadu
            </label>
            <input
              value={customCity}
              onChange={e => setCustomCity(e.target.value)}
              placeholder="e.g. Madurai, Ooty, Chennai"
              style={{
                width: '100%',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Travel Bio
            </label>
            <textarea
              value={customBio}
              onChange={e => setCustomBio(e.target.value)}
              placeholder="Tell others what kind of trips you like to join…"
              rows={2}
              style={{
                width: '100%',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: 13,
                resize: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || !customName.trim()}
          >
            {loading
              ? '⏳ Creating…'
              : (customRole === 'admin' || customRole === 'responder')
                ? '📨 Submit for Admin Approval'
                : '🚀 Create & Start Exploring'
            }
          </button>
        </form>
      )}

      {/* Helper Box */}
      <div style={{ marginTop: 24, padding: '14px', background: 'rgba(14,165,233,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(14,165,233,0.15)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
          💡 <strong style={{ color: 'var(--primary)' }}>Multi-User Interaction Demo</strong><br />
          Log in as one user, post clips or join a Stranger Trip, then switch accounts anytime via Profile to reply, chat, or test group interactions!
        </p>
      </div>
      </div>
    </div>
  );
}
