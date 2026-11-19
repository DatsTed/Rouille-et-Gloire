/* ===== v2.4 : palier MYTHIQUE (au-dessus d'Hypercar) pour les deux voitures aux modèles 3D réels : Rolls-Royce Phantom et VW Tiguan ===== */
TIERS[7]={n:'Mythique',c:'#FF2BD6'};
CPW[7]=.4;   /* chance de tirage : ≈ 0,2 % par voiture (la patrouille est à 0,2 %) */
{ const MYTH={
    majestic:{cat:'Mythique',t:7,ch:1000,nm:1100,kg:2300,vmax:340,adh:78,fre:85,man:60,fia:90,sty:100,val:900000},
    steppe:{cat:'Mythique',t:7,ch:1100,nm:1400,kg:2050,vmax:330,adh:84,fre:84,man:62,fia:88,sty:96,val:800000} };
  Object.entries(MYTH).forEach(([id,o])=>{ [CARS.find(c=>c.id===id),M[id]].forEach(x=>{ if(x) Object.assign(x,o); }); }); }
