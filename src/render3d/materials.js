// Material装配：单 MeshPhysicalMaterial 挂全套atlastekstur——Foil emas(metalnessMap)×Emboss(normal+displacement) stack alami
import * as THREE from 'three';
import { paperPreset, filmPreset } from './presets.js';

export function makeAtlasTextures(baked) {
  const mk = (c, srgb) => {
    const x = new THREE.CanvasTexture(c);
    if (srgb) x.colorSpace = THREE.SRGBColorSpace;
    x.anisotropy = 8;
    return x;
  };
  // Mode cek「Plat foil」Tampilan金+perakgabungan mask (maskFoil kanvas aslitetapfoil emassingle channel，供repaint roughness)
  const foilAll = baked.maskSilver ? (() => {
    const c = document.createElement('canvas'); c.width = baked.maskFoil.width; c.height = baked.maskFoil.height;
    const g = c.getContext('2d'); g.drawImage(baked.maskFoil, 0, 0); g.drawImage(baked.maskSilver, 0, 0);
    return c;
  })() : baked.maskFoil;
  return {
    map: mk(baked.colorC, true),
    normal: mk(baked.normalFull), normalPaper: mk(baked.normalPaper),
    rough: mk(baked.roughC), metal: mk(baked.metalC),
    cc: mk(baked.ccC), ccR: mk(baked.ccRC),
    disp: mk(baked.dispC),
    checker: mk(baked.checkerC, true),
    maskFoil: mk(foilAll, true), maskUv: mk(baked.maskUv, true), maskGloss: mk(baked.maskGloss, true), maskHolo: baked.maskHolo ? mk(baked.maskHolo, true) : null, dispCheck: mk(baked.dispC, true)
  };
}

export function disposeTextures(tex) {
  if (!tex) return;
  Object.values(tex).forEach(t => t && t.dispose && t.dispose());
}

