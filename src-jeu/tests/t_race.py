import asyncio,json
from playwright.async_api import async_playwright
STUB="""(()=>{const mk=()=>{const f=function(){};return new Proxy(f,{get:(t,k)=>{if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(k==='length')return 0;if(k==='x'||k==='y'||k==='z'||k==='w')return 0;return mk()},apply:()=>mk(),construct:()=>mk(),set:()=>true,has:()=>true})};window.THREE=mk();})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page(viewport={'width':412,'height':860})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.route('**/*',lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.add_init_script(STUB)
        await pg.goto('file://'+__import__('os').path.abspath('out.html')); await pg.wait_for_timeout(2500)
        r=await pg.evaluate("""async()=>{
          await loadTrack(); const out={trk:!!TRK.ready,N:TRK.N,L:TRK.L};
          const res=[];
          for(const mid of ['piccola','riva','fury','rossa','aurion','patrouille']){
            S=fresh(); S.cars[0].mid=mid; S.cars[0].etat=100; 
            const ev=EVENTS.find(e=>e.id==='e9'); R={ev,opps:makeOpps(ev),pick:ev.manches.map(()=>S.cars[0].uid),rows:[],auto:true,result:null};
            const mn=ev.manches[2]; let ok=true,err='';
            try{
              const c=S.cars[0], opps=R.opps[2]; const idx=EVENTS.indexOf(ev), stage=SPA_STAGES[0];
              const stg=SPA_STAGES.find(s=>s.id==='s1'); const n=opps.length+1;
              RC={kind:'spa',i:2,mn:Object.assign({},mn,{sp:'s1'}),stage:stg,len:stg.b-stg.a,auto:true,clock:-3.4,inp:{t:0,k:0,b:false,kb:false,st:0,sk:0,hand:false},done:false};
              const slots=Array.from({length:n},(_,k)=>({off:8+k*8,lane:k%2?2.6:-2.6}));
              const mk=(r,card,slot)=>{const q=mkSpaCar(r,r.m,stg.a-slot.off,slot.lane,card.etat); q.prog=-slot.off; q.timePen=0; q.mass=Math.max(80,st(card).kg); q.laneT=slot.lane; return q;};
              const Pr=mkRacer(c,RC.mn,{skill:.9,err:0,react:.4}), P=mk(Pr,c,slots[3]); P.card=c; P.nit=0;
              const Os=opps.map((o,k)=>{const stl=STYLES[o.sty||0], sk=.9, r=mkRacer(o,RC.mn,{skill:sk,err:0,react:.4}); const q=mk(r,o,slots[k<3?k:k+1]); q.skill=sk;q.prof=aiProfile(r,sk);q.sty=stl;q.pil=o.pil;q.pref=0;return q;});
              Object.assign(RC,{P,Os,all:[P].concat(Os),O:Os[0],pos:4,profP:aiProfile(Pr,.9)});
              let t=0; while(t<400&&!RC.done&&RC.endAt==null){ tickSpa(1/60); t+=1/60; }
              const all=RC.all; out['n_'+mid]=n;
              res.push({mid,n,t:+t.toFixed(1),fin:all.map(q=>q.fin==null?null:+q.fin.toFixed(1)),prog:all.map(q=>Math.round(q.prog)),nan:all.some(q=>!isFinite(q.x)||!isFinite(q.z)||!isFinite(q.v)),pos:RC.pos,resp:all.map(q=>q.stuckT>0)});
            }catch(e){err=String(e.stack||e).slice(0,300)}
            if(err) res.push({mid,err});
          }
          out.res=res; return out;}""")
        print(json.dumps(r)[:3000]); print(errs[:5])
        await b.close()
asyncio.run(main())
