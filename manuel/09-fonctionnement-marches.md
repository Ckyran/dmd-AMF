# Thème 9 — Fonctionnement et organisation des marchés

> **Poids à l'examen : 7 questions sur 120.**
> - **§9.2 : 2 questions en catégorie A** (ordres et séance de bourse) ;
> - §9.1 (2), §9.3 (1), §9.4 (1), §9.5 (1) en catégorie C.
>
> Les **types d'ordres** et la **priorité prix puis temps** sont des points A faciles à gagner.

---

## 9.1 Les lieux et modes d'exécution

### Les plateformes de négociation (MIF 2)
| Lieu | Définition | Exemples / à retenir |
|---|---|---|
| **Marché réglementé (MR)** | Système **multilatéral** géré par une **entreprise de marché**, avec des **règles de fonctionnement et d'admission très précises**. Le statut est accordé par le **ministre de l'Économie, sur proposition de l'AMF**. | **Euronext Paris, compartiments A, B et C**, classés selon la **capitalisation boursière** (A > 1 Md€, B de 150 M€ à 1 Md€, C < 150 M€) |
| **SMN / MTF** (système multilatéral de négociation) | Fait **se rencontrer de multiples intérêts acheteurs et vendeurs**. On peut y négocier des actions **déjà admises sur un MR de l'EEE**, et des titres qu'il admet lui-même. | **Euronext Growth** (PME), **Euronext Access** (ex-marché libre, petites entreprises non admises sur un MR) |
| **OTF** (système organisé de négociation) | Plateforme multilatérale **réservée aux obligations, produits structurés, quotas d'émission et dérivés**, **jamais aux actions** | |
| **Internalisateur systématique (IS)** | Un **PSI** qui, de façon **organisée, fréquente et systématique**, **exécute les ordres de ses clients face à son compte propre**, **en dehors** d'un MR, d'un MTF ou d'un OTF | Il se porte **directement contrepartie** du client |
| **Gré à gré (OTC)** | Transaction bilatérale, hors plateforme | **Aucune protection contre le risque de contrepartie** (pas de garantie de bonne fin). Le **FOREX** (marché des changes) en est l'exemple. |

**Les règles à retenir**
- L'**entreprise de marché** (Euronext, **entreprise privée**) est une **société commerciale**.
  - Elle **organise les négociations** (actions, obligations, dérivés).
  - Elle fixe les **règles de suspension** des cotations en cas de forte variation des cours.
  - Elle **calcule les indices** (le CAC 40).
- MIF 2 **interdit la négociation régulière des actions de gré à gré** (obligation de négociation des actions sur une plateforme).
- Les **dérivés soumis à l'obligation de compensation** ne peuvent pas se négocier sur un **IS** : seulement sur un MR, un MTF ou un OTF.
- Un PSI peut **grouper** les ordres de ses clients, entre eux ou avec son compte propre, **sous conditions**.
- **Matières premières** : un marché de **couverture** du risque de prix. Les entités non financières vérifient que leur négoce reste **accessoire** grâce à un **ratio**.

> 🧠 **« MR et MTF = multilatéraux ; OTF = pas d'actions ; IS = le PSI joue contre son client. »**
> ⚠️ Euronext Growth est un **MTF**, pas un marché réglementé. Euronext Access et le Forex **ne sont pas** des marchés réglementés.

### Comptant, terme et SRD
- **Marché au comptant** : règlement et livraison immédiats (à J+2).
- **Marché à terme** : la transaction est **conclue aujourd'hui à un prix fixé**, pour une exécution **ultérieure**.
  - Les dérivés **listés** sont **standardisés** (échéances, montants) et peuvent être négociés sur un **MR**.
  - Les dérivés **de gré à gré** s'exécutent **hors MR**.
- **SRD** (service de règlement différé) :
  - il permet de **négocier à terme** : **différer le paiement** des titres achetés, ou la **livraison** des titres vendus, au **dernier jour de bourse du mois** ;
  - c'est un service payant (commission) ;
  - il est réservé à certaines valeurs du marché réglementé.

> 🧠 **SRD = « Je Règle à la fin du mois » (dernier jour de bourse).**

<!-- IDS:9.1 -->
📌 **Questions de la base — §9.1 (36)** : 154, 875, 2039, 2040, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2050, 2051, 2110, 2111, 2112, 2118, 2138, 2140, 2153, 2159, 2161, 2177, 2178, 2179, 2180, 2181, 2182, 2191, 2201, 2204, 2208, 2635, 2675, 2676, 2733
<!-- /IDS -->

