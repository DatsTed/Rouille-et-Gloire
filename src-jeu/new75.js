/* ===== v2.15 · 2/4 : la salle d'arcade terminée =====
   Les 5 bornes « décor » (INVADERS, CHALLENGE, COSMO, FIGHT, TIR) deviennent jouables :
   👾 Néon Invaders (tir vertical), 🚀 Cosmo Nitro (voiture-fusée entre des portiques), 🎯 Tir aux Jantes (stand de tir 40 s),
   🥊 Choc des Pare-chocs (boxe de réflexes, 3 adversaires), 🎱 Défi du jour (une borne + un score à battre chaque jour, tickets en bonus).
   Cadre commun : décompte 3-2-1, fond néon, mêmes règles de tickets / record / classement que les bornes existantes. Comptoir de prix enrichi. */

/* ---------- cadre commun des jeux sur canevas ---------- */
function arcCv(api,o){ const st=api.st, W=360, H=600, cv=document.createElement('canvas'); cv.className='arccv'; st.appendChild(cv); const ctx=cv.getContext('2d'); let K=1;
  const fit=()=>{ const r=st.getBoundingClientRect(), s=Math.min(r.width/W,r.height/H)||1, dpr=Math.min(2,window.devicePixelRatio||1); cv.style.width=(W*s)+'px'; cv.style.height=(H*s)+'px'; cv.width=Math.round(W*s*dpr); cv.height=Math.round(H*s*dpr); K=s*dpr; };
  fit(); const ro=window.ResizeObserver?new ResizeObserver(fit):null; if(ro) ro.observe(st);
  const G={cv,ctx,W,H,t:0,cd:o.count===false?0:2.6,over:false,shake:0,fx:[],
    pt:e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]; },
    burst:(x,y,c,n)=>{ for(let i=0;i<(n||12);i++){ const a=Math.random()*6.283, v=60+Math.random()*200; G.fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.4+Math.random()*.4,c}); } },
    pop:(x,y,s,c)=>G.fx.push({x,y,vx:0,vy:-40,l:.9,c:c||'#fff',s}) };
  let raf=0, last=0;
  G.tick=h=>{ G.t+=h; if(G.cd>0){ const p=Math.ceil(G.cd); G.cd-=h; if(G.cd>0&&Math.ceil(G.cd)!==p) arcTone(520,.08,'square',.06); if(G.cd<=0) arcTone(1040,.18,'triangle',.08); } else if(!G.over) o.step(h,G);
    G.shake=Math.max(0,G.shake-h*3); for(const p of G.fx){ p.x+=p.vx*h; p.y+=p.vy*h; if(!p.s) p.vy+=260*h; p.l-=h; } G.fx=G.fx.filter(p=>p.l>0); };
  G.paint=()=>{ ctx.setTransform(K,0,0,K,0,0); if(G.shake>0) ctx.translate((Math.random()-.5)*G.shake*8,(Math.random()-.5)*G.shake*8); o.draw(ctx,G);
    for(const p of G.fx){ ctx.globalAlpha=Math.max(0,Math.min(1,p.l*2)); if(p.s){ arcTxt(ctx,p.s,p.x,p.y,15,p.c,'center',800); } else { ctx.fillStyle=p.c; ctx.fillRect(p.x-2,p.y-2,4,4); } } ctx.globalAlpha=1;
    if(G.cd>0) arcCount(ctx,G); };
  const loop=ts=>{ if(!last) last=ts; const h=Math.min(.033,(ts-last)/1000); last=ts; G.tick(h); G.paint(); raf=requestAnimationFrame(loop); };
  raf=requestAnimationFrame(loop);
  G.stop=()=>{ cancelAnimationFrame(raf); if(ro) ro.disconnect(); };
  G.end=(score,note)=>{ if(G.over) return; G.over=true; setTimeout(()=>api.end(score,note),700); };
  return G; }
