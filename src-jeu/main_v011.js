
/* =====================================================================
   ROUILLE & GLOIRE — démo v0.11
   1) DONNÉES : tout le contenu du jeu (voitures, pièces, épreuves,
      circuits, bâtiments, missions). On ajoute du contenu ici.
   2) MOTEUR : calculs, sauvegarde, écrans.
   3) COURSE : physique, pilote automatique, affichage.
   ===================================================================== */

/* ---------- 1) DONNÉES ---------- */
const SAVE_VERSION = 3;
const KEY = 'rouille_gloire_save';

const TIERS = [null,
  {n:'Populaire', c:'#7E8A94'},
  {n:'Standard',  c:'#2F9460'},
  {n:'Sport',     c:'#2B7BD6'},
  {n:'Prestige',  c:'#8B55D9'},
  {n:'Supercar',  c:'#E09A12'},
  {n:'Hypercar',  c:'#E0354B'}
];
const TR = {FWD:'traction', RWD:'propulsion', AWD:'4 roues motrices'};

/* Marques et modèles inventés. adh/fre/man/fia/sty sont notés sur 100. */
const CARS = [
  {id:'piccola', nom:'Veloz Piccola',   an:1992, cat:'Citadine',   shape:'hatch',  tr:'FWD', t:1, ch:55,   nm:88,   kg:780,  vmax:150, adh:38, fre:35, man:50, fia:60, sty:20, val:800,    col:'#C8503C'},
  {id:'kombi',   nom:'Brenner Kombi',   an:1988, cat:'Break',      shape:'wagon',  tr:'RWD', t:1, ch:115,  nm:185,  kg:1350, vmax:175, adh:40, fre:40, man:38, fia:80, sty:25, val:1500,   col:'#7C8B5A'},
  {id:'steppe',  nom:'Marova Steppe',   an:1985, cat:'4x4',        shape:'suv',    tr:'AWD', t:1, ch:75,   nm:130,  kg:1150, vmax:135, adh:55, fre:30, man:40, fia:65, sty:30, val:1800,   col:'#B89A5E'},
  {id:'riva',    nom:'Kaido Riva SR',   an:2004, cat:'Compacte',   shape:'hatch',  tr:'FWD', t:2, ch:125,  nm:150,  kg:1050, vmax:195, adh:52, fre:50, man:62, fia:85, sty:35, val:4000,   col:'#3E7FB8'},
  {id:'hauler',  nom:'Dalton Hauler V8',an:1998, cat:'Pick-up',    shape:'pickup', tr:'RWD', t:2, ch:210,  nm:420,  kg:1900, vmax:170, adh:42, fre:38, man:30, fia:75, sty:40, val:5000,   col:'#8A2F2A'},
  {id:'patrouille',nom:'Brenner Patrouille',an:2016,cat:'Utilitaire',shape:'van',tr:'FWD',t:2,ch:180,nm:400,kg:1950,vmax:185,adh:48,fre:45,man:35,fia:80,sty:50,val:9000,col:'#E6ECF2',glb:'patrouille'},
  {id:'velo',  nom:'Vélo d’estafette 1940',an:1940,cat:'Vélo',shape:'bike',tr:'RWD',t:1,ch:1,nm:40,kg:95,vmax:42,adh:28,fre:22,man:82,fia:92,sty:68,val:600,col:'#4d5a3c',glb:'velo',noAI:true},
  {id:'subi',  nom:'Kaido Tento 360',  an:1968, cat:'Classique', shape:'hatch', tr:'RWD', t:1, ch:25,  nm:34,  kg:410,  vmax:110, adh:32, fre:26, man:58, fia:55, sty:62, val:2600,   col:'#e8dfc8',glb:'subi'},
  {id:'audi',  nom:'Ostwald Executive',an:2014, cat:'Berline',   shape:'sedan', tr:'AWD', t:3, ch:245, nm:580, kg:1790, vmax:250, adh:66, fre:62, man:58, fia:78, sty:58, val:16000,  col:'#20242b',glb:'audi'},
  {id:'merco', nom:'Sternberg Elegance',an:2012,cat:'Berline',   shape:'sedan', tr:'RWD', t:3, ch:306, nm:370, kg:1735, vmax:250, adh:62, fre:60, man:55, fia:80, sty:72, val:21000,  col:'#c9ccd2',glb:'merco'},
  {id:'touge',   nom:'Kaido Touge S',   an:1996, cat:'Drift',      shape:'coupe',  tr:'RWD', t:3, ch:130,  nm:150,  kg:950,  vmax:200, adh:55, fre:52, man:78, fia:78, sty:55, val:9000,   col:'#E8E4DA'},
  {id:'fury',    nom:'Stallion Fury',   an:2012, cat:'Muscle car', shape:'coupe',  tr:'RWD', t:3, ch:420,  nm:530,  kg:1650, vmax:250, adh:55, fre:55, man:48, fia:70, sty:65, val:18000,  col:'#D9741C'},
  {id:'rx4',     nom:'Nordik RX4',      an:2009, cat:'Rallye',     shape:'sedan',  tr:'AWD', t:4, ch:300,  nm:410,  kg:1300, vmax:230, adh:78, fre:68, man:75, fia:72, sty:60, val:28000,  col:'#2456A6'},
  {id:'gts',     nom:'Brenner GT-S',    an:2018, cat:'Sportive',   shape:'coupe',  tr:'RWD', t:4, ch:430,  nm:550,  kg:1550, vmax:280, adh:76, fre:75, man:78, fia:74, sty:68, val:45000,  col:'#4B5560'},
  {id:'volta',   nom:'Volta E-GT',      an:2023, cat:'Électrique', shape:'sedan',  tr:'AWD', t:4, ch:600,  nm:850,  kg:2100, vmax:250, adh:74, fre:70, man:62, fia:88, sty:66, val:60000,  col:'#3FA7A0'},
  {id:'majestic',nom:'Albion Majestic', an:2021, cat:'Luxe',       shape:'sedan',  tr:'AWD', t:5, ch:550,  nm:900,  kg:2300, vmax:300, adh:65, fre:66, man:50, fia:80, sty:95, val:120000, col:'#2B3A2E'},
  {id:'rossa',   nom:'Corsa Rossa V8',  an:2020, cat:'Supercar',   shape:'super',  tr:'RWD', t:5, ch:670,  nm:760,  kg:1450, vmax:330, adh:88, fre:88, man:88, fia:62, sty:92, val:220000, col:'#C8202B'},
  {id:'aurion',  nom:'Aurion W16',      an:2024, cat:'Hypercar',   shape:'super',  tr:'AWD', t:6, ch:1500, nm:1600, kg:1995, vmax:420, adh:90, fre:90, man:78, fia:60, sty:98, val:900000, col:'#1F2A44'}
];

/* Paliers d'amélioration : niveau 0 à 4 */
const PALIERS = ['Stock','Street','Sport','Course','Élite'];
const PARTS = [
  {id:'moteur', nom:'Moteur',      ic:'⚙️', effet:'+8 % de puissance et de couple', apply:(s,l)=>{s.ch*=1+.08*l; s.nm*=1+.08*l; s.vmax*=1+.02*l;}},
  {id:'pneus',  nom:'Pneus',       ic:'⭕', effet:'+5 d’adhérence',                 apply:(s,l)=>{s.adh+=5*l;}},
  {id:'freins', nom:'Freins',      ic:'🛑', effet:'+5 de freinage',                 apply:(s,l)=>{s.fre+=5*l;}},
  {id:'susp',   nom:'Suspension',  ic:'🔩', effet:'+5 de maniabilité',              apply:(s,l)=>{s.man+=5*l;}},
  {id:'poids',  nom:'Allègement',  ic:'🪶', effet:'−4 % de poids',                  apply:(s,l)=>{s.kg*=1-.04*l;}},
  {id:'fiab',   nom:'Fiabilisation',ic:'🧰', effet:'+5 de fiabilité',               apply:(s,l)=>{s.fia+=5*l;}},
  {id:'carro',  nom:'Carrosserie', ic:'🎨', effet:'+5 de style',                    apply:(s,l)=>{s.sty+=5*l;}}
];

/* Disciplines : w = poids de chaque note, tr = bonus selon la transmission */
const DISC = {
  drag:     {nom:'Drag',                 ic:'🏁', w:{acc:.6,vit:.15,adh:.15,fia:.1},          tr:{AWD:1.05,RWD:1,FWD:.95},  aide:'L’accélération décide. Les 4 roues motrices aident au départ.'},
  circuit:  {nom:'Circuit',              ic:'🛣️', w:{adh:.3,man:.25,fre:.2,acc:.15,vit:.1},   tr:{},                         aide:'Sur le circuit de Spa tu pilotes vraiment : direction, gaz, frein, nitro. Herbe, gravier et sable te ralentissent, les murs abîment ta voiture.'},
  rallye:   {nom:'Rallye',               ic:'🌲', w:{man:.3,adh:.2,acc:.2,fia:.2,fre:.1},     tr:{AWD:1.15,FWD:1.03,RWD:.93},aide:'Maniabilité et fiabilité. Avantage aux 4 roues motrices.'},
  drift:    {nom:'Drift',                ic:'💨', w:{man:.4,pui:.35,fre:.15,adh:.1},          tr:{RWD:1.2,AWD:.9,FWD:.65},   aide:'Maniabilité et puissance. Sans propulsion, c’est très dur.'},
  endurance:{nom:'Endurance',            ic:'⏱️', w:{fia:.45,vit:.2,fre:.2,adh:.15},          tr:{},                         aide:'La fiabilité d’abord, puis la vitesse de pointe.'},
  elegance: {nom:'Concours d’élégance',  ic:'🏆', w:{sty:.65,etat:.35}, tr:{}, calme:true,                                   aide:'Pas de course : un jury note le style et l’état de la voiture.'}
};
const METEO = {
  sec:   {nom:'sur le sec',       ic:'☀️'},
  pluie: {nom:'sous la pluie',    ic:'🌧️', f:s=>(.78+s.adh/400)*(s.tr==='AWD'?1.05:1)},
  neige: {nom:'sur la neige',     ic:'❄️', f:s=>(.6+s.adh/300)*({AWD:1.15,FWD:1,RWD:.88}[s.tr])}
};

/* Épreuves : opp = adversaires (catégories min/max, palier des pièces, état min/max) */
const EVENTS = [
  {id:'e1', nom:'Spa : La Source et Eau Rouge',lvl:1, gain:700,   xp:30,  opp:{t:[1,1],up:0,etat:[30,55]},  manches:[{d:'circuit',m:'sec',sp:'s1'}]},
  {id:'e2', nom:'Run du parking',          lvl:1,  gain:800,   xp:35,  opp:{t:[1,1],up:0,etat:[28,48]},  manches:[{d:'drag',m:'sec'}]},
  {id:'e3', nom:'Chemin de ferme',         lvl:2,  gain:900,   xp:40,  opp:{t:[1,1],up:0,etat:[40,65]},  manches:[{d:'rallye',m:'pluie'}]},
  {id:'e4', nom:'Nuit pluvieuse',          lvl:3,  gain:1800,   xp:70,  opp:{t:[1,2],up:0,etat:[50,80]},  manches:[{d:'circuit',m:'pluie',sp:'s5'},{d:'drag',m:'pluie'}]},
  {id:'e5', nom:'Rassemblement du dimanche',lvl:4, gain:2200,   xp:90,  opp:{t:[1,2],up:1,etat:[60,90]},  manches:[{d:'elegance',m:'sec'},{d:'drift',m:'sec'}]},
  {id:'e6', nom:'Coupe régionale',         lvl:5,  gain:4000,  xp:150, opp:{t:[2,3],up:1,etat:[70,100]}, manches:[{d:'circuit',m:'sec',sp:'s3'},{d:'rallye',m:'sec'},{d:'drag',m:'sec'}]},
  {id:'e7', nom:'Spéciale des cimes',      lvl:7,  gain:8000,  xp:260, opp:{t:[3,4],up:2,etat:[80,100]}, manches:[{d:'rallye',m:'neige'},{d:'circuit',m:'pluie',sp:'s2'},{d:'endurance',m:'sec'}]},
  {id:'e8', nom:'Trophée Prestige',        lvl:9,  gain:18000, xp:420, opp:{t:[4,5],up:2,etat:[90,100]}, manches:[{d:'elegance',m:'sec'},{d:'circuit',m:'sec',sp:'s4'},{d:'drag',m:'sec'}]},
  {id:'e9', nom:'Grand Prix des Légendes', lvl:12, gain:50000, xp:700, opp:{t:[5,6],up:3,etat:[100,100]},manches:[{d:'drift',m:'sec'},{d:'endurance',m:'pluie'},{d:'circuit',m:'sec',sp:'tour'}]}
];

/* Bâtiments : cout[n] = prix pour passer au niveau n+1 */
const BATS = [
  {id:'atelier',   nom:'Atelier',            ic:'🔧', max:5, cout:[0,1500,6000,25000,90000],
   effet:l=>`Pièces jusqu’au palier ${PALIERS[Math.min(4,l)]}, réparations −${(l-1)*10} %`},
  {id:'casse',     nom:'Casse automobile',   ic:'🏚️', max:5, cout:[0,2500,10000,40000,150000],
   effet:l=>{const r=CASSE_T[l-1];return `Épaves de ${TIERS[r[0]].n} à ${TIERS[r[1]].n}`}},
  {id:'bureau',    nom:'Bureau des contrats',ic:'📋', max:5, cout:[1000,4000,15000,60000,200000],
   effet:l=>l?`Gains des épreuves +${l*10} %`:'Augmente les gains des épreuves'},
  {id:'concession',nom:'Concession',         ic:'🏢', max:5, cout:[2000,8000,30000,100000,400000],
   effet:l=>l?`Voitures neuves jusqu’à ${TIERS[l+1].n}`:'Vend des voitures neuves, en parfait état'}
];
const CASSE_T = [[1,2],[1,3],[2,4],[3,5],[3,6]];

/* Missions : p renvoie [progression, objectif], g = récompense */
const MISSIONS = [
  {id:'m1', t:'Remets une voiture à 100 % d’état',     p:s=>[s.stats.repFull,1],  g:{cr:300}},
  {id:'m2', t:'Gagne ta première épreuve',             p:s=>[s.stats.wins,1],     g:{cr:300,nitro:1}},
  {id:'m3', t:'Installe une amélioration',             p:s=>[s.stats.ups,1],      g:{cr:400}},
  {id:'m4', t:'Possède 2 voitures',                    p:s=>[s.cars.length,2],    g:{cr:500}},
  {id:'m5', t:'Gagne 5 épreuves',                      p:s=>[s.stats.wins,5],     g:{cr:1000,nitro:2}},
  {id:'m6', t:'Améliore un bâtiment',                  p:s=>[s.stats.bats,1],     g:{cr:800}},
  {id:'m7', t:'Gagne une épreuve à 3 manches',         p:s=>[s.stats.wins3,1],    g:{cr:2500}},
  {id:'m8', t:'Possède une voiture Sport ou mieux',    p:s=>[s.cars.some(c=>M[c.mid].t>=3)?1:0,1], g:{cr:3000,nitro:3}},
  {id:'m9', t:'Atteins le niveau 10',                  p:s=>[s.lvl,10],           g:{cr:15000}},
  {id:'m10',t:'Possède une Hypercar',                  p:s=>[s.cars.some(c=>M[c.mid].t>=6)?1:0,1], g:{cr:100000}},
  {id:'m13',t:'Ouvre un paquet de cartes',             p:s=>[s.stats.packs||0,1],  g:{tok:2}},
  {id:'m14',t:'Monte 3 modules sur une même voiture',  p:s=>[s.stats.eq||0,3],     g:{cr:1500,tok:2}},
  {id:'m15',t:'Obtiens un module Épique ou mieux',     p:s=>[(s.stats.best||0)>=3?1:0,1], g:{tok:5}},
  {id:'m16',t:'Monte sur le podium d’une course à 6',  p:s=>[s.stats.pods||0,1],   g:{cr:2000,tok:2}},
  {id:'m11',t:'Expose une voiture sur un podium',      p:s=>[s.pod.slots.some(u=>u)?1:0,1], g:{cr:600}},
  {id:'m12',t:'Amène tes podiums au niveau 3',         p:s=>[s.pod.tier,3],       g:{cr:5000,nitro:2}}
];

/* Circuits : ['S', longueur en m] = ligne droite, ['C', longueur, vitesse de base en km/h] = virage */
const TRACKS = {
  drag:     [['S',900]],
  circuit:  [['S',240],['C',80,70],['S',200],['C',60,55],['S',180],['C',100,88],['S',150]],
  rallye:   [['S',120],['C',60,52],['S',100],['C',50,45],['S',90],['C',70,60],['S',110],['C',50,45],['S',100]],
  drift:    [['S',100],['C',90,55],['S',60],['C',90,50],['S',60],['C',110,60],['S',80]],
  endurance:[['S',420],['C',80,85],['S',460],['C',90,80],['S',420]]
};
/* Spa-Francorchamps : secteurs de course (abscisses en mètres le long de la piste) */
const SPA_STAGES = [{"id": "s1", "nom": "La Source, Eau Rouge, Raidillon", "a": 0, "b": 1300}, {"id": "s2", "nom": "Kemmel et Les Combes", "a": 1300, "b": 2650}, {"id": "s3", "nom": "Malmedy, Rivage, Pouhon", "a": 2650, "b": 4300}, {"id": "s4", "nom": "Pouhon, Fagnes, Campus", "a": 4300, "b": 5200}, {"id": "s5", "nom": "Stavelot, Blanchimont, Bus Stop", "a": 5200, "b": 7051.4}, {"id": "tour", "nom": "Tour complet de Spa-Francorchamps", "a": 0, "b": 7051.4}];
const NITRO_PRIX = 150;
const NITRO_DUREE = 2.5;

/* Showroom : podiums. POD_LVL = niveau du joueur requis pour chaque emplacement */
const POD_MAX = 8;
const POD_LVL = [1,1,3,5,7,9,12,15];
const POD_TIER = [null,
  {n:'Standard',      cost:0,      lvl:1},
  {n:'Néon',          cost:3000,   lvl:3},
  {n:'Plateau tournant',cost:12000,lvl:6},
  {n:'Projecteur',    cost:50000,  lvl:10},
  {n:'Or',            cost:200000, lvl:15}
];
const TABS = [['garage','🚗','Garage'],['epreuves','🏁','Épreuves'],['cartes','🃏','Cartes'],['marche','🛒','Marché'],['base','🏗️','Base'],['missions','📜','Missions']];

/* ---------- 2) MOTEUR ---------- */
const M = Object.fromEntries(CARS.map(c=>[c.id,c]));
const $ = id=>document.getElementById(id);
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const rnd = (a,b)=>a+Math.random()*(b-a);
const rint = (a,b)=>Math.floor(rnd(a,b+1));
const fmt = n=>Math.round(n).toLocaleString('fr-FR');
const fmtT = t=>t.toFixed(2).replace('.',',')+'&nbsp;s';
const cr = n=>`${fmt(n)}&nbsp;cr`;
const need = l=>Math.round(55*Math.pow(l,1.35));

let S, view='garage', R=null, RC=null, RS=null, sheet=null, resetArm=false;

function fresh(){
  return {v:SAVE_VERSION, ts:0, cr:1500, tok:3, scrap:0, mods:[], muid:1, pity:[0,0,0,0,0,0,0], alb:{}, daily:'', streak:0, nitro:2, xp:0, lvl:1, nuid:3, gift1:1,
    cars:[{uid:1,mid:'piccola',etat:22,xp:0,lvl:1,up:{},inv:0},{uid:2,mid:'patrouille',etat:85,xp:0,lvl:1,up:{},inv:0}],
    bat:{atelier:1,casse:1,bureau:0,concession:0,banc:0,entrepot:0,simu:0},
    stats:{wins:0,races:0,repFull:0,ups:0,bats:0,wins3:0,packs:0,pods:0,best:0,eq:0,shiny:0},
    claimed:{}, first:{}, offres:[], age:0, intro:false,
    pod:{tier:1,slots:[null,null,null,null,null,null,null,null],last:Date.now()},
    audio:Object.assign({},AUDEF)};
}
function migrate(s){
  const gifted=!!(s&&s.gift1), f=fresh();
  s=Object.assign(f,s); s.bat=Object.assign(fresh().bat,s.bat); s.stats=Object.assign(fresh().stats,s.stats);
  s.cars=(s.cars||[]).filter(c=>M[c.mid]); s.offres=(s.offres||[]).filter(o=>M[o.mid]);
  if(!s.cars.length) s.cars=fresh().cars;
  if(!gifted&&!s.cars.some(c=>c.mid==='patrouille')){s.cars.push({uid:Math.max(s.nuid||1,...s.cars.map(c=>c.uid+1)),mid:'patrouille',etat:85,xp:0,lvl:1,up:{},inv:0,mods:{},sh:Math.random()<.03?1:0}); s.nuid=Math.max(s.nuid||1,...s.cars.map(c=>c.uid+1));}
  s.gift1=1;
  const pd=s.pod||{}, seen={};
  s.pod={tier:clamp(pd.tier||1,1,5),last:pd.last||Date.now(),
    slots:Array.from({length:POD_MAX},(_,i)=>{const u=pd.slots&&pd.slots[i]; if(u&&!seen[u]&&s.cars.some(c=>c.uid===u)){seen[u]=1; return u;} return null;})};
  { const a=s.audio||{}; if(a.sfx!=null&&a.eng==null){ a.master=.9; delete a.sfx; } s.audio=Object.assign({},AUDEF,a); }
  if(!Array.isArray(s.mods)) s.mods=[]; s.muid=Math.max(s.muid||1,1+s.mods.reduce((t,m)=>Math.max(t,m.u||0),0));
  s.mods=s.mods.filter(m=>m&&MODI[m.t]&&RAR[m.r]); if(!Array.isArray(s.pity)||s.pity.length!==7) s.pity=[0,0,0,0,0,0,0];
  s.alb=s.alb||{}; s.tok=s.tok||0; s.scrap=s.scrap||0; s.daily=s.daily||''; s.streak=s.streak||0;
  if(!s.gift3){ s.gift3=1; if((s.v||0)<3) s.tok+=3; }
  s.cars.forEach(c=>{ c.mods=c.mods||{}; for(const k in c.mods) if(!s.mods.some(m=>m.u===c.mods[k])) delete c.mods[k]; });
  s.v=SAVE_VERSION; return s;
}
function load(){
  try{const raw=localStorage.getItem(KEY); if(raw) return migrate(JSON.parse(raw));}catch(e){}
  return fresh();
}
function localSave(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function save(){S.ts=Date.now(); localSave(); cloudQueue();}

/* Sauvegarde en ligne (propre à chaque joueur), si disponible */
let cloudDoc=null, cloudT=null, cloudBusy=false, cloudDirty=false;
async function cloudInit(){
  try{
    if(!window.claude||!window.claude.use) return;
    const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
    if(!db||!user) return;
    const id=await user.id(); if(!id) return;
    const doc=db.collection('data/users/'+id).doc('save');
    const snap=await doc.get();
    cloudDoc=doc;
    if(snap.exists){
      const d=snap.data(); const cs=d&&d.json?JSON.parse(d.json):null;
      if(cs&&(cs.ts||0)>(S.ts||0)&&view!=='race'){S=migrate(cs); localSave(); R=null; if(view==='prep'||view==='result')view='garage'; closeSheet(); render(); toast('Sauvegarde en ligne chargée');}
      else if(S.ts) cloudQueue();
    } else if(S.ts) cloudQueue();
  }catch(e){}
}
function cloudQueue(){if(!cloudDoc)return; clearTimeout(cloudT); cloudT=setTimeout(cloudPush,2500);}
async function cloudPush(){
  if(cloudBusy){cloudDirty=true;return;}
  cloudBusy=true;
  try{await cloudDoc.set({json:JSON.stringify(S),ts:S.ts});}catch(e){}
  cloudBusy=false;
  if(cloudDirty){cloudDirty=false;cloudQueue();}
}

/* --- calculs --- */
function st(c){
  const s=Object.assign({},M[c.mid]);
  PARTS.forEach(p=>{const l=(c.up&&c.up[p.id])||0; if(l)p.apply(s,l);});
  applyMods(s,c); if(S.bat.banc&&c.uid>0){s.ch*=1+.02*S.bat.banc; s.nm*=1+.02*S.bat.banc;}
  ['adh','fre','man','fia','sty'].forEach(k=>s[k]=clamp(s[k],0,125));
  s.pw=s.ch/s.kg*1000;
  let t=2+900/s.pw; if(s.tr==='AWD')t*=.93; if(s.tr==='FWD')t*=1.03;
  s.t100=Math.max(1.9,t);
  s.acc=clamp(100-(s.t100-2.5)*6.5,2,100);
  s.vit=clamp((s.vmax-100)/3.2,2,100);
  s.pui=clamp(Math.sqrt(s.ch)*2.7,2,100);
  return s;
}
/* Indice : estimation rapide du niveau d'une voiture dans une discipline */
function indice(c,mn){
  const s=st(c), d=DISC[mn.d], me=METEO[mn.m]; let v=0;
  for(const k in d.w) v+=d.w[k]*(k==='etat'?c.etat:s[k]);
  v*=(d.tr[s.tr])||1;
  if(me.f&&!d.calme) v*=me.f(s);
  if(!d.calme) v*=.55+.45*c.etat/100;
  return v*(1+.015*(c.lvl-1));
}
const car = uid=>S.cars.find(c=>c.uid==uid);
const repUnit = c=>Math.max(1,(1-.07*pk('rep'))*ECO.rep*.013*Math.pow(M[c.mid].val,.8)*(1-.1*(S.bat.atelier-1)));
const repCost = c=>Math.ceil((100-c.etat)*repUnit(c));
const upCost = (c,l)=>Math.round((1-.05*pk('upg'))*ECO.up*.33*Math.pow(M[c.mid].val,.8)*Math.pow(l+1,1.6)/10)*10;
const prixCasse = (mid,etat)=>Math.round(M[mid].val*(.25+.5*etat/100)/10)*10;
const prixVente = c=>Math.round((prixCasse(c.mid,c.etat)*.6+(c.inv||0)*.3)/10)*10;
const etatMot = e=>e<40?'Épave':e<75?'Fatiguée':e<100?'En état':'Impeccable';

function addXP(n){
  S.xp+=n; let up=false;
  while(S.xp>=need(S.lvl)){S.xp-=need(S.lvl); S.lvl++; S.cr+=200*S.lvl; S.tok+=1; up=true;}
  if(up){toast(`Niveau ${S.lvl} atteint, prime de ${fmt(200*S.lvl)} cr et 1 jeton`); setTimeout(auLevelUp,1900);}
}
function addCarXP(c,n){
  if(!c) return;
  c.xp+=n; while(c.lvl<20&&c.xp>=60*c.lvl){c.xp-=60*c.lvl; c.lvl++;}
}
function newOffres(){
  const r=CASSE_T[S.bat.casse-1], pool=CARS.filter(m=>m.t>=r[0]&&m.t<=r[1]);
  S.offres=[0,1,2].map(()=>{const m=pool[rint(0,pool.length-1)], etat=rint(12,45); return {mid:m.id,etat,prix:prixCasse(m.id,etat)};});
  S.age=0;
}
/* adversaires : plusieurs pilotes par manche, avec un style de conduite */
const PILOTS=['Vega','Koltz','Marlow','Sato','Brandt','Okoye','Lindqvist','Ferro','Achterberg','Dumas','Kovac','Ibarra','Nakai','Petrov','Quill','Rossi'];
const STYLES=[{n:'propre',sk:0,room:1},{n:'agressif',sk:.01,room:.6},{n:'prudent',sk:-.02,room:1.5},{n:'kamikaze',sk:.02,room:.4}];
const nOppFor=mn=>DISC[mn.d].calme?2:(mn.d==='circuit'?5:2);
function makeOpps(ev){
  const pool=CARS.filter(m=>m.t>=ev.opp.t[0]&&m.t<=ev.opp.t[1]&&!m.noAI), i=EVENTS.indexOf(ev), exT=Math.max(0,S.lvl-ev.lvl), hiT=Math.min(6,ev.opp.t[1]+(exT>=4?1:0)+(exT>=9?1:0)), pool2=CARS.filter(m=>m.t>=ev.opp.t[0]&&m.t<=hiT&&!m.noAI).length?CARS.filter(m=>m.t>=ev.opp.t[0]&&m.t<=hiT&&!m.noAI):pool;
  return ev.manches.map(mn=>{
    const names=PILOTS.slice().sort(()=>Math.random()-.5);
    return Array.from({length:nOppFor(mn)},(_,k)=>{
      const ex=Math.max(0,S.lvl-ev.lvl), m=pool2[rint(0,pool2.length-1)], up={}; PARTS.forEach(p=>up[p.id]=Math.min(4,ev.opp.up+Math.floor(ex/3)));
      return {uid:-1-k,mid:m.id,etat:rint(ev.opp.etat[0],ev.opp.etat[1]),xp:0,lvl:1+i+ex,up,pil:names[k],sty:rint(0,STYLES.length-1)};
    });
  });
}
/* paiement selon la place */
const payFor=(rank,n)=>n<=2?[1,.35][rank-1]:n===3?[1,.6,.3][rank-1]:([1,.7,.5,.35,.25,.15][rank-1]||.15);
const ordF=r=>r===1?'1er':r+'e';
function mkRow(mn,c,a,ot,ex){
  ot.sort((x,y)=>x.t-y.t); const n=ot.length+1, rank=a==null?n:1+ot.filter(o=>o.t<a).length;
  return Object.assign({d:mn.d,a,b:ot[0].t,bn:ot[0].nom,rank,n,pay:payFor(rank,n),won:rank===1,uid:c.uid},ex);
}
function showOver(row,pad){
  const n=R.ev.manches.length, last=RC.i>=n-1, ov=$('over'); if(!ov||view!=='race') return;
  const v=row.rank===1?'Manche gagnée':row.rank<=3&&row.n>=4?'Podium, '+ordF(row.rank)+' place':ordF(row.rank)+' place sur '+row.n;
  ov.hidden=false;
  ov.innerHTML=`<div class="verdict ${row.rank===1?'v':row.pay>=.5?'p':'d'}" style="font-size:30px;margin:0 0 10px">${v}</div>${rowHTML(row)}
    <p class="note">${row.a==null?'Tu n’as pas franchi la ligne à temps.':row.rank===1?`Tu l’emportes avec ${fmtT(row.b-row.a)} d’avance.`:`Le vainqueur te devance de ${fmtT(row.a-row.b)}.`}${row.pen?` Pénalités : +${row.pen} s.`:''} Cette place rapporte ${Math.round(row.pay*100)} % de la prime.</p>
    <button class="btn wide" data-a="nextm">${last?'Voir le résultat':'Manche suivante'}</button>`;
  const p=document.querySelector(pad), q=$('bQuit'), rs=$('bResp'), au=$('bAud'); [p,q,rs,au].forEach(e=>{if(e) e.style.display='none';});
  ov.scrollIntoView&&ov.scrollIntoView({block:'nearest'});
}
/* --- dessin des cartes --- */
const SHAPES = {
  hatch: ['M10 58 L12 36 L30 18 L110 18 L134 38 L180 44 Q190 46 190 52 L190 58 Z','M32 22 L107 22 L127 37 L24 37 Z'],
  sedan: ['M8 58 L10 40 L40 38 L60 18 L115 18 L140 38 L185 44 Q194 46 194 52 L194 58 Z','M63 22 L113 22 L132 37 L50 37 Z'],
  wagon: ['M8 58 L10 24 Q11 18 18 18 L118 18 L142 38 L186 44 Q194 46 194 52 L194 58 Z','M16 22 L116 22 L135 37 L16 37 Z'],
  suv:   ['M8 58 L8 20 Q9 12 20 12 L120 12 L142 34 L186 38 Q194 40 194 46 L194 58 Z','M14 17 L118 17 L136 33 L14 33 Z'],
  van:   ['M6 58 L6 12 Q6 8 12 8 L132 8 L156 34 L188 40 Q194 42 194 48 L194 58 Z','M118 12 L134 12 L150 32 L118 32 Z'],
  bike:  ['M40 58 L78 26 L128 26 L152 58 M78 26 L100 58 L128 26 M70 20 L86 20 M124 16 L134 26','M0 0'],
  pickup:['M6 58 L6 36 L84 36 L84 14 L128 14 L148 36 L188 40 Q194 42 194 48 L194 58 Z','M90 18 L126 18 L142 35 L90 35 Z'],
  coupe: ['M8 58 L10 44 L34 38 L70 22 L112 22 L142 40 L186 46 Q194 48 194 53 L194 58 Z','M72 26 L110 26 L134 40 L48 40 Z'],
  super: ['M6 58 L8 44 L30 36 L80 26 L110 26 L150 44 L190 50 Q196 51 196 55 L196 58 Z','M84 29 L108 29 L134 41 L70 41 Z']
};
function carSVG(m,etat){
  const [b,w]=SHAPES[m.shape], rust=etat<40;
  return `<svg viewBox="0 0 200 74" class="car${rust?' rust':''}" aria-hidden="true"><ellipse cx="100" cy="70" rx="92" ry="4" fill="var(--t,var(--accent))" opacity=".35"/><path d="${b}" fill="${m.col}" stroke="var(--t,var(--accent))" stroke-width="1.5"/><path d="${w}" fill="var(--glass)"/>${rust?'<g fill="#7A4A2A"><circle cx="34" cy="50" r="5"/><circle cx="104" cy="52" r="4"/><circle cx="168" cy="52" r="3"/><circle cx="122" cy="47" r="2.5"/></g>':''}<g fill="#07080F"><circle cx="48" cy="58" r="13"/><circle cx="152" cy="58" r="13"/></g><g fill="none" stroke="var(--t,var(--accent))" stroke-width="2"><circle cx="48" cy="58" r="6.5"/><circle cx="152" cy="58" r="6.5"/></g></svg>`;
}
function cardHTML(c,o={}){
  const m=M[c.mid], s=st(c), t=TIERS[m.t];
  return `<${o.tag||'button'} class="card ${c.sh?'shiny ':''}${o.cls||''}" style="--t:${t.c}" ${o.attr||''}>
    <div class="card-top"><span class="tier">${t.n}${c.sh?' ✨':''}</span><span>Niv. ${c.lvl}</span></div>
    <div class="card-art">${thArt(c)}</div>
    <div class="card-name">${m.nom}</div>
    <div class="card-sub">${m.cat}, ${TR[m.tr]}</div>
    <div class="etat"><i style="width:${c.etat}%" class="${c.etat<40?'low':c.etat<75?'mid':''}"></i></div>
    <div class="card-foot"><span>${fmt(s.ch)} ch</span><span>${fmt(s.kg)} kg</span><span>${c.etat}&nbsp;%</span></div>
  </${o.tag||'button'}>`;
}

/* --- écrans --- */
function render(){
  const racing=view==='race'&&RC&&(RC.kind==='race'||RC.kind==='spa');
  document.body.classList.toggle('racing',!!racing);
  $('top').innerHTML=`<button class="lv" data-a="pilot" title="Carte pilote">${S.lvl}${pilDot()?'<i class="pdot"></i>':''}</button><span class="who" data-a="pilot">Niveau ${S.lvl}, ${fmt(S.xp)} / ${fmt(need(S.lvl))} XP</span><span class="money">${fmt(S.cr)} cr<small>⚡ ${S.nitro}</small><small class="tk">🎟 ${S.tok}</small></span><button class="mutebtn" data-a="mute" aria-label="Son">${S.audio&&S.audio.mute?'🔇':'🔊'}</button><div class="xp"><i style="width:${clamp(S.xp/need(S.lvl)*100,0,100)}%"></i></div>`;
  const claimable=MISSIONS.some(m=>!S.claimed[m.id]&&m.p(S)[0]>=m.p(S)[1])||questReady()||bdgReady()>0;
  const cur=(view==='prep'||view==='result'||view==='race')?'epreuves':view;
  $('nav').innerHTML=TABS.map(([id,ic,n])=>`<button data-a="tab" data-id="${id}" ${cur===id?'aria-current="page"':''}><b>${ic}</b>${n}${id==='missions'&&claimable?'<i class="dot"></i>':''}</button>`).join('');
  $('view').innerHTML=({garage:vGarage,epreuves:vEpreuves,cartes:vCartes,prep:vPrep,race:vRace,result:vResult,marche:vMarche,base:vBase,missions:vMissions})[view]();
  if(view!==lastView){lastView=view; const vv=$('view'); vv.classList.remove('enter'); void vv.offsetWidth; if(!racing) vv.classList.add('enter');}
  renderSheet();
  if(view==='cartes') bindPacks();
  if(racing) bindRace(); else if(view==='garage') bindGarage(); else glStop();
  auView(view);
}
function vGarage(){
  const t=S.pod.tier, nx=POD_TIER[t+1], open=POD_LVL.filter(l=>S.lvl>=l).length;
  const shown=S.pod.slots.filter((u,i)=>u&&S.lvl>=POD_LVL[i]).length;
  const nextSlot=POD_LVL.find(l=>l>S.lvl);
  const has3d=glEnsure(), view3d=has3d?`<div class="gl" id="gslot"><div class="hint">Glisse pour tourner, touche un podium pour y placer une voiture</div></div>`:`<p class="note">La 3D n’est pas disponible sur cet appareil. Tu peux quand même gérer tes podiums depuis la liste ci-dessous.</p>`;
  const listPods=has3d?'':POD_LVL.map((l,i)=>{const u=S.pod.slots[i], c=u&&car(u); return `<button class="row ${S.lvl<l?'locked':''}" data-a="slot3" data-id="${i}"><span class="ico">🏛️</span><span class="grow"><span class="ttl">Podium ${i+1}</span><br><span class="sub">${S.lvl<l?'Niveau '+l+' requis':c?M[c.mid].nom:'Libre'}</span></span></button>`;}).join('');
  return `<div class="head"><h2>Garage</h2><p>${S.cars.length} voiture${S.cars.length>1?'s':''}</p></div>${view3d}${listPods}
  <div class="row" style="margin-top:10px"><span class="ico">🏛️</span><span class="grow"><span class="ttl">Showroom <span class="plate">${POD_TIER[t].n}</span></span><br>
    <span class="sub">${open} podium${open>1?'s':''} ouvert${open>1?'s':''}, ${shown} occupé${shown>1?'s':''}. Rapporte ${podRate().toFixed(1).replace('.',',')} cr par minute${nextSlot?`. Prochain podium au niveau ${nextSlot}`:''}.</span></span>
    <button class="btn sm" id="pCollect" data-a="collect">Récolter<br>${cr(Math.floor(podPending()))}</button></div>
  ${nx?`<div class="row"><span class="ico">⬆️</span><span class="grow"><span class="ttl">Podiums : ${nx.n}</span><br><span class="sub">${S.lvl<nx.lvl?'Niveau '+nx.lvl+' requis. ':''}Plus de revenus et un plateau plus spectaculaire.</span></span>
    <button class="btn sm" data-a="podup" ${S.lvl<nx.lvl||S.cr<nx.cost?'disabled':''}>Améliorer<br>${cr(nx.cost)}</button></div>`:''}
  <div class="sec"><h3>Collection</h3><div class="grid" style="margin-top:10px">${S.cars.map(c=>cardHTML(c,{attr:`data-a="car" data-id="${c.uid}"`})).join('')}</div>
  <p class="note">Touche une voiture pour la gérer et monter ses modules. Appui long : vue 3D.</p></div>`;
}
function vEpreuves(){
  return `<div class="head"><h2>Épreuves</h2><p>Une voiture par manche</p></div>`+EVENTS.map(ev=>{
    const lock=S.lvl<ev.lvl, few=S.cars.length<ev.manches.length;
    const sub=lock?`Débloquée au niveau ${ev.lvl}`:few?`Il te faut ${ev.manches.length} voitures`:ev.manches.map(m=>DISC[m.d].nom).join(', ');
    return `<button class="row ${lock?'locked':''}" data-a="ev" data-id="${ev.id}" ${lock||few?'disabled':''}>
      <span class="ico">${lock?'🔒':DISC[ev.manches[0].d].ic}</span>
      <span class="grow"><span class="ttl">${ev.nom}</span><br><span class="sub">${sub}</span></span>
      <span class="gain">${cr(ev.gain)}${S.first[ev.id]?'':'<br><span class="sub">×2 la 1<sup>re</sup> fois</span>'}</span></button>`;
  }).join('');
}
function vPrep(){
  const ev=R.ev, ready=R.pick.every(x=>x);
  return `<div class="head"><h2>${ev.nom}</h2><button class="btn alt sm" data-a="tab" data-id="epreuves">Retour</button></div>
  <p class="note">Place la bonne voiture sur chaque manche. La prime dépend de ta place : 1er 100 %, 2e 70 %, 3e 50 %.</p>`+
  ev.manches.map((mn,i)=>{
    const d=DISC[mn.d], me=METEO[mn.m], os=R.opps[i].slice().sort((a,b)=>indice(b,mn)-indice(a,mn)), c=R.pick[i]?car(R.pick[i]):null, stg=mn.sp&&SPA_STAGES.find(s=>s.id===mn.sp);
    return `<div class="manche"><h3>${d.ic} Manche ${i+1} : ${d.nom}${d.calme?'':' '+me.nom+' '+me.ic}<span>${d.aide}${stg?` <b>Spa-Francorchamps : ${stg.nom}, ${((stg.b-stg.a)/1000).toFixed(1).replace('.',',')} km.</b>`:''}</span></h3>
    <div class="duel">
      <div><div class="lab"><span>Ta voiture</span>${c?`<b>${fmt(indice(c,mn))}</b>`:''}</div>
        ${c?cardHTML(c,{cls:'mini',attr:`data-a="slot" data-id="${i}"`}):`<button class="card empty" data-a="slot" data-id="${i}">Choisir une voiture</button>`}</div>
      <div><div class="lab"><span>${os.length} adversaire${os.length>1?'s':''}</span></div>
        <div class="opl">${os.map(o=>`<div><b>${fmt(indice(o,mn))}</b> ${o.pil} <span>${M[o.mid].nom}, ${STYLES[o.sty].n}</span></div>`).join('')}</div></div>
    </div></div>`;
  }).join('')+
  `<div style="display:grid;gap:8px"><button class="btn wide" data-a="go" data-id="manual" ${ready?'':'disabled'}>Prendre le volant</button>
   <button class="btn alt wide" data-a="go" data-id="auto" ${ready?'':'disabled'}>Pilote automatique</button></div>
   ${glEnsure()?'':'<p class="note">La 3D n’est pas disponible sur cet appareil : la course sera simulée automatiquement.</p>'}
   <p class="note">Au volant, tu règles le <b>gaz</b>, le <b>frein</b> et la <b>nitro</b> (⚡ ${S.nitro} en stock). Sur le circuit de Spa tu braques toi-même. Clavier : Z ou ↑ gaz, Q/D ou flèches direction, S ou ↓ frein, Espace frein à main, N nitro, R remise en piste.</p>`;
}
function rowHTML(x){
  const A=x.jury?fmt(x.a)+' pts':(x.a==null?'Abandon':fmtT(x.a)), B=x.jury?fmt(x.b)+' pts':fmtT(x.b);
  return `<div class="res">
    <div class="side ${x.rank===1?'win':''}"><div class="n">${ordF(x.rank)} <small>sur ${x.n}</small></div><div class="who">${x.an}, ${A}</div>${x.ap?'<div class="tag">Panne</div>':''}${x.slides?`<div class="tag">${x.slides} sortie${x.slides>1?'s':''} large${x.slides>1?'s':''}</div>`:''}${x.hits?`<div class="tag">${x.hits} choc${x.hits>1?'s':''}</div>`:''}${x.pen?`<div class="tag">+${x.pen} s de pénalité</div>`:''}${x.nit?`<div class="tag" style="color:var(--accent)">Nitro ×${x.nit}</div>`:''}</div>
    <div class="mid">${DISC[x.d].ic}<br>${DISC[x.d].nom}</div>
    <div class="side r"><div class="who">${x.rank===1?'2e':'Vainqueur'}</div><div class="n" style="font-size:15px">${x.bn}</div><div class="who">${B}</div></div></div>`;
}
function vRace(){
  if(RC.kind==='spa') return vSpa();
  const ev=R.ev, n=ev.manches.length, last=RC.i>=n-1;
  const next=`<button class="btn wide" data-a="nextm">${last?'Voir le résultat':'Manche suivante'}</button>`;
  if(RC.kind==='row'){
    const x=RC.row;
    return `<div class="race"><div class="head"><h2>${DISC[x.d].ic} Manche ${RC.i+1} sur ${n}</h2></div>
      <p class="note">${x.jury?'Le jury compare le style et l’état des deux voitures.':'Course simulée automatiquement : la 3D n’est pas disponible sur cet appareil.'}</p>
      ${x.jury?`<div class="duel" style="margin-bottom:12px"><div>${cardHTML(car(x.uid),{cls:'mini',tag:'div'})}</div><div>${cardHTML(R.opps[RC.i],{cls:'mini',tag:'div'})}</div></div>`:''}
      ${rowHTML(x)}<div class="verdict ${x.won?'v':'d'}" style="font-size:30px;margin-bottom:12px">${x.won?'Manche gagnée':'Manche perdue'}</div>${next}</div>`;
  }
  const auto=RC.auto;
  return `<div class="race"><div class="rwrap"><div class="rs" id="rslot"></div>
    <div class="hud"><div class="hud-top"><span>Manche ${RC.i+1}/${n}, ${DISC[RC.mn.d].nom} ${METEO[RC.mn.m].ic}</span><span id="hTime">0,00 s</span></div>
      <div class="hud-gap" id="hGap"></div><div class="hud-pos" id="hPos"></div>
      <div class="hud-lights" id="hLights"><i></i><i></i><i></i></div>
      <div class="hud-msg" id="hMsg"></div>
      <div class="hud-bot"><div class="spd"><b id="hSpd">0</b><small>km/h</small></div>
        <div class="gauges"><div class="g"><span>Gaz</span><div class="bar2"><i id="gasFill"></i></div></div><div class="g"><span>Nitro</span><div class="bar2 n"><i id="nitFill"></i></div></div></div></div></div>${FXL}</div>
    <div class="pad3">
      <button id="pBrk" class="pedal brk" ${auto?'disabled':''}><span>${auto?'Auto':'Frein'}</span><small>${auto?'le pilote gère':'maintiens'}</small></button>
      <button id="pNit" class="pedal nit">Nitro<small>×${S.nitro}</small></button>
      <button id="pGas" class="pedal gas" ${auto?'disabled':''}><i id="gasPed"></i><span>${auto?'Auto':'Gaz'}<small>${auto?'le pilote gère':'glisse vers le bas pour doser'}</small></span></button>
    </div>
    <div id="over" hidden></div>
    <div style="display:flex;gap:8px"><button class="btn alt sm" id="bAud" data-a="audio">⚙ Son</button><button class="btn danger sm" id="bQuit" data-a="quit">Abandonner l’épreuve</button></div></div>`;
}
function vResult(){
  const r=R.result;
  return `<div class="head"><h2>${R.ev.nom}</h2></div>`+r.rows.map(rowHTML).join('')+
  `<div class="verdict ${r.win?'v':r.pod?'p':'d'}">${r.win?'Victoire':r.pod?'Podium':'Défaite'}</div>
   <p><b class="num" style="font-size:20px;color:var(--yel)">+${fmt(r.gain)} cr</b>, +${r.xp} XP${r.tok?`, +${r.tok} 🎟`:''}${r.first?' (prime de première victoire)':''}</p>
   <p class="note">${r.win?'Tes voitures se sont usées pendant l’épreuve. Pense à l’atelier.':'Répare, améliore, équipe des modules, ou choisis une voiture mieux adaptée à la discipline.'}</p>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="btn alt" data-a="tab" data-id="garage">Garage</button><button class="btn" data-a="ev" data-id="${R.ev.id}">Rejouer</button></div>`;
}
function vBase(){
  return `<div class="head"><h2>Base</h2><p>Tes bâtiments</p></div>`+BATS.map(b=>{
    const l=S.bat[b.id], maxed=l>=b.max, c=maxed?0:b.cout[l];
    return `<div class="row"><span class="ico">${b.ic}</span>
      <span class="grow"><span class="ttl">${b.nom} <span class="plate">${l?'Niv. '+l:'À construire'}</span></span><br>
      <span class="sub">${b.effet(l)}${maxed||!l?'':'<br>Ensuite : '+b.effet(l+1)}</span></span>
      ${maxed?'<span class="sub">Max</span>':`<button class="btn sm" data-a="bat" data-id="${b.id}" ${S.cr<c?'disabled':''}>${l?'Améliorer':'Construire'}<br>${cr(c)}</button>`}</div>`;
  }).join('')+
  `<div class="sec"><h3>Réglages</h3><p class="note">Volume de la musique, des moteurs, des sirènes, des chocs et des menus, avec des préréglages.</p><button class="btn alt" data-a="audio">🔊 Réglages audio</button></div>
   <div class="sec"><h3>Kit de test</h3><p class="note">Pour essayer tout le contenu sans attendre : ajoute les 4 nouveaux véhicules 3D, 50 000 crédits et 20 jetons.</p><button class="btn alt sm" data-a="devkit">Recevoir le kit de test</button></div>
   <div class="sec"><h3>Crédits</h3>
    <p class="note">Circuit « Circuit de Spa-Francorchamps 2022 layout » par Dave Love (Sketchfab), licence CC BY 4.0.</p>
    <p class="note">« Mercedes E Class W212 » par Peter_D (Sketchfab), licence CC BY 4.0.</p>
    <p class="note">« POLICE CAR - Belgian VW Transporter » par Mickael Boitte (Sketchfab), licence CC BY-NC 4.0 : usage non commercial.</p>
    <p class="note">« Subaru 360 (1968) » par geyges, « Audi A6 C7 Limousine » par KOElkast1007, « Old German bicycle WW2 » par TwilightFox (Sketchfab), licence Sketchfab Standard.</p></div>
   <div class="sec"><h3>Partie</h3><p class="note">La progression est enregistrée automatiquement.</p>
   <button class="btn danger sm" data-a="reset">${resetArm?'Confirmer : tout effacer':'Recommencer à zéro'}</button></div>`;
}
/* --- fiches --- */
function openSheet(s){sheet=s; document.body.classList.add('open'); renderSheet(); $('sheet').scrollTop=0;}
function closeSheet(){sheet=null; document.body.classList.remove('open'); if(RC) RC.paused=false;}
function renderSheet(){
  if(!sheet) return;
  const X='<button class="x" data-a="close" aria-label="Fermer">×</button>';
  if(sheetExtra(X)) return;
  if(sheet.t==='intro'){
    $('sheet').innerHTML=`${X}<h2>High &amp; Rouillé</h2>
      <p>Tu démarres avec 1 500 cr, 3 jetons de paquet, deux bouteilles de nitro et une Veloz Piccola en ruine. À toi d’en faire une légende.</p>
      <p><b>1.</b> Répare ton épave dans le garage.<br><b>2.</b> Pilote-la en course : tu gères le gaz, le frein et la nitro.<br><b>3.</b> Expose tes voitures sur les podiums du showroom, ils rapportent des crédits.</p>
      <p class="note">Chaque discipline récompense des qualités différentes : aucune voiture n’est la meilleure partout.</p>
      <button class="btn wide" data-a="close">Ouvrir le garage</button>`;
    return;
  }
  if(sheet.t==='slot'){
    const i=sheet.i, lvl=POD_LVL[i];
    if(S.lvl<lvl){$('sheet').innerHTML=`${X}<h2>Podium ${i+1}</h2><p>Ce podium s’ouvre au niveau ${lvl}. Tu es niveau ${S.lvl}.</p><button class="btn wide" data-a="close">Fermer</button>`; return;}
    const cu=S.pod.slots[i], cc=cu&&car(cu);
    $('sheet').innerHTML=`${X}<h2>Podium ${i+1}</h2><p class="note">Une voiture exposée rapporte des crédits chaque minute. Plus elle est rare et en bon état, plus elle rapporte.</p>`+
      (cc?`<button class="btn danger wide" style="margin-bottom:10px" data-a="podclear">Retirer ${M[cc.mid].nom}</button>`:'')+
      S.cars.filter(c=>c.uid!==cu).map(c=>{const at=S.pod.slots.indexOf(c.uid); return `<button class="row" data-a="podset" data-id="${c.uid}">
        <span class="throw" style="--t:${TIERS[M[c.mid].t].c}">${thArt(c)}</span>
        <span class="grow"><span class="ttl">${M[c.mid].nom}</span><br><span class="sub">${TIERS[M[c.mid].t].n}, état ${c.etat}&nbsp;%${at>=0?', déjà sur le podium '+(at+1):''}</span></span></button>`;}).join('');
    return;
  }
  if(sheet.t==='pick'){
    const i=sheet.i, mn=R.ev.manches[i], o=indice(R.opps[i],mn);
    const list=S.cars.filter(c=>!R.pick.some((u,j)=>u===c.uid&&j!==i)).sort((a,b)=>indice(b,mn)-indice(a,mn));
    $('sheet').innerHTML=`${X}<h2>${DISC[mn.d].nom}</h2><p class="note">${DISC[mn.d].aide} Indice adverse : <b>${fmt(o)}</b></p>`+
      (list.length?list.map(c=>{const v=indice(c,mn);return `<button class="row" data-a="pick" data-id="${c.uid}">
        <span class="throw" style="--t:${TIERS[M[c.mid].t].c}">${thArt(c)}</span>
        <span class="grow"><span class="ttl">${M[c.mid].nom}</span><br><span class="sub">${TR[M[c.mid].tr]}, état ${c.etat}&nbsp;%</span></span>
        <span class="gain" style="color:${v>=o?'var(--good)':'var(--bad)'}">${fmt(v)}</span></button>`}).join('')
      :'<p>Toutes tes voitures sont déjà placées sur une autre manche.</p>');
    return;
  }
  if(sheet.t==='car'){
    const c=car(sheet.uid); if(!c){closeSheet();return;}
    const m=M[c.mid], s=st(c), t=TIERS[m.t], rc=repCost(c), maxUp=Math.min(4,S.bat.atelier);
    const bar=(n,v)=>`<div class="bar"><span>${n}</span><span class="tr"><i style="width:${Math.min(100,v)}%"></i></span><span class="num">${fmt(v)}</span></div>`;
    $('sheet').innerHTML=`${X}
      <span class="plate" style="background:${t.c};color:#fff">${t.n}</span>
      <h2 style="margin-top:6px">${m.nom}</h2>
      <p class="note" style="margin:2px 0 0">${m.cat} de ${m.an}, ${TR[m.tr]}. Niveau ${c.lvl}${c.lvl<20?` (${c.xp} / ${60*c.lvl} XP)`:' (max)'}</p>
      <div class="thhero" style="--t:${t.c}">${thArt(c)}<button data-a="view3d">Voir en 3D ⟳</button></div>
      <div class="row" style="margin-top:8px"><span class="grow"><span class="ttl">${etatMot(c.etat)}, ${c.etat}&nbsp;%</span>
        <div class="etat"><i style="width:${c.etat}%" class="${c.etat<40?'low':c.etat<75?'mid':''}"></i></div>
        <span class="sub">Un mauvais état réduit les performances et augmente le risque de panne.</span></span>
        ${c.etat<100?`<button class="btn sm" data-a="repair" ${S.cr<Math.ceil(repUnit(c))?'disabled':''}>Réparer<br>${cr(Math.min(rc,Math.max(S.cr,Math.ceil(repUnit(c)))))}</button>`:''}</div>
      <div class="statgrid">
        <div><b>${fmt(s.ch)} ch</b><span>Puissance</span></div><div><b>${fmt(s.nm)} Nm</b><span>Couple</span></div><div><b>${fmt(s.kg)} kg</b><span>Poids</span></div>
        <div><b>${s.t100.toFixed(1).replace('.',',')} s</b><span>0 à 100 km/h</span></div><div><b>${fmt(s.vmax)} km/h</b><span>Vitesse max</span></div><div><b>${fmt(s.pw)} ch/t</b><span>Poids/puissance</span></div>
      </div>
      ${bar('Adhérence',s.adh)}${bar('Freinage',s.fre)}${bar('Maniabilité',s.man)}${bar('Fiabilité',s.fia)}${bar('Style',s.sty)}
      <div class="sec" style="margin-top:16px"><h3>Aptitudes</h3><p class="note">Indice par discipline, sur le sec, dans l’état actuel.</p>
        <div class="chips">${Object.keys(DISC).map(k=>`<span class="chip">${DISC[k].ic} ${DISC[k].nom}<b>${fmt(indice(c,{d:k,m:'sec'}))}</b></span>`).join('')}</div></div>
      
      <div class="sec" style="margin-top:16px"><h3>Modules</h3><p class="note">Les cartes de modules s’obtiennent dans Marché › Cartes. Elles changent les stats et l’apparence.</p><div class="eqbar"><button class="btn good sm" data-a="eqbest">⚡ Équiper les meilleures</button><button class="btn alt sm" data-a="eqnone" ${Object.keys(c.mods||{}).length?'':'disabled'}>Tout retirer</button></div>
        ${tilesHTML(c)}</div>
      <div class="sec" style="margin-top:18px"><h3>Améliorations</h3><p class="note">Ton atelier (niv. ${S.bat.atelier}) monte les pièces jusqu’au palier ${PALIERS[maxUp]}.</p>
      ${PARTS.map(p=>{const l=c.up[p.id]||0, maxed=l>=4, blocked=l>=maxUp, k=upCost(c,l);
        return `<div class="row"><span class="ico">${p.ic}</span><span class="grow"><span class="ttl">${p.nom} <span class="plate">${PALIERS[l]}</span></span><br><span class="sub">${p.effet} par palier</span></span>
        ${maxed?'<span class="sub">Max</span>':blocked?'<span class="sub">Atelier trop petit</span>':`<button class="btn sm" data-a="up" data-id="${p.id}" ${S.cr<k?'disabled':''}>${PALIERS[l+1]}<br>${cr(k)}</button>`}</div>`}).join('')}</div>
      <div class="sec" style="margin-top:14px"><button class="btn danger wide" data-a="sell" ${S.cars.length<2?'disabled':''}>${sheet.arm?'Confirmer la vente':'Vendre'} pour ${cr(prixVente(c))}</button>
      ${S.cars.length<2?'<p class="note">Impossible de vendre ta dernière voiture.</p>':''}</div>`;
  }
}

let toastT;
function toast(msg){const t=$('toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'),2400);}

/* ---------- 3) COURSE EN 3D ---------- */
const hash = (i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453; return x-Math.floor(x);};

/* Circuit : segments droits (S) et virages (C). Les virages tournent à gauche ou à droite. */
function trackFor(ev,mn){
  const idx=EVENTS.indexOf(ev), k=1+idx*.12, h0=hash(idx,4)>.5?1:-1; let x=0, ci=0;
  const segs=TRACKS[mn.d].map(([t,len,base])=>{
    const L=t==='S'?len*(mn.d==='drag'?Math.min(k,1.35):k):len, s={t,a:x,b:x+L,base};
    if(t==='C'){s.dir=h0*(ci++%2?-1:1); s.ang=clamp(L*.0155,.8,1.55);}
    x+=L; return s;
  });
  return {segs,L:x};
}
/* Transforme une carte en voiture de course : chaque stat devient un paramètre physique */
function mkRacer(c,mn,drv){
  const s=st(c), d=DISC[mn.d], me=METEO[mn.m];
  const ef=.55+.45*c.etat/100, lv=1+.015*(c.lvl-1), wet=me.f?Math.min(1.05,me.f(s)*(1+(s.sp.wet||0))):1, trb=d.tr[s.tr]||1;
  const base=mn.d==='drift'?s.man*.6+s.pui*.4:s.adh*.6+s.man*.4;
  const grip=base*wet*(mn.d==='rallye'?.9:1)*(mn.d==='drag'?1:trb)*sk(c,'grip',.012);
  const pP=(c.uid>0?1-.1*pk('rel'):1)*(100-s.fia)/500*(1.5-c.etat/100)*(mn.d==='endurance'?2.5:1);
  return {c, m:M[c.mid], nom:M[c.mid].nom,
    A:(2+s.acc*.09)*ef*lv*(mn.d==='drag'?trb:1)*sk(c,'acc',.015),
    VM:s.vmax/3.6*(.8+.2*ef),
    B:(6+s.fre*.12)*Math.sqrt(wet)*sk(c,'brk',.02),
    TR:(3.5+s.adh*.07)*wet*({AWD:1.25,RWD:1,FWD:.9}[s.tr]),
    cm:b=>b/3.6*(.55+grip/90), gc:.55+grip/90, nP:1+(s.sp.nitP||0)+(c.uid>0?.04*pk('nit'):0), nD:1+(s.sp.nitD||0)+(c.uid>0?.08*pk('nit'):0), dR:1/(1+Math.max(0,s.sp.dmg||0)), oB:1+(s.sp.off||0), xB:s.sp.xp||0,
    slideK:.6+s.man/400,
    panneAt:null, pP, skill:drv.skill, err:drv.err, react:drv.react,
    x:0,v:0,a:0,si:0,cur:null,go:false,fin:null,nitroT:0,boostT:0,panneT:0,slide:false,slides:0,nit:0,panned:false,msg:null,perfect:null,aiSeg:null,aiTarget:0,drift:0,pen:null,braking:false};
}
/* inp = {thr: 0 à 1, brake: bool} */
function step(r,inp,dt,tk,clock){
  if(r.fin!=null){r.v=Math.max(0,r.v-9*dt); r.x+=r.v*dt; r.a=-9; r.braking=true; return;}
  if(!r.go){r.a=0; return;}
  let seg=tk.segs[r.si];
  while(r.x>=seg.b&&r.si<tk.segs.length-1) seg=tk.segs[++r.si];
  if(seg!==r.cur){
    if(r.cur&&r.cur.t==='C'&&r.perfect===r.cur) r.boostT=1.2;
    r.cur=seg;
    if(seg.t==='C'){
      const cm=r.cm(seg.base);
      if(r.v>cm*1.05){r.slide=true; r.slideTo=cm*r.slideK; r.slides++; r.msg='slide';}
      else if(r.v>=cm*.9){r.perfect=seg; r.msg='perfect';}
    } else r.slide=false;
  }
  const nit=r.nitroT>0; if(nit) r.nitroT-=dt; if(r.boostT>0) r.boostT-=dt;
  const vm=r.VM*(nit?1.18:1), thr=inp.brake?0:clamp(inp.thr,0,1);
  let drive=r.A*(nit?1.6*(r.nP||1):1)*(r.boostT>0?1.25:1)*(1-r.v/vm);
  if(drive>0) drive*=thr;
  let a=drive-(1-thr)*1.8;
  a=Math.min(a,r.TR*(nit?1.15:1));
  if(r.panneAt!=null&&r.x>=r.panneAt){r.panneAt=null; r.panneT=2; r.panned=true; r.msg='panne';}
  if(r.panneT>0){r.panneT-=dt; a=-1.5;}
  if(inp.brake) a=Math.min(a,-r.B);
  if(seg.t==='C'){
    const cm=r.cm(seg.base);
    if(r.slide){a=-16; if(r.v<=r.slideTo) r.slide=false;}
    else if(r.v>cm) a=Math.min(a,-6);
    else if(r.v+a*dt>cm) a=(cm-r.v)/dt;
  }
  r.braking=!!inp.brake||r.slide;
  r.a=a; r.v=Math.max(0,r.v+a*dt); r.x+=r.v*dt;
  if(r.x>=tk.L) r.fin=clock-(r.x-tk.L)/Math.max(r.v,1);
}
function nextCorner(r,tk){for(let i=r.si;i<tk.segs.length;i++){const s=tk.segs[i]; if(s.t==='C'&&s.a>r.x) return s;} return null;}
function ai(r,tk){
  const nc=nextCorner(r,tk); if(!nc) return {brake:false};
  if(nc!==r.aiSeg){r.aiSeg=nc; r.aiTarget=r.cm(nc.base)*(Math.random()<r.err?rnd(1.07,1.16):rnd(r.skill,1));}
  const d=(r.v*r.v-r.aiTarget*r.aiTarget)/(2*r.B);
  return {brake:r.v>r.aiTarget&&nc.a-r.x<=d+r.v*.04};
}
const aiIn=(r,tk)=>{const b=ai(r,tk).brake; return {thr:b?0:1,brake:b};};
function armPanne(r,tk){if(Math.random()<r.pP) r.panneAt=tk.L*rnd(.25,.8);}

/* --- logique de manche --- */
function leaveRace(){
  glStop(); if(RS&&RS.scene) disposeScene(RS.scene); RS=null; RC=null; auRaceStop();
}
function startManche(i){
  glStop(); if(RS&&RS.scene) disposeScene(RS.scene); RS=null;
  const ev=R.ev, mn=ev.manches[i], c=car(R.pick[i]), opps=R.opps[i], idx=EVENTS.indexOf(ev);
  if(DISC[mn.d].calme){
    const a=indice(c,mn)*rnd(.94,1.06), ot=opps.map(o=>({nom:o.pil+' ('+M[o.mid].nom+')',t:-indice(o,mn)*rnd(.94,1.06)}));
    const row=mkRow(mn,c,-a,ot,{jury:true,an:M[c.mid].nom}); row.a=a; row.b=-row.b;
    R.rows.push(row); RC={kind:'row',i,row}; view='race'; render(); document.querySelector('main').scrollTop=0; return;
  }
  if(mn.d==='circuit'&&TRK.ready&&glEnsure()) return startSpa(i);
  const tk=trackFor(ev,mn), has3d=glEnsure();
  const P=mkRacer(c,mn,{skill:.86,err:.07,react:rnd(.3,.5)});
  const Os=opps.map(o=>{const r=mkRacer(o,mn,{skill:clamp(.8+idx*.016+S.lvl*.003+STYLES[o.sty].sk+rnd(-.015,.015),.78,.975),err:Math.max(.025,.14-idx*.012-S.lvl*.003),react:rnd(.25,.55)}); r.pil=o.pil; return r;});
  const all=[P].concat(Os), L=all.length===2?[-2.2,2.2]:all.length===3?[0,-3.5,3.5]:all.map((_,k)=>-4.4+8.8*k/(all.length-1));
  all.forEach((r,k)=>{r.lane=L[k]; armPanne(r,tk);});
  RC={kind:'race',i,mn,tk,auto:R.auto||!has3d,clock:-3.4,inp:{t:0,k:0,b:false,kb:false},flash:null,endAt:null,done:false,P,Os,O:Os[0]};
  if(!has3d){
    while(!RC.done&&RC.clock<260) tick(1/60);
    RC={kind:'row',i,row:R.rows[R.rows.length-1]}; view='race'; render(); document.querySelector('main').scrollTop=0; return;
  }
  RS=buildRace(ev,mn,tk,P,Os);
  auRaceStart({pm:P.m,oms:Os.map(o=>o.m),rain:mn.m==='pluie',siren:P.m.glb==='patrouille',drag:mn.d==='drag'});
  view='race'; render(); document.querySelector('main').scrollTop=0;
}
function flash(txt,col,dur){if(txt==='Départ parfait') auTry(auDing); if(RC) RC.flash={txt,col,until:RC.clock+(dur||1.1)};}
const inThr=()=>Math.max(RC.inp.t,RC.inp.k);
function fireNitro(){
  if(!RC||(RC.kind!=='race'&&RC.kind!=='spa')||RC.done) return;
  const P=RC.P; if(!P.go||P.fin!=null||P.nitroT>0) return;
  if(S.nitro<1){flash('Plus de nitro','#FF4D6D'); return;}
  S.nitro--; bump('nitroN'); fxFlash('nit'); P.nit++; P.nitroT=NITRO_DUREE*((P.r||P).nD||1); flash('Nitro','#00E5FF',.9); auNitro();
  try{navigator.vibrate&&navigator.vibrate(40);}catch(e){}
  const b=$('pNit'); if(b){const sm=b.querySelector('small'); if(sm) sm.textContent='×'+S.nitro;}
}
function tick(dt){
  const P=RC.P, Os=RC.Os, tk=RC.tk; RC.clock+=dt; const t=RC.clock;
  if(t<0){
    if(!RC.auto&&inThr()>.05&&P.pen==null){P.pen=.8; flash('Faux départ, −0,8 s','#FF4D6D',1.6);}
    return;
  }
  Os.forEach(o=>{if(!o.go&&t>=o.react) o.go=true;});
  const ipt={thr:inThr(),brake:RC.inp.b||RC.inp.kb};
  if(!P.go){
    if(RC.auto){if(t>=P.react) P.go=true;}
    else if(ipt.thr>.05&&t>=(P.pen||0)){P.go=true; if(!P.pen) flash(t<.25?'Départ parfait':'Parti','#3CFF9E',.9);}
  }
  step(P,RC.auto?aiIn(P,tk):ipt,dt,tk,t); Os.forEach(o=>step(o,aiIn(o,tk),dt,tk,t));
  RC.O=Os.reduce((a,b)=>Math.abs(b.x-P.x)<Math.abs(a.x-P.x)?b:a); RC.pos=1+Os.filter(o=>o.x>P.x).length;
  if(P.msg){
    if(P.msg==='slide'){flash('Trop vite','#FF4D6D',1.3); try{navigator.vibrate&&navigator.vibrate([60,40,60]);}catch(e){}}
    if(P.msg==='perfect') flash('Virage parfait','#3CFF9E',.9);
    if(P.msg==='panne') flash('Panne moteur','#FCEE0A',1.8);
    P.msg=null;
  }
  if(P.fin!=null&&RC.endAt==null) RC.endAt=t+1.3;
  if(P.fin==null&&Os.every(o=>o.fin!=null)&&t>Math.max.apply(null,Os.map(o=>o.fin))+12){P.dnf=true; RC.endAt=t;}
  if(t>240&&RC.endAt==null){P.dnf=true; RC.endAt=t;}
  if(RC.endAt!=null&&t>=RC.endAt&&!RC.done) endManche();
}
function endManche(){
  const P=RC.P, tk=RC.tk, c=P.c; RC.done=true;
  const a=P.dnf?null:P.fin+(P.pen||0)*0, ot=RC.Os.map(o=>({nom:o.pil+' ('+o.nom+')',t:o.fin!=null?o.fin:RC.clock+(tk.L-o.x)/Math.max(o.v,5)}));
  c.etat=Math.max(5,c.etat-Math.round((rint(2,5)+P.slides+(P.panned?8:0))*wearK()));
  const row=mkRow(RC.mn,c,a,ot,{ap:P.panned,nit:P.nit,slides:P.slides,an:P.nom,xpB:P.xB||0});
  R.rows.push(row); auFinish(row.rank===1); showOver(row,'.pad3');
}
function finalize(forfeit){
  leaveRace();
  const ev=R.ev, n=ev.manches.length, rows=R.rows;
  const pay=forfeit?Math.min(.1,rows.reduce((t,x)=>t+x.pay,0)/n):rows.reduce((t,x)=>t+x.pay,0)/n;
  const win=!forfeit&&pay>=.85, pod=!forfeit&&pay>=.5, first=win&&!S.first[ev.id];
  const gain=Math.round(ev.gain*ECO.gain*(1+.04*pk('gain'))*(1+.1*S.bat.bureau)*Math.max(.1,pay)*(first?2:1)), xp=Math.round(ev.xp*1.3*(1+.06*pk('xp'))*(.3+.7*pay)*(S.xpb>0?1.5:1)*(1+.1*(S.bat.simu||0))*(1+rows.reduce((t,x)=>t+(x.xpB||0),0)/Math.max(1,rows.length)));
  const tok=(first?3:win?1:0)+(win&&Math.random()<.06*pk('tok')?1:0);
  S.cr+=gain; S.tok+=tok; S.stats.races++; bump('earned',gain); if(S.xpb>0) S.xpb--; if(S.ins>0) S.ins--; rows.forEach(x=>{if(x.won) bump('w_'+x.d);});
  if(win){S.stats.wins++; S.first[ev.id]=1; if(n>=3) S.stats.wins3++;}
  if(pod&&rows.some(x=>x.n>=6&&x.rank<=3)) S.stats.pods++;
  rows.forEach(x=>addCarXP(car(x.uid),Math.round(ev.xp*(.25+.25*pay))));
  addXP(xp);
  S.age++; if(S.age>=3) newOffres();
  R.result={rows,win,pod,gain,xp,first,tok};
  view='result'; save(); render(); document.querySelector('main').scrollTop=0;
}
/* ---------- moteur 3D (Three.js) ---------- */
const GL={r:null,raf:0,last:0,tick:null,scene:null,cam:null,slot:null,w:0,h:0,mode:null,bound:false};
function glEnsure(){
  if(GL.r) return true; if(!window.THREE) return false;
  try{
    GL.r=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
    GL.r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)); GL.r.setClearColor(0x080612);
    bindGarageInput(GL.r.domElement); bindViewerInput(GL.r.domElement); return true;
  }catch(e){GL.r=null; return false;}
}
function glAttach(id){
  const s=$(id); if(!s||!GL.r) return; const c=GL.r.domElement;
  c.style.cssText='display:block;width:100%;height:100%';
  if(c.parentNode!==s) s.insertBefore(c,s.firstChild); GL.slot=s; GL.w=0; glSize();
}
function glSize(){
  const s=GL.slot; if(!s||!GL.r) return; const w=s.clientWidth, h=s.clientHeight;
  if(w&&h&&(w!==GL.w||h!==GL.h)){GL.w=w; GL.h=h; GL.r.setSize(w,h,false); if(GL.cam){GL.cam.aspect=w/h; GL.cam.updateProjectionMatrix();}}
}
function glRun(scene,cam,tick,mode){
  glStop(); GL.scene=scene; GL.cam=cam; GL.tick=tick; GL.mode=mode; GL.last=0;
  GL.r.domElement.style.touchAction=(mode==='race'||mode==='viewer')?'none':'pan-y';
  if(GL.w&&GL.h){cam.aspect=GL.w/GL.h; cam.updateProjectionMatrix();}
  GL.raf=requestAnimationFrame(glFrame);
}
function glStop(){if(GL.raf){cancelAnimationFrame(GL.raf); GL.raf=0;} GL.tick=null; GL.mode=null; GL.post=null;}
function glFrame(ts){
  if(!GL.tick){GL.raf=0; return;}
  const dt=GL.last?Math.min(.05,(ts-GL.last)/1000):0; GL.last=ts;
  glSize(); GL.tick(dt,ts/1000); GL.r.render(GL.scene,GL.cam); if(GL.post) GL.post(); GL.raf=requestAnimationFrame(glFrame);
}
function disposeScene(sc){
  sc.traverse(o=>{
    if(o.geometry) o.geometry.dispose();
    if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.map) m.map.dispose(); m.dispose();});
  });
}
function ctex(w,h,draw,rep){
  const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; if(rep) t.repeat.set(rep[0],rep[1]); return t;
}
function labelSprite(txt,col,scale){
  const t=ctex(256,64,(x,W,H)=>{x.fillStyle='rgba(6,4,20,.82)'; x.fillRect(0,0,W,H); x.strokeStyle=col; x.lineWidth=3; x.strokeRect(2,2,W-4,H-4); x.fillStyle=col; x.font='700 28px "Chakra Petch",Arial,sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(txt,W/2,H/2+2);});
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,fog:false})); s.scale.set(scale,scale/4,1); return s;
}

/* Voitures 3D : chaque modèle est construit en formes simples, on remplacera par tes fichiers 3D */
const CAR3D={hatch:{L:4,W:1.8,h:.6,cl:2.1,ch:.55,cx:-.2},sedan:{L:4.7,W:1.85,h:.58,cl:2.4,ch:.5,cx:-.2},wagon:{L:4.6,W:1.8,h:.62,cl:3,ch:.58,cx:-.35},
  suv:{L:4.4,W:1.9,h:.85,cl:2.7,ch:.62,cx:-.25},van:{L:4.7,W:1.9,h:1.25,cl:2.6,ch:.7,cx:.3},bike:{L:1.8,W:.5,h:.5,cl:.4,ch:.3,cx:0},pickup:{L:5.1,W:1.95,h:.8,cl:1.5,ch:.62,cx:.6},coupe:{L:4.5,W:1.85,h:.52,cl:1.9,ch:.46,cx:-.2},super:{L:4.5,W:2,h:.46,cl:1.8,ch:.4,cx:-.1}};
function buildCar(m,accent,look){
  if(m.glb&&MODELS[m.glb]) return buildGlb(m,accent,look);
  const d=CAR3D[m.shape], g=new THREE.Group(), R0=.34, by=R0*.9+d.h/2, wheels=[], tail=[];
  const col=paintOf(look)||new THREE.Color(m.col), ac=new THREE.Color(accent);
  const mb=new THREE.MeshLambertMaterial({color:col}), ma=new THREE.MeshBasicMaterial({color:ac});
  const body=new THREE.Mesh(new THREE.BoxGeometry(d.L,d.h,d.W),mb); body.position.y=by; g.add(body);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(d.cl,d.ch,d.W*.84),new THREE.MeshLambertMaterial({color:0x16324a,emissive:0x0a2030})); cab.position.set(d.cx,by+d.h/2+d.ch/2,0); g.add(cab);
  [1,-1].forEach(sd=>{const s=new THREE.Mesh(new THREE.BoxGeometry(d.L*.92,.05,.04),ma); s.position.set(0,by-.02,sd*(d.W/2+.01)); g.add(s);});
  if(m.shape==='super'||m.shape==='coupe'){
    const w=new THREE.Mesh(new THREE.BoxGeometry(.55,.06,d.W*.92),mb); w.position.set(-d.L/2+.25,by+d.h/2+.38,0); g.add(w);
    [1,-1].forEach(sd=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.08,.36,.06),mb); p.position.set(-d.L/2+.25,by+d.h/2+.18,sd*d.W*.3); g.add(p);});
  }
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(d.L*1.2,d.W*1.5),new THREE.MeshBasicMaterial({color:ac,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
  glow.rotation.x=-Math.PI/2; glow.position.y=.05; g.add(glow);
  const wg=new THREE.CylinderGeometry(R0,R0,.28,18), rg=new THREE.CylinderGeometry(R0*.55,R0*.55,.3,12), sg=new THREE.BoxGeometry(R0*1.5,R0*.18,.32), wm=new THREE.MeshLambertMaterial({color:0x08090f});
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([fx,fz])=>{
    const p=new THREE.Group(); p.position.set(fx*d.L*.31,R0,fz*(d.W/2-.05));
    const w=new THREE.Mesh(wg,wm); w.rotation.x=Math.PI/2; const r=new THREE.Mesh(rg,ma); r.rotation.x=Math.PI/2; const sp=new THREE.Mesh(sg,ma);
    p.add(w); p.add(r); p.add(sp); g.add(p); wheels.push(p);
  });
  const hm=new THREE.MeshBasicMaterial({color:0xeaffff});
  [1,-1].forEach(sd=>{
    const h=new THREE.Mesh(new THREE.BoxGeometry(.05,.14,.4),hm); h.position.set(d.L/2+.01,by+.04,sd*d.W*.32); g.add(h);
    const tm=new THREE.MeshBasicMaterial({color:0x6a0f1c}); tail.push(tm);
    const t=new THREE.Mesh(new THREE.BoxGeometry(.05,.14,.5),tm); t.position.set(-d.L/2-.01,by+.04,sd*d.W*.32); g.add(t);
  });
  const flame=new THREE.Group();
  [1,-1].forEach(sd=>{const f=new THREE.Mesh(new THREE.ConeGeometry(.28,2.4,8),new THREE.MeshBasicMaterial({color:0x7df3ff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})); f.rotation.z=Math.PI/2; f.position.set(-d.L/2-1.2,by-.05,sd*d.W*.28); flame.add(f);});
  flame.visible=false; g.add(flame);
  addLook(g,{x0:-d.L/2,x1:d.L/2,W:d.W,deck:by+d.h/2,hood:by+d.h/2,H:by+d.h/2+d.ch,wr:R0,ww:.15},look,wheels); tintFlame(flame,look);
  return {shine:look&&look.shiny?[mb]:[],g,wheels,tail,flame,L:d.L,H:by+d.h/2+d.ch,wr:.34,brake:on=>tail.forEach(t=>t.color.setHex(on?0xff2244:0x6a0f1c))};
}


/* Modèles 3D fournis (format compact : géométrie binaire + textures réduites) */
const MODELS={}, MODEL_IDS=['patrouille','subi','audi','merco','velo'];
let modelsP=null, modelsBusy=false;
function b64buf(id){const t=document.getElementById(id).textContent.trim(), bin=atob(t), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u.buffer;}
const loadImg=src=>new Promise((res,rej)=>{const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src;});
async function loadModel(id){
  const meta=JSON.parse(document.getElementById('mdl-'+id).textContent), buf=b64buf('bin-'+id);
  const tex=await Promise.all(meta.images.map(async src=>{const t=new THREE.Texture(await loadImg(src)); t.flipY=false; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; t.needsUpdate=true; return t;}));
  const root=new THREE.Group(); let tailMat=null, tailE=[.45,.45,.45];
  meta.parts.forEach(p=>{
    const g=new THREE.BufferGeometry(); let mat; const m=p.mat;
    if(meta.v===2){
      g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buf,p.p,p.nv*3),3));
      g.setAttribute('normal',new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(new Int8Array(buf,p.n,p.nv*4),4),3,0,true));
      g.setIndex(new THREE.BufferAttribute(new Uint16Array(buf,p.i,p.ni),1));
      if(p.u!=null){ g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(buf,p.u,p.nv*2),2)); mat=new THREE.MeshLambertMaterial({map:tex[m.map],side:THREE.DoubleSide}); }
      else{
        const cb=new Uint8Array(buf,p.c,p.nv*4);
        if(m.paint) mat=new THREE.MeshLambertMaterial({color:new THREE.Color(cb[0]/255,cb[1]/255,cb[2]/255),side:THREE.DoubleSide});
        else if(m.tr) mat=new THREE.MeshLambertMaterial({color:new THREE.Color(m.col[0],m.col[1],m.col[2]),transparent:true,opacity:m.a,side:THREE.DoubleSide,depthWrite:false});
        else{ g.setAttribute('color',new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(cb,4),3,0,true)); mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
          if(m.e){mat.emissive=new THREE.Color(m.e[0],m.e[1],m.e[2]); if(m.tail){tailMat=mat; tailE=m.e;}} }
      }
    } else {
      const o=p.o;
      g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buf,o[0],p.nv*3),3));
      g.setAttribute('normal',new THREE.BufferAttribute(new Int8Array(buf,o[1],p.nv*3),3,true));
      g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(buf,o[2],p.nv*2),2));
      g.setIndex(new THREE.BufferAttribute(p.i32?new Uint32Array(buf,o[3],p.ni):new Uint16Array(buf,o[3],p.ni),1));
      mat=new THREE.MeshLambertMaterial({color:new THREE.Color(m.c[0],m.c[1],m.c[2]),map:m.map>=0?tex[m.map]:null,transparent:!!m.tr,opacity:m.a,side:THREE.DoubleSide,depthWrite:!m.tr});
      if(m.em>=0){mat.emissive=new THREE.Color(.45,.45,.45); mat.emissiveMap=tex[m.em]; tailMat=mat;}
    }
    const mesh=new THREE.Mesh(g,mat); if((m&&m.paint)||p.name==='carosserieLOW.1') mesh.userData.paint=1;
    if(p.wheel){const pv=new THREE.Group(); pv.name='wheel'; pv.position.set(p.wheel[0],p.wheel[1],p.wheel[2]); pv.add(mesh); root.add(pv);} else root.add(mesh);
  });
  MODELS[id]={root,len:meta.len,cx:meta.cx||0,h:meta.h,w:meta.w,sirens:meta.sirens||[],tailMat,tailE,meta};
}
function ensureModels(){
  if(modelsP) return modelsP;
  if(!window.THREE||!glEnsure()) return (modelsP=Promise.resolve());
  modelsBusy=true;
  modelsP=Promise.all(MODEL_IDS.filter(id=>document.getElementById('mdl-'+id)).map(id=>loadModel(id).catch(e=>{try{console.warn('modèle',id,e);}catch(_){}}))).then(()=>{modelsBusy=false; GG.sig=null; if(view==='garage') render(); thPump();});
  return modelsP;
}
function buildGlb(m,accent,look){
  const M0=MODELS[m.glb], me=M0.meta, g=new THREE.Group(), body=M0.root.clone(true), ac=new THREE.Color(accent), L=M0.len, shine=[], pc=paintOf(look);
  g.add(body);
  const wheels=body.children.filter(c=>c.name==='wheel');
  if(pc||(look&&look.shiny)) body.traverse(o=>{ if(o.userData.paint){o.material=o.material.clone(); if(pc) o.material.color.copy(pc); if(look.shiny) shine.push(o.material);} });
  const D=me.v===2?{x0:me.x0,x1:me.x1,W:Math.min(me.w,2),deck:me.deck,hood:me.hood,H:me.h,wr:me.wr,ww:.14}:{x0:-L/2,x1:L/2,W:1.9,deck:M0.h,hood:1.15,H:M0.h,wr:.375,ww:.13};
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(L*1.2,D.W+.5),new THREE.MeshBasicMaterial({color:ac,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
  glow.rotation.x=-Math.PI/2; glow.position.y=.05; g.add(glow);
  const sir=M0.sirens.map(q=>{const mt=new THREE.MeshBasicMaterial({color:0x07102a}); const s=new THREE.Mesh(new THREE.BoxGeometry(.25,.1,.5),mt); s.position.set(q[0],q[1],q[2]); g.add(s); return mt;});
  const flame=new THREE.Group();
  [1,-1].forEach(sd=>{const f=new THREE.Mesh(new THREE.ConeGeometry(.28,2.4,8),new THREE.MeshBasicMaterial({color:0x7df3ff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})); f.rotation.z=Math.PI/2; f.position.set(D.x0-1.2,Math.min(.6,D.H*.4),sd*Math.min(.55,D.W*.28)); flame.add(f);});
  flame.visible=false; g.add(flame);
  addLook(g,D,look,wheels); tintFlame(flame,look);
  const tm=M0.tailMat, e=M0.tailE;
  return {g,wheels,tail:[],flame,L,H:M0.h,wr:D.wr,sirens:sir.length?sir:null,shine,brake:on=>{if(tm) tm.emissive.setRGB(e[0]*(on?3:1),e[1],e[2]);}};
}
function pulseSirens(c,t){if(!c||!c.sirens) return; const ph=Math.floor(t*5)%2; c.sirens[0].color.setHex(ph?0x2f6bff:0x07102a); c.sirens[1].color.setHex(ph?0x07102a:0x2f6bff);}

/* --- piste --- */
function buildPath(tk){
  const STEP=2, PRE=80, POST=220, n=Math.ceil((tk.L+PRE+POST)/STEP)+1, px=[], pz=[], th=[]; let x=0, z=0, h=0;
  for(let i=0;i<n;i++){
    const s=-PRE+i*STEP; px.push(x); pz.push(z); th.push(h);
    const sg=tk.segs.find(q=>s>=q.a&&s<q.b);
    if(sg&&sg.t==='C') h+=sg.dir*sg.ang/((sg.b-sg.a)/STEP);
    x+=Math.cos(h)*STEP; z+=Math.sin(h)*STEP;
  }
  return {px,pz,th,STEP,PRE,POST,n};
}
function pathAt(Pa,s,lane){
  const f=clamp((s+Pa.PRE)/Pa.STEP,0,Pa.n-1.001), i=Math.floor(f), u=f-i;
  const th=Pa.th[i]+(Pa.th[i+1]-Pa.th[i])*u, x=Pa.px[i]+(Pa.px[i+1]-Pa.px[i])*u, z=Pa.pz[i]+(Pa.pz[i+1]-Pa.pz[i])*u;
  return {x:x+Math.sin(th)*lane, z:z-Math.cos(th)*lane, th};
}
function ribbon(Pa,off0,off1,y,i0,i1,vs){
  const pos=[], uv=[], idx=[]; let k=0;
  for(let i=i0;i<=i1;i++){
    const th=Pa.th[i], nx=Math.sin(th), nz=-Math.cos(th), x=Pa.px[i], z=Pa.pz[i], s=-Pa.PRE+i*Pa.STEP;
    pos.push(x+nx*off0,y,z+nz*off0,x+nx*off1,y,z+nz*off1); uv.push(0,s/vs,1,s/vs);
    if(i<i1) idx.push(k,k+1,k+2,k+1,k+3,k+2); k+=2;
  }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); return g;
}
function gantry(sc,Pa,s,txt,col){
  const a=pathAt(Pa,s,0), g=new THREE.Group(); g.position.set(a.x,0,a.z); g.rotation.y=-a.th;
  const mc=new THREE.MeshBasicMaterial({color:new THREE.Color(col)});
  [1,-1].forEach(sd=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.3,7,.3),mc); p.position.set(0,3.5,sd*6.9); g.add(p);});
  const b=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,14),mc); b.position.set(0,7,0); g.add(b);
  const l=labelSprite(txt,col,6); l.position.set(0,8.6,0); g.add(l); sc.add(g);
}

function buildRace(ev,mn,tk,Pm,Oms){
  const sc=new THREE.Scene(), me=mn.m, fogCol=me==='neige'?0x3d3470:me==='pluie'?0x150c33:0x140a2e;
  sc.background=new THREE.Color(fogCol);
  sc.fog=new THREE.Fog(fogCol,me==='sec'?90:55,me==='sec'?720:me==='pluie'?420:360);
  sc.add(new THREE.HemisphereLight(0x9fb0ff,0x2a0a4a,1.05));
  const dl=new THREE.DirectionalLight(0xff9af0,.85); dl.position.set(-40,60,30); sc.add(dl);
  const Pa=buildPath(tk), n=Pa.n;

  /* route, bords néon, virages, lignes */
  const roadTex=ctex(128,256,(x,W,H)=>{x.fillStyle='#0c0d1f'; x.fillRect(0,0,W,H);
    for(let i=0;i<500;i++){x.fillStyle='rgba(120,130,200,'+(Math.random()*.07)+')'; x.fillRect(Math.random()*W,Math.random()*H,2,2);}
    x.fillStyle='rgba(232,235,255,.75)'; x.fillRect(W/2-2,0,4,H*.5);});
  sc.add(new THREE.Mesh(ribbon(Pa,5.6,-5.6,0,0,n-1,16),new THREE.MeshBasicMaterial({map:roadTex,side:THREE.DoubleSide})));
  sc.add(new THREE.Mesh(ribbon(Pa,6.1,5.6,.04,0,n-1,16),new THREE.MeshBasicMaterial({color:0x00e5ff,side:THREE.DoubleSide})));
  sc.add(new THREE.Mesh(ribbon(Pa,-5.6,-6.1,.04,0,n-1,16),new THREE.MeshBasicMaterial({color:0xff2bd6,side:THREE.DoubleSide})));
  const chev=ctex(128,128,(x,W,H)=>{x.clearRect(0,0,W,H); x.strokeStyle='rgba(255,43,214,.75)'; x.lineWidth=9; x.lineCap='round'; x.beginPath(); x.moveTo(W*.22,H*.8); x.lineTo(W*.5,H*.42); x.lineTo(W*.78,H*.8); x.stroke();});
  const chevM=new THREE.MeshBasicMaterial({map:chev,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  tk.segs.forEach(sg=>{
    if(sg.t!=='C') return;
    const i0=Math.max(0,Math.floor((sg.a+Pa.PRE)/Pa.STEP)), i1=Math.min(n-1,Math.ceil((sg.b+Pa.PRE)/Pa.STEP));
    sc.add(new THREE.Mesh(ribbon(Pa,5.4,-5.4,.03,i0,i1,9),chevM));
    gantry(sc,Pa,sg.a,'VIRAGE '+Math.round(Pm.cm(sg.base)*3.6),'#FF2BD6');
  });
  const chk=ctex(128,32,(x,W,H)=>{for(let r=0;r<2;r++) for(let c=0;c<8;c++){x.fillStyle=(r+c)%2?'#E8EBFF':'#0b0b18'; x.fillRect(c*16,r*16,16,16);}});
  const ifin=Math.round((tk.L+Pa.PRE)/Pa.STEP);
  sc.add(new THREE.Mesh(ribbon(Pa,5.6,-5.6,.05,ifin,ifin+2,4),new THREE.MeshBasicMaterial({map:chk,side:THREE.DoubleSide})));
  const ist=Math.round(Pa.PRE/Pa.STEP);
  sc.add(new THREE.Mesh(ribbon(Pa,5.6,-5.6,.05,ist,ist+1,2),new THREE.MeshBasicMaterial({color:0xe8ebff,side:THREE.DoubleSide})));
  gantry(sc,Pa,tk.L,'ARRIVÉE','#FCEE0A');

  /* sol quadrillé */
  const gridT=ctex(128,128,(x,W,H)=>{x.fillStyle='#07061a'; x.fillRect(0,0,W,H); x.strokeStyle='rgba(0,229,255,.45)'; x.lineWidth=2; x.strokeRect(0,0,W,H);},[300,300]);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshBasicMaterial({map:gridT}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-.12; sc.add(ground);

  /* ciel et soleil */
  const sg=new THREE.SphereGeometry(1400,16,12), cols=[], pp=sg.attributes.position, c1=new THREE.Color(0x03020b), c2=new THREE.Color(0x7a1a7a);
  for(let i=0;i<pp.count;i++){const t=clamp(1-Math.abs(pp.getY(i))/1400*1.6,0,1), c=c1.clone().lerp(c2,t*t); cols.push(c.r,c.g,c.b);}
  sg.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const sky=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false})); sky.renderOrder=-2; sc.add(sky);
  const sunT=ctex(128,128,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#FCEE0A'); g.addColorStop(1,'#FF2BD6'); x.fillStyle=g; x.beginPath(); x.arc(W/2,H/2,W/2-2,0,7); x.fill(); x.globalCompositeOperation='destination-out'; for(let k=0;k<6;k++) x.fillRect(0,H*.5+k*H*.09,W,k*1.6+1);});
  sunT.wrapS=sunT.wrapT=THREE.ClampToEdgeWrapping;
  const sun=new THREE.Mesh(new THREE.PlaneGeometry(420,420),new THREE.MeshBasicMaterial({map:sunT,transparent:true,fog:false,depthWrite:false})); sun.renderOrder=-1; sc.add(sun);

  /* ville : immeubles et enseignes, sans empiéter sur la route */
  const winT=[ '#00E5FF','#FF2BD6','#FCEE0A' ].map(cc=>ctex(64,128,(x,W,H)=>{x.fillStyle='#0a0a1e'; x.fillRect(0,0,W,H); for(let r=0;r<22;r++) for(let c=0;c<6;c++) if(Math.random()<.32){x.fillStyle=cc; x.globalAlpha=.35+Math.random()*.5; x.fillRect(5+c*9,4+r*5.5,5,3);} x.globalAlpha=1;}));
  const bl=[[],[],[]], cap=[[],[]]; const rr=Math.random;
  for(let s=-Pa.PRE;s<tk.L+Pa.POST;s+=13) for(const sd of [1,-1]){
    const w=8+rr()*14, d=8+rr()*14, h=18+rr()*100, off=sd*(w/2+14+rr()*30), p=pathAt(Pa,s+rr()*6,off); let ok=true;
    for(let i=0;i<n;i+=2){const dx=Pa.px[i]-p.x, dz=Pa.pz[i]-p.z; if(dx*dx+dz*dz<(Math.max(w,d)*.75+11)**2){ok=false; break;}}
    if(ok){const k=Math.floor(rr()*3); bl[k].push([p.x,p.z,w,h,d,p.th]); if(rr()<.7) cap[rr()<.5?0:1].push([p.x,p.z,w,h,d,p.th]);}
  }
  const dm=new THREE.Object3D(), ub=new THREE.BoxGeometry(1,1,1); ub.translate(0,.5,0);
  bl.forEach((arr,k)=>{ if(!arr.length) return; const im=new THREE.InstancedMesh(ub,new THREE.MeshBasicMaterial({map:winT[k]}),arr.length);
    arr.forEach((a,i)=>{dm.position.set(a[0],0,a[1]); dm.rotation.set(0,-a[5],0); dm.scale.set(a[2],a[3],a[4]); dm.updateMatrix(); im.setMatrixAt(i,dm.matrix);}); sc.add(im);});
  cap.forEach((arr,k)=>{ if(!arr.length) return; const im=new THREE.InstancedMesh(ub,new THREE.MeshBasicMaterial({color:k?0xff2bd6:0x00e5ff}),arr.length);
    arr.forEach((a,i)=>{dm.position.set(a[0],a[3],a[1]); dm.rotation.set(0,-a[5],0); dm.scale.set(a[2]+.4,.5,a[4]+.4); dm.updateMatrix(); im.setMatrixAt(i,dm.matrix);}); sc.add(im);});

  /* lampadaires */
  const lamps=[]; for(let s=0;s<tk.L+120;s+=24) for(const sd of [1,-1]) lamps.push(pathAt(Pa,s,sd*7.2));
  const poles=new THREE.InstancedMesh(new THREE.BoxGeometry(.18,6,.18),new THREE.MeshBasicMaterial({color:0x2b2f60}),lamps.length);
  const heads=new THREE.InstancedMesh(new THREE.BoxGeometry(.9,.25,.5),new THREE.MeshBasicMaterial({color:0x7df3ff}),lamps.length);
  lamps.forEach((p,i)=>{dm.rotation.set(0,-p.th,0); dm.scale.set(1,1,1); dm.position.set(p.x,3,p.z); dm.updateMatrix(); poles.setMatrixAt(i,dm.matrix); dm.position.set(p.x,6.1,p.z); dm.updateMatrix(); heads.setMatrixAt(i,dm.matrix);});
  sc.add(poles); sc.add(heads);

  let strobe=null;
  if(mn.d==='drag'){ strobe=new THREE.MeshBasicMaterial({color:0x00e5ff}); const pts=[]; for(let s=0;s<tk.L+60;s+=14) for(const sd of [1,-1]) pts.push(pathAt(Pa,s,sd*6.7));
    const sm=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,1.4,.5),strobe,pts.length); pts.forEach((p,i)=>{dm.rotation.set(0,-p.th,0); dm.scale.set(1,1,1); dm.position.set(p.x,.7,p.z); dm.updateMatrix(); sm.setMatrixAt(i,dm.matrix);}); sc.add(sm); }
  /* voitures */
  const pc=buildCar(Pm.m,'#00E5FF',carLook(Pm.c)), ocs=Oms.map(r=>buildCar(r.m,'#FF2BD6',carLook(r.c))), oc=ocs[0]; sc.add(pc.g); ocs.forEach(q=>sc.add(q.g));
  const cam=new THREE.PerspectiveCamera(62,1.6,.3,1600);
  return {scene:sc,cam,path:Pa,pc,oc,ocs,sky,sun,ground,strobe,fov:62,weather:mkWeather(me,sc)};
}
function mkWeather(kind,sc){
  if(kind==='sec') return null;
  const rain=kind==='pluie', n=rain?420:300, off=new Float32Array(n*3), pos=new Float32Array(n*(rain?6:3));
  for(let i=0;i<n;i++){off[i*3]=Math.random()*80-20; off[i*3+1]=Math.random()*24-2; off[i*3+2]=(Math.random()-.5)*40;}
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const obj=rain?new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x9fdcff,transparent:true,opacity:.45,fog:false})):new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:.3,transparent:true,opacity:.85,fog:false}));
  obj.frustumCulled=false; sc.add(obj); return {obj,off,pos,n,rain};
}
function updWeather(W,cx,cy,cz,fx,fz,dt,v){
  const rx=-fz, rz=fx, o=W.off, p=W.pos, fall=W.rain?28:2.4;
  for(let i=0;i<W.n;i++){
    let f=o[i*3]-v*dt, u=o[i*3+1]-fall*dt; const r=o[i*3+2];
    if(u<-3) u+=26; if(f<-20) f+=80; if(f>60) f-=80; o[i*3]=f; o[i*3+1]=u;
    const x=cx+fx*f+rx*r, y=cy+u-1.5, z=cz+fz*f+rz*r;
    if(W.rain){const k=i*6; p[k]=x; p[k+1]=y; p[k+2]=z; p[k+3]=x+fx*v*.012; p[k+4]=y+.6; p[k+5]=z+fz*v*.012;}
    else {p[i*3]=x; p[i*3+1]=y; p[i*3+2]=z;}
  }
  W.obj.geometry.attributes.position.needsUpdate=true;
}

/* --- boucle d'une course --- */
function raceFrame(dt,time){
  if(!RC||RC.kind!=='race'||!RS) return;
  let left=dt; while(left>1e-6&&!RC.done&&!RC.paused){const h=Math.min(left,1/120); tick(h); left-=h;}
  drawRace(dt,time); hudRace(); auOldFrame(dt);
}
function drawRace(dt,time){
  const P=RC.P, O=RC.O, tk=RC.tk, Pa=RS.path, cam=RS.cam, t=RC.clock;
  const place=(r,cr3,lane)=>{
    const s=clamp(r.x,-Pa.PRE+4,tk.L+Pa.POST-6), p=pathAt(Pa,s,lane), cur=r.cur&&r.cur.t==='C'?r.cur:null;
    r.drift+=((r.slide&&cur?cur.dir*.32:0)-r.drift)*Math.min(1,dt*7);
    cr3.g.position.set(p.x,0,p.z); cr3.g.rotation.y=-p.th-r.drift; cr3.g.rotation.z=clamp(-r.a*.0035,-.04,.05);
    cr3.wheels.forEach(w=>{w.rotation.z-=r.v*dt/(cr3.wr||.34);});
    cr3.flame.visible=r.nitroT>0; if(r.nitroT>0){const f=.8+Math.random()*.6; cr3.flame.scale.set(f,1,f);}
    cr3.brake(r.braking);
  };
  place(P,RS.pc,P.lane); RC.Os.forEach((o,k)=>place(o,RS.ocs[k],o.lane)); [RS.pc].concat(RS.ocs).forEach(q=>{pulseSirens(q,time); shineTick(q,time);});
  const nit=P.nitroT>0, camS=Math.max(-Pa.PRE+3,P.x-9-P.v*.045), cp=pathAt(Pa,camS,P.lane*.65), lk=pathAt(Pa,P.x+20,P.lane*.55);
  cam.position.set(cp.x,Math.max(3.1,1.7+(RS.pc.H||1.4)*.75)+P.v*.006+(nit?(Math.random()-.5)*.07:0),cp.z); cam.lookAt(lk.x,1.2,lk.z); if(orbitOn()) orbitRace(cam,P,Pa,dt);
  const tf=62+Math.min(P.v,95)*.13+(nit?12:0); RS.fov+=(tf-RS.fov)*Math.min(1,dt*4);
  if(Math.abs(cam.fov-RS.fov)>.05){cam.fov=RS.fov; cam.updateProjectionMatrix();}
  RS.sky.position.copy(cam.position);
  const sa=hash(EVENTS.indexOf(R.ev),9)*6.28; RS.sun.position.set(cam.position.x+Math.cos(sa)*1150,150,cam.position.z+Math.sin(sa)*1150); RS.sun.lookAt(cam.position);
  RS.ground.position.x=Math.round(cam.position.x/30)*30; RS.ground.position.z=Math.round(cam.position.z/30)*30;
  if(RS.strobe) RS.strobe.color.setHSL((time*1.6)%1,1,.35+.3*Math.abs(Math.sin(P.x*.05+time*6)));
  if(RS.weather) updWeather(RS.weather,cam.position.x,cam.position.y,cam.position.z,Math.cos(cp.th),Math.sin(cp.th),dt,P.v);
}
function sT(id,v){const e=$(id); if(e&&e._v!==v){e._v=v; e.textContent=v;}}
function hudRace(){
  const P=RC.P, O=RC.O, tk=RC.tk, t=RC.clock;
  sT('hSpd',String(Math.round(P.v*3.6))); sT('hPos',(RC.pos||1)+' / '+(RC.Os.length+1));
  sT('hTime',(Math.max(0,P.fin!=null?P.fin:t)).toFixed(2).replace('.',',')+' s');
  const gap=O.x-P.x; sT('hGap',P.go?(gap>0?`${O.pil} devant, ${Math.round(gap)} m`:`${O.pil} derrière, ${Math.round(-gap)} m`):'');
  const L=$('hLights'); if(L){
    L.style.display=(t>1.4||(P.go&&t>.6))?'none':'flex';
    const n=t<0?clamp(Math.floor(t+3.4),0,3):3; auLights(n,t>=0); [...L.children].forEach((e,k)=>{const c=t>=0?'g':(k<n?'r':''); if(e._c!==c){e._c=c; e.className=c;}});
  }
  const nc=nextCorner(P,tk), inC=P.cur&&P.cur.t==='C'; let msg='', col='#E8EBFF', cue=false, hot=false;
  if(P.go&&P.fin==null&&nc){
    const cm=P.cm(nc.base), dist=nc.a-P.x, needD=Math.max(0,(P.v*P.v-cm*cm)/(2*P.B));
    cue=P.v>cm&&dist<=needD+P.v*.35;
    if(cue&&Math.floor(t*8)%2===0){msg='FREINE'; col='#FCEE0A';}
    else if(!cue&&dist<260){msg=`Virage dans ${Math.round(dist)} m, max ${Math.round(cm*3.6)} km/h`; col='#FF8BEA';}
    hot=cue;
  }
  if(P.cur&&inC&&P.v>P.cm(P.cur.base)*1.04) hot=true;
  if(RC.flash&&t<RC.flash.until){msg=RC.flash.txt; col=RC.flash.col;}
  else if(t>=0&&!P.go&&!RC.auto&&P.pen==null){msg='Écrase le gaz'; col='#3CFF9E';}
  else if(P.fin!=null){msg='Arrivée'; col='#FCEE0A';}
  const m=$('hMsg'); if(m){if(m._v!==msg){m._v=msg; m.textContent=msg;} if(m._c!==col){m._c=col; m.style.color=col;} m.style.fontSize=msg==='FREINE'?'34px':'24px';}
  const sp=$('hSpd'); if(sp){sp.classList.toggle('hot',hot);}
  const th=RC.auto?(P.go&&!P.braking?1:0):(RC.inp.b||RC.inp.kb?0:inThr());
  const gf=$('gasFill'); if(gf) gf.style.width=Math.round(th*100)+'%';
  const gp=$('gasPed'); if(gp) gp.style.height=Math.round(th*100)+'%';
  const nf=$('nitFill'); if(nf) nf.style.width=Math.round(clamp(P.nitroT/NITRO_DUREE,0,1)*100)+'%'; fxUpdate(P,RC);
  const bn=$('pNit'); if(bn) bn.classList.toggle('on',P.nitroT>0);
}
function bindRace(){
  if(RC&&RC.kind==='spa') return bindSpa();
  if(!GL.r||!RS) return; glAttach('rslot');
  const bg=$('pGas'), bb=$('pBrk'), bn=$('pNit'); let y0=0, gdown=false;
  bg.addEventListener('pointerdown',e=>{e.preventDefault(); try{bg.setPointerCapture(e.pointerId);}catch(_){} gdown=true; y0=e.clientY; RC.inp.t=1;});
  bg.addEventListener('pointermove',e=>{if(!gdown) return; RC.inp.t=clamp(1-Math.max(0,e.clientY-y0)/110,.25,1);});
  const gup=()=>{gdown=false; RC.inp.t=0;}; bg.addEventListener('pointerup',gup); bg.addEventListener('pointercancel',gup);
  bb.addEventListener('pointerdown',e=>{e.preventDefault(); try{bb.setPointerCapture(e.pointerId);}catch(_){} RC.inp.b=true; bb.classList.add('on');});
  const bup=()=>{RC.inp.b=false; bb.classList.remove('on');}; bb.addEventListener('pointerup',bup); bb.addEventListener('pointercancel',bup);
  bn.addEventListener('pointerdown',e=>{e.preventDefault(); fireNitro();});
  [bg,bb,bn].forEach(b=>b.addEventListener('contextmenu',e=>e.preventDefault()));
  glRun(RS.scene,RS.cam,raceFrame,'race');
}

/* ---------- GARAGE 3D ---------- */
const GG={cars:[],sig:null,scene:null,cam:null,ang:.6,idle:0,hit:[],turn:[],ray:null,down:null};
function garageSig(){return S.pod.tier+'|'+S.lvl+'|'+S.pod.slots.map(u=>{const c=u&&car(u);return c?c.mid+':'+lookKey(c):'-';}).join(',');}
function garageSync(){
  if(!glEnsure()) return false;
  const sig=garageSig();
  if(GG.sig!==sig||!GG.scene){if(GG.scene) disposeScene(GG.scene); buildGarage(); GG.sig=sig;}
  return true;
}
function buildGarage(){
  const sc=new THREE.Scene(), tier=S.pod.tier; sc.background=new THREE.Color(0x07050f); sc.fog=new THREE.Fog(0x07050f,34,95);
  sc.add(new THREE.HemisphereLight(0xa9b8ff,0x2a0a4a,1.1)); const dl=new THREE.DirectionalLight(0xffa0f0,.8); dl.position.set(-12,24,10); sc.add(dl);
  const pa=new THREE.PointLight(0x00e5ff,1.1,45); pa.position.set(0,10,0); sc.add(pa);
  const gridT=ctex(128,128,(x,W,H)=>{x.fillStyle='#0a0a20'; x.fillRect(0,0,W,H); x.strokeStyle='rgba(0,229,255,.4)'; x.lineWidth=2; x.strokeRect(0,0,W,H);},[18,18]);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(30,64),new THREE.MeshBasicMaterial({map:gridT})); floor.rotation.x=-Math.PI/2; sc.add(floor);
  [[10.4,10.6,0x00e5ff],[19.8,20,0xff2bd6]].forEach(([a,b,c])=>{const r=new THREE.Mesh(new THREE.RingGeometry(a,b,64),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide})); r.rotation.x=-Math.PI/2; r.position.y=.02; sc.add(r);});
  const wallT=ctex(256,64,(x,W,H)=>{x.fillStyle='#0b0a22'; x.fillRect(0,0,W,H); x.fillStyle='rgba(0,229,255,.8)'; x.fillRect(0,H*.45,W,3); x.fillStyle='rgba(255,43,214,.8)'; x.fillRect(0,H*.7,W,3); x.fillStyle='rgba(60,70,160,.5)'; for(let i=0;i<8;i++) x.fillRect(i*32,0,2,H);},[6,1]);
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(30,30,18,48,1,true),new THREE.MeshBasicMaterial({map:wallT,side:THREE.BackSide})); wall.position.y=9; sc.add(wall);
  for(let i=0;i<12;i++){const a=i/12*6.283, b=new THREE.Mesh(new THREE.BoxGeometry(5,.2,.5),new THREE.MeshBasicMaterial({color:0xcff9ff})); b.position.set(Math.cos(a)*14,15,Math.sin(a)*14); b.rotation.y=-a+1.5708; sc.add(b);}
  GG.hit=[]; GG.turn=[]; GG.cars=[];
  const gold=tier>=5, c1=gold?0xfcee0a:0x00e5ff, uc=new THREE.Color(0x14163a);
  for(let i=0;i<POD_MAX;i++){
    const a=-Math.PI/2+i*Math.PI*2/POD_MAX, unl=S.lvl>=POD_LVL[i], pg=new THREE.Group(); pg.position.set(Math.cos(a)*10,0,Math.sin(a)*10); sc.add(pg);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(3,3.2,.5,32),new THREE.MeshLambertMaterial({color:unl?uc:0x0b0b18})); base.position.y=.25; pg.add(base);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3.05,.07,8,48),new THREE.MeshBasicMaterial({color:unl?c1:0x333355})); ring.rotation.x=Math.PI/2; ring.position.y=.5; pg.add(ring);
    if(unl&&tier>=2){const r2=new THREE.Mesh(new THREE.TorusGeometry(2.45,.05,8,48),new THREE.MeshBasicMaterial({color:0xff2bd6})); r2.rotation.x=Math.PI/2; r2.position.y=.52; pg.add(r2);}
    if(unl&&tier>=4){const sp=new THREE.Mesh(new THREE.ConeGeometry(2.8,11,24,1,true),new THREE.MeshBasicMaterial({color:c1,transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); sp.position.y=6; pg.add(sp);}
    const hit=new THREE.Mesh(new THREE.CylinderGeometry(3.3,3.3,5,12),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})); hit.position.y=2.5; hit.userData.slot=i; pg.add(hit); GG.hit.push(hit);
    const cr=unl&&S.pod.slots[i]?car(S.pod.slots[i]):null;
    if(!unl){const l=labelSprite('Niveau '+POD_LVL[i],'#8E94C0',4.4); l.position.y=2.4; pg.add(l);}
    else if(!cr){const l=labelSprite('Podium libre','#00E5FF',4.4); l.position.y=2.2; pg.add(l);}
    else{
      const m=M[cr.mid], pv=new THREE.Group(); pv.position.y=.58; pv.rotation.y=-(a+Math.PI/2)+.45; pg.add(pv);
      const cc=buildCar(m,TIERS[m.t].c,carLook(cr)); cc.g.scale.setScalar(1.12); pv.add(cc.g); GG.cars.push(cc); if(tier>=3) GG.turn.push(pv);
      if(tier>=2){const l=labelSprite(m.nom,TIERS[m.t].c,5.2); l.position.y=4.2; pg.add(l);}
    }
  }
  GG.scene=sc; GG.cam=new THREE.PerspectiveCamera(48,1.6,.5,200); GG.ray=new THREE.Raycaster();
}
function garageFrame(dt,time){
  GG.idle+=dt; GG.cars.forEach(c=>{pulseSirens(c,time); shineTick(c,time);}); if(GG.idle>2.5) GG.ang+=dt*.12;
  GG.turn.forEach(p=>{p.rotation.y+=dt*.5;});
  GG.cam.position.set(Math.cos(GG.ang)*25,8.8,Math.sin(GG.ang)*25); GG.cam.lookAt(0,1.4,0);
}
function bindGarage(){
  if(!$('gslot')||!garageSync()) return;
  glAttach('gslot'); glRun(GG.scene,GG.cam,garageFrame,'garage');
}
function bindGarageInput(c){
  c.addEventListener('pointerdown',e=>{if(GL.mode!=='garage') return; GG.down={x:e.clientX,y:e.clientY,ang:GG.ang,moved:false}; GG.idle=0; try{c.setPointerCapture(e.pointerId);}catch(_){}});
  c.addEventListener('pointermove',e=>{const d=GG.down; if(!d||GL.mode!=='garage') return; const dx=e.clientX-d.x; if(Math.abs(dx)>6) d.moved=true; GG.ang=d.ang-dx*.008; GG.idle=0;});
  c.addEventListener('pointerup',e=>{const d=GG.down; GG.down=null; if(!d||d.moved||GL.mode!=='garage') return; garagePick(e,c);});
  c.addEventListener('pointercancel',()=>{GG.down=null;});
}
function garagePick(e,c){
  const r=c.getBoundingClientRect(); GG.ray.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-((e.clientY-r.top)/r.height*2-1)},GG.cam);
  const h=GG.ray.intersectObjects(GG.hit,false); if(h.length) openSheet({t:'slot',i:h[0].object.userData.slot});
}
/* revenus du showroom */
const podRate=()=>(1+.06*pk('pod'))*S.pod.slots.reduce((t,u,i)=>{const c=u&&S.lvl>=POD_LVL[i]?car(u):null; return t+(c?M[c.mid].t*S.pod.tier*3*(.5+.5*c.etat/100)*(1+(st(c).sp.inc||0))*(c.sh?1.5:1):0);},0);
const podPending=()=>Math.min(480,(Date.now()-S.pod.last)/60000)*podRate();
function updPod(){const b=$('pCollect'); if(b&&view==='garage') b.innerHTML=`Récolter<br>${cr(Math.floor(podPending()))}`;}

/* ---------- CIRCUIT DE SPA : données, physique, surfaces, collisions, pilote ---------- */
const TRK={ready:false};
function b64bufT(txt){const bin=atob(txt.trim()), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u.buffer;}
async function loadTrack(opts){
  opts=opts||{};
  const meta=opts.meta||JSON.parse(document.getElementById('trk-json').textContent);
  const buf=opts.buf||b64bufT(document.getElementById('trk-bin').textContent), P=meta.phys, N=meta.N;
  const F=o=>new Float32Array(buf,o,N);
  Object.assign(TRK,{meta,buf,N,DS:meta.DS,L:meta.L,cx:F(P.cx),cz:F(P.cz),cy:F(P.cy),th:F(P.th),kap:F(P.kap),limL:F(P.limL),limR:F(P.limR),pl:F(P.pl),pr:F(P.pr),wallL:F(P.wallL),wallR:F(P.wallR),nseg:P.nseg,segs:new Float32Array(buf,P.segs,P.nseg*4),styp:new Uint8Array(buf,P.styp,P.nseg),
    hrel:new Int16Array(buf,P.hrel,N*meta.nh),nh:meta.nh,dh0:meta.dh0,dhs:meta.dhs,X0:meta.X0,Z0:meta.Z0,GW:meta.GW,GH:meta.GH});
  if(opts.gridBytes) TRK.grid=opts.gridBytes;
  else{
    const im=await loadImg(meta.grid), cv=document.createElement('canvas'); cv.width=im.width; cv.height=im.height;
    const cx2=cv.getContext('2d',{willReadFrequently:true}); cx2.drawImage(im,0,0); const d=cx2.getImageData(0,0,cv.width,cv.height).data, g=new Uint8Array(cv.width*cv.height);
    for(let i=0;i<g.length;i++) g[i]=d[i*4]; TRK.grid=g;
  }
  buildSegGrid(); TRK.ready=true; return TRK;
}
const wrapA=a=>{a=(a+Math.PI)%(2*Math.PI); return (a<0?a+2*Math.PI:a)-Math.PI;};
const wrapS=s=>{const L=TRK.L; s%=L; return s<0?s+L:s;};
const dS=(a,b)=>{const L=TRK.L; let d=(a-b)%L; if(d>L/2) d-=L; if(d<-L/2) d+=L; return d;};   /* écart signé le plus court sur la boucle */

/* repère de la piste interpolé à l'abscisse s */
function frameAt(s){
  const N=TRK.N, f=wrapS(s)/TRK.DS, i=Math.floor(f)%N, j=(i+1)%N, u=f-Math.floor(f);
  const th=Math.atan2(Math.sin(TRK.th[i])*(1-u)+Math.sin(TRK.th[j])*u,Math.cos(TRK.th[i])*(1-u)+Math.cos(TRK.th[j])*u);
  return {i,x:TRK.cx[i]+(TRK.cx[j]-TRK.cx[i])*u,z:TRK.cz[i]+(TRK.cz[j]-TRK.cz[i])*u,y:TRK.cy[i]+(TRK.cy[j]-TRK.cy[i])*u,th,
    nx:Math.sin(th),nz:-Math.cos(th),limL:TRK.limL[i]+(TRK.limL[j]-TRK.limL[i])*u,limR:TRK.limR[i]+(TRK.limR[j]-TRK.limR[i])*u,wL:TRK.wallL[i]+(TRK.wallL[j]-TRK.wallL[i])*u,wR:TRK.wallR[i]+(TRK.wallR[j]-TRK.wallR[i])*u,kap:TRK.kap[i]};
}
/* projection d'un point sur la ligne centrale : s (abscisse), d (écart latéral, + = gauche) */
function project(x,z,hint){
  const N=TRK.N, cx=TRK.cx, cz=TRK.cz; let bi=0, bd=1e18;
  if(hint==null||hint<0){for(let i=0;i<N;i+=2){const dx=x-cx[i],dz=z-cz[i],q=dx*dx+dz*dz; if(q<bd){bd=q;bi=i;}} for(let k=-2;k<=2;k++){const i=(bi+k+N)%N,dx=x-cx[i],dz=z-cz[i],q=dx*dx+dz*dz; if(q<bd){bd=q;bi=i;}}}
  else{for(let k=-30;k<=30;k++){const i=(hint+k+N)%N,dx=x-cx[i],dz=z-cz[i],q=dx*dx+dz*dz; if(q<bd){bd=q;bi=i;}}}
  const th=TRK.th[bi], tx=Math.cos(th), tz=Math.sin(th);
  let ds=(x-cx[bi])*tx+(z-cz[bi])*tz; ds=Math.max(-TRK.DS,Math.min(TRK.DS,ds));
  const s=bi*TRK.DS+ds, fr=frameAt(s), d=(x-fr.x)*fr.nx+(z-fr.z)*fr.nz;
  return {i:bi,s:wrapS(s),d,fr,dist:Math.sqrt(bd)};
}
/* hauteur du sol à (s,d) */
function groundY(s,d){
  const N=TRK.N, f=wrapS(s)/TRK.DS, i=Math.floor(f)%N, j=(i+1)%N, u=f-Math.floor(f), nh=TRK.nh;
  let k=(Math.max(TRK.dh0,Math.min(-TRK.dh0,d))-TRK.dh0)/TRK.dhs; const k0=Math.max(0,Math.min(nh-2,Math.floor(k))), t=k-k0, H=TRK.hrel;
  const a=H[i*nh+k0]*(1-t)+H[i*nh+k0+1]*t, b=H[j*nh+k0]*(1-t)+H[j*nh+k0+1]*t;
  return TRK.cy[i]+(TRK.cy[j]-TRK.cy[i])*u+(a+(b-a)*u)/100;
}
function surfAt(x,z){
  const gx=Math.floor(x-TRK.X0), gz=Math.floor(z-TRK.Z0);
  if(gx<0||gz<0||gx>=TRK.GW||gz>=TRK.GH) return 0;
  return TRK.grid[gz*TRK.GW+gx];
}
/* propriétés de chaque surface : adhérence, résistance, traction, freinage */
const SURF=[
 {n:'Hors piste',mu:.40,r0:2.0,rv:.20,tr:.50,br:.50},{n:'Hors piste',mu:.55,r0:.8,rv:.10,tr:.60,br:.60},
 {n:'Herbe',mu:.60,r0:.6,rv:.08,tr:.70,br:.60},{n:'Terre',mu:.65,r0:.5,rv:.06,tr:.75,br:.65},
 {n:'Sable',mu:.38,r0:2.2,rv:.22,tr:.45,br:.50},{n:'Gravier',mu:.50,r0:1.0,rv:.12,tr:.50,br:.55},
 {n:'Route',mu:.92,r0:.2,rv:.015,tr:.95,br:.95},{n:'Asphalte',mu:1,r0:.15,rv:.012,tr:1,br:1},{n:'Vibreur',mu:.93,r0:.2,rv:.014,tr:.97,br:.95}];
const SURF_COL=['#FF4D6D','#FF4D6D','#3CFF9E','#C08A4A','#FCEE0A','#B8B4D0','#E8EBFF','#E8EBFF','#FF2BD6'];

/* voiture sur la piste */
function mkSpaCar(r,m,s0,lane,etat){
  const fr=frameAt(s0), len=(typeof MODELS!=='undefined'&&MODELS[m.glb]&&MODELS[m.glb].len)||((typeof CAR3D!=='undefined'&&CAR3D[m.shape])||{L:4.5}).L;
  const mw=typeof MODELS!=='undefined'&&MODELS[m.glb]&&MODELS[m.glb].meta&&MODELS[m.glb].meta.v===2?Math.min(1.95,MODELS[m.glb].w):1.9;
  const c={r,m,len,wid:mw,x:fr.x+fr.nx*lane,z:fr.z+fr.nz*lane,y:fr.y,psi:fr.th,vx:0,vz:0,yaw:0,steer:0,s:wrapS(s0),d:lane,i:fr.i,prog:dS(s0,s0),surf:7,
    pitch:0,roll:0,etat:etat==null?100:etat,nitroT:0,boostT:0,hits:0,dmg:0,hitFlash:0,offT:0,onPave:true,fin:null,go:false,pen:0,wrongT:0,stuckT:0,rumble:0,slipAng:0,v:0,lastHit:0};
  c.prog=0; return c;
}
function carStep(c,inp,dt){
  const r=c.r, S0=SURF[c.surf]||SURF[7], S=S0;
  let fx=Math.cos(c.psi), fz=Math.sin(c.psi), lx=Math.sin(c.psi), lz=-Math.cos(c.psi);
  let vf=c.vx*fx+c.vz*fz, vl=c.vx*lx+c.vz*lz; const spd=Math.abs(vf);
  /* direction : braquage max décroissant avec la vitesse */
  const tr=r.m.tr, aS=11.0*S.mu*r.gc*(.55+.45*c.etat/100)*(c.surf<6?(r.oB||1):1); let dmax=Math.min(.62,1.35*aS*(c.len*.6)/(spd*spd+25)); if(tr==='FWD'&&inp.thr>.7) dmax*=.92;
  c.steer+=(inp.steer*dmax-c.steer)*Math.min(1,dt*9);
  let yaw=(vf>=0?1:-1)*spd/(c.len*.6)*Math.tan(c.steer);
  const slip=Math.atan2(vl,Math.max(spd,3)); c.slipAng=slip;
  yaw*=1-Math.max(0,Math.min(.6,(Math.abs(slip)-.35)/.7));
  if(inp.hand&&spd>6) yaw*=1.25;
  c.psi=wrapA(c.psi+yaw*dt); c.yaw=yaw;
  fx=Math.cos(c.psi); fz=Math.sin(c.psi); lx=Math.sin(c.psi); lz=-Math.cos(c.psi);
  vf=c.vx*fx+c.vz*fz; vl=c.vx*lx+c.vz*lz;
  /* longitudinal */
  const nit=c.nitroT>0, vm=r.VM*(nit?1.18:1), thr=Math.max(0,Math.min(1,inp.thr)); let a=0;
  if(c.nitroT>0) c.nitroT-=dt; if(c.boostT>0) c.boostT-=dt;
  if(!c.go||c.pen>0) { if(c.pen>0) c.pen-=dt; }
  if(c.go&&c.pen<=0){
    let drive=r.A*(nit?1.6*(r.nP||1):1)*(c.boostT>0?1.25:1)*(1-Math.max(vf,0)/vm); if(drive>0) drive*=thr;
    a+=Math.min(drive,r.TR*(nit?1.15:1)*S.tr)-(1-thr)*(vf>0?1.8:0);
  }
  if(inp.brake){ if(vf>.5) a-=r.B*S.br; else a-=Math.min(5,Math.max(0,8+vf)); }
  a-=Math.sign(vf)*Math.min(S.r0+S.rv*spd,spd/dt*.9);
  vf+=a*dt;
  if(vf<-9) vf=-9;
  /* adhérence latérale (cercle de friction simplifié) */
  let aMax=aS*(inp.hand?.5:1);
  if(tr==='RWD'&&thr>.7&&S.mu<.8) aMax*=.88;
  aMax*=1-.3*Math.min(1,Math.abs(a)/(r.B+1)); aMax=Math.max(aMax,1.5);
  const dv=aMax*dt, ovl=vl; vl=Math.abs(vl)<=dv?0:vl-Math.sign(vl)*dv;
  vf-=Math.sign(vf)*Math.min(Math.abs(vf),Math.abs(ovl)*dt*.35);       /* la glisse use de la vitesse */
  c.vx=vf*fx+vl*lx; c.vz=vf*fz+vl*lz; c.v=Math.hypot(c.vx,c.vz);
  c.x+=c.vx*dt; c.z+=c.vz*dt;
}
/* ---- vraies barrières : grille spatiale et collision rectangle / segment ---- */
function buildSegGrid(){
  const S=TRK.segs, n=TRK.nseg, C=10; let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;
  for(let i=0;i<n;i++){x0=Math.min(x0,S[4*i],S[4*i+2]); x1=Math.max(x1,S[4*i],S[4*i+2]); z0=Math.min(z0,S[4*i+1],S[4*i+3]); z1=Math.max(z1,S[4*i+1],S[4*i+3]);}
  x0-=2; z0-=2; const W=Math.ceil((x1-x0)/C)+2, H=Math.ceil((z1-z0)/C)+2, cnt=new Int32Array(W*H+1), cells=[];
  const span=i=>{const ax=Math.min(S[4*i],S[4*i+2])-.5, bx=Math.max(S[4*i],S[4*i+2])+.5, az=Math.min(S[4*i+1],S[4*i+3])-.5, bz=Math.max(S[4*i+1],S[4*i+3])+.5; return [Math.floor((ax-x0)/C),Math.floor((bx-x0)/C),Math.floor((az-z0)/C),Math.floor((bz-z0)/C)];};
  for(let i=0;i<n;i++){const [a,b,c,d]=span(i); for(let gz=c;gz<=d;gz++) for(let gx=a;gx<=b;gx++) cnt[gz*W+gx+1]++;}
  for(let k=0;k<W*H;k++) cnt[k+1]+=cnt[k];
  const idx=new Int32Array(cnt[W*H]), fill=cnt.slice(0,W*H);
  for(let i=0;i<n;i++){const [a,b,c,d]=span(i); for(let gz=c;gz<=d;gz++) for(let gx=a;gx<=b;gx++) idx[fill[gz*W+gx]++]=i;}
  TRK.sg={x0,z0,C,W,H,start:cnt,idx,stamp:new Int32Array(n),tick:0};
}
function segsNear(x,z,r,cb){
  const g=TRK.sg; if(!g) return; g.tick++;
  const a=Math.max(0,Math.floor((x-r-g.x0)/g.C)), b=Math.min(g.W-1,Math.floor((x+r-g.x0)/g.C)), c=Math.max(0,Math.floor((z-r-g.z0)/g.C)), d=Math.min(g.H-1,Math.floor((z+r-g.z0)/g.C));
  for(let gz=c;gz<=d;gz++) for(let gx=a;gx<=b;gx++){const k=gz*g.W+gx; for(let q=g.start[k];q<g.start[k+1];q++){const i=g.idx[q]; if(g.stamp[i]===g.tick) continue; g.stamp[i]=g.tick; cb(i);}}
}
const WALL_T=.18;
/* rectangle de la voiture contre un segment : vecteur minimal de sortie (axes : avant, côté, normale du segment) */
function segMTV(c,i){
  const S=TRK.segs, ax=S[4*i], az=S[4*i+1], bx=S[4*i+2], bz=S[4*i+3], cs=Math.cos(c.psi), sn=Math.sin(c.psi);
  const ua=(ax-c.x)*cs+(az-c.z)*sn, va=(ax-c.x)*sn-(az-c.z)*cs, ub=(bx-c.x)*cs+(bz-c.z)*sn, vb=(bx-c.x)*sn-(bz-c.z)*cs;
  const hl=c.len/2+WALL_T, hw=c.wid/2+WALL_T;
  const ou=Math.min(hl,Math.max(ua,ub))-Math.max(-hl,Math.min(ua,ub)); if(ou<=0) return null;
  const ov=Math.min(hw,Math.max(va,vb))-Math.max(-hw,Math.min(va,vb)); if(ov<=0) return null;
  const su=ub-ua, sv=vb-va, sl=Math.hypot(su,sv); if(sl<1e-6) return null;
  const nu=-sv/sl, nv=su/sl, dist=ua*nu+va*nv, r=Math.abs(nu)*hl+Math.abs(nv)*hw, on=r-Math.abs(dist); if(on<=0) return null;
  let pen=ou, du=(ua+ub>0?-1:1), dv=0;                     /* pousser la voiture à l'opposé du segment */
  if(ov<pen){pen=ov; du=0; dv=(va+vb>0?-1:1);}
  if(on<pen){pen=on; du=(dist>0?-nu:nu); dv=(dist>0?-nv:nv);}
  /* point de contact : point du segment le plus proche du centre de la voiture */
  const tt=Math.max(0,Math.min(1,-(ua*su+va*sv)/(sl*sl))), cu=ua+su*tt;
  return {pen,nx:du*cs+dv*sn,nz:du*sn-dv*cs,cu};
}
function wallCollide(c){
  const cs=Math.cos(c.psi), sn=Math.sin(c.psi); let any=false;
  for(let it=0;it<3;it++){
    let best=null;
    segsNear(c.x,c.z,c.len/2+1.5,i=>{const m=segMTV(c,i); if(m&&(!best||m.pen>best.pen)) best=m;});
    if(!best) break; any=true;
    c.x+=best.nx*(best.pen+.01); c.z+=best.nz*(best.pen+.01);
    const vn=c.vx*best.nx+c.vz*best.nz;
    if(vn<0){
      const e=Math.min(.25,Math.max(0,(-vn-1)/10)), imp=-(1+e)*vn; c.vx+=imp*best.nx; c.vz+=imp*best.nz;
      const tx=-best.nz, tz=best.nx, vt=c.vx*tx+c.vz*tz, fr=Math.min(Math.abs(vt),.2*imp); c.vx-=Math.sign(vt)*fr*tx; c.vz-=Math.sign(vt)*fr*tz;
      const nl=best.nx*Math.sin(c.psi)-best.nz*Math.cos(c.psi);
      if(imp>4) c.psi=wrapA(c.psi-Math.max(-.25,Math.min(.25,.012*imp*(best.cu/(c.len/2))*nl)));
      if(imp>2.5&&c.lastHit<=0){c.hits++; c.lastHit=.6; c.dmg+=imp*.035*(c.r.dR||1);}
      c.hitFlash=Math.max(c.hitFlash,Math.min(1,imp/14));
      auHit(imp,c);
    }
  }
  return any;
}
/* hauteur, inclinaison, surface, limite lointaine invisible */
function carWorld(c,dt){
  wallCollide(c);
  const hl=c.len/2, hw=c.wid/2, fx=Math.cos(c.psi), fz=Math.sin(c.psi), lx=Math.sin(c.psi), lz=-Math.cos(c.psi);
  const old=c.s, cen=project(c.x,c.z,c.i); c.i=cen.i; c.s=cen.s; c.d=cen.d;
  let worst=null, wp=0; const hts=[0,0,0,0]; let k=0, offCnt=0;
  for(const sx of [1,-1]) for(const sy of [1,-1]){
    const px=c.x+fx*hl*sx+lx*hw*sy, pz=c.z+fz*hl*sx+lz*hw*sy, pr=project(px,pz,c.i);
    hts[k++]=groundY(pr.s,pr.d);
    let pen=0, side=0;
    if(pr.d>pr.fr.limL-.25){pen=pr.d-(pr.fr.limL-.25); side=1;} else if(pr.d<-(pr.fr.limR-.25)){pen=-pr.d-(pr.fr.limR-.25); side=-1;}
    if(pen>wp){wp=pen; worst={pr,side,sx,sy};}
    const sf=SURF[surfAt(px,pz)]; if(sf&&sf.mu<.7) offCnt++;
  }
  c.onPave=offCnt<2;
  if(worst){
    const n=worst.pr.fr, ox=worst.side*n.nx, oz=worst.side*n.nz; c.x-=ox*wp; c.z-=oz*wp;
    const vn=c.vx*ox+c.vz*oz; if(vn>0){c.vx-=1.25*vn*ox; c.vz-=1.25*vn*oz; c.hitFlash=Math.max(c.hitFlash,Math.min(1,vn/14));}
  }
  if(c.lastHit>0) c.lastHit-=dt; if(c.hitFlash>0) c.hitFlash=Math.max(0,c.hitFlash-dt*3);
  c.surf=surfAt(c.x,c.z); const sfc=c.surf;
  const hF=(hts[0]+hts[1])/2, hR=(hts[2]+hts[3])/2, hLf=(hts[0]+hts[2])/2, hRt=(hts[1]+hts[3])/2, ty=(hts[0]+hts[1]+hts[2]+hts[3])/4;
  c.y+=(ty-c.y)*Math.min(1,dt*18);
  c.pitch+=(Math.atan2(hF-hR,c.len)-c.pitch)*Math.min(1,dt*10); c.roll+=(Math.atan2(hLf-hRt,c.wid)-c.roll)*Math.min(1,dt*10);
  c.rumble=(sfc===8)?1:(c.onPave?0:.5);
  c.prog+=dS(c.s,old);
}
/* repère de ré-apparition sur la piste */
function respawn(c){
  const fr=frameAt(c.s); c.x=fr.x; c.z=fr.z; c.psi=fr.th; c.vx=c.vz=0; c.steer=0; c.yaw=0; c.surf=7; c.pen=1.2; c.stuckT=0; c.wrongT=0; c.nitroT=0;
}
/* pilote : profil de vitesse le long de la piste, puis suivi de trajectoire */
function aiProfile(r,skill){
  const N=TRK.N, kap=TRK.kap, v=new Float32Array(N), aLat=11.0*r.gc*(.55+.45*(r.c?r.c.etat:100)/100)*skill*.93;
  for(let i=0;i<N;i++){let k=0; for(let j=-2;j<=2;j++) k=Math.max(k,Math.abs(kap[(i+j+N)%N])); v[i]=Math.min(r.VM*.97,Math.sqrt(aLat/Math.max(k,1e-4)));}
  const B=r.B*.72;
  for(let pass=0;pass<2;pass++) for(let i=N*2-1;i>=0;i--){const a=i%N, b=(i+1)%N; v[a]=Math.min(v[a],Math.sqrt(v[b]*v[b]+2*B*TRK.DS));}
  return v;
}
/* lancer de rayon contre les vraies barrières : distance du premier obstacle (ou max) */
function rayHit(x,z,ang,max){
  const dx=Math.cos(ang), dz=Math.sin(ang), S=TRK.segs; let best=max;
  segsNear(x+dx*max/2,z+dz*max/2,max/2+1,i=>{
    const ax=S[4*i],az=S[4*i+1],ex=S[4*i+2]-ax,ez=S[4*i+3]-az, den=dx*ez-dz*ex; if(Math.abs(den)<1e-9) return;
    const t=((ax-x)*ez-(az-z)*ex)/den, u=((ax-x)*dz-(az-z)*dx)/den; if(t>0&&t<best&&u>=0&&u<=1) best=t;
  });
  return best;
}
function aiControl(c,prof,lane,skill){
  const sp=c.v, look=7+.45*sp, fr=frameAt(c.s+look), N=TRK.N, i0=c.i, nw=Math.ceil((look+12)/TRK.DS)+1;
  /* couloir libre sur toute la zone à venir (murs réels) */
  let mwL=1e9, mwR=1e9; for(let k=0;k<=nw;k++){const j=(i0+k)%N; mwL=Math.min(mwL,TRK.wallL[j]); mwR=Math.min(mwR,TRK.wallR[j]);}
  const lo=-(mwR-2.5), hi=mwL-2.5; lane=hi<lo?(hi+lo)/2:Math.max(lo,Math.min(hi,lane));
  const tx=fr.x+fr.nx*lane, tz=fr.z+fr.nz*lane;
  let steer=Math.max(-1,Math.min(1,wrapA(Math.atan2(tz-c.z,tx-c.x)-c.psi)*2.2));
  /* moustaches : on s'écarte des barrières devant */
  const R=10+.9*sp, fx=c.x+Math.cos(c.psi)*c.len/2, fz=c.z+Math.sin(c.psi)*c.len/2;
  const tl=rayHit(fx,fz,c.psi-.32,R), tc=rayHit(fx,fz,c.psi,R), tr=rayHit(fx,fz,c.psi+.32,R);
  if(tl<R||tr<R){ steer+=Math.max(-.8,Math.min(.8,(1-tl/R)*1.2-(1-tr/R)*1.2)); steer=Math.max(-1,Math.min(1,steer)); }
  let vt=1e9; const nn=Math.ceil(sp*1.3/TRK.DS)+1;
  for(let k=0;k<=nn;k++) vt=Math.min(vt,prof[(i0+k)%N]);
  vt*=skill; let thr=1, brake=false;
  if(sp>vt+1.5){brake=true; thr=0;} else thr=Math.max(0,Math.min(1,(vt-sp)/4+.6));
  if(tc<Math.min(R,sp*.9+4)&&sp>8){thr=Math.min(thr,.3); if(tc<sp*.5+2){brake=true; thr=0;}}
  if(!c.onPave) thr=Math.min(thr,.6);
  return {steer,thr,brake,hand:false};
}

/* ---------- CIRCUIT DE SPA : scène 3D, course, affichage ---------- */
let trackP=null, trackBusy=false;
function ensureTrack(){
  if(trackP) return trackP;
  if(!window.THREE||!glEnsure()||!document.getElementById('trk-json')) return (trackP=Promise.resolve());
  trackBusy=true;
  trackP=loadTrack().catch(e=>{try{console.warn('circuit',e);}catch(_){}}).then(()=>{trackBusy=false;});
  return trackP;
}
const SPA_VIS=520;
function spaMats(){
  const po=(m,f)=>{m.polygonOffset=true; m.polygonOffsetFactor=f; m.polygonOffsetUnits=f; return m;};
  const L=c=>new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide});
  const kt=new THREE.DataTexture(new Uint8Array([255,43,94,255,236,238,255,255]),2,1,THREE.RGBAFormat);
  kt.magFilter=kt.minFilter=THREE.NearestFilter; kt.wrapS=kt.wrapT=THREE.RepeatWrapping; kt.needsUpdate=true;
  return {terrain:po(L(0x0b2c27),5),grass:po(L(0x0f4b3a),4),dirt:po(L(0x4d3826),3.5),ext:po(L(0x181a35),2.5),gravel:po(L(0x8d89a6),3),sand:po(L(0xf0c85c),3),
    asph:po(L(0x2c3162),2),kerb:po(new THREE.MeshLambertMaterial({map:kt,side:THREE.DoubleSide}),1),lines:po(new THREE.MeshBasicMaterial({color:0xe6f7ff,side:THREE.DoubleSide}),-1),
    wall_solid:new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),
    wall_energy:new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}),
    bldg:L(0x3a4078)};
}
function spaGantry(sc,s,txt,col){
  const fr=frameAt(s), g=new THREE.Group(), mc=new THREE.MeshBasicMaterial({color:new THREE.Color(col)}), w=Math.min(fr.limL,fr.limR,9)+.9;
  g.position.set(fr.x,fr.y,fr.z); g.rotation.y=-fr.th;
  [1,-1].forEach(sd=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.4,8,.4),mc); p.position.set(0,4,sd*w); g.add(p);});
  const b=new THREE.Mesh(new THREE.BoxGeometry(.4,.5,w*2),mc); b.position.set(0,8,0); g.add(b);
  const l=labelSprite(txt,col,9); l.position.set(0,10.2,0); g.add(l); sc.add(g);
}
function spaStrip(sc,s,tex,len,y){
  const fr=frameAt(s), w=Math.min(fr.limL,12)+Math.min(fr.limR,12), off=(Math.min(fr.limL,12)-Math.min(fr.limR,12))/2;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(len,w),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
  m.rotation.x=-Math.PI/2; const g=new THREE.Group(); g.add(m); m.position.z=-off; g.position.set(fr.x,fr.y+.08,fr.z); g.rotation.y=-fr.th; sc.add(g);
}
function buildSpa(stage,mn,Pr,Ors,slots){
  const T=TRK, buf=T.buf, meta=T.meta, sc=new THREE.Scene(), me=mn.m;
  const fogCol=me==='pluie'?0x150c33:0x160b33; sc.background=new THREE.Color(fogCol);
  sc.fog=new THREE.Fog(fogCol,me==='sec'?130:70,me==='sec'?SPA_VIS:me==='pluie'?360:360);
  sc.add(new THREE.HemisphereLight(0xa5b4ff,0x2a0a4a,1.15)); const dl=new THREE.DirectionalLight(0xffa6f0,.9); dl.position.set(-60,90,40); sc.add(dl);
  const M=spaMats(), tiles={};
  const tileOf=(t)=>{const k=t[0]+','+t[1]; if(!tiles[k]){const g=new THREE.Group(); g.userData={cx:meta.TX0+(t[0]+.5)*meta.tile,cz:meta.TZ0+(t[1]+.5)*meta.tile}; tiles[k]=g; sc.add(g);} return tiles[k];};
  meta.parts.forEach(p=>{
    const g=new THREE.BufferGeometry(), o=p.o;
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buf,o.p,p.nv*3),3));
    g.setIndex(new THREE.BufferAttribute(p.i32?new Uint32Array(buf,o.i,p.ni):new Uint16Array(buf,o.i,p.ni),1));
    if(o.c) g.setAttribute('color',new THREE.BufferAttribute(new Uint8Array(buf,o.c,p.nv*3),3,true));
    if(o.u) g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(buf,o.u,p.nv*2),2));
    if(p.g!=='lines'&&p.g!=='wall_energy') g.computeVertexNormals();
    g.computeBoundingSphere();
    const mesh=new THREE.Mesh(g,M[p.g]); tileOf(p.t).add(mesh);
  });
  const tg=new THREE.ConeGeometry(2.3,1,5); tg.translate(0,.5,0); const tm=new THREE.MeshLambertMaterial({color:0x0d4a39}), dm=new THREE.Object3D();
  (meta.trees||[]).forEach(tp=>{
    const arr=new Float32Array(buf,tp.o,tp.n*4), im=new THREE.InstancedMesh(tg,tm,tp.n);
    for(let k=0;k<tp.n;k++){const h=arr[k*4+3]; dm.position.set(arr[k*4],arr[k*4+1],arr[k*4+2]); dm.scale.set(h*.3,h,h*.3); dm.updateMatrix(); im.setMatrixAt(k,dm.matrix);}
    im.frustumCulled=false; im.userData.tree=true; tileOf(tp.t).add(im);
  });
  /* repères : ligne de départ, grille, arrivée */
  const sA=stage.a, sB=stage.b>=T.L-1?T.L:stage.b;
  const chk=ctex(128,32,(x,W,H)=>{for(let r=0;r<2;r++) for(let c=0;c<8;c++){x.fillStyle=(r+c)%2?'#E8EBFF':'#0b0b18'; x.fillRect(c*16,r*16,16,16);}});
  chk.wrapS=chk.wrapT=THREE.ClampToEdgeWrapping;
  const stT=ctex(16,16,(x,W,H)=>{x.fillStyle='#3CFF9E'; x.fillRect(0,0,W,H);}); stT.wrapS=stT.wrapT=THREE.ClampToEdgeWrapping;
  const box=ctex(64,128,(x,W,H)=>{x.clearRect(0,0,W,H); x.strokeStyle='#E8EBFF'; x.lineWidth=5; x.strokeRect(5,5,W-10,H-10);}); box.wrapS=box.wrapT=THREE.ClampToEdgeWrapping;
  spaStrip(sc,sA,stT,.9,0); spaGantry(sc,sA,'DÉPART','#3CFF9E');
  const fin=wrapS(sB); spaStrip(sc,fin,chk,3.2,0); spaGantry(sc,fin,'ARRIVÉE','#FCEE0A');
  (slots||[]).forEach(sl=>{const s0=sA-sl.off, ln=sl.lane, fr=frameAt(s0), m=new THREE.Mesh(new THREE.PlaneGeometry(5.2,2.4),new THREE.MeshBasicMaterial({map:box,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
    m.rotation.x=-Math.PI/2; const g=new THREE.Group(); g.add(m); g.position.set(fr.x+fr.nx*ln,fr.y+.08,fr.z+fr.nz*ln); g.rotation.y=-fr.th; sc.add(g);});
  /* ciel */
  const sg=new THREE.SphereGeometry(1400,16,12), cols=[], pp=sg.attributes.position, c1=new THREE.Color(0x03020b), c2=new THREE.Color(0x7a1a7a);
  for(let i=0;i<pp.count;i++){const t=Math.max(0,Math.min(1,1-Math.abs(pp.getY(i))/1400*1.6)), c=c1.clone().lerp(c2,t*t); cols.push(c.r,c.g,c.b);}
  sg.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const sky=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false})); sky.renderOrder=-2; sc.add(sky);
  const sunT=ctex(128,128,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#FCEE0A'); g.addColorStop(1,'#FF2BD6'); x.fillStyle=g; x.beginPath(); x.arc(W/2,H/2,W/2-2,0,7); x.fill(); x.globalCompositeOperation='destination-out'; for(let k=0;k<6;k++) x.fillRect(0,H*.5+k*H*.09,W,k*1.6+1);});
  sunT.wrapS=sunT.wrapT=THREE.ClampToEdgeWrapping;
  const sun=new THREE.Mesh(new THREE.PlaneGeometry(420,420),new THREE.MeshBasicMaterial({map:sunT,transparent:true,fog:false,depthWrite:false})); sun.renderOrder=-1; sc.add(sun);
  const pc=buildCar(Pr.m,'#00E5FF',carLook(Pr.c)), ocs=Ors.map(r=>buildCar(r.m,'#FF2BD6',carLook(r.c))), oc=ocs[0]; [pc].concat(ocs).forEach(q=>{sc.add(q.g); q.g.rotation.order='YZX';});
  const cam=new THREE.PerspectiveCamera(62,1.6,.3,1700);
  /* mini-carte */
  const mc=document.createElement('canvas'); mc.width=96; mc.height=150; const mx=mc.getContext('2d');
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(let i=0;i<T.N;i++){x0=Math.min(x0,T.cx[i]);x1=Math.max(x1,T.cx[i]);z0=Math.min(z0,T.cz[i]);z1=Math.max(z1,T.cz[i]);}
  const sc2=Math.min((96-12)/(x1-x0),(150-12)/(z1-z0)), mp=(x,z)=>[6+(x-x0)*sc2,144-(z-z0)*sc2];
  mx.lineWidth=2.4; mx.lineJoin='round'; mx.strokeStyle='#3a3f6e'; mx.beginPath(); for(let i=0;i<=T.N;i++){const p=mp(T.cx[i%T.N],T.cz[i%T.N]); i?mx.lineTo(p[0],p[1]):mx.moveTo(p[0],p[1]);} mx.stroke();
  mx.strokeStyle='#00E5FF'; mx.lineWidth=3; mx.beginPath(); const i0=Math.floor(sA/T.DS), i1=Math.ceil(sB/T.DS); for(let i=i0;i<=i1;i++){const p=mp(T.cx[i%T.N],T.cz[i%T.N]); i===i0?mx.moveTo(p[0],p[1]):mx.lineTo(p[0],p[1]);} mx.stroke();
  return {scene:sc,cam,tiles,pc,oc,ocs,sky,sun,fov:62,weather:mkWeather(me,sc),vis:SPA_VIS,mini:mc,miniP:mp,camPos:null,shake:0,fps:.016,slow:0};
}
/* ---- démarrage d'une manche sur le circuit ---- */
function startSpa(i){
  const ev=R.ev, mn=ev.manches[i], c=car(R.pick[i]), opps=R.opps[i], idx=EVENTS.indexOf(ev);
  const stage=(SPA_STAGES.find(s=>s.id===mn.sp))||SPA_STAGES[0], len=stage.b-stage.a, n=opps.length+1, pslot=Math.min(n-1,3);
  const slots=Array.from({length:n},(_,k)=>({off:8+k*8,lane:k%2?2.6:-2.6}));
  const mk=(r,card,slot)=>{const q=mkSpaCar(r,r.m,stage.a-slot.off,slot.lane,card.etat); q.prog=-slot.off; q.timePen=0; q.mass=Math.max(80,st(card).kg); q.laneT=slot.lane; return q;};
  const Pr=mkRacer(c,mn,{skill:.9,err:0,react:rnd(.3,.5)}), P=mk(Pr,c,slots[pslot]); P.card=c; P.nit=0;
  const Os=opps.map((o,k)=>{
    const stl=STYLES[o.sty||0], sk=clamp(.84+idx*.012+S.lvl*.0025+stl.sk+rnd(-.015,.015),.8,.985), r=mkRacer(o,mn,{skill:sk,err:0,react:rnd(.25,.6)});
    const q=mk(r,o,slots[k<pslot?k:k+1]); q.skill=sk; q.prof=aiProfile(r,sk); q.sty=stl; q.pil=o.pil; q.pref=rnd(-1.6,1.6); return q;
  });
  RC={kind:'spa',i,mn,stage,len,auto:R.auto,clock:-3.4,inp:{t:0,k:0,b:false,kb:false,st:0,sk:0,hand:false},flash:null,endAt:null,done:false,P,Os,all:[P].concat(Os),O:Os[0],pos:pslot+1,profP:aiProfile(Pr,.9)};
  RS=buildSpa(stage,mn,Pr,Os.map(o=>o.r),slots);
  auRaceStart({pm:Pr.m,oms:Os.map(o=>o.r.m),rain:mn.m==='pluie',siren:Pr.m.glb==='patrouille'});
  view='race'; render(); document.querySelector('main').scrollTop=0;
}
function respawnPlayer(){
  if(!RC||RC.kind!=='spa'||RC.done||RC.clock<0) return;
  const P=RC.P; if(P.fin!=null) return; respawn(P); P.timePen+=5; flash('Remise en piste, +5 s','#FCEE0A',1.6); ui('respawn');
}
/* ---- boucle de simulation ---- */
const inSteer=()=>{const i=RC.inp; return Math.max(-1,Math.min(1,i.st+i.sk));};
function carPair(A,B){
  const dx0=A.x-B.x, dz0=A.z-B.z; if(dx0*dx0+dz0*dz0>49) return;
  const wA=B.mass/(A.mass+B.mass), wB=1-wA, ra=Math.min(1.5,A.len/2-.5), rb=Math.min(1.5,B.len/2-.5), rr=Math.min(.95,A.wid/2)+Math.min(.95,B.wid/2);
  for(const a of [ra,0,-ra]) for(const b of [rb,0,-rb]){
    const ax=A.x+Math.cos(A.psi)*a, az=A.z+Math.sin(A.psi)*a, bx=B.x+Math.cos(B.psi)*b, bz=B.z+Math.sin(B.psi)*b;
    let dx=ax-bx, dz=az-bz, d=Math.hypot(dx,dz); if(d<rr&&d>1e-4){
      dx/=d; dz/=d; const ov=rr-d; A.x+=dx*ov*wA; A.z+=dz*ov*wA; B.x-=dx*ov*wB; B.z-=dz*ov*wB;
      const vr=(A.vx-B.vx)*dx+(A.vz-B.vz)*dz;
      if(vr<0){const j=-1.25*vr/(1/A.mass+1/B.mass); A.vx+=j/A.mass*dx; A.vz+=j/A.mass*dz; B.vx-=j/B.mass*dx; B.vz-=j/B.mass*dz;
        if(-vr>4) for(const c of [A,B]) if(c===RC.P){c.hitFlash=Math.max(c.hitFlash,Math.min(1,-vr/12)); c.dmg+=-vr*.015*(c.r.dR||1); auHit(-vr,c,true);}}
    }
  }
}
function tickSpa(h){
  const P=RC.P, Os=RC.Os, all=RC.all; RC.clock+=h; const t=RC.clock;
  if(t<0){
    if(!RC.auto&&inThr()>.05&&P.penSet==null){P.penSet=1; P.pen=.8; flash('Faux départ, moteur coupé 0,8 s','#FF4D6D',1.6);}
    return;
  }
  if(!P.go){
    if(RC.auto){if(t>=P.r.react) P.go=true;}
    else{P.go=true; if(inThr()>.05&&!P.penSet) flash(t<.3?'Départ parfait':'Parti','#3CFF9E',.9);}
  }
  let inp;
  if(RC.auto&&P.fin==null){ const l0=P.laneT*Math.max(0,1-Math.max(0,P.prog)/200), trf=aiPass(P,all,l0,1); inp=aiControl(P,RC.profP,trf.lane,.9); if(trf.cap<1){inp.thr=Math.min(inp.thr,trf.cap); if(trf.brake) inp.brake=true;} }
  else inp={steer:inSteer(),thr:inThr(),brake:RC.inp.b||RC.inp.kb,hand:RC.inp.hand};
  if(P.fin!=null) inp={steer:0,thr:.3,brake:false,hand:false};
  carStep(P,inp,h); carWorld(P,h); P.thrNow=inp.thr; P.braking=!!inp.brake;
  for(const o of Os){
    if(!o.go&&t>=o.r.react) o.go=true;
    let lane=o.laneT+(o.pref-o.laneT)*clamp(o.prog/150,0,1); const trf=aiPass(o,all,lane,o.sty.room); lane=trf.lane;
    const rb=1+clamp((P.prog-o.prog)/2500,-.03,.03);
    const oi=aiControl(o,o.prof,lane,(o.fin!=null?.6:o.skill)*rb);
    if(trf.cap<1){oi.thr=Math.min(oi.thr,trf.cap); if(trf.brake) oi.brake=true;}
    carStep(o,oi,h); carWorld(o,h); o.thrNow=oi.thr; o.braking=!!oi.brake;
    o.stuckT=(o.go&&o.v<1.2)?o.stuckT+h:0; if(o.stuckT>3.5){respawn(o); o.stuckT=0;}
  }
  for(let a=0;a<all.length;a++) for(let b=a+1;b<all.length;b++) carPair(all[a],all[b]);
  /* sens interdit, voiture bloquée */
  const fr=frameAt(P.s), al=P.vx*Math.cos(fr.th)+P.vz*Math.sin(fr.th);
  P.wrongT=(al<-4)?P.wrongT+h:0; P.stuckT=(P.v<1.2&&P.fin==null)?P.stuckT+h:0;
  for(const c of all) if(c.fin==null&&c.prog>=RC.len) c.fin=t-(c.prog-RC.len)/Math.max(c.v,1);
  RC.pos=1+Os.filter(o=>o.prog>P.prog).length;
  RC.O=Os.reduce((a,b)=>Math.abs(b.prog-P.prog)<Math.abs(a.prog-P.prog)?b:a);
  if(P.fin!=null&&RC.endAt==null) RC.endAt=t+2.2;
  if(P.fin==null&&Os.every(o=>o.fin!=null)&&t>Math.max.apply(null,Os.map(o=>o.fin))*1.25+15){P.dnf=true; RC.endAt=t;}
  if(t>600&&RC.endAt==null){P.dnf=true; RC.endAt=t;}
  if(P.msgHit==null&&P.hitFlash>.6){P.msgHit=1; flash('Choc !','#FF4D6D',.8);} if(P.hitFlash<.1) P.msgHit=null;
  if(RC.endAt!=null&&t>=RC.endAt&&!RC.done) endSpa();
}
function endSpa(){
  const P=RC.P, c=P.card; RC.done=true;
  const a=P.dnf?null:P.fin+P.timePen, ot=RC.Os.map(o=>({nom:o.pil+' ('+o.r.nom+')',t:o.fin!=null?o.fin+o.timePen:RC.clock+(RC.len-o.prog)/Math.max(o.v,8)}));
  c.etat=Math.max(5,c.etat-Math.round((rint(1,3)+Math.round(P.dmg*10))*wearK()));
  const row=mkRow(RC.mn,c,a,ot,{nit:P.nit,hits:P.hits,pen:P.timePen,an:P.r.nom,xpB:P.r.xB||0});
  R.rows.push(row); auFinish(row.rank===1); showOver(row,'.padS');
}
function spaFrame(dt,time){
  if(!RC||RC.kind!=='spa'||!RS) return;
  let left=dt; while(left>1e-6&&!RC.done&&!RC.paused){const h=Math.min(left,1/120); tickSpa(h); left-=h;}
  /* qualité adaptative */
  RS.fps+=(dt-RS.fps)*.05; if(RS.fps>.036){RS.slow+=dt; if(RS.slow>2.5&&RS.vis>300){RS.vis-=60; RS.slow=0;}} else RS.slow=0;
  drawSpa(dt,time); hudSpa(); auSpaFrame(dt);
}
function placeCar(c,cr3,dt,time){
  pulseSirens(cr3,time||0); shineTick(cr3,time||0);
  cr3.g.position.set(c.x,c.y+(c.rumble?(Math.random()-.5)*.03*c.rumble*Math.min(1,c.v/30):0),c.z);
  cr3.g.rotation.y=-c.psi; cr3.g.rotation.z=c.pitch; cr3.g.rotation.x=c.roll;
  cr3.wheels.forEach(w=>{w.rotation.z-=c.v*dt/(cr3.wr||.34);});
  cr3.flame.visible=c.nitroT>0; if(c.nitroT>0){const f=.8+Math.random()*.6; cr3.flame.scale.set(f,1,f);}
  cr3.brake(!!c.braking);
}
function drawSpa(dt,time){
  const P=RC.P,O=RC.O,cam=RS.cam; placeCar(P,RS.pc,dt,time); RC.Os.forEach((o,k)=>placeCar(o,RS.ocs[k],dt,time));
  /* caméra poursuite : entre le cap et la direction de déplacement */
  const vang=P.v>6?Math.atan2(P.vz,P.vx):P.psi, ang=P.psi+wrapA(vang-P.psi)*.4, dist=8.6+Math.min(P.v,90)*.025, fx=Math.cos(ang), fz=Math.sin(ang);
  const H=(RS.pc.H||1.4), camH=Math.max(3.1,1.7+H*.75);
  const tx=P.x-fx*dist, tz=P.z-fz*dist, pr=project(tx,tz,P.i), gy=groundY(pr.s,pr.d);
  let ty=Math.max(P.y+camH,gy+2.0);
  if(!RS.camPos) RS.camPos={x:tx,y:ty,z:tz}; const k=1-Math.exp(-dt*7);
  RS.camPos.x+=(tx-RS.camPos.x)*k; RS.camPos.y+=(ty-RS.camPos.y)*k; RS.camPos.z+=(tz-RS.camPos.z)*k;
  const sh=Math.max(P.hitFlash*.5,P.nitroT>0?.07:0,P.rumble*Math.min(1,P.v/40)*.05);
  cam.position.set(RS.camPos.x+(Math.random()-.5)*sh,RS.camPos.y+(Math.random()-.5)*sh,RS.camPos.z+(Math.random()-.5)*sh);
  cam.lookAt(P.x+fx*12,P.y+1.3,P.z+fz*12); if(orbitOn()) orbitSpa(cam,P,ang,dt);
  const tf=62+Math.min(P.v,95)*.13+(P.nitroT>0?12:0); RS.fov+=(tf-RS.fov)*Math.min(1,dt*4);
  if(Math.abs(cam.fov-RS.fov)>.05){cam.fov=RS.fov; cam.updateProjectionMatrix();}
  RS.sky.position.copy(cam.position);
  const sa=hash(EVENTS.indexOf(R.ev),9)*6.28; RS.sun.position.set(cam.position.x+Math.cos(sa)*1150,150,cam.position.z+Math.sin(sa)*1150); RS.sun.lookAt(cam.position);
  /* visibilité par tuile */
  RS.tick=(RS.tick||0)+1;
  if(RS.tick%6===1){for(const key in RS.tiles){const g=RS.tiles[key], d=Math.hypot(g.userData.cx-P.x,g.userData.cz-P.z); g.visible=d<RS.vis+190; g.children.forEach(m=>{if(m.userData&&m.userData.tree) m.visible=RS.vis>=340&&d<RS.vis*.8;});}}
  if(RS.weather) updWeather(RS.weather,cam.position.x,cam.position.y,cam.position.z,fx,fz,dt,P.v);
}
function hudSpa(){
  const P=RC.P, O=RC.O, t=RC.clock, S=SURF[P.surf]||SURF[7];
  sT('hSpd',String(Math.round(P.v*3.6))); sT('hPos',(RC.pos||1)+' / '+(RC.Os.length+1));
  sT('hTime',(Math.max(0,P.fin!=null?P.fin+P.timePen:t+P.timePen)).toFixed(2).replace('.',',')+' s');
  const gap=O.prog-P.prog; sT('hGap',P.go||RC.auto?(gap>.5?`${O.pil} devant, ${Math.round(gap)} m`:`${O.pil} derrière, ${Math.round(Math.max(0,-gap))} m`):'');
  const L=$('hLights'); if(L){
    L.style.display=(t>1.4||(P.go&&t>.6))?'none':'flex';
    const n=t<0?clamp(Math.floor(t+3.4),0,3):3; auLights(n,t>=0); [...L.children].forEach((e,k)=>{const c=t>=0?'g':(k<n?'r':''); if(e._c!==c){e._c=c; e.className=c;}});
  }
  let msg='', col='#E8EBFF';
  if(RC.flash&&t<RC.flash.until){msg=RC.flash.txt; col=RC.flash.col;}
  else if(P.wrongT>1.2){msg='SENS INTERDIT'; col='#FF4D6D';}
  else if(P.stuckT>4&&P.go){msg='Bloqué ? Touche « Remettre en piste »'; col='#FCEE0A';}
  else if(t>=0&&!P.go&&!RC.auto&&P.penSet==null){msg='Écrase le gaz'; col='#3CFF9E';}
  else if(P.fin!=null){msg='Arrivée'; col='#FCEE0A';}
  const m=$('hMsg'); if(m){if(m._v!==msg){m._v=msg; m.textContent=msg;} if(m._c!==col){m._c=col; m.style.color=col;}}
  const chip=$('hSurf'); if(chip){const nm=(P.surf===7||P.surf===6)?'':S.n; if(chip._v!==nm){chip._v=nm; chip.textContent=nm; chip.style.color=SURF_COL[P.surf]||'#fff'; chip.style.display=nm?'block':'none';}}
  const sp=$('hSpd'); if(sp) sp.classList.toggle('hot',!P.onPave&&P.v>8);
  const th=RC.auto?(P.go?1:0):(RC.inp.b||RC.inp.kb?0:inThr());
  const gf=$('gasFill'); if(gf) gf.style.width=Math.round(th*100)+'%';
  const gp=$('gasPed'); if(gp) gp.style.height=Math.round(th*100)+'%';
  const nf=$('nitFill'); if(nf) nf.style.width=Math.round(clamp(P.nitroT/NITRO_DUREE,0,1)*100)+'%'; fxUpdate(P,RC);
  const hp=$('hProg'); if(hp) hp.style.width=Math.round(clamp(P.prog/RC.len,0,1)*100)+'%';
  const bn=$('pNit'); if(bn) bn.classList.toggle('on',P.nitroT>0);
  const kn=$('steerKnob'); if(kn){const v=Math.round(P.steer/ .6*50)/50; const x=Math.round(clamp(inSteer(),-1,1)*45); if(kn._x!==x){kn._x=x; kn.style.transform=`rotate(${(x*2.6).toFixed(0)}deg)`;}}
  RS.mt=(RS.mt||0)+1; const mc=$('mini'); if(mc&&RS.mt%3===0){const g=mc.getContext('2d'); g.clearRect(0,0,96,150); g.drawImage(RS.mini,0,0);
    const dot=(c,col)=>{const p=RS.miniP(c.x,c.z); g.fillStyle=col; g.beginPath(); g.arc(p[0],p[1],3.2,0,7); g.fill();}; RC.Os.forEach(o=>dot(o,'#FF2BD6')); dot(P,'#00E5FF');}
}
function bindSpa(){
  if(!GL.r||!RS) return; glAttach('rslot');
  const bg=$('pGas'), bb=$('pBrk'), bn=$('pNit'), zn=$('steerZone'); let y0=0, gdown=false;
  const mini=$('mini'); if(mini){mini.width=96; mini.height=150;}
  bg.addEventListener('pointerdown',e=>{e.preventDefault(); try{bg.setPointerCapture(e.pointerId);}catch(_){} gdown=true; y0=e.clientY; RC.inp.t=1;});
  bg.addEventListener('pointermove',e=>{if(!gdown) return; RC.inp.t=clamp(1-Math.max(0,e.clientY-y0)/110,.25,1);});
  const gup=()=>{gdown=false; RC.inp.t=0;}; bg.addEventListener('pointerup',gup); bg.addEventListener('pointercancel',gup);
  bb.addEventListener('pointerdown',e=>{e.preventDefault(); try{bb.setPointerCapture(e.pointerId);}catch(_){} RC.inp.b=true; bb.classList.add('on');});
  const bup=()=>{RC.inp.b=false; bb.classList.remove('on');}; bb.addEventListener('pointerup',bup); bb.addEventListener('pointercancel',bup);
  bn.addEventListener('pointerdown',e=>{e.preventDefault(); fireNitro();});
  /* direction : la position du doigt dans la zone fixe l'angle du volant */
  const setSt=e=>{const r=zn.getBoundingClientRect(); RC.inp.st=clamp(((e.clientX-r.left)/r.width*2-1)*1.15,-1,1);};
  zn.addEventListener('pointerdown',e=>{e.preventDefault(); zn.classList.remove('rel'); try{zn.setPointerCapture(e.pointerId);}catch(_){} setSt(e);});
  zn.addEventListener('pointermove',e=>{if(e.buttons||e.pressure>0) setSt(e);});
  const zup=()=>{RC.inp.st=0; zn.classList.add('rel');}; zn.addEventListener('pointerup',zup); zn.addEventListener('pointercancel',zup);
  [bg,bb,bn,zn].forEach(b=>b.addEventListener('contextmenu',e=>e.preventDefault()));
  glRun(RS.scene,RS.cam,spaFrame,'race');
}
function vSpa(){
  const ev=R.ev, n=ev.manches.length, auto=RC.auto;
  return `<div class="race"><div class="rwrap"><div class="rs" id="rslot"></div>
    <div class="hud"><div class="hud-top"><span>Manche ${RC.i+1}/${n}, ${RC.stage.nom}</span><span id="hTime">0,00 s</span></div>
      <div class="prog2"><i id="hProg"></i></div>
      <div class="hud-gap" id="hGap"></div><div class="hud-pos" id="hPos"></div>
      <canvas id="mini" class="mini" width="96" height="150"></canvas>
      <div class="hud-lights" id="hLights"><i></i><i></i><i></i></div>
      <div class="hud-msg" id="hMsg"></div>
      <div class="hud-surf" id="hSurf"></div>
      <div class="hud-bot"><div class="spd"><b id="hSpd">0</b><small>km/h</small></div>
        <div class="gauges"><div class="g"><span>Gaz</span><div class="bar2"><i id="gasFill"></i></div></div><div class="g"><span>Nitro</span><div class="bar2 n"><i id="nitFill"></i></div></div></div></div></div>${FXL}</div>
    <div class="padS">
      <div id="steerZone" class="steer ${auto?'off':''}"><div id="steerKnob" class="wheel">${WHEEL}</div><div class="lab">${auto?'Pilote auto':'Volant'}</div></div>
      <button id="pBrk" class="pedal brk" ${auto?'disabled':''}><span>${auto?'Auto':'Frein'}</span></button>
      <button id="pNit" class="pedal nit">Nitro<small>×${S.nitro}</small></button>
      <button id="pGas" class="pedal gas" ${auto?'disabled':''}><i id="gasPed"></i><span>${auto?'Auto':'Gaz'}</span></button>
    </div>
    <div id="over" hidden></div>
    <div style="display:flex;gap:8px"><button class="btn alt sm" id="bAud" data-a="audio">⚙ Son</button><button class="btn alt sm" id="bResp" data-a="respawn">Remettre en piste (+5 s)</button><button class="btn danger sm" id="bQuit" data-a="quit">Abandonner</button></div></div>`;
}

/* ======================================================================
   AUDIO : tout est synthétisé avec la Web Audio API (aucun fichier son)
   - bruits de voiture (moteur par type, turbo, pneus, vent, chocs, sirène)
   - musique adaptative sur une grille fixe (174 BPM) : ambiance, dubstep,
     drum and bass, version intense, et « drop » hardcore pendant la nitro
   - ambiances de menu et sons d'interface
   ====================================================================== */
const AU={ctx:null,ok:false,muted:false,vm:.7,vs:.85,view:null,log:null,seq:{timer:null,next:0,step:0,mood:'menu',level:0,cur:0,dropFrom:null,dropTo:null,heldBars:0},raceLevel:0,eng:null,loops:null,lastResult:null};
const BPM=174, STEP=60/BPM/4, BAR=STEP*16;
const LOG=(n,t,x)=>{if(AU.log) AU.log.push({n,t,x});};
const auTry=f=>{try{return f();}catch(e){return undefined;}};

/* ---------- construction du graphe ---------- */
function auUnlock(){
  if(AU.ctx){ if(AU.ctx.state==='suspended') auTry(()=>AU.ctx.resume()); return; }
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  try{AU.ctx=new AC({latencyHint:'interactive'});}catch(e){try{AU.ctx=new AC();}catch(_){return;}}
  try{auBuild(); AU.ok=true;}catch(e){AU.ok=false; try{console.warn('audio',e);}catch(_){}; return;}
  auTry(()=>AU.ctx.resume()); auApplyVol(); auView(view,true);
}
function mkCurve(kind,k){
  const n=2048, c=new Float32Array(n);
  for(let i=0;i<n;i++){const x=i*2/n-1; c[i]=kind==='tanh'?Math.tanh(k*x):(1+k)*x/(1+k*Math.abs(x));}
  return c;
}
function auBuild(){
  const c=AU.ctx;
  AU.master=c.createGain(); AU.limit=c.createDynamicsCompressor();
  AU.limit.threshold.value=-9; AU.limit.knee.value=8; AU.limit.ratio.value=14; AU.limit.attack.value=.004; AU.limit.release.value=.22;
  AU.master.connect(AU.limit); AU.limit.connect(c.destination);
  AU.sfx=c.createGain(); AU.sfx.connect(AU.master);
  AU.b={}; ['eng','opp','siren','amb','hit','ui','jing'].forEach(k=>{AU.b[k]=c.createGain(); AU.b[k].connect(AU.sfx);});
  AU.engBus=c.createGain(); AU.engBus.gain.value=.9; AU.engBus.connect(AU.sfx);
  AU.mus=c.createGain(); AU.mFilt=c.createBiquadFilter(); AU.mFilt.type='lowpass'; AU.mFilt.frequency.value=1800; AU.mFilt.Q.value=.5;
  AU.mus.connect(AU.mFilt); AU.mFilt.connect(AU.master);
  AU.padBus=c.createGain(); AU.padBus.connect(AU.mus);                    /* nappes : pompage à chaque grosse caisse */
  /* réverbération : bruit décroissant */
  const sr=c.sampleRate, len=Math.floor(sr*1.7), ib=c.createBuffer(2,len,sr);
  for(let ch=0;ch<2;ch++){const d=ib.getChannelData(ch); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4);}
  AU.rev=c.createConvolver(); AU.rev.buffer=ib; AU.revIn=c.createGain(); AU.revIn.gain.value=.5; AU.revIn.connect(AU.rev); AU.rev.connect(AU.mus);
  /* bruits */
  const nl=sr*2, nb=c.createBuffer(1,nl,sr), nd=nb.getChannelData(0); for(let i=0;i<nl;i++) nd[i]=Math.random()*2-1; AU.noise=nb;
  const pb=c.createBuffer(1,sr*3,sr), pd=pb.getChannelData(0); let b0=0,b1=0,b2=0; for(let i=0;i<pd.length;i++){const w=Math.random()*2-1; b0=.99765*b0+w*.099046; b1=.963*b1+w*.2965164; b2=.57*b2+w*1.0526913; pd[i]=(b0+b1+b2+w*.1848)*.22;} AU.pink=pb;
  AU.cSoft=mkCurve('soft',4); AU.cHard=mkCurve('tanh',9); AU.cMid=mkCurve('tanh',3);
}
function auApplyVol(){
  if(!AU.ok) return; const t=AU.ctx.currentTime, v=AU.v||AUDEF;
  AU.master.gain.setTargetAtTime(AU.muted?.0001:Math.max(.0001,v.master),t,.05);
  AU.mus.gain.setTargetAtTime(Math.max(.0001,v.music*.42),t,.05);
  AU.sfx.gain.setTargetAtTime(.9,t,.05);
  for(const k in AU.b) AU.b[k].gain.setTargetAtTime(Math.max(.0001,v[k]),t,.05);
}
function auSet(s){ if(!s) return; AU.muted=!!s.mute; AU.v=Object.assign({},AUDEF,s); auApplyVol(); }
document.addEventListener('visibilitychange',()=>{ if(!AU.ctx) return; auTry(()=>document.hidden?AU.ctx.suspend():AU.ctx.resume()); });

/* ---------- briques sonores ---------- */
function nsrc(buf,loop){const s=AU.ctx.createBufferSource(); s.buffer=buf||AU.noise; s.loop=!!loop; return s;}
function envGain(t,peak,atk,dec,min){const g=AU.ctx.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(Math.max(.0002,peak),t+atk); g.gain.exponentialRampToValueAtTime(min||.0002,t+atk+dec); return g;}
function osc(type,f,t,dur,dest,peak,atk,rel,detune){
  const c=AU.ctx, o=c.createOscillator(); o.type=type; o.frequency.setValueAtTime(Math.max(1,f),t); if(detune) o.detune.value=detune;
  const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(Math.max(.0002,peak),t+(atk||.005));
  g.gain.setValueAtTime(Math.max(.0002,peak),t+Math.max((atk||.005)+.001,dur)); g.gain.exponentialRampToValueAtTime(.0002,t+Math.max((atk||.005)+.002,dur)+(rel||.08));
  o.connect(g); g.connect(dest); o.start(t); o.stop(t+Math.max(dur,.01)+(rel||.08)+.05); return {o,g};
}
function burst(t,dur,f,q,type,vol,dest,pink){
  const c=AU.ctx, s=nsrc(pink?AU.pink:AU.noise,true), fl=c.createBiquadFilter(); fl.type=type; fl.frequency.setValueAtTime(f,t); fl.Q.value=q;
  const g=envGain(t,vol,.002,dur); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t); s.stop(t+dur+.06); return {s,fl,g};
}
function sendRev(node,amt){const g=AU.ctx.createGain(); g.gain.value=amt; node.connect(g); g.connect(AU.revIn);}

/* batterie */
function kick(t,vol,o){
  o=o||{}; const c=AU.ctx, os=c.createOscillator(), g=c.createGain(), p0=o.p0||165, p1=o.p1||44, dc=o.dec||.3; LOG('kick',t,o.hard?'hard':'');
  os.type='sine'; os.frequency.setValueAtTime(p0,t); os.frequency.exponentialRampToValueAtTime(p1,t+.11);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dc);
  if(o.hard){const ws=c.createWaveShaper(); ws.curve=AU.cHard; const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1100; os.connect(ws); ws.connect(lp); lp.connect(g);} else os.connect(g);
  g.connect(o.dest||AU.mus); os.start(t); os.stop(t+dc+.05);
  if(!o.noClick) burst(t,.012,3500,.7,'highpass',vol*.35,o.dest||AU.mus);
  if(!o.noDuck){AU.padBus.gain.cancelScheduledValues(t); AU.padBus.gain.setValueAtTime(.25,t); AU.padBus.gain.linearRampToValueAtTime(1,t+.16);}
}
function snare(t,vol,o){
  o=o||{}; LOG('snare',t,o.hard?'hard':''); const d=o.dest||AU.mus;
  burst(t,o.long?.28:.19,o.hard?2400:1900,.9,'bandpass',vol,d);
  osc('triangle',o.hard?220:185,t,.02,d,vol*.45,.002,.09);
  if(o.hard){const ws=AU.ctx.createWaveShaper(); ws.curve=AU.cMid; const g=envGain(t,vol*.5,.002,.12); const s=nsrc(AU.noise,true); s.connect(ws); ws.connect(g); g.connect(d); s.start(t); s.stop(t+.2);}
}
function hat(t,vol,open){LOG(open?'ohat':'hat',t); burst(t,open?.2:.045,open?8000:9000,.6,'highpass',vol,AU.mus);}
function clap(t,vol){LOG('clap',t); for(let k=0;k<3;k++) burst(t+k*.012,.07,1500,1.2,'bandpass',vol*(k===2?1:.6),AU.mus);}
function crash(t,vol){LOG('crash',t); burst(t,1.3,5200,.5,'highpass',vol,AU.mus);}
function clank(t,vol){LOG('clank',t); [523,787,1181,1760].forEach((f,i)=>osc('square',f*(1+i*.01),t,.03,AU.mus,vol*.12,.001,.18+.05*i)); burst(t,.05,3000,2,'bandpass',vol*.5,AU.mus);}

/* basses, nappes, leads */
function sub(t,dur,f,vol){LOG('sub',t,f); osc('sine',f,t,dur,AU.mus,vol,.01,.08);}
function wobble(t,dur,f,vol,rate,depth){
  LOG('wobble',t,f); const c=AU.ctx, d=Math.max(.05,dur), lp=c.createBiquadFilter(); lp.type='lowpass'; lp.Q.value=9; lp.frequency.setValueAtTime(380,t);
  const lfo=c.createOscillator(), lg=c.createGain(); lfo.type='sine'; lfo.frequency.setValueAtTime(rate,t); lg.gain.value=depth||650; lfo.connect(lg); lg.connect(lp.frequency);
  const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.01); g.gain.setValueAtTime(vol,t+d); g.gain.exponentialRampToValueAtTime(.0002,t+d+.06);
  [-9,9].forEach(det=>{const o=c.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(f,t); o.detune.value=det; o.connect(lp); o.start(t); o.stop(t+d+.1);});
  const sq=c.createOscillator(); sq.type='square'; sq.frequency.setValueAtTime(f/2,t); const sg=c.createGain(); sg.gain.value=.5; sq.connect(sg); sg.connect(lp); sq.start(t); sq.stop(t+d+.1);
  lp.connect(g); g.connect(AU.mus); lfo.start(t); lfo.stop(t+d+.1);
}
function reese(t,dur,f,vol){
  LOG('reese',t,f); const c=AU.ctx, d=Math.max(.05,dur), lp=c.createBiquadFilter(); lp.type='lowpass'; lp.Q.value=3; lp.frequency.setValueAtTime(420,t); lp.frequency.linearRampToValueAtTime(900,t+d*.5); lp.frequency.linearRampToValueAtTime(420,t+d);
  const ws=c.createWaveShaper(); ws.curve=AU.cSoft; const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.01); g.gain.setValueAtTime(vol,t+d); g.gain.exponentialRampToValueAtTime(.0002,t+d+.05);
  [-14,14].forEach(det=>{const o=c.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(f,t); o.detune.value=det; o.connect(ws); o.start(t); o.stop(t+d+.08);});
  ws.connect(lp); lp.connect(g); g.connect(AU.mus);
}
function hardBass(t,dur,f,vol){
  LOG('hardbass',t,f); const c=AU.ctx, d=Math.max(.05,dur), ws=c.createWaveShaper(); ws.curve=AU.cHard; const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1500; lp.Q.value=2;
  const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.005); g.gain.setValueAtTime(vol,t+d); g.gain.exponentialRampToValueAtTime(.0002,t+d+.04);
  ['sawtooth','square'].forEach((ty,i)=>{const o=c.createOscillator(); o.type=ty; o.frequency.setValueAtTime(f*1.5,t); o.frequency.exponentialRampToValueAtTime(f,t+.06); o.detune.value=i?7:-7; o.connect(ws); o.start(t); o.stop(t+d+.07);});
  ws.connect(lp); lp.connect(g); g.connect(AU.mus);
}
function screech(t,dur,f,vol){
  LOG('screech',t,f); const c=AU.ctx, d=Math.max(.05,dur), bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=6; bp.frequency.setValueAtTime(2200,t); bp.frequency.linearRampToValueAtTime(3600,t+d);
  const ws=c.createWaveShaper(); ws.curve=AU.cHard; const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.004); g.gain.setValueAtTime(vol,t+d*.8); g.gain.exponentialRampToValueAtTime(.0002,t+d+.04);
  [0,19].forEach(det=>{const o=c.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(f*1.3,t); o.frequency.exponentialRampToValueAtTime(f,t+d); o.detune.value=det; o.connect(ws); o.start(t); o.stop(t+d+.07);});
  ws.connect(bp); bp.connect(g); g.connect(AU.mus); sendRev(g,.25);
}
function pad(t,dur,freqs,vol){
  LOG('pad',t,freqs[0]); const c=AU.ctx, lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.setValueAtTime(500,t); lp.frequency.linearRampToValueAtTime(1500,t+dur*.6); lp.Q.value=.8;
  const g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+Math.min(1.2,dur*.4)); g.gain.setValueAtTime(vol,t+dur); g.gain.exponentialRampToValueAtTime(.0002,t+dur+1.1);
  freqs.forEach(f=>[-8,8].forEach(det=>{const o=c.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(f,t); o.detune.value=det; o.connect(lp); o.start(t); o.stop(t+dur+1.2);}));
  lp.connect(g); g.connect(AU.padBus); sendRev(g,.5);
}
function pluck(t,f,vol,wave,len){
  LOG('pluck',t,f); const c=AU.ctx, o=c.createOscillator(), g=envGain(t,vol,.004,len||.32), lp=c.createBiquadFilter(); o.type=wave||'triangle'; o.frequency.setValueAtTime(f,t);
  lp.type='lowpass'; lp.frequency.setValueAtTime(3200,t); lp.frequency.exponentialRampToValueAtTime(700,t+(len||.32)); o.connect(lp); lp.connect(g); g.connect(AU.mus); sendRev(g,.35); o.start(t); o.stop(t+(len||.32)+.08);
}
function stab(t,f,vol,dur){
  LOG('stab',t,f); const c=AU.ctx, d=dur||.2, lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.setValueAtTime(4200,t); lp.frequency.exponentialRampToValueAtTime(900,t+d); lp.Q.value=2;
  const g=envGain(t,vol,.003,d); [-12,0,12].forEach(det=>{const o=c.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(f,t); o.detune.value=det; o.connect(lp); o.start(t); o.stop(t+d+.06);}); lp.connect(g); g.connect(AU.mus); sendRev(g,.3);
}
function riser(t0,t1){
  LOG('riser',t0,t1-t0); const c=AU.ctx, d=Math.max(.1,t1-t0), bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=2.5; bp.frequency.setValueAtTime(300,t0); bp.frequency.exponentialRampToValueAtTime(9000,t0+d);
  const g=c.createGain(); g.gain.setValueAtTime(.02,t0); g.gain.exponentialRampToValueAtTime(.7,t0+d); g.gain.linearRampToValueAtTime(.0002,t0+d+.03);
  const s=nsrc(AU.noise,true); s.connect(bp); bp.connect(g); g.connect(AU.mus); s.start(t0); s.stop(t0+d+.06);
  const o=c.createOscillator(), og=c.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(180,t0); o.frequency.exponentialRampToValueAtTime(1800,t0+d); og.gain.setValueAtTime(.0002,t0); og.gain.exponentialRampToValueAtTime(.18,t0+d); og.gain.linearRampToValueAtTime(.0002,t0+d+.03);
  o.connect(og); og.connect(AU.mus); o.start(t0); o.stop(t0+d+.06);
  const n=Math.max(4,Math.round(d/.05)); for(let k=0;k<n;k++){const tt=t0+d*(1-Math.pow(1-k/n,1.6)); if(tt<t1-.01) snare(tt,.18+.35*k/n,{});}
}
function impact(t,vol){ LOG('impact',t); sub(t,.7,38,vol); osc('sine',90,t,.2,AU.mus,vol*.6,.001,.4); crash(t,vol*.7); burst(t,.5,200,.8,'lowpass',vol*.6,AU.mus); }

/* ---------- morceau : accords, ambiances, motifs ---------- */
const CHORDS=[
 {sub:55,   bass:110,    pad:[220,261.63,329.63],   arp:[220,261.63,329.63,440,523.25,659.25]},
 {sub:43.65,bass:87.31,  pad:[174.61,220,261.63],   arp:[174.61,220,261.63,349.23,440,523.25]},
 {sub:65.41,bass:130.81, pad:[196,261.63,329.63],   arp:[196,261.63,329.63,392,523.25,659.25]},
 {sub:49,   bass:98,     pad:[196,246.94,293.66],   arp:[196,246.94,293.66,392,493.88,587.33]}];
const MOODS={
 menu:    {arp:[0,3,6,8,11,14],oct:1,wave:'triangle',av:.12,pv:.1,filt:1500,hat:false,pulse:true},
 garage:  {arp:[0,4,8,12],oct:1,wave:'sine',av:.16,pv:.12,filt:1200,hat:false,pulse:true},
 prep:    {arp:[0,2,4,6,8,10,12,14],oct:1,wave:'triangle',av:.08,pv:.09,filt:1900,hat:true,pulse:true},
 market:  {arp:[0,2,3,5,7,8,10,11,13,15],oct:2,wave:'triangle',av:.07,pv:.07,filt:2800,hat:true,pulse:false},
 base:    {arp:[0,6,12],oct:1,wave:'sawtooth',av:.07,pv:.12,filt:1000,hat:false,pulse:true,perc:true},
 missions:{arp:[0,5,10],oct:2,wave:'sine',av:.17,pv:.09,filt:2200,hat:false,pulse:false},
 tense:   {arp:[],oct:1,wave:'sine',av:0,pv:.14,filt:2600,hat:false,pulse:false,beat:true},
 race:    {arp:[],oct:1,wave:'sine',av:0,pv:.09,filt:19000,hat:false,pulse:false},
 stinger: {arp:[],oct:1,wave:'sine',av:0,pv:.05,filt:2000,hat:false,pulse:false},
 drag:    {arp:[],oct:1,wave:'sine',av:0,pv:.09,filt:19000,hat:false,pulse:false}};
function auMood(m){
  if(!AU.ok||AU.seq.mood===m) return; AU.seq.mood=m; const M=MOODS[m]||MOODS.menu;
  AU.mFilt.frequency.setTargetAtTime(M.filt,AU.ctx.currentTime,.25);
  seqStart();
}
function seqStart(){
  const q=AU.seq; if(q.timer||!AU.ok) return; q.next=AU.ctx.currentTime+.12; q.step=0; q.timer=setInterval(seqTick,25);
}
function seqStop(){const q=AU.seq; if(q.timer){clearInterval(q.timer); q.timer=null;}}
function seqTick(){
  if(!AU.ok||!AU.ctx) return; const q=AU.seq, c=AU.ctx;
  if(q.next<c.currentTime-.3) q.next=c.currentTime+.05;                     /* rattrapage si l'onglet a dormi */
  while(q.next<c.currentTime+.18){ auTry(()=>schedStep(q.step,q.next)); q.next+=(q.mood==='drag'?dragSD():STEP); q.step++; }
}
function pickLevel(){
  const q=AU.seq; if(q.mood!=='race'&&q.mood!=='drag') return 0;
  q.heldBars++; let tgt=AU.raceLevel;
  if(tgt<q.cur&&q.heldBars<2) tgt=q.cur;                                     /* on ne redescend pas avant 2 mesures */
  if(tgt!==q.cur){q.cur=tgt; q.heldBars=0;} return q.cur;
}
function schedStep(step,t){
  const q=AU.seq, s=step%16, bar=Math.floor(step/16), ch=CHORDS[Math.floor(bar/2)%4], M=MOODS[q.mood]||MOODS.menu;
  if(s===0){ q.level=pickLevel(); LOG('bar',t,q.level); }
  if(q.dropFrom!=null&&step>=q.dropTo){q.dropFrom=null; q.dropTo=null;}
  if(q.dropFrom!=null&&step>=q.dropFrom){ dropStep(step-q.dropFrom,s,t,ch); return; }
  if(q.mood==='drag'){ dragSched(s,bar,t,ch); return; }
  const L=q.mood==='race'?q.level:0;
  if(s===0&&bar%2===0&&M.pv>0) pad(t,BAR*2,ch.pad,M.pv*(L>0?.7:1));
  if(L===0){
    M.arp.forEach((st,i)=>{ if(st===s) pluck(t,ch.arp[(Math.floor(bar/1)*3+i)%6]*M.oct*(q.mood==='garage'?.5:1),M.av,M.wave,q.mood==='garage'?.7:.32); });
    if(M.pulse&&s===0) sub(t,BAR*.55,ch.sub,.35);
    if(M.hat&&s%4===2) hat(t,.045,false);
    if(M.perc&&s===8&&bar%2===1) clank(t,.6);
    if(M.beat){ if(s===0||s===3) kick(t,.45,{p0:90,p1:38,dec:.22,noClick:true}); if(s===0&&bar%4===0) sub(t,BAR*4,ch.sub,.4); }
    return;
  }
  if(L===1){                                                                   /* dubstep : demi-temps */
    if(s===0||s===10) kick(t,.9);
    if(s===8){snare(t,.75,{long:true}); clap(t,.3);}
    if(s===4||s===12) hat(t,.1,false); if(s===14) hat(t,.1,true);
    if(s===0){wobble(t,STEP*8,ch.bass,.34,2.9,700); sub(t,STEP*14,ch.sub,.42);}
    if(s===10) wobble(t,STEP*4,ch.bass*1.5,.26,5.8,500);
    return;
  }
  /* drum and bass : niveaux 2 et 3 */
  if(s===0||s===10) kick(t,.92); if(L===3&&s===7) kick(t,.5);
  if(s===4||s===12) snare(t,.7); if(s===7||s===15) snare(t,.16);
  if(s%2===0) hat(t,L===3?.11:.085,false); if(s===6||s===14) hat(t,.1,true); if(L===3&&s%2===1) hat(t,.05,false);
  const rb=[[0,3],[3,3],[6,2],[10,3],[13,2]]; rb.forEach(([st,len],i)=>{ if(st===s) reese(t,STEP*len,i===1||i===4?ch.bass*1.5:ch.bass,L===3?.34:.3); });
  if(s===0) sub(t,STEP*16,ch.sub,.4);
  if(L===3){
    [2,5,8,11,14].forEach((st,i)=>{ if(st===s) stab(t,ch.arp[(i+bar)%6]*2,.12,STEP*2); });
    if(bar%4===3&&s>=12) snare(t,.3+.18*(s-12),{});
    if(s===0&&bar%4===0) crash(t,.3);
  }
}
/* drop hardcore : se déclenche sur le temps, dure toute la nitro */
function dropStep(rel,s,t,ch){
  if(rel===0) impact(t,.9);
  if(s%4===0) kick(t,1.0,{hard:true,p0:260,p1:48,dec:.36,dest:AU.mus});
  if(s===14||s===15) kick(t,.8,{hard:true,p0:220,p1:50,dec:.15,noDuck:false});
  if(s%4===2) hardBass(t,STEP*2.6,ch.bass,.42);
  if(s===3||s===7||s===11||s===15) screech(t,STEP*2.2,ch.arp[(s+rel)%6]*2,.16);
  if(s===4||s===12){snare(t,.7,{hard:true,long:true}); clap(t,.35);}
  if(s%4===2) hat(t,.14,true); else hat(t,.09,false);
  if(s===0&&rel===0) sub(t,STEP*10,ch.sub,.5);
}
/* nitro : montée tendue, puis drop sur le temps suivant */
function auNitro(){
  if(!AU.ok) return; const q=AU.seq, c=AU.ctx, t0=c.currentTime;
  auSfxNitro(t0);
  if(!q.timer) seqStart();
  /* premier pas de grille qui est un temps (s%4==0), pas encore planifié, et au moins 120 ms plus tard */
  let st=q.step, tt=q.next; while(!(st%4===0&&tt>=t0+.12)){st++; tt+=STEP;}
  q.dropFrom=st; q.dropTo=st+32; LOG('nitro',t0,{dropAt:tt});
  riser(Math.max(t0,tt-Math.min(.46,tt-t0)),tt);
}
/* niveau de la musique d'après la vitesse relative de la voiture */
function auSetSpeed(frac){
  const cur=AU.raceLevel; let L=cur; AU.speedFrac=frac;
  const dg=AU.race&&AU.race.drag, up=dg?[.08,.28,.5]:[.1,.4,.7], dn=dg?[.05,.22,.42]:[.06,.33,.6];
  if(cur<1&&frac>=up[0]) L=1; if(cur<2&&frac>=up[1]) L=2; if(cur<3&&frac>=up[2]) L=3;
  if(cur>=3&&frac<dn[2]) L=2; if(L>=2&&frac<dn[1]) L=1; if(L>=1&&frac<dn[0]) L=0;
  AU.raceLevel=L;
}

/* ---------- sons d'interface ---------- */
function ui(kind,arg){
  if(!AU.ok) return; const c=AU.ctx, t=c.currentTime+.005, d=AU.b.ui; LOG('ui',t,kind);
  const bl=(f,dur,vol,type,t0)=>osc(type||'square',f,t0||t,dur,d,vol,.002,.04);
  switch(kind){
   case 'click': bl(1500,.015,.07); bl(900,.02,.05,'sine',t+.012); break;
   case 'close': bl(900,.02,.06); bl(600,.03,.05,'sine',t+.02); break;
   case 'open':  bl(700,.02,.06); bl(1100,.03,.06,'sine',t+.02); break;
   case 'tab': {const f={garage:[220,330,440],epreuves:[440,440,880],marche:[1319,1760,2093],base:[110,165,82],missions:[660,880,990]}[arg]||[500,700,900]; f.forEach((x,i)=>bl(x,.05,.08,arg==='base'?'sawtooth':'triangle',t+i*.045)); if(arg==='garage') burst(t,.18,300,1,'lowpass',.2,d); if(arg==='base') burst(t+.06,.06,1800,2,'bandpass',.15,d); break;}
   case 'buy': burst(t,.03,4000,1,'highpass',.2,d); [1319,1760,2349].forEach((f,i)=>osc('sine',f,t+i*.05,.04,d,.12,.002,.5)); break;
   case 'coins': for(let i=0;i<7;i++){const f=2000+Math.random()*1800; osc('sine',f,t+i*.055,.03,d,.09,.001,.18);} break;
   case 'up': [330,415,523,659,880].forEach((f,i)=>osc('sawtooth',f,t+i*.06,.05,d,.08,.002,.12)); burst(t,.3,800,1,'bandpass',.12,d); break;
   case 'error': bl(165,.1,.14); bl(150,.14,.14,'square',t+.14); break;
   case 'repair': for(let i=0;i<5;i++) burst(t+i*.045,.025,2500,3,'bandpass',.2,d); osc('triangle',1245,t+.26,.05,d,.1,.002,.3); break;
   case 'claim': [784,988,1175,1568].forEach((f,i)=>osc('triangle',f,t+i*.07,.06,d,.12,.002,.4)); break;
   case 'go': osc('sawtooth',90,t,.25,d,.18,.01,.3); burst(t,.35,500,1,'lowpass',.18,d); break;
   case 'beep': osc('sine',440,t,.14,d,.22,.003,.04); break;
   case 'green': osc('sine',880,t,.45,d,.26,.003,.1); osc('sine',1320,t,.45,d,.1,.003,.1); break;
   case 'false': osc('sawtooth',130,t,.6,d,.2,.003,.1); break;
   case 'respawn': burst(t,.5,400,1,'bandpass',.2,d); osc('sine',300,t,.3,d,.1,.01,.2); break;
   case 'toggle': bl(1000,.03,.07,'sine'); bl(1400,.03,.07,'sine',t+.04); break;
  }
}
function auLevelUp(){
  if(!AU.ok) return; const t=AU.ctx.currentTime+.02, d=AU.b.jing; LOG('levelup',t);
  [523,659,784,1047,1319,1568].forEach((f,i)=>{osc('sawtooth',f,t+i*.08,.12,d,.1,.004,.5); osc('sine',f*2,t+i*.08,.08,d,.07,.004,.6);}); burst(t+.1,.8,5000,.6,'highpass',.16,d,true);
}
function auStinger(win){
  if(!AU.ok) return; const t=AU.ctx.currentTime+.05; LOG('stinger',t,win); AU.stg=AU.stg||AU.ctx.createGain(); AU.stg.gain.value=.9; AU.stg.connect(AU.b.jing); const d=AU.stg;
  if(win){ [523,659,784,1047].forEach((f,i)=>{osc('sawtooth',f,t+i*.12,.1,d,.1,.004,.45); osc('square',f/2,t+i*.12,.1,d,.04,.004,.4);});
    [523,659,784,1047].forEach(f=>osc('sawtooth',f,t+.55,1.2,d,.08,.02,1)); burst(t+.5,1.4,6000,.5,'highpass',.14,d,true); osc('sine',65,t,.6,d,.3,.01,.5); }
  else { [440,415,392,349,329].forEach((f,i)=>{osc('triangle',f,t+i*.3,.3,d,.14,.01,.5); osc('sawtooth',f*.5,t+i*.3,.3,d,.05,.01,.5,12);}); osc('sine',55,t,2,d,.3,.05,1); burst(t,1.4,400,.8,'lowpass',.12,d,true); }
}
/* clic global : le son dépend de l'action et de ce qu'elle a changé */
function auAction(a,d,pre){
  if(!AU.ok) return;
  try{
    const cr0=pre.cr, cr1=S.cr;
    if(a==='tab'){ui('tab',d.id); return;}
    if(a==='repair'){ui(cr1<cr0?'repair':'error'); return;}
    if(a==='up'||a==='bat'||a==='podup'){ui(cr1<cr0?'up':'error'); return;}
    if(a==='buy'||a==='buynew'||a==='buynitro'){ui(cr1<cr0?'buy':'error'); return;}
    if(a==='sell'){ui(cr1>cr0?'coins':'click'); return;}
    if(a==='collect'||a==='claim'){ui(cr1>cr0?(a==='claim'?'claim':'coins'):'error'); return;}
    if(a==='go'){ui('go'); return;}
    if(a==='close'){ui('close'); return;}
    if(['car','slot','slot3','ev','modslot','rates','craftopen','cartab'].includes(a)){ui('open'); return;}
    if(a==='mute'||a==='vol'){ui('toggle'); return;}
    if(['respawn','nextm','quit','audio','preset','autest','mute2','reveal','revealall','pack','fuse','craft','vclose','view3d','vol'].includes(a)) return;
    if(a==='recycle'||a==='recycleall'||a==='daily'||a==='devkit'){ui('coins'); return;}
    if(a==='modeq'){ui('up'); return;}
    ui('click');
  }catch(e){}
}

/* ---------- bruits de voiture ---------- */
const ENG_OF={velo:'velo',subi:'twin',audi:'v6',merco:'v6',patrouille:'diesel',piccola:'i4',kombi:'diesel',steppe:'i4',riva:'i4t',hauler:'v8big',touge:'i6',fury:'v8',rx4:'rally',gts:'v6',volta:'ev',majestic:'v8smooth',rossa:'v8flat',aurion:'w16'};
const ENGS={
 diesel:  {fpr:2,idle:820, red:4300,cut:520, drive:2.6,mix:[1,.75,.3], turbo:.8,rough:.22,pop:0,vol:.95,gears:[.13,.24,.38,.55,.76,1]},
 i4:      {fpr:2,idle:950, red:6800,cut:760, drive:2.4,mix:[1,.6,.3],  turbo:0, rough:.1, pop:0,vol:.8, gears:[.15,.28,.42,.6,.8,1]},
 i4t:     {fpr:2,idle:900, red:7000,cut:850, drive:3,  mix:[1,.6,.35], turbo:.6,rough:.08,pop:1,vol:.85,gears:[.15,.28,.42,.6,.8,1]},
 v6:      {fpr:3,idle:900, red:7600,cut:950, drive:3,  mix:[1,.6,.4],  turbo:.3,rough:.07,pop:1,vol:.9, gears:[.14,.26,.39,.54,.72,1]},
 i6:      {fpr:3,idle:850, red:7800,cut:900, drive:3,  mix:[1,.55,.4], turbo:0, rough:.05,pop:1,vol:.9, gears:[.15,.27,.4,.55,.74,1]},
 v8:      {fpr:4,idle:700, red:6500,cut:720, drive:3.4,mix:[1,.85,.2], turbo:0, rough:.32,pop:1,vol:1,  gears:[.16,.3,.45,.62,.82,1]},
 v8big:   {fpr:4,idle:620, red:5400,cut:560, drive:3,  mix:[1,.9,.15], turbo:0, rough:.38,pop:0,vol:1,  gears:[.14,.26,.4,.58,.78,1]},
 v8smooth:{fpr:4,idle:650, red:6200,cut:640, drive:1.8,mix:[1,.5,.15], turbo:0, rough:.12,pop:0,vol:.85,gears:[.13,.25,.38,.52,.7,1]},
 v8flat:  {fpr:4,idle:1000,red:8800,cut:1500,drive:3.8,mix:[1,.45,.55],turbo:0, rough:.05,pop:1,vol:1,  gears:[.17,.3,.44,.6,.8,1]},
 w16:     {fpr:6,idle:800, red:7200,cut:1300,drive:3,  mix:[1,.6,.45], turbo:1, rough:.06,pop:1,vol:1,  gears:[.15,.27,.4,.55,.74,1]},
 rally:   {fpr:2,idle:1000,red:7400,cut:900, drive:3,  mix:[1,.6,.4],  turbo:1, rough:.08,pop:1,vol:.9, gears:[.17,.3,.45,.62,.82,1]},
 twin:    {fpr:2,idle:1100,red:6500,cut:900, drive:3.6,mix:[1,.3,.65],turbo:0, rough:.3, pop:0,vol:.8, gears:[.24,.45,.7,1]},
 velo:    {electric:true,idle:0,red:1,vol:.12,gears:[1]},
 ev:      {electric:true,idle:0,red:1,vol:.8,gears:[1]}};
const engType=m=>ENG_OF[m&&m.id]||'i4';
/* régime moteur : rapports simulés, passages de vitesse avec petite chute de régime */
function engRpm(E,st,v,vTop,thr,dt){
  const g=E.gears, n=g.length, rpmAt=k=>v/(vTop*g[k-1]+1e-6)*E.red; let k=st.gear||1, guard=0;
  while(k<n&&rpmAt(k)>E.red*.94&&guard++<8){k++; st.shift=.2; st.shifted=true;}
  while(k>1&&rpmAt(k)<E.red*.42&&guard++<16){k--; st.shift=.14;}
  st.gear=k; let rpm=Math.max(E.idle,rpmAt(k));
  if(v<1.5) rpm=E.idle+thr*(E.red*.55-E.idle);
  if(st.shift>0){st.shift-=dt; rpm*=.82;}
  return Math.min(E.red*1.02,rpm);
}
function mkEng(type,bus){
  bus=bus||AU.b.eng;
  const E=ENGS[type]||ENGS.i4, c=AU.ctx, out=c.createGain(); out.gain.value=.0001;
  let pan=null; if(c.createStereoPanner){pan=c.createStereoPanner(); out.connect(pan); pan.connect(bus);} else out.connect(bus);
  const o={bus,E,out,pan,st:{gear:1,shift:0,thrPrev:0},nodes:[],type};
  const add=n=>{o.nodes.push(n); return n;};
  if(E.electric){
    o.a=add(c.createOscillator()); o.a.type='sine'; o.b=add(c.createOscillator()); o.b.type='triangle'; o.c=add(c.createOscillator()); o.c.type='sine';
    o.ga=c.createGain(); o.gb=c.createGain(); o.gc=c.createGain(); o.ga.gain.value=.5; o.gb.gain.value=.2; o.gc.gain.value=.12;
    o.lp=c.createBiquadFilter(); o.lp.type='lowpass'; o.lp.frequency.value=4200;
    o.a.connect(o.ga); o.b.connect(o.gb); o.c.connect(o.gc); o.ga.connect(o.lp); o.gb.connect(o.lp); o.gc.connect(o.lp); o.lp.connect(out);
    o.a.start(); o.b.start(); o.c.start();
  } else {
    o.a=add(c.createOscillator()); o.a.type='sawtooth'; o.b=add(c.createOscillator()); o.b.type='square'; o.c=add(c.createOscillator()); o.c.type='sawtooth';
    o.ga=c.createGain(); o.gb=c.createGain(); o.gc=c.createGain(); o.ga.gain.value=E.mix[0]*.5; o.gb.gain.value=E.mix[1]*.4; o.gc.gain.value=E.mix[2]*.3;
    const sum=c.createGain(), ws=c.createWaveShaper(); sum.gain.value=.5; ws.curve=mkCurve('tanh',E.drive); o.lp=c.createBiquadFilter(); o.lp.type='lowpass'; o.lp.Q.value=1.2; o.lp.frequency.value=E.cut;
    o.vca=c.createGain(); o.vca.gain.value=.4;
    o.lfo=add(c.createOscillator()); o.lfo.type='sine'; o.lfg=c.createGain(); o.lfg.gain.value=E.rough*.4; o.lfo.connect(o.lfg); o.lfg.connect(o.vca.gain);
    o.a.connect(o.ga); o.b.connect(o.gb); o.c.connect(o.gc); o.ga.connect(sum); o.gb.connect(sum); o.gc.connect(sum); sum.connect(ws); ws.connect(o.lp); o.lp.connect(o.vca); o.vca.connect(out);
    o.ns=add(nsrc(AU.pink,true)); o.nbp=c.createBiquadFilter(); o.nbp.type='bandpass'; o.nbp.Q.value=.8; o.nbp.frequency.value=900; o.ng=c.createGain(); o.ng.gain.value=0; o.ns.connect(o.nbp); o.nbp.connect(o.ng); o.ng.connect(out);
    if(E.turbo){o.tur=add(c.createOscillator()); o.tur.type='sine'; o.tg=c.createGain(); o.tg.gain.value=0; o.tur.connect(o.tg); o.tg.connect(out); o.tur.start();}
    o.a.start(); o.b.start(); o.c.start(); o.lfo.start(); o.ns.start();
  }
  return o;
}
function engUpdate(o,p,dt){
  const E=o.E, c=AU.ctx, t=c.currentTime, tc=.045, thr=p.thr;
  if(E.electric){
    const fe=140+p.v*13*(p.nit?1.06:1), fr=clamp(p.v/Math.max(10,p.vTop),0,1);
    o.a.frequency.setTargetAtTime(fe,t,tc); o.b.frequency.setTargetAtTime(fe*2.01,t,tc); o.c.frequency.setTargetAtTime(fe*3.02,t,tc);
    o.lp.frequency.setTargetAtTime(1500+fr*5000,t,tc); o.out.gain.setTargetAtTime(Math.max(.0001,p.vol*E.vol*(.12+.5*Math.max(thr,fr*.5))),t,.06);
    if(o.pan) o.pan.pan.setTargetAtTime(p.pan,t,.08); return;
  }
  const rpm=engRpm(E,o.st,p.v,p.vTop*(p.nit?1.04:1),thr,dt)*(p.nit?1.05:1), f=rpm/60*E.fpr, rf=clamp((rpm-E.idle)/(E.red-E.idle),0,1);
  o.a.frequency.setTargetAtTime(f,t,tc); o.b.frequency.setTargetAtTime(f*.5,t,tc); o.c.frequency.setTargetAtTime(f*2,t,tc); o.lfo.frequency.setTargetAtTime(Math.min(90,rpm/60),t,tc);
  o.lp.frequency.setTargetAtTime(E.cut*(1+(p.nit?.4:0))+rf*2800*(.25+.75*thr),t,tc);
  o.vca.gain.setTargetAtTime(.3+.55*thr+.15*rf,t,.05);
  o.ng.gain.setTargetAtTime(.01+.12*thr*rf,t,.06); o.nbp.frequency.setTargetAtTime(700+rf*1600,t,.06);
  const boost=E.turbo?clamp(thr*(rf*1.2),0,1):0;
  if(o.tg){o.tg.gain.setTargetAtTime(boost*.05*E.turbo,t,.08); o.tur.frequency.setTargetAtTime(1800+boost*3800,t,.08);}
  /* levée de pied : soupape de turbo / pétarade */
  if(o.st.thrPrev>.7&&thr<.25){
    if(E.turbo&&o.st.boostPrev>.35){burst(t,.3,2600,1.2,'highpass',.16*p.vol,o.bus); LOG('blowoff',t);}
    if(E.pop&&rf>.45) for(let k=0;k<3;k++) burst(t+.05+k*(.05+Math.random()*.05),.06,500,1,'lowpass',.18*p.vol,o.bus);
  }
  if(o.st.shifted){o.st.shifted=false; if(E.pop&&thr>.5) burst(t,.05,1800,1.5,'bandpass',.12*p.vol,o.bus);}
  o.st.thrPrev=thr; o.st.boostPrev=boost;
  o.out.gain.setTargetAtTime(Math.max(.0001,p.vol*E.vol*(o.st.shift>0?.6:1)*(p.nit?1.25:1)),t,.05);
  if(o.pan) o.pan.pan.setTargetAtTime(p.pan,t,.08);
  o.rpm=rpm;
}
function engStop(o){ if(!o) return; auTry(()=>{[o.a,o.b,o.c,o.lfo,o.ns,o.tur].forEach(n=>{if(n) auTry(()=>n.stop());}); o.out.disconnect();}); }

/* ambiance de piste : pneus, vent, dérapage, vibreurs, pluie, sirène */
function mkLoops(opts){
  const c=AU.ctx, bus=c.createGain(); bus.gain.value=1; bus.connect(AU.b.amb); const L={bus,nodes:[]};
  const loop=(buf,type,f,q)=>{const s=nsrc(buf,true), fl=c.createBiquadFilter(), g=c.createGain(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; g.gain.value=0; s.connect(fl); fl.connect(g); g.connect(bus); s.start(); L.nodes.push(s); return {s,fl,g};};
  L.tire=loop(AU.noise,'bandpass',900,.7); L.wind=loop(AU.pink,'lowpass',900,.5); L.skid=loop(AU.noise,'bandpass',1800,5); L.rain=loop(AU.pink,'highpass',2500,.4);
  L.rum=(()=>{const o=c.createOscillator(), lp=c.createBiquadFilter(), g=c.createGain(); o.type='square'; o.frequency.value=20; lp.type='lowpass'; lp.frequency.value=170; g.gain.value=0; o.connect(lp); lp.connect(g); g.connect(bus); o.start(); L.nodes.push(o); return {o,g};})();
  if(opts&&opts.rain) L.rain.g.gain.setTargetAtTime(.07,c.currentTime,.5);
  if(opts&&opts.siren){const o=c.createOscillator(), bp=c.createBiquadFilter(), g=c.createGain(); o.type='square'; o.frequency.value=800; bp.type='bandpass'; bp.frequency.value=1150; bp.Q.value=1.1; g.gain.value=.1; o.connect(bp); bp.connect(g); g.connect(AU.b.siren); o.start(); L.nodes.push(o); L.siren={o,next:c.currentTime,flip:0};}
  return L;
}
const SURF_SND={0:[1700,.4,.25,'bandpass'],1:[600,.5,.14,'bandpass'],2:[520,.5,.15,'bandpass'],3:[800,.5,.16,'bandpass'],4:[420,.6,.22,'lowpass'],5:[1700,.4,.25,'bandpass'],6:[900,.7,.12,'bandpass'],7:[900,.7,.12,'bandpass'],8:[1000,.7,.13,'bandpass']};
function loopsUpdate(L,p){
  const c=AU.ctx, t=c.currentTime, sp=SURF_SND[p.surf]||SURF_SND[7], vr=clamp(p.v/60,0,1.6);
  L.tire.fl.type=sp[3]; L.tire.fl.frequency.setTargetAtTime(sp[0]+p.v*6,t,.1); L.tire.fl.Q.setTargetAtTime(sp[1],t,.1);
  L.tire.g.gain.setTargetAtTime(p.v<.5?.0001:sp[2]*Math.pow(vr,1.15)*.9,t,.08);
  L.wind.fl.frequency.setTargetAtTime(700+p.v*9,t,.1); L.wind.g.gain.setTargetAtTime(clamp(.035*Math.pow(p.v/90,2),0,.14),t,.1);
  const slide=clamp((p.slip-.12)/.4,0,1), brk=(p.brake&&p.v>18&&p.surf>=6)?clamp((p.v-18)/45,0,1)*.28:0, loose=p.surf<6?0:1;
  L.skid.fl.frequency.setTargetAtTime(1300+p.v*12,t,.1); L.skid.g.gain.setTargetAtTime(loose?Math.max(slide*.3,brk*.35):.0001,t,.05);
  L.rum.o.frequency.setTargetAtTime(clamp(p.v/2.2,5,70),t,.05); L.rum.g.gain.setTargetAtTime(p.surf===8&&p.v>4?Math.min(.3,.05+p.v/260):.0001,t,.06);
  if(L.siren){const sr=L.siren; if(sr.next<t-.5) sr.next=t; while(sr.next<t+1.2){sr.o.frequency.setValueAtTime(sr.flip?640:860,sr.next); sr.next+=.46; sr.flip^=1;}}
}
/* API de course */
function auRaceStart(o){
  if(!AU.ok) return; auRaceStop(true);
  AU.race={eng:mkEng(engType(o.pm),AU.b.eng),ov:[{id:null,type:null,eng:null},{id:null,type:null,eng:null}],loops:mkLoops({rain:o.rain,siren:o.siren}),acc:0,fin:false,fade:1,ln:-1,green:false,drag:!!o.drag};
  AU.raceLevel=0; AU.dsm=0; AU.dkey=1; AU.speedFrac=0; AU.seq.cur=0; AU.seq.heldBars=0; AU.seq.level=0; auCutMenu(); auMood(o.drag?'silent':'tense');
}
function auRaceStop(quiet){
  const R_=AU.race; if(R_){engStop(R_.eng); R_.ov.forEach(v=>engStop(v.eng)); auTry(()=>{R_.loops.nodes.forEach(n=>auTry(()=>n.stop())); R_.loops.bus.disconnect();}); AU.race=null;}
  if(!quiet&&AU.ok&&AU.seq.mood!=='menu'&&AU.view!=='race'){auMood('menu');}
}
function auRaceUpdate(dt,S_){
  const R_=AU.race; if(!R_||!AU.ok) return;
  if(S_.fin&&!R_.fin) R_.fin=true;
  if(R_.fin) R_.fade=Math.max(0,R_.fade-dt/2.2);
  if(!S_.go) auMood(R_.drag?'silent':'tense'); else auMood(R_.fin?'stinger':(R_.drag?'drag':'race'));
  if(S_.go&&!R_.fin) auSetSpeed(S_.v/Math.max(10,S_.vTop));
  R_.acc+=dt; if(R_.acc<.033) return; const d=R_.acc; R_.acc=0; const f=R_.fade, now=AU.ctx.currentTime;
  engUpdate(R_.eng,{v:S_.v,vTop:S_.vTop,thr:clamp(S_.thr,0,1),vol:.75*f,pan:0,nit:S_.nit},d);
  R_.ov.forEach((sl,k)=>{
    const op=S_.opps[k];
    if(!op){ if(sl.eng) sl.eng.out.gain.setTargetAtTime(.0001,now,.1); return; }
    if(sl.id!==op.id){ if(sl.type!==op.type||!sl.eng){engStop(sl.eng); sl.eng=mkEng(op.type,AU.b.opp); sl.type=op.type;} sl.id=op.id; }
    const ov=clamp(1-op.dist/110,0,1); engUpdate(sl.eng,{v:op.v,vTop:op.vTop,thr:clamp(op.thr,0,1),vol:.65*ov*ov*f,pan:op.pan,nit:false},d);
  });
  loopsUpdate(R_.loops,{v:S_.v,surf:S_.surf,slip:S_.slip,brake:S_.brake,rumble:S_.rumble});
  R_.loops.bus.gain.setTargetAtTime(Math.max(.0001,f),now,.1);
}
/* départ : bips des feux */
function auLights(n,green){
  const R_=AU.race; if(!R_||!AU.ok) return;
  if(green){ if(!R_.green){R_.green=true; ui('green'); fxFlash('go'); auTry(auLaunch);} return; }
  if(n!==R_.ln){ if(n>R_.ln&&n>0) ui('beep'); R_.ln=n; }
}
function auFinish(won){ if(!AU.ok) return; ui(won?'claim':'error'); auTry(()=>auHorn(won)); }
/* chocs : intensité en m/s d'impulsion */
function auHit(imp,c,soft){
  if(!AU.ok||!AU.race||!RC||imp<1.2) return; const mine=(c===RC.P), t=AU.ctx.currentTime+.002, key=mine?'lhP':'lhO';
  if(t-(AU[key]||-9)<(imp>8?.05:.11)) return; AU[key]=t;
  const vol=clamp(imp/18,.08,1)*(mine?1:.45)*(soft?.6:1); if(!mine&&clamp(1-Math.hypot((c.x||0)-RC.P.x,(c.z||0)-RC.P.z)/90,0,1)<.05) return;
  LOG('hit',t,imp); const d=AU.b.hit;
  burst(t,.35,260,1,'lowpass',.5*vol,d); osc('sine',70,t,.08,d,.5*vol,.001,.25);
  if(!soft){ [420,630,910,1330].forEach((f,i)=>osc('square',f*(1+Math.random()*.03),t,.02,d,.07*vol,.001,.2+.06*i)); burst(t,.12,3200,2,'bandpass',.25*vol,d); }
}
function auSfxNitro(t0){
  const d=AU.b.amb, c=AU.ctx; LOG('nitrosfx',t0);
  const s=nsrc(AU.noise,true), bp=c.createBiquadFilter(), g=c.createGain(); bp.type='bandpass'; bp.Q.value=1.4; bp.frequency.setValueAtTime(500,t0); bp.frequency.exponentialRampToValueAtTime(4500,t0+.5);
  g.gain.setValueAtTime(.0002,t0); g.gain.exponentialRampToValueAtTime(.35,t0+.12); g.gain.exponentialRampToValueAtTime(.0002,t0+1.1); s.connect(bp); bp.connect(g); g.connect(d); s.start(t0); s.stop(t0+1.2);
  osc('sine',60,t0+.03,.3,d,.35,.005,.5);
}
/* appels depuis le jeu */
function auSpaFrame(dt){
  if(!AU.ok||!AU.race||!RC||RC.kind!=='spa') return;
  const P=RC.P, rx=-Math.sin(P.psi), rz=Math.cos(P.psi), on=P.go||RC.clock>=0;
  const opps=RC.Os.map((o,k)=>({o,k,dist:Math.hypot(o.x-P.x,o.z-P.z)})).sort((a,b)=>a.dist-b.dist).slice(0,2).map(q=>({id:q.k,type:engType(q.o.r.m),v:q.o.v,vTop:q.o.r.VM,thr:q.o.thrNow==null?1:q.o.thrNow,dist:q.dist,pan:clamp(((q.o.x-P.x)*rx+(q.o.z-P.z)*rz)/30,-.9,.9)}));
  auRaceUpdate(dt,{go:on,v:P.v,vTop:P.r.VM,thr:on?(P.thrNow||0):inThr(),brake:!!P.braking,slip:Math.abs(P.slipAng||0),surf:P.surf,nit:P.nitroT>0,rumble:P.rumble,fin:P.fin!=null,opps});
}
function auOldFrame(dt){
  if(!AU.ok||!AU.race||!RC||RC.kind!=='race') return;
  const P=RC.P, started=RC.clock>=0;
  const opps=RC.Os.map((o,k)=>({o,k,dist:Math.abs(o.x-P.x)})).sort((a,b)=>a.dist-b.dist).slice(0,2).map(q=>({id:q.k,type:engType(q.o.m),v:q.o.v,vTop:q.o.VM,thr:q.o.braking?0:1,dist:q.dist,pan:clamp((q.o.lane-P.lane)/5,-.8,.8)}));
  auRaceUpdate(dt,{go:started,v:P.v,vTop:P.VM,thr:started?(RC.auto?(P.braking?0:1):(RC.inp.b||RC.inp.kb?0:inThr())):inThr(),brake:!!P.braking,slip:P.slide?.5:0,surf:7,nit:P.nitroT>0,rumble:0,fin:P.fin!=null,opps});
}
/* menus : humeur musicale et ronronnement des podiums */
function auView(v,force){
  if(!AU.ok) return; if(AU.view===v&&!force) return; AU.view=v;
  auHum(v==='garage');
  if(v==='race') return;
  const m={garage:'garage',epreuves:'prep',prep:'prep',marche:'market',base:'base',missions:'missions',result:'menu'}[v]||'menu';
  auRaceStop(true); auMood(m);
  if(v==='result'&&R&&R.result&&AU.lastResult!==R.result){AU.lastResult=R.result; auStinger(R.result.win);}
}
function auHum(on){
  const c=AU.ctx; if(!AU.ok) return;
  if(!on){ if(AU.hum){const h=AU.hum; AU.hum=null; auTry(()=>{h.g.gain.setTargetAtTime(.0001,c.currentTime,.3); setTimeout(()=>{h.nodes.forEach(n=>auTry(()=>n.stop())); auTry(()=>h.g.disconnect());},1500);});} return; }
  if(AU.hum) return;
  const g=c.createGain(); g.gain.value=.0001; g.connect(AU.b.amb); const nodes=[];
  [60,120.7,181.2].forEach((f,i)=>{const o=c.createOscillator(); o.type=i?'triangle':'sine'; o.frequency.value=f; const og=c.createGain(); og.gain.value=[.5,.25,.12][i]; o.connect(og); og.connect(g); o.start(); nodes.push(o);});
  const lfo=c.createOscillator(), lg=c.createGain(); lfo.frequency.value=.35; lg.gain.value=.012; lfo.connect(lg); lg.connect(g.gain); lfo.start(); nodes.push(lfo);
  g.gain.setTargetAtTime(.025+.01*(S&&S.pod?S.pod.tier:1),c.currentTime,.6); AU.hum={g,nodes};
}
function auInstall(){
  const un=()=>auUnlock(); ['pointerup','click','keydown','touchend'].forEach(ev=>document.addEventListener(ev,un,true));
}
/* ---------- actions ---------- */
/* ======================================================================
   MODULES (cartes de pièces), RARETÉS, TIRAGES, APPARENCE
   ====================================================================== */
const RAR=[{n:'Commun',c:'#9aa3ad',p:60,pow:2,sc:1},{n:'Peu commun',c:'#3ccf7a',p:25,pow:4,sc:3},{n:'Rare',c:'#3d8bff',p:10,pow:7,sc:8},{n:'Épique',c:'#b05cff',p:3.8,pow:11,sc:25},
  {n:'Légendaire',c:'#ffb020',p:1,pow:16,sc:80},{n:'Mythique',c:'#ff3d6e',p:.18,pow:22,sc:250},{n:'Ultra rare',c:'#00e5ff',p:.02,pow:30,sc:1000}];
const PITY=[0,0,14,50,200,700,2500], SOFT=.6;   /* garantie : rareté i ou mieux au plus tard au PITY[i]-ième tirage ; la chance monte doucement à partir de 60 % du délai */
const SHINY_P=.08, UNIQ_P=.02, INV_MAX=300;
const SLOTS=[['moteur','Moteur','⚙️'],['turbo','Turbo','🌀'],['echap','Échappement','💨'],['pneus','Pneus','⭕'],['freins','Freins','🛑'],['susp','Suspension','🔩'],['chassis','Châssis','🪶'],['aero','Aéro','🪽'],['nitro','Nitro','⚡'],['jantes','Jantes','🛞'],['peinture','Peinture','🎨']];
/* modèles de modules : [id, emplacement, nom, effets {stat: poids}] */
const MODT=[
 ['mo1','moteur','Bloc forgé',{ch:1,nm:.5}],['mo2','moteur','Arbre à cames',{ch:.7,vmax:.5}],['mo3','moteur','Culasse renforcée',{nm:.9,fia:.8}],
 ['tu1','turbo','Turbo simple',{ch:.8,fia:-.3}],['tu2','turbo','Bi-turbo',{ch:1.1,nm:.6,fia:-.6}],['tu3','turbo','Compresseur',{nm:1.1,ch:.4}],
 ['ec1','echap','Ligne inox',{ch:.4,kg:.5}],['ec2','echap','Échappement libre',{ch:.6,sty:.6}],['ec3','echap','Collecteur 4-en-1',{nm:.7,vmax:.4}],
 ['pn1','pneus','Slicks',{adh:1.2,wet:-.5}],['pn2','pneus','Pneus pluie',{wet:1.2,adh:.3}],['pn3','pneus','Pneus terre',{off:1.2,man:.4}],
 ['fr1','freins','Disques ventilés',{fre:1.1}],['fr2','freins','Étriers 6 pistons',{fre:.9,man:.4}],['fr3','freins','Carbone-céramique',{fre:1,kg:.5}],
 ['su1','susp','Combinés filetés',{man:1.1}],['su2','susp','Barres anti-roulis',{man:.7,adh:.5}],['su3','susp','Suspension rallye',{off:.9,fia:.7}],
 ['ch1','chassis','Arceau',{dmg:1.2,kg:-.3}],['ch2','chassis','Coque allégée',{kg:1.2}],['ch3','chassis','Renforts',{fia:1,man:.4}],
 ['ae1','aero','Lame avant',{adh:.6,vmax:.4}],['ae2','aero','Aileron',{adh:1,vmax:-.3}],['ae3','aero','Kit large',{sty:1,adh:.5}],
 ['ni1','nitro','Bouteille XL',{nitD:1.2}],['ni2','nitro','Injection directe',{nitP:1}],['ni3','nitro','Double étage',{nitD:.7,nitP:.6}],
 ['ja1','jantes','Jantes forgées',{kg:.6,man:.5}],['ja2','jantes','Jantes larges',{adh:.7,sty:.5}],['ja3','jantes','Jantes show',{sty:1.2,inc:.6}],
 ['pe1','peinture','Peinture nacrée',{sty:1.1}],['pe2','peinture','Covering mat',{sty:.8,inc:.8}],['pe3','peinture','Livrée course',{sty:.6,xp:1}]];
const MODI=Object.fromEntries(MODT.map(t=>[t[0],t]));
const UNIQ=[
 {n:'Le Hurleur',t:'ec2',fx:{sty:.8,ch:.4},d:'Un échappement de légende'},{n:'Cœur de Spa',t:'mo1',fx:{vmax:.6,fia:.6},d:'Préparé pour les longues lignes droites'},
 {n:'Griffes de pluie',t:'pn2',fx:{wet:.8,fre:.5},d:'Colle à la piste sous la pluie'},{n:'Souffle du dragon',t:'ni3',fx:{nitD:.6,nitP:.5},d:'Nitro plus longue et plus forte'},
 {n:'Peau de titane',t:'ch1',fx:{dmg:1.2,kg:.4},d:'Presque indestructible'},{n:'Aile fantôme',t:'ae2',fx:{adh:.6,vmax:.5},d:'De l’appui sans traînée'},
 {n:'Roues du roi',t:'ja3',fx:{inc:1.2,sty:.6},d:'Le showroom s’arrache cette voiture'},{n:'Livrée du champion',t:'pe3',fx:{xp:1,sty:.6},d:'Tout le monde te regarde'}];
const PACKS=[{id:'p1',nom:'Paquet Garage',n:3,cr:500,tok:1,boost:1,min:0,d:'3 modules'},{id:'p2',nom:'Paquet Atelier',n:4,cr:1800,tok:3,boost:1,min:1,d:'4 modules, dont un Peu commun ou mieux'},
 {id:'p3',nom:'Paquet Compétition',n:5,cr:6000,tok:8,boost:1.5,min:2,d:'5 modules, dont un Rare ou mieux. Chances d’Épique ×1,5'},{id:'p4',nom:'Paquet Légende',n:5,cr:25000,tok:30,boost:3,min:3,d:'5 modules, dont un Épique ou mieux. Chances d’Épique ×3'}];
const MULT={ch:1,nm:1,vmax:.35}, PTS={adh:1,fre:1,man:1,fia:1,sty:1};
const STATN={ch:'de puissance',nm:'de couple',vmax:'de vitesse max',adh:'d’adhérence',fre:'de freinage',man:'de maniabilité',fia:'de fiabilité',sty:'de style',wet:'d’adhérence sous la pluie',off:'d’adhérence hors asphalte',nitD:'de durée de nitro',nitP:'de poussée de nitro',dmg:'de résistance aux chocs',inc:'de revenus au showroom',xp:'d’expérience'};
const modOf=u=>u?S.mods.find(x=>x.u===u):null;
const modPow=m=>RAR[m.r].pow*m.q*(m.sh?1.25:1);
const modName=m=>m.un!=null?UNIQ[m.un].n:MODI[m.t][2];
const eqCar=u=>S.cars.find(c=>c.mods&&Object.keys(c.mods).some(k=>c.mods[k]===u));
function modFx(m){
  const p=modPow(m), T=MODI[m.t], out={}, add=(k,w)=>{out[k]=(out[k]||0)+w*p;};
  for(const k in T[3]) add(k,T[3][k]); if(m.s) add(m.s[0],m.s[1]); if(m.un!=null) for(const k in UNIQ[m.un].fx) add(k,UNIQ[m.un].fx[k]);
  return out;
}
function fxText(k,v){
  const sg=x=>(x>=0?'+':'−')+Math.abs(x).toFixed(1).replace('.',',').replace(',0','');
  if(MULT[k]) return `${sg(v*MULT[k])} % ${STATN[k]}`;
  if(k==='kg') return `${sg(-v*.4)} % de poids`;
  if(PTS[k]) return `${sg(v*.5)} ${STATN[k]}`;
  return `${sg(v)} % ${STATN[k]}`;
}
function applyMods(s,c){
  s.sp={}; if(!c||!c.mods) return;
  for(const sl in c.mods){ const m=modOf(c.mods[sl]); if(!m) continue; const fx=modFx(m);
    for(const k in fx){ const v=fx[k];
      if(MULT[k]) s[k]*=1+v/100*MULT[k]; else if(k==='kg') s.kg*=Math.max(.6,1-v/100*.4); else if(PTS[k]) s[k]+=v*.5; else s.sp[k]=(s.sp[k]||0)+v/100; } }
  if(c.sh){s.ch*=1.06; s.nm*=1.06; s.sty+=8;}
}
/* tirage d'une rareté : taux de base, garanties, bonus du paquet */
function rollRar(boost,minR){
  const w=RAR.map((x,i)=>x.p*(i>=3?boost:1)), tot=w.reduce((a,b)=>a+b,0); let x=Math.random()*tot, r=0;
  for(let i=0;i<7;i++){x-=w[i]; if(x<0){r=i; break;}}
  for(let i=6;i>=2;i--){ const P=PITY[i], n=S.pity[i]+1, a=SOFT*P; if(n>=P||(n>a&&Math.random()<(n-a)/(P-a))){r=Math.max(r,i); break;} }
  r=Math.max(r,minR||0);
  for(let i=2;i<7;i++) S.pity[i]=r>=i?0:S.pity[i]+1;
  return r;
}
function newMod(r,slot,plain){
  const pool=MODT.filter(t=>!slot||t[1]===slot), T=pool[rint(0,pool.length-1)], m={u:S.muid++,t:T[0],r,q:Math.round(rnd(.85,1.15)*100)/100};
  if(r>=2){const ks=['ch','nm','adh','fre','man','fia','sty','kg']; m.s=[ks[rint(0,ks.length-1)],Math.round(rnd(.25,.55)*100)/100];}
  if(!plain&&r>=2&&Math.random()<SHINY_P*(1+.1*pk('luck'))) m.sh=1;
  if(!plain&&r>=3&&Math.random()<UNIQ_P){const ui=rint(0,UNIQ.length-1); m.un=ui; m.t=UNIQ[ui].t; m.sn=rint(1,999);}
  S.alb[m.t]=(S.alb[m.t]||0)|(1<<r); S.stats.best=Math.max(S.stats.best||0,r); if(m.sh) S.stats.shiny=(S.stats.shiny||0)+1;
  return m;
}
function openPack(id,cur){
  const pk=PACKS.find(p=>p.id===id); if(!pk) return;
  if(S.mods.length+pk.n>invMax()) return toast('Inventaire plein : recycle ou fusionne des modules');
  if(cur==='tok'){ if(S.tok<pk.tok) return toast('Pas assez de jetons'); S.tok-=pk.tok; } else { if(S.cr<pk.cr) return toast('Pas assez de crédits'); S.cr-=pk.cr; }
  const got=[]; for(let k=0;k<pk.n;k++){const m=newMod(rollRar(pk.boost,k===pk.n-1?pk.min:0)); S.mods.push(m); got.push(m.u);}
  S.stats.packs=(S.stats.packs||0)+1; save(); render(); openSheet({t:'open',cards:got,i:0,pk:id});
}
function modHTML(m,act){
  const sl=SLOTS.find(s=>s[0]===MODI[m.t][1]), fx=modFx(m), on=eqCar(m.u);
  return `<div class="mod ${m.sh?'shiny':''} ${m.un!=null?'uniq':''}" style="--rc:${RAR[m.r].c}">
    <div class="mod-top"><span>${sl[2]} ${sl[1]}</span><span class="rar">${RAR[m.r].n}${m.sh?' ✨':''}</span></div>
    <div class="mod-name">${modName(m)}${m.un!=null?` <small>Unique n° ${String(m.sn).padStart(3,'0')}</small>`:''}</div>
    <div class="mod-fx">${Object.keys(fx).map(k=>`<span class="${fx[k]<0?'neg':''}">${fxText(k,fx[k])}</span>`).join('')}</div>
    ${m.un!=null?`<div class="mod-eq">${UNIQ[m.un].d}</div>`:''}${on?`<div class="mod-eq">Monté sur ${M[on.mid].nom}</div>`:''}${act||''}</div>`;
}
/* apparence : ce que les modules montés changent sur la voiture */
function carLook(c){
  if(!c) return {}; if(c.lk) return c.lk; const L={}; if(c.sh) L.shiny=1; if(!c.mods) return L;
  for(const sl of ['aero','jantes','peinture','echap','nitro','turbo']){const m=modOf(c.mods[sl]); if(m) L[sl]={r:m.r,t:m.t};}
  return L;
}
const lookKey=c=>{const L=carLook(c); return Object.keys(L).map(k=>k+(L[k].t||'')+(L[k].r==null?'':L[k].r)).join('.');};
function rndLook(lv){
  const L={}, r=()=>clamp(rint(0,Math.floor(lv/2)),0,5);
  if(lv>=2&&Math.random()<.6) L.jantes={r:r(),t:'ja1'}; if(lv>=3&&Math.random()<.5) L.aero={r:r(),t:['ae1','ae2','ae3'][rint(0,2)]}; if(lv>=4&&Math.random()<.4) L.peinture={r:r(),t:'pe1'}; if(lv>=5&&Math.random()<.5) L.echap={r:r(),t:'ec2'};
  return L;
}
const dayKey=()=>{const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const dailyReward=()=>({cr:Math.round((300+150*S.lvl)*(1+.08*pk('dly'))),xp:40+15*S.lvl,tok:1+((S.streak||0)%7===6?2:0)});
let cTab='packs', cSlot='';
function vCartes(){
  const tabs=`<div class="subtabs">${[['packs','Paquets'],['inv',`Mes modules (${S.mods.length})`],['album','Album']].map(([id,n])=>`<button data-a="cartab" data-id="${id}" ${cTab===id?'aria-current="true"':''}>${n}</button>`).join('')}</div>`;
  let body='';
  if(cTab==='packs'){
    body=packsHTML();
  } else if(cTab==='inv'){
    const free=S.mods.filter(m=>!eqCar(m.u)), list=S.mods.filter(m=>!cSlot||MODI[m.t][1]===cSlot).sort((a,b)=>b.r-a.r||modPow(b)-modPow(a));
    const fus=RAR.map((_,r)=>r<6&&free.filter(m=>m.r===r&&!m.sh&&m.un==null).length>=5?`<button class="btn alt sm" data-a="fuse" data-id="${r}" style="box-shadow:inset 0 0 0 1.5px ${RAR[r+1].c};color:${RAR[r+1].c}">5 ${RAR[r].n} → 1 ${RAR[r+1].n}</button>`:'').join('');
    body=`<div class="row"><span class="ico">♻️</span><span class="grow"><span class="ttl">Ferraille : ${fmt(S.scrap)}</span><br><span class="sub">Recycle un module pour en obtenir. Elle sert à fabriquer un module de l’emplacement de ton choix.</span></span><button class="btn alt sm" data-a="craftopen">Fabriquer</button></div>
      ${fus?`<h3 style="margin:14px 0 8px">Fusion</h3><div class="chips" style="gap:8px">${fus}</div>`:'<p class="note">Fusion : 5 modules non montés de même rareté donnent 1 module de la rareté supérieure.</p>'}
      <div class="chips" style="margin:14px 0 10px"><button class="chip ${cSlot?'':'on'}" data-a="cslot" data-id="">Tous</button>${SLOTS.map(s=>`<button class="chip ${cSlot===s[0]?'on':''}" data-a="cslot" data-id="${s[0]}">${s[2]} ${s[1]}</button>`).join('')}</div>
      ${list.length?`<div class="mods">${list.slice(0,60).map(m=>modHTML(m,eqCar(m.u)?'':`<button class="btn sm" data-a="eqmodopen" data-id="${m.u}">Monter sur…</button><button class="btn alt sm" data-a="recycle" data-id="${m.u}">Recycler, +${Math.round(RAR[m.r].sc*(m.sh?3:1)*scrapK())} ♻️</button>`)).join('')}</div>${list.length>60?`<p class="note">${list.length-60} autres modules non affichés. Filtre par emplacement pour les voir.</p>`:''}`:'<p class="note">Aucun module ici. Ouvre un paquet pour commencer ta collection.</p>'}
      ${free.some(m=>m.r===0&&!m.sh)?`<button class="btn danger sm" style="margin-top:10px" data-a="recycleall">Recycler tous les Communs non montés</button>`:''}`;
  } else {
    const bits=MODT.reduce((t,T)=>{let b=S.alb[T[0]]||0,c=0; while(b){c+=b&1; b>>=1;} return t+c;},0);
    body=`<p class="note">Collection : ${bits} sur ${MODT.length*7} (${(bits/(MODT.length*7)*100).toFixed(1).replace('.',',')} %). Brillants obtenus : ${S.stats.shiny||0}. Uniques possédés : ${S.mods.filter(m=>m.un!=null).length} sur ${UNIQ.length}.</p>`+
      SLOTS.map(s=>`<h3 style="margin:14px 0 6px">${s[2]} ${s[1]}</h3>`+MODT.filter(T=>T[1]===s[0]).map(T=>`<div class="alb"><span>${T[2]}</span><span class="pips">${RAR.map((r,i)=>`<i style="background:${(S.alb[T[0]]||0)&(1<<i)?r.c:'transparent'};border-color:${r.c}" title="${r.n}"></i>`).join('')}</span></div>`).join('')).join('');
  }
  return `<div class="head"><h2>Cartes</h2><p>🎟 ${S.tok} jetons</p></div>${tabs}${body}`;
}
/* fiches supplémentaires : choix d'un module, ouverture de paquet, taux, fabrication, audio */
function sheetExtra(X){
  const el=$('sheet');
  if(eqSheets(X)) return true;
  if(sheet.t==='modpick'){
    const c=car(sheet.uid), sl=SLOTS.find(s=>s[0]===sheet.slot), cur=c.mods&&c.mods[sheet.slot];
    const list=S.mods.filter(m=>MODI[m.t][1]===sheet.slot&&m.u!==cur).sort((a,b)=>b.r-a.r||modPow(b)-modPow(a));
    el.innerHTML=`${X}<h2>${sl[2]} ${sl[1]}</h2><p class="note">${M[c.mid].nom}. Un module ne peut être monté que sur une voiture à la fois.</p>
      ${cur&&modOf(cur)?modHTML(modOf(cur),`<button class="btn danger sm" data-a="modun">Retirer</button>`):''}
      ${list.length?`<div class="mods">${list.slice(0,40).map(m=>modHTML(m,eqOther(m.u,c)?`<button class="btn sm mag" data-a="modeq" data-id="${m.u}">Reprendre</button>`:`<button class="btn sm" data-a="modeq" data-id="${m.u}">Monter</button>`)).join('')}</div>`:'<p>Aucun autre module pour cet emplacement. Ouvre des paquets dans Marché › Cartes.</p>'}
      <button class="btn alt wide" style="margin-top:10px" data-a="car" data-id="${c.uid}">Retour à la voiture</button>`;
    return true;
  }
  if(sheet.t==='open'){
    const n=sheet.cards.length, done=sheet.i>=n, pk=PACKS.find(p=>p.id===sheet.pk);
    el.innerHTML=`${X}<h2>${pk.nom}</h2><div class="mods open">${sheet.cards.map((u,k)=>k<sheet.i?modHTML(modOf(u)):`<button class="cardback" data-a="reveal">?</button>`).join('')}</div>
      ${done?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><button class="btn alt" data-a="close">Fermer</button><button class="btn" data-a="pack" data-id="${pk.id}" data-k="cr" ${S.cr<pk.cr?'disabled':''}>Encore un, ${cr(pk.cr)}</button></div><button class="btn good wide" style="margin-top:8px" data-a="eqcaropen">⚡ Équiper les meilleures pièces sur une voiture</button>`
           :`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><button class="btn" data-a="reveal">Révéler</button><button class="btn alt" data-a="revealall">Tout révéler</button></div>`}`;
    return true;
  }
  if(sheet.t==='rates'){
    el.innerHTML=`${X}<h2>Taux de tirage</h2><p class="note">Taux de base par carte, avant la garantie progressive. Les paquets Compétition et Légende multiplient les chances d’Épique et au-delà.<br>En pratique, avec la garantie progressive, tu obtiens en moyenne une Légendaire toutes les 80 cartes, une Mythique toutes les 330 et une Ultra rare toutes les 1 300 environ (paquet Garage).</p>
      ${RAR.map((r,i)=>`<div class="alb"><span style="color:${r.c};font-weight:700">${r.n}</span><span>${String(r.p).replace('.',',')} %${PITY[i]?`, garantie progressive : la chance monte dès le tirage ${Math.round(PITY[i]*SOFT)} et la carte est sûre au tirage ${PITY[i]} (${S.pity[i]} tirages depuis la dernière carte de cette rareté ou mieux)`:''}</span></div>`).join('')}
      <p class="note">Brillant : ${SHINY_P*100} % des modules Rares ou mieux, bonus +25 %. Unique : ${UNIQ_P*100} % des modules Épiques ou mieux, numéroté, avec un effet en plus. La qualité de chaque module varie de 85 à 115 %, et à partir de Rare un bonus secondaire est tiré au hasard.</p>
      <button class="btn wide" data-a="close">Fermer</button>`;
    return true;
  }
  if(sheet.t==='craft'){
    const r=sheet.r||0, cost=craftCost(r);
    el.innerHTML=`${X}<h2>Fabriquer un module</h2><p class="note">Ferraille : ${fmt(S.scrap)}. Choisis la rareté puis l’emplacement. Le modèle exact reste aléatoire.</p>
      <div class="chips" style="margin-bottom:10px">${RAR.slice(0,5).map((x,i)=>`<button class="chip ${i===r?'on':''}" data-a="craftr" data-id="${i}" style="color:${x.c}">${x.n}, ${craftCost(i)} ♻️</button>`).join('')}</div>
      <div class="slots">${SLOTS.map(s=>`<button class="slot" data-a="craft" data-id="${s[0]}" ${S.scrap<cost?'disabled':''}><b>${s[2]}</b><span>${s[1]}</span></button>`).join('')}</div>`;
    return true;
  }
  if(sheet.t==='audio'){
    const A=S.audio, rows=[['master','Volume général'],['music','Musique'],['eng','Ma voiture (moteur)'],['opp','Voitures adverses'],['siren','Sirènes'],['amb','Pneus, vent, pluie, nitro'],['hit','Chocs'],['ui','Sons des menus'],['jing','Jingles et tirages']];
    el.innerHTML=`${X}<h2>Réglages audio</h2>${RC&&RC.paused?'<p class="note">Course en pause pendant le réglage.</p>':''}
      <div class="chips" style="margin-bottom:10px">${[['equi','Équilibré'],['course','Moteurs en avant'],['musique','Musique en avant'],['calme','Discret']].map(p=>`<button class="chip" data-a="preset" data-id="${p[0]}">${p[1]}</button>`).join('')}</div>
      ${rows.map(([k,n])=>`<div class="arow"><span>${n}</span><input class="rng" type="range" min="0" max="100" value="${Math.round((A[k]==null?AUDEF[k]:A[k])*100)}" data-a="vol" data-k="${k}" aria-label="${n}"><button class="btn alt sm" data-a="autest" data-id="${k}">Tester</button></div>`).join('')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><button class="btn ${A.mute?'':'alt'}" data-a="mute2">${A.mute?'Son coupé : réactiver':'Couper tout le son'}</button><button class="btn" data-a="close">Terminé</button></div>`;
    return true;
  }
  return false;
}
const AUDEF={mute:false,master:.9,music:.7,eng:.6,opp:.55,siren:.4,amb:.8,hit:.8,ui:.8,jing:.85};
const AUPRE={equi:{master:.9,music:.7,eng:.6,opp:.55,siren:.4,amb:.8,hit:.8,ui:.8,jing:.85},course:{master:.9,music:.4,eng:.95,opp:.85,siren:.5,amb:.9,hit:.9,ui:.7,jing:.8},
  musique:{master:.9,music:1,eng:.35,opp:.3,siren:.25,amb:.55,hit:.6,ui:.7,jing:.9},calme:{master:.55,music:.5,eng:.35,opp:.3,siren:.15,amb:.5,hit:.5,ui:.5,jing:.6}};
/* ---------- apparence 3D des modules, vue 3D d'une voiture ---------- */
const RCOL=RAR.map(r=>r.c);
function paintOf(look){ if(!look||!look.peinture||!window.THREE) return null; const c=new THREE.Color(RCOL[look.peinture.r]); if(look.peinture.t==='pe2') c.multiplyScalar(.42); else if(look.peinture.t==='pe3') c.lerp(new THREE.Color(0xffffff),.25); return c; }
function tintFlame(flame,look){ const n=look&&look.nitro; if(!n) return; const c=n.r>=5?0xffc23d:n.r>=3?0xc77dff:0x7df3ff; flame.children.forEach(f=>f.material.color.setHex(c)); if(n.r>=4) flame.scale.x=1.3; }
function shineTick(c3,t){ if(c3&&c3.shine&&c3.shine.length) c3.shine.forEach(m=>m.emissive.setHSL((t*.15)%1,.9,.2)); }
function addLook0(g,D,look,wheels){
  if(!look) return;
  const dark=new THREE.MeshLambertMaterial({color:0x14151b}), neon=r=>new THREE.MeshBasicMaterial({color:new THREE.Color(RCOL[r])}), L=D.x1-D.x0, mx=(D.x0+D.x1)/2;
  const box=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); g.add(m); return m;};
  const a=look.aero;
  if(a){
    if(a.t==='ae2'){ const hg=.16+.035*a.r, ch=.3+.03*a.r, wd=D.W*(.78+.03*Math.min(a.r,4)), x=D.x0+.05*L+ch/2, y=D.deck+hg;
      box(ch,.035,wd,dark,x,y,0); [1,-1].forEach(s=>{box(.05,hg,.05,dark,x,D.deck+hg/2,s*wd*.3); if(a.r>=2) box(ch*1.1,.16,.03,a.r>=4?neon(a.r):dark,x,y+.03,s*wd/2);}); if(a.r>=3) box(.03,.02,wd,neon(a.r),x-ch/2,y+.025,0); }
    else if(a.t==='ae1'){ box(.24+.03*a.r,.03,D.W*.92,a.r>=3?neon(a.r):dark,D.x1-.03,.13,0); if(a.r>=2) [1,-1].forEach(s=>box(.26,.13,.03,dark,D.x1-.12,.2,s*D.W*.46)); }
    else [1,-1].forEach(s=>{box(L*.5,.1,.08,dark,mx,.17,s*(D.W/2+.02)); if(a.r>=2) box(L*.5,.02,.02,neon(a.r),mx,.11,s*(D.W/2+.07));});
  }
  const j=look.jantes;
  if(j) wheels.forEach(w=>{ const sg=w.position.z>=0?1:-1, z=wheels.length>2?sg*D.ww:0;
    [0,1].forEach(k=>{ if(k&&j.r<3) return; const t=new THREE.Mesh(new THREE.TorusGeometry(D.wr*(k?.3:.62),.026+.004*j.r,6,k?14:22),neon(j.r)); t.position.z=z; w.add(t); if(wheels.length<=2){const t2=t.clone(); t.position.z=.03; t2.position.z=-.03; w.add(t2);} }); });
  const e=look.echap;
  if(e){ const zs=e.r>=5?[-.42,-.28,.28,.42]:e.r>=2?[-.35,.35]:[.35], rd=.05+.006*e.r, k=Math.min(1,D.W/1.8);
    zs.forEach(z=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(rd,rd,.24,10),e.r>=3?neon(e.r):new THREE.MeshLambertMaterial({color:0x9aa0aa})); c.rotation.z=Math.PI/2; c.position.set(D.x0-.05,.2,z*k); g.add(c);}); }
  const tb=look.turbo;
  if(tb){ box(.42,.07+.012*tb.r,.36,dark,D.x1-.22*L,D.hood+.03,0); if(tb.r>=3) box(.03,.03,.36,neon(tb.r),D.x1-.22*L+.2,D.hood+.05,0); }
}
const VW={on:false,yaw:.7,pit:.28,dist:9,ptr:{},down:false,car:null,scene:null,cam:null};
function openViewer(uid){
  const c=car(uid); if(!c) return; if(!glEnsure()) return toast('La vue 3D n’est pas disponible sur cet appareil');
  if(modelsBusy) return toast('Chargement des modèles 3D…');
  closeSheet(); glStop(); const m=M[c.mid], s=st(c), el=$('viewer'), mods=SLOTS.map(sl=>modOf(c.mods&&c.mods[sl[0]])).filter(Boolean);
  el.hidden=false;
  el.innerHTML=`<div class="vw-slot" id="vslot"></div>
    <div class="vw-top"><div><b>${m.nom}${c.sh?' ✨':''}</b><small>${TIERS[m.t].n}, ${m.cat}. ${fmt(s.ch)} ch, ${fmt(s.kg)} kg, ${fmt(s.vmax)} km/h</small></div><button class="btn sm" data-a="vclose">Fermer</button></div>
    <div class="vw-bot">${mods.length?mods.map(x=>`<span class="chip" style="border-color:${RAR[x.r].c};color:${RAR[x.r].c}">${modName(x)}</span>`).join(''):'<span class="chip">Aucun module monté</span>'}<small>Glisse pour tourner, pince pour zoomer</small></div>`;
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x07050f); sc.fog=new THREE.Fog(0x07050f,30,80);
  sc.add(new THREE.HemisphereLight(0xb9c4ff,0x2a0a4a,1.2)); const dl=new THREE.DirectionalLight(0xffffff,.9); dl.position.set(-6,12,8); sc.add(dl); const d2=new THREE.DirectionalLight(0xff9af0,.5); d2.position.set(8,5,-8); sc.add(d2);
  const gt=ctex(128,128,(x,W,H)=>{x.fillStyle='#0a0a20'; x.fillRect(0,0,W,H); x.strokeStyle='rgba(0,229,255,.4)'; x.lineWidth=2; x.strokeRect(0,0,W,H);},[14,14]);
  const fl=new THREE.Mesh(new THREE.CircleGeometry(22,48),new THREE.MeshBasicMaterial({map:gt})); fl.rotation.x=-Math.PI/2; sc.add(fl);
  const tc=new THREE.Color(TIERS[m.t].c); [[3.6,3.75],[4.6,4.66]].forEach(q=>{const r=new THREE.Mesh(new THREE.RingGeometry(q[0],q[1],64),new THREE.MeshBasicMaterial({color:tc,side:THREE.DoubleSide})); r.rotation.x=-Math.PI/2; r.position.y=.02; sc.add(r);});
  const c3=buildCar(m,TIERS[m.t].c,carLook(c)); sc.add(c3.g);
  VW.car=c3; VW.scene=sc; VW.cam=new THREE.PerspectiveCamera(42,1,.1,200); VW.dist=Math.max(3.2,c3.L*2.1); VW.ptr={}; VW.down=false; VW.on=true; VW.h=Math.min(1,(c3.H||1.4)*.45);
  glAttach('vslot'); glRun(sc,VW.cam,viewerFrame,'viewer'); auTry(()=>ui('open'));
}
function viewerFrame(dt,time){
  if(!VW.down) VW.yaw+=dt*.25; const d=VW.dist, p=VW.pit;
  VW.cam.position.set(Math.cos(VW.yaw)*Math.cos(p)*d,Math.sin(p)*d+VW.h,Math.sin(VW.yaw)*Math.cos(p)*d); VW.cam.lookAt(0,VW.h,0);
  pulseSirens(VW.car,time); shineTick(VW.car,time);
}
function closeViewer(){
  if(!VW.on) return; VW.on=false; glStop(); if(VW.scene) disposeScene(VW.scene); VW.scene=null; VW.car=null;
  const el=$('viewer'); el.hidden=true; el.innerHTML=''; GG.sig=null; render();
}
function bindViewerInput(c){
  c.addEventListener('pointerdown',e=>{ if(GL.mode!=='viewer') return; VW.ptr[e.pointerId]=[e.clientX,e.clientY]; VW.down=true; try{c.setPointerCapture(e.pointerId);}catch(_){ } });
  c.addEventListener('pointermove',e=>{ if(GL.mode!=='viewer') return; const p=VW.ptr[e.pointerId]; if(!p) return; const ids=Object.keys(VW.ptr);
    if(ids.length>=2){ const o=VW.ptr[ids.find(i=>i!=e.pointerId)], d0=Math.hypot(p[0]-o[0],p[1]-o[1]), d1=Math.hypot(e.clientX-o[0],e.clientY-o[1]); if(d0>1&&d1>1) VW.dist=clamp(VW.dist*d0/d1,2.2,24); }
    else { VW.yaw+=(e.clientX-p[0])*.008; VW.pit=clamp(VW.pit+(e.clientY-p[1])*.006,.03,1.25); }
    VW.ptr[e.pointerId]=[e.clientX,e.clientY]; });
  const up=e=>{ delete VW.ptr[e.pointerId]; VW.down=Object.keys(VW.ptr).length>0; }; c.addEventListener('pointerup',up); c.addEventListener('pointercancel',up);
  c.addEventListener('wheel',e=>{ if(GL.mode!=='viewer') return; e.preventDefault(); VW.dist=clamp(VW.dist*(e.deltaY>0?1.1:.9),2.2,24); },{passive:false});
}
/* appui long sur une carte de voiture du garage : vue 3D */
let lpT=null, lpAt=0, lpXY=null;
document.addEventListener('pointerdown',e=>{
  const b=e.target&&e.target.closest&&e.target.closest('[data-a="car"]'); if(!b||view!=='garage'||sheet) return;
  lpXY=[e.clientX,e.clientY]; clearTimeout(lpT); const id=+b.dataset.id; lpT=setTimeout(()=>{lpT=null; lpAt=Date.now(); openViewer(id);},480);
},true);
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>{clearTimeout(lpT); lpT=null;},true));
document.addEventListener('pointermove',e=>{ if(lpT&&lpXY&&Math.hypot(e.clientX-lpXY[0],e.clientY-lpXY[1])>10){clearTimeout(lpT); lpT=null;} },true);
document.addEventListener('contextmenu',e=>{ if(e.target&&e.target.closest&&e.target.closest('[data-a="car"]')) e.preventDefault(); });
/* sons : cartes et essais de volume */
function auCard(r,sh,un){
  if(!AU.ok) return; const t=AU.ctx.currentTime+.01, d=AU.b.jing, f=[330,392,494,587,740,880,1175][r]; LOG('card',t,r);
  osc('triangle',f,t,.08,d,.16,.003,.3); osc('sine',f*2,t+.05,.06,d,.1,.003,.4);
  if(r>=2) [1,1.26,1.5].forEach((m,i)=>osc('sawtooth',f*m,t+.08+i*.05,.12,d,.07,.004,.5));
  if(r>=4){ osc('sine',55,t,.5,d,.5,.005,.6); burst(t,1.2,5000,.5,'highpass',.2,d,true); }
  if(r>=5){ [1,1.5,2,3].forEach((m,i)=>osc('square',f*m,t+.3+i*.08,.2,d,.06,.004,.8)); burst(t,.6,200,.8,'lowpass',.4,d); }
  if(sh||un) for(let i=0;i<7;i++) osc('sine',2400+Math.random()*2400,t+.1+i*.05,.03,d,.06,.001,.2);
}
function auTest(k){
  if(!AU.ok) return; const c=AU.ctx, t=c.currentTime+.02; LOG('test',t,k);
  if(k==='music'||k==='master'){ kick(t,.9); hat(t+STEP*2,.1); snare(t+STEP*4,.7); hat(t+STEP*6,.1); kick(t+STEP*10,.9); snare(t+STEP*12,.7); stab(t,220,.14,.3); stab(t+STEP*6,261.6,.14,.3); if(k==='music') return; }
  if(k==='eng'||k==='opp'||k==='master'){ const e=mkEng(k==='opp'?'v6':'v8',AU.b[k==='opp'?'opp':'eng']); let i=0; const iv=setInterval(()=>{ i++; auTry(()=>engUpdate(e,{v:Math.min(40,i*2.2),vTop:60,thr:i<16?1:0,vol:k==='opp'?.65:.75,pan:0,nit:false},.05)); if(i>22){clearInterval(iv); engStop(e);} },50); return; }
  if(k==='siren'){ const o=c.createOscillator(), bp=c.createBiquadFilter(), g=c.createGain(); o.type='square'; bp.type='bandpass'; bp.frequency.value=1150; bp.Q.value=1.1; g.gain.value=.09; for(let i=0;i<4;i++) o.frequency.setValueAtTime(i%2?640:860,t+i*.3); o.connect(bp); bp.connect(g); g.connect(AU.b.siren); o.start(t); o.stop(t+1.2); return; }
  if(k==='amb'){ burst(t,.7,1800,5,'bandpass',.3,AU.b.amb); burst(t+.2,.6,900,.7,'bandpass',.2,AU.b.amb); return; }
  if(k==='hit'){ const d=AU.b.hit; burst(t,.35,260,1,'lowpass',.45,d); osc('sine',70,t,.08,d,.45,.001,.25); [420,630,910].forEach((f,i)=>osc('square',f,t,.02,d,.06,.001,.2+.06*i)); return; }
  if(k==='ui'){ ui('buy'); return; }
  if(k==='jing') auLevelUp();
}
const ACT = {
  cartab(d){cTab=d.id; render(); document.querySelector('main').scrollTop=0;},
  cslot(d){cSlot=d.id; render();},
  pack(d){ const pk=PACKS.find(p=>p.id===d.id); if(!pk) return; const i=PACKS.indexOf(pk), ok=(d.k==='tok'?S.tok>=pk.tok:S.cr>=pk.cr)&&S.mods.length+pk.n<=invMax(), st=$('pk3');
    if(ok&&st&&!sheet&&!PK.busy){ PK.busy=true; st.classList.add('burst'); const e=st.querySelector('.pk[data-i="'+i+'"]'); if(e) e.classList.add('burst'); auTry(()=>auRip(i)); setTimeout(()=>{PK.busy=false; openPack(d.id,d.k);},680); return; }
    openPack(d.id,d.k); },
  reveal(){ if(!sheet||sheet.t!=='open'||sheet.i>=sheet.cards.length) return; const m=modOf(sheet.cards[sheet.i]); sheet.i++; auCard(m.r,m.sh,m.un!=null); renderSheet(); const e=$('sheet').querySelectorAll('.mod')[sheet.i-1]; if(e){e.classList.add('pop'); e.scrollIntoView&&e.scrollIntoView({block:'nearest'});} },
  revealall(){ if(!sheet||sheet.t!=='open') return; let best=null; while(sheet.i<sheet.cards.length){const m=modOf(sheet.cards[sheet.i++]); if(!best||m.r>best.r) best=m;} if(best) auCard(best.r,best.sh,best.un!=null); renderSheet(); },
  rates(){openSheet({t:'rates'});},
  recycle(d){const m=modOf(+d.id); if(!m||eqCar(m.u)) return; S.scrap+=Math.round(RAR[m.r].sc*(m.sh?3:1)*scrapK()); bump('recyN'); S.mods=S.mods.filter(x=>x!==m); save(); render();},
  recycleall(){const k=S.mods.filter(m=>m.r===0&&!m.sh&&!eqCar(m.u)); if(!k.length) return; S.scrap+=Math.round(k.length*scrapK()); bump('recyN',k.length); S.mods=S.mods.filter(m=>!k.includes(m)); toast(`${k.length} modules recyclés`); save(); render();},
  fuse(d){const r=+d.id, pool=S.mods.filter(m=>m.r===r&&!m.sh&&m.un==null&&!eqCar(m.u)).sort((a,b)=>a.q-b.q).slice(0,5); if(r>=6||pool.length<5) return;
    S.mods=S.mods.filter(m=>!pool.includes(m)); const m=newMod(r+1,null,true); S.mods.push(m); bump('fuseN'); save(); render(); openSheet({t:'open',cards:[m.u],i:0,pk:'p1'});},
  craftopen(){openSheet({t:'craft',r:0});},
  craftr(d){sheet.r=+d.id; renderSheet();},
  craft(d){const r=sheet.r||0, cost=craftCost(r); if(S.scrap<cost||S.mods.length>=invMax()) return; S.scrap-=cost; const m=newMod(r,d.id,true); S.mods.push(m); save(); render(); openSheet({t:'open',cards:[m.u],i:0,pk:'p1'});},
  modslot(d){openSheet({t:'modpick',uid:sheet.uid,slot:d.id});},
  modeq(d){const c=car(sheet.uid), u=+d.id; if(!c||!modOf(u)) return; if(eqOther(u,c)) return openSheet({t:'eqconf',uid:c.uid,slot:sheet.slot,u}); equipMod(c,u,sheet.slot); save(); sheetBackToCar(c.uid);},
  modun(){const c=car(sheet.uid); if(c&&c.mods) delete c.mods[sheet.slot]; save(); const id=c.uid; render(); openSheet({t:'car',uid:id});},
  view3d(){openViewer(sheet.uid);},
  eqbest(d){ const c=car(+(d.id||(sheet&&sheet.uid))); if(!c) return; const pl=bestPlan(c);
    pl.free.forEach(([sl,u])=>equipMod(c,u,sl)); save();
    if(pl.taken.length){ render(); openSheet({t:'eqsteal',uid:c.uid,list:pl.taken.map(x=>[x[0],x[1]])}); return; }
    toast(pl.free.length?`${pl.free.length} pièce${pl.free.length>1?'s':''} montée${pl.free.length>1?'s':''}`:'Tu as déjà les meilleures pièces disponibles'); sheetBackToCar(c.uid); },
  eqsteal(){ const c=car(sheet.uid); let n=0; sheet.list.forEach(([sl,u])=>{ if(modOf(u)){ equipMod(c,u,sl); n++; } }); toast(`${n} pièce${n>1?'s':''} reprise${n>1?'s':''}`); save(); sheetBackToCar(c.uid); },
  eqok(){ const c=car(sheet.uid), m=modOf(sheet.u); if(!c||!m) return; const o=eqCar(m.u); equipMod(c,m.u,sheet.slot); toast(`${modName(m)} déplacée${o?' depuis '+M[o.mid].nom:''}`); save(); sheetBackToCar(c.uid); },
  eqnone(){ const c=car(sheet.uid); if(!c) return; c.mods={}; toast('Modules retirés'); save(); sheetBackToCar(c.uid); },
  eqcaropen(){ openSheet({t:'eqcar'}); },
  eqmodopen(d){ openSheet({t:'eqmod',u:+d.id}); },
  eqmod(d){ const m=modOf(sheet.u), c=car(+d.id); if(!m||!c||eqCar(m.u)) return; equipMod(c,m.u,MODI[m.t][1]); toast(`${modName(m)} montée sur ${M[c.mid].nom}`); closeSheet(); save(); render(); },
  pkgo(d){ PK.tgt=clamp(Math.round(PK.tgt)+(+d.id),0,PACKS.length-1); },
  mtab(d){ mTab=d.id; render(); },
  shopbuy(d){ const it=S.shop&&S.shop.items[+d.id]; if(!it||S.cr<it.p) return; if(S.mods.length>=invMax()) return toast('Inventaire plein : recycle ou fusionne des modules');
    S.cr-=it.p; const m=Object.assign({},it.m,{u:S.muid++}); S.mods.push(m); S.alb[m.t]=(S.alb[m.t]||0)|(1<<m.r); S.stats.best=Math.max(S.stats.best||0,m.r); S.shop.items.splice(+d.id,1); bump('shopN'); toast(`${modName(m)} ajouté à ton inventaire`); save(); render(); },
  shoproll(){ if(S.cr<400) return; S.cr-=400; shopRoll(); save(); render(); },
  fleetrep(){ const fr=fleetRepair(); if(S.cr<fr||!fr) return; S.cr-=fr; S.cars.forEach(c=>{c.etat=100;}); bump('repN'); toast('Garage remis à neuf'); save(); render(); },
  insure(){ if(S.cr<900) return; S.cr-=900; S.ins=3; toast('Entretien préventif actif sur 3 épreuves'); save(); render(); },
  coach(){ if(S.cr<1200) return; S.cr-=1200; S.xpb=3; toast('Coach actif sur 3 épreuves'); save(); render(); },
  sellmods(){ const k=S.mods.filter(m=>m.r<=1&&!m.sh&&m.un==null&&!eqCar(m.u)); if(!k.length) return; const v=k.reduce((t,m)=>t+(m.r?60:20),0); S.cr+=v; S.mods=S.mods.filter(m=>!k.includes(m)); bump('recyN',k.length); toast(`${k.length} modules vendus, +${fmt(v)} cr`); save(); render(); },
  qclaim(d){ const box=S[d.k], q=(d.k==='dq'?DQ:WQ).find(x=>x.id===d.id); if(!box||!q||box.cl[q.id]||qProg(box,q)<q.n) return; box.cl[q.id]=1; giveG(qRew(q)); toast('Récompense récupérée'); save(); render(); },
  vclose(){closeViewer();},
  audio(){openSheet({t:'audio'}); if(RC&&view==='race'){RC.paused=true; renderSheet();}},
  preset(d){Object.assign(S.audio,AUPRE[d.id]||{}); auSet(S.audio); save(); renderSheet();},
  autest(d){auTest(d.id);},
  mute2(){S.audio.mute=!S.audio.mute; auSet(S.audio); save(); renderSheet();},
  daily(){const k=dayKey(); if(S.daily===k) return; const y=new Date(Date.now()-864e5), yk=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate(); S.streak=S.daily===yk?(S.streak||0)+1:1; const r=dailyReward(); S.daily=k; giveG(r); toast(`+${fmt(r.cr)} cr, +${r.xp} XP et +${r.tok} jeton(s)`); save(); render();},
  devkit(){['subi','audi','merco','velo'].forEach(id=>{ if(!S.cars.some(c=>c.mid===id)) S.cars.push({uid:S.nuid++,mid:id,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{}}); }); S.cr+=50000; S.tok+=20; toast('Kit de test reçu : 4 véhicules, 50 000 cr, 20 jetons'); save(); render();},
  tab(d){leaveRace(); view=d.id; R=null; resetArm=false; render(); document.querySelector('main').scrollTop=0;},
  close(){closeSheet();},
  car(d){openSheet({t:'car',uid:+d.id});},
  repair(){
    const c=car(sheet.uid), u=repUnit(c), pts=Math.min(100-c.etat,Math.floor(S.cr/u));
    if(pts<1) return toast('Pas assez de crédits');
    S.cr-=Math.ceil(pts*u); c.etat+=pts; bump('repN');
    if(c.etat>=100){c.etat=100; S.stats.repFull++; toast('Voiture remise à neuf');} else toast(`État remonté à ${c.etat} %`);
    save(); render();
  },
  up(d){
    const c=car(sheet.uid), l=c.up[d.id]||0, k=upCost(c,l);
    if(S.cr<k||l>=Math.min(4,S.bat.atelier)) return;
    S.cr-=k; c.up[d.id]=l+1; c.inv=(c.inv||0)+k; S.stats.ups++;
    toast(`${PARTS.find(p=>p.id===d.id).nom} : palier ${PALIERS[l+1]}`); save(); render();
  },
  sell(){
    if(S.cars.length<2) return;
    if(!sheet.arm){sheet.arm=true; return renderSheet();}
    const c=car(sheet.uid), p=prixVente(c);
    S.cr+=p; bump('sellN'); S.cars=S.cars.filter(x=>x.uid!==c.uid); S.pod.slots=S.pod.slots.map(u=>u===c.uid?null:u); closeSheet(); toast(`${M[c.mid].nom} vendue, +${fmt(p)} cr`); save(); render();
  },
  ev(d){
    const ev=EVENTS.find(e=>e.id===d.id);
    if(S.lvl<ev.lvl||S.cars.length<ev.manches.length) return;
    leaveRace();
    R={ev,opps:makeOpps(ev),pick:ev.manches.map(()=>null),rows:[],auto:false,result:null};
    if(S.cars.length===1&&ev.manches.length===1) R.pick[0]=S.cars[0].uid;
    view='prep'; render(); document.querySelector('main').scrollTop=0;
  },
  slot(d){openSheet({t:'pick',i:+d.id});},
  pick(d){R.pick[sheet.i]=+d.id; closeSheet(); render();},
  go(d){if(!R||!R.pick.every(x=>x)) return; if(modelsBusy||trackBusy){toast('Chargement des modèles 3D…'); Promise.all([modelsP,trackP]).then(()=>ACT.go(d)); return;} R.auto=d.id==='auto'; R.rows=[]; startManche(0);},
  respawn(){respawnPlayer();},
  mute(){S.audio.mute=!S.audio.mute; auSet(S.audio); save(); render();},
  nextm(){if(!R||!RC) return; const n=R.ev.manches.length; if(RC.i+1<n) startManche(RC.i+1); else finalize(false);},
  quit(){if(!R) return; finalize(true);},
  buy(d){
    const o=S.offres[+d.id]; if(!o||S.cr<o.prix) return;
    S.cr-=o.prix; S.cars.push({uid:S.nuid++,mid:o.mid,etat:o.etat,xp:0,lvl:1,up:{},inv:0,mods:{},sh:Math.random()<.03?1:0}); S.offres.splice(+d.id,1);
    toast(`${M[o.mid].nom} ajoutée au garage`); save(); render();
  },
  buynew(d){
    const m=M[d.id]; if(!m||S.cr<m.val||m.t>S.bat.concession+1) return;
    S.cr-=m.val; S.cars.push({uid:S.nuid++,mid:m.id,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{},sh:Math.random()<.03?1:0});
    toast(`${m.nom} ajoutée au garage`); save(); render();
  },
  refresh(){const k=100*S.bat.casse; if(S.cr<k) return; S.cr-=k; newOffres(); save(); render();},
  slot3(d){openSheet({t:'slot',i:+d.id});},
  podset(d){const i=sheet.i; if(S.lvl<POD_LVL[i]) return; S.pod.slots=S.pod.slots.map(u=>u===+d.id?null:u); S.pod.slots[i]=+d.id; closeSheet(); toast('Voiture exposée'); save(); render();},
  podclear(){S.pod.slots[sheet.i]=null; closeSheet(); save(); render();},
  podup(){const nx=POD_TIER[S.pod.tier+1]; if(!nx||S.lvl<nx.lvl||S.cr<nx.cost) return; S.cr-=nx.cost; S.pod.tier++; toast('Podiums : '+nx.n); save(); render();},
  collect(){const p=Math.floor(podPending()); S.pod.last=Date.now(); if(p<1){save(); return toast('Rien à récolter pour le moment');} S.cr+=p; toast(`+${fmt(p)} cr récoltés`); save(); render();},
  buynitro(d){const q=+(d.id||1), p={1:NITRO_PRIX,5:650,12:1500}[q]; if(!p||S.cr<p) return; S.cr-=p; S.nitro+=q; save(); render();},
  bat(d){
    const b=BATS.find(x=>x.id===d.id), l=S.bat[b.id]; if(l>=b.max||S.cr<b.cout[l]) return;
    S.cr-=b.cout[l]; S.bat[b.id]=l+1; S.stats.bats++;
    if(b.id==='casse') newOffres();
    toast(`${b.nom} : niveau ${l+1}`); save(); render();
  },
  claim(d){
    const m=MISSIONS.find(x=>x.id===d.id), [a,b]=m.p(S); if(S.claimed[m.id]||a<b) return;
    S.claimed[m.id]=1; giveG(m.g); toast('Récompense récupérée : '+gText(m.g).replace(/&nbsp;/g,' ')); save(); render();
  },
  reset(){
    if(!resetArm){resetArm=true; return render();}
    const aud=S.audio; resetArm=false; S=fresh(); S.audio=aud; S.intro=true; R=null; view='garage'; save(); render(); toast('Nouvelle partie');
  }
};
document.addEventListener('click',e=>{
  if(Date.now()-lpAt<700) return;
  const b=e.target.closest('[data-a]'); if(!b||b.disabled) return;
  const f=ACT[b.dataset.a]; if(f){const pre={cr:S.cr,lvl:S.lvl}; f(b.dataset); auAction(b.dataset.a,b.dataset,pre);}
});
document.addEventListener('input',e=>{const el=e.target; if(el&&el.dataset&&el.dataset.a==='vol'){S.audio[el.dataset.k]=(+el.value)/100; auSet(S.audio); save();}});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&sheet) closeSheet();
  if(view==='race'&&RC&&!e.repeat){
    const k=e.key.toLowerCase();
    if(RC.kind==='spa'){
      if(k==='z'||k==='w'||e.key==='ArrowUp'){e.preventDefault(); RC.inp.k=1;}
      if(k==='s'||e.key==='ArrowDown'){e.preventDefault(); RC.inp.kb=true;}
      if(k==='q'||k==='a'||e.key==='ArrowLeft'){e.preventDefault(); RC.keyL=true;}
      if(k==='d'||e.key==='ArrowRight'){e.preventDefault(); RC.keyR=true;}
      if(e.code==='Space'){e.preventDefault(); RC.inp.hand=true;}
      if(k==='n'||e.key==='Shift') fireNitro();
      if(k==='r') respawnPlayer();
      RC.inp.sk=(RC.keyR?1:0)-(RC.keyL?1:0);
    } else if(RC.kind==='race'){
      if(k==='z'||k==='w'||e.key==='ArrowUp'){e.preventDefault(); RC.inp.k=1;}
      if(k==='q'||k==='a'||e.key==='ArrowLeft'){e.preventDefault(); RC.inp.k=.5;}
      if(k==='s'||e.key==='ArrowDown'||e.code==='Space'){e.preventDefault(); RC.inp.kb=true;}
      if(k==='n'||e.key==='Shift') fireNitro();
    }
  }
});
document.addEventListener('keyup',e=>{
  if(!(view==='race'&&RC)) return; const k=e.key.toLowerCase();
  if(RC.kind==='spa'){
    if(k==='z'||k==='w'||e.key==='ArrowUp') RC.inp.k=0;
    if(k==='s'||e.key==='ArrowDown') RC.inp.kb=false;
    if(k==='q'||k==='a'||e.key==='ArrowLeft') RC.keyL=false;
    if(k==='d'||e.key==='ArrowRight') RC.keyR=false;
    if(e.code==='Space') RC.inp.hand=false;
    RC.inp.sk=(RC.keyR?1:0)-(RC.keyL?1:0);
  } else if(RC.kind==='race'){
    if(k==='z'||k==='w'||e.key==='ArrowUp'||k==='q'||k==='a'||e.key==='ArrowLeft') RC.inp.k=0;
    if(k==='s'||e.key==='ArrowDown'||e.code==='Space') RC.inp.kb=false;
  }
});

/* ======================================================================
   v0.9 : miniatures 3D, équipement des modules, paquets 3D, effets de course
   ====================================================================== */
let lastView=null;
/* ---- miniatures 3D : chaque voiture est rendue une fois avec le moteur partagé, puis mise en cache ---- */
const TH={c:{},q:[],busy:false,fail:false};
const thKey=c=>c.mid+'|'+lookKey(c)+(c.sh?'|s':'');
function thArt(c){
  const m=M[c.mid], k=thKey(c), u=TH.c[k], rust=c.etat<40;
  if(u) return `<img class="th${rust?' rust':''}" src="${u}" alt="" draggable="false">`;
  if(window.THREE&&!TH.fail&&!TH.q.some(x=>x.k===k)){ TH.q.push({k,c:{mid:c.mid,lk:carLook(c),sh:c.sh}}); setTimeout(thPump,40); }
  return `<div class="thw" data-th="${k}" data-r="${rust?1:0}">${carSVG(m,c.etat)}</div>`;
}
function thFill(k,url){
  document.querySelectorAll('[data-th]').forEach(e=>{ if(e.dataset.th!==k) return;
    e.outerHTML=`<img class="th${e.dataset.r==='1'?' rust':''}" src="${url}" alt="" draggable="false">`; });
}
function thPump(){
  if(TH.busy||TH.fail||!TH.q.length||modelsBusy||view==='race'||!glEnsure()) return;
  TH.busy=true;
  requestAnimationFrame(()=>{
    const it=TH.q.shift();
    try{ const url=thRender(it.c); if(url){TH.c[it.k]=url; thFill(it.k,url);} else TH.fail=true; }
    catch(e){ TH.fail=true; TH.q.length=0; try{console.warn('miniature',e);}catch(_){ } }
    TH.busy=false; if(TH.q.length) setTimeout(thPump,20);
  });
}
function thRender(c){
  const m=M[c.mid], tcs=TIERS[m.t].c, tc=new THREE.Color(tcs), W=640, H=384, R=GL.r;
  const sc=new THREE.Scene();
  const bg=ctex(4,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0a0919'); g.addColorStop(.58,'#1a1640'); g.addColorStop(1,'#07060f'); x.fillStyle=g; x.fillRect(0,0,w,h);});
  bg.wrapS=bg.wrapT=THREE.ClampToEdgeWrapping; sc.background=bg;
  sc.add(new THREE.HemisphereLight(0xc6d0ff,0x2a0a4a,1.25));
  const dl=new THREE.DirectionalLight(0xffffff,.95); dl.position.set(-6,12,9); sc.add(dl);
  const rim=new THREE.DirectionalLight(tc,.9); rim.position.set(8,5,-8); sc.add(rim);
  const d2=new THREE.DirectionalLight(0xff9af0,.35); d2.position.set(6,3,8); sc.add(d2);
  const gt=ctex(128,128,(x,w,h)=>{x.fillStyle='#0a0a20'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(0,229,255,.38)'; x.lineWidth=2; x.strokeRect(0,0,w,h);},[16,16]);
  const fl=new THREE.Mesh(new THREE.CircleGeometry(24,48),new THREE.MeshBasicMaterial({map:gt})); fl.rotation.x=-Math.PI/2; sc.add(fl);
  [[3.5,3.66],[4.5,4.56]].forEach(q=>{const r=new THREE.Mesh(new THREE.RingGeometry(q[0],q[1],64),new THREE.MeshBasicMaterial({color:tc,side:THREE.DoubleSide})); r.rotation.x=-Math.PI/2; r.position.y=.02; sc.add(r);});
  const c3=buildCar(m,tcs,c.lk||{}); sc.add(c3.g);
  const cam=new THREE.PerspectiveCamera(30,W/H,.1,200), h=Math.min(1,(c3.H||1.4)*.45), d=Math.max(3.4,(c3.L||4)*2.6), a=.66, p=.2;
  cam.position.set(Math.cos(a)*Math.cos(p)*d,Math.sin(p)*d+h,Math.sin(a)*Math.cos(p)*d); cam.lookAt(0,h*.92,0);
  const rt=new THREE.WebGLRenderTarget(W,H,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});
  const buf=new Uint8Array(W*H*4);
  R.setRenderTarget(rt); R.render(sc,cam); R.readRenderTargetPixels(rt,0,0,W,H,buf); R.setRenderTarget(null);
  rt.dispose(); disposeScene(sc);
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d'), id=x.createImageData(W,H);
  for(let y=0;y<H;y++) id.data.set(buf.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4);
  x.putImageData(id,0,0);
  const o=document.createElement('canvas'); o.width=448; o.height=268; const ox=o.getContext('2d'); ox.imageSmoothingQuality='high'; ox.drawImage(cv,0,0,448,268);
  return o.toDataURL('image/jpeg',.9);
}

/* ---- équipement des modules ---- */
const eqOther=(u,c)=>{const o=eqCar(u); return o&&o!==c?o:null;};
function equipMod(c,u,slot){
  const o=eqCar(u); if(o) for(const k in o.mods) if(o.mods[k]===u) delete o.mods[k];
  c.mods=c.mods||{}; c.mods[slot]=u; bump('eqN'); S.stats.eq=Math.max(S.stats.eq||0,Object.keys(c.mods).length);
}
/* plan : pour chaque emplacement, le meilleur module libre (free) et le meilleur module pris sur une autre voiture (taken) */
function bestPlan(c){
  const free=[], taken=[];
  for(const sl of SLOTS){
    const id=sl[0], cur=c.mods&&modOf(c.mods[id]);
    const cands=S.mods.filter(m=>MODI[m.t][1]===id).sort((a,b)=>modPow(b)-modPow(a)); if(!cands.length) continue;
    const best=cands[0], bf=cands.find(m=>!eqOther(m.u,c));
    if(bf&&(!cur||modPow(bf)>modPow(cur)+1e-9)) free.push([id,bf.u]);
    const bo=eqOther(best.u,c);
    if(bo&&(!cur||modPow(best)>modPow(cur)+1e-9)&&(!bf||modPow(best)>modPow(bf)+1e-9)) taken.push([id,best.u,bo]);
  }
  return {free,taken};
}
const sheetBackToCar=uid=>{ render(); openSheet({t:'car',uid}); };
function eqSheets(X){
  const el=$('sheet');
  if(tuneSheets(X)||pilotSheets(X)) return true;
  if(sheet.t==='eqsteal'){
    const c=car(sheet.uid);
    el.innerHTML=`${X}<h2>Prendre des pièces ?</h2><p class="note">Ces meilleures pièces sont déjà montées sur d’autres voitures. Si tu confirmes, elles seront retirées de ces voitures et montées sur ${M[c.mid].nom}.</p>
      <div class="mods">${sheet.list.map(([sl,u])=>{const m=modOf(u), o=eqCar(u); return m?modHTML(m,`<div class="mod-eq">Retirée de : <b>${M[o.mid].nom}</b></div>`):'';}).join('')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><button class="btn alt" data-a="car" data-id="${c.uid}">Garder comme ça</button><button class="btn mag" data-a="eqsteal">Les prendre</button></div>`;
    return true;
  }
  if(sheet.t==='eqconf'){
    const c=car(sheet.uid), m=modOf(sheet.u), o=m&&eqCar(m.u), cur=c.mods&&modOf(c.mods[sheet.slot]);
    if(!m||!o){ closeSheet(); return true; }
    el.innerHTML=`${X}<h2>Retirer cette pièce ?</h2><p class="note"><b>${modName(m)}</b> est déjà montée sur <b>${M[o.mid].nom}</b>. Une pièce ne peut équiper qu’une voiture à la fois.</p>
      ${modHTML(m)}<p class="note" style="margin-top:10px">Elle sera retirée de ${M[o.mid].nom} et montée sur ${M[c.mid].nom}${cur?`, à la place de ${modName(cur)}`:''}.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><button class="btn alt" data-a="modslot" data-id="${sheet.slot}">Annuler</button><button class="btn mag" data-a="eqok">Confirmer le transfert</button></div>`;
    return true;
  }
  if(sheet.t==='eqcar'){
    el.innerHTML=`${X}<h2>Équiper les meilleures pièces</h2><p class="note">Choisis la voiture. Les meilleurs modules libres de chaque emplacement seront montés. Si une pièce meilleure est sur une autre voiture, je te demande avant de la prendre.</p>
      ${S.cars.map(c=>`<button class="row" data-a="eqbest" data-id="${c.uid}"><span class="throw" style="--t:${TIERS[M[c.mid].t].c}">${thArt(c)}</span><span class="grow"><span class="ttl">${M[c.mid].nom}</span><br><span class="sub">${Object.keys(c.mods||{}).length} / ${SLOTS.length} modules montés</span></span><span class="gain">Équiper</span></button>`).join('')}`;
    return true;
  }
  if(sheet.t==='eqmod'){
    const m=modOf(sheet.u); if(!m){closeSheet(); return true;} const sl=MODI[m.t][1], slN=SLOTS.find(s=>s[0]===sl);
    el.innerHTML=`${X}<h2>Monter sur quelle voiture ?</h2>${modHTML(m)}<p class="note" style="margin-top:8px">Emplacement : ${slN[2]} ${slN[1]}. Le module déjà monté sur la voiture choisie retourne dans ton inventaire.</p>
      ${S.cars.map(c=>{const cu=c.mods&&modOf(c.mods[sl]); return `<button class="row" data-a="eqmod" data-id="${c.uid}"><span class="throw" style="--t:${TIERS[M[c.mid].t].c}">${thArt(c)}</span><span class="grow"><span class="ttl">${M[c.mid].nom}</span><br><span class="sub">${cu?'Actuel : '+modName(cu)+' ('+RAR[cu.r].n+')':'Emplacement vide'}</span></span><span class="gain" style="color:${!cu||modPow(m)>modPow(cu)?'var(--good)':'var(--muted)'}">${!cu||modPow(m)>modPow(cu)?'Mieux':'Moins bon'}</span></button>`;}).join('')}`;
    return true;
  }
  return false;
}

/* ---- paquets 3D ---- */
const PKT={p1:{c1:'#6f7f96',c2:'#2d3850',c3:'#0f1626',emb:'🔧',tag:'STARTER'},p2:{c1:'#46e08a',c2:'#14804a',c3:'#07281a',emb:'⚙️',tag:'ATELIER'},
  p3:{c1:'#59a8ff',c2:'#6a3de0',c3:'#2a0a52',emb:'🏁',tag:'ÉLITE'},p4:{c1:'#ffe27a',c2:'#d98a14',c3:'#4d2400',emb:'👑',tag:'LÉGENDE'}};
const PK={pos:0,tgt:0,drag:null,vel:0,raf:0,shown:-1,busy:false,spin:0};
function pack3d(p,i){
  const th=PKT[p.id]||PKT.p1, pips=[0,1,2].map(k=>RAR[Math.min(6,p.min+k)]).map(r=>`<i style="background:${r.c}"></i>`).join('');
  return `<div class="pk" data-i="${i}" style="--c1:${th.c1};--c2:${th.c2};--c3:${th.c3}">
    <div class="lay l1"></div><div class="lay l2"></div><div class="lay l3"></div>
    <div class="lay fr"><div class="crimp t"></div><div class="crimp b"></div>
      <div class="ct"><span class="tag">${th.tag}</span><span class="emb">${th.emb}</span><div><div class="nm">${p.nom.replace('Paquet ','')}</div><div class="sb">${p.n} modules</div></div><span class="pips">${pips}</span></div><div class="shine"></div></div>
    <div class="lay bk"><div class="crimp t"></div><div class="crimp b"></div><div class="ct"><span class="tag">ROUILLE &amp; GLOIRE</span><span class="emb">🃏</span><span class="sb">${p.d}</span><span class="tag">COLLECTION</span></div></div></div>`;
}
function packsHTML(){
  return `<p class="note">Fais glisser les paquets de gauche à droite. Ils s’achètent avec des crédits ou des jetons 🎟 gagnés en jouant, jamais en argent réel.</p>
    <div class="pk3" id="pk3"><button class="pknav l" data-a="pkgo" data-id="-1" aria-label="Précédent">‹</button><div class="ring" id="pkring">${PACKS.map(pack3d).join('')}</div><div class="fl"></div><button class="pknav r" data-a="pkgo" data-id="1" aria-label="Suivant">›</button></div>
    <div class="dots" id="pkdots">${PACKS.map(()=>'<i></i>').join('')}</div><div class="pkInfo" id="pkInfo"></div>
    <button class="btn alt sm" data-a="rates" style="margin-top:12px">Voir les taux de tirage et les garanties</button>`;
}
function pkInfo(force){
  const el=$('pkInfo'); if(!el) return; const i=clamp(Math.round(PK.drag?PK.pos:PK.tgt),0,PACKS.length-1);
  if(!force&&PK.shown===i) return; PK.shown=i; const p=PACKS[i];
  el.innerHTML=`<div class="t"><b>${p.nom}</b><span>${p.n} modules</span></div><p class="note" style="margin:0">${p.d}</p>
    <div class="buy"><button class="btn" data-a="pack" data-id="${p.id}" data-k="cr" ${S.cr<p.cr?'disabled':''}>Ouvrir, ${cr(p.cr)}</button><button class="btn alt" data-a="pack" data-id="${p.id}" data-k="tok" ${S.tok<p.tok?'disabled':''}>${p.tok} 🎟</button></div>`;
  const dots=$('pkdots'); if(dots) [...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i));
}
function pkLayout(time){
  const ring=$('pkring'); if(!ring){PK.raf=0; return false;}
  if(!PK.drag){ const d=PK.tgt-PK.pos; PK.pos+=d*.15; if(Math.abs(d)<.003) PK.pos=PK.tgt; }
  const spinK=PK.spin?Math.max(0,1-(time-PK.spin)/800):0; if(!spinK) PK.spin=0;
  [...ring.children].forEach(el=>{
    const i=+el.dataset.i, o=i-PK.pos, ao=Math.abs(o), sg=o<0?-1:1;
    const x=sg*(Math.min(ao,1)*108+Math.max(0,ao-1)*70), z=-Math.min(ao,2.2)*160;
    let ry=-Math.max(-1.5,Math.min(1.5,o))*44; if(ao<.5) ry+=Math.sin(time/820+i)*5*(1-ao*2);
    if(ao<.5&&spinK) ry+=360*(1-Math.pow(1-spinK,3))*-1+360;
    el.style.transform=`translate3d(${x.toFixed(1)}px,${(-ao*5).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(${(1-.06*Math.min(ao,2)).toFixed(3)})`;
    el.style.opacity=ao>2.6?0:(1-.16*Math.min(ao,2.4)).toFixed(2); el.style.zIndex=String(20-Math.round(ao*3));
    el.style.setProperty('--sx',(-30+ry*1.1+Math.sin(time/1300+i)*30).toFixed(0)+'%'); el.classList.toggle('sel',ao<.5);
  });
  pkInfo(); return true;
}
function pkLoop(t){ PK.raf=pkLayout(t)?requestAnimationFrame(pkLoop):0; }
function bindPacks(){
  const st=$('pk3'); if(!st||cTab!=='packs'){PK.raf=0; return;}
  PK.shown=-1; pkLayout(performance.now()); pkInfo(true);
  st.addEventListener('pointerdown',e=>{
    if(e.target.closest('.pknav')) return;
    PK.drag={x:e.clientX,p:PK.pos,moved:0,lx:e.clientX,lt:e.timeStamp,tg:e.target}; PK.vel=0; try{st.setPointerCapture(e.pointerId);}catch(_){}
  });
  st.addEventListener('pointermove',e=>{
    const d=PK.drag; if(!d) return; const dx=e.clientX-d.x; d.moved=Math.max(d.moved,Math.abs(dx));
    PK.pos=clamp(d.p-dx/108,-.3,PACKS.length-.7); const dt=e.timeStamp-d.lt; if(dt>0){PK.vel=PK.vel*.6+((e.clientX-d.lx)/dt)*.4; d.lx=e.clientX; d.lt=e.timeStamp;}
  });
  const up=e=>{
    const d=PK.drag; if(!d) return; PK.drag=null;
    if(d.moved<6){ const pe=d.tg&&d.tg.closest&&d.tg.closest('.pk'); if(pe){const i=+pe.dataset.i; if(i===Math.round(PK.tgt)) PK.spin=performance.now(); else PK.tgt=i;} else PK.tgt=Math.round(PK.pos); return; }
    PK.tgt=clamp(Math.round(PK.pos-PK.vel*170/108),0,PACKS.length-1); auTry(()=>ui('click'));
  };
  st.addEventListener('pointerup',up); st.addEventListener('pointercancel',up);
  if(!PK.raf) PK.raf=requestAnimationFrame(pkLoop);
}
function auRip(i){
  if(!AU.ok) return; const t=AU.ctx.currentTime+.01, d=AU.b.jing;
  burst(t,.5,1800,.8,'bandpass',.5,d,true); burst(t+.08,.4,5200,.6,'highpass',.4,d);
  for(let k=0;k<12;k++) osc('square',1400+Math.random()*1800,t+.04*k,.01,d,.04,.001,.05);
  osc('sine',60,t+.35,.3,d,.5,.004,.4); osc('sawtooth',220*(1+i*.25),t+.4,.35,d,.07,.01,.5); burst(t+.45,.9,3200,.5,'highpass',.25,d,true);
}

/* ---- effets de course : flashs, lignes de vitesse, rampe de régime ---- */
const FXL='<div class="fxl" id="fxl"><div class="fl" id="fxF"></div><div class="sl" id="fxS"></div><div class="rev" id="fxR">'+'<i></i>'.repeat(16)+'</div></div>';
const WHEEL=`<svg viewBox="-60 -60 120 120" aria-hidden="true"><defs><linearGradient id="wg" x1="0" y1="-1" x2="0" y2="1"><stop offset="0" stop-color="#6a6f98"/><stop offset=".5" stop-color="#2a2e52"/><stop offset="1" stop-color="#0c0d20"/></linearGradient></defs>
<circle r="51" fill="none" stroke="url(#wg)" stroke-width="14"/><circle r="57.6" fill="none" stroke="#00E5FF" stroke-opacity=".5" stroke-width="1.4"/><circle r="44" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="1.2"/>
<path d="M-44 -22 A50 50 0 0 1 -14 -47" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="3.5" stroke-linecap="round"/>
<path d="M-5 -59 L5 -59 L3.4 -43 L-3.4 -43 Z" fill="#FCEE0A"/>
<path d="M-45 5 Q-24 -3 -9 7 L-9 17 Q-25 11 -44 18 Z" fill="url(#wg)" stroke="#00E5FF" stroke-opacity=".4"/>
<path d="M45 5 Q24 -3 9 7 L9 17 Q25 11 44 18 Z" fill="url(#wg)" stroke="#00E5FF" stroke-opacity=".4"/>
<path d="M-9 14 L9 14 L12 44 L-12 44 Z" fill="url(#wg)" stroke="#00E5FF" stroke-opacity=".4"/>
<circle r="15" fill="#10122a" stroke="#00E5FF" stroke-width="2"/><circle r="6.5" fill="#FF2BD6"/><circle r="2.2" fill="#fff" fill-opacity=".8" cx="-2" cy="-2"/></svg>`;
function fxFlash(kind){ const f=$('fxF'); if(!f) return; f.className='fl'; void f.offsetWidth; f.className='fl '+kind; }
function fxUpdate(P,Rc){
  const vTop=Math.max(10,(P.r?P.r.VM:P.VM)||60), frac=clamp(P.v/vTop,0,1), nit=P.nitroT>0;
  const s=$('fxS'); if(s){ const f=clamp((P.v*3.6-80)/190,0,1)+(nit?.5:0), on=f>.12, o=(Math.min(1,f)*.9).toFixed(2); if(s._on!==on){s._on=on; s.classList.toggle('on',on);} if(s._o!==o){s._o=o; s.style.opacity=o;} }
  const r=$('fxR'); if(r){ const n=Math.round(frac*16); if(r._n!==n){ r._n=n; [...r.children].forEach((e,k)=>{ e.className=k<n?'on '+(k>=13?'r':k>=9?'y':''):''; }); } }
  if(Rc&&Rc.clock>3&&Rc.pos){ if(Rc.lastPos!=null){ if(Rc.pos<Rc.lastPos) auTry(auWhoosh); else if(Rc.pos>Rc.lastPos) auTry(auDown); } Rc.lastPos=Rc.pos; }
}

/* ======================================================================
   v0.9 : audio drag et nouveaux sons, économie, missions, marché
   ====================================================================== */
/* ---- audio : drag (tempo qui monte avec la vitesse) et nouveaux effets ---- */
function dragSD(){ const f=clamp(AU.speedFrac||0,0,1); AU.dsm=(AU.dsm||0)+(f-(AU.dsm||0))*.07; return 15/(120+68*Math.pow(AU.dsm,.85)); }
function dragSched(s,bar,t,ch){
  const q=AU.seq, L=q.level, sd=15/(120+68*Math.pow(AU.dsm||0,.85));
  if(s===0&&bar%4===0) AU.dkey=Math.pow(2,Math.min(5,Math.floor((AU.dsm||0)*6))/12);
  const k=AU.dkey||1;
  if(s===0&&bar%2===0) pad(t,sd*32,ch.pad.map(f=>f*k),.085);
  if(s%4===0) kick(t,L===0?.62:.92,{p0:170,p1:46,dec:.24});
  if(s%4===2) hat(t,.13,true); else if(L>=1&&s%2===1) hat(t,.045,false);
  if(L>=1&&(s===4||s===12)) clap(t,.42);
  if(L>=1&&s%4===2) sub(t,sd*1.7,ch.sub*2*k,.34);
  if(L>=2&&(s===0||s===6||s===10)) reese(t,sd*3,ch.bass*k,.2);
  if(L>=2) pluck(t,ch.arp[(s+bar*2)%6]*2*k,.07,'sawtooth',sd*2.2);
  if(L>=3){
    if([0,3,6,10,12].includes(s)) stab(t,ch.arp[(s>>1)%6]*2*k,.1,sd*2);
    if(s===0&&bar%2===0) crash(t,.26);
    if(s%2===1) hat(t,.06,false);
    if(bar%4===3&&s>=8) snare(t,.25+.04*(s-8),{});
  } else if(L>=2&&bar%4===3&&s>=12) snare(t,.28+.1*(s-12),{});
}
function auWhoosh(){ if(!AU.ok) return; const t=AU.ctx.currentTime+.005, b=burst(t,.42,500,1.6,'bandpass',.5,AU.b.hit); b.fl.frequency.exponentialRampToValueAtTime(3800,t+.34); osc('sine',880,t+.2,.05,AU.b.ui,.07,.002,.2); }
function auDown(){ if(!AU.ok) return; const t=AU.ctx.currentTime+.005, o=osc('triangle',300,t,.12,AU.b.ui,.16,.003,.14); o.o.frequency.exponentialRampToValueAtTime(150,t+.16); }
function auHorn(won){
  if(!AU.ok) return; const t=AU.ctx.currentTime+.02, d=AU.b.jing;
  if(won){ [392,523.25,659.25].forEach((f,i)=>osc('sawtooth',f,t+i*.11,.34,d,.1,.01,.5)); osc('sawtooth',130.8,t,.6,d,.1,.01,.5); burst(t,.7,6000,.5,'highpass',.12,d,true); }
  else { osc('sawtooth',220,t,.5,d,.1,.01,.4); osc('sawtooth',164.8,t+.18,.6,d,.1,.01,.5); }
}
function auLaunch(){
  if(!AU.ok) return; const t=AU.ctx.currentTime+.01, b=burst(t,.55,2300,6,'bandpass',.22,AU.b.amb); b.fl.frequency.linearRampToValueAtTime(3900,t+.5);
  const o=osc('sawtooth',90,t,.3,AU.b.hit,.1,.01,.25); o.o.frequency.exponentialRampToValueAtTime(260,t+.35);
}
function auDing(){ if(!AU.ok) return; const t=AU.ctx.currentTime+.005; osc('sine',1568,t,.08,AU.b.ui,.16,.002,.4); osc('sine',2093,t+.07,.1,AU.b.ui,.14,.002,.5); }

/* ---- économie : gains plus généreux, réparations et améliorations moins chères ---- */
const ECO={gain:1.5,up:.75,rep:.7};
const bump=(k,n)=>{S.stats[k]=(S.stats[k]||0)+(n==null?1:n);};
const wearK=()=>(S.ins>0?.3:1)*(1-.08*pk('wear'));
const invMax=()=>INV_MAX+60*(S.bat.entrepot||0);
const scrapK=()=>(1+.15*(S.bat.entrepot||0))*(1+.08*pk('scrap'));
const craftCost=r=>Math.max(1,Math.round(RAR[r].sc*6*(1-.08*(S.bat.entrepot||0))));
const giveG=g=>{S.cr+=g.cr||0; S.nitro+=g.nitro||0; S.tok+=g.tok||0; if(g.xp) addXP(g.xp);};
const gText=g=>[g.cr?cr(g.cr):'',g.nitro?`⚡ ${g.nitro}`:'',g.xp?`${g.xp} XP`:'',g.tok?`${g.tok} 🎟`:''].filter(Boolean).join(' + ');
BATS.push(
 {id:'banc',nom:'Banc de puissance',ic:'📈',max:5,cout:[3000,12000,45000,150000,500000],effet:l=>l?`+${l*2} % de puissance et de couple sur toutes tes voitures`:'Règle tes moteurs : +2 % de puissance par niveau'},
 {id:'entrepot',nom:'Entrepôt de pièces',ic:'📦',max:5,cout:[2000,8000,30000,100000,350000],effet:l=>l?`Ferraille +${l*15} %, fabrication −${l*8} %, inventaire de ${INV_MAX+60*l} modules`:'Plus de ferraille, fabrication moins chère, plus de place'},
 {id:'simu',nom:'Simulateur de course',ic:'🕹️',max:5,cout:[4000,16000,60000,200000,700000],effet:l=>l?`+${l*10} % d’expérience gagnée en course`:'Entraîne tes pilotes : +10 % d’expérience par niveau'});

/* ---- défis quotidiens et hebdomadaires ---- */
const DQ=[{id:'d_race',t:'Dispute 3 épreuves',s:'races',n:3,g:{cr:500,tok:1}},{id:'d_win',t:'Gagne 2 épreuves',s:'wins',n:2,g:{cr:800}},
 {id:'d_nit',t:'Utilise 3 bouteilles de nitro',s:'nitroN',n:3,g:{cr:400,nitro:1}},{id:'d_pack',t:'Ouvre 2 paquets',s:'packs',n:2,g:{cr:600,tok:1}},
 {id:'d_rep',t:'Répare 2 voitures',s:'repN',n:2,g:{cr:300}},{id:'d_eq',t:'Monte 2 modules',s:'eqN',n:2,g:{cr:500}},
 {id:'d_shop',t:'Achète une pièce au marché',s:'shopN',n:1,g:{cr:500}},{id:'d_spa',t:'Gagne une course sur le circuit de Spa',s:'w_circuit',n:1,g:{cr:900,tok:1}},
 {id:'d_drag',t:'Gagne un drag',s:'w_drag',n:1,g:{cr:700}}];
const WQ=[{id:'w_win',t:'Gagne 12 épreuves',s:'wins',n:12,g:{cr:6000,tok:6}},{id:'w_pack',t:'Ouvre 10 paquets',s:'packs',n:10,g:{cr:4000,tok:5}},
 {id:'w_earn',t:'Gagne 30 000 cr en course',s:'earned',n:30000,g:{cr:5000,tok:3}},{id:'w_nit',t:'Utilise 15 bouteilles de nitro',s:'nitroN',n:15,g:{cr:3000,nitro:3}},
 {id:'w_spa',t:'Gagne 5 courses sur le circuit de Spa',s:'w_circuit',n:5,g:{cr:5000,tok:4}},{id:'w_fuse',t:'Fusionne 3 fois des modules',s:'fuseN',n:3,g:{cr:3500,tok:3}}];
const weekKey=()=>{const d=new Date(), t=new Date(d.getFullYear(),0,1); return d.getFullYear()+'-w'+Math.ceil(((d-t)/864e5+t.getDay()+1)/7);};
function questsEnsure(){
  const dk=dayKey(), wk=weekKey();
  if(!S.dq||S.dq.k!==dk) S.dq={k:dk,base:Object.assign({},S.stats),ids:DQ.map(q=>q.id).sort(()=>Math.random()-.5).slice(0,3),cl:{}};
  if(!S.wq||S.wq.k!==wk) S.wq={k:wk,base:Object.assign({},S.stats),ids:WQ.map(q=>q.id).sort(()=>Math.random()-.5).slice(0,2),cl:{}};
}
const qProg=(box,q)=>Math.max(0,(S.stats[q.s]||0)-((box.base&&box.base[q.s])||0));
const qRew=q=>{const c=Math.round((q.g.cr||0)*(1+.1*S.lvl)/10)*10; return {cr:c,xp:q.g.xp||rxp(c),tok:q.g.tok||0,nitro:q.g.nitro||0};};
function questReady(){ questsEnsure(); return [['dq',DQ],['wq',WQ]].some(([k,L])=>S[k].ids.some(id=>{const q=L.find(x=>x.id===id); return !S[k].cl[id]&&qProg(S[k],q)>=q.n;})); }
const MISS2=[
 ['m17','Course','Gagne 15 épreuves',s=>[s.stats.wins,15],{cr:3000,tok:2}],['m18','Course','Gagne 40 épreuves',s=>[s.stats.wins,40],{cr:12000,tok:5}],
 ['m19','Course','Dispute 10 épreuves',s=>[s.stats.races,10],{cr:1500}],['m20','Course','Gagne un drag',s=>[s.stats.w_drag||0,1],{cr:800}],
 ['m21','Course','Gagne 3 courses sur le circuit de Spa',s=>[s.stats.w_circuit||0,3],{cr:2500,tok:1}],['m22','Course','Gagne un rallye',s=>[s.stats.w_rallye||0,1],{cr:900}],
 ['m23','Course','Gagne un drift',s=>[s.stats.w_drift||0,1],{cr:1200}],['m24','Course','Gagne une manche d’endurance',s=>[s.stats.w_endurance||0,1],{cr:1800}],
 ['m25','Course','Utilise 10 bouteilles de nitro',s=>[s.stats.nitroN||0,10],{cr:1000,nitro:2}],
 ['m26','Cartes','Ouvre 5 paquets',s=>[s.stats.packs||0,5],{tok:3}],['m27','Cartes','Ouvre 25 paquets',s=>[s.stats.packs||0,25],{cr:6000,tok:8}],
 ['m28','Cartes','Possède 15 modules',s=>[s.mods.length,15],{cr:1200}],['m29','Cartes','Obtiens un module brillant',s=>[s.stats.shiny||0,1],{tok:4}],
 ['m30','Cartes','Obtiens un module Légendaire ou mieux',s=>[(s.stats.best||0)>=4?1:0,1],{cr:8000,tok:10}],
 ['m31','Cartes','Fusionne 3 fois des modules',s=>[s.stats.fuseN||0,3],{cr:2500,tok:2}],['m32','Cartes','Recycle 20 modules',s=>[s.stats.recyN||0,20],{cr:1500}],
 ['m33','Cartes','Monte 6 modules sur une même voiture',s=>[s.stats.eq||0,6],{cr:3500,tok:3}],['m34','Cartes','Équipe les 11 emplacements d’une voiture',s=>[s.stats.eq||0,11],{cr:15000,tok:10}],
 ['m46','Cartes','Remplis 20 cases de l’album',s=>[Object.values(s.alb||{}).reduce((t,b)=>{let c=0; while(b){c+=b&1; b>>=1;} return t+c;},0),20],{cr:3000,tok:3}],
 ['m35','Collection','Possède 5 voitures',s=>[s.cars.length,5],{cr:3000}],['m36','Collection','Possède 10 voitures',s=>[s.cars.length,10],{cr:15000,tok:5}],
 ['m37','Collection','Possède une Supercar',s=>[s.cars.some(c=>M[c.mid].t>=5)?1:0,1],{cr:25000,tok:5}],
 ['m38','Progression','Atteins le niveau 5',s=>[s.lvl,5],{cr:2500}],['m39','Progression','Atteins le niveau 20',s=>[s.lvl,20],{cr:40000,tok:10}],
 ['m47','Progression','Joue 3 jours de suite',s=>[s.streak||0,3],{cr:1500,tok:2}],['m48','Progression','Joue 7 jours de suite',s=>[s.streak||0,7],{cr:5000,tok:5}],
 ['m40','Économie','Gagne 50 000 cr en course',s=>[s.stats.earned||0,50000],{cr:5000}],['m41','Économie','Gagne 500 000 cr en course',s=>[s.stats.earned||0,500000],{cr:40000,tok:10}],
 ['m42','Économie','Répare 5 fois',s=>[s.stats.repN||0,5],{cr:600}],['m43','Économie','Vends une voiture',s=>[s.stats.sellN||0,1],{cr:500}],
 ['m44','Économie','Construis le Banc de puissance',s=>[s.bat.banc||0,1],{cr:3000}],['m45','Économie','Achète 3 pièces au marché',s=>[s.stats.shopN||0,3],{cr:1500}],
 ['m51','Économie','Garde 100 000 cr en banque',s=>[s.cr,100000],{tok:5}],['m50','Économie','Podiums : niveau Or',s=>[s.pod.tier,5],{cr:50000,tok:10}]];
MISS2.forEach(m=>MISSIONS.push({id:m[0],t:m[2],p:m[3],g:m[4]}));
const MCAT={m1:'Débuts',m2:'Débuts',m3:'Débuts',m4:'Débuts',m6:'Débuts',m11:'Débuts',m5:'Course',m7:'Course',m16:'Course',m8:'Collection',m10:'Collection',m9:'Progression',m12:'Progression',m13:'Cartes',m14:'Cartes',m15:'Cartes'};
MISS2.forEach(m=>MCAT[m[0]]=m[1]);
function vMissions(){
  questsEnsure();
  const can=S.daily!==dayKey(), dr=dailyReward();
  const qRow=(box,key,L,id)=>{ const q=L.find(x=>x.id===id), a=Math.min(qProg(box,q),q.n), done=a>=q.n, got=box.cl[id], g=qRew(q);
    return `<div class="row ${got?'done locked':''}"><span class="grow"><span class="ttl">${q.t}</span><br><span class="sub">Récompense : ${gText(g)}</span>${got?'':`<div class="prog"><i style="width:${a/q.n*100}%"></i></div>`}</span>
      ${got?'<span class="sub">Terminé</span>':done?`<button class="btn sm good" data-a="qclaim" data-k="${key}" data-id="${id}">Récupérer</button>`:`<span class="num">${fmt(a)} / ${fmt(q.n)}</span>`}</div>`; };
  const mRow=m=>{ const [a,b]=m.p(S), done=a>=b, got=S.claimed[m.id];
    return `<div class="row ${got?'done locked':''}"><span class="grow"><span class="ttl">${m.t}</span><br><span class="sub">Récompense : ${gText(m.g)}</span>
      ${got?'':`<div class="prog"><i style="width:${clamp(a/b*100,0,100)}%"></i></div>`}</span>
      ${got?'<span class="sub">Terminée</span>':done?`<button class="btn sm good" data-a="claim" data-id="${m.id}">Récupérer</button>`:`<span class="num">${fmt(Math.min(a,b))} / ${fmt(b)}</span>`}</div>`; };
  const cats=['Débuts','Course','Cartes','Collection','Économie','Progression'];
  const left=MISSIONS.filter(m=>!S.claimed[m.id]).length;
  return `<div class="head"><h2>Missions</h2><p>${left} objectif${left>1?'s':''} restant${left>1?'s':''}</p></div>
  ${claimBar()}<button class="row" data-a="pilot"><span class="ico">🏅</span><span class="grow"><span class="ttl">Carte pilote</span><br><span class="sub">Titre, succès et arbre de compétences${skAvail()>0?`. ${skAvail()} point${skAvail()>1?'s':''} à dépenser`:''}${bdgReady()?`. ${bdgReady()} succès à récupérer`:''}</span></span><span class="gain">Ouvrir</span></button>
  <div class="row ${can?'':'locked'}"><span class="ico">🎁</span><span class="grow"><span class="ttl">Récompense du jour</span><br><span class="sub">${cr(dr.cr)}, ${dr.xp} XP et ${dr.tok} 🎟. Série en cours : ${S.streak||0} jour${(S.streak||0)>1?'s':''}. Un bonus tous les 7 jours.</span></span>${can?`<button class="btn sm good" data-a="daily">Récupérer</button>`:'<span class="sub">Reviens demain</span>'}</div>
  <div class="sec"><h3>Défis du jour</h3>${S.dq.ids.map(id=>qRow(S.dq,'dq',DQ,id)).join('')}</div>
  <div class="sec"><h3>Défis de la semaine</h3>${S.wq.ids.map(id=>qRow(S.wq,'wq',WQ,id)).join('')}</div>
  ${cats.map(ct=>{ const ms=MISSIONS.filter(m=>(MCAT[m.id]||'Débuts')===ct).sort((a,b)=>(S.claimed[a.id]?1:0)-(S.claimed[b.id]?1:0)); return ms.length?`<div class="sec"><h3>${ct}</h3>${ms.map(mRow).join('')}</div>`:''; }).join('')}`;
}

/* ---- marché : voitures, pièces, services ---- */
let mTab='cars';
const SHOP_P=[100,400,1700,9000];
function shopMod(r){
  const T=MODT[rint(0,MODT.length-1)], m={u:0,t:T[0],r,q:Math.round(rnd(.85,1.15)*100)/100};
  if(r>=2){const ks=['ch','nm','adh','fre','man','fia','sty','kg']; m.s=[ks[rint(0,ks.length-1)],Math.round(rnd(.25,.55)*100)/100];}
  return m;
}
function shopRoll(){
  const items=[], W=[55,28,13,4];
  for(let i=0;i<6;i++){ let x=Math.random()*100, r=0; for(;r<3;r++){x-=W[r]; if(x<0) break;} r=Math.min(r,3); const m=shopMod(r); items.push({m,p:Math.round(SHOP_P[r]*(1-.05*pk('shopd'))*(.9+m.q*.12)/10)*10}); }
  items.sort((a,b)=>b.m.r-a.m.r); S.shop={k:dayKey(),items};
}
const fleetRepair=()=>S.cars.reduce((t,c)=>t+Math.ceil((100-c.etat)*repUnit(c)*.85),0);
function vMarche(){
  if(!S.offres.length) newOffres(); if(!S.shop||S.shop.k!==dayKey()) shopRoll();
  const tabs=`<div class="subtabs">${[['cars','🚗 Voitures'],['parts','🔩 Pièces'],['serv','🛠️ Services']].map(([id,n])=>`<button data-a="mtab" data-id="${id}" ${mTab===id?'aria-current="true"':''}>${n}</button>`).join('')}</div>`;
  let body='';
  if(mTab==='cars'){
    const refresh=100*S.bat.casse, cl=S.bat.concession, neuves=cl?CARS.filter(m=>m.t<=cl+1):[];
    body=`<h3>Casse automobile</h3><p class="note">Des épaves à retaper. Les offres changent toutes les 3 épreuves.</p>
    <div class="grid">${S.offres.map((o,i)=>`<div>${cardHTML({mid:o.mid,etat:o.etat,lvl:1,up:{}},{tag:'div'})}
       <button class="btn wide sm" style="margin-top:6px" data-a="buy" data-id="${i}" ${S.cr<o.prix?'disabled':''}>Acheter ${cr(o.prix)}</button></div>`).join('')}</div>
    <button class="btn alt sm" style="margin-top:12px" data-a="refresh" ${S.cr<refresh?'disabled':''}>Voir d’autres épaves, ${cr(refresh)}</button>
    <div class="sec"><h3>Concession</h3>${cl?`<p class="note">Voitures neuves, 100 % d’état.</p><div class="grid">${neuves.map(m=>`<div>${cardHTML({mid:m.id,etat:100,lvl:1,up:{}},{tag:'div'})}
       <button class="btn wide sm" style="margin-top:6px" data-a="buynew" data-id="${m.id}" ${S.cr<m.val?'disabled':''}>Acheter ${cr(m.val)}</button></div>`).join('')}</div>`
       :`<p class="note">Construis la concession dans Atelier › Base pour acheter des voitures neuves.</p>`}</div>`;
  } else if(mTab==='parts'){
    body=`<h3>Boutique de pièces</h3><p class="note">Un stock de modules qui change chaque jour. Pas de hasard : tu vois ce que tu achètes. Pas de Légendaire ici, il faut les gagner dans les paquets.</p>
    <div class="mods">${S.shop.items.map((it,i)=>modHTML(it.m,`<button class="btn sm" data-a="shopbuy" data-id="${i}" ${S.cr<it.p?'disabled':''}>Acheter, ${cr(it.p)}</button>`)).join('')||'<p class="note">Stock épuisé.</p>'}</div>
    <button class="btn alt sm" style="margin-top:12px" data-a="shoproll" ${S.cr<400?'disabled':''}>Renouveler le stock, ${cr(400)}</button>
    <div class="sec"><h3>Atelier de fabrication</h3><p class="note">La ferraille des modules recyclés sert à fabriquer le module de ton choix.</p>
    <div class="row"><span class="ico">♻️</span><span class="grow"><span class="ttl">Ferraille : ${fmt(S.scrap)}</span><br><span class="sub">Fabrication à partir de ${craftCost(0)} ferraille. L’entrepôt la rend moins chère.</span></span><button class="btn sm" data-a="craftopen">Fabriquer</button></div></div>`;
  } else {
    const fr=fleetRepair(), need=S.cars.some(c=>c.etat<100);
    body=`<h3>Services</h3>
    <div class="row"><span class="ico">⚡</span><span class="grow"><span class="ttl">Bouteilles de nitro</span><br><span class="sub">${String(NITRO_DUREE).replace('.',',')} s de poussée. En stock : ${S.nitro}</span></span>
      <span class="pkb"><button class="btn sm" data-a="buynitro" data-id="1" ${S.cr<NITRO_PRIX?'disabled':''}>×1 · ${cr(NITRO_PRIX)}</button><button class="btn sm alt" data-a="buynitro" data-id="5" ${S.cr<650?'disabled':''}>×5 · ${cr(650)}</button><button class="btn sm alt" data-a="buynitro" data-id="12" ${S.cr<1500?'disabled':''}>×12 · ${cr(1500)}</button></span></div>
    <div class="row"><span class="ico">🔧</span><span class="grow"><span class="ttl">Révision de tout le garage</span><br><span class="sub">Remet toutes tes voitures à 100 %, 15 % moins cher que séparément.</span></span><button class="btn sm" data-a="fleetrep" ${!need||S.cr<fr?'disabled':''}>${need?cr(fr):'Rien à faire'}</button></div>
    <div class="row"><span class="ico">🛡️</span><span class="grow"><span class="ttl">Entretien préventif</span><br><span class="sub">Usure réduite de 70 % sur les 3 prochaines épreuves.${S.ins>0?` Actif : ${S.ins} restante${S.ins>1?'s':''}.`:''}</span></span><button class="btn sm" data-a="insure" ${S.cr<900?'disabled':''}>${cr(900)}</button></div>
    <div class="row"><span class="ico">🎓</span><span class="grow"><span class="ttl">Coach de pilotage</span><br><span class="sub">+50 % d’expérience sur les 3 prochaines épreuves.${S.xpb>0?` Actif : ${S.xpb} restante${S.xpb>1?'s':''}.`:''}</span></span><button class="btn sm" data-a="coach" ${S.cr<1200?'disabled':''}>${cr(1200)}</button></div>
    <div class="sec"><h3>Reprise</h3><p class="note">Revends tes modules en trop. Les modules montés et les brillants sont gardés.</p>
    <div class="row"><span class="ico">💱</span><span class="grow"><span class="ttl">Tous les Communs et Peu communs non montés</span><br><span class="sub">${S.mods.filter(m=>m.r<=1&&!m.sh&&m.un==null&&!eqCar(m.u)).length} modules concernés, payés en crédits.</span></span><button class="btn sm" data-a="sellmods" ${S.mods.some(m=>m.r<=1&&!m.sh&&m.un==null&&!eqCar(m.u))?'':'disabled'}>Vendre</button></div></div>`;
  }
  return `<div class="head"><h2>Marché</h2><p>${cr(S.cr)}</p></div>${tabs}${body}`;
}

/* ======================================================================
   v0.10 : atelier de tuning, icônes 3D, ouverture de paquet, pièces visibles, tout récupérer
   ====================================================================== */

/* ---- icônes 3D (SVG en couches empilées en profondeur, teintées par la rareté) ---- */
const ICO_SPRITE=`<svg id="icospr" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f5ff"/><stop offset=".42" stop-color="#9aa6c6"/><stop offset="1" stop-color="#3b4362"/></linearGradient>
<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#58628a"/><stop offset="1" stop-color="#171a2c"/></linearGradient>
<radialGradient id="gk" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#3a4262"/><stop offset="1" stop-color="#0b0d18"/></radialGradient></defs>
<symbol id="ic-moteur" viewBox="0 0 64 64"><rect x="8" y="28" width="42" height="24" rx="4" fill="url(#gm)"/><rect x="10" y="12" width="38" height="4" rx="2" fill="url(#gm)"/>
<g fill="url(#gd)" stroke="var(--rc)" stroke-width="1.8"><rect x="12" y="16" width="9" height="13" rx="2"/><rect x="25" y="16" width="9" height="13" rx="2"/><rect x="38" y="16" width="9" height="13" rx="2"/></g>
<circle cx="54" cy="40" r="7" fill="url(#gd)" stroke="var(--rc)" stroke-width="2"/><circle cx="54" cy="40" r="2.4" fill="var(--rc)"/><path d="M12 40h34" stroke="var(--rc)" stroke-width="2.4" stroke-linecap="round"/><rect x="12" y="45" width="30" height="3" rx="1.5" fill="#0b0d16" opacity=".45"/></symbol>
<symbol id="ic-turbo" viewBox="0 0 64 64"><path d="M44 22 L58 10 L63 21 L50 31Z" fill="url(#gm)"/><circle cx="30" cy="34" r="23" fill="url(#gm)"/><circle cx="30" cy="34" r="18" fill="url(#gk)" stroke="var(--rc)" stroke-width="2"/>
<g stroke="var(--rc)" stroke-width="3.2" stroke-linecap="round" fill="none"><path id="tb" d="M30 34 q9 -1 11 -12"/><path d="M30 34 q9 -1 11 -12" transform="rotate(60 30 34)"/><path d="M30 34 q9 -1 11 -12" transform="rotate(120 30 34)"/><path d="M30 34 q9 -1 11 -12" transform="rotate(180 30 34)"/><path d="M30 34 q9 -1 11 -12" transform="rotate(240 30 34)"/><path d="M30 34 q9 -1 11 -12" transform="rotate(300 30 34)"/></g><circle cx="30" cy="34" r="4" fill="url(#gm)"/></symbol>
<symbol id="ic-echap" viewBox="0 0 64 64"><path d="M4 46 H30 Q38 46 38 38 V34" fill="none" stroke="#56607f" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 44 H30 Q36 44 36 38 V34" fill="none" stroke="#b9c4e2" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 22 L56 12 L60 52 L36 44Z" fill="url(#gd)" stroke="var(--rc)" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="57" cy="32" rx="3.6" ry="14" fill="#06070e" stroke="var(--rc)" stroke-width="1.6"/><path d="M60 24 q4 8 0 16 q8 -8 0 -16z" fill="var(--rc)" opacity=".9"/></symbol>
<symbol id="ic-pneus" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#0b0d16" stroke="#3b4260" stroke-width="3"/><circle cx="32" cy="32" r="26" fill="none" stroke="#6a7396" stroke-width="3.4" stroke-dasharray="5 3.2"/>
<circle cx="32" cy="32" r="19" fill="none" stroke="var(--rc)" stroke-width="2.2"/><circle cx="32" cy="32" r="14" fill="url(#gm)"/><circle cx="32" cy="32" r="5" fill="url(#gd)" stroke="var(--rc)" stroke-width="1.6"/><g fill="#0b0d16"><circle cx="32" cy="21" r="1.8"/><circle cx="42" cy="28" r="1.8"/><circle cx="38" cy="40" r="1.8"/><circle cx="26" cy="40" r="1.8"/><circle cx="22" cy="28" r="1.8"/></g></symbol>
<symbol id="ic-freins" viewBox="0 0 64 64"><circle cx="30" cy="34" r="24" fill="url(#gm)"/><circle cx="30" cy="34" r="10" fill="url(#gd)"/><circle cx="30" cy="34" r="3.5" fill="#0b0d16"/><g fill="#0b0d16"><circle cx="30" cy="19" r="2.2"/><circle cx="40.6" cy="23.4" r="2.2"/><circle cx="45" cy="34" r="2.2"/><circle cx="40.6" cy="44.6" r="2.2"/><circle cx="30" cy="49" r="2.2"/><circle cx="19.4" cy="44.6" r="2.2"/><circle cx="15" cy="34" r="2.2"/><circle cx="19.4" cy="23.4" r="2.2"/></g>
<path d="M42 9 a26 26 0 0 1 14 22 l-10 2 a16 16 0 0 0 -7 -13z" fill="var(--rc)" stroke="#06070e" stroke-width="1.2"/><rect x="47" y="14" width="6" height="3" rx="1.5" fill="#fff" opacity=".5" transform="rotate(35 50 15)"/></symbol>
<symbol id="ic-susp" viewBox="0 0 64 64"><rect x="28" y="6" width="8" height="52" rx="3" fill="url(#gm)"/><rect x="24" y="10" width="16" height="18" rx="4" fill="url(#gd)" stroke="var(--rc)" stroke-width="1.8"/>
<path d="M17 28 L47 33 L17 38 L47 43 L17 48 L47 53" fill="none" stroke="#06070e" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" opacity=".5"/><path d="M17 28 L47 33 L17 38 L47 43 L17 48 L47 53" fill="none" stroke="var(--rc)" stroke-width="4.4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="32" cy="8" r="5.5" fill="url(#gm)" stroke="var(--rc)" stroke-width="1.8"/><circle cx="32" cy="57" r="5.5" fill="url(#gm)" stroke="var(--rc)" stroke-width="1.8"/></symbol>
<symbol id="ic-chassis" viewBox="0 0 64 64"><g fill="none" stroke="#06070e" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity=".5"><path d="M10 56 V32 L22 12 H42 L54 32 V56 M10 32 H54 M10 56 L54 32 M54 56 L10 32"/></g>
<g fill="none" stroke="#aeb9d8" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 56 V32 L22 12 H42 L54 32 V56 M10 32 H54 M22 12 L10 32 M42 12 L54 32 M10 56 L54 32 M54 56 L10 32"/></g>
<g fill="url(#gk)" stroke="var(--rc)" stroke-width="2.2"><circle cx="10" cy="32" r="4"/><circle cx="54" cy="32" r="4"/><circle cx="22" cy="12" r="4"/><circle cx="42" cy="12" r="4"/><circle cx="32" cy="32" r="4"/></g></symbol>
<symbol id="ic-aero" viewBox="0 0 64 64"><rect x="24" y="38" width="5" height="18" rx="2" fill="url(#gd)"/><rect x="36" y="38" width="5" height="18" rx="2" fill="url(#gd)"/><rect x="18" y="54" width="28" height="4" rx="2" fill="url(#gd)"/>
<path d="M10 33 H54 L58 38 H6Z" fill="url(#gd)" stroke="var(--rc)" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 22 H56 L61 31 H3Z" fill="url(#gm)" stroke="var(--rc)" stroke-width="1.8" stroke-linejoin="round"/>
<rect x="3" y="12" width="6" height="28" rx="2" fill="var(--rc)"/><rect x="55" y="12" width="6" height="28" rx="2" fill="var(--rc)"/><rect x="12" y="25" width="40" height="2.4" rx="1.2" fill="#fff" opacity=".6"/></symbol>
<symbol id="ic-nitro" viewBox="0 0 64 64"><rect x="26" y="10" width="12" height="12" rx="3" fill="url(#gd)"/><circle cx="32" cy="8" r="5.6" fill="var(--rc)" stroke="#06070e" stroke-width="1.4"/><path d="M38 8 q14 -2 16 12" fill="none" stroke="var(--rc)" stroke-width="3" stroke-linecap="round"/>
<rect x="18" y="20" width="28" height="40" rx="10" fill="url(#gm)"/><rect x="18" y="31" width="28" height="15" fill="var(--rc)"/><rect x="21" y="24" width="4" height="32" rx="2" fill="#fff" opacity=".35"/><path d="M35 32 L27 41 H32 L29 49 L38 39 H33Z" fill="#fff" stroke="#06070e" stroke-width="1" stroke-linejoin="round"/></symbol>
<symbol id="ic-jantes" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="url(#gk)" stroke="var(--rc)" stroke-width="3"/><circle cx="32" cy="32" r="24" fill="none" stroke="#b9c4e2" stroke-width="1.6"/>
<g stroke="#06070e" stroke-width="9" stroke-linecap="round" opacity=".5"><path d="M32 32 V9"/><path d="M32 32 V9" transform="rotate(72 32 32)"/><path d="M32 32 V9" transform="rotate(144 32 32)"/><path d="M32 32 V9" transform="rotate(216 32 32)"/><path d="M32 32 V9" transform="rotate(288 32 32)"/></g>
<g stroke="#d7dff5" stroke-width="6" stroke-linecap="round"><path d="M32 32 V10"/><path d="M32 32 V10" transform="rotate(72 32 32)"/><path d="M32 32 V10" transform="rotate(144 32 32)"/><path d="M32 32 V10" transform="rotate(216 32 32)"/><path d="M32 32 V10" transform="rotate(288 32 32)"/></g>
<circle cx="32" cy="32" r="8" fill="url(#gm)" stroke="var(--rc)" stroke-width="2"/><circle cx="32" cy="32" r="2.6" fill="#0b0d16"/></symbol>
<symbol id="ic-peinture" viewBox="0 0 64 64"><g fill="var(--rc)" opacity=".85"><circle cx="9" cy="14" r="2.6"/><circle cx="15" cy="9" r="2"/><circle cx="6" cy="22" r="2"/><circle cx="14" cy="19" r="3.2"/><circle cx="20" cy="13" r="1.8"/><circle cx="10" cy="28" r="1.6"/><circle cx="19" cy="24" r="2.2"/></g>
<rect x="26" y="8" width="7" height="8" rx="2" fill="url(#gd)"/><rect x="25" y="14" width="22" height="12" rx="3" fill="url(#gd)" stroke="var(--rc)" stroke-width="1.8"/><rect x="25" y="25" width="22" height="34" rx="6" fill="var(--rc)"/><rect x="25" y="25" width="22" height="34" rx="6" fill="url(#gd)" opacity=".28"/>
<rect x="29" y="28" width="4.5" height="28" rx="2.2" fill="#fff" opacity=".42"/><circle cx="38" cy="42" r="6" fill="#fff" opacity=".85"/><path d="M38 37 q4 5 0 10 q-4 -5 0 -10z" fill="var(--rc)"/></symbol>
</svg>`;
function ico(id,rc,sz,live){
  const u=`<svg viewBox="0 0 64 64"><use href="#ic-${id}"/></svg>`;
  return `<span class="i3${live?' live':''}" style="--rc:${rc};--s:${sz||48}px"><i class="fl"></i><span class="st"><b class="ly l3">${u}</b><b class="ly l2">${u}</b><b class="ly l1">${u}</b></span></span>`;
}
(function(){ if(!document.getElementById('icospr')) document.body.insertAdjacentHTML('afterbegin',ICO_SPRITE); })();

/* ---- ce que chaque module change visuellement ---- */
const VIS={mo1:'',tu1:'Entrée d’air sur le capot',tu2:'Double entrée d’air',tu3:'Compresseur sur le capot',ec1:'Sortie d’échappement',ec2:'Sorties d’échappement',ec3:'Sorties d’échappement',
  su1:'Caisse abaissée',su2:'Caisse légèrement abaissée',su3:'Caisse surélevée, garde au sol rallye',ja1:'Jantes forgées',ja2:'Grosses jantes',ja3:'Jantes XXL néon',
  ae1:'Lame avant',ae2:'Aileron arrière',ae3:'Bas de caisse larges',ch1:'Arceau et pare-buffle',ch2:'Capot carbone',ch3:'Ailes élargies',
  ni1:'Bouteille visible, flamme teintée',ni2:'Bouteille visible, flamme teintée',ni3:'Bouteille visible, flamme teintée',pe1:'Peinture nacrée aux couleurs de la rareté',pe2:'Teinte mate et néon sous la caisse',pe3:'Bandes de course'};
const visOf=m=>'';

/* ---- apparence : suspension, châssis, jantes plus grandes, néons ---- */
/* les modules ne changent plus l'apparence : seulement les statistiques */
carLook=function(c){ if(!c) return {}; if(c.lk) return c.lk; const L={}; if(c.sh) L.shiny=1; return L; };
rndLook=function(lv){ return {}; };
function addLook(g,D,look,wheels){
  if(!look) return;
  const j=look.jantes, s=look.susp, ch=look.chassis, pe=look.peinture, ni=look.nitro;
  const par=wheels[0]&&wheels[0].parent, glb=!!par&&par!==g, ps=glb?(par.scale.y||1):1;
  let ws=j?({ja1:1.05,ja2:1.17,ja3:1.3}[j.t]||1)+.012*j.r:1; if(s&&s.t==='su3') ws*=1.08;
  if(ws!==1) wheels.forEach(w=>{ w.scale.multiplyScalar(ws); w.position.y+=D.wr*(ws-1)/ps; });
  addLook0(g,D,look,wheels);
  const L=D.x1-D.x0, mx=(D.x0+D.x1)/2, dark=new THREE.MeshLambertMaterial({color:0x14151b}), neon=r=>new THREE.MeshBasicMaterial({color:new THREE.Color(RCOL[r])});
  const box=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); g.add(m); return m;};
  if(ch){
    if(ch.t==='ch1'){ [1,-1].forEach(sd=>box(L*.34,.04,.04,ch.r>=3?neon(ch.r):dark,mx-.04*L,D.H+.05,sd*D.W*.3)); box(.04,.04,D.W*.6,dark,mx+.13*L,D.H+.05,0); box(.04,.04,D.W*.6,dark,mx-.21*L,D.H+.05,0);
      box(.06,.12,D.W*.84,ch.r>=2?neon(ch.r):dark,D.x1+.05,.34,0); [1,-1].forEach(sd=>box(.05,.22,.05,dark,D.x1+.04,.3,sd*D.W*.3)); }
    else if(ch.t==='ch2'){ box(L*.28,.014,D.W*.42,dark,D.x1-.18*L,D.hood+.014,0); if(ch.r>=2) [1,-1].forEach(sd=>box(L*.28,.016,.02,neon(ch.r),D.x1-.18*L,D.hood+.018,sd*D.W*.21)); box(.3,.014,D.W*.9,dark,D.x0+.1*L,D.deck+.012,0); }
    else wheels.forEach(w=>{ const sg=w.position.z>=0?1:-1, rr=D.wr*ws; box(rr*2.15,.08,.12,dark,w.position.x,rr*1.95+.02,sg*(D.W/2+.03)); if(ch.r>=2) box(rr*2.15,.02,.02,neon(ch.r),w.position.x,rr*1.95-.03,sg*(D.W/2+.09)); });
  }
  if(pe&&pe.t==='pe3'){ const mt=neon(pe.r), wm=new THREE.MeshBasicMaterial({color:0xf4f6ff}); [[D.x1-.2*L,D.hood+.016],[D.x0+.16*L,D.deck+.016]].forEach(q=>{ box(L*.3,.012,.1*D.W,wm,q[0],q[1],-.14*D.W); box(L*.3,.012,.1*D.W,mt,q[0],q[1],.0); box(L*.3,.012,.1*D.W,wm,q[0],q[1],.14*D.W); }); }
  if(ni){ const bm=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.5,10),neon(ni.r)); bm.rotation.x=Math.PI/2; bm.position.set(D.x0+.2*L,D.deck+.09,.0); g.add(bm); box(.1,.04,.22,dark,D.x0+.2*L,D.deck+.03,0); }
  /* assiette : abaisse ou surélève la caisse, les roues restent au sol */
  let dy=0; if(s) dy={su1:-(.055+.012*s.r),su2:-(.03+.006*s.r),su3:.07+.014*s.r}[s.t]||0; if(glb) dy=Math.max(dy,-.09);
  if(dy){ g.children.slice().forEach(o=>{ if(wheels.includes(o)) return; if(o.geometry&&o.geometry.type==='PlaneGeometry'&&o.material&&o.material.blending===THREE.AdditiveBlending) return; o.position.y+=dy; });
    if(glb) wheels.forEach(w=>{ w.position.y-=dy/ps; }); }
  if(pe&&pe.t==='pe2'){ const ug=new THREE.Mesh(new THREE.PlaneGeometry(L*.96,D.W*1.2),new THREE.MeshBasicMaterial({color:new THREE.Color(RCOL[pe.r]),transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false})); ug.rotation.x=-Math.PI/2; ug.position.set(mx,.045,0); g.add(ug); }
}

/* ---- modules : carte avec icône 3D ---- */
function modHTML(m,act){
  const sl=SLOTS.find(s=>s[0]===MODI[m.t][1]), fx=modFx(m), on=eqCar(m.u), rc=RAR[m.r].c, vs=visOf(m);
  return `<div class="mod mod3 ${m.sh?'shiny':''} ${m.un!=null?'uniq':''}" style="--rc:${rc}">
    <div class="m3h">${ico(sl[0],rc,50,m.r>=3)}<div class="m3t"><span class="rar">${RAR[m.r].n}${m.sh?' ✨':''}</span><div class="mod-name">${modName(m)}</div><span class="slotn">${sl[1]}${m.un!=null?`, unique n° ${String(m.sn).padStart(3,'0')}`:''}</span></div></div>
    ${vs?`<div class="vis">🔧 ${vs}</div>`:''}
    <div class="mod-fx">${Object.keys(fx).map(k=>`<span class="${fx[k]<0?'neg':''}">${fxText(k,fx[k])}</span>`).join('')}</div>
    ${m.un!=null?`<div class="mod-eq">${UNIQ[m.un].d}</div>`:''}${on?`<div class="mod-eq">Monté sur ${M[on.mid].nom}</div>`:''}${act||''}</div>`;
}
const tilesHTML=c=>`<div class="tiles">${SLOTS.map(sl=>{const mm=modOf((c.mods||{})[sl[0]]), rc=mm?RAR[mm.r].c:'#4a5280';
  return `<button class="tile ${mm?'on':''}" style="--rc:${rc}" data-a="modslot" data-id="${sl[0]}">${ico(sl[0],rc,46)}<b>${sl[1]}</b><small>${mm?modName(mm)+(mm.sh?' ✨':''):'Vide'}</small>${mm?`<i class="tr"></i>`:''}</button>`;}).join('')}</div>`;

/* ---- atelier de tuning ---- */
const dChip=(lab,a,b,unit,inv)=>{ const d=Math.round(b-a), good=inv?d<0:d>0; return `<span class="dc ${d===0?'':good?'up':'dn'}">${lab} <b>${fmt(Math.round(b))}${unit}</b>${d?` <i>${d>0?'+':'−'}${fmt(Math.abs(d))}</i>`:''}</span>`; };
function tuneCar(c,slot,pv){ const mods=Object.assign({},c.mods||{}); if(pv) mods[slot]=pv; return Object.assign({},c,{mods,lk:undefined}); }
function tvwHTML(c){
  const slot=sheet.slot, cur=c.mods&&c.mods[slot], pv=sheet.pv&&sheet.pv!==cur?sheet.pv:null, tc=tuneCar(c,slot,pv), s0=st(c), s1=st(tc), sl=SLOTS.find(x=>x[0]===slot);
  const rc=pv?RAR[modOf(pv).r].c:'#00e5ff';
  return `<div class="tvw ${sheet.flash?'flash':''}" style="--rc:${rc}"><div class="tvimg">${thArt(tc)}</div><div class="tscan"></div><div class="tcorner a"></div><div class="tcorner b"></div>
    <div class="tname"><b>${M[c.mid].nom}</b><span>${pv?'Essai : '+modName(modOf(pv)):'Équipement actuel'}</span></div>
    <div class="tdelta">${dChip('Puissance',s0.ch,s1.ch,' ch')}${dChip('Poids',s0.kg,s1.kg,' kg',1)}${dChip('Vmax',s0.vmax,s1.vmax,' km/h')}${dChip('Adhérence',s0.adh,s1.adh,'')}${dChip('Style',s0.sty,s1.sty,'')}</div></div>`;
}
function tbarHTML(c){
  const slot=sheet.slot, cur=c.mods&&c.mods[slot], pv=sheet.pv&&sheet.pv!==cur?modOf(sheet.pv):null, o=pv&&eqOther(pv.u,c);
  if(pv) return `<button class="btn ${o?'mag':'good'} grow2" data-a="tequip">${o?`Reprendre à ${M[o.mid].nom}`:'Monter'} : ${modName(pv)}</button><button class="btn alt" data-a="tprev" data-id="${pv.u}">Annuler</button>`;
  return `<button class="btn alt" data-a="car" data-id="${c.uid}">← Voiture</button><button class="btn good" data-a="eqbest" data-id="${c.uid}">⚡ Meilleures pièces</button>${cur?`<button class="btn danger" data-a="tunun">Retirer</button>`:''}`;
}
function tcardHTML(m,c){
  const cur=c.mods&&c.mods[sheet.slot], o=eqOther(m.u,c), rc=RAR[m.r].c, fx=modFx(m), keys=Object.keys(fx).slice(0,3), isCur=m.u===cur, sel=sheet.pv===m.u||(!sheet.pv&&isCur), vs=visOf(m);
  const cm=cur&&modOf(cur), d=cm?Math.round((modPow(m)/Math.max(.01,modPow(cm))-1)*100):null;
  return `<button class="tcard ${sel?'sel':''} ${isCur?'cur':''}" style="--rc:${rc}" data-a="tprev" data-id="${m.u}">${ico(MODI[m.t][1],rc,54,sel)}
    <span class="tc"><span class="tcn">${modName(m)}${m.sh?' ✨':''}</span><span class="tcr">${RAR[m.r].n}${m.un!=null?' · unique':''}</span>
      <span class="tcf">${keys.map(k=>`<i class="${fx[k]<0?'neg':''}">${fxText(k,fx[k])}</i>`).join('')}</span>${vs?`<span class="tcv">🔧 ${vs}</span>`:''}</span>
    <span class="tcs">${isCur?'<em class="on">Monté</em>':o?`<em class="oth">Sur ${M[o.mid].nom.split(' ')[0]}</em>`:d!=null?`<em class="${d>=0?'up':'dn'}">${d>=0?'▲ +':'▼ −'}${Math.abs(d)} %</em>`:''}</span></button>`;
}
function tuneSheets(X){
  const el=$('sheet');
  if(sheet.t==='modpick'){ sheet.t='tune'; sheet.pv=null; }
  if(sheet.t==='tune'){
    const c=car(sheet.uid); if(!c){closeSheet(); return true;} const slot=sheet.slot||SLOTS[0][0], cur=c.mods&&c.mods[slot];
    sheet.slot=slot;
    const list=S.mods.filter(m=>MODI[m.t][1]===slot).sort((a,b)=>(b.u===cur)-(a.u===cur)||(!!eqOther(a.u,c))-(!!eqOther(b.u,c))||b.r-a.r||modPow(b)-modPow(a));
    el.innerHTML=`${X}<h2>Atelier de tuning</h2><div id="tvw">${tvwHTML(c)}</div>
      <div class="tstrip">${SLOTS.map(sl=>{const mm=modOf((c.mods||{})[sl[0]]), rc=mm?RAR[mm.r].c:'#4a5280'; return `<button class="ts ${sl[0]===slot?'on':''} ${mm?'eq':''}" style="--rc:${rc}" data-a="tslot" data-id="${sl[0]}">${ico(sl[0],rc,36)}<small>${sl[1]}</small></button>`;}).join('')}</div>
      <div class="thead"><b>${SLOTS.find(s=>s[0]===slot)[1]}</b><span>${list.length} module${list.length>1?'s':''}</span></div>
      <div class="tlist">${list.length?list.slice(0,60).map(m=>tcardHTML(m,c)).join(''):`<div class="tempty">Aucun module de ce type. Ouvre des paquets pour en trouver.<button class="btn sm" data-a="tab" data-id="cartes">Aller aux paquets</button></div>`}</div>
      <div class="tbar" id="tbar">${tbarHTML(c)}</div>`;
    const on=el.querySelector('.ts.on'); if(on&&on.scrollIntoView) try{ on.scrollIntoView({block:'nearest',inline:'center'}); }catch(_){ }
    return true;
  }
  if(sheet.t==='open') return openStage(X);
  return false;
}
function tuneRefresh(){
  const c=car(sheet.uid), a=$('tvw'), b=$('tbar'); if(!c||!a||!b) return renderSheet();
  a.innerHTML=tvwHTML(c); b.innerHTML=tbarHTML(c);
  document.querySelectorAll('.tcard').forEach(e=>{ const u=+e.dataset.id, cur=c.mods&&c.mods[sheet.slot]; e.classList.toggle('sel',sheet.pv===u||(!sheet.pv&&u===cur)); });
}
Object.assign(ACT,{
  modslot(d){ openSheet({t:'tune',uid:sheet.uid,slot:d.id,pv:null}); },
  tslot(d){ sheet.slot=d.id; sheet.pv=null; sheet.flash=0; renderSheet(); },
  tprev(d){ const u=+d.id, c=car(sheet.uid); if(!c) return; sheet.pv=sheet.pv===u?null:u; sheet.flash=0; tuneRefresh(); const m=modOf(u); if(m&&sheet.pv) auTry(()=>auCard(Math.min(m.r,3),false,false)); },
  tequip(){ const c=car(sheet.uid), u=sheet.pv, m=modOf(u); if(!c||!m) return; if(eqOther(u,c)) return openSheet({t:'eqconf',uid:c.uid,slot:sheet.slot,u});
    equipMod(c,u,sheet.slot); sheet.pv=null; sheet.flash=1; bump('eqN'); save(); render(); renderSheet(); setTimeout(()=>{ if(sheet&&sheet.t==='tune') sheet.flash=0; },900); auTry(()=>auCard(m.r,m.sh,m.un!=null)); toast(`${modName(m)} montée`); },
  tunun(){ const c=car(sheet.uid); if(!c||!c.mods) return; delete c.mods[sheet.slot]; sheet.pv=null; save(); render(); renderSheet(); toast('Module retiré'); }
});

/* ---- ouverture d'un paquet : scène de révélation ---- */
const rcOf=m=>RAR[m.r].c;
function bigCard(m,anim){
  const sl=SLOTS.find(s=>s[0]===MODI[m.t][1]), fx=modFx(m), rc=rcOf(m), vs=visOf(m);
  return `<div class="bigc ${anim?'in':''} ${m.sh?'sh':''} ${m.un!=null?'un':''}" style="--rc:${rc}"><div class="foil"></div>
    <div class="bt"><span>${sl[1]}</span><span class="rar">${RAR[m.r].n}${m.sh?' ✨':''}</span></div>${ico(sl[0],rc,92,1)}
    <div class="bn">${modName(m)}</div>${m.un!=null?`<div class="bu">UNIQUE n° ${String(m.sn).padStart(3,'0')}</div>`:''}
    ${vs?`<div class="bv">🔧 ${vs}</div>`:''}<div class="bfx">${Object.keys(fx).slice(0,3).map(k=>`<span class="${fx[k]<0?'neg':''}">${fxText(k,fx[k])}</span>`).join('')}</div><div class="bq">Qualité ${Math.round(m.q*100)} %</div></div>`;
}
const backCard=(pk)=>{ const th=PKT[pk.id]||PKT.p1; return `<div class="bigc back in" style="--c1:${th.c1};--c2:${th.c2};--c3:${th.c3}"><div class="foil"></div><div class="bq0">R&amp;G</div><div class="bm">?</div><div class="bq1">${th.tag}</div></div>`; };
const burstHTML=m=>{ let s=''; const n=10+m.r*4; for(let k=0;k<n;k++){ const a=k/n*360+rint(-8,8), d=rint(90,190); s+=`<i style="--a:${a}deg;--d:${d}px;--w:${rint(4,9)}px"></i>`; } return `<div class="burst" style="--rc:${rcOf(m)}">${s}</div>`; };
function openStage(X){
  const n=sheet.cards.length, i=sheet.i, done=i>=n, pk=PACKS.find(p=>p.id===sheet.pk)||PACKS[0], el=$('sheet');
  const ms=sheet.cards.map(modOf).filter(Boolean);
  if(done){
    const best=ms.slice().sort((a,b)=>b.r-a.r||modPow(b)-modPow(a)), b0=best[0];
    el.innerHTML=`${X}<h2>${pk.nom}</h2><div class="orec" style="--rc:${b0?rcOf(b0):'#00e5ff'}"><div class="ohd">Résultat</div><p class="note" style="margin:0 0 10px">Meilleur tirage : <b style="color:${b0?rcOf(b0):'inherit'}">${b0?modName(b0):''}</b>${b0?` (${RAR[b0.r].n}${b0.sh?', brillant':''}${b0.un!=null?', unique':''})`:''}. Tout est dans ton inventaire.</p>
      <div class="rgrid">${best.map((m,k)=>{const sl=MODI[m.t][1]; return `<div class="rmini ${k===0?'top':''} ${m.sh?'sh':''}" style="--rc:${rcOf(m)};animation-delay:${k*70}ms">${ico(sl,rcOf(m),k===0?64:46,k===0)}<b>${modName(m)}</b><small>${RAR[m.r].n}${m.sh?' ✨':''}</small></div>`;}).join('')}</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><button class="btn alt" data-a="close">Fermer</button><button class="btn" data-a="pack" data-id="${pk.id}" data-k="cr" ${S.cr<pk.cr?'disabled':''}>Encore un, ${cr(pk.cr)}</button></div>
      <button class="btn good wide" style="margin-top:8px" data-a="eqcaropen">⚡ Équiper les meilleures pièces sur une voiture</button>`;
    return true;
  }
  const cur=i>0?modOf(sheet.cards[i-1]):null, anim=!!sheet.anim, rc=cur?rcOf(cur):'#00e5ff';
  const deck=Math.min(3,n-i-(cur?0:1));
  el.innerHTML=`${X}<h2>${pk.nom}</h2><div class="ocount"><b>${i}</b> / ${n}</div>
    <div class="ostage ${cur&&cur.r>=4&&anim?'shake':''}" data-a="reveal" style="--rc:${rc}"><div class="rays ${cur&&cur.r>=3?'on':''}"></div>
      ${Array.from({length:deck}).map((_,k)=>`<div class="dk" style="--k:${k+1}"></div>`).join('')}
      ${cur?bigCard(cur,anim):backCard(pk)}${anim&&cur&&cur.r>=2?burstHTML(cur):''}${anim&&cur&&cur.r>=3?`<div class="oflash"></div>`:''}
      <div class="ohint">${i===0?'Touche la carte pour révéler le premier module':n-i===1?'Touche pour le dernier module':'Touche pour le module suivant'}</div></div>
    <div class="otray">${sheet.cards.slice(0,Math.max(0,i-1)).map(modOf).filter(Boolean).map(m=>`<span class="mt" style="--rc:${rcOf(m)}">${ico(MODI[m.t][1],rcOf(m),32)}</span>`).join('')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><button class="btn" data-a="reveal">${i===0?'Révéler':'Suivant'}</button><button class="btn alt" data-a="revealall">Tout révéler</button></div>`;
  return true;
}
Object.assign(ACT,{
  reveal(){ if(!sheet||sheet.t!=='open'||sheet.i>=sheet.cards.length) return; const m=modOf(sheet.cards[sheet.i]); sheet.i++; auCard(m.r,m.sh,m.un!=null); sheet.anim=1; renderSheet(); sheet.anim=0; if(sheet.i>=sheet.cards.length) $('sheet').scrollTop=0; },
  revealall(){ if(!sheet||sheet.t!=='open') return; let best=null; while(sheet.i<sheet.cards.length){const m=modOf(sheet.cards[sheet.i++]); if(!best||m.r>best.r) best=m;} if(best) auCard(best.r,best.sh,best.un!=null); sheet.anim=0; renderSheet(); }
});

/* ---- missions : tout récupérer ---- */
function claimList(){
  questsEnsure(); const L=[];
  if(S.daily!==dayKey()) L.push(['daily']);
  [['dq',DQ],['wq',WQ]].forEach(([k,T])=>S[k].ids.forEach(id=>{ const q=T.find(x=>x.id===id); if(q&&!S[k].cl[id]&&qProg(S[k],q)>=q.n) L.push([k,id]); }));
  MISSIONS.forEach(m=>{ if(!S.claimed[m.id]){ const p=m.p(S); if(p[0]>=p[1]) L.push(['m',m.id]); } });
  return L;
}
function claimTotal(L){
  const g={cr:0,tok:0,nitro:0,xp:0}, add=x=>{g.cr+=x.cr||0; g.tok+=x.tok||0; g.nitro+=x.nitro||0; g.xp+=x.xp||0;};
  L.forEach(([k,id])=>{ if(k==='daily') add(dailyReward()); else if(k==='m') add(MISSIONS.find(m=>m.id===id).g); else add(qRew((k==='dq'?DQ:WQ).find(x=>x.id===id))); });
  return g;
}
const claimBar=()=>{ const L=claimList(); if(!L.length) return `<div class="claimall off">Aucune récompense à récupérer pour l’instant.</div>`; const g=claimTotal(L);
  return `<button class="btn good wide claimall" data-a="claimall"><b>🎁 Tout récupérer</b><span>${L.length} récompense${L.length>1?'s':''} : ${gText(g)}</span></button>`; };
ACT.claimall=function(){
  const L=claimList(); if(!L.length) return toast('Rien à récupérer');
  const g=claimTotal(L);
  L.forEach(([k,id])=>{
    if(k==='daily'){ const y=new Date(Date.now()-864e5), yk=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate(); S.streak=S.daily===yk?(S.streak||0)+1:1; S.daily=dayKey(); }
    else if(k==='m') S.claimed[id]=1;
    else S[k].cl[id]=1;
  });
  giveG(g); toast('Tout récupéré : '+[g.cr?fmt(g.cr)+' cr':'',g.nitro?g.nitro+' nitro':'',g.xp?g.xp+' XP':'',g.tok?g.tok+' jeton'+(g.tok>1?'s':''):''].filter(Boolean).join(', ')); save(); render();
};

/* ======================================================================
   v0.11 : récompenses avec XP, audio de course, caméra, IA, pilote
   ====================================================================== */
const rxp=cr=>Math.max(10,Math.round(cr/12/5)*5);
MISSIONS.forEach(m=>{ if(m.g.xp==null) m.g.xp=rxp(m.g.cr||(m.g.tok||0)*300||200); });
/* coupure franche de la musique du menu quand on entre dans une épreuve */
function auCutMenu(){
  if(!AU.ok||!AU.ctx) return; const c=AU.ctx, t=c.currentTime;
  auTry(()=>{ AU.mus.gain.cancelScheduledValues(t); AU.mus.gain.setTargetAtTime(.0001,t,.025); AU.revIn.gain.cancelScheduledValues(t); AU.revIn.gain.setTargetAtTime(.0001,t,.025); });
  setTimeout(()=>{ if(!AU.ok) return; auTry(()=>{ auApplyVol(); AU.revIn.gain.setTargetAtTime(.5,AU.ctx.currentTime,.1); }); },450);
}
MOODS.silent={arp:[],oct:1,wave:'sine',av:0,pv:0,filt:19000,hat:false,pulse:false};

/* ---- IA : dépassements (adversaires et pilote automatique) ---- */
function aiPass(o,all,lane0,room){
  const t=RC.clock, look=10+o.v*.95*(room||1); let bl=null, bd=1e9;
  for(const q of all){ if(q===o||q.fin!=null) continue; const dp=dS(q.s,o.s); if(dp>.5&&dp<look&&Math.abs(q.d-o.d)<2.7&&(q.v<o.v+4||dp<7)&&dp<bd){bd=dp; bl=q;} }
  let ref=bl;
  if(!ref&&o.pRef){ const dp=dS(o.pRef.s,o.s); if(dp>-8&&dp<=.5&&t<o.pUntil) ref=o.pRef; else o.pRef=null; }
  if(!ref) return {lane:lane0,cap:1,brake:false};
  if(bl&&(o.pRef!==bl||t>o.pUntil)){
    const i=o.i, wl=TRK.wallL[i], wr=TRK.wallR[i], rl=wl-2.5-bl.d, rr=wr-2.5+bl.d;
    let side=rl>=rr?1:-1; if(Math.abs(rl-rr)<1.2&&o.pSide) side=o.pSide;
    const busy=s2=>all.some(q=>q!==o&&q!==bl&&q.fin==null&&Math.abs(dS(q.s,o.s))<9&&Math.abs(q.d-(bl.d+s2*3.1))<2.2);
    if(busy(side)&&!busy(-side)&&(side>0?rr:rl)>3.1) side=-side;
    o.pSide=side; o.pRef=bl; o.pUntil=t+2.5;
  }
  const lane=ref.d+(o.pSide||1)*3.1, lat=Math.abs(o.d-ref.d);
  let cap=1, brake=false;
  if(bl&&lat<2.3){ const gap=bd; if(gap<4+o.v*.18){cap=.5; if(o.v>bl.v+1&&gap<3+o.v*.1) brake=true;} else if(gap<7+o.v*.3) cap=.85; }
  return {lane,cap,brake};
}

/* ---- caméra libre en pilotage automatique ---- */
const orbitOn=()=>{ const o=RC&&RC.auto&&RC.orb; return !!(o&&(o.down||Math.abs(o.yaw)>.03||Math.abs(o.pit-.25)>.03)); };
function orbStep(o,dt){ if(o.down){o.idle=0; return;} o.idle+=dt; if(o.idle>3.2){ const k=Math.exp(-dt*2.6); o.yaw*=k; o.pit=.25+(o.pit-.25)*k; } }
function orbitSpa(cam,P,ang,dt){
  const o=RC.orb; orbStep(o,dt); const d=9+Math.min(P.v,90)*.02, rd=Math.cos(o.pit)*d, a=ang+o.yaw;
  cam.position.set(P.x-Math.cos(a)*rd,P.y+Math.max(.7,Math.sin(o.pit)*d+1.4),P.z-Math.sin(a)*rd); cam.lookAt(P.x,P.y+1.2,P.z);
}
function orbitRace(cam,P,Pa,dt){
  const o=RC.orb; orbStep(o,dt); const p=pathAt(Pa,clamp(P.x,-Pa.PRE+4,RC.tk.L+Pa.POST-6),P.lane), d=9+Math.min(P.v,90)*.02, rd=Math.cos(o.pit)*d, a=p.th+o.yaw;
  cam.position.set(p.x-Math.cos(a)*rd,Math.max(.8,Math.sin(o.pit)*d+1.4),p.z-Math.sin(a)*rd); cam.lookAt(p.x,1.1,p.z);
}
function bindOrbit(){
  const el=$('rslot'); if(!el||!RC||!RC.auto) return; RC.orb={yaw:0,pit:.25,down:false,idle:0,x:0,y:0};
  el.style.touchAction='none';
  el.addEventListener('pointerdown',e=>{ const o=RC&&RC.orb; if(!o) return; o.down=true; o.x=e.clientX; o.y=e.clientY; try{el.setPointerCapture(e.pointerId);}catch(_){ } });
  el.addEventListener('pointermove',e=>{ const o=RC&&RC.orb; if(!o||!o.down) return; o.yaw+=(e.clientX-o.x)*.012; o.pit=clamp(o.pit-(e.clientY-o.y)*.006,.03,1.2); o.x=e.clientX; o.y=e.clientY; });
  const up=()=>{ const o=RC&&RC.orb; if(o){o.down=false; o.idle=0;} };
  el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
  const w=el.parentNode; if(w&&!w.querySelector('.orbhint')) w.insertAdjacentHTML('beforeend','<div class="orbhint">👆 Glisse sur l’écran pour regarder autour de la voiture</div>');
}

/* ---- rétroviseur (courses manuelles) ---- */
let mirTick=0;
function bindMirror(){
  const el=$('rslot'); if(!el||!RC||RC.auto||S.mirOff) return; const w=el.parentNode; if(!w||w.querySelector('.mir')) return;
  w.insertAdjacentHTML('beforeend','<canvas id="mir" class="mir" data-a="mirtog" aria-label="Rétroviseur"></canvas>');
  GL.post=mirrorPost;
}
function mirrorPost(){
  const cv=$('mir'); if(!cv||!RC||!RS||RC.auto||RC.done||GL.mode!=='race') return; if(mirTick++&1) return;
  const R=GL.r, gc=R.domElement, rr=cv.getBoundingClientRect(), gr=gc.getBoundingClientRect(), cw=Math.round(rr.width), ch=Math.round(rr.height); if(cw<20||ch<8||!gr.width) return;
  const sx=gc.clientWidth/gr.width, x=Math.round((rr.left-gr.left)*sx), top=Math.round((rr.top-gr.top)*sx), y=GL.h-top-ch;
  const mc=RS.mcam||(RS.mcam=new THREE.PerspectiveCamera(52,cw/ch,.3,700)); if(Math.abs(mc.aspect-cw/ch)>.01){mc.aspect=cw/ch; mc.updateProjectionMatrix();}
  const P=RC.P, H=(RS.pc&&RS.pc.H)||1.4;
  if(RC.kind==='spa'){ const c=Math.cos(P.psi), s=Math.sin(P.psi); mc.position.set(P.x-c*.3,P.y+H+.45,P.z-s*.3); mc.lookAt(P.x-c*30,P.y+1.1,P.z-s*30); }
  else { const p=pathAt(RS.path,clamp(P.x,-RS.path.PRE+4,RC.tk.L+RS.path.POST-6),P.lane), c=Math.cos(p.th), s=Math.sin(p.th); mc.position.set(p.x,H+.45,p.z); mc.lookAt(p.x-c*30,1.1,p.z-s*30); }
  const pc=RS.pc; if(pc) pc.g.visible=false;
  R.setScissorTest(true); R.setViewport(x,y,cw,ch); R.setScissor(x,y,cw,ch); R.render(GL.scene,mc); R.setScissorTest(false); R.setViewport(0,0,GL.w,GL.h);
  if(pc) pc.g.visible=true;
  const dpr=R.getPixelRatio(), bw=Math.round(cw*dpr), bh=Math.round(ch*dpr); if(cv.width!==bw||cv.height!==bh){cv.width=bw; cv.height=bh;}
  const ctx=cv.getContext('2d'); ctx.save(); ctx.translate(bw,0); ctx.scale(-1,1);
  try{ ctx.drawImage(gc,x*dpr,top*dpr,bw,bh,0,0,bw,bh); }catch(_){ }
  ctx.restore();
}
ACT.mirtog=function(){ S.mirOff=true; const e=document.querySelector('.mir'); if(e) e.remove(); GL.post=null; toast('Rétroviseur masqué pour cette partie'); };
const _bindRace=bindRace;
bindRace=function(){ _bindRace(); try{ bindOrbit(); bindMirror(); }catch(e){ try{console.warn('bindRace+',e);}catch(_){ } } };

/* ======================================================================
   Carte pilote : titre, succès à paliers, arbre de compétences
   ====================================================================== */
const pil=()=>{ if(!S.pil) S.pil={sp:{},bdg:{}}; if(!S.pil.sp) S.pil.sp={}; if(!S.pil.bdg) S.pil.bdg={}; return S.pil; };
const pk=id=>((S.pil&&S.pil.sp)||{})[id]||0;
const sk=(c,id,k)=>(c&&c.uid>0)?1+k*pk(id):1;
const f1=x=>(Math.round(x*10)/10).toString().replace('.',',');
const SKT=[
 {b:'pil',n:'Pilotage',c:'#00e5ff',ic:'🏎️',list:[
  {id:'acc',n:'Départ canon',ic:'🚀',max:5,d:l=>`+${f1(1.5*l)} % d’accélération`},
  {id:'brk',n:'Freinage tardif',ic:'🛑',max:5,d:l=>`+${f1(2*l)} % de freinage`},
  {id:'grip',n:'Sens du grip',ic:'🛞',max:5,d:l=>`+${f1(1.2*l)} % de vitesse en virage`},
  {id:'nit',n:'Maître de la nitro',ic:'⚡',max:5,d:l=>`+${8*l} % de durée, +${4*l} % de poussée`}]},
 {b:'mec',n:'Mécanique',c:'#ff9a3c',ic:'🔧',list:[
  {id:'wear',n:'Conduite souple',ic:'🍃',max:4,d:l=>`−${8*l} % d’usure par course`},
  {id:'rep',n:'Mains en or',ic:'🛠️',max:4,d:l=>`−${7*l} % sur les réparations`},
  {id:'upg',n:'Négociateur d’atelier',ic:'💼',max:4,d:l=>`−${5*l} % sur les améliorations`},
  {id:'rel',n:'Mécano de précision',ic:'⚙️',max:3,d:l=>`−${10*l} % de risque de panne`}]},
 {b:'biz',n:'Business',c:'#3ccf7a',ic:'💰',list:[
  {id:'gain',n:'Sponsors',ic:'🤝',max:5,d:l=>`+${4*l} % de crédits en course`},
  {id:'xp',n:'Mentor',ic:'🎓',max:5,d:l=>`+${6*l} % d’expérience`},
  {id:'dly',n:'Fan club',ic:'📣',max:4,d:l=>`+${8*l} % de récompense quotidienne`},
  {id:'pod',n:'Showroom VIP',ic:'🏛️',max:5,d:l=>`+${6*l} % de revenus des podiums`}]},
 {b:'cha',n:'Chance',c:'#ff2bd6',ic:'🍀',list:[
  {id:'tok',n:'Flair',ic:'🎟',max:5,d:l=>`${6*l} % de chance de jeton bonus par victoire`},
  {id:'shopd',n:'Chineur',ic:'🛒',max:4,d:l=>`−${5*l} % sur les pièces du marché`},
  {id:'scrap',n:'Récupérateur',ic:'♻️',max:4,d:l=>`+${8*l} % de ferraille au recyclage`},
  {id:'luck',n:'Chercheur d’éclats',ic:'✨',max:5,d:l=>`+${10*l} % de chances de module brillant`}]}];
const SKI={}; SKT.forEach(b=>b.list.forEach(s=>{s.b=b; SKI[s.id]=s;}));
const RANKS=[[1,'Apprenti','#9aa3ad'],[3,'Pilote du dimanche','#3ccf7a'],[5,'Compétiteur','#3d8bff'],[8,'Professionnel','#b05cff'],[12,'As du volant','#ffb020'],[16,'Champion','#ff3d6e'],[20,'Légende','#00e5ff']];
const rankOf=()=>RANKS.filter(r=>S.lvl>=r[0]).pop();
const albCount=()=>MODT.reduce((t,T)=>{let b=S.alb[T[0]]||0,c=0; while(b){c+=b&1; b>>=1;} return t+c;},0);
const BDG=[
 {id:'races',n:'Habitué des pistes',ic:'🏁',d:'Dispute des épreuves',t:[5,30,120],v:()=>S.stats.races||0},
 {id:'wins',n:'Vainqueur',ic:'🏆',d:'Gagne des épreuves',t:[3,20,80],v:()=>S.stats.wins||0},
 {id:'wins3',n:'Série parfaite',ic:'🎯',d:'Gagne des épreuves de 3 manches ou plus',t:[1,5,20],v:()=>S.stats.wins3||0},
 {id:'pods',n:'Habitué du podium',ic:'🥇',d:'Monte sur le podium d’une épreuve à 6 voitures',t:[3,15,60],v:()=>S.stats.pods||0},
 {id:'w_drag',n:'Roi du drag',ic:'🚦',d:'Gagne des manches de drag',t:[3,15,50],v:()=>S.stats.w_drag||0},
 {id:'w_circuit',n:'Maître de Spa',ic:'🛣️',d:'Gagne des courses de circuit',t:[3,15,50],v:()=>S.stats.w_circuit||0},
 {id:'w_rallye',n:'Bête des chemins',ic:'🌲',d:'Gagne des manches de rallye',t:[3,12,40],v:()=>S.stats.w_rallye||0},
 {id:'w_drift',n:'Drifteur',ic:'💨',d:'Gagne des manches de drift',t:[3,12,40],v:()=>S.stats.w_drift||0},
 {id:'w_endurance',n:'Infatigable',ic:'⏱️',d:'Gagne des manches d’endurance',t:[2,8,25],v:()=>S.stats.w_endurance||0},
 {id:'w_elegance',n:'Œil du jury',ic:'🎩',d:'Remporte des concours d’élégance',t:[2,8,25],v:()=>S.stats.w_elegance||0},
 {id:'earned',n:'Tycoon',ic:'💰',d:'Gagne des crédits en course',t:[10000,100000,1000000],v:()=>S.stats.earned||0},
 {id:'nitroN',n:'Accro à la nitro',ic:'⚡',d:'Utilise des bouteilles de nitro',t:[10,50,200],v:()=>S.stats.nitroN||0},
 {id:'packs',n:'Ouvreur de paquets',ic:'🃏',d:'Ouvre des paquets',t:[5,30,100],v:()=>S.stats.packs||0},
 {id:'best',n:'Chasseur de légendes',ic:'🌟',d:'Obtiens un module de rareté Épique, Mythique puis Ultra rare',t:[3,5,6],v:()=>S.stats.best||0},
 {id:'shiny',n:'Chasseur d’éclats',ic:'✨',d:'Obtiens des modules brillants',t:[1,5,20],v:()=>S.stats.shiny||0},
 {id:'alb',n:'Album complet',ic:'📖',d:'Remplis l’album de modules',t:[20,80,200],v:albCount},
 {id:'fuseN',n:'Alchimiste',ic:'⚗️',d:'Fusionne des modules',t:[2,10,40],v:()=>S.stats.fuseN||0},
 {id:'eqN',n:'Tuner',ic:'🔩',d:'Monte des modules sur tes voitures',t:[10,60,250],v:()=>S.stats.eqN||0},
 {id:'repN',n:'Garagiste',ic:'🛠️',d:'Répare des voitures',t:[5,30,100],v:()=>S.stats.repN||0},
 {id:'shopN',n:'Chineur',ic:'🛒',d:'Achète des pièces au marché',t:[3,20,80],v:()=>S.stats.shopN||0},
 {id:'bats',n:'Bâtisseur',ic:'🏗️',d:'Améliore les bâtiments de la base',t:[3,10,25],v:()=>S.stats.bats||0},
 {id:'cars',n:'Collectionneur',ic:'🚗',d:'Possède des voitures en même temps',t:[3,6,12],v:()=>S.cars.length},
 {id:'lvl',n:'Ascension',ic:'📈',d:'Atteins un niveau de pilote',t:[5,10,20],v:()=>S.lvl}];
const BTIER=[{n:'Bronze',c:'#cd7f32',cr:500,xp:40,tok:0},{n:'Argent',c:'#cfd6e4',cr:2500,xp:150,tok:1},{n:'Or',c:'#ffd24a',cr:10000,xp:500,tok:3}];
const bdgDone=b=>{ const v=b.v(); return b.t.filter(x=>v>=x).length; };
const bdgGot=b=>pil().bdg[b.id]||0;
const bdgReady=()=>BDG.reduce((t,b)=>t+Math.max(0,bdgDone(b)-bdgGot(b)),0);
const bdgGold=()=>BDG.filter(b=>bdgGot(b)>=3).length;
const skTotal=()=>Math.max(0,S.lvl-1)+bdgGold();
const skSpent=()=>Object.values(pil().sp).reduce((a,b)=>a+b,0);
const skAvail=()=>skTotal()-skSpent();
const pilDot=()=>skAvail()>0||bdgReady()>0;

/* récompenses : on ajoute les succès à « tout récupérer » */
function claimList(){
  questsEnsure(); const L=[];
  if(S.daily!==dayKey()) L.push(['daily']);
  [['dq',DQ],['wq',WQ]].forEach(([k,T])=>S[k].ids.forEach(id=>{ const q=T.find(x=>x.id===id); if(q&&!S[k].cl[id]&&qProg(S[k],q)>=q.n) L.push([k,id]); }));
  MISSIONS.forEach(m=>{ if(!S.claimed[m.id]){ const p=m.p(S); if(p[0]>=p[1]) L.push(['m',m.id]); } });
  BDG.forEach(b=>{ if(bdgDone(b)>bdgGot(b)) L.push(['b',b.id]); });
  return L;
}
function claimTotal(L){
  const g={cr:0,tok:0,nitro:0,xp:0}, add=x=>{g.cr+=x.cr||0; g.tok+=x.tok||0; g.nitro+=x.nitro||0; g.xp+=x.xp||0;};
  L.forEach(([k,id])=>{ if(k==='daily') add(dailyReward()); else if(k==='m') add(MISSIONS.find(m=>m.id===id).g);
    else if(k==='b'){ const b=BDG.find(x=>x.id===id); for(let i=bdgGot(b);i<bdgDone(b);i++) add(BTIER[i]); }
    else add(qRew((k==='dq'?DQ:WQ).find(x=>x.id===id))); });
  return g;
}
ACT.claimall=function(){
  const L=claimList(); if(!L.length) return toast('Rien à récupérer');
  const g=claimTotal(L), lv0=S.lvl;
  L.forEach(([k,id])=>{
    if(k==='daily'){ const y=new Date(Date.now()-864e5), yk=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate(); S.streak=S.daily===yk?(S.streak||0)+1:1; S.daily=dayKey(); }
    else if(k==='m') S.claimed[id]=1;
    else if(k==='b'){ const b=BDG.find(x=>x.id===id); pil().bdg[id]=bdgDone(b); }
    else S[k].cl[id]=1;
  });
  giveG(g); toast('Tout récupéré : '+[g.cr?fmt(g.cr)+' cr':'',g.xp?g.xp+' XP':'',g.nitro?g.nitro+' nitro':'',g.tok?g.tok+' jeton'+(g.tok>1?'s':''):''].filter(Boolean).join(', ')); save(); render(); if(sheet&&sheet.t==='pilot') renderSheet();
};

/* ---- fenêtre pilote ---- */
const HELM=`<svg viewBox="0 0 64 64"><defs><linearGradient id="hg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7ff"/><stop offset=".5" stop-color="#9aa6c6"/><stop offset="1" stop-color="#3b4362"/></linearGradient></defs>
<path d="M8 40 C8 20 22 8 38 8 C52 8 60 20 60 34 V46 C60 50 57 52 53 52 H18 C12 52 8 47 8 40Z" fill="url(#hg1)"/><path d="M26 22 H58 V38 H30 C25 38 22 33 24 29Z" fill="#0b0d1c" stroke="var(--rc)" stroke-width="2"/>
<path d="M8 40 C8 20 22 8 38 8" fill="none" stroke="var(--rc)" stroke-width="3" stroke-linecap="round"/><path d="M30 26 H54" stroke="#fff" stroke-width="1.6" opacity=".5" stroke-linecap="round"/><rect x="34" y="42" width="24" height="5" rx="2.5" fill="var(--rc)" opacity=".9"/></svg>`;
const pilStat=(v,l)=>`<div><b>${v}</b><span>${l}</span></div>`;
function pilotSheets(X){
  if(sheet.t!=='pilot') return false;
  const el=$('sheet'), tab=sheet.tab||'card', rk=rankOf(), nx=RANKS.find(r=>r[0]>S.lvl);
  const tabs=`<div class="subtabs">${[['card','Carte'],['skills','Compétences'+(skAvail()>0?` (${skAvail()})`:'')],['bdg','Succès'+(bdgReady()?` (${bdgReady()})`:'')]].map(([id,n])=>`<button data-a="ptab" data-id="${id}" ${tab===id?'aria-current="true"':''}>${n}</button>`).join('')}</div>`;
  let body='';
  if(tab==='card'){
    const gold=BDG.filter(b=>bdgGot(b)>=3||bdgDone(b)>=3).length, sp=skSpent();
    body=`<div class="pcard" style="--rc:${rk[2]}"><div class="pfoil"></div><div class="ptop"><span class="pav">${HELM}</span><div class="pid"><small>CARTE PILOTE</small><b>Pilote</b><span class="prank">${rk[1]}</span></div><div class="plv"><small>NIV.</small>${S.lvl}</div></div>
      <div class="pxp"><i style="width:${clamp(S.xp/need(S.lvl)*100,0,100)}%"></i></div><div class="pxpt">${fmt(S.xp)} / ${fmt(need(S.lvl))} XP${nx?` · prochain titre au niveau ${nx[0]} : ${nx[1]}`:' · rang maximal'}</div>
      <div class="pgrid">${pilStat(fmt(S.stats.races||0),'Épreuves')}${pilStat(fmt(S.stats.wins||0),'Victoires')}${pilStat(fmt(S.stats.pods||0),'Podiums')}${pilStat(fmt(S.cars.length),'Voitures')}${pilStat(fmt(S.mods.length),'Modules')}${pilStat(fmt(albCount()),'Album')}</div>
      <div class="pbad">${BDG.slice(0,12).map(b=>{const n=bdgDone(b); return `<span class="pb t${n}" title="${b.n}">${b.ic}</span>`;}).join('')}</div></div>
      <div class="prow"><button class="pbtn" data-a="ptab" data-id="skills"><b>🌳 Compétences</b><span>${skAvail()>0?`${skAvail()} point${skAvail()>1?'s':''} à dépenser`:`${sp} point${sp>1?'s':''} dépensé${sp>1?'s':''}`}</span></button><button class="pbtn" data-a="ptab" data-id="bdg"><b>🏅 Succès</b><span>${BDG.reduce((t,b)=>t+bdgDone(b),0)} / ${BDG.length*3} paliers, ${gold} en or</span></button></div>
      <p class="note">Chaque niveau donne 1 point de compétence. Un succès en or en donne un de plus.</p>`;
  } else if(tab==='skills'){
    body=`<div class="spts"><b>${skAvail()}</b><span>point${skAvail()>1?'s':''} de compétence</span><button class="btn alt sm" data-a="skreset" ${skSpent()?'':'disabled'}>${sheet.arm?'Confirmer : '+cr(skCost()):'Réinitialiser'}</button></div>
      ${SKT.map(b=>`<div class="sbr" style="--rc:${b.c}"><h3>${b.ic} ${b.n}</h3>${b.list.map(s=>{const l=pk(s.id), mx=l>=s.max;
        return `<div class="sk ${l?'on':''}"><span class="sic">${s.ic}</span><span class="sbody"><b>${s.n}</b><span class="pips">${Array.from({length:s.max},(_,i)=>`<i class="${i<l?'f':''}"></i>`).join('')}</span><small>${l?s.d(l):'Aucun niveau'}${mx?'':`<br><em>Niveau ${l+1} : ${s.d(l+1)}</em>`}</small></span>
          ${mx?'<span class="smax">MAX</span>':`<button class="btn sm ${skAvail()>0?'good':'alt'}" data-a="skup" data-id="${s.id}" ${skAvail()>0?'':'disabled'}>+1</button>`}</div>`;}).join('')}</div>`).join('')}`;
  } else {
    const rdy=bdgReady(), g=claimTotal(BDG.filter(b=>bdgDone(b)>bdgGot(b)).map(b=>['b',b.id]));
    body=`${rdy?`<button class="btn good wide claimall" data-a="claimall"><b>🎁 Tout récupérer</b><span>${rdy} palier${rdy>1?'s':''} : ${gText(g)}</span></button>`:`<p class="note">Chaque succès a trois paliers : bronze, argent, or. Les récompenses sont des crédits, de l’expérience et des jetons.</p>`}
      <div class="bgrid">${BDG.map(b=>{const v=b.v(), n=bdgDone(b), got=bdgGot(b), nxt=b.t[Math.min(n,2)], shown=Math.min(v,nxt);
        return `<div class="bd ${n?'on':''}"><span class="bmed t${n}">${b.ic}</span><b>${b.n}</b><small>${b.d}</small><div class="bp"><i style="width:${clamp(shown/nxt*100,0,100)}%"></i></div><span class="bnum">${n>=3?'Complet':fmt(Math.min(v,nxt))+' / '+fmt(nxt)}</span><span class="btier">${[0,1,2].map(i=>`<u class="${i<n?'d':''} ${i<got?'g':''}" style="--tc:${BTIER[i].c}"></u>`).join('')}</span></div>`;}).join('')}</div>`;
  }
  el.innerHTML=`${X}<h2>Pilote</h2>${tabs}${body}`;
  return true;
}
const skCost=()=>1500+500*skSpent();
Object.assign(ACT,{
  pilot(){ openSheet({t:'pilot',tab:'card'}); },
  ptab(d){ if(!sheet||sheet.t!=='pilot') return; sheet.tab=d.id; sheet.arm=false; renderSheet(); const s=$('sheet'); if(s) s.scrollTop=0; },
  skup(d){ const s=SKI[d.id]; if(!s) return; const l=pk(s.id); if(l>=s.max||skAvail()<1) return; pil().sp[s.id]=l+1; save(); render(); renderSheet(); auTry(()=>auCard(3,false,false)); toast(`${s.n} : niveau ${l+1}`); },
  skreset(){ if(!skSpent()) return; if(!sheet.arm){ sheet.arm=true; return renderSheet(); } const c=skCost(); if(S.cr<c) return toast('Pas assez de crédits'); S.cr-=c; pil().sp={}; sheet.arm=false; save(); render(); renderSheet(); toast('Compétences réinitialisées'); }
});

setInterval(updPod,4000);

S=load();
render();
if(!S.intro){S.intro=true; localSave(); openSheet({t:'intro'});}
auInstall(); auSet(S.audio);
cloudInit();
ensureModels();
ensureTrack();
