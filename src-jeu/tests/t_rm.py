import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':412,'height':860})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(1500)
        r=await pg.evaluate("""()=>{ S=fresh(); const out={};
          for(const ev of EVENTS){ for(const mn of ev.manches){ const k=(mn.d)+'|'+(mn.sp?'sp':'-'); if(out[k]) continue; try{ R={ev,opps:makeOpps(ev),pick:[S.cars[0].uid],rows:[],auto:false,result:null}; const tk=trackFor(ev,mn); RC={kind:(mn.sp?'spa':'race'),i:0,mn,tk,auto:false,clock:0,inp:{},P:{},Os:[],stage:SPA_STAGES.find(s=>s.id===mn.sp)}; const h=vRace(); out[k]=[h.includes('id="rmap"'),h.includes('id="mini"'),h.includes('pad49')]; }catch(e){ out[k]='ERR '+e.message; } } } return out; }""")
        for k,v in r.items(): print(k,v)
        print(errs); await b.close()
asyncio.run(main())
