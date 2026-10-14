import React,{useEffect,useState} from 'react';
import {BoxPreview} from './BoxPreview.jsx';
import {GlbAssetPreview} from './GlbAssetPreview.jsx';
import {asset as resolveAssetUrl} from '../asset.js';
import {routeModel,fetchModelAssets} from './modelAssetRegistry.js';

export function ModelPreview({modelId,s,m,mesh,qa,context,fitFold,engineRef}){
  const [registry,setRegistry]=useState({status:'loading',models:{},error:''});
  useEffect(()=>{
    let live=true;
    // A fresh request makes missing deploy artifacts diagnosable instead of returning a stale module cache.
    fetchModelAssets(fetch,resolveAssetUrl('/model-assets/manifest.json'))
      .then(models=>{if(live)setRegistry({status:'ready',models,error:''})})
      .catch(err=>{if(live)setRegistry({status:'failed',models:{},error:String(err.message||err)})});
    return()=>{live=false};
  },[]);
  const route=routeModel(modelId,registry.models);
  if(registry.status==='loading')return <div role="status" style={{position:'absolute',inset:0,display:'grid',placeItems:'center',padding:24}}>Memuat registry aset 3D…</div>;
  if(route.kind==='procedural')return <BoxPreview s={s} m={m} mesh={mesh} qa={qa} context={context} fitFold={fitFold} engineRef={engineRef}/>;
  if(route.kind==='glb')return <GlbAssetPreview asset={route.asset} designState={s} context={context} bakeKey={context?.bakeKey}/>;
  const message=registry.status==='failed'?'Gagal mengambil manifest 3D: '+registry.error:route.reason;
  return <div role="alert" style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:30,textAlign:'center',background:'#f1ede7',color:'#504432'}}>
    <div><h3>3D mockup belum dapat ditampilkan</h3><p>{message}</p><p>Periksa file <code>dist/model-assets/manifest.json</code> dan <code>dist/model-assets/{modelId}/assembled.glb</code> setelah build.</p></div>
  </div>;
}
