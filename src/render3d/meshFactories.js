import { makePieces } from './fold.js';
import { allModels, modelDielineAudit } from '../dieline/templateCatalog.js';
import { IMPORTED_DIELINES } from '../dieline/importedDielines.js';

const r = v => Math.round(v * 10000) / 10000;
const v3 = (x, y, z) => [r(x), r(y), r(z)];
const uv4 = [[0,0],[1,0],[1,1],[0,1]];
const face = (name, verts, mat = 'paper', uv = uv4, meta = {}) => ({ name, verts: verts.map(p => p.map(r)), mat, uv, ...meta });

export const MESH_FACTORY_TYPES = {
  foldingCarton: 'folding-carton',
  corrugatedBox: 'corrugated-box',
  rigidBox: 'rigid-box',
  tube: 'tube',
  cup: 'cup',
  flexible: 'flexible-packaging',
  flatPrint: 'flat-print-product',
  apparel: 'apparel',
  device: 'device',
  display: 'display',
  custom: 'custom-asset'
};

export function meshStrategyForModel(modelOrId) {
  const id = typeof modelOrId === 'string' ? modelOrId : modelOrId?.id;
  const model = typeof modelOrId === 'string' ? allModels().find(m => m.id === id) : modelOrId;
  const cat = model?.category;
  const sub = model?.subCategory || model?.category;
  if (['shipping-box','mailer','pizza-box'].includes(id) || sub === 'ecommerce') return MESH_FACTORY_TYPES.corrugatedBox;
  if (['lidbase','drawer','sleeve-tray','book-box'].includes(id) || sub === 'rigid-set') return MESH_FACTORY_TYPES.rigidBox;
  if (['cyl','hex'].includes(id) || sub === 'tube-special') return MESH_FACTORY_TYPES.tube;
  if (['paper-cup-packaging','paper-cup','cup-sleeve','ice-cream-tub','fries-box','burger-clamshell','food-tray'].includes(id) || sub === 'food-service') return MESH_FACTORY_TYPES.cup;
  if (['standup-pouch','flat-sachet','pillow-pack','spout-pouch'].includes(id) || sub === 'pouch-flexible') return MESH_FACTORY_TYPES.flexible;
  if (cat === 'print-stationery' || ['bottle-label-packaging','belly-band','hangtag','sticker-label-roll','bottle-label'].includes(id)) return MESH_FACTORY_TYPES.flatPrint;
  if (['rte','ste','gable-box','window-carton','auto-lock-bottom','hanger-box','pillow-box'].includes(id) || sub === 'folding-carton') return MESH_FACTORY_TYPES.foldingCarton;
  if (cat === 'apparel') return MESH_FACTORY_TYPES.apparel;
  if (cat === 'device-gadget') return MESH_FACTORY_TYPES.device;
  if (cat === 'display-booth') return MESH_FACTORY_TYPES.display;
  if (cat === 'custom-model') return MESH_FACTORY_TYPES.custom;
  return MESH_FACTORY_TYPES.custom;
}

function boxShell(id, L, W, H, t, mat='paper') {
  const x0=-L/2, x1=L/2, y0=0, y1=H, z0=-W/2, z1=W/2;
  return [
    face('front', [v3(x0,y0,z1),v3(x1,y0,z1),v3(x1,y1,z1),v3(x0,y1,z1)], mat, uv4, { panelId:'front' }),
    face('back', [v3(x1,y0,z0),v3(x0,y0,z0),v3(x0,y1,z0),v3(x1,y1,z0)], mat, uv4, { panelId:'back' }),
    face('left', [v3(x0,y0,z0),v3(x0,y0,z1),v3(x0,y1,z1),v3(x0,y1,z0)], mat, uv4, { panelId:'left' }),
    face('right', [v3(x1,y0,z1),v3(x1,y0,z0),v3(x1,y1,z0),v3(x1,y1,z1)], mat, uv4, { panelId:'right' }),
    face('top', [v3(x0,y1,z1),v3(x1,y1,z1),v3(x1,y1,z0),v3(x0,y1,z0)], mat, uv4, { panelId:'top' }),
    face('bottom', [v3(x0,y0,z0),v3(x1,y0,z0),v3(x1,y0,z1),v3(x0,y0,z1)], mat, uv4, { panelId:'bottom' })
  ];
}

function addRteFlaps(faces, L, W, H, t, glue) {
  const x0=-L/2, x1=L/2, zf=W/2, zb=-W/2, flap=Math.max(W*0.92, W-t), tuck=Math.min(18, W*.55);
  faces.push(face('top-tuck-flap', [v3(x0,H,zf),v3(x1,H,zf),v3(x1,H+flap,zf),v3(x0,H+flap,zf)], 'paper', uv4, { hingeAxis:'x', foldDirection:'close', panelId:'top-flap' }));
  faces.push(face('top-tuck-lip', [v3(x0+tuck,H+flap,zf),v3(x1-tuck,H+flap,zf),v3(x1-tuck,H+flap+tuck,zf),v3(x0+tuck,H+flap+tuck,zf)], 'paper', uv4, { hingeAxis:'x', foldDirection:'lock', panelId:'top-tuck' }));
  faces.push(face('bottom-tuck-flap', [v3(x1,0,zb),v3(x0,0,zb),v3(x0,-flap,zb),v3(x1,-flap,zb)], 'paper', uv4, { hingeAxis:'x', foldDirection:'close', panelId:'bottom-flap' }));
  faces.push(face('glue-flap', [v3(x1,0,zb),v3(x1+glue,0,zb),v3(x1+glue,H,zb),v3(x1,H,zb)], 'glue', uv4, { hingeAxis:'y', foldDirection:'inside', panelId:'glue' }));
  return faces;
}

function addRscFlaps(faces, L, W, H) {
  const x0=-L/2, x1=L/2, z0=-W/2, z1=W/2, hf=W/2, sf=L/2;
  faces.push(face('top-major-front', [v3(x0,H,z1),v3(x1,H,z1),v3(x1,H,z1+hf),v3(x0,H,z1+hf)], 'corrugated', uv4, { hingeAxis:'x', foldDirection:'in', panelId:'top-major-front' }));
  faces.push(face('top-major-back', [v3(x1,H,z0),v3(x0,H,z0),v3(x0,H,z0-hf),v3(x1,H,z0-hf)], 'corrugated', uv4, { hingeAxis:'x', foldDirection:'in', panelId:'top-major-back' }));
  faces.push(face('top-minor-left', [v3(x0,H,z0),v3(x0,H,z1),v3(x0-sf,H,z1),v3(x0-sf,H,z0)], 'corrugated', uv4, { hingeAxis:'z', foldDirection:'in', panelId:'top-minor-left' }));
  faces.push(face('top-minor-right', [v3(x1,H,z1),v3(x1,H,z0),v3(x1+sf,H,z0),v3(x1+sf,H,z1)], 'corrugated', uv4, { hingeAxis:'z', foldDirection:'in', panelId:'top-minor-right' }));
  faces.push(face('bottom-major-front', [v3(x1,0,z1),v3(x0,0,z1),v3(x0,0,z1+hf),v3(x1,0,z1+hf)], 'corrugated', uv4, { hingeAxis:'x', foldDirection:'in', panelId:'bottom-major-front' }));
  faces.push(face('bottom-major-back', [v3(x0,0,z0),v3(x1,0,z0),v3(x1,0,z0-hf),v3(x0,0,z0-hf)], 'corrugated', uv4, { hingeAxis:'x', foldDirection:'in', panelId:'bottom-major-back' }));
  return faces;
}

function frustumFaces(id, topD, bottomD, H, t, seg=48) {
  const faces=[];
  for (let i=0;i<seg;i++) {
    const a0=2*Math.PI*i/seg, a1=2*Math.PI*(i+1)/seg;
    const xb0=Math.cos(a0)*bottomD/2, zb0=Math.sin(a0)*bottomD/2, xb1=Math.cos(a1)*bottomD/2, zb1=Math.sin(a1)*bottomD/2;
    const xt0=Math.cos(a0)*topD/2, zt0=Math.sin(a0)*topD/2, xt1=Math.cos(a1)*topD/2, zt1=Math.sin(a1)*topD/2;
    faces.push(face(`cup-wall-${i+1}`, [v3(xb0,0,zb0),v3(xb1,0,zb1),v3(xt1,H,zt1),v3(xt0,H,zt0)], 'paper-pe', [[i/seg,0],[(i+1)/seg,0],[(i+1)/seg,1],[i/seg,1]], { panelId:'cup-wrap' }));
  }
  const rimH=Math.max(2.5, t*4);
  faces.push(face('rolled-rim-band', [v3(-topD/2,H,0),v3(topD/2,H,0),v3(topD/2,H+rimH,0),v3(-topD/2,H+rimH,0)], 'rim', uv4, { component:'rim' }));
  return faces;
}

