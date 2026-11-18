/* ===== v1.7 : Rue Néon — pilotes humanoïdes en 3D à défier, 8 champions d'arène (1 par type) et leurs badges =====
   Tout est rangé dans S.rue = {w:{id:nb de victoires}, bdg:{type:date}} ; les duels passent par cbStartDuel (new54). */

/* ---------- 1. pilotes de rue (niveaux variés, certains attendent que tu aies des badges) ----------
   L = tenue : [combinaison, bande, peau, cheveux, coiffure (0 court, 1 long, 2 rasé, 3 queue), casque, casque (0 sur la tête, 1 à la main, 2 aucun)] */
const RUE_PIL=[
  {id:'kev',nm:'Kevin « Jante » Lopez',lv:3,ty:'terre',cars:['epave'],bd:0,L:['#7a5230','#f2c14e','#e0ac80','#2a1a10',0,'#f2c14e',1],sty:'Il traîne devant la casse avec sa vieille épave.',
    pre:'Hé, toi ! Ta caisse brille trop. On va la salir un peu.',win:'Haha ! La rouille, ça s’attrape.',lose:'Ok, ok… T’as gagné. Je retourne bricoler.'},
  {id:'sarah',nm:'Sarah Piston',lv:5,ty:'vent',cars:['piccola','riva'],bd:0,L:['#1fb88a','#ffffff','#f1c7a5','#c0392b',3,'#ffffff',1],sty:'Petite voiture, gros caractère.',
    pre:'Tu crois que la taille compte ? Attends de voir ma Piccola.',win:'Trop rapide pour toi !',lose:'Bien joué… mais je reviendrai plus vite.'},
  {id:'momo',nm:'Momo Klaxon',lv:7,ty:'eau',cars:['kombi','subi'],bd:0,L:['#2b6cff','#ffd400','#8d5a3b','#111111',2,'#2b6cff',2],sty:'Toujours le klaxon à fond, toujours en retard.',
    pre:'POUET POUET ! Pousse-toi, j’ai un duel à gagner !',win:'Tu l’as entendu venir, celui-là ?',lose:'Pouet… pouet… Bon, t’es fort.'},
  {id:'jess',nm:'Jess Turbine',lv:9,ty:'feu',cars:['touge','hauler'],bd:0,L:['#e2402b','#111111','#f5d0b5','#f4d03f',1,'#e2402b',1],sty:'Elle chauffe ses pneus même à l’arrêt.',
    pre:'Ça sent le brûlé ? Normal, c’est moi.',win:'Trop chaud, hein ?',lose:'J’ai cramé mes pneus pour rien… Respect.'},
  {id:'hugo',nm:'Hugo Watt',lv:12,ty:'elec',cars:['riva','gts'],bd:1,L:['#ffd400','#222222','#e9b893','#3b2a20',0,'#ffd400',0],sty:'Il recharge sa voiture sur les lampadaires.',
    pre:'J’ai 100 % de batterie. Et toi ?',win:'Court-circuit ! Rentre à la maison.',lose:'Batterie à plat… Bien joué.'},
  {id:'lou',nm:'Lou Frimas',lv:15,ty:'glace',cars:['steppe','audi'],bd:2,L:['#9ef0ff','#2b4b7a','#fbe3d0','#e8f4ff',1,'#ffffff',1],sty:'Calme, froide, précise.',
    pre:'On va voir si tu tiens sur le verglas.',win:'Tu as glissé.',lose:'Un dégel… inattendu.'},
  {id:'dede',nm:'Dédé Cambouis',lv:18,ty:'acier',cars:['epave','audi','rossa'],bd:2,L:['#5b6270','#ff7a1a','#d9a37e','#777777',2,'#5b6270',2],sty:'Mécano depuis 40 ans. Ses voitures ne meurent jamais.',
    pre:'Mes voitures, je les répare avec du fil de fer. Et elles gagnent.',win:'Rien ne vaut une bonne carrosserie.',lose:'Tu m’as eu, gamin. Passe au garage, je t’offre un café.'},
  {id:'yas',nm:'Yasmine Phare',lv:21,ty:'lum',cars:['merco','piccola','volta'],bd:3,L:['#ffffff','#ffcf33','#c98d63','#1b1b1b',1,'#ffe66b',1],sty:'Ses phares aveuglent tout le quartier.',
    pre:'Ferme les yeux si tu veux. Ça ne changera rien.',win:'Ébloui, hein ?',lose:'Tu as vu à travers ma lumière. Joli.'},
  {id:'rico',nm:'Rico Nitro',lv:25,ty:'feu',cars:['rx4','fury','rossa'],bd:4,L:['#111111','#ff2bd6','#b07650','#111111',0,'#ff2bd6',0],sty:'Roi des départs canon, il vit à 9 000 tours.',
    pre:'Trois, deux, un… trop tard, j’ai déjà gagné.',win:'Nitro, bébé !',lose:'T’as un meilleur départ que moi. Ça m’énerve.'},
  {id:'clara',nm:'Clara Brume',lv:29,ty:'eau',cars:['aurion','subi','kombi'],bd:5,L:['#14365c','#00e5ff','#f0c8a8','#5a2d82',3,'#00e5ff',1],sty:'Elle apparaît avec le brouillard et repart avec ta fierté.',
    pre:'Le brouillard se lève. Tu ne verras rien venir.',win:'Perdu dans la brume…',lose:'Le brouillard s’est dissipé. Tu es fort.'},
  {id:'ombre',nm:'L’Ombre du Pont',lv:34,ty:'tene',cars:['solus','fury','majestic'],bd:6,L:['#1a1026','#8a5cff','#c9a48a','#000000',0,'#1a1026',0],sty:'Personne n’a vu son visage. Il attend sous le pont.',
    pre:'…',win:'Retourne dans la lumière.',lose:'… Rares sont ceux qui me voient venir.'},
  {id:'victor',nm:'Victor « V12 » Sauvage',lv:39,ty:'meca',cars:['touge','gts','rx4','rossa'],bd:7,L:['#c0c4d0','#e2402b','#e8b996','#a0a0a0',2,'#c0c4d0',1],sty:'Ancien champion de la ville. Il attend le prochain.',
    pre:'Sept badges ? Montre-moi si tu les mérites.',win:'Pas encore. Reviens plus fort.',lose:'La relève est là. Va prendre le dernier badge.'}
];
/* ---------- 2. champions d'arène : 1 par type, à battre dans l'ordre (comme les arènes de Pokémon) ---------- */
const RUE_CH=[
  {ty:'feu',  nm:'Vega « Salamandre »',lv:8, team:2,cars:['touge','hauler','fury'],wx:'canicule',ar:'Garage Brasier',bn:'Badge Braise',L:['#c0261b','#ffb000','#e9b48e','#ff7a1a',1,'#ffb000',1],
    pre:'Mon arène est un four. Tu tiendras combien de tours ?',win:'Tu as fondu. Reviens quand tu supporteras la chaleur.',lose:'Ta flamme brûle plus fort que la mienne. Prends ce badge.'},
  {ty:'eau',  nm:'Marin Delcourt',lv:12,team:3,cars:['kombi','subi','aurion'],wx:'pluie',ar:'Station Lavage Néon',bn:'Badge Torrent',L:['#0f4fa8','#7fe8ff','#c48a62','#101820',0,'#0f4fa8',2],
    pre:'Ici, tout finit rincé. Ta voiture aussi.',win:'Emporté par le courant !',lose:'Tu as remonté le courant. Le Badge Torrent est à toi.'},
  {ty:'vent', nm:'Zoé Cyclone',lv:16,team:3,cars:['piccola','riva','gts','solus'],ar:'Les Toits',bn:'Badge Rafale',L:['#14a37f','#e8fff6','#f6d5bd','#ffffff',3,'#e8fff6',1],
    pre:'Là-haut, le vent décide. Et le vent, c’est moi.',win:'Balayé !',lose:'Tu as tenu face à la tempête. Prends le Badge Rafale.'},
  {ty:'elec', nm:'Nikola Ampère',lv:20,team:3,cars:['riva','volta','rx4','aurion'],wx:'orage',ar:'Centrale Ampère',bn:'Badge Volt',L:['#f2c200','#1d1d1d','#efc6a6','#d9d9d9',0,'#1d1d1d',0],
    pre:'Cent mille volts. Tu es sûr de vouloir toucher ?',win:'Grillé.',lose:'Tu as tout absorbé… Le Badge Volt te revient.'},
  {ty:'glace',nm:'Freya Nordahl',lv:25,team:4,cars:['steppe','audi','steppe'],wx:'tempete',ar:'Patinoire Nord',bn:'Badge Givre',L:['#dff7ff','#3a7bd5','#fde9dc','#f5f5f5',1,'#3a7bd5',1],
    pre:'Personne n’a jamais dérapé sur ma glace… sans tomber.',win:'Gelé sur place.',lose:'Tu as fait fondre mon arène. Voici le Badge Givre.'},
  {ty:'terre',nm:'Bernard « le Roc »',lv:30,team:4,cars:['kombi','steppe','hauler','epave'],ar:'La Carrière',bn:'Badge Roc',L:['#8a5a2b','#3b2a1a','#a8714f','#3b2a1a',2,'#8a5a2b',2],
    pre:'Mes camions ont écrasé plus de rivaux que de cailloux.',win:'Enterré !',lose:'Tu as fait trembler la carrière. Le Badge Roc est à toi.'},
  {ty:'lum',  nm:'Aurélien Prisme',lv:36,team:4,cars:['piccola','merco','volta','majestic'],wx:'aurore',ar:'Galerie Prisme',bn:'Badge Aurore',L:['#fff6d6','#ffcf33','#f3cfb3','#ffe9a8',1,'#ffffff',1],
    pre:'Chaque reflet de ma galerie est un piège.',win:'Ébloui jusqu’au bout.',lose:'Tu as traversé la lumière. Prends le Badge Aurore.'},
  {ty:'tene', nm:'Nyx',lv:42,team:4,cars:['fury','majestic','solus'],wx:'nuit',ar:'Tunnel Noir',bn:'Badge Éclipse',L:['#120a1e','#b07cff','#d7b8a4','#2a0f45',1,'#120a1e',0],
    pre:'Bienvenue au bout du tunnel. Personne n’en ressort.',win:'La nuit t’a avalé.',lose:'Tu as vu la lumière au bout du tunnel… Le dernier badge est à toi.'}
];
RUE_CH.forEach((c,i)=>{ c.id='ch_'+c.ty; c.i=i; c.k='c'; c.sty='Gardien·ne du '+c.bn;
  c.rw={cr:Math.round(3500*Math.pow(i+1,1.45)/100)*100,tok:2+2*i,it:i<3?{kit:3,superkit:1}:i<6?{superkit:3,revision:1}:{revision:2,depann:1}}; });
