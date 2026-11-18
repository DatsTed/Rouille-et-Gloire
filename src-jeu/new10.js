/* ======================================================================
   Monde 3D : grand garage à la première personne, PNJ en tenue, podiums
   ====================================================================== */
const HUB={scene:null,cam:null,sig:'',pos:{x:0,z:12},yaw:0,pit:0,inp:{x:0,z:0},keys:{},nkey:'',t:0,walk:0,ents:null,obs:[],kb:false,look:null};
const HUB_NPC=[
 {id:'cartes',   lab:'🃏 Paquets',   s:-1, z:-4,  col:0xff2bd6, css:'#FF2BD6', txt:'Ouvrir la boutique de cartes', o:{torso:0x6a1b9a,legs:0x1d1830,arm:0xf2f2f8,bow:0xff2bd6,hat:'news',hatCol:0x30204a,longHair:true,hair:0x2a1810}},
 {id:'marche',   lab:'🛒 Concession',s:1,  z:-4,  col:0xfcee0a, css:'#FCEE0A', txt:'Aller au marché', o:{torso:0x1b2145,legs:0x1b2145,arm:0x1b2145,shirt:true,tie:0xd0202a,hair:0x151515}},
 {id:'base',     lab:'🏗️ Chantiers', s:-1, z:11,  col:0xff9a1a, css:'#FF9A1A', txt:'Atelier et chantiers', o:{torso:0x4d5568,legs:0x2f3d6b,arm:0x4d5568,vest:0xff7a00,hat:'hard',hatCol:0xffd400,shoe:0x5a3a1a,hair:0x3a2a1a}},
 {id:'missions', lab:'📜 Missions',  s:1,  z:11,  col:0x8f6bff, css:'#A58BFF', txt:'Missions, badges et récompenses', o:{torso:0xb59a6a,legs:0x2b2b35,arm:0xb59a6a,glasses:true,clip:true,hair:0x6b4b2a}},
 {id:'epreuves', lab:'🏁 Épreuves',  f:-16,  col:0x3cff9e, css:'#3CFF9E', txt:'Choisir une épreuve', o:{torso:0xe53935,legs:0xe53935,arm:0xe53935,stripe:0xffffff,hat:'helmet',hatCol:0xffffff,hatAcc:0x00e5ff,glove:true}},
 {id:'meca',     lab:'🔧 Mécano',    f:16,   col:0x00e5ff, css:'#00E5FF', txt:'Réviser tout le garage', o:{torso:0x1d4f9a,legs:0x1d4f9a,arm:0x1d4f9a,hat:'cap',hatCol:0xc89a1a,wrench:true,stain:true,hair:0x2a2018}}
];
function hubFigure(o){
  const g=new THREE.Group(), L=c=>new THREE.MeshLambertMaterial({color:c}), skin=o.skin||0xe8b894;
  const add=(geo,col,x,y,z,par)=>{ const m=new THREE.Mesh(geo,L(col)); m.position.set(x,y,z); (par||g).add(m); return m; };
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), C=(a,b,h)=>new THREE.CylinderGeometry(a,b,h,12), S=r=>new THREE.SphereGeometry(r,12,10);
  [-1,1].forEach(s=>{ add(B(.22,.85,.26),o.legs,s*.14,.43,0); add(B(.25,.12,.36),o.shoe||0x15151f,s*.14,.06,.05); });
  add(B(.58,.68,.32),o.torso,0,1.2,0);
  if(o.shirt){ add(B(.2,.44,.02),0xffffff,0,1.24,.165); add(B(.07,.36,.03),o.tie,0,1.2,.18); add(B(.1,.07,.04),o.tie,0,1.4,.18); }
  if(o.bow){ add(B(.08,.07,.04),o.bow,-.06,1.43,.17); add(B(.08,.07,.04),o.bow,.06,1.43,.17); add(B(.2,.4,.02),0xffffff,0,1.24,.165); }
  if(o.vest){ add(B(.6,.52,.34),o.vest,0,1.22,0); add(B(.62,.05,.35),0xe8e8e8,0,1.12,0); add(B(.62,.05,.35),0xe8e8e8,0,1.34,0); }
  if(o.stripe){ add(B(.6,.07,.34),o.stripe,0,1.28,0); add(B(.12,.07,.34),0x111122,0,1.12,0); }
  if(o.stain){ add(B(.2,.16,.02),0x23262e,-.12,1.1,.165); add(B(.12,.1,.02),0x23262e,.14,1.32,.165); add(B(.14,.3,.02),0x23262e,.14,.55,.135); }
  const arms=[-1,1].map(s=>{ const p=new THREE.Group(); p.position.set(s*.38,1.5,0); g.add(p); add(B(.15,.62,.17),o.arm,0,-.3,0,p); add(S(.08),o.glove?0x111118:skin,0,-.66,0,p); return p; });
  if(o.clip){ const c=add(B(.3,.38,.03),0x8a5a2b,0,-.62,.14,arms[1]); add(B(.24,.32,.02),0xffffff,0,0,.02,c); arms[1].rotation.x=-.9; }
  if(o.wrench){ add(B(.05,.46,.05),0xa0a6b0,.02,-.72,.06,arms[1]); add(B(.14,.08,.05),0xa0a6b0,.02,-.96,.06,arms[1]); arms[1].rotation.x=-.5; }
  const head=new THREE.Group(); head.position.y=1.8; g.add(head);
  add(C(.07,.08,.1),skin,0,-.2,0,head); add(S(.18),skin,0,0,0,head);
  if(o.hat==='helmet'){
    const h=add(S(.235),o.hatCol,0,.02,0,head); h.scale.set(1,1.05,1.08); add(B(.34,.11,.12),0x0a1426,0,-.01,.17,head); add(B(.05,.3,.5),o.hatAcc,0,.06,0,head);
  }else{
    [-1,1].forEach(s=>add(B(.035,.035,.02),0x15151c,s*.07,.02,.17,head));
    if(o.glasses){ [-1,1].forEach(s=>add(B(.11,.07,.02),0x15151c,s*.07,.02,.18,head)); }
    const hr=add(S(.188),o.hair||0x2a1810,0,.035,-.025,head); hr.scale.set(1,.92,1);
    if(o.longHair) add(B(.32,.42,.1),o.hair,0,-.12,-.15,head);
    if(o.hat==='hard'){ add(C(.2,.21,.11),o.hatCol,0,.15,0,head); add(B(.4,.03,.3),o.hatCol,0,.1,.04,head); }
    if(o.hat==='cap'){ add(C(.19,.2,.1),o.hatCol,0,.15,0,head); add(B(.26,.03,.16),o.hatCol,0,.11,.2,head); }
    if(o.hat==='news'){ add(C(.22,.2,.08),o.hatCol,0,.14,0,head); add(B(.22,.03,.12),o.hatCol,0,.11,.18,head); }
  }
  return {g,arms,head};
}
function hubLabel(txt,css,sc_,x,z){
  const l=labelSprite(txt,css,sc_); l.material.depthTest=false; l.material.depthWrite=false; l.renderOrder=20; l.userData.hx=x; l.userData.hz=z;
  if(HUB.labels&&sc_<20) HUB.labels.push(l); return l;
}
function hubBuild(){
  if(HUB.map&&HUB.map!=='garage') return (typeof WORLD!=='undefined'&&WORLD[HUB.map]?worldBuild:growBuild)(HUB.map);
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x07051a); sc.fog=new THREE.Fog(0x07051a,60,150);
  sc.add(new THREE.HemisphereLight(0xc4ccff,0x2a0a4a,1.3)); const dl=new THREE.DirectionalLight(0xffd0f8,.7); dl.position.set(-20,40,25); sc.add(dl);
  const cam=new THREE.PerspectiveCamera(100,1.5,.1,300), HX=36, HZ=26;
  const ft=ctex(512,512,(x,W,H)=>{ x.fillStyle='#1c1e36'; x.fillRect(0,0,W,H);
    for(let i=0;i<900;i++){ x.fillStyle=`rgba(${120+Math.random()*80|0},${120+Math.random()*80|0},${160+Math.random()*80|0},${.03+Math.random()*.06})`; x.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*3,1+Math.random()*3); }
    x.strokeStyle='#0d0e20'; x.lineWidth=4; x.strokeRect(2,2,W-4,H-4); x.strokeStyle='rgba(255,255,255,.05)'; x.lineWidth=2; x.beginPath(); x.moveTo(W/2,0); x.lineTo(W/2,H); x.moveTo(0,H/2); x.lineTo(W,H/2); x.stroke();
    x.fillStyle='#d9b400'; [[6,6],[W-14,6],[6,H-14],[W-14,H-14]].forEach(q=>x.fillRect(q[0],q[1],8,8)); },[9,6.5]);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(HX*2,HZ*2),new THREE.MeshLambertMaterial({map:ft})); fl.rotation.x=-Math.PI/2; sc.add(fl);
  const ce=new THREE.Mesh(new THREE.PlaneGeometry(HX*2,HZ*2),new THREE.MeshBasicMaterial({color:0x0b0b1e,side:THREE.DoubleSide})); ce.rotation.x=Math.PI/2; ce.position.y=11; sc.add(ce);
  const wallM=new THREE.MeshLambertMaterial({color:0x1b1d44}), neon=c=>new THREE.MeshBasicMaterial({color:c});
  const box=(w,h,d,x,y,z,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); sc.add(m); return m; };
  box(HX*2+1,11,.6,0,5.5,-HZ-.3,wallM); box(HX*2+1,11,.6,0,5.5,HZ+.3,wallM); box(.6,11,HZ*2,-HX-.3,5.5,0,wallM); box(.6,11,HZ*2,HX+.3,5.5,0,wallM);
  [[HX*2,.18,.1,0,2.2,-HZ+.1,0x00E5FF],[HX*2,.18,.1,0,2.2,HZ-.1,0x00E5FF],[.1,.18,HZ*2,-HX+.1,2.2,0,0xFF2BD6],[.1,.18,HZ*2,HX-.1,2.2,0,0xFF2BD6]].forEach(a=>box(a[0],a[1],a[2],a[3],a[4],a[5],neon(a[6])));
  for(let i=-3;i<=3;i++) for(let j=-1;j<=1;j++) box(8,.1,1.2,i*10,10.9,j*14,neon(0xddeeff));
  [-1,1].forEach(a=>[-1,1].forEach(b=>box(1.2,11,1.2,a*14,5.5,b*8,wallM)));
  const ban=hubLabel('MON GARAGE','#00E5FF',26,0,0); ban.position.set(0,8.5,-HZ+.9); sc.add(ban); HUB.labels=[];
  const E={npcs:[],pods:[]}; HUB.obs=[];
  const slots=(S.pod&&S.pod.slots)||[];
  for(let i=0;i<POD_MAX;i++){
    const x=-28+8*i, z=-18, open=S.lvl>=POD_LVL[i], uid=slots[i], c=uid&&car(uid);
    const d=new THREE.Mesh(new THREE.CylinderGeometry(3.1,3.4,.45,32),new THREE.MeshLambertMaterial({color:open?0x2a2e6a:0x15162e})); d.position.set(x,.23,z); sc.add(d);
    const rg=new THREE.Mesh(new THREE.TorusGeometry(3.15,.09,8,44),neon(open?0x00E5FF:0x444866)); rg.rotation.x=Math.PI/2; rg.position.set(x,.47,z); sc.add(rg);
    let cg=null; if(open&&c){ try{ cg=buildCar(M[c.mid],'#00E5FF',carLook(c)); cg.g.position.set(x,.46,z); sc.add(cg.g); }catch(e){ cg=null; } }
    const lb=hubLabel(!open?'🔒 Niv. '+POD_LVL[i]:(c?M[c.mid].nom:'Podium '+(i+1)),open?'#00E5FF':'#8b90c8',5.6,x,z+2.2); lb.position.set(x,4.2,z+2.2); sc.add(lb);
    E.pods.push({i,x,z,open,cg,c}); HUB.obs.push({x,z,r:3.3});
  }
  HUB_NPC.forEach((n,k)=>{
    let nx,nz,cx,cz,px,pz,sx,sz;
    if(n.s){ nx=n.s*33.2; nz=n.z; cx=n.s*31.6; cz=n.z; px=n.s*35.2; pz=n.z; sx=.3; sz=7; HUB.obs.push({x0:cx-.6,x1:cx+.6,z0:cz-2.4,z1:cz+2.4}); box(1.2,1.1,4.8,cx,.55,cz,new THREE.MeshLambertMaterial({color:0x23265a})); box(1.3,.08,4.9,cx,1.12,cz,neon(n.col)); }
    else { nx=n.f; nz=24.2; cx=n.f; cz=22.6; px=n.f; pz=25.4; sx=7; sz=.3; HUB.obs.push({x0:cx-2.4,x1:cx+2.4,z0:cz-.6,z1:cz+.6}); box(4.8,1.1,1.2,cx,.55,cz,new THREE.MeshLambertMaterial({color:0x23265a})); box(4.9,.08,1.3,cx,1.12,cz,neon(n.col)); }
    box(sx,5.2,sz,px,2.6,pz,new THREE.MeshLambertMaterial({color:0x14163a}));
    box(n.s?.1:6.8,.16,n.s?6.8:.1,px+(n.s?-n.s*.2:0),4.4,pz+(n.s?0:-.2),neon(n.col));
    /* accessoires de métier */
    if(n.id==='cartes'){ [0,1,2,3].forEach(j=>box(.5,.7,.04,cx,1.5+.0,cz-1.5+j*1,new THREE.MeshBasicMaterial({color:[0xff2bd6,0x00e5ff,0xfcee0a,0x8f6bff][j]}))); }
    if(n.id==='marche'){ box(.9,.3,1.8,cx,1.35,cz,new THREE.MeshLambertMaterial({color:0xc33})); box(.6,.18,1.0,cx,1.58,cz,new THREE.MeshLambertMaterial({color:0x9ad})); }
    if(n.id==='base'){ [-1,0,1].forEach(j=>{ const cn=new THREE.Mesh(new THREE.ConeGeometry(.3,.8,12),new THREE.MeshLambertMaterial({color:0xff6a00})); cn.position.set(n.s*28.8,.4,n.z-3.5+j*3.5); sc.add(cn); }); box(1.4,1.2,1.4,n.s*29.2,.6,n.z+4.2,new THREE.MeshLambertMaterial({color:0x8a6a3a})); }
    if(n.id==='missions'){ box(.1,2.6,3.6,n.s*34.6,2.4,n.z,new THREE.MeshLambertMaterial({color:0x2a2218})); [0,1,2,3,4].forEach(j=>box(.04,.5,.4,n.s*34.5,1.6+(j%2)*.9,n.z-1.4+j*.7,new THREE.MeshBasicMaterial({color:[0xffffff,0xfcee0a,0xff9acb][j%3]}))); }
    if(n.id==='epreuves'){ box(.4,5,.4,n.f-3.2,2.5,21,neon(n.col)); box(.4,5,.4,n.f+3.2,2.5,21,neon(n.col)); const ck=ctex(128,32,(x,W,H)=>{ for(let i=0;i<16;i++) for(let j=0;j<4;j++){ x.fillStyle=(i+j)%2?'#fff':'#111'; x.fillRect(i*8,j*8,8,8);} }); box(6.8,.8,.3,n.f,5.2,21,new THREE.MeshBasicMaterial({map:ck})); }
    if(n.id==='meca'){ [-1,1].forEach(j=>{ for(let t=0;t<3;t++){ const tr=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.28,16),new THREE.MeshLambertMaterial({color:0x15151a})); tr.position.set(n.f+j*4.4,.14+t*.3,22); sc.add(tr); } }); box(1,.5,.5,n.f+2.8,1.38,cz,new THREE.MeshLambertMaterial({color:0xc02020})); }
    const f=hubFigure(n.o); f.g.position.set(nx,0,nz); sc.add(f.g);
    const rg=new THREE.Mesh(new THREE.TorusGeometry(1.6,.06,8,36),neon(n.col)); rg.rotation.x=Math.PI/2; rg.position.set(n.s?cx-n.s*1.8:cx,.06,n.s?cz:cz-1.8); sc.add(rg);
    const lb=hubLabel(n.lab,n.css,5.2,nx,nz); lb.position.set(n.s?px-n.s*1.2:px,3.9,n.s?pz:pz-1.2); sc.add(lb);
    E.npcs.push({n,f,rg,k,x:nx,z:nz}); HUB.obs.push({x:nx,z:nz,r:.9});
  });
  hubDecor(sc,HX,HZ,neon,box); hubSecret(sc,box,neon);
  HUB.scene=sc; HUB.cam=cam; HUB.ents=E; HUB.bx=35.2; HUB.bz=25.2; HUB.pois=null; HUB.plots=null; HUB.fans=null; HUB.map='garage';
}
function hubFrame(dt,time){
  const H=HUB, E=H.ents; if(!E||view!=='hub') return; H.t+=dt; if(H.map&&H.map!=='garage'){ if(GROW[H.map]) growTick(dt); else worldTick(dt); }
  let ix=H.inp.x, iz=H.inp.z; const k=H.keys;
  if(k.KeyA||k.KeyQ) ix-=1; if(k.KeyD) ix+=1; if(k.KeyW||k.KeyZ) iz-=1; if(k.KeyS) iz+=1;
  if(k.ArrowLeft) H.yaw+=1.9*dt; if(k.ArrowRight) H.yaw-=1.9*dt; if(k.ArrowUp) H.pit=Math.min(1.1,H.pit+1.4*dt); if(k.ArrowDown) H.pit=Math.max(-1.1,H.pit-1.4*dt);
  const m=Math.hypot(ix,iz); if(m>1){ ix/=m; iz/=m; }
  const sy=Math.sin(H.yaw), cy=Math.cos(H.yaw), vx=sy*iz+cy*ix, vz=cy*iz-sy*ix, sp=8, p=H.pos;
  let nx=clamp(p.x+vx*sp*dt,-(H.bx||35.2),H.bx||35.2), nz=clamp(p.z+vz*sp*dt,-(H.bz||25.2),H.bz||25.2);
  H.obs.forEach(o=>{
    if(o.r!=null){ const dx=nx-o.x, dz=nz-o.z, d=Math.hypot(dx,dz), r=o.r+.45; if(d<r&&d>1e-4){ nx=o.x+dx/d*r; nz=o.z+dz/d*r; } }
    else{ const qx=clamp(nx,o.x0,o.x1), qz=clamp(nz,o.z0,o.z1), dx=nx-qx, dz=nz-qz, d=Math.hypot(dx,dz); if(d<.45&&d>1e-4){ nx=qx+dx/d*.45; nz=qz+dz/d*.45; } }
  });
  p.x=nx; p.z=nz; const mv=m>.08; if(mv) H.walk+=dt*9;
  E.npcs.forEach(q=>{ const g=q.f.g, a=Math.atan2(p.x-q.x,p.z-q.z); let d2=a-g.rotation.y; d2=Math.atan2(Math.sin(d2),Math.cos(d2)); g.rotation.y+=d2*Math.min(1,dt*3); g.position.y=Math.abs(Math.sin(H.t*1.6+q.k))*.025;
    q.f.arms.forEach((a2,j)=>{ if(!a2.userData.b) a2.userData.b=a2.rotation.x; a2.rotation.x=a2.userData.b+Math.sin(H.t*1.8+q.k+j*3)*.06; });
    const s=1+.06*Math.sin(H.t*3+q.k); q.rg.scale.set(s,s,s); });
  E.pods.forEach(q=>{ if(q.cg){ q.cg.g.rotation.y=H.t*.3+q.i; if(q.cg.wheels) q.cg.wheels.forEach(w=>{w.rotation.z-=dt*.6;}); pulseSirens(q.cg,time); shineTick(q.cg,time); } });
  const cam=H.cam, ey=1.75+(mv?Math.sin(H.walk)*.04:0), asp=cam.aspect||1, fv=Math.min(105,2*Math.atan(Math.tan(55*Math.PI/180)/asp)*180/Math.PI);
  if(Math.abs(cam.fov-fv)>.1){ cam.fov=fv; cam.updateProjectionMatrix(); }
  cam.position.set(p.x+Math.sin(H.yaw)*.5,ey,p.z+Math.cos(H.yaw)*.5);
  (H.labels||[]).forEach(l=>{ l.visible=Math.hypot(p.x-l.userData.hx,p.z-l.userData.hz)<22; });
  const cp=Math.cos(H.pit); cam.lookAt(cam.position.x-Math.sin(H.yaw)*cp*10,ey+Math.sin(H.pit)*10,cam.position.z-Math.cos(H.yaw)*cp*10);
  let best=null, bd=1e9;
  E.npcs.forEach(q=>{ const d=Math.hypot(p.x-q.x,p.z-q.z); if(d<3.6&&d<bd){ bd=d; best={t:'n',n:q.n}; } });
  E.pods.forEach(q=>{ const d=Math.hypot(p.x-q.x,p.z-q.z); if(d<5.6&&d<bd){ bd=d; best={t:'p',q}; } });
  if(HUB.map&&HUB.map!=='garage') best=HUB.gbest?{t:'q',q:HUB.gbest}:null;
  else if(!best&&HUB.sec&&Math.hypot(p.x-HUB.sec.x,p.z-HUB.sec.z)<2.3) best={t:'s'};
  if(!best&&(!HUB.map||HUB.map==='garage')&&Math.abs(p.x)<7&&p.z>HZ_DOOR-6) best={t:'d'};
  hubAct(best);
}
const HZ_DOOR=26;
function hubAct(b){
  const el=$('hubAct'); if(!el) return; let h='';
  if(b&&b.t==='n'){
    let tx=b.n.txt; if(b.n.id==='meca'){ const fr=fleetRepair(); tx=fr?`Réviser tout le garage, ${fmt(fr)} cr`:'Garage en parfait état'; }
    h=`<div class="hn">${b.n.lab}</div><button class="btn wide" data-a="hubgo" data-id="${b.n.id}">${tx}</button>`;
  }else if(b&&b.t==='p'){
    const q=b.q; h=q.open?`<div class="hn">Podium ${q.i+1}</div><button class="btn wide" data-a="hubgo" data-id="pod${q.i}">${q.c?'Changer la voiture exposée':'Exposer une voiture'}</button>`:`<div class="hn">🔒 Podium ${q.i+1}</div><p class="note" style="margin:0">Ce podium s’ouvre au niveau ${POD_LVL[q.i]}.</p>`;
  }
  if(b&&b.t==='q'){ const q=b.q; h=`<div class="hn">${q.title()}</div><div class="brow">`+q.btns().map(x=>`<button class="btn ${x.alt?'alt ':''}" data-a="${q.a||'growgo'}" data-id="${q.id}" data-v="${x.id}">${x.tx}</button>`).join('')+'</div>'; }
  if(b&&b.t==='d') h=`<div class="hn">🏁 Piste d’essai · tout le circuit de Spa</div><button class="btn wide" data-a="hubgo" data-id="ptdoor">Ouvrir la grande porte</button>`;
  if(b&&b.t==='s') h=labLv()<8?`<div class="hn">🔒 Cloison scellée</div><p class="note" style="margin:0">Quelque chose se cache derrière… Reviens au niveau 8.</p>`:`<div class="hn">🌿 Cloison suspecte…</div><button class="btn wide" data-a="hubgo" data-id="ranch">Pousser la cloison</button>`;
  if(HUB.nkey!==h){ HUB.nkey=h; el.innerHTML=h; el.classList.toggle('on',!!h); }
}
function vHub(){
  return `<div class="rwrap hubw"><div class="rs" id="hubslot" style="height:clamp(420px,calc(100vh - 150px),760px)"></div>
    <button class="hubback" data-a="${hubBackA()}" data-id="garage">← Retour</button><div class="growhud" id="growhud"></div><button class="bagbtn" data-a="inv">🎒</button><button class="bagbtn hlp" data-a="gtuto">?</button><button class="bagbtn mapb" data-a="wmap">🗺️</button><div class="joy" id="joy"><i id="joyK"></i></div><div class="hubhint">Joystick : marcher · Glisse à droite : regarder</div><div class="hubact" id="hubAct"></div></div>`;
}
function bindHub(){
  const slot=$('hubslot'); if(!slot) return;
  if(!glEnsure()){ slot.innerHTML='<p class="note" style="padding:20px">La 3D n’est pas disponible sur cet appareil.</p>'; return; }
  const sig=JSON.stringify([S.pod&&S.pod.slots,S.lvl,S.cars.map(c=>c.uid+c.mid),HUB.map||'garage']);
  if(!HUB.scene||HUB.sig!==sig){ if(HUB.scene) disposeScene(HUB.scene); hubBuild(); HUB.sig=sig; }
  HUB.nkey=''; HUB.inp.x=HUB.inp.z=0; glAttach('hubslot'); glRun(HUB.scene,HUB.cam,hubFrame,'hub'); GL.r.domElement.style.touchAction='none';
  const j=$('joy'), kn=$('joyK'); let id=null;
  const upd=e=>{ const r=j.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2; let dx=(e.clientX-cx)/(r.width/2), dy=(e.clientY-cy)/(r.height/2); const m=Math.hypot(dx,dy); if(m>1){dx/=m; dy/=m;}
    HUB.inp.x=Math.abs(dx)<.12?0:dx; HUB.inp.z=Math.abs(dy)<.12?0:dy; kn.style.transform=`translate(${dx*34}px,${dy*34}px)`; };
  j.addEventListener('pointerdown',e=>{ e.preventDefault(); id=e.pointerId; try{j.setPointerCapture(id);}catch(_){} upd(e); });
  j.addEventListener('pointermove',e=>{ if(e.pointerId===id) upd(e); });
  const end=e=>{ if(e.pointerId!==id) return; id=null; HUB.inp.x=HUB.inp.z=0; kn.style.transform=''; };
  j.addEventListener('pointerup',end); j.addEventListener('pointercancel',end);
  /* regarder : on glisse n'importe où sur la vue, hors du joystick */
  let lid=null, lx=0, ly=0;
  slot.addEventListener('pointerdown',e=>{ if(lid!=null) return; lid=e.pointerId; lx=e.clientX; ly=e.clientY; try{slot.setPointerCapture(lid);}catch(_){} });
  slot.addEventListener('pointermove',e=>{ if(e.pointerId!==lid) return; HUB.yaw-=(e.clientX-lx)*.0055; HUB.pit=clamp(HUB.pit-(e.clientY-ly)*.0045,-1.1,1.1); lx=e.clientX; ly=e.clientY; });
  const le=e=>{ if(e.pointerId===lid) lid=null; }; slot.addEventListener('pointerup',le); slot.addEventListener('pointercancel',le);
  if(!HUB.kb){ HUB.kb=true;
    document.addEventListener('keydown',e=>{ if(view!=='hub'||sheet) return; HUB.keys[e.code]=true; if(e.code.startsWith('Arrow')) e.preventDefault(); });
    document.addEventListener('keyup',e=>{ HUB.keys[e.code]=false; }); }
}
ACT.hubgo=d=>{
  const id=d.id;
  if(id.startsWith('pod')){ const i=+id.slice(3); if(S.lvl>=POD_LVL[i]) openSheet({t:'slot',i}); return; }
  if(id==='ptdoor'){ return ACT.ptest(); }
  if(id==='ranch'){ ACT.ranch(); return; }
  if(id==='meca'){ const fr=fleetRepair(); if(!fr) return toast('Ton garage est déjà en parfait état'); ACT.fleetrep(); return; }
  ACT.tab({id});
};
ACT.prep_rep=d=>{
  const c=car(+d.id); if(!c) return; const u=repUnit(c), pts=Math.min(100-c.etat,Math.floor(S.cr/u));
  if(pts<1) return toast('Pas assez de crédits');
  S.cr-=Math.ceil(pts*u); c.etat+=pts; bump('repN');
  if(c.etat>=100){ c.etat=100; S.stats.repFull++; toast(M[c.mid].nom+' remise à neuf'); } else toast(`État remonté à ${c.etat} %`);
  save(); render();
};