function flatSheet(id, Wd, Hd, t, mat='paper') {
  return [face('flat-print-surface', [v3(-Wd/2,0,t/2),v3(Wd/2,0,t/2),v3(Wd/2,Hd,t/2),v3(-Wd/2,Hd,t/2)], mat, uv4, { panelId:id })];
}


function shallowBox(id, L, W, H, t, mat='paper') {
  const faces = boxShell(id, L, W, H, t, mat).filter(f => f.panelId !== 'top');
  faces.push(face('open-rim-front', [v3(-L/2,H,W/2),v3(L/2,H,W/2),v3(L/2,H+t*2,W/2),v3(-L/2,H+t*2,W/2)], mat, uv4, { panelId:'rim-front', component:'rim' }));
  faces.push(face('open-rim-back', [v3(L/2,H,-W/2),v3(-L/2,H,-W/2),v3(-L/2,H+t*2,-W/2),v3(L/2,H+t*2,-W/2)], mat, uv4, { panelId:'rim-back', component:'rim' }));
  return faces;
}

function gableCarton(L, W, H, t, glue, id='gable-box') {
  const bodyH = H * 0.78, roofH = Math.max(14, H * 0.22), x0=-L/2, x1=L/2, z0=-W/2, z1=W/2;
  const faces = boxShell(id, L, W, bodyH, t).filter(f => f.panelId !== 'top');
  faces.push(face('gable-roof-front-left', [v3(x0,bodyH,z1),v3(0,bodyH+roofH,z1),v3(0,bodyH+roofH,0),v3(x0,bodyH,0)], 'paper', uv4, { panelId:'roof-front-left', hingeAxis:'x', foldDirection:'close' }));
  faces.push(face('gable-roof-front-right', [v3(0,bodyH+roofH,z1),v3(x1,bodyH,z1),v3(x1,bodyH,0),v3(0,bodyH+roofH,0)], 'paper', uv4, { panelId:'roof-front-right', hingeAxis:'x', foldDirection:'close' }));
  faces.push(face('gable-roof-back-left', [v3(0,bodyH+roofH,z0),v3(x0,bodyH,z0),v3(x0,bodyH,0),v3(0,bodyH+roofH,0)], 'paper', uv4, { panelId:'roof-back-left', hingeAxis:'x', foldDirection:'close' }));
  faces.push(face('gable-roof-back-right', [v3(x1,bodyH,z0),v3(0,bodyH+roofH,z0),v3(0,bodyH+roofH,0),v3(x1,bodyH,0)], 'paper', uv4, { panelId:'roof-back-right', hingeAxis:'x', foldDirection:'close' }));
  faces.push(face('gable-top-seal', [v3(-L*.18,bodyH+roofH,-t),v3(L*.18,bodyH+roofH,-t),v3(L*.18,bodyH+roofH+t*4,t),v3(-L*.18,bodyH+roofH+t*4,t)], 'paper', uv4, { panelId:'top-seal', component:'closure' }));
  faces.push(face('glue-flap', [v3(x1,0,z0),v3(x1+glue,0,z0),v3(x1+glue,bodyH,z0),v3(x1,bodyH,z0)], 'glue', uv4, { panelId:'glue', hingeAxis:'y' }));
  return faces;
}

function windowCarton(L, W, H, t, glue) {
  const faces = addRteFlaps(boxShell('window-carton', L, W, H, t), L, W, H, t, glue);
  faces.push(face('die-cut-window-opening', [v3(-L*.22,H*.42,W/2+t),v3(L*.22,H*.42,W/2+t),v3(L*.22,H*.72,W/2+t),v3(-L*.22,H*.72,W/2+t)], 'screen', uv4, { panelId:'window-hole', component:'opening', opening:true }));
  return faces;
}

function autoLockCarton(L, W, H, t, glue) {
  const faces = addRteFlaps(boxShell('auto-lock-bottom', L, W, H, t), L, W, H, t, glue);
  faces.push(face('auto-lock-bottom-tab-a', [v3(-L/2,0,W/2),v3(0,0,W/2),v3(0,-W*.55,0),v3(-L/2,-W*.55,0)], 'paper', uv4, { panelId:'lock-a', component:'closure', hingeAxis:'x' }));
  faces.push(face('auto-lock-bottom-tab-b', [v3(0,0,-W/2),v3(L/2,0,-W/2),v3(L/2,-W*.55,0),v3(0,-W*.55,0)], 'paper', uv4, { panelId:'lock-b', component:'closure', hingeAxis:'x' }));
  return faces;
}

function pillowCarton(L, W, H, t, id='pillow-box') {
  const seg = 12, faces=[];
  for (let i=0;i<seg;i++) {
    const a0=-Math.PI/2 + Math.PI*i/seg, a1=-Math.PI/2 + Math.PI*(i+1)/seg;
    const x0=Math.cos(a0)*L/2, z0=Math.sin(a0)*W/2, x1=Math.cos(a1)*L/2, z1=Math.sin(a1)*W/2;
    faces.push(face(`pillow-curved-body-${i+1}`, [v3(x0,0,z0),v3(x1,0,z1),v3(x1,H,z1),v3(x0,H,z0)], 'paper', [[i/seg,0],[(i+1)/seg,0],[(i+1)/seg,1],[i/seg,1]], { panelId:'pillow-body' }));
  }
  faces.push(face('left-crimp-closure', [v3(-L/2,0,0),v3(-L/2,H,0),v3(-L/2,H,W*.35),v3(-L/2,0,W*.35)], 'paper', uv4, { panelId:'left-crimp', component:'closure' }));
  faces.push(face('right-crimp-closure', [v3(L/2,0,0),v3(L/2,0,W*.35),v3(L/2,H,W*.35),v3(L/2,H,0)], 'paper', uv4, { panelId:'right-crimp', component:'closure' }));
  return faces;
}

function pizzaMailerBox(L, W, H, t, id='pizza-box') {
  const faces = shallowBox(id, L, W, Math.max(8,H), t, 'corrugated');
  faces.push(face(`${id}-hinged-lid`, [v3(-L/2,H,-W/2),v3(L/2,H,-W/2),v3(L/2,H,-W*1.45),v3(-L/2,H,-W*1.45)], 'corrugated', uv4, { panelId:'lid', role:'hero', hingeAxis:'x', foldDirection:'close' }));
  faces.push(face(`${id}-front-lock-flap`, [v3(L/2,H,W/2),v3(-L/2,H,W/2),v3(-L/2,H+Math.min(24,H),W*.85),v3(L/2,H+Math.min(24,H),W*.85)], 'corrugated', uv4, { panelId:'front-lock', component:'closure' }));
  return faces;
}

function trayWithSleeve(L, W, H, t) {
  const faces = shallowBox('sleeve-tray-tray', L, W, H, t, 'rigid');
  const o=L*.72;
  faces.push(...boxShell('sleeve', L+4*t, W+4*t, H+2*t, t, 'paper').map(f => ({ ...f, name:`sleeve-${f.name}`, verts:f.verts.map(p=>v3(p[0]+o,p[1],p[2])) })));
  return faces;
}

function lidBaseMesh(L, W, H, t, id='lidbase') {
  const faces = shallowBox(`${id}-base`, L, W, H, t, 'rigid');
  const lidH=Math.max(14,H*.45), o=L*.75;
  faces.push(...shallowBox(`${id}-lid`, L+2*t+1, W+2*t+1, lidH, t, 'rigid').map(f => ({ ...f, name:`lid-${f.name}`, verts:f.verts.map(p=>v3(p[0]+o,p[1]+H+lidH*.2,p[2])) })));
  return faces;
}

