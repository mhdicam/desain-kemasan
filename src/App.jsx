// workbenchshell：topbar, empat workspace与status bar；启动直接进workbench (无工程首page，工程为纯本地 .boxproj 文件)
import React, { useState } from 'react';
import { store, useStore } from './state/store.js';
import { geomOf, creaseSegsOf } from './dieline/geom.js';
import { TPLS } from './dieline/templates.js';
import { categoryOfTemplate, allModels } from './dieline/templateCatalog.js';
import { warnsOf } from './design/layers.js';
import { PackagingHome } from './ui/PackagingHome.jsx';
import { StructureView } from './ui/StructureView.jsx';
import { DesignView } from './ui/DesignView.jsx';
import { ThreeView } from './ui/ThreeView.jsx';
import { DeviceMockupView } from './ui/DeviceMockupView.jsx';
import { MultiMockupView } from './ui/MultiMockupView.jsx';
import { OutputView } from './ui/OutputView.jsx';
import { BriefWorkflowView } from './ui/BriefWorkflowView.jsx';
import { ProductionQAView } from './ui/ProductionQAView.jsx';
import { ProductionHandoffView } from './ui/ProductionHandoffView.jsx';
import { AssemblyInspectorView } from './ui/AssemblyInspectorView.jsx';
import { LogoCat } from './ui/widgets.jsx';
import { exportPDF } from './export/pdf.js';
import { asset } from './asset.js';
import { loadPresetBox } from './preset/presetBox.js';
import { chooseProjectFile, downloadProject, projectStateOf } from './projects/projects.js';

export function App() {
  const s = useStore();
  const [iconOk, setIconOk] = useState(true);
  const m = store.mat();
  const g = geomOf(s, m.t);
  const fmt = v => Math.round(v * 10) / 10;
  const sw = g.sbb[2] - g.sbb[0], sh = g.sbb[3] - g.sbb[1];
  const tplName = allModels().find(x=>x.id===(s.activeModelId||s.tpl))?.name||s.activeModelId||s.tpl;
  const tplCategory = s.selectedCategory||categoryOfTemplate(s.tpl).name;
  const creaseSegs = creaseSegsOf(g);
  const warnN = s.layers.reduce((a, l) => a + warnsOf(l, creaseSegs, g.sbb).length, 0);
  const okAll = warnN === 0;
  const tabs = [['home', 'Kemasan'], ['structure', 'Model'], ['design', 'Desain'], ['three', '3D'], ['inspector', 'Assembly Inspector'], ['brief', 'Brief'], ['qa', 'QA'], ['handoff', 'Handoff'], ['output', 'Output']];

  const importProject = async () => {
    try {
      const doc = await chooseProjectFile();
      if (!doc) return;
      store.reset(await projectStateOf(doc, 'design'));
    } catch (e) { window.alert(e.message); }
  };
  const exportProject = () => {
    const stamp = new Date().toLocaleDateString('id-ID', { month: '2-digit', day: '2-digit' });
    downloadProject(store.get(), { name: tplName + ' ' + s.L + '×' + s.W + '×' + s.H + ' ' + stamp });
  };
  const resetPreset = async () => {
    if (!window.confirm('Reset ke box contoh? Perubahan yang belum diekspor akan hilang.')) return;
    store.reset(await loadPresetBox());
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f1e8', fontSize: 13 }}>
      <div style={{ height: 48, flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', background: '#211d18', color: '#f5f1e8', whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {iconOk
            ? <img src={asset('/brand/logo-header-gold.webp')} alt="" onError={() => setIconOk(false)} style={{ width: 26, height: 26, display: 'block' }} />
            : <LogoCat size={24} />}
          <b style={{ fontSize: 14, letterSpacing: '0.06em' }}>Studio Kemasan</b>
          <span style={{ fontSize: 10.5, color: '#c8bda9', letterSpacing: '0.04em' }}>AstaKraf</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 5 }}>
          {tabs.map(tb => (
            <button key={tb[0]} onClick={() => store.set({ view: tb[0] })}
              style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', flex: 'none', background: s.view === tb[0] ? '#9a5b1f' : 'transparent', color: s.view === tb[0] ? '#fff' : '#cfc7b8', fontWeight: s.view === tb[0] ? 700 : 400 }}>{tb[1]}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div title={(okAll ? 'Validasi struktur lulus' : 'Peringatan layer desain ' + warnN + ' item') + ' · Garis potong ' + g.cutN + ' · Garis lipat ' + g.creaseN}
          style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: okAll ? '#8fc79e' : '#f0b070', whiteSpace: 'nowrap', flex: 'none', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ width: 7, height: 7, borderRadius: 99, background: okAll ? '#3f9e5f' : '#e08030', flex: 'none' }} />
          {okAll ? 'Validasi lulus' : 'Peringatan ' + warnN}
        </div>
        <button onClick={importProject} style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #6a6151', cursor: 'pointer', fontSize: 12, background: 'transparent', color: '#e8dfcc', whiteSpace: 'nowrap' }}>Impor Proyek</button>
        <button onClick={exportProject} style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #6a6151', cursor: 'pointer', fontSize: 12, background: 'transparent', color: '#e8dfcc', whiteSpace: 'nowrap' }}>Ekspor Proyek</button>
        <button onClick={resetPreset} title="Kembalikan ke box contoh bawaan" style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #6a6151', cursor: 'pointer', fontSize: 12, background: 'transparent', color: '#e8dfcc', whiteSpace: 'nowrap' }}>Reset Contoh Box</button>
        <button onClick={async () => { try { await exportPDF(s, m, s.pdfMode); } catch (e) { alert(e.message || String(e)); } }} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, background: '#9a5b1f', color: '#fff', whiteSpace: 'nowrap', flex: 'none' }}>Ekspor PDF</button>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {s.view === 'home' && <PackagingHome />}
        {s.view === 'structure' && <StructureView />}
        {s.view === 'design' && <DesignView />}
        {s.view === 'three' && (s.selectedCategory === 'device-gadget' ? <DeviceMockupView /> : (['apparel','merchandise','display-booth','food-beverage','print-stationery','custom-model'].includes(s.selectedCategory) ? <MultiMockupView /> : <ThreeView />))}
        {s.view === 'inspector' && <AssemblyInspectorView />}
        {s.view === 'brief' && <BriefWorkflowView />}
        {s.view === 'qa' && <ProductionQAView />}
        {s.view === 'handoff' && <ProductionHandoffView />}
        {s.view === 'output' && <OutputView />}
      </div>

      <div style={{ height: 26, flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', background: '#efe9dc', borderTop: '1px solid #ded5c4', fontSize: 11, color: '#6d6557', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap', overflow: 'hidden', lineHeight: '26px' }}>
        <span>{tplCategory} · {tplName} · {m.name} t={m.t}</span>
        <span>Bentang {fmt(sw)}×{fmt(sh)} mm</span>
        <span>Bleed {s.bleed} mm</span>
        <div style={{ flex: 1 }} />
        <span>Zoom {Math.round((s.k || 1) * 100)}%</span>
        <span>Satuan mm</span>
      </div>
    </div>
  );
}
