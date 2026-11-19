/* ===== v2.9 : sons et petites musiques du flipper, moteur de la Région Néon ===== */

/* ---------- 1. flipper : effets sonores (même console que la musique : PM) ---------- */
PM._last={};
PM.sfx=function(k,a){ if(!PM.on||PM.muted||!PM.ctx||!PM.master) return;
  const c=PM.ctx, t=c.currentTime+.004, now=performance.now(), gap={bump:30,spin:70,lane:40,tgt:30,sling:40,flip:25,flipdn:25,charge:75,drop:40}[k]||0;
  if(gap){ if(now-(PM._last[k]||0)<gap) return; PM._last[k]=now; }
  const tone=(f0,f1,d,v,type,at)=>{ const T0=t+(at||0), o=c.createOscillator(), g=c.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f0,T0); if(f1) o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),T0+d); g.gain.setValueAtTime(v,T0); g.gain.exponentialRampToValueAtTime(.0005,T0+d); o.connect(g); g.connect(PM.master); o.start(T0); o.stop(T0+d+.03); };
  const note=(m,at,d,v,type,cut)=>PM.lead(t+(at||0),m,d||.2,v||.1,type||'triangle',cut||5000);
  switch(k){
    case 'flip': tone(140,55,.09,.3,'square'); PM.noise(t,.05,.2,'bandpass',950,1.2); break;
    case 'flipdn': tone(95,50,.07,.15,'square'); PM.noise(t,.04,.1,'bandpass',700,1); break;
    case 'charge': tone(80+(a||0)*260,90+(a||0)*300,.09,.07,'sawtooth'); break;
    case 'launch': PM.noise(t,.38,.24,'bandpass',500+(a||0)*2600,.9); tone(200,55,.22,.3,'sawtooth'); tone(300+(a||0)*500,900+(a||0)*900,.3,.1,'triangle'); break;
    case 'bump': { const b=[523,659,784,880,988][((a|0)+5)%5]; tone(b,b*1.5,.1,.15,'square'); tone(b/2,b/3,.13,.2,'triangle'); PM.noise(t,.04,.1,'highpass',3200); } break;
    case 'sling': tone(210,430,.08,.2,'sawtooth'); PM.noise(t,.05,.13,'bandpass',1600,1); break;
    case 'drop': tone(320,140,.1,.2,'square'); PM.noise(t,.06,.12,'lowpass',900); break;
    case 'ramp': tone(220,1300,.45,.1,'sawtooth'); PM.noise(t,.45,.1,'bandpass',1800,.7); break;
    case 'rampend': [0,4,7,12,16].slice(0,Math.min(5,1+(a|0))).forEach((n,i)=>note(72+n,i*.06,.2,.1,'triangle')); break;
    case 'tgt': tone(1400,1100,.1,.15,'triangle'); tone(2100,1800,.06,.06,'sine'); break;
    case 'lane': tone(1100,1350,.06,.1,'sine'); break;
    case 'kick': tone(170,48,.22,.32,'sine'); PM.noise(t,.07,.18,'lowpass',700); break;
    case 'eject': tone(280,950,.26,.17,'triangle'); PM.noise(t,.2,.1,'highpass',3500); break;
    case 'spin': tone(2300,1800,.03,.07,'square'); break;
    case 'boost': tone(320,1900,.22,.14,'sawtooth'); PM.noise(t,.2,.09,'highpass',4500); break;
    case 'portal': tone(950,200,.28,.14,'sine'); tone(200,950,.28,.1,'sine',.12); break;
    case 'warp': tone(520,55,.75,.17,'sawtooth'); PM.riser(t,.7,.1); break;
    case 'table': [0,5,9,12,17].forEach((n,i)=>note(60+n+((a|0)%4)*2,i*.07,.25,.11,'square',3600)); break;
    case 'save': note(76,0,.18,.13); note(83,.1,.3,.13); break;
    case 'multi': [0,4,7,12,16,19,24].forEach((n,i)=>note(64+n,i*.06,.26,.1,'sawtooth',4200)); PM.noise(t+.35,.5,.1,'highpass',5000); break;
    case 'turbo': PM.riser(t,.55,.12); [0,7,12].forEach((n,i)=>note(55+n,.4+i*.05,.5,.1,'sawtooth',3000)); break;
    case 'jackpot': [0,4,7,12,16,19,24,28].forEach((n,i)=>note(72+n,i*.055,.3,.1,'triangle',6000)); break;
    case 'tilt': tone(110,70,.5,.2,'sawtooth'); tone(115,75,.5,.15,'square'); break;
    case 'nudge': tone(80,45,.14,.2,'sine'); PM.noise(t,.08,.14,'lowpass',500); break;
    case 'chasse': tone(880,660,.12,.1,'square'); tone(880,660,.12,.1,'square',.2); tone(1320,990,.16,.1,'triangle',.4); break;
    case 'parthit': tone(500+(3-(a|0))*90,300,.12,.14,'square'); PM.noise(t,.07,.1,'bandpass',1500,1); break;
    case 'ready': [0,7,12,16,19].forEach((n,i)=>note(60+n,i*.09,.3,.09,'square',3200)); PM.hat(t+.45,.15,true); break;
  } };
