# Équilibrage v1.8 : équipe de 4 du joueur (IA niveau 2, comme un humain moyen) contre chaque champion / pilote de rue.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_bal4.py [nb de duels]
import asyncio, os, sys, json
from playwright.async_api import async_playwright
N = int(sys.argv[1]) if len(sys.argv) > 1 else 40
JS = r"""(N)=>{ const ids=CARS.map(c=>c.id).filter(id=>id!=='patrouille'&&id!=='velo'&&M[id]); const out=[];
  const team=(lv,n)=>{ const t=[]; for(let k=0;k<n;k++){ const mid=ids[Math.floor(Math.random()*ids.length)], ty=cbTypesOf(mid); t.push({mid,lv,iv:{hp:15,atk:15,def:15,spa:15,spd:15,vit:15},tal:(CB_TAL_BY[ty[0]]||CB_TAL_BY.meca)[k%4]}); } return t; };
  const run=(P,dl,n)=>{ let w=0, tr=0; for(let i=0;i<N;i++){ const B=cbAutoBattle({teams:[team(clamp(P.lv+dl,1,50),n),rueFoes(P)],seed:(Math.random()*1e9)|0,ai:[{d:2},{d:rueD(P)}],wx:P.wx}); if(B.over===0) w++; tr+=B.t; } return [Math.round(w/N*100),Math.round(tr/N)]; };
  RUE_CH.concat(RUE_PIL).forEach(P=>{ out.push({nm:P.nm,lv:P.lv,foes:rueN(P),eq:run(P,0,4),m2:run(P,-2,4),eq3:run(P,0,3)}); }); return out; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///' + os.path.abspath('out.html').replace('\\', '/')); await pg.wait_for_timeout(1200)
        r = await pg.evaluate(JS, N)
        print('%-28s %4s %5s | %-18s | %-18s | %-18s' % ('adversaire','niv','équ.','4 voit. même niv.','4 voit. niv −2','3 voit. même niv.'))
        for x in r: print('%-28s %4d %5d | %3d %% · %2d tours  | %3d %% · %2d tours  | %3d %% · %2d tours' % (x['nm'][:28], x['lv'], x['foes'], x['eq'][0], x['eq'][1], x['m2'][0], x['m2'][1], x['eq3'][0], x['eq3'][1]))
        await b.close()
asyncio.run(main())