/* ===== v0.43 : SALLE D'ARCADE — pinball + mini-jeux, tickets, comptoir de prix, map 3D ===== */
const ARC={
 pin:{n:'Pinball High & Rouillé',ic:'🎰',cost:100,cap:100,col:0xff2bd6,tk:s=>s/600,d:'3 billes. Maintiens LANCER pour armer le plongeur, puis flippers gauche / droite. Allume les 3 cibles pour monter le multiplicateur.'},
 drift:{n:'Reflex Drift',ic:'🚗',cost:40,col:0x00e5ff,tk:s=>s/45,d:'Touche la moitié gauche ou droite de l’écran pour changer de voie. Évite les obstacles, attrape les éclairs.'},
 drag:{n:'Drag Start',ic:'🏁',cost:40,col:0xffd400,tk:s=>s/60,d:'Démarre pile au vert (pas avant !), puis passe 3 vitesses en tapant quand l’aiguille est dans la zone verte.'},
 pit:{n:'Pit Stop Express',ic:'🔧',cost:40,col:0x3cff9e,tk:s=>s/80,d:'Touche vite la roue qui s’allume. Enchaîne sans faute pour un bonus de combo.'},
 nitro:{n:'Pousse-Nitro',ic:'⚡',cost:40,col:0xff9a1a,tk:s=>s/45,d:'Stoppe le curseur dans la zone verte. Elle rétrécit et le curseur accélère à chaque manche.'}
};
const ARCR={pin:[['Nakai',16800],['Vega',10400],['Quill',6900],['Ibarra',3800],['Brandt',1500]],drift:[['Dumas',620],['Okoye',480],['Vega',350],['Brandt',220],['Lindqvist',120]],drag:[['Quill',980],['Nakai',860],['Ibarra',700],['Okoye',540],['Dumas',380]],pit:[['Vega',1500],['Dumas',1200],['Okoye',950],['Nakai',700],['Brandt',450]],nitro:[['Okoye',760],['Quill',640],['Vega',520],['Ibarra',380],['Dumas',240]]};
function arcS(){ return S.arc||(S.arc={tk:0,best:{},plays:0,trophy:0}); }
function arcTone(f,d,type,v){ try{ if(!AU||!AU.ok) return; const c=AU.ctx, t=c.currentTime, o=c.createOscillator(), g=c.createGain(); o.type=type||'square'; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(v||.07,t); g.gain.exponentialRampToValueAtTime(.0005,t+d); o.connect(g); g.connect(AU.b.ui); o.start(t); o.stop(t+d+.02); }catch(_){} }
let AOV=null;
function arcRot(on){ try{ if(on){ if(view==='hub'&&document.body.classList.contains('hubmode')&&!HUB.rot){ HUB.rot=true; document.body.classList.add('menuport'); rotNow(false); } } else { if(HUB.rot&&!sheet){ HUB.rot=false; document.body.classList.remove('menuport'); if(view==='hub') rotNow(true); } } }catch(_){} }
const ARC_LV={nitro:3,pit:4,drag:5,drift:6,pin:7};
function arcOpen(id){
  if(AOV||!ARC[id]) return; if(S.lvl<(ARC_LV[id]||0)) return toast('🔒 '+ARC[id].n+' : niveau '+ARC_LV[id]+' requis'); const G=ARC[id]; arcRot(true);
  const o=document.createElement('div'); o.id='arcov'; o.innerHTML=`<div class="arc-top"><div class="arc-t"><b>${G.ic} ${G.n}</b><small>Record : <span id="arcbest">${fmt(arcS().best[id]||0)}</span> · 🎟️ <span id="arctk">${fmt(arcS().tk)}</span></small></div><div class="arc-sc" id="arcsc">0</div><button class="arc-x" data-a="arcquit" aria-label="Quitter">✕</button></div><div class="arc-st" id="arcst"></div><div class="arc-bar" id="arcbar"></div>`;
  document.body.appendChild(o); AOV={id,el:o,stop:null,over:false}; arcIntro(id);
}
function arcIntro(id){ const G=ARC[id], st=document.getElementById('arcst'), bar=document.getElementById('arcbar'); st.innerHTML=''; bar.innerHTML=''; const sc=document.getElementById('arcsc'); sc.textContent='0';
  const c=document.createElement('div'); c.className='arc-card'; c.innerHTML=`<div class="arc-big">${G.ic}</div><h3>${G.n}</h3><p>${G.d}</p><button class="btn wide" data-a="arcstart">▶ Jouer · ${G.cost} cr</button><button class="btn alt wide" data-a="arcquit">Retour</button>`; st.appendChild(c); }
function arcStart(){ if(!AOV) return; const id=AOV.id, G=ARC[id]; if(S.cr<G.cost) return toast('Pas assez de crédits'); S.cr-=G.cost; save(); render&&0;
  const st=document.getElementById('arcst'), bar=document.getElementById('arcbar'); st.innerHTML=''; bar.innerHTML=''; AOV.over=false;
  const api={st,bar,score:(n,t)=>{ const e=document.getElementById('arcsc'); if(e) e.innerHTML=fmt(Math.round(n))+(t?`<small>${t}</small>`:''); },end:(score,note)=>arcEnd(score,note)};
  try{ AOV.stop=GAMES[id](api)||null; }catch(e){ console.error(e); } }
function arcEnd(score,note){ if(!AOV||AOV.over) return; AOV.over=true; const id=AOV.id, G=ARC[id], A=arcS(); score=Math.max(0,Math.round(score)); if(AOV.stop){ try{ AOV.stop(); }catch(_){} AOV.stop=null; }
  const prev=A.best[id]||0, rec=score>prev; if(rec) A.best[id]=score; const tk=Math.max(0,Math.min(G.cap||60,Math.round(G.tk(score)))); A.tk+=tk; A.plays++; if(tk>0) addXP(Math.ceil(tk/4)); save();
  const riv=ARCR[id], rank=1+riv.filter(r=>r[1]>(A.best[id]||0)).length; const st=document.getElementById('arcst'), bar=document.getElementById('arcbar'); bar.innerHTML='';
  const dim=document.createElement('div'); dim.className='arc-dim'; st.appendChild(dim);
  const c=document.createElement('div'); c.className='arc-card res'; c.innerHTML=`<div class="arc-big">${rec&&score>0?'🏆':G.ic}</div><h3>${rec&&score>0?'Nouveau record !':'Partie terminée'}</h3><div class="arc-fin">${fmt(score)}</div>${note?`<p>${note}</p>`:''}<div class="arc-tk">🎟️ +${tk} ticket${tk>1?'s':''} <small>(total ${fmt(A.tk)})</small></div><p class="sm">Classement : <b>#${rank}</b> sur 6 · record ${fmt(A.best[id]||0)}</p><button class="btn wide" data-a="arcstart">↻ Rejouer · ${G.cost} cr</button><button class="btn alt wide" data-a="arcquit">Quitter</button>`;
  st.appendChild(c); const b=document.getElementById('arcbest'); if(b) b.textContent=fmt(A.best[id]||0); const tt=document.getElementById('arctk'); if(tt) tt.textContent=fmt(A.tk); auTry(()=>ui(tk>0?'coins':'close')); if(rec&&score>0) auTry(()=>ui('up')); }
