#!/bin/bash
# Vigía del Wi-Fi del bar (adaptador AR9271, ficha #12, apartado 8): el driver ath9k_htc puede quedarse
# bloqueado hasta desenchufar el adaptador. Si la puerta de enlace no responde 5 minutos seguidos, se
# recarga el driver (como mucho una vez cada 10 min). No reinicia la Pi: si el que falla es el router del
# bar, reiniciar no arregla nada.
# Lo lanza alcoholimetro-red.timer cada minuto (como root).
IFACE="${1:-wlan1}"
ESTADO=/run/alcoholimetro-red
mkdir -p "$ESTADO"
fallos=$(cat "$ESTADO/fallos" 2>/dev/null || echo 0)
gw=$(ip -4 route show default dev "$IFACE" 2>/dev/null | awk '{print $3; exit}')
if [ -n "$gw" ] && ping -c 2 -W 2 -I "$IFACE" "$gw" >/dev/null 2>&1; then
  echo 0 > "$ESTADO/fallos"
  exit 0
fi
fallos=$((fallos + 1))
echo "$fallos" > "$ESTADO/fallos"
logger -t alcoholimetro-red "sin respuesta de la red por $IFACE ($fallos min)"
ultimo=$(cat "$ESTADO/ultimo" 2>/dev/null || echo 0)
ahora=$(date +%s)
if [ "$fallos" -ge 5 ] && [ $((ahora - ultimo)) -ge 600 ]; then
  logger -t alcoholimetro-red "recargo el driver ath9k_htc"
  echo "$ahora" > "$ESTADO/ultimo"
  modprobe -r ath9k_htc && sleep 2 && modprobe ath9k_htc
fi
