const express = require('express');
const { authRequired } = require('../middleware/auth');
const { analyzeMedicalReport } = require('../services/geminiService');
const { isGroqConfigured } = require('../services/offlineHealthNarrative');

const router = express.Router();

/**
 * POST /api/analyzer/report
 * Body: { reportText: string }
 * Returns: structured health analysis JSON
 */
router.post('/report', authRequired, async (req, res, next) => {
  try {
    const { reportText } = req.body || {};

    if (!reportText || typeof reportText !== 'string' || reportText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'reportText is required (minimum 10 characters)',
      });
    }

    if (!isGroqConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          'AI analysis is not configured. Please add GROQ_API_KEY to your .env file and restart the server.',
        offline: true,
      });
    }

    const analysis = await analyzeMedicalReport(reportText.trim());

    res.json({
      success: true,
      analysis,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