RUE_PIL.forEach(p=>{ p.k='p'; });
const rueSt=()=>{ if(!S.rue) S.rue={w:{},bdg:{}}; return S.rue; };
const rueNB=()=>Object.keys(rueSt().bdg).length;
const rueGet=id=>RUE_PIL.find(p=>p.id===id)||RUE_CH.find(c=>c.id===id);
const rueAll=()=>RUE_PIL.concat(RUE_CH).slice().sort((a,b)=>a.lv-b.lv||(a.k==='c')-(b.k==='c'));
const rueOpenB=P=>P.k==='c'?(P.i===0||!!rueSt().bdg[RUE_CH[P.i-1].ty]):rueNB()>=P.bd;
/* l'histoire : on rencontre d'abord chaque pilote dans la Région Néon ; la Rue Néon ne propose que des revanches */
const rueWorld=()=>typeof W!=='undefined'&&W.on;
const rueTownOf=P=>typeof W_TOWNS!=='undefined'?W_TOWNS[P.k==='c'?P.i+1:P.bd]:null;
const rueOpen=P=>rueOpenB(P)&&(rueWorld()||!!rueSt().w[P.id]);
const rueLock=P=>rueOpenB(P)&&!rueWorld()?'Rencontre-le d’abord dans la Région Néon, à '+((rueTownOf(P)||{}).nm||'sa ville'):P.k==='c'?`Bats d’abord ${RUE_CH[P.i-1].nm} (${RUE_CH[P.i-1].bn})`:`Il faut ${P.bd} badge${P.bd>1?'s':''} pour le défier`;
const rueN=P=>P.k==='c'?P.team:P.lv<8?1:P.lv<20?2:P.lv<30?3:4;
const rueD=P=>P.k==='c'?(P.i<2?2:3):P.lv<10?1:P.lv<26?2:3;
const rueCr=P=>Math.round((250+P.lv*P.lv*9)/50)*50;
const rueCol=P=>CB_TYPES[P.ty].c;
function rueFoes(P){ const n=rueN(P), out=[], base=Math.min(17,8+Math.round(P.lv*.25));
  for(let k=0;k<n;k++){ const mid=P.cars[k%P.cars.length], ty=cbTypesOf(mid), iv={}; CB_SK.forEach(x=>iv[x]=clamp(base+Math.floor(Math.random()*7)-3,0,31));
    out.push({mid,lv:clamp(P.lv-(n-1-k)*(P.k==='c'&&P.lv<34?1:2),1,CB_LVMAX),iv,tal:(CB_TAL_BY[ty[0]]||CB_TAL_BY.meca)[k%4]}); } return out; }

