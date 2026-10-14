<div align="center">

<img src="docs/screenshots/three.jpg" alt="AstaKraf Studio Kemasan — pratinjau lipat 3D PBR" width="720">

# AstaKraf · Studio Kemasan

**Workbench desain kemasan berbasis browser — dieline parametrik, desain artwork berlapis, pratinjau lipat 3D PBR, dan ekspor PDF siap cetak.**

[Lisensi: MIT](#lisensi) · [Mulai Cepat](#mulai-cepat) · [Fitur](#fitur)

**[▶ Demo Live — yuyou-dev.github.io/OpenBox3D](https://yuyou-dev.github.io/OpenBox3D/)** (frontend statis, langsung jalan di browser)

</div>

---

## Fitur

- **Dieline parametrik** — 7 template box (tuck-end, mailer, tray/lid, drawer, sleeve, tube), semua ukuran dalam milimeter dengan kompensasi ketebalan kertas, panduan bleed dan area aman, serta edit garis manual.
- **Kanvas desain berlapis** — layer teks, gambar, dan bentuk yang terikat ke panel, dengan alignment, rotasi, opasitas, peringatan 300 dpi, dan kanal finishing: foil emas/perak, spot UV, gloss, holografik, emboss/deboss.
- **Pratinjau 3D PBR real-time** — three.js `MeshPhysicalMaterial` dengan channel albedo, normal, roughness, metalness, clearcoat, dan displacement. Lihat lembar datar terlipat jadi box final.
- **Studio & material** — preset studio HDRI/light rig, ground PBR CC0, kertas/laminasi dengan grain, roughness, gloss, dan emboss control.
- **Ekspor PDF siap cetak** — PDF produksi 1:1 CMYK 300 dpi dengan TrimBox/BleedBox, spot color CutContour/Crease overprint, plus separasi finishing DeviceGray.
- **File proyek `.boxproj`** — simpan dan bagikan proyek lokal sebagai satu file JSON. Tanpa server, tanpa akun, tanpa telemetry.

> Edisi open-source ini tidak menyertakan AI image generation, AR/iOS preview, DXF export, dan material/environment lab eksperimental.

## Screenshot

<div align="center">
<img src="docs/screenshots/structure.jpg" alt="Struktur — dieline parametrik" width="700">
<br><sub>Struktur — dieline parametrik dengan kompensasi ketebalan, bleed, area aman, dan validasi</sub>
<br><br>
<img src="docs/screenshots/design.jpg" alt="Desain — artwork berlapis pada dieline" width="700">
<br><sub>Desain — artwork berlapis pada lembar bentang, dengan kanal foil / spot UV / gloss / emboss</sub>
<br><br>
<img src="docs/screenshots/three.jpg" alt="3D — pratinjau lipat PBR" width="700">
<br><sub>3D — pratinjau lipat PBR real-time dengan scene studio dan mode inspeksi</sub>
</div>

## Mulai Cepat

Butuh **Node.js ≥ 18** dan npm. Tanpa install, coba **[demo live](https://yuyou-dev.github.io/OpenBox3D/)** dulu.

```bash
git clone https://github.com/yuyou-dev/OpenBox3D.git
cd OpenBox3D
npm install
npm run dev
```

Buka <http://127.0.0.1:26847>. Box contoh langsung tampil di view 3D.

Build produksi:

```bash
npm run build        # termasuk cek sinkron template/UV
npm run preview      # serve bundle build di alamat sama
npm run build:pages  # build dengan base=/ untuk domain packaging.pojokinfo.my.id
```

Catatan: dev server bind ke `127.0.0.1` saja, bukan LAN. Ini baseline keamanan.

## Cara pakai workbench

Tab atas punya empat workspace:

1. **Struktur** — pilih template box, set ukuran dalam (L×W×H mm), board stock, bleed; edit node dieline dan tipe garis potong/lipat.
2. **Desain** — tambah layer teks/gambar/bentuk di lembar bentang; tetapkan finishing; cek peringatan lipatan, area aman, dan dpi. Undo/redo tersedia.
3. **3D** — animasi lipat, material kertas/laminasi, toggle finishing, scene studio/lantai, dan mode inspeksi.
4. **Output** — ringkasan preflight, ekspor PDF cetak, dan PDF separasi finishing.

**Impor/Ekspor Proyek** menyimpan `.boxproj` lokal. **Reset Contoh Box** mengembalikan sample bawaan.

### Ganti box contoh bawaan

Box contoh pertama adalah `.boxproj` di [`src/preset/preset-box.json`](src/preset/preset-box.json), dengan aset layer di `public/preset/`. Untuk mengganti:

```bash
npm run preset:from -- /path/to/your-project.boxproj
```

Script mengekstrak gambar layer ke `public/preset/` dan menulis ulang JSON bawaan.

## Stack teknis

- [React 18](https://react.dev) + [Vite 5](https://vitejs.dev)
- [three.js 0.184](https://threejs.org) untuk WebGL2 PBR rendering
- Generator dieline/PDF custom berbasis mm
- Tanpa state library, CSS framework, atau server code

## Lisensi

[MIT](LICENSE) © 2026 yuyou-dev
