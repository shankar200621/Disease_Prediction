const express = require('express');
const Recommendation = require('../models/Recommendation');

const router = express.Router();

const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

function sortRecommendationsByPriority(items) {
  return [...items].sort((a, b) => {
    const pa = PRIORITY_RANK[String(a.priority || '').toLowerCase()] ?? 9;
    const pb = PRIORITY_RANK[String(b.priority || '').toLowerCase()] ?? 9;
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

router.get('/', async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patient: patientId } : {};
    const items = await Recommendation.find(filter)
      .populate('patient', 'fullName email')
      .populate('prediction')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: sortRecommendationsByPriority(items) });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const rec = await Recommendation.findById(req.params.id).populate('patient').populate('prediction');
    if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found' });
    res.json({ success: true, data: rec });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const rec = await Recommendation.create(req.body);
    res.status(201).json({ success: true, data: rec });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const rec = await Recommendation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found' });
    res.json({ success: true, data: rec });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const rec = await Recommendation.findByIdAndDelete(req.params.id);
    if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found' });
    res.json({ success: true, message: 'Recommendation removed' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
