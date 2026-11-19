/* ===== v1.5 · 6/6 : règles des voitures (patrouille, vélo) + Arène cosmique : tournois, pilotes rivaux, équipe, boutique =====
   Les duels utilisent le moteur (new53) et l'écran (new54) ; récompenses dans l'économie du jeu (cr, jetons, objets, voitures). */

/* ---- 0. Brenner Patrouille : seulement dans le Paquet Voiture, ultra rare, une seule par garage ---- */
const POL_P=.002;                                                         /* 0,2 % par Paquet Voiture */
const hasPol=()=>S.cars.some(c=>c.mid==='patrouille');
carRoll=function(){ if(!hasPol()&&Math.random()<POL_P) return M.patrouille;
  const L=CARS.filter(c=>c.id!=='patrouille'), w=L.map(c=>(CPW[c.t]||1)/L.filter(x=>x.t===c.t).length), tot=w.reduce((a,b)=>a+b,0); let x=Math.random()*tot;
  for(let i=0;i<L.length;i++){ x-=w[i]; if(x<0) return L[i]; } return L[0]; };
{ const _cp=carPrize; carPrize=function(){ let m=_cp.apply(this,arguments), n=0; while(m&&m.id==='patrouille'&&n++<20) m=_cp.apply(this,arguments); return m&&m.id==='patrouille'?M.fury:m; }; }
function polFix(){ try{
  S.offres=(S.offres||[]).filter(o=>o.mid!=='patrouille'&&M[o.mid]);
  const pol=S.cars.filter(c=>c.mid==='patrouille').sort((a,b)=>a.uid-b.uid);
  if(pol.length>1){ const extra=pol.slice(1), ids=new Set(extra.map(c=>c.uid)), cr=extra.length*Math.round(M.patrouille.val*.5);
    S.cars=S.cars.filter(c=>!ids.has(c.uid)); if(S.pod&&S.pod.slots) S.pod.slots=S.pod.slots.map(u=>ids.has(u)?null:u); if(S.cbTeam) S.cbTeam=S.cbTeam.filter(u=>!ids.has(u));
    S.cr+=cr; S.polRefund=(S.polRefund||0)+extra.length; S.polRefundCr=cr; save(); }
  const p=PACKS.find(x=>x.id==='pcar'); if(p&&!/Patrouille/.test(p.d)) p.d+=' La Brenner Patrouille (police) n’existe que dans ce paquet : ultra rare (0,2 %), une seule par garage.';
}catch(e){ console.error('polFix',e); } }
polFix();
setTimeout(()=>{ try{ if(S.veloRefund){ toast('🚲 Le vélo a quitté le jeu : '+S.veloRefund*600+' cr remboursés'); delete S.veloRefund; save(); }
  if(S.polRefund){ toast('🚓 Une seule patrouille par garage : '+fmt(S.polRefundCr||0)+' cr pour les doublons'); delete S.polRefund; delete S.polRefundCr; save(); } }catch(e){} },4000);

