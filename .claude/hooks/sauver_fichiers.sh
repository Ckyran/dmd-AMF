#!/usr/bin/env bash
# Copie dans fichiers-recus/ chaque fichier envoyé dans la conversation (dossier des envois de Claude Code),
# une seule fois par contenu, et l'inscrit dans fichiers-recus/INDEX.md. Lancé à chaque message (UserPromptSubmit).
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
DEST="$ROOT/fichiers-recus"
UPLOADS="${CLAUDE_UPLOADS_DIR:-$HOME/.claude/uploads}"
mkdir -p "$DEST"
[ -f "$DEST/.empreintes" ] || : > "$DEST/.empreintes"
[ -f "$DEST/INDEX.md" ] || printf '# Fichiers reçus\n\n| Date | Fichier | Taille |\n|---|---|---|\n' > "$DEST/INDEX.md"
[ -d "$UPLOADS" ] || exit 0
nouveaux=()
while IFS= read -r -d '' f; do
  h=$(sha256sum "$f" | cut -d' ' -f1)
  grep -q "^$h " "$DEST/.empreintes" && continue
  nom=$(basename "$f" | sed -E 's/^[0-9a-f]{8}-//')
  cible="$(date +%F)_$nom"
  i=2; while [ -e "$DEST/$cible" ]; do cible="$(date +%F)_${i}_$nom"; i=$((i+1)); done
  cp "$f" "$DEST/$cible" || continue
  echo "$h $cible" >> "$DEST/.empreintes"
  taille=$(du -h "$DEST/$cible" | cut -f1)
  echo "| $(date +%F) | [$cible]($cible) | $taille |" >> "$DEST/INDEX.md"
  nouveaux+=("fichiers-recus/$cible")
done < <(find "$UPLOADS" -type f ! -name ".*" -print0 2>/dev/null)
if [ ${#nouveaux[@]} -gt 0 ]; then
  echo "Fichiers envoyés sauvegardés dans le dépôt : ${nouveaux[*]}. Les committer et pousser sur la branche courante (voir CLAUDE.md)."
fi
exit 0
