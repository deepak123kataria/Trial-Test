/**
 * PollCreate.jsx — Form to create a new poll (2–5 options)
 */
import React, { useState } from 'react';

export default function PollCreate({ onCreate, onCancel }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    if (options.length < 5) setOptions([...options, '']);
  };

  const removeOption = (idx) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const updateOption = (idx, value) => {
    const next = [...options];
    next[idx] = value;
    setOptions(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim());
    if (!question.trim() || validOptions.length < 2) return;
    onCreate({ question: question.trim(), options: validOptions });
  };

  return (
    <form className="create-poll-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          className="form-input"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ fontSize: '0.85rem' }}
        />
      </div>
      {options.map((opt, idx) => (
        <div key={idx} className="poll-option-input-row">
          <input
            className="form-input"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={(e) => updateOption(idx, e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.7rem' }}
          />
          {options.length > 2 && (
            <button type="button" className="remove-opt" onClick={() => removeOption(idx)}>✕</button>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
        {options.length < 5 && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={addOption}>
            + Add Option
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          style={{ marginLeft: 'auto' }}
          disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
        >
          Create Poll
        </button>
      </div>
    </form>
  );
}
