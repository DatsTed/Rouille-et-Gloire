/* ===== v1.2 : paquets en carrousel unique + paquet Voiture + achat x1/x5/x10 ; missions clandestines ; contenu masqué aux mineurs ===== */
/* ---- 1. un seul carrousel : aléatoires, ciblés, voiture ---- */
delete PACKS.find; delete PACKS.findIndex;
Object.assign(PKT,{pcar:{c1:'#ffe27a',c2:'#c98a10',c3:'#2b1d00',emb:'🏎️',tag:'VOITURE'}});
['f1','f2','f3','f4','f6','f5'].forEach(id=>{ const p=FPACKS.find(x=>x.id===id); if(p&&!PACKS.some(x=>x.id===id)) PACKS.push(p); });
if(!PACKS.some(p=>p.id==='pcar')) PACKS.push({id:'pcar',nom:'Paquet Voiture',n:0,cr:50000,tok:50,boost:1,min:0,car:1,rand:0,d:'1 voiture au hasard. La meilleure voiture du jeu est possible, mais très, très rare.'});
const pkq=()=>{ const q=+S.pkq; return q===5||q===10?q:1; };
{ const _p3=pack3d; pack3d=function(p,i){ let h=_p3(p,i); if(p&&p.car) h=h.replace(/<div class="sb">0 modules<\/div>/g,'<div class="sb">1 voiture</div>').replace(/<span class="pips">.*?<\/span>/g,'<span class="pips"><i style="background:#ffd24a"></i><i style="background:#ff8a2b"></i><i style="background:#ff2bd6"></i></span>'); return h; };
  const _pa=pkArt; pkArt=function(p){ let h=_pa(p); if(p&&p.car) h=h.replace(/<div class="sb">0 modules<\/div>/g,'<div class="sb">1 voiture</div>').replace(/<span class="pips">.*?<\/span>/g,'<span class="pips"><i style="background:#ffd24a"></i><i style="background:#ff8a2b"></i><i style="background:#ff2bd6"></i></span>'); return h; }; }
