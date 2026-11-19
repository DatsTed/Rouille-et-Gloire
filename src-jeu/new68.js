/* ===== v2.5 : écran de course sans barre du bas (mini-carte dans le vide sous les boutons), Région Néon avec la même interface que les épreuves,
   spawn dos au garage, jauge GAZ qui se remplit, grande carte zoomable ===== */

/* ---------- 1. épreuves : la mini-carte du Spa quitte le coin de l'écran 3D et va dans le vide sous les boutons ---------- */
{ const _v=vSpa; vSpa=function(){ let h=_v.apply(this,arguments);
  try{ if(h.indexOf('race ptest')>=0) return h;
    const mi='<canvas id="mini" class="mini" width="96" height="150"></canvas>'; if(h.indexOf(mi)<0) return h;
    h=h.replace(mi,''); const i=h.lastIndexOf('</div>');
    return h.slice(0,i)+'<div class="mslot"><canvas id="mini" class="mini2" width="192" height="300"></canvas></div>'+h.slice(i);
  }catch(e){ console.warn('mini68',e); } return h; }; }

/* ---------- 2. Région : spawn dos au garage, face aux arches ---------- */
{ const _sp=wSpawn; wSpawn=function(k){ const T=W_TOWNS[k]||W_TOWNS[0];
  if(T.ga==null) return _sp.apply(this,arguments);
  const n=[Math.cos(T.ga),Math.sin(T.ga)], t=[-n[1],n[0]]; let u=0;
  try{ const R=W.paths.find(r=>r.A===T&&!r.isAlt)||W.paths.find(r=>r.A===T||r.B===T), g=R&&R.P[Math.max(0,R.gate)];
    if(g){ const dx=g.x-T.x, dz=g.z-T.z, dl=Math.hypot(dx,dz)||1; if((dx*n[0]+dz*n[1])/dl<-.7) u=clamp(dx*t[0]+dz*t[1],-24,24); } }catch(e){}
  const P=W.p; P.x=T.x+n[0]*(W_R-36)+t[0]*u; P.z=T.z+n[1]*(W_R-36)+t[1]*u; P.h=Math.atan2(-n[1],-n[0]); P.va=null; P.v=0; P.y=0; W.grace=3; W.camI=0; W.c68=null; }; }

