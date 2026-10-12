import React from 'react';
import { TPLS } from '../dieline/templates.js';
import { allModels } from '../dieline/templateCatalog.js';
import { productionQA, downloadQA } from '../qa/productionQA.js';

const card = { background: 'rgba(255,255,255,.88)', border: '1px solid #e0d4c2', borderRadius: 14, padding: 16, boxShadow: '0 16px 50px rgba(70,50,20,.08)' };
const btn = { border: '1px solid #d8d0c2', borderRadius: 7, background: '#fff', padding: '9px 11px', cursor: 'pointer', color: '#5c554a', fontWeight: 800 };

function Stat({ title, value, sub }) {
  return <div style={card}><div style={{ fontSize: 11, color: '#8a8071', fontWeight: 900, textTransform: 'uppercase' }}>{title}</div><div style={{ fontSize: 28, fontWeight: 950, color: '#211d18', marginTop: 6 }}>{value}</div>{sub && <div style={{ fontSize: 12, color: '#756b5b', marginTop: 4 }}>{sub}</div>}</div>;
}

export function ProductionQAView() {
  const report = productionQA({ templates: TPLS, models: allModels(TPLS), expectedMinModels: 90, expectedMinTemplates: 10 });
  return <div style={{ flex: 1, padding: 22, overflowY: 'auto', background: 'radial-gradient(ellipse at top, #fffaf1 0%, #efe4d3 70%)' }}>
    <div style={{ maxWidth: 1060, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
        <div><div style={{ fontSize: 28, fontWeight: 950, color: '#211d18' }}>QA Produksi</div><div style={{ color: '#756b5b', marginTop: 5 }}>Phase 14 · status lock, audit coverage, capability check</div></div>
        <div style={{ display: 'flex', gap: 8 }}><button onClick={() => downloadQA(report, 'md')} style={{ ...btn, background: '#9a5b1f', color: '#fff', border: 'none' }}>Export QA MD</button><button onClick={() => downloadQA(report, 'json')} style={btn}>Export JSON</button></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
        <Stat title="Total model" value={report.totalModels} sub="catalog aktif" />
        <Stat title="Template produksi" value={report.templateCount} sub="dieline engine" />
        <Stat title="Produksi valid" value={report.productionReady} sub={`${report.completion.productionReadyPct}% dari katalog`} />
        <Stat title="Audit coverage" value={`${report.completion.auditCoveragePct}%`} sub={`${report.auditRows} row`} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
        <div style={card}><div style={{ fontWeight: 950, color: '#211d18', marginBottom: 10 }}>Checklist Phase 14</div><div style={{ display: 'grid', gap: 8 }}>{Object.entries(report.checklist).map(([k, ok]) => <div key={k} style={{ border: '1px solid ' + (ok ? '#b9dfc4' : '#ead7ad'), background: ok ? '#f0faf3' : '#fff8e6', borderRadius: 9, padding: 9, fontSize: 12, color: ok ? '#2f7044' : '#806020', fontWeight: 850 }}>{ok ? '✓ ' : '○ '}{k}</div>)}</div></div>
        <div style={card}><div style={{ fontWeight: 950, color: '#211d18', marginBottom: 10 }}>Capability lock</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{report.capabilities.map(x => <span key={x} style={{ borderRadius: 999, background: '#efe4d3', color: '#5c554a', padding: '7px 10px', fontWeight: 850, fontSize: 12 }}>{x}</span>)}</div><div style={{ marginTop: 16, borderRadius: 10, padding: 12, background: report.ready ? '#e6f4ea' : '#fff3cd', color: report.ready ? '#2f7044' : '#946200', fontWeight: 900 }}>{report.ready ? 'QA READY — aman lanjut phase berikutnya.' : 'QA NEED CHECK — ada checklist belum lengkap.'}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
        <div style={card}><div style={{ fontWeight: 950, marginBottom: 10 }}>Status model</div>{Object.entries(report.statusCounts).map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee2d0', padding: '7px 0', color: '#4b4034' }}><span>{k}</span><b>{v}</b></div>)}</div>
        <div style={card}><div style={{ fontWeight: 950, marginBottom: 10 }}>Kategori</div>{Object.entries(report.byCategory).map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee2d0', padding: '7px 0', color: '#4b4034' }}><span>{k}</span><b>{v}</b></div>)}</div>
      </div>
      <div style={{ ...card, marginTop: 14, fontSize: 12, color: '#5c554a', lineHeight: 1.6 }}>Phase 14 mengunci status produksi: audit matrix harus sama dengan total katalog, template produksi minimal 10, dan fitur Phase 10–13 terdeteksi: validator desain, mesh export, PNG export, brief export.</div>
    </div>
  </div>;
}
