# v1.5 · moteur de combat (new53) : mécaniques unitaires + simulation d'équilibrage (IA contre IA).
# Usage (depuis src-jeu/, après build.py) : python tests/t_cmb_sim.py [nombre_de_duels]
import asyncio, os, sys, json
from playwright.async_api import async_playwright
N = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
UNIT = r"""()=>{ const E=[]; const ok=(c,t)=>{ if(!c) E.push(t); };
  const F=(mid,lv,mv,tal,extra)=>Object.assign(cbFighter({mid,lv:lv||30,mv,tal:tal||'filtre',iv:{hp:20,atk:20,def:20,spa:20,spd:20,vit:20}}),extra||{});
  const duel=(a,b,o)=>cbBattle(Object.assign({teams:[[a],[b]],seed:7},o||{}));
  const S0=JSON.stringify(S);
  /* efficacités, STAB, critiques, météo, crans, brûlure */
  { const u=F('kombi'), o=F('piccola'), B=duel(u,o); const est=(m,x)=>cbDamage(B,u,o,CB_MV[m],Object.assign({est:1},x||{})).d;
    const base=()=>{ o.ty=['meca']; return est('gicleur'); }; const b0=base(); o.ty=['feu']; const se=est('gicleur'); o.ty=['eau']; const nve=est('gicleur'); o.ty=['feu','terre']; const x4=est('gicleur');
    ok(Math.abs(se/b0-2)<.15,'×2 '+se+'/'+b0); ok(Math.abs(nve/b0-.5)<.15,'×0,5 '+nve+'/'+b0); ok(Math.abs(x4/b0-4)<.3,'×4 '+x4+'/'+b0);
    o.ty=['terre']; ok(est('courtjus')===0,'immunité Électrik→Terre'); o.ty=['meca'];
    const st=est('gicleur'); u.ty=['meca']; const ns=est('gicleur'); ok(Math.abs(st/ns-1.5)<.12,'STAB '+st+'/'+ns); u.tal='hybride'; u.ty=['eau']; ok(Math.abs(est('gicleur')/ns-2)<.15,'hybride'); u.tal='filtre'; u.ty=['eau','meca'];
    const cr=est('gicleur',{crit:true}); ok(Math.abs(cr/st-1.5)<.12,'critique '+cr+'/'+st);
    B.wx={id:'pluie',n:5}; ok(Math.abs(est('gicleur')/st-1.5)<.12,'pluie Eau'); u.ty=['feu']; const fe=est('allumage'); B.wx=null; const fe0=est('allumage'); ok(Math.abs(fe/fe0-.5)<.12,'pluie Feu'); u.ty=['eau','meca'];
    const p0=est('percussion'); u.stage.atk=2; ok(Math.abs(est('percussion')/p0-2)<.2,'cran +2'); u.stage.atk=0; u.status={id:'brule',n:1}; ok(Math.abs(est('percussion')/p0-.5)<.12,'brûlure'); u.status=null; }
  /* priorité : la plus lente frappe d'abord avec Aquaplaning */
  { const a=F('kombi',30,['aquaplaning']), b=F('volta',30,['percussion']); const B=duel(a,b); ok(cbSpeed(B,0)<cbSpeed(B,1),'kombi plus lente'); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); const mv=B.ev.filter(e=>e.k==='move'); ok(mv.length===2&&mv[0].s===0,'priorité '+JSON.stringify(mv)); }
  /* protection, contre, immunités de statut, increvable, absorption */
  { const a=F('audi',30,['blindurgence']), b=F('fury',30,['burnout']); const B=duel(a,b); const h=a.hp; cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(a.hp===h,'protection'); }
  { const a=F('audi',30,['contrechoc']), b=F('fury',30,['percussion']); const B=duel(a,b); const h=b.hp; cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); const lost=h-b.hp, took=a.mhp-a.hp; ok(took>0&&lost>=took*2-1&&lost<=took*2+1||b.hp===0,'contre ×2 '+took+'/'+lost); }
  { const a=F('fury',30,['combustion']), b=F('rossa',30,['tole']); const B=duel(a,b); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(!b.status,'Feu ne surchauffe pas'); }
  { const a=F('rossa',50,['burnout']), b=F('piccola',5,['percussion'],'increvable'); const B=duel(a,b); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(b.hp===1,'increvable '+b.hp); }
  { const a=F('kombi',30,['vaguescelerate']), b=F('fury',30,['percussion'],'refroid'); b.hp=Math.floor(b.mhp/2); const h=b.hp; const B=duel(a,b); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(b.hp>=h,'absorption Eau'); }
  /* charge + invulnérabilité, recharge */
  { const a=F('piccola',30,['aspiration']), b=F('audi',30,['percussion']); const B=duel(a,b); const h=a.hp; cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(a.charging==='aspiration'&&a.hp===h,'charge + intouchable'); const ob=b.hp; cbTurn(B,[null,{k:'mv',i:0}]); ok(b.hp<ob&&!a.charging,'frappe au 2e tour'); }
  { const a=F('steppe',40,['cataclysme']), b=F('audi',40,['tole']); a.energy=100; const B=duel(a,b); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(a.recharge,'recharge'); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(B.ev.some(e=>e.k==='rest'),'tour de refroidissement'); }
  /* gel, PP, Calage forcé, Énergie, provocation */
  { const a=F('kombi',30,['gicleur']), b=F('audi',30,['tole']); a.status={id:'gel',n:1}; const B=duel(a,b,{seed:3}); let stuck=0; for(let i=0;i<6&&a.status;i++){ cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); if(B.ev.some(e=>e.k==='stuck')) stuck++; } ok(stuck>=1,'gel bloque'); }
  { const a=F('kombi',30,['gicleur']), b=F('audi',30,['tole']); a.mv[0].pp=1; const B=duel(a,b); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(a.mv[0].pp===0,'PP'); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(B.log.some(t=>/Calage forcé/.test(t)),'Calage forcé sans PP'); }
  { const a=F('fury',40,['novaplasma','percussion']), b=F('audi',40,['tole']); a.energy=10; const B=duel(a,b); ok(!cbUsable(B,0,0),'ultime bloquée sans Énergie'); a.energy=80; ok(cbUsable(B,0,0),'ultime avec Énergie'); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(a.energy<=30,'Énergie dépensée '+a.energy); }
  { const a=F('fury',30,['appelphares']), b=F('audi',30,['tole','percussion']); const B=duel(a,b); cbTurn(B,[{k:'mv',i:0},{k:'mv',i:1}]); ok(b.vol.taunt>0,'provocation'); ok(!cbUsable(B,1,0)&&cbUsable(B,1,1),'provoqué : statut interdit'); }
  /* objets : soin, limite de 4 */
  { const a=F('kombi',30,['gicleur']), b=F('audi',30,['tole']); const B=duel(a,b,{bags:[{kit:9}]}); a.hp=10; cbTurn(B,[{k:'it',id:'kit'},{k:'mv',i:0}]); ok(a.hp>10,'kit'); for(let i=0;i<5;i++){ a.hp=10; cbTurn(B,[{k:'it',id:'kit'},{k:'mv',i:0}]); } ok(B.sides[0].itUsed===CB_IT_MAX,'limite d’objets '+B.sides[0].itUsed); }
  /* équipes : gravillons, K.O. et remplacement automatique de l'IA, victoire */
  { const a=F('steppe',40,['gravillons','seisme']), b1=F('kombi',5,['percussion']), b2=F('audi',30,['percussion']); const B=cbBattle({teams:[[a],[b1,b2]],seed:5,ai:[null,{d:3}]});
    cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(B.sides[1].hz,'gravillons posés'); let g=0; while(B.over==null&&g++<10){ if(B.need) break; cbTurn(B,[{k:'mv',i:1},null]); }
    ok(B.sides[1].act===1||B.over===0,'remplacement IA'); ok(B.log.some(t=>/gravillons \(/.test(t)),'dégâts de gravillons'); }
  /* météo par talent, fin de météo */
  { const a=F('kombi',30,['gicleur'],'brumisateur'), b=F('audi',30,['tole']); const B=duel(a,b); ok(B.wx&&B.wx.id==='pluie','talent météo'); for(let i=0;i<6;i++) cbTurn(B,[{k:'mv',i:0},{k:'mv',i:0}]); ok(!B.wx,'météo terminée'); }
  /* Ciel clair annule la météo */
  { const a=F('kombi',30,['gicleur'],'ciel'), b=F('audi',30,['tole']); const B=duel(a,b,{wx:'pluie'}); ok(B.wx&&cbWx(B)===null,'Ciel clair'); }
  /* sauvegarde intacte */
  ok(JSON.stringify(S)===S0,'les combats ont modifié la sauvegarde');
  return E; }"""
