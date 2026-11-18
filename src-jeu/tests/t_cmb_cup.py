# v1.5 · Arène et tournois (new56) + règles des voitures (patrouille seulement dans le Paquet Voiture, 1 max ; plus de vélo).
import asyncio, os, sys, json
from playwright.async_api import async_playwright
URL = 'file:///' + os.path.abspath('out.html').replace('\\', '/')
RULES = r"""()=>{ const E=[];
  if(M.velo||CARS.some(c=>c.id==='velo')) E.push('le vélo existe encore'); if(MODEL_IDS.includes('velo')) E.push('modèle 3D du vélo encore chargé'); if(document.getElementById('mdl-velo')) E.push('balise du modèle vélo encore présente');
  S=fresh(); const N=100000; let pol=0; for(let i=0;i<N;i++) if(carRoll().id==='patrouille') pol++;
  const rate=pol/N; if(rate<.001||rate>.0032) E.push('taux patrouille '+rate);
  S.cars.push({uid:S.nuid++,mid:'patrouille',etat:100,xp:0,lvl:1,up:{},inv:0,mods:{}}); let pol2=0; for(let i=0;i<20000;i++) if(carRoll().id==='patrouille') pol2++; if(pol2) E.push('patrouille tirée alors qu’elle est déjà au garage');
  for(let i=0;i<3000;i++) if(carPrize().id==='patrouille'){ E.push('patrouille dans un paquet de modules'); break; }
  for(let b=1;b<=Math.min(5,CASSE_T.length);b++){ S.bat.casse=b; for(let k=0;k<200;k++){ newOffres(); if(S.offres.some(o=>o.mid==='patrouille')){ E.push('patrouille à la casse'); b=99; break; } } }
  const cr0=S.cr; S.bat.concession=3; S.cr=1e6; ACT.buynew({id:'patrouille'}); if(S.cars.filter(c=>c.mid==='patrouille').length>1) E.push('patrouille achetable en concession');
  /* doublons existants : un seul gardé, le reste remboursé */
  S.cars.push({uid:S.nuid++,mid:'patrouille',etat:100,xp:0,lvl:1,up:{},inv:0,mods:{}},{uid:S.nuid++,mid:'patrouille',etat:100,xp:0,lvl:1,up:{},inv:0,mods:{}}); const c1=S.cr; polFix();
  if(S.cars.filter(c=>c.mid==='patrouille').length!==1) E.push('doublons de patrouille gardés'); if(S.cr<=c1) E.push('doublons non remboursés');
  const pk=PACKS.find(p=>p.id==='pcar'); if(!/Patrouille/.test(pk.d)) E.push('description du Paquet Voiture');
  /* ancienne sauvegarde avec un vélo et sans patrouille : vélo remboursé, pas de patrouille offerte */
  const old=migrate({cars:[{uid:1,mid:'epave',etat:50,xp:0,lvl:1,up:{},inv:0},{uid:2,mid:'velo',etat:50,xp:0,lvl:1,up:{},inv:0}],cr:100,nuid:3});
  if(old.cars.some(c=>c.mid==='velo')) E.push('vélo gardé à la migration'); if(old.cr!==700) E.push('vélo non remboursé '+old.cr); if(old.cars.some(c=>c.mid==='patrouille')) E.push('patrouille offerte à une ancienne sauvegarde');
  return {E,rate}; }"""
SETUP = """(lv)=>{ S=fresh(); S.age18=true; S.intro=true; S.seenVer=GAME_VER; S.lvl=20; S.niveau10CinematicSeen=true; S.tx={}; Object.keys(TUTX||{}).forEach(k=>S.tx[k]=1); S.unlQ=[]; S.cr=200000;
  ['rossa','aurion','fury'].forEach(mid=>S.cars.push({uid:S.nuid++,mid,etat:100,xp:0,lvl:1,up:{},inv:0,mods:{}}));
  S.cars.forEach(c=>{ const s=cbOf(c); s.iv={hp:31,atk:31,def:31,spa:31,spd:31,vit:31}; cbSetLv(c,lv); s.mv=cbAutoMoves(s.ty,s.lv); });
  S.cbTeam=S.cars.slice(-3).map(c=>c.uid); S.cbBag={kit:5,superkit:3}; try{closeSheet()}catch(e){} save(); }"""
