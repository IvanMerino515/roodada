#!/usr/bin/env bash
# Vacía la caché de datos reiniciando la web (unos segundos sin servicio). Úsalo cuando Edgar cargue bicis
# o precios y quieras verlos ya, sin esperar a que caduque la caché (como mucho 1 día). No hace falta publicar.
# Uso: sh scripts/vps/refrescar.sh
set -euo pipefail
ssh -i ~/.ssh/digitaldementia_vps root@217.76.133.242 '
  systemctl restart roodada
  for i in $(seq 1 20); do curl -fsS -o /dev/null -m 5 http://127.0.0.1:3100/robots.txt && { echo "✓ Web reiniciada con los datos al día"; exit 0; }; sleep 2; done
  echo "✗ No responde tras reiniciar: lanza sh scripts/vps/estado.sh"; exit 1
'
