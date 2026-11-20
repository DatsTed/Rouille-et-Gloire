# v2.15 : Ligue Néon — verrou (8 badges), ordre des 4 Élites + Maître, défaite = retour à la 1re Élite, récompenses, titre.
# Les duels sont simulés (cbStartDuel remplacé par un résultat imposé) ; la vraie difficulté est mesurée à part (cbAutoBattle).
# Usage (depuis src-jeu/) : python -X utf8 tests/t_ligue.py
import asyncio, os
from playwright.async_api import async_playwright
JS = r"""async ()=>{ const E=[], o={};
  S=fresh(); Object.assign(S,{intro:true,tuto:true,tutoDone:true,lvl:40,cr:100000,seenVer:GAME_VER,niveau10CinematicSeen:true,neo:0}); view='arena'; AR.tab='badges'; render();
  LIGUE.forEach(P=>P.cars.forEach(m=>{ if(!M[m]) E.push('voiture inconnue '+m+' ('+P.nm+')'); })); LIGUE.forEach(P=>{ if(!CB_TYPES[P.ty]) E.push('type inconnu '+P.ty); if(P.wx&&!CB_WX[P.wx]) E.push('météo inconnue '+P.wx); });
  if(document.querySelector('#view .lig .btn')) E.push('bouton d’entrée visible sans les 8 badges');
  if(!document.querySelector('#view .lig')) E.push('panneau de la Ligue absent');
  /* équipe + 8 badges */
  ['fury','solus','aurion','majestic'].forEach(mid=>{ if(M[mid]) S.cars.push({uid:S.nuid++,mid,etat:100,xp:0,lvl:50,up:{},inv:0,mods:{},sh:0}); }); S.cbTeam=S.cars.slice(-4).map(c=>c.uid);
  RUE_CH.forEach(c=>{ rueSt().bdg[c.ty]=Date.now(); }); render(); o.panel=(document.querySelector('#view .lig')||{}).innerText;
  if(!document.querySelector('#view .lig .btn')) E.push('pas de bouton d’entrée avec 8 badges'); if(/arrive bientôt/.test(document.getElementById('view').innerText)) E.push('« arrive bientôt » encore affiché');
  const real=cbStartDuel; let next=true; window.cbStartDuel=cbStartDuel=function(cfg){ o.lastFoes=cfg.foes.map(f=>f.mid+':'+f.lv).join(','); cfg.onEnd({win:next}); cfg.onClose&&cfg.onClose(); };
  /* défier la 2e Élite d'emblée : refusé */
  ligFight('lg_2'); if(ligSt().s!==0) E.push('ordre non respecté');
  /* 2 victoires puis défaite → retour à 0 */
  ligFight('lg_1'); ligFight('lg_2'); o.after2=ligSt().s; next=false; ligFight('lg_3'); o.afterLoss=ligSt().s; if(o.afterLoss!==0) E.push('la défaite ne renvoie pas à la 1re Élite');
  if(!(sheet&&sheet.t==='lig'&&sheet.ph==='lose')) E.push('pas de fiche de défaite'); closeSheet();
  /* la totale : 5 victoires */
  next=true; const n0=S.neo, c0=S.cars.length; LIGUE.forEach(P=>ligFight(P.id)); o.hof=ligSt().hof; o.neo=S.neo-n0; o.cars=S.cars.length-c0; o.sheet=sheet&&sheet.t+':'+sheet.ph+':'+(sheet.champ?'champ':'');
  if(ligSt().hof!==1) E.push('titre de Maître non compté'); if(ligSt().s!==0) E.push('la Ligue ne repart pas à zéro après le titre'); if(o.cars<1) E.push('pas de voiture d’exception au 1er titre');
  closeSheet(); view='arena'; AR.tab='badges'; render(); o.head=(document.querySelector('#view .head p')||{}).innerText;
  /* revanche : 30 %, pas de 2e voiture */
  const c1=S.cars.length; LIGUE.forEach(P=>ligFight(P.id)); if(S.cars.length!==c1) E.push('voiture redonnée en revanche'); o.hof2=ligSt().hof; closeSheet();
  window.cbStartDuel=cbStartDuel=real;
  /* difficulté réelle : équipe niv. 50 du joueur contre chaque adversaire, IA 3 (20 duels auto) */
  { const ids=CARS.map(c=>c.id).filter(id=>id!=='patrouille'&&M[id]); const team=lv=>[0,1,2,3].map(k=>{ const mid=ids[Math.floor(Math.random()*ids.length)], ty=cbTypesOf(mid); return {mid,lv,iv:{hp:15,atk:15,def:15,spa:15,spd:15,vit:15},tal:(CB_TAL_BY[ty[0]]||CB_TAL_BY.meca)[k%4]}; });
    o.win=LIGUE.map(P=>{ let w=0; for(let k=0;k<40;k++){ const B=cbAutoBattle({teams:[team(50),ligFoes(P)],seed:(Math.random()*1e9)|0,ai:[{d:2},{d:3}],wx:P.wx}); if(B.over===0) w++; } return P.nm.split(',')[0]+' '+Math.round(w/40*100)+'%'; }).join(' · '); }
  /* fiche et rendu */
  ACT.ligo({id:'lg_1'}); o.sheetHtml=!!document.querySelector('#sheet .cbtalk'); closeSheet();
  return {E,o}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 390, 'height': 844}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///' + os.path.abspath('out.html').replace(chr(92), '/')); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(JS)
        for k, v in r['o'].items(): print(k, ':', str(v)[:200])
        print('PROBLÈMES :', r['E'] or 'aucun', '| erreurs de page :', errs or 'aucune'); await b.close()
asyncio.run(main())
