import { useState, useEffect, useRef } from 'react';

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function StoryViewerModal({
  stories,
  initialIndex = 0,
  currentUserId,
  onClose,
  onDeleteStory,
  onViewStory,
  onReactStory,
  onSendReply,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reactionSent, setReactionSent] = useState(null);
  const [showViewers, setShowViewers] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const currentStory = stories[currentIndex];
  if (!currentStory) return null;

  const isOwner = Boolean(currentUserId && currentStory.userId === currentUserId);
  const isVideo = currentStory.mediaType === 'video' || currentStory.mediaType === 'vlog';
  const viewsList = currentStory.views || [];
  const likesList = currentStory.likes || [];
  const isLiked = likesList.includes(currentUserId);

  // Mark story as viewed by current user
  useEffect(() => {
    if (currentStory && currentUserId && onViewStory) {
      onViewStory(currentStory.id, currentUserId);
    }
  }, [currentIndex, currentStory?.id, currentUserId]);

  // Story Progress Timer (5 seconds per photo, or video time update)
  useEffect(() => {
    setProgress(0);
    clearInterval(timerRef.current);

    if (isVideo) {
      // Handled by video onTimeUpdate
      return;
    }

    const interval = 50;
    const duration = 5000;
    const step = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      if (isPaused) return;
      setProgress(p => {
        if (p + step >= 100) {
          clearInterval(timerRef.current);
          handleNext();
          return 100;
        }
        return p + step;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isPaused, isVideo]);

  function handleNext() {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
    }
  }

  function handleVideoTimeUpdate() {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration) {
      setProgress((currentTime / duration) * 100);
    }
  }

  function handleVideoEnded() {
    handleNext();
  }

  function handleQuickReact(emoji) {
    if (onReactStory) onReactStory(currentStory.id, emoji);
    if (onSendReply) onSendReply(currentStory.userId, `${emoji} reacted to story: "${currentStory.caption || 'Photo'}"`);
    setReactionSent(emoji);
    setTimeout(() => setReactionSent(null), 1200);
  }

  function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onSendReply) {
      onSendReply(currentStory.userId, `💬 Story Reply: "${replyText.trim()}"`);
    }
    setReactionSent('Sent! ✈️');
    setReplyText('');
    setTimeout(() => setReactionSent(null), 1500);
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(16px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
    }}>
      {/* Story Shell */}
      <div
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          height: '90vh',
          maxHeight: 750,
          background: '#0a0f1d',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 0 1.5px rgba(255,255,255,0.15)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Segmented Story Progress Bars */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          display: 'flex',
          gap: 4,
          zIndex: 30,
        }}>
          {stories.map((s, idx) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                height: 3,
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              <div style={{
                height: '100%',
                background: '#fff',
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                transition: idx === currentIndex && !isVideo ? 'width 0.05s linear' : 'none',
              }} />
            </div>
          ))}
        </div>

        {/* Top Header: User Profile & Close */}
        <div style={{
          position: 'absolute',
          top: 24,
          left: 14,
          right: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Story Ring */}
            <div style={{
              padding: 2,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#0f172a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                border: '1.5px solid #000',
              }}>
                {currentStory.userAvatar || currentStory.userName?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>
                  {currentStory.userName}
                </span>
                {isOwner && (
                  <span style={{
                    fontSize: 9,
                    background: '#0ea5e9',
                    color: '#fff',
                    padding: '1px 5px',
                    borderRadius: 99,
                    fontWeight: 700,
                  }}>
                    You
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                {timeAgo(currentStory.timestamp)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Delete Story Button (ONLY for Owner) */}
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete your story?')) {
                    onDeleteStory(currentStory.id);
                    onClose();
                  }
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  borderRadius: 99,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Delete your active story"
              >
                <span>🗑️ Delete</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
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

        {/* Media Container (Photo / Playable Video) */}
        <div style={{ position: 'relative', flex: 1, background: '#000', overflow: 'hidden' }}>
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              muted={false}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}

          {/* Left & Right Tap Zones for Navigation */}
          <div
            onClick={handlePrev}
            style={{
              position: 'absolute',
              top: 70,
              left: 0,
              bottom: 120,
              width: '35%',
              zIndex: 25,
              cursor: 'pointer',
            }}
          />
          <div
            onClick={handleNext}
            style={{
              position: 'absolute',
              top: 70,
              right: 0,
              bottom: 120,
              width: '65%',
              zIndex: 25,
              cursor: 'pointer',
            }}
          />

          {/* Gradient overlay at bottom for readable caption */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Reaction Burst Feedback Overlay */}
          {reactionSent && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 60,
              animation: 'bounce 0.8s ease',
              filter: 'drop-shadow(0 0 16px rgba(0,0,0,0.8))',
              pointerEvents: 'none',
              zIndex: 40,
              color: '#fff',
              fontWeight: 800,
            }}>
              {reactionSent}
            </div>
          )}

          {/* Story Caption & Song Badge */}
          <div style={{
            position: 'absolute',
            bottom: 80,
            left: 16,
            right: 16,
            color: '#fff',
            zIndex: 30,
            pointerEvents: 'none',
          }}>
            {currentStory.caption && (
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1.4,
                marginBottom: 8,
                textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              }}>
                {currentStory.caption}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {currentStory.song && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(0,0,0,0.6)',
                  padding: '3px 10px',
                  borderRadius: 99,
                  fontSize: 11,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  <span>🎵</span>
                  <span>{currentStory.song}</span>
                </div>
              )}

              {/* Real Viewers Count */}
              <div
                onClick={(e) => { e.stopPropagation(); setShowViewers(v => !v); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  padding: '3px 10px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                }}
              >
                <span>👁️ {viewsList.length} Viewers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Interaction Bar (Reply + Quick Emojis) */}
        {!isOwner ? (
          <div style={{
            padding: '10px 14px 14px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            zIndex: 35,
          }}>
            {/* Quick Emoji Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 8 }}>
              {['🔥', '❤️', '😍', '👏', '🙌', '😮'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleQuickReact(emoji)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 22,
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Direct Message Input */}
            <form onSubmit={handleSendReply} style={{ display: 'flex', gap: 8 }}>
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Send reply to ${currentStory.userName.split(' ')[0]}…`}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 99,
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                style={{
                  background: 'var(--grad-primary)',
                  border: 'none',
                  borderRadius: 99,
                  padding: '8px 16px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: replyText.trim() ? 'pointer' : 'default',
                  opacity: replyText.trim() ? 1 : 0.5,
                }}
              >
                Send ✈️
              </button>
            </form>
          </div>
        ) : (
          /* Owner Viewers Footer */
          <div style={{
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff',
            zIndex: 35,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>
              👁️ Seen by {viewsList.length} accounts
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Visible for 24h to all travelers
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
