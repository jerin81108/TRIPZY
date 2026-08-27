import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { searchSimilarAccounts } from '../utils/fuzzySearch';

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const roleColor = { tourist: '#0ea5e9', business: '#10b981', admin: '#8b5cf6', responder: '#ef4444' };
const roleIcon = { tourist: '🧳', business: '🏪', admin: '🏛️', responder: '🚨' };

export default function SearchConnect() {
  const navigate = useNavigate();
  const { user, accounts, loginAsAccount, loginHistory } = useAuth();
  const { users, conversations, messages } = useApp();

  const [tab, setTab] = useState('search'); // 'search' | 'messages' | 'connected'
  const [query, setQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [directIdInput, setDirectIdInput] = useState('');
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  // Active logged-in user (from AuthContext)
  const currentUser = user || accounts?.[0] || { id: 'user-demo-01', name: 'Arjun Mehta', role: 'tourist' };
  const currentUserId = currentUser.id;

  // Master Pool of All Registered Users (Unified from Auth accounts + App users)
  const allRegisteredUsers = useMemo(() => {
    const map = new Map();

    // 1. Add all auth accounts
    (accounts || []).forEach(acc => {
      map.set(acc.id, {
        ...acc,
        username: acc.username || `@${acc.name.toLowerCase().replace(/\s+/g, '_')}`,
      });
    });

    // 2. Add all app users (if not already present)
    (users || []).forEach(u => {
      if (!map.has(u.id)) {
        map.set(u.id, {
          ...u,
          username: u.username || `@${u.name.toLowerCase().replace(/\s+/g, '_')}`,
        });
      } else {
        const existing = map.get(u.id);
        map.set(u.id, { ...existing, ...u });
      }
    });

    return Array.from(map.values());
  }, [accounts, users]);

  // Search accounts matching or nearly matching the query across ALL registered accounts
  const filtered = useMemo(() => {
    return searchSimilarAccounts(allRegisteredUsers, query, currentUserId, filterRole, 25);
  }, [allRegisteredUsers, query, currentUserId, filterRole]);

  // Private Conversations Isolation:
  // ONLY show conversations where currentUserId is a direct participant!
  const myConvs = useMemo(() => {
    return conversations
      .filter(c => c.participants && c.participants.includes(currentUserId))
      .map(c => {
        const otherId = c.participants.find(p => p !== currentUserId) || currentUserId;
        const otherUser = allRegisteredUsers.find(u => u.id === otherId) || {
          id: otherId,
          name: otherId.startsWith('biz') ? `Business (${otherId})` : `User (${otherId})`,
          username: `@${otherId}`,
          avatar: otherId.slice(0, 2).toUpperCase(),
          role: otherId.startsWith('biz') ? 'business' : 'tourist',
          location: 'Tamil Nadu',
        };
        const convMsgs = messages[c.id] || [];
        const unread = convMsgs.filter(m => m.receiverId === currentUserId && !m.read).length;
        return { ...c, otherUser, unread };
      })
      .sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
  }, [conversations, currentUserId, allRegisteredUsers, messages]);

  function handleStartDirectChat(e) {
    e.preventDefault();
    if (!directIdInput.trim()) return;
    const clean = directIdInput.trim();
    navigate(`/chat/${clean}`);
  }

  function handleSwitchAccount(acc) {
    loginAsAccount(acc);
    setShowAccountSwitcher(false);
  }

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button className="back-btn" onClick={() => navigate('/home')}>←</button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>💬 Registered Accounts & Chat</h1>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Searches across all {allRegisteredUsers.length} registered usernames & IDs
              </p>
            </div>
          </div>

          {/* Account Selector Pill */}
          <button
            onClick={() => setShowAccountSwitcher(v => !v)}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 99,
              padding: '4px 10px',
              fontSize: 11,
              color: '#38bdf8',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>👤 {currentUser.name.split(' ')[0]}</span>
            <span style={{ fontSize: 9, opacity: 0.7 }}>({currentUserId}) ▾</span>
          </button>
        </div>

        {/* Account Switcher Dropdown Modal */}
        {showAccountSwitcher && (
          <div className="card mb-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--primary)', padding: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
              ⇄ Switch Active Account (Test 2-Way Chat Back & Forth):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {allRegisteredUsers.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => handleSwitchAccount(acc)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: acc.id === currentUserId ? '1.5px solid #22c55e' : '1px solid var(--border)',
                    background: acc.id === currentUserId ? 'rgba(34,197,94,0.15)' : 'var(--bg-glass)',
                    color: acc.id === currentUserId ? '#22c55e' : 'var(--text-primary)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {acc.role === 'business' ? '🏪' : '🧳'} {acc.name} ({acc.username || acc.id})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            ['search', `🔍 Search (${filtered.length})`],
            ['messages', `💬 Chats (${myConvs.length})`],
            ['connected', `🔗 Connected (${(loginHistory || []).filter(h => h.id !== currentUserId).length})`],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, padding: '9px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 700,
                border: `1px solid ${tab === id ? 'var(--primary)' : 'var(--border)'}`,
                background: tab === id ? 'rgba(14,165,233,0.12)' : 'transparent',
                color: tab === id ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16, paddingBottom: 100 }}>

        {/* Direct Message to Any ID Bar */}
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #1e1b4b, #0f172a)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div className="card-body">
            <div style={{ fontWeight: 800, fontSize: 14, color: '#c7d2fe', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🚀 Direct Message to Any Specific User ID</span>
              <span style={{ fontSize: 10, background: '#6366f1', color: '#fff', padding: '1px 6px', borderRadius: 99 }}>Two-Way</span>
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
              Enter any recipient User ID or Business ID to message them directly:
            </p>
            <form onSubmit={handleStartDirectChat} style={{ display: 'flex', gap: 8 }}>
              <input
                value={directIdInput}
                onChange={e => setDirectIdInput(e.target.value)}
                placeholder="e.g. user-t02, biz-demo-01, biz-u01, @priya_sharma…"
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 99,
                  padding: '9px 16px',
                  color: '#fff',
                  fontSize: 13,
                }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!directIdInput.trim()}
                style={{ borderRadius: 99, padding: '0 18px', fontWeight: 700 }}
              >
                Chat ID →
              </button>
            </form>
          </div>
        </div>

        {/* TAB 1: Search Accounts across all registered users */}
        {tab === 'search' && (
          <>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--text-muted)' }}>🔍</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search registered username (e.g. '@arjun', 'priya', 'rajan', 'chettinad')…"
                style={{
                  width: '100%',
                  background: 'var(--bg-glass)',
                  border: query ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '11px 14px 11px 40px',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {query.trim() && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 12,
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}>
                <span>Searching all registered usernames matching "<strong>{query}</strong>"</span>
                <span style={{ fontWeight: 700 }}>{filtered.length} found</span>
              </div>
            )}

            {/* Role Filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[['all', 'All Users'], ['tourist', '🧳 Tourists'], ['business', '🏪 Businesses'], ['admin', '🏛️ Admins']].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilterRole(id)}
                  style={{
                    padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${filterRole === id ? 'var(--primary)' : 'var(--border)'}`,
                    background: filterRole === id ? 'rgba(14,165,233,0.12)' : 'transparent',
                    color: filterRole === id ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >{label}</button>
              ))}
            </div>

            {/* Registered Account List */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>🔍</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>No registered username found</div>
                <div style={{ fontSize: 12 }}>Check spelling or use the Direct Message box above to reach any ID.</div>
              </div>
            ) : (
              filtered.map(u => {
                const score = u.similarityScore || 100;
                const scoreBadgeColor = score >= 90 ? '#22c55e' : score >= 70 ? '#38bdf8' : '#eab308';

                return (
                  <div
                    key={u.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${query ? `${scoreBadgeColor}50` : 'var(--border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: 14,
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div className="avatar" style={{
                      width: 46,
                      height: 46,
                      fontSize: 16,
                      flexShrink: 0,
                      fontWeight: 800,
                      background: `${roleColor[u.role] || '#0ea5e9'}20`,
                      color: roleColor[u.role] || '#0ea5e9'
                    }}>
                      {u.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{u.name}</span>
                        <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
                          {u.username || `@${u.id}`}
                        </span>

                        {query.trim() && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 99,
                            background: `${scoreBadgeColor}20`,
                            color: scoreBadgeColor,
                            border: `1px solid ${scoreBadgeColor}40`,
                          }}>
                            {score >= 95 ? '⚡ Exact Match' : `⭐ ${score}% Match`}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: `${roleColor[u.role]}15`, color: roleColor[u.role] }}>
                          {roleIcon[u.role] || '👤'} {u.role}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {u.location}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· ID: {u.id}</span>
                      </div>

                      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                        {u.bio && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/chat/${u.id}`)}
                      style={{
                        background: 'var(--grad-primary)',
                        border: 'none',
                        borderRadius: 99,
                        padding: '9px 18px',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 12,
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
                      }}
                    >
                      💬 Message
                    </button>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* TAB 2: Private Conversations Feed */}
        {tab === 'messages' && (
          <>
            <div style={{
              background: 'rgba(0, 168, 132, 0.1)',
              border: '1px solid rgba(0, 168, 132, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: 14,
              fontSize: 12,
              color: '#00a884',
            }}>
              🔒 <strong>Private Inbox for {currentUser.name} ({currentUser.username || currentUserId}):</strong> Only chats where you are a participant are visible here.
            </div>

            {myConvs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>No active conversations for {currentUser.name}</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>Start chatting with any registered username from the search tab</div>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('search')}>Search Users</button>
              </div>
            ) : (
              myConvs.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.otherUser.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 12px',
                    marginBottom: 8,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div className="avatar" style={{
                      width: 44,
                      height: 44,
                      fontSize: 16,
                      fontWeight: 800,
                      background: `${roleColor[conv.otherUser.role] || '#0ea5e9'}20`,
                      color: roleColor[conv.otherUser.role] || '#0ea5e9'
                    }}>
                      {conv.otherUser.avatar}
                    </div>
                    {conv.unread > 0 && (
                      <div style={{
                        position: 'absolute', top: -2, right: -2,
                        background: '#25d366', borderRadius: '50%',
                        width: 16, height: 16, fontSize: 9, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                      }}>{conv.unread}</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <div style={{ fontWeight: conv.unread > 0 ? 800 : 700, fontSize: 14 }}>
                        {conv.otherUser.name} <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>{conv.otherUser.username || `(${conv.otherUser.id})`}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                        {timeAgo(conv.lastTimestamp)}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.lastMessage}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* TAB 3: Connected — Login History */}
        {tab === 'connected' && (
          <>
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: 14,
              fontSize: 12,
              color: '#fbbf24',
            }}>
              🔗 <strong>Previously Connected Accounts:</strong> All accounts that have been logged into on this device. Quick-access to message them.
            </div>

            {(loginHistory || []).filter(h => h.id !== currentUserId).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>No Connected Accounts Yet</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>Log into different accounts from the Auth page to see them here.</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>Go to Login</button>
              </div>
            ) : (
              (loginHistory || []).filter(h => h.id !== currentUserId).map(h => {
                const color = roleColor[h.role] || '#0ea5e9';
                const icon = roleIcon[h.role] || '👤';
                const loginTime = h.lastLoginAt ? new Date(h.lastLoginAt) : null;
                const timeStr = loginTime ? timeAgo(h.lastLoginAt) : '';

                return (
                  <div
                    key={h.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 14,
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div className="avatar" style={{
                      width: 46,
                      height: 46,
                      fontSize: 16,
                      flexShrink: 0,
                      fontWeight: 800,
                      background: `${color}20`,
                      color: color,
                    }}>
                      {h.avatar}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{h.name}</span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 99,
                          background: `${color}18`,
                          color: color,
                          textTransform: 'capitalize',
                        }}>
                          {icon} {h.role}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {h.location && <span>📍 {h.location}</span>}
                        {timeStr && <span>· 🕐 {timeStr}</span>}
                      </div>

                      {h.badge && (
                        <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 2, fontWeight: 600 }}>
                          {h.badge}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/chat/${h.id}`)}
                      style={{
                        background: 'var(--grad-primary)',
                        border: 'none',
                        borderRadius: 99,
                        padding: '9px 18px',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 12,
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
                      }}
                    >
                      💬 Message
                    </button>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
