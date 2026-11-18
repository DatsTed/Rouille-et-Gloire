/* ===== v0.32 : deux univers — gestion (onglets) / Monde 3D (cartes à explorer) ===== */
(()=>{ const i=TABS.findIndex(t=>t[0]==='hub'); if(i>=0) TABS.splice(i,1); })();
const WORLD={
 beach:{nom:'Plage Irie',ic:'🏝️',bx:44,bz:30,spawn:{x:0,z:22,yaw:0},lvl:2},
 street:{nom:'Rue Néon',ic:'🌃',bx:58,bz:14.5,spawn:{x:50,z:0,yaw:-Math.PI/2},lvl:3}
};
const DEST=[
 {id:'garage',ic:'🏛️',nom:'Mon garage',d:'Tes voitures sur leurs podiums, les comptoirs du réseau.',ok:()=>true},
 {id:'atelier',ic:'🌿',nom:'Labo caché',d:'Plots, eau, lampes : ta culture.',ok:()=>!!farm().found,why:'Trouve la cloison dans le garage'},
 {id:'ranch',ic:'🌾',nom:'Ranch',d:'Grand champ en plein air (24 plots).',ok:()=>!!farm().rooms.ranch.on,why:'À acheter dans le labo'},
 {id:'beach',ic:'🏝️',nom:'Plage Irie',d:'Coucher de soleil, bar tiki, feu de camp, reggae et tes voitures sur le sable.',ok:()=>S.lvl>=2,why:'Niveau 2 requis'},
 {id:'street',ic:'🌃',nom:'Rue Néon',d:'Ruelle sous la pluie, tes voitures en vitrine, départ de course, kiosques.',ok:()=>S.lvl>=3,why:'Niveau 3 requis'}
];
/* ---------- matériaux & aides ---------- */
let WC=null;
function worldCache(){ if(WC) return WC; const D=THREE.DoubleSide;
  const frond=ctex(128,128,(x,W,H)=>{ x.translate(W/2,H); x.fillStyle='#fff'; x.strokeStyle='#fff'; x.lineWidth=3; x.beginPath(); x.moveTo(0,0); x.lineTo(0,-122); x.stroke();
    for(let i=1;i<18;i++){ const t=i/18, y=-t*118, len=40*(1-t*.65); [-1,1].forEach(s=>{ x.beginPath(); x.moveTo(0,y); x.lineTo(s*len,y+len*.55); x.lineTo(0,y+7); x.closePath(); x.fill(); }); } });
  const rasta=ctex(64,64,(x,W,H)=>{ x.fillStyle='#e22'; x.fillRect(0,0,W/3,H); x.fillStyle='#fc0'; x.fillRect(W/3,0,W/3,H); x.fillStyle='#1c6'; x.fillRect(2*W/3,0,W/3,H); },[3,1]);
  const flag=ctex(64,48,(x,W,H)=>{ x.fillStyle='#e22'; x.fillRect(0,0,W,H/3); x.fillStyle='#fc0'; x.fillRect(0,H/3,W,H/3); x.fillStyle='#1c6'; x.fillRect(0,2*H/3,W,H/3); });
  WC={frond:new THREE.MeshLambertMaterial({map:frond,color:0x2e9a46,transparent:true,alphaTest:.4,side:D}),
   trunk:new THREE.MeshLambertMaterial({color:0x8a6a42}),umb:new THREE.MeshLambertMaterial({map:rasta,side:D}),flag:new THREE.MeshBasicMaterial({map:flag,side:D}),
   fg:new THREE.PlaneGeometry(1.5,3.4).translate(0,1.7,0),tg:new THREE.CylinderGeometry(.2,.3,1,7)};
  return WC; }
function wNeon(c){ return new THREE.MeshBasicMaterial({color:c}); }
function wLamb(c){ return new THREE.MeshLambertMaterial({color:c}); }
function wGlow(col,s){ const m=growCache().glowM.clone(); m.color=new THREE.Color(col); const sp=new THREE.Sprite(m); sp.scale.set(s,s,1); return sp; }
function skyDome(sc,stops){ const t=ctex(8,256,(x,W,H)=>{ const g=x.createLinearGradient(0,0,0,H); stops.forEach(s=>g.addColorStop(s[0],s[1])); x.fillStyle=g; x.fillRect(0,0,W,H); }); t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  const m=new THREE.Mesh(new THREE.SphereGeometry(300,18,12),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,fog:false})); sc.add(m); return m; }
function parkCars(W,spots,rotY,label){ let list=((S.pod&&S.pod.slots)||[]).map(u=>u&&car(u)).filter(Boolean); if(!list.length) list=S.cars.slice(0,spots.length); list=list.slice(0,spots.length);
  list.forEach((c,i)=>{ const p=spots[i]; try{ const cg=buildCar(M[c.mid],'#00E5FF',carLook(c)); cg.g.position.set(p[0],p[2]||0,p[1]); cg.g.rotation.y=rotY; W.sc.add(cg.g);
    const ug=wGlow(0x00e5ff,7); ug.position.set(p[0],.3+(p[2]||0),p[1]); W.sc.add(ug); const lb=hubLabel(M[c.mid].nom,'#00E5FF',5,p[0],p[1]); lb.position.set(p[0],3.2+(p[2]||0),p[1]); W.sc.add(lb); W.obs.push({x:p[0],z:p[1],r:2.6}); }catch(e){} });
  return list.length; }
