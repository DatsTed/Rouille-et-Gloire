/* ===== v0.41 : Équipe — employés (mécano, jardinier, pilote, vendeur, gardien) ===== */
const ROLES={
 mech:{n:'Mécano',ic:'🔧',base:260,d:'Remet tes voitures en état, même quand tu ne joues pas.',unit:'pts d’état'},
 gard:{n:'Jardinier',ic:'🌱',base:240,d:'Arrose, soigne et récolte tes plantes.',unit:'soins'},
 pil:{n:'Pilote',ic:'🏁',base:300,d:'Court pour toi : crédits et expérience en continu.',unit:'cr rapportés'},
 ven:{n:'Vendeur',ic:'🛍️',base:280,d:'Écoule ton stock en vrac à bon prix.',unit:'cr de ventes'},
 guard:{n:'Gardien',ic:'🛡️',base:270,d:'Veille sur les lieux : la chaleur retombe plus vite.',unit:'pts de chaleur'}
};
const TRAITS={
 des:{n:'Désespéré de survivre',eff:1,drain:1,wage:.85,d:'Se donne à fond quand ton argent est bas'},
 ass:{n:'Assidu',eff:1.1,drain:1,wage:1.05,d:'Travaille un peu plus vite'},
 fai:{n:'Flemmard',eff:.9,drain:.8,wage:.8,d:'Moins cher, moins rapide'},
 per:{n:'Perfectionniste',eff:1.05,drain:1.15,wage:1.1,d:'Soigné mais se fatigue plus vite'},
 fet:{n:'Fêtard',eff:1,drain:1.3,wage:.95,d:'Brillant, mais s’épuise vite'},
 cal:{n:'Calme',eff:1,drain:.75,wage:1.05,d:'Ne se fatigue presque pas'}
};
const NAMES=['Gaspard','Mehdi','Lucie','Bram','Yasmine','Théo','Nadia','Karim','Inès','Wout','Sofia','Pablo','Mona','Elias','Jade','Rémi','Anouk','Idriss','Léa','Sven'];
const SURN=['Dubois','Peeters','Benali','Janssens','Lambert','Diallo','Martens','Rossi','Claes','Mertens','Kowalski','Haddad'];
const QUOTES={
 des:['Chef… la plante, c’est tout ce qui me reste.','Merci de m’avoir pris. Vraiment.','J’ai pas beaucoup dormi, mais elle a bu.','Elle a repris des couleurs. Moi aussi, un peu.','Je ne vous décevrai pas, promis.','C’est la première fois depuis longtemps qu’on me fait confiance.'],
 desHi:['Vous savez… c’est ma famille, ici, maintenant.','Si je peux rester, je ferai tout.','Je me suis remis à cuisiner, grâce à vous.'],
 gen:['Tout roule, chef.','On s’en occupe.','Rien à signaler.','Un petit café et ça repart.','Content de bosser ici.'],
 genHi:['Je me plais vraiment ici.','Vous pouvez compter sur moi.'],
 tired:['Je tiens… un peu de repos ferait du bien.','Je suis cuit, chef.'],
 unpaid:['Le salaire… on attend encore.','C’est compliqué sans la paie, chef.']
};
const TEAM0=()=>({hired:[],cand:[],candT:0,last:Date.now(),seq:0,tot:{}});
function team(){ if(!S.team) S.team=TEAM0(); const T=S.team; if(!T.hired) T.hired=[]; if(!T.cand) T.cand=[]; return T; }
let teamCap=()=>Math.min(6,1+Math.floor(S.lvl/3));
function wageOf(role,sk,trait){ return Math.round(ROLES[role].base*(.6+.12*sk)*TRAITS[trait].wage/5)*5; }
function newCand(role,forceTrait){
  const T=team(); const sk=1+Math.floor(Math.random()*Math.random()*8)+(Math.random()<.25?1:0), tr=forceTrait||Object.keys(TRAITS)[Math.floor(Math.random()*6)], skc=Math.min(10,sk+(S.lvl>8?1:0));
  const nm=NAMES[Math.floor(Math.random()*NAMES.length)]+' '+SURN[Math.floor(Math.random()*SURN.length)];
  return {id:'e'+(++T.seq)+Date.now().toString(36),nom:nm,role,sk:skc,end:2+Math.floor(Math.random()*8),tr,wage:wageOf(role,skc,tr),en:100,lo:30,rest:0,hiredT:0,out:0,col:Math.floor(Math.random()*360),sk2:Math.floor(Math.random()*5),msg:''};
}
function refreshCands(force){
  const T=team(), F=S.farm, can=r=>r!=='gard'||(F&&F.found);
  if(!force&&T.cand.length&&Date.now()-T.candT<15*60000) return;
  const roles=Object.keys(ROLES).filter(can), out=[];
  if(!T.hired.some(e=>e.role==='gard')&&can('gard')&&!T.firstG){ const g=newCand('gard','des'); g.nom='Gaspard Lambert'; g.sk=3; g.end=4; g.wage=wageOf('gard',3,'des'); g.lo=25; out.push(g); }
  while(out.length<3){ const r=roles[Math.floor(Math.random()*roles.length)]; if(out.some(c=>c.role===r)&&roles.length>3) continue; out.push(newCand(r)); }
  T.cand=out; T.candT=Date.now();
}
function empEff(e){ const tr=TRAITS[e.tr]; let m=(.5+.1*e.sk)*tr.eff*(1+.25*e.lo/100); const ef=e.en>25?1:(.5+.02*e.en); m*=ef; if(e.tr==='des'&&S.cr<3000) m*=1.25; return m; }
function empTick(){
  const T=team(); if(!T.hired.length){ T.last=Date.now(); return; }
  const now=Date.now(); let dt=Math.min((now-T.last)/60000,360); T.last=now; if(dt<=0.01){ return; }
  let left=dt;
  while(left>1e-4){ const d=Math.min(left,5); left-=d;
    T.hired.forEach(e=>{
      const wage=e.wage*d/60; 
      if(e.rest>0){ e.rest=Math.max(0,e.rest-d); e.en=Math.min(100,e.en+14*d); e.lo=Math.min(100,e.lo+.5*d); S.cr=Math.max(0,S.cr-wage); return; }
      if(S.cr<wage){ e.lo=Math.max(0,e.lo-.8*d); e.msg='unpaid'; return; }
      S.cr-=wage; e.paid=(e.paid||0)+wage; e.lo=Math.min(100,e.lo+.12*d);
      const tr=TRAITS[e.tr]; e.en=Math.max(0,e.en-(1.3*tr.drain*3/(2+e.end*.6))*d); const eff=empEff(e); let did=0;
      try{
        if(e.role==='mech'){ const lows=S.cars.filter(c=>c.etat<100).sort((a,b)=>a.etat-b.etat); let pts=2.5*eff*d; for(const c of lows){ if(pts<=0) break; const up=Math.min(100-c.etat,pts); c.etat=Math.min(100,Math.round((c.etat+up)*10)/10); pts-=up; did+=up; } }
        else if(e.role==='gard'){ did=empGard(eff,d); }
        else if(e.role==='pil'){ const cr=Math.round(12*eff*d*(1+S.lvl*.03)); S.cr+=cr; addXP(Math.max(0,Math.round(1.4*eff*d))); did=cr; }
        else if(e.role==='ven'){ did=empSell(eff,d,e.sk); }
        else if(e.role==='guard'){ const F=S.farm; if(F&&F.heat){ ['atelier','ranch'].forEach(r=>{ const h=F.heat[r]||0, dn=Math.min(h,.6*eff*d); F.heat[r]=h-dn; did+=dn; }); } }
      }catch(err){ console.error(err); }
      e.out=(e.out||0)+did; T.tot[e.role]=(T.tot[e.role]||0)+did; e.msg=e.en<25?'tired':''; });
  }
  save();
}
function empGard(eff,d){ const F=S.farm; if(!F||!F.found) return 0; ranchSim(); let did=0, cap=Math.max(1,Math.floor(4*eff*d)), harv=Math.max(1,Math.floor(2*eff*d));
  const t0=toast; toast=()=>{}; try{
    for(const room in ROOMS){ const R=F.rooms[room]; if(!R||!R.on) continue; R.slots.forEach((sl,i)=>{ if(!sl) return;
      if(sl.pest&&cap>0){ const k=sl.pest==='mold'?'FONG':'INSEC'; if((F.chem[k]||0)>0){ F.chem[k]--; sl.pest=null; cap--; did++; } }
      if((sl.st==='germ'||sl.st==='veg'||sl.st==='flo')&&sl.w<42&&cap>0&&F.water>=3){ sl.w=Math.min(88,sl.w+30); F.water-=3; cap--; did++; }
      if(sl.st==='ready'&&harv>0){ const keep=RY.tab; RY.tab=room; _rh0({id:String(i)}); RY.tab=keep; harv--; did++; } }); }
  }finally{ toast=t0; } return did; }
