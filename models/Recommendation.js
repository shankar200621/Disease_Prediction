const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    prediction: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' },
    type: {
      type: String,
      enum: ['lifestyle', 'follow_up', 'screening', 'medication_discussion', 'urgent_care', 'education', 'other'],
      default: 'other',
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    rationale: { type: String },
    validUntil: { type: Date },
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
