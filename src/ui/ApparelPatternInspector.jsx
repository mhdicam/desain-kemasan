import React,{useEffect,useMemo,useState} from 'react';
import {asset as assetUrl} from '../asset.js';
import {layoutPath,pieceCenter,patternQA,sewingRelationships} from '../artwork/apparelPatternPairing.js';

const mini={border:'1px solid #d8cbbc',borderRadius:7,padding:'7px 10px',background:'#fff',color:'#514333',fontWeight:700,cursor:'pointer'};
export function ApparelPatternInspector({modelId,pattern}){
  const [data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(1),[zoom,setZoom]=useState(1),[showCut,setShowCut]=useState(true),[showStitch,setShowStitch]=useState(true);
  useEffect(()=>{
    if(!pattern?.patternJson){setData(null);setLoading(false);setError('Tidak ada file pola jahit JSON');return;}
    const controller=new AbortController();
    setLoading(true);setError('');setData(null);setSelected(1);setZoom(1);
    fetch(assetUrl(pattern.patternJson),{signal:controller.signal}).then(async r=>{
      if(!r.ok)throw Error('HTTP '+r.status+' untuk '+pattern.patternJson);
      const json=await r.json();if(json.modelId!==modelId)throw Error('Identitas pola tidak sesuai: '+json.modelId);
      setData(json);
    }).catch(e=>{if(!controller.signal.aborted)setError(String(e.message||e))})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return()=>controller.abort();
  },[modelId,pattern?.patternJson]);
  const qa=useMemo(()=>data?patternQA(data):[],[data]);
  const links=useMemo(()=>data?sewingRelationships(data):[],[data]);
  const active=links.find(l=>l.id===selected)||links[0];
  if(loading)return <div role="status" style={{padding:24,color:'#6c5a45'}}>Memuat pola jahit dan hubungan part…</div>;
  if(error||qa.length)return <div role="alert" style={{padding:24,color:'#8b2525'}}><b>Pola tidak dapat dirender</b><p>{error||qa.join('; ')}</p></div>;
  if(!data)return <div style={{padding:24}}>Data pola tidak tersedia.</div>;
  const width=data.patternPieces.reduce((max,p)=>Math.max(max,...p.flatGeometryMm.cutContour.map(q=>q[0]+p.sheetOffsetMm[0])),data.sheetWidthMm||1);
  const height=data.patternPieces.reduce((max,p)=>Math.max(max,...p.flatGeometryMm.cutContour.map(q=>q[1]+p.sheetOffsetMm[1])),data.sheetHeightMm||1);
  const sheetWidth=Math.max(width+45,pattern.sheetWidthMm||0,1),sheetHeight=Math.max(height+45,pattern.sheetHeightMm||0,1);
  const named=new Map(data.patternPieces.map(p=>[p.key,p]));
  const selectedPieces=new Set(active?.pieceKeys||[]);
  const allResolvable=links.filter(l=>!l.unresolved.length).length;
  const linkEnds=active?active.a.filter(x=>x.pieceKey).flatMap(a=>active.b.filter(x=>x.pieceKey&&x.pieceKey!==a.pieceKey).map(b=>[a.pieceKey,b.pieceKey])):[];

  return <div style={{position:'absolute',inset:0,display:'flex',minWidth:0,background:'#f8f4ed',color:'#30271e'}}>
    <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'12px 16px',background:'#fffaf3',borderBottom:'1px solid #e1d7c8',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
        <div><div style={{fontWeight:900,fontSize:14}}>Pola potong & peta pasangan jahitan — {data.name}</div><div style={{fontSize:11,color:'#806e5d',marginTop:3}}>{data.patternPieces.length} tipe part · {data.patternPieces.reduce((n,p)=>n+p.cutCount,0)} potongan · {links.length} relasi · {allResolvable} terhubung berdasarkan ID part</div></div>
        <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          <button style={mini} onClick={()=>setZoom(v=>Math.max(.6,Math.round((v-.3)*10)/10))}>−</button><b style={{fontSize:12}}>{Math.round(zoom*100)}%</b><button style={mini} onClick={()=>setZoom(v=>Math.min(3,Math.round((v+.3)*10)/10))}>+</button>
          <label style={{fontSize:11}}><input type="checkbox" checked={showCut} onChange={e=>setShowCut(e.target.checked)}/> Potong</label>
          <label style={{fontSize:11}}><input type="checkbox" checked={showStitch} onChange={e=>setShowStitch(e.target.checked)}/> Garis jahit</label>
        </div>
      </div>
      <div style={{overflow:'auto',flex:1,padding:16}}>
        <svg role="img" aria-label="Peta pola potong dengan part bernomor dan pasangan jahitan" viewBox={`0 0 ${sheetWidth} ${sheetHeight}`} width={Math.max(820,sheetWidth*.63)*zoom} height={Math.max(820,sheetWidth*.63)*zoom*sheetHeight/sheetWidth} style={{display:'block',background:'#fff',border:'1px solid #ddccb7',boxShadow:'0 12px 24px rgba(57,45,29,.08)'}}>
          <rect x="0" y="0" width={sheetWidth} height={sheetHeight} fill="#fffdf9"/>
          {data.patternPieces.map((p,i)=>{
            const isActive=selectedPieces.has(p.key),center=pieceCenter(p);
            return <g key={p.key} onClick={()=>{const link=links.find(l=>l.pieceKeys.includes(p.key));if(link)setSelected(link.id)}} style={{cursor:'pointer',opacity:active&&!isActive?.53:1}}>
              <path d={layoutPath(p.flatGeometryMm.cutContour,p.sheetOffsetMm)} fill={isActive?'#fce5c7':'#f0e9df'} fillOpacity=".8" stroke={showCut?'#8d4630':'none'} strokeWidth="3"/>
              {showStitch&&<path d={layoutPath(p.flatGeometryMm.stitchContour,p.sheetOffsetMm)} fill="none" stroke="#237c86" strokeWidth="2.5" strokeDasharray="10 7"/>}
              <circle cx={center[0]} cy={center[1]} r="16" fill={isActive?'#b15328':'#343d43'}/>
              <text x={center[0]} y={center[1]+6} textAnchor="middle" fill="#fff" fontSize="17" fontWeight="bold">{i+1}</text>
              <text x={center[0]} y={center[1]+36} textAnchor="middle" fill="#29221b" fontWeight="bold" fontSize="19" stroke="#fffdf9" strokeWidth="5" paintOrder="stroke">{p.key.replace(/_/g,' ')}</text>
              <text x={center[0]} y={center[1]+58} textAnchor="middle" fill="#615245" fontSize="15" stroke="#fffdf9" strokeWidth="4" paintOrder="stroke">CUT ×{p.cutCount} · SA {p.seamAllowanceMm??'?'}mm</text>
            </g>;
          })}
          {linkEnds.map(([a,b],i)=>{const from=pieceCenter(named.get(a)),to=pieceCenter(named.get(b));return <g key={i} pointerEvents="none"><line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke="#bd5529" strokeWidth="3.5" strokeDasharray="20 12"/><circle cx={from[0]} cy={from[1]} r="8" fill="#bd5529"/><circle cx={to[0]} cy={to[1]} r="8" fill="#bd5529"/><text x={(from[0]+to[0])/2} y={(from[1]+to[1])/2-12} fontSize="21" textAnchor="middle" fontWeight="bold" fill="#9d421a" stroke="white" strokeWidth="6" paintOrder="stroke">J{active.id}</text></g>})}
        </svg>
      </div>
      <div style={{padding:'9px 15px',fontSize:11,background:'#fff3e7',color:'#81522d',borderTop:'1px solid #ecd4bc'}}>Garis oranye menghubungkan <b>pusat part</b> sebagai diagram hubungan—BUKAN jalur jahitan fisik, tanda notch, atau bukti panjang seam cocok. Bentuk potong dan garis jahit dari file pola draft.</div>
    </div>
    <aside style={{width:292,flex:'none',display:'flex',flexDirection:'column',background:'#fffaf3',borderLeft:'1px solid #dccfbd',minHeight:0}}>
      <div style={{padding:'15px 12px 9px',borderBottom:'1px solid #e7dcca'}}><b style={{fontSize:13}}>Pasangan part & jahitan</b><p style={{fontSize:11,lineHeight:1.5,color:'#796556',margin:'6px 0 0'}}>Pilih relasi J1–J{links.length} untuk sorot part yang tersambung. Nomor part sesuai pola di kiri.</p></div>
      <div style={{padding:10,overflowY:'auto',flex:1}}>
        {links.map(link=><button type="button" key={link.id} onClick={()=>setSelected(link.id)} aria-pressed={selected===link.id} style={{width:'100%',textAlign:'left',display:'block',padding:'10px 11px',marginBottom:8,borderRadius:9,border:selected===link.id?'2px solid #a34e20':'1px solid #decfbd',background:selected===link.id?'#fff0db':'#fff',color:'#34281d',cursor:'pointer'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:800}}><span>J{String(link.id).padStart(2,'0')} · {link.method.replace(/_/g,' ')}</span><span style={{color:link.unresolved.length?'#ac4b24':'#667b67'}}>{link.unresolved.length?'⚠ ID?':'ID ✓'}</span></div>
          <div style={{fontSize:11,marginTop:5,overflowWrap:'anywhere'}}><b>A:</b> {link.aText}</div><div style={{fontSize:11,marginTop:2,overflowWrap:'anywhere'}}><b>B:</b> {link.bText}</div>
          {link.unresolved.length>0&&<div style={{fontSize:10,color:'#ac4b24',marginTop:5}}>Referensi tanpa part yang cocok: {link.unresolved.join(', ')}</div>}
        </button>)}
      </div>
      <div style={{fontSize:10,color:'#705b47',background:'#f5eadc',padding:12,borderTop:'1px solid #e4d3bd'}}>QA: {data.exportQA?.seamMatching||'NOT VALIDATED'} · Ukuran/fit: {data.exportQA?.physicalFit||'NOT TESTED'}. Sebelum produksi perlu edge ID nyata, notch, seam length, ease & grading.</div>
    </aside>
  </div>;
}
