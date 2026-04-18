import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { usePrediction } from '../context/PredictionContext';
import FooterDisclaimer from '../components/FooterDisclaimer';
import { formatGeminiErrorForUi, isPlaceholderExplanation } from '../utils/geminiUi';

/* ── Risk Gauge ── */
function RiskGauge({ score }) {
  const s = Math.min(100, Math.max(0, Number(score) || 0));
  const r = 54; const c = 2 * Math.PI * r;
  const color = s < 40 ? '#22c55e' : s < 70 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      <svg style={{ transform: 'rotate(-90deg)' }} width="200" height="200" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(124,58,237,0.1)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (s / 100) * c}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
        />
        <defs>
          <radialGradient id="glow">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.04em', color }}>{Math.round(s)}</div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b7aad', marginTop: 2 }}>Risk Score</div>
      </div>
    </div>
  );
}

/* ── Dashboard ── */
export default function Dashboard() {
  const { lastRun } = usePrediction();
  const ra = lastRun?.prediction?.rawModelResponse?.riskAssessment;
  const recs = lastRun?.recommendations || [];
  const fi = (ra?.featureImportance || []).slice(0, 8);

  if (!lastRun || !ra) {
    return (
      <>
        <style>{DASH_CSS}</style>
        <div className="db-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div className="db-empty-card">
            <div style={{ fontSize: 48, marginBottom: 20 }}>📊</div>
            <h2 className="db-empty-h">No prediction yet</h2>
            <p className="db-empty-sub">Run a health assessment first to see your AI-powered risk analysis here.</p>
            <Link to="/assessment" className="db-btn-primary">Start Health Assessment →</Link>
          </div>
        </div>
      </>
    );
  }

  const tl = ra.progressionTimeline || {};
  const chartData = [0, 6, 12, 24, 60].map(m => ({
    month: `${m} mo`,
    risk: tl[m]?.riskScore ?? tl[String(m)]?.riskScore ?? ra.riskScore,
  }));

  const riskColor = ra.riskScore < 40 ? '#22c55e' : ra.riskScore < 70 ? '#f59e0b' : '#ef4444';

  return (
    <>
      <style>{DASH_CSS}</style>
      <div className="db-root">
        {/* Header */}
        <div className="db-page-header">
          <div>
            <div className="db-kicker">Your Health Dashboard</div>
            <h1 className="db-h1">Risk Overview & AI Guidance</h1>
            <p className="db-sub">Trajectories, probabilities, and personalized recommendations.</p>
          </div>
          <div className="db-header-actions">
            <Link to="/graph" className="db-btn-ghost">🕸 Knowledge Graph</Link>
            <Link to="/assessment" className="db-btn-primary">New Assessment</Link>
          </div>
        </div>

        {/* Alerts */}
        {lastRun.geminiError && (
          <div className="db-alert db-alert-amber">
            <strong>⚠ AI features unavailable for this run</strong>
            <p>{formatGeminiErrorForUi(lastRun.geminiError)}</p>
          </div>
        )}


        {/* Top grid: gauge + diseases */}
        <div className="db-grid-2" style={{ marginBottom: 20 }}>
          {/* Gauge card */}
          <div className="db-card">
            <div className="db-card-label">Composite Risk</div>
            <RiskGauge score={ra.riskScore} />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span className="db-risk-badge" style={{ background: `${riskColor}18`, color: riskColor, border: `1px solid ${riskColor}33` }}>
                {ra.riskLevel?.toUpperCase() || 'UNKNOWN'} RISK
              </span>
            </div>
            {lastRun.explanation && !(lastRun.geminiError && isPlaceholderExplanation(lastRun.explanation)) && (
              <p className="db-explanation">{lastRun.explanation}</p>
            )}
          </div>

          {/* Disease probabilities */}
          <div className="db-card">
            <div className="db-card-label">Disease Probabilities</div>
            <div className="db-diseases">
              {(ra.diseases || []).map(d => (
                <div key={d.name} className="db-disease-row">
                  <div className="db-disease-header">
                    <span>{d.name}</span>
                    <span style={{ fontWeight: 700, color: '#7c3aed' }}>{(d.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="db-bar-bg">
                    <div className="db-bar-fill" style={{ width: `${Math.min(100, d.probability * 100)}%` }} />
                  </div>
                  <div className="db-disease-stage">Stage: {d.stage}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature importance */}
        {fi.length > 0 && (
          <div className="db-card" style={{ marginBottom: 20 }}>
            <div className="db-card-label">Feature Influence</div>
            <div className="db-fi-grid">
              {fi.map(f => (
                <div key={f.feature}>
                  <div className="db-fi-header">
                    <span>{f.feature.replace(/_/g, ' ')}</span>
                    <span>{f.percentContribution != null ? `${f.percentContribution}%` : ''}</span>
                  </div>
                  <div className="db-bar-bg" style={{ height: 6 }}>
                    <div className="db-bar-fill" style={{ width: `${Math.min(100, f.percentContribution ?? (f.importance || 0) * 100)}%`, height: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="db-card" style={{ marginBottom: 20 }}>
          <div className="db-card-label">Risk Progression (0–60 months)</div>
          <div style={{ height: 280, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                <XAxis dataKey="month" stroke="#8b7aad" fontSize={12} tick={{ fill: '#8b7aad' }} />
                <YAxis stroke="#8b7aad" fontSize={12} domain={[0, 100]} tick={{ fill: '#8b7aad' }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, fontFamily: 'Plus Jakarta Sans', fontSize: 13 }}
                  labelStyle={{ color: '#7c3aed', fontWeight: 700 }}
                />
                <Line type="monotone" dataKey="risk" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6, fill: '#7c3aed' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div style={{ marginBottom: 40 }}>
          <h2 className="db-section-h">AI Recommendations</h2>
          {recs.length === 0 ? (
            <div className="db-card" style={{ textAlign: 'center', color: '#8b7aad', fontSize: 14 }}>
              No AI-generated recommendations for this run.
              {lastRun.geminiError && <p style={{ marginTop: 8, fontSize: 12 }}>Add a Gemini API key to enable this.</p>}
            </div>
          ) : (
            <div className="db-recs-grid">
              {recs.map(r => (
                <div key={r._id || r.title} className="db-rec-card">
                  <div className="db-rec-type">{r.type || r.priority}</div>
                  <h3 className="db-rec-title">{r.title}</h3>
                  <p className="db-rec-desc">{r.description}</p>
                  {r.rationale && <p className="db-rec-evidence">Evidence: {r.rationale}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <FooterDisclaimer />
      </div>
    </>
  );
}

const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

  .db-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: linear-gradient(155deg, #fafbff 0%, #f8f5ff 50%, #f0f9ff 100%);
    padding: 40px 40px 80px;
    position: relative; overflow: hidden;
  }
  .db-root::before {
    content: '';
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 500px 400px at 90% 10%, rgba(124,58,237,0.07), transparent 60%),
      radial-gradient(ellipse 400px 400px at 10% 80%, rgba(6,182,212,0.05), transparent 60%);
    pointer-events: none;
  }

  /* All content above the bg */
  .db-root > * { position: relative; z-index: 1; }

  /* Page header */
  .db-page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 24px; margin-bottom: 32px; flex-wrap: wrap;
  }
  .db-kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .db-kicker::before { content: ''; display: block; width: 18px; height: 2px; background: #7c3aed; border-radius: 2px; }
  .db-h1 { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.03em; color: #1a0a3c; margin-bottom: 6px; }
  .db-sub { font-size: 14px; color: #8b7aad; }
  .db-header-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

  /* Buttons */
  .db-btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg,#7c3aed,#a855f7);
    color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    padding: 10px 22px; border-radius: 100px; text-decoration: none;
    box-shadow: 0 4px 16px rgba(124,58,237,0.3);
    transition: opacity 0.2s, transform 0.2s;
  }
  .db-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .db-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    color: #7c3aed; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    padding: 10px 20px; border-radius: 100px; text-decoration: none;
    border: 1.5px solid rgba(124,58,237,0.22);
    transition: background 0.2s, border-color 0.2s;
  }
  .db-btn-ghost:hover { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.4); }

  /* Alerts */
  .db-alert { border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; font-size: 13px; }
  .db-alert p { margin-top: 6px; opacity: 0.85; }
  .db-alert code { background: rgba(0,0,0,0.08); padding: 2px 6px; border-radius: 6px; font-size: 11px; }
  .db-alert-amber { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); color: #92400e; }
  .db-alert-blue { background: rgba(6,182,212,0.07); border: 1px solid rgba(6,182,212,0.2); color: #155e75; }

  /* Cards */
  .db-card {
    background: #fff;
    border: 1px solid rgba(124,58,237,0.1);
    border-radius: 24px; padding: 32px;
    box-shadow: 0 8px 40px rgba(124,58,237,0.06);
  }
  .db-card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; margin-bottom: 20px; }

  /* 2-col grid */
  .db-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media(max-width:900px){ .db-grid-2 { grid-template-columns: 1fr; } }

  /* Empty state */
  .db-empty-card {
    background: #fff; border: 1px solid rgba(124,58,237,0.1);
    border-radius: 28px; padding: 60px 48px; text-align: center;
    box-shadow: 0 24px 80px rgba(124,58,237,0.08);
    max-width: 480px; width: 100%; margin: 0 auto;
  }
  .db-empty-h { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; color: #1a0a3c; margin-bottom: 12px; }
  .db-empty-sub { font-size: 14px; color: #8b7aad; line-height: 1.65; margin-bottom: 28px; }

  /* Risk badge */
  .db-risk-badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; padding: 5px 14px; border-radius: 100px; }

  /* Explanation */
  .db-explanation { margin-top: 20px; font-size: 13px; line-height: 1.65; color: #8b7aad; text-align: center; padding: 0 8px; }

  /* Diseases */
  .db-diseases { display: flex; flex-direction: column; gap: 18px; }
  .db-disease-row {}
  .db-disease-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 7px; }
  .db-bar-bg { height: 8px; background: rgba(124,58,237,0.08); border-radius: 100px; overflow: hidden; }
  .db-bar-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg,#7c3aed,#a855f7); transition: width 0.8s ease; }
  .db-disease-stage { font-size: 11px; color: #c4b5d4; margin-top: 5px; }

  /* Feature importance */
  .db-fi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media(max-width:600px){ .db-fi-grid { grid-template-columns: 1fr; } }
  .db-fi-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #6b5b95; margin-bottom: 6px; text-transform: capitalize; }

  /* Section heading */
  .db-section-h { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #1a0a3c; margin-bottom: 16px; letter-spacing: -0.02em; }

  /* Recs */
  .db-recs-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  @media(max-width:900px){ .db-recs-grid { grid-template-columns: 1fr; } }
  .db-rec-card {
    background: #fff; border: 1px solid rgba(124,58,237,0.1);
    border-radius: 18px; padding: 24px 22px;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .db-rec-card:hover { border-color: rgba(124,58,237,0.2); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,0.08); }
  .db-rec-type { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; margin-bottom: 8px; }
  .db-rec-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #1a0a3c; margin-bottom: 8px; line-height: 1.3; }
  .db-rec-desc { font-size: 13px; line-height: 1.6; color: #8b7aad; margin-bottom: 8px; }
  .db-rec-evidence { font-size: 11px; color: #c4b5d4; line-height: 1.5; }

  @media(max-width:768px){
    .db-root { padding: 24px 20px 60px; }
    .db-page-header { flex-direction: column; }
  }
`;
