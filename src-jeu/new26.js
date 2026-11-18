/* ===== v0.47 : PISTE D'ESSAI — tout le circuit de Spa-Francorchamps, chrono par secteur, records ===== */
const PT_SEC=[{n:'S1',nom:'La Source → Les Combes',a:0,b:2650},{n:'S2',nom:'Malmedy → Pouhon → Campus',a:2650,b:5200},{n:'S3',nom:'Stavelot → Blanchimont → Bus Stop',a:5200,b:null}];
const PT_REFV=1, PT_BENCH=['piccola','riva','touge','gts','rossa','aurion'];
function ptS(){ return S.ptest||(S.ptest={rec:{},best:{},hist:[],ref:{},refv:PT_REFV,laps:0}); }
const ptT=(t)=>{ if(t==null||!isFinite(t)) return '—'; const m=Math.floor(t/60), s=t-m*60; return (m?m+':':'')+(m&&s<10?'0':'')+s.toFixed(3).replace('.',','); };
const ptMark=(L,j)=>Math.floor(j/3)*L+[0,2650,5200][j%3];
function ptNew(s0){ const L=TRK.L; let u=s0; if(u>L/2) u-=L; return {L,u,prev:s0,next:0,mk:[],lapV:0,secV:[0,0,0],offT:0,valid:true,laps:[],ev:[],nit:0,secN:[],t0:0}; }
/* avance le chrono : s = abscisse sur la piste, t = temps de la séance, v en m/s */
function ptStep(T,s,t,h,v,onPave){
  const L=T.L, d=dS(s,T.prev); T.prev=s; if(Math.abs(d)>60){ T.valid=false; return; }
  const u0=T.u; T.u+=d; if(T.next>0){ const sec=(T.next-1)%3; if(v>T.secV[sec]) T.secV[sec]=v; if(v>T.lapV) T.lapV=v; if(!onPave) T.offT+=h; }
  while(T.u>=ptMark(L,T.next)){
    const j=T.next, m=ptMark(L,j), fr=T.u>u0?Math.max(0,Math.min(1,(m-u0)/(T.u-u0))):1, tc=t-h+h*fr; T.mk[j]=tc; T.next++;
    if(j%3===0){
      if(j>0){ const n=j/3, t0=T.mk[j-3], lap=tc-t0, sc=[T.mk[j-2]-T.mk[j-3],T.mk[j-1]-T.mk[j-2],tc-T.mk[j-1]], len=[2650,2550,L-5200];
        const rec={n,t:lap,s:sc,vmax:T.lapV*3.6,secV:T.secV.map(x=>x*3.6),secA:sc.map((x,k)=>len[k]/x*3.6),vavg:L/lap*3.6,valid:T.valid&&T.offT<=3&&n>1,off:T.offT,nit:T.nit,out:n===1};
        T.laps.push(rec); T.ev.push({k:'lap',rec}); }
      T.lapV=0; T.secV=[0,0,0]; T.offT=0; T.valid=true; T.nit=0;
    } else { const k=(j%3)-1, st=tc-T.mk[j-1]; T.ev.push({k:'sec',i:k,t:st,vmax:T.secV[k]*3.6}); }
  }
  while(T.next>0&&T.u<ptMark(L,T.next-1)){ T.next--; T.valid=false; }
}
/* enregistre un tour terminé ; renvoie {pb,rec,sec:[...]} */
function ptRecord(card,m,r){
  const P=ptS(), key=card.uid+'|'+m, old=P.rec[key], B=P.best[m]||(P.best[m]={s:[null,null,null],lap:null}); const out={pb:false,secPb:[false,false,false],secRec:[false,false,false]};
  P.laps++; P.hist.unshift({uid:card.uid,mid:card.mid,m,t:r.t,s:r.s,vmax:r.vmax,valid:r.valid,ts:Date.now()}); P.hist.length=Math.min(P.hist.length,40);
  if(!r.valid) return out;
  const o=old||(P.rec[key]={uid:card.uid,mid:card.mid,nom:M[card.mid].nom,m,lap:null,s:[null,null,null],sv:[0,0,0],vmax:0,vavg:0,ts:0});
  o.mid=card.mid; o.nom=M[card.mid].nom; o.up=ptPow(card);
  if(o.lap==null||r.t<o.lap){ o.lap=r.t; o.vmax=r.vmax; o.vavg=r.vavg; o.ts=Date.now(); o.ls=r.s.slice(); out.pb=true; }
  r.s.forEach((x,k)=>{ if(o.s[k]==null||x<o.s[k]){ o.s[k]=x; out.secPb[k]=true; } if(r.secV[k]>(o.sv[k]||0)) o.sv[k]=r.secV[k]; if(B.s[k]==null||x<B.s[k]){ B.s[k]=x; out.secRec[k]=true; } });
  if(B.lap==null||r.t<B.lap){ B.lap=r.t; out.rec=true; }
  return out;
}
function ptPow(c){ try{ const s=st(c); return {ch:Math.round(s.ch||s.pui||0),kg:Math.round(s.kg||0),vm:Math.round(s.vmax||0)}; }catch(_){ return null; } }
/* ---------- séance en direct ---------- */
const PTUI={m:'sec'};
const isPT=()=>!!(RC&&R&&R.test&&RC.kind==='spa');
function ptStart(uid,m){
  if(!TRK.ready||!glEnsure()||!window.THREE) return toast('Le circuit se charge ou la 3D est indisponible');
  const c=car(uid); if(!c) return; closeSheet();
  const mn={d:'circuit',m:m||PTUI.m||'sec',sp:'tour',test:1};
  R={ev:{id:'test',nom:'Piste d’essai',manches:[mn],opp:{},lvl:0,gain:0},pick:[uid],opps:[[]],auto:false,rows:[],i:0,test:1};
  try{ startSpa(0); }catch(e){ console.error(e); } if(!RC) return; RC.test=true; RC.O={pil:'',prog:0}; RC.len=TRK.L; RC.pos=1; RC.T=ptNew(RC.P.s); RC.tm=m||PTUI.m||'sec'; RC.cardU=uid; RC.sess=[]; RC.pbMsg=null;
}
function tickTest(h){
  const P=RC.P, T=RC.T; RC.clock+=h; const t=RC.clock;
  if(t<0){ if(inThr()>.05&&P.penSet==null){ P.penSet=1; P.pen=.8; flash('Faux départ, moteur coupé 0,8 s','#FF4D6D',1.6); } T.prev=P.s; return; }
  if(!P.go){ P.go=true; if(inThr()>.05&&!P.penSet) flash(t<.3?'Départ parfait':'Parti','#3CFF9E',.9); }
  const inp={steer:inSteer(),thr:inThr(),brake:RC.inp.b||RC.inp.kb,hand:RC.inp.hand};
  const nit0=P.nit||0;
  carStep(P,inp,h); carWorld(P,h); P.thrNow=inp.thr; P.braking=!!inp.brake; driftTick(P,h);
  if((P.nit||0)>nit0) T.nit++;
  const fr=frameAt(P.s), al=P.vx*Math.cos(fr.th)+P.vz*Math.sin(fr.th);
  P.wrongT=(al<-4)?P.wrongT+h:0; P.stuckT=(P.v<1.2)?P.stuckT+h:0;
  ptStep(T,P.s,t,h,P.v,P.onPave);
  while(T.ev.length){ const e=T.ev.shift(); ptEvent(e); }
  if(P.msgHit==null&&P.hitFlash>.6){ P.msgHit=1; flash('Choc !','#FF4D6D',.8); } if(P.hitFlash<.1) P.msgHit=null;
}
function ptEvent(e){
  const c=car(RC.cardU), m=RC.tm, P=ptS(), o=P.rec[c.uid+'|'+m], B=P.best[m]||{s:[null,null,null]};
  if(e.k==='sec'){ const pb=o&&o.s[e.i], gb=B.s[e.i], d=pb!=null?e.t-pb:null; const col=gb!=null&&e.t<gb?'#B05CFF':pb!=null&&e.t<pb?'#3CFF9E':'#FCEE0A';
    RC.secShow=RC.secShow||{}; RC.secShow[e.i]={t:e.t,col,d,v:e.vmax}; flash(`S${e.i+1}  ${ptT(e.t)}${d!=null?`  (${d>=0?'+':''}${d.toFixed(3).replace('.',',')})`:''}`,col,2.4); }
  else { const r=e.rec, res=ptRecord(c,m,r); r.res=res; RC.sess.push(r); RC.last=r; RC.secShow={};
    const col=!r.valid?'#FF4D6D':res.rec?'#B05CFF':res.pb?'#3CFF9E':'#FCEE0A';
    flash(r.out?`Tour de lancement ${ptT(r.t)}`:r.valid?`${res.rec?'RECORD ':res.pb?'MEILLEUR PERSO ':''}TOUR ${ptT(r.t)}`:`Tour invalide (${r.off>3?'hors piste':'remise en piste'}) ${ptT(r.t)}`,col,3.2); save(); if(r.valid&&!r.out) auTry(()=>ui(res.rec?'up':'coins')); }
}
const _tickSpa26=tickSpa; tickSpa=function(h){ if(isPT()){ if(RC.T) tickTest(h); return; } return _tickSpa26.apply(this,arguments); };
const _vSpa26=vSpa;
vSpa=function(){ let h=_vSpa26.apply(this,arguments); if(!isPT()) return h.replace('<button class="btn alt sm" id="bResp"',`<button class="btn alt sm" id="bCam" data-a="ptcam">${ptCamTx()}</button><button class="btn alt sm" id="bResp"`);
  h=h.replace('<div class="race">','<div class="race ptest">').replace(/<span>Manche [^<]*<\/span>/,'<span>🏁 Piste d’essai · Spa</span>').replace('<div class="prog2"><i id="hProg"></i></div>','').replace('<button class="btn alt sm" id="bResp"',`<button class="btn alt sm" id="bCam" data-a="ptcam">${ptCamTx()}</button><button class="btn alt sm" id="bResp"`).replace('Remettre en piste (+5 s)','Remettre en piste').replace('>Abandonner<','>Terminer la séance<'); const i=h.lastIndexOf('</div>'); return h.slice(0,i)+'<div class="ptp" id="ptp"></div>'+h.slice(i); };
