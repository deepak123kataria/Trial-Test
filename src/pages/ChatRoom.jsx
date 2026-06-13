/**
 * ChatRoom.jsx — Main chat interface (FINAL REWRITE)
 * 
 * CRITICAL FIXES:
 * 1. Removed `navigate` from useEffect deps (was causing double-run → redirect loop)
 * 2. Uses ref guard to prevent double-initialization
 * 3. Calls room:getState after mount to fetch members/messages/polls
 * 4. Refs for username/sound to prevent stale closures in socket listeners
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket';
import { applyTheme } from '../utils/themes';
import { playMessageSound, playJoinSound, playVanishSound } from '../utils/sounds';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import MemberSidebar from '../components/MemberSidebar';
import PollSidebar from '../components/PollSidebar';
import CountdownTimer from '../components/CountdownTimer';

import { IconUsers, IconBarChart, IconBell, IconBellOff, IconWind, IconLogOut, IconArrowLeft } from '../utils/icons';

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const initRef = useRef(false); // Guard against double initialization

  // ─── State ────────────────────────────────────
  const [username, setUsername] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [theme, setTheme] = useState('dark');
  const [sidebarTab, setSidebarTab] = useState('members');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [vanishing, setVanishing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ended, setEnded] = useState(false);
  const [endReason, setEndReason] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [ready, setReady] = useState(false);

  // Refs to avoid stale closures in socket listeners
  const usernameRef = useRef('');
  const soundRef = useRef(true);
  useEffect(() => { usernameRef.current = username; }, [username]);
  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);

  // ─── Initialize from sessionStorage (runs once) ───────
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const stored = sessionStorage.getItem('vanish-room-data');
    if (stored) {
      const data = JSON.parse(stored);
      setUsername(data.username);
      usernameRef.current = data.username;
      setIsHost(data.isHost || false);
      setEndTime(data.endTime || null);
      setMessages(data.messages || []);
      setPolls(data.polls || []);
      setTheme(data.theme || 'dark');
      applyTheme(data.theme || 'dark', data.customColors);
      sessionStorage.removeItem('vanish-room-data');
      setReady(true);

      // Fetch latest state from server (members arrived before we mounted)
      setTimeout(() => {
        socket.emit('room:getState', {}, (res) => {
          if (res.success) {
            setMembers(res.members);
            // Merge any messages we missed
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const newMsgs = (res.messages || []).filter(m => !existingIds.has(m.id));
              return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
            });
            setPolls(res.polls || []);
          }
        });
      }, 100);
    } else {
      // No session data = arrived via direct URL without joining
      navigate('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps + guard ref = runs exactly once

  // ─── Socket listeners (stable — never re-register) ───────
  useEffect(() => {
    const onNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      if (soundRef.current && msg.type !== 'system' && msg.username !== usernameRef.current) {
        playMessageSound();
      }
      if (msg.type === 'system' && soundRef.current) {
        playJoinSound();
      }
    };

    const onMembersUpdate = (list) => setMembers(list);

    const onTypingUpdate = ({ username: who, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (isTyping) next.add(who);
        else next.delete(who);
        return next;
      });
    };

    const onPollUpdate = (list) => setPolls(list);

    const onMessageVanish = () => {
      setVanishing(true);
      if (soundRef.current) playVanishSound();
      setTimeout(() => { setMessages([]); setVanishing(false); }, 500);
    };

    const onMessageRemove = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    };

    const onMessageReacted = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    };

    const onRoomEnded = ({ reason }) => {
      setEnded(true);
      setEndReason(reason);
      if (soundRef.current) playVanishSound();
    };

    const onThemeChanged = ({ theme: t, customColors: c }) => {
      setTheme(t);
      applyTheme(t, c);
    };

    socket.on('message:new', onNewMessage);
    socket.on('members:update', onMembersUpdate);
    socket.on('typing:update', onTypingUpdate);
    socket.on('poll:update', onPollUpdate);
    socket.on('message:vanish', onMessageVanish);
    socket.on('message:remove', onMessageRemove);
    socket.on('message:reacted', onMessageReacted);
    socket.on('room:ended', onRoomEnded);
    socket.on('room:themeChanged', onThemeChanged);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('members:update', onMembersUpdate);
      socket.off('typing:update', onTypingUpdate);
      socket.off('poll:update', onPollUpdate);
      socket.off('message:vanish', onMessageVanish);
      socket.off('message:remove', onMessageRemove);
      socket.off('message:reacted', onMessageReacted);
      socket.off('room:ended', onRoomEnded);
      socket.off('room:themeChanged', onThemeChanged);
    };
  }, []); // Stable — uses refs

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Drag-and-drop ─────────────────────────
  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        socket.emit('message:send', { type: 'image', imageData: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // ─── Host controls ─────────────────────────
  const handleVanish = () => socket.emit('room:vanish');
  const handleEndRoom = () => socket.emit('room:end');


  // ─── Room ended ─────────────────────────
  if (ended) {
    return (
      <div className="landing">
        <div className="landing-orbs"><div className="orb orb-1" /><div className="orb orb-2" /></div>
        <div className="landing-content">
          <div className="card-icon" style={{ margin: '0 auto 1rem' }}><IconWind size={36} /></div>
          <h1 className="landing-title" style={{ fontSize: '2.5rem' }}>Room Vanished</h1>
          <p className="landing-subtitle">{endReason || 'This room no longer exists.'}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            All messages, media, and polls have been permanently deleted.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <IconArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!ready) return null;

  return (
    <div className="chat-room" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && (
        <div className="drag-overlay">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📎</div>
            <div>Drop image to send</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <div className="header-logo">
            <img src="/icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 6 }} />
          </div>
          <div>
            <div className="chat-header-title">Vanish Room</div>
            <div className="chat-header-info">
              {members.length} participant{members.length !== 1 ? 's' : ''} · Ephemeral
            </div>
          </div>
        </div>
        <div className="chat-header-right">
          {endTime && <CountdownTimer endTime={endTime} />}

          <button className="btn-icon" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Mute' : 'Unmute'}>
            {soundEnabled ? <IconBell size={16} /> : <IconBellOff size={16} />}
          </button>
          <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar">
            <IconUsers size={16} />
          </button>
          {isHost && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handleVanish} title="Clear all messages">
                <IconWind size={14} /> <span>Vanish</span>
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleEndRoom} title="End room">
                <IconLogOut size={14} /> <span>End</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="chat-body">
        <div className="chat-main">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                <div className="empty-chat-icon">
                  <img src="/icon.png" alt="" style={{ width: 64, height: 64, opacity: 0.6 }} />
                </div>
                <h3>Welcome to Vanish Room</h3>
                <p>Messages are ephemeral — everything vanishes when the room ends.</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Start typing to begin</p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isSelf={msg.username === username}
                currentUsername={username}
                vanishing={vanishing}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <MessageInput
            onSend={(data) => socket.emit('message:send', data)}
            onTypingStart={() => socket.emit('typing:start')}
            onTypingStop={() => socket.emit('typing:stop')}
            typingUsers={typingUsers}
            currentUsername={username}
          />
        </div>

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }} 
              onClick={() => setSidebarOpen(false)}
            >
              <IconArrowLeft size={16} /> Back to Chat
            </button>
          </div>
          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${sidebarTab === 'members' ? 'active' : ''}`} onClick={() => setSidebarTab('members')}>
              <IconUsers size={14} /> Members ({members.length})
            </button>
            <button className={`sidebar-tab ${sidebarTab === 'polls' ? 'active' : ''}`} onClick={() => setSidebarTab('polls')}>
              <IconBarChart size={14} /> Polls ({polls.length})
            </button>
          </div>
          <div className="sidebar-content">
            {sidebarTab === 'members' ? (
              <MemberSidebar members={members} typingUsers={typingUsers} />
            ) : (
              <PollSidebar
                polls={polls}
                currentUsername={username}
                onCreatePoll={(data, cb) => socket.emit('poll:create', data, cb)}
                onVote={(data) => socket.emit('poll:vote', data)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
