export const NATIVE_PROCEDURAL_IDS=Object.freeze(['rte','ste','mailer','lidbase','drawer','cyl','hex']);
const native=new Set(NATIVE_PROCEDURAL_IDS);
export function validateAssetBundle(id,b){const errors=[];if(!b||b.modelId!==id)errors.push('invalid modelId');if(!b||typeof b.glb!=='string'||!/^\/model-assets\/[a-zA-Z0-9_./-]+\.glb$/.test(b.glb)||b.glb.includes('..'))errors.push('invalid local GLB path');if(!['preview','reviewed','approved'].includes(b?.status))errors.push('invalid status');if(!Array.isArray(b?.surfaces)||!b.surfaces.length)errors.push('missing surfaces');else{const ids=new Set();for(const s of b.surfaces){if(!s.surfaceId||!s.nodeName||ids.has(s.surfaceId))errors.push('invalid/duplicate surface');ids.add(s.surfaceId);if(!['artwork','material','nonprintable'].includes(s.kind))errors.push('invalid surface kind');if(s.kind==='artwork'&&(!s.panelId||s.uvMode!=='atlas'))errors.push('artwork requires validated atlas UV mapping');}}return{ok:errors.length===0,errors};}
export function routeModel(id,manifest={}){if(!id)return{kind:'unavailable',reason:'No selected model'};const b=manifest[id];if(b){const v=validateAssetBundle(id,b);return v.ok?{kind:'glb',asset:b}:{kind:'unavailable',reason:v.errors.join('; ')}}if(native.has(id))return{kind:'procedural',modelId:id};return{kind:'unavailable',reason:id+' has no prebuilt assembled GLB; SVG is not a 3D assembly'};}
export async function fetchModelAssets(fetcher=fetch,url='/model-assets/manifest.json'){const res=await fetcher(url);if(!res.ok)throw Error('Asset registry HTTP '+res.status);const json=await res.json();if(json.schemaVersion!==1||!json.models||typeof json.models!=='object'||Array.isArray(json.models))throw Error('Invalid asset registry');return json.models;}

export function verifySurfaceMappings(scene,bundle,panels=[]){
  const errors=[],meshes=new Map();scene.traverse(o=>{if(o.isMesh)meshes.set(o.name,o)});
  const panelIds=new Set(panels.map(p=>p.panelId));
  for(const surface of bundle.surfaces||[]){
    const mesh=meshes.get(surface.nodeName);
    if(!mesh){errors.push('mesh '+surface.nodeName+' missing');continue;}
    if(surface.kind==='artwork'){
      if(!panelIds.has(surface.panelId))errors.push('2D panel '+surface.panelId+' missing');
      if(surface.uvMode!=='atlas')errors.push('surface '+surface.nodeName+' not atlas UV');
      const uv=mesh.geometry?.getAttribute?.('uv');
      if(!uv||uv.count<3)errors.push('surface '+surface.nodeName+' missing UV');
      else{for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);if(!Number.isFinite(u)||!Number.isFinite(v)||u<0||u>1||v<0||v>1){errors.push('out of range UV '+surface.nodeName);break;}}}
    }
  }
  return errors;
}
