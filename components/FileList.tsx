'use client';

interface FileListProps {
  files: Array<{
    name: string;
    size: number;
    uploadDate: string;
    url: string;
  }>;
  onDelete: (fileName: string) => void;
}

export default function FileList({ files, onDelete }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return '🖼️';
    if (['pdf'].includes(ext || '')) return '📄';
    if (['zip', 'rar', '7z'].includes(ext || '')) return '📦';
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return '🎥';
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return '🎵';
    if (['doc', 'docx', 'txt'].includes(ext || '')) return '📝';
    return '📁';
  };

  if (files.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--spacing-xl)',
        color: '#9CA3AF',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-2 gap-md">
      {files.map((file) => (
        <div
          key={file.name}
          className="glass-card"
          style={{
            padding: 'var(--spacing-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
          }}
        >
          <div className="flex justify-between items-center">
            <div style={{
              fontSize: '2rem',
            }}>
              {getFileIcon(file.name)}
            </div>
            <button
              onClick={() => onDelete(file.name)}
              className="btn btn-danger"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
              }}
            >
              Delete
            </button>
          </div>

          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '0.25rem',
              wordBreak: 'break-all',
              color: '#1F2937',
            }}>
              {file.name}
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#6B7280',
              marginBottom: '0.5rem',
            }}>
              {formatFileSize(file.size)}
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: '#9CA3AF',
            }}>
              Uploaded: {formatDate(file.uploadDate)}
            </p>
          </div>

          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}
          >
            View/Download
          </a>
        </div>
      ))}
    </div>
  );
}
