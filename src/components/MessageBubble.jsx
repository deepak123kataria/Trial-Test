/**
 * MessageBubble.jsx — Chat message display component
 * Supports text, image, sticker, system messages with reactions.
 */
import React, { useState } from 'react';
import socket from '../socket';
import { IconFile, IconDownload } from '../utils/icons';

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

        {/* File message */}
        {message.type === 'file' && message.fileData && (
          <div className="message-file-attachment" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', 
            padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
            marginBottom: message.text ? '0.5rem' : '0'
          }}>
            <IconFile size={28} style={{ color: 'var(--primary)' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={message.fileName}>
                {message.fileName || 'Unknown File'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {message.fileSize ? (message.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'}
              </div>
            </div>
            <a 
              href={message.fileData} 
              download={message.fileName || 'download'} 
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.6rem', textDecoration: 'none' }}
            >
              <IconDownload size={14} />
              <span>Save</span>
            </a>
          </div>
        )}

        {/* Text content */}
        {message.text && <span>{message.text}</span>}

        {showReactions && (
          <div className="reaction-bar" style={{
            position: 'absolute',
            bottom: -15,
            [isSelf ? 'right' : 'left']: 0,
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            padding: '0.15rem 0.3rem',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 5,
            whiteSpace: 'nowrap'
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
