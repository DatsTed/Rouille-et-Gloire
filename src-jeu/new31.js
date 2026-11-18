/* ===== v0.55 : charte +18 ans du labo + cinématique d'intro ===== */
/* ---- charte de prévention et confirmation d'âge ---- */
function ageSheet(X){
  if(!sheet||sheet.t!=='age') return false;
  const st=sheet.st||0;
  if(st===2) $('sheet').innerHTML=`<div class="tuto gtu"><div class="tu-ic">🔞</div><h2>Avant de jouer</h2>
   <p><b>High &amp; Rouillé</b> contient des contenus <b>destinés à un public majeur</b> : une partie du jeu met en scène, <b>uniquement dans un univers de fiction</b>, la culture du cannabis, des activités et des courses clandestines, et la police.</p>
   <p>Un mineur peut jouer au jeu : <b>tout ce qui touche à l’illégal lui est entièrement masqué</b> (labo, courses clandestines, missions illégales, équipe clandestine).</p>
   <p class="note">Réponds honnêtement. Aucune pièce d’identité n’est demandée.</p>
   <div class="tu-btns col"><button class="btn" data-a="age1yes">✅ J’ai 18 ans ou plus</button><button class="btn alt" data-a="age1no">🙋 J’ai moins de 18 ans</button></div></div>`;
  else if(st===0) $('sheet').innerHTML=`<div class="tuto gtu">${X}<div class="tu-ic">⚠️</div><h2>Charte de prévention</h2>
   <p>La suite du jeu (le <b>labo clandestin</b> et les activités illégales) met en scène la <b>culture du cannabis</b>, <b>uniquement dans un univers de fiction</b>.</p>
   <ul class="agel"><li>Le cannabis est <b>interdit aux mineurs</b>. Cette partie du jeu l’est aussi.</li><li>Ce jeu ne montre pas comment cultiver, et ne doit pas être imité : la culture, la détention et la vente sont encadrées par la loi.</li><li>Le cannabis a des risques réels : dépendance, troubles de l’attention et de la mémoire, effets sur la santé mentale, <b>surtout avant 25 ans</b>. Au volant, il est dangereux.</li><li>Besoin d’en parler, anonymement ? En Belgique : Infor-Drogues, 02 227 52 52.</li></ul>
   <div class="tu-btns"><button class="btn alt" data-a="agenope">Je ne veux pas de cette partie</button><button class="btn" data-a="agecharte">J’ai lu la charte</button></div></div>`;
  else $('sheet').innerHTML=`<div class="tuto gtu">${X}<div class="tu-ic">🔞</div><h2>Confirme ton âge</h2>
   <p>Pour débloquer le labo et la partie illégale, tu dois avoir <b>18 ans ou plus</b>.</p><p class="note">Réponds honnêtement : cette partie n’est pas destinée aux mineurs.</p>
   <div class="tu-btns col"><button class="btn" data-a="ageyes">✅ J’ai 18 ans ou plus, et je le confirme</button><button class="btn alt" data-a="agenope">❌ J’ai moins de 18 ans</button></div></div>`;
  return true;
}
ACT.agenext=()=>{ sheet.st=1; renderSheet(); };
ACT.ageyes=()=>{ S.age18=true; S.charte=1; save(); closeSheet(); toast('🔓 Labo débloqué'); try{ S.labSeen=0; render(); }catch(_){} };
ACT.agenope=()=>{ S.age18=false; save(); closeSheet(); toast('🔒 Cette partie du jeu est masquée. Le reste est accessible.'); try{ render(); }catch(_){} };
const afterAge=()=>{ const f=window.__afterAge; window.__afterAge=null; try{ if(f) f(); }catch(e){} };
ACT.age1yes=()=>{ S.age18=true; S.charte=0; save(); closeSheet(); try{ render(); }catch(_){} afterAge(); };
ACT.age1no=()=>{ S.age18=false; save(); closeSheet(); try{ render(); }catch(_){} afterAge(); };
ACT.agecharte=()=>{ S.charte=1; save(); closeSheet(); toast('🔓 Labo débloqué'); try{ S.labSeen=0; render(); }catch(_){} };
setInterval(()=>{ try{ if(!S||!S.intro||sheet||view==='race'||document.getElementById('cine')||document.getElementById('upd')) return;
  if(S.age18==null) openSheet({t:'age',st:2});
  else if(S.age18===true&&S.charte==null) S.charte=1;                                    /* anciennes sauvegardes : charte déjà lue */
  else if(S.age18===true&&!S.charte&&S.lvl>=LAB_LVL) openSheet({t:'age',st:0}); }catch(e){} },2500);

