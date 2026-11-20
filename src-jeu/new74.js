/* ===== v2.15 · 1/4 : audit — corrections transverses =====
   1. Identité « néon sombre » partout : le jeu ne suit plus le thème clair du téléphone (en clair, des cartes blanches côtoyaient des panneaux néon sombres).
   2. Barre du haut : les gros montants (9 000 000 cr, 500 600 Néo…) faisaient déborder la page de quelques pixels → nombres compacts quand ça ne tient pas.
   3. Bouton « retour » d'Android : ferme la fenêtre ouverte (fiche, borne d'arcade, Région, onglet) au lieu de quitter l'appli ; appelé par MainActivity.
   4. Flipper : l'expérience suit une courbe douce (√score) au lieu d'être proportionnelle — les billes en plus et les clapets (v2.14) faisaient monter
      un joueur au niveau max en 2 parties ; rivaux du classement remis à l'échelle des nouveaux scores. */

/* ---------- 1. thème ---------- */
try{ document.documentElement.dataset.theme='dark'; const m=document.querySelector('meta[name="theme-color"]')||document.head.appendChild(Object.assign(document.createElement('meta'),{name:'theme-color'})); m.content='#06070E'; }catch(_){}

/* ---------- 2. barre du haut compacte ---------- */
const fmtC=n=>{ n=Math.round(n||0); const a=Math.abs(n); if(a>=1e9) return (n/1e9).toFixed(a>=1e10?0:1).replace('.',',')+' Md'; if(a>=1e6) return (n/1e6).toFixed(a>=1e7?0:1).replace('.',',')+' M'; if(a>=1e5) return Math.round(n/1e3)+' k'; return fmt(n); };
function topFit(){ try{ const t=$('top'); if(!t) return; const m=t.querySelector('.money'); if(!m) return; t.classList.remove('tight','nowho');
    const who=()=>{ const w=t.querySelector('.who'); if(w&&w.clientWidth<74) t.classList.add('nowho'); };   /* l'XP passe dans le filet sous la barre quand le texte n'a plus la place */
    if(t.scrollWidth<=t.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1) return who();
    t.classList.add('tight'); const tn=[...m.childNodes].find(n=>n.nodeType===3&&/cr/.test(n.textContent)); if(tn) tn.textContent=fmtC(S.cr)+' cr';
    const ne=m.querySelector('.neo'); if(ne) ne.textContent='◈ '+fmtC(typeof neoN==='function'?neoN():S.neo);
    const tk=m.querySelector('.tk'); if(tk) tk.textContent='🎟 '+fmtC(S.tok); who(); }catch(_){} }
{ const _r74=render; render=function(){ const r=_r74.apply(this,arguments); topFit(); return r; }; }
window.addEventListener('resize',()=>{ try{ topFit(); }catch(_){} });

/* ---------- 3. bouton retour d'Android ---------- */
window.rgBack=function(){ try{
    if(document.getElementById('cbov')) return true;                       /* duel en cours : on ne quitte pas au milieu */
    if(document.getElementById('cine')) return true;
    if(typeof AOV!=='undefined'&&AOV){ arcQuit(); return true; }             /* borne d'arcade */
    if(sheet){ closeSheet(); render(); return true; }                      /* fiche ouverte */
    if(typeof W!=='undefined'&&W&&W.on&&ACT.wquit){ ACT.wquit(); return true; } /* Région Néon */
    if(view==='race'&&RC) return true;                                     /* course : on reste (le bouton Quitter est dans l'écran) */
    if(typeof HUB!=='undefined'&&view==='hub'&&HUB.map&&HUB.map!=='garage'&&typeof growExit==='function'){ growExit(); return true; }
    if(view!=='garage'){ view='garage'; render(); return true; }
    return false; }catch(e){ return false; } };

/* ---------- 3b. sauvegarde illisible : on garde une copie avant de repartir de zéro (avant, la partie neuve écrasait tout) ---------- */
{ const _ld74=load; load=function(){ try{ const raw=localStorage.getItem(KEY); if(raw){ try{ JSON.parse(raw); }catch(e){ const k=KEY+'_illisible_'+Date.now(); localStorage.setItem(k,raw); console.warn('sauvegarde illisible, copie dans',k);
        setTimeout(()=>{ try{ toast('⚠️ Sauvegarde illisible : une copie a été gardée. Nouvelle partie.'); }catch(_){} },3500); } } }catch(_){} return _ld74.apply(this,arguments); }; }

/* ---------- 4. flipper : expérience et classement ---------- */
{ const k='Nakai'; if(ARCR&&ARCR.pin&&ARCR.pin[0]&&ARCR.pin[0][0]===k) ARCR.pin=[['Nakai',250000],['Vega',140000],['Quill',80000],['Ibarra',35000],['Brandt',12000]]; }
/* l'XP du flipper est calculée dans rewards() (fermeture de GAMES.pin) : on corrige après coup le gain (score/25 → 8·√score, identique à 40 000 points) */
{ const _pin74=GAMES.pin; GAMES.pin=function(api){ const P=pbS(), lv0=P.lv, xp0=P.xp, end0=api.end;
    const api2=Object.assign({},api,{end:(score,note)=>{ try{ const lin=Math.floor(Math.max(0,score)/25), soft=Math.floor(8*Math.sqrt(Math.max(0,score)));
        if(soft<lin){ /* refait la montée de niveau avec le gain adouci */ const caps=Math.max(0,(P.xp-xp0)+[...Array(Math.max(0,P.lv-lv0))].reduce((a,_,i)=>a+pbNeed(lv0+i),0)-lin);
          let xp=xp0+soft+caps, lv=lv0; while(lv<PB_MAXLV&&xp>=pbNeed(lv)){ xp-=pbNeed(lv); lv++; } P.lv=lv; P.xp=xp;
          if(typeof note==='string') note=note.replace(/<b>\+[\d   ]+ XP<\/b> · niveau \d+[^<]*/,`<b>+${fmt(soft+caps)} XP</b> · niveau ${P.lv}${P.lv>=PB_MAXLV?' (max)':` · ${fmt(P.xp)}/${fmt(pbNeed(P.lv))}`}`).replace(/<span class="pbup">⬆ NIVEAU \d+ !<\/span>/,P.lv>lv0?`<span class="pbup">⬆ NIVEAU ${P.lv} !</span>`:'');
          try{ save(); }catch(_){} } }catch(_){} return end0(score,note); }});
    return _pin74.call(this,api2); }; }
