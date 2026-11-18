/* ---- v0.61 : thèmes musicaux de course, tempo lissé, anti-chevauchement, notes de mise à jour ---- */
const GAME_VER='1.4';
const PATCH={'1.4':{t:'Spa néon, paquets animés, voix off',l:['Course : volant agrandi, pédales moins larges, tout tient sur un écran','Spa : marquages au sol nettoyés, immeubles néon tout autour','Base revient dans la barre du bas','Missions : paliers de niveau (2, 3, 4, 6, 8…) et bouton Tout récupérer','Garage 3D : plus de cloison, le labo s’ouvre depuis Atelier › Labo ; sac à dos seulement au labo','Paquets : carrousel plus fluide, déclics, flashs et explosions à l’ouverture','Intro : voix off du cycliste à la place du texte','Fond sans motif, boutons de l’atelier recentrés']},'1.3':{t:'Pinball retravaillé, boutons de course',l:['Pinball : ponts écartés et plus durs à atteindre, GARAGE bien moins gourmand','Pinball : les trous de changement de table fermés laissent passer la bille','Paquet Voiture aussi achetable avec 50 jetons','Course : DRIFT remplace le gros NITRO, GAZ agrandi pour mieux doser, NITRO plus compact']},'1.2':{t:'Pinball à ponts, paquets Voiture',l:['Pinball : 8 tables avec ponts, rampes et banques de cibles','Paquets : un seul carrousel (aléatoires, ciblés, Voiture), achat ×1, ×5 ou ×10','Nouveau Paquet Voiture : 1 voiture au hasard, 50 000 cr','Âge demandé au 1er lancement : l’illégal est masqué aux mineurs','Missions clandestines pour les majeurs (après le labo)','Rue Néon : enseignes retirées, zone de marche corrigée']},'1.1':{t:'Menus regroup\u00e9s',l:['5 onglets : Garage, \u00c9preuves, Atelier, March\u00e9, Missions','Cartes dans March\u00e9 ; Labo, Base et \u00c9quipe dans Atelier','Labo ouvert comme une page, avec Croiser et Tout planter','Atelier : Tout fusionner, par raret\u00e9 ou d\u2019un coup','Paquets cibl\u00e9s en vrais paquets de cartes','\u00c9preuves tri\u00e9es par niveau','Drag arcade : plus de d\u00e9part dans la voiture adverse']},'1.0':{t:'Version 1.0',l:['5 nouveaux circuits et 3 circuits de drift (voir \u00c9preuves)','Atelier et \u00c9quipe r\u00e9unis : 7 onglets au lieu de 8','Sauvegarde : export, import et copie de secours (Base > R\u00e9glages)','Qualit\u00e9 graphique Auto / Basse / Haute','Interface arrondie et centr\u00e9e partout','Objectifs de d\u00e9but de partie plus guid\u00e9s']},'0.66':{t:'March\u00e9 plus lisible',l:['Casse et concession : affichage x1 ou x3','Recherche, filtre de raret\u00e9 et tri (prix, raret\u00e9, puissance)']},'0.65':{t:'Labo plus clair',l:['Base : labo et \u00e9quipe retir\u00e9s (boutons du bas)','Labo : swipe entre les plantes, menu arrondi','Chrono min:sec sur chaque plante + alerte \u00ab pr\u00eate pour la floraison \u00bb','Bouton Floraison direct dans le labo','Jardinier plus progressif','Tuto : chaleur et police expliqu\u00e9es','Labo : musique reggae seule, plus de message r\u00e9p\u00e9t\u00e9, boutons centr\u00e9s','Labo : ambiance reggae / dub / chill et d\u00e9cor cannabis']},'0.64':{t:'Garage & barre d\u2019XP',l:['Collection : affichage x1 ou x3','Fiche v\u00e9hicule : swipe gauche/droite pour changer de voiture (fl\u00e8ches retir\u00e9es)','Modules : affichage x1, x3 ou x5','Cartes : paquets al\u00e9atoires en haut, paquets cibl\u00e9s en dessous','Barre d\u2019XP du haut simplifi\u00e9e : progression + XP restant']},'0.63':{t:'Atelier, équipe & paquets',l:[
 '🛠️ Onglets Atelier et Équipe dans la barre du bas, avec tuto à la première visite',
 '♻️ Atelier refait : Fabriquer, Recycler, Fusionner en 3 onglets clairs',
 '👥 Équipe refaite : cartes lisibles, énergie, loyauté, recrutement',
 '◀ ▶ Flèches sur la fiche d’une voiture pour passer à la suivante',
 '🎯 6 paquets ciblés (puissance, adhérence, freinage, robuste, style, nitro) + les paquets aléatoires',
 '🎟 Paiement des paquets explicite : crédits ou jetons, tu choisis',
 '❓ Un tuto pour chaque menu, rejouable avec le bouton ?']}};
