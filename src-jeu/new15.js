/* ===== v0.23 : sac à dos (inventaire) + tuto complet du labo caché ===== */
const GT=[
 {ic:'🚪',t:'Tu as trouvé le labo !',x:'Derrière la cloison du garage se cache <b>ton labo clandestin</b> : un hangar où tu fais pousser, sèches et vends ta récolte. L’argent gagné ici sert à acheter des voitures, des pièces, et à payer des courses illégales. <b>Kit de départ offert</b> : 2 graines de Northern Lights, 2 lampes néon et un peu d’engrais.'},
 {ic:'🕹️',t:'Se déplacer & agir',x:'Joystick à gauche pour marcher, glisse le doigt sur la scène pour regarder autour. <b>Approche-toi</b> d’un plot, du robinet, du bureau ou d’une porte : des <b>boutons s’affichent en haut de l’écran</b>. C’est comme ça qu’on fait tout. Le bouton <b>🎒</b> ouvre ton sac, <b>❓</b> relance ce tuto.'},
 {ic:'🪴',t:'1 · Poser un plot',x:'Un <b>plot</b> = un bac où pousse une plante. Tu en as 6 au départ. Le cercle <b>jaune « ＋ »</b> est le prochain emplacement à acheter (jusqu’à 12 dans l’atelier). Va sur un plot vide et appuie <b>🌱 Planter</b> : choisis la graine, le support (terreau, coco, hydro) et la lampe.'},
 {ic:'💧',t:'2 · L’eau',x:'Va au <b>point d’eau (coin bleu, à gauche)</b> : <b>🪣 Remplir l’arrosoir</b> (6 charges, tirées de la citerne). Ensuite, devant une plante, appuie <b>💧 Arroser</b>. Une plante assoiffée (eau &lt; 30 %) perd de la santé. La citerne se remplit à <b>1 cr par litre</b>.'},
 {ic:'🌱',t:'3 · Le cycle de la plante',x:'<b>Germination</b> (courte) → <b>Croissance</b> → <b>Floraison</b> → <b>Prête ✨</b> (le cercle au sol devient vert et pulse). Chaque variété a sa durée. Une plante qui meurt (manque d’eau, maladie) est à évacuer. Le temps passe aussi quand le jeu est fermé.'},
 {ic:'🧪',t:'4 · Engrais, pH, lampes',x:'Dans la <b>📋 Fiche</b> d’un plot : N-P-K (vert/orange/violet), <b>pH</b> à garder proche de 6 (±), Cal-Mag, enzymes, booster de floraison. Une lampe plus puissante = plus de lumens = meilleure croissance, mais plus de <b>chaleur</b>. Moisissures ⚪ et acariens 🔴 s’soignent avec fongicide / insecticide.'},
 {ic:'✂️',t:'5 · Récolter, sécher, vendre',x:'Plante prête → <b>✂️ Récolter</b>. La récolte va <b>sécher</b> au séchoir (coin orange, quelques minutes) puis entre dans ton <b>stock</b>. Au <b>bureau 🚗 Réseau</b> → <b>Stock &amp; vente</b> : vends à la rue (rapide, risqué), au dealer ou en gros. La qualité fait le prix.'},
 {ic:'🚨',t:'6 · Chaleur & karma',x:'Plus tu produis et vends, plus la <b>chaleur 🚨</b> monte (barre en haut à droite). À 100 %, <b>descente de police</b> : saisie et amende. Baisse-la avec ventilation, filtres, ou en pot-de-vin. Le <b>karma</b> change selon tes choix : dons et courses légales = positif, vente de rue et deals = négatif. Il influe sur les prix et les primes.'},
 {ic:'🏁',t:'7 · Le lien avec les courses',x:'Au bureau, onglet <b>Missions</b> : go-fast (livre de la marchandise de ton stock en course) et courses à mise. Tu gagnes des crédits, de la réputation et de la chaleur. Plus ta <b>réputation</b> monte, plus il y a de missions — et le <b>Ranch 🌾</b> (porte à gauche) se débloque : un grand champ extérieur avec 24 plots.'},
 {ic:'🎒',t:'8 · Ton sac à dos',x:'Le <b>🎒</b> liste tout ce que tu possèdes <b>et où l’utiliser</b> : arrosoir et citerne, graines, engrais, lampes, séchoir, stock à vendre, cargaison. Rien à gérer à la main : le jeu prend ce qu’il faut automatiquement. Première étape conseillée : <b>pose et plante un premier plot, remplis l’arrosoir, arrose</b>. Bonne pousse !'}
];
function giveKit(){ const F=farm(); if(F.kit) return; F.kit=1; F.seeds.nl=(F.seeds.nl||0)+2; F.can=6; save(); }
function gtutoSheet(X){
  if(!sheet||sheet.t!=='gtuto') return false;
  const i=sheet.i||0, T=GT[i], last=i===GT.length-1;
  $('sheet').innerHTML=`<div class="tuto gtu">${X}<div class="tu-ic">${T.ic}</div><h2>${T.t}</h2><p>${T.x}</p>
   <div class="tu-dots">${GT.map((_,k)=>`<i class="${k===i?'on':k<i?'d':''}"></i>`).join('')}</div>
   <div class="tu-btns">${i?'<button class="btn alt" data-a="gtunext" data-id="-1">‹ Retour</button>':'<button class="btn alt" data-a="close">Passer</button>'}<button class="btn" data-a="${last?'close':'gtunext'}" data-id="1">${last?'C’est parti !':'Suivant ›'}</button></div></div>`;
  return true;
}
ACT.gtunext=d=>{ if(!sheet||sheet.t!=='gtuto') return; sheet.i=clamp((sheet.i||0)+(+d.id),0,GT.length-1); renderSheet(); $('sheet').scrollTop=0; };
ACT.gtuto=()=>{ giveKit(); farm().tutoSeen=1; openSheet({t:'gtuto',i:0}); };
function invRow(ic,n,q,where){ return `<div class="inv-r"><span class="inv-i">${ic}</span><div class="inv-t"><b>${n}</b><small>${where||''}</small></div><span class="inv-q">${q}</span></div>`; }
function invSheet(X){
  if(!sheet||sheet.t!=='inv') return false;
  const F=farm(), sec=(t,b)=>b?`<div class="inv-s"><h3>${t}</h3>${b}</div>`:'';
  const seeds=STR.filter(s=>(F.seeds[s.id]||0)>0).map(s=>invRow(s.ic,s.nom,'×'+F.seeds[s.id],`${s.ty} · ${s.veg+s.fl} sem. · à planter sur un plot vide`)).join('');
  const chem=Object.keys(CHEM).filter(k=>(F.chem[k]||0)>0).map(k=>invRow(CHEM[k].ic,CHEM[k].nom,'×'+F.chem[k],CHEM[k].sub+' · dans la Fiche d’un plot')).join('');
  const lamps=LAMP.filter(l=>(F.lamps[l.id]||0)>0).map(l=>invRow(l.ic,l.nom,'×'+F.lamps[l.id],`${l.lm.toLocaleString('fr')} lm · ${l.w} W · choisie en plantant`)).join('');
  const stock=Object.keys(F.stock).filter(k=>F.stock[k].g>=.5).map(k=>invRow(SID[k].ic,SID[k].nom+' (sec)',Math.floor(F.stock[k].g)+' g',`qualité ${Math.round(F.stock[k].q)} % · à vendre au bureau 🚗`)).join('');
  const dry=(F.dry||[]).map(b=>invRow(SID[b.sid]?SID[b.sid].ic:'🌿',(SID[b.sid]?SID[b.sid].nom:'Récolte')+' (humide)',Math.round(b.g||0)+' g','en séchage · coin orange de l’atelier')).join('');
  const gear=[['🪣','Arrosoir',(F.can||0)+'/6','se remplit au point d’eau 💧'],['🛢️','Citerne',Math.round(F.water)+'/'+F.tank+' L','1 cr / litre · point d’eau'],['🌬️','Ventilation',(F.rooms.atelier.fan?'oui':'non'),'réduit la chaleur'],['🧯','Filtre à charbon',(F.rooms.atelier.filter?'oui':'non'),'réduit la chaleur'],['🚿','Irrigation',(F.rooms.atelier.irri?'oui':'non'),'arrose seule les plots']].map(a=>invRow(a[0],a[1],a[2],a[3])).join('');
  const c=(typeof R!=='undefined'&&R&&R.cargo)?invRow('📦','Cargaison en cours',Math.round(R.cargo.g)+' g','à livrer pendant la course'):'';
  const h=Math.round(Math.max(F.heat.atelier,F.heat.ranch)), kt=karmaTitle();
  $('sheet').innerHTML=`<div class="inv">${X}<h2>🎒 Sac à dos</h2>
   <div class="inv-top"><span>💰 ${fmt(S.cr)} cr</span><span>🚨 chaleur ${h} %</span><span>${kt[2]} karma ${Math.round(karma())}</span></div>
   ${sec('🪣 Matériel',gear)}${sec('🌱 Graines',seeds||'<p class="sm">Aucune graine — boutique du labo (étagère jaune).</p>')}${sec('🧴 Engrais & produits',chem||'<p class="sm">Rien — boutique du labo.</p>')}${sec('💡 Lampes',lamps||'<p class="sm">Aucune lampe.</p>')}${sec('🌿 Au séchage',dry)}${sec('🫙 Stock à vendre',stock||'<p class="sm">Pas de stock : récolte puis sèche une plante.</p>')}${sec('📦 Cargaison',c)}
   <div class="tu-btns"><button class="btn alt" data-a="gtuto">❓ Revoir le tuto</button><button class="btn" data-a="close">Fermer</button></div></div>`;
  return true;
}
ACT.inv=()=>{ openSheet({t:'inv'}); };
/* premier passage dans le labo : kit + tuto */
const _growEnter=growEnter;
growEnter=function(room){ _growEnter(room); const F=farm(); if(GROW[room]&&!F.tutoSeen){ F.tutoSeen=1; giveKit(); setTimeout(()=>openSheet({t:'gtuto',i:0}),500); } };
/* menus du monde ouvert : le téléphone repasse en portrait à l'ouverture, en paysage à la fermeture */
const _openSheet0=openSheet;
openSheet=function(s){ if(view==='hub'&&document.body.classList.contains('hubmode')&&!HUB.rot){ HUB.rot=true; document.body.classList.add('menuport'); rotNow(false); } _openSheet0(s); };
const _closeSheet0=closeSheet;
closeSheet=function(){ _closeSheet0(); if(HUB.rot){ HUB.rot=false; document.body.classList.remove('menuport'); if(view==='hub') rotNow(true); } };
