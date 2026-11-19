/* ===== v1.6 : Arène en vraie page (comme Garage, Marché…) + duel en 3D avec les vrais modèles, vue 3/4 face à face ===== */

/* ---------- 1. page « Arène » avec sous-onglets Tournois / Équipe / Boutique ---------- */
const AR={tab:'cups'};
function vArena(){ if(!cbAwake()) return `<div class="head"><h2>Arène</h2></div><p class="note">L’Arène s’ouvre après l’éveil cosmique (niveau ${CB_LV}).</p>`;
  const st=cbSt(), t=cbTeam().map(u=>car(u)).filter(Boolean), bag=cbBag(), tl=cbTeamLv(), nb=Object.keys(st.cups).length;
  /* « arsw » et pas « topsw » : une ancienne couche efface les .topsw à chaque rendu */
  const tabs=`<div class="subtabs arsw">${[['cups','🏆 Tournois'],['team','🚗 Équipe'],['shop','🛒 Boutique']].map(x=>`<button data-a="artab" data-id="${x[0]}" ${AR.tab===x[0]?'aria-current="true"':''}>${x[1]}</button>`).join('')}</div>`+(AR.tab!=='cups'?`<button class="btn alt wide ar-back" data-a="artab" data-id="cups">← Retour aux tournois</button>`:'');
  const head=`<div class="head"><h2>Arène</h2><p>${st.w} V · ${st.l} D · ${nb}/${CB_CUPS.length} coupes</p></div>`;
  const teamRow=`<div class="ar-sec"><div class="ar-h"><b>🚗 Ton équipe · niv. ${tl}</b><button class="btn alt sm" data-a="artab" data-id="team">Modifier</button></div>
    <div class="ar-team">${t.map(c=>{ const s=cbOf(c); return `<button class="ar-car" data-a="car" data-id="${c.uid}"><span class="ar-ty">${s.ty.map(x=>CB_TYPES[x].ic).join('')}</span><b>${M[c.mid].nom}</b><small>Niv. ${s.lv} · ⚡ ${CB_MV[cbUltOf(s.ty,s.lv)].n}</small></button>`; }).join('')}</div></div>`;
  let body='';
  if(AR.tab==='cups'){
    body=teamRow+`${S.cbT?`<button class="ar-train ar-resume" data-a="arena"><b>▶ Reprendre : ${CB_CUPS[S.cbT.i].nm}</b><small>Manche ${S.cbT.r+1}/${CB_CUPS[S.cbT.i].rounds.length}</small></button>`:''}
      <button class="ar-train" data-a="cbtrain"><b>🥊 Entraînement</b><small>Un duel contre un pilote au hasard de ton niveau (XP réduite, sans récompense)</small></button>
      ${CB_CUPS.map((cup,i)=>{ const open=cupOpen(i), won=st.cups[cup.id], diff=tl<cup.lv-4?'dur':'ok';
        return `<div class="ar-cup ${open?'':'lock'} ${won?'won':''}"><div class="ar-ch"><span class="ar-ci">${cup.ic}</span><div><b>${cup.nm}</b><small>${cup.d0}</small></div></div>
          <div class="ar-pils">${cup.rounds.map(id=>`<span title="${CB_PIL[id].nm}" style="--pc:${CB_PIL[id].c}">${CB_PIL[id].ic}</span>`).join('<i>›</i>')}</div>
          <p class="note sm">Niveau conseillé ${cup.lv} · ${cup.rounds.length} manches · équipes de ${cup.team} · ${neoT(cup.round)} par manche<br>Victoire : ${cbRwTxt(cup.rw)}${won?' (35 % en rejouant)':''}</p>
          ${open?`<button class="btn wide ${diff==='dur'?'alt':''}" data-a="cbcup" data-id="${i}">${won?'🔁 Rejouer':'▶ Participer'}${diff==='dur'?' · ⚠️ difficile':''}</button>`:'<button class="btn alt wide" disabled>🔒 Gagne la coupe précédente</button>'}</div>`; }).join('')}`; }
  if(AR.tab==='team'){ const sel=cbTeam(), cars=S.cars.slice().sort((a,b)=>cbOf(b).lv-cbOf(a).lv);
    body=`<p class="note">Choisis jusqu’à 4 voitures. La première entre en piste en premier. Touche une voiture pour l’ajouter ou la retirer.</p>
      <div class="cbtm">${cars.map(c=>{ const s=cbOf(c), k=sel.indexOf(c.uid); return `<button class="cbtm-r ${k>=0?'on':''}" data-a="cbteampick" data-id="${c.uid}"><span class="cbtm-n" data-a="cbtmq" data-id="${c.uid}" role="button" aria-label="Ajouter ou retirer de l'équipe">${k>=0?k+1:''}</span><span class="cbtm-th">${thArt(c)}</span><div><b>${M[c.mid].nom}</b><small>Niv. ${s.lv} · ${s.ty.map(x=>CB_TYPES[x].ic+' '+CB_TYPES[x].n).join(' / ')} · ${CB_TAL[s.tal].n}<br>⚡ Ultime : ${CB_MV[cbUltOf(s.ty,s.lv)].n}</small></div></button>`; }).join('')}</div>`; }
  if(AR.tab==='shop'){
    body=`<div class="ar-sec"><div class="ar-h"><b>🎒 Ton sac de combat</b><span class="note sm">${neoT(neoN())}</span></div><div class="ar-bag">${Object.entries(bag).filter(([k,n])=>n>0&&CB_IT[k]).map(([k,n])=>`<span>${CB_IT[k].ic} ${n}</span>`).join('')||'<span class="note">Vide</span>'}</div></div>
      <div class="cbshop">${Object.entries(CB_IT).map(([k,it])=>`<div class="cbs-r"><span class="cbs-ic">${it.ic}</span><div><b>${it.n}</b><small>${it.d} · possédé : ${bag[k]||0}</small></div><div class="cbs-b"><button class="btn sm" data-a="cbbuy" data-id="${k}" data-v="1" ${neoN()<it.px?'disabled':''}>${fmt(it.px)} ◈</button><button class="btn alt sm" data-a="cbbuy" data-id="${k}" data-v="5" ${neoN()<it.px*5?'disabled':''}>×5</button></div></div>`).join('')}</div>`; }
  return head+tabs+`<div class="arena">${body}</div>`; }
{ const _tb=ACT.tab; ACT.tab=function(d){ if(d&&d.id==='arena'){ if(!cbAwake()) return toast('🔒 L’Arène s’ouvre après l’éveil cosmique (niveau '+CB_LV+')');
    try{ if(sheet&&['arena','cbteam','cbshop'].includes(sheet.t)) closeSheet(); }catch(_){} leaveRace(); view='arena'; R=null; render(); document.querySelector('main').scrollTop=0;
    if(S.cbT&&!sheet) openSheet({t:'cbtalk',ph:S.cbT.last==='win'?'lose':S.cbT.last==='lose'?'win':'pre'}); return; }
  return _tb.apply(this,arguments); }; }
