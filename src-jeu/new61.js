/* ===== v1.7 · 2/2 : la Région Néon — une grande carte où l'on conduit sa voiture =====
   9 villes reliées par 8 routes façon circuit (bitume, lignes, vibreurs, murs néon). Chaque ville d'arène abrite son champion
   et des pilotes de rue (zone sûre). Sur les routes, des voitures sauvages : si elles te touchent, un duel commence.
   Une barrière bloque la route suivante tant que le badge de la ville n'est pas gagné. */

const W_TOWNS=[
  {nm:'Rouille-Ville',x:0,z:0},
  {nm:'Braiseville',x:60,z:-340,ch:0},{nm:'Port-Lavage',x:380,z:-520,ch:1},{nm:'Hautes-Rafales',x:700,z:-330,ch:2},{nm:'Voltampère',x:760,z:40,ch:3},
  {nm:'Givrenord',x:640,z:400,ch:4},{nm:'Roc-Carrière',x:300,z:560,ch:5},{nm:'Prismaville',x:-40,z:420,ch:6},{nm:'Noirtunnel',x:-380,z:300,ch:7}];
const W_R=50, W_HW=7.5, W_STEP=2.5;
W_TOWNS.forEach((T,k)=>{ T.k=k; T.col=T.ch!=null?CB_TYPES[RUE_CH[T.ch].ty].c:'#00e5ff'; T.pil=RUE_PIL.filter(p=>p.bd===k); });
const W={on:false,built:false,sc:null,cam:null,routes:[],grid:{},wild:[],pers:[],gates:[],p:{x:0,z:0,h:0,v:0},car:null,uid:null,in:{st:0,gas:0,brk:0},key:{},
  town:-1,route:-1,grace:0,t:0,mapT:0,zoneK:'',fight:null};
const wTownLv=k=>[3,8,12,16,20,25,30,36,42][k];
const wRouteLv=k=>[Math.max(2,wTownLv(k)-1),Math.max(3,wTownLv(k+1)-2)];

/* ---------- 1. tracé : routes en courbes douces entre les villes, échantillonnées tous les 2,5 m ---------- */
function wMkPath(pts,A,B,k,alt){ const cv=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p.x,0,p.z)),false,'centripetal'), n=Math.round(cv.getLength()/W_STEP), P=cv.getSpacedPoints(n).map(v=>({x:v.x,z:v.z,y:0}));
  P.forEach((p,i)=>{ const a=P[Math.max(0,i-1)], b=P[Math.min(P.length-1,i+1)], l=Math.hypot(b.x-a.x,b.z-a.z)||1; p.tx=(b.x-a.x)/l; p.tz=(b.z-a.z)/l; p.nx=-p.tz; p.nz=p.tx;
    p.dA=Math.max(Math.abs(p.x-A.x),Math.abs(p.z-A.z)); p.dB=Math.max(Math.abs(p.x-B.x),Math.abs(p.z-B.z)); });
  P.forEach((p,i)=>{ const a=P[Math.max(0,i-3)], b=P[Math.min(P.length-1,i+3)]; p.cu=Math.abs(Math.atan2(a.tx*b.tz-a.tz*b.tx,a.tx*b.tx+a.tz*b.tz)); });
  return {k,P,A,B,isAlt:!!alt}; }
/* ---- villes carrées : chaque route sort perpendiculairement par un côté (N, E, S, O) à travers une arche ---- */
const W_SIDES=[[0,-1],[1,0],[0,1],[-1,0]];
function wSideTo(from,to,excl){ let best=-1, bd=-9; const dx=to.x-from.x, dz=to.z-from.z, l=Math.hypot(dx,dz); W_SIDES.forEach((s,i)=>{ if(i===excl) return; const d=(s[0]*dx+s[1]*dz)/l; if(d>bd){ bd=d; best=i; } }); return best; }
/* chaque route = 2 chaussées SÉPARÉES entre les mêmes villes (jamais superposées) :
   - la principale au sol, courbe de Bézier perpendiculaire aux deux portes ;
   - la voie double, décalée de 26 m, qui monte en rampe douce, PASSE EN PONT au-dessus de la principale en changeant de côté
     (courbe en S), puis redescend. Les deux sortent de la même ville par 2 arches côte à côte. */
function wTrace(){ W.routes=[]; W.paths=[]; W.grid={};
  const G=26, H=5.8, RS=16, HP=12, sm=u=>u*u*(3-2*u), rot=v=>({x:-v.z,z:v.x});
  W_TOWNS.forEach(T=>{ T.sOut=-1; T.sIn=-1; });
  for(let k=0;k<W_TOWNS.length-1;k++){ const A=W_TOWNS[k], B=W_TOWNS[k+1]; A.sOut=wSideTo(A,B,A.sIn); B.sIn=wSideTo(B,A,-1); }
  for(let k=0;k<W_TOWNS.length-1;k++){ const A=W_TOWNS[k], B=W_TOWNS[k+1], nA={x:W_SIDES[A.sOut][0],z:W_SIDES[A.sOut][1]}, nB={x:W_SIDES[B.sIn][0],z:W_SIDES[B.sIn][1]}, tA=nA, tB={x:-nB.x,z:-nB.z}, S=(k%2?1:-1), rA=rot(tA), rB=rot(tB);
    const p0={x:A.x+nA.x*(W_R-6)-13*S*rA.x,z:A.z+nA.z*(W_R-6)-13*S*rA.z}, p3={x:B.x+nB.x*(W_R-6)+13*S*rB.x,z:B.z+nB.z*(W_R-6)+13*S*rB.z}, L=Math.hypot(p3.x-p0.x,p3.z-p0.z), K=clamp(.42*L,70,230);
    const cv=new THREE.CubicBezierCurve3(new THREE.Vector3(p0.x,0,p0.z),new THREE.Vector3(p0.x+tA.x*K,0,p0.z+tA.z*K),new THREE.Vector3(p3.x-tB.x*K,0,p3.z-tB.z*K),new THREE.Vector3(p3.x,0,p3.z));
    const R=wMkPath(cv.getPoints(64).map(v=>({x:v.x,z:v.z})),A,B,k,false), P=R.P, n=P.length;
    const iS=P.findIndex(p=>p.dA>W_R+3), iE=n-1-P.slice().reverse().findIndex(p=>p.dB>W_R+3), len=iE-iS, ic=iS+Math.round(len*.64);
    Object.assign(R,{gate:P.findIndex(p=>p.dA>W_R+12),iA:P.findIndex(p=>p.dA>W_R+26),iB:n-1-P.slice().reverse().findIndex(p=>p.dB>W_R+26),st:iS+Math.round(len*.28)});
    const pts=[]; for(let i=iS;i<=iE;i+=2){ const u=clamp((i-(ic-HP))/(2*HP),0,1), o=S*G*(1-2*sm(u)); pts.push({x:P[i].x+P[i].nx*o,z:P[i].z+P[i].nz*o}); }
    if((iE-iS)%2) pts.push({x:P[iE].x-P[iE].nx*S*G,z:P[iE].z-P[iE].nz*S*G});
    const X=wMkPath(pts,A,B,k,true);
    X.P.forEach((p,j)=>{ const i=iS+(iE-iS)*j/(X.P.length-1), d=Math.abs(i-ic); p.y=H*(d<=HP?1:d>=HP+RS?0:sm(1-(d-HP)/RS)); });
    X.gate=X.P.findIndex(p=>p.dA>W_R+12); X.ci=Math.round((X.P.length-1)*(ic-iS)/Math.max(1,iE-iS)); R.alt=X; R.bay={i0:R.st-9,i1:R.st+9,sd:-S,dep:13};
    W.routes.push(R); W.paths.push(R,X); }
  W.paths.forEach((Pt,pi)=>Pt.P.forEach((p,i)=>{ const g=Math.floor(p.x/16)+'|'+Math.floor(p.z/16); (W.grid[g]=W.grid[g]||[]).push([pi,i]); })); }/* point de route le plus proche ; la hauteur compte (sur le pont on reste sur le pont, dessous on reste dessous) */
function wNear(x,z,y,skip){ let best=null, bd=1e9; const gx=Math.floor(x/16), gz=Math.floor(z/16);
  for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++){ const L=W.grid[(gx+a)+'|'+(gz+b)]; if(!L) continue; for(const [pi,i] of L){ if(pi===skip) continue; const p=W.paths[pi].P[i], d=(p.x-x)**2+(p.z-z)**2+(y==null?0:((p.y-y)*4)**2); if(d<bd){ bd=d; best=[pi,i]; } } }
  if(!best) return null; const pa=W.paths[best[0]], p=pa.P[best[1]]; return {k:pa.k,pi:best[0],alt:pa.isAlt,i:best[1],p,lat:(x-p.x)*p.nx+(z-p.z)*p.nz}; }
