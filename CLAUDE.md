# Consignes pour Claude dans ce dépôt

## Ne jamais perdre un fichier envoyé
Les sessions dans le cloud sont effacées au redémarrage : seul ce qui est poussé sur GitHub reste.
- **Fichiers envoyés par l'utilisateur** : le hook `.claude/hooks/sauver_fichiers.sh` les copie automatiquement dans `fichiers-recus/` (une fois par contenu, nommés `AAAA-MM-JJ_nom`) et les inscrit dans `fichiers-recus/INDEX.md`. Dès qu'il signale un nouveau fichier, **commit et push** sur la branche courante. Si le hook n'a pas tourné, faire la même copie à la main.
- **Fichiers produits pour l'utilisateur** (Excel, PDF, tableaux…) : en garder une copie dans `livrables/` et l'ajouter à `livrables/INDEX.md`, puis commit et push.
- **Résultats de travail utiles** (texte extrait par OCR, tableaux de correspondance) : les ranger à côté du fichier source, dans `fichiers-recus/`, plutôt que dans le dossier temporaire.
- Limite GitHub : 100 Mo par fichier.
