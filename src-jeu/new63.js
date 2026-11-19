/* ===== v2.1 · 1/3 : jetons Néo, altérations dans les boîtes de duel, accrochage + orbite à la rencontre sauvage,
   caméra d'ultime, fiche de combat avant d'ajouter une voiture à l'équipe ===== */

/* ---------- 1. jetons Néo : la monnaie de l'Arène (différente des crédits du jeu) ---------- */
function neoN(){ return S.neo||0; }
function neoT(n){ return fmt(n)+' ◈ Néo'; }
{ const _r=render; render=function(){ const r=_r.apply(this,arguments); try{ if(cbAwake()){
    if(!S.neoInit){ S.neoInit=1; S.neo=(S.neo||0)+600; save(); toast('◈ 600 jetons Néo offerts pour l’Arène'); }
    const m=document.querySelector('#top .money'); if(m&&!m.querySelector('.neo')){ const tk=m.querySelector('.tk'), h=`<small class="neo" title="Jetons Néo : la monnaie de l’Arène">◈ ${fmt(neoN())}</small>`; tk?tk.insertAdjacentHTML('afterend',h):m.insertAdjacentHTML('beforeend',h); } } }catch(e){} return r; }; }

/* ---------- 2. boîtes de duel : toutes les altérations avec leur nom ---------- */
cbBoxHTML=function(s){ const B=CBV.B, f=B.sides[s].team[CBV.shown[s]], hp=Math.max(0,CBV.disp.get(f)), p=hp/f.mhp;
  const stg=Object.keys(f.stage).filter(k=>f.stage[k]).map(k=>`<i class="${f.stage[k]>0?'up':'dn'}">${CB_STAGE_N[k].slice(0,4)} ${f.stage[k]>0?'+':''}${f.stage[k]}</i>`).join('');
  const chips=(f.status?[`<span class="cbx st" style="--sc:${CB_ST[f.status.id].c}" title="${CB_ST[f.status.id].d||''}">${CB_ST[f.status.id].ic} ${CB_ST[f.status.id].n}</span>`]:[])
    .concat(Object.keys(f.vol).filter(k=>CB_VOL[k]&&k!=='flinch').map(k=>`<span class="cbx vl" style="--sc:#c39bff" title="${CB_VOL[k].d||''}">${CB_VOL[k].ic} ${CB_VOL[k].n}</span>`)).join('');
  const dots=B.sides[s].team.map((x,i)=>`<b class="${x.hp<=0?'ko':''} ${i===B.sides[s].act?'on':''}"></b>`).join('');
  return `<div class="cb-nm"><b>${f.nm}</b><span>Niv. ${f.lv}</span></div><div class="cb-tys">${f.ty.map(t=>`<span style="--tc:${CB_TYPES[t].c}">${CB_TYPES[t].ic}</span>`).join('')}<span class="cb-team">${dots}</span></div>
    <div class="cb-hp"><i style="width:${(p*100).toFixed(1)}%;background:${cbHpCol(p)}"></i></div><div class="cb-hpn">${s===0?`${hp} / ${f.mhp}`:Math.round(p*100)+' %'}</div>
    <div class="cb-en ${f.energy>=CB_ENERGY.max?'full':''}" title="Jauge d’ultime"><i style="width:${Math.min(100,f.energy/CB_ENERGY.max*100)}%"></i><span>⚡ ULTIME ${f.energy>=CB_ENERGY.max?'PRÊTE':Math.round(f.energy)+'%'}</span></div>
    ${chips?`<div class="cb-sts">${chips}</div>`:''}${stg?`<div class="cb-stg">${stg}</div>`:''}`; };

