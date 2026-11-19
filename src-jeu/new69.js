/* ===== v2.6 : sélection directe dans l'équipe de combat, argent sale + blanchiment dans le Réseau, équipe du labo (énergie sur 24 h, registre) ===== */

/* ---------- 1. équipe de combat : la pastille numérotée ajoute / retire la voiture sans ouvrir la fiche ---------- */
ACT.cbtmq=function(d){ const u=+d.id; if(!car(u)) return; let t=(S.cbTeam||cbTeam()).filter(x=>car(x)); const k=t.indexOf(u);
  if(k>=0){ if(t.length<=1) return toast('Il faut au moins une voiture'); t.splice(k,1); } else { if(t.length>=4) return toast('4 voitures maximum : retires-en une d’abord'); t.push(u); }
  S.cbTeam=t; save(); try{ ui('click'); }catch(_){}
  if(view==='arena'){ const m=document.querySelector('main'), y=m?m.scrollTop:0; render(); if(m) m.scrollTop=y; } else renderSheet(); };

/* ---------- 2. argent sale : tout ce que rapporte le labo est sale, à blanchir par le Réseau ---------- */
const DIRTY_K=1.25;                              /* le marché noir paie 25 % de plus */
const dirtyN=()=>Math.max(0,Math.round(S.dirty||0));
function dirtyAdd(v){ S.dirty=Math.max(0,(S.dirty||0)+v); }
const dirtyTxt=m=>String(m).replace(/\+([\d\s  ]+) cr\b/,(s,n)=>'+'+fmt(Math.round(parseInt(n.replace(/\D/g,''),10)*DIRTY_K))+' cr sales 🧺');
function asDirty(fn){ return function(){ const c0=S.cr, t0=toast; toast=function(m){ return t0.call(this,typeof m==='string'?dirtyTxt(m):m); };
  try{ return fn.apply(this,arguments); } finally{ toast=t0; const g=S.cr-c0; if(g>0){ S.cr=c0; dirtyAdd(g*DIRTY_K); try{ save(); renderSheet(); }catch(_){} } } }; }
ACT.rsell=asDirty(ACT.rsell); ACT.lsell=asDirty(ACT.lsell);
{ const _ir=illResolve; illResolve=function(ev,pay,win,pod){
    if(R&&R.dirtyBet&&ev&&ev.ill==='bet') return dirtyBetEnd(ev,pay,win,pod);
    const c0=S.cr, r=_ir.apply(this,arguments);
    if(ev&&ev.ill==='cargo'){ const g=S.cr-c0; if(g>0){ S.cr=c0; dirtyAdd(g*DIRTY_K); save(); } } return r; }; }
{ const _b=banner; banner=function(h){ try{ if(typeof h==='string'&&h.indexOf('Livraison réussie')>=0) h=h.replace(/\+([\d\s  ]+) cr/,(s,n)=>'+'+fmt(Math.round(parseInt(n.replace(/\D/g,''),10)*DIRTY_K))+' cr sales 🧺 à blanchir'); }catch(e){}
    return _b.apply(this,[h].concat([].slice.call(arguments,1))); }; }

/* filières de blanchiment */
const LDR=[
 {id:'lav',ic:'🧺',n:'Blanchisserie Néon',d:'Machines, linge, faux tickets de caisse. Aucun risque, mais ils gardent leur part.',ll:1,rep:0,min:200,max:8000,mins:6,y:.8,bust:0,heat:2},
 {id:'res',ic:'🍜',n:'Restaurant-façade',d:'Un resto qui déclare plus de couverts qu’il n’a de tables. Léger risque de contrôle.',ll:3,rep:5,min:2000,max:30000,mins:25,y:.9,bust:.04,loss:.5,heat:4},
 {id:'cas',ic:'🎰',n:'Casino clandestin',d:'Tu mises tout sur le tapis : 60 % de chances de ×1,5, sinon il ne reste que 30 %.',ll:5,rep:12,min:5000,max:80000,mins:20,gamble:{p:.6,win:1.5,lose:.3},heat:6},
 {id:'imm',ic:'🏢',n:'Société immobilière',d:'Des appartements achetés puis revendus. Long, presque sans perte, mais un contrôle fiscal coûte cher.',ll:7,rep:30,min:20000,max:300000,mins:90,y:.97,bust:.07,loss:.5,heat:3}];
