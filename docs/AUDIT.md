# Audit complet — High & Rouillé (v2.14 → v2.15)

Branche : `audit-opus`. Ce document liste tout ce qui a été passé en revue, ce qui a été trouvé, corrigé ou laissé (et pourquoi).
Légende des états : ✅ OK · 🔧 corrigé · ✨ terminé / ajouté · ⚠️ à vérifier à la main · ⏸️ laissé (raison donnée).

## 1. Méthode
- **Base de référence** : build + 30 tests existants avant toute modification (27 OK, 3 cassés : `t_minor`, `t_pinbot`, `t_scan`).
- **Robot d'exploration** (`tests/t_crawl.py`, nouveau) : joueur « complet » (niv. 30, adulte, toutes les voitures), ouvre chaque onglet et clique sur **chaque bouton** puis sur chaque bouton de la fiche ouverte (≈ 990 clics), relève erreurs JS, débordements horizontaux et textes coupés, en 390×844 et 360×640.
- **Captures avant / après** (`tests/shots_ui.py`, `tests/shots_v215.py`, `shots9.py`) en vrai rendu 3D (Chrome + SwiftShader sur PC).
- **Bots** : flipper (`t_rampes`), nouvelles bornes (`t_arcade`), Ligue (`t_ligue`, duels automatiques IA 2 contre IA 3), combat (`t_bal4`, `t_cmb_sim`).
- **Sauvegardes** (`tests/t_save.py`, nouveau) : vieille sauvegarde v1, sauvegarde abîmée, sauvegarde vide.
- **Lecture du code** : couches `new6`…`new73`, coque Android, service worker.

## 2. Inventaire

| Zone | Contenu | État | Remarque |
|---|---|---|---|
| Garage | podiums 3D, showroom, placement auto, fiches véhicule | ✅ | aucune erreur au robot |
| Épreuves | Spa, 5 circuits + 3 drifts générés, drag, rallye, concours, piste d'essai, circuits arcade | ✅ | bouton « Retour » coupé dans la préparation → 🔧 |
| Atelier | Fabrication / Recycler / Fusionner, Équipe, Labo | ✅ | « Tout planter » coupé → 🔧 |
| Base | bâtiments | ✅ | |
| Marché | Boutique (voitures, pièces, services), Cartes (paquets) | ✅ | |
| Missions | jour, semaine, paliers, tout récupérer | ✅ | |
| Arène | Rue Néon, Badges, Coupes, Équipe, Shop | ✅ | « La Ligue Néon arrive bientôt » → ✨ Ligue Néon |
| Région Néon | carte 3D, voitures sauvages, stations, grande carte | ✅ | `t_monde`, `t_ui25` OK |
| Combat | duels 3D, ultimes, IA | ✅ | `t_cmb_*` OK |
| Monde 3D | garage, ranch, salle d'arcade | ✅ | |
| Salle d'arcade | 5 bornes jouables + **5 bornes décor non jouables** + comptoir | ✨ | les 5 bornes décor sont devenues jouables (voir §4) |
| Flipper | 9 tables, ponts, clapets, tour + Rolls | 🔧 | XP trop généreuse depuis la v2.14 ; Rolls en volumes → vrai modèle |
| Labo / Réseau | plantes, équipe clandestine, argent sale, blanchiment | ✅ | masqué aux mineurs (`t_minor` OK) |
| Pilote | carte, compétences, succès | ✅ | |
| Cinématiques | intro, éveil niv. 10 | ✅ | `t_lv10` OK |
| Écran d'âge | 1er lancement | ✅ | vérifié en capture |
| Sauvegarde | locale + nuage | 🔧 | sauvegarde illisible écrasée sans copie |
| Android | WebView, mises à jour | 🔧 | bouton retour quittait le jeu |
| PWA | service worker réseau d'abord | ✅ | pas besoin de changer la version du cache |

## 3. Problèmes trouvés

