/* ===== v1.5 · Éveil cosmique — 1/6 : catalogue de combat (données pures, aucun effet sur les courses) =====
   Types, efficacités, statistiques, altérations, météos, attaques, talents, objets.
   Le moteur (new53) lit ces tables ; rien ici ne touche à S ni à la physique de course. */

/* ---- types ---- */
const CB_TYPES={
  feu:  {n:'Feu',ic:'🔥',c:'#ff6a2b'}, eau:  {n:'Eau',ic:'💧',c:'#2bb5ff'}, glace:{n:'Glace',ic:'❄️',c:'#9ef0ff'},
  vent: {n:'Vent',ic:'🌪️',c:'#8fffc8'}, tene: {n:'Ténèbres',ic:'🌑',c:'#8a5cff'}, lum:  {n:'Lumière',ic:'✨',c:'#ffe66b'},
  elec: {n:'Électrik',ic:'⚡',c:'#ffd400'}, acier:{n:'Acier',ic:'🔩',c:'#b8c2d6'}, terre:{n:'Terre',ic:'⛰️',c:'#c98a4a'},
  meca: {n:'Méca',ic:'⚙️',c:'#d9dbe8'}
};
const CB_TL=Object.keys(CB_TYPES);
/* table des efficacités : attaquant → [super efficace ×2], [peu efficace ×0,5], [immunité ×0] */
const CB_CHART={
  feu:  [['glace','acier','vent'],['feu','eau','terre'],[]],
  eau:  [['feu','terre','acier'],['eau','glace','vent'],[]],
  glace:[['vent','terre','eau'],['feu','acier','glace'],[]],
  vent: [['tene','eau','terre'],['acier','elec','vent'],[]],
  tene: [['lum','elec'],['tene','feu','acier'],[]],
  lum:  [['tene','glace'],['lum','acier','feu'],[]],
  elec: [['eau','vent','acier'],['elec','lum'],['terre']],
  acier:[['glace','lum','terre'],['feu','acier','eau','elec'],[]],
  terre:[['elec','feu','acier'],['glace','eau'],['vent']],
  meca: [[],['acier'],[]]
};
const CB_EFF={}; CB_TL.forEach(a=>{ CB_EFF[a]={}; CB_TL.forEach(d=>{ const c=CB_CHART[a]; CB_EFF[a][d]=c[2].includes(d)?0:c[0].includes(d)?2:c[1].includes(d)?.5:1; }); });
const cbEff=(at,defTypes)=>(defTypes||[]).reduce((k,d)=>{ const v=(CB_EFF[at]||{})[d]; return k*(v==null?1:v); },1);
const cbEffTxt=k=>k===0?'Aucun effet…':k>=4?'Extrêmement efficace !':k>=2?'C’est super efficace !':k<=.25?'Vraiment pas efficace…':k<1?'Ce n’est pas très efficace…':'';

/* ---- statistiques de combat (thème auto) ---- */
const CB_STATS={hp:{n:'Blindage',s:'PV',ic:'🛡️'},atk:{n:'Puissance moteur',s:'Att',ic:'💥'},def:{n:'Châssis',s:'Déf',ic:'🧱'},spa:{n:'Surcharge élémentaire',s:'Att.Spé',ic:'🌀'},spd:{n:'Isolation',s:'Déf.Spé',ic:'🔰'},vit:{n:'Reprise',s:'Vit',ic:'⏱️'}};
const CB_SK=['hp','atk','def','spa','spd','vit'];
const CB_STAGE_ST=['atk','def','spa','spd','vit','acc','eva'];          /* crans de -6 à +6 */
const CB_STAGE_N={atk:'Puissance',def:'Châssis',spa:'Surcharge',spd:'Isolation',vit:'Reprise',acc:'Précision',eva:'Esquive'};
const cbStageK=(st,n)=>{ n=Math.max(-6,Math.min(6,n|0)); return st==='acc'||st==='eva'?(n>=0?(3+n)/3:3/(3-n)):(n>=0?(2+n)/2:2/(2-n)); };
const CB_CRIT=[1/24,1/8,1/2,1];                                          /* chance de critique par cran (×1,5) */
/* profil de base par type (somme ≈ 480) : sert aux fiches des voitures (new52) */
const CB_TPROF={
  feu:  {hp:75,atk:90,def:65,spa:100,spd:65,vit:85}, eau:  {hp:95,atk:78,def:82,spa:95,spd:88,vit:70},
  glace:{hp:80,atk:75,def:85,spa:95,spd:80,vit:65}, vent: {hp:80,atk:85,def:68,spa:88,spd:72,vit:122},
  tene: {hp:75,atk:100,def:70,spa:85,spd:70,vit:80}, lum:  {hp:85,atk:65,def:75,spa:100,spd:95,vit:60},
  elec: {hp:65,atk:70,def:60,spa:110,spd:75,vit:100},acier:{hp:85,atk:95,def:115,spa:55,spd:85,vit:45},
  terre:{hp:100,atk:105,def:95,spa:55,spd:65,vit:60}, meca: {hp:85,atk:85,def:80,spa:75,spd:75,vit:80}
};
const CB_LVMAX=50;

