/* ---- v0.63 : onglets Atelier et Équipe, flèches de fiche, tutos de menus ---- */
if(!TABS.some(t=>t[0]==='atelier')){ const i=TABS.findIndex(t=>t[0]==='epreuves'); TABS.splice(i+1,0,['atelier','🛠️','Atelier'],['equipe','👥','Équipe']); }
const TUTX={
 atelier:{t:'🛠️ L’Atelier',p:[
  ['♻️ Recycler','Un module dont tu n’as plus besoin devient de la <b>ferraille</b>. Plus il est rare, plus il en donne.'],
  ['🔨 Fabriquer','Avec la ferraille, tu choisis la <b>rareté</b> puis l’<b>emplacement</b> (moteur, turbo, pneus…). Le modèle exact reste aléatoire.'],
  ['✨ Fusionner','5 modules de même rareté, non montés, donnent <b>1 module de la rareté au-dessus</b>. Les brillants, uniques et modules montés sont protégés.']]},
 equipe:{t:'👥 Ton équipe',p:[
  ['Des employés qui bossent pour toi','Mécano, jardinier, pilote, vendeur, gardien : ils travaillent même quand tu ne joues pas (jusqu’à 6 h) et touchent un salaire par heure.'],
  ['Énergie et loyauté','Un employé fatigué rend moins. Offre-lui du <b>repos</b>, une <b>augmentation</b>, et il s’attachera à toi.'],
  ['Les places','Une place légale de plus tous les 3 niveaux. Avec le labo et la majorité, des places <b>clandestines</b> s’ajoutent.']]},
 garage:{t:'🚗 Ton garage',p:[['Voitures et podiums','Touche une voiture pour la réparer, l’équiper ou l’améliorer. Les <b>podiums</b> exposent tes plus belles voitures et rapportent des crédits : utilise « Meilleures » pour les placer d’un coup.']]},
 epreuves:{t:'🏁 Épreuves',p:[['Courses et gains','Choisis une épreuve, une voiture adaptée à la discipline, puis pilote. Gagner rapporte crédits, expérience et parfois des jetons.']]},
 cartes:{t:'🃏 Cartes',p:[['Paquets et modules','Ouvre des paquets (crédits ou jetons) pour obtenir des <b>modules</b> à monter sur tes voitures. Swipe pour passer d’une carte à l’autre. Recyclage, fabrication et fusion sont dans l’<b>Atelier</b>.']]},
 marche:{t:'🛒 Marché',p:[['Acheter et vendre','Voitures, pièces du jour et services. Le stock change chaque jour.']]},
 base:{t:'🏗️ Base',p:[['Tes bâtiments','Améliore tes bâtiments pour de meilleurs bonus : entrepôt, atelier, showroom et plus.']]},
 missions:{t:'📜 Missions',p:[['Objectifs et récompenses','Complète des missions pour gagner crédits, nitro et jetons. Touche une mission terminée pour récupérer sa récompense.']]}};
function showTutx(key,force){ const T=TUTX[key]; if(!T||document.getElementById('tx')) return; let i=0; const d=document.createElement('div'); d.id='tx';
  const draw=()=>{ const p=T.p[i], last=i===T.p.length-1; d.innerHTML='<div class="upd-c"><small>TUTO'+(T.p.length>1?' · '+(i+1)+' / '+T.p.length:'')+'</small><h2>'+T.t+'</h2><h3 class="tx-h">'+p[0]+'</h3><p class="tx-p">'+p[1]+'</p><div class="tx-b">'+(last?'':'<button class="btn alt" id="txSk">Passer</button>')+'<button class="btn" id="txGo">'+(last?'Compris':'Suivant')+'</button></div></div>';
    d.querySelector('#txGo').onclick=()=>{ if(last){ d.remove(); try{ (S.tx=S.tx||{})[key]=1; save(); }catch(e){} } else { i++; draw(); } };
    const sk=d.querySelector('#txSk'); if(sk) sk.onclick=()=>{ d.remove(); try{ (S.tx=S.tx||{})[key]=1; save(); }catch(e){} }; };
  draw(); document.body.appendChild(d); }
ACT.tutx=d=>{ showTutx(d.id==='view'?view:d.id,true); };
setInterval(()=>{ try{ if(!S||!S.intro||sheet||!TUTX[view]||(S.tx&&S.tx[view])) return; if(['tx','upd','cine','arcov'].some(i=>document.getElementById(i))) return;
  if(!['atelier','equipe'].includes(view)&&S.lvl>4){ (S.tx=S.tx||{})[view]=1; return; } showTutx(view); }catch(e){} },1200);
