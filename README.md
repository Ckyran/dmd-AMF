# Manuel de révision — Examen de certification AMF

Ce manuel couvre **les 12 thèmes de la grille de connaissances de l'AMF**, dans l'ordre. Il est construit à partir de **tes deux bases Excel**, fusionnées et vérifiées.
- **2 244 questions uniques** : les 2 045 questions de la base V4 (février 2021, y compris les 107 questions de finance durable du §8.7) et 199 questions plus récentes.
- **Chaque question est rattachée à un sous-thème** et sa notion est expliquée dans la leçon correspondante.
- La leçon renvoie aux numéros de questions (📌) pour que tu t'entraînes sur ton fichier ou sur le [site des lots](#le-site-des-lots-de-120-questions-cette-branche).

---

## Le site des lots de 120 questions (cette branche)

Le dossier `docs/` de cette branche contient un site qui découpe la base fusionnée en **lots de 120 questions respectant la nomenclature de l'examen** : chaque lot reprend le nombre de questions de chaque sous-thème de la grille (33 en catégorie A, 87 en catégorie C). Chaque question est affichée **directement avec sa bonne réponse**, sans les propositions.
- **Les 43 questions dont la réponse est dépassée** par la réglementation (DICI, ICO et PSAN, CIP, minibons, PERP, TTF…) **sont écartées** : les lots puisent dans les 2 201 autres questions.
- **35 lots** couvrent toutes ces questions. Les **lots 1 à 10 n'ont aucune question en commun** : c'est le maximum possible, car le §5.2 ne garde que 20 questions une fois celles sur le DICI écartées, pour 2 places par lot. Dans les lots 11 à 13, seules 2 questions du §5.2 sont déjà sorties. Les lots suivants font sortir les questions restantes ; chaque lot indique combien de ses questions sont nouvelles.
- Les questions sont rangées dans l'ordre des thèmes et des sous-thèmes. Tu peux filtrer un lot par catégorie A ou C.
- Une **question négative** (« laquelle n'est pas… ») est signalée. Quand la bonne réponse renvoie aux autres propositions (« les deux réponses à la fois », « 1 et 2 »…), les propositions sont affichées pour que la réponse ait un sens.
- Les notes de l'annexe A (réponse corrigée, piège, contexte…) s'affichent sous la question concernée.
- Tu peux **cacher les réponses** pour t'interroger, marquer une question « à revoir », marquer un lot comme révisé, ou générer une nouvelle série aléatoire de lots avec les mêmes règles.
- Mode jour / nuit, adapté au téléphone.
- **Ta progression** (lots révisés, questions à revoir, série choisie) est enregistrée sur ton compte Claude quand tu ouvres le site comme artefact dans Claude : tu la retrouves à chaque ouverture et sur tous tes appareils. Ouvert depuis GitHub Pages ou en local, le site la garde dans le navigateur.

**Pour l'ouvrir** : active GitHub Pages sur cette branche (*Settings → Pages → Deploy from a branch*, branche `claude/lots-120-questions`, dossier `/docs`), ou télécharge la branche et ouvre `docs/index.html`.

Les mêmes lots (série de référence) sont dans `donnees/lots/Lots_120_questions.xlsx` (un onglet par lot, plus un onglet « Écartées » avec les 43 questions retirées et la raison) et `donnees/lots/lots_120_questions.csv`.

Le site de cours, quiz et examens blancs se trouve sur la branche `claude/exam-course-feasibility-7rm4hs`.

---

## 1. L'examen en un coup d'œil

| | |
|---|---|
| Questions | **120 QCM** |
| Catégorie **A** (connaissances réglementaires indispensables) | **33 questions**, il faut **au moins 27 bonnes** |
| Catégorie **C** (culture financière) | **87 questions**, il faut **au moins 70 bonnes** |
| Règle | **80 % dans CHAQUE catégorie, sans compensation** |
| Durée | 2 h maximum (sources publiques, à confirmer à l'inscription) |

🎯 **Où sont les points A ?** Thème 2 (6), thème 3 (3), thème 4 (2), §5.1 (4), thème 6 (16) et §9.2 (2). **Le thème 6 porte à lui seul près de la moitié de la catégorie A.**

---

## 2. Sommaire

| Thème | Leçon | Questions à l'examen | Questions dans ta base |
|---|---|---|---|
| 1 | [Cadre institutionnel et réglementaire](manuel/01-cadre-institutionnel.md) | 14 (C) | 274 |
| 2 | [Déontologie et conformité](manuel/02-deontologie-conformite.md) | 6 (**A**) | 112 |
| 3 | [Sécurité financière (blanchiment, corruption, embargos)](manuel/03-securite-financiere.md) | 3 (**A**) | 86 |
| 4 | [Abus de marché](manuel/04-abus-de-marche.md) | 2 (**A**) | 39 |
| 5 | [Commercialisation, démarchage, conseil](manuel/05-commercialisation-demarchage.md) | 6 (4 **A** + 2 C) | 123 |
| 6 | [Relations avec les clients](manuel/06-relations-clients.md) | **25** (16 **A** + 9 C) | 416 |
| 7 | [Instruments financiers, crypto-actifs et risques](manuel/07-instruments-financiers.md) | **21** (C) | 423 |
| 8 | [Gestion collective et finance durable](manuel/08-gestion-collective-finance-durable.md) | **25** (C), dont **15 de finance durable** | 403 |
| 9 | [Fonctionnement et organisation des marchés](manuel/09-fonctionnement-marches.md) | 7 (2 **A** + 5 C) | 145 |
| 10 | [Post-marché et infrastructures](manuel/10-post-marche-infrastructures.md) | 3 (C) | 44 |
| 11 | [Émissions et opérations sur titres](manuel/11-emissions-operations-titres.md) | 2 (C) | 39 |
| 12 | [Bases comptables et fiscales](manuel/12-bases-comptables-fiscales.md) | 6 (C) | 140 |

**Annexes**
- [A — Questions de la base à risque](annexes/A-questions-a-risque.md) : 64 questions dont la réponse est **fausse, absente, dépassée ou piégeuse**. **À lire absolument.**
- [B — Tous les moyens mnémotechniques](annexes/B-mnemotechniques.md) : à relire la veille de l'examen.
- [C — Tous les chiffres clés](annexes/C-chiffres-cles.md) : délais, seuils, montants, pourcentages.
- [D — Ce qui a changé depuis la base (2021 → 2026)](annexes/D-mises-a-jour-2021-2026.md)

**Légende des leçons** : 🧠 moyen mnémotechnique · ⚠️ piège · 🆕 mise à jour · 📌 numéros des questions de ta base (⚠️ après un numéro = voir l'annexe A) · ⚡ fiche flash de fin de thème.

---

## 3. Ce que vaut ce manuel, honnêtement

**Ce qui a été vérifié**
- Les deux fichiers ont été **fusionnés et comparés**.
  - Pour les 2 045 questions communes, la **cellule jaune** du premier fichier et la **lettre de réponse** du second **concordent à 100 %**.
  - Les doublons ont été supprimés.
  - Les 199 questions sans thème ont été classées une à une.
  - La feuille « questions supprimées » (36 questions retirées en V4) a été écartée.
- **Toutes les questions** ont été lues, et chaque notion testée est expliquée. Les 2 244 numéros apparaissent chacun dans exactement une leçon.
- **Problèmes de la base relevés** :
  - **1 erreur** : la Q2670 donne « européen » pour le FSB, qui est **international** ;
  - **1 réponse manquante** : la Q2578 ;
  - **43 réponses dépassées** par la réglementation de 2021 à 2026 (DICI → DIC, MiCA, ECSP, TTF…) ;
  - des pièges signalés. Tout est dans l'[annexe A](annexes/A-questions-a-risque.md).
- Les **calculs** (PER, coupon couru, sensibilité, VL, Sharpe…) ont été vérifiés.

**Ce qui ne peut pas être garanti**
- **Un score de 100 % ne peut être promis par aucun support.** Les questions de l'examen sont tirées d'une base **officielle mise à jour chaque année** par les organismes certificateurs. Ta base date de 2021-2022 : de nouvelles questions existent forcément. Ce manuel vise donc la **compréhension des notions**, pas seulement la mémorisation des réponses, pour que tu réussisses aussi les questions que tu n'as jamais vues.
- **Le droit a changé depuis ta base.** Les mises à jour 🆕 reposent sur mes connaissances (jusqu'à mi-2026), sans accès au site de l'AMF. Les points marqués « à vérifier » doivent être confirmés avec la **grille et les documents officiels en vigueur** à la date de ton examen.
- **Règle pratique** : si une question reprend **mot pour mot** une question de ta base, la réponse attendue est en principe celle de la base, sauf erreur ❌. Si elle est **reformulée** ou porte sur un dispositif récent (MiCA, CSRD, DIC…), réponds selon le **droit actuel**.
- **Finance durable** : l'AMF propose aussi un **examen « Finance durable » distinct** (60 questions). Ce manuel prépare à la partie §8.7 de l'examen général.

---

## 4. Méthode de révision proposée

1. **Lis les leçons dans l'ordre** (1 → 12), une ou deux par jour, en t'arrêtant sur les 🧠 et les ⚠️.
2. **Juste après chaque leçon**, fais toutes les questions de ta base listées en 📌, sans regarder la réponse. Note les numéros ratés.
3. **Repasse les questions ratées** deux jours plus tard, puis une semaine plus tard (répétition espacée).
4. **Priorité en fin de révision** :
   - la **catégorie A** (thèmes 2, 3, 4, §5.1, thème 6, §9.2), où l'erreur coûte le plus ;
   - les **gros volumes C** : thèmes 7, 8 (dont le §8.7) et 1.
5. **Les trois derniers jours** : les [chiffres clés](annexes/C-chiffres-cles.md), les [moyens mnémotechniques](annexes/B-mnemotechniques.md), les [questions à risque](annexes/A-questions-a-risque.md) et les **fiches flash ⚡** de chaque thème.
6. **Lots de 120 questions** : parcours les lots dans l'ordre (1 à 10 d'abord, sans aucune répétition), d'abord réponses visibles, puis réponses cachées pour t'interroger.

## 5. Réflexes de QCM, à utiliser en dernier recours

Ces tendances sont mesurées sur les 2 244 questions de ta base. Elles ne remplacent jamais la connaissance.

| Formulation d'une proposition | Elle est la bonne réponse… |
|---|---|
| « uniquement », « seulement », « exclusivement » | **rarement** (3 à 6 % des cas) |
| « toujours », « jamais », « systématiquement », « obligatoirement » | **rarement** (13 à 18 %) |
| « sous certaines conditions » | **presque toujours** (6 fois sur 6) |
| « dans tous les cas » | souvent (5 fois sur 7) |
| La proposition la plus longue et la plus précise | dans **47 %** des cas (contre 33 % au hasard) |
| « Les deux réponses à la fois » | **8 fois sur 28** seulement : ce n'est pas un bon réflexe |

Lis chaque question **deux fois**. Repère les **négations** (« laquelle est fausse ? », « n'est pas… ») et le **sujet exact** (PSI ou SGP ? client professionnel ou non ? démarchage ou vente à distance ?).

---

## Contenu du dépôt

| Dossier | Contenu |
|---|---|
| `manuel/` | Les 12 leçons, une par thème |
| `annexes/` | Questions à risque, moyens mnémotechniques, chiffres clés, mises à jour |
| `donnees/` | **La base fusionnée** : `Base_AMF_fusionnee.xlsx` (bonnes réponses en jaune, questions à risque en rouge, onglet de répartition), `questions.json` et `questions.csv` (séparateur `;`) |
| `donnees/lots/` | **Les 35 lots de 120 questions** de la série de référence : `Lots_120_questions.xlsx` (sommaire + un onglet par lot) et `lots_120_questions.csv` |
| `docs/` | **Le site des lots** (voir ci-dessus) |
| `outils/construire_lots.py` | Régénère les lots, les données du site et les exports à partir de `donnees/questions.json` |

Pour régénérer les lots après une modification de la base :

```bash
pip install openpyxl
python3 outils/construire_lots.py
```