function tubeMesh(L, W, H, t, sides=24) {
  const faces=[], R=sides===24?Math.max(18,L/2):Math.max(18,W*1.05);
  for (let i=0;i<sides;i++) {
    const a0=2*Math.PI*i/sides, a1=2*Math.PI*(i+1)/sides;
    faces.push(face(`tube-wall-${i+1}`, [v3(Math.cos(a0)*R,0,Math.sin(a0)*R),v3(Math.cos(a1)*R,0,Math.sin(a1)*R),v3(Math.cos(a1)*R,H,Math.sin(a1)*R),v3(Math.cos(a0)*R,H,Math.sin(a0)*R)], 'paper', [[i/sides,0],[(i+1)/sides,0],[(i+1)/sides,1],[i/sides,1]], { panelId:`tube-wall-${i+1}` }));
  }
  faces.push(face('top-disc-lid', Array.from({length:sides},(_,i)=>v3(Math.cos(2*Math.PI*i/sides)*R,H,Math.sin(2*Math.PI*i/sides)*R)), 'paper', Array.from({length:sides},(_,i)=>[.5+.5*Math.cos(2*Math.PI*i/sides),.5+.5*Math.sin(2*Math.PI*i/sides)]), { panelId:'top-disc', component:'closure' }));
  faces.push(face('bottom-disc', Array.from({length:sides},(_,i)=>v3(Math.cos(2*Math.PI*(sides-1-i)/sides)*R,0,Math.sin(2*Math.PI*(sides-1-i)/sides)*R)), 'paper', Array.from({length:sides},(_,i)=>[.5+.5*Math.cos(2*Math.PI*i/sides),.5+.5*Math.sin(2*Math.PI*i/sides)]), { panelId:'bottom-disc', component:'closure' }));
  return faces;
}

function friesTray(L, W, H, t) {
  const topL=L*1.18, topW=W*1.25, x0=-L/2,x1=L/2,z0=-W/2,z1=W/2, X0=-topL/2,X1=topL/2,Z0=-topW/2,Z1=topW/2;
  return [
    face('fries-bottom',[v3(x0,0,z0),v3(x1,0,z0),v3(x1,0,z1),v3(x0,0,z1)],'paper',uv4,{panelId:'bottom'}),
    face('fries-front',[v3(x0,0,z1),v3(x1,0,z1),v3(X1,H,Z1),v3(X0,H,Z1)],'paper',uv4,{panelId:'front',role:'hero'}),
    face('fries-back',[v3(x1,0,z0),v3(x0,0,z0),v3(X0,H*1.12,Z0),v3(X1,H*1.12,Z0)],'paper',uv4,{panelId:'back'}),
    face('fries-left',[v3(x0,0,z0),v3(x0,0,z1),v3(X0,H,Z1),v3(X0,H*1.12,Z0)],'paper',uv4,{panelId:'left'}),
    face('fries-right',[v3(x1,0,z1),v3(x1,0,z0),v3(X1,H*1.12,Z0),v3(X1,H,Z1)],'paper',uv4,{panelId:'right'})
  ];
}

function clamshell(L, W, H, t) {
  const low=shallowBox('clamshell-bottom', L, W, H*.45, t, 'paper');
  const lid=shallowBox('clamshell-lid', L, W, H*.35, t, 'paper').map(f => ({ ...f, name:`lid-${f.name}`, verts:f.verts.map(p=>v3(p[0],p[1]+H*.48,p[2]-W*.85)) }));
  low.push(...lid);
  low.push(face('living-hinge', [v3(-L/2,H*.45,-W/2),v3(L/2,H*.45,-W/2),v3(L/2,H*.52,-W*.85),v3(-L/2,H*.52,-W*.85)], 'paper', uv4, { panelId:'hinge', component:'closure', hingeAxis:'x' }));
  return low;
}

function pouchMesh(id, L, W, H, t) {
  const bulge=Math.max(4,W*.18), seal=Math.max(5,t*8), faces=[];
  faces.push(face('pouch-front',[v3(-L/2,0,bulge),v3(L/2,0,bulge),v3(L/2,H,bulge),v3(-L/2,H,bulge)],'film',uv4,{panelId:'front',role:'hero'}));
  faces.push(face('pouch-back',[v3(L/2,0,-bulge),v3(-L/2,0,-bulge),v3(-L/2,H,-bulge),v3(L/2,H,-bulge)],'film',uv4,{panelId:'back'}));
  faces.push(face('left-gusset',[v3(-L/2,0,-bulge),v3(-L/2,0,bulge),v3(-L/2,H,bulge),v3(-L/2,H,-bulge)],'film',uv4,{panelId:'left-gusset'}));
  faces.push(face('right-gusset',[v3(L/2,0,bulge),v3(L/2,0,-bulge),v3(L/2,H,-bulge),v3(L/2,H,bulge)],'film',uv4,{panelId:'right-gusset'}));
  faces.push(face('top-seal',[v3(-L/2,H,bulge),v3(L/2,H,bulge),v3(L/2,H+seal,0),v3(-L/2,H+seal,0)],'seal',uv4,{panelId:'top-seal',component:'closure'}));
  faces.push(face('bottom-seal',[v3(L/2,0,bulge),v3(-L/2,0,bulge),v3(-L/2,-seal,0),v3(L/2,-seal,0)],'seal',uv4,{panelId:'bottom-seal',component:'closure'}));
  if (id === 'spout-pouch') faces.push(face('spout-neck',[v3(L*.22,H+seal,0),v3(L*.38,H+seal,0),v3(L*.35,H+seal+18,0),v3(L*.25,H+seal+18,0)],'rim',uv4,{panelId:'spout',component:'closure'}));
  return faces;
}

