'use client';

import { useEffect, useState } from 'react';

interface FeaturedFile {
  name: string;
  size: number;
  uploadDate: string;
  url: string;
}

const isPdf = (file?: FeaturedFile | null) => file?.name.toLowerCase().endsWith('.pdf') ?? false;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString();
};

export default function Home() {
  const [file, setFile] = useState<FeaturedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isIdle = !file && !loading && !error;
  const statusText = file ? 'Online' : loading ? 'Syncing' : error ? 'Error' : '★';

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/featured', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Display feed unavailable');
        }

        setFile(data.file);
      } catch (err) {
        console.error('Error loading featured file', err);
        setFile(null);
        setError('Display feed offline. Admin has not selected a file yet.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <main className="display-shell">
      <div className="display-panel">
        <header className="display-header">
          <div>
            <p className="display-eyebrow">Public Broadcast</p>
            <h1>Featured Document</h1>
          </div>
          <span
            className={`status-pill${isIdle ? ' status-pill--idle' : ''}`}
            aria-label={isIdle ? 'Idle' : undefined}
            title={isIdle ? 'Idle' : undefined}
          >
            {statusText}
          </span>
        </header>

        <section className="display-stage">
          {loading ? (
            <div className="display-empty">
              <div className="spinner" />
              <p>Syncing with control room…</p>
            </div>
          ) : error ? (
            <div className="display-empty">
              <p>{error}</p>
            </div>
          ) : !file ? (
            <div className="display-empty">
              <p>No document is currently selected. Check back when the admin enables one.</p>
            </div>
          ) : (
            <>
              <div className="display-meta">
                <div>
                  <p className="display-title">{file.name}</p>
                  <p className="display-meta-line">
                    {formatFileSize(file.size)} · {formatDate(file.uploadDate)}
                  </p>
                </div>
                <div className="display-actions">
                  <a
                    href={file.url}
                    download
                    className="btn btn-secondary-dark"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                  <a
                    href={file.url}
                    className="btn btn-primary-dark"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Tab
                  </a>
                </div>
              </div>

              {isPdf(file) ? (
                <iframe
                  key={file.url}
                  src={`${file.url}#toolbar=0&navpanes=0`}
                  className="display-frame"
                  title={`Preview of ${file.name}`}
                />
              ) : (
                <div className="display-empty">
                  <p>This spotlight is reserved for PDF files.</p>
                  <p>The selected file is not a PDF, so please download it instead.</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

