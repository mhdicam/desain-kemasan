import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {APPAREL_SEWING_PATTERNS} from '../src/artwork/apparelSewingPatternData.js';
import {endpointRefs,layoutPath,patternQA,pieceCenter,sewingRelationships,measuredStitchPair} from '../src/artwork/apparelPatternPairing.js';
const all=Object.values(APPAREL_SEWING_PATTERNS);
function load(entry){const rel=entry.patternJson.replace(/^\//,'');const data=JSON.parse(readFileSync(new URL('../public/'+rel.replace(/^dielines-v2\//,'dielines-v2/'),import.meta.url),'utf8'));return data;}
test('all nine apparel drafts have traceable parts and sewing relationships',()=>{assert.equal(all.length,9);for(const entry of all){const p=load(entry);assert.deepEqual(patternQA(p),[],entry.id);const links=sewingRelationships(p);assert.equal(links.length,entry.sewingGraphLinks);assert.ok(links.every(l=>l.a.length&&l.b.length));for(const piece of p.patternPieces){assert.ok(layoutPath(piece.flatGeometryMm.cutContour,piece.sheetOffsetMm).endsWith(' Z'));assert.ok(pieceCenter(piece).every(Number.isFinite));}}});
test('compound shoulder references resolve to separate front and back parts',()=>{assert.deepEqual(endpointRefs('front+back.neckline',['front','back']).map(r=>[r.pieceKey,r.edge]),[['front','neckline'],['back','neckline']]);});
test('tote multi-segment edge reference uses the existing body piece',()=>{assert.deepEqual(endpointRefs('body.left+bottom+right',['body']).map(r=>[r.pieceKey,r.edge]),[['body','left'],['body','bottom'],['body','right']]);});
test('unresolved legacy cap aliases are not silently labeled valid',()=>{const cap=sewingRelationships(load(all.find(p=>p.id==='cap-mockup')));assert.ok(cap.some(l=>l.unresolved.length>0));});
test('hoodie relations reference known pattern part IDs',()=>{const links=sewingRelationships(load(all.find(p=>p.id==='hoodie-mockup')));assert.ok(links.every(l=>l.unresolved.length===0));});

test('T-shirt and Hoodie shoulders and side seams resolve to actual contour segments',()=>{
 for(const id of ['tshirt-front','hoodie-mockup']){
   const p=load(all.find(x=>x.id===id));
   const links=sewingRelationships(p);
   for(const edge of ['shoulder_L','shoulder_R','side_L','side_R']){
     const seam=links.find(l=>l.aText==='front.'+edge);
     assert.ok(seam,edge);
     const m=measuredStitchPair(p,seam);
     assert.ok(m,edge+' has no mapped source contour');
     assert.ok(m.a.lengthMm>20);
     assert.ok(m.geometricMatch,edge+' should match within 2 mm in source draft');
     assert.equal(m.physicalQA,'NOT_VALIDATED');
   }
   assert.equal(measuredStitchPair(p,links.find(l=>l.aText.startsWith('sleeve.'))),null);
 }
});
