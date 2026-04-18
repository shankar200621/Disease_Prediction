const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({
      success: false,
      message:
        'Server is missing JWT_SECRET. Add JWT_SECRET to .env (see .env.example) and restart the API.',
    });
  }
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const token = h.slice(7);
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function ensurePatientMatch(req, res, next) {
  const uid = req.params.patientId;
  if (!uid || String(req.user.patientId) !== String(uid)) {
    return res.status(403).json({ success: false, message: 'Patient access denied' });
  }
  next();
}

module.exports = { authRequired, signToken, ensurePatientMatch };