const washSt=()=>{ const F=farm(); if(!F.wash) F.wash={ops:[],seq:0,tot:0,clean:0}; return F.wash; };
const washSlots=()=>1+Math.floor(labL()/3);
const mm69=ms=>{ const m=Math.max(0,Math.ceil(ms/60000)); return m>=60?Math.floor(m/60)+' h '+String(m%60).padStart(2,'0'):m+' min'; };
function washRisk(o){ return o.gamble?'⚠️ pile ou face : ×'+String(o.gamble.win).replace('.',',')+' ou ×'+String(o.gamble.lose).replace('.',','):o.bust?'risque de contrôle '+Math.round(o.bust*100)+' % (la moitié saisie)':'aucun risque'; }
function washCard(){ const F=farm(), W=washSt(), dn=dirtyN(), free=washSlots()-W.ops.length, now=Date.now();
  const ops=W.ops.map(op=>{ const o=LDR.find(x=>x.id===op.k), done=now>=op.end, pr=Math.min(100,Math.round((now-op.t0)/(op.end-op.t0)*100));
    return `<div class="wsh-op ${done?'done':''}"><span class="wsh-i">${o.ic}</span><div class="grow"><b>${o.n}</b><small>${fmt(op.amt)} cr sales · ${done?'terminé':'encore '+mm69(op.end-now)}</small><div class="wsh-b"><i style="width:${pr}%"></i></div></div>${done?`<button class="btn sm" data-a="washget" data-id="${op.u}">Récupérer</button>`:''}</div>`; }).join('');
  const list=LDR.map(o=>{ const lock=labL()<o.ll||F.rep<o.rep, ch=[[.25,'25 %'],[.5,'50 %'],[1,'Tout']].map(([v,t])=>{ const a=Math.floor(Math.min(o.max,dn*v)/10)*10; return `<button class="btn sm ${v===1?'':'alt'}" data-a="washgo" data-id="${o.id}" data-v="${v}" ${a<o.min||free<1?'disabled':''}>${t}${a>=o.min?' · '+fmt(a):''}</button>`; }).join('');
    return `<div class="wsh-o ${lock?'lock':''}"><div class="wsh-h"><span class="wsh-i">${o.ic}</span><div class="grow"><b>${o.n}</b><small>${o.d}</small><small>Rendement ${o.gamble?'variable':Math.round(o.y*100)+' %'} · ${mm69(o.mins*60000)} · ${washRisk(o)} · de ${fmt(o.min)} à ${fmt(o.max)}</small></div></div>${lock?`<small class="lk">🔒 Labo niveau ${o.ll} · réputation ${o.rep}</small>`:`<div class="wsh-c">${ch}</div>`}</div>`; }).join('');
  const bets=ILL.filter(e=>e.ill==='bet').map(e=>{ const lock=S.lvl<e.lvl||F.rep<e.rep, few=S.cars.length<e.manches.length;
    return `<div class="rit ${lock?'lock':''}"><div class="rart"><span class="big">🎲</span></div><div class="grow"><b>${e.nom.replace(/ \(mise [\d  ]+\)/,'')}</b><small>Mise sale ${fmt(e.bet)} cr · gagne : <b>+${fmt(Math.round(e.bet*1.6))} cr propres</b> (×1,6) · podium ×0,85 · perdu : la mise part</small></div>${lock?`<small class="lk">Niv. ${e.lvl}<br>Rép. ${e.rep}</small>`:`<button class="btn sm" data-a="illgod" data-id="${e.id}" ${dn<e.bet||few?'disabled':''}>Go</button>`}</div>`; }).join('');
  return `<div class="rcard wash"><h3>🧺 Argent sale <b class="wsh-n">${fmt(dn)} cr</b></h3>
    <p class="sm">Tout ce que rapporte le labo (ventes, livraisons, employés) est de l’<b>argent sale</b> (+${Math.round((DIRTY_K-1)*100)} % : le marché noir paie mieux). Tu ne peux pas le dépenser : fais-le passer par une filière pour obtenir des <b>crédits propres</b>. Plus c’est risqué, plus ça rapporte.</p>
    ${W.tot?`<p class="sm">Déjà blanchi : ${fmt(Math.round(W.tot))} cr sales → ${fmt(Math.round(W.clean))} cr propres.</p>`:''}
    <div class="rrow sm"><span>Filières libres</span><b>${free} / ${washSlots()}</b></div>${ops}
    <h4 class="wsh-t">Filières</h4>${list}
    <h4 class="wsh-t">🎲 Courses truquées (mise sale)</h4><p class="sm">Mise avec de l’argent sale : si tu gagnes, il ressort propre avec une grosse prime.</p>${bets}</div>`; }
{ const _rn=rNet; rNet=function(){ let h=''; try{ h=washCard(); }catch(e){ console.warn('wash',e); } return h+_rn.apply(this,arguments); }; }
{ const _rh=ranchHead; ranchHead=function(){ let h=_rh.apply(this,arguments); try{ h=h.replace('<div><small>Crédits</small><b>'+fmt(S.cr)+'</b></div>','<div><small>Crédits</small><b>'+fmt(S.cr)+'</b></div><div class="dirty"><small>Argent sale</small><b>'+fmt(dirtyN())+'</b></div>'); }catch(e){} return h; }; }
Object.assign(ACT,{
 washgo(d){ const o=LDR.find(x=>x.id===d.id), F=farm(); if(!o) return; if(labL()<o.ll||F.rep<o.rep) return toast('🔒 Labo niveau '+o.ll+' et réputation '+o.rep+' requis');
   const W=washSt(); if(W.ops.length>=washSlots()) return toast('Toutes tes filières sont occupées'); let amt=Math.floor(Math.min(o.max,dirtyN()*(+d.v||1))/10)*10;
   if(amt<o.min) return toast(dirtyN()<o.min?'Pas assez d’argent sale (minimum '+fmt(o.min)+')':'Montant trop faible'); dirtyAdd(-amt); const t0=Date.now();
   W.ops.push({u:'w'+(++W.seq)+t0.toString(36),k:o.id,amt,t0,end:t0+o.mins*60000,r:Math.random()}); toast(o.ic+' '+fmt(amt)+' cr sales en cours de blanchiment ('+mm69(o.mins*60000)+')'); try{ auTry(()=>ui('open')); }catch(_){} save(); renderSheet(); },
 washget(d){ const W=washSt(), F=farm(), i=W.ops.findIndex(x=>x.u===d.id); if(i<0) return; const op=W.ops[i], o=LDR.find(x=>x.id===op.k); if(Date.now()<op.end) return toast('Pas encore terminé');
   let out, msg, heat=o.heat;
   if(o.gamble){ if(op.r<o.gamble.p){ out=op.amt*o.gamble.win; msg=`🎰 <b>Jackpot !</b> ${fmt(op.amt)} cr sales → <b>+${fmt(Math.round(out))} cr propres</b> (×${String(o.gamble.win).replace('.',',')}).`; } else { out=op.amt*o.gamble.lose; msg=`🎰 <b>La maison gagne.</b> ${fmt(op.amt)} cr sales → seulement ${fmt(Math.round(out))} cr propres.`; } }
   else if(op.r<o.bust){ out=op.amt*(1-o.loss); heat+=10; try{ karmaAdd(-1); }catch(_){} msg=`🚔 <b>Contrôle !</b> ${o.n} : la moitié de l’argent est saisie. Tu récupères <b>${fmt(Math.round(out))} cr propres</b> sur ${fmt(op.amt)}.`; }
   else{ out=op.amt*o.y; msg=`${o.ic} <b>${o.n}</b> : ${fmt(op.amt)} cr sales → <b>+${fmt(Math.round(out))} cr propres</b> (${Math.round(o.y*100)} %).`; }
   out=Math.round(out); S.cr+=out; W.tot+=op.amt; W.clean+=out; W.ops.splice(i,1); F.rep+=op.amt/8000; F.heat.atelier=Math.min(100,F.heat.atelier+heat); F.heat.ranch=Math.min(100,F.heat.ranch+heat);
   try{ auTry(()=>ui('coins')); }catch(_){} save(); renderSheet(); setTimeout(()=>banner(msg),150); },
 illgod(d){ const e=ILL.find(x=>x.id===d.id), F=farm(); if(!e||e.ill!=='bet'||S.lvl<e.lvl||F.rep<e.rep||S.cars.length<e.manches.length) return; if(dirtyN()<e.bet) return toast('Pas assez d’argent sale pour la mise');
   closeSheet(); ACT.ev({id:e.id}); if(R&&R.ev&&R.ev.id===e.id){ R.cargo=null; R.dirtyBet=true; render(); } } });
