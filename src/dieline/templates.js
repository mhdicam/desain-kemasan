// Library Box与parameter化dielinegenerate —— 移植自lama型 (genTuck/genMailer/genTray/genSleeve)
// 纯函数风格：f(params, board) → segmen/fill/labelkumpulan，geometriselalu memakai mm 为unit dasar

export const MATS = [
  { id: 'art200', name: 'Art paper tipis 200g', t: 0.22, bleed: 3, note: 'Karton warna ringan/laminasi' },
  { id: 'sbs350', name: 'Ivory board 350g', t: 0.45, bleed: 3, note: 'Folding carton' },
  { id: 'sbs400', name: 'Ivory board 400g', t: 0.5, bleed: 3, note: 'Folding carton' },
  { id: 'art300', name: 'Art paper 300g', t: 0.35, bleed: 3, note: 'Laminated carton/box' },
  { id: 'kraft350', name: 'Kraft 350g', t: 0.42, bleed: 3, note: 'Eco polos' },
  { id: 'fluteF', name: 'Corrugated F flute', t: 0.8, bleed: 5, note: 'Corrugated premium' },
  { id: 'fluteE', name: 'Corrugated E flute', t: 1.5, bleed: 5, note: 'Umum untuk mailer box' },
  { id: 'fluteB', name: 'Corrugated B flute', t: 3.0, bleed: 5, note: 'Outer box e-commerce' }
];

export const TPLS = [
  { id: 'rte', code: 'RTE', name: 'Reverse tuck end', sub: 'Folding carton' },
  { id: 'ste', code: 'STE', name: 'Straight tuck end', sub: 'Folding carton' },
  { id: 'gable-box', code: 'GBL', name: 'Gable Box', sub: 'Folding carton · handle' },
  { id: 'window-carton', code: 'WIN', name: 'Window Carton', sub: 'Folding carton · window' },
  { id: 'auto-lock-bottom', code: 'ALB', name: 'Auto Lock Bottom Box', sub: 'Folding carton · auto lock' },
  { id: 'pillow-box', code: 'PLW', name: 'Pillow Box', sub: 'Folding carton · curved ends' },
  { id: 'pizza-box', code: 'PZA', name: 'Pizza Box', sub: 'Corrugated · food tray lid' },
  { id: 'shipping-box', code: 'SHP', name: 'Shipping Box RSC', sub: 'Corrugated · RSC' },
  { id: 'sleeve-tray', code: 'SLV', name: 'Sleeve + Tray', sub: 'Tray geser + sleeve' },
  { id: 'paper-cup-packaging', code: 'CUP', name: 'Paper Cup', sub: 'Wrap cup kerucut' },
  { id: 'cup-sleeve', code: 'CSL', name: 'Cup Sleeve', sub: 'Wrap sleeve cup' },
  { id: 'fries-box', code: 'FRY', name: 'Fries Box', sub: 'Open top food carton' },
  { id: 'bottle-label-packaging', code: 'LBL', name: 'Bottle Label', sub: 'Label wrap botol' },
  { id: 'belly-band', code: 'BND', name: 'Belly Band', sub: 'Band wrap produk' },
  { id: 'hangtag', code: 'HTG', name: 'Hangtag', sub: 'Tag gantung' },
  { id: 'sticker-label-roll', code: 'STL', name: 'Sticker Label Roll', sub: 'Label roll' },
  { id: 'mailer', code: 'MLR', name: 'Mailer box', sub: 'Corrugated · tanpa lem' },
  { id: 'lidbase', code: 'TDG', name: 'Lid and base', sub: 'Dua bagian' },
  { id: 'drawer', code: 'DRW', name: 'Drawer box', sub: 'Tray dalam + sleeve' },
  { id: 'hanger-box', code: 'HNG', name: 'Hanger Box', sub: 'Folding carton · euro slot' },
  { id: 'book-box', code: 'BKB', name: 'Book Style Box', sub: 'Rigid · magnet' },
  { id: 'standup-pouch', code: 'SUP', name: 'Stand Up Pouch', sub: 'Pouch berdiri gusset' },
  { id: 'flat-sachet', code: 'SCH', name: 'Flat Sachet', sub: 'Sachet 4-side seal' },
  { id: 'pillow-pack', code: 'PCK', name: 'Pillow Pack', sub: 'Flow wrap' },
  { id: 'spout-pouch', code: 'SPT', name: 'Spout Pouch', sub: 'Pouch spout' },
  { id: 'burger-clamshell', code: 'BGR', name: 'Burger Clamshell', sub: 'Clamshell hinge' },
  { id: 'cyl', code: 'CYL', name: 'Cylinder box', sub: 'Tube · 24 sisi' },
  { id: 'hex', code: 'HEX', name: 'Hexagon box', sub: 'Hex tube' }
];

// regular N polygon cap的geometriparameter：apothem / luar接圆半径 / Tinggi tutup
export function discBbox(N, len) {
  const a = len / (2 * Math.tan(Math.PI / N));
  const Rp = len / (2 * Math.sin(Math.PI / N));
  return { a, Rp, h: a + Rp };
}

// tube box (silinder 24 sisi / 六边形 6 sisi)：Body silinder N segmen + Flap lem + duaregular N polygon cap
export function genTube(c, s, t, N, wSeg) {
  const bh = s.H + t, bodyW = N * wSeg, g = 12;
  const { a, Rp, h } = discBbox(N, wSeg);
  const heroSpan = N === 24 ? 6 : 1, heroIndex = N === 24 ? Math.floor((N - heroSpan) / 2) : Math.floor(N / 2), body = c.rect(0, 0, bodyW, bh);
  c.fill(body);
  if (N === 24) c.region(body, { panelId: 'tube-body', role: 'hero', surface: 'outside', up: 'top', heroRegion: [heroIndex / N, 0, heroSpan / N, 1], heroBox: [heroIndex * wSeg, 0, (heroIndex + heroSpan) * wSeg, bh] });
  else for (let i = 0; i < N; i++) c.region(c.rect(i * wSeg, 0, wSeg, bh), { panelId: i === heroIndex ? 'tube-body' : `tube-face-${i}`, role: i === heroIndex ? 'hero' : 'design', surface: 'outside', up: 'top', ...(i === heroIndex ? { heroRegion: [heroIndex / N, 0, 1 / N, 1], heroBox: [heroIndex * wSeg, 0, (heroIndex + 1) * wSeg, bh] } : {}) });
  c.label(bodyW / 2, bh / 2, 'Body silinder'); c.safeR(0, 0, bodyW, bh);
  const gp = [[0, 0], [-g, 4], [-g, bh - 4], [0, bh]];
  c.fill(gp); c.cut(gp); c.label(-g / 2, bh / 2, 'Flap lem', 2.8);
  c.crease([[0, 0], [0, bh]]);
  for (let k = 1; k < N; k++) c.crease([[k * wSeg, 0], [k * wSeg, bh]]);
  c.cut([[bodyW, 0], [bodyW, bh]]);
  // atas/Tutup bawah：attach edge为Garis lipat，arc luar为Garis potong
  for (const d of [{ y0: 0, sgn: -1, nm: 'Tutup atas' }, { y0: bh, sgn: 1, nm: 'Tutup bawah' }]) {
    const cx = wSeg / 2, cy = d.y0 + d.sgn * a, e = 2 * Math.PI / N, base = Math.atan2(-d.sgn * a, -wSeg / 2);
    const pts = [];
    for (let k = 0; k < N; k++) pts.push([cx + Rp * Math.cos(base + k * e), cy + Rp * Math.sin(base + k * e)]);
    c.fill(pts);
    c.region(pts, { panelId: d.sgn < 0 ? 'tube-top' : 'tube-bottom', surface: 'outside', up: 'top' });
    c.cut(pts.concat([pts[0]]));
    c.crease([[0, d.y0], [wSeg, d.y0]]);
    c.label(cx, d.y0 + d.sgn * a * 0.55, d.nm, 2.6);
  }
  c.dimH(-g, bodyW, bh + h + 9, '' + c.fmt(bodyW + g));
  c.dimV(0, bh, bodyW + 8, '' + c.fmt(bh));
  c.dimH(0, wSeg, -(h + 8), '' + c.fmt(wSeg) + ' /segmen');
}

