/**
 * Clinical risk scoring engine — Framingham-inspired (ATP III–style points) for CVD,
 * FINDRISC-inspired factors for Type 2 Diabetes, and BP/metabolic staging for Hypertension.
 * Pure JavaScript; no ML libraries. Educational screening use — not a substitute for clinical judgment.
 *
 * Units: total cholesterol & fasting glucose in mg/dL; BMI kg/m²; SBP mmHg.
 * Optional: `bloodPressureDiastolic` — if omitted, estimated from SBP for staging.
 * Second arg: `{ sex: 'female' }` uses female Framingham point bands (default male).
 */

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const MONTHS = [0, 6, 12, 24, 60];

/** @typedef {{ condition: string, relation?: string }} FamilyHistoryEntry */

/**
 * @param {unknown} hr
 * @returns {{
 *   age: number,
 *   bloodPressureSystolic: number,
 *   bloodPressureDiastolic: number,
 *   cholesterol: number,
 *   bmi: number,
 *   bloodSugar: number,
 *   smoker: boolean,
 *   hasDiabetes: boolean,
 *   hasHypertension: boolean,
 *   physicalActivity: string,
 *   dietType: string,
 *   familyHistory: string[],
 * }}
 */
function normalizeHealthRecord(hr) {
  const o = hr && typeof hr === 'object' ? hr : {};
  const sbp = Number(o.bloodPressureSystolic);
  const dbp = Number(o.bloodPressureDiastolic);
  const age = Number(o.age);
  const chol = Number(o.cholesterol);
  const bmi = Number(o.bmi);
  const bs = Number(o.bloodSugar);

  return {
    age: Number.isFinite(age) ? clamp(age, 18, 110) : 45,
    bloodPressureSystolic: Number.isFinite(sbp) ? clamp(sbp, 70, 250) : 120,
    bloodPressureDiastolic: Number.isFinite(dbp)
      ? clamp(dbp, 40, 150)
      : Number.isFinite(sbp)
        ? clamp(Math.round(sbp * 0.55), 40, 150)
        : 80,
    cholesterol: Number.isFinite(chol) ? clamp(chol, 100, 400) : 200,
    bmi: Number.isFinite(bmi) ? clamp(bmi, 15, 60) : 25,
    bloodSugar: Number.isFinite(bs) ? clamp(bs, 60, 400) : 92,
    smoker: Boolean(o.smoker),
    hasDiabetes: Boolean(o.hasDiabetes),
    hasHypertension: Boolean(o.hasHypertension),
    physicalActivity: typeof o.physicalActivity === 'string' ? o.physicalActivity : 'moderate',
    dietType: typeof o.dietType === 'string' ? o.dietType : 'mixed',
    familyHistory: Array.isArray(o.familyHistory)
      ? o.familyHistory.map((x) => (typeof x === 'string' ? x.toLowerCase().trim() : '')).filter(Boolean)
      : [],
  };
}

function familyHits(fh) {
  const cvd = fh.some((x) =>
    /cardio|heart|stroke|cvd|chd|mi\b|coronary/.test(x)
  );
  const dm = fh.some((x) => /diabet|t2d|t2\b|glucose/.test(x));
  const htn = fh.some((x) => /hypertens|blood\s*pressure|htn/.test(x));
  return { cvd, dm, htn };
}

/* ---------- Framingham-inspired 10-year hard CHD risk (ATP III–style points, men; women offset) ---------- */
function agePointsFramingham(age, sex) {
  const isF = sex === 'female';
  if (age < 35) return isF ? -7 : -9;
  if (age < 40) return isF ? -3 : -4;
  if (age < 45) return isF ? 0 : 0;
  if (age < 50) return isF ? 3 : 3;
  if (age < 55) return isF ? 6 : 6;
  if (age < 60) return isF ? 8 : 8;
  if (age < 65) return isF ? 10 : 10;
  if (age < 70) return isF ? 11 : 11;
  if (age < 75) return isF ? 12 : 12;
  return isF ? 13 : 13;
}

