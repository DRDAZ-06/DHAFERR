'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setMessage(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'File uploaded successfully! It will appear on the main page.' });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setTimeout(() => {
          setMessage(null);
          setProgress(0);
        }, 3000);
        onUploadComplete?.();
      } else {
        setMessage({ type: 'error', text: data.message || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload file' });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--glass-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-xl)',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(139, 92, 246, 0.1)' : 'rgba(42, 42, 42, 0.4)',
          transition: 'all var(--transition-base)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {dragging ? '📂' : '📁'}
        </div>
        
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
          {selectedFile ? selectedFile.name : 'Drop your file here'}
        </h3>
        
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          {selectedFile
            ? formatFileSize(selectedFile.size)
            : 'or click to browse'}
        </p>
        
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
          Maximum file size: 10MB
        </p>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(139, 92, 246, 0.2)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'var(--gradient-primary)',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            }} />
          </div>
          <p style={{
            textAlign: 'center',
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
          }}>
            Uploading... {progress}%
          </p>
        </div>
      )}

      {/* Message */}
      {message && (
        <div style={{
          marginTop: 'var(--spacing-md)',
          padding: '0.875rem',
          borderRadius: 'var(--radius-md)',
          background: message.type === 'success'
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success'
            ? 'rgba(16, 185, 129, 0.3)'
            : 'rgba(239, 68, 68, 0.3)'}`,
          color: message.type === 'success' ? '#6EE7B7' : '#FCA5A5',
          fontSize: '0.875rem',
        }}>
          {message.text}
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !uploading && (
        <button
          onClick={handleUpload}
          className="btn btn-primary-dark"
          style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
        >
          Upload File
        </button>
      )}
    </div>
  );
}
