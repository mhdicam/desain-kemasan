import React from 'react';
import { store, useStore } from '../state/store.js';
import { PRODUCT_CATEGORIES } from '../dieline/templateCatalog.js';
import { briefChecklist, briefReady, downloadBrief } from '../brief/briefWorkflow.js';

const input = { width: '100%', boxSizing: 'border-box', border: '1px solid #d8d0c2', borderRadius: 7, padding: '8px 9px', background: '#fff', color: '#2b2722' };
const label = { fontSize: 11, color: '#8a8071', margin: '10px 0 5px', fontWeight: 800 };
const btn = { border: '1px solid #d8d0c2', borderRadius: 7, background: '#fff', padding: '9px 11px', cursor: 'pointer', color: '#5c554a', fontWeight: 800 };
const outputs = ['Dieline PDF', 'Mockup PNG', 'OBJ/MTL', 'glTF', 'Spec Sheet', 'Print-ready Artwork', 'ZIP Assets'];

function setBrief(patch) { store.set({ brief: { ...(store.get().brief || {}), ...patch } }); }
function Field({ k, title, placeholder, area = false }) {
  const s = useStore(); const b = s.brief || {};
  return <><div style={label}>{title}</div>{area ? <textarea value={b[k] || ''} placeholder={placeholder || ''} onChange={e => setBrief({ [k]: e.target.value })} rows={4} style={{ ...input, resize: 'vertical' }} /> : <input value={b[k] || ''} placeholder={placeholder || ''} onChange={e => setBrief({ [k]: e.target.value })} style={input} />}</>;
}

export function BriefWorkflowView() {
  const s = useStore();
  const b = s.brief || {};
  const checks = briefChecklist(b);
  const ready = briefReady(b);
  const toggleOutput = out => {
    const cur = Array.isArray(b.outputs) ? b.outputs : [];
    setBrief({ outputs: cur.includes(out) ? cur.filter(x => x !== out) : [...cur, out] });
  };
  return <>
    <div style={{ width: 340, flex: 'none', background: '#faf7f0', borderRight: '1px solid #ded5c4', overflowY: 'auto' }}>
      <div style={{ padding: 14, borderBottom: '1px solid #e5dccd' }}><div style={{ fontWeight: 900, color: '#211d18' }}>Brief Custom</div><div style={{ fontSize: 12, color: '#756b5b', marginTop: 4 }}>Phase 13 · kumpul kebutuhan sebelum produksi</div></div>
      <div style={{ padding: 14 }}>
        <Field k="projectName" title="Nama project" placeholder="Snack Box Premium" />
        <div style={label}>Kategori</div><select value={b.category || 'packaging'} onChange={e => setBrief({ category: e.target.value })} style={input}>{PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <Field k="productType" title="Tipe produk" placeholder="Folding carton / pouch / kaos / booth" />
        <Field k="size" title="Ukuran" placeholder="120×45×180 mm" />
        <Field k="material" title="Bahan" placeholder="SBS 350 gsm / cotton / vinyl" />
        <Field k="finish" title="Finishing" placeholder="Matte lamination, spot UV, emboss" />
        <Field k="quantity" title="Quantity" placeholder="1000 pcs" />
        <Field k="deadline" title="Deadline" placeholder="2026-11-01" />
        <Field k="budget" title="Budget" placeholder="Opsional" />
      </div>
    </div>
    <div style={{ width: 340, flex: 'none', background: '#f7f1e7', borderRight: '1px solid #ded5c4', overflowY: 'auto' }}>
      <div style={{ padding: 14 }}>
        <Field k="brandName" title="Brand" placeholder="Nama brand" />
        <Field k="audience" title="Target audience" placeholder="Anak muda, premium, keluarga" />
        <Field k="style" title="Gaya visual" placeholder="Minimalis, playful, halal-friendly" />
        <Field k="colors" title="Warna" placeholder="#9a5b1f, gold, cream" />
        <Field k="references" title="Referensi" placeholder="Link / catatan referensi" area />
        <Field k="notes" title="Catatan produksi" placeholder="Pantone, area logo, batas aman, larangan desain" area />
        <div style={label}>Output diminta</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{outputs.map(out => <button key={out} onClick={() => toggleOutput(out)} style={{ ...btn, padding: '7px 9px', fontSize: 11.5, background: (b.outputs || []).includes(out) ? '#9a5b1f' : '#fff', color: (b.outputs || []).includes(out) ? '#fff' : '#5c554a', borderColor: (b.outputs || []).includes(out) ? '#9a5b1f' : '#d8d0c2' }}>{out}</button>)}</div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}><button onClick={() => downloadBrief(b, 'md')} style={{ ...btn, flex: 1, background: '#9a5b1f', color: '#fff', border: 'none' }}>Export Brief MD</button><button onClick={() => downloadBrief(b, 'json')} style={{ ...btn, flex: 1 }}>Export JSON</button></div>
      </div>
    </div>
    <div style={{ flex: 1, padding: 22, overflowY: 'auto', background: 'radial-gradient(ellipse at top, #fffaf1 0%, #efe4d3 70%)' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', background: 'rgba(255,255,255,.86)', border: '1px solid #e0d4c2', borderRadius: 16, padding: 22, boxShadow: '0 22px 60px rgba(70,50,20,.10)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}><div><div style={{ fontSize: 24, fontWeight: 950, color: '#211d18' }}>{b.projectName || 'Brief Custom Baru'}</div><div style={{ color: '#7a6b58', marginTop: 5 }}>{b.productType || 'Tipe produk belum diisi'} · {b.size || 'ukuran belum diisi'} · {b.material || 'bahan belum diisi'}</div></div><div style={{ borderRadius: 99, padding: '7px 11px', fontWeight: 900, fontSize: 12, background: ready ? '#e6f4ea' : '#fff3cd', color: ready ? '#2f7044' : '#946200' }}>{ready ? 'Brief siap' : 'Brief belum lengkap'}</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, marginTop: 18 }}>{Object.entries(checks).map(([k, ok]) => <div key={k} style={{ border: '1px solid ' + (ok ? '#b9dfc4' : '#ead7ad'), background: ok ? '#f0faf3' : '#fff8e6', borderRadius: 10, padding: 10, fontSize: 12, color: ok ? '#2f7044' : '#806020', fontWeight: 800 }}>{ok ? '✓ ' : '○ '}{k}</div>)}</div>
        <div style={{ marginTop: 20, lineHeight: 1.65, color: '#4b4034' }}><b>Output:</b> {(b.outputs || []).join(', ') || '-'}<br/><b>Brand:</b> {b.brandName || '-'}<br/><b>Audience:</b> {b.audience || '-'}<br/><b>Gaya:</b> {b.style || '-'}<br/><b>Referensi:</b> {b.references || '-'}<br/><b>Catatan:</b> {b.notes || '-'}</div>
        <div style={{ marginTop: 18, background: '#f0ebe0', borderRadius: 10, padding: 12, fontSize: 12, color: '#5c554a' }}>Phase 13: workflow brief custom simpan kebutuhan ukuran, bahan, target, referensi, output, lalu export Markdown/JSON untuk produksi atau quotation.</div>
      </div>
    </div>
  </>;
}
