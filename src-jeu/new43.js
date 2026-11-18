/* ---- v0.65b : ambiance « weed » du labo : musique reggae / dub / chill + décor ---- */
const LM={ctx:null,on:false,timer:0,next:0,step:0,master:null,dly:null,nbuf:null,bar:0,pad:null};
const labActive=()=>{ try{ return view==='hub'&&HUB&&HUB.map&&GROW[HUB.map]&&!document.hidden&&!document.body.classList.contains('racing'); }catch(e){ return false; } };
const labVol=()=>{ try{ const a=S.audio||{}; if(a.mute) return 0; return .5*(a.master==null?.9:a.master)*(a.music==null?.7:a.music)/.63; }catch(e){ return .5; } };
function labMusicStart(){ if(LM.on) return; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  try{ LM.ctx=LM.ctx||new AC(); const c=LM.ctx; if(c.state==='suspended') c.resume(); if(c.state==='suspended') return;
    LM.master=c.createGain(); LM.master.gain.value=0; LM.master.connect(c.destination); LM.master.gain.setTargetAtTime(labVol(),c.currentTime,.8);
    /* écho dub */
    const dl=c.createDelay(2); dl.delayTime.value=60/72*.75; const fb=c.createGain(); fb.gain.value=.5; const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1800; const wet=c.createGain(); wet.gain.value=.6;
    dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(LM.master); LM.dly=dl;
    const len=c.sampleRate*2, buf=c.createBuffer(1,len,c.sampleRate), d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; LM.nbuf=buf;
    LM.on=true; LM.step=0; LM.bar=0; LM.next=c.currentTime+.15; LM.timer=setInterval(labSched,100);
  }catch(e){ LM.on=false; } }
