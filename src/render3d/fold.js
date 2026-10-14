// 折叠树：面板geometri (矩形板=BoxGeometry subdivisi tinggi，异形板=ExtrudeGeometry)+ bentangatlas UV remap
// 每面板label uvRect (2D dieline坐标 mm)+ attach (2D 中与母板的相邻边)，
// buildNode 累计 rotZ (0/90/180/270)，berdasarkan规则自动求 flip——主体板零手工arah标定
import * as THREE from 'three';
import { discBbox } from '../dieline/templates.js';
import { IMPORTED_DIELINES } from '../dieline/importedDielines.js';

const deg = d => d * Math.PI / 180;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// 归一化：(up,vp) = f(un,vn, rotZ)
function normUV(un, vn, rotZ) {
  if (rotZ === 0) return [un, vn];
  if (rotZ === 90) return [1 - vn, un];
  if (rotZ === 180) return [1 - un, 1 - vn];
  return [vn, 1 - un]; // 270
}
// 累计 rotZ 下面板的"向luar生长arah" (归一系中)：far tetap，near +180，xmin +90，xmax +270
// catatan：pg 系 +y = 2D 系 -y (2D atas插舌在母板上方，3D far 翼在母板 +y 侧)，故 v 映射为 (1-vp)
const OUT = { 0: '+v', 90: '-u', 180: '-v', 270: '+u' };
function flipOf(rotZ, attach) {
  if (!attach) return '';
  const d = OUT[rotZ];
  let f = '';
  if ((d === '+v' && attach === 'b') || (d === '-v' && attach === 't')) f += 'v';
  if ((d === '+u' && attach === 'l') || (d === '-u' && attach === 'r')) f += 'u';
  return f;
}
const ROTADD = { far: 0, near: 180, xmin: 90, xmax: 270 };
const rectPt = (uvRect, up, vp) => [uvRect[0] + up * uvRect[2], uvRect[1] + (1 - vp) * uvRect[3]];

// 面板Atas UV 重写：atastitik(局部 x,y) → 归一(rotZ) → flip → uvRect → atlas UV；dalam面 → warna kertas角titik
function retopUV(geo, lx, ly, rotZ, flip, uvRect, sbb, innerUV, faceZ) {
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  const sw = sbb[2] - sbb[0], sh = sbb[3] - sbb[1];
  const map = i => {
    let [up, vp] = normUV(pos.getX(i) / lx, pos.getY(i) / ly, rotZ);
    if (flip.includes('u')) up = 1 - up;
    if (flip.includes('v')) vp = 1 - vp;
    const [x2, y2] = rectPt(uvRect, up, vp);
    uv.setXY(i, (x2 - sbb[0]) / sw, 1 - (y2 - sbb[1]) / sh);
  };
  if (geo.groups && geo.groups.length) {
    // ExtrudeGeometry：group0 = atas/Bawah (z=faceZ 为luar面)，group1 = Sisi (不动)
    const g0 = geo.groups[0];
    for (let i = g0.start; i < g0.start + g0.count; i++) {
      if (Math.abs(pos.getZ(i) - faceZ) < 1e-6) map(i);
      else uv.setXY(i, innerUV[0], innerUV[1]);
    }
  }
  uv.needsUpdate = true;
}

// BoxGeometry (矩形板)：pz 面 = luar面 (remap + 可subdivisi tinggi承载Emboss置换)，nz/Sisi = warna kertas/core kertas
function boxUV(geo, lx, ly, t, rotZ, flip, uvRect, sbb, innerUV) {
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  const sw = sbb[2] - sbb[0], sh = sbb[3] - sbb[1];
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    if (Math.abs(z - t) < 1e-6) {
      let [up, vp] = normUV(pos.getX(i) / lx, pos.getY(i) / ly, rotZ);
      if (flip.includes('u')) up = 1 - up;
      if (flip.includes('v')) vp = 1 - vp;
      const [x2, y2] = rectPt(uvRect, up, vp);
      uv.setXY(i, (x2 - sbb[0]) / sw, 1 - (y2 - sbb[1]) / sh);
    } else uv.setXY(i, innerUV[0], innerUV[1]);
  }
  uv.needsUpdate = true;
  // Material组：px,nx,py,ny Sisi=1(core)；pz,nz=0(face)
  geo.groups.forEach((g, gi) => { g.materialIndex = gi >= 4 ? 0 : 1; });
}

