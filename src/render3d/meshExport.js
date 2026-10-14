import { buildMeshByFactory } from './meshFactories.js';

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
    hasNoGenericCubeFallback: named && mesh.factory !== 'generic-cube'
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

function gltfJson(mesh) {
  const meterScale = 0.001;
  return {
    asset: { version: '2.0', generator: 'AstaKraf meshFactories Wave1' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: mesh.id, mesh: 0 }],
    meshes: [{ name: mesh.id, primitives: mesh.faces.map((f, i) => ({ mode: 4, material: i, attributes: {}, extras: { component: f.name, panelId: f.panelId || f.name, verticesMeters: f.verts.map(v => v.map(n => r(n * meterScale))), uv: f.uv, mat: f.mat } })) }],
    materials: mesh.faces.map(f => ({ name: f.mat || 'paper', pbrMetallicRoughness: { baseColorFactor: f.mat === 'corrugated' ? [0.72,0.60,0.42,1] : [0.92,0.88,0.78,1], roughnessFactor: 0.72, metallicFactor: 0 } })),
    animations: mesh.features.some(f => f.foldAnimation) ? [{ name: 'fold-unfold', channels: [], samplers: [], extras: { foldState: '0..100', panelGraph: mesh.panelGraph } }] : [],
    extras: { units: 'meter', sourceUnits: mesh.units, sourceScaleMm: mesh.scale, factory: mesh.factory, features: mesh.features, panelGraph: mesh.panelGraph, qa: meshQAReport(mesh), physicalProductionApproved: false }
  };
}

export function exportGLTF(mesh) {
  return JSON.stringify(gltfJson(mesh), null, 2);
}

export function exportGLB(mesh) {
  const json = JSON.stringify(gltfJson(mesh));
  const jb = enc(json);
  const jpad = (4 - (jb.length % 4)) % 4;
  const total = 12 + 8 + jb.length + jpad;
  const ab = new ArrayBuffer(total);
  const dv = new DataView(ab);
  let o = 0;
  dv.setUint32(o, 0x46546c67, true); o += 4;
  dv.setUint32(o, 2, true); o += 4;
  dv.setUint32(o, total, true); o += 4;
  dv.setUint32(o, jb.length + jpad, true); o += 4;
  dv.setUint32(o, 0x4e4f534a, true); o += 4;
  new Uint8Array(ab, o, jb.length).set(jb); o += jb.length;
  for (let i=0;i<jpad;i++) new Uint8Array(ab)[o+i] = 0x20;
  return ab;
}

export function verifyGLB(buffer) {
  const dv = new DataView(buffer);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('Invalid GLB magic');
  if (dv.getUint32(4, true) !== 2) throw new Error('Invalid GLB version');
  if (dv.getUint32(8, true) !== buffer.byteLength) throw new Error('Invalid GLB length');
  const len = dv.getUint32(12, true), type = dv.getUint32(16, true);
  if (type !== 0x4e4f534a) throw new Error('Missing JSON chunk');
  const text = new TextDecoder().decode(new Uint8Array(buffer, 20, len)).trim();
  const json = JSON.parse(text);
  if (json.asset?.version !== '2.0') throw new Error('Invalid glTF asset');
  return { version: json.asset.version, meshes: json.meshes?.length || 0, nodes: json.nodes?.length || 0, animations: json.animations?.length || 0, factory: json.extras?.factory };
}

function downloadBlob(name, data, type) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(new Blob([data], { type }));
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadMeshFiles(state, mat = { t: 0.45 }) {
  const mesh = productionMesh({ tpl: state.tpl, L: state.L, W: state.W, H: state.H, t: mat.t, glue: state.glue, quality: state.meshQuality || 'medium' });
  downloadBlob(`${mesh.id}.obj`, exportOBJ(mesh), 'text/plain');
  downloadBlob(`${mesh.id}.mtl`, exportMTL(mesh), 'text/plain');
  downloadBlob(`${mesh.id}.gltf`, exportGLTF(mesh), 'model/gltf+json');
  downloadBlob(`${mesh.id}.glb`, exportGLB(mesh), 'model/gltf-binary');
  downloadBlob(`${mesh.id}-qa.json`, JSON.stringify(meshQAReport(mesh), null, 2), 'application/json');
  return meshChecklist(mesh);
}
