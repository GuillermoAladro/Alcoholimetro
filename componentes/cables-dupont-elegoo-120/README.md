# Cables Dupont ELEGOO, 120 unidades (macho-macho, macho-hembra y hembra-hembra)

Kit de 120 puentes con terminales Dupont de 2,54 mm: tres cintas separables de 40 hilos (macho-macho, macho-hembra y hembra-hembra) de unos 20 cm. En la guía de montaje es la pieza nº 29, "para los pines de la Pi": terminales Dupont hembra sobre los pines 8, 10, 11 y 9 de la cabecera de 40 pines de la Raspberry Pi 3B+. Esos cuatro pines llevan la UART al ZE29A (TX y RX) y el pulsador de inicio (GPIO17 y GND).

- **Compra:** ASIN B01NGTXASZ, 9,99 € (precio de la hoja de componentes del 19-20/10/2026). Unos 0,083 € por hilo (cálculo mío).
- **Fabricante y modelo:** ELEGOO, EL-CP-004 según Hackster y eBay (ver [2.1](#21-el-kit-según-las-tiendas)).
- **Fichas relacionadas:** [cables JST-XH](../cables-jst-xh-4-pin/README.md) (la unión sensor a Pi: 4.2, 5.11, 6.5), [pulsador arcade](../pulsador-arcade-30mm/README.md) y [Raspberry Pi 3B+](../raspberry-pi-3b-plus/README.md). Aquí no repito lo que ya dicen.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mis herramientas y no intenté abrir el anuncio: el precio y el ASIN son los de tu hoja. Leí las páginas con una herramienta que devuelve resúmenes, no el texto original: donde una cifra importa, doy el enlace. Hice 13 búsquedas web; la 14.ª fue rechazada porque se agotó el presupuesto compartido. Lo pendiente está en la [sección 8](#8-lo-que-no-he-podido-verificar).

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Integración con la Pi 3B+](#4-integración-con-la-pi-3b)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Alternativas](#6-alternativas)
7. [Recomendaciones para el alcoholímetro](#7-recomendaciones-para-el-alcoholímetro)
8. [Lo que no he podido verificar](#8-lo-que-no-he-podido-verificar)
9. [Fuentes](#9-fuentes)

---

## 1. Resumen para el proyecto

- **No hay documentación del fabricante.** Las páginas de ELEGOO (Reino Unido y EE. UU.) solo dan la longitud (unos 20 cm) y el contenido (una cinta de 40 hilos de cada tipo). No dicen calibre, material del conductor, paso, corriente, origen ni garantía, y no enlazan ningún PDF. Es un puente de prototipado genérico, no un componente con ficha.
- **El conductor sería aluminio cobreado (CCA), no cobre.** Cinco páginas de tiendas que parecen copiar el mismo anuncio (Hackster, tres de Desertcart y ManoMano) dicen "copper-clad aluminum and PVC". La web de ELEGOO no lo dice. **No encontré ninguna fuente con el calibre**, así que el "26 AWG" que se suele suponer no está confirmado. Consecuencias si es CCA: no se puede soldar con soldadura normal, no se debe cortar y empalmar a ciegas y, según Belden, aguanta peor las flexiones repetidas que el cobre ([5.1](#51-conductor-de-aluminio-cobreado-y-calibre-desconocido)).
- **La corriente por estos hilos es de microamperios, así que el calibre no importa; sí importa el contacto.** Un conector Dupont de referencia (Amphenol Dubox) solo garantiza una fuerza de extracción de **0,30 N (30 gf) por contacto de oro**, y no menciona ningún bloqueo. Con la caja interior suspendida sobre muelles, es el punto débil probable del montaje. Los síntomas serían "el sensor a veces no responde" o botón que no arranca ([4.3](#43-uart-con-dupont-qué-pasa-cuando-el-contacto-falla)).
- **Los cuatro pines no caben en un alojamiento de 1 × 2.** Los pines 8 y 10 van en una fila de la cabecera y el 9 y el 11 en la otra. Hacen falta dos alojamientos de 1 × 2, cuatro de 1 × 1 (como vienen los ELEGOO) o **un solo alojamiento de 2 × 3 sobre los pines 7 a 12** (propuesta mía, [4.2](#42-geometría-de-la-cabecera-y-alojamientos)). Un alojamiento sin polarizar corrido dos columnas hacia el pin 1 pone **5 V en el hilo que va al RX del sensor**.
- **El kit no resuelve el hueco que ya señala la ficha de los JST-XH:** los hilos del sensor y del pulsador necesitan un terminal Dupont hembra en la Pi, y los ELEGOO vienen ya terminados en ambos extremos, sin terminales sueltos ni herramienta. Hay que crimpar (SN-28B o PA-09, [4.4](#44-terminar-los-extremos)) o aceptar un empalme.
- **Precio bajo (9,99 €), riesgo económico mínimo.** El riesgo es una unión intermitente en una máquina de bar. Se mitiga probando el lote al recibirlo, fijando el haz y poniendo contadores de errores de la UART en el software ([7](#7-recomendaciones-para-el-alcoholímetro)).

## 2. Especificaciones

### 2.1 El kit (según las tiendas)

Fuentes: [ELEGOO UK](https://uk.elegoo.com/products/elegoo-multicolored-dupont-wire-kit) y [ELEGOO EE. UU.](https://www.elegoo.com/products/elegoo-multicolored-dupont-wire-kit), [Hackster](https://hackster.io/products/buy/91176), [eBay](https://www.ebay.com/p/1778161028), [Desertcart (47870395)](https://www.desertcart.uy/products/47870395), [Desertcart (27750053)](https://www.desertcart.nz/products/27750053) y [ManoMano](https://www.manomano.fr/p/120pcs-multicolored-dupont-wire-40pin-male-to-female-40pin-male-to-male-40pin-female-to-female-breadboard-jumper-ribbon-cables-kit-compatible-with-arduino-projects-214684600).

| Dato | Valor | Fuente / estado |
|---|---|---|
| Marca y modelo | ELEGOO, EL-CP-004 (eBay: ELCP004) | Hackster, eBay |
| Contenido | Una cinta de 40 hilos de cada tipo: macho-hembra, macho-macho y hembra-hembra. 3 × 40 = 120 | ELEGOO ("1X 40-pin male to female...", "1X 40-pin male to male...", "1x40-pin female to female..."). Ninguna página da el número por tipo; el 40+40+40 es deducción mía |
| Separables | Sí: "The cables can be separated to form an assembly containing the number of wires you require" | ELEGOO |
| Longitud | "about 20 cm / 8-inch" | ELEGOO UK y EE. UU. |
| Calibre (AWG) | **No publicado** | Ninguna página lo da. **Sin verificar** |
| Conductor | "Copper-clad aluminum and PVC" | Hackster, Desertcart (tres páginas), ManoMano. **ELEGOO no lo dice.** Las cinco páginas pueden estar copiando el mismo anuncio (deducción mía) |
| Hebras | Campo ilegible: Hackster pone "single strand"; Desertcart pone "12 UK" | Sin interpretar. En otra marca (EDGELEC, Newegg) aparece "12-core pure copper"; no sé si es la misma magnitud |
| Paso | 2,54 mm (0,1") | ManoMano ("Male ends fit standard 2.54 mm (0.1-inch) female sockets"), Hackster |
| Tensión, corriente | ELEGOO no da ninguna. Desertcart rellena "Voltage: 5 V" | Dato de tienda, no un valor nominal |
| Origen | China | Hackster |
| Precio | £5,99 (ELEGOO UK), $6,59 (ELEGOO EE. UU.), $6,98 (Hackster), 9,99 € (tu hoja) | Páginas indicadas |
| Valoración | 4,7 sobre 5 con 13.322 valoraciones, según el resumen de Hackster | **Sin verificar** que sea el mismo anuncio que el tuyo |
| Reseñas citadas | "the wires aren't the most durable"; "the pins loosely fit in my breadboards while my old cables fit more snugly"; la queja principal son los extremos hembra | Resumen de Hackster; sin verificar |
| ASIN | Hackster y Desertcart citan **B01EV70C78**. Tu hoja pone **B01NGTXASZ** | Sin resolver ([8](#8-lo-que-no-he-podido-verificar)) |
| Documentos, certificados, garantía | Ninguno específico. Solo hay un enlace genérico "Download Center" en la web de ELEGOO | ELEGOO |

Ojo con la calidad de los datos de tienda: Desertcart lista el color como "Yellow White" y ManoMano pone la marca "BIJOUTIFULL" y el material "Bois" (madera) en su tabla, en contradicción con su propio texto. Por eso trato como dato fiable solo lo que ELEGOO publica (longitud, contenido) y como **sin verificar** el resto.

Otra marca que salió en la búsqueda y **no es este producto**: EDGELEC (Newegg), que anuncia "12-core pure copper wire" y terminales de latón niquelado. No la uso como dato del kit.

### 2.2 Conector Dupont de referencia (no es el de ELEGOO)

"Dupont" no es una norma, es el nombre popular de los conectores de 2,54 mm de la antigua serie Berg/DuPont ([Wikipedia, Pin header](https://en.wikipedia.org/wiki/Pin_header)). Los datos medibles salen de fabricantes de piezas equivalentes. **ELEGOO no publica nada equivalente**, así que estas cifras son una referencia de lo que se puede esperar de un buen conector y no una garantía para el kit.

| Característica | Amphenol FCI Dubox (hoja de datos) | Harwin M20 (páginas de producto) |
|---|---|---|
| Corriente nominal | 3 A por contacto; 2 A como máximo con todo el conector alimentado | 3 A por contacto |
| Resistencia de contacto | 15 mΩ máx. inicial; 20 mΩ máx. tras ensayos ambientales | No la lista |
| Ciclos de acoplamiento | 200 con oro ("up to 200 mating cycles, plating dependent") | No lista |
| Fuerza de inserción | 1,30 N por contacto de oro | No lista |
| **Fuerza de extracción** | **0,30 N (30 gf) mínimo por contacto de oro** | No lista |
| Fuerza normal del contacto | 0,6 N | No lista |
| Retención del contacto en la carcasa | 15 N por contacto | No lista |
| Contacto | Bronce fosforoso (contactos CTW). Oro 0,76 µm sobre níquel 1,27 µm, o estaño mate 2,0 µm | Latón; oro en la zona de contacto y terminación de estaño sobre níquel (M20-1180042) |
| Pin con el que acopla | No lo da | **0,64 mm cuadrado** |
| Carcasa | Termoplástico de alta temperatura | PPE+PS, UL94V-1 (M20-1070200) |
| Temperatura | −65 a +125 °C | −25 a +85 °C |
| Cable admitido | 32 a 28, 30 a 22 o 22 a 20 AWG, según contacto | 22 a 30 AWG |
| Bloqueo | No lo menciona ("locating feature available") | "Not polarised"; no lista bloqueo |

Fuentes: [Dubox, hoja de datos](https://cdn.amphenol-cs.com/media/wysiwyg/files/documentation/datasheet/boardwiretoboard/bwb_dubox_wtb.pdf) y [página de TTI](https://www.tti.com/content/ttiinc/en/manufacturers/amphenol/products/amphenol-fci-dubox-2-54mm-crimp-wire-connectors.html) (3 A, 200 ciclos); [Harwin M20-1070200](https://www.harwin.com/products/M20-1070200) (carcasa de 2+2 posiciones); [Harwin M20-1180042](https://www.harwin.com/products/M20-1180042) y [M20-1160042 en CPC Farnell](https://cpc.farnell.com/harwin/m20-1160042/contact-socket-crimp-30-22awg/dp/CN25464) (contactos). La hoja de Dubox escribe la resistencia con "MΩ"; es una errata evidente de "mΩ".

Dos conclusiones que salen de esas cifras (cálculos míos):

- **La fricción sobre el pin es el eslabón débil.** El contacto se sostiene en la carcasa con 15 N, pero solo se sujeta al pin con unos 0,3 N como mínimo: cincuenta veces menos. Un tirón del cable suelta el conector mucho antes de dañar el crimpado.
- Con cuatro contactos, la retención mínima garantizada de una carcasa de 4 hilos sería de 4 × 0,30 = 1,2 N, si todos los contactos agarran bien. Es un mínimo de catálogo para contactos de oro; el de un kit barato puede ser menor.

### 2.3 Cabecera de la Pi 3B+

| Característica | Valor | Fuente |
|---|---|---|
| Tipo | Conector J8, macho, 2 × 20 pines, "40W 0.1" PIN HDR" | [Esquema reducido RP-008339-DS-1](../raspberry-pi-3b-plus/datasheets/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) (lo leí en el texto extraído de la hoja "GPIO EXPANSION") |
| Paso | 0,1" (2,54 mm) | [Documentación de hardware de Raspberry Pi](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html) ("0.1in (2.54 mm) pin pitch") |
| Pin | 0,64 mm (0,025") cuadrado es la medida estándar de las cabeceras de 2,54 mm (Harwin da ese valor para sus contactos). **La documentación de Raspberry Pi que abrí no la da para la Pi.** Mídelo con calibre | Harwin; **sin verificar** en la Pi |
| Altura sobre la placa | 8,5 mm ("Z-Height = 8.5") en el bloque de unos 51 mm junto al borde de la placa, que identifico como la cabecera por su tamaño | [Plano mecánico RP-008337-DS-2](../raspberry-pi-3b-plus/datasheets/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf), leído en imagen; la identificación es deducción mía |
| Lógica | 3,3 V en todos los GPIO; no toleran 5 V | [Documentación de Raspberry Pi](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html) ("Do not use 5V for 3.3V components"), [pinout.xyz, UART](https://pinout.xyz/pinout/uart) ("The UART pins are 3.3v and are not level shifted") |
| Pines 5 a 12 | 5 = GPIO3, 6 = GND, 7 = GPIO4, 8 = **GPIO14 (TXD0)**, 9 = GND, 10 = **GPIO15 (RXD0)**, 11 = **GPIO17**, 12 = GPIO18 | Esquema (J8); [pinout.xyz, pin 8](https://pinout.xyz/pinout/pin8_gpio14) para los nombres |
| Pines de 5 V | 2 y 4 | [Ficha de los JST-XH, 3](../cables-jst-xh-4-pin/README.md) (lectura del esquema en imagen); en el texto extraído del esquema no vi los nombres de los pines de alimentación |

Aviso del product brief de la Pi: la conexión de dispositivos incompatibles al GPIO "may affect compliance, result in damage to the unit, and invalidate the warranty", y los cables y conectores de los periféricos "must have adequate insulation" ([RP-008338-DS-2](../raspberry-pi-3b-plus/datasheets/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf), sección de advertencias).

### 2.4 Cálculos de resistencia y de tiempo (míos)

Con las resistencias por kilómetro de la tabla AWG de la [ficha de los JST-XH (2.3)](../cables-jst-xh-4-pin/README.md#23-calibres-referencia-para-comprobar-el-cable) y el 55 % más del aluminio cobreado que citan [Fluke](https://de.flukenetworks.com/blog/cabling-chronicles/cca-not-worth-savings-or-risk) y [Belden](https://cn.belden.com/blog/not-in-my-network-copper-clad-aluminum-recipe-for-failure) (es un dato de cableado de red, no de este cable):

| Hilo de 20 cm | Cobre | CCA (+55 %) |
|---|---|---|
| 24 AWG | 17 mΩ | 26 mΩ |
| 26 AWG | 27 mΩ | 42 mΩ |
| 28 AWG | 43 mΩ | 66 mΩ |

- Con dos contactos de 15 a 20 mΩ (referencia Dubox), el peor caso (28 AWG de CCA) da unos 0,1 Ω por hilo. A 1 mA son 0,1 mV. **La resistencia del hilo es irrelevante.** Un polímetro normal (resolución de 0,1 Ω) tampoco la distingue.
- La carga del pulsador es de unos 51 a 66 µA ([ficha del pulsador, 5.2](../pulsador-arcade-30mm/README.md)), y la Pi lee "pulsado" mientras el contacto no pase de unos 19 a 24 kΩ. Para ese hilo cualquier cobre o CCA vale; lo que mata es un circuito abierto.
- UART a 9600 baudios: un bit dura 104 µs, un byte de 10 bits 1,04 ms y una trama de 9 bytes (guía, §2.4) unos 9,4 ms. **Un corte de la línea de más o menos un bit ya puede alterar la trama.** Un contacto que vibra a escala de milisegundos es visible para la UART.

## 3. Documentos oficiales

No hay ficha técnica, manual ni declaración de conformidad de ELEGOO para este producto. La tabla reúne lo que sirve para evaluar el kit y su integración. Todos los enlaces están en [`enlaces.md`](enlaces.md).

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| ELEGOO, página del producto (Reino Unido) | EL-CP-004 según terceros | Web | [uk.elegoo.com](https://uk.elegoo.com/products/elegoo-multicolored-dupont-wire-kit) |
| ELEGOO, página del producto (EE. UU.) | Igual | Web | [elegoo.com](https://www.elegoo.com/products/elegoo-multicolored-dupont-wire-kit) |
| Amphenol FCI, Dubox wire-to-board (carcasas y contactos) | bwb_dubox_wtb | PDF | [descargar](https://cdn.amphenol-cs.com/media/wysiwyg/files/documentation/datasheet/boardwiretoboard/bwb_dubox_wtb.pdf) |
| Amphenol FCI, herramientas de crimpado Dubox | 10164488-001 (AWG 20-22), 10164489-001 (AWG 22-30) | PDF | [descargar](https://cdn.amphenol-cs.com/media/wysiwyg/files/documentation/datasheet/boardwiretoboard/fci-basics-handtool-dubox-ctw.pdf) |
| Harwin M20, hoja del contacto de crimpado hembra | DRG-00379 (M20-118) | PDF | [descargar](https://content.harwin.com/asset/d742d022-1905-41c8-b996-8feb2ed262c8/DRG-00379-Technical-Drawing-Datasheet-M20-118-pdf.pdf) (**no la abrí**; enlace visto en la página del producto) |
| Harwin M20, hoja de la carcasa de 2+2 posiciones | DRG-00377 (M20-107) | PDF | [descargar](https://content.harwin.com/asset/b4f1d83e-6b34-4617-ba41-3cc2c2450892/DRG-00377-Technical-Drawing-Datasheet-M20-107-pdf.pdf) (**no pude abrirla**: la herramienta la bloqueó) |
| Harwin, catálogo M20 | 2898005 | PDF | [descargar](https://www.farnell.com/datasheets/2898005.pdf) (**no pude abrirlo**: bloqueado) |
| Esquema reducido de la Pi 3B+ (conector J8) | RP-008339-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) · copia local en [`../raspberry-pi-3b-plus/datasheets/`](../raspberry-pi-3b-plus/datasheets/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) |
| Plano mecánico de la Pi 3B+ | RP-008337-DS-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf) · copia local en [`../raspberry-pi-3b-plus/datasheets/`](../raspberry-pi-3b-plus/datasheets/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf) |
| Product brief de la Pi 3B+ | RP-008338-DS-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) |
| Documentación de hardware de Raspberry Pi (GPIO) | | Web | [raspberrypi.com](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html) |
| IWISS SN-28B, crimpadora Dupont/JST (AWG 28-18) | SN-28B | Web | [iwiss.com](https://iwiss.com/products/sn-28b-dupont-crimping-tool-for-3-96mm-2-54mm-2-5mm-pitch-dupont-jst-xh-vh-connectors-awg-18-to-28) |

### Qué dicen los documentos más relevantes

- **Amphenol, hoja de Dubox:** es la fuente de las cifras de la tabla 2.2. Da una extracción mínima de 0,30 N por contacto frente a 15 N de retención del contacto en la carcasa, y no menciona ningún enclavamiento. Habla de contactos de oro o estaño: **un Dupont barato puede llevar estaño**, que es peor para señales de bajo nivel (ver [5.6](#56-oxidación-y-contactos-de-bajo-nivel)).
- **Harwin M20:** confirma el pin de 0,64 mm cuadrado y 3 A, y que la carcasa de referencia **no está polarizada**. Los contactos de crimpado admiten 22 a 30 AWG, que cubre el hilo de 22 AWG de los cables JST-XH.
- **Esquema de la Pi 3B+:** J8 es una cabecera de 40 pines de 0,1". El texto extraído da los nombres de los pines (8 = GPIO14 TXD0, 10 = GPIO15 RXD0, 11 = GPIO17) y los dispone en dos columnas, impares a un lado y pares al otro. **No dice cuál es la fila interior ni la exterior** ([4.2](#42-geometría-de-la-cabecera-y-alojamientos)).
- **Plano mecánico:** el cuerpo de la cabecera mide 8,5 mm de altura sobre la placa. Los pines sobresalen por encima y el alojamiento hembra suma su propia altura; no la tengo medida ([7](#7-recomendaciones-para-el-alcoholímetro), punto 8).

## 4. Integración con la Pi 3B+

### 4.1 Contraste con la guía de montaje

| Punto | Guía (`claude/guia-montaje-electrico.md`) | Hallazgo | Veredicto |
|---|---|---|---|
| Función de la pieza #29 | "Cables de señal. Para los pines de la Pi" (§1 fila 29) | Los cables vienen terminados con carcasa de 1 × 1 en **ambos** extremos. No hay terminales sueltos ni herramienta. Con ellos solos no se pone un Dupont hembra al hilo del JST-XH ni al faston del pulsador | **Hueco** (ya señalado en la ficha de los JST-XH, 5.11) |
| UART | Pin 8 (GPIO14 TXD) y pin 10 (GPIO15 RXD) (§5.3) | Esquema J8: 8 = GPIO14 (TXD0), 10 = GPIO15 (RXD0) | Coincide |
| Pulsador | Pin 11 (GPIO17) y pin 9 (GND) (§5.3) | Esquema: 11 = GPIO17. [pinout.xyz](https://pinout.xyz/pinout/pin8_gpio14) da el pin 9 como Ground | Coincide |
| Un alojamiento para 8 y 10 | La ficha de los JST-XH propone uno de 1 × 2 | Cierto para 8 y 10 (misma fila). Pero 9 y 11 están **en la otra fila**: un 1 × 2 no cubre los cuatro | **Matiz**: ver 4.2 |
| Calibre y material del cable | No lo dice | Calibre no publicado. Tiendas dicen aluminio cobreado | **Sin verificar**; no es el cobre que se suele suponer |
| Longitud | No lo dice (el cable del pulsador no tiene medida en la guía) | 20 cm por hilo, sin cotas del montaje para saber si llega al pulsador | **Sin verificar** |
| Precio | 9,99 € | ELEGOO UK £5,99 y EE. UU. $6,59 | No es discrepancia: es el precio de Amazon.es en tu hoja |
| ASIN | B01NGTXASZ | Hackster y Desertcart citan B01EV70C78 | **Sin resolver** |

### 4.2 Geometría de la cabecera y alojamientos

Pines 5 a 12, vistos de frente con la cabecera arriba (pin 1 a la izquierda):

```
fila exterior (pares, hacia el borde de la placa):  [ 6 GND ][ 8 TXD ][10 RXD ][12 G18]
fila interior (impares):                            [ 5 G3  ][ 7 G4  ][ 9 GND ][11 G17]
                                                     <-- lado del pin 1
```

Hilos que van a cada pin (según la guía §5.3 y la ficha de los JST-XH 4.2):

| Pin | Fila | Hilo |
|---|---|---|
| 8 | exterior | Al pin 4 (RX) del ZE29A |
| 10 | exterior | Al pin 3 (TX) del ZE29A |
| 9 | interior | A COM del pulsador (GND) |
| 11 | interior | A NO del pulsador (GPIO17) |

**Sobre qué fila es la interior.** El texto de Raspberry Pi y de pinout.xyz que pude leer no lo dice (el diagrama es una imagen). Un artículo de Wevolver (secundario, sobre la Pi 4) lo da **al revés**: impares en la fila exterior. Lo que yo conozco de la placa es: pin 1 en el extremo de la microSD, con pad cuadrado en la cara inferior; impares en la fila interior; pares (con los dos de 5 V) en la fila del borde. **Es conocimiento general, sin fuente que haya podido citar: compruébalo en tu placa antes de crimpar nada.** Una comprobación sin tensión: con el polímetro en continuidad entre la carcasa metálica del USB y cada pin, los primeros GND desde el extremo del pin 1 son el 6 (3.ª columna, fila de los pares), el 9 (5.ª columna, fila de los impares) y el 14 (7.ª columna, fila de los pares). Desde el otro extremo el patrón es distinto (39, 34, 30). Eso identifica qué extremo es el del pin 1 y cuál es la fila de los impares. La lista de GND (6, 9, 14, 20, 25, 30, 34 y 39) es de memoria: **sin verificar**; solo el 6 y el 9 los vi en pinout.xyz.

**Qué alojamientos sirven:**

| Opción | Cómo | Ventajas | Inconvenientes |
|---|---|---|---|
| A. Dos de 1 × 2 | Uno en 8 y 10 (fila exterior), otro en 9 y 11 (fila interior) | Fáciles de crimpar | Dos piezas sueltas, cada una con su fricción; se pueden confundir de fila |
| B. **Uno de 2 × 3 sobre los pines 7 a 12** (mía) | Posiciones usadas: 8, 10 (exterior), 9, 11 (interior). Quedan vacías la 7 (GPIO4) y la 12 (GPIO18): son cavidades de plástico, no tocan nada | Un solo bloque que se enchufa de una vez y que mantiene los cuatro contactos alineados | Si no está polarizado (la Harwin de referencia no lo está), se puede enchufar girado 180° o corrido |
| C. Cuatro de 1 × 1 (como vienen los ELEGOO) | Cada hilo en su pin. Solo vale si el otro extremo del hilo se corta y se termina por crimpado | No hace falta crimpar el lado de la Pi | Cuatro uniones independientes con 0,3 N cada una como mínimo; el peor caso |
| D. 2 × 4 sobre los pines 5 a 12 (mía) | Añade el pin 6 (GND) en la fila exterior | Cubre la opción del tercer GND de la ficha de JST-XH 6.5 | Un contacto más. El pin 5 (GPIO3, con pull-up fijo según la [ficha de la Pi](../raspberry-pi-3b-plus/README.md)) queda con su cavidad vacía |

**Errores de colocación y su efecto** (opción B, cálculos míos a partir de la tabla de pines):

| Error | Qué pasa |
|---|---|
| Corrido **1 columna** hacia el pin 1 | El RX del sensor va al pin 6 (GND) y el TX del sensor al pin 8 (TXD de la Pi): dos salidas enfrentadas. El hilo GND del pulsador va al pin 7 (GPIO4) y el NO al pin 9 (GND): el pulsador no llega a GPIO17 |
| Corrido **2 columnas** hacia el pin 1 | El RX del sensor va al **pin 4 (5 V)** y el TX del sensor al pin 6 (GND): **5 V en una entrada de 3,3 V y una salida del sensor a masa** |
| Corrido 1 columna hacia el pin 40 | Sin 5 V ni masa: el RX del sensor cae en el pin 10 (RXD), el TX en el 12 (GPIO18), el GND del pulsador en el 11 (GPIO17) y el NO en el 13 (GPIO27). No funciona, pero no quema |
| Girado 180° sobre los mismos pines | El TX del sensor cae en el pin 9 (GND). El GND del pulsador cae en el pin 10 (RXD) y el NO en el pin 8 (TXD). El RX del sensor cae en el pin 11 (GPIO17) |

El peor caso es el segundo, y es fácil de cometer si se cuentan las columnas desde el lado equivocado de la cabecera. De ahí las comprobaciones de [4.5](#45-comprobación-antes-de-dar-tensión).

### 4.3 UART con Dupont: qué pasa cuando el contacto falla

- **Condiciones de la línea:** 9600 baudios, 8N1, 3,3 V TTL, tramas de 9 bytes con suma de comprobación (guía §2.4; manual de Winsen en la [ficha de JST-XH](../cables-jst-xh-4-pin/README.md#22-lado-del-sensor-ze29a-lo-que-importa-al-cable)). Un cable de 20 cm no introduce problemas de integridad de señal a esa velocidad (deducción mía): lo que cuenta es el contacto.
- **TX de la Pi (pin 8) abierto:** el sensor no recibe órdenes. La guía dice que el módulo no arranca solo y hay que enviarle una trama de arranque, así que **se queda inactivo**.
- **RX de la Pi (pin 10) abierto:** la Pi no recibe respuesta. Cómo se comporta la entrada sin conectar depende de la resistencia interna que fije el sistema; no lo he comprobado. El software debe tratar "sin trama" como **fallo del sensor** y no como lectura de 0.
- **Contacto intermitente:** tramas truncadas o con bits cambiados. La suma de comprobación de 8 bits rechaza casi todas, pero **una trama corrupta de cada unas 256 la pasaría** si los errores fueran aleatorios (1/256, cálculo mío). En un instrumento que da un número, no es despreciable si la conexión falla a menudo.
- **Qué cuenta la gente de este fallo:** en Arduino, All About Circuits y mikrocontroller.net hay hilos de pantallas que se apagan al tocar el cable, señales que mejoran apretando el conector y cables sin hilo dentro del crimpado (ver [5.2](#52-crimpados-defectuosos) y [5.3](#53-hembra-floja-con-el-pin)). **No encontré un hilo concreto de la Pi con UART y Dupont** (se agotó el presupuesto de búsquedas): la relación con "el sensor a veces no responde" es deducción mía.

### 4.4 Terminar los extremos

Cuándo hace falta: para poner un terminal Dupont hembra en los hilos de 22 AWG de los cables JST-XH (sensor) y en el hilo del pulsador. La ficha de los JST-XH (5.11) ya explica por qué no hay herramienta en la hoja; aquí va lo que he encontrado para hacerlo.

- **No cortes los ELEGOO para empalmar con soldadura si son de CCA.** [mikrocontroller.net](https://www.mikrocontroller.net/topic/516562) cuenta que el cobre se disuelve en el estaño en un segundo y el aluminio ya no moja, y [Wikipedia](https://en.wikipedia.org/wiki/Copper-clad_aluminium_wire) dice que el CCA "may be hard to solder". Si hay que empalmar, crimpa.
- **El hilo de 22 AWG del kit JST-XH encaja directamente** en un contacto de crimpado Dupont hembra de 22 a 30 AWG (Harwin [M20-1180042](https://www.harwin.com/products/M20-1180042), [M20-1160042](https://cpc.farnell.com/harwin/m20-1160042/contact-socket-crimp-30-22awg/dp/CN25464)). En el caso de 22 AWG es el extremo grueso del rango del terminal: probar antes con un contacto de repuesto. **Es la forma más limpia**: no pasa por los ELEGOO.
- **Herramientas** (sin precios de Amazon.es):
  - **IWISS SN-28B:** ratchet, AWG 28 a 18, terminales de 2,5, 2,54 y 3,96 mm; 16,99 USD en la tienda de IWISS ([iwiss.com](https://iwiss.com/products/sn-28b-dupont-crimping-tool-for-3-96mm-2-54mm-2-5mm-pitch-dupont-jst-xh-vh-connectors-awg-18-to-28)). Las matrices vienen sin marcar y la tensión del ratchet se ajusta con una prueba de tirón.
  - **Engineer PA-09:** sin ratchet, AWG 32 a 20, la más recomendada en la [guía de microcontrollerslab](https://microcontrollerslab.com/best-crimping-tools-for-jst-dupont-connectors-buying-guide/). No vi su precio.
  - Para contactos propios de FCI: herramientas 10164488-001 (AWG 20-22) y 10164489-001 (AWG 22-30) de la [hoja de Amphenol](https://cdn.amphenol-cs.com/media/wysiwyg/files/documentation/datasheet/boardwiretoboard/fci-basics-handtool-dubox-ctw.pdf). Son para esos contactos, no un estándar de Dupont.
  - La crimpadora autoajustable de la hoja (#28) parece de punteras ([ficha de JST-XH, 5.11](../cables-jst-xh-4-pin/README.md#511-falta-una-herramienta-para-el-extremo-dupont)); no la he visto.
- **Consejos de los foros y guías:**
  - Pelar unos 2 mm (microcontrollerslab); pelar más deja las garras del aislante sobre cobre desnudo y sin alivio de tracción. El valor exacto lo da el terminal: mira su hoja.
  - **No estañar el hilo antes de crimpar** ("DO NOT TIN THE WIRES IF YOU ARE GOING TO CRIMP THEM", Ya'akov en [All About Circuits](https://forum.allaboutcircuits.com/threads/need-suggestions-for-suitable-jumpers.193586/post-1819576)).
  - Una soldadura "concentra cada ciclo de flexión en un punto rígido" ([Team FDM](https://www.teamfdm.com/blogs/entry/10-3d-printer-connectors-molex-jst-crimping/)).
  - Cuenta con malograr de 10 a 20 terminales hasta tomarle el punto (microcontrollerslab). En el Arduino Forum, un usuario cuenta una media de 1,5 a 2 pines por crimpado bueno.
  - **Tira de cada terminal** y repite si el hilo se mueve (Team FDM, microcontrollerslab). Las fuerzas de arranque de referencia para 26 y 28 AWG están en la tabla de la [ficha de JST-XH (6.2)](../cables-jst-xh-4-pin/README.md#62-qué-comprobar-al-recibir-el-lote).
- **Dónde comprar terminales y carcasas:** no he visto un kit concreto en Amazon.es que pueda recomendar. El contacto Harwin M20-1160042 figura en CPC Farnell a 0,09 £ (desde 5 unidades) y 0,05 £ (desde 100), sin IVA, según la página del 21-10-2026; para una máquina con cuatro hilos el gasto es mínimo. **Sin verificar** disponibilidad y envío, y si ese contacto es el que lleva la carcasa que elijas.

### 4.5 Comprobación antes de dar tensión

Procedimiento mío, no sale de una fuente. Con todo apagado, salvo el paso 4.

1. **Hilo por hilo, antes de montar:** continuidad de extremo a extremo con el polímetro, sin que suene con los vecinos.
2. **Anota el orden:** marca el lado del pin 1 del alojamiento (rotulador, pintura) y apunta qué color va a cada posición (tabla de 4.2).
3. **Con la Pi apagada**, enchufa el alojamiento y mide continuidad desde el extremo libre de cada hilo a la carcasa metálica del USB (GND): solo el hilo del GND debe sonar. Los otros tres no deben sonar con GND ni entre sí.
4. **Con la Pi encendida y el ZE29A y el pulsador desconectados**, mide la tensión de cada hilo libre contra GND: **ninguno puede pasar de 3,3 V**. Si ves 5 V, el alojamiento está corrido hacia los pines 2 y 4: apaga y corrígelo. Con la UART abierta, el hilo del TX de la Pi (pin 8) debería leer 3,3 V (una UART en reposo está a nivel alto; **sin verificar en la Pi**) y el del GND 0 V: eso delata un corrimiento de una columna. Toca solo los extremos de los hilos, nunca los pines de la Pi con las puntas.
5. **Primero el pulsador** (`gpiozero.Button(17)`, cuenta pulsaciones) y **después el sensor**: si la Pi manda tramas y el ZE29A no responde, comprueba el cruce TX/RX (el hilo del pin 8 al RX del sensor).
6. **Prueba de tirón y de golpe con el sistema funcionando:** mueve el haz, tira suavemente de la carcasa y golpea la caja interior sobre sus muelles mientras el programa registra tramas erróneas. Si salta algo, el contacto es el problema.

## 5. Fallos, bugs y problemas conocidos

No encontré pruebas independientes de este kit en concreto (mediciones, desmontajes), solo reseñas de tienda y hilos de foros sobre puentes Dupont baratos en general. La gravedad es para este proyecto.

| # | Problema | Gravedad | Evidencia |
|---|---|---|---|
| 5.1 | Conductor de aluminio cobreado y calibre desconocido | Media | Tiendas (Hackster, Desertcart, ManoMano), foros |
| 5.2 | Crimpados defectuosos (sin hilo, hebras rotas) | Media-alta | mikrocontroller.net, EEVblog, All About Circuits |
| 5.3 | Hembra floja con el pin | **Alta** | Arduino Forum, All About Circuits, reseña citada por Hackster |
| 5.4 | Sin bloqueo y vibración | **Alta** | Team FDM, foro V1E, hojas de Dubox y Harwin |
| 5.5 | Error de colocación del alojamiento | **Alta** si ocurre | Deducción mía (4.2) |
| 5.6 | Oxidación y contactos de bajo nivel | Baja-media | All About Circuits; deducción |
| 5.7 | Aislante y carcasas frágiles; sin tensión nominal | Media | mikrocontroller.net; Pi brief |
| 5.8 | Faltan terminales y herramienta | Media | Deducción sobre la guía |
| 5.9 | Datos del anuncio inconsistentes y ASIN | Baja-media | Tiendas |
| 5.10 | Hilo demasiado fino para el faston del pulsador | Media | Arduino Forum; ficha del pulsador |

### 5.1 Conductor de aluminio cobreado y calibre desconocido

- **Qué se sabe:** cinco páginas de tiendas dicen "copper-clad aluminum and PVC" y ELEGOO no lo confirma ni lo desmiente. Ninguna da el calibre.
- **En contra del CCA:**
  - Resistencia "about 55% greater" que el cobre del mismo diámetro ([Fluke](https://de.flukenetworks.com/blog/cabling-chronicles/cca-not-worth-savings-or-risk) y [Belden](https://cn.belden.com/blog/not-in-my-network-copper-clad-aluminum-recipe-for-failure), hablando de cableado de red).
  - **"Noticeably more brittle"** y con "poor flexibility that can cause breakage" (Belden, que cita un caso con un 30 % de enlaces fallidos por conductores rotos).
  - El aluminio se oxida al aire y puede dar "failed terminations" (Belden).
  - No se suelda bien: el cobre se disuelve en el estaño y el aluminio ya no moja ([mikrocontroller.net](https://www.mikrocontroller.net/topic/516562)); Wikipedia dice "may be hard to solder".
  - Un usuario cuenta un hilo roto dentro del aislante cuyo crimpado parecía bueno y que solo hacía contacto según cómo se doblara el cable (Johannes S., mikrocontroller.net, 13-4-2021).
- **A favor, o neutro:** Wikipedia (contexto de cableado de edificios) dice que no hay historial de sobrecalentamiento en terminaciones de CCA y que sus terminaciones son iguales que las de cobre. El artículo de Fluke que abrí **solo trata la resistencia y el desequilibrio de resistencia**; lo de la oxidación y la fragilidad es de Belden (la ficha de los JST-XH 5.6 los cita juntos).
- **Qué importa aquí:** a microamperios la resistencia no cuenta (2.4). Cuenta que se rompa por fatiga dentro del aislante, que el crimpado agarre menos y que no se pueda soldar. Con un arnés fijo, que no se mueve después de instalado, el riesgo de fatiga baja (deducción mía), salvo la flexión de la caja suspendida.
- **Calibre:** en el [Arduino Forum](https://forum.arduino.cc/t/cable-for-homemade-jumpers/1330339) un usuario cuenta que rollos de 20 y 28 AWG comprados en Amazon eran "far too thin to crimp" (steveinaustria, 12-12-2024), y en [EEVblog](https://eevblog.com/forum/beginners/voltage-drop-at-breadboard) que los puentes baratos llevan hilo "far too thin" y "isn't even copper" (Ian.M, 9-3-2019). **No son cifras de ELEGOO.**

### 5.2 Crimpados defectuosos

- **[mikrocontroller.net](https://www.mikrocontroller.net/topic/516562) (abril de 2021):** un puente de Dupont con **ninguna hebra dentro del crimpado** ("Bei dem Exemplar hier war grad gar keine Ader im Crimp!"); hilos de hierro; un hilo que se rompe por dentro y funciona según cómo se doble; aislante que se agrieta en los dobleces en cables de menos de cinco años; carcasas rotas y pines arrancados. Un usuario resume: los defectos pequeños de crimpado son inevitables; el problema real son las secciones finas y los conductores de hierro o aluminio.
- **[EEVblog](https://eevblog.com/forum/beginners/voltage-drop-at-breadboard) (marzo de 2019, Ian.M):** puentes con hilo fino, "it isn't even copper wire", "the ends aren't properly crimped" y roturas internas. Propone enderezar el cable, tirar de los extremos y medir, y descartarlo si da "more than a fraction of an ohm" sobre la medida con las puntas juntas.
- **[Arduino Forum](https://forum.arduino.cc/t/are-jumper-wires-the-same/311509) (mayo de 2015):** Riva dice que los hilos de terminal cuadrado crimpado pueden estar mal crimpados; zoomkat, que las conexiones de los puentes baratos "seem to be questionable at times".
- **[All About Circuits](https://forum.allaboutcircuits.com/threads/need-suggestions-for-suitable-jumpers.193586/post-1819576) (mayo de 2023):** pantalla con puentes hembra de tienda que se apagaba hasta tocar los cables; SamR pregunta si los pines "fit snugly" y sospecha un crimpado defectuoso. Jon Chandler dice que la calidad "vary significantly" y recomienda proveedores conocidos frente a vendedores aleatorios de AliExpress.

### 5.3 Hembra floja con el pin

- **Arduino Forum ([are jumper wires the same?](https://forum.arduino.cc/t/are-jumper-wires-the-same/311509), 14 a 16-5-2015):** johnhikes "definitely NOT getting a tight fit" en los pines del módulo y su señal mejoraba al presionar el conector. DrAzzy dice que los extremos macho son peores que los hembra (pin más estrecho y corto) y que pines estampados baratos pueden necesitar un giro para entrar en la hembra. Paul_B: si falla con las hembras que le corresponden, el cable es defectuoso; un conector con pines más pequeños puede no acoplar bien. terryking228 no vio el problema en miles de hembra-hembra.
- **[All About Circuits](https://forum.allaboutcircuits.com/threads/need-suggestions-for-suitable-jumpers.193586/post-1819576):** MrAl dice "Decent ones go on tight" y que se pueden **doblar de nuevo los contactos** si se aflojan. DonBradman dice que conecta y desconecta a menudo, y MrAl lo apunta como posible desgaste.
- **Reseña citada por Hackster:** "the pins loosely fit in my breadboards while my old cables fit more snugly" (de un resumen, no del texto original). Según ese resumen, la queja principal son los extremos hembra. **Sin verificar.**
- **Dubox:** el pin de la Pi mide (por estándar) 0,64 mm; el contacto de referencia garantiza 0,3 N de extracción como mínimo. Un contacto flojo, por definición, queda por debajo de eso.
- **Reparación improvisada:** apretar o reabrir el contacto con una pinza (MrAl) sirve en banco; **en una máquina de bar es preferible cambiar el terminal** (opinión mía).

### 5.4 Sin bloqueo y vibración

- [Team FDM](https://www.teamfdm.com/blogs/entry/10-3d-printer-connectors-molex-jst-crimping/): "Nothing holds them in place except friction on a square pin". Lo clasifica como "Bench prototyping only, never on motion". Dice que la vibración los saca "a fraction of a millimeter per hour" hasta que el contacto es marginal y que un Dupont medio fuera dobló un pin en su ejemplo. Es una afirmación del artículo, sin medición. Ese mismo artículo da al JST-XH como conector con enclavamiento; JST lo clasifica como "friction lock" (ver [ficha de JST-XH, 2.1](../cables-jst-xh-4-pin/README.md#21-conector-jst-serie-xh-original)). **No coinciden**; manda JST.
- **[Foro V1E](https://forum.v1e.com/t/having-trouble-keeping-the-end-stops-plugged-in/42105) (25-1-2024):** enchufes de final de carrera Dupont que se sueltan. Propuestas: quitar la guía de plástico del conector de la placa para que asienten mejor, carcasas Dupont con bloqueo, cables prensados de fábrica, pegamento termofusible ("it shouldn't really happen though"), JST-XH ("the best way") y bridas como alivio de tracción. El autor del hilo pensó en pegamento (termofusible o rápido) pero creyó que "would make things worse". No dice qué probó.
- **Hojas de datos:** ni Dubox ni Harwin M20 listan enclavamiento (2.2).
- **Aquí:** la guía suspende la caja interior (§4) sobre muelles (§5.1), así que la Pi y el arnés se mueven respecto a la caja de arriba. Cuanto mejor se fije el cable a la propia caja interior, menos relativo se moverá el arnés respecto al conector (deducción mía).

### 5.5 Error de colocación del alojamiento

Ver [4.2](#42-geometría-de-la-cabecera-y-alojamientos). Es una deducción mía a partir del mapa de pines, no un fallo documentado. Un alojamiento sin polarización corrido dos columnas pone 5 V en un hilo que va a una entrada de 3,3 V.

### 5.6 Oxidación y contactos de bajo nivel

- En un hilo de All About Circuits, DonBradman dice haber visto **oxidarse los conectores con el tiempo**. Un solo testimonio.
- Dubox lista contacto de oro o de estaño ([2.2](#22-conector-dupont-de-referencia-no-es-el-de-elegoo)). El material y el baño de los terminales de ELEGOO **no se publican**. Una unión de 3,3 V y microamperios es una carga de bajo nivel, el caso que tratan la [ficha del pulsador (sección 6)](../pulsador-arcade-30mm/README.md) y la [de los JST-XH (5.9)](../cables-jst-xh-4-pin/README.md#59-contactos-de-estaño-con-señales-de-bajo-nivel). No he encontrado cifras concretas para Dupont.
- Tampoco sé el chapado de los pines de la cabecera de la Pi 3B+ (no lo da ninguno de los documentos que abrí). Sin verificar.

### 5.7 Aislante y carcasas

- **Tensión del aislante:** ELEGOO no da ninguna. Desertcart pone "Voltage: 5 V" en un campo de tienda, que no es un valor nominal. Las carcasas de referencia de Harwin son UL94V-1; las de ELEGOO, sin dato.
- **Pi brief:** pide que cables y conectores de los periféricos tengan "adequate insulation" para cumplir los requisitos de seguridad.
- **En la máquina:** los hilos de 3,3 V y 5 V comparten caja con 230 V. Mantén el arnés lejos de los bornes de red y sujeto, para que un hilo suelto no pueda tocar fase o neutro (igual que la ficha de los JST-XH, 6.3).
- **Fragilidad:** aislante que se agrieta en los dobleces y carcasas que se rompen (mikrocontroller.net).

### 5.8 Faltan terminales y herramienta

Ver [4.4](#44-terminar-los-extremos) y la [ficha de los JST-XH, 5.11](../cables-jst-xh-4-pin/README.md#511-falta-una-herramienta-para-el-extremo-dupont).

### 5.9 Datos del anuncio inconsistentes y ASIN

Las tiendas se contradicen entre sí y consigo mismas (2.1). El ASIN de tu hoja no coincide con el que citan Hackster y Desertcart. No sé si es otro anuncio del mismo producto, otra variante o un error. Guarda una captura del anuncio y de la caja al recibirla.

### 5.10 Hilo demasiado fino para el faston del pulsador

La ficha del pulsador (9.3) ya avisa de que los fastons aislados se crimpan sobre 0,5 a 1,5 mm² (dato sin fuente en esa ficha) y los hilos Dupont de fábrica son mucho más finos. Con el calibre del kit desconocido, si fuera de 26 a 28 AWG serían 0,08 a 0,13 mm² (tabla AWG de la [ficha de JST-XH](../cables-jst-xh-4-pin/README.md#23-calibres-referencia-para-comprobar-el-cable)) y el crimpado del faston no agarraría. **No lo he podido verificar para tu kit de fastons**: mira el rango que trae. Alternativas: doblar el cobre sobre sí mismo antes de crimpar (consejo de microcontrollerslab para hilo fino) o usar un hilo más grueso. Con CCA, además, un faston crimpado sobre aluminio es mala idea (deducción mía a partir de 5.1).

## 6. Alternativas

Solo incluyo productos que he visto en una página. Precios de las páginas indicadas, del 21-10-2026.

| Alternativa | Qué resuelve | Inconvenientes | Fuente |
|---|---|---|---|
| **Alojamiento hembra multiposición crimpado** (2 × 3 sobre los pines 7 a 12) | Un solo bloque con el orden fijo y sin cuatro piezas sueltas | Hace falta herramienta y terminales; sigue sin bloqueo | 2.2, 4.4 |
| **Pegar o bridar el haz** | Quita tracción y reduce movimiento | El pegamento no debe tocar la cabecera. En V1E se cita el termofusible como ayuda parcial, y el autor del hilo temía que el pegamento empeorara las cosas. En All About Circuits dos usuarios pegan las carcasas con cemento para maquetas | V1E, All About Circuits |
| **Soldar los hilos a los pines de la cabecera** | Unión permanente | Cambiar una Pi obliga a desoldar; el CCA no se suelda | All About Circuits (DonBradman acabó soldando; MrChips lo sugirió con termorretráctil) |
| **Placa de bornes de tornillo sobre la cabecera:** [52Pi GPIO Screw Terminal HAT EP-0129](https://thepihut.com/collections/raspberry-pi-store/products/gpio-screw-terminal-hat) | Tornillos en lugar de fricción; 4 separadores M2.5 en el paquete; "compatible with all 40-pin Raspberry Pi boards" y LED de estado; £13 en The Pi Hut y 14,44 USD en 52Pi | No dice paso ni calibre admitido; **no dice** si saca los 40 pines; suma altura; el enchufe a la cabecera sigue siendo por fricción (aunque con 40 contactos y separadores, deducción mía) | [The Pi Hut](https://thepihut.com/collections/raspberry-pi-store/products/gpio-screw-terminal-hat), [52Pi](https://52pi.com/products/52pi-gpio-screw-terminal-hat-for-raspberry-pi), [wiki 52Pi](https://wiki.52pi.com/index.php/GPIO_Screw_Terminal_Hat_SKU:_EP-0129) |
| **52Pi Mini Screw Terminal GPIO Breakout (EP-0141)** | "Breaks out all 40 GPIO, power and ground pins to individual screw terminals"; "screw-clamped connections that won't pull loose like push-on jumpers"; acepta hilo macizo y puentes macho; incluye separadores M2.5; AUD 18,55; unos 58 × 22 mm | No da paso ni calibre admitido; "adds height", comprobar holgura; 3V3 y 5V quedan en el extremo del pin 1 | [Core Electronics](https://core-electronics.com.au/52pi-mini-screw-terminal-gpio-breakout-board-for-raspberry-pi.html), [wiki 52Pi](https://wiki.52pi.com/index.php/EP-0141) |
| **Geekworm G470** (placa de bornes para Pi) | "All 40 GPIO pins are conveniently available through labeled screw terminals"; Pi 3B+ en la lista; 18 USD | La página dice agotado y a la vez "118 items in stock"; sin paso ni calibre; manual no enlazado | [Geekworm](https://geekworm.com/en-au/products/g470) |
| **Conectores con enclavamiento** (JST-XH, Molex KK 254, Micro-Fit) | Team FDM da al JST-XH como enclavado (JST dice "friction lock", ver 5.4) | Son conectores de cable a placa cuyo macho va soldado en la placa: **no se enchufan sobre los pines pelados de la Pi** (conocimiento general, sin fuente). Haría falta una placa intermedia con hembra abajo y XH arriba; **no he visto un producto concreto** | Team FDM; el resto sin verificar |
| **Cable de cinta IDC de 40 pines o WAGO 2060** | Alternativas habituales | **No investigados** (sin presupuesto de búsqueda) | |

Mi lectura, sin más datos: la placa de bornes cambia cuatro fricciones sueltas de 0,3 N cada una (mínimo de referencia) por un único acoplamiento de 40 contactos sujeto con separadores, y los hilos van atornillados. En teoría es más robusta. **Añade altura**, sigue enchufándose por fricción y no he podido leer el calibre que admite. Para pocas máquinas y un montaje cuidadoso, el alojamiento de 2 × 3 crimpado y bien sujeto es más barato.

## 7. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Usa los ELEGOO para banco, no como arnés definitivo.** Sirven para probar la UART y el pulsador sobre la mesa y para tener repuestos. Para la máquina, termina los hilos de 22 AWG de cobre con terminales Dupont hembra crimpados en un alojamiento de varias posiciones.
2. **Un solo alojamiento de 2 × 3 sobre los pines 7 a 12** (o 2 × 4 sobre 5 a 12 si decides el GND extra de la ficha JST-XH 6.5). **Marca el lado del pin 1** y comprueba con 4.5 antes de dar tensión. Evita la solución de cuatro 1 × 1 sueltos.
3. **Compra una crimpadora de terminales abiertos para Dupont** (SN-28B o PA-09) y terminales y alojamientos de 2,54 mm. El gasto es pequeño frente a una máquina parada. Pruébala con terminales de repuesto (4.4).
4. **Si usas los ELEGOO en la máquina de todas formas:** (a) pruébalos como en la tabla de abajo; (b) no los cortes ni los sueldes; (c) usa los hembra-hembra solo si encajan con firmeza en un pin de 0,64 mm; (d) fíjalos como en el punto 5.
5. **Alivio de tracción:** brida a un punto fijo de la **misma caja interior que la Pi**, a unos 30 a 50 mm del alojamiento y con un seno de cable entre ese punto y la caja de arriba. Que cable y Pi se muevan juntos. Si pones adhesivo, solo entre el cable y el alojamiento, **nunca sobre la cabecera de la Pi** y sin que cubra los contactos.
6. **Software defensivo en la UART:** contador de errores de suma de comprobación y de falta de respuesta por prueba y registro de ambos; **tratar "sin respuesta" como fallo del sensor**, no como "0"; y confirmar el resultado con dos lecturas coherentes antes de mostrarlo, por la tasa de 1/256 de 4.3. No cobrar si el sensor no responde.
7. **Longitud:** 20 cm pueden ser pocos para el pulsador. No tengo las cotas entre el pulsador y la Pi (caja de arriba y caja interior suspendida). Con holgura para los muelles, mide en el 3D de la carcasa. Si no llega, usa hilo propio, no los puentes.
8. **Altura:** un alojamiento hembra sobre los 8,5 mm de la cabecera suma altura. Mide la holgura entre la cabecera y la pared de la caja interior (63,5 mm de profundidad según la guía), sobre todo si te decides por una placa de bornes.
9. **Repuestos:** 3 o 4 alojamientos crimpados por máquina más un puñado de terminales sueltos. El resto del kit, para banco.
10. **Segregación de tensiones:** arnés lejos de los bornes de 230 V y de la fuente conmutada, sujeto, con pasacables donde cruce chapa (ficha JST-XH, 6.3).
11. **Compra de una tirada y registro del lote.** Es un producto genérico: no vi avisos de descatalogación (no lo busqué específicamente) y no hay nada que impida que un lote nuevo cambie de conductor o de terminal. Guarda la captura del anuncio y una foto de la caja, y repite las pruebas de abajo con cada lote nuevo.
12. **Decisión pendiente (tuya):** para pocas máquinas, alojamiento 2 × 3 crimpado y bien sujeto. Para una flota en bares, valora una placa de bornes (sección 6) tras medir la altura y mirar el calibre que admite. No he visto cifras que permitan decidirlo por ti.

### Qué comprobar al recibir el lote

Hazlo con los hilos que vayas a usar, con tres o cuatro más de repuesto y una muestra de cada cinta.

| Prueba | Cómo | Criterio |
|---|---|---|
| Contenido | Contar cintas y hilos | 3 cintas de 40 (macho-hembra, macho-macho, hembra-hembra); si no, reclamar |
| Continuidad | Polímetro en continuidad, extremo a extremo | Suena en todos; ningún vecino suena con otro |
| Resistencia | Escala de 200 Ω, restando la lectura con las puntas juntas | Un cobre de 26 a 28 AWG de 20 cm da unos 0,03 a 0,04 Ω (cálculo mío): un polímetro normal no lo ve. Descarta lo que pase de unos 0,5 Ω netos (criterio mío; MarkT, Arduino Forum, dice que más de 1 Ω es "junk") |
| Flexión | Continuidad mientras doblas el cable cerca de la carcasa y tiras de ella (consejo de Ian.M, EEVblog) | Lectura estable |
| Material | Pelar 5 mm de 2 o 3 hilos sacrificados y cortar una hebra en sección; imán (Ian.M); Ian.M también propone una prueba a la llama | Cobre = naranja en toda la sección; núcleo blanco o plateado bajo una capa de cobre = aluminio (criterio mío); si el imán lo atrae = acero |
| Calibre | Calibre o pie de rey sobre el cobre pelado y sobre el aislante | Apunta los valores. 26 AWG = 0,40 mm y 28 AWG = 0,32 mm en macizo; algo más trenzado ([ficha JST-XH, 2.3](../cables-jst-xh-4-pin/README.md#23-calibres-referencia-para-comprobar-el-cable)) |
| Ajuste al pin | Enchufa cada hembra a usar en un pin de 0,64 mm de repuesto (una tira de cabecera suelta) | Se nota fricción; no cae por su peso. Si tienes báscula: aguanta al menos 0,3 N (30 g colgados en vertical, referencia Dubox) |
| Tirón del terminal | Tirar con suavidad de cada hilo desde la carcasa | El hilo no se mueve (Team FDM) |
| Aislante | Doblar y soltar varias veces en el punto de uso | Sin grietas (mikrocontroller.net) |

Pruebas destructivas solo sobre hilos sobrantes. **No pruebes el ajuste con los pines de la Pi** más de lo necesario (200 ciclos de referencia).

## 8. Lo que no he podido verificar

- **El anuncio de Amazon.es** (ASIN B01NGTXASZ): Amazon bloquea el acceso y la búsqueda por el ASIN no devolvió nada. Si es el mismo producto que el B01EV70C78 de Hackster y Desertcart, **no lo sé**. No he visto precio, fotos, reseñas ni especificaciones del anuncio de Amazon.es.
- **El calibre (AWG), la cantidad de hebras y el material real del conductor.** El CCA es lo que dicen cinco páginas de tiendas, probablemente copiadas de un mismo anuncio. ELEGOO no publica nada. No lo he medido.
- **El material, el chapado y la fuerza de extracción de los terminales y carcasas del kit.** Las cifras de la sección 2.2 son de piezas de otras marcas.
- **Los 0,64 mm del pin de la Pi 3B+ y su chapado:** no están en los documentos de Raspberry Pi que abrí.
- **Qué fila de la cabecera es la interior:** sin texto oficial. Un artículo secundario dice lo contrario.
- **Reseñas de Amazon.es y de Reddit.** No tuve acceso a Amazon, no pude abrir Reddit y el presupuesto de búsquedas se agotó. Las reseñas de este kit salen de un resumen de Hackster.
- **Un hilo concreto de foro de la Pi con UART y Dupont** que dé errores de trama. No lo encontré; lo del contacto intermitente aplicado a la UART es deducción mía.
- **Páginas que la herramienta bloqueó** (no reintenté): [Samtec TSW](https://www.samtec.com/products/tsw), [SparkFun, GPIO pinout](https://learn.sparkfun.com/tutorials/raspberry-gpio/gpio-pinout), [Molex KK 254](https://www.molex.com/en-us/products/connector-families/kk-254), [catálogo Harwin M20 en Farnell](https://www.farnell.com/datasheets/2898005.pdf) y [el dibujo M20-107 de Harwin](https://content.harwin.com/asset/b4f1d83e-6b34-4617-ba41-3cc2c2450892/DRG-00377-Technical-Drawing-Datasheet-M20-107-pdf.pdf). Tampoco abrí el [dibujo M20-118](https://content.harwin.com/asset/d742d022-1905-41c8-b996-8feb2ed262c8/DRG-00379-Technical-Drawing-Datasheet-M20-118-pdf.pdf).
- **Alternativas sin investigar:** cable de cinta IDC de 40 pines, WAGO 2060, placas intermedias de hembra a JST/Molex, alojamientos Dupont 2 × N concretos en Amazon.es, precio de la Engineer PA-09, paso y calibre de las placas de bornes 52Pi y Geekworm.
- **Rango de cable de los fastons** del kit B0B4H54KPS: no lo he visto.
- **Longitud necesaria entre la Pi y el pulsador:** faltan las cotas.
- **Mediciones reales** de resistencia, extracción o vida de los contactos del kit: no he tenido el producto.

## 9. Fuentes

Todos los enlaces, ordenados por tipo y con nota de los que no pude abrir, en [`enlaces.md`](enlaces.md).