/* ---------- 3. défi : dialogue → duel → dialogue (+ badge) ---------- */
function rueFight(id){ const P=rueGet(id); if(!P||!cbAwake()) return; if(!rueOpen(P)) return toast('🔒 '+rueLock(P)); if(!cbTeam().length) return toast('Choisis d’abord une équipe (Arène › Équipe)');
  const champ=P.k==='c'; RUE.fight={id,res:null};
  cbStartDuel({team:cbTeam(),foes:rueFoes(P),d:rueD(P),names:['Toi',P.nm],trainer:true,wx:P.wx,
    rewardHTML:w=>w?`<div class="cb-rw">${champ&&!rueSt().bdg[P.ty]?'🎖️ '+P.bn+' obtenu !':'🏁 Victoire contre '+P.nm}</div>`:`<div class="cb-rw lose">${P.nm} remporte le duel</div>`,
    onEnd:res=>{ const st=rueSt(), cs=cbSt(), F=RUE.fight; if(!F) return;
      if(res.win){ cs.w++; const first=!st.w[P.id]; st.w[P.id]=(st.w[P.id]||0)+1; F.first=first;
        if(champ){ F.got=cbGive(P.rw,first?1:.3); if(!st.bdg[P.ty]){ st.bdg[P.ty]=Date.now(); F.badge=1; } }
        else { const c=Math.round(rueCr(P)*(first?1:.25)); S.neo=(S.neo||0)+c; F.got=[neoT(c)]; } }
      else cs.l++;
      F.res=res.win?'win':'lose'; save(); },
    onClose:()=>{ const F=RUE.fight; RUE.fight=null; if(!F||!F.res) return; openSheet({t:'rue',id:F.id,ph:F.res,got:F.got||[],first:F.first,badge:F.badge}); if(F.badge) try{ cbSfx('win'); }catch(_){} } }); }

function rueBadgeHTML(c,big){ const got=!!rueSt().bdg[c.ty], T=CB_TYPES[c.ty];
  return `<div class="bdg ${got?'on':''} ${big?'big':''}" style="--bc:${T.c}"><i>${got?T.ic:'?'}</i></div>`; }
