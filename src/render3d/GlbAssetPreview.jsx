import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {asset as resolveAssetUrl} from '../asset.js';
export function GlbAssetPreview({asset}){const host=useRef(null),[error,setError]=useState('');
useEffect(()=>{let stopped=false,renderer,controls,raf,model;const el=host.current;if(!el)return;const scene=new THREE.Scene();scene.background=new THREE.Color('#f3f0eb');const camera=new THREE.PerspectiveCamera(38,1,.001,100);camera.position.set(1,1,1);scene.add(new THREE.HemisphereLight(0xffffff,0xb1aaa0,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(2,4,3);scene.add(light);
try{renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);}catch(e){setError(e.message);return;}
controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
function fit(){if(!renderer)return;const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
const resize=new ResizeObserver(fit);resize.observe(el);fit();
new GLTFLoader().load(resolveAssetUrl(asset.glb),g=>{if(stopped)return;model=g.scene;scene.add(model);const b=new THREE.Box3().setFromObject(model),v=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());if(!Number.isFinite(v.length())||v.length()<1e-7){setError('GLB geometry invalid');return;}controls.target.copy(center);const radius=Math.max(v.x,v.y,v.z,0.05);camera.position.copy(center).add(new THREE.Vector3(radius*1.5,radius*1.1,radius*1.6));camera.near=Math.max(radius/1000,0.0001);camera.far=Math.max(100,radius*100);camera.updateProjectionMatrix();
const names=new Set();model.traverse(o=>{if(o.isMesh)names.add(o.name);});const missing=asset.surfaces.filter(s=>!names.has(s.nodeName));if(missing.length)setError('Missing GLB nodes: '+missing.map(s=>s.nodeName).join(', '));},undefined,e=>setError('Gagal memuat GLB: '+(e.message||e)));
function animate(){if(stopped)return;controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate);}animate();
return()=>{stopped=true;cancelAnimationFrame(raf);resize.disconnect();controls.dispose();if(model)model.traverse(o=>{if(o.isMesh)o.geometry.dispose();});renderer.dispose();renderer.domElement.remove();};},[asset.glb]);
return <div style={{position:'absolute',inset:0}} ref={host}>{error&&<div role="alert" style={{position:'absolute',top:10,left:10,zIndex:2,background:'#fff3dc',padding:10}}>{error}</div>}</div>;}