// straight tuck/Reverse tuck end：empat panel horizontal + Flap lem + flap selip dua ujung/dust flap
export function genTuck(c, s, t, reverse) {
  const L = s.L, W = s.W, H = s.H, glue = s.glue, bh = H + t;
  const cols = [W + t, L + t, W + t, L + 2 * t];
  const xs = [0]; cols.forEach(w => xs.push(xs[xs.length - 1] + w));
  const names = ['Sisi', 'Depan', 'Sisi', 'Belakang'], panelIds = ['side-left', 'front', 'side-right', 'back'];
  for (let i = 0; i < 4; i++) { const pts = c.rect(xs[i], 0, cols[i], bh); c.fill(pts); c.region(pts, { panelId: panelIds[i], role: i === 1 ? 'hero' : 'design', surface: 'outside', up: 'top' }); c.label(xs[i] + cols[i] / 2, bh / 2, names[i]); c.safeR(xs[i], 0, cols[i], bh); }
  const gp = [[0, 0], [-glue, 5], [-glue, bh - 5], [0, bh]];
  c.fill(gp); c.cut(gp); c.label(-glue / 2, bh / 2, 'Flap lem', 2.8);
  c.crease([[0, 0], [0, bh]]);
  for (let i = 1; i < 4; i++) c.crease([[xs[i], 0], [xs[i], bh]]);
  c.cut([[xs[4], 0], [xs[4], bh]]);
  const lidH = W + t, tk = Math.min(16, W * 0.55), dh = Math.min(W * 0.75, 32);
  // tutup的kolom attach tutup：rte Tutup atas挂Belakang, Tutup bawah挂Depan (2026-08-12 ditukar，与 box3d-app sinkron)；ste 两tutuptetap attach samaDepan
  const ends = [{ yb: 0, sgn: -1, lid: reverse ? 3 : 1, panelId: 'top' }, { yb: bh, sgn: 1, lid: 1, panelId: 'bottom' }];
  for (const e of ends) for (let i = 0; i < 4; i++) {
    const x0 = xs[i], x1 = xs[i + 1];
    if (i === e.lid) {
      flapLid(c, x0, x1, e.yb, e.sgn, lidH, tk);
      const y1 = e.yb + e.sgn * lidH;
      c.region([[x0, e.yb], [x0, y1], [x1, y1], [x1, e.yb]], { panelId: e.panelId, surface: 'outside', up: 'top' });
    }
    else if (i % 2 === 0) flapDust(c, x0, x1, e.yb, e.sgn, dh);
    else c.cut([[x0, e.yb], [x1, e.yb]]);
  }
  const topY = -(lidH + tk) - 7, botY = bh + lidH + tk + 9;
  for (let i = 0; i < 4; i++) c.dimH(xs[i], xs[i + 1], topY, '' + c.fmt(cols[i]));
  c.dimH(-glue, xs[4], botY, '' + c.fmt(xs[4] + glue));
  c.dimV(0, bh, xs[4] + 8, '' + c.fmt(bh));
}

function flapLid(c, x0, x1, yb, sgn, lidH, tk) {
  const y1 = yb + sgn * lidH, y2 = yb + sgn * (lidH + tk);
  const a = x0, b = x1, sl = x0 + 5, sr = x1 - 5, r = 3.5; // sisi badan tutuppakai直 (2026-08 sejaktutup persegi，lama 1mm inset梯形dihapus)
  const pts = [[x0, yb], [a, y1], [sl, y1 + sgn * 2.5], [sl, y2 - sgn * r]]
    .concat(c.q([sl, y2 - sgn * r], [sl, y2], [sl + r, y2], 'tr').slice(1))
    .concat([[sr - r, y2]])
    .concat(c.q([sr - r, y2], [sr, y2], [sr, y2 - sgn * r], 'tr').slice(1))
    .concat([[sr, y1 + sgn * 2.5], [b, y1], [x1, yb]]);
  c.cut(pts); c.fill(pts);
  c.crease([[x0, yb], [x1, yb]]); c.crease([[a, y1], [b, y1]]);
}

function flapDust(c, x0, x1, yb, sgn, dh) {
  const pts = [[x0 + 1.5, yb], [x0 + 3.5, yb + sgn * (dh - 5)], [x0 + 9, yb + sgn * dh], [x1 - 9, yb + sgn * dh], [x1 - 3.5, yb + sgn * 5], [x1 - 1.5, yb]];
  c.cut(pts); c.fill(pts); c.crease([[x0 + 1.5, yb], [x1 - 1.5, yb]]);
  c.cut([[x0, yb], [x0 + 1.5, yb]]); c.cut([[x1 - 1.5, yb], [x1, yb]]);
}


