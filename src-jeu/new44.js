/* ---- v0.66 : marché des voitures (casse + concession) : vues x1/x3, recherche, filtres, tri ---- */
const MKF={q:'',tier:'',sort:'prix'};
const mkCols=()=>(S&&S.mkcols>=3)?3:1;
function mkCard(c,btn){ const n=mkCols(); return '<div class="mkc">'+cardHTML(c,{tag:'div',cls:n===3?'cmini':''})+btn+'</div>'; }
function mkList(){ const q=MKF.q.trim().toLowerCase(), ok=m=>(!q||(m.nom+' '+(m.cat||'')).toLowerCase().includes(q))&&(!MKF.tier||String(m.t)===MKF.tier);
  const sort=a=>MKF.sort==='tier'?a.sort((x,y)=>M[x.mid].t-M[y.mid].t||x.p-y.p):MKF.sort==='puiss'?a.sort((x,y)=>(M[y.mid].ch||0)-(M[x.mid].ch||0)):a.sort((x,y)=>x.p-y.p);
  const cl=S.bat.concession, neuves=cl?CARS.filter(m=>m.t<=cl+1):[];
  const wr=sort(S.offres.map((o,i)=>({o,i,mid:o.mid,p:o.prix})).filter(x=>ok(M[x.mid])));
  const nw=sort(neuves.map(m=>({m,mid:m.id,p:m.val})).filter(x=>ok(x.m)));
  return {wr,nw,cl,tot:S.offres.length+neuves.length}; }
function mkGrids(){ const {wr,nw,cl}=mkList(), n=mkCols(), cr_=v=>cr(v);
  const btn=(a,id,p)=>`<button class="btn wide sm" data-a="${a}" data-id="${id}" ${S.cr<p?'disabled':''}>${n===3?'Acheter<br><small>'+cr_(p)+'</small>':'Acheter '+cr_(p)}</button>`;
  const g1=wr.length?wr.map(x=>mkCard({mid:x.mid,etat:x.o.etat,lvl:1,up:{}},btn('buy',x.i,x.p))).join(''):'<p class="note" style="grid-column:1/-1;text-align:center">Aucune épave ne correspond.</p>';
  const g2=cl?(nw.length?nw.map(x=>mkCard({mid:x.mid,etat:100,lvl:1,up:{}},btn('buynew',x.mid,x.p))).join(''):'<p class="note" style="grid-column:1/-1;text-align:center">Aucune voiture ne correspond.</p>'):'';
  return {g1,g2,nw:nw.length,wr:wr.length}; }
function mkBar(){ const n=mkCols(); const opt=(v,l,c)=>`<option value="${v}" ${c===v?'selected':''}>${l}</option>`;
  return `<div class="mkbar"><input id="mq" type="search" placeholder="🔎 Rechercher une voiture…" value="${MKF.q.replace(/"/g,'&quot;')}">
   <div class="mkrow"><select id="mkt">${opt('','Toutes raretés',MKF.tier)}${TIERS.map((t,i)=>t?opt(String(i),t.n,MKF.tier):'').join('')}</select><select id="mks">${opt('prix','↕ Prix croissant',MKF.sort)}${opt('tier','↕ Rareté',MKF.sort)}${opt('puiss','↕ Puissance',MKF.sort)}</select></div>
   <div class="gview"><button data-a="mkcols" data-id="1" class="${n===1?'on':''}">▬ x1</button><button data-a="mkcols" data-id="3" class="${n===3?'on':''}">▦ x3</button></div></div>`; }
const _vM44=vMarche; vMarche=function(){ let h=_vM44.apply(this,arguments); if(mTab!=='cars') return h;
  const g=mkGrids(), cl=S.bat.concession, refresh=100*S.bat.casse, n=mkCols();
  const body=`${mkBar()}<h3>🏚️ Casse automobile <small class="mkn">${g.wr} épave${g.wr>1?'s':''}</small></h3><p class="note">Des épaves à retaper. Les offres changent toutes les 3 épreuves.</p>
   <div class="grid mkgrid gc${n}" id="mkg1">${g.g1}</div>
   <button class="btn alt sm wide" style="margin-top:12px" data-a="refresh" ${S.cr<refresh?'disabled':''}>Voir d’autres épaves, ${cr(refresh)}</button>
   <div class="sec"><h3>🏢 Concession <small class="mkn">${cl?g.nw+' voiture'+(g.nw>1?'s':''):''}</small></h3>${cl?`<p class="note">Voitures neuves, 100 % d’état.</p><div class="grid mkgrid gc${n}" id="mkg2">${g.g2}</div>`:`<p class="note">Construis la concession dans Atelier › Base pour acheter des voitures neuves.</p>`}</div>`;
  const a=h.indexOf('<h3>Casse automobile</h3>'); if(a<0) return h; const b=h.indexOf('</div></div>',h.lastIndexOf('Concession</h3>')); 
  /* remplace tout le bloc voitures par le nouveau, en gardant les onglets */
  const head=h.slice(0,a); return head+body+(b>0&&h.slice(b+12).trim()?h.slice(b+12):''); };
ACT.mkcols=d=>{ S.mkcols=+d.id; try{ save(); }catch(e){} render(); };
function mkRefresh(){ try{ const g=mkGrids(), a=document.getElementById('mkg1'), b=document.getElementById('mkg2'); if(a) a.innerHTML=g.g1; if(b) b.innerHTML=g.g2; }catch(e){} }
document.addEventListener('input',e=>{ if(e.target.id==='mq'){ MKF.q=e.target.value; mkRefresh(); } });
document.addEventListener('change',e=>{ if(e.target.id==='mkt'){ MKF.tier=e.target.value; render(); } else if(e.target.id==='mks'){ MKF.sort=e.target.value; render(); } });
