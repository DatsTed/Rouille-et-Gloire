/* ===== v1.5 · Éveil cosmique — 4/6 : écran de duel (plein écran, tient sur un écran) =====
   cbStartDuel({team:[uid…], foes:[{mid,lv,tal,mv,iv,nm}…], d, names:[moi,rival], trainer, wx, onEnd})
   Le moteur (new53) calcule ; ici on rejoue B.ev avec animations, sons et journal. */

let CBV=null;
const cbSleep=ms=>new Promise(r=>setTimeout(r,ms));
/* sac d'objets de combat du joueur (achats / récompenses : étape tournois) */
const cbBag=()=>{ if(!S.cbBag) S.cbBag={kit:3,nitrorec:1,antidote:1,extinct:1}; return S.cbBag; };
/* équipe : jusqu'à 3 voitures, par défaut les meilleurs niveaux de combat */
function cbTeamDefault(){ return S.cars.slice().sort((a,b)=>cbOf(b).lv-cbOf(a).lv||(M[b.mid].t-M[a.mid].t)).slice(0,3).map(c=>c.uid); }
function cbTeam(){ let t=(S.cbTeam||[]).filter(u=>car(u)); if(!t.length) t=cbTeamDefault(); return t.slice(0,3); }

/* ---- sons (bus « ui » du jeu, coupé si le son est coupé) ---- */
const CB_SND={feu:['sawtooth',180,520],eau:['sine',700,240],glace:['triangle',1400,900],vent:['sine',300,900],tene:['sawtooth',160,70],lum:['triangle',900,1800],elec:['square',1200,300],acier:['square',220,160],terre:['sawtooth',90,60],meca:['square',300,200]};
function cbSfx(k,x){ try{ if(!AU||!AU.ok) return; const T=CB_SND[x]||CB_SND.meca;
  if(k==='cast'){ sfx50(T[1],.28,T[0],.045,T[2]); whoosh50(.25,.07); }
  else if(k==='hit'){ arcTone(95,.18,'sine',.22); whoosh50(.12,.09); }
  else if(k==='crit'){ arcTone(1600,.12,'square',.05); arcTone(80,.25,'sine',.25); }
  else if(k==='super'){ sfx50(500,.18,'square',.05,1100); }
  else if(k==='weak'){ sfx50(300,.2,'sine',.05,180); }
  else if(k==='heal'){ sfx50(520,.22,'sine',.05,1040); setTimeout(()=>sfx50(780,.2,'sine',.04,1300),90); }
  else if(k==='st'){ sfx50(900,.16,'triangle',.05,420); }
  else if(k==='up'){ sfx50(400,.18,'triangle',.05,900); } else if(k==='down'){ sfx50(700,.2,'triangle',.05,250); }
  else if(k==='faint'){ sfx50(420,.6,'sawtooth',.06,60); }
  else if(k==='win'){ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>arcTone(f,.22,'triangle',.07),i*120)); }
  else if(k==='lose'){ [392,330,262].forEach((f,i)=>setTimeout(()=>arcTone(f,.3,'sine',.07),i*180)); }
  else if(k==='wx'){ whoosh50(.8,.1); } else if(k==='shield'){ sfx50(1200,.25,'sine',.04,1800); } else ui('click'); }catch(_){} }