/* ---- 1. pilotes rivaux ---- */
const CB_PIL={
  lina:  {nm:'Lina « Étincelle » Moreau',ic:'🔥',c:'#ff6a2b',sty:'Fougueuse, elle met le feu à la piste dès le premier tour.',cars:['fury','touge','rossa'],tal:['turbo','four'],
          pre:['Tu sens cette odeur de caoutchouc brûlé ? C’est ta défaite qui chauffe.','Allez, montre-moi si ton moteur a vraiment éveillé quelque chose !'],win:'Trop chaud pour toi ! Reviens quand tu auras un radiateur.',lose:'Pfff… J’ai cramé mes pneus pour rien. Bien joué.'},
  tom:   {nm:'Tom Givre',ic:'❄️',c:'#9ef0ff',sty:'Calme et méthodique, il gèle le rythme du duel.',cars:['steppe','audi','kombi'],tal:['cryogenie','antigel'],wx:'tempete',
          pre:['La glace ne pardonne pas. Moi non plus.','On va voir si tu tiens la route sur le verglas.'],win:'Tu as glissé. Ça arrive à tout le monde… surtout à toi.',lose:'Un dégel inattendu. Respect.'},
  rosa:  {nm:'Rosa Rafale',ic:'🌪️',c:'#8fffc8',sty:'La plus rapide du quartier : elle frappe avant que tu aies démarré.',cars:['piccola','riva','gts'],tal:['zephyr','demarrage'],
          pre:['Cligne des yeux, et c’est déjà fini.','J’espère que ta Reprise est bonne, parce que la mienne est légendaire.'],win:'Trop lent ! Le vent ne t’attend pas.',lose:'Quoi ?! Personne ne me double, normalement…'},
  volt:  {nm:'Doc Volt',ic:'⚡',c:'#ffd400',sty:'Ingénieur un peu fou, il surcharge tout ce qui a une batterie.',cars:['volta','rx4','aurion'],tal:['tesla','paraton'],wx:'orage',
          pre:['Mes calculs sont formels : 87 % de chances que tu grilles.','Branche-toi bien, ça va secouer !'],win:'Court-circuit ! Mes équations ne mentent jamais.',lose:'Une erreur dans mes formules… intéressant. Très intéressant.'},
  lumen: {nm:'Sœur Lumen',ic:'✨',c:'#ffe66b',sty:'Lumineuse et patiente : elle soigne ses voitures et use les tiennes.',cars:['majestic','merco','piccola'],tal:['halo','solaire'],wx:'aurore',
          pre:['Que la lumière guide tes roues… vers la sortie.','Je ne combats pas pour gagner. Juste pour briller.'],win:'La lumière finit toujours par l’emporter.',lose:'Même le soleil se couche. Tu as bien combattu.'},
  corbeau:{nm:'Le Corbeau',ic:'🌑',c:'#8a5cff',sty:'Personne ne connaît son visage. Il attaque dans l’ombre.',cars:['solus','fury','majestic'],tal:['nuagenoir','ombre','intimid'],wx:'nuit',
          pre:['…','La nuit tombe. Pour toi, elle ne se relèvera pas.'],win:'Retourne dans la lumière, petit.',lose:'… Tu as vu à travers l’ombre. Rares sont ceux qui y arrivent.'},
  mama:  {nm:'Mama Rouille',ic:'🔩',c:'#c98a4a',sty:'Reine de la casse : ses tas de ferraille sont increvables.',cars:['epave','hauler','steppe'],tal:['increvable','blinde','epines'],
          pre:['Ah, un petit nouveau ! Mes épaves vont t’apprendre la vie.','Rouillé ne veut pas dire fragile, mon chou.'],win:'Tu vois ? Rien ne vaut une bonne vieille carrosserie.',lose:'Bien joué ! Passe à la casse, je te ferai un prix.'},
  kenji: {nm:'Kenji Drift',ic:'💨',c:'#ff2bd6',sty:'Maître du dérapage, il enchaîne les attaques en glissant.',cars:['touge','gts','rx4'],tal:['sequentielle','echappement'],
          pre:['Un vrai pilote ne freine jamais. Il glisse.','Regarde bien, je ne le ferai qu’une fois.'],win:'Trop propre, ma trajectoire. Tu n’avais aucune chance.',lose:'Tu as coupé le virage… mais c’était beau.'},
  brenner:{nm:'Capitaine Brenner',ic:'🚓',c:'#2f6bff',sty:'La police de la ville, éveillée elle aussi. Elle ne lâche jamais.',cars:['merco','audi','majestic'],tal:['xenon','gyroscope'],
          pre:['Contrôle de routine. Papiers… et super-pouvoirs, s’il vous plaît.','Au nom de la loi, ce duel est à moi.'],win:'Infraction constatée : trop faible. Circulez.',lose:'Bon… Je n’ai rien vu. Filez avant que je change d’avis.'},
  ines:  {nm:'Inès Sablier',ic:'⛰️',c:'#e0a050',sty:'Elle enlise ses rivaux et attend qu’ils craquent.',cars:['hauler','kombi','epave'],tal:['reactif','filtre','prudent'],
          pre:['Le temps joue pour moi. Chaque grain de sable compte.','Tu vas t’enfoncer, doucement…'],win:'Le sablier s’est vidé. Pour toi.',lose:'Tu t’es sorti des sables mouvants… impressionnant.'},
  max:   {nm:'Max Turbo',ic:'⚙️',c:'#d9dbe8',sty:'Champion en titre, pilote complet, aucune faiblesse évidente.',cars:['rossa','rx4','aurion'],tal:['hybride','compresseur','nitro'],
          pre:['Tu es arrivé jusqu’ici ? Pas mal. Mais la fête est finie.','J’ai gagné cette coupe trois fois. Je ne compte pas m’arrêter.'],win:'Ça, c’est le niveau d’un champion. Reviens t’entraîner.',lose:'Un nouveau champion… Prends soin de ce titre.'},
  astra: {nm:'Astra l’Éveillée',ic:'🌌',c:'#c39bff',sty:'Elle a vu l’être cosmique de près. Son énergie a tout changé en elle.',cars:['aurion','solus','volta'],tal:['ciel','hybride','sequentielle'],wx:'nuit',boss:1,
          pre:['L’énergie qui coule dans ta voiture… je l’ai reçue la première.','Montre-moi ce que le cosmos a vu en toi.'],win:'Tu n’es pas encore prêt. Le cosmos attendra.',lose:'Alors c’est toi… Celui que l’être a choisi. Le titre est à toi.'}
};
/* ---- 2. coupes (difficulté croissante) ---- */
const CB_CUPS=[
  {id:'c1',nm:'Coupe Étincelle',ic:'🥉',lv:5,d:1,iv:10,team:2,rounds:['mama','rosa','lina'],round:900,rw:{cr:8000,it:{kit:3,nitrorec:1}},d0:'Le premier tournoi des voitures éveillées.'},
  {id:'c2',nm:'Coupe Tempête',ic:'🌀',lv:10,d:2,iv:14,team:2,rounds:['tom','kenji','volt'],round:1800,rw:{cr:20000,tok:5,it:{superkit:2,turbox:1,degivre:1}},d0:'Météo déchaînée et pilotes techniques.'},
  {id:'c3',nm:'Coupe Néon',ic:'🥈',lv:16,d:2,iv:18,team:3,rounds:['ines','lumen','brenner','kenji'],round:3500,rw:{cr:45000,tok:10,it:{revision:1,superkit:2,nitrorec:2}},d0:'Les meilleurs pilotes de la ville, en équipes de trois.'},
  {id:'c4',nm:'Coupe Éclipse',ic:'🥇',lv:24,d:3,iv:24,team:4,rounds:['corbeau','volt','lina','max'],round:7000,rw:{cr:90000,tok:20,it:{depann:1,revision:2,surchx:1,chassisx:1}},d0:'Quand la nuit tombe, les pilotes d’élite sortent.'},
  {id:'c5',nm:'Coupe Cosmique',ic:'🌌',lv:32,d:3,iv:30,team:4,rounds:['max','corbeau','brenner','lumen','astra'],round:14000,rw:{cr:200000,tok:40,it:{revision:3,depann:2},car:['solus','aurion','volta']},d0:'La finale ultime. Astra l’Éveillée vous attend.'}
];
const cbSt=()=>{ if(!S.cbStat) S.cbStat={w:0,l:0,cups:{},tr:0}; return S.cbStat; };
const cupOpen=i=>i===0||!!cbSt().cups[CB_CUPS[i-1].id];
const cbTeamLv=()=>{ const t=cbTeam().map(u=>car(u)).filter(Boolean); return t.length?Math.round(t.reduce((a,c)=>a+cbOf(c).lv,0)/t.length):0; };
function cbFoesFor(cup,ri){ const P=CB_PIL[cup.rounds[ri]], n=Math.min(4,cup.team+(P.boss?1:0)), lv=cup.lv+ri+(P.boss?3:0), out=[];
  for(let k=0;k<n;k++){ const mid=P.cars[k%P.cars.length], ty=cbTypesOf(mid), iv={}; CB_SK.forEach(x=>iv[x]=clamp(cup.iv+Math.floor(Math.random()*6)-2,0,31));
    out.push({mid,lv:clamp(lv-(n-1-k),1,CB_LVMAX),iv,tal:(P.tal||[])[k%(P.tal||[1]).length]||(CB_TAL_BY[ty[0]]||CB_TAL_BY.meca)[0]}); } return out; }
