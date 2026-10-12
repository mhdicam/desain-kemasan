// 3D view：折叠kontrol / 基材Laminasi / Finishing样例 / Parameter emboss + PBR parameter与通道catatan
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { store, useStore } from '../state/store.js';
import { TPLS } from '../dieline/templates.js';
import { embDirOf } from '../design/emboss.js';
import { BoxPreview, boxPreviewContextOf } from '../render3d/BoxPreview.jsx';
import { STAGES } from '../render3d/stage.js';
import { PAPER_PRESETS, FILM_PRESETS, paperPreset, filmPreset } from '../render3d/presets.js';
import { SCENE_PRESETS, scenePreset, rigToStorePatch } from '../render3d/rig.js';
import { productionMesh, meshChecklist, downloadMeshFiles } from '../render3d/meshExport.js';
import { packagingFallbackNote } from '../dieline/templateCatalog.js';
import { ST, Block, Toggle, ToggleRow, Note, selectSt, btnSt, inputSt, captureThumb, Range, ColorRow } from './widgets.jsx';

export function ThreeView() {
  const s = useStore();
  const m = store.mat();
  const t = m.t;
  const pf = useRef(null);
  const engRef = useRef(null);
  const [foldPlaying, setFoldPlaying] = useState(false);
  const tplName = (TPLS.find(x => x.id === s.tpl) || TPLS[0]).name;
  const fallbackNote = s.selectedPackagingModel ? packagingFallbackNote({ id: s.selectedPackagingModel, name: s.selectedPackagingName || s.selectedPackagingModel, category: 'packaging', productCategory: 'packaging' }) : '';
  const finCount = f => s.layers.filter(l => l.finish === f).length;
  const embCount = dir => s.layers.filter(l => l.finish === 'emboss' && embDirOf(l, s.embDir) === dir).length;
  const finSummary = 'Layer finishing: foil×' + (finCount('foil') + finCount('silver')) + ' · UV×' + finCount('uv') + ' · gloss×' + finCount('gloss') + ' · holografik×' + finCount('holo') + ' · emboss×' + embCount('up') + ' · deboss×' + embCount('down') + '(dari halaman Desain)';
  // 烘焙输入：整 plat包围盒 + 全部Layer (atlasmenimpasemua面板，Layer放在哪 3D 就Tampilan在哪)
  const preview = boxPreviewContextOf(s, m);
  const mesh = productionMesh({ tpl: s.tpl, L: s.L, W: s.W, H: s.H, t, glue: s.glue });
  const meshStatus = meshChecklist(mesh);
  const coverKey = JSON.stringify({
    scene: [s.environment3d, s.stage3d, s.expo3d, s.lightsSpec3d, s.backgroundMode3d, s.backgroundColor3d],
    material: [s.paper3d, s.film3d, s.surfaceRoughness, s.grainStrength, s.grainScale, s.foilColor3d, s.silverColor3d, s.iridescence3d, s.holoSpan3d, s.holoRainbow3d, s.glossRoughness3d],
    camera: [s.cameraProjection3d, s.fov3d]
  });
  const clearFold = () => { clearInterval(pf.current); pf.current = null; };
  const stopFold = () => { clearFold(); setFoldPlaying(false); };
  const playFold = () => {
    clearFold(); setFoldPlaying(true); store.set({ fold: 0 });
    let v = 0;
    pf.current = setInterval(() => { v += 1.4; if (v >= 100) { v = 100; stopFold(); } store.set({ fold: v }); }, 28);
  };
  useLayoutEffect(() => { if (!s.foldFromQuery) playFold(); return clearFold; }, []);
  // final 3D tertutup态作为工程cover：reuse当前 renderer，不创建隐藏的第二套 3D scene
  useEffect(() => {
    if (s.fold < 99.5 || s.check !== 'art') return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const eng = engRef.current;
      if (!eng || !eng.ready || eng._disposed) return;
      if (eng.studio && eng.studio.environmentReady) await eng.studio.environmentReady;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (cancelled) return;
      const thumbnail = captureThumb(engRef, 420);
      if (thumbnail && thumbnail !== store.get().projectThumbnail) store.set({ projectThumbnail: thumbnail });
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [s.fold, s.check, preview.bakeKey, coverKey]);
  // debug句柄：CDP 回归直查final 3D 引擎 (helper 不terlihat/转盒回regular断言用)
  useEffect(() => { window.__threeEngine = engRef.current; return () => { if (window.__threeEngine === engRef.current) window.__threeEngine = null; }; }, []);
  const applyScenePreset = id => { store.set(rigToStorePatch(scenePreset(id))); };

  return (<>
    {fallbackNote && <div style={{ position: 'absolute', zIndex: 5, left: 260, right: 20, top: 58, background: '#fff8e6', border: '1px solid #ead7ad', borderRadius: 10, padding: '8px 11px', color: '#7a5818', fontSize: 12, fontWeight: 800, boxShadow: '0 8px 22px rgba(80,55,20,.12)' }}>Catatan jujur: {fallbackNote}</div>}
    <div style={{ width: 246, flex: 'none', background: '#faf7f0', borderRight: '1px solid #ded5c4', overflowY: 'auto' }}>
      <Block>
        <ST>Box aktif</ST>
        <div style={{ background: '#f0ebe0', border: '1px solid #e2dac9', borderRadius: 6, padding: '9px 11px', fontSize: 11.5, lineHeight: 1.6, color: '#3d3830', fontFamily: "'JetBrains Mono',monospace" }}>
          {tplName} · {m.name} t={t}<br />Ukuran dalam {s.L} × {s.W} × {s.H}
        </div>
        <div style={{ fontSize: 10.5, color: '#8a8071', marginTop: 6 }}>Ukuran dan ketebalan kertas mengikuti halaman Struktur</div>
        <div style={{ fontSize: 10.5, color: '#9a5b1f', marginTop: 4 }}>{finSummary}</div>
      </Block>
      <Block>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <ST style={{ marginBottom: 0 }}>Progress lipat</ST>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: '#9a5b1f' }}>{Math.round(s.fold)}%</div>
        </div>
        <input type="range" min="0" max="100" value={s.fold} onPointerDown={stopFold} onKeyDown={stopFold} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) { stopFold(); store.set({ fold: v }); } }} style={{ width: '100%', accentColor: '#9a5b1f', margin: '0 0 10px' }} />
        <div style={{ display: 'flex', gap: 7 }}>
          <button onClick={playFold} style={{ ...btnSt, flex: 1, padding: '7px 0', border: 'none', fontWeight: 700, background: '#9a5b1f', color: '#fff' }}>▶ Putar lipatan</button>
          <button onClick={() => { stopFold(); store.set({ fold: 0 }); }} style={{ ...btnSt, flex: 1, padding: '7px 0', color: '#5c554a' }}>Bentang</button>
        </div>
      </Block>
      <Block>
        <ST>Kertas / laminasi</ST>
        <div style={{ fontSize: 10.5, color: '#8a8071', marginBottom: 3 }}>Kertas</div>
        <select aria-label="Kertas" value={s.paper3d} onChange={e => { const p = paperPreset(e.target.value); store.set({ paper3d: p.id, surfaceRoughness: p.roughness, grainStrength: p.grainStrength, grainScale: p.grainMm }); }} style={{ ...selectSt, marginBottom: 8 }}>
          {PAPER_PRESETS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <div style={{ fontSize: 10.5, color: '#8a8071', marginBottom: 3 }}>Laminasi</div>
        <select aria-label="Laminasi" value={s.film3d} onChange={e => { const f = filmPreset(e.target.value); store.set({ film3d: f.id, filmClearcoat3d: f.clearcoat, filmClearcoatRoughness3d: f.clearcoatRoughness, filmRoughnessFactor3d: f.roughnessFactor, filmSheen3d: f.sheen }); }} style={{ ...selectSt, marginBottom: 9 }}>
          {FILM_PRESETS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        {[["Kekasaran permukaan", 'surfaceRoughness', 12, 100, Math.round(s.surfaceRoughness * 100)], ["Kekuatan serat kertas", 'grainStrength', 0, 120, Math.round(s.grainStrength * 100)], ["Skala grain", 'grainScale', 3, 20, s.grainScale]].map(row => <div key={row[1]} style={{ marginTop: 7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#8a8071', marginBottom: 3 }}><span>{row[0]}</span><span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#9a5b1f' }}>{row[1] === 'grainScale' ? row[4] + 'mm' : row[4] + '%'}</span></div>
          <input aria-label={row[0]} type="range" min={row[2]} max={row[3]} value={row[4]} onChange={e => store.set({ [row[1]]: row[1] === 'grainScale' ? +e.target.value : +e.target.value / 100 })} style={{ width: '100%', accentColor: '#9a5b1f', margin: 0 }} />
        </div>)}
        <div style={{ fontSize: 10.5, color: '#a59a85', lineHeight: 1.55, marginTop: 8 }}>Hanya mengubah tampilan 3D, tidak mengubah ketebalan kertas dan kompensasi dieline di halaman Struktur.</div>
      </Block>
      <Block>
        <ST style={{ marginBottom: 6 }}>Sampel finishing · cek</ST>
        {[['foil', 'Layer foil'], ['suv', 'Layer spot UV'], ['gloss', 'Layer gloss'], ['emb', 'Layer emboss'], ['holo', 'Layer holografik']].map(x => (
          <ToggleRow key={x[0]} label={x[1]} on={x[0] === 'gloss' || x[0] === 'holo' ? s.fx[x[0]] !== false : s.fx[x[0]]} onClick={() => store.set(st => ({ fx: { ...st.fx, [x[0]]: !(x[0] === 'gloss' || x[0] === 'holo' ? st.fx[x[0]] !== false : st.fx[x[0]]) } }))} />
        ))}
        <Range label="Kekasaran gloss" value={s.glossRoughness3d} min={0.02} max={0.5} step={0.01} onChange={v => store.set({ glossRoughness3d: v })} />
        <div style={{ marginTop: 4, fontSize: 10, color: '#a59a85' }}>Semakin rendah nilai, pantulan gloss makin tajam dan fokus.</div>
        <Range label="Intensitas holografik" value={s.iridescence3d} min={0} max={1} step={0.01} onChange={v => store.set({ iridescence3d: v })} />
        <Range label="Rentang warna holografik" value={s.holoSpan3d} min={0} max={1} step={0.01} onChange={v => store.set({ holoSpan3d: v })} />
        <Range label="Tekstur pelangi holografik" value={s.holoRainbow3d} min={0} max={1} step={0.01} onChange={v => store.set({ holoRainbow3d: v })} />
        <ColorRow label="Warna dasar holografik (polos=perak putih, warna=foil holografik berwarna)" value={s.holoColor3d} onChange={v => store.set({ holoColor3d: v })} />
        <div style={{ marginTop: 4, fontSize: 10, color: '#a59a85' }}>Holografik berlaku pada layer holografik dan foil; warna berubah mengikuti sudut pandang. Rentang lebih besar berarti sapuan hue lebih lebar; tekstur pelangi membake gradasi spektrum ke permukaan kertas.</div>
        <ToggleRow label="Rotasi otomatis" on={s.spin} onClick={() => store.set(st => ({ spin: !st.spin }))} />
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10.5, color: '#8a8071', marginBottom: 3 }}>Mode cek</div>
          <select value={s.check} onChange={e => store.set({ check: e.target.value })} style={selectSt}>
            <option value="art">Artwork warna (efek penuh)</option>
            <option value="foil">Plat foil · kanal R</option>
            <option value="suv">Plat spot UV · kanal G</option>
            <option value="gloss">Kanal refleksi gloss</option>
            <option value="holo">Plat holografik · kanal iridescent</option>
            <option value="emb">Tinggi emboss · putih naik / hitam turun</option>
            <option value="checker">Checker UV · 20mm/kotak</option>
          </select>
        </div>
      </Block>
      <Block>
        <ST>Studio dan lantai</ST>
        <div style={{ fontSize: 10.5, color: '#8a8071', marginBottom: 3 }}>Efek studio</div>
        <select aria-label="Efek studio" value={s.studio3d} onChange={e => applyScenePreset(e.target.value)} style={{ ...selectSt, marginBottom: 8 }}>
          {SCENE_PRESETS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <div style={{ fontSize: 10.5, color: '#8a8071', marginBottom: 3 }}>Proyeksi kamera</div>
        <select aria-label="Proyeksi kamera" value={s.cameraProjection3d || 'perspective'} onChange={e => store.set({ cameraProjection3d: e.target.value })} style={{ ...selectSt, marginBottom: 8 }}>
          <option value="perspective">Perspektif</option>
          <option value="orthographic">Ortografik · isometrik</option>
        </select>
        <div style={{ fontSize: 10.5, color: '#8a8071', marginBottom: 3 }}>Scene lantai</div>
        <select value={s.stage3d} onChange={e => store.set({ stage3d: e.target.value })} style={{ ...selectSt, marginBottom: 8 }}>
          {STAGES.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
        </select>
        <div style={{ fontSize: 10.5, color: '#a59a85', lineHeight: 1.6 }}>Efek studio untuk proof cepat; scene lantai bisa diganti terpisah. Parameter teknis hanya muncul di mode pengujian.</div>
      </Block>
      <Block>
        <ST>Export mesh produksi</ST>
        <div style={{ background: '#f0ebe0', border: '1px solid #e2dac9', borderRadius: 6, padding: '9px 11px', fontSize: 11.5, lineHeight: 1.6, color: '#3d3830', marginBottom: 8 }}>
          Mesh {mesh.id} · {mesh.faces.length} face · {mesh.vertices.length} vertex<br />Skala {mesh.scale.join(' × ')} mm · fitur {mesh.features.length || 'standar'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 9 }}>
          {Object.entries(meshStatus).map(([k, ok]) => <span key={k} style={{ borderRadius: 99, padding: '3px 7px', fontSize: 10.5, fontWeight: 800, background: ok ? '#e6f4ea' : '#f3eadb', color: ok ? '#2f7044' : '#9a6a2c', border: '1px solid ' + (ok ? '#b9dfc4' : '#e1c99f') }}>{ok ? '✓ ' : '○ '}{k}</span>)}
        </div>
        <button onClick={() => downloadMeshFiles(s, m)} style={{ ...btnSt, width: '100%', padding: '8px 0', fontWeight: 800, background: '#9a5b1f', color: '#fff', border: 'none' }}>Download OBJ + MTL + glTF</button>
        <div style={{ marginTop: 8, fontSize: 10.5, color: '#a59a85', lineHeight: 1.55 }}>Phase 11: mesh skala mm, UV panel, dan fitur khusus handle/window/auto-lock dicatat di metadata export.</div>
      </Block>
      <Block>
        <ST>Parameter emboss</ST>
        <div style={{ fontSize: 10.5, color: '#8a8071', lineHeight: 1.6, marginBottom: 7 }}>Arah ini hanya fallback untuk layer lama tanpa embDir; layer baru diatur terpisah di halaman Desain.</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 9 }}>
          <button onClick={() => store.set({ embDir: 'up' })} style={{ ...btnSt, flex: 1, background: s.embDir === 'up' ? '#9a5b1f' : '#fff', color: s.embDir === 'up' ? '#fff' : '#5c554a' }}>Emboss naik ▲</button>
          <button onClick={() => store.set({ embDir: 'down' })} style={{ ...btnSt, flex: 1, background: s.embDir === 'down' ? '#9a5b1f' : '#fff', color: s.embDir === 'down' ? '#fff' : '#5c554a' }}>Deboss turun ▼</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 10.5, color: '#8a8071', marginBottom: 3 }}>Kedalaman mm</div><input type="number" step="0.05" min="0.05" max="1.5" value={s.embDepth} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) store.set({ embDepth: Math.min(1.5, Math.max(0.05, Math.round(v * 100) / 100)) }); }} style={inputSt} /></div>
          <div style={{ flex: 1.3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#3d3830' }}>×3 penguat pratinjau</span>
            <Toggle on={s.embBoost} onClick={() => store.set(st => ({ embBoost: !st.embBoost }))} />
          </div>
        </div>
        <Range label="Ketajaman detail" value={s.embSharpness3d} min={0} max={1} step={0.05} onChange={v => store.set({ embSharpness3d: v })} />
        <Range label="Detail normal" value={s.embNormalStrength3d} min={0} max={3} step={0.05} onChange={v => store.set({ embNormalStrength3d: v })} />
        <Range label="Displacement geometri" value={s.embDisplacementStrength3d} min={0} max={2} step={0.05} onChange={v => store.set({ embDisplacementStrength3d: v })} />
        <div style={{ marginTop: 9, fontSize: 10.5, lineHeight: 1.6, color: '#a59a85' }}>Saran emboss detail: ketajaman 0.8–1, normal 1–2, displacement 0–0.4. Kedalaman karton umum 0.15–0.4mm. Separasi produksi tetap memakai artwork asli dan tidak dipengaruhi parameter 3D ini.</div>
      </Block>
      <div style={{ padding: 14 }}>
        <Note><b style={{ color: '#211d18' }}>Pemetaan UV</b>　Dieline dan 3D dipetakan 1:1; checker 20mm/kotak untuk cek kepadatan dan distorsi tekstur. Tekstur finishing dibake dari posisi layer halaman Desain.</Note>
      </div>
    </div>

    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 38%, #efe9db 0%, #ddd4c0 65%, #cfc4ab 100%)' }}>
      <BoxPreview s={s} m={m} context={preview} fitFold={foldPlaying} engineRef={engRef} />
      <div style={{ position: 'absolute', left: 12, bottom: 12, background: 'rgba(250,247,240,0.92)', border: '1px solid #ded5c4', borderRadius: 6, padding: '6px 12px', fontSize: 11, color: '#5c554a', whiteSpace: 'nowrap' }} title="Pilih mode kiri atas lalu drag kiri; scroll untuk zoom; klik dua kali untuk fit">Scroll untuk zoom · klik dua kali untuk fit</div>
    </div>
  </>);
}