const _hud26=hudSpa; hudSpa=function(){ _hud26.apply(this,arguments); if(isPT()&&RC.T){ try{ ptHud(); }catch(e){ console.error(e); } } };
let ptHudT=0;
function ptHud(){
  const e=document.getElementById('ptp'); if(!e) return; const now=performance.now(); if(now-ptHudT<120) return; ptHudT=now;
  const T=RC.T, t=RC.clock, c=car(RC.cardU), P=ptS(), o=P.rec[c.uid+'|'+RC.tm], B=P.best[RC.tm]||{s:[null,null,null],lap:null};
  const lapNo=T.next>0?Math.floor((T.next-1)/3)+1:0, j0=lapNo?3*(lapNo-1):0, tl=lapNo?t-T.mk[j0]:0, cur=T.next>0?(T.next-1)%3:-1;
  const sh=RC.secShow||{}, chips=[0,1,2].map(k=>{ let tx='—', cl=''; if(sh[k]){ tx=ptT(sh[k].t); cl='d '+(sh[k].col==='#B05CFF'?'pur':sh[k].col==='#3CFF9E'?'grn':'yel'); } else if(k===cur){ tx=ptT(t-T.mk[T.next-1]); cl='cur'; } return `<i class="${cl}"><em>S${k+1}</em>${tx}</i>`; }).join('');
  const last=RC.last, bad=lapNo&&(!T.valid||T.offT>3);
  const h=`<div class="ptl"><b>${lapNo?(lapNo===1?'TOUR DE LANCEMENT':'TOUR '+lapNo):'DÉPART'}</b><span class="ptt">${lapNo?ptT(tl):'—'}</span></div><div class="pts">${chips}</div><div class="ptb"><span>Dernier <b>${last?ptT(last.t):'—'}</b></span><span>Record <b>${o&&o.lap!=null?ptT(o.lap):'—'}</b></span><span>Vmax <b>${Math.round(Math.max(T.lapV*3.6,0))}</b></span></div>${bad?'<div class="ptw">⚠ Tour invalide : '+(T.offT>3?'trop de temps hors piste':'remise en piste')+'</div>':''}`;
  if(e._h!==h){ e._h=h; e.innerHTML=h; }
}
const _resp26=respawnPlayer;
respawnPlayer=function(){ if(isPT()){ if(RC.done||RC.clock<0||!RC.T) return; respawn(RC.P); RC.T.valid=false; flash('Remise en piste : tour invalidé','#FCEE0A',1.6); ui('respawn'); return; } return _resp26.apply(this,arguments); };
const _fn26=fireNitro;
fireNitro=function(){ if(isPT()){ const had=S.nitro; S.nitro=Math.max(1,S.nitro); try{ _fn26(); }finally{ S.nitro=had; } const b=$('pNit'); if(b){ const sm=b.querySelector('small'); if(sm) sm.textContent='∞'; } return; } return _fn26.apply(this,arguments); };
function ptExit(){ const um=RC&&RC.sess?RC.sess.slice():[]; leaveRace(); R=null; view='hub'; PTUI.last=um; render(); openSheet({t:'ptest'}); }
const _quit26=ACT.quit; ACT.quit=function(){ if(isPT()) return ptExit(); return _quit26.apply(this,arguments); };
/* ---------- références : un pilote IA fait un tour lancé avec la voiture de série ---------- */
function ptRefJob(mid,m){ const card={uid:-1,mid,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{}}, mn={d:'circuit',m:m||'sec'}, r=mkRacer(card,mn,{skill:.93,err:0,react:0}), c=mkSpaCar(r,r.m,TRK.L-8,0,100);
  c.mass=Math.max(80,st(card).kg); c.go=true; c.dr={pts:0,chain:0,t:0,grace:0,mult:1,best:0,n:0,live:false}; const prof=aiProfile(r,.93), v0=Math.min(prof[c.i]||20,r.VM*.9); c.vx=Math.cos(c.psi)*v0; c.vz=Math.sin(c.psi)*v0;
  return {mid,m,r,c,prof,T:ptNew(c.s),t:0,done:false,res:null}; }