function mockupPhone(L, W, H, t) {
  const bezelW = Math.max(6, L*.08), bezelH = Math.max(4, W*.05);
  return [face('phone-back', [v3(-L/2,-H/2,-W/2), v3(L/2,-H/2,-W/2), v3(L/2,-H/2,W/2), v3(-L/2,-H/2,W/2)], 'metal', uv4, { panelId:'back' }), face('phone-screen', [v3(-L/2+bezelW,-H/2+t,W/2-bezelH), v3(L/2-bezelW,-H/2+t,W/2-bezelH), v3(L/2-bezelW,-H/2+t,-W/2+bezelH), v3(-L/2+bezelW,-H/2+t,-W/2+bezelH)], 'glass', uv4, { panelId:'screen', artworkComponent:true }), face('phone-sides', [v3(-L/2,-H/2,W/2), v3(L/2,-H/2,W/2), v3(L/2,H/2,W/2), v3(-L/2,H/2,W/2)], 'metal', uv4, { panelId:'bezel' })];
}
function mockupLaptop(L, W, H, t) {
  const baseH = H*.08;
  return [face('laptop-screen', [v3(-L/2*.9,H-baseH,-W/2*.5), v3(L/2*.9,H-baseH,-W/2*.5), v3(L/2*.9,H,-W/2*.5), v3(-L/2*.9,H,-W/2*.5)], 'glass', uv4, { panelId:'screen', artworkComponent:true }), face('laptop-keyboard', [v3(-L/2,0,-W/2), v3(L/2,0,-W/2), v3(L/2,baseH,-W/2), v3(-L/2,baseH,-W/2)], 'plastic', uv4, { panelId:'keyboard' }), face('laptop-base', [v3(-L/2,0,W/2), v3(L/2,0,W/2), v3(L/2,baseH,W/2), v3(-L/2,baseH,W/2)], 'metal', uv4, { panelId:'base' })];
}
function mockupTablet(L, W, H, t) {
  const bezel = Math.max(3, Math.min(L, W)*.06);
  return [face('tablet-screen', [v3(-L/2+bezel,-W/2+bezel,0), v3(L/2-bezel,-W/2+bezel,0), v3(L/2-bezel,W/2-bezel,0), v3(-L/2+bezel,W/2-bezel,0)], 'glass', uv4, { panelId:'screen', artworkComponent:true }), face('tablet-frame', [v3(-L/2,-W/2,0), v3(L/2,-W/2,0), v3(L/2,W/2,0), v3(-L/2,W/2,0)], 'aluminum', uv4, { panelId:'frame' }), face('tablet-back', [v3(-L/2,-W/2,-t), v3(L/2,-W/2,-t), v3(L/2,W/2,-t), v3(-L/2,W/2,-t)], 'plastic', uv4, { panelId:'back' })];
}
function mockupTshirt(L, W, H, t) {
  const neckW = L*.35;
  return [face('tshirt-front', [v3(-L/2,0,W/2), v3(L/2,0,W/2), v3(L/2,H,W/2), v3(-L/2,H,W/2)], 'fabric', uv4, { panelId:'front', artworkComponent:true }), face('tshirt-back', [v3(L/2,0,-W/2), v3(-L/2,0,-W/2), v3(-L/2,H,-W/2), v3(L/2,H,-W/2)], 'fabric', uv4, { panelId:'back' }), face('tshirt-sleeves', [v3(-L/2-L*.2,H*.5,W/2), v3(-L/2,H*.5,W/2), v3(-L/2,H*.8,W/2), v3(-L/2-L*.2,H*.8,W/2)], 'fabric', uv4, { panelId:'sleeves' })];
}
function mockupHoodie(L, W, H, t) {
  const tshirt = mockupTshirt(L, W, H, t);
  tshirt.push(face('hoodie-pocket', [v3(-L*.22,H*.35,W/2), v3(L*.22,H*.35,W/2), v3(L*.22,H*.6,W/2), v3(-L*.22,H*.6,W/2)], 'fabric', uv4, { panelId:'pocket' }));
  return tshirt;
}
function mockupToteBag(L, W, H, t) {
  const handleW = L*.2, handleH = H*.8;
  return [face('tote-front', [v3(-L/2,0,W/2), v3(L/2,0,W/2), v3(L/2,H,W/2), v3(-L/2,H,W/2)], 'canvas', uv4, { panelId:'front', artworkComponent:true }), face('tote-back', [v3(L/2,0,-W/2), v3(-L/2,0,-W/2), v3(-L/2,H,-W/2), v3(L/2,H,-W/2)], 'canvas', uv4, { panelId:'back' }), face('tote-sides', [v3(-L/2,0,-W/2), v3(-L/2,H,-W/2), v3(-L/2,H,W/2), v3(-L/2,0,W/2)], 'canvas', uv4, { panelId:'side' }), face('tote-handle', [v3(-handleW/2,H,W/2), v3(-handleW/2,H+handleH,W/2), v3(-handleW/2,H+handleH,-W*.45), v3(-handleW/2,H,-W*.45)], 'canvas', uv4, { panelId:'handle' })];
}
function mockupCylindricalWrap(id, L, W, H, t, sides=48) {
  const R = W / (2 * Math.PI), faces=[];
  for (let i = 0; i < sides; i++) {
    const a0 = 2*Math.PI*i/sides, a1 = 2*Math.PI*(i+1)/sides;
    faces.push(face(`${id}-band-${i}`, [v3(Math.cos(a0)*R,0,Math.sin(a0)*R), v3(Math.cos(a1)*R,0,Math.sin(a1)*R), v3(Math.cos(a1)*R,H,Math.sin(a1)*R), v3(Math.cos(a0)*R,H,Math.sin(a0)*R)], 'paper', [[i/sides,0],[(i+1)/sides,0],[(i+1)/sides,1],[i/sides,1]], { panelId:`band-${i}`, artworkComponent:i < 3 }));
  }
  faces.push(face(`${id}-bottom`, Array.from({length:sides},(_,i)=>v3(Math.cos(2*Math.PI*i/sides)*R,0,Math.sin(2*Math.PI*i/sides)*R)), 'paper', Array.from({length:sides},(_,i)=>[.5+.5*Math.cos(2*Math.PI*i/sides),.5+.5*Math.sin(2*Math.PI*i/sides)]), { panelId:'bottom' }));
  faces.push(face(`${id}-top`, Array.from({length:sides},(_,i)=>v3(Math.cos(2*Math.PI*(sides-1-i)/sides)*R,H,Math.sin(2*Math.PI*(sides-1-i)/sides)*R)), 'paper', Array.from({length:sides},(_,i)=>[.5+.5*Math.cos(2*Math.PI*i/sides),.5+.5*Math.sin(2*Math.PI*i/sides)]), { panelId:'top' }));
  return faces;
}
function mockupBanner(L, W, H, t) {
  return [face('banner-fabric', [v3(0,12,0), v3(L,12,0), v3(L,H-12,0), v3(0,H-12,0)], 'vinyl', uv4, { panelId:'fabric', artworkComponent:true }), face('banner-roller', [v3(0,H-12,0), v3(L,H-12,0), v3(L,H,6), v3(0,H,6)], 'metal', uv4, { panelId:'roller' }), face('banner-pole', [v3(0,12,0), v3(2,12,0), v3(2,H-12,0), v3(0,H-12,0)], 'aluminum', uv4, { panelId:'pole' })];
}
function mockupSignageBoard(L, W, H, t) {
  const f = Math.max(4, Math.min(L, W)*.04);
  return [face('signage-front', [v3(f,-f,f), v3(L-f,-f,f), v3(L-f,H+f,f), v3(f,H+f,f)], 'acrylic', uv4, { panelId:'face', artworkComponent:true }), face('signage-frame', [v3(0,-f,0), v3(L,-f,0), v3(L,H+f,f), v3(0,H+f,f)], 'aluminum', uv4, { panelId:'frame' })];
}
function mockupStickerSheet(L, W, H, t) {
  return [face('sticker-top', [v3(0,0,0), v3(L,0,0), v3(L,W,0), v3(0,W,0)], 'vinyl', uv4, { panelId:'face', artworkComponent:true }), face('sticker-back', [v3(0,0,-t), v3(L,0,-t), v3(L,W,-t), v3(0,W,-t)], 'adhesive', uv4, { panelId:'backing' })];
}
function mockupBottleLabel(L, W, H, t, sides=64) {
  const R = W / (2*Math.PI), faces=[];
  for (let i = 0; i < sides; i++) {
    const a0 = 2*Math.PI*i/sides, a1 = 2*Math.PI*(i+1)/sides;
    faces.push(face(`label-band-${i}`, [v3(Math.cos(a0)*R,H*.2,Math.sin(a0)*R), v3(Math.cos(a1)*R,H*.2,Math.sin(a1)*R), v3(Math.cos(a1)*R,H*.8,Math.sin(a1)*R), v3(Math.cos(a0)*R,H*.8,Math.sin(a0)*R)], 'paper', [[i/sides,0],[(i+1)/sides,0],[(i+1)/sides,1],[i/sides,1]], { panelId:`band-${i}`, artworkComponent:true }));
  }
  return faces;
}
function mockupCap(L, W, H, t) {
  return [face('cap-front', [v3(-L/2,0,W/2), v3(L/2,0,W/2), v3(L/2,H,W/2), v3(-L/2,H,W/2)], 'fabric', uv4, { panelId:'front', artworkComponent:true }), face('cap-side', [v3(L/2,0,W/2), v3(L/2,0,-W/2), v3(L/2,H*.6,-W/2), v3(L/2,H*.6,W/2)], 'fabric', uv4, { panelId:'side' }), face('cap-visor', [v3(-L*.4,0,W/2), v3(L*.4,0,W/2), v3(L*.35,H*.15,W/2+H*.2), v3(-L*.35,H*.15,W/2+H*.2)], 'plastic', uv4, { panelId:'visor' })];
}
function mockupJersey(L, W, H, t) {
  return [face('jersey-front', [v3(-L/2,0,W/2), v3(L/2,0,W/2), v3(L/2,H,W/2), v3(-L/2,H,W/2)], 'mesh', uv4, { panelId:'front', artworkComponent:true }), face('jersey-back', [v3(L/2,0,-W/2), v3(-L/2,0,-W/2), v3(-L/2,H,-W/2), v3(L/2,H,-W/2)], 'mesh', uv4, { panelId:'back' }), face('jersey-sleeves', [v3(-L/2-L*.3,H*.4,W/2), v3(-L/2,H*.4,W/2), v3(-L/2,H*.7,W/2), v3(-L/2-L*.3,H*.7,W/2)], 'mesh', uv4, { panelId:'sleeves' })];
}
function mockupApron(L, W, H, t) {
  return [face('apron-front', [v3(-L/2,0,W/2), v3(L/2,0,W/2), v3(L/2,H,W/2), v3(-L/2,H,W/2)], 'fabric', uv4, { panelId:'front', artworkComponent:true }), face('apron-pocket', [v3(-L*.25,H*.4,W/2), v3(L*.25,H*.4,W/2), v3(L*.25,H*.65,W/2), v3(-L*.25,H*.65,W/2)], 'fabric', uv4, { panelId:'pocket' }), face('apron-strap', [v3(-4,H+t,W/2), v3(4,H+t,W/2), v3(4,H+H*.15,W/2), v3(-4,H+H*.15,W/2)], 'webbing', uv4, { panelId:'strap' })];
}
function mockupPoloShirt(L, W, H, t) {
  return [face('polo-front', [v3(-L/2,0,W/2), v3(L/2,0,W/2), v3(L/2,H,W/2), v3(-L/2,H,W/2)], 'cotton-pique', uv4, { panelId:'front', artworkComponent:true }), face('polo-back', [v3(L/2,0,-W/2), v3(-L/2,0,-W/2), v3(-L/2,H,-W/2), v3(L/2,H,-W/2)], 'cotton-pique', uv4, { panelId:'back' }), face('polo-collar', [v3(-L*.2,H*.08,W/2), v3(L*.2,H*.08,W/2), v3(L*.2,H*.16,W/2+H*.12), v3(-L*.2,H*.16,W/2+H*.12)], 'cotton-pique', uv4, { panelId:'collar' })];
}
function mockupCrewneck(L, W, H, t) {
  return [face('sweater-front', [v3(-L/2,0,W/2), v3(L/2,0,W/2), v3(L/2,H,W/2), v3(-L/2,H,W/2)], 'knit', uv4, { panelId:'front', artworkComponent:true }), face('sweater-back', [v3(L/2,0,-W/2), v3(-L/2,0,-W/2), v3(-L/2,H,-W/2), v3(L/2,H,-W/2)], 'knit', uv4, { panelId:'back' }), face('sweater-neck', [v3(-L*.15,H*.1,W/2), v3(L*.15,H*.1,W/2), v3(L*.15,H*.2,W/2+H*.1), v3(-L*.15,H*.2,W/2+H*.1)], 'knit', uv4, { panelId:'neckline' })];
}
function mockupLanyard(L, W, H, t) {
  return [face('lanyard-band', [v3(-L/2,0,0), v3(L/2,0,0), v3(L/2,H,0), v3(-L/2,H,0)], 'nylon', uv4, { panelId:'band', artworkComponent:true }), face('lanyard-back', [v3(-L/2,0,-t), v3(L/2,0,-t), v3(L/2,H,-t), v3(-L/2,H,-t)], 'nylon', uv4, { panelId:'back' }), face('lanyard-clip', [v3(L*.3,H-10,-t), v3(L*.4,H-10,-t), v3(L*.4,H,-t), v3(L*.3,H,-t)], 'plastic', uv4, { panelId:'clip' })];
}
function mockupBottle(L, W, H, t) {
  const R = L / 2, sides = 32;
  const faces = [];
  for (let i = 0; i < sides; i++) {
    const a0 = 2*Math.PI*i/sides, a1 = 2*Math.PI*(i+1)/sides;
    faces.push(face(`bottle-body-${i}`, [v3(Math.cos(a0)*R,H*.15,Math.sin(a0)*R), v3(Math.cos(a1)*R,H*.15,Math.sin(a1)*R), v3(Math.cos(a1)*R,H*.95,Math.sin(a1)*R), v3(Math.cos(a0)*R,H*.95,Math.sin(a0)*R)], 'glass', [[i/sides,0],[(i+1)/sides,0],[(i+1)/sides,1],[i/sides,1]], { panelId:`body-${i}`, artworkComponent:i < sides/4 }));
  }
  faces.push(face('bottle-neck', [v3(-R*.35,H*.95,-R*.35), v3(R*.35,H*.95,-R*.35), v3(R*.3,H+H*.15,-R*.3), v3(-R*.3,H+H*.15,-R*.3)], 'glass', uv4, { panelId:'neck' }));
  return faces;
}
function mockupKeychain(L, W, H, t) {
  const R = Math.min(L, W) / 3;
  return [face('keychain-tag', [v3(-L/2,0,0), v3(L/2,0,0), v3(L/2,W,0), v3(-L/2,W,0)], 'metal', uv4, { panelId:'front', artworkComponent:true }), face('keychain-back', [v3(-L/2,0,-t), v3(L/2,0,-t), v3(L/2,W,-t), v3(-L/2,W,-t)], 'metal', uv4, { panelId:'back' }), face('keychain-ring', [v3(L*.35,W+t,-R), v3(L*.35+R*.8,W+t,-R), v3(L*.35+R*.8,W+t+R,.5), v3(L*.35,W+t+R,.5)], 'steel', uv4, { panelId:'ring' })];
}
function mockupNotebookCover(L, W, H, t) {
  const spineW = 8;
  return [face('cover-front', [v3(0,0,0), v3(L-spineW,0,0), v3(L-spineW,W,0), v3(0,W,0)], 'cardboard', uv4, { panelId:'front', artworkComponent:true }), face('cover-spine', [v3(L-spineW,0,-t), v3(L,0,-t), v3(L,W,-t), v3(L-spineW,W,-t)], 'cardboard', uv4, { panelId:'spine' }), face('cover-back', [v3(L,0,0), v3(L+L,0,0), v3(L+L,W,0), v3(L,W,0)], 'cardboard', uv4, { panelId:'back' })];
}
function mockupMousepad(L, W, H, t) {
  return [face('mousepad-top', [v3(0,0,0), v3(L,0,0), v3(L,W,0), v3(0,W,0)], 'rubber', uv4, { panelId:'top', artworkComponent:true }), face('mousepad-bottom', [v3(0,0,-t), v3(L,0,-t), v3(L,W,-t), v3(0,W,-t)], 'rubber', uv4, { panelId:'bottom' }), face('mousepad-edge', [v3(0,0,-t), v3(L,0,-t), v3(L,0,0), v3(0,0,0)], 'rubber', uv4, { panelId:'edge' })];
}
function mockupPinButton(L, W, H, t) {
  const R = Math.max(L, W) / 2;
  return [face('pin-front', Array.from({length:16},(_,i)=>v3(Math.cos(2*Math.PI*i/16)*R,0,Math.sin(2*Math.PI*i/16)*R)), 'metal', Array.from({length:16},(_,i)=>[.5+.5*Math.cos(2*Math.PI*i/16),.5+.5*Math.sin(2*Math.PI*i/16)]), { panelId:'face', artworkComponent:true }), face('pin-back', Array.from({length:16},(_,i)=>v3(Math.cos(2*Math.PI*(16-1-i)/16)*R,H*.08,Math.sin(2*Math.PI*(16-1-i)/16)*R)), 'metal', Array.from({length:16},(_,i)=>[.5+.5*Math.cos(2*Math.PI*i/16),.5+.5*Math.sin(2*Math.PI*i/16)]), { panelId:'back' })];
}
function mockupLanyardCard(L, W, H, t) {
  return [face('id-front', [v3(0,0,0), v3(L,0,0), v3(L,W,0), v3(0,W,0)], 'plastic', uv4, { panelId:'front', artworkComponent:true }), face('id-back', [v3(0,0,-t), v3(L,0,-t), v3(L,W,-t), v3(0,W,-t)], 'plastic', uv4, { panelId:'back' }), face('id-punch', [v3(L*.1,W+t,0), v3(L*.1+8,W+t,0), v3(L*.1+8,W+t+H*.2,0), v3(L*.1,W+t+H*.2,0)], 'plastic', uv4, { panelId:'punch-hole' })];
}

