const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

export function mockupExportSpec(model = {}, state = {}) {
  return {
    id: model.id || 'mockup',
    name: model.name || 'Mockup Produk',
    category: model.category || 'mockup',
    width: 1600,
    height: 1200,
    fit: state.mockupFit || 'cover',
    rotate: clamp(Number(state.mockupRotate || 0), -45, 45),
    opacity: clamp(Number(state.mockupOpacity ?? 1), 0.1, 1),
    scale: clamp(Number(state.mockupScale || state.deviceScale || 1), 0.5, 1.5),
    shadow: state.mockupShadow !== false,
    transparent: !!state.mockupTransparent,
    background: state.mockupTransparent ? 'transparent' : (state.mockupBackground || '#f3eadb')
  };
}

export function mockupChecklist(spec) {
  return {
    hasArtworkFit: ['cover', 'contain', 'stretch'].includes(spec.fit),
    hasOpacityControl: spec.opacity >= 0.1 && spec.opacity <= 1,
    hasRotateControl: spec.rotate >= -45 && spec.rotate <= 45,
    hasShadowControl: typeof spec.shadow === 'boolean',
    hasTransparentExport: typeof spec.transparent === 'boolean',
    hasPngExport: spec.width >= 512 && spec.height >= 512
  };
}

export function buildMockupSvg(spec, baseColor = '#9a5aa6', artwork = '') {
  const bg = spec.transparent ? '' : `<rect width="100%" height="100%" fill="${esc(spec.background)}"/>`;
  const shadow = spec.shadow ? '<ellipse id="mockup-shadow" cx="800" cy="1000" rx="360" ry="55" fill="#000" opacity="0.16"/>' : '';
  const preserve = spec.fit === 'contain' ? 'xMidYMid meet' : spec.fit === 'stretch' ? 'none' : 'xMidYMid slice';
  const art = artwork ? `<image href="${esc(artwork)}" x="540" y="390" width="520" height="310" opacity="${spec.opacity}" preserveAspectRatio="${preserve}" transform="rotate(${spec.rotate} 800 545)"/>`
    : `<rect x="540" y="390" width="520" height="310" rx="34" fill="#fff" opacity="0.62" stroke="#fff" stroke-dasharray="24 18" transform="rotate(${spec.rotate} 800 545)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.width}" height="${spec.height}" viewBox="0 0 1600 1200">${bg}<title>${esc(spec.name)}</title>${shadow}<g transform="translate(800 560) scale(${spec.scale}) translate(-800 -560)"><rect x="430" y="250" width="740" height="620" rx="80" fill="${esc(baseColor)}"/><rect x="505" y="335" width="590" height="430" rx="44" fill="#fff" opacity="0.14"/>${art}<text x="800" y="835" text-anchor="middle" font-family="Inter,Arial" font-size="42" font-weight="800" fill="#fff" opacity="0.8">${esc(spec.name)}</text></g></svg>`;
}

export function downloadTextFile(name, text, type) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(new Blob([text], { type }));
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadMockupPNG(spec, baseColor, artwork) {
  const svg = buildMockupSvg(spec, baseColor, artwork);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = spec.width; canvas.height = spec.height;
    const ctx = canvas.getContext('2d');
    if (!spec.transparent) { ctx.fillStyle = spec.background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const a = document.createElement('a');
      const out = URL.createObjectURL(blob);
      a.href = out; a.download = `${spec.id}-mockup.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(out), 0);
    }, 'image/png');
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
