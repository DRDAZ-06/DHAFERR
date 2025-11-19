'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/adminx22');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="orb orb--blue" />
      <div className="orb orb--violet" />

      <div className="auth-card glass-panel">
        <div className="auth-header">
          <p className="eyebrow">Restricted Entry</p>
          <h1>Control Room Access</h1>
          <p className="hero-description">
            Authenticate to reach the hidden dashboard at <code>/adminx22</code> and broadcast new files.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="panel-header__subtitle">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="ghost-input"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="panel-header__subtitle">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="ghost-input"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && <div className="toast">{error}</div>}

          <button type="submit" className="btn btn-primary-dark" disabled={loading}>
            {loading ? <div className="spinner spinner--sm" /> : 'Enter Control Room'}
          </button>
        </form>

        <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
          <Link href="/" className="btn btn-secondary-dark" style={{ width: '100%' }}>
            Back to Public Site
          </Link>
        </div>

        <p className="auth-footnote">Protected by signed JWT sessions · Auto logout available inside</p>
      </div>
    </main>
  );
}
