import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { graphsApi } from '../api/client';
import { usePrediction } from '../context/PredictionContext';

/* ── color strings for canvas ── */
const NODE_COLORS = {
  disease:     '#ef4444',
  risk_factor: '#f59e0b',
  symptom:     '#8b5cf6',
  drug:        '#10b981',
  other:       '#64748b',
};

const LEGEND = [
  { type: 'disease',     label: 'Disease',     color: '#ef4444' },
  { type: 'risk_factor', label: 'Risk Factor',  color: '#f59e0b' },
  { type: 'symptom',     label: 'Symptom',      color: '#8b5cf6' },
  { type: 'drug',        label: 'Drug',         color: '#10b981' },
];

/* ── force-directed layout ── */
function forceLayout(nodes, edges, w, h, iterations = 120) {
  const pos = {};
  const vel = {};
  const ids = new Set(nodes.map(n => n.id));
  nodes.forEach((n, i) => {
    const a = (2 * Math.PI * i) / nodes.length;
    const r = Math.min(w, h) * 0.34;
    pos[n.id] = { x: w / 2 + Math.cos(a) * r + (Math.random() - 0.5) * 20, y: h / 2 + Math.sin(a) * r + (Math.random() - 0.5) * 20, node: n };
    vel[n.id] = { x: 0, y: 0 };
  });
  for (let it = 0; it < iterations; it++) {
    nodes.forEach(a => nodes.forEach(b => {
      if (a.id === b.id) return;
      const dx = pos[a.id].x - pos[b.id].x, dy = pos[a.id].y - pos[b.id].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = 7000 / (d * d);
      vel[a.id].x += (dx / d) * f;
      vel[a.id].y += (dy / d) * f;
    }));
    edges.forEach(e => {
      if (!ids.has(e.source) || !ids.has(e.target)) return;
      const dx = pos[e.target].x - pos[e.source].x, dy = pos[e.target].y - pos[e.source].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - 100) * (e.weight || 0.5) * 0.03;
      vel[e.source].x += (dx / d) * f; vel[e.source].y += (dy / d) * f;
      vel[e.target].x -= (dx / d) * f; vel[e.target].y -= (dy / d) * f;
    });
    nodes.forEach(n => {
      vel[n.id].x += (w / 2 - pos[n.id].x) * 0.004;
      vel[n.id].y += (h / 2 - pos[n.id].y) * 0.004;
      pos[n.id].x += vel[n.id].x * 0.08;
      pos[n.id].y += vel[n.id].y * 0.08;
      vel[n.id].x *= 0.85; vel[n.id].y *= 0.85;
      pos[n.id].x = Math.max(60, Math.min(w - 60, pos[n.id].x));
      pos[n.id].y = Math.max(60, Math.min(h - 60, pos[n.id].y));
    });
  }
  return pos;
}