function flatRollLabel(id, L, W, H, t, sides=64) {
  const R = W / (2*Math.PI), faces=[];
  for (let i = 0; i < sides; i++) {
    const a0 = 2*Math.PI*i/sides, a1 = 2*Math.PI*(i+1)/sides;
    faces.push(face(`${id}-band-${i}`, [v3(Math.cos(a0)*R,0,Math.sin(a0)*R), v3(Math.cos(a1)*R,0,Math.sin(a1)*R), v3(Math.cos(a1)*R,H,Math.sin(a1)*R), v3(Math.cos(a0)*R,H,Math.sin(a0)*R)], 'paper', [[i/sides,0],[(i+1)/sides,0],[(i+1)/sides,1],[i/sides,1]], { panelId:`band-${i}`, artworkComponent:i < sides/3 }));
  }
  faces.push(face(`${id}-bottom`, Array.from({length:sides},(_,i)=>v3(Math.cos(2*Math.PI*i/sides)*R,0,Math.sin(2*Math.PI*i/sides)*R)), 'paper', Array.from({length:sides},(_,i)=>[.5+.5*Math.cos(2*Math.PI*i/sides),.5+.5*Math.sin(2*Math.PI*i/sides)]), { panelId:'bottom' }));
  faces.push(face(`${id}-top`, Array.from({length:sides},(_,i)=>v3(Math.cos(2*Math.PI*(sides-1-i)/sides)*R,H,Math.sin(2*Math.PI*(sides-1-i)/sides)*R)), 'paper', Array.from({length:sides},(_,i)=>[.5+.5*Math.cos(2*Math.PI*i/sides),.5+.5*Math.sin(2*Math.PI*i/sides)]), { panelId:'top' }));
  return faces;
}

function flatFoldedBrochure(id, L, W, H, t) {
  const fold1 = L/3, fold2 = L*2/3;
  return [face(`${id}-panel-1`, [v3(0,0,0), v3(fold1,0,0), v3(fold1,W,0), v3(0,W,0)], 'paper', uv4, { panelId:'cover-back', artworkComponent:true }), face(`${id}-panel-2`, [v3(fold1,0,0), v3(fold2,0,0), v3(fold2,W,0), v3(fold1,W,0)], 'paper', uv4, { panelId:'inside-left', artworkComponent:true }), face(`${id}-panel-3`, [v3(fold2,0,0), v3(L,0,0), v3(L,W,0), v3(fold2,W,0)], 'paper', uv4, { panelId:'cover-front', artworkComponent:true }), face(`${id}-spine`, [v3(fold1,0,-t), v3(fold2,0,-t), v3(fold2,W,-t), v3(fold1,W,-t)], 'paper', uv4, { panelId:'spine-crease' }), face(`${id}-back`, [v3(0,0,-t), v3(L,0,-t), v3(L,W,-t), v3(0,W,-t)], 'paper', uv4, { panelId:'back' })];
}

