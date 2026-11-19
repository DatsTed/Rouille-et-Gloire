/* ===== v0.45 : moteur de musique du pinball (techno / drum & bass / dubstep / hard), suit la vitesse ===== */
const PMS={
 techno:{n:'TECHNO',bpm:128,th:{a:'#00e5ff',b:'#ff2bd6',c:['#ffd400','#1fe06a','#ff2d2d'],bg:['#0c0620','#1a0a2e'],grid:'rgba(120,90,255,.12)'}},
 dnb:{n:'DRUM & BASS',bpm:172,th:{a:'#3cff9e',b:'#ffd400',c:['#00e5ff','#ff2bd6','#ff9a1a'],bg:['#03140c','#0b2a1c'],grid:'rgba(60,255,158,.12)'}},
 dub:{n:'DUBSTEP',bpm:140,th:{a:'#b05cff',b:'#ff7a1a',c:['#ff2bd6','#00e5ff','#ffd400'],bg:['#14041f','#2a0838'],grid:'rgba(176,92,255,.14)'}},
 hard:{n:'HARD TECHNO',bpm:150,th:{a:'#ff3b3b',b:'#ffffff',c:['#ffd400','#ff7a1a','#ff2bd6'],bg:['#1a0404','#2e0a0a'],grid:'rgba(255,60,60,.14)'}}
};
const pmStyleOf=lv=>lv>=15?'hard':lv>=10?'dub':lv>=5?'dnb':'techno';
const PM={ctx:null,on:false,timer:0,next:0,step:0,key:'techno',I:0,mode:null,turbo:false,multi:false,pulse:0,muted:false,master:null,nbuf:null,dist:null,lv:1,vol:0};
PM.volTarget=()=>{ let v=.5; try{ const a=S.audio||{}; if(a.mute) return 0; v=.5*(a.master==null?.9:a.master)*(a.music==null?.7:a.music)/.63; }catch(_){} return PM.muted?0:v; };
PM.setVol=()=>{ if(PM.master&&PM.ctx) PM.master.gain.setTargetAtTime(PM.volTarget(),PM.ctx.currentTime,.15); };
PM.begin=function(key,lv){
  if(PM.on) PM.end(true); const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  try{ PM.ctx=PM.ctx||new AC(); const c=PM.ctx; if(c.state==='suspended') c.resume();
    PM.master=c.createGain(); PM.master.gain.value=0; const cp=c.createDynamicsCompressor(); cp.threshold.value=-14; cp.ratio.value=5; PM.master.connect(cp); cp.connect(c.destination);
    if(!PM.nbuf){ const len=c.sampleRate, b=c.createBuffer(1,len,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; PM.nbuf=b; }
    const cv=new Float32Array(1024); for(let i=0;i<1024;i++){ const x=i/512-1; cv[i]=Math.tanh(x*4); } PM.dist=c.createWaveShaper(); PM.dist.curve=cv; PM.dist.connect(PM.master);
    PM.on=true; PM.key=key; PM.lv=lv; PM.step=0; PM.I=0; PM.mode=null; PM.turbo=false; PM.multi=false; PM.next=c.currentTime+.12; PM.timer=setInterval(PM.sched,50); PM.setVol(); try{ ambMute(true); }catch(_){} }catch(e){ PM.on=false; console.error(e); } };
PM.end=function(quick){
  if(!PM.on) return; PM.on=false; clearInterval(PM.timer); const m=PM.master, c=PM.ctx; try{ m.gain.setTargetAtTime(0,c.currentTime,quick?.02:.25); setTimeout(()=>{ try{ m.disconnect(); }catch(_){} },quick?200:1200); }catch(_){}
  if(!quick){ try{ if(!WM.on) ambMute(false); }catch(_){} } };
PM.bpm=()=>PMS[PM.key].bpm*(.95+.1*PM.I)*(PM.turbo?1.05:1);
PM.sched=function(){ const c=PM.ctx; if(!PM.on||!c) return; let g=0; while(PM.next<c.currentTime+.28&&g++<16){ try{ PM.stepAt(PM.step,PM.next); }catch(e){ console.error(e); } PM.next+=60/PM.bpm()/4; PM.step=(PM.step+1)%64; } };
const hzm=m=>440*Math.pow(2,(m-69)/12);
PM._env=(t,g,v,a,d)=>{ g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(v,t+a); g.gain.exponentialRampToValueAtTime(.0003,t+a+d); };
PM.kick=(t,v,hard)=>{ const c=PM.ctx, o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.setValueAtTime(hard?190:150,t); o.frequency.exponentialRampToValueAtTime(42,t+.13); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+(hard?.34:.26)); o.connect(g); g.connect(hard?PM.dist:PM.master); o.start(t); o.stop(t+.4);
  const d=(t-c.currentTime)*1000; setTimeout(()=>{ PM.pulse=1; },Math.max(0,d)); };