PLAY = """()=>{ if(CBV){ if(CBV.busy){ CBV.fast=true; return 'busy'; } const B=CBV.B; if(B.over!=null){ const b=document.querySelector('[data-cb=close]'); b&&b.click(); return 'close'; }
   if(B.need&&B.need.includes(0)){ const b=document.querySelector('[data-cb=rep]:not([disabled])'); b&&b.click(); return 'rep'; }
   /* meilleure attaque selon l'IA du jeu, jouée par l'interface */
   const a=cbAI(B,0,3); if(a.k==='mv'){ const b=document.querySelector('[data-cb=cont]')||document.querySelector('[data-cb=mv][data-v="'+a.i+'"]:not([disabled])')||document.querySelector('[data-cb=mv]:not([disabled])'); b&&b.click(); return 'mv'; }
   const b=document.querySelector('[data-cb=mv]:not([disabled])')||document.querySelector('[data-cb=cont]'); b&&b.click(); return 'mv'; }
  if(sheet&&sheet.t==='cbtalk'){ const b=document.querySelector('#sheet [data-a=cbfight],#sheet [data-a=cbnext]'); if(b){ b.click(); return 'talk'; } }
  if(sheet&&sheet.t==='cbcup') return 'cup'; if(!sheet&&view==='arena') return 'arena'; return 'other:'+(sheet&&sheet.t); }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 390, 'height': 844})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(RULES); E = r['E']; print('patrouille : %.3f %% par Paquet Voiture' % (r['rate'] * 100))
        await pg.evaluate(SETUP, 30)
        # Arène, équipe, boutique
        await pg.evaluate("()=>{ ACT.arena(); AR.tab='cups'; render(); }"); await pg.wait_for_timeout(200)
        a = await pg.evaluate("()=>({t:view,cups:document.querySelectorAll('#view .ar-cup').length,lock:document.querySelectorAll('#view .ar-cup.lock').length,team:document.querySelectorAll('#view .ar-car').length})")
        if a != {'t': 'arena', 'cups': 5, 'lock': 4, 'team': 3}: E.append('Arène %s' % a)
        await pg.evaluate("()=>{ ACT.cbteamopen(); ACT.cbteampick({id:String(S.cbTeam[2])}); if(!sheet||sheet.t!=='cbcard') throw new Error('fiche de combat non ouverte'); ACT.cbteamtoggle({id:String(S.cbTeam[2])}); }")
        if await pg.evaluate("()=>S.cbTeam.length") != 2: E.append('retrait d’une voiture de l’équipe')
        await pg.evaluate("()=>{ ACT.cbteamtoggle({id:String(S.cars[0].uid)}); ACT.cbteamtoggle({id:String(S.cars[3].uid)}); }")
        if await pg.evaluate("()=>S.cbTeam.length") not in (3, 4): E.append('équipe limitée à 4')
        await pg.evaluate("()=>{ S.cbTeam=S.cars.slice(-3).map(c=>c.uid); }")
        b0 = await pg.evaluate("()=>{ ACT.cbshop(); S.neo=50000; const c=S.neo; ACT.cbbuy({id:'revision',v:'5'}); return [c-S.neo, S.cbBag.revision]; }")
        if b0 != [20000, 5]: E.append('achat en boutique %s' % b0)
        if await pg.evaluate("()=>{ cbCupStart(1); return !!S.cbT; }"): E.append('coupe 2 ouverte trop tôt')
        # coupe 1 jouée jusqu'au bout par l'interface
        await pg.evaluate("()=>{ closeSheet(); cbCupStart(0); }"); seen = set(); cr0 = await pg.evaluate("()=>S.neo||0")
        for i in range(600):
            st = await pg.evaluate(PLAY); seen.add(st.split(':')[0])
            if st in ('cup', 'arena'): break
            await pg.wait_for_timeout(120)
        res = await pg.evaluate("()=>({t:sheet&&sheet.t,won:!!(S.cbStat&&S.cbStat.cups.c1),w:S.cbStat&&S.cbStat.w,cr:S.neo||0,kit:S.cbBag.kit,cbT:S.cbT,got:sheet&&sheet.got})")
        print('coupe 1 :', json.dumps(res, ensure_ascii=False))
        if res['t'] != 'cbcup' or not res['won']: E.append('coupe 1 non gagnée par une équipe niveau 30 : %s' % res)
        else:
            if res['cr'] - cr0 < 8000 + 3 * 900: E.append('récompenses de la coupe 1')
            if res['kit'] < 8: E.append('objets de la coupe 1 non reçus')
            if res['cbT']: E.append('tournoi non clôturé')
            await pg.evaluate("()=>{ closeSheet(); ACT.artab({id:'cups'}); }")
            if await pg.evaluate("()=>document.querySelectorAll('#view .ar-cup.lock').length") != 3: E.append('coupe 2 non débloquée')
        # défaite : équipe niveau 5 contre la coupe Cosmique (ouverte de force)
        await pg.evaluate(SETUP, 5)
        await pg.evaluate("()=>{ ['c1','c2','c3','c4'].forEach(k=>cbSt().cups[k]=1); closeSheet(); cbCupStart(4); }")
        for i in range(600):
            st = await pg.evaluate(PLAY)
            if st in ('arena', 'cup'): break
            if await pg.evaluate("()=>sheet&&sheet.t==='cbtalk'&&sheet.ph==='win'"):
                await pg.evaluate("()=>ACT.cbnext()"); break
            await pg.wait_for_timeout(120)
        lose = await pg.evaluate("()=>({cbT:S.cbT,t:sheet&&sheet.t,c5:!!cbSt().cups.c5,l:cbSt().l})")
        if lose['cbT'] or lose['c5'] or lose['l'] < 1: E.append('défaite en tournoi %s' % lose)
        # entraînement
        await pg.evaluate("()=>{ closeSheet(); ACT.cbtrain(); }")
        if not await pg.evaluate("()=>!!CBV"): E.append('entraînement')
        await pg.evaluate("()=>CBV&&cbClose()")
        E += errs
        print('ERREURS' if E else 'OK', E); await b.close(); sys.exit(1 if E else 0)
asyncio.run(main())
