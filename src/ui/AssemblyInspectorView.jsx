import React, { useEffect, useMemo, useState } from 'react';

const SPEC_ROOT = '/mesh-assembly-spec-v7';
const colorOfStatus = status => status === 'mapped_candidate_requires_review' ? '#2f6fed' : status === 'nonfold_candidate_requires_review' ? '#9a5b1f' : '#d04a3a';

function rectOf(panel) {
  const box = panel?.svg_region_mm?.bbox;
  if (!Array.isArray(box) || box.length !== 4) return null;
  const [x1, y1, x2, y2] = box;
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

function endpointsOf(h) {
  if (Array.isArray(h.svgEndpointsMm)) return h.svgEndpointsMm;
  const a = h.axisDirectionMm;
  if (a?.start_svg_mm && a?.end_svg_mm) return [a.start_svg_mm, a.end_svg_mm];
  return null;
}

function creasePoints(c) {
  if (Array.isArray(c.polylineMm)) return c.polylineMm;
  return null;
}

function useJson(url) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch(url).then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${url}`)))
      .then(j => alive && setData(j)).catch(e => alive && setErr(e));
    return () => { alive = false; };
  }, [url]);
  return { data, err };
}

function useSvgViewBox(url) {
  const [box, setBox] = useState([0, 0, 320, 260]);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    fetch(url).then(r => r.text()).then(txt => {
      const vb = txt.match(/viewBox=["']([^"']+)["']/i)?.[1]?.trim().split(/[\s,]+/).map(Number);
      const w = Number(txt.match(/\swidth=["']([\d.]+)/i)?.[1]);
      const h = Number(txt.match(/\sheight=["']([\d.]+)/i)?.[1]);
      if (!alive) return;
      if (vb?.length === 4 && vb.every(Number.isFinite)) setBox(vb);
      else if (Number.isFinite(w) && Number.isFinite(h)) setBox([0, 0, w, h]);
    }).catch(() => {});
    return () => { alive = false; };
  }, [url]);
  return box;
}

function modelVerdict(model) {
  const issues = [];
  const panelIds = new Set((model.panels || []).map(p => p.id));
  for (const h of model.hinges || []) {
    const ep = endpointsOf(h);
    if (!h.creaseRef) issues.push(`${h.id}: missing creaseRef`);
    if (!panelIds.has(h.parentPanel)) issues.push(`${h.id}: parentPanel not found: ${h.parentPanel}`);
    if (!panelIds.has(h.childPanel)) issues.push(`${h.id}: childPanel not found: ${h.childPanel}`);
    if (!ep) issues.push(`${h.id}: missing hinge axis endpoints`);
    if (h.evidence !== 'verified') issues.push(`${h.id}: ${h.evidence || 'proposed'} fold assignment`);
    if (h.requiresSignedAngleCalibration) issues.push(`${h.id}: signed angle needs calibration`);
  }
  for (const c of model.creaseSemanticRegistry || []) {
    if (!c.sourceGeometryVerified) issues.push(`${c.sourceRef}: source geometry not verified`);
    if ((c.status || '').includes('requires_review')) issues.push(`${c.sourceRef}: ${c.status}`);
  }
  return issues;
}

function saveApprovedDraft(model, patch) {
  const payload = {
    schemaVersion: model.schemaVersion,
    identity: model.identity,
    reviewStatus: 'OPERATOR_DRAFT_NOT_VERIFIED',
    createdAt: new Date().toISOString(),
    warning: 'Manual edits are review metadata only. Do not promote to verified without QA evidence.',
    corrections: patch,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${model.identity.modelKey.replace(':', '__')}.assembly.approved.draft.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function AssemblyInspectorView() {
  const { data: index, err: indexErr } = useJson(`${SPEC_ROOT}/structural-index.json`);
  const [selected, setSelected] = useState('rte');
  const activeMeta = useMemo(() => index?.models?.find(m => m.id === selected) || index?.models?.[0], [index, selected]);
  useEffect(() => { if (!index?.models?.some(m => m.id === selected)) setSelected(index?.models?.[0]?.id || 'rte'); }, [index, selected]);
  const { data: model, err: modelErr } = useJson(activeMeta?.file || `${SPEC_ROOT}/models/structural/rte.assembly.json`);
  const viewBox = useSvgViewBox(model?.geometrySource?.publicSvgPath || activeMeta?.sourceSvg);
  const [finalState, setFinalState] = useState('closed_assembled');
  const [show, setShow] = useState({ panels: true, creases: true, hinges: true, glue: true });
  const [edits, setEdits] = useState({});
  const issues = useMemo(() => model ? modelVerdict(model) : [], [model]);

  if (indexErr || modelErr) return <div style={{ padding: 20, color: '#9b2d20' }}>Assembly inspector gagal load: {(indexErr || modelErr).message}</div>;
  if (!index || !model) return <div style={{ padding: 20 }}>Loading Assembly Inspector…</div>;
  const svgUrl = model.geometrySource?.publicSvgPath || activeMeta?.sourceSvg;

  return <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 420px', minHeight: 0, background: '#f5f1e8', color: '#241f19' }}>
    <aside style={{ borderRight: '1px solid #d9cfbf', padding: 12, overflow: 'auto' }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Assembly Inspector V7</h2>
      <div style={{ fontSize: 12, color: '#7a6d5b', marginBottom: 10 }}>Wave 0 · 27 structural models · proposed metadata stays reviewable</div>
      <select value={selected} onChange={e => setSelected(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #c9bba7', background: '#fffaf1' }}>
        {index.models.map(m => <option key={m.modelKey} value={m.id}>{m.modelKey} · {m.name}</option>)}
      </select>
      <div style={{ marginTop: 12, display: 'grid', gap: 6, fontSize: 12 }}>
        <b>{model.identity.modelKey}</b>
        <span>{model.identity.name}</span>
        <span>SVG: {model.geometrySource?.svgPathV6}</span>
        <span>Panels: {model.panels?.length || 0}</span>
        <span>Hinges: {model.hinges?.length || 0}</span>
        <span>Creases: {model.creaseSemanticRegistry?.length || 0}</span>
        <span>Status: {model.validation?.semanticStatus}</span>
      </div>
      <div style={{ marginTop: 14, padding: 10, background: '#fff6df', border: '1px solid #dfc58f', borderRadius: 8, fontSize: 12, lineHeight: 1.45 }}>
        <b>Validation guard</b><br />
        manufacturerApproved: {String(model.validation?.manufacturerApproved)}<br />
        physicalPrototypeTested: {String(model.validation?.physicalPrototypeTested)}<br />
        assemblySemanticsVerified: {String(model.validation?.assemblySemanticsVerified)}
      </div>
      <h3 style={{ fontSize: 13, marginTop: 16 }}>Layers</h3>
      {Object.keys(show).map(k => <label key={k} style={{ display: 'block', margin: '6px 0', fontSize: 12 }}><input type="checkbox" checked={show[k]} onChange={e => setShow({ ...show, [k]: e.target.checked })} /> {k}</label>)}
      <h3 style={{ fontSize: 13, marginTop: 16 }}>Final state</h3>
      <select value={finalState} onChange={e => setFinalState(e.target.value)} style={{ width: '100%', padding: 8 }}>
        {(model.finalStates?.available || ['closed_assembled']).map(s => <option key={s}>{s}</option>)}
      </select>
      <button onClick={() => saveApprovedDraft(model, edits)} style={{ marginTop: 14, width: '100%', padding: 9, border: 0, borderRadius: 6, background: '#9a5b1f', color: '#fff', fontWeight: 700 }}>Download review draft JSON</button>
    </aside>

    <main style={{ minWidth: 0, minHeight: 0, overflow: 'auto', padding: 12 }}>
      <div style={{ position: 'relative', width: '100%', minWidth: 800, aspectRatio: `${viewBox[2]} / ${viewBox[3]}`, background: '#fff', border: '1px solid #d6c9b8', borderRadius: 10, overflow: 'hidden' }}>
        {svgUrl && <img src={svgUrl} alt="Original SVG dieline" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />}
        <svg viewBox={viewBox.join(' ')} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {show.panels && (model.panels || []).map((p, i) => {
            const r = rectOf(p); if (!r) return null;
            const unresolved = (p.geometryEvidence || '').includes('unresolved') || p.printSide === 'unresolved';
            return <g key={p.id}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={unresolved ? 'rgba(208,74,58,.11)' : 'rgba(47,111,237,.09)'} stroke={p.anchor ? '#2f9e44' : unresolved ? '#d04a3a' : '#2f6fed'} strokeWidth="1.4" strokeDasharray={unresolved ? '3 3' : ''} />
              <text x={r.x + 3} y={r.y + 12} fontSize="5" fill="#1d1b18">{i + 1}. {p.id}</text>
            </g>;
          })}
          {show.creases && (model.creaseSemanticRegistry || []).map(c => {
            const pts = creasePoints(c); if (!pts?.length) return null;
            const d = pts.map((pt, i) => `${i ? 'L' : 'M'}${pt[0]} ${pt[1]}`).join(' ');
            const mid = pts[Math.floor(pts.length / 2)];
            return <g key={c.sourceRef}>
              <path d={d} fill="none" stroke={colorOfStatus(c.status)} strokeWidth="1.8" strokeDasharray={(c.status || '').includes('nonfold') ? '2 2' : ''} />
              <text x={mid[0] + 2} y={mid[1] - 2} fontSize="5" fill={colorOfStatus(c.status)}>{c.sourceRef}</text>
            </g>;
          })}
          {show.hinges && (model.hinges || []).map(h => {
            const ep = endpointsOf(h); if (!ep) return null;
            const [a, b] = ep;
            const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
            return <g key={h.id}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0b7285" strokeWidth="1" markerEnd="url(#arrow)" />
              <text x={mx + 3} y={my + 7} fontSize="5" fill="#0b7285">{h.proposedFoldDeg}° {h.foldStyle}</text>
            </g>;
          })}
          <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#0b7285" /></marker></defs>
        </svg>
      </div>
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        <Metric label="final state" value={finalState} />
        <Metric label="mapped candidates" value={(model.creaseSemanticRegistry || []).filter(c => (c.status || '').includes('mapped')).length} />
        <Metric label="needs review" value={issues.length} />
        <Metric label="physical accuracy" value={model.finalStates?.physicalAccuracy || 'NOT_VALIDATED'} />
      </div>
    </main>

    <aside style={{ borderLeft: '1px solid #d9cfbf', padding: 12, overflow: 'auto', fontSize: 12 }}>
      <h3 style={{ marginTop: 0 }}>Parent-child hierarchy</h3>
      <div style={{ display: 'grid', gap: 6 }}>
        {(model.hinges || []).map(h => <div key={h.id} style={{ padding: 8, background: '#fffaf1', border: '1px solid #e1d4c2', borderRadius: 8 }}>
          <b>{h.parentPanel}</b> → <b>{h.childPanel}</b><br />
          <span>{h.creaseRef} · {h.foldStyle} · signed {h.proposedFoldDeg}° · stage {h.stage}</span><br />
          <select value={edits[h.id]?.status || 'MAPPED_CANDIDATE'} onChange={e => setEdits({ ...edits, [h.id]: { ...(edits[h.id] || {}), status: e.target.value } })}>
            <option>MAPPED_CANDIDATE</option><option>NONFOLD_CANDIDATE</option><option>NEEDS_ROLE_REVIEW</option>
          </select>
        </div>)}
      </div>
      <h3>Glue / slot mappings</h3>
      {(model.attachments || []).map(a => <div key={a.id} style={{ marginBottom: 7, padding: 8, background: '#fff', borderRadius: 8, border: '1px solid #ddd' }}>{a.kind}: {a.fromPanel} → {a.toPanel}<br />{a.status}</div>)}
      <h3>Fold sequence</h3>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#211d18', color: '#f5f1e8', padding: 10, borderRadius: 8 }}>{JSON.stringify(model.foldSequence || [], null, 2)}</pre>
      <h3>Geometric QA blockers</h3>
      <ul style={{ paddingLeft: 18 }}>{issues.slice(0, 80).map((x, i) => <li key={i}>{x}</li>)}</ul>
    </aside>
  </div>;
}

function Metric({ label, value }) {
  return <div style={{ background: '#fffaf1', border: '1px solid #e1d4c2', borderRadius: 8, padding: 10 }}><div style={{ fontSize: 11, color: '#756a5b' }}>{label}</div><b>{String(value)}</b></div>;
}
