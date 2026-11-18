import asyncio,sys,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':412,'height':860})
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(1000)
        await pg.evaluate("""()=>{ S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.age18=true; S.charte=1; S.cr=900000; S.lvl=20; view='garage'; render(); }""")
        await pg.evaluate("arcOpen('pin'); ACT.arcstart()"); await pg.wait_for_timeout(500)
        ti=int(sys.argv[1])
        res=await pg.evaluate("""(ti)=>{ const P=__pin, out=[]; const T=P.TBL[ti];
          const far=(x,y)=>{ const pts=[]; (T.bumps||[]).forEach(a=>pts.push([a[0],a[1],a[2]||17])); (T.tgt||[]).forEach(a=>pts.push([a[0],a[1],8])); (T.spins||[]).forEach(a=>pts.push([a[0],a[1],15])); (T.boosts||[]).forEach(a=>pts.push([a[0],a[1],15])); (T.portals||[]).forEach(a=>pts.push([a[0],a[1],13])); (T.wells||[]).forEach(a=>pts.push([a[0],a[1],20])); (T.mills||[]).forEach(a=>pts.push([a[0],a[1],38])); pts.push([T.hole[0],T.hole[1],15]); (T.ramps||[]).forEach(r=>pts.push([r.c[0][0],r.c[0][1],14])); return pts.every(q=>Math.hypot(x-q[0],y-q[1])>q[2]+30); };
          for(const x of [60,100,140,200,250,280]) for(const y of [190,240,290,340]){ if(!far(x,y)) continue; T.sauc=[x,y]; P.loadTable(ti); let hold=0,N=18;
            for(let k=0;k<N;k++){ const pw=.35+.65*((k*7)%N)/(N-1); const b=P.balls[0]; b.x=333; b.y=572; b.vx=b.vy=0; b.st='plunger'; b.la=false; b.trail=[]; P.door.off=true; P.launchP(pw); let ev=null; const W={l:0,r:0};
              for(let i=0;i<60*30&&!ev;i++){ const bb=P.balls[0]; if(!bb) break;
                W.l=Math.max(0,W.l-1); W.r=Math.max(0,W.r-1); if(bb.st==='play'&&bb.y>495&&bb.y<575&&bb.vy>0){ if(bb.x<175&&bb.x>90&&!W.l&&!W.lh){ W.lw=Math.floor(Math.random()*8); W.lh=1; } if(bb.x>=175&&bb.x<250&&!W.r&&!W.rh){ W.rw=Math.floor(Math.random()*8); W.rh=1; } }
                if(W.lh) W.lc=(W.lc||0)+1; if(W.rh) W.rc=(W.rc||0)+1; const L=W.lh&&W.lc>W.lw&&W.lc<W.lw+14, R=W.rh&&W.rc>W.rw&&W.rc<W.rw+14; if(W.lh&&W.lc>=W.lw+14){ W.lh=0; W.lc=0; W.l=30; } if(W.rh&&W.rc>=W.rw+14){ W.rh=0; W.rc=0; W.r=30; } P.flip(0,!!L); P.flip(1,!!R);
                P.sim(1/60); const b2=P.balls[0]; if(!b2) break; if(b2.st==='hold') ev='hold'; else if(b2.st==='ramp') ev='ramp'; else if(b2.y>560&&b2.vy>0&&b2.x>110&&b2.x<250&&b2.st==='play') ev='drain'; }
              if(ev==='hold') hold++; P.flip(0,false); P.flip(1,false); for(const r of P.ramps) r.cd=0; if(P.balls[0]) P.balls[0].st='play'; }
            out.push([x,y,hold]); } return JSON.stringify(out.sort((a,b)=>a[2]-b[2]).slice(0,6)); }""",ti)
        print(ti,res); await b.close()
asyncio.run(main())
