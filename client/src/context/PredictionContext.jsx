import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const PredictionContext = createContext(null);

export function PredictionProvider({ children }) {
  const [lastRun, setLastRun] = useState(() => {
    try {
      const raw = localStorage.getItem('hp_prediction');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (lastRun) localStorage.setItem('hp_prediction', JSON.stringify(lastRun));
    else localStorage.removeItem('hp_prediction');
  }, [lastRun]);

  const value = useMemo(
    () => ({
      lastRun,
      setLastRun,
      clear: () => setLastRun(null),
    }),
    [lastRun]
  );

  return <PredictionContext.Provider value={value}>{children}</PredictionContext.Provider>;
}

export function usePrediction() {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error('usePrediction outside PredictionProvider');
  return ctx;
}