/* ---- altérations d'état ---- */
const CB_ST={
  brule: {n:'Surchauffe',ic:'🔥',c:'#ff6a2b',d:'Perd 1/16 de son blindage par tour, Puissance moteur divisée par 2.'},
  gel:   {n:'Verglas',ic:'🧊',c:'#9ef0ff',d:'Bloqué par la glace : ne peut pas agir (20 % de dégel par tour, un coup de Feu dégèle).'},
  para:  {n:'Court-circuit',ic:'⚡',c:'#ffd400',d:'Reprise divisée par 2 et 25 % de chances de ne pas pouvoir agir.'},
  aveugle:{n:'Fumée',ic:'🌫️',c:'#9aa0b8',d:'Précision ×0,7 pendant 3 à 5 tours.'},
  poison:{n:'Fuite d’huile',ic:'🛢️',c:'#b05cff',d:'Perd 1/8 de son blindage par tour.'},
  poison2:{n:'Fuite grave',ic:'☠️',c:'#d04cff',d:'Perd 1/16, puis 2/16, 3/16… de son blindage à chaque tour.'}
};
const CB_VOL={confus:{n:'Surtension',ic:'💫',c:'#ff7ae0',d:'2 à 5 tours : 33 % de chances de se blesser seul.'},flinch:{n:'Calé',ic:'💤',d:'Rate son tour.'},taunt:{n:'Provoqué',ic:'😤',d:'Ne peut utiliser que des attaques.'},trap:{n:'Coincé',ic:'🪤',d:'Perd 1/8 par tour et ne peut pas changer.'},ring:{n:'Circuit de refroidissement',ic:'💠',d:'Récupère 1/16 par tour.'},leech:{n:'Parasite électrique',ic:'🔌',d:'Perd 1/8 par tour au profit de l’adversaire.'},veil:{n:'Voile de givre',ic:'🪞',d:'Dégâts reçus divisés par 2.'},shield:{n:'Pare-brise',ic:'🧿',d:'Un bouclier absorbe les dégâts.'}};

/* ---- météos / effets d'arène (5 tours) ---- */
const CB_WX={
  pluie:   {n:'Pluie torrentielle',ic:'🌧️',up:'eau',down:'feu',d:'Eau ×1,5, Feu ×0,5. Foudre et Ouragan ne ratent jamais.'},
  canicule:{n:'Canicule',ic:'☀️',up:'feu',down:'eau',d:'Feu ×1,5, Eau ×0,5. Personne ne peut geler. Rayon solaire sans charge.'},
  tempete: {n:'Tempête de glace',ic:'🌨️',up:'glace',d:'Glace ×1,5, Blizzard ne rate jamais. Les non-Glace/Acier perdent 1/16 par tour.'},
  nuit:    {n:'Nuit cosmique',ic:'🌌',up:'tene',down:'lum',d:'Ténèbres ×1,5, Lumière ×0,75, esquive +1 cran pour les Ténèbres.'},
  orage:   {n:'Orage magnétique',ic:'⛈️',up:'elec',d:'Électrik ×1,5, Foudre ne rate jamais, les Vent perdent 1/16 par tour.'},
  aurore:  {n:'Aurore boréale',ic:'🌈',up:'lum',down:'tene',d:'Lumière ×1,5, Ténèbres ×0,75, soins ×1,5, Rayon solaire sans charge.'}
};

/* ---- attaques ----
   ligne : [id, nom, type, catégorie (phy|spe|sta), puissance, précision (0 = ne rate jamais), PP, niveau d'apprentissage, priorité, coût d'Énergie, effets]
   effets : st:[statut,%]  vol:[confus|flinch,%]  sb:{stat:cran,...,who:'foe'|'self',ch:%}  recoil  drain  heal  multi:[a,b]  crit:+n  protect
   counter:'phy'|'spe'  charge(:'wx')  inv  recharge  weather  trap  ring  leech  taunt  reset  energy  esteal  selfko  facade  jarnac
   gyro  rand  revenge  first  force  copy  shield  hazard  cure  veil  ignore  wxacc:[météos]  acrit  thaw  rampage */
