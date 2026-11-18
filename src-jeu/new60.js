/* ===== v1.7 · 1/2 : récap de fin (barre d'XP du véhicule, gains, vitesse max), Rue Néon dans le métro,
   badges d'arène sur la carte pilote, textures du garage ===== */

/* ---------- 1. journal de l'XP gagnée par chaque voiture pendant une course ou un duel ---------- */
let CXL60=null;
{ const _a=addCarXP; addCarXP=function(c,n){ const l0=c&&c.lvl, x0=c&&c.xp, r=_a.apply(this,arguments);
  if(CXL60&&c){ let e=CXL60.find(q=>q.uid===c.uid); if(!e){ e={uid:c.uid,l0,x0,g:0}; CXL60.push(e); } e.g+=n; e.l1=c.lvl; e.x1=c.xp; } return r; }; }
function xpBars60(cx){ return (cx||[]).map(e=>{ const c=car(e.uid); if(!c) return ''; const max=e.l1>=50, n1=60*e.l1, up=e.l1>e.l0, w0=up?0:Math.round(e.x0/(60*e.l0)*100), w1=max?100:Math.round(e.x1/n1*100);
  return `<div class="xb60 ${up?'up':''}" data-w1="${w1}"><div class="xb-h"><b>${M[c.mid].nom}${c.sh?' ✨':''}</b><span>Niv. ${e.l1}${up?` <em>▲ niveau ${e.l1} !</em>`:''}</span></div>
    <div class="xb-bar"><i style="--w0:${w0}%;--w1:${w1}%"></i></div><small><b>+${fmt(e.g)} XP</b> · ${max?'niveau max':fmt(e.x1)+' / '+fmt(n1)+' XP'}</small></div>`; }).join(''); }
function xpAnim60(){ setTimeout(()=>document.querySelectorAll('.xb60').forEach(el=>{ const i=el.querySelector('i'); if(i&&!el.dataset.done){ el.dataset.done=1; i.style.width=el.dataset.w1+'%'; } }),120); }
const rcRow60=(ic,l,v)=>`<div class="rc60-r"><i>${ic}</i><span>${l}</span><b>${v}</b></div>`;

/* ---------- 2. vitesse max atteinte pendant la manche (lue sur le compteur) ---------- */
let VMX60=0;
setInterval(()=>{ try{ if(!RC||RC.done){ if(!RC) VMX60=0; return; } const e=document.getElementById('hSpd'); if(!e) return; const v=parseInt((e.textContent||'').replace(/\D/g,''),10)||0; if(v>VMX60&&v<800) VMX60=v; }catch(_){} },100);
{ const _so=showOver; showOver=function(row){ if(row&&row.vmx==null){ row.vmx=VMX60; VMX60=0; } const r=_so.apply(this,arguments);
  try{ const ov=$('over'), b=ov&&ov.querySelector('[data-a="nextm"]'); if(b&&row&&row.vmx&&!ov.querySelector('.vmx60')) b.insertAdjacentHTML('beforebegin',`<div class="vmx60">🏁 Vitesse max atteinte : <b>${fmt(row.vmx)} km/h</b></div>`); }catch(_){} return r; }; }

/* ---------- 3. fin d'épreuve : fiche récapitulative ---------- */
{ const _f=finalize; finalize=function(){ CXL60=[]; try{ return _f.apply(this,arguments); } finally{ if(R&&R.result) R.result.cx=CXL60; CXL60=null; xpAnim60(); } }; }
{ const _v=vResult; vResult=function(){ const h=_v.apply(this,arguments), r=R&&R.result; if(!r) return h;
  const cx=r.cx||CXL60||[], vm=Math.max(0,...(r.rows||[]).map(x=>x.vmx||0));
  const card=`<div class="rc60 ${r.win?'win':''}"><div class="rc60-t">${r.win?'🏆 Récap de ta victoire':r.pod?'🥈 Récap du podium':'📋 Récap de l’épreuve'}</div>
    ${rcRow60('💰','Crédits','+'+fmt(r.gain)+' cr'+(r.first?' <small>(×2 première victoire)</small>':''))}${rcRow60('⭐','XP pilote','+'+fmt(r.xp))}${r.tok?rcRow60('🎟','Jetons','+'+r.tok):''}
    ${vm?rcRow60('🏁','Vitesse max','<span class="rc60-v">'+fmt(vm)+' km/h</span>'):''}${rcRow60('🚗','Manches',(r.rows||[]).filter(x=>x.won).length+' gagnée'+((r.rows||[]).filter(x=>x.won).length>1?'s':'')+' / '+(r.rows||[]).length)}
    ${cx.length?`<div class="rc60-s">XP des véhicules</div>${xpBars60(cx)}`:''}</div>`;
  const k=h.indexOf('<p class="note">'); return k>=0?h.slice(0,k)+card+h.slice(k):h+card; }; }
{ const _r=render; render=function(){ const r=_r.apply(this,arguments); if(view==='result') xpAnim60(); return r; }; }