function ptRefRun(J,steps){ for(let k=0;k<steps&&!J.done;k++){ const h=1/120; const inp=aiControl(J.c,J.prof,0,.93); carStep(J.c,inp,h); carWorld(J.c,h); J.t+=h; ptStep(J.T,J.c.s,J.t,h,J.c.v,J.c.onPave);
    if(J.T.laps.length){ const l=J.T.laps[0]; J.done=true; J.res={t:l.t,s:l.s,vmax:l.vmax,vavg:l.vavg,valid:l.valid}; } else if(J.t>480){ J.done=true; J.res=null; } } }
let PTR=null;
function ptRefAll(){
  if(PTR||!TRK.ready) return; const P=ptS(); if(P.refv!==PT_REFV){ P.ref={}; P.refv=PT_REFV; }
  const m=PTUI.m, mids=[...new Set(PT_BENCH.concat(S.cars.map(c=>c.mid)))].filter(id=>M[id]&&!(M[id].noAI)&&!P.ref[id+'|'+m]); if(!mids.length) return;
  PTR={q:mids,n:0,tot:mids.length,m,J:null};
  const pump=()=>{ if(!PTR) return; try{ if(!PTR.J){ const id=PTR.q.shift(); if(!id){ PTR=null; save(); if(sheet&&sheet.t==='ptrank') renderSheet(); return; } PTR.J=ptRefJob(id,PTR.m); }
      ptRefRun(PTR.J,2500); if(PTR.J.done){ ptS().ref[PTR.J.mid+'|'+PTR.m]=PTR.J.res||{t:null}; PTR.J=null; PTR.n++; save(); if(sheet&&sheet.t==='ptrank') renderSheet(); } }catch(e){ console.error(e); PTR=null; return; } setTimeout(pump,8); };
  setTimeout(pump,20); if(sheet&&sheet.t==='ptrank') renderSheet(); }
