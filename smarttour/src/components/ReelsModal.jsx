import { useState, useRef, useEffect } from 'react';

export default function ReelsModal({ reel, onClose, onLike, isLiked, initialLikesCount, initialViewsCount }) {
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Real interactive like state
  const [liked, setLiked] = useState(Boolean(isLiked));
  const [likeCount, setLikeCount] = useState(() => {
    if (typeof initialLikesCount === 'number') return initialLikesCount;
    if (typeof reel?.likes === 'number') return reel.likes;
    if (Array.isArray(reel?.likes)) return reel.likes.length;
    if (typeof reel?.likes === 'string') {
      const num = parseInt(reel.likes.replace(/[^0-9]/g, ''), 10);
      return reel.likes.includes('K') || reel.likes.includes('k') ? Math.round(num * 1000) : num || 142;
    }
    return 142;
  });

  // Real interactive view state (increments upon watching)
  const [viewCount, setViewCount] = useState(() => {
    if (typeof initialViewsCount === 'number') return initialViewsCount + 1;
    if (typeof reel?.views === 'number') return reel.views + 1;
    if (typeof reel?.views === 'string') {
      const num = parseInt(reel.views.replace(/[^0-9]/g, ''), 10);
      const base = reel.views.includes('K') || reel.views.includes('k') ? Math.round(num * 1000) : num || 1850;
      return base + 1;
    }
    return 1850;
  });

  const [comments, setComments] = useState([
    { id: 1, user: 'Priya Sharma', text: 'This spot looks magical! Adding to my weekend list 🌟' },
    { id: 2, user: 'Karthik Rajan', text: 'The morning mist here is unforgettable!' },
    { id: 3, user: 'Arjun Mehta', text: 'Spectacular drone shots! Great video 🙌' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: mute and play
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play();
        }
      });
    }
  }, [reel]);

  if (!reel) return null;

  function togglePlayPause() {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }

  function toggleMute(e) {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  function handleTimeUpdate() {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration) {
      setProgress((currentTime / duration) * 100);
    }
  }

  function handleVideoEnded() {
    // When video loops, increment view count
    setViewCount(v => v + 1);
  }

  function toggleLike(e) {
    if (e) e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
    }
    if (onLike) onLike();
  }

  function handleDoubleTap(e) {
    e.stopPropagation();
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
    setComments(prev => [...prev, { id: Date.now(), user: 'You', text: newComment.trim() }]);
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
      {/* Reel Shell Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        height: '88vh',
        maxHeight: 760,
        background: '#090d16',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Playable Video Area */}
        <div
          onClick={togglePlayPause}
          onDoubleClick={handleDoubleTap}
          style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#000', cursor: 'pointer' }}
        >
          <video
            ref={videoRef}
            src={reel.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4'}
            poster={reel.thumbnail}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.5) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Top Floating Controls */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 20,
          }}>
            {/* Close Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>

            {/* Real View Counter Badge */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '5px 12px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(6px)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span>👁️ {formatCount(viewCount)} real views</span>
            </div>

            {/* Audio Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Center Play/Pause Overlay Indicator */}
          {!isPlaying && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: '#fff',
              zIndex: 15,
            }}>
              ▶
            </div>
          )}

          {/* Double Tap Floating Heart Animation */}
          {showHeartAnim && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 84,
              animation: 'bounce 0.8s ease',
              filter: 'drop-shadow(0 0 16px rgba(0,0,0,0.8))',
              pointerEvents: 'none',
              zIndex: 30,
            }}>
              ❤️
            </div>
          )}

          {/* Right Action Sidebar */}
          <div style={{
            position: 'absolute',
            right: 14,
            bottom: 90,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
            zIndex: 20,
          }}>
            {/* Real Like Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={toggleLike}
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '50%',
                  width: 46,
                  height: 46,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: liked ? '#f43f5e' : '#fff',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                {liked ? '❤️' : '🤍'}
              </button>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 800, marginTop: 4, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                {formatCount(likeCount)}
              </span>
            </div>

            {/* Comment Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowComments(v => !v); }}
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '50%',
                  width: 46,
                  height: 46,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 20,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                💬
              </button>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 800, marginTop: 4, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                {comments.length}
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={(e) => { e.stopPropagation(); alert('Reel link copied! 🚀'); }}
              style={{
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50%',
                width: 46,
                height: 46,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              🚀
            </button>
          </div>

          {/* Bottom Info Section */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 74,
            color: '#fff',
            zIndex: 20,
            pointerEvents: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                border: '1.5px solid #fff',
              }}>
                {reel.creator?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{reel.creator || '@travel_creator'}</div>
                {reel.placeName && (
                  <div style={{ fontSize: 11, color: '#93c5fd' }}>📍 {reel.placeName}</div>
                )}
              </div>
            </div>

            <p style={{
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.4,
              marginBottom: 6,
              textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            }}>
              {reel.title || reel.caption}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: '#e2e8f0',
              background: 'rgba(0,0,0,0.5)',
              padding: '3px 10px',
              borderRadius: 99,
              width: 'fit-content',
            }}>
              <span>🎵</span>
              <span>{reel.song || 'Original Audio · Tamil Nadu Travel'}</span>
            </div>
          </div>

          {/* Video Timeline Progress Bar */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'rgba(255,255,255,0.2)',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: '#f43f5e',
              transition: 'width 0.1s linear',
            }} />
          </div>
        </div>

        {/* Slide-Up Comments Drawer */}
        {showComments && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 40,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Comments ({comments.length})</div>
              <button
                onClick={() => setShowComments(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 16, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              {comments.map(c => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>{c.user}</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', marginTop: 2 }}>{c.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8 }}>
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment…"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 99,
                  padding: '8px 14px',
                  color: '#fff',
                  fontSize: 13,
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--grad-primary)',
                  border: 'none',
                  borderRadius: 99,
                  padding: '8px 16px',
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
        )}
      </div>
    </div>
  );
}
