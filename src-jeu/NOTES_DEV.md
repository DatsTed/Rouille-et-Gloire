# High & Rouillé v1.0 : notes de développement

## Structure
- `game/index.html` : le jeu complet (un seul fichier, ~13 Mo, limite 16 Mo). Three.js r128 chargé depuis cdnjs.
- Le code vient d'une chaîne de correctifs appliqués dans l'ordre (new6 à new46) : chaque couche enveloppe ou remplace des fonctions des précédentes. Une fonction redéfinie plus tard l'emporte ; une `const` ne peut pas être redéfinie.

## Couches récentes
- new33-34 : collisions drag, swipe des paquets, podium auto
- new35 : version, notes de mise à jour, thèmes musicaux de course
- new36 : niveaux du labo, rôles clandestins
- new37 : onglets Atelier et Équipe, tutos de menus, flèches de fiche (retirées en v0.64)
- new38 : paquets ciblés
- new39-41 : vues x1/x3, swipe entre fiches véhicule
- new42 : labo (chrono, floraison, swipe de plantes, jardinier progressif, tuto chaleur et police)
- new43 : ambiance du labo (musique reggae/dub/chill, décor cannabis)
- new44 : marché des voitures (x1/x3, recherche, filtres)
- new45 : navigation à 7 onglets, parcours de début, sauvegarde, qualité graphique
- new46 : 5 circuits et 3 circuits de drift générés (`trkGen`), branchés sur `startSpa`

- new47 : navigation à 5 onglets (Cartes dans Marché ; Labo, Base, Équipe dans Atelier), labo en page, croisement guidé, tout planter, fusion en masse, paquets ciblés en cartes, tri des épreuves, correctif drag arcade
- new48 : v1.2 — carrousel de paquets unique (aléatoires, ciblés, Paquet Voiture 50 000 cr), achat ×1/×5/×10 (packMulti), missions clandestines (adultes + labo, MISSIONS avec flag ill), contenu illégal masqué si S.age18 !== true
- new23 (pinball) : 8 tables ; moteur de rampes/ponts (T.ramps, état de bille 'ramp', spline Catmull-Rom) et banques de cibles (T.drops) ; new31 : écran d'âge au 1er lancement (sheet age st:2), charte à l'atteinte du niveau du labo

## Circuits générés
`NTRK` décrit chaque circuit (points de contrôle, largeur). `trkGen` produit le tracé, la physique, la grille de surfaces et le maillage au même format que le Spa. `trkUse(id)` charge le bon circuit avant chaque manche ; en cas d'erreur, retour sur le Spa.

## Ce qui n'est pas vérifié
Le rendu 3D réel (décor du labo, circuits), l'audio à l'oreille, le toucher sur téléphone et l'équilibrage sur une longue session.

## v1.3
- new23: saucers repositioned (scan), closed hole = pass-through, speed gate, ramp mouths at walls.
- new48: pcar tok:50, openCarPack pays tokens when k==='tok' (sheet.k kept for "Encore un").
- new49: pad49() wraps vRace (spa + circuit non-drag): DRIFT big (pHnd), GAZ big, NITRO small above FREIN. bindRace wrapper binds pHnd for circuit races. CSS in extra5.css (.pad49).
