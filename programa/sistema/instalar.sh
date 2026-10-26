#!/bin/bash
# Instala el programa del alcoholímetro en una Raspberry Pi 3B+ con Raspberry Pi OS Lite (Trixie).
# Uso (con el usuario normal, NO con sudo; pedirá la contraseña cuando haga falta):
#   bash sistema/instalar.sh
# Antes: fase 2 del MONTAJE PASO A PASO (config.txt, cmdline.txt, UART probada).
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
USUARIO="$(whoami)"
UIDN="$(id -u)"
if [ "$USUARIO" = "root" ]; then echo "Ejecútalo con tu usuario normal, no con sudo."; exit 1; fi

echo "== 1. Paquetes"
sudo apt-get update
sudo apt-get install -y --no-install-recommends nodejs chromium cage rpicam-apps curl fake-hwclock firmware-ath9k-htc || \
sudo apt-get install -y --no-install-recommends nodejs chromium-browser cage libcamera-apps curl fake-hwclock firmware-ath9k-htc
NODE="$(command -v node)"
V="$("$NODE" -p 'process.versions.node.split(".")[0]')"
if [ "$V" -lt 18 ]; then echo "Hace falta Node 18 o más nuevo (hay $V)"; exit 1; fi
CHROMIUM="$(command -v chromium || command -v chromium-browser)"
echo "   node $("$NODE" -v) · $CHROMIUM"

echo "== 2. Permisos (puerto serie y cámara)"
sudo usermod -aG dialout,video,render,tty "$USUARIO"

echo "== 3. Carpeta de datos (ranking, fotos, cobros) y configuración"
sudo mkdir -p /var/lib/alcoholimetro /etc/alcoholimetro
sudo chown "$USUARIO:$USUARIO" /var/lib/alcoholimetro
sudo chmod 700 /var/lib/alcoholimetro
if [ ! -f /etc/alcoholimetro/config.json ]; then
  sudo cp "$DIR/config.ejemplo.json" /etc/alcoholimetro/config.json
  echo "   creado /etc/alcoholimetro/config.json"
fi
mkdir -p "$HOME/.config/alcoholimetro" && chmod 700 "$HOME/.config/alcoholimetro"
F="$HOME/.config/alcoholimetro/sumup.json"
if [ ! -f "$F" ]; then
  printf '{"api_key": "", "merchant_code": "", "reader_id": "", "app_id": "", "affiliate_key": ""}\n' > "$F"
  echo "   Rellena $F (sin esos datos la pantalla dice que no se puede pagar; para el banco: --gratis)"
fi
chmod 600 "$F"

echo "== 4. Registro del sistema en RAM (la tarjeta dura más) y perro guardián del sistema"
sudo mkdir -p /etc/systemd/journald.conf.d /etc/systemd/system.conf.d
printf '[Journal]\nStorage=volatile\nRuntimeMaxUse=40M\n' | sudo tee /etc/systemd/journald.conf.d/alcoholimetro.conf >/dev/null
printf '[Manager]\nRuntimeWatchdogSec=15\nRebootWatchdogSec=2min\n' | sudo tee /etc/systemd/system.conf.d/alcoholimetro-perro.conf >/dev/null

echo "== 5. Servicios"
for s in alcoholimetro alcoholimetro-kiosco alcoholimetro-red; do
  sed "s|__DIR__|$DIR|g; s|__USUARIO__|$USUARIO|g; s|__UID__|$UIDN|g; s|__NODE__|$NODE|g; s|__CHROMIUM__|$CHROMIUM|g" \
    "$DIR/sistema/$s.service" | sudo tee "/etc/systemd/system/$s.service" >/dev/null
done
sudo cp "$DIR/sistema/alcoholimetro-red.timer" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl disable getty@tty1.service 2>/dev/null || true
sudo systemctl enable alcoholimetro.service alcoholimetro-kiosco.service alcoholimetro-red.timer

echo "== 6. Comprobación rápida del programa (pruebas automáticas, sin hardware)"
(cd "$DIR" && "$NODE" --test pruebas/*.test.js 2>&1 | tail -3)

cat <<FIN

Listo. Antes de arrancar, comprueba (MONTAJE PASO A PASO, fase 2):
  /boot/firmware/config.txt : enable_uart=1 y dtoverlay=disable-bt (NO disable-wifi: el Wi-Fi interno es el punto de acceso del Solo, W29)
  /boot/firmware/cmdline.txt: sin console=serial0,115200 y con  video=HDMI-A-1:1024x600M@60D consoleblank=0
  ls -l /dev/serial0  → ttyAMA0

Arrancar ya:            sudo systemctl start alcoholimetro alcoholimetro-kiosco
Banco sin cobrar:       sudo systemctl stop alcoholimetro && node $DIR/pi/principal.js --gratis
Ver lo que pasa:        journalctl -u alcoholimetro -f
Estado (JSON):          curl -s http://127.0.0.1:8080/estado
Reinicia la Pi para que cojan los grupos y el registro en RAM: sudo reboot
FIN
