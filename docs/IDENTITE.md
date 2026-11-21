# Charte graphique « NÉON ROUILLÉ » (v2.15)

L'identité part de ce qui existait déjà dans le jeu (néon cyan / magenta, police Chakra Petch, titres Bungee, fond quadrillé, liseré rasta de la marque « High ») et la rend **unique et cohérente partout**. Elle est codée dans `src-jeu/extra9.css` ; le thème sombre est imposé par `new74.js`.

## Idée
Un garage de nuit sous les néons : de l'asphalte bleu nuit, des lumières franches, et une pointe de **rouille** (orange cuivré) pour rappeler le nom. Arcade et tuning, jamais « appli de bureau ».

## Couleurs
| Rôle | Jeton | Valeur | Usage |
|---|---|---|---|
| Fond | `--bg` | #06071A | fond de page, halo cyan en haut et magenta en bas |
| Surface | `--surface` | #0C0E26 | barres, fiches |
| Carte | `--raised` | #13163A | lignes, cartes (verre fumé : reflet blanc 4 % → 1 %) |
| Trait | `--line` | #2A2F66 | séparations |
| Texte | `--ink` / `--muted` | #ECEEFF / #9097C6 | texte / texte secondaire |
| Action | `--accent` | #00E5FF (cyan) | boutons principaux, onglet actif, liens |
| Rare / arcade | `--mag` | #FF2BD6 (magenta) | rareté, salle d'arcade, multiplicateurs |
| Gains | `--yel` | #FFD400 (jaune) | crédits, records, objectifs |
| Validation | `--good` | #3CFF9E (vert) | réussites, récolter |
| Danger | `--bad` | #FF4D6D | pertes, verrous |
| Marque | `--rust` | #FF7A3D (rouille) | liserés de marque (dégradé cyan → magenta → rouille) |

Règle : une couleur = un sens. Le cyan agit, le jaune rapporte, le magenta brille, le vert valide.

## Typographie
- **Titres** : Bungee, capitales, interlettrage 0,05 em, dégradé blanc → cyan pâle + halo, filet néon dégradé sous le titre de page.
- **Texte** : Chakra Petch (400 à 700), chiffres tabulaires pour les scores.

## Formes
- Coins arrondis 14 px (cartes), 12 px (boutons), 22 px (haut des fiches) ; le badge de niveau garde ses coins coupés (signature).
- Barre d'accent de 3 px à gauche des lignes ; liseré dégradé « marque » en haut des fiches.

## Composants
- **Bouton principal** : dégradé existant, reflet blanc en haut, s'enfonce d'1 px au toucher. **Bouton secondaire** : contour cyan, fond cyan à 6 %.
- **Barre d'onglets** : verre dépoli, onglet actif = icône qui monte + trait lumineux en haut.
- **Fiche** : monte avec un léger ressort, voile flouté derrière.
- **Toast** : pastille néon arrondie (plus de bloc blanc).
- **Bornes d'arcade** : carte magenta à halo, icône qui flotte, pastilles record / rang / tickets ; même cadre de jeu pour toutes les nouvelles bornes (décompte 3-2-1, grille néon en perspective, bandeau de score en haut).

## Mouvement
Entrées de page en 0,3 s (fondu + 8 px), fiches à ressort, pulsation douce de ce qui attend une action (prochain adversaire de la Ligue). Tout est coupé si le téléphone demande moins d'animations (`prefers-reduced-motion`).

## À ne pas faire
Pas de fond blanc, pas de nouvelle couleur sans rôle, pas de texte gris sur gris, pas d'animation qui bloque une action.
