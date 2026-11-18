/* ===== v0.52 : progression par niveaux, labo au niveau 8 + tuto, drag étendu ===== */
const LAB_LVL=8;
const labLv=()=>S&&S.age18===true?S.lvl:0;
function tabOk(id){ return id!=='labo'||labLv()>=LAB_LVL; }
function evDi(ev){ return ev&&ev.di!=null?ev.di:EVENTS.indexOf(ev); }
/* ---- nouvelles épreuves (di = difficulté équivalente dans l'ancienne échelle) ---- */
[
 {id:'d2',nom:'Quart de mile du port',lvl:2,gain:1000,xp:45,di:2,opp:{t:[1,1],up:0,etat:[35,60]},manches:[{d:'drag',m:'sec'}]},
 {id:'d3',nom:'Drag sous les néons',lvl:4,gain:2400,xp:100,di:4,opp:{t:[1,2],up:1,etat:[55,85]},manches:[{d:'drag',m:'sec'}]},
 {id:'a1',nom:'Drag Arcade I · boules de boost',lvl:5,gain:3600,xp:140,di:5,opp:{t:[2,3],up:1,etat:[65,95]},manches:[{d:'drag',m:'sec',bon:1}]},
 {id:'d4',nom:'Duel des pistards',lvl:6,gain:5200,xp:180,di:5.5,opp:{t:[2,3],up:1,etat:[75,100]},manches:[{d:'drag',m:'sec'},{d:'drag',m:'pluie'}]},
 {id:'a2',nom:'Drag Arcade II · piste piégée',lvl:8,gain:9000,xp:290,di:6.5,opp:{t:[3,4],up:2,etat:[85,100]},manches:[{d:'drag',m:'sec',bon:2}]},
 {id:'d5',nom:'Légende du quart de mile',lvl:9,gain:16000,xp:380,di:7,opp:{t:[4,5],up:2,etat:[90,100]},manches:[{d:'drag',m:'sec'},{d:'drag',m:'sec'},{d:'drag',m:'pluie'}]},
 {id:'a3',nom:'Drag Arcade III · portes nitro',lvl:10,gain:26000,xp:480,di:7.5,opp:{t:[4,5],up:3,etat:[95,100]},manches:[{d:'drag',m:'sec',bon:3},{d:'drag',m:'pluie',bon:3}]}
].forEach(e=>{ if(!EVENTS.some(x=>x.id===e.id)) EVENTS.push(e); });
EVENTS.forEach(e=>{ if(e.di==null) e.di=EVENTS.indexOf(e); }); EVENTS.sort((a,b)=>a.lvl-b.lvl);
if(typeof ILL!=='undefined') ILL.forEach(e=>{ if(!e._l8){ e._l8=1; e.lvl=Math.max(LAB_LVL,LAB_LVL+Math.floor((e.lvl-2)/3)); } });
{ const a=DEST.find(d=>d.id==='atelier'), r=DEST.find(d=>d.id==='ranch');
  if(a){ a.ok=()=>labLv()>=LAB_LVL&&!!farm().found; Object.defineProperty(a,'why',{get(){ return labLv()<LAB_LVL?'Niveau '+LAB_LVL+' requis':'Trouve la cloison dans le garage'; }}); }
  if(r){ r.ok=()=>labLv()>=LAB_LVL&&!!farm().rooms.ranch.on; } }
