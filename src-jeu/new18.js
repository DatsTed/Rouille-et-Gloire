/* ===== v0.31 : Mon labo (accès rapide), alertes, album de variétés, croisements, taille, butin de course ===== */
const HY_R=[['Commun','#9aa4c8',1,.70],['Rare','#3cc46a',1.1,.22],['Épique','#a85de8',1.2,.06],['Légendaire','#ffd400',1.35,.02]];
function regHyb(){ const F=S.farm; if(!F||!F.hyb) return; F.hyb.forEach(h=>{ if(!SID[h.id]){ STR.push(h); SID[h.id]=h; if(h.pu) PURP[h.id]=1; } }); }
const _farm0=farm;
farm=function(){ const F=_farm0(); if(F.hyb&&F.hyb.some(h=>!SID[h.id])) regHyb(); F.alb2=F.alb2||{}; return F; };
function hyName(a0,b0){ const sw=Math.random()<.5, a=sw?b0:a0, b=sw?a0:b0; const x=a.nom.split(' ')[0], y=b.nom.split(' ').pop(); let n=x.slice(0,Math.ceil(x.length/2))+y.slice(Math.floor(y.length/2)); n=n.charAt(0).toUpperCase()+n.slice(1).toLowerCase(); const F=farm(); let k=2, nn=n; while(STR.some(s=>s.nom===nn)) nn=n+' #'+(k++); return nn; }
function crossMake(a,b){
  const F=farm(), L=1+.1*pk('luck'); let r=Math.random(), ri=0, acc=0; const w=HY_R.map((x,i)=>i?x[3]*L:x[3]); const tot=w.reduce((s,v)=>s+v,0); r*=tot; for(let i=0;i<4;i++){ r-=w[i]; if(r<0){ ri=i; break; } }
  const m=HY_R[ri][2], av=k=>(a[k]+b[k])/2, jit=()=>rnd(.92,1.1);
  const h={id:'x'+(F.hybN=(F.hybN||0)+1),nom:hyName(a,b),ty:a.ty===b.ty?a.ty:'Hybride',thc:Math.round(av('thc')*m*jit()*10)/10,veg:Math.round(av('veg')*rnd(.9,1.04)*10)/10,fl:Math.round(av('fl')*rnd(.9,1.04)*10)/10,y:Math.round(av('y')*m*jit()),px:Math.round(av('px')*(1+(m-1)*.8)*jit()*10)/10,lm:Math.round(av('lm')/1000)*1000,eau:Math.round(av('eau')*10)/10,d:Math.max(a.d,b.d),rep:0,sd:Math.round(av('sd')*1.4),ic:'🧬',hy:1,rar:ri,pa:[a.id,b.id],pu:!!(PURP[a.id]||PURP[b.id])};
  return h;
}
const CR={a:null,b:null};
function labSheet(X){
  if(!sheet||(sheet.t!=='strains'&&sheet.t!=='cross')) return false;
  const F=farm(), el=$('sheet');
  if(sheet.t==='strains'){
    const row=s=>{ const own=F.seeds[s.id]||0, hv=(F.alb2[s.id]||0), known=own||hv||s.hy; const rc=s.hy?HY_R[s.rar][1]:'#2b2f60';
      return `<div class="inv-r" style="border-color:${rc}"><span class="inv-i">${known?s.ic:'❔'}</span><div class="inv-t"><b>${known?s.nom:'Variété inconnue'}${s.hy?` <i class="hyt" style="color:${rc}">${HY_R[s.rar][0]}</i>`:''}</b><small>${known?`${s.ty} · ${s.thc} % THC · ~${s.y} g · ${s.veg+s.fl} min${s.pa?' · '+SID[s.pa[0]].nom.split(' ')[0]+' × '+SID[s.pa[1]].nom.split(' ')[0]:''}`:'Plante-la ou croise-la pour la découvrir'}</small></div><span class="inv-q">${own?'×'+own:hv?'✓':''}</span></div>`; };
    const hy=(F.hyb||[]).slice().reverse();
    el.innerHTML=`<div class="inv">${X}<h2>📖 Album des variétés</h2><p class="note">${STR.filter(s=>!s.hy&&((F.seeds[s.id]||0)||F.alb2[s.id])).length} / ${STR.filter(s=>!s.hy).length} variétés de base · ${hy.length} hybride(s) créés</p>
     <button class="btn wide" data-a="crossopen">🧬 Croiser deux variétés</button>
     ${hy.length?`<div class="inv-s"><h3>🧬 Tes hybrides</h3>${hy.map(row).join('')}</div>`:''}
     <div class="inv-s"><h3>🌱 Variétés de base</h3>${STR.filter(s=>!s.hy).map(row).join('')}</div></div>`; return true; }
  const parents=STR.filter(s=>(F.seeds[s.id]||0)>0), A=SID[CR.a], B=SID[CR.b], cost=600;
  const chips=(k)=>parents.map(s=>`<button class="${CR[k]===s.id?'on':''}" data-a="crpick" data-id="${k}" data-v="${s.id}">${s.ic} ${s.nom} ×${F.seeds[s.id]}</button>`).join('');
  const need=(CR.a&&CR.a===CR.b)?2:1, okS=A&&B&&(F.seeds[CR.a]||0)>=need&&(F.seeds[CR.b]||0)>=need;
  el.innerHTML=`<div class="inv">${X}<h2>🧬 Croisement</h2><p class="note">Choisis deux variétés dont tu as la graine. Le croisement consomme <b>1 graine de chaque</b> + ${cost} cr et donne <b>2 graines</b> d’un hybride inédit… dont la rareté est aléatoire (jusqu’à Légendaire !).</p>
   ${parents.length?`<p class="sm">Parent A</p><div class="rchips">${chips('a')}</div><p class="sm">Parent B</p><div class="rchips">${chips('b')}</div>`:'<p class="note">Tu n’as aucune graine. Achètes-en à la boutique du labo.</p>'}
   ${A&&B?`<div class="inv-r"><span class="inv-i">🧬</span><div class="inv-t"><b>${A.nom.split(' ')[0]} × ${B.nom.split(' ')[0]}</b><small>THC ≈ ${((A.thc+B.thc)/2).toFixed(0)} % · rendement ≈ ${Math.round((A.y+B.y)/2)} g · ${HY_R.map(r=>r[0]).join(' / ')}</small></div></div>`:''}
   <button class="btn wide" data-a="crossgo" ${okS&&S.cr>=cost?'':'disabled'}>Croiser · ${cost} cr</button>${okS||!A||!B?'':'<p class="note">Pas assez de graines pour ce couple.</p>'}
   <button class="btn alt wide" style="margin-top:8px" data-a="strainopen">← Album</button></div>`; return true;
}
Object.assign(ACT,{
  strainopen(){ openSheet({t:'strains'}); }, crossopen(){ openSheet({t:'cross'}); },
  crpick(d){ CR[d.id]=d.v; renderSheet(); },
  crossgo(){ const F=farm(), a=SID[CR.a], b=SID[CR.b]; if(!a||!b||S.cr<600) return; const need=CR.a===CR.b?2:1; if((F.seeds[CR.a]||0)<need||(F.seeds[CR.b]||0)<need) return; if((F.hyb||[]).length>=40) return toast('Album plein (40 hybrides)');
    S.cr-=600; F.seeds[CR.a]-=1; F.seeds[CR.b]-=1; const h=crossMake(a,b); (F.hyb=F.hyb||[]).push(h); regHyb(); F.seeds[h.id]=2; F.alb2[h.id]=F.alb2[h.id]||0; save(); sheet.t='cross'; CR.a=CR.b=null;
    const rc=HY_R[h.rar]; auTry(()=>auCard(Math.min(6,2+h.rar*1.5|0),h.rar>=2,false));
    $('sheet').innerHTML=`<div class="inv"><button class="x" data-a="close">×</button><div class="carwin"><div class="cw-t" style="color:${rc[1]};-webkit-text-fill-color:${rc[1]}">${rc[0].toUpperCase()}</div><h2>Nouvel hybride !</h2><div class="cw-car" style="font-size:64px">🧬</div><div class="cw-n">${h.nom}</div><p class="note">${h.ty} · ${h.thc} % THC · ~${h.y} g · ${h.veg+h.fl} min de culture · ${h.px} cr/g<br>2 graines ajoutées à ton sac.</p><button class="btn wide" data-a="strainopen">📖 Voir l’album</button></div></div>`; },
  labopen(){ ACT.ranchSheet(); },
  waterall(){ ranchSim(); const F=farm(); let n=0,stop=false; for(const room in F.rooms){ if(!F.rooms[room].on) continue; F.rooms[room].slots.forEach(sl=>{ if(stop||!sl||sl.st==='ready'||sl.st==='dead'||sl.w>=75) return; if((F.can||0)>0) F.can--; else if(F.water>=3) F.water-=3; else { stop=true; return; } sl.w=Math.min(100,sl.w+38); n++; }); }
    toast(n?`💧 ${n} plante${n>1?'s':''} arrosée${n>1?'s':''}`+(stop?' · citerne vide':''):stop?'Citerne vide : remplis-la':'Rien à arroser'); save(); if(sheet) renderSheet(); else render(); },
  harvestall(){ ranchSim(); const F=farm(); let n=0; const keep=RY.tab; for(const room in F.rooms){ if(!F.rooms[room].on) continue; F.rooms[room].slots.forEach((sl,i)=>{ if(sl&&sl.st==='ready'){ RY.tab=room; _rh0({id:String(i)}); n++; F.alb2[sl.sid]=(F.alb2[sl.sid]||0)+1; } }); } RY.tab=keep;
    toast(n?`✂️ ${n} récolte${n>1?'s':''} · séchage en cours`:'Rien à récolter'); save(); if(sheet) renderSheet(); else render(); }
});
/* récolte manuelle = mini-jeu de taille */
const _rh0=ACT.rharvest;
ACT.rharvest=function(d){ const F=farm(), sl=F.rooms[RY.tab].slots[+d.id]; if(!sl||sl.st!=='ready') return; const room=RY.tab, sid=sl.sid;
  trimGame(bonus=>{ const s2=farm().rooms[room].slots[+d.id]; if(!s2||s2.st!=='ready') return; s2.q=Math.min(100,s2.q+bonus); RY.tab=room; farm().alb2[sid]=(farm().alb2[sid]||0)+1; _rh0(d); if(bonus>0) setTimeout(()=>toast(`✂️ Taille ${bonus>=10?'parfaite':'réussie'} : qualité +${bonus}`),60); }); };