ACT.arena=()=>ACT.tab({id:'arena'});
ACT.artab=d=>{ AR.tab=d.id; if(view!=='arena') return ACT.arena(); render(); try{ ui('click'); }catch(_){} };
ACT.cbteamopen=()=>{ AR.tab='team'; ACT.arena(); }; ACT.cbshop=()=>{ AR.tab='shop'; ACT.arena(); };
{ const _p=ACT.cbteampick; ACT.cbteampick=function(){ const r=_p.apply(this,arguments); if(view==='arena') render(); return r; }; }
{ const _b=ACT.cbbuy; ACT.cbbuy=function(){ const r=_b.apply(this,arguments); if(view==='arena'){ const y=document.querySelector('main').scrollTop; render(); document.querySelector('main').scrollTop=y; } return r; }; }
/* les anciennes fenêtres « arena / cbteam / cbshop » deviennent la page */
{ const _os=openSheet; openSheet=function(s){ if(s&&s.t==='arena'){ AR.tab='cups'; try{ closeSheet(); }catch(_){} return ACT.arena(); } if(s&&(s.t==='cbteam'||s.t==='cbshop')){ AR.tab=s.t==='cbteam'?'team':'shop'; return ACT.arena(); } return _os.apply(this,arguments); }; }
arenaNav=function(){};   /* l'onglet s'allume comme les autres, d'après la page affichée */

