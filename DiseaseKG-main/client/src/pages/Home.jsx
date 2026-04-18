import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import FooterDisclaimer from '../components/FooterDisclaimer';

/* ── Animated counter ── */
function CountUp({ to, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0);
  const el = useRef(null);
  useEffect(() => {
    const num = parseFloat(String(to).replace(/[^0-9.]/g, ''));
    const isF = String(to).includes('.');
    let s = null;
    const run = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1600, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setVal(isF ? (e * num).toFixed(1) : Math.floor(e * num));
      if (p < 1) requestAnimationFrame(run);
    };
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { requestAnimationFrame(run); obs.disconnect(); }
    }, { threshold: 0.5 });
    if (el.current) obs.observe(el.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={el}>{prefix}{val}{suffix}</span>;
}

/* ── Data ── */
const STATS = [
  { to: 94, suffix: '%', label: 'Accuracy', icon: '🎯' },
  { to: 12500, suffix: '+', label: 'Entities Mapped', icon: '🧬' },
  { to: 1.5, suffix: 's', prefix: '<', label: 'Response Time', icon: '⚡' },
];

const FEATURES = [
  {
    icon: '📊',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #f3f0ff 0%, #ede9fe 100%)',
    title: 'Rules-Based Risk Scoring',
    desc: 'Cardiovascular, T2 diabetes & hypertension risk signals with transparent, explainable clinical inputs — never a black box.',
  },
  {
    icon: '🕸️',
    color: '#0ea5e9',
    bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    title: 'Knowledge Graph Reasoning',
    desc: 'Visualize the full disease ontology — map symptoms, risk factors, and drugs into one interactive 3D graph.',
  },
  {
    icon: '✨',
    color: '#ec4899',
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    title: 'Dr. Ada AI Specialist',
    desc: 'Gemini-powered physician that delivers structured recommendations in plain language grounded in your personal health profile.',
  },
];

const STEPS = [
  { n: '01', title: 'Create Account', sub: 'HIPAA-compliant onboarding' },
  { n: '02', title: 'Health Assessment', sub: 'Vitals + lifestyle in 4 steps' },
  { n: '03', title: 'AI-Guided Dashboard', sub: 'Risk scores & trajectory' },
  { n: '04', title: 'Chat with Dr. Ada', sub: 'Knowledge graph + AI doctor' },
];

