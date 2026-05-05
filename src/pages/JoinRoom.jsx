/**
 * JoinRoom.jsx — Join a room by link/code
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import socket from '../socket';
import { IconArrowLeft, IconArrowRight, IconRocket, IconDoorOpen, IconUsers, IconLock, IconLink } from '../utils/icons';

export default function JoinRoom() {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams();

  const [roomId, setRoomId] = useState(paramRoomId || '');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [step, setStep] = useState(paramRoomId ? 'checking' : 'enterLink');

  const parseRoomId = (input) => {
    try {
      const url = new URL(input);
      const parts = url.pathname.split('/');
      return parts[parts.length - 1] || input;
    } catch {
      return input.trim();
    }
  };

  useEffect(() => {
    if (step === 'checking' && roomId) {
      socket.emit('room:check', { roomId }, (response) => {
        if (response.exists) {
          setRoomInfo(response);
          setStep('enterName');
          setError('');
        } else {
          setError('Room not found or has expired');
          setStep('enterLink');
        }
      });
    }
  }, [step, roomId]);

  const handleCheckRoom = (e) => {
    e.preventDefault();
    setError('');
    const parsedId = parseRoomId(roomId);
    setRoomId(parsedId);
    setStep('checking');
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setLoading(true);
    setError('');

    socket.emit('room:join', {
      roomId,
      username: username.trim(),
      password: password || null,
    }, (response) => {
      setLoading(false);
      if (response.success) {
        sessionStorage.setItem('vanish-room-data', JSON.stringify({
          roomId,
          username: username.trim(),
          hostUsername: response.room.hostUsername,
          endTime: response.room.endTime,
          theme: response.room.theme,
          customColors: response.room.customColors,
          messages: response.messages || [],
          polls: response.polls || [],
          isHost: false,
        }));
        navigate(`/room/${roomId}`);
      } else {
        setError(response.error);
      }
    });
  };

  return (
    <div className="landing">
      <div className="landing-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="card modal-content" style={{ position: 'relative', zIndex: 1 }}>
        {step === 'enterLink' && (
          <>
            <div className="card-header">
              <div className="card-icon"><IconDoorOpen size={28} /></div>
              <h2 className="form-title">Join a Room</h2>
              <p className="form-subtitle">Paste a room link or enter the room ID</p>
            </div>

            <form onSubmit={handleCheckRoom}>
              <div className="form-group">
                <label className="form-label"><IconLink size={14} /> Room Link / ID</label>
                <input
                  id="room-link-input"
                  className="form-input"
                  type="text"
                  placeholder="https://...  or  room-id"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  autoFocus
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                  <IconArrowLeft size={16} /> Back
                </button>
                <button id="check-room-btn" type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!roomId.trim()}>
                  Find Room <IconArrowRight size={16} />
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'checking' && (
          <div className="card-header" style={{ padding: '3rem 0' }}>
            <div className="card-icon pulse"><IconDoorOpen size={28} /></div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Finding room...</p>
          </div>
        )}

        {step === 'enterName' && (
          <>
            <div className="card-header">
              <div className="card-icon"><IconUsers size={28} /></div>
              <h2 className="form-title">Almost There!</h2>
              <p className="form-subtitle">
                {roomInfo?.memberCount}/{roomInfo?.maxParticipants} participants — Choose your name
              </p>
            </div>

            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label className="form-label"><IconUsers size={14} /> Your Username</label>
                <input
                  id="join-username"
                  className="form-input"
                  type="text"
                  placeholder="Pick a unique name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  autoFocus
                />
              </div>

              {roomInfo?.hasPassword && (
                <div className="form-group">
                  <label className="form-label"><IconLock size={14} /> Room Code</label>
                  <input
                    id="join-password"
                    className="form-input"
                    type="text"
                    placeholder="Enter the room code"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {error && <p className="form-error">{error}</p>}

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setStep('enterLink'); setError(''); }}>
                  <IconArrowLeft size={16} /> Back
                </button>
                <button id="join-room-submit" type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading || !username.trim()}>
                  {loading ? 'Joining...' : <><IconRocket size={16} /> Join Room</>}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
