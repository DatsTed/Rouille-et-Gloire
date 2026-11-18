import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':412,'height':860})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(1500)
        r=await pg.evaluate("""async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); S=fresh(); S.intro=true;S.tuto=true;S.tutoDone=true;S.age18=true;S.charte=1;S.seenVer='1.2';S.labSeen=1;S.unlQ=[]; S.cr=1000; S.tok=600; const n0=S.cars.length, out=[];
          packMulti('pcar','tok',1); out.push([S.tok,S.cars.length-n0,S.cr, sheet&&sheet.t, sheet&&sheet.k]);
          closeSheet(); packMulti('pcar','tok',2); out.push([S.tok,S.cars.length-n0]);
          ACT.cpreveal(); await w(100); const btn=document.querySelector('#sheet button[data-id="pcar"]'); out.push(btn?btn.dataset.k+'|'+btn.textContent.trim():'nobtn');
          closeSheet(); packMulti('pcar','tok',10); out.push(['x10',S.tok,S.cars.length-n0]); closeSheet(); packMulti('pcar','tok',5); out.push(['x5 trop?',S.tok,S.cars.length-n0]);
          closeSheet(); packMulti('pcar','cr',1); out.push(['cr pas assez',S.cr,S.cars.length-n0]);
          const p=PACKS.find(x=>x.id==='pcar'); out.push(p.tok,p.cr); return out; }""")
        print(r); print(errs); await b.close()
asyncio.run(main())