function totalCholPoints(tc, age, sex) {
  const isF = sex === 'female';
  const band = age < 40 ? 'y' : age < 50 ? 'm' : 'o';
  const t = (ranges) => (band === 'y' ? ranges[0] : band === 'm' ? ranges[1] : ranges[2]);
  if (tc < 160) return t(isF ? [0, 0, 0] : [0, 0, 0]);
  if (tc < 200) return t(isF ? [4, 3, 2] : [4, 3, 2]);
  if (tc < 240) return t(isF ? [8, 6, 4] : [7, 5, 3]);
  if (tc < 280) return t(isF ? [11, 8, 5] : [9, 6, 4]);
  return t(isF ? [13, 10, 7] : [11, 8, 5]);
}

function sbpPoints(sbp, treated, sex) {
  const isF = sex === 'female';
  if (treated) {
    if (sbp < 120) return isF ? 0 : 0;
    if (sbp < 130) return isF ? 3 : 1;
    if (sbp < 140) return isF ? 4 : 2;
    if (sbp < 160) return isF ? 5 : 3;
    return isF ? 6 : 4;
  }
  if (sbp < 120) return isF ? 0 : 0;
  if (sbp < 130) return isF ? 1 : 0;
  if (sbp < 140) return isF ? 2 : 1;
  if (sbp < 160) return isF ? 3 : 2;
  return isF ? 4 : 3;
}

/** Map Framingham ATP III total points → 10-year hard CHD risk % (approximate smooth fit, men 40–79) */
function framinghamPointsToPercent10yr(points, sex) {
  const isF = sex === 'female';
  const p = points + (isF ? -3 : 0);
  const risk = 1 / (1 + Math.exp(-(p - 8) * 0.35));
  return clamp(risk * 45, 0.5, 45);
}

function computeCVD10YearPercent(x, sex, fam) {
  const treated = x.hasHypertension;
  let pts =
    agePointsFramingham(x.age, sex) +
    totalCholPoints(x.cholesterol, x.age, sex) +
    sbpPoints(x.bloodPressureSystolic, treated, sex);
  if (x.smoker) pts += sex === 'female' ? 4 : 4;
  if (x.hasDiabetes) pts += sex === 'female' ? 4 : 2;
  if (fam.cvd) pts += 2;

  const tenYr = framinghamPointsToPercent10yr(pts, sex);
  const prob = clamp(tenYr / 100, 0, 1);

  let stage = 'low_risk';
  if (tenYr >= 20) stage = 'high_risk';
  else if (tenYr >= 10) stage = 'intermediate_risk';
  else if (tenYr >= 5) stage = 'borderline_risk';

  return { probability: prob, percent10yr: tenYr, points: pts, stage };
}

/* ---------- Type 2 diabetes — FINDRISC-inspired (0–26 → probability) ---------- */
function findriscInspiredScore(x, fam) {
  let s = 0;
  if (x.bmi < 25) s += 0;
  else if (x.bmi < 30) s += 1;
  else s += 3;

  if (x.age < 45) s += 0;
  else if (x.age < 55) s += 2;
  else if (x.age < 65) s += 3;
  else s += 4;

  const act = String(x.physicalActivity).toLowerCase();
  if (/sedentary|low|none|minimal/.test(act)) s += 2;
  else if (/light|occasional/.test(act)) s += 1;

  const diet = String(x.dietType).toLowerCase();
  if (/poor|western|processed|high_sugar|unhealthy/.test(diet)) s += 2;
  else if (/mixed|average/.test(diet)) s += 1;

  if (x.bloodPressureSystolic >= 140 || x.hasHypertension) s += 2;
  if (x.bloodSugar >= 100 && x.bloodSugar < 126) s += 5;
  if (x.hasDiabetes) s += 5;
  if (fam.dm) s += 5;

  return clamp(s, 0, 26);
}

function findriscToProbability(score) {
  if (score < 7) return 0.01;
  if (score < 15) return 0.05 + (score - 7) * 0.02;
  if (score < 21) return 0.25 + (score - 15) * 0.05;
  return clamp(0.55 + (score - 21) * 0.06, 0, 1);
}

