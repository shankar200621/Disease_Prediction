const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
    bloodGroup: { type: String, trim: true },
    address: {
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    allergies: [{ type: String, trim: true }],
    chronicConditions: [{ type: String, trim: true }],
    healthRecordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HealthRecord' }],
    predictionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
