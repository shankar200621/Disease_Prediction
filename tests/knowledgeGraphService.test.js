const { normalizeIds, BASE_NODES, BASE_EDGES } = require('../services/knowledgeGraphService');

describe('knowledgeGraphService', () => {
  it('normalizeIds trims and lowercases', () => {
    expect(normalizeIds([' Heart_Disease ', 'DIABETES_T2'])).toEqual(['heart_disease', 'diabetes_t2']);
  });

  it('BASE_NODES includes required disease and risk ids', () => {
    const ids = BASE_NODES.map((n) => n.id);
    expect(ids).toContain('heart_disease');
    expect(ids).toContain('diabetes_t2');
    expect(ids).toContain('hypertension');
    expect(ids).toContain('obesity');
    expect(ids).toContain('metformin');
  });

  it('BASE_EDGES have source, target, relation, weight', () => {
    expect(BASE_EDGES.length).toBeGreaterThan(0);
    BASE_EDGES.forEach((e) => {
      expect(e.source).toBeTruthy();
      expect(e.target).toBeTruthy();
      expect(e.relation).toBeTruthy();
      expect(typeof e.weight).toBe('number');
    });
  });
});
