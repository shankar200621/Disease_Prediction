const KnowledgeGraph = require('../models/KnowledgeGraph');

const KG_NAME = 'clinical_base_kg';

/**
 * Canonical node ids for the seeded clinical knowledge graph.
 * Categories: disease, risk_factor, symptom, drug
 */
const BASE_NODES = [
  { id: 'heart_disease', label: 'Heart disease', type: 'disease', metadata: { category: 'cardiovascular' } },
  { id: 'diabetes_t2', label: 'Type 2 diabetes', type: 'disease', metadata: { category: 'metabolic' } },
  { id: 'hypertension', label: 'Hypertension', type: 'disease', metadata: { category: 'cardiovascular' } },
  { id: 'obesity', label: 'Obesity', type: 'risk_factor', metadata: { category: 'metabolic' } },
  { id: 'smoking', label: 'Smoking', type: 'risk_factor', metadata: { category: 'behavioral' } },
  { id: 'high_cholesterol', label: 'High cholesterol', type: 'risk_factor', metadata: { category: 'metabolic' } },
  { id: 'sedentary', label: 'Sedentary lifestyle', type: 'risk_factor', metadata: { category: 'behavioral' } },
  { id: 'chest_pain', label: 'Chest pain', type: 'symptom', metadata: {} },
  { id: 'fatigue', label: 'Fatigue', type: 'symptom', metadata: {} },
  { id: 'shortness_breath', label: 'Shortness of breath', type: 'symptom', metadata: {} },
  { id: 'metformin', label: 'Metformin', type: 'drug', metadata: { class: 'biguanide' } },
  { id: 'statins', label: 'Statins', type: 'drug', metadata: { class: 'lipid_lowering' } },
];

const BASE_EDGES = [
  { source: 'obesity', target: 'diabetes_t2', relation: 'increases_risk', weight: 0.85 },
  { source: 'obesity', target: 'hypertension', relation: 'increases_risk', weight: 0.75 },
  { source: 'obesity', target: 'heart_disease', relation: 'increases_risk', weight: 0.7 },
  { source: 'smoking', target: 'heart_disease', relation: 'increases_risk', weight: 0.9 },
  { source: 'smoking', target: 'hypertension', relation: 'increases_risk', weight: 0.55 },
  { source: 'high_cholesterol', target: 'heart_disease', relation: 'increases_risk', weight: 0.88 },
  { source: 'high_cholesterol', target: 'hypertension', relation: 'associated_with', weight: 0.5 },
  { source: 'sedentary', target: 'diabetes_t2', relation: 'increases_risk', weight: 0.65 },
  { source: 'sedentary', target: 'obesity', relation: 'contributes_to', weight: 0.7 },
  { source: 'sedentary', target: 'heart_disease', relation: 'increases_risk', weight: 0.5 },
  { source: 'chest_pain', target: 'heart_disease', relation: 'associated_with', weight: 0.6 },
  { source: 'fatigue', target: 'diabetes_t2', relation: 'associated_with', weight: 0.45 },
  { source: 'fatigue', target: 'heart_disease', relation: 'associated_with', weight: 0.4 },
  { source: 'shortness_breath', target: 'heart_disease', relation: 'associated_with', weight: 0.55 },
  { source: 'shortness_breath', target: 'hypertension', relation: 'associated_with', weight: 0.35 },
  { source: 'metformin', target: 'diabetes_t2', relation: 'treats', weight: 0.92 },
  { source: 'statins', target: 'heart_disease', relation: 'reduces_risk', weight: 0.8 },
  { source: 'statins', target: 'high_cholesterol', relation: 'treats', weight: 0.95 },
  { source: 'diabetes_t2', target: 'heart_disease', relation: 'increases_risk', weight: 0.75 },
  { source: 'hypertension', target: 'heart_disease', relation: 'increases_risk', weight: 0.82 },
];

function normalizeIds(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
}

/**
 * Inserts the canonical knowledge graph document if none exists for {@link KG_NAME}.
 * @returns {Promise<{ seeded: boolean, graph?: import('mongoose').Document }>}
 */
async function seedKG() {
  let doc = await KnowledgeGraph.findOne({ name: KG_NAME });
  if (doc) {
    return { seeded: false, graph: doc };
  }

  doc = await KnowledgeGraph.create({
    name: KG_NAME,
    description: 'Base clinical knowledge graph: diseases, risk factors, symptoms, drugs',
    version: '1.0.0',
    nodes: BASE_NODES,
    edges: BASE_EDGES,
    isPublished: true,
  });

  return { seeded: true, graph: doc };
}


/**
 * Returns all nodes and edges from the canonical graph document.
 * @returns {Promise<{ name: string, version: string, nodes: object[], edges: object[] } | null>}
 */
async function getFullGraph() {
  const g = await KnowledgeGraph.findOne({ name: KG_NAME }).lean();
  if (!g) {
    return null;
  }

  return {
    name: g.name,
    version: g.version,
    nodes: g.nodes || [],
    edges: g.edges || [],
  };
}

/**
 * Returns a 1-hop subgraph: seed nodes (matched diseases + risk factors) and every node
 * directly connected by an edge, plus all edges with both endpoints in that node set.
 *
 * @param {string[]} diseases - Node ids (e.g. heart_disease, diabetes_t2)
 * @param {string[]} riskFactors - Node ids (e.g. obesity, smoking)
 * @returns {Promise<{ seedIds: string[], nodes: object[], edges: object[] } | null>}
 */
async function getPatientSubgraph(diseases, riskFactors) {
  const full = await getFullGraph();
  if (!full) return null;

  const nodeById = new Map(full.nodes.map((n) => [n.id, n]));
  const seedIds = new Set([...normalizeIds(diseases), ...normalizeIds(riskFactors)].filter((id) => nodeById.has(id)));

  const neighborIds = new Set(seedIds);
  for (const e of full.edges) {
    if (seedIds.has(e.source) || seedIds.has(e.target)) {
      neighborIds.add(e.source);
      neighborIds.add(e.target);
    }
  }

  const allowed = neighborIds;
  const nodes = full.nodes.filter((n) => allowed.has(n.id));
  const edges = full.edges.filter((e) => allowed.has(e.source) && allowed.has(e.target));

  return {
    seedIds: [...seedIds],
    nodes,
    edges,
  };
}

module.exports = {
  KG_NAME,
  BASE_NODES,
  BASE_EDGES,
  seedKG,
  getFullGraph,
  getPatientSubgraph,
  normalizeIds,
};