function labMusicStop(){ if(!LM.on) return; LM.on=false; clearInterval(LM.timer); const m=LM.master, c=LM.ctx; try{ m.gain.cancelScheduledValues(c.currentTime); m.gain.setTargetAtTime(0,c.currentTime,.25); setTimeout(()=>{ try{ m.disconnect(); }catch(_){} },1500); }catch(_){} }
function labSched(){ const c=LM.ctx; if(!c||!LM.on) return; while(LM.next<c.currentTime+.4){ try{ labStep(LM.step,LM.next); }catch(e){} LM.next+=60/72/2; LM.step++; if(LM.step%8===0) LM.bar=(LM.step/8)|0; } }
function labStep(n,t){ const c=LM.ctx, M=LM.master, st=n%8, bar=((n/8)|0)%16, ph=(bar>=12?2:bar>=8?1:0), hz=m=>440*Math.pow(2,(m-69)/12), roots=[33,38,33,40], r=roots[bar%4];
  const drop=bar>=12;
  const tone=(type,f,t0,dur,vol,lpf,send,att)=>{ const o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.value=f; const a=att||.008; g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+a); g.gain.exponentialRampToValueAtTime(.001,t0+dur); let n2=o; if(lpf){ const f2=c.createBiquadFilter(); f2.type='lowpass'; f2.frequency.value=lpf; o.connect(f2); n2=f2; } n2.connect(g); g.connect(M); if(send){ const s=c.createGain(); s.gain.value=send; g.connect(s); s.connect(LM.dly); } o.start(t0); o.stop(t0+dur+.05); };
  const noise=(t0,dur,vol,f,type,send)=>{ const ns=c.createBufferSource(); ns.buffer=LM.nbuf; const fl=c.createBiquadFilter(); fl.type=type||'highpass'; fl.frequency.value=f; const g=c.createGain(); g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.001,t0+dur); ns.connect(fl); fl.connect(g); g.connect(M); if(send){ const s=c.createGain(); s.gain.value=send; g.connect(s); s.connect(LM.dly); } ns.start(t0,Math.random()*1.5); ns.stop(t0+dur+.05); };
  const kick=(t0,v)=>{ const k=c.createOscillator(), g=c.createGain(); k.frequency.setValueAtTime(110,t0); k.frequency.exponentialRampToValueAtTime(38,t0+.22); g.gain.setValueAtTime(v,t0); g.gain.exponentialRampToValueAtTime(.001,t0+.32); k.connect(g); g.connect(M); k.start(t0); k.stop(t0+.36); };
  /* batterie « one drop » : kick + cross-stick sur le temps 3 */
  if(!drop){ if(st===4){ kick(t,.62); noise(t,.07,.22,1800,'bandpass',.45); tone('triangle',420,t,.07,.12,null,.3); } if(st===0&&bar%2===0) kick(t,.34); }
  else { /* drop dubstep : demi-temps */ if(st===0){ kick(t,.7); } if(st===4){ kick(t,.5); noise(t,.18,.3,1400,'bandpass',.5); } }
  /* charley sur les contretemps */
  noise(t,.035,st%2?.06:.025,8000); if(st%2===1&&ph>0) noise(t+.02,.05,.03,9500);
  /* basse : ronde, profonde */
  if(!drop){ if([0,3,4,6].includes(st)){ const note=r+(st===4?7:st===6?10:0); tone('sine',hz(note),t,st===0?.7:.3,.5,260); tone('triangle',hz(note+12),t,.22,.07,500); } }
  else { if(st===0||st===4){ /* wobble */
      const o=c.createOscillator(), g=c.createGain(), f=c.createBiquadFilter(), lfo=c.createOscillator(), lg=c.createGain(); o.type='sawtooth'; o.frequency.value=hz(r); f.type='lowpass'; f.Q.value=7; f.frequency.value=400; lfo.frequency.value=3.4; lg.gain.value=340; lfo.connect(lg); lg.connect(f.frequency);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.26,t+.03); g.gain.setTargetAtTime(0,t+.75,.08); o.connect(f); f.connect(g); g.connect(M); o.start(t); lfo.start(t); o.stop(t+1.05); lfo.stop(t+1.05); } }
  /* skank : accords sur les contretemps, envoyés dans l'écho */
  if(st%2===1&&!(drop&&bar%2)){ [0,3,7].forEach(i=>tone('square',hz(r+24+i),t,.1,.028,1500,.5)); tone('triangle',hz(r+31),t,.12,.03,1800,.5); }
  /* nappe chill : une note longue tous les 2 temps forts */
  if(st===0&&bar%2===0){ [0,3,7,10].forEach((i,k)=>tone('sine',hz(r+24+i),t,3.2,.05,1200,.25,.9)); }
  /* mélodica / flûte pentatonique */
  if(ph>=1&&!drop&&(st===2||st===5)&&Math.random()<.55){ const pent=[0,3,5,7,10,12,15], nt=r+36+pent[(Math.random()*pent.length)|0]; const o=c.createOscillator(), v=c.createOscillator(), vg=c.createGain(), g=c.createGain(); o.type='triangle'; o.frequency.value=hz(nt); v.frequency.value=5.2; vg.gain.value=hz(nt)*.012; v.connect(vg); vg.connect(o.frequency); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.06,t+.05); g.gain.exponentialRampToValueAtTime(.001,t+.7); o.connect(g); g.connect(M); const s=c.createGain(); s.gain.value=.55; g.connect(s); s.connect(LM.dly); o.start(t); v.start(t); o.stop(t+.8); v.stop(t+.8); }
  /* gargouillis de bang, discret, de temps en temps */
  if(st===6&&bar%8===5){ for(let k=0;k<5;k++){ const o=c.createOscillator(), g=c.createGain(), tt=t+k*.09; o.frequency.setValueAtTime(260+k*40,tt); o.frequency.exponentialRampToValueAtTime(620+k*60,tt+.07); g.gain.setValueAtTime(.05,tt); g.gain.exponentialRampToValueAtTime(.001,tt+.08); o.connect(g); g.connect(M); o.start(tt); o.stop(tt+.1); } }
}
/* bouton musique dans le labo */
function labBtn(){ let b=document.getElementById('lmBtn'); const on=labActive()&&!sheet; if(!on){ if(b) b.remove(); return; } if(!b){ b=document.createElement('button'); b.id='lmBtn'; b.dataset.a='lmtoggle'; document.body.appendChild(b); } const off=!!(S&&S.labMusicOff); const t=off?'🔇':'🎵'; if(b.textContent!==t) b.textContent=t; b.setAttribute('aria-label',off?'Activer la musique du labo':'Couper la musique du labo'); }
ACT.lmtoggle=()=>{ S.labMusicOff=!S.labMusicOff; try{ save(); }catch(e){} toast(S.labMusicOff?'Musique du labo coupée':'🎵 Ambiance reggae / dub'); labWatch(); };
let labAmb=false;
function labWatch(){ try{ const act=labActive(); if(act&&!labAmb){ labAmb=true; ambMute(true); } else if(!act&&labAmb){ labAmb=false; if(!WM.on) ambMute(false); } const want=labActive()&&!S.labMusicOff&&labVol()>0; if(want&&!LM.on) labMusicStart(); else if(!want&&LM.on) labMusicStop(); if(LM.on&&LM.master) LM.master.gain.setTargetAtTime(labVol(),LM.ctx.currentTime,.3); labBtn(); }catch(e){} }
setInterval(labWatch,500);
document.addEventListener('visibilitychange',()=>{ if(document.hidden) labMusicStop(); });
/* décor cannabis : feuilles néon, bandes rasta, brume verte, feuilles qui flottent */
function leafTex(col){ const cv=document.createElement('canvas'); cv.width=cv.height=128; const x=cv.getContext('2d'); x.translate(64,118); const lobes=[[0,100,11],[28,86,10],[-28,86,10],[58,64,9],[-58,64,9],[88,42,7],[-88,42,7]];
  lobes.forEach(([a,len,w])=>{ x.save(); x.rotate(a*Math.PI/180); const g=x.createLinearGradient(0,0,0,-len); g.addColorStop(0,'#0f5a2c'); g.addColorStop(1,col); x.fillStyle=g; x.beginPath(); x.moveTo(0,0); x.quadraticCurveTo(w*1.4,-len*.5,0,-len); x.quadraticCurveTo(-w*1.4,-len*.5,0,0); x.fill(); x.strokeStyle='rgba(255,255,255,.35)'; x.lineWidth=1.2; x.beginPath(); x.moveTo(0,-4); x.lineTo(0,-len*.85); x.stroke(); x.restore(); });
  x.strokeStyle='#0f5a2c'; x.lineWidth=4; x.beginPath(); x.moveTo(0,0); x.lineTo(0,10); x.stroke(); const t=new THREE.CanvasTexture(cv); return t; }