// flags: { check:'art'|'foil'|'suv'|'gloss'|'emb'|'checker', embOn, embDepth, embBoost, embDir, hasEmb }
export function applyFaceMaterial(faceMat, appearance, tex, flags) {
  const paper = paperPreset(appearance.paperId), film = filmPreset(appearance.filmId);
  const check = flags.check || 'art';
  // Mode cek：single channel直出，matikan lainnyatekstur
  if (check !== 'art') {
    faceMat.color.set(0xffffff);
    faceMat.map = check === 'checker' ? tex.checker : check === 'foil' ? tex.maskFoil : check === 'suv' ? tex.maskUv : check === 'gloss' ? tex.maskGloss : check === 'holo' ? tex.maskHolo : tex.dispCheck;
    faceMat.roughnessMap = null; faceMat.roughness = check === 'emb' ? 0.4 : 0.65;
    faceMat.metalnessMap = null; faceMat.metalness = 0;
    faceMat.clearcoatMap = null; faceMat.clearcoatRoughnessMap = null; faceMat.clearcoat = 0;
    faceMat.normalMap = null; faceMat.clearcoatNormalMap = null;
    faceMat.displacementMap = null; faceMat.displacementScale = 0;
    faceMat.sheen = 0; faceMat.envMapIntensity = 1;
    faceMat.iridescence = 0; faceMat.iridescenceMap = null;
    faceMat.needsUpdate = true;
    return;
  }
  faceMat.color.set(0xffffff);            // albedo atlasberisiwarna dasar kertas，color set putihhindarimultiply
  faceMat.map = tex.map;
  faceMat.roughness = 1; faceMat.roughnessMap = tex.rough;
  faceMat.metalness = Math.max(0, Math.min(1, appearance.foilMetalness == null ? 1 : appearance.foilMetalness)); faceMat.metalnessMap = tex.metal;
  faceMat.clearcoat = 1; faceMat.clearcoatMap = tex.cc;
  faceMat.clearcoatRoughness = 1; faceMat.clearcoatRoughnessMap = tex.ccR;
  const useEmb = flags.embOn && flags.hasEmb;
  faceMat.normalMap = useEmb ? tex.normal : tex.normalPaper;
  const normalStrength = Math.max(0, Math.min(3, appearance.embNormalStrength == null ? 1 : appearance.embNormalStrength));
  faceMat.normalScale.set(normalStrength, normalStrength);
  // penting：clearcoat highlight层default abaikan normalMap，必须单独指定，jika tidakLaminasi下embosstidak bereaksi cahaya
  faceMat.clearcoatNormalMap = useEmb ? tex.normal : tex.normalPaper;
  faceMat.clearcoatNormalScale.set(normalStrength, normalStrength);
  if (useEmb) {
    faceMat.displacementMap = tex.disp;
    const amp = flags.embDepth * (flags.embBoost ? 3 : 1);
    const displacementStrength = Math.max(0, Math.min(2, appearance.embDisplacementStrength == null ? 1 : appearance.embDisplacementStrength));
    faceMat.displacementScale = amp * 2 * displacementStrength;
    faceMat.displacementBias = -amp * displacementStrength;
  } else {
    faceMat.displacementMap = null; faceMat.displacementScale = 0;
  }
  const roughnessFactor = appearance.filmRoughnessFactor == null ? film.roughnessFactor : appearance.filmRoughnessFactor;
  faceMat.roughness = Math.max(0.12, Math.min(1, appearance.roughness == null ? paper.roughness * roughnessFactor : appearance.roughness * roughnessFactor));
  faceMat.sheen = Math.max(paper.sheen || 0, Math.max(0, Math.min(1, appearance.filmSheen == null ? film.sheen : appearance.filmSheen))); faceMat.sheenRoughness = film.id === 'soft' ? 0.82 : 0.9; faceMat.sheenColor.set(0xf7efe3);
  // Holografik：iridescence interferensi film tipis。metalnessMap 是三通道打包tekstur——R=iridescence mask, G=noise tebal film, B=metalness，
  // iridescenceMap 与 iridescenceThicknessMap reuse tekstur sama (batas unit tekstur device 16，packing hemat satu unit)。
  // IOR 1.8。rentang tebal mengikuti holoSpan (rentang warna)：batas bawah钉 100nm jaga area vivid，batas atas 320→880nm——
  // catatanTinggiujung tebal filmakankurva sensitivitasGaussian窗fade ke abu-putih (teruji 800nm 上半段area besar kehilangan warna)，rentang lebarmengandalkan G noise untuk sapu spektrum penuh。
  const iridescence = Math.max(0, Math.min(1, appearance.iridescence || 0));
  const holoSpan = Number.isFinite(+appearance.holoSpan) ? Math.max(0, Math.min(1, +appearance.holoSpan)) : 0.5;
  faceMat.iridescence = iridescence; faceMat.iridescenceIOR = 1.8;
  faceMat.iridescenceThicknessRange = [100, Math.round(320 + 560 * holoSpan)];
  faceMat.iridescenceMap = iridescence > 0 ? tex.metal : null;
  faceMat.iridescenceThicknessMap = iridescence > 0 ? tex.metal : null;
  // energi environment唯一由 scene.environmentIntensity kontrol；Materialtidak kedua kalimultiply。
  faceMat.envMapIntensity = 1;
  const paperSpec = paper.specularIntensity == null ? (paper.id === 'black-card' ? 0.72 : 1) : paper.specularIntensity;
  faceMat.specularIntensity = paperSpec * (film.specularIntensity == null ? 1 : film.specularIntensity);
  faceMat.needsUpdate = true;
}

// core kertasSisi：ivory board / corrugated brown
export function applyCoreMaterial(coreMat, paperId) {
  coreMat.color.set(paperPreset(paperId).core);
  coreMat.roughness = 0.92;
  coreMat.needsUpdate = true;
}
