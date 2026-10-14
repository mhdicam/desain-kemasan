import React, { useMemo } from 'react';
import { store, useStore } from '../state/store.js';
import { TPLS } from '../dieline/templates.js';
import { categoryCards, saveCategoryThumbnail, templateMeta, searchModels, catalogStats, modelStatus, selectableTemplateId, packagingFallbackNote, unsupportedProductionPackaging, modelDielineAudit, modelDielineOutput, modelThumbShape } from '../dieline/templateCatalog.js';
import { geomOf } from '../dieline/geom.js';
import { reflowLayersToContainers } from '../design/containers.js';
import { CatalogExportButtons } from './CatalogExport.jsx';

function CategoryThumb({ cat }) {
  if (cat.thumbnail) return <img src={cat.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
  const c = cat.color || '#9a5b1f';
  const base = <rect width="160" height="105" fill="#f8f0e3" />;
  if (cat.thumb === 'device') return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<rect x="55" y="18" width="50" height="72" rx="8" fill={c} opacity=".9"/><rect x="60" y="26" width="40" height="52" rx="3" fill="#fff" opacity=".72"/><circle cx="80" cy="84" r="3" fill="#fff" opacity=".8"/><rect x="18" y="40" width="48" height="31" rx="3" fill={c} opacity=".35"/><rect x="94" y="37" width="48" height="35" rx="4" fill={c} opacity=".45"/></svg>;
  if (cat.thumb === 'apparel') return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<path d="M54 26 72 18h16l18 8 19 17-13 14-9-8v39H57V49l-9 8-13-14z" fill={c} opacity=".88"/><path d="M72 18c2 10 14 10 16 0" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3"/></svg>;
  if (cat.thumb === 'merch') return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<path d="M52 30h54v42c0 15-54 15-54 0z" fill={c} opacity=".85"/><path d="M106 42h14c13 0 13 25 0 25h-14" fill="none" stroke={c} strokeWidth="8" opacity=".65"/><ellipse cx="79" cy="30" rx="27" ry="8" fill="#fff" opacity=".45"/></svg>;
  if (cat.thumb === 'print') return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<rect x="38" y="18" width="58" height="72" rx="3" fill={c} opacity=".28"/><rect x="50" y="26" width="58" height="72" rx="3" fill={c} opacity=".75"/><path d="M60 42h38M60 53h28M60 67h34" stroke="#fff" strokeOpacity=".65" strokeWidth="4"/></svg>;
  if (cat.thumb === 'display') return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<rect x="57" y="16" width="46" height="72" rx="3" fill={c} opacity=".85"/><path d="M63 31h34M63 43h28M63 63h34" stroke="#fff" strokeOpacity=".6" strokeWidth="4"/><path d="M48 91h64M80 88v10" stroke={c} strokeWidth="5" strokeLinecap="round"/></svg>;
  if (cat.thumb === 'food') return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<path d="M54 27h52l-8 61H62z" fill={c} opacity=".82"/><ellipse cx="80" cy="27" rx="29" ry="8" fill={c}/><path d="M63 50h34" stroke="#fff" strokeOpacity=".55" strokeWidth="6"/><path d="M36 72h42l-6 16H42z" fill={c} opacity=".45"/></svg>;
  if (cat.thumb === 'custom') return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<path d="M80 20 116 41v42L80 97 44 83V41z" fill={c} opacity=".76"/><path d="M44 41 80 60l36-19M80 60v37" fill="none" stroke="#fff" strokeOpacity=".48" strokeWidth="3"/><path d="M73 36h14M80 29v14" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></svg>;
  if (cat.thumb === 'tube') return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<ellipse cx="80" cy="28" rx="38" ry="13" fill={c} opacity=".62"/><rect x="42" y="28" width="76" height="50" fill={c} opacity=".78"/><ellipse cx="80" cy="78" rx="38" ry="13" fill={c}/></svg>;
  if (cat.thumb === 'mailer') return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<path d="M28 68 58 29h75l-27 39z" fill={c} opacity=".9"/><path d="M28 68h78l26-39 2 31-29 23H42z" fill={c} opacity=".58"/></svg>;
  return <svg viewBox="0 0 160 105" width="100%" height="100%">{base}<path d="M48 31h48l18 17v37H66L48 68z" fill={c} opacity=".9"/><path d="M48 31 66 48h48L96 31z" fill={c} opacity=".55"/><path d="M66 48v37M114 48v37" stroke="#fff" strokeOpacity=".45" strokeWidth="3"/></svg>;
}

function ModelThumb({ model }) {
  const c = model.color || '#9a5b1f';
  const variant = model.thumb || (model.category === 'tube' ? 'tube' : model.category === 'mailer' ? 'mailer' : model.mockup ? 'custom' : 'folding');
  return <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CategoryThumb cat={{ thumb: variant, color: c }} /></div>;
}

function readUpload(file, categoryId) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 1_500_000) { window.alert('Ukuran gambar maksimal 1.5 MB.'); return; }
  const r = new FileReader();
  r.onload = () => store.set(st => ({ categoryThumbnails: saveCategoryThumbnail(st.categoryThumbnails, categoryId, String(r.result || '')) }));
  r.readAsDataURL(file);
}

