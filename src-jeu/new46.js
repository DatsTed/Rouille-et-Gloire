/* ---- v1.0 : nouveaux circuits générés (5 circuits + 3 circuits de drift) ---- */
const NTRK={
 c1:{nom:'Circuit des Docks',k:'c',pl:7,lim:12.5,p:[[0,0],[220,0],[300,20],[330,80],[300,140],[220,160],[160,150],[120,190],[130,260],[200,300],[260,350],[220,400],[100,400],[20,360],[-40,300],[-30,230],[-80,180],[-70,100],[-30,40]]},
 c2:{nom:'Boucle du Lac',k:'c',pl:7.5,lim:13,p:[[0,0],[250,-30],[420,10],[500,120],[470,260],[350,320],[250,260],[150,300],[40,340],[-90,290],[-130,170],[-90,60]]},
 c3:{nom:'Zone Industrielle',k:'c',pl:7,lim:12.5,p:[[0,0],[300,0],[340,60],[300,120],[200,120],[170,180],[230,240],[340,240],[390,300],[340,370],[120,370],[60,310],[100,250],[40,190],[-40,200],[-80,120],[-50,40]]},
 c4:{nom:'La Corniche',k:'c',pl:8,lim:14,p:[[0,0],[300,-60],[600,-40],[780,60],[820,200],[720,300],[560,260],[430,320],[300,420],[120,430],[-60,370],[-130,240],[-90,100]]},
 c5:{nom:'Grand Anneau Néon',k:'c',pl:8.5,lim:14.5,p:[[0,0],[400,0],[560,40],[640,140],[600,240],[480,280],[400,250],[330,300],[250,250],[160,270],[60,300],[-60,270],[-120,170],[-90,60]]},
 f1:{nom:'Drift : Parking Cargo',k:'d',pl:8,lim:15,p:[[0,0],[120,0],[180,30],[170,90],[100,110],[40,100],[30,160],[100,190],[180,180],[200,240],[130,280],[40,270],[-30,240],[-50,160],[-40,80]]},
 f2:{nom:'Drift : Spirale du Col',k:'d',pl:8,lim:15,p:[[0,0],[200,0],[260,50],[230,110],[120,120],[60,170],[100,230],[220,240],[290,300],[250,360],[120,370],[10,340],[-50,270],[-40,180],[-60,100]]},
 f3:{nom:'Drift : Arène Néon',k:'d',pl:9,lim:16,p:[[0,0],[180,-20],[300,30],[330,130],[270,210],[160,190],[110,250],[170,320],[290,350],[260,430],[130,450],[10,400],[-60,310],[-70,200],[-50,100]]}
};
const _wA=a=>{ a=(a+Math.PI)%(2*Math.PI); return (a<0?a+2*Math.PI:a)-Math.PI; };
function trkGen(spec){
  const P=spec.p, n0=P.length, dense=[];
  for(let i=0;i<n0;i++){ const p0=P[(i-1+n0)%n0], p1=P[i], p2=P[(i+1)%n0], p3=P[(i+2)%n0];
    for(let k=0;k<24;k++){ const t=k/24, t2=t*t, t3=t2*t; const f=(a,b,c,d)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3); dense.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]); } }
  const resample=(pts,N)=>{ const m=pts.length, cum=[0]; for(let i=0;i<m;i++){ const a=pts[i], b=pts[(i+1)%m]; cum.push(cum[i]+Math.hypot(b[0]-a[0],b[1]-a[1])); } const Lt=cum[m], out=[]; let j=0; for(let k=0;k<N;k++){ const s=k*Lt/N; while(cum[j+1]<s) j++; const a=pts[j%m], b=pts[(j+1)%m], u=(s-cum[j])/Math.max(1e-9,cum[j+1]-cum[j]); out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]); } return {out,Lt}; };
  let r=resample(dense,Math.max(60,Math.round(dense.length*3/3))); const Lt0=r.Lt; const N=Math.round(Lt0/3); r=resample(dense,N); let pts=r.out;
  for(let it=0;it<6;it++){ pts=pts.map((p,i)=>{ const a=pts[(i-1+N)%N], b=pts[(i+1)%N]; return [(a[0]+2*p[0]+b[0])/4,(a[1]+2*p[1]+b[1])/4]; }); }
  let L=0; for(let i=0;i<N;i++){ const a=pts[i], b=pts[(i+1)%N]; L+=Math.hypot(b[0]-a[0],b[1]-a[1]); } const DS=L/N;
  const cx=new Float32Array(N), cz=new Float32Array(N), cy=new Float32Array(N), th=new Float32Array(N), kap=new Float32Array(N), limL=new Float32Array(N), limR=new Float32Array(N), pl=new Float32Array(N), pr=new Float32Array(N), wallL=new Float32Array(N), wallR=new Float32Array(N);
  for(let i=0;i<N;i++){ cx[i]=pts[i][0]; cz[i]=pts[i][1]; }
  for(let i=0;i<N;i++){ const a=(i-1+N)%N, b=(i+1)%N; th[i]=Math.atan2(cz[b]-cz[a],cx[b]-cx[a]); }
  for(let i=0;i<N;i++){ const a=(i-2+N)%N, b=(i+2)%N; kap[i]=_wA(th[b]-th[a])/(4*DS); }
  for(let i=0;i<N;i++){ pl[i]=pr[i]=spec.pl; limL[i]=limR[i]=spec.lim; wallL[i]=wallR[i]=spec.lim; }
  /* grille de surfaces */
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(let i=0;i<N;i++){ x0=Math.min(x0,cx[i]); x1=Math.max(x1,cx[i]); z0=Math.min(z0,cz[i]); z1=Math.max(z1,cz[i]); }
  const X0=Math.floor(x0-90), Z0=Math.floor(z0-90), GW=Math.ceil(x1-X0+90), GH=Math.ceil(z1-Z0+90), grid=new Uint8Array(GW*GH);
  const nx=i=>Math.sin(th[i]), nz=i=>-Math.cos(th[i]), corner=i=>Math.abs(kap[i])>1/170;
  const paint=(code,fromF,toF)=>{ for(let i=0;i<N;i++){ const j=(i+1)%N; for(let sub=0;sub<3;sub++){ const u=sub/3, px=cx[i]+(cx[j]-cx[i])*u, pz=cz[i]+(cz[j]-cz[i])*u, ax=nx(i), az=nz(i); for(let sd=-1;sd<=1;sd+=2){ const a=fromF(i,sd), b=toF(i,sd); for(let o=a;o<=b;o+=.5){ const gx=Math.floor(px+ax*sd*o-X0), gz=Math.floor(pz+az*sd*o-Z0); if(gx>=0&&gz>=0&&gx<GW&&gz<GH) grid[gz*GW+gx]=code; } } } } };
  const lim=(i,sd)=>sd>0?limL[i]:limR[i], pw=(i,sd)=>sd>0?pl[i]:pr[i];
  paint(2,()=>0,(i,sd)=>lim(i,sd)+.4);
  paint(5,(i,sd)=>pw(i,sd)+1.2,(i,sd)=>{ const outer=(kap[i]>0)===(sd>0); return pw(i,sd)+1.2+(corner(i)&&outer?Math.min(3.8,lim(i,sd)-pw(i,sd)-1.4):-1); });
  paint(8,(i,sd)=>pw(i,sd),(i,sd)=>pw(i,sd)+(corner(i)?1.2:-1));
  paint(7,()=>0,(i,sd)=>pw(i,sd));
  /* maillage */
  const tile=256, TX0=Math.floor((x0-120)/tile)*tile, TZ0=Math.floor((z0-120)/tile)*tile, bins={};
  const bin=(g,x,z)=>{ const tx=Math.floor((x-TX0)/tile), tz=Math.floor((z-TZ0)/tile), k=g+'|'+tx+'|'+tz; return bins[k]||(bins[k]={g,t:[tx,tz],pos:[],idx:[],col:[],uv:[]}); };
  const quad=(g,A,B,C,D,col,uv)=>{ const b=bin(g,(A[0]+C[0])/2,(A[2]+C[2])/2), v=b.pos.length/3; b.pos.push(...A,...B,...C,...D); b.idx.push(v,v+1,v+2,v,v+2,v+3); if(col) for(let k=0;k<4;k++) b.col.push(...col); if(uv) b.uv.push(...uv); };
  const pt=(i,sd,o,y)=>[cx[i]+nx(i)*sd*o,y,cz[i]+nz(i)*sd*o];
  for(let i=0;i<N;i++){ const j=(i+1)%N, lo=lim(i,1), ro=lim(i,-1);
    quad('grass',pt(i,1,lo,0),pt(j,1,limL[j],0),pt(j,-1,limR[j],0),pt(i,-1,ro,0),null,null);
    quad('asph',pt(i,1,pl[i],.02),pt(j,1,pl[j],.02),pt(j,-1,pr[j],.02),pt(i,-1,pr[i],.02),null,null);
    for(const sd of [1,-1]){ if(corner(i)&&corner(j)){ const a=pw(i,sd), b=pw(j,sd); quad('kerb',pt(i,sd,a,.04),pt(j,sd,b,.04),pt(j,sd,b+1.2,.04),pt(i,sd,a+1.2,.04),null,[i/2,0,(i+1)/2,0,(i+1)/2,1,i/2,1]); }
      quad('lines',pt(i,sd,pw(i,sd)-.7,.06),pt(j,sd,pw(j,sd)-.7,.06),pt(j,sd,pw(j,sd)-.35,.06),pt(i,sd,pw(i,sd)-.35,.06),null,null);
      const w0=lim(i,sd), w1=lim(j,sd), cc=sd>0?[0,229,255]:[255,43,214];
      quad('wall_solid',pt(i,sd,w0,0),pt(j,sd,w1,0),pt(j,sd,w1,1.1),pt(i,sd,w0,1.1),[42,47,102],null);
      quad('wall_energy',pt(i,sd,w0,1.1),pt(j,sd,w1,1.1),pt(j,sd,w1,2.4),pt(i,sd,w0,2.4),cc,null); }
    if(i%4<2) quad('lines',pt(i,1,.12,.06),pt(j,1,.12,.06),pt(j,-1,.12,.06),pt(i,-1,.12,.06),null,null); }
  const sx=Math.ceil((x1+120-TX0)/tile), sz=Math.ceil((z1+120-TZ0)/tile);
  for(let a=0;a<sx;a++) for(let b=0;b<sz;b++){ const k='terrain|'+a+'|'+b, X=TX0+a*tile, Z=TZ0+b*tile; bins[k]={g:'terrain',t:[a,b],pos:[X,-.12,Z,X+tile,-.12,Z,X+tile,-.12,Z+tile,X,-.12,Z+tile],idx:[0,1,2,0,2,3],col:[],uv:[]}; }
  /* immeubles néon et arbres hors piste */
  let seed=spec.p.length*977+3; const rn=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const far=(x,z,m)=>{ for(let i=0;i<N;i+=2){ if(Math.hypot(cx[i]-x,cz[i]-z)<m) return false; } return true; };
  const trees=[]; let nb=0, tries=0; while(nb<(spec.k==='c'?46:30)&&tries<900){ tries++; const x=x0-80+rn()*(x1-x0+160), z=z0-80+rn()*(z1-z0+160); if(!far(x,z,spec.lim+34)) continue; const w=10+rn()*16, d=10+rn()*16, h=12+rn()*40;
    const y0=0, v=[[x-w/2,y0,z-d/2],[x+w/2,y0,z-d/2],[x+w/2,y0,z+d/2],[x-w/2,y0,z+d/2],[x-w/2,h,z-d/2],[x+w/2,h,z-d/2],[x+w/2,h,z+d/2],[x-w/2,h,z+d/2]];
    [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].forEach(f=>quad('bldg',v[f[0]],v[f[1]],v[f[2]],v[f[3]],null,null)); nb++; }
  const tl={}; for(let k=0;k<70;k++){ const x=x0-60+rn()*(x1-x0+120), z=z0-60+rn()*(z1-z0+120); if(!far(x,z,spec.lim+8)) continue; const tx=Math.floor((x-TX0)/tile), tz=Math.floor((z-TZ0)/tile), kk=tx+'|'+tz; (tl[kk]=tl[kk]||{t:[tx,tz],a:[]}).a.push(x,0,z,5+rn()*5); }
  /* empaquetage binaire */
  const parts=[]; let off=0; const items=[]; const align=n=>{ off=(off+n-1)&~(n-1); };
  const put=(arr,Type)=>{ align(4); const o=off; items.push([o,new Type(arr)]); off+=arr.length*Type.BYTES_PER_ELEMENT; return o; };
  const F=Float32Array;
  const phys={}; ['cx','cz','cy','th','kap','limL','limR','pl','pr','wallL','wallR'].forEach(k=>{ const a={cx,cz,cy,th,kap,limL,limR,pl,pr,wallL,wallR}[k]; phys[k]=put(a,F); });
  const segs=new Float32Array([X0+1,Z0+1,X0+1.01,Z0+1]), styp=new Uint8Array([0]); phys.segs=put(segs,F); phys.nseg=1; align(4); phys.styp=off; items.push([off,styp]); off+=4;
  const nh=31, hrel=new Int16Array(N*nh); align(4); phys.hrel=off; items.push([off,hrel]); off+=hrel.byteLength;
  Object.values(bins).forEach(b=>{ const p={g:b.g,nv:b.pos.length/3,ni:b.idx.length,t:b.t,o:{}}; p.o.p=put(b.pos,F); if(b.pos.length/3>65000) throw new Error('part trop grande'); align(2); p.o.i=off; items.push([off,new Uint16Array(b.idx)]); off+=b.idx.length*2; if(b.col.length) p.o.c=(()=>{ const a=new Uint8Array(b.col); align(4); const o=off; items.push([o,a]); off+=a.length; return o; })(); if(b.uv.length) p.o.u=put(b.uv,F); parts.push(p); });
  const tmeta=Object.values(tl).map(q=>({t:q.t,n:q.a.length/4,o:put(q.a,F)}));
  const buf=new ArrayBuffer((off+7)&~7); items.forEach(([o,a])=>{ new Uint8Array(buf,o,a.byteLength).set(new Uint8Array(a.buffer,a.byteOffset,a.byteLength)); });
  const meta={N,DS,L,X0,Z0,CELL:1,GW,GH,dh0:-60,dhs:4,nh,phys,parts,trees:tmeta,tile,TX0,TZ0};
  return {meta,buf,N,DS,L,cx:new F(buf,phys.cx,N),cz:new F(buf,phys.cz,N),cy:new F(buf,phys.cy,N),th:new F(buf,phys.th,N),kap:new F(buf,phys.kap,N),limL:new F(buf,phys.limL,N),limR:new F(buf,phys.limR,N),pl:new F(buf,phys.pl,N),pr:new F(buf,phys.pr,N),wallL:new F(buf,phys.wallL,N),wallR:new F(buf,phys.wallR,N),nseg:1,segs:new F(buf,phys.segs,4),styp:new Uint8Array(buf,phys.styp,1),hrel:new Int16Array(buf,phys.hrel,N*nh),nh,dh0:-60,dhs:4,X0,Z0,GW,GH,grid};
}
/* branchement : les manches qui demandent un circuit « cX » / « fX » chargent leur tracé, sinon Spa */
let SPA0=null; const NTD={};
function trkUse(id){ try{ if(!SPA0&&TRK.ready) SPA0=Object.assign({},TRK); if(NTRK[id]){ const td=NTD[id]||(NTD[id]=trkGen(NTRK[id])); Object.assign(TRK,td); const st=SPA_STAGES.find(s=>s.id===id); if(st) st.b=td.L; TRK.cur=id; buildSegGrid(); return true; } if(SPA0&&TRK.cur){ Object.assign(TRK,SPA0); TRK.cur=null; buildSegGrid(); } }catch(e){ console.error('circuit',e); try{ if(SPA0){ Object.assign(TRK,SPA0); TRK.cur=null; buildSegGrid(); } }catch(_){} return false; } return false; }
Object.keys(NTRK).forEach(id=>{ if(!SPA_STAGES.some(s=>s.id===id)) SPA_STAGES.push({id,nom:NTRK[id].nom,a:0,b:2000}); });
const _ss46=startSpa; startSpa=function(i){ const mn=R&&R.ev&&R.ev.manches[i]; const id=mn&&mn.sp; const ok=trkUse(id); if(id&&NTRK[id]&&!ok){ mn.sp='s1'; trkUse('s1'); }
  try{ return _ss46.apply(this,arguments); }catch(e){ console.error('startSpa',e); if(mn&&NTRK[mn.sp]){ mn.sp='s1'; trkUse('s1'); return _ss46.apply(this,arguments); } throw e; } };
