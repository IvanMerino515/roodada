#!/usr/bin/env bash
# Preparación del VPS para Roodada (una sola vez). Lo lanza scripts/vps/setup.sh desde el Mac.
# No toca las otras webs: usuario, carpeta, servicio y sitio de Nginx propios.
set -euo pipefail
R=/srv/roodada

echo "→ Comprobaciones"
command -v node >/dev/null || { echo "Falta Node"; exit 1; }
NODE_BIN=$(command -v node)
echo "  Node $(node -v) en $NODE_BIN"
if ss -ltn | grep -q ':3100 '; then
  if ! systemctl is-active --quiet roodada; then echo "El puerto 3100 está ocupado por otra cosa"; exit 1; fi
fi

echo "→ Memoria de intercambio (4 GB) para compilar sin ahogar el servidor"
if ! swapon --show | grep -q '/swapfile'; then
  fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "→ Usuario y carpetas"
id roodada >/dev/null 2>&1 || useradd --system --home-dir "$R" --shell /usr/sbin/nologin roodada
mkdir -p "$R/src" "$R/cache"
chown -R roodada:roodada "$R"

echo "→ Variables (solo si no existen ya)"
if [ ! -f "$R/.env" ]; then
  umask 077
  cat > "$R/.env" <<ENV
NODE_ENV=production
PORT=3100
HOSTNAME=127.0.0.1
NEXT_PUBLIC_SITE_URL=https://roodada.com
SUPABASE_URL=${ROODADA_SUPABASE_URL}
SUPABASE_ANON_KEY=${ROODADA_SUPABASE_KEY}
CRON_SECRET=$(openssl rand -hex 24)
ENV
  chown roodada:roodada "$R/.env"
fi

echo "→ Servicio del sistema"
sed "s#__NODE__#$NODE_BIN#" /tmp/roodada.service > /etc/systemd/system/roodada.service
systemctl daemon-reload
systemctl enable roodada >/dev/null 2>&1

echo "→ Nginx"
cp /tmp/roodada.nginx /etc/nginx/sites-available/roodada
ln -sf /etc/nginx/sites-available/roodada /etc/nginx/sites-enabled/roodada
# Si la configuración no es válida, se retira el sitio para no dejar Nginx roto para las otras webs
if ! nginx -t 2>&1; then
  rm -f /etc/nginx/sites-enabled/roodada
  echo "✗ Nginx no acepta la configuración de Roodada: retirada, las otras webs siguen igual"
  exit 1
fi
systemctl reload nginx

echo "→ Aviso diario a IndexNow (07:00 UTC)"
cat > /etc/cron.d/roodada-indexnow <<'CRON'
0 7 * * * roodada /bin/sh -c '. /srv/roodada/.env; curl -fsS -m 300 -H "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3100/api/indexnow >> /srv/roodada/indexnow.log 2>&1'
CRON
chmod 644 /etc/cron.d/roodada-indexnow

rm -f /tmp/roodada.service /tmp/roodada.nginx
echo "✓ VPS preparado. Siguiente paso: sh scripts/vps/deploy.sh"