function arcTxt(ctx,s,x,y,px,col,al,wg){ ctx.font=`${wg||800} ${px}px "Chakra Petch",system-ui,sans-serif`; ctx.textAlign=al||'center'; ctx.textBaseline='middle'; ctx.fillStyle=col||'#fff'; ctx.fillText(s,x,y); ctx.textBaseline='alphabetic'; }
function arcCount(ctx,G){ const n=Math.ceil(G.cd), f=G.cd-Math.floor(G.cd); ctx.fillStyle='rgba(5,3,14,.55)'; ctx.fillRect(0,0,G.W,G.H); ctx.save(); ctx.translate(G.W/2,G.H/2); const z=1+.35*f; ctx.scale(z,z); ctx.shadowColor='#00e5ff'; ctx.shadowBlur=24; arcTxt(ctx,n>0?String(n):'GO !',0,0,86,n>1?'#00e5ff':'#ffd400','center',900); ctx.restore(); ctx.shadowBlur=0; }
/* fond commun : dégradé nuit, grille néon en perspective qui défile, lignes de balayage */
function arcBg(ctx,G,c1,c2,spd){ const W=G.W, H=G.H, g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#07041a'); g.addColorStop(.62,c1||'#120a32'); g.addColorStop(1,'#04020c'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const hz=H*.62, off=((G.t*(spd==null?40:spd))%40)/40; ctx.strokeStyle=c2||'rgba(255,43,214,.35)'; ctx.lineWidth=1;
  for(let i=0;i<9;i++){ const u=(i+off)/9, y=hz+(H-hz)*u*u; ctx.globalAlpha=.25+.6*u; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  for(let i=-6;i<=6;i++){ ctx.globalAlpha=.35; ctx.beginPath(); ctx.moveTo(W/2+i*14,hz); ctx.lineTo(W/2+i*95,H); ctx.stroke(); } ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,255,255,.025)'; for(let y=0;y<H;y+=3) ctx.fillRect(0,y,W,1); }
function arcHud(ctx,G,left,right,col){ ctx.fillStyle='rgba(4,3,14,.6)'; ctx.fillRect(0,0,G.W,30); ctx.fillStyle=col||'#00e5ff'; ctx.fillRect(0,30,G.W,2); arcTxt(ctx,left,10,16,13,'#fff','left',700); arcTxt(ctx,right,G.W-10,16,13,col||'#00e5ff','right',800); }

/* ---------- 👾 NÉON INVADERS ---------- */
const INV_SPR=[['00111100','01111110','11011011','11111111','00100100','01011010'],['00111100','01111110','11011011','11111111','01000010','10000001'],['10000001','01011010','11111111','11011011','01111110','00100100']];
GAMES.inv=function(api){
  let px=180, tx=180, fire=.4, tri=0, lives=3, wave=0, score=0, kills=0, inv=0, dir=1, spd=26, B=[], EB=[], EN=[], DR=[];
  const COLS=['#3cff9e','#00e5ff','#ff2bd6','#ffd400','#ff9a1a'];
  const spawn=()=>{ wave++; EN=[]; const rows=Math.min(5,2+Math.ceil(wave/2)), cols=6; for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) EN.push({x:58+c*48,y:70+r*38,r,hp:(r===0&&wave>2)?2:1,a:1}); dir=1; spd=24+wave*8; if(wave>1){ G.pop(180,300,'VAGUE '+wave,'#ffd400'); arcTone(660,.2,'triangle',.08); } };
  const end=()=>G.end(score,`Vague ${wave} · ${kills} drone${kills>1?'s':''} détruit${kills>1?'s':''}`);
  const G=arcCv(api,{
    step(h){ px+=(tx-px)*Math.min(1,h*14); fire-=h; tri=Math.max(0,tri-h); inv=Math.max(0,inv-h);
      if(fire<=0){ fire=.28; B.push({x:px,y:516,vx:0}); if(tri>0) B.push({x:px-8,y:520,vx:-110},{x:px+8,y:520,vx:110}); arcTone(900,.03,'square',.025); }
      for(const b of B){ b.y-=540*h; b.x+=b.vx*h; } B=B.filter(b=>b.y>-10&&b.x>-10&&b.x<370);
      const al=EN.filter(e=>e.a); let mn=999, mx=-999, my=0; for(const e of al){ mn=Math.min(mn,e.x); mx=Math.max(mx,e.x); my=Math.max(my,e.y); }
      const st=dir*spd*h; if((dir>0&&mx+st>338)||(dir<0&&mn+st<22)){ dir*=-1; for(const e of al) e.y+=15; } else for(const e of al) e.x+=st;
      if(al.length&&Math.random()<h*(.55+wave*.22)){ const s=al[Math.floor(Math.random()*al.length)]; EB.push({x:s.x,y:s.y+12}); }
      for(const b of EB) b.y+=(190+wave*12)*h; EB=EB.filter(b=>b.y<620);
      for(const b of B) for(const e of al){ if(e.a&&Math.abs(b.x-e.x)<17&&Math.abs(b.y-e.y)<14){ b.y=-99; e.hp--; if(e.hp<=0){ e.a=0; kills++; const pts=10+(4-Math.min(4,e.r))*5; score+=pts; G.burst(e.x,e.y,COLS[e.r%5],10); arcTone(300+Math.random()*200,.05,'square',.04); if(Math.random()<.08) DR.push({x:e.x,y:e.y,k:Math.random()<.65?'p':'l'}); } else arcTone(500,.03,'square',.03); break; } }
      for(const d of DR) d.y+=110*h; for(const d of DR){ if(d.y>500&&d.y<545&&Math.abs(d.x-px)<26){ d.y=999; if(d.k==='p'){ tri=7; G.pop(px,470,'TIR TRIPLE','#ffd400'); } else { lives=Math.min(5,lives+1); G.pop(px,470,'+1 ♥','#3cff9e'); } arcTone(1200,.12,'triangle',.08); } } DR=DR.filter(d=>d.y<620);
      if(inv<=0) for(const b of EB){ if(Math.abs(b.x-px)<18&&Math.abs(b.y-528)<16){ b.y=999; lives--; inv=1.3; G.shake=1; G.burst(px,528,'#ff4d4d',18); arcTone(120,.3,'sawtooth',.1); if(lives<=0) return end(); break; } }
      if(my>488){ lives=0; G.shake=1; return end(); }
      if(!EN.some(e=>e.a)){ score+=100*wave; spawn(); }
      api.score(score,`vague ${wave} · ♥ ${lives}`); },
    draw(ctx,G){ arcBg(ctx,G,'#0a1a24','rgba(60,255,158,.32)',30);
      const fr=Math.floor(G.t*3)%2; for(const e of EN){ if(!e.a) continue; const sp=INV_SPR[e.r===0?2:fr], c=COLS[e.r%5]; ctx.fillStyle=c; ctx.shadowColor=c; ctx.shadowBlur=8; for(let y=0;y<6;y++) for(let x=0;x<8;x++) if(sp[y][x]==='1') ctx.fillRect(e.x-12+x*3,e.y-9+y*3,3,3); if(e.hp>1){ ctx.fillStyle='#fff'; ctx.fillRect(e.x-6,e.y+11,12,2); } } ctx.shadowBlur=0;
      ctx.fillStyle='#ffd400'; for(const b of B) ctx.fillRect(b.x-1.5,b.y-7,3,12); ctx.fillStyle='#ff4d6d'; for(const b of EB){ ctx.beginPath(); ctx.arc(b.x,b.y,3.5,0,7); ctx.fill(); }
      for(const d of DR) arcTxt(ctx,d.k==='p'?'⚡':'🔧',d.x,d.y,20);
      if(inv<=0||Math.floor(G.t*12)%2){ ctx.save(); ctx.translate(px,528); ctx.shadowColor=tri>0?'#ffd400':'#3cff9e'; ctx.shadowBlur=14; ctx.fillStyle='#1fe06a'; ctx.fillRect(-16,-6,32,16); ctx.fillStyle='#0b1c14'; ctx.fillRect(-10,-12,14,8); ctx.fillStyle='#ffd400'; ctx.fillRect(4,-16,4,10); ctx.fillStyle='#111'; ctx.fillRect(-14,9,8,5); ctx.fillRect(6,9,8,5); ctx.restore(); ctx.shadowBlur=0; }
      ctx.fillStyle='rgba(60,255,158,.5)'; ctx.fillRect(0,550,360,2);
      arcHud(ctx,G,'VAGUE '+Math.max(1,wave)+'  '+'♥'.repeat(Math.max(0,lives)),String(score),'#3cff9e'); } });
  spawn();
  const st=api.st, mv=e=>{ const p=G.pt(e); tx=Math.max(24,Math.min(336,p[0])); }, mm=e=>{ if(e.buttons||e.pointerType==='touch') mv(e); };
  st.addEventListener('pointerdown',mv); st.addEventListener('pointermove',mm);
  const kd=e=>{ if(e.code==='ArrowLeft') tx=Math.max(24,tx-40); if(e.code==='ArrowRight') tx=Math.min(336,tx+40); }; document.addEventListener('keydown',kd);
  window.__inv={G,get score(){return score;},get wave(){return wave;},get lives(){return lives;},kill:()=>{ EN.forEach(e=>e.a=0); },hurt:()=>{ inv=0; EB.push({x:px,y:528}); },aim:x=>{ tx=x; }};
  return ()=>{ G.stop(); st.removeEventListener('pointerdown',mv); st.removeEventListener('pointermove',mm); document.removeEventListener('keydown',kd); window.__inv=null; };
};