SIM = r"""(N)=>{ const E=[], ids=CARS.map(c=>c.id), R=cbRng(42); const pick=a=>a[Math.floor(R()*a.length)];
  /* une voiture sur deux reçoit 4 attaques tirées au hasard parmi celles qu'elle connaît : toutes les attaques sont ainsi exercées */
  const mk=(mid,lv)=>{ const ty=cbTypesOf(mid), iv={}; CB_SK.forEach(k=>iv[k]=Math.floor(R()*32)); const pool=CB_TAL_BY[ty[0]]; let mv=null;
    if(R()<.5){ const L=cbLearnable(ty,lv).map(m=>m.id); mv=[]; while(mv.length<4&&mv.length<L.length){ const x=pick(L); if(!mv.includes(x)) mv.push(x); } }
    return {mid,lv,iv,tal:pick(pool),mv}; };
  const win={}, play={}, tw={}, tp={}, used={}; let turns=0, timeouts=0, t0=performance.now(), d3=0, d3n=0, ko=0;
  for(let i=0;i<N;i++){ const lv=5+Math.floor(R()*41), n=1+Math.floor(R()*3), A=[], Bt=[]; for(let k=0;k<n;k++){ A.push(mk(pick(ids),lv)); Bt.push(mk(pick(ids),lv)); }
    let B; try{ const dd=i%5===0?[3,0]:[3,3]; B=cbAutoBattle({teams:[A,Bt],seed:i+1,ai:[{d:dd[0]},{d:dd[1]}],bags:[{kit:2,nitrorec:1},{kit:2,nitrorec:1}]}); }catch(e){ E.push('duel '+i+' : '+e.message+' '+(e.stack||'').split('\n')[1]); continue; }
    if(B.over<0){ timeouts++; continue; } turns+=B.t;
    B.log.forEach(t=>{ const m=t.match(/ utilise (.+) !$/); if(m) used[m[1]]=(used[m[1]]||0)+1; });
    if(i%5===0){ d3n++; if(B.over===0) d3++; continue; }
    if(n===1){ const w=B.over, a=A[0].mid, b=Bt[0].mid; [a,b].forEach(x=>play[x]=(play[x]||0)+1); win[w?b:a]=(win[w?b:a]||0)+1;
      const ta=cbTypesOf(a)[0], tb=cbTypesOf(b)[0]; [ta,tb].forEach(x=>tp[x]=(tp[x]||0)+1); tw[w?tb:ta]=(tw[w?tb:ta]||0)+1; }
    [0,1].forEach(s=>B.sides[s].team.forEach(f=>{ if(f.hp<0||f.hp>f.mhp) E.push('PV hors limites '+f.nm+' '+f.hp); })); }
  const wr=Object.keys(play).map(k=>[M[k].nom,Math.round(100*(win[k]||0)/play[k]),play[k]]).sort((a,b)=>b[1]-a[1]);
  const twr=Object.keys(tp).map(k=>[CB_TYPES[k].n,Math.round(100*(tw[k]||0)/tp[k])]).sort((a,b)=>b[1]-a[1]);
  const names=Object.values(CB_MV).map(m=>m.n), never=names.filter(n=>!used[n]);
  return {E,ms:Math.round(performance.now()-t0),avgTurns:+(turns/Math.max(1,N-timeouts)).toFixed(1),timeouts,iaForte:Math.round(100*d3/Math.max(1,d3n)),wr,twr,never}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///' + os.path.abspath('out.html').replace('\\', '/')); await pg.wait_for_timeout(1500)
        u = await pg.evaluate(UNIT)
        print('mécaniques :', 'OK' if not u else u)
        r = await pg.evaluate(SIM, N)
        print('simulation : %d duels en %d ms, %.1f tours en moyenne, %d sans fin' % (N, r['ms'], r['avgTurns'], r['timeouts']))
        print('IA forte contre IA faible : %d %% de victoires' % r['iaForte'])
        print('victoires par modèle (même niveau, 1 contre 1) :', ', '.join('%s %d%%' % (x[0], x[1]) for x in r['wr']))
        print('victoires par type principal :', ', '.join('%s %d%%' % (x[0], x[1]) for x in r['twr']))
        print('attaques jamais utilisées par l’IA (%d) :' % len(r['never']), ', '.join(r['never']))
        bad = u + r['E'][:10] + errs + (['trop de duels sans fin'] if r['timeouts'] > N * .01 else []) + (['IA forte pas assez forte'] if r['iaForte'] < 60 else [])
        print('ERREURS' if bad else 'OK', bad); await b.close(); sys.exit(1 if bad else 0)
asyncio.run(main())