function dirtyBetEnd(ev,pay,win,pod){ const F=farm(), b=ev.bet; let msg; dirtyAdd(-b);
  if(win){ const v=Math.round(b*1.6); S.cr+=v; F.rep+=1+ev.rep*.1; try{ karmaAdd(-1); }catch(_){} msg=`🎲 <b>Course truquée gagnée</b> : ${fmt(b)} cr sales ressortent propres, <b>+${fmt(v)} cr</b> (×1,6).`; }
  else if(pod){ const v=Math.round(b*.85); S.cr+=v; msg=`🎲 Podium : ${fmt(b)} cr sales blanchis à 85 %, <b>+${fmt(v)} cr propres</b>.`; }
  else msg=`🎲 <b>Perdu</b> : la mise sale de ${fmt(b)} cr est partie.`;
  F.heat.atelier=Math.min(100,F.heat.atelier+ev.heat*.3); F.heat.ranch=Math.min(100,F.heat.ranch+ev.heat*.3); R.dirtyBet=false; save(); setTimeout(()=>banner(msg),400); }
setInterval(()=>{ try{ const F=S&&S.farm; if(!F||!F.wash||!F.wash.ops) return; let n=0; F.wash.ops.forEach(op=>{ if(Date.now()>=op.end&&!op.n){ op.n=1; n++; } }); if(n){ toast('🧺 Blanchiment terminé : récupère l’argent dans le Réseau'); save(); if(sheet&&sheet.t==='ranch') renderSheet(); } }catch(e){} },15000);

