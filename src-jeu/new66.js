/* ===== v2.3 : une cinématique 3D différente pour chacun des 16 ultimes (nom → mise en scène) =====
   Cadre commun : charge (0–1,5 s) → tir (1,5–2,7 s) → impact → retour caméra, 4,2 s au total (max. 5 s).
   Chaque effet de CBFX fournit : charge(k,t) · fire(u,t) · impact(u,t) · post(u,t) · camMode · focus · snd. */

if(window.THREE){ /* sans Three.js (appareil sans 3D), les ultimes gardent l'ancienne cinématique 2D */
const V3=THREE.Vector3, ADD=THREE.AdditiveBlending, NRM=THREE.NormalBlending, DBL=THREE.DoubleSide;
const sat=u=>Math.max(0,Math.min(1,u)), easeO=u=>1-(1-u)*(1-u), easeI=u=>u*u, rr=(a,b)=>a+Math.random()*(b-a);
const SH=g=>{ g.userData.shared=1; return g; };
const BOX1=SH(new THREE.BoxGeometry(1,1,1)), SPH1=SH(new THREE.SphereGeometry(1,16,12)), CONE1=SH(new THREE.ConeGeometry(1,1,10)), CYL1=SH(new THREE.CylinderGeometry(1,1,1,14,1,true)),
  RING1=SH(new THREE.RingGeometry(.82,1,48)), RING2=SH(new THREE.RingGeometry(.55,1,64)), CIRC1=SH(new THREE.CircleGeometry(1,28)), TOR1=SH(new THREE.TorusGeometry(1,.06,8,40)), OCT1=SH(new THREE.OctahedronGeometry(1,0)), ICO1=SH(new THREE.IcosahedronGeometry(1,0)), DOD1=SH(new THREE.DodecahedronGeometry(1,0));
const UP=new V3(0,1,0);
const SPRT=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.35,'rgba(255,255,255,.75)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
function fxM(U,geo,col,op,add,extra){ const mt=new THREE.MeshBasicMaterial(Object.assign({color:col,transparent:true,opacity:op,blending:add===false?NRM:ADD,depthWrite:false,side:DBL},extra||{})); const m=new THREE.Mesh(geo,mt); m.visible=false; m.renderOrder=8; U.sc.add(m); U.objs.push(m); return m; }
function fxS(U,geo,col){ const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:col})); m.visible=false; U.sc.add(m); U.objs.push(m); return m; }
function fxP(U,N,col,size,add){ const g=new THREE.BufferGeometry(), arr=new Float32Array(N*3); g.setAttribute('position',new THREE.BufferAttribute(arr,3)); const p=new THREE.Points(g,new THREE.PointsMaterial({color:col,size:size*2.1,map:SPRT,transparent:true,opacity:.95,blending:add===false?NRM:ADD,depthWrite:false})); p.frustumCulled=false; p.visible=false; p.renderOrder=9; p.arr=arr; p.N=N; U.sc.add(p); U.objs.push(p); return p; }
function fxBolt(U,segs,th,col){ const o={segs:[],th}; for(let i=0;i<segs;i++){ const core=new THREE.Mesh(BOX1,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,blending:ADD,depthWrite:false})), glow=new THREE.Mesh(BOX1,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.5,blending:ADD,depthWrite:false})); core.visible=glow.visible=false; core.renderOrder=10; glow.renderOrder=9; U.sc.add(core); U.sc.add(glow); U.objs.push(core,glow); o.segs.push([core,glow]); } return o; }
function boltSet(b,from,to,jit,on){ const n=b.segs.length, pts=[]; for(let i=0;i<=n;i++){ const u=i/n, env=Math.sin(Math.PI*u), p=from.clone().lerp(to,u); if(i>0&&i<n){ p.x+=rr(-1,1)*jit*env; p.y+=rr(-1,1)*jit*env*.7; p.z+=rr(-1,1)*jit*env; } pts.push(p); }
  for(let i=0;i<n;i++){ const a=pts[i], c=pts[i+1], mid=a.clone().add(c).multiplyScalar(.5), l=a.distanceTo(c); b.segs[i].forEach((m,j)=>{ m.visible=on!==false; m.position.copy(mid); m.scale.set(b.th*(j?3:1),b.th*(j?3:1),l*1.04); m.lookAt(c); }); } }
function boltOff(b){ b.segs.forEach(s=>s.forEach(m=>m.visible=false)); }
const setP=(P,i,x,y,z)=>{ P.arr[i*3]=x; P.arr[i*3+1]=y; P.arr[i*3+2]=z; };
const flashU=(U,css)=>{ const f=U.ov&&U.ov.querySelector('.lg3-flash'); if(!f) return; f.style.background=`radial-gradient(circle at 60% 40%,${css||'#fff'},rgba(255,255,255,0) 72%)`; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); };
const tintU=(U,css,op)=>{ if(U.tint){ U.tint.style.background=css; U.tint.style.opacity=op; } };
const sleep66=ms=>new Promise(r=>setTimeout(r,ms));
/* sons par famille */
function snd66(kind,ph){ try{ const T=(f)=>setTimeout(f,0);
  const S={
   fire:{c:()=>{ czTone(55,320,1.4,'sawtooth',.07); },f:()=>{ whoosh50(.7,.22); czTone(90,40,1,'sawtooth',.06); },i:()=>czBoom(1.1,.75)},
   water:{c:()=>{ czTone(180,520,1.4,'sine',.07); whoosh50(.9,.1); },f:()=>{ whoosh50(.9,.26); },i:()=>{ czBoom(.7,.55); whoosh50(.7,.25); }},
   ice:{c:()=>{ for(let i=0;i<8;i++) setTimeout(()=>arcTone(2200+i*260,.09,'triangle',.05),i*170); },f:()=>{ sfx50(2600,.5,'triangle',.07,380); },i:()=>{ czBoom(.6,.5); [0,70,140].forEach((d,i)=>setTimeout(()=>arcTone(3200-i*500,.1,'triangle',.07),d)); }},
   wind:{c:()=>{ whoosh50(1.4,.16); },f:()=>{ whoosh50(1.1,.3); czTone(160,420,1.1,'sine',.05); },i:()=>{ whoosh50(.7,.3); czBoom(.5,.4); }},
   dark:{c:()=>{ czTone(55,28,1.5,'sawtooth',.09); },f:()=>{ czTone(40,22,1.2,'sine',.14); },i:()=>{ czBoom(1.3,.85); czTone(300,30,.8,'sawtooth',.08); }},
   light:{c:()=>{ czTone(300,1500,1.4,'triangle',.05); czTone(150,700,1.4,'sine',.04); },f:()=>{ sfx50(900,1,'sine',.08,2600); },i:()=>{ czBoom(1,.7); sfx50(1800,.7,'sine',.07,300); }},
   elec:{c:()=>{ for(let i=0;i<10;i++) setTimeout(()=>arcTone(rr(500,2400),.05,'square',.08),i*130); },f:()=>{ for(let i=0;i<8;i++) setTimeout(()=>arcTone(rr(300,1800),.06,'sawtooth',.09),i*90); },i:()=>{ czBoom(.9,.7); for(let i=0;i<6;i++) setTimeout(()=>arcTone(rr(600,2600),.05,'square',.08),i*60); }},
   steel:{c:()=>{ for(let i=0;i<8;i++) setTimeout(()=>{ arcTone(220+i*30,.08,'square',.09); whoosh50(.1,.1); },i*160); },f:()=>{ whoosh50(.8,.22); czTone(80,200,1,'square',.05); },i:()=>{ czBoom(1,.8); arcTone(1400,.12,'square',.08); }},
   earth:{c:()=>{ czTone(45,32,2,'sawtooth',.1); },f:()=>{ czTone(38,30,1.4,'sawtooth',.12); whoosh50(.8,.12); },i:()=>{ czBoom(1.4,.9); czTone(70,24,1,'sawtooth',.1); }},
   mech:{c:()=>{ czTone(100,800,1.4,'square',.05); },f:()=>{ whoosh50(.6,.2); },i:()=>czBoom(1,.7)}
  }[kind]||{c:()=>czTone(70,600,1.4,'sawtooth',.07),f:()=>whoosh50(.6,.2),i:()=>czBoom(.9,.6)};
  S[ph](); }catch(_){} }

/* ---------- décor commun ---------- */
const dashPos=(U,u)=>{ const t=U.Bf.clone().addScaledVector(U.d,-3.3); t.y=U.A.y; return U.A.clone().lerp(t,u); };
const spinWheels=(U,v)=>{ try{ CB3.g[U.s].wheels&&CB3.g[U.s].wheels.forEach(w=>{ w.rotation.z-=U.dt*v; }); }catch(_){} };
function ubBurst66(U,P,at,n,spd,up){ P.vel=[]; for(let i=0;i<P.N;i++){ const a=rr(0,6.283), e=rr(-.2,1), s=rr(.3,1)*spd; P.vel.push([Math.cos(a)*Math.cos(e)*s,Math.abs(Math.sin(e))*s*up+rr(.5,1.5),Math.sin(a)*Math.cos(e)*s]); setP(P,i,at.x,at.y,at.z); } P.at=at.clone(); P.visible=true; }
function ubStep66(P,u,grav){ if(!P.vel) return; const t=u*1.5; for(let i=0;i<P.N;i++){ const v=P.vel[i]; setP(P,i,P.at.x+v[0]*t,P.at.y+v[1]*t-grav*t*t,P.at.z+v[2]*t); } P.geometry.attributes.position.needsUpdate=true; P.material.opacity=.95*(1-u*u); }

const CBFX={};
/* orbe générique (secours) */
CBFX.default=U=>{ const o=fxM(U,SPH1,U.col,.8), h=fxM(U,SPH1,U.col,.25), pos=U.cen.clone(); U.focus=pos; const put=(p,k)=>{ o.visible=h.visible=true; o.position.copy(p); h.position.copy(p); o.scale.setScalar(.5*k); h.scale.setScalar(.9*k); };
  return {snd:'mech',charge:(k)=>put(U.cen,.2+.8*k*k),fire:(u)=>{ pos.copy(U.cen).lerp(U.Bf,Math.pow(u,1.6)); put(pos,1); },impact:()=>{ o.visible=h.visible=false; },post:()=>{}}; };