function empSell(eff,d,sk){ const F=S.farm; if(!F||!F.found) return 0; let g=3*eff*d, gain=0; for(const k in F.stock){ if(g<=0) break; const s=F.stock[k]; if(!s||s.g<1) continue; const n=Math.floor(Math.min(s.g,g)); if(n<1) continue; const v=Math.round(n*sellPrice(k,s.q)*(1+.02*sk)); s.g-=n; g-=n; S.cr+=v; gain+=v; F.stats.sold+=n; F.rep+=n*.02; karmaAdd(-n*.02); F.heat.atelier=Math.min(100,F.heat.atelier+n*.05); F.heat.ranch=Math.min(100,F.heat.ranch+n*.05); } return gain; }
/* avatar */
function faceSVG(e,s){ s=s||46; const hue=e.col, skin=['#f2c6a0','#d9a273','#b57a4e','#8a5a3a','#e8b890'][e.sk2%5], hair=`hsl(${hue},45%,${e.role==='gard'?30:22}%)`, mood=e.en<25||e.lo<20?-1:e.lo>65?1:0;
  const mouth=mood>0?'M17 29q6 5 12 0':mood<0?'M17 31q6-4 12 0':'M18 30h10';
  return `<svg viewBox="0 0 46 46" width="${s}" height="${s}" class="fav" aria-hidden="true"><circle cx="23" cy="23" r="22" fill="hsl(${hue},40%,22%)"/><path d="M9 46c1-9 7-12 14-12s13 3 14 12z" fill="hsl(${hue},55%,45%)"/><circle cx="23" cy="21" r="10" fill="${skin}"/><path d="M12.5 19c0-8 5-11 10.500-11s10.500 3 10.500 11c-3-4-7-5-10.500-5s-7.500 1-10.500 5z" fill="${hair}"/><circle cx="19.200" cy="22" r="1.200" fill="#222"/><circle cx="26.800" cy="22" r="1.200" fill="#222"/><path d="${mouth}" stroke="#7a3a2a" stroke-width="1.300" fill="none" stroke-linecap="round"/>${e.tr==='des'?'<path d="M16.500 17.500l4-1.200M29.500 17.500l-4-1.200" stroke="#3a2a1a" stroke-width="1.100" stroke-linecap="round"/>':''}${e.en<25?'<path d="M31 13l2 3" stroke="#6ab0ff" stroke-width="1.500" stroke-linecap="round"/>':''}</svg>`; }
