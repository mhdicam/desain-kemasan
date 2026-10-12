const clean = v => String(v ?? '').trim();
const slug = v => clean(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'custom-project';
const line = v => clean(v).replace(/\n+/g, ' ');

export function briefInitial() {
  return {
    projectName: '', category: 'packaging', productType: '', size: '', material: '', finish: '', quantity: '', deadline: '', budget: '',
    brandName: '', audience: '', style: '', colors: '', references: '', outputs: ['Dieline PDF', 'Mockup PNG'], notes: ''
  };
}

export function briefChecklist(brief) {
  return {
    hasProjectName: !!clean(brief.projectName),
    hasProductType: !!clean(brief.productType),
    hasSize: !!clean(brief.size),
    hasMaterial: !!clean(brief.material),
    hasQuantity: !!clean(brief.quantity),
    hasOutputTargets: Array.isArray(brief.outputs) && brief.outputs.length > 0,
    hasCreativeDirection: !!(clean(brief.style) || clean(brief.references) || clean(brief.notes))
  };
}

export function briefReady(brief) {
  const c = briefChecklist(brief);
  return Object.values(c).filter(Boolean).length >= 5 && c.hasProjectName && c.hasOutputTargets;
}

export function briefToMarkdown(brief) {
  const outputs = Array.isArray(brief.outputs) ? brief.outputs : [];
  return `# Brief Custom\n\n## Project\n- Nama: ${line(brief.projectName) || '-'}\n- Kategori: ${line(brief.category) || '-'}\n- Tipe produk: ${line(brief.productType) || '-'}\n- Ukuran: ${line(brief.size) || '-'}\n- Bahan: ${line(brief.material) || '-'}\n- Finishing: ${line(brief.finish) || '-'}\n- Quantity: ${line(brief.quantity) || '-'}\n- Deadline: ${line(brief.deadline) || '-'}\n- Budget: ${line(brief.budget) || '-'}\n\n## Brand\n- Brand: ${line(brief.brandName) || '-'}\n- Target audience: ${line(brief.audience) || '-'}\n- Gaya visual: ${line(brief.style) || '-'}\n- Warna: ${line(brief.colors) || '-'}\n- Referensi: ${line(brief.references) || '-'}\n\n## Output Diminta\n${outputs.map(x => `- ${line(x)}`).join('\n') || '-'}\n\n## Catatan\n${clean(brief.notes) || '-'}\n`;
}

export function briefToJSON(brief) {
  return JSON.stringify({ ...brief, checklist: briefChecklist(brief), ready: briefReady(brief), exportedAt: new Date().toISOString() }, null, 2);
}

export function briefFileName(brief, ext = 'md') {
  return `brief-${slug(brief.projectName)}.${ext}`;
}

export function downloadBrief(brief, ext = 'md') {
  const text = ext === 'json' ? briefToJSON(brief) : briefToMarkdown(brief);
  const a = document.createElement('a');
  const url = URL.createObjectURL(new Blob([text], { type: ext === 'json' ? 'application/json' : 'text/markdown' }));
  a.href = url; a.download = briefFileName(brief, ext); a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
