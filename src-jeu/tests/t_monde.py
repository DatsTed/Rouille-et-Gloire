# Région Néon (v1.7) : ouverture, conduite sur la route, rencontre sauvage, barrière de badge, champion en ville.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_monde.py [fichier.html]
import asyncio, os, sys
from playwright.async_api import async_playwright
HTML = sys.argv[1] if len(sys.argv) > 1 else 'out.html'
JS = r"""async ()=>{ const E=[], wait=ms=>new Promise(r=>setTimeout(r,ms));
  S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.age18=true; S.lvl=20; S.niveau10CinematicSeen=true; S.lvUnified=1;
  ['touge','piccola'].forEach(mid=>S.cars.push({uid:S.nuid++,mid,etat:100,xp:0,lvl:12,up:{},inv:0,mods:{},sh:1})); S.cbTeam=S.cars.slice(-2).map(c=>c.uid); save();
  await wOpen(); await wait(600); for(let i=0;i<4&&sheet;i++) closeSheet();
  if(!W.on||GL.mode!=='world') E.push('carte non ouverte '+GL.mode);
  const sh0=sheet&&sheet.t; let fr=0; const f0=performance.now(); await new Promise(r=>{ const f=()=>{ fr++; performance.now()-f0<1000?requestAnimationFrame(f):r(); }; f(); }); for(let i=0;i<5&&sheet;i++) closeSheet(); W.in.gas=1; await wait(10000); W.in.gas=0; const d=Math.hypot(W.p.x,W.p.z); if(d<30||W.route!==0) E.push('conduite '+Math.round(d)+' route '+W.route);
  const q=wNear(W.p.x,W.p.z); if(Math.abs(q.lat)>W_HW+1.3) E.push('hors de la route');
  const R0=W.routes[0], pp=R0.P[R0.iA+6]; W.p.x=pp.x; W.p.z=pp.z; W.p.y=0; W.p.v=0; const w=W.wild.find(w=>w.R.k===0); w.i=R0.iA+11; w.lane=0; w.cool=0; W.grace=0; await wait(4000); if(!CBV) E.push('pas de duel sauvage '+JSON.stringify([w.i,w.cool,w.ct,w.off,W.route,W.grace,!!W.fight,sheet&&sheet.t,Math.round(Math.hypot(W.p.x-w.g.position.x,W.p.z-w.g.position.z)),W.town,wTownAt(W.p.x,W.p.z)])); else { CBV.B.over=1; cbFinish(); cbClose(); } await wait(500);
  if(W.town!==0||GL.mode!=='world') E.push('pas remorqué en ville');
  W.grace=999; const R1=W.routes[1], g=R1.P[Math.max(1,R1.gate-8)]; W.p.x=g.x; W.p.z=g.z; W.p.h=W.p.va=Math.atan2(g.tz,g.tx); W.p.v=30; await wait(3000); { const qq=wNear(W.p.x,W.p.z,0); if(qq&&qq.k===1&&qq.i>=W.paths[qq.pi].gate) E.push('barrière franchie sans badge '+JSON.stringify([qq.k,qq.i,qq.alt,R1.gate,W.town,!!CBV,W.p.v])); }
  S.rue.bdg.feu=1; W.p.x=g.x; W.p.z=g.z; W.p.h=W.p.va=Math.atan2(g.tz,g.tx); W.p.v=30; await wait(3000); { const qb=wNear(W.p.x,W.p.z,0); if(!qb||(qb.k===1&&qb.i<W.paths[qb.pi].gate)) E.push('barrière toujours fermée avec le badge '+JSON.stringify([qb&&qb.k,qb&&qb.i,qb&&qb.alt,R1.gate,W.p.v,!!CBV,sheet&&sheet.t])); }
  const o=W.pers.find(o=>o.P.id==='ch_eau'); W.p.x=o.x+6; W.p.z=o.z; W.p.v=0; await wait(500); if(!/marin/i.test($('wAct').innerText)) E.push('champion Eau introuvable');
  const ins=W.pers.every(o=>Math.hypot(o.x-o.T.x,o.z-o.T.z)<W_R); if(!ins) E.push('personnage hors ville');
  W.p.v=20; W.in.hand=1; W.in.st=1; W.in.gas=1; await wait(1500); W.in.hand=0; W.in.st=0; W.in.gas=0; if(!(Math.abs(Math.atan2(Math.sin(W.p.h-W.p.va),Math.cos(W.p.h-W.p.va)))>.05||W.drift!=null)) E.push('drift');
  wNitro(); if(!(W.nitT>0)) E.push('nitro');
  { const bad=wCheckRoad(); if(bad.length) E.push('obstacles sur la route : '+bad.slice(0,5).join(' | ')); }
  wBigOpen(); await wait(300); if(!$('wBig')||!W.big) E.push('grande carte'); wBigClose();
  { const X1=W.routes[2].alt, Rg=W.routes[2], pg=X1.P[1]; W.p.x=pg.x; W.p.z=pg.z; W.p.y=0; W.p.h=W.p.va=Math.atan2(pg.tz,pg.tx); W.p.v=30; await wait(2500); const qa=wNear(W.p.x,W.p.z,0); if(qa&&qa.k===2&&qa.alt&&qa.i>=X1.gate) E.push('barrière franchie par la voie double'); }
  { const X2=W.routes[0].alt; W.p.x=X2.P[8].x; W.p.z=X2.P[8].z; W.p.y=0; W.p.h=W.p.va=Math.atan2(X2.P[8].tz,X2.P[8].tx); W.p.v=20; W.grace=999; let mx=0; for(let k=0;k<70;k++){ W.in.gas=.6; const q=wNear(W.p.x,W.p.z,W.p.y), tg=X2.P[Math.min(X2.P.length-1,(q.alt?q.i:0)+6)], a=Math.atan2(tg.z-W.p.z,tg.x-W.p.x), d=Math.atan2(Math.sin(a-W.p.h),Math.cos(a-W.p.h)); W.in.st=clamp(d*2.5,-1,1); mx=Math.max(mx,W.p.y); await wait(200); } W.in.gas=0; W.in.st=0; if(mx<4) E.push('pont non franchi (hauteur max '+mx.toFixed(1)+')'); }
  { const sx=W.stations[0]; W.p.x=sx.x; W.p.z=sx.z; W.p.y=0; W.p.v=0; await wait(600); if(!/Station/i.test($('wAct').innerText)) E.push('bouton station absent entre les bornes'); }
  ACT.wquit(); await wait(300); if(W.on||$('wov')) E.push('sortie');
  return {E,d:Math.round(d)}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']); pg = await b.new_page(viewport={'width': 390, 'height': 844})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') and 'cdnjs' not in r.request.url else r.continue_())
        await pg.goto('file:///' + os.path.abspath(HTML).replace('\\', '/')); await pg.wait_for_timeout(2500)
        if not await pg.evaluate("()=>!!window.THREE"): print('THREE absent (réseau) : test impossible'); await b.close(); return
        r = await pg.evaluate(JS)
        e = r['E'] + [x for x in errs if 'insertBefore' not in x and 'offres' not in x]
        print('distance parcourue en 7 s (headless lent) :', r['d'], 'm'); print('OK' if not e else 'ERREURS', e); await b.close()
asyncio.run(main())