function palm(W,x,z,h,lean){ const C=worldCache(), g=new THREE.Group(); g.position.set(x,0,z); const n=6; let ox=0,oy=0;
  for(let i=0;i<n;i++){ const s=new THREE.Mesh(C.tg,C.trunk); s.scale.set(1-i*.08,h/n,1); s.position.set(ox,oy+h/n/2,0); s.rotation.z=-lean*.12; g.add(s); oy+=h/n*Math.cos(lean*.12*i); ox+=h/n*Math.sin(lean*.12)*(1); }
  const top=new THREE.Group(); top.position.set(ox,oy,0); g.add(top);
  for(let k=0;k<9;k++){ const pv=new THREE.Group(); pv.rotation.y=k/9*6.283+Math.random()*.3; const m=new THREE.Mesh(C.fg,C.frond); m.rotation.x=.9+(k%3)*.3; m.scale.setScalar(1.5+Math.random()*.4); pv.add(m); top.add(pv); }
  [[.18,.1],[-.15,.2],[.05,-.18]].forEach(c=>{ const co=new THREE.Mesh(new THREE.SphereGeometry(.22,6,5),new THREE.MeshLambertMaterial({color:0x5a3a1a})); co.position.set(c[0],-.2,c[1]); top.add(co); });
  W.sc.add(g); W.obs.push({x,z,r:.7}); (W.sway=W.sway||[]).push(top); return g; }