packsHTML=function(){
  const ix=id=>Math.max(0,PACKS.findIndex(p=>p.id===id));
  const chips=[['rand','🎲 Aléatoires',ix('p1')],['fix','🎯 Ciblés',ix('f1')],['car','🚗 Voiture',ix('pcar')]].map(c=>`<button data-a="pkcat" data-id="${c[2]}" data-c="${c[0]}">${c[1]}</button>`).join('');
  return `<div class="pkcat" id="pkcat">${chips}</div><div class="pk3" id="pk3"><button class="pknav l" data-a="pkgo" data-id="-1" aria-label="Précédent">‹</button><div class="ring" id="pkring">${PACKS.map(pack3d).join('')}</div><div class="fl"></div><button class="pknav r" data-a="pkgo" data-id="1" aria-label="Suivant">›</button></div>
    <div class="dots" id="pkdots">${PACKS.map(()=>'<i></i>').join('')}</div><div class="pkInfo" id="pkInfo"></div>`;
};
ACT.pkcat=d=>{ PK.tgt=clamp(+d.id,0,PACKS.length-1); PK.arm=null; PK.shown=-1; try{ pkInfo(true); }catch(e){} };
ACT.pkq=d=>{ S.pkq=+d.id; try{ save(); }catch(e){} PK.shown=-1; PK.arm=null; try{ pkInfo(true); }catch(e){} };
function decorPk48(){
  const el=$('pkInfo'); if(!el||PK.arm) return; const i=clamp(Math.round(PK.drag?PK.pos:PK.tgt),0,PACKS.length-1), p=PACKS[i]; if(!p) return;
  const cat=document.getElementById('pkcat'); if(cat){ const ci=PACKS.findIndex(x=>x.slots), cj=PACKS.findIndex(x=>x.id==='pcar'); const cur=i>=cj?'car':i>=ci?'fix':'rand'; [...cat.children].forEach(b=>b.classList.toggle('on',b.dataset.c===cur)); }
  if(el.querySelector('.pkq')) return; const buy=el.querySelector('.buy'); if(!buy) return; const q=pkq();
  const row=document.createElement('div'); row.className='pkq'; row.innerHTML='<span>Quantité</span>'+[1,5,10].map(n=>`<button data-a="pkq" data-id="${n}" class="${n===q?'on':''}">×${n}</button>`).join(''); buy.parentNode.insertBefore(row,buy);
  const bc=buy.querySelector('button[data-k="cr"]'), bt=buy.querySelector('button[data-k="tok"]'), tc=p.cr*q, tt=p.tok*q;
  if(bc){ bc.dataset.q=q; bc.dataset.d38=1; bc.disabled=S.cr<tc; bc.innerHTML=(q>1?'Acheter ×'+q:'Déchirer')+' · 💰 '+fmt(tc); }
  if(bt){ if(!p.tok) bt.remove(); else{ bt.dataset.q=q; bt.dataset.d38=1; bt.disabled=S.tok<tt; bt.innerHTML='🎟 '+tt; } }
  const t=el.querySelector('.t span'); if(t&&p.car) t.textContent='1 voiture';
  const hint=el.querySelector('.note.sm'); if(hint&&q>1) hint.textContent='Achat groupé : les '+q+' paquets s’ouvrent d’un coup, sans déchirer.';
}
{ const _pki=pkInfo; pkInfo=function(force){ _pki.apply(this,arguments); try{ decorPk48(); }catch(e){ console.error(e); } }; }
/* choix du paiement (tap sur le paquet) : tient compte de la quantité */
function payChoice(id){ const p=PACKS.find(x=>x.id===id); if(!p||document.getElementById('pkpay')) return; const q=pkq(), tc=p.cr*q, tt=p.tok*q;
  const d=document.createElement('div'); d.id='pkpay'; const okC=S.cr>=tc, okT=p.tok&&S.tok>=tt;
  d.innerHTML='<div class="upd-c"><small>OUVRIR'+(q>1?' ×'+q:'')+'</small><h2>'+p.nom+'</h2><p class="tx-p">Tu as <b>'+fmt(S.cr)+' cr</b>'+(p.tok?' et <b>'+S.tok+' jeton'+(S.tok>1?'s':'')+'</b>':'')+'.</p>'+
   '<div class="tx-b"><button class="btn'+(okC?'':' alt')+'" id="ppC" '+(okC?'':'disabled')+'>💰 '+fmt(tc)+' cr</button>'+(p.tok?'<button class="btn'+(okT?'':' alt')+'" id="ppT" '+(okT?'':'disabled')+'>🎟 '+tt+' jeton'+(tt>1?'s':'')+'</button>':'')+'</div><button class="btn alt wide" id="ppX" style="margin-top:8px">Annuler</button></div>';
  document.body.appendChild(d); const go=k=>{ d.remove(); ACT.pack({id,k,q,explicit:1}); };
  d.querySelector('#ppC').onclick=()=>go('cr'); const T=d.querySelector('#ppT'); if(T) T.onclick=()=>go('tok'); d.querySelector('#ppX').onclick=()=>d.remove(); }