/* 1 · MODE COURSE (méca) : la voiture file à toute vitesse, traînées de vitesse et étincelles */
CBFX.modecourse=U=>{ const st=[]; for(let i=0;i<18;i++) st.push(fxM(U,BOX1,i%3?0xdfe6ff:0xffd24a,.55)); const sp=fxP(U,90,0xffe9a8,.18), ring=fxM(U,RING1,0xdfe6ff,.8); ring.rotation.x=-Math.PI/2; const g=()=>CB3.g[U.s].g; U.focus=U.cen.clone(); U.noLunge=true;
  return {snd:'mech',camMode:'follow',
   charge(k,t){ spinWheels(U,30*k+6); st.forEach((m,i)=>{ const a=i/18*6.283+t*9, r=1.8+.3*Math.sin(t*5+i); m.visible=true; m.position.set(U.A.x+Math.cos(a)*r,U.A.y+.35+.95*(i%3)/3,U.A.z+Math.sin(a)*r); m.scale.set(.05,.05,.3+1.9*k); m.rotation.set(0,-a,0); }); },
   fire(u,t){ spinWheels(U,60); const p=dashPos(U,easeI(u)*(2-easeI(u))*.999+0); g().position.copy(p); U.focus.copy(p).add(new V3(0,.9,0)); st.forEach((m,i)=>{ m.visible=true; const back=.8+i*.55; m.position.copy(p).addScaledVector(U.d,-back).addScaledVector(U.pp,((i%5)-2)*.55); m.position.y=U.A.y+.3+(i%4)*.28; m.scale.set(.05,.05,1.2+u*2); m.rotation.set(0,Math.atan2(U.d.x,U.d.z),0); });
     for(let i=0;i<90;i++) setP(sp,i,p.x-U.d.x*rr(0,6)+rr(-1,1),p.y+rr(0,1.4),p.z-U.d.z*rr(0,6)+rr(-1,1)); sp.visible=true; sp.geometry.attributes.position.needsUpdate=true; },
   onImpact(){ st.forEach(m=>m.visible=false); const at=U.Bf.clone().addScaledVector(U.d,-1.6); ubBurst66(U,sp,at,90,5,.9); ring.position.set(at.x,.15,at.z); ring.visible=true; },
   impact(u){ g().position.copy(dashPos(U,1)); ubStep66(sp,u*.5,6); ring.scale.setScalar(1+u*5); ring.material.opacity=.8*(1-u); },
   post(u){ ubStep66(sp,.5+u*.5,6); ring.visible=u<.4; g().position.copy(dashPos(U,1).lerp(U.A,easeO(Math.min(1,u*1.4)))); }}; };

/* 2 · NOVA PLASMA (feu) : sphère de plasma solaire à éruptions, explosion de braises */
CBFX.novaplasma=U=>{ const core=fxM(U,SPH1,0xffffff,.95), shell=fxM(U,SPH1,0xff7a1a,.6), cor=fxM(U,SPH1,0xffb04a,.22), fl=[]; for(let i=0;i<14;i++) fl.push(fxM(U,CONE1,i%2?0xffd24a:0xff4a1a,.75)); const tr=[]; for(let i=0;i<10;i++) tr.push(fxM(U,SPH1,0xff8a2a,.5-i*.04));
  const F1=fxM(U,SPH1,0xff6a1a,.7), F2=fxM(U,SPH1,0xffd24a,.7), F3=fxM(U,SPH1,0xffffff,.8), ring=fxM(U,RING1,0xffb04a,.9), em=fxP(U,110,0xffb04a,.24), pos=U.cen.clone(), hist=[]; ring.rotation.x=-Math.PI/2; U.focus=pos;
  const place=(p,k,t)=>{ [core,shell,cor].forEach(m=>{ m.visible=true; m.position.copy(p); }); const pul=1+.1*Math.sin(t*26); core.scale.setScalar(.42*k*pul); shell.scale.setScalar(.85*k*pul); cor.scale.setScalar(1.5*k);
    fl.forEach((f,i)=>{ const a=i/14*6.283+t*3, el=((i%3)-1)*.6, dir=new V3(Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)); f.visible=true; f.position.copy(p).addScaledVector(dir,.85*k); f.scale.set(.15*k,.75*k*(1+.3*Math.sin(t*14+i)),.15*k); f.quaternion.setFromUnitVectors(UP,dir); }); };
  return {snd:'fire',camMode:'follow',
   charge(k,t){ place(U.cen,.15+.85*k*k,t); },
   fire(u,t){ pos.copy(U.cen).lerp(U.Bf,Math.pow(u,1.5)); place(pos,1,t); hist.unshift(pos.clone()); if(hist.length>30) hist.pop(); tr.forEach((m,i)=>{ const h=hist[Math.min(hist.length-1,(i+1)*2)]; if(h){ m.visible=true; m.position.copy(h); m.scale.setScalar(.55-i*.04); } }); },
   onImpact(){ [core,shell,cor,...fl,...tr].forEach(m=>m.visible=false); ubBurst66(U,em,U.Bf.clone(),110,6,1.3); [F1,F2,F3,ring].forEach(m=>{ m.visible=true; m.position.set(U.Bf.x,U.Bf.y,U.Bf.z); }); ring.position.y=.15; },
   impact(u){ const e=easeO(u); F1.scale.setScalar(.5+3.2*e); F2.scale.setScalar(.3+2.2*e); F3.scale.setScalar(.2+1.2*e); ring.scale.setScalar(1+7*e); ring.material.opacity=.9*(1-u); ubStep66(em,u*.4,6); },
   post(u){ const e=1-u; F1.scale.setScalar(3.7*(.4+.6*e)); F1.material.opacity=.7*e; F2.material.opacity=.7*e; F3.visible=false; ring.visible=false; ubStep66(em,.4+u*.6,6); }}; };

/* 3 · DÉLUGE (eau) : un nuage se forme au-dessus de l'adversaire et déverse une pluie diluvienne */
CBFX.deluge=U=>{ const cl=[]; for(let i=0;i<11;i++) cl.push(fxM(U,SPH1,i%3?0x35435f:0x4a5a7a,.92,false)); const Nr=190, rain=new THREE.InstancedMesh(BOX1,new THREE.MeshBasicMaterial({color:0x9fdcff,transparent:true,opacity:.75,blending:ADD,depthWrite:false}),Nr); rain.visible=false; rain.frustumCulled=false; U.sc.add(rain); U.objs.push(rain);
  const rs=[]; for(let i=0;i<Nr;i++) rs.push([rr(-4.8,4.8),rr(0,11),rr(-4.8,4.8),rr(17,25)]); const m4=new THREE.Matrix4(), q0=new THREE.Quaternion(), ring=[0x8fd6ff,0xffffff,0x5fb4ff].map(c=>fxM(U,RING1,c,.8)), sw=fxM(U,TOR1,0x6fc4ff,.8), mist=fxP(U,90,0xbfe6ff,.2), splash=fxP(U,80,0xdff3ff,.2), cC=U.Bf.clone().add(new V3(0,9,0)); ring.forEach(r=>r.rotation.x=-Math.PI/2); U.focus=cC.clone();
  const puffs=(k)=>cl.forEach((m,i)=>{ m.visible=k>.02; const a=i/11*6.283, r=(i%2?2.3:1.3)*k; m.position.set(cC.x+Math.cos(a)*r*1.6,cC.y+Math.sin(i*1.7)*.5,cC.z+Math.sin(a)*r*1.6); m.scale.setScalar((1.4+.5*(i%3))*k); });
  const rainTick=(t,op)=>{ rain.visible=true; rain.material.opacity=.75*op; for(let i=0;i<Nr;i++){ const r=rs[i], y=((r[1]-t*r[3])%11+11)%11; m4.compose(new V3(U.Bf.x+r[0],U.Bf.y+y+.5,U.Bf.z+r[2]),q0,new V3(.035,.95,.035)); rain.setMatrixAt(i,m4); } rain.instanceMatrix.needsUpdate=true; };
  return {snd:'water',camMode:'sky',
   charge(k,t){ sw.visible=true; sw.position.set(U.A.x,U.A.y+1.1,U.A.z); sw.rotation.set(Math.PI/2+.3*Math.sin(t*3),t*5,0); sw.scale.setScalar(.8+1.8*k); mist.visible=true; for(let i=0;i<90;i++){ const a=i*.7+t*3, r=1.2+(i%9)*.18; setP(mist,i,U.A.x+Math.cos(a)*r,U.A.y+((i*.137+t*1.4)%2.6),U.A.z+Math.sin(a)*r); } mist.geometry.attributes.position.needsUpdate=true; puffs(k); },
   fire(u,t){ sw.visible=false; mist.visible=false; puffs(1); rainTick(t,sat(u*3)); U.focus.copy(cC).lerp(U.Bf.clone().add(new V3(0,2,0)),easeI(u)); },
   onImpact(){ ring.forEach(r=>{ r.visible=true; r.position.set(U.Bf.x,.12,U.Bf.z); }); ubBurst66(U,splash,U.Bf.clone().add(new V3(0,.3,0)),80,3.2,1.6); },
   impact(u,t){ rainTick(t,1); ring.forEach((r,j)=>{ r.scale.setScalar(1+(u+j*.25)*5); r.material.opacity=.8*(1-u*.8); }); ubStep66(splash,u*.5,5); U.focus.copy(U.Bf).add(new V3(0,1.5,0)); },
   post(u,t){ rainTick(t,1-u); puffs(1-u*.7); ring.forEach(r=>r.visible=u<.5); ubStep66(splash,.5+u*.5,5); }}; };