/* ---------- 🚀 COSMO NITRO ---------- */
GAMES.cosmo=function(api){
  let y=300, vy=0, gates=[], spawnT=.6, passed=0, coins=0, score=0, flame=0;
  const X=96, end=()=>{ G.shake=1; G.burst(X,y,'#ff9a1a',26); arcTone(110,.4,'sawtooth',.11); G.end(score,`${passed} portique${passed>1?'s':''} · ${coins} éclair${coins>1?'s':''}`); };
  const G=arcCv(api,{
    step(h){ const sp=150+Math.min(130,passed*4); vy+=820*h; y+=vy*h; flame=Math.max(0,flame-h*4);
      spawnT-=h; if(spawnT<=0){ spawnT=Math.max(1.05,1.6-passed*.02); const gap=Math.max(118,172-passed*2.2), cy=150+Math.random()*300; gates.push({x:380,cy,gap,p:0,c:Math.random()<.55}); }
      for(const g of gates){ g.x-=sp*h; if(!g.p&&g.x+20<X){ g.p=1; passed++; score+=10; arcTone(700+passed%8*60,.06,'triangle',.06); }
        if(g.c&&Math.abs(g.x-X)<16&&Math.abs(g.cy-y)<20){ g.c=false; coins++; score+=5; G.pop(X,y-24,'+5','#ffd400'); arcTone(1300,.08,'triangle',.07); }
        if(Math.abs(g.x-X)<20+12&&(y-12<g.cy-g.gap/2||y+12>g.cy+g.gap/2)) return end(); }
      gates=gates.filter(g=>g.x>-60); if(y<10||y>590) return end(); api.score(score,`${passed} portiques`); },
    draw(ctx,G){ arcBg(ctx,G,'#081a2e','rgba(0,229,255,.3)',60);
      for(let i=0;i<30;i++){ const sx=(i*97-G.t*(20+i%5*12))%380, xx=sx<0?sx+380:sx; ctx.fillStyle='rgba(255,255,255,'+(.2+i%4*.15)+')'; ctx.fillRect(xx,(i*53)%560+20,2,2); }
      for(const g of gates){ const top=g.cy-g.gap/2, bot=g.cy+g.gap/2; ctx.shadowColor='#00e5ff'; ctx.shadowBlur=14; ctx.fillStyle='#0d3550'; ctx.fillRect(g.x-20,0,40,top); ctx.fillRect(g.x-20,bot,40,600-bot); ctx.fillStyle='#00e5ff'; ctx.fillRect(g.x-22,top-6,44,6); ctx.fillRect(g.x-22,bot,44,6); ctx.shadowBlur=0; if(g.c) arcTxt(ctx,'⚡',g.x,g.cy,22); }
      ctx.save(); ctx.translate(X,y); ctx.rotate(Math.max(-.6,Math.min(.8,vy/600))); const fl=8+flame*18+Math.random()*4; ctx.fillStyle='#ff9a1a'; ctx.beginPath(); ctx.moveTo(-16,-5); ctx.lineTo(-16-fl,0); ctx.lineTo(-16,5); ctx.fill(); ctx.shadowColor='#ff2bd6'; ctx.shadowBlur=12; ctx.fillStyle='#ff2bd6'; ctx.fillRect(-16,-8,32,16); ctx.fillStyle='#14082a'; ctx.fillRect(-2,-6,12,8); ctx.fillStyle='#fff'; ctx.fillRect(14,-3,4,6); ctx.restore(); ctx.shadowBlur=0;
      arcHud(ctx,G,'🚀 COSMO NITRO',String(score),'#00e5ff'); if(G.t<4.2&&G.cd<=0) arcTxt(ctx,'Touche pour la nitro',180,560,13,'rgba(255,255,255,.7)'); } });
  const st=api.st, tap=e=>{ if(G.cd>0||G.over) return; vy=-310; flame=1; arcTone(260,.06,'sawtooth',.04); }; st.addEventListener('pointerdown',tap);
  const kd=e=>{ if(e.code==='Space'||e.code==='ArrowUp') tap(); }; document.addEventListener('keydown',kd);
  window.__cosmo={G,tap,get y(){return y;},get passed(){return passed;},get gates(){return gates;},get score(){return score;}};
  return ()=>{ G.stop(); st.removeEventListener('pointerdown',tap); document.removeEventListener('keydown',kd); window.__cosmo=null; };
};

