import React from 'react';
import { TPLS } from '../dieline/templates.js';
import { allModels } from '../dieline/templateCatalog.js';
import { productionQA } from '../qa/productionQA.js';
import { handoffChecklist, handoffManifest, downloadHandoff } from '../handoff/productionHandoff.js';

const card = { background: 'rgba(255,255,255,.9)', border: '1px solid #e0d4c2', borderRadius: 14, padding: 16, boxShadow: '0 16px 50px rgba(70,50,20,.08)' };
const btn = { border: '1px solid #d8d0c2', borderRadius: 7, background: '#fff', padding: '9px 11px', cursor: 'pointer', color: '#5c554a', fontWeight: 800 };

export function ProductionHandoffView() {
  const models = allModels(TPLS);
  const qa = productionQA({ templates: TPLS, models, expectedMinModels: 90, expectedMinTemplates: 10 });
  const manifest = handoffManifest({ templates: TPLS, models, qa, liveUrl: 'https://packaging.pojokinfo.my.id' });
  const checks = handoffChecklist(manifest);
  return <div style={{ flex: 1, padding: 22, overflowY: 'auto', background: 'radial-gradient(ellipse at top, #fffaf1 0%, #efe4d3 70%)' }}>
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
        <div><div style={{ fontSize: 28, fontWeight: 950, color: '#211d18' }}>Production Handoff</div><div style={{ color: '#756b5b', marginTop: 5 }}>Phase 15 · paket serah-terima, manifest, next phase</div></div>
        <div style={{ display: 'flex', gap: 8 }}><button onClick={() => downloadHandoff(manifest, 'md')} style={{ ...btn, background: '#9a5b1f', color: '#fff', border: 'none' }}>Export Handoff MD</button><button onClick={() => downloadHandoff(manifest, 'json')} style={btn}>Export JSON</button><button onClick={() => downloadHandoff(manifest, 'txt')} style={btn}>Export Bundle TXT</button></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 14 }}>
        <div style={card}><div style={{ fontSize: 22, fontWeight: 950, color: '#211d18' }}>{manifest.projectName}</div><div style={{ marginTop: 8, color: '#5c554a', lineHeight: 1.7 }}><b>Live:</b> <a href={manifest.liveUrl} target="_blank" rel="noreferrer" style={{ color: '#9a5b1f' }}>{manifest.liveUrl}</a><br/><b>Phase:</b> {manifest.phase}<br/><b>Total model:</b> {qa.totalModels}<br/><b>Template produksi:</b> {qa.templateCount}<br/><b>GitHub push:</b> {manifest.noPushPolicy ? 'NO PUSH' : 'Allowed'}</div></div>
        <div style={card}><div style={{ fontWeight: 950, color: '#211d18', marginBottom: 10 }}>Handoff checklist</div><div style={{ display: 'grid', gap: 8 }}>{Object.entries(checks).map(([k, ok]) => <div key={k} style={{ border: '1px solid ' + (ok ? '#b9dfc4' : '#ead7ad'), background: ok ? '#f0faf3' : '#fff8e6', borderRadius: 9, padding: 9, fontSize: 12, color: ok ? '#2f7044' : '#806020', fontWeight: 850 }}>{ok ? '✓ ' : '○ '}{k}</div>)}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
        <div style={card}><div style={{ fontWeight: 950, marginBottom: 10 }}>Path produksi</div>{Object.entries(manifest.productionPaths).map(([k, v]) => <div key={k} style={{ borderBottom: '1px solid #eee2d0', padding: '8px 0', color: '#4b4034' }}><b>{k}</b><br/><code>{v}</code></div>)}</div>
        <div style={card}><div style={{ fontWeight: 950, marginBottom: 10 }}>Export paket</div>{manifest.exports.map(x => <div key={x} style={{ borderBottom: '1px solid #eee2d0', padding: '8px 0', color: '#4b4034' }}>✓ {x}</div>)}</div>
      </div>
      <div style={{ ...card, marginTop: 14 }}><div style={{ fontWeight: 950, marginBottom: 10 }}>Next phase</div>{manifest.nextPhases.map(x => <div key={x.phase} style={{ borderBottom: '1px solid #eee2d0', padding: '9px 0', color: '#4b4034' }}><b>Phase {x.phase}: {x.title}</b><br/><span>{x.goal}</span></div>)}</div>
      <div style={{ ...card, marginTop: 14, fontSize: 12, color: '#5c554a', lineHeight: 1.6 }}>Phase 15 mengunci handoff produksi: live URL, QA ready, path server, kebijakan no-push, daftar export, dan roadmap phase berikutnya.</div>
    </div>
  </div>;
}
