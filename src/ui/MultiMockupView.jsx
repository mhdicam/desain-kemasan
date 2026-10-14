import React from 'react';
import { store, useStore } from '../state/store.js';
import { mockupModelById } from '../dieline/templateCatalog.js';
import { mockupExportSpec, mockupChecklist, downloadMockupPNG } from '../mockup/mockupExport.js';

const btn = { border: '1px solid #d8d0c2', borderRadius: 7, background: '#fff', padding: '8px 10px', cursor: 'pointer', color: '#5c554a', fontWeight: 700 };
const input = { width: '100%', boxSizing: 'border-box', border: '1px solid #d8d0c2', borderRadius: 6, padding: '7px 8px', background: '#fff', color: '#2b2722' };

function readArtwork(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 4_000_000) { window.alert('Ukuran artwork maksimal 4 MB.'); return; }
  const r = new FileReader();
  r.onload = () => store.set({ mockupArtworkImage: String(r.result || '') });
  r.readAsDataURL(file);
}

function Artwork({ x, y, w, h, radius = 8, rotate = 0 }) {
  const s = useStore();
  const art = s.mockupArtworkImage;
  const fit = s.mockupFit === 'contain' ? 'xMidYMid meet' : s.mockupFit === 'stretch' ? 'none' : 'xMidYMid slice';
  const rot = (s.mockupRotate || 0) + rotate;
  const opacity = s.mockupOpacity == null ? 1 : s.mockupOpacity;
  if (!art) return <rect x={x} y={y} width={w} height={h} rx={radius} fill="#fff" opacity=".62" stroke="#fff" strokeDasharray="7 5" style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(${rot}deg)` }} />;
  return <svg x={x} y={y} width={w} height={h} opacity={opacity} style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(${rot}deg)` }}><image href={art} x="0" y="0" width="100%" height="100%" preserveAspectRatio={fit} /></svg>;
}


function ArtworkGuidePreview({ guide, pattern }) {
  const data = pattern || guide;
  if (!data) return null;
  return <div style={{ marginTop: 10, border: '1px solid #d8d0c2', borderRadius: 10, background: pattern ? '#f8f1ff' : '#fffdf8', overflow: 'hidden' }}>
    <div style={{ padding: '8px 10px', borderBottom: '1px solid #eadfce', fontSize: 11, color: '#5c554a', lineHeight: 1.45 }}><b>{pattern ? 'Pola Jahit V6 — Draft' : 'Artwork Guide V3'}</b><br />{pattern ? `${pattern.actualCutPieces} cut pieces · ${pattern.pieceTypes} tipe komponen · ${pattern.sheetWidthMm} × ${pattern.sheetHeightMm} mm` : `Area print: ${guide.artworkSizeMM} mm`}<br />{pattern ? 'Belum production/fit validated.' : 'Bukan cutline manufaktur.'}</div>
    <img src={data.preview} alt="" style={{ width: '100%', display: 'block', background: '#f7f1e7' }} />
    <div style={{ display: 'flex', gap: 8, padding: 8, flexWrap: 'wrap' }}>
      <a href={data.svg} target="_blank" style={{ fontSize: 11, fontWeight: 900, color: '#7a5430' }}>SVG</a>
      <a href={data.dxf} download style={{ fontSize: 11, fontWeight: 900, color: '#7a5430' }}>DXF</a>
      <a href={data.pdf} target="_blank" style={{ fontSize: 11, fontWeight: 900, color: '#7a5430' }}>PDF</a>
      {pattern?.patternJson && <a href={pattern.patternJson} target="_blank" style={{ fontSize: 11, fontWeight: 900, color: '#7a5430' }}>JSON</a>}
    </div>
  </div>;
}