function openModel(model) {
  const isPackaging = model.productCategory === 'packaging' || model.category === 'packaging';
  if (isPackaging) {
    const tpl = selectableTemplateId(model, TPLS);
    store.set(st => {
      const mat = store.mat();
      const next = { ...st, tpl, ovr: {}, typeOvr: {} };
      return { selectedCategory: 'packaging', selectedMockup: model.id, selectedPackagingModel: model.id, selectedPackagingName: model.name, packagingFallbackNote: packagingFallbackNote(model, TPLS), tpl, ovr: {}, typeOvr: {}, selSeg: null, view: 'design', fitNonce: st.fitNonce + 1, layers: reflowLayersToContainers(st.layers, geomOf(st, mat.t), geomOf(next, mat.t)) };
    });
    return;
  }
  if (model.mockup) {
    const tpl = selectableTemplateId(model, TPLS);
    store.set(st => {
      const mat = store.mat();
      const next = { ...st, tpl, ovr: {}, typeOvr: {} };
      return { selectedCategory: model.productCategory || model.category, selectedMockup: model.id, selectedPackagingModel: model.id, selectedPackagingName: model.name, packagingFallbackNote: packagingFallbackNote(model, TPLS), tpl, ovr: {}, typeOvr: {}, selSeg: null, view: model.mode === 'Brief' ? 'home' : 'three', fitNonce: st.fitNonce + 1, layers: reflowLayersToContainers(st.layers, geomOf(st, mat.t), geomOf(next, mat.t)) };
    });
    return;
  }
  store.set(st => {
    const mat = store.mat();
    const next = { ...st, tpl: model.id, ovr: {}, typeOvr: {} };
    return { selectedCategory: 'packaging', tpl: model.id, ovr: {}, typeOvr: {}, selSeg: null, view: 'design', fitNonce: st.fitNonce + 1, layers: reflowLayersToContainers(st.layers, geomOf(st, mat.t), geomOf(next, mat.t)) };
  });
}