/* ---- décor du garage : sol balisé, chemins, plantes, pneus, outils, ponts élévateurs ---- */
function hubInst(sc,geo,mat,items){
  if(!items.length) return null; const m=new THREE.InstancedMesh(geo,mat,items.length), d=new THREE.Object3D();
  items.forEach((a,i)=>{ d.position.set(a[0],a[1],a[2]); d.rotation.set(0,a[3]||0,0); d.scale.set(a[4]||1,a[5]||a[4]||1,a[6]||a[4]||1); d.updateMatrix(); m.setMatrixAt(i,d.matrix); });
  m.instanceMatrix.needsUpdate=true; m.frustumCulled=false; sc.add(m); return m;
}
function hubDecor(sc,HX,HZ,neon,box){
  const Lm=c=>new THREE.MeshLambertMaterial({color:c}), flat=(w,h,x,y,z,ry,mat)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); m.position.set(x,y,z); m.rotation.order='YXZ'; m.rotation.set(0,ry||0,0); sc.add(m); return m; };
  const obs=(x,z,r)=>HUB.obs.push({x,z,r}), obb=(x0,x1,z0,z1)=>HUB.obs.push({x0,x1,z0,z1});
  /* chemins fléchés vers chaque stand */
  const chev=ctex(128,64,(x,W,H)=>{ x.strokeStyle='#fff'; x.lineWidth=11; x.lineCap='round'; x.lineJoin='round'; x.beginPath(); x.moveTo(36,12); x.lineTo(84,32); x.lineTo(36,52); x.stroke(); });
  const path=(len,wd,x,z,th,col)=>{ const t=chev.clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(len/2.2,1);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(len,wd),new THREE.MeshBasicMaterial({map:t,color:col,transparent:true,opacity:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
    m.rotation.order='YXZ'; m.rotation.set(-Math.PI/2,th,0); m.position.set(x,.03,z); sc.add(m); };
  path(38,3,0,5,Math.PI/2,0x00e5ff);
  path(29,2.4,-15,-4,Math.PI,0xff2bd6); path(29,2.4,15,-4,0,0xfcee0a);
  path(29,2.4,-15,11,Math.PI,0xff9a1a); path(29,2.4,15,11,0,0xa58bff);
  path(10,2.4,-16,16,-Math.PI/2,0x3cff9e); path(10,2.4,16,16,-Math.PI/2,0x00e5ff);
  /* emblème au centre */
  const em=ctex(256,256,(x,W,H)=>{ x.translate(W/2,H/2); ['#00E5FF','#FF2BD6','#FCEE0A'].forEach((c,i)=>{ x.strokeStyle=c; x.lineWidth=10; x.beginPath(); x.arc(0,0,112-i*26,i*2,i*2+4.2); x.stroke(); }); x.fillStyle='#fff'; x.font='700 52px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('R&G',0,4); });
  const emm=new THREE.Mesh(new THREE.CircleGeometry(6.5,40),new THREE.MeshBasicMaterial({map:em,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3})); emm.rotation.x=-Math.PI/2; emm.position.set(0,.04,-1); sc.add(emm);
  /* plinthes jaunes et noires le long des murs */
  const hz=ctex(128,32,(x,W,H)=>{ x.fillStyle='#111'; x.fillRect(0,0,W,H); x.fillStyle='#e5b800'; for(let i=-2;i<10;i++){ x.beginPath(); x.moveTo(i*16,H); x.lineTo(i*16+16,0); x.lineTo(i*16+32,0); x.lineTo(i*16+16,H); x.fill(); } });
  [[0,-HZ+.05,0,HX*2],[0,HZ-.05,Math.PI,HX*2],[-HX+.05,0,Math.PI/2,HZ*2],[HX-.05,0,-Math.PI/2,HZ*2]].forEach(a=>{ const t=hz.clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(a[3]/2,1); const m=new THREE.Mesh(new THREE.PlaneGeometry(a[3],.5),new THREE.MeshBasicMaterial({map:t})); m.position.set(a[0],.25,a[1]); m.rotation.y=a[2]; sc.add(m); });
  /* piliers rayés */
  [-14,14].forEach(px=>[-8,8].forEach(pz=>{ const t=hz.clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(2,1); box(1.34,1.1,1.34,px,.55,pz,new THREE.MeshBasicMaterial({map:t})); obs(px,pz,.95); }));
  /* pneus */
  const tg=new THREE.CylinderGeometry(.52,.52,.3,18), tm=Lm(0x15151b), tires=[];
  [[-33.6,-23.5,4],[-32,-24.2,3],[33.6,-23.5,4],[32,-24.2,3],[-26,24.6,3],[26,24.6,4],[-33.5,21.5,3],[33.5,21.5,4],[-4,24.7,3],[4,24.7,3]].forEach(a=>{ for(let k=0;k<a[2];k++) tires.push([a[0]+(k%2)*.06,.15+k*.3,a[1],k*.7]); obs(a[0],a[1],.8); });
  hubInst(sc,tg,tm,tires);
  /* bidons */
  const bg=new THREE.CylinderGeometry(.42,.42,1,14), br=[[-34,-13,0],[-34,-11.8,0],[34,-13,0],[34.2,-11.8,0],[-30,24.6,0],[30,24.6,0],[-34,3.6,0],[34,3.6,0]]; hubInst(sc,bg,Lm(0xc02a2a),br.filter((_,i)=>i%2===0).map(a=>[a[0],.5,a[1]]));
  hubInst(sc,bg,Lm(0x2a4fc0),br.filter((_,i)=>i%2===1).map(a=>[a[0],.5,a[1]])); br.forEach(a=>obs(a[0],a[1],.6));
  /* caisses */
  const cg=new THREE.BoxGeometry(1,1,1), cr=[[-34,-21,1],[-34,-19.6,.8],[34,-21,1],[33.9,-19.6,.8],[-23,24.6,1.1],[23,24.6,1.1]]; hubInst(sc,cg,Lm(0x8a6a3a),cr.map(a=>[a[0],a[2]/2,a[1],.3,a[2],a[2],a[2]])); cr.forEach(a=>obs(a[0],a[1],.8));
  /* pots de fleurs */
  const pg=new THREE.CylinderGeometry(.36,.27,.55,12), fg=new THREE.SphereGeometry(.46,10,8), pts=[];
  [24,17.5,6,-1.5,-8,-12.4].forEach(z=>[-3.4,3.4].forEach(x=>pts.push([x,z]))); [[-9,-1],[9,-1],[-9,8],[9,8],[-22,-12],[22,-12],[-22,6],[22,6],[-6,23.5],[6,23.5]].forEach(a=>pts.push(a));
  hubInst(sc,pg,Lm(0xb5532f),pts.map(a=>[a[0],.28,a[1]])); hubInst(sc,fg,Lm(0x2f9e4a),pts.map((a,i)=>[a[0],.9,a[1],0,1,.85,1]));
  const fgm=new THREE.SphereGeometry(.1,6,5); [0xff5fa8,0xfcee0a,0xffffff].forEach((c,ci)=>hubInst(sc,fgm,new THREE.MeshBasicMaterial({color:c}),pts.flatMap((a,i)=>[0,1,2].map(k=>{ const an=i*1.7+k*2.1+ci; return [a[0]+Math.cos(an)*.36,1.05+(k%2)*.1+ci*.06,a[1]+Math.sin(an)*.36]; }))));
  pts.forEach(a=>obs(a[0],a[1],.55));
  /* ponts élévateurs avec une voiture */
  const lift=(lx,lz,col)=>{ box(3.6,.14,6.6,lx,.07,lz,Lm(0x2a2d3a)); [-1,1].forEach(s=>box(.28,4.4,.28,lx+s*1.7,2.2,lz-1.2,Lm(0xd9b400)));
    box(3.2,.16,5.2,lx,1.5,lz,Lm(0x4a4f60)); box(2.1,.6,4.5,lx,2.1,lz,Lm(col)); box(1.8,.55,2.3,lx,2.68,lz+.2,Lm(0x16324a));
    const wg=new THREE.CylinderGeometry(.36,.36,.26,14); [[-1.05,1.4],[1.05,1.4],[-1.05,-1.4],[1.05,-1.4]].forEach(w=>{ const m=new THREE.Mesh(wg,Lm(0x111115)); m.rotation.x=Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(lx+w[0],1.85,lz+w[1]); sc.add(m); });
    obb(lx-2,lx+2,lz-3.4,lz+3.4); };
  lift(-26.5,19,0xd0202a); lift(26.5,19,0x2a6fd0);
  /* établis et outils */
  const bench=(bx,bz)=>{ box(3.4,.12,1.2,bx,1,bz,Lm(0x8a6a3a)); [-1.5,1.5].forEach(s=>box(.12,1,1.0,bx+s,.5,bz,Lm(0x3a3d4a))); box(.9,.4,.5,bx-.9,1.32,bz,Lm(0xc02020)); box(.3,.3,.3,bx+1,1.2,bz,Lm(0xa0a6b0)); box(.12,.5,.12,bx+.2,1.3,bz,Lm(0xfcee0a)); obb(bx-1.8,bx+1.8,bz-.7,bz+.7); };
  bench(-10,24.8); bench(10,24.8);
  /* étagères */
  [-1,1].forEach(s=>{ const sx=s*34.8; [.5,1.4,2.3].forEach(y=>box(.7,.07,5,sx,y,19,Lm(0x555a70))); [-2.4,2.4].forEach(dz=>box(.08,2.5,.08,sx,1.25,19+dz,Lm(0x555a70)));
    [0,1,2].forEach(r=>[0,1,2,3].forEach(c=>box(.5,.4,.8,sx,.75+r*.9,17.2+c*1.2,Lm([0xff5fa8,0x3cff9e,0x00b8d4,0xfcee0a][(r+c)%4])))); obb(sx-.6,sx+.6,16.5,21.5); });
  /* panneaux muraux : outils et affiches */
  const peg=ctex(512,256,(x,W,H)=>{ x.fillStyle='#262a3e'; x.fillRect(0,0,W,H); x.strokeStyle='#33385a'; for(let i=0;i<W;i+=16){ x.beginPath(); x.moveTo(i,0); x.lineTo(i,H); x.stroke(); }
    for(let i=0;i<7;i++){ const px=30+i*68; x.fillStyle=['#c0c6d0','#d9b400','#d0202a','#00b8d4'][i%4]; x.fillRect(px,40,14,110); x.beginPath(); x.arc(px+7,40,20,0,7); x.fill(); x.fillStyle='#111'; x.beginPath(); x.arc(px+7,40,9,0,7); x.fill(); x.fillStyle='#8a6a3a'; x.fillRect(px+22,160,10,70); x.fillStyle='#c0c6d0'; x.fillRect(px+10,150,34,16); } });
  const pm=new THREE.MeshBasicMaterial({map:peg}); flat(7,3.4,-HX+.35,3.2,3.5,Math.PI/2,pm); flat(7,3.4,HX-.35,3.2,3.5,-Math.PI/2,pm); flat(7,3.4,-24,3.2,HZ-.35,Math.PI,pm); flat(7,3.4,24,3.2,HZ-.35,Math.PI,pm);
  const pos=ctex(256,360,(x,W,H)=>{ const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#2b0a5a'); g.addColorStop(1,'#ff2bd6'); x.fillStyle=g; x.fillRect(0,0,W,H); x.fillStyle='#00E5FF'; x.beginPath(); x.arc(W/2,120,60,0,7); x.fill(); x.fillStyle='#07051a'; x.fillRect(30,230,W-60,46); x.fillRect(60,250,W-120,60); x.fillStyle='#fff'; x.font='700 34px sans-serif'; x.textAlign='center'; x.fillText('ROUILLE',W/2,60); x.fillText('& GLOIRE',W/2,350); });
  const pm2=new THREE.MeshBasicMaterial({map:pos}); [-8,-16,-22].forEach(z=>{ flat(2.6,3.6,-HX+.35,4.3,z,Math.PI/2,pm2); flat(2.6,3.6,HX-.35,4.3,z,-Math.PI/2,pm2); });
  /* grande porte de piste */
  const dr=ctex(256,256,(x,W,H)=>{ x.fillStyle='#2a2d46'; x.fillRect(0,0,W,H); for(let i=0;i<8;i++){ x.fillStyle=i%2?'#343857':'#2a2d46'; x.fillRect(0,i*32,W,30); x.fillStyle='#1a1c30'; x.fillRect(0,i*32+30,W,2); } });
  flat(12,7,0,3.6,HZ-.35,Math.PI,new THREE.MeshBasicMaterial({map:dr})); box(12.6,.3,.3,0,7.2,HZ-.5,neon(0x3CFF9E)); [-6.3,6.3].forEach(s=>box(.3,7.2,.3,s,3.6,HZ-.5,neon(0x3CFF9E)));
  const dl=labelSprite('PISTE D’ESSAI','#3CFF9E',9); dl.material.depthTest=false; dl.renderOrder=20; dl.position.set(0,8.2,HZ-1); sc.add(dl);
  /* bancs au centre */
  [[-9,3],[9,3]].forEach(a=>{ box(3,.14,.9,a[0],.5,a[1],Lm(0x8a6a3a)); box(3,.8,.1,a[0],.95,a[1]-.4,Lm(0x6a4a2a)); [-1.2,1.2].forEach(s=>box(.1,.5,.8,a[0]+s,.25,a[1],Lm(0x23265a))); obb(a[0]-1.6,a[0]+1.6,a[1]-.6,a[1]+.6); });
  /* suspensions lumineuses */
  const lg=new THREE.ConeGeometry(.9,.6,18,1,true); const lamps=[]; for(let i=-3;i<=3;i++) for(let j=-1;j<=1;j++) lamps.push([i*10,9.9,j*14]);
  const lm=hubInst(sc,lg,new THREE.MeshBasicMaterial({color:0xffe9b0,side:THREE.DoubleSide}),lamps);
}

/* mode paysage obligatoire dans le garage */
function rotNow(on){
  try{ if(window.RGNative&&RGNative.setLandscape){ RGNative.setLandscape(on); return true; } }catch(_){}
  try{ const d=document.documentElement; const go=()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock(on?'landscape':'portrait').catch(()=>{});
    if(on&&!document.fullscreenElement&&d.requestFullscreen) d.requestFullscreen().then(go).catch(go); else go(); }catch(_){}
  return false;
}
ACT.rotok=()=>{ const ok=rotNow(true); const m=document.getElementById('rotmsg'); if(m) m.textContent=ok?'Rotation demandée…':'Ton application Android n’est pas à jour (ancienne version installée). Désinstalle-la puis réinstalle l’APK du dernier téléchargement.'; };
let hubWas=false;
function hubMode(){
  const on=view==='hub'; document.body.classList.toggle('hubmode',on);
  if(on!==hubWas){ hubWas=on; rotNow(on); if(!on){ try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(_){} } }
  let o=document.getElementById('rotov');
  if(!o){ o=document.createElement('div'); o.id='rotov'; o.innerHTML='<div><div style="font-size:54px">📱↻</div><p>Tourne ton téléphone en mode paysage pour entrer dans le garage.</p><p id="rotmsg" style="font-size:13px;color:#FF8BEA"></p><button class="btn" data-a="rotok" style="min-width:140px">OK</button><br><button class="btn alt" data-a="tab" data-id="garage">← Retour</button></div>'; document.body.appendChild(o); }
}