function uploadPlaceholder(id, L, W, H, t) {
  const centerX = L/2, centerY = W/2;
  return [face('upload-front', [v3(0,0,0), v3(L,0,0), v3(L,W,0), v3(0,W,0)], 'placeholder', uv4, { panelId:'surface', role:'upload-prompt' }), face('upload-back', [v3(0,0,-t), v3(L,0,-t), v3(L,W,-t), v3(0,W,-t)], 'paper', uv4, { panelId:'back' }), face('upload-border-top', [v3(centerX*.2,centerY*.2,0), v3(centerX*1.8,centerY*.2,0), v3(centerX*1.8,centerY*.2,t), v3(centerX*.2,centerY*.2,t)], 'metal', uv4, { panelId:'border' })];
}

function flatMultiPanel(id, L, W, H, cols=2, rows=1, t=0.2) {
  const cw = L / cols, rh = W / rows, faces=[];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = c*cw, y0 = r*rh;
      faces.push(face(`${id}-panel-${r}-${c}`, [v3(x0,y0,0), v3(x0+cw,y0,0), v3(x0+cw,y0+rh,0), v3(x0,y0+rh,0)], 'paper', uv4, { panelId:`panel-${r}-${c}`, artworkComponent:true }));
    }
  }
  faces.push(face(`${id}-back`, [v3(0,0,-t), v3(L,0,-t), v3(L,W,-t), v3(0,W,-t)], 'paper', uv4, { panelId:'back' }));
  return faces;
}

function panelGraphFromPieces(tpl, L, W, H, t, glue) {
  let pieces=[];
  try { pieces = makePieces(tpl, L, W, H, t, glue); } catch (_) { pieces = []; }
  const nodes=[]; const edges=[];
  const walk=(node, parent=null, depth=0, order=0) => {
    const id=node.panelId || `${parent || 'root'}-${node.edge || 'panel'}-${order}`;
    nodes.push({ id, parent, depth, uv: node.uv || null, hingeEdge: node.edge || null, hingeAxis: node.edge ? (node.edge === 'far' || node.edge === 'near' ? 'x' : 'y') : null, foldAngle: node.angle == null ? 90 : node.angle, foldDirection: node.attach || 'auto', shape: node.shape || 'rect', role: node.role || 'component' });
    if (parent) edges.push({ from: parent, to: id, hingeEdge: node.edge, hingeAxis: node.edge === 'far' || node.edge === 'near' ? 'x' : 'y', assemblyOrder: depth });
    (node.kids || []).forEach((k,i)=>walk(k,id,depth+1,i));
  };
  pieces.forEach((p,i)=>walk(p.tree, `component-${i+1}`, 0, i));
  return { nodes, edges, components: pieces.map((p,i)=>({ id:`component-${i+1}`, sign:p.sign, assembly:p.asm || null, offset:p.off || [0,0] })) };
}