---

## 9.2 Les ordres et la séance de bourse à Paris (catégorie A)

### Les types d'ordres
| Ordre | Prix | Ce qu'il faut savoir |
|---|---|---|
| **Au marché** | **Aucune limite de prix** | **Prioritaire sur tous les autres**. Exécuté **immédiatement** aux **meilleurs prix disponibles** du carnet, en une ou plusieurs fois, dans la limite des quantités. On **ne maîtrise pas le prix**. |
| **À cours limité** | **Prix maximum à l'achat**, **prix minimum à la vente** | Exécuté **à la limite ou à un meilleur cours**. Il **garantit le prix**, mais **ni l'exécution, ni le moment, ni la quantité**. |
| **À la meilleure limite** | **Aucune indication de prix** à la saisie | Il **devient un ordre à cours limité au prix de la meilleure offre en face** (meilleure demande pour une vente) **au moment de son arrivée** |
| **Indexé** (*pegged*) | Suit le marché | Il **suit en permanence la meilleure offre ou la meilleure demande** du carnet |
| **À seuil de déclenchement** (*stop*) | Un **seuil** déclenche l'ordre | Une fois le seuil atteint, il devient un ordre au marché. Un stop **de vente** fixe un cours **auquel et au-dessous duquel** on vend, pour limiter les pertes. |
| **À plage de déclenchement** (*stop limit*) | Un seuil **et** une limite | Il devient un ordre à cours limité une fois le seuil atteint |
| **Iceberg** | Ordre à **quantité cachée** | Seule une partie de la quantité est affichée |

**Durée de validité** : sans indication, un ordre est **valable pour la journée** (ordre « **jour** », retiré le soir s'il n'est pas exécuté). Il peut aussi être **à date déterminée** ou **à révocation**.

> 🧠 **« AU MARCHÉ = à tout prix, en premier ; LIMITÉ = mon prix ou mieux ; MEILLEURE LIMITE = le prix d'en face à l'arrivée ; STOP = je déclenche à partir d'un seuil. »**
> ⚠️ Un acheteur fixe un **maximum** ; un vendeur fixe un **minimum**.

### La priorité d'exécution dans le carnet
**1. Le prix, puis 2. l'heure d'arrivée** (priorité stricte de prix, puis de temps). La **taille de l'ordre** ne compte **jamais**.

- Les ordres **comparables** d'un PSI sont exécutés **dans l'ordre de leur réception**.
- Quand un ordre **groupé** est **partiellement exécuté**, la SGP **répartit au prorata**, selon sa **politique d'allocation**.

> 🧠 **« Prix d'abord, chrono ensuite. »**

### La séance de bourse sur Euronext Paris (actions en continu)
| Heure | Phase | Ce qui se passe |
|---|---|---|
| **7 h 15 – 9 h** | **Préouverture** | Les ordres **s'accumulent**, **aucune transaction**. Euronext diffuse **au fil de l'eau un cours théorique d'ouverture**. Les ordres peuvent être modifiés ou annulés. |
| **9 h** | **Fixing d'ouverture** | Le cours est celui qui **maximise le volume échangé** |
| **9 h – 17 h 30** | **Négociation en continu** | **Chaque ordre est confronté immédiatement** aux ordres de sens opposé |
| **17 h 30 – 17 h 35** | **Préclôture** | Accumulation des ordres |
| **17 h 35** | **Fixing de clôture** | Le **cours de clôture** est le **cours de référence du jour** |
| **17 h 35 – 17 h 40** | **TAL** (*trading at last*) | Exécutions **au cours de clôture** |

- **Cotation au fixing** (une ou deux fois par jour) : pour les **valeurs peu liquides** (Euronext Access, par exemple). Les ordres sont **accumulés puis confrontés tous ensemble**.
- **Cotation en continu** : pour les valeurs liquides.
- **Réservation et suspension** : si le cours franchit les **limites de variation**, la cotation est **suspendue temporairement quelques minutes**, pas jusqu'au lendemain. La **suspension** d'un titre sert à **garantir la bonne diffusion d'une information** à tous. Elle n'est ni définitive, ni décidée par l'AMF seule.
- **Marché dirigé par les prix** (*quote driven*) : les prix viennent des **fourchettes des teneurs de marché**. **Marché dirigé par les ordres** : le cours naît de la **confrontation des ordres dans le carnet**.
- Le **code ISIN** est l'**immatriculation internationale unique d'un instrument financier**. Le LEI, lui, identifie les acteurs (§9.3).
- Les **OAT pour les particuliers** ont **en permanence un cours** représentatif.

