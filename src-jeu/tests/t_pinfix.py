# Flipper : lancement varié (quille en haut à gauche), passage lisse guide → flipper, aimant léger des trous.
# Usage (depuis src-jeu/) : python tests/t_pinfix.py [fichier.html]   (par défaut out.html)
import asyncio, os, sys, json
from playwright.async_api import async_playwright
HTML = sys.argv[1] if len(sys.argv) > 1 else 'out.html'
JS = r"""()=>{ let P=__pin; const out={}; const fresh=()=>{ try{ ACT.arcquit&&ACT.arcquit(); }catch(e){} try{ const A=arcS(); A.pb=Object.assign(A.pb||{},{lv:10}); }catch(e){} arcOpen('pin'); ACT.arcstart(); P=__pin; P.loadTable(0); };
  fresh();
  const reset=(x,y,vx,vy)=>{ if(!P.balls[0]) P.balls.push({x,y,vx,vy,st:'play',trail:[],la:false,ht:0,stuck:0}); const b=P.balls[0]; Object.assign(b,{x,y,vx,vy,st:'play',la:false,trail:[],stuck:0}); P.balls.length=1; P.FL.forEach(f=>{f.on=false;}); return b; };
  /* 1. lancement : où passe la bille à mi-hauteur, et combien longent la paroi gauche */
  { const xs=[]; let wall=0; for(let k=0;k<24;k++){ const pw=.4+.6*k/23; const b=reset(333,572,0,0); b.st='plunger'; P.door.off=true; P.launchP(pw); let hug=0, x300=null;
      for(let i=0;i<60*3;i++){ P.sim(1/60); const c=P.balls[0]; if(!c||c.st!=='play') break; if(c.vy>0&&c.y>240&&c.y<400&&c.x<26) hug++; if(x300==null&&c.vy>0&&c.y>300&&c.x<318) x300=Math.round(c.x); }
      if(hug>6) wall++; xs.push(x300); }
    const uniq=new Set(xs.filter(v=>v!=null).map(v=>Math.round(v/15))).size; out.launch={wall,uniq,xs}; }
  /* 2. guide → flipper : on pose la bille sur chaque guide et on mesure le rebond en arrivant sur le flipper au repos */
  { const r=[]; [[30,468,1],[300,468,-1]].forEach(([x,y,s])=>{ for(let k=0;k<3;k++){ fresh(); const b=reset(x+s*k*6,y-10,s*60,40); let up=0, vIn=0, vOut=0;
        for(let i=0;i<60*1.6;i++){ P.sim(1/120); P.sim(1/120); const c=P.balls[0]; if(!c) break; const onF=s>0?(c.x>98&&c.x<142):(c.x<222&&c.x>178);
          if(!vIn&&(s>0?c.x>90:c.x<230)) vIn=Math.hypot(c.vx,c.vy); if(onF){ up=Math.min(up,c.vy); vOut=Math.hypot(c.vx,c.vy); } if(c.y>600) break; }
        r.push({up:Math.round(up),vIn:Math.round(vIn),vOut:Math.round(vOut)}); } }); out.inlane=r; }
  /* 3. trous : billes tirées vers le trou à différentes vitesses et distances du centre */
  { const res={}; [300,500,700,950].forEach(v=>{ let cap=0, n=0; [0,4,8,12,16,20].forEach(off=>{ [-1,1].forEach(sg=>{ n++; fresh(); const H=P.hole; H.cool=0; H.open=true; const b=reset(H.x+sg*off,H.y+70,0,-v); b.y=H.y+60;
        for(let i=0;i<60;i++){ H.open=true; P.sim(1/120); const c=P.balls[0]; if(!c) break; if(c.st==='warp'){ cap++; break; } if(c.y<H.y-40) break; } }); }); res[v]=cap+'/'+n; }); out.hole=res; }
  return out; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 412, 'height': 860})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///' + os.path.abspath(HTML).replace('\\', '/')); await pg.wait_for_timeout(1200)
        await pg.evaluate("()=>{ S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.age18=true; S.charte=1; S.cr=900000; S.lvl=20; view='garage'; render(); }")
        await pg.evaluate("arcOpen('pin'); ACT.arcstart()"); await pg.wait_for_timeout(500)
        r = await pg.evaluate(JS)
        L = r['launch']; print('lancement : %d/24 longent la paroi gauche · %d trajectoires différentes · x à mi-hauteur %s' % (L['wall'], L['uniq'], L['xs']))
        print('guide → flipper (rebond vers le haut, vitesse entrée → sur flipper) :', ' | '.join('%d px/s · %d→%d' % (q['up'], q['vIn'], q['vOut']) for q in r['inlane']))
        print('trous (captures par vitesse) :', r['hole'])
        print('erreurs', [e for e in errs if 'insertBefore' not in e]); await b.close()
asyncio.run(main())