/* ---------- Atelier ---------- */
let AT={tab:'fab',r:0,s:null,cf:null};
const atFree=()=>S.mods.filter(m=>!eqCar(m.u)&&!m.sh&&m.un==null);
function vAtelier(){
  const free=atFree(), tabs=`<div class="subtabs">${[['fab','🔨 Fabriquer'],['rec','♻️ Recycler'],['fus','✨ Fusionner']].map(([id,n])=>`<button data-a="attab" data-id="${id}" ${AT.tab===id?'aria-current="true"':''}>${n}</button>`).join('')}</div>`;
  const head=`<div class="head"><h2>🛠️ Atelier</h2><p><button class="hq" data-a="tutx" data-id="atelier">?</button></p></div>
   <div class="x-stats"><div><small>Ferraille</small><b>♻️ ${fmt(S.scrap)}</b></div><div><small>Modules</small><b>📦 ${S.mods.length} / ${invMax()}</b></div><div><small>Libres</small><b>${free.length}</b></div></div>`;
  let body='';
  if(AT.tab==='fab'){
    const r=AT.r, cost=craftCost(r), ok=S.scrap>=cost, sl=AT.s&&SLOTS.find(s=>s[0]===AT.s);
    body=`<p class="x-h">① Choisis la rareté</p><div class="x-rar">${RAR.slice(0,5).map((x,i)=>`<button class="${i===r?'on':''} ${S.scrap<craftCost(i)?'dim':''}" data-a="atr" data-id="${i}" style="--c:${x.c}"><b>${x.n}</b><small>${craftCost(i)} ♻️</small></button>`).join('')}</div>
      <p class="x-h">② Choisis l’emplacement</p><div class="x-slots">${SLOTS.map(s=>`<button class="${AT.s===s[0]?'on':''}" data-a="atslot" data-id="${s[0]}"><b>${s[2]}</b><span>${s[1]}</span></button>`).join('')}</div>
      <div class="x-go"><div><b>${sl?RAR[r].n+' · '+sl[1]:'Choisis un emplacement'}</b><small>Coût ${cost} ♻️ · il t’en reste ${fmt(Math.max(0,S.scrap-cost))}${ok?'':' (il t’en manque '+(cost-S.scrap)+')'}</small></div><button class="btn" data-a="atcraft" ${sl&&ok&&S.mods.length<invMax()?'':'disabled'}>Fabriquer</button></div>
      ${ok?'':'<p class="note">Pas assez de ferraille : recycle des modules dans l’onglet Recycler.</p>'}`;
  } else if(AT.tab==='rec'){
    const rows=RAR.slice(0,6).map((x,i)=>{ const k=free.filter(m=>m.r===i), y=Math.round(k.length*x.sc*scrapK()); return `<div class="x-row" style="--c:${x.c}"><i></i><div class="grow"><b>${x.n}</b><small>${k.length} module${k.length>1?'s':''} libre${k.length>1?'s':''} · +${y} ♻️</small></div><button class="btn sm ${AT.cf===i?'':'alt'}" data-a="atrec" data-id="${i}" ${k.length?'':'disabled'}>${AT.cf===i?'Confirmer ?':'Tout recycler'}</button></div>`; }).join('');
    body=`<p class="note">Seuls les modules <b>non montés</b>, non brillants et non uniques sont recyclables. Les Rares et au-dessus demandent une confirmation.</p>${rows}<button class="btn alt wide" style="margin-top:10px" data-a="atinv">Voir mes modules un par un</button>`;
  } else {
    const rows=RAR.slice(0,6).map((x,i)=>{ const n=free.filter(m=>m.r===i).length, nx=RAR[i+1]; return `<div class="x-row fu" style="--c:${nx.c}"><div class="grow"><b>5 ${x.n} → 1 <span style="color:${nx.c}">${nx.n}</span></b><div class="x-bar"><i style="width:${Math.min(100,n/5*100)}%;background:${x.c}"></i></div><small>${n} / 5 modules libres</small></div><button class="btn sm" data-a="fuse" data-id="${i}" ${n>=5?'':'disabled'}>${n>=5?'Fusionner':'Encore '+(5-n)}</button></div>`; }).join('');
    body=`<p class="note">Les 5 modules de plus faible qualité sont utilisés. Brillants, uniques et modules montés sont protégés.</p>${rows}`; }
  return head+tabs+body;
}
Object.assign(ACT,{
  attab(d){ AT.tab=d.id; AT.cf=null; render(); }, atr(d){ AT.r=+d.id; render(); }, atslot(d){ AT.s=d.id; render(); },
  atcraft(){ const r=AT.r, cost=craftCost(r); if(!AT.s||S.scrap<cost) return; if(S.mods.length>=invMax()) return toast('Inventaire plein : recycle ou fusionne'); S.scrap-=cost; const m=newMod(r,AT.s,true); S.mods.push(m); save(); render(); openSheet({t:'open',cards:[m.u],i:0,pk:'p1'}); },
  atrec(d){ const r=+d.id, k=atFree().filter(m=>m.r===r); if(!k.length) return; if(r>=2&&AT.cf!==r){ AT.cf=r; toast('Touche encore pour confirmer'); render(); return; }
    const y=Math.round(k.length*RAR[r].sc*scrapK()); S.scrap+=y; try{ bump('recyN',k.length); }catch(e){} S.mods=S.mods.filter(m=>!k.includes(m)); AT.cf=null; toast(k.length+' modules recyclés · +'+y+' ♻️'); save(); render(); },
  atinv(){ cTab='inv'; ACT.tab({id:'cartes'}); } });
