import asyncio,json
from playwright.async_api import async_playwright
STUB=open('t_pt2.py').read().split('STUB="""')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':780})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300])); pg.on('console',lambda m: errs.append('C:'+m.text[:200]) if m.type=='error' and 'ERR_FAILED' not in m.text else None)
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.add_init_script(STUB)
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(2500)
        r=await pg.evaluate("""async()=>{ glAttach=()=>{}; const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={};
          S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.seenVer='1.1'; S.lvl=12; S.cr=900000; S.tok=60; S.tx={garage:1,epreuves:1,cartes:1,marche:1,base:1,missions:1,atelier:1,equipe:1}; S.cars=[]; S.mods=[];
          /* age gate au 1er lancement */
          S.age18=undefined; await w(2800); o.ageSheet=sheet&&sheet.t+':'+sheet.st; try{ closeSheet(); }catch(e){} o.stillOpen=!!sheet;
          ACT.age1no(); await w(100); o.minor=S.age18; o.sheetAfter=!!sheet;
          /* mineur : missions */
          ACT.tab({id:'missions'}); await w(300); o.minorMiss=[...document.querySelectorAll('#view .sec h3')].map(h=>h.textContent).join('|'); o.minorHead=(document.querySelector('#view .head p')||{}).textContent;
          o.lines=LINES[0][2].join(',');
          S.age18=true; S.charte=1; render(); await w(200); o.lines2=LINES[0][2].join(',');
          S.farm=S.farm||{}; ACT.tab({id:'missions'}); await w(300); o.adultMiss=[...document.querySelectorAll('#view .sec h3')].map(h=>h.textContent).join('|'); o.adultHead=(document.querySelector('#view .head p')||{}).textContent;
          /* paquets */
          ACT.tab({id:'cartes'}); await w(300); cTab='packs'; render(); await w(500);
          o.nPacks=PACKS.length; o.ids=PACKS.map(p=>p.id).join(','); o.chips=[...document.querySelectorAll('#pkcat button')].map(b=>b.textContent).join('|');
          o.info0=(document.getElementById('pkInfo')||{}).innerText;
          ACT.pkcat({id:PACKS.findIndex(p=>p.id==='pcar')}); await w(600); o.infoCar=(document.getElementById('pkInfo')||{}).innerText.replace(/\\n+/g,' / '); o.chipOn=[...document.querySelectorAll('#pkcat button.on')].map(b=>b.textContent).join();
          o.carBtns=[...document.querySelectorAll('#pkInfo .buy button')].map(b=>b.textContent+(b.disabled?'(off)':'')).join('|');
          ACT.pkq({id:5}); await w(300); o.carBtns5=[...document.querySelectorAll('#pkInfo .buy button')].map(b=>b.textContent).join('|'); o.qrow=[...document.querySelectorAll('#pkInfo .pkq button')].map(b=>b.textContent+(b.classList.contains('on')?'*':'')).join(' ');
          const c0=S.cars.length, cr0=S.cr; ACT.pack({id:'pcar',k:'cr',q:5}); await w(300); o.carsGot=S.cars.length-c0; o.paid=cr0-S.cr; o.sheetT=sheet&&sheet.t; o.back=document.querySelector('#sheet .cpback')?1:0;
          ACT.cpreveal(); await w(200); o.revCards=document.querySelectorAll('#sheet .grid>*').length; o.bestShown=(document.querySelector('#sheet .cw-n')||{}).textContent; closeSheet();
          /* x1 voiture via openPack (apres dechirure) */
          const cr1=S.cr, c1=S.cars.length; openPack('pcar','cr'); await w(200); o.one=[S.cars.length-c1,cr1-S.cr]; closeSheet();
          /* paquet aleatoire x10 */
          ACT.pkcat({id:0}); await w(400); ACT.pkq({id:10}); await w(300); const m0=S.mods.length, cr2=S.cr, st0=S.stats.packs||0; o.p1btn=[...document.querySelectorAll('#pkInfo .buy button')].map(b=>b.textContent).join('|');
          ACT.pack({id:'p1',k:'cr',q:10}); await w(400); o.p1=[S.mods.length-m0,cr2-S.cr,(S.stats.packs||0)-st0,sheet&&sheet.t,sheet&&sheet.i,sheet&&sheet.cards&&sheet.cards.length,(document.querySelector('#sheet h2')||{}).textContent]; closeSheet();
          /* cible x5 jetons */
          ACT.pkcat({id:PACKS.findIndex(p=>p.id==='f1')}); await w(400); ACT.pkq({id:5}); await w(300); const t0=S.tok, m1=S.mods.length; o.f1btn=[...document.querySelectorAll('#pkInfo .buy button')].map(b=>b.textContent.replace(/\\s+/g,' ')).join('|');
          ACT.pack({id:'f1',k:'tok',q:5}); await w(400); o.f1=[S.mods.length-m1,t0-S.tok]; const slots=new Set(S.mods.slice(m1).map(m=>MODI[m.t][1])); o.f1slots=[...slots].join(','); closeSheet();
          /* inventaire plein */
          return JSON.stringify(o); }""")
        o=json.loads(r)
        for k,v in o.items(): print(k,':',v)
        print([e for e in errs if 'insertBefore' not in e])
        await pg.screenshot(path='/tmp/s_v12a.png')
        await b.close()
asyncio.run(main())
