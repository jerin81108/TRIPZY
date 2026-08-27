import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getCrowdLevel } from '../utils/crowdEngine';
import { getVideosForDestination } from '../utils/placeVideos';
import ReelsModal from '../components/ReelsModal';
import StoryViewerModal from '../components/StoryViewerModal';
import CreateStoryModal from '../components/CreateStoryModal';

const WEATHER = { icon: '⛅', temp: '29°C', desc: 'Partly Cloudy', humidity: '72%', uvIndex: 'High' };

const QUICK_ACTIONS = [
  { icon: '🧠', label: 'Mindset AI', path: '/recommendations', hot: true },
  { icon: '🎒', label: 'Stranger Trips', path: '/stranger-trips' },
  { icon: '🗺️', label: 'Explore', path: '/map' },
  { icon: '💬', label: 'Connect', path: '/search' },
  { icon: '📸', label: 'Feed', path: '/feed' },
  { icon: '🔥', label: 'Rewards', path: '/rewards' },
  { icon: '🏪', label: 'Market', path: '/marketplace' },
  { icon: '💰', label: 'Price', path: '/price-checker' },
];

export default function TouristHome() {
  const { user } = useAuth();
  const {
    alerts, destinations, posts, streakData, updateStreak, strangerTrips,
    stories, addStory, deleteStory, viewStory, reactToStory, sendMessage
  } = useApp();
  const navigate = useNavigate();
  const [activeReel, setActiveReel] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [showCreateStory, setShowCreateStory] = useState(false);

  const currentUser = user || { id: 'user-demo-01', name: 'Arjun Mehta', avatar: 'AM', role: 'tourist' };
  const currentUserId = currentUser.id;

  const myStoryIndex = (stories || []).findIndex(s => s.userId === currentUserId);
  const hasMyStory = myStoryIndex !== -1;

  // Trigger daily streak on home load
  useEffect(() => {
    if (user?.id) updateStreak(user.id);
  }, [user?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const crowded = destinations.slice(0, 5).filter(d => d.crowdScore >= 70);
  const recommended = destinations.filter(d => d.crowdScore <= 40).slice(0, 3);
  const nearby = destinations.slice(0, 10);

  const { currentStreak = 0, xp = 0, rewards = [] } = streakData || {};
  const hasUnclaimedReward = rewards.some(r => !r.claimed);

  // Latest 3 community posts
  const latestPosts = posts.slice(0, 3);

  // Top 3 Stranger Trips
  const topStrangerTrips = strangerTrips.slice(0, 3);

  return (
    <div className="page animate-in">
      {/* Hero Header */}
      <div className="hero">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>
                📍 Tamil Nadu
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>
                {greeting}, {user?.name?.split(' ')[0] || 'Traveler'} 👋
              </h1>
            </div>
            <button onClick={() => navigate('/profile')} className="avatar">
              {user?.avatar || user?.name?.slice(0, 2) || 'U'}
            </button>
          </div>

          {/* Streak widget */}
          <div
            onClick={() => navigate('/rewards')}
            style={{
              background: currentStreak > 0
                ? 'linear-gradient(135deg, rgba(120,53,15,0.7), rgba(154,52,18,0.5))'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${currentStreak > 0 ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 28 }}>🔥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: currentStreak > 0 ? '#fbbf24' : 'var(--text-secondary)' }}>
                {currentStreak > 0 ? `${currentStreak}-Day Streak!` : 'Start Your Streak!'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {currentStreak < 7
                  ? `${7 - currentStreak} more days → 🎟️ Free Travel Ticket`
                  : currentStreak < 30
                    ? `${30 - currentStreak} more days → 🍽️ Table Booking`
                    : '🥇 Max rewards achieved!'}
              </div>
            </div>
            {hasUnclaimedReward && (
              <span style={{ background: '#ef4444', borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '3px 8px', color: '#fff' }}>
                🎁 Claim!
              </span>
            )}
            <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>{xp} XP →</div>
          </div>

          {/* Weather */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 26 }}>{WEATHER.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{WEATHER.temp}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{WEATHER.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-secondary)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{WEATHER.humidity}</div>
                Humidity
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#f97316' }}>{WEATHER.uvIndex}</div>
                UV Index
              </div>
            </div>
          </div>

          {/* Quick Actions — 4-col grid with Stranger Trips Highlight */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                style={{
                  background: a.hot
                    ? 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(244,63,94,0.08))'
                    : 'rgba(255,255,255,0.05)',
                  border: a.hot ? '1px solid rgba(244,63,94,0.5)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                  color: a.hot ? '#fda4af' : 'var(--text-primary)',
                  position: 'relative',
                }}
              >
                {a.hot && (
                  <span style={{
                    position: 'absolute',
                    top: -5,
                    right: -4,
                    background: '#f43f5e',
                    color: '#fff',
                    fontSize: 8,
                    fontWeight: 900,
                    padding: '1px 5px',
                    borderRadius: 99,
                  }}>
                    HOT
                  </span>
                )}
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>

        {/* ── TOP INSTAGRAM STORIES ROW (Your Story + Others) ── */}
        <div style={{
          padding: '12px 14px 10px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          gap: 14,
          overflowX: 'auto',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          {/* YOUR STORY */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  if (hasMyStory) {
                    setActiveStoryIndex(myStoryIndex);
                  } else {
                    setShowCreateStory(true);
                  }
                }}
                style={{
                  padding: 2.5,
                  borderRadius: '50%',
                  background: hasMyStory
                    ? 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
                    : 'rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="avatar"
                  style={{
                    width: 50,
                    height: 50,
                    fontSize: 15,
                    fontWeight: 800,
                    border: '2px solid var(--bg-card)',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    color: '#fff',
                  }}
                >
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Quick '+' Plus Badge */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateStory(true);
                }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#0ea5e9',
                  border: '2px solid var(--bg-card)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Add a new story"
              >
                +
              </button>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: hasMyStory ? '#38bdf8' : 'var(--text-secondary)' }}>
              {hasMyStory ? 'Your Story' : 'Add Story'}
            </span>
          </div>

          {/* OTHER ACCOUNTS' STORIES (Viewable by other accounts) */}
          {(stories || [])
            .map((st, idx) => ({ ...st, originalIndex: idx }))
            .filter(st => st.userId !== currentUserId)
            .map((st) => (
              <div
                key={st.id}
                onClick={() => setActiveStoryIndex(st.originalIndex)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  padding: 2.5,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                }}>
                  <div
                    className="avatar"
                    style={{
                      width: 50,
                      height: 50,
                      fontSize: 15,
                      fontWeight: 800,
                      border: '2px solid var(--bg-card)',
                    }}
                  >
                    {st.userAvatar || st.userName?.slice(0, 2).toUpperCase() || 'ST'}
                  </div>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  maxWidth: 56,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {st.userName?.split(' ')[0] || st.userName}
                </span>
              </div>
            ))}
        </div>

        {/* ── HIGHLIGHTED STRANGER TRIPS SPOTLIGHT BANNER ── */}
        <div
          onClick={() => navigate('/stranger-trips')}
          style={{
            background: 'linear-gradient(135deg, #2e0854, #4c0519, #881337)',
            border: '1.5px solid rgba(244,63,94,0.5)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 18px',
            marginBottom: 20,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(244,63,94,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, opacity: 0.15 }}>🎒</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ background: '#f43f5e', color: '#fff', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 99 }}>
              🔥 HIGHLIGHTED FEATURE
            </span>
            <span style={{ fontSize: 11, color: '#fda4af', fontWeight: 600 }}>Solo & Group Travel</span>
          </div>

          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            🎒 Join a Stranger Trip in Tamil Nadu
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, marginBottom: 12 }}>
            Never travel alone! Team up with random verified travelers to split taxi fares, share hill treks, and explore temples safely.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', marginLeft: 4 }}>
                {['AM', 'PS', 'KR', 'DN'].map((av, idx) => (
                  <span key={idx} style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: '#0ea5e9', color: '#fff', fontSize: 9, fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid #2e0854', marginLeft: idx === 0 ? 0 : -6
                  }}>{av}</span>
                ))}
              </div>
              <span style={{ fontSize: 11, color: '#fda4af', fontWeight: 700 }}>
                {strangerTrips.length} active squad trips
              </span>
            </div>

            <button
              style={{
                background: '#fff',
                color: '#881337',
                border: 'none',
                borderRadius: 99,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Explore Squads →
            </button>
          </div>
        </div>

        {/* ── ACTIVE STRANGER TRIPS SCROLL ROW ── */}
        <div className="mb-4">
          <div className="section-header">
            <h2 className="section-title">🎒 Trending Stranger Squads</h2>
            <button className="section-link" onClick={() => navigate('/stranger-trips')}>View all ({strangerTrips.length})</button>
          </div>
          <div className="scroll-row" style={{ paddingBottom: 8 }}>
            {topStrangerTrips.map(trip => {
              const isJoined = (trip.members || []).some(m => m.id === user?.id);
              const slotsLeft = trip.maxMembers - (trip.members?.length || 0);

              return (
                <div
                  key={trip.id}
                  className="scroll-card"
                  onClick={() => navigate('/stranger-trips')}
                  style={{
                    cursor: 'pointer',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    minWidth: 230,
                  }}
                >
                  <div style={{ position: 'relative', height: 110 }}>
                    <img
                      src={trip.image}
                      alt={trip.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                    <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 800, color: '#fbbf24' }}>
                      ₹{trip.costPerPerson}
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {trip.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      📍 {trip.city} · 📅 {trip.date}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: slotsLeft > 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                        👥 {trip.members?.length || 0}/{trip.maxMembers} Joined
                      </span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {isJoined ? 'Joined ✓' : 'Join Squad →'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Alerts */}
        {alerts.length > 0 && (
          <div className="mb-4">
            <div className="section-header">
              <h2 className="section-title">⚠️ Safety Alerts</h2>
              <span className="badge badge-warning">Live</span>
            </div>
            {alerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className={`alert-card ${alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'info'}`}
              >
                <span style={{ fontSize: 20 }}>
                  {alert.type === 'crowd' ? '👥' : alert.type === 'weather' ? '🌧️' : '⚠️'}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{alert.location}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{alert.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Community Feed Preview */}
        <div className="mb-4">
          <div className="section-header">
            <h2 className="section-title">🎬 Community Feed</h2>
            <button className="section-link" onClick={() => navigate('/feed')}>See all</button>
          </div>
          <div className="scroll-row" style={{ paddingBottom: 8 }}>
            {latestPosts.map(post => (
              <div
                key={post.id}
                className="scroll-card"
                onClick={() => navigate('/feed')}
                style={{
                  cursor: 'pointer',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  minWidth: 200,
                }}
              >
                <img
                  src={post.mediaUrl}
                  alt=""
                  style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                  onError={e => e.target.style.display = 'none'}
                />
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{post.userName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.caption}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>❤️ {post.likes.length}</span>
                    <span>💬 {post.comments.length}</span>
                  </div>
                </div>
              </div>
            ))}
            <button
              className="scroll-card"
              onClick={() => navigate('/upload')}
              style={{
                minWidth: 120, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(14,165,233,0.06)',
                border: '1px dashed rgba(14,165,233,0.3)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer', color: 'var(--primary)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Post</div>
            </button>
          </div>
        </div>

        {/* Explore Without the Crowd */}
        <div className="mb-4">
          <div className="section-header">
            <h2 className="section-title">🌊 Explore Without the Crowd</h2>
          </div>

          {crowded.slice(0, 1).map((dest) => {
            const level = getCrowdLevel(dest.crowdScore);
            return (
              <div
                key={dest.id}
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 'var(--card-radius)',
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div style={{ fontWeight: 700 }}>{dest.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{dest.city}</div>
                  </div>
                  <span className={`crowd-badge critical`}>{level.icon} Very Crowded</span>
                </div>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{ width: `${dest.crowdScore}%`, background: '#ef4444' }}></div>
                </div>
                <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                  {dest.crowdScore}% capacity · {dest.currentVisitors.toLocaleString('en-IN')} visitors
                </div>
              </div>
            );
          })}

          <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 20 }}>↓</div>

          {recommended.slice(0, 2).map((dest) => {
            const level = getCrowdLevel(dest.crowdScore);
            return (
              <div
                key={dest.id}
                className="card mb-3"
                onClick={() => navigate(`/destination/${dest.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="card-img-sm"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="card-body">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div style={{ fontWeight: 700 }}>Try: {dest.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{dest.city} · {dest.category}</div>
                    </div>
                    <span className={`crowd-badge low`}>{level.icon} {level.label}</span>
                  </div>
                  <div className="progress-bar mb-2" style={{ height: 6 }}>
                    <div className="progress-fill" style={{ width: `${dest.crowdScore}%`, background: '#22c55e' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{dest.crowdScore}% capacity</span>
                    <span className="rating">⭐ {dest.rating} ({dest.reviews.toLocaleString('en-IN')})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nearby Destinations — All TN */}
        <div className="mb-4">
          <div className="section-header">
            <h2 className="section-title">🗺️ Tamil Nadu Destinations</h2>
            <button className="section-link" onClick={() => navigate('/map')}>See map</button>
          </div>
          <div className="scroll-row">
            {nearby.map((dest) => {
              const level = getCrowdLevel(dest.crowdScore);
              const vids = getVideosForDestination(dest);
              return (
                <div
                  key={dest.id}
                  className="scroll-card card"
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div style={{ position: 'relative' }} onClick={() => navigate(`/destination/${dest.id}`)}>
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="card-img-sm"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {vids.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReel({ ...vids[0], placeName: dest.name, placeCity: dest.city });
                        }}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(244, 63, 94, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 99,
                          padding: '3px 8px',
                          fontSize: 10,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }}
                        title="Watch Video"
                      >
                        <span>▶ Video</span>
                      </button>
                    )}
                  </div>
                  <div className="card-body" style={{ padding: '10px 12px' }} onClick={() => navigate(`/destination/${dest.id}`)}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{dest.name}</div>
                    <span className={`crowd-badge ${level.textColor}`} style={{ fontSize: 11 }}>
                      {level.icon} {level.label}
                    </span>
                    <div className="flex items-center justify-between mt-2">
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{dest.category}</span>
                      <span className="rating" style={{ fontSize: 11 }}>⭐ {dest.rating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SOS */}
        <div className="mb-4" style={{ textAlign: 'center' }}>
          <button
            className="btn-sos btn-full"
            style={{ borderRadius: 'var(--radius-lg)', padding: '18px', fontSize: 16, fontWeight: 800 }}
            onClick={() => navigate('/sos')}
          >
            🚨 EMERGENCY SOS
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            Press for medical, safety, or tourist emergencies
          </p>
        </div>
      </div>

      {/* Full-Screen Reels Video Player */}
      {activeReel && (
        <ReelsModal
          reel={activeReel}
          onClose={() => setActiveReel(null)}
        />
      )}

      {/* Instagram Story Full-Screen Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          stories={stories || []}
          initialIndex={activeStoryIndex}
          currentUserId={currentUserId}
          onClose={() => setActiveStoryIndex(null)}
          onDeleteStory={(id) => deleteStory(id)}
          onViewStory={(id, viewer) => viewStory(id, viewer)}
          onReactStory={(id, emoji) => reactToStory(id, emoji, currentUser)}
          onSendReply={(receiverId, text) => {
            sendMessage(receiverId, text, currentUser);
          }}
        />
      )}

      {/* Create Story Modal for Our Account */}
      {showCreateStory && (
        <CreateStoryModal
          currentUser={currentUser}
          onAddStory={(data) => {
            addStory(data);
          }}
          onClose={() => setShowCreateStory(false)}
        />
      )}
    </div>
  );
}