/* roulement de la bille : un souffle grave qui suit sa vitesse */
PM.rollSet=function(sp){ if(!PM.on||!PM.ctx||!PM.master||!PM.nbuf) return; const c=PM.ctx;
  if(!PM._roll){ const s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); s.buffer=PM.nbuf; s.loop=true; f.type='bandpass'; f.Q.value=.7; f.frequency.value=300; g.gain.value=0; s.connect(f); f.connect(g); g.connect(PM.master); s.start(); PM._roll={s,f,g}; }
  const R=PM._roll, k=Math.min(1,sp/900); R.g.gain.setTargetAtTime(PM.muted?0:.018+.1*k*k,c.currentTime,.06); R.f.frequency.setTargetAtTime(240+sp*.9,c.currentTime,.06); };
{ const _e=PM.end; PM.end=function(q){ if(PM._roll){ try{ PM._roll.g.gain.setTargetAtTime(0,PM.ctx.currentTime,.03); PM._roll.s.stop(PM.ctx.currentTime+.2); }catch(_){} PM._roll=null; } return _e.apply(this,arguments); }; }

/* ---------- 2. Région Néon : le moteur de ta voiture ---------- */
let WENG=null;
function wEngStop(){ if(WENG){ try{ engStop(WENG.eng); }catch(_){} WENG=null; } }
function wEngTick(dt){ try{ if(!W.on||!AU||!AU.ok){ return wEngStop(); }
    if(!WENG){ const c=car(W.uid), m=c&&M[c.mid]; if(!m) return; WENG={eng:mkEng(engType(m),AU.b.eng),acc:0,id:W.uid}; }
    if(WENG.id!==W.uid){ wEngStop(); return; }
    WENG.acc+=dt; if(WENG.acc<.04) return; const d=WENG.acc; WENG.acc=0; const P=W.p, k=W.key||{}, gas=Math.max(W.in.gas||0,(k.ArrowUp||k.z||k.w)?1:0), busy=!!(sheet||CBV||W.fight||W.big), vTop=Math.max(30,W.vmax*(W.nitT>0?1.4:1));
    engUpdate(WENG.eng,{v:Math.abs(P.v),vTop,thr:busy?0:clamp(gas,0,1),vol:busy?.12:.62,pan:0,nit:W.nitT>0},d); }catch(e){ wEngStop(); } }
{ const _t=wTick; wTick=function(dt){ const r=_t.apply(this,arguments); wEngTick(Math.min(dt,.05)); return r; }; }
{ const _q=ACT.wquit; ACT.wquit=function(){ wEngStop(); return _q.apply(this,arguments); }; }
document.addEventListener('visibilitychange',()=>{ if(document.hidden) wEngStop(); });