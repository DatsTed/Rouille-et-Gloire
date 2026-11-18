/* ===== v0.54 : circuits arcade (objets façon kart) + police belge & karma ===== */
const MKI={turbo:['🚀','Turbo'],shield:['🛡️','Bouclier'],missile:['🎯','Missile'],oil:['🛢️','Huile'],storm:['⚡','Éclair']};
[{id:'k1',nom:'🎮 Coupe Arcade : La Source',lvl:10,gain:26000,xp:520,opp:{t:[4,5],up:2,etat:[90,100]},manches:[{d:'circuit',m:'sec',sp:'s1',mk:1},{d:'circuit',m:'pluie',sp:'s2',mk:1}],di:9},
 {id:'k2',nom:'🎮 Grand Prix Arcade : Kemmel',lvl:13,gain:48000,xp:760,opp:{t:[5,5],up:3,etat:[95,100]},manches:[{d:'circuit',m:'sec',sp:'s2',mk:1},{d:'circuit',m:'sec',sp:'s3',mk:1},{d:'circuit',m:'pluie',sp:'s4',mk:1}],di:11},
 {id:'k3',nom:'🎮 Super Coupe Arcade : Spa complet',lvl:16,gain:90000,xp:1100,opp:{t:[5,6],up:3,etat:[100,100]},manches:[{d:'circuit',m:'sec',sp:'s1',mk:1},{d:'circuit',m:'sec',sp:'s3',mk:1},{d:'circuit',m:'sec',sp:'s4',mk:1}],di:12}
].forEach(e=>{ if(!EVENTS.some(x=>x.id===e.id)) EVENTS.push(e); });
EVENTS.sort((a,b)=>a.lvl-b.lvl);
const _ss30=startSpa;
startSpa=function(i){
  _ss30.apply(this,arguments);
  try{
    const mn=R.ev.manches[i];
    if(mn.mk) mkInit();
    if(R.polChase||(karma()<=-25&&Math.random()<.35)) polInit();
  }catch(e){ try{console.warn(e);}catch(_){} }
};
function mkInit(){
  const st=RC.stage, M30={bx:[],oil:[],t:0}; RC.mk=M30;
  for(let s=st.a+170;s<st.b-120;s+=250){
    const f=frameAt(s), g=new THREE.Group();
    const bar=new THREE.Mesh(new THREE.BoxGeometry(.35,.9,13),new THREE.MeshBasicMaterial({color:0xffcc00,transparent:true,opacity:.55,depthWrite:false}));
    bar.position.y=3; g.add(bar);
    [-6.6,6.6].forEach(z=>{ const p=new THREE.Mesh(new THREE.BoxGeometry(.4,3.4,.4),new THREE.MeshBasicMaterial({color:0xff7a00})); p.position.set(0,1.7,z); g.add(p); });
    g.position.set(f.x,f.y,f.z); g.rotation.y=-f.th; RS.scene.add(g);
    M30.bx.push({s:wrapS(s),cd:{},g,bar});
  }
  RC.P.mkItem=null; flash('🎮 Mode arcade : traverse les portiques jaunes pour piocher un objet','#FFD400',2.6);
}
function mkRoll(rank,n){
  const w=rank===0?{oil:3,shield:3,turbo:1,missile:1}:rank>=n-2?{turbo:3,storm:2,missile:2,shield:1}:{turbo:2,missile:3,shield:2,oil:2,storm:1};
  const ks=Object.keys(w); let t=ks.reduce((a,k)=>a+w[k],0)*Math.random();
  for(const k of ks){ t-=w[k]; if(t<=0) return k; } return ks[0];
}
function mkUse(c){
  const it=c.mkItem; if(!it) return; c.mkItem=null; const M30=RC.mk, P=RC.P;
  const order=RC.all.slice().sort((a,b)=>b.prog-a.prog), idx=order.indexOf(c);
  const hit=(t,txt)=>{ if(!t) return; if(t.mkSh>0){ t.mkSh=0; if(t===P) flash('🛡️ Bouclier utilisé !','#46e08a',1.2); return; } t.mkSlow=1.8; if(t===P) flash(txt,'#ff4d6d',1.4); };
  if(it==='turbo'){ c.nitroT=Math.max(c.nitroT,2.4); if(c===P) flash('🚀 Turbo !','#00E5FF',1); }
  else if(it==='shield'){ c.mkSh=8; if(c===P) flash('🛡️ Bouclier actif 8 s','#46e08a',1.2); }
  else if(it==='missile'){ const t=order[idx-1]; if(c===P) flash(t?'🎯 Missile lancé !':'🎯 Personne devant…','#FFD400',1); hit(t,'🎯 Touché par un missile !'); }
  else if(it==='oil'){
    const s=wrapS(c.s-14), f=frameAt(s), m=new THREE.Mesh(new THREE.CircleGeometry(2.4,18),new THREE.MeshBasicMaterial({color:0x07070a,transparent:true,opacity:.85,depthWrite:false}));
    m.rotation.x=-Math.PI/2; m.position.set(f.x,f.y+.06,f.z); RS.scene.add(m); M30.oil.push({s,t:30,by:c,m}); if(c===P) flash('🛢️ Huile lâchée derrière toi','#c084fc',1);
  } else if(it==='storm'){ RC.all.forEach(o=>{ if(o!==c) hit(o,'⚡ Éclair ! Tu es ralenti'); }); if(c===P) flash('⚡ Éclair sur tout le monde !','#FFD400',1.2); }
}
ACT.mkuse=()=>{ if(RC&&RC.mk&&RC.P.mkItem&&!RC.done) mkUse(RC.P); };
function mkTick(h){
  const M30=RC.mk, P=RC.P, all=RC.all; M30.t+=h;
  const order=all.slice().sort((a,b)=>b.prog-a.prog);
  all.forEach(c=>{
    if(c.fin!=null) return;
    if(c.mkSlow>0){ c.mkSlow-=h; const f=Math.exp(-.9*h); c.vx*=f; c.vz*=f; }
    if(c.mkSh>0) c.mkSh-=h;
    if(!c.mkItem) M30.bx.forEach(b=>{ if((b.cd[c.s>-1?all.indexOf(c):0]||0)>M30.t) return; if(Math.abs(dS(b.s,c.s))<7){ b.cd[all.indexOf(c)]=M30.t+12; c.mkItem=mkRoll(order.indexOf(c),all.length); c.mkT=rnd(1.2,4);
      if(c===P){ flash(MKI[c.mkItem][0]+' '+MKI[c.mkItem][1]+' : touche le bouton','#FFD400',1.4); try{ ui('up'); }catch(_){} } } });
    else if(c!==P&&(c.mkT-=h)<=0) mkUse(c);
    M30.oil.forEach(o=>{ if(o.by!==c&&o.t>0&&Math.abs(dS(o.s,c.s))<4&&!((c.mkHit||0)>M30.t)){ c.mkHit=M30.t+3; if(c.mkSh>0){ c.mkSh=0; } else{ c.mkSlow=1.4; if(c===P) flash('🛢️ Dérapage sur l’huile !','#c084fc',1.2); } } });
  });
  M30.oil.forEach(o=>{ o.t-=h; if(o.t<=0&&o.m){ o.m.visible=false; } });
  M30.bx.forEach(b=>{ b.bar.rotation.x+=h*1.5; });
}
/* ---- police belge ---- */
function polInit(){
  if(!MODELS.patrouille) return;
  const cr=buildCar(M.patrouille,'#2f6bff',{}); RS.scene.add(cr.g); RC.pc2={cr,gap:42,close:0}; R.polSpa=1;
  flash('🚨 Une patrouille belge te colle derrière !','#2f6bff',2.4);
}
function polTick(h){
  const p=RC.pc2, P=RC.P; if(P.fin!=null){ p.cr.g.visible=false; return; }
  if(P.prog>120) p.gap=clamp(p.gap-(52-P.v)*h*.12,4,80);
  p.close=p.gap<7?p.close+h:Math.max(0,p.close-h*.5);
  if(p.close>2.5){ p.close=0; p.gap=60; P.timePen=(P.timePen||0)+8; const fine=Math.max(200,Math.round(S.cr*.03)); S.cr=Math.max(0,S.cr-fine); karmaAdd(-1); R.polCaught=1; flash('🚨 Interpellé ! +8 s et '+fmt(fine)+' cr d’amende','#ff4d6d',2.4); }
  const s=wrapS(P.s-p.gap), f=frameAt(s), w=Math.sin(RC.clock*.7)*1.6;
  p.cr.g.position.set(f.x-f.nx*w,f.y,f.z-f.nz*w); p.cr.g.rotation.y=-f.th; p.cr.g.visible=true;
}
const _ts30=tickSpa;
tickSpa=function(h){ _ts30.apply(this,arguments); try{ if(RC&&RC.kind==='spa'&&!RC.done&&RC.clock>0){ if(RC.mk) mkTick(h); if(RC.pc2) polTick(h); } }catch(e){} };
const _ds30=drawSpa;
drawSpa=function(dt,time){ _ds30.apply(this,arguments); try{ if(RC&&RC.pc2) pulseSirens(RC.pc2.cr,time||0); }catch(e){} };
const _hs30=hudSpa;
hudSpa=function(){
  _hs30.apply(this,arguments);
  try{ const root=document.querySelector('.race'); if(!root||!RC) return;
    if(RC.mk){ let b=$('mkIt'); if(!b){ b=document.createElement('button'); b.id='mkIt'; b.className='mkit'; b.setAttribute('data-a','mkuse'); root.appendChild(b); }
      const it=RC.P.mkItem, k=it?MKI[it]:null, html=k?k[0]+'<small>'+k[1]+'</small>':'<small>Objet</small>';
      if(b.dataset.h!==html){ b.dataset.h=html; b.innerHTML=html; } b.classList.toggle('has',!!it); }
    if(RC.pc2){ let g=$('polg'); if(!g){ g=document.createElement('div'); g.id='polg'; g.className='polg'; root.appendChild(g); } g.textContent='🚨 '+Math.round(RC.pc2.gap)+' m'+(RC.pc2.close>0?' !':''); g.classList.toggle('hot',RC.pc2.gap<14); }
  }catch(e){}
};
/* ---- scène de contrôle avant une épreuve légale quand le karma est négatif ---- */
const polFine=()=>Math.max(300,Math.round(S.cr*.05));
const _go30=ACT.go;
ACT.go=function(d){
  const ev=R&&R.ev;
  if(ev&&!ev.ill&&!R.polDone){
    if((S.polUntil||0)>Date.now()) return toast('🚔 Immobilisé par la police encore '+Math.ceil((S.polUntil-Date.now())/1000)+' s');
    const k=karma();
    if(k<=-10&&Math.random()<Math.min(.55,-k/160+.1)){ R.polDone=1; R.polD=d; openSheet({t:'pol'}); return; }
  }
  return _go30.apply(this,arguments);
};
function polSheet(X){
  if(!sheet||sheet.t!=='pol') return false;
  const f=polFine();
  $('sheet').innerHTML=`<div class="tuto gtu">${X}<div class="tu-ic">🚔</div><h2>Contrôle de police</h2>
   <p>Un gyrophare bleu dans ton rétro. Un agent de la police belge te fait signe de te ranger : « Bonjour. Votre réputation vous précède… Papiers, s’il vous plaît. »</p>
   <p class="note">Karma actuel : ${Math.round(karma())}. Payer ou patienter le fait remonter.</p>
   <div class="tu-btns col"><button class="btn" data-a="polpay">💶 Payer l’amende (${fmt(f)} cr, karma +3)</button>
   <button class="btn alt" data-a="polwait">⏳ Attendre 90 s (karma +3, épreuves bloquées)</button>
   <button class="btn alt" data-a="poldon">🤝 Faire un don de 1 500 cr (karma +3, tu repars)</button>
   <button class="btn bad" data-a="polrun">🏎️ Foncer et courir quand même</button></div></div>`;
  return true;
}
ACT.polpay=()=>{ const f=polFine(); if(S.cr<f) return toast('Pas assez de crédits'); S.cr-=f; karmaAdd(3); S.stats.polPay=(S.stats.polPay||0)+1; closeSheet(); toast('🚔 Amende payée, bonne route'); save(); ACT.go(R.polD); };
ACT.polwait=()=>{ S.polUntil=Date.now()+90000; karmaAdd(3); S.stats.polPay=(S.stats.polPay||0)+1; closeSheet(); toast('⏳ Tu patientes 90 s sur le bas-côté…'); save(); };
ACT.poldon=()=>{ if(S.cr<1500) return toast('Pas assez de crédits'); S.cr-=1500; karmaAdd(3); S.stats.don=(S.stats.don||0)+1; closeSheet(); toast('🤝 Merci pour ton geste'); save(); ACT.go(R.polD); };
ACT.polrun=()=>{ R.polChase=1; closeSheet(); ACT.go(R.polD); };
const _don30=ACT.rdon; if(_don30) ACT.rdon=function(){ const c0=S.cr; const r=_don30.apply(this,arguments); if(S.cr<c0) S.stats.don=(S.stats.don||0)+1; return r; };
const _fin30=finalize;
finalize=function(forfeit){
  try{ if(R&&R.polChase&&!R.polSpa&&!R.polAcct){ R.polAcct=1; const fine=Math.round(S.cr*.06); S.cr-=fine; karmaAdd(-2); toast('🚨 Poursuivi par la police : '+fmt(fine)+' cr d’amende'); }
       if(R&&R.ev&&R.ev.manches.some(m=>m.mk)&&!forfeit) S.stats.mkN=(S.stats.mkN||0)+1; }catch(e){}
  return _fin30.apply(this,arguments);
};
/* ---- interception de la police pendant les livraisons clandestines ---- */
const _ir30=illResolve;
illResolve=function(ev,pay,win,pod){
  try{ if(ev&&ev.ill&&(pod||win)){ const F=farm(), heat=Math.max(F.heat.atelier,F.heat.ranch), p=clamp(.07+heat/260+Math.max(0,-karma())/320,0,.5);
    if(Math.random()<p){ toast('🚔 La police belge t’intercepte en route : livraison ratée !'); pod=false; win=false; } } }catch(e){}
  return _ir30.call(this,ev,pay,win,pod);
};
/* ---- succès côté légal ---- */
[['l1','Légal','Citoyen modèle : atteins +25 de karma',s=>[Math.max(0,Math.round(karma())),25],{cr:5000}],
 ['l2','Légal','Saint de la route : atteins +60 de karma',s=>[Math.max(0,Math.round(karma())),60],{cr:20000,tok:5}],
 ['l3','Légal','Donateur : fais 3 dons',s=>[s.stats.don||0,3],{cr:3000}],
 ['l4','Légal','Respect de la loi : règle 3 contrôles de police',s=>[s.stats.polPay||0,3],{cr:2500}],
 ['l5','Légal','Pilote arcade : termine une coupe arcade',s=>[s.stats.mkN||0,1],{cr:6000,tok:3}]
].forEach(m=>{ if(!MISSIONS.some(x=>x.id===m[0])){ MISSIONS.push({id:m[0],t:m[2],p:m[3],g:m[4]}); MCAT[m[0]]=m[1]; } });
