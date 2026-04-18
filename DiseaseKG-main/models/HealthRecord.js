const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    recordedAt: { type: Date, default: Date.now },
    symptoms: [{ type: String, trim: true }],
    vitals: {
      bloodPressureSystolic: Number,
      bloodPressureDiastolic: Number,
      heartRate: Number,
      temperatureC: Number,
      respiratoryRate: Number,
      spo2: Number,
      weightKg: Number,
      heightCm: Number,
    },
    labResults: [
      {
        testName: String,
        value: String,
        unit: String,
        referenceRange: String,
        flag: { type: String, enum: ['normal', 'high', 'low', 'critical', 'unknown'], default: 'unknown' },
      },
    ],
    notes: { type: String },
    source: { type: String, enum: ['manual', 'import', 'device', 'clinic'], default: 'manual' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