/* ---------- 3. Région : interface identique aux épreuves (écran 3D arrondi + HUD, pavé, boutons Son / Caméra / Remettre / Quitter, carte dessous) ---------- */
wDom=function(){ if($('wov')) return; const d=document.createElement('div'); d.id='wov';
  d.innerHTML=`<div class="race wrace"><div class="rwrap"><div class="rs" id="wslot"></div>
      <div class="hud"><div class="w-nit" id="wNitG"></div>
        <div class="hud-top"><div class="w-zone" id="wZone"></div><div class="w-team" id="wTeam"></div></div>
        <div class="w-act" id="wAct"></div>
        <div class="hud-bot"><div class="spd"><b id="wSpd">0</b><small>km/h</small></div>
          <div class="gauges"><div class="g"><span>Gaz</span><div class="bar2"><i id="wGasFill"></i></div></div><div class="g"><span>Nitro</span><div class="bar2 n"><i id="wNitFill"></i></div></div></div></div></div></div>
    <div class="padS pad49 wpad"><div id="wSteer" class="steer"><div id="wKnob" class="wheel">${WHEEL}</div><div class="lab">Volant</div></div>
      <button id="wBrk" class="pedal brk"><span>Frein</span></button>
      <div class="dnk"><button id="wHnd" class="pedal hnd big"><span>Drift</span><small>frein à main</small></button><button id="wNit" class="pedal nit">Nitro<small id="wNitT">prêt</small></button></div>
      <button id="wGas" class="pedal gas big"><i id="wGasP"></i><span>Gaz<small>glisse vers le bas pour doser</small></span></button></div>
    <div style="display:flex;gap:8px"><button class="btn alt sm" id="bAud" data-a="audio">⚙ Son</button><button class="btn alt sm" id="bCam" data-a="wcam">${ptCamTx()}</button><button class="btn alt sm" id="bResp" data-a="wresp">Remettre sur la route</button><button class="btn danger sm" id="bQuit" data-a="wquit">Quitter</button></div>
    <div class="mslot"><canvas id="wMap"></canvas></div></div>`;
  document.body.appendChild(d); document.body.classList.add('won');
  const zn=$('wSteer'), setSt=e=>{ const r=zn.getBoundingClientRect(); W.in.st=clamp(((e.clientX-r.left)/r.width*2-1)*1.15,-1,1); };
  zn.addEventListener('pointerdown',e=>{ e.preventDefault(); zn.classList.remove('rel'); try{ zn.setPointerCapture(e.pointerId); }catch(_){} setSt(e); });
  zn.addEventListener('pointermove',e=>{ if(e.buttons||e.pressure>0) setSt(e); });
  const zup=()=>{ W.in.st=0; zn.classList.add('rel'); }; zn.addEventListener('pointerup',zup); zn.addEventListener('pointercancel',zup);
  const bg=$('wGas'); let y0=0, gd=false;
  bg.addEventListener('pointerdown',e=>{ e.preventDefault(); try{ bg.setPointerCapture(e.pointerId); }catch(_){} gd=true; y0=e.clientY; W.in.gas=1; bg.classList.add('on'); });
  bg.addEventListener('pointermove',e=>{ if(gd) W.in.gas=clamp(1-Math.max(0,e.clientY-y0)/110,.25,1); });
  const gup=()=>{ gd=false; W.in.gas=0; bg.classList.remove('on'); }; bg.addEventListener('pointerup',gup); bg.addEventListener('pointercancel',gup);
  [['wBrk','brk'],['wHnd','hand']].forEach(([id,k])=>{ const b=$(id); b.addEventListener('pointerdown',e=>{ e.preventDefault(); W.in[k]=1; b.classList.add('on'); try{ b.setPointerCapture(e.pointerId); }catch(_){} });
    const off=()=>{ W.in[k]=0; b.classList.remove('on'); }; b.addEventListener('pointerup',off); b.addEventListener('pointercancel',off); });
  $('wNit').addEventListener('pointerdown',e=>{ e.preventDefault(); wNitro(); });
  [zn,bg,$('wBrk'),$('wHnd'),$('wNit'),$('wMap')].forEach(b=>b.addEventListener('contextmenu',e=>e.preventDefault()));
  const m=$('wMap'); m.style.cursor='pointer'; m.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); wBigOpen(); }); };

/* caméras : mêmes 3 vues que les épreuves (Poursuite / Proche 30° / Cockpit), le réglage est partagé */
const wCamI=()=>{ const v=S.camv; return v>=0&&v<3?v|0:0; };
ACT.wcam=function(){ S.camv=(wCamI()+1)%3; W.c68=null; W.camI=0; save(); const b=$('bCam'); if(b) b.textContent=ptCamTx(); try{ toast('📷 Vue : '+PTCAMN[S.camv]); }catch(_){} };
function wCam68(dt){ if(!W.on||!W.cam||!W.car||W.orbit||CBV) return; const m=wCamI(), P=W.p, cam=W.cam, py=P.y||0, fx=Math.cos(P.h), fz=Math.sin(P.h), v=Math.abs(P.v);
  W.car.g.visible=(m!==2);
  if(m===0){ if(cam.fov!==60){ cam.fov=60; cam.updateProjectionMatrix(); } return; }
  let px,pyy,pz,lx,ly,lz,fov;
  if(m===1){ const dd=7.6+Math.min(v,60)*.02, hh=Math.tan(30*Math.PI/180)*dd, tx=P.x-fx*dd, tz=P.z-fz*dd, ty=1.3+hh+py;
    if(!W.c68) W.c68={x:tx,y:ty,z:tz}; const k=1-Math.exp(-dt*9), c=W.c68; c.x+=(tx-c.x)*k; c.y+=(ty-c.y)*k; c.z+=(tz-c.z)*k; px=c.x; pyy=c.y; pz=c.z; lx=P.x+fx*9; ly=1.1+py; lz=P.z+fz*9; fov=66+Math.min(v,60)*.18; }
  else { px=P.x+fx*.5; pyy=1.25+py; pz=P.z+fz*.5; lx=P.x+fx*30; ly=pyy-.2; lz=P.z+fz*30; fov=78+Math.min(v,60)*.2+(W.nitT>0?10:0); }
  cam.position.set(px,pyy,pz); cam.lookAt(lx,ly,lz); if(Math.abs(cam.fov-fov)>.05){ cam.fov=fov; cam.updateProjectionMatrix(); } }
{ const _t=wTick; wTick=function(dt){ const r=_t.apply(this,arguments); try{ wCam68(Math.min(dt,.05)); }catch(e){ console.warn('cam68',e); } return r; }; }

