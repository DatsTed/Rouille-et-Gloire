# v2.6 : pastille de sélection directe, argent sale + blanchiment, énergie de l'équipe sur 24 h, registre d'activité.
# Usage (depuis src-jeu/) : python -X utf8 tests/t_lab26.py [fichier.html]
import asyncio, os, sys
from playwright.async_api import async_playwright
HTML = sys.argv[1] if len(sys.argv) > 1 else 'out.html'
JS = r"""async ()=>{ const E=[], wait=ms=>new Promise(r=>setTimeout(r,ms)); const msgs=[]; const t0=toast; toast=m=>{ msgs.push(String(m)); };
  S=fresh(); S.intro=true; S.tuto=true; S.tutoDone=true; S.charte=1; S.age18=true; S.lvl=20; S.cr=100000; save();
  const F=farm(); F.found=1; F.rooms.atelier.on=1; F.ll=8; F.lx=0; F.rep=60; F.water=300; Object.keys(F.chem).forEach(k=>F.chem[k]=20); F.stock={}; const sid=Object.keys(SID)[0], med=Object.keys(MED)[0]; F.stock[sid]={g:300,q:80};
  /* --- argent sale --- */
  S.dirty=0; let c=S.cr, d=dirtyN(); ACT.rsell({id:sid,v:'street10'}); if(S.cr!==c) E.push('la vente du labo a payé en crédits propres'); if(dirtyN()<=d) E.push('la vente ne donne pas d’argent sale');
  S.dirty=10000; const W=washSt(); W.ops.length=0; d=dirtyN(); ACT.washgo({id:'lav',v:1}); if(W.ops.length!==1||dirtyN()!==d-8000) E.push('lancement du blanchiment');
  c=S.cr; ACT.washget({id:W.ops[0].u}); if(W.ops.length!==1||S.cr!==c) E.push('récupération avant la fin');
  W.ops[0].end=Date.now()-1; ACT.washget({id:W.ops[0].u}); if(Math.round(S.cr-c)!==6400||W.ops.length) E.push('blanchisserie 80 % : '+(S.cr-c));
  S.dirty=20000; ACT.washgo({id:'cas',v:1}); let op=W.ops[0]; op.r=.1; op.end=Date.now()-1; c=S.cr; ACT.washget({id:op.u}); if(Math.round(S.cr-c)!==30000) E.push('casino gagné : '+(S.cr-c));
  S.dirty=20000; ACT.washgo({id:'cas',v:1}); op=W.ops[0]; op.r=.9; op.end=Date.now()-1; c=S.cr; ACT.washget({id:op.u}); if(Math.round(S.cr-c)!==6000) E.push('casino perdu : '+(S.cr-c));
  S.dirty=50000; for(let i=0;i<6;i++) ACT.washgo({id:'lav',v:.1}); if(W.ops.length!==washSlots()) E.push('limite de filières '+W.ops.length+' / '+washSlots()); W.ops.length=0;
  S.dirty=500; ACT.washgo({id:'res',v:1}); if(W.ops.length) E.push('montant sous le minimum accepté');
  { const e=ILL.find(x=>x.ill==='bet'&&x.bet===3000); S.dirty=5000; c=S.cr; R={ev:e,dirtyBet:true}; illResolve(e,1,true,true); if(Math.round(S.cr-c)!==4800||dirtyN()!==2000) E.push('course truquée gagnée'); S.dirty=5000; c=S.cr; R={ev:e,dirtyBet:true}; illResolve(e,.1,false,false); if(S.cr!==c||dirtyN()!==2000) E.push('course truquée perdue'); R=null; }
  S.dirty=1234; { const h=ranchHead(); if(!/Argent sale/.test(h)) E.push('argent sale absent de l’en-tête du labo'); }
  RY.tab='net'; if(!/Argent sale/.test(rNet())) E.push('carte de blanchiment absente du Réseau');
  /* --- équipe : énergie sur 24 h, registre --- */
  const T=team(); T.hired=[]; T.log=[]; T.auto=false; S.cars[0].etat=30;
  ['gard','mech','pil','dealer','irri'].forEach(r=>{ const e=newCand(r,'ass'); e.en=100; e.end=5; e.rest=0; e.lo=60; T.hired.push(e); });
  const R0=F.rooms.atelier; for(let i=0;i<4;i++){ const p=newPlant(sid,med,'t5'); p.st='veg'; p.w=20; if(i===1) p.pest='mold'; R0.slots[i]=p; } { const p=newPlant(sid,med,'t5'); p.st='ready'; R0.slots[4]=p; }
  S.dirty=0; T.last=Date.now()-12*3600000; empTick();
  T.hired.forEach(e=>{ if(e.en<35||e.en>65) E.push('énergie après 12 h : '+e.role+' '+Math.round(e.en)+' % (attendu ≈ 50)'); });
  const kinds=new Set(T.log.map(l=>l.k)); ['repair','race','sell','water','harv'].forEach(k=>{ if(!kinds.has(k)) E.push('registre sans « '+k+' »'); });
  if(dirtyN()<=0) E.push('les ventes des employés ne donnent pas d’argent sale');
  EQ.tab='log'; EQ.f='all'; { const h=vEquipe(); if(!/Registre/.test(h)||!/a gagné/.test(h)) E.push('onglet Registre vide'); }
  EQ.tab='team'; { const h=vEquipe(); if(!/Repos 1 h/.test(h)||!/État du labo/.test(h)||!/Sur 24 h/.test(h)) E.push('fiche d’équipe incomplète'); }
  /* épuisement + repos automatique */
  T.auto=true; T.hired.forEach(e=>{ e.en=5; e.rest=0; }); T.last=Date.now()-10*60000; empTick(); if(!T.hired.every(e=>e.rest>0)) E.push('repos automatique non déclenché');
  T.auto=false; T.hired.forEach(e=>{ e.en=0; e.rest=0; }); T.last=Date.now()-10*60000; const o0=T.hired.map(e=>e.out||0); empTick(); if(T.hired.some((e,i)=>(e.out||0)>o0[i])) E.push('un employé épuisé travaille encore');
  /* --- pastille de l'équipe de combat --- */
  S.lvl=20; S.niveau10CinematicSeen=true; S.lvUnified=1; ['touge','piccola','kombi','riva','hauler','fury'].forEach(mid=>S.cars.push({uid:S.nuid++,mid,etat:100,xp:0,lvl:12,up:{},inv:0,mods:{},sh:1}));
  S.cbTeam=S.cars.slice(0,2).map(c=>c.uid); AR.tab='team'; view='arena'; render(); await wait(300);
  const rows=[...document.querySelectorAll('.cbtm-r')]; if(rows.length<4) E.push('liste d’équipe '+rows.length);
  else{ for(let i=0;i<6&&sheet;i++) closeSheet(); const n0=S.cbTeam.length; rows[3].querySelector('.cbtm-n').click(); if(S.cbTeam.length!==n0+1) E.push('la pastille n’ajoute pas'); if(sheet) E.push('la pastille ouvre une fiche');
    [...document.querySelectorAll('.cbtm-r')][3].querySelector('.cbtm-n').click(); if(S.cbTeam.length!==n0) E.push('la pastille ne retire pas');
    [...document.querySelectorAll('.cbtm-r')][6].querySelector('b').click(); if(!sheet||sheet.t!=='cbcard') E.push('le reste de la ligne n’ouvre plus la fiche'); }
  /* --- v2.7 : le défilement du labo ne saute plus, fiche plante sans en-tête, achat par 50 --- */
  S.cr=999999; view='garage'; render(); ACT.ranch(); await wait(300); const shn=()=>document.getElementById('sheet');
  for(const [tab,sub,act,pos] of [['shop','seeds','rbuy',250],['shop','chem','rbuy',200],['shop','chem','rqty',200],['stock',null,'pkbuy',200],['atelier',null,'rwater',150]]){
    RY.tab=tab; if(sub) RY.shop=sub; RY.slot=null; renderSheet(); await wait(100); const b=[...shn().querySelectorAll('[data-a="'+act+'"]')].filter(x=>!x.disabled).pop(); if(!b){ E.push('bouton absent '+tab+'/'+act); continue; }
    shn().scrollTop=pos; await wait(60); const a=shn().scrollTop; if(a<20) continue; b.click(); await wait(200); if(Math.abs(shn().scrollTop-a)>3) E.push('saut de défilement '+tab+'/'+act+' : '+a+' → '+shn().scrollTop); }
  RY.tab='shop'; RY.shop='chem'; RY.slot=null; renderSheet(); ACT.rqty({id:'50'}); { const b=shn().querySelector('[data-a="rbuy"]'), id=b.dataset.id.split(':')[1], n0=F.chem[id]||0; b.click(); if((F.chem[id]||0)-n0!==50) E.push('achat ×50 : '+((F.chem[id]||0)-n0)); } ACT.rqty({id:'1'});
  RY.tab='atelier'; RY.slot=0; R0.slots[0]=R0.slots[0]||newPlant(sid,med,'t5'); renderSheet(); await wait(150); { const vis=[...shn().children].filter(c=>c.getBoundingClientRect().height>0).map(c=>c.className); if(vis.some(c=>/rhero$|^rhero( |$)/.test(c)&&!/rhero2/.test(c))) E.push('en-tête du labo visible sur la fiche plante'); if(!vis.some(c=>/rhero2/.test(c))) E.push('fiche plante absente'); }
  RY.slot=null; renderSheet(); await wait(100); if(shn().classList.contains('plantv')) E.push('classe plantv restée sur la liste');
  toast=t0; return {E}; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 412, 'height': 860}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') else r.continue_())
        await pg.goto('file:///' + os.path.abspath(HTML).replace('\\', '/')); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(JS); e = r['E'] + [x for x in errs if 'insertBefore' not in x and 'offres' not in x]
        print('OK' if not e else 'ERREURS', e); await b.close()
asyncio.run(main())