/* ---------- 3. rencontre sauvage : accrochage léger, orbite à 240° autour des deux voitures, puis la musique et le duel ---------- */
function crash62(){ try{ arcTone(150,.16,'sawtooth',.28); arcTone(62,.28,'sine',.38); setTimeout(()=>{ arcTone(1900,.05,'square',.1); sfx50(1300,.08,'square',.08,420); },35); setTimeout(()=>arcTone(780,.04,'square',.07),90); whoosh50(.2,.2); vib50([35,25,60]); }catch(_){} }
wEncounter=function(w){ if(W.fight||CBV||W.orbit) return; W.fight={w};
  const [l0,l1]=wRouteLv(w.R.k), lv=l0+Math.floor(Math.random()*(l1-l0+1)), ty=cbTypesOf(w.mid), iv={}; CB_SK.forEach(k=>iv[k]=6+Math.floor(Math.random()*14));
  const foe={mid:w.mid,lv:clamp(lv,1,CB_LVMAX),iv,tal:(CB_TAL_BY[ty[0]]||CB_TAL_BY.meca)[Math.floor(Math.random()*4)]}, cr=Math.round((60+lv*25)/10)*10;
  crash62(); const ov=$('wov'); if(ov){ const f=document.createElement('div'); f.className='w-hit'; f.innerHTML='<b>ACCROCHAGE !</b>'; ov.appendChild(f); setTimeout(()=>f.remove(),1500); }
  const cx=(W.p.x+w.g.position.x)/2, cz=(W.p.z+w.g.position.z)/2, a0=Math.atan2(W.cam.position.z-cz,W.cam.position.x-cx);
  const startDuel=()=>{ if(!W.on){ W.fight=null; return; } $('wov')&&$('wov').classList.add('duel');
    cbStartDuel({team:cbTeam(),foes:[foe],d:lv<12?1:2,names:['Toi',M[w.mid].nom+' sauvage'],trainer:false,
      rewardHTML:win=>win?`<div class="rc60 cb"><div class="rc60-s">Voiture sauvage battue</div>${rcRow60('◈','Jetons Néo','+'+fmt(cr))}</div>`:`<div class="cb-rw lose">Tu es remorqué jusqu’à ${W_TOWNS[Math.max(0,W.town)].nm}</div>`,
      onEnd:res=>{ W.fight.win=!!res.win; const s=cbSt(); if(res.win){ s.w++; S.neo=(S.neo||0)+cr; } else s.l++; save(); },
      onClose:()=>{ const F=W.fight; W.fight=null; if(!F) return; F.w.off=25; W.grace=4; if(!F.win){ wSpawn(W.town>=0?W.town:0); } } });
    if(!CBV){ W.fight=null; $('wov')&&$('wov').classList.remove('duel'); } };
  W.orbit={t:0,dur:1.55,cx,cz,r:11,a0,sw:Math.PI*4/3,done:0,cb:startDuel}; };
{ const _wt=wTick; wTick=function(dt){ const r=_wt.apply(this,arguments); const o=W.orbit; if(o&&W.on){ o.t+=Math.min(dt,.05); const u=clamp(o.t/o.dur,0,1), e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2, a=o.a0+o.sw*e, sh=o.t<.35?(.35-o.t)*1.1:0, cam=W.cam;
      cam.position.set(o.cx+Math.cos(a)*o.r+(Math.random()-.5)*sh,4.2+Math.sin(u*Math.PI)*2.6+(Math.random()-.5)*sh*.5,o.cz+Math.sin(a)*o.r+(Math.random()-.5)*sh); cam.lookAt(o.cx,1.1,o.cz);
      if(u>=1&&!o.done){ o.done=1; W.orbit=null; W.camI=0; o.cb(); } }
    return r; }; }