/* 4 · ZÉRO ABSOLU (glace) : le froid se propage au sol en épines de glace et fige l'adversaire dans un bloc */
CBFX['zeroabsolu']=U=>{ const cr=[]; for(let i=0;i<10;i++) cr.push(fxM(U,OCT1,i%2?0xcff6ff:0x7fe0ff,.8)); const sn=fxP(U,130,0xeafcff,.16), disk=fxM(U,CIRC1,0x7fe0ff,.35), sp=[]; for(let i=0;i<18;i++) sp.push(fxM(U,CONE1,i%2?0xdff8ff:0x9fe9ff,.85)); disk.rotation.x=-Math.PI/2;
  const blk=fxM(U,BOX1,0x9fe9ff,.35), blk2=fxM(U,BOX1,0xffffff,.18), sh=fxP(U,90,0xdff8ff,.2), ring=fxM(U,RING1,0xcff6ff,.9); ring.rotation.x=-Math.PI/2; U.focus=U.cen.clone();
  const ay=U.A.y;
  return {snd:'ice',camMode:'wide',
   charge(k,t){ disk.visible=true; disk.position.set(U.A.x,.1,U.A.z); disk.scale.setScalar(.5+3.2*k); disk.material.opacity=.35*k+.1; cr.forEach((m,i)=>{ const a=i/10*6.283+t*2.2, r=2.2-.4*k; m.visible=true; m.position.set(U.A.x+Math.cos(a)*r,ay+.7+.5*Math.sin(t*3+i),U.A.z+Math.sin(a)*r); m.scale.set(.18,.42,.18); m.rotation.set(t*2+i,t*1.5,0); });
     sn.visible=true; for(let i=0;i<130;i++){ const a=i*.5+t*(1+(i%4)*.3), r=.8+(i%13)*.28; setP(sn,i,U.A.x+Math.cos(a)*r,ay+((i*.21+t*.7)%3),U.A.z+Math.sin(a)*r); } sn.geometry.attributes.position.needsUpdate=true; },
   fire(u,t){ cr.forEach(m=>m.visible=false); sn.visible=false; const n=sp.length; sp.forEach((m,i)=>{ const f=i/n, k=sat((u*1.25-f*.9)/.35); m.visible=k>0; const p=U.A.clone().lerp(U.Bf,f*.92+.04); p.addScaledVector(U.pp,Math.sin(i*2.3)*1.2); m.position.set(p.x,k*.9,p.z); m.scale.set(.32+.1*(i%3),.2+2.2*k*(.7+.3*(i%3)/2),.32+.1*(i%3)); });
     U.focus.copy(U.A).lerp(U.Bf,u).add(new V3(0,.8,0)); disk.scale.setScalar(3.7+u*2); },
   onImpact(){ blk.visible=blk2.visible=true; blk.position.copy(U.Bf); blk2.position.copy(U.Bf); sp.forEach(m=>{ m.scale.y*=1.2; }); ring.visible=true; ring.position.set(U.Bf.x,.14,U.Bf.z); ubBurst66(U,sh,U.Bf.clone(),90,4,1.2); flashU(U,'#bfeaff'); },
   impact(u){ const e=easeO(u); const a=Math.atan2(U.d.x,U.d.z); [blk,blk2].forEach((b,j)=>{ b.rotation.y=a; b.scale.set(2.6*(.3+.7*e)+j*.25,2.3*e*(1+j*.08)+.1,5.5*(.3+.7*e)+j*.25); b.position.y=U.Bf.y+1.15*e-.2; }); ring.scale.setScalar(1+5*e); ring.material.opacity=.9*(1-u); ubStep66(sh,u*.5,3); },
   post(u){ blk.material.opacity=.35*(1-u*.5); blk2.material.opacity=.18*(1-u); ring.visible=false; disk.material.opacity=.35*(1-u); ubStep66(sh,.5+u*.5,3); sp.forEach(m=>m.scale.y*=1-u*.02); }}; };

/* 5 · CYCLONE ZÉPHYR (vent) : une tornade naît autour de la voiture, avance et engloutit l'adversaire */
CBFX.cyclone=U=>{ const N=460, tor=fxP(U,N,0xcffff0,.2), body=fxM(U,CONE1,0x8fffc8,.1), deb=[], pp0=[]; for(let i=0;i<N;i++) pp0.push([rr(0,1),rr(0,6.283),rr(.7,1.5)]); for(let i=0;i<16;i++) deb.push(fxS(U,BOX1,0xa8c8b8)); const lay=[]; for(let i=0;i<10;i++) lay.push(fxM(U,RING2,i%2?0xcffff0:0x8fffc8,.34)); const pos=U.cen.clone(), base=U.A.clone(); base.y=0; let tp=base.clone(); U.focus=pos; U.orb0=Math.atan2(U.cam.position.z-U.Bf.z,U.cam.position.x-U.Bf.x);
  const draw=(at,sc,sp,t)=>{ tor.visible=true; body.visible=true; for(let i=0;i<N;i++){ const [h,a,s]=pp0[i], H=h*8*sc, r=(.35+h*2.8)*sc*(.8+.25*Math.sin(i)), ang=a+t*sp*s*(2.4-h); setP(tor,i,at.x+Math.cos(ang)*r,.1+H,at.z+Math.sin(ang)*r); } tor.geometry.attributes.position.needsUpdate=true; body.position.set(at.x,4*sc,at.z); body.rotation.x=Math.PI; body.scale.set(3.1*sc,8*sc,3.1*sc); body.material.opacity=.16; lay.forEach((m,i)=>{ const h=(i+.5)/10, r=(.45+h*2.9)*sc; m.visible=true; m.position.set(at.x+Math.sin(t*3+i)*.12*sc,.15+h*8*sc,at.z+Math.cos(t*3+i)*.12*sc); m.rotation.set(Math.PI/2,0,t*(3+i*.5)); m.scale.setScalar(r); });
    deb.forEach((m,i)=>{ m.visible=sc>.5; const h=((i*.13+t*.5)%1), ang=i*2.1+t*(6-h*3), r=(.8+h*2.4)*sc; m.position.set(at.x+Math.cos(ang)*r,.3+h*7*sc,at.z+Math.sin(ang)*r); m.rotation.set(t*3+i,t*2,0); m.scale.setScalar(.12+.08*(i%3)); }); };
  return {snd:'wind',camMode:'follow',
   charge(k,t){ draw(base,.2+.3*k,3,t); pos.copy(base).add(new V3(0,1.5,0)); },
   fire(u,t){ tp.copy(base).lerp(U.Bf,easeI(u)*.9+u*.1); tp.y=0; draw(tp,.5+.7*u,3.5,t); pos.copy(tp).add(new V3(0,2,0)); U.focus.copy(pos); },
   onImpact(){ },
   impact(u,t){ draw(U.Bf,1.25,4,t); U.focus.copy(U.Bf).add(new V3(0,2.5,0)); U.camMode='orbit'; },
   post(u,t){ draw(U.Bf,1.25*(1-u*.9)+.05,4,t); }}; };

/* 6 · TROU NOIR (ténèbres) : une orbe sombre grossit en trou noir à disque d'accrétion qui aspire l'adversaire */
CBFX.trounoir=U=>{ const hole=fxM(U,SPH1,0x000000,1,false), rim=fxM(U,SPH1,0xa56bff,.45), disk=fxM(U,RING2,0xc79bff,.85), disk2=fxM(U,RING2,0xff5ad6,.55), spir=fxP(U,300,0xc9a0ff,.17), sp0=[]; for(let i=0;i<300;i++) sp0.push([rr(0,6.283),rr(1.4,6.5),rr(-1,1)]); const pos=U.cen.clone(), at=U.Bf.clone().add(new V3(0,2.2,0)); rim.material.side=THREE.BackSide; U.focus=pos;
  const gfx=(p,k,t)=>{ [hole,rim,disk,disk2].forEach(m=>{ m.visible=true; m.position.copy(p); }); hole.scale.setScalar(.7*k); rim.scale.setScalar(1.12*k+.05*Math.sin(t*12)); disk.scale.setScalar(2.4*k); disk2.scale.setScalar(3.4*k); disk.rotation.set(Math.PI/2-.5,0,t*3); disk2.rotation.set(Math.PI/2-.5,0,-t*2); };
  const spiral=(p,k,t,spd)=>{ spir.visible=true; for(let i=0;i<300;i++){ const [a,r0,y]=sp0[i], f=((r0/6.5)-t*.18*spd+10)%1, r=(.4+f*6.1)*k, ang=a+t*spd*(3-f*2.4); setP(spir,i,p.x+Math.cos(ang)*r,p.y+y*(.3+f)*k*.8,p.z+Math.sin(ang)*r); } spir.geometry.attributes.position.needsUpdate=true; };
  const pull=(u)=>{ const g=CB3.g[1-U.s].g; g.scale.multiplyScalar(1-.28*u); g.position.lerp(at.clone().setY(g.position.y+.4*u),.26*u); g.rotation.z+=.35*u*Math.sin(U.t*14); };
  return {snd:'dark',camMode:'target',camFn:(U,t)=>{ const pos=U.Bf.clone().addScaledVector(U.d,-8).addScaledVector(U.pp,3.4); pos.y=U.Bf.y+3.2; return {pos,look:U.Bf.clone().add(new V3(0,1.7,0))}; },
   charge(k,t){ tintU(U,'#150524',.5*k); gfx(pos,.15+.6*k,t); spiral(pos,.3+k*.4,t,1); },
   fire(u,t){ tintU(U,'#150524',.5+.2*u); pos.copy(U.cen).lerp(at,easeI(u)); gfx(pos,.75+1.25*easeI(u),t); spiral(pos,.7+u*.8,t,1.3); U.focus.copy(pos); },
   onImpact(){ flashU(U,'#c9a0ff'); },
   impact(u,t){ tintU(U,'#150524',.7); gfx(at,2,t); spiral(at,1.5,t,1.8); pull(u); U.focus.copy(at); },
   post(u,t){ tintU(U,'#150524',.7*(1-u)); const k=2*(1-easeI(u))+.01; gfx(at,k,t); spiral(at,1.5*(1-u*.8),t,1.8); pull(1-u); if(u>.9){ [hole,rim,disk,disk2,spir].forEach(m=>m.visible=false); } }}; };

