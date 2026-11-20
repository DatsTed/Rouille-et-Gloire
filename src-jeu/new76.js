/* ===== v2.15 · 3/4 : la LIGUE NÉON (annoncée « bientôt » depuis la v1.7) =====
   Ouverte quand les 8 badges sont réunis : 4 Élites puis le Maître de la Ligue, à battre d'affilée.
   Une défaite renvoie à la 1re Élite (comme la Ligue Pokémon). Équipes de 4 au niveau 45 à 50, IA au plus fort.
   Récompenses en Néo / jetons / objets ; le premier titre de Maître offre une voiture d'exception (Mythique) ; revanches à 30 %.
   Sauvegarde : S.rue.lg = {s: prochain adversaire (0-4), w: {id: victoires}, hof: titres}. */
const LIGUE=[
  {id:'lg_1',ty:'acier',nm:'Iris Chrome',lv:47,cars:['audi','merco','rossa','epave'],L:['#b8c2d6','#1d2236','#e8c4a8','#d9dbe8',1,'#b8c2d6',1],
    pre:'Première Élite. Mes carrosseries ne plient pas. Les tiennes, si.',win:'Tôle froissée. Retour à la case départ.',lose:'Joli. Les trois autres sont moins polis que moi.'},
  {id:'lg_2',ty:'feu',nm:'Dante Inferno',lv:47,cars:['touge','fury','hauler','rossa'],L:['#c0261b','#2a0b06','#d39a7a','#ff7a1a',2,'#c0261b',0],
    pre:'Deuxième Élite. Ici, l’asphalte fond avant les pneus.',win:'Réduit en cendres.',lose:'Tu as survécu au brasier. Continue.'},
  {id:'lg_3',ty:'elec',nm:'Kassandra Orage',lv:48,cars:['volta','rx4','riva','aurion'],wx:'orage',L:['#f2c200','#141428','#f0c9ad','#ffe66b',1,'#f2c200',2],
    pre:'Troisième Élite. L’orage tombe toujours deux fois au même endroit : sur toi.',win:'Foudroyé.',lose:'Tu conduis entre les éclairs… Plus qu’une Élite.'},
  {id:'lg_4',ty:'glace',nm:'Sire Givrenoir',lv:49,cars:['steppe','subi','audi','solus'],wx:'tempete',L:['#dff7ff','#0e1a33','#f3d9c8','#9ef0ff',3,'#3a7bd5',1],
    pre:'Dernière Élite. Personne ne passe la porte du Maître sans traverser mon hiver.',win:'Figé pour l’éternité.',lose:'Le froid t’a rendu plus fort. Le Maître t’attend.'},
  {id:'lg_ch',ty:'lum',nm:'Albion, Maître de la Ligue',lv:50,cars:['volta','solus','aurion','majestic'],wx:'aurore',master:1,L:['#fff6d6','#1a1230','#f3cfb3','#ffcf33',1,'#ffffff',0],
    pre:'Tu as traversé la Ligue Néon. Montre-moi pourquoi la région devrait se souvenir de ton nom.',win:'La couronne reste à sa place.',lose:'Incroyable… La région a un nouveau Maître. Elle est à toi.'}
];
LIGUE.forEach((P,i)=>{ P.k='l'; P.i=i; P.sty=P.master?'Maître de la Ligue Néon':'Élite '+(i+1)+' de la Ligue Néon';
  P.rw=P.master?{cr:60000,tok:15,it:{revision:3,superkit:3},car:['majestic','steppe']}:{cr:15000+5000*i,tok:4+i,it:{revision:1,superkit:2}}; });
const ligSt=()=>{ const r=rueSt(); if(!r.lg) r.lg={s:0,w:{},hof:0}; return r.lg; };
const ligOpen=()=>rueNB()>=8;
function ligFoes(P){ const out=[]; P.cars.forEach((mid,k)=>{ const ty=cbTypesOf(mid), iv={}; CB_SK.forEach(x=>iv[x]=clamp((P.master?17:16)+Math.floor(Math.random()*7)-3,0,31));
    out.push({mid,lv:clamp(P.lv-(P.master?(k<2?1:0):(3-k)),1,CB_LVMAX),iv,tal:(CB_TAL_BY[ty[0]]||CB_TAL_BY.meca)[k%4]}); }); return out; }
