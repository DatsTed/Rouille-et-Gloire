/* ===== v1.5 · Éveil cosmique — 2/6 : fiche de combat de chaque voiture =====
   Stockée à part dans S.cmb[uid] : types, IV (0-31), talent, niveau et XP de combat, 4 attaques.
   Rien ici ne lit ni ne modifie les caractéristiques de course (ch, kg, adh…) en écriture. */

const cbAwake=()=>!!(S&&S.niveau10CinematicSeen===true);
/* types par modèle (double type pour la plupart) */
const CB_CARTY={
  piccola:['vent','lum'], kombi:['eau','terre'], steppe:['terre','glace'], riva:['vent','elec'], hauler:['terre','feu'],
  patrouille:['lum','elec'], velo:['vent','meca'], subi:['eau','vent'], audi:['acier','glace'], merco:['lum','acier'],
  touge:['vent','feu'], fury:['feu','tene'], rx4:['feu','elec'], gts:['elec','vent'], volta:['elec','lum'],
  majestic:['lum','tene'], rossa:['feu','acier'], aurion:['elec','eau'], solus:['tene','vent'], epave:['acier','terre']
};
const cbTypesOf=mid=>CB_CARTY[mid]||((M[mid]&&M[mid].t>=4)?['meca','acier']:['meca']);
/* XP totale nécessaire pour atteindre un niveau (courbe « moyenne ») */
const cbNeed=l=>Math.round(.8*Math.pow(Math.max(1,l),3));
const cbLvOfXp=x=>{ let l=1; while(l<CB_LVMAX&&cbNeed(l+1)<=x) l++; return l; };
function cbBase(mid){
  const m=M[mid]||{t:1,kg:1200}, ty=cbTypesOf(mid), p1=CB_TPROF[ty[0]], p2=CB_TPROF[ty[1]||ty[0]], kgF=clamp((m.kg||1200)/1300,.7,1.5), tier=1+.035*((m.t||1)-1), o={};
  CB_SK.forEach(k=>{ let v=p1[k]*.62+p2[k]*.38; if(k==='hp') v*=Math.pow(kgF,.2); if(k==='def') v*=Math.pow(kgF,.15); if(k==='vit') v/=Math.pow(kgF,.2); o[k]=Math.round(v*tier); });
  return o; }
function cbAutoMoves(ty,lv){
  const L=cbLearnable(ty,lv), off=L.filter(m=>m.c!=='sta'&&!(m.fx.selfko)), pick=[];
  const best=f=>off.filter(f).filter(m=>!pick.includes(m.id)).sort((a,b)=>(b.p*(b.a||100))-(a.p*(a.a||100))||b.lv-a.lv)[0];
  ty.forEach(t=>{ const m=best(x=>x.t===t&&!x.e); if(m) pick.push(m.id); });
  { const u=best(x=>x.e>0&&x.t!=='meca'&&ty.includes(x.t)), m=best(x=>x.t==='meca'&&!x.e); if(u) pick.push(u.id); else if(m) pick.push(m.id); }
  { const st=L.filter(m=>m.c==='sta'&&(ty.includes(m.t)||m.t==='meca')&&!pick.includes(m.id)).sort((a,b)=>b.lv-a.lv)[0]; if(st&&pick.length<4) pick.push(st.id); }
  while(pick.length<4){ const m=best(()=>true); if(!m) break; pick.push(m.id); }
  return pick.slice(0,4); }
function cbNew(c){
  const m=M[c.mid]||{t:1}, ty=cbTypesOf(c.mid), iv={}; CB_SK.forEach(k=>iv[k]=Math.floor(Math.random()*32));
  const pool=CB_TAL_BY[ty[0]]||CB_TAL_BY.meca, lv=clamp(5+2*((m.t||1)-1)+Math.floor(((c.lvl||1)-1)/2),5,20);
  return {v:1,ty,iv,tal:pool[Math.floor(Math.random()*pool.length)],lv,xp:cbNeed(lv),mv:cbAutoMoves(ty,lv),nw:[],w:0,l:0}; }
function cbOf(c){ if(!c) return null; if(!S.cmb) S.cmb={}; let s=S.cmb[c.uid]; if(!s||s.v!==1){ s=S.cmb[c.uid]=cbNew(c); } return s; }
/* statistiques réelles (formule type Pokémon, sans points d'effort) */
function cbStats(c,lvOver){ const s=cbOf(c), b=cbBase(c.mid), L=lvOver||s.lv, o={};
  CB_SK.forEach(k=>{ const r=Math.floor((2*b[k]+s.iv[k])*L/100); o[k]=k==='hp'?r+L+10:r+5; }); return o; }