/* ---------- 3. équipe du labo : énergie sur 24 h, activité détaillée, registre ---------- */
const EMP_CAP=1440;                                   /* ils travaillent jusqu'à 24 h hors-ligne */
const empDrain=e=>(100/1440)*TRAITS[e.tr].drain*5/(2+e.end*.6);   /* % d'énergie perdu par minute : 24 h pour un employé moyen */
const EMP_REST=60, EMP_REC=1.7;                       /* repos d'1 h, +1,7 %/min */
function eLog(e,tm,k,n,v,x,extra){ const T=team(); if(!T.log) T.log=[]; const b=Math.floor(tm/3600000); let l=T.log.find(q=>q.e===e.id&&q.k===k&&q.b===b);
  if(!l){ l={b,e:e.id,nm:e.nom,r:e.role,k,n:0,v:0,x:0,tm}; T.log.unshift(l); if(T.log.length>320) T.log.length=320; }
  l.n+=n||0; l.v+=v||0; l.x+=x||0; if(tm>l.tm) l.tm=tm; if(extra){ l.c=l.c||{}; for(const q in extra) l.c[q]=(l.c[q]||0)+extra[q]; }
  const st=e.st||(e.st={}); st[k]=(st[k]||0)+(n||0)+(k==='repair'?(v||0):0); }
function empGard2(eff,d){ const F=S.farm, r={w:0,p:0,h:0,noW:0,noC:0}; if(!F||!F.found) return r; ranchSim(); let cap=Math.max(1,Math.floor(4*eff*d)), harv=Math.max(1,Math.floor(2*eff*d)); const t0=toast; toast=()=>{};
  try{ for(const room in ROOMS){ const R2=F.rooms[room]; if(!R2||!R2.on) continue; R2.slots.forEach((sl,i)=>{ if(!sl) return;
      if(sl.pest&&cap>0){ const k=sl.pest==='mold'?'FONG':'INSEC'; if((F.chem[k]||0)>0){ F.chem[k]--; sl.pest=null; cap--; r.p++; } else r.noC++; }
      if((sl.st==='germ'||sl.st==='veg'||sl.st==='flo')&&sl.w<42&&cap>0){ if(F.water>=3){ sl.w=Math.min(88,sl.w+30); F.water-=3; cap--; r.w++; } else r.noW++; }
      if(sl.st==='ready'&&harv>0){ const keep=RY.tab; RY.tab=room; _rh0({id:String(i)}); RY.tab=keep; harv--; r.h++; } }); } } finally{ toast=t0; } return r; }
