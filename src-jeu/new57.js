/* ===== v1.5c · attaques légendaires + mini-cinématiques (2-3 s) pour les attaques à Énergie =====
   Les 10 ultimes (70 d'Énergie) ont une cinématique courte, les 6 légendaires (100 d'Énergie) une cinématique complète.
   Les attaques normales gardent leurs animations. */

/* ---- 6 attaques légendaires (Énergie pleine) ---- */
[
 ['hyperrayon','Hyper-rayon turbo','lum','spe',180,90,5,42,0,100,{}],
 ['bombestellaire','Bombe stellaire','meca','spe',170,95,5,46,0,100,{}],
 ['meteore','Météore infernal','feu','spe',180,85,5,42,0,100,{st:['brule',50]}],
 ['razdemaree','Raz-de-marée titanesque','eau','spe',175,90,5,42,0,100,{sb:{vit:-1,who:'foe',ch:100}}],
 ['foudredivine','Foudre divine','elec','spe',180,85,5,42,0,100,{st:['para',40]}],
 ['crocsdeglace','Crocs du glacier','glace','phy',175,90,5,42,0,100,{st:['gel',25]}]
].forEach(r=>{ if(CB_MV[r[0]]) return; CB_MV_ROWS.push(r); CB_MV[r[0]]={id:r[0],n:r[1],t:r[2],c:r[3],p:r[4],a:r[5],pp:r[6],lv:r[7],pr:r[8],e:r[9],fx:r[10]}; });

/* ---- style de cinématique par attaque (sinon par type) ---- */
const CB_LEG={hyperrayon:'beam',bombestellaire:'sphere',meteore:'meteor',razdemaree:'wave',foudredivine:'bolt',crocsdeglace:'spikes',modecourse:'beam'};
const CB_LEG_T={feu:'meteor',eau:'wave',glace:'spikes',vent:'vortex',tene:'vortex',lum:'beam',elec:'bolt',acier:'beam',terre:'spikes',meca:'sphere'};
const cbIsLeg=m=>!!(m&&m.e>=100);

async function cbLegend(e){ const ar=$('cbAr'), m=CB_MV[e.id]; if(!ar||!m||!CBV) return;
  const T=CB_TYPES[m.t]||CB_TYPES.meca, st=CB_LEG[m.id]||CB_LEG_T[m.t]||'beam', leg=cbIsLeg(m), D=Math.round((leg?2700:2200)*(CBV.fast?.35:1));
  const r=ar.getBoundingClientRect(), ca=$('cbC'+e.s), cb=$('cbC'+(1-e.s)); if(!ca||!cb) return;
  const ra=ca.getBoundingClientRect(), rb=cb.getBoundingClientRect(), A={x:ra.left+ra.width*.5-r.left,y:ra.top+ra.height*.5-r.top}, B={x:rb.left+rb.width*.5-r.left,y:rb.top+rb.height*.5-r.top};
  const dx=B.x-A.x, dy=B.y-A.y, len=Math.hypot(dx,dy), ang=Math.atan2(dy,dx)*180/Math.PI;
  const ov=document.createElement('div'); ov.className='cbleg st-'+st+(leg?' leg':'')+(e.s?' foe':'');
  [['--tc',T.c],['--d',D+'ms'],['--ax',A.x+'px'],['--ay',A.y+'px'],['--bx',B.x+'px'],['--by',B.y+'px'],['--ang',ang+'deg'],['--len',len+'px'],['--dx',dx+'px'],['--dy',dy+'px']].forEach(([k,v])=>ov.style.setProperty(k,v));
  const n=k=>Array.from({length:k},(_,i)=>i);
  let fx='';
  if(st==='beam') fx=`<div class="lg-orb a"></div>${n(10).map(i=>`<i class="lg-in" style="--i:${i}"></i>`).join('')}<div class="lg-beam"><span></span></div><div class="lg-boom b"></div>`;
  if(st==='sphere') fx=`<div class="lg-sph"></div>${n(14).map(i=>`<i class="lg-str" style="--i:${i}"></i>`).join('')}<div class="lg-boom b big"></div>`;
  if(st==='meteor') fx=`<div class="lg-sky"></div><div class="lg-met"><span></span></div>${n(3).map(i=>`<div class="lg-met small" style="--i:${i+1}"><span></span></div>`).join('')}<div class="lg-boom b big"></div>`;
  if(st==='wave') fx=`<div class="lg-wave"><span></span><span></span><span></span></div><div class="lg-boom b"></div>`;
  if(st==='bolt') fx=`<div class="lg-sky dark"></div>${n(4).map(i=>`<svg class="lg-bolt" style="--i:${i}" viewBox="0 0 40 200" preserveAspectRatio="none"><path d="M22 0 L8 80 L20 82 L6 200 L34 70 L20 68 L30 0 Z"/></svg>`).join('')}<div class="lg-boom b"></div>`;
  if(st==='spikes') fx=`${n(7).map(i=>`<i class="lg-spk" style="--i:${i}"></i>`).join('')}<div class="lg-boom b"></div>`;
  if(st==='vortex') fx=`<div class="lg-vor"></div><div class="lg-vor two"></div><div class="lg-boom b"></div>`;
  ov.innerHTML=`<div class="lg-dim"></div><div class="lg-glow a"></div>${fx}<div class="lg-flash"></div><div class="lg-ban"><small>${leg?'⭐ ATTAQUE LÉGENDAIRE':'✦ ATTAQUE ULTIME'}</small><b>${T.ic} ${m.n}</b></div>`;
  ar.appendChild(ov); const imp={beam:.46,sphere:.72,meteor:.58,wave:.5,bolt:.32,spikes:.42,vortex:.45}[st]||.5;
  /* sons : charge montante, puis impact */
  try{ czTone(70,leg?700:500,D*imp/1000,'sawtooth',.07); czTone(140,1400,D*imp/1000,'triangle',.03);
    setTimeout(()=>{ try{ czBoom(leg?1.1:.8,leg?.75:.55); const a=$('cbAr'); if(a){ a.classList.remove('cb-shake'); void a.offsetWidth; a.classList.add('cb-shake'); setTimeout(()=>a&&a.classList.remove('cb-shake'),420); } }catch(_){} },D*imp);
    if(st==='bolt') [.5,.68].forEach(k=>setTimeout(()=>{ try{ czBoom(.35,.4); }catch(_){} },D*k)); }catch(_){}
  try{ navigator.vibrate&&navigator.userActivation&&navigator.userActivation.hasBeenActive&&setTimeout(()=>navigator.vibrate(leg?[40,30,80]:[30,20,40]),D*imp); }catch(_){}
  await cbSleep(D); ov.remove(); }
