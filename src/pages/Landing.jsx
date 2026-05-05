/**
 * Landing.jsx — Premium landing page with SVG icons
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSparkles, IconDoorOpen, IconShield, IconClock, IconGhost } from '../utils/icons';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="landing-content">
        <div className="landing-logo">
          <img src="/icon.png" alt="Vanish Room" className="landing-logo-img" />
        </div>
        <h1 className="landing-title">Vanish Room</h1>
        <p className="landing-subtitle">
          Create temporary chat rooms that self-destruct. No accounts, no history, 
          no trace — just pure, private conversations that disappear forever.
        </p>
        <div className="landing-buttons">
          <button
            id="create-room-btn"
            className="btn btn-primary"
            onClick={() => navigate('/create')}
          >
            <IconSparkles size={18} /> Create Room
          </button>
          <button
            id="join-room-btn"
            className="btn btn-secondary"
            onClick={() => navigate('/join')}
          >
            <IconDoorOpen size={18} /> Join Room
          </button>
        </div>

        <div className="landing-features">
          <div className="feature-chip">
            <IconShield size={16} />
            <span>End-to-end Privacy</span>
          </div>
          <div className="feature-chip">
            <IconClock size={16} />
            <span>Auto Self-Destruct</span>
          </div>
          <div className="feature-chip">
            <IconGhost size={16} />
            <span>Zero Data Stored</span>
          </div>
        </div>
      </div>
    </div>
  );
}
