# v2.15 : compatibilité des sauvegardes — une vieille sauvegarde (v1, sans les clés ajoutées depuis : Néo, Rue, combat, arcade, argent sale…),
# une sauvegarde abîmée (JSON invalide) et une sauvegarde avec des objets inconnus doivent se charger sans erreur, et tous les onglets s'afficher.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_save.py
import asyncio, os, json
from playwright.async_api import async_playwright
OLD = {"v": 1, "ts": 0, "cr": 42000, "tok": 5, "scrap": 3, "mods": [{"u": 1, "t": "inconnu", "r": 9}], "muid": 2, "xp": 300, "lvl": 15, "nuid": 9, "intro": True, "tuto": True, "tutoDone": True, "age18": True, "charte": 1,
       "cars": [{"uid": 1, "mid": "piccola", "etat": 50, "xp": 0, "lvl": 3, "up": {}, "inv": 0}, {"uid": 4, "mid": "velo", "etat": 80}, {"uid": 5, "mid": "fury", "etat": 90, "lvl": 7}],
       "bat": {"atelier": 2, "casse": 1}, "stats": {"wins": 12, "races": 30}, "claimed": {}, "first": {}, "offres": [{"mid": "voiture_disparue"}], "pod": {"tier": 2, "slots": [5, 5, 99]}, "audio": {"sfx": .5}}
CHECK = r"""async ()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)), E=[], o={}; try{ if(sheet) closeSheet(); }catch(e){}
  o.cars=S.cars.map(c=>c.mid).join(','); o.lvl=S.lvl; o.cr=S.cr; o.mods=S.mods.length; o.pod=S.pod.slots.filter(Boolean).join(',');
  for(const v of ['garage','epreuves','atelier','base','marche','missions','cartes','arena','equipe']){ try{ view=v; render(); await w(120); }catch(e){ E.push(v+' : '+e.message); } }
  try{ arcOpen('nitro'); arcQuit(); }catch(e){ E.push('arcade : '+e.message); }
  try{ openSheet({t:'arcprix'}); closeSheet(); }catch(e){ E.push('comptoir : '+e.message); }
  try{ ACT.pilot({}); closeSheet(); }catch(e){ E.push('pilote : '+e.message); }
  return {E,o}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); res = {}
        for name, raw in [('vieille', json.dumps(OLD)), ('abimee', '{"v":3,"cr":12'), ('vide', '')]:
            pg = await b.new_page(viewport={'width': 390, 'height': 844}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
            await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
            url = 'file:///' + os.path.abspath('out.html').replace(chr(92), '/')
            await pg.goto(url); await pg.wait_for_timeout(1200)
            key = await pg.evaluate("()=>KEY")
            await pg.evaluate("([k,v])=>{ localStorage.clear(); if(v) localStorage.setItem(k,v); }", [key, raw])
            await pg.goto(url); await pg.wait_for_timeout(2500)
            r = await pg.evaluate(CHECK); res[name] = (r, list(errs)); await pg.close()
        bad = 0
        for k, (r, errs) in res.items():
            print(k, ':', r['o'], '| problèmes :', r['E'] or 'aucun', '| erreurs de page :', errs or 'aucune'); bad += len(r['E']) + len(errs)
        print('RÉSULTAT :', 'OK' if not bad else f'{bad} problème(s)'); await b.close()
asyncio.run(main())
