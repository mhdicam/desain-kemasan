// path asset situs：kompatibel GitHub Pages 子path部署 (vite base，如 /OpenBox3D/)。
// p 约定为以 / 开头的站titik绝对path (/brand/…, /hdri/…, /textures/…, /preset/…)；
// dev (base=/)与lama样sama，Pages 构建 (base=/OpenBox3D/)auto prefix。
export const asset = p => import.meta.env.BASE_URL.replace(/\/$/, '') + p;
