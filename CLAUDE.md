# High & Rouillé (dépôt DatsTed/Rouille-et-Gloire)

Jeu mobile RPG/TCG de voitures, en **un seul fichier HTML** (Three.js r128 depuis cdnjs, ~13 Mo, limite 16 Mo). Emballé en appli Android (APK) et en PWA via GitHub Actions. Version actuelle : **v1.4**.

## Règles de travail de Ted
- **Réponds toujours en français.**
- Sépare honnêtement ce qui est **vérifié** (logique, tests simulés, captures 2D) de ce qui **ne l'est pas** (rendu 3D réel, audio, toucher sur téléphone, équilibrage). Sur PC, la 3D réelle peut maintenant être testée dans un vrai navigateur : dis-le quand tu l'as fait.
- Économise le quota : pas de gros fichiers ni de rebuilds inutiles. Ne pousse sur GitHub **que si Ted le demande** (idéalement sur une branche, il valide avant la principale).
- Pas de gameplay de « cuisine d'amphétamines » (refusé). Contenu illégal du jeu : masqué aux mineurs (`S.age18 !== true`).

## Structure du dépôt
- `game/` : le jeu publié (`index.html` + PWA : `manifest.webmanifest`, `sw.js`, icônes, `telecharger.html`).
- `android/` : projet Gradle de l'APK (clé de signature `rg-release.jks`, ne jamais la perdre).
- `.github/workflows/build.yml` : à chaque push sur `main`, copie `game/index.html` dans l'APK, compile l'APK signé et publie le site sur GitHub Pages (plus de `projet.zip`). Le workflow ne lance pas la chaîne `src-jeu/` : il faut commiter le `game/index.html` produit par `mkgame.py`.
- `src-jeu/` : **les sources du jeu**. `main.js` et `out.html` sont générés (ignorés par git).
- `docs/NOTES_DEV.md` : ancienne copie des notes ; la version à jour est `src-jeu/NOTES_DEV.md`.
- Manque : `src-jeu/tests/t_pt2.py` (lu par `t_v11`, `t_v12`, `t_minor` pour son `STUB`), absent du paquet de reprise.

## Chaîne de build du jeu (depuis `src-jeu/`)
1. `python3 patch5.py` : lit `main_v011.js`, applique les remplacements et concatène `new6.js … new49.js` → `main.js`. (Les remplacements `rep()` échouent par `assert` si le texte cherché apparaît 0 ou 2 fois : écrire les littéraux avec précision.)
2. `python3 build.py` : assemble `orig.html` + CSS (`extra*.css`) + `models_new.html` + `main.js` → `out.html`.
3. `python3 mkgame.py` : copie `out.html` vers `../game/index.html` en gardant l'en-tête PWA et le service worker.
4. Version / notes de mise à jour : `new35.js` (`GAME_VER`, `PATCH['x.y']`).

## Architecture du code (important)
Chaque `newNN.js` est une **couche** qui enveloppe ou remplace des fonctions des précédentes. Une fonction redéfinie plus tard l'emporte ; une `const` ne peut pas être redéfinie ; les `function` déclarées peuvent être réaffectées (`openPack=function…`). Pour changer un comportement : nouvelle couche (ou la dernière concernée) plutôt que modifier `main_v011.js`.
Couches récentes : `new23` flipper (8 tables, ponts/rampes, banques de cibles, soucoupe GARAGE), `new31` écran d'âge, `new35` version/notes, `new46` circuits générés (`trkGen`), `new47` navigation 5 onglets, `new48` paquets (carrousel ×1/×5/×10, Paquet Voiture 50 000 cr ou 50 jetons) + missions clandestines, `new49` pavé de course (DRIFT, GAZ, NITRO) + mini-carte en surimpression, `new50` v1.4 (Spa néon, Base dans la barre, paliers de missions, paquets animés, voix off de l'intro dans `voix50.js`, CSS dans `extra6.css`). Détails dans `src-jeu/NOTES_DEV.md`.

## Tests (`src-jeu/tests/`, Playwright Python, à lancer depuis `src-jeu/` après `build.py`)
`t_v12.py` (v1.2 : paquets, missions, âge), `t_minor.py` (mineurs), `t_pin3.py` (flipper), `t_first.py` / `t_pinbot.py` / `t_scan.py` (équilibrage du flipper par bot), `t_pad.py` (captures du pavé de course), `t_rm.py` (HTML des courses), `t_ctok.py` (Paquet Voiture en jetons). Ils chargent `out.html` en bloquant le réseau ; les captures vont dans `/tmp` (adapter sous Windows). Le bot de flipper joue parfaitement : ses chiffres sont indicatifs.

## À vérifier avec de vraies mains / vrai rendu
- Pavé de course v1.3 (volant | frein | DRIFT au-dessus de NITRO | GAZ) : dosage du gaz au pouce, tailles.
- Mini-carte en direct des courses hors spéciales (cadre en haut à droite, `#rmap.ov`) : le tracé en direct n'a pas pu être vu sans 3D.
- Flipper v1.3 : GARAGE ne doit plus capter ~4 lancers sur 5 (bot : 8–22 % au premier événement) ; ponts écartés et plus durs à atteindre ; trous fermés = la bille passe dessus.
- Rendu 3D (circuits, labo), audio, équilibrage sur longue session.
