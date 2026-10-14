import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {asset as resolveAssetUrl} from '../asset.js';
import {bakeArtworkTexture} from './glbArtwork.js';
import {verifySurfaceMappings} from './modelAssetRegistry.js';

export function GlbAssetPreview({asset,designState,context,bakeKey}){
  const host=useRef(null),loaded=useRef(null),[error,setError]=useState('');
  useEffect(()=>{
    let cancelled=false,renderer,controls,raf,model;
    const el=host.current;if(!el)return;
    setError('');const scene=new THREE.Scene();scene.background=new THREE.Color('#f3f0eb');
    const camera=new THREE.PerspectiveCamera(38,1,.001,100);camera.position.set(1,1,1);
    scene.add(new THREE.HemisphereLight(0xffffff,0xb1aaa0,2));
    const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(2,4,3);scene.add(light);
    try{
      renderer=new THREE.WebGLRenderer({antialias:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
    }catch(e){setError(e.message);return;}
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
    const fit=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
    const resize=new ResizeObserver(fit);resize.observe(el);fit();
    new GLTFLoader().load(resolveAssetUrl(asset.glb),g=>{
      if(cancelled){g.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();}});return;}
      model=g.scene;
      const issues=verifySurfaceMappings(model,asset,context?.g?.panels||[]);
      if(issues.length){setError('Asset mapping rejected: '+issues.join('; '));return;}
      scene.add(model);loaded.current=model;
      const b=new THREE.Box3().setFromObject(model),v=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());
      if(!Number.isFinite(v.length())||v.length()<1e-7){setError('GLB geometry invalid');return;}
      controls.target.copy(center);const radius=Math.max(v.x,v.y,v.z,0.05);
      camera.position.copy(center).add(new THREE.Vector3(radius*1.5,radius*1.1,radius*1.6));
      camera.near=Math.max(radius/1000,0.0001);camera.far=Math.max(100,radius*100);camera.updateProjectionMatrix();
    },undefined,err=>setError('Gagal memuat GLB: '+(err.message||err)));
    const animate=()=>{if(cancelled)return;controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate);};animate();
    return()=>{cancelled=true;cancelAnimationFrame(raf);resize.disconnect();controls.dispose();loaded.current=null;
      if(model)model.traverse(o=>{if(o.isMesh){o.geometry.dispose();}});
      renderer.dispose();renderer.domElement.remove();};
  },[asset.glb,asset.surfaces,context?.g?.panels]);
  useEffect(()=>{
    const model=loaded.current;if(!model)return;
    let output;
    try{
      output=bakeArtworkTexture(designState,context);
      const meshes=new Map();model.traverse(o=>{if(o.isMesh)meshes.set(o.name,o);});
      for(const surface of asset.surfaces){
        if(surface.kind!=='artwork')continue;
        const node=meshes.get(surface.nodeName);if(!node)throw Error('Missing surface '+surface.nodeName);
        if(node.userData.__artMat){node.material.dispose();}
        const original=node.userData.__sourceMaterial||(node.userData.__sourceMaterial=node.material);
        const material=Array.isArray(original)?original.map(m=>m.clone()):original.clone();
        const apply=m=>{m.map=output.texture;m.color.set(0xffffff);m.needsUpdate=true;};
        if(Array.isArray(material))material.forEach(apply);else apply(material);
        node.material=material;node.userData.__artMat=true;
      }
      const prev=model.userData.__artTexture;
      model.userData.__artTexture=output.texture;if(prev)prev.dispose();
      setError('');
    }catch(err){if(output?.texture)output.texture.dispose();setError('Artwork-to-GLB: '+err.message);}
  },[asset,designState,context,bakeKey]);
  return <div ref={host} style={{position:'absolute',inset:0}}>{error&&<div role="alert" style={{position:'absolute',top:10,left:10,zIndex:2,background:'#fff3dc',padding:10}}>{error}</div>}</div>;
}
