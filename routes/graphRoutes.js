const express = require('express');
const KnowledgeGraph = require('../models/KnowledgeGraph');
const { seedKG, getFullGraph } = require('../services/knowledgeGraphService');

const router = express.Router();

router.get('/clinical/full', async (req, res, next) => {
  try {
    await seedKG();
    const graph = await getFullGraph();
    if (!graph) {
      return res.status(404).json({ success: false, message: 'Clinical graph not seeded' });
    }
    res.json({ success: true, data: graph });
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const graphs = await KnowledgeGraph.find().sort({ updatedAt: -1 });
    res.json({ success: true, data: graphs });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const graph = await KnowledgeGraph.findById(req.params.id);
    if (!graph) return res.status(404).json({ success: false, message: 'Knowledge graph not found' });
    res.json({ success: true, data: graph });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const graph = await KnowledgeGraph.create(req.body);
    res.status(201).json({ success: true, data: graph });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const graph = await KnowledgeGraph.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!graph) return res.status(404).json({ success: false, message: 'Knowledge graph not found' });
    res.json({ success: true, data: graph });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const graph = await KnowledgeGraph.findByIdAndDelete(req.params.id);
    if (!graph) return res.status(404).json({ success: false, message: 'Knowledge graph not found' });
    res.json({ success: true, message: 'Knowledge graph removed' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
