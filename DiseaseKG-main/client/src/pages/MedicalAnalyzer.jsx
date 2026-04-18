import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyzerApi } from '../api/client';
import FooterDisclaimer from '../components/FooterDisclaimer';

/* ── Severity config ── */
const SEVERITY = {
  'Healthy':       { icon: '✅', color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)',   score: 88, ring: '#16a34a' },
  'Moderate Risk': { icon: '⚠️', color: '#d97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)',   score: 52, ring: '#d97706' },
  'High Risk':     { icon: '🚨', color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)',   score: 22, ring: '#dc2626' },
};

const RISK_COLORS = {
  Low:    { color: '#16a34a', bg: 'rgba(22,163,74,0.1)',  border: 'rgba(22,163,74,0.25)'  },
  Medium: { color: '#d97706', bg: 'rgba(217,119,6,0.1)',  border: 'rgba(217,119,6,0.25)'  },
  High:   { color: '#dc2626', bg: 'rgba(220,38,38,0.1)',  border: 'rgba(220,38,38,0.25)'  },
};

/* ── Sample report ── */
const SAMPLE = `Patient: John Doe, Age: 52, Male
Date: March 2025

Blood Pressure: 148/95 mmHg
Fasting Blood Sugar: 126 mg/dL
HbA1c: 7.2%
Total Cholesterol: 240 mg/dL
LDL Cholesterol: 165 mg/dL
HDL Cholesterol: 38 mg/dL
Triglycerides: 210 mg/dL
BMI: 29.4
Heart Rate: 88 bpm

Lifestyle Notes:
- Smoker (1 pack/day for 15 years)
- Sedentary lifestyle
- Diet: High processed food, low vegetables
- Family history: Father had heart attack at 58, mother has Type 2 Diabetes

Symptoms reported: Occasional fatigue, mild shortness of breath on exertion`;

