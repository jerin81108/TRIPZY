import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMERGENCY_REQUESTS, NEARBY_FACILITIES } from '../data/mockData';
import { useApp } from '../context/AppContext';

const statusColor = { active: '#ef4444', responding: '#f97316', resolved: '#22c55e' };
const priorityBg = { high: 'rgba(239,68,68,0.08)', medium: 'rgba(234,179,8,0.08)', low: 'rgba(34,197,94,0.08)' };
const typeIcon = { Medical: '🏥', Accident: '🚗', Lost: '🗺️', Theft: '👜', Harassment: '🚨', 'Natural disaster': '⛈️', Other: '⚠️' };

function timeAgo(ts) {
  const mins = Math.round((Date.now() - new Date(ts)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export default function EmergencyDashboard() {
  const navigate = useNavigate();
  const { emergencyRequests, resolveEmergency } = useApp();
  const [selectedReq, setSelectedReq] = useState(null);

  const active = emergencyRequests.filter((r) => r.status === 'active' || r.status === 'responding');
  const resolved = emergencyRequests.filter((r) => r.status === 'resolved');

  return (
    <div className="page animate-in" style={{ background: 'linear-gradient(160deg, #1a0808 0%, #030712 60%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)', padding: '20px 16px 16px' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#ef4444' }}>🚨 Emergency Responder</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="live-dot" style={{ background: '#ef4444' }}></div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live monitoring · Officer Kavitha</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>👤</button>
        </div>

        {/* Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          <div style={{ textAlign: 'center', background: 'rgba(239,68,68,0.15)', borderRadius: 'var(--radius-md)', padding: '10px 4px', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: '#ef4444' }}>{active.length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Active</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(234,179,8,0.1)', borderRadius: 'var(--radius-md)', padding: '10px 4px' }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: '#eab308' }}>{emergencyRequests.filter(r => r.status === 'responding').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Responding</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-md)', padding: '10px 4px' }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: '#22c55e' }}>{resolved.length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Resolved</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>

        {/* Active Requests */}
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">
            <h2 className="section-title">🔴 Active Requests</h2>
            <span className="badge badge-danger">{active.length} active</span>
          </div>

          {active.map((req) => (
            <div
              key={req.id}
              className="card mb-3"
              style={{
                border: `1px solid ${statusColor[req.status]}40`,
                background: priorityBg[req.priority],
                cursor: 'pointer',
              }}
              onClick={() => setSelectedReq(req)}
            >
              <div className="card-body">
                {/* Priority badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 22 }}>{typeIcon[req.type] || '⚠️'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{req.touristName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{req.type}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 600, background: `${statusColor[req.status]}20`, color: statusColor[req.status] }}>
                      {req.status}
                    </span>
                    <span className={`badge ${req.priority === 'high' ? 'badge-danger' : req.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                      {req.priority}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  📍 {req.location}<br />
                  🕐 {timeAgo(req.timestamp)}
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.4, background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8, borderLeft: `3px solid ${statusColor[req.status]}` }}>
                  {req.description}
                </div>

                {/* Emergency Contacts */}
                {req.emergencyContacts && req.emergencyContacts.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>First Contacts / Relatives</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {req.emergencyContacts.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: 6 }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 6 }}>({c.relation})</span>
                          </div>
                          <a href={`tel:${c.phone}`} style={{ fontSize: 12, color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>📞 {c.phone}</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nearest Facility */}
                {req.nearestFacility && (
                  <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>NEAREST FACILITY</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{req.nearestFacility.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      📍 {req.nearestFacility.distance} · ⏱️ ETA: {req.nearestFacility.eta} · 📞 {req.nearestFacility.phone}
                    </div>
                  </div>
                )}

                <div className="grid-2">
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={(e) => { e.stopPropagation(); resolveEmergency(req.id); }}
                  >
                    ✅ Mark Resolved
                  </button>
                  <a
                    href={`tel:${req.nearestFacility?.phone}`}
                    className="btn btn-danger btn-sm"
                    style={{ textDecoration: 'none', textAlign: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    📞 Call Facility
                  </a>
                </div>
              </div>
            </div>
          ))}

          {active.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <p>No active emergencies</p>
            </div>
          )}
        </div>

        {/* Resolved */}
        <div className="mb-4">
          <div className="section-header">
            <h2 className="section-title">✅ Recently Resolved</h2>
            <span className="badge badge-verified">{resolved.length}</span>
          </div>
          {resolved.map((req) => (
            <div key={req.id} className="card mb-2" style={{ opacity: 0.7 }}>
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 18 }}>{typeIcon[req.type] || '⚠️'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{req.touristName} · {req.type}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(req.timestamp)}</div>
                    </div>
                  </div>
                  <span className="badge badge-verified">Resolved</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nearby Facilities reference */}
        <div className="mb-4">
          <h2 className="section-title mb-3">🏥 Area Facilities</h2>
          {NEARBY_FACILITIES.map((fac) => (
            <div key={fac.id} className="card mb-2">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 24 }}>{fac.type === 'hospital' ? '🏥' : fac.type === 'police' ? '🚔' : '🩺'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{fac.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>📍 {fac.distance} · 📞 {fac.phone} · {fac.open24h ? '24/7' : 'Daytime'}</div>
                  </div>
                  <a href={`tel:${fac.phone}`} className="btn btn-danger btn-sm" style={{ textDecoration: 'none' }}>Call</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