function empIll2(e,eff,d){ const F=S.farm, r={w:0,f:0,p:0,t:0,noW:0,noC:0}; if(!F||!F.found) return r; const plants=[];
  ranchSim(); for(const room in ROOMS){ const R2=F.rooms[room]; if(R2&&R2.on) R2.slots.forEach(sl=>{ if(sl&&sl.st!=='dead'&&sl.st!=='ready') plants.push(sl); }); }
  if(e.role==='irri'){ let cap=Math.max(1,Math.floor(5*eff*d)); for(const sl of plants){ if(cap<=0) break; if(sl.w<50){ if((F.can||0)>0) F.can--; else if(F.water>=3) F.water-=3; else { r.noW++; break; } sl.w=Math.min(100,sl.w+36); cap--; r.w++; } } }
  else if(e.role==='nut'){ let cap=Math.max(1,Math.floor(4*eff*d)); for(const sl of plants){ for(const k of ['N','P','K']){ if(cap>0&&sl[k]<40){ if((F.chem[k]||0)>0){ F.chem[k]--; sl[k]=Math.min(100,sl[k]+22); cap--; r.f++; } else r.noC++; } }
      if(cap>0&&sl.hp<60){ if((F.chem.CM||0)>0){ F.chem.CM--; sl.hp=Math.min(100,sl.hp+10); cap--; r.f++; } else r.noC++; } } }
  else if(e.role==='chim'){ let cap=Math.max(1,Math.floor(3*eff*d)); const use=k=>{ if(cap<1) return false; if((F.chem[k]||0)<1){ r.noC++; return false; } F.chem[k]--; cap--; return true; };
    for(const sl of plants){ const ideal=(MED[sl.med]&&MED[sl.med].ph)||6.3;
      if(sl.pest){ if(use(sl.pest==='mold'?'FONG':'INSEC')){ sl.pest=null; sl.prot=4; r.p++; } }
      else if(sl.ph>ideal+.6){ if(use('PHm')){ sl.ph-=.45; r.t++; } } else if(sl.ph<ideal-.6){ if(use('PHp')){ sl.ph+=.45; r.t++; } }
      else if(sl.st==='veg'&&!sl.enz){ if(use('ENZ')){ sl.enz=4; r.t++; } } else if(sl.st==='flo'&&!sl.boost){ if(use('BOOST')){ sl.boost=4; sl.q=Math.min(100,sl.q+6); r.t++; } } } }
  const did=r.w+r.f+r.p+r.t; if(did>0) labGain(did*.15); return r; }
function empSell2(e,eff,d,rate,mult,heat,kar){ const F=S.farm, r={g:0,v:0}; if(!F||!F.found) return r; let g=rate*eff*d;
  for(const k in F.stock){ if(g<=0) break; const s=F.stock[k]; if(!s||s.g<1) continue; const n=Math.floor(Math.min(s.g,g)); if(n<1) continue; const v=Math.round(n*sellPrice(k,s.q)*mult*(1+.02*e.sk)*DIRTY_K); s.g-=n; g-=n; dirtyAdd(v); r.g+=n; r.v+=v; F.stats.sold+=n; F.rep+=n*.02; karmaAdd(-n*kar); F.heat.atelier=Math.min(100,F.heat.atelier+n*heat); F.heat.ranch=Math.min(100,F.heat.ranch+n*heat); }
  return r; }
function empWork69(e,eff,d,tm){ const F=S.farm, role=e.role; let did=0, blocked=null;
  if(role==='mech'){ const lows=S.cars.filter(c=>c.etat<100).sort((a,b)=>a.etat-b.etat); let pts=2.5*eff*d; const cars={}; for(const c of lows){ if(pts<=0) break; const up=Math.min(100-c.etat,pts); c.etat=Math.min(100,Math.round((c.etat+up)*10)/10); pts-=up; did+=up; cars[M[c.mid].nom]=(cars[M[c.mid].nom]||0)+up; } if(did>0) eLog(e,tm,'repair',0,did,0,cars); }
  else if(role==='gard'){ const r=empGard2(eff,d); did=r.w+r.p+r.h; if(r.w) eLog(e,tm,'water',r.w); if(r.p) eLog(e,tm,'pest',r.p); if(r.h) eLog(e,tm,'harv',r.h); if(r.noW&&!r.w) blocked='noWater'; else if(r.noC&&!r.p) blocked='noChem'; }
  else if(role==='pil'){ const cr=Math.round(12*eff*d*(1+S.lvl*.03)), xp=Math.max(0,Math.round(1.4*eff*d)); S.cr+=cr; addXP(xp); did=cr; e.rf=(e.rf||0)+d/9*Math.min(1.3,eff); const n=Math.floor(e.rf); e.rf-=n; eLog(e,tm,'race',n,cr,xp); }
  else if(role==='ven'){ const r=empSell2(e,eff,d,3,1,.05,.02); did=r.v; if(r.g) eLog(e,tm,'sell',r.g,r.v); }
  else if(role==='dealer'){ const r=empSell2(e,eff,d,2.2,1.12,.06,.03); did=r.v; if(r.g) eLog(e,tm,'sell',r.g,r.v); }
  else if(role==='chauf'){ const r=empSell2(e,eff,d,3.5,1.42,.11,.03); did=r.v; if(r.g) eLog(e,tm,'sell',r.g,r.v); }
  else if(role==='guard'||role==='avo'){ if(F&&F.heat){ const rate=role==='avo'?1.5:.6; ['atelier','ranch'].forEach(room=>{ const h=F.heat[room]||0, dn=Math.min(h,rate*eff*d); F.heat[room]=h-dn; did+=dn; }); if(did>0) eLog(e,tm,'heat',Math.round(did*10)/10); } }
  else if(role==='irri'||role==='nut'||role==='chim'){ const r=empIll2(e,eff,d); did=r.w+r.f+r.p+r.t; if(r.w) eLog(e,tm,'water',r.w); if(r.f) eLog(e,tm,'feed',r.f); if(r.p) eLog(e,tm,'pest',r.p); if(r.t) eLog(e,tm,'treat',r.t); if(r.noW&&!r.w) blocked='noWater'; else if(r.noC&&did===0) blocked='noChem'; }
  return {did,blocked}; }
