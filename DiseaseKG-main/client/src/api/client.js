const BASE = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('hp_token');
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const ct = res.headers.get('content-type') || '';
  let data = {};
  if (ct.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = {};
    }
  }
  if (!res.ok) {
    const msg =
      data.message ||
      data.error ||
      (res.status === 502 || res.status === 504
        ? 'API server unreachable. Start the Express API and check the dev proxy port matches PORT in .env.'
        : `Request failed (${res.status})`);
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function setToken(token) {
  if (token) localStorage.setItem('hp_token', token);
  else localStorage.removeItem('hp_token');
}

export function getToken() {
  return localStorage.getItem('hp_token');
}

export const authApi = {
  register: (body) => api('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
};

export const predictionsApi = {
  run: (patientId, body) =>
    api(`/api/predictions/patient/${patientId}`, { method: 'POST', body: JSON.stringify(body) }),
  latestMe: () => api('/api/predictions/latest/me'),
};

export const graphsApi = {
  clinicalFull: () => api('/api/graphs/clinical/full'),
};

export const chatApi = {
  doctor: (body) => api('/api/chat/doctor', { method: 'POST', body: JSON.stringify(body) }),
};

export const analyzerApi = {
  analyzeReport: (reportText) =>
    api('/api/analyzer/report', { method: 'POST', body: JSON.stringify({ reportText }) }),
};