/* ---------- plage ---------- */
function buildBeach(W){
  const sc=W.sc; sc.background=new THREE.Color(0xff8b6a); sc.fog=new THREE.Fog(0xf59a7a,70,260);
  sc.add(new THREE.HemisphereLight(0xffd2b0,0x6a4aa0,1.35)); const dl=new THREE.DirectionalLight(0xffb27a,.9); dl.position.set(-60,40,-80); sc.add(dl);
  skyDome(sc,[[0,'#2a1650'],[.38,'#8a3a8e'],[.55,'#ff6a6a'],[.62,'#ffb066'],[.7,'#ffd9a0'],[1,'#ffe9c0']]);
  const sand=ctex(256,256,(x,Wd,H)=>{ x.fillStyle='#e8c88e'; x.fillRect(0,0,Wd,H); for(let i=0;i<1500;i++){ x.fillStyle=`rgba(${150+Math.random()*80|0},${120+Math.random()*60|0},${70+Math.random()*40|0},.25)`; x.fillRect(Math.random()*Wd,Math.random()*H,2,2); } },[22,18]);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(240,150),new THREE.MeshLambertMaterial({map:sand})); fl.rotation.x=-Math.PI/2; fl.position.set(0,0,22); sc.add(fl);
  const wet=new THREE.Mesh(new THREE.PlaneGeometry(240,8),new THREE.MeshLambertMaterial({color:0xa98558})); wet.rotation.x=-Math.PI/2; wet.position.set(0,.01,-27); sc.add(wet);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(700,360),new THREE.MeshBasicMaterial({map:ctex(64,64,(x,Wd,H)=>{ x.fillStyle='#2a6aa8'; x.fillRect(0,0,Wd,H); for(let i=0;i<14;i++){ x.fillStyle='rgba(255,210,150,.12)'; x.fillRect(Math.random()*Wd,Math.random()*H,16,2); } },[60,30])})); sea.rotation.x=-Math.PI/2; sea.position.set(0,-.25,-210); sc.add(sea); W.sea=sea;
  const foam=new THREE.Mesh(new THREE.PlaneGeometry(240,2.2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,depthWrite:false})); foam.rotation.x=-Math.PI/2; foam.position.set(0,.05,-30.6); sc.add(foam); W.foam=foam;
  const sun=wGlow(0xffd27a,150); sun.position.set(-60,14,-230); sc.add(sun); const sun2=wGlow(0xfff2c0,60); sun2.position.set(-60,14,-229); sc.add(sun2);
  const refl=new THREE.Mesh(new THREE.PlaneGeometry(22,170),new THREE.MeshBasicMaterial({color:0xffc27a,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false})); refl.rotation.x=-Math.PI/2; refl.position.set(-60,-.2,-150); sc.add(refl); W.refl=refl;
  /* palmiers */
  [[-40,-20,9,.8],[-34,12,8,-.6],[-42,4,10,.5],[38,-18,9,-.7],[40,8,8,.6],[34,24,9,-.5],[-30,26,8,.7],[22,-22,8,.4],[-14,-24,9,-.4],[6,28,8,.6],[44,-4,10,-.6],[-44,-12,8,.4]].forEach(p=>palm(W,p[0],p[1],p[2],p[3]));
  /* bar tiki */
  const bx=-26, bz=-14; W.box(9,1.2,2.2,bx,.6,bz,wLamb(0x7a4a22)); W.box(9.4,.15,2.6,bx,1.25,bz,wLamb(0xa86a32)); [[-4.4,-1],[4.4,-1],[-4.4,1.8],[4.4,1.8]].forEach(q=>W.box(.3,4.2,.3,bx+q[0],2.1,bz+q[1],wLamb(0x6a4a22)));
  const roof=new THREE.Mesh(new THREE.ConeGeometry(7.2,3,4),new THREE.MeshLambertMaterial({color:0xc9a24a})); roof.rotation.y=Math.PI/4; roof.position.set(bx,5.7,bz+.4); roof.scale.set(1.15,1,.6); sc.add(roof);
  [0xff4d4d,0xffd400,0x3cff9e,0x00e5ff,0xff2bd6].forEach((c,i)=>W.box(.3,.8,.3,bx-3+i*1.5,1.7,bz,wNeon(c)));
  const bl=hubLabel('🥥 IRIE BAR','#FFD400',9,bx,bz); bl.position.set(bx,4.4,bz+2); sc.add(bl); W.obs.push({x0:bx-4.6,x1:bx+4.6,z0:bz-1.4,z1:bz+2});
  for(let i=0;i<11;i++){ const b=wGlow([0xff4d4d,0xffd400,0x3cff9e,0xff2bd6][i%4],1.4); b.position.set(bx-5+i,3.9-Math.sin(i/10*Math.PI)*.4,bz+2.2); sc.add(b); }
  W.poi('bar',bx,bz+4,4.2,()=>'🥥 Bar tiki · Irie',()=>[{id:'drink',tx:'🍹 Rhum-coco · 600 cr (+50 % XP, 3 courses)'}]);
  /* feu de camp */
  const fx=0, fz=-6; for(let i=0;i<6;i++){ const a=i/6*6.283, lg=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,1.8,6),wLamb(0x4a2a12)); lg.position.set(fx+Math.cos(a)*.9,.25,fz+Math.sin(a)*.9); lg.rotation.z=Math.PI/2; lg.rotation.y=-a; lg.rotation.x=.3; sc.add(lg); const st=new THREE.Mesh(new THREE.SphereGeometry(.35,6,5),wLamb(0x6a6a70)); st.position.set(fx+Math.cos(a)*2.1,.2,fz+Math.sin(a)*2.1); sc.add(st); }
  W.flames=[]; [[1,.9],[.8,1.2],[.6,.8]].forEach((f,i)=>{ const fm=new THREE.Mesh(new THREE.ConeGeometry(.5*f[0],1.9*f[1],6),new THREE.MeshBasicMaterial({color:[0xff6a1a,0xffb02a,0xffe27a][i],transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})); fm.position.set(fx+(i-1)*.15,.9*f[1],fz); sc.add(fm); W.flames.push(fm); });
  const fg=wGlow(0xff8a3a,9); fg.position.set(fx,1.2,fz); sc.add(fg); W.fire=fg; W.obs.push({x:fx,z:fz,r:2.3});
  W.poi('fire',fx,fz+3.4,3.6,()=>'🔥 Feu de camp',()=>[{id:'meditate',tx:'🧘 Méditer · karma +1 (toutes les 15 min)'}]);
  /* hamac */
  const hx=18, hz=-14; palm(W,hx-5,hz,9,.3); palm(W,hx+5,hz,9,-.3); for(let i=0;i<9;i++){ const t=i/8, y=3.2-Math.sin(t*Math.PI)*1.4; W.box(.9,.12,1.2,hx-4+t*8,y,hz,new THREE.MeshLambertMaterial({color:i%3===0?0xe22:i%3===1?0xfc0:0x1c6})); }
  W.poi('hammock',hx,hz+3,3.6,()=>'🛏️ Hamac',()=>[{id:'rest',tx:'😴 Se reposer · chaleur −15 % (toutes les 10 min)'}]);
  /* sono */
  const mx=10, mz=8; W.box(2.6,2.2,1.4,mx,1.1,mz,wLamb(0x4a2a68)); [[.22,0xff3a2d],[.36,0xffd400],[.5,0x1fe06a]].forEach(q=>W.box(2.64,.1,1.44,mx,q[0],mz,wNeon(q[1]))); [-.7,.7].forEach(s=>{ const sp=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.1,14),wNeon(0x1fe06a)); sp.rotation.x=Math.PI/2; sp.position.set(mx+s,1.1,mz+.75); sc.add(sp); });
  W.box(2.7,.12,1.5,mx,2.25,mz,wNeon(0xffd400)); const ml=hubLabel('🔊 RIDDIM','#1FE06A',6,mx,mz); ml.position.set(mx,3.8,mz); sc.add(ml); W.obs.push({x:mx,z:mz,r:2.6});
  W.poi('music',mx,mz+3,3.6,()=>WM.on?'🔊 Sono · musique en cours':'🔊 Sono · reggae chill',()=>[{id:'music',tx:WM.on?'⏹ Couper la musique':'▶ Lancer reggae + vagues'}]);
  /* parasols + drapeau */
  [[-8,12],[-16,6],[24,14],[30,-6]].forEach(p=>{ const C=worldCache(), pl=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3.4,6),wLamb(0xdddddd)); pl.position.set(p[0],1.7,p[1]); sc.add(pl); const um=new THREE.Mesh(new THREE.ConeGeometry(2.6,1,12),C.umb); um.position.set(p[0],3.6,p[1]); sc.add(um); W.box(1.4,.25,2.4,p[0]+1.8,.3,p[1]+1,wLamb(0xf0f0f0)); });
  const C=worldCache(), fp=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,7,6),wLamb(0xcccccc)); fp.position.set(-4,3.5,16); sc.add(fp); const fgm=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2.2),C.flag); fgm.position.set(-2.4,6,16); sc.add(fgm); W.flag=fgm;
  const ol=hubLabel('ONE LOVE','#FFD400',9,0,0); ol.position.set(-4,8.4,16); sc.add(ol);
  /* voitures sur le sable */
  const n=parkCars(W,[[-22,16],[-12,20],[4,22],[14,18],[26,22]],Math.PI/2+.3); if(!n){ const t=hubLabel('Mets des voitures sur tes podiums !','#8b90c8',9,0,0); t.position.set(0,2,18); sc.add(t); }
  /* retour */
  W.box(.3,.3,5,36,.2,8,wNeon(0x3cff9e)); const gl=hubLabel('↩ GARAGE','#3CFF9E',7,38,8); gl.position.set(38,3.2,8); sc.add(gl);
  W.poi('gate',37,8,3.8,()=>'Sentier du garage',()=>[{id:'gate',tx:'↩ Retourner au garage'}]);
  W.anim=(dt,t)=>{ if(W.flames) W.flames.forEach((f,i)=>{ f.scale.set(1+Math.sin(t*9+i)*.12,1+Math.sin(t*7+i*2)*.18,1+Math.cos(t*8+i)*.12); }); W.fire.material.opacity=.85+Math.sin(t*11)*.1; W.foam.position.z=-30.6+Math.sin(t*.7)*1.1; W.foam.material.opacity=.45+.3*Math.sin(t*.7+1); W.sea.material.map.offset.x=t*.01; W.refl.material.opacity=.3+Math.sin(t*1.3)*.06; W.flag.rotation.y=Math.sin(t*2)*.25; if(W.sway) W.sway.forEach((s,i)=>{ s.rotation.z=Math.sin(t*1.1+i)*.03; s.rotation.x=Math.cos(t*.9+i)*.03; }); };
}
/* ---------- rue néon ---------- */
function winTex(seed){ let r=seed*9301+49297; const R=()=>{ r=(r*9301+49297)%233280; return r/233280; };
  return ctex(128,256,(x,W,H)=>{ x.fillStyle='#070a16'; x.fillRect(0,0,W,H); const cs=['#ffd27a','#7fe8ff','#ff7ad9','#9dffb0']; for(let gx=0;gx<8;gx++) for(let gy=0;gy<16;gy++){ x.fillStyle=R()<.42?cs[(R()*4)|0]:'#0f1630'; x.fillRect(gx*16+3,gy*16+4,10,8); } }); }