/* position du joueur projetée sur la voie principale d'une route (les voitures sauvages n'en sortent pas) */
const wIdxOn=(R,x,z)=>{ let bi=0, bd=1e9; for(let i=0;i<R.P.length;i++){ const p=R.P[i], d=(p.x-x)**2+(p.z-z)**2; if(d<bd){ bd=d; bi=i; } } const p=R.P[bi]; return {i:bi,lat:(x-p.x)*p.nx+(z-p.z)*p.nz,d:Math.sqrt(bd)}; };
const wTownAt=(x,z)=>W_TOWNS.findIndex(T=>Math.max(Math.abs(T.x-x),Math.abs(T.z-z))<W_R);
const wGateLocked=k=>k>=1&&!rueSt().bdg[RUE_CH[k-1].ty];

/* ---------- 2. décor ---------- */
function wFacs(){ let sd=21; const rn=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  return [0,1,2,3,4].map(k=>{ const t=ctex(128,256,(x,w,h)=>{ x.fillStyle=['#241b3a','#2e1f33','#1c2740','#2a2333','#20202c'][k]; x.fillRect(0,0,w,h);
    for(let r=0;r<20;r++) for(let c=0;c<6;c++){ const on=rn()<.4; x.fillStyle=on?(rn()<.25?'#7fe8ff':rn()<.2?'#ff7ae0':'#ffd27a'):'#0d0d1a'; x.fillRect(8+c*20,8+r*12.4,10,6); } }); return new THREE.MeshLambertMaterial({map:t,emissive:0x2a2418,emissiveMap:t}); }); }