/* ── scoped CSS ── */
const CSS = `
.kg-page{position:relative;min-height:100vh;background:linear-gradient(135deg,#0f0a1e 0%,#1a1035 40%,#0d1225 100%);color:#e2e8f0;font-family:'Inter',-apple-system,sans-serif;display:flex;flex-direction:column}
.kg-header{display:flex;align-items:center;justify-content:space-between;padding:16px 28px;border-bottom:1px solid rgba(139,92,246,0.15);background:rgba(15,10,30,0.8);backdrop-filter:blur(12px);flex-wrap:wrap;gap:12px;position:sticky;top:0;z-index:50}
.kg-title{font-size:18px;font-weight:700;background:linear-gradient(120deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.kg-subtitle{font-size:11px;color:#64748b;margin-top:2px}
.kg-controls{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.kg-tab{padding:6px 14px;border-radius:8px;border:1px solid rgba(139,92,246,0.2);background:transparent;color:#94a3b8;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
.kg-tab:hover{background:rgba(139,92,246,0.1);color:#c4b5fd}
.kg-tab.active{background:rgba(139,92,246,0.25);color:#e0d8ff;border-color:rgba(139,92,246,0.4)}
.kg-back{padding:6px 14px;border-radius:8px;border:1px solid rgba(34,211,238,0.2);background:transparent;color:#22d3ee;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;transition:all .2s}
.kg-back:hover{background:rgba(34,211,238,0.1)}
.kg-body{display:flex;flex:1;min-height:0;flex-direction:column}
@media(min-width:900px){.kg-body{flex-direction:row}}
.kg-canvas-wrap{flex:1;position:relative;min-height:55vh}
.kg-canvas-wrap canvas{width:100%;height:100%;display:block;cursor:grab}
.kg-canvas-wrap canvas:active{cursor:grabbing}
.kg-zoom-bar{position:absolute;bottom:16px;right:16px;display:flex;gap:6px}
.kg-zoom-btn{width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.08);color:#fff;font-size:16px;font-weight:700;cursor:pointer;backdrop-filter:blur(8px);transition:all .2s;display:flex;align-items:center;justify-content:center}
.kg-zoom-btn:hover{background:rgba(255,255,255,0.16);transform:scale(1.05)}
.kg-sidebar{width:100%;padding:20px;border-top:1px solid rgba(139,92,246,0.12);background:rgba(10,8,20,0.9);backdrop-filter:blur(12px);overflow-y:auto;max-height:40vh}
@media(min-width:900px){.kg-sidebar{width:300px;border-top:none;border-left:1px solid rgba(139,92,246,0.12);max-height:none}}
.kg-search{width:100%;padding:8px 12px;border-radius:8px;border:1px solid rgba(139,92,246,0.2);background:rgba(255,255,255,0.04);color:#e2e8f0;font-size:12px;outline:none;margin-bottom:14px;transition:border-color .2s}
.kg-search:focus{border-color:#8b5cf6}
.kg-search::placeholder{color:#475569}
.kg-filter-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:18px}
.kg-filter-btn{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:11px;cursor:pointer;transition:all .2s;text-transform:capitalize}
.kg-filter-btn:hover{background:rgba(255,255,255,0.05)}
.kg-filter-btn.on{background:rgba(255,255,255,0.08);color:#e2e8f0}
.kg-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.kg-section-title{font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em}
.kg-legend-list{display:flex;flex-direction:column;gap:6px;margin-bottom:18px}
.kg-legend-item{display:flex;align-items:center;gap:8px;font-size:12px;color:#cbd5e1}
.kg-detail-card{padding:14px;border-radius:12px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.15)}
.kg-detail-type{font-size:10px;text-transform:uppercase;color:#22d3ee;font-weight:700;letter-spacing:.08em}
.kg-detail-label{font-size:16px;font-weight:700;color:#f1f5f9;margin-top:4px}
.kg-detail-id{font-size:11px;color:#64748b;margin-top:4px}
.kg-edge-list{margin-top:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;max-height:140px;overflow-y:auto}
.kg-edge-item{font-size:10px;color:#94a3b8;margin-bottom:3px}
.kg-edge-rel{color:#a78bfa;font-weight:600}
.kg-empty{display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:13px;text-align:center;padding:40px}
.kg-hint{font-size:12px;color:#64748b}
.kg-err{position:absolute;top:16px;left:16px;z-index:20;padding:8px 14px;border-radius:8px;background:rgba(239,68,68,0.15);color:#fca5a5;font-size:12px}
.kg-seeds{font-size:11px;color:#64748b;margin-bottom:12px}
.kg-seeds span{color:#22d3ee}
`;