/* ── Component ── */
export default function Home() {

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');

        /* ════════════════════ RESET + ROOT ════════════════════ */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          transition: background 0.4s, color 0.4s;
        }

        /* ════════════════ THEMES ════════════════ */
        .lp[data-theme='light'] {
          --bg:          #fafbff;
          --bg2:         #f3f0ff;
          --surface:     #ffffff;
          --surface2:    #f8f7ff;
          --border:      rgba(124,58,237,0.10);
          --border-md:   rgba(124,58,237,0.22);
          --text:        #0f0722;
          --text-2:      #4c3f72;
          --muted:       #8b7aad;
          --accent:      #7c3aed;
          --accent-2:    #a855f7;
          --accent-3:    #06b6d4;
          --glow:        rgba(124,58,237,0.18);
          --nav:         rgba(250,251,255,0.82);
          --ticker-bg:   #7c3aed;
          --ticker-c:    #fff;
          --hero-grad:   linear-gradient(155deg,#f5f0ff 0%,#fefefe 55%,#f0f9ff 100%);
          --card-grad:   rgba(255,255,255,0.9);
        }

        .lp[data-theme='dark'] {
          --bg:          #080d1a;
          --bg2:         #0d1324;
          --surface:     #111827;
          --surface2:    #151e30;
          --border:      rgba(168,85,247,0.12);
          --border-md:   rgba(168,85,247,0.28);
          --text:        #f0eeff;
          --text-2:      #c4b5fd;
          --muted:       #6b7280;
          --accent:      #a855f7;
          --accent-2:    #c084fc;
          --accent-3:    #22d3ee;
          --glow:        rgba(168,85,247,0.22);
          --nav:         rgba(8,13,26,0.88);
          --ticker-bg:   #6d28d9;
          --ticker-c:    #f3e8ff;
          --hero-grad:   linear-gradient(155deg,#0d0820 0%,#080d1a 55%,#050d18 100%);
          --card-grad:   rgba(17,24,39,0.9);
        }

        .lp { background: var(--bg); color: var(--text); }

        /* ════════════════ NAV ════════════════ */
        .lp-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 52px; height: 68px;
          background: var(--nav);
          backdrop-filter: blur(20px) saturate(1.8);
          border-bottom: 1px solid var(--border);
          transition: background 0.4s, border-color 0.4s;
        }

        .lp-logo {
          font-family: 'Syne', sans-serif;
          font-size: 19px; font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(120deg, var(--accent), var(--accent-2), var(--accent-3));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-nav-links {
          display: flex; gap: 4px; list-style: none;
        }
        .lp-nav-links a {
          display: block; padding: 6px 14px;
          font-size: 14px; font-weight: 500;
          color: var(--muted); text-decoration: none;
          border-radius: 10px;
          transition: color 0.2s, background 0.2s;
        }
        .lp-nav-links a:hover { color: var(--text); background: var(--border); }

        .lp-nav-right { display: flex; align-items: center; gap: 12px; }

        .lp-toggle {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; user-select: none;
        }
        .lp-toggle-track {
          width: 44px; height: 24px; border-radius: 100px;
          background: var(--border-md);
          position: relative; transition: background 0.3s;
          cursor: pointer;
        }
        .lp-toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--accent);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .lp-toggle-thumb.on { transform: translateX(20px); }
        .lp-toggle-label { font-size: 12px; color: var(--muted); font-weight: 600; }

        .lp-cta-nav {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--accent); color: #fff;
          font-size: 14px; font-weight: 700;
          padding: 9px 22px; border-radius: 100px;
          text-decoration: none;
          box-shadow: 0 4px 20px var(--glow);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lp-cta-nav:hover { transform: translateY(-1px); box-shadow: 0 8px 28px var(--glow); }

        /* ════════════════ HERO ════════════════ */
        .lp-hero {
          position: relative; overflow: hidden;
          padding: 100px 52px 120px;
          background: var(--hero-grad);
          transition: background 0.4s;
        }

        /* Decorative blobs */
        .lp-hero::before {
          content: '';
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 700px 500px at 15% 30%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%),
            radial-gradient(ellipse 500px 400px at 85% 10%, color-mix(in srgb, var(--accent-2) 10%, transparent), transparent 70%),
            radial-gradient(ellipse 400px 400px at 75% 85%, color-mix(in srgb, var(--accent-3) 8%, transparent), transparent 70%);
          pointer-events: none;
        }

        .lp-hero-inner {
          position: relative; z-index: 1;
          max-width: 1180px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 420px;
          gap: 64px; align-items: center;
        }

        /* Pill badge */
        .lp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px 6px 8px;
          background: color-mix(in srgb, var(--accent) 10%, var(--surface));
          border: 1px solid var(--border-md);
          border-radius: 100px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 28px;
          animation: lp-fadeUp 0.6s ease both;
        }
        .lp-badge-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
          animation: lp-pulse 2s ease-in-out infinite;
        }
        @keyframes lp-pulse { 0%,100%{box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 25%,transparent)} 50%{box-shadow:0 0 0 6px color-mix(in srgb,var(--accent) 10%,transparent)} }

        /* Headline */
        .lp-h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 5.5vw, 4.6rem);
          font-weight: 800; line-height: 1.06;
          letter-spacing: -0.04em;
          color: var(--text);
          margin-bottom: 24px;
          animation: lp-fadeUp 0.6s ease 0.1s both;
        }

        .lp-grad-text {
          background: linear-gradient(120deg, var(--accent) 0%, var(--accent-2) 45%, var(--accent-3) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: lp-gradShift 6s ease infinite;
        }
        @keyframes lp-gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

        .lp-hero-sub {
          font-size: 17px; line-height: 1.72;
          color: var(--muted);
          max-width: 520px;
          margin-bottom: 40px;
          animation: lp-fadeUp 0.6s ease 0.2s both;
        }

        .lp-hero-btns {
          display: flex; gap: 12px; flex-wrap: wrap;
          margin-bottom: 52px;
          animation: lp-fadeUp 0.6s ease 0.3s both;
        }

        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700;
          padding: 14px 32px; border-radius: 100px; text-decoration: none;
          box-shadow: 0 8px 32px var(--glow);
          transition: transform 0.22s, box-shadow 0.22s;
          position: relative; overflow: hidden;
        }
        .lp-btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
          opacity: 0; transition: opacity 0.3s;
        }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 40px var(--glow); }
        .lp-btn-primary:hover::after { opacity: 1; }

        .lp-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent;
          color: var(--text-2);
          font-size: 15px; font-weight: 600;
          padding: 14px 28px; border-radius: 100px; text-decoration: none;
          border: 1.5px solid var(--border-md);
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .lp-btn-outline:hover { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 5%, transparent); }

        /* Trust row */
        .lp-trust {
          display: flex; align-items: center; gap: 16px;
          animation: lp-fadeUp 0.6s ease 0.4s both;
        }
        .lp-trust-avatars { display: flex; }
        .lp-trust-av {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2.5px solid var(--bg);
          margin-left: -10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          background: linear-gradient(135deg, color-mix(in srgb,var(--accent) 60%,#000), color-mix(in srgb,var(--accent-2) 60%,#000));
        }
        .lp-trust-avatars .lp-trust-av:first-child { margin-left: 0; }
        .lp-trust-text { font-size: 13px; font-weight: 500; color: var(--muted); }
        .lp-trust-text strong { color: var(--text); }

        /* Hero right — visual dashboard mockup */
        .lp-dashboard-mockup {
          position: relative;
          animation: lp-fadeUp 0.7s ease 0.2s both;
        }

        .lp-mock-card {
          background: var(--card-grad);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-md);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px var(--border);
          position: relative; overflow: hidden;
        }
        .lp-mock-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, color-mix(in srgb,var(--accent-2) 60%,transparent), transparent);
        }

        .lp-mock-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 20px;
        }

        .lp-mock-risk {
          display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
        }
        .lp-mock-score {
          font-family: 'Syne', sans-serif;
          font-size: 3.2rem; font-weight: 800;
          line-height: 1; letter-spacing: -0.04em;
          color: var(--accent);
        }
        .lp-mock-score-label { font-size: 12px; color: var(--muted); font-weight: 600; margin-top: 4px; }

        /* Mini bar chart */
        .lp-bars { display: flex; align-items: flex-end; gap: 6px; height: 60px; margin-bottom: 20px; }
        .lp-bar {
          flex: 1; border-radius: 6px 6px 0 0;
          background: linear-gradient(to top, var(--accent), var(--accent-2));
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .lp-bar:hover { opacity: 1; }
        .lp-bar.highlight { opacity: 1; box-shadow: 0 0 16px var(--glow); }

        .lp-mock-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .lp-tag {
          font-size: 11px; font-weight: 700;
          padding: 4px 12px; border-radius: 100px;
          letter-spacing: 0.05em;
        }
        .lp-tag-red { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .lp-tag-amber { background: rgba(245,158,11,0.1); color: #d97706; border: 1px solid rgba(245,158,11,0.2); }
        .lp-tag-green { background: rgba(34,197,94,0.1); color: #16a34a; border: 1px solid rgba(34,197,94,0.2); }

        /* Floating mini-cards */
        .lp-float-card {
          position: absolute;
          background: var(--card-grad);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-md);
          border-radius: 16px;
          padding: 14px 18px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.15);
          animation: lp-float 5s ease-in-out infinite;
        }
        @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        .lp-float-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 4px; }
        .lp-float-val { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: var(--accent); }

        /* ════════════════ TICKER ════════════════ */
        .lp-ticker {
          background: var(--ticker-bg);
          padding: 10px 0; overflow: hidden; white-space: nowrap;
        }
        .lp-ticker-track {
          display: inline-flex;
          animation: lp-scroll 20s linear infinite;
        }
        @keyframes lp-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .lp-ticker-item {
          display: inline-flex; align-items: center; gap: 12px;
          padding: 0 32px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--ticker-c);
        }
        .lp-ticker-item::after { content: '✦'; opacity: 0.5; }

        /* ════════════════ STATS STRIP ════════════════ */
        .lp-stats {
          display: grid; grid-template-columns: repeat(3,1fr);
          max-width: 1180px; margin: 0 auto;
          border: 1px solid var(--border); border-radius: 24px;
          overflow: hidden; margin-top: -1px;
          background: var(--surface);
          box-shadow: 0 4px 32px rgba(0,0,0,0.04);
        }
        .lp-stats-wrap { padding: 64px 52px; }

        .lp-stat {
          padding: 36px 40px;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; align-items: center; text-align: center;
          gap: 8px;
          transition: background 0.2s;
        }
        .lp-stat:last-child { border-right: none; }
        .lp-stat:hover { background: color-mix(in srgb, var(--accent) 3%, var(--surface)); }

        .lp-stat-icon { font-size: 26px; margin-bottom: 4px; }
        .lp-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 3rem; font-weight: 800;
          letter-spacing: -0.05em; line-height: 1;
          color: var(--accent);
        }
        .lp-stat-label {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--muted);
        }

        /* ════════════════ SECTIONS ════════════════ */
        .lp-section { padding: 88px 52px; }
        .lp-section-inner { max-width: 1180px; margin: 0 auto; }

        .lp-kicker {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--accent); margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .lp-kicker::before {
          content: ''; display: block;
          width: 20px; height: 2px;
          background: var(--accent); border-radius: 2px;
        }

        .lp-h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 3.6vw, 2.8rem);
          font-weight: 800; line-height: 1.12;
          letter-spacing: -0.03em; color: var(--text);
          max-width: 600px; margin-bottom: 52px;
        }
        .lp-h2 em { font-style: normal; color: var(--muted); font-weight: 400; }

        /* ════════════════ FEATURE CARDS ════════════════ */
        .lp-feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }

        .lp-feat {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px; padding: 36px 28px;
          position: relative; overflow: hidden;
          transition: transform 0.28s, box-shadow 0.28s, border-color 0.28s;
        }
        .lp-feat:hover {
          transform: translateY(-5px);
          border-color: var(--border-md);
          box-shadow: 0 28px 60px rgba(0,0,0,0.08), 0 0 0 1px var(--border-md);
        }
        .lp-feat-glow {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none; opacity: 0.14;
          top: -40px; right: -40px; width: 160px; height: 160px;
          transition: opacity 0.3s;
        }
        .lp-feat:hover .lp-feat-glow { opacity: 0.24; }

        .lp-feat-icon-wrap {
          width: 52px; height: 52px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; margin-bottom: 22px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .lp-feat-tag {
          display: inline-block; font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 3px 10px; border-radius: 100px; margin-bottom: 14px;
        }
        .lp-feat-title {
          font-family: 'Syne', sans-serif; font-size: 17px;
          font-weight: 700; color: var(--text); margin-bottom: 12px;
        }
        .lp-feat-desc { font-size: 14px; line-height: 1.7; color: var(--muted); }

        /* ════════════════ HOW IT WORKS ════════════════ */
        .lp-steps-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .lp-step {
          display: flex; align-items: flex-start; gap: 20px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 20px; padding: 28px 24px;
          transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
        }
        .lp-step:hover {
          border-color: var(--border-md);
          box-shadow: 0 12px 40px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .lp-step-num {
          flex-shrink: 0; width: 40px; height: 40px;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800;
          color: var(--accent);
          background: color-mix(in srgb, var(--accent) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
        }
        .lp-step-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
        .lp-step-sub { font-size: 13px; color: var(--muted); }

        /* ════════════════ RESULTS / NUMBERS ════════════════ */
        .lp-results-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }

        .lp-result {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px; padding: 36px 28px;
          transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
        }
        .lp-result:hover {
          border-color: var(--border-md); transform: translateY(-4px);
          box-shadow: 0 24px 56px var(--glow);
        }
        .lp-result-num {
          font-family: 'Syne', sans-serif;
          font-size: 3.2rem; font-weight: 800;
          letter-spacing: -0.04em; color: var(--accent);
          margin-bottom: 12px; line-height: 1;
        }
        .lp-result-head { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
        .lp-result-body { font-size: 13px; line-height: 1.65; color: var(--muted); }

        /* ════════════════ QUICK ACTIONS ════════════════ */
        .lp-actions-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }

        .lp-action {
          display: flex; flex-direction: column;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 22px; padding: 28px;
          text-decoration: none; color: inherit;
          transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
          position: relative; overflow: hidden;
        }
        .lp-action:hover {
          border-color: var(--accent); transform: translateY(-3px);
          box-shadow: 0 20px 50px var(--glow);
        }
        .lp-action-icon { font-size: 30px; margin-bottom: 16px; }
        .lp-action-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .lp-action-desc { font-size: 13px; line-height: 1.6; color: var(--muted); flex-grow: 1; margin-bottom: 20px; }
        .lp-action-arrow {
          font-size: 13px; font-weight: 700; color: var(--accent);
          display: flex; align-items: center; gap: 4px;
        }
        .lp-action.primary-action {
          background: linear-gradient(145deg, color-mix(in srgb,var(--accent) 7%, var(--surface)), var(--surface));
          border-color: var(--border-md);
        }

        /* ════════════════ CTA BAND ════════════════ */
        .lp-cta {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 55%, var(--accent-3) 100%);
          border-radius: 32px; padding: 80px 72px;
          margin: 0 52px 88px;
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: space-between; gap: 48px;
        }
        .lp-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .lp-cta-h {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 800; color: #fff;
          letter-spacing: -0.03em; line-height: 1.14;
          max-width: 560px;
        }
        .lp-cta-h span { opacity: 0.7; font-weight: 400; }

        .lp-btn-white {
          display: inline-flex; align-items: center; gap: 10px;
          background: #fff; color: var(--accent);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700;
          padding: 16px 38px; border-radius: 100px; text-decoration: none;
          box-shadow: 0 8px 40px rgba(0,0,0,0.2);
          white-space: nowrap; flex-shrink: 0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lp-btn-white:hover { transform: translateY(-2px); box-shadow: 0 16px 48px rgba(0,0,0,0.26); }

        /* ════════════════ KEYFRAMES ════════════════ */
        @keyframes lp-fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ════════════════ RESPONSIVE ════════════════ */
        @media (max-width: 1024px) {
          .lp-nav { padding: 0 24px; }
          .lp-nav-links { display: none; }
          .lp-hero { padding: 70px 24px 90px; }
          .lp-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .lp-section { padding: 64px 24px; }
          .lp-feat-grid, .lp-results-grid, .lp-actions-grid, .lp-steps-layout { grid-template-columns: 1fr; }
          .lp-stats { grid-template-columns: 1fr; }
          .lp-stat { border-right: none; border-bottom: 1px solid var(--border); }
          .lp-stat:last-child { border-bottom: none; }
          .lp-cta { flex-direction: column; margin: 0 24px 60px; padding: 52px 32px; }
          .lp-stats-wrap { padding: 48px 24px; }
        }
      `}</style>

      <div className="lp" data-theme="light">


        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-inner">

            {/* Left text */}
            <div>
              <div className="lp-badge">
                <div className="lp-badge-dot" />
                Healthcare AI · Knowledge Graph · Disease Predictor
              </div>
              <h1 className="lp-h1">
                <span className="lp-grad-text">Predict Disease Risk</span>
                <br />Before It Predicts You.
              </h1>
              <p className="lp-hero-sub">
                Clinical scoring, knowledge graph reasoning, and a generative AI physician — unified in one desktop-first platform. Understand your risk, context, and care paths together.
              </p>
              <div className="lp-hero-btns">
                <Link to="/assessment" className="lp-btn-primary">
                  Start Free Assessment
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link to="/dashboard" className="lp-btn-outline">
                  See how it works →
                </Link>
              </div>
              <div className="lp-trust">
                <div className="lp-trust-avatars">
                  {['🧑⚕️','👩💻','🧬','🔬'].map((e, i) => (
                    <div key={i} className="lp-trust-av" style={{zIndex:4-i}}>{e}</div>
                  ))}
                </div>
                <div className="lp-trust-text">
                  Trusted by <strong>12,000+</strong> health professionals · ⭐ 4.9
                </div>
              </div>
            </div>

            {/* Right — Dashboard mockup */}
            <div className="lp-dashboard-mockup">
              <div className="lp-mock-card">
                <div className="lp-mock-title">Risk Assessment Overview</div>
                <div className="lp-mock-risk">
                  <div>
                    <div className="lp-mock-score">72</div>
                    <div className="lp-mock-score-label">Risk Score</div>
                  </div>
                  <div className="lp-bars">
                    {[35, 55, 45, 70, 60, 80, 72].map((h, i) => (
                      <div key={i} className={`lp-bar${i === 6 ? ' highlight' : ''}`} style={{height:`${h}%`}} />
                    ))}
                  </div>
                </div>
                <div className="lp-mock-tags">
                  <span className="lp-tag lp-tag-red">Cardiovascular ↑</span>
                  <span className="lp-tag lp-tag-amber">BP Moderate</span>
                  <span className="lp-tag lp-tag-green">Glucose Normal</span>
                </div>
              </div>

              {/* Floating cards */}
              <div className="lp-float-card" style={{top:'-18px', right:'-20px', animationDelay:'0s', minWidth:120}}>
                <div className="lp-float-label">Accuracy</div>
                <div className="lp-float-val">94%</div>
              </div>
              <div className="lp-float-card" style={{bottom:'-14px', left:'-18px', animationDelay:'1.5s', minWidth:130}}>
                <div className="lp-float-label">Dr. Ada Response</div>
                <div className="lp-float-val">&lt; 1.5s</div>
              </div>
            </div>

          </div>
        </section>

        {/* ── TICKER ── */}
        <div className="lp-ticker">
          <div className="lp-ticker-track">
            {Array(20).fill('Health Intelligence').map((t,i) => (
              <span key={i} className="lp-ticker-item">{t}</span>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="lp-stats-wrap">
          <div className="lp-stats">
            {STATS.map(s => (
              <div key={s.label} className="lp-stat">
                <div className="lp-stat-icon">{s.icon}</div>
                <div className="lp-stat-num">
                  <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix || ''} />
                </div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="lp-section">
          <div className="lp-section-inner">
            <div className="lp-kicker">Platform Capabilities</div>
            <h2 className="lp-h2">Everything you need to<br /><em>understand your health.</em></h2>
            <div className="lp-feat-grid">
              {FEATURES.map(f => (
                <div key={f.title} className="lp-feat">
                  <div className="lp-feat-glow" style={{background: f.color}} />
                  <div className="lp-feat-icon-wrap" style={{background: f.bg}}>
                    {f.icon}
                  </div>
                  <div className="lp-feat-tag" style={{color: f.color, background: `color-mix(in srgb, ${f.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${f.color} 22%, transparent)`}}>
                    Featured
                  </div>
                  <div className="lp-feat-title">{f.title}</div>
                  <p className="lp-feat-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section" style={{paddingTop:0}}>
          <div className="lp-section-inner">
            <div className="lp-kicker">How It Works</div>
            <h2 className="lp-h2">Simple steps to your<br /><em>health intelligence.</em></h2>
            <div className="lp-steps-layout">
              {STEPS.map(s => (
                <div key={s.n} className="lp-step">
                  <div className="lp-step-num">{s.n}</div>
                  <div>
                    <div className="lp-step-title">{s.title}</div>
                    <div className="lp-step-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RESULTS ── */}
        <section className="lp-section" style={{background:'var(--bg2)'}}>
          <div className="lp-section-inner">
            <div className="lp-kicker">Proven Results</div>
            <h2 className="lp-h2">See how HealthPredict<br /><em>achieves these results.</em></h2>
            <div className="lp-results-grid">
              {[
                { n:'94%', h:'Prediction Accuracy', b:'Rules-based scoring with explainable inputs surfaces cardiovascular, diabetes, and hypertension risk signals clearly.' },
                { n:'12.5K', h:'Medical Entities Mapped', b:'Diseases, symptoms, risk factors, and drugs all connected in one interactive knowledge graph ontology.' },
                { n:'<1.5s', h:'AI Specialist Response', b:'Gemini-powered Dr. Ada delivers structured health recommendations in plain language grounded in your profile.' },
              ].map(r => (
                <div key={r.n} className="lp-result">
                  <div className="lp-result-num">{r.n}</div>
                  <div className="lp-result-head">{r.h}</div>
                  <p className="lp-result-body">{r.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUICK ACTIONS ── */}
        <section className="lp-section">
          <div className="lp-section-inner">
            <div className="lp-kicker">Quick Actions</div>
            <h2 className="lp-h2">Jump right in.</h2>
            <div className="lp-actions-grid">
              <Link to="/assessment" className="lp-action primary-action">
                <div className="lp-action-icon">🩺</div>
                <div className="lp-action-title">New Assessment</div>
                <div className="lp-action-desc">Input your latest vitals and lifestyle factors for a fresh, explainable risk snapshot.</div>
                <div className="lp-action-arrow">Start now <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              </Link>
              <Link to="/dashboard" className="lp-action">
                <div className="lp-action-icon">📊</div>
                <div className="lp-action-title">Health Dashboard</div>
                <div className="lp-action-desc">Review your risk trajectory, trend lines, and personalized AI-generated recommendations.</div>
                <div className="lp-action-arrow">Open Dashboard <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              </Link>
              <Link to="/analyzer" className="lp-action" style={{borderColor:'rgba(124,58,237,0.25)', background:'linear-gradient(145deg,rgba(124,58,237,0.06),rgba(168,85,247,0.03))'}}>
                <div className="lp-action-icon">✨</div>
                <div className="lp-action-title">AI Report Analyzer</div>
                <div className="lp-action-desc">Paste any medical report or lab results for instant AI-powered health analysis and risk predictions.</div>
                <div className="lp-action-arrow" style={{color:'#7c3aed'}}>Analyze Report <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              </Link>
              <Link to="/graph" className="lp-action">
                <div className="lp-action-icon">🕸️</div>
                <div className="lp-action-title">Knowledge Graph</div>
                <div className="lp-action-desc">Explore live disease connections across your personal health ontology in 3D.</div>
                <div className="lp-action-arrow">Launch Graph <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <div className="lp-cta">
          <h2 className="lp-cta-h">
            Automate Your Health<br />
            <span>Simply And Efficiently.</span>
          </h2>
          <Link to="/assessment" className="lp-btn-white">
            Begin Free Assessment
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>

        <FooterDisclaimer />
      </div>
    </>
  );
}