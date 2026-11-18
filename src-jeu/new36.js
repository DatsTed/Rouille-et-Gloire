/* ---- v0.62 : niveaux du labo, équipe clandestine, équipe sur l'accueil ---- */
const LAB_TIERS=['','Atelier caché · Néon T5 · Northern Lights · White Widow','LED blanche · AK-47 · Critical Mass · enzymes · anti-fongiques · ventilation · Arroseur','LED spectre complet · Blue Dream · Booster · coco · citerne · Nutritionniste','Ranch · OG Kush · Granddaddy Purple · filtre à charbon · pot-de-vin','Iodure céramique · Jack Herer · Purple Haze · irrigation auto · Chimiste','Girl Scout · Sour Diesel · hydroponie · Dealer','Durban Poison · Zkittlez · lampe HPS · Avocat','Gorilla Glue · Wedding Cake · Chauffeur','Amnesia Haze · LED Pro','Gelato · maître cultivateur'];
const labNeed=l=>Math.round(100*Math.pow(l,1.7));
const strLL=s=>{ const r=s.rep||0; return r>=64?10:r>=56?9:r>=40?8:r>=28?7:r>=20?6:r>=14?5:r>=10?4:r>=6?3:r>=2?2:1; };
STR.forEach(s=>{ s.ll=strLL(s); });
const LAMP_LL={t5:1,led:2,led2:3,cmh:5,hps:7,ledp:9}, CHEM_LL={ENZ:2,FONG:2,INSEC:2,BOOST:3}, GEAR_LL={fan:2,filter:4,irri:5}, MED_LL={terreau:1,coco:3,hydro:6};
function labF(){ const F=farm(); if(F.ll==null){ const st=F.stats||{}; let x=(st.harv||0)*20+(st.sold||0)*.5+(st.deliv||0)*60, l=1; while(l<10&&x>=labNeed(l)){ l++; } F.ll=l; F.lx=Math.max(0,Math.round(x)); F.sx={h:st.harv||0,s:st.sold||0,d:st.deliv||0}; } return F; }
const labL=()=>{ try{ const F=S&&S.farm; if(!F||!F.found) return 0; return labF().ll||1; }catch(e){ return 1; } };
function labGain(x){ const F=labF(); if(F.ll>=10){ F.lx=labNeed(10); return; } F.lx+=x; while(F.ll<10&&F.lx>=labNeed(F.ll)){ F.ll++; try{ banner('🧪 <b>Labo niveau '+F.ll+' !</b><br>Débloqué : '+LAB_TIERS[F.ll]); auTry(()=>ui('buy')); }catch(e){} } }
setInterval(()=>{ try{ if(!(S&&S.farm&&S.farm.found)) return; const F=labF(), st=F.stats, sx=F.sx||(F.sx={h:st.harv||0,s:st.sold||0,d:st.deliv||0});
  const dh=(st.harv||0)-sx.h, ds=(st.sold||0)-sx.s, dd=(st.deliv||0)-sx.d; if(dh<=0&&ds<=0&&dd<=0){ sx.h=st.harv||0; sx.s=st.sold||0; sx.d=st.deliv||0; return; }
  sx.h=st.harv||0; sx.s=st.sold||0; sx.d=st.deliv||0; labGain(Math.max(0,dh)*20+Math.max(0,ds)*.5+Math.max(0,dd)*60); save(); }catch(e){} },1500);
