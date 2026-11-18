import asyncio,sys,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':412,'height':860},device_scale_factor=1)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(1000)
        await pg.evaluate("""()=>{ S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.age18=true; S.charte=1; S.cr=900000; S.lvl=20; view='garage'; render(); }""")
        await pg.evaluate("arcOpen('pin'); ACT.arcstart()"); await pg.wait_for_timeout(4500)
        n=await pg.evaluate("__pin.TBL.length")
        for i in range(n):
            await pg.evaluate(f"__pin.loadTable({i}); __pin.sim(.05)"); await pg.wait_for_timeout(150)
            el=await pg.query_selector('canvas.arccv'); await el.screenshot(path=f'/tmp/pt{i}.png')
        print(n,[e for e in errs if 'insertBefore' not in e])
        await b.close()
asyncio.run(main())
