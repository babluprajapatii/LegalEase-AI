import { useCallback, useEffect, useState } from 'react';
import { AppContext, type Route } from './nav';
import { Toast, type ToastKind } from './components';
import {
  IconDashboard, IconDocument, IconUpload, IconCompare, IconHistory,
  IconSettings, IconMenu, IconClose, IconChevron,
} from './icons';
import { USER } from './data';
import {
  Landing, Auth, Dashboard, Upload, Processing, Analysis, QA, Compare, NextSteps, History, Settings,
} from './screens';

interface NavItem { id: Route; label: string; icon: (p: { size?: number }) => React.ReactElement }
const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { id: 'history', label: 'Documents', icon: IconDocument },
  { id: 'upload', label: 'Upload', icon: IconUpload },
  { id: 'compare', label: 'Compare', icon: IconCompare },
  { id: 'history', label: 'History', icon: IconHistory },
  { id: 'settings', label: 'Settings', icon: IconSettings },
];
const MOBILE_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { id: 'history', label: 'Documents', icon: IconDocument },
  { id: 'upload', label: 'Upload', icon: IconUpload },
  { id: 'compare', label: 'Compare', icon: IconCompare },
  { id: 'history', label: 'History', icon: IconHistory },
];

interface ToastItem { id: number; kind: ToastKind; message: string }

export default function App() {
  const [route, setRoute] = useState<Route>('landing');
  const [authed, setAuthed] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toast = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    if (kind !== 'error') setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    setMenuOpen(false);
    setProfileOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const signIn = useCallback(() => { setAuthed(true); setRoute('dashboard'); }, []);
  const signOut = useCallback(() => { setAuthed(false); setRoute('landing'); }, []);

  useEffect(() => { if (!authed && !['landing', 'auth'].includes(route)) setRoute('landing'); }, [authed, route]);

  const ctx = { route, navigate, toast, authed, signIn, signOut, hasDocuments, setHasDocuments };

  const screen = () => {
    switch (route) {
      case 'landing': return <Landing />;
      case 'auth': return <Auth />;
      case 'dashboard': return <Dashboard />;
      case 'upload': return <Upload />;
      case 'processing': return <Processing />;
      case 'analysis': return <Analysis />;
      case 'qa': return <QA />;
      case 'compare': return <Compare />;
      case 'nextsteps': return <NextSteps />;
      case 'history': return <History />;
      case 'settings': return <Settings />;
    }
  };

  const isPublic = route === 'landing' || route === 'auth';

  return (
    <AppContext.Provider value={ctx}>
      <a href="#main" className="skip-link">Skip to content</a>

      {isPublic ? (
        screen()
      ) : (
        <div className="app-shell">
          {/* Sidebar (desktop) */}
          <aside className="sidebar" aria-label="Primary navigation">
            <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary)', color: '#fff' }}><IconDocument size={18} /></span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>LegalEase-AI</span>
            </div>

            <div style={{ padding: '8px 12px' }}>
              <button onClick={() => navigate('upload')} style={{ width: '100%', height: 40, borderRadius: 6, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <IconUpload size={18} />Upload
              </button>
            </div>

            <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV.filter((n, i) => NAV.findIndex((m) => m.label === n.label) === i).map((n) => (
                <NavButton key={n.label} item={n} active={route === n.id} onClick={() => navigate(n.id)} />
              ))}
            </nav>

            <ProfileArea onSettings={() => navigate('settings')} onSignOut={signOut} open={profileOpen} setOpen={setProfileOpen} />
          </aside>

          {/* Mobile top bar */}
          <header className="topbar">
            <button aria-label="Open menu" onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)', display: 'flex', padding: 8 }}><IconMenu size={22} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: 'var(--color-primary)', color: '#fff' }}><IconDocument size={15} /></span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>LegalEase-AI</span>
            </div>
            <button aria-label="Account" onClick={() => navigate('settings')} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{USER.initial}</button>
          </header>

          {/* Mobile drawer */}
          {menuOpen && (
            <div className="drawer-overlay" onClick={() => setMenuOpen(false)}>
              <nav className="drawer" onClick={(e) => e.stopPropagation()} aria-label="Menu">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Menu</span>
                  <button aria-label="Close menu" onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><IconClose size={22} /></button>
                </div>
                {NAV.filter((n, i) => NAV.findIndex((m) => m.label === n.label) === i).map((n) => (
                  <NavButton key={n.label} item={n} active={route === n.id} onClick={() => navigate(n.id)} />
                ))}
                <button onClick={signOut} className="t-body-sm" style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '12px 14px', textAlign: 'left' }}>Sign out</button>
              </nav>
            </div>
          )}

          {/* Main content */}
          <main id="main" className="main-area">
            {screen()}
          </main>

          {/* Mobile bottom tab bar */}
          <nav className="bottom-nav" aria-label="Primary">
            {MOBILE_NAV.map((n) => {
              const active = route === n.id;
              return (
                <button key={n.label} onClick={() => navigate(n.id)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 2px', minHeight: 48, color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  <n.icon size={20} />
                  <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Toast host */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 300, maxWidth: 'calc(100vw - 40px)' }} className="toast-host">
        {toasts.map((t) => <Toast key={t.id} kind={t.kind} message={t.message} onDismiss={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))} />)}
      </div>
    </AppContext.Provider>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', minHeight: 44,
        borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: active ? 600 : 500,
        border: 'none', borderLeft: `3px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
        background: active ? 'var(--color-primary-light)' : 'transparent',
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        transition: 'background var(--transition-normal)',
      }}
      className="le-nav"
    >
      <item.icon size={20} />{item.label}
    </button>
  );
}

function ProfileArea({ onSettings, onSignOut, open, setOpen }: { onSettings: () => void; onSignOut: () => void; open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <div style={{ borderTop: '1px solid var(--color-border)', padding: 12, position: 'relative' }}>
      {open && (
        <div style={{ position: 'absolute', bottom: 'calc(100% - 4px)', left: 12, right: 12, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: 'var(--shadow-dropdown)', overflow: 'hidden' }}>
          <button onClick={onSettings} className="le-nav" style={{ width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Settings</button>
          <button onClick={onSignOut} className="le-nav" style={{ width: '100%', textAlign: 'left', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--color-error)' }}>Sign out</button>
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{USER.initial}</span>
        <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{USER.name}</span>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{USER.email}</span>
        </span>
        <span style={{ transform: open ? 'rotate(-90deg)' : 'rotate(90deg)', color: 'var(--color-text-muted)', display: 'flex' }}><IconChevron size={16} /></span>
      </button>
    </div>
  );
}
