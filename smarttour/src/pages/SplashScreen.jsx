import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleStart() {
    setLoading(true);
    setTimeout(() => navigate('/auth'), 800);
  }

  return (
    <div className="splash">
      <div className="splash-logo">🗺️</div>
      <h1 className="splash-title">Tripzy</h1>
      <p className="splash-tagline">
        Don't just help tourists travel.<br />
        Help destinations handle tourism <strong>sustainably.</strong>
      </p>

      <div className="splash-features">
        <div className="splash-feature">
          <span className="splash-feature-icon">🧠</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>AI Crowd Intelligence</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Real-time crowd levels & smart alternatives</div>
          </div>
        </div>
        <div className="splash-feature">
          <span className="splash-feature-icon">💰</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Fair Price Protection</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Detect overcharging instantly</div>
          </div>
        </div>
        <div className="splash-feature">
          <span className="splash-feature-icon">🏪</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Local Business Marketplace</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Support verified local communities</div>
          </div>
        </div>
        <div className="splash-feature">
          <span className="splash-feature-icon">🚨</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Emergency SOS</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Instant safety with one tap</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 320 }}>
        <button className="btn btn-primary btn-full btn-lg" onClick={handleStart} disabled={loading}>
          {loading ? (
            <><span className="spinner" style={{ width: 18, height: 18 }}></span> Loading...</>
          ) : (
            '🚀 Get Started'
          )}
        </button>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            <div className="live-dot"></div>
            Live data from 24,580 tourists today
          </div>
        </div>
      </div>

      {/* Value props row */}
      <div style={{
        position: 'relative', zIndex: 1, display: 'flex', gap: 24, marginTop: 32,
        color: 'var(--text-muted)', fontSize: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>426</div>
          Businesses
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>15+</div>
          Destinations
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f97316' }}>24/7</div>
          Emergency
        </div>
      </div>
    </div>
  );
}
