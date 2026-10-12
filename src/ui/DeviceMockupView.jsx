import React from 'react';
import { store, useStore } from '../state/store.js';
import { mockupModelById } from '../dieline/templateCatalog.js';

const btn = { border: '1px solid #d8d0c2', borderRadius: 7, background: '#fff', padding: '8px 10px', cursor: 'pointer', color: '#5c554a', fontWeight: 700 };
const input = { width: '100%', boxSizing: 'border-box', border: '1px solid #d8d0c2', borderRadius: 6, padding: '7px 8px', background: '#fff', color: '#2b2722' };

function readScreen(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 4_000_000) { window.alert('Ukuran screenshot maksimal 4 MB.'); return; }
  const r = new FileReader();
  r.onload = () => store.set({ deviceScreenImage: String(r.result || '') });
  r.readAsDataURL(file);
}

function DeviceShape({ model, s }) {
  const kind = model?.screen || 'phone';
  const frame = s.deviceFrameColor || '#1c1d22';
  const screen = s.deviceScreenImage;
  const scale = Math.max(0.75, Math.min(1.25, s.deviceScale || 1));
  const commonScreen = screen ? <image href={screen} x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" /> : null;
  if (kind === 'laptop') return <svg viewBox="0 0 620 420" style={{ width: 620 * scale, maxWidth: '92%', height: 'auto' }}><rect x="120" y="36" width="380" height="245" rx="18" fill={frame}/><rect x="142" y="60" width="336" height="190" rx="6" fill="#f9f8f4"/>{screen && <svg x="142" y="60" width="336" height="190">{commonScreen}</svg>}<path d="M75 302h470l45 54H30z" fill="#bfc2c7"/><path d="M260 302h100l18 18H242z" fill="#8b8f98" opacity=".75"/><ellipse cx="310" cy="368" rx="230" ry="22" fill="#000" opacity=".12"/></svg>;
  if (kind === 'tablet') return <svg viewBox="0 0 420 520" style={{ width: 330 * scale, maxWidth: '82%', height: 'auto' }}><rect x="50" y="24" width="320" height="472" rx="30" fill={frame}/><rect x="72" y="58" width="276" height="398" rx="12" fill="#f9f8f4"/>{screen && <svg x="72" y="58" width="276" height="398">{commonScreen}</svg>}<circle cx="210" cy="476" r="8" fill="#fff" opacity=".55"/></svg>;
  if (kind === 'monitor') return <svg viewBox="0 0 640 440" style={{ width: 620 * scale, maxWidth: '92%', height: 'auto' }}><rect x="85" y="34" width="470" height="285" rx="18" fill={frame}/><rect x="112" y="62" width="416" height="220" rx="6" fill="#f9f8f4"/>{screen && <svg x="112" y="62" width="416" height="220">{commonScreen}</svg>}<path d="M288 319h64l18 64H270z" fill="#8f939b"/><rect x="230" y="382" width="180" height="22" rx="8" fill="#777b83"/><ellipse cx="320" cy="415" rx="210" ry="18" fill="#000" opacity=".12"/></svg>;
  if (kind === 'watch') return <svg viewBox="0 0 360 520" style={{ width: 270 * scale, maxWidth: '75%', height: 'auto' }}><rect x="130" y="10" width="100" height="130" rx="32" fill={frame} opacity=".75"/><rect x="118" y="138" width="124" height="224" rx="38" fill={frame}/><rect x="136" y="164" width="88" height="172" rx="28" fill="#f9f8f4"/>{screen && <svg x="136" y="164" width="88" height="172">{commonScreen}</svg>}<rect x="130" y="360" width="100" height="145" rx="32" fill={frame} opacity=".75"/><circle cx="246" cy="226" r="9" fill={frame}/></svg>;
  if (kind === 'case') return <svg viewBox="0 0 360 520" style={{ width: 270 * scale, maxWidth: '75%', height: 'auto' }}><rect x="96" y="36" width="168" height="448" rx="34" fill={frame}/><rect x="112" y="52" width="136" height="416" rx="26" fill="#f4f0e8"/>{screen && <svg x="112" y="52" width="136" height="416">{commonScreen}</svg>}<circle cx="139" cy="88" r="17" fill={frame}/><circle cx="184" cy="88" r="17" fill={frame}/><circle cx="139" cy="132" r="17" fill={frame}/></svg>;
  if (kind === 'earbuds') return <svg viewBox="0 0 420 360" style={{ width: 400 * scale, maxWidth: '86%', height: 'auto' }}><rect x="86" y="100" width="248" height="150" rx="54" fill={frame}/><rect x="114" y="127" width="192" height="92" rx="32" fill="#f4f0e8"/>{screen && <svg x="146" y="145" width="128" height="56">{commonScreen}</svg>}<circle cx="210" cy="232" r="7" fill="#fff" opacity=".7"/><ellipse cx="210" cy="278" rx="130" ry="18" fill="#000" opacity=".12"/></svg>;
  if (kind === 'powerbank') return <svg viewBox="0 0 520 320" style={{ width: 470 * scale, maxWidth: '88%', height: 'auto' }}><rect x="76" y="70" width="368" height="180" rx="34" fill={frame}/><rect x="120" y="112" width="280" height="96" rx="18" fill="#f4f0e8"/>{screen && <svg x="120" y="112" width="280" height="96">{commonScreen}</svg>}<circle cx="405" cy="100" r="5" fill="#fff" opacity=".75"/><circle cx="423" cy="100" r="5" fill="#fff" opacity=".45"/></svg>;
  if (kind === 'usb') return <svg viewBox="0 0 520 260" style={{ width: 470 * scale, maxWidth: '88%', height: 'auto' }}><rect x="94" y="78" width="260" height="104" rx="24" fill={frame}/><rect x="126" y="104" width="190" height="52" rx="12" fill="#f4f0e8"/>{screen && <svg x="126" y="104" width="190" height="52">{commonScreen}</svg>}<rect x="354" y="100" width="74" height="60" rx="10" fill="#b7bac0"/><rect x="428" y="111" width="35" height="38" rx="5" fill="#d6d8dc"/></svg>;
  return <svg viewBox="0 0 360 520" style={{ width: 270 * scale, maxWidth: '75%', height: 'auto' }}><rect x="92" y="28" width="176" height="464" rx="34" fill={frame}/><rect x="108" y="56" width="144" height="398" rx="12" fill="#f9f8f4"/>{screen && <svg x="108" y="56" width="144" height="398">{commonScreen}</svg>}<circle cx="180" cy="474" r="7" fill="#fff" opacity=".55"/></svg>;
}