/* ---- démarrage ---- */
function cbStartDuel(o){
  if(CBV||document.getElementById('cbov')) return; try{ if(sheet) closeSheet(); }catch(_){}
  const team=(o.team||cbTeam()).map(u=>car(u)).filter(Boolean); if(!team.length) return toast('Aucune voiture pour combattre');
  const bag=Object.assign({},cbBag());
  const B=cbBattle({teams:[team.map(cbFromCar),o.foes],seed:(Date.now()^0x5bd1e995)>>>0,ai:[null,{d:o.d!=null?o.d:2}],bags:[bag,o.foeBag||{}],names:o.names||['Toi','Rival'],wx:o.wx});
  const disp=new Map(); B.sides.forEach(S2=>S2.team.forEach(f=>disp.set(f,f.hp)));
  CBV={B,o,disp,shown:[0,0],tab:'mv',busy:false,fast:false,lines:[],cars:team};
  const ov=document.createElement('div'); ov.id='cbov'; ov.innerHTML=`<div class="cb-ar" id="cbAr"><div class="cb-sky"></div><div class="cb-city"></div><div class="cb-wx" id="cbWx"></div>
    <div class="cb-pad foe"></div><div class="cb-pad me"></div><div class="cb-car foe" id="cbC1"></div><div class="cb-car me" id="cbC0"></div>
    <div class="cb-box foe" id="cbB1"></div><div class="cb-box me" id="cbB0"></div><div class="cb-fx" id="cbFx"></div><div class="cb-wxb" id="cbWxB"></div>
    <button class="cb-quit" data-cb="run" aria-label="Abandonner">🏳️</button></div>
    <div class="cb-log" id="cbLog"></div><div class="cb-menu" id="cbMenu"></div><div id="upd" style="display:none!important"></div>`;   /* #upd : les tutos et notes du jeu attendent la fin du duel */
  document.body.appendChild(ov); document.body.classList.add('cbon');
  ov.addEventListener('click',cbClick); ov.querySelector('#cbAr').addEventListener('pointerdown',()=>{ if(CBV&&CBV.busy) CBV.fast=true; });
  try{ auTry(()=>auMood&&auMood('drag')); }catch(_){}
  cbDraw(); cbRun(B.ev.splice(0)); }
/* ---- dessin ---- */
const cbHpCol=p=>p>.5?'#3cff9e':p>.2?'#ffd24a':'#ff4d6d';
function cbBoxHTML(s){ const B=CBV.B, f=B.sides[s].team[CBV.shown[s]], hp=Math.max(0,CBV.disp.get(f)), p=hp/f.mhp;
  const stg=Object.keys(f.stage).filter(k=>f.stage[k]).map(k=>`<i class="${f.stage[k]>0?'up':'dn'}">${CB_STAGE_N[k].slice(0,4)} ${f.stage[k]>0?'+':''}${f.stage[k]}</i>`).join('');
  const st=f.status?`<span class="cb-st" style="--sc:${CB_ST[f.status.id].c}">${CB_ST[f.status.id].ic} ${CB_ST[f.status.id].n}</span>`:'';
  const vol=Object.keys(f.vol).filter(k=>CB_VOL[k]&&k!=='flinch').map(k=>`<span class="cb-vl" title="${CB_VOL[k].n}">${CB_VOL[k].ic}</span>`).join('');
  const dots=B.sides[s].team.map((x,i)=>`<b class="${x.hp<=0?'ko':''} ${i===B.sides[s].act?'on':''}"></b>`).join('');
  return `<div class="cb-nm"><b>${f.nm}</b><span>Niv. ${f.lv}</span></div><div class="cb-tys">${f.ty.map(t=>`<span style="--tc:${CB_TYPES[t].c}">${CB_TYPES[t].ic}</span>`).join('')}${st}${vol}<span class="cb-team">${dots}</span></div>
    <div class="cb-hp"><i style="width:${(p*100).toFixed(1)}%;background:${cbHpCol(p)}"></i></div><div class="cb-hpn">${s===0?`${hp} / ${f.mhp}`:Math.round(p*100)+' %'}</div>
    <div class="cb-en" title="Énergie"><i style="width:${f.energy}%"></i></div>${stg?`<div class="cb-stg">${stg}</div>`:''}`; }
function cbDuelCarHTML(s){ const f=CBV.B.sides[s].team[CBV.shown[s]], m=M[f.mid]||M.epave, T=CB_TYPES[f.ty[0]];
  return `<div class="cb-cw" style="--t:${T.c}">${carSVG(m,100)}</div><div class="cb-aura" style="--tc:${T.c}"></div>`; }