| # | Gravité | Zone | Problème | Correction | État |
|---|---|---|---|---|---|
| 1 | Haute | Lancement | `polFix` s'exécutait avant le chargement de la sauvegarde (`S` indéfini) : erreur à **chaque** lancement, et les doublons de patrouille n'étaient jamais corrigés | appel différé (`setTimeout`) dans `new56` | 🔧 |
| 2 | Haute | Android | le bouton retour fermait l'appli depuis n'importe quel écran | `window.rgBack()` (fiche, borne, Région, onglet) + `onBackPressed` dans `MainActivity` (sinon l'appli passe en arrière-plan) | 🔧 ⚠️ à tester sur l'APK |
| 3 | Haute | Interface | en thème clair du téléphone : cartes blanches à côté de panneaux néon sombres (deux styles mélangés) | identité unique « Néon Rouillé » sombre (`new74`, `extra9.css`) | 🔧 |
| 4 | Moyenne | Barre du haut | avec de gros montants, la page dépassait l'écran (+5 à +10 px), bouton son coupé | montants compacts (1,3 M / 501 k) quand ça ne tient pas | 🔧 |
| 5 | Moyenne | Barre du haut | le texte d'XP écrasé ne montrait plus qu'un « ( » | masqué quand trop étroit, l'XP passe dans le filet sous la barre | 🔧 |
| 6 | Moyenne | Flipper | depuis la v2.14 (5 billes, clapets), le bot dépasse 1 M de points : 2 parties suffisaient pour le niveau max | XP = 8·√score (identique à 40 000 points, plus douce au-delà) ; rivaux du classement remis à l'échelle | 🔧 |
| 7 | Moyenne | Sauvegarde | une sauvegarde illisible était remplacée par une partie neuve sans copie | copie `KEY_illisible_<date>` + message | 🔧 |
| 8 | Moyenne | Arcade | 5 bornes de la salle sans jeu (INVADERS, CHALLENGE, COSMO, FIGHT, TIR) | 4 nouveaux jeux + Défi du jour | ✨ |
| 9 | Moyenne | Arène | Ligue Néon annoncée « bientôt » depuis la v1.7 | Ligue Néon complète | ✨ |
| 10 | Basse | Interface | « Retour » / « Tout planter » coupés dans leur bouton | `white-space:normal` sur ces boutons | 🔧 |
| 11 | Basse | Interface | toast en pastille blanche, hors charte | pastille néon | 🔧 |
| 12 | Basse | Flipper | Rolls-Royce de la table 9 en volumes | vrai modèle 3D de la Phantom (Albion Majestic), peinture champagne | 🔧 |
| 13 | Basse | Tests | `t_pt2.py` absent (t_v11/t_v12/t_minor), faux positif « ranch » dans « franchis », `t_pinbot`/`t_scan` sans argument par défaut | recréé / corrigé | 🔧 |
| 14 | Basse | Notes | caractères abîmés dans `NOTES_DEV.md` (v2.13) | corrigés | 🔧 |

## 4. Ajouts (inachevé terminé)
- **Salle d'arcade** : 👾 Néon Invaders (niv. 8), 🚀 Cosmo Nitro (niv. 9), 🎯 Tir aux Jantes (niv. 11), 🥊 Choc des Pare-chocs (niv. 12), 🎱 Défi du jour (niv. 3, une borne + un score par jour, 25 tickets bonus). Cadre commun : décompte, fond néon, record / rang / plafond de tickets sur la carte d'intro. Comptoir : jetons Néo, pièce Épique, pièce d'arcade Légendaire.
- **Ligue Néon** : 4 Élites (niv. 47-49) + le Maître Albion (niv. 50, Phantom), d'une traite ; défaite = retour à la 1re Élite ; 1er titre = voiture d'exception. Difficulté mesurée (équipe niv. 50 aléatoire, IA 2) : Élites 55-98 %, Maître ≈ 15 % — c'est le boss final, une équipe choisie et les objets font la différence.

## 5. Laissé tel quel (et pourquoi)
- **Économie des courses** : récompenses et coûts cohérents entre eux dans les simulations courtes ; aucun exploit trouvé (l'arcade rapporte au plus ≈ 1 200 cr / min avec un très bon score, comparable aux courses). Un rééquilibrage sans données de vraies sessions risquerait de casser la progression de Ted → à juger sur une longue session.
- **Paliers du flipper (12 000 / 40 000 / 100 000)** : non modifiés, car les paliers déjà obtenus sont mémorisés par leur valeur ; les changer redonnerait des récompenses.
- **7 onglets en bas** : serré en 360 px mais lisible ; pas de suppression d'onglet sans l'accord de Ted.

## 6. Vérifié / non vérifié
- **Vérifié** (PC, vrai navigateur, 3D réelle) : aucune erreur JS sur ≈ 990 clics, tous les tests verts, captures avant / après, bots des nouvelles bornes, simulation de la Ligue, vieilles sauvegardes.
- **Non vérifié** : toucher réel sur téléphone (surtout les 4 nouvelles bornes et le pavé du flipper), audio à l'oreille (les nouvelles bornes utilisent les bips de l'arcade), bouton retour dans l'APK (compilé par GitHub Actions), équilibrage sur longue session, performances sur un téléphone d'entrée de gamme.