const CB_MV_ROWS=[
 /* Méca (toutes les voitures) */
 ['percussion','Percussion','meca','phy',40,100,35,1,0,0,{}],
 ['coupvolant','Coup de volant','meca','phy',55,100,30,1,0,0,{}],
 ['klaxon','Klaxon','meca','sta',0,100,30,1,0,0,{sb:{atk:-1,who:'foe'}}],
 ['departcanon','Départ canon','meca','phy',40,100,10,4,3,0,{first:1,vol:['flinch',100]}],
 ['coupfrein','Coup de frein','meca','sta',0,100,20,6,0,0,{sb:{vit:-2,who:'foe'}}],
 ['detection','Carrosserie repliée','meca','sta',0,0,10,8,4,0,{protect:1}],
 ['reglage','Réglage fin','meca','sta',0,0,20,9,0,0,{crit:2,self:1}],
 ['derapage','Dérapage contrôlé','meca','phy',70,100,15,11,0,0,{crit:2}],
 ['injnitro','Injection nitro','meca','sta',0,0,15,13,0,0,{sb:{atk:1,vit:1,who:'self'}}],
 ['repexpress','Réparation express','meca','sta',0,0,10,15,0,0,{heal:.5}],
 ['rageauvolant','Rage au volant','meca','phy',70,100,20,17,0,0,{facade:1}],
 ['pleinecharge','Pleine charge','meca','phy',100,90,10,19,0,0,{recoil:.25}],
 ['parebrise','Pare-brise','meca','sta',0,0,10,21,0,0,{shield:.25}],
 ['copilote','Copilote','meca','sta',0,0,10,23,0,0,{copy:1}],
 ['remorquage','Remorquage','meca','phy',60,100,10,25,-6,0,{force:1}],
 ['pleindenergie','Plein d’énergie','meca','sta',0,0,10,27,0,0,{energy:40}],
 ['explosion','Explosion moteur','meca','phy',200,100,5,33,0,0,{selfko:1}],
 ['modecourse','Mode course','meca','phy',150,90,5,38,0,70,{}],
 /* Feu */
 ['allumage','Étincelle d’allumage','feu','spe',40,100,25,1,0,0,{st:['brule',10]}],
 ['pistonbrulant','Piston brûlant','feu','phy',65,95,15,7,0,0,{st:['brule',10],vol:['flinch',10],thaw:1}],
 ['combustion','Combustion lente','feu','sta',0,85,15,10,0,0,{st:['brule',100]}],
 ['retourflamme','Retour de flamme','feu','phy',80,100,15,14,0,0,{st:['brule',10],thaw:1}],
 ['turboinferno','Turbo inferno','feu','spe',90,100,15,18,0,0,{st:['brule',10]}],
 ['feudejoie','Feu de joie','feu','sta',0,0,5,20,0,0,{weather:'canicule'}],
 ['burnout','Burnout','feu','phy',120,100,15,26,0,0,{recoil:1/3,st:['brule',10],thaw:1}],
 ['echardent','Échappement ardent','feu','spe',110,85,5,29,0,0,{st:['brule',30]}],
 ['surchauffe','Surchauffe moteur','feu','spe',130,90,5,32,0,0,{sb:{spa:-2,who:'self',ch:100}}],
 ['novaplasma','Nova plasma','feu','spe',150,90,5,36,0,70,{st:['brule',30]}],
 /* Eau */
 ['gicleur','Gicleur','eau','spe',40,100,25,1,0,0,{}],
 ['aquaplaning','Aquaplaning','eau','phy',40,100,20,6,1,0,{}],
 ['siphon','Siphon','eau','spe',35,85,15,9,0,0,{trap:1}],
 ['rouilleexpress','Rouille express','eau','spe',70,100,20,13,0,0,{sb:{def:-1,who:'foe',ch:30}}],
 ['purgeradiateur','Circuit de refroidissement','eau','sta',0,0,20,16,0,0,{ring:1}],
 ['cascade','Cascade','eau','phy',80,100,15,18,0,0,{vol:['flinch',20]}],
 ['dansepluie','Danse de la pluie','eau','sta',0,0,5,20,0,0,{weather:'pluie'}],
 ['vaguescelerate','Vague scélérate','eau','spe',90,100,15,24,0,0,{}],
 ['hautepression','Pompe haute pression','eau','spe',110,80,5,30,0,0,{}],
 ['deluge','Déluge','eau','spe',150,90,5,36,0,70,{sb:{vit:-1,who:'foe',ch:50}}],
 /* Glace */
 ['givre','Givre','glace','spe',40,100,25,1,0,0,{st:['gel',10]}],
 ['eclatglace','Éclat de glace','glace','phy',40,100,30,6,1,0,{}],
 ['ventglacial','Vent glacial','glace','spe',55,95,15,9,0,0,{sb:{vit:-1,who:'foe',ch:100}}],
 ['voilegivre','Voile de givre','glace','sta',0,0,10,14,0,0,{veil:1}],
 ['laser','Laser cryo','glace','spe',90,100,10,18,0,0,{st:['gel',10]}],
 ['tempeteglace','Appel du blizzard','glace','sta',0,0,5,20,0,0,{weather:'tempete'}],
 ['avalanche','Avalanche','glace','phy',60,100,10,22,-4,0,{revenge:1}],
 ['picgivre','Pic de givre','glace','phy',85,90,10,25,0,0,{vol:['flinch',30]}],
 ['blizzard','Blizzard','glace','spe',110,70,5,30,0,0,{st:['gel',10],wxacc:['tempete']}],
 ['zeroabsolu','Zéro absolu','glace','spe',140,85,5,36,0,70,{st:['gel',30]}],
 /* Vent */
 ['rafale','Rafale','vent','spe',40,100,35,1,0,0,{}],
 ['aileron','Coup d’aileron','vent','phy',60,0,20,6,0,0,{}],
 ['ventarriere','Vent arrière','vent','sta',0,0,15,10,0,0,{sb:{vit:2,who:'self'}}],
 ['lameair','Lame d’air','vent','spe',75,95,15,14,0,0,{vol:['flinch',30]}],
 ['bise','Bise','vent','sta',0,0,15,17,0,0,{reset:1}],
 ['souffle','Souffle réacteur','vent','phy',90,95,15,21,0,0,{crit:1}],
 ['aspiration','Aspiration','vent','phy',120,95,10,25,0,0,{charge:1,inv:1}],
 ['ouragan','Ouragan','vent','spe',110,70,10,30,0,0,{vol:['confus',30],wxacc:['pluie','orage']}],
 ['cyclone','Cyclone zéphyr','vent','spe',140,90,5,36,0,70,{vol:['confus',20]}],
 /* Ténèbres */
 ['queuepoisson','Queue de poisson','tene','phy',40,100,30,1,1,0,{}],
 ['fumeenoire','Fumée noire','tene','sta',0,100,20,5,0,0,{st:['aveugle',100]}],
 ['gaztoxique','Gaz d’échappement','tene','spe',65,100,20,8,0,0,{st:['poison',30]}],
 ['appelphares','Appel de phares','tene','sta',0,100,20,12,0,0,{taunt:3}],
 ['machoire','Mâchoire de nuit','tene','phy',80,100,15,15,0,0,{vol:['flinch',20],sb:{def:-1,who:'foe',ch:20}}],
 ['complot','Complot','tene','sta',0,0,20,18,0,0,{sb:{spa:2,who:'self'}}],
 ['eclipse','Éclipse','tene','sta',0,0,5,20,0,0,{weather:'nuit'}],
 ['siphonnage','Siphonnage','tene','phy',60,100,15,22,0,0,{drain:.5,esteal:20}],
 ['coupjarnac','Coup de Jarnac','tene','phy',70,100,10,25,0,0,{jarnac:1}],
 ['ondeobscure','Onde obscure','tene','spe',90,100,15,28,0,0,{vol:['flinch',20]}],
 ['trounoir','Trou noir','tene','spe',150,90,5,36,0,70,{}],
 /* Lumière */
 ['pleinsphares','Pleins phares','lum','spe',40,100,25,1,0,0,{st:['aveugle',20]}],
 ['flash','Flash','lum','sta',0,100,20,5,0,0,{sb:{acc:-1,who:'foe'}}],
 ['bouclierprisme','Bouclier prisme','lum','sta',0,0,10,10,4,0,{protect:1}],
 ['eclatprisme','Éclat prismatique','lum','spe',80,100,15,14,0,0,{sb:{spd:-1,who:'foe',ch:20}}],
 ['haloreparateur','Halo réparateur','lum','sta',0,0,10,17,0,0,{heal:.5}],
 ['aurore','Aurore','lum','sta',0,0,5,20,0,0,{weather:'aurore'}],
 ['lancelumiere','Lance de lumière','lum','phy',85,100,15,22,0,0,{crit:1}],
 ['retroreflet','Rétro-reflet','lum','spe',1,100,20,24,-5,0,{counter:'spe'}],
 ['jugement','Jugement','lum','spe',100,100,10,28,0,0,{ignore:1}],
 ['rayonsolaire','Rayon solaire','lum','spe',130,100,10,31,0,0,{charge:'wx'}],
 ['supernova','Supernova','lum','spe',150,90,5,36,0,70,{heal:.25}],
 /* Électrik */
 ['courtjus','Court-jus','elec','spe',40,100,30,1,0,0,{st:['para',10]}],
 ['ondechoc','Onde de choc','elec','spe',60,0,20,6,0,0,{}],
 ['bobine','Bobine paralysante','elec','sta',0,90,20,9,0,0,{st:['para',100]}],
 ['coupdejus','Coup de jus','elec','phy',80,100,15,13,0,0,{st:['para',10]}],
 ['parasite','Parasite électrique','elec','sta',0,90,10,16,0,0,{leech:1}],
 ['rechargebatt','Recharge batterie','elec','sta',0,0,20,18,0,0,{energy:30,sb:{spd:1,who:'self'}}],
 ['appelorage','Appel d’orage','elec','sta',0,0,5,20,0,0,{weather:'orage'}],
 ['decharge','Décharge éclair','elec','spe',70,100,20,22,0,0,{energy:20}],
 ['eclair','Éclair','elec','spe',90,100,15,26,0,0,{st:['para',10]}],
 ['foudre','Foudre','elec','spe',110,70,10,30,0,0,{st:['para',30],wxacc:['pluie','orage']}],
 ['surtension','Surtension','elec','spe',140,90,5,36,0,70,{vol:['confus',30]}],
 /* Acier */
 ['clede12','Clé de 12','acier','phy',40,100,30,1,1,0,{}],
 ['tole','Tôle renforcée','acier','sta',0,0,20,6,0,0,{sb:{def:2,who:'self'}}],
 ['foreuse','Foreuse','acier','phy',25,100,20,10,0,0,{multi:[2,5]}],
 ['parebuffle','Pare-buffle','acier','phy',80,100,15,14,0,0,{vol:['flinch',20]}],
 ['blindurgence','Blindage d’urgence','acier','sta',0,0,10,17,4,0,{protect:1}],
 ['contrechoc','Contre-choc','acier','phy',1,100,20,19,-5,0,{counter:'phy'}],
 ['rivets','Canon à rivets','acier','spe',80,100,10,20,0,0,{sb:{spd:-1,who:'foe',ch:10}}],
 ['gyro','Gyro-turbine','acier','phy',1,100,5,22,0,0,{gyro:1}],
 ['poingmeteore','Poing météore','acier','phy',90,90,10,26,0,0,{sb:{atk:1,who:'self',ch:20}}],
 ['chargeblindee','Charge blindée','acier','phy',110,90,10,30,0,0,{recoil:.25}],
 ['forteresse','Forteresse mobile','acier','phy',140,90,5,36,0,70,{sb:{def:1,spd:1,who:'self',ch:100}}],
 /* Terre */
 ['boue','Projection de boue','terre','spe',55,95,15,1,0,0,{sb:{acc:-1,who:'foe',ch:100}}],
 ['fuitehuile','Fuite d’huile','terre','sta',0,90,15,5,0,0,{st:['poison2',100]}],
 ['coupdepelle','Coup de pelle','terre','phy',60,100,20,8,0,0,{sb:{vit:-1,who:'foe',ch:100}}],
 ['gravillons','Gravillons','terre','sta',0,0,20,11,0,0,{hazard:1}],
 ['sablesmouvants','Sables mouvants','terre','spe',35,85,15,13,0,0,{trap:1}],
 ['fondations','Fondations','terre','sta',0,0,20,16,0,0,{sb:{def:1,spd:1,who:'self'}}],
 ['eboulement','Éboulement','terre','phy',75,90,10,19,0,0,{vol:['flinch',30]}],
 ['tranchee','Tranchée','terre','phy',90,100,10,22,0,0,{charge:1,inv:1}],
 ['magnitude','Magnitude','terre','phy',1,100,30,24,0,0,{rand:1}],
 ['seisme','Séisme','terre','phy',100,100,10,29,0,0,{}],
 ['cataclysme','Cataclysme tellurique','terre','phy',150,90,5,36,0,70,{recharge:1}]
];
const CB_MV={}; CB_MV_ROWS.forEach(r=>{ CB_MV[r[0]]={id:r[0],n:r[1],t:r[2],c:r[3],p:r[4],a:r[5],pp:r[6],lv:r[7],pr:r[8],e:r[9],fx:r[10]}; });
/* description générée à partir des effets (toujours à jour) */
function cbDesc(m){ if(!m) return ''; const f=m.fx||{}, o=[];
  const pct=x=>Math.round(x*100)+' %', sbTxt=s=>Object.keys(s).filter(k=>CB_STAGE_N[k]).map(k=>CB_STAGE_N[k]+' '+(s[k]>0?'+':'')+s[k]).join(', ');
  if(m.c!=='sta'&&m.p>1) o.push('Puissance '+m.p+(m.a?' · précision '+m.a+' %':' · ne rate jamais'));
  if(m.pr>0) o.push('Agit en premier (priorité +'+m.pr+')'); if(m.pr<0) o.push('Agit en dernier');
  if(m.e) o.push('Coûte '+m.e+' d’Énergie');
  if(f.st) o.push((f.st[1]>=100?'Inflige ':f.st[1]+' % de chances d’infliger ')+(CB_ST[f.st[0]]||{}).n);
  if(f.vol) o.push((f.vol[1]>=100?'':f.vol[1]+' % : ')+(f.vol[0]==='flinch'?'l’adversaire cale (rate son tour)':'provoque une Surtension (confusion)'));
  if(f.sb) o.push((f.sb.ch&&f.sb.ch<100?f.sb.ch+' % : ':'')+(f.sb.who==='self'?'soi : ':'adversaire : ')+sbTxt(f.sb));
  if(f.recoil) o.push('Contrecoup : '+pct(f.recoil)+' des dégâts'); if(f.drain) o.push('Récupère '+pct(f.drain)+' des dégâts');
  if(f.heal) o.push('Répare '+pct(f.heal)+' du blindage'); if(f.multi) o.push('Frappe '+f.multi[0]+' à '+f.multi[1]+' fois');
  if(f.crit) o.push(f.self?'Critiques bien plus fréquents ensuite':'Critique fréquent'); if(f.protect) o.push('Bloque l’attaque adverse ce tour (moins sûr si répété)');
  if(f.counter) o.push('Renvoie le double des dégâts '+(f.counter==='phy'?'physiques':'spéciaux')+' reçus ce tour');
  if(f.charge===1) o.push('Se prépare un tour'+(f.inv?' (intouchable pendant la préparation)':'')+', frappe au suivant'); if(f.charge==='wx') o.push('Charge un tour, sauf sous Canicule ou Aurore');
  if(f.recharge) o.push('Doit refroidir le tour suivant'); if(f.weather) o.push('Déclenche : '+CB_WX[f.weather].n+' (5 tours)');
  if(f.trap) o.push('Coince l’adversaire 4 à 5 tours (1/8 par tour)'); if(f.ring) o.push('Récupère 1/16 par tour'); if(f.leech) o.push('Vole 1/8 du blindage adverse chaque tour');
  if(f.taunt) o.push('L’adversaire ne peut plus que attaquer ('+f.taunt+' tours)'); if(f.reset) o.push('Annule tous les crans des deux voitures');
  if(f.energy) o.push('+'+f.energy+' d’Énergie'); if(f.esteal) o.push('Vole '+f.esteal+' d’Énergie'); if(f.selfko) o.push('La voiture est mise K.O.');
  if(f.facade) o.push('Puissance doublée si la voiture subit une altération'); if(f.jarnac) o.push('Puissance doublée si l’adversaire subit une altération');
  if(f.gyro) o.push('Plus fort si la voiture est plus lente'); if(f.rand) o.push('Puissance aléatoire de 10 à 150'); if(f.revenge) o.push('Double si la voiture a été touchée ce tour');
  if(f.first) o.push('Seulement au premier tour'); if(f.force) o.push('Force l’adversaire à changer de voiture'); if(f.copy) o.push('Reprend la dernière attaque adverse');
  if(f.shield) o.push('Sacrifie '+pct(f.shield)+' du blindage pour un bouclier'); if(f.hazard) o.push('Gravillons : les voitures adverses qui entrent perdent 1/8');
  if(f.veil) o.push('Dégâts reçus divisés par 2 pendant 5 tours'); if(f.ignore) o.push('Ignore les crans de l’adversaire'); if(f.wxacc) o.push('Ne rate jamais sous '+f.wxacc.map(w=>CB_WX[w].n).join(' ou '));
  if(f.thaw) o.push('Dégèle la voiture'); return o.join('. ')+'.'; }