function quoteOf(e){ const hi=e.lo>=70; let pool; if(e.msg==='tired') pool=QUOTES.tired; else if(e.msg==='unpaid') pool=QUOTES.unpaid; else if(e.tr==='des') pool=hi?QUOTES.desHi:QUOTES.des; else pool=hi?QUOTES.genHi:QUOTES.gen; let h=0; const s=e.id+Math.floor(Date.now()/90000); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return pool[Math.abs(h)%pool.length]; }
const sb=(l,v,c,t)=>`<div class="stb"><span>${l}</span><div><i style="width:${Math.round(Math.max(0,Math.min(100,v)))}%;background:${c}"></i></div><b>${t}</b></div>`;
function empRow(e,mode){ const R=ROLES[e.role], T=TRAITS[e.tr];
  const stats=sb('Compétence',e.sk*10,'#3CFF9E',e.sk+'/10')+sb('Endurance',e.end*10,'#00E5FF',e.end+'/10')+(mode==='hire'?'':sb('Énergie',e.en,e.en<25?'#ff6a3d':'#FCEE0A',Math.round(e.en)+' %')+sb('Loyauté',e.lo,'#ff2bd6',Math.round(e.lo)+' %'));
  const head=`<div class="eh">${faceSVG(e,48)}<div class="ei"><b>${e.nom}</b><span class="chip">${R.ic} ${R.n}</span><small class="et">${T.n} · ${T.d}</small></div><div class="ew"><b>${fmt(e.wage)}</b><small>cr / h</small></div></div>`;
  if(mode==='hire'){ const T0=team(), full=T0.hired.length>=teamCap(), fee=e.wage*3;
    return `<div class="emp">${head}${stats}<small class="hint">${R.d}</small><button class="btn wide" data-a="ehire" data-id="${e.id}" ${full||S.cr<fee?'disabled':''}>Embaucher · ${fmt(fee)} cr${full?' (équipe pleine)':''}</button></div>`; }
  const raise=Math.round(e.wage*.1/5)*5||5;
  return `<div class="emp">${head}${stats}<p class="eq">« ${quoteOf(e)} »</p><small class="hint">${e.rest>0?`😴 En repos encore ${Math.ceil(e.rest)} min`:R.d} · Total : ${fmt(Math.round(e.out||0))} ${R.unit}</small>
   <div class="eb"><button data-a="erest" data-id="${e.id}" ${e.rest>0?'disabled':''}>😴 Repos 10 min</button><button data-a="eraise" data-id="${e.id}" ${S.cr<raise*10?'disabled':''}>💶 Augmentation +${raise} cr/h</button><button class="bad" data-a="efire" data-id="${e.id}">Licencier</button></div></div>`; }