export default function KnowledgeGraph() {
  const canvasRef = useRef(null);
  const posRef = useRef({});
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const { lastRun } = usePrediction();

  const [mode, setMode] = useState('full');
  const [fullGraph, setFullGraph] = useState(null);
  const [selected, setSelected] = useState(null);
  const [err, setErr] = useState('');
  const [dragging, setDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [filterTypes, setFilterTypes] = useState(['disease', 'risk_factor', 'symptom', 'drug']);
  const [search, setSearch] = useState('');

  const patientGraph = lastRun?.knowledgeGraph;

  const activeGraph = useMemo(() => {
    if (mode === 'patient') {
      if (!patientGraph?.nodes?.length) return null;
      return { nodes: patientGraph.nodes, edges: patientGraph.edges, seedIds: patientGraph.seedIds };
    }
    if (!fullGraph) return null;
    const filtered = fullGraph.nodes.filter(n =>
      filterTypes.includes(n.type) &&
      (search === '' || n.label.toLowerCase().includes(search.toLowerCase()) || n.id.toLowerCase().includes(search.toLowerCase()))
    );
    const ids = new Set(filtered.map(n => n.id));
    const edges = fullGraph.edges.filter(e => ids.has(e.source) && ids.has(e.target));
    return { nodes: filtered, edges };
  }, [mode, patientGraph, fullGraph, filterTypes, search]);

  const loadFull = useCallback(async () => {
    try {
      const res = await graphsApi.clinicalFull();
      setFullGraph(res.data);
    } catch (e) { setErr(e.message || 'Failed to load graph'); }
  }, []);

  useEffect(() => { loadFull(); }, [loadFull]);

  /* reset positions when graph data changes */
  useEffect(() => { posRef.current = {}; }, [activeGraph]);

  /* ── draw ── */
  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !activeGraph?.nodes?.length) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const W = c.clientWidth || 800, H = c.clientHeight || 500;
    c.width = W; c.height = H;
    if (!posRef.current || Object.keys(posRef.current).length === 0) {
      posRef.current = forceLayout(activeGraph.nodes, activeGraph.edges, W, H);
    }
    const pos = posRef.current;
    const z = zoomRef.current || 1;
    const p = panRef.current || { x: 0, y: 0 };
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(p.x + W / 2, p.y + H / 2);
    ctx.scale(z, z);
    ctx.translate(-W / 2, -H / 2);

    /* edges */
    (activeGraph.edges || []).forEach(e => {
      const a = pos[e.source], b = pos[e.target];
      if (!a || !b) return;
      const w = typeof e.weight === 'number' ? e.weight : 0.5;
      ctx.strokeStyle = `rgba(139,92,246,${0.12 + w * 0.18})`;
      ctx.lineWidth = (1 + w * 1.5) / z;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });

    /* nodes */
    Object.values(pos).forEach(({ x, y, node }) => {
      const col = NODE_COLORS[node.type] || NODE_COLORS.other;
      const isSel = selected?.id === node.id;
      const r = isSel ? 16 : 11;
      /* glow */
      if (isSel) {
        ctx.beginPath();
        ctx.strokeStyle = col + '55';
        ctx.lineWidth = 5 / z;
        ctx.arc(x, y, r + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      /* circle */
      ctx.beginPath();
      ctx.fillStyle = col;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isSel ? '#fff' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = (isSel ? 2.5 : 1.2) / z;
      ctx.stroke();
      /* label */
      const label = (node.label || node.id).slice(0, 18);
      const fs = (isSel ? 11 : 10) / z;
      ctx.font = `600 ${fs}px Inter,system-ui,sans-serif`;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(10,8,20,0.82)';
      ctx.fillRect(x - tw / 2 - 3, y + r + 4, tw + 6, fs + 4);
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x, y + r + 6);
    });
    ctx.restore();
  }, [activeGraph, selected]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(c);
    return () => ro.disconnect();
  }, [draw]);

  /* ── interactions ── */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const hitTest = (ex, ey) => {
      const rect = c.getBoundingClientRect();
      const z = zoomRef.current, p = panRef.current;
      const mx = (ex - rect.left - p.x - rect.width / 2) / z + rect.width / 2;
      const my = (ey - rect.top - p.y - rect.height / 2) / z + rect.height / 2;
      let hit = null;
      Object.values(posRef.current).forEach(pt => {
        if (Math.hypot(mx - pt.x, my - pt.y) < 14) hit = pt.node;
      });
      return hit;
    };
    const onClick = ev => { if (!dragging) setSelected(hitTest(ev.clientX, ev.clientY)); };
    const onDown = ev => {
      const h = hitTest(ev.clientX, ev.clientY);
      setDragging(true); setDragNode(h || null);
      setLastMouse({ x: ev.clientX, y: ev.clientY });
    };
    const onMove = ev => {
      if (!dragging) return;
      const dx = ev.clientX - lastMouse.x, dy = ev.clientY - lastMouse.y;
      if (dragNode && posRef.current[dragNode.id]) {
        posRef.current[dragNode.id].x += dx / zoomRef.current;
        posRef.current[dragNode.id].y += dy / zoomRef.current;
      } else { panRef.current.x += dx; panRef.current.y += dy; }
      setLastMouse({ x: ev.clientX, y: ev.clientY });
      draw();
    };
    const onUp = () => { setDragging(false); setDragNode(null); };
    const onWheel = ev => {
      ev.preventDefault();
      zoomRef.current = Math.max(0.3, Math.min(3, zoomRef.current * (ev.deltaY > 0 ? 0.9 : 1.1)));
      draw();
    };
    c.addEventListener('click', onClick);
    c.addEventListener('mousedown', onDown);
    c.addEventListener('mousemove', onMove);
    c.addEventListener('mouseup', onUp);
    c.addEventListener('mouseleave', onUp);
    c.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      c.removeEventListener('click', onClick);
      c.removeEventListener('mousedown', onDown);
      c.removeEventListener('mousemove', onMove);
      c.removeEventListener('mouseup', onUp);
      c.removeEventListener('mouseleave', onUp);
      c.removeEventListener('wheel', onWheel);
    };
  }, [activeGraph, dragging, dragNode, lastMouse, draw]);

  const relatedEdges = useMemo(() => {
    if (!selected || !activeGraph?.edges) return [];
    return activeGraph.edges.filter(e => e.source === selected.id || e.target === selected.id);
  }, [selected, activeGraph]);

  const handleReset = () => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    posRef.current = {};
    draw();
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="kg-page">
        {/* ── header ── */}
        <header className="kg-header">
          <div>
            <div className="kg-title">Healthcare Knowledge Graph</div>
            <div className="kg-subtitle">Disease · Risk · Symptom · Drug relationships</div>
          </div>
          <div className="kg-controls">
            <button className={`kg-tab${mode === 'full' ? ' active' : ''}`} onClick={() => { setMode('full'); setSelected(null); }}>Full Graph</button>
            <button className={`kg-tab${mode === 'patient' ? ' active' : ''}`} onClick={() => { setMode('patient'); setSelected(null); }}>My Subgraph</button>
            <Link to="/dashboard" className="kg-back">← Dashboard</Link>
          </div>
        </header>

        {/* ── body ── */}
        <div className="kg-body">
          <div className="kg-canvas-wrap">
            {err && <div className="kg-err">{err}</div>}
            {mode === 'patient' && !patientGraph?.nodes?.length ? (
              <div className="kg-empty">
                <div>
                  <p style={{ marginBottom: 12 }}>No patient subgraph yet.</p>
                  <Link to="/assessment" style={{ color: '#22d3ee' }}>Run a health assessment</Link>
                  <span> to generate your relevance graph.</span>
                </div>
              </div>
            ) : (
              <>
                <canvas ref={canvasRef} />
                <div className="kg-zoom-bar">
                  <button className="kg-zoom-btn" onClick={() => { zoomRef.current = Math.min(3, zoomRef.current * 1.2); draw(); }}>+</button>
                  <button className="kg-zoom-btn" onClick={() => { zoomRef.current = Math.max(0.3, zoomRef.current * 0.8); draw(); }}>−</button>
                  <button className="kg-zoom-btn" style={{ fontSize: 11, width: 'auto', padding: '0 12px' }} onClick={handleReset}>Reset</button>
                </div>
              </>
            )}
          </div>

          {/* ── sidebar ── */}
          <aside className="kg-sidebar">
            {mode === 'full' && (
              <>
                <div className="kg-section-title">Search</div>
                <input className="kg-search" placeholder="Search nodes…" value={search} onChange={e => setSearch(e.target.value)} />
                <div className="kg-section-title">Filter</div>
                <div className="kg-filter-grid">
                  {LEGEND.map(l => (
                    <button key={l.type} className={`kg-filter-btn${filterTypes.includes(l.type) ? ' on' : ''}`}
                      onClick={() => setFilterTypes(p => p.includes(l.type) ? p.filter(t => t !== l.type) : [...p, l.type])}>
                      <span className="kg-dot" style={{ background: l.color, opacity: filterTypes.includes(l.type) ? 1 : 0.35 }} />
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="kg-section-title">Legend</div>
            <div className="kg-legend-list">
              {LEGEND.map(l => (
                <div key={l.type} className="kg-legend-item">
                  <span className="kg-dot" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>

            {mode === 'patient' && patientGraph?.seedIds?.length > 0 && (
              <div className="kg-seeds">Seeds: <span>{patientGraph.seedIds.join(', ')}</span></div>
            )}

            {selected ? (
              <div className="kg-detail-card">
                <div className="kg-detail-type">{selected.type?.replace('_', ' ')}</div>
                <div className="kg-detail-label">{selected.label}</div>
                <div className="kg-detail-id">ID: {selected.id}</div>
                {relatedEdges.length > 0 && (
                  <div className="kg-edge-list">
                    {relatedEdges.map((e, i) => (
                      <div key={i} className="kg-edge-item">
                        {e.source} → {e.target} <span className="kg-edge-rel">({e.relation})</span>
                        {e.weight != null && <span style={{ color: '#475569' }}> w={e.weight}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="kg-hint">Click a node to inspect relationships.</div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
