/* ===== v0.34 : fiches de stats à la plantation ===== */
const stb=(l,v,max,c,t)=>`<div class="stb"><span>${l}</span><div><i style="width:${Math.round(nz(v/max*100,100))}%;background:${c}"></i></div><b>${t}</b></div>`;
function lampFit(sv,l){ const r=l.lm/sv.lm; if(r<.8) return {c:'#ff6a3d',t:'Trop faible',k:'lo',p:Math.round(r*100)}; if(r>1.35) return {c:'#FCEE0A',t:'Trop forte',k:'hi',p:Math.round(r*100)}; return {c:'#3CFF9E',t:'Idéale',k:'ok',p:Math.round(r*100)}; }
const _rsv0=rSlotView;
rSlotView=function(room,i){
  const F=farm(), sl=F.rooms[room].slots[i];
  const seeds=STR.filter(s=>(F.seeds[s.id]||0)>0);
  if(sl||!seeds.length) return _rsv0(room,i);
  const P=RY.pick||{}, out=ROOMS[room].out, sv=P.sid?SID[P.sid]:null, md=P.med?MED[P.med]:null;
  let h=`<button class="btn alt sm" data-a="rback">← Retour à ${ROOMS[room].nom}</button><div class="rcard haze"><h3>${seedIc(24)} Planter une graine</h3>`;
  h+=`<p class="sm">1 · Variété</p><div class="rpicks">${seeds.map(s=>`<button class="${P.sid===s.id?'on':''}" data-a="rpick" data-id="sid" data-v="${s.id}">${leafIc(PURP[s.id]?'#a85de8':s.ty==='Sativa'?'#8be03c':'#3cc46a',26)}<b>${s.nom}</b><small>${s.ty} · ×${F.seeds[s.id]}</small></button>`).join('')}</div>`;
  if(sv) h+=`<div class="sfiche"><b>${sv.nom}</b> <small>${sv.ty}</small>${stb('THC',sv.thc,30,'#a85de8',sv.thc+' %')}${stb('Rendement',sv.y,50,'#3CFF9E','~'+sv.y+' g')}${stb('Vitesse',10/(sv.veg+sv.fl),1,'#00E5FF',(sv.veg+sv.fl).toFixed(1)+' min')}${stb('Soif',sv.eau,1.3,'#4aa8ff',sv.eau<=.95?'faible':sv.eau<=1.1?'normale':'forte')}${stb('Difficulté',sv.d,5,'#ff6a3d',['','facile','facile','moyenne','difficile','expert'][sv.d||1])}${stb('Lumière',sv.lm,60000,'#FCEE0A',((sv.lm/1000)|0)+' k lm idéal')}<small class="hint">${(sv.px||0)} cr/g de base · pH selon le substrat choisi</small></div>`;
  h+=`<p class="sm">2 · Substrat</p><div class="rpicks">${Object.keys(MED).map(k=>{ const m=MED[k]; return `<button class="${P.med===k?'on':''}" data-a="rpick" data-id="med" data-v="${k}">${soilIc(k,32)}<b>${m.nom}</b><small>${m.px?m.px+' cr':'gratuit'} · pH ${m.ph}</small></button>`; }).join('')}</div>`;
  if(md) h+=`<div class="sfiche"><b>${md.nom}</b> <small>pH idéal ${md.ph}</small>${stb('Rendement',md.y-.8,.4,'#3CFF9E','×'+md.y)}${stb('Vitesse',md.sp-.8,.5,'#00E5FF','×'+md.sp)}${stb('Eau bue',md.eau-.5,1.5,'#4aa8ff','×'+md.eau)}<small class="hint">Plus la plante s’écarte du pH idéal (${md.ph}), plus elle pousse lentement : corrige avec pH− / pH+.</small></div>`;
  let lamp=null;
  if(!out){ const ls=LAMP.filter(l=>(F.lamps[l.id]||0)>0); lamp=P.lamp?LID[P.lamp]:null;
    h+=`<p class="sm">3 · Lampe ${sv?`<small>(idéal pour ${sv.nom} : ${((sv.lm/1000)|0)} k lm)</small>`:'<small>(choisis une variété pour voir le match)</small>'}</p><div class="rpicks">${ls.length?ls.map(l=>{ const ft=sv?lampFit(sv,l):null; return `<button class="${P.lamp===l.id?'on':''}" data-a="rpick" data-id="lamp" data-v="${l.id}"><span class="big">${l.ic}</span><b>${l.nom}</b><small>${(l.lm/1000)|0} k lm · ${l.w} W</small>${ft?`<em class="fit" style="color:${ft.c}">${ft.k==='ok'?'✅':'⚠️'} ${ft.t}</em>`:''}</button>`; }).join(''):'<span class="sm">Aucune lampe : boutique → Lampes</span>'}</div>`;
    if(sv&&lamp){ const ft=lampFit(sv,lamp); h+=`<div class="sfiche">${stb('Match lumière',Math.min(ft.p,100),100,ft.c,ft.p+' % du besoin')}<small class="hint">${ft.k==='lo'?'Lumière insuffisante : croissance ralentie.':ft.k==='hi'?'Trop puissante : gaspillage de courant et plus de chaleur.':'Bon équilibre pour cette variété.'} Chaleur ${lamp.h}×.</small></div>`; } }
  else h+=`<p class="sm">3 · Lumière</p><div class="sfiche"><small class="hint">Plein soleil du ranch : environ ${((sv?36000:36000)/1000)|0} k lm, variable selon les jours. Pas de lampe à choisir.</small></div>`;
  if(sv&&md&&(out||lamp)){ const ft=out?null:lampFit(sv,lamp), spd=md.sp*(ft?(ft.k==='lo'?Math.max(.4,ft.p/100):1):1), tm=(1+sv.veg+sv.fl)/spd, g=Math.round(sv.y*md.y*(out?1.15:1));
    h+=`<div class="sfiche sum"><b>📊 Prévision</b>${stb('Récolte',g,70,'#3CFF9E','~'+g+' g')}${stb('Durée',20/tm,1,'#00E5FF','~'+tm.toFixed(1)+' min')}<small class="hint">Estimation avec soins parfaits (eau, N-P-K, pH, cycle).</small></div>`; }
  const okP=P.sid&&P.med&&(out||P.lamp);
  return h+`<button class="btn wide" data-a="rplant" data-id="${i}" ${okP?'':'disabled'}>🌱 Planter</button></div>`;
};
/* nav : bouton Labo (7e case) */
if(!TABS.some(t=>t[0]==='labo')) TABS.push(['labo','🌿','Labo']);
const _tab20=ACT.tab;
ACT.tab=function(d){ if(d&&d.id==='labo'){ try{ ACT.labopen(); }catch(e){ console.error(e); } return; } return _tab20.apply(this,arguments); };
/* ===== Collection du garage : recherche, filtres, tri ===== */
const GF={q:'',tier:'',cat:'',flag:'',sort:'recent'};
const GSORT={recent:'Ordre d’obtention',tier:'Rareté',ch:'Puissance',kg:'Poids (léger d’abord)',lvl:'Niveau',etat:'État',nom:'Nom A→Z',val:'Valeur'};
function gFiltered(){
  const q=GF.q.trim().toLowerCase(); let a=S.cars.map((c,i)=>({c,i}));
  a=a.filter(({c})=>{ const m=M[c.mid]; if(q&&!(m.nom+' '+m.cat+' '+m.an).toLowerCase().includes(q)) return false; if(GF.tier&&String(m.t)!==GF.tier) return false; if(GF.cat&&m.cat!==GF.cat) return false;
    if(GF.flag==='sh'&&!c.sh) return false; if(GF.flag==='rep'&&!(c.etat<75)) return false; if(GF.flag==='pod'&&!S.pod.slots.includes(c.uid)) return false; return true; });
  const k=GF.sort, g={tier:x=>-M[x.c.mid].t,ch:x=>-st(x.c).ch,kg:x=>st(x.c).kg,lvl:x=>-x.c.lvl,etat:x=>x.c.etat,val:x=>-(M[x.c.mid].val||0)};
  if(k==='nom') a.sort((x,y)=>M[x.c.mid].nom.localeCompare(M[y.c.mid].nom)); else if(g[k]) a.sort((x,y)=>g[k](x)-g[k](y)||x.i-y.i);
  return a.map(x=>x.c);
}
function gGrid(){ const l=gFiltered(); return l.length?l.map(c=>cardHTML(c,{attr:`data-a="car" data-id="${c.uid}"`})).join(''):'<p class="note" style="grid-column:1/-1">Aucune voiture ne correspond. Modifie ou efface les filtres.</p>'; }
function gBar(){
  const cats=[...new Set(S.cars.map(c=>M[c.mid].cat))].sort(), tiers=[...new Set(S.cars.map(c=>M[c.mid].t))].sort((a,b)=>b-a);
  const opt=(v,t,cur)=>`<option value="${v}" ${String(cur)===String(v)?'selected':''}>${t}</option>`;
  return `<div class="gbar"><input id="gq" type="search" placeholder="🔎 Rechercher une voiture…" value="${GF.q.replace(/"/g,'&quot;')}" autocomplete="off">
  <div class="gsel"><select id="gsort" aria-label="Trier">${Object.keys(GSORT).map(k=>opt(k,'↕ '+GSORT[k],GF.sort)).join('')}</select>
  <select id="gtier" aria-label="Catégorie de rareté">${opt('','Toutes raretés',GF.tier)}${tiers.map(t=>opt(t,TIERS[t].n,GF.tier)).join('')}</select>
  <select id="gcat" aria-label="Type">${opt('','Tous types',GF.cat)}${cats.map(c=>opt(c,c,GF.cat)).join('')}</select>
  <select id="gflag" aria-label="Filtre">${opt('','Toutes',GF.flag)}${opt('sh','✨ Shiny',GF.flag)}${opt('rep','🔧 À réparer',GF.flag)}${opt('pod','🏛️ Sur podium',GF.flag)}</select></div>
  <div class="gcount"><span id="gn">${gFiltered().length} / ${S.cars.length} voitures</span>${GF.q||GF.tier||GF.cat||GF.flag||GF.sort!=='recent'?'<button class="btn alt sm" id="greset">Réinitialiser</button>':''}</div></div>`;
}
const _vG20=vGarage;
vGarage=function(){ const h=_vG20(), i=h.indexOf('<div class="sec"><h3>Collection</h3>'); if(i<0) return h;
  return h.slice(0,i)+`<div class="sec"><h3>Collection</h3>${gBar()}<div class="grid" id="ggrid" style="margin-top:10px">${gGrid()}</div><p class="note">Touche une voiture pour la gérer et monter ses modules. Appui long : vue 3D.</p></div>`; };
