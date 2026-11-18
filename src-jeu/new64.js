/* ===== v2.1 · 2/3 : Rue Néon avec du fond, portes de garage, salle d'arcade retravaillée (bornes, flipper, machines à tickets), chien Rottweiler ===== */

const hx64=c=>'#'+c.toString(16).padStart(6,'0');
const rnd64=seed=>{ let s=seed; return ()=>{ s=(s*16807)%2147483647; return s/2147483647; }; };

/* ---------- 1. Rue Néon : sol, ciel et skyline derrière les immeubles (plus de vide) ---------- */
function bgDepth64(sc,cx,cz,rows){ const rn=rnd64(5);
  const gt=ctex(256,256,(x,Wd,H)=>{ x.fillStyle='#1b2833'; x.fillRect(0,0,Wd,H); for(let i=0;i<6000;i++){ const g=26+Math.floor(rn()*34); x.fillStyle=`rgba(${g},${g+22},${g+16},.5)`; x.fillRect(rn()*Wd,rn()*H,2,2); } x.strokeStyle='rgba(0,229,255,.16)'; x.lineWidth=2; x.strokeRect(1,1,Wd-2,H-2); },[200,200]);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),new THREE.MeshLambertMaterial({map:gt})); gr.rotation.x=-Math.PI/2; gr.position.set(cx,-.04,cz); sc.add(gr);
  const skyT=ctex(8,256,(x,Wd,Hh)=>{ const g=x.createLinearGradient(0,0,0,Hh); g.addColorStop(0,'#06031a'); g.addColorStop(.45,'#150a3a'); g.addColorStop(.62,'#4a1a6e'); g.addColorStop(.7,'#c2358f'); g.addColorStop(.74,'#4a1a6e'); g.addColorStop(1,'#2a1550'); x.fillStyle=g; x.fillRect(0,0,Wd,Hh); }); skyT.wrapS=skyT.wrapT=THREE.ClampToEdgeWrapping;
  const dome=new THREE.Mesh(new THREE.SphereGeometry(900,24,16),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,depthWrite:false})); dome.position.set(cx,0,cz); dome.renderOrder=-5; sc.add(dome);
  const sk=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x1b1140,fog:false}),120), m4=new THREE.Matrix4();
  for(let i=0;i<120;i++){ const a=i/120*Math.PI*2, R=430+rn()*60, w=30+rn()*50, h=50+rn()*170, d=30+rn()*40; m4.makeScale(w,h,d); m4.setPosition(cx+Math.cos(a)*R,h/2-4,cz+Math.sin(a)*R); sk.setMatrixAt(i,m4); } sc.add(sk);
  if(rows){ const facs=wFacs(), box=new THREE.BoxGeometry(1,1,1); rows.forEach(([z,hmin,hr,sp])=>{ for(let x=cx-rows.span;x<cx+rows.span;x+=sp){ const w=8+rn()*8, h=hmin+rn()*hr, m=new THREE.Mesh(box,facs[Math.floor(rn()*5)]); m.scale.set(w,h,9); m.position.set(x,h/2,z); sc.add(m); } }); } }
{ const _rb=rueBuild; rueBuild=function(){ _rb.apply(this,arguments); try{ const sc=RUE.sc, L=RUE.max; sc.fog=new THREE.Fog(0x2a1550,20,120); sc.background=new THREE.Color(0x2a1550);
    const rows=[[-18,18,30,9],[-32,30,50,11],[-52,40,70,13]]; rows.span=L/2+90; bgDepth64(sc,L/2,-40,rows);
    /* socles sous les immeubles de la rue + trottoir qui se prolonge */
    const pm=new THREE.MeshLambertMaterial({color:0x3a3752}); const side=new THREE.Mesh(new THREE.BoxGeometry(L+260,.18,34),pm); side.position.set(L/2,.05,-21); sc.add(side);
  }catch(e){ console.warn('rue fond',e); } }; }

