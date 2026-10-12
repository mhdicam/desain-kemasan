// 3D luar观preset：Kertas与Laminasiregular交组合；energi environment只属于影studio，不写入Material。
// 影studiopreset (STUDIO_PRESETS)从 rig.js 的 SCENE_PRESETS derive摘要，lama id 经 scenePreset 映射kompatibel。
import { SCENE_PRESETS, scenePreset } from './rig.js';

// Kertas扩展字段 (均有default值兜bawah，lama纸种行为不变)：sheen 0, specularIntensity 1 (Black card 0.72), metalBase 0 (烘焙 metalness bawah色，Silver card类用)
export const PAPER_PRESETS = [
  { id: 'coated-white', name: 'Kartu putih coated', color: '#f4f1e8', roughness: 0.48, grain: 'fine', grainStrength: 0.45, grainMm: 8, core: '#d8cdb2' },
  { id: 'ivory-uncoated', name: 'Kartu ivory uncoated', color: '#eee5d2', roughness: 0.72, grain: 'open', grainStrength: 0.72, grainMm: 9, core: '#d2c3a6' },
  { id: 'art-paper', name: 'Art paper / coated paper', color: '#f6f3eb', roughness: 0.38, grain: 'fine', grainStrength: 0.28, grainMm: 7, core: '#ded8c9' },
  { id: 'kraft-natural', name: 'Kartu kraft natural', color: '#b9834c', roughness: 0.9, grain: 'kraft', grainStrength: 0.28, grainMm: 8, core: '#a9703e' },
  { id: 'black-card', name: 'Black card', color: '#24211e', roughness: 0.68, grain: 'fine', grainStrength: 0.12, grainMm: 14, core: '#4a443d', specularIntensity: 0.72 },
  { id: 'white-grayback', name: 'White board greyback', color: '#eeeae0', roughness: 0.62, grain: 'open', grainStrength: 0.55, grainMm: 9, core: '#77756f' },
  { id: 'pearlescent-white', name: 'Kartu putih pearlescent', color: '#f2eee6', roughness: 0.42, grain: 'fine', grainStrength: 0.3, grainMm: 7, core: '#ddd5c4', sheen: 0.35 },
  { id: 'metal-silver-card', name: 'Silver card', color: '#e8e8ea', roughness: 0.32, grain: 'fine', grainStrength: 0.25, grainMm: 7, core: '#c9c9cc', metalBase: 0.9 }
];

// film 扩展字段 specularIntensity (default 1；Laminasi doff 0.5，压暗镜面反射)
export const FILM_PRESETS = [
  { id: 'none', name: 'Tanpa laminasi', clearcoat: 0, clearcoatRoughness: 0.5, roughnessFactor: 1, sheen: 0 },
  { id: 'matte', name: 'Laminasi doff', clearcoat: 0.38, clearcoatRoughness: 0.5, roughnessFactor: 0.92, sheen: 0.05, specularIntensity: 0.5 },
  { id: 'gloss', name: 'Laminasi glossy', clearcoat: 1, clearcoatRoughness: 0.045, roughnessFactor: 0.42, sheen: 0 },
  { id: 'soft', name: 'Soft-touch film', clearcoat: 0.18, clearcoatRoughness: 0.72, roughnessFactor: 1.12, sheen: 0.48 }
];

// 影studio摘要 (lama UI/存档字段)：完整parameter见 rig.js 的 SCENE_PRESETS (schema v2 灯具array，berdasarkan id pakaiintensitas)
export const STUDIO_PRESETS = SCENE_PRESETS.map(r => {
  const I = id => { const l = r.lights.find(x => x.id === id); return l ? l.intensity : 0; };
  return {
    id: r.id, name: r.name, env: r.environment.intensity, exposure: r.tone.exposure,
    key: I('key'), fill: I('fill'), rim: I('rim'), hemi: I('hemi'),
    shadowSoftness: r.shadow.softness, shadowOpacity: r.shadow.opacity
  };
});

// HDRI 环境库 (本地 1K，Poly Haven CC0，详见 public/hdri/manifest.json)；kb 为色温/氛围label，source 供 UI 展示
export const ENVIRONMENT_PRESETS = [
  { id: 'procedural', name: 'Studio prosedural', url: null, kb: 'Dome editable bawaan', source: 'Bawaan' },
  { id: 'room-neutral', name: 'Lab ruang netral', url: null, kb: 'RoomEnvironment soft light netral', source: 'Bawaan' },
  { id: 'studio_small_08', name: 'Studio soft light · Studio Small 08', url: '/hdri/studio_small_08_1k.hdr', kb: '~6000K tone dingin bersih', source: 'Poly Haven' },
  { id: 'studio_small_03', name: 'Studio kontras tinggi · Studio Small 03', url: '/hdri/studio_small_03_1k.hdr', kb: '~5400K kontras tinggi', source: 'Poly Haven' },
  { id: 'studio_small_09', name: 'Studio hangat · Studio Small 09', url: '/hdri/studio_small_09_1k.hdr', kb: '2750K Premium hangat', source: 'Poly Haven' },
  { id: 'white_studio_03', name: 'E-commerce latar putih · White Studio 03', url: '/hdri/white_studio_03_1k.hdr', kb: '~5300K studio putih', source: 'Poly Haven' },
  { id: 'white_studio_06', name: 'Studio putih terang · White Studio 06', url: '/hdri/white_studio_06_1k.hdr', kb: 'high-keystudio putih', source: 'Poly Haven' },
  { id: 'cyclorama_hard_light', name: 'Cyclorama putih · Cyclorama', url: '/hdri/cyclorama_hard_light_1k.hdr', kb: '~5400K hard light', source: 'Poly Haven' },
  { id: 'photo_studio_01', name: 'Studio dingin · Photo Studio 01', url: '/hdri/photo_studio_01_1k.hdr', kb: '~5622K kontras sedang', source: 'Poly Haven' }
];

export const paperPreset = id => PAPER_PRESETS.find(x => x.id === id) || PAPER_PRESETS[0];
export const filmPreset = id => FILM_PRESETS.find(x => x.id === id) || FILM_PRESETS[0];
export const studioPreset = id => STUDIO_PRESETS.find(x => x.id === id) || STUDIO_PRESETS.find(x => x.id === scenePreset(id).id) || STUDIO_PRESETS[0];
export const environmentPreset = id => ENVIRONMENT_PRESETS.find(x => x.id === id) || ENVIRONMENT_PRESETS[1];

export function legacyAppearance(id) {
  return {
    sbs: ['coated-white', 'none'], black: ['black-card', 'none'], kraft: ['kraft-natural', 'none'],
    matte: ['coated-white', 'matte'], gloss: ['coated-white', 'gloss'], soft: ['coated-white', 'soft']
  }[id] || ['coated-white', 'none'];
}