function wBuild(){ wTrace(); W.obs=[]; W.col=[]; const sc=new THREE.Scene(), col=0x2a1550; sc.background=new THREE.Color(col); sc.fog=new THREE.Fog(col,90,330);
  sc.add(new THREE.HemisphereLight(0xb8b0ff,0x2a1040,1.05)); const dl=new THREE.DirectionalLight(0xfff0e0,.7); dl.position.set(60,120,40); sc.add(dl);
  let sd=77; const rn=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  /* sol */
  const gt=ctex(256,256,(x,Wd,H)=>{ x.fillStyle='#1b2833'; x.fillRect(0,0,Wd,H); for(let i=0;i<6000;i++){ const g=26+Math.floor(rn()*34); x.fillStyle=`rgba(${g},${g+22},${g+16},.5)`; x.fillRect(rn()*Wd,rn()*H,2,2); } x.strokeStyle='rgba(0,229,255,.16)'; x.lineWidth=2; x.strokeRect(1,1,Wd-2,H-2); x.strokeStyle='rgba(255,43,214,.08)'; x.beginPath(); x.moveTo(Wd/2,0); x.lineTo(Wd/2,H); x.moveTo(0,H/2); x.lineTo(Wd,H/2); x.stroke(); },[150,150]);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),new THREE.MeshLambertMaterial({map:gt})); gr.rotation.x=-Math.PI/2; gr.position.set(200,-.05,0); sc.add(gr);
  /* ciel et horizon : dôme dégradé + silhouette lointaine de gratte-ciel (donne de la profondeur derrière la ville) */
  { const skyT=ctex(8,256,(x,Wd,Hh)=>{ const g=x.createLinearGradient(0,0,0,Hh); g.addColorStop(0,'#06031a'); g.addColorStop(.45,'#150a3a'); g.addColorStop(.62,'#4a1a6e'); g.addColorStop(.7,'#c2358f'); g.addColorStop(.74,'#4a1a6e'); g.addColorStop(1,'#2a1550'); x.fillStyle=g; x.fillRect(0,0,Wd,Hh); });
    skyT.wrapS=skyT.wrapT=THREE.ClampToEdgeWrapping; const dome=new THREE.Mesh(new THREE.SphereGeometry(1700,24,16),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,depthWrite:false})); dome.position.set(200,0,0); dome.renderOrder=-5; sc.add(dome);
    const sk=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x1b1140,fog:false}),170), sm4=new THREE.Matrix4(); for(let i=0;i<170;i++){ const a=i/170*Math.PI*2+rn()*.04, R=820+rn()*160, w=40+rn()*70, h=70+rn()*230, d=40+rn()*60; sm4.makeScale(w,h,d); sm4.setPosition(200+Math.cos(a)*R,h/2-6,Math.sin(a)*R); sk.setMatrixAt(i,sm4); } sc.add(sk); }  /* routes : rubans fusionnés par matière (bitume, lignes, vibreurs, murs) */
  const G={};
  const quad=(g,A,B,C,D,uv)=>{ const b=G[g]||(G[g]={p:[],u:[],i:[]}), v=b.p.length/3; b.p.push(...A,...B,...C,...D); b.i.push(v,v+1,v+2,v,v+2,v+3); b.u.push(...(uv||[0,0,1,0,1,1,0,1])); };
  const pt=(p,o,y)=>[p.x+p.nx*o,p.y+y,p.z+p.nz*o];
  const pil=[];
  W.paths.forEach((R,pi)=>{ const P=R.P, bay=R.bay; for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1], inA=Math.min(a.dA,b.dA)<W_R+3, inB=Math.min(a.dB,b.dB)<W_R+3; if(inA||inB) continue;
      const v0=i*W_STEP/10, v1=(i+1)*W_STEP/10, outer=Math.min(a.dA,b.dA)>W_R+9&&Math.min(a.dB,b.dB)>W_R+9, up=a.y>.3||b.y>.3;
      quad('asph',pt(a,W_HW,.03),pt(b,W_HW,.03),pt(b,-W_HW,.03),pt(a,-W_HW,.03),[0,v0,0,v1,1,v1,1,v0]);
      /* renfoncement de la station-service */
      const inBay=bay&&!R.isAlt&&i>=bay.i0&&i<bay.i1, bd=j=>inBay?bay.dep*clamp(Math.min(j-bay.i0,bay.i1-j)/4,0,1):0;
      if(inBay){ const s=bay.sd, da=bd(i), db=bd(i+1); quad('asph',pt(a,s*W_HW,.031),pt(b,s*W_HW,.031),pt(b,s*(W_HW+db),.031),pt(a,s*(W_HW+da),.031),[0,v0,0,v1,1,v1,1,v0]);
        quad('wallA',pt(a,s*(W_HW+2+da),0),pt(b,s*(W_HW+2+db),0),pt(b,s*(W_HW+2+db),1.1),pt(a,s*(W_HW+2+da),1.1)); }
      if(up){ const E=W_HW+2.4; [1,-1].forEach(s=>{ quad('deck',pt(a,s*W_HW,.02),pt(b,s*W_HW,.02),pt(b,s*E,.02),pt(a,s*E,.02)); quad('deck',pt(a,s*E,-1.1),pt(b,s*E,-1.1),pt(b,s*E,.02),pt(a,s*E,.02)); });
        quad('deck',pt(a,-E,-1.1),pt(b,-E,-1.1),pt(b,E,-1.1),pt(a,E,-1.1)); if(i%7===0&&a.y>2.2){ const g0=wNear(a.x,a.z,0,pi); if(!(g0&&!g0.p.y&&Math.hypot(g0.p.x-a.x,g0.p.z-a.z)<W_HW+3)){ pil.push([a.x,a.z,a.y-1.1]); W.obs.push({x:a.x,z:a.z,r:1.1,t:'pilier',h:a.y-1.1}); } } }
      [1,-1].forEach(s=>{ const bayS=inBay&&s===bay.sd;
        if(!bayS) quad('line',pt(a,s*(W_HW-.6),.05),pt(b,s*(W_HW-.6),.05),pt(b,s*(W_HW-.25),.05),pt(a,s*(W_HW-.25),.05));
        else if(i%3===0) quad('line',pt(a,s*(W_HW-.6),.05),pt(b,s*(W_HW-.6),.05),pt(b,s*(W_HW-.25),.05),pt(a,s*(W_HW-.25),.05));
        if(a.cu>.09&&!up&&!bayS) quad('kerb',pt(a,s*W_HW,.06),pt(b,s*W_HW,.06),pt(b,s*(W_HW+1.3),.06),pt(a,s*(W_HW+1.3),.06),[0,v0*2,0,v1*2,1,v1*2,1,v0*2]);
        if(!outer||bayS) return; const o=s*(W_HW+2);
        quad(s>0?'wallA':'wallB',pt(a,o,0),pt(b,o,0),pt(b,o,1.1),pt(a,o,1.1)); quad(s>0?'enA':'enB',pt(a,o,1.1),pt(b,o,1.1),pt(b,o,2.2),pt(a,o,2.2)); });
      if(i%6<3) quad('line',pt(a,.15,.05),pt(b,.15,.05),pt(b,-.15,.05),pt(a,-.15,.05)); } });  /* piliers des ponts */
  if(pil.length){ const pm=new THREE.InstancedMesh(new THREE.CylinderGeometry(.9,1.1,1,10),new THREE.MeshLambertMaterial({color:0x3a3650}),pil.length), m4=new THREE.Matrix4();
    pil.forEach(([x,z,h],j)=>{ m4.makeScale(1,h,1).setPosition(x,h/2,z); pm.setMatrixAt(j,m4); }); sc.add(pm); }
  /* stations-service : vraie station dans un renfoncement au bord de la route (auvent, îlots de pompes, totem des prix, boutique) */
  W.stations=[];
  const brandT=ctex(512,64,(x,Wd,H)=>{ x.fillStyle='#ffd400'; x.fillRect(0,0,Wd,H); x.fillStyle='#e2231a'; x.fillRect(0,H*.72,Wd,H*.28); x.fillStyle='#e2231a'; x.font='900 40px system-ui,sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('NÉON FUEL',Wd/2,H*.38); });
  brandT.wrapS=brandT.wrapT=THREE.ClampToEdgeWrapping;
  const padT=ctex(256,256,(x,Wd,H)=>{ x.fillStyle='#4a4a58'; x.fillRect(0,0,Wd,H); x.strokeStyle='#3a3a46'; x.lineWidth=3; for(let i=0;i<=4;i++){ x.beginPath(); x.moveTo(i*64,0); x.lineTo(i*64,H); x.stroke(); x.beginPath(); x.moveTo(0,i*64); x.lineTo(Wd,i*64); x.stroke(); } x.fillStyle='rgba(0,0,0,.25)'; for(let i=0;i<6;i++){ x.beginPath(); x.arc(40+rn()*170,40+rn()*170,10+rn()*18,0,7); x.fill(); } },[3,5]);
  const white=new THREE.MeshLambertMaterial({color:0xeef0f6}), redM=new THREE.MeshLambertMaterial({color:0xe2231a}), dark=new THREE.MeshLambertMaterial({color:0x22222c});
  W.routes.forEach(R=>{ const B=R.bay, p=R.P[R.st], s=B.sd, g=new THREE.Group(); g.position.set(p.x,0,p.z); g.rotation.y=Math.atan2(p.tx,p.tz); sc.add(g);
    const LX=o=>-s*(W_HW+o);   /* écart latéral (depuis le bord de la chaussée) → x local */
    const loc=(o,z)=>({x:p.x+p.nx*s*(W_HW+o)+p.tx*z,z:p.z+p.nz*s*(W_HW+o)+p.tz*z});
    const pad=new THREE.Mesh(new THREE.PlaneGeometry(10.5,17),new THREE.MeshLambertMaterial({map:padT,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})); pad.rotation.x=-Math.PI/2; pad.position.set(LX(7.2),.045,0); g.add(pad);
    /* auvent */
    const roof=new THREE.Mesh(new THREE.BoxGeometry(10,.6,16),white); roof.position.set(LX(7.2),5.6,0); g.add(roof);
    const fasc=new THREE.Mesh(new THREE.BoxGeometry(10.3,.9,16.3),[new THREE.MeshBasicMaterial({map:brandT}),new THREE.MeshBasicMaterial({map:brandT}),new THREE.MeshBasicMaterial({color:0xffd400}),new THREE.MeshBasicMaterial({color:0xffd400}),new THREE.MeshBasicMaterial({map:brandT}),new THREE.MeshBasicMaterial({map:brandT})]); fasc.position.set(LX(7.2),5.95,0); g.add(fasc);
    const under=new THREE.Mesh(new THREE.PlaneGeometry(9.6,15.6),new THREE.MeshBasicMaterial({color:0xfdfdf0})); under.rotation.x=Math.PI/2; under.position.set(LX(7.2),5.29,0); g.add(under);
    /* deux îlots de pompes (avec les piliers de l'auvent) */
    [3.8,10.6].forEach(o=>{ const isl=new THREE.Mesh(new THREE.BoxGeometry(1.2,.25,6),new THREE.MeshLambertMaterial({color:0xb8bcc8})); isl.position.set(LX(o),.13,0); g.add(isl);
      [-2.6,2.6].forEach(z=>{ const c=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,5.3,8),white); c.position.set(LX(o),2.8,z); g.add(c); });
      [-1.1,1.1].forEach(z=>{ const pu=new THREE.Group(); pu.position.set(LX(o),.25,z); g.add(pu);
        const body=new THREE.Mesh(new THREE.BoxGeometry(.55,1.7,.9),white); body.position.y=.85; pu.add(body);
        const top=new THREE.Mesh(new THREE.BoxGeometry(.6,.35,.95),redM); top.position.y=1.8; pu.add(top);
        const scr=new THREE.Mesh(new THREE.BoxGeometry(.58,.35,.5),new THREE.MeshBasicMaterial({color:0x7fe8ff})); scr.position.y=1.3; pu.add(scr);
        const hose=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1,6),dark); hose.position.set(0,.8,.5); hose.rotation.x=.3; pu.add(hose); });
      [-2.4,-1,1,2.4].forEach(z=>{ const c=loc(o,z); W.col.push({x:c.x,z:c.z,r:.85}); }); });
    /* boutique derrière le mur du renfoncement */
    const shop=new THREE.Mesh(new THREE.BoxGeometry(6,4.4,14),new THREE.MeshLambertMaterial({color:0x2a2c3a})); shop.position.set(LX(B.dep+6.5),2.2,0); g.add(shop);
    const glass=new THREE.Mesh(new THREE.PlaneGeometry(12,2.6),new THREE.MeshBasicMaterial({color:0x9fe9ff})); glass.position.set(LX(B.dep+3.45),1.6,0); glass.rotation.y=s>0?Math.PI/2:-Math.PI/2; g.add(glass);
    const ms=rueSign('NÉON MART · 24/7','#ffd400',9,1.1); ms.position.set(LX(B.dep+3.4),3.7,0); ms.rotation.y=s>0?Math.PI/2:-Math.PI/2; g.add(ms);
    /* totem des prix, avant l'entrée du renfoncement, derrière le mur */
    const tz=-(B.i1-B.i0)/2*W_STEP-4, tot=new THREE.Group(); tot.position.set(LX(3.4),0,tz); g.add(tot);
    const pole=new THREE.Mesh(new THREE.BoxGeometry(.5,6,.5),dark); pole.position.y=3; tot.add(pole);
    const brd=new THREE.Mesh(new THREE.PlaneGeometry(2.6,3.6),new THREE.MeshBasicMaterial({map:ctex(128,180,(x,Wd,H)=>{ x.fillStyle='#ffd400'; x.fillRect(0,0,Wd,H); x.fillStyle='#e2231a'; x.font='900 22px system-ui,sans-serif'; x.textAlign='center'; x.fillText('NÉON',Wd/2,26); x.fillText('FUEL',Wd/2,50);
      x.fillStyle='#111'; x.fillRect(8,62,Wd-16,H-70); x.font='bold 15px system-ui,sans-serif'; x.textAlign='left'; [['SP95','1,89'],['GAZOLE','1,79'],['NITRO','2,49'],['RÉPAR.','OFFERT']].forEach(([a,b],i)=>{ x.fillStyle='#fff'; x.fillText(a,14,86+i*24); x.fillStyle='#5dff9a'; x.textAlign='right'; x.fillText(b,Wd-14,86+i*24); x.textAlign='left'; }); }),side:THREE.DoubleSide}));
    brd.position.set(0,5.4,0); tot.add(brd);
    const c=loc(7.2,0); W.stations.push({x:c.x,z:c.z,k:R.k}); });
  const at=ctex(256,256,(x,Wd,H)=>{ x.fillStyle='#24232f'; x.fillRect(0,0,Wd,H); for(let i=0;i<4000;i++){ x.fillStyle=`rgba(255,255,255,${rn()*.07})`; x.fillRect(rn()*Wd,rn()*H,2,2); } for(let i=0;i<6;i++){ x.fillStyle='rgba(0,0,0,.18)'; x.fillRect(Wd*.18+rn()*Wd*.1,0,10+rn()*8,H); x.fillRect(Wd*.68+rn()*Wd*.1,0,10+rn()*8,H); } });
  const kt=ctex(64,64,(x,Wd,H)=>{ x.fillStyle='#e8e8ee'; x.fillRect(0,0,Wd,H); x.fillStyle='#d8262b'; x.fillRect(0,0,Wd,H/2); });
  const DS=THREE.DoubleSide, mats={asph2:new THREE.MeshLambertMaterial({map:at,side:DS,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}),deck:new THREE.MeshLambertMaterial({color:0x34304a,side:DS}),asph:new THREE.MeshLambertMaterial({map:at,side:DS}),line:new THREE.MeshBasicMaterial({color:0xf4f4f8,side:DS}),kerb:new THREE.MeshLambertMaterial({map:kt,side:DS}),
    wallA:new THREE.MeshLambertMaterial({color:0x2a2f66,side:THREE.DoubleSide}),wallB:new THREE.MeshLambertMaterial({color:0x2a2f66,side:THREE.DoubleSide}),
    enA:new THREE.MeshBasicMaterial({color:0x00e5ff,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}),enB:new THREE.MeshBasicMaterial({color:0xff2bd6,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false})};
  Object.entries(G).forEach(([g,b])=>{ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2)); geo.setIndex(b.i); geo.computeVertexNormals(); geo.computeBoundingSphere(); sc.add(new THREE.Mesh(geo,mats[g])); });
  /* immeubles néon et arbres au-delà des murs */
  const facs=wFacs(), box=new THREE.BoxGeometry(1,1,1), far=(x,z,m)=>{ const q=wNear(x,z); if(q&&Math.hypot(q.p.x-x,q.p.z-z)<m) return false; if(W.routes.some(R=>{ const b=R.P[R.st]; return Math.hypot(b.x-x,b.z-z)<38; })) return false; return W_TOWNS.every(T=>Math.max(Math.abs(T.x-x),Math.abs(T.z-z))>W_R+16); };
  const bnd=[-560,960,-700,740], pedM=new THREE.MeshLambertMaterial({color:0x3a3752}); let nb=0;
  for(let t=0;t<2600&&nb<230;t++){ const W2=W.routes[Math.floor(rn()*W.routes.length)], p=W2.P[Math.floor(rn()*W2.P.length)], s=rn()<.5?1:-1, o=W_HW+14+rn()*70, x=p.x+p.nx*s*o, z=p.z+p.nz*s*o;
    const w=8+rn()*12, d=8+rn()*12; if(!far(x,z,W_HW+4+Math.hypot(w,d)/2)) continue; const h=10+rn()*38, m=new THREE.Mesh(box,facs[Math.floor(rn()*5)]); m.scale.set(w,h,d); m.position.set(x,h/2,z); m.rotation.y=Math.atan2(p.nx,p.nz); sc.add(m); const pb=new THREE.Mesh(box,pedM); pb.scale.set(w+2.6,.55,d+2.6); pb.position.set(x,.27,z); pb.rotation.y=m.rotation.y; sc.add(pb); W.obs.push({x,z,r:Math.hypot(w,d)/2,t:'immeuble'}); nb++; }
  const tr=new THREE.InstancedMesh(new THREE.ConeGeometry(1.6,5,7),new THREE.MeshLambertMaterial({color:0x1d5a3a}),400), tk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.25,.3,1.6,6),new THREE.MeshLambertMaterial({color:0x4a3020}),400), mx=new THREE.Matrix4(); let nt=0;
  for(let t=0;t<3000&&nt<400;t++){ const W2=W.routes[Math.floor(rn()*W.routes.length)], p=W2.P[Math.floor(rn()*W2.P.length)], s=rn()<.5?1:-1, o=W_HW+4+rn()*10, x=p.x+p.nx*s*o, z=p.z+p.nz*s*o; if(!far(x,z,W_HW+5.5)) continue;
    const k=.8+rn()*.7; mx.makeScale(k,k,k).setPosition(x,1.6+2.5*k,z); tr.setMatrixAt(nt,mx); mx.makeScale(k,k,k).setPosition(x,.8*k,z); tk.setMatrixAt(nt,mx); W.obs.push({x,z,r:1.6*k,t:'arbre'}); nt++; }
  tr.count=tk.count=nt; sc.add(tr); sc.add(tk);
  /* lampadaires le long des routes */
  const lp=new THREE.InstancedMesh(new THREE.CylinderGeometry(.1,.14,6,6),new THREE.MeshLambertMaterial({color:0x2a2a36}),300), lh=new THREE.InstancedMesh(new THREE.BoxGeometry(1.4,.2,.5),new THREE.MeshBasicMaterial({color:0xfff1c4}),300); let nl=0;
  W.routes.forEach(R=>R.P.forEach((p,i)=>{ if(i%16||nl>=300||Math.min(p.dA,p.dB)<W_R+9) return; const s=(i/16)%2?1:-1, x=p.x+p.nx*s*(W_HW+2.8), z=p.z+p.nz*s*(W_HW+2.8);
    if(R.bay&&s===R.bay.sd&&i>=R.bay.i0-3&&i<=R.bay.i1+3) return; if(W.paths.some(Q=>Q!==R&&Q.P.some(q=>Math.hypot(q.x-x,q.z-z)<W_HW+2.5))) return; W.obs.push({x,z,r:.3,t:'lampadaire'}); mx.makeTranslation(x,3,z); lp.setMatrixAt(nl,mx); mx.makeTranslation(x-p.nx*s*.9,6,z-p.nz*s*.9); lh.setMatrixAt(nl,mx); nl++; }));
  lp.count=lh.count=nl; sc.add(lp); sc.add(lh);
  /* villes carrées : plaza, façade d'immeubles avec une arche à chaque entrée de route, arène du champion du côté libre */
  W.pers=[]; W.gates=[];
  W_TOWNS.forEach(T=>{ const tc=new THREE.Color(T.col).getHex(), C=rueChOf(T), H=W_R;
    const gates=[]; W.paths.forEach(R=>{ if(R.A!==T&&R.B!==T) return; const isA=R.A===T, idx=isA?R.P.findIndex(q=>q.dA>W_R+12):R.P.length-1-R.P.slice().reverse().findIndex(q=>q.dB>W_R+12), p=R.P[Math.max(0,idx)], s=isA?T.sOut:T.sIn; gates.push({s,lat:(s%2===0)?p.x-T.x:p.z-T.z}); });
    const used=new Set(gates.map(g=>g.s)); let fs=-1; [0,2,1,3].forEach(s=>{ if(fs<0&&!used.has(s)) fs=s; });
    const pt2=ctex(512,512,(x,Wd,Hh)=>{ x.fillStyle='#1c1a28'; x.fillRect(0,0,Wd,Hh); for(let i=0;i<16;i++) for(let j=0;j<16;j++){ const v=26+Math.floor(rn()*10); x.fillStyle=`rgb(${v},${v-2},${v+9})`; x.fillRect(i*32+1,j*32+1,30,30); }
      x.strokeStyle=T.col; x.lineWidth=8; x.globalAlpha=.8; x.strokeRect(Wd*.075,Hh*.075,Wd*.85,Hh*.85); x.setLineDash([26,18]); x.lineWidth=5; x.strokeRect(Wd*.3,Hh*.3,Wd*.4,Hh*.4); x.setLineDash([]); x.globalAlpha=.16; x.fillStyle='#fff';
      x.font='bold 150px system-ui,sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(C?CB_TYPES[C.ty].ic:'🏁',Wd/2,Hh/2); });
    pt2.wrapS=pt2.wrapT=THREE.ClampToEdgeWrapping; pt2.anisotropy=4;
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(2*(H+4),2*(H+4)),new THREE.MeshLambertMaterial({map:pt2})); pl.rotation.x=-Math.PI/2; pl.position.set(T.x,.04,T.z); sc.add(pl);
    /* façades : rangées d'immeubles qui ferment le carré, sauf aux arches */
    const em=new THREE.MeshBasicMaterial({color:tc}), plM=new THREE.MeshLambertMaterial({color:0x34314a});
    const spot=(s,u,off)=>{ const nx=W_SIDES[s][0], nz=W_SIDES[s][1]; return {x:T.x+nx*off-nz*u,z:T.z+nz*off+nx*u,ns:s%2===0}; };
    for(let s=0;s<4;s++){ for(let u=-H-12;u<H+12;){ const w=9+rn()*6, c=u+w/2, hh=10+rn()*26; u+=w+.6;
        if(gates.some(g=>g.s===s&&Math.abs(c-g.lat)<w/2+10.5)) continue; if(s===fs&&Math.abs(c)<14) continue;
        const q=spot(s,c,H+6), m=new THREE.Mesh(box,facs[Math.floor(rn()*5)]); m.scale.set(q.ns?w:10,hh,q.ns?10:w); m.position.set(q.x,hh/2,q.z); sc.add(m);
        const pb=new THREE.Mesh(box,plM); pb.scale.set(q.ns?w+1.4:11.4,.5,q.ns?11.4:w+1.4); pb.position.set(q.x,.25,q.z); sc.add(pb);
        if(rn()<.55){ const e=spot(s,c+w/2-.1,H+1.05), eb=new THREE.Mesh(box,em); eb.scale.set(.25,hh,.25); eb.position.set(e.x,hh/2,e.z); sc.add(eb); } } }
    /* arches d'entrée */
    gates.forEach(g=>{ [-1,1].forEach(sg=>{ const q=spot(g.s,g.lat+sg*10,H+1.2), pm=new THREE.Mesh(box,em); pm.scale.set(1.3,9,1.3); pm.position.set(q.x,4.5,q.z); sc.add(pm); const pb=new THREE.Mesh(box,plM); pb.scale.set(2.4,.6,2.4); pb.position.set(q.x,.3,q.z); sc.add(pb); });
      const q=spot(g.s,g.lat,H+1.2), lt=new THREE.Mesh(box,em); lt.scale.set(g.s%2===0?21.6:1.6,.9,g.s%2===0?1.6:21.6); lt.position.set(q.x,9,q.z); sc.add(lt); });
    /* arène du champion (ou garage de départ) du côté libre, face au centre */
    if(fs>=0){ const nx=W_SIDES[fs][0], nz=W_SIDES[fs][1], gx=T.x+nx*(H-9), gz=T.z+nz*(H-9), ga=Math.atan2(nz,nx);
      const gym=new THREE.Group(); gym.position.set(gx,0,gz); gym.rotation.y=Math.atan2(-nx,-nz); sc.add(gym);
      const body=new THREE.Mesh(new THREE.BoxGeometry(24,12,10),new THREE.MeshLambertMaterial({color:0x17122a})); body.position.y=6; gym.add(body);
      [[24.2,.25,0,12],[24.2,.25,0,.12],[.25,12,-12,6],[.25,12,12,6]].forEach(([w,h,ox,oy])=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.25),em); b.position.set(ox,oy,5.05); gym.add(b); });
      const door=new THREE.Mesh(new THREE.PlaneGeometry(8,5),new THREE.MeshBasicMaterial({map:ctex(128,100,(c,Wd,Hh)=>{ const g=c.createLinearGradient(0,0,0,Hh); g.addColorStop(0,T.col); g.addColorStop(1,'#08060f'); c.fillStyle=g; c.fillRect(0,0,Wd,Hh); c.fillStyle='rgba(0,0,0,.35)'; for(let y=6;y<Hh;y+=9) c.fillRect(0,y,Wd,3); })})); door.position.set(0,2.5,5.06); gym.add(door);
      const sg=rueSign(C?'ARÈNE '+CB_TYPES[C.ty].n.toUpperCase()+' '+CB_TYPES[C.ty].ic:'GARAGE · DÉPART',T.col,16,2.6,1); sg.position.set(0,8.8,5.07); gym.add(sg);
      const nm=rueSign(T.nm.toUpperCase(),'#ffffff',10,1.5); nm.position.set(0,5.9,5.07); gym.add(nm);
      [-8,0,8].forEach(u=>{ const c=spot(fs,u,H-9); W.col.push({x:c.x,z:c.z,r:6.4}); });
      T.ga=ga;
      const put=(P,x,z)=>{ const Hm=rueHuman(P.L,P.k==='c',new THREE.Color(rueCol(P)).getHex()); Hm.g.scale.multiplyScalar(1.45); Hm.g.position.set(x,.05,z); sc.add(Hm.g);
        const lb=rueLabel(P); lb.material.depthTest=true; lb.scale.multiplyScalar(1.35); lb.position.set(x,P.k==='c'?4.7:4.4,z); sc.add(lb); W.pers.push({P,H:Hm,x,z,lb,T}); };
      if(C) put(C,T.x+nx*(H-19),T.z+nz*(H-19));
      T.pil.forEach((P,i)=>{ const a=ga+Math.PI*(.55+i*.3); put(P,T.x+Math.cos(a)*24,T.z+Math.sin(a)*24); }); }
    const lab=rueSign((C?'🛡️ ':'🏁 ')+T.nm+(C?' · zone sûre':''),T.col,16,2,1); lab.position.set(T.x,16,T.z); lab.material.side=THREE.DoubleSide; T.sign=lab; sc.add(lab); });  /* barrières : route k fermée tant que le badge de la ville k n'est pas gagné */
  W.paths.forEach(R=>{ if(R.k<1) return; const p=R.P[R.gate], g=new THREE.Group(); g.position.set(p.x,0,p.z); g.rotation.y=Math.atan2(p.tx,p.tz); sc.add(g);
    const bar=new THREE.Mesh(new THREE.BoxGeometry(W_HW*2+4,1.2,.5),new THREE.MeshBasicMaterial({color:0xff2b4a})); bar.position.y=1.4; g.add(bar);
    const s=rueSign('🔒 '+RUE_CH[R.k-1].bn+' requis','#ff2b4a',10,1.6); s.position.set(0,3.6,0); s.material.side=THREE.DoubleSide; g.add(s); W.gates.push({R,g}); });
  /* voitures sauvages : 3 par route, cantonnées entre les deux villes */
  const ids=CARS.map(c=>c.id).filter(id=>id!=='patrouille'&&id!=='velo'&&M[id]); W.wild=[];
  W.routes.forEach(R=>{ for(let n=0;n<2;n++){ const mid=ids[Math.floor(rn()*ids.length)], w={R,mid,i:R.iA+(R.iB-R.iA)*(n?.82:.3),cool:0,ct:0,lane:(rn()-.5)*6,dir:rn()<.5?1:-1,sp:9+rn()*6,g:null,off:0};
    try{ const q=buildCar(M[mid],['#ff2b4a','#ff7a1a','#c39bff','#8fffc8'][n%4],{}); q.g.scale.setScalar(1.25); sc.add(q.g); w.g=q.g; w.q=q; }catch(e){} W.wild.push(w); } });
  const stars=[]; for(let i=0;i<500;i++){ const a=rn()*Math.PI*2, e=.15+rn()*1.2; stars.push(Math.cos(a)*Math.cos(e)*900+200,Math.sin(e)*900,Math.sin(a)*Math.cos(e)*900); }
  const sgeo=new THREE.BufferGeometry(); sgeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3)); sc.add(new THREE.Points(sgeo,new THREE.PointsMaterial({color:0xffffff,size:1.4,sizeAttenuation:false,fog:false})));
  W.sc=sc; W.cam=new THREE.PerspectiveCamera(60,1,.3,600); W.built=true; W.lkey=''; }