/* ---------- 2. porte de garage (remplace les gros carrés verts) ---------- */
function wGarageDoor(W,x,z,rotY,col){ const sc=W.sc, g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotY||0; sc.add(g);
  const steel=ctex(128,256,(c,Wd,H)=>{ c.fillStyle='#3b3f52'; c.fillRect(0,0,Wd,H); for(let y=0;y<H;y+=16){ const gr=c.createLinearGradient(0,y,0,y+16); gr.addColorStop(0,'#5a5f78'); gr.addColorStop(.5,'#3a3e52'); gr.addColorStop(1,'#272a3a'); c.fillStyle=gr; c.fillRect(0,y,Wd,14); c.fillStyle='rgba(0,0,0,.5)'; c.fillRect(0,y+14,Wd,2); }
      c.fillStyle='rgba(255,255,255,.07)'; for(let i=0;i<40;i++) c.fillRect(Math.random()*Wd,Math.random()*H,10,2); c.fillStyle='#ffd400'; c.fillRect(0,H-14,Wd,14); c.fillStyle='#111'; for(let i=0;i<Wd;i+=20) c.fillRect(i,H-14,10,14); });
  steel.wrapS=steel.wrapT=THREE.ClampToEdgeWrapping;
  const haz=ctex(32,128,(c,Wd,H)=>{ c.fillStyle='#ffd400'; c.fillRect(0,0,Wd,H); c.fillStyle='#14141c'; for(let i=-H;i<H*2;i+=32){ c.beginPath(); c.moveTo(0,i); c.lineTo(Wd,i-Wd); c.lineTo(Wd,i-Wd+16); c.lineTo(0,i+16); c.fill(); } }); haz.wrapS=haz.wrapT=THREE.ClampToEdgeWrapping;
  const dark=new THREE.MeshLambertMaterial({color:0x14121f}), M=(w,h,d,px,py,pz,m)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||dark); o.position.set(px,py,pz); g.add(o); return o; };
  M(9.2,.5,1.2,0,.25,0); M(1,7.6,1,-4.1,3.8,0); M(1,7.6,1,4.1,3.8,0); M(9.2,1,1,0,7.4,0);   /* cadre */
  [-4.1,4.1].forEach(sx=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(.7,7),new THREE.MeshLambertMaterial({map:haz})); p.position.set(sx,3.8,.52); g.add(p); });
  /* l'ouverture : lumière de la destination, avec le rideau métallique relevé aux 2/5 */
  const glowT=ctex(8,128,(c,Wd,H)=>{ const gr=c.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#fff'); gr.addColorStop(.25,hx64(col)); gr.addColorStop(1,'#0a0618'); c.fillStyle=gr; c.fillRect(0,0,Wd,H); }); glowT.wrapS=glowT.wrapT=THREE.ClampToEdgeWrapping;
  const back=new THREE.Mesh(new THREE.PlaneGeometry(7.2,6.8),new THREE.MeshBasicMaterial({map:glowT})); back.position.set(0,3.9,.05); g.add(back);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(7.2,3.9),new THREE.MeshLambertMaterial({map:steel})); sh.position.set(0,1.95+.5,.2); g.add(sh);
  M(7.4,.5,.6,0,6.7,.25,new THREE.MeshLambertMaterial({color:0x2b2e40}));       /* caisson du rouleau */
  [-2.5,2.5].forEach(lx=>{ M(.9,.25,.5,lx,8.1,.5,new THREE.MeshBasicMaterial({color:0xfffbe0})); const gw=wGlow(0xfff3c0,4); gw.position.set(lx,7.7,1); g.add(gw); });
  const mat=new THREE.Mesh(new THREE.PlaneGeometry(8,2.4),new THREE.MeshLambertMaterial({map:haz})); mat.rotation.x=-Math.PI/2; mat.position.set(0,.03,1.6); g.add(mat);
  M(9.6,.12,.14,0,.6,.65,new THREE.MeshBasicMaterial({color:col}));
  return g; }

