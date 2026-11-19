# Flipper : carte de passage de la bille (bot parfait) par cases de 20×20, pour placer rampes, trous et clous là où la bille passe vraiment.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_chaleur.py ["0,1,2"]
import asyncio, sys, os
from playwright.async_api import async_playwright
TI = sys.argv[1] if len(sys.argv) > 1 else '0,1,2,3,4,5,6,7'
JS = r"""async (ti)=>{ try{ arcQuit(); }catch(e){} S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.cr=900000; S.lvl=30; view='garage'; render(); arcOpen('pin'); ACT.arcstart(); await new Promise(r=>setTimeout(r,150));
  if(!window.__pin) return {}; const P=__pin; P.loadTable(ti); const H={}; const W={l:0,r:0};
  for(let g=0;g<4&&!P.over;g++){ for(let i=0;i<60*120&&!P.over;i++){ const bs=P.balls; for(const b of bs){ if(b.st==='plunger') P.launch(); }
    W.l=Math.max(0,W.l-1); W.r=Math.max(0,W.r-1); for(const b of bs){ if(b.st!=='play') continue; if(b.y>495&&b.y<575&&b.vy>0){ if(b.x<175&&b.x>90&&!W.l&&!W.lh){ W.lw=Math.floor(Math.random()*8); W.lh=1; } if(b.x>=175&&b.x<250&&!W.r&&!W.rh){ W.rw=Math.floor(Math.random()*8); W.rh=1; } } }
    if(W.lh) W.lc=(W.lc||0)+1; if(W.rh) W.rc=(W.rc||0)+1; const L=W.lh&&W.lc>W.lw&&W.lc<W.lw+14, R=W.rh&&W.rc>W.rw&&W.rc<W.rw+14; if(W.lh&&W.lc>=W.lw+14){ W.lh=0; W.lc=0; W.l=30; } if(W.rh&&W.rc>=W.rw+14){ W.rh=0; W.rc=0; W.r=30; }
    P.flip(0,!!L); P.flip(1,!!R); P.sim(1/60); for(const b of P.balls){ if(b.st==='play'&&b.x<318){ const k=Math.floor(b.x/20)+','+Math.floor(b.y/20); H[k]=(H[k]||0)+1; } } } }
  return H; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 412, 'height': 860})
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://' + os.path.abspath('out.html')); await pg.wait_for_timeout(1000)
        tot = {}
        for ti in [int(x) for x in TI.split(',')]:
            H = await pg.evaluate(JS, ti)
            for k, v in H.items(): tot[k] = tot.get(k, 0) + v
        mx = max(tot.values()) or 1
        print('passage de la bille (x 0→360 en colonnes de 20, y 0→600 en lignes de 20) ; chiffre = 0-9 relatif au max')
        print('      ' + ''.join(f'{x//1:>2}' if x % 5 == 0 else '  ' for x in range(0, 18)))
        for gy in range(0, 30):
            print(f'y={gy*20:>3} ' + ' '.join(str(min(9, int(9 * (tot.get(f"{gx},{gy}", 0) / mx) ** .5))) for gx in range(0, 16)))
        await b.close()
asyncio.run(main())
