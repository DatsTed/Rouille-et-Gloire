# v2.5 : courses sur un seul écran (sans barre du bas, mini-carte dans le vide), Région Néon avec l'interface des épreuves,
# spawn dos au garage, jauge GAZ, caméras, remise sur la route, grande carte zoomable.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_ui25.py [fichier.html]
import asyncio, os, sys
from playwright.async_api import async_playwright
HTML = sys.argv[1] if len(sys.argv) > 1 else 'out.html'
JS_RACE = r"""async (kind)=>{ const E=[], wait=ms=>new Promise(r=>setTimeout(r,ms)); S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.age18=true; save();
  const ok=e=>e.manches.some(m=>kind==='spa'?m.sp:(!m.sp&&m.d!=='drag'&&m.d!=='circuit'&&!DISC[m.d].calme)), ev=EVENTS.find(ok), i=ev.manches.findIndex(m=>kind==='spa'?m.sp:(!m.sp&&m.d!=='drag'&&m.d!=='circuit'&&!DISC[m.d].calme));
  R={ev,opps:makeOpps(ev),pick:ev.manches.map((_,k)=>S.cars[k%S.cars.length].uid),rows:[],auto:false,result:null}; view='race'; startManche(i); await wait(2500);
  if(!RC||RC.kind!==kind) E.push('course non lancée '+(RC&&RC.kind));
  const nav=getComputedStyle($('nav')).display; if(nav!=='none') E.push('barre du bas visible : '+nav);
  const m=document.querySelector('main'); if(m.scrollHeight>m.clientHeight+1) E.push('l’écran défile : '+m.scrollHeight+' > '+m.clientHeight);
  const sl=document.querySelector('.mslot,#rmap'), r=sl&&sl.getBoundingClientRect(); if(!r||r.height<70||r.width<200) E.push('mini-carte absente ou trop petite '+(r&&[r.width,r.height]));
  const pad=document.querySelector('.padS,.pad3').getBoundingClientRect(); if(r&&r.top<pad.bottom) E.push('la carte chevauche le pavé');
  if(r&&r.bottom>innerHeight+1) E.push('la carte dépasse de l’écran '+r.bottom+' > '+innerHeight);
  if(document.querySelector('.hud #mini,.hud .rmap')) E.push('mini-carte encore dans le HUD');
  return {E,map:r&&[Math.round(r.width),Math.round(r.height)]}; }"""
