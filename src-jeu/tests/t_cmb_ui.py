# v1.5 · écran de duel (new54) : un duel complet joué par l'interface, sur 2 tailles d'écran.
# Vérifie : pas d'erreur, tout tient sur l'écran, menu utilisable, objets, changement, fin, XP sauvegardée, fermeture propre.
import asyncio, os, sys
from playwright.async_api import async_playwright
URL = 'file:///' + os.path.abspath('out.html').replace('\\', '/')
SETUP = """()=>{ S=fresh(); S.age18=true; S.intro=true; S.seenVer=GAME_VER; S.niveau10CinematicSeen=true; try{closeSheet()}catch(e){}
  ['rossa','aurion','fury'].forEach(mid=>S.cars.push({uid:S.nuid++,mid,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{}}));
  S.cars.forEach(c=>{ const s=cbOf(c); cbGainXP(c,cbNeed(22)-s.xp); }); S.cbBag={kit:2,superkit:1}; save();
  window.__xp0=S.cars.slice(-3).map(c=>cbOf(c).xp);
  cbStartDuel({team:S.cars.slice(-3).map(c=>c.uid),foes:[{mid:'kombi',lv:12},{mid:'steppe',lv:12}],d:1,names:['Toi','Rival']}); }"""
STEP = """()=>{ if(!CBV) return 'x'; if(CBV.busy){ CBV.fast=true; return 'busy'; } const B=CBV.B; if(B.over!=null) return 'over';
  if(B.need&&B.need.includes(0)){ const b=document.querySelector('[data-cb=rep]:not([disabled])'); b&&b.click(); return 'rep'; }
  const f=cbAct(B,0);
  if(!window.__it&&f.hp<f.mhp*.7&&B.sides[0].bag.kit>0){ window.__it=1; document.querySelector('[data-cb=tab][data-v=it]').click(); const b=document.querySelector('[data-cb=it][data-v=kit]:not([disabled])'); if(b){ b.click(); return 'item'; } }
  if(!window.__sw&&B.t>=2){ window.__sw=1; document.querySelector('[data-cb=tab][data-v=sw]').click(); const b=document.querySelector('[data-cb=sw]:not([disabled])'); if(b){ b.click(); return 'switch'; } }
  const b=document.querySelector('[data-cb=cont]')||document.querySelector('[data-cb=mv]:not([disabled])'); if(b){ b.click(); return 'move'; } return 'rien'; }"""
async def run(p, w, h):
    b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': w, 'height': h})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
    await pg.goto(URL); await pg.wait_for_timeout(1500); await pg.evaluate(SETUP); await pg.wait_for_timeout(1200)
    E = []
    fit = await pg.evaluate("()=>{ const o=$('cbov'); return [o.scrollHeight<=innerHeight+1, o.getBoundingClientRect().height, $('cbMenu').getBoundingClientRect().bottom<=innerHeight+1, document.querySelectorAll('[data-cb=mv]').length]; }")
    if not (fit[0] and fit[2]): E.append('ne tient pas sur l’écran %s' % fit)
    if fit[3] < 1: E.append('pas de boutons d’attaque')
    seen = set()
    for i in range(200):
        st = await pg.evaluate(STEP); seen.add(st)
        if st in ('over', 'x'): break
        await pg.wait_for_timeout(250)
    r = await pg.evaluate("()=>CBV?{over:CBV.B.over,t:CBV.B.t,res:!!CBV.res,xp:S.cars.slice(-3).map(c=>cbOf(c).xp),xp0:window.__xp0,end:!!document.querySelector('.cb-end'),bag:S.cbBag}:null")
    if not r or r['over'] is None: E.append('duel pas terminé %s' % r)
    else:
        if not r['end']: E.append('écran de fin absent')
        if not any(a > b0 for a, b0 in zip(r['xp'], r['xp0'])): E.append('aucune XP gagnée')
        if 'item' in seen and r['bag'].get('kit', 2) >= 2: E.append('objet utilisé mais pas retiré du sac')
    await pg.evaluate("document.querySelector('[data-cb=close]')&&document.querySelector('[data-cb=close]').click()"); await pg.wait_for_timeout(300)
    closed = await pg.evaluate("()=>!$('cbov')&&!CBV&&!document.body.classList.contains('cbon')&&!document.getElementById('upd')")
    if not closed: E.append('fermeture incomplète')
    saved = await pg.evaluate("()=>{ const k=Object.keys(localStorage).find(k=>/rg|rouille|save/i.test(k)); return k?localStorage.getItem(k).includes('\"cmb\"'):null; }")
    if saved is False: E.append('fiches de combat absentes de la sauvegarde')
    print('%dx%d : %s tours, actions %s' % (w, h, r and r['t'], sorted(seen)))
    await b.close(); return E + errs
async def main():
    async with async_playwright() as p:
        E = await run(p, 390, 844) + await run(p, 360, 640)
    print('ERREURS' if E else 'OK', E); sys.exit(1 if E else 0)
asyncio.run(main())