function diabetesStage(x, prob) {
  if (x.hasDiabetes) return { stage: 'diagnosed_or_known_t2d', probability: Math.max(prob, 0.85) };
  if (x.bloodSugar >= 126) return { stage: 'hyperglycemia_screening', probability: Math.max(prob, 0.55) };
  if (x.bloodSugar >= 100) return { stage: 'prediabetes_range', probability: prob };
  if (prob >= 0.45) return { stage: 'high_lifetime_risk', probability: prob };
  if (prob >= 0.2) return { stage: 'elevated_risk', probability: prob };
  return { stage: 'lower_risk', probability: prob };
}

/* ---------- Hypertension — ACC/AHA-style staging + probability of complications proxy ---------- */
function hypertensionStageBP(sbp, dbp) {
  if (sbp >= 180 || dbp >= 120) return { label: 'hypertensive_crisis', grade: 4 };
  if (sbp >= 140 || dbp >= 90) return { label: 'stage_2_hypertension', grade: 3 };
  if (sbp >= 130 || dbp >= 80) return { label: 'stage_1_hypertension', grade: 2 };
  if (sbp >= 120 && sbp <= 129 && dbp < 80) return { label: 'elevated_bp', grade: 1 };
  return { label: 'normal_bp', grade: 0 };
}

function hypertensionProbabilityAndStage(x, fam) {
  const { label, grade } = hypertensionStageBP(x.bloodPressureSystolic, x.bloodPressureDiastolic);
  let p = 0.08 + grade * 0.18;
  if (x.hasHypertension) p += 0.25;
  if (x.bmi >= 30) p += 0.08;
  if (fam.htn) p += 0.1;
  p = clamp(p, 0, 0.98);
  return { probability: p, stage: label };
}

/* ---------- Feature importance (marginal point contributions, Framingham + metabolic) ---------- */
function featureImportance(x, sex, fam) {
  const treated = x.hasHypertension;
  const parts = [
    { feature: 'age', contribution: Math.abs(agePointsFramingham(x.age, sex)) },
    { feature: 'total_cholesterol', contribution: Math.abs(totalCholPoints(x.cholesterol, x.age, sex)) },
    {
      feature: 'systolic_blood_pressure',
      contribution: Math.abs(sbpPoints(x.bloodPressureSystolic, treated, sex)),
    },
    { feature: 'smoking', contribution: x.smoker ? 4 : 0 },
    { feature: 'diabetes_status', contribution: x.hasDiabetes ? (sex === 'female' ? 4 : 2) : 0 },
    { feature: 'bmi', contribution: x.bmi >= 30 ? 3 : x.bmi >= 25 ? 1.5 : 0.5 },
    {
      feature: 'blood_glucose',
      contribution: x.bloodSugar >= 126 ? 4 : x.bloodSugar >= 100 ? 2 : 0.2,
    },
    { feature: 'family_history_cvd', contribution: fam.cvd ? 2 : 0 },
    { feature: 'family_history_diabetes', contribution: fam.dm ? 3 : 0 },
    { feature: 'family_history_hypertension', contribution: fam.htn ? 2 : 0 },
    {
      feature: 'physical_activity',
      contribution: /sedentary|low|none|minimal/i.test(x.physicalActivity) ? 2 : 0.5,
    },
    {
      feature: 'diet_pattern',
      contribution: /poor|western|processed|high_sugar|unhealthy/i.test(x.dietType) ? 2 : 0.5,
    },
  ];

  const sum = parts.reduce((a, b) => a + b.contribution, 0) || 1;
  return parts
    .map((p) => ({
      feature: p.feature,
      importance: clamp(p.contribution / sum, 0, 1),
      percentContribution: Math.round((p.contribution / sum) * 1000) / 10,
      rawContribution: Math.round(p.contribution * 100) / 100,
    }))
    .sort((a, b) => b.importance - a.importance);
}

/* ---------- Overall 0–100 score + level ---------- */
function compositeRiskScore(cvdPct, dmProb, htnProb) {
  const cvd = clamp(cvdPct, 0, 50);
  const dm = clamp(dmProb * 100, 0, 100);
  const htn = clamp(htnProb * 100, 0, 100);
  return clamp(0.45 * (cvd / 50) * 100 + 0.3 * dm + 0.25 * htn, 0, 100);
}