/* ---------- 🎯 TIR AUX JANTES ---------- */
GAMES.tir=function(api){
  const ROWS=[170,300,430]; let T=40, tg=[], spawn=.2, score=0, combo=0, cmax=0, hits=0, misses=0;
  const mk=()=>{ const row=Math.floor(Math.random()*3), dirn=row%2?-1:1, r=Math.random(), k=r<.13?'g':r<.28?'b':'n', base=70+Math.random()*70+(40-T)*2.2; tg.push({x:dirn>0?-30:390,y:ROWS[row],v:dirn*base*(k==='g'?1.6:1),k,r:k==='g'?15:22,a:Math.random()*6}); };
  const end=()=>G.end(score,`${hits} jante${hits>1?'s':''} · combo max ×${cmax}`);
  const G=arcCv(api,{
    step(h){ T-=h; if(T<=0){ T=0; return end(); } spawn-=h; if(spawn<=0){ spawn=Math.max(.32,.75-(40-T)*.01); mk(); }
      for(const o of tg){ o.x+=o.v*h; o.a+=h*o.v/30; } tg=tg.filter(o=>o.x>-50&&o.x<410); api.score(score,`${Math.ceil(T)} s · combo ×${combo}`); },
    draw(ctx,G){ arcBg(ctx,G,'#24081c','rgba(255,43,214,.3)',0);
      ROWS.forEach(y=>{ ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(0,y+28,360,6); ctx.fillStyle='#ff2bd6'; ctx.fillRect(0,y+34,360,2); });
      for(const o of tg){ ctx.save(); ctx.translate(o.x,o.y); ctx.rotate(o.a); const c=o.k==='g'?'#ffd400':o.k==='b'?'#8a4a24':'#dfe6ff'; ctx.shadowColor=o.k==='b'?'#000':c; ctx.shadowBlur=o.k==='b'?0:12;
        ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(0,0,o.r,0,7); ctx.fill(); ctx.fillStyle=c; ctx.beginPath(); ctx.arc(0,0,o.r*.68,0,7); ctx.fill(); ctx.shadowBlur=0; ctx.fillStyle='#111'; for(let k=0;k<5;k++){ ctx.save(); ctx.rotate(k*1.2566); ctx.fillRect(-2,-o.r*.6,4,o.r*.45); ctx.restore(); } ctx.beginPath(); ctx.arc(0,0,o.r*.18,0,7); ctx.fill(); if(o.k==='b'){ ctx.fillStyle='rgba(180,90,30,.8)'; ctx.fillRect(-o.r*.5,-3,o.r,6); } ctx.restore(); }
      arcHud(ctx,G,'⏱ '+Math.ceil(T)+' s   combo ×'+combo,String(score),'#ff2bd6'); ctx.fillStyle='#ff2bd6'; ctx.fillRect(0,32,360*T/40,3); } });
  const shoot=(x,y)=>{ if(G.cd>0||G.over) return; let best=null, bd=1e9; for(const o of tg){ const d=Math.hypot(o.x-x,o.y-y); if(d<o.r+8&&d<bd){ bd=d; best=o; } }
    if(!best){ combo=0; misses++; arcTone(160,.06,'sawtooth',.04); G.fx.push({x,y,vx:0,vy:0,l:.25,c:'rgba(255,255,255,.6)'}); return; }
    tg.splice(tg.indexOf(best),1); if(best.k==='b'){ T=Math.max(0,T-3); combo=0; G.shake=.8; G.pop(best.x,best.y,'−3 s','#ff4d4d'); arcTone(110,.25,'sawtooth',.09); return; }
    combo=Math.min(10,combo+1); cmax=Math.max(cmax,combo); hits++; const pts=Math.round((best.k==='g'?50:10)*(1+combo*.1)); score+=pts; G.burst(best.x,best.y,best.k==='g'?'#ffd400':'#dfe6ff',best.k==='g'?20:10); G.pop(best.x,best.y-26,'+'+pts,best.k==='g'?'#ffd400':'#fff'); arcTone(best.k==='g'?1300:820+combo*40,.07,'square',.06); };
  const st=api.st, pd=e=>{ const p=G.pt(e); shoot(p[0],p[1]); }; st.addEventListener('pointerdown',pd);
  window.__tir={G,shoot,get tg(){return tg;},get score(){return score;},get T(){return T;},set T(v){T=v;}};
  return ()=>{ G.stop(); st.removeEventListener('pointerdown',pd); window.__tir=null; };
};

