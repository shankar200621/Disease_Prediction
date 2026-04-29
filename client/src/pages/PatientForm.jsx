import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePrediction } from '../context/PredictionContext';
import { predictionsApi } from '../api/client';
import FooterDisclaimer from '../components/FooterDisclaimer';

const STEP_LABELS = ['Personal', 'Vitals', 'Lifestyle', 'Family & Labs'];

const initial = {
  age: '', phone: '',
  bloodPressureSystolic: '', bloodPressureDiastolic: '',
  weightKg: '', heightCm: '', heartRate: '',
  smoker: false, hasDiabetes: false, hasHypertension: false,
  physicalActivity: 'moderate', dietType: 'mixed',
  familyHistoryText: 'hypertension',
  cholesterol: '', bloodSugar: '',
};

export default function PatientForm() {
  const { user } = useAuth();
  const { setLastRun } = usePrediction();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const pct = ((step + 1) / STEP_LABELS.length) * 100;

  const submit = async () => {
    if (!user?.patientId) { setErr('Not signed in'); return; }
    setErr(''); setLoading(true);
    const vitals = {
      bloodPressureSystolic: form.bloodPressureSystolic ? Number(form.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: form.bloodPressureDiastolic ? Number(form.bloodPressureDiastolic) : undefined,
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      heightCm: form.heightCm ? Number(form.heightCm) : undefined,
      heartRate: form.heartRate ? Number(form.heartRate) : undefined,
    };
    const labResults = [];
    if (form.cholesterol) labResults.push({ testName: 'Total cholesterol', value: String(form.cholesterol), unit: 'mg/dL' });
    if (form.bloodSugar) labResults.push({ testName: 'Fasting glucose', value: String(form.bloodSugar), unit: 'mg/dL' });

    try {
      const res = await predictionsApi.run(user.patientId, {
        symptoms: [],
        vitals, labResults,
        notes: form.phone ? `Phone: ${form.phone}` : undefined,
        source: 'manual',
        age: form.age ? Number(form.age) : undefined,
        smoker: form.smoker, hasDiabetes: form.hasDiabetes,
        hasHypertension: form.hasHypertension,
        physicalActivity: form.physicalActivity, dietType: form.dietType,
        familyHistory: form.familyHistoryText.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
        cholesterol: form.cholesterol ? Number(form.cholesterol) : undefined,
        bloodSugar: form.bloodSugar ? Number(form.bloodSugar) : undefined,
      });
      setLastRun(res);
      nav('/dashboard');
    } catch (e) {
      setErr(e.message || 'Prediction failed.');
    } finally { setLoading(false); }
  };

  const next = () => { if (step < STEP_LABELS.length - 1) setStep(s => s + 1); else submit(); };
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

        .pf-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: linear-gradient(155deg, #fafbff 0%, #f8f5ff 50%, #f0f9ff 100%);
          padding: 40px 24px 80px;
          position: relative; overflow: hidden;
        }
        .pf-root::before {
          content: '';
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 600px 400px at 80% 10%, rgba(124,58,237,0.07), transparent 60%),
            radial-gradient(ellipse 400px 400px at 20% 90%, rgba(6,182,212,0.05), transparent 60%);
          pointer-events: none;
        }

        .pf-inner { position: relative; z-index: 1; max-width: 780px; margin: 0 auto; }

        .pf-header { margin-bottom: 36px; }
        .pf-kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #7c3aed; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .pf-kicker::before { content: ''; display: block; width: 18px; height: 2px; background: #7c3aed; border-radius: 2px; }
        .pf-h1 { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; color: #1a0a3c; margin-bottom: 8px; }
        .pf-sub { font-size: 14px; color: #8b7aad; }

        /* Step indicator */
        .pf-steps { display: flex; align-items: center; gap: 0; margin-bottom: 36px; }
        .pf-step-item { display: flex; align-items: center; flex: 1; }
        .pf-step-circle {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          transition: background 0.3s, color 0.3s, box-shadow 0.3s;
        }
        .pf-step-circle.done {
          background: #7c3aed; color: #fff;
          box-shadow: 0 4px 12px rgba(124,58,237,0.35);
        }
        .pf-step-circle.active {
          background: #fff; color: #7c3aed;
          border: 2px solid #7c3aed;
          box-shadow: 0 0 0 4px rgba(124,58,237,0.12);
        }
        .pf-step-circle.todo { background: #f0ebff; color: #c4b5d4; border: 2px solid #e8deff; }
        .pf-step-label { font-size: 11px; font-weight: 600; margin-top: 6px; text-align: center; white-space: nowrap; }
        .pf-step-wrap { display: flex; flex-direction: column; align-items: center; }
        .pf-step-line { flex: 1; height: 2px; background: #e8deff; margin: 0 8px; transition: background 0.3s; }
        .pf-step-line.done { background: #7c3aed; }

        /* Progress bar */
        .pf-progress { height: 4px; background: rgba(124,58,237,0.12); border-radius: 100px; margin-bottom: 32px; overflow: hidden; }
        .pf-progress-fill {
          height: 100%; border-radius: 100px;
          background: linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4);
          transition: width 0.45s cubic-bezier(0.4,0,0.2,1);
        }

        /* Card */
        .pf-card {
          background: #fff;
          border: 1px solid rgba(124,58,237,0.1);
          border-radius: 28px; padding: 44px 40px;
          box-shadow: 0 20px 70px rgba(124,58,237,0.08), 0 0 0 1px rgba(124,58,237,0.05);
          position: relative; overflow: hidden;
          margin-bottom: 24px;
        }
        .pf-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4);
          border-radius: 28px 28px 0 0;
        }

        .pf-step-h { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #1a0a3c; margin-bottom: 24px; }

        .pf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media(max-width:560px){ .pf-grid { grid-template-columns: 1fr; } }

        .pf-field { display: flex; flex-direction: column; gap: 7px; }
        .pf-label { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #6b5b95; }
        .pf-input {
          padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid rgba(124,58,237,0.15);
          background: #faf9ff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: #1a0a3c; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pf-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .pf-input::placeholder { color: #c4b5d4; }

        /* Checkbox */
        .pf-check-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .pf-check-label {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px; border-radius: 14px;
          border: 1.5px solid rgba(124,58,237,0.12);
          background: #faf9ff; cursor: pointer;
          font-size: 14px; color: #374151; font-weight: 500;
          transition: border-color 0.2s, background 0.2s;
        }
        .pf-check-label:hover { border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.03); }
        .pf-check-label input[type=checkbox] { width: 18px; height: 18px; accent-color: #7c3aed; }

        /* Select */
        .pf-select {
          padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid rgba(124,58,237,0.15);
          background: #faf9ff; appearance: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: #1a0a3c; outline: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237c3aed' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pf-select:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }

        /* Error */
        .pf-err { font-size: 13px; color: #dc2626; background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.15); border-radius: 12px; padding: 12px 16px; margin-top: 20px; }

        /* Buttons */
        .pf-actions { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .pf-btn-back {
          padding: 13px 28px; border-radius: 100px;
          border: 1.5px solid rgba(124,58,237,0.2);
          background: transparent; color: #7c3aed;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .pf-btn-back:hover:not(:disabled) { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.4); }
        .pf-btn-back:disabled { opacity: 0.4; cursor: not-allowed; }

        .pf-btn-next {
          padding: 13px 36px; border-radius: 100px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: #fff; border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700; cursor: pointer;
          box-shadow: 0 8px 24px rgba(124,58,237,0.35);
          transition: opacity 0.2s, transform 0.2s;
        }
        .pf-btn-next:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .pf-btn-next:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <div className="pf-root">
        <div className="pf-inner">
          <div className="pf-header">
            <div className="pf-kicker">Health Assessment</div>
            <h1 className="pf-h1">Tell us about yourself</h1>
            <p className="pf-sub">Four quick steps — your data is sent securely to the backend for AI-powered scoring.</p>
          </div>

          {/* Step indicator */}
          <div className="pf-steps">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="pf-step-item">
                <div className="pf-step-wrap">
                  <div className={`pf-step-circle ${i < step ? 'done' : i === step ? 'active' : 'todo'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <div className="pf-step-label" style={{ color: i <= step ? '#7c3aed' : '#c4b5d4' }}>{label}</div>
                </div>
                {i < STEP_LABELS.length - 1 && <div className={`pf-step-line${i < step ? ' done' : ''}`} />}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="pf-progress">
            <div className="pf-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          {/* Content card */}
          <div className="pf-card">

            {step === 0 && (
              <>
                <h2 className="pf-step-h">Personal Information</h2>
                <div className="pf-grid">
                  <PfField label="Age" type="number" value={form.age} onChange={v => update('age', v)} placeholder="e.g. 42" />
                  <PfField label="Phone (optional)" value={form.phone} onChange={v => update('phone', v)} placeholder="+1 555 000 000" />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="pf-step-h">Vitals & Measurements</h2>
                <div className="pf-grid">
                  <PfField label="Systolic BP (mmHg)" type="number" value={form.bloodPressureSystolic} onChange={v => update('bloodPressureSystolic', v)} placeholder="120" />
                  <PfField label="Diastolic BP (mmHg)" type="number" value={form.bloodPressureDiastolic} onChange={v => update('bloodPressureDiastolic', v)} placeholder="80" />
                  <PfField label="Weight (kg)" type="number" value={form.weightKg} onChange={v => update('weightKg', v)} placeholder="70" />
                  <PfField label="Height (cm)" type="number" value={form.heightCm} onChange={v => update('heightCm', v)} placeholder="175" />
                  <PfField label="Heart Rate (bpm)" type="number" value={form.heartRate} onChange={v => update('heartRate', v)} placeholder="72" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="pf-step-h">Lifestyle & Conditions</h2>
                <div className="pf-check-group">
                  {[
                    { key: 'smoker', label: '🚬  Current smoker' },
                    { key: 'hasDiabetes', label: '🩸  Known diabetes' },
                    { key: 'hasHypertension', label: '💊  Treated hypertension' },
                  ].map(({ key, label }) => (
                    <label key={key} className="pf-check-label">
                      <input type="checkbox" checked={form[key]} onChange={e => update(key, e.target.checked)} />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="pf-grid">
                  <div className="pf-field">
                    <label className="pf-label">Physical Activity</label>
                    <select className="pf-select" value={form.physicalActivity} onChange={e => update('physicalActivity', e.target.value)}>
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">Diet Pattern</label>
                    <select className="pf-select" value={form.dietType} onChange={e => update('dietType', e.target.value)}>
                      <option value="balanced">Balanced</option>
                      <option value="mixed">Mixed</option>
                      <option value="poor">Poor / processed</option>
                      <option value="western">Western / high sugar</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="pf-step-h">Family History & Lab Results</h2>
                <div className="pf-field" style={{ marginBottom: 20 }}>
                  <label className="pf-label">Family history (comma-separated keywords)</label>
                  <input className="pf-input" value={form.familyHistoryText} onChange={e => update('familyHistoryText', e.target.value)} placeholder="e.g. hypertension, diabetes, heart disease" />
                </div>
                <div className="pf-grid">
                  <PfField label="Total cholesterol (mg/dL)" type="number" value={form.cholesterol} onChange={v => update('cholesterol', v)} placeholder="200" />
                  <PfField label="Fasting glucose (mg/dL)" type="number" value={form.bloodSugar} onChange={v => update('bloodSugar', v)} placeholder="95" />
                </div>
              </>
            )}

            {err && <div className="pf-err">{err}</div>}
          </div>

          <div className="pf-actions">
            <button className="pf-btn-back" onClick={back} disabled={step === 0 || loading}>← Back</button>
            <button className="pf-btn-next" onClick={next} disabled={loading}>
              {loading ? 'Running prediction…' : step === STEP_LABELS.length - 1 ? 'Run Analysis →' : 'Continue →'}
            </button>
          </div>

          <FooterDisclaimer />
        </div>
      </div>
    </>
  );
}

function PfField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="pf-field">
      <label className="pf-label">{label}</label>
      <input className="pf-input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
