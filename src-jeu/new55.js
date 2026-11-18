/* ===== v1.5 · Éveil cosmique — 5/6 : passage au niveau 10 + cinématique (moteur 3D du jeu, ≈ 38 s) =====
   Au niveau 10 : fenêtre de confirmation → cinématique (ville, être cosmique, boule d'énergie, salves, éveil des voitures)
   → S.niveau10CinematicSeen = true, le mode Combat s'ouvre. Rejouable depuis Base › Réglages. */

/* ---- narration (voix de synthèse) + sous-titres ---- */
const CZ_VO=[['c1',.8,'Une nuit comme les autres… les moteurs grondaient dans les rues de la ville.'],['c2',6.6,'Puis le ciel… s’est déchiré.'],
  ['c3',10.2,'Un être venu du fond du cosmos a posé les yeux sur nos voitures.'],['c4',15.2,'Et il leur a offert son énergie.'],
  ['c5',24,'Chaque moteur, chaque châssis, chaque boulon s’est éveillé.'],['c6',29.2,'Tes voitures ont maintenant des super-pouvoirs. Que les duels commencent !']];
const CZ_END=38, CZ_IMPACT=18;
const CZB={}; let CZS=[];
function czPrep(){ try{ if(!AU||!AU.ctx||typeof VOIX55==='undefined') return; CZ_VO.forEach(([id])=>{ if(CZB[id]||!VOIX55[id]) return; CZB[id]='…'; const bin=atob(VOIX55[id]), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); AU.ctx.decodeAudioData(u.buffer,b=>{ CZB[id]=b; },()=>{ CZB[id]=null; }); }); }catch(e){} }
function czPlay(id){ try{ const b=CZB[id]; if(!b||b==='…'||!AU.ctx||(S.audio&&S.audio.mute)) return; const c=AU.ctx, s=c.createBufferSource(), g=c.createGain(), f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=100; g.gain.value=1.2; s.buffer=b; s.connect(f); f.connect(g); g.connect(c.destination); s.start(); CZS.push(s); }catch(e){} }
/* sons de la cinématique (synthèse) */
function czTone(f0,f1,d,type,v,delay){ try{ if(!AU||!AU.ok||(S.audio&&S.audio.mute)) return; const c=AU.ctx, t=c.currentTime+(delay||0), o=c.createOscillator(), g=c.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v||.1,t+Math.min(.4,d*.3)); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+d+.05); CZS.push(o); }catch(_){} }
function czBoom(d,v){ try{ if(!AU||!AU.ok||(S.audio&&S.audio.mute)) return; const c=AU.ctx, n=Math.floor(c.sampleRate*d), b=c.createBuffer(1,n,c.sampleRate), a=b.getChannelData(0); for(let i=0;i<n;i++) a[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.2);
  const s=c.createBufferSource(); s.buffer=b; const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=900; const g=c.createGain(); g.gain.value=v||.6; s.connect(f); f.connect(g); g.connect(c.destination); s.start(); CZS.push(s); czTone(90,30,d,'sine',.5); }catch(_){} }
function czStopAll(){ CZS.forEach(s=>{ try{ s.stop(); }catch(_){} }); CZS=[]; }