function rueAvatar(P){ return `<span class="rue-av" style="--pc:${rueCol(P)};--sc:${P.L[0]}">${P.k==='c'?'👑':CB_TYPES[P.ty].ic}</span>`; }
function rueSheetHTML(P,sh){ const st=rueSt(), open=rueOpen(P), champ=P.k==='c', wins=st.w[P.id]||0, n=rueN(P);
  const head=`<div class="cbp rue-p" style="--pc:${rueCol(P)}">${rueAvatar(P)}<div><b>${P.nm}</b><small>Niv. ${P.lv} · ${CB_TYPES[P.ty].ic} ${CB_TYPES[P.ty].n}${champ?' · '+P.ar:''}</small><small>${P.sty}</small></div></div>`;
  if(sh.ph==='win') return `<div class="cbtalk lose">${head}<div class="ct-bub" style="--pc:${rueCol(P)}">« ${P.lose} »</div>
      ${sh.badge?`<div class="rue-got">${rueBadgeHTML(P,1)}<b>${P.bn} obtenu !</b><small>${rueNB()}/8 badges${P.i<7?' · Prochaine arène : '+RUE_CH[P.i+1].ar+' ('+CB_TYPES[RUE_CH[P.i+1].ty].n+')':' · Tous les badges réunis !'}</small></div>`:''}
      <div class="ulist">${(sh.got||[]).map(g=>`<div class="ul-r"><i>🎁</i><div><b>${g}</b></div></div>`).join('')}</div>
      ${!sh.first?'<p class="note sm">Revanche : récompense réduite.</p>':''}<button class="btn wide" data-a="ruedone">Retour à la Rue Néon</button></div>`;
  if(sh.ph==='lose') return `<div class="cbtalk win">${head}<div class="ct-bub" style="--pc:${rueCol(P)}">« ${P.win} »</div>
      <p class="note">Niveau de ton équipe : <b>${cbTeamLv()}</b> · ${P.nm} : niveau <b>${P.lv}</b>. Fais des courses ou des duels pour monter tes voitures, puis reviens.</p>
      <div class="tu-btns"><button class="btn alt" data-a="ruedone">Retour</button><button class="btn" data-a="ruefight" data-id="${P.id}">🔁 Revanche</button></div></div>`;
  const cars=P.cars.slice(0,n).map((mid,k)=>`<span>${cbTypesOf(mid).map(x=>CB_TYPES[x].ic).join('')} ${M[mid]?M[mid].nom:mid} <em>niv. ${clamp(P.lv-(n-1-k)*(champ&&P.lv<34?1:2),1,CB_LVMAX)}</em></span>`).join('');
  const rw=champ?(st.bdg[P.ty]?cbRwTxt(P.rw)+' (30 % en revanche)':'🎖️ '+P.bn+' · '+cbRwTxt(P.rw)):neoT(rueCr(P))+(wins?' · revanche : '+neoT(Math.round(rueCr(P)*.25)):'');
  return `<div class="cbtalk pre">${champ?`<div class="ct-cup">👑 Arène ${CB_TYPES[P.ty].n} · ${P.ar}</div>`:''}${head}
    <div class="ct-bub" style="--pc:${rueCol(P)}">« ${open?P.pre:'Reviens quand tu auras fait tes preuves.'} »</div>
    ${open?`<div class="ct-foes">${cars}</div>${P.wx?`<p class="note sm">${CB_WX[P.wx].ic} Le duel se déroule sous ${CB_WX[P.wx].n}.</p>`:''}
      <p class="note sm">Récompense : ${rw}${wins?` · déjà battu ×${wins}`:''}</p>
      <div class="tu-btns"><button class="btn alt" data-a="ruedone">Plus tard</button><button class="btn" data-a="ruefight" data-id="${P.id}">⚔️ Défier</button></div>`
    :`<p class="note">🔒 ${rueLock(P)}.</p><button class="btn alt wide" data-a="ruedone">Retour</button>`}</div>`; }
{ const _sx=sheetExtra; sheetExtra=function(X){ if(sheet&&sheet.t==='rue'){ const P=rueGet(sheet.id); if(!P){ closeSheet(); return true; } $('sheet').innerHTML=X+rueSheetHTML(P,sheet); return true; } return _sx.apply(this,arguments); }; }

/* ---------- 4. page Arène : sous-onglets Rue Néon et Badges en plus ---------- */
AR.tab='rue';
{ const _va=vArena; vArena=function(){ if(!cbAwake()) return _va.apply(this,arguments);
  const st=cbSt(), rs=rueSt(), nb=rueNB();
  const T=[['rue','🌃 Rue'],['badges','🎖️ Badges'],['cups','🏆 Coupes'],['team','🚗 Équipe'],['shop','🛒 Shop']];
  const tabs=`<div class="subtabs arsw ar5">${T.map(x=>`<button data-a="artab" data-id="${x[0]}" ${AR.tab===x[0]?'aria-current="true"':''}>${x[1]}</button>`).join('')}</div>`+(['team','shop'].includes(AR.tab)?`<button class="btn alt wide ar-back" data-a="artab" data-id="rue">← Retour à la Rue Néon</button>`:'');
  const head=`<div class="head"><h2>Arène</h2><p>🎖️ ${nb}/8 · ${st.w} V · ${st.l} D</p></div>`;
  let body;
  if(AR.tab==='rue'){ const g=glEnsure();
    body=`<div class="rue-strip">${RUE_CH.map(c=>rueBadgeHTML(c)).join('')}</div>
      ${g?`<div class="rue3d" id="rue3d"><div class="rue-hint">← Glisse pour te promener · touche un pilote →</div></div>`:`<p class="note">La 3D n’est pas disponible : choisis un pilote dans la liste.</p>`}
      <div class="rue-list">${rueAll().map(P=>{ const open=rueOpen(P), w=rs.w[P.id], champ=P.k==='c', got=champ&&rs.bdg[P.ty];
        return `<button class="rue-r ${open?'':'lock'} ${champ?'champ':''} ${w?'beat':''}" data-a="ruego" data-id="${P.id}" style="--pc:${rueCol(P)}">${rueAvatar(P)}<div><b>${P.nm}</b><small>${champ?'👑 Champion · '+P.ar:CB_TYPES[P.ty].ic+' '+CB_TYPES[P.ty].n+' · '+rueN(P)+' voiture'+(rueN(P)>1?'s':'')}</small></div><em>${open?(got?'🎖️':w?'✓':'Niv. '+P.lv):'🔒'}</em></button>`; }).join('')}</div>`; }
  else if(AR.tab==='badges'){
    body=`<div class="bdg-case">${RUE_CH.map(c=>`<button class="bdg-c" data-a="ruego" data-id="${c.id}">${rueBadgeHTML(c,1)}<b>${c.bn}</b><small>${rs.bdg[c.ty]?'Obtenu':rueOpen(c)?'Champion niv. '+c.lv:'🔒'}</small></button>`).join('')}</div>
      <p class="note">Bats les 8 champions d’arène dans l’ordre pour réunir les badges. Chaque badge ouvre l’arène suivante et de nouveaux pilotes dans la Rue Néon.${nb>=8?' <b>Les 8 badges sont réunis : la Ligue Néon arrive bientôt.</b>':''}</p>`; }
  else { const s=_va.apply(this,arguments), k=s.indexOf('<div class="arena">'); return head+tabs+(k>=0?s.slice(k):s); }
  return head+tabs+`<div class="arena">${body}</div>`; }; }