/* ---------- 1b. un seul niveau par voiture : on reprend le meilleur des deux pour les sauvegardes existantes ---------- */
try{ if(S&&!S.lvUnified){ (S.cars||[]).forEach(c=>{ const s=S.cmb&&S.cmb[c.uid]; if(s&&s.lv>(c.lvl||1)){ c.lvl=Math.min(50,s.lv); c.xp=0; } }); S.lvUnified=1; save(); } }catch(e){ console.warn('niveaux',e); }

/* ---------- 2. duel en 3D : vrais modèles, vue 3/4 en hauteur, voitures face à face ---------- */
const CB3={on:false,sc:null,cam:null,g:[null,null],key:['',''],A:[{},{}],t:0,lights:[null,null],rings:[null,null]};
const CB3_P=[{x:-3.0,z:2.0},{x:3.8,z:-4.0}];
function cb3dScene(){
  const sc=new THREE.Scene(), col=0x150a2e; sc.background=new THREE.Color(col); sc.fog=new THREE.Fog(col,22,70);
  sc.add(new THREE.HemisphereLight(0xc8c0ff,0x2a0a4a,1.15)); const dl=new THREE.DirectionalLight(0xfff0f8,.9); dl.position.set(-6,12,8); sc.add(dl);
  const rim=new THREE.DirectionalLight(0x00e5ff,.45); rim.position.set(8,4,-10); sc.add(rim);
  /* sol : grille néon */
  const gt=ctex(256,256,(x,W,H)=>{ x.fillStyle='#14122e'; x.fillRect(0,0,W,H); x.strokeStyle='rgba(0,229,255,.28)'; x.lineWidth=2; for(let i=0;i<=8;i++){ x.beginPath(); x.moveTo(i*32,0); x.lineTo(i*32,H); x.stroke(); x.beginPath(); x.moveTo(0,i*32); x.lineTo(W,i*32); x.stroke(); } },[14,14]);
  const gr=new THREE.Mesh(new THREE.CircleGeometry(60,48),new THREE.MeshLambertMaterial({map:gt})); gr.rotation.x=-Math.PI/2; sc.add(gr);
  /* piste de l'arène : bitume, traces de pneus, fissures, marquages néon (lumineux) et emblème au centre */
  const N=1024, cx=(CB3_P[0].x+CB3_P[1].x)/2, cz=(CB3_P[0].z+CB3_P[1].z)/2, SZ=26, toPx=(x,z)=>[(x-cx)/SZ*N+N/2,(z-cz)/SZ*N+N/2];
  let sd=7; const rn=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  const at=ctex(N,N,(x,W,H)=>{ const g=x.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2); g.addColorStop(0,'#2b2a3f'); g.addColorStop(.75,'#211f33'); g.addColorStop(1,'rgba(20,18,46,0)'); x.fillStyle=g; x.fillRect(0,0,W,H);
    for(let i=0;i<9000;i++){ const r=rn(); x.fillStyle=`rgba(${r<.5?200:20},${r<.5?200:20},${r<.5?230:40},${.04+rn()*.08})`; x.fillRect(rn()*W,rn()*H,1+rn()*2.5,1+rn()*2.5); }
    for(let i=0;i<14;i++){ x.strokeStyle=`rgba(5,5,12,${.18+rn()*.25})`; x.lineWidth=10+rn()*14; x.lineCap='round'; x.beginPath(); const a0=rn()*6.3, R=120+rn()*300; x.arc(W/2+(rn()-.5)*200,H/2+(rn()-.5)*200,R,a0,a0+.8+rn()*1.6); x.stroke(); }
    x.strokeStyle='rgba(8,8,16,.55)'; x.lineWidth=2; for(let i=0;i<10;i++){ let px=rn()*W, py=rn()*H; x.beginPath(); x.moveTo(px,py); for(let k=0;k<6;k++){ px+=(rn()-.5)*80; py+=(rn()-.5)*80; x.lineTo(px,py); } x.stroke(); }
    CB3_P.forEach(p=>{ const [px,py]=toPx(p.x,p.z); const g2=x.createRadialGradient(px,py,40,px,py,200); g2.addColorStop(0,'rgba(0,0,0,.35)'); g2.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g2; x.beginPath(); x.arc(px,py,200,0,7); x.fill(); }); });
  const lt=ctex(N,N,(x,W,H)=>{ x.fillStyle='#000'; x.fillRect(0,0,W,H); x.lineCap='round';
    x.strokeStyle='#00e5ff'; x.lineWidth=7; x.beginPath(); x.arc(W/2,H/2,W*.46,0,7); x.stroke();
    x.strokeStyle='#ff2bd6'; x.lineWidth=5; x.setLineDash([40,26]); x.beginPath(); x.arc(W/2,H/2,W*.41,0,7); x.stroke(); x.setLineDash([]);
    const [ax,ay]=toPx(CB3_P[0].x,CB3_P[0].z), [bx,by]=toPx(CB3_P[1].x,CB3_P[1].z); x.strokeStyle='rgba(252,238,10,.85)'; x.lineWidth=6; x.setLineDash([30,24]); x.beginPath(); x.moveTo(ax,ay); x.lineTo(bx,by); x.stroke(); x.setLineDash([]);
    x.strokeStyle='rgba(195,155,255,.9)'; x.lineWidth=5; x.beginPath(); x.arc(W/2,H/2,64,0,7); x.stroke(); x.save(); x.translate(W/2,H/2); x.strokeStyle='rgba(195,155,255,.95)'; x.lineWidth=8; x.lineCap='round'; [-1,1].forEach(sg=>{ x.save(); x.rotate(sg*Math.PI/4); x.beginPath(); x.moveTo(0,-40); x.lineTo(0,30); x.stroke(); x.beginPath(); x.moveTo(-12,20); x.lineTo(12,20); x.stroke(); x.restore(); }); x.restore();
    x.fillStyle='rgba(0,229,255,.8)'; for(let i=0;i<36;i++){ const a=i/36*Math.PI*2; x.save(); x.translate(W/2+Math.cos(a)*W*.435,H/2+Math.sin(a)*W*.435); x.rotate(a); x.fillRect(-3,-12,6,24); x.restore(); } });
  [at,lt].forEach(t=>{ t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; t.anisotropy=4; });
  const ap=new THREE.Mesh(new THREE.PlaneGeometry(SZ,SZ),new THREE.MeshLambertMaterial({map:at,transparent:true,emissive:0xffffff,emissiveMap:lt,emissiveIntensity:.9,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})); ap.rotation.x=-Math.PI/2; ap.position.set(cx,.02,cz); sc.add(ap);
  /* plateformes */
  CB3_P.forEach((p,s)=>{ const d=new THREE.Mesh(new THREE.CylinderGeometry(2.25,2.4,.18,40),new THREE.MeshLambertMaterial({color:0x232060})); d.position.set(p.x,.09,p.z); sc.add(d);
    const r=new THREE.Mesh(new THREE.TorusGeometry(2.28,.07,8,60),new THREE.MeshBasicMaterial({color:s?0xff2bd6:0x00e5ff})); r.rotation.x=Math.PI/2; r.position.set(p.x,.2,p.z); sc.add(r); CB3.rings[s]=r;
    const l=new THREE.PointLight(s?0xff2bd6:0x00e5ff,0,9); l.position.set(p.x,1.6,p.z); sc.add(l); CB3.lights[s]=l; });
  /* ville en arrière-plan : immeubles à fenêtres */
  const facs=[0,1,2,3].map(k=>{ const t=ctex(64,128,(x,w,h)=>{ x.fillStyle=['#241b3a','#2e1f33','#1c2740','#2a2333'][k]; x.fillRect(0,0,w,h); let sd=31+k*17; const rn=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
    for(let r=0;r<10;r++) for(let c=0;c<3;c++){ const on=rn()<.45; x.fillStyle=on?(rn()<.25?'#7fe8ff':rn()<.2?'#ff7ae0':'#ffd27a'):'#0d0d1a'; x.fillRect(6+c*20,8+r*12,11,7); } }); return new THREE.MeshLambertMaterial({map:t,emissive:0x2a2418,emissiveMap:t}); });
  for(let i=0;i<34;i++){ const a=-Math.PI*.95+i*(Math.PI*1.35/34), R=34+(i%3)*5, h=8+((i*37)%17)+(i%5===0?10:0), w=6+(i%3)*2;
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),facs[i%4]); m.position.set(Math.cos(a)*R+2,h/2,Math.sin(a)*R-4); m.lookAt(2,h/2,-4); sc.add(m); }
  const stars=[]; for(let i=0;i<400;i++){ const a=Math.random()*Math.PI*2, e=.2+Math.random()*1.1; stars.push(Math.cos(a)*Math.cos(e)*90,Math.sin(e)*90,Math.sin(a)*Math.cos(e)*90); }
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(stars,3)); sc.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.4,sizeAttenuation:false,fog:false})));
  const cam=new THREE.PerspectiveCamera(35,1,.1,200); cam.position.set(-9.4,7.0,10.6); cam.lookAt(1.6,-.2,-1.4);
  return {sc,cam}; }
