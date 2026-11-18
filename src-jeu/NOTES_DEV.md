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

## v1.6b : niveau unique et équilibrage
- Un seul niveau par voiture (`c.lvl`, 1 à 50, 60 × niveau XP par palier) : monté en course (`addCarXP`) ou en combat (`cbGainXP` → `addCarXP`). En course, le bonus reste plafonné à l'effet du niveau 20 (`patch5.py`). Migration `S.lvUnified` : on garde le meilleur des deux anciens niveaux.
- Stats de combat : 55 % profil des types + 45 % vraies caractéristiques (poids, puissance, vitesse, maniabilité, fiabilité, adhérence) dans `cbBase`.
- XP de combat `cbXpFor` = (20 + 6 × niveau adverse) × 1,4 en tournoi ; coupes conseillées aux niveaux 5, 10, 16, 24, 32.
- Jauge d'ultime `CB_ENERGY` : 25 au départ, +9 par tour, +15 en touchant, +13 en encaissant (≈ 0,5 ultime par voiture engagée côté IA).
- Les 4 attaques suivent le niveau tant que le joueur ne les a pas modifiées (`s.custom`).
- Arène : sous-onglets en classe `arsw` (les `.topsw` sont effacés à chaque rendu par new47), bouton « Retour aux tournois » ; sol de l'arène 3D texturé.