/* ---------- 3. salle d'arcade : bornes adaptées à chaque mini-jeu, flipper, machines à tickets ---------- */
function marquee64(txt,col,ic){ return ctex(256,64,(x,W,H)=>{ const g=x.createLinearGradient(0,0,W,0); g.addColorStop(0,'#120828'); g.addColorStop(.5,'#2a0f55'); g.addColorStop(1,'#120828'); x.fillStyle=g; x.fillRect(0,0,W,H); x.strokeStyle=hx64(col); x.lineWidth=5; x.strokeRect(3,3,W-6,H-6); x.shadowColor=hx64(col); x.shadowBlur=14; x.fillStyle='#fff'; x.textAlign='center'; x.textBaseline='middle'; let fs=34; x.font='900 '+fs+'px system-ui,sans-serif'; while(x.measureText(ic+' '+txt).width>W-28&&fs>12){ fs--; x.font='900 '+fs+'px system-ui,sans-serif'; } x.fillText(ic+' '+txt,W/2,H/2+2); }); }
function sideArt64(col){ const t=ctex(64,256,(x,W,H)=>{ const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#1d1042'); g.addColorStop(1,'#0b0618'); x.fillStyle=g; x.fillRect(0,0,W,H); x.fillStyle=hx64(col); x.fillRect(5,0,4,H); x.fillRect(W-9,0,4,H); x.globalAlpha=.45; for(let i=0;i<26;i++) x.fillRect(Math.random()*W,Math.random()*H,2,2); x.globalAlpha=.9; x.beginPath(); x.moveTo(W/2,H*.18); x.lineTo(W*.8,H*.34); x.lineTo(W/2,H*.5); x.lineTo(W*.2,H*.34); x.closePath(); x.fill(); }); t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; return t; }
function screen64(kind,col,ic){ return ctex(160,120,(x,W,H)=>{ const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#10062a'); g.addColorStop(1,hx64(col)+'99'); x.fillStyle=g; x.fillRect(0,0,W,H);
    if(kind==='drift'){ x.strokeStyle='#00e5ff'; x.lineWidth=2; for(let i=-4;i<=4;i++){ x.beginPath(); x.moveTo(W/2+i*6,H*.45); x.lineTo(W/2+i*34,H); x.stroke(); } for(let j=0;j<5;j++){ x.beginPath(); x.moveTo(0,H*.5+j*j*3.4); x.lineTo(W,H*.5+j*j*3.4); x.stroke(); } x.fillStyle='#ff2bd6'; x.beginPath(); x.arc(W/2,H*.38,16,0,7); x.fill(); x.font='38px serif'; x.textAlign='center'; x.fillText('🏎️',W/2+20,H*.86); }
    else if(kind==='drag'){ [['#ff2d2d',.26],['#ffd400',.5],['#1fe06a',.74]].forEach(([c,u])=>{ x.fillStyle='#08040f'; x.beginPath(); x.arc(W*u,H*.34,15,0,7); x.fill(); x.fillStyle=c; x.shadowColor=c; x.shadowBlur=14; x.beginPath(); x.arc(W*u,H*.34,11,0,7); x.fill(); x.shadowBlur=0; }); x.fillStyle='#fff'; for(let i=0;i<7;i++) x.fillRect(W*.1+i*20,H*.7,12,4); x.font='30px serif'; x.textAlign='center'; x.fillText('🏁',W/2,H*.95); }
    else if(kind==='pit'){ x.fillStyle='#16101f'; x.beginPath(); x.arc(W/2,H*.5,36,0,7); x.fill(); x.strokeStyle='#cfd3e6'; x.lineWidth=5; x.beginPath(); x.arc(W/2,H*.5,36,0,7); x.stroke(); x.fillStyle='#9aa0b8'; for(let i=0;i<5;i++){ const a=i/5*6.283; x.beginPath(); x.arc(W/2+Math.cos(a)*18,H*.5+Math.sin(a)*18,5,0,7); x.fill(); } x.fillStyle='#ffd400'; x.beginPath(); x.arc(W/2,H*.5,7,0,7); x.fill(); }
    else if(kind==='nitro'){ x.strokeStyle='#ff9a1a'; x.lineWidth=8; x.beginPath(); x.arc(W/2,H*.78,52,Math.PI*1.1,Math.PI*1.9); x.stroke(); x.strokeStyle='#ff2d2d'; x.beginPath(); x.moveTo(W/2,H*.78); x.lineTo(W*.68,H*.38); x.stroke(); x.font='34px serif'; x.textAlign='center'; x.fillText('⚡',W/2,H*.3); }
    else { x.font='56px serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(ic,W/2,H*.5); }
    x.fillStyle='rgba(255,255,255,.09)'; for(let y=0;y<H;y+=3) x.fillRect(0,y,W,1); }); }
function arcUpright(W,gid,x,z,col,ic,title,kind,rotY){ const sc=W.sc, g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotY||0; sc.add(g);
  const body=wLamb(0x1b1236), blk=wLamb(0x0a0714), M=(w,h,d,px,py,pz,m,rx)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||body); o.position.set(px,py,pz); if(rx) o.rotation.x=rx; g.add(o); return o; };
  const side=new THREE.MeshLambertMaterial({map:sideArt64(col)});
  M(.24,4.6,2.5,-1.25,2.3,0,side); M(.24,4.6,2.5,1.25,2.3,0,side); M(2.5,4.6,.2,0,2.3,-1.15);                 /* flancs + dos */
  M(2.3,1.55,2.1,0,.78,.05);                                                                                  /* pied */
  M(2.5,.8,1.3,0,4.65,.15);                                                                                   /* bandeau */
  const mq=new THREE.Mesh(new THREE.PlaneGeometry(2.3,.7),new THREE.MeshBasicMaterial({map:marquee64(title,col,ic)})); mq.position.set(0,4.62,.82); g.add(mq);
  M(2.4,1.95,.2,0,3.0,.62,blk,-.22);                                                                          /* cadre d'écran incliné */
  const sc2=new THREE.Mesh(new THREE.PlaneGeometry(2.0,1.55),new THREE.MeshBasicMaterial({map:screen64(kind,col,ic)})); sc2.position.set(0,3.0,.74); sc2.rotation.x=-.22; g.add(sc2);
  M(2.5,.28,1.4,0,1.92,1.0,wLamb(0x2a1a4a),.12);                                                              /* plateau de commandes */
  const cp=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.55),new THREE.MeshBasicMaterial({map:ctex(96,32,(c,Wd,H)=>{ c.fillStyle='#ffd400'; c.fillRect(0,0,Wd,H); c.fillStyle='#111'; c.fillRect(8,6,20,10); c.fillRect(Wd-28,6,20,10); c.font='bold 11px system-ui'; c.textAlign='center'; c.fillText('INSERT COIN',Wd/2,26); })})); cp.position.set(0,1.0,1.12); g.add(cp);
  const ne=wNeon(col); M(.06,4.6,.06,-1.1,2.3,1.08,ne); M(.06,4.6,.06,1.1,2.3,1.08,ne); M(2.4,.07,.07,0,.12,1.12,ne);
  const cm=(r,h,px,py,pz,c,rx)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,14),wNeon(c)); o.position.set(px,py,pz); if(rx) o.rotation.x=rx; g.add(o); return o; };
  const dk=(r,h,px,py,pz,c,rx)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),wLamb(c)); o.position.set(px,py,pz); if(rx) o.rotation.x=rx; g.add(o); return o; };
  if(kind==='drift'){ dk(.07,.5,0,2.2,.95,0xcccccc,-.5); const w=new THREE.Mesh(new THREE.TorusGeometry(.38,.06,8,24),wLamb(0x15151c)); w.position.set(0,2.5,1.2); w.rotation.x=-.5; g.add(w); [-.45,.45].forEach(px=>M(.4,.07,.7,px,.35,1.1,wLamb(0x222233),.5)); }
  else if(kind==='drag'){ dk(.04,.55,.5,2.25,1.05,0xdddddd,.2); dk(.09,.09,.5,2.55,1.1,0xff2d2d); [['#ff2d2d',-.4],['#ffd400',0],['#1fe06a',.4]].forEach(([c,px])=>cm(.1,.06,px,2.12,.8,parseInt(c.slice(1),16))); }
  else if(kind==='pit'){ [-.55,-.18,.18,.55].forEach((px,i)=>cm(.15,.1,px,2.1,1.05,[0xff2d2d,0xffd400,0x1fe06a,0x00e5ff][i])); dk(.07,.55,0,2.2,.7,0xaaaaaa,.8); }
  else if(kind==='nitro'){ cm(.34,.18,0,2.15,1.0,0xff2d2d); const r=new THREE.Mesh(new THREE.TorusGeometry(.4,.05,8,24),wLamb(0xdddddd)); r.position.set(0,2.15,1.0); r.rotation.x=Math.PI/2-.12; g.add(r); }
  else { dk(.05,.4,-.5,2.15,1.05,0xdddddd); [[.1,0xff2d2d],[.4,0xffd400],[.7,0x1fe06a]].forEach(b=>cm(.12,.08,b[0],2.07,1.05,b[1])); }
  const lb=hubLabel(ic+' '+(title.split(' ')[0]||title).toUpperCase(),hx64(col),6,x,z); lb.position.set(x,5.8,z); sc.add(lb);
  const rotated=Math.abs(Math.sin(rotY||0))>.5; W.obs.push(rotated?{x0:x-1.6,x1:x+1.6,z0:z-1.4,z1:z+1.4}:{x0:x-1.5,x1:x+1.5,z0:z-1.3,z1:z+1.9}); return g; }