const cb3dYaw=s=>{ const a=CB3_P[s], b=CB3_P[1-s]; return -Math.atan2(b.z-a.z,b.x-a.x); };
function cb3dSync(){ if(!CB3.on||!CBV) return; const B=CBV.B;
  [0,1].forEach(s=>{ const f=B.sides[s].team[CBV.shown[s]]; if(!f) return; const key=CBV.shown[s]+'|'+f.mid; if(CB3.key[s]===key) return; CB3.key[s]=key;
    if(CB3.g[s]){ CB3.sc.remove(CB3.g[s].g); CB3.g[s]=null; }
    try{ const c=s===0&&f.uid?car(f.uid):null, q=buildCar(M[f.mid]||M.epave,s?'#FF2BD6':'#00E5FF',c?carLook(c):{}); q.g.rotation.order='YXZ'; CB3.sc.add(q.g); CB3.g[s]=q; }catch(e){ console.warn('cb3d car',e); }
    const T=CB_TYPES[f.ty[0]]; if(CB3.rings[s]) CB3.rings[s].material.color.set(T.c); if(CB3.lights[s]) CB3.lights[s].color.set(T.c); }); }
/* cadrage automatique : quelle que soit la taille de l'écran, ta voiture tombe en bas à gauche et le rival en haut à droite
   (on déplace la caméra dans son plan et on avance/recule jusqu'à ce que les deux voitures arrivent sur leurs cibles) */
