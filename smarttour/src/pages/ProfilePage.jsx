import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { DEMO_USER } from '../data/mockData';
import { BADGES_CONFIG } from '../data/extraData';

const INTERESTS = ['nature', 'culture', 'food', 'adventure', 'shopping', 'history', 'photography', 'wildlife'];
const roleIcons = { tourist: '🧳', business: '🏪', admin: '🏛️', responder: '🚨' };

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, role, accounts, loginAsAccount, logout, deleteAccount } = useAuth();
  const { bookings, posts, streakData, strangerTrips } = useApp();

  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const totalSpent = bookings.reduce((s, b) => s + b.amount, 0) + DEMO_USER.totalSpending;
  const { currentStreak = 0, xp = 0, badges = [], rewards = [] } = streakData || {};

  // User's own posts
  const userPosts = posts.filter(p => p.userId === (user?.id || 'user-demo-01'));
  const unclaimedRewards = rewards.filter(r => !r.claimed);

  // User's joined stranger trips
  const myStrangerTrips = strangerTrips.filter(t => (t.members || []).some(m => m.id === user?.id));

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleDeleteAccount() {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      deleteAccount(user?.id);
      navigate('/');
    }
  }

  function handleSwitchUser(acc) {
    loginAsAccount(acc);
    setShowSwitchModal(false);
  }

  const level = Math.floor(xp / 500) + 1;
  const levelProgress = ((xp % 500) / 500) * 100;

  return (
    <div className="page animate-in" style={{ paddingBottom: 110 }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px 16px 16px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="back-btn" onClick={() => navigate(-1)}>←</button>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>👤 Profile</h1>
          </div>

          {/* Quick Account Switcher Trigger */}
          <button
            onClick={() => setShowSwitchModal(true)}
            style={{
              background: 'rgba(14,165,233,0.12)',
              border: '1px solid rgba(14,165,233,0.3)',
              borderRadius: 99,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>🔄</span> Switch User
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* Avatar & Info */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="avatar avatar-lg" style={{ margin: '0 auto 12px', fontSize: 28, background: 'var(--grad-primary)', color: '#fff' }}>
            {user?.avatar || user?.name?.slice(0, 2) || 'U'}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name || 'Explorer'}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{user?.email || 'traveler@smarttour.in'}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="badge badge-info">{roleIcons[role] || '🧳'} {role || 'tourist'}</span>
            <span className="badge badge-verified">✅ Verified Profile</span>
          </div>
        </div>

        {/* Streak & XP banner */}
        {role === 'tourist' && (
          <div
            onClick={() => navigate('/rewards')}
            style={{
              background: 'linear-gradient(135deg, rgba(120,53,15,0.5), rgba(154,52,18,0.3))',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              marginBottom: 16,
              cursor: 'pointer',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-8">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#fbbf24' }}>🔥 {currentStreak}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Day Streak</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>{xp}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>XP · Lv.{level}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: unclaimedRewards.length > 0 ? '#10b981' : 'var(--text-secondary)' }}>
                    {unclaimedRewards.length}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rewards</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700 }}>View →</div>
            </div>
            {/* XP Progress */}
            <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${levelProgress}%`, background: 'linear-gradient(90deg, #fbbf24, #f97316)', borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              {xp % 500} / 500 XP to Level {level + 1}
            </div>
          </div>
        )}

        {/* Stats */}
        {role === 'tourist' && (
          <div className="grid-3 mb-4">
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: 20 }}>{DEMO_USER.totalTrips + bookings.length}</div>
              <div className="stat-label">Trips</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: 18, color: '#fda4af' }}>{myStrangerTrips.length}</div>
              <div className="stat-label">Stranger Squads</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: 20 }}>{userPosts.length}</div>
              <div className="stat-label">Clips & Posts</div>
            </div>
          </div>
        )}

        {/* 🎒 My Stranger Squad Trips */}
        {myStrangerTrips.length > 0 && (
          <div className="mb-4">
            <div className="section-header">
              <div style={{ fontWeight: 800, fontSize: 15 }}>🎒 My Stranger Squads ({myStrangerTrips.length})</div>
              <button className="section-link" onClick={() => navigate('/stranger-trips')}>Explore more</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myStrangerTrips.map(trip => (
                <div
                  key={trip.id}
                  onClick={() => navigate('/stranger-trips')}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(244,63,94,0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{trip.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>📍 {trip.city} · 📅 {trip.date}</div>
                  </div>
                  <span style={{ background: 'rgba(244,63,94,0.15)', color: '#fda4af', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>
                    Open Lobby →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {role === 'tourist' && badges.length > 0 && (
          <div className="mb-4">
            <div className="section-header">
              <div style={{ fontWeight: 700 }}>🏅 My Badges</div>
              <button className="section-link" onClick={() => navigate('/rewards')}>See all</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {BADGES_CONFIG.filter(b => badges.includes(b.id)).map(badge => (
                <div key={badge.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
                  borderRadius: 99, padding: '5px 12px',
                }}>
                  <span style={{ fontSize: 18 }}>{badge.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Posts / Clips */}
        {userPosts.length > 0 && (
          <div className="mb-4">
            <div className="section-header">
              <div style={{ fontWeight: 700 }}>📸 My Clips & Posts ({userPosts.length})</div>
              <button className="section-link" onClick={() => navigate('/feed')}>Feed</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {userPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => navigate('/feed')}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    aspectRatio: '1',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {post.mediaType === 'video' ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎬</div>
                  ) : (
                    <img src={post.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '4px 6px', fontSize: 10, color: '#fff',
                    display: 'flex', gap: 6,
                  }}>
                    <span>❤️ {post.likes.length}</span>
                    <span>💬 {post.comments.length}</span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate('/upload')}
                style={{
                  borderRadius: 'var(--radius-md)',
                  aspectRatio: '1',
                  background: 'rgba(14,165,233,0.06)',
                  border: '1px dashed rgba(14,165,233,0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--primary)',
                }}
              >
                <div style={{ fontSize: 22 }}>+</div>
                <div style={{ fontSize: 10, fontWeight: 700 }}>Post</div>
              </button>
            </div>
          </div>
        )}

        {userPosts.length === 0 && role === 'tourist' && (
          <div className="card mb-4" style={{ textAlign: 'center' }}>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>No clips or photos posted yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Share your Tamil Nadu travel memories to appear on your profile!</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>Upload Your First Post (+25 XP)</button>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="card mb-4">
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>📍 Location & Contact</div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Location</span>
              <span>{user?.location || 'Chennai, Tamil Nadu'}</span>
            </div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Phone</span>
              <span>{DEMO_USER.phone}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Member Status</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Active Explorer</span>
            </div>
          </div>
        </div>

        {/* Interests */}
        {role === 'tourist' && (
          <div className="mb-4">
            <div style={{ fontWeight: 700, marginBottom: 10 }}>❤️ Interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {INTERESTS.map((interest) => (
                <span
                  key={interest}
                  className="tag"
                  style={{
                    background: (user?.interests || DEMO_USER.interests).includes(interest) ? 'rgba(14,165,233,0.15)' : 'var(--bg-glass)',
                    borderColor: (user?.interests || DEMO_USER.interests).includes(interest) ? 'var(--primary)' : 'var(--border)',
                    color: (user?.interests || DEMO_USER.interests).includes(interest) ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  {(user?.interests || DEMO_USER.interests).includes(interest) ? '✓ ' : ''}{interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sign out & Delete */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleLogout}>
            🚪 Sign Out / Switch User
          </button>
          <button className="btn btn-danger btn-full btn-lg" onClick={handleDeleteAccount} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: '#ef4444' }}>
            🗑️ Delete My Account
          </button>
        </div>
      </div>

      {/* ── MODAL: QUICK ACCOUNT SWITCHER ── */}
      {showSwitchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: 440,
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900 }}>🔄 Switch Persona Account</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Instantly switch to another user to test chats and interactions</p>
              </div>
              <button onClick={() => setShowSwitchModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {accounts.map(acc => {
                const isCurrent = acc.id === user?.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSwitchUser(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent ? 'rgba(14,165,233,0.15)' : 'var(--bg-glass)',
                      border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {acc.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{acc.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {acc.role} · 📍 {acc.location}
                      </div>
                    </div>
                    {isCurrent && <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 800 }}>Active ✓</span>}
                  </div>
                );
              })}
            </div>

            <button
              className="btn btn-ghost btn-full btn-sm"
              onClick={() => {
                setShowSwitchModal(false);
                navigate('/auth');
              }}
            >
              + Create New User / Go to Auth Screen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
