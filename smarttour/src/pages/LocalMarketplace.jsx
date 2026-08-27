import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUSINESSES } from '../data/mockData';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏪' },
  { id: 'food', label: 'Food', icon: '🍴' },
  { id: 'hotel', label: 'Hotels', icon: '🏨' },
  { id: 'transport', label: 'Transport', icon: '🚕' },
  { id: 'guide', label: 'Guides', icon: '🧑‍🏫' },
  { id: 'handicraft', label: 'Handicrafts', icon: '🎨' },
  { id: 'experience', label: 'Experiences', icon: '🏕️' },
];

export default function LocalMarketplace() {
  const navigate = useNavigate();
  const { addBooking } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingBiz, setBookingBiz] = useState(null);
  const [booked, setBooked] = useState(null);

  const filtered = BUSINESSES.filter((b) => {
    const matchCat = activeCategory === 'all' || b.category === activeCategory;
    const matchSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleBook(biz) {
    const booking = {
      id: `book-${Date.now()}`,
      businessId: biz.id,
      businessName: biz.name,
      category: biz.category,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      amount: biz.avgCost,
      status: 'confirmed',
      persons: 1,
      image: biz.image,
    };
    addBooking(booking);
    setBooked(biz.name);
    setBookingBiz(null);
    setTimeout(() => setBooked(null), 3000);
  }

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px 16px 12px' }}>
        <div className="flex items-center gap-3 mb-3">
          <button className="back-btn" onClick={() => navigate('/home')}>←</button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>🏪 Local Marketplace</h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Verified local businesses & services</p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search businesses, city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        {/* Categories */}
        <div className="chip-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Booked Toast */}
      {booked && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 'var(--radius-full)',
          fontWeight: 700,
          zIndex: 500,
          fontSize: 14,
          boxShadow: 'var(--shadow-lg)',
          animation: 'fade-in 0.3s ease',
        }}>
          ✅ Booked: {booked}!
        </div>
      )}

      <div className="container" style={{ paddingTop: 16 }}>
        {/* Count */}
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> verified businesses
        </div>

        {filtered.map((biz) => (
          <div key={biz.id} className="card mb-3">
            <img src={biz.image} alt={biz.name} className="card-img-sm" onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="card-body">
              {/* Name + Badge */}
              <div className="flex items-start justify-between mb-2">
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 style={{ fontWeight: 700, fontSize: 15 }}>{biz.name}</h3>
                    {biz.verified && <span className="badge badge-verified">✅ Verified</span>}
                    {biz.badge && <span className="badge badge-info">{biz.badge}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {biz.type} · {biz.city}, {biz.state}
                  </div>
                </div>
              </div>

              {/* Rating & Price */}
              <div className="flex items-center gap-3 mb-2">
                <span className="rating">⭐ {biz.rating}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>({biz.reviews.toLocaleString('en-IN')} reviews)</span>
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{biz.priceRange}</span>
              </div>

              {/* Info row */}
              <div className="flex items-center gap-3 mb-3 text-sm text-muted">
                <span>📍 {biz.distance} km</span>
                <span>🕐 {biz.openHours}</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                {biz.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {biz.tags?.slice(0, 4).map((t) => <span key={t} className="tag">{t}</span>)}
              </div>

              {/* Actions */}
              <div className="grid-2">
                <a href={`tel:${biz.phone}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                  📞 Call
                </a>
                <button className="btn btn-accent btn-sm" onClick={() => setBookingBiz(biz)}>
                  📅 Book Now
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p>No businesses found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingBiz && (
        <div className="modal-overlay" onClick={() => setBookingBiz(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>📅 Book {bookingBiz.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Confirm your booking</p>

            <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Service</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{bookingBiz.type}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Date</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{new Date(Date.now() + 86400000).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Price range</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--accent)' }}>{bookingBiz.priceRange}</span>
              </div>
              <div className="divider" style={{ margin: '8px 0' }}></div>
              <div className="flex items-center justify-between">
                <span style={{ fontWeight: 700 }}>Estimated Amount</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>₹{bookingBiz.avgCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button className="btn btn-accent btn-full btn-lg" onClick={() => handleBook(bookingBiz)}>
              ✅ Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
