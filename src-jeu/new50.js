/* ===== v1.4 : volant agrandi, Spa nettoyé et habillé, Base dans la barre, paliers de niveau, tout récupérer,
   plus de cloison dans le garage, sac à dos seulement au labo, paquets animés, voix off de l'intro ===== */

/* ---- 1. barre du bas : Garage, Épreuves, Atelier, Base, Marché, Missions ---- */
(()=>{ if(!TABS.some(t=>t[0]==='base')){ const i=TABS.findIndex(t=>t[0]==='atelier'); TABS.splice(i<0?TABS.length:i+1,0,['base','🏗️','Base']); }
  const k=GRP_AT.indexOf('base'); if(k>=0) GRP_AT.splice(k,1); })();
{ const _sw=swHTML; swHTML=function(k,lab){ let h=_sw.apply(this,arguments); if(k==='at') h=h.replace(/<button data-a="tab" data-id="base"[^>]*>[^<]*<\/button>/,''); return h; }; }

/* ---- 2. missions : paliers de niveau + « Tout récupérer » ---- */
const PAL50=[[2,{cr:800}],[3,{cr:1500,tok:1}],[4,{cr:2500,nitro:1}],[6,{cr:5000,tok:2}],[8,{cr:9000,tok:3}],[12,{cr:22000,tok:5}],[15,{cr:32000,tok:6,nitro:3}],[25,{cr:80000,tok:15}],[30,{cr:120000,tok:20,nitro:5}]];
PAL50.forEach(([l,g])=>{ const id='lv'+l; if(MISSIONS.some(m=>m.id===id)) return; MISSIONS.push({id,t:'Atteins le niveau '+l,p:s=>[s.lvl,l],g,pal:l}); MCAT[id]='Paliers'; });
[['m38',5],['m9',10],['m39',20]].forEach(([id,l])=>{ const m=MISSIONS.find(x=>x.id===id); if(m){ m.pal=l; MCAT[id]='Paliers'; } });
vMissions=function(){
  questsEnsure();
  const can=S.daily!==dayKey(), dr=dailyReward();
  const qRow=(box,key,L,id)=>{ const q=L.find(x=>x.id===id), a=Math.min(qProg(box,q),q.n), done=a>=q.n, got=box.cl[id], g=qRew(q);
    return `<div class="row ${got?'done locked':''}"><span class="grow"><span class="ttl">${q.t}</span><br><span class="sub">Récompense : ${gText(g)}</span>${got?'':`<div class="prog"><i style="width:${a/q.n*100}%"></i></div>`}</span>
      ${got?'<span class="sub">Terminé</span>':done?`<button class="btn sm good" data-a="qclaim" data-k="${key}" data-id="${id}">Récupérer</button>`:`<span class="num">${fmt(a)} / ${fmt(q.n)}</span>`}</div>`; };
  const mRow=m=>{ const [a,b]=m.p(S), done=a>=b, got=S.claimed[m.id];
    return `<div class="row ${got?'done locked':''}">${m.pal?`<span class="pal50 ${got?'got':done?'ok':''}">${m.pal}</span>`:''}<span class="grow"><span class="ttl">${m.t}</span><br><span class="sub">Récompense : ${gText(m.g)}</span>
      ${got?'':`<div class="prog"><i style="width:${clamp(a/b*100,0,100)}%"></i></div>`}</span>
      ${got?'<span class="sub">Terminée</span>':done?`<button class="btn sm good" data-a="claim" data-id="${m.id}">Récupérer</button>`:`<span class="num">${fmt(Math.min(a,b))} / ${fmt(b)}</span>`}</div>`; };
  const cats=['Paliers','Débuts','Course','Cartes','Collection','Économie','Progression'].concat(illOK()?['Légal','Clandestin']:[]);
  const left=MISSIONS.filter(m=>missVis(m)&&!S.claimed[m.id]).length;
  const title=ct=>ct==='Clandestin'?'🕶️ Clandestin':ct==='Paliers'?'⭐ Paliers de niveau':ct;
  return `<div class="head"><h2>Missions</h2><p>${left} objectif${left>1?'s':''} restant${left>1?'s':''}</p></div>
  ${claimBar()}
  <div class="row ${can?'':'locked'}"><span class="ico">🎁</span><span class="grow"><span class="ttl">Récompense du jour</span><br><span class="sub">${cr(dr.cr)} et ${dr.tok} 🎟. Série en cours : ${S.streak||0} jour${(S.streak||0)>1?'s':''}. Un bonus tous les 7 jours.</span></span>${can?`<button class="btn sm good" data-a="daily">Récupérer</button>`:'<span class="sub">Reviens demain</span>'}</div>
  <div class="sec"><h3>Défis du jour</h3>${S.dq.ids.map(id=>qRow(S.dq,'dq',DQ,id)).join('')}</div>
  <div class="sec"><h3>Défis de la semaine</h3>${S.wq.ids.map(id=>qRow(S.wq,'wq',WQ,id)).join('')}</div>
  ${cats.map(ct=>{ let ms=MISSIONS.filter(m=>missVis(m)&&(MCAT[m.id]||'Débuts')===ct);
    ms=ct==='Paliers'?ms.sort((a,b)=>a.pal-b.pal):ms.sort((a,b)=>(S.claimed[a.id]?1:0)-(S.claimed[b.id]?1:0));
    return ms.length?`<div class="sec ${ct==='Paliers'?'pals50':''}"><h3>${title(ct)}</h3>${ms.map(mRow).join('')}</div>`:''; }).join('')}`;
};

