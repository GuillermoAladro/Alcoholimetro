# Antena 4G plana (FPC) y latiguillo CRC9 → SMA

Antena del [módem 4G](../modem-4g-huawei-e3372h/README.md). Es una lámina adhesiva que va pegada **dentro del cajón de componentes**, en su lateral izquierdo, detrás de dos ventanas alineadas: una en el cajón y otra en la carcasa. Por fuera no sobresale nada. Sustituye desde el 01-11-2026 al alargo RP-SMA y a la antena exterior del AR9271 (ahora en [retirados](../retirados/alargo-antena-rp-sma-30cm/README.md)).

- **Compra:** sin anuncio elegido; precios orientativos en la lista.
  - **E12, antena:** FPC de 698–2700 MHz, de unos 100 × 15 mm, con cable de 15–20 cm acabado en **SMA macho**.
    - Si la que se elige trae conector IPEX (u.FL), hace falta además un latiguillo IPEX → SMA macho.
    - Las muy pequeñas (unos 4 × 1,5 cm) suelen ir mal en 800 MHz.
  - **E23, latiguillo:** CRC9 macho → SMA hembra, 15 cm. Va del módem a la antena.
  - **H19, placa:** policarbonato compacto de 2 mm. De ella salen las dos placas de la ventana.
  - **H20, cinta:** 3M VHB transparente de doble cara.
- **Referencia de medidas en el CAD:** Ebyte TX4G-FPC-9914, 99 × 14 mm. El fabricante pide pegarla sobre plástico y a unos 15 mm del metal.

## Cómo va montada

| Pieza | Qué es | Medidas |
|---|---|---|
| Ventana del lateral izquierdo de la carcasa (C03) | Hueco en la chapa, entre las rejillas de abajo y las de arriba | 36 × 112 mm |
| A-V03 | Policarbonato de 2 mm pegado con VHB por dentro de la carcasa. Por fuera queda a ras | 52 × 128 mm |
| Ventana del lateral izquierdo del cajón (K04) | Hueco enfrente del de la carcasa | 32 × 108 mm |
| A-S05 | Soporte de policarbonato de 2 mm pegado por dentro del cajón. La antena va pegada encima, con el cable hacia arriba | 44 × 120 mm |

- **El cable va todo dentro del cajón**, de la antena a la toma del módem (unos 17 cm de recorrido). Al sacar el cajón no hay que soltar nada.
- Lo que sobra de cable se recoge con una brida, sin doblarlo a menos de 1 cm de radio.
- Los dos topes de goma de abajo a la izquierda van en la carcasa, debajo de la ventana. Si fueran en el cajón, al subirlo rozarían la placa A-V03.

## Avisos

- **La ventana es estrecha**, porque detrás está la Pi, pegada a ese lateral. Antes de cortar chapa hay que probar la cobertura con el módem y la antena montados y todo cerrado, en un bar. La señal se ve en la página del módem (http://192.168.8.1). Si va justa, se agrandan las dos ventanas.
- Pegar las dos placas y la antena sobre superficies limpias con alcohol. La VHB coge toda su fuerza en unas 24 h.