empTick=function(){ const T=team(); if(!T.hired.length){ T.last=Date.now(); return; }
  const now=Date.now(); let dt=Math.min((now-T.last)/60000,EMP_CAP); T.last=now; if(dt<=0.01) return; let left=dt, k=0; const t0=now-dt*60000;
  while(left>1e-4){ const d=Math.min(left,5); left-=d; k+=d; const tm=t0+k*60000;
    T.hired.forEach(e=>{ const wage=e.wage*d/60;
      if(e.rest>0){ e.rest=Math.max(0,e.rest-d); e.en=Math.min(100,e.en+EMP_REC*d); e.lo=Math.min(100,e.lo+.5*d); S.cr=Math.max(0,S.cr-wage); return; }
      if(S.cr<wage){ e.lo=Math.max(0,e.lo-.8*d); e.msg='unpaid'; eLog(e,tm,'unpaid',1); return; }
      S.cr-=wage; e.paid=(e.paid||0)+wage; e.lo=Math.min(100,e.lo+.12*d); e.en=Math.max(0,e.en-empDrain(e)*d);
      if(e.en<=6&&T.auto!==false){ e.rest=EMP_REST; e.msg=''; eLog(e,tm,'autorest',1); return; }
      if(e.en<=0){ e.msg='tired'; eLog(e,tm,'tired',1); return; }
      let res={did:0,blocked:null}; try{ if(!isIll(e.role)||(illOpen()&&S.cr>0)) res=empWork69(e,empEff(e),d,tm); }catch(err){ console.error(err); }
      if(res.blocked){ eLog(e,tm,res.blocked,1); e.idle=0; }
      else if(res.did<=0){ e.idle=(e.idle||0)+d; if(e.idle>=60){ e.idle=0; eLog(e,tm,'idle',1); } } else e.idle=0;
      e.out=(e.out||0)+res.did; T.tot[e.role]=(T.tot[e.role]||0)+res.did; e.msg=e.en<25?'tired':res.blocked||''; });
  }
  save(); };