const LG={fight:null};
function ligFight(id){ const P=LIGUE.find(x=>x.id===id), lg=ligSt(); if(!P||!cbAwake()) return;
  if(!ligOpen()) return toast('🔒 Réunis d’abord les 8 badges d’arène'); if(P.i!==lg.s) return toast('🔒 Bats d’abord '+LIGUE[lg.s].nm);
  if(!cbTeam().length) return toast('Choisis d’abord une équipe (Arène › Équipe)');
  LG.fight={id,res:null};
  cbStartDuel({team:cbTeam(),foes:ligFoes(P),d:3,names:['Toi',P.nm],trainer:true,wx:P.wx,
    rewardHTML:w=>w?`<div class="cb-rw">${P.master?'👑 Tu es le Maître de la Ligue Néon !':'🏁 '+P.nm+' est battu·e'}</div>`:`<div class="cb-rw lose">${P.nm} t’arrête : retour à la 1re Élite</div>`,
    onEnd:res=>{ const F=LG.fight; if(!F) return; const cs=cbSt();
      if(res.win){ cs.w++; const first=!lg.w[P.id]; lg.w[P.id]=(lg.w[P.id]||0)+1; F.first=first; F.got=cbGive(P.rw,first?1:.3); if(P.master){ lg.hof++; lg.s=0; F.champ=1; } else lg.s=P.i+1; }
      else { cs.l++; F.reset=lg.s>0; lg.s=0; }
      F.res=res.win?'win':'lose'; save(); },
    onClose:()=>{ const F=LG.fight; LG.fight=null; if(!F||!F.res) return; openSheet({t:'lig',id:F.id,ph:F.res,got:F.got||[],first:F.first,champ:F.champ,reset:F.reset}); if(F.champ) try{ cbSfx('win'); }catch(_){} } }); }

function ligSheetHTML(P,sh){ const lg=ligSt(), col=CB_TYPES[P.ty].c, wins=lg.w[P.id]||0;
  const head=`<div class="cbp rue-p" style="--pc:${col}">${rueAvatar(P)}<div><b>${P.nm}</b><small>Niv. ${P.lv} · ${CB_TYPES[P.ty].ic} ${CB_TYPES[P.ty].n}</small><small>${P.sty}</small></div></div>`;
  const strip=`<div class="lig-row sm">${LIGUE.map((Q,i)=>`<span class="lig-c ${i<lg.s||(sh.champ&&i<=4)?'done':''} ${i===P.i?'next':''}" style="--pc:${CB_TYPES[Q.ty].c}">${rueAvatar(Q)}</span>`).join('')}</div>`;
  if(sh.ph==='win') return `<div class="cbtalk lose">${head}<div class="ct-bub" style="--pc:${col}">« ${P.lose} »</div>
      ${sh.champ?`<div class="rue-got lig-crown"><i>👑</i><b>Maître de la Ligue Néon !</b><small>Titre n° ${lg.hof} · ton nom est gravé au panthéon de la région</small></div>`:strip}
      <div class="ulist">${(sh.got||[]).map(g=>`<div class="ul-r"><i>🎁</i><div><b>${g}</b></div></div>`).join('')}</div>
      ${!sh.first?'<p class="note sm">Revanche : récompense réduite.</p>':''}
      ${sh.champ?`<button class="btn wide" data-a="ruedone">Retour à l’Arène</button>`:`<div class="tu-btns"><button class="btn alt" data-a="ruedone">Plus tard</button><button class="btn" data-a="ligo" data-id="${LIGUE[lg.s].id}">➜ ${LIGUE[lg.s].nm}</button></div>`}</div>`;
  if(sh.ph==='lose') return `<div class="cbtalk win">${head}<div class="ct-bub" style="--pc:${col}">« ${P.win} »</div>
      <p class="note">${sh.reset?'La Ligue se joue d’une traite : tu repars de la 1re Élite. ':''}Niveau de ton équipe : <b>${cbTeamLv()}</b> · ${P.nm} : niveau <b>${P.lv}</b>.</p>
      <div class="tu-btns"><button class="btn alt" data-a="ruedone">Retour</button><button class="btn" data-a="ligo" data-id="${LIGUE[lg.s].id}">🔁 Recommencer</button></div></div>`;
  const open=ligOpen()&&P.i===lg.s, cars=P.cars.map(mid=>`<span>${cbTypesOf(mid).map(x=>CB_TYPES[x].ic).join('')} ${M[mid]?M[mid].nom:mid}</span>`).join('');
  return `<div class="cbtalk pre"><div class="ct-cup">👑 Ligue Néon · ${P.master?'Le Maître':'Élite '+(P.i+1)+' / 4'}</div>${head}${strip}
    <div class="ct-bub" style="--pc:${col}">« ${open?P.pre:'Chaque chose en son temps.'} »</div>
    ${open?`<div class="ct-foes">${cars}</div>${P.wx?`<p class="note sm">${CB_WX[P.wx].ic} Le duel se déroule sous ${CB_WX[P.wx].n}.</p>`:''}
      <p class="note sm">Récompense : ${cbRwTxt(P.master&&lg.hof?Object.assign({},P.rw,{car:null}):P.rw)}${wins?' (30 % en revanche)':''} · une défaite renvoie à la 1re Élite.</p>
      <div class="tu-btns"><button class="btn alt" data-a="ruedone">Plus tard</button><button class="btn" data-a="ligfight" data-id="${P.id}">⚔️ Défier</button></div>`
    :`<p class="note">🔒 ${!ligOpen()?'Réunis les 8 badges d’arène pour entrer dans la Ligue.':'Bats d’abord '+LIGUE[lg.s].nm+'.'}</p><button class="btn alt wide" data-a="ruedone">Retour</button>`}</div>`; }
{ const _sx=sheetExtra; sheetExtra=function(X){ if(sheet&&sheet.t==='lig'){ const P=LIGUE.find(x=>x.id===sheet.id); if(!P){ closeSheet(); return true; } $('sheet').innerHTML=X+ligSheetHTML(P,sheet); return true; } return _sx.apply(this,arguments); }; }
Object.assign(ACT,{ ligo(d){ openSheet({t:'lig',id:d.id}); }, ligfight(d){ closeSheet(); ligFight(d.id); } });