/* 7 · SUPERNOVA (lumière) : une étoile naît au-dessus de la voiture, file sur l'adversaire et explose en nova */
CBFX.supernova=U=>{ const core=fxM(U,SPH1,0xffffff,.95), shell=fxM(U,SPH1,0xffe08a,.5), nova=fxM(U,SPH1,0xfff2c0,.5), nova2=fxM(U,SPH1,0xffc24a,.4), ring=fxM(U,RING1,0xfff2c0,.9), rays=[], em=fxP(U,100,0xfff2c0,.22); ring.rotation.x=-Math.PI/2; for(let i=0;i<26;i++) rays.push(fxM(U,BOX1,i%2?0xfff2c0:0xffc24a,.6));
  const star=U.Af.clone().add(new V3(0,3.3,0)), pos=star.clone(), hi=U.Bf.clone().add(new V3(0,4.2,0)); U.focus=pos;
  const put=(p,k,t)=>{ [core,shell].forEach(m=>{ m.visible=true; m.position.copy(p); }); core.scale.setScalar(.35*k*(1+.12*Math.sin(t*20))); shell.scale.setScalar(.8*k); rays.forEach((r,i)=>{ const a=i/26*6.283+t*1.2, l=(i%2?2.8:1.8)*k; r.visible=true; r.position.copy(p).add(new V3(Math.cos(a)*l/2,Math.sin(a*1.3)*l/3,Math.sin(a)*l/2)); r.scale.set(.05*k,.05*k,l); r.lookAt(p); }); };
  return {snd:'light',camMode:'wide',
   charge(k,t){ put(star,.1+.9*k*k,t); U.focus.copy(star); },
   fire(u,t){ pos.copy(star).lerp(hi,easeI(u)); pos.y+=Math.sin(Math.PI*u)*1.4; put(pos,1+.4*u,t); U.focus.copy(pos); },
   onImpact(){ core.visible=shell.visible=false; rays.forEach(r=>r.visible=false); [nova,nova2,ring].forEach(m=>{ m.visible=true; m.position.copy(hi).setY(2.2); }); ring.position.y=.15; ring.position.x=U.Bf.x; ring.position.z=U.Bf.z; ubBurst66(U,em,hi.clone().setY(2.2),100,7,.8); flashU(U,'#fff7d6'); },
   impact(u,t){ const e=easeO(u); nova.scale.setScalar(.5+8*e); nova2.scale.setScalar(.3+5*e); nova.material.opacity=.5*(1-u*.6); ring.scale.setScalar(1+12*e); ring.material.opacity=.9*(1-u); ubStep66(em,u*.4,2); U.focus.copy(U.Bf).add(new V3(0,2,0)); },
   post(u){ nova.material.opacity=.3*(1-u); nova2.scale.setScalar(5*(1-u*.8)); nova2.material.opacity=.4*(1-u); ring.visible=false; ubStep66(em,.4+u*.6,2); }}; };

/* 8 · SURTENSION (électrik) : arcs électriques autour de la voiture, éclair en chaîne, l'adversaire est enveloppé d'arcs */
CBFX.surtension=U=>{ const arcs=[]; for(let i=0;i<6;i++) arcs.push(fxBolt(U,6,.045,0xffe84a)); const main=fxBolt(U,12,.1,0xffe84a), br=[]; for(let i=0;i<3;i++) br.push(fxBolt(U,5,.06,0x9fe0ff)); const wr=[]; for(let i=0;i<7;i++) wr.push(fxBolt(U,6,.06,0xffe84a)); const sp=fxP(U,70,0xfff6a0,.2), ring=fxM(U,RING1,0xffe84a,.9); ring.rotation.x=-Math.PI/2; const fr=new V3(); U.focus=U.cen.clone();
  const around=(c,r,list,j)=>list.forEach((b,i)=>{ const a=new V3(rr(-1,1),rr(-.2,1),rr(-1,1)).normalize().multiplyScalar(r), b2=new V3(rr(-1,1),rr(-.2,1),rr(-1,1)).normalize().multiplyScalar(r*rr(.5,1)); boltSet(b,c.clone().add(a),c.clone().add(b2),.5); });
  return {snd:'elec',camMode:'follow',
   charge(k,t){ if(((t*30)|0)%2===0){ const c=U.Af.clone().add(new V3(0,.4,0)); around(c,1.5+.9*k,arcs); } sp.visible=true; for(let i=0;i<70;i++) setP(sp,i,U.A.x+rr(-1.6,1.6),U.A.y+rr(0,2.2),U.A.z+rr(-1.6,1.6)); sp.geometry.attributes.position.needsUpdate=true; if(k>.7&&Math.random()<.2) flashU(U,'#fff6a0'); },
   fire(u,t){ arcs.forEach(boltOff); const head=U.cen.clone().lerp(U.Bf,Math.min(1,u*1.6)); boltSet(main,U.cen,head,.7+u*.4); br.forEach((b,i)=>{ const o=U.cen.clone().lerp(head,.25+i*.25); boltSet(b,o,o.clone().add(new V3(rr(-2,2),rr(-1,1.5),rr(-2,2))),.4,u>.2); }); U.focus.copy(head); if(Math.random()<.25) flashU(U,'#fff6a0'); },
   onImpact(){ flashU(U,'#fffbd0'); ring.visible=true; ring.position.set(U.Bf.x,.15,U.Bf.z); },
   impact(u){ boltSet(main,U.cen,U.Bf.clone().add(new V3(0,.8,0)),.5); wr.forEach(b=>boltSet(b,U.Bf.clone().add(new V3(rr(-1.3,1.3),rr(0,.3),rr(-2.3,2.3))),U.Bf.clone().add(new V3(rr(-1.3,1.3),rr(.8,2),rr(-2.3,2.3))),.45)); ring.scale.setScalar(1+6*u); ring.material.opacity=.9*(1-u); if(Math.random()<.35) flashU(U,'#fff6a0'); },
   post(u){ boltOff(main); br.forEach(boltOff); wr.forEach((b,i)=>{ if(Math.random()<1-u) boltSet(b,U.Bf.clone().add(new V3(rr(-1.3,1.3),rr(0,.3),rr(-2.3,2.3))),U.Bf.clone().add(new V3(rr(-1.3,1.3),rr(.8,2),rr(-2.3,2.3))),.45); else boltOff(b); }); ring.visible=false; sp.visible=false; }}; };

/* 9 · FORTERESSE MOBILE (acier) : des plaques d'acier forment une carapace, la voiture charge sous un bouclier */
CBFX.forteresse=U=>{ const pl=[], N=14; for(let i=0;i<N;i++){ const m=fxS(U,BOX1,i%2?0x9aa3b8:0x7e879c); pl.push(m); } const dome=fxM(U,SPH1,0x8fb4ff,.18), ring=fxM(U,RING1,0xcfd6e6,.9), sh=fxP(U,80,0xdfe6f6,.2), sk=fxP(U,60,0xffd24a,.18); ring.rotation.x=-Math.PI/2; const g=()=>CB3.g[U.s].g; U.focus=U.cen.clone(); U.noLunge=true;
  const tgt=i=>{ const a=i/N*6.283, r=1.0+(i%2)*.15; return new V3(Math.cos(a)*2.55*r,.35+(i%3)*.38,Math.sin(a)*1.25*r); };
  const place=(k,root,t)=>{ pl.forEach((m,i)=>{ const T=tgt(i), far=T.clone().multiplyScalar(1+3.5*(1-k)).add(new V3(0,3*(1-k),0)); m.visible=true; const q=new V3().copy(far); m.position.copy(root).add(q); m.scale.set(.9,.5,.12); m.lookAt(root.clone().add(new V3(0,.9,0))); }); };
  return {snd:'steel',camMode:'follow',
   charge(k,t){ place(easeO(k),U.A,t); sk.visible=true; for(let i=0;i<60;i++) setP(sk,i,U.A.x+rr(-2.6,2.6),U.A.y+rr(0,1.8),U.A.z+rr(-1.4,1.4)); sk.geometry.attributes.position.needsUpdate=true; if(k>.5) { dome.visible=true; dome.position.copy(U.Af); dome.scale.set(3.4*k,2.3*k,2.2*k); } },
   fire(u,t){ spinWheels(U,45); const p=dashPos(U,easeI(u)*(2-easeI(u))); g().position.copy(p); place(1,p,t); dome.visible=true; dome.position.copy(p).add(new V3(0,.9,0)); dome.rotation.y=Math.atan2(U.d.x,U.d.z); dome.scale.set(2.2,2.3,3.6); U.focus.copy(p).add(new V3(0,.9,0)); },
   onImpact(){ sk.visible=false; const at=U.Bf.clone().addScaledVector(U.d,-1.5); ubBurst66(U,sh,at.setY(.6),80,6,1.1); ring.visible=true; ring.position.set(at.x,.15,at.z); flashU(U,'#dfe6f6'); },
   impact(u){ g().position.copy(dashPos(U,1)); pl.forEach((m,i)=>{ const T=tgt(i); m.position.copy(dashPos(U,1)).add(T.clone().multiplyScalar(1+u*1.4)).add(new V3(0,u*1.6-u*u,0)); m.rotation.x+=.1; m.material.opacity=1; }); ring.scale.setScalar(1+6*u); ring.material.opacity=.9*(1-u); dome.material.opacity=.18*(1-u); ubStep66(sh,u*.5,5); },
   post(u){ g().position.copy(dashPos(U,1).lerp(U.A,easeO(Math.min(1,u*1.4)))); pl.forEach(m=>{ m.visible=u<.35; m.position.y-=.05; }); dome.visible=false; ring.visible=false; ubStep66(sh,.5+u*.5,5); }}; };

