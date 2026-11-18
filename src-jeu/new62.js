/* ===== v1.9 : grande carte de la Région, décor de ville autour du duel, textes 3D qui tiennent dans leur cadre, contrôle de la route ===== */

/* ---------- 1. étiquettes 3D : le texte rétrécit pour toujours tenir dans son cadre (ex. « CONCOURS D'ÉLÉGANCE ») ---------- */
labelSprite=function(txt,col,scale){
  const t=ctex(256,64,(x,W,H)=>{ x.fillStyle='rgba(6,4,20,.82)'; x.fillRect(0,0,W,H); x.strokeStyle=col; x.lineWidth=3; x.strokeRect(2,2,W-4,H-4); x.fillStyle=col; x.textAlign='center'; x.textBaseline='middle';
    let fs=28; x.font='700 '+fs+'px "Chakra Petch",Arial,sans-serif'; while(x.measureText(txt).width>W-22&&fs>9){ fs--; x.font='700 '+fs+'px "Chakra Petch",Arial,sans-serif'; } x.fillText(txt,W/2,H/2+2); });
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,fog:false})); s.scale.set(scale,scale/4,1); return s; };

/* ---------- 2. grande carte de la Région (toucher la mini-carte) ---------- */
function wBigOpen(){ if(!W.on||$('wBig')) return; W.big=true; const d=document.createElement('div'); d.id='wBig'; d.className='wbig';
  d.innerHTML=`<div class="wb-h"><b>🗺️ Région Néon</b><span>${rueNB()}/8 badges</span><button class="btn alt sm" id="wbX">Fermer</button></div><canvas id="wbC"></canvas>
    <div class="wb-leg"><span><i style="background:#fcee0a"></i>Toi</span><span><i style="background:#5dff9a"></i>Station</span><span><i style="background:#ff2b4a"></i>Barrière / sauvages</span><span><i style="background:#00e5ff"></i>Voie double</span></div>`;
  $('wov').appendChild(d); $('wbX').addEventListener('click',wBigClose); d.addEventListener('pointerdown',e=>e.stopPropagation()); wBigDraw(); }