function shapeOf(T, kind, len, out, n) {
  const S = new T.Shape();
  const q = (cx, cy, x, y) => S.quadraticCurveTo(cx, cy, x, y);
  if (kind === 'disc') {
    // regular N polygon cap：attach edge (0,0)-(len,0)，arc luar +y
    const N = n || 24, e = 2 * Math.PI / N;
    const a = len / (2 * Math.tan(Math.PI / N)), Rp = len / (2 * Math.sin(Math.PI / N));
    const cx = len / 2, cy = a, base = Math.atan2(-a, -len / 2);
    S.moveTo(0, 0); S.lineTo(len, 0);
    for (let k = 2; k < N; k++) S.lineTo(cx + Rp * Math.cos(base + k * e), cy + Rp * Math.sin(base + k * e));
    S.closePath();
  } else if (kind === 'dust') {
    const i = Math.min(6, len * 0.12), d5 = Math.min(5, out * 0.3);
    S.moveTo(i * 0.25, 0); S.lineTo(i * 0.6, out - d5); S.lineTo(i * 1.5, out);
    S.lineTo(len - i * 1.5, out); S.lineTo(len - i * 0.6, d5); S.lineTo(len - i * 0.25, 0);
  } else if (kind === 'tuck') {
    const sh = Math.min(5, len * 0.12), rr = Math.min(3.5, out * 0.4);
    S.moveTo(1, 0); S.lineTo(sh, 2); S.lineTo(sh, out - rr); q(sh, out, sh + rr, out);
    S.lineTo(len - sh - rr, out); q(len - sh, out, len - sh, out - rr); S.lineTo(len - sh, 2); S.lineTo(len - 1, 0);
  } else if (kind === 'glue') {
    S.moveTo(0, 0); S.lineTo(len, 0); S.lineTo(len - 5, out); S.lineTo(5, out);
  } else if (kind === 'ear') {
    const rr = Math.min(6, out * 0.4);
    S.moveTo(0.5, 0); S.lineTo(len - 0.5, 0); S.lineTo(len - 0.5, out - rr);
    q(len - 0.5, out, len - 0.5 - rr, out); S.lineTo(2, out); S.lineTo(0.5, out - 2);
  } else if (kind === 'lid') {
    S.moveTo(0, 0); S.lineTo(len, 0); S.lineTo(len, out); S.lineTo(0, out); // tutup persegi (2026-08 sejak，与 2D flapLid sinkron去 1mm inset)
  } else {
    S.moveTo(0, 0); S.lineTo(len, 0); S.lineTo(len, out); S.lineTo(0, out);
  }
  return S;
}

