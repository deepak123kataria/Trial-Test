/**
 * ReactionBar.jsx — Quick reaction emoji bar (displayed on hover)
 */
import React from 'react';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function ReactionBar({ onReact }) {
  return (
    <div className="reaction-bar">
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          className="reaction-btn"
          onClick={() => onReact(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