function labReq(t,a,b){ if(t==='seed') return (SID[a]&&SID[a].ll)||1; if(t==='chem') return CHEM_LL[a]||1; if(t==='lamp') return LAMP_LL[a]||1; if(t==='gear') return GEAR_LL[b]||1; if(t==='tank') return 3; if(t==='bribe') return 4; return 1; }
const _rb36=ACT.rbuy; ACT.rbuy=function(d){ const [t,a,b]=String(d.id).split(':'), n=labReq(t,a,b); if(labL()<n){ toast('🔒 Labo niveau '+n+' requis'); return; } return _rb36.apply(this,arguments); };
const _rp36=ACT.rplant; ACT.rplant=function(d){ try{ const P=RY.pick||{}, n=MED_LL[P.med]||1; if(labL()<n){ toast('🔒 '+MED[P.med].nom+' : labo niveau '+n); return; } }catch(e){} return _rp36.apply(this,arguments); };
const _rs36=ACT.rbuyslot; ACT.rbuyslot=function(d){ const F=farm(), R=F.rooms[d.id], RM=ROOMS[d.id]; const base=d.id==='ranch'?8:6, allow=base+2*(labL()-1); if(R&&R.slots.length>=allow&&R.slots.length<RM.max){ toast('🔒 Parcelle suivante : labo niveau '+Math.min(10,labL()+1)); return; } return _rs36.apply(this,arguments); };
const _rr36=ACT.rbuyranch; ACT.rbuyranch=function(){ if(labL()<4){ toast('🔒 Le ranch demande le labo niveau 4'); return; } return _rr36.apply(this,arguments); };
/* ----- équipe : rôles clandestins ----- */
Object.assign(ROLES,{
 irri:{n:'Arroseur',ic:'💧',base:210,d:'Arrose seul les plantes qui ont soif (utilise ta citerne).',unit:'arrosages',ll:2,ill:1},
 nut:{n:'Nutritionniste',ic:'🧪',base:330,d:'Nourrit les plantes avec tes engrais N-P-K et Ca-Mg.',unit:'soins',ll:3,ill:1},
 chim:{n:'Chimiste',ic:'⚗️',base:430,d:'Corrige le pH, soigne les nuisibles, pose enzymes et boosters.',unit:'traitements',ll:5,ill:1},
 dealer:{n:'Dealer',ic:'🕶️',base:380,d:'Écoule ton stock dans la rue, un peu mieux payé mais plus risqué.',unit:'cr de ventes',ll:6,ill:1},
 avo:{n:'Avocat',ic:'⚖️',base:470,d:'Fait retomber la chaleur bien plus vite qu’un gardien.',unit:'pts de chaleur',ll:7,ill:1},
 chauf:{n:'Chauffeur',ic:'🚐',base:540,d:'Livre ton stock en gros à prix premium. Beaucoup de chaleur.',unit:'cr de livraisons',ll:8,ill:1}});
const isIll=r=>!!(ROLES[r]&&ROLES[r].ill);
const illOpen=()=>{ try{ return labLv()>=LAB_LVL&&S.farm&&S.farm.found; }catch(e){ return false; } };
const legalCap=()=>Math.min(6,1+Math.floor(S.lvl/3));
const illCap=()=>illOpen()?Math.floor((labL()+1)/2):0;
let CAPR=null;
teamCap=function(){ const T=team(); if(!CAPR) return legalCap()+illCap(); const cls=isIll(CAPR), n=T.hired.filter(e=>isIll(e.role)===cls).length; return T.hired.length-n+(cls?illCap():legalCap()); };
const _er36=empRow; empRow=function(e,mode){ CAPR=e.role; try{ return _er36(e,mode); } finally{ CAPR=null; } };
const _eh36=ACT.ehire; ACT.ehire=function(d){ const c=team().cand.find(x=>x.id===d.id); CAPR=c?c.role:null; try{ return _eh36.apply(this,arguments); } finally{ CAPR=null; } };
refreshCands=function(force){
  const T=team(), F=S.farm, can=r=>{ const R=ROLES[r]; if(R.ill) return illOpen()&&labL()>=R.ll; return r!=='gard'||(F&&F.found); };
  if(!force&&T.cand.length&&Date.now()-T.candT<15*60000&&!T.cand.some(c=>ROLES[c.role].ill&&!can(c.role))&&(!illOpen()||T.cand.some(c=>ROLES[c.role].ill)||T.illT===labL())) return;
  const roles=Object.keys(ROLES).filter(can), out=[];
  if(!T.hired.some(e=>e.role==='gard')&&can('gard')&&!T.firstG){ const g=newCand('gard','des'); g.nom='Gaspard Lambert'; g.sk=3; g.end=4; g.wage=wageOf('gard',3,'des'); g.lo=25; out.push(g); }
  const ill=roles.filter(r=>ROLES[r].ill), leg=roles.filter(r=>!ROLES[r].ill);
  if(ill.length){ const r=ill[Math.floor(Math.random()*ill.length)]; out.push(newCand(r)); if(ill.length>2){ const r2=ill[Math.floor(Math.random()*ill.length)]; if(r2!==r) out.push(newCand(r2)); } }
  while(out.length<4){ const r=leg[Math.floor(Math.random()*leg.length)]; if(out.some(c=>c.role===r)&&leg.length>3) continue; out.push(newCand(r)); }
  T.cand=out; T.candT=Date.now(); T.illT=labL(); };
