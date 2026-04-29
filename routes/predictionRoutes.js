const express = require('express');
const Prediction = require('../models/Prediction');
const Recommendation = require('../models/Recommendation');
const predictionController = require('../controllers/predictionController');
const { authRequired, ensurePatientMatch } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/patient/:patientId',
  authRequired,
  ensurePatientMatch,
  predictionController.runPrediction
);

router.get('/latest/me', authRequired, async (req, res, next) => {
  try {
    const pred = await Prediction.findOne({ patient: req.user.patientId })
      .sort({ createdAt: -1 })
      .lean();
    if (!pred) {
      return res.status(404).json({ success: false, message: 'No predictions yet' });
    }
    const recs = await Recommendation.find({ prediction: pred._id }).sort({ createdAt: 1 }).lean();
    res.json({
      success: true,
      prediction: pred,
      knowledgeGraph: pred.rawModelResponse?.knowledgeGraph || null,
      recommendations: recs,
      explanation: pred.aiExplanation || null,
      geminiError: pred.geminiError || null,
      aiAssist: pred.aiAssist || null,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patient: patientId } : {};
    const predictions = await Prediction.find(filter)
      .populate('patient', 'fullName email')
      .populate('healthRecord')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: predictions });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id)
      .populate('patient')
      .populate('healthRecord');
    if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
    res.json({ success: true, data: prediction });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const prediction = await Prediction.create(req.body);
    res.status(201).json({ success: true, data: prediction });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const prediction = await Prediction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
    res.json({ success: true, data: prediction });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const prediction = await Prediction.findByIdAndDelete(req.params.id);
    if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
    res.json({ success: true, message: 'Prediction removed' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