Object.assign(ACT,{
  ruego(d){ const P=rueGet(d.id); if(!P) return; RUE.focus=P.id; if(RUE.pos&&RUE.pos[P.id]!=null){ RUE.tx=RUE.pos[P.id]; RUE.v=0; } openSheet({t:'rue',id:P.id,ph:'pre'}); try{ ui('click'); }catch(_){} },
  ruefight(d){ rueFight(d.id); },
  ruedone(){ closeSheet(); if(view==='arena') render(); }
});

/* ---------- 5. la rue en 3D ---------- */
const RUE={sc:null,cam:null,x:0,tx:0,v:0,t:0,hum:[],hits:[],pos:{},key:'',drag:null,bound:false,fight:null,busy:0,min:0,max:0};
const RUE_DX=7, RUE_Z=-1.4;
function rueHuman(L,champ,tyc){ const [suit,str,skin,hair,hs,helm,hm]=L, g=new THREE.Group();
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), mS=lam(suit), mT=lam(str), mK=lam(skin), mH=lam(hair), mB=lam(0x121218), mG=lam(0x1c1c24);
  const mHe=new THREE.MeshPhongMaterial({color:helm,shininess:80,specular:0x666666}), mV=new THREE.MeshPhongMaterial({color:0x0a0a14,shininess:120,specular:0x99aaff});
  const box=(w,h,d,m,x,y,z,p)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); (p||g).add(o); return o; };
  const ball=(r,m,x,y,z,p,ts)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,12,0,Math.PI*2,0,ts||Math.PI),m); o.position.set(x,y,z); (p||g).add(o); return o; };
  /* combinaison : bandes et écusson sur le torse */
  const tt=ctex(64,64,(x,W,H)=>{ x.fillStyle=suit; x.fillRect(0,0,W,H); x.fillStyle=str; x.fillRect(W*.42,0,W*.16,H); x.fillRect(0,H*.78,W,H*.08);
    x.fillStyle='#ffffff'; x.fillRect(8,14,16,10); x.fillStyle=str; x.fillRect(10,16,12,6); x.fillStyle='rgba(255,255,255,.85)'; x.fillRect(42,14,14,4); x.fillRect(42,20,10,3); });
  const mTo=new THREE.MeshLambertMaterial({map:tt});
  [-1,1].forEach(s=>{ box(.2,.8,.22,mS,s*.12,.5,0); box(.05,.8,.225,mT,s*.215,.5,0); box(.22,.14,.32,mB,s*.12,.07,.04); });
  box(.46,.2,.26,mS,0,.98,0);
  const chest=new THREE.Group(); chest.position.y=1.08; g.add(chest);
  const to=new THREE.Mesh(new THREE.BoxGeometry(.52,.56,.28),[mS,mS,mS,mS,mTo,mS]); to.position.y=.28; chest.add(to);
  box(.3,.06,.22,mT,0,.58,0,chest);
  if(champ){ const mE=new THREE.MeshLambertMaterial({color:tyc,emissive:tyc,emissiveIntensity:.8}); [-1,1].forEach(s=>box(.2,.05,.24,mE,s*.3,.57,0,chest)); box(.53,.04,.29,mE,0,.04,0,chest); }
  const arms=[-1,1].map(s=>{ const a=new THREE.Group(); a.position.set(s*.34,.52,0); chest.add(a); box(.15,.58,.17,mS,0,-.29,0,a); box(.155,.06,.175,mT,0,-.45,0,a); ball(.08,mG,0,-.63,0,a); a.rotation.z=s*.1; return a; });
  box(.11,.1,.11,mK,0,.64,0,chest);
  const head=new THREE.Group(); head.position.y=.82; chest.add(head);
  ball(.14,mK,0,0,0,head); [-1,1].forEach(s=>box(.03,.03,.02,mB,s*.05,.01,.13,head)); box(.06,.015,.02,lam(0x8a3a3a),0,-.06,.13,head);
  if(hm===0){ ball(.185,mHe,0,.01,0,head); box(.27,.1,.06,mV,0,.0,.16,head); box(.04,.2,.36,mT,0,.09,0,head); }
  else { if(hs!==2) ball(.15,mH,0,.02,-.01,head,Math.PI*.55); if(hs===1) box(.28,.26,.08,mH,0,-.1,-.09,head); if(hs===3){ const p=new THREE.Mesh(new THREE.CylinderGeometry(.04,.02,.26,8),mH); p.position.set(0,-.08,-.17); p.rotation.x=.5; head.add(p); }
    if(hm===1){ const h=new THREE.Group(); h.position.set(.02,-.74,.1); arms[1].add(h); ball(.17,mHe,0,0,0,h); box(.22,.09,.06,mV,0,.01,.15,h); box(.035,.17,.32,mT,0,.07,0,h); arms[1].rotation.x=-.35; } }
  if(champ) g.scale.setScalar(1.08);
  return {g,chest,arms,head,ph:Math.random()*6}; }
