#!/usr/bin/env bash
# Vuelve a la versión anterior publicada (la que había antes del último deploy). Uso: sh scripts/vps/volver.sh
set -euo pipefail
ssh -i ~/.ssh/digitaldementia_vps root@217.76.133.242 '
  set -e
  R=/srv/roodada
  [ -d $R/app.old ] || { echo "No hay versión anterior guardada"; exit 1; }
  mv $R/app $R/app.descartada.$(date +%s)
  mv $R/app.old $R/app
  systemctl restart roodada
  sleep 5
  curl -fsS -o /dev/null http://127.0.0.1:3100/robots.txt && echo "✓ Vuelta a la versión anterior y respondiendo"
'
