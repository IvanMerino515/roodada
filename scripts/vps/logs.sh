#!/usr/bin/env bash
# Registros de Roodada en el VPS. Sin argumentos: las últimas 100 líneas.
# Con un texto: solo las líneas que lo contienen en los últimos 7 días (p. ej. «csp», «indexnow», «error»).
# Uso: sh scripts/vps/logs.sh            sh scripts/vps/logs.sh csp
set -euo pipefail
FILTRO=${1:-}
if [ -z "$FILTRO" ]; then
  ssh -i ~/.ssh/digitaldementia_vps root@217.76.133.242 'journalctl -u roodada -n 100 --no-pager'
else
  ssh -i ~/.ssh/digitaldementia_vps root@217.76.133.242 "journalctl -u roodada --since '7 days ago' --no-pager | grep -i -- '$FILTRO' | tail -200"
fi