function cbDraw(){ if(!CBV) return; const B=CBV.B; [0,1].forEach(s=>{ const b=$('cbB'+s), c=$('cbC'+s); if(b) b.innerHTML=cbBoxHTML(s); if(c&&c.dataset.k!==CBV.shown[s]+'|'+B.sides[s].team[CBV.shown[s]].mid){ c.dataset.k=CBV.shown[s]+'|'+B.sides[s].team[CBV.shown[s]].mid; c.innerHTML=cbDuelCarHTML(s); } });
  const w=B.wx&&cbWx(B), wx=$('cbWx'), wb=$('cbWxB'); if(wx) wx.className='cb-wx '+(w?'wx-'+w:''); $('cbAr').dataset.wx=w||'';
  if(wb) wb.innerHTML=w?`${CB_WX[w].ic} ${CB_WX[w].n}${B.wx.n<99?' · '+B.wx.n+' t.':''}`:''; cbMenu(); }
function cbMenu(){ const el=$('cbMenu'); if(!el||!CBV) return; const B=CBV.B, f=cbAct(B,0);
  el.classList.toggle('busy',!!CBV.busy);
  if(CBV.busy&&(B.over!=null||B.need)){ el.innerHTML=`<div class="cb-wait">${CBV.fast?'⏩':'Touche l’arène pour accélérer'}</div>`; return; }
  if(B.over!=null){ el.innerHTML=cbEndHTML(); return; }
  if(B.need&&B.need.includes(0)){ el.innerHTML='<div class="cb-h">Choisis la voiture suivante</div>'+cbTeamHTML(true); return; }
  if(f.charging||f.recharge){ el.innerHTML=`<button class="btn wide cb-go" data-cb="cont">${f.recharge?'⏳ Refroidir le moteur':'▶ Continuer '+CB_MV[f.charging].n}</button>`; return; }
  const tabs=`<div class="cb-tabs">${[['mv','⚔️ Attaques'],['it','🎒 Objets'],['sw','🚗 Équipe']].map(t=>`<button class="${CBV.tab===t[0]?'on':''}" data-cb="tab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  let body='';
  if(CBV.tab==='mv'){ const o=cbAct(B,1);
    body=`<div class="cb-mvs">${f.mv.map((x,i)=>{ const m=CB_MV[x.id], T=CB_TYPES[m.t], ok=cbUsable(B,0,i), e=m.c==='sta'?1:cbEff(m.t,o.ty), hint=m.c==='sta'?'':e===0?'aucun effet':e>=2?'super efficace':e<1?'peu efficace':'';
      return `<button class="cb-mb ${m.e?'ult':''}" style="--tc:${T.c}" data-cb="mv" data-v="${i}" ${ok?'':'disabled'}><b>${T.ic} ${m.n}</b><small>${m.c==='phy'?'Phy':m.c==='spe'?'Spé':'Statut'}${m.p>1?' · '+m.p:''} · ${m.e?'⚡'+m.e:x.pp+'/'+x.max+' PP'}</small>${hint?`<em class="${e>=2?'se':e<1?'nve':''}">${hint}</em>`:''}</button>`; }).join('')}</div>`; }
  if(CBV.tab==='it'){ const bag=B.sides[0].bag, ids=Object.keys(bag).filter(k=>bag[k]>0&&CB_IT[k]);
    body=ids.length?`<div class="cb-its">${ids.map(k=>{ const it=CB_IT[k], tgt=it.revive?B.sides[0].team.findIndex(x=>x.hp<=0):undefined, ok=cbItemOk(B,0,k,tgt);
      return `<button class="cb-ib" data-cb="it" data-v="${k}" ${ok?'':'disabled'}><b>${it.ic} ${it.n} ×${bag[k]}</b><small>${it.d}</small></button>`; }).join('')}</div><p class="cb-note">${B.sides[0].itUsed}/${CB_IT_MAX} objets utilisés ce combat</p>`:'<p class="cb-note">Ton sac de combat est vide.</p>'; }
  if(CBV.tab==='sw') body=cbTeamHTML(false);
  el.innerHTML=tabs+body; }