function rueLabel(P){ const st=rueSt(), open=rueOpen(P), w=st.w[P.id], champ=P.k==='c', got=champ&&st.bdg[P.ty];
  const t=ctex(512,150,(x,W,H)=>{ x.clearRect(0,0,W,H); const r=26; x.fillStyle=open?'rgba(14,10,30,.86)':'rgba(30,30,38,.8)'; x.beginPath(); x.moveTo(r,6); x.arcTo(W-6,6,W-6,H-6,r); x.arcTo(W-6,H-6,6,H-6,r); x.arcTo(6,H-6,6,6,r); x.arcTo(6,6,W-6,6,r); x.fill();
    x.strokeStyle=open?rueCol(P):'#666'; x.lineWidth=5; x.stroke(); x.textAlign='center'; x.fillStyle='#fff'; x.font='bold 44px system-ui,sans-serif';
    const nm=P.nm.length>22?P.nm.replace(/ «.*»/,''):P.nm; x.fillText(nm,W/2,62);
    x.font='bold 36px system-ui,sans-serif'; x.fillStyle=open?rueCol(P):'#aaa'; x.fillText((champ?'👑 Champion · ':'')+(open?'Niv. '+P.lv:'🔒 '+(champ?'arène fermée':P.bd+' badge'+(P.bd>1?'s':'')))+(got?'  🎖️':w?'  ✓':''),W/2,116); });
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true})); s.scale.set(2.3,.67,1); s.renderOrder=5; return s; }
function rueSign(txt,col,w,h,big){ const t=ctex(512,Math.round(512*h/w),(x,W,H)=>{ x.fillStyle='#08060f'; x.fillRect(0,0,W,H); x.strokeStyle=col; x.lineWidth=big?14:10; x.strokeRect(10,10,W-20,H-20);
    x.fillStyle=col; x.textAlign='center'; x.textBaseline='middle'; x.shadowColor=col; x.shadowBlur=24; let fs=big?H*.42:H*.5; x.font=`bold ${fs}px system-ui,sans-serif`; while(x.measureText(txt).width>W*.86&&fs>10){ fs-=4; x.font=`bold ${fs}px system-ui,sans-serif`; } x.fillText(txt,W/2,H/2+4); });
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t})); }
function rueBuild(){ const sc=new THREE.Scene(), col=0x0d0822; sc.background=new THREE.Color(col); sc.fog=new THREE.Fog(col,16,48);
  sc.add(new THREE.HemisphereLight(0xb8b0ff,0x2a1040,1.05)); const dl=new THREE.DirectionalLight(0xfff2e8,.75); dl.position.set(2,8,12); sc.add(dl);
  const list=rueAll(), L=(list.length-1)*RUE_DX; RUE.min=0; RUE.max=L; RUE.pos={}; RUE.hum=[]; RUE.hits=[]; RUE.lab=[];
  let sd=11; const rn=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  /* route, trottoir, bordure néon */
  const rt=ctex(256,256,(x,W,H)=>{ x.fillStyle='#1b1a26'; x.fillRect(0,0,W,H); for(let i=0;i<2500;i++){ x.fillStyle=`rgba(255,255,255,${rn()*.06})`; x.fillRect(rn()*W,rn()*H,2,2); } x.fillStyle='#f2d34a'; x.fillRect(0,H*.48,W*.55,H*.04); },[ (L+80)/8, 1 ]);
  const road=new THREE.Mesh(new THREE.PlaneGeometry(L+80,10),new THREE.MeshLambertMaterial({map:rt})); road.rotation.x=-Math.PI/2; road.position.set(L/2,0,5); sc.add(road);
  const st=ctex(128,128,(x,W,H)=>{ x.fillStyle='#3a3648'; x.fillRect(0,0,W,H); x.strokeStyle='#2a2736'; x.lineWidth=4; x.strokeRect(0,0,W,H); x.beginPath(); x.moveTo(W/2,0); x.lineTo(W/2,H); x.stroke(); },[(L+80)/1.6,2]);
  const walk=new THREE.Mesh(new THREE.BoxGeometry(L+80,.16,4),new THREE.MeshLambertMaterial({map:st})); walk.position.set(L/2,.08,-2); sc.add(walk);
  const curb=new THREE.Mesh(new THREE.BoxGeometry(L+80,.06,.08),new THREE.MeshBasicMaterial({color:0x00e5ff})); curb.position.set(L/2,.17,0); sc.add(curb);
  /* façades */
  const facs=[0,1,2,3,4].map(k=>{ const t=ctex(128,256,(x,w,h)=>{ x.fillStyle=['#241b3a','#2e1f33','#1c2740','#2a2333','#20202c'][k]; x.fillRect(0,0,w,h);
    for(let r=0;r<20;r++) for(let c=0;c<6;c++){ const on=rn()<.4; x.fillStyle=on?(rn()<.25?'#7fe8ff':rn()<.2?'#ff7ae0':'#ffd27a'):'#0d0d1a'; x.fillRect(8+c*20,8+r*12.4,10,6); } }); return new THREE.MeshLambertMaterial({map:t,emissive:0x2a2418,emissiveMap:t}); });
  const neon=[0x00e5ff,0xff2bd6,0xfcee0a,0x8fffc8,0xff7a1a];
  const SIGNS=['GARAGE','PNEUS 24/7','RAMEN','DINER','CARROSSERIE','MOTEL','LAVAGE','PIÈCES AUTO','ARCADE','KARAOKÉ','CAFÉ','JANTES'];
  const champX=list.map((P,i)=>P.k==='c'?i*RUE_DX:null).filter(v=>v!=null);
  for(let x=-24;x<L+26;){ const w=5+Math.floor(rn()*4), cx=x+w/2; x+=w+.4; if(champX.some(c=>Math.abs(c-cx)<5.6+w/2)) continue;
    const h=6+rn()*12, m=new THREE.Mesh(new THREE.BoxGeometry(w,h,5),facs[Math.floor(rn()*5)]); m.position.set(cx,h/2,-6.6); sc.add(m);
    const nc=neon[Math.floor(rn()*neon.length)], nm=new THREE.MeshBasicMaterial({color:nc}); [-1,1].forEach(s=>{ if(rn()<.6){ const b=new THREE.Mesh(new THREE.BoxGeometry(.08,h,.08),nm); b.position.set(cx+s*w/2,h/2,-4.06); sc.add(b); } });
    if(rn()<.55){ const sg=rueSign(SIGNS[Math.floor(rn()*SIGNS.length)],'#'+nc.toString(16).padStart(6,'0'),Math.min(w-.8,3.6),.9); sg.position.set(cx,3.5+rn()*2,-4.05); sc.add(sg); } }
  /* lampadaires */
  const poleM=new THREE.MeshLambertMaterial({color:0x2a2a36}), lampM=new THREE.MeshBasicMaterial({color:0xfff1c4});
  for(let x=-14;x<L+16;x+=RUE_DX*2){ const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,4.2,8),poleM); p.position.set(x+RUE_DX/2,2.1,-.3); sc.add(p); const h=new THREE.Mesh(new THREE.BoxGeometry(.7,.12,.3),lampM); h.position.set(x+RUE_DX/2+.25,4.2,-.2); sc.add(h);
    const pool=new THREE.Mesh(new THREE.CircleGeometry(1.6,24),new THREE.MeshBasicMaterial({color:0xffe9a8,transparent:true,opacity:.08,depthWrite:false})); pool.rotation.x=-Math.PI/2; pool.position.set(x+RUE_DX/2+.3,.18,-.3); sc.add(pool); }
  /* pilotes (et arène des champions derrière eux) */
  const hitM=new THREE.MeshBasicMaterial({visible:false});
  list.forEach((P,i)=>{ const x=i*RUE_DX, champ=P.k==='c', tc=new THREE.Color(rueCol(P)).getHex(); RUE.pos[P.id]=x;
    if(champ){ const gm=new THREE.Mesh(new THREE.BoxGeometry(10,10,6),new THREE.MeshLambertMaterial({color:0x17122a})); gm.position.set(x,5,-7); sc.add(gm);
      const em=new THREE.MeshBasicMaterial({color:tc}); [[10.1,.14,0,10],[10.1,.14,0,.1],[.14,10,-5,5],[.14,10,5,5]].forEach(([w,h,ox,oy])=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.14),em); b.position.set(x+ox,oy,-3.98); sc.add(b); });
      const door=new THREE.Mesh(new THREE.PlaneGeometry(4.4,3.4),new THREE.MeshBasicMaterial({map:ctex(128,100,(c,W,H)=>{ const g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,rueCol(P)); g.addColorStop(1,'#08060f'); c.fillStyle=g; c.fillRect(0,0,W,H); c.fillStyle='rgba(0,0,0,.35)'; for(let y=6;y<H;y+=9) c.fillRect(0,y,W,3); })})); door.position.set(x,1.7,-3.97); sc.add(door);
      const sg=rueSign('ARÈNE '+CB_TYPES[P.ty].n.toUpperCase()+' '+CB_TYPES[P.ty].ic,rueCol(P),6.4,1.1,1); sg.position.set(x,4.35,-3.96); sc.add(sg);
      const sg2=rueSign(P.ar,'#ffffff',2.6,.5); sg2.position.set(x-3.5,2.3,-3.96); sc.add(sg2);
      const ring=new THREE.Mesh(new THREE.RingGeometry(.75,.95,40),new THREE.MeshBasicMaterial({color:tc,transparent:true,opacity:.85,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.set(x,.18,RUE_Z); sc.add(ring); RUE.hum.ring=RUE.hum.ring||[]; RUE.hum.ring.push(ring); }
    const H=rueHuman(P.L,champ,tc); H.g.position.set(x,.16,RUE_Z); sc.add(H.g); H.x=x; H.id=P.id; RUE.hum.push(H);
    try{ if(M[P.cars[0]]){ const q=buildCar(M[P.cars[0]],P.L[0],{}); q.g.position.set(x+2.9,.16,RUE_Z-1.1); q.g.rotation.y=-Math.PI/2+.35; q.g.scale.setScalar(.8); sc.add(q.g); } }catch(e){ console.warn('rue car',e); }
    const hb=new THREE.Mesh(new THREE.BoxGeometry(1.3,2.4,1.2),hitM); hb.position.set(x,1.2,RUE_Z); hb.userData.id=P.id; sc.add(hb); RUE.hits.push(hb); });
  const stars=[]; for(let i=0;i<300;i++) stars.push(-40+rn()*(L+80),14+rn()*30,-30-rn()*20);
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(stars,3)); sc.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.3,sizeAttenuation:false,fog:false})));
  RUE.sc=sc; RUE.cam=new THREE.PerspectiveCamera(46,1,.1,120); RUE.key='';
  const nx=list.find(P=>rueOpen(P)&&!rueSt().w[P.id]); RUE.x=RUE.tx=nx?RUE.pos[nx.id]:0; }