/* les attaques à Énergie (ultimes, légendaires) ne vont pas dans les 4 emplacements : chaque voiture a son ULTIME attitrée */
const cbLearnable=(types,lv)=>Object.values(CB_MV).filter(m=>!m.e&&(m.t==='meca'||types.includes(m.t))&&m.lv<=lv).sort((a,b)=>a.lv-b.lv);
function cbUltOf(ty,lv){ const all=Object.values(CB_MV).filter(m=>m.e>0), t=ty[0];
  const leg=all.filter(m=>m.e>=100&&m.t===t&&lv>=m.lv)[0]||(lv>=46&&!all.some(m=>m.e>=100&&m.t===t)?CB_MV.bombestellaire:null);
  return (leg||all.find(m=>m.e<100&&m.t===t)||CB_MV.modecourse).id; }

/* ---- talents (compétences passives, 1 par voiture) ----
   k : déclencheur lu par le moteur (pinch, immune, absorb, entry, wxset, turn, stat, dmgIn, dmgOut, crit, contact, guard...) */
const CB_TAL={
  turbo:     {n:'Turbo surchauffé',k:'pinch',t:'feu',d:'Attaques Feu ×1,5 quand le blindage passe sous 1/3.'},
  torrent:   {n:'Pompe de secours',k:'pinch',t:'eau',d:'Attaques Eau ×1,5 quand le blindage passe sous 1/3.'},
  givrage:   {n:'Givrage d’urgence',k:'pinch',t:'glace',d:'Attaques Glace ×1,5 quand le blindage passe sous 1/3.'},
  cryo:      {n:'Refroidissement cryo',k:'immune',st:['brule'],dmgIn:{feu:.5},d:'Ne surchauffe jamais et encaisse moitié moins de dégâts Feu.'},
  zephyr:    {n:'Aérodynamisme zéphyr',k:'turn',d:'Reprise +1 cran à la fin de chaque tour.'},
  ombre:     {n:'Carrosserie ombre',k:'dodge',d:'20 % de chances d’esquiver une attaque physique ; esquive +1 sous Nuit cosmique.'},
  solaire:   {n:'Alternateur solaire',k:'turn',d:'Récupère 1/16 du blindage par tour (×2 sous Canicule ou Aurore).'},
  blinde:    {n:'Châssis blindé',k:'guard',d:'Immunisé aux coups critiques, dégâts physiques reçus −10 %.'},
  nitro:     {n:'Injection nitro',k:'energy',d:'Commence avec 30 d’Énergie et en gagne 5 de plus par tour.'},
  intimid:   {n:'Klaxon intimidant',k:'entry',d:'À son entrée, baisse la Puissance moteur adverse d’un cran.'},
  epines:    {n:'Pare-chocs épineux',k:'contact',d:'Un attaquant au contact perd 1/8 de son blindage.'},
  hybride:   {n:'Moteur hybride',k:'stab',d:'Bonus de même type ×2 au lieu de ×1,5.'},
  compresseur:{n:'Turbo-compresseur',k:'dmgOut',d:'Attaques de puissance 60 ou moins ×1,5.'},
  prudent:   {n:'Pilote prudent',k:'norecoil',d:'Ne subit jamais de contrecoup.'},
  refroid:   {n:'Liquide de refroidissement',k:'absorb',t:'eau',d:'Les attaques Eau le réparent de 1/4 au lieu de le blesser.'},
  paraton:   {n:'Paratonnerre',k:'absorb',t:'elec',boost:'spa',d:'Absorbe l’Électrik : aucun dégât et Surcharge +1.'},
  pneusneige:{n:'Pneus neige',k:'wxspeed',wx:'tempete',d:'Reprise ×2 sous Tempête de glace, insensible à ses dégâts.'},
  panneaux:  {n:'Panneaux solaires',k:'wxpow',wx:['canicule','aurore'],d:'Surcharge ×1,5 sous Canicule ou Aurore.'},
  xenon:     {n:'Phares xénon',k:'acc',d:'Précision ×1,2 et jamais aveuglé par la Fumée.',st:['aveugle']},
  filtre:    {n:'Filtre à huile',k:'immune',st:['poison','poison2'],d:'Immunisé aux fuites d’huile.'},
  fusible:   {n:'Fusible renforcé',k:'immune',st:['para'],d:'Immunisé au court-circuit.'},
  antigel:   {n:'Antigel',k:'immune',st:['gel'],d:'Ne gèle jamais.'},
  gyroscope: {n:'Gyroscope',k:'nodrop',d:'L’adversaire ne peut pas baisser ses crans ; immunisé à la Surtension.'},
  increvable:{n:'Mécanique increvable',k:'sturdy',d:'Avec un blindage plein, survit toujours à 1 PV.'},
  rage:      {n:'Rage du moteur',k:'defiant',d:'Puissance moteur +2 crans quand l’adversaire baisse ses crans.'},
  demarrage: {n:'Démarrage canon',k:'firstprio',d:'Sa toute première attaque du combat agit en premier.'},
  sequentielle:{n:'Boîte séquentielle',k:'crit',d:'Coups critiques un cran plus fréquents.'},
  echappement:{n:'Échappement libre',k:'serene',d:'Chances d’effets secondaires doublées.'},
  reactif:   {n:'Blindage réactif',k:'filter',d:'Dégâts super efficaces reçus ×0,75.'},
  regen:     {n:'Régénération',k:'switch',d:'Récupère 1/3 du blindage en sortant du combat.'},
  miroir:    {n:'Contre-braquage',k:'bounce',d:'Renvoie les baisses de crans à l’adversaire.'},
  ciel:      {n:'Ciel clair',k:'nowx',d:'Annule les effets de la météo tant qu’il est en jeu.'},
  brumisateur:{n:'Brumisateur',k:'wxset',wx:'pluie',d:'À son entrée : Pluie torrentielle.'},
  four:      {n:'Four solaire',k:'wxset',wx:'canicule',d:'À son entrée : Canicule.'},
  cryogenie: {n:'Cryogénie',k:'wxset',wx:'tempete',d:'À son entrée : Tempête de glace.'},
  nuagenoir: {n:'Nuage noir',k:'wxset',wx:'nuit',d:'À son entrée : Nuit cosmique.'},
  tesla:     {n:'Bobine Tesla',k:'wxset',wx:'orage',d:'À son entrée : Orage magnétique.'},
  halo:      {n:'Halo',k:'wxset',wx:'aurore',d:'À son entrée : Aurore boréale.'}
};
/* talents possibles par type (le premier type de la voiture décide, tiré au hasard à l'acquisition) */
const CB_TAL_BY={feu:['turbo','four','echappement','compresseur'],eau:['torrent','refroid','brumisateur','regen'],glace:['givrage','antigel','cryogenie','pneusneige'],
  vent:['zephyr','demarrage','sequentielle','ciel'],tene:['ombre','nuagenoir','intimid','rage'],lum:['solaire','halo','xenon','panneaux'],
  elec:['paraton','tesla','fusible','nitro'],acier:['blinde','epines','gyroscope','increvable'],terre:['reactif','filtre','prudent','miroir'],meca:['nitro','hybride','prudent','increvable']};

