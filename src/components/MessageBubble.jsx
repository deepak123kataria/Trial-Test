/**
 * MessageBubble.jsx — Chat message display component
 * Supports text, image, sticker, system messages with reactions.
 */
import React, { useState } from 'react';
import socket from '../socket';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function MessageBubble({ message, isSelf, currentUsername, vanishing }) {
  const [showReactions, setShowReactions] = useState(false);

  // System messages
  if (message.type === 'system') {
    return (
      <div className={`message-wrapper system ${vanishing ? 'message-vanishing' : ''}`}>
        <div className="message-bubble system">{message.text}</div>
      </div>
    );
  }

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReact = (emoji) => {
    socket.emit('message:react', { messageId: message.id, emoji });
    setShowReactions(false);
  };

  const side = isSelf ? 'self' : 'other';

  return (
    <div
      className={`message-wrapper ${side} ${vanishing ? 'message-vanishing' : ''}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Show sender name for other people's messages */}
      {!isSelf && (
        <span className="message-username">{message.username}</span>
      )}

      <div className={`message-bubble ${side}`}>
        {/* Image message */}
        {message.type === 'image' && message.imageData && (
          <img
            src={message.imageData}
            alt="shared"
            className="message-image"
            loading="lazy"
          />
        )}

        {/* Sticker message */}
        {message.type === 'sticker' && message.stickerUrl && (
          <div className="message-sticker">{message.stickerUrl}</div>
        )}

        {/* Text content */}
        {message.text && <span>{message.text}</span>}

        {/* Quick reaction bar (on hover) */}
        {showReactions && (
          <div className="reaction-bar" style={{
            position: 'absolute',
            bottom: -10,
            [isSelf ? 'left' : 'right']: 0,
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            padding: '0.15rem 0.3rem',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 5,
          }}>
            {QUICK_REACTIONS.map(emoji => (
              <button
                key={emoji}
                className="reaction-btn"
                onClick={() => handleReact(emoji)}
                style={{ opacity: 1 }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Displayed reactions */}
      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <div className="message-reactions">
          {Object.entries(message.reactions).map(([emoji, users]) => (
            <span
              key={emoji}
              className={`reaction-badge ${users.includes(currentUsername) ? 'self-reacted' : ''}`}
              onClick={() => handleReact(emoji)}
              title={users.join(', ')}
            >
              {emoji} {users.length}
            </span>
          ))}
        </div>
      )}

      {/* Timestamp + self-destruct indicator */}
      <div className="message-meta">
        <span className="message-time">{formatTime(message.timestamp)}</span>
        {message.selfDestruct && (
          <span className="message-destruct">💣 {message.selfDestruct}s</span>
        )}
      </div>
    </div>
  );
}