/* ---------- 4. caméra d'ultime : devant la voiture qui charge, puis le projectile jusqu'à l'adversaire, puis retour (≈ 4,2 s) ---------- */
const CBU={T1:1.5,T2:2.7,T3:2.95,END:4.2};
const cbUlt3dOn=()=>CB3.on&&CB3.cam&&CB3.sc;
{ const _fit=cb3dFit; cb3dFit=function(){ const r=_fit.apply(this,arguments); try{ if(!CB3.U&&CB3.cam){ CB3.home={p:CB3.cam.position.clone(),d:CB3.cam.getWorldDirection(new THREE.Vector3())}; } }catch(_){} return r; }; }
const _cbLegendOld=cbLegend;
cbLegend=async function(e){ if(!cbUlt3dOn()||!CB3.g[e.s]||!CB3.g[1-e.s]||CB3.U) return _cbLegendOld.apply(this,arguments); return cbUlt3d(e); };
async function cbUlt3d(e){ const ar=$('cbAr'), m=CB_MV[e.id]; if(!ar||!m||!CBV) return; const T=CB_TYPES[m.t]||CB_TYPES.meca, leg=cbIsLeg(m), K=CBV.fast?.4:1, s=e.s, sc=CB3.sc, cam=CB3.cam;
  const A=CB3.g[s].g.position.clone(), B=CB3.g[1-s].g.position.clone(), d=new THREE.Vector3(B.x-A.x,0,B.z-A.z).normalize(), perp=new THREE.Vector3(-d.z,0,d.x), col=new THREE.Color(T.c);
  if(!CB3.home) CB3.home={p:cam.position.clone(),d:cam.getWorldDirection(new THREE.Vector3())};
  const ov=document.createElement('div'); ov.className='cbleg cb3u'+(leg?' leg':''); ov.style.setProperty('--tc',T.c); ov.style.setProperty('--d',Math.round(2700*K)+'ms');
  ov.innerHTML=`<div class="lg-dim"></div><div class="lg-ban"><small>${leg?'⭐ ATTAQUE LÉGENDAIRE':'✦ ATTAQUE ULTIME'}</small><b>${T.ic} ${m.n}</b></div><div class="lg3-flash"></div>`; ar.appendChild(ov);
  /* objets 3D : orbe d'énergie, particules qui convergent, traînée, onde de choc */
  const mk=(r,o)=>new THREE.Mesh(new THREE.SphereGeometry(r,16,12),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false}));
  const orb=mk(.5,.8), halo=mk(.85,.2), core=new THREE.Mesh(new THREE.SphereGeometry(.14,12,10),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85})); orb.add(core); orb.add(halo); sc.add(orb);
  const N=70, base=[]; for(let i=0;i<N;i++){ const a=Math.random()*6.283, b=Math.acos(2*Math.random()-1), r=2.4+Math.random()*1.4; base.push([Math.sin(b)*Math.cos(a)*r,Math.cos(b)*r,Math.sin(b)*Math.sin(a)*r]); }
  const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(N*3),3)); const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:col,size:.22,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})); sc.add(pts);
  const trail=[]; for(let i=0;i<14;i++){ const t=mk(.38-i*.02,.5-i*.03); t.visible=false; sc.add(t); trail.push(t); }
  const ring=new THREE.Mesh(new THREE.RingGeometry(.6,.9,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false})); ring.rotation.x=-Math.PI/2; sc.add(ring);
  const light=new THREE.PointLight(col,0,18); sc.add(light);
  const U=CB3.U={t:0,K,s,A,B,d,perp,orb,halo,pts,pg,base,trail,ring,light,hit:false,fired:false,col,ov,ar,leg,m,cam,hist:[],resolve:null,last:null};
  ar.classList.add('cb3d-ult');
  try{ czTone(70,leg?700:520,1.4*K,'sawtooth',.07); czTone(140,1500,1.4*K,'triangle',.03); cbSfx('cast',m.t); }catch(_){}
  await new Promise(res=>{ U.resolve=res; }); }
