import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const glb=readFileSync(new URL('../public/model-assets/can-label/assembled.glb',import.meta.url));
const manifest=JSON.parse(readFileSync(new URL('../public/model-assets/manifest.json',import.meta.url),'utf8'));
function parseGLB(bytes){const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  assert.equal(dv.getUint32(0,true),0x46546c67,'GLB header');assert.equal(dv.getUint32(4,true),2);
  assert.equal(dv.getUint32(8,true),bytes.length,'full GLB size');
  const n=dv.getUint32(12,true);assert.equal(dv.getUint32(16,true),0x4e4f534a,'JSON chunk');
  const json=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+n)).trim());
  const offset=20+n;assert.equal(dv.getUint32(offset+4,true),0x004e4942,'BIN chunk');
  return {json,binOffset:offset+8,dv};
}
const parsed=parseGLB(glb),bundle=manifest.models['can-label'];
function attr(meshName,key){const node=parsed.json.nodes.find(n=>n.name===meshName);assert.ok(node,meshName);const prim=parsed.json.meshes[node.mesh].primitives[0],index=prim.attributes[key];assert.notEqual(index,undefined,'missing '+key);const a=parsed.json.accessors[index],b=parsed.json.bufferViews[a.bufferView];return {a,b,offset:parsed.binOffset+(b.byteOffset||0)+(a.byteOffset||0),stride:key==='TEXCOORD_0'?2:3};}
test('reference is registered as preview, not manufacturer approved',()=>{assert.equal(bundle.status,'preview');assert.equal(parsed.json.extras.physicalProductionApproved,false);assert.equal(bundle.geometry.labelCircumferenceMm,210);assert.equal(bundle.geometry.labelHeightMm,115);});
test('six real assembled components exist',()=>{const ns=parsed.json.nodes.map(n=>n.name);for(const n of ['label-wrap','can-body','top-rim','bottom-rim','can-top','can-bottom'])assert.ok(ns.includes(n),n);assert.equal(ns.length,6)});
test('printed label UV covers cut region within atlas bleed',()=>{const {a,offset,dv,stride}=attr('label-wrap','TEXCOORD_0');assert.equal(a.componentType,5126);let lo=[Infinity,Infinity],hi=[-Infinity,-Infinity];for(let i=0;i<a.count;i++){for(let k=0;k<2;k++){const f=dv.getFloat32(offset+4*(i*stride+k),true);lo[k]=Math.min(lo[k],f);hi[k]=Math.max(hi[k],f);}}const target=[(18-12)/222,(228-12)/222,1-(152-31)/127,1-(37-31)/127];assert.ok(Math.abs(lo[0]-target[0])<1e-5);assert.ok(Math.abs(hi[0]-target[1])<1e-5);assert.ok(Math.abs(lo[1]-target[2])<1e-5);assert.ok(Math.abs(hi[1]-target[3])<1e-5)});
test('print surface has indexed triangles',()=>{const node=parsed.json.nodes.find(n=>n.name==='label-wrap'),p=parsed.json.meshes[node.mesh].primitives[0];assert.ok(Number.isInteger(p.indices));assert.equal(parsed.json.accessors[p.indices].count,48*6)});
