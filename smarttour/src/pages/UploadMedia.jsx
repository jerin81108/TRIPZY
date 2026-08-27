import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const DEST_OPTIONS = [
  { id: 'dest-01', name: 'Marina Beach, Chennai' },
  { id: 'dest-03', name: 'Mahabalipuram Shore Temple' },
  { id: 'dest-05', name: 'Kapaleeshwarar Temple, Chennai' },
  { id: 'dest-09', name: 'Ooty Botanical Garden' },
  { id: 'dest-11', name: 'Meenakshi Amman Temple, Madurai' },
  { id: 'dest-tn-a', name: 'Thanjavur Brihadeeswarar Temple' },
  { id: 'dest-tn-c', name: 'Rameswaram Temple' },
  { id: 'dest-tn-d', name: 'Pamban Bridge & Dhanushkodi' },
  { id: 'dest-tn-e', name: 'Kanyakumari Sunset Point' },
  { id: 'dest-tn-g', name: 'Kodaikanal Pine Forest' },
  { id: 'dest-tn-i', name: 'Hogenakkal Waterfalls' },
  { id: 'dest-tn-k', name: 'Chettinad Heritage Village' },
  { id: 'dest-tn-l', name: 'Mudumalai Tiger Reserve' },
  { id: 'dest-tn-m', name: 'Yercaud Emerald Lake' },
  { id: 'dest-tn-n', name: 'Chidambaram Nataraja Temple' },
];

