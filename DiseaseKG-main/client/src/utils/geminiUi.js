const MISSING_KEY_RE = /GEMINI_API_KEY is missing|not configured in environment/i;

export function isGeminiKeyMissing(geminiError) {
  return Boolean(geminiError && MISSING_KEY_RE.test(String(geminiError)));
}

/** One short line for banners; avoids repeating the same text twice (Explanation + Recommendations). */
export function formatGeminiErrorForUi(geminiError) {
  if (!geminiError) return '';
  const s = String(geminiError);
  if (MISSING_KEY_RE.test(s)) {
    return 'The API server does not have GEMINI_API_KEY set. Add it to the `.env` file next to `index.js`, restart the server, then run a new assessment.';
  }
  const parts = s.split(/\s*·\s*/).map((p) => p.trim());
  const stripped = parts.map((p) =>
    p.replace(/^Explanation:\s*/i, '').replace(/^Recommendations:\s*/i, '')
  );
  return [...new Set(stripped)].join(' · ');
}

export function isPlaceholderExplanation(text) {
  return Boolean(text && /Personalized AI text could not be loaded|check GEMINI_API_KEY/i.test(String(text)));
}
