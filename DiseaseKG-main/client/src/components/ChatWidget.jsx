import { useState, useRef, useEffect, useMemo } from 'react';
import { chatApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePrediction } from '../context/PredictionContext';

const QUICK = [
  'What does my risk score mean?',
  'How can I lower blood pressure?',
  'When should I see a doctor?',
  'Explain diabetes risk in simple terms',
];

export default function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const { lastRun } = usePrediction();
  const predictionSummary = useMemo(() => {
    if (!lastRun?.prediction) return null;
    const ra = lastRun.prediction.rawModelResponse?.riskAssessment;
    if (!ra) return null;
    return {
      riskScore: ra.riskScore,
      riskLevel: ra.riskLevel,
      diseases: ra.diseases,
      explanation: lastRun.explanation,
    };
  }, [lastRun]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi — I'm Dr. Ada, your AI specialist. Ask me anything about your health journey, risk scores, or lifestyle tips. This is educational only and not a substitute for in-person care.",
    },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  if (!isAuthenticated) return null;

  const send = async (text) => {
    const t = String(text || input).trim();
    if (!t || loading) return;
    setInput('');
    const nextUser = { role: 'user', content: t };
    const thread = [...messages, nextUser];
    setMessages(thread);
    setLoading(true);
    try {
      const payload = {
        messages: thread.map(({ role, content }) => ({ role, content })),
        includePatientProfile: true,
        predictionSummary: predictionSummary || undefined,
      };
      const res = await chatApi.doctor(payload);
      setMessages((m) => [...m, { role: 'assistant', content: res.content }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            e.message ||
            'Unable to reach the AI doctor. Check GEMINI_API_KEY on the server and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo to-accent-cyan text-white shadow-lg shadow-accent-indigo/40 transition hover:scale-105"
        aria-label="Open AI doctor chat"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Dr. Ada — AI Specialist</p>
              <p className="text-xs text-slate-400">Connected to HealthPredict AI engine</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[min(60vh,420px)] space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-accent-indigo/90 text-white'
                      : 'bg-white/10 text-slate-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-accent-cyan/80">Dr. Ada is typing…</div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-white/10 px-3 py-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2 py-1 text-xs text-accent-cyan hover:bg-accent-cyan/20"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Dr. Ada…"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent-indigo focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-accent-indigo to-accent-cyan px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
