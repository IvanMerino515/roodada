#!/usr/bin/env bash
# Publica en el VPS el commit actual de main, exactamente como está en GitHub. Uso, desde la carpeta del proyecto:
#   sh scripts/vps/deploy.sh
#
# Flujo acordado (27-11-2026): cada uno trabaja en su rama y la sube a GitHub; las ramas revisadas se juntan en
# main y se publica una vez al día, a las 19:00. Para que nadie pise el trabajo de otro, este script se niega a
# publicar si no estás en main, si hay cambios sin commit o si tu main no es igual al de GitHub.
# Emergencia (saltarse las comprobaciones, con cuidado): FORZAR=1 sh scripts/vps/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
HOST=root@217.76.133.242
KEY=~/.ssh/digitaldementia_vps

if [ "${FORZAR:-0}" != "1" ]; then
  RAMA=$(git rev-parse --abbrev-ref HEAD)
  [ "$RAMA" = "main" ] || { echo "✗ Estás en la rama «${RAMA}». Solo se publica main: git checkout main && git pull"; exit 1; }
  [ -z "$(git status --porcelain)" ] || { echo "✗ Hay cambios sin commit. Haz commit y súbelos (git push), o guárdalos (git stash)."; git status --short | head -10; exit 1; }
  git fetch -q origin main
  LOCAL=$(git rev-parse HEAD); REMOTO=$(git rev-parse origin/main)
  if [ "$LOCAL" != "$REMOTO" ]; then
    DETRAS=$(git rev-list --count HEAD..origin/main); DELANTE=$(git rev-list --count origin/main..HEAD)
    [ "$DETRAS" = "0" ] || echo "✗ A tu main le faltan $DETRAS cambios que ya están en GitHub: git pull"
    [ "$DELANTE" = "0" ] || echo "✗ Tienes $DELANTE cambios en main sin subir a GitHub: git push"
    exit 1
  fi
fi

COMMIT=$(git rev-parse --short HEAD)
QUIEN=$(git config user.name || whoami)
echo "→ Publicando $COMMIT ($(git log -1 --format=%s | cut -c1-70))"

# Se sube el commit exacto (git archive), no la carpeta: nada sin commit ni ficheros sueltos
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git archive HEAD | tar -x -C "$TMP"
rsync -az --delete -e "ssh -i $KEY" --exclude node_modules --exclude .next "$TMP/" "$HOST:/srv/roodada/src/"

ssh -i "$KEY" "$HOST" "ROODADA_COMMIT='$COMMIT' ROODADA_QUIEN='$QUIEN' bash -s" < scripts/vps/remote-deploy.sh