const cbIvGrade=v=>v>=31?['Parfait','#ffd24a']:v>=26?['Excellent','#3cff9e']:v>=16?['Bon','#00e5ff']:v>=6?['Moyen','#a5adcf']:['Faible','#ff6a8a'];
/* XP de combat : montée de niveau, nouvelles attaques proposées */
function cbGainXP(c,n){ const s=cbOf(c), l0=s.lv; s.xp=Math.min(cbNeed(CB_LVMAX),s.xp+Math.max(0,Math.round(n))); s.lv=cbLvOfXp(s.xp);
  const fresh=Object.values(CB_MV).filter(m=>(m.t==='meca'||s.ty.includes(m.t))&&m.lv>l0&&m.lv<=s.lv).map(m=>m.id);
  fresh.forEach(id=>{ if(s.mv.includes(id)) return; if(s.mv.length<4) s.mv.push(id); else if(!s.nw.includes(id)) s.nw.push(id); });
  return {l0,l1:s.lv,fresh}; }
const cbTyChip=t=>{ const T=CB_TYPES[t]; return T?`<span class="cbty" style="--tc:${T.c}">${T.ic} ${T.n}</span>`:''; };
const cbMvChip=(id,extra)=>{ const m=CB_MV[id]; if(!m) return ''; const T=CB_TYPES[m.t];
  return `<span class="cbmv ${m.e?'ult':''}" style="--tc:${T.c}"><b>${T.ic} ${m.n}</b><small>${m.c==='phy'?'Physique':m.c==='spe'?'Spéciale':'Statut'}${m.p>1?' · '+m.p:''}${m.e?' · ⚡'+m.e:' · '+m.pp+' PP'}${extra||''}</small></span>`; };
/* nettoyage : les fiches des voitures vendues disparaissent */
{ const _sv=save; save=function(){ try{ if(S&&S.cmb){ const u=new Set(S.cars.map(c=>String(c.uid))); Object.keys(S.cmb).forEach(k=>{ if(!u.has(k)) delete S.cmb[k]; }); } }catch(e){} return _sv.apply(this,arguments); }; }

/* ---- section « Fiche de combat » dans la fiche véhicule (après l'éveil seulement) ---- */
function cbCarHTML(c){
  const s=cbOf(c), st=cbStats(c), b=cbBase(c.mid), T=CB_TAL[s.tal]||{}, nx=s.lv>=CB_LVMAX?1:(s.xp-cbNeed(s.lv))/Math.max(1,cbNeed(s.lv+1)-cbNeed(s.lv));
  const ivTot=CB_SK.reduce((a,k)=>a+s.iv[k],0);
  const rows=CB_SK.map(k=>{ const g=cbIvGrade(s.iv[k]); return `<div class="cbst"><span>${CB_STATS[k].ic} ${CB_STATS[k].n}</span><i title="Potentiel du modèle : ${b[k]}"><em style="width:${clamp(b[k]/140*100,4,100)}%"></em></i><b>${st[k]}</b><small style="color:${g[1]}" title="IV ${s.iv[k]}/31">IV ${s.iv[k]}</small></div>`; }).join('');
  return `<div class="sec cbsec"><h3>⚔️ Fiche de combat</h3>
    <div class="cbhd"><span class="cblv">Niv. ${s.lv}</span>${s.ty.map(cbTyChip).join('')}<span class="cbrec">${s.w||0} V · ${s.l||0} D</span></div>
    <div class="cbxp"><i style="width:${(nx*100).toFixed(1)}%"></i></div><p class="note sm" style="margin:2px 0 8px">${s.lv>=CB_LVMAX?'Niveau maximum':fmt(cbNeed(s.lv+1)-s.xp)+' XP de combat avant le niveau '+(s.lv+1)}</p>
    <div class="cbtal"><b>🧬 ${T.n||'—'}</b><small>${T.d||''}</small></div>
    ${rows}<p class="note sm">Barres : potentiel du modèle · chiffres : valeur au niveau ${s.lv}.</p><p class="note sm">Potentiel (IV) : <b>${ivTot}/186</b> · ${cbIvGrade(Math.round(ivTot/6))[0]}. Les IV sont fixés à l’acquisition de la voiture.</p>
    <div class="cbmvs">${s.mv.map(id=>cbMvChip(id)).join('')}</div>
    <button class="btn alt wide" data-a="cbmv" data-id="${c.uid}">📘 Gérer les attaques${s.nw.length?` <span class="cbnew">${s.nw.length} nouvelle${s.nw.length>1?'s':''}</span>`:''}</button>
    <p class="note sm">Ces pouvoirs ne servent qu’en combat dans l’Arène : ils ne changent rien aux courses.</p></div>`; }
{ const _rs=renderSheet; renderSheet=function(){ const r=_rs.apply(this,arguments); try{ if(sheet&&sheet.t==='car'&&cbAwake()){ const el=$('sheet'), c=car(sheet.uid); if(c&&!el.querySelector('.cbsec')){ const bars=el.querySelectorAll(':scope>.bar'), at=bars.length?bars[bars.length-1]:el.querySelector(':scope>.statgrid'); if(at) at.insertAdjacentHTML('afterend',cbCarHTML(c)); else el.insertAdjacentHTML('beforeend',cbCarHTML(c)); } } }catch(e){ console.error('cb fiche',e); } return r; }; }