/* 10 · CATACLYSME TELLURIQUE (terre) : une faille de lave déchire le sol jusqu'à l'adversaire, rochers et éruption */
CBFX.cataclysme=U=>{ const seg=[], glow=[], rocks=[]; const NS=16; for(let i=0;i<NS;i++){ seg.push(fxS(U,BOX1,0x2a1d14)); glow.push(fxM(U,BOX1,0xff6a1a,.8)); } for(let i=0;i<14;i++) rocks.push(fxS(U,i%2?DOD1:BOX1,0x6b5640)); const cr=[]; for(let i=0;i<7;i++) cr.push(fxM(U,BOX1,0xff8a2a,.7)); const dust=[]; for(let i=0;i<6;i++) dust.push(fxM(U,SPH1,0x8a7a66,.5,false)); const col=fxM(U,CYL1,0xff7a1a,.6), fly=[]; for(let i=0;i<12;i++) fly.push(fxS(U,DOD1,0x6b5640)); const fv=[]; for(let i=0;i<12;i++) fv.push([rr(-3.5,3.5),rr(6,11),rr(-3.5,3.5)]); const jit=[]; for(let i=0;i<NS;i++) jit.push([rr(-.9,.9),rr(.8,1.4)]);
  const line=(f)=>U.A.clone().lerp(U.Bf,f); const a0=Math.atan2(U.d.x,U.d.z); U.focus=U.cen.clone(); U.shk=0;
  const cracks=(k)=>cr.forEach((m,i)=>{ const a=i/7*6.283+.4; m.visible=true; m.position.set(U.A.x+Math.cos(a)*k*1.8,.06,U.A.z+Math.sin(a)*k*1.8); m.scale.set(.12,.05,3.4*k); m.rotation.y=-a+Math.PI/2; });
  const fis=(u)=>{ for(let i=0;i<NS;i++){ const f=i/NS, k=sat((u*1.25-f)/.25); const p=line(.06+f*.9).addScaledVector(U.pp,jit[i][0]); const s=seg[i], g2=glow[i]; s.visible=g2.visible=k>0; s.position.set(p.x,.1,p.z); g2.position.set(p.x,.07,p.z); const w=.5+.5*jit[i][1], L=U.A.distanceTo(U.Bf)/NS*1.5; s.scale.set(w*k,.18,L); g2.scale.set(w*1.7*k,.1,L*1.05); s.rotation.y=g2.rotation.y=a0+jit[i][0]*.35; }
    rocks.forEach((r,i)=>{ const f=i/14, k=sat((u*1.25-f)/.3); r.visible=k>0; const p=line(.1+f*.85).addScaledVector(U.pp,(i%2?1:-1)*(1.1+.5*(i%3))); r.position.set(p.x,.3+k*.6*(1+(i%3)*.4),p.z); r.scale.setScalar((.35+.2*(i%4))*k); r.rotation.set(i,i*2,0); }); };
  return {snd:'earth',camMode:'wide',
   charge(k,t){ cracks(.2+.8*k); U.shk=.1*k; dust.forEach((m,i)=>{ m.visible=true; const a=i/6*6.283; m.position.set(U.A.x+Math.cos(a)*1.5,.4+k*.5,U.A.z+Math.sin(a)*1.5); m.scale.setScalar(.5+k*.8); m.material.opacity=.4*k; }); },
   fire(u){ U.shk=.22; cr.forEach(m=>m.visible=false); fis(u); U.focus.copy(line(.1+u*.85)).add(new V3(0,.6,0)); },
   onImpact(){ fly.forEach((r,i)=>{ r.visible=true; r.position.set(U.Bf.x,.4,U.Bf.z); r.scale.setScalar(.4+.15*(i%4)); }); col.visible=true; col.position.set(U.Bf.x,.1,U.Bf.z); dust.forEach((m,i)=>{ m.position.set(U.Bf.x+rr(-1,1),.6,U.Bf.z+rr(-1,1)); m.visible=true; }); flashU(U,'#ffb060'); U.shk=.5; },
   impact(u){ U.shk=.5*(1-u); const e=easeO(u); col.scale.set(1.4,6*e,1.4); col.position.y=3*e; fly.forEach((r,i)=>{ const v=fv[i]; r.position.set(U.Bf.x+v[0]*u*.7,.4+v[1]*u-9*u*u,U.Bf.z+v[2]*u*.7); r.rotation.x+=.2; }); dust.forEach((m,i)=>{ m.scale.setScalar(.8+u*3); m.position.y=.6+u*1.5; m.material.opacity=.5*(1-u*.4); }); },
   post(u){ U.shk=0; col.scale.set(1.4*(1-u),6*(1-u),1.4*(1-u)); fly.forEach((r,i)=>{ const v=fv[i]; const t=1+u*.5; r.position.set(U.Bf.x+v[0]*.7*t*.9,Math.max(.2,.4+v[1]-9),U.Bf.z+v[2]*.7*t*.9); r.visible=u<.7; }); dust.forEach(m=>{ m.scale.setScalar(3.8+u*2); m.material.opacity=.3*(1-u); }); glow.forEach(g2=>g2.material.opacity=.8*(1-u)); }}; };

/* 11 · HYPER-RAYON TURBO (lumière, légendaire) : un faisceau colossal balaie l'adversaire */
CBFX.hyperrayon=U=>{ const o=fxM(U,SPH1,0xffffff,.9), halo=fxM(U,SPH1,0xffe66b,.3), beam=fxM(U,CYL1,0xffe66b,.55), core=fxM(U,CYL1,0xffffff,.9), spiral=[], sp=fxP(U,90,0xfff2a0,.2), rings=[], st=fxP(U,60,0xfff2a0,.2); for(let i=0;i<8;i++) spiral.push(fxM(U,TOR1,0xffffff,.7)); for(let i=0;i<3;i++){ const r=fxM(U,RING1,0xffe66b,.8); r.rotation.x=-Math.PI/2; rings.push(r); }
  const end=U.cen.clone().lerp(U.Bf,1).addScaledVector(U.d,3.5); end.y=U.Bf.y; const L=U.cen.distanceTo(end), mid=new V3(), q=new THREE.Quaternion(); U.focus=U.cen.clone(); const dirv=end.clone().sub(U.cen).normalize();
  const setBeam=(len,w,t)=>{ mid.copy(U.cen).addScaledVector(dirv,len/2); q.setFromUnitVectors(UP,dirv); [beam,core].forEach((b,j)=>{ b.visible=true; b.position.copy(mid); b.quaternion.copy(q); b.scale.set(w*(j?.34:1)*(1+.08*Math.sin(t*40)),len,w*(j?.34:1)); }); spiral.forEach((r,i)=>{ const f=((i/8)+t*1.6)%1; r.visible=true; r.position.copy(U.cen).addScaledVector(dirv,f*len); r.quaternion.setFromUnitVectors(new V3(0,0,1),dirv); r.scale.setScalar(w*(1.05+.12*Math.sin(i+t*8))); }); };
  return {snd:'light',camMode:'wide',
   charge(k,t){ [o,halo].forEach(m=>{ m.visible=true; m.position.copy(U.cen); }); o.scale.setScalar(.15+.7*k*k); halo.scale.setScalar(.4+1.6*k*k); st.visible=true; for(let i=0;i<60;i++){ const a=i*2.4, r=(3-2.6*k)*(1+(i%5)*.2), h=((i*.17+t*.8)%1); setP(st,i,U.cen.x+Math.cos(a+t*4)*r,U.cen.y+(h-.5)*r*1.2,U.cen.z+Math.sin(a+t*4)*r); } st.geometry.attributes.position.needsUpdate=true; },
   fire(u,t){ st.visible=false; const len=L*easeO(sat(u*3)); setBeam(len,.62,t); o.scale.setScalar(.9+.15*Math.sin(t*30)); halo.scale.setScalar(2.2); U.focus.copy(U.cen).addScaledVector(dirv,len*.7); },
   onImpact(){ flashU(U,'#fff7c2'); rings.forEach(r=>{ r.visible=true; r.position.set(U.Bf.x,.14,U.Bf.z); }); ubBurst66(U,sp,U.Bf.clone().setY(1),90,6,1.2); },
   impact(u,t){ setBeam(L,.7+.5*u,t); rings.forEach((r,j)=>{ r.scale.setScalar(1+(u+j*.3)*8); r.material.opacity=.8*(1-u); }); ubStep66(sp,u*.5,3); },
   post(u,t){ const w=1.2*(1-easeI(u))+.02; setBeam(L,w,t); o.visible=halo.visible=u<.4; rings.forEach(r=>r.visible=false); ubStep66(sp,.5+u*.5,3); if(u>.92){ [beam,core,...spiral].forEach(m=>m.visible=false); } }}; };

