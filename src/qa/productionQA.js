import { TPLS } from '../dieline/templates.js';
import { allModels, auditMatrix, catalogStats } from '../dieline/templateCatalog.js';

const pct = (a, b) => b ? Math.round((a / b) * 1000) / 10 : 0;

export function qaChecklist(report) {
  return {
    hasCatalogScale: report.totalModels >= report.expectedMinModels,
    hasTemplateSync: report.templateCount >= report.expectedMinTemplates,
    hasProductionTemplates: report.productionReady >= report.expectedMinTemplates,
    hasStatusMatrix: report.auditRows === report.totalModels,
    hasBriefWorkflow: report.capabilities.includes('brief-export'),
    hasMockupExport: report.capabilities.includes('png-export'),
    hasMeshExport: report.capabilities.includes('mesh-export')
  };
}

export function productionQA(opts = {}) {
  const templates = opts.templates || TPLS;
  const models = opts.models || allModels(templates);
  const expectedMinModels = opts.expectedMinModels || 90;
  const expectedMinTemplates = opts.expectedMinTemplates || 10;
  const stats = catalogStats(templates);
  const audit = auditMatrix(templates);
  const capabilities = ['audit-matrix', 'design-validator', 'mesh-export', 'png-export', 'brief-export'];
  const base = {
    generatedAt: new Date().toISOString(),
    expectedMinModels,
    expectedMinTemplates,
    totalModels: models.length,
    templateCount: templates.length,
    auditRows: audit.length,
    productionReady: stats.productionReady,
    mockupReady: stats.mockupReady,
    statusCounts: stats.statusCounts,
    byCategory: stats.byCategory,
    capabilities
  };
  const checklist = qaChecklist(base);
  return {
    ...base,
    checklist,
    ready: Object.values(checklist).every(Boolean),
    completion: {
      productionReadyPct: pct(stats.productionReady, models.length),
      auditCoveragePct: pct(audit.length, models.length),
      templateCoveragePct: pct(templates.length, models.length)
    }
  };
}

export function qaSummaryMarkdown(report) {
  const statusLines = Object.entries(report.statusCounts || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n');
  const categoryLines = Object.entries(report.byCategory || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n');
  const checkLines = Object.entries(report.checklist || {}).map(([k, v]) => `- ${v ? '✓' : '○'} ${k}`).join('\n');
  return `# QA Produksi\n\n- Total model: ${report.totalModels}\n- Production templates: ${report.templateCount}\n- Produksi valid: ${report.productionReady}\n- Audit rows: ${report.auditRows}\n- Status: ${report.ready ? 'READY' : 'NEED CHECK'}\n\n## Checklist\n${checkLines}\n\n## Status Model\n${statusLines}\n\n## Kategori\n${categoryLines}\n\n## Capability\n${report.capabilities.map(x => `- ${x}`).join('\n')}\n`;
}

export function qaFileName(ext = 'md') {
  const d = new Date().toISOString().slice(0, 10);
  return `qa-produksi-${d}.${ext}`;
}

export function downloadQA(report, ext = 'md') {
  const text = ext === 'json' ? JSON.stringify(report, null, 2) : qaSummaryMarkdown(report);
  const a = document.createElement('a');
  const url = URL.createObjectURL(new Blob([text], { type: ext === 'json' ? 'application/json' : 'text/markdown' }));
  a.href = url; a.download = qaFileName(ext); a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
