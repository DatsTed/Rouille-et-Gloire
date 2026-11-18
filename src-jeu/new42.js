/* ---- v0.65 : labo — swipe entre plantes, chrono, floraison directe, jardinier progressif, tuto chaleur/police ---- */
/* temps restant réel (minutes) pour la phase en cours */
function slotSp(room,sl){ const md=MED[sl.med]||{sp:1}, f=plantFit(room,sl), g=x=>isFinite(x)?x:1; const r=(.3+.7*g(f.lf))*(.5+.5*g(f.nf))*(.55+.45*g(f.wf))*(.7+.3*g(f.pf))*g(f.cf)*g(md.sp)*(sl.enz>0?1.2:1)*(sl.boost>0?1.1:1); return isFinite(r)?r:1; }
function slotPc(sl){ if(sl.st==='ready') return 100; if(sl.st==='dead') return 0; const sv=SID[sl.sid], need=({germ:1,veg:sv.veg,flo:sv.fl}[sl.st])||1; return Math.round(nz((sl.stAge||0)/need*100,100)); }
function slotLeftMin(room,sl){ if(!sl||sl.st==='ready'||sl.st==='dead') return 0; const sv=SID[sl.sid], need=({germ:1,veg:sv.veg,flo:sv.fl}[sl.st])||1; return Math.max(0,(need-(sl.stAge||0))/Math.max(.05,slotSp(room,sl))); }
function fmtMS(m){ const s=Math.max(0,Math.round(m*60)); return Math.floor(s/60)+' min '+String(s%60).padStart(2,'0')+' s'; }
function canFlower(sl){ return sl&&sl.st==='veg'&&slotPc(sl)>=50; }
/* floraison directe depuis le labo 3D */
const _pp42=plotPoi; plotPoi=function(room,pl){ const q=_pp42.apply(this,arguments); if(!q||!q.btns) return q; const F=farm(), sl=F.rooms[room].slots[pl.i]; const ob=q.btns, ot=q.title;
  q.btns=function(){ const b=ob.apply(this,arguments); if(sl&&canFlower(sl)) b.unshift({id:'flower',tx:'🌸 Floraison'}); return b; };
  q.title=function(){ let t=ot.apply(this,arguments); if(sl&&sl.st!=='ready'&&sl.st!=='dead'){ try{ t+=' · ⏱ '+fmtMS(slotLeftMin(room,sl)); }catch(e){} } return t; }; return q; };
const _gg42=ACT.growgo; ACT.growgo=function(d){ if(d&&d.id&&d.id.startsWith('plot')&&d.v==='flower'){ return flowerSlot(HUB.map,+d.id.slice(4)); } return _gg42.apply(this,arguments); };
function flowerSlot(room,i){ const sl=farm().rooms[room].slots[i]; if(!canFlower(sl)) return false; sl.st='flo'; sl.stAge=0; sl.cyc=12; sl.nf=0; save(); toast('🌸 '+SID[sl.sid].nom+' passe en floraison'); try{ if(sheet&&sheet.t==='ranch') renderSheet(); }catch(e){} return true; }
ACT.floall=function(){ const room=RY.tab, R=farm().rooms[room]; if(!R) return; let n=0; R.slots.forEach((sl,i)=>{ if(canFlower(sl)&&flowerSlot(room,i)) n++; }); if(!n) toast('Aucune plante prête pour la floraison'); };
const _rf42=ACT.rflower; ACT.rflower=function(d){ const r=_rf42.apply(this,arguments); toast('🌸 Floraison lancée'); return r; };
/* notification : plante prête pour la floraison / à récolter */
setInterval(()=>{ try{ const F=S&&S.farm; if(!F||!F.found||document.body.classList.contains('racing')) return; ranchSim(); let fl=0, rd=0;
  for(const room in ROOMS){ const R=F.rooms[room]; if(!R||!R.on) continue; R.slots.forEach(sl=>{ if(!sl) return; if(canFlower(sl)&&!sl.nf){ sl.nf=1; fl++; } if(sl.st==='ready'&&!sl.nr){ sl.nr=1; rd++; } }); }
  if(fl) toast('🌸 '+(fl>1?fl+' plantes sont prêtes':'Une plante est prête')+' pour la floraison ! Ouvre le labo.');
  if(rd) toast('✂️ '+(rd>1?rd+' plantes sont prêtes':'Une plante est prête')+' à récolter !'); }catch(e){} },6000);