const rueChOf=T=>T.ch!=null?RUE_CH[T.ch]:null;
function wSetCar(){ const u=(cbTeam()[0])||(S.cars[0]&&S.cars[0].uid), c=car(u); if(!c) return false; if(W.uid===u&&W.car) return true;
  if(W.car){ W.sc.remove(W.car.g); } const m=M[c.mid]; W.car=buildCar(m,TIERS[m.t].c,carLook(c)); W.car.g.scale.setScalar(1.25); W.sc.add(W.car.g); W.uid=u;
  W.vmax=clamp((st(c).vmax||180)/3.6*.62,22,58); return true; }
function wLabels(){ const key=JSON.stringify([rueSt().w,rueSt().bdg]); if(key===W.lkey) return; W.lkey=key;
  W.pers.forEach(o=>{ W.sc.remove(o.lb); o.lb.material.map.dispose(); o.lb.material.dispose(); o.lb=rueLabel(o.P); o.lb.material.depthTest=true; o.lb.scale.multiplyScalar(1.35); o.lb.position.set(o.x,o.P.k==='c'?4.7:4.4,o.z); W.sc.add(o.lb); });
  W.gates.forEach(G=>{ G.g.visible=wGateLocked(G.R.k); }); }

/* ---------- 3. conduite, collisions, IA sauvage ---------- */
function wSpawn(k){ const T=W_TOWNS[k]||W_TOWNS[0], R=W.routes.find(r=>r.A===T), E=R?R.P[1]:null, Rb=W.routes.find(r=>r.B===T), Pb=Rb?Rb.P[Rb.P.length-2]:null; let x,z,h; if(E){ x=E.x; z=E.z; h=Math.atan2(E.tz,E.tx); } else { x=Pb.x; z=Pb.z; h=Math.atan2(-Pb.tz,-Pb.tx); } W.p.x=x; W.p.z=z; W.p.h=h; W.p.va=null; W.p.v=0; W.p.y=0; W.grace=3; }
function wTick(dt){ if(!W.on) return; W.t+=dt; const P=W.p, busy=!!(sheet||CBV||W.fight); dt=Math.min(dt,.05);
  if(!busy){ const k=W.key, st=clamp((W.in.st||0)+((k.ArrowRight||k.d)?1:0)-((k.ArrowLeft||k.q||k.a)?1:0),-1,1), gas=W.in.gas||((k.ArrowUp||k.z||k.w)?1:0), brk=W.in.brk||k.ArrowDown||k.s, hand=W.in.hand||k[' '];
    if(W.nitT>0) W.nitT-=dt; else if(W.nitCd>0) W.nitCd-=dt;
    const nit=W.nitT>0, vm=W.vmax*(nit?1.4:1);
    if(gas) P.v+=(P.v<0?26:(nit?24:13)*gas*(1-Math.max(0,P.v)/vm)+3*gas)*dt; else if(brk) P.v-=(P.v>.5?30:9)*dt; P.v-=P.v*.22*dt; if(!gas&&!brk&&Math.abs(P.v)<.3) P.v=0;
    if(hand&&P.v>0) P.v-=P.v*.35*dt;
    P.v=clamp(P.v,-W.vmax*.3,vm); const drift=hand&&Math.abs(P.v)>8;
    P.h+=st*dt*2.1*(drift?1.75:1)*(1-.45*Math.min(1,Math.abs(P.v)/vm))*clamp(P.v/7,-1,1);
    /* adhérence : la trajectoire suit le nez de la voiture, beaucoup moins vite en drift */
    if(P.va==null) P.va=P.h; const dd=Math.atan2(Math.sin(P.h-P.va),Math.cos(P.h-P.va)); P.va+=dd*Math.min(1,dt*(drift?1.6:9)); W.drift=drift&&Math.abs(dd)>.15;
    P.x+=Math.cos(P.va)*P.v*dt; P.z+=Math.sin(P.va)*P.v*dt;    /* rester sur la route ou dans une ville */
    const tw=wTownAt(P.x,P.z), q=wNear(P.x,P.z,P.y||0);
    if(tw<0){ if(!q){ wSpawn(W.town>=0?W.town:0); }
      else { const by=!q.alt&&W.routes[q.k].bay, ib=by&&q.i>=by.i0&&q.i<by.i1&&Math.sign(q.lat)===by.sd, lim=W_HW+1.2+(ib?(by.dep-2.5)*clamp(Math.min(q.i-by.i0,by.i1-q.i)/4,0,1):0); if(Math.abs(q.lat)>lim){ const s=Math.sign(q.lat); P.x=q.p.x+q.p.nx*s*lim; P.z=q.p.z+q.p.nz*s*lim; P.v*=.9; }
        const Pt=W.paths[q.pi]; if(wGateLocked(q.k)&&q.i>=Pt.gate-1&&q.i<Pt.gate+3){ const g=Pt.P[Math.max(0,Pt.gate-3)]; P.x=g.x+g.nx*q.lat; P.z=g.z+g.nz*q.lat; P.v=-Math.abs(P.v)*.2; if(!W.gateMsg||W.t-W.gateMsg>3){ W.gateMsg=W.t; toast('🔒 Il faut le '+RUE_CH[q.k-1].bn+' pour passer'); } } } }
    else { const T=W_TOWNS[tw], dx=P.x-T.x, dz=P.z-T.z, lm=W_R-1.6, onRoad=q&&Math.hypot(q.p.x-P.x,q.p.z-P.z)<24&&Math.abs(q.lat)<W_HW; if((Math.abs(dx)>lm||Math.abs(dz)>lm)&&!onRoad){ P.x=T.x+clamp(dx,-lm,lm); P.z=T.z+clamp(dz,-lm,lm); P.v*=.6; }
      if(W.town!==tw){ W.town=tw; rueSt().town=tw; try{ save(); }catch(_){} } }
    W.route=tw<0&&q?q.k:-1; const ty=tw<0&&q?q.p.y:0; P.y=(P.y||0)+(ty-(P.y||0))*Math.min(1,dt*12);
    (W.col||[]).forEach(o=>{ const d=Math.hypot(P.x-o.x,P.z-o.z), m=o.r+1.3; if(d<m&&(P.y||0)<1){ const a=Math.atan2(P.z-o.z,P.x-o.x); P.x=o.x+Math.cos(a)*m; P.z=o.z+Math.sin(a)*m; P.v*=.5; } });
    W.pers.forEach(o=>{ const d=Math.hypot(P.x-o.x,P.z-o.z); if(d<3.2){ const a=Math.atan2(P.z-o.z,P.x-o.x); P.x=o.x+Math.cos(a)*3.2; P.z=o.z+Math.sin(a)*3.2; P.v*=.3; } });
    if(W.grace>0) W.grace-=dt; }
  /* voitures sauvages */
  W.wild.forEach(w=>{ if(!w.g) return; const R=w.R, near=Math.hypot(P.x-R.P[Math.round(w.i)].x,P.z-R.P[Math.round(w.i)].z);
    if(w.off>0){ w.off-=dt; w.g.visible=false; if(w.off<=0){ w.i=R.iA+Math.random()*(R.iB-R.iA); } return; }
    if(!busy){ if(w.cool>0) w.cool-=dt; let chase=W.route===R.k&&W.grace<=0&&w.cool<=0&&near<30&&(P.y||0)<1.5; const q=chase?wIdxOn(R,P.x,P.z):null;
      /* elles abandonnent la poursuite au bout de 5 s, puis reprennent leur balade 10 s : on peut leur échapper */
      if(chase){ w.ct+=dt; if(w.ct>5){ w.ct=0; w.cool=10; chase=false; } } else w.ct=Math.max(0,w.ct-dt);
      if(chase&&q&&q.d<W_HW+3){ const di=q.i-w.i; w.dir=Math.sign(di)||w.dir; w.i+=w.dir*Math.min(Math.abs(di),(13/W_STEP)*dt); w.lane+=clamp(q.lat-w.lane,-4*dt,4*dt); }
      else { w.i+=w.dir*(w.sp/W_STEP)*dt; if(Math.random()<dt*.15) w.lane=clamp(w.lane+(Math.random()-.5)*3,-W_HW+2,W_HW-2); }
      if(w.i<=R.iA){ w.i=R.iA; w.dir=1; } if(w.i>=R.iB){ w.i=R.iB; w.dir=-1; } }
    const i0=Math.floor(w.i), f=w.i-i0, a=R.P[i0], b=R.P[Math.min(R.P.length-1,i0+1)], x=a.x+(b.x-a.x)*f+a.nx*w.lane, z=a.z+(b.z-a.z)*f+a.nz*w.lane;
    w.g.position.set(x,.05,z); w.g.rotation.y=-Math.atan2(a.tz*w.dir,a.tx*w.dir); w.g.visible=Math.hypot(P.x-x,P.z-z)<190;
    if(w.q&&w.q.wheels) w.q.wheels.forEach(wh=>{ wh.rotation.z-=dt*w.sp*.4; });
    if(!busy&&W.grace<=0&&(P.y||0)<1.5&&wTownAt(P.x,P.z)<0&&Math.hypot(P.x-x,P.z-z)<3.6) wEncounter(w); });
  /* voiture du joueur, caméra */
  if(W.car){ W.car.g.position.set(P.x,.05+(P.y||0),P.z); W.car.g.rotation.y=-P.h; if(W.car.wheels) W.car.wheels.forEach(wh=>{ wh.rotation.z-=dt*P.v*.45; }); }
  const cam=W.cam, fx=Math.cos(P.h), fz=Math.sin(P.h), cx=P.x-fx*13, cz=P.z-fz*13, k=Math.min(1,dt*4);
  const py=P.y||0; if(!W.camI){ cam.position.set(cx,6.5+py,cz); W.camI=1; } cam.position.x+=(cx-cam.position.x)*k; cam.position.z+=(cz-cam.position.z)*k; cam.position.y+=(6.5+py-cam.position.y)*Math.min(1,dt*6); cam.lookAt(P.x+fx*6,1.6+py,P.z+fz*6);
  /* personnages : respiration, regard vers la voiture */
  W.pers.forEach(o=>{ const d=Math.hypot(P.x-o.x,P.z-o.z); if(d>120) return; const H=o.H, kk=W.t*1.8+H.ph; H.chest.scale.y=1+Math.sin(kk)*.012; H.g.rotation.y=Math.atan2(P.x-o.x,P.z-o.z); });
  W.gates.forEach(G=>{ if(G.g.visible) G.g.children[0].material.color.setHSL(0,1,.45+.15*Math.sin(W.t*5)); });
  W_TOWNS.forEach(T=>{ if(T.sign) T.sign.lookAt(cam.position.x,16,cam.position.z); });
  wHud(dt); }