const CB3_TGT=[[.25,.74],[.75,.43]];
function cb3dFit(W,H){ const cam=CB3.cam; if(!cam||!W||!H) return; cam.aspect=W/H; cam.fov=W/H>1.15?30:W/H>.85?33:36; cam.updateProjectionMatrix();
  /* 4 réglages : rotation autour de l'arène, distance, point visé (x, z) ; hauteur de caméra fixe en proportion (vue en plongée) */
  const look0={x:.4,y:.2,z:-1}, pts=CB3_P.map(p=>new THREE.Vector3(p.x,.75,p.z)), tmp=new THREE.Vector3();
  const place=q=>{ const a=clamp(q[0],-.5,.95), dist=clamp(17+q[1],9,30), lx=look0.x+q[2], lz=look0.z+q[3];
    cam.position.set(lx+Math.sin(a)*dist*.84,look0.y+dist*.5,lz+Math.cos(a)*dist*.84); cam.lookAt(lx,look0.y,lz); cam.updateMatrixWorld(); };
  const res=q=>{ place(q); const r=[]; pts.forEach((p,s)=>{ tmp.copy(p).project(cam); r.push((tmp.x*.5+.5)-CB3_TGT[s][0],(-tmp.y*.5+.5)-CB3_TGT[s][1]); }); return r; };
  const solve=(A,b)=>{ const n=b.length, M=A.map((row,i)=>row.concat([b[i]])); for(let c=0;c<n;c++){ let p=c; for(let r=c+1;r<n;r++) if(Math.abs(M[r][c])>Math.abs(M[p][c])) p=r; [M[c],M[p]]=[M[p],M[c]]; if(Math.abs(M[c][c])<1e-12) return null;
      for(let r=0;r<n;r++){ if(r===c) continue; const f=M[r][c]/M[c][c]; for(let k=c;k<=n;k++) M[r][k]-=f*M[c][k]; } } return M.map((row,i)=>row[n]/row[i]); };
  let q=[.2,0,0,0];
  for(let it=0;it<20;it++){ const r0=res(q), J=[0,1,2,3].map(k=>{ const h=k===0?.01:.05, q2=q.slice(); q2[k]+=h; const r1=res(q2); return r1.map((v,i)=>(v-r0[i])/h); });
    const A=[0,1,2,3].map(a=>[0,1,2,3].map(b=>J[a].reduce((s,v,i)=>s+v*J[b][i],0)+(a===b?1e-4:0))), g=[0,1,2,3].map(a=>-J[a].reduce((s,v,i)=>s+v*r0[i],0)), d=solve(A,g); if(!d) break;
    q=q.map((v,k)=>v+clamp(d[k],k===0?-.3:-4,k===0?.3:4)); if(Math.hypot(...d)<1e-4) break; }
  res(q); CB3.W=W; CB3.H=H; CB3.fitQ=q; }
