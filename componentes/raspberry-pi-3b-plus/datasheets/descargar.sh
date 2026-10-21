#!/usr/bin/env bash
# Descarga los documentos oficiales de la Raspberry Pi 3B+ en esta carpeta.
# Uso: ./descargar.sh
set -euo pipefail
cd "$(dirname "$0")"

P=https://pip-assets.raspberrypi.com/categories
URLS=(
  "$P/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf"
  "$P/532-raspberry-pi-3-model-b/documents/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf"
  "$P/532-raspberry-pi-3-model-b/documents/RP-008336-DS-1-raspberry-pi-3-b-plus-mechanical-drawing.dxf"
  "$P/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf"
  "$P/532-raspberry-pi-3-model-b/documents/RP-008160-DS-1-raspberry-pi-3-b-plus-case-mechanical-drawing.pdf"
  "$P/797-pcn/documents/RP-003337-PC-1-Pi3B_%20Revision%209%20PCN.pdf"
  "$P/534-approvals/documents/RP-001265-CF-3-rpi-3bplus%20EU%20Declaration%20of%20Conformity%20(DoC).pdf"
  "$P/534-approvals/documents/RP-000116-CF-1-FCC.pdf"
  "$P/534-approvals/documents/RP-000092-CF-1-CB%20certificate.pdf"
  "https://datasheets.raspberrypi.com/camera/picamera2-manual.pdf"
)

for url in "${URLS[@]}"; do
  nombre=$(basename "$url" | sed 's/%20/_/g')
  echo "-> $nombre"
  curl -fL --retry 3 -o "$nombre" "$url"
done
echo "Listo."
