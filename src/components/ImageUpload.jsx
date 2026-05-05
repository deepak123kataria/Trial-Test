/**
 * ImageUpload.jsx — Drag-and-drop + file picker image upload
 */
import React, { useRef, useState, useCallback } from 'react';

export default function ImageUpload({ onImageSelect }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      onImageSelect(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`image-upload ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <span style={{ fontSize: '1.5rem' }}>📎</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        {isDragging ? 'Drop here!' : 'Click or drag image'}
      </span>
    </div>
  );
}
