# v2.14 : ponts à l'envers (la bille repart à la sortie), billes en plus (3 ponts = +1, jusqu'à 5), clapets (multiplicateur fixé), tour + Rolls-Royce (3 entrées → chasse, barre de vie, capture), table 9.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_v214.py
import asyncio, os
from playwright.async_api import async_playwright
JS = r"""async ()=>{ try{ arcQuit(); }catch(e){} S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.cr=900000; S.lvl=30; view='garage'; render(); arcOpen('pin'); ACT.arcstart(); await new Promise(r=>setTimeout(r,150));
  const E=[], P=__pin, info={}; const sim=(n)=>{ for(let k=0;k<n;k++) P.sim(1/60); };
  /* 1. un pont : la bille entre, ressort à la sortie en jeu (pas en garage), compteur de ponts */
  P.loadTable(0); P.balls[0].st='play'; P.balls[0].x=200; P.balls[0].y=300; P.balls[0].vx=P.balls[0].vy=0;
  { const r=P.ramps[0], b=P.balls[0]; b.x=r.mx; b.y=r.my+14; b.vx=r.ux*420; b.vy=r.uy*420; b.la=false; let ok=false; for(let k=0;k<60*14&&!ok;k++){ P.sim(1/60); if(r.n>0) ok=true; }
    if(!ok) E.push('la bille lancée dans l’entrée ne fait pas le pont'); else { const q=P.balls[0]; if(q.st==='hold') E.push('la sortie du pont retient la bille (garage)'); if(Math.hypot(q.x-r.ex,q.y-r.ey)>60) E.push('la bille ne repart pas de la sortie du pont '+Math.round(q.x)+','+Math.round(q.y)); } }
  /* 2. 3 ponts = une bille en plus ; jamais plus de 5 */
  P.loadTable(1); { const bs=P.balls; const nb0=bs.length; for(let i=0;i<3;i++){ const r=P.ramps[0], b=P.balls[0]; b.st='ramp'; b.rp=0; b.rs=r.len-1; b.rsp=600; b.fl=1; sim(6); }
    if(P.balls.length!==nb0+1) E.push('3 ponts ne donnent pas une bille en plus ('+nb0+' → '+P.balls.length+')'); info.apres3ponts=P.balls.length; }
  for(let i=0;i<8;i++) P.extraBall(100,100,50,50); if(P.balls.length>5) E.push('plus de 5 billes en jeu : '+P.balls.length); info.max=P.balls.length;
  /* 3. clapet : multiplicateur fixé, conservé après la perte d'une bille */
  P.loadTable(0); { const r=P.ramps.find(q=>q.flap); if(!r) E.push('aucun clapet sur la table 1'); else { const m0=P.mult; P.flapHit(r); if(P.mFix!==r.flap||P.mult<r.flap) E.push('le clapet ne fixe pas le multiplicateur ('+P.mFix+','+P.mult+')'); info.flap=r.flap;
      P.balls.length=0; P.balls.push({x:180,y:700,vx:0,vy:0,st:'play',trail:[],la:false,ht:0,stuck:0}); sim(3); if(P.mult<r.flap) E.push('le multiplicateur fixé est perdu quand la bille tombe ('+P.mult+')'); } }
  /* 4. table 9 : tour, Rolls, barre de vie, capture */
  P.loadTable(8); { if(!P.sauc2.on||!P.sauc2.tower) E.push('pas de tour sur la table 9'); const n0=P.caps.length; P.towerEnter(); P.towerEnter(); if(P.part.on) E.push('la Rolls part avant la 3e entrée'); P.towerEnter();
    if(!(P.part.on&&P.part.rolls)) E.push('3 entrées dans la tour : la Rolls n’est pas lâchée'); else { info.hpRolls=P.part.hp; if(P.part.hp<7) E.push('la Rolls a trop peu de vie '+P.part.hp);
      const b=P.balls[0]; b.st='play'; let hits=0; for(let k=0;k<60&&P.part.on;k++){ const pp=P.part; b.x=pp.x-pp.r-4; b.y=pp.y; b.vx=500; b.vy=0; P.part.cool=0; const hp0=pp.hp; sim(2); if(P.part.on&&P.part.hp<hp0) hits++; else if(!P.part.on) hits++; }
      if(P.part.on) E.push('la Rolls ne se capture pas à coups de bille (vie '+P.part.hp+')'); else if(P.caps.length<=n0) E.push('la Rolls est partie sans être capturée'); info.hits=hits; } }
  /* 5. clapet du couloir de lancement supprimé : plus de segment « door » dans les murs */
  if(P.segs.some(s=>s.door)) E.push('le clapet de lancement existe encore');
  /* 6. toutes les tables se chargent */
  for(let i=0;i<P.TBL.length;i++){ P.loadTable(i); sim(20); if(P.tab!==i) E.push('table '+i+' non chargée'); }
  info.tables=P.TBL.length; return {E,info}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 412, 'height': 860}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://' + os.path.abspath('out.html')); await pg.wait_for_timeout(800)
        r = await pg.evaluate(JS)
        print('infos :', r['info']); print('PROBLÈMES :', r['E'] or 'aucun', '| erreurs de page :', errs or 'aucune'); await b.close()
asyncio.run(main())
