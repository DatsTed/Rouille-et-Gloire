/* ---- mini-carte en direct (courses hors Spa) ---- */
function rmapInit(){
  const c=$('rmap'); if(!c||!RS||!RS.path||!RC||!RC.tk) return;
  const Pa=RS.path, tk=RC.tk, d=Math.min(2,window.devicePixelRatio||1), W=c.clientWidth||360;
  const vh=Math.min(window.innerHeight||800,(window.visualViewport&&window.visualViewport.height)||9999), H=Math.round(clamp(vh-c.getBoundingClientRect().top-18,84,170));
  c.style.height=H+'px';
  c.width=Math.round(W*d); c.height=Math.round(H*d);
  const a0=Math.max(0,Math.floor((Pa.PRE-18)/Pa.STEP)), a1=Math.min(Pa.n-1,Math.ceil((Pa.PRE+tk.L+28)/Pa.STEP));
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(let i=a0;i<=a1;i++){x0=Math.min(x0,Pa.px[i]);x1=Math.max(x1,Pa.px[i]);z0=Math.min(z0,Pa.pz[i]);z1=Math.max(z1,Pa.pz[i]);}
  const pad=26, w=Math.max(x1-x0,30), h=Math.max(z1-z0,30), k=Math.min((W-2*pad)/w,(H-2*pad)/h);
  const ox=(W-w*k)/2-x0*k, oz=(H-h*k)/2-z0*k, X=i=>Pa.px[i]*k+ox, Z=i=>Pa.pz[i]*k+oz;
  const bg=document.createElement('canvas'); bg.width=c.width; bg.height=c.height; const g=bg.getContext('2d'); g.scale(d,d);
  g.lineCap='round'; g.lineJoin='round';
  const stroke=(w2,col,filt)=>{g.lineWidth=w2; g.strokeStyle=col; g.beginPath(); let st=false;
    for(let i=a0;i<=a1;i++){const s=-Pa.PRE+i*Pa.STEP; if(filt&&!filt(s)){st=false; continue;} if(!st){g.moveTo(X(i),Z(i)); st=true;} else g.lineTo(X(i),Z(i));} g.stroke();};
  stroke(13,'#05040f'); stroke(9,'#1b1d45');
  g.shadowColor='#00E5FF'; g.shadowBlur=6; stroke(2,'#2a6fa0'); g.shadowBlur=0;
  tk.segs.filter(q=>q.t==='C').forEach(q=>stroke(4,'#FF2BD6',s=>s>=q.a&&s<=q.b));
  const bar=(s,col,txt)=>{const i=clamp(Math.round((s+Pa.PRE)/Pa.STEP),0,Pa.n-1), th=Pa.th[i], nx=Math.sin(th)*9, nz=-Math.cos(th)*9;
    g.strokeStyle=col; g.lineWidth=3; g.beginPath(); g.moveTo(X(i)-nx,Z(i)-nz); g.lineTo(X(i)+nx,Z(i)+nz); g.stroke();
    g.fillStyle=col; g.font='600 10px sans-serif'; g.textAlign='center'; g.fillText(txt,X(i),txt==='Départ'?Z(i)+22:Z(i)-14); };
  bar(0,'#3CFF9E','Départ'); bar(tk.L,'#FCEE0A','Arrivée');
  g.fillStyle='#8b90c8'; g.font='500 10px sans-serif'; g.textAlign='left'; g.fillText('Carte en direct',10,14);
  g.fillStyle='#00E5FF'; g.beginPath(); g.arc(W-84,H-12,4,0,7); g.fill(); g.fillStyle='#8b90c8'; g.fillText('toi',W-76,H-9);
  g.fillStyle='#FF2BD6'; g.beginPath(); g.arc(W-46,H-12,4,0,7); g.fill(); g.fillStyle='#8b90c8'; g.fillText('rivaux',W-38,H-9);
  RS.rm={c,W,H,d,k,ox,oz,bg};
}
function rmapDraw(){
  const m=RS&&RS.rm; if(!m||!RC) return; RS.rmt=(RS.rmt||0)+1; if(RS.rmt%2) return;
  const g=m.c.getContext('2d'), Pa=RS.path, tk=RC.tk, kk=Math.max(m.k,1.7);
  g.setTransform(1,0,0,1,0,0); g.drawImage(m.bg,0,0); g.scale(m.d,m.d);
  const pt=(r)=>{const p=pathAt(Pa,clamp(r.x,-12,tk.L+24),0); return [p.x*m.k+m.ox+Math.sin(p.th)*(r.lane||0)*kk, p.z*m.k+m.oz-Math.cos(p.th)*(r.lane||0)*kk];};
  RC.Os.forEach(o=>{const p=pt(o); g.fillStyle='#FF2BD6'; g.shadowColor='#FF2BD6'; g.shadowBlur=8; g.beginPath(); g.arc(p[0],p[1],4.6,0,7); g.fill(); g.shadowBlur=0; g.lineWidth=1.5; g.strokeStyle='#150c33'; g.stroke();});
  const p=pt(RC.P); g.fillStyle='#00E5FF'; g.shadowColor='#00E5FF'; g.shadowBlur=12; g.beginPath(); g.arc(p[0],p[1],6,0,7); g.fill(); g.shadowBlur=0; g.lineWidth=2; g.strokeStyle='#fff'; g.stroke();
}
