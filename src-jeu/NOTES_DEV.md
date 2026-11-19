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

## v2.3 : une cinématique par ultime (new66)
- `CBFX[id]` (16 effets) : `charge(k,t)` / `fire(u,t)` / `onImpact` / `impact(u,t)` / `post(u,t)`, `camMode` (follow, sky, wide, target, orbit) ou `camFn`, `snd` (famille sonore). Cadre : `cbUlt3d` / `ultTick` / `ultEnd` (0–1,5 s charge, 1,5–2,7 s tir, impact, retour caméra, 4,2 s max). Les objets d'effet ont `renderOrder` 8–10 : sans cela le sol transparent de l'arène les recouvre. Test visuel : lancer `cbUlt3d({id,s:0})` dans un duel puis geler `CB3.U.K=1e9`.

## v2.4 : palier Mythique (new67)
- `TIERS[7]` « Mythique » (#FF2BD6), poids de tirage `CPW[7]=.4`, réservé à `majestic` et `steppe` (stats au-dessus des Hypercars). Le tier 7 n'est ni en concession ni à la casse (filtres `t<=cl+1`).
- Piège corrigé : dans `new66`, une `function` déclarée dans le bloc `if(window.THREE){}` devient globale (Annex B) et écrasait `burst()` du jeu. Les fonctions de ce bloc doivent avoir des noms uniques (`ubBurst66`, `ubStep66`) ou être des `const`.

## v2.5 : course sur un seul écran, Région avec l'interface des épreuves (new68 + extra8.css)
- Épreuves : `body.racing #nav{display:none!important}` (un `!important` plus ancien de extra5 gardait la barre visible), `main` sans défilement (sauf `.race.fin`), l'écran 3D `.rs` prend `clamp(…, 100dvh − 376px, 440px)` et la mini-carte (`.mslot` / `#rmap`, flex 1) remplit le vide sous les boutons. Spa : `#mini` déplacé dans `.mslot` (sauf Piste d'essai, qui garde son coin) et dessiné en 192×300 (rep dans patch5).
- Région : `wDom` refait avec les classes des épreuves (`.race.wrace`, `.rwrap > .rs`, `.hud`, `.padS.pad49`, rangée `Son / Caméra / Remettre sur la route / Quitter`, carte `#wMap` en radar centré sur le joueur). Les identifiants `wSpd, wKnob, wNit, wNitT, wNitG, wZone, wAct, wTeam, wMap, wSteer, wBrk, wHnd, wGas, wGasP` sont conservés car `wHud`/`wTick` les lisent.
- `wSpawn` : dos au garage (`T.ga`), décalé latéralement vers l'arche principale si elle est en face. `ACT.wcam` cycle `S.camv` (partagé avec les épreuves) ; `wCam68` règle la caméra après `wTick`. `ACT.wresp` recentre sur la route la plus proche.
- Grande carte : `W.bv={z,cx,cz}`, pincer / molette / glisser / boutons ; `.hud-bot` a `z-index:7` donc `#wov .wbig` est à 30.
- Test : `tests/t_ui25.py` (390×844 et 360×640).

## v2.6 : pastille d'équipe, argent sale, équipe du labo (new69)
- `ACT.cbtmq` : la pastille `.cbtm-n` (zone de toucher élargie en CSS) ajoute / retire la voiture de l'équipe de combat sans ouvrir la fiche ; le reste de la ligne ouvre toujours la fiche de combat.
- Argent sale : `S.dirty` (`dirtyN()`, `dirtyAdd()`), coefficient `DIRTY_K=1.25`. `ACT.rsell`/`ACT.lsell` (enveloppés par `asDirty`), `illResolve` (livraisons) et les ventes d'employés créditent `S.dirty` au lieu de `S.cr`. Les courses à mise propre et les salaires restent en crédits propres.
- Blanchiment dans l'onglet Réseau (`washCard`, `LDR`) : filières chronométrées (`F.wash.ops`, fin = horodatage, tirage `r` fait au lancement), nombre de filières `1+⌊niveau labo/3⌋` ; `ACT.illgod` = course à mise sale (`R.dirtyBet`, gérée par `dirtyBetEnd`).
- Équipe : `empTick` réécrit (remplace new21 + enveloppe de new36), énergie `empDrain` (24 h pour un employé moyen), repos `EMP_REST` 60 min à `EMP_REC` 1,7 %/min, repos automatique `T.auto`, plafond hors-ligne `EMP_CAP` 1 440 min. Journal `T.log` agrégé par heure et par employé (`eLog`), compteurs à vie `e.st`, onglet Registre dans `vEquipe`. Les roles clandestins (`irri/nut/chim/dealer/chauf/avo`) passent par `empIll2`/`empSell2`.
- Test : `tests/t_lab26.py`.

