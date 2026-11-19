/* ===== v0.50 : labo ×1/×5/×10, rouvrir un paquet avec un jeton ===== */
RY.qty=RY.qty||1;
const _rShop27=rShop;
rShop=function(){
  let h=_rShop27.apply(this,arguments); if(RY.shop==='gear') return h;
  const q=RY.qty||1, bar=`<div class="qtybar"><span>Quantité</span>${[1,5,10,50].map(n=>`<button class="${q===n?'on':''}" data-a="rqty" data-id="${n}">×${n}</button>`).join('')}</div>`;
  const i=h.indexOf('</div>')+6; h=h.slice(0,i)+bar+h.slice(i);
  if(q>1) h=h.replace(/data-id="(seed|chem|lamp):([^"]+)">([^<]*)<br>/g,(m,t,id,px)=>{ let u=t==='seed'?SID[id].sd:t==='chem'?CHEM[id].px:LID[id].px; return `data-id="${t}:${id}">×${q} · ${fmt(u*q)}<br>`; });
  return h;
};
ACT.rqty=d=>{ RY.qty=+d.id||1; renderSheet(); };
const _rbuy27=ACT.rbuy;
ACT.rbuy=function(d){
  const [t,a]=String(d.id).split(':'), q=RY.qty||1;
  if(q<=1||!(t==='seed'||t==='chem'||t==='lamp')) return _rbuy27.apply(this,arguments);
  const F=farm(); let u; if(t==='seed'){ const s=SID[a]; if(!s||F.rep<s.rep) return; u=s.sd; } else if(t==='chem') u=CHEM[a].px; else u=LID[a].px;
  const n=Math.min(q,Math.floor(S.cr/u)); if(n<1) return toast('Pas assez de crédits');
  S.cr-=n*u; const box=t==='seed'?F.seeds:t==='chem'?F.chem:F.lamps; box[a]=(box[a]||0)+n;
  toast(n<q?`Crédits justes : ${n} acheté${n>1?'s':''} sur ${q}`:`+${n} acheté${n>1?'s':''}`); save(); renderSheet();
};
/* paquets : « Encore un » aussi avec un jeton */
function pkTok27(){
  document.querySelectorAll('#sheet button[data-a="pack"][data-k="cr"]').forEach(b=>{
    if(!/Encore/i.test(b.textContent)) return; const nx=b.nextElementSibling; if(nx&&nx.dataset&&nx.dataset.k==='tok') return;
    const pk=PACKS.find(p=>p.id===b.dataset.id); if(!pk||!pk.tok) return;
    const c=document.createElement('button'); c.className='btn'; c.dataset.a='pack'; c.dataset.id=pk.id; c.dataset.k='tok'; c.style.gridColumn='1 / -1'; if(S.tok<pk.tok) c.disabled=true;
    c.innerHTML=`🎟 Encore un, ${pk.tok} jeton${pk.tok>1?'s':''} <small>(tu en as ${S.tok})</small>`; b.parentNode.appendChild(c);
  });
}
const _rs27=renderSheet; renderSheet=function(){ const r=_rs27.apply(this,arguments); try{ pkTok27(); }catch(e){ console.error(e); } return r; };

/* ---- récap des pièces gagnées au pinball : fiche détail + équiper ---- */
function pbRecap(list){
  return `<div class="pbrec"><b>🎁 Pièces gagnées (${list.length})</b><small>Touche une pièce pour voir sa fiche et l’équiper</small><div class="pbcap">${list.map(c=>{ const m=c.u!=null?modOf(c.u):null, sl=m?SLOTS.find(x=>x[0]===MODI[m.t][1]):null;
    return `<button class="pbc ${c.u==null?'off':''}" ${c.u!=null?`data-a="pbdet" data-id="${c.u}"`:'disabled'} style="--rc:${RAR[c.r].c}"><i>${sl?sl[2]:'📦'}</i><span>${c.arc?'⭐ ':''}${c.name}</span><em>${RAR[c.r].n}${c.dup?' · ★+':''}${c.full?' · ferraille':''}${c.pal?' · palier':''}</em></button>`; }).join('')}</div></div>`;
}
function pbDetRender(u){
  const ov=document.getElementById('arcov')||document.body; let d=document.getElementById('pbdet'); if(!d){ d=document.createElement('div'); d.id='pbdet'; ov.appendChild(d); }
  const m=modOf(u); if(!m){ d.remove(); return; } const sl=MODI[m.t][1], slN=SLOTS.find(x=>x[0]===sl), on=eqCar(u);
  d.innerHTML=`<div class="pbd-in"><button class="pbd-x" data-a="pbdetx">✕</button><h3>${slN[2]} ${slN[1]}</h3><div class="pbd-card">${modHTML(m)}</div>
    <p class="note">${on?`Monté sur <b>${M[on.mid].nom}</b>. Tu peux le déplacer sur une autre voiture.`:'Pas encore monté. Choisis une voiture pour l’équiper tout de suite.'}</p>
    <div class="pbd-cars">${S.cars.map(c=>{ const cu=c.mods&&modOf(c.mods[sl]), here=on&&on.uid===c.uid, up=cu&&modPow(m)>modPow(cu), nw=!cu;
      return `<button class="pbd-car ${here?'on':''}" ${here?'disabled':''} data-a="pbeq" data-id="${c.uid}:${u}"><span class="throw" style="--t:${TIERS[M[c.mid].t].c}">${thArt(c)}</span><span class="grow"><b>${M[c.mid].nom}</b><small>${here?'Déjà monté ici':cu?'Remplace : '+modName(cu)+' ('+RAR[cu.r].n+')':'Emplacement vide'}</small></span><em>${here?'✔':nw?'＋':up?'⬆':'⬇'}</em></button>`; }).join('')}</div>
    <button class="btn alt wide" data-a="pbdetx">Fermer</button></div>`;
}
Object.assign(ACT,{ pbdet(d){ pbDetRender(+d.id); }, pbdetx(){ const d=document.getElementById('pbdet'); if(d) d.remove(); },
  pbeq(d){ const [cu,u]=String(d.id).split(':').map(Number), c=car(cu), m=modOf(u); if(!c||!m) return; equipMod(c,u,MODI[m.t][1]); save(); toast(modName(m)+' monté sur '+M[c.mid].nom); try{ ui('coins'); }catch(_){} pbDetRender(u); } });
