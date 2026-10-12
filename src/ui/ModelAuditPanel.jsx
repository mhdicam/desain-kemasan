import React from 'react';
import { auditMatrix, nextPriorityModels } from '../dieline/templateCatalog.js';

const labels = [
  ['hasDieline', 'Dieline'],
  ['hasDesignMapping', 'Desain'],
  ['has3DPreview', '3D Preview'],
  ['hasMeshExport', 'Mesh'],
  ['hasPDFExport', 'PDF'],
  ['hasBriefFlow', 'Brief']
];

function Check({ ok, text }) {
  return <span style={{ borderRadius: 99, padding: '3px 7px', fontSize: 10, fontWeight: 800, background: ok ? '#e6f4ea' : '#f3eadb', color: ok ? '#2f8f55' : '#9a6a2c', border: '1px solid ' + (ok ? '#b9dfc4' : '#e1c99f') }}>{ok ? '✓ ' : '○ '}{text}</span>;
}

export function ModelAuditPanel({ selectedId }) {
  const rows = auditMatrix();
  const priority = nextPriorityModels(10);
  const selectedRows = selectedId ? rows.filter(r => r.productCategory === selectedId || r.category === selectedId) : rows;
  return <div style={{ background: '#fffdf8', border: '1px solid #ded3c1', borderRadius: 14, padding: 16, marginBottom: 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, color: '#211d18' }}>Kesiapan Model</h2>
        <div style={{ fontSize: 12, color: '#756b5b', marginTop: 3 }}>Audit matrix Phase 8: status sekarang, target status, checklist fitur, dan prioritas realisasi.</div>
      </div>
      <div style={{ fontSize: 12, color: '#9a5b1f', fontWeight: 900 }}>{selectedRows.length} baris audit</div>
    </div>
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: '#8a8071', fontWeight: 900, marginBottom: 6 }}>Prioritas 10 model berikutnya</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {priority.map(m => <span key={m.id} style={{ background: '#fff7ea', border: '1px solid #dfc49e', color: '#7a5430', borderRadius: 99, padding: '5px 8px', fontSize: 11, fontWeight: 800 }}>{m.priority}. {m.name}</span>)}
      </div>
    </div>
    <div style={{ maxHeight: 360, overflow: 'auto', border: '1px solid #eadfce', borderRadius: 10 }}>
      <div style={{ minWidth: 900 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '54px 190px 130px 130px 1fr', gap: 0, background: '#f3eadb', color: '#5c554a', fontSize: 11, fontWeight: 900, position: 'sticky', top: 0 }}>
          <div style={{ padding: 9 }}>No</div><div style={{ padding: 9 }}>Model</div><div style={{ padding: 9 }}>Status</div><div style={{ padding: 9 }}>Target</div><div style={{ padding: 9 }}>Checklist</div>
        </div>
        {selectedRows.slice(0, 80).map(r => <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '54px 190px 130px 130px 1fr', borderTop: '1px solid #efe5d6', fontSize: 11.5, alignItems: 'center' }}>
          <div style={{ padding: 9, color: '#9a5b1f', fontWeight: 900 }}>{r.priority < 100 ? r.priority : '-'}</div>
          <div style={{ padding: 9 }}><b>{r.name}</b><div style={{ color: '#8a8071', fontSize: 10 }}>{r.code} · {r.category || r.productCategory}</div></div>
          <div style={{ padding: 9 }}><span style={{ color: r.statusTone, fontWeight: 900 }}>{r.status}</span></div>
          <div style={{ padding: 9, color: '#3d352b', fontWeight: 800 }}>{r.targetStatus}</div>
          <div style={{ padding: 9, display: 'flex', flexWrap: 'wrap', gap: 5 }}>{labels.map(([k, label]) => <Check key={k} ok={r.checklist[k]} text={label} />)}</div>
        </div>)}
      </div>
    </div>
  </div>;
}
