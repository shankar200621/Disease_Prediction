import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePrediction } from '../context/PredictionContext';
import { predictionsApi } from '../api/client';

/** Restore latest prediction from API after login / refresh so dashboard & KG stay in sync. */
export default function PredictionHydrate() {
  const { isAuthenticated, ready } = useAuth();
  const { setLastRun } = usePrediction();
  const ran = useRef(false);

  useEffect(() => {
    if (!ready || !isAuthenticated) {
      ran.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await predictionsApi.latestMe();
        if (cancelled) return;
        setLastRun({
          success: true,
          prediction: res.prediction,
          knowledgeGraph: res.knowledgeGraph,
          recommendations: res.recommendations,
          explanation: res.explanation,
          geminiError: res.geminiError,
          aiAssist: res.aiAssist,
        });
        ran.current = true;
      } catch (e) {
        if (e.status === 404) return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, isAuthenticated, setLastRun]);

  return null;
}
