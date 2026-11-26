#!/usr/bin/env bash
# Prepara el VPS para Roodada (una sola vez). Uso, desde la carpeta del proyecto:
#   sh scripts/vps/setup.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
HOST=root@217.76.133.242
KEY=~/.ssh/digitaldementia_vps

leer() { grep -E "^$1=" .env.local | head -1 | cut -d= -f2- | tr -d '"' | tr -d ' '; }
URL=$(leer SUPABASE_URL); [ -n "$URL" ] || URL=$(leer NEXT_PUBLIC_SUPABASE_URL)
CLAVE=$(leer SUPABASE_ANON_KEY); [ -n "$CLAVE" ] || CLAVE=$(leer NEXT_PUBLIC_SUPABASE_ANON_KEY)
[ -n "$URL" ] && [ -n "$CLAVE" ] || { echo "Faltan SUPABASE_URL o SUPABASE_ANON_KEY en .env.local"; exit 1; }

scp -q -i "$KEY" scripts/vps/roodada.service scripts/vps/roodada.nginx "$HOST:/tmp/"
ssh -i "$KEY" "$HOST" "ROODADA_SUPABASE_URL='$URL' ROODADA_SUPABASE_KEY='$CLAVE' bash -s" < scripts/vps/remote-setup.sh
