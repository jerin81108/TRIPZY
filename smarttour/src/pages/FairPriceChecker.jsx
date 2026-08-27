import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkPrice, TRANSPORT_TYPES, estimateFare } from '../utils/priceEngine';
import { useApp } from '../context/AppContext';

export default function FairPriceChecker() {
  const navigate = useNavigate();
  const { addReport } = useApp();
  const [transportType, setTransportType] = useState('auto');
  const [distance, setDistance] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [result, setResult] = useState(null);
  const [reported, setReported] = useState(false);

  function handleCheck() {
    const dist = parseFloat(distance);
    const quoted = parseFloat(quotedPrice);
    if (!dist || !quoted) return;
    const check = checkPrice(transportType, dist, quoted);
    setResult(check);
    setReported(false);
  }

  function handleReport() {
    addReport({
      id: `rep-${Date.now()}`,
      type: 'Overcharging',
      location: 'Tourist Location',
      description: `${TRANSPORT_TYPES.find(t => t.id === transportType)?.label}: Quoted ₹${result.quotedPrice}, estimated fair price ₹${result.min}–₹${result.max} for ${distance} km.`,
      status: 'pending',
      timestamp: new Date().toISOString(),
      reportedBy: 'Tourist',
      severity: 'medium',
    });
    setReported(true);
  }

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px 16px 16px' }}>
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={() => navigate('/home')}>←</button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>💰 Fair Price Checker</h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Detect overcharging instantly</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* Info banner */}
        <div className="alert-card info mb-4">
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Estimates are based on standard market rates and are for reference only. Actual fares may vary.
          </div>
        </div>

        {/* Transport Type */}
        <div className="mb-4">
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Select Transport Type</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TRANSPORT_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTransportType(t.id); setResult(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${transportType === t.id ? 'var(--primary)' : 'var(--border)'}`,
                  background: transportType === t.id ? 'rgba(14,165,233,0.08)' : 'var(--bg-glass)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: transportType === t.id ? 'var(--primary)' : 'var(--text-primary)' }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {estimateFare(t.id, 5).min}–{estimateFare(t.id, 5).max} for 5 km
                  </div>
                </div>
                {transportType === t.id && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid-2 mb-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Distance (km)</label>
            <input type="number" className="form-input" placeholder="e.g. 8" value={distance} onChange={(e) => { setDistance(e.target.value); setResult(null); }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Quoted Price (₹)</label>
            <input type="number" className="form-input" placeholder="e.g. 500" value={quotedPrice} onChange={(e) => { setQuotedPrice(e.target.value); setResult(null); }} />
          </div>
        </div>

        <button className="btn btn-primary btn-full mb-6" onClick={handleCheck} disabled={!distance || !quotedPrice}>
          🔍 Check Fair Price
        </button>

        {/* Result */}
        {result && (
          <div className="animate-in">
            <div style={{
              borderRadius: 'var(--card-radius)',
              overflow: 'hidden',
              border: `1px solid ${result.severity === 'success' ? 'rgba(16,185,129,0.3)' : result.severity === 'warning' ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.3)'}`,
              marginBottom: 16,
            }}>
              {/* Status bar */}
              <div style={{
                padding: '12px 16px',
                background: result.severity === 'success' ? 'rgba(16,185,129,0.12)' : result.severity === 'warning' ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)',
                fontWeight: 800,
                fontSize: 15,
                color: result.severity === 'success' ? '#10b981' : result.severity === 'warning' ? '#eab308' : '#ef4444',
              }}>
                {result.message}
              </div>

              <div style={{ padding: 16, background: 'var(--bg-glass)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>ESTIMATED FAIR</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#10b981' }}>₹{result.min}–₹{result.max}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: result.severity === 'danger' ? 'rgba(239,68,68,0.08)' : 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: `1px solid ${result.severity === 'danger' ? 'rgba(239,68,68,0.2)' : 'var(--border)'}` }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>QUOTED PRICE</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: result.severity === 'danger' ? '#ef4444' : 'var(--text-primary)' }}>₹{result.quotedPrice}</div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Transport Type</span>
                  <span>{TRANSPORT_TYPES.find(t => t.id === transportType)?.icon} {TRANSPORT_TYPES.find(t => t.id === transportType)?.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Distance</span>
                  <span>{distance} km</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Overcharge ratio</span>
                  <span style={{ color: result.severity === 'danger' ? '#ef4444' : result.severity === 'warning' ? '#eab308' : '#10b981', fontWeight: 600 }}>{result.overchargeRatio}%</span>
                </div>
              </div>
            </div>

            {/* Report button */}
            {result.severity !== 'success' && (
              reported ? (
                <div className="alert-card success">
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Report Submitted</div>
                    <div style={{ fontSize: 12 }}>Our team will investigate this incident.</div>
                  </div>
                </div>
              ) : (
                <button className="btn btn-danger btn-full" onClick={handleReport}>
                  🚩 Report Overcharging
                </button>
              )
            )}
          </div>
        )}

        {/* Rate reference */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📋 Standard Rate Reference</h3>
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', overflow: 'hidden' }}>
            {TRANSPORT_TYPES.map((t, i) => {
              const rate = estimateFare(t.id, 10);
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: i < TRANSPORT_TYPES.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span>{t.icon} {t.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 13 }}>₹{rate.min}–₹{rate.max} / 10 km</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
            * Estimates based on standard market rates. Actual rates may vary by city, time, and demand. Always confirm fare before journey.
          </p>
        </div>
      </div>
    </div>
  );
}
