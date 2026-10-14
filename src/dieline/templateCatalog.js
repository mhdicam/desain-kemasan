import { TPLS } from './templates.js';
import { dielineAuditOf } from './dielineAuditData.js';
import { artworkGuideOf } from '../artwork/artworkGuideData.js';
import { apparelPatternOf } from '../artwork/apparelSewingPatternData.js';
import { IMPORTED_DIELINES } from './importedDielines.js';

export const PRODUCT_CATEGORIES = [
  { id: 'packaging', name: 'Kemasan', desc: 'Box, pouch, label, cup, dan dieline produksi.', color: '#c7833f', thumb: 'folding', group: 'Produksi' },
  { id: 'device-gadget', name: 'Device & Gadget', desc: 'Mockup smartphone, laptop, tablet, smartwatch, dan aksesori digital.', color: '#3f72b5', thumb: 'device', group: 'Mockup Digital' },
  { id: 'apparel', name: 'Apparel', desc: 'Mockup kaos, hoodie, jersey, topi, tote bag, dan tekstil.', color: '#9a5aa6', thumb: 'apparel', group: 'Fashion' },
  { id: 'merchandise', name: 'Merchandise', desc: 'Mug, tumbler, botol, gantungan kunci, stiker, dan souvenir brand.', color: '#c95757', thumb: 'merch', group: 'Produk Promosi' },
  { id: 'print-stationery', name: 'Print & Stationery', desc: 'Kartu nama, flyer, brosur, poster, label, amplop, dan kalender.', color: '#60895b', thumb: 'print', group: 'Percetakan' },
  { id: 'display-booth', name: 'Display & Booth', desc: 'Roll banner, backdrop, booth counter, signage, rak display, dan event kit.', color: '#4f8b9e', thumb: 'display', group: 'Event' },
  { id: 'food-beverage', name: 'Food & Beverage', desc: 'Paper cup, sleeve, bowl, burger box, fries box, can label, dan jar label.', color: '#d69038', thumb: 'food', group: 'F&B' },
  { id: 'custom-model', name: 'Custom Model', desc: 'Placeholder untuk model spesifik brand, upload GLB, atau bentuk request khusus.', color: '#6f6a60', thumb: 'custom', group: 'Custom' }
];

export const TEMPLATE_CATEGORIES = [
  { id: 'folding-carton', name: 'Folding Carton', desc: 'Box lipat untuk snack, kosmetik, obat, dan retail kecil.', color: '#c7833f', thumb: 'folding', parent: 'packaging' },
  { id: 'ecommerce', name: 'E-commerce & Corrugated', desc: 'Mailer dan box kirim berbahan corrugated.', color: '#7c8a56', thumb: 'mailer', parent: 'packaging' },
  { id: 'rigid-set', name: 'Rigid / Gift Set', desc: 'Box dua bagian, tray, sleeve, dan drawer.', color: '#7b5aa6', thumb: 'rigid', parent: 'packaging' },
  { id: 'tube-special', name: 'Tube & Shape Khusus', desc: 'Cylinder, hexagon, dan bentuk premium.', color: '#4f8b9e', thumb: 'tube', parent: 'packaging' },
  { id: 'pouch-flexible', name: 'Pouch & Flexible', desc: 'Standing pouch, sachet, pillow pack, dan kemasan film fleksibel.', color: '#bd6c54', thumb: 'pouch', parent: 'packaging' },
  { id: 'food-service', name: 'Food Service', desc: 'Box makanan, tray, bowl, cup, dan sleeve F&B.', color: '#d69038', thumb: 'food', parent: 'packaging' },
  { id: 'label-wrap', name: 'Label & Wrap', desc: 'Label botol, band, sleeve, hangtag, dan sticker packaging.', color: '#60895b', thumb: 'print', parent: 'packaging' }
];