/* ---- scène ---- */
const czE=x=>{ x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); };
function czGlowTex(c1,c2){ return ctex(128,128,(x,W,H)=>{ const g=x.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2); g.addColorStop(0,'#ffffff'); g.addColorStop(.25,c1); g.addColorStop(.6,c2||'rgba(120,60,255,.25)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,W,H); }); }
function czBuild(){
  const sc=new THREE.Scene(), col=0x0c0620; sc.background=new THREE.Color(col); sc.fog=new THREE.Fog(col,60,520);
  sc.add(new THREE.AmbientLight(0x8a7fd0,.75)); const dl=new THREE.DirectionalLight(0xb9a6ff,.6); dl.position.set(-40,60,30); sc.add(dl);
  const cam=new THREE.PerspectiveCamera(66,1,.1,1400);
  /* rue, trottoirs, immeubles à fenêtres, lampadaires */
  const LEN=900, road=ctex(256,256,(x,w,h)=>{ x.fillStyle='#23222e'; x.fillRect(0,0,w,h); for(let i=0;i<700;i++){ x.fillStyle=`rgba(${70+Math.random()*50|0},${70+Math.random()*50|0},${90+Math.random()*50|0},.3)`; x.fillRect(Math.random()*w,Math.random()*h,2,2); } x.fillStyle='#e0b43c'; x.fillRect(0,h/2-3,w*.5,6); x.fillStyle='#cfd2dc'; x.fillRect(0,4,w,4); x.fillRect(0,h-8,w,4); });
  road.repeat.set(LEN/16,1); const rd=new THREE.Mesh(new THREE.PlaneGeometry(LEN,14),new THREE.MeshLambertMaterial({map:road})); rd.rotation.x=-Math.PI/2; rd.position.x=-100; sc.add(rd);
  [-9,9].forEach(z=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(LEN,.25,4),new THREE.MeshLambertMaterial({color:0x403c52})); m.position.set(-100,.12,z); sc.add(m); });
  const facs=[0,1,2,3].map(k=>{ const t=ctex(128,256,(x,w,h)=>{ x.fillStyle=['#241b3a','#2e1f33','#1c2740','#2a2333'][k]; x.fillRect(0,0,w,h); for(let r=0;r<12;r++) for(let c=0;c<5;c++){ const on=Math.random()<.45; x.fillStyle=on?(Math.random()<.25?'#7fe8ff':Math.random()<.2?'#ff7ae0':'#ffd27a'):'#0d0d1a'; x.fillRect(8+c*24,10+r*20,14,11); } }); return new THREE.MeshLambertMaterial({map:t,emissive:0x2a2418,emissiveMap:t}); });
  for(let i=0;i<56;i++){ [-1,1].forEach(sd=>{ const h=14+((i*37+sd*13)%26)+(i%6===0?20:0), w=12+(i%3)*2, d=12; const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),facs[(i+(sd>0?1:3))%4]); m.position.set(-540+i*16,h/2,sd*(11+d/2)); sc.add(m); }); }
  const bulb=new THREE.MeshBasicMaterial({color:0xffe2a0}), pole=new THREE.MeshLambertMaterial({color:0x22232b});
  for(let i=0;i<30;i++) [-1,1].forEach(sd=>{ const g=new THREE.Group(); const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,6.2,6),pole); p.position.y=3.1; g.add(p); const b=new THREE.Mesh(new THREE.SphereGeometry(.34,8,6),bulb); b.position.set(0,6.3,-sd*.7); g.add(b); g.position.set(-520+i*28,0,sd*8.4); sc.add(g); });
  /* ciel : étoiles + déchirure cosmique */
  const sp=[]; for(let i=0;i<900;i++){ const a=Math.random()*Math.PI*2, e=.15+Math.random()*1.2, r=700; sp.push(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r); }
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3)); const dotT=ctex(32,32,(x,W,H)=>{ const g=x.createRadialGradient(16,16,0,16,16,16); g.addColorStop(0,'#fff'); g.addColorStop(.4,'rgba(255,255,255,.8)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,32,32); }); dotT.wrapS=dotT.wrapT=THREE.ClampToEdgeWrapping;
  sc.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:2,map:dotT,transparent:true,depthWrite:false,fog:false,sizeAttenuation:false})));
  const BX=175, BY=92, BZ=0;                                                   /* position de l'être cosmique */
  const rift=new THREE.Sprite(new THREE.SpriteMaterial({map:czGlowTex('#ff5cf0','rgba(90,40,255,.35)'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); rift.scale.set(260,180,1); rift.position.set(BX+70,BY+10,BZ); sc.add(rift);
  /* l'être cosmique : corps de cristal, tête, yeux, bras, halos, nuée d'étoiles */
  const being=new THREE.Group(); being.position.set(BX,BY,BZ); sc.add(being);
  const crys=new THREE.MeshBasicMaterial({color:0x8a5cff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,wireframe:false});
  const wire=new THREE.MeshBasicMaterial({color:0xd6c2ff,transparent:true,opacity:0,wireframe:true,fog:false});
  const torso=new THREE.Mesh(new THREE.IcosahedronGeometry(13,1),crys); torso.scale.set(1,1.5,.8); being.add(torso); const tw=new THREE.Mesh(torso.geometry,wire); tw.scale.copy(torso.scale); being.add(tw);
  const head=new THREE.Mesh(new THREE.IcosahedronGeometry(7,1),crys); head.position.y=27; being.add(head); const hw=new THREE.Mesh(head.geometry,wire); hw.position.copy(head.position); being.add(hw);
  const eyeM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,fog:false}); const eyes=[-2.6,2.6].map(x=>{ const e=new THREE.Mesh(new THREE.SphereGeometry(1.2,10,8),eyeM); e.position.set(x,28,6); being.add(e); return e; });
  const arms=[-1,1].map(s=>{ const g=new THREE.Group(); g.position.set(s*13,10,0); const a=new THREE.Mesh(new THREE.CylinderGeometry(2.4,1.4,26,8),crys); a.position.y=-12; g.add(a); const aw=new THREE.Mesh(a.geometry,wire); aw.position.copy(a.position); g.add(aw); g.rotation.z=s*.5; being.add(g); return g; });
  const halos=[0,1,2].map(k=>{ const h=new THREE.Mesh(new THREE.TorusGeometry(24+k*9,.35,8,90),new THREE.MeshBasicMaterial({color:[0x00e5ff,0xff2bd6,0xffd24a][k],transparent:true,opacity:0,fog:false,blending:THREE.AdditiveBlending,depthWrite:false})); h.position.y=26; being.add(h); return h; });
  const bodyGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:czGlowTex('#c8a6ff','rgba(120,60,255,.3)'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); bodyGlow.scale.set(150,170,1); bodyGlow.position.y=8; being.add(bodyGlow);
  const np=[]; for(let i=0;i<700;i++){ const r=18+Math.random()*40, a=Math.random()*Math.PI*2, y=(Math.random()-.4)*70; np.push(Math.cos(a)*r,y,Math.sin(a)*r*.6); }
  const ng=new THREE.BufferGeometry(); ng.setAttribute('position',new THREE.Float32BufferAttribute(np,3)); const nebula=new THREE.Points(ng,new THREE.PointsMaterial({color:0xe8d8ff,size:1.3,map:dotT,transparent:true,opacity:0,fog:false,blending:THREE.AdditiveBlending,depthWrite:false})); being.add(nebula);
  /* la boule d'énergie */
  const ball=new THREE.Group(); sc.add(ball); const core=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:0xffffff,fog:false})); ball.add(core);
  const bglow=new THREE.Sprite(new THREE.SpriteMaterial({map:czGlowTex('#b98cff','rgba(255,43,214,.35)'),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); bglow.scale.set(5,5,1); ball.add(bglow); ball.visible=false;
  const blight=new THREE.PointLight(0xc39bff,0,260); ball.add(blight);
  /* onde de choc + lumière d'impact */
  const IX=20, wave=new THREE.Mesh(new THREE.TorusGeometry(1,.6,8,80),new THREE.MeshBasicMaterial({color:0xd8b8ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false})); wave.rotation.x=Math.PI/2; wave.position.set(IX,.6,0); sc.add(wave);
  const flashL=new THREE.PointLight(0xffffff,0,200); flashL.position.set(IX,12,0); sc.add(flashL);
  /* voitures : tes voitures (ou des modèles du jeu), chacune avec la couleur de son type */
  const mids=(S.cars||[]).map(c=>c.mid).filter(id=>M[id]&&id!=='velo').slice(0,6); const pool=['fury','rossa','touge','patrouille','aurion','gts','kombi','majestic']; while(mids.length<6) mids.push(pool[mids.length%pool.length]);
  const cars=mids.map((mid,i)=>{ const c=buildCar(M[mid],'#fff',{}); sc.add(c.g); const ty=cbTypesOf(mid)[0], tc=new THREE.Color(CB_TYPES[ty].c);
    const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:czGlowTex(CB_TYPES[ty].c,'rgba(255,255,255,.12)'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false})); aura.scale.set(9,6,1); aura.position.y=1.2; c.g.add(aura);
    const pl=new THREE.PointLight(tc,0,16); pl.position.y=2; c.g.add(pl);
    const orb=new THREE.Sprite(new THREE.SpriteMaterial({map:czGlowTex(CB_TYPES[ty].c,'rgba(255,255,255,.2)'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); orb.scale.set(6,6,1); sc.add(orb);
    return {c,mid,ty,aura,pl,orb,lane:i%2?2.6:-2.6,x0:-250+i*11+(i%2)*4,stop:IX-22+i*7.5,hit:CZ_IMPACT+.9+i*.75}; });
  /* particules qui montent autour des voitures éveillées */
  const rp=[]; for(let i=0;i<500;i++) rp.push(IX-25+Math.random()*50,Math.random()*12,(Math.random()-.5)*10); const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));
  const rise=new THREE.Points(rg,new THREE.PointsMaterial({color:0xffe0ff,size:.16,map:dotT,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false})); sc.add(rise);
  const carX=(k,t)=>{ const v=17, tStop=CZ_IMPACT-.4, xs=k.x0+v*tStop; if(t<tStop) return k.x0+v*t; const u=Math.min(1,(t-tStop)/1.6), xe=Math.min(xs+12,k.stop+30); return xs+(xe-xs)*(1-Math.pow(1-u,3)); };
  const T={sc,cam,t:0,done:false,cars}; const LT=new THREE.Vector3(), tmp=new THREE.Vector3(); let init=false, shake=0; const fired={};
  const at=(k,t)=>{ if(T.t>=t&&!fired[k]){ fired[k]=1; return true; } return false; };
  T.tick=(dt,time)=>{ if(!T.t0) T.t0=time; const t=Math.min(CZ_END,(time-T.t0)*(T.speed||1)); T.t=t;
    /* voitures */
    cars.forEach((k,i)=>{ const x=carX(k,t), g=k.c.g; g.position.set(x,0,k.lane+.25*Math.sin(t*1.2+i)); g.rotation.y=0; const v=t<CZ_IMPACT-.4?17:Math.max(0,17*(1-(t-(CZ_IMPACT-.4))/1.6));
      (k.c.wheels||[]).forEach(w=>{ w.rotation.z-=v*dt/(k.c.wr||.34); });
      if(t>=CZ_IMPACT-.1&&t<CZ_IMPACT+.6) g.position.y=Math.sin((t-CZ_IMPACT)*14)*.25*Math.max(0,1-(t-CZ_IMPACT)/.6);
      /* salve : un orbe part de l'être vers chaque voiture */
      const h0=k.hit-1.1; if(t>=h0&&t<k.hit){ const u=czE((t-h0)/1.1); k.orb.material.opacity=1; k.orb.position.set(BX+(x-BX)*u,BY+(1.5-BY)*u+Math.sin(u*Math.PI)*25,BZ+(k.lane-BZ)*u); } else k.orb.material.opacity=0;
      if(at('h'+i,k.hit)){ czTone(1400,300,.5,'triangle',.08); czTone(220,90,.4,'sawtooth',.05); shake=Math.max(shake,.25); }
      const ga=t<k.hit?0:czE((t-k.hit)/.8); k.aura.material.opacity=ga*(.75+.25*Math.sin(t*5+i)); k.pl.intensity=ga*2.2*(.8+.2*Math.sin(t*6+i)); });
    /* l'être cosmique */
    const ap=czE((t-6.6)/3.4)*(1-czE((t-27)/4)); rift.material.opacity=czE((t-6.4)/2)*(1-czE((t-28)/5))*.9;
    crys.opacity=ap*.38; wire.opacity=ap*.55; eyeM.opacity=czE((t-11.2)/.8)*(1-czE((t-27)/4)); bodyGlow.material.opacity=ap*.55; nebula.material.opacity=ap*.85;
    halos.forEach((h,k)=>{ h.material.opacity=ap*.75; h.rotation.x=1.2+Math.sin(t*.4+k)*.3; h.rotation.y=t*(.3+k*.15); });
    being.rotation.y=Math.sin(t*.3)*.15; being.position.y=BY+Math.sin(t*.8)*2; nebula.rotation.y=t*.08;
    const lift=czE((t-11.5)/2.5)*(1-czE((t-16.4)/.6)); arms.forEach((a,k)=>{ a.rotation.z=(k?1:-1)*(.5+lift*1.6); a.rotation.x=-lift*.6; });
    /* boule : charge (11,5 → 16,4), chute (16,4 → 18), impact */
    const ballP=new THREE.Vector3(BX,BY+44,BZ+6);
    if(t>=11.5&&t<CZ_IMPACT){ ball.visible=true; if(t<16.4){ const s=czE((t-11.5)/4.9)*13; ball.position.copy(ballP); core.scale.setScalar(Math.max(.2,s*.55)); bglow.scale.set(s*4+2,s*4+2,1); blight.intensity=s*.5; }
      else { const u=Math.pow((t-16.4)/(CZ_IMPACT-16.4),2.2); ball.position.set(ballP.x+(IX-ballP.x)*u,ballP.y+(2-ballP.y)*u,ballP.z+(0-ballP.z)*u); core.scale.setScalar(5*(1-u*.4)); bglow.scale.set(30,30,1); blight.intensity=6+u*10; } }
    else ball.visible=false;
    if(at('charge',11.5)) czTone(60,420,4.9,'sawtooth',.06);
    if(at('drone',6.6)){ czTone(55,48,9,'sine',.16); czTone(82,74,9,'triangle',.06); }
    if(at('fall',16.4)) czTone(900,70,1.6,'sawtooth',.07);
    if(at('boom',CZ_IMPACT)){ czBoom(2.2,.7); shake=1.2; const f=document.getElementById('czFlash'); if(f){ f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); } }
    const iu=(t-CZ_IMPACT)/2.2; if(iu>=0&&iu<1){ wave.scale.setScalar(1+iu*90); wave.material.opacity=(1-iu)*.9; flashL.intensity=(1-iu)*14; } else { wave.material.opacity=0; flashL.intensity=0; }
    if(at('shimmer',24)) [523,659,784,988,1318].forEach((f,i)=>czTone(f,f*1.01,2.4,'sine',.035,i*.18));
    if(at('final',33.4)) [262,392,523,784].forEach((f,i)=>czTone(f,f,3,'triangle',.05,i*.12));
    rise.material.opacity=czE((t-20)/3)*.9; { const a=rg.attributes.position; for(let i=0;i<a.count;i++){ let y=a.getY(i)+dt*(2+(i%5)); if(y>14) y=0; a.setY(i,y); } a.needsUpdate=true; }
    /* caméra */
    const lead=cars[2], lx=carX(lead,t); let pos=new THREE.Vector3(), look=new THREE.Vector3(), fov=66;
    if(t<6.4){ pos.set(lx-9,1.3,7.2); look.set(lx+12,1.1,0); }
    else if(t<10){ const u=czE((t-6.4)/3.6); pos.set(lx-9,1.3+u*1.2,7.2); look.set(lx+12+(BX-lx-12)*u,1.1+(BY-1.1)*u*.85,0+BZ*u); fov=66+u*6; }
    else if(t<16.4){ const u=czE((t-10)/6.4); pos.set(lx-6+u*4,1.8,4); look.set(BX,BY+18*u,BZ); fov=72-u*16; }
    else if(t<CZ_IMPACT+.2){ pos.set(IX-46,2.6,5); look.copy(ball.visible?ball.position:new THREE.Vector3(IX,0,0)); fov=62; }
    else if(t<24){ const u=czE((t-CZ_IMPACT)/6); pos.set(IX-34+u*8,5.5-u*2.5,5.5); look.set(IX+6,2+u*10*Math.sin(u*Math.PI),0); fov=62; }
    else if(t<30){ const cx=cars.reduce((a,k)=>a+carX(k,t),0)/cars.length, a=Math.PI*.95-(t-24)*.3; pos.set(cx+Math.cos(a)*26,3.4,Math.sin(a)*5.5); look.set(cx,1.2,0); fov=60; }
    else { const cx=cars.reduce((a,k)=>a+carX(k,t),0)/cars.length, u=czE((t-30)/8); pos.set(cx+30-u*6,1.4+u*1.5,3.5-u*1.5); look.set(cx-6,1.6+u*3,0); fov=60+u*6; }
    if(!init){ LT.copy(look); init=true; } else LT.lerp(look,1-Math.exp(-6*Math.max(.001,dt)));
    shake*=Math.pow(.02,dt); cam.position.copy(pos); if(shake>.01){ cam.position.x+=(Math.random()-.5)*shake; cam.position.y+=(Math.random()-.5)*shake*.7; }
    cam.lookAt(LT); if(Math.abs(cam.fov-fov)>.05){ cam.fov+=(fov-cam.fov)*Math.min(1,dt*4); cam.updateProjectionMatrix(); }
    /* sous-titres, voix, titre */
    CZ_VO.forEach(([id,t0])=>{ if(at('v'+id,t0)&&t<t0+1.5) czPlay(id); });
    const cap=document.getElementById('czCap'); if(cap){ const c=CZ_VO.filter(v=>t>=v[1]&&t<v[1]+(({c1:5.6,c2:3.4,c3:4.9,c4:2.6,c5:4.8,c6:5.4})[v[0]]||4)).pop(); const txt=c?c[2]:''; if(cap.dataset.t!==txt){ cap.dataset.t=txt; cap.textContent=txt; cap.classList.toggle('on',!!txt); } }
    const tt=document.getElementById('czTitle'); if(tt) tt.classList.toggle('on',t>=33.4);
    if(t>=CZ_END&&!T.done){ T.done=true; T.fin&&T.fin(); } };
  return T; }

