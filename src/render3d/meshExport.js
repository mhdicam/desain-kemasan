const r = v => Math.round(v * 10000) / 10000;
const face = (name, verts, mat = 'face', uv = [[0,0],[1,0],[1,1],[0,1]]) => ({ name, verts: verts.map(p => p.map(r)), mat, uv });

function boxFaces(L, W, H) {
  const x0 = -L / 2, x1 = L / 2, y0 = 0, y1 = H, z0 = -W / 2, z1 = W / 2;
  return [
    face('front', [[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]),
    face('back', [[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]]),
    face('left', [[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]]),
    face('right', [[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]]),
    face('top', [[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]]),
    face('bottom', [[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]])
  ];
}

function addGable(mesh, L, W, H) {
  const roof = Math.min(34, Math.max(18, W * 0.75));
  const hw = Math.min(46, L * 0.42), hh = 8;
  const x0 = -L / 2, x1 = L / 2, zf = W / 2, zb = -W / 2, yc = H + roof;
  mesh.faces.push(face('gable-front', [[x0,H,zf],[x1,H,zf],[hw/2,yc,zf],[-hw/2,yc,zf]], 'face'));
  mesh.faces.push(face('gable-back', [[x1,H,zb],[x0,H,zb],[-hw/2,yc,zb],[hw/2,yc,zb]], 'face'));
  mesh.faces.push(face('handle-cut-marker-front', [[-hw/2,yc-hh,zf+0.03],[hw/2,yc-hh,zf+0.03],[hw/2,yc-hh+1.2,zf+0.03],[-hw/2,yc-hh+1.2,zf+0.03]], 'cut'));
  mesh.features.push({ id: 'handle', label: 'Handle cut marker', width: r(hw), height: r(hh), y: r(yc - hh) });
}

function addWindow(mesh, L, W, H) {
  const ww = Math.max(18, L * 0.48), wh = Math.max(24, H * 0.48), z = W / 2 + 0.04;
  const x0 = -ww / 2, x1 = ww / 2, y0 = (H - wh) / 2, y1 = y0 + wh, m = 3;
  mesh.faces.push(face('window-pet', [[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]], 'window'));
  mesh.faces.push(face('window-safe-frame-top', [[x0-m,y1,z+0.02],[x1+m,y1,z+0.02],[x1+m,y1+m,z+0.02],[x0-m,y1+m,z+0.02]], 'cut'));
  mesh.faces.push(face('window-safe-frame-bottom', [[x0-m,y0-m,z+0.02],[x1+m,y0-m,z+0.02],[x1+m,y0,z+0.02],[x0-m,y0,z+0.02]], 'cut'));
  mesh.features.push({ id: 'pet-window', label: 'PET window mesh insert', width: r(ww), height: r(wh), panel: 'front' });
}

function addAutoLock(mesh, L, W) {
  const flap = Math.min(W, 38), y = -0.02, z0 = -W / 2, z1 = W / 2;
  mesh.faces.push(face('auto-lock-flap-a', [[-L/2,y,z0],[-L/8,y-flap,z0],[L/2,y,z0]], 'core', [[0,0],[.5,1],[1,0]]));
  mesh.faces.push(face('auto-lock-flap-b', [[-L/2,y,z1],[L/8,y-flap,z1],[L/2,y,z1]], 'core', [[0,0],[.5,1],[1,0]]));
  mesh.features.push({ id: 'auto-lock-bottom', label: 'Auto-lock interlocking bottom flaps', flap: r(flap) });
}

function flatFace(w,h,label='flat'){ const x0=-w/2,x1=w/2,y0=0,y1=h; return face(label, [[x0,y0,0.22],[x1,y0,0.22],[x1,y1,0.22],[x0,y1,0.22]]); }
export function productionMesh({ tpl = 'rte', L = 80, W = 40, H = 120, t = 0.45, glue = 14 } = {}) {
  const flat = new Set(['paper-cup-packaging','cup-sleeve','bottle-label-packaging','belly-band','hangtag','sticker-label-roll']);
  if (flat.has(tpl)) {
    const dims = { 'paper-cup-packaging':[(L+Math.max(30,W))/2, H], 'cup-sleeve':[(L+Math.max(30,W))/2, Math.max(38, Math.min(H,75))], 'bottle-label-packaging':[Math.max(40,Math.PI*L), Math.max(20,Math.min(H,120))], 'belly-band':[2*(L+W)+glue, Math.max(18,Math.min(H*0.38,70))], 'hangtag':[Math.max(35,Math.min(L,90)), Math.max(55,Math.min(H,140))], 'sticker-label-roll':[3*Math.max(30,Math.min(L,120))+8, Math.max(20,Math.min(H,90))] };
    const [w,h]=dims[tpl]||[L,H];
    const mesh={ id: tpl, units:'millimeter', scale:[r(w),r(h),r(t)], thickness:t, glue, faces:[flatFace(w,h, tpl)], features:[{id:'flat',label:'Flat dieline preview'}] };
    mesh.vertices = mesh.faces.flatMap(f=>f.verts); return mesh;
  }
  const mesh = { id: tpl, units: 'millimeter', scale: [r(L), r(W), r(H)], thickness: t, glue, faces: boxFaces(L, W, H), features: [] };
  if (tpl === 'gable-box') addGable(mesh, L, W, H);
  if (tpl === 'window-carton') addWindow(mesh, L, W, H);
  if (tpl === 'auto-lock-bottom') addAutoLock(mesh, L, W);
  if (['pillow-box','pizza-box','shipping-box','sleeve-tray','fries-box'].includes(tpl)) mesh.features.push({id:'box-variant',label: tpl + ' variant (preview uses STE folding tree)'});
  mesh.vertices = mesh.faces.flatMap(f => f.verts);
  return mesh;
}

export function meshChecklist(mesh) {
  return {
    hasMeshExport: mesh.faces.length >= 6,
    hasUvPanels: mesh.faces.every(f => Array.isArray(f.uv) && f.uv.length === f.verts.length),
    hasProductionScale: mesh.units === 'millimeter' && mesh.scale.every(v => v > 0),
    hasSpecialFeatures: mesh.features.length > 0
  };
}

export function exportOBJ(mesh) {
  const lines = [`# OpenBox3D production mesh`, `# units: ${mesh.units}`, `mtllib ${mesh.id}.mtl`, `o ${mesh.id}`];
  for (const f of mesh.faces) for (const v of f.verts) lines.push(`v ${v[0]} ${v[1]} ${v[2]}`);
  for (const f of mesh.faces) for (const uv of f.uv) lines.push(`vt ${r(uv[0])} ${r(uv[1])}`);
  let vi = 1, ui = 1;
  for (const f of mesh.faces) {
    lines.push(`g ${f.name}`); lines.push(`usemtl ${f.mat || 'face'}`);
    const idx = f.verts.map((_, i) => `${vi + i}/${ui + i}`).join(' ');
    lines.push(`f ${idx}`); vi += f.verts.length; ui += f.uv.length;
  }
  return lines.join('\n') + '\n';
}

export function exportMTL() {
  return `newmtl face\nKd 0.92 0.88 0.78\nKs 0.08 0.08 0.08\nNs 30\n\nnewmtl core\nKd 0.70 0.62 0.48\nKs 0.02 0.02 0.02\nNs 5\n\nnewmtl window\nKd 0.70 0.90 1.00\nd 0.35\nTr 0.65\n\nnewmtl cut\nKd 1.00 0.15 0.08\n`;
}

export function exportGLTF(mesh) {
  return JSON.stringify({
    asset: { version: '2.0', generator: 'OpenBox3D meshExport Phase 11' },
    extras: { units: mesh.units, scale: mesh.scale, features: mesh.features, checklist: meshChecklist(mesh) },
    meshes: [{ name: mesh.id, primitives: mesh.faces.map(f => ({ mode: 4, material: f.mat, extras: { panel: f.name, vertices: f.verts, uv: f.uv } })) }]
  }, null, 2);
}

export function downloadMeshFiles(state, mat = { t: 0.45 }) {
  const mesh = productionMesh({ tpl: state.tpl, L: state.L, W: state.W, H: state.H, t: mat.t, glue: state.glue });
  const files = [
    [`${mesh.id}.obj`, exportOBJ(mesh), 'text/plain'],
    [`${mesh.id}.mtl`, exportMTL(mesh), 'text/plain'],
    [`${mesh.id}.gltf`, exportGLTF(mesh), 'model/gltf+json']
  ];
  for (const [name, text, type] of files) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([text], { type }));
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return meshChecklist(mesh);
}