function buildStreet(W){
  const sc=W.sc; sc.background=new THREE.Color(0x070816); sc.fog=new THREE.Fog(0x0a0c20,40,170);
  sc.add(new THREE.HemisphereLight(0x6a78c8,0x1a0a2a,1.2)); const dl=new THREE.DirectionalLight(0xff9af0,.35); dl.position.set(20,50,10); sc.add(dl);
  skyDome(sc,[[0,'#0a0c24'],[.5,'#1a1040'],[.8,'#3a1458'],[1,'#5a1a6a']]);
  const BX=W.bx, road=ctex(256,256,(x,Wd,H)=>{ x.fillStyle='#14161e'; x.fillRect(0,0,Wd,H); for(let i=0;i<600;i++){ x.fillStyle=`rgba(120,130,160,${.03+Math.random()*.05})`; x.fillRect(Math.random()*Wd,Math.random()*H,2,2); }
    x.fillStyle='rgba(0,229,255,.12)'; x.fillRect(30,0,6,H); x.fillStyle='rgba(255,43,214,.10)'; x.fillRect(160,0,8,H); },[BX/6,1]);
  const rd=new THREE.Mesh(new THREE.PlaneGeometry(BX*2+60,18),new THREE.MeshLambertMaterial({map:road})); rd.rotation.x=-Math.PI/2; rd.position.set(0,0,0); sc.add(rd);
  const dash=ctex(64,16,(x,Wd,H)=>{ x.fillStyle='#ffd400'; x.fillRect(0,5,36,5); },[BX*2/6,1]); const dm=new THREE.Mesh(new THREE.PlaneGeometry(BX*2,.5),new THREE.MeshBasicMaterial({map:dash,transparent:true,opacity:.8})); dm.rotation.x=-Math.PI/2; dm.position.set(0,.03,0); sc.add(dm);
  [-1,1].forEach(s=>{ const sw=new THREE.Mesh(new THREE.PlaneGeometry(BX*2+60,10),new THREE.MeshLambertMaterial({color:0x2a2c3a})); sw.rotation.x=-Math.PI/2; sw.position.set(0,.06,s*14); sc.add(sw); W.box(BX*2+60,.2,.3,0,.15,s*9.1,wNeon(s<0?0x00e5ff:0xff2bd6)); });
  /* immeubles */
  const tx=[1,2,3,4].map(winTex), cols=[0x00e5ff,0xff2bd6,0xffd400,0x3cff9e,0xff4d4d];
  [-1,1].forEach(s=>{ for(let x=-BX-20,k=0;x<BX+30;x+=15,k++){ const h=16+((k*37+s*11)%5+5)*3.4, w=14, tt=tx[(k+(s>0?1:0))%4].clone(); tt.needsUpdate=true; tt.repeat.set(1,h/26);
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,10),new THREE.MeshBasicMaterial({map:tt,color:0xcfd4ff})); b.position.set(x,h/2,s*(24+((k*13)%3))); sc.add(b);
      W.box(w+.4,.3,.3,x,h+.15,s*(24+((k*13)%3))-s*5,wNeon(cols[(k+2)%5])); }});
  /* enseignes */
  [[-12,1,'GARAGE 24','#00E5FF']].forEach(sg=>{ const kk=Math.round((sg[0]+BX+20)/15), sx=-BX-20+15*kk, fz=24+((kk*13)%3)-5, sz=sg[1]; const l=hubLabel(sg[2],sg[3],10,sx,sz*(fz-2)); l.position.set(sx,8,sz*(fz-.3)); sc.add(l); const sgl=wGlow(parseInt(sg[3].slice(1),16),12); sgl.position.set(sx,8,sz*(fz-2.5)); sc.add(sgl); });
  /* lampadaires */
  for(let x=-BX+4;x<=BX-4;x+=14){ [-1,1].forEach(s=>{ W.box(.25,7,.25,x,3.5,s*9.4,wLamb(0x3a3e50)); W.box(1.6,.2,.25,x,7,s*9.4-s*.7,wLamb(0x3a3e50)); const g=wGlow(0xaee8ff,6); g.position.set(x,6.8,s*8.7); sc.add(g); }); }
  /* flaques / reflets néon */
  [[-30,2,0xff2bd6],[-12,-3,0x00e5ff],[8,3,0xffd400],[26,-2,0x3cff9e],[40,3,0xff4d6d]].forEach(p=>{ const pm=new THREE.Mesh(new THREE.PlaneGeometry(9,3),new THREE.MeshBasicMaterial({color:p[2],transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false})); pm.rotation.x=-Math.PI/2; pm.position.set(p[0],.04,p[1]); sc.add(pm); });
  /* pluie */
  const N=520, pos=new Float32Array(N*6); const drops=[]; for(let i=0;i<N;i++){ drops.push([Math.random()*BX*2-BX,Math.random()*26,Math.random()*34-17]); }
  const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.BufferAttribute(pos,3)); const rain=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0x9ad7ff,transparent:true,opacity:.3})); rain.frustumCulled=false; sc.add(rain);
  /* voitures en vitrine */
  const n=parkCars(W,[[-24,-4.5],[-10,-4.5],[4,-4.5],[18,-4.5],[32,-4.5]],0); if(!n){ const t=hubLabel('Mets des voitures sur tes podiums !','#8b90c8',9,0,0); t.position.set(0,2,-4.5); sc.add(t); }
  /* ligne de départ */
  const chk=ctex(64,16,(x,Wd,H)=>{ for(let i=0;i<8;i++) for(let j=0;j<2;j++){ x.fillStyle=(i+j)%2?'#fff':'#111'; x.fillRect(i*8,j*8,8,8); } },[1,1]); const sl=new THREE.Mesh(new THREE.PlaneGeometry(1.6,18),new THREE.MeshBasicMaterial({map:chk})); sl.rotation.x=-Math.PI/2; sl.position.set(-44,.04,0); sc.add(sl);
  W.box(.4,6,.4,-44,3,-9.5,wLamb(0x3a3e50)); W.box(.4,6,.4,-44,3,9.5,wLamb(0x3a3e50)); W.box(.5,.6,19.5,-44,6,0,wNeon(0xfcee0a)); const rl=hubLabel('🏁 DÉPART','#FCEE0A',8,-44,0); rl.position.set(-44,8,0); sc.add(rl);
  W.poi('race',-41,0,4.2,()=>'🏁 Ligne de départ',()=>[{id:'epreuves',tx:'🏁 Choisir une épreuve'},{id:'missions',tx:'📜 Missions',alt:1}]);
  /* kiosques */
  const kiosk=(x,z,col,txt)=>{ W.box(4,3,3,x,1.5,z,wLamb(0x1a1c2e)); W.box(4.4,.3,3.4,x,3.1,z,wNeon(col)); const l=hubLabel(txt,'#'+col.toString(16).padStart(6,'0'),6,x,z); l.position.set(x,4.6,z); sc.add(l); W.obs.push({x0:x-2.2,x1:x+2.2,z0:z-1.7,z1:z+1.7}); };
  kiosk(-2,-12.5,0xffd400,'🛒 MARCHÉ'); kiosk(30,-12.5,0x00e5ff,'🏗️ BASE'); kiosk(14,12.5,0xff2bd6,'🍜 RAMEN');
  W.poi('market',-2,-9.2,3.6,()=>'🛒 Marché des voitures',()=>[{id:'marche',tx:'Acheter / vendre des voitures'}]);
  W.poi('base',30,-9.2,3.6,()=>'🏗️ Ton quartier général',()=>[{id:'base',tx:'Bâtiments & améliorations'}]);
  W.poi('ramen',14,9.2,3.6,()=>'🍜 Stand de ramen',()=>[{id:'ramen',tx:'🍜 Ramen néon · 250 cr (+25 XP)'}]);
  /* portail */
  W.box(.3,6,6,56,3,0,wNeon(0x3cff9e)); const gl=hubLabel('↩ GARAGE','#3CFF9E',7,56,0); gl.position.set(56,7.4,0); sc.add(gl);
  W.poi('gate',53,0,3.8,()=>'Porte du garage',()=>[{id:'gate',tx:'↩ Retourner au garage'}]);
  W.anim=(dt,t)=>{ const a=rg.attributes.position.array; for(let i=0;i<N;i++){ const d=drops[i]; d[1]-=dt*32; if(d[1]<0) d[1]+=26; a[i*6]=d[0]; a[i*6+1]=d[1]; a[i*6+2]=d[2]; a[i*6+3]=d[0]+.15; a[i*6+4]=d[1]+.9; a[i*6+5]=d[2]; } rg.attributes.position.needsUpdate=true; };
}
const WBUILD={beach:buildBeach,street:buildStreet};
function worldBuild(id){
  const D=WORLD[id]; HUB.labels=[]; HUB.obs=[]; HUB.pois=[]; HUB.ents={npcs:[],pods:[]}; HUB.map=id; HUB.bx=D.bx; HUB.bz=D.bz; HUB.plots=null; HUB.fans=null; HUB.plotGroup=null; HUB.anim=null;
  const sc=new THREE.Scene(), cam=new THREE.PerspectiveCamera(100,1.5,.1,500);
  const W={sc,bx:D.bx,bz:D.bz,obs:HUB.obs,
    box:(w,h,d,x,y,z,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); sc.add(m); return m; },
    poi:(id,x,z,r,title,btns)=>HUB.pois.push({id,x,z,r,title,btns,a:'wgo'})};
  WBUILD[id](W); HUB.anim=W.anim;
  HUB.scene=sc; HUB.cam=cam; HUB.pos={x:D.spawn.x,z:D.spawn.z}; HUB.yaw=D.spawn.yaw; HUB.pit=0; HUB.gAcc=0;
}
function worldTick(dt){
  const H=HUB; if(H.anim) H.anim(dt,H.t); H.gAcc=(H.gAcc||0)+dt;
  if(H.gAcc>1.3){ H.gAcc=0; const gh=$('growhud'); if(gh){ const kt=karmaTitle(); gh.innerHTML=`<span>💰 ${fmt(S.cr)}</span><span>🎟 ${fmt((S.arc&&S.arc.tk)||0)}</span><span>${WORLD[H.map]?WORLD[H.map].ic:''} ${WORLD[H.map]?WORLD[H.map].nom:''}</span>${WM.on?'<span>🎵</span>':''}${S.age18===true?`<span>${kt[2]} ${Math.round(karma())}</span>`:''}`; } }
  const p=H.pos; let best=null, bd=1e9; (H.pois||[]).forEach(q=>{ const d=Math.hypot(p.x-q.x,p.z-q.z); if(d<q.r&&d<bd){ bd=d; best=q; } }); H.gbest=best;
}
/* ---------- musique reggae + vagues ---------- */
const WM={ctx:null,on:false,timer:0,next:0,step:0,master:null,wave:null};
function musicStart(){ if(WM.on) return; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return toast('Audio indisponible');
  try{ WM.ctx=WM.ctx||new AC(); const c=WM.ctx; if(c.state==='suspended') c.resume(); WM.master=c.createGain(); WM.master.gain.value=.55; WM.master.connect(c.destination);
    const len=c.sampleRate*3, buf=c.createBuffer(1,len,c.sampleRate), d=buf.getChannelData(0); let l=0; for(let i=0;i<len;i++){ l=(l+(Math.random()*2-1)*.06)*.985; d[i]=l*4; } WM.nbuf=buf;
    const ns=c.createBufferSource(); ns.buffer=buf; ns.loop=true; const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=700; const g=c.createGain(); g.gain.value=.14; const lfo=c.createOscillator(), lg=c.createGain(); lfo.frequency.value=.13; lg.gain.value=.09; lfo.connect(lg); lg.connect(g.gain); ns.connect(lp); lp.connect(g); g.connect(WM.master); ns.start(); lfo.start(); WM.wave=[ns,lfo];
    WM.on=true; WM.step=0; WM.next=c.currentTime+.1; WM.timer=setInterval(musicSched,110); }catch(e){ WM.on=false; } }
