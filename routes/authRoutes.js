const express = require('express');
const bcrypt = require('bcryptjs');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body || {};
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'email, password, and fullName are required',
      });
    }

    const emailNorm = String(email).toLowerCase().trim();

    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const existingPatient = await Patient.findOne({ email: emailNorm });
    if (existingPatient) {
      const linkedUser = await User.findOne({ patientId: existingPatient._id });
      if (linkedUser) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      await Patient.findByIdAndDelete(existingPatient._id);
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    let patient;
    try {
      patient = await Patient.create({
        fullName: String(fullName).trim(),
        email: emailNorm,
      });
    } catch (e) {
      if (e.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'This email is already registered. Try signing in.',
        });
      }
      throw e;
    }

    let user;
    try {
      user = await User.create({
        email: patient.email,
        fullName: patient.fullName,
        passwordHash,
        patientId: patient._id,
      });
    } catch (e) {
      await Patient.findByIdAndDelete(patient._id);
      if (e.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'This email is already registered. Try signing in.',
        });
      }
      throw e;
    }

    let token;
    try {
      token = signToken({
        userId: String(user._id),
        patientId: String(patient._id),
        email: user.email,
      });
    } catch (jwtErr) {
      await User.findByIdAndDelete(user._id);
      await Patient.findByIdAndDelete(patient._id);
      return res.status(503).json({
        success: false,
        message:
          'Server is missing JWT_SECRET. Add JWT_SECRET to your .env file (see .env.example), then restart the API.',
      });
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        patientId: patient._id,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password required' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let token;
    try {
      token = signToken({
        userId: String(user._id),
        patientId: String(user.patientId),
        email: user.email,
      });
    } catch {
      return res.status(503).json({
        success: false,
        message:
          'Server is missing JWT_SECRET. Add JWT_SECRET to your .env file, then restart the API.',
      });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        patientId: user.patientId,
      },
    });
  } catch (e) {
    next(e);
  }
});

/** Placeholder — wire Google Identity Services token verification in production */
router.post('/google', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Google OAuth is not configured on this server. Use email/password or set GOOGLE_CLIENT_ID.',
  });
});

module.exports = router;
