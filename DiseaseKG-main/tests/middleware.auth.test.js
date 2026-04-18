const jwt = require('jsonwebtoken');
const { signToken, authRequired } = require('../middleware/auth');

describe('middleware/auth', () => {
  const OLD = process.env.JWT_SECRET;
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-jest-only';
  });
  afterAll(() => {
    process.env.JWT_SECRET = OLD;
  });

  it('signToken produces verifiable payload', () => {
    const token = signToken({ userId: 'u1', patientId: 'p1', email: 'a@b.com' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.patientId).toBe('p1');
  });

  it('authRequired rejects missing bearer', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authRequired(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('authRequired returns 503 when JWT_SECRET is unset', () => {
    const prev = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    const req = { headers: { authorization: 'Bearer fake' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authRequired(req, res, next);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(next).not.toHaveBeenCalled();
    process.env.JWT_SECRET = prev;
  });
});