/* ---------- Équipe ---------- */
let EQ={tab:'team'};
function empCard(e){ const R=ROLES[e.role], T=TRAITS[e.tr]; const bars=(l,v,c)=>`<div class="x-mb"><span>${l}</span><div><i style="width:${Math.round(Math.max(0,Math.min(100,v)))}%;background:${c}"></i></div><b>${Math.round(v)}</b></div>`;
  const raise=Math.round(e.wage*.1/5)*5||5;
  return `<div class="x-emp ${R.ill?'ill':''}"><div class="x-eh">${faceSVG(e,46)}<div class="grow"><b>${e.nom}</b><span class="chip">${R.ic} ${R.n}</span>${R.ill?'<span class="chip ill">clandestin</span>':''}<small>${T.n}</small></div><div class="x-w"><b>${fmt(e.wage)}</b><small>cr/h</small></div></div>
   <div class="x-bars">${bars('⚡',e.en,e.en<25?'#ff6a3d':'#FCEE0A')}${bars('❤️',e.lo,'#ff2bd6')}</div>
   <small class="x-st">${e.rest>0?'😴 Repos encore '+Math.ceil(e.rest)+' min':R.d} · Total ${fmt(Math.round(e.out||0))} ${R.unit}</small><p class="x-q">« ${quoteOf(e)} »</p>
   <div class="x-ac"><button data-a="erest" data-id="${e.id}" ${e.rest>0?'disabled':''}>😴 Repos</button><button data-a="eraise" data-id="${e.id}" ${S.cr<raise*10?'disabled':''}>💶 +${raise}</button><button class="bad" data-a="efire" data-id="${e.id}">Licencier</button></div></div>`; }
function candCard(c){ const R=ROLES[c.role], T=TRAITS[c.tr], fee=c.wage*3; CAPR=c.role; const full=team().hired.length>=teamCap(); CAPR=null;
  return `<div class="x-emp ${R.ill?'ill':''}"><div class="x-eh">${faceSVG(c,46)}<div class="grow"><b>${c.nom}</b><span class="chip">${R.ic} ${R.n}</span>${R.ill?'<span class="chip ill">clandestin</span>':''}<small>${T.n} · ${T.d}</small></div><div class="x-w"><b>${fmt(c.wage)}</b><small>cr/h</small></div></div>
   <small class="x-st">${R.d}</small><div class="x-bars">${sb('Compétence',c.sk*10,'#3CFF9E',c.sk+'/10')}${sb('Endurance',c.end*10,'#00E5FF',c.end+'/10')}</div>
   <button class="btn wide" data-a="ehire" data-id="${c.id}" ${full||S.cr<fee?'disabled':''}>${full?'Plus de place':'Embaucher · '+fmt(fee)+' cr'}</button></div>`; }