const ez=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
function ultTick(dt){ const U=CB3.U; if(!U) return; U.t+=Math.min(dt,.05)/U.K; const t=U.t, cam=U.cam, A=U.A, B=U.B, d=U.d, pp=U.perp, home=CB3.home;
  const lookHome=home.p.clone().addScaledVector(home.d,40), V=THREE.Vector3;
  const Af=new V(A.x,A.y+.9,A.z), Bf=new V(B.x,B.y+.9,B.z), cen=Af.clone().addScaledVector(d,2.3), look=new V(), pos=new V();
  if(t<CBU.T1){ /* charge : on glisse vers l'avant de la voiture, l'orbe grossit, les particules convergent */
    const u=ez(clamp(t/1.1,0,1)), Pf=Af.clone().addScaledVector(d,6.4-clamp((t-1.1)/.4,0,1)*.7).addScaledVector(pp,1.5); Pf.y=Af.y+.9;
    pos.copy(home.p).lerp(Pf,u); look.copy(lookHome).lerp(Af.clone().addScaledVector(d,.8),u); cam.position.copy(pos); cam.lookAt(look);
    const k=clamp(t/CBU.T1,0,1), pul=1+.12*Math.sin(t*22); U.orb.position.copy(cen); U.orb.scale.setScalar((.12+.78*k*k)*pul); U.orb.visible=true;
    const att=U.pts.geometry.attributes.position, rot=t*5.5, cr=Math.cos(rot), sr=Math.sin(rot), conv=1-k*.88; for(let i=0;i<U.base.length;i++){ const b=U.base[i]; att.setXYZ(i,cen.x+(b[0]*cr-b[2]*sr)*conv,cen.y+b[1]*conv,cen.z+(b[0]*sr+b[2]*cr)*conv); } att.needsUpdate=true; U.pts.visible=true;
    if(!U.charged&&t>.2){ U.charged=true; CB3.A[U.s].glow=CB3.t; } }
  else if(t<CBU.T2){ /* tir : l'orbe file vers l'adversaire, la caméra le suit */
    if(!U.fired){ U.fired=true; CB3.A[U.s].lunge=CB3.t; U.pts.visible=false; try{ czTone(300,900,.9*U.K,'sawtooth',.06); whoosh50(.5,.18); }catch(_){} }
    const u=clamp((t-CBU.T1)/(CBU.T2-CBU.T1),0,1), pr=Math.pow(u,1.6), pj=cen.clone().lerp(Bf,pr);
    U.orb.position.copy(pj); U.orb.scale.setScalar(.85*(1-.2*u)*(1+.1*Math.sin(t*30)));
    U.hist.unshift(pj.clone()); if(U.hist.length>40) U.hist.pop(); U.trail.forEach((tr,i)=>{ const h=U.hist[Math.min(U.hist.length-1,(i+1)*2)]; if(h){ tr.visible=true; tr.position.copy(h); } });
    const Pf0=Af.clone().addScaledVector(d,4.9).addScaledVector(pp,1.5); Pf0.y=Af.y+.9; const Pc=pj.clone().addScaledVector(d,-5.2).addScaledVector(pp,1.7); Pc.y=pj.y+1.3;
    pos.copy(Pf0).lerp(Pc,ez(clamp((t-CBU.T1)/.3,0,1))); look.copy(pj).addScaledVector(d,2.4); cam.position.copy(pos); cam.lookAt(look); U.camLast=pos.clone(); U.lookLast=look.clone(); }
  else if(t<CBU.T3){ /* impact : onde de choc, flash, secousse */
    if(!U.hit){ U.hit=true; U.orb.visible=false; U.trail.forEach(tr=>tr.visible=false); U.ring.position.set(B.x,.15,B.z); U.ring.material.opacity=.9; U.light.position.set(B.x,2.4,B.z); const f=U.ov.querySelector('.lg3-flash'); if(f) f.classList.add('on');
      try{ czBoom(U.leg?1.1:.8,U.leg?.75:.55); ar_shake(U.ar); vib50(U.leg?[40,30,80]:[30,20,40]); }catch(_){} U.impT=t; }
    const u=clamp((t-U.impT)/(CBU.T3-U.impT),0,1), sh=(1-u)*.5; U.ring.scale.setScalar(1+u*7); U.ring.material.opacity=.9*(1-u); U.light.intensity=6*(1-u);
    const pj=Bf.clone(), Pc=pj.clone().addScaledVector(d,-5.2).addScaledVector(pp,1.7); Pc.y=pj.y+1.3; pos.copy(Pc); pos.x+=(Math.random()-.5)*sh; pos.y+=(Math.random()-.5)*sh*.6; look.copy(pj).addScaledVector(d,1); cam.position.copy(pos); cam.lookAt(look); U.camLast=Pc.clone(); U.lookLast=look.clone(); }
  else if(t<CBU.END){ /* retour en douceur à la caméra normale */
    const u=ez(clamp((t-CBU.T3)/(CBU.END-CBU.T3),0,1)); pos.copy(U.camLast).lerp(home.p,u); look.copy(U.lookLast).lerp(lookHome,u); cam.position.copy(pos); cam.lookAt(look);
    U.ring.material.opacity=0; U.light.intensity=0; }
  else { ultEnd(); return; }
  if(U.resolve&&t>=CBU.T2+.45){ const r=U.resolve; U.resolve=null; r(); } }
