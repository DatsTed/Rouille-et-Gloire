/* ===== v1.5 · Éveil cosmique — 3/6 : moteur de combat au tour par tour + IA =====
   Code pur (aucun DOM) : l'écran de duel (new54) appelle cbBattle / cbTurn / cbReplace / cbAI et lit B.ev pour les animations.
   Équipes de 1 à 3 voitures, une seule en piste (1 contre 1). Les courses ne sont jamais touchées. */

const CB_DIV=62;                                                          /* diviseur de la formule de dégâts (50 chez Pokémon) : duels un peu plus longs */
function cbRng(seed){ let a=(seed>>>0)||1; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function cbCalc(mid,iv,lv){ const b=cbBase(mid), o={}; CB_SK.forEach(k=>{ const r=Math.floor((2*b[k]+(iv[k]||0))*lv/100); o[k]=k==='hp'?r+lv+10:r+5; }); return o; }
/* une voiture en combat (copie : la fiche sauvegardée n'est modifiée qu'à la fin, pour l'XP) */
function cbFighter(o){
  const ty=o.ty||cbTypesOf(o.mid), lv=clamp(o.lv||5,1,CB_LVMAX), iv=o.iv||{hp:15,atk:15,def:15,spa:15,spd:15,vit:15}, st=cbCalc(o.mid,iv,lv);
  const mv=(o.mv&&o.mv.length?o.mv:cbAutoMoves(ty,lv)).filter(id=>CB_MV[id]).slice(0,4).map(id=>({id,pp:CB_MV[id].pp,max:CB_MV[id].pp}));
  const tal=o.tal&&CB_TAL[o.tal]?o.tal:(CB_TAL_BY[ty[0]]||CB_TAL_BY.meca)[0];
  return {nm:o.nm||((M[o.mid]||{}).nom||'Voiture'),mid:o.mid,uid:o.uid||null,ty,tal,lv,st,mhp:st.hp,hp:o.hp!=null?Math.min(o.hp,st.hp):st.hp,mv,
    stage:{atk:0,def:0,spa:0,spd:0,vit:0,acc:0,eva:0},crit:0,status:null,vol:{},energy:CB_ENERGY.start+(tal==='nitro'?30:0),
    charging:null,inv:false,recharge:false,protectN:0,protected:false,lastMove:null,hit:{phy:0,spe:0},turns:0,firstUsed:false}; }
const cbFromCar=c=>{ const s=cbOf(c); return cbFighter({mid:c.mid,uid:c.uid,lv:s.lv,iv:s.iv,tal:s.tal,mv:s.mv,ty:s.ty,nm:M[c.mid].nom}); };
const cbAct=(B,s)=>B.sides[s].team[B.sides[s].act];
const cbAlive=(B,s)=>B.sides[s].team.some(f=>f.hp>0);
const cbWx=B=>{ if(!B.wx) return null; if([0,1].some(s=>{ const f=cbAct(B,s); return f&&f.hp>0&&f.tal==='ciel'; })) return null; return B.wx.id; };
const cbHas=(f,t)=>f.ty.includes(t);
const cbSideOf=(B,f)=>B.sides.findIndex(S2=>S2.team[S2.act]===f);
function cbLog(B,tx,e){ B.log.push(tx); B.ev.push(Object.assign({k:'tx',tx},e||{})); }
/* ---- création ---- */
function cbBattle(o){
  const B={t:0,rng:cbRng(o.seed||Date.now()),wx:null,log:[],ev:[],over:null,need:null,arena:o.arena||null,
    sides:[0,1].map(s=>({team:o.teams[s].map(x=>x.st?x:cbFighter(x)),act:0,hz:false,bag:Object.assign({},(o.bags||[])[s]||{}),itUsed:0,ai:(o.ai||[])[s]||null,nm:((o.names||[])[s])||(s?'Rival':'Toi')}))};
  if(o.wx&&CB_WX[o.wx]) B.wx={id:o.wx,n:99};
  cbLog(B,'Le duel commence !',{k:'start'});
  [0,1].sort((a,b)=>cbSpeed(B,b)-cbSpeed(B,a)).forEach(s=>cbEnter(B,s));
  return B; }
/* ---- statistiques effectives ---- */
function cbStat(B,f,k,mode){ let v=f.st[k], n=f.stage[k]||0; if(mode==='atkcrit'&&n<0) n=0; if(mode==='defcrit'&&n>0) n=0; if(mode==='ignore') n=0; v*=cbStageK(k,n);
  const w=cbWx(B);
  if(k==='atk'&&f.status&&f.status.id==='brule'&&mode!=='facade') v*=.5;
  if(k==='spa'&&f.tal==='panneaux'&&(w==='canicule'||w==='aurore')) v*=1.5;
  return Math.max(1,v); }
function cbSpeed(B,s){ const f=cbAct(B,s); if(!f) return 0; let v=f.st.vit*cbStageK('vit',f.stage.vit); if(f.status&&f.status.id==='para') v*=.5; if(f.tal==='pneusneige'&&cbWx(B)==='tempete') v*=2; return v; }
/* ---- dégâts ---- */
function cbPower(B,u,o,m){ const f=m.fx||{}; let p=m.p;
  if(f.rand){ const r=B.rng(); p=r<.05?10:r<.15?30:r<.35?50:r<.65?70:r<.85?90:r<.95?110:150; }
  if(f.gyro){ const so=cbSideOf(B,o), su=cbSideOf(B,u); p=so<0||su<0?50:Math.min(150,Math.floor(25*cbSpeed(B,so)/Math.max(1,cbSpeed(B,su)))+1); }
  if(f.facade&&u.status) p*=2; if(f.jarnac&&o.status) p*=2; if(f.revenge&&(u.hit.phy+u.hit.spe)>0) p*=2;
  return p; }
function cbDamage(B,u,o,m,opt){ opt=opt||{}; const cat=m.c, crit=!!opt.crit, f=m.fx||{};
  const A=cbStat(B,u,cat==='phy'?'atk':'spa',f.facade&&cat==='phy'?'facade':crit?'atkcrit':null), D=cbStat(B,o,cat==='phy'?'def':'spd',f.ignore?'ignore':crit?'defcrit':null);
  const p=opt.p||cbPower(B,u,o,m); let d=Math.floor(Math.floor(Math.floor(2*u.lv/5+2)*p*A/D)/CB_DIV)+2;
  const w=cbWx(B), W=w&&CB_WX[w];
  if(W){ if(W.up===m.t) d*=1.5; if(W.down===m.t) d*=(w==='nuit'||w==='aurore')?.75:.5; }
  if(crit) d*=1.5;
  d*=opt.est?.925:(.85+B.rng()*.15);
  if(cbHas(u,m.t)) d*=u.tal==='hybride'?2:1.5;
  const eff=cbEff(m.t,o.ty); d*=eff;
  const T=CB_TAL[u.tal]; if(T&&T.k==='pinch'&&T.t===m.t&&u.hp<=u.mhp/3) d*=1.5; if(u.tal==='compresseur'&&p<=60) d*=1.5;
  if(o.tal==='cryo'&&m.t==='feu') d*=.5; if(o.tal==='blinde'&&cat==='phy') d*=.9; if(o.tal==='reactif'&&eff>1) d*=.75; if(o.vol.veil) d*=.5;
  return {d:eff===0?0:Math.max(1,Math.floor(d)),eff}; }
/* ---- entrée en piste / changement ---- */
function cbEnter(B,s){ const f=cbAct(B,s), S2=B.sides[s], o=cbAct(B,1-s); if(!f||f.hp<=0) return; f.turns=0; f.firstUsed=false;
  cbLog(B,(s?S2.nm+' envoie ':'À toi, ')+f.nm+' !',{k:'enter',s});
  if(S2.hz&&!cbHas(f,'vent')){ const d=Math.max(1,Math.floor(f.mhp/8)); f.hp=Math.max(0,f.hp-d); cbLog(B,f.nm+' roule sur les gravillons (−'+d+').',{k:'dmg',s,n:d}); }
  if(f.tal==='intimid'&&o&&o.hp>0){ cbLog(B,f.nm+' : Klaxon intimidant !',{k:'tal',s}); cbBoost(B,1-s,{atk:-1},s); }
  const T=CB_TAL[f.tal]; if(T&&T.k==='wxset') cbSetWx(B,T.wx,f); }
function cbSwitch(B,s,i){ const S2=B.sides[s], f=cbAct(B,s), n=S2.team[i]; if(!n||n.hp<=0||i===S2.act) return false;
  if(f&&f.hp>0){ if(f.tal==='regen') f.hp=Math.min(f.mhp,f.hp+Math.floor(f.mhp/3)); f.stage={atk:0,def:0,spa:0,spd:0,vit:0,acc:0,eva:0}; f.vol={}; f.charging=null; f.inv=false; f.recharge=false; f.crit=0; f.protectN=0; if(f.status&&f.status.id==='poison2') f.status.n=1;
    cbLog(B,(s?S2.nm+' rappelle ':'Reviens, ')+f.nm+' !',{k:'out',s}); }
  S2.act=i; cbEnter(B,s); return true; }
function cbSetWx(B,id,f){ if(!CB_WX[id]) return; if(B.wx&&B.wx.id===id){ B.wx.n=5; return; } B.wx={id,n:5}; cbLog(B,CB_WX[id].ic+' '+CB_WX[id].n+' !'+(f?' ('+f.nm+')':''),{k:'wx',wx:id}); }
/* ---- crans ---- */
function cbBoost(B,s,sb,from){ const f=cbAct(B,s); if(!f||f.hp<=0) return; const foe=from!=null&&from!==s;
  Object.keys(sb).forEach(k=>{ if(!CB_STAGE_N[k]) return; let n=sb[k];
    if(foe&&n<0&&f.tal==='gyroscope'){ cbLog(B,f.nm+' : Gyroscope, ses crans ne baissent pas.',{k:'tal',s}); return; }
    if(foe&&n<0&&f.tal==='miroir'){ cbLog(B,f.nm+' : Contre-braquage renvoie la baisse !',{k:'tal',s}); cbBoost(B,from,{[k]:n},null); return; }
    const v0=f.stage[k], v1=clamp(v0+n,-6,6); if(v1===v0){ cbLog(B,'Le '+CB_STAGE_N[k].toLowerCase()+' de '+f.nm+' ne peut plus '+(n>0?'monter':'baisser')+'.'); return; }
    f.stage[k]=v1; cbLog(B,CB_STAGE_N[k]+' de '+f.nm+(n>=2?' monte beaucoup':n>0?' monte':n<=-2?' baisse beaucoup':' baisse')+' !',{k:'sb',s,st:k,n});
    if(foe&&n<0&&f.tal==='rage'){ cbLog(B,f.nm+' : Rage du moteur !',{k:'tal',s}); f.stage.atk=clamp(f.stage.atk+2,-6,6); } }); }
/* ---- altérations ---- */
function cbCanStatus(B,f,id){ if(f.status||f.hp<=0) return false; const T=CB_TAL[f.tal]||{};
  if((T.st||[]).includes(id)) return false;
  if(id==='brule'&&cbHas(f,'feu')) return false; if(id==='gel'&&(cbHas(f,'glace')||cbWx(B)==='canicule')) return false;
  if(id==='para'&&cbHas(f,'elec')) return false; if((id==='poison'||id==='poison2')&&cbHas(f,'acier')) return false;
  return true; }
function cbStatus(B,s,id,quiet){ const f=cbAct(B,s); if(!cbCanStatus(B,f,id)){ if(!quiet) cbLog(B,'Ça n’a aucun effet sur '+f.nm+'.'); return false; }
  f.status={id,n:id==='aveugle'?3+Math.floor(B.rng()*3):1}; cbLog(B,f.nm+' : '+CB_ST[id].ic+' '+CB_ST[id].n+' !',{k:'st',s,st:id}); return true; }
function cbVol(B,s,id,from){ const f=cbAct(B,s); if(f.hp<=0) return;
  if(id==='confus'){ if(f.vol.confus||f.tal==='gyroscope'){ return; } f.vol.confus=2+Math.floor(B.rng()*4); cbLog(B,f.nm+' : 💫 Surtension !',{k:'vol',s,v:'confus'}); }
  if(id==='flinch'&&!f.acted) f.vol.flinch=1; }
/* ---- une action ---- */
const CB_LUTTE={id:'lutte',n:'Calage forcé',t:'meca',c:'phy',p:50,a:0,pp:1,lv:1,pr:0,e:0,fx:{recoil:.25}};
const cbTargetsFoe=m=>{ const f=m.fx||{}; return m.c!=='sta'||!!(f.st||f.vol||(f.sb&&f.sb.who==='foe')||f.taunt||f.leech); };
function cbUsable(B,s,i){ const f=cbAct(B,s), x=f.mv[i]; if(!x) return false; const m=CB_MV[x.id]; if(x.pp<=0) return false; if(m.e>f.energy) return false; if(f.vol.taunt&&m.c==='sta') return false; if(m.fx.first&&f.turns>0) return false; return true; }
function cbMove(B,s,act){
  const u=cbAct(B,s), o=cbAct(B,1-s), os=1-s; if(!u||u.hp<=0) return; u.acted=true;
  if(u.recharge){ u.recharge=false; cbLog(B,u.nm+' doit refroidir son moteur…',{k:'rest',s}); return; }
  let m=act.forced?CB_MV[act.forced]:null, slot=null;
  if(!m){ slot=u.mv[act.i]; if(!u.mv.some((x,i)=>cbUsable(B,s,i))) m=CB_LUTTE; else if(!slot||!cbUsable(B,s,act.i)){ const j=u.mv.findIndex((x,i)=>cbUsable(B,s,i)); slot=u.mv[j]; m=CB_MV[slot.id]; } else m=CB_MV[slot.id]; }
  /* états qui empêchent d'agir */
  if(u.status&&u.status.id==='gel'){ if(m.fx.thaw||B.rng()<.2){ u.status=null; cbLog(B,u.nm+' est dégelé !',{k:'cure',s}); } else { cbLog(B,u.nm+' est bloqué par le verglas !',{k:'stuck',s,st:'gel'}); u.charging=null; u.inv=false; return; } }
  if(u.vol.flinch){ u.vol.flinch=0; cbLog(B,u.nm+' cale et rate son tour !',{k:'stuck',s}); u.charging=null; u.inv=false; return; }
  if(u.status&&u.status.id==='para'&&B.rng()<.25){ cbLog(B,u.nm+' est en court-circuit, il ne bouge pas !',{k:'stuck',s,st:'para'}); u.charging=null; u.inv=false; return; }
  if(u.vol.confus){ u.vol.confus--; if(!u.vol.confus){ cbLog(B,u.nm+' n’est plus en surtension.'); } else if(B.rng()<1/3){ const d=cbDamage(B,u,u,{c:'phy',p:40,t:'meca',fx:{}},{p:40}).d; u.hp=Math.max(0,u.hp-d); cbLog(B,'💫 '+u.nm+' se blesse dans sa surtension (−'+d+') !',{k:'dmg',s,n:d}); u.charging=null; return; } }
  if(u.vol.taunt&&m.c==='sta'&&!act.forced){ cbLog(B,u.nm+' est provoqué : il ne peut pas utiliser '+m.n+' !'); return; }
  /* copilote */
  if(m.fx.copy){ const c=o&&o.lastMove&&CB_MV[o.lastMove]; if(slot) slot.pp--; if(!c||c.fx.copy||c.e){ cbLog(B,u.nm+' utilise Copilote… mais rien à copier !'); return; } cbLog(B,u.nm+' utilise Copilote !',{k:'move',s,id:m.id}); m=c; slot=null; }
  if(m.fx.first&&u.turns>0&&!act.forced){ if(slot) slot.pp--; cbLog(B,u.nm+' utilise '+m.n+'… mais ça ne marche qu’au premier tour !'); return; }
  if(m.e&&m.e>u.energy){ cbLog(B,u.nm+' n’a pas assez d’Énergie pour '+m.n+'.'); return; }
  /* charge en deux tours */
  if(m.fx.charge&&u.charging!==m.id){ const w=cbWx(B); if(!(m.fx.charge==='wx'&&(w==='canicule'||w==='aurore'))){ if(slot) slot.pp--; u.charging=m.id; u.inv=!!m.fx.inv; cbLog(B,u.nm+' se prépare pour '+m.n+'…',{k:'charge',s,id:m.id}); return; } }
  const second=u.charging===m.id; u.charging=null; u.inv=false;
  if(slot&&!second&&!act.forced) slot.pp--; if(m.e) u.energy-=m.e;
  u.lastMove=m.id; if(!m.fx.protect) u.protectN=0;
  cbLog(B,u.nm+' utilise '+m.n+' !',{k:'move',s,id:m.id,t:m.t,c:m.c,ult:!!m.e});
  const F=m.fx;
  if(F.protect){ const ok=B.rng()<1/Math.pow(3,u.protectN); u.protectN++; if(ok){ u.protected=true; cbLog(B,u.nm+' se met à l’abri !',{k:'protect',s}); } else cbLog(B,'Mais ça échoue !'); return; }
  const toFoe=cbTargetsFoe(m);
  if(toFoe){ if(!o||o.hp<=0){ cbLog(B,'Mais il n’y a pas de cible…'); return; }
    if(o.protected){ cbLog(B,o.nm+' se protège !',{k:'block',s:os}); return; }
    if(o.inv){ cbLog(B,o.nm+' est hors d’atteinte !',{k:'miss',s:os}); return; }
    const w=cbWx(B); let hit=true;
    if(m.a&&!(F.wxacc&&F.wxacc.includes(w))){ let acc=m.a/100*cbStageK('acc',clamp(u.stage.acc-(F.ignore?0:o.stage.eva)-((w==='nuit'&&cbHas(o,'tene'))?1:0),-6,6));
      if(u.status&&u.status.id==='aveugle') acc*=.7; if(u.tal==='xenon') acc*=1.2; hit=B.rng()<acc; }
    if(hit&&m.c==='phy'&&o.tal==='ombre'&&B.rng()<.2){ cbLog(B,o.nm+' se fond dans l’ombre !',{k:'miss',s:os}); return; }
    if(!hit){ cbLog(B,u.nm+' rate son attaque !',{k:'miss',s:os}); return; }
    const T=CB_TAL[o.tal]; if(m.c!=='sta'&&T&&T.k==='absorb'&&T.t===m.t){ if(T.boost){ cbLog(B,o.nm+' : '+T.n+' absorbe l’attaque !',{k:'tal',s:os}); cbBoost(B,os,{[T.boost]:1},null); } else { const h=Math.floor(o.mhp/4); o.hp=Math.min(o.mhp,o.hp+h); cbLog(B,o.nm+' : '+T.n+' le répare (+'+h+') !',{k:'heal',s:os,n:h}); } return; } }
  const serene=u.tal==='echappement'?2:1, roll=p=>B.rng()*100<p*serene;
  if(m.c!=='sta'){
    let total=0, last=null;
    if(F.counter){ const t=u.hit[F.counter]; if(!t){ cbLog(B,'Mais ça échoue !'); return; } const d=Math.min(o.hp,t*2); o.hp-=d; total=d; cbLog(B,o.nm+' encaisse le retour (−'+d+') !',{k:'dmg',s:os,n:d,c:m.c,t:m.t}); }
    else { const n=F.multi?(()=>{ const r=B.rng(); return r<.35?2:r<.7?3:r<.85?4:5; })():1;
      for(let h=0;h<n&&o.hp>0;h++){
        const cs=Math.min(3,u.crit+(F.crit||0)+(u.tal==='sequentielle'?1:0)), crit=o.tal!=='blinde'&&B.rng()<CB_CRIT[cs];
        const r=cbDamage(B,u,o,m,{crit}); let d=r.d; if(r.eff===0){ cbLog(B,'Ça n’affecte pas '+o.nm+'…',{k:'immune',s:os}); return; }
        if(o.vol.shield){ const a=Math.min(o.vol.shield,d); o.vol.shield-=a; d-=a; if(!o.vol.shield){ delete o.vol.shield; cbLog(B,'Le pare-brise de '+o.nm+' vole en éclats !'); } else cbLog(B,'Le pare-brise encaisse le choc !'); }
        if(o.tal==='increvable'&&o.hp===o.mhp&&d>=o.hp){ d=o.hp-1; cbLog(B,o.nm+' tient le choc : Mécanique increvable !',{k:'tal',s:os}); }
        d=Math.min(d,o.hp); o.hp-=d; total+=d; o.hit[m.c]+=d; last=r; o.energy=Math.min(CB_ENERGY.max,o.energy+CB_ENERGY.hit);
        cbLog(B,(crit?'Coup critique ! ':'')+o.nm+' perd '+d+' de blindage.',{k:'dmg',s:os,n:d,eff:r.eff,crit,t:m.t,c:m.c});
        if(o.status&&o.status.id==='gel'&&m.t==='feu'){ o.status=null; cbLog(B,o.nm+' est dégelé par la chaleur !'); }
        if(m.c==='phy'&&o.tal==='epines'&&u.hp>0){ const e=Math.max(1,Math.floor(u.mhp/8)); u.hp=Math.max(0,u.hp-e); cbLog(B,u.nm+' se blesse sur le pare-chocs épineux (−'+e+') !',{k:'dmg',s,n:e}); } }
      if(n>1) cbLog(B,'Touché '+n+' fois !'); if(last){ const t=cbEffTxt(last.eff); if(t) cbLog(B,t,{k:'eff',eff:last.eff}); } }
    if(F.drain&&total){ const h=Math.max(1,Math.floor(total*F.drain)); u.hp=Math.min(u.mhp,u.hp+h); cbLog(B,u.nm+' récupère '+h+' de blindage.',{k:'heal',s,n:h}); }
    if(F.recoil&&total&&u.tal!=='prudent'){ const r=Math.max(1,Math.floor(total*F.recoil)); u.hp=Math.max(0,u.hp-r); cbLog(B,u.nm+' subit le contrecoup (−'+r+') !',{k:'dmg',s,n:r}); }
    if(F.selfko){ u.hp=0; cbLog(B,u.nm+' a fait exploser son moteur !',{k:'dmg',s,n:0}); }
    if(F.recharge) u.recharge=true;
    if(F.esteal&&o.hp>0){ const e=Math.min(o.energy,F.esteal); o.energy-=e; u.energy=Math.min(CB_ENERGY.max,u.energy+e); if(e) cbLog(B,u.nm+' siphonne '+e+' d’Énergie !'); }
    if(F.energy) u.energy=Math.min(CB_ENERGY.max,u.energy+F.energy);
    if(F.heal){ const h=Math.floor(u.mhp*F.heal*(cbWx(B)==='aurore'?1.5:1)); u.hp=Math.min(u.mhp,u.hp+h); cbLog(B,u.nm+' se répare (+'+h+').',{k:'heal',s,n:h}); }
    if(o.hp>0){
      if(F.st&&roll(F.st[1])) cbStatus(B,os,F.st[0],true);
      if(F.vol&&roll(F.vol[1])) cbVol(B,os,F.vol[0],s);
      if(F.sb&&roll(F.sb.ch||100)){ const sb=Object.assign({},F.sb); delete sb.who; delete sb.ch; cbBoost(B,F.sb.who==='self'?s:os,sb,s); }
      if(F.trap&&!o.vol.trap){ o.vol.trap=4+Math.floor(B.rng()*2); cbLog(B,o.nm+' est coincé !',{k:'vol',s:os,v:'trap'}); }
      if(F.force){ const S2=B.sides[os], alt=S2.team.map((f,i)=>i).filter(i=>i!==S2.act&&S2.team[i].hp>0); if(alt.length){ cbLog(B,o.nm+' est remorqué hors de la piste !'); cbSwitch(B,os,alt[Math.floor(B.rng()*alt.length)]); } } }
    else if(F.sb&&F.sb.who==='self'&&roll(F.sb.ch||100)){ const sb=Object.assign({},F.sb); delete sb.who; delete sb.ch; cbBoost(B,s,sb,s); }
    return; }
  /* attaques de statut */
  if(F.st) cbStatus(B,os,F.st[0]);
  if(F.vol) cbVol(B,os,F.vol[0],s);
  if(F.sb){ const sb=Object.assign({},F.sb); delete sb.who; delete sb.ch; cbBoost(B,F.sb.who==='self'?s:os,sb,s); }
  if(F.crit&&F.self){ u.crit=Math.min(3,u.crit+F.crit); cbLog(B,u.nm+' se concentre : critiques plus fréquents !'); }
  if(F.heal){ if(u.hp>=u.mhp) cbLog(B,'Le blindage de '+u.nm+' est déjà intact.'); else { const h=Math.floor(u.mhp*F.heal*(cbWx(B)==='aurore'?1.5:1)); u.hp=Math.min(u.mhp,u.hp+h); cbLog(B,u.nm+' se répare (+'+h+').',{k:'heal',s,n:h}); } }
  if(F.weather) cbSetWx(B,F.weather,u);
  if(F.ring){ if(u.vol.ring) cbLog(B,'Mais ça échoue !'); else { u.vol.ring=1; cbLog(B,u.nm+' active son circuit de refroidissement.',{k:'vol',s,v:'ring'}); } }
  if(F.leech){ if(o.vol.leech) cbLog(B,'Mais ça échoue !'); else { o.vol.leech=1; cbLog(B,'Un parasite électrique s’accroche à '+o.nm+' !',{k:'vol',s:os,v:'leech'}); } }
  if(F.taunt){ if(o.vol.taunt) cbLog(B,'Mais ça échoue !'); else { o.vol.taunt=F.taunt+1; cbLog(B,o.nm+' est provoqué !',{k:'vol',s:os,v:'taunt'}); } }
  if(F.reset){ [u,o].forEach(f=>{ if(f) f.stage={atk:0,def:0,spa:0,spd:0,vit:0,acc:0,eva:0}; }); cbLog(B,'La bise efface tous les crans !',{k:'reset'}); }
  if(F.energy){ u.energy=Math.min(CB_ENERGY.max,u.energy+F.energy); cbLog(B,u.nm+' : +'+F.energy+' d’Énergie !',{k:'energy',s}); }
  if(F.shield){ const c=Math.floor(u.mhp*F.shield); if(u.vol.shield||u.hp<=c){ cbLog(B,'Mais ça échoue !'); } else { u.hp-=c; u.vol.shield=c; cbLog(B,u.nm+' installe un pare-brise (−'+c+').',{k:'vol',s,v:'shield'}); } }
  if(F.hazard){ const S2=B.sides[os]; if(S2.hz) cbLog(B,'Mais ça échoue !'); else { S2.hz=true; cbLog(B,'Des gravillons jonchent la piste adverse !',{k:'hazard',s:os}); } }
  if(F.veil){ if(u.vol.veil) cbLog(B,'Mais ça échoue !'); else { u.vol.veil=5; cbLog(B,u.nm+' se couvre d’un voile de givre !',{k:'vol',s,v:'veil'}); } }
}
/* ---- objets ---- */
function cbItemOk(B,s,id,tgt){ const S2=B.sides[s], it=CB_IT[id]; if(!it||!(S2.bag[id]>0)||S2.itUsed>=CB_IT_MAX) return false; const f=it.revive?S2.team[tgt]:cbAct(B,s); if(!f) return false;
  if(it.revive) return f.hp<=0; if(f.hp<=0) return false;
  if(it.heal&&!it.cure) return f.hp<f.mhp; if(it.cure&&Array.isArray(it.cure)) return !!((f.status&&it.cure.includes(f.status.id))||(it.cure.includes('confus')&&f.vol.confus));
  if(it.cure===1) return f.hp<f.mhp||!!f.status||!!f.vol.confus; if(it.energy) return f.energy<CB_ENERGY.max; if(it.pp) return f.mv.some(x=>x.pp<x.max); return true; }
function cbItem(B,s,id,tgt){ const S2=B.sides[s], it=CB_IT[id]; if(!cbItemOk(B,s,id,tgt)){ cbLog(B,'Impossible d’utiliser cet objet.'); return; }
  S2.bag[id]--; S2.itUsed++; const f=it.revive?S2.team[tgt]:cbAct(B,s); cbLog(B,(s?S2.nm:'Tu')+' utilise '+it.ic+' '+it.n+(it.revive?' sur '+f.nm:'')+' !',{k:'item',s,id});
  if(it.revive){ f.hp=Math.floor(f.mhp*it.revive); f.status=null; cbLog(B,f.nm+' est remis en état !',{k:'heal',s,n:f.hp}); return; }
  if(it.heal){ const h=Math.min(f.mhp-f.hp,Math.ceil(f.mhp*it.heal)); f.hp+=h; if(h) cbLog(B,f.nm+' récupère '+h+' de blindage.',{k:'heal',s,n:h}); }
  if(it.cure===1){ f.status=null; delete f.vol.confus; } else if(Array.isArray(it.cure)){ if(f.status&&it.cure.includes(f.status.id)) f.status=null; if(it.cure.includes('confus')) delete f.vol.confus; cbLog(B,f.nm+' est soigné.',{k:'cure',s}); }
  if(it.energy){ f.energy=Math.min(CB_ENERGY.max,f.energy+it.energy); cbLog(B,f.nm+' : +'+it.energy+' d’Énergie.',{k:'energy',s}); }
  if(it.pp) f.mv.forEach(x=>x.pp=Math.min(x.max,x.pp+it.pp));
  if(it.sb) cbBoost(B,s,it.sb,null); }
/* ---- fin de tour ---- */
function cbEndTurn(B){ const w=cbWx(B), order=[0,1].sort((a,b)=>cbSpeed(B,b)-cbSpeed(B,a));
  order.forEach(s=>{ const f=cbAct(B,s), o=cbAct(B,1-s); if(!f||f.hp<=0) return; const hurt=(n,tx,e)=>{ n=Math.max(1,Math.floor(n)); n=Math.min(n,f.hp); f.hp-=n; cbLog(B,tx+' (−'+n+')',Object.assign({k:'dmg',s,n},e||{})); };
    if(w==='tempete'&&!cbHas(f,'glace')&&!cbHas(f,'acier')&&f.tal!=='pneusneige') hurt(f.mhp/16,f.nm+' est fouetté par la tempête de glace');
    if(w==='orage'&&cbHas(f,'vent')) hurt(f.mhp/16,f.nm+' est frappé par l’orage');
    if(f.hp<=0) return;
    if(f.vol.ring&&f.hp<f.mhp){ const h=Math.min(f.mhp-f.hp,Math.max(1,Math.floor(f.mhp/16))); f.hp+=h; cbLog(B,f.nm+' récupère '+h+' grâce au refroidissement.',{k:'heal',s,n:h}); }
    if(f.tal==='solaire'&&f.hp<f.mhp){ const h=Math.min(f.mhp-f.hp,Math.max(1,Math.floor(f.mhp/16*((w==='canicule'||w==='aurore')?2:1)))); f.hp+=h; cbLog(B,f.nm+' : alternateur solaire (+'+h+').',{k:'heal',s,n:h}); }
    if(f.status){ const id=f.status.id;
      if(id==='brule') hurt(f.mhp/16,f.nm+' surchauffe',{st:id});
      if(id==='poison') hurt(f.mhp/8,f.nm+' perd de l’huile',{st:id});
      if(id==='poison2'){ hurt(f.mhp*f.status.n/16,f.nm+' fuit gravement',{st:id}); f.status.n=Math.min(15,f.status.n+1); }
      if(id==='aveugle'&&f.status&&--f.status.n<=0){ f.status=null; cbLog(B,'La fumée autour de '+f.nm+' se dissipe.'); } }
    if(f.hp>0&&f.vol.leech&&o&&o.hp>0){ const n=Math.min(f.hp,Math.max(1,Math.floor(f.mhp/8))); f.hp-=n; o.hp=Math.min(o.mhp,o.hp+n); cbLog(B,'Le parasite électrique pompe '+n+' à '+f.nm+'.',{k:'dmg',s,n}); }
    if(f.hp>0&&f.vol.trap){ hurt(f.mhp/8,f.nm+' est coincé'); if(--f.vol.trap<=0){ delete f.vol.trap; cbLog(B,f.nm+' se libère !'); } }
    if(f.vol.taunt&&--f.vol.taunt<=0){ delete f.vol.taunt; cbLog(B,f.nm+' n’est plus provoqué.'); }
    if(f.vol.veil&&--f.vol.veil<=0){ delete f.vol.veil; cbLog(B,'Le voile de givre de '+f.nm+' fond.'); }
    if(f.hp>0&&f.tal==='zephyr'&&f.stage.vit<6){ f.stage.vit++; cbLog(B,f.nm+' : Aérodynamisme zéphyr, Reprise +1.',{k:'sb',s,st:'vit',n:1}); }
    f.energy=Math.min(CB_ENERGY.max,f.energy+CB_ENERGY.turn+(f.tal==='nitro'?5:0)); f.turns++; });
  if(B.wx&&B.wx.n<99&&--B.wx.n<=0){ cbLog(B,CB_WX[B.wx.id].n+' prend fin.',{k:'wx',wx:null}); B.wx=null; } }
/* ---- K.O., remplacement, victoire ---- */
function cbCheck(B){ [0,1].forEach(s=>{ const f=cbAct(B,s); if(f&&f.hp<=0&&!f.ko){ f.ko=true; f.status=null; f.vol={}; f.charging=null; cbLog(B,f.nm+' est hors course !',{k:'faint',s}); } });
  const a=cbAlive(B,0), b=cbAlive(B,1); if(!a||!b){ B.over=a?0:b?1:1; B.need=null; cbLog(B,B.over===0?'Victoire !':'Défaite…',{k:'end',win:B.over}); return; }
  const need=[0,1].filter(s=>cbAct(B,s).hp<=0); B.need=need.length?need:null;
  if(B.need){ B.need.slice().forEach(s=>{ if(B.sides[s].ai){ cbReplace(B,s,cbAIReplace(B,s)); } }); } }
function cbReplace(B,s,i){ if(!B.need||!B.need.includes(s)) return false; const S2=B.sides[s]; if(!S2.team[i]||S2.team[i].hp<=0) return false; S2.act=i; B.need=B.need.filter(x=>x!==s); if(!B.need.length) B.need=null; cbEnter(B,s); return true; }
/* ---- un tour complet : acts = [action joueur 0, action joueur 1] ; action = {k:'mv',i} | {k:'it',id,tgt} | {k:'sw',i} | {k:'run'} ---- */
function cbTurn(B,acts){ if(B.over!=null||B.need) return B; B.t++; B.ev=[];
  [0,1].forEach(s=>{ const f=cbAct(B,s); f.protected=false; f.hit={phy:0,spe:0}; f.acted=false; delete f.vol.flinch; });
  acts=acts.map((a,s)=>{ const f=cbAct(B,s); if(f.charging) return {k:'mv',forced:f.charging}; if(f.recharge) return {k:'mv',i:0}; if(!a) return B.sides[s].ai?cbAI(B,s):{k:'mv',i:0}; return a; });
  if(acts.some(a=>a.k==='run')){ const s=acts.findIndex(a=>a.k==='run'); cbLog(B,(s?B.sides[1].nm:'Tu')+' abandonne le duel.',{k:'run',s}); B.over=1-s; return B; }
  const sp=[0,1].sort((a,b)=>cbSpeed(B,b)-cbSpeed(B,a)||(B.rng()<.5?-1:1));
  sp.forEach(s=>{ const a=acts[s]; if(a.k==='sw'){ const f=cbAct(B,s); if(f.vol.trap){ cbLog(B,f.nm+' est coincé, impossible de changer !'); acts[s]={k:'none'}; } else cbSwitch(B,s,a.i); } });
  sp.forEach(s=>{ const a=acts[s]; if(a.k==='it') cbItem(B,s,a.id,a.tgt); });
  const pr=s=>{ const a=acts[s], f=cbAct(B,s); if(a.k!=='mv') return -99; const m=a.forced?CB_MV[a.forced]:(f.mv[a.i]?CB_MV[f.mv[a.i].id]:CB_LUTTE); let p=m?m.pr:0; if(f.tal==='demarrage'&&!f.firstUsed&&m&&m.c!=='sta') p+=1; return p; };
  const order=[0,1].filter(s=>acts[s].k==='mv').sort((a,b)=>(pr(b)-pr(a))||(cbSpeed(B,b)-cbSpeed(B,a))||(B.rng()<.5?-1:1));
  const actors=[cbAct(B,0),cbAct(B,1)];
  for(const s of order){ if(B.over!=null) break; const f=cbAct(B,s); if(f!==actors[s]||f.hp<=0) continue;   /* remplacée ou K.O. : l'action est perdue */
    cbMove(B,s,acts[s]); f.firstUsed=true;
    if([0,1].some(x=>cbAct(B,x).hp<=0)){ cbCheck(B); if(B.over!=null) return B; } }
  if(B.over==null){ cbEndTurn(B); cbCheck(B); }
  return B; }

/* ===================== IA adverse ===================== */
function cbEst(B,u,o,m){ if(m.c==='sta') return 0; const f=m.fx||{}; if(f.counter) return 0; const p=f.rand?70:f.gyro?Math.min(150,25*o.st.vit/Math.max(1,u.st.vit)+1):cbPower(B,u,o,m);
  const T=CB_TAL[o.tal]; if(T&&T.k==='absorb'&&T.t===m.t) return -1; const r=cbDamage(B,u,o,m,{est:1,p}); let d=r.d*(f.multi?3:1); if(f.charge===1) d*=.55; if(f.recharge) d*=.7; if(f.selfko) d*=u.hp<u.mhp*.25?1:.2; return d; }
function cbScoreMoves(B,s){ const u=cbAct(B,s), o=cbAct(B,1-s), w=cbWx(B), out=[];
  const faster=cbSpeed(B,s)>=cbSpeed(B,1-s);
  u.mv.forEach((x,i)=>{ if(!cbUsable(B,s,i)) return; const m=CB_MV[x.id], f=m.fx; let sc=0;
    if(m.c!=='sta'){ const d=cbEst(B,u,o,m); if(d<0){ out.push({i,sc:-50}); return; } const acc=m.a?(m.a/100):1; sc=Math.min(d,o.hp)/o.mhp*100*acc;
      if(d>=o.hp) sc+=60*acc+(m.pr>0&&!faster?40:0); if(f.st&&cbCanStatus(B,o,f.st[0])) sc+=f.st[1]*.25; if(f.drain&&u.hp<u.mhp) sc+=10; if(f.recoil&&u.hp<u.mhp*.3) sc-=15; if(m.e&&d<o.hp*.5) sc-=10; }
    else { const hp=u.hp/u.mhp, ohp=o.hp/o.mhp;
      if(f.st){ const id=f.st[0]; if(!cbCanStatus(B,o,id)) sc=-30; else sc=id==='brule'?(o.st.atk>o.st.spa?45:20):id==='para'?(cbSpeed(B,1-s)>cbSpeed(B,s)?45:25):id==='poison2'?38:id==='poison'?30:id==='aveugle'?18:25; sc*=ohp>.3?1:.4; }
      if(f.vol) sc=o.vol.confus||o.tal==='gyroscope'?-20:25;
      if(f.sb){ const keys=Object.keys(f.sb).filter(k=>CB_STAGE_N[k]); if(f.sb.who==='self'){ const cur=keys.reduce((a,k)=>a+u.stage[k],0); sc=hp>.6&&cur<3?18*keys.length:-10; } else { sc=keys.some(k=>o.stage[k]>-2)?14:-10; if(o.tal==='miroir') sc=-25; } }
      if(f.heal) sc=hp<.5?(1-hp)*95:hp>.85?-30:5;
      if(f.protect) sc=(o.charging?55:0)+(u.protectN?-40:8)+(o.status&&['brule','poison','poison2'].includes(o.status.id)?12:0);
      if(f.weather){ const W=CB_WX[f.weather]; sc=w===f.weather?-40:(u.ty.includes(W.up)?35:0)-(o.ty.includes(W.up)?25:0)+(W.down&&o.ty.includes(W.down)?10:0)-(W.down&&u.ty.includes(W.down)?20:0); }
      if(f.ring||f.veil) sc=(f.ring?u.vol.ring:u.vol.veil)?-30:hp>.5?22:12;
      if(f.leech) sc=o.vol.leech?-30:28; if(f.taunt) sc=o.vol.taunt?-30:(o.mv.filter(y=>CB_MV[y.id].c==='sta').length>=2?28:6);
      if(f.reset) sc=(o.stage.atk+o.stage.spa+o.stage.vit)-(u.stage.atk+u.stage.spa+u.stage.vit)>=2?40:-20;
      if(f.energy&&!f.sb) sc=u.energy<70&&u.mv.some(y=>CB_MV[y.id].e)&&hp>.5?24:-10;
      if(f.shield) sc=u.vol.shield||hp<.4?-30:20; if(f.hazard) sc=B.sides[1-s].hz||B.sides[1-s].team.filter(t=>t.hp>0).length<2?-30:22;
      if(f.crit&&f.self) sc=u.crit>=2?-20:hp>.6?20:0; if(f.copy) sc=o.lastMove?12:-30; }
    out.push({i,sc}); });
  return out; }
function cbAI(B,s,dOverride){ const S2=B.sides[s], d=dOverride!=null?dOverride:((S2.ai&&S2.ai.d)!=null?S2.ai.d:2), u=cbAct(B,s), o=cbAct(B,1-s), r=B.rng;
  /* objets */
  if(d>=2&&S2.itUsed<CB_IT_MAX){ const hp=u.hp/u.mhp;
    if(hp<.3){ const h=['revision','superkit','kit'].find(id=>cbItemOk(B,s,id)); if(h&&r()<.85) return {k:'it',id:h}; }
    if(u.status){ const id=Object.keys(CB_IT).find(k=>Array.isArray(CB_IT[k].cure)&&CB_IT[k].cure.includes(u.status.id)&&cbItemOk(B,s,k)); if(id&&['gel','para','poison2','brule'].includes(u.status.id)&&r()<.7) return {k:'it',id}; } }
  /* changement de voiture si le duel est perdu d'avance */
  if(d>=3&&!u.vol.trap){ const bench=S2.team.map((f,i)=>i).filter(i=>i!==S2.act&&S2.team[i].hp>0);
    if(bench.length){ const threat=f=>Math.max(0,...o.mv.map(x=>cbEff(CB_MV[x.id].t,f.ty)*(CB_MV[x.id].c==='sta'?0:1))), power=f=>Math.max(0,...f.mv.map(x=>CB_MV[x.id].c==='sta'?0:cbEff(CB_MV[x.id].t,o.ty)));
      if(threat(u)>=2&&power(u)<=1&&u.hp>u.mhp*.3){ const best=bench.map(i=>({i,v:power(S2.team[i])*2-threat(S2.team[i])})).sort((a,b)=>b.v-a.v)[0]; if(best&&best.v>power(u)*2-threat(u)&&r()<.75) return {k:'sw',i:best.i}; } } }
  const sc=cbScoreMoves(B,s); if(!sc.length) return {k:'mv',i:0};
  const noise=[1,.4,.15,.05][clamp(d,0,3)]; if(d===0&&r()<.45) return {k:'mv',i:sc[Math.floor(r()*sc.length)].i};
  sc.forEach(x=>x.v=x.sc*(1+(r()*2-1)*noise)+(r()*2-1)*noise*20); sc.sort((a,b)=>b.v-a.v); return {k:'mv',i:sc[0].i}; }
function cbAIReplace(B,s){ const S2=B.sides[s], o=cbAct(B,1-s), alive=S2.team.map((f,i)=>i).filter(i=>S2.team[i].hp>0);
  return alive.map(i=>{ const f=S2.team[i]; const pow=Math.max(0,...f.mv.map(x=>CB_MV[x.id].c==='sta'?0:cbEff(CB_MV[x.id].t,o.ty))), thr=Math.max(0,...o.mv.map(x=>CB_MV[x.id].c==='sta'?0:cbEff(CB_MV[x.id].t,f.ty))); return {i,v:pow*2-thr+f.hp/f.mhp}; }).sort((a,b)=>b.v-a.v)[0].i; }
/* XP de combat gagnée contre une voiture de niveau L (dresseur = tournoi) */
const cbXpFor=(L,trainer)=>Math.round(28*L*(trainer?1.5:1));
/* combat automatique complet (tests, simulations) */
function cbAutoBattle(o){ const B=cbBattle(Object.assign({},o,{ai:o.ai||[{d:3},{d:3}]})); let g=0; while(B.over==null&&g++<200){ if(B.need){ B.need.slice().forEach(s=>cbReplace(B,s,cbAIReplace(B,s))); continue; } cbTurn(B,[cbAI(B,0),cbAI(B,1)]); } if(B.over==null) B.over=-1; return B; }