/* remettre sur la route : dans une ville, retour au point de départ de la ville ; sur la route, au point le plus proche, dans le sens de la marche */
ACT.wresp=function(){ if(!W.on||CBV||sheet||W.fight||W.big) return; const P=W.p, tw=wTownAt(P.x,P.z);
  if(tw>=0){ wSpawn(tw); return toast('↩️ Remis au centre de la ville'); }
  const q=wNear(P.x,P.z,P.y||0); if(!q||!q.p){ wSpawn(W.town>=0?W.town:0); return toast('↩️ Retour à la dernière ville'); }
  const p=q.p, fx=Math.cos(P.h), fz=Math.sin(P.h), s=(p.tx*fx+p.tz*fz)<0?-1:1;
  P.x=p.x; P.z=p.z; P.y=p.y||0; P.h=Math.atan2(p.tz*s,p.tx*s); P.va=null; P.v=0; W.grace=2; W.camI=0; W.c68=null; toast('↩️ Remis sur la route'); };

/* jauges : le bouton GAZ se remplit en vert quand tu accélères (comme dans les épreuves), jauge de nitro */
{ const _h=wHud; wHud=function(dt){ _h.apply(this,arguments);
  try{ const k=W.key||{}, g=W.in.gas||((k.ArrowUp||k.z||k.w)?1:0), tg=(sheet||CBV||W.fight||W.big)?0:g; W.gv=(W.gv||0)+(tg-(W.gv||0))*Math.min(1,dt*10);
    const v=Math.round(clamp(W.gv,0,1)*100), gp=$('wGasP'); if(gp&&gp._v!==v){ gp._v=v; gp.style.height=v+'%'; } const gf=$('wGasFill'); if(gf&&gf._v!==v){ gf._v=v; gf.style.width=v+'%'; }
    const nf=$('wNitFill'); if(nf){ const q=W.nitT>0?W.nitT/2.5:W.nitCd>0?1-W.nitCd/12:1, nv=Math.round(clamp(q,0,1)*100); if(nf._v!==nv){ nf._v=nv; nf.style.width=nv+'%'; } }
    const sp=$('wSpd'); if(sp) sp.classList.toggle('hot',W.nitT>0); }catch(e){} }; }