function empSellX(eff,d,sk,mult,heat,rate){ const F=S.farm; if(!F||!F.found) return 0; let g=rate*eff*d, gain=0; for(const k in F.stock){ if(g<=0) break; const s=F.stock[k]; if(!s||s.g<1) continue; const n=Math.floor(Math.min(s.g,g)); if(n<1) continue; const v=Math.round(n*sellPrice(k,s.q)*mult*(1+.02*sk)); s.g-=n; g-=n; S.cr+=v; gain+=v; F.stats.sold+=n; F.rep+=n*.02; karmaAdd(-n*.03); F.heat.atelier=Math.min(100,F.heat.atelier+n*heat); F.heat.ranch=Math.min(100,F.heat.ranch+n*heat); } return gain; }
function empIll(e,eff,d){ const F=S.farm; if(!F||!F.found) return 0; let did=0; const r=e.role, plants=[];
  if(['irri','nut','chim'].includes(r)){ ranchSim(); for(const room in ROOMS){ const R=F.rooms[room]; if(R&&R.on) R.slots.forEach(sl=>{ if(sl&&sl.st!=='dead'&&sl.st!=='ready') plants.push(sl); }); } }
  if(r==='irri'){ let cap=Math.max(1,Math.floor(5*eff*d)); for(const sl of plants){ if(cap<=0) break; if(sl.w<50){ if((F.can||0)>0) F.can--; else if(F.water>=3) F.water-=3; else break; sl.w=Math.min(100,sl.w+36); cap--; did++; } } }
  else if(r==='nut'){ let cap=Math.max(1,Math.floor(4*eff*d)); for(const sl of plants){ for(const k of ['N','P','K']){ if(cap>0&&sl[k]<40&&(F.chem[k]||0)>0){ F.chem[k]--; sl[k]=Math.min(100,sl[k]+22); cap--; did++; } } if(cap>0&&sl.hp<60&&(F.chem.CM||0)>0){ F.chem.CM--; sl.hp=Math.min(100,sl.hp+10); cap--; did++; } } }
  else if(r==='chim'){ let cap=Math.max(1,Math.floor(3*eff*d)); const use=k=>{ if((F.chem[k]||0)<1||cap<1) return false; F.chem[k]--; cap--; did++; return true; };
    for(const sl of plants){ const ideal=(MED[sl.med]&&MED[sl.med].ph)||6.3;
      if(sl.pest){ if(use(sl.pest==='mold'?'FONG':'INSEC')){ sl.pest=null; sl.prot=4; } }
      else if(sl.ph>ideal+.6){ if(use('PHm')) sl.ph-=.45; } else if(sl.ph<ideal-.6){ if(use('PHp')) sl.ph+=.45; }
      else if(sl.st==='veg'&&!sl.enz){ if(use('ENZ')) sl.enz=4; } else if(sl.st==='flo'&&!sl.boost){ if(use('BOOST')){ sl.boost=4; sl.q=Math.min(100,sl.q+6); } } } }
  else if(r==='dealer') did=empSellX(eff,d,e.sk,1.12,.06,2.2);
  else if(r==='chauf') did=empSellX(eff,d,e.sk,1.42,.11,3.5);
  else if(r==='avo'){ ['atelier','ranch'].forEach(room=>{ const h=F.heat[room]||0, dn=Math.min(h,1.5*eff*d); F.heat[room]=h-dn; did+=dn; }); }
  if(did>0&&['irri','nut','chim'].includes(r)) labGain(did*.15);
  return did; }
