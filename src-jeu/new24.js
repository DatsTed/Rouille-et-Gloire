/* ===== v0.46 : monde 3D en portrait uniquement (le mode paysage est supprimé) ===== */
const _rot24=rotNow;
rotNow=function(on){ return _rot24(false); };
const _hubMode24=hubMode;
hubMode=function(){ _hubMode24.apply(this,arguments); try{ document.body.classList.remove('hubland'); if(S.hubLand) S.hubLand=false; }catch(_){} };
const _glSize24=glSize;
glSize=function(){ _glSize24.apply(this,arguments);
  try{ if(view==='hub'&&GL.cam&&GL.cam.isPerspectiveCamera&&GL.cam.aspect){ const a=GL.cam.aspect, f=a<1?Math.min(108,2*Math.atan(Math.tan(41*Math.PI/180)/a)*180/Math.PI):100; if(Math.abs(GL.cam.fov-f)>.5){ GL.cam.fov=f; GL.cam.updateProjectionMatrix(); } } }catch(_){} };
ACT.hubrot=()=>{};
