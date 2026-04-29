/**
 * When GROQ_API_KEY is not set, produce safe, deterministic copy from rule-based outputs
 * so the dashboard and chat stay useful without calling Groq.
 */

function isGroqConfigured() {
  const k = process.env.GROQ_API_KEY;
  return Boolean(k && String(k).trim() && k !== 'your_groq_api_key_here');
}

// Legacy alias so any lingering code still compiles
const isGeminiConfigured = isGroqConfigured;

/**
 * @param {{
 *   riskScore?: number,
 *   riskLevel?: string,
 *   diseases?: { name?: string, probability?: number, stage?: string }[],
 * }} ctx
 */
function buildOfflineExplanation(ctx) {
  const score = Math.round(Number(ctx?.riskScore) || 0);
  const level = String(ctx?.riskLevel || 'moderate');
  const diseases = Array.isArray(ctx?.diseases) ? ctx.diseases : [];
  const top = diseases
    .slice()
    .sort((a, b) => (Number(b?.probability) || 0) - (Number(a?.probability) || 0))[0];
  const topName = top?.name ? String(top.name) : 'your tracked conditions';
  const stage = top?.stage ? ` (${String(top.stage).replace(/_/g, ' ')})` : '';

  return (
    `Your composite risk score is ${score} out of 100, labeled "${level}" from the inputs you provided. ` +
    `The strongest signal in this run is ${topName}${stage}. ` +
    `These estimates are educational and rule-based — they are not a diagnosis. ` +
    `Share this screen with a clinician to interpret what it means for you.`
  );
}

/**
 * @param {*} ctx - same shape as groq prediction context
 * @param {{ fullName?: string } | null} patient
 * @returns {Array<{ category, title, description, priority, evidence }>}
 */
function buildOfflineRecommendations(ctx, patient) {
  const diseases = Array.isArray(ctx?.diseases) ? ctx.diseases : [];
  const names = diseases.map((d) => String(d?.name || '').toLowerCase());
  const level = String(ctx?.riskLevel || '').toLowerCase();
  const high = level.includes('high') || level.includes('severe') || (Number(ctx?.riskScore) || 0) >= 55;

  const recs = [];

  recs.push({
    category: 'follow_up',
    title: 'Review results with a clinician',
    description:
      'Bring this risk summary to your next appointment so your doctor can place it in context with your history and exams.',
    priority: high ? 'high' : 'medium',
    evidence: 'Risk scores are guides; clinical judgment is required for decisions.',
  });

  if (names.some((n) => n.includes('hypertension') || n.includes('blood pressure'))) {
    recs.push({
      category: 'lifestyle',
      title: 'Blood pressure friendly habits',
      description:
        'Limit excess salt, prioritize sleep, and discuss home BP monitoring with your care team if recommended.',
      priority: 'high',
      evidence: 'Hypertension appeared in your modeled risk profile.',
    });
  }

  if (names.some((n) => n.includes('diabetes') || n.includes('glucose'))) {
    recs.push({
      category: 'screening',
      title: 'Metabolic follow-up',
      description:
        'Ask your clinician whether repeat glucose or A1c testing is appropriate and how diet and activity fit your plan.',
      priority: 'medium',
      evidence: 'Diabetes-related risk was estimated in this assessment.',
    });
  }

  if (names.some((n) => n.includes('cardiovascular') || n.includes('heart'))) {
    recs.push({
      category: 'education',
      title: 'Heart health basics',
      description:
        'Regular movement, not smoking, and managing cholesterol and BP are core pillars — align changes with your clinician.',
      priority: high ? 'high' : 'medium',
      evidence: 'Cardiovascular risk was highlighted in your results.',
    });
  }

  recs.push({
    category: 'lifestyle',
    title: 'Sustainable activity',
    description:
      'Even moderate activity most days can support weight, mood, and blood pressure — start at a level you can sustain.',
    priority: 'medium',
    evidence: 'General preventive guidance for cardiometabolic health.',
  });

  recs.push({
    category: 'urgent_care',
    title: 'When to seek urgent care',
    description:
      'If you develop chest pain, stroke-like symptoms, or severe trouble breathing, call emergency services immediately.',
    priority: 'critical',
    evidence: 'Standard safety guidance for all users.',
  });

  const uniq = [];
  const seen = new Set();
  for (const r of recs) {
    const k = r.title;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(r);
    if (uniq.length >= 8) break;
  }

  return uniq.slice(0, Math.max(3, Math.min(uniq.length, 8)));
}

/**
 * @param {{ messages?: { role: string, content: string }[], patientContext?: object, predictionSummary?: object }}
 */
function buildOfflineChatReply({ messages, predictionSummary }) {
  const last = [...(messages || [])].reverse().find((m) => m && m.role === 'user');
  const q = String(last?.content || '').toLowerCase();
  let scoreLine = '';
  if (predictionSummary && predictionSummary.riskScore != null) {
    scoreLine = ` Your latest in-app composite risk score is about ${Math.round(Number(predictionSummary.riskScore))}. Open the Dashboard for the full breakdown.`;
  }

  if (/chest pain|heart attack|stroke|can't breathe|cannot breathe|suicid/i.test(q)) {
    return (
      'If you might be having an emergency (chest pain, stroke symptoms, severe breathing problems, or thoughts of self-harm), ' +
      'contact local emergency services right away. I am running without the live AI engine, so I cannot assess urgency for you.'
    );
  }

  if (/risk score|what does my risk|explain my score/i.test(q)) {
    return (
      'Without the Groq API key, I cannot generate a fresh AI explanation. Your scores on the Dashboard are from the rule-based engine and are still valid.' +
      scoreLine +
      ' Add GROQ_API_KEY to the server .env and restart to enable full Dr. Ada replies.'
    );
  }

  return (
    "I'm Dr. Ada in offline mode: the server doesn't have GROQ_API_KEY set, so I'm not connected to the AI model." +
    scoreLine +
    ' For personal medical questions, please talk to a licensed clinician. To enable AI chat, add GROQ_API_KEY next to index.js and restart the API.'
  );
}

module.exports = {
  isGroqConfigured,
  isGeminiConfigured, // legacy alias
  buildOfflineExplanation,
  buildOfflineRecommendations,
  buildOfflineChatReply,
};