/* ---------- 4. fin de duel : barres d'XP et gains ---------- */
{ const _cf=cbFinish; cbFinish=function(){ CXL60=[]; let r; try{ r=_cf.apply(this,arguments); } finally{ if(CBV&&CBV.res) CBV.res.cx=CXL60; CXL60=null; } try{ cbMenu(); xpAnim60(); }catch(_){} return r; }; }
cbEndHTML=function(){ const r=CBV.res||{xp:[]}, win=CBV.B.over===0, fresh=(r.xp||[]).filter(q=>q[2]&&q[2].fresh&&q[2].fresh.length);
  return `<div class="cb-end ${win?'win':'lose'}"><div class="cb-et">${win?'🏆 VICTOIRE':'💥 DÉFAITE'}</div>${CBV.o.endMsg?`<p class="cb-note">${CBV.o.endMsg}</p>`:''}
    <div class="rc60 cb">${r.cx&&r.cx.length?`<div class="rc60-s">XP des véhicules</div>${xpBars60(r.cx)}`:(win?'<p class="cb-note">Aucune XP gagnée.</p>':'<p class="cb-note">Défaite : pas d’XP pour ce duel.</p>')}
    ${fresh.map(([n,xp,lr])=>`<div class="rc60-new">✨ ${n} apprend : ${lr.fresh.map(id=>CB_MV[id].n).join(', ')}</div>`).join('')}</div>
    ${CBV.o.rewardHTML?CBV.o.rewardHTML(win):''}<button class="btn wide" data-cb="close">Continuer</button></div>`; };
/* les gains des pilotes de rue et des champions s'affichent dans le récap du duel */
{ const _rf=rueFight; rueFight=function(id){ const r=_rf.apply(this,arguments); try{ if(CBV&&CBV.o&&RUE.fight){ const P=rueGet(id), champ=P.k==='c';
  CBV.o.rewardHTML=w=>{ const F=RUE.fight||{}; if(!w) return `<div class="cb-rw lose">${P.nm} remporte le duel</div>`;
    return `<div class="rc60 cb">${F.badge?`<div class="rue-got">${rueBadgeHTML(P,1)}<b>${P.bn} obtenu !</b></div>`:''}<div class="rc60-s">Gains contre ${P.nm}</div>${(F.got||[]).map(g=>rcRow60('🎁','',g)).join('')}</div>`; }; } }catch(_){} return r; }; }

/* ---------- 5. métro : la Rue Néon mène à la nouvelle Rue Néon (pilotes et champions) ---------- */
try{ const D=DEST.find(d=>d.id==='street'); if(D){ D.d='Les pilotes de rue et les 8 champions d’arène, badges à gagner.'; D.ok=()=>cbAwake(); D.why='Après l’éveil cosmique (niveau '+CB_LV+')'; } }catch(e){}
const goRue60=()=>{ try{ closeSheet(); }catch(_){} try{ musicStop(); }catch(_){} AR.tab='rue'; if(typeof HUB!=='undefined'&&HUB.map==='street') HUB.map='garage'; ACT.tab({id:'arena'}); };
{ const _wt=ACT.wtravel; ACT.wtravel=function(d){ if(d&&d.id==='street'){ if(!cbAwake()) return toast('🔒 La Rue Néon s’ouvre après l’éveil cosmique (niveau '+CB_LV+')'); return goRue60(); } return _wt.apply(this,arguments); }; }
{ const _ge=growEnter; growEnter=function(room){ if(room==='street') return cbAwake()?goRue60():toast('🔒 La Rue Néon s’ouvre après l’éveil cosmique'); return _ge.apply(this,arguments); }; }
try{ if(typeof HUB!=='undefined'&&HUB.map==='street') HUB.map='garage'; }catch(_){}

/* ---------- 6. carte pilote : badges d'arène ---------- */
{ const _rs=renderSheet; renderSheet=function(){ const r=_rs.apply(this,arguments); try{ if(sheet&&sheet.t==='pilot'&&cbAwake()){ const pc=document.querySelector('#sheet .pcard'); if(pc&&!document.querySelector('#sheet .pbdg60')){ const nb=rueNB();
  pc.insertAdjacentHTML('afterend',`<button class="pbdg60" data-a="rue60b"><div class="pb-h"><b>🎖️ Badges d’arène</b><span>${nb}/8</span></div><div class="pb-row">${RUE_CH.map(c=>rueBadgeHTML(c)).join('')}</div><small>${nb>=8?'Tous les champions sont battus !':'Prochain champion : '+RUE_CH[Math.min(7,nb)].nm+' (niv. '+RUE_CH[Math.min(7,nb)].lv+')'}</small></button>`); } } }catch(e){ console.warn('pbdg',e); } return r; }; }