/* ---- lancement ---- */
function czStart(done,opt){ opt=opt||{};
  if(document.getElementById('cosmic')){ return; } if(!glEnsure()){ done&&done(); return; }
  const ov=document.createElement('div'); ov.id='cosmic'; ov.innerHTML='<div class="cz-bar t"></div><div class="cz-bar b"></div><div class="cz-flash" id="czFlash"></div><div class="cz-cap" id="czCap"></div><div class="cz-title" id="czTitle"><b>ÉVEIL COSMIQUE</b><span>Le mode Combat est débloqué</span></div><button class="cz-skip" id="czSkip">Passer ▸▸</button><div class="cz-go" id="czGo"><b>🌌 L’ÉVEIL</b><span>Touche l’écran pour lancer la cinématique<br>🔊 son recommandé</span></div><div id="upd" style="display:none!important"></div>';
  document.body.appendChild(ov); let ended=false, T=null;
  const finish=()=>{ if(ended) return; ended=true; czStopAll(); try{ glStop(); if(T) disposeScene(T.sc); }catch(_){} ov.remove(); try{ ambMute&&ambMute(false); }catch(_){} done&&done(); };
  document.getElementById('czSkip').onclick=e=>{ e.stopPropagation(); finish(); };
  const go=async()=>{ const g=document.getElementById('czGo'); if(g) g.remove(); try{ auUnlock(); }catch(_){} try{ ambMute&&ambMute(true); }catch(_){} czPrep();
    try{ await ensureModels(); }catch(_){}
    try{ T=czBuild(); T.speed=opt.speed||1; T.fin=finish; window.__cz=T; glAttach('cosmic'); glRun(T.sc,T.cam,T.tick,'race'); }catch(e){ try{ console.warn('éveil',e); }catch(_){} finish(); } };
  if(opt.auto) go(); else document.getElementById('czGo').onclick=go; }