function arcPinball(W,x,z,col){ const sc=W.sc, g=new THREE.Group(); g.position.set(x,0,z); sc.add(g); const body=wLamb(0x1d1240), M=(w,h,d,px,py,pz,m)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||body); o.position.set(px,py,pz); g.add(o); return o; };
  [[-1.1,-1.8],[1.1,-1.8],[-1.1,1.8],[1.1,1.8]].forEach(([lx,lz])=>{ const l=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1.2,8),wLamb(0xcfd3e6)); l.position.set(lx,.6,lz); g.add(l); });
  const side=new THREE.MeshLambertMaterial({map:sideArt64(col)}); M(.2,.95,4.3,-1.25,1.55,0,side); M(.2,.95,4.3,1.25,1.55,0,side); M(2.5,.95,.2,0,1.55,-2.1); M(2.5,.5,.2,0,1.3,2.1);
  const pfT=ctex(256,512,(x,Wd,H)=>{ const gr=x.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#2a0f66'); gr.addColorStop(.6,'#0f5a8a'); gr.addColorStop(1,'#0b1a3a'); x.fillStyle=gr; x.fillRect(0,0,Wd,H); x.strokeStyle='#ffd400'; x.lineWidth=4; x.strokeRect(8,8,Wd-16,H-16);
      x.strokeStyle='#ff2bd6'; x.lineWidth=5; x.beginPath(); x.moveTo(30,380); x.lineTo(30,120); x.quadraticCurveTo(30,30,128,30); x.quadraticCurveTo(226,30,226,120); x.lineTo(226,380); x.stroke();
      [[90,150],[170,150],[130,215]].forEach(([bx,by],i)=>{ x.fillStyle=['#ff2d2d','#ffd400','#1fe06a'][i]; x.shadowColor=x.fillStyle; x.shadowBlur=14; x.beginPath(); x.arc(bx,by,20,0,7); x.fill(); x.shadowBlur=0; x.fillStyle='#fff'; x.beginPath(); x.arc(bx,by,8,0,7); x.fill(); });
      x.fillStyle='#fff'; x.font='54px serif'; x.textAlign='center'; x.fillText('🏁',128,320); x.strokeStyle='#00e5ff'; x.lineWidth=7; x.beginPath(); x.moveTo(46,420); x.lineTo(104,468); x.moveTo(210,420); x.lineTo(152,468); x.stroke(); x.fillStyle='#fff'; x.beginPath(); x.arc(128,408,7,0,7); x.fill(); });
  const pf=new THREE.Group(); pf.position.set(0,1.78,.1); pf.rotation.x=.2; g.add(pf); const fl=new THREE.Mesh(new THREE.PlaneGeometry(2.2,4.0),new THREE.MeshBasicMaterial({map:pfT})); fl.rotation.x=-Math.PI/2; pf.add(fl);
  [[-.5,-.8],[.5,-.8],[0,-.2]].forEach(([bx,bz],i)=>{ const b=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.15,14),wNeon([0xff2d2d,0xffd400,0x1fe06a][i])); b.position.set(bx,.08,bz); pf.add(b); });
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(2.3,4.2),new THREE.MeshBasicMaterial({color:0x9ad8ff,transparent:true,opacity:.13,side:THREE.DoubleSide})); glass.position.set(0,2.18,.1); glass.rotation.x=-Math.PI/2+.2; g.add(glass);
  M(2.5,2.3,.5,0,3.0,-2.05); const bm=new THREE.Mesh(new THREE.PlaneGeometry(2.3,2.0),new THREE.MeshBasicMaterial({map:ctex(128,112,(x,Wd,H)=>{ const gr=x.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#ff2bd6'); gr.addColorStop(1,'#1d0a52'); x.fillStyle=gr; x.fillRect(0,0,Wd,H); x.fillStyle='#fff'; x.shadowColor='#fff'; x.shadowBlur=10; x.font='900 26px system-ui'; x.textAlign='center'; x.fillText('PIN',Wd/2,38); x.fillText('BALL',Wd/2,70); x.font='22px serif'; x.fillText('🎱 ⭐ 🎱',Wd/2,98); })})); bm.position.set(0,3.05,-1.79); g.add(bm);
  const ne=wNeon(col); M(.07,1.0,.07,-1.34,1.55,2.12,ne); M(.07,1.0,.07,1.34,1.55,2.12,ne); M(2.6,.07,.07,0,.9,2.14,ne);
  [-1,1].forEach(s=>{ const b=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.08,10),wNeon(0xffd400)); b.rotation.z=Math.PI/2; b.position.set(s*1.36,1.62,1.0); g.add(b); });
  const pl=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.5,8),wLamb(0xdddddd)); pl.rotation.x=Math.PI/2; pl.position.set(1.0,1.4,2.3); g.add(pl);
  const lb=hubLabel('🎱 PINBALL',hx64(col),6,x,z); lb.position.set(x,5.2,z); sc.add(lb); W.obs.push({x0:x-1.8,x1:x+1.8,z0:z-2.6,z1:z+2.6}); return g; }