function cb3dTick(dt){ if(!CB3.on||!CBV) return; CB3.t+=dt; const t=CB3.t, ar=$('cbAr'); if(!ar) return; const W=ar.clientWidth, H=ar.clientHeight;
  if(W!==CB3.W||H!==CB3.H) cb3dFit(W,H);
  [0,1].forEach(s=>{ const q=CB3.g[s], A=CB3.A[s], P=CB3_P[s], yaw=cb3dYaw(s); if(!q) return; const g=q.g, dx0=CB3_P[1-s].x-P.x, dz0=CB3_P[1-s].z-P.z, dl0=Math.hypot(dx0,dz0)||1, to={x:dx0/dl0,z:dz0/dl0};
    let x=P.x, y=.2+Math.sin(t*2.2+s)*.035, z=P.z, sc=1, rz=0, ry=yaw+Math.sin(t*.7+s)*.05, fl=0, gl=.6;
    const u=k=>A[k]==null?2:(t-A[k]);
    { const v=u('lunge')/.5; if(v<1){ const k=Math.sin(Math.PI*v)*1.5; x+=to.x*k; z+=to.z*k; } }
    { const v=u('hit')/.45; if(v<1){ x+=Math.sin(v*42)*.2*(1-v); z+=Math.cos(v*37)*.12*(1-v); fl=3.2*(1-v); } }
    { const v=u('glow')/.7; if(v<1) gl+=2.6*Math.sin(Math.PI*v); }
    { const v=u('in')/.7; if(v<1){ const e=1+2.7*Math.pow(v-1,3)+1.7*Math.pow(v-1,2); sc*=Math.max(.01,e); x-=to.x*(1-v)*3; z-=to.z*(1-v)*3; } }
    { const v=u('out')/.5; if(v<1) sc*=Math.max(.01,1-v); }
    { const v=u('faint')/.9; if(v<1){ y-=v*.7; rz=v*.5; sc*=1-v*.3; } }
    const anc=$('cbC'+s), gone=anc&&anc.classList.contains('cb-gone'); g.visible=!gone&&!(u('out')>=.5&&u('out')<.6);
    g.position.set(x,y,z); g.rotation.set(0,ry,rz); g.scale.setScalar(sc);
    if(q.wheels) q.wheels.forEach(w=>{ w.rotation.z-=dt*(u('lunge')<.5?14:.4); });
    try{ pulseSirens&&pulseSirens(q,t); }catch(_){}
    if(CB3.lights[s]) CB3.lights[s].intensity=gl+fl;
    /* repères à l'écran pour les effets (dégâts, projectiles, cinématiques) */
    const p=new THREE.Vector3(x,1,z).project(CB3.cam), px=(p.x*.5+.5)*W, py=(-p.y*.5+.5)*H, w=W*(s?.3:.46), h=w*.5;
    if(anc){ anc.style.left=(px-w/2)+'px'; anc.style.top=(py-h/2)+'px'; anc.style.width=w+'px'; anc.style.right='auto'; anc.style.bottom='auto'; anc.style.height=h+'px'; }
    ar.style.setProperty('--p'+s+'x',(px/W*100).toFixed(1)+'%'); ar.style.setProperty('--p'+s+'y',(py/H*100).toFixed(1)+'%'); }); }