/* ---- 3. garage 3D : plus de cloison vers le labo ; le labo s'ouvre depuis Atelier › Labo ---- */
hubSecret=function(){ HUB.sec=null; };
{ const _r=render; render=function(){ try{ if(S&&S.age18===true&&labLv()>=LAB_LVL){ const F=farm(); if(F&&!F.found) F.found=1; } }catch(e){} return _r.apply(this,arguments); }; }
{ const _g=goalNext; goalNext=function(){ const r=_g.apply(this,arguments); if(r&&/cloison/i.test(r[1]||'')) return ['🌿','Ton labo clandestin est ouvert : va dans Atelier › Labo','labo','Ouvrir ›']; return r; }; }
try{ const u=UNL.find(x=>x[2]==='Labo clandestin'); if(u) u[3]='Ton labo t’attend dans Atelier › Labo : culture, séchage, vente… et les courses clandestines, le karma et la police. Un tuto complet t’y attend.'; }catch(e){}
{ const _ul=ulSheet; ulSheet=function(){ const r=_ul.apply(this,arguments); try{ if(r){ const b=$('sheet').querySelector('[data-a="ulgo"][data-id="hub"]'); if(b){ b.dataset.id='labo'; b.textContent='🌿 Ouvrir le labo'; } } }catch(e){} return r; }; }
/* labo en page : Croiser / Variétés / Tout planter juste au-dessus des emplacements de plantation */
{ const _dl=decorLab47; decorLab47=function(){ const r=_dl.apply(this,arguments); try{ const el=$('sheet'), t=el&&el.querySelector(':scope>.labtools'); if(t){ const g=el.querySelector(':scope>.rgrid'), tb=el.querySelector(':scope>.rtabs');
  if(g){ if(t.nextElementSibling!==g) g.before(t); } else if(tb&&tb.nextElementSibling!==t) tb.after(t); t.classList.add('lt50'); } }catch(e){} return r; }; }
/* sac à dos : seulement dans le labo (pas dans le garage, la plage, etc.) */
{ const _hf=hubFrame; hubFrame=function(){ try{ document.body.classList.toggle('inlab50',!!(HUB.map&&GROW[HUB.map])); }catch(e){} return _hf.apply(this,arguments); }; }

