import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':412,'height':860},color_scheme='dark')
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(1500); await pg.evaluate("()=>{document.querySelectorAll('.splash,#splash,.sp').forEach(e=>e.remove()); const k=document.querySelector('.sp-logo'); if(k&&k.parentElement) k.parentElement.remove();}")
        await pg.evaluate("""()=>{ ACT.close(); S=fresh(); S.intro=false; S.age18=true; S.charte=1; S.seenVer='1.2'; const ev=EVENTS.find(e=>e.manches.some(m=>!m.sp&&m.d!=='drag'&&m.d!=='show')); R={ev,opps:makeOpps(ev),pick:[S.cars[0].uid],rows:[],auto:false,result:null};
          const c=S.cars[0], mn=ev.manches.find(m=>!m.sp&&m.d!=='drag'&&m.d!=='show'); const tk=trackFor(ev,mn); const P=mkRacer(c,mn,{skill:.8,err:0,react:.3}); const Os=[mkRacer(R.opps[0][0],mn,{skill:.8,err:0,react:.3})];
          RC={kind:'race',i:0,mn,tk,auto:false,clock:-3.4,inp:{t:0,k:0,b:false,kb:false,hand:false},done:false,P,Os,O:Os[0],pos:1}; view='race'; render(); }""")
        await pg.evaluate("()=>{ if(typeof closeSheet==='function'){sheet=null; document.getElementById('sheet')&&document.getElementById('sheet').classList.remove('open');} document.querySelectorAll('.upd,#pkpay,.veil,#veil,.dim').forEach(e=>e.remove()); }"); await pg.add_style_tag(content='#sheet,#scrim,.scrim{display:none!important}'); await pg.wait_for_timeout(500); await pg.screenshot(path='/tmp/pad_race.png')
        r=await pg.evaluate("""()=>{ const h=document.getElementById('pHnd'); if(!h) return 'nohnd'; h.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); const a=RC.inp.hand; h.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); return [a,RC.inp.hand,['pNit','pBrk','pGas'].map(i=>!!document.getElementById(i)), document.querySelector('.pad49').getBoundingClientRect().height, document.getElementById('pGas').getBoundingClientRect().height] }""")
        print('race',r)
        await pg.evaluate("""()=>{ ACT.close(); const ev=EVENTS.find(e=>e.manches.some(m=>m.sp)); const mn=ev.manches.find(m=>m.sp); const stg=SPA_STAGES.find(s=>s.id===mn.sp); R={ev,opps:makeOpps(ev),pick:[S.cars[0].uid],rows:[],auto:false,result:null}; RC={kind:'spa',i:ev.manches.indexOf(mn),mn,stage:stg,len:stg.b-stg.a,auto:false,clock:-3.4,inp:{t:0,k:0,b:false,kb:false,st:0,sk:0,hand:false},done:false}; view='race'; render(); }""")
        await pg.wait_for_timeout(500); await pg.screenshot(path='/tmp/pad_spa.png')
        print('spa',await pg.evaluate("()=>[!!document.getElementById('pHnd'),document.querySelector('.pad49')&&document.querySelector('.pad49').getBoundingClientRect().height]"))
        print(errs); await b.close()
asyncio.run(main())
