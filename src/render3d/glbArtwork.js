// Reuse the same 2D artwork atlas as the native renderer. This does not auto-unwrap GLBs.
import * as THREE from 'three';
import { bakeAtlas } from './bake.js';
export function bakeArtworkTexture(s,context){
  if(!context?.g?.panels?.length || !s?.layers) throw Error('Missing 2D artwork geometry');
  const out=bakeAtlas({layers:s.layers,panels:context.g.panels,sbb:context.g.sbb,bleed:s.bleed||0,
    paperId:s.paper3d||'coated-white',filmId:s.film3d||'none',
    grainStrength:s.grainStrength,grainScale:s.grainScale,paperTint:s.paperTint3d||'',
    foilOn:s.fx?.foil,suvOn:s.fx?.suv,glossOn:s.fx?.gloss,holoOn:s.fx?.holo,
    embOn:false,foilColor:s.foilColor3d,silverColor:s.silverColor3d,
    holoColor:s.holoColor3d,holoRainbow:s.holoRainbow3d,
    embDepth:s.embDepth,embSharpness:s.embSharpness3d,embDir:s.embDir,
    foilRoughness:s.foilRoughness3d,glossRoughness:s.glossRoughness3d
  });
  const texture=new THREE.CanvasTexture(out.colorC);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.flipY=false; // GLB authored in glTF UV convention; atlas image is 2D +y-down
  texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;
  texture.needsUpdate=true;
  return {texture,atlasSbb:out.atlasSbb};
}