/* 12 · BOMBE STELLAIRE (méca, légendaire) : une bombe hérissée de pointes est lobée sur l'adversaire, explosion en champignon */
CBFX.bombestellaire=U=>{ const bomb=new THREE.Group(); const bs=fxS(U,ICO1,0x2b2d3a); bs.visible=true; U.sc.remove(bs); bomb.add(bs); bs.scale.setScalar(.6); const cores=new THREE.Mesh(SPH1,new THREE.MeshBasicMaterial({color:0xffc24a,transparent:true,opacity:.95,blending:ADD})); cores.scale.setScalar(.34); bomb.add(cores); for(let i=0;i<12;i++){ const s=new THREE.Mesh(CONE1,new THREE.MeshLambertMaterial({color:0x9aa3b8})), d=new V3(Math.sin(i*2.4)*Math.cos(i),Math.cos(i*2.4),Math.sin(i*2.4)*Math.sin(i)).normalize(); s.position.copy(d).multiplyScalar(.7); s.quaternion.setFromUnitVectors(UP,d); s.scale.set(.1,.35,.1); bomb.add(s); } bomb.visible=false; U.sc.add(bomb); U.objs.push(bomb);
  const glow=fxM(U,SPH1,0xff5a2a,.3), tr=[]; for(let i=0;i<12;i++) tr.push(fxM(U,SPH1,0x6b6f80,.4-i*.025,false)); const fb=fxM(U,SPH1,0xff8a2a,.8), fb2=fxM(U,SPH1,0xffe08a,.8), stalk=fxM(U,CYL1,0xff9a3a,.6), cap=fxM(U,SPH1,0xff7a2a,.7), cap2=fxM(U,SPH1,0x4a3a3a,.55,false), dome=fxM(U,SPH1,0xffe9c0,.2), ring=fxM(U,RING1,0xffd9a0,.9), em=fxP(U,100,0xffb04a,.24); ring.rotation.x=-Math.PI/2; const pos=U.cen.clone(), hist=[]; U.focus=pos;
  const put=(p,k,t,fast)=>{ bomb.visible=true; bomb.position.copy(p); bomb.scale.setScalar(k); bomb.rotation.set(t*3,t*4,0); glow.visible=true; glow.position.copy(p); glow.scale.setScalar(1.3*k*(1+.25*Math.sin(t*(fast?40:20)))); cores.material.opacity=.6+.4*Math.sin(t*(fast?50:24)); };
  return {snd:'mech',camMode:'follow',camFn:(U,t)=>{ if(t<CBU2.T2){ const p=pos.clone().addScaledVector(U.d,-5.2).addScaledVector(U.pp,1.7); p.y=pos.y+1.3; return {pos:p,look:pos.clone().addScaledVector(U.d,2.4)}; } const mid=U.Af.clone().lerp(U.Bf,.5), p=mid.clone().addScaledVector(U.pp,15); p.y=5.5; return {pos:p,look:U.Bf.clone().add(new V3(0,2.6,0))}; },
   charge(k,t){ put(U.cen,.25+.75*k,t,false); },
   fire(u,t){ pos.copy(U.cen).lerp(U.Bf,u); pos.y+=Math.sin(Math.PI*u)*5.5; put(pos,1,t,true); hist.unshift(pos.clone()); if(hist.length>40) hist.pop(); tr.forEach((m,i)=>{ const h=hist[Math.min(hist.length-1,(i+1)*3)]; if(h){ m.visible=true; m.position.copy(h); m.scale.setScalar(.35+i*.03); } }); },
   onImpact(){ bomb.visible=false; glow.visible=false; tr.forEach(m=>m.visible=false); [fb,fb2,stalk,cap,cap2,dome,ring].forEach(m=>{ m.visible=true; m.position.set(U.Bf.x,U.Bf.y,U.Bf.z); }); ring.position.y=.15; ubBurst66(U,em,U.Bf.clone(),100,7,1.3); flashU(U,'#ffe9c0'); },
   impact(u){ const e=easeO(u); fb.scale.setScalar(.6+3.8*e); fb2.scale.setScalar(.3+2.4*e); dome.scale.setScalar(1+5*e); dome.material.opacity=.13*(1-u); ring.scale.setScalar(1+10*e); ring.material.opacity=.9*(1-u); stalk.scale.set(.9*e,4*e,.9*e); stalk.position.y=2*e; cap.scale.setScalar(.4+2*e); cap.position.y=4*e+.4; ubStep66(em,u*.4,5); U.focus.copy(U.Bf).add(new V3(0,2.4,0)); },
   post(u){ stalk.scale.set(.9+.4*u,4+2*u,.9+.4*u); stalk.position.y=2+u; stalk.material.opacity=.6*(1-u); cap.scale.setScalar(2.4+1.6*u); cap.position.y=4.4+2*u; cap.material.opacity=.7*(1-u*.8); cap2.visible=true; cap2.position.set(U.Bf.x,4.6+2.2*u,U.Bf.z); cap2.scale.setScalar(2.6+1.8*u); cap2.material.opacity=.5*(1-u*.6); fb.material.opacity=.8*(1-u); fb2.visible=false; dome.visible=false; ring.visible=false; ubStep66(em,.4+u*.6,5); }}; };

/* 13 · MÉTÉORE INFERNAL (feu, légendaire) : un météore géant tombe du ciel sur l'adversaire */
CBFX.meteore=U=>{ const rock=fxS(U,DOD1,0x4a2a1a), lava=fxM(U,SPH1,0xff7a1a,.5), core=fxM(U,SPH1,0xffd24a,.7), tail=fxM(U,CONE1,0xff5a1a,.55), tr=[], sm=[]; for(let i=0;i<16;i++){ tr.push(fxM(U,SPH1,i%2?0xff8a2a:0xffb04a,.5-i*.025)); } for(let i=0;i<3;i++){ const r=fxS(U,DOD1,0x4a2a1a), l=fxM(U,SPH1,0xff7a1a,.5); sm.push([r,l]); }
  const F1=fxM(U,SPH1,0xff6a1a,.75), F2=fxM(U,SPH1,0xffe08a,.8), F3=fxM(U,SPH1,0xffffff,.8), ring=fxM(U,RING1,0xffb04a,.9), crater=fxM(U,CIRC1,0x1a0e08,.8,false), em=fxP(U,120,0xffb04a,.26), sparks=fxP(U,60,0xffb04a,.18), fly=[]; for(let i=0;i<10;i++) fly.push(fxS(U,DOD1,0x4a2a1a)); ring.rotation.x=crater.rotation.x=-Math.PI/2;
  const start=U.Bf.clone().addScaledVector(U.d,-15).add(new V3(0,32,0)).addScaledVector(U.pp,5), end=U.Bf.clone().add(new V3(0,.4,0)), dir=end.clone().sub(start).normalize(), pos=start.clone(), hist=[]; U.focus=pos; const fv=[]; for(let i=0;i<10;i++) fv.push([rr(-4,4),rr(6,11),rr(-4,4)]);
  const met=(p,t,k)=>{ rock.visible=lava.visible=core.visible=tail.visible=true; rock.position.copy(p); rock.scale.setScalar(1.35*k); rock.rotation.set(t*2,t*3,0); lava.position.copy(p); lava.scale.setScalar(1.95*k*(1+.05*Math.sin(t*30))); core.position.copy(p); core.scale.setScalar(1.2*k); tail.position.copy(p).addScaledVector(dir,-5*k); tail.quaternion.setFromUnitVectors(UP,dir.clone().negate().multiplyScalar(-1)); tail.scale.set(1.6*k,10*k,1.6*k); tail.quaternion.setFromUnitVectors(UP,dir.clone().negate()); tail.position.copy(p).addScaledVector(dir,-5*k); sm.forEach((s,i)=>{ const o=p.clone().addScaledVector(U.pp,(i-1)*3.5).addScaledVector(dir,-3-i*2.2).add(new V3(0,2.5*(i%2?1:-.4),0)); s[0].visible=s[1].visible=true; s[0].position.copy(o); s[1].position.copy(o); s[0].scale.setScalar(.5); s[1].scale.setScalar(.8); }); };
  return {snd:'fire',camMode:'sky',
   charge(k,t){ tintU(U,'#3a0a00',.35*k); sparks.visible=true; for(let i=0;i<60;i++){ const a=i*2.3+t*3, r=.6+(i%7)*.25; setP(sparks,i,U.A.x+Math.cos(a)*r,U.A.y+((i*.19+t*1.6)%3.2),U.A.z+Math.sin(a)*r); } sparks.geometry.attributes.position.needsUpdate=true; U.focus.copy(start).lerp(U.cen,.5); },
   fire(u,t){ tintU(U,'#3a0a00',.35); sparks.visible=false; pos.copy(start).lerp(end,Math.pow(u,1.5)); met(pos,t,1); hist.unshift(pos.clone()); if(hist.length>40) hist.pop(); tr.forEach((m,i)=>{ const h=hist[Math.min(hist.length-1,(i+1)*2)]; if(h){ m.visible=true; m.position.copy(h); m.scale.setScalar(1.3-i*.06); } }); U.focus.copy(pos); },
   onImpact(){ [rock,lava,core,tail,...tr].forEach(m=>m.visible=false); sm.forEach(s=>s.forEach(m=>m.visible=false)); [F1,F2,F3,ring,crater].forEach(m=>{ m.visible=true; m.position.set(U.Bf.x,U.Bf.y,U.Bf.z); }); ring.position.y=crater.position.y=.13; fly.forEach((r,i)=>{ r.visible=true; r.position.set(U.Bf.x,.5,U.Bf.z); r.scale.setScalar(.4+.15*(i%4)); }); ubBurst66(U,em,U.Bf.clone(),120,8,1.4); flashU(U,'#ffd9a0'); },
   impact(u){ tintU(U,'#3a0a00',.35*(1-u)); const e=easeO(u); F1.scale.setScalar(.6+4.4*e); F2.scale.setScalar(.4+3*e); F3.scale.setScalar(.2+1.6*e); ring.scale.setScalar(1+11*e); ring.material.opacity=.9*(1-u); crater.scale.setScalar(.5+3.2*e); fly.forEach((r,i)=>{ const v=fv[i]; r.position.set(U.Bf.x+v[0]*u*.6,.5+v[1]*u-10*u*u,U.Bf.z+v[2]*u*.6); }); ubStep66(em,u*.4,6); },
   post(u){ F1.material.opacity=.75*(1-u); F2.material.opacity=.8*(1-u); F3.visible=false; ring.visible=false; fly.forEach(r=>r.visible=u<.6); ubStep66(em,.4+u*.6,6); tintU(U,'#3a0a00',0); }}; };

