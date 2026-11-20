# Flipper : combien de fois le bot (qui joue parfaitement) prend chaque rampe, par table et par bille ; vérifie aussi que la sortie de rampe tombe dans le garage.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_rampes.py ["0,1,2"]
import asyncio, sys, os, json
from playwright.async_api import async_playwright
TI = sys.argv[1] if len(sys.argv) > 1 else '0,1,2,3,4,5,6,7,8'
JS = r"""async (ti)=>{ try{ arcQuit(); }catch(e){} S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.cr=900000; S.lvl=30; view='garage'; render(); arcOpen('pin'); ACT.arcstart(); await new Promise(r=>setTimeout(r,150));
  const P=__pin; P.loadTable(ti); P.setScore(0); const st={n:P.TBL[ti].n,ramps:{},drains:0,garage:0,posts:P.posts?P.posts.length:null,rolls:0,maxBalls:1}; let rollsOn=0; const W={l:0,r:0}; let b0n=P.ball, prevSt=null, steps=0;
  for(let i=0;i<60*150&&!P.over;i++){ const bs=P.balls; for(const b of bs){ if(b.st==='plunger'){ P.launch(); } }
    W.l=Math.max(0,W.l-1); W.r=Math.max(0,W.r-1); for(const b of bs){ if(b.st!=='play') continue; if(b.y>495&&b.y<575&&b.vy>0){ if(b.x<175&&b.x>90&&!W.l&&!W.lh){ W.lw=Math.floor(Math.random()*8); W.lh=1; } if(b.x>=175&&b.x<250&&!W.r&&!W.rh){ W.rw=Math.floor(Math.random()*8); W.rh=1; } } }
    if(W.lh) W.lc=(W.lc||0)+1; if(W.rh) W.rc=(W.rc||0)+1; const L=W.lh&&W.lc>W.lw&&W.lc<W.lw+14, R=W.rh&&W.rc>W.rw&&W.rc<W.rw+14; if(W.lh&&W.lc>=W.lw+14){ W.lh=0; W.lc=0; W.l=30; } if(W.rh&&W.rc>=W.rw+14){ W.rh=0; W.rc=0; W.r=30; }
    P.flip(0,!!L); P.flip(1,!!R); st.maxBalls=Math.max(st.maxBalls,P.balls.length); { const ro=P.part.on&&P.part.rolls; if(ro&&!rollsOn) st.rolls++; rollsOn=ro?1:0; if(ro&&Math.random()<.02){ P.part.hp=Math.max(1,P.part.hp); } } const n0=P.ball; const rn=P.ramps.map(r=>r.n); P.sim(1/60); steps++; if(P.ball!==n0) st.drains++;
    P.ramps.forEach((r,k)=>{ if(r.n>rn[k]){ const b=P.balls.find(q=>q.st==='hold'); st.garage+=b?1:0; } }); }
  P.ramps.forEach(r=>st.ramps[r.nm]=r.n); st.total=Object.values(st.ramps).reduce((a,b)=>a+b,0); st.sec=Math.round(steps/60); st.perBall=+(st.total/Math.max(1,st.drains+1)).toFixed(2); st.over=P.over; st.mFix=P.mFix; st.caps=P.caps.length; st.score=P.score; return st; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 412, 'height': 860}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append('console: '+m.text[:300]) if m.type=='error' else None)
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        tot = 0
        for ti in [int(x) for x in TI.split(',')]:
            await pg.goto('file://' + os.path.abspath('out.html')); await pg.wait_for_timeout(800)
            r = await pg.evaluate(JS, ti); tot += r['total']
            print(f"{r['n']:<13} rampes {r['ramps']}  par bille : {r['perBall']}  (billes perdues {r['drains']}, tombées dans le garage {r['garage']}/{r['total']}, clous {r['posts']}, {r['sec']} s) · billes max {r['maxBalls']} · mult fixé ×{r['mFix']} · Rolls {r['rolls']} · captures {r['caps']} · score {r['score']}")
        print('erreurs :', [e for e in errs if 'insertBefore' not in e] or 'aucune'); await b.close()
asyncio.run(main())
