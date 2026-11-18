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