/* actions : repos d'1 h, journal des événements */
{ const _h=ACT.ehire; ACT.ehire=function(d){ const T=team(), c=T.cand.find(x=>x.id===d.id), n0=T.hired.length; const r=_h.apply(this,arguments); if(c&&T.hired.length>n0) eLog(c,Date.now(),'hire',1); return r; }; }
{ const _f=ACT.efire; ACT.efire=function(d){ const T=team(), e=T.hired.find(x=>x.id===d.id), n0=T.hired.length; const r=_f.apply(this,arguments); if(e&&T.hired.length<n0) eLog(e,Date.now(),'fire',1); return r; }; }
{ const _r=ACT.eraise; ACT.eraise=function(d){ const e=team().hired.find(x=>x.id===d.id), w0=e&&e.wage; const r=_r.apply(this,arguments); if(e&&e.wage>w0) eLog(e,Date.now(),'raise',1,e.wage-w0); return r; }; }
ACT.erest=function(d){ const e=team().hired.find(x=>x.id===d.id); if(!e) return; e.rest=EMP_REST; try{ auTry(()=>ui('open')); }catch(_){} eLog(e,Date.now(),'rest',1); toast(e.nom+' se repose 1 h (+100 % d’énergie)'); save(); render(); };
ACT.eqauto=function(){ const T=team(); T.auto=T.auto===false; save(); render(); };
ACT.eqlog=function(d){ EQ.tab='log'; EQ.f=d&&d.id||'all'; render(); try{ document.querySelector('main').scrollTop=0; }catch(_){} };
ACT.eqf=function(d){ EQ.f=d.id; render(); };
const LOGI={water:'💧',pest:'🦠',harv:'✂️',feed:'🧪',treat:'⚗️',repair:'🔧',race:'🏁',sell:'🛍️',heat:'🛡️',noWater:'⚠️',noChem:'⚠️',tired:'😴',autorest:'😴',rest:'😴',unpaid:'💸',idle:'💤',hire:'👋',fire:'🚪',raise:'💶'};
function logTxt(l){ const n=Math.round(l.n), s=n>1?'s':'';
  switch(l.k){
   case 'water': return `a arrosé <b>${n}</b> plante${s}`;
   case 'pest': return `a détruit <b>${n}</b> foyer${s} de moisissures / insectes`;
   case 'harv': return `a récolté <b>${n}</b> plante${s}`;
   case 'feed': return `a nourri <b>${n}</b> fois les plantes (N-P-K, Ca-Mg)`;
   case 'treat': return `a fait <b>${n}</b> réglage${s} (pH, enzymes, boosters)`;
   case 'repair': return `a réparé <b>${Math.round(l.v)}</b> pts d’état${l.c?' : '+Object.entries(l.c).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([q,p])=>q+' (+'+Math.round(p)+')').join(', '):''}`;
   case 'race': return `a gagné <b>${n}</b> course${s} · +${fmt(Math.round(l.v))} cr · +${Math.round(l.x)} XP`;
   case 'sell': return `a écoulé <b>${n}</b> g · +${fmt(Math.round(l.v))} cr sales`;
   case 'heat': return `a fait baisser la chaleur de <b>${Math.round(l.n)}</b> pts`;
   case 'noWater': return `n’a pas pu arroser : <b>citerne vide</b>, remplis-la`;
   case 'noChem': return `a manqué de produits (fongicide, insecticide, engrais…) : <b>réapprovisionne</b> la boutique du labo`;
   case 'tired': return `est <b>épuisé</b> et ne travaille plus : mets-le au repos`;
   case 'autorest': return `s’est mis en <b>repos automatique</b> (1 h) pour récupérer`;
   case 'rest': return `s’est <b>reposé</b> 1 h`;
   case 'unpaid': return `n’a <b>pas été payé</b> : crédits insuffisants`;
   case 'idle': return `n’avait <b>rien à faire</b> depuis 1 h (aucune plante ou voiture à traiter)`;
   case 'hire': return `a été <b>embauché</b>`;
   case 'fire': return `a été <b>licencié</b>`;
   case 'raise': return `a reçu une <b>augmentation</b> de +${fmt(Math.round(l.v))} cr/h`; }
  return l.k; }
function logT69(b){ const d=new Date(b*3600000), n=new Date(), dd=Math.round((new Date(n.getFullYear(),n.getMonth(),n.getDate())-new Date(d.getFullYear(),d.getMonth(),d.getDate()))/86400000), h=d.getHours()+' h';
  return dd<=0?'Aujourd’hui '+h:dd===1?'Hier '+h:String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+' '+h; }
function labState69(){ const F=S.farm, o={n:0,th:0,pe:0,rd:0,dead:0}; if(!F||!F.found) return o; try{ ranchSim(); }catch(e){}
  for(const room in ROOMS){ const R2=F.rooms[room]; if(!R2||!R2.on) continue; R2.slots.forEach(sl=>{ if(!sl) return; o.n++; if(sl.st==='dead') o.dead++; else if(sl.st==='ready') o.rd++; else { if(sl.w<42) o.th++; if(sl.pest) o.pe++; } }); } return o; }
