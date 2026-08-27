import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function BookingsPage() {
  const navigate = useNavigate();
  const { bookings } = useApp();
  const { user } = useAuth();

  const statusColor = { confirmed: '#10b981', pending: '#eab308', cancelled: '#ef4444' };
  const catIcon = { hotel: '🏨', guide: '🧑‍🏫', food: '🍛', experience: '🏕️', transport: '🚕' };

  const total = bookings.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px 16px 16px' }}>
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={() => navigate('/home')}>←</button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>📅 My Bookings</h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Travel history & upcoming trips</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* Stats */}
        <div className="grid-3 mb-4">
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ fontSize: 18, color: 'var(--accent)' }}>
              ₹{total.toLocaleString('en-IN')}
            </div>
            <div className="stat-label">Total Spent</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ fontSize: 22 }}>
              {bookings.filter((b) => b.status === 'confirmed').length}
            </div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>

        {/* Booking Cards */}
        {bookings.map((b) => (
          <div key={b.id} className="card mb-3">
            <div style={{ display: 'flex', gap: 0 }}>
              <div style={{
                width: 90,
                background: 'var(--bg-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                flexShrink: 0,
                borderRight: '1px solid var(--border)',
              }}>
                {catIcon[b.category] || '📅'}
              </div>
              <div className="card-body" style={{ flex: 1 }}>
                <div className="flex items-start justify-between mb-1">
                  <h3 style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{b.businessName}</h3>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    fontWeight: 600,
                    background: `${statusColor[b.status]}20`,
                    color: statusColor[b.status],
                    border: `1px solid ${statusColor[b.status]}40`,
                    marginLeft: 8,
                    flexShrink: 0,
                  }}>
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted mb-2">
                  <span>📅 {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {b.persons && <span>👥 {b.persons} persons</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 16 }}>₹{b.amount.toLocaleString('en-IN')}</span>
                  <button className="btn btn-ghost btn-sm">View Details</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <p style={{ marginBottom: 16 }}>No bookings yet</p>
            <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>
              Browse Local Businesses
            </button>
          </div>
        )}

        {/* Browse more */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/marketplace')}>
            + Add New Booking
          </button>
        </div>
      </div>
    </div>
  );
}
