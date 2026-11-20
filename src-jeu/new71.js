/* ===== v2.8 : le flipper en vrai 3D =====
   La physique et les règles restent celles de new23 (plateau 360×600, y vers le bas). Ici on ne fait que dessiner : un plateau en relief vu en perspective
   (rails chromés, bumpers champignon, flippers, rampes surélevées sur pieds, bille chromée qui reflète le décor, ombres, lumière qui suit la bille).
   Monde 3D : X = x − 180, Z = y − 300, Y vers le haut, bille de rayon 6,5. Repli automatique sur l'ancien dessin 2D si Three.js / WebGL est indisponible. */
function pin3dMake(S3,host,topCv){
  if(!window.THREE||window.__pin3dOff) return null; const T3=THREE;
  const LOWQ=(typeof S!=='undefined'&&S&&S.q==='low')||(typeof S!=='undefined'&&S&&S.q!=='high'&&!!window.__lq); let ren; try{ ren=new T3.WebGLRenderer({antialias:!LOWQ,alpha:true,powerPreference:'high-performance'}); if(!ren.getContext()) return null; }catch(e){ return null; }
  const dom=ren.domElement; dom.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;display:block';
  host.insertBefore(dom,topCv); ren.setClearColor(0x000000,0); ren.outputEncoding=T3.sRGBEncoding; ren.toneMapping=T3.ACESFilmicToneMapping; ren.toneMappingExposure=1.1;
  const sc=new T3.Scene(), cam=new T3.PerspectiveCamera(32,.6,100,4000), TH=S3.TH, RB=S3.R, X=x=>x-180, Z=y=>y-300, PI=Math.PI;
  const own=[];                                        /* textures à libérer */
  /* ---------- outils ---------- */
  const hx=c=>{ c=String(c); if(c[0]==='#'){ if(c.length===4) c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3]; return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]; } const m=c.match(/[\d.]+/g)||[0,0,0]; return [+m[0],+m[1],+m[2]]; };
  const mixc=(a,b,k)=>{ const A=hx(a), B=hx(b); return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')'; };
  const basic=(c,o)=>new T3.MeshBasicMaterial(Object.assign({color:c},o||{}));
  const std=(c,m,r,o)=>new T3.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:r},o||{}));
  const radial=(inner,outer)=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,inner); g.addColorStop(.45,outer[0]); g.addColorStop(1,outer[1]); x.fillStyle=g; x.fillRect(0,0,64,64); const t=new T3.CanvasTexture(c); own.push(t); return t; };
  const glowTex=radial('rgba(255,255,255,1)',['rgba(255,255,255,.35)','rgba(255,255,255,0)']), shadTex=radial('rgba(0,0,0,.7)',['rgba(0,0,0,.35)','rgba(0,0,0,0)']);
  const flat=(geo,mat,y)=>{ const m=new T3.Mesh(geo,mat); m.rotation.x=-PI/2; m.position.y=y||0; return m; };
  const glow=(c,s,y,o)=>{ const m=flat(new T3.PlaneGeometry(1,1),basic(c,{map:glowTex,transparent:true,blending:T3.AdditiveBlending,depthWrite:false,opacity:o==null?.8:o}),y==null?.7:y); m.scale.set(s,s,1); return m; };
  const blob=(s,o)=>{ const m=flat(new T3.PlaneGeometry(1,1),basic(0x000000,{map:shadTex,transparent:true,depthWrite:false,opacity:o==null?.8:o}),.35); m.scale.set(s,s,1); return m; };
  const disposeTree=o=>{ o.traverse(c=>{ if(c.geometry) c.geometry.dispose(); if(c.material){ (Array.isArray(c.material)?c.material:[c.material]).forEach(m=>{ if(m.map&&m.userData&&m.userData.own) m.map.dispose(); m.dispose(); }); } }); };
  const mergeG=list=>{ let n=0; list.forEach(g=>n+=g.attributes.position.count); const pos=new Float32Array(n*3), nor=new Float32Array(n*3), uv=new Float32Array(n*2); let o=0;
    list.forEach(g=>{ const c=g.attributes.position.count; pos.set(g.attributes.position.array,o*3); nor.set(g.attributes.normal.array,o*3); if(g.attributes.uv) uv.set(g.attributes.uv.array,o*2); o+=c; });
    const G=new T3.BufferGeometry(); G.setAttribute('position',new T3.BufferAttribute(pos,3)); G.setAttribute('normal',new T3.BufferAttribute(nor,3)); G.setAttribute('uv',new T3.BufferAttribute(uv,2)); list.forEach(g=>g.dispose()); return G; };
  const place=(g,x,y,z,ry)=>{ const m=new T3.Matrix4().makeRotationY(ry||0); m.setPosition(x,y,z); g.applyMatrix4(m); return g; };
  const texCanvas=(w,h,fn,wrap)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); const t=new T3.CanvasTexture(c); t.encoding=T3.sRGBEncoding; if(wrap) t.wrapS=t.wrapT=T3.RepeatWrapping; t.anisotropy=4; own.push(t); return t; };
  const brushTex=texCanvas(256,256,(x,w,h)=>{ x.fillStyle='#b9bdd8'; x.fillRect(0,0,w,h); for(let i=0;i<900;i++){ x.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'0,0,20')+','+(Math.random()*.16)+')'; x.fillRect(Math.random()*w,Math.random()*h,20+Math.random()*120,1); } },true);
  const rubberTex=texCanvas(128,128,(x,w,h)=>{ x.fillStyle='#ececf2'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(0,0,0,.24)'; x.lineWidth=2; for(let k=-h;k<w;k+=10){ x.beginPath(); x.moveTo(k,0); x.lineTo(k+h,h); x.stroke(); } for(let i=0;i<500;i++){ x.fillStyle='rgba(0,0,0,.09)'; x.fillRect(Math.random()*w,Math.random()*h,1.5,1.5); } },true); rubberTex.repeat.set(1/22,1/22);
  const tileTex=texCanvas(512,512,(x,w,h)=>{ let sd=7; const rn=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; }; x.fillStyle='#17151f'; x.fillRect(0,0,w,h);
    for(let i=0;i<8;i++) for(let j=0;j<8;j++){ const v=22+Math.floor(rn()*12); x.fillStyle='rgb('+v+','+(v-1)+','+(v+9)+')'; x.fillRect(i*64+2,j*64+2,60,60); }
    for(let i=0;i<7000;i++){ x.fillStyle='rgba(255,255,255,'+(rn()*.05)+')'; x.fillRect(rn()*w,rn()*h,2,2); }
    x.lineCap='round'; for(let i=0;i<6;i++){ x.strokeStyle='rgba(0,0,0,'+(.25+rn()*.25)+')'; x.lineWidth=8+rn()*8; x.beginPath(); const a=rn()*6.3, R=70+rn()*160; x.arc(w/2,h/2,R,a,a+1+rn()*1.8); x.stroke(); }
    x.strokeStyle='rgba(0,229,255,.30)'; x.lineWidth=2; x.strokeRect(1,1,w-2,h-2); },true); tileTex.repeat.set(30,30);  const gridTex=texCanvas(256,256,(x,w,h)=>{ x.fillStyle='#05030b'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(255,43,214,.55)'; x.lineWidth=2; x.strokeRect(1,1,w-2,h-2); x.strokeStyle='rgba(0,229,255,.3)'; x.lineWidth=1; x.beginPath(); x.moveTo(w/2,0); x.lineTo(w/2,h); x.moveTo(0,h/2); x.lineTo(w,h/2); x.stroke(); },true); gridTex.repeat.set(26,26);  /* ---------- lumières et reflets ---------- */
  try{ const ec=document.createElement('canvas'); ec.width=512; ec.height=256; const x=ec.getContext('2d'), g=x.createLinearGradient(0,0,0,256); g.addColorStop(0,'#2a1a5a'); g.addColorStop(.5,'#120a2a'); g.addColorStop(1,'#04020a'); x.fillStyle=g; x.fillRect(0,0,512,256);
    [['#ffffff',40,40,130,34],['#7df3ff',230,60,110,22],['#ff5cdc',380,40,100,26],['#ffffff',300,100,70,12],['#ffd24a',90,110,80,14]].forEach(([c,a,b,w,h])=>{ x.fillStyle=c; x.shadowColor=c; x.shadowBlur=24; x.fillRect(a,b,w,h); });
    const et=new T3.CanvasTexture(ec); et.mapping=T3.EquirectangularReflectionMapping; et.encoding=T3.sRGBEncoding; const pm=new T3.PMREMGenerator(ren); const rt=pm.fromEquirectangular(et); sc.environment=rt.texture; own.push(et); pm.dispose(); }catch(e){ console.warn('env 3D',e); }
  const amb=new T3.AmbientLight(0x6a60a0,.32), sun=new T3.DirectionalLight(0xffffff,.8), fill=new T3.PointLight(0xb08cff,.25,1400,2), ballL=new T3.PointLight(0x9fe9ff,1.5,150,2);
  sun.position.set(-160,420,200); fill.position.set(60,700,-100); ballL.position.set(0,26,100); sc.add(amb,sun,fill,ballL);
  /* ---------- caméra : tout le plateau tient dans le cadre ---------- */
  let pitch=58*PI/180, ASP=.6, CAMZ=0, PLAN=false, KY=1;
  const cornersTop=[[6,-6,0],[354,-6,0],[6,606,0],[354,606,0],[12,40,16],[348,40,16],[-9,-18,186],[369,-18,186]], cornersPlan=[[-6,-6,0],[366,-6,0],[-6,606,0],[366,606,0]];
  let camD=900;
  /* étirement vertical doux (KY) : le plateau remplit l'écran du haut (bac arrière) au bas (drain) quel que soit le format du téléphone */
  const camFor=(d,tz,pt,ky)=>{ cam.position.set(0,Math.sin(pt)*d,tz+Math.cos(pt)*d); cam.lookAt(0,0,tz); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); cam.projectionMatrix.elements[5]*=ky; cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert(); };
  const ndcOf=p=>new T3.Vector3(X(p[0]),p[2],Z(p[1])).project(cam);
  function fitAt(pt){ cam.aspect=ASP; const cs=PLAN?cornersPlan:cornersTop; let d=900, tz=40, ky=1;
    for(let it=0;it<40;it++){ camFor(d,tz,pt,ky); let mnx=9,mxx=-9,mny=9,mxy=-9; cs.forEach(c=>{ const v=ndcOf(c); mnx=Math.min(mnx,v.x); mxx=Math.max(mxx,v.x); mny=Math.min(mny,v.y); mxy=Math.max(mxy,v.y); });
      const w=(mxx-mnx)/2, h=(mxy-mny)/2; d*=w/.995; if(!PLAN) ky=Math.max(.9,Math.min(1.7,ky*.995/h)); else d*=Math.max(1,h/w);
      const cy=(mny+mxy)/2; tz-=cy*d*Math.tan(cam.fov*PI/360)/Math.sin(pt)*.5/ky; }
    camFor(d,tz,pt,ky); return {d,tz,ky}; }
  function fitCam(){ pitch=(PLAN?89.6:58)*PI/180; const r=fitAt(pitch); CAMZ=r.tz; camD=r.d; KY=r.ky; }
  /* ---------- peinture du plateau (texture 2×, coordonnées de la table) ---------- */
  let fieldMesh=null, fieldTex=null;
  const polyIn=x=>{ x.beginPath(); x.moveTo(12,170); x.arc(180,170,168,PI,2*PI); x.lineTo(348,598); x.lineTo(318,598); x.lineTo(318,455); x.lineTo(222,545); x.lineTo(98,545); x.lineTo(12,455); x.closePath(); };
  const STARS=Array.from({length:40},(_,i)=>[(i*97%340)+10,(i*61%520)+20,(i%5)+1]);
  function paintField(){ const T=S3.T, i=S3.tabI, c=document.createElement('canvas'); c.width=840; c.height=1320; const x=c.getContext('2d'); x.scale(2,2); x.translate(30,30);
    x.fillStyle='#05030b'; x.fillRect(-30,-30,420,660);
    x.save(); polyIn(x); x.clip();
    const g=x.createLinearGradient(0,0,0,600); g.addColorStop(0,mixc(TH.bg[0],'#ffffff',.06)); g.addColorStop(1,mixc(TH.bg[1],T.bg,.12)); x.fillStyle=g; x.fillRect(0,0,360,600);
    const rg=x.createRadialGradient(180,260,10,180,260,300); rg.addColorStop(0,mixc(T.bg,'#000000',.55).replace('rgb','rgba').replace(')',',.30)')); rg.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=rg; x.fillRect(0,0,360,600);
    x.strokeStyle=TH.grid; x.lineWidth=.8; x.globalAlpha=.8; for(let a=0;a<=360;a+=30){ x.beginPath(); x.moveTo(a,0); x.lineTo(a,600); x.stroke(); } for(let b=0;b<=600;b+=30){ x.beginPath(); x.moveTo(0,b); x.lineTo(360,b); x.stroke(); } x.globalAlpha=1;
    /* décor propre à chaque table (version figée) */
    x.save(); x.lineWidth=2; x.strokeStyle=T.bg; x.fillStyle=T.bg;
    if(i===1){ x.globalAlpha=.16; for(let k=1;k<=5;k++){ x.beginPath(); x.arc(180,330,k*58,PI,0); x.stroke(); } }
    else if(i===2){ x.globalAlpha=.2; x.setLineDash([16,14]); x.lineWidth=6; x.beginPath(); x.moveTo(40,130); x.bezierCurveTo(300,120,40,260,240,300); x.bezierCurveTo(300,320,120,380,150,420); x.stroke(); }
    else if(i===3){ x.globalAlpha=.14; [[90,430,60,1],[250,470,44,-1]].forEach(gg=>{ x.save(); x.translate(gg[0],gg[1]); x.beginPath(); for(let k=0;k<16;k++){ const a=k/16*6.283, r=k%2?gg[2]:gg[2]+10; x.lineTo(Math.cos(a)*r,Math.sin(a)*r); } x.closePath(); x.fill(); x.restore(); }); }
    else if(i===4){ x.globalAlpha=.16; for(let k=0;k<6;k++){ const p=k/6, w=40+p*150, hh=60+p*210; x.strokeRect(180-w,300-hh,w*2,hh*2); } }
    else if(i===5){ STARS.forEach((s,k)=>{ x.globalAlpha=.25+.3*Math.abs(Math.sin(k)); x.fillRect(s[0],s[1],s[2],s[2]); }); }
    else if(i===6){ x.globalAlpha=.2; x.lineWidth=5; for(let k=0;k<6;k++){ x.beginPath(); x.moveTo(60,520-k*70); x.lineTo(300,520-k*70); x.setLineDash([22,18]); x.stroke(); } }
    else if(i===7){ x.globalAlpha=.16; x.lineWidth=3; [60,100,140,180].forEach(r=>{ x.beginPath(); x.arc(172,262,r,0,7); x.stroke(); }); }
    x.restore();
    /* matière du plateau : dalles du sol de base du jeu, grain, rayures, puis un motif propre à chaque table */
    x.save(); polyIn(x); x.clip();
    { const rnd=(a,b)=>a+Math.random()*(b-a); x.lineCap='round';
      for(let i=0;i<13;i++) for(let j=0;j<21;j++){ x.fillStyle=Math.random()<.5?'rgba(255,255,255,'+rnd(.015,.06)+')':'rgba(0,0,0,'+rnd(.04,.14)+')'; x.fillRect(i*30+1,j*30+1,28,28); }
      x.strokeStyle='rgba(0,0,0,.42)'; x.lineWidth=1.6; for(let a=0;a<=390;a+=30){ x.beginPath(); x.moveTo(a,0); x.lineTo(a,630); x.stroke(); } for(let b=0;b<=630;b+=30){ x.beginPath(); x.moveTo(0,b); x.lineTo(390,b); x.stroke(); }
      x.strokeStyle='rgba(255,255,255,.06)'; x.lineWidth=1; for(let a=1;a<=390;a+=30){ x.beginPath(); x.moveTo(a,0); x.lineTo(a,630); x.stroke(); } for(let b=1;b<=630;b+=30){ x.beginPath(); x.moveTo(0,b); x.lineTo(390,b); x.stroke(); }
      for(let k=0;k<3200;k++){ const px=rnd(0,360), py=rnd(0,600), l=rnd(2,12), a=rnd(0,6.28); x.strokeStyle=Math.random()<.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.09)'; x.lineWidth=rnd(.4,1.1); x.beginPath(); x.moveTo(px,py); x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l); x.stroke(); }
      if(i===0){ x.strokeStyle='rgba(255,255,255,.06)'; x.lineWidth=1.4; for(let a=-40;a<400;a+=14) for(let b=-10;b<620;b+=14){ x.beginPath(); x.moveTo(a,b); x.lineTo(a+6,b+4); x.moveTo(a+6,b); x.lineTo(a,b+4); x.stroke(); } }
      else if(i===1){ x.strokeStyle='rgba(255,43,214,.09)'; x.lineWidth=2; for(let b=40;b<600;b+=18){ x.beginPath(); x.moveTo(20+(b*7%50),b); x.lineTo(150+(b*13%160),b); x.stroke(); } }
      else if(i===2||i===6){ for(let k=0;k<5000;k++){ x.fillStyle=Math.random()<.5?'rgba(255,255,255,.06)':'rgba(0,0,0,.14)'; x.fillRect(rnd(0,360),rnd(0,600),1.3,1.3); }
        if(i===6){ x.strokeStyle='rgba(0,0,0,.28)'; x.lineWidth=11; [[112,140,120,540],[232,140,224,540]].forEach(q=>{ x.beginPath(); x.moveTo(q[0],q[1]); x.lineTo(q[2],q[3]); x.stroke(); }); for(let a=0;a<360;a+=18){ x.fillStyle=((a/18)%2)?'#fff':'#111'; x.globalAlpha=.18; x.fillRect(a,18,18,9); x.fillStyle=((a/18)%2)?'#111':'#fff'; x.fillRect(a,27,18,9); } x.globalAlpha=1; } }
      else if(i===3){ for(let k=0;k<14;k++){ const px=rnd(10,350), py=rnd(40,540), r=rnd(18,58), gg=x.createRadialGradient(px,py,2,px,py,r); gg.addColorStop(0,'rgba(150,70,20,.26)'); gg.addColorStop(1,'rgba(150,70,20,0)'); x.fillStyle=gg; x.beginPath(); x.arc(px,py,r,0,7); x.fill(); } x.strokeStyle='rgba(255,255,255,.08)'; x.lineWidth=.8; for(let k=0;k<30;k++){ const px=rnd(0,340), py=rnd(0,580); x.beginPath(); x.moveTo(px,py); x.lineTo(px+rnd(30,90),py+rnd(-5,5)); x.stroke(); } }
      else if(i===4){ x.strokeStyle='rgba(0,229,255,.14)'; x.lineWidth=1; for(let a=0;a<=360;a+=60){ x.beginPath(); x.moveTo(a,0); x.lineTo(a,600); x.stroke(); } for(let b=0;b<=600;b+=75){ x.beginPath(); x.moveTo(0,b); x.lineTo(360,b); x.stroke(); } x.fillStyle='rgba(255,255,255,.16)'; for(let a=0;a<=360;a+=60) for(let b=0;b<=600;b+=75){ x.beginPath(); x.arc(a+4,b+4,1.5,0,7); x.fill(); } }
      else if(i===5){ [['rgba(140,90,255,.32)',100,150,150],['rgba(40,120,255,.26)',260,300,170],['rgba(255,80,200,.22)',150,480,150]].forEach(q=>{ const gg=x.createRadialGradient(q[1],q[2],5,q[1],q[2],q[3]); gg.addColorStop(0,q[0]); gg.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gg; x.beginPath(); x.arc(q[1],q[2],q[3],0,7); x.fill(); }); }
      else if(i===7){ x.strokeStyle='rgba(74,168,255,.18)'; x.lineWidth=1.2; for(let k=0;k<26;k++){ const px=rnd(10,350), py=rnd(20,580); x.beginPath(); x.moveTo(px,py); x.lineTo(px+rnd(-40,40),py); x.lineTo(px+rnd(-40,40),py+rnd(-40,40)); x.stroke(); x.fillStyle='rgba(74,168,255,.5)'; x.beginPath(); x.arc(px,py,2,0,7); x.fill(); } }
      else if(i===8){ x.fillStyle='rgba(70,8,40,.5)'; x.fillRect(0,0,360,600); x.strokeStyle='rgba(227,185,77,.24)'; x.lineWidth=1.8; for(let k=-600;k<=600;k+=44){ x.beginPath(); x.moveTo(k,0); x.lineTo(k+600,600); x.moveTo(k+600,0); x.lineTo(k,600); x.stroke(); }
        x.fillStyle='rgba(227,185,77,.22)'; for(let a=0;a<=360;a+=44) for(let b=0;b<=600;b+=44){ x.beginPath(); x.moveTo(a,b-5); x.lineTo(a+5,b); x.lineTo(a,b+5); x.lineTo(a-5,b); x.closePath(); x.fill(); }
        x.strokeStyle='rgba(227,185,77,.4)'; x.lineWidth=3; x.strokeRect(26,22,308,470); x.lineWidth=1; x.strokeRect(32,28,296,458); } }
    x.restore();
    x.font='900 54px system-ui,sans-serif'; x.textAlign='center'; x.fillStyle=T.bg; x.globalAlpha=.12; x.fillText(T.ic+' '+T.n.split(' ')[0],180,440); x.fillText(T.n.split(' ').slice(1).join(' ')||'',180,494); x.globalAlpha=1;
    /* flèches de sortie et couloirs du haut */
    x.fillStyle=TH.b; x.globalAlpha=.5; [[132,36],[180,26],[228,36]].forEach(p=>{ x.beginPath(); x.moveTo(p[0],p[1]-8); x.lineTo(p[0]+8,p[1]+4); x.lineTo(p[0]-8,p[1]+4); x.closePath(); x.fill(); }); x.globalAlpha=1;
    /* inserts lumineux autour des bumpers, du garage et du trou */
    S3.bumps.forEach((b,k)=>{ const col=TH.c[k%TH.c.length], gr=x.createRadialGradient(b.x,b.y,b.r*.6,b.x,b.y,b.r+22); gr.addColorStop(0,mixc(col,'#000000',.2).replace('rgb','rgba').replace(')',',.55)')); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.beginPath(); x.arc(b.x,b.y,b.r+22,0,7); x.fill(); x.strokeStyle=col; x.lineWidth=2.5; x.globalAlpha=.55; x.beginPath(); x.arc(b.x,b.y,b.r+8,0,7); x.stroke(); x.globalAlpha=1; });
    S3.saucs.forEach(s=>{ if(!s.on) return; x.fillStyle='#000'; x.beginPath(); x.arc(s.x,s.y,s.r+3,0,7); x.fill(); x.fillStyle='#00e5ff'; x.font='700 8px system-ui'; x.fillText(s.tower?'ROLLS':'GARAGE',s.x,s.y+25); x.strokeStyle='rgba(0,229,255,.5)'; x.lineWidth=2; x.beginPath(); x.arc(s.x,s.y,s.r+10,0,7); x.stroke(); });
    { const h=S3.hole; x.fillStyle='#000'; x.beginPath(); x.arc(h.x,h.y,h.r+2,0,7); x.fill(); }
    S3.lanes.forEach(l=>{ x.strokeStyle='rgba(255,212,0,.45)'; x.lineWidth=2; x.beginPath(); x.arc(l.x,l.y,9.5,0,7); x.stroke(); });
    S3.tgt.forEach(q=>{ x.fillStyle='rgba(0,0,0,.35)'; x.beginPath(); x.arc(q.x+2,q.y+4,q.r+3,0,7); x.fill(); });
    /* lueur néon des rails et des rampes, qui bave sur le plateau */
    x.lineCap='round'; x.shadowBlur=16; x.shadowColor=TH.a; x.strokeStyle=TH.a; x.globalAlpha=.55; x.lineWidth=2.5; S3.segs.forEach(s=>{ if(s.door||s.mill||s.dr||s.k) return; x.beginPath(); x.moveTo(s.x1,s.y1); x.lineTo(s.x2,s.y2); x.stroke(); });
    if(!PLAN) S3.ramps.forEach(r=>{ x.shadowColor=r.col; x.strokeStyle=r.col; x.globalAlpha=.35; x.lineWidth=14; x.beginPath(); r.p.forEach((q,k)=>{ k?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]); }); x.stroke(); }); x.shadowBlur=0; x.globalAlpha=1;
    x.restore();
    /* ombres portées des rails et des rampes, puis le fond du tiroir (la bille tombe dans le trou noir en bas) */
    x.save(); polyIn(x); x.clip(); x.lineCap='round';
    S3.segs.forEach(s=>{ if(s.door||s.mill) return; x.strokeStyle='rgba(0,0,0,.30)'; x.lineWidth=9; x.beginPath(); x.moveTo(s.x1+5,s.y1+9); x.lineTo(s.x2+5,s.y2+9); x.stroke(); x.strokeStyle='rgba(0,0,0,.35)'; x.lineWidth=5; x.beginPath(); x.moveTo(s.x1+3,s.y1+5); x.lineTo(s.x2+3,s.y2+5); x.stroke(); });
    if(!PLAN) S3.ramps.forEach(r=>{ x.strokeStyle='rgba(0,0,0,.34)'; x.lineWidth=22; x.beginPath(); r.p.forEach((q,k)=>{ k?x.lineTo(q[0]+9,q[1]+16):x.moveTo(q[0]+9,q[1]+16); }); x.stroke(); });
    x.restore();
    const vg=x.createLinearGradient(0,540,0,600); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.95)'); x.fillStyle=vg; x.fillRect(98,540,124,62);
    const gl=x.createLinearGradient(0,0,360,600); gl.addColorStop(0,'rgba(255,255,255,.07)'); gl.addColorStop(.25,'rgba(255,255,255,0)'); gl.addColorStop(.7,'rgba(255,255,255,.03)'); gl.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gl; x.fillRect(-30,-30,420,660);
    return c; }
  /* ---------- groupes : permanent / par table ---------- */
  const perm=new T3.Group(), tbl=new T3.Group(); sc.add(perm,tbl);
  const dyn={ bump:[], tgt:[], lane:[], well:[], boost:[], portal:[], spin:[], seg:[], ramp:[], mill:[] }; let sauc3=[], hole3=null, towerLamps=[], towerCar=null;
  /* cabinet : sol quadrillé néon, flancs hauts, bac arrière lumineux, tablier avec la porte à pièces */
  let backMat=null; const cab=[]; let roof=null, roofTop=null;
  { sc.fog=new T3.Fog(0x05030b,1200,3000);
    perm.add(flat(new T3.PlaneGeometry(3200,3200),std(0xffffff,.25,.7,{map:tileTex,emissive:0xffffff,emissiveMap:tileTex,emissiveIntensity:.55}),-1.2));
    const box=(w,h,d,x,y,z,mat)=>{ const m=new T3.Mesh(new T3.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); perm.add(m); cab.push(m); return m; };
    const wallM=std(0x1a1238,.8,.45,{map:brushTex,envMapIntensity:.3}), darkM=std(0x0b0720,.6,.6);
    [-1,1].forEach(s=>{ box(46,40,700,s*209,19,Z(305),wallM); box(2.4,1.6,700,s*186.5,40.4,Z(305),basic(TH.a)); box(1.6,26,700,s*186,24,Z(305),basic(TH.a,{transparent:true,opacity:.18})); });
    backMat=basic(0xffffff,{map:null});
    box(382,172,24,0,100,Z(-30),[darkM,darkM,darkM,darkM,backMat,darkM]); box(382,1.6,2,0,186.8,Z(-18),basic(TH.b)); box(382,14,24,0,7,Z(-30),darkM); box(382,1.6,2,0,14.8,Z(-18),basic(TH.a));
    roof=box(382,100,24,0,236,Z(-30),std(0x120a2a,.5,.6)); roofTop=box(382,1.6,2,0,287,Z(-18),basic(TH.b)); roof.visible=roofTop.visible=false; }
  /* face du bac arrière = l'écran à matrice de points (new73), mis à jour environ 30 fois par seconde */
  const faceCv=document.createElement('canvas'); faceCv.width=1024; faceCv.height=463; const fg=faceCv.getContext('2d'), bez=document.createElement('canvas'); bez.width=1024; bez.height=463;
  const paintBez=()=>{ const T=S3.T, b=bez.getContext('2d'), gr=b.createLinearGradient(0,0,0,463); gr.addColorStop(0,'#1a1036'); gr.addColorStop(1,'#07040f'); b.fillStyle=gr; b.fillRect(0,0,1024,463); b.strokeStyle=TH.a; b.lineWidth=6; b.globalAlpha=.9; b.strokeRect(8,8,1008,447); b.globalAlpha=1; b.strokeStyle=TH.b; b.lineWidth=2; b.strokeRect(20,20,984,423);
    const rg=b.createRadialGradient(512,80,10,512,80,460); rg.addColorStop(0,mixc(T.bg,'#000000',.2).replace('rgb','rgba').replace(')',',.5)')); rg.addColorStop(1,'rgba(0,0,0,0)'); b.fillStyle=rg; b.fillRect(24,24,976,134);
    b.textAlign='center'; b.shadowColor=T.bg; b.shadowBlur=24; b.fillStyle='#fff'; b.font='900 74px system-ui,sans-serif'; b.fillText(T.ic+' '+T.n,512,104); b.shadowBlur=0; b.fillStyle=TH.b; b.font='700 26px system-ui'; b.fillText('HIGH & ROUILLÉ · PINBALL',512,142);
    b.fillStyle='#000'; b.fillRect(30,160,964,232); };
  const dmdTex=new T3.CanvasTexture(faceCv); dmdTex.encoding=T3.sRGBEncoding; dmdTex.anisotropy=4; own.push(dmdTex);
  const dmd=dmdMake(S3); let dmdIntro=false, dmdAcc=0, dmdPrev=0, dmdFirst=true;
  const paintBack=()=>{ paintBez(); backMat.map=dmdTex; backMat.needsUpdate=true; if(!dmdIntro){ dmdIntro=true; dmd.event('TABLE : '+S3.T.n); } };
  const dmdTick=()=>{ const now=performance.now(), dt=dmdPrev?Math.min(.1,(now-dmdPrev)/1000):0; dmdPrev=now; dmdAcc+=dt; if(!dmdFirst&&dmdAcc<1/30) return; dmdFirst=false; dmd.frame(dmdAcc,S3.hud); dmdAcc=0; fg.drawImage(bez,0,0); fg.drawImage(dmd.canvas,32,164,960,224); dmdTex.needsUpdate=true; };  /* flippers */
  const flipMeshes=[]; { const L=56; const gG=()=>{ const s=new T3.Shape(), r0=7.2, r1=4.4; s.moveTo(0,-r0); s.lineTo(L,-r1); s.absarc(L,0,r1,-PI/2,PI/2,false); s.lineTo(0,r0); s.absarc(0,0,r0,PI/2,PI*1.5,false);
      const g=new T3.ExtrudeGeometry(s,{depth:6,bevelEnabled:true,bevelThickness:1.6,bevelSize:1.3,bevelSegments:2,curveSegments:12}); g.rotateX(-PI/2); const p=g.attributes.position, cols=new Float32Array(p.count*3), a=new T3.Color(0xff2d2d), b=new T3.Color(0xffd400), c=new T3.Color(0x1fe06a), q=new T3.Color();
      for(let i=0;i<p.count;i++){ const u=Math.max(0,Math.min(1,p.getX(i)/L)); if(u<.5) q.copy(a).lerp(b,u*2); else q.copy(b).lerp(c,(u-.5)*2); cols[i*3]=q.r; cols[i*3+1]=q.g; cols[i*3+2]=q.b; } g.setAttribute('color',new T3.BufferAttribute(cols,3)); return g; };
    S3.FL.forEach(f=>{ const m=new T3.Mesh(gG(),std(0xffffff,.35,.34,{vertexColors:true,map:rubberTex,emissive:0x331100,emissiveIntensity:.2})); m.position.set(X(f.px),1.8,Z(f.py)); perm.add(m);
      const cap=new T3.Mesh(new T3.CylinderGeometry(4.2,4.6,3,18),std(0xe8ecff,1,.2)); cap.position.set(X(f.px),11,Z(f.py)); perm.add(cap); const sh=blob(40,.7); sh.position.set(X(f.px),.3,Z(f.py)); perm.add(sh); flipMeshes.push({m,f,sh}); }); }
  /* piston et couloir de lancement */
  const plunger=new T3.Group(); { const head=new T3.Mesh(new T3.CylinderGeometry(5.4,5.4,5,18),std(0xffd400,.6,.3)); head.position.y=3; plunger.add(head); const spring=new T3.Mesh(new T3.CylinderGeometry(2.6,2.6,1,10),std(0xbfc6ff,.9,.35)); spring.name='spring'; plunger.add(spring); const rod=new T3.Mesh(new T3.CylinderGeometry(1.4,1.4,30,8),std(0x8d92b8,.9,.4)); rod.position.y=1; rod.rotation.x=PI/2; rod.position.z=18; plunger.add(rod); perm.add(plunger); }
  /* billes (réserve), traînées, lumière */
  const ballPool=[]; const ballGeo=new T3.SphereGeometry(RB,28,18), ballMat=std(0xdfeaff,1,.1,{envMapIntensity:1.6});
  const getBall=i=>{ if(!ballPool[i]){ const g=new T3.Group(), m=new T3.Mesh(ballGeo,ballMat), sh=blob(22,.8); sh.position.y=.35; g.add(m); g.userData={m,sh}; perm.add(g); ballPool[i]=g; } return ballPool[i]; };
  const trailPool=[]; const trailGeo=new T3.SphereGeometry(1,10,8); for(let i=0;i<48;i++){ const m=new T3.Mesh(trailGeo,basic(0x8fe9ff,{transparent:true,blending:T3.AdditiveBlending,depthWrite:false,opacity:.4})); m.visible=false; perm.add(m); trailPool.push(m); }
  /* pièce de la chasse */
  /* Rolls-Royce stylisée (calandre chromée, double filet or, lampes) : exposée sur la tour, puis en liberté pendant la chasse. Avant du modèle = +x */
  let rollsBody=null;
  function mkRolls(){
    /* v2.15 : le vrai modèle 3D de la Rolls-Royce Phantom du jeu (Albion Majestic) quand il est chargé ; sinon la version en volumes ci-dessous */
    try{ if(typeof buildCar==='function'&&typeof M!=='undefined'&&M.majestic&&M.majestic.glb&&typeof MODELS!=='undefined'&&MODELS[M.majestic.glb]){
        const q=buildCar(M.majestic,'#E3B94D',{peinture:{r:4,t:'pe3'}}), inner=q.g||q, g=new T3.Group(); const bb=new T3.Box3().setFromObject(inner), sz=new T3.Vector3(); bb.getSize(sz);
        if(sz.z>sz.x) inner.rotation.y=PI/2; inner.scale.multiplyScalar(54/(Math.max(sz.x,sz.z)||1)); inner.updateMatrixWorld(true); const b2=new T3.Box3().setFromObject(inner); inner.position.y-=b2.min.y;
        g.add(inner); g.userData.glb=1; return g; } }catch(e){ console.warn('Rolls 3D',e); }
    const g=new T3.Group(), body=std(0xeee6cf,.75,.22,{envMapIntensity:1.2}), glass=std(0x2a3556,.5,.15), gold=std(0xe3b94d,1,.2,{emissive:0x4a3200,emissiveIntensity:.3}), chrome=std(0xdfe6ff,1,.12), tyre=std(0x0a0a10,.2,.8);
    if(!rollsBody) rollsBody=body;
    const bx=(w,h,d,x,y,z,m)=>{ const o=new T3.Mesh(new T3.BoxGeometry(w,h,d),m); o.position.set(x,y,z); g.add(o); return o; };
    bx(46,6,18,0,6.2,0,body); bx(17,5,17,-8,11.7,0,body); bx(15,4.4,15.4,-8,16,0,glass); bx(16,2.2,17.4,-8,18.6,0,body); bx(13,3.2,16.4,14,9.6,0,body);
    bx(1.8,9.4,10.4,23.6,8.6,0,chrome); for(let k=-4;k<=4;k+=2) bx(.5,8.4,.5,24.7,8.6,k,body);
    bx(42,.8,.5,0,8.6,9.15,gold); bx(42,.8,.5,0,8.6,-9.15,gold);
    [[15,9.9],[15,-9.9],[-14,9.9],[-14,-9.9]].forEach(w=>{ const t=new T3.Mesh(new T3.CylinderGeometry(4.4,4.4,3.2,18),tyre); t.rotation.x=PI/2; t.position.set(w[0],4.4,w[1]); g.add(t); const hb=new T3.Mesh(new T3.CylinderGeometry(2.3,2.3,3.5,12),chrome); hb.rotation.x=PI/2; hb.position.set(w[0],4.4,w[1]); g.add(hb); });
    [6,-6].forEach(z=>{ const l=new T3.Mesh(new T3.SphereGeometry(1.5,10,8),basic(0xfff6c8)); l.position.set(23.2,9.6,z); g.add(l); });
    const sp=new T3.Mesh(new T3.ConeGeometry(.9,3.2,8),gold); sp.rotation.z=-PI/2; sp.position.set(24.5,13.6,0); g.add(sp);
    return g; }
  function buildTower(g,s,gl){ gl.material.color.set(0xe3b94d); const gold=std(0xe3b94d,.95,.22,{emissive:0x5a3d00,emissiveIntensity:.35}), dark=std(0x1a1030,.6,.4);
    const base=new T3.Mesh(new T3.CylinderGeometry(s.r+5,s.r+7,6,28),dark); base.position.y=3; g.add(base);
    const col=new T3.Mesh(new T3.CylinderGeometry(s.r+2,s.r+4,24,28),gold); col.position.y=18; g.add(col);
    const ring=new T3.Mesh(new T3.TorusGeometry(s.r+3.5,1.6,8,30),basic(0xfff1b0)); ring.rotation.x=PI/2; ring.position.y=30.5; g.add(ring);
    const roof=new T3.Mesh(new T3.CylinderGeometry(s.r+6,s.r+3,3,28),gold); roof.position.y=32; g.add(roof);
    const door=new T3.Mesh(new T3.BoxGeometry(11,12,2),basic(0x05030b)); door.position.set(0,10,s.r+3.2); g.add(door); const fr=new T3.Mesh(new T3.BoxGeometry(13,1.6,2.4),basic(0xfff1b0)); fr.position.set(0,16.4,s.r+3.3); g.add(fr);
    for(let k=0;k<3;k++){ const lm=new T3.Mesh(new T3.SphereGeometry(2.1,12,8),basic(0x2a2a2a)); lm.position.set((k-1)*14,34,s.r+1); g.add(lm); towerLamps.push(lm); }
    towerCar=mkRolls(); towerCar.scale.setScalar(.72); towerCar.position.y=33.8; g.add(towerCar); }
  const coin=new T3.Group(); let faceKey='';
  const rolls=mkRolls(); rolls.visible=false; perm.add(rolls); { const gg=glow(0xe3b94d,70,1.5,.5); rolls.add(gg); } let rHead=0;
  { const side=std(0xffffff,.95,.25,{emissive:0xffffff,emissiveIntensity:.15}), face=std(0xffffff,.35,.35,{emissive:0xffffff,emissiveIntensity:.55}), back=std(0x20103a,.6,.5);
    const body=new T3.Mesh(new T3.CylinderGeometry(1,1,.2,40),[side,face,back]), rim=new T3.Mesh(new T3.TorusGeometry(1,.09,10,44),basic(0xffffff)); rim.rotation.x=PI/2; rim.position.y=.1; coin.add(body,rim); const g=glow(0xffffff,3.6,-.1,.8); coin.add(g); coin.userData={side,face,rim,g}; coin.visible=false; perm.add(coin); }
  const faceTex=(ic,col)=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'), g=x.createRadialGradient(64,64,6,64,64,64); g.addColorStop(0,'#ffffff'); g.addColorStop(.35,col); g.addColorStop(1,mixc(col,'#000000',.5)); x.fillStyle=g; x.beginPath(); x.arc(64,64,62,0,7); x.fill(); x.strokeStyle='rgba(255,255,255,.9)'; x.lineWidth=5; x.beginPath(); x.arc(64,64,54,0,7); x.stroke();
    x.font='64px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillStyle='#fff'; x.fillText(ic,64,70); const t=new T3.CanvasTexture(c); t.encoding=T3.sRGBEncoding; return t; };
  let coinHp=-1, coinRing=null;  /* ---------- construction d'une table ---------- */
  function clearTbl(){ for(const k in dyn) dyn[k].length=0; sauc3=[]; hole3=null; towerLamps=[]; towerCar=null; coinRing=null; coinHp=-1; while(tbl.children.length){ const c=tbl.children[0]; tbl.remove(c); disposeTree(c); } if(fieldTex){ fieldTex.dispose(); fieldTex=null; } }
  function rampH(u,hs){ u=Math.max(0,Math.min(1,u)); return .5+(hs||16.5)*Math.pow(Math.sin(PI*u),.7); }
  function strip(pairs,uvs,mat){ const n=pairs.length, p=new Float32Array(n*6), uv=new Float32Array(n*4), idx=[]; pairs.forEach((q,i)=>{ p.set(q,i*6); uv.set([0,uvs[i],1,uvs[i]],i*4); if(i<n-1){ const k=i*2; idx.push(k,k+1,k+2,k+1,k+3,k+2); } });
    const g=new T3.BufferGeometry(); g.setAttribute('position',new T3.BufferAttribute(p,3)); g.setAttribute('uv',new T3.BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return new T3.Mesh(g,mat); }
  const chevTex={}; const chevFor=col=>{ if(!chevTex[col]){ const c=document.createElement('canvas'); c.width=64; c.height=128; const x=c.getContext('2d'); x.fillStyle='#070a1c'; x.fillRect(0,0,64,128); x.strokeStyle=col; x.lineWidth=7; x.lineCap='round'; x.lineJoin='round'; x.globalAlpha=.9; [24,88].forEach(y=>{ x.beginPath(); x.moveTo(12,y+14); x.lineTo(32,y-6); x.lineTo(52,y+14); x.stroke(); });
      const t=new T3.CanvasTexture(c); t.wrapS=t.wrapT=T3.RepeatWrapping; t.encoding=T3.sRGBEncoding; own.push(t); chevTex[col]=t; } return chevTex[col]; };
  function buildRamp(r){ const P=r.p, n=P.length, W2=7.6, g=new T3.Group(); const mouth=new T3.Group();
    const pts=P.map((p,i)=>{ const a=P[Math.max(0,i-1)], b=P[Math.min(n-1,i+1)]; let tx=b[0]-a[0], tz=b[1]-a[1]; const l=Math.hypot(tx,tz)||1; tx/=l; tz/=l; const uu=r.cum[i]/r.len, fl=Math.max(0,1-r.cum[i]/70), fe=Math.max(0,1-(r.len-r.cum[i])/26); return {x:X(p[0]),z:Z(p[1]),nx:-tz,nz:tx,h:rampH(uu,r.hs),v:r.cum[i]/22,w:7.6*(1+.95*fl*fl)+fe*3.4}; });
    const tex=chevFor(r.col), fm=std(0xffffff,.35,.45,{map:tex,side:T3.DoubleSide,emissive:new T3.Color(r.col),emissiveIntensity:.12,emissiveMap:tex});
    g.add(strip(pts.map(q=>[q.x+q.nx*q.w,q.h,q.z+q.nz*q.w,q.x-q.nx*q.w,q.h,q.z-q.nz*q.w]),pts.map(q=>q.v),fm));
    const wallM=std(0x9aa0d8,.9,.3,{side:T3.DoubleSide}), neonM=basic(r.col,{side:T3.DoubleSide}), neons=[];
    [1,-1].forEach(s=>{ g.add(strip(pts.map(q=>[q.x+q.nx*q.w*s,q.h,q.z+q.nz*q.w*s,q.x+q.nx*q.w*s,q.h+3.4,q.z+q.nz*q.w*s]),pts.map(q=>q.v),wallM));
      const nm=strip(pts.map(q=>[q.x+q.nx*(q.w+.1)*s,q.h+3.4,q.z+q.nz*(q.w+.1)*s,q.x+q.nx*(q.w-1.5)*s,q.h+3.4,q.z+q.nz*(q.w-1.5)*s]),pts.map(q=>q.v),neonM); g.add(nm); neons.push(nm); });
    for(let i=4;i<n-3;i+=6){ const q=pts[i]; if(q.h<5) continue; const leg=new T3.Mesh(new T3.CylinderGeometry(1.1,1.5,q.h,8),std(0x2a2d52,.8,.4)); leg.position.set(q.x,q.h/2,q.z); g.add(leg); }
    const sh=strip(pts.map(q=>[q.x+q.nx*(q.w+2)+q.h*.5,.3,q.z+q.nz*(q.w+2)+q.h*.8,q.x-q.nx*(q.w+2)+q.h*.5,.3,q.z-q.nz*(q.w+2)+q.h*.8]),pts.map(q=>q.v),basic(0x000000,{transparent:true,opacity:.28,depthWrite:false,side:T3.DoubleSide})); g.add(sh);
    /* embouchure : anneau lumineux de la zone de capture, posé sur le plateau */ { const rm=flat(new T3.RingGeometry(r.mr-1.6,r.mr,40),basic(r.col,{transparent:true,opacity:.55,side:T3.DoubleSide,depthWrite:false}),.6); rm.position.set(X(r.mx),.6,Z(r.my)); g.add(rm); const gl=glow(r.col,r.mr*3.4,.55,.3); gl.position.set(X(r.mx),.55,Z(r.my)); g.add(gl); }
    /* flèche d'entrée posée sur le plateau */ { const sh2=new T3.Shape(); sh2.moveTo(0,-9); sh2.lineTo(8,6); sh2.lineTo(0,2); sh2.lineTo(-8,6); sh2.closePath(); const ag=new T3.Group(), am=flat(new T3.ShapeGeometry(sh2),basic(r.col,{transparent:true,opacity:.8,depthWrite:false}),.7); am.scale.set(1.5,1.5,1); ag.add(am); ag.rotation.y=-(Math.atan2(r.uy,r.ux)+PI/2); ag.position.set(X(r.mx),0,Z(r.my)); g.add(ag); }
    /* sortie : anneau + flèche posés sur le plateau, là où la bille est relancée */
    if(r.to!=='tower'){ const re=flat(new T3.RingGeometry(7,8.4,32),basic(r.col,{transparent:true,opacity:.4,side:T3.DoubleSide,depthWrite:false}),.6); re.position.set(X(r.ex),.6,Z(r.ey)); g.add(re);
      const sh3=new T3.Shape(); sh3.moveTo(0,-9); sh3.lineTo(7,5); sh3.lineTo(0,1); sh3.lineTo(-7,5); sh3.closePath(); const ag3=new T3.Group(), am3=flat(new T3.ShapeGeometry(sh3),basic(0xffffff,{transparent:true,opacity:.5,depthWrite:false}),.7); ag3.add(am3); ag3.rotation.y=-(Math.atan2(r.euy,r.eux)+PI/2); ag3.position.set(X(r.ex)+r.eux*15,0,Z(r.ey)+r.euy*15); g.add(ag3); }
    /* clapet : portique doré avec une plaque qui bascule, et la valeur du multiplicateur fixé */
    let gateM=null; if(r.flap){ const i0=Math.max(2,Math.min(n-3,Math.round((n-1)*r.fu))), q=pts[i0], gg=new T3.Group(), wq=q.w+.9; gateM=std(0xe3b94d,.9,.25,{emissive:0xe3b94d,emissiveIntensity:.3});
      [1,-1].forEach(sd=>{ const po=new T3.Mesh(new T3.CylinderGeometry(.9,.9,11,8),gateM); po.position.set(0,q.h+5.5,sd*wq); gg.add(po); });
      const bar=new T3.Mesh(new T3.BoxGeometry(2,1.8,wq*2),gateM); bar.position.y=q.h+11; gg.add(bar);
      const pl=new T3.Mesh(new T3.BoxGeometry(.6,6.5,(wq-.6)*2),basic(0xffe9a0,{transparent:true,opacity:.5,depthWrite:false})); pl.position.set(.8,q.h+7.2,0); pl.rotation.z=-.32; gg.add(pl);
      const tc=document.createElement('canvas'); tc.width=tc.height=128; const tx=tc.getContext('2d'); tx.fillStyle='rgba(20,10,0,.78)'; tx.beginPath(); tx.arc(64,64,58,0,7); tx.fill(); tx.strokeStyle='#e3b94d'; tx.lineWidth=7; tx.stroke(); tx.fillStyle='#fff'; tx.font='900 70px system-ui,sans-serif'; tx.textAlign='center'; tx.textBaseline='middle'; tx.fillText('×'+r.flap,64,70);
      const tt=new T3.CanvasTexture(tc); tt.encoding=T3.sRGBEncoding; own.push(tt); const spr=new T3.Sprite(new T3.SpriteMaterial({map:tt,transparent:true,depthWrite:false})); spr.scale.set(14,14,1); spr.position.set(0,q.h+20,0); gg.add(spr);
      gg.position.set(q.x,0,q.z); gg.rotation.y=Math.atan2(q.nx,q.nz); g.add(gg); }
    tbl.add(g); dyn.ramp.push({r,g,fm,neons,tex,neonM,gateM}); }
  const mkBump=(b,k)=>{ const g=new T3.Group(), r=b.r;
    const base=new T3.Mesh(new T3.CylinderGeometry(r+2.4,r+3.4,3.4,30),std(0x2c2c48,.9,.35)); base.position.y=1.7; g.add(base);
    const skirt=new T3.Mesh(new T3.CylinderGeometry(r*.8,r*.96,9,30),std(0x120626,.5,.45)); skirt.position.y=7.8; g.add(skirt);
    const ringM=basic(0xffffff), ring=new T3.Mesh(new T3.TorusGeometry(r*.94,1.3,8,36),ringM); ring.rotation.x=PI/2; ring.position.y=11.5; g.add(ring);
    const capM=std(0xffffff,.25,.22,{emissive:0xffffff,emissiveIntensity:.3}), cap=new T3.Mesh(new T3.SphereGeometry(r*.76,28,14,0,PI*2,0,PI/2),capM); cap.position.y=11.5; cap.scale.y=.8; g.add(cap);
    const gl=glow(0xffffff,r*7,.9,.6); g.add(gl); const sh=blob(r*3.2,.75); sh.position.set(r*.35,.3,r*.6); g.add(sh);
    tbl.add(g); dyn.bump.push({g,b,k,capM,ringM,cap,gl}); };
  function setTable(){ clearTbl();
    const T=S3.T; fieldTex=new T3.CanvasTexture(paintField()); fieldTex.encoding=T3.sRGBEncoding; fieldTex.anisotropy=4;
    const fm=std(0xffffff,.1,.5,{map:fieldTex,envMapIntensity:.3,emissive:0xffffff,emissiveMap:fieldTex,emissiveIntensity:.5}); const f=flat(new T3.PlaneGeometry(420,660),fm,0); f.position.set(0,0,0); tbl.add(f); fieldMesh=f;
    /* rails : tout ce qui est fixe est fusionné en deux maillages (acier + liseré néon) */
    const body=[], strips=[], H=15, TK=4.6;
    S3.segs.forEach(s=>{ if(s.door||s.mill||s.dr||s.k) return; const dx=s.x2-s.x1, dy=s.y2-s.y1, L=Math.hypot(dx,dy); if(L<.5) return; const a=Math.atan2(dy,dx), cx=(s.x1+s.x2)/2, cy=(s.y1+s.y2)/2;
      body.push(place(new T3.BoxGeometry(L,H,TK).toNonIndexed(),X(cx),H/2,Z(cy),-a)); strips.push(place(new T3.BoxGeometry(L,1.3,TK*.5).toNonIndexed(),X(cx),H+.65,Z(cy),-a));
      [[s.x1,s.y1],[s.x2,s.y2]].forEach(e=>{ body.push(place(new T3.CylinderGeometry(TK/2,TK/2,H,8).toNonIndexed(),X(e[0]),H/2,Z(e[1]))); }); });
    if(body.length){ const bm=new T3.Mesh(mergeG(body),std(0x9aa2d8,.95,.3,{map:brushTex})); tbl.add(bm); const sm=new T3.Mesh(mergeG(strips),basic(TH.a)); tbl.add(sm); }
    S3.bumps.forEach(mkBump);
    S3.posts.forEach(p=>{ const g=new T3.Group(), m=new T3.Mesh(new T3.CylinderGeometry(p.r*.9,p.r,9,16),std(0xdde3ff,1,.18)); m.position.y=4.5; const d=new T3.Mesh(new T3.SphereGeometry(p.r*.9,14,8,0,PI*2,0,PI/2),std(0xffffff,1,.15)); d.position.y=9; const sh=blob(p.r*5,.7); sh.position.set(2,.3,3); g.add(m,d,sh); g.position.set(X(p.x),0,Z(p.y)); tbl.add(g); });
    S3.tgt.forEach(q=>{ const g=new T3.Group(), mt=std(0x1a3a2c,.3,.4,{emissive:0x3cff9e,emissiveIntensity:0}), m=new T3.Mesh(new T3.CylinderGeometry(q.r,q.r+1,9,22),mt); m.position.y=4.5; const rg=new T3.Mesh(new T3.TorusGeometry(q.r,1,8,24),basic(0x3cff9e)); rg.rotation.x=PI/2; rg.position.y=9.2; const gl=glow(0x3cff9e,q.r*4,.8,0); const sh=blob(q.r*3,.7); sh.position.set(2,.3,3); g.add(m,rg,gl,sh); g.position.set(X(q.x),0,Z(q.y)); tbl.add(g); dyn.tgt.push({q,mt,gl}); });
    S3.lanes.forEach(l=>{ const mt=basic(0x3a3210), m=flat(new T3.CircleGeometry(6,20),mt,.45); m.position.x=X(l.x); m.position.z=Z(l.y); const gl=glow(0xffd400,26,.8,0); gl.position.x=m.position.x; gl.position.z=m.position.z; tbl.add(m,gl); dyn.lane.push({l,mt,gl}); });
    S3.saucs.forEach(s=>{ if(!s.on) return; const g=new T3.Group(), rim=new T3.Mesh(new T3.TorusGeometry(s.r+2.5,2.2,10,32),std(0xcfd6ff,1,.2)); rim.rotation.x=PI/2; rim.position.y=1.6; const gl=glow(0x00e5ff,s.r*5,.9,.35); g.add(rim,gl); if(s.tower) buildTower(g,s,gl); g.position.set(X(s.x),0,Z(s.y)); tbl.add(g); sauc3.push({g,gl,s}); });
    { const h=S3.hole, g=new T3.Group(), rm=basic(0x00e5ff), rim=new T3.Mesh(new T3.TorusGeometry(h.r+1,1.8,10,36),rm); rim.rotation.x=PI/2; rim.position.y=1.4; g.add(rim); const rings=[]; for(let k=0;k<3;k++){ const m=basic(0x00e5ff,{transparent:true,opacity:.8}), rg=new T3.Mesh(new T3.RingGeometry(4+k*3.5,5.3+k*3.5,28,1,0,3.6),m); rg.rotation.x=-PI/2; rg.position.y=.7; g.add(rg); rings.push(rg); } const gl=glow(0x00e5ff,h.r*5,.8,.5); g.add(gl); g.position.set(X(h.x),0,Z(h.y)); tbl.add(g); hole3={g,rm,rings,gl}; }
    S3.wells.forEach(w=>{ const g=new T3.Group(), gl=glow(0x8f6bff,w.r*2,.7,.55); g.add(gl); const rs=[]; for(let k=0;k<3;k++){ const m=flat(new T3.RingGeometry(10+k*13,11.6+k*13,36,1,0,3.2),basic(0xc8aaff,{transparent:true,opacity:.75,side:T3.DoubleSide,depthWrite:false}),.8); g.add(m); rs.push(m); } g.position.set(X(w.x),0,Z(w.y)); tbl.add(g); dyn.well.push({w,rs}); });
    S3.boosts.forEach(q=>{ const g=new T3.Group(), sh=new T3.Shape(); sh.moveTo(-10,5); sh.lineTo(0,-5); sh.lineTo(10,5); sh.lineTo(10,9); sh.lineTo(0,-1); sh.lineTo(-10,9); sh.closePath(); const ms=[]; for(let k=0;k<3;k++){ const mt=basic(0x3cff9e,{transparent:true,opacity:.5,depthWrite:false}), m=flat(new T3.ShapeGeometry(sh),mt,.6); m.position.z=-k*9+9; g.add(m); ms.push(mt); } const gl=glow(0x3cff9e,40,.6,.3); g.add(gl); g.rotation.y=-(Math.atan2(q.dy,q.dx)+PI/2); g.position.set(X(q.x),0,Z(q.y)); tbl.add(g); dyn.boost.push({q,ms,gl}); });
    S3.portals.forEach(p=>{ const c=p.k?0xff9a1a:0x4aa8ff, g=new T3.Group(), rg=new T3.Mesh(new T3.TorusGeometry(p.r,1.6,10,34),basic(c)); rg.rotation.x=PI/2; rg.position.y=1.4; const di=flat(new T3.CircleGeometry(p.r-2,28),basic(c,{transparent:true,opacity:.28,depthWrite:false}),.6); const orb=new T3.Group(); for(let k=0;k<6;k++){ const o=new T3.Mesh(new T3.SphereGeometry(1.7,8,6),basic(0xffffff)); o.position.set(Math.cos(k*1.047)*p.r,2.4,Math.sin(k*1.047)*p.r); orb.add(o); } const gl=glow(c,p.r*4.2,.8,.55); g.add(rg,di,orb,gl); g.position.set(X(p.x),0,Z(p.y)); tbl.add(g); dyn.portal.push({p,orb}); });
    S3.spins.forEach(s=>{ const g=new T3.Group(), pl=new T3.Mesh(new T3.BoxGeometry(s.r*2,.9,8),std(0xffd400,.7,.3,{emissive:0x664400,emissiveIntensity:.5})); pl.position.y=8; g.add(pl); [-1,1].forEach(k=>{ const po=new T3.Mesh(new T3.CylinderGeometry(1.3,1.3,10,8),std(0xdde3ff,1,.2)); po.position.set(k*s.r,5,0); po.rotation.z=0; g.add(po); }); const sh=blob(s.r*2.4,.55); sh.position.y=.35; g.add(sh); g.position.set(X(s.x),0,Z(s.y)); tbl.add(g); dyn.spin.push({s,pl}); });
    S3.mills.forEach(m=>{ const g=new T3.Group(), rod=new T3.Mesh(new T3.CylinderGeometry(2.6,2.6,m.L*2,12),std(0xff9a1a,.7,.3,{emissive:0x552200,emissiveIntensity:.5})); rod.rotation.z=PI/2; g.add(rod); const hub=new T3.Mesh(new T3.CylinderGeometry(5,5.5,9,16),std(0xeef0ff,1,.2)); hub.position.y=0; g.add(hub); g.position.set(X(m.x),6,Z(m.y)); tbl.add(g); dyn.mill.push({m,g,rod}); });
    S3.segs.forEach(s=>{ if(!(s.k||s.door||s.dr)) return; const dx=s.x2-s.x1, dy=s.y2-s.y1, L=Math.hypot(dx,dy), col=s.k?TH.b:s.door?0xff2d2d:0xff9a1a, h=s.k?8:s.dr?9:11; const mt=std(col,.25,.4,{emissive:new T3.Color(col),emissiveIntensity:.25}); const m=new T3.Mesh(new T3.BoxGeometry(L,h,s.k?5.5:4),mt); m.geometry.translate(0,h/2,0); m.position.set(X((s.x1+s.x2)/2),0,Z((s.y1+s.y2)/2)); m.rotation.y=-Math.atan2(dy,dx); const sh=blob(L*.5,.6); tbl.add(m); dyn.seg.push({s,m,mt,h}); });
    S3.ramps.forEach(buildRamp);
    paintBack(); if(PLAN) dyn.ramp.forEach(o=>{ o.g.visible=false; }); fitCam(); }
  function rollsUpd(p,t){ coin.visible=false; if(coinRing){ perm.remove(coinRing); coinRing.geometry.dispose(); coinRing=null; coinHp=-1; }
    rolls.visible=true; if(Math.hypot(p.vx,p.vy)>12){ const tg=-Math.atan2(p.vy,p.vx); let d=tg-rHead; while(d>PI) d-=2*PI; while(d<-PI) d+=2*PI; rHead+=d*.12; }
    rolls.position.set(X(p.x),1+Math.sin(t*5)*.5+(p.hit>0?1.5:0),Z(p.y)); rolls.rotation.y=rHead; rolls.rotation.z=Math.sin(t*7)*.02; rolls.scale.setScalar(1.15+p.hit*.08); if(rollsBody) rollsBody.emissive.set(p.hit>0?0xff2020:0x000000); }
  /* ---------- image par image ---------- */
  const tmpC=new T3.Color(); let jx=0, jz=0;
  function render(shake){ const t=S3.t, T=S3.T, tb=S3.turbo>0; dmdTick();
    { const now=performance.now(); if(tPrev){ const d=now-tPrev; if(d>45&&d<400) slow++; nF++; if(nF===90){ if(slow>55&&DPR>1.05){ DPR=1; ren.setPixelRatio(1); ren.setSize(Math.round(parseFloat(dom.style.width)),Math.round(parseFloat(dom.style.height)),false); } nF=0; slow=0; } } tPrev=now; }
    amb.color.set(tb?0xb05098:0x6a60a0); sun.intensity=.8; fill.intensity=.25+(tb?.35:0);
    dyn.bump.forEach(o=>{ const b=o.b, c=tb?TH.b:TH.c[o.k%TH.c.length]; o.g.position.set(X(b.x),0,Z(b.y)); tmpC.set(c); o.capM.color.copy(tmpC).multiplyScalar(.55); o.capM.emissive.copy(tmpC); o.capM.emissiveIntensity=.35+b.hit*1.6; o.ringM.color.set(c); o.cap.scale.y=.8+b.hit*.25; o.gl.material.color.set(c); o.gl.material.opacity=.3+b.hit*.6; });
    dyn.tgt.forEach(o=>{ o.mt.emissiveIntensity=o.q.on?1.1:0; o.mt.color.set(o.q.on?0x3cff9e:0x1a3a2c); o.gl.material.opacity=o.q.on?.7:0; });
    dyn.lane.forEach(o=>{ o.mt.color.set(o.l.on?0xffd400:0x3a3210); o.gl.material.opacity=o.l.on?.8:0; });
    sauc3.forEach(o=>{ o.gl.material.opacity=.3+o.s.glow*.7; });
    towerLamps.forEach((m,k)=>{ m.material.color.set(k<S3.tw?0x3cff9e:0x2a2a2a); }); if(towerCar){ towerCar.visible=!(S3.part.on&&S3.part.rolls); towerCar.rotation.y=t*.6; }
    if(hole3){ const o=S3.hole.open, c=o?0x00e5ff:0xff2d2d; hole3.rm.color.set(c); hole3.gl.material.color.set(c); hole3.gl.material.opacity=o?.5:.25; hole3.rings.forEach((r,k)=>{ r.material.color.set(c); r.rotation.z=S3.hole.sp+k*2; r.visible=o; }); }
    dyn.well.forEach(o=>o.rs.forEach((r,k)=>{ r.rotation.z=t*3+k; }));
    dyn.boost.forEach(o=>{ const ph=Math.floor(t*6)%3; o.ms.forEach((m,k)=>{ m.opacity=.25+.7*(ph===k?1:.25); m.color.set(o.q.glow>0?0xffffff:0x3cff9e); }); o.gl.material.opacity=.25+o.q.glow*.7; });
    dyn.portal.forEach(o=>{ o.orb.rotation.y=t*2.4*(o.p.k?-1:1); });
    dyn.spin.forEach(o=>{ o.pl.rotation.x=o.s.ang; });
    dyn.mill.forEach(o=>{ o.g.rotation.y=-(o.m.a||0); });
    dyn.seg.forEach(o=>{ const s=o.s; if(s.dr){ const tg=s.off?.12:1; o.m.scale.y+=(tg-o.m.scale.y)*.3; o.mt.emissiveIntensity=s.off?0:.35; }
      else if(s.door){ const tg=s.off?.15:1; o.m.scale.y+=(tg-o.m.scale.y)*.25; o.mt.color.set(s.off?0x3cff9e:0xff2d2d); o.mt.emissive.set(s.off?0x3cff9e:0xff2d2d); o.mt.emissiveIntensity=s.off?.15:.6; }
      else { o.mt.emissiveIntensity=.25+(s.hit||0)*1.4; } });
    dyn.ramp.forEach(o=>{ o.tex.offset.y=-(t*.9)%1; o.fm.emissiveIntensity=.12+o.r.glow*.9; if(o.gateM) o.gateM.emissiveIntensity=.3+(o.r.fg||0)*1.6; });
    flipMeshes.forEach(o=>{ const f=o.f; o.m.rotation.y=-Math.atan2(Math.sin(f.th),f.s*Math.cos(f.th)); o.m.material.emissiveIntensity=f.on?.9:.2; });
    { const pw=S3.power, pl=plunger; pl.position.set(X(333),2,Z(588+pw*20)); const sp=pl.getObjectByName('spring'); if(sp){ sp.scale.y=Math.max(.4,22+pw*0-pw*14); sp.position.z=14; sp.rotation.x=PI/2; } }
    /* billes */
    let bi=0, ti=0, lit=null; const bs=S3.balls;
    bs.forEach(b=>{ if(b.st==='hold'){ return; } const g=getBall(bi++); let y=RB+.6, sc2=1;
      if(b.st==='ramp'){ const r=S3.ramps[b.rp]; if(r) y=rampH(b.rs/r.len,r.hs)+RB+.9; }
      else if(b.st==='warp'){ sc2=Math.max(.1,b.wt/.9); y=RB*sc2; }
      g.visible=true; g.position.set(X(b.x),y,Z(b.y)); g.userData.m.scale.setScalar(sc2); g.userData.m.rotation.x=(b.x+b.y)*.05; g.userData.sh.position.y=-y+.35; g.userData.sh.scale.set(24,24,1);
      b.trail.forEach((p,i)=>{ const m=trailPool[ti++]; if(!m) return; const k=(i+1)/b.trail.length; m.visible=true; m.position.set(X(p[0]),b.st==='ramp'?y:RB,Z(p[1])); m.scale.setScalar(RB*.8*k); m.material.opacity=.38*k; });
      if(!lit||b.st==='play') lit=g; });
    for(let i=bi;i<ballPool.length;i++) if(ballPool[i]) ballPool[i].visible=false; for(let i=ti;i<trailPool.length;i++) trailPool[i].visible=false;
    if(lit){ ballL.position.set(lit.position.x,lit.position.y+22,lit.position.z); ballL.visible=true; } else ballL.visible=false;
    /* pièce de la chasse */
    { const p=S3.part; if(p.on&&p.rolls){ rollsUpd(p,t); } else if(p.on){ rolls.visible=false; const c=RAR[p.r_].c; coin.visible=true; const y=12+Math.sin(t*3)*2.4; coin.position.set(X(p.x),y,Z(p.y)); coin.scale.set(p.r,p.r*1.3,p.r); coin.rotation.y=t*.9; coin.rotation.x=Math.sin(t*1.7)*.08; coin.rotation.z=Math.cos(t*1.3)*.08; const u=coin.userData; u.side.color.set(c); u.side.emissive.set(c); u.face.emissiveIntensity=.5+p.hit*1.2; u.rim.material.color.set(c); u.g.material.color.set(c);
        { const key=p.ic+'|'+c; if(key!==faceKey){ faceKey=key; if(u.face.map) u.face.map.dispose(); const tx=faceTex(p.ic,c); u.face.map=tx; u.face.emissiveMap=tx; u.face.color.set(0xffffff); u.face.emissive.set(0xffffff); u.face.needsUpdate=true; } }
        
        if(coinHp!==p.hp){ coinHp=p.hp; if(coinRing){ perm.remove(coinRing); coinRing.geometry.dispose(); } coinRing=flat(new T3.RingGeometry(p.r+3.5,p.r+5.5,40,1,-PI/2,Math.max(.01,2*PI*p.hp/p.max)),basic(0xffffff,{transparent:true,opacity:.9,side:T3.DoubleSide,depthWrite:false}),1); perm.add(coinRing); }
        if(coinRing) coinRing.position.set(X(p.x),1,Z(p.y)); } else { rolls.visible=false; coin.visible=false; if(coinRing){ perm.remove(coinRing); coinRing.geometry.dispose(); coinRing=null; coinHp=-1; } } }
    /* caméra : légère secousse quand ça frappe, et un petit balancement quand la bille monte */
    const sh=shake||0; jx=(Math.random()-.5)*sh*5; jz=(Math.random()-.5)*sh*5; cam.position.x=jx; cam.position.z=CAMZ+Math.cos(pitch)*camD+jz; cam.position.y=Math.sin(pitch)*camD+(Math.random()-.5)*sh*3; cam.lookAt(jx*.3,0,CAMZ);
    ren.render(sc,cam); }
  /* ---------- taille et projection ---------- */
  let DPR=1, slow=0, nF=0, tPrev=0, CW=360, CH=600; function resize(w,h,dpr){ w=Math.max(8,Math.round(w)); h=Math.max(8,Math.round(h)); CW=w; CH=h; DPR=Math.min(dpr||1,LOWQ?1.1:1.75); ren.setPixelRatio(DPR); ren.setSize(w,h,false); dom.style.width=w+'px'; dom.style.height=h+'px'; ASP=w/h; if(tbl.children.length) fitCam(); }
  const pv=new T3.Vector3(), pv2=new T3.Vector3();
  /* point de la table (x,y,hauteur z) → coordonnées 360×600 de la surcouche 2D ; le 3e nombre = pixels par unité de table à cet endroit */
  function proj(x,y,z){ pv.set(X(x),z||0,Z(y)).project(cam); pv2.set(X(x)+10,z||0,Z(y)).project(cam); const a=(pv.x+1)/2*CW, b=(1-pv.y)/2*CH, a2=(pv2.x+1)/2*CW; return [a,b,Math.abs(a2-a)/10]; }
  function dispose(){ try{ disposeTree(perm); disposeTree(tbl); own.forEach(t=>t.dispose()); if(fieldTex) fieldTex.dispose(); ren.dispose(); try{ ren.forceContextLoss(); }catch(_){} dom.remove(); }catch(e){} }
  return {resize,setTable,render,proj,dispose,get cam(){ return cam; },get ok(){ return true; },get info(){ return ren.info; },get scene(){ return sc; },get plan(){ return PLAN; },
    setPlan(on){ PLAN=!!on; cab.forEach(m=>{ m.visible=!on; }); dyn.ramp.forEach(o=>{ o.g.visible=!on; }); if(sc.fog) sc.fog.far=on?1e6:3000; setTable(); },
    drawPlan(c,OW,OH){ const T=S3.T, p=(x,y)=>proj(x,y,0); c.save(); c.lineWidth=1; c.font='700 11px system-ui'; c.textAlign='center';
      for(let x=0;x<=360;x+=50){ const a=p(x,0), b=p(x,600); c.strokeStyle=x%100===0?'rgba(255,255,255,.55)':'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); c.fillStyle='#fff'; c.fillText(x,a[0],a[1]-4); }
      for(let y=0;y<=600;y+=50){ const a=p(0,y), b=p(360,y); c.strokeStyle=y%100===0?'rgba(255,255,255,.55)':'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); c.textAlign='left'; c.fillStyle='#fff'; c.fillText(y,a[0]+3,a[1]-3); c.textAlign='center'; }
      c.restore(); },dmdEvent:m=>dmd.event(m),dmdPts:p=>dmd.pts(p)};
}
