/* ===== v0.44 : Pinball 2.0 (chasse aux pièces, radar, turbo, multibille, niveaux, paliers) + station Monde ===== */
/* ---------- carte du Monde façon station de métro ---------- */
function worldBtn(){ const t=$('top'); if(!t||t.querySelector('.worldbtn')) return; const b=document.createElement('button'); b.className='worldbtn'; b.dataset.a='wmap'; b.setAttribute('aria-label','Carte du Monde'); b.textContent='🌍'; const mo=t.querySelector('.money'), sb=mo&&mo.querySelector('[data-a="mute"]'); if(sb) sb.before(b); else (mo||t).appendChild(b); }
const LINES=[['Ligne 1 · Chez toi','#ffd400',['garage','atelier','ranch']],['Ligne 2 · Sorties','#ff2bd6',['beach','street','arcade']]];
function wmapSheet(X){
  if(!sheet||sheet.t!=='wmap') return false;
  const here=id=>view==='hub'&&(HUB.map||'garage')===id;
  $('sheet').innerHTML=`<div class="inv metro">${X}<div class="mhead"><span class="mlogo">M</span><div><h2>Station Monde</h2><small>Où veux-tu aller ?</small></div></div>
   ${LINES.map(L=>`<div class="mline" style="--lc:${L[1]}"><div class="mlt">${L[0]}</div>${L[2].map(id=>DEST.find(d=>d.id===id)).filter(Boolean).map(d=>{ const ok=d.ok(), h=here(d.id); return `<button class="mstop ${ok?'':'lock'} ${h?'here':''}" data-a="wtravel" data-id="${d.id}" ${ok&&!h?'':'disabled'}><i class="dot"></i><span class="mic">${d.ic}</span><span class="mtx"><b>${d.nom}</b><small>${h?'Tu es ici':ok?d.d:'🔒 '+d.why}</small></span>${ok&&!h?'<span class="mgo">›</span>':''}</button>`; }).join('')}</div>`).join('')}</div>`; return true; }
ACT.wmap=()=>openSheet({t:'wmap'});
ACT.wtravel=d=>{ const D=DEST.find(x=>x.id===d.id); if(!D||!D.ok()) return; musicStop(); closeSheet();
  if(view!=='hub'){ HUB.map='garage'; ACT.tab({id:'hub'}); if(d.id!=='garage') setTimeout(()=>{ try{ growEnter(d.id); }catch(e){ console.error(e); } },120); return; }
  if(d.id==='garage'){ if((HUB.map||'garage')!=='garage') growExit(); return; } growEnter(d.id); };
/* ---------- pièces exclusives du pinball ---------- */
const PB_UN0=UNIQ.length;
[['Cœur de Flipper','mo1',{ch:1.1,nm:.9},'Un bloc qui cogne comme un bumper'],['Turbo Tilt','tu2',{ch:1,nm:1,fia:-.2},'Se déclenche quand tu secoues la table'],['Pot Multibille','ec2',{ch:.8,sty:.9},'Trois sorties, trois fois plus de bruit'],
 ['Gommes Néon','pn1',{adh:1.5,wet:.4},'Elles brillent dans le noir'],['Freins Flipper','fr3',{fre:1.4,kg:.5},'Ils attrapent la bille au vol'],['Amorti Bumper','su1',{man:1.4,adh:.6},'Rebondit mais ne casse jamais'],
 ['Coque Jackpot','ch2',{kg:1.5,dmg:.8},'Légère comme un ticket gagnant'],['Aileron Ball Save','ae2',{adh:1.1,vmax:.7},'Te rattrape quand tu tombes'],['Nitro Extra Ball','ni3',{nitD:1.1,nitP:1},'Une charge de plus, à chaque fois'],
 ['Jantes Tilt','ja3',{inc:1.5,sty:1.1},'Elles tournent même à l’arrêt'],['Livrée Arcade','pe3',{xp:1.6,sty:1},'Pixels, néons et gros score'],['Culasse Super Jackpot','mo3',{nm:1.5,fia:1,ch:.6},'La pièce que tous les joueurs rêvent d’avoir']]
 .forEach(a=>UNIQ.push({n:a[0],t:a[1],fx:a[2],d:a[3],ar:1}));
const _newMod23=newMod;
newMod=function(r,slot,plain){ const m=_newMod23.apply(this,arguments); if(m.un!=null&&m.un>=PB_UN0){ m.un=rint(0,PB_UN0-1); m.t=UNIQ[m.un].t; S.alb[m.t]=(S.alb[m.t]||0)|(1<<m.r); } return m; };
M.arcgt={id:'arcgt',nom:'Flipper GT Tilt',an:2027,cat:'Édition Arcade',shape:'super',tr:'AWD',t:6,ch:980,nm:1050,kg:1380,vmax:365,adh:93,fre:91,man:93,fia:72,sty:99,val:700000,col:'#ff2bd6',arc:1};
function pbS(){ const A=arcS(); return A.pb||(A.pb={xp:0,lv:1,caps:0,got:{},pal:{},runs:0,bestC:0}); }
const pbNeed=lv=>500*lv, PB_MAXLV=20;
const pbPerk={ save:lv=>8+.6*lv, need:lv=>lv>=9?2:lv>=4?3:4, balls:lv=>lv>=10?4:3, arcP:lv=>Math.min(.5,.1+.02*lv), rar:lv=>1+.07*lv };
const PB_PAL=[{s:12000,t:'part',r:3,n:'Pièce Épique'},{s:40000,t:'arc',r:4,n:'Pièce d’arcade Légendaire'},{s:100000,t:'car',n:'Voiture spéciale : Flipper GT Tilt'}];
const PB_RW=[34,30,20,10,4.5,1.3,.2];
function pbRoll(lv){ const w=PB_RW.map((x,i)=>x*(i>=2?pbPerk.rar(lv):1)), tot=w.reduce((a,b)=>a+b,0); let x=Math.random()*tot; for(let i=0;i<7;i++){ x-=w[i]; if(x<0) return i; } return 0; }
function pbGrant(r,arc){ /* ajoute une pièce à l’inventaire ; renvoie {m,name,dup,full} */
  const P=pbS(); let m, dup=false;
  if(arc){ const ui=PB_UN0+rint(0,UNIQ.length-PB_UN0-1), ex=S.mods.find(x=>x.un===ui);
    if(ex){ ex.q=Math.round((ex.q+.12)*100)/100; ex.st=Math.min(5,(ex.st||0)+1); m=ex; dup=true; }
    else { const base=_newMod23(Math.max(3,r),null,true); m=base; m.un=ui; m.t=UNIQ[ui].t; m.sn=rint(1,999); m.q=Math.round(rnd(1.15,1.4)*100)/100; m.pb=1; S.alb[m.t]=(S.alb[m.t]||0)|(1<<m.r);
      if(S.mods.length+1>invMax()){ S.scrap+=RAR[m.r].sc*2; return {m,name:UNIQ[ui].n,full:1,r:m.r,arc:1}; } S.mods.push(m); }
    P.got[ui]=(P.got[ui]||0)+1; return {m,name:UNIQ[ui].n,dup,r:m.r,arc:1}; }
  m=newMod(r,null,true); if(S.mods.length+1>invMax()){ S.scrap+=RAR[m.r].sc; return {m,name:modName(m),full:1,r:m.r}; } S.mods.push(m); return {m,name:modName(m),r:m.r}; }
