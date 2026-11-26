#!/usr/bin/env bash
# Estado de Roodada en el VPS: servicio, memoria, disco, versión publicada y últimos errores.
# Uso: sh scripts/vps/estado.sh
set -euo pipefail
ssh -i ~/.ssh/digitaldementia_vps root@217.76.133.242 '
  echo "== Servicio";   systemctl is-active roodada; systemctl show roodada -p MemoryCurrent -p ActiveEnterTimestamp | sed "s/MemoryCurrent=/Memoria (bytes): /; s/ActiveEnterTimestamp=/Arrancado: /"
  echo "== Responde";   curl -s -o /dev/null -w "robots.txt → %{http_code} en %{time_total}s\n" http://127.0.0.1:3100/robots.txt
  echo "== Servidor";   free -m | sed -n 1,2p; df -h / | tail -1
  echo "== Versiones";  ls -d /srv/roodada/app /srv/roodada/app.old /srv/roodada/app.fallida 2>/dev/null || true
  echo "== Errores (últimas 24 h)"; journalctl -u roodada --since "24 hours ago" -p err --no-pager | tail -15 || true
  echo "== IndexNow";   tail -3 /srv/roodada/indexnow.log 2>/dev/null || echo "(aún no ha corrido)"
'
