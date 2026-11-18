/* ===== v0.22 : hangar / ranch 3D, plots à poser, arrosoir, interactions ===== */
const GROW={atelier:{bx:29,bz:19,spawn:{x:26,z:-14,yaw:Math.PI/2},cols:[-18,-6,6,18],rows:[-9,3,14],out:false},
            ranch:{bx:33,bz:29,spawn:{x:0,z:21,yaw:0},cols:[-20,-12,-4,4,12,20],rows:[-17,-9,-1,7],out:true}};
let GC=null; /* géométries et matériaux partagés */
function growCache(){
  if(GC) return GC; const D=THREE.DoubleSide;
  const leafT=ctex(128,128,(x,W,H)=>{ x.translate(64,122); x.fillStyle='#fff'; const L=[[0,92,17,9],[28,74,15,8],[-28,74,15,8],[58,56,12,7],[-58,56,12,7],[88,36,9,5],[-88,36,9,5]];
    L.forEach(d=>{ x.save(); x.rotate(d[0]*Math.PI/180); x.beginPath(); x.moveTo(0,0); const n=d[3]*2,len=d[1],wd=d[2];
      for(let i=1;i<=n;i++){ const t=i/n, w=(wd/2)*Math.sin(Math.PI*Math.pow(t,.72))*(i%2?.62:1); x.lineTo(w,-len*t); } x.lineTo(0,-len-3);
      for(let i=n;i>=1;i--){ const t=i/n, w=(wd/2)*Math.sin(Math.PI*Math.pow(t,.72))*(i%2?.62:1); x.lineTo(-w,-len*t); } x.closePath(); x.fill();
      x.strokeStyle='rgba(0,0,0,.35)'; x.lineWidth=1.4; x.beginPath(); x.moveTo(0,0); x.lineTo(0,-len*.85); x.stroke(); x.restore(); }); });
  const glowT=ctex(64,64,(x,W,H)=>{ const g=x.createRadialGradient(32,32,2,32,32,32); g.addColorStop(0,'rgba(255,230,130,.95)'); g.addColorStop(1,'rgba(255,200,80,0)'); x.fillStyle=g; x.fillRect(0,0,W,H); });
  const leafG=new THREE.PlaneGeometry(1,1); leafG.translate(0,.5,0);
  const lm=c=>new THREE.MeshLambertMaterial({map:leafT,color:c,transparent:true,alphaTest:.35,side:D});
  GC={leafG,stem:(()=>{ const g=new THREE.CylinderGeometry(.045,.07,1,6); g.translate(0,.5,0); return g; })(),bud:new THREE.SphereGeometry(1,8,6),pist:new THREE.SphereGeometry(.2,4,3),
    glowM:new THREE.SpriteMaterial({map:glowT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),
    leaf:{ind:lm(0x1f9d55),sat:lm(0x7bd93a),hyb:lm(0x3cc46a),pur:lm(0x7a55d6),dead:lm(0x7a6032)},
    stemM:new THREE.MeshLambertMaterial({color:0x2a8a46}),stemD:new THREE.MeshLambertMaterial({color:0x6b4f2a}),
    budM:new THREE.MeshLambertMaterial({color:0xa6e02e}),budP:new THREE.MeshLambertMaterial({color:0xb36cf0}),pistM:new THREE.MeshBasicMaterial({color:0xff9a1a}),
    mold:new THREE.MeshBasicMaterial({color:0xf0f0f8}),mite:new THREE.MeshBasicMaterial({color:0xff3d3d}),
    soil:{terreau:new THREE.MeshLambertMaterial({color:0x4a2f1d}),coco:new THREE.MeshLambertMaterial({color:0x9a6a38}),hydro:new THREE.MeshBasicMaterial({color:0x2a8ae0})},
    bed:new THREE.MeshLambertMaterial({color:0x23262e}),bedE:new THREE.MeshBasicMaterial({color:0x3cff9e}),
    ring:{empty:new THREE.MeshBasicMaterial({color:0x4a4f80,transparent:true,opacity:.7,side:D}),ok:new THREE.MeshBasicMaterial({color:0x00e5ff,transparent:true,opacity:.8,side:D}),ready:new THREE.MeshBasicMaterial({color:0x3cff9e,transparent:true,opacity:.95,side:D}),sick:new THREE.MeshBasicMaterial({color:0xff4d6d,transparent:true,opacity:.95,side:D}),ghost:new THREE.MeshBasicMaterial({color:0xfcee0a,transparent:true,opacity:.55,side:D})}};
  return GC;
}
function plant3D(sl,pc){
  const C=growCache(), g=new THREE.Group(), sv=SID[sl.sid], pu=!!PURP[sl.sid], lm=sl.st==='dead'?C.leaf.dead:pu?C.leaf.pur:sv.ty==='Sativa'?C.leaf.sat:sv.ty==='Indica'?C.leaf.ind:C.leaf.hyb, p=pc/100;
  const stem=(h)=>{ const s=new THREE.Mesh(C.stem,sl.st==='dead'?C.stemD:C.stemM); s.scale.set(1,h,1); g.add(s); };
  const leaf=(y,ang,size,tilt)=>{ const pv=new THREE.Group(); pv.position.y=y; pv.rotation.y=ang; const m=new THREE.Mesh(C.leafG,lm); m.scale.set(size,size,size); m.rotation.x=tilt; m.position.z=.02; pv.add(m); g.add(pv); };
  if(sl.st==='germ'){ stem(.15+p*.2); leaf(.2+p*.2,0,.28+p*.2,.9); leaf(.2+p*.2,Math.PI,.28+p*.2,.9); }
  else if(sl.st==='dead'){ stem(1); [0,1.7,3.4,5].forEach((a,i)=>leaf(.35+i*.18,a,.7,1.5)); }
  else{
    const h=sl.st==='veg'?.5+p*1.5:2.1, n=sl.st==='veg'?3+Math.floor(p*3):5, sz=sl.st==='veg'?.55+p*.55:.85;
    stem(h); for(let i=0;i<n;i++){ const f=(i+1)/(n+1), y=h*f; for(let k=0;k<3;k++) leaf(y,i*1.1+k*2.1,sz*(1.15-f*.35),.95+f*.2); }
    leaf(h,0,sz*.8,.25);
    if(sl.st==='flo'||sl.st==='ready'){ const rd=sl.st==='ready', r=rd?.2:.07+p*.12, bm=pu?C.budP:C.budM;
      [[0,h+.05,0,1.4],[.3,h*.72,0,.8],[-.3,h*.72,.1,.8],[.1,h*.5,.3,.65],[-.12,h*.5,-.3,.65],[.28,h*.88,-.1,.7],[-.25,h*.9,.1,.7]].forEach(b=>{ const m=new THREE.Mesh(C.bud,bm); m.scale.set(r*b[3],r*b[3]*1.35,r*b[3]); m.position.set(b[0],b[1],b[2]); g.add(m);
        for(let q=0;q<3;q++){ const ps=new THREE.Mesh(C.pist,C.pistM); ps.position.set(b[0]+Math.cos(q*2.4)*r*b[3]*.8,b[1]+Math.sin(q*1.7)*r*b[3]*.8,b[2]+Math.sin(q*2.4)*r*b[3]*.8); g.add(ps); }
        if(rd){ const sp=new THREE.Sprite(C.glowM); sp.scale.set(r*b[3]*4,r*b[3]*4,1); sp.position.set(b[0],b[1],b[2]); g.add(sp); } }); }
  }
  if(sl.pest){ for(let i=0;i<9;i++){ const m=new THREE.Mesh(C.bud,sl.pest==='mold'?C.mold:C.mite); m.scale.setScalar(.045); m.position.set(Math.cos(i*2.3)*.5,.4+i*.18,Math.sin(i*2.3)*.5); g.add(m); } }
  return g;
}
const LAMPC={t5:0xe8f4ff,led:0xffffff,led2:0xd69bff,cmh:0xffd9a0,hps:0xffa24a,ledp:0xff6af0};
function growPlots(room){
  const G=GROW[room], F=farm(), R=F.rooms[room], C=growCache(), grp=new THREE.Group(), pts=[]; HUB.plots=[];
  G.rows.forEach(z=>G.cols.forEach(x=>pts.push([x,z])));
  const max=ROOMS[room].max;
  pts.slice(0,max).forEach((q,i)=>{
    const [x,z]=q, sl=R.slots[i], pg=new THREE.Group(); pg.position.set(x,0,z); grp.add(pg);
    const own=i<R.slots.length, free=i===R.slots.length;
    let st='empty'; if(sl){ st=sl.st==='ready'?'ready':sl.pest?'sick':'ok'; }
    const ring=new THREE.Mesh(new THREE.RingGeometry(1.45,1.62,28),own?C.ring[st]:C.ring[free?'ghost':'empty']); ring.rotation.x=-Math.PI/2; ring.position.y=.03; pg.add(ring); pg.userData.ring=ring;
    if(own){ const bed=new THREE.Mesh(new THREE.BoxGeometry(2,.5,2),C.bed); bed.position.y=.25; pg.add(bed);
      const top=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.8),C.soil[sl?sl.med:'terreau']); top.rotation.x=-Math.PI/2; top.position.y=.51; pg.add(top);
      const e=new THREE.Mesh(new THREE.BoxGeometry(2.04,.05,2.04),C.bedE); e.position.y=.5; e.scale.set(1,1,1); pg.add(e);
      if(sl){ const sv=SID[sl.sid], pc=sl.st==='ready'?100:Math.round(nz(sl.stAge/({germ:1,veg:sv.veg,flo:sv.fl}[sl.st]||1)*100,100));
      const pl=plant3D(sl,pc); pl.position.y=.5; pl.userData.sway=i; pg.add(pl); pg.userData.plant=pl; }
      if(!ROOMS[room].out&&sl&&sl.lamp){ const lc=LAMPC[sl.lamp]||0xffffff, hy=6.4;
        const cab=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,4.6,4),new THREE.MeshBasicMaterial({color:0x333344})); cab.position.y=hy+2.3; pg.add(cab);
        const shade=new THREE.Mesh(new THREE.BoxGeometry(sl.lamp==='t5'?2.2:1.7,.16,sl.lamp==='t5'?.35:1.7),new THREE.MeshBasicMaterial({color:lc})); shade.position.y=hy; pg.add(shade);
        const cone=new THREE.Mesh(new THREE.CylinderGeometry(.5,1.7,hy-.55,16,1,true),new THREE.MeshBasicMaterial({color:lc,transparent:true,opacity:.07+LID[sl.lamp].lm/1200000,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); cone.position.y=(hy-.55)/2+.55; pg.add(cone); }
    }else{ const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({color:free?0xfcee0a:0x2b2f60,transparent:true,opacity:free?.14:.07,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.y=.04; pg.add(m);
      if(free){ const lb=hubLabel('＋ Poser un plot','#FCEE0A',4,x,z); lb.position.set(x,1.4,z); pg.add(lb); HUB.labels.push(lb); } }
    HUB.plots.push({i,x,z,pg});
  });
  return grp;
}
function growSig(room){ const R=farm().rooms[room]; return room+R.slots.length+R.slots.map(s=>!s?'-':s.sid+s.st+Math.floor(s.stAge*1.7)+(s.pest||'')+(s.lamp||'')+s.med+Math.floor(s.hp/25)).join('|'); }
function growBuild(room){
  const G=GROW[room], out=G.out, F=farm(); HUB.labels=[]; HUB.obs=[]; HUB.pois=[]; HUB.bx=G.bx; HUB.bz=G.bz; HUB.ents={npcs:[],pods:[]}; HUB.map=room;
  const sc=new THREE.Scene(), cam=new THREE.PerspectiveCamera(100,1.5,.1,320);
  const bg=out?0x2a1a4a:0x06120f; sc.background=new THREE.Color(bg); sc.fog=new THREE.Fog(bg,out?60:50,out?170:120);
  sc.add(new THREE.HemisphereLight(out?0xfff0d0:0xb8ffd8,out?0x3a2a5a:0x2a0a4a,out?1.5:1.25)); const dl=new THREE.DirectionalLight(out?0xffe2a8:0xff9af0,out?1.1:.45); dl.position.set(-20,50,30); sc.add(dl);
  const neon=c=>new THREE.MeshBasicMaterial({color:c}), L=c=>new THREE.MeshLambertMaterial({color:c});
  const box=(w,h,d,x,y,z,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); sc.add(m); return m; };
  const BX=G.bx+1, BZ=G.bz+1;
  const gt=ctex(256,256,(x,W,H)=>{ if(out){ x.fillStyle='#1d4a2a'; x.fillRect(0,0,W,H); for(let i=0;i<1200;i++){ x.fillStyle=`rgba(${40+Math.random()*60|0},${110+Math.random()*80|0},${50+Math.random()*50|0},.5)`; x.fillRect(Math.random()*W,Math.random()*H,2,5); } }
    else{ x.fillStyle='#161a22'; x.fillRect(0,0,W,H); for(let i=0;i<700;i++){ x.fillStyle=`rgba(150,170,190,${.03+Math.random()*.05})`; x.fillRect(Math.random()*W,Math.random()*H,2,2); } x.strokeStyle='rgba(60,255,158,.18)'; x.lineWidth=2; x.strokeRect(1,1,W-2,H-2); x.strokeStyle='rgba(255,43,214,.1)'; x.beginPath(); x.moveTo(W/2,0); x.lineTo(W/2,H); x.moveTo(0,H/2); x.lineTo(W,H/2); x.stroke(); } },[BX*2/8,BZ*2/8]);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(BX*2+(out?160:0),BZ*2+(out?160:0)),new THREE.MeshLambertMaterial({map:gt})); fl.rotation.x=-Math.PI/2; sc.add(fl);
  if(!out){
    const wt=ctex(128,128,(x,W,H)=>{ x.fillStyle='#202a2c'; x.fillRect(0,0,W,H); for(let i=0;i<W;i+=8){ x.fillStyle=i%16?'#273234':'#1a2224'; x.fillRect(i,0,6,H); } },[BX/4,1.6]);
    const wm=new THREE.MeshLambertMaterial({map:wt}), HH=12;
    box(BX*2+1,HH,.6,0,HH/2,-BZ-.3,wm); box(BX*2+1,HH,.6,0,HH/2,BZ+.3,wm); box(.6,HH,BZ*2,-BX-.3,HH/2,0,wm); box(.6,HH,BZ*2,BX+.3,HH/2,0,wm);
    const ce=new THREE.Mesh(new THREE.PlaneGeometry(BX*2,BZ*2),new THREE.MeshBasicMaterial({color:0x07100e,side:THREE.DoubleSide})); ce.rotation.x=Math.PI/2; ce.position.y=HH; sc.add(ce);
    for(let i=-4;i<=4;i++) box(BX*2,.35,.35,0,HH-.3,i*5,L(0x2a3438)); for(let i=-5;i<=5;i++) box(.35,.35,BZ*2,i*6,HH-.7,0,L(0x2a3438));
    [[BX*2,.14,.08,0,3,-BZ+.1,0x3cff9e],[BX*2,.14,.08,0,3,BZ-.1,0xff2bd6],[.08,.14,BZ*2,-BX+.1,3,0,0x3cff9e],[.08,.14,BZ*2,BX-.1,3,0,0xff2bd6]].forEach(a=>box(a[0],a[1],a[2],a[3],a[4],a[5],neon(a[6])));
    for(let i=-2;i<=2;i++) [-1,1].forEach(s=>box(.9,.07,10,i*11,HH-.9,s*8,neon(0xe8fff4)));
    [-1,1].forEach(s=>[0,1,2].forEach(k=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,BX*2,10),L(0x3a4650)); p.rotation.z=Math.PI/2; p.position.set(0,2.4+k*.9,s*(BZ-.5)); sc.add(p); })); /* tuyaux */
    HUB.fans=[]; [[-12,-BZ+.4],[12,-BZ+.4]].forEach(a=>{ const f=new THREE.Group(); f.position.set(a[0],7.5,a[1]); [0,1,2,3].forEach(k=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(2.6,.06,.5),L(0x8a949c)); b.rotation.z=k*Math.PI/2; b.position.z=.1; f.add(b); }); const ring=new THREE.Mesh(new THREE.TorusGeometry(1.5,.12,6,20),L(0x3a4650)); f.add(ring); sc.add(f); HUB.fans.push(f); });
    /* DA rasta-psyché : bandes néon + posters mandala + enseignes */
    [[0xff2d2d,3.6],[0xffd400,4.0],[0x1fe06a,4.4]].forEach(a=>{ box(BX*2,.16,.08,0,a[1],-BZ+.12,neon(a[0])); box(.08,.16,BZ*2,BX-.12,a[1],0,neon(a[0])); });
    const mand=(c1,c2)=>ctex(256,256,(x,W,H)=>{ x.fillStyle='#0a0418'; x.fillRect(0,0,W,H); x.translate(128,128); for(let r=0;r<9;r++){ for(let k=0;k<14;k++){ x.save(); x.rotate(k/14*6.283+r*.12); x.fillStyle=`hsl(${(r*40+k*12+c1)%360},95%,${52+r*2}%)`; x.globalAlpha=.9; x.beginPath(); x.ellipse(0,-(18+r*12),7+r*.8,13+r*1.2,0,0,6.283); x.fill(); x.restore(); } } x.globalAlpha=1; x.fillStyle=c2; x.beginPath(); x.arc(0,0,14,0,6.283); x.fill(); x.fillStyle='#0a0418'; x.font='bold 22px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('🌿',0,1); x.setTransform(1,0,0,1,0,0); x.strokeStyle='#ffd400'; x.lineWidth=6; x.strokeRect(3,3,W-6,H-6); });
    [[-18,0,'#ffd400'],[18,140,'#1fe06a']].forEach(a=>{ const pm=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshBasicMaterial({map:mand(a[1],a[2])})); pm.position.set(a[0],6.6,-BZ+.35); sc.add(pm); });
    const ol=labelSprite('ONE LOVE · IRIE','#FFD400',18); ol.position.set(0,6.6,-BZ+.5); ol.material.depthTest=false; ol.renderOrder=19; sc.add(ol);
    const ban=labelSprite('SERRE · HIGH & ROUILLÉ','#3CFF9E',26); ban.position.set(0,9.2,-BZ+1); ban.material.depthTest=false; ban.renderOrder=20; sc.add(ban);
  }else{
    for(let i=-BX;i<=BX;i+=4){ box(.25,2,.25,i,1,-BZ,L(0x6a4a2a)); box(.25,2,.25,i,1,BZ,L(0x6a4a2a)); } for(let i=-BZ;i<=BZ;i+=4){ box(.25,2,.25,-BX,1,i,L(0x6a4a2a)); box(.25,2,.25,BX,1,i,L(0x6a4a2a)); }
    [[BX*2,.18,.12,0,1.5,-BZ],[BX*2,.18,.12,0,1.5,BZ],[.12,.18,BZ*2,-BX,1.5,0],[.12,.18,BZ*2,BX,1.5,0]].forEach(a=>box(a[0],a[1],a[2],a[3],a[4],a[5],L(0x8a6a3a)));
    box(14,8,10,-24,4,-BZ-9,L(0x8a2a22)); box(15,.6,11,-24,8.4,-BZ-9,L(0x3a2a2a)); /* grange */
    for(let i=0;i<18;i++){ const a=i/18*6.28, t=new THREE.Mesh(new THREE.ConeGeometry(3,9,7),L(0x14502a)); t.position.set(Math.cos(a)*(BX+22),4.5,Math.sin(a)*(BZ+22)); sc.add(t); }
    const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:growCache().glowM.map,color:0xffd36a,fog:false})); sun.scale.set(80,80,1); sun.position.set(-60,70,-150); sc.add(sun);
  }
  /* décor + points d'interaction */
  const poi=(id,x,z,r,title,btns)=>HUB.pois.push({id,x,z,r,title,btns});
  const wall=out?BZ:BZ;
  if(!out){
    /* citerne + robinet */
    const tk=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,3.4,16),new THREE.MeshLambertMaterial({color:0x2a7ad0})); tk.position.set(-24,1.7,-BZ+2); sc.add(tk); box(.3,2.6,.3,-22.2,3.2,-BZ+2,L(0x9aa4ac)); box(1,.2,.2,-21.8,4.3,-BZ+2,L(0x9aa4ac)); box(3.5,.02,2.5,-22,.02,-BZ+4.5,neon(0x1d5aa0)); HUB.obs.push({x:-24,z:-BZ+2,r:1.9});
    const tl=hubLabel('💧 EAU','#4aa8ff',5,-24,-BZ+2); tl.position.set(-24,5,-BZ+2); sc.add(tl);
    poi('tap',-23,-BZ+5,3.6,()=>`💧 Point d’eau · arrosoir ${F.can||0}/6 · citerne ${Math.round(F.water)}/${F.tank} L`,()=>[{id:'can',tx:'🪣 Remplir l’arrosoir'},{id:'tank',tx:'🛢️ Remplir la citerne',alt:1}]);
    /* étagère engrais */
    [.5,1.5,2.5].forEach(y=>box(6,.1,1,-8,y,-BZ+1,L(0x4a5660))); [[0x3cff9e],[0xff9a1a],[0xa58bff],[0x4aa8ff],[0xff4d6d]].forEach((c,i)=>{ for(let k=0;k<3;k++){ box(.5,.9,.5,-10+i*1.4+(k%2)*.05,.95+k*1,-BZ+1,neon(c[0])); box(.2,.25,.2,-10+i*1.4,1.5+k*1,-BZ+1,L(0xdddddd)); } });
    const sl=hubLabel('🛒 BOUTIQUE','#FCEE0A',6,-8,-BZ+1); sl.position.set(-8,4.6,-BZ+1); sc.add(sl); HUB.obs.push({x0:-11.2,x1:-4.8,z0:-BZ,z1:-BZ+2});
    poi('shop',-8,-BZ+4,3.8,()=>'🛒 Boutique du réseau',()=>[{id:'shop',tx:'Graines, engrais, lampes'},{id:'seeds',tx:'🌱 Graines',alt:1}]);
    /* bureau / ordinateur */
    box(5,.15,2,10,1,-BZ+1.5,L(0x2a3438)); [-2.2,2.2].forEach(s=>box(.15,1,1.8,10+s,.5,-BZ+1.5,L(0x2a3438))); box(2.4,1.5,.15,10,2.1,-BZ+.8,neon(0x00e5ff)); box(2.6,1.7,.1,10,2.1,-BZ+.7,L(0x111118)); HUB.obs.push({x0:7.4,x1:12.6,z0:-BZ,z1:-BZ+2.6});
    const nl=hubLabel('🚗 RÉSEAU','#00E5FF',6,10,-BZ+1); nl.position.set(10,4.4,-BZ+1); sc.add(nl);
    poi('net',10,-BZ+4,3.8,()=>'🚗 Terminal du réseau',()=>[{id:'net',tx:'Missions & karma'},{id:'stock',tx:'🫙 Stock & vente',alt:1}]);
    /* séchoir */
    for(let i=0;i<3;i++){ box(.1,3.6,.1,20+i*2.2,1.8,-BZ+1.2,L(0x4a5660)); } box(5,.1,.1,22.2,3.5,-BZ+1.2,L(0x4a5660));
    (F.dry||[]).slice(0,8).forEach((b,i)=>{ const m=new THREE.Mesh(growCache().bud,PURP[b.sid]?growCache().budP:growCache().budM); m.scale.set(.25,.4,.25); m.position.set(20.2+i*.55,3,-BZ+1.2); sc.add(m); });
    const dl2=hubLabel('SÉCHOIR','#FF9A1A',5,22,-BZ+1); dl2.position.set(22,4.6,-BZ+1); sc.add(dl2);
    /* portes */
    const door=(x,z,rot,col,txt)=>{ box(rot?.5:4,6,rot?4:.5,x,3,z,L(0x1a1f24)); box(rot?.6:4.4,.25,rot?4.4:.6,x,6.1,z,neon(col)); const d=hubLabel(txt,'#'+col.toString(16).padStart(6,'0'),6,x,z); d.position.set(x,7.2,z); sc.add(d); };
    door(BX-.5,-14,1,0x3cff9e,'↩ GARAGE'); door(-BX+.5,2,1,0xfcee0a,'🌾 RANCH');
    poi('exit',BX-3.5,-14,3.6,()=>'Cloison du garage',()=>[{id:'exit',tx:'↩ Retourner au garage'}]);
    poi('ranch',-BX+3.5,2,3.6,()=>'🌾 Porte du ranch',()=>[{id:'ranch',tx:F.rooms.ranch.on?'Aller au ranch':'Le ranch (à acheter)'}]);
    /* flèches au sol */
    const chev=ctex(64,64,(x,W,H)=>{ x.strokeStyle='#3cff9e'; x.lineWidth=7; x.lineCap='round'; x.beginPath(); x.moveTo(14,12); x.lineTo(46,32); x.lineTo(14,52); x.stroke(); });
    [[0,-4.5,Math.PI/2,52,2.2]].forEach(a=>{ const t=chev.clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(a[3]/2.4,1); const m=new THREE.Mesh(new THREE.PlaneGeometry(a[3],a[4]),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.55,depthWrite:false})); m.rotation.order='YXZ'; m.rotation.set(-Math.PI/2,0,0); m.position.set(0,.035,a[1]+1.4); sc.add(m); });
  }else{
    const wl=hubLabel('💧 PUITS','#4aa8ff',5,-28,-24); wl.position.set(-28,4.6,-24); sc.add(wl); const wm=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.6,1.2,14),L(0x6a6a72)); wm.position.set(-28,.6,-24); sc.add(wm); box(.2,3,.2,-29.3,2.4,-24,L(0x6a4a2a)); box(.2,3,.2,-26.7,2.4,-24,L(0x6a4a2a)); box(3.2,.2,.9,-28,4,-24,L(0x8a2a22)); HUB.obs.push({x:-28,z:-24,r:2});
    poi('tap',-28,-21,3.8,()=>`💧 Puits · arrosoir ${F.can||0}/6 · citerne ${Math.round(F.water)}/${F.tank} L`,()=>[{id:'can',tx:'🪣 Remplir l’arrosoir'},{id:'tank',tx:'🛢️ Remplir la citerne',alt:1}]);
    const gl=hubLabel('🛒 GRANGE','#FCEE0A',6,-24,-BZ-3); gl.position.set(-24,10,-BZ-3); sc.add(gl);
    poi('shop',-24,-BZ+3,4,()=>'🛒 Grange du ranch',()=>[{id:'shop',tx:'Graines, engrais, lampes'}]);
    box(5,.15,2,26,1,-24,L(0x4a3a2a)); box(2.4,1.5,.15,26,2.1,-24.6,neon(0x00e5ff)); const nl=hubLabel('🚗 RÉSEAU','#00E5FF',6,26,-24); nl.position.set(26,4.4,-24); sc.add(nl); HUB.obs.push({x0:23.4,x1:28.6,z0:-25.2,z1:-22.8});
    poi('net',26,-21,3.8,()=>'🚗 Terminal du réseau',()=>[{id:'net',tx:'Missions & karma'},{id:'stock',tx:'🫙 Stock & vente',alt:1}]);
    poi('exit',0,BZ-2,4,()=>'Portail du ranch',()=>[{id:'back',tx:'↩ Retour à l’atelier'}]);
    box(6,3,.3,-3.5,1.5,BZ,L(0x6a4a2a)); box(6,3,.3,3.5,1.5,BZ,L(0x6a4a2a)); const bl=hubLabel('↩ ATELIER','#3CFF9E',6,0,BZ); bl.position.set(0,5,BZ); sc.add(bl);
  }
  /* plots dynamiques */
  HUB.plotGroup=growPlots(room); sc.add(HUB.plotGroup); HUB.gsig=growSig(room); HUB.gAcc=0;
  /* un POI par plot (recalculés à la volée) */
  HUB.scene=sc; HUB.cam=cam; HUB.pos={x:G.spawn.x,z:G.spawn.z}; HUB.yaw=G.spawn.yaw; HUB.pit=0;
}
function plotPoi(room,pl){
  const F=farm(), R=F.rooms[room], sl=R.slots[pl.i], free=pl.i===R.slots.length;
  if(pl.i>R.slots.length) return null;
  if(!sl&&!free) return {id:'plot'+pl.i,title:()=>`🪴 Plot n° ${pl.i+1} · vide`,btns:()=>[{id:'open',tx:'🌱 Planter'}]};
  if(free) return {id:'plot'+pl.i,title:()=>`＋ Nouveau plot (n° ${pl.i+1})`,btns:()=>[{id:'place',tx:`Poser un plot · ${fmt(1500+R.slots.length*900)} cr`}]};
  const sv=SID[sl.sid], lab={germ:'Germination',veg:'Croissance',flo:'Floraison',ready:'Prête',dead:'Morte'}[sl.st], pcf=()=>{ if(sl.st==='ready') return 100; const v=Math.round(nz((sl.stAge||0)/(({germ:1,veg:sv.veg,flo:sv.fl}[sl.st])||1)*100,100)); return isFinite(v)?v:0; };
  return {id:'plot'+pl.i,title:()=>`${sv.ic} ${sv.nom} · ${lab} ${sl.st==='ready'||sl.st==='dead'?'':pcf()+' %'} · eau ${Math.round(sl.w)} %${sl.pest?' · ⚠️':''}`,
    btns:()=>{ const b=[]; if(sl.st==='ready') b.push({id:'harvest',tx:'✂️ Récolter'}); else if(sl.st==='dead') b.push({id:'clear',tx:'Évacuer'}); else b.push({id:'water',tx:`💧 Arroser${(F.can||0)?` (${F.can})`:''}`}); b.push({id:'open',tx:'📋 Fiche',alt:1}); return b; }};
}
function growTick(dt){
  const H=HUB, room=H.map, F=farm(); H.gAcc+=dt;
  if(H.fans) H.fans.forEach(f=>{ f.rotation.z+=dt*6; });
  (H.plots||[]).forEach(pl=>{ const pg=pl.pg, p=pg.userData.plant; if(p){ p.rotation.z=Math.sin(H.t*1.3+pl.i)*.018; p.rotation.x=Math.cos(H.t*1.1+pl.i)*.015; } if(pg.userData.ring&&pg.userData.ring.material.opacity>.9) pg.userData.ring.material.opacity=.55+.4*Math.abs(Math.sin(H.t*3)); });
  if(H.gAcc>1.3){ H.gAcc=0; ranchSim(); const sg=growSig(room); if(sg!==H.gsig){ H.gsig=sg; const keep=H.labels.filter(l=>!(HUB.plotGroup&&HUB.plotGroup.children.some(c=>c.children.includes(l)))); H.labels=keep; H.scene.remove(H.plotGroup); H.plotGroup=growPlots(room); H.scene.add(H.plotGroup); }
    const gh=$('growhud'); if(gh){ const h=Math.round(F.heat[room]), kt=karmaTitle(); gh.innerHTML=`<span>💰 ${fmt(S.cr)}</span><span>🎟 ${fmt((S.arc&&S.arc.tk)||0)}</span><span>🪣 ${F.can||0}/6</span><span class="${h>60?'hot':''}">🚨 ${h}%</span><span>${kt[2]} ${Math.round(karma())}</span>`; } }
  /* POI le plus proche */
  const p=H.pos; let best=null, bd=1e9;
  (H.pois||[]).forEach(q=>{ const d=Math.hypot(p.x-q.x,p.z-q.z); if(d<q.r&&d<bd){ bd=d; best=q; } });
  (H.plots||[]).forEach(pl=>{ const d=Math.hypot(p.x-pl.x,p.z-(pl.z+(ROOMS[room].out?1.7:1.7))); if(d<3.3&&d<bd){ const q=plotPoi(room,pl); if(q){ bd=d; best=q; } } });
  H.gbest=best;
}
ACT.growgo=d=>{
  const F=farm(), room=HUB.map, id=d.id, v=d.v; RY.tab=room;
  if(id.startsWith('plot')){ const i=+id.slice(4), R=F.rooms[room], sl=R.slots[i];
    if(v==='place') return ACT.rbuyslot({id:room});
    if(v==='open'){ RY.slot=i; RY.pick=null; return openSheet({t:'ranch'}); }
    if(v==='water'){ ACT.rcare({id:String(i),v:'water'}); HUB.gsig=''; return; }
    if(v==='harvest'){ ACT.rharvest({id:String(i)}); HUB.gsig=''; return; }
    if(v==='clear'){ ACT.rclear({id:String(i)}); HUB.gsig=''; return; } return; }
  if(id==='tap'){ if(v==='can'){ if(F.water<3) return toast('Citerne vide : remplis-la'); const n=Math.min(6-(F.can||0),Math.floor(F.water/3)); if(n<=0) return toast('Arrosoir plein'); F.can=(F.can||0)+n; F.water-=n*3; toast('Arrosoir rempli : '+F.can+'/6'); save(); } else ACT.rwater(); return; }
  if(id==='shop'){ RY.tab='shop'; RY.shop=v==='seeds'?'seeds':RY.shop; RY.slot=null; return openSheet({t:'ranch'}); }
  if(id==='net'){ RY.tab=v==='stock'?'stock':'net'; RY.slot=null; return openSheet({t:'ranch'}); }
  if(id==='exit'){ if(v==='back') return growEnter('atelier'); return growExit(); }
  if(id==='ranch'){ if(F.rooms.ranch.on) return growEnter('ranch'); RY.tab='ranch'; RY.slot=null; return openSheet({t:'ranch'}); }
};
ACT.growexit=()=>growExit();
function growEnter(room){ HUB.map=room; HUB.sig=''; HUB.nkey=''; closeSheet(); render(); }
function growExit(){ HUB.map='garage'; HUB.sig=''; HUB.nkey=''; closeSheet(); render(); HUB.pos={x:31.4,z:-16}; HUB.yaw=Math.PI/2; HUB.pit=0; }
ACT.ranchSheet=function(){ rotNow(false); RY.rot=true; _ranch0(); };
ACT.ranch=function(){ const F=farm(); F.found=1; if(view==='hub'&&glEnsure()&&window.THREE){ growEnter('atelier'); } else ACT.ranchSheet(); };
function ranchLeft(){ $('sheet').classList.remove('rch'); if(RY.rot){ RY.rot=false; if(view==='hub') rotNow(true); } if(view==='hub'&&HUB.map&&HUB.map!=='garage') HUB.gsig=''; }
function hubBackA(){ return HUB.map&&HUB.map!=='garage'?'growexit':'tab'; }
