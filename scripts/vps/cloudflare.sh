#!/usr/bin/env bash
# Prepara Nginx para tener Cloudflare delante (una vez, ANTES de activar la nube naranja).
# Uso: sh scripts/vps/cloudflare.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
ssh -i ~/.ssh/digitaldementia_vps root@217.76.133.242 'bash -s' < scripts/vps/remote-cloudflare.sh