const cbRwTxt=r=>[r.cr?neoT(r.cr):'',r.tok?r.tok+' 🎟':'',...Object.entries(r.it||{}).map(([k,n])=>CB_IT[k].ic+' '+CB_IT[k].n+(n>1?' ×'+n:'')),r.car?'🏎️ une voiture d’exception':''].filter(Boolean).join(' · ');
function cbGive(r,mult){ mult=mult||1; const got=[]; if(r.cr){ const c=Math.round(r.cr*mult); S.neo=(S.neo||0)+c; got.push(neoT(c)); } if(r.tok){ const t=Math.max(1,Math.round(r.tok*mult)); S.tok+=t; got.push(t+' 🎟'); }
  const bag=cbBag(); Object.entries(r.it||{}).forEach(([k,n])=>{ const q=Math.max(1,Math.round(n*mult)); bag[k]=(bag[k]||0)+q; got.push(CB_IT[k].ic+' '+CB_IT[k].n+(q>1?' ×'+q:'')); });
  if(r.car&&mult>=1){ const mid=r.car.find(id=>!S.cars.some(c=>c.mid===id)); if(mid){ S.cars.push({uid:S.nuid++,mid,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{},sh:1}); got.push('🏎️ '+M[mid].nom+' ✨'); } else { S.cr+=120000; got.push('120 000 cr (voitures déjà possédées)'); } }
  return got; }

