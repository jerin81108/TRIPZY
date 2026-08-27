import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMERGENCY_TYPES, NEARBY_FACILITIES } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function SOSPage() {
  const navigate = useNavigate();
  const { addEmergencyRequest } = useApp();
  const [step, setStep] = useState(0); // 0=select type, 1=locating, 2=submitted
  const [selectedType, setSelectedType] = useState(null);
  const [request, setRequest] = useState(null);

  function handleSOS(type) {
    setSelectedType(type);
    setStep(1);

    setTimeout(() => {
      const req = {
        id: `sos-${Date.now()}`,
        touristName: 'Arjun Mehta',
        type: type.label,
        status: 'active',
        lat: 13.0512,
        lng: 80.2799,
        location: 'Chennai — Near Marina Beach, Zone 3',
        timestamp: new Date().toISOString(),
        nearestFacility: type.id === 'medical' || type.id === 'accident'
          ? NEARBY_FACILITIES.find((f) => f.type === 'hospital')
          : NEARBY_FACILITIES.find((f) => f.type === 'police'),
        description: `Emergency: ${type.label}`,
        priority: type.id === 'medical' || type.id === 'accident' ? 'high' : 'medium',
      };
      setRequest(req);
      addEmergencyRequest(req);
      setStep(2);
    }, 2000);
  }

  return (
    <div className="page animate-in" style={{ background: 'linear-gradient(160deg, #1a0505 0%, #030712 60%)' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
        <button className="back-btn" onClick={() => navigate('/home')}>←</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>🚨 Emergency SOS</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Your safety is our priority</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* Step 0: Select Emergency Type */}
        {step === 0 && (
          <>
            {/* Big SOS area */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                margin: '0 auto 16px',
                boxShadow: '0 0 60px rgba(239,68,68,0.4)',
                animation: 'pulse-sos 2s infinite',
              }}>
                🚨
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Select Emergency Type</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>We'll get your GPS location and alert the nearest facility</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {EMERGENCY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSOS(type)}
                  style={{
                    padding: '16px 12px',
                    borderRadius: 'var(--card-radius)',
                    border: `1px solid ${type.color}40`,
                    background: `${type.color}10`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <span style={{ fontSize: 32 }}>{type.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: type.color, textAlign: 'center' }}>{type.label}</span>
                </button>
              ))}
            </div>

            {/* Nearby facilities */}
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🏥 Nearest Emergency Facilities</h3>
            {NEARBY_FACILITIES.slice(0, 3).map((fac) => (
              <div key={fac.id} className="card mb-3">
                <div className="card-body">
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 28 }}>
                      {fac.type === 'hospital' ? '🏥' : fac.type === 'police' ? '🚔' : '🩺'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{fac.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        📍 {fac.distance} away · {fac.open24h ? '✅ 24/7 Open' : '⏰ Check hours'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--primary)' }}>📞 {fac.phone}</div>
                    </div>
                    <a href={`tel:${fac.phone}`} className="btn btn-danger btn-sm" style={{ textDecoration: 'none', flexShrink: 0 }}>
                      Call
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Helplines */}
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--card-radius)', padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#ef4444' }}>📞 National Emergency Helplines</div>
              {[
                { label: 'Ambulance', number: '108', icon: '🚑' },
                { label: 'Police', number: '100', icon: '🚔' },
                { label: 'Fire', number: '101', icon: '🚒' },
                { label: 'Tourist Helpline', number: '1363', icon: '🧳' },
                { label: 'Women Helpline', number: '1091', icon: '🆘' },
              ].map((h) => (
                <div key={h.number} className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 13 }}>{h.icon} {h.label}</span>
                  <a href={`tel:${h.number}`} style={{ fontWeight: 800, fontSize: 16, color: '#ef4444', textDecoration: 'none' }}>{h.number}</a>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Locating */}
        {step === 1 && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>📡</div>
            <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 24px', borderWidth: 4 }}></div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Getting Your Location...</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
              Emergency type: <strong style={{ color: selectedType?.color }}>{selectedType?.icon} {selectedType?.label}</strong>
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Connecting to emergency services...</p>
          </div>
        )}

        {/* Step 2: Submitted */}
        {step === 2 && request && (
          <div className="animate-in">
            <div style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--card-radius)',
              padding: 20,
              textAlign: 'center',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: '#10b981', marginBottom: 8 }}>SOS Sent!</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Your location has been shared with emergency services.</p>
            </div>

            {/* Request details */}
            <div className="card mb-4">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>📋 Request Details</div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Emergency Type</span>
                  <span>{selectedType?.icon} {request.type}</span>
                </div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Location</span>
                  <span>{request.location}</span>
                </div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span className="badge badge-warning">🔴 Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Request ID</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{request.id}</span>
                </div>
              </div>
            </div>

            {/* Nearest Facility */}
            {request.nearestFacility && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🚑 Nearest Facility En Route</h3>
                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-3">
                      <span style={{ fontSize: 32 }}>{request.nearestFacility.type === 'hospital' ? '🏥' : '🚔'}</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>{request.nearestFacility.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{request.nearestFacility.distance} away</div>
                      </div>
                    </div>
                    <div className="grid-2">
                      <a href={`tel:${request.nearestFacility.phone}`} className="btn btn-danger btn-sm" style={{ textDecoration: 'none', textAlign: 'center' }}>
                        📞 Call Now
                      </a>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/map')}>
                        🗺️ View Map
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-ghost btn-full" onClick={() => { setStep(0); setSelectedType(null); setRequest(null); }}>
              ← Back to Emergency Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