/* ---- confirmation au niveau 10, puis déblocage ---- */
const CB_LV=10;
function czAwaken(opt){ czStart(()=>{ const first=!S.niveau10CinematicSeen; S.niveau10CinematicSeen=true; cbBag(); try{ S.cars.forEach(c=>cbOf(c)); }catch(_){} save(); if(first) openSheet({t:'cbunlock'}); else try{ render(); }catch(_){} },opt); }
{ const _sx=sheetExtra; sheetExtra=function(X){
  if(sheet&&sheet.t==='lv10'){ $('sheet').innerHTML=`<div class="tuto gtu cz-sh">${X}<div class="tu-ic">🌌</div><h2>Niveau ${CB_LV} atteint !</h2>
      <p>Quelque chose se prépare au-dessus de la ville… Confirme ton passage au <b>niveau ${CB_LV}</b> pour découvrir ce qui arrive à tes voitures.</p>
      <p class="note">Une cinématique d’environ 40 secondes va se lancer (son recommandé). Elle débloque le <b>mode Combat</b> : des duels au tour par tour, séparés des courses.</p>
      <div class="tu-btns"><button class="btn alt" data-a="lv10later">Plus tard</button><button class="btn" data-a="lv10go">✨ Je passe au niveau ${CB_LV}</button></div></div>`; return true; }
  if(sheet&&sheet.t==='cbunlock'){ const t=cbTeam().map(u=>car(u)).filter(Boolean);
    $('sheet').innerHTML=`<div class="tuto gtu cz-sh">${X}<div class="tu-ic">⚔️</div><h2>Mode Combat débloqué</h2>
      <p>L’énergie cosmique a éveillé des <b>super-pouvoirs</b> dans tes voitures. Chacune a maintenant des <b>types</b>, des <b>IV</b>, un <b>talent</b>, son propre <b>niveau de combat</b> et <b>4 attaques</b>.</p>
      <div class="ulist">${t.map(c=>{ const s=cbOf(c); return `<div class="ul-r"><i>${CB_TYPES[s.ty[0]].ic}</i><div><b>${M[c.mid].nom} · niv. ${s.lv}</b><small>${s.ty.map(x=>CB_TYPES[x].n).join(' / ')} · ${CB_TAL[s.tal].n}</small></div></div>`; }).join('')}</div>
      <p class="note">Ces pouvoirs ne servent qu’en duel : les courses ne changent pas. Tu retrouves les fiches dans le garage et l’Arène dans Épreuves.</p>
      <div class="tu-btns"><button class="btn alt" data-a="close">Plus tard</button><button class="btn" data-a="cbarena">⚔️ Aller à l’Arène</button></div></div>`; return true; }
  return _sx.apply(this,arguments); }; }
