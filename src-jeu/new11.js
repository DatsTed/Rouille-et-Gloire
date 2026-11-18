/* ===== v0.18 : boîte de vitesses (drag), drift (circuits + épreuves de drift) ===== */
const GFR=[.28,.46,.64,.82,1], GK=[1.5,1.25,1.05,.92,.82];
function gearK(r,dt){
  if(!r.drag) return 1;
  if(r.shiftT>0) r.shiftT-=dt; if(r.gBoost>0) r.gBoost-=dt;
  const vg=r.VM*GFR[r.gear-1]*(r.nitroT>0?1.12:1), f=r.v/vg; r.rpmF=f;
  if(r.autoG&&r.shiftT<=0&&r.gear<5&&f>=r.shAt){ r.gear++; r.shiftT=.16; return 0; }
  const pw=f<.3?.6+f*1.3:f<.88?1:f<1?1-(f-.88)*3:.25;
  return r.shiftT>0?0:GK[r.gear-1]*pw*(r.gBoost>0?1.18:1);
}
function shiftGear(r,d){
  if(!r||!r.drag||!r.go||r.fin!=null||r.shiftT>0||r.autoG) return;
  const ng=clamp(r.gear+d,1,5); if(ng===r.gear) return; const f=r.rpmF||0;
  if(d>0){ if(f>=.82&&f<=1.02){ r.gBoost=1.3; r.msg2='perfect'; r.gp++; } else if(f>1.02){ r.shiftT=.4; r.msg2='over'; } else if(f<.55) r.msg2='early'; }
  else if(r.v/(r.VM*GFR[ng-1])>1.15){ r.msg2='over'; r.shiftT=.45; }
  r.gear=ng; r.shiftT=Math.max(r.shiftT,.16); try{navigator.vibrate&&navigator.vibrate(18);}catch(_){}
}
function dragMsg(P){
  if(!P.drag) return;
  const m=P.msg2; P.msg2=null;
  if(m==='perfect') flash('Rapport parfait','#3CFF9E',.7); else if(m==='over') flash('Sur-régime','#FF4D6D',.8); else if(m==='early') flash('Trop tôt','#FCEE0A',.6);
  else if(!P.autoG&&P.go&&P.fin==null&&P.gear<5&&P.rpmF>.97&&(!RC.flash||RC.clock>=RC.flash.until)) flash('Rapport sup. !','#FCEE0A',.35);
}
function shiftPad(auto){
  return `<div class="shiftp"><button id="pUp" ${auto?'disabled':''}>▲<small>${auto?'Auto':'Rapport sup.'}</small></button><button id="pDn" ${auto?'disabled':''}>▼<small>${auto?'Auto':'Rétrograder'}</small></button></div>`;
}
function hudGear(){ return (RC&&RC.kind==='race'&&RC.mn.d==='drag')?'<span class="gear" id="hGear">1</span><span class="rpm" id="hRpm"></span>':''; }
function hudGearUpd(P){
  if(!P.drag) return; const g=$('hGear'); if(!g) return;
  const t=String(P.gear), rp=Math.round((900+clamp(P.rpmF,0,1.08)*7600)/50)*50;
  if(g._t!==t){g._t=t; g.textContent=t;} const r=$('hRpm'), rt=fmt(rp)+' tr/min'; if(r&&r._t!==rt){r._t=rt; r.textContent=rt;}
  const hot=!P.autoG&&P.rpmF>.96; g.classList.toggle('hot',hot);
}
function bindShift(){
  const up=$('pUp'), dn=$('pDn'); if(!up||!dn) return;
  up.addEventListener('pointerdown',e=>{e.preventDefault(); shiftGear(RC.P,1); up.classList.add('on');});
  dn.addEventListener('pointerdown',e=>{e.preventDefault(); shiftGear(RC.P,-1); dn.classList.add('on');});
  [up,dn].forEach(b=>{ const off=()=>b.classList.remove('on'); b.addEventListener('pointerup',off); b.addEventListener('pointercancel',off); b.addEventListener('contextmenu',e=>e.preventDefault()); });
}
/* ---- drift ---- */
function driftBank(d,P){
  const g=Math.round(d.chain*d.mult); d.live=false;
  if(g>0){ d.pts+=g; d.best=Math.max(d.best,g); d.n++; if(g>=150) flash('Drift +'+fmt(g),'#FF2BD6',1.1); }
  if(d.t>=1.5&&RC.mn.d!=='drift'&&P.boostT<1){ P.boostT=1.0; flash('Drift boost','#00E5FF',.9); }
  d.chain=0; d.t=0; d.mult=1; d.grace=0;
}
function driftTick(P,h){
  const d=P.dr; if(!d||!P.go||P.fin!=null) return;
  const sl=Math.abs(P.slipAng||0), on=P.surf>=6&&P.v>10&&sl>.17&&sl<1.3;
  if(P.hitFlash>.6&&d.live){ d.chain*=.25; driftBank(d,P); return; }
  if(on){ d.live=true; d.t+=h; d.grace=.55; d.chain+=P.v*sl*h*6; d.mult=1+Math.min(5,Math.floor(d.t/1.4)); }
  else if(d.live){ d.grace-=h; if(d.grace<=0) driftBank(d,P); }
}
function hudDrift(P){
  const d=P.dr, el=$('hDrift'); if(!d||!el) return;
  const mode=RC.mn.d==='drift', live=d.live?Math.round(d.chain*d.mult):0;
  let txt=''; if(d.live) txt=`DRIFT ×${d.mult}  +${fmt(live)}`; else if(mode) txt='Drift : glisse dans les virages';
  if(el._t!==txt){el._t=txt; el.textContent=txt; el.classList.toggle('on',d.live);}
  if(mode){ sT('hPos',fmt(d.pts+live)+' pts'); sT('hGap',RC.dlim?`Reste ${Math.max(0,Math.ceil(RC.dlim-RC.clock))} s`:''); }
}
function driftRow(P,c){
  const mn=RC.mn, d=P.dr; if(d.live) driftBank(d,P);
  const pts=Math.round(RC.auto?indice(c,mn)*110*rnd(.94,1.06):d.pts*({RWD:1.15,AWD:1,FWD:.85}[P.r.m.tr]||1));
  const ot=RC.Os.map(o=>({nom:o.pil+' ('+o.r.nom+')',t:-Math.round(indice(o.r.c,mn)*110*rnd(.85,1.15))}));
  const row=mkRow(mn,c,-pts,ot,{jury:true,an:P.r.nom,hits:P.hits,xpB:P.r.xB||0}); row.a=pts; row.b=-row.b; return row;
}
