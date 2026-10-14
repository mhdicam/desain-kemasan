import { buildMeshByFactory } from './meshFactories.js';
import {exportGLBBuffer,exportGLTFText,inspectGLBBuffer} from './gltfBinary.js';

const r = v => Math.round(v * 10000) / 10000;
const enc = s => new TextEncoder().encode(s);

export function productionMesh({ tpl = 'rte', L = 80, W = 40, H = 120, t = 0.45, glue = 14, quality = 'medium' } = {}) {
  return buildMeshByFactory({ tpl, L, W, H, t, glue, quality });
}

export function meshChecklist(mesh) {
  const uvOk = mesh.faces.every(f => Array.isArray(f.uv) && f.uv.length === f.verts.length && f.uv.flat().every(Number.isFinite));
  const vertsOk = mesh.faces.every(f => f.verts.length >= 3 && f.verts.flat().every(Number.isFinite));
  const named = mesh.faces.every(f => f.name && f.panelId !== 'cube');
  return {
    hasMeshExport: mesh.faces.length >= 1 && vertsOk,
    hasUvPanels: uvOk,
    hasProductionScale: mesh.units === 'millimeter' && mesh.scale.every(v => v > 0),
    hasPanelGraph: !!mesh.panelGraph && Array.isArray(mesh.panelGraph.nodes),
    hasSpecialFeatures: mesh.features.length > 0,
    hasNoGenericCubeFallback: named && mesh.factory !== 'generic-cube' && !mesh.unsupported
  };
}

export function meshQAReport(mesh) {
  const checks = meshChecklist(mesh);
  const uvOut = [];
  for (const f of mesh.faces) for (const uv of f.uv || []) if (uv[0] < -1e-6 || uv[0] > 1 + 1e-6 || uv[1] < -1e-6 || uv[1] > 1 + 1e-6) uvOut.push(f.name);
  const dims = mesh.vertices.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.min(b[2], p[2]), Math.max(b[3], p[0]), Math.max(b[4], p[1]), Math.max(b[5], p[2])], [Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity]);
  const report = {
    id: mesh.id,
    factory: mesh.factory,
    units: mesh.units,
    scaleMm: mesh.scale,
    faceCount: mesh.faces.length,
    vertexCount: mesh.vertices.length,
    componentCount: mesh.panelGraph?.components?.length || 0,
    panelGraphNodes: mesh.panelGraph?.nodes?.length || 0,
    bboxMm: dims.map(r),
    checks,
    uvOutOfRange: [...new Set(uvOut)],
    sourceGeometry: mesh.sourceGeometry,
    physicalProductionApproved: false,
    notes: mesh.validationNotes || []
  };
  report.valid = Object.values(checks).every(Boolean) && report.uvOutOfRange.length === 0;
  return report;
}

export function exportOBJ(mesh) {
  const lines = [`# AstaKraf production mesh`, `# units: ${mesh.units}`, `# factory: ${mesh.factory}`, `mtllib ${mesh.id}.mtl`, `o ${mesh.id}`];
  for (const f of mesh.faces) for (const v of f.verts) lines.push(`v ${v[0]} ${v[1]} ${v[2]}`);
  for (const f of mesh.faces) for (const uv of f.uv) lines.push(`vt ${r(uv[0])} ${r(uv[1])}`);
  let vi = 1, ui = 1;
  for (const f of mesh.faces) {
    lines.push(`g ${f.name}`); lines.push(`usemtl ${f.mat || 'paper'}`);
    const idx = f.verts.map((_, i) => `${vi + i}/${ui + i}`).join(' ');
    lines.push(`f ${idx}`); vi += f.verts.length; ui += f.uv.length;
  }
  return lines.join('\n') + '\n';
}

export function exportMTL() {
  return `newmtl paper\nKd 0.92 0.88 0.78\nKs 0.08 0.08 0.08\nNs 30\n\nnewmtl corrugated\nKd 0.72 0.60 0.42\nKs 0.02 0.02 0.02\nNs 5\n\nnewmtl glue\nKd 0.58 0.58 0.58\n\nnewmtl paper-pe\nKd 0.96 0.94 0.86\nKs 0.12 0.12 0.12\nNs 45\n\nnewmtl rim\nKd 0.98 0.98 0.94\n\nnewmtl screen\nKd 0.05 0.06 0.08\n`;
}

export function exportGLTF(mesh){return exportGLTFText(mesh);}
export function exportGLB(mesh){return exportGLBBuffer(mesh);}
export function verifyGLB(buffer){return inspectGLBBuffer(buffer);}

function downloadBlob(name, data, type) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(new Blob([data], { type }));
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadMeshFiles(state, mat = { t: 0.45 }) {
  if(!['rte','ste','mailer','lidbase','drawer','cyl','hex'].includes(state.tpl))throw Error('Prebuilt asset required; cannot export generic placeholder');
  const mesh = productionMesh({ tpl: state.tpl, L: state.L, W: state.W, H: state.H, t: mat.t, glue: state.glue, quality: state.meshQuality || 'medium' });
  downloadBlob(`${mesh.id}.obj`, exportOBJ(mesh), 'text/plain');
  downloadBlob(`${mesh.id}.mtl`, exportMTL(mesh), 'text/plain');
  downloadBlob(`${mesh.id}.gltf`, exportGLTF(mesh), 'model/gltf+json');
  downloadBlob(`${mesh.id}.glb`, exportGLB(mesh), 'model/gltf-binary');
  downloadBlob(`${mesh.id}-qa.json`, JSON.stringify(meshQAReport(mesh), null, 2), 'application/json');
  return meshChecklist(mesh);
}