/* épreuves */
(()=>{ const add=[
 {id:'c1',nom:'Circuit des Docks',lvl:2,gain:1300,xp:55,di:2,opp:{t:[1,1],up:0,etat:[35,60]},manches:[{d:'circuit',m:'sec',sp:'c1'}]},
 {id:'c2',nom:'Boucle du Lac',lvl:4,gain:2800,xp:110,di:4,opp:{t:[1,2],up:1,etat:[55,85]},manches:[{d:'circuit',m:'sec',sp:'c2'},{d:'circuit',m:'pluie',sp:'c1'}]},
 {id:'c3',nom:'Zone Industrielle',lvl:6,gain:6500,xp:210,di:6,opp:{t:[2,3],up:1,etat:[70,100]},manches:[{d:'circuit',m:'pluie',sp:'c3'}]},
 {id:'c4',nom:'La Corniche',lvl:8,gain:13000,xp:340,di:8,opp:{t:[3,4],up:2,etat:[80,100]},manches:[{d:'circuit',m:'sec',sp:'c4'},{d:'circuit',m:'sec',sp:'c3'}]},
 {id:'c5',nom:'Grand Anneau Néon',lvl:10,gain:26000,xp:520,di:10,opp:{t:[4,5],up:2,etat:[90,100]},manches:[{d:'circuit',m:'sec',sp:'c5'},{d:'circuit',m:'pluie',sp:'c4'}]},
 {id:'f1',nom:'Drift : Parking Cargo',lvl:3,gain:1600,xp:65,di:3,opp:{t:[1,2],up:0,etat:[45,70]},manches:[{d:'drift',m:'sec',sp:'f1'}]},
 {id:'f2',nom:'Drift : Spirale du Col',lvl:7,gain:7500,xp:230,di:7,opp:{t:[3,4],up:2,etat:[80,100]},manches:[{d:'drift',m:'sec',sp:'f2'},{d:'drift',m:'pluie',sp:'f1'}]},
 {id:'f3',nom:'Drift : Arène Néon',lvl:11,gain:22000,xp:450,di:11,opp:{t:[5,6],up:3,etat:[95,100]},manches:[{d:'drift',m:'sec',sp:'f3'},{d:'drift',m:'sec',sp:'f2'}]}];
 add.forEach(e=>{ if(!EVENTS.some(x=>x.id===e.id)) EVENTS.push(e); }); })();
