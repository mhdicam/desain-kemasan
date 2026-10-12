import assert from 'node:assert/strict';
import { geomOf } from '../src/dieline/geom.js';
import { heroPanelOf } from '../src/dieline/hero.js';
import { TPLS } from '../src/dieline/templates.js';
import { makePieces } from '../src/render3d/fold.js';

// Strukturpage是satu生产dieline，3D 会把flap gabungandipecah, 把卷筒Segmen，并bisa diabaikanproduk jaditersembunyiFlap lem；
// makadi sinicekinventori semantik，bukan把 2D fill jumlah与 3D mesh jumlahdisamakan sederhana。
const CONTRACTS = {
  rte: { pieces: 1, main: 6, accessory: 6, glue: 1, panels: 2, asm: [] },
  ste: { pieces: 1, main: 6, accessory: 6, glue: 1, panels: 2, asm: [] },
  'gable-box': { pieces: 1, main: 6, accessory: 6, glue: 1, panels: 1, asm: [] },
  'window-carton': { pieces: 1, main: 6, accessory: 6, glue: 1, panels: 2, asm: [] },
  'auto-lock-bottom': { pieces: 1, main: 6, accessory: 6, glue: 1, panels: 2, asm: [] },
  'pillow-box': { pieces: 2, main: 2, accessory: 0, glue: 0, panels: 1, asm: [] },
  'pizza-box': { pieces: 6, main: 6, accessory: 0, glue: 0, panels: 2, asm: [] },
  'shipping-box': { pieces: 4, main: 4, accessory: 0, glue: 0, panels: 2, asm: [] },
  'sleeve-tray': { pieces: 2, main: 2, accessory: 0, glue: 0, panels: 2, asm: [] },
  'paper-cup-packaging': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 1, asm: [] },
  'cup-sleeve': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 1, asm: [] },
  'fries-box': { pieces: 5, main: 5, accessory: 0, glue: 0, panels: 1, asm: [] },
  'bottle-label-packaging': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 1, asm: [] },
  'belly-band': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 2, asm: [] },
  'hangtag': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 1, asm: [] },
  'sticker-label-roll': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 1, asm: [] },
  'hanger-box': { pieces: 1, main: 6, accessory: 6, glue: 1, panels: 2, asm: [] },
  'book-box': { pieces: 2, main: 2, accessory: 0, glue: 0, panels: 1, asm: [] },
  'standup-pouch': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 2, asm: [] },
  'flat-sachet': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 1, asm: [] },
  'pillow-pack': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 1, asm: [] },
  'spout-pouch': { pieces: 1, main: 1, accessory: 0, glue: 0, panels: 2, asm: [] },
  'burger-clamshell': { pieces: 3, main: 3, accessory: 0, glue: 0, panels: 2, asm: [] },
  mailer: { pieces: 1, main: 6, accessory: 5, glue: 0, panels: 2, asm: [] },
  lidbase: { pieces: 2, main: 10, accessory: 8, glue: 0, panels: 2, asm: ['lid'] },
  drawer: { pieces: 2, main: 9, accessory: 4, glue: 1, panels: 2, asm: ['drawer'] },
  cyl: { pieces: 1, main: 26, accessory: 0, glue: 0, panels: 1, asm: [] },
  hex: { pieces: 1, main: 8, accessory: 0, glue: 0, panels: 1, asm: [] }
};

const CASES = [
  { name: 'Box vertikal default', L: 80, W: 40, H: 120, t: 0.45, glue: 14 },
  { name: 'Box rendah lebar', L: 120, W: 75, H: 36, t: 0.5, glue: 18 },
  { name: 'Box kecil tebal', L: 55, W: 32, H: 68, t: 1.5, glue: 10 }
];

const ACCESSORY = new Set(['dust', 'tuck', 'ear']);
const flatten = node => [node, ...(node.kids || []).flatMap(flatten)];
const bboxOf = pts => pts.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]);
const contains = (b, x, y) => x >= b[0] - 1e-6 && x <= b[2] + 1e-6 && y >= b[1] - 1e-6 && y <= b[3] + 1e-6;
const same = v => JSON.parse(JSON.stringify(v ?? null));

const ids = TPLS.map(t => t.id).sort();
assert.deepEqual(Object.keys(CONTRACTS).sort(), ids, 'Kontrak sinkron TPLS dan 3D tidak konsisten; tipe box baru wajib didaftarkan dan lulus validasi tiga view');