function wEncounter(w){ if(W.fight||CBV) return; W.fight={w}; const [l0,l1]=wRouteLv(w.R.k), lv=l0+Math.floor(Math.random()*(l1-l0+1)), ty=cbTypesOf(w.mid), iv={}; CB_SK.forEach(k=>iv[k]=6+Math.floor(Math.random()*14));
  const foe={mid:w.mid,lv:clamp(lv,1,CB_LVMAX),iv,tal:(CB_TAL_BY[ty[0]]||CB_TAL_BY.meca)[Math.floor(Math.random()*4)]}, cr=Math.round((60+lv*25)/10)*10;
  try{ vib50&&vib50(60); }catch(_){} toast('⚠️ Une '+M[w.mid].nom+' sauvage te percute !');
  setTimeout(()=>{ if(!W.on) return; $('wov')&&$('wov').classList.add('duel');
    cbStartDuel({team:cbTeam(),foes:[foe],d:lv<12?1:2,names:['Toi',M[w.mid].nom+' sauvage'],trainer:false,
      rewardHTML:win=>win?`<div class="rc60 cb"><div class="rc60-s">Voiture sauvage battue</div>${rcRow60('◈','Jetons Néo','+'+fmt(cr))}</div>`:`<div class="cb-rw lose">Tu es remorqué jusqu’à ${W_TOWNS[Math.max(0,W.town)].nm}</div>`,
      onEnd:res=>{ W.fight.win=!!res.win; const s=cbSt(); if(res.win){ s.w++; S.neo=(S.neo||0)+cr; } else s.l++; save(); },
      onClose:()=>{ const F=W.fight; W.fight=null; if(!F) return; F.w.off=25; W.grace=4; if(!F.win){ wSpawn(W.town>=0?W.town:0); } } });
    if(!CBV){ W.fight=null; $('wov')&&$('wov').classList.remove('duel'); } },350); }

