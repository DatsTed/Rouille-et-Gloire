/* ===== v2.11 : l'écran à matrice de points du flipper (dans le bac arrière) =====
   Tout ce qui s'affichait sur le plateau ou autour (score, bille, multiplicateurs, radar, turbo, chasse, combos, messages) passe ici, comme sur un vrai flipper.
   Bande du haut (toujours là) : bille en cours, SCORE qui défile en direct, multiplicateur. Bande du bas : radar, turbo, état en cours (chasse, turbo, multibille, combo,
   sauvegarde de bille, puissance du piston, rang) ; un événement la remplace quelques secondes par une animation (tir de compétence, multibille, jackpot, turbo,
   sauvegarde, tilt, combo, chasse, médaille capturée, changement de table, enchaînement de ponts…). Aucune animation ne clignote vite : tout est en balayages et en pulsations douces. */
function dmdMake(S3){
  const GW=120, GH=28, CS=8, CW=GW*CS, CH=GH*CS, AMB='#ffb23a', CYAN='#3de8ff', MAG='#ff4fd8', GRN='#58ff9a', RED='#ff5a5a', WHT='#ffffff', DIM='#6d4f22';
  const hi=document.createElement('canvas'); hi.width=CW; hi.height=CH; const gh=hi.getContext('2d');
  const lo=document.createElement('canvas'); lo.width=GW; lo.height=GH; const g=lo.getContext('2d',{willReadFrequently:true});
  const bg=document.createElement('canvas'); bg.width=CW; bg.height=CH; { const b=bg.getContext('2d'); b.fillStyle='#06030a'; b.fillRect(0,0,CW,CH); b.fillStyle='rgba(255,170,60,.075)'; for(let y=0;y<GH;y++) for(let x=0;x<GW;x++){ b.beginPath(); b.arc(x*CS+CS/2,y*CS+CS/2,CS*.32,0,7); b.fill(); } }
  const st={t:0,disp:0,q:[],cur:null,pts:null,acc:0,rot:0,last:{mult:1,ball:1}};
  const F=px=>'700 '+px+'px "Chakra Petch",system-ui,sans-serif';
  const txt=(s,x,y,px,col,al,a)=>{ g.font=F(px); g.textAlign=al||'center'; g.textBaseline='top'; g.globalAlpha=a==null?1:a; g.fillStyle=col; g.fillText(s,Math.round(x),Math.round(y)); g.globalAlpha=1; };
  const wid=(s,px)=>{ g.font=F(px); return g.measureText(s).width; };
  const fit=(s,px,maxW)=>{ const w=wid(s,px); return w>maxW?Math.max(5,Math.floor(px*maxW/w)):px; };
  const ease=u=>u<0?0:u>1?1:u*u*(3-2*u);
  const num=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  const rect=(x,y,w,h,c,a)=>{ g.globalAlpha=a==null?1:a; g.fillStyle=c; g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); g.globalAlpha=1; };
  const marq=(s,x0,w,y,px,col,t)=>{ const sw=wid(s,px); g.save(); g.beginPath(); g.rect(x0,0,w,GH); g.clip(); if(sw<=w) txt(s,x0+w/2,y,px,col); else{ const per=sw+24, off=(t*22)%per; txt(s,x0-off+sw/2,y,px,col); txt(s,x0-off+per+sw/2,y,px,col); } g.restore(); };
  const circle=(x,y,r,c,fill)=>{ g.beginPath(); g.arc(x,y,r,0,7); if(fill){ g.fillStyle=c; g.fill(); } else { g.strokeStyle=c; g.lineWidth=1; g.stroke(); } };
  /* ---------- événements : file d'attente, chacun avec sa propre animation ---------- */
  function event(m){ m=String(m); let k='text', dur=1.7;
    if(/SKILL/.test(m)){ k='skill'; dur=2.1; } else if(/MULTIBILLE/.test(m)){ k='multi'; dur=2.3; } else if(/JACKPOT/.test(m)){ k='jack'; dur=2.3; } else if(/TURBO !!/.test(m)){ k='turbo'; dur=2; }
    else if(/BALL SAVE/.test(m)){ k='save'; dur=1.9; } else if(/TILT/.test(m)){ k='tilt'; dur=2; } else if(/COMBO/.test(m)){ k='combo'; dur=1.5; } else if(/S.ENFUIT/.test(m)){ k='lost'; dur=1.7; }
    else if(/CHASSE/.test(m)){ k='chasse'; dur=1.9; } else if(/CAPTUR|AMÉLIORÉE/.test(m)){ k='capture'; dur=2.5; } else if(/TABLE :/.test(m)){ k='table'; dur=2.3; } else if(/RADAR/.test(m)){ k='radar'; dur=1.4; }
    else if(/BANQUE/.test(m)){ k='bank'; dur=1.8; } else if(/MULTI ×/.test(m)){ k='mult'; dur=1.7; } else if(/DÉPASSÉ/.test(m)){ k='rank'; dur=1.9; } else if(/^BILLE \d/.test(m)){ k='ball'; dur=1.5; }
    else if(/BONUS/.test(m)){ k='bonus'; dur=1.7; } else if(/Turbo terminé/i.test(m)){ k='text'; dur=1.2; } else if(/ENCHAÎNEMENT|\+\s?[\d  ]+$/.test(m)){ k='ramp'; dur=1.6; }
    const l=st.q[st.q.length-1]; if(l&&l.txt===m&&l.t<.3) return; st.q.push({k,txt:m,t:0,dur}); if(st.q.length>4) st.q.splice(0,st.q.length-4); }
  const evDraw={
    skill(e,p,t){ const s='SKILL SHOT', px=fit(s,12,100); txt(s,60,2,px,DIM); g.save(); g.beginPath(); g.rect(-20+((p*1.7)%1)*170,0,24,GH); g.clip(); txt(s,60,2,px,WHT); g.restore();
      [0,1,2].forEach(k=>{ const y=14-((t*15+k*5)%16); [8,112].forEach(x=>{ g.fillStyle=GRN; g.beginPath(); g.moveTo(x,y); g.lineTo(x-3,y+4); g.lineTo(x+3,y+4); g.closePath(); g.fill(); }); }); },
    multi(e,p,t){ [0,1,2].forEach(i=>{ const a=t*4.2+i*2.09; circle(60+Math.cos(a)*46,7+Math.sin(a*1.3)*3.5,2.6,CYAN,true); }); const s='MULTIBILLE'; txt(s,60,1,fit(s,11,70),AMB); txt('POINTS ×2',60,9,6,WHT); },
    jack(e,p,t){ for(let k=0;k<16;k++){ const s=(k*37)%113, x=(s*7)%120, y=((s*3.3+t*34)%19)-3; rect(x,y,2,2,k%3?AMB:WHT); } const z=1+.06*Math.sin(t*7); g.save(); g.translate(60,7.5); g.scale(z,z); txt('JACKPOT',0,-6.5,13,AMB); g.restore(); },
    turbo(e,p,t){ for(let x=0;x<GW;x+=2){ const h=3+(Math.sin(x*.55+t*10)+Math.sin(x*.21-t*6.5)+2)*2.4; rect(x,GH-h,2,h,h>8?'#ffd24a':'#ff6a1a',.9); } txt('TURBO',60,0,12,WHT); },
    save(e,p,t){ const z=1+.1*Math.sin(t*6); g.save(); g.translate(20,7.5); g.scale(z,z); g.fillStyle=CYAN; g.beginPath(); g.moveTo(-6,-6); g.lineTo(6,-6); g.lineTo(6,1); g.lineTo(0,7); g.lineTo(-6,1); g.closePath(); g.fill(); g.restore(); txt('BALL SAVE',74,2,fit('BALL SAVE',11,76),WHT); },
    tilt(e,p,t){ txt('TILT',60+Math.sin(t*46)*2,0,16,RED); },
    combo(e,p,t){ const n=(e.txt.match(/×\s?(\d+)/)||[0,2])[1]; g.globalAlpha=1-p; g.strokeStyle=AMB; g.lineWidth=1; g.beginPath(); g.arc(60,7.5,p*26,0,7); g.stroke(); g.globalAlpha=1; txt('×'+n,60,0,15,AMB); txt('COMBO',16,4,7,WHT); txt('COMBO',104,4,7,WHT); },
    lost(e,p,t){ marq('LA PIÈCE S’ENFUIT…',2,116,2,10,RED,t); },
    chasse(e,p,t){ circle(14,7.5,6.5,GRN,false); const a=t*5; g.strokeStyle=GRN; g.beginPath(); g.moveTo(14,7.5); g.lineTo(14+Math.cos(a)*6.5,7.5+Math.sin(a)*6.5); g.stroke(); circle(14+Math.cos(1.1)*3,7.5+Math.sin(1.1)*3,1,WHT,true); txt('CHASSE !',74,1,12,GRN); },
    capture(e,p,t){ const nm=e.txt.replace(/^.*?:\s*/,''), w=Math.abs(Math.cos(t*6))*6+1; g.fillStyle=AMB; g.beginPath(); g.ellipse(12,7.5,w,6,0,0,7); g.fill(); g.fillStyle='#fff6'; g.beginPath(); g.ellipse(12,7.5,Math.max(.5,w-2.5),3.5,0,0,7); g.fill(); txt(/AM[ÉE]LIOR/.test(e.txt)?'AMÉLIORÉE':'CAPTURÉ',66,0,7,GRN); marq(nm,24,92,7,8,WHT,t); },
    table(e,p,t){ const nm=e.txt.replace(/^.*TABLE :\s*/,''), x=60+(1-ease(p/.3))*130-(p>.8?ease((p-.8)/.2)*130:0); txt('TABLE',x,0,6,CYAN); txt(nm,x,6,fit(nm,10,108),AMB); },
    radar(e,p,t){ txt(e.txt.replace(/\s+/,' '),60,1,11,CYAN); },
    bank(e,p,t){ txt('BANQUE ABATTUE',60,0,fit('BANQUE ABATTUE',9,112),AMB); g.save(); g.beginPath(); g.rect(-20+((p*2)%1)*160,0,20,GH); g.clip(); txt('+1 500',60,8,7,WHT); g.restore(); txt('+1 500',60,8,7,DIM); },
    mult(e,p,t){ const z=1+.07*Math.sin(t*8); g.save(); g.translate(60,7.5); g.scale(z,z); txt(e.txt.replace(/\s*!/,''),0,-6,13,AMB); g.restore(); },
    rank(e,p,t){ const y=13-((t*12)%14); g.fillStyle=GRN; g.beginPath(); g.moveTo(12,y); g.lineTo(8,y+5); g.lineTo(16,y+5); g.closePath(); g.fill(); marq(e.txt.replace(/\s*!$/,''),24,92,3,9,GRN,t); },
    ball(e,p,t){ const z=.5+.5*ease(p/.25); g.save(); g.translate(60,7.5); g.scale(z,z); txt(e.txt,0,-6.5,13,WHT); g.restore(); },
    bonus(e,p,t){ txt(e.txt,60,2,fit(e.txt,11,112),AMB); },
    ramp(e,p,t){ for(let k=0;k<6;k++){ const x=((k*24+t*70)%150)-12; txt('»',x,3,10,GRN,'center',.55); } marq(e.txt.replace(/\s*!$/,''),8,104,3,9,WHT,t); },
    text(e,p,t){ marq(e.txt,2,116,3,9,AMB,t); }
  };
  /* ---------- une image de l'écran ---------- */
  function frame(dt,H){ st.t+=dt; const t=st.t; st.disp+=(H.score-st.disp)*Math.min(1,dt*7); if(Math.abs(H.score-st.disp)<1) st.disp=H.score;
    g.clearRect(0,0,GW,GH);
    /* bande du haut : bille, score, multiplicateur */
    txt('B'+Math.min(H.ball,H.N)+'/'+H.N,2,2,7,CYAN,'left');
    { const s=num(st.disp), px=fit(s,11,66); txt(s,60,0+(px<11?1:0),px,AMB); }
    { const m=H.mult, big=m>1; if(m!==st.last.mult){ st.last.mult=m; st.multT=0; } st.multT=(st.multT||9)+dt; const z=big&&st.multT<.5?1+.35*Math.sin(st.multT/.5*Math.PI):1;
      g.save(); g.translate(118,5.5); g.scale(z,z); txt('×'+m,0,-5.5,10,big?WHT:DIM,'right'); g.restore(); }
    rect(0,12,GW,1,AMB,.28);
    /* bande du bas */
    g.save(); g.translate(0,13); g.beginPath(); g.rect(0,0,GW,15); g.clip();
    if(!st.cur&&st.q.length){ st.cur=st.q.shift(); st.cur.t=0; }
    if(st.cur){ const e=st.cur, sp=st.q.length?1.7:1; e.t+=dt*sp; const p=e.t/e.dur; if(p>=1) st.cur=null; else{ const fade=p>.88?(1-p)/.12:1; g.globalAlpha=fade; (evDraw[e.k]||evDraw.text)(e,p,e.t); g.globalAlpha=1; } }
    if(!st.cur){
      if(H.waiting&&H.power>0){ txt('PUISSANCE',60,0,6,AMB); rect(2,8,116,5,DIM,.5); rect(2+116*.8,8,116*.15,5,GRN,.45); rect(2,8,116*H.power,5,H.power>=.8&&H.power<=.95?GRN:AMB); }
      else{
        txt('RADAR',19,0,6,CYAN); for(let i=0;i<H.NEED;i++){ const on=i<H.radar; rect(2+i*9,8,8,5,on?CYAN:DIM,on?1:.45); if(!on){ rect(3+i*9,9,6,3,'#000'); } }
        txt('TURBO',101,0,6,MAG); for(let i=0;i<5;i++){ const on=H.turbo>0?true:i<Math.min(5,Math.floor(H.turboG/5)); const pul=H.turbo>0?.75+.25*Math.sin(t*5+i):1; rect(83+i*7,8,6,5,on?MAG:DIM,on?pul:.45); if(!on) rect(84+i*7,9,4,3,'#000'); }
        /* centre : l'état le plus important du moment */
        const cx=40, cw=40; let drew=true;
        if(H.mode==='chasse'){ txt('CHASSE '+Math.ceil(H.chT),60,0,6,GRN); for(let i=0;i<H.hpMax;i++) rect(60-H.hpMax*3+i*6,8,5,5,i<H.hp?MAG:DIM,i<H.hp?1:.5); }
        else if(H.turbo>0){ txt('TURBO '+Math.ceil(H.turbo),60,0,7,AMB); txt('BUMPERS ×3',60,8,6,WHT); }
        else if(H.nballs>1){ txt('MULTIBILLE',60,0,fit('MULTIBILLE',7,cw),CYAN); txt('POINTS ×2',60,8,6,WHT); }
        else if(H.combo>=2&&H.comboT>0){ txt('COMBO',60,0,6,WHT); txt('×'+H.combo,60,6,9,AMB); }
        else if(H.save>0){ txt('BALL SAVE',60,0,6,CYAN); rect(42,8,36*Math.min(1,H.save/12),5,CYAN); }
        else if(st.pts&&st.pts.t<1.3){ st.pts.t+=dt; txt(st.pts.s,60,3,9,WHT,'center',Math.max(0,1-st.pts.t/1.3)); }
        else if(H.waiting){ marq('MAINTIENS À DROITE POUR LANCER',cx,cw,3,7,WHT,t); }
        else drew=false;
        if(!drew){ st.rot+=dt; const k=Math.floor(st.rot/3.6)%3, s=k===0?(H.rankUp?'DEVANT : '+H.rankUp:'TU ES 1ER !'):k===1?H.tab:'RAMPES · BUMPERS · CHASSE'; marq(s,cx,cw,3,7,k===0?GRN:AMB,t); }
      }
    }
    g.restore();
    /* conversion en points lumineux */
    const d=g.getImageData(0,0,GW,GH).data; gh.globalAlpha=1; gh.drawImage(bg,0,0);
    for(let y=0;y<GH;y++) for(let x=0;x<GW;x++){ const i=(y*GW+x)*4, a=d[i+3]/255; if(a<.12) continue; const lum=Math.max(d[i],d[i+1],d[i+2])/255*a; if(lum<.1) continue;
      const cx=x*CS+CS/2, cy=y*CS+CS/2, col='rgb('+d[i]+','+d[i+1]+','+d[i+2]+')'; gh.fillStyle=col; gh.globalAlpha=.14*lum; gh.beginPath(); gh.arc(cx,cy,CS*.66,0,7); gh.fill(); gh.globalAlpha=Math.min(1,.5+lum*.6); gh.beginPath(); gh.arc(cx,cy,CS*(.27+.17*lum),0,7); gh.fill(); }
    gh.globalAlpha=1; }
  return {canvas:hi,event,pts:s=>{ st.pts={s:String(s),t:0}; },frame,get w(){ return CW; },get h(){ return CH; }};
}
