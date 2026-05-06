/**
 * MessageInput.jsx — Chat message input with emoji, sticker, image, file support
 * 
 * FIXES:
 * 1. Combined file/image picker — works on mobile (camera + gallery + files)
 * 2. Sending indicator — shows progress bar while uploading
 * 3. Mobile layout — action buttons below input, no overlap
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';
import { IconSend, IconSmile, IconImage, IconClock, IconPaperclip } from '../utils/icons';

export default function MessageInput({ onSend, onTypingStart, onTypingStop, typingUsers, currentUsername }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [selfDestruct, setSelfDestruct] = useState(0);
  const [sending, setSending] = useState(false);
  const textRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Typing indicator logic
  const handleTextChange = (e) => {
    setText(e.target.value);
    onTypingStart();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTypingStop(), 1500);
  };

  // Send message with sending indicator
  const handleSend = useCallback(() => {
    if (!text.trim() && !imagePreview && !filePreview) return;
    if (sending) return;

    setSending(true);

    // Simulate a small delay to show sending state for large payloads
    const sendData = () => {
      if (imagePreview) {
        onSend({ type: 'image', imageData: imagePreview, text: text.trim(), selfDestruct: selfDestruct || null });
        setImagePreview(null);
      } else if (filePreview) {
        onSend({ 
          type: 'file', 
          fileData: filePreview.data, 
          fileName: filePreview.name, 
          fileSize: filePreview.size, 
          text: text.trim(),
          selfDestruct: selfDestruct || null 
        });
        setFilePreview(null);
      } else {
        onSend({ type: 'text', text: text.trim(), selfDestruct: selfDestruct || null });
      }

      setText('');
      onTypingStop();
      clearTimeout(typingTimeoutRef.current);
      setShowEmoji(false);
      setShowSticker(false);
      setSending(false);
      textRef.current?.focus();
    };

    // For media messages, show sending indicator briefly
    if (imagePreview || filePreview) {
      setTimeout(sendData, 300);
    } else {
      sendData();
    }
  }, [text, imagePreview, filePreview, selfDestruct, onSend, onTypingStop, sending]);

  // Enter key to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image upload — accepts images from camera + gallery on mobile
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Accept all image types
    if (file.type.startsWith('image/')) {
      if (file.size > 50 * 1024 * 1024) return alert('File size exceeds 50MB');
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
        setFilePreview(null);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // General file upload — accepts ANY file type (including images)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) return alert('File size exceeds 50MB');

    // If it's an image, treat as image message
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
        setFilePreview(null);
      };
      reader.readAsDataURL(file);
    } else {
      // Non-image file
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFilePreview({ name: file.name, size: file.size, data: ev.target.result });
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
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

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmoji || showSticker) {
        const picker = e.target.closest('.picker-overlay');
        const btn = e.target.closest('.input-action-btn');
        if (!picker && !btn) {
          setShowEmoji(false);
          setShowSticker(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showEmoji, showSticker]);

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

      {/* Sending indicator */}
      {sending && (
        <div className="sending-indicator">
          <div className="sending-indicator-bar" />
          <span className="sending-indicator-text">
            {imagePreview ? '📷 Sending image...' : filePreview ? '📎 Sending file...' : 'Sending...'}
          </span>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && !sending && (
        <div className="image-preview">
          <img src={imagePreview} alt="preview" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Image ready to send</span>
          <button className="image-preview-remove" onClick={() => setImagePreview(null)}>✕</button>
        </div>
      )}

      {/* File preview */}
      {filePreview && !sending && (
        <div className="image-preview" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <IconPaperclip size={24} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{filePreview.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>File ready ({(filePreview.size / 1024 / 1024).toFixed(2)} MB)</span>
          <button className="image-preview-remove" onClick={() => setFilePreview(null)}>✕</button>
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

      {/* Hidden file inputs */}
      <input 
        ref={imageInputRef}
        type="file" 
        accept="image/*" 
        capture="environment"
        onChange={handleImageSelect} 
        style={{ display: 'none' }} 
      />
      <input 
        ref={fileInputRef}
        type="file" 
        accept="*/*"
        onChange={handleFileSelect} 
        style={{ display: 'none' }} 
      />

      {/* Input row */}
      <div className="input-row">
        <div className="input-wrapper">
          <textarea
            id="chat-input"
            ref={textRef}
            className="chat-text-input"
            placeholder={imagePreview || filePreview ? 'Add a caption...' : 'Type a message...'}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={sending}
          />

          {/* Action buttons — positioned outside textarea on mobile */}
          <div className="input-actions">
            <button
              className="input-action-btn"
              onClick={() => { setShowEmoji(!showEmoji); setShowSticker(false); }}
              title="Emoji"
              type="button"
            >
              <IconSmile size={18} />
            </button>
            <button 
              className="input-action-btn" 
              title="Photo"
              type="button"
              onClick={() => imageInputRef.current?.click()}
            >
              <IconImage size={18} />
            </button>
            <button 
              className="input-action-btn" 
              title="Attach File"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconPaperclip size={18} />
            </button>
            <button
              className="input-action-btn"
              onClick={() => setSelfDestruct(selfDestruct > 0 ? 0 : 10)}
              title="Self-destruct"
              type="button"
              style={{ color: selfDestruct > 0 ? 'var(--warning)' : undefined }}
            >
              <IconClock size={18} />
            </button>
            <button
              className="input-action-btn"
              onClick={() => { setShowSticker(!showSticker); setShowEmoji(false); }}
              title="Stickers"
              type="button"
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

        <button className="send-btn" onClick={handleSend} disabled={sending || (!text.trim() && !imagePreview && !filePreview)} title="Send message">
          {sending ? (
            <div className="send-spinner" />
          ) : (
            <IconSend size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
