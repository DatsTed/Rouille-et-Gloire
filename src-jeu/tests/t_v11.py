import asyncio
from playwright.async_api import async_playwright
STUB=open('t_pt2.py').read().split('STUB="""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':780})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300])); pg.on('console',lambda m: errs.append('C:'+m.text[:200]) if m.type=='error' and 'ERR_FAILED' not in m.text else None)
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.add_init_script(STUB)
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(2500)
        print(await pg.evaluate("""async()=>{ glAttach=()=>{}; S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.seenVer='1.1'; S.lvl=12; S.charte=1; S.age18=true; S.cr=900000; S.tx={garage:1,epreuves:1,cartes:1,marche:1,base:1,missions:1,atelier:1,equipe:1}; document.querySelectorAll('.splash').forEach(e=>e.remove()); const o={}; const w=ms=>new Promise(r=>setTimeout(r,ms));
          S.cars=[]; CARS.filter(c=>c.t>=2).slice(0,4).forEach((c,k)=>S.cars.push({uid:9000+k,mid:c.id,etat:100,lvl:1,up:{}}));
          const nav=()=>[...document.querySelectorAll('#nav button')].map(b=>b.textContent.trim()+(b.getAttribute('aria-current')?'*':'')).join('|'); const sw=()=>[...document.querySelectorAll('#view .topsw button')].map(b=>b.textContent.trim()+(b.getAttribute('aria-current')?'*':'')).join('|');
          o.nav0=nav();
          for(const v of ['atelier','equipe','base','marche','cartes']){ ACT.tab({id:v}); await w(250); o['v_'+v]=[nav().split('|').filter(x=>x.endsWith('*')).join(''),sw()]; }
          /* épreuves tri */
          ACT.tab({id:'epreuves'}); await w(250); o.ep=[...document.querySelectorAll('#view .row')].map(r=>r.querySelector('.ttl').textContent).slice(0,14).join(' / ');
          /* labo */
          const F=farm(); F.found=1; F.tutoSeen=1; F.can=6; F.water=F.tank; F.rooms.atelier.on=1; F.rep=50; F.stats=F.stats||{}; F.stats.harv=3;
          S.bat.labo=S.bat.labo||1; try{ F.lamps[LAMP[0].id]=6; }catch(e){}
          ACT.tab({id:'atelier'}); await w(200); ACT.labopen(); await w(500);
          o.labpage=document.body.classList.contains('labpage'); o.labsw=[...document.querySelectorAll('#sheet .topsw button')].map(b=>b.textContent.trim()).join('|'); o.tools=[...document.querySelectorAll('#sheet .labtools button')].map(b=>b.textContent.trim()).join('|');
          const sh=document.getElementById('sheet').getBoundingClientRect(), nv=document.getElementById('nav').getBoundingClientRect(); o.geo=[Math.round(sh.top),Math.round(sh.bottom),Math.round(nv.top)]; o.navHl=nav().split('|').filter(x=>x.endsWith('*')).join('');
          /* tout planter */
          const sid=Object.keys(SID).filter(k=>SID[k].rep<=0).slice(0,2); F.seeds[sid[0]]=3; F.seeds[sid[1]]=1; const em0=F.rooms.atelier.slots.filter(s=>!s).length; 
          o.em0=em0; RY.tab='atelier'; RY.slot=null; renderSheet(); await w(100);
          ACT.rplantopen(); await w(200); o.slot=RY.slot; RY.pick={sid:sid[0],med:Object.keys(MED)[0],lamp:LAMP[0].id}; renderSheet(); await w(100);
          o.allBtn=(document.querySelector('[data-a="rplantall"]')||{}).textContent; ACT.rplantall(); await w(200);
          o.planted=F.rooms.atelier.slots.filter(s=>s).length; o.seedsLeft=F.seeds[sid[0]]; o.slotBack=RY.slot;
          /* croisement */
          const c0=canCross47(); o.cross0=c0; ACT.crossopen(); await w(300); o.crhow=!!document.querySelector('#sheet .crhow'); o.crhowText=(document.querySelector('#sheet .crhow')||{}).textContent?.slice(0,90);
          o.goal=goalNext(); 
          ACT.tab({id:'garage'}); await w(300); o.closed=[!!sheet, document.body.classList.contains('labpage')];
          return o; }"""))
        print(errs[:5])
asyncio.run(main())