/* ---------- feuilles ---------- */
const WNAME={sec:'☀️ Sec',pluie:'🌧️ Pluie',neige:'❄️ Neige'};
function ptSheet(X){
  if(!sheet||(sheet.t!=='ptest'&&sheet.t!=='ptrank')) return false; const P=ptS(), m=PTUI.m;
  const chips=Object.keys(WNAME).map(k=>`<button class="chip ${k===m?'on':''}" data-a="ptw" data-id="${k}">${WNAME[k]}</button>`).join('');
  if(sheet.t==='ptest'){
    const rows=S.cars.map(c=>{ const o=P.rec[c.uid+'|'+m], mm=M[c.mid]; return `<div class="inv-r"><span class="inv-i">🏎️</span><div class="inv-t"><b>${mm.nom}${c.sh?' ✨':''}</b><small>${o&&o.lap!=null?`Record ${ptT(o.lap)} · Vmax ${Math.round(o.vmax)} km/h`:'Pas encore de chrono'} · état ${c.etat} %</small></div><button class="btn sm" data-a="ptgo" data-id="${c.uid}">Rouler</button></div>`; }).join('');
    const um=PTUI.last&&PTUI.last.length?`<h3 class="rh">Dernière séance</h3>${PTUI.last.map(r=>`<div class="inv-r ${r.valid?'':'lock'}"><span class="inv-i">${r.out?'🚦':r.valid?(r.res&&r.res.rec?'🟣':r.res&&r.res.pb?'🟢':'⏱️'):'⚠️'}</span><div class="inv-t"><b>Tour ${r.n} · ${ptT(r.t)}</b><small>${r.s.map((x,k)=>'S'+(k+1)+' '+ptT(x)).join(' · ')} · Vmax ${Math.round(r.vmax)}</small></div></div>`).join('')}`:'';
    $('sheet').innerHTML=`<div class="inv">${X}<h2>🏁 Piste d’essai</h2><p class="note">Tout le circuit de Spa-Francorchamps (7,05 km) rien que pour toi : pas d’adversaires, vraies barrières, vibreurs, herbe, gravier et sable. Le chrono découpe chaque tour en 3 secteurs. Le premier tour est un tour de lancement, il ne compte pas pour les records. Remise en piste ou plus de 3 s hors piste : tour invalide. Nitro illimitée.</p>
     <div class="chips" style="margin:8px 0">${chips}</div>${TRK.ready?'':'<p class="note">⏳ Le circuit se charge…</p>'}${rows}${um}
     <div class="brow" style="margin-top:10px"><button class="btn alt" data-a="ptrank">📊 Records & comparaison</button></div></div>`; return true; }
  /* classement / comparaison */
  const B=P.best[m]||{s:[null,null,null],lap:null}, mine=Object.values(P.rec).filter(o=>o.m===m&&o.lap!=null).sort((a,b)=>a.lap-b.lap), lead=mine[0];
  const col=(x,k,o)=>x==null?'':(B.s[k]!=null&&x<=B.s[k]+1e-6?'pur':x<=o.s[k]+1e-6?'grn':'');
  const tab=mine.length?`<div class="ptab"><div class="ptr hd"><b>#</b><b>Voiture</b><b>Tour</b><b>S1</b><b>S2</b><b>S3</b><b>Vmax</b></div>${mine.map((o,i)=>`<div class="ptr"><span>${i+1}</span><span class="nm">${o.nom}${car(o.uid)?'':' (vendue)'}${o.up?`<small>${o.up.ch} ch · ${o.up.kg} kg</small>`:''}</span><span class="tl">${ptT(o.lap)}${i?`<small>+${(o.lap-lead.lap).toFixed(3).replace('.',',')}</small>`:''}</span>${o.s.map((x,k)=>`<span class="${col(x,k,o)}">${ptT(x)}</span>`).join('')}<span>${Math.round(o.vmax)}</span></div>`).join('')}</div>`:'<p class="note">Aucun tour valide pour l’instant dans ces conditions. Roule au moins 2 tours.</p>';
  const refs=PT_BENCH.concat(S.cars.map(c=>c.mid)).filter((x,i,a)=>a.indexOf(x)===i).map(id=>({id,r:P.ref[id+'|'+m]})).filter(x=>x.r&&x.r.t!=null);
  const all=refs.map(x=>({n:M[x.id].nom,t:x.r.t,v:x.r.vmax,kind:'ref'})).concat(mine.map(o=>({n:o.nom+' · ta voiture',t:o.lap,v:o.vmax,kind:'me'}))).sort((a,b)=>a.t-b.t);
  const cmp=all.length?`<div class="ptab cmp">${all.map((x,i)=>`<div class="ptr ${x.kind}"><span>${i+1}</span><span class="nm">${x.n}</span><span class="tl">${ptT(x.t)}</span><span>${Math.round(x.v)} km/h</span></div>`).join('')}</div>`:'';
  const busy=PTR?`<p class="note">⏳ Calcul des références… ${PTR.n}/${PTR.tot}</p>`:`<button class="btn alt" data-a="ptref">${refs.length?'Mettre à jour les références':'Calculer les références'}</button>`;
  const dv=S.cars.map(c=>{ const o=P.rec[c.uid+'|'+m], r=P.ref[c.mid+'|'+m]; return o&&o.lap!=null&&r&&r.t!=null?`<div class="inv-r"><span class="inv-i">${o.lap<r.t?'🚀':'📉'}</span><div class="inv-t"><b>${M[c.mid].nom}</b><small>${o.lap<r.t?'Plus rapide':'Plus lent'} que la série (pilote IA) de ${Math.abs(o.lap-r.t).toFixed(3).replace('.',',')} s</small></div></div>`:''; }).join('');
  $('sheet').innerHTML=`<div class="inv">${X}<h2>📊 Records & comparaison</h2><div class="chips" style="margin:8px 0">${chips}</div><h3 class="rh">Mes voitures</h3>${tab}<h3 class="rh">Face aux références</h3><p class="note">Un pilote IA (niveau constant) fait un tour lancé avec chaque voiture de série. Compare tes chronos à ces repères.</p>${busy}${cmp}${dv?'<h3 class="rh">Effet de tes améliorations</h3>'+dv:''}<div class="brow" style="margin-top:10px"><button class="btn alt" data-a="ptest">← Piste d’essai</button></div></div>`; return true; }