// Phase 9: carton parametris untuk packaging baru prioritas.
// Tiga tipe ini memakai struktur panel folding carton yang sama agar Design/3D/PDF langsung sinkron,
// lalu menambah fitur produksi: handle gable, window cut, dan flap bawah auto-lock.
export function genGableBox(c, s, t) {
  genTuck(c, s, t, false);
  const L = s.L, W = s.W, H = s.H, glue = s.glue, bh = H + t;
  const cols = [W + t, L + t, W + t, L + 2 * t];
  const xs = [0]; cols.forEach(w => xs.push(xs[xs.length - 1] + w));
  const roof = Math.min(34, Math.max(18, W * 0.75));
  const handleW = Math.min(46, L * 0.42), handleH = 8;
  for (const i of [1, 3]) {
    const cx = (xs[i] + xs[i + 1]) / 2;
    const pts = [[xs[i], 0], [cx - handleW / 2, -roof], [cx + handleW / 2, -roof], [xs[i + 1], 0]];
    c.fill(pts); c.cut(pts); c.crease([[xs[i], 0], [xs[i + 1], 0]]);
    c.cut([[cx - handleW / 2, -roof + handleH], [cx + handleW / 2, -roof + handleH]]);
    c.label(cx, -roof / 2, 'Panel gable + handle', 3.2);
  }
  c.dimH(-glue, xs[4], bh + W + 28, '' + c.fmt(xs[4] + glue));
}

export function genWindowCarton(c, s, t) {
  genTuck(c, s, t, false);
  const L = s.L, W = s.W, H = s.H, bh = H + t;
  const frontX = W + t;
  const winW = Math.max(18, L * 0.48), winH = Math.max(24, H * 0.48);
  const x0 = frontX + (L + t - winW) / 2, y0 = (bh - winH) / 2;
  const window = c.rect(x0, y0, winW, winH);
  c.cut(window.concat([window[0]]));
  c.label(x0 + winW / 2, y0 + winH / 2, 'Jendela PET', 3.2);
  c.safeR(frontX, 0, L + t, bh, Math.min(6, L / 12));
}

export function genAutoLockBottom(c, s, t) {
  genTuck(c, s, t, false);
  const L = s.L, W = s.W, H = s.H, bh = H + t;
  const cols = [W + t, L + t, W + t, L + 2 * t];
  const xs = [0]; cols.forEach(w => xs.push(xs[xs.length - 1] + w));
  const lockH = Math.min(W + t, 38);
  for (let i = 0; i < 4; i++) {
    const x0 = xs[i], x1 = xs[i + 1], mid = (x0 + x1) / 2;
    const pts = i % 2 === 0
      ? [[x0 + 1, bh], [mid, bh + lockH], [x1 - 1, bh]]
      : [[x0 + 1, bh], [x0 + 5, bh + lockH], [x1 - 5, bh + lockH * 0.55], [x1 - 1, bh]];
    c.fill(pts); c.cut(pts); c.crease([[x0 + 1, bh], [x1 - 1, bh]]);
  }
  c.label((xs[0] + xs[4]) / 2, bh + lockH * 0.55, 'Auto-lock bottom', 3.4);
}

function roundedRect(c, x, y, w, h, r = 4) {
  return [[x + r, y], [x + w - r, y]]
    .concat(c.q([x + w - r, y], [x + w, y], [x + w, y + r], 'tr').slice(1))
    .concat([[x + w, y + h - r]])
    .concat(c.q([x + w, y + h - r], [x + w, y + h], [x + w - r, y + h], 'br').slice(1))
    .concat([[x + r, y + h]])
    .concat(c.q([x + r, y + h], [x, y + h], [x, y + h - r], 'bl').slice(1))
    .concat([[x, y + r]])
    .concat(c.q([x, y + r], [x, y], [x + r, y], 'tl').slice(1));
}

export function genPillowBox(c, s, t) {
  const L = s.L, W = s.W, H = s.H, glue = s.glue, bodyH = H + t, end = Math.min(W * 0.72, H * 0.45, 42);
  const main = c.rect(0, 0, L, bodyH);
  c.fill(main); c.region(main, { panelId: 'front', role: 'hero', surface: 'outside', up: 'top' }); c.label(L / 2, bodyH / 2, 'Body depan'); c.safeR(0, 0, L, bodyH);
  const back = c.rect(L, 0, L, bodyH);
  c.fill(back); c.region(back, { panelId: 'back', role: 'design', surface: 'outside', up: 'top' }); c.label(L * 1.5, bodyH / 2, 'Body belakang'); c.safeR(L, 0, L, bodyH);
  const gp = [[0, 0], [-glue, 5], [-glue, bodyH - 5], [0, bodyH]];
  c.fill(gp); c.cut(gp); c.crease([[0, 0], [0, bodyH]]); c.label(-glue / 2, bodyH / 2, 'Flap lem', 2.8);
  c.crease([[L, 0], [L, bodyH]]); c.cut([[2 * L, 0], [2 * L, bodyH]]);
  for (const x0 of [0, L]) for (const d of [{ y: 0, sgn: -1, nm: 'Kurva atas' }, { y: bodyH, sgn: 1, nm: 'Kurva bawah' }]) {
    const pts = [[x0 + 2, d.y], [x0 + L / 2, d.y + d.sgn * end], [x0 + L - 2, d.y]];
    c.cut(pts); c.fill(pts); c.crease([[x0 + 2, d.y], [x0 + L - 2, d.y]]);
    c.label(x0 + L / 2, d.y + d.sgn * end * 0.55, d.nm, 2.6);
  }
  c.dimH(-glue, 2 * L, bodyH + end + 9, '' + c.fmt(2 * L + glue)); c.dimV(-end, bodyH + end, 2 * L + 8, '' + c.fmt(bodyH + 2 * end));
}