function musicStop(){ if(!WM.on) return; WM.on=false; clearInterval(WM.timer); try{ WM.master.gain.setTargetAtTime(0,WM.ctx.currentTime,.15); const w=WM.wave, m=WM.master; setTimeout(()=>{ try{ w[0].stop(); w[1].stop(); m.disconnect(); }catch(_){} },600); }catch(_){} }
function musicSched(){ const c=WM.ctx; if(!c||!WM.on) return; while(WM.next<c.currentTime+.35){ musicStep(WM.step,WM.next); WM.next+=60/76/2; WM.step=(WM.step+1)%32; } }
function musicStep(s,t){ const c=WM.ctx, M=WM.master, bar=(s>>3)%4, st=s%8, roots=[45,50,45,52], hz=m=>440*Math.pow(2,(m-69)/12);
  const tone=(type,f,t0,dur,vol,lpf)=>{ const o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.value=f; g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+.01); g.gain.exponentialRampToValueAtTime(.001,t0+dur); let n=o; if(lpf){ const f2=c.createBiquadFilter(); f2.type='lowpass'; f2.frequency.value=lpf; o.connect(f2); n=f2; } n.connect(g); g.connect(M); o.start(t0); o.stop(t0+dur+.05); };
  const noise=(t0,dur,vol,f,type)=>{ const ns=c.createBufferSource(); ns.buffer=WM.nbuf; const fl=c.createBiquadFilter(); fl.type=type||'highpass'; fl.frequency.value=f; const g=c.createGain(); g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.001,t0+dur); ns.connect(fl); fl.connect(g); g.connect(M); ns.start(t0,Math.random()*2); ns.stop(t0+dur+.02); };
  if([0,3,4,6].includes(st)) tone('triangle',hz(roots[bar]),t,.42,.3,500);
  if(st===4){ const k=c.createOscillator(), g=c.createGain(); k.frequency.setValueAtTime(120,t); k.frequency.exponentialRampToValueAtTime(42,t+.2); g.gain.setValueAtTime(.55,t); g.gain.exponentialRampToValueAtTime(.001,t+.26); k.connect(g); g.connect(M); k.start(t); k.stop(t+.3); noise(t,.08,.25,1500,'bandpass'); }
  if(st%2===1) [0,3,7,10].forEach(i=>tone('square',hz(roots[bar]+12+i),t,.11,.045,1700));
  noise(t,.04,st%2?.07:.035,7500);
}
/* ---------- actions ---------- */
const cdLeft=(k,min)=>{ const F=farm(); F.cd=F.cd||{}; return Math.max(0,Math.ceil((min*60000-(Date.now()-(F.cd[k]||0)))/60000)); };
ACT.wgo=d=>{ const id=d.id, v=d.v, F=farm();
  const leave=tab=>{ HUB.map='garage'; HUB.sig=''; musicStop(); closeSheet(); ACT.tab({id:tab}); };
  if(id==='gate') return growExit();
  if(id==='race'||id==='market'||id==='base') return leave(v);
  if(id==='bar'){ if(S.cr<600) return toast('Pas assez de crédits'); S.cr-=600; S.xpb=3; toast('🍹 Rhum-coco ! +50 % d’XP sur 3 épreuves'); save(); return; }
  if(id==='ramen'){ if(S.cr<250) return toast('Pas assez de crédits'); S.cr-=250; addXP(25); toast('🍜 Miam. +25 XP'); save(); return; }
  if(id==='music'){ if(WM.on){ musicStop(); toast('Musique coupée'); } else { musicStart(); toast('🎵 Irie !'); } HUB.gAcc=9; return; }
  if(id==='meditate'){ const m=cdLeft('fire',15); if(m>0) return toast(`Reviens dans ${m} min`); F.cd.fire=Date.now(); karmaAdd(1); toast('🧘 Paix intérieure : karma +1'); save(); return; }
  if(id==='rest'){ const m=cdLeft('hamm',10); if(m>0) return toast(`Reviens dans ${m} min`); F.cd.hamm=Date.now(); F.heat.atelier=Math.max(0,F.heat.atelier*.85-1); F.heat.ranch=Math.max(0,F.heat.ranch*.85-1); toast('😴 Tu te sens plus léger : chaleur −15 %'); save(); return; }
};
function wmapSheet(X){
  if(!sheet||sheet.t!=='wmap') return false;
  $('sheet').innerHTML=`<div class="inv">${X}<h2>🗺️ Carte du Monde</h2><p class="note">Choisis où aller. Les nouveaux lieux se débloquent en progressant.</p>
   ${DEST.map(d=>{ const ok=d.ok(), here=(HUB.map||'garage')===d.id; return `<div class="inv-r ${ok?'':'lock'}"><span class="inv-i">${d.ic}</span><div class="inv-t"><b>${d.nom}${here?' · tu es ici':''}</b><small>${ok?d.d:'🔒 '+d.why}</small></div>${ok&&!here?`<button class="btn sm" data-a="wtravel" data-id="${d.id}">Aller</button>`:''}</div>`; }).join('')}</div>`; return true; }
