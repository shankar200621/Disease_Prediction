const Groq = require('groq-sdk');

const MODEL_NAME = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function requireApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is missing or not configured in environment');
  }
  return key;
}

function getClient() {
  return new Groq({ apiKey: requireApiKey() });
}

async function groqChat(messages, { jsonMode = false } = {}) {
  const client = getClient();
  const params = {
    model: MODEL_NAME,
    messages,
    temperature: 0.3,
    max_tokens: 2048,
  };
  if (jsonMode) params.response_format = { type: 'json_object' };
  const completion = await client.chat.completions.create(params);
  const text = completion.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('Empty response from Groq. Check API quota and GROQ_API_KEY.');
  return text.trim();
}

function cleanJsonResponse(raw) {
  if (raw == null) return '';
  let s = String(raw).trim();

  const fencedFull = s.match(/^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/i);
  const fencedInline = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedFull) {
    s = fencedFull[1].trim();
  } else if (fencedInline) {
    s = fencedInline[1].trim();
  } else {
    s = s.replace(/^```(?:json)?\s*/i, '');
    s = s.replace(/\s*```\s*$/i, '');
    s = s.trim();
  }

  const start = s.indexOf('[');
  const end = s.lastIndexOf(']');
  if (start !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }

  return s.trim();
}

/**
 * Variant that extracts a JSON object {} instead of array.
 * Used by analyzeMedicalReport.
 */
function cleanJsonObjectResponse(raw) {
  if (raw == null) return '';
  let s = String(raw).trim();

  const fencedFull = s.match(/^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/i);
  const fencedInline = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedFull) {
    s = fencedFull[1].trim();
  } else if (fencedInline) {
    s = fencedInline[1].trim();
  } else {
    s = s.replace(/^```(?:json)?\s*/i, '');
    s = s.replace(/\s*```\s*$/i, '');
    s = s.trim();
  }

  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }

  return s.trim();
}

