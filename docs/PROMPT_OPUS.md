# Mission : audit complet et mise à neuf de « High & Rouillé »

Tu reprends mon jeu mobile **High & Rouillé** (RPG/TCG de voitures + courses + flipper + combat + labo + mini-jeux), un seul fichier HTML (Three.js r128), emballé en PWA et en APK Android. Version actuelle : **v2.14**. Tu travailles avec moi (Ted) : **réponds toujours en français**.

## 0. Avant tout : prends connaissance du projet
1. Lis `CLAUDE.md` (règles de travail, structure, chaîne de build) et `src-jeu/NOTES_DEV.md` (historique des couches `newNN.js`, toutes les versions jusqu'à la v2.14).
2. Construis le jeu depuis `src-jeu/` : `patch5.py` → `build.py` → (`mkgame.py` seulement à la fin). Python : `$env:LOCALAPPDATA\Programs\Python\Python312\python.exe`, avec `PYTHONUTF8=1` et `-X utf8`. Pas de Node. Tests : Playwright Python dans `src-jeu/tests/`.
3. Lance **tous** les tests existants et note l'état de référence avant de toucher à quoi que ce soit. Connus et déjà expliqués : `t_v11/t_v12/t_minor` lisent un `t_pt2.py` absent du dépôt (à recréer ou à remplacer par un équivalent) ; `t_monde` échoue si un jeu lourd tourne sur le PC (CPU) ; les erreurs réseau `Failed to load resource` sont normales (réseau bloqué). **En revanche, l'erreur console `polFix TypeError: Cannot read properties of undefined (reading 'offres')` est un vrai bug à corriger.**

## 1. L'objectif
Ton rôle : **tout vérifier, tout passer en revue, ne laisser aucun problème de côté**, puis **donner une touche de neuf à tout le jeu** pour qu'il soit propre, cohérent et agréable de bout en bout. Tu as carte blanche pour retravailler en profondeur ce qui le nécessite (maps, épreuves, mini-jeux, interfaces, équilibrage) et pour **terminer ce qui n'a pas été fini**. Exemple connu : **la salle d'arcade** (comptoir, onglets, mini-jeux, récompenses) — inventorie ce qui manque ou est à moitié fait et finis-le. Ne te contente pas de ce que je liste ici : cherche toi-même ce que j'ai oublié.

## 2. Méthode (par phases, avec points de contrôle)
- **Phase 1 — Inventaire** : liste tout le contenu du jeu dans `docs/AUDIT.md` (écrans, onglets, boutons, cartes/maps, circuits, épreuves, courses, Région Néon, Rue Néon, mode Combat/Arène, labo, paquets, missions, garage, boutique, flipper et ses 9 tables, mini-jeux de la salle d'arcade, tutoriels, mises à jour, réglages…). Pour chaque ligne : état (OK / à corriger / inachevé), problème, correction.
- **Phase 2 — Audit** de chaque zone avec les check-lists du §3. Joue réellement avec des scripts Playwright (bots, simulations longues, captures d'écran 2D **et 3D réelles** : sur PC la 3D se teste dans un vrai navigateur, fais-le).
- **Phase 3 — Corrections** par petits lots cohérents, chaque lot avec son test, sans casser le reste (relance toute la suite à chaque lot).
- **Phase 4 — Touche de neuf** (§4).
- **Phase 5 — Finitions et inachevé** (§5).
- **Phase 6 — Validation finale** + rapport honnête (§7).

## 3. Check-lists d'audit (tout doit être passé en revue)
**Équilibrage** : économie complète (crédits, jetons, prix des paquets/voitures/pièces, coûts d'amélioration, récompenses des courses/épreuves/missions/flipper/combat, XP et courbe de niveaux, argent sale du labo), boucles d'exploitation possibles (argent infini, XP trop rapide, déblocages sautés), difficulté des IA et des adversaires, durée d'une session, progression niveau par niveau (déblocages : 9 tables de flipper aux niveaux 1-2-4-6-8-10-13-16-18, etc.). Chiffre tout avec des simulations (bots) et corrige les extrêmes. Flipper en particulier : le bot a atteint plus de 1 M de points en 150 s sur certaines tables avec les billes en plus (jusqu'à 5) et les clapets (multiplicateur fixé ×2/×3) — vérifie que ça reste raisonnable face aux paliers et aux classements.
**Bugs visuels** : débordements, textes coupés, tailles sur 360×640, 390×844 et 412×915, scroll qui remonte tout seul, boutons trop petits, superpositions, zones vides, emojis qui s'affichent mal, mode sombre/clair, rotation d'écran, safe-area des téléphones, rendu 3D (circuits, labo, flipper : caméra, ombres, transparences, z-fighting), mini-cartes, animations saccadées.
**Bugs de code** : erreurs console (`polFix` en tête), exceptions silencieuses, fonctions redéfinies par les couches `newNN.js` (conflits, `const` en double, fonctions qui fuient en global), écouteurs d'événements et contextes WebGL non libérés, timers qui continuent hors écran, états impossibles, références mortes, code mort.
**Sauvegarde** : compatibilité avec les **anciennes sauvegardes** (valeurs par défaut des nouvelles clés, migrations), corruption, `S.seenVer` et notes de mise à jour, remise à zéro.
**Cycle de vie mobile** : pause quand l'appli passe en arrière-plan (`visibilitychange`), bouton retour d'Android, mise en veille, coupure réseau (le jeu doit tourner hors ligne : PWA, `sw.js`, version du cache à incrémenter), APK.
**Performance** : téléphone d'entrée de gamme (3D, DMD du flipper, particules, tailles de textures), taille du fichier (**limite 16 Mo, actuellement ≈14 Mo** : n'ajoute pas de gros assets sans compenser).
**Audio** : sons manquants/trop forts/en double, musique, bouton muet respecté partout, absence de bruit de moteur dans la Région.
**Textes** : fautes de français, cohérence des noms (tables, voitures, pièces, modes), cohérence des tutoriels et des aides (ex. `ARC.pin.d`), notes de mise à jour.
**Règles de contenu** : **pas de gameplay de « cuisine d'amphétamines »** (refusé) ; contenu illégal masqué aux mineurs (`S.age18 !== true`) — revérifie tous les chemins (labo, missions clandestines, argent sale, textes, icônes).
**Cohérence générale** : navigation à 5 onglets, noms, icônes, couleurs, vocabulaire, même logique de boutons (son, caméra, quitter) dans toutes les épreuves, pas de menu du bas dans les épreuves, minicartes sous les boutons de son, aucune impasse (écran sans sortie).

## 4. Touche de neuf (sans trahir l'identité néon/arcade du jeu)
Unifie le style (palette, typographies, espacements, ombres, coins arrondis), soigne les transitions, les écrans de récompense, les animations de victoire/défaite, les micro-interactions (boutons, compteurs, pastilles), les icônes, les écrans de chargement et de titre, les sons de retour. Rends le premier lancement et le tutoriel plus clairs. Si un écran est vraiment faible, **refais-le**. Garde ce qui marche et que j'aime : le flipper 3D avec son écran à points, le pavé de course, les ponts dessinés à la main, la chasse de pièces façon Pokémon Pinball, la Rolls-Royce de la table 9.

## 5. Ce qui est inachevé / à finir
Commence par **la salle d'arcade** : fais l'inventaire de tous ses jeux et onglets, termine ce qui est à moitié fait (contenu, récompenses, progression, interface, sons), assure-toi que chaque mini-jeu a des règles claires, une fin, un récap, une récompense équilibrée et un lien cohérent avec le reste du jeu. Cherche ensuite tout autre « TODO », écran vide, bouton sans effet, texte provisoire, fonctionnalité annoncée mais absente, et termine-le ou retire-le proprement.

## 6. Mes règles de travail (non négociables)
- **Ne pousse rien sur GitHub sans mon accord.** Travaille sur une **branche** (`audit-opus`), commits réguliers et clairs, et demande-moi avant de fusionner dans `main` / avant `mkgame.py` + push (le workflow ne lance pas la chaîne `src-jeu/` : c'est `game/index.html` qui est publié).
- **Économise le quota** : pas de gros fichiers inutiles, pas de rebuilds ou de captures à répétition, travaille par lots, garde `docs/AUDIT.md` et `src-jeu/NOTES_DEV.md` à jour pour pouvoir reprendre après une compaction de contexte.
- **Sépare honnêtement le vérifié du non vérifié** : vérifié = logique, tests simulés, bots, captures 2D et rendu 3D réel testé sur PC (dis-le) ; non vérifié = toucher réel sur téléphone, audio écouté, équilibrage sur longue session, sensations. Ne dis jamais « c'est bon » sans preuve.
- Mode test actif dans ma sauvegarde (niveau 10, toutes les voitures, argent) : **ne l'enlève pas** sans que je le demande.
- Chaque `newNN.js` est une couche qui enveloppe/remplace les précédentes : pour changer un comportement, modifie la dernière couche concernée ou ajoute-en une ; mets à jour `GAME_VER` et `PATCH['x.y']` dans `new35.js` (v2.15 ou v3.0 selon l'ampleur) et les notes de mise à jour.

## 7. Livrables
1. `docs/AUDIT.md` : inventaire complet, chaque problème (gravité, zone, correction ou raison du report).
2. Le jeu corrigé et rénové sur la branche `audit-opus`, build OK, **tous les tests verts** (corrige/recrée ceux qui sont cassés ou manquants et ajoute-en pour chaque correction importante).
3. Captures avant/après (3D réelles pour le flipper, les circuits et le labo) des écrans les plus changés, envoyées à Ted.
4. Un rapport final en français : ce qui a été trouvé, corrigé, refait, terminé ; ce qui reste (et pourquoi) ; ce qui est vérifié et ce qui ne l'est pas ; ce que je dois tester avec mes mains sur téléphone.

Rien ne doit rester de côté : si tu hésites entre « laisser » et « corriger », corrige ou documente clairement pourquoi tu laisses.