JS_WORLD = r"""async ()=>{ const E=[], wait=ms=>new Promise(r=>setTimeout(r,ms));
  S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.age18=true; S.lvl=20; S.niveau10CinematicSeen=true; S.lvUnified=1;
  ['touge','piccola'].forEach(mid=>S.cars.push({uid:S.nuid++,mid,etat:100,xp:0,lvl:12,up:{},inv:0,mods:{},sh:1})); S.cbTeam=S.cars.slice(-2).map(c=>c.uid); save();
  await wOpen(); await wait(800); for(let i=0;i<4&&sheet;i++) closeSheet();
  /* spawn : dos au garage, face aux arches */
  W_TOWNS.forEach(T=>{ wSpawn(T.k); const n=[Math.cos(T.ga),Math.sin(T.ga)], f=[Math.cos(W.p.h),Math.sin(W.p.h)]; if(f[0]*n[0]+f[1]*n[1]>-.99) E.push('spawn pas dos au garage : '+T.nm); if(wTownAt(W.p.x,W.p.z)!==T.k) E.push('spawn hors de la ville '+T.nm); });
  wSpawn(0); { const n=[Math.cos(W_TOWNS[0].ga),Math.sin(W_TOWNS[0].ga)]; if(Math.abs(n[1]-1)>.01) E.push('Rouille-Ville : garage attendu au sud'); }
  /* interface comme les épreuves */
  ['bAud','bCam','bResp','bQuit','wGas','wBrk','wHnd','wNit','wSteer','wMap'].forEach(id=>{ if(!$(id)) E.push('bouton absent : '+id); });
  const m=$('wMap').getBoundingClientRect(); if(m.height<70||m.width<200) E.push('carte du bas trop petite '+[m.width,m.height]);
  const pad=document.querySelector('#wov .padS').getBoundingClientRect(); if(m.top<pad.bottom) E.push('carte sur le pavé'); if(m.bottom>innerHeight+1) E.push('carte hors écran');
  if(getComputedStyle($('nav')).visibility!=='hidden'&&getComputedStyle($('nav')).display!=='none') E.push('barre du bas visible dans la Région');
  /* jauge GAZ */
  W.in.gas=1; await wait(1200); const gv=parseInt($('wGasP').style.height||'0'); W.in.gas=0; if(gv<40) E.push('jauge GAZ ne se remplit pas : '+gv); await wait(1500); const g2=parseInt($('wGasP').style.height||'0'); if(g2>=gv&&gv>0) E.push('jauge GAZ ne redescend pas '+g2);
  /* caméras */
  S.camv=0; ACT.wcam(); await wait(300); if(S.camv!==1||!W.car.g.visible) E.push('caméra 1'); ACT.wcam(); await wait(300); if(S.camv!==2||W.car.g.visible) E.push('cockpit : la voiture doit être cachée'); ACT.wcam(); await wait(300); if(S.camv!==0||!W.car.g.visible) E.push('caméra 0');
  /* remettre sur la route */
  { const R0=W.routes[0], pp=R0.P[R0.iA+20]; W.grace=99; W.p.x=pp.x+pp.nx*4; W.p.z=pp.z+pp.nz*4; W.p.h=Math.atan2(pp.tz,pp.tx)+.8; W.p.y=pp.y||0; W.p.v=15; ACT.wresp(); const q=wNear(W.p.x,W.p.z,W.p.y||0); if(Math.abs(q.lat)>.2||W.p.v!==0) E.push('remise sur la route : lat '+q.lat); }
  /* grande carte : zoom, déplacement, fermeture */
  wBigOpen(); await wait(300); const z0=W.bv.z; $('wbP').click(); $('wbP').click(); if(!(W.bv.z>z0*2)) E.push('zoom + sans effet'); const cv=$('wbC'), b=cv.getBoundingClientRect(), c0=[W.bv.cx,W.bv.cz];
  const ev=(t,x,y)=>cv.dispatchEvent(new PointerEvent(t,{pointerId:3,clientX:b.left+x,clientY:b.top+y,bubbles:true,buttons:1})); ev('pointerdown',200,300); ev('pointermove',120,240); ev('pointerup',120,240); if(Math.hypot(W.bv.cx-c0[0],W.bv.cz-c0[1])<1) E.push('déplacement de la carte sans effet');
  const z1=W.bv.z; cv.dispatchEvent(new WheelEvent('wheel',{deltaY:-120,clientX:b.left+100,clientY:b.top+100,bubbles:true,cancelable:true})); if(!(W.bv.z>z1)) E.push('molette sans effet'); $('wbM').click(); $('wbM').click(); $('wbM').click(); $('wbM').click(); if(W.bv.z>1.01) E.push('zoom − sans effet '+W.bv.z); $('wbMe').click(); if(Math.hypot(W.bv.cx-W.p.x,W.bv.cz-W.p.z)>30) E.push('bouton Moi'); $('wbR').click(); if(W.bv!==null&&W.bv.z!==1) E.push('Tout voir');
  wBigClose(); if($('wBig')) E.push('grande carte non fermée');
  ACT.wquit(); await wait(300); if(W.on||$('wov')) E.push('sortie');
  return {E}; }"""
async def run(pg, js, *a):
    return await pg.evaluate(js, *a) if a else await pg.evaluate(js)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']); bad = 0
        for (w, h) in [(390, 844), (360, 640)]:
            pg = await b.new_page(viewport={'width': w, 'height': h}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
            await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') and 'cdnjs' not in r.request.url else r.continue_())
            await pg.goto('file:///' + os.path.abspath(HTML).replace('\\', '/')); await pg.wait_for_timeout(2500)
            if not await pg.evaluate("()=>!!window.THREE"): print('THREE absent (réseau) : test impossible'); await b.close(); return
            for kind in ('spa', 'race'):
                r = await pg.evaluate(JS_RACE, kind); e = r['E']; bad += len(e); print(f'{w}x{h} course {kind} : carte {r["map"]}', 'OK' if not e else e)
                await pg.evaluate("()=>{ try{ leaveRace(); }catch(e){} view='garage'; render(); }")
            r = await pg.evaluate(JS_WORLD); e = r['E'] + [x for x in errs if 'insertBefore' not in x and 'offres' not in x]; bad += len(e); print(f'{w}x{h} Région :', 'OK' if not e else e)
            await pg.close()
        await b.close(); print('RÉSULTAT :', 'OK' if not bad else f'{bad} erreur(s)')
asyncio.run(main())