> 🧠 **« 7 h 15 j'empile, 9 h je fixe, 9 h - 17 h 30 je traite, 17 h 35 je clôture, jusqu'à 17 h 40 je finis au dernier cours. »**

<!-- IDS:9.2 -->
📌 **Questions de la base — §9.2 (50)** : 2053, 2056, 2057, 2058, 2059, 2060, 2061, 2063, 2065, 2067, 2068, 2070, 2071, 2072, 2073, 2075, 2076, 2077, 2078, 2113, 2114, 2120, 2121, 2126, 2129, 2130, 2133, 2134, 2143, 2149, 2150, 2162, 2164, 2165, 2166, 2167, 2172, 2183, 2184, 2186, 2192, 2193, 2197, 2202, 2205, 2209, 2210, 2661, 2753, 2754
<!-- /IDS -->

---

## 9.3 Transparence pré-négociation et post-négociation

| | **Pré-négociation** (avant la transaction) | **Post-négociation** (après) |
|---|---|---|
| **MR et MTF** (actions) | Publier les **5 meilleures limites à l'achat et à la vente**, avec les quantités. Exigences **identiques** pour un MR et un MTF. | Publier **en temps réel** le **prix, le volume et l'heure** de chaque transaction |
| **Marché dirigé par les prix** | **Meilleurs prix à l'achat et à la vente de chaque teneur de marché** | |
| **IS** | Publication de prix **pour les transactions jusqu'à la taille standard de marché** | |
| **Gré à gré** (actions cotées) | | Publication via un **dispositif de publication agréé (APA)** |

- La transparence post-négociation s'applique **à tous les modes d'exécution**, et les règles MIF 2 sont **harmonisées pour tous les instruments**.
- **Non publié** : le **nom des PSI** qui ont transmis les ordres.
- Les cours sont **publiés par l'entreprise de marché**. Elle peut **différer la publication avec l'accord de l'AMF**, et **rend compte chaque jour à l'AMF** des ordres et transactions.
- Les **dark pools** sont des plateformes pour **ordres de grande taille, sans transparence pré-négociation**.
- Le **LEI** (*Legal Entity Identifier*) est l'**immatriculation mondiale unique des acteurs** (personnes morales). Il **facilite le contrôle des risques par les autorités** et est **attribué en France par l'INSEE**.

