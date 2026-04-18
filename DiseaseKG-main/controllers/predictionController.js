const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const HealthRecord = require('../models/HealthRecord');
const Prediction = require('../models/Prediction');
const Recommendation = require('../models/Recommendation');
const {
  calculateRiskScore,
  buildHealthData,
  deriveKgDiseaseIds,
  deriveKgRiskFactorIds,
  DISEASE_LABEL_TO_KG,
} = require('../services/riskEngine');
const { seedKG, getPatientSubgraph } = require('../services/knowledgeGraphService');
const { generateRecommendations, explainPrediction } = require('../services/geminiService');
const {
  isGroqConfigured,
  buildOfflineExplanation,
  buildOfflineRecommendations,
} = require('../services/offlineHealthNarrative');

function mapStageToSeverityHint(stage) {
  const s = String(stage || '').toLowerCase();
  if (/high|crisis|stage_2|diagnosed|hyperglycemia/.test(s)) return 'high';
  if (/moderate|elevated|stage_1|prediabetes|intermediate|borderline/.test(s)) return 'moderate';
  if (/low|normal|lower/.test(s)) return 'low';
  return 'unknown';
}

function mapCategoryToType(category) {
  const c = String(category || 'other').toLowerCase().trim();
  const allowed = [
    'lifestyle',
    'follow_up',
    'screening',
    'medication_discussion',
    'urgent_care',
    'education',
    'other',
  ];
  return allowed.includes(c) ? c : 'other';
}

async function runPrediction(req, res, next) {
  try {
    const { patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({ success: false, message: 'Invalid patientId' });
    }

    const patient = await Patient.findById(patientId).lean();
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const {
      symptoms,
      vitals,
      labResults,
      notes,
      source,
      recordedAt,
      ...riskExtras
    } = req.body && typeof req.body === 'object' ? req.body : {};

    const healthRecord = await HealthRecord.create({
      patient: patientId,
      symptoms: symptoms || [],
      vitals: vitals || {},
      labResults: labResults || [],
      notes,
      source: source || 'manual',
      recordedAt: recordedAt ? new Date(recordedAt) : undefined,
    });

    const healthData = buildHealthData({
      patient,
      healthRecord: healthRecord.toObject ? healthRecord.toObject() : healthRecord,
      body: { ...riskExtras, symptoms, vitals, labResults, notes, source, recordedAt },
    });

    const sexOpt =
      healthData.sex === 'female' ? { sex: 'female' } : healthData.sex === 'male' ? { sex: 'male' } : {};
    const { sex: _omit, ...riskInput } = healthData;
    const riskAssessment = calculateRiskScore(riskInput, sexOpt);

    await seedKG();
    let diseases = deriveKgDiseaseIds(riskAssessment);
    const riskFactors = deriveKgRiskFactorIds(healthData);
    if (diseases.length === 0) {
      const top = riskAssessment.diseases.reduce((a, b) => (a.probability >= b.probability ? a : b));
      const fallback = DISEASE_LABEL_TO_KG[top.name];
      if (fallback) diseases = [fallback];
    }

    const knowledgeGraph = await getPatientSubgraph(diseases, riskFactors);

    const topDisease = riskAssessment.diseases.reduce((a, b) => (a.probability >= b.probability ? a : b));

    const predictionDoc = await Prediction.create({
      patient: patientId,
      healthRecord: healthRecord._id,
      predictedConditions: riskAssessment.diseases.map((d) => ({
        label: d.name,
        probability: d.probability,
        severityHint: mapStageToSeverityHint(d.stage),
      })),
      topPrediction: topDisease.name,
      confidence: Math.min(1, Math.max(0, riskAssessment.riskScore / 100)),
      modelVersion: '1.0.0-clinical-rules',
      inputSummary: `riskScore=${riskAssessment.riskScore};riskLevel=${riskAssessment.riskLevel}`,
      rawModelResponse: {
        riskAssessment,
        knowledgeGraph,
      },
      status: 'completed',
    });

    const patientPayload = {
      _id: patient._id,
      fullName: patient.fullName,
      email: patient.email,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      chronicConditions: patient.chronicConditions,
    };

    const predictionPayload = predictionDoc.toObject
      ? predictionDoc.toObject()
      : predictionDoc;

    const geminiPredictionContext = {
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      diseases: riskAssessment.diseases,
      featureImportance: riskAssessment.featureImportance,
      progressionTimeline: riskAssessment.progressionTimeline,
      predictionId: predictionDoc._id,
    };

    let recommendationsRaw = [];
    let explanation =
      'Your rule-based risk assessment is ready. Personalized AI text could not be loaded — check GEMINI_API_KEY on the server.';
    const geminiParts = [];
    let aiAssist = 'groq';

    if (isGroqConfigured()) {
      try {
        explanation = await explainPrediction(geminiPredictionContext);
      } catch (e) {
        geminiParts.push(`Explanation: ${e.message || 'Groq request failed'}`);
      }

      try {
        recommendationsRaw = await generateRecommendations(patientPayload, geminiPredictionContext);
      } catch (e) {
        geminiParts.push(`Recommendations: ${e.message || 'Groq request failed'}`);
      }
    } else {
      aiAssist = 'offline';
      explanation = buildOfflineExplanation(geminiPredictionContext);
      recommendationsRaw = buildOfflineRecommendations(geminiPredictionContext, patientPayload);
    }

    const geminiError = geminiParts.length ? geminiParts.join(' · ') : null;

    let recommendationDocs = [];
    if (recommendationsRaw.length > 0) {
      recommendationDocs = await Recommendation.insertMany(
        recommendationsRaw.map((r) => ({
          patient: patientId,
          prediction: predictionDoc._id,
          type: mapCategoryToType(r.category),
          title: r.title,
          description: r.description,
          priority: ['low', 'medium', 'high', 'critical'].includes(String(r.priority).toLowerCase())
            ? String(r.priority).toLowerCase()
            : 'medium',
          rationale: r.evidence,
        }))
      );
    }

    await Prediction.findByIdAndUpdate(predictionDoc._id, {
      aiExplanation: explanation,
      geminiError: geminiError || undefined,
      aiAssist,
    });

    predictionPayload.aiExplanation = explanation;
    predictionPayload.geminiError = geminiError || undefined;
    predictionPayload.aiAssist = aiAssist;

    await Patient.findByIdAndUpdate(patientId, {
      $push: {
        healthRecordIds: healthRecord._id,
        predictionIds: predictionDoc._id,
      },
    });

    return res.status(201).json({
      success: true,
      prediction: predictionPayload,
      knowledgeGraph,
      recommendations: recommendationDocs,
      explanation,
      geminiError: geminiError || undefined,
      aiAssist,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  runPrediction,
};