PM.noise=(t,dur,v,type,f,q)=>{ const c=PM.ctx, s=c.createBufferSource(), fl=c.createBiquadFilter(), g=c.createGain(); s.buffer=PM.nbuf; fl.type=type; fl.frequency.value=f; if(q) fl.Q.value=q; g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0005,t+dur); s.connect(fl); fl.connect(g); g.connect(PM.master); s.start(t,Math.random()*.5); s.stop(t+dur+.02); };
PM.snare=(t,v)=>{ PM.noise(t,.2,v,'bandpass',1900,.8); const c=PM.ctx, o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.setValueAtTime(220,t); o.frequency.exponentialRampToValueAtTime(150,t+.08); g.gain.setValueAtTime(v*.7,t); g.gain.exponentialRampToValueAtTime(.001,t+.14); o.connect(g); g.connect(PM.master); o.start(t); o.stop(t+.18); };
PM.clap=(t,v)=>{ [0,.012,.024].forEach(d=>PM.noise(t+d,.1,v,'bandpass',1500,1)); PM.noise(t+.03,.16,v*.7,'bandpass',1200,.6); };
PM.hat=(t,v,open)=>PM.noise(t,open?.2:.045,v,'highpass',7500);
PM.bassv=(t,m,dur,v,type,cut,q,sweep)=>{ const c=PM.ctx, o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain(); o.type=type||'sawtooth'; o.frequency.value=hzm(m); f.type='lowpass'; f.Q.value=q||4; f.frequency.setValueAtTime(sweep?cut*3.2:cut,t); if(sweep) f.frequency.exponentialRampToValueAtTime(cut,t+dur*.8); g.gain.setValueAtTime(v,t); g.gain.setValueAtTime(v,t+dur*.8); g.gain.exponentialRampToValueAtTime(.0005,t+dur); o.connect(f); f.connect(g); g.connect(PM.master); o.start(t); o.stop(t+dur+.03); };
PM.reese=(t,m,dur,v,cut)=>{ const c=PM.ctx, f=c.createBiquadFilter(), g=c.createGain(); f.type='lowpass'; f.Q.value=6; f.frequency.setValueAtTime(cut,t); f.frequency.linearRampToValueAtTime(cut*1.8,t+dur*.5); f.frequency.linearRampToValueAtTime(cut,t+dur); g.gain.setValueAtTime(v,t); g.gain.setValueAtTime(v,t+dur*.85); g.gain.exponentialRampToValueAtTime(.0005,t+dur); f.connect(g); g.connect(PM.master); [-9,9].forEach(dt=>{ const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=hzm(m); o.detune.value=dt; o.connect(f); o.start(t); o.stop(t+dur+.03); }); };
PM.wob=(t,m,dur,v,rate)=>{ const c=PM.ctx, f=c.createBiquadFilter(), g=c.createGain(), l=c.createOscillator(), lg=c.createGain(); f.type='lowpass'; f.Q.value=9; f.frequency.value=700; l.frequency.value=rate; lg.gain.value=650; l.connect(lg); lg.connect(f.frequency); g.gain.setValueAtTime(v,t); g.gain.setValueAtTime(v,t+dur*.9); g.gain.exponentialRampToValueAtTime(.0005,t+dur); f.connect(g); g.connect(PM.master); [0,7].forEach(dt=>{ const o=c.createOscillator(); o.type=dt?'square':'sawtooth'; o.frequency.value=hzm(m); o.detune.value=dt; o.connect(f); o.start(t); o.stop(t+dur+.03); }); l.start(t); l.stop(t+dur+.03);
  const s=c.createOscillator(), sg=c.createGain(); s.type='sine'; s.frequency.value=hzm(m-12); sg.gain.setValueAtTime(v*.8,t); sg.gain.exponentialRampToValueAtTime(.0005,t+dur); s.connect(sg); sg.connect(PM.master); s.start(t); s.stop(t+dur+.03); };