function Shape({ model, color }) {
  const surface = model?.surface || model?.screen || model?.id || 'card';
  if (model.category === 'apparel' || ['tshirt-front','hoodie-mockup','tote-bag'].includes(model.id)) {
    if (surface === 'cap') return <svg viewBox="0 0 520 420"><ellipse cx="260" cy="250" rx="160" ry="86" fill={color}/><path d="M114 250c35-105 255-105 292 0-85 35-205 35-292 0z" fill={color}/><path d="M188 122c45-58 104-58 145 0 38 54 50 100 73 128-92 26-195 26-292 0 27-30 39-75 74-128z" fill={color} opacity=".9"/><Artwork x="198" y="152" w="124" h="76" radius="16"/><ellipse cx="260" cy="340" rx="190" ry="20" fill="#000" opacity=".12"/></svg>;
    if (surface === 'lanyard') return <svg viewBox="0 0 520 420"><path d="M160 72c70 38 130 38 200 0l34 55-102 230h-64L126 127z" fill="none" stroke={color} strokeWidth="30" strokeLinejoin="round"/><rect x="215" y="300" width="90" height="62" rx="8" fill={color}/><Artwork x="225" y="310" w="70" h="42" radius="4"/><ellipse cx="260" cy="380" rx="150" ry="18" fill="#000" opacity=".12"/></svg>;
    if (surface === 'apron') return <svg viewBox="0 0 520 520"><path d="M205 50h110l25 98 55 300H125l55-300z" fill={color}/><path d="M205 50c20 38 90 38 110 0" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="8"/><path d="M180 148h160" stroke="#fff" strokeOpacity=".35" strokeWidth="8"/><Artwork x="190" y="190" w="140" h="120" radius="12"/></svg>;
    const hoodie = model.id === 'hoodie-mockup' || surface === 'crewneck';
    return <svg viewBox="0 0 520 520"><path d="M170 118l55-34h70l55 34 72 70-46 50-38-30v230H182V208l-38 30-46-50z" fill={color}/>{hoodie && <path d="M205 100c18 42 92 42 110 0 16 22 25 50 24 82H181c-1-32 8-60 24-82z" fill={color} opacity=".78"/>}<Artwork x="197" y="210" w="126" h="112" radius="12"/><ellipse cx="260" cy="470" rx="160" ry="18" fill="#000" opacity=".12"/></svg>;
  }
  if (model.category === 'merchandise') {
    if (surface === 'bottle' || model.id === 'tumbler-wrap') return <svg viewBox="0 0 420 520"><rect x="155" y="52" width="110" height="55" rx="16" fill={color} opacity=".85"/><path d="M138 112h144l-18 340H156z" fill={color}/><ellipse cx="210" cy="112" rx="72" ry="17" fill={color}/><Artwork x="156" y="188" w="108" h="144" radius="12"/><ellipse cx="210" cy="466" rx="90" ry="16" fill="#000" opacity=".12"/></svg>;
    if (surface === 'keychain') return <svg viewBox="0 0 420 420"><circle cx="210" cy="110" r="32" fill="none" stroke="#b9b9b9" strokeWidth="16"/><rect x="120" y="140" width="180" height="180" rx="38" fill={color}/><Artwork x="155" y="184" w="110" h="92" radius="18"/><ellipse cx="210" cy="350" rx="120" ry="18" fill="#000" opacity=".12"/></svg>;
    if (surface === 'mousepad') return <svg viewBox="0 0 520 330"><rect x="72" y="64" width="376" height="200" rx="28" fill={color}/><Artwork x="100" y="92" w="320" h="144" radius="20"/><ellipse cx="260" cy="286" rx="180" ry="18" fill="#000" opacity=".12"/></svg>;
    if (surface === 'pin') return <svg viewBox="0 0 420 420"><circle cx="210" cy="200" r="128" fill={color}/><circle cx="210" cy="200" r="112" fill="#fff" opacity=".15"/><Artwork x="135" y="125" w="150" h="150" radius="75"/><ellipse cx="210" cy="350" rx="130" ry="18" fill="#000" opacity=".12"/></svg>;
    return <svg viewBox="0 0 420 520"><rect x="130" y="80" width="160" height="280" rx="16" fill={color}/><Artwork x="150" y="120" w="120" h="170" radius="8"/><ellipse cx="210" cy="392" rx="100" ry="18" fill="#000" opacity=".12"/></svg>;
  }
  if (model.category === 'display-booth') {
    if (surface === 'backdrop') return <svg viewBox="0 0 620 420"><rect x="86" y="55" width="448" height="260" rx="10" fill={color}/><Artwork x="112" y="82" w="396" h="206" radius="8"/><path d="M86 330h448" stroke="#555" strokeWidth="10"/><ellipse cx="310" cy="360" rx="230" ry="18" fill="#000" opacity=".12"/></svg>;
    if (surface === 'tablethrow') return <svg viewBox="0 0 620 420"><path d="M150 150h320l54 170H96z" fill={color}/><rect x="170" y="120" width="280" height="70" rx="8" fill={color} opacity=".8"/><Artwork x="220" y="200" w="180" h="86" radius="8"/><ellipse cx="310" cy="348" rx="210" ry="18" fill="#000" opacity=".12"/></svg>;
    if (surface === 'rack') return <svg viewBox="0 0 520 520"><path d="M150 95h220l30 350H120z" fill={color}/><path d="M145 210h230M135 322h250" stroke="#fff" strokeOpacity=".42" strokeWidth="12"/><Artwork x="178" y="118" w="164" h="68" radius="8"/></svg>;
    return <svg viewBox="0 0 420 520"><rect x="154" y="40" width="112" height="360" rx="7" fill={color}/><Artwork x="170" y="65" w="80" h="270" radius="5"/><path d="M128 425h164M210 398v46" stroke="#555" strokeWidth="12" strokeLinecap="round"/><ellipse cx="210" cy="462" rx="130" ry="18" fill="#000" opacity=".12"/></svg>;
  }
  if (model.category === 'food-beverage') {
    if (surface === 'jar') return <svg viewBox="0 0 420 520"><rect x="150" y="60" width="120" height="54" rx="12" fill={color}/><rect x="124" y="112" width="172" height="280" rx="46" fill={color} opacity=".82"/><Artwork x="142" y="190" w="136" h="110" radius="14"/><ellipse cx="210" cy="420" rx="112" ry="16" fill="#000" opacity=".12"/></svg>;
    if (surface === 'can') return <svg viewBox="0 0 420 520"><ellipse cx="210" cy="85" rx="82" ry="20" fill={color}/><rect x="128" y="85" width="164" height="330" fill={color}/><ellipse cx="210" cy="415" rx="82" ry="20" fill={color} opacity=".9"/><Artwork x="145" y="170" w="130" h="150" radius="10"/></svg>;
    if (surface === 'coffeebag') return <svg viewBox="0 0 420 520"><path d="M130 75h160l28 355H102z" fill={color}/><path d="M130 75c38 22 122 22 160 0" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="10"/><Artwork x="142" y="175" w="136" h="138" radius="12"/></svg>;
    return <svg viewBox="0 0 420 520"><path d="M140 90h140l-24 330h-92z" fill={color}/><ellipse cx="210" cy="90" rx="70" ry="18" fill={color}/><Artwork x="160" y="170" w="100" h="120" radius="10"/></svg>;
  }
  if (model.category === 'print-stationery') {
    if (surface === 'stickerroll') return <svg viewBox="0 0 560 360"><circle cx="190" cy="180" r="92" fill={color}/><circle cx="190" cy="180" r="42" fill="#fff" opacity=".75"/><path d="M232 122h230v116H232z" fill={color} opacity=".82"/><Artwork x="260" y="145" w="150" h="70" radius="6"/><ellipse cx="280" cy="296" rx="190" ry="18" fill="#000" opacity=".12"/></svg>;
    if (surface === 'calendar') return <svg viewBox="0 0 560 420"><path d="M150 320h260l-42-210H192z" fill={color}/><path d="M184 110h192l34 210H150z" fill={color} opacity=".62"/><Artwork x="205" y="145" w="150" h="110" radius="8"/><path d="M205 100h150" stroke="#777" strokeWidth="12" strokeLinecap="round"/></svg>;
    if (surface === 'folder') return <svg viewBox="0 0 560 380"><path d="M110 90h150l30 38h160v190H110z" fill={color}/><Artwork x="150" y="155" w="220" h="110" radius="8"/><ellipse cx="280" cy="334" rx="210" ry="18" fill="#000" opacity=".12"/></svg>;
    if (surface === 'envelope') return <svg viewBox="0 0 560 360"><rect x="100" y="90" width="360" height="190" rx="8" fill={color}/><path d="M100 90l180 128L460 90M100 280l135-105M460 280L325 175" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="8"/><Artwork x="205" y="130" w="150" h="80" radius="6"/></svg>;
    return <svg viewBox="0 0 520 380"><rect x="110" y="75" width="300" height="210" rx="14" fill={color}/><Artwork x="140" y="105" w="240" h="150" radius="8"/><ellipse cx="260" cy="315" rx="180" ry="18" fill="#000" opacity=".12"/></svg>;
  }
  if (model.category === 'custom-model') {
    if (surface === 'upload3d') return <svg viewBox="0 0 520 420"><path d="M260 62 410 150v170l-150 78-150-78V150z" fill={color}/><path d="M110 150l150 88 150-88M260 238v160" fill="none" stroke="#fff" strokeOpacity=".42" strokeWidth="8"/><path d="M238 174h44M260 152v44" stroke="#fff" strokeWidth="12" strokeLinecap="round"/><text x="260" y="315" textAnchor="middle" fill="#fff" fontSize="34" fontWeight="900">3D</text></svg>;
    if (surface === 'upload2d') return <svg viewBox="0 0 520 420"><rect x="125" y="70" width="270" height="300" rx="16" fill={color}/><path d="M170 122h180M170 172h120M170 224h180M170 276h145" stroke="#fff" strokeOpacity=".55" strokeWidth="10"/><path d="M260 300v-74M228 258l32-32 32 32" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    if (surface === 'brandkit') return <svg viewBox="0 0 560 390"><rect x="100" y="82" width="360" height="230" rx="22" fill={color}/><circle cx="180" cy="170" r="46" fill="#fff" opacity=".6"/><rect x="250" y="135" width="130" height="22" rx="8" fill="#fff" opacity=".65"/><rect x="250" y="180" width="170" height="22" rx="8" fill="#fff" opacity=".42"/><rect x="145" y="245" width="270" height="28" rx="10" fill="#fff" opacity=".35"/></svg>;
    return <svg viewBox="0 0 560 390"><rect x="110" y="74" width="340" height="240" rx="18" fill={color}/><Artwork x="150" y="120" w="260" h="120" radius="10"/><path d="M170 278h180" stroke="#fff" strokeOpacity=".5" strokeWidth="10" strokeLinecap="round"/></svg>;
  }
  return <svg viewBox="0 0 520 380"><rect x="110" y="75" width="300" height="210" rx="14" fill={color}/><Artwork x="140" y="105" w="240" h="150" radius="8"/><ellipse cx="260" cy="315" rx="180" ry="18" fill="#000" opacity=".12"/></svg>;
}

