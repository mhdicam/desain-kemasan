import React from 'react';
import { allModels, catalogStats } from '../dieline/templateCatalog.js';

function downloadText(name, text, type) {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function csvCell(v) {
  return '"' + String(v ?? '').replaceAll('"', '""') + '"';
}

export function exportCatalogJSON() {
  const payload = { exportedAt: new Date().toISOString(), stats: catalogStats(), models: allModels() };
  downloadText('mockup-product-catalog.json', JSON.stringify(payload, null, 2), 'application/json');
}

export function exportCatalogCSV() {
  const rows = allModels().map(m => [m.productCategory || m.category, m.subCategory || '', m.code, m.name, m.sub, (m.tags || []).join('|'), m.stock, m.difficulty, m.mode]);
  const head = ['category','subcategory','code','name','description','tags','stock','difficulty','mode'];
  downloadText('mockup-product-catalog.csv', [head, ...rows].map(r => r.map(csvCell).join(',')).join('\n'), 'text/csv');
}

export function CatalogExportButtons() {
  const s = catalogStats();
  const btn = { border: '1px solid #cdbfaa', background: '#fffdf8', color: '#6d4724', borderRadius: 9, padding: '10px 12px', cursor: 'pointer', fontWeight: 900 };
  return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
    <button onClick={exportCatalogJSON} style={btn}>Export Catalog JSON</button>
    <button onClick={exportCatalogCSV} style={btn}>Export Catalog CSV</button>
    <span style={{ fontSize: 12, color: '#756b5b' }}>{s.total} model · {s.mockupReady} mockup · {s.productionReady} dieline</span>
  </div>;
}
