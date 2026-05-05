/**
 * MemberSidebar.jsx — Participant list with host badge, online/typing status
 */
import React from 'react';

export default function MemberSidebar({ members, typingUsers }) {
  return (
    <div>
      {members.map((member) => (
        <div key={member.socketId} className="member-item">
          <div className="member-avatar">
            {member.username.charAt(0).toUpperCase()}
            <span className={`member-status ${member.online ? 'online' : 'offline'}`} />
          </div>
          <div className="member-info">
            <div className="member-name">
              {member.username}
              {member.isHost && <span className="host-badge">HOST</span>}
            </div>
            {typingUsers.has(member.username) && (
              <span className="member-typing-label">typing...</span>
            )}
          </div>
        </div>
      ))}
      {members.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>
          No members yet
        </p>
      )}
    </div>
  );
}