function equipSheet(X){
  if(!sheet||sheet.t!=='equipe') return false; const T=team(); refreshCands(); empTick();
  const tot=T.hired.reduce((a,e)=>a+e.wage,0);
  $('sheet').innerHTML=`<div class="inv equipe">${X}<h2>👥 Équipe</h2><p class="note">${T.hired.length} / ${teamCap()} employé${T.hired.length>1?'s':''} · salaires ${fmt(tot)} cr / h. Ils travaillent même quand tu ne joues pas (jusqu’à 6 h). Plus tu les traites bien, plus ils s’attachent et rendent.</p>
  ${T.hired.length?T.hired.map(e=>empRow(e,'team')).join(''):'<p class="note">Personne pour l’instant. Recrute ci-dessous.</p>'}
  <h3 class="rh">Candidats <small>(renouvelés toutes les 15 min)</small></h3>${T.cand.map(c=>empRow(c,'hire')).join('')}
  ${T.hired.length<teamCap()?'':`<p class="note">Équipe pleine. Une place de plus tous les 3 niveaux (max 6).</p>`}
  <button class="btn alt wide" data-a="ecand">🔄 Nouveaux candidats · ${fmt(300)} cr</button></div>`;
  return true;
}
Object.assign(ACT,{
 equipe(){ openSheet({t:'equipe'}); },
 ehire(d){ const T=team(), c=T.cand.find(x=>x.id===d.id); if(!c||T.hired.length>=teamCap()) return; const fee=c.wage*3; if(S.cr<fee) return toast('Pas assez de crédits'); S.cr-=fee; T.cand=T.cand.filter(x=>x!==c); c.hiredT=Date.now(); if(c.nom==='Gaspard Lambert') T.firstG=1; T.hired.push(c); T.last=Date.now(); auTry(()=>ui('buy')); toast(`${c.nom} rejoint l’équipe`); save(); renderSheet(); },
 efire(d){ const T=team(), e=T.hired.find(x=>x.id===d.id); if(!e) return; if(!e.cf||Date.now()-e.cf>4000){ e.cf=Date.now(); return toast(`Touche encore pour licencier ${e.nom}`); } T.hired=T.hired.filter(x=>x!==e); save(); renderSheet(); },
 erest(d){ const e=team().hired.find(x=>x.id===d.id); if(!e) return; e.rest=10; auTry(()=>ui('open')); toast(`${e.nom} se repose`); save(); renderSheet(); },
 eraise(d){ const e=team().hired.find(x=>x.id===d.id); if(!e) return; const r=Math.round(e.wage*.1/5)*5||5; if(S.cr<r*10) return toast('Pas assez de crédits'); S.cr-=r*10; e.wage+=r; e.lo=Math.min(100,e.lo+12); auTry(()=>ui('coins')); toast(`${e.nom} : « Merci, chef. »`); save(); renderSheet(); },
 ecand(){ if(S.cr<300) return toast('Pas assez de crédits'); S.cr-=300; refreshCands(true); save(); renderSheet(); }
});
setInterval(()=>{ try{ if(S&&S.team&&S.team.hired&&S.team.hired.length){ empTick(); if(sheet&&sheet.t==='equipe'&&!document.querySelector('#sheet :focus')){ const sc=$('sheet').scrollTop; renderSheet(); $('sheet').scrollTop=sc; } } }catch(_){} },20000);
document.addEventListener('visibilitychange',()=>{ try{ if(!document.hidden) empTick(); }catch(_){} });
/* carte dans la Base + objectif */
function teamCardH(){ const T=team(), n=T.hired.length; return `<button class="row teamcard" data-a="equipe"><span class="ico">👥</span><span class="grow"><span class="ttl">Équipe</span><br><span class="sub">${n?`${n} employé${n>1?'s':''} au travail · ${fmt(T.hired.reduce((a,e)=>a+e.wage,0))} cr/h de salaires`:'Embauche mécano, jardinier, pilote, vendeur ou gardien'}</span></span><span class="gain">${n?'Gérer':'Recruter'} ›</span></button>`; }
const _vBase21=vBase; vBase=function(){ return _vBase21(); };
const _goal4=goalNext;
goalNext=function(){ const r=_goal4(); if(r) return r; if(S.lvl>=3&&!team().hired.length&&(S.stats&&S.stats.races>=2)) return ['👥','Engage ton premier employé : il travaille même quand tu n’es pas là','equipe','Recruter']; return null; };
const _tab22=ACT.tab; ACT.tab=function(d){ if(d&&d.id==='equipe'){ openSheet({t:'equipe'}); return; } return _tab22.apply(this,arguments); };
/* finitions : retour haptique léger sur tous les boutons d'action */
document.addEventListener('pointerdown',e=>{ const b=e.target.closest&&e.target.closest('[data-a]'); if(b&&!b.disabled){ try{ navigator.vibrate&&navigator.vibrate(6); }catch(_){} } },true);
const _eq0=ACT.equipe; ACT.equipe=function(){ try{ auTry(()=>ui('open')); }catch(_){} return _eq0.apply(this,arguments); };
/* ===== son : la sono du monde coupe l'ambiance des menus ===== */
let AMBM=false;
const _aav=auApplyVol;
auApplyVol=function(){ _aav.apply(this,arguments); if(AMBM&&AU&&AU.ok){ const t=AU.ctx.currentTime; try{ AU.mus.gain.setTargetAtTime(.0001,t,.05); AU.b.amb.gain.setTargetAtTime(.0001,t,.05); AU.revIn.gain.setTargetAtTime(.0001,t,.05); }catch(_){} } };
function ambMute(on){ AMBM=on; if(!AU||!AU.ok) return; try{ if(on){ auHum(false); auApplyVol(); } else { auApplyVol(); try{ AU.revIn.gain.setTargetAtTime(.5,AU.ctx.currentTime,.2); }catch(_){} auView(view,true); } }catch(e){ console.error(e); } }
const _ms21=musicStart; musicStart=function(){ _ms21.apply(this,arguments); if(WM.on) ambMute(true); };
const _mst21=musicStop; musicStop=function(){ const was=WM.on; _mst21.apply(this,arguments); if(was||AMBM) ambMute(false); };
