import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { BUSINESSES } from '../data/mockData';
import { getCrowdLevel, getForecast, getCapacityStatus, getAlternatives } from '../utils/crowdEngine';
import { useApp } from '../context/AppContext';
import { getVideosForDestination } from '../utils/placeVideos';
import ReelsModal from '../components/ReelsModal';

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { destinations, mindsetDataset, addReport } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'videos' | 'crowd' | 'nearby'
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reported, setReported] = useState(false);
  const [activeReel, setActiveReel] = useState(null);

  // Find destination across all available lists
  const allDestinations = useMemo(() => {
    const map = new Map();
    (destinations || []).forEach(d => map.set(d.id, d));
    (mindsetDataset || []).forEach(d => {
      if (!map.has(d.id)) map.set(d.id, d);
    });
    return Array.from(map.values());
  }, [destinations, mindsetDataset]);

  const dest = allDestinations.find((d) => d.id === id) || allDestinations[0];
  if (!dest) return <div className="page container" style={{ paddingTop: 40 }}>Destination not found.</div>;

  // Retrieve all attached video reels for this specific destination
  const videos = getVideosForDestination(dest);

  const level = getCrowdLevel(dest.crowdScore || 40);
  const forecast = getForecast(dest);
  const capacity = getCapacityStatus(dest);
  const alternatives = getAlternatives(dest);
  const nearbyBiz = BUSINESSES.filter((b) => b.nearDestination?.includes(id)).slice(0, 3);

  function handleReport() {
    addReport({
      id: `rep-${Date.now()}`,
      type: reportType,
      location: dest.name,
      description: reportDesc,
      status: 'pending',
      timestamp: new Date().toISOString(),
      reportedBy: 'Tourist',
      severity: 'medium'
    });
    setReported(true);
    setTimeout(() => { setShowReport(false); setReported(false); setReportType(''); setReportDesc(''); }, 2000);
  }

  return (
    <div className="page animate-in">
      {/* Hero Image & Video Reel Action */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        <img
          src={dest.image}
          alt={dest.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(3,7,18,0.3) 0%, rgba(3,7,18,0.85) 100%)'
        }} />

        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          ←
        </button>

        {/* Watch Video Floating Pill */}
        {videos.length > 0 && (
          <button
            onClick={() => setActiveReel({ ...videos[0], placeName: dest.name, placeCity: dest.city })}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              color: '#fff',
              border: 'none',
              borderRadius: 99,
              padding: '6px 14px',
              fontWeight: 800,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.5)',
              zIndex: 10,
            }}
          >
            <span>▶ Watch Video ({videos.length})</span>
          </button>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, color: '#fff' }}>{dest.name}</h1>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>📍 {dest.city}, {dest.state}</span>
            <span className={`crowd-badge ${level.textColor}`}>{level.icon} {level.label}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16, paddingBottom: 100 }}>

        {/* Quick Stats Row */}
        <div className="grid-3 mb-4">
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ fontSize: 18, color: level.color }}>{dest.crowdScore || 40}%</div>
            <div className="stat-label">Crowd Capacity</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ fontSize: 18, color: '#fbbf24' }}>⭐{dest.rating || 4.8}</div>
            <div className="stat-label">{(dest.reviews || 1200).toLocaleString('en-IN')} reviews</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ fontSize: 18 }}>{dest.entryFee === 0 ? 'Free' : `₹${dest.entryFee}`}</div>
            <div className="stat-label">Entry Fee</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar mb-4">
          {[
            { id: 'overview', label: '📖 Overview' },
            { id: 'videos', label: `🎬 Videos (${videos.length})` },
            { id: 'crowd', label: '📊 Crowd' },
            { id: 'nearby', label: '🏪 Nearby' },
          ].map((t) => (
            <div
              key={t.id}
              className={`tab-item ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              style={{ cursor: 'pointer', fontWeight: 700 }}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <>
            {/* Embedded Video Player Spotlight */}
            {videos.length > 0 && (
              <div className="card mb-4" style={{ overflow: 'hidden', background: '#0f172a' }}>
                <div style={{ position: 'relative', height: 200, background: '#000' }}>
                  <video
                    src={videos[0].videoUrl}
                    poster={videos[0].thumbnail}
                    muted
                    loop
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 12,
                  }}>
                    <div style={{
                      background: 'rgba(244,63,94,0.85)',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 800,
                      width: 'fit-content',
                    }}>
                      🎬 FEATURED VIDEO TOUR
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>{videos[0].title}</div>
                        <div style={{ color: '#93c5fd', fontSize: 11 }}>By {videos[0].creator} · 👁️ {videos[0].views}</div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveReel({ ...videos[0], placeName: dest.name, placeCity: dest.city })}
                        style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700 }}
                      >
                        Full Screen ▶
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              {dest.description}
            </p>

            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span>🕐</span><span style={{ color: 'var(--text-secondary)' }}>Best time:</span><span>{dest.bestTime || '6:00 AM – 10:00 AM'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>🏷️</span><span style={{ color: 'var(--text-secondary)' }}>Category:</span><span>{dest.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>🛡️</span><span style={{ color: 'var(--text-secondary)' }}>Safety score:</span>
                <span style={{ color: (dest.safetyScore || 85) >= 80 ? '#22c55e' : '#f97316' }}>{dest.safetyScore || 85}/100</span>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {(dest.tags || dest.vibeTags || []).map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary btn-full"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`, '_blank')}
              >
                🧭 Navigate with GPS
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => navigate(`/search`)}
              >
                💬 Ask Guide
              </button>
            </div>
          </>
        )}

        {/* Tab: Videos & Reels Gallery */}
        {activeTab === 'videos' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 16 }}>🎬 Videos & Reels for {dest.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Watch community vlogs and video previews</p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/upload')}
              >
                + Add Video
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setActiveReel({ ...vid, placeName: dest.name, placeCity: dest.city })}
                  style={{
                    position: 'relative',
                    height: 220,
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#0f172a',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  }}
                >
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5) 100%)'
                  }} />

                  {/* Play circle */}
                  <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    color: '#fff',
                  }}>
                    ▶
                  </div>

                  <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, color: '#fff' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', marginBottom: 2 }}>{vid.creator}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {vid.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
                      <span>👁️ {vid.views}</span>
                      <span>❤️ {vid.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tab: Crowd */}
        {activeTab === 'crowd' && (
          <>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📊 Live Crowd Forecast</h3>
            <div className="card mb-4">
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontWeight: 600 }}>Capacity Usage</span>
                  <span style={{ fontWeight: 800, color: level.color }}>{capacity.percentage}%</span>
                </div>
                <div className="progress-bar mb-2" style={{ height: 10 }}>
                  <div className="progress-fill" style={{ width: `${capacity.percentage}%`, background: level.color }} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{capacity.current.toLocaleString('en-IN')} current</span>
                  <span>{capacity.max.toLocaleString('en-IN')} max</span>
                </div>
              </div>
            </div>

            <div className="scroll-row mb-4">
              {forecast.map((f) => (
                <div key={f.time} style={{
                  minWidth: 72,
                  background: 'var(--bg-glass)',
                  border: `1px solid ${f.time === 'Now' ? f.level.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 8px',
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{f.time}</div>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{f.level.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: f.level.color }}>{f.crowd}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{f.level.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tab: Nearby */}
        {activeTab === 'nearby' && (
          <>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🏪 Local Services & Experiences</h3>
            {nearbyBiz.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>
                No partner services listed right here yet.
              </div>
            ) : (
              nearbyBiz.map((b) => (
                <div key={b.id} className="card mb-3">
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</div>
                      <span style={{ fontSize: 12, color: '#fbbf24' }}>⭐{b.rating}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{b.type} · {b.city}</div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/chat/biz-demo-01`)}
                    >
                      💬 Message Business
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Full-Screen Reels Player Modal */}
      {activeReel && (
        <ReelsModal
          reel={activeReel}
          onClose={() => setActiveReel(null)}
        />
      )}
    </div>
  );
}
