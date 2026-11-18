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
        tis=sys.argv[1] if len(sys.argv)>1 else '0,1,2,3,4,5,6,7'
        res=await pg.evaluate("""(tis)=>{ const P=__pin, out=[]; for(const ti of tis.split(',').map(Number)){ P.loadTable(ti); const st={n:P.TBL[ti].n,hold:0,ramp:0,drain:0,N:0,holdTime:0,rampN:0,t:0};
            for(let k=0;k<40;k++){ const pw=.35+.65*((k*7)%40)/39; if(!P.balls[0]) P.balls.push({x:333,y:572,vx:0,vy:0,st:'plunger',trail:[],la:false,ht:0,stuck:0}); const b=P.balls[0]; b.x=333; b.y=572; b.vx=b.vy=0; b.st='plunger'; b.la=false; b.trail=[]; P.door.off=true; P.launchP(pw); st.N++; let ev=null; const W={l:0,r:0};
              for(let i=0;i<60*40&&!ev;i++){ const bb=P.balls[0]; if(!bb) break;
                W.l=Math.max(0,W.l-1); W.r=Math.max(0,W.r-1); if(bb.st==='play'&&bb.y>495&&bb.y<575&&bb.vy>0){ if(bb.x<175&&bb.x>90&&!W.l&&!W.lh){ W.lw=Math.floor(Math.random()*8); W.lh=1; } if(bb.x>=175&&bb.x<250&&!W.r&&!W.rh){ W.rw=Math.floor(Math.random()*8); W.rh=1; } }
                if(W.lh) W.lc=(W.lc||0)+1; if(W.rh) W.rc=(W.rc||0)+1; const L=W.lh&&W.lc>W.lw&&W.lc<W.lw+14, R=W.rh&&W.rc>W.rw&&W.rc<W.rw+14; if(W.lh&&W.lc>=W.lw+14){ W.lh=0; W.lc=0; W.l=30; } if(W.rh&&W.rc>=W.rw+14){ W.rh=0; W.rc=0; W.r=30; } P.flip(0,!!L); P.flip(1,!!R);
                P.sim(1/60); const b2=P.balls[0]; if(!b2) break; if(b2.st==='hold') ev='hold'; else if(b2.st==='ramp') ev='ramp'; else if(b2.y>560&&b2.vy>0&&b2.x>110&&b2.x<250&&b2.st==='play') ev='drain'; }
              st[ev||'drain']++; P.flip(0,false); P.flip(1,false); for(const r of P.ramps) r.cd=0; if(P.balls[0]) P.balls[0].st='play'; }
            out.push(st); } return JSON.stringify(out); }""",tis)
        for t in json.loads(res): print(t['n'],'first event: hold',t['hold'],'ramp',t['ramp'],'drain',t['drain'],'/',t['N'])
        print([e for e in errs if 'insertBefore' not in e]); await b.close()
asyncio.run(main())