Object.assign(ACT,{ ptest(){ openSheet({t:'ptest'}); }, ptrank(){ openSheet({t:'ptrank'}); }, ptw(d){ PTUI.m=d.id; renderSheet(); }, ptgo(d){ ptStart(+d.id,PTUI.m); }, ptref(){ ptRefAll(); } });
const _vEp26=vEpreuves;
vEpreuves=function(){ return _vEp26.apply(this,arguments);
  /* carte retirée : l’accès se fait par la grande porte du garage 3D */ const rec=Object.values(ptS().rec).filter(o=>o.lap!=null).sort((a,b)=>a.lap-b.lap)[0];
  return `<button class="row ptcard" data-a="ptest"><span class="ico">🏁</span><span class="grow"><span class="ttl">Piste d’essai · Spa-Francorchamps</span><br><span class="sub">Tour libre, chrono par secteur, records${rec?' · meilleur '+ptT(rec.lap):''}</span></span><span class="gain">Libre</span></button>`+_vEp26.apply(this,arguments); };

/* ---- caméras de la piste d'essai : 0 poursuite d'origine, 1 vue proche ~30°, 2 cockpit avec volant ---- */
const PTCAMN=['Poursuite','Proche 30°','Cockpit'];
function ptCamI(){ const v=S.camv!=null?S.camv:(S.ptest&&S.ptest.cam); return v>=0&&v<3?v|0:0; }
function ptCamTx(){ return '📷 '+PTCAMN[ptCamI()]; }
ACT.ptcam=function(){ S.camv=(ptCamI()+1)%3; RS&&(RS.camP2=null); save(); const b=$('bCam'); if(b) b.textContent=ptCamTx(); try{ flash('Vue : '+PTCAMN[S.camv],'#00E5FF',1.1); }catch(_){} };
function ptWheel(on,st){
  const el=$('rslot'); if(!el||!el.parentNode) return; const w=el.parentNode; let d=w.querySelector('#ptwh');
  if(!on){ if(d) d.remove(); return; }
  if(!d){ d=document.createElement('div'); d.id='ptwh'; d.innerHTML='<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" fill="none" stroke="#10131f" stroke-width="22"/><circle cx="100" cy="100" r="86" fill="none" stroke="#2b3150" stroke-width="14"/><path d="M14 104 Q100 120 186 104" stroke="#10131f" stroke-width="16" fill="none"/><rect x="92" y="108" width="16" height="78" fill="#10131f"/><rect x="92" y="6" width="16" height="22" fill="#ffd400"/><circle cx="100" cy="104" r="20" fill="#1a1e33" stroke="#00e5ff" stroke-width="4"/></svg>'; w.appendChild(d); }
  d.firstChild.style.transform='rotate('+(st*110).toFixed(1)+'deg)';
}
const _draw26=drawSpa;
drawSpa=function(dt,time){
  _draw26.apply(this,arguments);
  if(!RS||!RC||!RC.P||RC.kind!=='spa'){ return; }
  if(typeof orbitOn==='function'&&orbitOn()) return;
  const m=ptCamI(), P=RC.P, cam=RS.cam; try{ RS.pc.g.visible=(m!==2); }catch(_){}
  if(m===0){ ptWheel(false); return; }
  const fx=Math.cos(P.psi), fz=Math.sin(P.psi); let px,py,pz,lx,ly,lz,fov;
  if(m===1){
    const vang=P.v>6?Math.atan2(P.vz,P.vx):P.psi, a=P.psi+wrapA(vang-P.psi)*.3, ax=Math.cos(a), az=Math.sin(a), d=6.6+Math.min(P.v,90)*.012, h=Math.tan(30*Math.PI/180)*d;
    const tx=P.x-ax*d, tz=P.z-az*d, ty=P.y+1.0+h; if(!RS.camP2) RS.camP2={x:tx,y:ty,z:tz}; const k=1-Math.exp(-dt*9), c=RS.camP2;
    c.x+=(tx-c.x)*k; c.y+=(ty-c.y)*k; c.z+=(tz-c.z)*k; px=c.x;py=c.y;pz=c.z; lx=P.x+ax*9; ly=P.y+.9; lz=P.z+az*9; fov=68+Math.min(P.v,95)*.1;
    ptWheel(false);
  }else{
    const H=RS.pc.H||1.4; px=P.x+fx*.15; py=P.y+Math.max(.95,H*.72); pz=P.z+fz*.15; lx=P.x+fx*30; ly=py-.25; lz=P.z+fz*30; fov=78+Math.min(P.v,95)*.12+(P.nitroT>0?10:0);
    ptWheel(true,RC.inp.st||0);
  }
  cam.position.set(px,py,pz); cam.lookAt(lx,ly,lz);
  if(Math.abs(cam.fov-fov)>.05){ cam.fov=fov; cam.updateProjectionMatrix(); }
  try{ RS.sky.position.copy(cam.position); }catch(_){}
};
const _leave26=leaveRace; leaveRace=function(){ try{ ptWheel(false); if(RS&&RS.pc) RS.pc.g.visible=true; }catch(_){} return _leave26.apply(this,arguments); };

