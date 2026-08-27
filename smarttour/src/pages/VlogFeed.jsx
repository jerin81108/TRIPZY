import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import ReelsModal from '../components/ReelsModal';
import PhotoModal from '../components/PhotoModal';
import StoryViewerModal from '../components/StoryViewerModal';
import CreateStoryModal from '../components/CreateStoryModal';

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatCount(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return (num || 0).toLocaleString('en-IN');
}

const roleColor = { tourist: '#0ea5e9', business: '#10b981', admin: '#8b5cf6', responder: '#ef4444' };
const roleLabel = { tourist: '🧳 Tourist', business: '🏪 Business', admin: '🏛️ Admin', responder: '🚨 Responder' };

function PostCard({ post, currentUserId, onOpenReel, onOpenPhoto, onDeletePost }) {
  const { likePost, addComment, incrementPostViews } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [saved, setSaved] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const likesList = post.likes || [];
  const liked = likesList.includes(currentUserId);
  const isVideo = post.mediaType === 'video' || post.mediaType === 'vlog';
  const views = post.views || (likesList.length * 7 + 120);

  // Strict Ownership Permission: Only the user who posted can delete
  const isOwner = Boolean(currentUserId && post.userId === currentUserId) || user?.role === 'admin';

  function handleLike(e) {
    if (e) e.stopPropagation();
    likePost(post.id, currentUserId);
  }

  function handleMediaClick() {
    incrementPostViews(post.id);
    if (isVideo) {
      onOpenReel(post);
    } else {
      onOpenPhoto(post);
    }
  }

  function handleDoubleTapMedia(e) {
    e.stopPropagation();
    if (!liked) {
      likePost(post.id, currentUserId);
    }
    incrementPostViews(post.id);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  }

  function submitComment(e) {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, {
      id: `c-${Date.now()}`,
      userId: currentUserId,
      userName: user?.name || 'You',
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    });
    setCommentText('');
  }

  function handleConfirmDelete() {
    if (!isOwner) return;
    onDeletePost(post.id);
    setShowDeleteConfirm(false);
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 22,
      overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
      position: 'relative',
    }}>
      {/* Instagram Post Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Glowing Story Ring */}
          <div style={{
            padding: 2.5,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
          }}>
            <div
              className="avatar"
              onClick={() => navigate(`/chat/${post.userId}`)}
              style={{
                width: 38,
                height: 38,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                border: '2px solid #0f172a',
              }}
            >
              {post.userAvatar || post.userName?.slice(0, 2).toUpperCase() || 'TR'}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                onClick={() => navigate(`/chat/${post.userId}`)}
                style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                {post.userName}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 99,
                background: `${roleColor[post.userRole || 'tourist']}15`,
                color: roleColor[post.userRole || 'tourist'],
              }}>
                {roleLabel[post.userRole || 'tourist']}
              </span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              {post.destinationName && <span>📍 {post.destinationName} · </span>}
              <span>{timeAgo(post.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Top Right: Views Badge & 3-Dots Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            padding: '3px 9px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span>👁️ {formatCount(views)}</span>
          </div>

          {/* 3-Dots Options Button */}
          <button
            onClick={() => setShowMenu(v => !v)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: 14,
            }}
            title="More Options"
          >
            ⋯
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div style={{
              position: 'absolute',
              top: 36,
              right: 0,
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '6px',
              minWidth: 160,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              zIndex: 60,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              <button
                onClick={() => { setShowMenu(false); navigate(`/chat/${post.userId}`); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '8px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>💬</span> Message Creator
              </button>

              <button
                onClick={() => { setShowMenu(false); alert('Post link copied! 📋'); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '8px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>📋</span> Copy Post Link
              </button>

              {/* Delete Option — ONLY shown if user is creator of this post */}
              {isOwner && (
                <button
                  onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    padding: '8px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>🗑️</span> Delete Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🗑️</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 4 }}>
            Delete this Post?
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 18, maxWidth: 260, lineHeight: 1.4 }}>
            This photo/video will be permanently removed from the public community feed.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn btn-ghost btn-sm"
              style={{ borderRadius: 99, padding: '6px 16px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 99,
                padding: '6px 18px',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
              }}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      {/* Post Media (Photo or Video) — fully watchable & clickable */}
      {post.mediaUrl && (
        <div
          onClick={handleMediaClick}
          onDoubleClick={handleDoubleTapMedia}
          style={{ position: 'relative', background: '#000', cursor: 'pointer', minHeight: 240 }}
        >
          {isVideo ? (
            <video
              src={post.mediaUrl}
              controls
              playsInline
              loop
              muted
              autoPlay
              style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block', background: '#000' }}
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt={post.caption}
              style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}

          {/* Double Tap Floating Heart Animation */}
          {showHeartAnim && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 76,
              animation: 'bounce 0.8s ease',
              filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.8))',
              pointerEvents: 'none',
              zIndex: 30,
            }}>
              ❤️
            </div>
          )}

          {/* Floating Watch / Expand Pill */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 99,
            padding: '5px 12px',
            fontSize: 11,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            backdropFilter: 'blur(6px)',
          }}>
            <span>{isVideo ? '▶ Watch Reel' : '🔍 View Photo'}</span>
          </div>
        </div>
      )}

      {/* Engagement Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px 6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Real Interactive Like */}
          <button
            onClick={handleLike}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: liked ? '#f43f5e' : 'var(--text-primary)',
              transition: 'transform 0.15s',
            }}
            title="Like Post"
          >
            {liked ? '❤️' : '🤍'}
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            title="Comment"
          >
            💬
          </button>

          {/* Share */}
          <button
            onClick={() => alert('Post link copied to clipboard! 📋')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            title="Share"
          >
            🚀
          </button>
        </div>

        {/* Bookmark / Save & Quick Delete (Only for owner) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isOwner && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 16,
                cursor: 'pointer',
                color: '#ef4444',
                opacity: 0.8,
              }}
              title="Delete this post (You posted this)"
            >
              🗑️
            </button>
          )}

          <button
            onClick={() => setSaved(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: saved ? '#fbbf24' : 'var(--text-primary)',
            }}
            title="Save Post"
          >
            {saved ? '🔖' : '🏷️'}
          </button>
        </div>
      </div>

      {/* Real Likes & Views Summary */}
      <div style={{
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        fontWeight: 800,
        color: 'var(--text-primary)',
        marginBottom: 6,
      }}>
        <span>{formatCount(likesList.length)} {likesList.length === 1 ? 'like' : 'likes'}</span>
        <span>·</span>
        <span style={{ color: '#38bdf8', fontWeight: 700 }}>{formatCount(views)} views</span>
      </div>

      {/* Caption with Hashtags */}
      <div style={{ padding: '0 14px 10px' }}>
        <span style={{ fontWeight: 800, fontSize: 13, marginRight: 6 }}>{post.userName}</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {post.caption}
        </span>
      </div>

      {/* Comments Section */}
      {(post.comments || []).length > 0 && !showComments && (
        <div
          onClick={() => setShowComments(true)}
          style={{ padding: '0 14px 8px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          View all {(post.comments || []).length} comments…
        </div>
      )}

      {showComments && (
        <div style={{
          padding: '8px 14px 12px',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {(post.comments || []).map((c) => (
            <div key={c.id} style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 800, marginRight: 6, color: '#38bdf8' }}>{c.userName}</span>
              <span style={{ color: 'var(--text-primary)' }}>{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Inline Quick Comment Input */}
      <form
        onSubmit={submitComment}
        style={{
          display: 'flex',
          gap: 8,
          padding: '8px 14px 12px',
          borderTop: '1px solid var(--border)',
          alignItems: 'center',
        }}
      >
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a public comment…"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          style={{
            background: 'none',
            border: 'none',
            color: commentText.trim() ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: 12,
            cursor: commentText.trim() ? 'pointer' : 'default',
          }}
        >
          Post
        </button>
      </form>
    </div>
  );
}

export default function VlogFeed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    posts, likePost, deletePost,
    stories, addStory, deleteStory, viewStory, reactToStory, sendMessage
  } = useApp();

  const [filter, setFilter] = useState('all'); // 'all' | 'video' | 'photo'
  const [activeReel, setActiveReel] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const currentUser = user || { id: 'user-demo-01', name: 'Arjun Mehta', avatar: 'AM', role: 'tourist' };
  const currentUserId = currentUser.id;

  // Check if current user has an active story
  const myStoryIndex = stories.findIndex(s => s.userId === currentUserId);
  const hasMyStory = myStoryIndex !== -1;

  const filteredPosts = posts.filter((p) => {
    if (filter === 'video') return p.mediaType === 'video' || p.mediaType === 'vlog';
    if (filter === 'photo') return p.mediaType === 'photo';
    return true;
  });

  function handleDeletePost(postId) {
    deletePost(postId);
    if (activeReel?.id === postId) setActiveReel(null);
    if (activePhoto?.id === postId) setActivePhoto(null);

    setToastMessage('🗑️ Post deleted successfully');
    setTimeout(() => setToastMessage(''), 3000);
  }

  function handleOpenStory(idx) {
    setActiveStoryIndex(idx);
  }

  return (
    <div className="page animate-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          padding: '10px 20px',
          borderRadius: 99,
          fontWeight: 800,
          fontSize: 13,
          boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
          zIndex: 99999,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Instagram Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={() => navigate('/home')}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 22 }}>📸</span>
            <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px' }}>Tripzy Feed</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/upload')}
            style={{ fontWeight: 800, borderRadius: 99, padding: '6px 14px' }}
          >
            + Create Post
          </button>
        </div>
      </div>

      {/* Instagram Stories Row (Our Account + Other Accounts) */}
      <div style={{
        padding: '12px 16px 10px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: 14,
        overflowX: 'auto',
        alignItems: 'center',
      }}>
        {/* FIRST ITEM: Your Story (Active Account) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            {/* Story Ring (gradient if has story, dashed/subtle if not) */}
            <div
              onClick={() => {
                if (hasMyStory) {
                  handleOpenStory(myStoryIndex);
                } else {
                  setShowCreateStory(true);
                }
              }}
              style={{
                padding: 2.5,
                borderRadius: '50%',
                background: hasMyStory
                  ? 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
                  : 'rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
              }}
            >
              <div
                className="avatar"
                style={{
                  width: 52,
                  height: 52,
                  fontSize: 16,
                  fontWeight: 800,
                  border: '2px solid var(--bg-card)',
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  color: '#fff',
                }}
              >
                {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Quick '+' Plus Badge to Add Story */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateStory(true);
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#0ea5e9',
                border: '2px solid var(--bg-card)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
              }}
              title="Add a new story"
            >
              +
            </button>
          </div>

          <span style={{ fontSize: 10, fontWeight: 700, color: hasMyStory ? '#38bdf8' : 'var(--text-secondary)' }}>
            {hasMyStory ? 'Your Story' : 'Add Story'}
          </span>
        </div>

        {/* OTHER ACCOUNTS' STORIES (Viewable by everyone) */}
        {stories
          .map((st, idx) => ({ ...st, originalIndex: idx }))
          .filter(st => st.userId !== currentUserId)
          .map((st) => (
            <div
              key={st.id}
              onClick={() => handleOpenStory(st.originalIndex)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {/* Vibrant Instagram Gradient Ring */}
              <div style={{
                padding: 2.5,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              }}>
                <div
                  className="avatar"
                  style={{
                    width: 52,
                    height: 52,
                    fontSize: 16,
                    fontWeight: 800,
                    border: '2px solid var(--bg-card)',
                  }}
                >
                  {st.userAvatar || st.userName?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                maxWidth: 58,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {st.userName?.split(' ')[0] || st.userName}
              </span>
            </div>
          ))}
      </div>

      <div className="container" style={{ paddingTop: 16, paddingBottom: 100, maxWidth: 520, margin: '0 auto' }}>

        {/* Feed Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[
            ['all', '🔥 All Public Posts'],
            ['video', '🎬 Videos & Reels'],
            ['photo', '📸 Photos'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                border: `1px solid ${filter === id ? 'var(--primary)' : 'var(--border)'}`,
                background: filter === id ? 'rgba(14,165,233,0.15)' : 'transparent',
                color: filter === id ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Feed Posts List */}
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>No posts in this category yet</div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>Be the first to share a travel photo or reel!</div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>
              Upload Media
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDeletePost={handleDeletePost}
              onOpenReel={(p) => setActiveReel({
                ...p,
                creator: p.userName,
                title: p.caption,
                likes: (p.likes || []).length,
                views: p.views || 1850,
                placeName: p.destinationName,
              })}
              onOpenPhoto={(p) => setActivePhoto(p)}
            />
          ))
        )}
      </div>

      {/* Instagram Story Full-Screen Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={activeStoryIndex}
          currentUserId={currentUserId}
          onClose={() => setActiveStoryIndex(null)}
          onDeleteStory={(id) => deleteStory(id)}
          onViewStory={(id, viewer) => viewStory(id, viewer)}
          onReactStory={(id, emoji) => reactToStory(id, emoji, currentUser)}
          onSendReply={(receiverId, text) => {
            sendMessage(receiverId, text, currentUser);
          }}
        />
      )}

      {/* Create Story Modal for Our Account */}
      {showCreateStory && (
        <CreateStoryModal
          currentUser={currentUser}
          onAddStory={(data) => {
            addStory(data);
            setToastMessage('✨ Story posted to your account!');
            setTimeout(() => setToastMessage(''), 3000);
          }}
          onClose={() => setShowCreateStory(false)}
        />
      )}

      {/* Full-Screen Reels Video Player */}
      {activeReel && (
        <ReelsModal
          reel={activeReel}
          isLiked={(activeReel.likes || []).includes?.(currentUserId)}
          initialLikesCount={Array.isArray(activeReel.likes) ? activeReel.likes.length : activeReel.likes}
          initialViewsCount={activeReel.views}
          onLike={() => likePost(activeReel.id, currentUserId)}
          onClose={() => setActiveReel(null)}
        />
      )}

      {/* Full-Screen Photo Lightbox Modal */}
      {activePhoto && (
        <PhotoModal
          photo={activePhoto}
          isLiked={(activePhoto.likes || []).includes?.(currentUserId)}
          initialLikesCount={(activePhoto.likes || []).length}
          initialViewsCount={activePhoto.views || 1240}
          onLike={() => likePost(activePhoto.id, currentUserId)}
          onClose={() => setActivePhoto(null)}
        />
      )}
    </div>
  );
}