function arcPrize(W,x,z,rotY,col){ const sc=W.sc, g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotY; sc.add(g);
  const white=new THREE.MeshLambertMaterial({color:0xe9ecf4}), grey=new THREE.MeshLambertMaterial({color:0xc9cddb}), blk=new THREE.MeshLambertMaterial({color:0x0c0a14}), M=(w,h,d,px,py,pz,m)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||white); o.position.set(px,py,pz); g.add(o); return o; };
  M(2.5,3.6,2.0,0,1.8,0); M(2.6,.18,2.1,0,3.62,0,grey); M(2.6,.12,2.1,0,.06,0,grey); M(2.4,.3,.12,0,.4,1.0,grey);
  M(2.0,2.2,.14,0,2.5,1.0,blk); const prizes=ctex(128,176,(c,Wd,H)=>{ c.fillStyle='#fdf7ff'; c.fillRect(0,0,Wd,H); c.fillStyle=hx64(col); c.fillRect(0,0,Wd,26); c.fillStyle='#fff'; c.font='900 17px system-ui'; c.textAlign='center'; c.fillText('🎟️ PRIX ARCADE',Wd/2,19);
      const em=['🏆','🏎️','🃏','🎟️','⚙️','🧰','💎','🛢️','⭐','🔧','📦','🎁']; for(let r=0;r<4;r++){ c.fillStyle='rgba(120,100,160,.25)'; c.fillRect(6,40+r*34+26,Wd-12,4); for(let k=0;k<3;k++){ c.font='22px serif'; c.fillText(em[(r*3+k)%12],26+k*38,40+r*34+22); } } });
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.84,2.05),new THREE.MeshBasicMaterial({map:prizes})); scr.position.set(0,2.5,1.08); g.add(scr);
  M(.5,.16,.04,-.55,1.22,1.02,new THREE.MeshBasicMaterial({color:0xffd400}));                                   /* étiquette jaune */
  M(.62,1.0,.08,-.62,.72,1.0,grey); M(.5,.06,.04,-.62,.88,1.05,blk);                                           /* monnayeur + fente */
  const kn=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.14,16),new THREE.MeshLambertMaterial({color:0xf5f5fa})); kn.rotation.x=Math.PI/2; kn.position.set(-.62,.58,1.09); g.add(kn); M(.28,.05,.03,-.62,.58,1.17,blk);
  const hr=new THREE.Mesh(new THREE.TorusGeometry(.4,.07,10,24),new THREE.MeshLambertMaterial({color:0xdfe2ee})); hr.position.set(.55,.72,1.04); g.add(hr); const hd=new THREE.Mesh(new THREE.CircleGeometry(.36,20),blk); hd.position.set(.55,.72,1.02); g.add(hd);
  const ne=wNeon(col); M(.05,3.4,.05,-1.27,1.8,1.04,ne); M(.05,3.4,.05,1.27,1.8,1.04,ne); return g; }