async function cb3dStart(){ if(CB3.on||!CBV) return; if(!glEnsure()) return; try{ await ensureModels(); }catch(_){} if(!CBV||CB3.on) return;
  const ar=$('cbAr'); if(!ar) return; const d=document.createElement('div'); d.id='cb3d'; d.className='cb-3d'; ar.insertBefore(d,ar.firstChild);
  const S3=cb3dScene(); CB3.sc=S3.sc; CB3.cam=S3.cam; CB3.W=CB3.H=0; CB3.g=[null,null]; CB3.key=['','']; CB3.A=[{},{}]; CB3.t=0; CB3.on=true; ar.classList.add('is3d');
  [0,1].forEach(s=>{ const a=$('cbC'+s); if(a){ a.innerHTML=''; a.dataset.k='3d'; } });
  cb3dSync(); glAttach('cb3d'); glRun(CB3.sc,CB3.cam,cb3dTick,'viewer'); CB3.A[0].in=0; CB3.A[1].in=0; }
function cb3dStop(){ if(!CB3.on) return; CB3.on=false; try{ glStop(); disposeScene(CB3.sc); }catch(_){} CB3.sc=null; CB3.g=[null,null]; }
{ const _st=cbStartDuel; cbStartDuel=function(){ const r=_st.apply(this,arguments); try{ if(CBV) cb3dStart(); }catch(e){ console.warn('cb3d',e); } return r; }; }
{ const _cl=cbClose; cbClose=function(){ cb3dStop(); return _cl.apply(this,arguments); }; }
{ const _dr=cbDraw; cbDraw=function(){ const r=_dr.apply(this,arguments); if(CB3.on){ [0,1].forEach(s=>{ const a=$('cbC'+s); if(a&&a.dataset.k!=='3d'){ a.innerHTML=''; a.dataset.k='3d'; } }); cb3dSync(); } return r; }; }
{ const _an=cbAnim; cbAnim=function(s,cls){ const r=_an.apply(this,arguments); if(CB3.on){ const k={'cb-lunge':'lunge','cb-hit':'hit','cb-glow':'glow','cb-faint':'faint','cb-in':'in','cb-out':'out'}[cls]; if(k){ CB3.A[s][k]=CB3.t; if(k==='in') cb3dSync(); } } return r; }; }
