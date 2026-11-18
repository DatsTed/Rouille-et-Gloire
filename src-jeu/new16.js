/* ===== v0.27 : paquets — rotation au doigt, déchirure par swipe, voiture complète (ultra rare) ===== */
PK.ry=0; PK.rv=0; PK.arm=null; PK.snap=null;
const CAR_P={p1:.0004,p2:.0008,p3:.002,p4:.006}; /* chance par paquet : 0,04 % → 0,6 % */
function pack3d(p,i){
  const th=PKT[p.id]||PKT.p1, pips=[0,1,2].map(k=>RAR[Math.min(6,p.min+k)]).map(r=>`<i style="background:${r.c}"></i>`).join('');
  return `<div class="pk" data-i="${i}" style="--c1:${th.c1};--c2:${th.c2};--c3:${th.c3}">
    <div class="lay l1"></div><div class="lay l2"></div><div class="lay l3"></div>
    <div class="lay fr"><div class="crimp t"></div><div class="crimp b"></div>
      <div class="ct"><span class="tag">${th.tag}</span><span class="emb">${th.emb}</span><div><div class="nm">${p.nom.replace('Paquet ','')}</div><div class="sb">${p.n} modules</div></div><span class="pips">${pips}</span></div><div class="shine"></div><div class="tearln"></div><div class="tearfill"></div></div>
    <div class="lay bk"><div class="crimp t"></div><div class="crimp b"></div><div class="ct"><span class="tag">HIGH &amp; ROUILLÉ</span><span class="emb">🃏</span><span class="sb">${p.d}</span><span class="tag">COLLECTION</span></div></div></div>`;
}
function pkInfo(force){
  const el=$('pkInfo'); if(!el) return; const i=clamp(Math.round(PK.drag?PK.pos:PK.tgt),0,PACKS.length-1);
  if(PK.arm&&PK.arm.id!==PACKS[i].id){ PK.arm=null; force=true; }
  if(!force&&PK.shown===i) return; PK.shown=i; const p=PACKS[i];
  if(PK.arm){ el.innerHTML=`<div class="t"><b>${p.nom}</b><span>${p.n} modules</span></div><p class="tearhint">✂️ <b>Déchire le paquet !</b> Glisse ton doigt de gauche à droite sur la ligne jaune, en haut.</p>
    <div class="buy"><button class="btn alt" data-a="packcancel">Annuler</button><button class="btn alt" data-a="packfast">Ouvrir sans déchirer</button></div>`; }
  else el.innerHTML=`<div class="t"><b>${p.nom}</b><span>${p.n} modules</span></div><p class="note" style="margin:0">${p.d}</p>
    <p class="note sm" style="margin:2px 0 6px">👆 Tourne le paquet au doigt pour voir son dos.</p>
    <div class="buy"><button class="btn" data-a="pack" data-id="${p.id}" data-k="cr" ${S.cr<p.cr?'disabled':''}>Déchirer, ${cr(p.cr)}</button><button class="btn alt" data-a="pack" data-id="${p.id}" data-k="tok" ${S.tok<p.tok?'disabled':''}>${p.tok} 🎟</button></div>`;
  const dots=$('pkdots'); if(dots) [...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i));
}
function pkLayout(time){
  const ring=$('pkring'); if(!ring){PK.raf=0; return false;}
  if(!PK.drag||PK.drag.mode!=='car'){ /* le carrousel suit sa cible */ if(!PK.drag){ const d=PK.tgt-PK.pos; PK.pos+=d*.15; if(Math.abs(d)<.003) PK.pos=PK.tgt; } }
  /* rotation libre du paquet : inertie puis aimantation face / dos */
  if(!(PK.drag&&PK.drag.mode==='rot')){
    if(Math.abs(PK.rv)>.25){ PK.ry+=PK.rv; PK.rv*=.94; }
    else{ PK.rv=0; const tg=PK.snap!=null?PK.snap:Math.round(PK.ry/180)*180; PK.ry+=(tg-PK.ry)*.14; if(Math.abs(tg-PK.ry)<.3){ PK.ry=tg; PK.snap=null; } }
  }
  [...ring.children].forEach(el=>{
    const i=+el.dataset.i, o=i-PK.pos, ao=Math.abs(o), sg=o<0?-1:1;
    const x=sg*(Math.min(ao,1)*108+Math.max(0,ao-1)*70), z=-Math.min(ao,2.2)*160;
    let ry=-Math.max(-1.5,Math.min(1.5,o))*44; const front=ao<.5; if(front&&Math.abs(PK.rv)<.25&&Math.abs(PK.ry%360)<1) ry+=Math.sin(time/820+i)*5*(1-ao*2); if(front) ry+=PK.ry;
    el.style.transform=`translate3d(${x.toFixed(1)}px,${(-ao*5).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(${(1-.06*Math.min(ao,2)).toFixed(3)})`;
    el.style.opacity=ao>2.6?0:(1-.16*Math.min(ao,2.4)).toFixed(2); el.style.zIndex=String(20-Math.round(ao*3));
    el.style.setProperty('--sx',(-30+ry*1.1+Math.sin(time/1300+i)*30).toFixed(0)+'%'); el.classList.toggle('sel',front);
    el.classList.toggle('arm',!!PK.arm&&front);
  });
  pkInfo(); return true;
}
function pkTear(el,i){ /* animation : le haut du paquet part en lambeau */
  const pc=document.createElement('div'); pc.className='tearpiece'; pc.style.setProperty('--c1',getComputedStyle(el).getPropertyValue('--c1')); el.parentNode.parentNode.appendChild(pc);
  const r=el.getBoundingClientRect(), pr=el.parentNode.parentNode.getBoundingClientRect(); pc.style.left=(r.left-pr.left)+'px'; pc.style.top=(r.top-pr.top)+'px'; pc.style.width=r.width+'px';
  setTimeout(()=>pc.remove(),900);
}
function bindPacks(){
  const st=$('pk3'); if(!st||cTab!=='packs'){PK.raf=0; return;}
  PK.shown=-1; pkLayout(performance.now()); pkInfo(true);
  st.addEventListener('pointerdown',e=>{
    if(e.target.closest('.pknav')) return;
    const pe=e.target.closest&&e.target.closest('.pk'), sel=pe&&+pe.dataset.i===Math.round(PK.tgt);
    let mode='car', zone=false;
    if(sel){ mode='rot'; if(PK.arm){ const r=pe.getBoundingClientRect(); zone=Math.abs(PK.ry%360)<30&&(e.clientY-r.top)<r.height*.42; if(zone) mode='tear'; } }
    PK.drag={x:e.clientX,p:PK.pos,moved:0,lx:e.clientX,lt:e.timeStamp,tg:e.target,mode,r0:PK.ry,pe,w:pe?pe.getBoundingClientRect().width:158}; PK.vel=0; PK.rv=0; PK.snap=null; try{st.setPointerCapture(e.pointerId);}catch(_){}
  });
  st.addEventListener('pointermove',e=>{
    const d=PK.drag; if(!d) return; const dx=e.clientX-d.x; d.moved=Math.max(d.moved,Math.abs(dx));
    const dt=e.timeStamp-d.lt;
    if(d.mode==='car'){ PK.pos=clamp(d.p-dx/108,-.3,PACKS.length-.7); if(dt>0){PK.vel=PK.vel*.6+((e.clientX-d.lx)/dt)*.4; d.lx=e.clientX; d.lt=e.timeStamp;} }
    else if(d.mode==='rot'){ PK.ry=d.r0+dx*1.5; if(dt>0){ PK.rv=PK.rv*.5+((e.clientX-d.lx)*1.5)*.5*(16/Math.max(8,dt)); d.lx=e.clientX; d.lt=e.timeStamp; } }
    else if(d.mode==='tear'&&d.pe){ const p=clamp(dx/(d.w*.85),0,1); d.pe.style.setProperty('--tp',p.toFixed(3)); if(p>=1&&!d.done){ d.done=1; const a=PK.arm; PK.arm=null; pkTear(d.pe,0); try{ st.releasePointerCapture(e.pointerId); }catch(_){} PK.drag=null; auTry(()=>auRip(Math.round(PK.tgt))); setTimeout(()=>{ if(d.pe) d.pe.style.setProperty('--tp',0); ACT.packgo({id:a.id,k:a.k}); },380); } }
  });
  const up=e=>{
    const d=PK.drag; if(!d) return; PK.drag=null;
    if(d.mode==='tear'){ if(d.pe) d.pe.style.setProperty('--tp',0); return; }
    if(d.moved<6){ const pe=d.tg&&d.tg.closest&&d.tg.closest('.pk'); if(pe){ const i=+pe.dataset.i; if(i===Math.round(PK.tgt)){ const pp=PACKS[i]; ACT.pack({id:pp.id,k:S.cr>=pp.cr?'cr':'tok'}); } else PK.tgt=i; } else PK.tgt=Math.round(PK.pos); return; }
    if(d.mode==='rot'){ if(Math.abs(PK.rv)<2) PK.rv=0; auTry(()=>ui('click')); return; }
    PK.tgt=clamp(Math.round(PK.pos-PK.vel*170/108),0,PACKS.length-1); auTry(()=>ui('click'));
  };
  st.addEventListener('pointerup',up); st.addEventListener('pointercancel',up);
  if(!PK.raf) PK.raf=requestAnimationFrame(pkLoop);
}
/* achat : d'abord on arme la déchirure */
ACT.packgo=ACT.pack;
ACT.pack=function(d){ const pk=PACKS.find(p=>p.id===d.id); if(!pk) return; const ok=(d.k==='tok'?S.tok>=pk.tok:S.cr>=pk.cr);
  if(!ok) return toast('Pas assez pour ce paquet'); if(S.mods.length+pk.n>invMax()) return toast('Inventaire plein : recycle ou fusionne des modules');
  if(sheet||!$('pk3')){ return ACT.packgo(d); } /* « Encore un » depuis le résultat : direct */
  PK.arm={id:d.id,k:d.k}; PK.snap=Math.round(PK.ry/360)*360; PK.rv=0; PK.shown=-1; pkInfo(true); };
