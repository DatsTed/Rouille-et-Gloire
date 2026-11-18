# Rue Néon (v1.6) : déblocages par badges, ordre des champions, récompenses, revanche, page et fiche.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_rue.py [fichier.html]
import asyncio, os, sys
from playwright.async_api import async_playwright
HTML = sys.argv[1] if len(sys.argv) > 1 else 'out.html'
JS = r"""async ()=>{ const E=[], wait=ms=>new Promise(r=>setTimeout(r,ms));
  S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.cr=0; S.lvl=20; S.niveau10CinematicSeen=true; S.lvUnified=1;
  ['touge','piccola','kombi'].forEach(mid=>S.cars.push({uid:S.nuid++,mid,etat:100,xp:0,lvl:14,up:{},inv:0,mods:{},sh:1})); S.cbTeam=S.cars.slice(-3).map(c=>c.uid); save();
  const win=async id=>{ W.on=true; rueFight(id); W.on=false; await wait(300); if(!CBV) return false; CBV.o.onEnd({win:true}); cbClose(); await wait(200); try{ closeSheet(); }catch(e){} return true; };
  if(RUE_PIL.length!==12||RUE_CH.length!==8) E.push('effectifs');
  if(new Set(RUE_CH.map(c=>c.ty)).size!==8) E.push('types des champions');
  RUE_CH.forEach((c,i)=>{ if(i&&c.lv<=RUE_CH[i-1].lv) E.push('niveaux champions'); c.cars.forEach(m=>{ if(!M[m]) E.push('voiture inconnue '+m); if(!cbTypesOf(m).includes(c.ty)) E.push(c.id+' : '+m+' pas du type'); }); });
  RUE_PIL.forEach(p=>p.cars.forEach(m=>{ if(!M[m]) E.push('voiture inconnue '+m); }));
  if(rueOpen(rueGet('kev'))) E.push('Kevin ouvert dans la Rue sans l’avoir rencontré'); W.on=true; if(!rueOpen(rueGet('kev'))) E.push('Kevin fermé dans la Région'); W.on=false;
  if(rueOpen(rueGet('ch_eau'))) E.push('eau ouverte sans badge'); if(rueOpen(rueGet('hugo'))) E.push('Hugo ouvert sans badge');
  rueFight('ch_eau'); await wait(200); if(CBV){ E.push('duel lancé alors que fermé'); cbClose(); }
  const cr0=S.neo||0; await win('ch_feu'); const g1=(S.neo||0)-cr0;
  if(!S.rue.bdg.feu) E.push('pas de badge Feu'); if(!rueOpen(rueGet('ch_feu'))) E.push('Vega pas en revanche dans la Rue'); W.on=true; if(!rueOpen(rueGet('ch_eau'))||!rueOpen(rueGet('hugo'))) E.push('déblocages après 1 badge'); W.on=false;
  const cr1=S.neo||0; await win('ch_feu'); const g2=(S.neo||0)-cr1; if(!(g2>0&&g2<g1)) E.push('revanche champion '+g1+'/'+g2);
  const c2=S.neo||0; await win('kev'); const k1=(S.neo||0)-c2, c3=S.neo||0; await win('kev'); const k2=(S.neo||0)-c3; if(k1!==rueCr(rueGet('kev'))||k2!==Math.round(k1*.25)) E.push('gains rue '+k1+'/'+k2);
  for(const c of RUE_CH.slice(1)) await win(c.id);
  if(rueNB()!==8) E.push('8 badges : '+rueNB()); W.on=true; if(!rueOpen(rueGet('victor'))) E.push('Victor fermé avec 8 badges'); W.on=false;
  const foes=rueFoes(rueGet('ch_tene')); if(foes.length!==4||foes[3].lv!==42) E.push('équipe de Nyx '+JSON.stringify(foes.map(f=>f.lv)));
  ACT.arena(); await wait(200); const page={tab:AR.tab,list:document.querySelectorAll('#view .rue-r').length,strip:document.querySelectorAll('#view .rue-strip .bdg.on').length};
  if(page.tab!=='rue'||page.list!==20||page.strip!==8) E.push('page '+JSON.stringify(page));
  ACT.ruego({id:'victor'}); const sh=$('sheet').innerText; if(!/Région Néon/i.test(sh)) E.push('fiche de Victor : rappel Région absent'); closeSheet(); ACT.ruego({id:'ch_feu'}); if(!/Défier/i.test($('sheet').innerText)) E.push('revanche Vega');
  return {E,g1,g2,k1,k2,page}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 390, 'height': 844})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///' + os.path.abspath(HTML).replace('\\', '/')); await pg.wait_for_timeout(1200)
        r = await pg.evaluate(JS)
        print('champion Feu : %s cr puis %s cr en revanche · pilote de rue : %s puis %s · page %s' % (r['g1'], r['g2'], r['k1'], r['k2'], r['page']))
        e = r['E'] + [x for x in errs if 'insertBefore' not in x and 'offres' not in x]
        print('OK' if not e else 'ERREURS', e); await b.close()
asyncio.run(main())