/* voiture : probabilités par tier (les 2 meilleures voitures ≈ 0,4 % chacune) */
const CPW={1:30,2:28,3:22,4:12,5:7.2,6:.8};
function carRoll(){ const w=CARS.map(c=>(CPW[c.t]||1)/CARS.filter(x=>x.t===c.t).length), tot=w.reduce((a,b)=>a+b,0); let x=Math.random()*tot; for(let i=0;i<CARS.length;i++){ x-=w[i]; if(x<0) return CARS[i]; } return CARS[0]; }
function openCarPack(k,q){
  const p=PACKS.find(x=>x.id==='pcar'), tk=k==='tok', tot=(tk?p.tok:p.cr)*q; if((tk?S.tok:S.cr)<tot) return toast(tk?'Pas assez de jetons':'Pas assez de crédits'); if(tk) S.tok-=tot; else S.cr-=tot;
  const got=[]; for(let j=0;j<q;j++){ const m=carRoll(), c={uid:S.nuid++,mid:m.id,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{},sh:Math.random()<.06?1:0}; S.cars.push(c); got.push(c.uid); }
  S.stats.carpack=(S.stats.carpack||0)+q; S.stats.packs=(S.stats.packs||0)+q; save(); render(); openSheet({t:'carpack',cars:got,rev:0,q,k:tk?'tok':'cr'});
}
function packMulti(id,k,q){
  const p=PACKS.find(x=>x.id===id); if(!p||document.getElementById('pkov')) return;
  const tot=k==='tok'?p.tok*q:p.cr*q; if(k==='tok'?(!p.tok||S.tok<tot):S.cr<tot) return toast('Pas assez pour ×'+q);
  if(p.car) return openCarPack(k,q);
  if(S.mods.length+p.n*q>invMax()) return toast('Inventaire plein : il faut de la place pour '+(p.n*q)+' modules');
  if(sheet) closeSheet(); if(k==='tok') S.tok-=tot; else S.cr-=tot;
  const got=[]; let carUid=null; PKF.slots=p.slots||null;
  try{ for(let j=0;j<q;j++){ for(let i=0;i<p.n;i++){ const m=newMod(rollRar(p.boost,i===p.n-1?p.min:0)); S.mods.push(m); got.push(m.u); }
      if(Math.random()<(CAR_P[id]||.0005)*(1+.1*pk('luck'))){ const m=carPrize(), c={uid:S.nuid++,mid:m.id,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{},sh:Math.random()<.06?1:0}; S.cars.push(c); S.stats.carpack=(S.stats.carpack||0)+1; if(!carUid) carUid=c.uid; } } }
  finally{ PKF.slots=null; }
  S.stats.packs=(S.stats.packs||0)+q; save(); render(); openSheet({t:'open',cards:got,i:0,pk:id,car:carUid,q}); ACT.revealall();
}
{ const _pk=ACT.pack; ACT.pack=function(d){ const q=+(d&&d.q)||1; if(d&&d.id&&q>1) return packMulti(d.id,d.k||'cr',q); return _pk.apply(this,arguments); }; }
{ const _op=openPack; openPack=function(id,cur){ if(id==='pcar') return openCarPack(cur,1); return _op.apply(this,arguments); }; }
/* fiche de résultat du paquet Voiture */
{ const _sx=sheetExtra; sheetExtra=function(X){
  if(sheet&&sheet.t==='carpack'){ const cs=sheet.cars.map(u=>car(u)).filter(Boolean), el=$('sheet');
    const best=cs.slice().sort((a,b)=>M[b.mid].t-M[a.mid].t||M[b.mid].val-M[a.mid].val)[0], bm=best&&M[best.mid];
    if(!sheet.rev){ el.innerHTML=`${X}<h2>Paquet Voiture${sheet.q>1?' ×'+sheet.q:''}</h2><div class="cpback"><span>🏎️</span><b>${sheet.q>1?sheet.q+' voitures':'1 voiture'}</b><small>Touche pour révéler</small></div><button class="btn wide" data-a="cpreveal">🎁 Révéler</button>`; return true; }
    const top=bm&&bm.t>=5;
    el.innerHTML=`${X}<h2>Paquet Voiture${sheet.q>1?' ×'+sheet.q:''}</h2>
      <div class="carwin ${top?'':'calm'}">${top?'<div class="cw-rays"></div><div class="cw-t">JACKPOT !</div>':''}<div class="cw-car" style="--t:${TIERS[bm.t].c}">${carSVG(bm,100)}</div><div class="cw-n">${bm.nom}${best.sh?' ✨ brillante':''}</div><p class="note">${bm.an} · ${bm.cat} · ${TIERS[bm.t].n}. Elle est dans ton garage.</p></div>
      ${cs.length>1?`<h3 class="rh">Toutes les voitures</h3><div class="grid">${cs.slice().sort((a,b)=>M[b.mid].t-M[a.mid].t).map(c=>cardHTML({mid:c.mid,etat:100,lvl:1,up:{}},{tag:'div'})).join('')}</div>`:''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><button class="btn alt" data-a="close">Fermer</button><button class="btn" data-a="pack" data-id="pcar" data-k="${sheet.k==='tok'?'tok':'cr'}" ${(sheet.k==='tok'?S.tok<50:S.cr<50000)?'disabled':''}>Encore un · ${sheet.k==='tok'?'🎟 50':cr(50000)}</button></div>`;
    return true; }
  return _sx.apply(this,arguments); }; }
