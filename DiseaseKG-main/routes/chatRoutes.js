const express = require('express');
const Patient = require('../models/Patient');
const { authRequired } = require('../middleware/auth');
const { chatDoctorMessage } = require('../services/geminiService');
const { isGroqConfigured, buildOfflineChatReply } = require('../services/offlineHealthNarrative');

const router = express.Router();

router.post('/doctor', authRequired, async (req, res, next) => {
  try {
    const { messages, includePatientProfile, predictionSummary } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages array required' });
    }

    let patientContext = null;
    if (includePatientProfile && req.user.patientId) {
      const p = await Patient.findById(req.user.patientId).lean();
      if (p) {
        patientContext = {
          fullName: p.fullName,
          chronicConditions: p.chronicConditions,
          allergies: p.allergies,
        };
      }
    }

    let reply;
    let aiAssist = 'groq';
    if (!isGroqConfigured()) {
      reply = buildOfflineChatReply({ messages, patientContext, predictionSummary });
      aiAssist = 'offline';
    } else {
      reply = await chatDoctorMessage({ messages, patientContext, predictionSummary });
    }
    res.json({ success: true, role: 'assistant', content: reply, aiAssist });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
