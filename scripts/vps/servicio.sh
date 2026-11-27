#!/usr/bin/env bash
# Instala en el VPS la versión de scripts/vps/roodada.service y reinicia Roodada (unos segundos sin servicio).
# Uso, desde la carpeta del proyecto: sh scripts/vps/servicio.sh
# Guarda la anterior en /etc/systemd/system/roodada.service.bak; si algo falla, la vuelve a poner.
set -euo pipefail
cd "$(dirname "$0")/../.."
HOST=root@217.76.133.242
KEY=~/.ssh/digitaldementia_vps

sed 's#__NODE__#/usr/bin/node#' scripts/vps/roodada.service | ssh -i "$KEY" "$HOST" 'bash -c "
set -e
U=/etc/systemd/system/roodada.service
cp \$U \$U.bak
cat > \$U.nuevo
mv \$U.nuevo \$U
systemctl daemon-reload
systemctl restart roodada
for i in \$(seq 1 15); do sleep 2; curl -sf -o /dev/null http://127.0.0.1:3100/robots.txt && break; done
if curl -sf -o /dev/null http://127.0.0.1:3100/robots.txt; then
  echo \"✓ Roodada reiniciada con la configuración nueva\"
  systemctl show roodada -p MemoryHigh -p MemoryMax
else
  echo \"✗ No responde: vuelvo a la configuración anterior\"
  cp \$U.bak \$U; systemctl daemon-reload; systemctl restart roodada; exit 1
fi
"'
