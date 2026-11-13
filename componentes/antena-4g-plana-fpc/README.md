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
| Ventana del lateral izquierdo de la carcasa (cuerpo C02) | Hueco en la chapa, entre las rejillas de abajo y las de arriba | 36 × 112 mm |
| A-V03 | Policarbonato de 2 mm pegado con VHB por dentro de la carcasa. Por fuera queda a ras | 52 × 128 mm |
| Ventana del lateral izquierdo del cajón (cuerpo del cajón K03) | Hueco enfrente del de la carcasa | 32 × 108 mm |
| A-S05 | Soporte de policarbonato de 2 mm pegado por dentro del cajón. La antena va pegada encima, con el cable hacia arriba | 44 × 120 mm |

- **El cable va todo dentro del cajón**, de la antena a la toma del módem (unos 17 cm de recorrido). Al sacar el cajón no hay que soltar nada.
- Lo que sobra de cable se recoge con una brida, sin doblarlo a menos de 1 cm de radio.
- Los dos topes de goma de abajo a la izquierda van en la carcasa, debajo de la ventana. Si fueran en el cajón, al subirlo rozarían la placa A-V03.

## Revisión del 13-11-2026: la ventana es una ranura

Análisis de la [revisión de componentes](../REVISION-13-11-2026.md), apartado 6.3. Es cálculo, no medida.

- **La ventana de la carcasa mide 36 × 112 mm.** Una ranura en chapa deja pasar bien las ondas cuya media longitud de onda cabe en su largo: 112 mm corresponden a unos 1340 MHz. Por encima (1800, 2100 y 2600 MHz) pasa bien. **Por debajo (700, 800 y 900 MHz) pasa mal**, y son las bandas que mejor entran en interiores.

  | Banda | Media longitud de onda |
  |---|---|
  | B28, 700 MHz | 197 mm |
  | B20, 800 MHz | 183 mm |
  | B8, 900 MHz | 159 mm |
  | B3, 1800 MHz | 83 mm |
  | B1, 2100 MHz | 70 mm |
  | B7, 2600 MHz | 57 mm |

- **La antena va a lo largo de la ranura.** Una antena lineal acopla mejor con una ranura cuando está cruzada, no paralela. Y el fabricante de la antena de referencia pide unos 15 mm de separación del metal: aquí tiene 4 mm en las puntas.
- **No se resuelve calculando.** En un bar de ciudad con buena cobertura de 1800 MHz funcionará; en un sótano o un local de muros gruesos, puede que no.

**Qué se hace:**

1. **Prueba por bandas (C3).** Con la caja cerrada, fijar en el módem una banda cada vez y apuntar señal y calidad. Criterio: al menos dos bandas con RSRP mejor que −105 dBm y SINR mayor que 5 dB.
2. **Comparar dos montajes:** (a) esta antena con su latiguillo CRC9; (b) el [propio módem detrás de la ventana](../modem-4g-huawei-e3372h/README.md), con un [alargador USB](../alargador-usb/README.md). Se queda el que mida mejor. **Hasta entonces, esta antena y el latiguillo se compran solo para la prueba.**
3. **Agrandar la ventana** todo lo que deje el CAD, sobre todo a lo ancho. Entra con la carcasa.

## Avisos

- **La ventana es estrecha**, porque detrás está la Pi, pegada a ese lateral. Antes de cortar chapa hay que probar la cobertura con el módem y la antena montados y todo cerrado, en un bar. La señal se ve en la página del módem (http://192.168.8.1). Si va justa, se agrandan las dos ventanas.
- Pegar las dos placas y la antena sobre superficies limpias con alcohol. La VHB coge toda su fuerza en unas 24 h.