function rueLabels(){ const st=rueSt(), key=JSON.stringify([st.w,st.bdg]); if(key===RUE.key) return; RUE.key=key;
  RUE.lab.forEach(s=>{ RUE.sc.remove(s); s.material.map.dispose(); s.material.dispose(); }); RUE.lab=[];
  RUE.hum.forEach(H=>{ const P=rueGet(H.id), s=rueLabel(P); s.position.set(H.x,P.k==='c'?2.82:2.6,RUE_Z); RUE.sc.add(s); RUE.lab.push(s);
    const open=rueOpen(P); H.g.traverse(o=>{ if(o.material&&!Array.isArray(o.material)&&o.material.color){ if(o.userData.c0==null) o.userData.c0=o.material.color.getHex(); o.material.color.setHex(o.userData.c0); if(!open) o.material.color.multiplyScalar(.45); } }); }); }
function rueTick(dt){ RUE.t+=dt; const t=RUE.t, cam=RUE.cam;
  if(!RUE.drag){ RUE.tx+=RUE.v*dt; RUE.v*=Math.pow(.05,dt); } RUE.tx=clamp(RUE.tx,RUE.min-2,RUE.max+2); RUE.x+=(RUE.tx-RUE.x)*Math.min(1,dt*7);
  const asp=cam.aspect||1; cam.fov=asp<.8?50:asp<1.3?44:38; cam.updateProjectionMatrix();
  cam.position.set(RUE.x+.5,2.0,asp<.8?5.6:6.4); cam.lookAt(RUE.x+.5,1.5,RUE_Z);
  RUE.hum.forEach(H=>{ const k=t*1.8+H.ph; H.chest.scale.y=1+Math.sin(k)*.012; H.arms.forEach((a,s)=>{ if(!(s===1&&a.rotation.x<-.2)) a.rotation.x=Math.sin(k*.7+s*3)*.06; });
    const dx=RUE.x-H.x; H.head.rotation.y=clamp(Math.atan2(dx,cam.position.z-RUE_Z),-.6,.6)*.8+Math.sin(t*.5+H.ph)*.08; H.g.rotation.y=clamp(dx*.04,-.25,.25); });
  if(RUE.hum.ring) RUE.hum.ring.forEach((r,i)=>{ r.material.opacity=.55+.35*Math.sin(t*3+i); }); }
