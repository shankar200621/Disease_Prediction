const { calculateRiskScore, buildHealthData, deriveKgRiskFactorIds } = require('../services/riskEngine');

describe('riskEngine', () => {
  it('calculateRiskScore returns riskScore, riskLevel, diseases', () => {
    const out = calculateRiskScore(
      {
        age: 50,
        bloodPressureSystolic: 135,
        bloodPressureDiastolic: 85,
        cholesterol: 220,
        bmi: 28,
        bloodSugar: 95,
        smoker: false,
        hasDiabetes: false,
        hasHypertension: false,
        physicalActivity: 'moderate',
        dietType: 'mixed',
        familyHistory: [],
      },
      { sex: 'male' }
    );

    expect(typeof out.riskScore).toBe('number');
    expect(out.riskScore).toBeGreaterThanOrEqual(0);
    expect(out.riskScore).toBeLessThanOrEqual(100);
    expect(['low', 'moderate', 'high', 'critical']).toContain(out.riskLevel);
    expect(Array.isArray(out.diseases)).toBe(true);
    expect(out.diseases.length).toBe(3);
    expect(out.diseases[0]).toHaveProperty('name');
    expect(out.diseases[0]).toHaveProperty('probability');
    expect(out.diseases[0]).toHaveProperty('stage');
  });

  it('deriveKgRiskFactorIds picks obesity and smoking', () => {
    const ids = deriveKgRiskFactorIds({
      bmi: 32,
      smoker: true,
      cholesterol: 180,
      physicalActivity: 'sedentary',
    });
    expect(ids).toContain('obesity');
    expect(ids).toContain('smoking');
    expect(ids).toContain('sedentary');
  });

  it('buildHealthData merges patient, record, and body', () => {
    const patient = {
      gender: 'male',
      dateOfBirth: new Date('1980-01-15'),
    };
    const healthRecord = {
      vitals: { bloodPressureSystolic: 120, weightKg: 80, heightCm: 180 },
      labResults: [{ testName: 'Total cholesterol', value: '200', unit: 'mg/dL' }],
    };
    const body = { smoker: true, hasHypertension: false };
    const h = buildHealthData({ patient, healthRecord, body });
    expect(h.smoker).toBe(true);
    expect(h.bloodPressureSystolic).toBe(120);
  });
});