/* ---- 4. Spa : marquages au sol nettoyés + immeubles néon comme sur les autres circuits ---- */
function spaNear50(){
  const T=TRK; if(T._nr50&&T._nr50.N===T.N) return T._nr50;
  const C=24, H=new Map(); for(let i=0;i<T.N;i++){ const k=Math.floor(T.cx[i]/C)+','+Math.floor(T.cz[i]/C); let a=H.get(k); if(!a) H.set(k,a=[]); a.push(i); }
  const near=(x,z,rad)=>{ const r=Math.ceil((rad||C)/C), gx=Math.floor(x/C), gz=Math.floor(z/C); let bi=-1, bd=1e18;
    for(let a=-r;a<=r;a++) for(let b=-r;b<=r;b++){ const L=H.get((gx+a)+','+(gz+b)); if(!L) continue; for(const i of L){ const dx=x-T.cx[i], dz=z-T.cz[i], d=dx*dx+dz*dz; if(d<bd){ bd=d; bi=i; } } }
    return bi<0?null:{i:bi,d:Math.sqrt(bd)}; };
  return T._nr50={N:T.N,near};
}
function spaLines50(sc){
  const T=TRK, nr=spaNear50(), keep=[]; let kept=0, cut=0;
  sc.traverse(m=>{ if(!m.isMesh||!m.material||m.material.type!=='MeshBasicMaterial'||m.material.map||!m.material.color||m.material.color.getHex()!==0xe6f7ff) return; keep.push(m); });
  keep.forEach(m=>{ const g=m.geometry, P=g.attributes.position, I=g.index; if(!P||!I) return;
    const src=I.array, out=[];
    for(let t=0;t<src.length;t+=3){ const a=src[t], b=src[t+1], c=src[t+2], x=(P.getX(a)+P.getX(b)+P.getX(c))/3, z=(P.getZ(a)+P.getZ(b)+P.getZ(c))/3, q=nr.near(x,z,30);
      if(!q){ cut++; continue; } const i=q.i, nx=Math.sin(T.th[i]), nz=-Math.cos(T.th[i]), d=(x-T.cx[i])*nx+(z-T.cz[i])*nz, edge=d>0?T.pl[i]:T.pr[i], ad=Math.abs(d);
      if(ad>edge-1.25&&ad<edge+.7){ out.push(a,b,c); kept++; } else cut++; }
    g.setIndex(new THREE.BufferAttribute(P.count>65535?new Uint32Array(out):new Uint16Array(out),1)); });
  return {kept,cut};
}
function spaCity50(R){
  const T=TRK, meta=T.meta, nr=spaNear50(); let seed=7051; const rn=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const bins={}, bin=(x,z,f)=>{ const tx=Math.floor((x-meta.TX0)/meta.tile), tz=Math.floor((z-meta.TZ0)/meta.tile), k=tx+','+tz+','+f; return bins[k]||(bins[k]={tx,tz,f,p:[],i:[],u:[],np:[],ni:[],nc:[]}); };
  const quad=(B,A,Bq,C,D,uv)=>{ const v=B.p.length/3; B.p.push(...A,...Bq,...C,...D); B.i.push(v,v+1,v+2,v,v+2,v+3); B.u.push(...(uv||[0,0,0,0,0,0,0,0])); };
  const glow=(B,A,Bq,C,D,col)=>{ const v=B.np.length/3; B.np.push(...A,...Bq,...C,...D); B.ni.push(v,v+1,v+2,v,v+2,v+3); for(let k=0;k<4;k++) B.nc.push(...col); };
  const NEON=[[0,.9,1],[1,.17,.84],[.99,.93,.04],[.24,1,.62]];
  let nb=0;
  for(let s=0;s<T.L;s+=34){ const i=Math.min(T.N-1,Math.floor(s/T.DS)); for(const sd of [1,-1]){ if(rn()<.18) continue;
    const nx=Math.sin(T.th[i])*sd, nz=-Math.cos(T.th[i])*sd, wall=Math.max((sd>0?T.wallL:T.wallR)?(sd>0?T.wallL[i]:T.wallR[i]):0,(sd>0?T.limL:T.limR)?(sd>0?T.limL[i]:T.limR[i]):0,12);
    const off=wall+26+rn()*90, x=T.cx[i]+nx*off+(rn()-.5)*20, z=T.cz[i]+nz*off+(rn()-.5)*20, q=nr.near(x,z,140);
    if(!q||q.d<wall+20) continue;
    const w=10+rn()*16, d=10+rn()*16, h=14+rn()*46, y0=T.cy[q.i]-10, y1=T.cy[q.i]+h, B=bin(x,z,Math.floor(rn()*4)), ang=rn()*Math.PI, ca=Math.cos(ang), sa=Math.sin(ang);
    const P=(u,v,y)=>[x+u*ca-v*sa,y,z+u*sa+v*ca], c=[P(-w/2,-d/2,0),P(w/2,-d/2,0),P(w/2,d/2,0),P(-w/2,d/2,0)];
    const v=c.map(p=>[p[0],y0,p[2]]).concat(c.map(p=>[p[0],y1,p[2]])), hv=(y1-y0)/24;
    [[0,1,5,4,w],[1,2,6,5,d],[2,3,7,6,w],[3,0,4,7,d]].forEach(f=>{ const hu=Math.max(1,Math.round(f[4]/8)); quad(B,v[f[0]],v[f[1]],v[f[2]],v[f[3]],[0,0,hu,0,hu,hv,0,hv]); });
    quad(B,v[4],v[5],v[6],v[7],null);
    if(rn()<.7){ const col=NEON[Math.floor(rn()*NEON.length)], e=.55, y2=y1+.05;   /* liseré néon sur le toit */
      for(let k=0;k<4;k++){ const a=c[k], b=c[(k+1)%4]; glow(B,[a[0],y1-e,a[2]],[b[0],y1-e,b[2]],[b[0],y2,b[2]],[a[0],y2,a[2]],col); }
      if(rn()<.5){ const yb=y0+10+rn()*(h-4); for(let k=0;k<4;k++){ const a=c[k], b=c[(k+1)%4]; glow(B,[a[0],yb,a[2]],[b[0],yb,b[2]],[b[0],yb+.35,b[2]],[a[0],yb+.35,a[2]],col); } } }
    nb++; } }
  /* façades : fenêtres allumées (chaudes, quelques néons cyan), comme la ville de l'intro */
  if(!window.FAC50) window.FAC50=['#262a5c','#30244a','#1f2d4f','#2c2440'].map((base,k)=>{ const cv=document.createElement('canvas'); cv.width=64; cv.height=128; const x=cv.getContext('2d'); x.fillStyle=base; x.fillRect(0,0,64,128); let sd=97+k*31; const r=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
    for(let row=0;row<6;row++) for(let col=0;col<3;col++){ const on=r()<.42; x.fillStyle=on?(r()<.25?'#7fe8ff':r()<.15?'#ff7ae0':'#ffd27a'):'#0d0e1e'; x.fillRect(8+col*19,9+row*20,11,10); }
    x.fillStyle=base; x.fillRect(0,0,4,4); const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=2; return new THREE.MeshLambertMaterial({map:t,emissive:0x3a3020,emissiveMap:t,side:THREE.DoubleSide}); });
  const gm=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
  Object.values(bins).forEach(b=>{ const key=b.tx+','+b.tz; let g=R.tiles[key]; if(!g){ g=new THREE.Group(); g.userData={cx:meta.TX0+(b.tx+.5)*meta.tile,cz:meta.TZ0+(b.tz+.5)*meta.tile}; R.tiles[key]=g; R.scene.add(g); }
    const G=new THREE.BufferGeometry(); G.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3)); G.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2)); G.setIndex(b.i); G.computeVertexNormals(); g.add(new THREE.Mesh(G,window.FAC50[b.f]));
    if(b.np.length){ const N=new THREE.BufferGeometry(); N.setAttribute('position',new THREE.Float32BufferAttribute(b.np,3)); N.setAttribute('color',new THREE.Float32BufferAttribute(b.nc,3)); N.setIndex(b.ni); g.add(new THREE.Mesh(N,gm)); } });
  return nb;
}
{ const _bs=buildSpa; buildSpa=function(){ const r=_bs.apply(this,arguments); try{ if(!TRK.cur&&r&&r.scene){ r.l50=spaLines50(r.scene); r.b50=spaCity50(r); } }catch(e){ try{ console.warn('spa50',e); }catch(_){} } return r; }; }