ACT.wmap=()=>openSheet({t:'wmap'});
ACT.wtravel=d=>{ const D=DEST.find(x=>x.id===d.id); if(!D||!D.ok()) return; musicStop(); if(d.id==='garage') return growExit(); growEnter(d.id); };
/* retour / entrées : compatible avec les nouvelles cartes */
const _growExit0=growExit;
growExit=function(){ const was=HUB.map; musicStop(); _growExit0(); if(WORLD[was]||was==='beach'||was==='street'){ HUB.pos={x:0,z:12}; HUB.yaw=0; } };
const _tab1=ACT.tab; ACT.tab=function(d){ if(d&&d.id==='hub'&&HUB.map!=='garage'){ HUB.map='garage'; HUB.sig=''; } return _tab1.call(this,d); };
/* bouton Monde 3D : à part, côté « gestion » */
function worldCard(){ return `<button class="worldcard" data-a="tab" data-id="hub"><span class="wc-i">🌍</span><span class="wc-t"><b>Monde 3D</b><small>Balade dans ton garage, ta plage, ta rue néon et ton labo</small></span><span class="wc-g">›</span></button>`; }

function worldBtn(){ const t=$('top'); if(!t||t.querySelector('.worldbtn')) return; const b=document.createElement('button'); b.className='worldbtn'; b.dataset.a='tab'; b.dataset.id='hub'; b.setAttribute('aria-label','Monde 3D'); b.textContent='🌍'; const mo=t.querySelector('.money'), sb=mo&&mo.querySelector('[data-a="mute"]'); if(sb) sb.before(b); else (mo||t).appendChild(b); }
const _render2=render; render=function(){ _render2.apply(this,arguments); try{ worldBtn(); }catch(e){} };
