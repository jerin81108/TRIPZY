import { useState, useRef } from 'react';

const STORY_PRESETS = [
  {
    title: '🌅 Marina Beach Sunrise Story',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    caption: 'Sunrise along Bay of Bengal waves 🌅✨',
    song: 'Chennai Coastal Vibes',
  },
  {
    title: '🌲 Kodaikanal Mist Reel Story',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    caption: 'Walking through clouds in the pine forest 🌲🌫️',
    song: 'Peaceful Nature Flute',
  },
  {
    title: '🏰 Thanjavur Heritage Chola Story',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    caption: 'Brihadeeswarar Temple golden hour morning! 🏰🚩',
    song: 'Thanjavur Temple Chants',
  },
  {
    title: '☕ Valparai Tea Estate Morning',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    caption: 'Fresh tea mist in Valparai hills 🍃☕',
    song: 'Western Ghats Acoustic',
  },
];

export default function CreateStoryModal({ currentUser, onAddStory, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('photo'); // 'photo'
  const [caption, setCaption] = useState('');
  const [song, setSong] = useState('Tamil Nadu Travel Audio');
  const [publishing, setPublishing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  async function startCamera() {
    try {
      setCameraError(false);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError(true);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPreviewUrl(dataUrl);
    setMediaType('photo');
    stopCamera();
  }

  function retakePhoto() {
    setPreviewUrl('');
    startCamera();
  }

  // Cleanup on unmount
  useState(() => {
    return () => stopCamera();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!previewUrl) return;
    setPublishing(true);

    onAddStory({
      userId: currentUser.id,
      userName: currentUser.name,
      username: currentUser.username || `@${currentUser.id}`,
      userAvatar: currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase(),
      mediaType,
      mediaUrl: previewUrl,
      caption: caption.trim(),
      song: song.trim(),
    });

    setPublishing(false);
    stopCamera();
    onClose();
  }

  function handleCloseModal() {
    stopCamera();
    onClose();
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.92)',
      backdropFilter: 'blur(12px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: '#0f172a',
        borderRadius: 24,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 12,
            }}>
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Add Story for {currentUser.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Visible to all accounts for 24 hours</div>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Live Camera Box */}
          <div
            style={{
              height: 240,
              borderRadius: 16,
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              background: previewUrl || cameraActive ? '#000' : 'rgba(255, 255, 255, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Story Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={retakePhoto}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  🔄 Retake
                </button>
              </>
            ) : cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={capturePhoto}
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    border: '4px solid rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  }}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Live Camera Only</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>Uploads disabled. Capture the moment!</div>
                {cameraError ? (
                  <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>Camera access denied or unavailable.</div>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn btn-primary btn-sm"
                  >
                    Open Camera
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
              ✍️ Story Caption
            </label>
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="What are you up to today? #Travel"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '8px 12px',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Audio Track Input */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
              🎵 Music Track Tag
            </label>
            <input
              value={song}
              onChange={e => setSong(e.target.value)}
              placeholder="e.g. Chennai Waves Melody, Temple Chants"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '8px 12px',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!previewUrl || publishing}
            style={{
              background: 'var(--grad-primary)',
              border: 'none',
              borderRadius: 99,
              padding: '12px',
              color: '#fff',
              fontWeight: 800,
              fontSize: 14,
              cursor: previewUrl ? 'pointer' : 'default',
              opacity: previewUrl ? 1 : 0.5,
              marginTop: 4,
            }}
          >
            {publishing ? 'Publishing Story…' : '🌟 Share to Your Story'}
          </button>
        </form>
      </div>
    </div>
  );
}
