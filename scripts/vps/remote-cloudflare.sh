#!/usr/bin/env bash
# Nginx lee la IP real del visitante cuando la petición llega a través de Cloudflare (cabecera
# CF-Connecting-IP), para que los límites por IP de /ir/ y /api/evento sigan funcionando. Solo se fía de
# esa cabecera si la petición viene de una IP de Cloudflare: no cambia nada para quien entra directo.
# Vale para todas las webs del VPS. Lo lanza scripts/vps/cloudflare.sh.
set -euo pipefail
F=/etc/nginx/conf.d/cloudflare-realip.conf

# Si ya hay otra configuración de IP real (por ejemplo de digitaldementia.es), no se duplica
OTRA=$(grep -rl "real_ip_header" /etc/nginx --include='*.conf' --include='*' 2>/dev/null | grep -v "$F" || true)
if [ -n "$OTRA" ]; then
  echo "Ya hay configuración de IP real en: $OTRA"
  echo "No hago nada: pásale esto a Claude para revisarlo."
  exit 1
fi

V4=$(curl -fsS https://www.cloudflare.com/ips-v4)
V6=$(curl -fsS https://www.cloudflare.com/ips-v6)
[ -n "$V4" ] && [ -n "$V6" ] || { echo "No he podido descargar las IP de Cloudflare"; exit 1; }

{
  echo "# IP real detrás de Cloudflare (Roodada, $(date +%F)). Rangos de https://www.cloudflare.com/ips"
  for ip in $V4 $V6; do echo "set_real_ip_from $ip;"; done
  echo "real_ip_header CF-Connecting-IP;"
} > "$F.nuevo"
mv "$F.nuevo" "$F"

if ! nginx -t 2>&1; then
  rm -f "$F"
  echo "✗ Nginx no acepta la configuración: retirada, todo sigue igual"
  exit 1
fi
systemctl reload nginx
echo "✓ Nginx lee la IP real de los visitantes que llegan por Cloudflare ($(grep -c set_real_ip_from "$F") rangos)"
