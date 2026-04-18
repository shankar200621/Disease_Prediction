import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/home',       label: 'Home'        },
  { to: '/assessment', label: 'Assessment'  },
  { to: '/dashboard',  label: 'Dashboard'   },
  { to: '/analyzer',   label: '✦ Analyzer'  },
  { to: '/graph',      label: 'Graph'       },
];

const CSS = `
  .ah-root {
    position: sticky; top: 0; z-index: 200;
    height: 62px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    transition: background 0.35s, border-color 0.35s;
  }

  /* ── LIGHT THEME ── */
  .ah-root[data-theme='light'] {
    background: rgba(250,250,255,0.88);
    border-bottom: 1px solid rgba(124,58,237,0.1);
    backdrop-filter: blur(18px) saturate(1.6);
    color: #1a0a3c;
  }
  /* ── DARK THEME ── */
  .ah-root[data-theme='dark'] {
    background: rgba(14,10,30,0.92);
    border-bottom: 1px solid rgba(168,85,247,0.15);
    backdrop-filter: blur(18px) saturate(1.4);
    color: #f0eeff;
  }

  /* Logo */
  .ah-logo {
    font-size: 16px; font-weight: 800;
    letter-spacing: -0.04em; text-decoration: none;
    background: linear-gradient(120deg,#7c3aed,#a855f7,#06b6d4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    flex-shrink: 0;
  }

  /* Nav links */
  .ah-nav { display: flex; gap: 2px; align-items: center; }
  .ah-link {
    display: block; padding: 6px 13px; border-radius: 10px;
    font-size: 13.5px; font-weight: 500; text-decoration: none;
    transition: color 0.18s, background 0.18s;
  }
  [data-theme='light'] .ah-link            { color: #6b5b95; }
  [data-theme='light'] .ah-link:hover      { color: #1a0a3c; background: rgba(124,58,237,0.07); }
  [data-theme='light'] .ah-link.ah-active  { color: #7c3aed; background: rgba(124,58,237,0.1); font-weight: 600; }

  [data-theme='dark']  .ah-link            { color: #9880c8; }
  [data-theme='dark']  .ah-link:hover      { color: #e0d8ff; background: rgba(168,85,247,0.1); }
  [data-theme='dark']  .ah-link.ah-active  { color: #c4b5fd; background: rgba(168,85,247,0.15); font-weight: 600; }

  /* Right group */
  .ah-right { display: flex; align-items: center; gap: 10px; }

  /* Theme toggle */
  .ah-theme-btn {
    display: flex; align-items: center; gap: 7px;
    cursor: pointer; user-select: none;
    padding: 5px 10px; border-radius: 100px;
    border: none; background: transparent;
    font-size: 13px; font-weight: 600; font-family: inherit;
    transition: background 0.2s;
  }
  [data-theme='light'] .ah-theme-btn { color: #6b5b95; }
  [data-theme='light'] .ah-theme-btn:hover { background: rgba(124,58,237,0.07); }
  [data-theme='dark']  .ah-theme-btn { color: #9880c8; }
  [data-theme='dark']  .ah-theme-btn:hover { background: rgba(168,85,247,0.1); }

  .ah-toggle-track {
    width: 38px; height: 21px; border-radius: 100px;
    position: relative; flex-shrink: 0; transition: background 0.3s;
  }
  [data-theme='light'] .ah-toggle-track { background: rgba(124,58,237,0.2); }
  [data-theme='dark']  .ah-toggle-track { background: rgba(168,85,247,0.4); }
  .ah-toggle-thumb {
    position: absolute; top: 2.5px; left: 2.5px;
    width: 16px; height: 16px; border-radius: 50%;
    background: #7c3aed;
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
  }
  .ah-toggle-thumb.on { transform: translateX(17px); background: #a855f7; }

  /* Divider */
  .ah-sep { width: 1px; height: 22px; background: rgba(124,58,237,0.15); margin: 0 4px; }
  [data-theme='dark'] .ah-sep { background: rgba(168,85,247,0.2); }

  /* User chip */
  .ah-user {
    display: flex; align-items: center; gap: 8px;
    font-size: 12.5px; font-weight: 600;
    padding: 5px 12px; border-radius: 100px;
    border: 1.5px solid; cursor: pointer;
    transition: background 0.2s;
  }
  [data-theme='light'] .ah-user { color: #6b5b95; border-color: rgba(124,58,237,0.18); }
  [data-theme='light'] .ah-user:hover { background: rgba(124,58,237,0.06); }
  [data-theme='dark']  .ah-user { color: #c4b5fd; border-color: rgba(168,85,247,0.25); }
  [data-theme='dark']  .ah-user:hover { background: rgba(168,85,247,0.1); }

  .ah-user-dot {
    width: 24px; height: 24px; border-radius: 50%;
    background: linear-gradient(135deg,#7c3aed,#a855f7);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }

  /* Logout btn */
  .ah-logout {
    font-family: inherit; font-size: 13px; font-weight: 600;
    padding: 7px 16px; border-radius: 100px; cursor: pointer;
    border: 1.5px solid; transition: background 0.2s, color 0.2s;
    background: transparent;
  }
  [data-theme='light'] .ah-logout { color: #dc2626; border-color: rgba(220,38,38,0.2); }
  [data-theme='light'] .ah-logout:hover { background: rgba(220,38,38,0.06); }
  [data-theme='dark']  .ah-logout { color: #f87171; border-color: rgba(248,113,113,0.25); }
  [data-theme='dark']  .ah-logout:hover { background: rgba(248,113,113,0.08); }

  /* Mobile hamburger */
  .ah-hamburger {
    display: none; width: 36px; height: 36px; border-radius: 10px;
    border: 1.5px solid; background: transparent; cursor: pointer;
    align-items: center; justify-content: center; font-size: 17px;
  }
  [data-theme='light'] .ah-hamburger { border-color: rgba(124,58,237,0.2); color: #7c3aed; }
  [data-theme='dark']  .ah-hamburger { border-color: rgba(168,85,247,0.25); color: #c4b5fd; }

  /* Mobile drawer */
  .ah-overlay {
    position: fixed; inset: 0; z-index: 199;
    background: rgba(0,0,0,0.28); backdrop-filter: blur(4px);
  }
  .ah-drawer {
    position: fixed; top: 62px; left: 0; right: 0; z-index: 200;
    border-bottom: 1px solid; padding: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    font-family: inherit;
  }
  [data-theme='light'] .ah-drawer { background: rgba(250,250,255,0.98); border-color: rgba(124,58,237,0.1); }
  [data-theme='dark']  .ah-drawer { background: rgba(14,10,30,0.98); border-color: rgba(168,85,247,0.15); }

  .ah-drawer-link {
    display: block; padding: 12px 14px; border-radius: 12px;
    font-size: 15px; font-weight: 500; text-decoration: none;
    transition: background 0.18s, color 0.18s;
  }
  [data-theme='light'] .ah-drawer-link       { color: #374151; }
  [data-theme='light'] .ah-drawer-link:hover { background: rgba(124,58,237,0.07); color: #7c3aed; }
  [data-theme='light'] .ah-drawer-link.ah-active { background: rgba(124,58,237,0.1); color: #7c3aed; font-weight: 600; }
  [data-theme='dark']  .ah-drawer-link       { color: #c4b5fd; }
  [data-theme='dark']  .ah-drawer-link:hover { background: rgba(168,85,247,0.1); color: #e0d8ff; }
  [data-theme='dark']  .ah-drawer-link.ah-active { background: rgba(168,85,247,0.15); color: #e0d8ff; font-weight: 600; }

  .ah-drawer-sep { height: 1px; margin: 12px 0; }
  [data-theme='light'] .ah-drawer-sep { background: rgba(124,58,237,0.1); }
  [data-theme='dark']  .ah-drawer-sep { background: rgba(168,85,247,0.15); }

  .ah-drawer-action {
    display: block; width: 100%; padding: 12px 14px; border-radius: 12px;
    font-family: inherit; font-size: 14px; font-weight: 600;
    text-align: left; cursor: pointer; border: none; background: transparent;
    transition: background 0.18s;
  }
  [data-theme='light'] .ah-drawer-action { color: #dc2626; }
  [data-theme='light'] .ah-drawer-action:hover { background: rgba(220,38,38,0.06); }
  [data-theme='dark']  .ah-drawer-action { color: #f87171; }
  [data-theme='dark']  .ah-drawer-action:hover { background: rgba(248,113,113,0.08); }

  @media (max-width: 860px) {
    .ah-root { padding: 0 20px; }
    .ah-nav { display: none; }
    .ah-sep, .ah-user, .ah-logout { display: none; }
    .ah-hamburger { display: flex; }
    .ah-theme-btn .ah-theme-label { display: none; }
  }
`;

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('hp_theme') === 'dark'; } catch { return false; }
  });

  if (pathname === '/graph') return null;

  const toggleTheme = () => {
    setDark(d => {
      const next = !d;
      try { localStorage.setItem('hp_theme', next ? 'dark' : 'light'); } catch {}
      // Apply to <html> for any pages that inherit it
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setOpen(false);
  };

  const theme = dark ? 'dark' : 'light';
  const initials = user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Me';

  return (
    <>
      <style>{CSS}</style>
      <header className="ah-root" data-theme={theme}>

        {/* Logo */}
        <Link to="/home" className="ah-logo" onClick={() => setOpen(false)}>
          HealthPredict AI
        </Link>

        {/* Nav */}
        <nav className="ah-nav">
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`ah-link${pathname === to ? ' ah-active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="ah-right">

          {/* Theme toggle */}
          <button className="ah-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <span>{dark ? '🌙' : '☀️'}</span>
            <div className="ah-toggle-track">
              <div className={`ah-toggle-thumb${dark ? ' on' : ''}`} />
            </div>
            <span className="ah-theme-label">{dark ? 'Dark' : 'Light'}</span>
          </button>

          <div className="ah-sep" />

          {/* User chip */}
          <div className="ah-user" title={displayName}>
            <div className="ah-user-dot">{initials}</div>
            <span>{displayName}</span>
          </div>

          {/* Logout */}
          <button className="ah-logout" onClick={doLogout}>Log out</button>

          {/* Mobile hamburger */}
          <button
            className="ah-hamburger"
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <button className="ah-overlay" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="ah-drawer" data-theme={theme}>
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`ah-drawer-link${pathname === to ? ' ah-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="ah-drawer-sep" />
            <button className="ah-drawer-action" onClick={toggleTheme}>
              {dark ? '☀️  Switch to Light' : '🌙  Switch to Dark'}
            </button>
            <button className="ah-drawer-action" onClick={doLogout}>
              Log out
            </button>
          </div>
        </>
      )}
    </>
  );
}