function trimGame(done){
  const o=document.createElement('div'); o.id='trimov';
  const leaves=[]; for(let i=0;i<11;i++){ const a=i/11*6.283+.3, r=i%2?96:62, x=150+Math.cos(a)*r, y=150+Math.sin(a)*r; leaves.push([x,y,a*57.3+90]); }
  o.innerHTML=`<button class="pkx" aria-label="Passer">×</button><div class="pkov-t">Taille de la récolte</div><div class="tm-st" id="tmst"><div class="tm-bud"></div>${leaves.map((l,i)=>`<div class="tm-l" data-i="${i}" style="left:${l[0]}px;top:${l[1]}px;transform:translate(-50%,-50%) rotate(${l[2]}deg)">${leafIc('#2fbf63',46)}</div>`).join('')}</div>
   <div class="tm-bar"><i id="tmb"></i></div><div class="pkov-h">Passe le doigt sur les <b>feuilles</b> pour les couper — plus tu en coupes, meilleure est la qualité</div><button class="btn" id="tmok">Terminer</button>`;
  document.body.appendChild(o); requestAnimationFrame(()=>o.classList.add('on'));
  const st=o.querySelector('#tmst'), els=[...o.querySelectorAll('.tm-l')], cut=new Set(); let fin=false, act=false;
  const upd=()=>{ o.querySelector('#tmb').style.width=(cut.size/els.length*100)+'%'; if(cut.size===els.length) setTimeout(end,350); };
  const hit=e=>{ const r=st.getBoundingClientRect(), sc=r.width/300, x=(e.clientX-r.left)/sc, y=(e.clientY-r.top)/sc; els.forEach((el,i)=>{ if(cut.has(i)) return; const L=leaves[i]; if(Math.hypot(x-L[0],y-L[1])<34){ cut.add(i); el.classList.add('cut'); try{ navigator.vibrate&&navigator.vibrate(5); }catch(_){} auTry(()=>ui('click')); } }); upd(); };
  st.addEventListener('pointerdown',e=>{ act=true; try{ st.setPointerCapture(e.pointerId); }catch(_){} hit(e); }); st.addEventListener('pointermove',e=>{ if(act) hit(e); }); st.addEventListener('pointerup',()=>act=false);
  const end=skip=>{ if(fin) return; fin=true; const b=skip===true?0:Math.round(cut.size/els.length*14); o.classList.remove('on'); setTimeout(()=>o.remove(),250); done(b); };
  o.querySelector('#tmok').onclick=()=>end(); o.querySelector('.pkx').onclick=()=>end(true);
}
/* carte « Mon labo » dans Garage et Base */
function labStat(){ const F=S.farm; if(!F||!F.found) return null; const o={plants:0,ready:0,thirst:0,sick:0}; for(const room in F.rooms){ const R=F.rooms[room]; if(!R.on) continue; R.slots.forEach(sl=>{ if(!sl) return; o.plants++; if(sl.st==='ready') o.ready++; else if(sl.st!=='dead'){ if(sl.w<35) o.thirst++; if(sl.pest) o.sick++; } }); } o.heat=Math.round(Math.max(F.heat.atelier,F.heat.ranch)); o.dry=(F.dry||[]).length; o.stock=Object.values(F.stock||{}).reduce((t,v)=>t+(v.g||0),0); return o; }
function labCard(){ try{ ranchSim(); }catch(_){} const s=labStat(); if(!s) return ''; const F=farm();
  return `<div class="labcard"><div class="lc-h"><span class="lc-t">${leafIc('#3cff9e',22)} Mon labo</span><span class="lc-s ${s.heat>60?'hot':''}">🚨 ${s.heat} %</span></div>
   <div class="lc-st"><span>🌱 ${s.plants} plante${s.plants>1?'s':''}</span><span class="${s.ready?'ok':''}">✂️ ${s.ready} prête${s.ready>1?'s':''}</span><span class="${s.thirst?'warn':''}">💧 ${s.thirst} soif</span>${s.sick?`<span class="warn">🦠 ${s.sick}</span>`:''}<span>🫙 ${Math.floor(s.stock)} g</span></div>
   <div class="lc-b"><button class="btn" data-a="labopen">Ouvrir</button><button class="btn alt" data-a="waterall">💧 Tout arroser</button><button class="btn alt" data-a="harvestall" ${s.ready?'':'disabled'}>✂️ Tout récolter</button><button class="btn alt" data-a="strainopen">📖 Variétés</button></div></div>`; }
