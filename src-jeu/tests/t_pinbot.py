import asyncio,sys,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':412,'height':860})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(1000)
        await pg.evaluate("""()=>{ S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.age18=true; S.charte=1; S.cr=900000; S.lvl=20; view='garage'; render(); }""")
        await pg.evaluate("arcOpen('pin'); ACT.arcstart()"); await pg.wait_for_timeout(500)
        TI=sys.argv[1]
        res=await pg.evaluate("""()=>{ const P=__pin, out=[]; for(const ti of ["""+TI+"""]){
            P.loadTable(ti); P.setScore(0);
            const st={t:ti,n:P.TBL[ti].n,steps:0,stuck:0,maxStuck:0,drains:0,ramps:{},drops:0,minSp:1e9};
            let still=0; const W={l:0,r:0};
            for(let i=0;i<60*90&&!P.over;i++){ const bs=P.balls; for(const b of bs){ if(b.st==='plunger'){ P.launch(); } }
              // bot flippers
              W.l=Math.max(0,W.l-1); W.r=Math.max(0,W.r-1); for(const b of bs){ if(b.st!=='play') continue; if(b.y>495&&b.y<575&&b.vy>0){ if(b.x<175&&b.x>90&&!W.l&&!W.lh) { W.lw=Math.floor(Math.random()*8); W.lh=1; } if(b.x>=175&&b.x<250&&!W.r&&!W.rh){ W.rw=Math.floor(Math.random()*8); W.rh=1; } } }
              if(W.lh){ W.lc=(W.lc||0)+1; } if(W.rh){ W.rc=(W.rc||0)+1; }
              const L=W.lh&&W.lc>W.lw&&W.lc<W.lw+14, R=W.rh&&W.rc>W.rw&&W.rc<W.rw+14; if(W.lh&&W.lc>=W.lw+14){ W.lh=0; W.lc=0; W.l=30; } if(W.rh&&W.rc>=W.rw+14){ W.rh=0; W.rc=0; W.r=30; }
              P.flip(0,!!L); P.flip(1,!!R);
              const n0=P.ball; P.sim(1/60); st.steps++;
              const b0=P.balls[0]; if(b0&&b0.st==='play'){ const sp=Math.hypot(b0.vx,b0.vy); if(sp<20&&b0.y<540){ still++; st.maxStuck=Math.max(st.maxStuck,still); } else still=0; } else still=0;
              if(P.ball!==n0) st.drains++;
              if(P.mode==='chasse'&&Math.random()<.2) {} }
            P.ramps.forEach(r=>st.ramps[r.nm]=r.n); st.drops=P.dbanks.map(B=>B.ss.filter(q=>q.off).length).join(','); st.score=P.score; st.over=P.over; st.rampMax=P.rampMax; st.sec=Math.round(st.steps/60);
            out.push(st); if(P.over){ /* restart nouvelle partie */ ACT.arcquit&&0; }
        } return JSON.stringify(out); }""")
        print(res); print([e for e in errs if 'insertBefore' not in e])
        await b.close()
asyncio.run(main())