/* ---------- 🥊 CHOC DES PARE-CHOCS ---------- */
const FIGHT_OPP=[{n:'Rouillor',hp:100,s:1,c:'#ff9a1a'},{n:'Jante Folle',hp:130,s:1.25,c:'#00e5ff'},{n:'Le Carter',hp:170,s:1.55,c:'#ff2bd6'}];
GAMES.fight=function(api){
  let oi=0, ohp=FIGHT_OPP[0].hp, php=100, ph='idle', pt=1, side=0, feint=false, dodged=0, score=0, dealt=0, msg='', msgT=0, ko=0, hitT=0, phitT=0;
  const O=()=>FIGHT_OPP[oi], say=(m)=>{ msg=m; msgT=1; };
  const idle=()=>{ ph='idle'; pt=(.7+Math.random()*.8)/O().s; };
  const end=(win)=>G.end(score,win?`Les 3 boxeurs K.-O. ! ${dealt} dégâts`:`${ko} K.-O. · ${dealt} dégâts infligés`);
  const G=arcCv(api,{
    step(h){ pt-=h; msgT=Math.max(0,msgT-h); hitT=Math.max(0,hitT-h*3); phitT=Math.max(0,phitT-h*3);
      if(ph==='idle'&&pt<=0){ ph='wind'; side=Math.random()<.5?-1:1; feint=oi>0&&Math.random()<.18+oi*.08; dodged=0; pt=(.95+Math.random()*.35)/O().s; arcTone(420,.08,'square',.05); }
      else if(ph==='wind'){ if(feint&&pt<.42/O().s){ feint=false; side=-side; dodged=0; arcTone(380,.06,'square',.05); } if(pt<=0){ if(dodged===-side){ ph='counter'; pt=.95; say('CONTRE !'); arcTone(1100,.14,'triangle',.08); } else { php-=16+oi*4; phitT=1; G.shake=1; say('AÏE !'); arcTone(110,.3,'sawtooth',.11); if(php<=0){ php=0; return end(false); } idle(); } } }
      else if(ph==='counter'&&pt<=0) idle();
      else if(ph==='ko'&&pt<=0){ oi++; if(oi>=FIGHT_OPP.length){ score+=1000; return end(true); } ohp=O().hp; php=Math.min(100,php+30); say(O().n.toUpperCase()); idle(); pt=1.2; }
      api.score(score,`${O().n} · ♥ ${Math.max(0,php)}`); },
    draw(ctx,G){ arcBg(ctx,G,'#2a1208','rgba(255,154,26,.3)',0); const o=O(), cx=180;
      ctx.strokeStyle='#ff2bd6'; ctx.lineWidth=3; [120,150,180].forEach(y=>{ ctx.beginPath(); ctx.moveTo(0,y+40); ctx.lineTo(360,y+40); ctx.stroke(); });
      const bob=Math.sin(G.t*4)*4, wx=ph==='wind'?side*-(1-Math.max(0,pt)*O().s)*30:0, sh=hitT*8*(Math.random()-.5);
      ctx.save(); ctx.translate(cx+sh,285+bob); ctx.shadowColor=o.c; ctx.shadowBlur=18; ctx.fillStyle='#1a1430'; ctx.fillRect(-70,-60,140,110); ctx.shadowBlur=0; ctx.fillStyle=o.c; ctx.fillRect(-70,-60,140,8); ctx.fillStyle='#0b0b14'; ctx.fillRect(-52,-34,104,40); ctx.fillStyle=hitT>0?'#fff':'#ffd400'; ctx.fillRect(-46,-26,24,10); ctx.fillRect(22,-26,24,10);
      ctx.fillStyle='#888'; for(let k=-40;k<=40;k+=10) ctx.fillRect(k-2,14,4,22); ctx.fillStyle='#333'; ctx.fillRect(-70,50,26,14); ctx.fillRect(44,50,26,14);
      [-1,1].forEach(s=>{ const back=ph==='wind'&&s===side, gx=s*92+(back?s*18:0), gy=back?-40:10; ctx.fillStyle=back?'#ff4d4d':o.c; ctx.beginPath(); ctx.arc(gx,gy,22,0,7); ctx.fill(); if(back) arcTxt(ctx,'!',gx,gy-46,34,'#ff4d4d','center',900); }); ctx.restore();
      ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(30,90,300,10); ctx.fillStyle=o.c; ctx.fillRect(30,90,300*Math.max(0,ohp)/o.hp,10); arcTxt(ctx,o.n+' · '+(oi+1)+'/3',180,76,14,'#fff');
      [-1,1].forEach(s=>{ const dz=dodged===s&&ph!=='idle'; ctx.fillStyle=phitT>0?'#ff4d4d':'#3cff9e'; ctx.globalAlpha=.9; ctx.beginPath(); ctx.arc(180+s*(dz?120:70),540,30,0,7); ctx.fill(); ctx.globalAlpha=1; });
      ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(30,585,300,8); ctx.fillStyle='#3cff9e'; ctx.fillRect(30,585,300*php/100,8);
      if(ph==='wind') arcTxt(ctx,side<0?'ESQUIVE → À DROITE':'ESQUIVE ← À GAUCHE',180,450,15,'rgba(255,255,255,.75)');
      if(msgT>0){ ctx.globalAlpha=Math.min(1,msgT*2); arcTxt(ctx,msg,180,400,34,ph==='counter'?'#ffd400':'#ff4d4d','center',900); ctx.globalAlpha=1; }
      arcHud(ctx,G,'🥊 '+ko+' K.-O.',String(score),'#ff9a1a'); } });
  const hit=s=>{ if(G.cd>0||G.over) return;
    if(ph==='wind'){ dodged=s; arcTone(500,.04,'square',.04); return; }
    if(ph==='counter'){ const d=7+Math.floor(Math.random()*4); ohp-=d; dealt+=d; score+=d*10; hitT=1; G.burst(180+s*40,280,O().c,8); G.pop(180+s*50,240,'-'+d,'#ffd400'); arcTone(240+Math.random()*80,.06,'square',.08);
      if(ohp<=0){ ohp=0; ko++; score+=500*oi+500; ph='ko'; pt=1.4; say('K.-O. !'); G.shake=1; arcTone(1500,.4,'triangle',.1); } return; }
    if(ph==='idle'){ const d=2; ohp-=d; dealt+=d; score+=d*5; hitT=.5; arcTone(300,.04,'square',.04); pt=Math.min(pt,.35); if(ohp<=0){ ohp=0; ko++; score+=500*oi+500; ph='ko'; pt=1.4; say('K.-O. !'); } } };
  const st=api.st, pd=e=>{ const p=G.pt(e); hit(p[0]<180?-1:1); }; st.addEventListener('pointerdown',pd);
  const kd=e=>{ if(e.code==='ArrowLeft') hit(-1); if(e.code==='ArrowRight') hit(1); }; document.addEventListener('keydown',kd);
  window.__fight={G,hit,get ph(){return ph;},get side(){return side;},get ohp(){return ohp;},get php(){return php;},get oi(){return oi;},get score(){return score;},set pt(v){pt=v;}};
  return ()=>{ G.stop(); st.removeEventListener('pointerdown',pd); document.removeEventListener('keydown',kd); window.__fight=null; };
};