export class Folder {
  constructor(T, sbb, innerUV) {
    this.T = T; this.sbb = sbb; this.innerUV = innerUV || [0.0002, 0.9998];
    this.hasEmb = false; // 由 engine 在 build 前set：Emboss面板subdivisi tinggi
  }
  edgeFrame(lx, ly, edge) {
    if (edge === 'far') return { px: 0, py: ly, rz: 0, len: lx };
    if (edge === 'near') return { px: lx, py: 0, rz: Math.PI, len: lx };
    if (edge === 'xmax') return { px: lx, py: ly, rz: -Math.PI / 2, len: ly };
    return { px: 0, py: 0, rz: Math.PI / 2, len: ly }; // xmin
  }
  panelMesh(kind, len, out, rotZ, flip, uvRect) {
    const T = this.T, t = this._t;
    let geo;
    if (kind === 'rect') {
      // Emboss时subdivisi tinggi (Atas承载置换)；段数mengikuti面板Ukuran
      const seg = this.hasEmb ? Math.max(40, Math.min(240, Math.round(len * 2.2))) : 1;
      const segY = this.hasEmb ? Math.max(40, Math.min(240, Math.round(out * 2.2))) : 1;
      geo = new T.BoxGeometry(len, out, t, seg, segY, 1);
      geo.translate(len / 2, out / 2, t / 2);
      boxUV(geo, len, out, t, rotZ, flip, uvRect, this.sbb, this.innerUV);
    } else {
      geo = new T.ExtrudeGeometry(shapeOf(T, kind, len, out, this._shapeN), { depth: t, bevelEnabled: false, curveSegments: 6 });
      retopUV(geo, len, out, rotZ, flip, uvRect, this.sbb, this.innerUV, t);
    }
    const m = new T.Mesh(geo, [this.faceMat, this.coreMat]);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  buildNode(parentGroup, parentDims, spec, depth, pc, rotZ) {
    const T = this.T;
    if (depth === 0) {
      const rz = spec.uvRot || 0;
      const rootMesh = this.panelMesh('rect', spec.lx, spec.ly, rz, flipOf(rz, spec.attach), spec.uv);
      rootMesh.userData.panel = { panelId: spec.panelId, role: spec.role, surface: spec.surface, up: spec.up, heroRegion: spec.heroRegion };
      parentGroup.add(rootMesh);
      for (const kid of (spec.kids || [])) this.buildNode(parentGroup, spec, kid, 1, pc, rz);
      return;
    }
    const f = this.edgeFrame(parentDims.lx, parentDims.ly, spec.edge);
    const rz = (rotZ + ROTADD[spec.edge]) % 360;
    const g = new T.Group(); g.position.set(f.px, f.py, 0); g.rotation.z = f.rz;
    const fg = new T.Group(); g.add(fg);
    this._shapeN = spec.n || null;
    const mesh = this.panelMesh(spec.shape || 'rect', f.len, spec.out, rz, flipOf(rz, spec.attach), spec.uv);
    mesh.userData.panel = { panelId: spec.panelId, role: spec.role, surface: spec.surface, up: spec.up, heroRegion: spec.heroRegion };
    this._shapeN = null;
    // 纸层堆叠：副翼类面板沿法向dalam缩，消除合tutup后的共面 z-fighting
    const zoff = { glue: -1.05, dust: -0.62, ear: -0.62, tuck: -0.55 }[spec.shape] || 0;
    if (zoff) mesh.position.z = zoff * this._t;
    fg.add(mesh);
    parentGroup.add(g);
    this.nodes.push({ fg, depth, angle: deg(spec.angle == null ? 90 : spec.angle), sign: pc.sign });
    const dims = { lx: f.len, ly: spec.out };
    for (const kid of (spec.kids || [])) this.buildNode(fg, dims, kid, depth + 1, pc, rz);
  }

  build(pieces, t, faceMat, coreMat) {
    const T = this.T;
    this._t = t; this.faceMat = faceMat; this.coreMat = coreMat;
    this.nodes = [];
    const root = new T.Group();
    for (const pc of pieces) {
      const pg = new T.Group();
      pg.rotation.x = -Math.PI / 2;           // bentang XY → lantai，+z → atas dunia
      pg.position.set(0, 0.5, 0);
      pc.pg = pg;
      const pv = new T.Group();
      pv.position.set(pc.off[0], 0, pc.off[1]);
      pv.add(pg); pc.pivot = pv;
      this.buildNode(pg, null, pc.tree, 0, pc, 0);
      root.add(pv);
    }
    this.maxDepth = Math.max(1, ...this.nodes.map(n => n.depth));
    return root;
  }

  applyFold(pieces, fold) {
    const k = clamp(fold / 100, 0, 1);
    const hasAsm = (pieces || []).some(pc => pc.asm);
    const ss = v => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
    const kF = hasAsm ? clamp(k / 0.68, 0, 1) : k;
    const kA = hasAsm ? clamp((k - 0.7) / 0.3, 0, 1) : 0;
    const ke = ss(kF);
    // 翻件 (flip)：一律向warna kertas面折叠 (sign=-1)的Tipe box折完后盒体挂在幅面下方，
    // 绕世界 x 轴整体翻 180° 立regular——与 rte 的 stand 同生态位；窗口避开折叠与装配末段
    const flipWin = hasAsm ? [0.7, 0.85] : [0.85, 1];
    const kFlip = ss(clamp((k - flipWin[0]) / (flipWin[1] - flipWin[0]), 0, 1));
    const D = this.maxDepth || 1;
    for (const n of this.nodes) {
      const kd = clamp(kF * D - (D - n.depth), 0, 1);
      const e = kd * kd * (3 - 2 * kd);
      n.fg.rotation.x = n.sign * e * n.angle;
    }
    for (const pc of (pieces || [])) {
      // 升力：折叠期把幅面抬离lantai (盒体下垂不穿地)，翻件/装配阶段收回
      const liftK = pc.flip ? ke * (1 - kFlip) : pc.asm && pc.sign < 0 ? ke * (1 - kA) : ke;
      pc.pg.position.y = 0.5 + (pc.sign < 0 ? liftK * (pc.lift || 0) : 0);
      // 翻件 (flip)：绕世界 x 轴把下垂盒体转regular——= pg.rotation.x 从 -π/2 连续转到 +π/2，
      // 等效印刷面朝下折sejak (real 折叠物理：对Dinding samping板朝向相反)，不做 y 轴翻件 (会把墙板Teks转反)
      pc.pg.rotation.x = -Math.PI / 2 + (pc.flip ? Math.PI * kFlip : 0);
      const pv = pc.pivot; if (!pv) continue;
      // 翻件绕 x 轴后世界 z 足迹平移 ly，补回lama位
      pv.position.set(pc.off[0], 0, pc.off[1] - (pc.flip ? pc.tree.ly * kFlip : 0)); pv.rotation.set(0, 0, 0);
      if (pc.stand) {
        const kS2 = ss(clamp((k - 0.85) / 0.15, 0, 1));
        pv.rotation.x = Math.PI / 2 * kS2;
      }
      if (!pc.asm || kA <= 0) continue;
      const { L, W, H, t } = this._dims;
      // 双件套合：tutup/sleeve与盒体共面处留 0.35mm 装配间隙
      if (pc.asm.type === 'lid') {
        const hh = pc.asm.hh, L2 = pc.asm.lx, W2 = pc.asm.ly;
        const kH = ss(kA / 0.6), kV = ss((kA - 0.6) / 0.4);
        const tx = -(L2 - L) / 2;
        const hover = H + hh + 16;
        // sign=-1 折叠后tutup口已朝下，直接平移到盒体上方落下 (无翻面：z 足迹不再镜像，
        // tutup z area间 [z−W2, z]，居中对准盒体 [−W,0] 需 z=(W2−W)/2)
        pv.position.x = pc.off[0] + (tx - pc.off[0]) * kH;
        pv.position.z = ((W2 - W) / 2) * kH;
        pv.position.y = hover * kH - (hover - (H + t - 0.05)) * kV;
      } else if (pc.asm.type === 'drawer') {
        const kS = ss(kA);
        const target = pc.asm.d - L * 0.15;               // state akhir留 15% keluar
        pv.position.x = pc.off[0] + (target - pc.off[0]) * kS;
        pv.position.y = (t + 0.55) * kS;
        pv.position.z = -(t + 0.35) * kS;
      }
    }
  }
}

// —— Tipe box折叠树 (与 2D gen* reuseUkuran公式；uv = 2D dieline坐标矩形，attach = 2D 中挂于母板哪侧) ——
export function importedSvgPieces(tpl) {
  const imp = IMPORTED_DIELINES[tpl];
  if (!imp) return null;
  const vb = imp.viewBox || [0, 0, 120, 120];
  const w = Math.max(20, vb[2] || 120), h = Math.max(20, vb[3] || 120);
  const panels = (imp.panels?.length ? imp.panels : (imp.fills || []).map((pts, i) => ({ pts, panelId: i === 0 ? 'front' : `svg-panel-${i + 1}`, role: i === 0 ? 'hero' : 'design' }))).filter(p => p.pts?.length >= 3);
  if (!panels.length) return [{ tree: { lx: w, ly: h, uv: [vb[0], vb[1], w, h], panelId: tpl, role: 'hero', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [0, 0], source: 'imported-svg' }];
  
  const bboxOf = pts => pts.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]);
  
