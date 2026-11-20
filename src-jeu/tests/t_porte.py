# v2.14 : le clapet qui se refermait en haut du couloir du piston est remplacé par un toit à sens unique ; vérifie qu'aucune bille ne s'y coince.
# 1) billes lâchées au-dessus du toit (x de 296 à 346, vitesses diverses) : doivent repartir (jamais immobiles) ; 2) lancers de 40 % à 100 % : la bille passe le toit et atteint le haut.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_porte.py
import asyncio, os
from collections import Counter
from playwright.async_api import async_playwright
JS = r"""async ()=>{ try{ arcQuit(); }catch(e){} S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.cr=900000; S.lvl=30; view='garage'; render(); arcOpen('pin'); ACT.arcstart(); await new Promise(r=>setTimeout(r,150));
  const P=__pin, E=[], out={drops:[],launch:[]}; P.loadTable(0); const b=P.balls[0];
  for(let x=296;x<=346;x+=3) for(const [vx,vy] of [[0,0],[-60,120],[40,200],[0,-300]]){ b.st='play'; b.x=x; b.y=130; b.vx=vx; b.vy=vy; b.la=false; b.stuck=0; b.trail=[]; let last=[b.x,b.y], still=0, mx=0;
    for(let k=0;k<60*7;k++){ P.sim(1/60); if(b.st==='plunger'||b.y>330) break; if(Math.hypot(b.x-last[0],b.y-last[1])<.25) still++; else still=0; last=[b.x,b.y]; mx=Math.max(mx,still); }
    if(mx>150) E.push('bille immobile '+Math.round(mx/60*10)/10+' s depuis x='+x+' v='+vx+','+vy+' → '+Math.round(b.x)+','+Math.round(b.y)+' '+b.st); out.drops.push(b.st==='plunger'?'L':(b.x<318?'J':'?')); }
  for(const pw of [.4,.55,.7,.85,.9,1]){ b.st='plunger'; b.x=333; b.y=572; b.vx=b.vy=0; b.trail=[]; P.launchP(pw); let top=999, inField=false;
    for(let k=0;k<60*5;k++){ P.sim(1/60); top=Math.min(top,b.y); if(b.st==='play'&&b.x<300&&b.y<200) inField=true; if(inField||b.y>560) break; }
    out.launch.push([pw,Math.round(top),inField]); if(pw>=.7&&!inField) E.push('lancer '+pw+' : la bille ne passe pas dans le jeu'); }
  return {E,out}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 412, 'height': 860}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://' + os.path.abspath('out.html')); await pg.wait_for_timeout(800)
        r = await pg.evaluate(JS)
        print('billes lâchées : J = repartent dans le jeu, L = retour au couloir ->', dict(Counter(r['out']['drops'])))
        print('lancers (puissance, hauteur atteinte, dans le jeu) :', r['out']['launch'])
        print('PROBLÈMES :', r['E'] or 'aucun', '| erreurs de page :', errs or 'aucune'); await b.close()
asyncio.run(main())
