/* ---- tuto pour les nouveaux joueurs : court, avec bouton « Passer » ---- */
const TUTO=[
 {v:'garage',ic:'🏎️',t:'Bienvenue dans High & Rouillé',x:'Tu démarres avec une épave, une patrouille, 1 500 cr et 3 jetons de paquet. Ce tour dure 30 secondes, et tu peux le passer quand tu veux.'},
 {v:'garage',ic:'🚗',t:'Ton garage',x:'Touche une voiture pour la réparer, l’équiper de modules ou l’améliorer. Les podiums du showroom exposent tes plus belles voitures et rapportent des crédits pendant que tu joues.'},
 {v:'epreuves',ic:'🏁',t:'Les épreuves',x:'Choisis une épreuve, puis place la bonne voiture sur chaque manche. Prends le volant (gaz, frein, nitro) ou laisse le pilote automatique. Plus tu finis haut, plus la prime est grosse.'},
 {v:'cartes',ic:'🃏',t:'Cartes et paquets',x:'Dépense tes jetons pour ouvrir des paquets : voitures et modules de tuning, en 7 raretés. Les modules se montent dans l’atelier de chaque voiture pour gagner en stats.'},
 {v:'marche',ic:'🛒',t:'Marché et base',x:'Au marché, achète ou vends voitures et pièces, les offres changent au fil des courses. Dans la base, construis des bâtiments qui rapportent plus de crédits et d’XP, et règle le son.'},
 {v:'missions',ic:'📜',t:'Missions et pilote',x:'Les missions et les badges donnent crédits, XP et jetons : récupère-les ici. Touche ton niveau en haut de l’écran pour ouvrir ta carte pilote et dépenser tes points de compétence.'},
 {v:'garage',ic:'🎯',t:'Premier objectif',x:'Répare la Veloz Piccola au garage, puis lance « Run du parking » dans les épreuves. Bonne route !'}
];
function tutoSheet(X){
  if(!sheet||sheet.t!=='tuto') return false;
  const i=sheet.i||0, T=TUTO[i], last=i===TUTO.length-1;
  $('sheet').innerHTML=`<div class="tuto"><div class="tu-ic">${T.ic}</div><h2>${T.t}</h2><p>${T.x}</p>
    <div class="tu-dots">${TUTO.map((_,k)=>`<i class="${k===i?'on':k<i?'d':''}"></i>`).join('')}</div>
    <div class="tu-btns">${last?'':'<button class="btn alt" data-a="tutoskip">Passer le tuto</button>'}<button class="btn" data-a="tutonext">${last?'C’est parti':'Suivant'}</button></div></div>`;
  return true;
}
function tutoEnd(){ closeSheet(); view='garage'; R=null; render(); document.querySelector('main').scrollTop=0; }
ACT.tuto=()=>{ openSheet({t:'tuto',i:0}); };
ACT.tutoskip=()=>{ tutoEnd(); };
ACT.tutonext=()=>{ if(!sheet||sheet.t!=='tuto') return; const i=(sheet.i||0)+1; if(i>=TUTO.length){ tutoEnd(); return; }
  sheet.i=i; const v=TUTO[i].v; if(v&&v!==view){ view=v; R=null; render(); } else renderSheet(); $('sheet').scrollTop=0; };
