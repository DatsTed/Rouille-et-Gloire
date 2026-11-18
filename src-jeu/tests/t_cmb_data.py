# v1.5 · catalogue de combat (new51) : cohérence des données. À lancer depuis src-jeu/ après build.py.
import asyncio, os, sys
from playwright.async_api import async_playwright
JS = r"""()=>{ const E=[], W=[];
  const FX=['st','vol','sb','recoil','drain','heal','multi','crit','self','protect','counter','charge','inv','recharge','weather','trap','ring','leech','taunt','reset','energy','esteal','selfko','facade','jarnac','gyro','rand','revenge','first','force','copy','shield','hazard','cure','veil','ignore','wxacc','acrit','thaw','rampage'];
  const types=Object.keys(CB_TYPES); if(types.length<9) E.push('moins de 9 types');
  types.forEach(a=>types.forEach(d=>{ const v=CB_EFF[a][d]; if(![0,.5,1,2].includes(v)) E.push('eff '+a+'>'+d+'='+v); }));
  Object.entries(CB_CHART).forEach(([a,c])=>{ c.flat().forEach(d=>{ if(!CB_TYPES[d]) E.push('chart '+a+' type inconnu '+d); }); const all=c.flat(); if(new Set(all).size!==all.length) E.push('chart '+a+' doublon'); });
  const ids=new Set(); CB_MV_ROWS.forEach(r=>{ if(ids.has(r[0])) E.push('id en double '+r[0]); ids.add(r[0]); });
  Object.values(CB_MV).forEach(m=>{ const k=m.id;
    if(!CB_TYPES[m.t]) E.push(k+' type'); if(!['phy','spe','sta'].includes(m.c)) E.push(k+' catégorie');
    if(m.c!=='sta'&&!(m.p>0)) E.push(k+' puissance'); if(m.c==='sta'&&m.p) E.push(k+' statut avec puissance');
    if(!(m.a===0||(m.a>=50&&m.a<=100))) E.push(k+' précision'); if(!(m.pp>=5&&m.pp<=40)) E.push(k+' pp');
    if(!(m.lv>=1&&m.lv<=CB_LVMAX)) E.push(k+' niveau'); if(m.pr<-6||m.pr>4) E.push(k+' priorité'); if(m.e<0||m.e>CB_ENERGY.max) E.push(k+' énergie');
    Object.keys(m.fx).forEach(f=>{ if(!FX.includes(f)) E.push(k+' effet inconnu '+f); });
    const f=m.fx; if(f.st&&!CB_ST[f.st[0]]) E.push(k+' statut '+f.st[0]); if(f.vol&&!CB_VOL[f.vol[0]]) E.push(k+' vol '+f.vol[0]);
    if(f.weather&&!CB_WX[f.weather]) E.push(k+' météo'); (f.wxacc||[]).forEach(w=>{ if(!CB_WX[w]) E.push(k+' wxacc '+w); });
    if(f.sb){ Object.keys(f.sb).forEach(s=>{ if(!['who','ch'].includes(s)&&!CB_STAGE_N[s]) E.push(k+' cran '+s); }); if(!['foe','self'].includes(f.sb.who)) E.push(k+' sb.who'); }
    if(!m.n||!cbDesc(m)||cbDesc(m).length<4) E.push(k+' nom/description'); });
  types.forEach(t=>{ const L=Object.values(CB_MV).filter(m=>m.t===t); const c=x=>L.filter(m=>m.c===x).length;
    if(L.length<9) E.push(t+' : '+L.length+' attaques'); if(t!=='meca'&&(!c('phy')||!c('spe'))) E.push(t+' sans physique ou spéciale'); if(!c('sta')) E.push(t+' sans attaque de statut');
    if(!L.some(m=>m.lv===1&&m.c!=='sta')) E.push(t+' sans attaque de niveau 1'); if(!L.some(m=>m.e>0)) E.push(t+' sans ultime');
    if(t!=='meca'&&!Object.values(CB_MV).some(m=>m.t===t&&m.fx.weather)&&!['acier','terre'].includes(t)) W.push(t+' sans météo'); });
  /* chaque type élémentaire a au moins 4 attaques offensives disponibles au niveau 10 (avec les Méca) */
  types.filter(t=>t!=='meca').forEach(t=>{ const n=cbLearnable([t],10).filter(m=>m.c!=='sta').length; if(n<4) E.push(t+' : '+n+' attaques offensives au niv. 10'); });
  Object.entries(CB_TAL).forEach(([k,t])=>{ if(!t.n||!t.d||!t.k) E.push('talent '+k); if(t.wx&&[].concat(t.wx).some(w=>!CB_WX[w])) E.push('talent '+k+' météo'); (t.st||[]).forEach(s=>{ if(!CB_ST[s]) E.push('talent '+k+' statut '+s); }); });
  Object.entries(CB_TAL_BY).forEach(([t,L])=>{ if(!CB_TYPES[t]) E.push('talents type '+t); L.forEach(x=>{ if(!CB_TAL[x]) E.push('talent inconnu '+x); }); });
  types.forEach(t=>{ if(!CB_TAL_BY[t]) E.push('pas de talents pour '+t); const p=CB_TPROF[t]; if(!p) E.push('pas de profil '+t); else { const s=CB_SK.reduce((a,k)=>a+p[k],0); if(s<440||s>520) E.push('profil '+t+' total '+s); } });
  Object.entries(CB_IT).forEach(([k,it])=>{ if(!it.n||!it.d||!(it.px>0)) E.push('objet '+k); });
  Object.keys(CB_WX).forEach(w=>{ if(!Object.values(CB_MV).some(m=>m.fx.weather===w)) E.push('météo sans attaque '+w); });
  if(Math.abs(cbStageK('atk',6)-4)>1e-9||Math.abs(cbStageK('atk',-6)-.25)>1e-9||Math.abs(cbStageK('acc',6)-3)>1e-9) E.push('crans');
  if(cbEff('elec',['terre'])!==0||cbEff('eau',['feu','terre'])!==4||cbEff('feu',['eau','terre'])!==.25) E.push('cbEff double type');
  /* défense : aucune combinaison simple n'est sans faiblesse ni immunité totale */
  types.filter(t=>t!=='meca').forEach(d=>{ const w=types.filter(a=>CB_EFF[a][d]===2).length; if(w<2) E.push(d+' : '+w+' faiblesse(s)'); });
  /* le jeu tourne toujours (rien d'écrasé) */
  ['render','vRace','buildSpa','openPack','vMissions','startCine'].forEach(f=>{ if(typeof window[f]!=='function'&&typeof eval(f)!=='function') E.push('fonction perdue '+f); });
  const stat={types:types.length,attaques:Object.keys(CB_MV).length,talents:Object.keys(CB_TAL).length,objets:Object.keys(CB_IT).length,meteos:Object.keys(CB_WX).length,statuts:Object.keys(CB_ST).length+Object.keys(CB_VOL).length};
  return {E,W,stat}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///' + os.path.abspath('out.html').replace('\\', '/')); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(JS)
        print('catalogue', r['stat']); print('avertissements', r['W'])
        bad = r['E'] + [e for e in errs if 'CB_' in e or 'cb' in e]
        print('ERREURS' if bad else 'OK', bad); await b.close(); sys.exit(1 if bad else 0)
asyncio.run(main())