export function buildMeshByFactory({ tpl='rte', L=80, W=40, H=120, t=0.45, glue=14, quality='medium' } = {}) {
  const model = allModels().find(m => m.id === tpl) || { id: tpl, category:'custom-model' };
  const strategy = meshStrategyForModel(model);
  const mesh = { id: tpl, factory: strategy, units:'millimeter', scale:[r(L),r(W),r(H)], thickness:t, glue, faces:[], features:[], panelGraph: panelGraphFromPieces(tpl, L, W, H, t, glue), sourceGeometry: IMPORTED_DIELINES[tpl]?.sourceSvg || null, unsupported:false, validationNotes:[] };
  if (tpl === 'rte' || tpl === 'ste') {
    mesh.faces = addRteFlaps(boxShell(tpl, L, W, H, t), L, W, H, t, glue);
    mesh.features.push({ id:'folding-carton-native', label:'Folding carton with tuck flaps and glue flap', foldAnimation:true });
  } else if (tpl === 'gable-box') {
    mesh.faces = gableCarton(L, W, H, t, glue, tpl);
    mesh.features.push({ id:'gable-native', label:'Gable-top carton with roof seal and body panels', foldAnimation:true });
  } else if (tpl === 'window-carton') {
    mesh.faces = windowCarton(L, W, H, t, glue);
    mesh.features.push({ id:'window-carton-native', label:'Carton shell with dieline window opening component', foldAnimation:true });
  } else if (tpl === 'auto-lock-bottom') {
    mesh.faces = autoLockCarton(L, W, H, t, glue);
    mesh.features.push({ id:'auto-lock-native', label:'Folding carton with auto-lock bottom tabs', foldAnimation:true });
  } else if (tpl === 'hanger-box') {
    mesh.faces = windowCarton(L, W, H, t, glue);
    mesh.faces.push(face('euro-hanger-slot', [v3(-L*.18,H+W*.35,W/2+t),v3(L*.18,H+W*.35,W/2+t),v3(L*.18,H+W*.48,W/2+t),v3(-L*.18,H+W*.48,W/2+t)], 'screen', uv4, { panelId:'hanger-slot', component:'opening', opening:true }));
    mesh.features.push({ id:'hanger-box-native', label:'Carton with hanger slot/opening metadata', foldAnimation:true });
  } else if (tpl === 'pillow-box') {
    mesh.faces = pillowCarton(L, W, H, t, tpl);
    mesh.features.push({ id:'pillow-carton-native', label:'Curved pillow carton with crimp closures', foldAnimation:true });
  } else if (tpl === 'shipping-box') {
    mesh.faces = addRscFlaps(boxShell(tpl, L, W, H, t, 'corrugated'), L, W, H);
    mesh.features.push({ id:'rsc-native', label:'Regular slotted carton with major/minor flaps', foldAnimation:true });
  } else if (tpl === 'pizza-box' || tpl === 'mailer') {
    mesh.faces = pizzaMailerBox(L, W, Math.max(10, H*.35), t, tpl);
    mesh.features.push({ id:`${tpl}-native`, label:'Corrugated mailer/pizza style tray with hinged lid and lock flap', foldAnimation:true });
  } else if (tpl === 'sleeve-tray' || tpl === 'drawer') {
    mesh.faces = trayWithSleeve(L, W, H, t);
    mesh.features.push({ id:`${tpl}-native`, label:'Tray plus sliding sleeve component assembly', foldAnimation:true });
  } else if (tpl === 'lidbase' || tpl === 'book-box') {
    mesh.faces = lidBaseMesh(L, W, H, t, tpl);
    mesh.features.push({ id:`${tpl}-native`, label:'Rigid base and separate lid assembly', foldAnimation:true });
  } else if (tpl === 'cyl' || tpl === 'hex') {
    const sides = tpl === 'cyl' ? (quality === 'high' ? 48 : 24) : 6;
    mesh.faces = tubeMesh(L, W, H, t, sides);
    mesh.features.push({ id:`${tpl}-native`, label:'Tube/prism body with top and bottom closure discs', foldAnimation:true, sides });
  } else if (tpl === 'paper-cup-packaging' || tpl === 'paper-cup' || tpl === 'ice-cream-tub') {
    const topD=Math.max(L, W, 60), bottomD=Math.max(30, Math.min(topD-8, topD*.72));
    mesh.faces = frustumFaces(tpl, topD, bottomD, H, t, quality === 'high' ? 96 : 48);
    if (tpl === 'ice-cream-tub') mesh.faces.push(face('snap-on-lid-disc', Array.from({length:32},(_,i)=>v3(Math.cos(2*Math.PI*i/32)*topD*.55,H+Math.max(3,t*4),Math.sin(2*Math.PI*i/32)*topD*.55)), 'rim', Array.from({length:32},(_,i)=>[.5+.5*Math.cos(2*Math.PI*i/32),.5+.5*Math.sin(2*Math.PI*i/32)]), { panelId:'lid', component:'closure' }));
    mesh.scale=[r(topD),r(topD),r(H)];
    mesh.features.push({ id: tpl === 'ice-cream-tub' ? 'ice-cream-tub-native' : 'paper-cup-native', label:'Conical frustum cup/tub wall with rolled rim or lid', topDiameter:r(topD), bottomDiameter:r(bottomD), foldAnimation:false });
  } else if (tpl === 'cup-sleeve') {
    const topD=Math.max(L, W, 70), bottomD=Math.max(42, topD*.82), sleeveH=Math.max(38, Math.min(H*.45, 80));
    mesh.faces = frustumFaces(tpl, topD, bottomD, sleeveH, t, quality === 'high' ? 96 : 48).filter(f => f.component !== 'rim');
    mesh.scale=[r(topD),r(topD),r(sleeveH)];
    mesh.features.push({ id:'cup-sleeve-native', label:'Conical cup sleeve band matching wrap dieline', topDiameter:r(topD), bottomDiameter:r(bottomD), foldAnimation:false });
  } else if (tpl === 'food-tray') {
    mesh.faces = friesTray(L, W, Math.max(24, H*.35), t);
    mesh.features.push({ id:'food-tray-native', label:'Open tapered food tray with flared walls', foldAnimation:true });
  } else if (tpl === 'fries-box') {
    mesh.faces = friesTray(L, W, H, t);
    mesh.features.push({ id:'fries-tray-native', label:'Open tapered fries carton with taller back panel', foldAnimation:true });
  } else if (tpl === 'burger-clamshell') {
    mesh.faces = clamshell(L, W, H, t);
    mesh.features.push({ id:'clamshell-native', label:'Food clamshell with living hinge and lid/base trays', foldAnimation:true });
  } else if (['standup-pouch','flat-sachet','pillow-pack','spout-pouch'].includes(tpl)) {
    mesh.faces = pouchMesh(tpl, L, W, H, t);
    mesh.features.push({ id:`${tpl}-native`, label:'Flexible packaging body with gussets and seal bands', foldAnimation:false });
  } else if (tpl === 'phone-mockup' || tpl === 'phone-case') {
    mesh.faces = mockupPhone(L, W, H, t);
    mesh.features.push({ id:'phone-mockup-native', label:'Smartphone with screen artwork area and bezel frame', foldAnimation:false });
  } else if (tpl === 'laptop-mockup') {
    mesh.faces = mockupLaptop(L, W, H, t);
    mesh.features.push({ id:'laptop-mockup-native', label:'Laptop computer with screen and keyboard', foldAnimation:false });
  } else if (tpl === 'tablet-mockup') {
    mesh.faces = mockupTablet(L, W, H, t);
    mesh.features.push({ id:'tablet-mockup-native', label:'Tablet device with display screen', foldAnimation:false });
  } else if (tpl === 'tshirt-front') {
    mesh.faces = mockupTshirt(L, W, H, t);
    mesh.features.push({ id:'tshirt-mockup-native', label:'T-shirt garment with front panel artwork', foldAnimation:false });
  } else if (tpl === 'hoodie-mockup') {
    mesh.faces = mockupHoodie(L, W, H, t);
    mesh.features.push({ id:'hoodie-mockup-native', label:'Hoodie garment with front panel artwork and kangaroo pocket', foldAnimation:false });
  } else if (tpl === 'tote-bag') {
    mesh.faces = mockupToteBag(L, W, H, t);
    mesh.features.push({ id:'tote-mockup-native', label:'Canvas tote bag with handles and front artwork', foldAnimation:false });
  } else if (['mug-wrap','tumbler-wrap','bottle-wrap'].includes(tpl)) {
    mesh.faces = mockupCylindricalWrap(tpl, L, W, H, t, quality === 'high' ? 64 : 48);
    mesh.features.push({ id:`${tpl}-mockup-native`, label:'Cylindrical wrap for drinkware or bottles', foldAnimation:false });
  } else if (tpl === 'roll-banner') {
    mesh.faces = mockupBanner(Math.max(300,L), W, Math.max(1800,H), t);
    mesh.features.push({ id:'roll-banner-native', label:'Roll-up banner stand with retractable fabric', foldAnimation:false });
  } else if (tpl === 'booth-counter') {
    mesh.faces = boxShell(tpl, L, W, H, t, 'foam');
    mesh.features.push({ id:'booth-counter-native', label:'Trade show booth counter display structure', foldAnimation:false });
  } else if (tpl === 'signage-board') {
    mesh.faces = mockupSignageBoard(L, W, H, t);
    mesh.features.push({ id:'signage-board-native', label:'Wall-mount or stand signage with framed artwork', foldAnimation:false });
  } else if (tpl === 'sticker-sheet') {
    mesh.faces = mockupStickerSheet(L, W, H, t);
    mesh.features.push({ id:'sticker-mockup-native', label:'Die-cut sticker sheet with adhesive backing', foldAnimation:false });
  } else if (['bottle-label-packaging','hangtag','belly-band'].includes(tpl)) {
    mesh.faces = mockupBottleLabel(L, W, H, t, quality === 'high' ? 64 : 48);
    mesh.features.push({ id:`${tpl}-mockup-native`, label:'Wrap label or tag for product placement', foldAnimation:false });
  } else if (tpl === 'cap-mockup') {
    mesh.faces = mockupCap(L, W, H, t);
    mesh.features.push({ id:'cap-mockup-native', label:'Cap/hat with visor and front panel artwork', foldAnimation:false });
  } else if (tpl === 'jersey-mockup') {
    mesh.faces = mockupJersey(L, W, H, t);
    mesh.features.push({ id:'jersey-mockup-native', label:'Sports jersey with front panel artwork', foldAnimation:false });
  } else if (tpl === 'apron-mockup') {
    mesh.faces = mockupApron(L, W, H, t);
    mesh.features.push({ id:'apron-mockup-native', label:'Work apron with pocket and front artwork', foldAnimation:false });
  } else if (tpl === 'polo-shirt') {
    mesh.faces = mockupPoloShirt(L, W, H, t);
    mesh.features.push({ id:'polo-shirt-native', label:'Polo shirt with collar and front artwork', foldAnimation:false });
  } else if (tpl === 'crewneck-sweater') {
    mesh.faces = mockupCrewneck(L, W, H, t);
    mesh.features.push({ id:'crewneck-sweater-native', label:'Crewneck sweater with front artwork', foldAnimation:false });
  } else if (tpl === 'lanyard-mockup') {
    mesh.faces = mockupLanyard(L, W, H, t);
    mesh.features.push({ id:'lanyard-mockup-native', label:'Lanyard with clip and front artwork band', foldAnimation:false });
  } else if (tpl === 'bottle-mockup') {
    mesh.faces = mockupBottle(L, W, H, t);
    mesh.features.push({ id:'bottle-mockup-native', label:'Glass bottle with cylindrical body and neck', foldAnimation:false });
  } else if (tpl === 'keychain-mockup') {
    mesh.faces = mockupKeychain(L, W, H, t);
    mesh.features.push({ id:'keychain-mockup-native', label:'Keychain tag with ring attachment', foldAnimation:false });
  } else if (tpl === 'notebook-cover') {
    mesh.faces = mockupNotebookCover(L, W, H, t);
    mesh.features.push({ id:'notebook-cover-native', label:'Notebook cover with spine and front artwork', foldAnimation:false });
  } else if (tpl === 'mousepad-mockup') {
    mesh.faces = mockupMousepad(L, W, H, t);
    mesh.features.push({ id:'mousepad-mockup-native', label:'Rubber mousepad with beveled edge', foldAnimation:false });
  } else if (tpl === 'pin-button') {
    mesh.faces = mockupPinButton(L, W, H, t);
    mesh.features.push({ id:'pin-button-native', label:'Circular pin button with artwork face', foldAnimation:false });
  } else if (tpl === 'lanyard-card' || tpl === 'id-card-holder') {
    mesh.faces = mockupLanyardCard(L, W, H, t);
    mesh.features.push({ id:'lanyard-card-native', label:'ID card holder with punch hole for lanyard', foldAnimation:false });
  } else if (['business-card','postcard'].includes(tpl)) {
    mesh.faces = flatSheet(tpl, L, W, t, 'paper');
    mesh.features.push({ id:`${tpl}-flat`, label:'Business card or postcard with artwork surface', foldAnimation:false });
  } else if (['trifold-brochure','brochure','tri-fold'].includes(tpl)) {
    mesh.faces = flatFoldedBrochure(tpl, L, W, H, t);
    mesh.features.push({ id:`${tpl}-flat`, label:'Tri-fold brochure with multiple panels and spine', foldAnimation:false });
  } else if (['poster-a3','poster-a4','flyer-a5','flyer-letter'].includes(tpl)) {
    mesh.faces = flatSheet(tpl, L, W, t, 'paper');
    mesh.features.push({ id:`${tpl}-flat`, label:'Poster or flyer with flat artwork surface', foldAnimation:false });
  } else if (['menu-card','menu-board','table-tent'].includes(tpl)) {
    mesh.faces = flatFoldedBrochure(tpl, L*0.5, W, H, Math.max(2, t*2));
    mesh.features.push({ id:`${tpl}-flat`, label:'Menu card or tent with fold crease', foldAnimation:false });
  } else if (['desktop-monitor','monitor-mockup'].includes(tpl)) {
    mesh.faces = mockupLaptop(L, W, H, t);
    mesh.features.push({ id:`${tpl}-mockup`, label:'Desktop monitor display mockup', foldAnimation:false });
  } else if (['smartwatch-mockup','watch-mockup'].includes(tpl)) {
    mesh.faces = mockupTablet(Math.min(L, W), Math.min(L, W), H, t);
    mesh.features.push({ id:`${tpl}-mockup`, label:'Smartwatch rectangular display mockup', foldAnimation:false });
  } else if (['bottle-label','can-label','jar-label'].includes(tpl)) {
    mesh.faces = flatRollLabel(tpl, L, W, H, t, quality === 'high' ? 64 : 48);
    mesh.features.push({ id:`${tpl}-label`, label:'Product label wrap for bottle, can, or jar', foldAnimation:false });
  } else if (['earbuds-case','powerbank-mockup','usb-drive'].includes(tpl)) {
    mesh.faces = flatSheet(tpl, L, W, t, 'plastic');
    mesh.features.push({ id:`${tpl}-mockup`, label:'Device case or drive mockup with surface', foldAnimation:false });
  } else if (['burger-box','x-banner','table-throw','display-rack','hanging-banner','backdrop-wall','coffee-bag'].includes(tpl)) {
    mesh.faces = flatSheet(tpl, Math.max(L, 100), Math.max(W, 100), t, 'paper');
    mesh.features.push({ id:`${tpl}-display`, label:'Display or packaging product surface', foldAnimation:false });
  } else if (['sticker-label-roll','label-roll'].includes(tpl)) {
    mesh.faces = flatRollLabel(tpl, L, W, H, t, quality === 'high' ? 96 : 64);
    mesh.features.push({ id:`${tpl}-roll`, label:'Sticker label roll for dispenser', foldAnimation:false });
  } else if (['upload-glb','upload-obj','upload-svg-dieline'].includes(tpl)) {
    mesh.faces = uploadPlaceholder(tpl, L, W, H, t);
    mesh.unsupported = true;
    mesh.validationNotes.push(`Model asset not yet uploaded. User must provide ${tpl.includes('glb') ? 'GLB' : tpl.includes('obj') ? 'OBJ' : 'SVG dieline'} file via upload interface.`);
    mesh.features.push({ id:`${tpl}-upload`, label:'Upload portal for custom 3D model asset', foldAnimation:false });
  } else if (tpl === 'custom-brief-board') {
    mesh.faces = flatFoldedBrochure(tpl, L*0.6, W*0.8, H, Math.max(2, t*2));
    mesh.unsupported = true;
    mesh.validationNotes.push('Custom brief board: placeholder for design notes and asset collage. Replace with actual artwork in design view.');
    mesh.features.push({ id:'custom-brief-board', label:'Design brief collage board with notes', foldAnimation:false });
  } else if (tpl === 'brand-kit-mockup') {
    mesh.faces = flatMultiPanel(tpl, L, W, H, 2, 2, t);
    mesh.unsupported = true;
    mesh.validationNotes.push('Brand kit mockup: placeholder for logo, color, and typography samples. Import brand assets in design editor.');
    mesh.features.push({ id:'brand-kit-mockup', label:'Brand identity kit display with 4 panels', foldAnimation:false });
  } else if (tpl === 'request-model') {
    mesh.faces = uploadPlaceholder(tpl, L, W, H, t);
    mesh.unsupported = true;
    mesh.validationNotes.push('Model request: submit custom model specification. OpenBox team will design and deliver 3D geometry.');
    mesh.features.push({ id:'request-model', label:'Custom model request placeholder', foldAnimation:false });
  } else if ([MESH_FACTORY_TYPES.flatPrint, MESH_FACTORY_TYPES.apparel, MESH_FACTORY_TYPES.display, MESH_FACTORY_TYPES.device, MESH_FACTORY_TYPES.custom].includes(strategy)) {
    const audit = modelDielineAudit(tpl);
    const dims = /([0-9]+(?:\.[0-9]+)?)\s*x\s*([0-9]+(?:\.[0-9]+)?)/i.exec(audit?.nominalDimensions || audit?.artworkSizeMM || '');
    const w = dims ? +dims[1] : L, h = dims ? +dims[2] : H;
    mesh.faces = flatSheet(tpl, w, h, t, strategy === MESH_FACTORY_TYPES.device ? 'screen' : 'paper');
    mesh.unsupported = strategy === MESH_FACTORY_TYPES.custom;
    mesh.validationNotes.push(strategy === MESH_FACTORY_TYPES.custom ? 'Custom asset needs uploaded GLB/OBJ/SVG specification.' : 'Non-structural asset uses print/reference surface; no physical production approval claimed.');
  } else {
    mesh.faces = boxShell(tpl, L, W, H, t, strategy === MESH_FACTORY_TYPES.corrugatedBox ? 'corrugated' : 'paper');
    mesh.validationNotes.push('Native construction rule pending; preview uses category shell and is not production-approved.');
  }
  mesh.vertices = mesh.faces.flatMap(f=>f.verts);
  return mesh;
}

