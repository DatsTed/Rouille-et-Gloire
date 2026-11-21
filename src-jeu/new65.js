/* ===== v2.2 : nouveaux modèles 3D (Rolls-Royce Phantom pour l'Albion Majestic, Marova Steppe : modèle original depuis v2.16) ===== */
(function(){ const add=(carId,glb)=>{ if(!MODEL_IDS.includes(glb)) MODEL_IDS.push(glb); [CARS.find(c=>c.id===carId),M[carId]].forEach(o=>{ if(o) o.glb=glb; }); };
  if(document.getElementById('mdl-phantom')) add('majestic','phantom');
  /* v2.16 : la Marova Steppe a son propre modèle, créé pour le jeu (src-jeu/tools_mkmarova.py) ; l'ancien Tiguan sous licence non commerciale est retiré */
  if(document.getElementById('mdl-marova')) add('steppe','marova'); })();
/* crédits des modèles 3D ajoutés (page Base) */
{ const _r=render; render=function(){ const r=_r.apply(this,arguments); try{ if(view==='base'){ const v=$('view'); if(v&&!v.querySelector('.cred22')){ const secs=[...v.querySelectorAll('.sec')], s=secs.find(x=>/Crédits/.test(x.textContent)); if(s) s.insertAdjacentHTML('beforeend','<p class="note cred22">« Rolls-Royce Phantom » par Jaggu_wrld (Sketchfab), licence CC BY 4.0, simplifié pour le jeu.</p><p class="note cred22">« Marova Steppe » : modèle 3D original, créé pour High &amp; Rouillé.</p>'); } } }catch(e){} return r; }; }