## v1.6 (new57, new58)
- `new57` : 6 attaques légendaires (100 d'Énergie) + `cbLegend(e)`, mini-cinématiques DOM de 2,2 à 2,7 s (styles beam, sphere, meteor, wave, bolt, spikes, vortex) jouées pour toute attaque à Énergie.
- Ultime attitrée : `cbUltOf(types,niveau)` (ultime du 1er type, légendaire à partir de son niveau). Les attaques à Énergie ne vont plus dans les 4 emplacements ; action `{k:'mv',ult:true}` quand `f.energy>=CB_ENERGY.max` ; jauge +8 par tour, +12 en touchant, +6 en étant touché. Bouton « ⚡ ULTIME » dans le duel, l'IA s'en sert (`cbAI`).
- `new58` : Arène = vraie page `view==='arena'` (`vArena`, sous-onglets `AR.tab` cups/team/shop ; `patch5.py` ajoute `arena:vArena` au rendu). Duel en 3D (`CB3`, `cb3dStart`) : vrais modèles `buildCar`, vue 3/4 en hauteur, voitures face à face ; les repères `#cbC0/#cbC1` et les variables `--p0x…` suivent la projection des voitures pour les effets DOM. Repli SVG si pas de WebGL.

## v1.5 : Éveil cosmique et mode Combat (new51 à new56, extra7.css)
Tout le combat est cloisonné : données dans `S.cmb[uid]`, `S.cbBag`, `S.cbTeam`, `S.cbStat`, `S.cbT` ; rien ne touche aux caractéristiques de course (testé).
- `new51` catalogue (données pures) : `CB_TYPES` (10 types dont Méca), `CB_CHART`/`cbEff` (efficacités), `CB_STATS`, `CB_TPROF` (profils), `CB_ST`/`CB_VOL` (altérations), `CB_WX` (6 météos), `CB_MV_ROWS` → `CB_MV` (112 attaques, effets dans `fx`, description générée par `cbDesc`), `CB_TAL` (38 talents) / `CB_TAL_BY`, `CB_IT` (17 objets), `CB_ENERGY`.
- `new52` fiches : `CB_CARTY` (types par modèle), `cbOf(c)` (création paresseuse : IV 0-31, talent, niveau, 4 attaques), `cbStats`, `cbGainXP`, section « Fiche de combat » de la fiche véhicule, écran « Gérer les attaques » (`cbmoves`). Visible seulement si `S.niveau10CinematicSeen===true`.
- `new53` moteur pur : `cbBattle`, `cbTurn(B,[a0,a1])`, `cbReplace`, `cbAI(B,s,d)` (difficulté 0-3), `cbAutoBattle`. `B.ev` = événements pour l'écran, `B.log` = journal. `CB_DIV=62` règle la longueur des duels.
- `new54` écran de duel `cbStartDuel({team,foes,d,names,trainer,wx,onEnd,onClose,rewardHTML})` (`#cbov`, plein écran, un `#upd` caché bloque les tutos du jeu pendant le duel).
- `new55` éveil : fenêtre `lv10` au niveau 10 (« Plus tard » = 20 min), cinématique `czStart` (3D, sous-titres `CZ_VO`, sons synthétisés), écran `cbunlock`, bouton « Revoir l’éveil » dans Base.
- `new56` : règles patrouille (`carRoll`, `carPrize`, `polFix`, `POL_P=0,2 %`) + Arène (`ACT.arena`), pilotes `CB_PIL`, coupes `CB_CUPS`, équipe (`cbteam`), boutique (`cbshop`), tournoi `S.cbT`.
- `patch5.py` : vélo retiré (voiture + `MODEL_IDS` ; balises `mdl-velo`/`bin-velo` supprimées de `orig.html`), vélos remboursés 600 cr à la migration, plus de patrouille offerte, patrouille exclue de la casse et de la concession.
- Voix off supprimées (`voix50.js`, `voix55.js`) ; le code de lecture reste mais ne fait rien sans données.
- Tests : `t_cmb_data`, `t_cmb_car`, `t_cmb_sim` (mécaniques + simulation, argument = nombre de duels), `t_cmb_ui`, `t_lv10`, `t_cmb_cup`. Sous Windows, lancer Python avec `-X utf8`.

## v1.4 (new50.js, extra6.css)
- Barre du bas à 6 onglets (Base revenu, retiré des sous-onglets de l'Atelier).
- Missions : paliers `lv2…lv30` (catégorie « Paliers », avec m38/m9/m39), `claimBar()` remis en haut.
- Garage 3D : `hubSecret` neutralisé (plus de cloison), `farm().found` mis à 1 dès que le labo est débloqué ; 🎒 masqué hors des cartes GROW (classe `body.inlab50`).
- Spa (TRK.cur nul) : `buildSpa` enveloppé → `spaLines50` ne garde que les lignes de bord de piste, `spaCity50` ajoute ~290 immeubles à fenêtres éclairées et liserés néon, rangés dans les tuiles.
- Paquets : `pkLayout` à ressort, déclic + vibration à chaque paquet, halo `--hc`, étincelles `.fx50`, `burst50()` à l'ouverture et sur les cartes rares.
- Intro : `CS` vidé (plus de texte, le titre final reste), voix off `VOIX50` (synthèse vocale Windows « Paul », WAV 12 kHz) jouée selon `VO50` dans `cineBuild`.
- Pavé de course : volant 130–142 px, pédales plus étroites (extra6.css).

## v1.3
- new23: saucers repositioned (scan), closed hole = pass-through, speed gate, ramp mouths at walls.
- new48: pcar tok:50, openCarPack pays tokens when k==='tok' (sheet.k kept for "Encore un").
- new49: pad49() wraps vRace (spa + circuit non-drag): DRIFT big (pHnd), GAZ big, NITRO small above FREIN. bindRace wrapper binds pHnd for circuit races. CSS in extra5.css (.pad49).

## v1.6 : Rue Néon et badges (new59)
- Arène › sous-onglets `rue` (par défaut), `badges`, `cups`, `team`, `shop` (`vArena` enveloppée : les 3 derniers reprennent l'ancienne page).
- `RUE_PIL` : 12 pilotes de rue (niv. 3 à 40, `bd` = badges requis), `RUE_CH` : 8 champions (1 par type, niv. 8 à 42, à battre dans l'ordre, badge `bn`, météo `wx`, récompense `rw`). Sauvegarde `S.rue={w:{id:victoires},bdg:{type:date}}`.
- `rueFight(id)` → `cbStartDuel` ; gains : rue `rueCr` (25 % en revanche), champion `cbGive(rw)` (30 % en revanche) + badge.
- 3D : `rueBuild` (rue, trottoir, immeubles néon, arènes des champions, lampadaires, voiture de chaque pilote), `rueHuman` (pilote humanoïde en combinaison, casque sur la tête / à la main / sans), étiquettes `rueLabel`, glisser pour se déplacer, toucher = fiche (`rueBind`, mode GL `rue`). Relancée après chaque `render()` de l'onglet Rue.
- Test : `t_rue.py`.

## v1.7 : Région Néon et récaps (new60, new61)
- `new60` : `addCarXP` enveloppé (journal `CXL60` pendant `finalize` et `cbFinish`) → `R.result.cx` / `CBV.res.cx` ; `xpBars60` (barre animée en CSS via `--w0/--w1`) ; récap `.rc60` dans `vResult` et `cbEndHTML` (réécrit) ; vitesse max lue sur `#hSpd` toutes les 100 ms (`VMX60`, `row.vmx`, affichée dans `showOver` et le récap). Métro : `DEST.street` + `ACT.wtravel` + `growEnter('street')` → Arène › Rue (l'ancienne ruelle 3D n'est plus accessible). Badges sur la carte pilote (`.pbdg60`). Garage : sol et mur remplacés dans `buildGarage` (`garTex60`).
- `new61` : Région Néon en surimpression `#wov` (z-index 19, sous les fenêtres), mode GL `world`. `W_TOWNS` (9 villes, `ch` = champion), routes Catmull-Rom échantillonnées tous les 2,5 m (`W.routes[k].P`, grille `W.grid`, `wNear`), demi-largeur `W_HW`. Rubans fusionnés : bitume, lignes, vibreurs dans les courbes, murs bas + murs d'énergie (comme `trkGen`). Barrière `gate` sur la route k ≥ 1 tant que le badge du champion k−1 manque. 3 voitures sauvages par route (cantonnées entre `iA` et `iB`, poursuite < 45 m), contact → `wEncounter` → duel, défaite = retour à `S.rue.town`. Personnages : `rueHuman` ×1,45 ; « Parler » ouvre la fiche `rue`. `render()` relance la carte (`wResume`) ; `rueStart` ne fait rien quand la carte est ouverte.
- Tests : `t_monde.py` (conduite, sauvage, barrière, champion), `t_rue.py`.
- Région : pavé `.padS.pad49.wpad` (volant `wSteer`, gaz dosable, frein, drift `W.in.hand` = adhérence réduite via `P.va`, nitro `wNitro` gratuite 2,5 s / 12 s). Duel perdu = 0 XP (`new54` : `win?1:0`).

## v1.8 : histoire, équipes de 4, voies doubles et stations
- Histoire : `rueOpen` = `rueOpenB` (badges) ET (carte ouverte `W.on` OU pilote déjà battu). La Rue Néon ne sert qu'aux revanches ; `rueLock` indique la ville (`rueTownOf`).
- Équipes : 4 voitures max (`cbTeam`, `cbteampick`, `cbTeamDefault`) ; adversaires `rueN` jusqu'à 4 ; coupes c4/c5 en équipes de 4, boss +1.
- Équilibrage (`tests/t_bal4.py`, équipe de 4 aléatoire, IA niveau 2) : IV adverses `min(17, 8 + 0,25 × niv)` ; au niveau 34+, voitures d'accompagnement à −2, −4, −6 ; Victor niv. 39. Résultat à niveau égal : champions 50–97 % (Nyx ~60 %), pilotes 55–100 %.
- Carte : `W.paths` = voie principale + voie double (`R.alt`) qui se sépare à 20 %, passe sur un pont (`y` jusqu'à 8,5 m, piliers instanciés) au-dessus de la principale à 52 %, et la rejoint à 80 %. `wNear(x,z,y)` pénalise l'écart de hauteur ; les murs s'ouvrent là où une autre voie les traverse. Stations (`W.stations`, `R.st` = 36 %) : `ACT.wfuel`. PV persistants `S.rue.hp` (ratio par voiture) via une enveloppe de `cbStartDuel` quand la carte est ouverte. 2 voitures sauvages par route, poursuite < 30 m, 13 m/s, 5 s max puis 10 s de repos (`wIdxOn`).
- Métro : `DEST.street` = « Région Néon » → `wOpen` ; ligne 2 = street, arcade, beach.

## v1.9 : routes propres, stations, grande carte (new61 retouché, new62)
- Jonctions : la voie double suit une courbe douce (points à 5 %, 20 %, 45 % de l'écart) ; tant qu'elle chevauche la principale (`p.sh`, écart < 2 × `W_HW`), elle n'est pas dessinée et la principale s'élargit de ce côté (`R.fl` / `R.fs`, aussi pris en compte dans la limite latérale). UV du bitume calculées selon la largeur réelle (sinon traces de pneus en zigzag). Matériaux de chaussée en double face.
- Stations : renfoncement `R.bay` (côté opposé à la voie double, ±9 échantillons autour de 36 %, profondeur 13 m) ; auvent « NÉON FUEL », 2 îlots de pompes (collisions `W.col`), boutique derrière le mur, totem des prix avant l'entrée.
- `W.obs` recense lampadaires, arbres, immeubles, piliers ; `wCheckRoad()` (new62) liste ce qui empiète sur une chaussée → doit rester vide (`t_monde.py`).
- new62 : `labelSprite` réduit sa police pour tenir dans le cadre ; grande carte `wBigOpen` (toucher `#wMap`) ; `cbCity62` ajoute immeubles, néons, rues et lampadaires autour de l'arène de duel (hors de l'axe caméra) ; `.card.shiny` : lueur en `inset` (ne déborde plus) ; `.cb-mb em` sous le nom de l'attaque.

## v2.0 : routes séparées + menu de station (new61)
- `wTrace` : la voie double (`R.alt`, `isAlt` = vrai sur ce chemin ; `R.alt` sur la principale pointe vers elle) est un chemin à part, décalé de 26 m, qui part du bord des villes ; rampe douce (16 échantillons) → pont (plateau ±12 échantillons, 5,8 m) au-dessus de la principale avec changement de côté en S → rampe → ville. Plus aucun chevauchement : les anciens `sh`/`fl`/`onOther` sont supprimés.
- Barrière sur les deux chaussées (`Pt.gate`). Portes des villes pour les deux.
- Station : on se gare à moins de 3,6 m du point entre les deux îlots (îlots à 3,8 et 10,6 m du bord) → `ACT.wstation` : fiche `wstation` (soins `wHealCost` + boutique `CB_IT`, `ACT.wheal`).
- HUD : barres « PV » (`#wTeam`).

## v2.1 : jetons Néo, villes carrées, arcade, chien (new63, new64, new61 retouché)
- Jetons Néo : `S.neo`, `neoN()`/`neoT()` (new63). Arène, coupes, champions, pilotes de rue, voitures sauvages, boutique et soins de la station utilisent Néo ; les crédits du jeu de base restent pour les courses. 600 offerts une fois (`S.neoInit`).
- new63 : `cbBoxHTML` (altérations nommées `.cb-sts`), `wEncounter` (choc `crash62`, orbite `W.orbit` 240° puis duel), caméra d'ultime (`cbUlt3d`/`ultTick`, `CB3.U`, 4,2 s : charge devant la voiture → tir → impact → retour), fiche `cbcard` avant d'équiper (`ACT.cbteampick` ouvre, `ACT.cbteamtoggle` confirme).
- Région : villes carrées (`W_R` = demi-côté 50 m, distances de Tchebychev), côtés N/E/S/O (`T.sOut`/`T.sIn`), routes en Bézier perpendiculaires aux arches, 2 arches par côté (principale + voie double à ±13 m). `wTrace` / `wSpawn` / construction des villes dans `wBuild`. Ciel en dôme + skyline lointaine, sol quadrillé, socles sous les immeubles.
- new64 : fond de la Rue Néon (`bgDepth64`), `wGarageDoor` (porte de garage), `buildArcade2` (`arcUpright`, `arcPinball`, `arcPrize`), chien `DOG` (`dogMake`/`dogTick`, garage, labo, ranch, arcade).

## v2.2 : modèles 3D importés (new65, tools_*.py)
- `tools_glb2v2.py <id> <fichier.glb> <longueur> [--q 1.0] [--flip]` convertit un .glb en modèle « v2 » (pièces décimées par couleur, roues séparées, carrosserie repeignable) ; `tools_embed.py <id>` l'ajoute à `models_new.html` ; `new65.js` l'associe à une voiture (`glb`). Dépendances Python : numpy, trimesh, fast-simplification, scipy, networkx, pillow.
- Phantom → `majestic` (5,5 m, ≈ 200 Ko), Tiguan → `steppe` (4,7 m, ≈ 400 Ko, CC BY-NC-SA). Reste 5 voitures en silhouette : piccola, kombi, riva, hauler, fury.
