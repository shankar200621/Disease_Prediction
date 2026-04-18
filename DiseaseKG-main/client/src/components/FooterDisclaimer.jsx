export default function FooterDisclaimer({ className = '' }) {
  return (
    <footer
      className={`border-t border-white/10 bg-navy-950/50 px-6 py-8 text-center text-xs leading-relaxed text-slate-500 ${className}`}
    >
      <p className="mx-auto max-w-3xl">
        <strong className="text-slate-400">Medical disclaimer:</strong> HealthPredict AI provides educational risk
        estimates and a knowledge-graph visualization. It is not a medical device, not FDA-cleared, and does not
        diagnose or treat disease. Always follow advice from your licensed clinician and seek urgent care for
        emergencies.
      </p>
    </footer>
  );
}
