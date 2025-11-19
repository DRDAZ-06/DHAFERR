'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';

interface AdminFile {
  name: string;
  size: number;
  uploadDate: string;
  url: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function HiddenAdminPage() {
  const router = useRouter();
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [featuredName, setFeaturedName] = useState<string | null>(null);
  const [settingFeatured, setSettingFeatured] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/files', { cache: 'no-store' });
      if (response.status === 401) {
        router.replace('/login');
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load files');
      }
      setFiles(data.files);
    } catch (err) {
      console.error('Error loading files:', err);
      setMessage(err instanceof Error ? err.message : 'Unable to load files');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const fetchFeatured = useCallback(async () => {
    try {
      const response = await fetch('/api/featured', { cache: 'no-store' });
      const data = await response.json();
      if (response.ok && data.success) {
        setFeaturedName(data.file?.name ?? null);
      }
    } catch (error) {
      console.warn('Unable to load featured file', error);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const handleDelete = async (fileName: string) => {
    if (!window.confirm(`Delete ${fileName}? This cannot be undone.`)) {
      return;
    }
    setDeleting(fileName);
    setMessage('');
    try {
      const response = await fetch(`/api/files?file=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });
      if (response.status === 401) {
        router.replace('/login');
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete file');
      }
      setFiles((prev) => prev.filter((file) => file.name !== fileName));
      if (featuredName === fileName) {
        setFeaturedName(null);
        fetchFeatured();
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      setMessage(err instanceof Error ? err.message : 'Unable to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  };

  const handleSetFeatured = async (fileName: string) => {
    setSettingFeatured(fileName);
    setMessage('');
    try {
      const response = await fetch('/api/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      if (response.status === 401) {
        router.replace('/login');
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to set featured file');
      }
      setFeaturedName(data.file?.name ?? fileName);
    } catch (err) {
      console.error('Error setting featured file:', err);
      setMessage(err instanceof Error ? err.message : 'Unable to set featured file');
    } finally {
      setSettingFeatured(null);
    }
  };

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    return files.filter((file) => file.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [files, search]);

  const stats = useMemo(() => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const pdfCount = files.filter((file) => file.name.toLowerCase().endsWith('.pdf')).length;
    return {
      totalSize: formatFileSize(totalSize),
      pdfCount,
    };
  }, [files]);

  return (
    <main className="admin-shell">
      <div className="orb orb--blue" />
      <div className="orb orb--violet" />

      <section className="glass-panel admin-panel">
        <div className="admin-header">
          <div className="admin-header__group">
            <span className="status-pill">Hidden channel</span>
            <h1>/adminx22 Control Room</h1>
            <p className="panel-header__subtitle">
              Upload PDFs here and they will instantly surface on the public vault.
            </p>
          </div>
          <div className="nav-actions">
            <Link href="/" className="btn btn-secondary-dark">
              View Public Site
            </Link>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat-card">
          <p className="stat-card__label">Files Live</p>
          <p className="stat-card__value">{files.length}</p>
          <p className="stat-card__hint">Visible on the homepage</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">PDF Ready</p>
          <p className="stat-card__value">{stats.pdfCount}</p>
          <p className="stat-card__hint">Preview capable</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Storage Footprint</p>
          <p className="stat-card__value">{stats.totalSize}</p>
          <p className="stat-card__hint">Approximate total</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Current Display</p>
          <p className="stat-card__value">{featuredName ? 'Active' : 'None'}</p>
          <p className="stat-card__hint">{featuredName || 'Select a file below'}</p>
        </div>
      </section>

      <section className="admin-grid">
        <div className="glass-panel admin-panel">
          <div className="panel-header">
            <div className="panel-header__meta">
              <p className="panel-header__title">Upload Panel</p>
              <p className="panel-header__subtitle">
                Drop a PDF (or any asset) to broadcast it to every visitor.
              </p>
            </div>
            <span className="status-pill">Secure</span>
          </div>
          <FileUpload onUploadComplete={loadFiles} />
        </div>

        <div className="glass-panel admin-panel">
          <div className="toolbar">
            <div>
              <p className="panel-header__title" style={{ margin: 0 }}>Files in Circulation</p>
              <p className="panel-header__subtitle">Click view to open the public-facing URL.</p>
            </div>
            <div className="nav-actions">
              <span className={`chip ${featuredName ? 'chip--glow' : ''}`}>
                {featuredName ? `Displaying: ${featuredName}` : 'No display set'}
              </span>
              <input
                type="search"
                placeholder="Search filename"
                className="ghost-input ghost-input--condensed"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary-dark"
                onClick={loadFiles}
                disabled={loading}
              >
                {loading ? 'Syncing…' : 'Sync Now'}
              </button>
            </div>
          </div>

          {message && <div className="toast">{message}</div>}

          {loading && files.length === 0 ? (
            <div className="file-empty">
              <div className="spinner" />
              <p>Loading your files…</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="file-empty">
              <p>No files match your search.</p>
            </div>
          ) : (
            <div className="admin-list">
              {filteredFiles.map((file) => (
                <div key={file.name} className="admin-row">
                  <div className="admin-row__meta">
                    <strong>{file.name}</strong>
                    <small>
                      {formatDateTime(file.uploadDate)} · {formatFileSize(file.size)}
                    </small>
                  </div>
                  <div className="admin-row__actions">
                    <button
                      type="button"
                      className={
                        featuredName === file.name ? 'btn btn-ghost' : 'btn btn-primary-dark'
                      }
                      onClick={() => handleSetFeatured(file.name)}
                      disabled={settingFeatured === file.name}
                    >
                      {featuredName === file.name
                        ? 'Displaying'
                        : settingFeatured === file.name
                        ? 'Setting…'
                        : 'Display'}
                    </button>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary-dark"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(file.name)}
                      disabled={deleting === file.name}
                    >
                      {deleting === file.name ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