function empDay69(e){ const T=team(), lim=Math.floor((Date.now()-864e5)/3600000), a={}; (T.log||[]).forEach(l=>{ if(l.e!==e.id||l.b<lim) return; a[l.k]=(a[l.k]||0)+(l.k==='repair'?l.v:l.k==='race'||l.k==='sell'?l.n:l.n); }); return a; }
function dayTxt69(a){ const p=[]; if(a.water) p.push('💧 '+Math.round(a.water)); if(a.feed) p.push('🧪 '+Math.round(a.feed)); if(a.treat) p.push('⚗️ '+Math.round(a.treat)); if(a.pest) p.push('🦠 '+Math.round(a.pest)); if(a.harv) p.push('✂️ '+Math.round(a.harv)); if(a.repair) p.push('🔧 '+Math.round(a.repair)+' pts'); if(a.race) p.push('🏁 '+Math.round(a.race)); if(a.sell) p.push('🛍️ '+Math.round(a.sell)+' g'); if(a.heat) p.push('🛡️ −'+Math.round(a.heat)); return p.join(' · '); }
function labStrip69(){ const T=team(), s=labState69(), bad=T.hired.filter(e=>e.en<25).length;
  return `<div class="x-lab"><div class="x-lab-h"><b>🌿 État du labo</b><button data-a="eqauto" class="x-auto ${T.auto===false?'':'on'}">😴 Repos auto : ${T.auto===false?'non':'oui'}</button></div>
   <div class="x-lab-g">${s.n?`<span>🌱 ${s.n} plantes</span><span class="${s.th?'bad':''}">💧 ${s.th} assoiffée${s.th>1?'s':''}</span><span class="${s.pe?'bad':''}">🦠 ${s.pe} parasite${s.pe>1?'s':''}</span><span class="${s.rd?'ok':''}">✂️ ${s.rd} prête${s.rd>1?'s':''}</span>`:'<span>Aucune plante pour l’instant</span>'}${bad?`<span class="bad">😴 ${bad} fatigué${bad>1?'s':''}</span>`:''}</div>
   <small>L’énergie baisse en <b>24 h</b> pour un employé moyen (selon endurance et caractère). Un repos d’1 h la remplit. Ils travaillent hors-ligne jusqu’à 24 h.</small></div>`; }
function eqLogHTML(){ const T=team(), f=EQ.f||'all', L=(T.log||[]).slice().sort((a,b)=>b.tm-a.tm).filter(l=>f==='all'||l.e===f), lim=Math.floor((Date.now()-864e5)/3600000), tot={};
  (T.log||[]).forEach(l=>{ if(l.b<lim||!['water','feed','treat','pest','harv','repair','race','sell','heat'].includes(l.k)) return; tot[l.k]=(tot[l.k]||0)+(l.k==='repair'?l.v:l.n); });
  const chips=[['all','Tous']].concat(T.hired.map(e=>[e.id,e.nom.split(' ')[0]])).map(([id,n])=>`<button class="${f===id?'on':''}" data-a="eqf" data-id="${id}">${n}</button>`).join('');
  const day=dayTxt69(tot);
  return `<div class="x-lab"><b>📒 Sur les dernières 24 h</b><div class="x-lab-g"><span>${day||'Rien pour l’instant'}</span></div></div>
   <div class="eqchips">${chips}</div>
   <div class="eqlog">${L.length?L.slice(0,120).map(l=>`<div class="eql ${/^(noWater|noChem|tired|unpaid|idle)$/.test(l.k)?'warn':''}"><span class="eql-i">${LOGI[l.k]||'•'}</span><div><small>${logT69(l.b)} · ${ROLES[l.r]?ROLES[l.r].ic+' '+ROLES[l.r].n:''}</small><span><b>${l.nm}</b> ${logTxt(l)}</span></div></div>`).join(''):'<div class="x-empty"><b>Le registre est vide.</b><small>Dès que tes employés travaillent, tout est noté ici : arrosages, récoltes, réparations, courses, ventes…</small></div>'}</div>`; }
{ const _ec=empCard; empCard=function(e){ let h=_ec(e); try{ const day=dayTxt69(empDay69(e)); h=h.replace('<div class="x-ac">',`<small class="x-day">${day?'Sur 24 h : '+day:'Rien de noté sur 24 h'}</small><div class="x-ac">`).replace('😴 Repos</button>','😴 Repos 1 h</button>').replace('<button class="bad" data-a="efire"',`<button data-a="eqlog" data-id="${e.id}" title="Registre">📒</button><button class="bad" data-a="efire"`); }catch(_){} return h; }; }
{ const _ve=vEquipe; vEquipe=function(){ const tab=EQ.tab; if(tab==='log') EQ.tab='rec'; let h; try{ h=_ve.apply(this,arguments); } finally{ EQ.tab=tab; }
  const T=team(), tabs=[['team','Mon équipe ('+T.hired.length+')'],['rec','Recruter'],['log','📒 Registre']], sub='<div class="subtabs">'+tabs.map(([id,n])=>`<button data-a="eqtab" data-id="${id}" ${EQ.tab===id?'aria-current="true"':''}>${n}</button>`).join('')+'</div>';
  const m=h.match(/<div class="subtabs">[\s\S]*?<\/div>/); if(!m) return h; const i=h.indexOf(m[0]);
  if(tab==='log') return h.slice(0,i)+sub+eqLogHTML();
  return h.slice(0,i)+(tab==='team'&&T.hired.length?labStrip69():'')+sub+h.slice(i+m[0].length); }; }
