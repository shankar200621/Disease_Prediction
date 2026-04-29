const { computeRiskAssessment } = require('./riskScoringEngine');

/**
 * @param {object} healthData — flat fields consumed by {@link computeRiskAssessment}
 * @param {{ sex?: 'male'|'female' }} [options]
 */
function calculateRiskScore(healthData, options = {}) {
  return computeRiskAssessment(healthData, options);
}

function ageFromDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) return undefined;
  const d = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  if (Number.isNaN(d.getTime())) return undefined;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function parseLabNumber(labResults, pattern) {
  if (!Array.isArray(labResults)) return undefined;
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
  const row = labResults.find((l) => l && re.test(String(l.testName || '')));
  if (!row || row.value == null) return undefined;
  const n = parseFloat(String(row.value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function computeBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return undefined;
  const h = heightCm / 100;
  if (h <= 0) return undefined;
  const bmi = weightKg / (h * h);
  return Number.isFinite(bmi) ? Math.round(bmi * 10) / 10 : undefined;
}

/**
 * Merge Patient + saved HealthRecord + request body into one object for the risk engine.
 * @param {{ patient: object, healthRecord: object, body: object }}
 */
function buildHealthData({ patient, healthRecord, body }) {
  const b = body && typeof body === 'object' ? body : {};
  const v = healthRecord.vitals || {};
  const labs = healthRecord.labResults || [];

  const age =
    (Number.isFinite(Number(b.age)) ? Number(b.age) : undefined) ??
    ageFromDateOfBirth(patient.dateOfBirth) ??
    45;

  const bloodPressureSystolic = coalesceNum(
    b.bloodPressureSystolic,
    v.bloodPressureSystolic
  );
  const bloodPressureDiastolic = coalesceNum(
    b.bloodPressureDiastolic,
    v.bloodPressureDiastolic
  );

  const cholesterol =
    coalesceNum(b.cholesterol, parseLabNumber(labs, /cholesterol|ldl|hdl|lipid/i)) ?? 200;

  const bmi =
    coalesceNum(b.bmi, computeBmi(v.weightKg, v.heightCm)) ?? 25;

  const bloodSugar =
    coalesceNum(
      b.bloodSugar,
      parseLabNumber(labs, /glucose|sugar|hba1c/i)
    ) ?? 92;

  const physicalActivity = b.physicalActivity ?? 'moderate';
  const dietType = b.dietType ?? 'mixed';
  const familyHistory = Array.isArray(b.familyHistory) ? b.familyHistory : [];

  const sex =
    patient.gender === 'female' ? 'female' : patient.gender === 'male' ? 'male' : undefined;

  return {
    age,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    cholesterol,
    bmi,
    bloodSugar,
    smoker: Boolean(b.smoker),
    hasDiabetes: Boolean(b.hasDiabetes),
    hasHypertension: Boolean(b.hasHypertension),
    physicalActivity,
    dietType,
    familyHistory,
    sex,
  };
}

function coalesceNum(...vals) {
  for (const v of vals) {
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Map engine disease labels to knowledge graph disease node ids */
const DISEASE_LABEL_TO_KG = {
  'Cardiovascular Disease': 'heart_disease',
  'Type 2 Diabetes': 'diabetes_t2',
  Hypertension: 'hypertension',
};

/**
 * @param {{ diseases: { name: string, probability: number }[] }} riskAssessment
 * @param {number} [minProb]
 */
function deriveKgDiseaseIds(riskAssessment, minProb = 0.08) {
  if (!riskAssessment || !Array.isArray(riskAssessment.diseases)) return [];
  return riskAssessment.diseases
    .filter((d) => d.probability >= minProb)
    .map((d) => DISEASE_LABEL_TO_KG[d.name])
    .filter(Boolean);
}

/**
 * @param {ReturnType<buildHealthData>} healthData
 */
function deriveKgRiskFactorIds(healthData) {
  const ids = [];
  if (healthData.bmi >= 30) ids.push('obesity');
  if (healthData.smoker) ids.push('smoking');
  if (healthData.cholesterol >= 200) ids.push('high_cholesterol');
  if (/sedentary|low|none|minimal/i.test(String(healthData.physicalActivity || ''))) {
    ids.push('sedentary');
  }
  return ids;
}

module.exports = {
  calculateRiskScore,
  buildHealthData,
  deriveKgDiseaseIds,
  deriveKgRiskFactorIds,
  DISEASE_LABEL_TO_KG,
};
