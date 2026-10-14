import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchModelAssets} from '../src/render3d/modelAssetRegistry.js';
test('manifest parser reports HTML SPA fallback instead of empty model list',async()=>{
 await assert.rejects(()=>fetchModelAssets(async()=>({ok:true,headers:{get:()=> 'text/html'},json:async()=>({})})),'/model-assets/manifest.json'),/index.html/);
});
test('manifest rejects invalid schema',async()=>{
 await assert.rejects(()=>fetchModelAssets(async()=>({ok:true,headers:{get:()=> 'application/json'},json:async()=>({schemaVersion:2,models:{}})})),/Invalid asset registry/);
});
test('manifest returns registered GLB model',async()=>{
 const v=await fetchModelAssets(async()=>({ok:true,headers:{get:()=> 'application/json'},json:async()=>({schemaVersion:1,models:{'can-label':{modelId:'can-label'}}})}));
 assert.equal(v['can-label'].modelId,'can-label');
});