/* swipe entre fiches de plantes */
(function(){ let st=null; const sh=()=>document.getElementById('sheet');
  document.addEventListener('touchstart',e=>{ st=null; if(!sheet||sheet.t!=='ranch'||RY.slot==null) return; const el=sh(); if(!el||!el.contains(e.target)||e.target.closest('input,select,textarea,.rtabs,.chips,.rchips')) return; const t=e.touches[0]; st={x:t.clientX,y:t.clientY,t:Date.now()}; },{passive:true});
  document.addEventListener('touchend',e=>{ if(!st) return; const t=e.changedTouches[0], dx=t.clientX-st.x, dy=t.clientY-st.y, s0=st; st=null; if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5||Date.now()-s0.t>900) return; swipePlant(dx<0?1:-1); },{passive:true});
  window.swipePlant=function(dir){ const el=sh(); if(!el||!sheet||sheet.t!=='ranch'||RY.slot==null) return; S.swd=1; const R=farm().rooms[RY.tab]; if(!R) return; const idx=[]; R.slots.forEach((s,i)=>{ if(s) idx.push(i); }); if(idx.length<2) return; const p=idx.indexOf(RY.slot); const nx=idx[(p<0?0:(p+dir+idx.length)%idx.length)];
    el.style.transition='transform .14s ease-in,opacity .14s'; el.style.transform='translateX('+(-dir*60)+'px)'; el.style.opacity='0';
    setTimeout(()=>{ RY.slot=nx; RY.pick=null; renderSheet(); const e2=sh(); if(!e2) return; e2.scrollTop=0; e2.style.transition='none'; e2.style.transform='translateX('+(dir*60)+'px)'; e2.style.opacity='0'; void e2.offsetWidth; e2.style.transition='transform .2s ease-out,opacity .2s'; e2.style.transform=''; e2.style.opacity=''; setTimeout(()=>{ e2.style.transition=''; },240); },140); }; })();
/* décor : chrono, boutons floraison, classe arrondie */
function decor42(){ try{ const el=document.getElementById('sheet'); if(!el) return; const on=sheet&&sheet.t==='ranch'; el.classList.toggle('lab',!!on); if(!on) return; const room=RY.tab, R=farm().rooms[room]; if(!R) return;
  if(RY.slot!=null){ const sl=R.slots[RY.slot]; if(!sl) return;
    const rb=[...el.querySelectorAll('.rcard .rb span')].find(s=>s.textContent==='Avancement');
    if(rb&&sl.st!=='ready'&&sl.st!=='dead'){ let t=rb.parentNode.querySelector('.tmr'); if(!t){ t=document.createElement('em'); t.className='tmr'; rb.parentNode.appendChild(t); } t.textContent='⏱ '+fmtMS(slotLeftMin(room,sl)); }
    const hero=el.querySelector('.rhero2'); if(hero&&canFlower(sl)&&!el.querySelector('#flBtn')) hero.insertAdjacentHTML('afterend','<button class="btn wide good" id="flBtn" data-a="rflower" data-id="'+RY.slot+'">🌸 Passer en floraison</button>');
    if(hero&&!S.swd&&!el.querySelector('.plnav')){ const idx=R.slots.filter(Boolean).length; if(idx>1) hero.insertAdjacentHTML('beforebegin','<p class="plnav">↔ Glisse à gauche ou à droite pour passer à une autre plante</p>'); }
  } else { el.querySelectorAll('.rslot[data-a="rslot"]').forEach(b=>{ const sl=R.slots[+b.dataset.id]; if(!sl||sl.st==='ready'||sl.st==='dead') return; let t=b.querySelector('.tmr'); if(!t){ t=document.createElement('small'); t.className='tmr'; b.querySelector('small').after(t); } t.textContent='⏱ '+fmtMS(slotLeftMin(room,sl)); if(canFlower(sl)&&!b.querySelector('.rfl')) b.insertAdjacentHTML('beforeend','<span class="rfl">🌸 prête pour la floraison</span>'); });
    const n=R.slots.filter(canFlower).length, g=el.querySelector('#flAll'); if(n&&!g){ const grid=el.querySelector('.rgrid'); if(grid) grid.insertAdjacentHTML('beforebegin','<button class="btn wide good" id="flAll" data-a="floall">🌸 Floraison : '+n+' plante'+(n>1?'s':'')+' prête'+(n>1?'s':'')+'</button>'); } else if(g&&!n) g.remove(); }
 }catch(e){} }
