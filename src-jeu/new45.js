/* ---- v1.0 : navigation resserrée, parcours de début, sauvegarde, qualité graphique ---- */
/* 1. Équipe rejoint l'Atelier : 7 onglets au lieu de 8 */
(()=>{ const i=TABS.findIndex(t=>t[0]==='equipe'); if(i>=0) TABS.splice(i,1); const a=TABS.find(t=>t[0]==='atelier'); if(a){ a[1]='🛠️'; a[2]='Atelier'; } })();
const _rn45=render; render=function(){ const r=_rn45.apply(this,arguments); try{ decor45(); }catch(e){} return r; };
function decor45(){ if(view==='atelier'||view==='equipe'){ const v=document.getElementById('view'); if(v&&!v.querySelector('.topsw')) v.insertAdjacentHTML('afterbegin','<div class="subtabs topsw">'+[['atelier','🔨 Fabrication'],['equipe','👥 Équipe']].map(([id,n])=>'<button data-a="tab" data-id="'+id+'" '+(view===id?'aria-current="true"':'')+'>'+n+'</button>').join('')+'</div>'); }
  const nav=document.getElementById('nav'); if(nav&&view==='equipe'){ const b=nav.querySelector('[data-id="atelier"]'); if(b) b.setAttribute('aria-current','page'); }
  const pb=document.querySelector('#view [data-a="patch"]'); if(pb&&!document.getElementById('svbtn')) pb.insertAdjacentHTML('afterend',' <button class="btn alt" id="svbtn" data-a="svopen">💾 Sauvegarde</button> <button class="btn alt" id="qlbtn" data-a="qlset">🎞️ Qualité : '+(({auto:'Auto',low:'Basse',high:'Haute'})[(S.q||'auto')])+'</button>'); }
/* 2. parcours de début : étapes supplémentaires après celles qui existent */
const _gn45=goalNext; goalNext=function(){ const r=_gn45.apply(this,arguments); if(r) return r; const st=S.stats||{};
  if(S.cars.length<2&&S.cr>=600) return ['🛒','Achète une deuxième voiture au marché (casse ou concession) pour varier tes épreuves','marche','Au marché'];
  if(!(S.bat&&S.bat.bureau)&&S.cr>=1200) return ['🏗️','Construis le Bureau des contrats : +10 % de gains sur toutes les épreuves','base','À la base'];
  try{ if(typeof questsEnsure==='function'){ questsEnsure(); const q=S.quests; if(q&&q.d&&q.d.some&&false) return null; } }catch(e){}
  if(S.daily!==dayKey()) return ['🎁','Ta récompense quotidienne est prête, ainsi que les défis du jour','missions','Aux missions'];
  return null; };
/* 3. sauvegarde : export / import / copie de secours */
const encS=()=>btoa(unescape(encodeURIComponent(JSON.stringify(S))));
const decS=t=>JSON.parse(decodeURIComponent(escape(atob(t.trim()))));
setInterval(()=>{ try{ if(S&&S.cars&&S.cars.length) localStorage.setItem(KEY+'_bak',JSON.stringify(S)); }catch(e){} },120000);
ACT.svopen=()=>{ let m=document.getElementById('svm'); if(m) m.remove(); const hasBak=(()=>{ try{ return !!localStorage.getItem(KEY+'_bak'); }catch(e){ return false; } })();
  document.body.insertAdjacentHTML('beforeend','<div id="svm"><div class="svc"><h2>💾 Sauvegarde</h2><p class="note">Ta progression est gardée dans ce navigateur. Copie le code ci-dessous et garde-le : il te permet de tout restaurer, même sur un autre appareil.</p><textarea id="svt" readonly rows="4"></textarea><div class="svb"><button class="btn" data-a="svcopy">📋 Copier le code</button><button class="btn alt" data-a="svdl">⬇️ Télécharger</button></div><h3>Restaurer</h3><textarea id="svi" rows="3" placeholder="Colle ici un code de sauvegarde"></textarea><div class="svb"><button class="btn" data-a="svimp">⬆️ Importer</button>'+(hasBak?'<button class="btn alt" data-a="svbak">🕑 Copie de secours</button>':'')+'</div><p class="note" id="svmsg"></p><button class="btn alt wide" data-a="svclose">Fermer</button></div></div>');
  try{ document.getElementById('svt').value=encS(); }catch(e){} };
ACT.svclose=()=>{ const m=document.getElementById('svm'); if(m) m.remove(); };
ACT.svcopy=async()=>{ const t=document.getElementById('svt'); const msg=document.getElementById('svmsg'); try{ await navigator.clipboard.writeText(t.value); msg.textContent='Code copié.'; }catch(e){ t.select(); try{ document.execCommand('copy'); msg.textContent='Code copié.'; }catch(_){ msg.textContent='Sélectionne le code et copie-le à la main.'; } } };
ACT.svdl=()=>{ const msg=document.getElementById('svmsg'); try{ const b=new Blob([JSON.stringify(S)],{type:'application/json'}), a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='high-et-rouille-sauvegarde.json'; document.body.appendChild(a); a.click(); a.remove(); msg.textContent='Fichier demandé. S’il ne part pas, utilise « Copier le code ».'; }catch(e){ msg.textContent='Téléchargement impossible ici : utilise « Copier le code ».'; } };
ACT.svimp=()=>{ const msg=document.getElementById('svmsg'), v=document.getElementById('svi').value.trim(); if(!v){ msg.textContent='Colle d’abord un code.'; return; } try{ const o=v[0]==='{'?JSON.parse(v):decS(v); if(!o||!Array.isArray(o.cars)) throw new Error('bad'); localStorage.setItem(KEY+'_bak',JSON.stringify(S)); localStorage.setItem(KEY,JSON.stringify(o)); msg.textContent='Sauvegarde importée, rechargement…'; setTimeout(()=>location.reload(),600); }catch(e){ msg.textContent='Code invalide : rien n’a été modifié.'; } };
ACT.svbak=()=>{ const msg=document.getElementById('svmsg'); try{ const b=localStorage.getItem(KEY+'_bak'); if(!b) throw 0; JSON.parse(b); localStorage.setItem(KEY,b); msg.textContent='Copie de secours restaurée, rechargement…'; setTimeout(()=>location.reload(),600); }catch(e){ msg.textContent='Aucune copie de secours valide.'; } };
/* 4. qualité graphique */
const labLQ=()=>{ const q=(S&&S.q)||'auto'; if(q==='low') return true; if(q==='high') return false; try{ return (navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=3; }catch(e){ return false; } };
window.__lq=labLQ();
ACT.qlset=()=>{ const o=['auto','low','high']; S.q=o[(o.indexOf(S.q||'auto')+1)%3]; window.__lq=labLQ(); try{ save(); }catch(e){} toast('Qualité : '+({auto:'Auto',low:'Basse',high:'Haute'})[S.q]+(S.q==='auto'?(window.__lq?' (basse détectée)':' (haute détectée)'):'')+' — appliquée au prochain chargement de scène'); render(); };