function ar_shake(a){ if(!a) return; a.classList.remove('cb-shake'); void a.offsetWidth; a.classList.add('cb-shake'); setTimeout(()=>a.classList.remove('cb-shake'),420); }
function ultEnd(){ const U=CB3.U; if(!U) return; CB3.U=null; const home=CB3.home; try{ U.cam.position.copy(home.p); U.cam.lookAt(home.p.clone().addScaledVector(home.d,40)); }catch(_){}
  [U.orb,U.pts,U.ring,U.light,...U.trail].forEach(o=>{ try{ CB3.sc&&CB3.sc.remove(o); if(o.geometry) o.geometry.dispose(); if(o.material) o.material.dispose(); }catch(_){} });
  try{ U.ov.remove(); U.ar.classList.remove('cb3d-ult'); }catch(_){} if(U.resolve){ const r=U.resolve; U.resolve=null; r(); } }
{ const _tk=cb3dTick; cb3dTick=function(dt){ const r=_tk.apply(this,arguments); try{ if(CB3.U) ultTick(dt); }catch(e){ console.warn('ult',e); ultEnd(); } return r; }; }
{ const _st=cb3dStop; cb3dStop=function(){ if(CB3.U){ try{ CB3.U=null; }catch(_){} } return _st.apply(this,arguments); }; }

/* ---------- 5. équipe : on ouvre d'abord la fiche de COMBAT (rien sur la vitesse max…), puis on confirme ---------- */
const _cbToggle=ACT.cbteampick;
ACT.cbteampick=function(d){ const c=car(+d.id); if(!c) return; openSheet({t:'cbcard',uid:c.uid}); try{ ui('click'); }catch(_){} };
ACT.cbteamtoggle=function(d){ _cbToggle.call(this,d); try{ closeSheet(); }catch(_){} if(view==='arena') render(); };
{ const _sx=sheetExtra; sheetExtra=function(X){ if(sheet&&sheet.t==='cbcard'){ const c=car(sheet.uid); if(!c){ closeSheet(); return true; } const sel=cbTeam(), k=sel.indexOf(c.uid), full=sel.length>=4;
    const body=cbCarHTML(c).replace('<h3>⚔️ Fiche de combat</h3>','');
    $('sheet').innerHTML=`${X}<h2>⚔️ ${M[c.mid].nom}${c.sh?' ✨':''}</h2><p class="note">Vérifie la fiche de combat avant de l’ajouter à ton équipe d’Arène.</p>${body}
      <div class="tu-btns cbcard-b"><button class="btn alt" data-a="close">Annuler</button><button class="btn ${k>=0?'alt':''}" data-a="cbteamtoggle" data-id="${c.uid}" ${k<0&&full?'disabled':''}>${k>=0?'➖ Retirer de l’équipe':full?'Équipe pleine (4)':'➕ Ajouter à l’équipe'}</button></div>`; return true; } return _sx.apply(this,arguments); }; }
{ const _mv=ACT.cbmv; ACT.cbmv=function(d){ if(sheet&&sheet.t==='cbcard') CBFC=+d.id; return _mv.apply(this,arguments); };
  const _bk=ACT.cbback; ACT.cbback=function(d){ if(CBFC&&+d.id===CBFC){ CBFC=0; return openSheet({t:'cbcard',uid:+d.id}); } return _bk.apply(this,arguments); }; }
let CBFC=0;
