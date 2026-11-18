/* ---- v0.63 : paquets ciblés par statistique, paiement explicite ---- */
Object.assign(PKT,{
 f1:{c1:'#ff8a5c',c2:'#c2381a',c3:'#3a0d05',emb:'🔥',tag:'PUISSANCE'},
 f2:{c1:'#7dd3ff',c2:'#1d6fb8',c3:'#06213d',emb:'⭕',tag:'ADHÉRENCE'},
 f3:{c1:'#ff6a8a',c2:'#a3203f',c3:'#2e0610',emb:'🛑',tag:'FREINAGE'},
 f4:{c1:'#8be03c',c2:'#3f8a14',c3:'#122b05',emb:'🛡️',tag:'ROBUSTE'},
 f5:{c1:'#e69bff',c2:'#9a3fd0',c3:'#2d0a45',emb:'🎨',tag:'STYLE'},
 f6:{c1:'#ffe14d',c2:'#d98a14',c3:'#4d2a00',emb:'⚡',tag:'NITRO'}});
[
 {id:'f1',nom:'Paquet Puissance',n:4,cr:3200,tok:5,boost:1.2,min:1,slots:['moteur','turbo','echap'],d:'4 modules de moteur, turbo ou échappement : puissance et couple'},
 {id:'f2',nom:'Paquet Adhérence',n:4,cr:3200,tok:5,boost:1.2,min:1,slots:['pneus','aero','jantes'],d:'4 modules de pneus, aéro ou jantes : adhérence et tenue'},
 {id:'f3',nom:'Paquet Freinage',n:4,cr:3000,tok:5,boost:1.2,min:1,slots:['freins','susp'],d:'4 modules de freins ou de suspension : freinage et maniabilité'},
 {id:'f4',nom:'Paquet Robuste',n:4,cr:3000,tok:5,boost:1.2,min:1,slots:['chassis'],d:'4 modules de châssis : fiabilité, solidité, poids'},
 {id:'f5',nom:'Paquet Style',n:4,cr:2800,tok:4,boost:1.2,min:1,slots:['peinture','jantes','aero'],d:'4 modules de peinture, jantes ou aéro : style et revenus du showroom'},
 {id:'f6',nom:'Paquet Nitro',n:4,cr:3400,tok:6,boost:1.2,min:1,slots:['nitro'],d:'4 modules de nitro : durée et puissance'}
].forEach(p=>{ if(!PACKS.some(x=>x.id===p.id)) PACKS.push(p); });
PACKS.forEach(p=>{ if(!p.slots) p.rand=1; });
const PKF={slots:null};
const _nm38=newMod; newMod=function(r,slot,plain){ if(!slot&&PKF.slots) slot=PKF.slots[rint(0,PKF.slots.length-1)]; return _nm38(r,slot,plain); };
const _op38=openPack; openPack=function(id,cur){ const p=PACKS.find(x=>x.id===id); PKF.slots=p&&p.slots||null; try{ return _op38.apply(this,arguments); } finally{ PKF.slots=null; } };
CAR_P.f1=CAR_P.f2=CAR_P.f3=CAR_P.f4=CAR_P.f5=CAR_P.f6=.0008;
/* paiement explicite : un tap sur le paquet ouvre le choix crédits ou jetons */
function payChoice(id){ const p=PACKS.find(x=>x.id===id); if(!p||document.getElementById('pkpay')) return;
  const d=document.createElement('div'); d.id='pkpay'; const okC=S.cr>=p.cr, okT=S.tok>=p.tok;
  d.innerHTML='<div class="upd-c"><small>OUVRIR</small><h2>'+p.nom+'</h2><p class="tx-p">Choisis comment payer. Tu as <b>'+fmt(S.cr)+' cr</b> et <b>'+S.tok+' jeton'+(S.tok>1?'s':'')+'</b>.</p>'+
   '<div class="tx-b"><button class="btn'+(okC?'':' alt')+'" id="ppC" '+(okC?'':'disabled')+'>💰 '+fmt(p.cr)+' cr</button><button class="btn'+(okT?'':' alt')+'" id="ppT" '+(okT?'':'disabled')+'>🎟 '+p.tok+' jeton'+(p.tok>1?'s':'')+'</button></div><button class="btn alt wide" id="ppX" style="margin-top:8px">Annuler</button></div>';
  document.body.appendChild(d); const go=k=>{ d.remove(); ACT.pack({id,k}); };
  d.querySelector('#ppC').onclick=()=>go('cr'); d.querySelector('#ppT').onclick=()=>go('tok'); d.querySelector('#ppX').onclick=()=>d.remove(); }
document.addEventListener('pointerup',()=>{},true);
const _pk38=ACT.pack; ACT.pack=function(d){ if(d&&d.k==='auto'){ const p=PACKS.find(x=>x.id===d.id); if(S.cr>=p.cr&&S.tok>=p.tok) return payChoice(d.id); return _pk38.call(this,{id:d.id,k:S.tok>=p.tok&&S.cr<p.cr?'tok':'cr'}); } return _pk38.apply(this,arguments); };
/* le tap sur le paquet central passe par le choix quand les deux paiements sont possibles */
(function(){ const o=ACT.pack; ACT.pack=function(d){ if(d&&d.id&&d.k&&!d.explicit&&new Error().stack.indexOf('pointerup')>=0){ const p=PACKS.find(x=>x.id===d.id); if(p&&S.cr>=p.cr&&S.tok>=p.tok&&!document.getElementById('pkov')&&!sheet) return payChoice(d.id); } return o.apply(this,arguments); }; })();
/* libellés clairs sur les boutons de paquet */
function decor38(){ try{ document.querySelectorAll('#pkInfo button[data-a="pack"][data-k="tok"]').forEach(b=>{ const p=PACKS.find(x=>x.id===b.dataset.id); if(p&&!b.dataset.d38){ b.dataset.d38=1; b.innerHTML='🎟 '+p.tok+' jeton'+(p.tok>1?'s':'')+' <small>(tu en as '+S.tok+')</small>'; } });
  document.querySelectorAll('#pkInfo button[data-a="pack"][data-k="cr"]').forEach(b=>{ const p=PACKS.find(x=>x.id===b.dataset.id); if(p&&!b.dataset.d38){ b.dataset.d38=1; b.innerHTML='💰 '+fmt(p.cr)+' cr'; } });
  const pi=document.getElementById('pkInfo'); if(pi&&!pi.querySelector('.pk-kind')){ const p=PACKS[clamp(Math.round(PK.drag?PK.pos:PK.tgt),0,PACKS.length-1)], t=pi.querySelector('.t'); if(t&&p) t.insertAdjacentHTML('afterend','<small class="pk-kind">'+(p.car?'🚗 Voiture : 1 au hasard, tous tiers':p.slots?'🎯 Ciblé : '+p.slots.map(s=>(SLOTS.find(x=>x[0]===s)||[0,s])[1]).join(', '):'🎲 Aléatoire : tous les emplacements')+'</small>'); } }catch(e){} }
setInterval(decor38,300);
