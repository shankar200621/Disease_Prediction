import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FooterDisclaimer from '../components/FooterDisclaimer';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

  .lg-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    display: grid; grid-template-columns: 1fr 1fr;
    background: #fafbff;
    position: relative; overflow: hidden;
  }
  @media(max-width:768px){ .lg-root { grid-template-columns: 1fr; } .lg-left { display: none !important; } }

  /* ── LEFT PANEL ── */
  .lg-left {
    background: linear-gradient(155deg, #f3edff 0%, #ede5ff 50%, #f0f9ff 100%);
    padding: 64px 56px;
    display: flex; flex-direction: column; justify-content: center;
    position: relative; overflow: hidden;
  }
  .lg-left::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 500px 400px at 10% 20%, rgba(124,58,237,0.12), transparent 60%),
      radial-gradient(ellipse 400px 400px at 90% 80%, rgba(6,182,212,0.08), transparent 60%);
    pointer-events: none;
  }
  .lg-left-inner { position: relative; z-index: 1; }

  .lg-brand {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    letter-spacing: -0.04em;
    background: linear-gradient(120deg,#7c3aed,#a855f7,#06b6d4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin-bottom: 52px; display: block;
    text-decoration: none;
  }

  .lg-left-h {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 3.8vw, 3rem);
    font-weight: 800; line-height: 1.1; letter-spacing: -0.04em;
    color: #1a0a3c; margin-bottom: 20px;
  }
  .lg-left-h .grad {
    background: linear-gradient(135deg, #7c3aed, #a855f7, #06b6d4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .lg-left-sub { font-size: 15px; line-height: 1.7; color: #6b5b95; margin-bottom: 44px; }

  .lg-features { display: flex; flex-direction: column; gap: 14px; }
  .lg-feat {
    display: flex; align-items: flex-start; gap: 14px;
    background: rgba(255,255,255,0.75);
    border: 1px solid rgba(124,58,237,0.12);
    border-radius: 16px; padding: 16px 18px;
    backdrop-filter: blur(12px);
  }
  .lg-feat-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
  }
  .lg-feat-text { font-size: 14px; color: #374151; font-weight: 500; line-height: 1.55; }

  /* ── RIGHT PANEL ── */
  .lg-right {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 48px 40px;
  }
  .lg-card {
    width: 100%; max-width: 420px;
    background: #fff;
    border: 1px solid rgba(124,58,237,0.1);
    border-radius: 28px; padding: 44px 40px;
    box-shadow: 0 24px 80px rgba(124,58,237,0.08), 0 0 0 1px rgba(124,58,237,0.06);
    position: relative; overflow: hidden;
  }
  .lg-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4);
    border-radius: 28px 28px 0 0;
  }

  .lg-tabs {
    display: flex; background: rgba(124,58,237,0.06);
    border-radius: 12px; padding: 4px; margin-bottom: 32px;
    border: 1px solid rgba(124,58,237,0.1);
  }
  .lg-tab {
    flex: 1; padding: 9px; border-radius: 9px;
    font-size: 14px; font-weight: 600;
    border: none; cursor: pointer; background: transparent;
    color: #6b5b95; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  }
  .lg-tab.active {
    background: #fff; color: #7c3aed;
    box-shadow: 0 2px 8px rgba(124,58,237,0.15);
  }

  .lg-card-h { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #1a0a3c; margin-bottom: 6px; }
  .lg-card-sub { font-size: 13px; color: #8b7aad; margin-bottom: 28px; }

  .lg-field { margin-bottom: 18px; }
  .lg-label { display: block; font-size: 12px; font-weight: 600; color: #6b5b95; margin-bottom: 7px; letter-spacing: 0.03em; text-transform: uppercase; }
  .lg-input {
    display: block; width: 100%;
    padding: 12px 16px; border-radius: 12px;
    border: 1.5px solid rgba(124,58,237,0.15);
    background: #faf9ff; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; color: #1a0a3c; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lg-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
  .lg-input::placeholder { color: #c4b5d4; }

  .lg-err { font-size: 13px; color: #dc2626; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; }

  .lg-btn-submit {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: #fff; border: none; border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 700; cursor: pointer;
    box-shadow: 0 8px 28px rgba(124,58,237,0.35);
    transition: opacity 0.2s, transform 0.2s;
    margin-bottom: 20px;
  }
  .lg-btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .lg-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .lg-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .lg-divider-line { flex: 1; height: 1px; background: rgba(124,58,237,0.1); }
  .lg-divider-txt { font-size: 12px; color: #c4b5d4; font-weight: 600; }

  .lg-btn-google {
    width: 100%; padding: 13px; border-radius: 14px;
    border: 1.5px solid rgba(124,58,237,0.15);
    background: #fff; cursor: pointer; margin-bottom: 24px;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 600; color: #374151;
    transition: border-color 0.2s, background 0.2s;
  }
  .lg-btn-google:hover { border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.02); }

  .lg-footer-txt { text-align: center; font-size: 13px; color: #8b7aad; }
  .lg-footer-btn { background: none; border: none; cursor: pointer; color: #7c3aed; font-weight: 700; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; }
  .lg-footer-btn:hover { text-decoration: underline; }
  .lg-back { display: block; text-align: center; margin-top: 16px; font-size: 12px; color: #c4b5d4; text-decoration: none; transition: color 0.2s; }
  .lg-back:hover { color: #7c3aed; }
`;

export default function Login() {
  const { login, register, isAuthenticated, ready } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (!ready) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafbff', fontFamily: 'sans-serif', color: '#7c3aed' }}>
      Loading…
    </div>
  );
  if (isAuthenticated) return <Navigate to="/home" replace />;

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (mode === 'register') await register(fullName, email, password);
      else await login(email, password);
      nav('/home', { replace: true });
    } catch (er) {
      setErr(er.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const google = async () => {
    setErr('');
    try {
      const res = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      setErr(data.message || 'Google sign-in not configured');
    } catch { setErr('Could not reach server'); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="lg-root">

        {/* ── LEFT PANEL ── */}
        <div className="lg-left">
          <div className="lg-left-inner">
            <span className="lg-brand">HealthPredict AI</span>
            <h1 className="lg-left-h">
              <span className="grad">Smarter signals.</span>
              <br />Calmer decisions.
            </h1>
            <p className="lg-left-sub">
              Clinical risk scores, knowledge graph reasoning, and a Gemini-powered AI physician — all linked to your personal health profile.
            </p>
            <div className="lg-features">
              {[
                { dot: '#7c3aed', text: 'Framingham-style cardiovascular risk with transparent scoring' },
                { dot: '#06b6d4', text: 'Live knowledge graph + Gemini-powered AI guidance' },
                { dot: '#a855f7', text: 'Dr. Ada — AI specialist chat grounded in your profile' },
              ].map((f, i) => (
                <div key={i} className="lg-feat">
                  <div className="lg-feat-dot" style={{ background: f.dot, boxShadow: `0 0 6px ${f.dot}88` }} />
                  <span className="lg-feat-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lg-right">
          <div className="lg-card">
            {/* Tabs */}
            <div className="lg-tabs">
              <button className={`lg-tab${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>Sign in</button>
              <button className={`lg-tab${mode === 'register' ? ' active' : ''}`} onClick={() => setMode('register')}>Sign up</button>
            </div>

            <h2 className="lg-card-h">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
            <p className="lg-card-sub">{mode === 'login' ? 'Sign in to continue your health journey.' : 'Join to run your first assessment free.'}</p>

            <form onSubmit={submit}>
              {mode === 'register' && (
                <div className="lg-field">
                  <label className="lg-label">Full name</label>
                  <input className="lg-input" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Jane Doe" />
                </div>
              )}
              <div className="lg-field">
                <label className="lg-label">Email</label>
                <input className="lg-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="lg-field">
                <label className="lg-label">Password</label>
                <input className="lg-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>

              {err && <div className="lg-err">{err}</div>}

              <button type="submit" className="lg-btn-submit" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <div className="lg-divider">
              <div className="lg-divider-line" />
              <span className="lg-divider-txt">or</span>
              <div className="lg-divider-line" />
            </div>

            <button className="lg-btn-google" onClick={google}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="lg-footer-txt">
              {mode === 'login' ? <>No account? <button className="lg-footer-btn" onClick={() => setMode('register')}>Sign up free</button></> : <>Have an account? <button className="lg-footer-btn" onClick={() => setMode('login')}>Sign in</button></>}
            </p>
            <Link to="/" className="lg-back">← Back to welcome screen</Link>
          </div>

          <FooterDisclaimer />
        </div>
      </div>
    </>
  );
}
