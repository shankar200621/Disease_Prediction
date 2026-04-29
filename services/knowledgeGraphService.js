const KnowledgeGraph = require('../models/KnowledgeGraph');

const KG_NAME = 'clinical_base_kg_v2';

/**
 * Canonical node ids for the seeded clinical knowledge graph.
 * Categories: disease, risk_factor, symptom, drug
 */
const BASE_NODES = [
  // Diseases
  { id: 'heart_disease', label: 'Heart disease', type: 'disease', metadata: { category: 'cardiovascular' } },
  { id: 'diabetes_t2', label: 'Type 2 diabetes', type: 'disease', metadata: { category: 'metabolic' } },
  { id: 'hypertension', label: 'Hypertension', type: 'disease', metadata: { category: 'cardiovascular' } },
  { id: 'stroke', label: 'Stroke', type: 'disease', metadata: { category: 'cardiovascular' } },
  { id: 'kidney_disease', label: 'Chronic kidney disease', type: 'disease', metadata: { category: 'renal' } },
  { id: 'copd', label: 'COPD', type: 'disease', metadata: { category: 'respiratory' } },
  { id: 'asthma', label: 'Asthma', type: 'disease', metadata: { category: 'respiratory' } },
  { id: 'depression', label: 'Depression', type: 'disease', metadata: { category: 'mental' } },
  { id: 'anxiety', label: 'Anxiety disorder', type: 'disease', metadata: { category: 'mental' } },
  { id: 'osteoarthritis', label: 'Osteoarthritis', type: 'disease', metadata: { category: 'musculoskeletal' } },
  { id: 'alzheimer', label: 'Alzheimer\'s', type: 'disease', metadata: { category: 'neurological' } },
  { id: 'cancer_lung', label: 'Lung cancer', type: 'disease', metadata: { category: 'oncology' } },
  { id: 'liver_disease', label: 'Liver disease', type: 'disease', metadata: { category: 'hepatic' } },

  // Risk Factors
  { id: 'obesity', label: 'Obesity', type: 'risk_factor', metadata: { category: 'metabolic' } },
  { id: 'smoking', label: 'Smoking', type: 'risk_factor', metadata: { category: 'behavioral' } },
  { id: 'high_cholesterol', label: 'High cholesterol', type: 'risk_factor', metadata: { category: 'metabolic' } },
  { id: 'sedentary', label: 'Sedentary lifestyle', type: 'risk_factor', metadata: { category: 'behavioral' } },
  { id: 'alcohol', label: 'Alcohol abuse', type: 'risk_factor', metadata: { category: 'behavioral' } },
  { id: 'stress', label: 'Chronic stress', type: 'risk_factor', metadata: { category: 'psychological' } },
  { id: 'poor_diet', label: 'Poor diet', type: 'risk_factor', metadata: { category: 'nutritional' } },
  { id: 'family_history', label: 'Family history', type: 'risk_factor', metadata: { category: 'genetic' } },
  { id: 'age', label: 'Advanced age', type: 'risk_factor', metadata: { category: 'demographic' } },
  { id: 'air_pollution', label: 'Air pollution', type: 'risk_factor', metadata: { category: 'environmental' } },

  // Symptoms
  { id: 'chest_pain', label: 'Chest pain', type: 'symptom', metadata: {} },
  { id: 'fatigue', label: 'Fatigue', type: 'symptom', metadata: {} },
  { id: 'shortness_breath', label: 'Shortness of breath', type: 'symptom', metadata: {} },
  { id: 'headache', label: 'Headache', type: 'symptom', metadata: {} },
  { id: 'dizziness', label: 'Dizziness', type: 'symptom', metadata: {} },
  { id: 'nausea', label: 'Nausea', type: 'symptom', metadata: {} },
  { id: 'insomnia', label: 'Insomnia', type: 'symptom', metadata: {} },
  { id: 'palpitations', label: 'Heart palpitations', type: 'symptom', metadata: {} },
  { id: 'cough', label: 'Chronic cough', type: 'symptom', metadata: {} },
  { id: 'wheezing', label: 'Wheezing', type: 'symptom', metadata: {} },
  { id: 'joint_pain', label: 'Joint pain', type: 'symptom', metadata: {} },
  { id: 'memory_loss', label: 'Memory loss', type: 'symptom', metadata: {} },
  { id: 'confusion', label: 'Confusion', type: 'symptom', metadata: {} },

  // Drugs
  { id: 'metformin', label: 'Metformin', type: 'drug', metadata: { class: 'biguanide' } },
  { id: 'statins', label: 'Statins', type: 'drug', metadata: { class: 'lipid_lowering' } },
  { id: 'ace_inhibitors', label: 'ACE inhibitors', type: 'drug', metadata: { class: 'antihypertensive' } },
  { id: 'beta_blockers', label: 'Beta blockers', type: 'drug', metadata: { class: 'antihypertensive' } },
  { id: 'aspirin', label: 'Aspirin', type: 'drug', metadata: { class: 'antiplatelet' } },
  { id: 'insulin', label: 'Insulin', type: 'drug', metadata: { class: 'hormone' } },
  { id: 'inhalers', label: 'Inhalers', type: 'drug', metadata: { class: 'bronchodilator' } },
  { id: 'antidepressants', label: 'Antidepressants', type: 'drug', metadata: { class: 'psychiatric' } },
  { id: 'nsaids', label: 'NSAIDs', type: 'drug', metadata: { class: 'analgesic' } },
];

