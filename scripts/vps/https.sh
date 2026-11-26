#!/usr/bin/env bash
# Certificado HTTPS de Let's Encrypt para roodada.com y www (una vez, DESPUÉS de apuntar el DNS al VPS).
# certbot lo renueva solo. Uso: sh scripts/vps/https.sh
set -euo pipefail
ssh -i ~/.ssh/digitaldementia_vps root@217.76.133.242 \
  "certbot --nginx -d roodada.com -d www.roodada.com --redirect --non-interactive --agree-tos -m info@roodada.com && systemctl reload nginx && echo '✓ HTTPS activo'"
