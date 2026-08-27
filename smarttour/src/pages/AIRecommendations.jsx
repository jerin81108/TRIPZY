import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MINDSET_ARCHETYPES } from '../data/mindsetDataset';
import { getMindsetRecommendations, getNearbyPlaces, getRelatedReels } from '../services/apiService';
import { parseCSVDataset, generateSampleCSV, estimateTravelTime } from '../utils/mindsetEngine';
import ReelsModal from '../components/ReelsModal';

export default function AIRecommendations() {
  const navigate = useNavigate();
  const {
    mindsetDataset,
    modelTrainedAt,
    uploadCustomDataset,
    resetToDefaultDataset,
    retrainModel,
  } = useApp();

  const [activeTab, setActiveTab] = useState('mindset'); // 'mindset' | 'radar' | 'reels' | 'dataset'
  const [selectedArchetype, setSelectedArchetype] = useState('spiritual');
  const [userMindset, setUserMindset] = useState({
    spirituality: 90,
    heritage: 85,
    peace: 70,
    adventure: 30,
    romance: 40,
    foodie: 65,
    nomad: 40,
    family: 80,
    nature: 60,
    budgetLevel: 40,
    crowdTolerance: 65,
  });

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [dataSource, setDataSource] = useState('local');

  // Nearby Radar State
  const [userCoords, setUserCoords] = useState({ lat: 9.9195, lng: 78.1193, cityName: 'Madurai (GPS Center)' });
  const [radarRadius, setRadarRadius] = useState(200);
  const [radarCategory, setRadarCategory] = useState('all');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Reels State
  const [activeReel, setActiveReel] = useState(null);
  const [allReels, setAllReels] = useState([]);

  // Dataset Studio State
  const [csvInput, setCsvInput] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isTraining, setIsTraining] = useState(false);

  // Manual Destination Entry
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    city: '',
    state: 'Tamil Nadu',
    category: 'Heritage',
    lat: 10.8,
    lng: 79.1,
    rating: 4.8,
    entryFee: 0,
    description: '',
    vibes: 'Scenic; Peaceful; Mindset Gem',
    spirituality: 75,
    peace: 80,
    adventure: 50,
    heritage: 85,
    foodie: 60,
    nomad: 50,
    nature: 70,
    romance: 60,
    family: 80,
    crowdScore: 35,
  });

  // Archetype selection effect
  function handleSelectArchetype(arch) {
    setSelectedArchetype(arch.id);
    const updated = { ...userMindset, ...(arch.idealVector || {}) };
    setUserMindset(updated);
  }

  // Load mindset recommendations
  useEffect(() => {
    let isMounted = true;
    async function loadRecommendations() {
      setLoadingRecs(true);
      const res = await getMindsetRecommendations(userMindset, mindsetDataset);
      if (isMounted) {
        setRecommendations(res.list);
        setDataSource(res.source);
        setLoadingRecs(false);
      }
    }
    loadRecommendations();
    return () => { isMounted = false; };
  }, [userMindset, mindsetDataset, modelTrainedAt]);

  // Load nearby radar
  useEffect(() => {
    let isMounted = true;
    async function loadRadar() {
      const res = await getNearbyPlaces(userCoords.lat, userCoords.lng, radarRadius, radarCategory, mindsetDataset);
      if (isMounted) {
        setNearbyPlaces(res.places);
      }
    }
    loadRadar();
    return () => { isMounted = false; };
  }, [userCoords, radarRadius, radarCategory, mindsetDataset]);

  // Load reels
  useEffect(() => {
    let isMounted = true;
    async function loadReels() {
      const reels = await getRelatedReels(null, mindsetDataset);
      if (isMounted) {
        setAllReels(reels);
      }
    }
    loadReels();
    return () => { isMounted = false; };
  }, [mindsetDataset]);

  // Handle CSV file upload
  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSVDataset(text);
        uploadCustomDataset(parsed);
        setUploadStatus({ type: 'success', message: `✅ Successfully imported ${parsed.length} destinations into the Mindset Model!` });
        setTimeout(() => setUploadStatus(null), 4000);
      } catch (err) {
        setUploadStatus({ type: 'error', message: `❌ Failed to parse CSV: ${err.message}` });
      }
    };
    reader.readAsText(file);
  }

  // Handle Manual CSV / JSON Paste
  function handlePasteImport() {
    if (!csvInput.trim()) return;
    try {
      if (csvInput.trim().startsWith('[')) {
        const json = JSON.parse(csvInput);
        uploadCustomDataset(json);
        setUploadStatus({ type: 'success', message: `✅ Successfully imported ${json.length} JSON destinations!` });
      } else {
        const parsed = parseCSVDataset(csvInput);
        uploadCustomDataset(parsed);
        setUploadStatus({ type: 'success', message: `✅ Successfully imported ${parsed.length} CSV destinations!` });
      }
      setCsvInput('');
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err) {
      setUploadStatus({ type: 'error', message: `❌ Import error: ${err.message}` });
    }
  }

  // Handle Add Place
  function handleAddManualPlace(e) {
    e.preventDefault();
    if (!newPlace.name.trim()) return;

    const item = {
      id: `manual-${Date.now()}`,
      name: newPlace.name.trim(),
      city: newPlace.city.trim() || 'Tamil Nadu',
      state: newPlace.state,
      lat: parseFloat(newPlace.lat) || 10.5,
      lng: parseFloat(newPlace.lng) || 78.5,
      category: newPlace.category,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
      description: newPlace.description || 'Curated destination for mindset exploration.',
      entryFee: parseInt(newPlace.entryFee || 0, 10),
      rating: parseFloat(newPlace.rating || 4.8),
      vibeTags: newPlace.vibes.split(';').map(t => t.trim()),
      mindsetVector: {
        spirituality: newPlace.spirituality,
        peace: newPlace.peace,
        adventure: newPlace.adventure,
        heritage: newPlace.heritage,
        foodie: newPlace.foodie,
        nomad: newPlace.nomad,
        nature: newPlace.nature,
        romance: newPlace.romance,
        family: newPlace.family,
        crowdScore: newPlace.crowdScore,
      },
      reels: [
        {
          id: `reel-${Date.now()}`,
          title: `Discovering ${newPlace.name} ✨`,
          creator: '@smarttour_local',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
          views: '35K',
          likes: '4.5K',
          song: 'Peaceful Ambient Echoes',
          duration: '0:30'
        }
      ]
    };

    uploadCustomDataset([item]);
    setShowAddForm(false);
    setUploadStatus({ type: 'success', message: `✅ Added "${newPlace.name}" to dataset and retrained model!` });
    setTimeout(() => setUploadStatus(null), 4000);
  }

  // Trigger retrain animation
  function handleRetrain() {
    setIsTraining(true);
    setTimeout(() => {
      retrainModel();
      setIsTraining(false);
      setUploadStatus({ type: 'success', message: '🚀 Model weights re-indexed across all dataset coordinates and mindset vectors!' });
      setTimeout(() => setUploadStatus(null), 3000);
    }, 1200);
  }

  // Download sample CSV
  function handleDownloadCSV() {
    const csvContent = generateSampleCSV(mindsetDataset);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smarttour_mindset_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #091e3a, #2b3a67, #240b36)',
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border)',
        color: '#fff',
      }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button className="back-btn" onClick={() => navigate('/home')}>←</button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🧠 Mindset AI & Geo Radar</span>
              </h1>
              <p style={{ fontSize: 12, color: '#93c5fd' }}>
                AI Destination Matching · Geolocation Radar · Related Reels · Dataset Studio
              </p>
            </div>
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 99,
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#4ade80',
            border: '1px solid rgba(34, 197, 94, 0.4)',
          }}>
            ⚡ AI Active ({mindsetDataset.length} Places)
          </span>
        </div>

        {/* 4 Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 12 }}>
          {[
            { id: 'mindset', label: '🧠 Mindset AI', icon: '🧠' },
            { id: 'radar', label: '📍 Nearby Radar', icon: '📍' },
            { id: 'reels', label: '🎬 Reels Stream', icon: '🎬' },
            { id: 'dataset', label: '📊 Dataset Studio', icon: '📊' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-md)',
                fontSize: 11,
                fontWeight: 700,
                border: activeTab === t.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                background: activeTab === t.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                color: activeTab === t.id ? '#38bdf8' : '#e2e8f0',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16, paddingBottom: 100 }}>

        {/* Global Alert Notification */}
        {uploadStatus && (
          <div style={{
            background: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: uploadStatus.type === 'success' ? '#10b981' : '#ef4444',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
          }}>
            {uploadStatus.message}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: MINDSET AI RECOMMENDER                           */}
        {/* ======================================================== */}
        {activeTab === 'mindset' && (
          <>
            {/* Archetype Selector */}
            <div className="mb-4">
              <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
                1. Select Your Current Mindset & Travel State
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {MINDSET_ARCHETYPES.map(arch => {
                  const isSelected = selectedArchetype === arch.id;
                  return (
                    <div
                      key={arch.id}
                      onClick={() => handleSelectArchetype(arch)}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-lg)',
                        border: `1.5px solid ${isSelected ? arch.color : 'var(--border)'}`,
                        background: isSelected ? `${arch.color}18` : 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        boxShadow: isSelected ? `0 0 16px ${arch.color}30` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{arch.icon}</span>
                        <span style={{ fontWeight: 800, fontSize: 13, color: isSelected ? arch.color : 'var(--text-primary)' }}>
                          {arch.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {arch.tagline}
                      </p>
                      {isSelected && (
                        <span style={{
                          position: 'absolute', top: 8, right: 8,
                          width: 8, height: 8, borderRadius: '50%', background: arch.color
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fine-Tuning Sliders Accordion */}
            <div className="card mb-4" style={{ background: 'var(--bg-card)' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>🎛️ Fine-Tune Mindset Coordinates</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Multi-factor Weights</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>🧘 Peace & Zen</span>
                      <span style={{ fontWeight: 700 }}>{userMindset.peace}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={userMindset.peace}
                      onChange={e => setUserMindset(v => ({ ...v, peace: parseInt(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#06b6d4' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>🧗 Adventure Thrill</span>
                      <span style={{ fontWeight: 700 }}>{userMindset.adventure}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={userMindset.adventure}
                      onChange={e => setUserMindset(v => ({ ...v, adventure: parseInt(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#f43f5e' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>🕉️ Spirituality</span>
                      <span style={{ fontWeight: 700 }}>{userMindset.spirituality}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={userMindset.spirituality}
                      onChange={e => setUserMindset(v => ({ ...v, spirituality: parseInt(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#f59e0b' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>🍜 Foodie Vibe</span>
                      <span style={{ fontWeight: 700 }}>{userMindset.foodie}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={userMindset.foodie}
                      onChange={e => setUserMindset(v => ({ ...v, foodie: parseInt(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation Results */}
            <div className="section-header">
              <div>
                <h2 className="section-title">✨ Top Mindset Recommendations</h2>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Scored via {dataSource === 'backend-server' ? '🚀 Dedicated Server API' : '⚡ Local AI Engine'}
                </div>
              </div>
              <span className="badge badge-info">{recommendations.length} Scored</span>
            </div>

            {loadingRecs ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <span className="spinner" style={{ width: 24, height: 24, marginBottom: 8 }} />
                <div>Computing mindset vector similarity scores...</div>
              </div>
            ) : (
              recommendations.map((dest, idx) => {
                const matchScore = dest.matchPercent || 85;
                const badgeColor = matchScore >= 85 ? '#22c55e' : matchScore >= 70 ? '#38bdf8' : '#eab308';
                return (
                  <div key={dest.id || idx} className="card mb-3" style={{ overflow: 'hidden' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={dest.image}
                        alt={dest.name}
                        style={{ width: '100%', height: 160, objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      {/* Match Badge */}
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: `1.5px solid ${badgeColor}`,
                        color: badgeColor,
                        padding: '4px 10px',
                        borderRadius: 99,
                        fontWeight: 800,
                        fontSize: 12,
                        backdropFilter: 'blur(8px)',
                      }}>
                        ⭐ {matchScore}% Mindset Match
                      </div>

                      <div style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 12,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        backdropFilter: 'blur(4px)',
                      }}>
                        📍 {dest.city}, {dest.state}
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="flex items-center justify-between mb-1">
                        <h3 style={{ fontWeight: 800, fontSize: 16 }}>{dest.name}</h3>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                          {dest.entryFee === 0 ? 'Free Entry' : `₹${dest.entryFee}`}
                        </span>
                      </div>

                      {/* Rationale */}
                      <div style={{
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 12px',
                        marginBottom: 10,
                        fontSize: 12,
                        color: '#38bdf8',
                        fontWeight: 600,
                      }}>
                        💡 {dest.rationale || 'Tailored to your selected mood archetype.'}
                      </div>

                      {/* Vibe Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {(dest.vibeTags || []).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 99,
                              background: 'var(--bg-glass)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {dest.reels && dest.reels.length > 0 && (
                          <button
                            className="btn btn-sm"
                            onClick={() => setActiveReel({ ...dest.reels[0], placeName: dest.name, placeCity: dest.city })}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                              color: '#fff',
                              border: 'none',
                              fontWeight: 700,
                            }}
                          >
                            🎬 Watch Reel
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/destination/${dest.id}`)}
                          style={{ flex: 1 }}
                        >
                          Explore Details →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: NEARBY RADAR & LIVE DISTANCES                    */}
        {/* ======================================================== */}
        {activeTab === 'radar' && (
          <>
            <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
              <div className="card-body">
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📡 Live Geolocation Radar</span>
                  <span style={{ fontSize: 11, color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: 99 }}>
                    ● GPS Active
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Calculating real-time distance and ETA from your current center point:
                </p>

                {/* City Center Selector */}
                <div className="form-group mb-3">
                  <label className="form-label">📍 Current Location Base</label>
                  <select
                    className="form-input"
                    value={`${userCoords.lat},${userCoords.lng}`}
                    onChange={e => {
                      const [lat, lng] = e.target.value.split(',').map(Number);
                      const cityMap = {
                        '9.9195,78.1193': 'Madurai',
                        '13.0827,80.2707': 'Chennai',
                        '11.0168,76.9558': 'Coimbatore',
                        '10.7828,79.1318': 'Thanjavur',
                        '10.2381,77.4892': 'Kodaikanal',
                      };
                      setUserCoords({ lat, lng, cityName: cityMap[`${lat},${lng}`] || 'Custom GPS' });
                    }}
                  >
                    <option value="9.9195,78.1193">Madurai (Central TN)</option>
                    <option value="13.0827,80.2707">Chennai (North TN)</option>
                    <option value="11.0168,76.9558">Coimbatore (West TN)</option>
                    <option value="10.7828,79.1318">Thanjavur (Cauvery Delta)</option>
                    <option value="10.2381,77.4892">Kodaikanal (Hill Range)</option>
                  </select>
                </div>

                {/* Radius Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    <span>Radar Scan Radius:</span>
                    <span style={{ color: 'var(--primary)' }}>{radarRadius} km</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="450"
                    step="10"
                    value={radarRadius}
                    onChange={e => setRadarRadius(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* Radar Results List */}
            <div className="section-header">
              <h2 className="section-title">📍 Nearby Places within {radarRadius} km</h2>
              <span className="badge badge-info">{nearbyPlaces.length} Found</span>
            </div>

            {nearbyPlaces.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                No places within {radarRadius} km. Expand the radar slider above!
              </div>
            ) : (
              nearbyPlaces.map((dest, idx) => (
                <div key={dest.id || idx} className="card mb-3">
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <img
                        src={dest.image}
                        alt={dest.name}
                        style={{ width: 70, height: 70, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <h3 style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {dest.name}
                          </h3>
                          <span style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.15)',
                            padding: '2px 8px',
                            borderRadius: 99,
                            flexShrink: 0,
                          }}>
                            {dest.distanceKm} km
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          {dest.city} · {dest.category}
                        </div>
                        <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                          🚗 {estimateTravelTime(dest.distanceKm)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`, '_blank')}
                        style={{ flex: 1 }}
                      >
                        🧭 Open Navigation
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/destination/${dest.id}`)}
                        style={{ flex: 1 }}
                      >
                        View Guide
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 3: REELS STREAM                                     */}
        {/* ======================================================== */}
        {activeTab === 'reels' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <h2 className="section-title mb-1">🎬 Related Travel Reels</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Watch short-form video vlogs linked to destinations and mindset vibes
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {allReels.map((reel, rIdx) => (
                <div
                  key={reel.id || rIdx}
                  onClick={() => setActiveReel(reel)}
                  style={{
                    position: 'relative',
                    height: 240,
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                    background: '#0f172a',
                  }}
                >
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.4) 100%)',
                  }} />

                  {/* Play icon */}
                  <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: '#fff',
                  }}>
                    ▶
                  </div>

                  {/* Reel Info */}
                  <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, color: '#fff' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', marginBottom: 2 }}>
                      {reel.creator}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {reel.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
                      <span>👁️ {reel.views || '85K'}</span>
                      <span>❤️ {reel.likes || '9K'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 4: DATASET STUDIO & MODEL MANAGER                   */}
        {/* ======================================================== */}
        {activeTab === 'dataset' && (
          <>
            <div className="card mb-4">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: 16 }}>📊 Dataset Studio & Model Trainer</h2>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Manage destination dataset vectors & retrain the Mindset Model
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleRetrain}
                    disabled={isTraining}
                  >
                    {isTraining ? '⚡ Retraining...' : '🚀 Retrain Model'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg-glass)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>{mindsetDataset.length}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Indexed Places</div>
                  </div>
                  <div style={{ background: 'var(--bg-glass)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#10b981' }}>9 Dimensions</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Mindset Vectors</div>
                  </div>
                  <div style={{ background: 'var(--bg-glass)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#f59e0b' }}>v2.4</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Model Version</div>
                  </div>
                </div>

                {/* Upload Options */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                    📁 Upload CSV / JSON File
                    <input type="file" accept=".csv,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                  <button className="btn btn-ghost btn-sm" onClick={handleDownloadCSV}>
                    📥 Export Dataset (.CSV)
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(v => !v)}>
                    ✍️ Add Single Place
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={resetToDefaultDataset} style={{ color: '#ef4444' }}>
                    ↺ Reset Defaults
                  </button>
                </div>

                {/* Paste Dataset Textarea */}
                <div className="form-group mb-0">
                  <label className="form-label">Or Paste CSV / JSON Dataset Data:</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="name,city,state,category,lat,lng,rating,entryFee,peace,adventure,spirituality..."
                    value={csvInput}
                    onChange={e => setCsvInput(e.target.value)}
                    style={{ fontSize: 12, fontFamily: 'monospace' }}
                  />
                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={handlePasteImport}
                    disabled={!csvInput.trim()}
                  >
                    Import & Update Model
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Add Place Form */}
            {showAddForm && (
              <div className="card mb-4">
                <div className="card-body">
                  <h3 style={{ fontWeight: 800, marginBottom: 12 }}>✍️ Add Custom Destination to Dataset</h3>
                  <form onSubmit={handleAddManualPlace}>
                    <div className="grid-2 mb-3">
                      <div className="form-group">
                        <label className="form-label">Destination Name</label>
                        <input
                          className="form-input"
                          required
                          value={newPlace.name}
                          onChange={e => setNewPlace(p => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Yercaud Emerald Lake"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">City / Region</label>
                        <input
                          className="form-input"
                          required
                          value={newPlace.city}
                          onChange={e => setNewPlace(p => ({ ...p, city: e.target.value }))}
                          placeholder="e.g. Salem"
                        />
                      </div>
                    </div>

                    <div className="grid-2 mb-3">
                      <div className="form-group">
                        <label className="form-label">Latitude</label>
                        <input
                          type="number" step="0.0001" className="form-input"
                          value={newPlace.lat}
                          onChange={e => setNewPlace(p => ({ ...p, lat: parseFloat(e.target.value) }))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Longitude</label>
                        <input
                          type="number" step="0.0001" className="form-input"
                          value={newPlace.lng}
                          onChange={e => setNewPlace(p => ({ ...p, lng: parseFloat(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        Save to Dataset & Re-Train
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Dataset Table Preview */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>📋 Active Dataset Table</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '6px' }}>Name</th>
                        <th style={{ padding: '6px' }}>City</th>
                        <th style={{ padding: '6px' }}>Category</th>
                        <th style={{ padding: '6px' }}>Peace</th>
                        <th style={{ padding: '6px' }}>Adv</th>
                        <th style={{ padding: '6px' }}>Spirit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mindsetDataset.map((d, i) => (
                        <tr key={d.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '6px', fontWeight: 600 }}>{d.name}</td>
                          <td style={{ padding: '6px', color: 'var(--text-secondary)' }}>{d.city}</td>
                          <td style={{ padding: '6px' }}>{d.category}</td>
                          <td style={{ padding: '6px', color: '#06b6d4' }}>{d.mindsetVector?.peace || 50}</td>
                          <td style={{ padding: '6px', color: '#f43f5e' }}>{d.mindsetVector?.adventure || 50}</td>
                          <td style={{ padding: '6px', color: '#f59e0b' }}>{d.mindsetVector?.spirituality || 50}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Interactive Reels Modal */}
      {activeReel && (
        <ReelsModal
          reel={activeReel}
          onClose={() => setActiveReel(null)}
        />
      )}
    </div>
  );
}
