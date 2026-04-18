import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Splash() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav('/login', { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <>
      <style>{`
        .sp-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: linear-gradient(155deg, #f5f0ff 0%, #fefefe 55%, #f0f9ff 100%);
          position: relative; overflow: hidden;
          padding: 40px 24px;
        }

        /* Ambient blobs */
        .sp-root::before {
          content: '';
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 600px 500px at 20% 30%, rgba(124,58,237,0.1), transparent 70%),
            radial-gradient(ellipse 500px 400px at 80% 20%, rgba(168,85,247,0.08), transparent 70%),
            radial-gradient(ellipse 400px 400px at 60% 80%, rgba(6,182,212,0.07), transparent 70%);
          pointer-events: none;
        }

        .sp-content { position: relative; z-index: 1; text-align: center; max-width: 480px; }

        /* Animated logo ring */
        .sp-logo-ring {
          position: relative; width: 120px; height: 120px;
          margin: 0 auto 32px;
        }
        .sp-ring-1 {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2.5px solid transparent;
          border-top-color: #7c3aed; border-right-color: #a855f7;
          animation: sp-spin 1.4s linear infinite;
        }
        .sp-ring-2 {
          position: absolute; inset: 12px; border-radius: 50%;
          border: 2px solid transparent;
          border-bottom-color: #06b6d4; border-left-color: #818cf8;
          animation: sp-spin 2s linear infinite reverse;
        }
        @keyframes sp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .sp-logo-inner {
          position: absolute; inset: 22px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(124,58,237,0.4);
        }

        .sp-h1 {
          font-family: 'Inter', sans-serif;
          font-size: 2.2rem; font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(120deg, #7c3aed, #a855f7, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }

        .sp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(124,58,237,0.2);
          color: #7c3aed; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 100px;
          margin-bottom: 24px;
        }
        .sp-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #7c3aed;
          animation: sp-pulse 2s ease-in-out infinite;
        }
        @keyframes sp-pulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.5; transform:scale(0.8)} }

        .sp-sub {
          font-size: 15px; line-height: 1.65; color: #6b5b95;
          margin-bottom: 36px;
        }

        .sp-features {
          display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 40px; text-align: left;
        }
        .sp-feat {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(124,58,237,0.12);
          border-radius: 14px; padding: 14px 18px;
          font-size: 13px; color: #374151; font-weight: 500;
          animation: sp-fadeUp 0.5s ease both;
        }
        .sp-feat:nth-child(1){animation-delay:0.1s}
        .sp-feat:nth-child(2){animation-delay:0.2s}
        .sp-feat:nth-child(3){animation-delay:0.3s}
        @keyframes sp-fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        .sp-feat-num {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
        }

        /* Progress bar */
        .sp-progress-wrap { width: 180px; margin: 0 auto 20px; }
        .sp-progress-bar {
          height: 3px; border-radius: 100px;
          background: rgba(124,58,237,0.15); overflow: hidden;
        }
        .sp-progress-fill {
          height: 100%; border-radius: 100px;
          background: linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4);
          animation: sp-fill 3s linear forwards;
        }
        @keyframes sp-fill { from{width:0%} to{width:100%} }

        .sp-loading { font-size: 12px; color: #9ca3af; margin-bottom: 16px; }

        .sp-skip {
          font-size: 13px; color: #7c3aed; font-weight: 600;
          text-decoration: none; display: inline-block;
          padding: 6px 18px; border-radius: 100px;
          border: 1.5px solid rgba(124,58,237,0.25);
          transition: background 0.2s;
        }
        .sp-skip:hover { background: rgba(124,58,237,0.08); }
      `}</style>

      <div className="sp-root">
        <div className="sp-content">
          {/* Animated logo ring */}
          <div className="sp-logo-ring">
            <div className="sp-ring-1" />
            <div className="sp-ring-2" />
            <div className="sp-logo-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>

          <h1 className="sp-h1">HealthPredict AI</h1>

          <div className="sp-badge">
            <div className="sp-badge-dot" />
            Healthcare Knowledge Graph Disease Predictor
          </div>

          <p className="sp-sub">
            Clinical scoring, knowledge graph reasoning, and a generative AI physician — all in one platform.
          </p>

          <div className="sp-features">
            {[
              'Framingham-style cardiovascular risk with transparent scoring',
              'Live knowledge graph + Gemini-powered guidance',
              'Dr. Ada — AI specialist chat linked to your profile',
            ].map((f, i) => (
              <div key={i} className="sp-feat">
                <div className="sp-feat-num">{i + 1}</div>
                {f}
              </div>
            ))}
          </div>

          <div className="sp-progress-wrap">
            <div className="sp-progress-bar">
              <div className="sp-progress-fill" />
            </div>
          </div>
          <p className="sp-loading">Loading experience…</p>
          <Link to="/login" className="sp-skip">Skip to sign in →</Link>
        </div>
      </div>
    </>
  );
}