export function genPizzaBox(c, s, t) {
  const L = s.L, W = s.W, H = s.H, tuck = Math.min(30, H * 1.1), sideEar = Math.min(36, W * 0.35);
  const bottom = c.rect(0, H, L, W);
  c.fill(bottom); c.region(bottom, { panelId: 'pizza-bottom', surface: 'outside', up: 'top' }); c.label(L/2, H+W/2, 'Bawah'); c.safeR(0, H, L, W);
  const lid = c.rect(0, H + W + H, L, W);
  c.fill(lid); c.region(lid, { panelId: 'pizza-lid', role: 'hero', surface: 'outside', up: 'top' }); c.label(L/2, H+W+H+W/2, 'Tutup / artwork'); c.safeR(0, H+W+H, L, W);
  c.fill(c.rect(0, 0, L, H)); c.region(c.rect(0,0,L,H), { panelId:'pizza-back', surface:'outside', up:'top' }); c.label(L/2,H/2,'Dinding belakang');
  c.fill(c.rect(0, H+W, L, H)); c.region(c.rect(0,H+W,L,H), { panelId:'pizza-front', surface:'outside', up:'top' }); c.label(L/2,H+W+H/2,'Dinding depan');
  for (const side of [{x:-H, id:'left'}, {x:L, id:'right'}]) { const wall = c.rect(side.x, H, H, W); c.fill(wall); c.region(wall, { panelId:`pizza-${side.id}-wall`, surface:'outside', up:'top' }); c.label(side.x+H/2,H+W/2,'Dinding samping',3); c.crease([[side.x<0?0:L,H],[side.x<0?0:L,H+W]]); }
  const lip = [[4, H+W+H+W], [L-4, H+W+H+W], [L-10, H+W+H+W+tuck], [10, H+W+H+W+tuck]]; c.cut(lip); c.fill(lip); c.crease([[4,H+W+H+W],[L-4,H+W+H+W]]); c.label(L/2,H+W+H+W+tuck/2,'Flap kunci',3);
  for (const x of [-H, L]) for (const y of [0, H+W]) { const ear = x < 0 ? [[0,y+2],[-sideEar,y+5],[-sideEar,y+H-5],[0,y+H-2]] : [[L,y+2],[L+sideEar,y+5],[L+sideEar,y+H-5],[L,y+H-2]]; c.cut(ear); c.fill(ear); c.crease([[x<0?0:L,y+2],[x<0?0:L,y+H-2]]); }
  c.crease([[0,H],[L,H]]); c.crease([[0,H+W],[L,H+W]]); c.crease([[0,H+W+H],[L,H+W+H]]); c.crease([[0,H+W+H+W],[L,H+W+H+W]]);
  c.cut([[-H,H],[-H,H+W]]); c.cut([[L+H,H],[L+H,H+W]]); c.dimH(-H, L+H, H+W+H+W+tuck+9, ''+c.fmt(L+2*H)); c.dimV(0, H+W+H+W+tuck, L+H+8, ''+c.fmt(2*W+2*H+tuck));
}

export function genRSCBox(c, s, t) {
  const L = s.L, W = s.W, H = s.H, glue = s.glue, flap = Math.min(W/2, L/2) + t;
  const cols = [L, W, L, W], xs = [0]; cols.forEach(w => xs.push(xs[xs.length-1]+w));
  const ids = ['front','side-left','back','side-right'];
  for (let i=0;i<4;i++){ const p=c.rect(xs[i],0,cols[i],H); c.fill(p); c.region(p,{panelId:`rsc-${ids[i]}`,role:i===0?'hero':'design',surface:'outside',up:'top'}); c.label(xs[i]+cols[i]/2,H/2,ids[i]); c.safeR(xs[i],0,cols[i],H); c.crease([[xs[i],0],[xs[i],H]]); }
  const gp=[[0,0],[-glue,4],[-glue,H-4],[0,H]]; c.fill(gp); c.cut(gp); c.label(-glue/2,H/2,'Flap lem',2.8);
  for (let i=0;i<4;i++){ const x0=xs[i], x1=xs[i+1]; const top=c.rect(x0,-flap,cols[i],flap), bot=c.rect(x0,H,cols[i],flap); c.fill(top); c.fill(bot); c.cut(top.concat([top[0]])); c.cut(bot.concat([bot[0]])); c.crease([[x0,0],[x1,0]]); c.crease([[x0,H],[x1,H]]); }
  c.cut([[xs[4],0],[xs[4],H]]); c.dimH(-glue,xs[4],H+flap+10,''+c.fmt(xs[4]+glue)); c.dimV(-flap,H+flap,xs[4]+8,''+c.fmt(H+2*flap));
}

export function genSleeveTray(c, s, t) {
  const hh = Math.max(12, s.H * 0.55);
  const trayW = s.L, trayH = s.W;
  const tray = c.rect(0, 0, trayW, trayH);
  c.fill(tray); c.region(tray, { panelId: 'tray-bottom', role: 'design', surface: 'outside', up: 'top' }); c.label(trayW/2, trayH/2, 'Tray bawah'); c.safeR(0,0,trayW,trayH);
  const bandW = s.L + 6, bandH = s.W + 2 * t + 2;
  const sleeve = c.rect(trayW + 20, 0, bandW, bandH);
  c.fill(sleeve); c.region(sleeve, { panelId: 'sleeve-top', role: 'hero', surface: 'outside', up: 'top' }); c.label(trayW+20+bandW/2, bandH/2, 'Sleeve'); c.safeR(trayW+20,0,bandW,bandH);
  c.dimH(0, trayW+20+bandW, bandH+9, ''+c.fmt(trayW+20+bandW));
  c.dimV(0, bandH, trayW+20+bandW+8, ''+c.fmt(bandH));
}

export function genPaperCup(c, s, t) {
  const top = s.L, bot = Math.max(30, s.W), h = s.H, seam = 10, arc = (top + bot) / 2, slant = Math.abs(top - bot) / 2;
  const pts = [[0,0],[arc,slant],[arc,h+slant],[0,h]];
  c.fill(pts); c.cut(pts.concat([pts[0]])); c.region(pts,{panelId:'cup-wrap',role:'hero',surface:'outside',up:'top'}); c.safeR(0,0,arc,h); c.label(arc/2,h/2,'Wrap cup kerucut');
  const gp=[[-seam,2],[0,0],[0,h],[-seam,h-2]]; c.fill(gp); c.cut(gp); c.crease([[0,0],[0,h]]); c.label(-seam/2,h/2,'Overlap lem',2.8);
  c.dimH(-seam,arc,h+slant+9,''+c.fmt(arc+seam)); c.dimV(0,h,arc+8,''+c.fmt(h));
}

export function genCupSleeve(c, s, t) {
  const top = s.L, bot = Math.max(30, s.W), h = Math.max(38, Math.min(s.H, 75)), seam = 8, arc = (top + bot) / 2, slant = Math.abs(top - bot) / 2;
  const pts = [[0,0],[arc,slant],[arc,h+slant],[0,h]];
  c.fill(pts); c.cut(pts.concat([pts[0]])); c.region(pts,{panelId:'cup-sleeve-wrap',role:'hero',surface:'outside',up:'top'}); c.safeR(0,0,arc,h); c.label(arc/2,h/2,'Cup sleeve wrap');
  const gp=[[-seam,2],[0,0],[0,h],[-seam,h-2]]; c.fill(gp); c.cut(gp); c.crease([[0,0],[0,h]]);
  c.dimH(-seam,arc,h+slant+9,''+c.fmt(arc+seam)); c.dimV(0,h,arc+8,''+c.fmt(h));
}

