import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { graphsApi } from '../api/client';
import { usePrediction } from '../context/PredictionContext';
import AmbientBackground from '../components/AmbientBackground';
import GlassCard from '../components/GlassCard';

const TYPE_COLORS = {
  disease: '#6366f1',
  risk_factor: '#22d3ee',
  symptom: '#a78bfa',
  drug: '#34d399',
  other: '#94a3b8',
};

function useGraphDraw(graph, selected, canvasRef, positionsRef) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graph?.nodes?.length) return;
    const ctx = canvas.getContext('2d');
    const cssW = canvas.clientWidth || 800;
    const cssH = canvas.clientHeight || 520;
    canvas.width = cssW;
    canvas.height = cssH;

    const positions = {};
    const n = graph.nodes.length;
    graph.nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const rad = Math.min(cssW, cssH) * (n > 8 ? 0.28 : 0.32);
      positions[node.id] = {
        x: cssW / 2 + Math.cos(angle) * rad,
        y: cssH / 2 + Math.sin(angle) * rad,
        node,
      };
    });
    positionsRef.current = positions;

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.lineWidth = 1;

    (graph.edges || []).forEach((e) => {
      const a = positions[e.source];
      const b = positions[e.target];
      if (!a || !b) return;
      const w = typeof e.weight === 'number' ? e.weight : 0.5;
      ctx.strokeStyle = `rgba(99,102,241,${0.2 + w * 0.5})`;
      ctx.lineWidth = 1 + w * 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    Object.values(positions).forEach(({ x, y, node }) => {
      const color = TYPE_COLORS[node.type] || TYPE_COLORS.other;
      const isSel = selected?.id === node.id;
      const r = isSel ? 15 : 11;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label?.slice(0, 18) || node.id, x, y + r + 14);
    });
  }, [graph, selected, canvasRef, positionsRef]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw, canvasRef]);
}

export default function KnowledgeGraph() {
  const canvasRef = useRef(null);
  const positionsRef = useRef({});
  const { lastRun } = usePrediction();

  const [mode, setMode] = useState('full');
  const [fullGraph, setFullGraph] = useState(null);
  const [selected, setSelected] = useState(null);
  const [err, setErr] = useState('');

  const patientGraph = lastRun?.knowledgeGraph;

  const activeGraph = useMemo(() => {
    if (mode === 'patient') {
      if (!patientGraph?.nodes?.length) return null;
      return {
        name: 'Your relevance subgraph',
        nodes: patientGraph.nodes,
        edges: patientGraph.edges,
        seedIds: patientGraph.seedIds,
      };
    }
    return fullGraph;
  }, [mode, patientGraph, fullGraph]);

  const loadFull = useCallback(async () => {
    try {
      const res = await graphsApi.clinicalFull();
      setFullGraph(res.data);
    } catch (e) {
      setErr(e.message || 'Failed to load graph');
    }
  }, []);

  useEffect(() => {
    loadFull();
  }, [loadFull]);

  useGraphDraw(activeGraph, selected, canvasRef, positionsRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onClick = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      let hit = null;
      Object.values(positionsRef.current).forEach((p) => {
        const d = Math.hypot(mx - p.x, my - p.y);
        if (d < 22) hit = p.node;
      });
      setSelected(hit);
    };
    canvas.addEventListener('click', onClick);
    return () => canvas.removeEventListener('click', onClick);
  }, [activeGraph]);

  const relatedEdges = useMemo(() => {
    if (!selected || !activeGraph?.edges) return [];
    return activeGraph.edges.filter((e) => e.source === selected.id || e.target === selected.id);
  }, [selected, activeGraph]);

  return (
    <>
      <AmbientBackground />
      <div className="page-shell flex min-h-screen flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] bg-navy-950/40 px-6 py-4 backdrop-blur-md">
          <div>
            <h1 className="font-display text-lg font-semibold text-white">Healthcare knowledge graph</h1>
            <p className="text-xs text-slate-500">
              Disease · risk · symptom · drug relationships — explore full ontology or your last run subgraph
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('full');
                  setSelected(null);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  mode === 'full' ? 'bg-accent-indigo/40 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Full clinical graph
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('patient');
                  setSelected(null);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  mode === 'patient' ? 'bg-accent-cyan/30 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                My subgraph
              </button>
            </div>
            <Link to="/dashboard" className="btn-ghost-accent px-4 py-2 text-sm">
              Dashboard
            </Link>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          {err && mode === 'full' && (
            <div className="absolute left-6 top-6 z-20 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-200">
              {err}
            </div>
          )}

          <div className="relative min-h-[50vh] flex-1 lg:min-h-0">
            {mode === 'patient' && !patientGraph?.nodes?.length ? (
              <div className="flex h-[min(70vh,560px)] items-center justify-center px-6 text-center text-slate-400 lg:h-full">
                <div>
                  <p className="mb-4 text-sm">No patient subgraph yet.</p>
                  <Link to="/assessment" className="text-accent-cyan hover:underline">
                    Run a health assessment
                  </Link>
                  <span className="text-slate-500"> to generate a 1-hop relevance graph.</span>
                </div>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="h-[min(70vh,560px)] w-full cursor-crosshair bg-transparent lg:h-full"
              />
            )}
          </div>

          <aside className="w-full shrink-0 border-t border-white/10 bg-navy-950/90 p-4 backdrop-blur-xl lg:w-[22rem] lg:border-l lg:border-t-0">
            <h2 className="mb-3 text-sm font-semibold text-white">Legend</h2>
            <ul className="mb-6 space-y-2 text-xs">
              {Object.entries(TYPE_COLORS).map(([k, c]) => (
                <li key={k} className="flex items-center gap-2 text-slate-300">
                  <span className="h-3 w-3 rounded-full" style={{ background: c }} />
                  {k.replace('_', ' ')}
                </li>
              ))}
            </ul>

            {mode === 'patient' && patientGraph?.seedIds?.length > 0 && (
              <p className="mb-4 text-xs text-slate-500">
                Seeds: <span className="text-accent-cyan">{patientGraph.seedIds.join(', ')}</span>
              </p>
            )}

            {selected ? (
              <GlassCard className="!p-4">
                <p className="text-xs uppercase text-accent-cyan">{selected.type}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{selected.label}</h3>
                <p className="mt-2 text-xs text-slate-400">ID: {selected.id}</p>
                {relatedEdges.length > 0 && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <p className="mb-2 text-xs font-medium text-slate-400">Connected edges</p>
                    <ul className="max-h-32 space-y-1 overflow-y-auto text-[10px] text-slate-500">
                      {relatedEdges.map((e, i) => (
                        <li key={i}>
                          {e.source} → {e.target}{' '}
                          <span className="text-accent-indigo">({e.relation})</span>{' '}
                          {e.weight != null && <span className="text-slate-600">w={e.weight}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.metadata && (
                  <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-black/30 p-2 text-[10px] text-slate-400">
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                )}
              </GlassCard>
            ) : (
              <p className="text-sm text-slate-500">Click a node to inspect relationships.</p>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