function cbTeamHTML(forced){ const B=CBV.B, S2=B.sides[0], f=cbAct(B,0);
  return `<div class="cb-tm">${S2.team.map((x,i)=>{ const p=x.hp/x.mhp, dis=x.hp<=0||i===S2.act||(!forced&&f.vol.trap);
    return `<button class="cb-tb" data-cb="${forced?'rep':'sw'}" data-v="${i}" ${dis?'disabled':''}><b>${x.nm}</b><small>Niv. ${x.lv} · ${x.ty.map(t=>CB_TYPES[t].ic).join('')} ${x.status?CB_ST[x.status.id].ic:''}${i===S2.act&&!forced?' · en piste':''}</small><i><em style="width:${p*100}%;background:${cbHpCol(p)}"></em></i></button>`; }).join('')}</div>${!forced&&f.vol.trap?'<p class="cb-note">Coincé : impossible de changer.</p>':''}`; }
/* ---- journal ---- */
function cbLine(tx){ if(!tx||!CBV) return; CBV.lines.push(tx); const el=$('cbLog'); if(!el) return; el.innerHTML=CBV.lines.slice(-3).map((t,i,a)=>`<p class="${i===a.length-1?'on':''}">${t}</p>`).join(''); }
/* ---- effets visuels ---- */
function cbFxAt(s,cls,html,ms){ const fx=$('cbFx'); if(!fx) return; const d=document.createElement('div'); d.className='cbfx '+cls+' s'+s; d.innerHTML=html||''; fx.appendChild(d); setTimeout(()=>d.remove(),ms||900); return d; }
function cbAnim(s,cls,ms){ const c=$('cbC'+s); if(!c) return; c.classList.remove(cls); void c.offsetWidth; c.classList.add(cls); setTimeout(()=>c.classList.remove(cls),ms||600); }
async function cbRun(evs){ if(!CBV) return; CBV.busy=true; cbMenu(); const B=CBV.B, sp=()=>CBV.fast?.3:1, W=ms=>cbSleep(ms*sp());
  let lastMove=null;
  for(const e of evs){ if(!CBV) return; if(e.tx) cbLine(e.tx);
    switch(e.k){
      case 'start': await W(500); break;
      case 'enter': CBV.shown[e.s]=e.i; CBV.disp.set(B.sides[e.s].team[e.i],CBV.disp.get(B.sides[e.s].team[e.i])); cbDraw(); cbAnim(e.s,'cb-in',700); cbSfx('cast','meca'); await W(750); break;
      case 'out': cbAnim(e.s,'cb-out',500); await W(450); break;
      case 'move': lastMove=e; cbAnim(e.s,'cb-lunge',520); cbSfx('cast',e.t); if(e.c&&e.c!=='sta'){ const T=CB_TYPES[e.t]||CB_TYPES.meca; cbFxAt(e.s,'cb-proj '+(e.c==='phy'?'phy':'spe')+(e.ult?' ult':''),T.ic,700).style.setProperty('--tc',T.c); if(e.ult){ $('cbAr').classList.add('cb-ultf'); setTimeout(()=>{ const a=$('cbAr'); a&&a.classList.remove('cb-ultf'); },700); } }
        else cbFxAt(e.s,'cb-aurafx','',800).style.setProperty('--tc',(CB_TYPES[e.t]||CB_TYPES.meca).c); await W(e.ult?900:560); break;
      case 'dmg': { const f=B.sides[e.s].team[CBV.shown[e.s]]; CBV.disp.set(f,Math.max(0,CBV.disp.get(f)-(e.n||0))); cbAnim(e.s,'cb-hit',450); if(e.n) cbFxAt(e.s,'cb-num'+(e.crit?' crit':'')+(e.eff>=2?' se':''),'−'+e.n,1000);
        cbSfx(e.crit?'crit':'hit'); if(e.crit) { $('cbAr').classList.add('cb-shake'); setTimeout(()=>{ const a=$('cbAr'); a&&a.classList.remove('cb-shake'); },400); } cbDraw(); await W(e.st?380:520); break; }
      case 'eff': cbFxAt(lastMove?1-lastMove.s:1,'cb-pop '+(e.eff>=2?'se':e.eff<1?'nve':''),e.eff>=2?'SUPER EFFICACE !':e.eff===0?'AUCUN EFFET':'Peu efficace…',1000); cbSfx(e.eff>=2?'super':'weak'); await W(650); break;
      case 'heal': { const f=B.sides[e.s].team[CBV.shown[e.s]]; CBV.disp.set(f,Math.min(f.mhp,CBV.disp.get(f)+(e.n||0))); cbFxAt(e.s,'cb-num heal','+'+e.n,1000); cbAnim(e.s,'cb-glow',700); cbSfx('heal'); cbDraw(); await W(600); break; }
      case 'st': cbFxAt(e.s,'cb-pop st',CB_ST[e.st].ic+' '+CB_ST[e.st].n,1100).style.setProperty('--sc',CB_ST[e.st].c); cbSfx('st'); cbDraw(); await W(700); break;
      case 'vol': cbFxAt(e.s,'cb-pop st',(CB_VOL[e.v]||{}).ic+' '+((CB_VOL[e.v]||{}).n||''),1000); cbSfx('st'); cbDraw(); await W(600); break;
      case 'sb': cbFxAt(e.s,'cb-arrows '+(e.n>0?'up':'dn'),e.n>0?'▲▲▲':'▼▼▼',900); cbSfx(e.n>0?'up':'down'); cbDraw(); await W(560); break;
      case 'wx': cbSfx('wx'); cbDraw(); await W(900); break;
      case 'protect': cbFxAt(e.s,'cb-shield','',900); cbSfx('shield'); await W(600); break;
      case 'block': cbFxAt(e.s,'cb-shield','',700); cbSfx('shield'); await W(500); break;
      case 'miss': cbFxAt(e.s,'cb-pop','Raté !',800); await W(550); break;
      case 'immune': cbFxAt(e.s,'cb-pop nve','Aucun effet',800); await W(550); break;
      case 'item': cbFxAt(e.s,'cb-pop it',(CB_IT[e.id]||{}).ic||'🎒',900); cbSfx('heal'); cbDraw(); await W(600); break;
      case 'faint': cbAnim(e.s,'cb-faint',900); cbSfx('faint'); await W(1000); { const c=$('cbC'+e.s); if(c) c.classList.add('cb-gone'); } break;
      case 'charge': cbFxAt(e.s,'cb-aurafx big','',1000).style.setProperty('--tc','#fff'); await W(700); break;
      case 'stuck': cbAnim(e.s,'cb-hit',400); await W(600); break;
      case 'end': cbSfx(e.win===0?'win':'lose'); await W(700); break;
      default: await W(e.tx?520:120); }
  }
  if(!CBV) return; B.sides.forEach(S2=>S2.team.forEach(f=>CBV.disp.set(f,f.hp))); [0,1].forEach(s=>{ const c=$('cbC'+s); if(c&&cbAct(B,s).hp>0) c.classList.remove('cb-gone'); });
  CBV.busy=false; CBV.fast=false; CBV.tab='mv'; cbDraw();
  if(B.over!=null&&!CBV.res) cbFinish(); }
