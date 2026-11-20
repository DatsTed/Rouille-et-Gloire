# v2.15 : salle d'arcade — les 4 nouvelles bornes (bots simples), le Défi du jour, le comptoir de prix enrichi, les POI de la salle 3D.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_arcade.py
import asyncio, os, json
from playwright.async_api import async_playwright
JS = r"""async ()=>{ const E=[], o={}, w=ms=>new Promise(r=>setTimeout(r,ms));
  S=fresh(); Object.assign(S,{intro:true,tuto:true,tutoDone:true,lvl:30,cr:100000,seenVer:GAME_VER}); view='garage'; render();
  const run=async(id,bot,secs)=>{ arcOpen(id); arcStart(); await w(60); const H=window['__'+id]; if(!H){ E.push(id+' : pas lancé'); return null; } H.G.stop(); H.G.cd=0;
    const tk0=arcS().tk; let n=0; for(;n<60*secs&&!H.G.over;n++){ bot(H); H.G.tick(1/60); } await w(900); const r={score:Math.round(H.score),sec:Math.round(n/60),over:H.G.over,tk:arcS().tk-tk0,best:arcS().best[id]||0};
    if(!r.over) E.push(id+' : la partie ne se termine pas en '+secs+' s'); if(r.over&&!document.querySelector('#arcst .arc-card.res')) E.push(id+' : pas d’écran de fin'); arcQuit(); return r; };
  /* Invaders : on vide 3 vagues puis on se fait toucher 3 fois */
  o.inv=await run('inv',H=>{ if(H.G.t%1.5<1/60&&H.wave<4) H.kill(); if(H.wave>=4&&H.G.t%.7<1/60) H.hurt(); },60);
  /* Cosmo : nitro quand la voiture passe sous le centre du prochain portique */
  o.cosmo=await run('cosmo',H=>{ const g=H.gates.find(q=>q.x>80); const ty=g?g.cy+6:300; if(H.y>ty&&H.G.t%.12<1/60) H.tap(); },90);
  /* Tir : vise les jantes (pas les rouillées) toutes les 0,3 s */
  o.tir=await run('tir',H=>{ if(H.G.t%.3<1/60){ const t=H.tg.find(q=>q.k!=='b'&&q.x>20&&q.x<340); if(t) H.shoot(t.x,t.y); } },45);
  /* Boxe : esquive du bon côté, puis contre */
  o.fight=await run('fight',H=>{ if(H.ph==='wind'&&H.G.t%.1<1/60) H.hit(-H.side); if(H.ph==='counter'&&H.G.t%.12<1/60) H.hit(1); },180);
  /* Défi du jour : objectif atteignable → tickets bonus, puis plus rejouable */
  { const D=arcDaily(); o.defi={g:D.g,goal:D.goal}; D.g='nitro'; D.goal=10; D.done=0; const tk0=arcS().tk; arcOpen('defi'); const btn=document.querySelector('#arcst [data-a="arcstart"]'); o.defiBtn=btn&&btn.textContent; arcStart(); await w(80);
    if(AOV.id!=='nitro'||!AOV.defi) E.push('le défi ne lance pas la bonne borne'); const H=__nit; for(let r=0;r<6;r++){ H.m=H.c; H.stop(); await w(760); } await w(1200);
    o.defiTk=arcS().tk-tk0; if(!arcDaily().done) E.push('défi réussi non enregistré'); if(!/Défi du jour réussi/.test((document.querySelector('#arcst')||{}).innerText||'')) E.push('pas de mention du défi à la fin'); arcQuit();
    arcOpen('defi'); const b2=document.querySelector('#arcst [data-a="arcstart"]'); if(!b2||!b2.disabled) E.push('défi encore jouable après réussite'); arcQuit(); }
  /* comptoir : nouveaux prix */
  { const ids=PRIZES.map(p=>p.id); ['neo','pep','parc'].forEach(k=>{ if(!ids.includes(k)) E.push('prix manquant '+k); }); const A=arcS(); A.tk=1000; const n0=S.neo||0; ACT.arcbuy({id:'neo'}); if((S.neo||0)-n0!==1500) E.push('prix Néo non versé'); const m0=S.mods.length; ACT.arcbuy({id:'pep'}); if(S.mods.length!==m0+1) E.push('pièce épique non donnée'); o.tkLeft=A.tk; }
  /* niveaux requis */
  { S.lvl=5; arcOpen('fight'); if(AOV) E.push('Choc des Pare-chocs ouvert au niveau 5'); arcQuit(); S.lvl=30; }
  return {E,o}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 390, 'height': 844}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///' + os.path.abspath('out.html').replace(chr(92), '/')); await pg.wait_for_timeout(1200)
        r = await pg.evaluate(JS)
        for k, v in r['o'].items(): print(k, ':', v)
        print('PROBLÈMES :', r['E'] or 'aucun', '| erreurs de page :', errs or 'aucune'); await b.close()
asyncio.run(main())