function weedDecor(room){ const H=HUB, sc=H.scene; if(!sc||!window.THREE) return; const G=GROW[room], out=G.out, BX=G.bx, BZ=G.bz; const wz={haze:[],leaves:[]}; H.wz=wz;
  const T1=leafTex('#3cff9e'), T2=leafTex('#b6ff4d'), T3=leafTex('#7dffd0');
  const plane=(tex,w,h,x,y,z,ry)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,depthWrite:false})); m.position.set(x,y,z); if(ry) m.rotation.y=ry; sc.add(m); return m; };
  const box=(w,h,d,x,y,z,c)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:c})); m.position.set(x,y,z); sc.add(m); return m; };
  if(!out){
    [-17,1,15].forEach((x,i)=>{ plane([T1,T2,T3][i],4.6,4.6,x,7.6,-BZ+.2); }); plane(T1,3.4,3.4,BX-.3,7.4,-6,-Math.PI/2); plane(T2,3.4,3.4,-BX+.3,7.4,-6,Math.PI/2);
    [[0xe8202a,9.55],[0xfcd116,9.3],[0x13a538,9.05]].forEach(([c,y])=>box(BX*2-2,.14,.1,0,y,-BZ+.12,c));
    [[0xe8202a,9.55],[0xfcd116,9.3],[0x13a538,9.05]].forEach(([c,y])=>{ box(.1,.14,BZ*2-2,BX-.12,y,0,c); box(.1,.14,BZ*2-2,-BX+.12,y,0,c); });
    const sg=labelSprite('🍃 IRIE · 420 🍃','#3CFF9E',22); sg.position.set(-8,10.6,-BZ+.6); sg.material.depthTest=false; sg.renderOrder=20; sc.add(sg);
    for(let i=0;i<(window.__lq?4:12);i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:growCache().glowM.map,color:i%3?0x6dffb0:0xc9ff7a,transparent:true,opacity:.1,depthWrite:false,fog:false})); s.scale.set(16,10,1); s.position.set((Math.random()*2-1)*BX*.9,2+Math.random()*5,(Math.random()*2-1)*BZ*.9); wz.haze.push({s,x:s.position.x,z:s.position.z,p:Math.random()*6,sp:.15+Math.random()*.2}); sc.add(s); }
    const l1=new THREE.PointLight(0x3cff9e,.9,60); l1.position.set(-14,7,-6); sc.add(l1); const l2=new THREE.PointLight(0xfcd116,.5,50); l2.position.set(14,7,-8); sc.add(l2);
  } else {
    plane(T1,6,6,-BX+2,6,-BZ+.2); plane(T2,6,6,BX-2,6,-BZ+.2); const sg=labelSprite('🍃 IRIE · 420 🍃','#B6FF4D',22); sg.position.set(0,12,-BZ-2); sg.material.depthTest=false; sg.renderOrder=20; sc.add(sg);
    for(let i=0;i<(window.__lq?3:8);i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:growCache().glowM.map,color:0xc9ff7a,transparent:true,opacity:.08,depthWrite:false,fog:false})); s.scale.set(22,12,1); s.position.set((Math.random()*2-1)*BX,3+Math.random()*5,(Math.random()*2-1)*BZ); wz.haze.push({s,x:s.position.x,z:s.position.z,p:Math.random()*6,sp:.12+Math.random()*.15}); sc.add(s); }
  }
  for(let i=0;i<(window.__lq?(out?5:8):(out?14:22));i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:[T1,T2,T3][i%3],transparent:true,opacity:.8,depthWrite:false})); const sz=.7+Math.random()*.8; sp.scale.set(sz,sz,1); const x=(Math.random()*2-1)*BX*.9, z=(Math.random()*2-1)*BZ*.9, y=1+Math.random()*7; sp.position.set(x,y,z); wz.leaves.push({s:sp,x,z,y,p:Math.random()*6,sp:.25+Math.random()*.4}); sc.add(sp); }
}
const _gb43=growBuild; growBuild=function(room){ _gb43(room); try{ weedDecor(room); }catch(e){ console.error(e); } };
const _gt43=growTick; growTick=function(dt){ _gt43(dt); try{ const w=HUB.wz, t=HUB.t||0; if(!w) return; w.haze.forEach(h=>{ h.s.position.x=h.x+Math.sin(t*h.sp+h.p)*3; h.s.position.z=h.z+Math.cos(t*h.sp*.8+h.p)*2.5; h.s.material.opacity=.07+.04*Math.sin(t*.5+h.p); }); w.leaves.forEach(l=>{ l.s.position.y=l.y+Math.sin(t*l.sp+l.p)*.6; l.s.position.x=l.x+Math.sin(t*l.sp*.7+l.p)*.8; l.s.material.rotation=Math.sin(t*l.sp+l.p)*.6; }); }catch(e){} };
