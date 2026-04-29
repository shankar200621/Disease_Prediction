const mongoose = require('mongoose');

const knowledgeGraphSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    version: { type: String, default: '1.0.0' },
    nodes: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        type: {
          type: String,
          enum: ['symptom', 'disease', 'drug', 'lab', 'body_system', 'risk_factor', 'other'],
          default: 'other',
        },
        metadata: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    edges: [
      {
        source: { type: String, required: true },
        target: { type: String, required: true },
        relation: { type: String, required: true },
        weight: { type: Number, min: 0, max: 1 },
        metadata: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('KnowledgeGraph', knowledgeGraphSchema);