export function DeviceMockupView() {
  const s = useStore();
  const model = mockupModelById(s.selectedMockup) || mockupModelById('phone-mockup');
  return <>
    <div style={{ width: 260, flex: 'none', background: '#faf7f0', borderRight: '1px solid #ded5c4', overflowY: 'auto' }}>
      <div style={{ padding: 14, borderBottom: '1px solid #e5dccd' }}><div style={{ fontWeight: 900, color: '#211d18' }}>Device Mockup</div><div style={{ fontSize: 12, color: '#756b5b', marginTop: 4 }}>{model.name} · {model.mode}</div></div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 11, color: '#8a8071', marginBottom: 5 }}>Upload screen / artwork</div>
        <label style={{ ...btn, display: 'block', textAlign: 'center', marginBottom: 10 }}>Upload Gambar<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => readScreen(e.target.files?.[0])}/></label>
        {s.deviceScreenImage && <button onClick={() => store.set({ deviceScreenImage: '' })} style={{ ...btn, width: '100%', marginBottom: 14 }}>Hapus Gambar</button>}
        <div style={{ fontSize: 11, color: '#8a8071', marginBottom: 5 }}>Warna frame</div>
        <input type="color" value={s.deviceFrameColor || '#1c1d22'} onChange={e => store.set({ deviceFrameColor: e.target.value })} style={{ ...input, height: 38, padding: 3, marginBottom: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a8071' }}><span>Scale</span><b>{Math.round((s.deviceScale || 1) * 100)}%</b></div>
        <input type="range" min="75" max="125" value={Math.round((s.deviceScale || 1) * 100)} onChange={e => store.set({ deviceScale: +e.target.value / 100 })} style={{ width: '100%', accentColor: '#3f72b5' }} />
        <div style={{ marginTop: 14, background: '#f0ebe0', borderRadius: 8, padding: 10, fontSize: 11.5, color: '#5c554a', lineHeight: 1.55 }}>Phase 3: mockup device pakai renderer SVG ringan. Upload screenshot akan masuk ke layar/device surface. Export PNG/GLB final bisa ditambah fase berikut.</div>
      </div>
    </div>
    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 38%, #edf2f8 0%, #d9e0ea 58%, #c2cad6 100%)' }}>
      <DeviceShape model={model} s={s} />
      <div style={{ position: 'absolute', left: 16, bottom: 14, background: 'rgba(255,255,255,.82)', border: '1px solid #d6dde7', borderRadius: 8, padding: '7px 11px', fontSize: 12, color: '#3f4d62' }}>{model.name} · {model.stock} · {model.difficulty}</div>
    </div>
  </>;
}
