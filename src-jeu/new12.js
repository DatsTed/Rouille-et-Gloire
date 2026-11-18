/* ===== v0.20 : Le Ranch & l'Atelier caché (culture, réseau illégal, livraisons en voiture) — jeu de fiction ===== */
const STR=[ /* id, nom, type, THC %, veg min, floraison min, rendement g/plante, prix cr/g, lumens idéaux, soif, difficulté, rép. requise, prix graine */
 {id:'nl',nom:'Northern Lights',ty:'Indica',thc:18,veg:2.5,fl:7.5,y:34,px:5,lm:32000,eau:1.0,d:1,rep:0,sd:120,ic:'🌙'},
 {id:'ww',nom:'White Widow',ty:'Hybride',thc:19,veg:2.5,fl:8,y:32,px:6,lm:34000,eau:1.0,d:1,rep:0,sd:150,ic:'🤍'},
 {id:'ak',nom:'AK-47',ty:'Hybride',thc:20,veg:2.7,fl:8,y:36,px:6.5,lm:36000,eau:1.0,d:2,rep:2,sd:190,ic:'🔫'},
 {id:'cm',nom:'Critical Mass',ty:'Indica',thc:19,veg:2.7,fl:8,y:48,px:5.5,lm:36000,eau:1.2,d:2,rep:4,sd:230,ic:'⚖️'},
 {id:'bd',nom:'Blue Dream',ty:'Sativa',thc:20,veg:3,fl:9.5,y:46,px:7,lm:40000,eau:1.1,d:2,rep:6,sd:280,ic:'💙'},
 {id:'og',nom:'OG Kush',ty:'Hybride',thc:23,veg:3,fl:8.5,y:30,px:9,lm:42000,eau:1.0,d:3,rep:10,sd:360,ic:'🌲'},
 {id:'gp',nom:'Granddaddy Purple',ty:'Indica',thc:20,veg:3,fl:8,y:34,px:8,lm:40000,eau:.95,d:3,rep:12,sd:380,ic:'🍇'},
 {id:'jh',nom:'Jack Herer',ty:'Sativa',thc:20,veg:3.2,fl:9.5,y:38,px:8.5,lm:44000,eau:1.0,d:3,rep:14,sd:420,ic:'🧑‍🌾'},
 {id:'ph',nom:'Purple Haze',ty:'Sativa',thc:19,veg:3.2,fl:9,y:34,px:8,lm:44000,eau:1,d:3,rep:16,sd:430,ic:'🟣'},
 {id:'gs',nom:'Girl Scout Cookies',ty:'Hybride',thc:25,veg:3.2,fl:9,y:34,px:11,lm:48000,eau:1.0,d:4,rep:20,sd:600,ic:'🍪'},
 {id:'sd',nom:'Sour Diesel',ty:'Sativa',thc:21,veg:3.5,fl:10,y:40,px:10,lm:50000,eau:1.1,d:4,rep:24,sd:640,ic:'⛽'},
 {id:'dp',nom:'Durban Poison',ty:'Sativa',thc:22,veg:3.4,fl:9,y:38,px:10.5,lm:50000,eau:.9,d:4,rep:28,sd:680,ic:'🌍'},
 {id:'zk',nom:'Zkittlez',ty:'Indica',thc:23,veg:3.2,fl:8.5,y:30,px:12.5,lm:46000,eau:1,d:4,rep:32,sd:760,ic:'🍬'},
 {id:'gg',nom:'Gorilla Glue #4',ty:'Hybride',thc:27,veg:3.5,fl:9,y:42,px:14,lm:52000,eau:1.1,d:5,rep:40,sd:950,ic:'🦍'},
 {id:'wc',nom:'Wedding Cake',ty:'Hybride',thc:25,veg:3.5,fl:9,y:36,px:13.5,lm:52000,eau:1,d:5,rep:48,sd:980,ic:'🎂'},
 {id:'am',nom:'Amnesia Haze',ty:'Sativa',thc:22,veg:3.8,fl:11,y:44,px:13,lm:56000,eau:1.2,d:5,rep:56,sd:1050,ic:'🌫️'},
 {id:'ge',nom:'Gelato',ty:'Hybride',thc:26,veg:3.6,fl:9,y:34,px:16,lm:54000,eau:1,d:5,rep:64,sd:1250,ic:'🍨'}
];
const SID={}; STR.forEach(s=>SID[s.id]=s);
const LAMP=[ /* lumens par emplacement, watts, chaleur */
 {id:'t5',nom:'Néon T5',lm:9000,w:55,h:.4,px:300,ic:'💡'},
 {id:'led',nom:'LED blanche 100 W',lm:22000,w:100,h:.6,px:900,ic:'🔆'},
 {id:'led2',nom:'LED spectre complet 240 W',lm:38000,w:240,h:.9,px:2800,ic:'🌈'},
 {id:'cmh',nom:'Iodure céramique 315 W',lm:50000,w:315,h:1.3,px:5200,ic:'🟡'},
 {id:'hps',nom:'Sodium HPS 600 W',lm:78000,w:600,h:2.2,px:7800,ic:'🟠'},
 {id:'ledp',nom:'LED Pro 480 W',lm:95000,w:480,h:1.2,px:16000,ic:'⚡'}
];
const LID={}; LAMP.forEach(l=>LID[l.id]=l);
const MED={terreau:{nom:'Terreau',ic:'🟤',eau:1,sp:1,y:1,ph:6.3,px:0},coco:{nom:'Fibre de coco',ic:'🥥',eau:1.3,sp:1.1,y:1.08,ph:5.9,px:25},hydro:{nom:'Hydroponie',ic:'💧',eau:1.7,sp:1.25,y:1.18,ph:5.8,px:70}};
const CHEM={
 N:{nom:'Azote (N)',sub:'urée / nitrate d’ammonium',px:14,ic:'🟩'},P:{nom:'Phosphore (P)',sub:'superphosphate',px:16,ic:'🟧'},K:{nom:'Potassium (K)',sub:'sulfate de potasse',px:15,ic:'🟪'},
 CM:{nom:'Calcium-Magnésium',sub:'anti-carence',px:20,ic:'⚪'},PHm:{nom:'pH −',sub:'acide phosphorique dilué',px:10,ic:'🔻'},PHp:{nom:'pH +',sub:'carbonate de potassium',px:10,ic:'🔺'},
 BOOST:{nom:'Booster floraison',sub:'PK 13-14',px:90,ic:'🚀'},ENZ:{nom:'Enzymes racinaires',sub:'racines + vitesse',px:60,ic:'🧪'},
 FONG:{nom:'Fongicide',sub:'soufre / bicarbonate',px:40,ic:'🍄'},INSEC:{nom:'Insecticide',sub:'savon / neem',px:40,ic:'🐛'}
};
const ILL=[
 {id:'x1',nom:'Go-fast Bruxelles → Anvers',ill:'cargo',lvl:3,rep:3,gain:1500,xp:60,cargo:40,prem:2.1,heat:14,opp:{t:[1,2],up:0,etat:[45,75]},manches:[{d:'circuit',m:'sec',sp:'s1'}],txt:'Une manche. 40 g à livrer avant les flics.'},
 {id:'x2',nom:'Livraison de nuit',ill:'cargo',lvl:4,rep:8,gain:2600,xp:90,cargo:70,prem:2.2,heat:18,opp:{t:[1,3],up:1,etat:[55,85]},manches:[{d:'rallye',m:'pluie'}],txt:'Chemins de campagne sous la pluie, 70 g.'},
 {id:'x3',nom:'Convoi de la frontière',ill:'cargo',lvl:7,rep:20,gain:7000,xp:200,cargo:150,prem:2.5,heat:26,opp:{t:[3,4],up:2,etat:[75,100]},manches:[{d:'circuit',m:'pluie',sp:'s2'},{d:'endurance',m:'sec'}],txt:'Deux manches, 150 g, gros risque.'},
 {id:'x4',nom:'Go-fast Marseille express',ill:'cargo',lvl:10,rep:45,gain:18000,xp:420,cargo:300,prem:2.8,heat:34,opp:{t:[4,5],up:2,etat:[90,100]},manches:[{d:'circuit',m:'sec',sp:'s4'},{d:'rallye',m:'sec'},{d:'drag',m:'sec'}],txt:'Trois manches, 300 g. Le gros coup.'},
 {id:'b1',nom:'Course du parking (mise 1 000)',ill:'bet',bet:1000,lvl:2,rep:0,gain:1200,xp:40,heat:6,opp:{t:[1,1],up:0,etat:[40,65]},manches:[{d:'drag',m:'sec'}],txt:'Course clandestine. Tu mises 1 000 cr.'},
 {id:'b2',nom:'Drift de nuit (mise 3 000)',ill:'bet',bet:3000,lvl:5,rep:6,gain:3600,xp:110,heat:8,opp:{t:[2,3],up:1,etat:[60,90]},manches:[{d:'drift',m:'sec'}],txt:'Seul le meilleur score ramasse la mise.'},
 {id:'b3',nom:'Touge illégale (mise 8 000)',ill:'bet',bet:8000,lvl:8,rep:18,gain:9000,xp:240,heat:12,opp:{t:[3,4],up:2,etat:[80,100]},manches:[{d:'circuit',m:'pluie',sp:'s3'},{d:'drift',m:'sec'}],txt:'Deux manches, grosse mise.'},
 {id:'b4',nom:'Le Grand Jeu (mise 25 000)',ill:'bet',bet:25000,lvl:11,rep:40,gain:30000,xp:520,heat:16,opp:{t:[5,6],up:3,etat:[100,100]},manches:[{d:'drag',m:'sec'},{d:'circuit',m:'sec',sp:'tour'},{d:'drift',m:'sec'}],txt:'Trois manches contre l’élite.'}
];
ILL.forEach(e=>EVENTS.push(e));
const ROOMS={atelier:{nom:'Atelier caché',ic:'🏚️',slots:6,max:12,out:false,heat:1},ranch:{nom:'Ranch',ic:'🌾',slots:8,max:24,out:true,heat:1.6}};
function farm(){
  const F=S.farm||(S.farm={found:0,rep:0,seeds:{},chem:{N:6,P:6,K:6,CM:2,PHm:2,PHp:2,BOOST:0,ENZ:0,FONG:1,INSEC:1},lamps:{t5:2,led:0},stock:{},dry:[],water:80,tank:200,tick:Date.now(),
    heat:{atelier:0,ranch:0},rooms:{atelier:{on:1,slots:[],fan:0,filter:0,irri:0},ranch:{on:0,slots:[],fan:0,filter:0,irri:0}},stats:{harv:0,sold:0,raids:0,deliv:0,busted:0}});
  for(const k in ROOMS){ const r=F.rooms[k]; while(r.slots.length<ROOMS[k].slots+(r.extra||0)) r.slots.push(null); }
  return F;
}
const nz=(v,m)=>Math.max(0,Math.min(m,v));
const band=(v,lo,hi)=>v<lo?v/lo:v>hi?Math.max(0,1-(v-hi)/(100-hi)):1;
function lampLm(room,sl){ if(ROOMS[room].out){ const d=Math.floor(Date.now()/864e5); return 36000+9000*Math.sin(d*1.7); } return sl.lamp?LID[sl.lamp].lm:0; }
function newPlant(sid,med,lamp){ return {sid,med,lamp,st:'germ',stAge:0,age:0,w:70,N:50,P:50,K:50,ph:MED[med].ph+(Math.random()-.5)*.4,hp:100,q:60,pest:null,prot:0,cyc:18,rip:0,boost:0,enz:0}; }
function plantFit(room,sl){
  const sv=SID[sl.sid], md=MED[sl.med], L=lampLm(room,sl), stF={germ:.3,veg:.65,flo:1,ready:1}[sl.st];
  const ideal=sv.lm*stF, lf=L<=0?0:L<ideal?Math.max(.1,L/ideal):L>ideal*1.35?Math.max(.2,1-(L-ideal*1.35)/ideal):1;
  const nf=(band(sl.N,35,80)+band(sl.P,35,80)+band(sl.K,35,80))/3, wf=band(sl.w,30,88), pf=Math.max(0,1-Math.abs(sl.ph-md.ph)/1.4);
  const cf=sl.st==='flo'?(sl.cyc===12?1:.35):sl.st==='veg'?(sl.cyc===18?1:.6):1;
  return {lf,nf,wf,pf,cf,L,ideal};
}
function stepSlot(room,sl,dt,F){
  if(!sl||sl.st==='ready'){ if(sl&&sl.st==='ready'){ sl.rip+=dt; if(sl.rip>4) sl.q=Math.max(10,sl.q-dt*2); } return; }
  const sv=SID[sl.sid], md=MED[sl.med], f=plantFit(room,sl), irri=F.rooms[room].irri;
  if(sl.prot>0) sl.prot-=dt; if(sl.boost>0) sl.boost-=dt; if(sl.enz>0) sl.enz-=dt;
  if(irri&&sl.w<38&&F.tank>=3){ sl.w=Math.min(90,sl.w+30); F.tank-=3; }
  sl.w=nz(sl.w-dt*(3.2*sv.eau*md.eau)*(sl.st==='flo'?1.25:1)*(room==='ranch'?1.25:1),100);
  const dm=sl.st==='flo'?[.9,2.5,1.9]:sl.st==='veg'?[2.3,.8,1.5]:[.4,.4,.4];
  sl.N=nz(sl.N-dt*dm[0]*sv.eau,100); sl.P=nz(sl.P-dt*dm[1]*sv.eau,100); sl.K=nz(sl.K-dt*dm[2]*sv.eau,100);
  sl.ph+=(Math.random()-.5)*.02*dt+((7-sl.ph)*.004*dt);
  const comp=f.lf*.34+f.nf*.26+f.wf*.16+f.pf*.14+f.cf*.1, boost=sl.boost>0?1.15:1;
  sl.hp=nz(sl.hp+(comp-.6)*5*dt-(sl.pest?3*dt:0)-(sl.w>96?1*dt:0)-(f.lf>.99&&f.L>f.ideal*1.35?.8*dt:0),100);
  sl.q=nz(sl.q+((comp*100*boost+(sl.st==='flo'&&sl.cyc===12?4:0))-sl.q)*.05*dt,100);
  if(sl.hp<=0){ sl.st='dead'; return; }
  const sp=(.3+.7*f.lf)*(.5+.5*f.nf)*(.55+.45*f.wf)*(.7+.3*f.pf)*f.cf*md.sp*(sl.enz>0?1.2:1)*(sl.boost>0?1.1:1);
  const need={germ:1,veg:sv.veg,flo:sv.fl}[sl.st]; sl.stAge+=dt*sp; sl.age+=dt;
  if(sl.st==='germ'&&sl.stAge>=need){ sl.st='veg'; sl.stAge=0; }
  else if(sl.st==='flo'&&sl.stAge>=need){ sl.st='ready'; sl.rip=0; }
  if(!sl.pest&&sl.prot<=0){ const R=ROOMS[room], hum=(room==='ranch'?1.6:1)*(1-.2*Math.min(3,F.rooms[room].fan))*(sl.st==='flo'?1.4:1), pr=(.012+.01*sv.d*.3)*hum*dt; if(Math.random()<pr) sl.pest=Math.random()<.6?'mold':'mites'; }
}
function roomHeatTarget(room,F){
  const r=F.rooms[room]; let t=0;
  r.slots.forEach(sl=>{ if(sl&&sl.st==='flo') t+=4.5; else if(sl&&sl.st==='ready') t+=5.5; else if(sl&&sl.st==='veg') t+=1; });
  const lam=ROOMS[room].out?0:r.slots.reduce((a,sl)=>a+(sl&&sl.lamp?LID[sl.lamp].h:0),0)*1.2;
  return Math.min(100,(t*ROOMS[room].heat+lam)*Math.max(.15,1-.2*r.filter)*(1-clamp(karma(),-50,50)/250)+(ROOMS[room].out?4:0));
}
function ranchSim(){
  const F=farm(), now=Date.now(); let dt=Math.min((now-F.tick)/60000,600); F.tick=now; if(dt<=0) return;
  let left=dt, ch=0;
  while(left>1e-4){
    const d=Math.min(left,.5); left-=d; ch++;
    for(const room in ROOMS){ const R=F.rooms[room]; if(!R.on) continue;
      let watts=0; R.slots.forEach(sl=>{ if(sl&&sl.lamp&&sl.st!=='dead'&&sl.st!=='ready'&&!ROOMS[room].out) watts+=LID[sl.lamp].w; });
      const cost=watts/100*d; if(cost>0){ if(S.cr>=cost) S.cr-=cost; else { R.slots.forEach(sl=>{ if(sl&&sl.lamp) sl.w=sl.w; }); continue; } }
      R.slots.forEach(sl=>stepSlot(room,sl,d,F));
      const tg=roomHeatTarget(room,F); F.heat[room]+=(tg-F.heat[room])*Math.min(1,.12*d);
      if(F.heat[room]>60&&Math.random()<(F.heat[room]-60)/100*.04*d) ranchRaid(room,F);
    }
    if(F.water<F.tank) F.water=Math.min(F.tank,F.water+d*(F.rooms.ranch.on?.8:0));
    F.dryT=(F.dryT||0)+d;
  }
  F.dry=F.dry||[]; for(let i=F.dry.length-1;i>=0;i--){ F.dry[i].t-=dt; if(F.dry[i].t<=0){ const b=F.dry.splice(i,1)[0]; const st=F.stock[b.sid]||(F.stock[b.sid]={g:0,q:0}); st.q=(st.q*st.g+b.q*b.g)/Math.max(1,st.g+b.g); st.g+=b.g; } }
}
function ranchRaid(room,F){
  F.heat[room]=22; F.stats.raids++; karmaAdd(-4); const R=F.rooms[room], lost=[];
  R.slots.forEach((sl,i)=>{ if(sl&&(sl.st==='flo'||sl.st==='ready')&&Math.random()<.7){ lost.push(SID[sl.sid].nom); R.slots[i]=null; } });
  const fine=Math.round(S.cr*.12); S.cr-=fine; for(const k in F.stock) F.stock[k].g=Math.floor(F.stock[k].g*.6);
  banner(`🚨 <b>Descente de police</b> à ${ROOMS[room].nom} !<br>${lost.length} plantes saisies, 40 % du stock perdu, amende ${fmt(fine)} cr.`);
}
function banner(html){
  let b=document.getElementById('rbn'); if(!b){ b=document.createElement('div'); b.id='rbn'; document.body.appendChild(b); }
  b.innerHTML=html; b.classList.add('on'); clearTimeout(banner.t); banner.t=setTimeout(()=>b.classList.remove('on'),7000);
}
function sellPrice(sid,q){ const sv=SID[sid]; return 2.5*sv.px*(.55+.9*q/100)*(.85+.15*sv.thc/20)*(1+Math.max(0,-karma())/400); }
function stockTotal(){ const F=farm(); let g=0; for(const k in F.stock) g+=F.stock[k].g; return g; }
/* ---------- interface ---------- */
let RY={tab:'atelier',slot:null,pick:null,shop:'seeds',sel:null,down:false,lastTick:0};
const rBar=(v,c,l)=>`<div class="rb"><span>${l}</span><i style="width:${Math.round(nz(v,100))}%;background:${c}"></i></div>`;
function ranchHead(){
  const F=farm(), h=Math.max(F.heat.atelier,F.heat.ranch);
  return `<div class="rhd"><b>🌿 Réseau</b><span>${fmt(S.cr)} cr</span><span>Rép. ${fmt(F.rep)}</span><span class="${h>60?'hot':''}">Chaleur ${Math.round(h)} %</span></div>
  <div class="rtabs">${[['atelier','🏚️ Atelier'],['ranch','🌾 Ranch'],['shop','🛒 Boutique'],['stock','📦 Stock'],['net','🚗 Réseau']].map(t=>`<button class="${RY.tab===t[0]?'on':''}" data-a="rtab" data-id="${t[0]}">${t[1]}</button>`).join('')}</div>`;
}
function ranchSheet(X){
  if(!sheet||sheet.t!=='ranch') return false;
  ranchSim(); const F=farm(); let h=X+ranchHead();
  if(RY.tab==='atelier'||RY.tab==='ranch') h+=RY.slot!=null?rSlotView(RY.tab,RY.slot):rRoomView(RY.tab);
  else if(RY.tab==='shop') h+=rShop(); else if(RY.tab==='stock') h+=rStock(); else h+=rNet();
  const sc=$('sheet').scrollTop; $('sheet').innerHTML=h; $('sheet').scrollTop=sc; return true;
}
function rRoomView(room){
  const F=farm(), R=F.rooms[room], RM=ROOMS[room];
  if(!R.on) return `<div class="rcard"><h3>${RM.ic} ${RM.nom}</h3><p>Une grande ferme à l’écart de la ville : lumière du soleil gratuite, jusqu’à ${RM.max} parcelles, mais bien plus visible pour la police.</p><button class="btn wide" data-a="rbuyranch" ${S.cr<30000||F.rep<12?'disabled':''}>Acheter le ranch — 30 000 cr (rép. 12)</button></div>`;
  const heat=F.heat[room];
  let h=`<div class="rcard"><div class="rrow"><b>${RM.ic} ${RM.nom}</b><span>Chaleur ${Math.round(heat)} %</span></div>${rBar(heat,heat>60?'#FF4D6D':heat>35?'#FCEE0A':'#3CFF9E','Police')}
  <div class="rrow sm"><span>💧 Citerne ${Math.round(F.tank?F.water:0)} / ${F.tank} L</span><button class="btn alt sm" data-a="rwater">Remplir (1 cr/L)</button></div>
  <div class="rrow sm"><span>🌀 Ventil. ${R.fan} · 🧯 Filtre ${R.filter} · 🚿 Irrig. ${R.irri?'oui':'non'}</span><button class="btn alt sm" data-a="rtab" data-id="shop" data-v="gear">Matériel</button></div></div>
  <div class="rgrid">`;
  R.slots.forEach((sl,i)=>{
    if(!sl){ h+=`<button class="rslot empty" data-a="rslot" data-id="${i}"><span class="ri">＋</span><small>Planter</small></button>`; return; }
    const sv=SID[sl.sid]; let pc=sl.st==='ready'?100:sl.st==='dead'?0:Math.round(nz(sl.stAge/({germ:1,veg:sv.veg,flo:sv.fl}[sl.st]||1)*100,100));
    const lab={germ:'Germination',veg:'Croissance',flo:'Floraison',ready:'Prête !',dead:'Morte'}[sl.st];
    h+=`<button class="rslot ${sl.st==='ready'?'ready':''} ${sl.pest?'sick':''}" data-a="rslot" data-id="${i}"><span class="ri">${sv.ic}</span><b>${sv.nom}</b><small>${lab}${sl.pest?' ⚠️':''}</small><div class="rb sm"><i style="width:${pc}%;background:#00E5FF"></i></div><div class="rb sm"><i style="width:${Math.round(sl.hp)}%;background:#3CFF9E"></i></div></button>`;
  });
  return h+'</div>'+(R.slots.length<RM.max?`<button class="btn alt wide" data-a="rbuyslot" data-id="${room}">+1 emplacement — ${fmt(1500+R.slots.length*900)} cr</button>`:'');
}
function rSlotView(room,i){
  const F=farm(), R=F.rooms[room], sl=R.slots[i];
  let h=`<button class="btn alt sm" data-a="rback">← Retour</button>`;
  if(!sl){
    const seeds=STR.filter(s=>(F.seeds[s.id]||0)>0), P=RY.pick||{};
    h+=`<div class="rcard"><h3>Planter</h3>`;
    if(!seeds.length) return h+`<p>Tu n’as aucune graine. Achète-en à la boutique.</p><button class="btn wide" data-a="rtab" data-id="shop">Aller à la boutique</button></div>`;
    h+=`<p class="sm">Variété</p><div class="rchips">${seeds.map(s=>`<button class="${P.sid===s.id?'on':''}" data-a="rpick" data-id="sid" data-v="${s.id}">${s.ic} ${s.nom} ×${F.seeds[s.id]}</button>`).join('')}</div>
    <p class="sm">Substrat</p><div class="rchips">${Object.keys(MED).map(k=>`<button class="${P.med===k?'on':''}" data-a="rpick" data-id="med" data-v="${k}">${MED[k].ic} ${MED[k].nom}${MED[k].px?` (${MED[k].px} cr)`:''}</button>`).join('')}</div>`;
    if(!ROOMS[room].out){ const ls=LAMP.filter(l=>(F.lamps[l.id]||0)>0); h+=`<p class="sm">Lampe</p><div class="rchips">${ls.length?ls.map(l=>`<button class="${P.lamp===l.id?'on':''}" data-a="rpick" data-id="lamp" data-v="${l.id}">${l.ic} ${l.nom} (${(l.lm/1000)|0} k lm)</button>`).join(''):'<span class="sm">Aucune lampe en stock : boutique → Lampes</span>'}</div>`; }
    const okP=P.sid&&P.med&&(ROOMS[room].out||P.lamp); return h+`<button class="btn wide" data-a="rplant" data-id="${i}" ${okP?'':'disabled'}>Planter</button></div>`;
  }
  const sv=SID[sl.sid], f=plantFit(room,sl), md=MED[sl.med], lab={germ:'Germination',veg:'Croissance',flo:'Floraison',ready:'Prête à récolter',dead:'Morte'}[sl.st];
  const need={germ:1,veg:sv.veg,flo:sv.fl}[sl.st]||1, pc=sl.st==='ready'?100:Math.round(nz(sl.stAge/need*100,100));
  h+=`<div class="rcard"><div class="rrow"><b>${sv.ic} ${sv.nom}</b><span>${sv.ty} · ${sv.thc} % THC</span></div><div class="rrow sm"><span>${lab} ${sl.st==='ready'||sl.st==='dead'?'':pc+' %'}</span><span>${md.ic} ${md.nom}</span></div>
  ${rBar(pc,'#00E5FF','Avancement')}${rBar(sl.hp,'#3CFF9E','Santé')}${rBar(sl.q,'#FCEE0A','Qualité')}
  ${rBar(sl.w,'#4aa8ff','Eau')}${rBar(sl.N,'#3cff9e','Azote N')}${rBar(sl.P,'#ff9a1a','Phosphore P')}${rBar(sl.K,'#a58bff','Potassium K')}
  <div class="rrow sm"><span>pH ${sl.ph.toFixed(1)} <i class="sm">(idéal ${md.ph})</i></span><span>Lumière ${Math.round(f.L/1000)} k lm <i class="sm">(idéal ${Math.round(f.ideal/1000)} k)</i></span></div>
  ${sl.pest?`<p class="warn">⚠️ ${sl.pest==='mold'?'Moisissure':'Acariens'} détectés ! Traite vite.</p>`:''}
  ${f.cf<1?`<p class="warn">Cycle lumineux ${sl.cyc}/${24-sl.cyc} inadapté (${sl.st==='flo'?'12/12 requis':'18/6 conseillé'}).</p>`:''}</div>`;
  if(sl.st==='dead') return h+`<button class="btn wide" data-a="rclear" data-id="${i}">Évacuer la plante morte</button>`;
  if(sl.st==='ready') return h+`<button class="btn wide" data-a="rharvest" data-id="${i}">✂️ Récolter (${Math.round(sv.y*md.y*(sl.hp/100)*(.5+.5*sl.q/100)*(room==='ranch'?1.15:1))} g environ)</button>`;
  const c=k=>`${F.chem[k]||0}`;
  h+=`<div class="rcard"><h3>Soins</h3><div class="rbtns">
   <button data-a="rcare" data-id="${i}" data-v="water">💧 Arroser</button>
   <button data-a="rcare" data-id="${i}" data-v="N">🟩 N (${c('N')})</button><button data-a="rcare" data-id="${i}" data-v="P">🟧 P (${c('P')})</button><button data-a="rcare" data-id="${i}" data-v="K">🟪 K (${c('K')})</button>
   <button data-a="rcare" data-id="${i}" data-v="mixV">🥗 Mix croiss. 3-1-2</button><button data-a="rcare" data-id="${i}" data-v="mixF">🌸 Mix flor. 1-3-2</button>
   <button data-a="rcare" data-id="${i}" data-v="PHm">🔻 pH − (${c('PHm')})</button><button data-a="rcare" data-id="${i}" data-v="PHp">🔺 pH + (${c('PHp')})</button>
   <button data-a="rcare" data-id="${i}" data-v="CM">⚪ Cal-Mag (${c('CM')})</button><button data-a="rcare" data-id="${i}" data-v="ENZ">🧪 Enzymes (${c('ENZ')})</button>
   <button data-a="rcare" data-id="${i}" data-v="BOOST">🚀 Booster (${c('BOOST')})</button><button data-a="rcare" data-id="${i}" data-v="FONG">🍄 Fongicide (${c('FONG')})</button><button data-a="rcare" data-id="${i}" data-v="INSEC">🐛 Insecticide (${c('INSEC')})</button></div></div>
  <div class="rcard"><h3>Lumière</h3><div class="rbtns"><button class="${sl.cyc===18?'on':''}" data-a="rcycle" data-id="${i}" data-v="18">☀️ Cycle 18/6 (croissance)</button><button class="${sl.cyc===12?'on':''}" data-a="rcycle" data-id="${i}" data-v="12">🌙 Cycle 12/12 (floraison)</button></div>
  ${sl.st==='veg'&&pc>=50?`<button class="btn wide" data-a="rflower" data-id="${i}">🌸 Passer en floraison</button>`:''}
  ${!ROOMS[room].out?`<p class="sm">Lampe : ${sl.lamp?LID[sl.lamp].nom:'—'}</p><div class="rchips">${LAMP.filter(l=>(F.lamps[l.id]||0)>0||l.id===sl.lamp).map(l=>`<button class="${sl.lamp===l.id?'on':''}" data-a="rlamp" data-id="${i}" data-v="${l.id}">${l.ic} ${(l.lm/1000)|0} k lm</button>`).join('')}</div>`:'<p class="sm">Plein soleil du ranch (variable selon les jours).</p>'}</div>
  <button class="btn alt wide" data-a="rclear" data-id="${i}">Arracher la plante</button>`;
  return h;
}
function rShop(){
  const F=farm(); let h=`<div class="rchips big">${[['seeds','🌱 Graines'],['chem','🧴 Engrais & chimie'],['lamps','💡 Lampes'],['gear','🛠️ Matériel']].map(t=>`<button class="${RY.shop===t[0]?'on':''}" data-a="rshop" data-id="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  if(RY.shop==='seeds') STR.forEach(s=>{ const lock=F.rep<s.rep; h+=`<div class="rit ${lock?'lock':''}"><span class="ri">${s.ic}</span><div class="grow"><b>${s.nom}</b> <small>${s.ty} · ${s.thc} % THC</small><br><small>Croiss. ${s.veg} min · Flor. ${s.fl} min · ~${s.y} g · ${s.px} cr/g · ${'★'.repeat(s.d)}${'☆'.repeat(5-s.d)} · ${(s.lm/1000)|0} k lm</small></div>${lock?`<small>Rép. ${s.rep}</small>`:`<button class="btn sm" data-a="rbuy" data-id="seed:${s.id}">${fmt(s.sd)} cr<br>(×${F.seeds[s.id]||0})</button>`}</div>`; });
  else if(RY.shop==='chem') Object.keys(CHEM).forEach(k=>{ const c=CHEM[k]; h+=`<div class="rit"><span class="ri">${c.ic}</span><div class="grow"><b>${c.nom}</b><br><small>${c.sub}</small></div><button class="btn sm" data-a="rbuy" data-id="chem:${k}">${c.px} cr<br>(×${F.chem[k]||0})</button></div>`; });
  else if(RY.shop==='lamps') LAMP.forEach(l=>{ h+=`<div class="rit"><span class="ri">${l.ic}</span><div class="grow"><b>${l.nom}</b><br><small>${fmt(l.lm)} lumens · ${l.w} W (${(l.w/100).toFixed(1)} cr/min) · chaleur ${l.h}</small></div><button class="btn sm" data-a="rbuy" data-id="lamp:${l.id}">${fmt(l.px)} cr<br>(×${F.lamps[l.id]||0})</button></div>`; });
  else { const tp=[['fan','🌀 Ventilation','Réduit moisissure',2500],['filter','🧯 Filtre à charbon','−20 % de chaleur / odeur',4000],['irri','🚿 Irrigation auto','Arrose seule (consomme la citerne)',9000]];
    ['atelier','ranch'].forEach(room=>{ const R=F.rooms[room]; if(!R.on) return; h+=`<h3 class="rh">${ROOMS[room].ic} ${ROOMS[room].nom}</h3>`; tp.forEach(t=>{ const lv=R[t[0]]||0, max=t[0]==='irri'?1:3; h+=`<div class="rit"><div class="grow"><b>${t[1]}</b> <small>niv. ${lv}/${max}</small><br><small>${t[2]}</small></div><button class="btn sm" data-a="rbuy" data-id="gear:${room}:${t[0]}" ${lv>=max?'disabled':''}>${lv>=max?'Max':fmt(t[3]*(lv+1))+' cr'}</button></div>`; }); });
    h+=`<div class="rit"><div class="grow"><b>🛢️ Citerne +100 L</b><br><small>Capacité ${F.tank} L</small></div><button class="btn sm" data-a="rbuy" data-id="tank:0">1 200 cr</button></div>
    <div class="rit"><div class="grow"><b>🕴️ Pot-de-vin (−30 % de chaleur)</b><br><small>Fait baisser la pression partout</small></div><button class="btn sm" data-a="rbuy" data-id="bribe:0">${fmt(1500+Math.round(Math.max(F.heat.atelier,F.heat.ranch)*80))} cr</button></div>`; }
  return h;
}
function rStock(){
  const F=farm(); let h='';
  const ks=Object.keys(F.stock).filter(k=>F.stock[k].g>0);
  h+=`<div class="rcard"><h3>📦 Stock séché</h3>${ks.length?ks.map(k=>{ const s=F.stock[k], sv=SID[k], p=sellPrice(k,s.q);
    return `<div class="rit"><span class="ri">${sv.ic}</span><div class="grow"><b>${sv.nom}</b><br><small>${Math.floor(s.g)} g · qualité ${Math.round(s.q)} % · ${p.toFixed(1)} cr/g</small></div>
    <div class="rbtns tight"><button data-a="rsell" data-id="${k}" data-v="street10">Rue ×10 g</button><button data-a="rsell" data-id="${k}" data-v="street">Rue tout</button>${F.rep>=10?`<button data-a="rsell" data-id="${k}" data-v="contact">Contact</button>`:''}${F.rep>=30&&s.q>=65?`<button data-a="rsell" data-id="${k}" data-v="vip">VIP</button>`:''}</div></div>`; }).join(''):'<p>Rien en stock. Récolte une plante : elle sèche pendant 2 minutes.</p>'}
  <p class="sm">Rue : 75 % du prix, risqué. Contact (rép. 10) : prix normal. VIP (rép. 30, qualité 65 %) : 135 %. Les livraisons en voiture paient le mieux.</p></div>`;
  if((F.dry||[]).length) h+=`<div class="rcard"><h3>🧺 En séchage</h3>${F.dry.map(b=>`<div class="rrow sm"><span>${SID[b.sid].ic} ${SID[b.sid].nom} · ${Math.round(b.g)} g</span><span>${Math.ceil(b.t*60)} s</span></div>`).join('')}</div>`;
  return h;
}
function rNet(){
  const F=farm(); let h=`<div class="rcard"><p>Ton réseau te propose des coups à faire <b>au volant</b>. Les go-fast écoulent ta marchandise à prix fort (×2 à ×2,8) ; les courses clandestines se jouent à la mise. Une manche ratée = cargaison perdue et chaleur.</p></div>`;
  ILL.forEach(e=>{ const lock=S.lvl<e.lvl||F.rep<e.rep, best=bestCargo(e), few=S.cars.length<e.manches.length;
    const need=e.ill==='cargo'?`${e.cargo} g de marchandise`:`mise ${fmt(e.bet)} cr`;
    h+=`<div class="rit ${lock?'lock':''}"><span class="ri">${e.ill==='cargo'?'📦':'🏁'}</span><div class="grow"><b>${e.nom}</b><br><small>${e.txt}</small><br><small>${need} · prime ${fmt(e.gain)} cr · chaleur +${e.heat}</small></div>${lock?`<small>Niv. ${e.lvl}<br>Rép. ${e.rep}</small>`:`<button class="btn sm" data-a="illgo" data-id="${e.id}" ${(e.ill==='cargo'&&!best)||(e.ill==='bet'&&S.cr<e.bet)||few?'disabled':''}>Go</button>`}</div>`; });
  return h;
}
function bestCargo(e){ if(e.ill!=='cargo') return null; const F=farm(); let b=null; for(const k in F.stock){ const s=F.stock[k]; if(s.g>=e.cargo&&(!b||sellPrice(k,s.q)>sellPrice(b.sid,b.q))) b={sid:k,g:e.cargo,q:s.q}; } return b; }
/* ---------- actions ---------- */
Object.assign(ACT,{
  ranch(){ const F=farm(); F.found=1; ranchSim(); RY.tab='atelier'; RY.slot=null; openSheet({t:'ranch'}); },
  rtab(d){ RY.tab=d.id; RY.slot=null; if(d.v) RY.shop=d.v; renderSheet(); },
  rback(){ RY.slot=null; RY.pick=null; renderSheet(); },
  rshop(d){ RY.shop=d.id; renderSheet(); },
  rslot(d){ RY.slot=+d.id; RY.pick=null; renderSheet(); },
  rpick(d){ RY.pick=RY.pick||{}; RY.pick[d.id]=d.v; renderSheet(); },
  rplant(d){ const F=farm(), room=RY.tab, R=F.rooms[room], P=RY.pick||{}, i=+d.id; if(R.slots[i]) return;
    if((F.seeds[P.sid]||0)<1) return toast('Plus de graines'); const mp=MED[P.med].px; if(S.cr<mp) return toast('Pas assez de crédits');
    if(!ROOMS[room].out){ if((F.lamps[P.lamp]||0)<1) return toast('Pas de lampe'); }
    F.seeds[P.sid]--; S.cr-=mp; R.slots[i]=newPlant(P.sid,P.med,ROOMS[room].out?null:P.lamp); RY.pick=null; save(); renderSheet(); },
  rcare(d){ const F=farm(), sl=F.rooms[RY.tab].slots[+d.id], k=d.v; if(!sl||sl.st==='ready'||sl.st==='dead') return;
    const use=(c,n)=>{ if((F.chem[c]||0)<n){ toast('Il t’en faut : '+CHEM[c].nom); return false; } F.chem[c]-=n; return true; };
    if(k==='water'){ if((F.can||0)>0) F.can--; else { if(F.water<3) return toast('Citerne vide : remplis-la'); F.water-=3; } sl.w=Math.min(100,sl.w+38); }
    else if(k==='N'||k==='P'||k==='K'){ if(!use(k,1)) return; sl[k]=Math.min(100,sl[k]+20); }
    else if(k==='mixV'){ if((F.chem.N<3)||(F.chem.P<1)||(F.chem.K<2)) return toast('Il te faut 3 N, 1 P, 2 K'); F.chem.N-=3; F.chem.P-=1; F.chem.K-=2; sl.N=Math.min(100,sl.N+30); sl.P=Math.min(100,sl.P+10); sl.K=Math.min(100,sl.K+20); }
    else if(k==='mixF'){ if((F.chem.N<1)||(F.chem.P<3)||(F.chem.K<2)) return toast('Il te faut 1 N, 3 P, 2 K'); F.chem.N-=1; F.chem.P-=3; F.chem.K-=2; sl.N=Math.min(100,sl.N+10); sl.P=Math.min(100,sl.P+30); sl.K=Math.min(100,sl.K+20); }
    else if(k==='PHm'){ if(!use(k,1)) return; sl.ph-=.45; } else if(k==='PHp'){ if(!use(k,1)) return; sl.ph+=.45; }
    else if(k==='CM'){ if(!use(k,1)) return; sl.hp=Math.min(100,sl.hp+8); sl.N=Math.min(100,sl.N+6); sl.P=Math.min(100,sl.P+6); sl.K=Math.min(100,sl.K+6); }
    else if(k==='ENZ'){ if(!use(k,1)) return; sl.enz=4; } else if(k==='BOOST'){ if(sl.st!=='flo') return toast('À utiliser en floraison'); if(!use(k,1)) return; sl.boost=4; sl.q=Math.min(100,sl.q+6); }
    else if(k==='FONG'){ if(sl.pest!=='mold'&&sl.pest) return toast('Ce n’est pas de la moisissure'); if(!use(k,1)) return; sl.pest=null; sl.prot=4; }
    else if(k==='INSEC'){ if(sl.pest&&sl.pest!=='mites') return toast('Ce n’est pas des acariens'); if(!use(k,1)) return; sl.pest=null; sl.prot=4; }
    save(); renderSheet(); },
  rcycle(d){ const sl=farm().rooms[RY.tab].slots[+d.id]; if(sl){ sl.cyc=+d.v; save(); renderSheet(); } },
  rflower(d){ const sl=farm().rooms[RY.tab].slots[+d.id]; if(sl&&sl.st==='veg'){ sl.st='flo'; sl.stAge=0; sl.cyc=12; save(); renderSheet(); } },
  rlamp(d){ const F=farm(), sl=F.rooms[RY.tab].slots[+d.id]; if(!sl||sl.lamp===d.v) return; if((F.lamps[d.v]||0)<1) return; sl.lamp=d.v; save(); renderSheet(); },
  rclear(d){ const R=farm().rooms[RY.tab]; R.slots[+d.id]=null; RY.slot=null; save(); renderSheet(); },
  rharvest(d){ const F=farm(), R=F.rooms[RY.tab], sl=R.slots[+d.id]; if(!sl||sl.st!=='ready') return; const sv=SID[sl.sid], md=MED[sl.med];
    const g=Math.max(1,sv.y*md.y*(sl.hp/100)*(.5+.5*sl.q/100)*(RY.tab==='ranch'?1.15:1)); (F.dry=F.dry||[]).push({sid:sl.sid,g,q:sl.q,t:2});
    F.stats.harv++; F.rep+=Math.round(sv.d*.6*10)/10; R.slots[+d.id]=null; RY.slot=null; toast(`Récolte : ${Math.round(g)} g de ${sv.nom}, séchage 2 min`); save(); renderSheet(); },
  rwater(){ const F=farm(), n=Math.floor(Math.min(F.tank-F.water,S.cr)); if(n<1) return toast(n<1&&S.cr<1?'Pas de crédits':'Citerne pleine'); F.water+=n; S.cr-=n; save(); renderSheet(); },
  rbuy(d){ const F=farm(), [t,a,b]=d.id.split(':');
    const pay=n=>{ if(S.cr<n){ toast('Pas assez de crédits'); return false; } S.cr-=n; return true; };
    if(t==='seed'){ const s=SID[a]; if(F.rep<s.rep||!pay(s.sd)) return; F.seeds[a]=(F.seeds[a]||0)+1; }
    else if(t==='chem'){ if(!pay(CHEM[a].px)) return; F.chem[a]=(F.chem[a]||0)+1; }
    else if(t==='lamp'){ const l=LID[a]; if(!pay(l.px)) return; F.lamps[a]=(F.lamps[a]||0)+1; }
    else if(t==='gear'){ const R=F.rooms[a], pr={fan:2500,filter:4000,irri:9000}[b], max=b==='irri'?1:3; if((R[b]||0)>=max||!pay(pr*((R[b]||0)+1))) return; R[b]=(R[b]||0)+1; }
    else if(t==='tank'){ if(!pay(1200)) return; F.tank+=100; }
    else if(t==='bribe'){ const c=1500+Math.round(Math.max(F.heat.atelier,F.heat.ranch)*80); if(!pay(c)) return; F.heat.atelier*=.7; F.heat.ranch*=.7; }
    save(); renderSheet(); },
  rbuyslot(d){ const F=farm(), R=F.rooms[d.id], RM=ROOMS[d.id], c=1500+R.slots.length*900; if(R.slots.length>=RM.max) return; if(S.cr<c) return toast('Pas assez de crédits'); S.cr-=c; R.extra=(R.extra||0)+1; R.slots.push(null); save(); renderSheet(); },
  rbuyranch(){ const F=farm(); if(S.cr<30000||F.rep<12) return; S.cr-=30000; F.rooms.ranch.on=1; RY.tab='ranch'; save(); renderSheet(); },
  rsell(d){ const F=farm(), s=F.stock[d.id]; if(!s||s.g<1) return; const ch=d.v, p=sellPrice(d.id,s.q); let g=ch==='street10'?Math.min(10,s.g):s.g, m=ch.startsWith('street')?.75:ch==='contact'?1:1.35, ht=ch.startsWith('street')?g*.35:ch==='contact'?g*.12:g*.18;
    if(ch==='vip'&&s.q<65) return toast('Qualité insuffisante');
    g=Math.floor(g); const gain=Math.round(g*p*m); s.g-=g; S.cr+=gain; F.stats.sold+=g; F.rep+=g*.02; karmaAdd(-g*(ch.startsWith('street')?.04:.02)); F.heat.atelier=Math.min(100,F.heat.atelier+ht*.4); F.heat.ranch=Math.min(100,F.heat.ranch+ht*.4); toast(`${g} g vendus, +${fmt(gain)} cr`); save(); renderSheet(); },
  illgo(d){ const e=ILL.find(x=>x.id===d.id), F=farm(); if(!e||S.lvl<e.lvl||F.rep<e.rep||S.cars.length<e.manches.length) return;
    let cargo=null; if(e.ill==='cargo'){ cargo=bestCargo(e); if(!cargo) return toast('Pas assez de marchandise'); } else { if(S.cr<e.bet) return toast('Pas assez pour la mise'); }
    closeSheet(); ACT.ev({id:e.id}); if(R&&R.ev&&R.ev.id===e.id) R.cargo=cargo; }
});
function illResolve(ev,pay,win,pod){
  if(!ev.ill){ if(win) karmaAdd(Math.min(3,1+(ev.lvl>>2))); else if(pod) karmaAdd(.5); return; } const F=farm(); let msg='';
  if(ev.ill==='cargo'){ const c=R.cargo; if(!c) return; const s=F.stock[c.sid]; if(s) s.g=Math.max(0,s.g-c.g);
    if(pod){ const v=Math.round(c.g*sellPrice(c.sid,c.q)*ev.prem*Math.max(.6,pay)); S.cr+=v; F.rep+=ev.rep*.25+1; F.stats.deliv++; const h=ev.heat*.5; F.heat.atelier=Math.min(100,F.heat.atelier+h); F.heat.ranch=Math.min(100,F.heat.ranch+h); karmaAdd(-2); msg=`📦 <b>Livraison réussie</b> : ${c.g} g écoulés, +${fmt(v)} cr.`; }
    else{ F.stats.busted++; karmaAdd(-3); const fine=Math.round(S.cr*.08); S.cr-=fine; F.heat.atelier=Math.min(100,F.heat.atelier+ev.heat); F.heat.ranch=Math.min(100,F.heat.ranch+ev.heat); msg=`🚔 <b>Interpellé !</b> Cargaison saisie, amende ${fmt(fine)} cr, chaleur en hausse.`; } }
  else{ if(win){ karmaAdd(-1); S.cr+=ev.bet; F.rep+=1+ev.rep*.1; msg=`🏁 <b>Course gagnée</b> : +${fmt(ev.bet)} cr de mise ramassée.`; }
    else if(pod){ msg='🏁 Tu sauves ta mise, mais sans gloire.'; }
    else { S.cr=Math.max(0,S.cr-ev.bet); msg=`🏁 <b>Perdu</b> : la mise de ${fmt(ev.bet)} cr est partie.`; }
    F.heat.atelier=Math.min(100,F.heat.atelier+ev.heat*.3); }
  save(); setTimeout(()=>banner(msg),400);
}
setInterval(()=>{ try{ if(S&&S.farm&&S.farm.found){ ranchSim(); if(sheet&&sheet.t==='ranch'&&!RY.down&&Date.now()-RY.lastTick>3500){ RY.lastTick=Date.now(); renderSheet(); } } }catch(_){} },1000);
document.addEventListener('pointerdown',()=>{RY.down=true; RY.lastTick=Date.now();},true); document.addEventListener('pointerup',()=>{RY.down=false; RY.lastTick=Date.now();},true);
/* ---------- entrée secrète dans le garage 3D ---------- */
function hubSecret(sc,box,neon){
  const px=34.55, pz=-16;
  box(.06,.12,3.4,px-.04,.9,pz,neon(0x3CFF9E)); box(.06,3.6,.06,px-.04,2.6,pz+1.7,neon(0x18301f)); /* fine ligne verte : l'indice */
  HUB.sec={x:33.6,z:pz};
}