/* ---- actions du joueur ---- */
function cbClick(ev){ const b=ev.target.closest('[data-cb]'); if(!b||!CBV||b.disabled) return; const k=b.dataset.cb, v=b.dataset.v, B=CBV.B;
  if(k==='close'){ cbClose(); return; }
  if(CBV.busy) return;
  if(k==='tab'){ CBV.tab=v; cbMenu(); try{ ui('click'); }catch(_){} return; }
  if(k==='rep'){ if(cbReplace(B,0,+v)) cbRun(B.ev.splice(0)); return; }
  if(k==='run'){ if(B.over!=null) return; if(!CBV.runArm){ CBV.runArm=1; b.classList.add('arm'); cbLine('Touche encore 🏳️ pour abandonner le duel.'); setTimeout(()=>{ if(CBV){ CBV.runArm=0; b.classList.remove('arm'); } },2500); return; } CBV.runArm=0; cbPlayTurn({k:'run'}); return; }
  if(k==='mv') return cbPlayTurn({k:'mv',i:+v});
  if(k==='cont') return cbPlayTurn({k:'mv',i:0});
  if(k==='sw') return cbPlayTurn({k:'sw',i:+v});
  if(k==='it'){ const it=CB_IT[v], tgt=it.revive?B.sides[0].team.findIndex(x=>x.hp<=0):undefined; return cbPlayTurn({k:'it',id:v,tgt}); } }