export function genFriesBox(c, s, t) {
  const L=s.L,W=s.W,H=s.H, glue=s.glue, back=H, front=Math.max(H*0.62, H-32), side=W;
  const frontP=c.rect(0,back-front,L,front); c.fill(frontP); c.region(frontP,{panelId:'fries-front',role:'hero',surface:'outside',up:'top'}); c.safeR(0,back-front,L,front); c.label(L/2,back-front+front/2,'Depan');
  const backP=c.rect(L+side,0,L,back); c.fill(backP); c.region(backP,{panelId:'fries-back',surface:'outside',up:'top'}); c.safeR(L+side,0,L,back); c.label(L+side+L/2,back/2,'Belakang');
  for (const sideDef of [{x:L, id:'left'}, {x:L+side+L, id:'right'}]) { const pts=[[sideDef.x,back-front],[sideDef.x+side,0],[sideDef.x+side,back],[sideDef.x,back]]; c.fill(pts); c.cut(pts.concat([pts[0]])); c.region(pts,{panelId:`fries-${sideDef.id}`,surface:'outside',up:'top'}); c.crease([[sideDef.x,back-front],[sideDef.x,back]]); c.crease([[sideDef.x+side,0],[sideDef.x+side,back]]); }
  const bottom=c.rect(L+side,back,L,W); c.fill(bottom); c.region(bottom,{panelId:'fries-bottom',surface:'outside',up:'top'}); c.crease([[L+side,back],[L+side+L,back]]);
  const gp=[[0,back-front+2],[-glue,back-front+6],[-glue,back-4],[0,back]]; c.fill(gp); c.cut(gp); c.crease([[0,back-front+2],[0,back]]); c.label(-glue/2,back-front/2+front,'Flap lem',2.5);
  c.dimH(-glue,2*L+2*side,back+W+9,''+c.fmt(2*L+2*side+glue)); c.dimV(0,back+W,2*L+2*side+8,''+c.fmt(back+W));
}

export function genBottleLabel(c, s, t) {
  const w = Math.max(40, Math.PI * s.L), h = Math.max(20, Math.min(s.H, 120)), seam = 4;
  const p = roundedRect(c, 0, 0, w, h, Math.min(5, h/5)); c.fill(p); c.cut(p.concat([p[0]])); c.region(p,{panelId:'bottle-label',role:'hero',surface:'outside',up:'top'}); c.safeR(0,0,w,h); c.label(w/2,h/2,'Label botol');
  c.cut([[-seam,0],[-seam,h]]); c.crease([[0,0],[0,h]]); c.dimH(-seam,w,h+9,''+c.fmt(w+seam)); c.dimV(0,h,w+8,''+c.fmt(h));
}

export function genBellyBand(c, s, t) {
  const w = 2 * (s.L + s.W) + s.glue, h = Math.max(18, Math.min(s.H * 0.38, 70));
  const p = c.rect(0,0,w,h); c.fill(p); c.cut(p.concat([p[0]])); c.region(p,{panelId:'belly-band',role:'hero',surface:'outside',up:'top'}); c.safeR(0,0,w,h); c.label(w/2,h/2,'Belly band');
  let x=s.glue; for (const seg of [s.L,s.W,s.L,s.W]) { c.crease([[x,0],[x,h]]); x+=seg; }
  c.label(s.glue/2,h/2,'Overlap lem',2.5); c.dimH(0,w,h+9,''+c.fmt(w)); c.dimV(0,h,w+8,''+c.fmt(h));
}

export function genHangtag(c, s, t) {
  const w = Math.max(35, Math.min(s.L, 90)), h = Math.max(55, Math.min(s.H, 140)), r = Math.min(6, w/8), hole = 4;
  const p = roundedRect(c, 0, 0, w, h, r); c.fill(p); c.cut(p.concat([p[0]])); c.region(p,{panelId:'hangtag-front',role:'hero',surface:'outside',up:'top'}); c.safeR(0,0,w,h); c.label(w/2,h/2,'Hangtag');
  const cx=w/2, cy=10; const circ=[]; for(let i=0;i<24;i++){ const a=2*Math.PI*i/24; circ.push([cx+hole*Math.cos(a),cy+hole*Math.sin(a)]); } c.cut(circ.concat([circ[0]])); c.label(cx,cy+10,'Lubang gantung',2.5); c.dimH(0,w,h+9,''+c.fmt(w)); c.dimV(0,h,w+8,''+c.fmt(h));
}

export function genStickerLabelRoll(c, s, t) {
  const w=Math.max(30,Math.min(s.L,120)), h=Math.max(20,Math.min(s.H,90)), gap=4;
  for (let i=0;i<3;i++){ const x=i*(w+gap); const p=roundedRect(c,x,0,w,h,Math.min(5,h/5)); c.fill(p); c.cut(p.concat([p[0]])); c.region(p,{panelId:i===1?'sticker-label':'sticker-label-sample-'+i,role:i===1?'hero':'design',surface:'outside',up:'top'}); if(i===1)c.safeR(x,0,w,h); c.label(x+w/2,h/2,i===1?'Label utama':'Repeat'); }
  c.dimH(0,3*w+2*gap,h+9,''+c.fmt(3*w+2*gap)); c.dimV(0,h,3*w+2*gap+8,''+c.fmt(h));
}

export function genHangerBox(c, s, t) {
  genTuck(c, s, t, false);
  const L = s.L, W = s.W, H = s.H;
  const cols = [W + t, L + t, W + t, L + 2 * t];
  const xs = [0]; cols.forEach(v => xs.push(xs[xs.length-1]+v));
  const bh = H + t, lidH = W + t;
  const xs1 = W + t;
  // Euro slot on top lid center
  const cx = xs1 + (L+t)/2, cy = -lidH*0.62;
  const slotW = Math.min(32, (L+t)*0.34), slotH = 12, r = slotH/2;
  const slot = [[cx-slotW/2, cy-slotH/2],[cx+slotW/2, cy-slotH/2],[cx+slotW/2, cy+r]].concat(c.q([cx+slotW/2, cy+r],[cx+slotW/2, cy+slotH/2],[cx+slotW/2-r, cy+slotH/2],'tr').slice(1)).concat(c.q([cx+slotW/2-r, cy+slotH/2],[cx, cy+slotH/2+3],[cx-slotW/2+r, cy+slotH/2],'tr').slice(1)).concat(c.q([cx-slotW/2+r, cy+slotH/2],[cx-slotW/2, cy+slotH/2],[cx-slotW/2, cy+r],'tr').slice(1)).concat([[cx-slotW/2, cy-slotH/2]]);
  c.cut(slot.concat([slot[0]]));
  c.label(cx, cy, 'Euro slot', 2.6);
}

export function genBookBox(c, s, t) {
  const L = s.L, W = s.W, H = s.H;
  const baseH = H, lidH = Math.max(14, H*0.55);
  const w1 = genTray(c, L, W, baseH, 0, 'Base box', { prefix: 'book-base', centerId: 'book-base-bottom' });
  const L2 = L + 2*t + 1, W2 = W + 2*t + 1;
  genTray(c, L2, W2, lidH, w1+28, 'Tutup box (magnet allowance +1mm/sisi)', { prefix: 'book-lid', centerId: 'book-lid-top', centerMeta: { role: 'hero', surface: 'outside', up: 'top' } });
  // Magnet markers
  const cx1 = 0 + baseH + L/2, cy1 = baseH + W/2;
  // leave note, no extra geom needed; dimensions already via tray
}