async function generateRecommendations(patientData, prediction) {
  const patientJson = JSON.stringify(patientData ?? {}, null, 2);
  const predictionJson = JSON.stringify(prediction ?? {}, null, 2);

  const systemMsg = `You are a supportive clinical education assistant for healthcare providers and patients.`;
  const userMsg = `Use the patient context and prediction summary below.

Patient data (JSON):
${patientJson}

Prediction / risk assessment (JSON):
${predictionJson}

Respond with ONLY a valid JSON array (no markdown, no commentary) containing between 3 and 8 recommendation objects.
Each object MUST have these string fields:
- "category": one of: lifestyle, follow_up, screening, medication_discussion, urgent_care, education
- "title": short headline (max 80 characters)
- "description": 1-3 sentences, actionable and non-alarming
- "priority": one of: low, medium, high, critical
- "evidence": brief note on why this applies

Output format example (structure only):
[{"category":"lifestyle","title":"...","description":"...","priority":"medium","evidence":"..."}]

Return the JSON array now:`;

  const text = await groqChat([
    { role: 'system', content: systemMsg },
    { role: 'user', content: userMsg },
  ]);

  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();

  let parsed;
  try {
    const arrStart = cleaned.indexOf('[');
    const arrEnd = cleaned.lastIndexOf(']');
    const jsonStr = arrStart !== -1 && arrEnd > arrStart ? cleaned.slice(arrStart, arrEnd + 1) : cleaned;
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    const err = new Error(`Failed to parse recommendations JSON: ${e.message}`);
    err.cause = e;
    err.rawSnippet = cleaned.slice(0, 500);
    throw err;
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Groq response was not a JSON array');
  }

  if (parsed.length < 3) {
    throw new Error(`Expected at least 3 recommendations, got ${parsed.length}`);
  }

  const trimmed = parsed.slice(0, 8);

  const required = ['category', 'title', 'description', 'priority', 'evidence'];
  return trimmed.map((item, i) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Recommendation at index ${i} is not an object`);
    }
    for (const k of required) {
      if (item[k] == null || String(item[k]).trim() === '') {
        throw new Error(`Recommendation at index ${i} missing or empty field: ${k}`);
      }
    }
    return {
      category: String(item.category).trim(),
      title: String(item.title).trim(),
      description: String(item.description).trim(),
      priority: String(item.priority).trim(),
      evidence: String(item.evidence).trim(),
    };
  });
}

async function explainPrediction(prediction) {
  const predictionJson = JSON.stringify(prediction ?? {}, null, 2);

  const text = await groqChat([
    {
      role: 'system',
      content: 'You help patients understand health risk scores in simple, calm language.',
    },
    {
      role: 'user',
      content: `Prediction data (JSON):
${predictionJson}

Write exactly 2 or 3 short sentences explaining what this risk score means for the patient.
Use everyday words, avoid jargon, and do not diagnose or prescribe.
Do not use markdown, bullet points, or numbered lists — plain sentences only.`,
    },
  ]);

  return String(text).replace(/```[\s\S]*?```/g, '').trim();
}

async function chatDoctorMessage({ messages, patientContext, predictionSummary }) {
  const system = `You are Dr. Ada, an AI physician specialist for HealthPredict AI. You give clear, empathetic, general health education and triage-style guidance. You are not replacing an in-person clinician. Keep replies concise (2–6 sentences). If symptoms suggest emergency (chest pain, stroke signs, severe breathlessness), urge calling local emergency services immediately. Never prescribe specific drugs or doses; suggest discussing options with a licensed clinician.`;

  const pred = predictionSummary
    ? `\nLatest risk snapshot from this app (may be empty):\n${JSON.stringify(predictionSummary, null, 2)}\n`
    : '';

  const ctx = patientContext
    ? `\nContext (de-identified profile):\n${JSON.stringify(patientContext, null, 2)}\n`
    : '';

  const groqMessages = [{ role: 'system', content: system + pred + ctx }];

  (messages || [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .forEach((m) => groqMessages.push({ role: m.role, content: String(m.content).trim() }));

  const text = await groqChat(groqMessages);
  return String(text).replace(/```[\s\S]*?```/g, '').trim();
}

/**
 * Analyze a free-form medical report and return structured JSON analysis.
 * @param {string} reportText - Raw text of medical report
 * @returns {Promise<object>} Structured health analysis JSON
 */
async function analyzeMedicalReport(reportText) {
  const systemPrompt = `You are an advanced medical AI assistant integrated into a HealthPredict AI system.

Your task is to analyze a user's medical report and provide a clear, structured, and easy-to-understand health analysis.

INSTRUCTIONS:
1. Understand & Extract:
   - Identify key health parameters (e.g., blood pressure, sugar levels, cholesterol, BMI, heart rate, etc.)
   - Detect abnormal values and compare them with standard healthy ranges

2. Health Analysis:
   - Explain the current health condition in simple terms (avoid complex medical jargon)
   - Highlight critical issues (if any)

3. Risk Prediction:
   - Predict possible diseases or conditions the user MAY develop in the future if no action is taken
   - Base predictions on patterns (e.g., high sugar → diabetes risk, high LDL → heart disease risk)

4. Preventive Guidance:
   - Suggest actionable steps: Diet improvements, Exercise recommendations, Lifestyle changes
   - Keep it practical and beginner-friendly

5. Severity Level:
   - Classify overall health status as exactly one of: "Healthy", "Moderate Risk", or "High Risk"

6. Output Format (STRICT): Return ONLY valid JSON in this exact structure:
{
  "summary": "Short overall health summary (2-3 sentences)",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "risk_predictions": [
    {
      "condition": "Possible disease name",
      "risk_level": "Low | Medium | High",
      "reason": "Why this risk exists"
    }
  ],
  "recommendations": {
    "diet": ["Tip 1", "Tip 2", "Tip 3"],
    "exercise": ["Tip 1", "Tip 2"],
    "lifestyle": ["Tip 1", "Tip 2"]
  },
  "severity": "Healthy | Moderate Risk | High Risk"
}

IMPORTANT RULES:
- Return ONLY the JSON object, no markdown fences, no preamble, no extra text
- Do NOT give an exact medical diagnosis (only prediction & risk analysis)
- Keep explanations simple and user-friendly
- If data is missing, make reasonable assumptions and mention it in key_findings
- Avoid alarming language, be supportive and informative
- Always prioritize user safety`;

  const text = await groqChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Medical Report to Analyze:\n${reportText}\n\nReturn the JSON analysis now:` },
    ],
    { jsonMode: true }
  );

  const cleaned = cleanJsonObjectResponse(text);

  let parsed;
  try {
    parsed = JSON.parse(cleaned || text);
  } catch (e) {
    throw new Error(`Failed to parse medical analysis JSON: ${e.message}. Raw: ${text.slice(0, 300)}`);
  }

  const required = ['summary', 'key_findings', 'risk_predictions', 'recommendations', 'severity'];
  for (const k of required) {
    if (parsed[k] == null) {
      throw new Error(`Medical analysis missing required field: ${k}`);
    }
  }

  return parsed;
}

module.exports = {
  MODEL_NAME,
  generateRecommendations,
  explainPrediction,
  chatDoctorMessage,
  analyzeMedicalReport,
  cleanJsonResponse,
  cleanJsonObjectResponse,
};
