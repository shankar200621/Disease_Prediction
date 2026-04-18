/**
 * “Background Studio” layer: aurora orbs, grain, soft grid — fixed behind content.
 */
export default function AmbientBackground({ intensity = 'normal' }) {
  const orbOpacity = intensity === 'subtle' ? 'opacity-25' : 'opacity-40';
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-mesh" />

      <div
        className={`absolute -left-[20%] -top-[10%] h-[min(50rem,90vw)] w-[min(50rem,90vw)] rounded-full bg-indigo-600/40 blur-[100px] ${orbOpacity} animate-aurora`}
      />
      <div
        className={`absolute -right-[15%] top-[20%] h-[min(42rem,80vw)] w-[min(42rem,80vw)] rounded-full bg-cyan-500/35 blur-[90px] ${orbOpacity} animate-aurora-slow`}
      />
      <div
        className={`absolute bottom-[-20%] left-[30%] h-[min(36rem,70vw)] w-[min(36rem,70vw)] rounded-full bg-violet-600/30 blur-[100px] ${orbOpacity} animate-aurora`}
        style={{ animationDelay: '-5s' }}
      />

      <div className="noise-overlay" />
      <div className="grid-overlay" />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/20 to-navy-950" />
    </div>
  );
}