function riskLevelFromScore(score) {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

/* ---------- Temporal projection (simple non-ML extrapolation) ---------- */
function progressionTimeline(base, x) {
  const fam = familyHits(x.familyHistory);
  const accel =
    1 +
    (x.smoker ? 0.12 : 0) +
    (x.hasDiabetes ? 0.15 : 0) +
    (x.bmi >= 30 ? 0.08 : 0) +
    (fam.cvd || fam.dm ? 0.06 : 0);

  const byName = (n) => base.diseases.find((d) => d.name === n);
  const stripDisease = (d) => ({
    name: d.name,
    probability: d.probability,
    stage: d.stage,
  });

  const out = {};
  for (const m of MONTHS) {
    if (m === 0) {
      out[m] = {
        riskScore: base.riskScore,
        riskLevel: base.riskLevel,
        diseases: base.diseases.map(stripDisease),
      };
      continue;
    }

    const years = m / 12;
    const damp = 1 - Math.exp(-0.09 * years * accel);
    const riskScore = clamp(base.riskScore + (100 - base.riskScore) * damp * 0.55, 0, 100);

    const cvdP = clamp(
      byName('Cardiovascular Disease').probability + 0.04 * years * accel,
      0,
      0.95
    );
    const dmP = clamp(
      byName('Type 2 Diabetes').probability + 0.05 * years * accel,
      0,
      0.95
    );
    const htnP = clamp(
      byName('Hypertension').probability + 0.03 * years * accel,
      0,
      0.95
    );

    out[m] = {
      riskScore: Math.round(riskScore * 10) / 10,
      riskLevel: riskLevelFromScore(riskScore),
      diseases: [
        {
          name: 'Cardiovascular Disease',
          probability: Math.round(cvdP * 1000) / 1000,
          stage: byName('Cardiovascular Disease').stage,
        },
        {
          name: 'Type 2 Diabetes',
          probability: Math.round(dmP * 1000) / 1000,
          stage: byName('Type 2 Diabetes').stage,
        },
        {
          name: 'Hypertension',
          probability: Math.round(htnP * 1000) / 1000,
          stage: byName('Hypertension').stage,
        },
      ],
    };
  }
  return out;
}

/**
 * @param {object} healthRecord
 * @param {{ sex?: 'male'|'female' }} [options]
 */
function computeRiskAssessment(healthRecord, options = {}) {
  const x = normalizeHealthRecord(healthRecord);
  const hrSex = healthRecord && healthRecord.sex === 'female' ? 'female' : null;
  const sex = options.sex === 'female' || hrSex === 'female' ? 'female' : 'male';
  const fam = familyHits(x.familyHistory);

  const cvd = computeCVD10YearPercent(x, sex, fam);
  const dmScore = findriscInspiredScore(x, fam);
  let dmProb = findriscToProbability(dmScore);
  const dmSt = diabetesStage(x, dmProb);
  dmProb = dmSt.probability;

  const htn = hypertensionProbabilityAndStage(x, fam);

  const riskScore = Math.round(
    compositeRiskScore(cvd.percent10yr, dmProb, htn.probability) * 10
  ) / 10;
  const riskLevel = riskLevelFromScore(riskScore);

  const diseases = [
    {
      name: 'Cardiovascular Disease',
      probability: Math.round(cvd.probability * 1000) / 1000,
      stage: cvd.stage,
    },
    {
      name: 'Type 2 Diabetes',
      probability: Math.round(dmProb * 1000) / 1000,
      stage: dmSt.stage,
    },
    {
      name: 'Hypertension',
      probability: Math.round(htn.probability * 1000) / 1000,
      stage: htn.stage,
    },
  ];

  const base = {
    riskScore,
    riskLevel,
    featureImportance: featureImportance(x, sex, fam),
    diseases,
  };

  return {
    ...base,
    progressionTimeline: progressionTimeline(base, x),
  };
}

module.exports = {
  computeRiskAssessment,
  normalizeHealthRecord,
  MONTHS,
};
