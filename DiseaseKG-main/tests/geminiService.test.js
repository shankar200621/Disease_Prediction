const { cleanJsonResponse } = require('../services/geminiService');

describe('geminiService.cleanJsonResponse', () => {
  it('strips markdown json fences', () => {
    const raw = '```json\n[{"a":1}]\n```';
    expect(cleanJsonResponse(raw)).toBe('[{"a":1}]');
  });

  it('extracts array from surrounding text', () => {
    const raw = 'Here you go:\n[{"x":"y"}]\nThanks';
    expect(cleanJsonResponse(raw)).toBe('[{"x":"y"}]');
  });
});