/* ---------- fiches des bornes, niveaux, rivaux ---------- */
Object.assign(ARC,{
  inv:{n:'Néon Invaders',ic:'👾',cost:40,col:0x3cff9e,tk:s=>s/45,d:'Glisse le doigt pour déplacer ta dépanneuse : elle tire toute seule. Détruis les vagues de drones rouillés avant qu’ils ne touchent le sol. ⚡ = tir triple, 🔧 = une vie en plus.'},
  cosmo:{n:'Cosmo Nitro',ic:'🚀',cost:40,col:0x00e5ff,tk:s=>s/6,d:'Touche l’écran pour lâcher la nitro et faire monter la voiture-fusée. Passe entre les portiques néon sans les toucher, attrape les ⚡ au passage.'},
  tir:{n:'Tir aux Jantes',ic:'🎯',cost:40,col:0xff2bd6,tk:s=>s/16,d:'40 secondes. Touche les jantes qui défilent : dorées = 50 points, rouillées = −3 s. Enchaîne sans rater pour monter le combo (jusqu’à ×2).'},
  fight:{n:'Choc des Pare-chocs',ic:'🥊',cost:40,col:0xff9a1a,tk:s=>s/55,d:'Quand l’adversaire arme un coup (!), touche le côté OPPOSÉ pour esquiver, puis tape vite pendant « CONTRE ! ». Mets K.-O. les 3 boxeurs de la salle.'},
  defi:{n:'Défi du jour',ic:'🎱',cost:0,col:0xffd400,tk:()=>0,get d(){ const D=arcDaily(), G=ARC[D.g]; return D.done?`Défi du jour réussi ✔ — ${G.ic} ${G.n}, ${fmt(D.goal)} points. Un nouveau défi t’attend demain.`:`Aujourd’hui : ${G.ic} <b>${G.n}</b>. Fais au moins <b>${fmt(D.goal)} points</b> pour gagner <b>🎟️ ${D.tk} tickets bonus</b>. La partie coûte le prix normal de la borne.`; }}
});
Object.assign(ARC_LV,{inv:8,cosmo:9,tir:11,fight:12,defi:3});
Object.assign(ARCR,{inv:[['Okoye',2400],['Quill',1700],['Nakai',1100],['Dumas',650],['Brandt',300]],cosmo:[['Vega',420],['Lindqvist',300],['Ibarra',210],['Okoye',140],['Dumas',70]],
  tir:[['Nakai',1500],['Vega',1150],['Quill',820],['Brandt',520],['Ibarra',260]],fight:[['Dumas',4200],['Okoye',3300],['Ibarra',2400],['Quill',1500],['Vega',700]],defi:[]});

