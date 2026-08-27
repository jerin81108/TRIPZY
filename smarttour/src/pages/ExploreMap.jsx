import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DESTINATIONS, BUSINESSES, NEARBY_FACILITIES } from '../data/mockData';
import { getCrowdLevel } from '../utils/crowdEngine';
import { getVideosForDestination } from '../utils/placeVideos';
import ReelsModal from '../components/ReelsModal';

const LAYER_OPTIONS = [
  { id: 'destinations', label: 'Destinations', icon: '🗺️' },
  { id: 'businesses', label: 'Businesses', icon: '🏪' },
  { id: 'emergency', label: 'Emergency', icon: '🏥' },
];

export default function ExploreMap() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [activeLayer, setActiveLayer] = useState('destinations');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeReel, setActiveReel] = useState(null);

  useEffect(() => {
    if (mapInstance.current) return;

    // Dynamically import leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, {
        center: [13.0827, 80.2707],
        zoom: 11,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = { map, L, markers: [] };
      renderMarkers('destinations', L, map);
    });

    return () => {
      if (mapInstance.current?.map) {
        mapInstance.current.map.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    const { map, L, markers } = mapInstance.current;
    markers.forEach(m => map.removeLayer(m));
    mapInstance.current.markers = [];
    renderMarkers(activeLayer, L, map);
  }, [activeLayer]);

  function renderMarkers(layer, L, map) {
    const newMarkers = [];

    if (layer === 'destinations') {
      DESTINATIONS.forEach((dest) => {
        const level = getCrowdLevel(dest.crowdScore);
        const colorMap = { low: '#22c55e', moderate: '#eab308', high: '#f97316', critical: '#ef4444' };
        const color = colorMap[level.textColor] || '#0ea5e9';

        const icon = L.divIcon({
          html: `<div style="width:36px;height:36px;background:${color};border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${level.icon}</div>`,
          iconSize: [36, 36],
          className: '',
        });

        const marker = L.marker([dest.lat, dest.lng], { icon })
          .addTo(map)
          .on('click', () => setSelectedItem({ type: 'destination', data: dest }));
        newMarkers.push(marker);
      });
    }

    if (layer === 'businesses') {
      BUSINESSES.forEach((biz) => {
        const catIcons = { food: '🍛', hotel: '🏨', guide: '🧑‍🏫', transport: '🚕', handicraft: '🎨', experience: '🏕️' };
        const icon = L.divIcon({
          html: `<div style="width:32px;height:32px;background:#8b5cf6;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${catIcons[biz.category] || '🏪'}</div>`,
          iconSize: [32, 32],
          className: '',
        });
        const marker = L.marker([biz.lat, biz.lng], { icon })
          .addTo(map)
          .on('click', () => setSelectedItem({ type: 'business', data: biz }));
        newMarkers.push(marker);
      });
    }

    if (layer === 'emergency') {
      NEARBY_FACILITIES.forEach((fac) => {
        const icons = { hospital: '🏥', police: '🚔', firstaid: '🩺' };
        const colors = { hospital: '#ef4444', police: '#3b82f6', firstaid: '#10b981' };
        const icon = L.divIcon({
          html: `<div style="width:34px;height:34px;background:${colors[fac.type] || '#6b7280'};border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${icons[fac.type] || '⚠️'}</div>`,
          iconSize: [34, 34],
          className: '',
        });
        const marker = L.marker([fac.lat, fac.lng], { icon })
          .addTo(map)
          .on('click', () => setSelectedItem({ type: 'facility', data: fac }));
        newMarkers.push(marker);
      });
    }

    mapInstance.current.markers = newMarkers;
  }

  return (
    <div className="page-full" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        zIndex: 10,
        position: 'relative',
      }}>
        <div className="flex items-center justify-between mb-3">
          <button className="back-btn" onClick={() => navigate('/home')}>←</button>
          <h1 className="page-header-title">🗺️ Explore Map</h1>
          <div className="flex items-center gap-1" style={{ fontSize: 12 }}>
            <div className="live-dot"></div>
            <span style={{ color: 'var(--text-secondary)' }}>Live</span>
          </div>
        </div>

        {/* Layer selector */}
        <div className="chip-row">
          {LAYER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`chip ${activeLayer === opt.id ? 'active' : ''}`}
              onClick={() => setActiveLayer(opt.id)}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        style={{ flex: 1, width: '100%', position: 'relative' }}
        className="map-container"
      />

      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        top: 130,
        right: 16,
        background: 'rgba(15,23,42,0.9)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
        backdropFilter: 'blur(10px)',
        zIndex: 5,
        fontSize: 11,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>CROWD LEVEL</div>
        {[
          { color: '#22c55e', label: '🟢 Low (<30%)' },
          { color: '#eab308', label: '🟡 Moderate' },
          { color: '#f97316', label: '🟠 High' },
          { color: '#ef4444', label: '🔴 Critical (>80%)' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1 mb-1">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }}></div>
            {l.label}
          </div>
        ))}
      </div>

      {/* Bottom Sheet — Selected Item */}
      {selectedItem && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(15,23,42,0.97)',
          border: '1px solid var(--border)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: '16px 16px 32px',
          zIndex: 10,
          backdropFilter: 'blur(20px)',
        }}>
          <div className="modal-handle" onClick={() => setSelectedItem(null)}></div>

          {selectedItem.type === 'destination' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 18 }}>{selectedItem.data.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedItem.data.city} · {selectedItem.data.category}</p>
                </div>
                <span className={`crowd-badge ${getCrowdLevel(selectedItem.data.crowdScore).textColor}`}>
                  {getCrowdLevel(selectedItem.data.crowdScore).icon} {getCrowdLevel(selectedItem.data.crowdScore).label}
                </span>
              </div>
              <div className="progress-bar mb-2">
                <div className="progress-fill" style={{ width: `${selectedItem.data.crowdScore}%`, background: getCrowdLevel(selectedItem.data.crowdScore).color }}></div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedItem.data.crowdScore}% capacity</span>
                <span className="rating">⭐ {selectedItem.data.rating}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/destination/${selectedItem.data.id}`)}
                >
                  View Details →
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)', fontWeight: 700 }}
                  onClick={() => {
                    const vids = getVideosForDestination(selectedItem.data);
                    if (vids.length > 0) {
                      setActiveReel({ ...vids[0], placeName: selectedItem.data.name, placeCity: selectedItem.data.city });
                    }
                  }}
                >
                  🎬 Watch Video
                </button>
              </div>
            </div>
          )}

          {selectedItem.type === 'business' && (
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 18 }}>{selectedItem.data.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{selectedItem.data.type} · {selectedItem.data.city}</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="rating">⭐ {selectedItem.data.rating}</span>
                <span className="badge badge-verified">✅ Verified</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedItem.data.priceRange}</span>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => navigate('/marketplace')}>
                View in Marketplace →
              </button>
            </div>
          )}

          {selectedItem.type === 'facility' && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span style={{ fontSize: 32 }}>
                  {selectedItem.data.type === 'hospital' ? '🏥' : selectedItem.data.type === 'police' ? '🚔' : '🩺'}
                </span>
                <div>
                  <h3 style={{ fontWeight: 800 }}>{selectedItem.data.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📞 {selectedItem.data.phone} · {selectedItem.data.distance}</p>
                </div>
              </div>
              <button className="btn btn-danger btn-full" onClick={() => navigate('/sos')}>
                🚨 Request Emergency Help
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full-Screen Reels Video Player */}
      {activeReel && (
        <ReelsModal
          reel={activeReel}
          onClose={() => setActiveReel(null)}
        />
      )}

      {/* Bottom Nav placeholder space */}
      <div style={{ height: 'var(--nav-height)' }}></div>
    </div>
  );
}
