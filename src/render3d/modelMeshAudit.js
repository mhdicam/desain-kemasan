import { allModels } from '../dieline/templateCatalog.js';
import { auditAllModelMeshStrategies } from './meshFactories.js';
import { productionMesh, meshQAReport, exportGLB, verifyGLB } from './meshExport.js';

export function modelMeshAudit(models = allModels()) {
  const rows = auditAllModelMeshStrategies(models);
  const totals = rows.reduce((a, r) => {
    a.total++;
    a.byFactory[r.factory] = (a.byFactory[r.factory] || 0) + 1;
    a.byStatus[r.meshStatus] = (a.byStatus[r.meshStatus] || 0) + 1;
    if (!r.hasImportedSvg && ['WAVE2_RULE_REQUIRED','WAVE1_PROTOTYPE_READY'].includes(r.meshStatus)) a.missingSourceGeometry.push(r.id);
    return a;
  }, { total:0, byFactory:{}, byStatus:{}, missingSourceGeometry:[] });
  return { rows, totals, physicalProductionApproved:false };
}

export function validatePrototypeMesh(tpl, dims = { L:80, W:40, H:120, t:0.45, glue:14 }) {
  const mesh = productionMesh({ tpl, ...dims });
  const qa = meshQAReport(mesh);
  const glb = exportGLB(mesh);
  const reimport = verifyGLB(glb);
  const uvOk = qa.uvOutOfRange.length === 0;
  const dimOk = qa.scaleMm.every(v => v > 0) && qa.bboxMm.every(Number.isFinite);
  const graphOk = qa.panelGraphNodes > 0;
  return { tpl, valid: qa.valid && uvOk && dimOk && graphOk && reimport.meshes >= 1, qa, reimport };
}

export function wave1PrototypeReport() {
  const targets = ['rte','shipping-box','paper-cup-packaging'];
  const prototypes = targets.map(id => validatePrototypeMesh(id));
  return { targets, prototypes, valid: prototypes.every(p => p.valid), physicalProductionApproved:false };
}