function buildArcade2(W){
  const sc=W.sc, BX=W.bx, BZ=W.bz; sc.background=new THREE.Color(0x07040f); sc.fog=new THREE.Fog(0x07040f,40,130);
  sc.add(new THREE.HemisphereLight(0xb8a8ff,0x2a1448,1.45)); const dl=new THREE.DirectionalLight(0xff9af0,.4); dl.position.set(0,30,10); sc.add(dl);
  const rn=rnd64(9), cols=[0xff2bd6,0x00e5ff,0xffd400,0x3cff9e];
  /* moquette de salle d'arcade : motifs néon (étoiles, carrés, cercles) sur fond sombre */
  const carp=ctex(256,256,(x,Wd,H)=>{ x.fillStyle='#0f0a24'; x.fillRect(0,0,Wd,H); const cc=['#ff2bd6','#00e5ff','#ffd400','#3cff9e'];
    for(let i=0;i<34;i++){ x.fillStyle=cc[i%4]+'88'; const s=4+rn()*9, px=rn()*Wd, py=rn()*H, k=i%3; if(k===0) x.fillRect(px,py,s,s); else if(k===1){ x.beginPath(); x.arc(px,py,s/2,0,7); x.fill(); } else { x.save(); x.translate(px,py); x.rotate(.78); x.fillRect(-s/2,-s/2,s,s); x.restore(); } }
    x.strokeStyle='rgba(0,229,255,.22)'; x.lineWidth=3; x.strokeRect(2,2,Wd-4,H-4); x.strokeStyle='rgba(255,43,214,.16)'; x.beginPath(); x.moveTo(0,0); x.lineTo(Wd,H); x.moveTo(Wd,0); x.lineTo(0,H); x.stroke(); },[BX/5,BZ/5]);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(BX*2+4,BZ*2+4),new THREE.MeshLambertMaterial({map:carp})); fl.rotation.x=-Math.PI/2; sc.add(fl);
  /* murs à panneaux : soubassement, bandes néon, affiches de jeux */
  const HH=10, wallT=ctex(256,256,(x,Wd,H)=>{ x.fillStyle='#17102f'; x.fillRect(0,0,Wd,H); x.fillStyle='#0f0a22'; x.fillRect(0,H*.62,Wd,H*.38); for(let i=0;i<4;i++){ x.fillStyle='#1d1540'; x.fillRect(i*64+4,8,56,H*.55); x.strokeStyle='rgba(120,100,255,.35)'; x.strokeRect(i*64+4,8,56,H*.55); }
    x.fillStyle='#00e5ff'; x.fillRect(0,H*.6,Wd,4); x.fillStyle='#ff2bd6'; x.fillRect(0,H*.62+8,Wd,3); },[10,1]);
  const wm=new THREE.MeshLambertMaterial({map:wallT}); W.box(BX*2+1,HH,.6,0,HH/2,-BZ-.3,wm); W.box(BX*2+1,HH,.6,0,HH/2,BZ+.3,wm); W.box(.6,HH,BZ*2,-BX-.3,HH/2,0,wm); W.box(.6,HH,BZ*2,BX+.3,HH/2,0,wm);
  const poster=(ic,t,c)=>ctex(96,128,(x,Wd,H)=>{ const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#220a4a'); g.addColorStop(1,hx64(c)); x.fillStyle=g; x.fillRect(0,0,Wd,H); x.strokeStyle='#fff'; x.lineWidth=3; x.strokeRect(3,3,Wd-6,H-6); x.font='46px serif'; x.textAlign='center'; x.fillText(ic,Wd/2,72); x.fillStyle='#fff'; x.font='900 13px system-ui'; x.fillText(t,Wd/2,104); });
  [['🏎️','TURBO',0xff2bd6],['👾','INVADERS',0x3cff9e],['🎱','PINBALL',0xffd400],['🚀','COSMO',0x00e5ff],['🏁','GRAND PRIX',0xff9a1a],['⚡','NITRO',0xff2d2d]].forEach(([ic,t,c],i)=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(3.2,4.3),new THREE.MeshBasicMaterial({map:poster(ic,t,c)})); p.position.set(-30+i*12,5.4,-BZ+.05); sc.add(p); });
  [-14,14].forEach((pz,i)=>{ [-1,1].forEach(sd=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(3.2,4.3),new THREE.MeshBasicMaterial({map:poster(['🎰','🕹️','💎','🎟️'][i*2+(sd>0?1:0)],['JACKPOT','ARCADE','NÉON','TICKETS'][i*2+(sd>0?1:0)],cols[(i*2+(sd>0?1:0))%4])})); p.position.set(sd*(BX-.05),5.4,pz); p.rotation.y=sd>0?-Math.PI/2:Math.PI/2; sc.add(p); }); });
  /* plafond : gaines, rails de spots, bandes néon */
  const ce=new THREE.Mesh(new THREE.PlaneGeometry(BX*2,BZ*2),new THREE.MeshBasicMaterial({color:0x05030a,side:THREE.DoubleSide})); ce.rotation.x=Math.PI/2; ce.position.y=HH; sc.add(ce);
  for(let i=-3;i<=3;i++){ W.box(BX*2,.18,.25,0,HH-.2,i*7,wNeon(cols[(i+3)%4])); } [-14,0,14].forEach(px=>W.box(.5,.5,BZ*2,px,HH-.45,0,wLamb(0x1a1530)));
  for(let i=-4;i<=4;i++) [-8,8].forEach(pz=>{ const sp=new THREE.Mesh(new THREE.ConeGeometry(.35,.6,10),wLamb(0x2a2540)); sp.position.set(i*8,HH-.9,pz); sc.add(sp); });
  /* piliers avec anneaux néon */
  [[-18,0],[18,0],[-18,12],[18,12]].forEach(([px,pz],i)=>{ W.box(1.2,HH,1.2,px,HH/2,pz,wLamb(0x1a1330)); [2.2,5.2,8.2].forEach(py=>W.box(1.3,.12,1.3,px,py,pz,wNeon(cols[(i+py|0)%4]))); W.obs.push({x:px,z:pz,r:1.1}); });
  [[BX*2,.14,.1,0,3,-BZ+.1,0xff2bd6],[.1,.14,BZ*2,-BX+.1,3,0,0xffd400],[.1,.14,BZ*2,BX-.1,3,0,0x3cff9e],[BX*2,.14,.1,0,3,BZ-.1,0x3cff9e]].forEach(a=>W.box(a[0],a[1],a[2],a[3],a[4],a[5],wNeon(a[6])));
  const sign=hubLabel('🕹️ ARCADE · HIGH & ROUILLÉ','#FFD400',16,0,-BZ+.6); sign.position.set(0,8.3,-BZ+.7); sc.add(sign);
  /* bornes : une par mini-jeu */
  const glows=[], defs=[['pin',-24,-18],['drift',-11,-19],['drag',1,-19],['pit',13,-19],['nitro',25,-19]];
  const KIND={drift:'drift',drag:'drag',pit:'pit',nitro:'nitro'};
  defs.forEach(([gid,x,z])=>{ const G=ARC[gid], col=G.col;
    if(gid==='pin') arcPinball(W,x,z,col); else arcUpright(W,gid,x,z,col,G.ic,G.n,KIND[gid]||'x',0);
    const wide=gid==='pin', gw=wGlow(col,9); gw.position.set(x,3,z+(wide?2.6:2)); sc.add(gw); glows.push(gw);
    W.poi('arc_'+gid,x,z+(wide?4.4:3.4),3.3,()=>S.lvl<ARC_LV[gid]?`🔒 ${G.n} · niveau ${ARC_LV[gid]} requis`:`${G.ic} ${G.n} · record ${fmt(arcS().best[gid]||0)}`,()=>S.lvl<ARC_LV[gid]?[]:[{id:'arc_'+gid,tx:`▶ Jouer · ${G.cost} cr`}]); });
  /* bornes décor (autres jeux d'ambiance) le long des murs */
  [[-30,6,'👾','INVADERS','x'],[-30,-2,'🎱','CHALLENGE','x'],[30,12,'🚀','COSMO','x'],[-30,14,'🥊','FIGHT','x'],[30,-6,'🎯','TIR','x']].forEach(([x,z,ic,t,k],i)=>arcUpright(W,'d'+i,x,z,cols[i%4],ic,t,k,x<0?Math.PI/2:-Math.PI/2));
  /* machines à tickets (type distributeur de prix) à la place du comptoir */
  const px=BX-3.2; arcPrize(W,px,-1.4,-Math.PI/2,0x00e5ff); arcPrize(W,px,1.4,-Math.PI/2,0xff2bd6); W.obs.push({x0:px-1.4,x1:px+1.4,z0:-2.9,z1:2.9});
  const cl=hubLabel('🎟️ PRIX','#FFD400',8,px,0); cl.position.set(px,5.6,0); sc.add(cl); const gp=wGlow(0xffd400,10); gp.position.set(px-1,2.6,0); sc.add(gp); glows.push(gp);
  W.poi('arc_prix',px-3.6,0,4.2,()=>`🎟️ Machine à prix · ${fmt(arcS().tk)} tickets`,()=>[{id:'arc_prix',tx:'Échanger mes tickets'}]);
  /* porte de garage → Région Néon */
  wGarageDoor(W,0,BZ-.4,Math.PI,0x3cff9e); const gl2=hubLabel('↩ RÉGION NÉON','#3CFF9E',9,0,BZ); gl2.position.set(0,9.4,BZ-.5); sc.add(gl2); W.poi('agate',0,BZ-3.6,3.8,()=>'Sortie',()=>[{id:'agate',tx:'↩ Retour à la Région Néon'}]);
  W.anim=(dt,t)=>{ glows.forEach((g,i)=>{ g.material.opacity=.6+.4*Math.sin(t*3+i*1.3); }); };
}
WBUILD.arcade=buildArcade2;
/* l'ancienne porte de la rue néon (dans la rue 3D de jadis) devient une porte de garage aussi */
{ const _bs=WBUILD.street; if(_bs){ WBUILD.street=function(W){ _bs(W); }; } }