function wBigClose(){ W.big=false; const d=$('wBig'); if(d) d.remove(); }
function wBigDraw(){ const cv=$('wbC'); if(!cv) return; const r=cv.getBoundingClientRect(), k=Math.min(2,window.devicePixelRatio||1); cv.width=r.width*k; cv.height=r.height*k; const x=cv.getContext('2d'); x.scale(k,k);
  const Wd=r.width, H=r.height, b=[-470,860,-600,640], s=Math.min((Wd-30)/(b[1]-b[0]),(H-30)/(b[3]-b[2])), ox=(Wd-(b[1]-b[0])*s)/2-b[0]*s, oz=(H-(b[3]-b[2])*s)/2-b[2]*s, X=v=>v*s+ox, Z=v=>v*s+oz;
  x.fillStyle='#0b0820'; x.fillRect(0,0,Wd,H);
  x.strokeStyle='rgba(120,110,200,.08)'; x.lineWidth=1; for(let g=-600;g<=900;g+=100){ x.beginPath(); x.moveTo(X(g),0); x.lineTo(X(g),H); x.stroke(); x.beginPath(); x.moveTo(0,Z(g)); x.lineTo(Wd,Z(g)); x.stroke(); }
  x.lineCap='round'; x.lineJoin='round';
  W.paths.forEach(R=>{ const lock=wGateLocked(R.k); x.strokeStyle=lock?'rgba(255,43,74,.55)':R.isAlt?'#00e5ff':'#c8c8e6'; x.lineWidth=R.isAlt?3:5; x.beginPath(); R.P.forEach((p,i)=>{ if(i%3) return; i?x.lineTo(X(p.x),Z(p.z)):x.moveTo(X(p.x),Z(p.z)); }); x.stroke(); });
  W.routes.forEach(R=>{ const p=R.P[Math.round(R.P.length*.62)]; x.fillStyle='rgba(8,6,20,.85)'; x.fillRect(X(p.x)-20,Z(p.z)-8,40,15); x.fillStyle='#c8c8e6'; x.font='bold 10px system-ui'; x.textAlign='center'; x.fillText('Route '+(R.k+1),X(p.x),Z(p.z)+3);
    if(wGateLocked(R.k)){ const g=R.P[R.gate]; x.font='13px system-ui'; x.fillText('🔒',X(g.x),Z(g.z)+4); } });
  (W.stations||[]).forEach(t=>{ x.fillStyle='#5dff9a'; x.beginPath(); x.arc(X(t.x),Z(t.z),5,0,7); x.fill(); x.fillStyle='#0b0820'; x.font='bold 8px system-ui'; x.textAlign='center'; x.fillText('⛽',X(t.x),Z(t.z)+3); });
  W.wild.forEach(w=>{ if(!w.g||w.off>0) return; x.fillStyle='rgba(255,43,74,.8)'; x.fillRect(X(w.g.position.x)-2,Z(w.g.position.z)-2,4,4); });
  W_TOWNS.forEach(T=>{ const C=rueChOf(T), got=C&&rueSt().bdg[C.ty], here=W.town===T.k&&wTownAt(W.p.x,W.p.z)>=0;
    x.fillStyle=T.col; x.globalAlpha=.25; x.fillRect(X(T.x)-W_R*s-3,Z(T.z)-W_R*s-3,2*W_R*s+6,2*W_R*s+6); x.globalAlpha=1;
    x.strokeStyle=T.col; x.lineWidth=got?3:2; x.strokeRect(X(T.x)-W_R*s-3,Z(T.z)-W_R*s-3,2*W_R*s+6,2*W_R*s+6);
    x.font='15px system-ui'; x.textAlign='center'; x.fillText(C?(got?'🎖️':CB_TYPES[C.ty].ic):'🏠',X(T.x),Z(T.z)+5);
    x.font='bold 11px system-ui'; x.fillStyle='#fff'; x.fillText(T.nm,X(T.x),Z(T.z)-W_R*s-9);
    x.font='9px system-ui'; x.fillStyle='#a9a6d0'; x.fillText(C?'Champion niv. '+C.lv+(T.pil.length?' · '+T.pil.length+' pilote'+(T.pil.length>1?'s':''):''):(T.pil.length+' pilotes de rue'),X(T.x),Z(T.z)+W_R*s+16);
    if(here){ x.strokeStyle='#fcee0a'; x.setLineDash([4,3]); x.strokeRect(X(T.x)-W_R*s-8,Z(T.z)-W_R*s-8,2*W_R*s+16,2*W_R*s+16); x.setLineDash([]); } });
  const P=W.p; x.save(); x.translate(X(P.x),Z(P.z)); x.rotate(P.h); x.fillStyle='#fcee0a'; x.shadowColor='#fcee0a'; x.shadowBlur=10; x.beginPath(); x.moveTo(11,0); x.lineTo(-7,-7); x.lineTo(-7,7); x.closePath(); x.fill(); x.restore(); }
{ const _wd=wDom; wDom=function(){ const r=_wd.apply(this,arguments); const m=$('wMap'); if(m&&!m._b){ m._b=1; m.style.cursor='pointer'; m.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); wBigOpen(); }); } return r; }; }
{ const _wt=wTick; wTick=function(dt){ if(W.big){ W.p.v=0; } const r=_wt.apply(this,arguments); if(W.big){ W.bigT=(W.bigT||0)-dt; if(W.bigT<=0){ W.bigT=.5; wBigDraw(); } } return r; }; }
{ const _q=ACT.wquit; ACT.wquit=function(){ wBigClose(); return _q.apply(this,arguments); }; }