ACT.cpreveal=()=>{ if(sheet&&sheet.t==='carpack'){ sheet.rev=1; try{ auTry(()=>auRip(0)); }catch(e){} renderSheet(); } };
{ const _rs=renderSheet; renderSheet=function(){ const r=_rs.apply(this,arguments); try{ if(sheet&&sheet.t==='open'&&sheet.q>1){ const h=$('sheet').querySelector('h2'); if(h&&!h.dataset.q){ h.dataset.q=1; h.textContent+=' ×'+sheet.q; } } }catch(e){} return r; }; }

/* ---- 2. mineurs : l'illégal est masqué ; adultes : missions clandestines ---- */
const isAdult=()=>S&&S.age18===true;
const illOK=()=>{ try{ return labLv()>=LAB_LVL; }catch(e){ return false; } };
{ const _u=unlFor; unlFor=function(l){ let o=_u.apply(this,arguments); if(!isAdult()) o=o.filter(x=>!/Labo clandestin|Ranch/.test(x[1])); return o; }; }
function syncAge48(){ try{ const a=LINES[0][2]; a.length=0; (isAdult()?['garage','atelier','ranch']:['garage']).forEach(x=>a.push(x)); }catch(e){} }
{ const _r=render; render=function(){ syncAge48(); return _r.apply(this,arguments); }; }
{ const _cs=closeSheet; closeSheet=function(){ if(sheet&&sheet.t==='age'&&sheet.st===2&&S.age18==null) return; return _cs.apply(this,arguments); }; }
const FS48=()=>{ const F=S.farm; return (F&&F.stats)||{}; };
const hiredIll=()=>{ try{ return team().hired.filter(e=>isIll(e.role)).length; }catch(e){ return 0; } };
const ILM=[
 ['i1','Première récolte : récolte 1 plante',s=>[FS48().harv||0,1],{cr:3000}],
 ['i2','Main verte : récolte 10 plantes',s=>[FS48().harv||0,10],{cr:8000}],
 ['i3','Grosse production : récolte 40 plantes',s=>[FS48().harv||0,40],{cr:25000,tok:3}],
 ['i4','Labo niveau 3',s=>[labL(),3],{cr:10000}],
 ['i5','Labo niveau 6',s=>[labL(),6],{cr:40000,tok:5}],
 ['i6','Premier client : vends 25 g',s=>[Math.floor(FS48().sold||0),25],{cr:4000}],
 ['i7','Revendeur : vends 300 g',s=>[Math.floor(FS48().sold||0),300],{cr:15000}],
 ['i8','Baron local : vends 2 000 g',s=>[Math.floor(FS48().sold||0),2000],{cr:60000,tok:5}],
 ['i9','Première livraison clandestine',s=>[FS48().deliv||0,1],{cr:5000}],
 ['i10','Chauffeur de nuit : 10 livraisons réussies',s=>[FS48().deliv||0,10],{cr:30000,tok:3}],
 ['i11','Réputation de rue : atteins 10 de réputation',s=>[Math.floor((s.farm&&s.farm.rep)||0),10],{cr:6000}],
 ['i12','Un nom qui circule : atteins 40 de réputation',s=>[Math.floor((s.farm&&s.farm.rep)||0),40],{cr:25000}],
 ['i13','Sous pression : survis à une descente de police',s=>[FS48().raids||0,1],{cr:8000}],
 ['i14','Équipe de l’ombre : engage un employé clandestin',s=>[hiredIll(),1],{cr:12000}]
];
ILM.forEach(m=>{ if(MISSIONS.some(x=>x.id===m[0])) return; const g=m[3]; g.xp=rxp(g.cr||(g.tok||0)*300||200); MISSIONS.push({id:m[0],t:m[1],p:s=>illOK()?m[2](s):[0,1],g,ill:1}); MCAT[m[0]]='Clandestin'; });
MISSIONS.forEach(m=>{ if(/^l[1-5]$/.test(m.id)&&!m.ill){ m.ill=1; const f=m.p; m.p=s=>illOK()?f(s):[0,1]; } });
const missVis=m=>!m.ill||illOK();
vMissions=function(){
  questsEnsure();
  const can=S.daily!==dayKey(), dr=dailyReward();
  const qRow=(box,key,L,id)=>{ const q=L.find(x=>x.id===id), a=Math.min(qProg(box,q),q.n), done=a>=q.n, got=box.cl[id], g=qRew(q);
    return `<div class="row ${got?'done locked':''}"><span class="grow"><span class="ttl">${q.t}</span><br><span class="sub">Récompense : ${gText(g)}</span>${got?'':`<div class="prog"><i style="width:${a/q.n*100}%"></i></div>`}</span>
      ${got?'<span class="sub">Terminé</span>':done?`<button class="btn sm good" data-a="qclaim" data-k="${key}" data-id="${id}">Récupérer</button>`:`<span class="num">${fmt(a)} / ${fmt(q.n)}</span>`}</div>`; };
  const mRow=m=>{ const [a,b]=m.p(S), done=a>=b, got=S.claimed[m.id];
    return `<div class="row ${got?'done locked':''}"><span class="grow"><span class="ttl">${m.t}</span><br><span class="sub">Récompense : ${gText(m.g)}</span>
      ${got?'':`<div class="prog"><i style="width:${clamp(a/b*100,0,100)}%"></i></div>`}</span>
      ${got?'<span class="sub">Terminée</span>':done?`<button class="btn sm good" data-a="claim" data-id="${m.id}">Récupérer</button>`:`<span class="num">${fmt(Math.min(a,b))} / ${fmt(b)}</span>`}</div>`; };
  const cats=['Débuts','Course','Cartes','Collection','Économie','Progression'].concat(illOK()?['Légal','Clandestin']:[]);
  const left=MISSIONS.filter(m=>missVis(m)&&!S.claimed[m.id]).length;
  return `<div class="head"><h2>Missions</h2><p>${left} objectif${left>1?'s':''} restant${left>1?'s':''}</p></div>
  <div class="row ${can?'':'locked'}"><span class="ico">🎁</span><span class="grow"><span class="ttl">Récompense du jour</span><br><span class="sub">${cr(dr.cr)} et ${dr.tok} 🎟. Série en cours : ${S.streak||0} jour${(S.streak||0)>1?'s':''}. Un bonus tous les 7 jours.</span></span>${can?`<button class="btn sm good" data-a="daily">Récupérer</button>`:'<span class="sub">Reviens demain</span>'}</div>
  <div class="sec"><h3>Défis du jour</h3>${S.dq.ids.map(id=>qRow(S.dq,'dq',DQ,id)).join('')}</div>
  <div class="sec"><h3>Défis de la semaine</h3>${S.wq.ids.map(id=>qRow(S.wq,'wq',WQ,id)).join('')}</div>
  ${cats.map(ct=>{ const ms=MISSIONS.filter(m=>missVis(m)&&(MCAT[m.id]||'Débuts')===ct).sort((a,b)=>(S.claimed[a.id]?1:0)-(S.claimed[b.id]?1:0)); return ms.length?`<div class="sec"><h3>${ct==='Clandestin'?'🕶️ Clandestin':ct}</h3>${ms.map(mRow).join('')}</div>`:''; }).join('')}`;
};