/* carte du bas : radar centré sur toi, qui remplit le vide sous les boutons ; touche-la pour la grande carte */
wMap=function(){ const cv=$('wMap'); if(!cv) return; const d=Math.min(2,window.devicePixelRatio||1), cw=cv.clientWidth, ch=cv.clientHeight; if(!cw||!ch) return;
  if(cv._w!==cw||cv._h!==ch){ cv._w=cw; cv._h=ch; cv.width=Math.round(cw*d); cv.height=Math.round(ch*d); }
  const x=cv.getContext('2d'), P=W.p, k=Math.max(.18,ch/400), X=v=>(v-P.x)*k+cw/2, Z=v=>(v-P.z)*k+ch/2, vis=(a,b,m)=>X(a)>-m&&X(a)<cw+m&&Z(b)>-m&&Z(b)<ch+m;
  x.setTransform(d,0,0,d,0,0); x.fillStyle='#08061a'; x.fillRect(0,0,cw,ch);
  x.strokeStyle='rgba(120,110,200,.09)'; x.lineWidth=1; for(let g=-600;g<=900;g+=100){ x.beginPath(); x.moveTo(X(g),0); x.lineTo(X(g),ch); x.stroke(); x.beginPath(); x.moveTo(0,Z(g)); x.lineTo(cw,Z(g)); x.stroke(); }
  x.lineCap='round'; x.lineJoin='round';
  W.paths.forEach(R=>{ x.strokeStyle=wGateLocked(R.k)?'rgba(255,43,74,.7)':R.isAlt?'rgba(0,229,255,.8)':'rgba(205,205,235,.85)'; x.lineWidth=R.isAlt?2:3.5; x.beginPath(); let on=false;
    for(let i=0;i<R.P.length;i+=3){ const p=R.P[i]; if(!vis(p.x,p.z,30)){ on=false; continue; } if(on) x.lineTo(X(p.x),Z(p.z)); else{ x.moveTo(X(p.x),Z(p.z)); on=true; } } x.stroke(); });
  x.fillStyle='#5dff9a'; (W.stations||[]).forEach(s=>{ if(vis(s.x,s.z,8)) x.fillRect(X(s.x)-3,Z(s.z)-3,6,6); });
  W_TOWNS.forEach(T=>{ if(!vis(T.x,T.z,W_R*k+30)) return; const C=rueChOf(T), got=C&&rueSt().bdg[C.ty], s=W_R*k;
    x.globalAlpha=.22; x.fillStyle=T.col; x.fillRect(X(T.x)-s,Z(T.z)-s,2*s,2*s); x.globalAlpha=1; x.strokeStyle=T.col; x.lineWidth=got?2.5:1.6; x.strokeRect(X(T.x)-s,Z(T.z)-s,2*s,2*s);
    x.font='13px system-ui'; x.textAlign='center'; x.fillStyle='#fff'; x.fillText(C?(got?'🎖️':CB_TYPES[C.ty].ic):'🏠',X(T.x),Z(T.z)+5);
    x.font='bold 10px system-ui'; x.fillText(T.nm,X(T.x),Math.max(10,Z(T.z)-s-4)); });
  x.fillStyle='#ff2b4a'; W.wild.forEach(w=>{ if(!w.g||!w.g.visible||!vis(w.g.position.x,w.g.position.z,4)) return; x.fillRect(X(w.g.position.x)-2.5,Z(w.g.position.z)-2.5,5,5); });
  x.save(); x.translate(cw/2,ch/2); x.rotate(P.h); x.fillStyle='#fcee0a'; x.shadowColor='#fcee0a'; x.shadowBlur=8; x.beginPath(); x.moveTo(9,0); x.lineTo(-6,-6); x.lineTo(-6,6); x.closePath(); x.fill(); x.restore();
  x.font='9px system-ui'; x.textAlign='right'; x.fillStyle='#8b90c8'; x.fillText('Touche pour la grande carte',cw-8,ch-7); };

/* ---------- 4. grande carte : zoom (pincer, molette, boutons) et déplacement au doigt ---------- */
const WB={x0:-470,x1:860,z0:-600,z1:640};
function wBigView(cv){ const r=cv.getBoundingClientRect(), V=W.bv||(W.bv={z:1,cx:(WB.x0+WB.x1)/2,cz:(WB.z0+WB.z1)/2}), Wd=r.width, H=r.height, s0=Math.min((Wd-30)/(WB.x1-WB.x0),(H-30)/(WB.z1-WB.z0)), s=s0*V.z;
  const mx=(WB.x1-WB.x0)/2, mz=(WB.z1-WB.z0)/2, ex=Math.max(0,mx-(Wd/2)/s+60/s), ez=Math.max(0,mz-(H/2)/s+60/s), bx=(WB.x0+WB.x1)/2, bz=(WB.z0+WB.z1)/2;
  V.cx=clamp(V.cx,bx-ex,bx+ex); V.cz=clamp(V.cz,bz-ez,bz+ez); return {r,V,Wd,H,s0,s}; }