export function genStandupPouch(c, s, t) {
  const Lb = s.L, Hb = s.H, gus = Math.min(45, Math.max(18, s.W));
  const seal = 9, W = Lb, H = Hb + gus;
  const outer = c.rect(0, 0, W, H);
  c.fill(outer); c.cut(outer.concat([outer[0]])); c.region(outer, { panelId: 'pouch-front', role: 'hero', surface: 'outside', up: 'top' });
  // Seals
  const topSeal = [[0,0],[W,0],[W,seal],[0,seal]]; c.seal(topSeal.concat([topSeal[0]])); c.crease([[0,seal],[W,seal]]);
  const botSeal = [[0,H-seal],[W,H-seal],[W,H],[0,H]]; c.seal(botSeal.concat([botSeal[0]])); c.crease([[0,H-seal],[W,H-seal]]);
  const leftSeal = [[0,0],[seal,0],[seal,H],[0,H]]; c.seal(leftSeal.concat([leftSeal[0]])); c.crease([[seal,0],[seal,H]]);
  const rightSeal = [[W-seal,0],[W,0],[W,H],[W-seal,H]]; c.seal(rightSeal.concat([rightSeal[0]])); c.crease([[W-seal,0],[W-seal,H]]);
  // Gusset creases
  c.crease([[0, H-gus],[W, H-gus]]); c.crease([[0, H-gus/2],[W, H-gus/2]]);
  c.safeR(seal, seal, W-2*seal, Hb-seal*1.2);
  c.label(W/2, Hb/2, 'Pouch depan'); c.label(W/2, H-gus/2, 'Gusset bawah', 2.8);
  c.dimH(0,W, H+9, ''+c.fmt(W)); c.dimV(0,H, W+8, ''+c.fmt(H)+' (gusset '+c.fmt(gus)+')');
}

export function genFlatSachet(c, s, t) {
  const W = s.L, H = s.H, seal = 8;
  const outer = c.rect(0,0,W,H);
  c.fill(outer); c.cut(outer.concat([outer[0]])); c.region(outer, { panelId: 'sachet-front', role: 'hero', surface: 'outside', up: 'top' });
  for (const r of [[[0,0],[W,0],[W,seal],[0,seal]], [[0,H-seal],[W,H-seal],[W,H],[0,H]], [[0,0],[seal,0],[seal,H],[0,H]], [[W-seal,0],[W,0],[W,H],[W-seal,H]]]) { c.seal(r.concat([r[0]])); }
  c.crease([[seal,0],[seal,H]]); c.crease([[W-seal,0],[W-seal,H]]); c.crease([[0,seal],[W,seal]]); c.crease([[0,H-seal],[W,H-seal]]);
  c.safeR(seal+2, seal+2, W-2*seal-4, H-2*seal-4);
  c.label(W/2, H/2, 'Sachet');
  c.dimH(0,W, H+9, ''+c.fmt(W)); c.dimV(0,H, W+8, ''+c.fmt(H));
}

export function genPillowPack(c, s, t) {
  const filmW = s.L, rep = s.H, fin = 15, endSeal = 9;
  const W = filmW, H = rep;
  const outer = c.rect(0,0,W,H);
  c.fill(outer); c.cut(outer.concat([outer[0]])); c.region(outer, { panelId: 'pillow-front', role: 'hero', surface: 'outside', up: 'top' });
  // fin seal vertical at center overlap
  const finX = W/2 - fin/2;
  const finSeal = [[finX,0],[finX+fin,0],[finX+fin,H],[finX,H]]; c.seal(finSeal.concat([finSeal[0]])); c.crease([[finX,0],[finX,H]]); c.crease([[finX+fin,0],[finX+fin,H]]);
  const topSeal = [[0,0],[W,0],[W,endSeal],[0,endSeal]]; c.seal(topSeal.concat([topSeal[0]])); c.crease([[0,endSeal],[W,endSeal]]);
  const botSeal = [[0,H-endSeal],[W,H-endSeal],[W,H],[0,H]]; c.seal(botSeal.concat([botSeal[0]])); c.crease([[0,H-endSeal],[W,H-endSeal]]);
  c.safeR(4, endSeal+3, W-8, H-2*endSeal-6);
  c.label(W/2, H/2, 'Flow wrap');
  c.dimH(0,W, H+9, ''+c.fmt(W)+' film'); c.dimV(0,H, W+8, ''+c.fmt(H)+' repeat');
}

export function genSpoutPouch(c, s, t) {
  const Lb = s.L, Hb = s.H, gus = Math.min(36, Math.max(18, s.W));
  const seal = 9, W = Lb, H = Hb + gus;
  const outer = c.rect(0,0,W,H);
  c.fill(outer); c.cut(outer.concat([outer[0]])); c.region(outer, { panelId: 'spout-pouch-front', role: 'hero', surface: 'outside', up: 'top' });
  for (const r of [[[0,0],[W,0],[W,seal],[0,seal]], [[0,H-seal],[W,H-seal],[W,H],[0,H]], [[0,0],[seal,0],[seal,H],[0,H]], [[W-seal,0],[W,0],[W,H],[W-seal,H]]]) c.seal(r.concat([r[0]]));
  c.crease([[0,H-gus],[W,H-gus]]); c.crease([[seal,0],[seal,H]]); c.crease([[W-seal,0],[W-seal,H]]);
  const cx = W/2, cy = seal+18, holeR = 7;
  const hole = []; for(let i=0;i<24;i++){ const a=2*Math.PI*i/24; hole.push([cx+holeR*Math.cos(a), cy+holeR*Math.sin(a)]); } c.cut(hole.concat([hole[0]])); c.label(cx, cy+12, 'Spout Ø14', 2.5);
  c.safeR(seal, seal+28, W-2*seal, Hb-seal-30);
  c.label(W/2, Hb/2+14, 'Pouch spout');
  c.dimH(0,W, H+9, ''+c.fmt(W)); c.dimV(0,H, W+8, ''+c.fmt(H));
}

