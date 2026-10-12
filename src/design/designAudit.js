import { bboxOf } from './layers.js';
import { bboxOfPts, containerById, pointInPolygon } from './containers.js';

const round = v => Math.round(v * 10) / 10;
const layerBox = layer => {
  const b = bboxOf(layer);
  return [b[0], b[1], b[0] + b[2], b[1] + b[3]];
};
const containsBox = (outer, inner, pad = 0) => inner[0] >= outer[0] + pad && inner[1] >= outer[1] + pad && inner[2] <= outer[2] - pad && inner[3] <= outer[3] - pad;
const intersectsBox = (a, b) => !(a[2] < b[0] || a[0] > b[2] || a[3] < b[1] || a[1] > b[3]);
const intersectsLine = (box, seg) => {
  const [[x1, y1], [x2, y2]] = seg;
  if (Math.abs(x1 - x2) < 0.01) return x1 > box[0] && x1 < box[2] && Math.max(y1, y2) > box[1] && Math.min(y1, y2) < box[3];
  if (Math.abs(y1 - y2) < 0.01) return y1 > box[1] && y1 < box[3] && Math.max(x1, x2) > box[0] && Math.min(x1, x2) < box[2];
  return false;
};

export function panelMap(g, bleed = 3) {
  return (g.panels || []).map(panel => {
    const box = bboxOfPts(panel.pts);
    const w = box[2] - box[0], h = box[3] - box[1];
    const safeMargin = Math.min(3, w / 4, h / 4);
    return {
      panelId: panel.panelId,
      role: panel.role || 'design',
      surface: panel.surface || 'outside',
      up: panel.up || 'top',
      box: box.map(round),
      safeBox: [box[0] + safeMargin, box[1] + safeMargin, box[2] - safeMargin, box[3] - safeMargin].map(round),
      bleedBox: [box[0] - bleed, box[1] - bleed, box[2] + bleed, box[3] + bleed].map(round),
      area: round(w * h),
      points: panel.pts.length
    };
  });
}

export function auditLayer(layer, g, opts = {}) {
  const panel = containerById(g, layer.panelId) || null;
  const box = layerBox(layer);
  const panelInfo = panel ? panelMap({ panels: [panel] }, opts.bleed ?? 3)[0] : null;
  const creaseSegs = [];
  (g.segs || []).forEach(s => { if (s.t === 'crease') for (let i = 0; i < s.pts.length - 1; i++) creaseSegs.push([s.pts[i], s.pts[i + 1]]); });
  const checks = {
    boundToPanel: !!panel,
    insidePanel: !!panelInfo && containsBox(panelInfo.box, box, -0.01),
    insideSafeArea: !!panelInfo && containsBox(panelInfo.safeBox, box, 0),
    insideBleedArea: !!panelInfo && containsBox(panelInfo.bleedBox, box, 0),
    crossesCrease: creaseSegs.some(seg => intersectsLine(box, seg)),
    centerInPanel: !!panel && pointInPolygon([(box[0] + box[2]) / 2, (box[1] + box[3]) / 2], panel.pts),
    crossesSafePrinting: !!panelInfo && !containsBox(panelInfo.safeBox, box, 0),
    overlapsAnySafePrinting: panelMap(g, opts.bleed ?? 3).some(info => intersectsBox(info.box, box))
  };
  const warnings = [];
  if (!checks.boundToPanel) warnings.push('Layer belum terikat ke panel desain.');
  if (checks.boundToPanel && !checks.insideSafeArea) warnings.push('Layer melewati GREEN safe printing. Ini boleh untuk artwork bleed/wrap antar panel; cek tetap tidak kena RED cut atau GREY glue penting.');
  if (checks.crossesCrease) warnings.push('Layer melintasi BLUE fold. Boleh untuk wrap desain antar panel, tapi cek objek penting tidak patah di lipatan.');
  if (layer.kind === 'text' && checks.boundToPanel && !checks.insideSafeArea) warnings.push('Teks melewati GREEN safe printing. Boleh, tapi teks penting disarankan tetap di area aman.');
  if (layer.kind === 'image' && layer.pxw && layer.w && Math.round(layer.pxw / (layer.w / 25.4)) < 300) warnings.push('Resolusi gambar kurang dari 300 dpi.');
  return { layerId: layer.id, panelId: layer.panelId || null, box: box.map(round), checks, warnings };
}

export function designAudit(layers = [], g, opts = {}) {
  const panels = panelMap(g, opts.bleed ?? 3);
  const layerReports = layers.filter(l => l.visible !== false).map(l => auditLayer(l, g, opts));
  return {
    panels,
    layers: layerReports,
    warnings: layerReports.flatMap(r => r.warnings.map(w => ({ layerId: r.layerId, warning: w }))),
    ready: layerReports.every(r => r.checks.boundToPanel && r.checks.overlapsAnySafePrinting)
  };
}

export function applyPanelPreset(layer, g, panelId, preset = 'center') {
  const panel = containerById(g, panelId) || (g.panels || [])[0];
  if (!panel) return layer;
  const info = panelMap({ panels: [panel] })[0];
  const [x0, y0, x1, y1] = info.safeBox;
  const w = layer.kind === 'text' ? Math.max(2, String(layer.content || '').length * (layer.size || 6) * 0.55) : (layer.w || 20);
  const h = layer.kind === 'text' ? (layer.size || 6) * 1.15 : (layer.h || 10);
  const slots = {
    center: [(x0 + x1 - w) / 2, (y0 + y1 - h) / 2],
    top: [(x0 + x1 - w) / 2, y0],
    bottom: [(x0 + x1 - w) / 2, y1 - h],
    left: [x0, (y0 + y1 - h) / 2],
    right: [x1 - w, (y0 + y1 - h) / 2]
  };
  const [x, y] = slots[preset] || slots.center;
  if (layer.kind === 'text') return { ...layer, panelId, x: round(x + w / 2), y: round(y + h * 0.8), heroPreset: undefined };
  return { ...layer, panelId, x: round(x), y: round(y), w: round(w), h: round(h), heroPreset: undefined };
}