/* ---------- 4. interface : HUD, mini-carte, commandes tactiles ---------- */
function wHud(dt){ const P=W.p; const sp=$('wSpd'); if(sp) sp.textContent=Math.round(Math.abs(P.v)*3.6);
  const kn=$('wKnob'); if(kn){ const x=Math.round(clamp(W.in.st||0,-1,1)*45); if(kn._x!==x){ kn._x=x; kn.style.transform='rotate('+(x*2.6).toFixed(0)+'deg)'; } }
  const nt=$('wNitT'), nb=$('wNit'); if(nt){ const t=W.nitT>0?'BOOST':W.nitCd>0?Math.ceil(W.nitCd)+' s':'prêt'; if(nt.textContent!==t){ nt.textContent=t; nb.classList.toggle('off',W.nitCd>0&&W.nitT<=0); } }
  const ng=$('wNitG'); if(ng) ng.classList.toggle('on',W.nitT>0); const wv=$('wov'); if(wv) wv.classList.toggle('drift',!!W.drift);
  const tw=wTownAt(P.x,P.z), z=$('wZone'); let key, html;
  if(tw>=0){ const T=W_TOWNS[tw], C=rueChOf(T); key='t'+tw; html=`<b style="color:${T.col}">🛡️ ${T.nm}</b><small>Zone sûre${C?' · Arène '+CB_TYPES[C.ty].ic+' '+CB_TYPES[C.ty].n:' · ton garage'}</small>`; }
  else if(W.route>=0){ const [a,b]=wRouteLv(W.route); key='r'+W.route; html=`<b>⚠️ Route ${W.route+1}</b><small>Voitures sauvages niv. ${a} à ${b}</small>`; }
  if(z&&key&&key!==W.zoneK){ W.zoneK=key; z.innerHTML=html; z.classList.remove('pop'); void z.offsetWidth; z.classList.add('pop'); }
  /* station-service ou personnage à portée */
  const act=$('wAct'); if(act){ let best=null, bd=11; if(Math.abs(P.v)<7) W.pers.forEach(o=>{ const d=Math.hypot(P.x-o.x,P.z-o.z); if(d<bd){ bd=d; best=o; } });
    const stn=Math.abs(P.v)<4&&(P.y||0)<1&&(W.stations||[]).some(s=>Math.hypot(P.x-s.x,P.z-s.z)<3.6);
    if(stn){ if(act.dataset.id!=='fuel'){ act.dataset.id='fuel'; act.innerHTML='<button class="btn" data-a="wstation">⛽ Station Néon Fuel · soins et boutique</button>'; } }
    else { const id=best?best.P.id:''; if(act.dataset.id!==id){ act.dataset.id=id; act.innerHTML=best?`<button class="btn" data-a="ruego" data-id="${id}">${rueOpen(best.P)?'⚔️ Parler à '+best.P.nm.replace(/ «.*»/,'')+' · niv. '+best.P.lv:'🔒 '+best.P.nm.replace(/ «.*»/,'')}</button>`:''; } } }
  W.tmT=(W.tmT||0)-dt; if(W.tmT<=0){ W.tmT=.5; wTeamHud(); }
  W.mapT-=dt; if(W.mapT<=0){ W.mapT=.2; wMap(); } }