export function genBurgerClamshell(c, s, t) {
  const L = s.L, W = s.W, bh = s.H, wall = Math.min(32, Math.max(18, bh*0.45));
  const bottom = c.rect(0, bh+wall, L, W);
  c.fill(bottom); c.region(bottom, { panelId: 'clamshell-bottom', surface: 'outside', up: 'top' }); c.label(L/2, bh+wall+W/2, 'Bawah'); c.safeR(0, bh+wall, L, W);
  const lid = c.rect(0, 0, L, W);
  c.fill(lid); c.region(lid, { panelId: 'clamshell-lid', role: 'hero', surface: 'outside', up: 'top' }); c.label(L/2, W/2, 'Tutup'); c.safeR(0,0,L,W);
  const back = c.rect(0, wall, L, bh); c.fill(back); c.region(back, { panelId: 'clamshell-back', surface: 'outside', up: 'top' }); c.label(L/2, wall+bh/2, 'Dinding belakang');
  const frontB = c.rect(0, bh+wall+W, L, wall); c.fill(frontB); c.region(frontB, { panelId: 'clamshell-front-bottom', surface: 'outside', up: 'top' });
  const frontT = c.rect(0, 0, L, 10); // placeholder tuck lip will be cut shape
  // Walls sides
  for(const sd of [{x:-wall},{x:L}]){
    const wl = c.rect(sd.x, wall, wall, bh); c.fill(wl); c.region(wl, { panelId: sd.x<0?'clamshell-left':'clamshell-right', surface:'outside', up:'top' }); c.crease([[sd.x<0?0:L, wall],[sd.x<0?0:L, wall+bh]]);
    const wl2 = c.rect(sd.x, bh+wall, wall, W); c.fill(wl2); c.region(wl2, { panelId: sd.x<0?'clamshell-left2':'clamshell-right2', surface:'outside', up:'top' });
  }
  // Closure tabs
  const tabH = 12; const tabB = [[4, bh+wall+W],[L-4, bh+wall+W],[L-10, bh+wall+W+tabH],[10, bh+wall+W+tabH]]; c.cut(tabB); c.fill(tabB); c.crease([[4, bh+wall+W],[L-4, bh+wall+W]]); c.label(L/2, bh+wall+W+tabH/2, 'Tab kunci', 2.8);
  const tabT = [[4, wall-10],[L-4, wall-10],[L-4,0],[4,0]]; c.cut(tabT); c.fill(tabT); c.crease([[4, wall],[L-4, wall]]);
  c.crease([[0,wall],[L,wall]]); c.crease([[0,wall+bh],[L,wall+bh]]); c.crease([[0,bh+wall+W],[L,bh+wall+W]]);
  c.cut([[-wall, wall],[-wall, wall+bh]]); c.cut([[L+wall, wall],[L+wall, wall+bh]]);
  c.dimH(-wall, L+wall, bh+wall+W+tabH+9, ''+c.fmt(L+2*wall)); c.dimV(0, bh+wall+W+tabH, L+wall+8, ''+c.fmt(bh+wall+W+tabH));
}

// Mailer box：one-piece
// Mailer box：one-piece tanpa lem，side ear dilipat
export function genMailer(c, s, t) {
  const L = s.L, W = s.W, H = s.H, Lc = L + 2 * t;
  const tk = Math.min(H * 0.7, 28), Wl = W + 3 * t, Hb = H + t, Wb = W + t, Hf = H, Sw = H + t;
  const y1 = Wl, y2 = y1 + Hb, y3 = y2 + Wb, y4 = y3 + Hf;
  const rows = [[0, y1, 'Tutup (luar)', 'mailer-lid'], [y1, y2, 'Belakang', 'mailer-back'], [y2, y3, 'Bawah', 'mailer-bottom'], [y3, y4, 'Depan', 'mailer-front']];
  for (let i = 0; i < rows.length; i++) { const rr = rows[i], pts = c.rect(0, rr[0], Lc, rr[1] - rr[0]); c.fill(pts); c.region(pts, { panelId: rr[3], role: i === 0 ? 'hero' : 'design', surface: 'outside', up: 'top' }); c.label(Lc / 2, (rr[0] + rr[1]) / 2, rr[2]); c.safeR(0, rr[0], Lc, rr[1] - rr[0]); }
  const rt = 5;
  const tp = [[4, 0], [4, -tk + rt]].concat(c.q([4, -tk + rt], [4, -tk], [4 + rt, -tk], 'tr').slice(1)).concat([[Lc - 4 - rt, -tk]]).concat(c.q([Lc - 4 - rt, -tk], [Lc - 4, -tk], [Lc - 4, -tk + rt], 'tr').slice(1)).concat([[Lc - 4, 0]]);
  c.cut(tp); c.fill(tp); c.crease([[4, 0], [Lc - 4, 0]]); c.cut([[0, 0], [4, 0]]); c.cut([[Lc - 4, 0], [Lc, 0]]);
  c.crease([[0, y1], [Lc, y1]]); c.crease([[0, y2], [Lc, y2]]); c.crease([[0, y3], [Lc, y3]]);
  c.cut([[0, y4], [Lc, y4]]); c.cut([[0, y3], [0, y4]]); c.cut([[Lc, y3], [Lc, y4]]);
  c.cut([[0, y1], [0, y2]]); c.cut([[Lc, y1], [Lc, y2]]);
  const dw = Math.min(H * 0.8, 26);
  const dl = [[0, 2], [-dw + 5, 4.5], [-dw, 11], [-dw, y1 - 10], [-5, y1 - 3.5], [0, y1 - 2]];
  const mir = pts => pts.map(p => [Lc - p[0], p[1]]);
  c.cut(dl); c.fill(dl); c.crease([[0, 2], [0, y1 - 2]]); c.cut([[0, 0], [0, 2]]); c.cut([[0, y1 - 2], [0, y1]]);
  c.cut(mir(dl)); c.fill(mir(dl)); c.crease([[Lc, 2], [Lc, y1 - 2]]); c.cut([[Lc, 0], [Lc, 2]]); c.cut([[Lc, y1 - 2], [Lc, y1]]);
  const wallL = c.rect(-Sw, y2, Sw, Wb);
  c.fill(wallL); c.region(wallL, { panelId: 'mailer-wall-left', surface: 'outside', up: 'top' }); c.label(-Sw / 2, y2 + Wb / 2, 'Dinding samping', 3.2);
  c.crease([[0, y2], [0, y3]]);
  c.cut([[-Sw, y2], [0, y2]]); c.cut([[-Sw, y2], [-Sw, y3]]);
  c.cut([[-Sw, y3], [-Sw + 1, y3]]); c.cut([[-1, y3], [0, y3]]); c.crease([[-Sw + 1, y3], [-1, y3]]);
  const eh = Math.min(Hf - 1, Sw * 0.95), re = 6;
  const ear = [[-Sw + 1, y3], [-Sw + 1, y3 + eh - re]].concat(c.q([-Sw + 1, y3 + eh - re], [-Sw + 1, y3 + eh], [-Sw + 1 + re, y3 + eh], 'tr').slice(1)).concat([[-4, y3 + eh]]).concat(c.q([-4, y3 + eh], [-1, y3 + eh], [-1, y3 + eh - 3], 'tr').slice(1)).concat([[-1, y3]]);
  c.cut(ear); c.fill(ear);
  const wallR = c.rect(Lc, y2, Sw, Wb);
  c.fill(wallR); c.region(wallR, { panelId: 'mailer-wall-right', surface: 'outside', up: 'top' }); c.label(Lc + Sw / 2, y2 + Wb / 2, 'Dinding samping', 3.2);
  c.crease([[Lc, y2], [Lc, y3]]);
  c.cut([[Lc, y2], [Lc + Sw, y2]]); c.cut([[Lc + Sw, y2], [Lc + Sw, y3]]);
  c.cut([[Lc + Sw - 1, y3], [Lc + Sw, y3]]); c.cut([[Lc, y3], [Lc + 1, y3]]); c.crease([[Lc + 1, y3], [Lc + Sw - 1, y3]]);
  c.cut(mir(ear)); c.fill(mir(ear));
  c.dimH(0, Lc, -tk - 7, '' + c.fmt(Lc));
  c.dimH(-Sw, Lc + Sw, y4 + 10, '' + c.fmt(Lc + 2 * Sw));
  c.dimV(-tk, y4, Lc + Sw + 8, '' + c.fmt(y4 + tk));
}

