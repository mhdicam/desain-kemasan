// Layer模型：bbox, DPI, lintasGaris lipat/keluar batasPeringatan (移植lama型逻辑)
export const FIN = { none: '', foil: 'Foil emas', silver: 'Foil perak', uv: 'UV', gloss: 'Gloss', emboss: 'Emboss', holo: 'Holografik' };
export const FIN_NAMES = { foil: 'Foil emas', silver: 'Foil perak', uv: 'Spot UV', gloss: 'Gloss', emboss: 'Emboss', holo: 'Holografik' };
export const randomImageName = () => 'Gambar·' + Math.random().toString(36).slice(2, 6).toUpperCase();
export const layerNameOf = l => {
  if (l && typeof l.name === 'string' && l.name.trim()) return l.name.trim();
  if (l && l.kind === 'image') return 'Gambar·' + Number(l.id || 0).toString(36).toUpperCase().padStart(4, '0').slice(-4);
  return l && l.content || '(kosong)';
};

export function bboxOf(l) {
  if (l.kind === 'text') {
    const wch = [...(l.content || '')].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? 1 : 0.55), 0);
    const sx = l.scaleX == null ? 1 : l.scaleX, sy = l.scaleY == null ? 1 : l.scaleY;
    const w = Math.max(2, wch * l.size) * sx, h = l.size * 1.15 * sy, cy = l.y - l.size * 0.345;
    return [l.x - w / 2, cy - h / 2, w, h];
  }
  return [l.x, l.y, l.w, l.h];
}

export function dpiOf(l) {
  if (l.kind !== 'image' || !l.pxw) return 0;
  return Math.round(l.pxw / (l.w / 25.4));
}

// atlas UV 用：setiap面板 (fill 多边形)的包围盒，供 3D 与导出selaras
export function panelBoxes(g) {
  return g.fills.map(pts => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    return [x0, y0, x1, y1];
  });
}

export function warnsOf(l, creaseSegs, sbb) {
  const b = bboxOf(l), out = [];
  // terikat容器的Layer会在semuarender/导出pipeline统一crop；越过容器边界不再是生产Peringatan。
  if (l.panelId == null) {
    for (const seg2 of creaseSegs) {
      const p1 = seg2[0], p2 = seg2[1];
      if (Math.abs(p1[0] - p2[0]) < 0.01) {
        const cx = p1[0], y0 = Math.min(p1[1], p2[1]), y1 = Math.max(p1[1], p2[1]);
        if (cx > b[0] && cx < b[0] + b[2] && y0 < b[1] + b[3] && y1 > b[1]) { out.push('Melintasi garis lipat: artwork bisa patah/terdistorsi di sudut lipatan'); break; }
      } else if (Math.abs(p1[1] - p2[1]) < 0.01) {
        const cy = p1[1], x0 = Math.min(p1[0], p2[0]), x1 = Math.max(p1[0], p2[0]);
        if (cy > b[1] && cy < b[1] + b[3] && x0 < b[0] + b[2] && x1 > b[0]) { out.push('Melintasi garis lipat: artwork bisa patah/terdistorsi di sudut lipatan'); break; }
      }
    }
    if (b[0] < sbb[0] - 0.5 || b[1] < sbb[1] - 0.5 || b[0] + b[2] > sbb[2] + 0.5 || b[1] + b[3] > sbb[3] + 0.5) out.push('Keluar layout: masuk area bleed/limbah');
  }
  if (l.kind === 'image') { const dpi = dpiOf(l); if (dpi < 300) out.push('Resolusi kurang: ' + dpi + ' dpi < 300 dpi'); }
  return out;
}

// FinishingGambar的valid mask：RGB set putih, alpha = brightness × lama alpha。
// 标准 PBR 灰度FinishingG (黑=tanpa efek, 白=efek penuh, 灰=transisi)经此jadibobot mask；
// lama plat RGBA cutoutG (lama色+alpha)也kompatibel (brightness×alpha≈intensitas)。berdasarkan img objekcache。
const craftMaskCache = new WeakMap();
function craftMaskOf(img) {
  let m = craftMaskCache.get(img);
  if (m) return m;
  m = document.createElement('canvas');
  m.width = img.naturalWidth; m.height = img.naturalHeight;
  const mg = m.getContext('2d');
  mg.drawImage(img, 0, 0);
  const d = mg.getImageData(0, 0, m.width, m.height);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const lum = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
    px[i] = px[i + 1] = px[i + 2] = 255;
    px[i + 3] = Math.round(lum * (px[i + 3] / 255));
  }
  mg.putImageData(d, 0, 0);
  craftMaskCache.set(img, m);
  return m;
}