/* ===== cinématique d'intro (≈ 50 s) : moteur 3D du jeu + synthèse audio ===== */
function startCine(done){
  if(navigator.webdriver||!glEnsure()||document.getElementById('cine')){ done(); return; }
  const ov=document.createElement('div'); ov.id='cine';
  ov.innerHTML='<div class="cn-bar t"></div><div class="cn-bar b"></div><div class="cn-cap" id="cnCap"></div><div class="cn-spd" id="cnSpd"></div><div class="cn-fade" id="cnFade"></div><button class="cn-skip" id="cnSkip">Passer ▸▸</button><div class="cn-start" id="cnGo"><b>HIGH &amp; ROUILLÉ</b><span>Touche l’écran pour lancer l’intro<br>🔊 son recommandé</span></div>';
  document.body.appendChild(ov);
  let ended=false, T=null, sc=null;
  const finish=()=>{ if(ended) return; ended=true; try{ cineAudioStop(); }catch(_){} try{ glStop(); if(sc) disposeScene(sc); }catch(_){} ov.remove(); done(); };
  document.getElementById('cnSkip').onclick=e=>{ e.stopPropagation(); finish(); };
  document.getElementById('cnGo').onclick=async()=>{
    document.getElementById('cnGo').remove();
    try{ auUnlock(); }catch(_){}
    try{ await ensureModels(); }catch(_){}
    try{ T=cineBuild(finish); sc=T.sc; glAttach('cine'); glRun(sc,T.cam,T.tick,'race'); cineAudioStart(T); }
    catch(e){ try{console.warn('cine',e);}catch(_){} finish(); }
  };
}
const CS=[[1.5,5,'Un soir ordinaire…'],[26.3,29.5,'Ils ne s’arrêtent pas.'],[40,43,'Trop rapides.']];
const cnE=x=>{x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x);};
const cnTS=t=>t<13.3?1:t<14.8?1-.88*cnE((t-13.3)/1.5):t<26?.12:t<27.2?.12+.88*cnE((t-26)/1.2):1;
function cineBuild(finish){
  const sc=new THREE.Scene(), col=0x1b1030; sc.background=new THREE.Color(col); sc.fog=new THREE.Fog(col,45,430);
  sc.add(new THREE.AmbientLight(0x9a8fd0,.8)); const dl=new THREE.DirectionalLight(0xffb27a,.95); dl.position.set(-60,40,30); sc.add(dl);
  const cam=new THREE.PerspectiveCamera(70,1,.1,900); sc.add(cam);
  /* guidon (vue première personne) */
  const hb=new THREE.Group(), dk=new THREE.MeshLambertMaterial({color:0x15161c}), gl=new THREE.MeshLambertMaterial({color:0x8a6a48}), mt=new THREE.MeshLambertMaterial({color:0x9aa0aa});
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.66,8),mt); bar.rotation.z=Math.PI/2; hb.add(bar);
  [-.33,.33].forEach(x=>{ const g=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.14,8),dk); g.rotation.z=Math.PI/2; g.position.x=x; hb.add(g); const lv=new THREE.Mesh(new THREE.BoxGeometry(.012,.012,.1),mt); lv.position.set(x*.86,-.01,-.06); hb.add(lv); const h=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),gl); h.position.set(x*.98,-.02,.05); hb.add(h); });
  const st=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.2,8),mt); st.rotation.x=Math.PI/2+.5; st.position.set(0,-.05,-.1); hb.add(st);
  const tyre=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.045,20),dk); tyre.rotation.z=Math.PI/2; tyre.position.set(0,-.62,-.35); hb.add(tyre);
  [-.03,.03].forEach(x=>{ const f=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.62,6),mt); f.position.set(x,-.3,-.18); f.rotation.x=-.5; hb.add(f); });
  hb.position.set(0,-.34,-.62); cam.add(hb);
  /* textures */
  const cv=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
  const road=cv(256,256,(x,w,h)=>{ x.fillStyle='#26262e'; x.fillRect(0,0,w,h); for(let i=0;i<900;i++){ x.fillStyle=`rgba(${60+Math.random()*40|0},${60+Math.random()*40|0},${70+Math.random()*40|0},.35)`; x.fillRect(Math.random()*w,Math.random()*h,2,2); }
    x.fillStyle='#e0b43c'; x.fillRect(0,h/2-3,w*.5,6); x.fillStyle='#cfd2dc'; x.fillRect(0,4,w,4); x.fillRect(0,h-8,w,4); });
  road.repeat.set(1,1);
  const facs=[0,1,2,3].map(k=>cv(128,256,(x,w,h)=>{ const base=['#2a1f3d','#3a2430','#1f2d3d','#33291f'][k]; x.fillStyle=base; x.fillRect(0,0,w,h);
    for(let r=0;r<12;r++) for(let c=0;c<5;c++){ const on=Math.random()<.4; x.fillStyle=on?(Math.random()<.2?'#7fe8ff':'#ffd27a'):'#10101a'; x.fillRect(8+c*24,10+r*20,14,11); } }));
  const fm=facs.map(t=>new THREE.MeshLambertMaterial({map:t,emissive:0x2a2418,emissiveMap:t}));
  const LEN=1200, rd=new THREE.Mesh(new THREE.PlaneGeometry(LEN,14),new THREE.MeshLambertMaterial({map:road})); rd.rotation.x=-Math.PI/2; road.repeat.set(LEN/16,1); sc.add(rd);
  const wk=new THREE.MeshLambertMaterial({color:0x4a4658}); [-9,9].forEach(z=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(LEN,.25,4),wk); m.position.set(0,.12,z); sc.add(m); }); const sw=sc.children.slice(-2);
  /* bâtiments recyclés autour de la caméra */
  const NB=46, SB=14, LB=NB*SB, bl=[];
  [-1,1].forEach(sd=>{ for(let k=0;k<NB;k++){ const hh=9+((k*37+sd*11)%19)+(k%5===0?9:0), w=12.5, d=14;
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d),fm[(k+(sd>0?2:0))%4]); m.position.y=hh/2; sc.add(m); bl.push({m,k,sd,d}); } });
  /* lampadaires */
  const NL=24, SL=26, LL=NL*SL, lp=[], bulb=new THREE.MeshBasicMaterial({color:0xffe2a0}), pole=new THREE.MeshLambertMaterial({color:0x22232b});
  [-1,1].forEach(sd=>{ for(let k=0;k<NL;k++){ const g=new THREE.Group(); const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,6.2,6),pole); p.position.y=3.1; g.add(p); const b=new THREE.Mesh(new THREE.SphereGeometry(.34,8,6),bulb); b.position.set(0,6.3,-sd*.7); g.add(b); sc.add(g); lp.push({g,k,sd}); } });
  /* ruelle + épave */
  let XA=0; const alley=new THREE.Group(); sc.add(alley);
  const am=new THREE.MeshLambertMaterial({color:0x2b2233}), af=new THREE.Mesh(new THREE.PlaneGeometry(11,76),new THREE.MeshLambertMaterial({color:0x1c1a22})); af.rotation.x=-Math.PI/2; af.position.set(0,.02,-38); alley.add(af);
  [-6,6].forEach(x=>{ const w=new THREE.Mesh(new THREE.BoxGeometry(1.2,16,76),fm[x<0?1:3]); w.position.set(x,8,-38); alley.add(w); });
  const endw=new THREE.Mesh(new THREE.BoxGeometry(14,16,1),am); endw.position.set(0,8,-77); alley.add(endw);
  const warm=new THREE.PointLight(0xffa860,1.6,26); warm.position.set(0,3.6,-26); alley.add(warm);
  const cold=new THREE.PointLight(0x6fa8ff,.9,30); cold.position.set(0,5,-12); alley.add(cold);
  const bulb2=new THREE.Mesh(new THREE.SphereGeometry(.25,8,6),bulb); bulb2.position.set(0,3.6,-26); alley.add(bulb2);
  const ep=buildCar(M.epave,'#fff',{}); ep.g.position.set(.3,0,-34); ep.g.rotation.y=-1.15; alley.add(ep.g);
  /* voitures */
  const mk=id=>buildCar(M[id],'#fff',{});
  const spec=[['rossa',-3.2,16.0],['aurion',.6,16.4],['solus',2.9,17.3],['gts',-2.9,17.8],['touge',.2,18.7],['rx4',2.6,19.1],['volta',-3.0,20.2]].map(a=>({c:mk(a[0]),lane:a[1],tr:a[2],pol:0}));
  [['patrouille',.4,22.2],['patrouille',-2.4,23.0]].forEach(a=>spec.push({c:mk(a[0]),lane:a[1],tr:a[2],pol:1}));
  spec.forEach(s=>{ sc.add(s.c.g); });
  /* tables déterministes : temps de film -> temps monde -> position du vélo */
  const DT=.02, NT=2600, TW=new Float32Array(NT+1), XB=new Float32Array(NT+1); let tw=0, xb=0;
  for(let i=0;i<=NT;i++){ const t=i*DT; TW[i]=tw; XB[i]=xb; const ts=cnTS(t), vb=t<28?3.6:3.6+(11-3.6)*cnE((t-28)/5); tw+=ts*DT; xb+=vb*ts*DT; }
  const at=(A,t)=>{ const f=Math.max(0,Math.min(NT-1,t/DT)), i=Math.floor(f); return A[i]+(A[i+1]-A[i])*(f-i); };
  const twAt=t=>at(TW,t), xbAt=t=>at(XB,t);
  XA=xbAt(44.6); alley.position.set(XA,0,-7); ep.g.position.set(.3,0,-27);   /* ruelle dans l'axe -z, au bord du trottoir */
  spec.forEach(s=>{ s.tp=twAt(s.tr); s.xp=xbAt(s.tr); });
  const carX=(s,t)=>{ const u=twAt(t)-s.tp; return s.xp+(u<0?55*u:55*u+5*u*u); };
  const carV=(s,t)=>{ const u=twAt(t)-s.tp; return u<0?55:55+10*u; };
  const P=spec.map(()=>new THREE.Vector3()), LT=new THREE.Vector3(), tmp=new THREE.Vector3(); let lookInit=false, prevT=0, fovC=70;
  const T={sc,cam,spec,P,t:0,ts:1,xb:0,carX,carV,twAt,xbAt,done:false};
  T.tick=(dt,time)=>{
    if(!T.t0) T.t0=time; const t=Math.min(50.2,time-T.t0); const ts=cnTS(t), dtw=ts*(t-prevT); prevT=t; T.t=t; T.ts=ts;
    const xbn=xbAt(t), zb=-5.8; T.xb=xbn;
    /* voitures */
    spec.forEach((s,i)=>{ const x=carX(s,t), v=carV(s,t); s.x=x; s.z=s.lane+.35*Math.sin(twAt(t)*1.3+i); s.v=v; const g=s.c.g;
      g.position.set(x,0,s.z); g.rotation.y=-.03*Math.cos(twAt(t)*1.3+i); g.visible=Math.abs(x-(T.cx==null?xbn:T.cx))<430; P[i].set(x,.7,s.z);
      s.c.wheels.forEach(w=>{ w.rotation.z-=v*dtw/(s.c.wr||.34); }); if(s.pol) pulseSirens(s.c,t*1.0); });
    /* caméra */
    let pos=new THREE.Vector3(xbn,1.55+Math.sin(t*(t>39?14:5))*(t>39?.05:.02),zb), look=null, fov=70, roll=0;
    const bobShake=t>39&&t<44?.03:.006;
    if(t<26||t>=39){
      if(t<9.5){ look=new THREE.Vector3(xbn+50,1.2,zb+Math.sin(t*.8)*.8); }
      else if(t<12.3){ const a=cnE((t-9.5)/2.8)*Math.PI; look=new THREE.Vector3(xbn+Math.cos(a)*50,1.3,zb+Math.sin(a)*50); roll=Math.sin(a)*.06; }
      else if(t>=17.6&&t<20.4){ let bi=0,bd=1e9; spec.forEach((s,i)=>{ const d=Math.abs(s.x-xbn-6); if(d<bd){bd=d;bi=i;} }); pos.set(xbn+2,.45,zb+.2); look=P[bi].clone(); look.y=.7; fov=58; roll=-.08; }
      else if(t>=22&&t<24.8){ pos.set(xbn+16,1.0,zb+.8); look=P[0].clone(); look.y=.8; fov=50; }
      else if(t<26){ let bi=0,bd=1e9; spec.forEach((s,i)=>{ const d=Math.hypot(s.x-xbn,s.z-zb); if(d<bd){bd=d;bi=i;} }); look=P[bi].clone(); look.y=.9; fov=70-18*cnE((t-13)/2)*(t<26?1:0); roll=.05; }
      else if(t<43.6){ look=new THREE.Vector3(xbn+50,.9,zb); fov=74; }
      else if(t<44.9){ const a=-cnE((t-43.6)/1.3)*Math.PI/2; look=new THREE.Vector3(xbn+Math.cos(a)*50,1.2,zb+Math.sin(a)*50); fov=70; }
      else{ const e=cnE((t-44.9)/3.8); pos.set(XA,1.55-.55*e,zb-e*20); look=new THREE.Vector3(XA+.3,.7+.2*e,-34); fov=68-12*e; }
    } else {
      const L=spec[0];
      if(t<31){ pos.set(L.x-11,1.35,L.z-5.5); look=new THREE.Vector3(L.x+4,.8,L.z); fov=80; }
      else if(t<35){ if(!T.sx) T.sx=carX(L,31)+150; pos.set(T.sx,.65,-2.2); look=P[0].clone(); fov=62; }
      else { pos.set(L.x+2,1.25,Math.max(-9.3,L.z-6.5)); look=new THREE.Vector3(L.x-7,.9,L.z); fov=52; }
    }
    if(!lookInit||t<9.5||(t>=26&&t<26.1)||(t>=17.6&&t<17.7)||(t>=20.4&&t<20.5)||(t>=22&&t<22.1)||(t>=24.8&&t<24.9)||t>=43.6&&t<43.7||t>=39&&t<39.1){ LT.copy(look); lookInit=true; }
    else{ const k=1-Math.exp(-(t>=12.3&&t<26?3.2:t>=44.9?6:14)*Math.max(.001,dt)); LT.lerp(look,t<12.3?1:k); }
    cam.position.copy(pos); cam.position.x+=(Math.random()-.5)*bobShake; cam.position.y+=(Math.random()-.5)*bobShake;
    T.cx=pos.x; { const cxr=pos.x;
    rd.position.x=Math.floor(cxr/16)*16; sw.forEach(m=>m.position.x=Math.floor(cxr/16)*16);
    bl.forEach(o=>{ const x=cxr-250+(((o.k*SB-cxr+250)%LB)+LB)%LB; o.m.position.set(x,o.m.position.y,o.sd*(11+o.d/2)); o.m.visible=!(o.sd<0&&Math.abs(x-XA)<10.5); });
    lp.forEach(o=>{ const x=cxr-250+(((o.k*SL-cxr+250)%LL)+LL)%LL; o.g.position.set(x,0,o.sd*8.4); });
    }
    cam.lookAt(LT); if(roll) cam.rotateZ(roll);
    if(t>=26&&t<28.5) fov+=14*(1-(t-26)/2.5); if(t>=39&&t<41) fov+=12*(1-(t-39)/2); if(t>=12.3&&t<26) fov-=3*Math.min(1,(t-12.3)/6);
    if(Math.abs(cam.fov-fov)>.05){ cam.fov+=(fov-cam.fov)*Math.min(1,dt*6); cam.updateProjectionMatrix(); }
    hb.visible=((t<17.6||(t>=20.4&&t<26))||(t>=39&&t<45)); hb.position.y=-.34+Math.sin(t*(t>39?14:5))*.01;
    ep.g.visible=t>40;
    /* légendes, fondu */
    const cap=document.getElementById('cnCap'); if(cap){ const c=CS.find(a=>t>=a[0]&&t<a[1]); if(c){ cap.textContent=c[2]; cap.style.opacity=1; cap.classList.remove('big'); } else if(t>=46.4){ cap.innerHTML='HIGH &amp; ROUILLÉ'; cap.classList.add('big'); cap.style.opacity=1; } else cap.style.opacity=0; }
    const sp=document.getElementById('cnSpd'); if(sp){ const o=t>=26&&t<39?.75:t>=39&&t<44?.6:t>=12.3&&t<26?.25:t>=3&&t<9.5?.12:0; sp.style.opacity=o; sp.style.animationDuration=(ts<.5?1.6:.35)+'s'; }
    const fd=document.getElementById('cnFade'); if(fd) fd.style.opacity=t<1.2?1-t/1.2:t>49?Math.min(1,(t-49)/1):0;
    try{ cineAudioTick(T,dt); }catch(e){}
    if(t>=50&&!T.done){ T.done=true; finish(); }
  };
  return T;
}
/* ---- audio : musique épique qui suit le ralenti, moteurs avec Doppler, sirènes ---- */
const CA={on:false};
function cineAudioStart(T){
  const A=AU.ctx; if(!A||!AU.master) return; const o=A.createGain(); o.gain.value=0; o.gain.linearRampToValueAtTime(1,A.currentTime+1.5); o.connect(AU.master);
  CA.o=o; CA.A=A; CA.nodes=[]; CA.beat=0; CA.hb=0;
  const keep=n=>{CA.nodes.push(n); return n;};
  const lp=A.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1200; lp.connect(o); CA.lp=lp;
  /* nappe Ré mineur + sub */
  CA.pad=[73.4,110,146.8,174.6].map((f,i)=>{ const s=keep(A.createOscillator()); s.type='sawtooth'; s.detune.value=(i%2?7:-7); s.frequency.value=f; const g=A.createGain(); g.gain.value=.08; s.connect(g); g.connect(lp); s.start(); return {s,f}; });
  const sub=keep(A.createOscillator()); sub.type='sine'; sub.frequency.value=36.7; const sg=A.createGain(); sg.gain.value=.26; sub.connect(sg); sg.connect(o); sub.start(); CA.sub={s:sub,f:36.7};
  /* écho spacieux + nappe épique (accord Ré mineur / Sib) */
  const dly=A.createDelay(1.5); dly.delayTime.value=.42; const fb=A.createGain(); fb.gain.value=.38; const dlp=A.createBiquadFilter(); dlp.type='lowpass'; dlp.frequency.value=1800; lp.connect(dly); dly.connect(dlp); dlp.connect(fb); fb.connect(dly); dlp.connect(o);
  const epg=A.createGain(); epg.gain.value=0; epg.connect(lp); epg.connect(dly); CA.ep=epg;
  CA.epo=[146.8,174.6,220,293.7,349.2,440].map((f,i)=>{ const s=keep(A.createOscillator()); s.type=i<3?'sawtooth':'triangle'; s.detune.value=(i%2?9:-9); s.frequency.value=f; const g=A.createGain(); g.gain.value=i<3?.05:.07; s.connect(g); g.connect(epg); s.start(); return {s,f}; });
  /* vent */
  const ns=keep(A.createBufferSource()); ns.buffer=AU.noise; ns.loop=true; const bp=A.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=500; bp.Q.value=.6; const wg=A.createGain(); wg.gain.value=.05; ns.connect(bp); bp.connect(wg); wg.connect(o); ns.start(); CA.wind={g:wg,bp};
  /* voix de moteurs et sirènes */
  CA.v=T.spec.map(s=>{ const a=keep(A.createOscillator()), b=keep(A.createOscillator()); a.type='sawtooth'; b.type='square'; const f=A.createBiquadFilter(); f.type='lowpass'; f.frequency.value=s.pol?700:1100; const g=A.createGain(); g.gain.value=0;
    a.connect(f); b.connect(f); f.connect(g); let pn=null; if(A.createStereoPanner){ pn=A.createStereoPanner(); g.connect(pn); pn.connect(o); } else g.connect(o); a.start(); b.start();
    let sir=null; if(s.pol){ const q=keep(A.createOscillator()); q.type='square'; const qg=A.createGain(); qg.gain.value=0; const qf=A.createBiquadFilter(); qf.type='bandpass'; qf.frequency.value=900; qf.Q.value=1.2; q.connect(qf); qf.connect(qg); qg.connect(pn||o); q.start(); sir={q,qg}; }
    return {a,b,g,pn,sir,pass:null}; });
  CA.on=true;
}
function cineKick(vol,pitch){ const A=CA.A,t=A.currentTime,s=A.createOscillator(),g=A.createGain(); s.frequency.setValueAtTime(150*pitch,t); s.frequency.exponentialRampToValueAtTime(40*pitch,t+.16); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); s.connect(g); g.connect(CA.o); s.start(t); s.stop(t+.35); }
function cineNote(f,len,vol,type){ const A=CA.A,t=A.currentTime,s=A.createOscillator(),g=A.createGain(),fl=A.createBiquadFilter(); s.type=type||'sawtooth'; s.frequency.value=f; fl.type='lowpass'; fl.frequency.setValueAtTime(2600,t); fl.frequency.exponentialRampToValueAtTime(500,t+len); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+len); s.connect(fl); fl.connect(g); g.connect(CA.o); s.start(t); s.stop(t+len+.05); }
function cineNoise(len,f0,f1,vol){ const A=CA.A,t=A.currentTime,s=A.createBufferSource(),b=A.createBiquadFilter(),g=A.createGain(); s.buffer=AU.noise; b.type='bandpass'; b.Q.value=1.2; b.frequency.setValueAtTime(f0,t); b.frequency.exponentialRampToValueAtTime(f1,t+len); g.gain.setValueAtTime(.001,t); g.gain.linearRampToValueAtTime(vol,t+len*.7); g.gain.exponentialRampToValueAtTime(.001,t+len); s.connect(b); b.connect(g); g.connect(CA.o); s.start(t); s.stop(t+len+.05); }
function cineAudioTick(T,dt){
  if(!CA.on) return; const A=CA.A, t=T.t, ts=T.ts, m=.55+.45*ts, now=A.currentTime;
  /* ralenti : tout descend en hauteur et s'assourdit */
  CA.lp.frequency.setTargetAtTime(ts<.5?520:t>26?3600:1500,now,.15);
  CA.pad.forEach(p=>p.s.frequency.setTargetAtTime(p.f*m,now,.08)); CA.sub.s.frequency.setTargetAtTime(CA.sub.f*m,now,.08);
  CA.ep.gain.setTargetAtTime(t<12?0:t<26?(ts<.5?.9:.5):t<39?.35:t<44?.2:t>=46?.5:0,now,.5); CA.epo.forEach(p=>p.s.frequency.setTargetAtTime(p.f*(t>=17&&t<26?1.122:1)*m,now,.25));
  CA.wind.g.gain.setTargetAtTime(t<9?.05:t>39?.09:.03,now,.3);
  /* événements */
  const ev=(k,a)=>{ if(!CA['e'+k]&&t>=a){ CA['e'+k]=1; return true; } return false; };
  if(ev(1,13.3)){ cineKick(.9,.5); cineNoise(1.6,300,90,.25); }                    /* entrée du ralenti */
  if(ev(2,24.3)) cineNoise(2.2,200,6000,.3);
  if(ev(5,17.4)) cineNoise(2.4,300,7000,.22);  if(ev(6,21.8)){ cineNoise(2.6,300,8000,.25); cineKick(.9,.4); }
  if(ev(7,13.4)){ [146.8,220,293.7,440].forEach(f=>cineNote(f,4,.14,'triangle')); }  if(ev(8,19)){ [116.5,174.6,233,349].forEach(f=>cineNote(f,4,.14,'triangle')); }                                      /* montée */
  if(ev(3,26)){ cineKick(1,1); cineKick(.8,.6); cineNote(73.4,1.6,.35); cineNote(146.8,1.6,.3); cineNoise(1.2,6000,300,.35); } /* explosion de reprise */
  if(ev(4,46.4)){ cineKick(1,.7); [146.8,174.6,220,293.7].forEach(f=>cineNote(f,3,.16)); }  /* titre */
  /* rythme dépendant du ralenti */
  const mr=.35+.65*ts, tempo=t<9?70:t<26?60:t<39?150:t<44?90:120; CA.beat+=dt*(tempo/60)*mr*(t<13.3?1:1);
  const b=Math.floor(CA.beat), h=Math.floor(CA.beat*2);
  if(b!==CA.lb){ CA.lb=b; if(t>=6&&t<9.5) cineKick(.35,1); else if(t>=13.3&&t<26) cineKick(.95,.5+.3*ts); else if(t>=26&&t<39) cineKick(.8,1); else if(t>=44&&t<46.4) cineKick(.5,.9); }
  if(h!==CA.lh){ CA.lh=h; const arp=[146.8,174.6,220,261.6,220,174.6,196,233]; if(t>=26&&t<39) cineNote(arp[h%8]*(h%16<8?1:1.125),.22,.13); else if(t>=44&&t<46.4) cineNote([293.7,349.2,440][h%3],.5,.07,'triangle'); else if(t>=15&&t<26&&h%4===0) cineNote(220*m,1.2,.05,'sine'); if(t>=26&&t<39&&h%2) cineNoise(.07,8000,9000,.07); }
  /* moteurs, Doppler et sirènes */
  const cx=T.cam.position.x, cz=T.cam.position.z, f=new THREE.Vector3(); T.cam.getWorldDirection(f);
  T.spec.forEach((s,i)=>{ const v=CA.v[i], dx=s.x-cx, dz=s.z-cz, d=Math.max(1,Math.hypot(dx,dz)), vr=s.v*dx/d, u=T.twAt(t)-s.tp, dop=340/(340+vr);
    const rev=1+Math.max(0,Math.min(3,u))*.3, f0=(s.pol?62:50+i*6)*rev*dop*m, g=Math.min(1,1/(1+Math.pow(d/(ts<.5?14:18),1.5)))*(s.pol?.04:.075)*(Math.abs(s.x-cx)<440?1:0);
    v.a.frequency.setTargetAtTime(f0,now,.04); v.b.frequency.setTargetAtTime(f0*1.5,now,.04); v.g.gain.setTargetAtTime(g,now,.05); if(v.pn) v.pn.pan.setTargetAtTime(Math.max(-1,Math.min(1,(-dx*f.z+dz*f.x)/d)),now,.05);
    if(v.sir){ v.sir.q.frequency.setTargetAtTime(((Math.floor(t*(ts<.5?1:2))%2)?960:720)*m,now,.02); v.sir.qg.gain.setTargetAtTime(Math.min(.5,1/(1+d/40))*.09*(t>14?1:0),now,.05); }
    const side=Math.sign(dx); if(v.pass!=null&&side!==v.pass&&d<40&&T.ts>0){ cineNoise(ts<.5?1.3:.5,1800*m,300,.28*Math.min(1,12/d)); } v.pass=side; });
}
function cineAudioStop(){ if(!CA.on) return; CA.on=false; try{ const A=CA.A; CA.o.gain.setTargetAtTime(0,A.currentTime,.2); setTimeout(()=>{ CA.nodes.forEach(n=>{ try{n.stop();}catch(_){} try{n.disconnect();}catch(_){} }); try{CA.o.disconnect();}catch(_){} },900); }catch(_){} }
ACT.cine=()=>{ closeSheet&&closeSheet(); startCine(()=>{}); };
