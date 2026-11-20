# Captures des nouveautés v2.15 : 4 nouvelles bornes en pleine partie, Défi du jour, Ligue Néon, salle d'arcade 3D.
# Usage (depuis src-jeu/) : python -X utf8 tests/shots_v215.py dossier
import asyncio, os, sys
from playwright.async_api import async_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('TEMP', '.')
SETUP = r"""()=>{ S=fresh(); Object.assign(S,{intro:true,tuto:true,tutoDone:true,charte:1,age18:true,lvl:30,cr:900000,tok:42,niveau10CinematicSeen:true,seenVer:GAME_VER,neo:18500}); S.tx={}; ['garage','epreuves','cartes','marche','base','missions','atelier','equipe','arena','hub','view','labo','ranch'].forEach(k=>S.tx[k]=1); try{ closeSheet(); }catch(e){} view='garage'; render(); }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') and 'cdnjs' not in r.request.url else r.continue_())
        await pg.goto('file:///' + os.path.abspath('out.html').replace(chr(92), '/')); await pg.wait_for_timeout(2500)
        await pg.evaluate(SETUP)
        for gid, warm in [('inv', 4500), ('cosmo', 4200), ('tir', 5200), ('fight', 4300)]:
            await pg.evaluate(f"()=>{{ try{{ arcQuit(); }}catch(e){{}} arcOpen('{gid}'); }}"); await pg.wait_for_timeout(500)
            await pg.screenshot(path=os.path.join(OUT, f'v215_{gid}_intro.png'))
            await pg.evaluate("()=>arcStart()")
            if gid == 'cosmo':
                for _ in range(14):
                    await pg.wait_for_timeout(300); await pg.evaluate("()=>{ const H=__cosmo; if(H&&H.y>290) H.tap(); }")
            else: await pg.wait_for_timeout(warm)
            if gid == 'fight': await pg.evaluate("()=>{ if(__fight){ __fight.pt=0; } }"); await pg.wait_for_timeout(250)
            await pg.screenshot(path=os.path.join(OUT, f'v215_{gid}_jeu.png'))
        await pg.evaluate("()=>{ arcQuit(); arcOpen('defi'); }"); await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(OUT, 'v215_defi.png'))
        await pg.evaluate("()=>{ arcQuit(); RUE_CH.forEach(c=>{ rueSt().bdg[c.ty]=Date.now(); }); ligSt().s=2; view='arena'; AR.tab='badges'; render(); setTimeout(()=>{ const l=document.querySelector('.lig'); if(l) l.scrollIntoView({block:'center'}); },100); }")
        await pg.wait_for_timeout(900); await pg.screenshot(path=os.path.join(OUT, 'v215_ligue.png'))
        await pg.evaluate("()=>{ ACT.ligo({id:'lg_3'}); }"); await pg.wait_for_timeout(700); await pg.screenshot(path=os.path.join(OUT, 'v215_ligue_fiche.png'))
        await pg.evaluate("()=>{ closeSheet(); view='hub'; render(); growEnter('arcade'); }"); await pg.wait_for_timeout(3500)
        await pg.screenshot(path=os.path.join(OUT, 'v215_salle.png'))
        print('erreurs :', errs or 'aucune'); await b.close()
asyncio.run(main())