/* ---- gestion des attaques : 4 emplacements, toutes les attaques apprises au niveau actuel ---- */
{ const _sx=sheetExtra; sheetExtra=function(X){
  if(sheet&&sheet.t==='cbmoves'){ const c=car(sheet.uid); if(!c){ closeSheet(); return true; } const s=cbOf(c), L=cbLearnable(s.ty,s.lv), sel=sheet.sel;
    const soon=Object.values(CB_MV).filter(m=>(m.t==='meca'||s.ty.includes(m.t))&&m.lv>s.lv).sort((a,b)=>a.lv-b.lv).slice(0,4);
    $('sheet').innerHTML=`${X}<h2>📘 Attaques · ${M[c.mid].nom}</h2><p class="note">Niv. ${s.lv} · ${s.ty.map(cbTyChip).join(' ')} · Touche une attaque de la liste, puis l’emplacement à remplacer.</p>
      <h3 class="rh">Équipées</h3><div class="cbslots">${[0,1,2,3].map(i=>{ const id=s.mv[i]; return `<button class="cbslot ${sel?'arm':''}" data-a="cbslot" data-id="${i}">${id?cbMvChip(id):'<span class="cbmv empty"><b>Emplacement libre</b></span>'}</button>`; }).join('')}</div>
      ${sel?`<p class="cbsel">➜ ${CB_MV[sel].n} : ${cbDesc(CB_MV[sel])}</p>`:''}
      <h3 class="rh">Apprises (${L.length})</h3><div class="cblearn">${L.map(m=>`<button class="cbl ${m.id===sel?'on':''} ${s.mv.includes(m.id)?'eq':''} ${s.nw.includes(m.id)?'nw':''}" data-a="cbpick" data-id="${m.id}">${cbMvChip(m.id,s.mv.includes(m.id)?' · équipée':'')}<small class="cbd">${cbDesc(m)}</small></button>`).join('')}</div>
      ${soon.length?`<h3 class="rh">Bientôt</h3><div class="cblearn soon">${soon.map(m=>`<div class="cbl">${cbMvChip(m.id,' · niv. '+m.lv)}</div>`).join('')}</div>`:''}
      <button class="btn wide" data-a="cbback" data-id="${c.uid}">✓ Terminé</button>`;
    return true; }
  return _sx.apply(this,arguments); }; }
Object.assign(ACT,{
  cbmv(d){ const c=car(+d.id); if(!c) return; const s=cbOf(c); openSheet({t:'cbmoves',uid:c.uid,sel:null}); s.nw=[]; save(); },
  cbpick(d){ if(!sheet||sheet.t!=='cbmoves') return; sheet.sel=sheet.sel===d.id?null:d.id; renderSheet(); },
  cbslot(d){ if(!sheet||sheet.t!=='cbmoves') return; const s=cbOf(car(sheet.uid)), i=+d.id, id=sheet.sel; if(!id) return toast('Choisis d’abord une attaque dans la liste');
    const j=s.mv.indexOf(id); if(j>=0&&j!==i){ s.mv[j]=s.mv[i]; } s.mv[i]=id; s.mv=s.mv.filter(Boolean); sheet.sel=null; save(); renderSheet(); try{ ui('click'); }catch(e){} },
  cbback(d){ openSheet({t:'car',uid:+d.id}); }
});
