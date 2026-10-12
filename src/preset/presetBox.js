// presetbox contoh：startup pertama与topbar「Reset Contoh Box」时dimuat，让user barumulai即有一只kesiapan较Tinggi的盒子。
//
// —— caraGantike milikmupreset盒 ——
// 1. 在workbench里Desain好盒子，topbar「Ekspor Proyek」simpan .boxproj 文件；
// 2. jalankan di root repo：npm run preset:from -- /path/proyekmu.boxproj
//     (LayerGambar会抽pakai到 public/preset/，工程Crop后写入 src/preset/preset-box.json)；
// 3. ulang npm run dev / npm run build agar aktif。
//
// preset-box.json adalah standar .boxproj (box3d-project v1)，logika muat与「Impor Proyek」sama。
import { projectStateOf } from '../projects/projects.js';
import presetDoc from './preset-box.json';

let cache = null;

// kembalikanbisa langsung dikirim ke store.reset 的 patch；hasil di-cache，供「Reset Contoh Box」pakai ulang。
export async function loadPresetBox() {
  if (cache) return cache;
  const qp = new URLSearchParams(location.search); // debugdeep link prioritas：?view=/?fold= tidakpresetmenimpa
  const patch = await projectStateOf(presetDoc, 'three'); // layar awal 3D view
  cache = {
    ...patch,
    view: 'home',
    fold: qp.has('fold') ? +qp.get('fold') : 100 // box jadi tertutup
  };
  return cache;
}