ACT.packcancel=()=>{ PK.arm=null; PK.shown=-1; pkInfo(true); };
ACT.packfast=()=>{ const a=PK.arm; PK.arm=null; if(a) ACT.packgo({id:a.id,k:a.k}); };
/* voiture complète : ultra rare */
function carPrize(){
  const w=CARS.map(c=>1/Math.pow(c.t,3.2)), tot=w.reduce((a,b)=>a+b,0); let x=Math.random()*tot; for(let i=0;i<CARS.length;i++){ x-=w[i]; if(x<0) return CARS[i]; } return CARS[0];
}
const _openPack0=openPack;
openPack=function(id,cur){
  const n0=S.mods.length, c0=S.cars.length; _openPack0(id,cur);
  if(S.mods.length===n0||!sheet||sheet.t!=='open') return;
  if(Math.random()<(CAR_P[id]||.0005)*(1+.1*pk('luck'))){ const m=carPrize(), c={uid:S.nuid++,mid:m.id,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{},sh:Math.random()<.06?1:0}; S.cars.push(c); sheet.car=c.uid; S.stats.carpack=(S.stats.carpack||0)+1; save(); }
};
const _openStage0=openStage;
openStage=function(X){
  const done=sheet.i>=sheet.cards.length;
  if(done&&sheet.car&&!sheet.carSeen){ const c=car(sheet.car), m=c&&M[c.mid]; if(!c){ sheet.car=null; return _openStage0(X); }
    $('sheet').innerHTML=`${X}<div class="carwin"><div class="cw-rays"></div><div class="cw-t">JACKPOT !</div><h2>Une voiture dans le paquet !</h2>
      <div class="cw-car" style="--t:${TIERS[m.t].c}">${carSVG(m,100)}</div><div class="cw-n">${m.nom}${c.sh?' ✨ brillante':''}</div><p class="note">${m.an} · ${m.cat} · ${TIERS[m.t].n}. Elle est déjà dans ton garage.</p>
      <button class="btn wide" data-a="carseen">Voir mes cartes du paquet</button></div>`; return true; }
  return _openStage0(X);
};
ACT.carseen=()=>{ if(sheet){ sheet.carSeen=1; sheet.i=sheet.cards.length; renderSheet(); } };
/* ---- cartes : tout tient sur un écran, achat toujours visible ---- */
function packsHTML(){
  return `<div class="pk3" id="pk3"><button class="pknav l" data-a="pkgo" data-id="-1" aria-label="Précédent">‹</button><div class="ring" id="pkring">${PACKS.map(pack3d).join('')}</div><div class="fl"></div><button class="pknav r" data-a="pkgo" data-id="1" aria-label="Suivant">›</button></div>
    <div class="dots" id="pkdots">${PACKS.map(()=>'<i></i>').join('')}</div><div class="pkInfo" id="pkInfo"></div>`;
}
const _pkInfo1=pkInfo;
pkInfo=function(force){ _pkInfo1(force); const el=$('pkInfo'); if(el&&!el.querySelector('.rlink')&&!PK.arm){ const t=el.querySelector('.t'); if(t) t.insertAdjacentHTML('beforeend','<button class="rlink" data-a="rates">ℹ️ taux</button>'); } };
function pkFit(){ const st=$('pk3'), ring=$('pkring'); if(!st||!ring) return; const h=st.clientHeight||318, w=st.clientWidth||360; ring.style.transformOrigin='50% 44%'; ring.style.transform=`scale(${Math.max(.6,Math.min(h/318,w/400*1.12,1.9)).toFixed(3)})`; }
const _bindPacks1=bindPacks;
bindPacks=function(){ _bindPacks1(); pkFit(); window.addEventListener('resize',pkFit); };
/* ---- guide d'objectif : toujours dire quoi faire ensuite ---- */
function goalNext(){
  const st=S.stats||{}, F=S.farm;
  if(!st.races) return ['🏁','Fais ta première épreuve : c’est ce qui rapporte crédits et expérience','epreuves','Aller aux épreuves'];
  if(!st.packs&&(S.tok>=1||S.cr>=500)) return ['🃏','Ouvre ton premier paquet de cartes pour améliorer tes voitures','cartes','Aux cartes'];
  if(S.mods.length&&!S.cars.some(c=>c.mods&&Object.keys(c.mods).length)) return ['🔧','Tu as des pièces ! Monte-les sur une voiture pour la rendre plus rapide','garage','Au garage'];
  if(!S.pod.slots.some(Boolean)) return ['🏛️','Place une voiture sur un podium : elle te rapporte des crédits même quand tu ne joues pas','garage','Au garage'];
  if(labLv()>=8&&!(F&&F.found)) return ['🕵️','Une cloison cache un secret dans le garage 3D… va faire un tour dans le Monde','hub','Entrer dans le Monde'];
  if(F&&F.found&&!F.tutoSeen) return ['🌿','Reviens dans le labo caché pour suivre le tuto','hub','Au Monde'];
  return null;
}
function goalUpd(){
  let g=$('goal'); if(!g){ const t=$('top'); if(!t) return; g=document.createElement('div'); g.id='goal'; t.after(g); }
  const n=(view==='race'||document.body.classList.contains('racing')||document.body.classList.contains('hubmode'))?null:goalNext();
  if(!n){ g.style.display='none'; return; } const k=n[0]+n[1]+n[2];
  if(g.dataset.k!==k){ g.dataset.k=k; g.innerHTML=`<span class="gi">${n[0]}</span><span class="gt"><small>OBJECTIF</small>${n[1]}</span><button class="gb" data-a="tab" data-id="${n[2]}">${n[3]} ›</button>`; }
  g.style.display=(view===n[2])?'none':'flex';
}
const _render0=render;
render=function(){ _render0.apply(this,arguments); try{ goalUpd(); }catch(e){} };
/* ---- écran de démarrage : son mécanique + sortie ---- */
(function(){
  const sp=document.getElementById('splash'); if(!sp) return; let played=false, gone=false;
  const bye=()=>{ if(gone) return; gone=true; sp.style.transition='opacity .3s'; sp.style.opacity='0'; setTimeout(()=>sp.remove(),320); };
  sp.addEventListener('pointerdown',()=>{ playS(); bye(); }); setTimeout(bye,3600);
  function playS(){
    if(played) return; try{ if(S&&S.audio&&S.audio.mute) return; }catch(_){}
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    try{ const c=new AC(); if(c.state==='suspended'){ c.resume(); } if(c.state==='suspended') return; played=true;
      const t=c.currentTime+.05, M=c.createGain(); M.gain.value=.5; M.connect(c.destination);
      const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.setValueAtTime(300,t); lp.frequency.exponentialRampToValueAtTime(2400,t+1.5); lp.connect(M);
      const o=c.createOscillator(), g=c.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(38,t); o.frequency.exponentialRampToValueAtTime(150,t+1.0); o.frequency.setValueAtTime(110,t+1.05); o.frequency.exponentialRampToValueAtTime(230,t+1.6);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.35,t+.4); g.gain.linearRampToValueAtTime(.3,t+1.5); g.gain.exponentialRampToValueAtTime(.001,t+2.2); o.connect(g); g.connect(lp); o.start(t); o.stop(t+2.3);
      const o2=c.createOscillator(), g2=c.createGain(); o2.type='square'; o2.frequency.setValueAtTime(19,t); o2.frequency.exponentialRampToValueAtTime(75,t+1.0); o2.frequency.setValueAtTime(55,t+1.05); o2.frequency.exponentialRampToValueAtTime(115,t+1.6); g2.gain.setValueAtTime(.0,t); g2.gain.linearRampToValueAtTime(.2,t+.5); g2.gain.exponentialRampToValueAtTime(.001,t+2); o2.connect(g2); g2.connect(lp); o2.start(t); o2.stop(t+2.1);
      /* cliquetis de pignons qui s'engrènent */
      for(let k=0;k<22;k++){ const tk=t+.05+k*(.07-k*.0016), cl=c.createOscillator(), cg=c.createGain(); cl.type='square'; cl.frequency.value=1500+(k%4)*420; cg.gain.setValueAtTime(.07,tk); cg.gain.exponentialRampToValueAtTime(.001,tk+.03); const hp=c.createBiquadFilter(); hp.type='bandpass'; hp.frequency.value=2400; hp.Q.value=2; cl.connect(cg); cg.connect(hp); hp.connect(M); cl.start(tk); cl.stop(tk+.04); }
      /* VOUF : souffle qui passe */
      const len=c.sampleRate*1.2, buf=c.createBuffer(1,len,c.sampleRate), d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
      const ns=c.createBufferSource(); ns.buffer=buf; const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=1.4; bp.frequency.setValueAtTime(250,t+1.45); bp.frequency.exponentialRampToValueAtTime(3800,t+1.95); bp.frequency.exponentialRampToValueAtTime(600,t+2.4);
      const ng=c.createGain(); ng.gain.setValueAtTime(0,t+1.45); ng.gain.linearRampToValueAtTime(.55,t+1.8); ng.gain.exponentialRampToValueAtTime(.001,t+2.5); ns.connect(bp); bp.connect(ng); ng.connect(M); ns.start(t+1.45); ns.stop(t+2.6);
      /* choc de logo */
      const b=c.createOscillator(), bg=c.createGain(); b.type='sine'; b.frequency.setValueAtTime(110,t+2.0); b.frequency.exponentialRampToValueAtTime(38,t+2.4); bg.gain.setValueAtTime(.5,t+2.0); bg.gain.exponentialRampToValueAtTime(.001,t+2.6); b.connect(bg); bg.connect(M); b.start(t+2.0); b.stop(t+2.7);
      setTimeout(()=>{ try{ c.close(); }catch(_){} },3500);
    }catch(e){}
  }
  playS(); /* si le navigateur l'autorise d'office */
})();