function arcQuit(){ if(!AOV) return; try{ AOV.stop&&AOV.stop(); }catch(_){} AOV.el.remove(); AOV=null; arcRot(false); try{ renderSheet&&sheet&&sheet.t==='arcprix'&&renderSheet(); }catch(_){} }
const GAMES={};
/* ============ PINBALL ============ */
GAMES.pin=function(api){
  const st=api.st, bar=api.bar, W=360,H=600,R=6.5, G=640;
  const cv=document.createElement('canvas'); cv.className='arccv'; st.appendChild(cv); const ctx=cv.getContext('2d'); let K=1;
  const fit=()=>{ const r=st.getBoundingClientRect(), s=Math.min(r.width/W,r.height/H)||1, dpr=Math.min(2,window.devicePixelRatio||1); cv.style.width=(W*s)+'px'; cv.style.height=(H*s)+'px'; cv.width=Math.round(W*s*dpr); cv.height=Math.round(H*s*dpr); K=s*dpr; };
  bar.innerHTML=`<div class="pinctl"><button id="pL" class="arcb">◀</button><button id="pP" class="arcb pl">LANCER<small>maintiens</small></button><button id="pR" class="arcb">▶</button></div>`;
  fit(); const ro=window.ResizeObserver?new ResizeObserver(fit):null; if(ro) ro.observe(st);
  const segs=[]; const sg=(x1,y1,x2,y2,e,k)=>segs.push({x1,y1,x2,y2,e:e||.5,k:k||0});
  { const cx=180,cy=170,ar=168; let px=12,py=170; for(let i=1;i<=18;i++){ const a=Math.PI+i/18*Math.PI, x=cx+ar*Math.cos(a), y=cy+ar*Math.sin(a); sg(px,py,x,y,.4); px=x; py=y; } }
  sg(12,170,12,455); sg(348,170,348,594); sg(318,594,348,594); sg(318,215,318,594); sg(12,455,94,540,.3); sg(318,455,226,540,.3);
  const slL={x1:50,y1:392,x2:98,y2:462}, slR={x1:268,y1:392,x2:222,y2:462}; [slL,slR].forEach(s=>{ s.e=1.05; s.k=360; s.hit=0; segs.push(s); });
  const bumps=[{x:128,y:172,r:17,hit:0},{x:222,y:172,r:17,hit:0},{x:175,y:240,r:17,hit:0}]; const posts=[{x:150,y:330,r:6},{x:208,y:330,r:6},{x:70,y:300,r:6},{x:290,y:300,r:6}];
  const tgt=[{x:46,y:250,r:8,on:0},{x:46,y:290,r:8,on:0},{x:46,y:330,r:8,on:0}]; const lanes=[{x:132,y:64,on:0},{x:180,y:54,on:0},{x:228,y:64,on:0}];
  const FL=[{px:98,py:545,L:56,s:1,th:.6,rest:.6,act:-.52,w:0,on:false},{px:222,py:545,L:56,s:-1,th:.6,rest:.6,act:-.52,w:0,on:false}];
  const tip=f=>[f.px+f.s*f.L*Math.cos(f.th), f.py+f.L*Math.sin(f.th)];
  const B={x:333,y:572,vx:0,vy:0,st:'plunger',trail:[]}; let stuck=0, score=0, ball=1, mult=1, power=0, charging=false, save=0, usedSave=false, msg='', msgT=0, over=false, t=0, tilt=0; const N=3;
  const say=(m)=>{ msg=m; msgT=1.4; };
  const add=n=>{ score+=n*mult; api.score(score,`Bille ${Math.min(ball,N)}/${N} · ×${mult}`); };
  const hud=()=>api.score(score,`Bille ${Math.min(ball,N)}/${N} · ×${mult}`); hud();
  const reset=()=>{ B.x=333; B.y=572; B.vx=B.vy=0; B.st='plunger'; B.trail.length=0; power=0; usedSave=false; };
  const launch=()=>{ if(B.st!=='plunger') return; B.vy=-(660+640*power); B.vx=-6; B.st='play'; save=7; arcTone(220+power*300,.18,'sawtooth',.08); power=0; };
  const closest=(x,y,a,b,c,d)=>{ const dx=c-a, dy=d-b, l2=dx*dx+dy*dy, tt=Math.max(0,Math.min(1,((x-a)*dx+(y-b)*dy)/(l2||1))); return [a+dx*tt,b+dy*tt,tt]; };
  const lose=()=>{ if(over) return; if(save>0&&!usedSave){ usedSave=true; say('BALL SAVE !'); reset(); arcTone(660,.2,'triangle'); return; } ball++; arcTone(120,.35,'sawtooth',.09); if(ball>N){ finish(); } else { reset(); say('BILLE '+ball); hud(); } };
  const finish=()=>{ if(over) return; over=true; setTimeout(()=>api.end(score,''),600); };
  function phys(h){
    if(over) return;
    FL.forEach(f=>{ const tg=f.on?f.act:f.rest, d=tg-f.th, sp=(f.on?22:12)*h, step=Math.abs(d)<sp?d:Math.sign(d)*sp; f.th+=step; f.w=step/h; });
    if(charging&&B.st==='plunger') power=Math.min(1,power+h*1.1);
    if(B.st!=='play') return; if(save>0) save-=h;
    B.vy+=G*h; B.x+=B.vx*h; B.y+=B.vy*h;
    const sp=Math.hypot(B.vx,B.vy); if(sp>1300){ B.vx*=1300/sp; B.vy*=1300/sp; }
    for(const s of segs){ const [cx,cy]=closest(B.x,B.y,s.x1,s.y1,s.x2,s.y2); let dx=B.x-cx, dy=B.y-cy, d=Math.hypot(dx,dy); if(d<R){ if(d<1e-4){ dx=0; dy=-1; d=1; } const nx=dx/d, ny=dy/d; B.x=cx+nx*R; B.y=cy+ny*R; const vn=B.vx*nx+B.vy*ny; if(vn<0){ B.vx-=(1+s.e)*vn*nx; B.vy-=(1+s.e)*vn*ny; if(s.k){ B.vx+=nx*s.k*.55; B.vy+=ny*s.k*.55; if(s.hit!==undefined){ s.hit=1; add(10); arcTone(520,.06,'square',.06); } } } } }
    for(const b of bumps){ const dx=B.x-b.x, dy=B.y-b.y, d=Math.hypot(dx,dy), m=R+b.r; if(d<m){ const nx=d?dx/d:0, ny=d?dy/d:-1; B.x=b.x+nx*m; B.y=b.y+ny*m; const vn=B.vx*nx+B.vy*ny; if(vn<0){ B.vx-=2*vn*nx; B.vy-=2*vn*ny; } const s2=Math.hypot(B.vx,B.vy), k=Math.max(s2,520); B.vx=B.vx/(s2||1)*k+nx*80; B.vy=B.vy/(s2||1)*k+ny*80; b.hit=1; add(100); arcTone(700+Math.random()*300,.09,'square',.08); } }
    for(const p of posts){ const dx=B.x-p.x, dy=B.y-p.y, d=Math.hypot(dx,dy), m=R+p.r; if(d<m){ const nx=d?dx/d:0, ny=d?dy/d:-1; B.x=p.x+nx*m; B.y=p.y+ny*m; const vn=B.vx*nx+B.vy*ny; if(vn<0){ B.vx-=1.7*vn*nx; B.vy-=1.7*vn*ny; add(5); } } }
    for(const g of tgt){ const dx=B.x-g.x, dy=B.y-g.y, d=Math.hypot(dx,dy), m=R+g.r; if(d<m){ const nx=d?dx/d:1, ny=d?dy/d:0; B.x=g.x+nx*m; B.y=g.y+ny*m; const vn=B.vx*nx+B.vy*ny; if(vn<0){ B.vx-=1.5*vn*nx; B.vy-=1.5*vn*ny; } if(!g.on){ g.on=1; add(50); arcTone(880,.07,'triangle',.08); if(tgt.every(q=>q.on)){ tgt.forEach(q=>q.on=0); mult=Math.min(5,mult+1); add(500); say('MULTI ×'+mult+' !'); arcTone(1320,.25,'triangle',.1); } } } }
    for(const l of lanes){ if(!l.on&&Math.hypot(B.x-l.x,B.y-l.y)<11){ l.on=1; add(30); arcTone(990,.05,'sine',.07); if(lanes.every(q=>q.on)){ lanes.forEach(q=>q.on=0); add(300); say('BONUS +300'); arcTone(1480,.2,'triangle',.09); } } }
    for(let i=0;i<2;i++){ const f=FL[i], [tx,ty]=tip(f); const [cx,cy,tt]=closest(B.x,B.y,f.px,f.py,tx,ty); let dx=B.x-cx, dy=B.y-cy, d=Math.hypot(dx,dy); const m=R+6; if(d<m){ if(d<1e-4){ dx=0; dy=-1; d=1; } const nx=dx/d, ny=dy/d, s=tt*f.L; const vx=f.s*s*f.w*(-Math.sin(f.th))*f.s*f.s*(f.s>0?1:-1)*(f.s>0?1:1), cvx=(f.s>0?-Math.sin(f.th):Math.sin(f.th))*s*f.w, cvy=Math.cos(f.th)*s*f.w; B.x=cx+nx*m; B.y=cy+ny*m; const rel=(B.vx-cvx)*nx+(B.vy-cvy)*ny; if(rel<0){ B.vx-=(1.32)*rel*nx; B.vy-=(1.32)*rel*ny; } } }
    if(B.x>319&&B.y>560&&B.vy>=0&&Math.hypot(B.vx,B.vy)<400){ B.x=333; B.y=572; B.vx=B.vy=0; B.st='plunger'; power=0; return; }
    if(B.y>H+24) lose();
    else if(B.x<-20||B.x>W+20||B.y<-30){ reset(); }
    if(Math.hypot(B.vx,B.vy)<14&&B.y<620){ stuck+=h; if(stuck>2.2){ B.vx=(Math.random()<.5?-1:1)*140; B.vy=-180; stuck=0; } } else stuck=0;
    B.trail.push([B.x,B.y]); if(B.trail.length>7) B.trail.shift();
  }
  const draw=()=>{ ctx.setTransform(K,0,0,K,0,0); const gr=ctx.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#0c0620'); gr.addColorStop(1,'#1a0a2e'); ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(120,90,255,.12)'; ctx.lineWidth=1; for(let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); } for(let y=0;y<H;y+=30){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.fillStyle='rgba(255,212,0,.07)'; ctx.font='900 54px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillText('HIGH',180,330); ctx.fillText('& ROUILLÉ',180,384);
    ctx.lineCap='round'; ctx.lineJoin='round'; ctx.shadowBlur=10; ctx.shadowColor='#00e5ff'; ctx.strokeStyle='#00e5ff'; ctx.lineWidth=4; segs.forEach(s=>{ if(s.k) return; ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke(); });
    ctx.shadowColor='#ff2bd6'; ctx.strokeStyle='#ff2bd6'; ctx.lineWidth=6; [slL,slR].forEach(s=>{ ctx.globalAlpha=.6+.4*s.hit; ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke(); s.hit=Math.max(0,s.hit-.12); }); ctx.globalAlpha=1;
    bumps.forEach((b,i)=>{ const c=['#ffd400','#1fe06a','#ff2d2d'][i]; ctx.shadowColor=c; ctx.shadowBlur=14+b.hit*16; ctx.fillStyle='#14082a'; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,7); ctx.fill(); ctx.strokeStyle=c; ctx.lineWidth=4; ctx.stroke(); ctx.fillStyle=c; ctx.globalAlpha=.35+.65*b.hit; ctx.beginPath(); ctx.arc(b.x,b.y,b.r-6,0,7); ctx.fill(); ctx.globalAlpha=1; b.hit=Math.max(0,b.hit-.08); });
    ctx.shadowBlur=0; posts.forEach(p=>{ ctx.fillStyle='#cfd6ff'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill(); });
    tgt.forEach(g=>{ ctx.shadowColor='#3cff9e'; ctx.shadowBlur=g.on?14:0; ctx.fillStyle=g.on?'#3cff9e':'#1a3a2c'; ctx.beginPath(); ctx.arc(g.x,g.y,g.r,0,7); ctx.fill(); ctx.strokeStyle='#3cff9e'; ctx.lineWidth=2; ctx.stroke(); });
    lanes.forEach(l=>{ ctx.shadowColor='#ffd400'; ctx.shadowBlur=l.on?12:0; ctx.fillStyle=l.on?'#ffd400':'#3a3210'; ctx.beginPath(); ctx.arc(l.x,l.y,7,0,7); ctx.fill(); });
    ctx.shadowBlur=0; ctx.fillStyle='#2a1a4a'; ctx.fillRect(320,596-70*(1-power*.55)+0,26,4); ctx.fillStyle='#ffd400'; ctx.fillRect(330,568+power*22,6,30); ctx.fillStyle=`rgba(255,43,214,${.3+power*.7})`; ctx.fillRect(322,598,22,4);
    FL.forEach(f=>{ const [tx,ty]=tip(f); ctx.shadowColor='#ffd400'; ctx.shadowBlur=f.on?16:6; const g=ctx.createLinearGradient(f.px,f.py,tx,ty); g.addColorStop(0,'#ff2d2d'); g.addColorStop(.5,'#ffd400'); g.addColorStop(1,'#1fe06a'); ctx.strokeStyle=g; ctx.lineWidth=13; ctx.beginPath(); ctx.moveTo(f.px,f.py); ctx.lineTo(tx,ty); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(f.px,f.py,4,0,7); ctx.fill(); });
    B.trail.forEach((p,i)=>{ ctx.globalAlpha=i/B.trail.length*.35; ctx.fillStyle='#8fe9ff'; ctx.beginPath(); ctx.arc(p[0],p[1],R*(i/B.trail.length),0,7); ctx.fill(); }); ctx.globalAlpha=1;
    ctx.shadowColor='#8fe9ff'; ctx.shadowBlur=14; const rg=ctx.createRadialGradient(B.x-2,B.y-2,1,B.x,B.y,R); rg.addColorStop(0,'#fff'); rg.addColorStop(1,'#6ad6ff'); ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(B.x,B.y,R,0,7); ctx.fill(); ctx.shadowBlur=0;
    if(save>0&&B.st==='play'){ ctx.fillStyle='rgba(255,212,0,.8)'; ctx.font='700 11px system-ui'; ctx.textAlign='center'; ctx.fillText('BALL SAVE',180,590); }
    if(msgT>0){ ctx.globalAlpha=Math.min(1,msgT*2); ctx.fillStyle='#fff'; ctx.shadowColor='#ff2bd6'; ctx.shadowBlur=18; ctx.font='900 26px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillText(msg,180,430); ctx.globalAlpha=1; ctx.shadowBlur=0; } };
  const sim=(sec)=>{ let left=sec; while(left>1e-6){ const d=Math.min(left,1/240); phys(d); left-=d; } if(msgT>0) msgT-=sec; };
  let raf=0, last=0; const loop=ts=>{ if(!last) last=ts; const dt=Math.min(.033,(ts-last)/1000); last=ts; if(!over) sim(dt); draw(); raf=requestAnimationFrame(loop); }; raf=requestAnimationFrame(loop);
  const hold=(id,fn)=>{ const e=bar.querySelector(id); const dn=ev=>{ ev.preventDefault(); fn(true); }, up=ev=>{ ev.preventDefault(); fn(false); }; e.addEventListener('pointerdown',dn); e.addEventListener('pointerup',up); e.addEventListener('pointerleave',up); e.addEventListener('pointercancel',up); };
  const fl=(i)=>on=>{ FL[i].on=on; if(on) arcTone(180,.05,'square',.05); };
  hold('#pL',fl(0)); hold('#pR',fl(1)); hold('#pP',on=>{ if(on){ charging=true; } else { charging=false; launch(); } });
  const kd=e=>{ if(e.repeat) return; if(e.code==='ArrowLeft'||e.code==='KeyA') fl(0)(true); if(e.code==='ArrowRight'||e.code==='KeyD') fl(1)(true); if(e.code==='Space'){ charging=true; e.preventDefault(); } };
  const ku=e=>{ if(e.code==='ArrowLeft'||e.code==='KeyA') fl(0)(false); if(e.code==='ArrowRight'||e.code==='KeyD') fl(1)(false); if(e.code==='Space'){ charging=false; launch(); } };
  document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
  window.__pin={sim,B,FL,get score(){return score;},get ball(){return ball;},get over(){return over;},launch:()=>{ power=.9; launch(); },flip:(i,on)=>{ FL[i].on=on; },segs,get st(){return B.st;},get mult(){return mult;}};
  return ()=>{ cancelAnimationFrame(raf); if(ro) ro.disconnect(); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); window.__pin=null; };
};
/* ============ REFLEX DRIFT ============ */
GAMES.drift=function(api){
  const st=api.st, W=360,H=600; const cv=document.createElement('canvas'); cv.className='arccv'; st.appendChild(cv); const ctx=cv.getContext('2d'); let K=1;
  const fit=()=>{ const r=st.getBoundingClientRect(), s=Math.min(r.width/W,r.height/H)||1, dpr=Math.min(2,window.devicePixelRatio||1); cv.style.width=(W*s)+'px'; cv.style.height=(H*s)+'px'; cv.width=Math.round(W*s*dpr); cv.height=Math.round(H*s*dpr); K=s*dpr; }; fit(); const ro=window.ResizeObserver?new ResizeObserver(fit):null; if(ro) ro.observe(st);
  const LX=[90,180,270]; let lane=1, px=180, dist=0, pick=0, sp=260, obs=[], spawn=0, over=false, off=0, flash=0;
  const tap=e=>{ const r=cv.getBoundingClientRect(); const x=e.clientX-r.left; lane=Math.max(0,Math.min(2,lane+(x<r.width/2?-1:1))); arcTone(300+lane*60,.05,'square',.05); };
  st.addEventListener('pointerdown',tap);
  const kd=e=>{ if(e.code==='ArrowLeft') lane=Math.max(0,lane-1); if(e.code==='ArrowRight') lane=Math.min(2,lane+1); }; document.addEventListener('keydown',kd);
  const step=h=>{ if(over) return; sp=260+dist*.04; dist+=sp*h/10; off=(off+sp*h)%60; px+=(LX[lane]-px)*Math.min(1,h*14); spawn-=h; flash=Math.max(0,flash-h*3);
    if(spawn<=0){ spawn=Math.max(.32,.78-dist*.0004)*(.8+Math.random()*.5); const l=Math.floor(Math.random()*3), near=obs.filter(o=>o.y<130&&o.t!=='n').map(o=>o.l); if(!(near.length>=2&&!near.includes(l))){ const r=Math.random(); obs.push({l,y:-40,t:r<.14?'n':r<.5?'c':'k'}); } }
    obs.forEach(o=>o.y+=sp*h); obs=obs.filter(o=>o.y<H+50);
    for(const o of obs){ if(Math.abs(o.y-500)<34&&Math.abs(LX[o.l]-px)<34){ if(o.t==='n'){ pick++; o.y=9999; flash=1; arcTone(1200,.12,'triangle',.08); } else if(!o.done){ over=true; arcTone(110,.4,'sawtooth',.12); setTimeout(()=>api.end(dist+pick*50,`${Math.round(dist)} m · ${pick} éclair${pick>1?'s':''}`),500); } } }
    api.score(dist+pick*50,`${Math.round(dist)} m`); };
  const draw=()=>{ ctx.setTransform(K,0,0,K,0,0); ctx.fillStyle='#0b0b1c'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#161a30'; ctx.fillRect(30,0,300,H); ctx.fillStyle='#ffd400'; ctx.fillRect(28,0,4,H); ctx.fillRect(328,0,4,H);
    ctx.fillStyle='rgba(255,255,255,.5)'; for(let y=-60+off;y<H;y+=60){ [135,225].forEach(x=>ctx.fillRect(x-2,y,4,28)); }
    obs.forEach(o=>{ const x=LX[o.l], y=o.y; if(o.t==='k'){ ctx.fillStyle='#ff6a1a'; ctx.beginPath(); ctx.moveTo(x,y-20); ctx.lineTo(x+16,y+16); ctx.lineTo(x-16,y+16); ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(x-9,y+2,18,4); } else if(o.t==='c'){ ctx.fillStyle='#e0354b'; ctx.fillRect(x-20,y-32,40,64); ctx.fillStyle='#10131f'; ctx.fillRect(x-14,y-18,28,16); ctx.fillStyle='#fff'; ctx.fillRect(x-16,y+28,8,4); ctx.fillRect(x+8,y+28,8,4); } else { ctx.shadowColor='#00e5ff'; ctx.shadowBlur=16; ctx.fillStyle='#00e5ff'; ctx.beginPath(); ctx.arc(x,y,15,0,7); ctx.fill(); ctx.shadowBlur=0; ctx.fillStyle='#04202a'; ctx.font='900 20px system-ui'; ctx.textAlign='center'; ctx.fillText('⚡',x,y+7); } });
    ctx.save(); ctx.translate(px,500); ctx.rotate((LX[lane]-px)/120); ctx.fillStyle=flash>0?'#00e5ff':'#ffd400'; ctx.shadowColor='#ffd400'; ctx.shadowBlur=12; ctx.fillRect(-20,-32,40,64); ctx.shadowBlur=0; ctx.fillStyle='#10131f'; ctx.fillRect(-14,-16,28,16); ctx.fillStyle='#e0354b'; ctx.fillRect(-18,-34,10,4); ctx.fillRect(8,-34,10,4); ctx.restore(); };
  let raf=0,last=0; const loop=ts=>{ if(!last) last=ts; const h=Math.min(.033,(ts-last)/1000); last=ts; step(h); draw(); raf=requestAnimationFrame(loop); }; raf=requestAnimationFrame(loop);
  window.__drift={step,get over(){return over;},tap:l=>{lane=l;}};
  return ()=>{ cancelAnimationFrame(raf); if(ro) ro.disconnect(); st.removeEventListener('pointerdown',tap); document.removeEventListener('keydown',kd); window.__drift=null; };
};
/* ============ DRAG START ============ */
GAMES.drag=function(api){
  const st=api.st; st.innerHTML=`<div class="drg"><div class="tree"><i></i><i></i><i></i><i class="g"></i></div><div class="drg-msg" id="dm">Prépare-toi…</div><div class="gau"><div class="zone"></div><div class="nd" id="dn"></div></div><div class="drg-g" id="dg">Vitesse 1</div><button class="arcb big" id="dt">TAP</button></div>`;
  const L=[...st.querySelectorAll('.tree i')], msg=st.querySelector('#dm'), nd=st.querySelector('#dn'), dg=st.querySelector('#dg'), btn=st.querySelector('#dt');
  let ph='wait', tids=[], t0=0, react=0, gear=0, shifts=[], p=0, raf=0, ended=false, tsec=0;
  const later=(f,ms)=>tids.push(setTimeout(f,ms));
  later(()=>{ ph='amber'; L[0].classList.add('on'); arcTone(500,.1,'square'); },700); later(()=>{ L[1].classList.add('on'); arcTone(500,.1,'square'); },1200); later(()=>{ L[2].classList.add('on'); arcTone(500,.1,'square'); },1700);
  later(()=>{ ph='go'; L[3].classList.add('on'); t0=performance.now(); msg.textContent='VERT ! TAPE !'; arcTone(1000,.25,'triangle',.1); },1700+500+Math.random()*900);
  const done=(sc,note)=>{ if(ended) return; ended=true; setTimeout(()=>api.end(sc,note),700); };
  const hit=()=>{
    if(ph==='wait'||ph==='amber'){ ph='dead'; msg.textContent='FAUX DÉPART !'; arcTone(120,.4,'sawtooth',.1); return done(0,'Faux départ : tu as bougé avant le vert.'); }
    if(ph==='go'){ react=Math.round(performance.now()-t0); ph='shift'; gear=1; msg.textContent=`Réaction : ${react} ms`; dg.textContent='Vitesse 1 → tape dans le vert'; arcTone(300,.12,'sawtooth'); tsec=0; return; }
    if(ph==='shift'){ const q=Math.max(0,1-Math.abs(p-.8)/.3), pts=Math.round(q*200); shifts.push(pts); arcTone(400+gear*200,.1,'square',.08); dg.textContent=pts>150?'Parfait !':pts>80?'Bien':'Raté…'; gear++; tsec=0; if(shifts.length>=3){ ph='fin'; const sc=Math.max(0,Math.round(600-react*1.4))+shifts.reduce((a,b)=>a+b,0); msg.textContent=`${react} ms · passages ${shifts.join(' / ')}`; done(sc,`Réaction ${react} ms · passages ${shifts.join(' / ')}`); } }
  };
  btn.addEventListener('pointerdown',e=>{ e.preventDefault(); hit(); }); st.addEventListener('pointerdown',e=>{ if(e.target===btn) return; hit(); });
  const kd=e=>{ if(e.code==='Space') hit(); }; document.addEventListener('keydown',kd);
  let last=0; const loop=ts=>{ if(!last) last=ts; const h=(ts-last)/1000; last=ts; if(ph==='shift'){ tsec+=h; const sp=1.25+gear*.35; p=Math.abs(((tsec*sp)%2)-1); nd.style.left=(p*100)+'%'; if(tsec>2.8){ shifts.push(0); gear++; tsec=0; dg.textContent='Trop tard…'; if(shifts.length>=3){ ph='fin'; const sc=Math.max(0,Math.round(600-react*1.4))+shifts.reduce((a,b)=>a+b,0); done(sc,`Réaction ${react} ms · passages ${shifts.join(' / ')}`); } } } raf=requestAnimationFrame(loop); }; raf=requestAnimationFrame(loop);
  window.__drag={hit,get ph(){return ph;},set p(v){p=v;},get shifts(){return shifts;}};
  return ()=>{ tids.forEach(clearTimeout); cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); window.__drag=null; };
};
/* ============ PIT STOP ============ */
GAMES.pit=function(api){
  const st=api.st; st.innerHTML=`<div class="pit"><div class="pit-m" id="pm">Prépare-toi…</div><div class="pit-car"><div class="body"></div>${[0,1,2,3].map(i=>`<button class="whl w${i}" data-w="${i}" aria-label="Roue ${i+1}"><span></span></button>`).join('')}</div><div class="pit-i" id="pi">0 / 15</div></div>`;
  const W=[...st.querySelectorAll('.whl')], msg=st.querySelector('#pm'), inf=st.querySelector('#pi'); let n=0, cur=-1, score=0, combo=0, tid=0, t0=0, win=1200, ended=false, tids=[]; const TOT=15;
  const next=()=>{ if(n>=TOT){ if(!ended){ ended=true; setTimeout(()=>api.end(score,`${TOT} roues · meilleur combo ${bestC}`),400); } return; } let c; do{ c=Math.floor(Math.random()*4); }while(c===cur); cur=c; W.forEach((w,i)=>w.classList.toggle('on',i===c)); win=Math.max(550,1300-n*50); t0=performance.now(); tid=setTimeout(()=>miss(),win); msg.textContent=['Roue ','Vite : roue ','Allez : roue '][n%3]+(c+1); inf.textContent=`${n} / ${TOT} · combo ${combo}`; };
  let bestC=0; const miss=()=>{ combo=0; n++; W.forEach(w=>w.classList.remove('on')); msg.textContent='Raté !'; arcTone(140,.2,'sawtooth',.08); cur=-1; tids.push(setTimeout(next,260)); };
  const ok=()=>{ clearTimeout(tid); const el=performance.now()-t0, pts=Math.round((30+Math.max(0,1-el/win)*50)*(1+Math.min(.5,combo*.05))); score+=pts; combo++; bestC=Math.max(bestC,combo); n++; W.forEach(w=>w.classList.remove('on')); api.score(score,`combo ${combo}`); arcTone(700+combo*40,.08,'square',.07); msg.textContent=`+${pts}`; cur=-1; tids.push(setTimeout(next,220)); };
  W.forEach((w,i)=>w.addEventListener('pointerdown',e=>{ e.preventDefault(); if(cur<0||ended) return; if(i===cur) ok(); else { clearTimeout(tid); miss(); } }));
  tids.push(setTimeout(next,900)); window.__pit={get cur(){return cur;},hit:i=>{ if(cur<0) return; if(i===cur) ok(); else { clearTimeout(tid); miss(); } },get n(){return n;},get score(){return score;}};
  return ()=>{ clearTimeout(tid); tids.forEach(clearTimeout); ended=true; window.__pit=null; };
};
/* ============ POUSSE-NITRO ============ */
GAMES.nitro=function(api){
  const st=api.st; st.innerHTML=`<div class="nit"><div class="nit-m" id="nm">Manche 1 / 6</div><div class="nbar"><div class="nz" id="nz"></div><div class="nk" id="nk"></div></div><div class="nit-i" id="ni"></div><button class="arcb big" id="nt">STOP</button></div>`;
  const nz=st.querySelector('#nz'), nk=st.querySelector('#nk'), nm=st.querySelector('#nm'), ni=st.querySelector('#ni'), btn=st.querySelector('#nt'); const WD=[.26,.2,.15,.11,.08,.06]; let rd=0, score=0, streak=0, tsec=0, m=0, c=.5, active=true, raf=0, ended=false, tids=[];
  const setup=()=>{ c=.2+Math.random()*.6; nz.style.left=((c-WD[rd]/2)*100)+'%'; nz.style.width=(WD[rd]*100)+'%'; nm.textContent=`Manche ${rd+1} / 6`; tsec=Math.random()*2; active=true; };
  setup();
  const stop=()=>{ if(!active||ended) return; active=false; const d=Math.abs(m-c), half=WD[rd]/2; if(d<=half){ streak++; const pts=Math.round(100*(1-d/half*.6))+Math.min(50,streak*10); score+=pts; ni.textContent=`+${pts}${d<half*.2?' · PARFAIT':''}`; api.score(score,`série ${streak}`); arcTone(900+streak*80,.12,'triangle',.09); } else { streak=0; ni.textContent='Raté'; arcTone(140,.25,'sawtooth',.09); }
    rd++; if(rd>=6){ ended=true; tids.push(setTimeout(()=>api.end(score,'6 manches'),700)); } else tids.push(setTimeout(setup,700)); };
  btn.addEventListener('pointerdown',e=>{ e.preventDefault(); stop(); }); st.addEventListener('pointerdown',e=>{ if(e.target!==btn) stop(); }); const kd=e=>{ if(e.code==='Space') stop(); }; document.addEventListener('keydown',kd);
  let last=0; const loop=ts=>{ if(!last) last=ts; const h=(ts-last)/1000; last=ts; if(active){ tsec+=h; const sp=.9+rd*.38; m=Math.abs(((tsec*sp)%2)-1); nk.style.left=(m*100)+'%'; } raf=requestAnimationFrame(loop); }; raf=requestAnimationFrame(loop);
  window.__nit={stop,set m(v){m=v;},get c(){return c;},get rd(){return rd;},get score(){return score;},freeze:()=>{ tsec=1e9; }};
  return ()=>{ cancelAnimationFrame(raf); tids.forEach(clearTimeout); document.removeEventListener('keydown',kd); window.__nit=null; };
};
Object.assign(ACT,{ arc(d){ arcOpen(d.id); }, arcstart(){ arcStart(); }, arcquit(){ arcQuit(); } });
/* ============ COMPTOIR DE PRIX ============ */
const PRIZES=[
 {id:'nit',ic:'⚡',n:'Nitro ×2',d:'Deux charges de nitro',c:25,f:()=>{ S.nitro=(S.nitro||0)+2; }},
 {id:'cr1',ic:'💰',n:'500 crédits',d:'Un petit coup de pouce',c:30,f:()=>{ S.cr+=500; }},
 {id:'tok',ic:'🪙',n:'Jeton de paquet',d:'Un paquet de cartes à ouvrir',c:40,f:()=>{ S.tok=(S.tok||0)+1; }},
 {id:'cr2',ic:'💎',n:'3 000 crédits',d:'Beaucoup mieux qu’un porte-clés',c:150,f:()=>{ S.cr+=3000; }},
 {id:'tok5',ic:'🎴',n:'5 jetons de paquet',d:'Une pluie de cartes',c:170,f:()=>{ S.tok=(S.tok||0)+5; }},
 {id:'tro',ic:'🏆',n:'Trophée d’arcade',d:'Exemplaire unique, expose-le fièrement (+3 jetons)',c:300,once:1,f:()=>{ arcS().trophy=1; S.tok=(S.tok||0)+3; }}
];
function arcSheet(X){
  if(!sheet||sheet.t!=='arcprix') return false; const A=arcS();
  const lead=Object.keys(ARC).map(id=>{ const G=ARC[id], me=A.best[id]||0, all=ARCR[id].concat([['Toi',me]]).sort((a,b)=>b[1]-a[1]); const rank=all.findIndex(r=>r[0]==='Toi')+1; return `<div class="inv-r"><span class="inv-i">${G.ic}</span><div class="inv-t"><b>${G.n}</b><small>Record : ${fmt(me)} · rang #${rank}/6 · 1er : ${all[0][0]} (${fmt(all[0][1])})</small></div></div>`; }).join('');
  $('sheet').innerHTML=`<div class="inv">${X}<h2>🎟️ Comptoir de prix</h2><p class="note">Tu as <b>${fmt(A.tk)}</b> ticket${A.tk>1?'s':''}. Gagne-en en jouant aux bornes.</p>
   ${PRIZES.map(p=>{ const got=p.once&&A.trophy, can=A.tk>=p.c&&!got; return `<div class="inv-r ${can||got?'':'lock'}"><span class="inv-i">${p.ic}</span><div class="inv-t"><b>${p.n}</b><small>${got?'Déjà obtenu':p.d}</small></div><button class="btn sm" data-a="arcbuy" data-id="${p.id}" ${can?'':'disabled'}>${got?'✔':'🎟️ '+p.c}</button></div>`; }).join('')}
   <h3 class="rh">Classements</h3>${lead}</div>`; return true; }
