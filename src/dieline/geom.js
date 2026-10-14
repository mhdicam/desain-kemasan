// evaluasi geometri：dielinegeometri是全系统sumber data utama。
// 2D view, 3D mesh, PDF 导出semua diturunkan fungsi ini；berdasarkan parameter key cache。
// edit manual存为override stream (ovr pergeseran node, typeOvr ganti tipe garis)，在template求值replay di hasil。
import { genTuck, genGableBox, genWindowCarton, genAutoLockBottom, genPillowBox, genPizzaBox, genRSCBox, genSleeveTray, genPaperCup, genCupSleeve, genFriesBox, genBottleLabel, genBellyBand, genHangtag, genStickerLabelRoll, genHangerBox, genBookBox, genStandupPouch, genFlatSachet, genPillowPack, genSpoutPouch, genBurgerClamshell, genMailer, genTray, genSleeve, genTube } from './templates.js';
import { IMPORTED_DIELINES } from './importedDielines.js';

let _key = null, _val = null;

export function geomOf(s, t) {
  const key = [s.tpl, s.L, s.W, s.H, t, s.bleed, s.glue].join('|') + '|' + JSON.stringify(s.ovr || {}) + JSON.stringify(s.typeOvr || {});
  if (_key === key) return _val;
  const r2 = v => Math.round(v * 100) / 100;
  const o = { segs: [], fills: [], panels: [], safes: [], labels: [], dims: [], arcRuns: [], sbb: [1e9, 1e9, -1e9, -1e9], vbb: [1e9, 1e9, -1e9, -1e9] };
  const tr = (pts, bb) => { for (const p of pts) { if (p[0] < bb[0]) bb[0] = p[0]; if (p[1] < bb[1]) bb[1] = p[1]; if (p[0] > bb[2]) bb[2] = p[0]; if (p[1] > bb[3]) bb[3] = p[1]; } };
  const cut = pts => { tr(pts, o.sbb); tr(pts, o.vbb); o.segs.push({ t: 'cut', pts }); };
  const crease = pts => { tr(pts, o.sbb); tr(pts, o.vbb); o.segs.push({ t: 'crease', pts }); };
  const seal = pts => { tr(pts, o.sbb); tr(pts, o.vbb); o.segs.push({ t: 'seal', pts }); };
  const glueLine = pts => { tr(pts, o.sbb); tr(pts, o.vbb); o.segs.push({ t: 'glue', pts }); };
  const perf = pts => { tr(pts, o.sbb); tr(pts, o.vbb); o.segs.push({ t: 'perf', pts }); };
  const fill = pts => { tr(pts, o.sbb); tr(pts, o.vbb); o.fills.push(pts); };
  // panel 用于“fill panel + area desain”dibuat bersamaan；region 仅daftararea desain，
  // 供已经由template写入 fills 的主体板reuse，hindari为了isi semantik panelfill duplikat。
  const region = (pts, meta) => { tr(pts, o.sbb); tr(pts, o.vbb); o.panels.push({ role: 'design', surface: 'outside', ...meta, pts }); };
  const panel = (pts, meta) => { fill(pts); region(pts, meta); };
  const safeR = (x, y, w, h, m) => { m = m ?? Math.min(3, w / 4, h / 4); o.safes.push([x + m, y + m, w - 2 * m, h - 2 * m]); };
  const label = (x, y, name, fs) => o.labels.push({ x: r2(x), y: r2(y + 1.4), name, fs: fs || 4 });
  const dimH = (x1, x2, y, txt) => { o.dims.push({ gtf: 'translate(' + r2(x1) + ' ' + r2(y) + ')', len: r2(x2 - x1), mid: r2((x2 - x1) / 2), label: txt }); tr([[x1, y - 5], [x2, y + 3]], o.vbb); };
  const dimV = (y1, y2, x, txt) => { o.dims.push({ gtf: 'translate(' + r2(x) + ' ' + r2(y2) + ') rotate(-90)', len: r2(y2 - y1), mid: r2((y2 - y1) / 2), label: txt }); tr([[x - 5, y1], [x + 3, y2]], o.vbb); };
  // sampling bezier kuadratik；带 tag 的调用记录为segmen arc (arcRuns 圆弧metadata)
  const q = (p0, pc, p1, tag, n) => {
    n = n || 5; const out = [];
    for (let i = 0; i <= n; i++) { const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c2 = u * u; out.push([a * p0[0] + b * pc[0] + c2 * p1[0], a * p0[1] + b * pc[1] + c2 * p1[1]]); }
    if (tag) o.arcRuns.push({ pts: out, p0, pc, p1 });
    return out;
  };
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const fmt = v => Math.round(v * 10) / 10;
  const ctx = { cut, crease, seal, glueLine, perf, fill, panel, region, safeR, label, dimH, dimV, q, rect, fmt };

  if (IMPORTED_DIELINES[s.tpl]) {
    const imp = IMPORTED_DIELINES[s.tpl];
    (imp.fills || []).forEach(fill);
    (imp.layers.glue || []).forEach(glueLine);
    (imp.layers.cut || []).forEach(cut);
    (imp.layers.fold || imp.layers.crease || []).forEach(crease);
    (imp.layers.perf || []).forEach(perf);
    (imp.layers.seal || []).forEach(seal);
    (imp.layers.safe || []).forEach(pts => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); o.safes.push([Math.min(...xs), Math.min(...ys), Math.max(...xs)-Math.min(...xs), Math.max(...ys)-Math.min(...ys)]); tr(pts, o.sbb); tr(pts, o.vbb); });
    (imp.panels || []).forEach(p => { region(p.pts, { panelId: p.panelId, role: p.role, surface: p.surface || 'outside', up: p.up || 'top' }); });
    if (!o.panels.length) (imp.fills || []).forEach((pts, i) => { if (pts.length >= 3) region(pts, { panelId: i === 0 ? 'front' : `panel-${i + 1}`, role: i === 0 ? 'hero' : 'design', surface: 'outside', up: 'top' }); });
    label((imp.viewBox?.[2] || 0) / 2, 14, `${s.tpl} · SVG import`, 4);
  } else if (s.tpl === 'rte' || s.tpl === 'ste') genTuck(ctx, s, t, s.tpl === 'rte');
  else if (s.tpl === 'gable-box') genGableBox(ctx, s, t);
  else if (s.tpl === 'window-carton') genWindowCarton(ctx, s, t);
  else if (s.tpl === 'auto-lock-bottom') genAutoLockBottom(ctx, s, t);
  else if (s.tpl === 'pillow-box') genPillowBox(ctx, s, t);
  else if (s.tpl === 'pizza-box') genPizzaBox(ctx, s, t);
  else if (s.tpl === 'shipping-box') genRSCBox(ctx, s, t);
  else if (s.tpl === 'sleeve-tray') genSleeveTray(ctx, s, t);
  else if (s.tpl === 'paper-cup-packaging') genPaperCup(ctx, s, t);
  else if (s.tpl === 'cup-sleeve') genCupSleeve(ctx, s, t);
  else if (s.tpl === 'fries-box') genFriesBox(ctx, s, t);
  else if (s.tpl === 'bottle-label-packaging') genBottleLabel(ctx, s, t);
  else if (s.tpl === 'belly-band') genBellyBand(ctx, s, t);
  else if (s.tpl === 'hangtag') genHangtag(ctx, s, t);
  else if (s.tpl === 'sticker-label-roll') genStickerLabelRoll(ctx, s, t);
  else if (s.tpl === 'hanger-box') genHangerBox(ctx, s, t);
  else if (s.tpl === 'book-box') genBookBox(ctx, s, t);
  else if (s.tpl === 'standup-pouch') genStandupPouch(ctx, s, t);
  else if (s.tpl === 'flat-sachet') genFlatSachet(ctx, s, t);
  else if (s.tpl === 'pillow-pack') genPillowPack(ctx, s, t);
  else if (s.tpl === 'spout-pouch') genSpoutPouch(ctx, s, t);
  else if (s.tpl === 'burger-clamshell') genBurgerClamshell(ctx, s, t);
  else if (s.tpl === 'mailer') genMailer(ctx, s, t);
  else if (s.tpl === 'cyl') genTube(ctx, s, t, 24, Math.PI * s.L / 24);
  else if (s.tpl === 'hex') genTube(ctx, s, t, 6, s.W);
  else if (s.tpl === 'lidbase') {
    const w1 = genTray(ctx, s.L, s.W, s.H, 0, 'Base box', { prefix: 'base', centerId: 'base-bottom' });
    genTray(ctx, s.L + 2 * t + 1, s.W + 2 * t + 1, Math.max(14, s.H * 0.45), w1 + 28, 'Tutup box (+1mm/sisi allowance)', { prefix: 'lid', centerId: 'lid-top', centerMeta: { role: 'hero', surface: 'outside', up: 'top' } });
  } else if (s.tpl === 'drawer') {
    const w1 = genTray(ctx, s.L, s.W, s.H, 0, 'Tray dalam (drawer)', { prefix: 'drawer', centerId: 'drawer-bottom' });
    genSleeve(ctx, s, t, w1 + 28);
  }

  // override stream重放：ganti tipe garis, pergeseran node (位移就地修改，tetaptitikobjekreferensi——arcRuns 圆弧restorebergantungreferensi同一性)
  Object.entries(s.typeOvr || {}).forEach(pair => { const sg = o.segs[+pair[0]]; if (sg) sg.t = pair[1]; });
  Object.entries(s.ovr || {}).forEach(pair => {
    const ix = pair[0].split('-'), sg = o.segs[+ix[0]];
    if (sg && sg.pts[+ix[1]]) { const q2 = sg.pts[+ix[1]]; q2[0] += pair[1][0]; q2[1] += pair[1][1]; }
  });
  const toPath = ty => o.segs.filter(g => g.t === ty).map(g => 'M' + g.pts.map(p => r2(p[0]) + ' ' + r2(p[1])).join('L')).join(' ');
  o.cutPath = toPath('cut'); o.creasePath = toPath('crease'); o.sealPath = toPath('seal'); o.gluePath = toPath('glue'); o.perfPath = toPath('perf');
  o.fillPath = o.fills.map(pts => 'M' + pts.map(p => r2(p[0]) + ' ' + r2(p[1])).join('L') + 'Z').join(' ');
  o.safePath = o.safes.map(r => 'M' + r2(r[0]) + ' ' + r2(r[1]) + 'h' + r2(r[2]) + 'v' + r2(r[3]) + 'h' + r2(-r[2]) + 'Z').join(' ');
  const len = ty => o.segs.filter(g => g.t === ty).reduce((a, g) => { let l = 0; for (let i = 0; i < g.pts.length - 1; i++) l += Math.hypot(g.pts[i + 1][0] - g.pts[i][0], g.pts[i + 1][1] - g.pts[i][1]); return a + l; }, 0);
  o.cutLen = len('cut'); o.creaseLen = len('crease'); o.glueLen = len('glue');
  o.cutN = o.segs.filter(g => g.t === 'cut').length; o.creaseN = o.segs.filter(g => g.t === 'crease').length; o.sealN = o.segs.filter(g => g.t === 'seal').length; o.glueN = o.segs.filter(g => g.t === 'glue').length; o.perfN = o.segs.filter(g => g.t === 'perf').length;
  _key = key; _val = o; return o;
}

export function creaseSegsOf(g) {
  const out = [];
  g.segs.forEach(sg => { if (sg.t !== 'crease') return; for (let i = 0; i < sg.pts.length - 1; i++) out.push([sg.pts[i], sg.pts[i + 1]]); });
  return out;
}