/* ---------- 3. duel : la ville autour de l'arène (immeubles, rues, néons) au lieu du vide ---------- */
{ const _cs=cb3dScene; cb3dScene=function(){ const r=_cs.apply(this,arguments); try{ cbCity62(r.sc); }catch(e){ console.warn('cb ville',e); } return r; }; }
function cbCity62(sc){ let sd=99; const rn=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  const cx=(CB3_P[0].x+CB3_P[1].x)/2, cz=(CB3_P[0].z+CB3_P[1].z)/2;
  /* sol : rues et trottoirs autour de l'arène à la place de la grille */
  sc.children.filter(o=>o.isMesh&&o.geometry&&o.geometry.type==='CircleGeometry'&&o.geometry.parameters.radius===60).forEach(o=>{ sc.remove(o); });
  const gt=ctex(512,512,(x,Wd,H)=>{ x.fillStyle='#1d1b2a'; x.fillRect(0,0,Wd,H); for(let i=0;i<5000;i++){ x.fillStyle=`rgba(255,255,255,${rn()*.05})`; x.fillRect(rn()*Wd,rn()*H,2,2); }
    x.fillStyle='#2c2a3a'; x.fillRect(0,0,Wd,60); x.fillRect(0,0,60,H); x.fillStyle='#24222f'; for(let i=0;i<Wd;i+=32){ x.fillRect(i,0,2,60); x.fillRect(0,i,60,2); }
    x.fillStyle='#f2d34a'; for(let i=80;i<Wd;i+=60) x.fillRect(i,286,30,5); for(let i=80;i<H;i+=60) x.fillRect(286,i,5,30);
    x.fillStyle='#e8e8ee'; for(let i=0;i<6;i++) x.fillRect(100+i*14,70,8,40); },[4,4]);
  const gr=new THREE.Mesh(new THREE.CircleGeometry(80,48),new THREE.MeshLambertMaterial({map:gt})); gr.rotation.x=-Math.PI/2; gr.position.set(cx,-.02,cz); sc.add(gr);
  /* immeubles proches tout autour, sauf du côté de la caméra (qui tourne entre ~-0,5 et 0,95 rad autour de l'arène) */
  const facs=wFacs(), box=new THREE.BoxGeometry(1,1,1), neon=[0x00e5ff,0xff2bd6,0xfcee0a,0x8fffc8,0xff7a1a], SIG=['GARAGE','PNEUS','NÉON','RAMEN','MOTEL','ARCADE','KARAOKÉ','CAFÉ','DINER','LAVAGE'];
  for(let ring=0;ring<2;ring++){ const n=ring?30:22; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+ring*.13, camA=Math.atan2(10.6,-9.4)+.2, da=Math.abs(Math.atan2(Math.sin(a-camA),Math.cos(a-camA)));
      if(da<(ring?1.0:1.35)) continue; const R=(ring?27:17)+rn()*4, w=5+rn()*4, h=(ring?16:9)+rn()*(ring?30:16), d=5+rn()*3, x=cx+Math.cos(a)*R, z=cz+Math.sin(a)*R;
      const m=new THREE.Mesh(box,facs[Math.floor(rn()*5)]); m.scale.set(w,h,d); m.position.set(x,h/2,z); m.lookAt(cx,h/2,cz); sc.add(m);
      if(rn()<.65){ const c=neon[Math.floor(rn()*neon.length)], e=new THREE.Mesh(new THREE.BoxGeometry(.2,h,.2),new THREE.MeshBasicMaterial({color:c})); e.position.set(x-Math.cos(a)*d/2,h/2,z-Math.sin(a)*d/2); sc.add(e); }
      if(!ring&&rn()<.6){ const sg=rueSign(SIG[Math.floor(rn()*SIG.length)],'#'+neon[Math.floor(rn()*5)].toString(16).padStart(6,'0'),Math.min(w-.6,4),1); sg.position.set(x-Math.cos(a)*(d/2+.06),3+rn()*3,z-Math.sin(a)*(d/2+.06)); sg.lookAt(cx,sg.position.y,cz); sc.add(sg); } } }
  /* lampadaires autour de l'arène */
  for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, x=cx+Math.cos(a)*14, z=cz+Math.sin(a)*14, p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,4.5,6),new THREE.MeshLambertMaterial({color:0x2a2a36})); p.position.set(x,2.25,z); sc.add(p);
    const h=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:0xfff1c4})); h.position.set(x,4.6,z); sc.add(h); } }

/* ---------- 4. contrôle : rien ne doit gêner la chaussée (sert aux tests) ---------- */
function wCheckRoad(){ const bad=[]; (W.obs||[]).forEach(o=>{ const q=wNear(o.x,o.z,0); if(!q) return; if(o.t==='pilier'){ /* un pilier est sous le pont : il ne doit gêner que les voies au sol */ }
    W.paths.forEach(R=>{ const m=wIdxOn(R,o.x,o.z), p=R.P[m.i]; if(p.y>1.5&&o.t!=='pilier') return; if(o.t==='pilier'&&p.y>1.5) return;
      if(Math.min(p.dA,p.dB)<W_R) return; if(m.d<W_HW+1.3+o.r) bad.push(o.t+' à '+m.d.toFixed(1)+' m de l’axe (route '+(R.k+1)+(R.isAlt?' bis':'')+')'); }); });
  return bad; }