export default function UploadMedia() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadPost } = useApp();

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraMode, setCameraMode] = useState('photo'); // 'photo' | 'video'
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [countdown, setCountdown] = useState(0);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState('photo'); // 'photo' | 'video'
  const [caption, setCaption] = useState('');
  const [destId, setDestId] = useState(DEST_OPTIONS[0].id);
  const [destName, setDestName] = useState(DEST_OPTIONS[0].name);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Initialize camera when cameraActive is true
  useEffect(() => {
    if (cameraActive && !previewUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraActive, previewUrl]);

  // Countdown timer for video recording
  useEffect(() => {
    let timer;
    if (recording) {
      setCountdown(10); // max 10 seconds for demo
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [recording]);

  async function startCamera() {
    try {
      setCameraError(null);
      const constraints = {
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: cameraMode === 'video',
      };
      const userStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setCameraError('Unable to access camera. Please check permissions.');
      setCameraActive(false);
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPreviewUrl(dataUrl);
    setMediaType('photo');
    setCameraActive(false);
    stopCamera();
  }

  function startRecording() {
    if (!stream) return;
    setRecordedChunks([]);
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    let recorder;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch (e) {
      try {
        recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      } catch (err) {
        recorder = new MediaRecorder(stream);
      }
    }
    
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    recorder.onstop = () => {
      // Create blob from chunks
      setRecordedChunks(chunks => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        
        // Read as Data URL to store in App Context / Local Storage
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(blob);
        return [];
      });
      setMediaType('video');
      setCameraActive(false);
      stopCamera();
    };

    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  function handleDestChange(e) {
    const opt = DEST_OPTIONS.find(d => d.id === e.target.value);
    setDestId(e.target.value);
    setDestName(opt?.name || '');
  }

  async function handleUpload() {
    if (!previewUrl || !caption.trim()) return;
    setUploading(true);
    setProgress(0);

    for (let i = 15; i <= 90; i += 15) {
      await new Promise(r => setTimeout(r, 100));
      setProgress(i);
    }

    uploadPost({
      userId: user?.id || 'user-demo-01',
      userName: user?.name || 'Explorer',
      username: user?.username || `@${user?.id || 'explorer'}`,
      userAvatar: user?.avatar || 'AM',
      userRole: user?.role || 'tourist',
      mediaType,
      mediaUrl: previewUrl,
      caption: caption.trim(),
      destinationId: destId,
      destinationName: destName,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
    });

    setProgress(100);
    await new Promise(r => setTimeout(r, 300));
    setUploading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="page animate-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        padding: 32,
      }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontWeight: 900, fontSize: 24, marginBottom: 8, color: '#fff' }}>
          Published to Public Feed!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 360, marginBottom: 24, lineHeight: 1.5 }}>
          Your adventure capture is now live on the global feed!
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => navigate('/feed')}>
            🎬 View in Global Feed
          </button>
          <button className="btn btn-ghost" onClick={() => { setDone(false); setPreviewUrl(null); setCaption(''); }}>
            + Capture Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-in">
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '16px' }}>
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>🎥 Live Adventure Camera</h1>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Capture a live photo or vlog right now to share on the feed
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16, paddingBottom: 100 }}>
        {/* Camera and Capture Box */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--card-radius)',
          overflow: 'hidden',
          marginBottom: 16,
          position: 'relative',
        }}>
          {previewUrl ? (
            /* Media Preview */
            <div style={{ width: '100%', position: 'relative' }}>
              {mediaType === 'video' ? (
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block', background: '#000' }}
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Live Capture Preview"
                  style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block' }}
                />
              )}
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setCameraActive(true);
                }}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Discard and retake"
              >
                ✕
              </button>
              <div style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
              }}>
                {mediaType === 'video' ? '🎬 Captured Video' : '📸 Captured Photo'}
              </div>
            </div>
          ) : cameraActive ? (
            /* Active Live Camera Viewport */
            <div style={{ position: 'relative', background: '#000', width: '100%', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', maxHeight: 360, objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
              
              {/* Recording / Capture Overlays */}
              {recording && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(214, 56, 72, 0.8)',
                  padding: '4px 10px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#fff',
                }}>
                  <span className="live-dot" style={{ background: '#fff' }}></span>
                  <span>RECORDING ({countdown}s)</span>
                </div>
              )}

              {/* Mode indicator */}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
              }}>
                Mode: {cameraMode === 'video' ? '📹 Video Vlog' : '📸 Snapshot'}
              </div>

              {/* Controls bar overlaid at the bottom */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}>
                {/* Mode selector switch */}
                {!recording && (
                  <div style={{
                    display: 'flex',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 99,
                    padding: 3,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    <button
                      type="button"
                      onClick={() => setCameraMode('photo')}
                      style={{
                        padding: '4px 14px',
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 700,
                        color: cameraMode === 'photo' ? '#fff' : 'var(--text-secondary)',
                        background: cameraMode === 'photo' ? 'var(--primary)' : 'transparent',
                      }}
                    >
                      📸 Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraMode('video')}
                      style={{
                        padding: '4px 14px',
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 700,
                        color: cameraMode === 'video' ? '#fff' : 'var(--text-secondary)',
                        background: cameraMode === 'video' ? 'var(--primary)' : 'transparent',
                      }}
                    >
                      📹 Video
                    </button>
                  </div>
                )}

                {/* Shutter Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <button
                    type="button"
                    onClick={() => { setCameraActive(false); stopCamera(); }}
                    style={{ color: '#fff', fontSize: 13, fontWeight: 700, opacity: 0.8 }}
                  >
                    Cancel
                  </button>

                  {cameraMode === 'photo' ? (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: '#fff',
                        border: '4px solid rgba(232, 134, 58, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 0 15px rgba(255,255,255,0.4)',
                      }}
                      title="Take Snapshot"
                    >
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)' }} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={recording ? stopRecording : startRecording}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: recording ? '#d63848' : '#fff',
                        border: '4px solid rgba(214, 56, 72, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 0 15px rgba(214, 56, 72, 0.4)',
                      }}
                      title={recording ? 'Stop Recording' : 'Start Recording'}
                    >
                      {recording ? (
                        <div style={{ width: 22, height: 22, borderRadius: 4, background: '#fff' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d63848' }} />
                      )}
                    </button>
                  )}
                  
                  <div style={{ width: 40 }} /> {/* Spacer to balance cancel btn */}
                </div>
              </div>
            </div>
          ) : (
            /* Inactive Camera Shutter Placeholder */
            <div
              onClick={() => setCameraActive(true)}
              style={{
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 24,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(232, 134, 58, 0.1)',
                border: '2px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                marginBottom: 12,
                animation: 'pulse-sos 3s infinite',
              }}>
                📷
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, color: '#fff' }}>
                Open Live Camera
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.4 }}>
                Take a live snapshot or record a video vlog directly from your device's camera
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm mt-3"
                onClick={(e) => { e.stopPropagation(); setCameraActive(true); }}
                style={{ borderRadius: 99 }}
              >
                📸 Activate Camera
              </button>
            </div>
          )}
        </div>

        {/* Destination Picker */}
        <div className="form-group mb-3">
          <label className="form-label">📍 Tag Destination / Location</label>
          <select
            className="form-input"
            value={destId}
            onChange={handleDestChange}
          >
            {DEST_OPTIONS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Caption */}
        <div className="form-group mb-4">
          <label className="form-label">✍️ Caption & Hashtags</label>
          <textarea
            rows={3}
            className="form-input"
            placeholder="Write an adventure caption... e.g. Exploring the scenic paths! #Adventure #TamilNadu"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* Progress bar */}
        {uploading && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span>Publishing to Public Feed...</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--grad-primary)' }} />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          className="btn btn-primary btn-full"
          onClick={handleUpload}
          disabled={!previewUrl || !caption.trim() || uploading}
          style={{ padding: '14px', fontWeight: 800, fontSize: 15 }}
        >
          {uploading ? 'Publishing...' : '🚀 Share to Public Feed'}
        </button>
      </div>
    </div>
  );
}
