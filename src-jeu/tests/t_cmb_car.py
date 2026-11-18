# v1.5 · fiches de combat (new52) : génération, IV, stats, XP, attaques, sauvegarde, cloisonnement avec les courses.
import asyncio, os, sys
from playwright.async_api import async_playwright
URL = 'file:///' + os.path.abspath('out.html').replace('\\', '/')
A = r"""()=>{ const E=[]; S=fresh(); S.age18=false; S.intro=true;
  const c0=S.cars[0]; ACT.car({id:String(c0.uid)}); if($('sheet').querySelector('.cbsec')) E.push('fiche visible avant l’éveil'); closeSheet();
  /* une voiture de chaque modèle */
  CARS.forEach(m=>{ if(!S.cars.some(c=>c.mid===m.id)) S.cars.push({uid:S.nuid++,mid:m.id,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{}}); });
  const race0=JSON.stringify(S.cars.map(c=>[st(c),c.etat,c.lvl,c.xp]));
  S.niveau10CinematicSeen=true;
  const ivs=[];
  S.cars.forEach(c=>{ const s=cbOf(c), k=c.mid;
    if(!s.ty.length||s.ty.some(t=>!CB_TYPES[t])) E.push(k+' types'); if(!CB_TAL[s.tal]) E.push(k+' talent');
    CB_SK.forEach(x=>{ const v=s.iv[x]; if(!(v>=0&&v<=31&&v===Math.floor(v))) E.push(k+' iv '+x); ivs.push(v); });
    if(s.lv!==(c.lvl||1)) E.push(k+' niveau de combat différent du niveau de la voiture');
    if(!(s.mv.length>=1&&s.mv.length<=4)||new Set(s.mv).size!==s.mv.length) E.push(k+' attaques '+s.mv);
    s.mv.forEach(id=>{ const m=CB_MV[id]; if(!m||(m.t!=='meca'&&!s.ty.includes(m.t))||m.lv>s.lv) E.push(k+' attaque illégale '+id); });
    if(!s.mv.some(id=>CB_MV[id].c!=='sta')) E.push(k+' aucune attaque offensive');
    const sts=cbStats(c); CB_SK.forEach(x=>{ if(!(sts[x]>0)) E.push(k+' stat '+x); });
    const b=cbBase(c.mid), tot=CB_SK.reduce((a,x)=>a+b[x],0); if(tot<380||tot>700) E.push(k+' base totale '+tot); });
  if(new Set(ivs).size<10) E.push('IV peu variés');
  if(cbOf(S.cars[0])!==cbOf(S.cars[0])) E.push('fiche non stable');
  /* cloisonnement : créer les fiches ne change rien côté course */
  const race1=JSON.stringify(S.cars.map(c=>[st(c),c.etat,c.lvl,c.xp])); if(race0!==race1) E.push('les caractéristiques de course ont changé');
  /* un seul niveau : l'XP de combat fait monter la voiture, l'XP de course aussi */
  const c=S.cars.find(x=>x.mid==='rossa'), s=cbOf(c), lv0=c.lvl; let need=0; for(let l=lv0;l<30;l++) need+=60*l; const r=cbGainXP(c,need-(c.xp||0));
  if(c.lvl!==30||s.lv!==30||r.l1!==30) E.push('gain XP '+JSON.stringify(r)+' niv. voiture '+c.lvl); if(!r.fresh.length) E.push('aucune attaque nouvelle entre '+lv0+' et 30');
  if(!(s.mv.length===4)) E.push('4 attaques attendues'); if(cbStats(c).hp<=cbStats(c,lv0).hp) E.push('stats qui ne montent pas');
  addCarXP(c,60*30); if(cbOf(c).lv!==31) E.push('l’XP de course ne monte pas le niveau de combat');
  cbGainXP(c,1e9); if(s.lv!==CB_LVMAX||c.lvl!==CB_LVMAX) E.push('niveau max');
  { const n=S.cars.find(x=>x.mid==='kombi'); cbSetLv(n,20); const st20=JSON.stringify(st(n)); cbSetLv(n,40); if(JSON.stringify(st(n))!==st20) E.push('le niveau au-delà de 20 change les courses'); }
  /* interface : fiche + gestion des attaques */
  ACT.car({id:String(c.uid)}); const sec=$('sheet').querySelector('.cbsec'); if(!sec) E.push('section combat absente'); else if(sec.querySelectorAll('.cbst').length!==6) E.push('6 stats attendues');
  ACT.cbmv({id:String(c.uid)}); if(sheet.t!=='cbmoves') E.push('gestion des attaques');
  const other=cbLearnable(s.ty,s.lv).find(m=>!s.mv.includes(m.id)); ACT.cbpick({id:other.id}); ACT.cbslot({id:'2'}); if(s.mv[2]!==other.id) E.push('remplacement d’attaque');
  const keep=s.mv[0]; ACT.cbpick({id:keep}); ACT.cbslot({id:'3'}); if(s.mv[3]!==keep||new Set(s.mv).size!==s.mv.length) E.push('échange d’emplacements');
  closeSheet();
  /* vente : la fiche part avec la voiture */
  const sold=S.cars.pop(); save(); if(S.cmb[sold.uid]) E.push('fiche d’une voiture vendue conservée');
  localSave&&localSave();
  return {E, iv:JSON.stringify(cbOf(S.cars[0]).iv), ex:S.cars.slice(0,4).map(c=>{ const s=cbOf(c); return M[c.mid].nom+' '+s.ty.join('/')+' niv'+s.lv+' '+CB_TAL[s.tal].n+' ['+s.mv.map(id=>CB_MV[id].n).join(', ')+'] '+JSON.stringify(cbStats(c)); })}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(); pg = await ctx.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(A)
        for x in r['ex']: print(' ', x)
        # rechargement : les IV doivent être identiques (sauvegardés)
        await pg.reload(); await pg.wait_for_timeout(1500)
        iv2 = await pg.evaluate("()=>S.cmb?JSON.stringify(cbOf(S.cars[0]).iv):null")
        E = r['E'] + ([] if iv2 == r['iv'] else ['IV non sauvegardés ' + str(iv2) + ' vs ' + r['iv']]) + errs
        print('ERREURS' if E else 'OK', E); await b.close(); sys.exit(1 if E else 0)
asyncio.run(main())