ACT.rue60b=()=>{ AR.tab='badges'; try{ closeSheet(); }catch(_){} ACT.tab({id:'arena'}); };

/* ---------- 7. garage : sol et murs texturés (même esprit que la ville néon) ---------- */
function garTex60(){ let sd=5; const rn=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  const fl=ctex(1024,1024,(x,W,H)=>{ x.fillStyle='#17151f'; x.fillRect(0,0,W,H);
    for(let i=0;i<16;i++) for(let j=0;j<16;j++){ const v=20+Math.floor(rn()*10); x.fillStyle=`rgb(${v},${v-1},${v+8})`; x.fillRect(i*64+2,j*64+2,60,60); }
    for(let i=0;i<14000;i++){ x.fillStyle=`rgba(255,255,255,${rn()*.05})`; x.fillRect(rn()*W,rn()*H,2,2); }
    x.lineCap='round'; for(let i=0;i<10;i++){ x.strokeStyle=`rgba(0,0,0,${.25+rn()*.25})`; x.lineWidth=14+rn()*10; x.beginPath(); const a=rn()*6.3, R=150+rn()*300; x.arc(W/2,H/2,R,a,a+1+rn()*1.8); x.stroke(); }
    [[.205,'#00e5ff',5],[.39,'#ff2bd6',4]].forEach(([r,c,w])=>{ x.strokeStyle=c; x.lineWidth=w; x.globalAlpha=.75; x.setLineDash([46,26]); x.beginPath(); x.arc(W/2,H/2,W*r,0,7); x.stroke(); }); x.setLineDash([]); x.globalAlpha=1;
    x.fillStyle='#f2d34a'; for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; x.save(); x.translate(W/2+Math.cos(a)*W*.46,H/2+Math.sin(a)*W*.46); x.rotate(a+Math.PI/4); x.fillRect(-14,-4,28,8); x.restore(); } });
  fl.wrapS=fl.wrapT=THREE.ClampToEdgeWrapping; fl.anisotropy=4;
  const wl=ctex(1024,256,(x,W,H)=>{ x.fillStyle='#14111f'; x.fillRect(0,0,W,H);
    for(let p=0;p<8;p++){ const px=p*128; x.fillStyle=p%2?'#1b1730':'#191428'; x.fillRect(px+3,0,122,H); x.fillStyle='#0b0a14'; x.fillRect(px,0,3,H);
      for(let r=0;r<5;r++) for(let c=0;c<4;c++){ const on=rn()<.35; x.fillStyle=on?(rn()<.3?'#7fe8ff':rn()<.3?'#ff7ae0':'#ffd27a'):'#0d0d1a'; x.fillRect(px+14+c*27,26+r*18,16,9); } }
    x.fillStyle='#262233'; x.fillRect(0,H*.62,W,H*.38); for(let i=0;i<W;i+=48){ x.fillStyle='#1d1a29'; x.fillRect(i,H*.62,46,H*.38); }
    x.fillStyle='#00e5ff'; x.fillRect(0,H*.6,W,4); x.fillStyle='#ff2bd6'; x.fillRect(0,H*.96,W,4);
    ['GARAGE','PNEUS','MOTEUR','NÉON','TUNING','HIGH & ROUILLÉ'].forEach((t,i)=>{ const cx=80+i*170, col=['#00e5ff','#ff2bd6','#fcee0a','#8fffc8','#ff7a1a','#c39bff'][i]; x.strokeStyle=col; x.lineWidth=3; x.strokeRect(cx-60,H*.66,120,30); x.fillStyle=col; x.font='bold 18px system-ui,sans-serif'; x.textAlign='center'; x.fillText(t,cx,H*.66+22); }); },[6,1]);
  return {fl,wl}; }
{ const _bg=buildGarage; buildGarage=function(){ const r=_bg.apply(this,arguments); try{ const sc=GG.scene, T=garTex60();
  sc.traverse(o=>{ if(!o.isMesh||!o.geometry||!o.geometry.parameters) return; const g=o.geometry, p=g.parameters;
    if(g.type==='CircleGeometry'&&p.radius===30){ o.material.map&&o.material.map.dispose(); o.material.dispose(); o.material=new THREE.MeshLambertMaterial({map:T.fl}); }
    else if(g.type==='CylinderGeometry'&&p.openEnded&&p.radiusTop===30){ o.material.map&&o.material.map.dispose(); o.material.dispose(); o.material=new THREE.MeshBasicMaterial({map:T.wl,side:THREE.BackSide}); } }); }catch(e){ console.warn('garage tex',e); } return r; }; }
