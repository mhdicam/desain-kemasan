import {modelStateForPreview} from '../src/render3d/modelContext.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {routeModel,validateAssetBundle,verifySurfaceMappings} from '../src/render3d/modelAssetRegistry.js';
import {buildGLTF,exportGLBBuffer,inspectGLBBuffer} from '../src/render3d/gltfBinary.js';
const bundle={modelId:'sample',glb:'/model-assets/sample/assembled.glb',status:'preview',surfaces:[{surfaceId:'front',nodeName:'front',panelId:'front',kind:'artwork',uvMode:'atlas'}]};
test('keeps original procedural template',()=>assert.equal(routeModel('rte').kind,'procedural'));
test('does not silently substitute STE',()=>assert.equal(routeModel('gable-box').kind,'unavailable'));
test('rejects uncalibrated UV mode',()=>assert.equal(validateAssetBundle('sample',{...bundle,surfaces:[{...bundle.surfaces[0],uvMode:'unmapped'}]}).ok,false));
test('registers valid prebuilt bundle',()=>assert.equal(routeModel('sample',{sample:bundle}).kind,'glb'));
test('rejects missing GLB panel',()=>{const scene={traverse:fn=>fn({isMesh:true,name:'front',geometry:{getAttribute:()=>({count:3,getX:()=>.5,getY:()=>.5})}})};assert.deepEqual(verifySurfaceMappings(scene,bundle,[]),['2D panel front missing']);assert.deepEqual(verifySurfaceMappings(scene,bundle,[{panelId:'front'}]),[])});
test('GLB writer stores real POSITION and index accessors',()=>{const m={id:'triangle',faces:[{name:'front',panelId:'front',mat:'paper',verts:[[0,0,0],[100,0,0],[0,100,0]],uv:[[0,0],[1,0],[0,1]]}]};const {json,bin}=buildGLTF(m);assert.ok(bin.length>0);assert.ok(json.meshes[0].primitives[0].attributes.POSITION>=0);assert.equal(inspectGLBBuffer(exportGLBBuffer(m)).meshes,1)});
test('rejects invalid geometry',()=>assert.throws(()=>exportGLBBuffer({id:'bad',faces:[{name:'bad',verts:[[0,0,0],[0,0,0],[0,0,0]],uv:[[0,0],[1,0],[0,1]]}]}),/Degenerate/));

test('preview context always follows selected Can Label model, not previous STE',()=>{const s={tpl:'ste',activeModelId:'can-label',layers:[],ovr:{foo:1},typeOvr:{bar:2}};const next=modelStateForPreview(s,'can-label');assert.equal(next.tpl,'can-label');assert.deepEqual(next.ovr,{});assert.deepEqual(next.typeOvr,{})});
test('preview context refuses stale active-model mismatch',()=>assert.throws(()=>modelStateForPreview({activeModelId:'ste',tpl:'ste'},'can-label'),/Model ID mismatch/));
