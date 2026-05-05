/**
 * EmojiPicker.jsx — Grid of common emojis
 */
import React from 'react';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
  '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏',
  '😒', '🙄', '😬', '😮', '😯', '😲', '😳', '🥺',
  '😢', '😭', '😤', '😡', '🤬', '😈', '👿', '💀',
  '💩', '🤡', '👻', '👽', '🤖', '🎃', '😺', '😸',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌',
  '🙏', '🤝', '💪', '✌️', '🤘', '👌', '🤙', '👋',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '💯', '💥', '🔥', '⭐', '🌟', '✨', '💫', '🎉',
  '🎊', '🏆', '🥇', '🎯', '🚀', '💎', '🔮', '🌈',
];

export default function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="picker-panel">
      <div className="picker-header">
        <span>😊 Emoji</span>
        <button
          className="btn-icon"
          onClick={onClose}
          style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}
        >
          ✕
        </button>
      </div>
      <div className="emoji-grid">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            className="emoji-btn"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
