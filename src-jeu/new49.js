/* ---- v1.2b : boutons de course. DRIFT remplace le gros NITRO, GAZ agrandi, NITRO réduit ---- */
function pad49(h){
  try{
    if(!RC||(RC.kind!=='spa'&&RC.kind!=='race')||(RC.kind==='race'&&RC.mn&&RC.mn.d==='drag')) return h;
    const spa=RC.kind==='spa', auto=!!RC.auto, a=h.indexOf(spa?'<div class="padS">':'<div class="pad3">'), b=h.indexOf('<div id="over"');
    if(a<0||b<0||b<a) return h;
    let steer=''; if(spa){ const s=h.indexOf('<div id="steerZone"',a), e=h.indexOf('<button id="pBrk"',a); if(s<0||e<0) return h; steer=h.slice(s,e); }
    const pad=`<div class="${spa?'padS':'pad3'} pad49 ${spa?'':'p3'}">${steer}
      <button id="pBrk" class="pedal brk" ${auto?'disabled':''}><span>${auto?'Auto':'Frein'}</span></button>
      <div class="dnk"><button id="pHnd" class="pedal hnd big" ${auto?'disabled':''}><span>Drift</span><small>frein à main</small></button><button id="pNit" class="pedal nit">Nitro<small>×${S.nitro}</small></button></div>
      <button id="pGas" class="pedal gas big" ${auto?'disabled':''}><i id="gasPed"></i><span>${auto?'Auto':'Gaz'}<small>${auto?'':'glisse vers le bas pour doser'}</small></span></button>
    </div>
    `;
    h=h.slice(0,a)+pad+h.slice(b);
    if(!spa) h=h.replace('class="rmap"','class="rmap ov"');
    if(!spa&&h.indexOf('id="hDrift"')<0) h=h.replace('<div class="hud-lights"','<div class="hud-drift" id="hDrift"></div><div class="hud-lights"');
    return h;
  }catch(e){ try{console.warn('pad49',e);}catch(_){} return h; }
}
{ const _vr=vRace; vRace=function(){ return pad49(_vr.apply(this,arguments)); }; }
{ const _br=bindRace; bindRace=function(){ _br.apply(this,arguments);
  try{ if(RC&&RC.kind==='race'){ const hd=$('pHnd'); if(hd&&!hd._b49){ hd._b49=1;
    hd.addEventListener('pointerdown',e=>{e.preventDefault(); try{hd.setPointerCapture(e.pointerId);}catch(_){} RC.inp.hand=true; hd.classList.add('on');});
    const hu=()=>{RC.inp.hand=false; hd.classList.remove('on');}; hd.addEventListener('pointerup',hu); hd.addEventListener('pointercancel',hu); hd.addEventListener('contextmenu',e=>e.preventDefault()); } } }catch(e){} }; }

/* mini-carte des courses hors Spa : petite carte en surimpression dans le HUD (comme en spéciale), toujours visible */
function rmapInit(){
  const c=$('rmap'); if(!c||!RS||!RS.path||!RC||!RC.tk) return;
  const Pa=RS.path, tk=RC.tk, d=Math.min(2,window.devicePixelRatio||1), ov=c.classList.contains('ov'), W=c.clientWidth||(ov?96:360);
  const vh=Math.min(window.innerHeight||800,(window.visualViewport&&window.visualViewport.height)||9999), H=ov?(c.clientHeight||150):Math.round(clamp(vh-c.getBoundingClientRect().top-18,84,170));
  if(!ov) c.style.height=H+'px';
  c.width=Math.round(W*d); c.height=Math.round(H*d);
  const a0=Math.max(0,Math.floor((Pa.PRE-18)/Pa.STEP)), a1=Math.min(Pa.n-1,Math.ceil((Pa.PRE+tk.L+28)/Pa.STEP));
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(let i=a0;i<=a1;i++){x0=Math.min(x0,Pa.px[i]);x1=Math.max(x1,Pa.px[i]);z0=Math.min(z0,Pa.pz[i]);z1=Math.max(z1,Pa.pz[i]);}
  const pad=ov?12:26, w=Math.max(x1-x0,30), h=Math.max(z1-z0,30), k=Math.min((W-2*pad)/w,(H-2*pad)/h);
  const ox=(W-w*k)/2-x0*k, oz=(H-h*k)/2-z0*k, X=i=>Pa.px[i]*k+ox, Z=i=>Pa.pz[i]*k+oz;
  const bg=document.createElement('canvas'); bg.width=c.width; bg.height=c.height; const g=bg.getContext('2d'); g.scale(d,d);
  g.lineCap='round'; g.lineJoin='round';
  const stroke=(w2,col,filt)=>{g.lineWidth=w2; g.strokeStyle=col; g.beginPath(); let st=false;
    for(let i=a0;i<=a1;i++){const s=-Pa.PRE+i*Pa.STEP; if(filt&&!filt(s)){st=false; continue;} if(!st){g.moveTo(X(i),Z(i)); st=true;} else g.lineTo(X(i),Z(i));} g.stroke();};
  stroke(ov?9:13,'#05040f'); stroke(ov?6:9,'#1b1d45');
  g.shadowColor='#00E5FF'; g.shadowBlur=6; stroke(2,'#2a6fa0'); g.shadowBlur=0;
  tk.segs.filter(q=>q.t==='C').forEach(q=>stroke(ov?3:4,'#FF2BD6',s=>s>=q.a&&s<=q.b));
  const bar=(s,col,txt)=>{const i=clamp(Math.round((s+Pa.PRE)/Pa.STEP),0,Pa.n-1), th=Pa.th[i], r=ov?6:9, nx=Math.sin(th)*r, nz=-Math.cos(th)*r;
    g.strokeStyle=col; g.lineWidth=3; g.beginPath(); g.moveTo(X(i)-nx,Z(i)-nz); g.lineTo(X(i)+nx,Z(i)+nz); g.stroke();
    if(!ov){ g.fillStyle=col; g.font='600 10px sans-serif'; g.textAlign='center'; g.fillText(txt,X(i),txt==='Départ'?Z(i)+22:Z(i)-14); } };
  bar(0,'#3CFF9E','Départ'); bar(tk.L,'#FCEE0A','Arrivée');
  if(!ov){
  g.fillStyle='#8b90c8'; g.font='500 10px sans-serif'; g.textAlign='left'; g.fillText('Carte en direct',10,14);
  g.fillStyle='#00E5FF'; g.beginPath(); g.arc(W-84,H-12,4,0,7); g.fill(); g.fillStyle='#8b90c8'; g.fillText('toi',W-76,H-9);
  g.fillStyle='#FF2BD6'; g.beginPath(); g.arc(W-46,H-12,4,0,7); g.fill(); g.fillStyle='#8b90c8'; g.fillText('rivaux',W-38,H-9); }
  RS.rm={c,W,H,d,k,ox,oz,bg};
}