function wBigOpen(){ if(!W.on||$('wBig')) return; W.big=true; W.bv=null; const d=document.createElement('div'); d.id='wBig'; d.className='wbig';
  d.innerHTML=`<div class="wb-h"><b>🗺️ Région Néon</b><span>${rueNB()}/8 badges</span><button class="btn alt sm" id="wbX">Fermer</button></div><canvas id="wbC"></canvas>
    <div class="wb-zoom"><button class="btn alt sm" id="wbM" aria-label="Dézoomer">−</button><button class="btn alt sm" id="wbR">Tout voir</button><button class="btn alt sm" id="wbMe">⌖ Moi</button><button class="btn alt sm" id="wbP" aria-label="Zoomer">+</button></div>
    <div class="wb-leg"><span><i style="background:#fcee0a"></i>Toi</span><span><i style="background:#5dff9a"></i>Station</span><span><i style="background:#ff2b4a"></i>Barrière / sauvages</span><span><i style="background:#00e5ff"></i>Voie double</span></div>`;
  $('wov').appendChild(d); d.addEventListener('pointerdown',e=>e.stopPropagation());
  const cv=$('wbC'), zoomAt=(f,px,py)=>{ const o=wBigView(cv), V=o.V, nz=clamp(V.z*f,1,8); if(nz===V.z) return; /* le point sous le doigt reste en place */
      const wx=(px-o.Wd/2)/o.s+V.cx, wz=(py-o.H/2)/o.s+V.cz; V.z=nz; const s2=o.s0*nz; V.cx=wx-(px-o.Wd/2)/s2; V.cz=wz-(py-o.H/2)/s2; wBigDraw(); };
  $('wbX').addEventListener('click',wBigClose);
  $('wbP').addEventListener('click',()=>zoomAt(1.6,cv.clientWidth/2,cv.clientHeight/2)); $('wbM').addEventListener('click',()=>zoomAt(1/1.6,cv.clientWidth/2,cv.clientHeight/2));
  $('wbR').addEventListener('click',()=>{ W.bv=null; wBigDraw(); });
  $('wbMe').addEventListener('click',()=>{ const V=wBigView(cv).V; V.z=3.2; V.cx=W.p.x; V.cz=W.p.z; wBigDraw(); });
  /* gestes : un doigt déplace, deux doigts pincent, la molette zoome */
  const ptr=new Map(); let last=0;
  cv.addEventListener('pointerdown',e=>{ e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){} const r=cv.getBoundingClientRect(); ptr.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top}); last=0; });
  cv.addEventListener('pointermove',e=>{ const p=ptr.get(e.pointerId); if(!p) return; const r=cv.getBoundingClientRect(), nx=e.clientX-r.left, ny=e.clientY-r.top;
    if(ptr.size===1){ const o=wBigView(cv); o.V.cx-=(nx-p.x)/o.s; o.V.cz-=(ny-p.y)/o.s; p.x=nx; p.y=ny; wBigDraw(); }
    else if(ptr.size===2){ const a=[...ptr.values()], d0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1, mid={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}; p.x=nx; p.y=ny; const b=[...ptr.values()], d1=Math.hypot(b[0].x-b[1].x,b[0].y-b[1].y)||1;
      const o=wBigView(cv); o.V.cx-=((b[0].x+b[1].x)/2-mid.x)/o.s; o.V.cz-=((b[0].y+b[1].y)/2-mid.y)/o.s; zoomAt(d1/d0,(b[0].x+b[1].x)/2,(b[0].y+b[1].y)/2); } });
  const up=e=>{ ptr.delete(e.pointerId); }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up); cv.addEventListener('pointerleave',up);
  cv.addEventListener('wheel',e=>{ e.preventDefault(); const r=cv.getBoundingClientRect(); zoomAt(e.deltaY<0?1.25:1/1.25,e.clientX-r.left,e.clientY-r.top); },{passive:false});
  wBigDraw(); }