## v2.7 : labo stable (new70)
- Le défilement de la fiche du labo sautait après un clic : `ranchSheet` restaurait `scrollTop` avant que d'autres couches (`decor36` barre de niveau, `decor42` boutons de floraison / minuteries, `pkTok27`) n'ajoutent des éléments ; l'ancrage automatique du navigateur déplaçait alors la position. `new70` enveloppe `renderSheet` en dernier : `overflow-anchor:none`, position remise après tout le dessin, retour en haut seulement si l'onglet / la boutique / la plante change.
- Fiche plante : classe `plantv` sur `#sheet` (CSS extra8) masque `.rhero`, `.rtabs` principal, `.labtools`, `.topsw`.
- Boutique : `RY.qty` accepte 1/5/10/50 (new27).
- Test : `tests/t_lab26.py` (section v2.7) ; il échoue si `new70` est retiré.

## v2.8 : le flipper en 3D (new71)
- `pin3dMake(S3,host,topCv)` (new71) dessine le flipper avec Three.js ; la physique et les règles restent dans `GAMES.pin` (new23). `S3` est un objet de lecture (segments, bumpers, flippers, billes…) construit dans la fermeture de `GAMES.pin` ; `R3` (null si 3D indisponible : pas de THREE / WebGL, `window.__pin3dOff`) est appelé par `draw()` → `draw3()`, qui ne dessine plus que la surcouche 2D (étincelles, points, combo, messages, jauge du piston, légende du trou) en passant par `R3.proj(x,y,z)`.
- Monde : X = x−180, Z = y−300, Y vers le haut. Caméra en perspective (`PITCH` 54°) ajustée pour que tout le plateau tienne (`fitCam`). Le plateau est une texture peinte (840×1320) par table (`paintField`) ; les rails fixes sont fusionnés en deux maillages ; les éléments mobiles (bumpers, cibles, moulins, portes, rampes…) sont mis à jour à chaque image dans `render`.
- Les décroissances (`hit`, `glow`, `shake`) faites autrefois par le dessin 2D sont refaites dans `draw3`.
- Qualité : `S.q==='low'` (ou `__lq`) → pas d'antialias et densité ≤ 1,1 ; la densité passe à 1 si l'image est lente (45 ms) pendant 90 images.
- Tests : `tests/t_pin3d.py` (3D + repli 2D) ; les tests historiques `t_pin3`, `t_pinfix`, `t_pinx` passent sans réseau, donc sur le repli 2D.

## v2.9 : flipper plein écran, sons, moteur de la Région (new23, new71, new72)
- Flipper : `bar` masquée (plus de boutons) ; la surcouche 2D (`cv`) et la 3D couvrent toute la scène (`OW`×`OH`), `R3.proj` renvoie des pixels CSS. Lancer : appui sur le côté droit avec une bille au piston → `charging`, relâchement → `launch()` (le même pointeur actionne le flipper droit). Pastilles radar / turbo : `.pinside` (colonnes, à droite de `st`).
- Trous : aimant et capture élargis dans `stepBall` (garage : portée 2,7 r, capture < 1,15 r et < 780 px/s ; trou de table : portée 2,9 r, capture < 0,85 r ou < 1,08 r à < 780 px/s).
- Flash supprimé : plus de `PM.pulse` dans le dessin 2D ni dans les lumières 3D.
- 3D : meuble (`cab`), bac arrière peint par table (`paintBack`), sol `gridTex`, textures `brushTex` / `rubberTex`, motifs de plateau par table dans `paintField`.
- Sons : `PM.sfx(kind,arg)` et `PM.rollSet(vitesse)` (new72), appelés depuis `GAMES.pin` via `sfx()`.
- Région : `wEngTick` (new72) crée un moteur avec `mkEng(engType(modèle))` et l'alimente avec `engUpdate` (vitesse, gaz, nitro) ; coupé à la sortie, en duel / fiche ouverte il baisse.
- Test : `tests/t_pin3d.py` complété (plus de boutons, lancer au maintien, pastilles, garage, sons).

## v2.10 : ponts, garage et trous (new23, new71)
- `layoutTable(T)` (new23) recalcule à la première charge d'une table : embouchures de rampes (`M1`/`M2` pour deux ponts, `M0` au centre pour un seul) au milieu bas, `mr` 23, vitesse mini 210, alignement mini 0,62 ; trajet en courbes de Bézier jusqu'au garage ; garage (`T.sauc`) choisi parmi quelques emplacements libres en haut à gauche en évitant les objets (bumpers mobiles inclus) ; trou de changement de table (`T.hole`) sur un côté, à ≥ 60 px du garage et des embouchures ; clous (`T.posts`) à ≥ 40 px des barres rebondissantes.
- La fin d'une rampe place la bille dans le garage (`b.st='hold'`, éjection + récompense par `mission`), au lieu de la relancer.
- 3D : hauteur de rampe 0,5 aux deux bouts, largeur qui s'évase à l'entrée, anneau lumineux = zone de capture ; sol et plateau en dalles (`tileTex`).
- Mesures : `tests/t_rampes.py` (le bot prend la rampe ; avant : 0 fois sur 6 tables, maintenant 1 à 5 fois par bille) et `tests/t_chaleur.py` (carte de passage de la bille). Vérifications de disposition dans `t_pin3d.py`.