/* ---------- panneau de la Ligue dans Arène › Badges ---------- */
function ligPanel(){ const lg=ligSt(), op=ligOpen();
  return `<div class="lig ${op?'open':''}"><div class="lig-h"><b>👑 Ligue Néon</b><small>${op?'4 Élites puis le Maître, d’une traite : une défaite renvoie à la 1re Élite.':'Réunis les 8 badges d’arène pour y entrer.'}</small></div>
    <div class="lig-row">${LIGUE.map((P,i)=>`<button class="lig-c ${i<lg.s?'done':''} ${op&&i===lg.s?'next':''}" data-a="ligo" data-id="${P.id}" style="--pc:${CB_TYPES[P.ty].c}">${rueAvatar(P)}<small>${P.master?'Maître':'Élite '+(i+1)}</small></button>`).join('')}</div>
    ${op?`<button class="btn wide" data-a="ligo" data-id="${LIGUE[lg.s].id}">⚔️ ${lg.s?'Continuer · ':'Entrer · '}${LIGUE[lg.s].nm}</button>`:''}
    ${lg.hof?`<p class="note sm lig-hof">🏆 Maître de la Ligue ×${lg.hof}</p>`:''}</div>`; }
{ const _va=vArena; vArena=function(){ let s=_va.apply(this,arguments); try{ if(cbAwake()&&AR.tab==='badges'){ s=s.replace(' <b>Les 8 badges sont réunis : la Ligue Néon arrive bientôt.</b>',' <b>Les 8 badges sont réunis : la Ligue Néon t’attend !</b>'); const k=s.lastIndexOf('</div>'); s=k>0?s.slice(0,k)+ligPanel()+s.slice(k):s+ligPanel(); }
    if(cbAwake()&&ligSt().hof) s=s.replace(/(<div class="head"><h2>Arène<\/h2><p>)/,'$1👑 Maître ×'+ligSt().hof+' · '); }catch(_){} return s; }; }