/* ---- objets de combat (achetables / gagnés en tournoi, 4 utilisations max par combat) ---- */
const CB_IT={
  kit:     {n:'Kit de réparation',ic:'🔧',heal:.35,px:400,d:'Répare 35 % du blindage.'},
  superkit:{n:'Super kit',ic:'🧰',heal:.65,px:1200,d:'Répare 65 % du blindage.'},
  revision:{n:'Révision complète',ic:'🛠️',heal:1,cure:1,px:4000,d:'Blindage plein et toutes les altérations soignées.'},
  nitrorec:{n:'Recharge nitro',ic:'🧪',energy:50,px:900,d:'+50 d’Énergie.'},
  ppmax:   {n:'Bidon d’huile moteur',ic:'🛢️',pp:5,px:1500,d:'Rend 5 PP à toutes les attaques.'},
  antidote:{n:'Antidote mécanique',ic:'🧴',cure:['poison','poison2'],px:300,d:'Colmate les fuites d’huile.'},
  extinct: {n:'Extincteur',ic:'🧯',cure:['brule'],px:300,d:'Éteint une surchauffe.'},
  degivre: {n:'Dégivreur',ic:'🌡️',cure:['gel'],px:300,d:'Fait fondre le verglas.'},
  fusibleit:{n:'Fusible de rechange',ic:'🔌',cure:['para'],px:300,d:'Répare un court-circuit.'},
  laveglace:{n:'Lave-glace',ic:'🫧',cure:['aveugle'],px:250,d:'Chasse la fumée.'},
  regul:   {n:'Régulateur de tension',ic:'🎛️',cure:['confus'],px:350,d:'Calme une surtension.'},
  turbox:  {n:'Turbo X',ic:'💥',sb:{atk:2},px:1800,d:'Puissance moteur +2 crans.'},
  chassisx:{n:'Châssis X',ic:'🧱',sb:{def:2},px:1800,d:'Châssis +2 crans.'},
  surchx:  {n:'Bobine X',ic:'🌀',sb:{spa:2},px:1800,d:'Surcharge +2 crans.'},
  isolx:   {n:'Isolant X',ic:'🔰',sb:{spd:2},px:1800,d:'Isolation +2 crans.'},
  reprisex:{n:'Reprise X',ic:'⏱️',sb:{vit:2},px:1800,d:'Reprise +2 crans.'},
  depann:  {n:'Kit de remorquage',ic:'🚚',revive:.5,px:3500,d:'Remet en état une voiture K.O. (50 % du blindage).'}
};
const CB_IT_MAX=4;
const CB_ENERGY={start:25,turn:9,hit:13,deal:15,max:100};                 /* jauge d'ultime : 25 au départ, +9 par tour, +15 quand on touche, +13 quand on est touché (≈ 1 ultime par voiture et par duel) */