// 统一绘制satuLayer到 2d canvas (Ekspor PDF / 3D 烘焙reuse)
// sc = px/mm Zoom；fill menimpa颜色 (Finishing mask 用 '#fff' 等)
export function drawLayer(ctx, l, sc, fill, clipPts) {
  ctx.save();
  if (clipPts && clipPts.length > 2) {
    ctx.beginPath();
    clipPts.forEach((p, i) => i ? ctx.lineTo(p[0] * sc, p[1] * sc) : ctx.moveTo(p[0] * sc, p[1] * sc));
    ctx.closePath(); ctx.clip();
  }
  ctx.globalAlpha = l.opacity == null ? 1 : l.opacity;
  if (l.rot) {
    const b = bboxOf(l), rcx = (b[0] + b[2] / 2) * sc, rcy = (b[1] + b[3] / 2) * sc;
    ctx.translate(rcx, rcy); ctx.rotate(l.rot * Math.PI / 180); ctx.translate(-rcx, -rcy);
  }
  if (l.kind === 'text') {
    const sx = l.scaleX == null ? 1 : l.scaleX, sy = l.scaleY == null ? 1 : l.scaleY;
    if (sx !== 1 || sy !== 1) {
      const b = bboxOf(l), cx = (b[0] + b[2] / 2) * sc, cy = (b[1] + b[3] / 2) * sc;
      ctx.translate(cx, cy); ctx.scale(sx, sy); ctx.translate(-cx, -cy);
    }
    ctx.font = (l.weight || 400) + ' ' + (l.size * sc) + 'px "' + (l.font || 'Noto Sans SC') + '"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if (fill) { ctx.fillStyle = fill; ctx.fillText(l.content || '', l.x * sc, l.y * sc); }
    else if (l.finish === 'emboss') { ctx.strokeStyle = '#b8b0a0'; ctx.lineWidth = sc * 0.15; ctx.strokeText(l.content || '', l.x * sc, l.y * sc); }
    else { ctx.fillStyle = l.finish === 'foil' ? '#C9A227' : l.finish === 'silver' ? '#B8BAC4' : (l.color || '#211d18'); ctx.fillText(l.content || '', l.x * sc, l.y * sc); }
  } else if (l.kind === 'shape') {
    ctx.fillStyle = fill || (l.finish === 'emboss' ? 'rgba(33,29,24,0.12)' : l.finish === 'foil' ? '#C9A227' : l.finish === 'silver' ? '#B8BAC4' : (l.color || '#211d18'));
    ctx.fillRect(l.x * sc, l.y * sc, l.w * sc, l.h * sc);
  } else if (l.img) {
    // aktualGambar (支持Crop)
    const cr = l.crop || [0, 0, 1, 1];
    const iw = l.img.naturalWidth, ih = l.img.naturalHeight;
    const sx = cr[0] * iw, sy = cr[1] * ih, sw = cr[2] * iw, sh = cr[3] * ih;
    const dx = l.x * sc, dy = l.y * sc, dw = l.w * sc, dh = l.h * sc;
    if (fill || (l.finish && l.finish !== 'none')) {
      // FinishingLayer (mask 或bawah色 tint)：先在独立kanvas上berdasarkanvalid mask (brightness×alpha)镂空，再regular常合成
      // —— hindari destination-in 直接作用在主kanvas上抹掉其他Konten
      const t = document.createElement('canvas');
      t.width = Math.max(1, Math.ceil(dw)); t.height = Math.max(1, Math.ceil(dh));
      const tg = t.getContext('2d');
      tg.fillStyle = fill || (l.finish === 'foil' ? '#C9A227' : l.finish === 'silver' ? '#B8BAC4'
        : l.finish === 'uv' ? 'rgba(33,29,24,0.08)' : 'rgba(33,29,24,0.12)');
      tg.fillRect(0, 0, t.width, t.height);
      tg.globalCompositeOperation = 'destination-in';
      tg.drawImage(craftMaskOf(l.img), sx, sy, sw, sh, 0, 0, t.width, t.height);
      ctx.drawImage(t, dx, dy, dw, dh);
    } else {
      ctx.drawImage(l.img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  } else if (fill) {
    // Finishing mask 模式：Gambararea placeholdersolid fill
    ctx.fillStyle = fill; ctx.fillRect(l.x * sc, l.y * sc, l.w * sc, l.h * sc);
  } else {
    // Gambar占位框
    ctx.strokeStyle = fill || '#b3a88f'; ctx.lineWidth = fill ? 2 : sc * 0.3;
    if (!fill) ctx.setLineDash([sc * 2, sc * 1.4]);
    ctx.strokeRect(l.x * sc, l.y * sc, l.w * sc, l.h * sc); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(l.x * sc, l.y * sc); ctx.lineTo((l.x + l.w) * sc, (l.y + l.h) * sc);
    ctx.moveTo((l.x + l.w) * sc, l.y * sc); ctx.lineTo(l.x * sc, (l.y + l.h) * sc);
    ctx.lineWidth = fill ? 2 : sc * 0.2; ctx.stroke();
    if (!fill) { ctx.font = '500 ' + (3.4 * sc) + 'px "Noto Sans SC"'; ctx.textAlign = 'center'; ctx.fillStyle = '#8a8071'; ctx.fillText(l.content || '', (l.x + l.w / 2) * sc, (l.y + l.h / 2) * sc); }
  }
  ctx.restore();
}
