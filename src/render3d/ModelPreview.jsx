import React,{useEffect,useState} from 'react';
import {BoxPreview} from './BoxPreview.jsx';
import {GlbAssetPreview} from './GlbAssetPreview.jsx';
import {asset as resolveAssetUrl} from '../asset.js';
import {routeModel,fetchModelAssets} from './modelAssetRegistry.js';
let cache=null;
export function ModelPreview({modelId,s,m,mesh,qa,context,fitFold,engineRef}){const [assets,setAssets]=useState(cache),[error,setError]=useState('');
useEffect(()=>{let live=true;if(cache){setAssets(cache);return;}fetchModelAssets(fetch,resolveAssetUrl('/model-assets/manifest.json')).then(v=>{cache=v;if(live)setAssets(v);}).catch(e=>{if(live)setError(e.message)});return()=>{live=false};},[]);
const route=routeModel(modelId,assets||{});
if(route.kind==='procedural')return <BoxPreview s={s} m={m} mesh={mesh} qa={qa} context={context} fitFold={fitFold} engineRef={engineRef}/>;
if(route.kind==='glb')return <GlbAssetPreview asset={route.asset}/>;
return <div role="status" style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:30,textAlign:'center',background:'#f1ede7',color:'#504432'}}><div><h3>3D mockup belum tersedia</h3><p>{error||route.reason}</p><p>Daftarkan assembled.glb dan surface mapping pada model-assets/manifest.json.</p></div></div>;}
