/**
 * StickerPicker.jsx — Grid of emoji-based stickers
 */
import React from 'react';

const STICKERS = [
  '👋', '🎉', '🥳', '🤩', '😎', '🤯',
  '💃', '🕺', '🦄', '🐱', '🐶', '🦊',
  '🌈', '🌸', '🔥', '💎', '🚀', '⚡',
  '🎯', '🏆', '💖', '🎭', '🎨', '🎪',
  '👑', '🧸', '🎸', '🎮', '🍕', '☕',
];

export default function StickerPicker({ onSelect, onClose }) {
  return (
    <div className="picker-panel">
      <div className="picker-header">
        <span>🎨 Stickers</span>
        <button
          className="btn-icon"
          onClick={onClose}
          style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}
        >
          ✕
        </button>
      </div>
      <div className="sticker-grid">
        {STICKERS.map((sticker) => (
          <button
            key={sticker}
            className="sticker-btn"
            onClick={() => onSelect(sticker)}
          >
            {sticker}
          </button>
        ))}
      </div>
    </div>
  );
}
