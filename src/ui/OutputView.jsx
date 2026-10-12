// Outputview：Ringkasan proyek / Preflight sebelum ekspor / Finishingseparasidaftar / File produksi
import React from 'react';
import { store, useStore } from '../state/store.js';
import { geomOf, creaseSegsOf } from '../dieline/geom.js';
import { TPLS } from '../dieline/templates.js';
import { warnsOf, FIN_NAMES, layerNameOf, dpiOf } from '../design/layers.js';
import { embDirOf } from '../design/emboss.js';
import { exportPDF } from '../export/pdf.js';
import { exportSeparations } from '../export/separations.js';
import { ST, KV, btnSt } from './widgets.jsx';

export function OutputView() {
  const s = useStore();
  const m = store.mat();
  const g = geomOf(s, m.t);
  const fmt = v => Math.round(v * 10) / 10;
  const sw = g.sbb[2] - g.sbb[0], sh = g.sbb[3] - g.sbb[1];
  const tplName = (TPLS.find(x => x.id === s.tpl) || TPLS[0]).name;
  const typeOvrCount = Object.keys(s.typeOvr).length;
  const creaseSegs = creaseSegsOf(g);
  const missingImages = s.layers.filter(l => l.visible && l.kind === 'image' && !l.img);
  const loadedImages = s.layers.filter(l => l.visible && l.kind === 'image' && l.img);
  const lowDpiImages = loadedImages.filter(l => dpiOf(l) < 300);
  const checksArr = [
    { label: 'Halaman dibuat 1:1 dalam mm, TrimBox/BleedBox ditulis', dot: '#3f9e5f' },
    { label: 'CutContour / Crease diekspor sebagai spot color overprint', dot: '#3f9e5f' },
    { label: 'Bleed ' + s.bleed + ' mm ' + (s.bleed >= m.bleed ? '≥' : '<') + ' saran material ' + m.bleed + ' mm (' + m.note + ')', dot: s.bleed >= m.bleed ? '#3f9e5f' : '#d05a2a' },
    { label: missingImages.length ? 'Ada ' + missingImages.length + ' aset gambar belum dimuat; artwork final/separasi finishing akan diblokir' : 'Semua aset gambar sudah dimuat', dot: missingImages.length ? '#d05a2a' : '#3f9e5f' },
    { label: lowDpiImages.length ? 'Ada ' + lowDpiImages.length + ' layer gambar di bawah 300 dpi' : loadedImages.length ? 'Semua gambar termuat mencapai 300 dpi' : 'Belum ada gambar termuat untuk cek DPI', dot: lowDpiImages.length ? '#d05a2a' : loadedImages.length ? '#3f9e5f' : '#9a8f7e' },
    { label: 'Kontur tertutup, self-intersection, garis terisolasi, dan jarak pisau minimal belum dicek otomatis; wajib preflight di vendor/RIP sebelum produksi', dot: '#9a8f7e' }
  ];
  const designWarnRows = s.layers.flatMap(l => warnsOf(l, creaseSegs, g.sbb).map(w => ({ label: 'Layer「' + layerNameOf(l) + '」：' + w, dot: '#d05a2a' })));
  const outChecks = checksArr.concat(designWarnRows);
  const outSummary = [
    { k: 'Tipe box', v: tplName }, { k: 'Ukuran dalam', v: s.L + ' × ' + s.W + ' × ' + s.H + ' mm' },
    { k: 'Material', v: m.name + ' · t=' + m.t }, { k: 'Bleed', v: s.bleed + ' mm' },
    { k: 'Ukuran bentang', v: fmt(sw) + ' × ' + fmt(sh) + ' mm' },
    { k: 'Dieline', v: g.cutN + '  potong · ' + g.creaseN + ' lipat · edit garis ' + typeOvrCount },
    { k: 'Layer desain', v: s.layers.length + ' layer' }
  ];
  const outFins = ['foil', 'silver', 'uv', 'gloss', 'holo'].map(f => ({ k: FIN_NAMES[f] + ' plat', v: s.layers.filter(l => l.finish === f).map(layerNameOf).join(', ') || '—' }))
    .concat(['up', 'down'].map(dir => ({ k: (dir === 'up' ? 'Emboss naik' : 'Deboss turun') + ' plat', v: s.layers.filter(l => l.finish === 'emboss' && embDirOf(l, s.embDir) === dir).map(layerNameOf).join(', ') || '—' })))
    .concat([{ k: 'Cetak CMYK', v: s.layers.filter(l => l.finish === 'none').length + ' layer' }]);
  const card = { background: '#fdfcf7', border: '1px solid #ded5c4', borderRadius: 10, padding: '18px 20px' };
  const runExport = async fn => { try { await fn(); } catch (e) { alert(e.message || String(e)); } };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f0ebe0' }}>
      <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 20px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
        <div style={card}><ST>Ringkasan proyek</ST>{outSummary.map(r => (
          <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '5px 0', fontSize: 12.5, borderBottom: '1px dashed #eee7d8' }}>
            <span style={{ color: '#6d6557', whiteSpace: 'nowrap' }}>{r.k}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#211d18', textAlign: 'right' }}>{r.v}</span>
          </div>))}
        </div>
        <div style={card}>
          <ST>Preflight sebelum ekspor</ST>
          {outChecks.map(c => (
            <div key={c.label} style={{ display: 'flex', gap: 9, alignItems: 'baseline', padding: '4px 0', fontSize: 12.5, color: '#3d3830', lineHeight: 1.5 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: c.dot, flex: 'none', transform: 'translateY(-1px)' }} />{c.label}
            </div>))}
        </div>
        <div style={card}><ST>Daftar separasi finishing (dari layer Desain)</ST>{outFins.map(f => (
          <div key={f.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '5px 0', fontSize: 12.5, borderBottom: '1px dashed #eee7d8' }}>
            <span style={{ color: '#6d6557', whiteSpace: 'nowrap' }}>{f.k}</span>
            <span style={{ color: '#211d18', textAlign: 'right' }}>{f.v}</span>
          </div>))}
        </div>
        <div style={card}>
          <ST>File produksi</ST>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10, fontSize: 12, color: '#3d3830', alignItems: 'center' }}>
            <span style={{ color: '#8a8071', fontSize: 11 }}>PDF cetak:</span>
            {[['cmyk', 'Produksi · CMYK+spot color'], ['professional', 'Artwork final · CMYK'], ['rgb', 'Review · RGB']].map(op => (
              <label key={op[0]} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="radio" name="pdfmode" checked={s.pdfMode === op[0]} onChange={() => store.set({ pdfMode: op[0] })} style={{ accentColor: '#9a5b1f' }} />{op[1]}
              </label>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <button onClick={() => runExport(() => exportPDF(s, m, s.pdfMode))} style={{ ...btnSt, padding: '9px 0', border: '1px solid #9a5b1f', fontSize: 13, fontWeight: 700, color: '#9a5b1f' }}>Ekspor PDF cetak (1:1 · spot color diecut overprint · bleed)</button>
            <button onClick={() => runExport(() => exportSeparations(s, m))} style={{ ...btnSt, padding: '9px 0', border: '1px solid #9a5b1f', fontSize: 13, fontWeight: 700, color: '#9a5b1f' }}>PDF separasi finishing (foil/UV/gloss/emboss)</button>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, lineHeight: 1.65, color: '#8a8071' }}>Artwork final hanya menyertakan layer CMYK biasa; area tanpa desain tetap putih dan tanpa catatan di halaman. Foil/UV/gloss/emboss/holografik diekspor lewat separasi finishing. PDF CMYK memakai konversi 300 dpi sederhana tanpa ICC dan tidak mengklaim PDF/X; warna final ikut proof vendor. Separasi finishing memakai PDF DeviceGray 300 dpi (hitam = area finishing, garis abu = referensi dieline). Efek holografik tidak bisa diwakili CMYK penuh; data produksi menyerahkan area coverage untuk HOLO-FOIL atau film/kartu holografik.</div>
        </div>
      </div>
    </div>
  );
}