/* ── Health Score Gauge ── */
function HealthGauge({ score, color }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = pct * circ;
  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: '#8b7aad', fontWeight: 600, letterSpacing: '0.06em', marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

export default function MedicalAnalyzer() {
  const [reportText, setReportText]   = useState('');
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [charCount, setCharCount]     = useState(0);
  const [dragging, setDragging]       = useState(false);
  const [fileName, setFileName]       = useState('');
  const [activeTab, setActiveTab]     = useState('overview');
  const resultRef  = useRef(null);
  const fileRef    = useRef(null);

  const handleChange = (e) => {
    setReportText(e.target.value);
    setCharCount(e.target.value.length);
    setFileName('');
  };

  const readFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setReportText(text);
      setCharCount(text.length);
      setError('');
      setResult(null);
    };
    reader.onerror = () => setError('Could not read file. Please paste the text manually.');
    reader.readAsText(file);
  };

  const handleFileInput = (e) => readFile(e.target.files?.[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    readFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const handleDragLeave = ()  => setDragging(false);

  const analyze = async () => {
    if (!reportText.trim() || reportText.trim().length < 10) {
      setError('Please enter at least 10 characters of medical report data.');
      return;
    }
    setError(''); setResult(null); setLoading(true);
    try {
      const data = await analyzerApi.analyzeReport(reportText);
      setResult(data.analysis);
      setActiveTab('overview');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e.message || 'Analysis failed. Please check your server is running with a valid GROQ_API_KEY.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setReportText(SAMPLE); setCharCount(SAMPLE.length);
    setError(''); setResult(null); setFileName('Sample Report');
  };

  const reset = () => {
    setReportText(''); setCharCount(0); setResult(null); setError(''); setFileName('');
  };

  const downloadReport = () => {
    if (!result) return;
    const lines = [
      '========================================',
      '   HEALTHPREDICT AI — MEDICAL ANALYSIS  ',
      '========================================',
      '',
      `Date: ${new Date().toLocaleString()}`,
      `Overall Status: ${result.severity}`,
      '',
      '─── SUMMARY ───',
      result.summary,
      '',
      '─── KEY FINDINGS ───',
      ...(result.key_findings || []).map((f, i) => `${i + 1}. ${f}`),
      '',
      '─── RISK PREDICTIONS ───',
      ...(result.risk_predictions || []).map(r => `• ${r.condition} [${r.risk_level} Risk]: ${r.reason}`),
      '',
      '─── DIET RECOMMENDATIONS ───',
      ...(result.recommendations?.diet || []).map((t, i) => `${i + 1}. ${t}`),
      '',
      '─── EXERCISE RECOMMENDATIONS ───',
      ...(result.recommendations?.exercise || []).map((t, i) => `${i + 1}. ${t}`),
      '',
      '─── LIFESTYLE RECOMMENDATIONS ───',
      ...(result.recommendations?.lifestyle || []).map((t, i) => `${i + 1}. ${t}`),
      '',
      '─── DISCLAIMER ───',
      'This analysis is for educational purposes only. It is NOT a medical diagnosis.',
      'Always consult a licensed healthcare professional for medical decisions.',
      '',
      'Powered by HealthPredict AI + Groq',
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `health-analysis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sev = result ? SEVERITY[result.severity] || SEVERITY['Moderate Risk'] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');

        .az-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: linear-gradient(155deg, #fafbff 0%, #f8f5ff 50%, #f0f9ff 100%);
          padding: 40px 40px 80px;
          position: relative; overflow: hidden;
        }
        .az-root::before {
          content: '';
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 600px 400px at 85% 5%, rgba(124,58,237,0.07), transparent 60%),
            radial-gradient(ellipse 400px 400px at 15% 90%, rgba(6,182,212,0.05), transparent 60%);
          pointer-events: none;
        }
        .az-inner { position: relative; z-index: 1; max-width: 1060px; margin: 0 auto; }

        /* ── Header ── */
        .az-header { margin-bottom: 36px; }
        .az-kicker {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: #7c3aed; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .az-kicker::before { content: ''; display: block; width: 20px; height: 2px; background: #7c3aed; border-radius: 2px; }
        .az-h1 {
          font-family: 'Syne', sans-serif; font-size: 2.2rem;
          font-weight: 800; letter-spacing: -0.04em; color: #1a0a3c; margin-bottom: 10px;
        }
        .az-h1 span {
          background: linear-gradient(120deg, #7c3aed, #a855f7, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .az-sub { font-size: 15px; line-height: 1.7; color: #8b7aad; max-width: 560px; }

        /* ── Powered by badge ── */
        .az-powered {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(124,58,237,0.06); border: 1px solid rgba(124,58,237,0.14);
          border-radius: 100px; padding: 4px 14px;
          font-size: 11.5px; font-weight: 700; color: #7c3aed;
          margin-top: 14px; letter-spacing: 0.03em;
        }
        .az-powered-dot { width: 6px; height: 6px; border-radius: 50%; background: #06b6d4; animation: az-blink 2s ease-in-out infinite; }
        @keyframes az-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── Input card ── */
        .az-input-card {
          background: #fff;
          border: 1px solid rgba(124,58,237,0.1);
          border-radius: 28px; padding: 36px;
          box-shadow: 0 16px 60px rgba(124,58,237,0.07);
          margin-bottom: 24px; position: relative; overflow: hidden;
        }
        .az-input-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4);
          border-radius: 28px 28px 0 0;
        }

        /* ── Drop zone ── */
        .az-dropzone {
          border: 2px dashed rgba(124,58,237,0.2);
          border-radius: 18px; padding: 20px 24px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 16px;
          cursor: pointer; transition: all 0.2s;
          background: rgba(124,58,237,0.02);
        }
        .az-dropzone.dragging { border-color: #7c3aed; background: rgba(124,58,237,0.06); }
        .az-dropzone:hover   { border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.04); }
        .az-dz-icon {
          width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
          background: rgba(124,58,237,0.1); display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .az-dz-text h4 { font-size: 14px; font-weight: 700; color: #1a0a3c; margin-bottom: 2px; }
        .az-dz-text p  { font-size: 12px; color: #8b7aad; }
        .az-dz-file    { font-size: 12px; font-weight: 600; color: #7c3aed; background: rgba(124,58,237,0.08); padding: 4px 12px; border-radius: 100px; margin-left: auto; white-space: nowrap; }

        .az-divider {
          display: flex; align-items: center; gap: 12px;
          font-size: 11px; font-weight: 700; color: #c4b5d4; text-transform: uppercase;
          letter-spacing: 0.1em; margin-bottom: 16px;
        }
        .az-divider::before, .az-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(124,58,237,0.1);
        }

        .az-input-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #6b5b95; margin-bottom: 12px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .az-char-count { font-weight: 500; color: #c4b5d4; font-size: 11px; }

        .az-textarea {
          width: 100%; min-height: 200px;
          padding: 16px 18px; border-radius: 16px;
          border: 1.5px solid rgba(124,58,237,0.15);
          background: #faf9ff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: #1a0a3c;
          line-height: 1.7; resize: vertical; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .az-textarea:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .az-textarea::placeholder { color: #c4b5d4; }

        .az-hint {
          margin-top: 10px; font-size: 12px; color: #c4b5d4; line-height: 1.6;
          display: flex; align-items: flex-start; gap: 6px;
        }

        .az-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; align-items: center; }

        .az-btn-analyze {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700;
          padding: 13px 32px; border-radius: 100px; border: none;
          box-shadow: 0 8px 28px rgba(124,58,237,0.35); cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .az-btn-analyze:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .az-btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }

        .az-btn-sample {
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
          padding: 12px 22px; border-radius: 100px;
          border: 1.5px solid rgba(124,58,237,0.22);
          background: transparent; color: #7c3aed; cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .az-btn-sample:hover { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.4); }

        .az-btn-clear {
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
          padding: 12px 20px; border-radius: 100px;
          border: 1.5px solid rgba(220,38,38,0.2);
          background: transparent; color: #dc2626; cursor: pointer;
          transition: background 0.2s;
        }
        .az-btn-clear:hover { background: rgba(220,38,38,0.05); }

        .az-btn-download {
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
          padding: 10px 20px; border-radius: 100px;
          border: 1.5px solid rgba(6,182,212,0.25);
          background: rgba(6,182,212,0.06); color: #0891b2; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: background 0.2s, border-color 0.2s;
        }
        .az-btn-download:hover { background: rgba(6,182,212,0.12); border-color: rgba(6,182,212,0.4); }

        /* ── Error ── */
        .az-error {
          background: rgba(220,38,38,0.07); border: 1px solid rgba(220,38,38,0.2);
          border-radius: 14px; padding: 14px 18px; font-size: 13px; color: #dc2626;
          margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
        }

        /* ── Loading ── */
        .az-loading {
          background: #fff; border: 1px solid rgba(124,58,237,0.1);
          border-radius: 28px; padding: 60px 40px; text-align: center;
          box-shadow: 0 16px 60px rgba(124,58,237,0.07); margin-bottom: 24px;
        }
        .az-spinner {
          width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 24px;
          border: 3px solid rgba(124,58,237,0.12);
          border-top-color: #7c3aed; border-right-color: #a855f7;
          animation: az-spin 0.9s linear infinite;
        }
        @keyframes az-spin { to { transform: rotate(360deg); } }
        .az-loading-h { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #1a0a3c; margin-bottom: 6px; }
        .az-loading-s { font-size: 13px; color: #8b7aad; }
        .az-loading-steps { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; max-width: 360px; margin-left: auto; margin-right: auto; }
        .az-loading-step {
          display: flex; align-items: center; gap: 12px;
          background: rgba(124,58,237,0.04); border-radius: 10px; padding: 10px 14px;
          font-size: 13px; color: #6b5b95;
        }
        .az-step-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #7c3aed; flex-shrink: 0;
          animation: az-blink 1.4s ease-in-out infinite;
        }
        .az-step-dot:nth-child(1) { animation-delay: 0s; }
        .az-step-dot:nth-child(2) { animation-delay: 0.3s; }
        .az-step-dot:nth-child(3) { animation-delay: 0.6s; }

        /* ── Results ── */
        .az-results { animation: az-fadeUp 0.5s ease both; }
        @keyframes az-fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

        /* Result top bar */
        .az-result-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
        }
        .az-result-topbar-label { font-size: 12px; font-weight: 700; color: #8b7aad; }

        /* Severity banner */
        .az-severity {
          display: flex; align-items: center; gap: 24px;
          border-radius: 24px; padding: 28px 32px; margin-bottom: 20px;
          border-width: 1.5px; border-style: solid; flex-wrap: wrap;
        }
        .az-sev-info { flex: 1; min-width: 200px; }
        .az-sev-icon { font-size: 38px; flex-shrink: 0; }
        .az-sev-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
          margin-bottom: 5px;
        }
        .az-sev-text { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; color: #1a0a3c; margin-bottom: 8px; }
        .az-sev-summary { font-size: 14px; line-height: 1.65; color: #6b5b95; }

        /* Tabs */
        .az-tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
        .az-tab {
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; font-weight: 700;
          padding: 8px 18px; border-radius: 100px; cursor: pointer; border: none;
          transition: all 0.2s;
        }
        .az-tab.active { background: #7c3aed; color: #fff; box-shadow: 0 4px 14px rgba(124,58,237,0.28); }
        .az-tab:not(.active) { background: rgba(124,58,237,0.07); color: #7c3aed; }
        .az-tab:not(.active):hover { background: rgba(124,58,237,0.14); }

        /* Result card */
        .az-card {
          background: #fff; border: 1px solid rgba(124,58,237,0.1);
          border-radius: 22px; padding: 28px; margin-bottom: 20px;
          box-shadow: 0 8px 36px rgba(124,58,237,0.06);
        }
        .az-card-h {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800;
          color: #1a0a3c; margin-bottom: 18px; display: flex; align-items: center; gap: 10px;
        }
        .az-card-h-icon {
          width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
          background: rgba(124,58,237,0.1);
        }

        /* Findings list */
        .az-findings { display: flex; flex-direction: column; gap: 10px; }
        .az-finding {
          display: flex; align-items: flex-start; gap: 12px;
          background: #faf9ff; border: 1px solid rgba(124,58,237,0.1);
          border-radius: 12px; padding: 13px 16px;
          font-size: 13.5px; color: #374151; line-height: 1.55;
        }
        .az-finding-bullet {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
        }

        /* Risk predictions */
        .az-risks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 14px; }
        .az-risk {
          border-radius: 16px; padding: 20px 18px;
          border-width: 1.5px; border-style: solid;
          transition: transform 0.2s;
        }
        .az-risk:hover { transform: translateY(-2px); }
        .az-risk-level {
          font-size: 10px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.1em; margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px;
        }
        .az-risk-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .az-risk-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1a0a3c; margin-bottom: 8px; }
        .az-risk-reason { font-size: 12.5px; color: #6b5b95; line-height: 1.6; }

        /* Recommendations */
        .az-rec-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .az-rec-tab {
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700;
          padding: 7px 16px; border-radius: 100px; cursor: pointer; border: none;
          transition: all 0.2s;
        }
        .az-rec-tab.active { background: #7c3aed; color: #fff; box-shadow: 0 4px 14px rgba(124,58,237,0.3); }
        .az-rec-tab:not(.active) { background: rgba(124,58,237,0.07); color: #7c3aed; }
        .az-rec-tab:not(.active):hover { background: rgba(124,58,237,0.14); }

        .az-rec-items { display: flex; flex-direction: column; gap: 10px; }
        .az-rec-item {
          display: flex; align-items: flex-start; gap: 14px;
          background: rgba(124,58,237,0.03); border: 1px solid rgba(124,58,237,0.1);
          border-radius: 14px; padding: 14px 16px;
          font-size: 13.5px; color: #374151; line-height: 1.6;
          transition: border-color 0.2s, background 0.2s;
        }
        .az-rec-item:hover { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.2); }
        .az-rec-num {
          width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #7c3aed;
          background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.18);
        }

        /* Stats row */
        .az-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
        .az-stat {
          background: #fff; border: 1px solid rgba(124,58,237,0.1);
          border-radius: 18px; padding: 20px;
          box-shadow: 0 4px 20px rgba(124,58,237,0.05);
          text-align: center;
        }
        .az-stat-val { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #1a0a3c; }
        .az-stat-lbl { font-size: 11px; font-weight: 600; color: #8b7aad; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }

        /* CTA */
        .az-cta {
          background: linear-gradient(135deg, #7c3aed, #a855f7, #06b6d4);
          border-radius: 24px; padding: 36px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
          position: relative; overflow: hidden;
          margin-top: 24px;
        }
        .az-cta::before {
          content: ''; position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .az-cta-text h3 { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .az-cta-text p { font-size: 13px; color: rgba(255,255,255,0.75); }
        .az-btn-white {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #7c3aed; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700; padding: 12px 26px;
          border-radius: 100px; text-decoration: none; white-space: nowrap;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          transition: transform 0.2s;
        }
        .az-btn-white:hover { transform: translateY(-1px); }

        @media(max-width:768px){
          .az-root { padding: 24px 20px 60px; }
          .az-risks-grid { grid-template-columns: 1fr; }
          .az-stats { grid-template-columns: 1fr; }
          .az-cta { flex-direction: column; }
          .az-severity { gap: 16px; }
        }
      `}</style>

      <div className="az-root">
        <div className="az-inner">

          {/* ── HEADER ── */}
          <div className="az-header">
            <div className="az-kicker">AI Medical Analyzer</div>
            <h1 className="az-h1">
              Understand Your <span>Medical Report</span>
            </h1>
            <p className="az-sub">
              Paste or upload any medical report — lab results, prescriptions, or doctor notes — and get a clear, structured AI-powered health analysis in seconds.
            </p>
            <div className="az-powered">
              <div className="az-powered-dot" />
              Powered by Groq · llama-3.3-70b-versatile
            </div>
          </div>

          {/* ── WARNING NOTICE ── */}
          <div style={{
            background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 16, padding: '14px 18px', marginBottom: 28,
            display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13, color: '#92400e', lineHeight: 1.6,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <span>
              <strong>Educational &amp; screening purposes only.</strong> This AI analysis is not a medical diagnosis.
              Always consult a licensed healthcare professional for medical decisions.
            </span>
          </div>

          {/* ── INPUT CARD ── */}
          <div className="az-input-card">

            {/* Drop zone */}
            <input
              ref={fileRef} type="file"
              accept=".txt,.csv,.json,.md,.rtf"
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />
            <div
              className={`az-dropzone${dragging ? ' dragging' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="az-dz-icon">📂</div>
              <div className="az-dz-text">
                <h4>Upload a medical report file</h4>
                <p>Drag &amp; drop or click — supports .txt, .csv, .json, .md</p>
              </div>
              {fileName && <div className="az-dz-file">📄 {fileName}</div>}
            </div>

            <div className="az-divider">or paste text below</div>

            <div className="az-input-label">
              <span>Paste Medical Report, Lab Data, or Doctor Notes</span>
              <span className="az-char-count">{charCount.toLocaleString()} chars</span>
            </div>
            <textarea
              className="az-textarea"
              value={reportText}
              onChange={handleChange}
              placeholder={`Paste your medical report here...\n\nExamples:\n• Lab results (blood sugar, cholesterol, BP, etc.)\n• Doctor's notes or prescriptions\n• Health checkup summary\n• JSON structured health data`}
              spellCheck={false}
            />
            <p className="az-hint">
              <span>💡</span>
              <span>Include blood work, vitals, symptoms, lifestyle notes, family history, or doctor observations. The more detail, the more accurate the analysis.</span>
            </p>

            <div className="az-actions">
              <button className="az-btn-analyze" onClick={analyze} disabled={loading || !reportText.trim()}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'az-spin 0.9s linear infinite' }} />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                    Analyze with AI
                  </>
                )}
              </button>
              <button className="az-btn-sample" onClick={loadSample} disabled={loading}>Try Sample Report</button>
              {reportText && <button className="az-btn-clear" onClick={reset} disabled={loading}>Clear</button>}
            </div>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="az-error">
              <span>🚫</span><span>{error}</span>
            </div>
          )}

          {/* ── LOADING ── */}
          {loading && (
            <div className="az-loading">
              <div className="az-spinner" />
              <div className="az-loading-h">Analyzing your medical report…</div>
              <div className="az-loading-s">Groq AI is reviewing your data and generating health insights.</div>
              <div className="az-loading-steps">
                {['Extracting health parameters', 'Identifying risk patterns', 'Generating recommendations'].map((s, i) => (
                  <div key={i} className="az-loading-step">
                    <div className="az-step-dot" style={{ animationDelay: `${i * 0.3}s` }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {result && !loading && (
            <div className="az-results" ref={resultRef}>

              {/* Top bar */}
              <div className="az-result-topbar">
                <div className="az-result-topbar-label">Analysis Complete · {new Date().toLocaleString()}</div>
                <button className="az-btn-download" onClick={downloadReport}>
                  ⬇ Download Report
                </button>
              </div>

              {/* Severity banner with gauge */}
              <div className="az-severity" style={{ background: sev.bg, borderColor: sev.border }}>
                <div className="az-sev-icon">{sev.icon}</div>
                <HealthGauge score={sev.score} color={sev.ring} />
                <div className="az-sev-info">
                  <div className="az-sev-label" style={{ color: sev.color }}>Overall Health Status</div>
                  <div className="az-sev-text">{result.severity}</div>
                  <div className="az-sev-summary">{result.summary}</div>
                </div>
              </div>

              {/* Stats row */}
              <div className="az-stats">
                <div className="az-stat">
                  <div className="az-stat-val" style={{ color: '#7c3aed' }}>{(result.key_findings || []).length}</div>
                  <div className="az-stat-lbl">Key Findings</div>
                </div>
                <div className="az-stat">
                  <div className="az-stat-val" style={{ color: '#d97706' }}>{(result.risk_predictions || []).length}</div>
                  <div className="az-stat-lbl">Risk Predictions</div>
                </div>
                <div className="az-stat">
                  <div className="az-stat-val" style={{ color: '#16a34a' }}>
                    {(result.recommendations?.diet?.length || 0) + (result.recommendations?.exercise?.length || 0) + (result.recommendations?.lifestyle?.length || 0)}
                  </div>
                  <div className="az-stat-lbl">Recommendations</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="az-tabs">
                {[
                  { key: 'overview',    label: '🔍 Overview' },
                  { key: 'risks',       label: '📈 Risk Predictions' },
                  { key: 'recs',        label: '💡 Recommendations' },
                ].map(t => (
                  <button key={t.key} className={`az-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Overview tab */}
              {activeTab === 'overview' && (
                <div className="az-card">
                  <div className="az-card-h"><div className="az-card-h-icon">🔍</div>Key Findings</div>
                  <div className="az-findings">
                    {(result.key_findings || []).map((f, i) => (
                      <div key={i} className="az-finding">
                        <div className="az-finding-bullet" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks tab */}
              {activeTab === 'risks' && (
                <div className="az-card">
                  <div className="az-card-h"><div className="az-card-h-icon">📈</div>Risk Predictions</div>
                  <div className="az-risks-grid">
                    {(result.risk_predictions || []).map((r, i) => {
                      const rc = RISK_COLORS[r.risk_level] || RISK_COLORS['Medium'];
                      return (
                        <div key={i} className="az-risk" style={{ background: rc.bg, borderColor: rc.border }}>
                          <div className="az-risk-level" style={{ color: rc.color }}>
                            <div className="az-risk-dot" style={{ background: rc.color }} />
                            {r.risk_level} Risk
                          </div>
                          <div className="az-risk-name">{r.condition}</div>
                          <div className="az-risk-reason">{r.reason}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommendations tab */}
              {activeTab === 'recs' && (
                <RecommendationsCard recs={result.recommendations} />
              )}

              {/* CTA */}
              <div className="az-cta">
                <div className="az-cta-text">
                  <h3>Run a Full Clinical Assessment</h3>
                  <p>Get a detailed AI risk score with knowledge graph insights and Dr. Ada guidance.</p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                  <Link to="/assessment" className="az-btn-white">Start Assessment →</Link>
                  <Link to="/dashboard" className="az-btn-white" style={{ color: '#a855f7' }}>Open Dashboard</Link>
                </div>
              </div>

            </div>
          )}

          <FooterDisclaimer />
        </div>
      </div>
    </>
  );
}

/* ── Recommendations sub-component ── */
function RecommendationsCard({ recs }) {
  const [tab, setTab] = useState('diet');
  if (!recs) return null;
  const TABS = [
    { key: 'diet',     label: '🥗 Diet',      items: recs.diet      || [] },
    { key: 'exercise', label: '🏃 Exercise',   items: recs.exercise  || [] },
    { key: 'lifestyle',label: '🌿 Lifestyle',  items: recs.lifestyle || [] },
  ];
  const current = TABS.find(t => t.key === tab) || TABS[0];

  return (
    <div className="az-card" style={{ marginBottom: 20 }}>
      <div className="az-card-h">
        <div className="az-card-h-icon">💡</div>
        Preventive Recommendations
      </div>
      <div className="az-rec-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`az-rec-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label} <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 4 }}>{t.items.length}</span>
          </button>
        ))}
      </div>
      <div className="az-rec-items">
        {current.items.map((item, i) => (
          <div key={i} className="az-rec-item">
            <div className="az-rec-num">{i + 1}</div>
            <span>{item}</span>
          </div>
        ))}
        {current.items.length === 0 && (
          <div style={{ fontSize: 13, color: '#c4b5d4', padding: '8px 0' }}>No specific recommendations for this category.</div>
        )}
      </div>
    </div>
  );
}