export function PackagingHome() {
  const s = useStore();
  const cards = useMemo(() => categoryCards(s.categoryThumbnails || {}, TPLS), [s.categoryThumbnails]);
  const stats = useMemo(() => catalogStats(TPLS), []);
  const unsupportedPackaging = useMemo(() => unsupportedProductionPackaging(TPLS), []);
  const selectedId = s.selectedCategory || '';
  const selected = selectedId ? cards.find(c => c.id === selectedId) : null;
  const q = s.catalogSearch || '';
  const models = selected ? searchModels(q, selected.id, TPLS) : [];
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 22, background: 'linear-gradient(180deg,#f7f1e7,#efe7da)' }}>
      <style>{`
        .catalog-category-card, .catalog-model-card {
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
          will-change: transform;
        }
        .catalog-category-card:hover {
          transform: translateY(-5px) scale(1.015);
          box-shadow: 0 18px 44px rgba(70,50,25,.18) !important;
          border-color: #9a5b1f !important;
        }
        .catalog-category-card:hover img,
        .catalog-category-card:hover svg,
        .catalog-model-card:hover img,
        .catalog-model-card:hover svg {
          transform: scale(1.045);
        }
        .catalog-category-card img, .catalog-category-card svg,
        .catalog-model-card img, .catalog-model-card svg {
          transition: transform .22s ease;
        }
        .catalog-model-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 38px rgba(70,50,25,.15) !important;
          border-color: #9a5b1f !important;
          background: #fffaf2 !important;
        }
        .catalog-model-card:hover .model-card-overlay {
          opacity: 1 !important;
        }
      `}</style>
      <div style={{ maxWidth: 1220, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: '#9a5b1f', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Mockup & Product Design Studio</div>
            <h1 style={{ margin: '5px 0 6px', fontSize: 28, lineHeight: 1.12, color: '#211d18' }}>Pilih kategori produk, lalu pilih model untuk desain, mockup, dan 3D.</h1>
            <div style={{ color: '#6d6557', fontSize: 13.5 }}>Kategori sudah diperluas: kemasan, device, apparel, merchandise, print, display, F&B, dan custom model. Thumbnail kategori bisa diganti via upload gambar.</div>
          </div>
          <button onClick={() => store.set({ view: 'design' })} style={{ border: '1px solid #cdbfaa', background: '#fffaf2', color: '#6d4724', borderRadius: 9, padding: '10px 13px', cursor: 'pointer', fontWeight: 800 }}>Lanjut ke Desain</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,1fr) repeat(3,minmax(120px,170px))', gap: 10, marginBottom: 12 }}>
          <input value={q} onChange={e => store.set({ catalogSearch: e.target.value })} placeholder="Cari model: label, hoodie, banner, custom..." style={{ border: '1px solid #d8cbb8', borderRadius: 10, padding: '11px 13px', fontWeight: 700, color: '#3d352b', background: '#fffdf8' }} />
          <div style={{ background: '#fffdf8', border: '1px solid #ded3c1', borderRadius: 10, padding: '8px 10px' }}><b style={{ color: '#211d18' }}>{stats.total}</b><div style={{ fontSize: 11, color: '#7d725f' }}>Total model</div></div>
          <div style={{ background: '#fffdf8', border: '1px solid #ded3c1', borderRadius: 10, padding: '8px 10px' }}><b style={{ color: '#211d18' }}>{stats.mockupReady}</b><div style={{ fontSize: 11, color: '#7d725f' }}>Mockup ready</div></div>
          <div style={{ background: '#fffdf8', border: '1px solid #ded3c1', borderRadius: 10, padding: '8px 10px' }}><b style={{ color: '#211d18' }}>{stats.productionReady}</b><div style={{ fontSize: 11, color: '#7d725f' }}>Produksi valid</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {Object.entries(stats.statusCounts || {}).map(([label, count]) => <span key={label} style={{ background: '#fffdf8', border: '1px solid #ded3c1', borderRadius: 99, padding: '5px 9px', fontSize: 11, color: '#6d6557' }}><b>{count}</b> {label}</span>)}
        </div>
        <div style={{ marginBottom: 16 }}><CatalogExportButtons /></div>
        {selected && unsupportedPackaging.length > 0 && <div style={{ marginBottom: 14, background: '#fff8e6', border: '1px solid #ead7ad', borderRadius: 12, padding: 12, color: '#6b4b16' }}>
          <b>Catatan jujur: {unsupportedPackaging.length} model packaging belum siap produksi.</b>
          <div style={{ fontSize: 12, marginTop: 5, lineHeight: 1.5 }}>Model ini belum punya dieline parametris/mesh/PDF sendiri. Saat dipilih, panel Desain dan 3D tetap memakai fitur model lama fallback <b>Folding Carton STE</b> supaya layer, validator, PDF, dan preview tetap jalan.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{unsupportedPackaging.map(m => <span key={m.id} style={{ background: '#fff', border: '1px solid #ead7ad', borderRadius: 999, padding: '4px 8px', fontSize: 11, fontWeight: 800 }}>{m.name}</span>)}</div>
        </div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 22 }}>
          {cards.map(cat => {
            const active = cat.id === selectedId;
            return (
              <div key={cat.id} className="catalog-category-card" onClick={() => store.set({ selectedCategory: cat.id })} style={{ cursor: 'pointer', border: '1px solid ' + (active ? '#9a5b1f' : '#ded3c1'), background: active ? '#fff7ea' : '#fffdf8', borderRadius: 14, boxShadow: active ? '0 12px 32px rgba(154,91,31,.16)' : '0 6px 18px rgba(70,50,25,.07)', overflow: 'hidden' }}>
                <div style={{ height: 118, background: '#f3eadb', position: 'relative', overflow: 'hidden' }}><CategoryThumb cat={cat} /><div style={{ position: 'absolute', right: 10, top: 10, background: 'rgba(255,255,255,.88)', color: cat.color, borderRadius: 99, padding: '4px 8px', fontSize: 11, fontWeight: 800 }}>{cat.count} model</div></div>
                <div style={{ padding: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div style={{ fontSize: 15, fontWeight: 900, color: '#211d18' }}>{cat.name}</div><span style={{ fontSize: 10, color: cat.color, fontWeight: 900 }}>{cat.group}</span></div>
                  <div style={{ fontSize: 12, color: '#756b5b', lineHeight: 1.4, marginTop: 4, minHeight: 34 }}>{cat.desc}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 11 }} onClick={e => e.stopPropagation()}>
                    <label style={{ flex: 1, textAlign: 'center', border: '1px dashed #cdbfaa', borderRadius: 8, padding: '7px 8px', cursor: 'pointer', color: '#7a5430', fontWeight: 800, fontSize: 12, background: '#fff' }}>Upload Thumbnail<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => readUpload(e.target.files?.[0], cat.id)} /></label>
                    {cat.thumbnail && <button onClick={() => store.set(st => ({ categoryThumbnails: saveCategoryThumbnail(st.categoryThumbnails, cat.id, '') }))} style={{ border: '1px solid #e0cfc0', borderRadius: 8, padding: '7px 9px', background: '#fff', cursor: 'pointer', color: '#9a5b1f', fontWeight: 800 }}>Reset</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selected && <div style={{ background: '#fffdf8', border: '1px solid #ded3c1', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div><h2 style={{ margin: 0, fontSize: 19, color: '#211d18' }}>{selected.name}</h2><div style={{ fontSize: 12.5, color: '#756b5b', marginTop: 3 }}>{selected.desc}</div></div>
            <div style={{ color: '#9a5b1f', fontWeight: 900 }}>{models.length} model tersedia</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 }}>
            {models.map(model => {
              const active = (!model.mockup && s.tpl === model.id) || (model.mockup && s.selectedMockup === model.id);
              return <div key={model.id} className="catalog-model-card" onClick={() => openModel(model)} aria-label={`Buka ${model.name}`} title={`Buka ${model.name}`} style={{ minHeight: 230, border: '1px solid ' + (active ? '#9a5b1f' : '#eee5d7'), background: '#fff', borderRadius: 16, padding: 0, cursor: 'pointer', boxShadow: active ? '0 14px 30px rgba(154,91,31,.14)' : '0 8px 22px rgba(70,50,25,.06)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, minHeight: 180 }}>
                    <ModelThumb model={{ ...model, color: selected.color, thumb: modelThumbShape(model.id) }} />
                  </div>
                  <div style={{ padding: '10px 12px', background: '#fff', borderTop: '1px solid #f0e8dc', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#211d18', lineHeight: 1.3 }}>{model.name}</div>
                  </div>
                </div>
                <div className="model-card-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(33,29,24,.65)', opacity: 0, transition: 'opacity .22s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <button style={{ border: 'none', background: selected.color, color: '#fff', borderRadius: 10, padding: '11px 18px', fontWeight: 900, cursor: 'pointer', fontSize: 14 }}>Mulai Desain</button>
                </div>
              </div>;
            })}
          </div>
        </div>}
      </div>
    </div>
  );
}
