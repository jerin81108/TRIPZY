import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BADGES_CONFIG, REWARDS_CONFIG } from '../data/extraData';

function XPBar({ xp }) {
  const level = Math.floor(xp / 500) + 1;
  const currentLevelXP = (level - 1) * 500;
  const nextLevelXP = level * 500;
  const progress = ((xp - currentLevelXP) / 500) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--text-secondary)' }}>Level {level} Explorer</span>
        <span style={{ color: '#fbbf24', fontWeight: 700 }}>{xp} XP</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-glass)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(progress, 100)}%`,
          background: 'linear-gradient(90deg, #fbbf24, #f97316)',
          borderRadius: 99,
          transition: 'width 1s ease',
        }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
        {xp - currentLevelXP} / 500 XP to Level {level + 1}
      </div>
    </div>
  );
}

function StreakCalendar({ loginHistory }) {
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toDateString());
  }
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
        Last 30 Days
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
        {days.map((d, i) => {
          const isToday = d === today.toDateString();
          const active = loginHistory.includes(d);
          return (
            <div
              key={i}
              title={d}
              style={{
                aspectRatio: 1,
                borderRadius: 4,
                background: active
                  ? 'linear-gradient(135deg, #f97316, #ef4444)'
                  : isToday
                    ? 'rgba(14,165,233,0.3)'
                    : 'var(--bg-glass)',
                border: isToday ? '1px solid var(--primary)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(135deg, #f97316, #ef4444)', display: 'inline-block' }} />
          Active day
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--bg-glass)', border: '1px solid var(--border)', display: 'inline-block' }} />
          Missed
        </span>
      </div>
    </div>
  );
}

export default function StreakRewards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { streakData, claimReward } = useApp();

  const { currentStreak, longestStreak, xp, badges = [], rewards = [], loginHistory = [] } = streakData;

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px' }}>
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>🔥 Streak & Rewards</h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20, paddingBottom: 100 }}>

        {/* Streak Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #431407, #7c2d12, #9a3412)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          textAlign: 'center',
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(251,191,36,0.15) 0%, transparent 70%)' }} />
          <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 8, position: 'relative', filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.5))' }}>
            🔥
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#fbbf24', lineHeight: 1, position: 'relative' }}>
            {currentStreak}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, position: 'relative' }}>
            day streak
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16, position: 'relative' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>{longestStreak}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Best Streak</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>{xp}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Total XP</div>
            </div>
          </div>
          <button
            onClick={() => {
              // Dev cheat: artificially force a streak increase for testing
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              updateStreak(user?.id, yesterday.toDateString()); 
            }}
            style={{
              marginTop: 16,
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 99,
              padding: '6px 16px',
              color: '#fff',
              fontSize: 11,
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            🛠️ Dev Test: +1 Day Streak
          </button>
        </div>

        {/* XP Bar */}
        <div className="card mb-4">
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>⚡ XP Progress</div>
            <XPBar xp={xp} />
          </div>
        </div>

        {/* Next milestone */}
        <div style={{
          background: 'rgba(14,165,233,0.08)',
          border: '1px solid rgba(14,165,233,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ fontSize: 32 }}>
            {currentStreak < 7 ? '🎟️' : currentStreak < 30 ? '🍽️' : '💎'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {currentStreak < 7
                ? `${7 - currentStreak} more days → Free Travel Ticket! 🎟️`
                : currentStreak < 30
                  ? `${30 - currentStreak} more days → Free Table Booking! 🍽️`
                  : '🏆 Maximum rewards achieved!'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Keep your daily streak alive to unlock rewards
            </div>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="card mb-4">
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>📅 Login History</div>
            <StreakCalendar loginHistory={loginHistory} />
          </div>
        </div>

        {/* Active Rewards */}
        {rewards.length > 0 && (
          <div className="mb-4">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>🎁 Your Rewards</div>
            {rewards.map(reward => (
              <div
                key={reward.id}
                style={{
                  background: reward.claimed
                    ? 'var(--bg-glass)'
                    : reward.type === 'travel_ticket'
                      ? 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(14,165,233,0.04))'
                      : 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
                  border: `1px solid ${reward.claimed ? 'var(--border)' : reward.type === 'travel_ticket' ? 'rgba(14,165,233,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: 16,
                  marginBottom: 12,
                  opacity: reward.claimed ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 32 }}>{reward.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{reward.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Valid until {new Date(reward.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {reward.claimed && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: 99 }}>✅ Claimed</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{reward.description}</p>

                {reward.type === 'travel_ticket' && reward.destinations && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Partner Destinations:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {reward.destinations.map(d => (
                        <span key={d} className="tag" style={{ fontSize: 11 }}>📍 {d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {reward.type === 'hotel_booking' && reward.hotels && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Partner Hotels & Restaurants:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {reward.hotels.map(h => (
                        <span key={h} className="tag" style={{ fontSize: 11 }}>🍽️ {h}</span>
                      ))}
                    </div>
                  </div>
                )}

                {!reward.claimed && reward.secretCode ? (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center', marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Secret Verification Code</div>
                    <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 4, color: 'var(--primary)' }}>{reward.secretCode}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Show this code at the venue to redeem your reward!</div>
                  </div>
                ) : !reward.claimed && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => claimReward(reward.id)}
                    style={{ width: '100%' }}
                  >
                    🎁 Claim Reward
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="mb-4">
          <div style={{ fontWeight: 700, marginBottom: 12 }}>🏅 Badges</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {BADGES_CONFIG.map(badge => {
              const earned = badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  style={{
                    background: earned ? 'rgba(251,191,36,0.08)' : 'var(--bg-glass)',
                    border: `1px solid ${earned ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    opacity: earned ? 1 : 0.45,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 28, filter: earned ? 'none' : 'grayscale(1)' }}>
                    {badge.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: earned ? '#fbbf24' : 'var(--text-secondary)' }}>
                      {badge.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{badge.desc}</div>
                    {earned && badge.xp > 0 && (
                      <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2 }}>+{badge.xp} XP earned</div>
                    )}
                  </div>
                  {earned && (
                    <div style={{ marginLeft: 'auto', fontSize: 18 }}>✅</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* How to earn */}
        <div className="card mb-4">
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>💡 How to Earn XP</div>
            {[
              { action: 'Daily Login', xp: '+10 XP', icon: '📅' },
              { action: 'Post a Photo/Video', xp: '+25 XP', icon: '📸' },
              { action: 'Book a Tour', xp: '+50 XP', icon: '🎫' },
              { action: 'Leave an Opinion', xp: '+15 XP', icon: '⭐' },
              { action: '7-Day Streak Bonus', xp: '+100 XP + 🎟️', icon: '🔥' },
              { action: '30-Day Streak Bonus', xp: '+500 XP + 🍽️', icon: '🥇' },
            ].map(item => (
              <div key={item.action} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span>{item.icon}</span>
                  <span>{item.action}</span>
                </div>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: 13 }}>{item.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