function wMap(){ const cv=$('wMap'); if(!cv) return; const x=cv.getContext('2d'), Wd=cv.width, H=cv.height, s=Wd/1500, ox=560, oz=720, X=v=>(v+ox)*s, Z=v=>(v+oz)*s;
  x.clearRect(0,0,Wd,H); x.fillStyle='rgba(8,6,20,.82)'; x.fillRect(0,0,Wd,H);
  W.paths.forEach(R=>{ x.strokeStyle=wGateLocked(R.k)?'rgba(255,43,74,.7)':R.isAlt?'rgba(0,229,255,.75)':'rgba(200,200,230,.8)'; x.lineWidth=R.isAlt?3:4; x.beginPath(); R.P.forEach((p,i)=>{ if(i%4) return; i?x.lineTo(X(p.x),Z(p.z)):x.moveTo(X(p.x),Z(p.z)); }); x.stroke(); });
  x.fillStyle='#5dff9a'; (W.stations||[]).forEach(s=>{ x.fillRect(X(s.x)-3.5,Z(s.z)-3.5,7,7); });
  W_TOWNS.forEach(T=>{ const C=rueChOf(T), got=C&&rueSt().bdg[C.ty]; x.fillStyle=T.col; x.beginPath(); x.arc(X(T.x),Z(T.z),got?7:5.5,0,7); x.fill(); if(got){ x.strokeStyle='#fff'; x.lineWidth=2; x.stroke(); } });
  x.fillStyle='#ff2b4a'; W.wild.forEach(w=>{ if(!w.g||!w.g.visible) return; x.fillRect(X(w.g.position.x)-2,Z(w.g.position.z)-2,4,4); });
  const P=W.p; x.save(); x.translate(X(P.x),Z(P.z)); x.rotate(P.h); x.fillStyle='#fcee0a'; x.beginPath(); x.moveTo(8,0); x.lineTo(-5,-5); x.lineTo(-5,5); x.closePath(); x.fill(); x.restore(); }
function wDom(){ if($('wov')) return; const d=document.createElement('div'); d.id='wov';
  d.innerHTML=`<div id="wslot" class="w-3d"></div><div class="w-top"><button class="btn alt sm" data-a="wquit">← Quitter</button><div class="w-mid"><div class="w-zone" id="wZone"></div><div class="w-team" id="wTeam"></div></div><canvas id="wMap" width="240" height="240"></canvas></div>
    <div class="w-spd"><b id="wSpd">0</b><small>km/h</small></div><div class="w-act" id="wAct"></div>
    <div class="w-nit" id="wNitG"><i></i></div>
    <div class="padS pad49 wpad"><div id="wSteer" class="steer"><div id="wKnob" class="wheel">${WHEEL}</div><div class="lab">Volant</div></div>
      <button id="wBrk" class="pedal brk"><span>Frein</span></button>
      <div class="dnk"><button id="wHnd" class="pedal hnd big"><span>Drift</span><small>frein à main</small></button><button id="wNit" class="pedal nit">Nitro<small id="wNitT">prêt</small></button></div>
      <button id="wGas" class="pedal gas big"><i id="wGasP"></i><span>Gaz<small>glisse vers le bas pour doser</small></span></button></div>`;
  document.body.appendChild(d); document.body.classList.add('won');
  /* même pavé que les épreuves : la position du doigt dans la zone du volant fixe l'angle, le gaz se dose en glissant vers le bas */
  const zn=$('wSteer'), kn=$('wKnob'), setSt=e=>{ const r=zn.getBoundingClientRect(); W.in.st=clamp(((e.clientX-r.left)/r.width*2-1)*1.15,-1,1); };
  zn.addEventListener('pointerdown',e=>{ e.preventDefault(); zn.classList.remove('rel'); try{ zn.setPointerCapture(e.pointerId); }catch(_){} setSt(e); });
  zn.addEventListener('pointermove',e=>{ if(e.buttons||e.pressure>0) setSt(e); });
  const zup=()=>{ W.in.st=0; zn.classList.add('rel'); }; zn.addEventListener('pointerup',zup); zn.addEventListener('pointercancel',zup);
  const bg=$('wGas'); let y0=0, gd=false;
  bg.addEventListener('pointerdown',e=>{ e.preventDefault(); try{ bg.setPointerCapture(e.pointerId); }catch(_){} gd=true; y0=e.clientY; W.in.gas=1; bg.classList.add('on'); });
  bg.addEventListener('pointermove',e=>{ if(gd) W.in.gas=clamp(1-Math.max(0,e.clientY-y0)/110,.25,1); });
  const gup=()=>{ gd=false; W.in.gas=0; bg.classList.remove('on'); }; bg.addEventListener('pointerup',gup); bg.addEventListener('pointercancel',gup);
  [['wBrk','brk'],['wHnd','hand']].forEach(([id,k])=>{ const b=$(id); b.addEventListener('pointerdown',e=>{ e.preventDefault(); W.in[k]=1; b.classList.add('on'); try{ b.setPointerCapture(e.pointerId); }catch(_){} });
    const off=()=>{ W.in[k]=0; b.classList.remove('on'); }; b.addEventListener('pointerup',off); b.addEventListener('pointercancel',off); });
  $('wNit').addEventListener('pointerdown',e=>{ e.preventDefault(); wNitro(); });
  [zn,bg,$('wBrk'),$('wHnd'),$('wNit')].forEach(b=>b.addEventListener('contextmenu',e=>e.preventDefault())); }