/* 14 · RAZ-DE-MARÉE TITANESQUE (eau, légendaire) : un mur d'eau géant déferle et s'écrase sur l'adversaire */
CBFX.razdemaree=U=>{ const W=17, Ls=8, nx=34, nz=16, geo=new THREE.PlaneGeometry(W,Ls,nx,nz); geo.rotateX(-Math.PI/2); const pos0=geo.attributes.position.array.slice(); const wave=fxM(U,geo,0x2fa8ff,.6), wave2=fxM(U,geo,0xcfeeff,.28), foam=fxP(U,140,0xffffff,.28), sp=fxP(U,100,0xdff3ff,.22), rings=[0x8fd6ff,0xffffff].map(c=>fxM(U,RING1,c,.7)), sw=fxM(U,TOR1,0x6fc4ff,.8), mist=fxP(U,80,0xbfe6ff,.2); rings.forEach(r=>r.rotation.x=-Math.PI/2); const ay=Math.atan2(U.d.x,U.d.z); const front=U.Bf.clone().addScaledVector(U.d,4.5); U.focus=U.cen.clone();
  const shape=(H,curl,t)=>{ const a=geo.attributes.position.array; for(let i=0;i<a.length;i+=3){ const x=pos0[i], z=pos0[i+2]/(Ls/2)*.5+.5; /* z 0..1 (0 = face avant) */ const prof=Math.pow(Math.sin(Math.PI*Math.min(1,z*.78)),1.4)*(z<.62?1:Math.max(0,1-(z-.62)/.38*(1-curl))); a[i+1]=H*(prof*(1+.14*Math.sin(x*1.2+t*5))+.15*Math.sin(x*.8+z*6+t*4)); a[i+2]=pos0[i+2]+curl*H*.55*Math.pow(Math.sin(Math.PI*Math.min(1,z*.9)),2); } geo.attributes.position.needsUpdate=true; geo.computeBoundingSphere(); };
  const place=(p,H,curl,t)=>{ [wave,wave2].forEach((w,j)=>{ w.visible=true; w.position.copy(p).setY(.05+j*.04); w.rotation.y=ay; }); shape(H,curl,t); foam.visible=true; for(let i=0;i<140;i++){ const x=(i/140-.5)*W*.92, f=new V3(x,0,0).applyAxisAngle(UP,ay); setP(foam,i,p.x+f.x+rr(-.3,.3)+U.d.x*rr(0,2),H*(.9+rr(0,.25)),p.z+f.z+rr(-.3,.3)+U.d.z*rr(0,2)); } foam.geometry.attributes.position.needsUpdate=true; };
  return {snd:'water',camMode:'wide',camFn:(U,t)=>{ const p=U.Bf.clone().addScaledVector(U.d,9).addScaledVector(U.pp,6); p.y=3.4; return {pos:p,look:U.focus.clone().lerp(U.Bf,.35).add(new V3(0,1.2,0))}; },
   charge(k,t){ sw.visible=true; sw.position.set(U.A.x,U.A.y+1.1,U.A.z); sw.rotation.set(Math.PI/2,t*5,0); sw.scale.setScalar(.8+2*k); mist.visible=true; for(let i=0;i<80;i++){ const a=i*.9+t*4, r=1+(i%8)*.25; setP(mist,i,U.A.x+Math.cos(a)*r,U.A.y+((i*.11+t*1.5)%3),U.A.z+Math.sin(a)*r); } mist.geometry.attributes.position.needsUpdate=true; },
   fire(u,t){ sw.visible=false; mist.visible=false; const f=U.A.clone().addScaledVector(U.d,1.5+U.A.distanceTo(U.Bf)*easeI(u)*.88); place(f.setY(0),6.2*sat(u*3.2+.1),.0,t); U.focus.copy(f).add(new V3(0,2.2,0)); },
   onImpact(){ flashU(U,'#cfeeff'); rings.forEach(r=>{ r.visible=true; r.position.set(U.Bf.x,.14,U.Bf.z); }); ubBurst66(U,sp,U.Bf.clone().add(new V3(0,.8,0)),100,5,1.6); },
   impact(u,t){ const p=U.A.clone().addScaledVector(U.d,1.5+U.A.distanceTo(U.Bf)*.88+u*2.6); place(p.setY(0),6.2*(1-.15*u),u*.9,t); rings.forEach((r,j)=>{ r.scale.setScalar(1+(u+j*.3)*8); r.material.opacity=.7*(1-u*.7); }); ubStep66(sp,u*.5,6); U.focus.copy(U.Bf).add(new V3(0,2.2,0)); },
   post(u,t){ const p=U.A.clone().addScaledVector(U.d,1.5+U.A.distanceTo(U.Bf)*.88+2.6+u*3); place(p.setY(0),5.3*(1-u),.9,t); rings.forEach(r=>r.visible=u<.5); ubStep66(sp,.5+u*.5,6); if(u>.95){ wave.visible=wave2.visible=foam.visible=false; } }}; };

/* 15 · FOUDRE DIVINE (électrik, légendaire) : un orage s'assemble, trois éclairs gigantesques s'abattent */
CBFX.foudredivine=U=>{ const cl=[]; for(let i=0;i<12;i++) cl.push(fxM(U,SPH1,i%3?0x2a2f44:0x3a4058,.92,false)); const hi=U.Bf.clone().add(new V3(0,24,0)), mains=[fxBolt(U,14,.28,0xffe84a),fxBolt(U,12,.18,0xcfe9ff),fxBolt(U,12,.18,0xcfe9ff)], sub=[]; for(let i=0;i<4;i++) sub.push(fxBolt(U,6,.1,0xffe84a)); const wr=[]; for(let i=0;i<6;i++) wr.push(fxBolt(U,6,.07,0xffe84a)); const ring=fxM(U,RING1,0xffe84a,.9), glow=fxM(U,SPH1,0xffe84a,.3), sp=fxP(U,80,0xfff6a0,.22), gl=fxM(U,SPH1,0xffe84a,.3); ring.rotation.x=-Math.PI/2; U.focus=hi.clone();
  const puffs=(k)=>cl.forEach((m,i)=>{ m.visible=k>.02; const a=i/12*6.283, r=(i%2?5:2.6)*k; m.position.set(hi.x+Math.cos(a)*r,hi.y+Math.sin(i*1.9)*1.2,hi.z+Math.sin(a)*r); m.scale.setScalar((2.8+1.2*(i%3))*k); });
  const strike=(u)=>{ const tg=[U.Bf.clone(),U.Bf.clone().addScaledVector(U.pp,3.2),U.Bf.clone().addScaledVector(U.pp,-3.2)]; mains.forEach((b,i)=>{ const top=tg[i].clone().setY(24).add(new V3(rr(-1.5,1.5),0,rr(-1.5,1.5))); boltSet(b,top,tg[i].clone().setY(.1),1.4,(i===0)||u>.15); }); sub.forEach((b,i)=>{ const f=.3+i*.18, o=tg[0].clone().setY(24*(1-f)); boltSet(b,o,o.clone().add(new V3(rr(-4,4),-rr(2,5),rr(-4,4))),.6); }); };
  return {snd:'elec',camMode:'sky',
   charge(k,t){ tintU(U,'#0a0d1c',.45*k); puffs(k); U.focus.copy(hi); if(k>.6&&Math.random()<.25){ flashU(U,'#cfe9ff'); } },
   fire(u,t){ tintU(U,'#0a0d1c',.5); puffs(1); if(u>.15){ strike(u); } else { U.focus.copy(hi); } U.focus.copy(hi).lerp(U.Bf,sat(u*2)); if(u>.15&&Math.random()<.4) flashU(U,'#fffbd0'); },
   onImpact(){ flashU(U,'#ffffff'); ring.visible=true; ring.position.set(U.Bf.x,.15,U.Bf.z); glow.visible=true; glow.position.copy(U.Bf).setY(1.4); sp.visible=true; ubBurst66(U,sp,U.Bf.clone().setY(.8),80,5,1.3); },
   impact(u){ strike(1); wr.forEach(b=>boltSet(b,U.Bf.clone().add(new V3(rr(-1.3,1.3),rr(0,.3),rr(-2.3,2.3))),U.Bf.clone().add(new V3(rr(-1.3,1.3),rr(.8,2),rr(-2.3,2.3))),.45)); ring.scale.setScalar(1+9*u); ring.material.opacity=.9*(1-u); glow.scale.setScalar(1.5+3*u); glow.material.opacity=.3*(1-u); ubStep66(sp,u*.5,4); if(Math.random()<.4) flashU(U,'#fff6a0'); U.focus.copy(U.Bf).add(new V3(0,2,0)); },
   post(u){ tintU(U,'#0a0d1c',.5*(1-u)); mains.forEach(b=>{ if(Math.random()<1-u*1.2) strike(.5); else boltOff(b); }); sub.forEach(boltOff); wr.forEach(boltOff); puffs(1-u); ring.visible=false; glow.visible=false; ubStep66(sp,.5+u*.5,4); }}; };

/* 16 · CROCS DU GLACIER (glace, légendaire) : des crocs de glace géants se referment comme une mâchoire */
CBFX.crocsdeglace=U=>{ const lo=[], up=[], N=7, cr=[], sn=fxP(U,110,0xeafcff,.16), sh=fxP(U,100,0xdff8ff,.22), tr=[], ring=fxM(U,RING1,0xcff6ff,.9), disk=fxM(U,CIRC1,0x7fe0ff,.3); ring.rotation.x=disk.rotation.x=-Math.PI/2; for(let i=0;i<N;i++){ const a=fxM(U,CONE1,0xcff6ff,.82), b=fxM(U,CONE1,0xcff6ff,.82), a2=fxM(U,CONE1,0xffffff,.3), b2=fxM(U,CONE1,0xffffff,.3); lo.push([a,a2]); up.push([b,b2]); } for(let i=0;i<8;i++) cr.push(fxM(U,OCT1,i%2?0xcff6ff:0x7fe0ff,.8)); for(let i=0;i<12;i++) tr.push(fxM(U,CONE1,0xdff8ff,.85));
  const ay=Math.atan2(U.d.x,U.d.z); U.orb0=Math.atan2(U.cam.position.z-U.Bf.z,U.cam.position.x-U.Bf.x); U.focus=U.cen.clone();
  const jawPos=(i,j)=>{ const f=(i/(N-1)-.5)*2, side=new V3(0,0,0); const p=U.Bf.clone().addScaledVector(U.pp,f*2.3).addScaledVector(U.d,j?-1.3-Math.cos(f*1.5)*.5:1.2-Math.cos(f*1.5)*.5); return p; };
  const fang=(pairs,i,k,top,len)=>{ pairs[i].forEach((m,j)=>{ m.visible=k>0; const p=jawPos(i,top?1:0), h=len*(j?1.12:1), s=k; m.position.set(p.x,top?6.2-(6.2-len*.5-.4)*s+(len*.5):h*s*.5-.05,p.z); m.scale.set(.5*(j?1.15:1)*(.4+.6*(1-Math.abs(i/(N-1)-.5)*1.1)),h*s,.5*(j?1.15:1)); m.rotation.x=top?Math.PI:0; m.rotation.y=ay; if(top){ m.position.y=6.4-(6.4-h*.5-.2)*s; } }); };
  return {snd:'ice',camMode:'orbit',
   charge(k,t){ disk.visible=true; disk.position.set(U.A.x,.1,U.A.z); disk.scale.setScalar(.5+3*k); cr.forEach((m,i)=>{ const a=i/8*6.283-t*2.4, r=2.3-.4*k; m.visible=true; m.position.set(U.A.x+Math.cos(a)*r,U.A.y+.7+.5*Math.sin(t*3+i),U.A.z+Math.sin(a)*r); m.scale.set(.17,.42,.17); m.rotation.set(t*2+i,t*1.5,0); }); sn.visible=true; for(let i=0;i<110;i++){ const a=i*.5+t*1.2, r=.8+(i%13)*.26; setP(sn,i,U.A.x+Math.cos(a)*r,U.A.y+((i*.21+t*.7)%3),U.A.z+Math.sin(a)*r); } sn.geometry.attributes.position.needsUpdate=true; },
   fire(u,t){ cr.forEach(m=>m.visible=false); sn.visible=false; disk.scale.setScalar(3.5+u*1.5); tr.forEach((m,i)=>{ const f=i/12, k=sat((u*2-f*1.5)/.5); m.visible=k>0; const p=U.A.clone().lerp(U.Bf,.1+f*.55).addScaledVector(U.pp,Math.sin(i*2.1)*.9); m.position.set(p.x,k*.6,p.z); m.scale.set(.3,1.1*k,.3); }); for(let i=0;i<N;i++){ fang(lo,i,sat((u*1.7-.35-Math.abs(i-3)*.07)/.5),false,3.3); fang(up,i,sat((u*1.5-.2-Math.abs(i-3)*.06)/.6),true,3.0); } U.focus.copy(U.Bf).add(new V3(0,2,0)); },
   onImpact(){ for(let i=0;i<N;i++){ fang(lo,i,1,false,3.3); fang(up,i,1,true,3.0); } flashU(U,'#cfeeff'); ring.visible=true; ring.position.set(U.Bf.x,.14,U.Bf.z); ubBurst66(U,sh,U.Bf.clone().setY(1.6),100,5,1.4); },
   impact(u){ ring.scale.setScalar(1+8*u); ring.material.opacity=.9*(1-u); ubStep66(sh,u*.5,4); U.focus.copy(U.Bf).add(new V3(0,1.6,0)); },
   post(u){ const k=1-sat((u-.35)/.65); for(let i=0;i<N;i++){ lo[i].forEach(m=>{ m.material.opacity=(m.material.opacity>.5?.82:.3)*(.2+.8*k); m.visible=k>.02; m.scale.y*=1-.008; }); up[i].forEach(m=>{ m.visible=k>.02; }); } tr.forEach(m=>m.visible=false); ring.visible=false; disk.material.opacity=.3*(1-u); ubStep66(sh,.5+u*.5,4); }}; };

