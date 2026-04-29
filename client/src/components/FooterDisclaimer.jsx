export default function FooterDisclaimer({ className = '' }) {
  return (
    <footer
      className={`border-t border-[rgba(124,58,237,0.2)] bg-[#fafbff] px-6 py-6 text-center leading-relaxed ${className}`}
    >
      <div className="mx-auto max-w-4xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-xl p-4 shadow-sm">
        <p className="flex items-center justify-center gap-2 font-bold text-[#92400e] mb-1" style={{ fontSize: '14px' }}>
          <span>⚠️</span> Important Medical Disclaimer
        </p>
        <p className="text-[#6b5b95]" style={{ fontSize: '13px' }}>
          HealthPredict AI provides educational risk estimates and a knowledge-graph visualization. It is <strong>not a medical device</strong>, not FDA-cleared, and does not diagnose or treat disease. Always follow advice from your licensed clinician and seek urgent care for emergencies.
        </p>
      </div>
    </footer>
  );
}
