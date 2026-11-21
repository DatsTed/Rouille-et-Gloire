# v2.16 : le modèle 3D original de la Marova Steppe (tools_mkmarova.py) se charge dans le jeu, passe par buildCar (peinture, jantes,
# châssis, nitro) et s'affiche au garage. Rendu WebGL réel (SwiftShader). Captures : %TEMP%/marova_garage.png, %TEMP%/marova_looks.png
# Usage (depuis src-jeu/) : python -X utf8 tests/t_marova.py
import asyncio, os
from playwright.async_api import async_playwright
OUT = os.environ.get('TEMP', '.')
SETUP = r"""async ()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)), E=[], o={};
  S=fresh(); Object.assign(S,{intro:true,tuto:true,tutoDone:true,charte:1,age18:true,lvl:30,cr:900000,niveau10CinematicSeen:true,seenVer:GAME_VER});
  S.tx={}; ['garage','epreuves','cartes','marche','base','missions','atelier','equipe','arena','hub','view','labo','ranch'].forEach(k=>S.tx[k]=1);
  S.cars=[{uid:S.nuid++,mid:'steppe',etat:100,xp:0,lvl:12,up:{},inv:0,mods:{},sh:0}]; try{ if(S.pod&&S.pod.slots){ S.pod.slots[0]=S.cars[0].uid; } }catch(e){} try{ save(); }catch(e){}
  document.querySelectorAll('[id*=splash],.splash,#upd').forEach(e=>e.remove()); view='garage'; render();
  await ensureModels(); await w(300);
  o.glb=M.steppe.glb; o.charge=!!MODELS.marova; o.tiguan=!!document.getElementById('mdl-tiguan');
  if(o.glb!=='marova') E.push('la Steppe n’utilise pas le modèle marova'); if(!o.charge) E.push('modèle non chargé'); if(o.tiguan) E.push('Tiguan encore présent');
  if(MODELS.marova){ const me=MODELS.marova.meta; o.dims=[me.len,me.w,me.h,me.wr]; o.roues=MODELS.marova.root.children.filter(c=>c.name==='wheel').length; if(o.roues!==4) E.push('roues : '+o.roues); }
  try{ if(sheet) closeSheet(); }catch(e){} view='garage'; render(); return {E,o}; }"""
LOOKS = r"""async ()=>{ const E=[];
  const looks=[null,{peinture:{r:3,t:'pe1'}},{peinture:{r:4,t:'pe3'},jantes:{t:'ja3',r:4},chassis:{t:'ch1',r:3}},{peinture:{r:2,t:'pe2'},susp:{t:'su3',r:2},nitro:{r:4},chassis:{t:'ch3',r:3}}];
  const cv=document.createElement('canvas'); cv.width=1600; cv.height=900; cv.id='mvtest'; cv.style.cssText='position:fixed;inset:0;z-index:99999;width:800px;height:450px';
  document.body.appendChild(cv); const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true}); R.setSize(1600,900,false); R.setScissorTest(true);
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x0b0d22); sc.add(new THREE.HemisphereLight(0xcfe0ff,0x2a2030,.8)); const d=new THREE.DirectionalLight(0xffffff,.8); d.position.set(4,7,5); sc.add(d);
  const cols=['#B89A5E','#C8102E','#1E6BFF','#24C48E'];
  looks.forEach((lk,i)=>{ try{ const c=buildCar(M.steppe,cols[i],lk); c.g.position.set(0,0,(i-1.5)*4.2); sc.add(c.g); if(!c.wheels||c.wheels.length!==4) E.push('look '+i+' : roues '+(c.wheels||[]).length); c.brake(i%2===1); }catch(e){ E.push('look '+i+' : '+e.message); } });
  const cam=new THREE.PerspectiveCamera(30,16/9,.1,200); cam.position.set(15,7,15); cam.lookAt(0,.6,0);
  const cam2=new THREE.PerspectiveCamera(30,16/9,.1,200); cam2.position.set(-15,6,-12); cam2.lookAt(0,.6,0);
  let n=0; await new Promise(res=>{ const f=()=>{ R.setViewport(0,450,1600,450); R.setScissor(0,450,1600,450); cam.aspect=1600/450; cam.updateProjectionMatrix(); R.render(sc,cam);
    R.setViewport(0,0,1600,450); R.setScissor(0,0,1600,450); cam2.aspect=1600/450; cam2.updateProjectionMatrix(); R.render(sc,cam2); if(++n>30) res(); else requestAnimationFrame(f); }; f(); });
  return E; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') and 'cdnjs' not in r.request.url else r.continue_())
        await pg.goto('file:///' + os.path.abspath('out.html').replace(chr(92), '/')); await pg.wait_for_timeout(2500)
        r = await pg.evaluate(SETUP); await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{ try{ while(sheet) closeSheet(); }catch(e){} document.querySelectorAll('#upd,#cine').forEach(e=>e.remove()); view='garage'; render(); }"); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'marova_garage.png'))
        await pg.set_viewport_size({'width': 800, 'height': 450})
        e2 = await pg.evaluate(LOOKS); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, 'marova_looks.png'), clip={'x': 0, 'y': 0, 'width': 800, 'height': 450})
        print('infos :', r['o']); pb = r['E'] + e2
        print('PROBLÈMES :', pb or 'aucun', '| erreurs de page :', errs or 'aucune'); await b.close()
asyncio.run(main())
