const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    healthRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthRecord' },
    predictedConditions: [
      {
        label: { type: String, required: true },
        icdCode: { type: String, trim: true },
        probability: { type: Number, min: 0, max: 1 },
        severityHint: { type: String, enum: ['low', 'moderate', 'high', 'unknown'], default: 'unknown' },
      },
    ],
    topPrediction: { type: String, trim: true },
    confidence: { type: Number, min: 0, max: 1 },
    modelVersion: { type: String, default: '1.0.0' },
    inputSummary: { type: String },
    rawModelResponse: { type: mongoose.Schema.Types.Mixed },
    aiExplanation: { type: String },
    geminiError: { type: String },
    /** gemini = Google model; offline = template narrative when no API key */
    aiAssist: { type: String, enum: ['gemini', 'offline'] },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
