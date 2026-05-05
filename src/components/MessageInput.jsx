/**
 * MessageInput.jsx — Chat message input with emoji, sticker, image support
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';
import { IconSend, IconSmile, IconImage, IconClock } from '../utils/icons';

export default function MessageInput({ onSend, onTypingStart, onTypingStop, typingUsers, currentUsername }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selfDestruct, setSelfDestruct] = useState(0);
  const textRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Typing indicator logic
  const handleTextChange = (e) => {
    setText(e.target.value);
    onTypingStart();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTypingStop(), 1500);
  };

  // Send message
  const handleSend = useCallback(() => {
    if (!text.trim() && !imagePreview) return;

    if (imagePreview) {
      onSend({ type: 'image', imageData: imagePreview, selfDestruct: selfDestruct || null });
      setImagePreview(null);
    } else {
      onSend({ type: 'text', text: text.trim(), selfDestruct: selfDestruct || null });
    }

    setText('');
    onTypingStop();
    clearTimeout(typingTimeoutRef.current);
    setShowEmoji(false);
    setShowSticker(false);
    textRef.current?.focus();
  }, [text, imagePreview, selfDestruct, onSend, onTypingStop]);

  // Enter key to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image upload
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Emoji selection
  const handleEmojiSelect = (emoji) => {
    setText(prev => prev + emoji);
    textRef.current?.focus();
  };

  // Sticker send
  const handleStickerSend = (sticker) => {
    onSend({ type: 'sticker', stickerUrl: sticker });
    setShowSticker(false);
  };

  // Build typing display
  const typingDisplay = (() => {
    const others = [...typingUsers].filter(u => u !== currentUsername);
    if (others.length === 0) return null;
    if (others.length === 1) return `${others[0]} is typing`;
    if (others.length === 2) return `${others[0]} and ${others[1]} are typing`;
    return `${others.length} people are typing`;
  })();

  return (
    <div className="chat-input-area">
      {/* Typing indicator */}
      <div className="typing-indicator">
        {typingDisplay && (
          <>
            {typingDisplay}
            <span className="typing-dots">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </span>
          </>
        )}
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="preview" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Image ready</span>
          <button className="image-preview-remove" onClick={() => setImagePreview(null)}>✕</button>
        </div>
      )}

      {/* Self-destruct toggle */}
      {selfDestruct > 0 && (
        <div className="destruct-toggle">
          <IconClock size={12} />
          <span>Self-destruct in</span>
          <select value={selfDestruct} onChange={(e) => setSelfDestruct(parseInt(e.target.value))}>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
          </select>
          <button onClick={() => setSelfDestruct(0)} style={{
            background: 'none', border: 'none', color: 'var(--danger)',
            cursor: 'pointer', fontSize: '0.7rem', padding: '0 0.3rem',
          }}>Cancel</button>
        </div>
      )}

      {/* Input row */}
      <div className="input-row">
        <div className="input-wrapper">
          <textarea
            id="chat-input"
            ref={textRef}
            className="chat-text-input"
            placeholder={imagePreview ? 'Add a caption (optional)' : 'Type a message...'}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <div className="input-actions">
            <button
              className="input-action-btn"
              onClick={() => { setShowEmoji(!showEmoji); setShowSticker(false); }}
              title="Emoji"
            >
              <IconSmile size={18} />
            </button>
            <label className="input-action-btn" title="Image">
              <IconImage size={18} />
              <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
            </label>
            <button
              className="input-action-btn"
              onClick={() => setSelfDestruct(selfDestruct > 0 ? 0 : 10)}
              title="Self-destruct"
              style={{ color: selfDestruct > 0 ? 'var(--warning)' : undefined }}
            >
              <IconClock size={18} />
            </button>
            <button
              className="input-action-btn"
              onClick={() => { setShowSticker(!showSticker); setShowEmoji(false); }}
              title="Stickers"
              style={{ fontSize: '1.1rem' }}
            >
              🎨
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmoji && (
            <div className="picker-overlay">
              <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
            </div>
          )}

          {/* Sticker Picker */}
          {showSticker && (
            <div className="picker-overlay">
              <StickerPicker onSelect={handleStickerSend} onClose={() => setShowSticker(false)} />
            </div>
          )}
        </div>

        <button className="send-btn" onClick={handleSend} disabled={!text.trim() && !imagePreview} title="Send message">
          <IconSend size={18} />
        </button>
      </div>
    </div>
  );
}