function wBigDraw(){ const cv=$('wbC'); if(!cv) return; const o=wBigView(cv), k=Math.min(2,window.devicePixelRatio||1), Wd=o.Wd, H=o.H, s=o.s, V=o.V;
  if(cv._w!==Wd||cv._h!==H){ cv._w=Wd; cv._h=H; cv.width=Wd*k; cv.height=H*k; } const x=cv.getContext('2d'); x.setTransform(k,0,0,k,0,0);
  const X=v=>(v-V.cx)*s+Wd/2, Z=v=>(v-V.cz)*s+H/2, z=V.z, vis=(a,b,m)=>X(a)>-m&&X(a)<Wd+m&&Z(b)>-m&&Z(b)<H+m;
  x.fillStyle='#0b0820'; x.fillRect(0,0,Wd,H);
  x.strokeStyle='rgba(120,110,200,.08)'; x.lineWidth=1; for(let g=-600;g<=900;g+=100){ x.beginPath(); x.moveTo(X(g),0); x.lineTo(X(g),H); x.stroke(); x.beginPath(); x.moveTo(0,Z(g)); x.lineTo(Wd,Z(g)); x.stroke(); }
  x.lineCap='round'; x.lineJoin='round';
  W.paths.forEach(R=>{ const lock=wGateLocked(R.k); x.strokeStyle=lock?'rgba(255,43,74,.55)':R.isAlt?'#00e5ff':'#c8c8e6'; x.lineWidth=(R.isAlt?3:5)*Math.min(2.2,.7+z*.3); x.beginPath(); let on=false;
    for(let i=0;i<R.P.length;i+=3){ const p=R.P[i]; if(!vis(p.x,p.z,40)){ on=false; continue; } if(on) x.lineTo(X(p.x),Z(p.z)); else{ x.moveTo(X(p.x),Z(p.z)); on=true; } } x.stroke(); });
  W.routes.forEach(R=>{ const p=R.P[Math.round(R.P.length*.62)]; if(vis(p.x,p.z,30)){ x.fillStyle='rgba(8,6,20,.85)'; x.fillRect(X(p.x)-20,Z(p.z)-8,40,15); x.fillStyle='#c8c8e6'; x.font='bold 10px system-ui'; x.textAlign='center'; x.fillText('Route '+(R.k+1),X(p.x),Z(p.z)+3); }
    if(wGateLocked(R.k)){ const g=R.P[R.gate]; if(vis(g.x,g.z,20)){ x.font='13px system-ui'; x.fillText('🔒',X(g.x),Z(g.z)+4); } } });
  (W.stations||[]).forEach(t=>{ if(!vis(t.x,t.z,12)) return; x.fillStyle='#5dff9a'; x.beginPath(); x.arc(X(t.x),Z(t.z),5,0,7); x.fill(); x.fillStyle='#0b0820'; x.font='bold 8px system-ui'; x.textAlign='center'; x.fillText('⛽',X(t.x),Z(t.z)+3); });
  W.wild.forEach(w=>{ if(!w.g||w.off>0||!vis(w.g.position.x,w.g.position.z,4)) return; x.fillStyle='rgba(255,43,74,.8)'; x.fillRect(X(w.g.position.x)-2,Z(w.g.position.z)-2,4,4); });
  W_TOWNS.forEach(T=>{ if(!vis(T.x,T.z,W_R*s+60)) return; const C=rueChOf(T), got=C&&rueSt().bdg[C.ty], here=W.town===T.k&&wTownAt(W.p.x,W.p.z)>=0, q=W_R*s;
    x.fillStyle=T.col; x.globalAlpha=.25; x.fillRect(X(T.x)-q-3,Z(T.z)-q-3,2*q+6,2*q+6); x.globalAlpha=1;
    x.strokeStyle=T.col; x.lineWidth=got?3:2; x.strokeRect(X(T.x)-q-3,Z(T.z)-q-3,2*q+6,2*q+6);
    x.font=Math.round(15+Math.min(z,4)*3)+'px system-ui'; x.textAlign='center'; x.fillText(C?(got?'🎖️':CB_TYPES[C.ty].ic):'🏠',X(T.x),Z(T.z)+5+Math.min(z,4));
    x.font='bold 11px system-ui'; x.fillStyle='#fff'; x.fillText(T.nm,X(T.x),Z(T.z)-q-9);
    x.font='9px system-ui'; x.fillStyle='#a9a6d0'; x.fillText(C?'Champion niv. '+C.lv+(T.pil.length?' · '+T.pil.length+' pilote'+(T.pil.length>1?'s':''):''):(T.pil.length+' pilotes de rue'),X(T.x),Z(T.z)+q+16);
    if(here){ x.strokeStyle='#fcee0a'; x.setLineDash([4,3]); x.strokeRect(X(T.x)-q-8,Z(T.z)-q-8,2*q+16,2*q+16); x.setLineDash([]); } });
  const P=W.p; x.save(); x.translate(X(P.x),Z(P.z)); x.rotate(P.h); x.fillStyle='#fcee0a'; x.shadowColor='#fcee0a'; x.shadowBlur=10; x.beginPath(); x.moveTo(11,0); x.lineTo(-7,-7); x.lineTo(-7,7); x.closePath(); x.fill(); x.restore();
  x.font='11px system-ui'; x.textAlign='right'; x.fillStyle='#8b90c8'; x.fillText('Zoom ×'+z.toFixed(1),Wd-10,H-10); }
