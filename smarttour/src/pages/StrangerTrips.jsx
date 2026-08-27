import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  { id: 'all', label: '🎒 All Trips' },
  { id: 'Trekking', label: '🥾 Trekking' },
  { id: 'Photography', label: '📸 Photography' },
  { id: 'Roadtrip', label: '🚗 Roadtrip' },
  { id: 'Food Trail', label: '🍢 Food Trail' },
  { id: 'Adventure', label: '🛶 Adventure' },
];

const TN_DEST_OPTIONS = [
  { id: 'dest-tn-g', name: 'Kodaikanal Lake & Hills', city: 'Kodaikanal', image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80' },
  { id: 'dest-03', name: 'Mahabalipuram Shore Temple', city: 'Mahabalipuram', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80' },
  { id: 'dest-tn-d', name: 'Pamban Bridge & Dhanushkodi', city: 'Rameswaram', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' },
  { id: 'dest-11', name: 'Meenakshi Temple & Food Trail', city: 'Madurai', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80' },
  { id: 'dest-tn-i', name: 'Hogenakkal Falls', city: 'Dharmapuri', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
  { id: 'dest-09', name: 'Ooty Botanical Garden & Tea Hills', city: 'Ooty', image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80' },
  { id: 'dest-tn-e', name: 'Kanyakumari Land\'s End', city: 'Kanyakumari', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
  { id: 'dest-tn-k', name: 'Chettinad Heritage Village', city: 'Karaikudi', image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&q=80' },
];

export default function StrangerTrips() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { strangerTrips, joinStrangerTrip, leaveStrangerTrip, createStrangerTrip, sendTripMessage } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState(null); // for chat & itinerary modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [joinedSuccess, setJoinedSuccess] = useState(null);

  // New Trip form state
  const [formTitle, setFormTitle] = useState('');
  const [formDestId, setFormDestId] = useState('dest-tn-g');
  const [formCategory, setFormCategory] = useState('Trekking');
  const [formDate, setFormDate] = useState('This Weekend');
  const [formTime, setFormTime] = useState('6:00 AM');
  const [formMeetingPoint, setFormMeetingPoint] = useState('');
  const [formCost, setFormCost] = useState('800');
  const [formMax, setFormMax] = useState('6');
  const [formVibe, setFormVibe] = useState('🥾 Adventure & Photography');
  const [formDesc, setFormDesc] = useState('');

  const currentUserId = user?.id || 'user-demo-01';

  const filteredTrips = strangerTrips.filter(t => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  function handleJoin(trip) {
    joinStrangerTrip(trip.id, user || { id: currentUserId, name: 'Arjun Mehta', avatar: 'AM' });
    setJoinedSuccess(trip.id);
    setTimeout(() => setJoinedSuccess(null), 3000);
  }

  function handleCreateTrip(e) {
    e.preventDefault();
    const dest = TN_DEST_OPTIONS.find(d => d.id === formDestId) || TN_DEST_OPTIONS[0];

    const newTrip = createStrangerTrip({
      title: formTitle.trim() || `${dest.name} Squad Trip`,
      destinationId: dest.id,
      destinationName: dest.name,
      city: dest.city,
      image: dest.image,
      hostId: currentUserId,
      hostName: user?.name || 'Explorer',
      hostAvatar: user?.avatar || user?.name?.slice(0, 2) || 'EX',
      category: formCategory,
      date: formDate,
      time: formTime,
      meetingPoint: formMeetingPoint.trim() || `${dest.city} Main Bus Stand`,
      maxMembers: parseInt(formMax, 10) || 6,
      costPerPerson: parseInt(formCost, 10) || 750,
      vibe: formVibe,
      description: formDesc.trim() || `Join us for an exciting trip to ${dest.name} in ${dest.city}!`,
      highlights: [`Explore ${dest.name}`, 'Shared Transport & Meals', 'Group Photography', 'Local Food Stop'],
    });

    setShowCreateModal(false);
    setSelectedTrip(newTrip);
  }

  function handleSendSquadMessage() {
    if (!chatInput.trim() || !selectedTrip) return;
    sendTripMessage(
      selectedTrip.id,
      user || { id: currentUserId, name: 'You', avatar: 'ME' },
      chatInput.trim()
    );
    setChatInput('');
  }

  // Active trip details live sync
  const activeTripData = selectedTrip ? (strangerTrips.find(t => t.id === selectedTrip.id) || selectedTrip) : null;

  return (
    <div className="page animate-in" style={{ paddingBottom: 110 }}>
      {/* Highlighting Spotlight Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #311042, #4c0519)',
        borderBottom: '1px solid rgba(244,63,94,0.3)',
        padding: '24px 16px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'radial-gradient(circle, rgba(244,63,94,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button className="back-btn" onClick={() => navigate('/home')}>←</button>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(244,63,94,0.2)',
              border: '1px solid rgba(244,63,94,0.4)',
              borderRadius: 99,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 800,
              color: '#fda4af',
              letterSpacing: 0.5,
            }}>
              🔥 HIGH-DEMAND SOCIAL FEATURE
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              border: 'none',
              borderRadius: 99,
              padding: '7px 14px',
              color: '#fff',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(244,63,94,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>➕</span> Host Trip
          </button>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
          🎒 Stranger Trips <span style={{ fontSize: 16, color: '#f43f5e' }}>TN</span>
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, maxWidth: 440 }}>
          Solo traveler? Connect with verified travelers across Tamil Nadu to split cabs, share itineraries, and explore together safely!
        </p>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 16, paddingBottom: 2 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: `1px solid ${activeCategory === cat.id ? '#f43f5e' : 'rgba(255,255,255,0.15)'}`,
                background: activeCategory === cat.id ? 'rgba(244,63,94,0.25)' : 'rgba(255,255,255,0.06)',
                color: activeCategory === cat.id ? '#fda4af' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 18 }}>

        {joinedSuccess && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08))',
            border: '1px solid rgba(16,185,129,0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            marginBottom: 16,
            color: '#34d399',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>🎉</span>
            <div>
              <div>You're in the squad! +35 XP earned</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>Open the trip lobby to coordinate with your fellow strangers.</div>
            </div>
          </div>
        )}

        {/* Trips Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredTrips.map(trip => {
            const isJoined = (trip.members || []).some(m => m.id === currentUserId);
            const isHost = trip.hostId === currentUserId;
            const slotsLeft = trip.maxMembers - (trip.members?.length || 0);
            const isFull = slotsLeft <= 0;
            const progressPercent = ((trip.members?.length || 0) / trip.maxMembers) * 100;

            return (
              <div
                key={trip.id}
                style={{
                  background: 'var(--bg-card)',
                  border: isJoined ? '1.5px solid rgba(244,63,94,0.5)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: isJoined ? '0 4px 20px rgba(244,63,94,0.12)' : 'none',
                }}
              >
                {/* Trip Header Image & Badges */}
                <div style={{ position: 'relative', height: 160 }}>
                  <img
                    src={trip.image}
                    alt={trip.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.85))' }} />

                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                    <span style={{
                      background: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(4px)',
                      color: '#fda4af',
                      border: '1px solid rgba(244,63,94,0.4)',
                      borderRadius: 99,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {trip.vibe}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span style={{
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fbbf24',
                      borderRadius: 99,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 800,
                    }}>
                      ₹{trip.costPerPerson} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>/ head</span>
                    </span>
                  </div>

                  <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 2 }}>
                      {trip.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                      <span>📍 {trip.city}</span>
                      <span>•</span>
                      <span>📅 {trip.date} ({trip.time})</span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                    {trip.description}
                  </p>

                  {/* Highlights Pill */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {trip.highlights?.map((h, i) => (
                      <span key={i} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '3px 8px',
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                      }}>
                        ✓ {h}
                      </span>
                    ))}
                  </div>

                  {/* Slots & Members Roster */}
                  <div style={{
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    marginBottom: 14,
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: isFull ? '#ef4444' : '#10b981' }}>
                        👥 {trip.members?.length || 0}/{trip.maxMembers} Strangers Joined
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {isFull ? 'Squad Full' : `${slotsLeft} slot${slotsLeft > 1 ? 's' : ''} left`}
                      </span>
                    </div>

                    {/* Progress */}
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: isFull ? '#ef4444' : 'linear-gradient(90deg, #f43f5e, #fbbf24)',
                        borderRadius: 99,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>

                    {/* Avatars */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {trip.members?.map((m, i) => (
                          <div
                            key={m.id || i}
                            title={`${m.name} (${m.role})`}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: m.role === 'Host' ? '#f43f5e' : 'var(--primary)',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginLeft: i === 0 ? 0 : -8,
                              border: '2px solid var(--bg-card)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                          >
                            {m.avatar}
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Host: <strong style={{ color: 'var(--text-primary)' }}>{trip.hostName}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!isJoined ? (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={isFull}
                        onClick={() => handleJoin(trip)}
                        style={{
                          flex: 1,
                          background: isFull ? 'var(--bg-glass)' : 'linear-gradient(135deg, #f43f5e, #e11d48)',
                          border: isFull ? '1px solid var(--border)' : 'none',
                          fontWeight: 800,
                        }}
                      >
                        {isFull ? '🔒 Squad Full' : '🎒 Join This Stranger Trip'}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => setSelectedTrip(trip)}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 800,
                          }}
                        >
                          💬 Squad Lobby ({trip.chatMessages?.length || 0})
                        </button>
                        {!isHost && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => leaveStrangerTrip(trip.id, currentUserId)}
                            style={{ fontSize: 11, color: '#ef4444' }}
                          >
                            Leave
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedTrip(trip)}
                      style={{ padding: '0 12px', fontSize: 12 }}
                    >
                      ℹ️ Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL: TRIP DETAILS & SQUAD CHAT LOBBY ── */}
      {activeTripData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border)',
            borderRadius: '24px 24px 0 0',
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-secondary)',
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{activeTripData.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  📍 {activeTripData.meetingPoint} · 📅 {activeTripData.date}
                </div>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  color: '#fff',
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >✕</button>
            </div>

            {/* Modal Body / Chat & Squad */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Meeting Point Alert */}
              <div style={{
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 12,
                color: '#fda4af',
              }}>
                📍 <strong>Meeting Point:</strong> {activeTripData.meetingPoint} ({activeTripData.time})
              </div>

              {/* Members in Squad */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Squad Travelers ({activeTripData.members?.length || 0}/{activeTripData.maxMembers})
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {activeTripData.members?.map(m => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border)',
                        borderRadius: 99,
                        padding: '4px 10px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.role === 'Host' ? '#f43f5e' : 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {m.avatar}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{m.name}</span>
                      {m.role === 'Host' && <span style={{ fontSize: 9, background: 'rgba(244,63,94,0.2)', color: '#f43f5e', padding: '1px 5px', borderRadius: 99 }}>Host</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderBottom: '1px solid var(--border)', margin: '4px 0' }} />

              {/* Live Squad Messages */}
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>💬</span> Squad Group Chat
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 160 }}>
                {(!activeTripData.chatMessages || activeTripData.chatMessages.length === 0) ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 13 }}>
                    No messages yet. Break the ice and say hi to the squad! 👋
                  </div>
                ) : (
                  activeTripData.chatMessages.map(msg => {
                    const isMe = msg.senderId === currentUserId;
                    const isSys = msg.senderId === 'system';

                    if (isSys) {
                      return (
                        <div key={msg.id} style={{ textAlign: 'center', fontSize: 11, color: '#34d399', margin: '4px 0' }}>
                          {msg.text}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: isMe ? 'row-reverse' : 'row',
                          alignItems: 'flex-end',
                          gap: 6,
                        }}
                      >
                        {!isMe && (
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {msg.senderAvatar || msg.senderName?.slice(0, 2) || 'U'}
                          </div>
                        )}
                        <div style={{ maxWidth: '75%' }}>
                          {!isMe && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, marginLeft: 4 }}>{msg.senderName}</div>}
                          <div style={{
                            padding: '8px 12px',
                            borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            background: isMe ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'var(--bg-card)',
                            border: isMe ? 'none' : '1px solid var(--border)',
                            color: '#fff',
                            fontSize: 13,
                            lineHeight: 1.4,
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Input */}
            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8,
            }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendSquadMessage()}
                placeholder="Message the squad…"
                style={{
                  flex: 1,
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border)',
                  borderRadius: 99,
                  padding: '9px 14px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
              />
              <button
                onClick={handleSendSquadMessage}
                disabled={!chatInput.trim()}
                style={{
                  background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  border: 'none',
                  borderRadius: 99,
                  padding: '0 16px',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: chatInput.trim() ? 'pointer' : 'default',
                  opacity: chatInput.trim() ? 1 : 0.5,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE A STRANGER TRIP ── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
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
            maxWidth: 480,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900 }}>🎒 Host a Stranger Trip</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Invite random travelers across Tamil Nadu to join your itinerary</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateTrip}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Trip Title *
                </label>
                <input
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Ooty Pine Forest Sunrise Trek & Camp"
                  style={{ width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Destination (Tamil Nadu)
                </label>
                <select
                  value={formDestId}
                  onChange={e => setFormDestId(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 8px', color: 'var(--text-primary)', fontSize: 13 }}
                >
                  {TN_DEST_OPTIONS.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 8px', color: 'var(--text-primary)', fontSize: 13 }}
                  >
                    <option value="Trekking">🥾 Trekking</option>
                    <option value="Photography">📸 Photography</option>
                    <option value="Roadtrip">🚗 Roadtrip</option>
                    <option value="Food Trail">🍢 Food Trail</option>
                    <option value="Adventure">🛶 Adventure</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Squad Size Limit
                  </label>
                  <select
                    value={formMax}
                    onChange={e => setFormMax(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 8px', color: 'var(--text-primary)', fontSize: 13 }}
                  >
                    <option value="4">4 Strangers</option>
                    <option value="5">5 Strangers</option>
                    <option value="6">6 Strangers</option>
                    <option value="8">8 Strangers</option>
                    <option value="10">10 Strangers</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Date
                  </label>
                  <input
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    placeholder="e.g. This Saturday"
                    style={{ width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Estimated ₹ / Person
                  </label>
                  <input
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    placeholder="e.g. 850"
                    type="number"
                    style={{ width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Meeting Point & Time
                </label>
                <input
                  value={formMeetingPoint}
                  onChange={e => setFormMeetingPoint(e.target.value)}
                  placeholder="e.g. Ooty Central Bus Stand Coffee Cafe (6:30 AM)"
                  style={{ width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Trip Plan & Vibe
                </label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Describe your plan, what to bring, and what kind of travelers should join…"
                  rows={3}
                  style={{ width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', fontWeight: 800 }}
              >
                🚀 Post Stranger Trip (+50 XP)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
