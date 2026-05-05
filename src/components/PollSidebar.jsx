/**
 * PollSidebar.jsx — Poll list & create poll form
 * Anyone can create polls with 2–5 options. Live bar-chart results.
 */
import React, { useState } from 'react';
import PollCreate from './PollCreate';

export default function PollSidebar({ polls, currentUsername, onCreatePoll, onVote }) {
  const [showCreate, setShowCreate] = useState(false);

  const handleCreatePoll = (data) => {
    onCreatePoll(data, (response) => {
      if (response.success) {
        setShowCreate(false);
      }
    });
  };

  return (
    <div>
      <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? '✕ Cancel' : '➕ New Poll'}
        </button>
      </div>

      {showCreate && (
        <PollCreate onCreate={handleCreatePoll} onCancel={() => setShowCreate(false)} />
      )}

      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
        const userVotedIndex = poll.options.findIndex(opt => opt.votes.includes(currentUsername));

        return (
          <div key={poll.id} className="poll-card">
            <div className="poll-question">{poll.question}</div>
            {poll.options.map((option, idx) => {
              const pct = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
              return (
                <div
                  key={idx}
                  className={`poll-option ${userVotedIndex === idx ? 'voted' : ''}`}
                  onClick={() => onVote({ pollId: poll.id, optionIndex: idx })}
                >
                  <div className="poll-bar" style={{ width: `${pct}%` }} />
                  <div className="poll-option-content">
                    <span>{option.text}</span>
                    <span className="poll-votes">{option.votes.length} ({Math.round(pct)}%)</span>
                  </div>
                </div>
              );
            })}
            <div className="poll-meta">
              Created by {poll.createdBy} · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            </div>
          </div>
        );
      })}

      {polls.length === 0 && !showCreate && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>
          No active polls
        </p>
      )}
    </div>
  );
}