export function auditAllModelMeshStrategies(models = allModels()) {
  return models.map(model => {
    const source = IMPORTED_DIELINES[model.id] ? 'structural-svg' : (model.artworkGuideV3 ? 'artwork-guide' : 'catalog');
    const factory = meshStrategyForModel(model);
    const nativeStructural = ['rte','ste','gable-box','window-carton','auto-lock-bottom','hanger-box','pillow-box','shipping-box','pizza-box','mailer','sleeve-tray','drawer','lidbase','book-box','cyl','hex','paper-cup-packaging','paper-cup','ice-cream-tub','cup-sleeve','food-tray','fries-box','burger-clamshell','standup-pouch','flat-sachet','pillow-pack','spout-pouch'].includes(model.id);
    const nativeMockup = ['phone-mockup','phone-case','laptop-mockup','tablet-mockup','tshirt-front','hoodie-mockup','tote-bag','mug-wrap','tumbler-wrap','bottle-wrap','roll-banner','booth-counter','signage-board','sticker-sheet','bottle-label-packaging','hangtag','belly-band','cap-mockup','jersey-mockup','apron-mockup','polo-shirt','crewneck-sweater','lanyard-mockup','bottle-mockup','keychain-mockup','notebook-cover','mousepad-mockup','pin-button','lanyard-card','id-card-holder'].includes(model.id);
    const wave4Flat = ['business-card','postcard','trifold-brochure','brochure','tri-fold','poster-a3','poster-a4','flyer-a5','flyer-letter','menu-card','menu-board','table-tent','desktop-monitor','monitor-mockup','smartwatch-mockup','watch-mockup','bottle-label','can-label','jar-label','earbuds-case','powerbank-mockup','usb-drive','burger-box','x-banner','table-throw','display-rack','hanging-banner','backdrop-wall','coffee-bag','sticker-label-roll','label-roll','calendar-desk','certificate-a4','envelope-mockup','folder-map','letterhead','postcard-a6','sticker-roll','voucher-card','wedding-invitation'].includes(model.id);
    const wave5Custom = ['upload-glb','upload-obj','upload-svg-dieline','custom-brief-board','brand-kit-mockup','request-model'].includes(model.id);
    const structural = ['folding-carton','corrugated-box','rigid-box','tube','cup','flexible-packaging'].includes(factory);
    return {
      id:model.id, name:model.name, category:model.productCategory || model.category, subCategory:model.subCategory || '', factory,
      sourceGeometry: source,
      hasImportedSvg: !!IMPORTED_DIELINES[model.id],
      parameterContract: structural ? ['L','W','H','t','glue','fold','quality','material'] : ['width','height','depth/asset','material','quality'],
      meshStatus: nativeStructural ? 'WAVE2_NATIVE_READY' : (nativeMockup ? 'WAVE3_MOCKUP_READY' : (wave4Flat ? 'WAVE4_FLAT_READY' : (wave5Custom ? 'WAVE5_CUSTOM_READY' : (structural ? 'WAVE2_RULE_REQUIRED' : 'UNROUTED')))),
      physicalProductionApproved:false
    };
  });
}