> 🧠 **« ISIN = l'instrument ; LEI = l'entité (l'acteur). »**

<!-- IDS:9.3 -->
📌 **Questions de la base — §9.3 (20)** : 2049, 2079, 2080, 2081, 2082, 2084, 2087, 2088, 2115, 2122, 2127, 2151, 2163, 2168, 2173, 2187, 2198, 2206, 2212, 2755
<!-- /IDS -->

---

## 9.4 Les participants, le reporting et le trading algorithmique

### Les participants
| Participant | Rôle |
|---|---|
| **Teneur de marché** (*market maker*) | Il **assure la liquidité** en **affichant en permanence des prix d'achat et de vente**. Il a un **accès direct et continu** à la négociation. Son activité exige un **accord avec la plateforme**. |
| **Animateur de marché, apporteur de liquidité** | Il **transmet en continu des prix** à l'achat et à la vente pour un titre et **amortit la volatilité** |
| **Contrat de liquidité** | Conclu entre un PSI et **toute société cotée** (pratique de marché admise) |
| **Membre négociateur** (broker) | Les intermédiaires **non membres** d'Euronext **transmettent leurs ordres à un membre négociateur** |

### Le reporting des transactions à l'AMF
Les **PSI** déclarent la **liste de tous les ordres exécutés**, **avec l'identification des clients**, **au plus tard à la fin du jour ouvrable suivant** (J+1).

### Le trading algorithmique et à haute fréquence
- **Trading algorithmique** : un **algorithme fixe automatiquement les paramètres des ordres**, avec une intervention humaine limitée ou nulle. Il peut servir à placer des ordres *stop-loss*. Il **n'est pas forcément à haute fréquence**, et pas réservé aux MR.
- **Trading à haute fréquence** : **plus de 2 messages par seconde** sur un même instrument et une même plateforme.
- **Obligations MIF 2** :
  - les PSI **notifient l'autorité**, **testent leurs algorithmes** et **marquent leurs ordres** ;
  - les MR **identifient** les ordres algorithmiques et les algorithmes utilisés.

<!-- IDS:9.4 -->
📌 **Questions de la base — §9.4 (17)** : 2092, 2094, 2095, 2098, 2116, 2123, 2135, 2139, 2141, 2155, 2170, 2188, 2194, 2199, 2203, 2207, 2756
<!-- /IDS -->

---

## 9.5 Les données de marché et les agences de notation

### Les diffuseurs de données
- Ils **centralisent l'information** de tous les acteurs. Les données financières couvrent **les instruments, les émetteurs et les marchés**.
- **Euronext** diffuse des données sur les titres cotés et **calcule le CAC 40**, le principal indice de Paris. Le **Dow Jones** compte **30 valeurs**.
- **Reuters** et Bloomberg sont des agences d'**information** ; **Moody's**, S&P et Fitch des agences de **notation**.
- L'**INSEE** calcule le **PIB**.

### Les prestataires de services de communication de données (PSCD)
| Prestataire | Rôle |
|---|---|
| **APA** (dispositif de publication agréé) | **Publie les transactions** réalisées par les entreprises d'investissement **hors plateforme**, **dans les 15 minutes**, de façon **publique et gratuite** |
| **CTP** (système consolidé de publication) | **Agrège** toutes les transactions sur un instrument, toutes plateformes confondues. Les systèmes consolidés sont **possibles et encadrés**. |
| **ARM** (mécanisme de déclaration agréé) | **Déclare les transactions au régulateur** pour le compte des entreprises d'investissement |

> 🆕 Depuis **2022**, la plupart des PSCD sont **agréés et supervisés par l'ESMA**. La base (Q2104) répond encore « l'AMF ou l'ACPR selon leur statut ».
> 🆕 La révision de MiFIR (2024) organise l'arrivée de **« consolidated tapes » européennes** sélectionnées par l'ESMA (obligations d'abord, puis actions) et **interdit le paiement pour flux d'ordres (PFOF)** au plus tard à mi-2026.

### Les agences de notation de crédit
- La note mesure la **perception du risque de crédit** de l'emprunteur **par l'agence** : sa capacité à rembourser, **à court et à long terme**.
- Les agences **publient leurs méthodes** et les **appliquent de façon stable**.
- Elles sont **enregistrées et supervisées par l'ESMA**, ni par l'AMF, ni par la Commission. Elles ne dépendent pas du FMI.

<!-- IDS:9.5 -->
📌 **Questions de la base — §9.5 (22)** : 2099, 2102, 2104⚠️, 2105, 2106, 2107, 2108, 2128, 2132, 2145, 2148, 2152, 2160, 2171, 2175, 2176, 2190, 2195, 2200, 2211, 2213, 2757
<!-- /IDS -->

---

## ⚡ Fiche flash du thème 9
1. **MR** = statut accordé par le **ministre sur proposition de l'AMF** ; Euronext Paris **A, B, C (capitalisation)** ; **Euronext Growth = MTF** ; **Euronext Access** = petites valeurs hors MR.
2. **OTF** : pas d'actions ; **IS** : le PSI exécute face à son compte propre, hors plateforme ; **OTC** : pas de protection contre la contrepartie.
3. **SRD** : paiement ou livraison **le dernier jour de bourse du mois**.
4. **Au marché** = sans limite, **prioritaire** ; **cours limité** = maximum à l'achat, minimum à la vente, exécuté à la limite ou mieux ; **meilleure limite** = devient limité au meilleur prix en face ; **stop** = seuil de déclenchement ; **iceberg** = quantité cachée ; sans précision = **ordre jour**.
5. Priorité : **prix puis heure** (jamais la taille).
6. Séance : **préouverture 7 h 15 (cours théorique) → fixing 9 h (volume maximal) → continu jusqu'à 17 h 30 → fixing 17 h 35 (cours de référence) → TAL jusqu'à 17 h 40**.
7. Fixing = valeurs **peu liquides** ; forte variation = **suspension de quelques minutes**.
8. Pré-négociation MR et MTF : **5 meilleures limites** ; post-négociation : **prix, volume, heure en temps réel** ; nom des PSI **non publié**.
9. **LEI** = acteurs (INSEE) ; **ISIN** = instruments.
10. Reporting des transactions : **J+1 avec l'identité des clients** ; **HFT** : plus de **2 messages par seconde**.
11. **APA** = publie l'OTC sous 15 min, gratuitement ; **CTP** = consolide ; **ARM** = déclare au régulateur.
12. Agences de notation : **risque de crédit**, méthodes publiques, **supervisées par l'ESMA**.