ACT.arcbuy=d=>{ const p=PRIZES.find(x=>x.id===d.id), A=arcS(); if(!p||A.tk<p.c||(p.once&&A.trophy)) return; A.tk-=p.c; p.f(); save(); auTry(()=>ui('buy')); toast(`${p.ic} ${p.n} !`); renderSheet(); };
/* ============ MAP 3D : la salle d'arcade ============ */
WORLD.arcade={nom:'Salle d’arcade',ic:'🕹️',bx:36,bz:24,spawn:{x:0,z:19,yaw:0},lvl:2};
DEST.push({id:'arcade',ic:'🕹️',nom:'Salle d’arcade',d:'Pousse-nitro au début, puis pit stop, drag, drift et pinball au fil de tes niveaux. Gagne des tickets, échange-les au comptoir.',ok:()=>S.lvl>=3,why:'Niveau 3 requis'});
function buildArcade(W){
  const sc=W.sc, BX=W.bx, BZ=W.bz; sc.background=new THREE.Color(0x07040f); sc.fog=new THREE.Fog(0x07040f,34,120);
  sc.add(new THREE.HemisphereLight(0xa89aff,0x24103a,1.35)); const dl=new THREE.DirectionalLight(0xff9af0,.35); dl.position.set(0,30,10); sc.add(dl);
  const carp=ctex(256,256,(x,Wd,H)=>{ x.fillStyle='#120a24'; x.fillRect(0,0,Wd,H); const cols=['#ff2bd6','#00e5ff','#ffd400','#3cff9e']; for(let i=0;i<46;i++){ x.fillStyle=cols[i%4]+'66'; const s=3+Math.random()*7; x.fillRect(Math.random()*Wd,Math.random()*H,s,s); } x.strokeStyle='rgba(0,229,255,.28)'; x.lineWidth=3; x.strokeRect(2,2,Wd-4,H-4); },[BX/6,BZ/6]);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(BX*2+4,BZ*2+4),new THREE.MeshLambertMaterial({map:carp})); fl.rotation.x=-Math.PI/2; sc.add(fl);
  const wm=wLamb(0x1a1030), HH=10; W.box(BX*2+1,HH,.6,0,HH/2,-BZ-.3,wm); W.box(BX*2+1,HH,.6,0,HH/2,BZ+.3,wm); W.box(.6,HH,BZ*2,-BX-.3,HH/2,0,wm); W.box(.6,HH,BZ*2,BX+.3,HH/2,0,wm);
  const ce=new THREE.Mesh(new THREE.PlaneGeometry(BX*2,BZ*2),new THREE.MeshBasicMaterial({color:0x05030a,side:THREE.DoubleSide})); ce.rotation.x=Math.PI/2; ce.position.y=HH; sc.add(ce);
  const cols=[0xff2bd6,0x00e5ff,0xffd400,0x3cff9e]; for(let i=-3;i<=3;i++){ W.box(BX*2,.18,.25,0,HH-.2,i*7,wNeon(cols[(i+3)%4])); }
  [[BX*2,.14,.1,0,3,-BZ+.1,0xff2bd6],[BX*2,.14,.1,0,5.6,-BZ+.1,0x00e5ff],[.1,.14,BZ*2,-BX+.1,3,0,0xffd400],[.1,.14,BZ*2,BX-.1,3,0,0x3cff9e],[BX*2,.14,.1,0,3,BZ-.1,0x3cff9e]].forEach(a=>W.box(a[0],a[1],a[2],a[3],a[4],a[5],wNeon(a[6])));
  const sign=hubLabel('🕹️ ARCADE · HIGH & ROUILLÉ','#FFD400',16,0,-BZ+.6); sign.position.set(0,8,-BZ+.7); sc.add(sign);
  const glows=[]; const scr=(ic,col)=>ctex(128,96,(x,Wd,H)=>{ const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#16082e'); g.addColorStop(1,col); x.fillStyle=g; x.fillRect(0,0,Wd,H); x.font='54px serif'; x.textAlign='center'; x.fillText(ic,Wd/2,66); x.fillStyle='rgba(255,255,255,.12)'; for(let y=0;y<H;y+=4) x.fillRect(0,y,Wd,1); });
  const hex=c=>'#'+c.toString(16).padStart(6,'0');
  const cab=(gid,x,z)=>{ const G=ARC[gid], col=G.col, wide=gid==='pin';
    if(wide){ W.box(3,1.5,4.6,x,1.1,z,wLamb(0x241446)); const gl=W.box(2.8,.1,4.4,x,1.95,z+.1,new THREE.MeshBasicMaterial({color:0x3a1a6a,transparent:true,opacity:.8})); gl.rotation.x=-.16; W.box(3,3.4,.5,x,2.9,z-2.2,wLamb(0x241446)); const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.8),new THREE.MeshBasicMaterial({map:scr(G.ic,hex(col))})); m.position.set(x,3.5,z-1.94); sc.add(m); W.box(3.1,.15,4.7,x,.45,z,wNeon(col)); W.obs.push({x0:x-1.7,x1:x+1.7,z0:z-2.6,z1:z+2.6}); }
    else { W.box(2.6,4.4,2.2,x,2.2,z,wLamb(0x1c1430)); W.box(2.7,.14,2.3,x,1.1,z,wNeon(col)); W.box(2.7,.14,2.3,x,3.7,z,wNeon(col)); const m=new THREE.Mesh(new THREE.PlaneGeometry(2.1,1.6),new THREE.MeshBasicMaterial({map:scr(G.ic,hex(col))})); m.position.set(x,2.8,z+1.12); sc.add(m); W.box(2.3,.35,1,x,1.75,z+1.3,wLamb(0x2a1a4a)); const js=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.4,6),wLamb(0xdddddd)); js.position.set(x-.5,2.05,z+1.35); sc.add(js); [[.1,0xff2d2d],[.4,0xffd400],[.7,0x1fe06a]].forEach(b=>{ const bt=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.08,8),wNeon(b[1])); bt.position.set(x+b[0],1.97,z+1.35); sc.add(bt); }); W.obs.push({x0:x-1.5,x1:x+1.5,z0:z-1.3,z1:z+2}); }
    const lb=hubLabel(G.ic+' '+G.n.split(' ')[0].toUpperCase(),hex(col),6,x,z); lb.position.set(x,5.6,z); sc.add(lb); const gw=wGlow(col,9); gw.position.set(x,3,z+(wide?2.6:2)); sc.add(gw); glows.push(gw);
    W.poi('arc_'+gid,x,z+(wide?4.2:3.4),3.3,()=>S.lvl<ARC_LV[gid]?`🔒 ${G.n} · niveau ${ARC_LV[gid]} requis`:`${G.ic} ${G.n} · record ${fmt(arcS().best[gid]||0)}`,()=>S.lvl<ARC_LV[gid]?[]:[{id:'arc_'+gid,tx:`▶ Jouer · ${G.cost} cr`}]); };
  cab('pin',-24,-18); cab('drift',-11,-19); cab('drag',1,-19); cab('pit',13,-19); cab('nitro',25,-19);
  /* bornes décor */
  [[-30,6],[-30,-2],[30,12]].forEach((p,i)=>{ W.box(2.4,4,2,p[0],2,p[1],wLamb(0x1a1230)); W.box(2.5,.12,2.1,p[0],3.4,p[1],wNeon(cols[i%4])); const m=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.4),new THREE.MeshBasicMaterial({map:scr(['👾','🎱','🚀'][i],'#2a0a4a')})); m.position.set(p[0]+(p[0]<0?1.02:-1.02),2.6,p[1]); m.rotation.y=p[0]<0?Math.PI/2:-Math.PI/2; sc.add(m); W.obs.push({x0:p[0]-1.4,x1:p[0]+1.4,z0:p[1]-1.3,z1:p[1]+1.3}); });
  /* comptoir de prix */
  const px=BX-4; W.box(3,1.3,10,px,.65,0,wLamb(0x3a2a14)); W.box(3.2,.12,10.2,px,1.35,0,wNeon(0xffd400)); [-3.6,-1.2,1.2,3.6].forEach((z,i)=>{ W.box(.9,.9,.9,px+1.2,2.2,z,wLamb([0xff2bd6,0x00e5ff,0x3cff9e,0xff9a1a][i])); const bl=new THREE.Mesh(new THREE.SphereGeometry(.55,10,8),wLamb(0xffd400)); bl.position.set(px+1.2,3.2,z); sc.add(bl); }); W.box(.4,5,10,px+1.9,2.5,0,wLamb(0x2a1a4a));
  const cl=hubLabel('🎟️ PRIX','#FFD400',9,px,0); cl.position.set(px,6.2,0); sc.add(cl); W.obs.push({x0:px-1.7,x1:px+1.7,z0:-5.2,z1:5.2});
  W.poi('arc_prix',px-4,0,4.2,()=>`🎟️ Comptoir de prix · ${fmt(arcS().tk)} tickets`,()=>[{id:'arc_prix',tx:'Échanger mes tickets'}]);
  /* porte */
  W.box(6,6,.3,0,3,BZ-.1,wNeon(0x3cff9e)); const gl2=hubLabel('↩ RUE NÉON','#3CFF9E',7,0,BZ); gl2.position.set(0,7.2,BZ-.4); sc.add(gl2); W.poi('agate',0,BZ-3.2,3.8,()=>'Sortie',()=>[{id:'agate',tx:'↩ Retour à la rue'}]);
  W.anim=(dt,t)=>{ glows.forEach((g,i)=>{ g.material.opacity=.6+.4*Math.sin(t*3+i*1.3); }); };
}
WBUILD.arcade=buildArcade;
/* porte de l'arcade dans la rue néon */
const _bStreet=WBUILD.street;
WBUILD.street=function(W){ _bStreet(W); const sc=W.sc, x=-18, z=-12.5; W.box(5,4.2,3,x,2.1,z,wLamb(0x1a1230)); W.box(5.4,.3,3.4,x,4.3,z,wNeon(0xff2bd6)); W.box(3.4,3,.1,x,1.5,z+1.55,wNeon(0x2a0a5a)); const l=hubLabel('🕹️ ARCADE','#FF2BD6',8,x,z); l.position.set(x,6.2,z); sc.add(l); const g=wGlow(0xff2bd6,14); g.position.set(x,3,z+2); sc.add(g); W.obs.push({x0:x-2.7,x1:x+2.7,z0:z-1.7,z1:z+1.7});
  W.poi('arcade',x,z+3.6,3.6,()=>'🕹️ Salle d’arcade',()=>[{id:'arcade',tx:'Entrer dans la salle d’arcade'}]); };
const _wgo22=ACT.wgo;
ACT.wgo=function(d){ const id=d.id; if(id==='arcade'){ musicStop(); return growEnter('arcade'); } if(id==='agate'){ return growEnter('street'); } if(id==='arc_prix'){ return openSheet({t:'arcprix'}); } if(id&&id.startsWith('arc_')){ return arcOpen(id.slice(4)); } return _wgo22.apply(this,arguments); };