const _et36=empTick;
empTick=function(){ const T=team(), now=Date.now(); let dt=Math.min((now-T.last)/60000,360); const ills=T.hired.filter(e=>isIll(e.role)&&e.rest<=0&&e.en>0);
  _et36.apply(this,arguments); if(dt<=.01||!ills.length||!illOpen()) return;
  try{ let left=dt; while(left>1e-4){ const d=Math.min(left,5); left-=d; ills.forEach(e=>{ if(S.cr<=0||e.en<=0) return; const did=empIll(e,empEff(e),d); e.out=(e.out||0)+did; T.tot[e.role]=(T.tot[e.role]||0)+did; }); } save(); }catch(err){ console.error(err); } };
/* ----- décors : niveau du labo et équipe sur l'accueil ----- */
function labBar(){ const F=labF(), l=F.ll, nx=l<10?labNeed(l):1, pr=l>=10?100:Math.min(100,Math.round(F.lx/nx*100)), nt=l<10?LAB_TIERS[l+1]:'Niveau maximum';
  return '<div class="lab-lv" id="labLv"><b>🧪 Labo niveau '+l+'</b><div class="lb"><i style="width:'+pr+'%"></i></div><small>'+(l<10?F.lx+' / '+nx+' XP · prochain : '+nt:'Maître cultivateur')+'</small></div>'; }
function decor36(){ try{
  if(S&&S.farm&&S.farm.found&&labLv()>=LAB_LVL){ const old=document.getElementById('labLv'), a=document.querySelector('#sheet .rstats, #sheet .rhd'); if(a){ if(old) old.remove(); a.insertAdjacentHTML('afterend',labBar()); }
    document.querySelectorAll('[data-a="rbuy"],[data-a="rbuyslot"],[data-a="rbuyranch"]').forEach(b=>{ let n=1; if(b.dataset.a==='rbuy'){ const [t,a,g]=String(b.dataset.id).split(':'); n=labReq(t,a,g); } else if(b.dataset.a==='rbuyranch') n=4; else { const R=S.farm.rooms[b.dataset.id]; if(R){ const base=b.dataset.id==='ranch'?8:6; n=Math.max(1,Math.ceil((R.slots.length+1-base)/2)+1); } }
      if(labL()<n){ const it=b.closest('.rit'); if(it) it.classList.add('lock'); b.disabled=true; b.innerHTML='🔒<br><i>Niv. '+n+'</i>'; } }); }
  const eq=document.getElementById('sheet'); if(sheet&&sheet.t==='equipe'&&!document.getElementById('teamCls')){ const nt=eq.querySelector('.note'); const T=team(); const L=T.hired.filter(e=>!isIll(e.role)).length, I=T.hired.length-L; if(nt) nt.insertAdjacentHTML('afterend','<div class="team-cls" id="teamCls"><span>🏢 Légal : <b>'+L+' / '+legalCap()+'</b></span>'+(illOpen()?'<span>🕶️ Clandestin : <b>'+I+' / '+illCap()+'</b> <small>(+1 place tous les 2 niveaux du labo)</small></span>':'')+'</div>'); }
 }catch(e){} }
const _rd36=render; render=function(){ const r=_rd36.apply(this,arguments); decor36(); return r; };
const _rsh36=renderSheet; renderSheet=function(){ const r=_rsh36.apply(this,arguments); decor36(); return r; };
