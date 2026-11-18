import asyncio
from playwright.async_api import async_playwright
STUB=open('t_pt2.py').read().split('STUB="""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':780})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.add_init_script(STUB)
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(2500)
        r=await pg.evaluate("""async()=>{ glAttach=()=>{}; const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.seenVer='1.2'; S.age18=false; S.lvl=14; S.labSeen=0; S.cr=50000; S.tx={garage:1,epreuves:1,cartes:1,marche:1,base:1,missions:1,atelier:1,equipe:1};
          ACT.tab({id:'atelier'}); await w(2500); o.sheetT=sheet&&sheet.t; o.unl=(sheet&&sheet.it||[]).map(x=>x[1]).join('|'); if(sheet) closeSheet(); await w(2200); o.sheet2=sheet&&sheet.t; if(sheet) closeSheet();
          o.sw=[...document.querySelectorAll('#view .topsw button')].map(b=>b.textContent.trim()).join('|');
          o.html=/labo|clandestin|cannabis|karma/i.test(document.getElementById('view').innerText);
          for(const v of ['garage','epreuves','marche','missions','base','equipe']){ ACT.tab({id:v}); await w(300); o['t_'+v]=/labo|clandestin|cannabis|karma|ranch/i.test(document.body.innerText)?document.body.innerText.match(/.{20}(labo|clandestin|cannabis|karma|ranch).{20}/i)[0].replace(/\\n/g,' '):'-'; }
          return JSON.stringify(o); }""")
        print(r); print([e for e in errs if 'insertBefore' not in e])
        await b.close()
asyncio.run(main())
