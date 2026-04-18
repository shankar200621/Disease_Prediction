const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    fullName: { type: String, trim: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    googleId: { type: String, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
