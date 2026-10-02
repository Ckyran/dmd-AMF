# Thème 10 — Post-marché et infrastructures de marché

> **Poids à l'examen : 3 questions sur 120, catégorie C** : §10.1 (2) · §10.2 (1).
> Thème court. Il suffit de ne pas confondre les **trois étages** : **chambre de compensation**, **dépositaire central** et **teneur de compte-conservateur**.

---

## 10.1 Les acteurs du post-marché

### La chaîne de traitement d'une transaction
**Négociation** (entreprise de marché) → **Compensation** (chambre de compensation) → **Règlement-livraison** (dépositaire central et teneurs de compte).

| Acteur | Rôle | Moyen de retenir |
|---|---|---|
| **Chambre de compensation** (contrepartie centrale) | Elle **s'interpose** entre l'acheteur et le vendeur par **novation** : elle devient l'**acheteur de chaque vendeur et le vendeur de chaque acheteur**. Elle est la **contrepartie unique**, **garantit la bonne fin** des paiements et livraisons et **protège contre le risque de défaillance**. Elle exige un **dépôt de garantie obligatoire**, fixé par **ses propres règles**, et des **appels de marge**. Elle **publie ses prix et frais** service par service. | 🧠 Le **garant** : « personne ne fait défaut chez moi » |
| **Dépositaire central** (en France : **Euroclear France**) | Il fait le **lien entre les émetteurs et les intermédiaires financiers**. Il **enregistre les titres émis en circulation** sur les comptes de ses adhérents et effectue les **virements de compte à compte** entre participants, réalisant ainsi le **transfert de propriété**. Ses **règles de fonctionnement sont approuvées par l'AMF**. | 🧠 Le **grand registre** |
| **Teneur de compte-conservateur (TCC)** | Il **inscrit les titres sur le compte ouvert au nom de l'investisseur** et administre ce compte (opérations sur titres, informations). Il est **habilité par l'ACPR** ; un **établissement de crédit** peut l'être. Il **sépare obligatoirement** ses avoirs propres de ceux de ses clients. Il **pilote le règlement-livraison** pour son client. | 🧠 Le **banquier des titres** de l'investisseur |
| **TCCP** (teneur de compte-conservateur de parts) | Il tient les comptes d'**épargne salariale**, depuis 2004 | |
| **Centralisateur** | Il **centralise les ordres de souscription et de rachat** d'un OPC et **contrôle l'heure limite** (late trading, thème 4) | |
| **Dépositaire d'OPC** | **Conservation des actifs + contrôle de la régularité des décisions** de gestion (thème 8.1) | |
| **SWIFT** | Le **réseau de messagerie** interbancaire, utilisé pour la plupart des paiements internationaux et pour les instructions de règlement-livraison. Ses adhérents sont identifiés par leur **code BIC**. | |

> 🧠 **« La chambre GARANTIT, le dépositaire central ENREGISTRE (et transfère), le teneur de compte INSCRIT chez le client. »**

### La tenue du passif d'un OPC
C'est la **centralisation des ordres de souscription et de rachat** et la **tenue du compte émission** de l'OPC, c'est-à-dire la **réception et l'enregistrement** des ordres. Il ne s'agit ni de la valorisation, ni du contrôle des ratios.

### Les modes de détention des titres
| Mode | Qui tient le compte ? | Moyen de retenir |
|---|---|---|
| **Au porteur** | L'**intermédiaire financier** (teneur de compte). L'émetteur ne connaît pas nominativement l'actionnaire. | Le mode le plus courant |
| **Nominatif pur** | **L'émetteur lui-même** (ou son mandataire) tient le compte au nom de l'actionnaire | 🧠 **pur** = directement chez l'émetteur |
| **Nominatif administré** | Inscription **au registre de l'émetteur**, mais **gestion par l'intermédiaire financier** de l'actionnaire | 🧠 **administré** = l'émetteur connaît l'actionnaire, la banque gère |

Le **registre des titres nominatifs** est tenu par **l'émetteur lui-même** (ou un mandataire), jamais par l'AMF.

<!-- IDS:10.1 -->
📌 **Questions de la base — §10.1 (29)** : 2215, 2216, 2218, 2220, 2221, 2222, 2223, 2224, 2225, 2226, 2228, 2229, 2230, 2231, 2239, 2240, 2241, 2242, 2244, 2247, 2250, 2251, 2252, 2253, 2254, 2256, 2258, 2259, 2260
<!-- /IDS -->