setInterval(decor42,1000);
const _rsh42=renderSheet; renderSheet=function(){ const r=_rsh42.apply(this,arguments); decor42(); return r; };
/* jardinier progressif : peu au début, plus avec le niveau du labo et sa compétence */
empGard=function(eff,d){ const F=S.farm; if(!F||!F.found) return 0; ranchSim(); const L=Math.min(1,.3+.08*(typeof labL==='function'?labL():1)); F.gacc=F.gacc||{w:0,h:0,c:0};
  F.gacc.w+=.5*eff*d*L; F.gacc.h+=.25*eff*d*L; F.gacc.c+=.3*eff*d*L; let did=0; const t0=toast; toast=()=>{}; try{
    for(const room in ROOMS){ const R=F.rooms[room]; if(!R||!R.on) continue; const order=R.slots.map((sl,i)=>[sl,i]).filter(x=>x[0]).sort((a,b)=>a[0].w-b[0].w);
      for(const [sl,i] of order){
        if(sl.pest&&F.gacc.c>=1){ const k=sl.pest==='mold'?'FONG':'INSEC'; if((F.chem[k]||0)>0){ F.chem[k]--; sl.pest=null; F.gacc.c--; did++; } }
        if((sl.st==='germ'||sl.st==='veg'||sl.st==='flo')&&sl.w<35&&F.gacc.w>=1&&F.water>=3){ sl.w=Math.min(85,sl.w+30); F.water-=3; F.gacc.w--; did++; }
        if(sl.st==='ready'&&F.gacc.h>=1){ const keep=RY.tab; RY.tab=room; _rh0({id:String(i)}); RY.tab=keep; F.gacc.h--; did++; } } }
  }finally{ toast=t0; } for(const k in F.gacc) F.gacc[k]=Math.min(F.gacc[k],3); return did; };
/* tuto : chaleur et police, expliqué clairement */
(function(){ const i=GT.findIndex(g=>g.t&&g.t.indexOf('Chaleur, police')>=0); const A={ic:'🌡️',t:'La chaleur 🚨, c’est quoi ?',x:'La <b>chaleur</b> mesure l’<b>attention de la police</b> sur chaque pièce (Atelier, Ranch). Elle <b>monte toute seule</b> quand tu as des plantes : un peu en <b>croissance</b>, beaucoup en <b>floraison</b>, et <b>le plus</b> quand une plante est <b>prête mais pas récoltée</b>. Les lampes puissantes en ajoutent aussi. Plus tu as de plantes, plus elle monte. Tu la vois en haut à droite et dans « Mon labo ».'};
  const B={ic:'🚓',t:'Police, descente et karma',x:'<b>Sous 60 %</b> : aucun risque. <b>Au-dessus de 60 %</b> : une <b>descente de police</b> peut tomber à tout moment, de plus en plus probable jusqu’à 100 %. Elle <b>saisit la plupart de tes plantes en floraison</b>, <b>40 % du stock</b> et une <b>amende de 12 %</b> de tes crédits. <br><br><b>Comment la baisser</b> : récolte vite, installe des <b>filtres à charbon</b> (jusqu’à 3 par pièce), engage un <b>gardien</b> ou un <b>avocat</b>, garde un <b>karma positif</b>. Le <b>karma</b> monte avec les courses légales et les dons, descend avec les ventes de rue et les deals.'};
  if(i>=0) GT.splice(i,1,A,B); else GT.push(A,B); })();