/* ---------- 4. un Rottweiler qui se balade (garage, labo, ranch, arcade) ---------- */
const DOG={g:null,x:3,z:3,h:0,st:'wander',tx:3,tz:3,t:0,wait:0,legs:[],tail:null,head:null,sit:0};
function dogMake(){ const g=new THREE.Group(), blk=wLamb(0x101014), tan=wLamb(0xb5651d), nose=wLamb(0x050505), red=wLamb(0xd02020);
  const B=(w,h,d,x,y,z,m,p)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); (p||g).add(o); return o; };
  const body=new THREE.Group(); body.position.y=.56; g.add(body); B(.38,.36,.62,0,0,.08,blk,body); B(.36,.38,.34,0,.02,-.3,blk,body); B(.2,.18,.05,0,-.06,.4,tan,body);
  const neck=B(.24,.3,.22,0,.16,.38,blk,body); neck.rotation.x=.5; B(.28,.05,.1,0,.03,.42,red,body);
  const head=new THREE.Group(); head.position.set(0,.4,.52); body.add(head); B(.3,.28,.3,0,0,0,blk,head); B(.17,.14,.2,0,-.05,.2,tan,head); B(.08,.06,.05,0,-.01,.31,nose,head);
  [-1,1].forEach(s=>{ B(.05,.03,.02,s*.07,.08,.15,tan,head); B(.045,.045,.02,s*.07,.04,.16,wLamb(0x222222),head); const ear=B(.07,.17,.12,s*.16,.1,-.03,blk,head); ear.rotation.z=s*.55; });
  const legs=[]; [[-.14,.26],[.14,.26],[-.14,-.3],[.14,-.3]].forEach(([lx,lz])=>{ const p=new THREE.Group(); p.position.set(lx,.4,lz); g.add(p); B(.12,.22,.14,0,-.1,0,blk,p); B(.1,.2,.1,0,-.3,0,tan,p); B(.13,.06,.16,0,-.4,.02,blk,p); legs.push(p); });
  const tail=new THREE.Group(); tail.position.set(0,.7,-.46); g.add(tail); B(.06,.06,.14,0,0,-.05,blk,tail);
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.5,16),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.3})); sh.rotation.x=-Math.PI/2; sh.position.y=.02; g.add(sh);
  g.scale.setScalar(1.55); return {g,legs,tail,head,body}; }
