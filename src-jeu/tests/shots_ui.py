# Captures « propres » de l'interface (avant / après la refonte visuelle) : onglets, sous-onglets et quelques fiches, sans tutos.
# Usage (depuis src-jeu/) : python -X utf8 tests/shots_ui.py dossier préfixe [largeur hauteur]
import asyncio, os, sys
from playwright.async_api import async_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('TEMP', '.')
PRE = sys.argv[2] if len(sys.argv) > 2 else 'ui'
W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (390, 844)
THEME = '--dark' in sys.argv
SETUP = r"""()=>{ if(window.__dark) document.documentElement.dataset.theme='dark'; S=fresh(); Object.assign(S,{intro:true,tuto:true,tutoDone:true,charte:1,age18:true,lvl:24,cr:1250000,tok:42,nitro:12,niveau10CinematicSeen:true,seenVer:GAME_VER,neo:18500});
  S.tx={}; ['garage','epreuves','cartes','marche','base','missions','atelier','equipe','arena','hub','view','labo','ranch'].forEach(k=>S.tx[k]=1);
  try{ CARS.slice(0,14).forEach((m,i)=>S.cars.push({uid:S.nuid++,mid:m.id,etat:60+i*3,xp:0,lvl:4+i,up:{},inv:0,mods:{},sh:0})); }catch(e){}
  try{ save(); }catch(e){} view='garage'; render(); }"""
SHOTS = [
  ('garage', "view='garage'; render();"),
  ('epreuves', "view='epreuves'; render();"),
  ('prep', "ACT.ev({id:'e1'});"),
  ('cartes', "view='cartes'; render();"),
  ('marche', "view='marche'; render();"),
  ('base', "view='base'; render();"),
  ('missions', "view='missions'; render();"),
  ('atelier', "view='atelier'; render();"),
  ('equipe', "view='equipe'; render();"),
  ('arena_badges', "view='arena'; AR.tab='badges'; render();"),
  ('arena_cups', "view='arena'; AR.tab='cups'; render();"),
  ('pilote', "view='garage'; render(); ACT.pilot({});"),
  ('fiche_voiture', "view='garage'; render(); openSheet({t:'car',uid:S.cars[3].uid});"),
  ('arcade_intro', "view='garage'; render(); arcOpen('drift');"),
  ('arcade_prix', "view='garage'; render(); openSheet({t:'arcprix'});"),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') and 'cdnjs' not in r.request.url else r.continue_())
        await (pg.add_init_script('window.__dark=1') if THEME else asyncio.sleep(0))
        await pg.goto('file:///' + os.path.abspath('out.html').replace(chr(92), '/')); await pg.wait_for_timeout(2500)
        await pg.evaluate(SETUP)
        for name, js in SHOTS:
            await pg.evaluate("()=>{ try{ arcQuit(); }catch(e){} try{ if(sheet) closeSheet(); }catch(e){} document.querySelectorAll('#upd,.tuto,.tu-ov,#tuto').forEach(e=>e.remove()); }")
            try: await pg.evaluate("()=>{ " + js + " }")
            except Exception as e: errs.append(name + ': ' + str(e)[:120])
            await pg.wait_for_timeout(900)
            await pg.evaluate("()=>document.querySelectorAll('#upd,.tuto,.tu-ov,#tuto').forEach(e=>e.remove())")
            await pg.screenshot(path=os.path.join(OUT, f'{PRE}_{name}.png'))
        print('captures :', len(SHOTS), '| erreurs :', errs or 'aucune'); await b.close()
asyncio.run(main())
