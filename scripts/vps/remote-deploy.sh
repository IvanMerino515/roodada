#!/usr/bin/env bash
# Compila y publica Roodada en el VPS. Lo lanza scripts/vps/deploy.sh después de subir el código.
# Si la versión nueva no responde, vuelve sola a la anterior.
set -euo pipefail
R=/srv/roodada

chown -R roodada:roodada "$R/src"
install -m 600 -o roodada -g roodada "$R/.env" "$R/src/.env.production"

echo "→ Compilando (2-3 minutos)"
sudo -u roodada -H bash -c "cd $R/src && npm ci --no-audit --no-fund --loglevel=error && npm run build" 2>&1 | grep -vE '^\s*$' | tail -25

echo "→ Preparando la versión nueva"
rm -rf "$R/app.new"
cp -a "$R/src/.next/standalone" "$R/app.new"
cp -a "$R/src/.next/static" "$R/app.new/.next/static"
cp -a "$R/src/public" "$R/app.new/public"
# Caché de imágenes y páginas fuera de la versión: sobrevive a las publicaciones
rm -rf "$R/app.new/.next/cache"
ln -s "$R/cache" "$R/app.new/.next/cache"
chown -R roodada:roodada "$R/app.new"

echo "→ Cambiando de versión"
rm -rf "$R/app.old"
[ -d "$R/app" ] && mv "$R/app" "$R/app.old"
mv "$R/app.new" "$R/app"
systemctl restart roodada

for i in $(seq 1 30); do
  if curl -fsS -o /dev/null -m 5 http://127.0.0.1:3100/robots.txt; then
    echo "✓ Roodada publicada y respondiendo"
    exit 0
  fi
  sleep 2
done

echo "✗ La versión nueva no responde: vuelvo a la anterior"
journalctl -u roodada -n 30 --no-pager || true
if [ -d "$R/app.old" ]; then
  rm -rf "$R/app.fallida"; mv "$R/app" "$R/app.fallida"; mv "$R/app.old" "$R/app"
  systemctl restart roodada
fi
exit 1
