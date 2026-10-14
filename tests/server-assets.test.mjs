import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchModelAssets} from '../src/render3d/modelAssetRegistry.js';

const response=(type,body)=>({
  ok:true,headers:{get:()=>type},json:async()=>body
});
test('manifest parser reports HTML SPA fallback',async()=>{
  await assert.rejects(
    fetchModelAssets(async()=>response('text/html',{}),'/model-assets/manifest.json'),
    /index.html/
  );
});
test('manifest rejects invalid schema',async()=>{
  await assert.rejects(
    fetchModelAssets(async()=>response('application/json',{schemaVersion:2,models:{}})),
    /Invalid asset registry/
  );
});
test('manifest returns registered Can Label model',async()=>{
  const models=await fetchModelAssets(async()=>response('application/json',{
    schemaVersion:1,models:{'can-label':{modelId:'can-label'}}
  }));
  assert.equal(models['can-label'].modelId,'can-label');
});