/* ================= cadre commun : phases, caméra, nettoyage ================= */
const CBU2={T1:1.5,T2:2.7,T3:2.95,END:4.2};
cbUlt3d=async function(e){ const ar=$('cbAr'), m=CB_MV[e.id]; if(!ar||!m||!CBV) return; const T=CB_TYPES[m.t]||CB_TYPES.meca, leg=cbIsLeg(m), K=CBV.fast?.4:1, s=e.s, sc=CB3.sc, cam=CB3.cam;
  const A=CB3.g[s].g.position.clone(), B=CB3.g[1-s].g.position.clone(), d=new THREE.Vector3(B.x-A.x,0,B.z-A.z).normalize(), pp=new THREE.Vector3(-d.z,0,d.x), col=new THREE.Color(T.c);
  if(!CB3.home) CB3.home={p:cam.position.clone(),d:cam.getWorldDirection(new THREE.Vector3())};
  const ov=document.createElement('div'); ov.className='cbleg cb3u'+(leg?' leg':''); ov.style.setProperty('--tc',T.c); ov.style.setProperty('--d',Math.round(2700*K)+'ms');
  ov.innerHTML=`<div class="cbu-tint"></div><div class="lg-dim"></div><div class="lg-ban"><small>${leg?'⭐ ATTAQUE LÉGENDAIRE':'✦ ATTAQUE ULTIME'}</small><b>${T.ic} ${m.n}</b></div><div class="lg3-flash"></div>`; ar.appendChild(ov);
  const light=new THREE.PointLight(col,0,18); sc.add(light);
  const U=CB3.U={t:0,dt:0,K,s,A,B,d,pp,perp:pp,col,ov,ar,leg,m,cam,light,objs:[light],sc,hit:false,fired:false,resolve:null,Af:new V3(A.x,A.y+.9,A.z),Bf:new V3(B.x,B.y+.9,B.z),tint:ov.querySelector('.cbu-tint'),shk:0,camMode:'follow'};
  U.cen=U.Af.clone().addScaledVector(d,2.3); U.focus=U.cen.clone();
  const F=U.fx=(CBFX[e.id]||CBFX.default)(U); U.camMode=F.camMode||'follow';
  ar.classList.add('cb3d-ult'); snd66(F.snd,'c');
  await new Promise(res=>{ U.resolve=res; }); };
const camPose=(U,mode,t)=>{ if(U.fx&&U.fx.camFn) return U.fx.camFn(U,t); const f=U.focus, Af=U.Af, Bf=U.Bf, d=U.d, pp=U.pp, pos=new V3(), look=new V3(); switch(mode){
  case 'sky': pos.copy(Af).addScaledVector(d,-5.5).addScaledVector(pp,1.6); pos.y=1.4; look.copy(f); break;
  case 'wide': { const mid=Af.clone().lerp(Bf,.5); pos.copy(mid).addScaledVector(pp,13); pos.y=5.4; look.copy(mid).lerp(f,.45); look.y=1.6; break; }
  case 'target': pos.copy(Bf).addScaledVector(d,-5).addScaledVector(pp,3.4); pos.y=Bf.y+1.9; look.copy(Bf); break;
  case 'orbit': { const a=(U.orb0||0)+(t-CBU2.T1)*1.3; pos.set(Bf.x+Math.cos(a)*8.6,Bf.y+3.6,Bf.z+Math.sin(a)*8.6); look.copy(Bf).add(new V3(0,.6,0)); break; }
  default: pos.copy(f).addScaledVector(d,-5.2).addScaledVector(pp,1.7); pos.y=f.y+1.3; look.copy(f).addScaledVector(d,2.4); } return {pos,look}; };
ultTick=function(dt){ const U=CB3.U; if(!U) return; U.dt=Math.min(dt,.05); U.t+=U.dt/U.K; const t=U.t, F=U.fx, cam=U.cam, home=CB3.home, V=THREE.Vector3, lookHome=home.p.clone().addScaledVector(home.d,40), Af=U.Af, d=U.d, pp=U.pp;
  let pos=new V(), look=new V();
  const Pf=(k)=>{ const p=Af.clone().addScaledVector(d,6.4-k*.7).addScaledVector(pp,1.5); p.y=Af.y+.9; return p; };
  if(t<CBU2.T1){ const u=ez(clamp(t/1.1,0,1)), P=Pf(clamp((t-1.1)/.4,0,1)); pos.copy(home.p).lerp(P,u); look.copy(lookHome).lerp(Af.clone().addScaledVector(d,.8),u); if(F.charge) F.charge(clamp(t/CBU2.T1,0,1),t); U.lightK=0; }
  else if(t<CBU2.T2){ if(!U.fired){ U.fired=true; if(!U.noLunge) CB3.A[U.s].lunge=CB3.t; snd66(F.snd,'f'); }
    const u=clamp((t-CBU2.T1)/(CBU2.T2-CBU2.T1),0,1); if(F.fire) F.fire(u,t); const cp=camPose(U,F.camMode||U.camMode,t), P0=Pf(1), b=ez(clamp((t-CBU2.T1)/.35,0,1)); pos.copy(P0).lerp(cp.pos,b); look.copy(Af.clone().addScaledVector(d,.8)).lerp(cp.look,b); U.camLast=pos.clone(); U.lookLast=look.clone(); }
  else if(t<CBU2.T3){ if(!U.hit){ U.hit=true; U.impT=t; snd66(F.snd,'i'); try{ ar_shake(U.ar); vib50(U.leg?[40,30,80]:[30,20,40]); }catch(_){} if(F.onImpact) F.onImpact(); }
    const u=clamp((t-U.impT)/(CBU2.T3-U.impT),0,1); if(F.impact) F.impact(u,t); const cp=camPose(U,F.camMode||U.camMode,t); pos.copy(cp.pos); look.copy(cp.look); const sh=(1-u)*.45+(U.shk||0); pos.x+=(Math.random()-.5)*sh; pos.y+=(Math.random()-.5)*sh*.6; U.camLast=pos.clone(); U.lookLast=look.clone(); }
  else if(t<CBU2.END){ const u=clamp((t-CBU2.T3)/(CBU2.END-CBU2.T3),0,1); if(F.post) F.post(u,t); const e2=ez(u); pos.copy(U.camLast).lerp(home.p,e2); look.copy(U.lookLast).lerp(lookHome,e2); U.light.intensity=0; }
  else { ultEnd(); return; }
  if(U.shk&&t<CBU2.T3&&t>CBU2.T1){ pos.x+=(Math.random()-.5)*U.shk; pos.y+=(Math.random()-.5)*U.shk*.6; }
  cam.position.copy(pos); cam.lookAt(look);
  if(U.resolve&&t>=CBU2.T2+.45){ const r=U.resolve; U.resolve=null; r(); } };
ultEnd=function(){ const U=CB3.U; if(!U) return; CB3.U=null; const home=CB3.home; try{ U.cam.position.copy(home.p); U.cam.lookAt(home.p.clone().addScaledVector(home.d,40)); }catch(_){}
  U.objs.forEach(o=>{ try{ CB3.sc&&CB3.sc.remove(o); o.traverse&&o.traverse(c=>{ if(c.geometry&&!c.geometry.userData.shared) c.geometry.dispose(); if(c.material) (Array.isArray(c.material)?c.material:[c.material]).forEach(m=>m.dispose()); }); if(o.dispose) o.dispose(); }catch(_){} });
  try{ U.ov.remove(); U.ar.classList.remove('cb3d-ult'); }catch(_){} if(U.resolve){ const r=U.resolve; U.resolve=null; r(); } };
}
