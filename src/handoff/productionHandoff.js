import { TPLS } from '../dieline/templates.js';
import { allModels } from '../dieline/templateCatalog.js';
import { productionQA, qaSummaryMarkdown } from '../qa/productionQA.js';

const clean = v => String(v ?? '').trim();
const today = () => new Date().toISOString().slice(0, 10);

export function handoffManifest(opts = {}) {
  const templates = opts.templates || TPLS;
  const models = opts.models || allModels(templates);
  const qa = opts.qa || productionQA({ templates, models, expectedMinModels: 90, expectedMinTemplates: 10 });
  return {
    projectName: opts.projectName || 'Studio Kemasan',
    liveUrl: opts.liveUrl || 'https://packaging.pojokinfo.my.id',
    asset: opts.asset || '',
    generatedAt: new Date().toISOString(),
    phase: 15,
    qa,
    exports: ['QA Markdown', 'QA JSON', 'Handoff Markdown', 'Handoff JSON', 'Handoff Bundle TXT'],
    productionPaths: {
      repo: 'AstaKraf local deployment',
      staticRoot: '/var/www/packaging.pojokinfo.my.id',
      nginxSite: '/etc/nginx/sites-enabled/packaging.pojokinfo.my.id',
      certDir: '/etc/letsencrypt/live/packaging.pojokinfo.my.id/'
    },
    noPushPolicy: true,
    nextPhases: [
      { phase: 16, title: 'Device PNG export parity', goal: 'Samakan DeviceMockupView dengan export PNG transparan Phase 12.' },
      { phase: 17, title: 'More production dielines', goal: 'Tambah Pillow Box, Pizza Box, Shipping Box RSC ke TPLS.' },
      { phase: 18, title: 'Binary GLB export', goal: 'Export mesh produksi jadi GLB binary, bukan metadata glTF lightweight.' }
    ]
  };
}

export function handoffChecklist(manifest) {
  return {
    hasLiveUrl: clean(manifest.liveUrl).startsWith('https://'),
    hasQAReport: !!manifest.qa && manifest.qa.ready === true,
    hasExportList: Array.isArray(manifest.exports) && manifest.exports.length >= 5,
    hasProductionPaths: !!manifest.productionPaths?.repo && !!manifest.productionPaths?.staticRoot,
    hasNoPushPolicy: manifest.noPushPolicy === true,
    hasNextPhases: Array.isArray(manifest.nextPhases) && manifest.nextPhases.length >= 3
  };
}

export function handoffMarkdown(manifest) {
  const checks = handoffChecklist(manifest);
  const checkLines = Object.entries(checks).map(([k, v]) => `- ${v ? '✓' : '○'} ${k}`).join('\n');
  const exportLines = manifest.exports.map(x => `- ${x}`).join('\n');
  const pathLines = Object.entries(manifest.productionPaths || {}).map(([k, v]) => `- ${k}: \`${v}\``).join('\n');
  const nextLines = manifest.nextPhases.map(x => `- Phase ${x.phase}: ${x.title} — ${x.goal}`).join('\n');
  return `# Production Handoff\n\n- Project: ${manifest.projectName}\n- Live URL: ${manifest.liveUrl}\n- Asset: ${manifest.asset || '-'}\n- Phase: ${manifest.phase}\n- Generated: ${manifest.generatedAt}\n- GitHub push: ${manifest.noPushPolicy ? 'NO PUSH' : 'allowed'}\n\n## Checklist\n${checkLines}\n\n## Export Paket\n${exportLines}\n\n## Path Produksi\n${pathLines}\n\n## QA Ringkas\n${qaSummaryMarkdown(manifest.qa)}\n\n## Next Phase\n${nextLines}\n`;
}

export function bundleText(manifest) {
  return `=== HANDOFF.md ===\n${handoffMarkdown(manifest)}\n\n=== manifest.json ===\n${JSON.stringify(manifest, null, 2)}\n`;
}

export function handoffFileName(ext = 'md') {
  return `production-handoff-${today()}.${ext}`;
}

export function downloadHandoff(manifest, ext = 'md') {
  const text = ext === 'json' ? JSON.stringify(manifest, null, 2) : ext === 'txt' ? bundleText(manifest) : handoffMarkdown(manifest);
  const type = ext === 'json' ? 'application/json' : ext === 'txt' ? 'text/plain' : 'text/markdown';
  const a = document.createElement('a');
  const url = URL.createObjectURL(new Blob([text], { type }));
  a.href = url; a.download = handoffFileName(ext); a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