/* nitro de la Région : gratuite, 2,5 s de poussée puis 12 s de recharge (ne consomme pas tes nitros de course) */
function wNitro(){ if(W.nitCd>0||W.nitT>0||CBV||sheet) return; W.nitT=2.5; W.nitCd=12; try{ vib50&&vib50(30); }catch(_){} }
const wKey=(e,v)=>{ if(!W.on) return; const k=e.key.length===1?e.key.toLowerCase():e.key; if(k==='n'&&v) wNitro(); if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','z','q','s','d','w','a',' '].includes(k)){ W.key[k]=v; e.preventDefault(); } };
window.addEventListener('keydown',e=>wKey(e,1)); window.addEventListener('keyup',e=>wKey(e,0));
function wResume(){ if(!W.on||CBV||!$('wslot')) return; $('wov').classList.remove('duel'); wLabels(); if(!wSetCar()) return; glAttach('wslot'); glRun(W.sc,W.cam,wTick,'world'); GL.r.domElement.style.touchAction='none'; }
async function wOpen(){ if(!cbAwake()) return toast('🔒 La Région Néon s’ouvre après l’éveil cosmique'); if(W.on||CBV) return; if(!glEnsure()) return toast('La 3D n’est pas disponible sur cet appareil');
  if(!cbTeam().length&&!S.cars.length) return toast('Il te faut une voiture'); toast('🚗 Chargement de la Région Néon…');
  try{ await ensureModels(); }catch(_){} if(!W.built){ try{ wBuild(); }catch(e){ console.error('monde',e); return toast('Erreur de chargement de la carte'); } }
  try{ closeSheet(); }catch(_){} W.on=true; W.camI=0; W.zoneK=''; W.in={st:0,gas:0,brk:0,hand:0}; W.nitT=0; W.nitCd=0; W.key={}; wDom(); wSetCar(); wSpawn(rueSt().town||0); W.town=-1; try{ musicStop(); }catch(_){} wResume(); }
ACT.wopen=()=>wOpen();
ACT.wquit=()=>{ W.on=false; W.fight=null; try{ glStop(); }catch(_){} const d=$('wov'); if(d) d.remove(); document.body.classList.remove('won'); render(); };
{ const _rs=rueStart; rueStart=async function(){ if(W.on) return; return _rs.apply(this,arguments); }; }
{ const _r=render; render=function(){ const r=_r.apply(this,arguments); try{ if(W.on&&!CBV) wResume(); }catch(e){ console.warn('monde',e); } return r; }; }
/* bouton d'entrée dans l'Arène (onglet Rue et Badges) */
{ const _va=vArena; vArena=function(){ const h=_va.apply(this,arguments); if(!cbAwake()||!['rue','badges'].includes(AR.tab)) return h;
  const T=W_TOWNS[rueSt().town||0], b=`<button class="w-enter" data-a="wopen"><b>🚗 Explorer la Région Néon</b><small>Conduis ta voiture de ville en ville · 8 arènes · voitures sauvages sur les routes${rueSt().town?' · reprise à '+T.nm:''}</small></button>`;
  const k=h.indexOf('<div class="arena">'); return k>=0?h.slice(0,k+19)+b+h.slice(k+19):h+b; }; }

/* ---------- 5. v1.8 : PV qui restent entre les duels de la Région, stations-service, équipe à l'écran ---------- */
const wHp=()=>{ const s=rueSt(); if(!s.hp) s.hp={}; return s.hp; };
function wHeal(){ rueSt().hp={}; }
function wTeamHud(){ const el=$('wTeam'); if(!el) return; const H=wHp(), t=cbTeam().map(u=>car(u)).filter(Boolean);
  const h=t.map(c=>{ const q=H[c.uid]==null?1:H[c.uid], col=q<=0?'#555':q<.3?'#ff2b4a':q<.6?'#ffd24a':'#5dff9a'; return `<span class="${q<=0?'ko':''}" title="${M[c.mid].nom}"><i style="width:${Math.round(q*100)}%;background:${col}"></i></span>`; }).join('');
  const hh=h?'<em title="Barres de vie (PV) de chaque voiture de ton équipe">PV</em>'+h:''; if(el.dataset.h!==hh){ el.dataset.h=hh; el.innerHTML=hh; } }
/* station-service : on se gare entre les bornes → soins payants + boutique d'objets de combat */
const wHealCost=()=>{ const H=wHp(); let c=0, need=0; cbTeam().forEach(u=>{ const k=car(u); if(!k) return; const q=H[u]==null?1:H[u], lv=k.lvl||1; c+=(1-q)*(150+22*lv)+(100-(k.etat==null?100:k.etat))*4; if(q<.999||(k.etat!=null&&k.etat<100)) need=1; }); return need?Math.max(50,Math.round(c/10)*10):0; };
ACT.wstation=()=>{ openSheet({t:'wstation'}); try{ ui('click'); }catch(_){} };
ACT.wheal=()=>{ const c=wHealCost(); if(!c) return toast('Ton équipe est déjà en pleine forme'); if(neoN()<c) return toast('Pas assez de jetons Néo'); S.neo=neoN()-c; wHeal(); cbTeam().forEach(u=>{ const k=car(u); if(k) k.etat=100; }); save(); wTeamHud(); renderSheet(); try{ cbSfx('win'); }catch(_){} toast('🔧 Équipe réparée : PV et état à 100 % (−'+neoT(c)+')'); };
{ const _sx=sheetExtra; sheetExtra=function(X){ if(sheet&&sheet.t==='wstation'){ const H=wHp(), cost=wHealCost(), bag=cbBag();
    const rows=cbTeam().map(u=>car(u)).filter(Boolean).map(k=>{ const q=H[k.uid]==null?1:H[k.uid], col=q<=0?'#555':q<.3?'#ff2b4a':q<.6?'#ffd24a':'#5dff9a'; return `<div class="ws-car"><b>${M[k.mid].nom}</b><div class="ws-bar"><i style="width:${Math.round(q*100)}%;background:${col}"></i></div><small>${Math.round(q*100)} % PV · état ${k.etat==null?100:k.etat} %</small></div>`; }).join('');
    $('sheet').innerHTML=`${X}<div class="wst"><h2>⛽ Station Néon Fuel</h2><p class="note">Tu as <b>${neoT(neoN())}</b>.</p>
      <div class="ws-sec">🔧 Atelier</div>${rows}
      <button class="btn wide ${cost?'':'alt'}" data-a="wheal" ${cost&&neoN()>=cost?'':'disabled'}>${cost?'🔧 Restaurer PV et état · '+neoT(cost):'✓ Équipe en pleine forme'}</button>
      <div class="ws-sec">🛒 Boutique d’objets</div><p class="note sm">Objets utilisables pendant les duels (4 par combat). Sac : ${Object.entries(bag).filter(([k,n])=>n>0&&CB_IT[k]).map(([k,n])=>CB_IT[k].ic+' '+n).join(' · ')||'vide'}</p>
      <div class="cbshop">${Object.entries(CB_IT).map(([k,it])=>`<div class="cbs-r"><span class="cbs-ic">${it.ic}</span><div><b>${it.n}</b><small>${it.d} · possédé : ${bag[k]||0}</small></div><div class="cbs-b"><button class="btn sm" data-a="cbbuy" data-id="${k}" data-v="1" ${neoN()<it.px?'disabled':''}>${fmt(it.px)} ◈</button><button class="btn alt sm" data-a="cbbuy" data-id="${k}" data-v="5" ${neoN()<it.px*5?'disabled':''}>×5</button></div></div>`).join('')}</div>
      <button class="btn alt wide" data-a="close">Reprendre la route</button></div>`; return true; } return _sx.apply(this,arguments); }; }
{ const _b=ACT.cbbuy; ACT.cbbuy=function(){ const r=_b.apply(this,arguments); if(sheet&&sheet.t==='wstation'){ const y=$('sheet').scrollTop; renderSheet(); $('sheet').scrollTop=y; } return r; }; }{ const _sd=cbStartDuel; cbStartDuel=function(o){ if(!W.on||!o) return _sd.apply(this,arguments);
  const H=wHp(), team=(o.team||cbTeam()).filter(u=>car(u)&&!(H[u]<=0));
  if(!team.length){ toast('💥 Toutes tes voitures sont K.O. : remorquage et réparation'); wHeal(); W.fight=null; wSpawn(W.town>=0?W.town:0); return; }
  const oe=o.onEnd; o=Object.assign({},o,{team,onEnd:(res,B)=>{ try{ if(res.win) B.sides[0].team.forEach(f=>{ if(f.uid) H[f.uid]=Math.max(0,f.hp/f.mhp); }); else wHeal(); save(); }catch(_){} if(oe) return oe(res,B); }});
  const r=_sd.call(this,o);
  if(CBV){ CBV.B.sides[0].team.forEach(f=>{ const q=H[f.uid]; if(q!=null&&q<1){ f.hp=Math.max(1,Math.round(f.mhp*q)); CBV.disp.set(f,f.hp); } }); try{ cbDraw(); }catch(_){} }
  return r; }; }

/* ---------- 6. métro : l'arrêt « Région Néon » ouvre la carte (ligne 2 : Région Néon, Salle d'arcade, Plage Irie) ---------- */
try{ const D=DEST.find(d=>d.id==='street'); if(D){ D.nom='Région Néon'; D.ic='🗺️'; D.d='Conduis de ville en ville : 8 arènes, pilotes, voitures sauvages, stations-service.'; }
  const L2=LINES.find(L=>L[2].includes('street')); if(L2) L2[2]=['street','arcade','beach']; }catch(e){}
{ const _wt=ACT.wtravel; ACT.wtravel=function(d){ if(d&&d.id==='street'){ if(!cbAwake()) return toast('🔒 La Région Néon s’ouvre après l’éveil cosmique (niveau '+CB_LV+')'); try{ closeSheet(); }catch(_){} return wOpen(); } return _wt.apply(this,arguments); }; }
{ const _ge=growEnter; growEnter=function(room){ if(room==='street'){ if(cbAwake()) wOpen(); else toast('🔒 La Région Néon s’ouvre après l’éveil cosmique'); return; } return _ge.apply(this,arguments); }; }
/* Rue Néon : rappel de l'histoire */
{ const _va=vArena; vArena=function(){ const h=_va.apply(this,arguments); if(!cbAwake()||AR.tab!=='rue') return h; const nb=Object.keys(rueSt().w).length;
  return h.replace('<div class="rue-strip">',`<p class="note sm rue-story">📖 Les pilotes apparaissent ici pour une revanche une fois battus dans la Région Néon (${nb}/${RUE_PIL.length+RUE_CH.length} rencontrés).</p><div class="rue-strip">`); }; }