function gRefresh(){ const g=document.getElementById('ggrid'); if(!g) return; g.innerHTML=gGrid(); const n=document.getElementById('gn'); if(n) n.textContent=gFiltered().length+' / '+S.cars.length+' voitures'; }
document.addEventListener('input',e=>{ if(e.target.id==='gq'){ GF.q=e.target.value; gRefresh(); } });
document.addEventListener('change',e=>{ const m={gsort:'sort',gtier:'tier',gcat:'cat',gflag:'flag'}[e.target.id]; if(m){ GF[m]=e.target.value; render(); } });
document.addEventListener('click',e=>{ if(e.target.id==='greset'){ Object.assign(GF,{q:'',tier:'',cat:'',flag:'',sort:'recent'}); render(); } });
/* ===== v0.39 : conditionnement (sachets, pochons, caisses, valises) + coffre des voitures ===== */
const UN={
 bag:{n:'Sachet',ic:'bag',g:1,px:1.5,buy:10,bonus:.14,vis:.75,d:'Discret, se vend très bien à la pièce'},
 pouch:{n:'Pochon',ic:'pouch',g:10,px:9,buy:5,bonus:.10,vis:.9,d:'Le format classique'},
 crate:{n:'Caisse',ic:'crate',g:100,px:70,buy:2,bonus:.06,vis:1.15,d:'Lourd et voyant'},
 case:{n:'Valise',ic:'case',g:500,px:280,buy:1,bonus:.03,vis:1.3,d:'Gros volume, gros risque'}
};
const UK=Object.keys(UN);
const CAP={'Vélo':5,'Citadine':20,'Sportive':25,'Supercar':20,'Hypercar':10,'Drift':30,'Compacte':40,'Électrique':40,'Muscle car':50,'Rallye':50,'Classique':60,'Luxe':60,'Berline':80,'Break':150,'4x4':200,'Pick-up':400,'Utilitaire':500};
const capOf=c=>CAP[M[c.mid].cat]||60;
function pkI(u,s){ s=s||40; const x={
 bag:`<path d="M9 9h22l2 25a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" fill="#e8fff1" fill-opacity=".16" stroke="#bfe9d0" stroke-width="1.5"/><rect x="8.2" y="9" width="23.6" height="4.2" rx="1.2" fill="#3CFF9E"/><circle cx="16" cy="25" r="4.4" fill="#2fbf71"/><circle cx="23.5" cy="26.5" r="4" fill="#3cd987"/><circle cx="20" cy="21.5" r="3.4" fill="#59e79a"/><path d="M12 15h16" stroke="#bfe9d0" stroke-width="1" stroke-dasharray="2 2"/>`,
 pouch:`<path d="M13 7h14l-1.6 5.4c4.6 2.4 7.6 7 7.6 12 0 6-4.4 10.6-13 10.6S7 30.4 7 24.4c0-5 3-9.6 7.6-12z" fill="#5a3b8c" stroke="#a98ae0" stroke-width="1.5"/><rect x="12.4" y="10.6" width="15.2" height="3.4" rx="1.4" fill="#FFD400"/><circle cx="20" cy="25" r="5.6" fill="#3CFF9E" fill-opacity=".9"/><path d="M20 20.6c1 2.4 1 4.8 0 8.8M16.4 24.4c2.4.4 5 .4 7.2 0" stroke="#145a37" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,
 crate:`<rect x="4.5" y="10" width="31" height="23" rx="2" fill="#a8723a" stroke="#6d4521" stroke-width="1.6"/><path d="M4.5 17.6h31M4.5 25.4h31" stroke="#6d4521" stroke-width="1.6"/><path d="M5 10l30 23M35 10 5 33" stroke="#8a5b2c" stroke-width="1.6"/><rect x="13" y="6.4" width="14" height="5" rx="1.2" fill="#d9a25f" stroke="#6d4521" stroke-width="1.2"/><circle cx="20" cy="9" r="1.2" fill="#6d4521"/>`,
 case:`<rect x="14" y="5.5" width="12" height="7" rx="2.5" fill="none" stroke="#9aa3b5" stroke-width="2"/><rect x="4.5" y="11" width="31" height="23" rx="3.2" fill="#1a1d2e" stroke="#6b7390" stroke-width="1.6"/><path d="M4.5 19h31" stroke="#FFD400" stroke-width="2"/><path d="M4.5 21.5h31" stroke="#E0354B" stroke-width="1.6"/><path d="M4.5 24h31" stroke="#3CFF9E" stroke-width="1.6"/><rect x="11" y="16.6" width="4.4" height="5.6" rx="1" fill="#d6b24a"/><rect x="24.6" y="16.6" width="4.4" height="5.6" rx="1" fill="#d6b24a"/>`}[u];
 return `<svg class="pki" viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true">${x}</svg>`; }
function pkState(){ const F=farm(); F.mat=F.mat||{bag:0,pouch:0,crate:0,case:0}; F.lots=F.lots||[]; return F; }
const lotG=l=>l.n*UN[l.u].g;
function pkAvail(F,sid){ let g=(F.stock[sid]&&F.stock[sid].g)||0; F.lots.forEach(l=>{ if(l.sid===sid) g+=lotG(l); }); return g; }
function pkAdd(F,sid,q,u,n){ const l=F.lots.find(x=>x.sid===sid&&x.u===u); if(l){ const a=l.n*UN[u].g, b=n*UN[u].g; l.q=(l.q*a+q*b)/(a+b); l.n+=n; } else F.lots.push({sid,q,u,n}); }
const RPK={sid:null};
function pkCard(){ const F=pkState(), ks=Object.keys(F.stock).filter(k=>F.stock[k].g>=1);
  if(!RPK.sid||!(F.stock[RPK.sid]&&F.stock[RPK.sid].g>=1)) RPK.sid=ks[0]||null;
  const sel=RPK.sid, s=sel&&F.stock[sel];
  let h=`<div class="rcard pkcard"><h3>📦 Conditionnement</h3><p class="sm">Transforme ton stock en sachets, pochons, caisses ou valises : ils se vendent mieux, mais pèsent dans le coffre et se voient plus ou moins.</p>`;
  if(ks.length>1) h+=`<div class="rchips">${ks.map(k=>`<button class="${k===sel?'on':''}" data-a="pksel" data-id="${k}">${SID[k].ic} ${SID[k].nom} · ${Math.floor(F.stock[k].g)} g</button>`).join('')}</div>`;
  else if(sel) h+=`<p class="sm">${SID[sel].ic} <b>${SID[sel].nom}</b> · ${Math.floor(s.g)} g en vrac · qualité ${Math.round(s.q)} %</p>`;
  else h+=`<p class="sm">Aucun stock en vrac à conditionner. Récolte d’abord une plante.</p>`;
  UK.forEach(u=>{ const D=UN[u], can=s?Math.min(Math.floor(s.g/D.g),F.mat[u]):0;
    h+=`<div class="urow"><div class="uic">${pkI(u,40)}</div><div class="ugr"><b>${D.n} <small>${D.g} g</small></b><small>${D.d}</small><small>Emballages : <b>×${F.mat[u]}</b> · prix +${Math.round(D.bonus*100)} % · visibilité ${D.vis<1?'basse':D.vis>1.1?'haute':'moyenne'}</small></div>
    <div class="ubt"><button data-a="pkmake" data-id="${u}" data-v="1" ${can>=1?'':'disabled'}>×1</button><button data-a="pkmake" data-id="${u}" data-v="max" ${can>=1?'':'disabled'}>Max${can>1?' '+can:''}</button><button class="buy" data-a="pkbuy" data-id="${u}">+${D.buy}<small>${fmt(Math.round(D.px*D.buy))} cr</small></button></div></div>`; });
  return h+'</div>'; }
function lotsCard(){ const F=pkState(); if(!F.lots.length) return '';
  const rows=F.lots.map((l,i)=>{ const sv=SID[l.sid]; if(!sv) return ''; const D=UN[l.u], g=lotG(l), p=sellPrice(l.sid,l.q)*(1+D.bonus), m=F.rep>=10?1:.75;
    return `<div class="urow lot"><div class="uic">${pkI(l.u,36)}</div><div class="ugr"><b>${D.n} ×${l.n} <small>${g} g</small></b><small>${sv.ic} ${sv.nom} · qualité ${Math.round(l.q)} %</small><small>≈ ${Math.round(g*p*m)} cr (${F.rep>=10?'contact':'rue −25 %'})</small></div><div class="ubt"><button data-a="lsell" data-id="${i}">Vendre</button></div></div>`; }).join('');
  return `<div class="rcard pkcard"><h3>🧳 Marchandise conditionnée</h3>${rows}<p class="sm">Les livraisons en voiture piochent d’abord ici : bonus de prix du format, mais chaque format a sa visibilité.</p></div>`; }
const _rStock20=rStock; rStock=function(){ pkState(); return pkCard()+lotsCard()+_rStock20(); };
Object.assign(ACT,{
 pksel(d){ RPK.sid=d.id; renderSheet(); },
 pkbuy(d){ const F=pkState(), D=UN[d.id], c=Math.round(D.px*D.buy); if(S.cr<c) return toast('Pas assez de crédits'); S.cr-=c; F.mat[d.id]+=D.buy; toast(`+${D.buy} ${D.n.toLowerCase()}${D.buy>1?'s':''} d’emballage`); save(); renderSheet(); },
 pkmake(d){ const F=pkState(), D=UN[d.id], sid=RPK.sid, s=sid&&F.stock[sid]; if(!s) return; const can=Math.min(Math.floor(s.g/D.g),F.mat[d.id]); const n=d.v==='max'?can:Math.min(1,can); if(n<1) return toast(F.mat[d.id]<1?'Il te faut des emballages':'Pas assez de marchandise');
  s.g-=n*D.g; F.mat[d.id]-=n; pkAdd(F,sid,s.q,d.id,n); F.stats.packed=(F.stats.packed||0)+n*D.g; toast(`${n} ${D.n.toLowerCase()}${n>1?'s':''} prêt${n>1?'s':''}`); save(); renderSheet(); },
 lsell(d){ const F=pkState(), l=F.lots[+d.id]; if(!l) return; const D=UN[l.u], g=lotG(l), m=F.rep>=10?1:.75, gain=Math.round(g*sellPrice(l.sid,l.q)*(1+D.bonus)*m), ht=(F.rep>=10?g*.12:g*.35)*D.vis;
  S.cr+=gain; F.stats.sold+=g; F.rep+=g*.02; karmaAdd(-g*(F.rep>=10?.02:.04)); F.heat.atelier=Math.min(100,F.heat.atelier+ht*.4); F.heat.ranch=Math.min(100,F.heat.ranch+ht*.4); F.lots.splice(+d.id,1); toast(`${g} g vendus, +${fmt(gain)} cr`); save(); renderSheet(); }
});
/* cargaison : lots d'abord, puis vrac */
bestCargo=function(e){ if(e.ill!=='cargo') return null; const F=pkState(); let best=null;
  Object.keys(F.stock).concat(F.lots.map(l=>l.sid)).filter((k,i,a)=>a.indexOf(k)===i).forEach(sid=>{ if(!SID[sid]||pkAvail(F,sid)<e.cargo) return;
    let need=e.cargo, plan=[], bq=0, bsum=0, vis=0, qs=0;
    const mine=F.lots.map((l,i)=>({l,i})).filter(x=>x.l.sid===sid).sort((a,b)=>UN[b.l.u].g-UN[a.l.u].g);
    mine.forEach(({l,i})=>{ const D=UN[l.u]; let n=Math.min(l.n,Math.floor(need/D.g)); if(n>0){ plan.push({i,n}); need-=n*D.g; qs+=l.q*n*D.g; bsum+=D.bonus*n*D.g; vis+=D.vis*n*D.g; } });
    mine.slice().reverse().forEach(({l,i})=>{ if(need<=0||(F.stock[sid]&&F.stock[sid].g>=need)) return; const D=UN[l.u], used=(plan.find(p=>p.i===i)||{n:0}).n, free=l.n-used, n=Math.min(free,Math.ceil(need/D.g)); if(n>0){ const ex=plan.find(p=>p.i===i); if(ex) ex.n+=n; else plan.push({i,n}); need-=n*D.g; qs+=l.q*n*D.g; bsum+=D.bonus*n*D.g; vis+=D.vis*n*D.g; } });
    const lg=plan.reduce((a,p)=>a+p.n*UN[F.lots[p.i].u].g,0); let loose=Math.max(0,e.cargo-lg); const st=F.stock[sid]; if(loose>0){ if(!st||st.g<loose) return; qs+=st.q*loose; vis+=loose; }
    const g=lg+loose, q=qs/g, b={sid,g,q,plan,loose,bonus:bsum/g,vis:vis/g,packed:lg};
    if(!best||sellPrice(sid,q)*(1+b.bonus)>sellPrice(best.sid,best.q)*(1+best.bonus)) best=b; });
  return best; };
ACT.illgo=function(d){ const e=ILL.find(x=>x.id===d.id), F=farm(); if(!e||S.lvl<e.lvl||F.rep<e.rep||S.cars.length<e.manches.length) return;
  let cargo=null; if(e.ill==='cargo'){ cargo=bestCargo(e); if(!cargo) return toast('Pas assez de marchandise'); } else { if(S.cr<e.bet) return toast('Pas assez pour la mise'); }
  closeSheet(); ACT.ev({id:e.id}); if(R&&R.ev&&R.ev.id===e.id){ R.cargo=cargo; render(); } };
const _go20=ACT.go;
ACT.go=function(d){ if(R&&R.cargo&&R.pick&&R.pick[0]){ const c=car(R.pick[0]); if(c&&R.cargo.g>capOf(c)) return toast(`Coffre trop petit : ${capOf(c)} g max, il en faut ${R.cargo.g}`); } return _go20.apply(this,arguments); };
const _vPrep20=vPrep;
vPrep=function(){ let b=''; if(R&&R.cargo){ const k=R.cargo, c=R.pick&&R.pick[0]?car(R.pick[0]):null, cap=c?capOf(c):0, ok=c&&k.g<=cap, load=c?k.g/cap:0;
  b=`<div class="cargob ${c?(ok?'ok':'ko'):''}"><div class="cgi">${pkI(k.packed>=k.g*.5&&k.plan[0]?F_u(k):'crate',44)}</div><div class="cgt"><b>Chargement : ${k.g} g de ${SID[k.sid].nom}</b><small>${k.packed?`${k.packed} g conditionnés (+${Math.round(k.bonus*100)} % de prix)`:'En vrac'}${k.loose?` · ${k.loose} g en vrac`:''}</small>
  <small>${c?`Coffre de ta voiture : <b>${cap} g</b> ${ok?(load>.8?'· presque plein : plus repérable':'· ok'):'· <b>trop petit</b>, choisis un break, un 4x4 ou un utilitaire'}`:'Choisis la voiture qui transporte la marchandise (manche 1).'}</small></div></div>`; }
  return b+_vPrep20(); };
function F_u(k){ const F=farm(), l=F.lots[k.plan[0].i]; return l?l.u:'crate'; }
const _rNet20=rNet;
rNet=function(){ const big=S.cars.reduce((a,c)=>capOf(c)>(a?capOf(a):-1)?c:a,null); return `<div class="rcard"><small>🚗 Ton plus grand coffre : <b>${big?capOf(big)+' g':'—'}</b>${big?` (${M[big.mid].nom})`:''}. Les livraisons demandent la place nécessaire.</small></div>`+_rNet20(); };
illResolve=function(ev,pay,win,pod){
  if(!ev.ill){ if(win) karmaAdd(Math.min(3,1+(ev.lvl>>2))); else if(pod) karmaAdd(.5); return; } const F=pkState(); let msg='';
  if(ev.ill==='cargo'){ const c=R.cargo; if(!c) return;
    const take=()=>{ (c.plan||[]).slice().sort((a,b)=>b.i-a.i).forEach(p=>{ const l=F.lots[p.i]; if(!l) return; l.n-=p.n; if(l.n<=0) F.lots.splice(p.i,1); }); const s=F.stock[c.sid]; if(s&&c.loose) s.g=Math.max(0,s.g-c.loose); }; take();
    const over=(()=>{ const cc=R.pick&&R.pick[0]&&car(R.pick[0]); return cc&&c.g/capOf(cc)>.8?1.2:1; })(), heat=ev.heat*(c.vis||1)*over;
    if(pod){ const v=Math.round(c.g*sellPrice(c.sid,c.q)*(1+(c.bonus||0))*ev.prem*Math.max(.6,pay)); S.cr+=v; F.rep+=ev.rep*.25+1; F.stats.deliv++; const h=heat*.5; F.heat.atelier=Math.min(100,F.heat.atelier+h); F.heat.ranch=Math.min(100,F.heat.ranch+h); karmaAdd(-2); msg=`📦 <b>Livraison réussie</b> : ${c.g} g écoulés, +${fmt(v)} cr${c.bonus?` (dont +${Math.round(c.bonus*100)} % de format)`:''}.`; }
    else{ F.stats.busted++; karmaAdd(-3); const fine=Math.round(S.cr*.08); S.cr-=fine; F.heat.atelier=Math.min(100,F.heat.atelier+heat); F.heat.ranch=Math.min(100,F.heat.ranch+heat); msg=`🚔 <b>Interpellé !</b> Cargaison saisie, amende ${fmt(fine)} cr, chaleur en hausse.`; } }
  else{ if(win){ karmaAdd(-1); S.cr+=ev.bet; F.rep+=1+ev.rep*.1; msg=`🏁 <b>Course gagnée</b> : +${fmt(ev.bet)} cr de mise ramassée.`; }
    else if(pod){ msg='🏁 Tu sauves ta mise, mais sans gloire.'; }
    else { S.cr=Math.max(0,S.cr-ev.bet); msg=`🏁 <b>Perdu</b> : la mise de ${fmt(ev.bet)} cr est partie.`; }
    F.heat.atelier=Math.min(100,F.heat.atelier+ev.heat*.3); }
  save(); setTimeout(()=>banner(msg),400);
};
/* ===== v0.40 : la chaîne plante → récolte → séchoir → conditionnement → livraison, dans le monde 3D ===== */
function packStation(room){
  const sc=HUB.scene, F=pkState(), out=GROW[room].out, BZ=GROW[room].bz+1;
  const L=c=>new THREE.MeshLambertMaterial({color:c}), box=(w,h,d,x,y,z,m)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); sc.add(o); return o; };
  const X=out?12:-14, Z=out?-24:BZ-2.2, wood=out?0x6a4a2a:0x3a4650;
  box(7,.18,2.6,X,1.05,Z,L(wood)); [[-3.2,-1],[3.2,-1],[-3.2,1],[3.2,1]].forEach(a=>box(.18,1,.18,X+a[0],.5,Z+a[1]*1,L(0x2a3438)));
  box(7.2,.06,2.8,X,1.16,Z,new THREE.MeshBasicMaterial({color:0x3cff9e}));
  HUB.obs.push({x0:X-3.6,x1:X+3.6,z0:Z-1.4,z1:Z+1.4});
  /* un objet 3D par lot (limité) */
  let k=0; const put=(u,i)=>{ const x=X-3+(k%8)*.85, row=(k/8|0), z=Z-.5+row*.9; k++;
    if(u==='bag'){ box(.5,.07,.7,x,1.25,z,L(0xe8fff1)); box(.34,.09,.5,x,1.3,z,L(0x2fbf71)); }
    else if(u==='pouch'){ const c=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,.55,10),L(0x6a3fb0)); c.position.set(x,1.5,z); sc.add(c); box(.3,.08,.3,x,1.82,z,L(0xffd400)); }
    else if(u==='crate'){ box(.8,.7,.8,x,1.6,z,L(0xa8723a)); box(.82,.08,.82,x,1.96,z,L(0x6d4521)); }
    else { box(1,.7,.7,x,1.6,z,L(0x1a1d2e)); box(1.02,.1,.72,x,1.62,z,L(0xffd400)); } };
  F.lots.slice(0,6).forEach(l=>{ for(let i=0;i<Math.min(3,l.n);i++) if(k<16) put(l.u,i); });
  const lb=hubLabel('📦 CONDITIONNEMENT','#FFD400',6,X,Z); lb.position.set(X,4.2,Z); sc.add(lb);
  const tot=()=>{ const f=pkState(); return f.lots.reduce((a,l)=>a+lotG(l),0); }, loose=()=>Object.keys(farm().stock).reduce((a,k)=>a+Math.floor(farm().stock[k].g),0);
  HUB.pois.push({id:'pack',x:X,z:out?Z+3.2:Z-3.2,r:4.2,title:()=>`📦 Table de conditionnement · ${loose()} g en vrac · ${tot()} g prêts`,btns:()=>[{id:'pack',tx:'📦 Conditionner la récolte'},{id:'packnet',tx:'🚗 Charger & livrer',alt:1}]});
  if(!out){ const f=farm(); HUB.pois.push({id:'dry',x:22,z:-BZ+4,r:3.6,title:()=>{ const d=(farm().dry||[]); return d.length?`🧺 Séchoir · ${d.length} lot${d.length>1?'s':''} · ${Math.round(d.reduce((a,b)=>a+b.g,0))} g en séchage`:'🧺 Séchoir vide'; },btns:()=>[{id:'dry',tx:'🫙 Voir le stock'}]}); }
}
const _gb20=growBuild;
growBuild=function(room){ _gb20(room); try{ if(window.THREE) packStation(room); }catch(e){ console.error(e); } };
const _gg20=ACT.growgo;
ACT.growgo=function(d){ if(d.id==='pack'||d.id==='dry'||d.id==='packnet'){ RY.tab=d.id==='packnet'?'net':'stock'; RY.slot=null; return openSheet({t:'ranch'}); } return _gg20.apply(this,arguments); };
/* accès directs depuis les objectifs */
const _tab21=ACT.tab;
ACT.tab=function(d){ if(d&&(d.id==='labstock'||d.id==='labnet')){ try{ ACT.labopen(); }catch(e){ console.error(e); } RY.tab=d.id==='labnet'?'net':'stock'; RY.slot=null; try{ renderSheet(); }catch(e){} return; } return _tab21.apply(this,arguments); };
const _goal3=goalNext;
goalNext=function(){ const r=_goal3(); if(r&&r[2]!=='base') return r; const F=S.farm; if(F&&F.found){ pkState(); const loose=Object.keys(F.stock).reduce((a,k)=>a+F.stock[k].g,0), packed=F.lots.length>0;
  if(!packed&&!(F.stats&&F.stats.packed)&&loose>=5) return ['📦','Conditionne ta récolte en sachets ou pochons : elle se vend mieux','labstock','Conditionner'];
  if(packed&&!(F.stats&&F.stats.deliv)) return ['🚗','Charge ton coffre et fais ta première livraison au volant','labnet','Au réseau']; } return r; };
/* retour d'info quand un lot a fini de sécher */
(()=>{ let prev=null; setInterval(()=>{ try{ const F=S&&S.farm; if(!F||!F.found) return; const n=(F.dry||[]).length; if(prev!==null&&n<prev) toast('🧺 Séchage terminé : ta récolte est au stock, prête à être conditionnée'); prev=n; }catch(_){} },1500); })();
GT.splice(GT.length-1,0,{ic:'📦',t:'Du plant au coffre',x:'<b>Récolte</b> → <b>séchoir</b> (2 min) → <b>stock</b> → <b>conditionnement</b> en sachets, pochons, caisses ou valises → <b>livraison</b> en voiture. À la <b>table de conditionnement</b> du labo (ou dans l’onglet Stock), transforme ton vrac : chaque format a son bonus de prix et sa visibilité. Ton coffre doit être assez grand pour la cargaison.'});
