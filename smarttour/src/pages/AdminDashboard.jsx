import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ADMIN_ANALYTICS, WASTE_DATA, DESTINATIONS, REPORTS } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import { getCrowdLevel } from '../utils/crowdEngine';
import { getWeeklyWasteForecast } from '../utils/wasteEngine';

const COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f97316', '#ef4444', '#fbbf24'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { pendingRequests, approveRequest, rejectRequest, user, accounts } = useAuth();
  const { emergencyRequests, posts, stories, messages, deletePost, deleteStory, deleteMessage } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const wasteWeekly = getWeeklyWasteForecast();

  const pendingCount = pendingRequests.filter(r => r.status === 'pending').length;
  const reviewedRequests = pendingRequests.filter(r => r.status !== 'pending');

  const analytics = ADMIN_ANALYTICS;

  const kpiCards = [
    { label: "Today's Tourists", value: analytics.todayTourists.toLocaleString('en-IN'), icon: '👥', color: 'var(--primary)', change: '+12% vs yesterday' },
    { label: 'Critical Destinations', value: analytics.criticalDestinations, icon: '🔴', color: '#ef4444', change: '3 need action' },
    { label: 'Waste Forecast', value: `${analytics.wasteForecast}T`, icon: '🗑️', color: '#f97316', change: '⚠️ Over capacity' },
    { label: 'Emergency Requests', value: emergencyRequests.length, icon: '🚨', color: '#ef4444', change: `${emergencyRequests.filter(r => r.status !== 'resolved').length} active now` },
    { label: 'Verified Businesses', value: analytics.verifiedBusinesses, icon: '✅', color: 'var(--accent)', change: '+14 this week' },
    { label: 'Reported Scams', value: analytics.reportedScams, icon: '🚩', color: '#eab308', change: '3 under review' },
  ];

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900 }}>🏛️ Municipality Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="live-dot"></div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live · Tripzy Admin</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>👤</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '12px 16px 0', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="chip-row">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'users', label: '👥 Users' },
            { id: 'crowd', label: '👥 Crowd' },
            { id: 'waste', label: '🗑️ Waste' },
            { id: 'sos', label: '🚨 Live SOS', badge: emergencyRequests.filter(r => r.status !== 'resolved').length },
            { id: 'moderation', label: '🛡️ Moderation' },
            { id: 'requests', label: '📋 Requests', badge: pendingCount },
          ].map((t) => (
            <button key={t.id} className={`chip ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)} style={{ position: 'relative' }}>
              {t.label}
              {t.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239,68,68,0.5)',
                  animation: 'pulse 2s infinite',
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {kpiCards.map((card) => (
                <div key={card.label} className="stat-card">
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 20 }}>{card.icon}</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: card.color }}>{card.value}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{card.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{card.change}</div>
                </div>
              ))}
            </div>

            {/* Weekly Tourist Trend */}
            <div className="card mb-4">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>📈 Weekly Tourist Footfall</div>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={analytics.weeklyLabels.map((d, i) => ({ day: d, tourists: analytics.weeklyTrend[i] }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="touristGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v.toLocaleString('en-IN'), 'Tourists']} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="tourists" stroke="#0ea5e9" strokeWidth={2} fill="url(#touristGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Business Revenue by Category */}
            <div className="card mb-4">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>💰 Tourism Revenue by Category</div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={analytics.businessRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [`₹${(v / 1000).toFixed(0)}K`, 'Revenue']} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {analytics.businessRevenue.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Most / Under Visited */}
            <div className="grid-2 mb-4">
              <div className="card">
                <div className="card-body">
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: '#ef4444' }}>🔴 Overcrowded</div>
                  {analytics.mostVisited.map((d, i) => (
                    <div key={d} style={{ fontSize: 12, padding: '4px 0', borderBottom: i < analytics.mostVisited.length - 1 ? '1px solid var(--border)' : 'none', color: 'var(--text-secondary)' }}>
                      {i + 1}. {d}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: '#22c55e' }}>🟢 Under-Visited</div>
                  {analytics.underVisited.map((d, i) => (
                    <div key={d} style={{ fontSize: 12, padding: '4px 0', borderBottom: i < analytics.underVisited.length - 1 ? '1px solid var(--border)' : 'none', color: 'var(--text-secondary)' }}>
                      {i + 1}. {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab: Users */}
        {activeTab === 'users' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div className="stat-card" style={{ background: 'rgba(14,165,233,0.1)', borderColor: 'rgba(14,165,233,0.3)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Registered Users</div>
                <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--primary)' }}>{accounts.length}</div>
              </div>
              <div className="stat-card" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Verified Businesses</div>
                <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--accent)' }}>{accounts.filter(a => a.role === 'business').length}</div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 style={{ fontWeight: 700, marginBottom: 12 }}>👥 User Accounts Database</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
                  {accounts.map(acc => (
                    <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>
                        {acc.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{acc.name}</div>
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', textTransform: 'capitalize' }}>
                            {acc.role}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: <code style={{ color: '#38bdf8' }}>{acc.id}</code></div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {acc.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab: Crowd */}
        {activeTab === 'crowd' && (
          <>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>👥 Destination Capacity Status</h2>
            {DESTINATIONS.slice(0, 8).map((dest) => {
              const level = getCrowdLevel(dest.crowdScore);
              const capPct = Math.round((dest.currentVisitors / dest.maxCapacity) * 100);
              return (
                <div key={dest.id} className="card mb-3">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{dest.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{dest.city} · Max: {dest.maxCapacity.toLocaleString('en-IN')}</div>
                      </div>
                      <span className={`crowd-badge ${level.textColor}`}>{level.icon} {level.label}</span>
                    </div>
                    <div className="progress-bar mb-1" style={{ height: 8 }}>
                      <div className="progress-fill" style={{ width: `${capPct}%`, background: level.color }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>{dest.currentVisitors.toLocaleString('en-IN')} current</span>
                      <span style={{ fontWeight: 600, color: level.color }}>{capPct}%</span>
                    </div>
                    {capPct >= 80 && (
                      <div style={{ marginTop: 8 }}>
                        <button className="btn btn-danger btn-sm">⚠️ Send Alert</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Tab: Waste */}
        {activeTab === 'waste' && (
          <>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>🗑️ Waste Prediction Dashboard</h2>

            {/* Summary alert */}
            <div className="alert-card danger mb-4">
              <span style={{ fontSize: 24 }}>🗑️</span>
              <div>
                <div style={{ fontWeight: 700 }}>Total Waste Forecast Today: {analytics.wasteForecast} tonnes</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>2.2 tonnes above current collection capacity. Action required.</div>
              </div>
            </div>

            {/* Weekly waste chart */}
            <div className="card mb-4">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>📊 Weekly Waste Forecast</div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={wasteWeekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}T`, 'Waste']} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="waste" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Per-destination waste */}
            {WASTE_DATA.map((w) => (
              <div key={w.destinationId} className="card mb-3">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-2">
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{w.destinationName}</div>
                    <span className={`badge ${w.status === 'critical' ? 'badge-danger' : w.status === 'high' ? 'badge-warning' : 'badge-info'}`}>
                      {w.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2 text-sm text-muted">
                    <span>Expected: {w.expectedVisitors.toLocaleString('en-IN')} visitors</span>
                    <span>⚖️ {w.expectedWaste}T waste</span>
                  </div>
                  <div className="progress-bar mb-1" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, (w.expectedWaste / w.collectionCapacity) * 80)}%`, background: w.status === 'critical' ? '#ef4444' : w.status === 'high' ? '#f97316' : '#eab308' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Collection cap: {w.collectionCapacity}T</span>
                    <span style={{ color: w.expectedWaste > w.collectionCapacity ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                      {w.expectedWaste > w.collectionCapacity ? `+${(w.expectedWaste - w.collectionCapacity).toFixed(1)}T overload` : 'Within capacity'}
                    </span>
                  </div>
                  {w.expectedWaste > w.collectionCapacity && (
                    <button className="btn btn-danger btn-sm mt-2">📋 Allocate Extra Collection</button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Tab: Reports */}
        {activeTab === 'reports' && (
          <>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>🚩 Reported Incidents</h2>
            {REPORTS.map((r) => (
              <div key={r.id} className="card mb-3">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className={`badge ${r.severity === 'high' ? 'badge-danger' : r.severity === 'medium' ? 'badge-warning' : 'badge-info'}`}>{r.type}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(r.timestamp).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>📍 {r.location}</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{r.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`badge ${r.status === 'resolved' ? 'badge-verified' : r.status === 'escalated' ? 'badge-danger' : 'badge-warning'}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost btn-sm">Review</button>
                      {r.status !== 'resolved' && <button className="btn btn-danger btn-sm">Escalate</button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Tab: Requests */}
        {activeTab === 'requests' && (
          <>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>📋 Role Registration Requests</h2>

            {/* Pending Requests */}
            {pendingRequests.filter(r => r.status === 'pending').length === 0 ? (
              <div className="card mb-4">
                <div className="card-body" style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No Pending Requests</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All registration requests have been reviewed.</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                  ⏳ Pending Approval ({pendingRequests.filter(r => r.status === 'pending').length})
                </div>
                {pendingRequests.filter(r => r.status === 'pending').map(req => {
                  const roleColor = req.role === 'admin' ? '#8b5cf6' : '#ef4444';
                  const roleEmoji = req.role === 'admin' ? '🏛️' : '🚨';
                  return (
                    <div key={req.id} className="card mb-3" style={{ border: `1px solid ${roleColor}30` }}>
                      <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: `${roleColor}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            fontWeight: 800,
                            color: roleColor,
                            flexShrink: 0,
                          }}>
                            {req.avatar}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontWeight: 800, fontSize: 15 }}>{req.name}</span>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 99,
                                background: `${roleColor}18`,
                                color: roleColor,
                                textTransform: 'capitalize',
                              }}>
                                {roleEmoji} {req.role}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{req.email}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>📍 {req.location}</div>
                          </div>
                        </div>

                        {req.bio && (
                          <div style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                            padding: '8px 10px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 8,
                            marginBottom: 12,
                          }}>
                            "{req.bio}"
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            🕐 {new Date(req.requestedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-sm"
                              onClick={() => rejectRequest(req.id)}
                              style={{
                                background: 'rgba(239,68,68,0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 99,
                                padding: '6px 14px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ❌ Reject
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => approveRequest(req.id)}
                              style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 99,
                                padding: '6px 14px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                              }}
                            >
                              ✅ Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Reviewed History */}
            {reviewedRequests.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 10 }}>
                  📜 Review History ({reviewedRequests.length})
                </div>
                {reviewedRequests.map(req => {
                  const isApproved = req.status === 'approved';
                  const statusColor = isApproved ? '#10b981' : '#ef4444';
                  const roleColor = req.role === 'admin' ? '#8b5cf6' : '#ef4444';
                  const roleEmoji = req.role === 'admin' ? '🏛️' : '🚨';
                  return (
                    <div key={req.id} className="card mb-3" style={{ opacity: 0.75 }}>
                      <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: `${roleColor}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 15,
                            fontWeight: 800,
                            color: roleColor,
                            flexShrink: 0,
                          }}>
                            {req.avatar}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: 13 }}>{req.name}</span>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 99,
                                background: `${roleColor}18`,
                                color: roleColor,
                              }}>
                                {roleEmoji} {req.role}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {req.reviewedBy ? `Reviewed by ${req.reviewedBy}` : ''}
                              {req.reviewedAt ? ` · ${new Date(req.reviewedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}` : ''}
                            </div>
                          </div>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 99,
                            background: `${statusColor}15`,
                            color: statusColor,
                            textTransform: 'capitalize',
                          }}>
                            {isApproved ? '✅ Approved' : '❌ Rejected'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* Tab: Live SOS */}
        {activeTab === 'sos' && (
          <>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>🚨 Live Emergency Tracking</h2>
            {emergencyRequests.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No emergencies reported.</div>
            )}
            {emergencyRequests.map(req => (
              <div key={req.id} className="card mb-3" style={{ borderLeft: `4px solid ${req.status === 'resolved' ? '#10b981' : '#ef4444'}` }}>
                <div className="card-body">
                  <div className="flex items-center justify-between mb-2">
                    <div style={{ fontWeight: 700 }}>{req.touristName} · {req.type}</div>
                    <span className="badge" style={{ background: req.status === 'resolved' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: req.status === 'resolved' ? '#10b981' : '#ef4444' }}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📍 {req.location}</div>
                  <div style={{ fontSize: 13, marginTop: 8 }}>{req.description}</div>
                  {req.status === 'resolved' && (
                    <div style={{ fontSize: 11, color: '#10b981', marginTop: 8, fontWeight: 700 }}>✅ Resolved by Responder</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Tab: Content Moderation */}
        {activeTab === 'moderation' && (
          <>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>🛡️ Platform Moderation</h2>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Review and remove any inappropriate content across the platform. Auto-filters are active.
            </div>
            
            {/* Posts */}
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>POSTS</div>
            {posts.map(p => (
              <div key={p.id} className="card mb-3">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title || 'Untitled'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>By: {p.authorName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.caption}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deletePost(p.id)}>🗑️ Takedown</button>
                </div>
              </div>
            ))}

            {/* Stories */}
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-muted)', marginBottom: 8, marginTop: 16 }}>STORIES</div>
            {stories.map(s => (
              <div key={s.id} className="card mb-3">
                <div className="card-body flex items-center justify-between">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Story by {s.userName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Location: {s.location}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Caption: {s.caption}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteStory(s.id)}>🗑️ Takedown</button>
                </div>
              </div>
            ))}

            {/* Chats (Flattened for admin view) */}
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-muted)', marginBottom: 8, marginTop: 16 }}>PRIVATE CHATS</div>
            {Object.entries(messages).map(([convId, msgs]) => 
              msgs.map(m => (
                <div key={m.id} className="card mb-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="card-body flex items-center justify-between">
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>From: {m.senderName} ({m.senderId})</div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>"{m.text}"</div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteMessage(convId, m.id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
