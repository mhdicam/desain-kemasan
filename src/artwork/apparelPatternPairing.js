// Non-production seam relationship model derived from source pattern JSON.
// Piece-to-piece relationships are known; physical edge geometry and lengths are NOT.
export function endpointRefs(expression, pieceKeys) {
  const keys=new Set(pieceKeys);
  const parts=String(expression||'').split('+').map(s=>s.trim()).filter(Boolean);
  const result=[];let context=null;
  for(const part of parts){
    const dot=part.indexOf('.');
    const prefix=dot<0?part:part.slice(0,dot);
    if(keys.has(prefix)){
      context=prefix;
      result.push({pieceKey:prefix,edge:dot<0?'':part.slice(dot+1),inferred:false});
    }else if(dot<0&&context){
      result.push({pieceKey:context,edge:part,inferred:true});
    }else{
      result.push({pieceKey:null,edge:part,unresolved:true});
    }
  }
  // "front+back.neckline": the first piece inherits the common neckline label.
  if(result.length>1)for(const ref of result){
    if(ref.pieceKey&&!ref.edge){
      const following=result.find(x=>x.pieceKey&&x.edge);
      if(following){ref.edge=following.edge;ref.inferred=true;}
    }
  }
  return result;
}
export function sewingRelationships(pattern){
  const pieces=pattern?.patternPieces||[],keys=pieces.map(p=>p.key);
  return (pattern?.sewingGraph||[]).map((entry,index)=>{
    const a=endpointRefs(entry.a,keys),b=endpointRefs(entry.b,keys);
    const unresolved=[...a,...b].filter(ref=>!ref.pieceKey).map(ref=>ref.edge);
    const unique=[...new Set([...a,...b].map(ref=>ref.pieceKey).filter(Boolean))];
    return {id:index+1,aText:String(entry.a),bText:String(entry.b),
      method:entry.method||'not specified',a,b,pieceKeys:unique,unresolved,
      status:unresolved.length?'unresolved-reference':'relationship-only'};
  });
}
export function patternQA(pattern){
  const errors=[];if(!pattern||!Array.isArray(pattern.patternPieces)||!Array.isArray(pattern.sewingGraph))return ['Missing pattern or sewing graph'];
  const ids=new Set();
  for(const p of pattern.patternPieces){
    if(!p.key||ids.has(p.key))errors.push('Duplicate or missing piece key: '+p.key);
    ids.add(p.key);
    if(!Number.isInteger(p.cutCount)||p.cutCount<1)errors.push('Invalid cut quantity: '+p.key);
    for(const edgeType of ['cutContour','stitchContour']){
      const pts=p.flatGeometryMm?.[edgeType];
      if(!Array.isArray(pts)||pts.length<3||!pts.every(q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)))errors.push('Invalid '+edgeType+': '+p.key);
    }
    if(!Array.isArray(p.sheetOffsetMm)||p.sheetOffsetMm.length!==2||!p.sheetOffsetMm.every(Number.isFinite))errors.push('Invalid layout offset: '+p.key);
  }
  if(!pattern.sewingGraph.length)errors.push('Missing sewing relationships');
  return errors;
}
export function layoutPath(points,offset){
  if(!points?.length)return '';
  const [dx,dy]=offset||[0,0];
  return points.map((p,i)=>(i?'L':'M')+(p[0]+dx).toFixed(2)+' '+(p[1]+dy).toFixed(2)).join(' ')+' Z';
}
export function pieceCenter(p){
  const pts=p.flatGeometryMm?.stitchContour||[];
  if(!pts.length)return [0,0];
  const xs=pts.map(v=>v[0]),ys=pts.map(v=>v[1]);
  return [(Math.min(...xs)+Math.max(...xs))/2+(p.sheetOffsetMm?.[0]||0),
    (Math.min(...ys)+Math.max(...ys))/2+(p.sheetOffsetMm?.[1]||0)];
}