function rueBind(){ if(RUE.bound||!GL.r) return; RUE.bound=true; const c=GL.r.domElement, rc=new THREE.Raycaster(), v2=new THREE.Vector2();
  c.addEventListener('pointerdown',e=>{ if(GL.mode!=='rue') return; RUE.drag={x:e.clientX,y:e.clientY,x0:RUE.tx,moved:false,lx:e.clientX,lt:performance.now()}; RUE.v=0; });
  c.addEventListener('pointermove',e=>{ const d=RUE.drag; if(!d||GL.mode!=='rue') return; const dx=e.clientX-d.x; if(Math.abs(dx)>7) d.moved=true;
    const W=c.clientWidth||1, visW=2*Math.tan(RUE.cam.fov*Math.PI/360)*(RUE.cam.position.z-RUE_Z)*RUE.cam.aspect, k=visW/W;
    RUE.tx=d.x0-dx*k; const now=performance.now(), dt=(now-d.lt)/1000; if(dt>0){ RUE.v=-(e.clientX-d.lx)*k/dt*.6; d.lx=e.clientX; d.lt=now; } });
  const up=e=>{ const d=RUE.drag; RUE.drag=null; if(!d||GL.mode!=='rue') return; if(performance.now()-d.lt>120) RUE.v=0;
    if(d.moved||e.type==='pointercancel') return; RUE.v=0; const r=c.getBoundingClientRect(); v2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    rc.setFromCamera(v2,RUE.cam); const h=rc.intersectObjects(RUE.hits)[0]; if(h) ACT.ruego({id:h.object.userData.id}); };
  c.addEventListener('pointerup',up); c.addEventListener('pointercancel',up); }
async function rueStart(){ if(!$('rue3d')||CBV) return; if(!glEnsure()) return;
  if(!RUE.sc){ if(RUE.busy) return; RUE.busy=1; try{ await ensureModels(); }catch(_){} try{ rueBuild(); }catch(e){ console.warn('rue',e); RUE.busy=0; return; } RUE.busy=0; }
  if(!$('rue3d')||CBV||view!=='arena'||AR.tab!=='rue') return;
  rueLabels(); rueBind(); glAttach('rue3d'); glRun(RUE.sc,RUE.cam,rueTick,'rue'); }
{ const _r=render; render=function(){ const r=_r.apply(this,arguments); try{ if(view==='arena'&&AR.tab==='rue'&&!CBV) rueStart(); }catch(e){ console.warn('rue',e); } return r; }; }
