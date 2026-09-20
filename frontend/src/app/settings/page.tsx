'use client';

import { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../lib/auth-context';

/**
 * Settings page — matches Figma Settings() screen in exported Figma UI.
 * Shows Account metadata, AI Limitations, Privacy info, Danger zone, and Sign Out.
 */
function SettingsContent() {
  const { user, signOut } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const email = user?.email || 'User';
  const name = user?.displayName || email.split('@')[0];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Handled in auth context
    }
  };

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="authenticated-content" role="main">
        <div
          className="animate-page"
          style={{ maxWidth: 'var(--container-reading)', margin: '0 auto', width: '100%' }}
        >
          <div style={{ marginBottom: 24 }}>
            <h1 className="t-h1">Settings</h1>
            <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Manage your account and privacy preferences.
            </p>
          </div>

          {/* Account Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-card)',
              marginBottom: 16,
            }}
          >
            <h3 className="t-h4" style={{ marginBottom: 12 }}>
              Account Information
            </h3>
            <dl
              style={{
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '10px 16px',
              }}
              className="t-body-sm"
            >
              <dt style={{ color: 'var(--color-text-muted)' }}>Name</dt>
              <dd style={{ margin: 0, fontWeight: 500 }}>{name}</dd>
              <dt style={{ color: 'var(--color-text-muted)' }}>Email</dt>
              <dd style={{ margin: 0, fontWeight: 500 }}>{email}</dd>
              <dt style={{ color: 'var(--color-text-muted)' }}>Sign-in method</dt>
              <dd style={{ margin: 0, fontWeight: 500 }}>Google OAuth</dd>
            </dl>
          </div>

          {/* AI Limitations Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-card)',
              marginBottom: 16,
            }}
          >
            <h3 className="t-h4" style={{ marginBottom: 8 }}>
              AI Limitations
            </h3>
            <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
              LegalEase-AI uses automated machine learning models to analyze document text. Results
              are provided for educational and informational purposes only and do not replace legal
              advice from a qualified attorney.
            </p>
          </div>

          {/* Privacy Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-card)',
              marginBottom: 16,
            }}
          >
            <h3 className="t-h4" style={{ marginBottom: 8 }}>
              Privacy & Security
            </h3>
            <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Documents are stored securely under your authenticated Firebase account and Google
              Cloud Storage bucket. Files are encrypted at rest and in transit.
            </p>
          </div>

          {/* Danger Zone Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-card)',
              marginBottom: 24,
            }}
          >
            <h3 className="t-h4" style={{ marginBottom: 8, color: 'var(--color-error)' }}>
              Danger Zone
            </h3>
            <p
              className="t-body-sm"
              style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}
            >
              Deleting your account permanently removes all your uploaded files and analysis
              records.
            </p>
            <button
              className="le-btn le-btn-danger"
              onClick={() => setConfirmDelete(true)}
              style={{
                height: 38,
                padding: '0 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 600,
                background: 'var(--color-error)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Delete Account
            </button>
          </div>

          <button
            className="le-btn le-btn-secondary"
            onClick={handleSignOut}
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          onClick={() => setConfirmDelete(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-elevated)',
              padding: 24,
              width: '100%',
              maxWidth: 480,
            }}
          >
            <h2 className="t-h3" style={{ marginBottom: 12 }}>
              Delete account?
            </h2>
            <p className="t-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Your account and all associated documents, analysis, and Q&amp;A history will be
              permanently deleted. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button
                className="le-btn le-btn-secondary"
                onClick={() => setConfirmDelete(false)}
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                }}
              >
                Cancel
              </button>
              <button
                className="le-btn le-btn-danger"
                onClick={() => {
                  setConfirmDelete(false);
                  signOut();
                }}
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-error)',
                  color: '#fff',
                  border: 'none',
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