/* ---- 3. déroulé d'un tournoi : dialogue → duel → dialogue → manche suivante ---- */
function cbCupStart(i){ const cup=CB_CUPS[i]; if(!cup||!cupOpen(i)) return toast('🔒 Gagne d’abord la coupe précédente'); if(!cbTeam().length) return toast('Choisis une équipe');
  S.cbT={i,r:0,got:[]}; save(); openSheet({t:'cbtalk',ph:'pre'}); }
function cbFight(){ const T=S.cbT; if(!T) return; const cup=CB_CUPS[T.i], pid=cup.rounds[T.r], P=CB_PIL[pid]; closeSheet();
  cbStartDuel({team:cbTeam(),foes:cbFoesFor(cup,T.r),d:cup.d,names:['Toi',P.nm],trainer:true,wx:P.wx,
    rewardHTML:w=>w?`<div class="cb-rw">🏁 Manche ${T.r+1}/${cup.rounds.length} gagnée : <b>${neoT(cup.round)}</b></div>`:`<div class="cb-rw lose">${cup.nm} : élimination à la manche ${T.r+1}</div>`,
    onEnd:(res)=>{ const st=cbSt(); if(res.win){ st.w++; S.neo=(S.neo||0)+cup.round; T.got.push(cup.round); } else st.l++; T.last=res.win?'win':'lose'; save(); },
    onClose:()=>{ if(!S.cbT) return; openSheet({t:'cbtalk',ph:S.cbT.last==='win'?'lose':'win'}); } }); }
function cbNextRound(){ const T=S.cbT, cup=CB_CUPS[T.i]; if(T.last!=='win'){ S.cbT=null; save(); openSheet({t:'arena'}); return; }
  T.r++; if(T.r<cup.rounds.length){ T.last=null; save(); openSheet({t:'cbtalk',ph:'pre'}); return; }
  /* coupe gagnée */
  const st=cbSt(), first=!st.cups[cup.id]; st.cups[cup.id]=(st.cups[cup.id]||0)+1; const got=cbGive(cup.rw,first?1:.35); S.cbT=null; save();
  openSheet({t:'cbcup',i:T.i,got,first}); try{ cbSfx('win'); }catch(_){} }

