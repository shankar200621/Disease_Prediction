const request = require('supertest');
const { createApp } = require('../app');

describe('GET /health', () => {
  it('returns ok and service name', async () => {
    const app = createApp();
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toEqual({
      ok: true,
      service: 'healthpredict-ai-kg-disease-predictor',
    });
  });
});
