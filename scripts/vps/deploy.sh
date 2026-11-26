#!/usr/bin/env bash
# Publica en el VPS lo que hay en esta carpeta (haz commit antes). Uso, desde la carpeta del proyecto:
#   sh scripts/vps/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
HOST=root@217.76.133.242
KEY=~/.ssh/digitaldementia_vps

if [ -n "$(git status --porcelain)" ]; then
  echo "Aviso: hay cambios sin commit; se publican igualmente."
fi
echo "→ Subiendo el código ($(git rev-parse --short HEAD))"
rsync -az --delete -e "ssh -i $KEY" \
  --exclude node_modules --exclude .next --exclude .git --exclude '.env*' \
  --exclude '* 2*' --exclude .DS_Store --exclude tsconfig.tsbuildinfo --exclude '.claude' \
  ./ "$HOST:/srv/roodada/src/"
ssh -i "$KEY" "$HOST" 'bash -s' < scripts/vps/remote-deploy.sh