/* ---- 4. écrans : Arène, dialogues, équipe, boutique, coupe gagnée ---- */
function cbPilotHTML(P){ return `<div class="cbp" style="--pc:${P.c}"><span class="cbp-ic">${P.ic}</span><div><b>${P.nm}</b><small>${P.sty}</small></div></div>`; }
function cbArenaHTML(X){ const st=cbSt(), t=cbTeam().map(u=>car(u)).filter(Boolean), bag=cbBag(), tl=cbTeamLv();
  return `${X}<div class="arena"><div class="ar-hero"><b>⚔️ ARÈNE COSMIQUE</b><small>${st.w} victoire${st.w>1?'s':''} · ${st.l} défaite${st.l>1?'s':''} · ${Object.keys(st.cups).length}/${CB_CUPS.length} coupes</small></div>
    <div class="ar-sec"><div class="ar-h"><b>🚗 Ton équipe</b><button class="btn alt sm" data-a="cbteamopen">Modifier</button></div>
      <div class="ar-team">${t.map(c=>{ const s=cbOf(c); return `<button class="ar-car" data-a="car" data-id="${c.uid}"><span class="ar-ty">${s.ty.map(x=>CB_TYPES[x].ic).join('')}</span><b>${M[c.mid].nom}</b><small>Niv. ${s.lv} · ${CB_TAL[s.tal].n}</small></button>`; }).join('')||'<p class="note">Aucune voiture</p>'}</div>
      <p class="note sm">Niveau moyen de l’équipe : <b>${tl}</b>. Les voitures gagnent de l’XP de combat à chaque duel.</p></div>
    <div class="ar-sec"><div class="ar-h"><b>🎒 Sac de combat</b><button class="btn alt sm" data-a="cbshop">Boutique</button></div>
      <div class="ar-bag">${Object.entries(bag).filter(([k,n])=>n>0&&CB_IT[k]).map(([k,n])=>`<span>${CB_IT[k].ic} ${n}</span>`).join('')||'<span class="note">Vide</span>'}</div></div>
    <button class="ar-train" data-a="cbtrain"><b>🥊 Entraînement</b><small>Un duel contre un pilote au hasard de ton niveau (XP réduite, sans récompense)</small></button>
    <h3 class="rh">🏆 Tournois</h3>
    ${CB_CUPS.map((cup,i)=>{ const open=cupOpen(i), won=st.cups[cup.id], diff=tl<cup.lv-4?'dur':tl>=cup.lv?'ok':'moyen';
      return `<div class="ar-cup ${open?'':'lock'} ${won?'won':''}"><div class="ar-ch"><span class="ar-ci">${cup.ic}</span><div><b>${cup.nm}</b><small>${cup.d0}</small></div></div>
        <div class="ar-pils">${cup.rounds.map(id=>`<span title="${CB_PIL[id].nm}" style="--pc:${CB_PIL[id].c}">${CB_PIL[id].ic}</span>`).join('<i>›</i>')}</div>
        <p class="note sm">Niveau conseillé ${cup.lv} · ${cup.rounds.length} manches · équipes de ${cup.team} · ${neoT(cup.round)} par manche<br>Victoire : ${cbRwTxt(cup.rw)}${won?' (35 % en rejouant)':''}</p>
        ${open?`<button class="btn wide ${diff==='dur'?'alt':''}" data-a="cbcup" data-id="${i}">${won?'🔁 Rejouer':'▶ Participer'}${diff==='dur'?' · ⚠️ difficile':''}</button>`:'<button class="btn alt wide" disabled>🔒 Gagne la coupe précédente</button>'}</div>`; }).join('')}
  </div>`; }
{ const _sx=sheetExtra; sheetExtra=function(X){ const el=$('sheet');
  if(sheet&&sheet.t==='arena'){ if(!cbAwake()){ closeSheet(); return true; } el.innerHTML=cbArenaHTML(X); return true; }
  if(sheet&&sheet.t==='cbtalk'&&S.cbT){ const T=S.cbT, cup=CB_CUPS[T.i], P=CB_PIL[cup.rounds[T.r]], ph=sheet.ph;
    const line=ph==='pre'?P.pre[Math.floor(Math.random()*P.pre.length)]:ph==='lose'?P.lose:P.win;
    const foes=ph==='pre'?cbFoesFor(cup,T.r):[];
    el.innerHTML=`${X}<div class="cbtalk ${ph}"><div class="ct-cup">${cup.ic} ${cup.nm} · manche ${T.r+1}/${cup.rounds.length}</div>${cbPilotHTML(P)}
      <div class="ct-bub" style="--pc:${P.c}">« ${line} »</div>
      ${ph==='pre'?`<div class="ct-foes">${foes.map(f=>`<span>${cbTypesOf(f.mid).map(x=>CB_TYPES[x].ic).join('')} ${M[f.mid].nom} <em>niv. ${f.lv}</em></span>`).join('')}</div>
        ${P.wx?`<p class="note sm">${CB_WX[P.wx].ic} Le duel se déroule sous ${CB_WX[P.wx].n}.</p>`:''}
        <div class="tu-btns"><button class="btn alt" data-a="cbquitcup">Abandonner la coupe</button><button class="btn" data-a="cbfight">⚔️ Combattre</button></div>`
      :ph==='lose'?`<p class="note">Manche gagnée ! ${T.r+1<cup.rounds.length?'Prochain pilote : '+CB_PIL[cup.rounds[T.r+1]].ic+' '+CB_PIL[cup.rounds[T.r+1]].nm:'C’était la finale !'}</p><button class="btn wide" data-a="cbnext">${T.r+1<cup.rounds.length?'▶ Manche suivante':'🏆 Recevoir la coupe'}</button>`
      :`<p class="note">Éliminé à la manche ${T.r+1}. Tu gardes les jetons Néo des manches gagnées (${neoT(T.got.reduce((a,b)=>a+b,0))}). Entraîne tes voitures et retente ta chance !</p><button class="btn wide" data-a="cbnext">Retour à l’Arène</button>`}</div>`;
    return true; }
  if(sheet&&sheet.t==='cbcup'){ const cup=CB_CUPS[sheet.i];
    el.innerHTML=`${X}<div class="cbcupw"><div class="cw-rays"></div><div class="cc-ic">${cup.ic}</div><h2>${cup.nm} remportée !</h2><p class="note">${sheet.first?'Première victoire : récompense complète.':'Victoire à nouveau : 35 % de la récompense.'}</p>
      <div class="ulist">${sheet.got.map(g=>`<div class="ul-r"><i>🎁</i><div><b>${g}</b></div></div>`).join('')}</div>
      ${CB_CUPS[sheet.i+1]&&sheet.first?`<p class="note">🔓 Nouvelle coupe : ${CB_CUPS[sheet.i+1].ic} ${CB_CUPS[sheet.i+1].nm}</p>`:''}<button class="btn wide" data-a="arena">Retour à l’Arène</button></div>`; return true; }
  if(sheet&&sheet.t==='cbteam'){ const sel=cbTeam(), cars=S.cars.slice().sort((a,b)=>cbOf(b).lv-cbOf(a).lv);
    el.innerHTML=`${X}<h2>🚗 Équipe de combat</h2><p class="note">Choisis jusqu’à 4 voitures. La première entre en piste en premier.</p>
      <div class="cbtm">${cars.map(c=>{ const s=cbOf(c), k=sel.indexOf(c.uid); return `<button class="cbtm-r ${k>=0?'on':''}" data-a="cbteampick" data-id="${c.uid}"><span class="cbtm-n" data-a="cbtmq" data-id="${c.uid}" role="button" aria-label="Ajouter ou retirer de l'équipe">${k>=0?k+1:''}</span><span class="cbtm-th">${thArt(c)}</span><div><b>${M[c.mid].nom}</b><small>Niv. ${s.lv} · ${s.ty.map(x=>CB_TYPES[x].ic+' '+CB_TYPES[x].n).join(' / ')} · ${CB_TAL[s.tal].n}</small></div></button>`; }).join('')}</div>
      <button class="btn wide" data-a="arena">✓ Terminé</button>`; return true; }
  if(sheet&&sheet.t==='cbshop'){ const bag=cbBag();
    el.innerHTML=`${X}<h2>🛒 Boutique de combat</h2><p class="note">Tu as <b>${neoT(neoN())}</b>. Objets utilisables pendant les duels (4 par combat).</p>
      <div class="cbshop">${Object.entries(CB_IT).map(([k,it])=>`<div class="cbs-r"><span class="cbs-ic">${it.ic}</span><div><b>${it.n}</b><small>${it.d} · possédé : ${bag[k]||0}</small></div><div class="cbs-b"><button class="btn sm" data-a="cbbuy" data-id="${k}" data-v="1" ${neoN()<it.px?'disabled':''}>${fmt(it.px)} ◈</button><button class="btn alt sm" data-a="cbbuy" data-id="${k}" data-v="5" ${neoN()<it.px*5?'disabled':''}>×5</button></div></div>`).join('')}</div>
      <button class="btn wide" data-a="arena">Retour à l’Arène</button>`; return true; }
  return _sx.apply(this,arguments); }; }
