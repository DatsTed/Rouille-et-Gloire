# v2.8 : flipper en 3D (new71) — 8 tables, bille sur rampe, chasse, projection, nettoyage du contexte WebGL, repli 2D.
# Nécessite Three.js (cdnjs autorisé) ; sans réseau le test vérifie seulement le repli 2D.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_pin3d.py [fichier.html]
import asyncio, os, sys
from playwright.async_api import async_playwright
HTML = sys.argv[1] if len(sys.argv) > 1 else 'out.html'
START = """()=>{ S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.cr=900000; S.lvl=30; view='garage'; render(); document.querySelectorAll('[id*=splash],.splash').forEach(e=>e.remove()); arcOpen('pin'); ACT.arcstart(); }"""
JS3 = r"""async ()=>{ const E=[], wait=ms=>new Promise(r=>setTimeout(r,ms)), P=__pin, R3=P.r3;
  if(!R3){ E.push('rendu 3D absent'); return {E}; }
  if(R3.scene.children.length<5) E.push('scène vide');
  /* v2.9 : plus de boutons, lancer en maintenant le côté droit, pastilles à droite, pas de flash, trous plus faciles */
  if(getComputedStyle(document.getElementById('arcbar')).display!=='none'||document.querySelector('#pP')) E.push('la barre de boutons est encore là');
  if(!document.querySelector('.pinside .psg')||document.querySelectorAll('.pinside .pp i').length<9) E.push('pastilles radar / turbo absentes à droite');
  if(/PM\.pulse\*\.045|PM\.pulse\*14/.test(GAMES.pin.toString())||/pulse/.test(pin3dMake.toString())) E.push('effet de flash encore présent');
  { const ov=document.getElementById('arcov'), ev=(t,x,y,id)=>ov.dispatchEvent(new PointerEvent(t,{pointerId:id,clientX:x,clientY:y,bubbles:true,cancelable:true})); if(P.st!=='plunger') E.push('la bille devrait être au piston');
    ev('pointerdown',innerWidth-30,600,41); await wait(500); if(P.st!=='plunger') E.push('la bille part avant le relâchement'); ev('pointerup',innerWidth-30,600,41); await wait(250); if(P.st!=='play') E.push('maintenir le côté droit ne lance pas la bille ('+P.st+')'); }
  { const sa=P.TBL[0].sauc; P.loadTable(0); let ok=0, n=0; for(const off of [-12,-6,0,6,12]){ n++; const b=P.balls[0]; b.st='play'; b.x=sa[0]+off; b.y=sa[1]-80; b.vx=0; b.vy=400; b.la=false; b.trail=[]; for(let k=0;k<400;k++){ P.sim(1/240); if(b.st==='hold') break; } if(b.st==='hold') ok++; b.st='play'; b.x=180; b.y=100; b.vx=b.vy=0; } if(ok<3) E.push('le garage capte trop peu : '+ok+'/'+n); }
  { try{ ['flip','flipdn','charge','launch','bump','sling','drop','ramp','rampend','tgt','lane','kick','eject','spin','boost','portal','warp','table','save','multi','turbo','jackpot','tilt','nudge','chasse','parthit','ready'].forEach(k=>PM.sfx(k,2)); PM.rollSet(500); }catch(e){ E.push('son : '+e.message); } }
  const calls=()=>R3.info.render.calls; await wait(200); if(calls()<10) E.push('presque rien n’est dessiné : '+calls());
  /* projection : le haut de la table est plus loin donc plus petit que le bas, gauche < droite */
  { const a=R3.proj(180,300,0), top=R3.proj(180,20,0), bot=R3.proj(180,580,0), l=R3.proj(98,545,0), r=R3.proj(222,545,0), tl=R3.proj(30,60,0), tr=R3.proj(330,60,0), bl=R3.proj(30,540,0), br=R3.proj(330,540,0);
    if(!(a[0]>100&&a[0]<260&&a[1]>150&&a[1]<450)) E.push('centre de la table hors du cadre '+a);
    if(!(top[1]<a[1]&&bot[1]>a[1])) E.push('haut/bas inversés'); if(!(l[0]<r[0])) E.push('flippers inversés');
    if(!((tr[0]-tl[0])<(br[0]-bl[0]))) E.push('pas de perspective (haut aussi large que le bas)');
    [tl,tr,bl,br,top,bot].forEach(p=>{ if(p[0]<-5||p[0]>365||p[1]<-5||p[1]>605) E.push('coin hors du cadre '+p.map(Math.round)); }); }
  for(let i=0;i<P.TBL.length;i++){ P.loadTable(i); for(let k=0;k<30;k++) P.sim(1/60); await wait(120); if(calls()<10) E.push('table '+i+' : rien dessiné'); if(P.tab!==i) E.push('table '+i+' non chargée'); }
  P.loadTable(0); P.launch(); for(let k=0;k<120;k++) P.sim(1/60); await wait(120);
  /* bille sur une rampe, en warp, en saucer */
  { const b=P.balls[0]; b.st='ramp'; b.rp=0; b.rs=P.ramps[0].len*.5; b.rsp=0; b.trail=[[100,200],[104,195]]; await wait(150); b.st='warp'; b.wt=.5; await wait(120); b.st='play'; b.x=180; b.y=330; b.vx=b.vy=0; }
  P.setScore(5200); P.startChasse(); for(let k=0;k<30;k++) P.sim(1/60); await wait(150); P.capture(); await wait(150);
  P.mission(); for(let k=0;k<5;k++) P.mission(); await wait(150); P.flip(0,true); P.flip(1,true); await wait(150); P.flip(0,false); P.flip(1,false);
  return {E,calls:calls(),tris:R3.info.render.triangles}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']); pg = await b.new_page(viewport={'width': 412, 'height': 860}, device_scale_factor=1)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') and 'cdnjs' not in r.request.url else r.continue_())
        await pg.goto('file:///' + os.path.abspath(HTML).replace('\\', '/')); await pg.wait_for_timeout(2500)
        has3 = await pg.evaluate("()=>!!window.THREE"); bad = 0
        if has3:
            await pg.evaluate(START); await pg.wait_for_timeout(600)
            r = await pg.evaluate(JS3); e = r['E']; bad += len(e); print('3D :', 'OK' if not e else e, {k: v for k, v in r.items() if k != 'E'})
            await pg.screenshot(path=os.path.join(os.environ.get('TEMP', '.'), 'pin3d.png'))
            n0 = await pg.evaluate("()=>document.querySelectorAll('canvas').length")
            await pg.evaluate("()=>arcQuit()"); await pg.wait_for_timeout(300)
            n1 = await pg.evaluate("()=>document.querySelectorAll('.arc-st canvas').length")
            if n1: print('canvas restant après la sortie :', n1); bad += 1
            await pg.evaluate(START); await pg.wait_for_timeout(500)
            if not await pg.evaluate("()=>!!(window.__pin&&__pin.r3)"): print('3D absente à la 2e partie'); bad += 1
            await pg.evaluate("()=>arcQuit()"); await pg.wait_for_timeout(200)
        else: print('THREE absent : seul le repli 2D est testé')
        await pg.evaluate("()=>{ window.__pin3dOff=true; }"); await pg.evaluate(START); await pg.wait_for_timeout(500)
        r = await pg.evaluate("""async ()=>{ const P=__pin, E=[]; if(P.r3) E.push('3D encore active malgré __pin3dOff'); P.launch(); for(let k=0;k<200;k++) P.sim(1/60); await new Promise(r=>setTimeout(r,200)); if(!document.querySelector('.arccv')) E.push('canvas 2D absent'); return E; }""")
        bad += len(r); print('repli 2D :', 'OK' if not r else r)
        errs = [x for x in errs if 'insertBefore' not in x and 'offres' not in x]; bad += len(errs)
        print('erreurs de page :', errs or 'aucune'); print('RÉSULTAT :', 'OK' if not bad else f'{bad} problème(s)'); await b.close()
asyncio.run(main())
