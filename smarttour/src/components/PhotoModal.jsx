import { useState } from 'react';

export default function PhotoModal({ photo, onClose, onLike, isLiked, initialLikesCount, initialViewsCount }) {
  const [liked, setLiked] = useState(Boolean(isLiked));
  const [likeCount, setLikeCount] = useState(() => {
    if (typeof initialLikesCount === 'number') return initialLikesCount;
    if (Array.isArray(photo?.likes)) return photo.likes.length;
    if (typeof photo?.likes === 'number') return photo.likes;
    return 86;
  });

  const [viewCount, setViewCount] = useState(() => {
    if (typeof initialViewsCount === 'number') return initialViewsCount + 1;
    if (typeof photo?.views === 'number') return photo.views + 1;
    return 1240;
  });

  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [comments, setComments] = useState(photo?.comments || [
    { id: 1, userName: 'Priya S.', text: 'Such incredible clarity and colors! 📸' }
  ]);
  const [newComment, setNewComment] = useState('');

  if (!photo) return null;

  function toggleLike() {
    if (liked) {
      setLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
    }
    if (onLike) onLike();
  }

  function handleDoubleTap() {
    if (!liked) {
      setLiked(true);
      setLikeCount(c => c + 1);
      if (onLike) onLike();
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  }

  function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), userName: 'You', text: newComment.trim() }]);
    setNewComment('');
  }

  function formatCount(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('en-IN');
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.92)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        maxHeight: '90vh',
        background: '#090d16',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 12,
              color: '#fff',
            }}>
              {photo.userAvatar || photo.userName?.slice(0, 2).toUpperCase() || 'TR'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{photo.userName}</div>
              <div style={{ fontSize: 11, color: '#93c5fd' }}>📍 {photo.destinationName || 'Tamil Nadu'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 10px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
            }}>
              👁️ {formatCount(viewCount)} views
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* High-Res Photo Container */}
        <div
          onDoubleClick={handleDoubleTap}
          style={{ position: 'relative', background: '#000', maxHeight: 420, overflow: 'hidden', cursor: 'pointer' }}
        >
          <img
            src={photo.mediaUrl}
            alt={photo.caption}
            style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block' }}
          />

          {showHeartAnim && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 80,
              animation: 'bounce 0.8s ease',
              filter: 'drop-shadow(0 0 16px rgba(0,0,0,0.8))',
              pointerEvents: 'none',
            }}>
              ❤️
            </div>
          )}
        </div>

        {/* Caption & Actions */}
        <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={toggleLike}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  color: liked ? '#f43f5e' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{liked ? '❤️' : '🤍'}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{formatCount(likeCount)}</span>
              </button>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>💬 {comments.length} comments</span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, marginBottom: 12 }}>
            <strong style={{ color: '#fff', marginRight: 6 }}>{photo.userName}</strong>
            {photo.caption}
          </p>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {comments.map((c, i) => (
              <div key={c.id || i} style={{ fontSize: 12, background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: 8 }}>
                <span style={{ fontWeight: 700, color: '#38bdf8', marginRight: 6 }}>{c.userName || c.user}</span>
                <span style={{ color: '#cbd5e1' }}>{c.text}</span>
              </div>
            ))}
          </div>

          {/* Inline Comment Input */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8 }}>
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a public comment…"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 99,
                padding: '8px 14px',
                color: '#fff',
                fontSize: 12,
              }}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              style={{
                background: 'var(--grad-primary)',
                border: 'none',
                borderRadius: 99,
                padding: '8px 14px',
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
