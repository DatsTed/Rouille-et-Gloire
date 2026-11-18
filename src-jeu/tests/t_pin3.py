import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':412,'height':860},device_scale_factor=1)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(1000)
        await pg.evaluate("""()=>{ S=fresh(); S.intro=false; S.tuto=true; S.tutoDone=true; S.cr=900000; S.lvl=9; view='garage'; render(); document.querySelectorAll('[id*=splash],.splash').forEach(e=>e.remove()); }""")
        await pg.evaluate("arcOpen('pin'); ACT.arcstart()"); await pg.wait_for_timeout(200)
        r=await pg.evaluate("""()=>{ const P=__pin,o={}; P.launch(); for(let i=0;i<200;i++) P.sim(1/60);
          o.doorClosed=!P.door.off; o.nb=P.nballs; // porte fermée après lancement ?
          P.setScore(5200); P.startChasse(); o.mode=P.mode; o.hp=P.part.hp; return o; }"""); print(r)
        await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/p1.png')
        # capture
        r=await pg.evaluate("""()=>{ const P=__pin,o={}; const m0=S.mods.length; P.capture(); o.caps=P.caps.slice(); o.mods=S.mods.length-m0; o.mode=P.mode; return o; }"""); print(r)
        await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/p2.png')
        r=await pg.evaluate("""()=>{ const P=__pin; P.mission(); return [P.nballs,P.score]; }"""); print('mission',r)
        # force un multiball
        r=await pg.evaluate("""()=>{ const P=__pin; const B=P.balls[0]; for(let k=0;k<40;k++){ P.mission(); if(P.nballs>1) break; } for(let i=0;i<300;i++) P.sim(1/60); return [P.nballs,P.over]; }"""); print('multi',r)
        await pg.screenshot(path='/tmp/p3.png')
        # fin + rewards (palier)
        r=await pg.evaluate("""()=>{ const P=__pin; P.setScore(120000); for(let i=0;i<9000&&!P.over;i++){ P.balls.forEach(b=>{ if(b.st==='plunger') P.launch(); }); P.sim(1/60);} return [P.over,P.score]; }"""); print('fin',r)
        await pg.wait_for_timeout(1200); await pg.screenshot(path='/tmp/p4.png')
        print(await pg.evaluate("JSON.stringify({pb:arcS().pb,car:S.cars.filter(c=>c.mid==='arcgt').length,tk:arcS().tk,best:arcS().best.pin})"))
        await pg.evaluate("arcQuit(); S.arc.tk=500; openSheet({t:'arcprix'})"); await pg.wait_for_timeout(300); 
        await pg.evaluate("document.querySelector('#sheet').scrollTop=520"); await pg.screenshot(path='/tmp/p5.png')
        # garage affiche la voiture arcade + collection pièces
        await pg.evaluate("closeSheet(); view='garage'; render()"); await pg.wait_for_timeout(500); 
        # carte du monde
        await pg.evaluate("closeSheet(); view='garage'; render()"); await pg.click('.worldbtn'); await pg.wait_for_timeout(500); await pg.screenshot(path='/tmp/p6.png')
        print('sheet',await pg.evaluate("sheet&&sheet.t"))
        print('errs',errs)
asyncio.run(main())