/* ---- mêmes 3 vues pour les courses classiques (parcours sur rail) ---- */
const _vRace27=vRace;
vRace=function(){ return _vRace27.apply(this,arguments).replace('<button class="btn danger sm" id="bQuit"',`<button class="btn alt sm" id="bCam" data-a="ptcam">${ptCamTx()}</button><button class="btn danger sm" id="bQuit"`); };
const _drawRace27=drawRace;
drawRace=function(dt,time){
  _drawRace27.apply(this,arguments);
  if(!RS||!RC||!RC.P||!RS.path||RC.kind!=='race') return;
  const m=ptCamI(); try{ RS.pc.g.visible=(m!==2); }catch(_){}
  if(m===0){ ptWheel(false); return; }
  if(typeof orbitOn==='function'&&orbitOn()) return;
  const P=RC.P, Pa=RS.path, tk=RC.tk, cam=RS.cam, s=clamp(P.x,-Pa.PRE+4,tk.L+Pa.POST-6), p=pathAt(Pa,s,P.lane), fx=Math.cos(p.th), fz=Math.sin(p.th);
  let px,py,pz,lx,ly,lz,fov;
  if(m===1){ const d=6.6+Math.min(P.v,90)*.012, h=Math.tan(30*Math.PI/180)*d, tx=p.x-fx*d, tz=p.z-fz*d, ty=1.0+h;
    if(!RS.camP2) RS.camP2={x:tx,y:ty,z:tz}; const k=1-Math.exp(-dt*9), c=RS.camP2; c.x+=(tx-c.x)*k; c.y+=(ty-c.y)*k; c.z+=(tz-c.z)*k;
    px=c.x;py=c.y;pz=c.z; lx=p.x+fx*9; ly=.9; lz=p.z+fz*9; fov=68+Math.min(P.v,95)*.1; ptWheel(false); }
  else{ const H=RS.pc.H||1.4; px=p.x+fx*.15; py=Math.max(.95,H*.72); pz=p.z+fz*.15; lx=p.x+fx*30; ly=py-.25; lz=p.z+fz*30; fov=78+Math.min(P.v,95)*.12+(P.nitroT>0?10:0); ptWheel(true,(RC.inp&&RC.inp.st)||0); }
  cam.position.set(px,py,pz); cam.lookAt(lx,ly,lz);
  if(Math.abs(cam.fov-fov)>.05){ cam.fov=fov; cam.updateProjectionMatrix(); }
  try{ RS.sky.position.copy(cam.position); RS.ground.position.x=Math.round(cam.position.x/30)*30; RS.ground.position.z=Math.round(cam.position.z/30)*30; }catch(_){}
};
