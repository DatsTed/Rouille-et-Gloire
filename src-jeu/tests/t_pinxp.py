# v2.15 : expérience du flipper = 8·√score (au lieu de score/25) ; vérifie le gain et la note de fin pour plusieurs scores.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_pinxp.py
import asyncio, os
from playwright.async_api import async_playwright
JS = r"""async (sc)=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); try{ arcQuit(); }catch(e){}
  S=fresh(); Object.assign(S,{intro:true,tuto:true,tutoDone:true,lvl:30,cr:100000,seenVer:GAME_VER}); const P=pbS(); P.lv=1; P.xp=0; arcOpen('pin'); arcStart(); await w(200);
  const Q=__pin; Q.setScore(sc); for(let i=0;i<6&&!Q.over;i++){ Q.lose(); await w(30); } await w(1500);
  const note=(document.querySelector('#arcst .arc-card.res')||{}).innerText||''; const tot=(()=>{ let t=P.xp; for(let l=1;l<P.lv;l++) t+=pbNeed(l); return t; })();
  return {sc,lv:P.lv,tot,note:(note.match(/\+[\d\s  ]+ XP[^\n]*/)||[''])[0]}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 390, 'height': 844}); errs = []; E = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///' + os.path.abspath('out.html').replace(chr(92), '/')); await pg.wait_for_timeout(1200)
        for sc in [10000, 40000, 250000, 1000000]:
            r = await pg.evaluate(JS, sc); exp = int(8 * sc ** .5)
            print(r)
            if abs(r['tot'] - exp) > exp * .02 + 5 and sc > 40000: E.append(f'score {sc} : XP {r["tot"]} au lieu de ≈{exp}')
            if sc >= 40000 and str(r['tot'])[:2] not in ''.join(ch for ch in r['note'] if ch.isdigit()): E.append(f'note de fin non mise à jour ({r["note"]})')
        print('PROBLÈMES :', E or 'aucun', '| erreurs de page :', errs or 'aucune'); await b.close()
asyncio.run(main())