const _ranch28=ACT.ranch; ACT.ranch=function(){ if(labLv()<LAB_LVL) return toast('🔒 Le labo s’ouvre au niveau '+LAB_LVL); return _ranch28.apply(this,arguments); };
const _lo28=ACT.labopen; ACT.labopen=function(){ if(labLv()<LAB_LVL) return toast('🔒 Le labo s’ouvre au niveau '+LAB_LVL); return _lo28.apply(this,arguments); };
const _wgo28=ACT.wgo; ACT.wgo=function(d){ const id=d&&d.id; if(id&&id.startsWith('arc_')&&ARC_LV[id.slice(4)]&&S.lvl<ARC_LV[id.slice(4)]) return toast('🔒 Niveau '+ARC_LV[id.slice(4)]+' requis'); return _wgo28.apply(this,arguments); };
/* ---- déblocages : liste par niveau ---- */
const UNL=[
 [2,'🏝️','Plage Irie','Bar tiki, feu de camp, tes voitures sur le sable : un lieu pour souffler.'],
 [3,'🌃','Rue Néon','Ruelle sous la pluie, vitrines et départ de course.'],
 [3,'🕹️','Salle d’arcade','Elle ouvre avec un premier jeu : le Pousse-Nitro. Les autres arrivent avec tes niveaux.'],
 [4,'🔧','Pit Stop (arcade)','Change les roues le plus vite possible.'],
 [5,'🚦','Drag Start (arcade)','Le départ parfait et les rapports, en mini-jeu.'],
 [6,'🌀','Reflex Drift (arcade)','Dérape au bon moment pour enchaîner les points.'],
 [7,'🎰','Pinball (arcade)','Tables, radar, capture de pièces. Plus ton niveau pinball monte, plus de tables s’ouvrent.'],
 [8,'🌿','Labo clandestin','Une cloison s’ouvre dans ton garage : culture, séchage, vente… et les courses clandestines, le karma et la police. Un tuto complet t’y attend.'],
 [8,'🌾','Ranch & Réseau','Grâce à la réputation, un grand champ extérieur et des livraisons.']
];
function unlFor(l){
  const out=UNL.filter(u=>u[0]===l).map(u=>[u[1],u[2],u[3]]);
  EVENTS.filter(e=>e.lvl===l&&l>1&&!e.ill).forEach(e=>out.push(['🏁',e.nom,'Nouvelle épreuve : '+e.manches.map(m=>DISC[m.d].nom+(m.bon?' (bonus arcade)':'')).join(', ')+'.']));
  POD_LVL.forEach((p,i)=>{ if(p===l&&l>1) out.push(['🏛️','Podium n°'+(i+1),'Un emplacement de plus pour exposer une voiture dans ton garage.']); });
  return out;
}
const _addXP28=addXP;
addXP=function(n){ const l0=S.lvl; _addXP28.apply(this,arguments); if(S.lvl>l0){ S.unlQ=S.unlQ||[]; for(let l=l0+1;l<=S.lvl;l++){ const it=unlFor(l); if(it.length) S.unlQ.push({l,it}); } try{ save(); }catch(_){} } };
setInterval(()=>{ try{
  if(!S||!S.cars) return;
  if(labLv()>=LAB_LVL&&!S.labSeen){ S.labSeen=1; if(!(S.unlQ||[]).some(q=>q.l===8)){ S.unlQ=S.unlQ||[]; S.unlQ.push({l:8,it:unlFor(8)}); } }
  if(!(S.unlQ&&S.unlQ.length)||sheet||(typeof AOV!=='undefined'&&AOV)||document.body.classList.contains('racing')||view==='race') return;
  const q=S.unlQ.shift(); save(); openSheet({t:'unl',l:q.l,it:q.it});
}catch(_){} },1800);
function ulSheet(X){
  if(!sheet||sheet.t!=='unl') return false;
  const lab=sheet.it.some(x=>x[1]==='Labo clandestin');
  $('sheet').innerHTML=`<div class="tuto gtu">${X}<div class="tu-ic">🔓</div><h2>Niveau ${sheet.l} : du nouveau !</h2>
   <div class="ulist">${sheet.it.map(x=>`<div class="ul-r"><i>${x[0]}</i><div><b>${x[1]}</b><small>${x[2]}</small></div></div>`).join('')}</div>
   <div class="tu-btns"><button class="btn alt" data-a="close">Plus tard</button>${lab?'<button class="btn" data-a="ulgo" data-id="hub">🌿 Aller au garage</button>':'<button class="btn" data-a="close">Super !</button>'}</div></div>`;
  return true;
}
ACT.ulgo=d=>{ closeSheet(); try{ ACT.tab({id:d.id}); }catch(_){} };
/* ---- tuto du labo : pas à pas, pour des joueurs qui ne connaissent pas ---- */
GT.length=0;
GT.push(
 {ic:'🌿',t:'Bienvenue dans ton labo',x:'Tu viens de débloquer le <b>labo clandestin</b>. Ici, tu <b>cultives des plantes</b>, tu les <b>sèches</b>, puis tu les <b>vends</b> pour gagner beaucoup de crédits. Ces crédits servent à acheter des voitures, des pièces, et à jouer des <b>courses illégales</b> mieux payées. <b>Attention :</b> c’est risqué. La <b>police</b> peut s’en mêler et ton <b>karma</b> baisse. Ce tuto explique tout, étape par étape. Tu peux le relancer avec le bouton ❓. <b>Kit de départ offert</b> : 2 graines, 2 lampes et un peu d’engrais.'},
 {ic:'🕹️',t:'Se déplacer et agir',x:'Joystick à gauche pour marcher, glisse le doigt sur l’écran pour regarder autour. <b>Approche-toi</b> d’un plot (bac), du robinet, du séchoir ou du bureau : des <b>boutons apparaissent en haut de l’écran</b>. Tout se fait avec ces boutons. Le <b>🎒</b> ouvre ton sac à dos.'},
 {ic:'🪴',t:'Étape 1 · Planter',x:'Un <b>plot</b> est un bac où pousse <b>une</b> plante. Va sur un plot vide et appuie <b>🌱 Planter</b>. Tu choisis 3 choses : la <b>graine</b> (la variété), le <b>support</b> (terreau = simple, coco = plus rapide, hydro = très rapide mais exigeant) et la <b>lampe</b> (la lumière fait grandir). Pour ta première fois : <b>terreau + une lampe néon</b>.'},
 {ic:'💧',t:'Étape 2 · L’eau',x:'Une plante a soif. Va au <b>point d’eau</b> (coin bleu) et prends <b>🪣 Remplir l’arrosoir</b> (6 charges). Puis, devant la plante, appuie <b>💧 Arroser</b>. Garde l’eau entre <b>30 % et 90 %</b> : trop sèche, elle s’abîme ; trop mouillée, elle pourrit. La citerne se remplit contre quelques crédits.'},
 {ic:'🌱',t:'Étape 3 · Les 4 phases',x:'Chaque plante passe par : <b>Germination</b> (courte) → <b>Croissance</b> (elle fait des feuilles) → <b>Floraison</b> (elle fait la récolte) → <b>Prête ✨</b>. Le cercle au sol devient vert quand elle est prête. Le temps passe même quand le jeu est fermé : tu peux revenir plus tard. Une plante morte doit être évacuée.'},
 {ic:'🟩',t:'Pourquoi l’azote (N) ?',x:'Dans la <b>📋 Fiche</b> d’un plot, tu vois 3 barres : <b>N, P, K</b>. Ce sont les « repas » de la plante, comme pour un humain : <b>N = azote</b> → les <b>feuilles et la croissance</b> (surtout pendant la croissance). Pas assez d’azote : feuilles jaunes et plante qui stagne. La barre doit rester entre <b>35 et 80</b>. Trop d’engrais, c’est pire que pas assez : la plante « brûle ».'},
 {ic:'🟧',t:'Pourquoi P et K ?',x:'<b>P = phosphore</b> → les <b>racines</b> et le <b>démarrage des fleurs</b>. <b>K = potassium</b> → la <b>qualité</b> et le poids de la récolte (et la résistance). En <b>croissance</b>, pense surtout <b>azote</b>. En <b>floraison</b>, pense <b>P et K</b>. Quand une barre baisse (la plante consomme), ajoute un engrais de la même couleur depuis la Fiche. Le <b>🚀 Booster de floraison</b> donne un coup de pouce final.'},
 {ic:'🔻',t:'Le pH, pourquoi − et + ?',x:'Le <b>pH</b> mesure si l’eau/le sol est <b>acide</b> ou <b>basique</b>. Si le pH est mauvais, la plante <b>n’arrive plus à absorber</b> ses engrais, même s’il y en a beaucoup. Chaque support a son pH idéal (indiqué dans la Fiche : environ <b>6</b>). Le pH dérive tout seul avec le temps. <b>pH trop haut</b> → utilise <b>🔻 pH −</b>. <b>pH trop bas</b> → utilise <b>🔺 pH +</b>. Un seul produit à la fois, et regarde le chiffre.'},
 {ic:'⚪',t:'Cal-Mag, lampes et soins',x:'<b>Cal-Mag ⚪</b> évite les carences (feuilles tachetées) surtout avec la lumière forte. Plus une <b>lampe</b> est puissante, plus elle fait pousser vite, mais plus elle crée de <b>chaleur</b> (la police remarque). Si tu vois <b>⚪ moisissure</b> ou <b>🔴 acariens</b>, soigne avec <b>fongicide</b> ou <b>insecticide</b> avant que la santé tombe.'},
 {ic:'✂️',t:'Étape 4 · Récolter et sécher',x:'Plante prête → <b>✂️ Récolter</b>. La récolte va au <b>séchoir</b> (coin orange) pendant quelques minutes. Ensuite elle entre dans ton <b>stock</b>. Plus la <b>santé</b>, la <b>qualité</b> et l’équilibre N-P-K-pH ont été bons, plus le <b>prix</b> sera élevé.'},
 {ic:'💰',t:'Étape 5 · Vendre',x:'Au <b>bureau 🚗 Réseau</b>, onglet <b>Stock &amp; vente</b>, tu choisis où vendre : la <b>rue</b> (rapide, mais risqué et mauvais pour le karma), le <b>dealer</b> (correct), ou en <b>gros</b> (mieux payé, demande de la réputation). Tu peux aussi <b>conditionner</b> ta récolte en lots à la table de conditionnement.'},
 {ic:'🚨',t:'Chaleur, police et karma',x:'Plus tu produis et vends, plus la <b>chaleur 🚨</b> monte. À 100 %, <b>descente de police</b> : saisie et amende. Baisse-la avec <b>ventilation, filtres</b> ou <b>pot-de-vin</b>. Le <b>karma</b> reflète tes choix : <b>courses légales et dons = positif</b>, <b>ventes de rue et deals = négatif</b>. Un karma négatif attire la police, même pendant tes courses normales. Les dons te permettent de le remonter.'},
 {ic:'🏁',t:'Le lien avec les courses',x:'Dans <b>Missions</b> : les <b>go-fast</b> (tu livres ta marchandise pendant une course, la police peut te poursuivre) et les <b>courses à mise</b> (tu paries des crédits). Elles paient plus, mais font monter la <b>chaleur</b> et baisser le <b>karma</b>. Ta <b>réputation</b> grimpe avec les livraisons réussies et ouvre le <b>Ranch 🌾</b> (24 plots en plein air).'},
 {ic:'🎒',t:'Ta première culture : la check-list',x:'<b>1.</b> Plante 1 graine (terreau + lampe néon). <b>2.</b> Remplis l’arrosoir et arrose. <b>3.</b> Ouvre la Fiche : garde N, P, K entre 35 et 80 et le pH près de l’idéal. <b>4.</b> Attends le cercle vert, puis <b>récolte</b>. <b>5.</b> Laisse sécher, puis <b>vends</b> au bureau. Le <b>🎒</b> te rappelle où utiliser chaque objet. Bonne pousse !'}
);
/* ---- drag arcade : boules de boost, flaques d'huile, portes nitro, changement de voie ---- */
const _bind28=bindRace;
bindRace=function(){ _bind28.apply(this,arguments); try{ if(RC&&RC.kind==='race'&&RC.mn&&RC.mn.bon&&RS&&!RS.dbon) dragBonInit(); }catch(e){ console.error(e); } };
function dragBonInit(){
  const tk=RC.tk, Pa=RS.path, tier=RC.mn.bon, P=RC.P, items=[]; RS.dbon=true; RC.dbon={tier,items,n:0,hit:0};
  const lanes=[-2.2,2.2]; RC.laneT=P.lane<0?-2.2:2.2; P.lane=RC.laneT;
  let s=55; while(s<tk.L-45){ items.push({t:'orb',s,lane:lanes[rint(0,1)]}); s+=rnd(32,50); }
  if(tier>=2){ s=95; while(s<tk.L-60){ const it={t:'oil',s,lane:lanes[rint(0,1)]}; if(!items.some(o=>Math.abs(o.s-it.s)<14&&o.lane===it.lane)) items.push(it); s+=rnd(80,115); } }
  if(tier>=3){ s=130; while(s<tk.L-70){ items.push({t:'gate',s,lane:lanes[rint(0,1)]}); s+=rnd(105,140); } }
  const sc=RS.scene, gO=new THREE.SphereGeometry(.62,14,10), mO=new THREE.MeshBasicMaterial({color:0x3cff9e}), gG=new THREE.BoxGeometry(.28,3.4,.28), gB=new THREE.BoxGeometry(.3,.3,3.6), mG=new THREE.MeshBasicMaterial({color:0xffd400});
  const gOil=new THREE.CircleGeometry(1.7,20), mOil=new THREE.MeshBasicMaterial({color:0x3a1060,transparent:true,opacity:.9});
  items.forEach(it=>{ const p=pathAt(Pa,it.s,it.lane); let m;
    if(it.t==='orb'){ m=new THREE.Mesh(gO,mO); m.position.set(p.x,1.15,p.z); }
    else if(it.t==='oil'){ m=new THREE.Mesh(gOil,mOil); m.rotation.x=-Math.PI/2; m.position.set(p.x,.07,p.z); }
    else { m=new THREE.Group(); const l=new THREE.Mesh(gG,mG), r=new THREE.Mesh(gG,mG), b=new THREE.Mesh(gB,mG); l.position.set(0,1.7,-1.8); r.position.set(0,1.7,1.8); b.position.set(0,3.3,0); m.add(l); m.add(r); m.add(b); m.position.set(p.x,0,p.z); m.rotation.y=-p.th; }
    sc.add(m); it.m=m; });
  const w=$('rslot')&&$('rslot').parentNode; if(w&&!w.querySelector('#laneBtn')) w.insertAdjacentHTML('beforeend','<button id="laneBtn" class="lanebtn" data-a="lane">⇄ VOIE</button>');
  if(!RC.keyL){ RC.keyL=e=>{ if(!RC||!RC.dbon) return; if(['ArrowLeft','ArrowRight','KeyQ','KeyE'].includes(e.code)) ACT.lane(); }; document.addEventListener('keydown',RC.keyL); }
}
ACT.lane=function(){ if(!RC||!RC.dbon||RC.done) return; RC.laneT=-RC.laneT; try{ navigator.vibrate&&navigator.vibrate(15); }catch(_){} };
const _tick28=tick;
tick=function(dt){
  _tick28.apply(this,arguments);
  const D=RC&&RC.dbon; if(!D||RC.kind!=='race'||RC.clock<0) return; const P=RC.P;
  P.lane+=(RC.laneT-P.lane)*Math.min(1,dt*7);
  for(const it of D.items){ if(it.got||Math.abs(P.x-it.s)>2.3||Math.abs(P.lane-it.lane)>1.35) continue; it.got=1; if(it.m) it.m.visible=(it.t==='oil');
    if(it.t==='orb'){ P.boostT=Math.max(P.boostT,1.15); D.n++; S.cr+=25; flash('BOOST ! +25 cr','#3CFF9E',.8); try{ ui('coins'); }catch(_){} }
    else if(it.t==='oil'){ P.v*=.82; P.boostT=0; D.hit++; flash('FLAQUE D’HUILE !','#FF4D6D',1); try{ navigator.vibrate&&navigator.vibrate([60,40,60]); }catch(_){} }
    else{ P.nitroT=Math.max(P.nitroT,1.5); P.nit=(P.nit||0); D.n++; S.cr+=60; flash('PORTE NITRO ! +60 cr','#FFD400',1); try{ ui('up'); }catch(_){} } }
  for(const it of D.items){ if(it.t==='orb'&&!it.got&&it.m) it.m.position.y=1.15+.22*Math.sin(RC.clock*4+it.s); }
};
const _leave28=leaveRace; leaveRace=function(){ try{ if(RC&&RC.keyL){ document.removeEventListener('keydown',RC.keyL); RC.keyL=null; } }catch(_){} return _leave28.apply(this,arguments); };
