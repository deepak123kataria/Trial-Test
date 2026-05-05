/**
 * CreateRoom.jsx — Room creation form with proper icon-based UI
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import { IconArrowLeft, IconSparkles, IconCopy, IconCheck, IconRocket, IconUsers, IconClock, IconLock } from '../utils/icons';

export default function CreateRoom() {
  const navigate = useNavigate();
  const [hostUsername, setHostUsername] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [password, setPassword] = useState('');
  const [duration, setDuration] = useState(30);
  const [theme, setTheme] = useState('dark');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState(null);
  const [copied, setCopied] = useState(false);

  const endTimeRef = useRef(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!hostUsername.trim()) {
      setError('Please enter your username');
      return;
    }
    setLoading(true);
    setError('');

    const endTime = Date.now() + duration * 60 * 1000;
    endTimeRef.current = endTime;

    socket.emit('room:create', {
      hostUsername: hostUsername.trim(),
      maxParticipants: parseInt(maxParticipants),
      password: password || null,
      endTime,
      theme,
    }, (response) => {
      setLoading(false);
      if (response.success) {
        setCreatedRoomId(response.roomId);
      } else {
        setError(response.error || 'Failed to create room');
      }
    });
  };

  const joinLink = createdRoomId ? `${window.location.origin}/join/${createdRoomId}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterRoom = () => {
    sessionStorage.setItem('vanish-room-data', JSON.stringify({
      roomId: createdRoomId,
      username: hostUsername.trim(),
      hostUsername: hostUsername.trim(),
      endTime: endTimeRef.current,
      theme,
      customColors: null,
      messages: [],
      polls: [],
      isHost: true,
    }));
    navigate(`/room/${createdRoomId}`);
  };

  return (
    <div className="landing">
      <div className="landing-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="card modal-content" style={{ position: 'relative', zIndex: 1 }}>
        {!createdRoomId ? (
          <>
            <div className="card-header">
              <div className="card-icon"><IconSparkles size={28} /></div>
              <h2 className="form-title">Create a Room</h2>
              <p className="form-subtitle">Set up your private, ephemeral chat space</p>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label"><IconUsers size={14} /> Your Username</label>
                <input
                  id="host-username"
                  className="form-input"
                  type="text"
                  placeholder="Enter your name"
                  value={hostUsername}
                  onChange={(e) => setHostUsername(e.target.value)}
                  maxLength={20}
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><IconUsers size={14} /> Max Participants</label>
                  <select id="max-participants" className="form-input" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)}>
                    {[2, 3, 5, 10, 20, 50].map(n => (
                      <option key={n} value={n}>{n} people</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label"><IconClock size={14} /> Duration</label>
                  <select id="room-duration" className="form-input" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={480}>8 hours</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><IconLock size={14} /> Room Code (optional)</label>
                <input
                  id="room-password"
                  className="form-input"
                  type="text"
                  placeholder="Leave empty for no password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Theme option removed - defaulted to dark */}

              {error && <p className="form-error">{error}</p>}

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                  <IconArrowLeft size={16} /> Back
                </button>
                <button id="create-room-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Creating...' : <><IconSparkles size={16} /> Create Room</>}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="card-header">
              <div className="card-icon success"><IconCheck size={28} /></div>
              <h2 className="form-title">Room Created!</h2>
              <p className="form-subtitle">Share this link with people you want to chat with</p>
            </div>

            <div className="copy-link-area">
              <span className="copy-link-text">{joinLink}</span>
              <button id="copy-link-btn" className="btn btn-primary btn-sm copy-link-btn" onClick={handleCopy}>
                {copied ? <><IconCheck size={14} /> Copied</> : <><IconCopy size={14} /> Copy</>}
              </button>
            </div>

            {password && (
              <div className="info-badge">
                <IconLock size={14} />
                <span>Room Code: <strong>{password}</strong></span>
              </div>
            )}

            <button
              id="enter-room-btn"
              className="btn btn-primary btn-lg"
              onClick={handleEnterRoom}
              style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
            >
              <IconRocket size={18} /> Enter Room
            </button>
          </>
        )}
      </div>
    </div>
  );
}
