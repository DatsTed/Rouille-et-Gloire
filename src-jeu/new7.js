/* ======================================================================
   Concours d'élégance : cinématique 3D (podiums, public, feux d'artifice)
   ====================================================================== */
const sstep=u=>{u=clamp(u,0,1); return u*u*(3-2*u);};
function buildShow(c,ot,row){
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x07051a); sc.fog=new THREE.Fog(0x07051a,40,130);
  sc.add(new THREE.HemisphereLight(0xaab6ff,0x2a0a4a,1.15));
  const dl=new THREE.DirectionalLight(0xffb0f4,.9); dl.position.set(-20,40,25); sc.add(dl);
  const cam=new THREE.PerspectiveCamera(55,1.5,.3,400);
  /* sol quadrillé */
  const ft=ctex(256,256,(x,W,H)=>{x.fillStyle='#0b0b22'; x.fillRect(0,0,W,H); x.strokeStyle='#2b2f6a'; x.lineWidth=2; for(let i=0;i<=8;i++){x.beginPath(); x.moveTo(i*W/8,0); x.lineTo(i*W/8,H); x.moveTo(0,i*H/8); x.lineTo(W,i*H/8); x.stroke();}},[16,16]);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(260,260),new THREE.MeshBasicMaterial({map:ft})); fl.rotation.x=-Math.PI/2; sc.add(fl);
  /* plateau tournant */
  const tt=new THREE.Mesh(new THREE.CylinderGeometry(3.7,3.9,.36,40),new THREE.MeshLambertMaterial({color:0x1a1c46})); tt.position.y=.18; sc.add(tt);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3.75,.07,8,56),new THREE.MeshBasicMaterial({color:0x00E5FF})); ring.rotation.x=Math.PI/2; ring.position.y=.38; sc.add(ring);
  /* podiums */
  const n=ot.length+1, PX={1:0,2:-6.6,3:6.6}, PH={1:2.1,2:1.5,3:1.05}, PC={1:0xc9a227,2:0xb9c2d6,3:0xb87333}, PZ=-12;
  for(let r=1;r<=Math.min(n,3);r++){
    const b=new THREE.Mesh(new THREE.BoxGeometry(5.8,PH[r],4.4),new THREE.MeshLambertMaterial({color:PC[r]})); b.position.set(PX[r],PH[r]/2,PZ); sc.add(b);
    const e=new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry),new THREE.LineBasicMaterial({color:r===1?0xFCEE0A:0x00E5FF})); e.position.copy(b.position); sc.add(e);
    const nb=labelSprite(r===1?'1er':r+'e',r===1?'#FCEE0A':'#00E5FF',3.4); nb.position.set(PX[r],PH[r]*.5,PZ+2.5); sc.add(nb);
  }
  const ban=labelSprite('CONCOURS D’ÉLÉGANCE','#FF2BD6',16); ban.position.set(0,10.5,PZ-3); sc.add(ban);
  /* voitures : les adversaires, puis la tienne */
  const ranks=[]; for(let r=1;r<=n;r++) if(r!==row.rank) ranks.push(r);
  const cars=[];
  const add=(g,rank,name,score,mine)=>{g.g.visible=false; sc.add(g.g); cars.push({q:g,rank,name,score,mine});};
  ot.slice().reverse().forEach((o,k)=>{ const idx=ot.indexOf(o); add(buildCar(M[o.o.mid],'#FF2BD6',carLook(o.o)),ranks[idx],o.nom,-o.t,false); });
  add(buildCar(M[c.mid],'#00E5FF',carLook(c)),row.rank,M[c.mid].nom,row.a,true);
  /* public : 4 couleurs, 1 corps + 1 tête par individu */
  const dm=new THREE.Object3D(), colors=[0xff2bd6,0x00e5ff,0xfcee0a,0x8f6bff], per=24, crowd=[];
  const bodyG=new THREE.CylinderGeometry(.34,.4,1.1,8), headG=new THREE.SphereGeometry(.27,8,6);
  const heads=new THREE.InstancedMesh(headG,new THREE.MeshLambertMaterial({color:0xe8b894}),per*colors.length);
  const bodies=colors.map(cl=>new THREE.InstancedMesh(bodyG,new THREE.MeshLambertMaterial({color:cl}),per));
  let hi=0;
  colors.forEach((cl,ci)=>{ for(let k=0;k<per;k++){
    let X,Z,rw,tries=0;
    do{ const a=Math.random()*6.283; rw=Math.floor(Math.random()*3); const rad=15+rw*2.6+Math.random()*1.2; X=Math.sin(a)*rad; Z=Math.cos(a)*rad-1; tries++; }while(Z<-5&&Math.abs(X)<14&&tries<40);
    crowd.push({ci,k,i:hi++,x:X,z:Z,y:rw*.55,ph:Math.random()*6.28,sp:5+Math.random()*3});
  } });
  heads.frustumCulled=false; bodies.forEach(b=>{b.frustumCulled=false; sc.add(b);}); sc.add(heads);
  /* faisceaux de projecteurs */
  const beams=[]; for(let k=0;k<4;k++){
    const bm=new THREE.Mesh(new THREE.ConeGeometry(2.6,18,20,1,true),new THREE.MeshBasicMaterial({color:[0x00E5FF,0xFF2BD6,0xFCEE0A,0x8f6bff][k],transparent:true,opacity:.13,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    const pv=new THREE.Group(); pv.position.set(Math.cos(k*1.57+.8)*14,0,Math.sin(k*1.57+.8)*14-4); bm.position.y=9; pv.add(bm); sc.add(pv); beams.push(pv);
  }
  /* feux d'artifice */
  const NB=9, NP=64, tot=NB*NP, fpos=new Float32Array(tot*3), fcol=new Float32Array(tot*3), fvel=new Float32Array(tot*3), fb=[];
  for(let b=0;b<NB;b++) fb.push({life:0,col:new THREE.Color()});
  const fg=new THREE.BufferGeometry(); const pa=new THREE.BufferAttribute(fpos,3), ca=new THREE.BufferAttribute(fcol,3); pa.setUsage(THREE.DynamicDrawUsage); ca.setUsage(THREE.DynamicDrawUsage);
  fg.setAttribute('position',pa); fg.setAttribute('color',ca);
  const fw=new THREE.Points(fg,new THREE.PointsMaterial({size:1.1,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true})); fw.frustumCulled=false; sc.add(fw);
  for(let i=0;i<tot;i++) fpos[i*3+1]=-50;
  return {scene:sc,cam,cars,crowd,heads,bodies,dm,beams,fw,pa,ca,fpos,fcol,fvel,fb,NB,NP,nb:0,nextFw:.4,PX,PH,PZ,n,fov:55};
}
function showFire(S_,t,dt,big){
  const o=S_;
  if(t>=o.nextFw){ o.nextFw=t+(big?.2:.5); const b=o.fb[o.nb%o.NB], bi=o.nb%o.NB; o.nb++; b.life=1.7; b.col.setHSL(Math.random(),1,.6);
    const cx=(Math.random()-.5)*44, cy=14+Math.random()*12, cz=-34+Math.random()*22;
    for(let k=0;k<o.NP;k++){ const i=(bi*o.NP+k)*3, a=Math.random()*6.283, e=Math.acos(2*Math.random()-1), sp=6+Math.random()*6;
      o.fpos[i]=cx; o.fpos[i+1]=cy; o.fpos[i+2]=cz; o.fvel[i]=Math.sin(e)*Math.cos(a)*sp; o.fvel[i+1]=Math.cos(e)*sp; o.fvel[i+2]=Math.sin(e)*Math.sin(a)*sp; } }
  for(let bi=0;bi<o.NB;bi++){ const b=o.fb[bi]; if(b.life<=0) continue; b.life-=dt; const f=Math.max(0,b.life/1.7);
    for(let k=0;k<o.NP;k++){ const i=(bi*o.NP+k)*3; o.fvel[i+1]-=6*dt; o.fpos[i]+=o.fvel[i]*dt; o.fpos[i+1]+=o.fvel[i+1]*dt; o.fpos[i+2]+=o.fvel[i+2]*dt;
      o.fcol[i]=b.col.r*f; o.fcol[i+1]=b.col.g*f; o.fcol[i+2]=b.col.b*f; }
    if(b.life<=0) for(let k=0;k<o.NP;k++){ const i=(bi*o.NP+k)*3; o.fpos[i+1]=-50; o.fcol[i]=o.fcol[i+1]=o.fcol[i+2]=0; } }
  o.pa.needsUpdate=true; o.ca.needsUpdate=true;
}
function startShow(i,row,c,ot){
  const has3d=glEnsure(); RC={kind:'row',i,row};
  if(has3d){
    try{
      RS=buildShow(c,ot,row); RC={kind:'show',i,row,ot,clock:0,end:0,cap:'',nm:''};
      const n=ot.length+1; RC.tP=1.8+2.4*ot.length; RC.tC=RC.tP+6.6; RC.end=Math.min(19.6,RC.tC+n*1.1+2.6);
    }catch(e){ try{console.warn('show',e);}catch(_){ } RS=null; RC={kind:'row',i,row}; }
  }
  view='race'; render(); document.querySelector('main').scrollTop=0;
}
function vShow(){
  return `<div class="race"><div class="rwrap"><div class="rs" id="rslot" style="height:clamp(360px,62vh,560px)"></div>
    <div class="shw"><div class="shw-top"><b>🏆 Concours d’élégance</b><button class="btn alt sm" data-a="showskip">Passer ▶</button></div>
      <div class="shw-cap"><b id="shName"></b><span id="shCap"></span></div></div></div></div>`;
}
function endShow(){
  if(!RC||RC.kind!=='show') return; const i=RC.i, row=RC.row;
  glStop(); if(RS&&RS.scene) disposeScene(RS.scene); RS=null; RC={kind:'row',i,row};
  render(); document.querySelector('main').scrollTop=0;
}
function bindShow(){
  if(!GL.r||!RS){ endShow(); return; }
  glAttach('rslot'); glRun(RS.scene,RS.cam,showFrame,'show');
}
function showFrame(dt,time){
  if(!RC||RC.kind!=='show'||!RS){ return; }
  RC.clock+=dt; const t=RC.clock, o=RS, cam=o.cam, n=o.n, nOpp=n-1, tP=RC.tP, tC=RC.tC;
  if(t>=RC.end){ endShow(); return; }
  /* quelle voiture est sur le plateau ? */
  let cur=-1; if(t>=1.8&&t<tC){ cur=t<tP?Math.min(nOpp-1,Math.floor((t-1.8)/2.4)):nOpp; }
  const tt0=cur<0?0:(cur<nOpp?1.8+2.4*cur:tP), lt=t-tt0;
  o.cars.forEach((cr,k)=>{
    const q=cr.q, g=q.g;
    if(t<tC){ g.visible=(k===cur); if(g.visible){ g.position.set(0,.36,0); g.rotation.y=t*.75; if(q.flame){ q.flame.visible=cr.mine&&lt>1&&lt<5; if(q.flame.visible){const f=.8+Math.random()*.6; q.flame.scale.set(f,1,f);} } } }
    else {
      const idx=n-cr.rank, ta=tC+.2+idx*1.1, u=sstep((t-ta)/1.4), px=o.PX[Math.min(cr.rank,3)]||0, ph=o.PH[Math.min(cr.rank,3)]||1;
      g.visible=t>=ta; g.position.set(px,ph,o.PZ+(1-u)*30); g.rotation.y=-Math.PI/2+.5*(cr.rank===2?1:cr.rank===3?-1:.0)+Math.sin(t*.8)*.12; if(q.flame) q.flame.visible=false;
    }
    if(q.wheels) q.wheels.forEach(w=>{w.rotation.z-=dt*(t<tC?3:0);}); pulseSirens(q,time); shineTick(q,time);
  });
  /* caméra */
  const a=.6+t*.38, r=9.4, wide=sstep((t-tC)/1.6), intro=1-sstep(t/1.8);
  let px=Math.sin(a)*r, py=2.7+Math.sin(t*.7)*.5, pz=Math.cos(a)*r, lx=0, ly=1.3, lz=0;
  px=px*(1-intro)+0*intro; py=py*(1-intro)+7*intro; pz=pz*(1-intro)+26*intro; ly=ly*(1-intro)+4*intro; lz=lz*(1-intro)+(-8)*intro;
  px=px*(1-wide)+Math.sin(t*.4)*3*wide; py=py*(1-wide)+5.4*wide; pz=pz*(1-wide)+16*wide; lx=lx*(1-wide); ly=ly*(1-wide)+3*wide; lz=lz*(1-wide)+(-12)*wide;
  cam.position.set(px,py,pz); cam.lookAt(lx,ly,lz);
  /* public, projecteurs, feux */
  const exc=t<tC?(.35+.2*Math.min(1,t/6)):1.2, dm=o.dm;
  o.crowd.forEach(p=>{ const y=p.y+Math.abs(Math.sin(t*p.sp+p.ph))*.5*exc;
    dm.position.set(p.x,y+.55,p.z); dm.rotation.set(0,0,0); dm.updateMatrix(); o.bodies[p.ci].setMatrixAt(p.k,dm.matrix);
    dm.position.set(p.x,y+1.4,p.z); dm.updateMatrix(); o.heads.setMatrixAt(p.i,dm.matrix); });
  o.bodies.forEach(b=>{b.instanceMatrix.needsUpdate=true;}); o.heads.instanceMatrix.needsUpdate=true;
  o.beams.forEach((b,k)=>{ b.rotation.z=Math.sin(t*.9+k*1.7)*.35; b.rotation.x=Math.cos(t*.7+k)*.3; });
  showFire(o,t,dt,t>=tC);
  /* légende */
  let nm='', cp='';
  if(t<1.8){ nm='Le public s’installe'; cp=''; }
  else if(t<tC){ const cr=o.cars[cur]; nm=cr.mine?'Ta voiture : '+cr.name:cr.name; const tt=cur<nOpp?1.8+2.4*cur:tP; cp=(t-tt>(cr.mine?4.6:1.2))?'Note du jury : '+fmt(cr.score)+' pts':'Le jury observe…'; }
  else { const rk=RC.row.rank; nm=rk===1?'Victoire !':ordF(rk)+' place'; cp='Le jury a rendu son verdict'; }
  if(RC.nm!==nm){RC.nm=nm; const e=$('shName'); if(e) e.textContent=nm;} if(RC.cap!==cp){RC.cap=cp; const e=$('shCap'); if(e) e.textContent=cp;}
}

ACT.showskip=()=>endShow();