/* ---- 5. paquets : carrousel à ressort, déclic à chaque paquet, flash à l'arrivée, halo couleur du paquet ---- */
PK.pv=0; PK.lc=null;
const vib50=p=>{ try{ if(navigator.vibrate&&(!navigator.userActivation||navigator.userActivation.hasBeenActive)) navigator.vibrate(p); }catch(_){} };
const sfx50=(f,d,type,v,f2)=>{ try{ if(!AU||!AU.ok) return; const c=AU.ctx, t=c.currentTime, o=c.createOscillator(), g=c.createGain(); o.type=type||'triangle'; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+d); g.gain.setValueAtTime(v||.05,t); g.gain.exponentialRampToValueAtTime(.0005,t+d); o.connect(g); g.connect(AU.b.ui); o.start(t); o.stop(t+d+.02); }catch(_){} };
const whoosh50=(d,v)=>{ try{ if(!AU||!AU.ok) return; const c=AU.ctx, t=c.currentTime, n=Math.floor(c.sampleRate*d), b=c.createBuffer(1,n,c.sampleRate), a=b.getChannelData(0); for(let i=0;i<n;i++) a[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);
  const s=c.createBufferSource(); s.buffer=b; const f=c.createBiquadFilter(); f.type='bandpass'; f.Q.value=1.2; f.frequency.setValueAtTime(600,t); f.frequency.exponentialRampToValueAtTime(3200,t+d); const g=c.createGain(); g.gain.value=v||.12; s.connect(f); f.connect(g); g.connect(AU.b.ui); s.start(t); }catch(_){} };