Object.assign(ACT,{
  arena(){ if(!cbAwake()) return toast('🔒 L’Arène s’ouvre après l’éveil cosmique (niveau 10)'); if(S.cbT){ openSheet({t:'cbtalk',ph:S.cbT.last==='win'?'lose':S.cbT.last==='lose'?'win':'pre'}); return; } openSheet({t:'arena'}); },
  cbcup(d){ cbCupStart(+d.id); }, cbfight(){ cbFight(); }, cbnext(){ cbNextRound(); },
  cbquitcup(){ S.cbT=null; save(); openSheet({t:'arena'}); },
  cbteamopen(){ openSheet({t:'cbteam'}); },
  cbteampick(d){ const u=+d.id; let t=cbTeam().slice(); if(!S.cbTeam) S.cbTeam=t; t=S.cbTeam.filter(x=>car(x)); const k=t.indexOf(u); if(k>=0){ if(t.length<=1) return toast('Il faut au moins une voiture'); t.splice(k,1); } else { if(t.length>=4) return toast('4 voitures maximum : retires-en une d’abord'); t.push(u); } S.cbTeam=t; save(); renderSheet(); try{ ui('click'); }catch(_){} },
  cbshop(){ openSheet({t:'cbshop'}); },
  cbbuy(d){ const it=CB_IT[d.id], q=+d.v||1; if(!it) return; if(neoN()<it.px*q) return toast('Pas assez de jetons Néo'); S.neo=neoN()-it.px*q; const b=cbBag(); b[d.id]=(b[d.id]||0)+q; save(); renderSheet(); toast(it.ic+' '+it.n+' ×'+q+' ajouté au sac'); try{ ui('click'); }catch(_){} }
});
/* l'entraînement compte dans les statistiques de l'Arène */
{ const _tr=ACT.cbtrain; ACT.cbtrain=function(){ try{ if(sheet) closeSheet(); }catch(_){} const r=_tr.apply(this,arguments); try{ if(CBV){ const o=CBV.o, prev=o.onEnd; o.onEnd=(res,B)=>{ const st=cbSt(); if(res.win) st.w++; else st.l++; st.tr++; save(); if(prev) prev(res,B); }; o.onClose=()=>openSheet({t:'arena'}); } }catch(e){} return r; }; }