function dogAdd(){ DOG.g=null; if(!HUB.scene) return; const m=HUB.map||'garage'; if(!['garage','atelier','ranch','arcade'].includes(m)) return;
  const d=dogMake(); DOG.g=d.g; DOG.legs=d.legs; DOG.tail=d.tail; DOG.head=d.head; DOG.body=d.body; const bx=(HUB.bx||35)-4, bz=(HUB.bz||25)-4; DOG.x=clamp(HUB.pos.x+4,-bx,bx); DOG.z=clamp(HUB.pos.z-4,-bz,bz); for(let i=0;i<30&&dogBlocked(DOG.x,DOG.z);i++){ DOG.x=(Math.random()*2-1)*bx; DOG.z=(Math.random()*2-1)*bz; }
  DOG.tx=DOG.x; DOG.tz=DOG.z; DOG.st='wander'; DOG.wait=1; DOG.sit=0; d.g.position.set(DOG.x,0,DOG.z); HUB.scene.add(d.g); }
function dogBlocked(x,z){ return (HUB.obs||[]).some(o=>o.r!=null?Math.hypot(x-o.x,z-o.z)<o.r+.7:(x>o.x0-.7&&x<o.x1+.7&&z>o.z0-.7&&z<o.z1+.7)); }
function dogTick(dt){ if(!DOG.g||!HUB.pos) return; DOG.t+=dt; const P=HUB.pos, bx=(HUB.bx||35)-3, bz=(HUB.bz||25)-3, dPl=Math.hypot(P.x-DOG.x,P.z-DOG.z); let moving=false, sp=0;
  if(DOG.st==='wander'){ DOG.wait-=dt; if(DOG.wait<=0&&Math.hypot(DOG.tx-DOG.x,DOG.tz-DOG.z)<.5){ if(dPl<10&&Math.random()<.45){ DOG.tx=P.x+(Math.random()-.5)*3; DOG.tz=P.z+(Math.random()-.5)*3; DOG.st='visit'; } else { for(let i=0;i<20;i++){ const x=(Math.random()*2-1)*bx, z=(Math.random()*2-1)*bz; if(!dogBlocked(x,z)){ DOG.tx=x; DOG.tz=z; break; } } DOG.wait=1+Math.random()*3; } } }
  if(DOG.st==='visit'&&Math.hypot(DOG.tx-DOG.x,DOG.tz-DOG.z)<1.6){ DOG.st='sit'; DOG.sit=3+Math.random()*3; }
  if(DOG.st==='sit'){ DOG.sit-=dt; const a=Math.atan2(P.x-DOG.x,P.z-DOG.z); let d2=a-DOG.h; d2=Math.atan2(Math.sin(d2),Math.cos(d2)); DOG.h+=d2*Math.min(1,dt*4); if(DOG.sit<=0){ DOG.st='wander'; DOG.wait=1; DOG.tx=DOG.x; DOG.tz=DOG.z; } }
  else { const dx=DOG.tx-DOG.x, dz=DOG.tz-DOG.z, d=Math.hypot(dx,dz); if(d>.4){ sp=DOG.st==='visit'?3.2:1.9; const a=Math.atan2(dx,dz); let d2=a-DOG.h; d2=Math.atan2(Math.sin(d2),Math.cos(d2)); DOG.h+=d2*Math.min(1,dt*6); const nx=DOG.x+Math.sin(DOG.h)*sp*dt, nz=DOG.z+Math.cos(DOG.h)*sp*dt;
      if(dogBlocked(nx,nz)||Math.abs(nx)>bx||Math.abs(nz)>bz){ DOG.tx=DOG.x; DOG.tz=DOG.z; DOG.wait=.3; if(DOG.st==='visit') DOG.st='wander'; } else { DOG.x=nx; DOG.z=nz; moving=true; } } }
  const g=DOG.g, k=DOG.t*(moving?(sp>2.5?13:9):0); g.position.set(DOG.x,0,DOG.z); g.rotation.y=DOG.h;
  DOG.legs.forEach((l,i)=>{ l.rotation.x=moving?Math.sin(k+(i%2?0:Math.PI)+(i>1?Math.PI/2:0))*.7:0; }); const sitting=DOG.st==='sit';
  DOG.body.rotation.x=sitting?-.45:0; DOG.body.position.y=sitting?.42:.56+(moving?Math.abs(Math.sin(k))*.03:0); DOG.legs.slice(2).forEach(l=>{ if(sitting) l.rotation.x=1.2; }); DOG.head.rotation.x=sitting?.5:0; DOG.head.rotation.y=Math.sin(DOG.t*.8)*.15;
  DOG.tail.rotation.y=Math.sin(DOG.t*(sitting||DOG.st==='visit'?16:6))*.6; DOG.tail.rotation.x=-.5; }
{ const _hb=hubBuild; hubBuild=function(){ const r=_hb.apply(this,arguments); try{ dogAdd(); }catch(e){ console.warn('chien',e); } return r; }; }
{ const _hf=hubFrame; hubFrame=function(dt,time){ try{ if(view==='hub') dogTick(Math.min(dt,.05)); }catch(e){} return _hf.apply(this,arguments); }; }

/* fiches de l'Arène : pas de bouton × (les boutons du bas suffisent), contenu recentré */
{ const _rs=renderSheet; renderSheet=function(){ const r=_rs.apply(this,arguments); try{ const el=$('sheet'); if(el) el.classList.toggle('nox',!!(sheet&&['rue','wstation','cbcard','cbtalk','cbcup'].includes(sheet.t))); }catch(_){} return r; }; }