/* ---------- le jeu ---------- */
ARC.pin.d='3 billes. Maintiens LANCER puis flippers. Remplis le RADAR (couloirs du haut, cibles, garage, bumpers) pour lancer une CHASSE : frappe la pièce qui flotte avant la fin du temps pour la capturer. 8 tables à débloquer avec ton niveau pinball, avec des PONTS et des RAMPES : lance la bille dedans (flèche à l’entrée) et enchaîne-les pour multiplier les points ; abats les banques de cibles orange. Le TROU bleu te téléporte vers la table suivante (il se ferme tant qu’une pièce est en jeu). Gagne de l’expérience et débloque des paliers.';
ARCR.pin=[['Nakai',90000],['Vega',55000],['Quill',32000],['Ibarra',16000],['Brandt',7000]];
const _pin22=GAMES.pin;
GAMES.pin=function(api){
  const st=api.st, bar=api.bar, W=360,H=600,R=6.5,G=640, P=pbS(), LV=P.lv, N=pbPerk.balls(LV), NEED=pbPerk.need(LV);
  const SK=pmStyleOf(LV), TH=PMS[SK].th; PM.begin(SK,LV); setTimeout(()=>sfx('ready'),200);
  const cv=document.createElement('canvas'); cv.className='arccv'; st.appendChild(cv); const ctx=cv.getContext('2d'); let K=1, R3=null, OW=W, OH=H;
  const live=document.createElement('div'); live.className='pinlive'; st.parentNode.insertBefore(live,st); const side=document.createElement('div'); side.className='pinside'; st.appendChild(side); let lastS='';
  const fit=()=>{ const r=st.getBoundingClientRect(), s=Math.min(r.width/W,r.height/H)||1, dpr=Math.min(2,window.devicePixelRatio||1);
    if(R3){ OW=Math.max(100,Math.round(r.width)); OH=Math.max(100,Math.round(r.height)); cv.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:'+OW+'px;height:'+OH+'px;max-width:none;max-height:none'; cv.width=Math.round(OW*dpr); cv.height=Math.round(OH*dpr); K=dpr; R3.resize(OW,OH,dpr); return; } cv.style.width=(W*s)+'px'; cv.style.height=(H*s)+'px'; cv.width=Math.round(W*s*dpr); cv.height=Math.round(H*s*dpr); K=s*dpr; };
  bar.innerHTML=''; bar.style.display='none';
  fit(); const ro=window.ResizeObserver?new ResizeObserver(fit):null; if(ro) ro.observe(st);
  const segs=[]; const sg=(x1,y1,x2,y2,e,k)=>{ const s={x1,y1,x2,y2,e:e||.5,k:k||0}; segs.push(s); return s; };
  { const cx=180,cy=170,ar=168; let px=12,py=170; for(let i=1;i<=18;i++){ const a=Math.PI+i/18*Math.PI, x=cx+ar*Math.cos(a), y=cy+ar*Math.sin(a); sg(px,py,x,y,.4); px=x; py=y; } }
  sg(12,170,12,455); sg(348,170,348,594); sg(318,594,348,594); sg(318,215,318,594);
  /* guides du bas : ils s'incurvent pour arriver exactement dans le prolongement du flipper au repos (même angle, même hauteur de surface),
     la bille glisse ainsi du guide au flipper sans marche ni rebond */
  { const R0=6.5, FW=6, rest=.6; [[12,455,98,545,1],[318,455,222,545,-1]].forEach(([x0,y0,px,py,s])=>{
      const nx=s*Math.sin(rest), ny=-Math.cos(rest), E=[px+nx*FW,py+ny*FW], pts=[E]; let p=E;
      [34,38,42].forEach(a=>{ const r=a*Math.PI/180, dx=s*Math.cos(r), dy=Math.sin(r); p=[p[0]-dx*20,p[1]-dy*20]; pts.unshift(p); });
      pts.unshift([x0,y0]); for(let i=0;i<pts.length-1;i++) sg(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],i<pts.length-3?.25:.08); }); }
  const door=sg(348,196,318,222,.3); door.off=true; door.door=1;
  const slL={x1:50,y1:392,x2:98,y2:462,e:1.05,k:360,hit:0}, slR={x1:268,y1:392,x2:222,y2:462,e:1.05,k:360,hit:0}; segs.push(slL,slR);
  const bumps=[], posts=[], spins=[], boosts=[], portals=[], wells=[], mills=[], ramps=[], dbanks=[]; let rampN=0, rampT=0, rampMax=0; const hole={x:172,y:310,r:15,open:true,sp:0,cool:0};
  const tgt=[], lanes=[];
  const sauc={x:292,y:282,r:10,cool:0,glow:0}; const part={on:false,x:170,y:300,r:24,hp:0,max:0,hit:0,r_:0,arc:false,ui:-1,slot:'moteur',ic:'⚙️',cool:0,vx:0,vy:0,tx:170,ty:250,wt:0,dash:0,tr:[]};
  const FL=[{px:98,py:545,L:56,s:1,th:.6,rest:.6,act:-.52,w:0,on:false},{px:222,py:545,L:56,s:-1,th:.6,rest:.6,act:-.52,w:0,on:false}];
  const tip=f=>[f.px+f.s*f.L*Math.cos(f.th), f.py+f.L*Math.sin(f.th)];
  const mkb=()=>({x:333,y:572,vx:0,vy:0,st:'plunger',trail:[],la:false,ht:0,stuck:0});
  let balls=[mkb()], score=0, ball=1, mult=1, power=0, charging=false, save=pbPerk.save(LV), usedSave=false, msg='', msgT=0, over=false, t=0;
  let combo=0, comboT=0, shake=0, tiltT=0, tiltN=0, nudgeCD=0, ballBumps=0, lastRank=99; const pops=[]; let radar=LV>=6?1:0, turboG=0, turbo=0, bumpN=0, mode=null, chT=0, mbSave=0, jack=0; const caps=[], fx=[];
  const say=m=>{ msg=m; msgT=1.6; }; const sfx=(k,a)=>{ try{ if(PM.sfx) PM.sfx(k,a); }catch(_){} };
  const pop=(x,y,t,c)=>pops.push({x,y,t,c:c||'#fff',l:.9});
  const hitC=(x,y,pts)=>{ if(comboT>0) combo++; else combo=1; comboT=1.5; if(pts) pop(x,y-12,'+'+fmt(Math.round(pts*mult*(balls.length>1?2:1))),TH.b); const T={5:[500,'NICE !'],10:[1500,'WOW !'],20:[4000,'INSANE !'],35:[9000,'GODLIKE !']}[combo]; if(T){ add(T[0]); say(T[1]+' COMBO ×'+combo); shake=1; PM.fx('nice'); burst(x,y,TH.a,24); } };
  const add=n=>{ score+=Math.round(n*mult*(balls.length>1?2:1)); };
  const burst=(x,y,c,n)=>{ for(let i=0;i<n;i++){ const a=Math.random()*6.28, v=60+Math.random()*220; fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5+Math.random()*.5,c}); } };
  const resetBall=()=>{ balls=[mkb()]; door.off=true; power=0; usedSave=false; };

  /* ---------- 6 tables + trou de changement ---------- */
  const L3=[[132,62],[180,52],[228,62]], P2=[[120,400],[240,400]], TT=[[110,96],[180,84],[250,96]];
  const TBL=[
   {n:'GARAGE',ic:'🔧',bg:'#ffd400',bumps:[[130,150],[215,150],[172,205]],tgt:TT,lanes:L3,sauc:[100,240],hole:[172,312],posts:P2,
    ramps:[{c:[[54,330],[44,270],[52,200],[88,140],[146,106],[206,98],[262,118],[292,164],[298,226]],col:'#ffd400',nm:'PONT DU GARAGE'}]},
   {n:'NÉON DRIFT',ic:'🌈',bg:'#ff2bd6',bumps:[[95,130],[165,108],[235,130],[130,190],[200,190]],tgt:[[46,235],[46,275],[46,315]],lanes:L3,sauc:[140,290],hole:[178,350],posts:P2,
    spins:[[180,262]],boosts:[[60,300,.3,-.95],[250,345,-.3,-.95]],segs:[[30,215,70,252,.35],[300,215,262,252,.35]],
    ramps:[{c:[[286,330],[296,270],[294,198],[266,120],[204,76],[132,78],[74,122],[54,192],[72,252],[116,286]],col:'#ff2bd6',nm:'BOUCLE NÉON'}]},
   {n:'SPA RUSH',ic:'🏁',bg:'#3cff9e',bumps:[[110,200],[235,200],[172,150,15,[70,0,1.4]]],tgt:TT,lanes:L3,sauc:[140,290],hole:[172,322],posts:P2,
    portals:[[48,200],[272,352]],boosts:[[172,245,0,-1]],
    ramps:[{c:[[54,330],[62,282],[100,238],[160,214],[214,196],[262,168],[292,196],[296,250]],col:'#3cff9e',nm:'EAU ROUGE'},{c:[[290,330],[272,290],[222,256],[164,236],[110,206],[70,196],[50,236],[50,282]],col:'#ffd400',nm:'RAIDILLON'}]},
   {n:'CASSE AUTO',ic:'🚗',bg:'#ff9a1a',bumps:[[130,140],[225,140],[180,95,14]],tgt:[[46,230],[46,270],[46,310]],lanes:L3,sauc:[100,190],hole:[252,336],posts:P2,
    wells:[[180,250,70,520]],mills:[[98,322,36,2.4]],drops:[[[290,150,290,172],[290,178,290,200],[290,206,290,228]]],
    ramps:[{c:[[286,330],[270,284],[224,242],[160,200],[112,160],[104,122],[150,94],[214,102],[262,138]],col:'#ff9a1a',nm:'RAMPE DE CASSE'}]},
   {n:'TURBO TUNNEL',ic:'🚀',bg:'#00e5ff',bumps:[[170,120,17],[170,268,17]],tgt:TT,lanes:L3,sauc:[100,290],hole:[170,342],posts:P2,
    mills:[[88,200,30,2.8],[252,200,30,-2.8]],boosts:[[170,196,0,-1]],spins:[[170,170]],
    ramps:[{c:[[54,330],[50,270],[60,204],[100,140],[170,108],[240,140],[278,196],[284,262]],col:'#00e5ff',nm:'TUNNEL'},{c:[[288,330],[294,274],[276,206]],col:'#3cff9e',nm:'BYPASS',mr:13}]},
   {n:'COSMOS',ic:'🪐',bg:'#8f6bff',bumps:[[170,130,14,[80,30,1.1]],[170,205,14,[-70,0,1.7]]],tgt:TT,lanes:L3,sauc:[140,340],hole:[60,332],posts:P2,
    wells:[[100,262,60,420],[250,200,55,420]],portals:[[52,150],[272,380]],spins:[[180,300]],
    ramps:[{c:[[288,330],[296,270],[290,190],[250,126],[180,92],[110,126],[70,190],[70,262],[110,300]],col:'#8f6bff',nm:'ORBITE'}]},
   {n:'DRAG STRIP',ic:'🚦',bg:'#ff4d4d',bumps:[[120,150],[222,150],[172,120,15]],tgt:TT,lanes:L3,sauc:[140,290],hole:[172,330],posts:P2,
    boosts:[[110,250,0,-1],[236,250,0,-1]],drops:[[[28,150,28,172],[28,178,28,200],[28,206,28,228]]],
    ramps:[{c:[[54,330],[60,270],[84,200],[112,140],[134,80],[160,48]],col:'#ff4d4d',nm:'LIGNE DROITE G',min:380,cs:.93},{c:[[288,330],[282,270],[258,200],[236,140],[216,80],[190,48]],col:'#ff9a1a',nm:'LIGNE DROITE D',min:380,cs:.93}]},
   {n:'ANNEAU NÉON',ic:'💠',bg:'#4aa8ff',bumps:[[172,150,16],[130,210],[214,210]],tgt:TT,lanes:L3,sauc:[280,240],hole:[172,320],posts:P2,
    spins:[[172,262]],portals:[[48,330],[290,150]],drops:[[[300,330,300,352],[300,358,300,380]]],
    ramps:[{c:[[60,300],[50,250],[56,190],[90,124],[150,88],[210,88],[262,122],[290,182],[284,250],[250,300]],col:'#4aa8ff',nm:'GRAND ANNEAU',min:360,cs:.92},{c:[[172,252],[172,214],[172,176],[172,144]],col:'#ff2bd6',nm:'AXE CENTRAL',mr:10,cs:.96}]}];
  const ramSmooth=(c,n)=>{ const out=[]; for(let i=0;i<c.length-1;i++){ const p0=c[Math.max(0,i-1)],p1=c[i],p2=c[i+1],p3=c[Math.min(c.length-1,i+2)]; for(let k=0;k<n;k++){ const u=k/n,u2=u*u,u3=u2*u; out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),.5*((2*p1[1])+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)]); } } out.push(c[c.length-1].slice()); return out; };
  let tabI=0, T=TBL[0]; const seen={0:1};
  /* ---------- disposition d'une table (v2.10) : embouchures de rampes larges là où la bille passe vraiment (milieu bas, juste au-dessus des deux bumpers de rebond),
     garage = sortie des ponts, trou de changement de table excentré et plus dur à atteindre, clous loin des barres rebondissantes ---------- */
  const layoutTable=T=>{ if(T._lay) return; T._lay=1;
    const occ=[]; T.bumps.forEach(a=>{ const r=a[2]||17; if(a[3]){ for(let k=-4;k<=4;k++) occ.push([a[0]+a[3][0]*k/4,a[1]+a[3][1]*k/4,r]); } else occ.push([a[0],a[1],r]); });
    (T.tgt||[]).forEach(a=>occ.push([a[0],a[1],10])); (T.mills||[]).forEach(a=>occ.push([a[0],a[1],a[2]])); (T.boosts||[]).forEach(a=>occ.push([a[0],a[1],16])); (T.portals||[]).forEach(a=>occ.push([a[0],a[1],14])); (T.spins||[]).forEach(a=>occ.push([a[0],a[1],16]));
    (T.drops||[]).forEach(bk=>bk.forEach(a=>occ.push([(a[0]+a[2])/2,(a[1]+a[3])/2,20]))); (T.segs||[]).forEach(a=>{ for(let k=0;k<=4;k++) occ.push([a[0]+(a[2]-a[0])*k/4,a[1]+(a[3]-a[1])*k/4,7]); });
    const clear=(x,y,r)=>occ.reduce((m,o)=>Math.min(m,Math.hypot(x-o[0],y-o[1])-o[2]-r),1e9);
    const dseg=(x,y,a,b,c,d)=>{ const dx=c-a, dy=d-b, l2=dx*dx+dy*dy||1, tt=Math.max(0,Math.min(1,((x-a)*dx+(y-b)*dy)/l2)); return Math.hypot(x-(a+dx*tt),y-(b+dy*tt)); };
    const pick=(cands,r,extra)=>{ let best=cands[0], bs=-1e9; for(const c of cands){ const s=Math.min(clear(c[0],c[1],r),extra?extra(c):1e9); if(s>=6) return c; if(s>bs){ bs=s; best=c; } } return best; };
    const two=(T.ramps||[]).length>1, M1=[124,384], M2=[216,384], M0=[172,388], mouths=two?[M1,M2]:[M0];
    const G=pick([[80,152],[86,112],[72,128],[100,100]],15), far=(c,p,d)=>Math.hypot(c[0]-p[0],c[1]-p[1])-d;
    const H=pick([[276,114],[46,336],[292,296],[60,222]],17,c=>Math.min(far(c,G,60),...mouths.map(m=>far(c,m,60))));
    T.sauc=G; T.hole=H;
    const sl=[[50,392,98,462],[268,392,222,462]], okP=c=>Math.min(Math.min(...sl.map(s=>dseg(c[0],c[1],s[0],s[1],s[2],s[3])))-40,far(c,G,40),far(c,H,40),...mouths.map(m=>far(c,m,46)));
    T.posts=[pick([[86,300],[70,350],[118,262],[132,330]],6,okP),pick([[254,300],[272,350],[222,262],[208,330]],6,okP)];
    const bez=(p0,p1,p2,p3,n)=>{ const o=[]; for(let i=0;i<=n;i++){ const u=i/n, v=1-u; o.push([v*v*v*p0[0]+3*v*v*u*p1[0]+3*v*u*u*p2[0]+u*u*u*p3[0],v*v*v*p0[1]+3*v*v*u*p1[1]+3*v*u*u*p2[1]+u*u*u*p3[1]]); } return o; };
    const cat=(...segs)=>{ const o=[]; segs.forEach(s=>s.forEach((p,i)=>{ if(o.length&&!i) return; o.push(p); })); return o; };
    (T.ramps||[]).forEach((a,k)=>{ let c;
      if(!two) c=cat(bez(M0,[150,326],[70,330],[62,262],4),bez([62,262],[58,216],[G[0]-12,G[1]+40],G,4));
      else if(k===0) c=cat(bez(M1,[100,340],[58,312],[58,250],4),bez([58,250],[58,214],[G[0]-12,G[1]+40],G,4));
      else c=cat(bez(M2,[240,330],[290,310],[286,236],4),bez([286,236],[284,170],[262,128],[232,116],3),bez([232,116],[200,100],[120,92],G,4));
      a.c=c.map(p=>[Math.round(p[0]*10)/10,Math.round(p[1]*10)/10]); a.mr=23; a.min=210; a.cs=.62; });
  };
  function loadTable(i){
    tabI=i; T=TBL[i]; layoutTable(T);
    for(let k=segs.length-1;k>=0;k--) if(segs[k].tb) segs.splice(k,1);
    bumps.length=posts.length=spins.length=boosts.length=portals.length=wells.length=mills.length=tgt.length=lanes.length=ramps.length=dbanks.length=0;
    T.bumps.forEach(a=>{ const q={x:a[0],y:a[1],r:a[2]||17,hit:0,x0:a[0],y0:a[1]}; if(a[3]) q.mv=a[3]; bumps.push(q); });
    (T.posts||[]).forEach(a=>posts.push({x:a[0],y:a[1],r:6}));
    /* petite quille fixe en haut à gauche, contre l'arc : la bille lancée ne glisse plus toujours le long de la paroi jusqu'en bas à gauche */
    { const a=212*Math.PI/180; posts.push({x:180+156*Math.cos(a),y:170+156*Math.sin(a),r:5,q:1}); } T.tgt.forEach(a=>tgt.push({x:a[0],y:a[1],r:8,on:0})); T.lanes.forEach(a=>lanes.push({x:a[0],y:a[1],on:0}));
    (T.spins||[]).forEach(a=>spins.push({x:a[0],y:a[1],r:15,ang:0,cd:0,n:0})); (T.boosts||[]).forEach(a=>{ const m=Math.hypot(a[2],a[3])||1; boosts.push({x:a[0],y:a[1],r:15,dx:a[2]/m,dy:a[3]/m,cd:0,glow:0}); });
    (T.portals||[]).forEach((a,k)=>portals.push({x:a[0],y:a[1],r:13,k,cd:0})); (T.wells||[]).forEach(a=>wells.push({x:a[0],y:a[1],r:a[2],k:a[3]}));
    (T.mills||[]).forEach(a=>{ const sgm=sg(a[0]-a[2],a[1],a[0]+a[2],a[1],.95); sgm.tb=1; sgm.mill=1; mills.push({x:a[0],y:a[1],L:a[2],sp:a[3],s:sgm}); });
    (T.segs||[]).forEach(a=>{ const q=sg(a[0],a[1],a[2],a[3],a[4]||.4); q.tb=1; });
    (T.ramps||[]).forEach((a,k)=>{ const p=ramSmooth(a.c,7), cum=[0]; for(let i=1;i<p.length;i++) cum.push(cum[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1])); const d0=Math.hypot(p[2][0]-p[0][0],p[2][1]-p[0][1])||1;
      ramps.push({k,p,cum,len:cum[cum.length-1],col:a.col||TH.b,pts:a.pts||500,mx:p[0][0],my:p[0][1],mr:a.mr||12,ux:(p[2][0]-p[0][0])/d0,uy:(p[2][1]-p[0][1])/d0,min:a.min||300,cs:a.cs||.88,cd:0,glow:0,n:0,nm:a.nm||'RAMPE'}); });
    (T.drops||[]).forEach(bk=>{ const B={ss:[],rt:0}; bk.forEach(a=>{ const q=sg(a[0],a[1],a[2],a[3],.5); q.tb=1; q.dr=1; q.bk=B; B.ss.push(q); }); dbanks.push(B); });
    sauc.x=T.sauc[0]; sauc.y=T.sauc[1]; sauc.cool=.6; hole.x=T.hole[0]; hole.y=T.hole[1]; hole.cool=1; hole.sp=0;
    if(R3) R3.setTable();
  }
  loadTable(0);
  /* rendu 3D (new71) : même physique, autre dessin ; s'il est indisponible on garde le dessin 2D ci-dessous */
  const S3={segs,bumps,posts,tgt,lanes,sauc,hole,wells,portals,spins,boosts,mills,ramps,dbanks,FL,slL,slR,door,part,TH,R,TBL,
    get balls(){ return balls; }, get T(){ return T; }, get tabI(){ return tabI; }, get t(){ return t; }, get power(){ return power; }, get turbo(){ return turbo; },
    get mode(){ return mode; }, get pulse(){ return PM.pulse; }, get tilt(){ return tiltT; }, get nextTab(){ return TBL[(tabI+1)%tabsOpen()]; }, get tabsOpen(){ return tabsOpen(); }, tip };
  try{ R3=(typeof pin3dMake==='function')?pin3dMake(S3,st,cv):null; }catch(e){ console.warn('flipper 3D indisponible',e); R3=null; }
  if(R3){ fit(); R3.setTable(); }
  const updMovers=h=>{ for(const q of bumps) if(q.mv){ q.x=q.x0+q.mv[0]*Math.sin(t*q.mv[2]); q.y=q.y0+q.mv[1]*Math.sin(t*q.mv[2]); }
    for(const m of mills){ const a=t*m.sp; m.s.x1=m.x-Math.cos(a)*m.L; m.s.y1=m.y-Math.sin(a)*m.L; m.s.x2=m.x+Math.cos(a)*m.L; m.s.y2=m.y+Math.sin(a)*m.L; m.a=a; }
    for(const s of spins){ s.cd-=h; s.ang+=h*(s.cd>0?14:2); } for(const b of boosts){ b.cd-=h; b.glow=Math.max(0,b.glow-h*3); } for(const p of portals) p.cd-=h; for(const r of ramps){ r.cd-=h; r.glow=Math.max(0,r.glow-h*2); } for(const B of dbanks){ if(B.rt>0){ B.rt-=h; if(B.rt<=0){ B.ss.forEach(q=>q.off=false); arcTone(520,.12,'triangle',.07); } } } if(rampT>0){ rampT-=h; if(rampT<=0) rampN=0; } hole.sp+=h*(hole.open?3:.6); hole.cool-=h; hole.open=!part.on&&mode!=='chasse'&&tabsOpen()>1;
    if(part.on){ const p=part; p.wt-=h; p.dash=Math.max(0,p.dash-h);
      if(p.wt<=0||Math.hypot(p.tx-p.x,p.ty-p.y)<14){ p.tx=rnd(50,280); p.ty=rnd(95,400); p.wt=rnd(.9,2.0); if(Math.random()<.35) p.dash=.45; }
      const fr=1-p.hp/p.max, sp=(100+fr*100)*(p.dash>0?2.4:1), dx=p.tx-p.x, dy=p.ty-p.y, d=Math.hypot(dx,dy)||1, k=Math.min(1,h*4); p.vx+=(dx/d*sp-p.vx)*k; p.vy+=(dy/d*sp-p.vy)*k; p.x+=p.vx*h; p.y+=p.vy*h;
      p.x=Math.max(44,Math.min(286,p.x)); p.y=Math.max(90,Math.min(430,p.y)); if(p.y>380&&(p.x<112||p.x>208)) p.y=380; if(Math.floor(t*30)%2===0){ p.tr.push([p.x,p.y]); if(p.tr.length>6) p.tr.shift(); } } };
  const PB_TB_LV=[1,2,4,6,8,10,13,16], tabsOpen=()=>PB_TB_LV.filter(l=>LV>=l).length;
  function switchTable(b){ const n=(tabI+1)%tabsOpen(); loadTable(n); P.tv=(P.tv||1)|(1<<n); if(!seen[n]){ seen[n]=1; add(1500); } say(T.ic+' TABLE : '+T.n); sfx('table',tabI); PM.fx('nice'); shake=1; burst(hole.x,hole.y,TH.a,30);
    b.st='play'; b.x=sauc.x; b.y=sauc.y; b.vx=-220; b.vy=-430; b.la=false; b.stuck=0; sauc.cool=1.1; lanes.forEach(q=>q.on=0); arcTone(500,.3,'sine',.1); arcTone(900,.3,'triangle',.08); }
  const launch=()=>{ const b=balls.find(x=>x.st==='plunger'); if(!b) return; if(power>=.8&&power<=.95){ add(2500); say('SKILL SHOT !'); radarAdd(1); PM.fx('skill'); shake=.8; } b.vy=-(660+640*power); b.vx=-6; b.st='play'; b.la=true; door.off=true; arcTone(220+power*300,.18,'sawtooth',.08); sfx('launch',power); power=0; };
  const closest=(x,y,a,b,c,d)=>{ const dx=c-a, dy=d-b, l2=dx*dx+dy*dy, tt=Math.max(0,Math.min(1,((x-a)*dx+(y-b)*dy)/(l2||1))); return [a+dx*tt,b+dy*tt,tt]; };
  const radarAdd=n=>{ radar=Math.min(NEED,radar+n); arcTone(760+radar*120,.08,'triangle',.07); if(radar>=NEED&&!mode) startChasse(); };
  function startChasse(){ radar=0; const arc=Math.random()<pbPerk.arcP(LV); let r=pbRoll(LV); if(arc) r=Math.max(3,r); let ui=-1, slot, ic; if(arc){ ui=PB_UN0+rint(0,UNIQ.length-PB_UN0-1); slot=MODI[UNIQ[ui].t][1]; } else slot=SLOTS[rint(0,SLOTS.length-1)][0]; ic=SLOTS.find(s=>s[0]===slot)[2];
    Object.assign(part,{on:true,hp:2+Math.round(r*1.3),r_:r,arc,ui,slot,ic,hit:0,cool:0,x:rnd(70,260),y:rnd(120,330),vx:0,vy:0,wt:0,dash:0,tr:[]}); part.max=part.hp; mode='chasse'; chT=40; say('🔎 CHASSE !'); arcTone(1100,.2,'triangle',.1); sfx('chasse'); arcTone(1500,.25,'triangle',.08); }
  function endChasse(ok){ part.on=false; mode=null; if(!ok){ say('LA PIÈCE S’ENFUIT…'); arcTone(150,.35,'sawtooth',.08); } }
  function capture(){ const g=pbGrant(part.r_,part.arc); P.caps++; caps.push({name:g.name,r:g.r,arc:!!g.arc,dup:!!g.dup,full:!!g.full,u:(g.m&&!g.full)?g.m.u:null}); add(5000+1000*part.r_); P.bestC=Math.max(P.bestC,caps.length); burst(part.x,part.y,RAR[part.r_].c,50); say((g.dup?'★ AMÉLIORÉE : ':'CAPTURÉ : ')+g.name); PM.fx('capture'); shake=1; endChasse(true); save_(); }
  const save_=()=>{ try{ save(); }catch(_){} };
  const mission=b=>{ const pool=[['jack',30],['radar',25],['save',20],['turbo',15]]; if(balls.length===1) pool.push(['multi',12]); let x=Math.random()*pool.reduce((a,p)=>a+p[1],0), k='jack'; for(const p of pool){ x-=p[1]; if(x<0){ k=p[0]; break; } }
    if(k==='jack'){ add(5000); say('JACKPOT +5 000'); sfx('jackpot'); } else if(k==='radar'){ say('RADAR +2'); radarAdd(2); } else if(k==='save'){ save=Math.max(save,12); say('BALL SAVE 12 s'); } else if(k==='turbo'){ turbo=14; turboG=0; say('TURBO !!'); sfx('turbo'); } else { mbSave=22; say('MULTIBILLE !'); sfx('multi'); for(let i=0;i<2;i++) balls.push({x:sauc.x,y:sauc.y,vx:-120-i*160,vy:-380-i*60,st:'play',trail:[],la:false,ht:0,stuck:0}); }
    arcTone(900,.2,'square',.09); };
  const lose=()=>{ if(over) return; if(save>0&&!usedSave){ usedSave=true; say('BALL SAVE !'); sfx('save'); const nb=mkb(); balls=[nb]; door.off=true; arcTone(660,.2,'triangle'); return; } PM.fx('drain'); { const bon=Math.round(ballBumps*20*mult); if(bon){ score+=bon; say('BONUS +'+fmt(bon)); } ballBumps=0; } ball++; mult=1; tgt.forEach(q=>q.on=0); if(ball>N){ finish(); } else { resetBall(); say('BILLE '+ball); } };
  const finish=()=>{ if(over) return; over=true; if(mode) endChasse(false); PM.fx('over'); setTimeout(()=>{ const note=rewards(); api.end(score,note); },700); };
  function rewards(){ const out=[]; const gain=Math.floor(score/25)+caps.reduce((a,c)=>a+(c.r+1)*120,0); P.xp+=gain; P.runs++; let up=0; while(P.lv<PB_MAXLV&&P.xp>=pbNeed(P.lv)){ P.xp-=pbNeed(P.lv); P.lv++; up++; }
    out.push(`<b>+${fmt(gain)} XP</b> · niveau ${P.lv}${P.lv>=PB_MAXLV?' (max)':` · ${fmt(P.xp)}/${fmt(pbNeed(P.lv))}`}`); if(up) out.push(`<span class="pbup">⬆ NIVEAU ${P.lv} !</span>`);
    { const ns=Object.keys(seen).length; if(ns>1) out.push(`<span>🕳 Tables visitées : ${ns}/${TBL.length}</span>`); }
    const palC=[];
    PB_PAL.forEach(p=>{ if(score>=p.s&&!P.pal[p.s]){ P.pal[p.s]=1; if(p.t==='car'){ S.cars.push({uid:S.nuid++,mid:'arcgt',etat:100,xp:0,lvl:1,up:{},inv:0,mods:{},sh:1}); out.push(`<span class="pbpal">🏆 PALIER ${fmt(p.s)} : ${p.n} débloquée !</span>`); } else { const g=pbGrant(p.r,p.t==='arc'); out.push(`<span class="pbpal">🏆 PALIER ${fmt(p.s)} : ${g.name}</span>`); palC.push({name:g.name,r:g.r,arc:!!g.arc,dup:!!g.dup,full:!!g.full,u:(g.m&&!g.full)?g.m.u:null,pal:1}); } } });
    { const all=caps.concat(palC); if(all.length) out.push(pbRecap(all)); }
    save_(); return out.join(''); }
  function rampDone(r){ r.n++; rampN++; rampT=7; rampMax=Math.max(rampMax,rampN); const pts=r.pts*Math.min(5,rampN); add(pts); hitC(r.p[r.p.length-1][0],r.p[r.p.length-1][1],pts); say(rampN>1?'ENCHAÎNEMENT ×'+rampN+' !':r.nm+' +'+fmt(Math.round(pts*mult))); arcTone(800+rampN*120,.18,'triangle',.1); sfx('rampend',rampN); burst(r.p[r.p.length-1][0],r.p[r.p.length-1][1],r.col,12); if(rampN%2===0) radarAdd(1); if(rampN>=3&&rampN%3===0&&!mode){ mission(null); } }
  function stepBall(b,h){
    if(b.st==='hold'){ b.ht-=h; b.x=sauc.x; b.y=sauc.y; if(b.ht<=0){ sfx('eject'); mission(b); b.st='play'; b.vx=-250; b.vy=-440; sauc.cool=.9; } return; }
    if(b.st==='warp'){ b.wt-=h; b.x+=(hole.x-b.x)*Math.min(1,h*10); b.y+=(hole.y-b.y)*Math.min(1,h*10); if(b.wt<=0) switchTable(b); return; }
    if(b.st==='ramp'){ const r=ramps[b.rp]; if(!r){ b.st='play'; return; } b.rs+=b.rsp*h; const e=b.rs>=r.len; const L=e?r.len:b.rs; let i=1; while(i<r.cum.length-1&&r.cum[i]<L) i++; const a=r.p[i-1], c=r.p[i], sl=(r.cum[i]-r.cum[i-1])||1, u=Math.max(0,Math.min(1,(L-r.cum[i-1])/sl)); b.x=a[0]+(c[0]-a[0])*u; b.y=a[1]+(c[1]-a[1])*u;
      if(e){ b.x=sauc.x; b.y=sauc.y; b.vx=b.vy=0; b.st='hold'; b.ht=1.1; b.la=false; b.trail.length=0; sauc.glow=1; sauc.cool=1.2; r.cd=.5; add(200); arcTone(300,.15,'square',.08); sfx('kick'); rampDone(r); }
      else{ b.trail.push([b.x,b.y]); if(b.trail.length>9) b.trail.shift(); } return; }
    if(b.st!=='play') return;
    b.vy+=G*h; b.x+=b.vx*h; b.y+=b.vy*h; const sp=Math.hypot(b.vx,b.vy); if(sp>1300){ b.vx*=1300/sp; b.vy*=1300/sp; }
    if(b.la&&b.y<160){ b.la=false; door.off=false; }
    for(const s of segs){ if(s.off) continue; const [cx,cy]=closest(b.x,b.y,s.x1,s.y1,s.x2,s.y2); let dx=b.x-cx, dy=b.y-cy, d=Math.hypot(dx,dy); if(d<R){ if(d<1e-4){ dx=0; dy=-1; d=1; } const nx=dx/d, ny=dy/d; b.x=cx+nx*R; b.y=cy+ny*R; const vn=b.vx*nx+b.vy*ny; if(vn<0){ b.vx-=(1+s.e)*vn*nx; b.vy-=(1+s.e)*vn*ny; if(s.k){ b.vx+=nx*s.k*.55; b.vy+=ny*s.k*.55; s.hit=1; add(10); arcTone(520,.06,'square',.06); sfx('sling'); } if(s.dr){ s.off=true; add(150); hitC(cx,cy,150); arcTone(420,.08,'square',.08); sfx('drop'); const B=s.bk; if(B.ss.every(q=>q.off)){ B.rt=2.2; add(1500); say('BANQUE ABATTUE +1 500'); radarAdd(1); PM.fx('nice'); burst(cx,cy,TH.a,18); } } } } }
    for(const r of ramps){ if(r.cd>0) continue; const dx=b.x-r.mx, dy=b.y-r.my; if(dx*dx+dy*dy<r.mr*r.mr){ const sp0=Math.hypot(b.vx,b.vy)||1, dot=b.vx*r.ux+b.vy*r.uy; if(dot>r.min&&dot/sp0>r.cs){ b.st='ramp'; b.rp=r.k; b.rs=0; b.rsp=Math.max(430,Math.min(780,Math.hypot(b.vx,b.vy)*.8)); b.vx=b.vy=0; r.cd=.6; r.glow=1; arcTone(640,.14,'sawtooth',.08); sfx('ramp'); return; } } }
    for(const q of bumps){ const dx=b.x-q.x, dy=b.y-q.y, d=Math.hypot(dx,dy), m=R+q.r; if(d<m){ const nx=d?dx/d:0, ny=d?dy/d:-1; b.x=q.x+nx*m; b.y=q.y+ny*m; const vn=b.vx*nx+b.vy*ny; if(vn<0){ b.vx-=2*vn*nx; b.vy-=2*vn*ny; } const s2=Math.hypot(b.vx,b.vy), k=Math.max(s2,turbo>0?680:520); b.vx=b.vx/(s2||1)*k+nx*80; b.vy=b.vy/(s2||1)*k+ny*80; q.hit=1; add(100*(turbo>0?3:1)); ballBumps++; hitC(q.x,q.y,100*(turbo>0?3:1)); bumpN++; if(turbo<=0){ turboG++; if(turboG>=25){ turbo=14; turboG=0; say('TURBO !!'); arcTone(1200,.2,'sawtooth',.09); sfx('turbo'); } } if(bumpN%20===0) radarAdd(1); arcTone(700+Math.random()*300,.09,'square',.08); sfx('bump',bumps.indexOf(q)); } }
    for(const p of posts){ const dx=b.x-p.x, dy=b.y-p.y, d=Math.hypot(dx,dy), m=R+p.r; if(d<m){ const nx=d?dx/d:0, ny=d?dy/d:-1; b.x=p.x+nx*m; b.y=p.y+ny*m; const vn=b.vx*nx+b.vy*ny; if(vn<0){ b.vx-=1.7*vn*nx; b.vy-=1.7*vn*ny; add(5); } } }
    for(const g of tgt){ const dx=b.x-g.x, dy=b.y-g.y, d=Math.hypot(dx,dy), m=R+g.r; if(d<m){ const nx=d?dx/d:1, ny=d?dy/d:0; b.x=g.x+nx*m; b.y=g.y+ny*m; const vn=b.vx*nx+b.vy*ny; if(vn<0){ b.vx-=1.5*vn*nx; b.vy-=1.5*vn*ny; } hitC(g.x,g.y,0); if(!g.on){ g.on=1; add(50); arcTone(880,.07,'triangle',.08); sfx('tgt'); if(tgt.every(q=>q.on)){ tgt.forEach(q=>q.on=0); mult=Math.min(5,mult+1); add(500); say('MULTI ×'+mult+' !'); arcTone(1320,.25,'triangle',.1); radarAdd(1); } } } }
    for(const l of lanes){ if(!l.on&&Math.hypot(b.x-l.x,b.y-l.y)<11){ l.on=1; add(30); arcTone(990,.05,'sine',.07); sfx('lane'); if(lanes.every(q=>q.on)){ lanes.forEach(q=>q.on=0); add(300); say('RADAR +1'); radarAdd(1); } } }
    if(sauc.cool<=0){ const sx=sauc.x-b.x, sy=sauc.y-b.y, sd=Math.hypot(sx,sy), spd=Math.hypot(b.vx,b.vy);
      if(sd<sauc.r*2.7&&sd>.5){ const pull=(1-sd/(sauc.r*2.7))*900*h; b.vx+=sx/sd*pull; b.vy+=sy/sd*pull; if(sd<sauc.r*1.5){ const f=Math.pow(.95,h*60); b.vx*=f; b.vy*=f; } }
      if(sd<sauc.r*1.15&&spd<780){ b.st='hold'; b.ht=1.1; b.vx=b.vy=0; sauc.glow=1; add(200); arcTone(300,.15,'square',.08); sfx('kick'); radarAdd(1); return; } }
    if(part.on){ const dx=b.x-part.x, dy=b.y-part.y, d=Math.hypot(dx,dy), m=R+part.r; if(d<m){ const nx=d?dx/d:0, ny=d?dy/d:-1; b.x=part.x+nx*m; b.y=part.y+ny*m; const vn=b.vx*nx+b.vy*ny; if(vn<0){ b.vx-=2*vn*nx; b.vy-=2*vn*ny; } const s2=Math.hypot(b.vx,b.vy), k=Math.max(s2,460); b.vx=b.vx/(s2||1)*k; b.vy=b.vy/(s2||1)*k;
        if(part.cool<=0){ part.cool=.18; part.hp--; part.hit=1; part.tx=Math.max(50,Math.min(280,part.x-nx*170)); part.ty=Math.max(95,Math.min(400,part.y-ny*170)); part.wt=1.4; part.dash=.4; add(300); hitC(part.x,part.y,300); shake=Math.max(shake,.4); arcTone(500+(part.max-part.hp)*90,.1,'square',.09); sfx('parthit',part.hp); burst(part.x,part.y,RAR[part.r_].c,8); if(part.hp<=0) capture(); } } }
    for(const w of wells){ const dx=w.x-b.x, dy=w.y-b.y, d=Math.hypot(dx,dy); if(d<w.r&&d>3){ const f=w.k*(1-d/w.r)*h; b.vx+=dx/d*f+(-dy/d)*f*.45; b.vy+=dy/d*f+(dx/d)*f*.45; } }
    for(const s of spins){ if(Math.hypot(b.x-s.x,b.y-s.y)<s.r&&s.cd<=0){ s.cd=.1; s.n++; add(15); sfx('spin'); if(s.n%3===0) arcTone(1000+s.n%12*60,.04,'square',.04); if(s.n%25===0){ radarAdd(1); hitC(s.x,s.y,0); } } }
    for(const q of boosts){ if(q.cd<=0&&Math.hypot(b.x-q.x,b.y-q.y)<q.r){ q.cd=.4; q.glow=1; const sp=Math.max(Math.hypot(b.vx,b.vy),780); b.vx=q.dx*sp; b.vy=q.dy*sp; add(40); hitC(q.x,q.y,40); arcTone(1100,.1,'sawtooth',.07); sfx('boost'); } }
    for(const p of portals){ if(p.cd<=0&&Math.hypot(b.x-p.x,b.y-p.y)<p.r){ const o=portals[p.k^1]; if(o){ const sp=Math.hypot(b.vx,b.vy)||1; p.cd=o.cd=.7; b.x=o.x+b.vx/sp*(o.r+R+2); b.y=o.y+b.vy/sp*(o.r+R+2); add(150); hitC(o.x,o.y,150); burst(p.x,p.y,'#4aa8ff',10); burst(o.x,o.y,'#ff9a1a',10); arcTone(1300,.12,'sine',.09); sfx('portal'); if(Math.random()<.5) radarAdd(1); } } }
    { const dx=b.x-hole.x, dy=b.y-hole.y, d=Math.hypot(dx,dy);
      if(hole.open&&hole.cool<=0){
        /* aimant léger, comme un vrai trou de flipper : légère attraction autour du trou et petit freinage sur le bord */
        const MR=hole.r*2.9; if(d<MR&&d>.5){ const pull=(1-d/MR)*1250*h; b.vx-=dx/d*pull; b.vy-=dy/d*pull; if(d<hole.r*1.4){ const f=Math.pow(.94,h*60); b.vx*=f; b.vy*=f; } }
        if(d<hole.r*.85||(d<hole.r*1.08&&Math.hypot(b.vx,b.vy)<780)){ b.st='warp'; b.wt=.9; b.vx=b.vy=0; arcTone(200,.5,'sine',.1); sfx('warp'); return; } }
      }
    for(let i=0;i<2;i++){ const f=FL[i], [tx,ty]=tip(f); const [cx,cy,tt]=closest(b.x,b.y,f.px,f.py,tx,ty); let dx=b.x-cx, dy=b.y-cy, d=Math.hypot(dx,dy); const m=R+6; if(d<m){ if(d<1e-4){ dx=0; dy=-1; d=1; } const nx=dx/d, ny=dy/d, s=tt*f.L, cvx=(f.s>0?-Math.sin(f.th):Math.sin(f.th))*s*f.w, cvy=Math.cos(f.th)*s*f.w; b.x=cx+nx*m; b.y=cy+ny*m; const rel=(b.vx-cvx)*nx+(b.vy-cvy)*ny; if(rel<0){ b.vx-=1.32*rel*nx; b.vy-=1.32*rel*ny; } } }
    if(b.x>319&&b.y>560&&b.vy>=0&&Math.hypot(b.vx,b.vy)<400){ if(balls.length===1||!balls.some(o=>o.st==='plunger')){ b.x=333; b.y=572; b.vx=b.vy=0; b.st='plunger'; power=0; door.off=true; } else b.dead=1; return; }
    if(b.y>H+24){ b.dead=1; return; } if(b.x<-20||b.x>W+20||b.y<-30){ if(balls.length>1) b.dead=1; else { b.x=180; b.y=120; b.vx=0; b.vy=0; } return; }
    if(Math.hypot(b.vx,b.vy)<14&&b.y<620){ b.stuck+=h; if(b.stuck>2.2){ b.vx=(Math.random()<.5?-1:1)*140; b.vy=-180; b.stuck=0; } } else b.stuck=0;
    b.trail.push([b.x,b.y]); if(b.trail.length>7) b.trail.shift(); }
  function phys(h){
    if(over) return;
    if(tiltT>0){ tiltT-=h; FL.forEach(f=>f.on=false); }
    FL.forEach(f=>{ const tg=f.on?f.act:f.rest, d=tg-f.th, sp=(f.on?22:12)*h, step=Math.abs(d)<sp?d:Math.sign(d)*sp; f.th+=step; f.w=step/h; });
    if(charging&&balls.some(b=>b.st==='plunger')){ power=Math.min(1,power+h*1.1); sfx('charge',power); }
    if(balls.some(b=>b.st==='play'||b.st==='ramp')){ if(save>0) save-=h; if(turbo>0){ turbo-=h; if(turbo<=0) say('Turbo terminé'); } if(mode==='chasse'){ chT-=h; if(chT<=0) endChasse(false); } if(mbSave>0) mbSave-=h; }
    if(sauc.cool>0) sauc.cool-=h; if(part.cool>0) part.cool-=h;
    updMovers(h); for(const b of balls) stepBall(b,h);
    if(balls.some(b=>b.dead)){ const before=balls.length; balls=balls.filter(b=>!b.dead); if(mbSave>0&&balls.length&&balls.length<before&&!balls.some(b=>b.st==='plunger')){ /* multibille : pas de pénalité tant qu’il reste une bille */ } if(!balls.length) lose(); }
  }

  const STARS=Array.from({length:40},(_,i)=>[(i*97%340)+10,(i*61%520)+20,(i%5)+1]);
  const deco=()=>{ ctx.save(); ctx.lineWidth=2; ctx.strokeStyle=T.bg; ctx.fillStyle=T.bg; const i=tabI;
    if(i===1){ ctx.globalAlpha=.12; for(let k=1;k<=5;k++){ ctx.beginPath(); ctx.arc(180,330,k*58+(t*18)%58,Math.PI,0); ctx.stroke(); } }
    else if(i===2){ ctx.globalAlpha=.16; ctx.setLineDash([16,14]); ctx.lineDashOffset=-t*60; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(40,130); ctx.bezierCurveTo(300,120,40,260,240,300); ctx.bezierCurveTo(300,320,120,380,150,420); ctx.stroke(); }
    else if(i===3){ ctx.globalAlpha=.1; [[90,430,60,1],[250,470,44,-1]].forEach(g=>{ ctx.save(); ctx.translate(g[0],g[1]); ctx.rotate(t*.4*g[3]); ctx.beginPath(); for(let k=0;k<16;k++){ const a=k/16*6.283, r=k%2?g[2]:g[2]+10; ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); } ctx.closePath(); ctx.fill(); ctx.restore(); }); }
    else if(i===4){ ctx.globalAlpha=.13; for(let k=0;k<6;k++){ const p=((k+t*.5)%6)/6, w=40+p*150, hh=60+p*210; ctx.strokeRect(180-w,300-hh,w*2,hh*2); } }
    else if(i===5){ STARS.forEach((s,k)=>{ ctx.globalAlpha=.2+.25*Math.abs(Math.sin(t*1.3+k)); ctx.fillRect(s[0],s[1],s[2],s[2]); }); }
    ctx.restore(); };
  const drawNew=()=>{ ctx.save(); ctx.shadowBlur=0;
    wells.forEach(w=>{ const g=ctx.createRadialGradient(w.x,w.y,2,w.x,w.y,w.r); g.addColorStop(0,'rgba(143,107,255,.55)'); g.addColorStop(1,'rgba(143,107,255,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(w.x,w.y,w.r,0,7); ctx.fill(); ctx.strokeStyle='rgba(200,170,255,.7)'; ctx.lineWidth=2; for(let k=0;k<3;k++){ ctx.beginPath(); ctx.arc(w.x,w.y,10+k*13,t*3+k,t*3+k+3.2); ctx.stroke(); } });
    boosts.forEach(q=>{ ctx.save(); ctx.translate(q.x,q.y); ctx.rotate(Math.atan2(q.dy,q.dx)+Math.PI/2); ctx.strokeStyle=q.glow>0?'#fff':'#3cff9e'; ctx.shadowColor='#3cff9e'; ctx.shadowBlur=8+q.glow*14; ctx.lineWidth=3; for(let k=0;k<3;k++){ ctx.globalAlpha=.4+.6*((Math.floor(t*6)%3)===k?1:.3); ctx.beginPath(); ctx.moveTo(-9,6-k*8); ctx.lineTo(0,-2-k*8); ctx.lineTo(9,6-k*8); ctx.stroke(); } ctx.restore(); });
    portals.forEach(p=>{ const c=p.k?'#ff9a1a':'#4aa8ff'; ctx.strokeStyle=c; ctx.shadowColor=c; ctx.shadowBlur=14; ctx.lineWidth=3; ctx.setLineDash([6,5]); ctx.lineDashOffset=-t*30*(p.k?-1:1); ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle=c; ctx.globalAlpha=.25; ctx.beginPath(); ctx.arc(p.x,p.y,p.r-3,0,7); ctx.fill(); ctx.globalAlpha=1; });
    spins.forEach(s=>{ ctx.strokeStyle='#ffd400'; ctx.shadowColor='#ffd400'; ctx.shadowBlur=8; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(s.x-Math.cos(s.ang)*s.r,s.y-Math.sin(s.ang)*s.r*.35); ctx.lineTo(s.x+Math.cos(s.ang)*s.r,s.y+Math.sin(s.ang)*s.r*.35); ctx.stroke(); });
    mills.forEach(m=>{ ctx.strokeStyle=TH.b; ctx.shadowColor=TH.b; ctx.shadowBlur=12; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(m.s.x1,m.s.y1); ctx.lineTo(m.s.x2,m.s.y2); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(m.x,m.y,5,0,7); ctx.fill(); });
    segs.forEach(s=>{ if(!s.tb||s.mill||s.dr) return; ctx.strokeStyle=TH.a; ctx.shadowColor=TH.a; ctx.shadowBlur=10; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke(); });
    segs.forEach(s=>{ if(!s.dr) return; ctx.shadowColor='#ff9a1a'; ctx.shadowBlur=s.off?0:10; ctx.strokeStyle=s.off?'rgba(255,154,26,.25)':'#ff9a1a'; ctx.lineWidth=s.off?2:7; ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke(); });
    { const o=hole.open, c=o?'#00e5ff':'#ff2d2d'; ctx.shadowColor=c; ctx.shadowBlur=o?18:8; ctx.fillStyle=o?'#02060c':'#240608'; ctx.beginPath(); ctx.arc(hole.x,hole.y,hole.r,0,7); ctx.fill(); ctx.strokeStyle=c; ctx.lineWidth=3; ctx.stroke();
      if(o){ ctx.lineWidth=2; for(let k=0;k<3;k++){ ctx.beginPath(); ctx.arc(hole.x,hole.y,4+k*3.5,hole.sp+k*2,hole.sp+k*2+3.6); ctx.stroke(); } ctx.shadowBlur=0; ctx.fillStyle='#00e5ff'; ctx.font='700 8px system-ui'; ctx.textAlign='center'; ctx.fillText('▶ '+TBL[(tabI+1)%tabsOpen()].n,hole.x,hole.y+hole.r+11); }
      else{ ctx.beginPath(); ctx.moveTo(hole.x-7,hole.y-7); ctx.lineTo(hole.x+7,hole.y+7); ctx.moveTo(hole.x+7,hole.y-7); ctx.lineTo(hole.x-7,hole.y+7); ctx.stroke(); ctx.shadowBlur=0; ctx.fillStyle='#ff6b6b'; ctx.font='700 8px system-ui'; ctx.textAlign='center'; ctx.fillText(tabsOpen()<2?'niv. '+PB_TB_LV[1]:'FERMÉ',hole.x,hole.y+hole.r+11); } }
    ctx.restore(); };
  const draw=()=>{ if(R3){ draw3(); return; } ctx.setTransform(K,0,0,K,0,0); if(shake>0){ ctx.translate((Math.random()-.5)*shake*7,(Math.random()-.5)*shake*7); shake=Math.max(0,shake-.07); } const gr=ctx.createLinearGradient(0,0,0,H); gr.addColorStop(0,turbo>0?'#2a0a2a':TH.bg[0]); gr.addColorStop(1,TH.bg[1]); ctx.fillStyle=gr; ctx.fillRect(0,0,W,H); 
    ctx.strokeStyle=TH.grid; ctx.lineWidth=1; for(let x=0;x<W;x+=30){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); } for(let y=0;y<H;y+=30){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.fillStyle='rgba(255,212,0,.07)'; ctx.font='900 54px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillStyle=T.bg; ctx.globalAlpha=.07; ctx.fillText(T.ic+' '+T.n.split(' ')[0],180,440); ctx.fillText(T.n.split(' ').slice(1).join(' ')||'',180,494); ctx.globalAlpha=1; deco();
    ctx.lineCap='round'; ctx.lineJoin='round'; ctx.shadowBlur=10; ctx.shadowColor=TH.a; ctx.strokeStyle=TH.a; ctx.lineWidth=4; segs.forEach(s=>{ if(s.k||s.door) return; ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke(); });
    ctx.shadowColor=door.off?'#3cff9e':'#ff2d2d'; ctx.strokeStyle=door.off?'#3cff9e':'#ff2d2d'; ctx.lineWidth=door.off?2:5; ctx.globalAlpha=door.off?.55:1; ctx.beginPath(); ctx.moveTo(door.x1,door.y1); ctx.lineTo(door.x2,door.y2); ctx.stroke(); ctx.globalAlpha=1;
    ctx.shadowColor=TH.b; ctx.strokeStyle=TH.b; ctx.lineWidth=6; [slL,slR].forEach(s=>{ ctx.globalAlpha=.6+.4*s.hit; ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke(); s.hit=Math.max(0,s.hit-.12); }); ctx.globalAlpha=1;
    bumps.forEach((b,i)=>{ const c=turbo>0?TH.b:TH.c[i%TH.c.length]; ctx.shadowColor=c; ctx.shadowBlur=14+b.hit*16; ctx.fillStyle='#14082a'; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,7); ctx.fill(); ctx.strokeStyle=c; ctx.lineWidth=4; ctx.stroke(); ctx.fillStyle=c; ctx.globalAlpha=.35+.65*b.hit; ctx.beginPath(); ctx.arc(b.x,b.y,b.r-6,0,7); ctx.fill(); ctx.globalAlpha=1; b.hit=Math.max(0,b.hit-.08); });
    drawNew(); ctx.shadowBlur=0; posts.forEach(p=>{ ctx.fillStyle='#cfd6ff'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill(); });
    tgt.forEach(g=>{ ctx.shadowColor='#3cff9e'; ctx.shadowBlur=g.on?14:0; ctx.fillStyle=g.on?'#3cff9e':'#1a3a2c'; ctx.beginPath(); ctx.arc(g.x,g.y,g.r,0,7); ctx.fill(); ctx.strokeStyle='#3cff9e'; ctx.lineWidth=2; ctx.stroke(); });
    lanes.forEach(l=>{ ctx.shadowColor='#ffd400'; ctx.shadowBlur=l.on?12:0; ctx.fillStyle=l.on?'#ffd400':'#3a3210'; ctx.beginPath(); ctx.arc(l.x,l.y,7,0,7); ctx.fill(); });
    ctx.shadowColor='#00e5ff'; ctx.shadowBlur=10+sauc.glow*14; ctx.fillStyle='#04121a'; ctx.beginPath(); ctx.arc(sauc.x,sauc.y,sauc.r+2,0,7); ctx.fill(); ctx.strokeStyle='#00e5ff'; ctx.lineWidth=3; ctx.stroke(); ctx.shadowBlur=0; ctx.fillStyle='#00e5ff'; ctx.font='700 8px system-ui'; ctx.fillText('GARAGE',sauc.x,sauc.y+25); sauc.glow=Math.max(0,sauc.glow-.03);
    if(part.on){ part.tr.forEach((q,i)=>{ ctx.globalAlpha=(i+1)/part.tr.length*.18; ctx.fillStyle=RAR[part.r_].c; ctx.beginPath(); ctx.arc(q[0],q[1],part.r*.8,0,7); ctx.fill(); }); ctx.globalAlpha=1; const c=RAR[part.r_].c, pulse=.6+.4*Math.sin(t*6); ctx.shadowColor=c; ctx.shadowBlur=18+part.hit*18; ctx.fillStyle='#10081f'; ctx.beginPath(); ctx.arc(part.x,part.y,part.r,0,7); ctx.fill(); ctx.strokeStyle=c; ctx.lineWidth=3; ctx.globalAlpha=pulse; ctx.stroke(); ctx.globalAlpha=1;
      ctx.lineWidth=4; ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.arc(part.x,part.y,part.r+5,-Math.PI/2,-Math.PI/2+6.283*part.hp/part.max); ctx.stroke();
      ctx.shadowBlur=0; ctx.fillStyle=c; ctx.globalAlpha=.22; ctx.beginPath(); ctx.arc(part.x,part.y,part.r-3,0,7); ctx.fill(); ctx.globalAlpha=1; ctx.font='26px serif'; ctx.textBaseline='middle'; try{ ctx.filter='brightness(0) invert(1)'; }catch(_){} ctx.fillText(part.ic,part.x,part.y+1); try{ ctx.filter='none'; }catch(_){} ctx.textBaseline='alphabetic'; part.hit=Math.max(0,part.hit-.07); }
    ctx.shadowBlur=0; if(balls.some(b=>b.st==='plunger')){ ctx.fillStyle='rgba(255,255,255,.14)'; ctx.fillRect(341,500,5,95); ctx.fillStyle='rgba(60,255,158,.75)'; ctx.fillRect(341,500+95*.05,5,95*.15); ctx.fillStyle=power>=.8&&power<=.95?'#3cff9e':TH.b; ctx.fillRect(341,595-95*power,5,95*power); } ctx.fillStyle='#2a1a4a'; ctx.fillRect(320,596-70*(1-power*.55)+0,26,4); ctx.fillStyle='#ffd400'; ctx.fillRect(330,568+power*22,6,30); ctx.fillStyle=`rgba(255,43,214,${.3+power*.7})`; ctx.fillRect(322,598,22,4);
    FL.forEach(f=>{ const [tx,ty]=tip(f); ctx.shadowColor='#ffd400'; ctx.shadowBlur=f.on?16:6; const g=ctx.createLinearGradient(f.px,f.py,tx,ty); g.addColorStop(0,'#ff2d2d'); g.addColorStop(.5,'#ffd400'); g.addColorStop(1,'#1fe06a'); ctx.strokeStyle=g; ctx.lineWidth=13; ctx.beginPath(); ctx.moveTo(f.px,f.py); ctx.lineTo(tx,ty); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(f.px,f.py,4,0,7); ctx.fill(); });
    const drawRamps=()=>{ ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ramps.forEach(r=>{ const P=r.p, path=()=>{ ctx.beginPath(); ctx.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length;i++) ctx.lineTo(P[i][0],P[i][1]); };
        ctx.shadowBlur=0; ctx.save(); ctx.translate(3,7); path(); ctx.strokeStyle='rgba(0,0,0,.38)'; ctx.lineWidth=18; ctx.stroke(); ctx.restore();
        ctx.shadowColor=r.col; ctx.shadowBlur=8+r.glow*16; path(); ctx.strokeStyle=r.col; ctx.lineWidth=18; ctx.stroke(); ctx.shadowBlur=0; path(); ctx.strokeStyle='#080b20'; ctx.lineWidth=13; ctx.stroke();
        ctx.setLineDash([7,11]); ctx.lineDashOffset=-t*46; path(); ctx.strokeStyle=r.col; ctx.globalAlpha=.4; ctx.lineWidth=2.5; ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1;
        ctx.save(); ctx.translate(r.mx,r.my); ctx.rotate(Math.atan2(r.uy,r.ux)); ctx.fillStyle=r.col; ctx.globalAlpha=.5+.5*r.glow; ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(-5,-8); ctx.lineTo(-2,0); ctx.lineTo(-5,8); ctx.closePath(); ctx.fill(); ctx.restore(); }); ctx.restore(); };
    const drawBall=b=>{ if(b.st==='hold') return; b.trail.forEach((p,i)=>{ ctx.globalAlpha=i/b.trail.length*.35; ctx.fillStyle='#8fe9ff'; ctx.beginPath(); ctx.arc(p[0],p[1],R*(i/b.trail.length),0,7); ctx.fill(); }); ctx.globalAlpha=1;
      ctx.shadowColor='#8fe9ff'; ctx.shadowBlur=14; const rg=ctx.createRadialGradient(b.x-2,b.y-2,1,b.x,b.y,R); rg.addColorStop(0,'#fff'); rg.addColorStop(1,'#6ad6ff'); ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(b.x,b.y,b.st==='warp'?R*Math.max(.1,b.wt/.9):b.st==='ramp'?R*1.2:R,0,7); ctx.fill(); ctx.shadowBlur=0; };
    balls.forEach(b=>{ if(b.st!=='ramp') drawBall(b); }); drawRamps(); balls.forEach(b=>{ if(b.st==='ramp') drawBall(b); });
    fx.forEach(p=>{ ctx.globalAlpha=Math.max(0,p.l*2); ctx.fillStyle=p.c; ctx.fillRect(p.x-2,p.y-2,4,4); }); ctx.globalAlpha=1;
    ctx.font='800 13px system-ui'; ctx.textAlign='center'; pops.forEach(p=>{ ctx.globalAlpha=Math.max(0,Math.min(1,p.l*1.6)); ctx.fillStyle=p.c; ctx.fillText(p.t,p.x,p.y); }); ctx.globalAlpha=1;
    if(combo>=3&&comboT>0){ ctx.globalAlpha=Math.min(1,comboT*1.5); ctx.fillStyle=TH.b; ctx.font='900 20px system-ui'; ctx.textAlign='right'; ctx.fillText('COMBO ×'+combo,306,40); ctx.globalAlpha=1; }
    if(save>0&&balls.some(b=>b.st==='play')){ ctx.fillStyle='rgba(255,212,0,.8)'; ctx.font='700 11px system-ui'; ctx.textAlign='center'; ctx.fillText('BALL SAVE '+Math.ceil(save),180,590); }
    if(msgT>0){ ctx.globalAlpha=Math.min(1,msgT*2); ctx.fillStyle='#fff'; ctx.shadowColor='#ff2bd6'; ctx.shadowBlur=18; ctx.font='900 24px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillText(msg,180,400); ctx.globalAlpha=1; ctx.shadowBlur=0; } };
  /* surcouche 2D au-dessus de la 3D : étincelles, points qui montent, combo, messages, jauge du piston, légende du trou */
  const draw3=()=>{ R3.render(shake); ctx.setTransform(K,0,0,K,0,0); ctx.clearRect(0,0,OW,OH);
    bumps.forEach(b=>{ b.hit=Math.max(0,b.hit-.08); }); [slL,slR].forEach(s=>{ s.hit=Math.max(0,s.hit-.12); }); part.hit=Math.max(0,part.hit-.07); sauc.glow=Math.max(0,sauc.glow-.03); if(shake>0) shake=Math.max(0,shake-.07);
    const ps=Math.max(.8,Math.min(1.5,OW/412)); ctx.textAlign='center'; ctx.lineCap='round';
    fx.forEach(p=>{ const q=R3.proj(p.x,p.y,10); ctx.globalAlpha=Math.max(0,p.l*2); ctx.fillStyle=p.c; ctx.fillRect(q[0]-2,q[1]-2,4,4); }); ctx.globalAlpha=1;
    { const o=hole.open, q=R3.proj(hole.x,hole.y+hole.r+11,0); ctx.fillStyle=o?'#00e5ff':'#ff6b6b'; ctx.font='700 '+Math.round(8*q[2]*1.05+2)+'px system-ui'; ctx.fillText(o?'▶ '+TBL[(tabI+1)%tabsOpen()].n:(tabsOpen()<2?'niv. '+PB_TB_LV[1]:'FERMÉ'),q[0],q[1]); }
    if(balls.some(b=>b.st==='plunger')){ const a=R3.proj(341,595,0), b2=R3.proj(341,500,0), x0=a[0]+12*a[2], hh=a[1]-b2[1];
      ctx.fillStyle='rgba(255,255,255,.14)'; ctx.fillRect(x0,b2[1],6,hh); ctx.fillStyle='rgba(60,255,158,.75)'; ctx.fillRect(x0,a[1]-hh*.2,6,hh*.15);
      ctx.fillStyle=power>=.8&&power<=.95?'#3cff9e':TH.b; ctx.fillRect(x0,a[1]-hh*power,6,hh*power);
      if(!charging&&!over){ ctx.globalAlpha=.55+.35*Math.sin(t*5); ctx.fillStyle='#fff'; ctx.font='800 '+Math.round(12*ps)+'px system-ui'; ctx.textAlign='right'; ctx.fillText('MAINTIENS À DROITE POUR LANCER',OW-16,OH-18); ctx.textAlign='center'; ctx.globalAlpha=1; } }
    ctx.font='800 '+Math.round(13*ps)+'px system-ui'; pops.forEach(p=>{ const q=R3.proj(p.x,p.y,18); ctx.globalAlpha=Math.max(0,Math.min(1,p.l*1.6)); ctx.fillStyle=p.c; ctx.fillText(p.t,q[0],q[1]); }); ctx.globalAlpha=1;
    if(combo>=3&&comboT>0){ ctx.globalAlpha=Math.min(1,comboT*1.5); ctx.fillStyle=TH.b; ctx.font='900 '+Math.round(20*ps)+'px system-ui'; ctx.textAlign='right'; ctx.fillText('COMBO ×'+combo,OW-70,44); ctx.globalAlpha=1; ctx.textAlign='center'; }
    if(save>0&&balls.some(b=>b.st==='play')){ ctx.fillStyle='rgba(255,212,0,.85)'; ctx.font='700 '+Math.round(11*ps)+'px system-ui'; ctx.fillText('BALL SAVE '+Math.ceil(save),OW/2,OH-14); }
    if(msgT>0){ ctx.globalAlpha=Math.min(1,msgT*2); ctx.fillStyle='#fff'; ctx.shadowColor='#ff2bd6'; ctx.shadowBlur=18; ctx.font='900 '+Math.round(24*ps)+'px system-ui,sans-serif'; ctx.fillText(msg,OW/2,OH*.62); ctx.globalAlpha=1; ctx.shadowBlur=0; } };  const rivals=ARCR.pin; let lastL='';
  const hud=()=>{ api.score(score,`Bille ${Math.min(ball,N)}/${N} · ×${mult}`);
    const all=rivals.map(r=>({n:r[0],s:r[1]})).concat([{n:'TOI',s:score,me:1}]).sort((a,b)=>b.s-a.s), i=all.findIndex(x=>x.me), up=all[i-1], dn=all[i+1];
    const cell=(x,k)=>x?`<div class="pl ${x.me?'me':''}"><b>#${all.indexOf(x)+1}</b><span>${x.n}</span><em>${fmt(x.s)}</em></div>`:`<div class="pl none">${k}</div>`;
    const pips=(n,m,c)=>Array.from({length:m},(_,k)=>`<i class="${k<n?'on':''}" style="--c:${c}"></i>`).join('');
    const modeH=mode==='chasse'?`<div class="pmode ch">🔎 CHASSE ${Math.ceil(chT)} s · ${'♥'.repeat(Math.max(0,part.hp))}<small>${'♡'.repeat(part.max-part.hp)}</small></div>`:turbo>0?`<div class="pmode tb">🔥 TURBO ${Math.ceil(turbo)} s · bumpers ×3</div>`:balls.length>1?`<div class="pmode mb">🎱 MULTIBILLE · points ×2</div>`:`<div class="pmode">${T.ic} ${T.n} · 🕳 ${hole.open?'ouvert':'fermé'} · NIV ${P.lv}</div>`;
    if(i<lastRank&&lastRank<99&&dn){ say('DÉPASSÉ '+dn.n.toUpperCase()+' !'); PM.fx('nice'); } lastRank=i;
    const musH=`<span class="plg mus">♪ ${PMS[SK].n} ${Math.round(PM.bpm())}<button class="pmm" data-a="pmmute">${PM.muted?'🔇':'🔊'}</button></span>`;
    const h=`<div class="plr">${cell(up,'🥇 Tu es 1er !')}${cell(all[i],'')}${cell(dn,'—')}</div><div class="plm">${musH}${modeH}</div>`;
    if(h!==lastL){ live.innerHTML=h; lastL=h; }
    const sh=`<div class="psg"><small>RADAR</small><span class="pp">${pips(radar,NEED,'#00e5ff')}</span></div><div class="psg"><small>TURBO</small><span class="pp">${pips(turbo>0?5:Math.min(5,Math.floor(turboG/5)),5,'#ff2bd6')}</span></div>`; if(sh!==lastS){ side.innerHTML=sh; lastS=sh; } };
  const sim=sec=>{ let left=sec; while(left>1e-6){ const d=Math.min(left,1/240); t+=d; phys(d); left-=d; } if(msgT>0) msgT-=sec; if(comboT>0){ comboT-=sec; if(comboT<=0) combo=0; } if(nudgeCD>0) nudgeCD-=sec; tiltN=Math.max(0,tiltN-sec/5); for(const q of pops){ q.y-=30*sec; q.l-=sec; } for(let i=pops.length-1;i>=0;i--) if(pops[i].l<=0) pops.splice(i,1); for(const p of fx){ p.x+=p.vx*sec; p.y+=p.vy*sec; p.vy+=300*sec; p.l-=sec; } for(let i=fx.length-1;i>=0;i--) if(fx[i].l<=0) fx.splice(i,1); };
  let raf=0, last=0, hacc=0; const loop=ts=>{ if(!last) last=ts; const dt=Math.min(.033,(ts-last)/1000); last=ts; if(!over) sim(dt); PM.pulse*=.88; { let sp=0; for(const b of balls) if(b.st==='play') sp=Math.max(sp,Math.hypot(b.vx,b.vy)); if(PM.rollSet) PM.rollSet(over?0:sp); const tI=Math.min(1,.12+sp/950+(mode?.25:0)+(turbo>0?.25:0)+(balls.length>1?.15:0)); PM.I+=(tI-PM.I)*.07; PM.mode=mode; PM.turbo=turbo>0; PM.multi=balls.length>1; } draw(); hacc+=dt; if(hacc>.1){ hacc=0; hud(); } raf=requestAnimationFrame(loop); }; hud(); raf=requestAnimationFrame(loop);
  const hold=(id,fn)=>{ const e=bar.querySelector(id); const dn=ev=>{ ev.preventDefault(); fn(true); }, up=ev=>{ ev.preventDefault(); fn(false); }; e.addEventListener('pointerdown',dn); e.addEventListener('pointerup',up); e.addEventListener('pointerleave',up); e.addEventListener('pointercancel',up); };
  const fl=i=>on=>{ if(tiltT>0) on=false; if(FL[i].on!==on) sfx(on?'flip':'flipdn'); FL[i].on=on; if(on) arcTone(180,.05,'square',.05); };

  /* flippers : toucher la moitié gauche ou droite de l'écran (plusieurs doigts gérés), sauf sur les boutons */
  { const ov=document.getElementById('arcov')||bar.parentNode; if(ov){ if(ov._pinT){ const o=ov._pinT; ov.removeEventListener('pointerdown',o.pd); ['pointerup','pointercancel','lostpointercapture'].forEach(k=>ov.removeEventListener(k,o.pu)); }
      const act=new Map(), cnt=[0,0];
      const pd=ev=>{ if(ev.target.closest&&ev.target.closest('button,a,input')) return; ev.preventDefault(); const s=ev.clientX<window.innerWidth/2?0:1; act.set(ev.pointerId,{s,y:ev.clientY,t:ev.timeStamp}); if(cnt[s]++===0) fl(s)(true); if(s===1&&!over&&balls.some(b=>b.st==='plunger')) charging=true; };
      const pu=ev=>{ const a=act.get(ev.pointerId); if(!a) return; act.delete(ev.pointerId); cnt[a.s]=Math.max(0,cnt[a.s]-1); if(!cnt[a.s]) fl(a.s)(false); if(a.s===1&&!cnt[1]&&charging){ charging=false; launch(); return; }
        if(ev.type==='pointerup'&&a.y-ev.clientY>70&&ev.timeStamp-a.t<320){ try{ nudge(); }catch(_){} } };
      ov.addEventListener('pointerdown',pd); ['pointerup','pointercancel','lostpointercapture'].forEach(k=>ov.addEventListener(k,pu)); ov._pinT={pd,pu}; ov.style.touchAction='none'; } }
  const kd=e=>{ if(e.repeat) return; if(e.code==='ArrowLeft'||e.code==='KeyA') fl(0)(true); if(e.code==='ArrowRight'||e.code==='KeyD') fl(1)(true); if(e.code==='Space'){ charging=true; e.preventDefault(); } };
  const ku=e=>{ if(e.code==='ArrowLeft'||e.code==='KeyA') fl(0)(false); if(e.code==='ArrowRight'||e.code==='KeyD') fl(1)(false); if(e.code==='Space'){ charging=false; launch(); } };
  document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
  const nudge=()=>{ if(over||nudgeCD>0||!balls.some(b=>b.st==='play')) return; nudgeCD=.9; tiltN++; balls.forEach(b=>{ if(b.st==='play'){ b.vy-=150; b.vx+=(Math.random()-.5)*180; } }); shake=.7; arcTone(90,.12,'square',.08); sfx('nudge'); if(tiltN>=3.2){ tiltT=2.6; tiltN=0; say('TILT !'); arcTone(70,.5,'sawtooth',.1); sfx('tilt'); } };
  /* secousse : un coup de doigt rapide vers le haut (toucher la table actionne les flippers) */
  window.__pin={sim,posts,sauc,get r3(){return R3;},get balls(){return balls;},get B(){return balls[0]||{x:0,y:0,vx:0,vy:0};},FL,segs,part,get score(){return score;},get ball(){return ball;},get over(){return over;},get st(){return balls[0]?balls[0].st:'none';},get mult(){return mult;},get mode(){return mode;},get radar(){return radar;},get caps(){return caps;},get turbo(){return turbo;},get nballs(){return balls.length;},get tab(){return tabI;},get hole(){return hole;},ramps,dbanks,get rampMax(){return rampMax;},loadTable,switchTable,TBL,bumps,mills,wells,portals,spins,boosts,tgt,
    launch:()=>{ power=.9; launch(); },launchP:p=>{ power=p; launch(); },nudge,get combo(){return combo;},hitC,get tilt(){return tiltT;},flip:(i,on)=>{ FL[i].on=on; },radarAdd,startChasse,capture,mission:k=>mission(balls[0]),setScore:v=>{ score=v; },lose,door,hud,N,NEED};
  return ()=>{ cancelAnimationFrame(raf); if(ro) ro.disconnect(); live.remove(); side.remove(); bar.style.display=''; if(R3){ try{ R3.dispose(); }catch(_){} R3=null; } PM.end(); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); window.__pin=null; };
};
/* ---------- comptoir : onglets Pinball (niveau, paliers, collection) ---------- */
const _arcSheet23=arcSheet;
arcSheet=function(X){
  if(!sheet||sheet.t!=='arcprix') return false; _arcSheet23(X); const P=pbS(), LV=P.lv, el=$('sheet').querySelector('.inv'); if(!el) return true;
  const dex=UNIQ.slice(PB_UN0).map((u,i)=>{ const n=P.got[PB_UN0+i]||0, sl=SLOTS.find(s=>s[0]===MODI[u.t][1]); return `<div class="dx ${n?'ok':''}"><span class="dxi">${n?sl[2]:'❔'}</span><b>${n?u.n:'???'}</b><small>${n?u.d+(n>1?` · ★${Math.min(5,n-1)}`:''):sl[1]}</small></div>`; }).join('');
  const html=`<h3 class="rh">🎰 Pinball · niveau ${LV}${LV>=PB_MAXLV?' (max)':''}</h3><div class="pbxp"><i style="width:${LV>=PB_MAXLV?100:Math.round(P.xp/pbNeed(LV)*100)}%"></i></div>
   <p class="note">Radar : ${pbPerk.need(LV)} charges · Ball save ${pbPerk.save(LV).toFixed(1).replace('.',',')} s · ${pbPerk.balls(LV)} billes · pièces d’arcade ${Math.round(pbPerk.arcP(LV)*100)} % · captures : ${P.caps}</p>
   <h3 class="rh">🏆 Paliers (score en une partie)</h3>${PB_PAL.map(p=>`<div class="inv-r ${P.pal[p.s]?'':'lock'}"><span class="inv-i">${P.pal[p.s]?'✅':'🎯'}</span><div class="inv-t"><b>${fmt(p.s)} points</b><small>${p.n}</small></div></div>`).join('')}
   <h3 class="rh">📖 Pièces d’arcade (${Object.keys(P.got).length}/${UNIQ.length-PB_UN0})</h3><div class="dxg">${dex}</div>`;
  const h3=[...el.querySelectorAll('h3.rh')].find(x=>/Classements/.test(x.textContent)); if(h3) h3.insertAdjacentHTML('beforebegin',html); else el.insertAdjacentHTML('beforeend',html); return true; };