pkLayout=function(time){
  const ring=$('pkring'); if(!ring){PK.raf=0; return false;}
  if(!PK.drag){ const d=PK.tgt-PK.pos; PK.pv=(PK.pv||0)*.74+d*.085; PK.pos+=PK.pv; if(Math.abs(d)<.002&&Math.abs(PK.pv)<.002){ PK.pos=PK.tgt; PK.pv=0; } }
  else if(PK.drag.mode==='car') PK.pv=0;
  if(!(PK.drag&&PK.drag.mode==='rot')){
    if(Math.abs(PK.rv)>.25){ PK.ry+=PK.rv; PK.rv*=.94; }
    else{ PK.rv=0; const tg=PK.snap!=null?PK.snap:Math.round(PK.ry/180)*180; PK.ry+=(tg-PK.ry)*.14; if(Math.abs(tg-PK.ry)<.3){ PK.ry=tg; PK.snap=null; } } }
  const ci=clamp(Math.round(PK.pos),0,PACKS.length-1), mv=clamp((PK.drag&&PK.drag.mode==='car'?(PK.vel||0)*-6:(PK.pv||0)*8),-1,1);
  if(PK.lc==null) PK.lc=ci;
  if(ci!==PK.lc){ PK.lc=ci; sfx50(780+ci*35,.05,'triangle',.045,1250+ci*35); vib50(5); const e=ring.children[ci]; if(e){ e.classList.remove('land50'); void e.offsetWidth; e.classList.add('land50'); } const st=$('pk3'); if(st){ const th=PKT[PACKS[ci].id]||PKT.p1; st.style.setProperty('--hc',th.c1); st.style.setProperty('--hc2',th.c2); } }
  [...ring.children].forEach(el=>{
    const i=+el.dataset.i, o=i-PK.pos, ao=Math.abs(o), sg=o<0?-1:1;
    const x=sg*(Math.min(ao,1)*108+Math.max(0,ao-1)*70), z=-Math.min(ao,2.2)*160;
    let ry=-Math.max(-1.5,Math.min(1.5,o))*44; const front=ao<.5;
    if(front&&Math.abs(PK.rv)<.25&&Math.abs(PK.ry%360)<1) ry+=Math.sin(time/820+i)*5*(1-ao*2);
    if(front) ry+=PK.ry;
    const bob=front?Math.sin(time/640)*3:0, rz=mv*(front?3:5)*(1-Math.min(ao,1)*.4);
    el.style.transform=`translate3d(${x.toFixed(1)}px,${(-ao*5+bob).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${(1-.06*Math.min(ao,2)+(front?.02*(1-ao*2):0)).toFixed(3)})`;
    el.style.opacity=ao>2.6?0:(1-.16*Math.min(ao,2.4)).toFixed(2); el.style.zIndex=String(20-Math.round(ao*3));
    el.style.setProperty('--sx',(-30+ry*1.1+Math.sin(time/1300+i)*30).toFixed(0)+'%'); el.classList.toggle('sel',front);
    el.classList.toggle('arm',!!PK.arm&&front);
  });
  pkInfo(); return true;
};
{ const _bp=bindPacks; bindPacks=function(){ const r=_bp.apply(this,arguments); try{ const st=$('pk3'); if(st&&!st.querySelector('.fx50')){ st.insertAdjacentHTML('beforeend','<div class="fx50">'+Array.from({length:9},(_,k)=>`<i style="--k:${k}"></i>`).join('')+'</div>'); const i=clamp(Math.round(PK.tgt),0,PACKS.length-1), th=PKT[PACKS[i].id]||PKT.p1; st.style.setProperty('--hc',th.c1); st.style.setProperty('--hc2',th.c2); PK.lc=i; } }catch(e){} return r; }; }
{ const _go=ACT.pkgo; if(_go) ACT.pkgo=function(){ whoosh50(.22,.08); return _go.apply(this,arguments); }; }
function burst50(col,big){
  const o=document.createElement('div'); o.className='burst50'+(big?' big':''); o.style.setProperty('--bc',col||'#fff');
  o.innerHTML='<div class="fl"></div>'+Array.from({length:big?26:16},(_,k)=>{ const a=k/(big?26:16)*Math.PI*2+Math.random()*.3, r=(big?150:110)+Math.random()*90; return `<i style="--dx:${(Math.cos(a)*r).toFixed(0)}px;--dy:${(Math.sin(a)*r).toFixed(0)}px;--d:${(Math.random()*.15).toFixed(2)}s;--s:${(.6+Math.random()*.9).toFixed(2)}"></i>`; }).join('');
  document.body.appendChild(o); setTimeout(()=>o.remove(),1100); }
{ const _pg=ACT.packgo; ACT.packgo=function(d){ const c0=S.cr, t0=S.tok, r=_pg.apply(this,arguments); try{ if(S.cr<c0||S.tok<t0){ const p=PACKS.find(x=>x.id===d.id), th=(p&&PKT[p.id])||PKT.p1; burst50(th.c1,false); whoosh50(.35,.14); sfx50(420,.25,'sawtooth',.03,980); } }catch(e){} return r; }; }
{ const _rv=ACT.reveal; ACT.reveal=function(){ const i0=sheet&&sheet.i; const r=_rv.apply(this,arguments); try{ if(sheet&&sheet.t==='open'&&sheet.i>i0){ const m=modOf(sheet.cards[sheet.i-1]); if(m){ whoosh50(.18,.07); if(m.r>=2) burst50(rcOf(m),m.r>=4); if(m.r>=4) vib50([20,40,30]); } } }catch(e){} return r; }; }
{ const _ra=ACT.revealall; ACT.revealall=function(){ const r=_ra.apply(this,arguments); try{ if(sheet&&sheet.t==='open'){ const ms=sheet.cards.map(modOf).filter(Boolean), b=ms.sort((a,c)=>c.r-a.r)[0]; if(b&&b.r>=2) burst50(rcOf(b),b.r>=4); } }catch(e){} return r; }; }
{ const _cp=ACT.cpreveal; if(_cp) ACT.cpreveal=function(){ const r=_cp.apply(this,arguments); try{ burst50('#ffd24a',true); whoosh50(.4,.14); }catch(e){} return r; }; }

