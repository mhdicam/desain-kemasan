// 把 .boxproj file proyekjadi本仓库的Box contoh bawaan：
//   node scripts/boxproj-to-preset.mjs /path/工程.boxproj
// Gambar dataURL 抽pakai为 public/preset/layer-<id>.<ext>，工程Crop后写 src/preset/preset-box.json。
// 用法也写在 package.json：npm run preset:from -- /path/工程.boxproj
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
if (!src) { console.error('Cara pakai: node scripts/boxproj-to-preset.mjs /path/proyek.boxproj'); process.exit(1); }

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const doc = JSON.parse(fs.readFileSync(src, 'utf8'));
if (doc.schema !== 'box3d-project' || doc.version !== 1 || !doc.box || !doc.design || !Array.isArray(doc.design.layers)) {
  console.error('Bukan file proyek Box3D valid (schema box3d-project v1).');
  process.exit(1);
}

const presetDir = path.join(root, 'public', 'preset');
fs.rmSync(presetDir, { recursive: true, force: true }); // hapus generasi sebelumnyabox contohasset
fs.mkdirSync(presetDir, { recursive: true });

const EXT = { png: 'png', jpeg: 'jpg', webp: 'webp' };
let extracted = 0;
for (const layer of doc.design.layers) {
  const m = /^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(layer.imgSrc || '');
  if (!m) continue;
  const file = 'layer-' + (layer.id != null ? layer.id : ++extracted) + '.' + EXT[m[1]];
  fs.writeFileSync(path.join(presetDir, file), Buffer.from(m[2], 'base64'));
  layer.imgSrc = '/preset/' + file;
  extracted++;
}

doc.meta = { id: 'preset', name: 'Box contoh bawaan', createdAt: doc.meta && doc.meta.createdAt, updatedAt: doc.meta && doc.meta.updatedAt, thumbnail: '' }; // coversetelah startupambil ulang otomatis，tidak masuk repo
const out = path.join(root, 'src', 'preset', 'preset-box.json');
fs.writeFileSync(out, JSON.stringify(doc, null, 2));
console.log('Selesai: ekstrak gambar ' + extracted + ' buah → public/preset/; proyek → src/preset/preset-box.json (' + Math.round(fs.statSync(out).size / 1024) + ' KB)');