const _vGarage0=vGarage, _vBase0=vBase;
vGarage=function(){ try{ ranchSim(); }catch(_){} return _vGarage0(); }; vBase=function(){ return _vBase0(); };
/* alertes : pastille sur Base + notification quand une plante est prête */
let _labPrev=-1;
function labAlert(){ try{ const s=labStat(); const nav=$('nav'); if(!nav) return; const b=nav.querySelector('button[data-id="base"]'); if(!b) return; let d=b.querySelector('.dot'); const need=s&&(s.ready||s.thirst||s.sick);
  if(need&&!d){ b.insertAdjacentHTML('beforeend','<i class="dot lab"></i>'); } else if(!need&&d&&d.classList.contains('lab')) d.remove(); } catch(_){} }
function labTick(){ try{ const F=S.farm; if(!F||!F.found) return; ranchSim(); const s=labStat(); if(_labPrev>=0&&s.ready>_labPrev&&!document.body.classList.contains('racing')) toast('🌿 Une plante est prête à récolter !'); _labPrev=s.ready; labAlert(); if(!sheet&&(view==='garage'||view==='base')&&!document.getElementById('pkov')&&!document.getElementById('trimov')) { const c=document.querySelector('.labcard'); if(c){ const t=document.createElement('div'); t.innerHTML=labCard(); c.replaceWith(t.firstChild); } } }catch(_){} }
setInterval(labTick,12000);
const _render1=render; render=function(){ _render1.apply(this,arguments); labAlert(); };
/* butin de course : graines et engrais */
const _kp1=karmaPrize;
karmaPrize=function(ev){ try{ const F=S.farm; if(F&&F.found&&ev&&!ev.ill&&Math.random()<.3){ let msg; if(Math.random()<.65){ const k=['N','P','K','CM','PHm','PHp','FONG','INSEC'][rint(0,7)], n=rint(1,3); F.chem[k]=(F.chem[k]||0)+n; msg=`${n} × ${CHEM[k].nom}`; } else { const bs=STR.filter(s=>!s.hy&&s.rep<=F.rep+5); const s=bs[rint(0,Math.min(bs.length-1,5))]; F.seeds[s.id]=(F.seeds[s.id]||0)+1; msg=`1 graine de ${s.nom}`; } setTimeout(()=>toast('🎁 Butin de course : '+msg),1500); } }catch(_){} return _kp1(ev); };
/* objectifs du labo */
const _goal2=goalNext;
goalNext=function(){ const r=_goal2(); if(r) return r; const F=S.farm; if(F&&F.found){ const pl=labStat(); if(pl&&pl.ready) return ['✂️','Une plante est prête à récolter !','base','Mon labo']; if(pl&&!pl.plants&&!(F.stats&&F.stats.harv)) return ['🌱','Plante ta première graine dans ton labo','base','Mon labo']; if(F.stats&&F.stats.harv>=2&&!(F.hyb&&F.hyb.length)) return ['🧬','Croise deux variétés pour créer un hybride unique','base','Mon labo']; } return null; };

GT.splice(GT.length-1,0,{ic:'⚡',t:'Raccourci : Mon labo',x:'Plus besoin de marcher jusqu’à la cloison à chaque fois : la carte <b>🌿 Mon labo</b> en haut de <b>Garage</b> et de <b>Atelier › Base</b> montre tes plantes en direct, avec <b>Tout arroser</b> et <b>Tout récolter</b>. Une pastille verte sur Base t’avertit quand une plante est prête ou a soif. En récoltant à la main, tu fais un petit <b>jeu de taille</b> : plus tu coupes de feuilles, meilleure est la qualité.'},{ic:'🧬',t:'Croiser des variétés',x:'Dans <b>📖 Variétés</b>, croise deux variétés dont tu as la graine pour créer un <b>hybride inédit</b>, de Commun à <b>Légendaire</b>. Tu peux aussi gagner des graines et des engrais en butin après tes courses légales.'});