export const TEMPLATE_META = {
  rte: { category: 'folding-carton', productCategory: 'packaging', tags: ['retail', 'snack', 'cosmetic'], stock: 'Ivory / art paper', difficulty: 'Mudah', mode: 'Dieline + Desain + 3D' },
  ste: { category: 'folding-carton', productCategory: 'packaging', tags: ['retail', 'food', 'pharma'], stock: 'Ivory / art paper', difficulty: 'Mudah', mode: 'Dieline + Desain + 3D' },
  'gable-box': { category: 'folding-carton', productCategory: 'packaging', tags: ['gift','handle','retail'], stock: 'Ivory / kraft', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  'window-carton': { category: 'folding-carton', productCategory: 'packaging', tags: ['window','display','bakery'], stock: 'Ivory + PET window', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  'auto-lock-bottom': { category: 'folding-carton', productCategory: 'packaging', tags: ['retail','auto lock','bottom'], stock: 'Ivory 350gsm+', difficulty: 'Lanjut', mode: 'Dieline + Desain + 3D' },
  mailer: { category: 'ecommerce', productCategory: 'packaging', tags: ['shipping', 'subscription', 'gift'], stock: 'Corrugated E/F flute', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  lidbase: { category: 'rigid-set', productCategory: 'packaging', tags: ['gift', 'premium', 'display'], stock: 'Board / ivory tebal', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  drawer: { category: 'rigid-set', productCategory: 'packaging', tags: ['sleeve', 'gift', 'cosmetic'], stock: 'Board / ivory tebal', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  cyl: { category: 'tube-special', productCategory: 'packaging', tags: ['tube', 'premium', 'food'], stock: 'Art paper / board', difficulty: 'Lanjut', mode: 'Dieline + Desain + 3D' },
  hex: { category: 'tube-special', productCategory: 'packaging', tags: ['hexagon', 'premium', 'gift'], stock: 'Art paper / board', difficulty: 'Lanjut', mode: 'Dieline + Desain + 3D' },
  'hanger-box': { category: 'folding-carton', productCategory: 'packaging', tags: ['retail','hanger','euro slot'], stock: 'Ivory / art carton', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  'book-box': { category: 'rigid-set', productCategory: 'packaging', tags: ['rigid','magnet','premium'], stock: 'Greyboard + wrap paper', difficulty: 'Lanjut', mode: 'Dieline + Desain + 3D' },
  'standup-pouch': { category: 'pouch-flexible', productCategory: 'packaging', tags: ['pouch','zipper','snack'], stock: 'PET / AL / PE film', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  'flat-sachet': { category: 'pouch-flexible', productCategory: 'packaging', tags: ['sachet','sample','film'], stock: 'Laminated film', difficulty: 'Mudah', mode: 'Dieline + Desain + 3D' },
  'pillow-pack': { category: 'pouch-flexible', productCategory: 'packaging', tags: ['flow wrap','snack','film'], stock: 'OPP / PET film', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  'spout-pouch': { category: 'pouch-flexible', productCategory: 'packaging', tags: ['liquid','spout','refill'], stock: 'Laminated film + cap', difficulty: 'Lanjut', mode: 'Dieline + Desain + 3D' },
  'burger-clamshell': { category: 'food-service', productCategory: 'packaging', tags: ['burger','takeaway','food'], stock: 'Food grade paper', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' }
};

export const PACKAGING_EXTRA_MODELS = [
  { id: 'gable-box', category: 'packaging', subCategory: 'folding-carton', code: 'GBL', name: 'Gable Box', sub: 'Box pegangan atas untuk gift, snack, dan hampers kecil.', tags: ['gift', 'handle', 'retail'], stock: 'Ivory / kraft', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'window-carton', category: 'packaging', subCategory: 'folding-carton', code: 'WIN', name: 'Window Carton', sub: 'Box display dengan jendela transparan.', tags: ['window', 'display', 'bakery'], stock: 'Ivory + PET window', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'hanger-box', category: 'packaging', subCategory: 'folding-carton', code: 'HNG', name: 'Hanger Box', sub: 'Retail box dengan lubang gantung euro slot.', tags: ['retail', 'hanger', 'euro slot'], stock: 'Ivory / art carton', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'auto-lock-bottom', category: 'packaging', subCategory: 'folding-carton', code: 'ALB', name: 'Auto Lock Bottom Box', sub: 'Box bawah kunci otomatis untuk produk berat.', tags: ['retail', 'auto lock', 'bottom'], stock: 'Ivory 350gsm+', difficulty: 'Lanjut', mode: 'Dieline + Desain + 3D' },
  { id: 'pillow-box', category: 'packaging', subCategory: 'folding-carton', code: 'PLW', name: 'Pillow Box', sub: 'Kemasan kurva untuk aksesori, gift, dan kosmetik kecil.', tags: ['gift', 'curve', 'retail'], stock: 'Ivory / kraft', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'pizza-box', category: 'packaging', subCategory: 'ecommerce', code: 'PZA', name: 'Pizza Box', sub: 'Box corrugated lipat untuk pizza dan bakery.', tags: ['food', 'corrugated', 'takeaway'], stock: 'Corrugated E/F flute', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'shipping-box', category: 'packaging', subCategory: 'ecommerce', code: 'SHP', name: 'Shipping Box RSC', sub: 'Box kirim standar regular slotted carton.', tags: ['shipping', 'rsc', 'corrugated'], stock: 'Corrugated B/C flute', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'sleeve-tray', category: 'packaging', subCategory: 'rigid-set', code: 'SLV', name: 'Sleeve + Tray', sub: 'Tray geser dengan sleeve luar untuk premium pack.', tags: ['sleeve', 'tray', 'premium'], stock: 'Board / ivory tebal', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'book-box', category: 'packaging', subCategory: 'rigid-set', code: 'BKB', name: 'Book Style Box', sub: 'Rigid box magnet model buku untuk gift set.', tags: ['rigid', 'magnet', 'premium'], stock: 'Greyboard + wrap paper', difficulty: 'Lanjut', mode: 'Dieline + Desain + 3D' },
  { id: 'standup-pouch', category: 'packaging', subCategory: 'pouch-flexible', code: 'SUP', name: 'Stand Up Pouch', sub: 'Pouch berdiri dengan zipper untuk snack dan kopi.', tags: ['pouch', 'zipper', 'snack'], stock: 'PET / AL / PE film', difficulty: 'Menengah', mode: 'Desain + 3D' },
  { id: 'flat-sachet', category: 'packaging', subCategory: 'pouch-flexible', code: 'SCH', name: 'Flat Sachet', sub: 'Sachet pipih untuk sample, kopi, dan bumbu.', tags: ['sachet', 'sample', 'film'], stock: 'Laminated film', difficulty: 'Mudah', mode: 'Desain + 3D' },
  { id: 'pillow-pack', category: 'packaging', subCategory: 'pouch-flexible', code: 'PCK', name: 'Pillow Pack', sub: 'Flow wrap/pillow pack untuk snack bar dan bakery.', tags: ['flow wrap', 'snack', 'film'], stock: 'OPP / PET film', difficulty: 'Menengah', mode: 'Desain + 3D' },
  { id: 'spout-pouch', category: 'packaging', subCategory: 'pouch-flexible', code: 'SPT', name: 'Spout Pouch', sub: 'Pouch cairan dengan tutup spout.', tags: ['liquid', 'spout', 'refill'], stock: 'Laminated film + cap', difficulty: 'Lanjut', mode: 'Desain + 3D' },
  { id: 'paper-cup-packaging', category: 'packaging', subCategory: 'food-service', code: 'CUP', name: 'Paper Cup', sub: 'Cup kopi dengan dieline wrap melengkung.', tags: ['coffee', 'cup', 'wrap'], stock: 'PE coated paper', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'cup-sleeve', category: 'packaging', subCategory: 'food-service', code: 'CSL', name: 'Cup Sleeve', sub: 'Sleeve cup kopi untuk branding dan insulasi panas.', tags: ['coffee', 'sleeve', 'wrap'], stock: 'Kraft / corrugated', difficulty: 'Mudah', mode: 'Dieline + Desain + 3D' },
  { id: 'burger-clamshell', category: 'packaging', subCategory: 'food-service', code: 'BGR', name: 'Burger Clamshell', sub: 'Box burger lipat untuk takeaway.', tags: ['burger', 'takeaway', 'food'], stock: 'Food grade paper', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'fries-box', category: 'packaging', subCategory: 'food-service', code: 'FRY', name: 'Fries Box', sub: 'Box kentang goreng terbuka.', tags: ['fries', 'takeaway', 'food'], stock: 'Food grade paper', difficulty: 'Mudah', mode: 'Dieline + Desain + 3D' },
  { id: 'bottle-label-packaging', category: 'packaging', subCategory: 'label-wrap', code: 'LBL', name: 'Bottle Label', sub: 'Label wrap untuk botol minuman, saus, atau kosmetik.', tags: ['label', 'bottle', 'wrap'], stock: 'Vinyl / PP / paper label', difficulty: 'Mudah', mode: 'Desain + 3D' },
  { id: 'belly-band', category: 'packaging', subCategory: 'label-wrap', code: 'BND', name: 'Belly Band', sub: 'Band kertas untuk mengikat produk atau box.', tags: ['band', 'sleeve', 'label'], stock: 'Art paper / kraft', difficulty: 'Mudah', mode: 'Dieline + Desain + 3D' },
  { id: 'hangtag', category: 'packaging', subCategory: 'label-wrap', code: 'HTG', name: 'Hangtag', sub: 'Tag gantung untuk apparel, gift, dan produk retail.', tags: ['tag', 'retail', 'branding'], stock: 'Art carton / kraft', difficulty: 'Mudah', mode: 'Desain + PDF' },
  { id: 'sticker-label-roll', category: 'packaging', subCategory: 'label-wrap', code: 'STL', name: 'Sticker Label Roll', sub: 'Label roll untuk produksi stiker produk.', tags: ['sticker', 'label', 'roll'], stock: 'Chromo / vinyl / PP', difficulty: 'Mudah', mode: 'Desain + PDF' }
];

export const MOCKUP_MODELS = [
  { id: 'phone-mockup', category: 'device-gadget', code: 'PHN', name: 'Smartphone Mockup', sub: 'Upload screenshot, preview layar, export mockup.', tags: ['screen', 'app', 'ui'], stock: 'Digital mockup', difficulty: 'Mudah', mode: 'Desain + 3D', screen: 'phone' },
  { id: 'laptop-mockup', category: 'device-gadget', code: 'LTP', name: 'Laptop Mockup', sub: 'Tampilan website atau dashboard pada laptop.', tags: ['website', 'dashboard', 'presentation'], stock: 'Digital mockup', difficulty: 'Mudah', mode: 'Desain + 3D', screen: 'laptop' },
  { id: 'tablet-mockup', category: 'device-gadget', code: 'TBL', name: 'Tablet Mockup', sub: 'Mockup tablet untuk katalog, UI, dan edukasi.', tags: ['tablet', 'app', 'portfolio'], stock: 'Digital mockup', difficulty: 'Mudah', mode: 'Desain + 3D', screen: 'tablet', artworkGuideV3: true },
  { id: 'desktop-monitor', category: 'device-gadget', code: 'MON', name: 'Desktop Monitor', sub: 'Mockup monitor untuk website, dashboard, dan presentasi.', tags: ['monitor', 'website', 'dashboard'], stock: 'Digital mockup', difficulty: 'Mudah', mode: 'Desain + 3D', screen: 'monitor' },
  { id: 'smartwatch-mockup', category: 'device-gadget', code: 'WTC', name: 'Smartwatch', sub: 'Mockup layar jam pintar untuk app dan fitness UI.', tags: ['watch', 'app', 'wearable'], stock: 'Digital mockup', difficulty: 'Menengah', mode: 'Desain + 3D', screen: 'watch' },
  { id: 'phone-case', category: 'device-gadget', code: 'CAS', name: 'Phone Case', sub: 'Mockup casing ponsel untuk artwork full back.', tags: ['case', 'accessory', 'print'], stock: 'Plastic / silicone', difficulty: 'Menengah', mode: 'Desain + 3D', screen: 'case' },
  { id: 'earbuds-case', category: 'device-gadget', code: 'EBD', name: 'Earbuds Case', sub: 'Mockup case earbuds dengan area logo kecil.', tags: ['earbuds', 'case', 'logo'], stock: 'Plastic', difficulty: 'Menengah', mode: 'Desain + 3D', screen: 'earbuds' },
  { id: 'powerbank-mockup', category: 'device-gadget', code: 'PWB', name: 'Powerbank', sub: 'Mockup powerbank untuk branding merchandise gadget.', tags: ['powerbank', 'merch', 'tech'], stock: 'Plastic / metal', difficulty: 'Mudah', mode: 'Desain + 3D', screen: 'powerbank' },
  { id: 'usb-drive', category: 'device-gadget', code: 'USB', name: 'USB Drive', sub: 'Mockup USB flash drive dengan area logo.', tags: ['usb', 'merch', 'logo'], stock: 'Plastic / metal', difficulty: 'Mudah', mode: 'Desain + 3D', screen: 'usb' },
  { id: 'tshirt-front', category: 'apparel', code: 'TSH', name: 'T-shirt Front', sub: 'Mockup kaos depan untuk logo dan artwork.', tags: ['shirt', 'fashion', 'dtf'], stock: 'Cotton / polyester', difficulty: 'Mudah', mode: 'Desain + 3D', artworkGuideV3: true },
  { id: 'hoodie-mockup', category: 'apparel', code: 'HDY', name: 'Hoodie', sub: 'Mockup hoodie depan dengan area print besar.', tags: ['hoodie', 'fashion', 'merch'], stock: 'Fleece / cotton', difficulty: 'Menengah', mode: 'Desain + 3D', artworkGuideV3: true },
  { id: 'tote-bag', category: 'apparel', code: 'TOT', name: 'Tote Bag', sub: 'Mockup tas kain untuk brand dan event.', tags: ['bag', 'canvas', 'event'], stock: 'Canvas / blacu', difficulty: 'Mudah', mode: 'Desain + 3D', artworkGuideV3: true },
  { id: 'mug-wrap', category: 'merchandise', code: 'MUG', name: 'Mug Wrap', sub: 'Artwork wrap melengkung untuk mug promosi.', tags: ['mug', 'souvenir', 'wrap'], stock: 'Ceramic', difficulty: 'Mudah', mode: 'Desain + 3D', artworkGuideV3: true },
  { id: 'tumbler-wrap', category: 'merchandise', code: 'TMB', name: 'Tumbler', sub: 'Mockup tumbler dan botol minum.', tags: ['bottle', 'drinkware', 'wrap'], stock: 'Stainless / plastic', difficulty: 'Menengah', mode: 'Desain + 3D', artworkGuideV3: true },
  { id: 'sticker-sheet', category: 'merchandise', code: 'STK', name: 'Sticker Sheet', sub: 'Sheet stiker custom untuk merchandise.', tags: ['sticker', 'kiss cut', 'merch'], stock: 'Vinyl / chromo', difficulty: 'Mudah', mode: 'Desain' },
  { id: 'cap-mockup', category: 'apparel', code: 'CAP', name: 'Cap / Topi', sub: 'Mockup topi panel depan untuk bordir dan patch.', tags: ['cap', 'embroidery', 'patch'], stock: 'Canvas / twill', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'cap', artworkGuideV3: true },
  { id: 'jersey-mockup', category: 'apparel', code: 'JRS', name: 'Jersey', sub: 'Mockup jersey olahraga full front.', tags: ['jersey', 'sports', 'sublimation'], stock: 'Polyester', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'jersey', artworkGuideV3: true },
  { id: 'apron-mockup', category: 'apparel', code: 'APN', name: 'Apron', sub: 'Mockup apron cafe/resto untuk logo.', tags: ['apron', 'cafe', 'uniform'], stock: 'Canvas / drill', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'apron', artworkGuideV3: true },
  { id: 'polo-shirt', category: 'apparel', code: 'POL', name: 'Polo Shirt', sub: 'Mockup polo untuk seragam dan komunitas.', tags: ['polo', 'uniform', 'embroidery'], stock: 'Lacoste / cotton', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'polo', artworkGuideV3: true },
  { id: 'crewneck-sweater', category: 'apparel', code: 'CRW', name: 'Crewneck Sweater', sub: 'Mockup sweater depan untuk merch.', tags: ['sweater', 'merch', 'dtf'], stock: 'Fleece / cotton', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'crewneck', artworkGuideV3: true },
  { id: 'lanyard-mockup', category: 'apparel', code: 'LNY', name: 'Lanyard', sub: 'Mockup tali lanyard full repeat pattern.', tags: ['lanyard', 'event', 'sublimation'], stock: 'Polyester webbing', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'lanyard', artworkGuideV3: true },
  { id: 'bottle-mockup', category: 'merchandise', code: 'BTL', name: 'Bottle', sub: 'Mockup botol minum dengan label/logo.', tags: ['bottle', 'drinkware', 'logo'], stock: 'Plastic / stainless', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'bottle', artworkGuideV3: true },
  { id: 'keychain-mockup', category: 'merchandise', code: 'KEY', name: 'Keychain', sub: 'Mockup gantungan kunci akrilik.', tags: ['keychain', 'acrylic', 'souvenir'], stock: 'Acrylic / metal', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'keychain' },
  { id: 'notebook-cover', category: 'merchandise', code: 'NTB', name: 'Notebook Cover', sub: 'Mockup buku catatan cover depan.', tags: ['notebook', 'cover', 'stationery'], stock: 'Hardcover / softcover', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'notebook' },
  { id: 'mousepad-mockup', category: 'merchandise', code: 'MSP', name: 'Mousepad', sub: 'Mockup mousepad untuk artwork promosi.', tags: ['mousepad', 'desk', 'merch'], stock: 'Rubber + fabric', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'mousepad' },
  { id: 'pin-button', category: 'merchandise', code: 'PIN', name: 'Pin Button', sub: 'Mockup pin bulat untuk campaign.', tags: ['pin', 'badge', 'campaign'], stock: 'Metal button', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'pin' },
  { id: 'lanyard-card', category: 'merchandise', code: 'IDC', name: 'ID Card Holder', sub: 'Mockup ID card holder event.', tags: ['id card', 'event', 'holder'], stock: 'PVC / acrylic', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'idcard', artworkGuideV3: true },
  { id: 'business-card', category: 'print-stationery', code: 'BIZ', name: 'Business Card', sub: 'Kartu nama dengan bleed dan safe area.', tags: ['print', 'identity', 'cmyk'], stock: 'Art carton', difficulty: 'Mudah', mode: 'Desain + PDF' },
  { id: 'trifold-brochure', category: 'print-stationery', code: 'TRI', name: 'Tri-fold Brochure', sub: 'Brosur lipat tiga untuk promosi.', tags: ['brochure', 'print', 'fold'], stock: 'Art paper', difficulty: 'Menengah', mode: 'Desain + PDF' },
  { id: 'poster-a3', category: 'print-stationery', code: 'PST', name: 'Poster A3', sub: 'Poster promosi siap cetak.', tags: ['poster', 'print', 'campaign'], stock: 'Art paper', difficulty: 'Mudah', mode: 'Desain + PDF' },
  { id: 'flyer-a5', category: 'print-stationery', code: 'FLY', name: 'Flyer A5', sub: 'Flyer promosi satu muka/dua muka.', tags: ['flyer', 'print', 'promo'], stock: 'Art paper', difficulty: 'Mudah', mode: 'Desain + PDF', surface: 'flyer' },
  { id: 'letterhead', category: 'print-stationery', code: 'LTH', name: 'Letterhead', sub: 'Kop surat brand siap cetak.', tags: ['stationery', 'brand', 'office'], stock: 'HVS / linen', difficulty: 'Mudah', mode: 'Desain + PDF', surface: 'letterhead' },
  { id: 'envelope-mockup', category: 'print-stationery', code: 'ENV', name: 'Envelope', sub: 'Amplop brand dengan area logo.', tags: ['envelope', 'stationery', 'print'], stock: 'HVS / kraft', difficulty: 'Mudah', mode: 'Desain + PDF', surface: 'envelope' },
  { id: 'calendar-desk', category: 'print-stationery', code: 'CAL', name: 'Desk Calendar', sub: 'Kalender meja segitiga untuk promosi.', tags: ['calendar', 'desk', 'print'], stock: 'Art carton + spiral', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'calendar' },
  { id: 'folder-map', category: 'print-stationery', code: 'FLD', name: 'Presentation Folder', sub: 'Map folder brand untuk proposal.', tags: ['folder', 'office', 'print'], stock: 'Art carton', difficulty: 'Menengah', mode: 'Desain + PDF', surface: 'folder' },
  { id: 'certificate-a4', category: 'print-stationery', code: 'CRT', name: 'Certificate A4', sub: 'Sertifikat dengan layout formal.', tags: ['certificate', 'event', 'print'], stock: 'Linen / art paper', difficulty: 'Mudah', mode: 'Desain + PDF', surface: 'certificate' },
  { id: 'postcard-a6', category: 'print-stationery', code: 'PCD', name: 'Postcard A6', sub: 'Kartu pos promosi satu atau dua sisi.', tags: ['postcard', 'promo', 'print'], stock: 'Art carton / linen', difficulty: 'Mudah', mode: 'Desain + PDF', surface: 'postcard' },
  { id: 'sticker-roll', category: 'print-stationery', code: 'SRL', name: 'Sticker Roll', sub: 'Mockup roll label/stiker untuk produksi.', tags: ['sticker', 'roll', 'label'], stock: 'Chromo / vinyl / PP', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'stickerroll' },
  { id: 'wedding-invitation', category: 'print-stationery', code: 'INV', name: 'Invitation Card', sub: 'Undangan atau invitation premium.', tags: ['invitation', 'premium', 'print'], stock: 'Linen / jasmine / art carton', difficulty: 'Menengah', mode: 'Desain + PDF', surface: 'invitation' },
  { id: 'voucher-card', category: 'print-stationery', code: 'VCH', name: 'Voucher Card', sub: 'Voucher atau kupon promosi siap cetak.', tags: ['voucher', 'coupon', 'promo'], stock: 'Art carton', difficulty: 'Mudah', mode: 'Desain + PDF', surface: 'voucher' },
  { id: 'roll-banner', category: 'display-booth', code: 'RLB', name: 'Roll Up Banner', sub: 'Banner vertikal untuk event dan toko.', tags: ['banner', 'event', 'display'], stock: 'Albatros / flexi', difficulty: 'Mudah', mode: 'Desain + 3D', artworkGuideV3: true },
  { id: 'booth-counter', category: 'display-booth', code: 'BTC', name: 'Booth Counter', sub: 'Counter booth branding untuk pameran.', tags: ['booth', 'event', 'stand'], stock: 'PVC / board', difficulty: 'Menengah', mode: 'Desain + 3D', artworkGuideV3: true },
  { id: 'signage-board', category: 'display-booth', code: 'SGN', name: 'Signage Board', sub: 'Papan signage untuk toko dan event.', tags: ['signage', 'store', 'display'], stock: 'Acrylic / board', difficulty: 'Mudah', mode: 'Desain + 3D', artworkGuideV3: true },
  { id: 'backdrop-wall', category: 'display-booth', code: 'BDP', name: 'Backdrop Wall', sub: 'Backdrop event untuk photo wall.', tags: ['backdrop', 'event', 'photo wall'], stock: 'Flexi / fabric', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'backdrop', artworkGuideV3: true },
  { id: 'x-banner', category: 'display-booth', code: 'XBN', name: 'X Banner', sub: 'Banner X stand untuk promosi cepat.', tags: ['banner', 'stand', 'event'], stock: 'Albatros / flexi', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'xbanner', artworkGuideV3: true },
  { id: 'table-throw', category: 'display-booth', code: 'TBL', name: 'Table Throw', sub: 'Taplak meja booth dengan logo depan.', tags: ['table', 'booth', 'fabric'], stock: 'Fabric print', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'tablethrow' },
  { id: 'display-rack', category: 'display-booth', code: 'RCK', name: 'Display Rack', sub: 'Rak display produk untuk retail.', tags: ['rack', 'retail', 'display'], stock: 'Cardboard / acrylic', difficulty: 'Lanjut', mode: 'Desain + 3D', surface: 'rack', artworkGuideV3: true },
  { id: 'hanging-banner', category: 'display-booth', code: 'HBN', name: 'Hanging Banner', sub: 'Banner gantung overhead event.', tags: ['banner', 'hanging', 'event'], stock: 'Fabric / flexi', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'hanging', artworkGuideV3: true },
  { id: 'menu-board', category: 'display-booth', code: 'MNB', name: 'Menu Board', sub: 'Papan menu toko, cafe, atau booth.', tags: ['menu', 'signage', 'food'], stock: 'Foamboard / acrylic', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'menuboard', artworkGuideV3: true },
  { id: 'paper-cup', category: 'food-beverage', code: 'CUP', name: 'Paper Cup', sub: 'Cup kopi dengan artwork wrap.', tags: ['coffee', 'cup', 'wrap'], stock: 'PE coated paper', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'burger-box', category: 'food-beverage', code: 'BRG', name: 'Burger Box', sub: 'Kemasan makanan cepat saji.', tags: ['food', 'takeaway', 'box'], stock: 'Food grade paper', difficulty: 'Menengah', mode: 'Dieline + Desain + 3D' },
  { id: 'bottle-label', category: 'food-beverage', code: 'LBL', name: 'Bottle Label', sub: 'Label botol minuman atau saus.', tags: ['label', 'bottle', 'wrap'], stock: 'Vinyl / PP', difficulty: 'Mudah', mode: 'Desain + 3D' },
  { id: 'coffee-bag', category: 'food-beverage', code: 'COF', name: 'Coffee Bag', sub: 'Mockup bag kopi dengan label depan.', tags: ['coffee', 'bag', 'label'], stock: 'Kraft / foil pouch', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'coffeebag' },
  { id: 'menu-card', category: 'food-beverage', code: 'MNC', name: 'Menu Card', sub: 'Kartu menu cafe/resto siap cetak.', tags: ['menu', 'restaurant', 'print'], stock: 'Art carton / synthetic', difficulty: 'Mudah', mode: 'Desain + PDF', surface: 'menucard', artworkGuideV3: true },
  { id: 'jar-label', category: 'food-beverage', code: 'JAR', name: 'Jar Label', sub: 'Label jar untuk selai, sambal, dan dessert.', tags: ['jar', 'label', 'food'], stock: 'Vinyl / PP label', difficulty: 'Mudah', mode: 'Desain + 3D', surface: 'jar' },
  { id: 'can-label', category: 'food-beverage', code: 'CAN', name: 'Can Label', sub: 'Label kaleng minuman wrap 360.', tags: ['can', 'label', 'beverage'], stock: 'PP label / shrink sleeve', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'can' },
  { id: 'food-tray', category: 'food-beverage', code: 'TRY', name: 'Food Tray', sub: 'Tray makanan untuk snack dan fries.', tags: ['tray', 'takeaway', 'food'], stock: 'Food grade paper', difficulty: 'Mudah', mode: 'Dieline + Desain + 3D', surface: 'foodtray' },
  { id: 'ice-cream-tub', category: 'food-beverage', code: 'TUB', name: 'Ice Cream Tub', sub: 'Tub es krim dengan label cup.', tags: ['tub', 'dessert', 'label'], stock: 'PE coated paper', difficulty: 'Menengah', mode: 'Desain + 3D', surface: 'tub' },
  { id: 'upload-glb', category: 'custom-model', code: 'GLB', name: 'Upload GLB Model', sub: 'Tempat untuk model custom antum nanti.', tags: ['custom', '3d', 'upload'], stock: 'GLB / OBJ', difficulty: 'Lanjut', mode: 'Custom', surface: 'upload3d' },
  { id: 'upload-obj', category: 'custom-model', code: 'OBJ', name: 'Upload OBJ Model', sub: 'Slot model OBJ/MTL untuk mockup custom.', tags: ['custom', 'obj', 'upload'], stock: 'OBJ / MTL', difficulty: 'Lanjut', mode: 'Custom', surface: 'upload3d' },
  { id: 'upload-svg-dieline', category: 'custom-model', code: 'SVG', name: 'Upload SVG Dieline', sub: 'Upload dieline SVG/PDF untuk jadi model custom.', tags: ['svg', 'dieline', 'convert'], stock: 'SVG / PDF', difficulty: 'Menengah', mode: 'Custom', surface: 'upload2d' },
  { id: 'custom-brief-board', category: 'custom-model', code: 'BRF', name: 'Custom Brief Board', sub: 'Form brief ukuran, bahan, referensi, dan output.', tags: ['brief', 'spec', 'request'], stock: 'Brief + reference', difficulty: 'Custom', mode: 'Brief', surface: 'brief' },
  { id: 'brand-kit-mockup', category: 'custom-model', code: 'KIT', name: 'Brand Kit Mockup', sub: 'Kumpulkan logo, warna, font, dan aset brand.', tags: ['brand', 'kit', 'asset'], stock: 'Logo / palette / font', difficulty: 'Mudah', mode: 'Custom', surface: 'brandkit' },
  { id: 'request-model', category: 'custom-model', code: 'REQ', name: 'Request Model Baru', sub: 'Daftar ide model yang belum ada di katalog.', tags: ['request', 'brief', 'custom'], stock: 'Brief + reference', difficulty: 'Custom', mode: 'Brief', surface: 'request' }
];

export function allModels(templates = TPLS) {
  const packaging = templates.map(t => ({
    ...t,
    productCategory: 'packaging',
    category: TEMPLATE_META[t.id]?.productCategory || 'packaging',
    subCategory: TEMPLATE_META[t.id]?.category || 'folding-carton',
    mockup: false,
    ...templateMeta(t.id)
  }));
  const productionIds = new Set(packaging.map(m => m.id));
  const extras = PACKAGING_EXTRA_MODELS.filter(m => !productionIds.has(m.id)).map(m => ({ ...m, productCategory: 'packaging', mockup: true }));
  return [...packaging, ...extras, ...MOCKUP_MODELS.map(m => ({ ...m, productCategory: m.category, mockup: true }))];
}

export function templatesByCategory(templates = TPLS) {
  return TEMPLATE_CATEGORIES.map(cat => ({
    ...cat,
    templates: templates.filter(t => (TEMPLATE_META[t.id]?.category || 'folding-carton') === cat.id)
  })).filter(cat => cat.templates.length > 0);
}

export function templateMeta(id) {
  return TEMPLATE_META[id] || { category: 'folding-carton', productCategory: 'packaging', tags: [], stock: '-', difficulty: '-', mode: 'Desain + 3D' };
}

export function modelThumbShape(modelId) {
  const shapeMap = {
    'rte': 'folding', 'ste': 'folding', 'gable-box': 'folding', 'window-carton': 'folding', 'auto-lock-bottom': 'folding', 'pillow-box': 'folding',
    'pizza-box': 'food', 'shipping-box': 'mailer', 'sleeve-tray': 'folding', 'fries-box': 'food',
    'paper-cup-packaging': 'tube', 'cup-sleeve': 'tube', 'cyl': 'tube', 'hex': 'tube',
    'bottle-label-packaging': 'folding', 'belly-band': 'folding', 'hangtag': 'display', 'sticker-label-roll': 'folding',
    'mailer': 'mailer', 'lidbase': 'folding', 'drawer': 'folding', 'hanger-box': 'folding', 'book-box': 'display',
    'standup-pouch': 'folding', 'flat-sachet': 'folding', 'pillow-pack': 'folding', 'spout-pouch': 'folding', 'burger-clamshell': 'display'
  };
  return shapeMap[modelId] || 'folding';
}

export function categoryOfTemplate(id) {
  const meta = templateMeta(id);
  return PRODUCT_CATEGORIES.find(c => c.id === meta.productCategory) || PRODUCT_CATEGORIES[0];
}

export function subcategoryOfTemplate(id) {
  const meta = templateMeta(id);
  return TEMPLATE_CATEGORIES.find(c => c.id === meta.category) || TEMPLATE_CATEGORIES[0];
}

export function templatesForCategory(categoryId, templates = TPLS) {
  if (categoryId === 'packaging') return templates;
  return MOCKUP_MODELS.filter(t => t.category === categoryId);
}

export function modelsForCategory(categoryId, templates = TPLS) {
  return allModels(templates).filter(m => m.productCategory === categoryId || m.category === categoryId);
}

export function saveCategoryThumbnail(currentThumbs = {}, categoryId, dataUrl) {
  if (!PRODUCT_CATEGORIES.some(c => c.id === categoryId)) return currentThumbs;
  if (!dataUrl) {
    const next = { ...currentThumbs };
    delete next[categoryId];
    return next;
  }
  return { ...currentThumbs, [categoryId]: dataUrl };
}

export function categoryCards(thumbnails = {}, templates = TPLS) {
  return PRODUCT_CATEGORIES.map(cat => {
    const items = modelsForCategory(cat.id, templates);
    return { ...cat, count: items.length, models: items, templates: items, thumbnail: thumbnails[cat.id] || '' };
  }).filter(cat => cat.count > 0);
}

export function mockupModelById(id) {
  const model = MOCKUP_MODELS.find(m => m.id === id) || PACKAGING_EXTRA_MODELS.find(m => m.id === id) || null;
  if (!model) return null;
  const guide = artworkGuideOf(model.id);
  const pattern = apparelPatternOf(model.id);
  return { ...model, ...(guide ? { artworkGuide: guide, mode: model.mode || 'Desain + PDF' } : {}), ...(pattern ? { apparelPattern: pattern, mode: 'Pola Jahit + Desain + 3D' } : {}) };
}

export function modelDielineAudit(modelOrId) {
  const id = typeof modelOrId === 'string' ? modelOrId : modelOrId?.id;
  if (!id) return null;
  const guide = artworkGuideOf(id);
  const pattern = apparelPatternOf(id);
  if (pattern) return {
    dielineKind: 'APPAREL_SEWING_PATTERN',
    reviewStatus: pattern.status || 'SAMPLE_DRAFT_NOT_VALIDATED',
    manufacturerApproved: false,
    physicalPrototypeValidated: false,
    nominalDimensions: `${guide?.model || id}: ${pattern.sheetWidthMm} x ${pattern.sheetHeightMm} mm sheet; ${pattern.actualCutPieces} cut pieces`,
    output: { svg: pattern.svg, dxf: pattern.dxf, pdf: pattern.pdf, patternJson: pattern.patternJson },
    preview: pattern.preview,
    apparelPatternV6: true,
    notes: `${guide?.note || 'Draft apparel sewing pattern.'} Seam match QA: ${pattern.seamMatchQA}; physical production QA: ${pattern.physicalProductionQA}. ${pattern.warnings || ''}`.trim()
  };
  if (guide) return {
    dielineKind: 'ARTWORK_GUIDE',
    reviewStatus: guide.status || 'PRINT_REFERENCE_ONLY',
    manufacturerApproved: false,
    physicalPrototypeValidated: false,
    nominalDimensions: `${guide.model}: ${guide.artworkSizeMM} mm`,
    output: { svg: guide.svg, dxf: guide.dxf, pdf: guide.pdf },
    preview: guide.preview,
    notes: guide.note || 'Artwork guide only; not manufacturing cutline.'
  };
  return dielineAuditOf(id);
}

export function modelDielineOutput(modelOrId) {
  return modelDielineAudit(modelOrId)?.output || null;
}

export function productionTemplateIds(templates = TPLS) {
  return new Set(templates.map(t => t.id));
}

export function designTemplateIds(templates = TPLS) {
  return new Set([...productionTemplateIds(templates), ...Object.keys(IMPORTED_DIELINES)]);
}

export function selectableTemplateId(model, templates = TPLS) {
  if (!model) return 'ste';
  return model.id; // Never silently turn an unsupported model into STE
}

export function unsupportedProductionPackaging(templates = TPLS) {
  const ids = designTemplateIds(templates);
  return PACKAGING_EXTRA_MODELS.filter(m => !ids.has(m.id));
}

export function packagingFallbackNote(model, templates = TPLS) {
  if (!model || !(model.productCategory === 'packaging' || model.category === 'packaging')) return '';
  if (designTemplateIds(templates).has(model.id)) return '';
  return `${model.name} belum punya dieline/mesh produksi sendiri. Untuk sementara panel Desain dan 3D memakai engine Folding Carton lama (STE) agar fitur layer, validator, PDF, dan preview tetap jalan.`;
}

export function searchModels(query = '', categoryId = '', templates = TPLS) {
  const q = String(query || '').trim().toLowerCase();
  return allModels(templates).filter(m => {
    if (categoryId && !(m.productCategory === categoryId || m.category === categoryId)) return false;
    if (!q) return true;
    return [m.name, m.code, m.sub, m.stock, m.difficulty, m.mode, m.category, m.productCategory, m.subCategory, ...(m.tags || [])]
      .filter(Boolean).join(' ').toLowerCase().includes(q);
  });
}

export function modelStatus(model) {
  const audit = modelDielineAudit(model);
  const id = typeof model === 'string' ? model : model?.id;
  const guide = artworkGuideOf(id);
  const pattern = apparelPatternOf(id);
  if (pattern) return { label: 'Pola Jahit Draft', tone: '#9a5aa6', detail: `${guide?.model || model?.name || id}: pola jahit sample ${pattern.sheetWidthMm} x ${pattern.sheetHeightMm} mm, ${pattern.actualCutPieces} cut pieces. Belum production/fit validated.` };
  if (guide) return { label: 'Artwork Guide', tone: '#3f72b5', detail: `${guide.model}: area print ${guide.artworkSizeMM} mm. Bukan cutline manufaktur; ${guide.note}` };
  if (!model.mockup) return { label: audit?.reviewStatus === 'PROTOTYPE_REQUIRED' ? 'Draft Prototype' : 'Produksi Draft', tone: audit?.reviewStatus === 'PROTOTYPE_REQUIRED' ? '#b7791f' : '#2f8f55', detail: audit ? `${audit.reviewStatus}: ${audit.nominalDimensions || 'engineering draft, belum manufacturer approved'}` : 'Struktur dieline, desain, dan 3D sudah sinkron engine AstaKraf.' };
  if (designTemplateIds().has(model.id)) return { label: audit?.reviewStatus === 'PROTOTYPE_REQUIRED' ? 'Draft SVG' : 'SVG Cocok', tone: '#2f8f55', detail: audit ? `${audit.reviewStatus}: Desain memakai koordinat SVG asli dan safe printing hijau.` : 'Desain memakai koordinat SVG asli.' };
  if (model.productCategory === 'packaging' || model.category === 'packaging') return { label: 'Butuh Dieline', tone: '#b7791f', detail: 'Belum siap produksi: belum punya dieline parametris/mesh/PDF sendiri. Panel Desain dan 3D memakai fallback STE agar fitur lama tetap jalan.' };
  if (model.category === 'custom-model') return { label: model.surface === 'upload3d' ? 'Butuh 3D Mesh' : 'Butuh Brief', tone: '#6f6a60', detail: 'Perlu file/brief dari user sebelum bisa valid produksi.' };
  if (String(model.mode || '').includes('PDF') && !String(model.mode || '').includes('3D')) return { label: 'Desain Siap', tone: '#3f72b5', detail: 'Cocok untuk desain/PDF. 3D teknis belum wajib.' };
  return { label: 'Mockup Visual', tone: '#7b5aa6', detail: 'Mockup visual ringan. Belum true GLB/mesh teknis produksi.' };
}

export function catalogStats(templates = TPLS) {
  const models = allModels(templates);
  const byCategory = Object.fromEntries(PRODUCT_CATEGORIES.map(c => [c.id, models.filter(m => m.productCategory === c.id || m.category === c.id).length]));
  const statusCounts = models.reduce((acc, m) => { const k = modelStatus(m).label; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const productionReady = (statusCounts['Produksi Draft'] || 0) + (statusCounts['Draft Prototype'] || 0) + (statusCounts['Produksi Valid'] || 0);
  const mockupReady = models.filter(m => String(m.mode || '').includes('3D') || m.mockup).length;
  return { total: models.length, byCategory, productionReady, mockupReady, statusCounts };
}

const PRIORITY_IDS = ['pillow-box','pizza-box','shipping-box','sleeve-tray','standup-pouch','paper-cup-packaging','cup-sleeve','burger-clamshell','fries-box','bottle-label-packaging','belly-band','hangtag','sticker-label-roll'];

export function modelChecklist(model) {
  const status = modelStatus(model).label;
  const production = status === 'Produksi Valid';
  const printOnly = status === 'Desain Siap';
  const mockup = status === 'Mockup Visual';
  return {
    hasDieline: production,
    hasDesignMapping: production || printOnly || mockup,
    has3DPreview: production || mockup,
    hasMeshExport: production,
    hasPDFExport: production || printOnly,
    hasBriefFlow: model.category === 'custom-model'
  };
}

export function auditMatrix(templates = TPLS) {
  return allModels(templates).map((m, index) => {
    const status = modelStatus(m);
    const checklist = modelChecklist(m);
    const priorityRank = PRIORITY_IDS.indexOf(m.id);
    const targetStatus = status.label === 'Produksi Valid' ? 'Tetap Produksi Valid'
      : (m.productCategory === 'packaging' || m.category === 'packaging') ? 'Produksi Valid'
      : status.label === 'Desain Siap' ? 'Desain/PDF Valid'
      : m.category === 'custom-model' ? 'Custom Ready'
      : 'Mockup Valid';
    return { ...m, status: status.label, statusTone: status.tone, statusDetail: status.detail, targetStatus, checklist, priority: priorityRank >= 0 ? priorityRank + 1 : 100 + index };
  }).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
}

export function nextPriorityModels(limit = 10, templates = TPLS) {
  return auditMatrix(templates).filter(m => m.status !== 'Produksi Valid').slice(0, limit);
}