/* ---------- 🎱 défi du jour ---------- */
const arcDayKey=()=>{ const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); };
function arcDaily(){ const A=arcS(), k=arcDayKey(); if(!A.daily||A.daily.k!==k){ const pool=['pin','drift','drag','pit','nitro','inv','cosmo','tir','fight'].filter(g=>S.lvl>=(ARC_LV[g]||0)); let h=0; for(const ch of k) h=(h*31+ch.charCodeAt(0))>>>0; const g=pool[h%pool.length]||'nitro', R=ARCR[g];
    const goal=Math.round((R[2]?R[2][1]:500)*.9/10)*10; A.daily={k,g,goal,tk:25,done:0}; } return A.daily; }
{ const _st=arcStart; arcStart=function(){ if(AOV&&AOV.id==='defi'){ const D=arcDaily(); if(D.done) return toast('🎱 Défi déjà réussi aujourd’hui'); if(S.lvl<(ARC_LV[D.g]||0)) return toast('🔒 Niveau '+ARC_LV[D.g]+' requis'); AOV.id=D.g; AOV.defi=1; } return _st.apply(this,arguments); }; }
{ const _en=arcEnd; arcEnd=function(score,note){ try{ if(AOV&&AOV.defi&&!AOV.over){ const D=arcDaily(); if(!D.done&&AOV.id===D.g&&Math.round(score)>=D.goal){ D.done=1; arcS().tk+=D.tk; note=(note?note+'<br>':'')+`<b class="arc-defi">🎱 Défi du jour réussi : +${D.tk} 🎟️</b>`; save(); } else if(!D.done&&AOV.id===D.g) note=(note?note+'<br>':'')+`<span class="arc-defi">🎱 Défi : encore ${fmt(Math.max(0,D.goal-Math.round(score)))} points</span>`; } }catch(_){} return _en.call(this,score,note); }; }