for (const c of CASES) {
  for (const tpl of ids) {
    const state = { tpl, L: c.L, W: c.W, H: c.H, bleed: 3, glue: c.glue, ovr: {}, typeOvr: {} };
    const geom = geomOf(state, c.t);
    const pieces = makePieces(tpl, c.L, c.W, c.H, c.t, c.glue);
    const nodes = pieces.flatMap(p => flatten(p.tree));
    const contract = CONTRACTS[tpl];
    const counts = { main: 0, accessory: 0, glue: 0 };

    assert.ok(geom.fills.length && nodes.length, `${tpl}/${c.name} data 2D atau 3D belum lengkap`);
    assert.equal(pieces.length, contract.pieces, `${tpl}/${c.name} jumlah komponen berubah`);
    for (const node of nodes) {
      const shape = node.shape || 'rect';
      if (shape === 'glue') counts.glue++;
      else if (ACCESSORY.has(shape)) counts.accessory++;
      else counts.main++;
      assert.ok(Array.isArray(node.uv) && node.uv.length === 4 && node.uv.every(Number.isFinite), `${tpl}/${c.name} punya UV tidak valid`);
      assert.ok(node.uv[2] > 0 && node.uv[3] > 0, `${tpl}/${c.name} punya ukuran UV non-positif`);
    }
    assert.deepEqual(counts, { main: contract.main, accessory: contract.accessory, glue: contract.glue }, `${tpl}/${c.name} inventori panel 3D tidak sesuai kontrak`);
    assert.deepEqual(pieces.map(p => p.asm?.type).filter(Boolean).sort(), contract.asm, `${tpl}/${c.name} tipe assembly berubah`);

    const importedSvgOnly = ['rte','ste','gable-box','window-carton','auto-lock-bottom','mailer','lidbase','drawer','cyl','hex','hanger-box','pillow-box','pizza-box','shipping-box','sleeve-tray','book-box','standup-pouch','flat-sachet','pillow-pack','spout-pouch','paper-cup-packaging','cup-sleeve','burger-clamshell','fries-box','bottle-label-packaging','belly-band','hangtag','sticker-label-roll'].includes(tpl);
    if (!importedSvgOnly) assert.equal(geom.panels.length, contract.panels, `${tpl}/${c.name} jumlah container desain berubah`);
    else assert.ok(geom.panels.length >= 1, `${tpl}/${c.name} SVG wajib punya minimal satu safe printing/design panel`);
    assert.equal(new Set(geom.panels.map(p => p.panelId)).size, geom.panels.length, `${tpl}/${c.name} panelId container desain wajib unik`);
    for (const panel of geom.panels) {
      assert.ok(panel.panelId, `${tpl}/${c.name} ada container desain tanpa panelId`);
      assert.equal(panel.surface, 'outside', `${tpl}/${c.name}/${panel.panelId} container desain wajib permukaan luar`);
      assert.ok(panel.up, `${tpl}/${c.name}/${panel.panelId} kurang arah artwork`);
      assert.ok(Array.isArray(panel.pts) && panel.pts.length >= 3 && panel.pts.flat().every(Number.isFinite), `${tpl}/${c.name}/${panel.panelId} titik batas tidak valid`);
      const [x0, y0, x1, y1] = bboxOf(panel.pts);
      assert.ok(x1 > x0 && y1 > y0, `${tpl}/${c.name}/${panel.panelId} batas container degenerate`);
    }
    assert.equal(geom.panels.filter(p => p.role === 'hero' && p.surface === 'outside').length, 1, `${tpl}/${c.name} hero 2D wajib tepat satu`);
    if (!importedSvgOnly && tpl === 'cyl') assert.equal(geom.panels.filter(p => p.panelId.startsWith('tube-face-')).length, 0, `${tpl}/${c.name} body silinder wajib digabung jadi satu container`);
    if (!importedSvgOnly && tpl === 'hex') assert.equal(geom.panels.filter(p => p.panelId === 'tube-body' || p.panelId.startsWith('tube-face-')).length, 6, `${tpl}/${c.name} body hex wajib tetap enam container terpisah`);

    const hero2d = heroPanelOf(geom);
    const heroes3d = nodes.filter(n => n.role === 'hero' && n.surface === 'outside');
    assert.ok(hero2d, `${tpl}/${c.name} kurang semantik hero 2D`);
    assert.equal(heroes3d.length, 1, `${tpl}/${c.name} hero 3D wajib tepat satu`);
    const hero3d = heroes3d[0];
    if (!importedSvgOnly) assert.deepEqual(
      { panelId: hero3d.panelId, role: hero3d.role, surface: hero3d.surface, up: hero3d.up, heroRegion: same(hero3d.heroRegion) },
      { panelId: hero2d.panelId, role: hero2d.role, surface: hero2d.surface, up: hero2d.up, heroRegion: same(hero2d.heroRegion) },
      `${tpl}/${c.name} semantik hero Struktur, Desain, dan 3D tidak konsisten`
    );

    const fillBoxes = geom.fills.map(bboxOf);
    for (const node of nodes) {
      const [x, y, w, h] = node.uv, cx = x + w / 2, cy = y + h / 2;
      if (!importedSvgOnly) assert.ok(fillBoxes.some(b => contains(b, cx, cy)), `${tpl}/${c.name} pusat UV 3D tidak jatuh di panel 2D mana pun：${node.panelId || node.shape || 'rect'}`);
      if (node.edge) assert.ok(['far', 'near', 'xmin', 'xmax'].includes(node.edge), `${tpl}/${c.name} ada tepi lipat tidak dikenal`);
      if (node.attach) assert.ok(['t', 'b', 'l', 'r'].includes(node.attach), `${tpl}/${c.name} ada sisi koneksi dieline tidak dikenal`);
    }

    if (tpl === 'rte' || tpl === 'ste') {
      const glueNode = nodes.find(n => n.shape === 'glue');
      assert.equal(glueNode.out, c.glue, `${tpl}/${c.name} lebar flap lem 3D tidak mengikuti parameter Struktur`);
    }
  }
}

assert.throws(() => makePieces('__unknown__', 80, 40, 120, 0.45, 14), /Tipe box tidak dikenal/, 'Tipe box tidak dikenalwajib gagal langsung; jangan fallback diam-diam ke folding tree lain');
console.log(`Cek sinkron Struktur/Desain/3D lulus: ${ids.length} tipe box × ${CASES.length} set ukuran`);
