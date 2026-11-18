/* ===== v0.21 : High & Rouillé — karma, visuels cannabis, menus du réseau refaits ===== */
const karma=()=>{ const F=farm(); return F.karma||0; };
function karmaAdd(n){ const F=farm(); F.karma=clamp((F.karma||0)+n,-100,100); }
function karmaPrize(ev){ const k=karma(); return ev&&ev.ill?1:1+Math.max(0,k)/100*.15; }
const KT=[[80,'Saint du bitume','😇'],[40,'Bon samaritain','😊'],[15,'Citoyen modèle','🙂'],[-15,'Entre deux eaux','😐'],[-40,'Fripon','😏'],[-80,'Truand','😈'],[-101,'Parrain','👹']];
const karmaTitle=()=>{ const k=karma(); return KT.find(t=>k>=t[0])||KT[KT.length-1]; };
/* ---- dessins : feuille de cannabis, graine, terreau, plante par stade ---- */
(function(){
  const leaflet=(len,wd,teeth)=>{ const n=teeth*2, R=[], L=[]; for(let i=1;i<=n;i++){ const t=i/n, y=-len*t, w=(wd/2)*Math.sin(Math.PI*Math.pow(t,.72))*(i%2?.62:1); R.push([w,y]); L.unshift([-w,y]); }
    return 'M0 0 '+R.map(p=>'L'+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')+' L0 '+(-len-3)+' '+L.map(p=>'L'+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')+' Z'; };
  const defs=[[0,64,13,9],[28,52,11,8],[-28,52,11,8],[58,40,9,7],[-58,40,9,7],[88,26,7,5],[-88,26,7,5]];
  const lf=defs.map(d=>`<path transform="translate(50 90) rotate(${d[0]})" d="${leaflet(d[1],d[2],d[3])}"/>`).join('')+'<path d="M50 100 L50 88" stroke="currentColor" stroke-width="3" fill="none"/>'+defs.slice(0,5).map(d=>`<path transform="translate(50 90) rotate(${d[0]})" d="M0 -4 L0 ${-d[1]*.8}" stroke="rgba(0,0,0,.28)" stroke-width="1.2" fill="none"/>`).join('');
  const h=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="lf" viewBox="0 0 100 100" fill="currentColor">${lf}</symbol>
   <radialGradient id="gl"><stop offset="0" stop-color="#ffd36a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd36a" stop-opacity="0"/></radialGradient>
   <linearGradient id="sd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9b27a"/><stop offset="1" stop-color="#7a5230"/></linearGradient></defs></svg>`;
  window.addEventListener('DOMContentLoaded',()=>document.body.insertAdjacentHTML('afterbegin',h)); if(document.body) document.body.insertAdjacentHTML('afterbegin',h);
})();
const leafIc=(col,s)=>`<svg class="lfic" width="${s||18}" height="${s||18}" viewBox="0 0 100 100" style="color:${col||'#3cff9e'}"><use href="#lf"/></svg>`;
const seedIc=(s)=>`<svg class="sdic" width="${s||26}" height="${s||26}" viewBox="0 0 40 40"><ellipse cx="20" cy="21" rx="14" ry="10" transform="rotate(-28 20 21)" fill="url(#sd)" stroke="#4a2f1d" stroke-width="1.2"/><path d="M9 25 Q16 14 30 15 M11 28 Q20 20 32 20 M14 30 Q22 25 33 24" stroke="#3a2412" stroke-width="1.6" fill="none" opacity=".75"/><path d="M12 22 Q16 17 21 16" stroke="#fff" opacity=".35" stroke-width="1.4" fill="none"/></svg>`;
function soilIc(k,s){ s=s||34; const b={
  terreau:'<ellipse cx="20" cy="30" rx="17" ry="5" fill="#2c1b10"/><path d="M4 30 Q20 8 36 30Z" fill="#5a3a22"/><circle cx="14" cy="26" r="1.6" fill="#8a6038"/><circle cx="22" cy="22" r="1.4" fill="#2c1b10"/><circle cx="27" cy="27" r="1.8" fill="#8a6038"/><circle cx="18" cy="29" r="1.3" fill="#2c1b10"/>',
  coco:'<ellipse cx="20" cy="30" rx="17" ry="5" fill="#4a2c12"/><path d="M4 30 Q20 10 36 30Z" fill="#9a6a38"/><path d="M10 28 Q16 20 24 24 M16 29 Q24 18 31 27 M8 29 Q12 24 18 26" stroke="#d1a06a" stroke-width="1.2" fill="none"/>',
  hydro:'<rect x="5" y="22" width="30" height="13" rx="3" fill="#1b4f8c"/><rect x="5" y="22" width="30" height="5" fill="#4aa8ff" opacity=".7"/><circle cx="12" cy="20" r="3.2" fill="#c9774a"/><circle cx="19" cy="18" r="3.6" fill="#b4623a"/><circle cx="26" cy="20" r="3.2" fill="#d08a5a"/><circle cx="31" cy="21" r="2.6" fill="#b4623a"/>'}[k];
  return `<svg width="${s}" height="${s}" viewBox="0 0 40 40">${b}</svg>`; }
const PURP={gp:1,ph:1,zk:1};
function plantSVG(st,pc,sid,sick,size){
  const sv=SID[sid]||STR[0], pu=!!PURP[sid], col=pu?'#7a55d6':sv.ty==='Sativa'?'#8be03c':sv.ty==='Indica'?'#1f9d55':'#3cc46a', dark=pu?'#5a3aa8':sv.ty==='Sativa'?'#5aa82a':sv.ty==='Indica'?'#157a42':'#2a9a52', bud=pu?'#c07cff':'#b8f04a', pist='#ff9a1a';
  const L=(x,y,s,r,c)=>`<use href="#lf" x="${x-s/2}" y="${y-s*.9}" width="${s}" height="${s}" transform="rotate(${r} ${x} ${y})" style="color:${c}"/>`;
  const B=(x,y,r,glow)=>{ let o=glow?`<circle cx="${x}" cy="${y}" r="${r*2.3}" fill="url(#gl)"/>`:''; const cs=[[0,0,1],[-.55,.9,.8],[.55,.9,.8],[0,1.7,.7],[0,-.9,.7]];
    cs.forEach((c,i)=>{ o+=`<circle cx="${x+c[0]*r*.8}" cy="${y+c[1]*r*.8}" r="${r*c[2]*.78}" fill="${i%2?bud:pu?'#a85de8':'#9ee03a'}" stroke="${pu?'#7a3fc0':'#5aa82a'}" stroke-width=".6"/>`; });
    for(let i=0;i<7;i++){ const an=i*.9+x, px=x+Math.cos(an)*r*.8, py=y+Math.sin(an*1.3)*r*1.1; o+=`<path d="M${px.toFixed(1)} ${py.toFixed(1)} l${(Math.cos(an)*3).toFixed(1)} ${(Math.sin(an)*3-1).toFixed(1)}" stroke="${pist}" stroke-width="1.3" stroke-linecap="round"/>`; }
    return o; };
  let g=`<ellipse cx="60" cy="108" rx="46" ry="10" fill="#2c1b10"/><path d="M16 108 Q60 76 104 108Z" fill="#4f321e"/><circle cx="40" cy="100" r="1.8" fill="#8a6038"/><circle cx="70" cy="96" r="1.6" fill="#2c1b10"/><circle cx="84" cy="103" r="2" fill="#8a6038"/><circle cx="55" cy="104" r="1.5" fill="#2c1b10"/>`;
  const p=Math.max(0,Math.min(100,pc||0))/100;
  if(st==='germ'){ g+=`<ellipse cx="60" cy="92" rx="9" ry="6" transform="rotate(-20 60 92)" fill="url(#sd)" stroke="#4a2f1d"/>`+(p>.35?`<path d="M60 90 L60 ${86-p*14}" stroke="${col}" stroke-width="2.5"/><ellipse cx="${53-p*2}" cy="${84-p*14}" rx="${4+p*4}" ry="2.6" fill="${col}"/><ellipse cx="${67+p*2}" cy="${84-p*14}" rx="${4+p*4}" ry="2.6" fill="${col}"/>`:''); }
  else if(st==='dead'){ g+=`<path d="M60 96 Q62 70 52 58" stroke="#6b4f2a" stroke-width="3" fill="none"/>`+L(52,60,26,-70,'#7a6032')+L(58,76,24,60,'#6b4f2a')+L(62,84,22,-60,'#5a4424'); }
  else{
    const h=st==='veg'?20+p*50:74, top=96-h; g+=`<path d="M60 98 L60 ${top}" stroke="${dark}" stroke-width="3.4"/>`;
    const sz=st==='veg'?26+p*30:40;
    [.25,.5,.75].forEach((f,i)=>{ const y=96-h*f; g+=L(60,y,sz*(1.1-i*.12),-66-i*8,col)+L(60,y,sz*(1.1-i*.12),66+i*8,dark); });
    g+=L(60,top+2,sz*1.05,0,col);
    if(st==='flo'||st==='ready'){ const r=st==='ready'?6.2:2.6+p*3.6, gl=st==='ready';
      g+=B(60,top-2,r*1.25,gl)+B(47,96-h*.62,r*.8,gl)+B(73,96-h*.62,r*.8,gl)+B(49,96-h*.38,r*.65,gl)+B(72,96-h*.38,r*.65,gl);
      if(gl) g+=[[40,40],[84,52],[62,30],[28,62],[90,78]].map(q=>`<path d="M${q[0]} ${q[1]-4}v8M${q[0]-4} ${q[1]}h8" stroke="#fff" stroke-width="1.4" class="spk"/>`).join(''); }
  }
  if(sick) g+=sick==='mold'?[[48,70],[66,62],[58,84],[72,80]].map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="#e8e8f0" opacity=".85"/>`).join(''):[[50,64],[68,72],[56,82],[64,58]].map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="2.2" fill="#ff3d3d"/>`).join('');
  const sz2=size||110; return `<svg class="plant st-${st}" width="${sz2}" height="${sz2}" viewBox="0 0 120 120">${g}</svg>`;
}
const budIc=(sid,s)=>`<svg width="${s||34}" height="${s||34}" viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" fill="url(#gl)"/><circle cx="20" cy="22" r="8.5" fill="${PURP[sid]?'#c07cff':'#b8f04a'}"/><circle cx="15" cy="17" r="6" fill="${PURP[sid]?'#a85de8':'#8fd32a'}"/><circle cx="25" cy="16" r="5.4" fill="${PURP[sid]?'#b36cf0':'#a0e03a'}"/><path d="M16 14q-3 -4 -5 -3M24 12q3 -4 5 -3M20 28q0 4 2 6M13 22q-4 1 -5 -1M28 22q4 1 5 -1" stroke="#ff9a1a" stroke-width="1.4" fill="none"/></svg>`;
/* ---- portrait / paysage : le menu caché s'ouvre en portrait ---- */
const _ranch0=ACT.ranch;
/* ---- menus ---- */
let RY2={sub:'water'};
function ranchHead(){
  const F=farm(), h=Math.max(F.heat.atelier,F.heat.ranch), kt=karmaTitle(), k=Math.round(karma());
  return `<div class="rhero"><div class="rlogo">${leafIc('#3cff9e',30)}<div><b>High &amp; Rouillé</b><small>Le réseau</small></div></div>
  <div class="rstats"><div><small>Crédits</small><b>${fmt(S.cr)}</b></div><div><small>Réputation</small><b>${fmt(F.rep)}</b></div><div class="${h>60?'hot':''}"><small>Chaleur</small><b>${Math.round(h)} %</b></div><div><small>Karma</small><b>${kt[2]} ${k>0?'+':''}${k}</b></div></div></div>
  <div class="rtabs">${[['atelier',leafIc('#3cff9e',18),'Atelier'],['ranch','🌾','Ranch'],['shop','🛒','Boutique'],['stock','🫙','Stock'],['net','🚗','Réseau']].map(t=>`<button class="${RY.tab===t[0]?'on':''}" data-a="rtab" data-id="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</div>`;
}
function ranchSheet(X){
  if(!sheet||sheet.t!=='ranch') return false;
  ranchSim(); let h=X+ranchHead();
  if(RY.tab==='atelier'||RY.tab==='ranch') h+=RY.slot!=null?rSlotView(RY.tab,RY.slot):rRoomView(RY.tab);
  else if(RY.tab==='shop') h+=rShop(); else if(RY.tab==='stock') h+=rStock(); else h+=rNet();
  const sh=$('sheet'), sc=sh.scrollTop; sh.classList.add('rch'); sh.innerHTML=h+'<div class="rfoot"></div>'; sh.scrollTop=sc; return true;
}
function rRoomView(room){
  const F=farm(), R=F.rooms[room], RM=ROOMS[room];
  if(!R.on) return `<div class="rcard haze"><h3>${RM.ic} ${RM.nom}</h3><p>Une grande ferme à l’écart de la ville : soleil gratuit, jusqu’à ${RM.max} parcelles, mais plus visible pour la police.</p><button class="btn wide" data-a="rbuyranch" ${S.cr<30000||F.rep<12?'disabled':''}>Acheter le ranch · 30 000 cr (rép. 12)</button></div>`;
  const heat=F.heat[room];
  let h=`<div class="rcard"><div class="rrow"><b>${RM.ic} ${RM.nom}</b><span class="${heat>60?'warn':'sm'}">Police ${Math.round(heat)} %</span></div>${rBar(heat,heat>60?'#FF4D6D':heat>35?'#FCEE0A':'#3CFF9E','Chaleur')}
  <div class="rmini"><span>💧 ${Math.round(F.water)}/${F.tank} L</span><span>🌀 ${R.fan}</span><span>🧯 ${R.filter}</span><span>🚿 ${R.irri?'oui':'non'}</span></div>
  <div class="rbtns two"><button data-a="rwater">💧 Remplir la citerne</button><button data-a="rtab" data-id="shop" data-v="gear">🛠️ Matériel</button></div></div><div class="rgrid">`;
  R.slots.forEach((sl,i)=>{
    if(!sl){ h+=`<button class="rslot empty" data-a="rslot" data-id="${i}">${seedIc(30)}<b>Planter</b><small>emplacement ${i+1}</small></button>`; return; }
    const sv=SID[sl.sid], pc=sl.st==='ready'?100:sl.st==='dead'?0:Math.round(nz(sl.stAge/({germ:1,veg:sv.veg,flo:sv.fl}[sl.st]||1)*100,100));
    const lab={germ:'Germination',veg:'Croissance',flo:'Floraison',ready:'À récolter',dead:'Morte'}[sl.st];
    h+=`<button class="rslot ${sl.st==='ready'?'ready':''} ${sl.pest?'sick':''}" data-a="rslot" data-id="${i}">${plantSVG(sl.st,pc,sl.sid,sl.pest,74)}<b>${sv.nom}</b><small>${lab}${sl.pest?' ⚠️':''}</small><div class="rb sm"><i style="width:${pc}%;background:#00E5FF"></i></div><div class="rb sm"><i style="width:${Math.round(sl.hp)}%;background:#3CFF9E"></i></div></button>`; });
  return h+'</div>'+(R.slots.length<RM.max?`<button class="btn alt wide" data-a="rbuyslot" data-id="${room}">＋ Emplacement · ${fmt(1500+R.slots.length*900)} cr</button>`:'');
}
const cbtn=(i,k,ic,lab,n)=>`<button class="cb ${n===0?'dim':''}" data-a="rcare" data-id="${i}" data-v="${k}"><span>${ic}</span><b>${lab}</b>${n==null?'':`<i>×${n}</i>`}</button>`;
function rSlotView(room,i){
  const F=farm(), R=F.rooms[room], sl=R.slots[i];
  let h=`<button class="btn alt sm" data-a="rback">← Retour à ${ROOMS[room].nom}</button>`;
  if(!sl){
    const seeds=STR.filter(s=>(F.seeds[s.id]||0)>0), P=RY.pick||{};
    h+=`<div class="rcard haze"><h3>${seedIc(24)} Planter une graine</h3>`;
    if(!seeds.length) return h+`<p>Tu n’as aucune graine.</p><button class="btn wide" data-a="rtab" data-id="shop">Aller à la boutique</button></div>`;
    h+=`<p class="sm">1 · Variété</p><div class="rpicks">${seeds.map(s=>`<button class="${P.sid===s.id?'on':''}" data-a="rpick" data-id="sid" data-v="${s.id}">${leafIc(PURP[s.id]?'#a85de8':s.ty==='Sativa'?'#8be03c':'#3cc46a',26)}<b>${s.nom}</b><small>${s.ty} · ×${F.seeds[s.id]}</small></button>`).join('')}</div>
    <p class="sm">2 · Substrat</p><div class="rpicks">${Object.keys(MED).map(k=>`<button class="${P.med===k?'on':''}" data-a="rpick" data-id="med" data-v="${k}">${soilIc(k,32)}<b>${MED[k].nom}</b><small>${MED[k].px?MED[k].px+' cr':'gratuit'} · pH ${MED[k].ph}</small></button>`).join('')}</div>`;
    if(!ROOMS[room].out){ const ls=LAMP.filter(l=>(F.lamps[l.id]||0)>0); h+=`<p class="sm">3 · Lampe</p><div class="rpicks">${ls.length?ls.map(l=>`<button class="${P.lamp===l.id?'on':''}" data-a="rpick" data-id="lamp" data-v="${l.id}"><span class="big">${l.ic}</span><b>${l.nom}</b><small>${(l.lm/1000)|0} k lumens</small></button>`).join(''):'<span class="sm">Aucune lampe : boutique → Lampes</span>'}</div>`; }
    const okP=P.sid&&P.med&&(ROOMS[room].out||P.lamp); return h+`<button class="btn wide" data-a="rplant" data-id="${i}" ${okP?'':'disabled'}>🌱 Planter</button></div>`;
  }
  const sv=SID[sl.sid], f=plantFit(room,sl), md=MED[sl.med], lab={germ:'Germination',veg:'Croissance',flo:'Floraison',ready:'Prête à récolter',dead:'Morte'}[sl.st];
  const need={germ:1,veg:sv.veg,flo:sv.fl}[sl.st]||1, pc=sl.st==='ready'?100:Math.round(nz(sl.stAge/need*100,100));
  h+=`<div class="rhero2"><div class="pl">${plantSVG(sl.st,pc,sl.sid,sl.pest,150)}</div><div class="pi"><b>${sv.nom}</b><small>${sv.ty} · ${sv.thc} % THC</small><span class="chip">${lab}${sl.st==='ready'||sl.st==='dead'?'':' '+pc+' %'}</span><span class="chip">${soilIc(sl.med,16)} ${md.nom}</span></div></div>
  <div class="rcard">${rBar(pc,'#00E5FF','Avancement')}${rBar(sl.hp,'#3CFF9E','Santé')}${rBar(sl.q,'#FCEE0A','Qualité')}${rBar(sl.w,'#4aa8ff','Eau')}${rBar(sl.N,'#3cff9e','Azote N')}${rBar(sl.P,'#ff9a1a','Phosphore P')}${rBar(sl.K,'#a58bff','Potassium K')}
  <div class="rrow sm"><span>pH ${sl.ph.toFixed(1)} <i>(idéal ${md.ph})</i></span><span>${Math.round(f.L/1000)} k lm <i>(idéal ${Math.round(f.ideal/1000)} k)</i></span></div>
  ${sl.pest?`<p class="warn">⚠️ ${sl.pest==='mold'?'Moisissure : fongicide !':'Acariens : insecticide !'}</p>`:''}${f.cf<1?`<p class="warn">Cycle ${sl.cyc}/${24-sl.cyc} inadapté (${sl.st==='flo'?'12/12 requis':'18/6 conseillé'}).</p>`:''}</div>`;
  if(sl.st==='dead') return h+`<button class="btn wide" data-a="rclear" data-id="${i}">Évacuer la plante</button>`;
  if(sl.st==='ready') return h+`<button class="btn wide" data-a="rharvest" data-id="${i}">✂️ Récolter · environ ${Math.round(sv.y*md.y*(sl.hp/100)*(.5+.5*sl.q/100)*(room==='ranch'?1.15:1))} g</button>`;
  const c=k=>F.chem[k]||0, sub=RY2.sub;
  h+=`<div class="rtabs sub">${[['water','💧','Eau & engrais'],['care','🧪','Soins'],['light','💡','Lumière']].map(t=>`<button class="${sub===t[0]?'on':''}" data-a="rsub" data-id="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</div><div class="rcard">`;
  if(sub==='water') h+=`<div class="cgrid">${cbtn(i,'water','💧','Arroser',null)}${cbtn(i,'N','🟩','Azote',c('N'))}${cbtn(i,'P','🟧','Phosphore',c('P'))}${cbtn(i,'K','🟪','Potassium',c('K'))}${cbtn(i,'mixV','🥗','Mix croissance',null)}${cbtn(i,'mixF','🌸','Mix floraison',null)}</div><p class="sm">Mix croissance = 3 N · 1 P · 2 K. Mix floraison = 1 N · 3 P · 2 K.</p>`;
  else if(sub==='care') h+=`<div class="cgrid">${cbtn(i,'PHm','🔻','pH −',c('PHm'))}${cbtn(i,'PHp','🔺','pH +',c('PHp'))}${cbtn(i,'CM','⚪','Cal-Mag',c('CM'))}${cbtn(i,'ENZ','🧪','Enzymes',c('ENZ'))}${cbtn(i,'BOOST','🚀','Booster',c('BOOST'))}${cbtn(i,'FONG','🍄','Fongicide',c('FONG'))}${cbtn(i,'INSEC','🐛','Insecticide',c('INSEC'))}</div>`;
  else h+=`<div class="cgrid"><button class="cb ${sl.cyc===18?'on':''}" data-a="rcycle" data-id="${i}" data-v="18"><span>☀️</span><b>18 / 6</b><i>croissance</i></button><button class="cb ${sl.cyc===12?'on':''}" data-a="rcycle" data-id="${i}" data-v="12"><span>🌙</span><b>12 / 12</b><i>floraison</i></button></div>
    ${sl.st==='veg'&&pc>=50?`<button class="btn wide" data-a="rflower" data-id="${i}">🌸 Passer en floraison</button>`:''}
    ${!ROOMS[room].out?`<p class="sm">Lampe : ${sl.lamp?LID[sl.lamp].nom:'—'}</p><div class="rchips">${LAMP.filter(l=>(F.lamps[l.id]||0)>0||l.id===sl.lamp).map(l=>`<button class="${sl.lamp===l.id?'on':''}" data-a="rlamp" data-id="${i}" data-v="${l.id}">${l.ic} ${(l.lm/1000)|0} k lm</button>`).join('')}</div>`:'<p class="sm">Plein soleil du ranch, variable selon les jours.</p>'}`;
  return h+`</div><button class="btn alt wide" data-a="rclear" data-id="${i}">Arracher la plante</button>`;
}
ACT.rsub=d=>{ RY2.sub=d.id; renderSheet(); };
function rShop(){
  const F=farm(); let h=`<div class="rtabs sub">${[['seeds',seedIc(18),'Graines'],['chem','🧴','Engrais'],['lamps','💡','Lampes'],['gear','🛠️','Matériel']].map(t=>`<button class="${RY.shop===t[0]?'on':''}" data-a="rshop" data-id="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</div>`;
  if(RY.shop==='seeds') STR.filter(s=>!s.hy).forEach(s=>{ const lock=F.rep<s.rep, lc=PURP[s.id]?'#a85de8':s.ty==='Sativa'?'#8be03c':s.ty==='Indica'?'#1f9d55':'#3cc46a'; h+=`<div class="rit ${lock?'lock':''}"><div class="rart">${leafIc(lc,34)}${seedIc(20)}</div><div class="grow"><b>${s.nom}</b><small>${s.ty} · ${s.thc} % THC · ${s.px} cr/g</small><small>Croiss. ${s.veg} min · Flor. ${s.fl} min · ~${s.y} g · ${(s.lm/1000)|0} k lm</small><span class="dif">${leafIc('#3cff9e',11).repeat(s.d)}${leafIc('#2b2f60',11).repeat(5-s.d)}</span></div>${lock?`<small class="lk">🔒 Rép. ${s.rep}</small>`:`<button class="btn sm" data-a="rbuy" data-id="seed:${s.id}">${fmt(s.sd)}<br><i>×${F.seeds[s.id]||0}</i></button>`}</div>`; });
  else if(RY.shop==='chem') Object.keys(CHEM).forEach(k=>{ const c=CHEM[k]; h+=`<div class="rit"><div class="rart"><span class="big">${c.ic}</span></div><div class="grow"><b>${c.nom}</b><small>${c.sub}</small></div><button class="btn sm" data-a="rbuy" data-id="chem:${k}">${c.px}<br><i>×${F.chem[k]||0}</i></button></div>`; });
  else if(RY.shop==='lamps') LAMP.forEach(l=>{ h+=`<div class="rit"><div class="rart"><span class="big">${l.ic}</span></div><div class="grow"><b>${l.nom}</b><small>${fmt(l.lm)} lumens · ${l.w} W · ${(l.w/100).toFixed(1)} cr/min</small>${rBar(l.lm/950,'#FCEE0A','Puissance')}</div><button class="btn sm" data-a="rbuy" data-id="lamp:${l.id}">${fmt(l.px)}<br><i>×${F.lamps[l.id]||0}</i></button></div>`; });
  else { const tp=[['fan','🌀 Ventilation','Moins de moisissure',2500],['filter','🧯 Filtre à charbon','−20 % de chaleur',4000],['irri','🚿 Irrigation auto','Arrose seule',9000]];
    ['atelier','ranch'].forEach(room=>{ const R=F.rooms[room]; if(!R.on) return; h+=`<h3 class="rh">${ROOMS[room].ic} ${ROOMS[room].nom}</h3>`; tp.forEach(t=>{ const lv=R[t[0]]||0, max=t[0]==='irri'?1:3; h+=`<div class="rit"><div class="grow"><b>${t[1]}</b><small>niv. ${lv}/${max} · ${t[2]}</small></div><button class="btn sm" data-a="rbuy" data-id="gear:${room}:${t[0]}" ${lv>=max?'disabled':''}>${lv>=max?'Max':fmt(t[3]*(lv+1))}</button></div>`; }); });
    h+=`<div class="rit"><div class="grow"><b>🛢️ Citerne +100 L</b><small>Capacité ${F.tank} L</small></div><button class="btn sm" data-a="rbuy" data-id="tank:0">1 200</button></div><div class="rit"><div class="grow"><b>🕴️ Pot-de-vin</b><small>−30 % de chaleur partout</small></div><button class="btn sm" data-a="rbuy" data-id="bribe:0">${fmt(1500+Math.round(Math.max(F.heat.atelier,F.heat.ranch)*80))}</button></div>`; }
  return h;
}
function rStock(){
  const F=farm(); const ks=Object.keys(F.stock).filter(k=>F.stock[k].g>=1);
  let h=`<div class="rcard haze"><h3>🫙 Stock séché</h3>${ks.length?ks.map(k=>{ const s=F.stock[k], sv=SID[k], p=sellPrice(k,s.q);
    return `<div class="rjar"><div class="jb">${budIc(k,46)}</div><div class="grow"><b>${sv.nom}</b><small>${Math.floor(s.g)} g · qualité ${Math.round(s.q)} % · ${p.toFixed(1)} cr/g</small></div></div>
    <div class="rbtns tight"><button data-a="rsell" data-id="${k}" data-v="street10">Rue · 10 g</button><button data-a="rsell" data-id="${k}" data-v="street">Rue · tout</button>${F.rep>=10?`<button data-a="rsell" data-id="${k}" data-v="contact">Contact</button>`:'<button class="dim" disabled>Contact · rép. 10</button>'}${F.rep>=30&&s.q>=65?`<button data-a="rsell" data-id="${k}" data-v="vip">VIP</button>`:'<button class="dim" disabled>VIP · rép. 30</button>'}</div>`; }).join(''):'<p>Rien en stock. Une plante récoltée sèche pendant 2 minutes.</p>'}
  <p class="sm">Rue : 75 % du prix, risqué, karma −. Contact : prix normal. VIP : 135 %. Les livraisons en voiture paient le mieux.</p></div>`;
  if((F.dry||[]).length) h+=`<div class="rcard"><h3>🧺 En séchage</h3>${F.dry.map(b=>`<div class="rrow sm"><span>${budIc(b.sid,22)} ${SID[b.sid].nom} · ${Math.round(b.g)} g</span><span>${Math.ceil(b.t*60)} s</span></div>`).join('')}</div>`;
  return h;
}
function rNet(){
  const F=farm(), k=Math.round(karma()), kt=karmaTitle(), pos=(k+100)/2;
  let h=`<div class="rcard karma"><div class="rrow"><b>${kt[2]} ${kt[1]}</b><span>${k>0?'+':''}${k}</span></div><div class="kbar"><i style="left:${pos}%"></i></div><div class="rrow sm"><span>😈 Truand</span><span>😇 Saint</span></div>
  <p class="sm">${k>=15?`Bonne réputation : +${Math.round(k*.15)} % sur les gains légaux, police moins pressante.`:k<=-15?`Mauvaise réputation : acheteurs +${Math.round(-k/4)} % plus généreux, mais police plus pressante.`:'Ni ange ni démon. Les épreuves légales montent le karma, le trafic le fait chuter.'}</p>
  <div class="rbtns tight">${[['Banque alimentaire',1500,3],['Club de jeunes pilotes',8000,10],['Hôpital',30000,30]].map((d,i)=>`<button data-a="rdon" data-id="${i}" ${S.cr<d[1]?'class="dim"':''}>❤️ ${d[0]}<br><small>${fmt(d[1])} cr · +${d[2]}</small></button>`).join('')}</div></div>
  <div class="rcard"><p>Les go-fast écoulent ta marchandise à prix fort ; les courses clandestines se jouent à la mise. Une manche ratée = cargaison perdue, chaleur et karma −.</p></div>`;
  ILL.forEach(e=>{ const lock=S.lvl<e.lvl||F.rep<e.rep, best=bestCargo(e), few=S.cars.length<e.manches.length, need=e.ill==='cargo'?`${e.cargo} g de marchandise`:`mise ${fmt(e.bet)} cr`;
    h+=`<div class="rit ${lock?'lock':''}"><div class="rart"><span class="big">${e.ill==='cargo'?'📦':'🏁'}</span></div><div class="grow"><b>${e.nom}</b><small>${e.txt}</small><small>${need} · prime ${fmt(e.gain)} · chaleur +${e.heat}</small></div>${lock?`<small class="lk">Niv. ${e.lvl}<br>Rép. ${e.rep}</small>`:`<button class="btn sm" data-a="illgo" data-id="${e.id}" ${(e.ill==='cargo'&&!best)||(e.ill==='bet'&&S.cr<e.bet)||few?'disabled':''}>Go</button>`}</div>`; });
  return h;
}
ACT.rdon=d=>{ const t=[[1500,3],[8000,10],[30000,30]][+d.id]; if(!t||S.cr<t[0]) return toast('Pas assez de crédits'); S.cr-=t[0]; karmaAdd(t[1]); toast('Merci pour ton don ❤️ karma +'+t[1]); save(); renderSheet(); };
