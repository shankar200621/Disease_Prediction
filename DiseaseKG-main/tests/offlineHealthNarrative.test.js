const {
  isGeminiConfigured,
  buildOfflineExplanation,
  buildOfflineRecommendations,
  buildOfflineChatReply,
} = require('../services/offlineHealthNarrative');

describe('offlineHealthNarrative', () => {
  const OLD = process.env.GEMINI_API_KEY;

  afterEach(() => {
    process.env.GEMINI_API_KEY = OLD;
  });

  it('isGeminiConfigured is false when key missing', () => {
    delete process.env.GEMINI_API_KEY;
    expect(isGeminiConfigured()).toBe(false);
  });

  it('isGeminiConfigured is false for placeholder key', () => {
    process.env.GEMINI_API_KEY = 'your_gemini_api_key_here';
    expect(isGeminiConfigured()).toBe(false);
  });

  it('buildOfflineExplanation mentions score and level', () => {
    const s = buildOfflineExplanation({ riskScore: 34, riskLevel: 'Moderate', diseases: [] });
    expect(s).toMatch(/34/);
    expect(s).toMatch(/Moderate/i);
  });

  it('buildOfflineRecommendations returns at least 3 items', () => {
    const recs = buildOfflineRecommendations(
      { riskScore: 40, riskLevel: 'moderate', diseases: [{ name: 'Hypertension', probability: 0.5 }] },
      {}
    );
    expect(recs.length).toBeGreaterThanOrEqual(3);
    expect(recs[0]).toHaveProperty('title');
    expect(recs[0]).toHaveProperty('evidence');
  });

  it('buildOfflineChatReply returns a string', () => {
    const r = buildOfflineChatReply({
      messages: [{ role: 'user', content: 'Hello' }],
      predictionSummary: { riskScore: 30 },
    });
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(20);
  });
});