function cbPlayTurn(a){ const B=CBV.B; if(B.over!=null||B.need) return; cbTurn(B,[a,null]); cbRun(B.ev.splice(0)); }
/* ---- fin du duel : XP de combat, bilan ---- */
function cbFinish(){ const B=CBV.B, o=CBV.o, win=B.over===0, foeLv=Math.round(B.sides[1].team.reduce((a,f)=>a+f.lv,0)/B.sides[1].team.length), res={win,xp:[],ups:[]};
  B.sides[0].team.forEach(f=>{ const c=car(f.uid); if(!c) return; const s=cbOf(c), used=f.turns>0||f.hp<f.mhp||B.sides[0].act===B.sides[0].team.indexOf(f);
    if(win) s.w=(s.w||0)+1; else s.l=(s.l||0)+1;
    const xp=used?Math.round(cbXpFor(foeLv,!!o.trainer)*(win?1:.35)):0; if(xp){ const r=cbGainXP(c,xp); res.xp.push([f.nm,xp,r]); } });
  /* objets consommés */
  const bag=cbBag(); Object.keys(bag).forEach(k=>{ bag[k]=Math.max(0,B.sides[0].bag[k]||0); });
  try{ save(); }catch(_){} CBV.res=res; cbMenu();
  if(typeof o.onEnd==='function'){ try{ o.onEnd(res,B); }catch(e){ console.error(e); } } }
function cbEndHTML(){ const r=CBV.res||{xp:[]}, win=CBV.B.over===0;
  return `<div class="cb-end ${win?'win':'lose'}"><div class="cb-et">${win?'🏆 VICTOIRE':'💥 DÉFAITE'}</div>${CBV.o.endMsg?`<p class="cb-note">${CBV.o.endMsg}</p>`:''}
    ${r.xp.map(([n,xp,lr])=>`<div class="cb-xpl"><b>${n}</b><span>+${fmt(xp)} XP de combat${lr.l1>lr.l0?` · <em>Niveau ${lr.l1} !</em>`:''}</span>${lr.fresh&&lr.fresh.length?`<small>Nouvelles attaques : ${lr.fresh.map(id=>CB_MV[id].n).join(', ')}</small>`:''}</div>`).join('')}
    ${CBV.o.rewardHTML?CBV.o.rewardHTML(win):''}<button class="btn wide" data-cb="close">Continuer</button></div>`; }
function cbClose(){ const ov=document.getElementById('cbov'); if(ov) ov.remove(); document.body.classList.remove('cbon'); const o=CBV&&CBV.o; CBV=null; try{ auTry(()=>auMood&&auMood('menu')); }catch(_){} try{ render(); }catch(_){} if(o&&typeof o.onClose==='function') o.onClose(); }

/* ---- duel d'entraînement (rival au hasard du même niveau) : sert de base à l'Arène ---- */
function cbTrainFoes(n,lv){ const ids=CARS.map(c=>c.id).filter(id=>id!=='velo'), out=[]; for(let i=0;i<n;i++){ const mid=ids[Math.floor(Math.random()*ids.length)], ty=cbTypesOf(mid), iv={}; CB_SK.forEach(k=>iv[k]=8+Math.floor(Math.random()*16)); out.push({mid,lv:clamp(lv+Math.floor(Math.random()*3)-1,1,CB_LVMAX),iv,tal:(CB_TAL_BY[ty[0]]||CB_TAL_BY.meca)[Math.floor(Math.random()*4)]}); } return out; }
ACT.cbtrain=function(){ if(!cbAwake()) return toast('🔒 Les combats s’ouvrent après l’éveil cosmique (niveau 10)'); const t=cbTeam(), lv=Math.round(t.reduce((a,u)=>a+cbOf(car(u)).lv,0)/t.length);
  cbStartDuel({team:t,foes:cbTrainFoes(Math.min(3,t.length),lv),d:1,names:['Toi','Pilote d’entraînement'],trainer:false}); };