/* ---- 6. intro : voix off du cycliste, plus de texte à l'écran (le titre final reste) ---- */
CS.length=0;
const VO50=[['v1',1.2],['v3',9.6],['v4',12.4],['v5',20.8],['v6',27.2],['v7',35.0],['v8',39.4],['v9',44.8]];
const VOB50={}; let VOS50=[];
function voPrep50(){ try{ if(!AU||!AU.ctx||typeof VOIX50==='undefined') return; VO50.forEach(([id])=>{ if(VOB50[id]||!VOIX50[id]) return; VOB50[id]='…';
  const bin=atob(VOIX50[id]), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
  AU.ctx.decodeAudioData(u.buffer,b=>{ VOB50[id]=b; },()=>{ VOB50[id]=null; }); }); }catch(e){} }
function voPlay50(id){ try{ const b=VOB50[id]; if(!b||b==='…'||!AU.ctx||(S.audio&&S.audio.mute)) return; const c=AU.ctx, s=c.createBufferSource(), g=c.createGain(), f=c.createBiquadFilter();
  f.type='highpass'; f.frequency.value=110; g.gain.value=1.15; s.buffer=b; s.connect(f); f.connect(g); g.connect(c.destination); s.start(); VOS50.push(s); s.onended=()=>{ VOS50=VOS50.filter(x=>x!==s); }; }catch(e){} }
function voStop50(){ VOS50.forEach(s=>{ try{ s.stop(); }catch(_){} }); VOS50=[]; }
{ const _cb=cineBuild; cineBuild=function(){ const T=_cb.apply(this,arguments); try{ voPrep50(); const tk=T.tick, done={};
    T.tick=function(){ const r=tk.apply(this,arguments); try{ VO50.forEach(([id,at])=>{ if(!done[id]&&T.t>=at){ done[id]=1; if(T.t<at+1.5) voPlay50(id); } }); }catch(e){} return r; }; }catch(e){} return T; }; }
{ const _cs=cineAudioStop; cineAudioStop=function(){ voStop50(); return _cs.apply(this,arguments); }; }