---

## 10.2 Organisation du post-marché, règlement-livraison et EMIR

### Le règlement-livraison
- **Délai standard en France et en Europe : J+2** jours ouvrés après la négociation (règlement CSDR).
- **Principe de livraison contre paiement** et **délais standard de dénouement**.
- **Le transfert de propriété** s'opère **au dénouement du règlement-livraison**, pas au moment de la négociation. C'est aussi le **fait générateur de l'imposition** (thème 12).
- Les règlements en **monnaie banque centrale** sont **irrévocables**.

> 🧠 **« J+2 : je négocie J, je deviens propriétaire J+2. »**
> 🆕 **Passage à J+1** dans l'Union européenne prévu le **11 octobre 2027**. Pour l'instant, la réponse reste J+2.

### La compensation
- Un **dépôt de garantie est obligatoire**. Sa nature et son étendue sont fixées par les **règles de la chambre**, pas par une autorité européenne.
- Si un client **ne répond pas à un appel de marge**, la chambre peut **clôturer sa position** et **utiliser son dépôt de garantie** pour couvrir la perte.

### Le règlement EMIR (*European Market Infrastructure Regulation*)
- Il porte sur les **dérivés de gré à gré**, **tous les dérivés OTC**, matières premières comprises.
- Il impose :
  1. la **compensation obligatoire par une chambre** des dérivés OTC **standardisables** ;
  2. la **déclaration de toutes les transactions sur dérivés**, **OTC comme sur plateforme**, à des **référentiels centraux** (supervisés par l'ESMA) ;
  3. des **techniques d'atténuation des risques** pour les dérivés non compensés (échange de garanties).

> 🆕 **EMIR 3** (2024) impose aux acteurs européens de **compenser une partie de leurs dérivés auprès de chambres de l'UE** (« compte actif »).
> 🆕 **CSDR** : depuis 2022, les **pénalités en cas de retard de règlement** s'appliquent.
> 🆕 Le système de paiement **TARGET2** a été remplacé par **T2** (2023).

<!-- IDS:10.2 -->
📌 **Questions de la base — §10.2 (15)** : 2157, 2214, 2232, 2235, 2236, 2237, 2245, 2246, 2248, 2249, 2255⚠️, 2261, 2719, 2721, 2760
<!-- /IDS -->

---

## ⚡ Fiche flash du thème 10
1. Chaîne : **négociation → compensation → règlement-livraison**.
2. **Chambre de compensation** = **novation**, **contrepartie unique**, **garantie de bonne fin**, **dépôt de garantie obligatoire** (ses propres règles), appels de marge, clôture de la position si l'appel n'est pas honoré.
3. **Dépositaire central** = **Euroclear France** : lien émetteurs ↔ intermédiaires, enregistre les titres en circulation, **virements de compte à compte = transfert de propriété** ; règles **approuvées par l'AMF**.
4. **TCC** = inscrit les titres **au nom de l'investisseur**, habilité par l'**ACPR**, **ségrégation obligatoire** ; **TCCP** = épargne salariale.
5. **Nominatif pur** = chez l'émetteur ; **nominatif administré** = registre de l'émetteur, gestion par l'intermédiaire ; registre tenu par l'**émetteur**.
6. **Passif d'un OPC** = centralisation des souscriptions et rachats et tenue du compte émission.
7. **J+2** ; **propriété transférée au dénouement** ; livraison contre paiement ; monnaie banque centrale = irrévocable.
8. **EMIR** = **dérivés OTC** : compensation des dérivés standardisés + **déclaration de tous les dérivés**.
9. **SWIFT** = messagerie, adhérents identifiés par le **BIC**.

<!-- NAV -->
---
[⬅️ Thème précédent](09-fonctionnement-marches.md) · [🏠 Sommaire](../README.md) · [Questions à risque](../annexes/A-questions-a-risque.md) · [Mnémos](../annexes/B-mnemotechniques.md) · [Chiffres clés](../annexes/C-chiffres-cles.md) · [Mises à jour](../annexes/D-mises-a-jour-2021-2026.md) · [Thème suivant ➡️](11-emissions-operations-titres.md)