// tray (Lid and basebawah/tutup, Drawer boxinner boxreuse)
export function genTray(c, Lt, Wt, hh, ox, nm, panelConfig = {}) {
  const cx1 = ox + hh, cx2 = ox + hh + Lt, cy1 = hh, cy2 = hh + Wt;
  const TW = 2 * hh + Lt, TH = 2 * hh + Wt;
  const prefix = panelConfig.prefix || 'tray', center = c.rect(cx1, cy1, Lt, Wt);
  c.fill(center); c.region(center, { panelId: panelConfig.centerId || `${prefix}-bottom`, surface: 'outside', up: 'top', ...(panelConfig.centerMeta || {}) }); c.label(cx1 + Lt / 2, cy1 + Wt / 2, 'Bawah'); c.safeR(cx1, cy1, Lt, Wt);
  const back = c.rect(cx1, 0, Lt, hh), front = c.rect(cx1, cy2, Lt, hh), left = c.rect(ox, cy1, hh, Wt), right = c.rect(cx2, cy1, hh, Wt);
  c.fill(back); c.region(back, { panelId: `${prefix}-back`, surface: 'outside', up: 'top' });
  c.fill(front); c.region(front, { panelId: `${prefix}-front`, surface: 'outside', up: 'top' });
  c.fill(left); c.region(left, { panelId: `${prefix}-left`, surface: 'outside', up: 'top' });
  c.fill(right); c.region(right, { panelId: `${prefix}-right`, surface: 'outside', up: 'top' });
  c.label(ox + TW / 2, -8, nm, 4.5);
  c.crease([[cx1, cy1], [cx2, cy1]]); c.crease([[cx1, cy2], [cx2, cy2]]);
  c.crease([[cx1, cy1], [cx1, cy2]]); c.crease([[cx2, cy1], [cx2, cy2]]);
  c.cut([[cx1, 0], [cx2, 0]]); c.cut([[cx1, cy2 + hh], [cx2, cy2 + hh]]);
  c.cut([[ox, cy1], [ox, cy2]]); c.cut([[ox + TW, cy1], [ox + TW, cy2]]);
  c.cut([[ox, cy1], [cx1, cy1]]); c.cut([[ox, cy2], [cx1, cy2]]);
  c.cut([[cx2, cy1], [ox + TW, cy1]]); c.cut([[cx2, cy2], [ox + TW, cy2]]);
  const earTL = [[cx1, 0.6], [ox + 3, 0.6], [ox + 0.8, 3.5], [ox + 0.8, hh - 0.6], [cx1, hh - 0.6]];
  const mirX = pts => pts.map(p => [2 * ox + TW - p[0], p[1]]);
  const mirY = pts => pts.map(p => [p[0], TH - p[1]]);
  for (const e of [earTL, mirX(earTL), mirY(earTL), mirX(mirY(earTL))]) {
    c.cut(e); c.fill(e);
    const xh = e[0][0], ya = Math.min(e[0][1], e[4][1]), yb2 = Math.max(e[0][1], e[4][1]);
    c.crease([[xh, ya], [xh, yb2]]);
    const yEdge = ya < hh ? 0 : TH;
    c.cut([[xh, yEdge], [xh, yEdge === 0 ? 0.6 : TH - 0.6]]);
    c.cut([[xh, yEdge === 0 ? hh - 0.6 : cy2 + 0.6], [xh, yEdge === 0 ? hh : cy2]]);
  }
  c.dimH(ox, ox + TW, TH + 9, '' + c.fmt(TW));
  c.dimV(0, TH, ox - 8, '' + c.fmt(TH));
  return TW;
}

// Drawer boxsleeve
export function genSleeve(c, s, t, ox) {
  const L = s.L, W = s.W, H = s.H, g = 12, band = L + 2;
  const cols = [H + 2 * t, W + 3 * t, H + 3 * t, W + 4 * t];
  const xs = [ox]; cols.forEach(w => xs.push(xs[xs.length - 1] + w));
  const names = ['Sisi', 'Atas', 'Sisi', 'Bawah'], panelIds = ['sleeve-side-left', 'sleeve-top', 'sleeve-side-right', 'sleeve-bottom'];
  for (let i = 0; i < 4; i++) { const pts = c.rect(xs[i], 0, cols[i], band); c.fill(pts); c.region(pts, { panelId: panelIds[i], role: i === 1 ? 'hero' : 'design', surface: 'outside', up: 'left' }); c.label(xs[i] + cols[i] / 2, band / 2, names[i], 3.6); c.safeR(xs[i], 0, cols[i], band); }
  c.label(ox + (xs[4] - ox) / 2, -8, 'Sleeve (luar)', 4.5);
  const gp = [[ox, 0], [ox - g, 4], [ox - g, band - 4], [ox, band]];
  c.fill(gp); c.cut(gp); c.crease([[ox, 0], [ox, band]]);
  for (let i = 1; i < 4; i++) c.crease([[xs[i], 0], [xs[i], band]]);
  c.cut([[xs[4], 0], [xs[4], band]]);
  c.cut([[ox, 0], [xs[4], 0]]); c.cut([[ox, band], [xs[4], band]]);
  c.dimH(ox - g, xs[4], band + 9, '' + c.fmt(xs[4] - ox + g));
  c.dimV(0, band, xs[4] + 8, '' + c.fmt(band));
}
