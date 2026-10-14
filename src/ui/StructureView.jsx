// Strukturview：Library Box / Ukuran dalam / Material / Parameter produksi / Edit tipe garis + tengahdielinekanvas + panel kanan规格与Validasi
import React, { useMemo, useState } from 'react';
import { store, useStore } from '../state/store.js';
import { TPLS, MATS } from '../dieline/templates.js';
import { categoryOfTemplate, templateMeta, templatesByCategory } from '../dieline/templateCatalog.js';
import { geomOf } from '../dieline/geom.js';
import { reflowLayersToContainers } from '../design/containers.js';
import { SheetCanvas } from './SheetCanvas.jsx';
import { ST, Block, Toggle, ToggleRow, NumField, Note, KV, selectSt, btnSt } from './widgets.jsx';

const setNum = (key, min, max) => e => {
  const v = parseFloat(e.target.value);
  if (!isNaN(v)) store.set(st => {
    const next = { ...st, [key]: Math.min(max, Math.max(min, v)) }, mat = store.mat();
    return { [key]: next[key], layers: reflowLayersToContainers(st.layers, geomOf(st, mat.t), geomOf(next, mat.t)) };
  });
};

export function StructureView() {
  const s = useStore();
  const [openCat, setOpenCat] = useState(() => categoryOfTemplate(s.tpl).id);
  const groupedTemplates = useMemo(() => templatesByCategory(TPLS), []);
  const m = store.mat();
  const g = geomOf(s, m.t);
  const fmt = v => Math.round(v * 10) / 10;
  const t = m.t;
  const sw = g.sbb[2] - g.sbb[0], sh = g.sbb[3] - g.sbb[1];
  const tkNow = Math.min(16, s.W * 0.55);
  const specTpl = {
    rte: [{ k: 'Urutan lebar panel', v: fmt(s.W + t) + '·' + fmt(s.L + t) + '·' + fmt(s.W + t) + '·' + fmt(s.L + 2 * t) }, { k: 'Kedalaman tutup / flap selip', v: fmt(s.W + t) + ' / ' + fmt(tkNow) }],
    ste: [{ k: 'Urutan lebar panel', v: fmt(s.W + t) + '·' + fmt(s.L + t) + '·' + fmt(s.W + t) + '·' + fmt(s.L + 2 * t) }, { k: 'Kedalaman tutup / flap selip', v: fmt(s.W + t) + ' / ' + fmt(tkNow) }],
    mailer: [{ k: 'Lebar dinding samping', v: fmt(s.H + t) }, { k: 'Kedalaman flap selip', v: fmt(Math.min(s.H * 0.7, 28)) }],
    lidbase: [{ k: 'Allowance tutup', v: ' +1.0 mm/sisi' }, { k: 'Tinggi tutup', v: fmt(Math.max(14, s.H * 0.45)) }],
    drawer: [{ k: 'Allowance sleeve', v: '+2~4 × t' }, { k: 'Kedalaman sleeve', v: fmt(s.L + 2) }],
    cyl: [{ k: 'Diameter D', v: fmt(s.L) + ' mm' }, { k: 'Segmen', v: '24 × ' + fmt(Math.PI * s.L / 24) + ' mm' }],
    hex: [{ k: 'Panjang sisi', v: fmt(s.W) + ' mm' }, { k: 'Diameter lingkar luar', v: fmt(2 * s.W / (2 * Math.sin(Math.PI / 6))) + ' mm' }]
  };
  const specRows = [
    { k: 'Ukuran bentang', v: fmt(sw) + ' × ' + fmt(sh) },
    { k: 'Termasuk bleed', v: fmt(sw + 2 * s.bleed) + ' × ' + fmt(sh + 2 * s.bleed) },
    { k: 'Tebal kertas t', v: t + ' mm' }
  ].concat(specTpl[s.tpl] || []);
  const checks = ['Kontur luar tertutup', 'Tidak ada self-intersection / garis terisolasi', 'Jarak pisau minimal ≥ 1.5 mm', 'Dua sisi garis lipat punya panel tersambung', 'Bleed ≥ ' + m.bleed + ' mm (' + m.note + ')'];
  const compNote = s.tpl === 'rte' || s.tpl === 'ste' ? 'Saat ini: W+t · L+t · W+t · L+2t，tinggi H+t' : s.tpl === 'mailer' ? 'Saat ini: ketebalan flute t=' + t + '，Dinding samping H+t，lebar tutup W+3t' : s.tpl === 'cyl' ? 'Saat ini: Diameter D=L，body silinder dilipat 24 segmen, tutup 24 sisi' : s.tpl === 'hex' ? 'Saat ini: Panjang sisi W，hex tube, tutup hexagon reguler' : 'Saat ini: tutup/sleeve memakai allowance +1mm/sisi';
  const editOn = s.editMode;
  const typeOvrCount = Object.keys(s.typeOvr).length;
  const selSegOk = editOn && s.selSeg != null && g.segs[s.selSeg];
  const curSegT = selSegOk ? g.segs[s.selSeg].t : '';

  return (<>
    <style>{`
      .structure-model-category, .structure-model-card {
        transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease;
      }
      .structure-model-category:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px rgba(70,50,25,.12);
        border-color: #c99654 !important;
      }
      .structure-model-card:hover {
        transform: translateX(3px);
        box-shadow: 0 8px 18px rgba(70,50,25,.12);
        border-color: #9a5b1f !important;
        background: #fff7ea !important;
      }
    `}</style>
    <div style={{ width: 246, flex: 'none', background: '#faf7f0', borderRight: '1px solid #ded5c4', overflowY: 'auto' }}>
      <Block>
        <ST>Management Model Packaging</ST>
        <div style={{ fontSize: 11, color: '#8a8071', lineHeight: 1.45, marginBottom: 9 }}>Pilih model berdasarkan kategori produksi. Template aktif otomatis reset edit garis dan reflow layer ke panel baru.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {groupedTemplates.map(cat => {
            const activeInCat = cat.templates.some(tpl => tpl.id === s.tpl);
            const isOpen = openCat === cat.id || activeInCat;
            return (
              <div key={cat.id} className="structure-model-category" style={{ border: '1px solid ' + (activeInCat ? '#c99654' : '#e2dac9'), background: activeInCat ? '#fbf2e4' : '#fff', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setOpenCat(isOpen && !activeInCat ? '' : cat.id)} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px 9px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: activeInCat ? '#9a5b1f' : '#efe7d8', color: activeInCat ? '#fff' : '#6d6557', fontSize: 11, flex: 'none' }}>{cat.templates.length}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 12.5, color: '#211d18' }}>{cat.name}</b>
                    <span style={{ display: 'block', fontSize: 10.5, color: '#8a8071', marginTop: 1 }}>{cat.desc}</span>
                  </span>
                  <span style={{ color: '#9a5b1f', fontSize: 13 }}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, padding: '0 8px 8px' }}>
                    {cat.templates.map(b => {
                      const meta = templateMeta(b.id);
                      return (
                        <div key={b.id} className="structure-model-card" onClick={() => store.set(st => { const mat = store.mat(), next = { ...st, tpl: b.id, ovr: {}, typeOvr: {} }; return { tpl: b.id, ovr: {}, typeOvr: {}, selSeg: null, fitNonce: st.fitNonce + 1, layers: reflowLayersToContainers(st.layers, geomOf(st, mat.t), geomOf(next, mat.t)) }; })}
                          style={{ cursor: 'pointer', border: '1px solid ' + (s.tpl === b.id ? '#9a5b1f' : '#eadfce'), background: s.tpl === b.id ? '#f7efe2' : '#fff', borderRadius: 7, padding: '8px 9px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, color: s.tpl === b.id ? '#9a5b1f' : '#a59a85' }}>{b.code}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#211d18' }}>{b.name}</div>
                          </div>
                          <div style={{ fontSize: 10.5, color: '#8a8071', marginTop: 3 }}>{b.sub} · {meta.stock} · {meta.difficulty}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                            {meta.tags.map(tag => <span key={tag} style={{ fontSize: 9.5, color: '#6d6557', background: '#f0ebe0', borderRadius: 99, padding: '2px 6px' }}>{tag}</span>)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Block>
      <Block>
        <ST>Ukuran dalam · mm</ST>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
          <NumField label="Panjang L" value={s.L} onChange={setNum('L', 20, 600)} />
          <NumField label="Lebar W" value={s.W} onChange={setNum('W', 15, 600)} />
          <NumField label="Tinggi H" value={s.H} onChange={setNum('H', 15, 600)} />
        </div>
      </Block>
      <Block>
        <ST>Material</ST>
        <select value={s.matId} onChange={e => { const nm = MATS.find(x => x.id === e.target.value); store.set(st => { const om = MATS.find(x => x.id === st.matId) || MATS[0], next = { ...st, matId: nm.id, bleed: nm.bleed }; return { matId: nm.id, bleed: nm.bleed, layers: reflowLayersToContainers(st.layers, geomOf(st, om.t), geomOf(next, nm.t)) }; }); }} style={selectSt}>
          {MATS.map(mm => <option key={mm.id} value={mm.id}>{mm.name}</option>)}
        </select>
        <div style={{ fontSize: 11, color: '#8a8071', marginTop: 7 }}>Ketebalan t = <b style={{ color: '#9a5b1f', fontFamily: "'JetBrains Mono',monospace" }}>{t} mm</b> · {m.note}</div>
      </Block>
      <Block>
        <ST>Parameter produksi</ST>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
          <NumField label="Bleed mm" value={s.bleed} onChange={setNum('bleed', 0, 10)} />
          <NumField label="Flap lem mm" value={s.glue} onChange={setNum('glue', 8, 30)} />
        </div>
      </Block>
      <Block>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ST style={{ marginBottom: 0 }}>Edit tipe garis</ST>
          <Toggle on={s.editMode} onClick={() => store.set(st => ({ editMode: !st.editMode, selSeg: null }))} />
        </div>
        {editOn && (<>
          <div style={{ fontSize: 11, color: '#8a8071', marginTop: 8, lineHeight: 1.6 }}>Klik segmen untuk ubah ke garis potong atau garis lipat. Tipe garis diubah <b style={{ color: '#9a5b1f' }}>{typeOvrCount}</b>  titik.</div>
          {selSegOk && (
            <div style={{ marginTop: 9, background: '#f0ebe0', border: '1px solid #e2dac9', borderRadius: 6, padding: '9px 11px' }}>
              <div style={{ fontSize: 11, color: '#6d6557', marginBottom: 7 }}>Segmen dipilih · Saat ini:{curSegT === 'cut' ? 'Garis potong' : 'Garis lipat'}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => store.set(st => ({ typeOvr: { ...st.typeOvr, [st.selSeg]: 'cut' } }))} style={{ ...btnSt, flex: 1, background: curSegT === 'cut' ? '#C8102E' : '#fff', color: curSegT === 'cut' ? '#fff' : '#5c554a' }}>Garis potong</button>
                <button onClick={() => store.set(st => ({ typeOvr: { ...st.typeOvr, [st.selSeg]: 'crease' } }))} style={{ ...btnSt, flex: 1, background: curSegT === 'crease' ? '#2E7D46' : '#fff', color: curSegT === 'crease' ? '#fff' : '#5c554a' }}>Garis lipat</button>
              </div>
            </div>
          )}
          <button onClick={() => store.set({ typeOvr: {}, selSeg: null })} style={{ ...btnSt, marginTop: 9, width: '100%', padding: '7px 0', color: '#5c554a' }}>Reset edit tipe garis</button>
        </>)}
      </Block>
      <div style={{ padding: 14 }}>
        <Note><b style={{ color: '#211d18' }}>Kompensasi ketebalan kertas</b>　Ukuran produksi = ukuran dalam + n × t<br />{compNote}</Note>
      </div>
    </div>

    <SheetCanvas view="structure" g={g} />

    <div style={{ width: 258, flex: 'none', background: '#faf7f0', borderLeft: '1px solid #ded5c4', overflowY: 'auto' }}>
      <Block><ST>Ukuran produksi (terkompensasi)</ST>{specRows.map(r => <KV key={r.k} k={r.k} v={r.v} />)}</Block>
      <Block>
        <ST>Statistik diecut</ST>
        <KV k="Garis potong" v={fmt(g.cutLen / 1000) + ' m · ' + g.cutN + ' segmen'} />
        <KV k="Garis lipat" v={fmt(g.creaseLen / 1000) + ' m · ' + g.creaseN + ' segmen'} />
      </Block>
      <Block>
        <ST>Tampilan</ST>
        {[['bleed', 'Area bleed'], ['safe', 'Area aman'], ['dims', 'Label ukuran'], ['labels', 'Nama panel']].map(x => (
          <ToggleRow key={x[0]} label={x[1]} on={s.show[x[0]]} onClick={() => store.set(st => ({ show: { ...st.show, [x[0]]: !st.show[x[0]] } }))} />
        ))}
      </Block>
      <div style={{ padding: 14 }}>
        <ST>Validasi</ST>
        {checks.map(c => (
          <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: '#3d3830' }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: '#3f9e5f', flex: 'none' }} />{c}
          </div>
        ))}
      </div>
    </div>
  </>);
}
