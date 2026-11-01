#!/bin/bash
# Vigía de la salida a internet por el módem 4G (Huawei E3372h-320 en modo HiLink, desde el 01-11-2026; antes era el
# Wi-Fi del bar con el AR9271). El módem es una tarjeta de red USB (eth1). Si internet no responde por ella 5 minutos
# seguidos, se desconecta y se vuelve a conectar el módem por software (sysfs «authorized»), como mucho una vez cada
# 10 min: así se recupera cuando el módem se queda colgado. No reinicia la Pi: si lo que falla es la cobertura,
# reiniciar no arregla nada.
# Lo lanza alcoholimetro-red.timer cada minuto (como root).
IFACE="${1:-eth1}"
ESTADO=/run/alcoholimetro-red
mkdir -p "$ESTADO"
fallos=$(cat "$ESTADO/fallos" 2>/dev/null || echo 0)

# dispositivo USB del módem (el padre de la interfaz USB); se guarda para poder reconectarlo aunque la interfaz desaparezca
usb=$(readlink -f "/sys/class/net/$IFACE/device/.." 2>/dev/null)
if [ -n "$usb" ] && [ -e "$usb/authorized" ]; then
  echo "$usb" > "$ESTADO/usb"
else
  usb=$(cat "$ESTADO/usb" 2>/dev/null)
fi

if ping -c 2 -W 3 -I "$IFACE" 1.1.1.1 >/dev/null 2>&1 || ping -c 2 -W 3 -I "$IFACE" 8.8.8.8 >/dev/null 2>&1; then
  echo 0 > "$ESTADO/fallos"
  exit 0
fi
fallos=$((fallos + 1))
echo "$fallos" > "$ESTADO/fallos"
logger -t alcoholimetro-red "sin internet por $IFACE ($fallos min)"
ultimo=$(cat "$ESTADO/ultimo" 2>/dev/null || echo 0)
ahora=$(date +%s)
if [ "$fallos" -ge 5 ] && [ $((ahora - ultimo)) -ge 600 ]; then
  echo "$ahora" > "$ESTADO/ultimo"
  if [ -n "$usb" ] && [ -w "$usb/authorized" ]; then
    logger -t alcoholimetro-red "reconecto el módem 4G ($usb)"
    echo 0 > "$usb/authorized" && sleep 3 && echo 1 > "$usb/authorized"
  else
    logger -t alcoholimetro-red "no encuentro el módem 4G en el USB: revisa que esté bien enchufado"
  fi
fi