/* ---- 5. onglet « Arène » dans la barre du bas, entre Marché et Missions, dès que l'éveil est confirmé ---- */
(()=>{ if(!TABS.some(t=>t[0]==='arena')){ const i=TABS.findIndex(t=>t[0]==='missions'); TABS.splice(i<0?TABS.length:i,0,['arena','⚔️','Arène']); } })();
{ const _ok=tabOk; tabOk=function(id){ if(id==='arena') return cbAwake(); return _ok.apply(this,arguments); }; }
{ const _tb=ACT.tab; ACT.tab=function(d){ if(d&&d.id==='arena'){ ACT.arena(); return; } return _tb.apply(this,arguments); }; }
/* l'onglet s'allume quand une page de l'Arène est ouverte */
function arenaNav(){ try{ const b=document.querySelector('#nav button[data-id="arena"]'); if(!b) return; const on=!!(sheet&&['arena','cbtalk','cbcup','cbteam','cbshop'].includes(sheet.t)); if(on){ document.querySelectorAll('#nav button[aria-current]').forEach(x=>x.removeAttribute('aria-current')); b.setAttribute('aria-current','page'); } else if(b.getAttribute('aria-current')) b.removeAttribute('aria-current'); }catch(e){} }
{ const _r=render; render=function(){ const r=_r.apply(this,arguments); arenaNav(); return r; }; }
{ const _rs=renderSheet; renderSheet=function(){ const r=_rs.apply(this,arguments); arenaNav(); return r; }; }
{ const _cs=closeSheet; closeSheet=function(){ const was=sheet&&['arena','cbtalk','cbcup','cbteam','cbshop'].includes(sheet.t), r=_cs.apply(this,arguments);
  try{ if(was){ const nav=document.getElementById('nav'); if(nav){ let g=view; if(GRP_AT.includes(view)) g='atelier'; else if(GRP_MK.includes(view)) g='marche'; else if(view==='prep'||view==='result'||view==='race') g='epreuves';
    nav.querySelectorAll('button').forEach(b=>{ if(b.dataset.id===g) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); }); } } }catch(e){} return r; }; }