Object.assign(ACT,{
  lv10go(){ closeSheet(); czAwaken(); },
  lv10later(){ S.lv10Later=Date.now(); save(); closeSheet(); toast('L’éveil t’attend dans Épreuves'); },
  cosmic(){ if(!S.niveau10CinematicSeen) return; czAwaken(); },
  cbarena(){ closeSheet(); if(typeof ACT.arena==='function') return ACT.arena(); ACT.tab({id:'epreuves'}); }
});
/* proposition automatique : au niveau 10 (ou plus pour les sauvegardes existantes), hors course et hors fenêtre ; « Plus tard » = 20 min */
setInterval(()=>{ try{ if(!S||!S.intro||S.niveau10CinematicSeen||S.lvl<CB_LV) return; if(S.lv10Later&&Date.now()-S.lv10Later<20*60e3) return;
  if(sheet||view==='race'||document.body.classList.contains('racing')||['cine','upd','arcov','cosmic','cbov','pkov','tx'].some(i=>document.getElementById(i))) return;
  openSheet({t:'lv10'}); }catch(e){} },3000);
/* Épreuves : encart d'accès (l'Arène complète arrive avec les tournois) ; Réglages : revoir l'éveil */
{ const _r=render; render=function(){ const r=_r.apply(this,arguments); try{
  if(view==='epreuves'&&S.lvl>=CB_LV){ const v=$('view'); if(v&&!v.querySelector('.cz-entry')){ const h=v.querySelector('.head'); const html=S.niveau10CinematicSeen?'':`<button class="cz-entry" data-a="lv10ask"><b>🌌 L’éveil cosmique</b><small>Niveau ${CB_LV} atteint : quelque chose se prépare…</small></button>`; if(h) h.insertAdjacentHTML('afterend',html); else v.insertAdjacentHTML('afterbegin',html); } }
  if(S.niveau10CinematicSeen){ const b=document.querySelector('#view [data-a="cine"]'); if(b&&!document.querySelector('#view [data-a="cosmic"]')) b.insertAdjacentHTML('afterend',' <button class="btn alt" data-a="cosmic">🌌 Revoir l’éveil cosmique</button>'); }
  }catch(e){} return r; }; }
ACT.lv10ask=()=>openSheet({t:'lv10'});
if(typeof ACT.arena!=='function') ACT.arena=()=>ACT.cbtrain();