export function MultiMockupView() {
  const s = useStore();
  const model = mockupModelById(s.selectedMockup) || mockupModelById('tshirt-front');
  const color = s.mockupBaseColor || '#9a5aa6';
  const guide = model.artworkGuide;
  const pattern = model.apparelPattern;
  const spec = mockupExportSpec(model, s);
  const checks = mockupChecklist(spec);
  return <>
    <div style={{ width: 270, flex: 'none', background: '#faf7f0', borderRight: '1px solid #ded5c4', overflowY: 'auto' }}>
      <div style={{ padding: 14, borderBottom: '1px solid #e5dccd' }}><div style={{ fontWeight: 900, color: '#211d18' }}>Mockup Produk</div><div style={{ fontSize: 12, color: '#756b5b', marginTop: 4 }}>{model.name} · {model.mode}</div></div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 11, color: '#8a8071', marginBottom: 5 }}>Upload artwork</div>
        <label style={{ ...btn, display: 'block', textAlign: 'center', marginBottom: 10 }}>Upload Gambar<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => readArtwork(e.target.files?.[0])}/></label>
        {s.mockupArtworkImage && <button onClick={() => store.set({ mockupArtworkImage: '' })} style={{ ...btn, width: '100%', marginBottom: 14 }}>Hapus Artwork</button>}
        <div style={{ fontSize: 11, color: '#8a8071', marginBottom: 5 }}>Warna produk</div>
        <input type="color" value={color} onChange={e => store.set({ mockupBaseColor: e.target.value })} style={{ ...input, height: 38, padding: 3, marginBottom: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a8071' }}><span>Scale</span><b>{Math.round((s.mockupScale || 1) * 100)}%</b></div>
        <input type="range" min="75" max="125" value={Math.round((s.mockupScale || 1) * 100)} onChange={e => store.set({ mockupScale: +e.target.value / 100 })} style={{ width: '100%', accentColor: color }} />
        <div style={{ fontSize: 11, color: '#8a8071', margin: '10px 0 5px' }}>Fit artwork</div>
        <select value={s.mockupFit || 'cover'} onChange={e => store.set({ mockupFit: e.target.value })} style={{ ...input, marginBottom: 10 }}><option value="cover">Cover / crop rapi</option><option value="contain">Contain / utuh</option><option value="stretch">Stretch</option></select>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a8071' }}><span>Rotate</span><b>{s.mockupRotate || 0}°</b></div>
        <input type="range" min="-30" max="30" value={s.mockupRotate || 0} onChange={e => store.set({ mockupRotate: +e.target.value })} style={{ width: '100%', accentColor: color }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a8071' }}><span>Opacity</span><b>{Math.round((s.mockupOpacity ?? 1) * 100)}%</b></div>
        <input type="range" min="10" max="100" value={Math.round((s.mockupOpacity ?? 1) * 100)} onChange={e => store.set({ mockupOpacity: +e.target.value / 100 })} style={{ width: '100%', accentColor: color }} />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#5c554a', marginTop: 8 }}><input type="checkbox" checked={s.mockupShadow !== false} onChange={e => store.set({ mockupShadow: e.target.checked })}/> Shadow</label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#5c554a', marginTop: 6 }}><input type="checkbox" checked={!!s.mockupTransparent} onChange={e => store.set({ mockupTransparent: e.target.checked })}/> PNG transparan</label>
        {!s.mockupTransparent && <><div style={{ fontSize: 11, color: '#8a8071', margin: '10px 0 5px' }}>Background</div><input type="color" value={s.mockupBackground || '#f3eadb'} onChange={e => store.set({ mockupBackground: e.target.value })} style={{ ...input, height: 34, padding: 3 }} /></>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>{Object.entries(checks).map(([k, ok]) => <span key={k} style={{ borderRadius: 99, padding: '3px 6px', fontSize: 10, fontWeight: 800, background: ok ? '#e6f4ea' : '#f3eadb', color: ok ? '#2f7044' : '#9a6a2c', border: '1px solid ' + (ok ? '#b9dfc4' : '#e1c99f') }}>{ok ? '✓ ' : '○ '}{k}</span>)}</div>
        <ArtworkGuidePreview guide={guide} pattern={pattern} />
        <button onClick={() => downloadMockupPNG(spec, color, s.mockupArtworkImage)} style={{ ...btn, width: '100%', marginTop: 12, background: '#9a5b1f', color: '#fff', border: 'none' }}>Export PNG</button>
        <div style={{ marginTop: 14, background: pattern ? '#f8f1ff' : guide ? '#eef5ff' : '#f0ebe0', borderRadius: 8, padding: 10, fontSize: 11.5, color: '#5c554a', lineHeight: 1.55 }}>{pattern ? 'Pola Jahit V6: sample draft component cutting pattern. Belum Production Valid: seam match, grading, shrinkage, fit, dan proses jahit fisik belum diverifikasi.' : guide ? 'Artwork Guide V3: print-zone 1:1 dari SVG/DXF/PDF. Ini referensi artwork, bukan CAD potong/pola jahit.' : 'Phase 12: mockup visual valid dengan fit, rotate, opacity, shadow, background, dan PNG transparan.'}</div>
      </div>
    </div>
    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: s.mockupTransparent ? 'linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%)' : `radial-gradient(ellipse at 50% 38%, ${s.mockupBackground || '#f7f3ea'} 0%, #e5dbcb 62%, #c8bba8 100%)`, backgroundSize: s.mockupTransparent ? '24px 24px' : undefined, backgroundPosition: s.mockupTransparent ? '0 0,0 12px,12px -12px,-12px 0' : undefined }}>
      <div style={{ width: `${Math.round((s.mockupScale || 1) * 86)}%`, maxWidth: 720, filter: s.mockupShadow === false ? 'none' : 'drop-shadow(0 28px 24px rgba(0,0,0,.16))' }}><Shape model={model} color={color} /></div>
      <div style={{ position: 'absolute', left: 16, bottom: 14, background: 'rgba(255,255,255,.82)', border: '1px solid #ded3c1', borderRadius: 8, padding: '7px 11px', fontSize: 12, color: '#594b3b' }}>{model.name} · {model.stock} · {model.difficulty}</div>
    </div>
  </>;
}