function vEquipe(){ const T=team(); refreshCands(); try{ empTick(); }catch(e){}
  const L=T.hired.filter(e=>!isIll(e.role)), I=T.hired.filter(e=>isIll(e.role)), wages=T.hired.reduce((a,e)=>a+e.wage,0), en=T.hired.length?Math.round(T.hired.reduce((a,e)=>a+e.en,0)/T.hired.length):0;
  const head=`<div class="head"><h2>👥 Équipe</h2><p><button class="hq" data-a="tutx" data-id="equipe">?</button></p></div>
   <div class="x-stats"><div><small>Légal</small><b>${L.length} / ${legalCap()}</b></div>${illOpen()?`<div><small>Clandestin</small><b>🕶️ ${I.length} / ${illCap()}</b></div>`:''}<div><small>Salaires</small><b>${fmt(wages)} /h</b></div><div><small>Énergie</small><b>⚡ ${en} %</b></div></div>
   <div class="subtabs">${[['team','Mon équipe ('+T.hired.length+')'],['rec','Recruter']].map(([id,n])=>`<button data-a="eqtab" data-id="${id}" ${EQ.tab===id?'aria-current="true"':''}>${n}</button>`).join('')}</div>`;
  let body='';
  if(EQ.tab==='team'){
    body=T.hired.length?(L.length?`<p class="x-h">🏢 Équipe légale</p>${L.map(empCard).join('')}`:'')+(I.length?`<p class="x-h">🕶️ Équipe clandestine</p>${I.map(empCard).join('')}`:''):`<div class="x-empty"><b>Personne ne travaille pour toi.</b><small>Un employé gagne des crédits et du temps même quand tu es absent.</small><button class="btn" data-a="eqtab" data-id="rec">Recruter</button></div>`;
    if(!illOpen()&&S.lvl>=6&&S.age18===true) body+=`<p class="note">🕶️ Équipe clandestine : s’ouvre avec le labo (niveau ${LAB_LVL}, majeur).</p>`;
  } else {
    const mins=Math.max(0,15-Math.floor((Date.now()-T.candT)/60000));
    body=`<p class="note">Candidats renouvelés dans ${mins} min.${illOpen()?' Des profils clandestins apparaissent avec le niveau de ton labo.':''}</p>${T.cand.map(candCard).join('')}<button class="btn alt wide" data-a="ecand">🔄 Nouveaux candidats · 300 cr</button>`; }
  return head+body; }
Object.assign(ACT,{ eqtab(d){ EQ.tab=d.id; render(); }, equipe(){ ACT.tab({id:'equipe'}); } });
['ehire','efire','erest','eraise','ecand'].forEach(k=>{ const o=ACT[k]; ACT[k]=function(){ const r=o.apply(this,arguments); try{ if(view==='equipe') render(); }catch(e){} return r; }; });
setInterval(()=>{ try{ if(view==='equipe'&&!sheet&&!document.getElementById('tx')&&!document.querySelector('#view :focus')) render(); }catch(e){} },30000);
/* ---------- flèches de la fiche véhicule ---------- */
function carNav(dir){ if(!sheet||sheet.t!=='car') return; const L=S.cars, i=L.findIndex(c=>c.uid===sheet.uid); if(i<0||L.length<2) return; sheet.uid=L[(i+dir+L.length)%L.length].uid; renderSheet(); const sh=$('sheet'); if(sh) sh.scrollTop=0; auTry(()=>ui('open')); }
Object.assign(ACT,{ carprev(){ carNav(-1); }, carnext(){ carNav(1); } });
document.addEventListener('keydown',e=>{ if(sheet&&sheet.t==='car'){ if(e.key==='ArrowLeft') carNav(-1); else if(e.key==='ArrowRight') carNav(1); } });
function decor37(){ try{
  const on=sheet&&sheet.t==='car'&&S.cars.length>1, n=document.getElementById('carnav');
  if(n) n.remove();
  if(!document.querySelector('#view .head .hq')&&TUTX[view]&&!['atelier','equipe'].includes(view)){ const h=document.querySelector('#view .head p, #view .head'); if(h) h.insertAdjacentHTML('beforeend',' <button class="hq" data-a="tutx" data-id="view">?</button>'); }
 }catch(e){} }
const _rd37=render; render=function(){ const r=_rd37.apply(this,arguments); decor37(); return r; };
const _rsh37=renderSheet; renderSheet=function(){ const r=_rsh37.apply(this,arguments); decor37(); return r; };
