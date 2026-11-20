# Script d'initialisation partagé par t_v11, t_v12 et t_minor (recréé en v2.15 : l'original manquait au dépôt).
# STUB est injecté avant le chargement de la page : sauvegarde vide (partie neuve) et pas de WebGL (le jeu doit tenir sans 3D).
STUB="""
try{ localStorage.clear(); }catch(e){}
(function(){ const g=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(t){ if(/webgl/i.test(t)) return null; return g.apply(this,arguments); }; })();
"""