/* --- thèmes musicaux --- */
const MTH=[
 {n:'Néon',bpm:174,orig:true},
 {n:'Asphalte',bpm:168,root:73.42,q:[[0,'m'],[8,'M'],[3,'M'],[10,'M']],lead:[[0,2],[3,3],[6,4],[10,3],[12,5]],w:'sawtooth'},
 {n:'Désert',bpm:164,root:82.41,q:[[0,'m'],[1,'M'],[3,'M'],[1,'M']],lead:[[0,3],[2,4],[4,3],[8,2],[10,3],[14,4]],w:'square'},
 {n:'Nuit',bpm:170,root:65.41,q:[[0,'m'],[8,'M'],[3,'M'],[10,'M']],lead:[[0,4],[4,5],[8,4],[12,3]],w:'triangle'},
 {n:'Acier',bpm:176,root:98,q:[[0,'m'],[8,'M'],[3,'M'],[10,'M']],lead:[[0,5],[3,4],[6,5],[9,3],[12,4],[14,5]],w:'sawtooth'},
 {n:'Orage',bpm:178,root:61.74,q:[[0,'m'],[8,'M'],[3,'M'],[10,'M']].map(a=>a).slice(0,4),lead:[[0,3],[1,4],[4,5],[8,3],[9,4],[12,2]],w:'square'}];
MTH[5].q=[[0,'m'],[8,'M'],[3,'M'],[10,'M']];
const CH0=CHORDS.map(c=>({sub:c.sub,bass:c.bass,pad:c.pad.slice(),arp:c.arp.slice()}));
let CUR_TH=0;
function mkChord(r,k,qual){ const f=r*Math.pow(2,k/12), t3=qual==='m'?3:4, tri=[1,Math.pow(2,t3/12),Math.pow(2,7/12)].map(x=>f*2*x); return {sub:f/2,bass:f,pad:tri,arp:tri.concat(tri.map(x=>x*2))}; }
function applyTheme(i){ if(i===CUR_TH) return; CUR_TH=i; const T=MTH[i];
  for(let k=0;k<4;k++){ const c=T.orig?CH0[k]:mkChord(T.root,T.q[k][0],T.q[k][1]); CHORDS[k].sub=c.sub; CHORDS[k].bass=c.bass; CHORDS[k].pad=c.pad; CHORDS[k].arp=c.arp; }
  BPM=T.bpm; STEP=60/BPM/4; BAR=STEP*16; }
function themeFor(){ let id=''; try{ id=(R&&R.ev&&R.ev.id)||''; }catch(e){} let i=-1; try{ i=EVENTS.findIndex(e=>e.id===id); }catch(e){} if(i<0) i=Math.floor(Math.random()*6); return i%MTH.length; }
const _arS35=auRaceStart;
auRaceStart=function(o){ try{ if(AU.ok){ AU.seq.bpmL=null; applyTheme(o&&o.drag?0:themeFor()); } }catch(e){ console.error(e); } AU.theme=CUR_TH; return _arS35.apply(this,arguments); };
const _am35=auMood;
auMood=function(m){ try{ if(!['race','tense','silent','stinger','drag'].includes(m)) applyTheme(0); }catch(e){} return _am35.apply(this,arguments); };
/* mélodie propre à chaque thème (niveaux 1 à 3, mode course) */
const _ss35=schedStep;
schedStep=function(step,t){ _ss35.apply(this,arguments);
  try{ const q=AU.seq; if(q.mood!=='race'||!q.level||CUR_TH===0||q.dropFrom!=null) return; const T=MTH[CUR_TH], s=step%16, bar=Math.floor(step/16), ch=CHORDS[Math.floor(bar/2)%4];
    T.lead.forEach(([st,ix])=>{ if(st===s) pluck(t,ch.arp[ix%6]*(q.level>=3?2:1),.09,T.w,STEP*2.2); }); }catch(e){} };
/* tempo du drag : changement uniquement à chaque mesure, par petits paliers */
dragSD=function(){ const q=AU.seq, f=clamp(AU.speedFrac||0,0,1); AU.dsm=(AU.dsm||0)+(f-(AU.dsm||0))*.07; const tgt=120+68*Math.pow(AU.dsm,.85);
  if(q.bpmL==null) q.bpmL=tgt; else if(q.step%16===0&&q.bpmS!==q.step){ q.bpmS=q.step; q.bpmL+=Math.max(-3,Math.min(3,tgt-q.bpmL)); } return 15/q.bpmL; };
/* une seule musique : l'intro coupe les autres */
const _cas35=cineAudioStart, _cae35=cineAudioStop;
cineAudioStart=function(T){ try{ ambMute(true); }catch(e){} return _cas35.apply(this,arguments); };
cineAudioStop=function(){ const r=_cae35.apply(this,arguments); try{ if(!WM.on&&!(PM&&PM.on)) ambMute(false); }catch(e){} return r; };
/* écran de mise à jour */
function showPatch(force){ if(document.getElementById('upd')) return; const P=PATCH[GAME_VER]; if(!P) return;
  const d=document.createElement('div'); d.id='upd'; d.innerHTML='<div class="upd-c"><small>MISE À JOUR</small><h2>v'+GAME_VER+' · '+P.t+'</h2><ul>'+P.l.map(x=>'<li>'+x+'</li>').join('')+'</ul><button class="btn wide" id="updGo">C’est parti</button></div>';
  document.body.appendChild(d); document.getElementById('updGo').onclick=()=>{ d.remove(); try{ S.seenVer=GAME_VER; save(); }catch(e){} }; }
ACT.patch=()=>{ closeSheet&&closeSheet(); showPatch(true); };
setInterval(()=>{ try{ if(!S||!S.intro||S.seenVer===GAME_VER||sheet||view==='race'||document.getElementById('cine')||document.getElementById('upd')||document.getElementById('arcov')) return;
  if(S.seenVer==null&&(S.stats&&!S.stats.races)&&S.lvl<=1){ S.seenVer=GAME_VER; return; } showPatch(); }catch(e){} },2000);
