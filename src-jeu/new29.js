/* ===== v0.53 : 8 voitures 3D réelles (stats d'après les fiches constructeur) ===== */
MODEL_IDS.push('epave','golf','tt','r8','alfa','p1','solus','concept');
CAP['Course']=50; CAP['Prototype']=20;
(function(){
  const set=(id,o)=>{ const m=M[id]; Object.assign(m,o); return m; };
  /* Golf GTI Mk8.5 : 265 ch, 370 Nm, 5,9 s, 250 km/h limitée, traction */
  set('touge',{nom:'Wolfen Sprint GTI',an:2025,cat:'Compacte',shape:'hatch',tr:'FWD',t:3,ch:265,nm:370,kg:1450,vmax:250,adh:68,fre:66,man:74,fia:80,sty:58,val:18000,col:'#B81D1D',glb:'golf'});
  /* Audi TT RS : 400 ch, 480 Nm, 1 440 kg, 3,7 s, 250 km/h bridée, quattro */
  set('gts',{nom:'Ostwald TR-S Coupé',an:2022,cat:'Sportive',shape:'coupe',tr:'AWD',t:4,ch:400,nm:480,kg:1440,vmax:250,adh:80,fre:74,man:74,fia:76,sty:70,val:48000,col:'#C8141C',glb:'tt'});
  /* Alfa 155 V6 TI DTM 1993 : V6 2,5 l atmo, 400 ch à 11 500 tr/min, transmission 4x4 Q4, ≈1 040 kg */
  set('rx4',{nom:'Alvaro 155 V6 DTM',an:1993,cat:'Course',shape:'sedan',tr:'AWD',t:4,ch:400,nm:300,kg:1040,vmax:270,adh:80,fre:82,man:84,fia:45,sty:80,val:52000,col:'#7A1E22',glb:'alfa'});
  /* Concept 050 : voiture-concept fictive (modèle libre CC0), électrique de prototype */
  set('volta',{nom:'Aero Concept 050',an:2030,cat:'Prototype',shape:'super',tr:'AWD',t:5,ch:780,nm:1050,kg:1750,vmax:320,adh:84,fre:82,man:80,fia:55,sty:96,val:170000,col:'#14E5E0',glb:'concept'});
  /* Audi R8 V10 performance : 620 ch, 580 Nm, 1 595 kg, 2,9 s, 331 km/h, quattro */
  set('rossa',{nom:'Ostwald V10 Quattro',an:2023,cat:'Supercar',shape:'super',tr:'AWD',t:5,ch:620,nm:580,kg:1595,vmax:331,adh:88,fre:86,man:82,fia:74,sty:90,val:210000,col:'#C58A3E',glb:'r8'});
  /* McLaren P1 : V8 biturbo + électrique, 916 ch, 900 Nm, 1 450 kg, 2,8 s, 350 km/h bridée */
  set('aurion',{nom:'Murrow P1 Hybride',an:2014,cat:'Hypercar',shape:'super',tr:'RWD',t:6,ch:916,nm:900,kg:1450,vmax:350,adh:92,fre:94,man:90,fia:55,sty:97,val:700000,col:'#4B2A6B',glb:'p1'});
  const add=o=>{ CARS.push(o); M[o.id]=o; };
  /* McLaren Solus GT : V10 5,2 l atmo, 829 ch, ≈650 Nm, ≈1 000 kg, 2,5 s (0-100 mph), 320 km/h, 25 exemplaires */
  add({id:'solus',nom:'Murrow Solus GT',an:2023,cat:'Hypercar',shape:'super',tr:'RWD',t:6,ch:829,nm:650,kg:1000,vmax:320,adh:92,fre:93,man:95,fia:40,sty:99,val:1400000,col:'#E8590C',glb:'solus'});
  /* Épave de départ : berline américaine des années 60, rouillée */
  add({id:'epave',nom:'Épave rouillée 1962',an:1962,cat:'Classique',shape:'sedan',tr:'RWD',t:1,ch:105,nm:200,kg:1400,vmax:150,adh:32,fre:22,man:30,fia:25,sty:45,val:700,col:'#7FA7A6',glb:'epave'});
  Object.assign(ENG_OF,{epave:'v8big',touge:'i4t',gts:'i6',rx4:'v6',volta:'ev',rossa:'v8flat',aurion:'v8',solus:'v8flat'});
})();
