import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':412,'height':860},color_scheme='dark')
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(1200)
        for auto in (False,True):
            await pg.evaluate("""(auto)=>{ ACT.close(); S=fresh(); S.intro=false; const ev=EVENTS[1]; R={ev,opps:makeOpps(ev),pick:[S.cars[0].uid],rows:[],auto,result:null};
              const c=S.cars[0], mn=ev.manches[0]; const tk=trackFor(ev,mn); const P=mkRacer(c,mn,{skill:.8,err:0,react:.3}); const Os=[mkRacer(R.opps[0][0],mn,{skill:.8,err:0,react:.3})];
              RC={kind:'race',i:0,mn,tk,auto,clock:-3.4,inp:{t:0,k:0,b:false,kb:false},done:false,P,Os,O:Os[0],pos:1}; view='race'; render(); }""",auto)
            await pg.wait_for_timeout(500); await pg.screenshot(path=f'h_{"auto" if auto else "man"}.png')
        print(errs); await b.close()
asyncio.run(main())
