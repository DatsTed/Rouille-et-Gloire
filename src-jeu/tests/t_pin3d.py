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
  if(getComputedStyle(document.querySelector('.pinside')).display!=='none'||getComputedStyle(document.querySelector('.pinlive')).display!=='none') E.push('radar / turbo / classement encore affichés hors de l’écran du bac arrière');
  if(typeof R3.dmdEvent!=='function'||!document.querySelector('.pinmute')) E.push('écran du bac arrière ou bouton son absent'); else { ['SKILL SHOT !','MULTIBILLE !','JACKPOT +5 000','TURBO !!','BALL SAVE !','TILT !','NICE ! COMBO ×5','RADAR +2','LA PIÈCE S’ENFUIT…','🔧 TABLE : GARAGE','CAPTURÉ : Pièce','BANQUE ABATTUE +1 500','MULTI ×2 !','DÉPASSÉ BRANDT !','BILLE 2','PONT DU GARAGE +500','ENCHAÎNEMENT ×3 !'].forEach(m=>R3.dmdEvent(m)); R3.dmdPts('+500'); }
  await wait(1500);
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
    [tl,tr,bl,br,top,bot].forEach(p=>{ { const cv=document.querySelector('.arccv'), cw=cv.clientWidth, ch=cv.clientHeight; if(p[0]<-5||p[0]>cw+5||p[1]<-5||p[1]>ch+5) E.push('coin hors du cadre '+p.map(Math.round)+' / '+cw+'x'+ch); } }); }
  for(let i=0;i<P.TBL.length;i++){ P.loadTable(i); for(let k=0;k<30;k++) P.sim(1/60); await wait(120); if(calls()<10) E.push('table '+i+' : rien dessiné'); if(P.tab!==i) E.push('table '+i+' non chargée'); }
  /* v2.10 : disposition des tables */
  { const sl=[[50,392,98,462],[268,392,222,462]], ds=(x,y,a,b,c,d)=>{ const dx=c-a, dy=d-b, l2=dx*dx+dy*dy||1, tt=Math.max(0,Math.min(1,((x-a)*dx+(y-b)*dy)/l2)); return Math.hypot(x-(a+dx*tt),y-(b+dy*tt)); };
    for(let i=0;i<P.TBL.length;i++){ P.loadTable(i); const nm=P.TBL[i].n, sa=P.sauc, ho=P.hole;
      P.ramps.forEach(r=>{ if(r.to!=='tower'){ if(Math.hypot(r.ex-sa.x,r.ey-sa.y)<45) E.push(nm+' : garage collé à la sortie du pont '+r.nm); if(Math.hypot(r.ex-ho.x,r.ey-ho.y)<45) E.push(nm+' : trou collé à la sortie du pont '+r.nm); } if(r.mr<20) E.push(nm+' : embouchure trop étroite '+r.mr); if(r.my<230||r.my>360||r.ey>r.my-20) E.push(nm+' : '+r.nm+' : entrée trop haute/basse ou sortie pas plus haute que l’entrée ('+Math.round(r.my)+' → '+Math.round(r.ey)+')'); if(Math.hypot(r.mx-sa.x,r.my-sa.y)<45) E.push(nm+' : garage collé à l’entrée du pont '+r.nm); });
      { const pts=[]; P.saucs.forEach(s=>{ if(s.on) pts.push(['garage',s.x,s.y]); }); P.ramps.forEach(r=>pts.push(['base '+r.nm,r.mx,r.my]));
        pts.forEach(([k,x,y])=>{ P.bumps.forEach(bu=>{ const d=Math.hypot(bu.x-x,bu.y-y)-(bu.r||14); if(d<14) E.push(nm+' : '+k+' collé à un bumper ('+Math.round(d)+')'); }); (P.mills||[]).forEach(m=>{ const d=Math.hypot(m.x-x,m.y-y)-(m.r||30); if(d<8) E.push(nm+' : '+k+' dans un moulin ('+Math.round(d)+')'); }); (P.tgt||[]).forEach(g=>{ const d=Math.hypot((g.x||0)-x,(g.y||0)-y); if(d<18) E.push(nm+' : '+k+' sur une cible ('+Math.round(d)+')'); }); }); }
      P.posts.filter(p=>!p.q).forEach(p=>{ const d=Math.min(...sl.map(s=>ds(p.x,p.y,s[0],s[1],s[2],s[3]))); if(d<32) E.push(nm+' : clou à '+Math.round(d)+' px d’une barre rebondissante'); });
      if(Math.hypot(ho.x-180,ho.y-300)<80) E.push(nm+' : le trou de table est au milieu'); if(Math.hypot(ho.x-sa.x,ho.y-sa.y)<50) E.push(nm+' : trou et garage collés'); }
    const b=P.balls[0]; P.loadTable(0); }
  { P.loadTable(0); const r=P.ramps[0], b=P.balls[0]; b.st='play'; b.x=r.mx; b.y=r.my+14; b.vx=r.ux*400; b.vy=r.uy*400; b.la=false; b.trail=[]; let hold=false; for(let k=0;k<60*8&&!hold;k++){ P.sim(1/60); if(P.ramps[0].n>0) hold=true; } if(!P.ramps[0].n) E.push('la bille lancée dans l’embouchure ne fait pas le pont'); P.balls.forEach(q=>{ if(q.st==='hold'){ q.st='play'; q.x=180; q.y=100; q.vx=q.vy=0; } }); }
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
