import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
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
function attr(meshName,key){const node=parsed.json.nodes.find(n=>n.name===meshName);assert.ok(node,meshName);const prim=parsed.json.meshes[node.mesh].primitives[0],index=prim.attributes[key];assert.notEqual(index,undefined,'missing '+key);const a=parsed.json.accessors[index],b=parsed.json.bufferViews[a.bufferView];return {a,b,dv:parsed.dv,offset:parsed.binOffset+(b.byteOffset||0)+(a.byteOffset||0),stride:key==='TEXCOORD_0'?2:3};}
test('reference is registered as preview, not manufacturer approved',()=>{assert.equal(bundle.status,'preview');assert.equal(parsed.json.extras.physicalProductionApproved,false);assert.equal(bundle.geometry.labelCircumferenceMm,210);assert.equal(bundle.geometry.labelHeightMm,115);});
test('six real assembled components exist',()=>{const ns=parsed.json.nodes.map(n=>n.name);for(const n of ['label-wrap','can-body','top-rim','bottom-rim','can-top','can-bottom'])assert.ok(ns.includes(n),n);assert.equal(ns.length,6)});
test('printed label UV covers cut region within atlas bleed',()=>{const {a,offset,dv,stride}=attr('label-wrap','TEXCOORD_0');assert.equal(a.componentType,5126);let lo=[Infinity,Infinity],hi=[-Infinity,-Infinity];for(let i=0;i<a.count;i++){for(let k=0;k<2;k++){const f=dv.getFloat32(offset+4*(i*stride+k),true);lo[k]=Math.min(lo[k],f);hi[k]=Math.max(hi[k],f);}}const target=[(18-12)/222,(228-12)/222,1-(152-31)/127,1-(37-31)/127];assert.ok(Math.abs(lo[0]-target[0])<1e-5);assert.ok(Math.abs(hi[0]-target[1])<1e-5);assert.ok(Math.abs(lo[1]-target[2])<1e-5);assert.ok(Math.abs(hi[1]-target[3])<1e-5)});
test('print surface has indexed triangles',()=>{const node=parsed.json.nodes.find(n=>n.name==='label-wrap'),p=parsed.json.meshes[node.mesh].primitives[0];assert.ok(Number.isInteger(p.indices));assert.equal(parsed.json.accessors[p.indices].count,48*6)});

test('real Three.js GLTFLoader parses and reconstructs Can Label reference', async ()=>{
  const view=glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength);
  const result=await new Promise((resolve,reject)=>new GLTFLoader().parse(view,'',resolve,reject));
  const meshes=[];
  result.scene.traverse(o=>{if(o.isMesh)meshes.push(o)});
  assert.equal(meshes.length,6);
  const label=meshes.find(o=>o.name==='label-wrap');
  assert.ok(label,'printable label mesh');
  assert.ok(label.geometry.getAttribute('position').count>90);
  assert.ok(label.geometry.getAttribute('uv').count>90);
  assert.ok(label.geometry.index.count>200);
  assert.ok(meshes.every(o=>o.geometry.boundingSphere===null || Number.isFinite(o.geometry.boundingSphere.radius)));
});

test('UV seam is continuous on the 360 degree cylinder and orientation is consistent',async()=>{
  const view=glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength);
  const scene=(await new Promise((resolve,reject)=>new GLTFLoader().parse(view,'',resolve,reject))).scene;
  let label;scene.traverse(o=>{if(o.isMesh&&o.name==='label-wrap')label=o});
  assert.ok(label);const p=label.geometry.getAttribute('position'),uv=label.geometry.getAttribute('uv');
  const rows=p.count/2;assert.equal(rows,49);
  const ne=(a,b,tol=1e-5)=>assert.ok(Math.abs(a-b)<tol,`got ${a} expected ${b}`);
  // Vertex pair 0 and 48 touch in geometry but map to opposite print edges.
  for(const y of [0,1]){ne(p.getX(y),p.getX((rows-1)*2+y));ne(p.getZ(y),p.getZ((rows-1)*2+y));ne(p.getY(y),p.getY((rows-1)*2+y));}
  const u0=uv.getX(0),u1=uv.getX((rows-1)*2);ne(u0,6/222);ne(u1,216/222);
  for(let i=0;i<rows-1;i++){ne(uv.getX(i*2),uv.getX(i*2+1));assert.ok(uv.getX(i*2)<uv.getX((i+1)*2),'u must increase around perimeter');ne(uv.getY(i*2),1-121/127);ne(uv.getY(i*2+1),1-6/127);}
  const geometry=label.geometry;const indices=geometry.index;for(let i=0;i<indices.count;i+=3){const a=indices.getX(i),b=indices.getX(i+1),c=indices.getX(i+2);const area=(p.getX(b)-p.getX(a))*(p.getZ(c)-p.getZ(a))-(p.getZ(b)-p.getZ(a))*(p.getX(c)-p.getX(a));assert.ok(Number.isFinite(area));}
});