PM.lead=(t,m,dur,v,type,cut)=>{ const c=PM.ctx, o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain(); o.type=type||'square'; o.frequency.value=hzm(m); f.type='lowpass'; f.frequency.value=cut||3200; g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0005,t+dur); o.connect(f); f.connect(g); g.connect(PM.master); o.start(t); o.stop(t+dur+.03); };
PM.pad=(t,m,dur,v)=>{ [0,3,7].forEach((iv,k)=>[-8,8].forEach(dt=>{ const c=PM.ctx, o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain(); o.type='sawtooth'; o.frequency.value=hzm(m+12+iv); o.detune.value=dt; f.type='lowpass'; f.frequency.value=1100; g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v/6,t+dur*.2); g.gain.exponentialRampToValueAtTime(.0004,t+dur); o.connect(f); f.connect(g); g.connect(PM.master); o.start(t); o.stop(t+dur+.05); })); };
PM.riser=(t,dur,v)=>{ const c=PM.ctx, s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); s.buffer=PM.nbuf; s.loop=true; f.type='bandpass'; f.Q.value=2; f.frequency.setValueAtTime(300,t); f.frequency.exponentialRampToValueAtTime(7000,t+dur); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+dur); g.gain.linearRampToValueAtTime(0,t+dur+.05); s.connect(f); f.connect(g); g.connect(PM.master); s.start(t); s.stop(t+dur+.1); };
const PM_ROOT=[33,33,29,31], PENT=[0,3,5,7,10,12,15,17];
PM.stepAt=function(s,t){
  const bar=s>>4, st=s&15, root=PM_ROOT[bar], I=PM.I, k=PM.key, tens=PM.mode==='chasse', turbo=PM.turbo, multi=PM.multi, bt=60/PM.bpm()/4;
  const arp=(every,base,oct)=>{ if(st%every===0){ const n=PENT[(s*3+bar)%PENT.length]; PM.lead(t,base+n+(oct||0),bt*every*.8,.05+.03*I,'square',2400+I*2500); } };
  const x=(pat)=>pat[st]==='x';
  if(k==='techno'){
    if(st%4===0) PM.kick(t,.9);
    if(st%4===2) PM.hat(t,.16+.06*I); if(I>.35&&st%2===1) PM.hat(t,.06+.04*I); if(bar===3&&st===14) PM.hat(t,.18,true);
    if(st===4||st===12){ PM.clap(t,.2+.1*I); }
    if(st%4===2) PM.bassv(t,root+(bar%2?12:0),bt*1.6,.3,'sawtooth',280+I*1100,5);
    if(I>.5&&x('x.xxx.xx.x.xxx.x')) PM.bassv(t,root+24+[0,3,0,7,0,12,3,0][(s>>1)&7],bt*.9,.1,'sawtooth',500+I*900,12,true);
    if(st===0&&I>.2) PM.pad(t,root+12,bt*16,.16);
  } else if(k==='dnb'){
    if(st===0||st===10) PM.kick(t,.85); if(st===4||st===12) PM.snare(t,.42+.12*I); if(st===7||(I>.5&&st===15)) PM.snare(t,.12);
    if(st%2===0) PM.hat(t,.1+.05*I,st===14); else if(I>.3) PM.hat(t,.05);
    if(st===0||st===8) PM.reese(t,root+12,bt*8,.2+.06*I,380+I*900);
    if(I>.55) arp(2,root+36);
  } else if(k==='dub'){
    if(st===0||st===10) PM.kick(t,.9); if(st===8){ PM.snare(t,.55); PM.clap(t,.3); }
    if(st%2===0) PM.hat(t,.09+.04*I); if(I>.5&&st%2===1) PM.hat(t,.04);
    if(st===0||st===8){ const rate=PM.bpm()/60*([1,1.5,2,3][bar]); PM.wob(t,root+(st===8&&bar%2?3:0),bt*8,.22+.06*I,rate*1.5); }
    if(bar===3&&st>=12&&I>.3) PM.snare(t,.2+(st-12)*.06);
    if(st===0&&bar===3&&I>.4) PM.riser(t,bt*16,.12);
  } else {
    if(st%4===0) PM.kick(t,.95,true);
    if(st%4!==0&&x('.xxx.xxx.xxx.xxx')) PM.bassv(t,root+((s>>2)&1?12:0),bt*.8,.22,'sawtooth',420+I*800,3);
    if(st%2===1) PM.hat(t,.12,true); if(st===4||st===12) PM.clap(t,.28);
    if(I>.55&&(st===0||st===6||st===10)) PM.lead(t,root+36+[0,7,3,10][bar],bt*2.2,.08,'sawtooth',3800);
  }
  if(tens){ if(st%2===0) arp(2,root+36+7); PM.hat(t,.07); if(st===0&&bar%2===0) PM.riser(t,bt*8,.07); }
  if(turbo&&st%4===0) PM.lead(t,root+48,bt*1.4,.06,'sawtooth',4500);
  if(multi&&st%2===0) arp(2,root+24+5);
};
PM.fx=function(kind){ if(!PM.on||PM.muted) return; const c=PM.ctx, t=c.currentTime+.01;
  if(kind==='capture'){ [0,4,7,12,16].forEach((n,i)=>PM.lead(t+i*.07,72+n,.35,.12,'triangle',6000)); PM.noise(t,.5,.12,'highpass',5000); }
  else if(kind==='drain'){ const o=c.createOscillator(), g=c.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(420,t); o.frequency.exponentialRampToValueAtTime(40,t+.6); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.0005,t+.65); o.connect(g); g.connect(PM.master); o.start(t); o.stop(t+.7); }
  else if(kind==='nice'){ [0,7].forEach((n,i)=>PM.lead(t+i*.06,76+n,.25,.1,'square',5000)); }
  else if(kind==='skill'){ [0,5,9,14].forEach((n,i)=>PM.lead(t+i*.05,69+n,.3,.1,'sawtooth',5000)); }
  else if(kind==='over'){ [12,7,3,0].forEach((n,i)=>PM.lead(t+i*.14,60+n,.5,.12,'sawtooth',1800)); } };
ACT.pmmute=()=>{ PM.muted=!PM.muted; PM.setVol(); document.querySelectorAll('.pmm').forEach(b=>{ b.textContent=PM.muted?'🔇':'🔊'; }); };