const BASE_EDGES = [
  // Obesity connections
  { source: 'obesity', target: 'diabetes_t2', relation: 'increases_risk', weight: 0.85 },
  { source: 'obesity', target: 'hypertension', relation: 'increases_risk', weight: 0.75 },
  { source: 'obesity', target: 'heart_disease', relation: 'increases_risk', weight: 0.7 },
  { source: 'obesity', target: 'stroke', relation: 'increases_risk', weight: 0.65 },
  { source: 'obesity', target: 'kidney_disease', relation: 'increases_risk', weight: 0.6 },
  { source: 'obesity', target: 'osteoarthritis', relation: 'increases_risk', weight: 0.8 },

  // Smoking connections
  { source: 'smoking', target: 'heart_disease', relation: 'increases_risk', weight: 0.9 },
  { source: 'smoking', target: 'hypertension', relation: 'increases_risk', weight: 0.55 },
  { source: 'smoking', target: 'copd', relation: 'causes', weight: 0.95 },
  { source: 'smoking', target: 'cancer_lung', relation: 'causes', weight: 0.92 },
  { source: 'smoking', target: 'stroke', relation: 'increases_risk', weight: 0.7 },

  // High cholesterol connections
  { source: 'high_cholesterol', target: 'heart_disease', relation: 'increases_risk', weight: 0.88 },
  { source: 'high_cholesterol', target: 'hypertension', relation: 'associated_with', weight: 0.5 },
  { source: 'high_cholesterol', target: 'stroke', relation: 'increases_risk', weight: 0.75 },

  // Sedentary connections
  { source: 'sedentary', target: 'diabetes_t2', relation: 'increases_risk', weight: 0.65 },
  { source: 'sedentary', target: 'obesity', relation: 'contributes_to', weight: 0.7 },
  { source: 'sedentary', target: 'heart_disease', relation: 'increases_risk', weight: 0.5 },
  { source: 'sedentary', target: 'hypertension', relation: 'increases_risk', weight: 0.45 },
  { source: 'sedentary', target: 'osteoarthritis', relation: 'worsens', weight: 0.6 },

  // Alcohol connections
  { source: 'alcohol', target: 'hypertension', relation: 'increases_risk', weight: 0.5 },
  { source: 'alcohol', target: 'liver_disease', relation: 'causes', weight: 0.9 },
  { source: 'alcohol', target: 'depression', relation: 'associated_with', weight: 0.4 },

  // Stress connections
  { source: 'stress', target: 'hypertension', relation: 'increases_risk', weight: 0.55 },
  { source: 'stress', target: 'heart_disease', relation: 'increases_risk', weight: 0.45 },
  { source: 'stress', target: 'depression', relation: 'causes', weight: 0.7 },
  { source: 'stress', target: 'anxiety', relation: 'causes', weight: 0.75 },
  { source: 'stress', target: 'insomnia', relation: 'causes', weight: 0.65 },

  // Poor diet connections
  { source: 'poor_diet', target: 'obesity', relation: 'contributes_to', weight: 0.8 },
  { source: 'poor_diet', target: 'diabetes_t2', relation: 'increases_risk', weight: 0.7 },
  { source: 'poor_diet', target: 'heart_disease', relation: 'increases_risk', weight: 0.55 },
  { source: 'poor_diet', target: 'high_cholesterol', relation: 'causes', weight: 0.75 },

  // Age connections
  { source: 'age', target: 'heart_disease', relation: 'increases_risk', weight: 0.6 },
  { source: 'age', target: 'hypertension', relation: 'increases_risk', weight: 0.55 },
  { source: 'age', target: 'stroke', relation: 'increases_risk', weight: 0.7 },
  { source: 'age', target: 'alzheimer', relation: 'increases_risk', weight: 0.85 },
  { source: 'age', target: 'osteoarthritis', relation: 'increases_risk', weight: 0.75 },

  // Air pollution connections
  { source: 'air_pollution', target: 'asthma', relation: 'triggers', weight: 0.8 },
  { source: 'air_pollution', target: 'copd', relation: 'worsens', weight: 0.7 },
  { source: 'air_pollution', target: 'cancer_lung', relation: 'increases_risk', weight: 0.6 },
  { source: 'air_pollution', target: 'heart_disease', relation: 'increases_risk', weight: 0.45 },

  // Symptom connections to diseases
  { source: 'chest_pain', target: 'heart_disease', relation: 'associated_with', weight: 0.6 },
  { source: 'chest_pain', target: 'stroke', relation: 'associated_with', weight: 0.4 },
  { source: 'fatigue', target: 'diabetes_t2', relation: 'associated_with', weight: 0.45 },
  { source: 'fatigue', target: 'heart_disease', relation: 'associated_with', weight: 0.4 },
  { source: 'fatigue', target: 'depression', relation: 'associated_with', weight: 0.5 },
  { source: 'shortness_breath', target: 'heart_disease', relation: 'associated_with', weight: 0.55 },
  { source: 'shortness_breath', target: 'hypertension', relation: 'associated_with', weight: 0.35 },
  { source: 'shortness_breath', target: 'copd', relation: 'associated_with', weight: 0.8 },
  { source: 'shortness_breath', target: 'asthma', relation: 'associated_with', weight: 0.75 },
  { source: 'headache', target: 'hypertension', relation: 'associated_with', weight: 0.4 },
  { source: 'dizziness', target: 'hypertension', relation: 'associated_with', weight: 0.35 },
  { source: 'dizziness', target: 'stroke', relation: 'associated_with', weight: 0.5 },
  { source: 'nausea', target: 'kidney_disease', relation: 'associated_with', weight: 0.3 },
  { source: 'palpitations', target: 'heart_disease', relation: 'associated_with', weight: 0.55 },
  { source: 'cough', target: 'copd', relation: 'associated_with', weight: 0.85 },
  { source: 'cough', target: 'asthma', relation: 'associated_with', weight: 0.8 },
  { source: 'wheezing', target: 'asthma', relation: 'associated_with', weight: 0.9 },
  { source: 'wheezing', target: 'copd', relation: 'associated_with', weight: 0.75 },
  { source: 'joint_pain', target: 'osteoarthritis', relation: 'associated_with', weight: 0.8 },
  { source: 'memory_loss', target: 'alzheimer', relation: 'associated_with', weight: 0.85 },
  { source: 'confusion', target: 'stroke', relation: 'associated_with', weight: 0.5 },
  { source: 'confusion', target: 'alzheimer', relation: 'associated_with', weight: 0.75 },

  // Drug treatments
  { source: 'metformin', target: 'diabetes_t2', relation: 'treats', weight: 0.92 },
  { source: 'statins', target: 'heart_disease', relation: 'reduces_risk', weight: 0.8 },
  { source: 'statins', target: 'high_cholesterol', relation: 'treats', weight: 0.95 },
  { source: 'ace_inhibitors', target: 'hypertension', relation: 'treats', weight: 0.9 },
  { source: 'ace_inhibitors', target: 'kidney_disease', relation: 'protects', weight: 0.7 },
  { source: 'beta_blockers', target: 'heart_disease', relation: 'treats', weight: 0.85 },
  { source: 'beta_blockers', target: 'hypertension', relation: 'treats', weight: 0.88 },
  { source: 'aspirin', target: 'heart_disease', relation: 'prevents', weight: 0.75 },
  { source: 'aspirin', target: 'stroke', relation: 'prevents', weight: 0.7 },
  { source: 'insulin', target: 'diabetes_t2', relation: 'treats', weight: 0.95 },
  { source: 'inhalers', target: 'asthma', relation: 'treats', weight: 0.9 },
  { source: 'inhalers', target: 'copd', relation: 'treats', weight: 0.85 },
  { source: 'antidepressants', target: 'depression', relation: 'treats', weight: 0.88 },
  { source: 'antidepressants', target: 'anxiety', relation: 'treats', weight: 0.75 },
  { source: 'nsaids', target: 'osteoarthritis', relation: 'treats', weight: 0.8 },
  { source: 'nsaids', target: 'joint_pain', relation: 'relieves', weight: 0.85 },

  // Disease-disease relationships
  { source: 'diabetes_t2', target: 'heart_disease', relation: 'increases_risk', weight: 0.75 },
  { source: 'diabetes_t2', target: 'kidney_disease', relation: 'increases_risk', weight: 0.7 },
  { source: 'diabetes_t2', target: 'stroke', relation: 'increases_risk', weight: 0.6 },
  { source: 'hypertension', target: 'heart_disease', relation: 'increases_risk', weight: 0.82 },
  { source: 'hypertension', target: 'stroke', relation: 'increases_risk', weight: 0.8 },
  { source: 'hypertension', target: 'kidney_disease', relation: 'increases_risk', weight: 0.75 },
  { source: 'heart_disease', target: 'stroke', relation: 'increases_risk', weight: 0.65 },
  { source: 'depression', target: 'anxiety', relation: 'associated_with', weight: 0.7 },
  { source: 'depression', target: 'diabetes_t2', relation: 'associated_with', weight: 0.45 },
  { source: 'depression', target: 'heart_disease', relation: 'increases_risk', weight: 0.5 },
  { source: 'copd', target: 'heart_disease', relation: 'increases_risk', weight: 0.55 },
  { source: 'asthma', target: 'copd', relation: 'increases_risk', weight: 0.4 },
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
    version: '2.0.0',
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