/* ---------- comptoir de prix enrichi ---------- */
PRIZES.splice(3,0,{id:'neo',ic:'◈',n:'1 500 jetons Néo',d:'La monnaie de l’Arène',c:90,f:()=>{ S.neo=(S.neo||0)+1500; }});
PRIZES.push({id:'pep',ic:'🧩',n:'Pièce Épique',d:'Une pièce de tuning Épique au hasard',c:220,f:()=>{ const g=pbGrant(3,false); toast('🧩 '+g.name); }},
  {id:'parc',ic:'💠',n:'Pièce d’arcade Légendaire',d:'Une pièce unique de la collection d’arcade',c:600,f:()=>{ const g=pbGrant(4,true); toast('💠 '+g.name); }});

/* ---------- la salle 3D : les bornes décor deviennent jouables ---------- */
{ const _ba=WBUILD.arcade; WBUILD.arcade=function(W){ _ba(W);
    [[-30,6,'inv'],[-30,-2,'defi'],[30,12,'cosmo'],[-30,14,'fight'],[30,-6,'tir']].forEach(([x,z,gid])=>{ const G=ARC[gid], px=x+(x<0?3.4:-3.4);
      W.poi('arc_'+gid,px,z,3.2,()=>S.lvl<(ARC_LV[gid]||0)?`🔒 ${G.n} · niveau ${ARC_LV[gid]} requis`:gid==='defi'?(arcDaily().done?'🎱 Défi du jour réussi ✔':`🎱 Défi du jour : ${ARC[arcDaily().g].n} · ${fmt(arcDaily().goal)} pts`):`${G.ic} ${G.n} · record ${fmt(arcS().best[gid]||0)}`,
        ()=>S.lvl<(ARC_LV[gid]||0)?[]:[{id:'arc_'+gid,tx:gid==='defi'?'🎱 Voir le défi':`▶ Jouer · ${G.cost} cr`}]); }); }; }
DEST.forEach(d=>{ if(d.id==='arcade') d.d='10 bornes : pinball, drift, drag, pit stop, nitro, Néon Invaders, Cosmo Nitro, Tir aux Jantes, Choc des Pare-chocs et le Défi du jour. Gagne des tickets, échange-les au comptoir.'; });

/* ---------- carte d'intro : rappel du record et du classement ---------- */
{ const _ai=arcIntro; arcIntro=function(id){ _ai.apply(this,arguments); try{ const A=arcS(), c=document.querySelector('#arcst .arc-card'); if(!c) return;
    if(id==='defi'){ const D=arcDaily(), b=c.querySelector('[data-a="arcstart"]'); if(b){ if(D.done){ b.disabled=true; b.textContent='✔ Défi réussi'; } else b.textContent=`▶ Relever le défi · ${ARC[D.g].cost} cr`; } return; } const me=A.best[id]||0, R=(ARCR[id]||[]).concat([['Toi',me]]).sort((a,b)=>b[1]-a[1]), rk=R.findIndex(r=>r[0]==='Toi')+1;
    const p=c.querySelector('p'); if(p) p.insertAdjacentHTML('afterend',`<div class="arc-meta"><span>🏆 Record <b>${fmt(me)}</b></span><span>📊 Rang <b>#${rk}</b>/${R.length}</span><span>🎟️ jusqu’à <b>${ARC[id].cap||60}</b></span></div>`); }catch(_){} }; }