  // Wrap each panel into tree structure for Folder.build()
  return panels.map((p, i) => {
    const b = bboxOf(p.pts);
    const lx = Math.max(8, b[2] - b[0]), ly = Math.max(8, b[3] - b[1]);
    return {
      tree: {
        lx, ly,
        uv: [b[0], b[1], lx, ly],
        panelId: p.panelId || (i === 0 ? 'front' : `svg-panel-${i + 1}`),
        role: p.role || (i === 0 ? 'hero' : 'design'),
        surface: p.surface || 'outside',
        up: p.up || 'top'
      },
      sign: -1,
      lift: 0,
      off: [i * (lx + 18), 0],
      source: 'imported-svg'
    };
  });
}

export function makePieces(tpl, L, W, H, t, glue) {
  const nativeTpl = ['rte','ste','gable-box','window-carton','auto-lock-bottom','pillow-box','pizza-box','shipping-box','sleeve-tray','fries-box','hanger-box','book-box','burger-clamshell','mailer','cyl','hex','lidbase','drawer'];
  if (IMPORTED_DIELINES[tpl] && !nativeTpl.includes(tpl)) return importedSvgPieces(tpl);
  if (tpl === 'pillow-box') {
    const bodyH = H + t;
    return [
      { tree: { lx: L, ly: bodyH, uv: [0, 0, L, bodyH], panelId: 'front', role: 'hero', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [0, 0] },
      { tree: { lx: L, ly: bodyH, uv: [L, 0, L, bodyH], panelId: 'back', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [L+12, 0] }
    ];
  }
  if (tpl === 'pizza-box') {
    return [
      { tree: { lx: L, ly: W, uv: [0, H, L, W], panelId: 'pizza-bottom', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [0, 0] },
      { tree: { lx: L, ly: W, uv: [0, H+W+H, L, W], panelId: 'pizza-lid', role: 'hero', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [L+16, 0] },
      { tree: { lx: L, ly: H, uv: [0, 0, L, H], panelId: 'pizza-back', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [2*(L+16), 0] },
      { tree: { lx: L, ly: H, uv: [0, H+W, L, H], panelId: 'pizza-front', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [3*(L+16), 0] },
      { tree: { lx: H, ly: W, uv: [-H, H, H, W], panelId: 'pizza-left-wall', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [4*(L+16), 0] },
      { tree: { lx: H, ly: W, uv: [L, H, H, W], panelId: 'pizza-right-wall', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [5*(L+16), 0] }
    ];
  }
  if (tpl === 'shipping-box') {
    return [
      { tree: { lx: L, ly: H, uv: [0, 0, L, H], panelId: 'rsc-front', role: 'hero', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [0, 0] },
      { tree: { lx: W, ly: H, uv: [L, 0, W, H], panelId: 'rsc-side-left', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [L+12, 0] },
      { tree: { lx: L, ly: H, uv: [L+W, 0, L, H], panelId: 'rsc-back', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [L+W+24, 0] },
      { tree: { lx: W, ly: H, uv: [2*L+W, 0, W, H], panelId: 'rsc-side-right', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [2*L+W+36, 0] }
    ];
  }
  if (tpl === 'fries-box') {
    const frontH = Math.max(H * 0.62, H - 32);
    const sideW = W;
    return [
      { tree: { lx: L, ly: frontH, uv: [0, H-frontH, L, frontH], panelId: 'fries-front', role: 'hero', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [0, 0] },
      { tree: { lx: L, ly: H, uv: [L+sideW, 0, L, H], panelId: 'fries-back', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [L+16, 0] },
      { tree: { lx: sideW, ly: H, uv: [L, H-frontH, sideW, H], panelId: 'fries-left', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [2*(L+16), 0] },
      { tree: { lx: sideW, ly: H, uv: [L+sideW+L, 0, sideW, H], panelId: 'fries-right', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [3*(L+16), 0] },
      { tree: { lx: L, ly: W, uv: [L+sideW, H, L, W], panelId: 'fries-bottom', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [4*(L+16), 0] }
    ];
  }
  if (tpl === 'sleeve-tray') {
    return [
      { tree: { lx: L, ly: W, uv: [0, 0, L, W], panelId: 'tray-bottom', role: 'design', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [0, 0] },
      { tree: { lx: L + 6, ly: W + 2*t + 2, uv: [L+20, 0, L+6, W+2*t+2], panelId: 'sleeve-top', role: 'hero', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [L+32, 0] }
    ];
  }
  if (tpl === 'hanger-box') tpl = 'ste';
  if (tpl === 'book-box') {
    const hh = Math.max(14, H * 0.45), L2 = L + 2*t + 1, W2 = W + 2*t + 1;
    const ox = (2*H + L) + 28;
    return [
      { tree: { lx: L, ly: W, uv: [H, H, L, W], panelId: 'book-base-bottom', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [0, 0] },
      { tree: { lx: L2, ly: W2, uv: [ox + hh, hh, L2, W2], panelId: 'book-lid-top', role: 'hero', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [L + W + 28, 0] }
    ];
  }
  if (tpl === 'burger-clamshell') {
    const wall = Math.min(32, Math.max(18, H*0.45));
    return [
      { tree: { lx: L, ly: W, uv: [0, 0, L, W], panelId: 'clamshell-lid', role: 'hero', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [0, 0] },
      { tree: { lx: L, ly: W, uv: [0, wall+H, L, W], panelId: 'clamshell-bottom', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [L+wall+16, 0] },
      { tree: { lx: L, ly: wall, uv: [0, wall, L, wall], panelId: 'clamshell-back', surface: 'outside', up: 'top' }, sign: -1, lift: 0, off: [2*(L+wall+16), 0] }
    ];
  }
  if (tpl === 'gable-box' || tpl === 'window-carton' || tpl === 'auto-lock-bottom') tpl = 'ste';
  const dh = Math.min(W * 0.75, 32), tk = Math.min(16, W * 0.55);
  if (tpl === 'rte' || tpl === 'ste') {
    const bh = H + t, lidH = W + t;
    const xs1 = W + t, xs2 = W + t + L + t, xs3 = xs2 + W + t;
    const kids = [
      {
        edge: 'xmin', out: W, uv: [0, 0, W + t, bh], attach: 'l', kids: [
          { edge: 'xmax', out: dh, shape: 'dust', uv: [0, bh, W + t, dh], attach: 'b' },
          { edge: 'xmin', out: dh, shape: 'dust', uv: [0, -dh, W + t, dh], attach: 't' },
          { edge: 'far', out: glue, shape: 'glue', uv: [-glue, 0, glue, bh], attach: 'l' }]
      },
      {
        edge: 'xmax', out: W, uv: [xs2, 0, W + t, bh], attach: 'r', kids: [
          { edge: 'xmin', out: dh, shape: 'dust', uv: [xs2, bh, W + t, dh], attach: 'b' },
          { edge: 'xmax', out: dh, shape: 'dust', uv: [xs2, -dh, W + t, dh], attach: 't' },
          {
            edge: 'far', out: L, uv: [xs3, 0, L + 2 * t, bh], attach: 'r', kids: [
              ...(tpl === 'rte' ? [{
                edge: 'xmin', out: W, shape: 'lid', uv: [xs3, -lidH, L + 2 * t, lidH], attach: 't', kids: [
                  { edge: 'far', out: tk, shape: 'tuck', angle: 100, uv: [xs3, -lidH - tk, L + 2 * t, tk], attach: 't' }]
              }] : [])
            ]
          }]
      },
      ...(tpl === 'ste' ? [{
        edge: 'far', out: W, shape: 'lid', uv: [xs1, -lidH, L + t, lidH], attach: 't', kids: [
          { edge: 'far', out: tk, shape: 'tuck', angle: 100, uv: [xs1, -lidH - tk, L + t, tk], attach: 't' }]
      }] : []),
      {
        edge: 'near', out: W, shape: 'lid', uv: [xs1, bh, L + t, lidH], attach: 'b', kids: [
          { edge: 'far', out: tk, shape: 'tuck', angle: 100, uv: [xs1, bh + lidH, L + t, tk], attach: 'b' }]
      }
    ];
    return [{ tree: { lx: L, ly: H, uv: [xs1, 0, L + t, bh], panelId: 'front', role: 'hero', surface: 'outside', up: 'top', kids }, sign: -1, lift: W, off: [0, 0], stand: true }];
  }
  if (tpl === 'mailer') {
    const tk2 = Math.min(H * 0.7, 28), dw = Math.min(H * 0.8, 26);
    const Lc = L + 2 * t, Wl = W + 3 * t, Hb = H + t, Wb = W + t, Hf = H, Sw = H + t;
    const y1 = Wl, y2 = y1 + Hb, y3 = y2 + Wb;
    const eh = Math.min(Hf - 1, Sw * 0.95);
    const tree = {
      lx: L, ly: W, uv: [0, y2, Lc, Wb], kids: [
        {
          edge: 'far', out: H, uv: [0, y1, Lc, Hb], attach: 't', kids: [{
            edge: 'far', out: W, uv: [0, 0, Lc, Wl], panelId: 'mailer-lid', role: 'hero', surface: 'outside', up: 'top', attach: 't', kids: [
              { edge: 'far', out: tk2, shape: 'tuck', angle: 100, uv: [0, -tk2, Lc, tk2], attach: 't' },
              { edge: 'xmin', out: dw, shape: 'dust', uv: [-dw, 0, dw, y1], attach: 'l' },
              { edge: 'xmax', out: dw, shape: 'dust', uv: [Lc, 0, dw, y1], attach: 'r' }]
          }]
        },
        { edge: 'near', out: H, uv: [0, y3, Lc, Hf], attach: 'b' },
        {
          edge: 'xmin', out: H, uv: [-Sw, y2, Sw, Wb], attach: 'l', kids: [
            { edge: 'xmin', out: Math.min(H * 0.9, L * 0.45), shape: 'ear', uv: [-Sw, y3, Sw, eh], attach: 'b' }]
        },
        {
          edge: 'xmax', out: H, uv: [Lc, y2, Sw, Wb], attach: 'r', kids: [
            { edge: 'xmax', out: Math.min(H * 0.9, L * 0.45), shape: 'ear', uv: [Lc, y3, Sw, eh], attach: 'b' }]
        }
      ]
    };
    return [{ tree, sign: -1, lift: H, off: [0, 0], flip: 1 }];
  }
  const tray = (Lt, Wt, hh, ox) => {
    const eo = Math.min(hh, Wt * 0.85);
    const cx1 = ox + hh, cx2 = cx1 + Lt, cy2 = hh + Wt;
    return {
      lx: Lt, ly: Wt, uv: [cx1, hh, Lt, Wt], kids: [
        {
          edge: 'far', out: hh, uv: [cx1, cy2, Lt, hh], attach: 'b', kids: [
            { edge: 'xmin', out: eo, shape: 'ear', uv: [ox, cy2, hh, hh], attach: 'l' },
            { edge: 'xmax', out: eo, shape: 'ear', uv: [cx2, cy2, hh, hh], attach: 'r' }]
        },
        {
          edge: 'near', out: hh, uv: [cx1, 0, Lt, hh], attach: 't', kids: [
            { edge: 'xmin', out: eo, shape: 'ear', uv: [ox, 0, hh, hh], attach: 'l' },
            { edge: 'xmax', out: eo, shape: 'ear', uv: [cx2, 0, hh, hh], attach: 'r' }]
        },
        { edge: 'xmin', out: hh, uv: [ox, hh, hh, Wt], attach: 'l' },
        { edge: 'xmax', out: hh, uv: [cx2, hh, hh, Wt], attach: 'r' }
      ]
    };
  };
  if (tpl === 'lidbase') {
    const hh2 = Math.max(14, H * 0.45);
    const L2 = L + 2 * t + 1, W2 = W + 2 * t + 1, D = L + 2 * H + 45;
    const ox2 = 2 * H + L + 28;
    return [
      { tree: tray(L, W, H, 0), sign: -1, lift: H, off: [0, 0], flip: 1 },
      { tree: { ...tray(L2, W2, hh2, ox2), panelId: 'lid-top', role: 'hero', surface: 'outside', up: 'top' }, sign: -1, lift: hh2, off: [D, 0], asm: { type: 'lid', hh: hh2, lx: L2, ly: W2 } }
    ];
  }
  // tube box (silinder 24 sisi / 六边形 6 sisi)：p0 根段 → xmax 出 p1 → far 逐段卷合；regular N 边形atas/Tutup bawah
  if (tpl === 'cyl' || tpl === 'hex') {
    const N = tpl === 'cyl' ? 24 : 6;
    const wSeg = tpl === 'cyl' ? Math.PI * L / 24 : W;
    const bh = H + t;
    const { a, Rp, h } = discBbox(N, wSeg);
    let chain = null;
    for (let i = N - 1; i >= 1; i--) {
      chain = { edge: i === 1 ? 'xmax' : 'far', out: wSeg, angle: 360 / N, uv: [i * wSeg, 0, wSeg, bh], attach: 'r', kids: chain ? [chain] : [] };
    }
    const kids = [
      chain,
      { edge: 'far', out: h, shape: 'disc', n: N, uv: [wSeg / 2 - Rp, -(a + Rp), 2 * Rp, a + Rp], attach: 't' },
      { edge: 'near', out: h, shape: 'disc', n: N, uv: [wSeg / 2 - Rp, bh, 2 * Rp, a + Rp], attach: 'b' }
    ].filter(Boolean);
    return [{ tree: { lx: wSeg, ly: bh, uv: [0, 0, wSeg, bh], panelId: 'tube-body', role: 'hero', surface: 'outside', up: 'top', heroRegion: N === 24 ? [9 / 24, 0, 6 / 24, 1] : [3 / 6, 0, 1 / 6, 1], kids }, sign: -1, lift: Rp, off: [0, 0], stand: true }];
  }
  if (tpl !== 'drawer') throw new Error(`Tipe box tidak dikenal: ${tpl}; lengkapi kontrak sinkron Struktur dan 3D dulu`);
  // drawer：inner boxtray + sleeve (root uvRot=90：3D lx 沿 2D band 纵向)
  const D2 = L + 2 * H + 45;
  const oxS = 2 * H + L + 28;
  const sxs1 = oxS + H + 2 * t, sxs2 = sxs1 + W + 3 * t, sxs3 = sxs2 + H + 3 * t;
  const band = L + 2;
  const sleeve = {
    lx: L, ly: W + 2 * t, uvRot: 90, uv: [sxs1, 0, W + 3 * t, band], panelId: 'sleeve-top', role: 'hero', surface: 'outside', up: 'left', kids: [{
      edge: 'far', out: H + 2 * t, uv: [oxS, 0, H + 2 * t, band], attach: 'l', kids: [{
        edge: 'far', out: W + 3 * t, uv: [sxs3, 0, W + 4 * t, band], attach: 'l', kids: [{
          edge: 'far', out: H + 3 * t, uv: [sxs2, 0, H + 3 * t, band], attach: 'l', kids: [
            { edge: 'far', out: 12, shape: 'glue', uv: [oxS - 12, 0, 12, band], attach: 'l' }]
        }]
      }]
    }]
  };
  return [
    { tree: tray(L, W, H, 0), sign: 1, lift: 0, off: [0, 0], asm: { type: 'drawer', d: D2 } },
    { tree: sleeve, sign: -1, lift: H, off: [D2, 0] }
  ];
}
