# Cables JST-XH de 4 pines (clavija del sensor ZE29A)

Cables precrimpados con conector tipo JST-XH de 4 pines. Sirven de "clavija" entre el módulo Winsen ZE29A y el resto de la máquina: dos hilos (5 V y GND) van a las regletas WAGO y otros dos (TX y RX) van a la UART de la Raspberry Pi.

- **Compra:** ASIN B0CBWZNP6Z, 8,99 € (precio de la hoja de componentes del 19-20-10-2026). Según la guía de montaje: 25 juegos, 4 pines, 150 mm, 22 AWG, "por si el ZE29A no trae su cable. Comprobar que su J1 es XH".
- **Ficha del sensor:** la hace otro agente en `componentes/winsen-ze29a`. Aquí solo se trata lo que afecta al cable.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mis herramientas y no intenté abrir el anuncio: el precio, el calibre, la longitud y el contenido del juego son los de tu hoja y la guía, no los he visto.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Cableado e integración](#4-cableado-e-integración)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Recomendaciones para el alcoholímetro](#6-recomendaciones-para-el-alcoholímetro)
7. [Lo que no he podido verificar](#7-lo-que-no-he-podido-verificar)
8. [Fuentes](#8-fuentes)

---

## 1. Resumen para el proyecto

- **No he podido confirmar que el conector del ZE29A sea un XH.** El manual oficial V1.1 da el pinout de 4 pines, pero no nombra el tipo de conector ni su paso. La guía lo da como hipótesis ("comprobar que su J1 es XH"). Si no coincide, sería un fallo de compra (8,99 €, poco dinero, pero bloquea el montaje). Se resuelve con el módulo en la mano: ver [5.1](#51-el-j1-del-ze29a-no-es-xh).
- **El orden de pines de la guía coincide con el manual:** 1 = 5 V, 2 = GND, 3 = TX (salida), 4 = RX (entrada). La serigrafía "Rx Tx GND 5V" que la guía ve en la foto del anuncio es el orden inverso; es coherente solo si el pin 1 está en el extremo del 5 V. **Hay que comprobarlo con polímetro antes de dar tensión.**
- **El cableado a la Pi de la guía es correcto.** El esquema oficial de la Pi 3B+ confirma pin 8 = GPIO14 (TXD0) y pin 10 = GPIO15 (RXD0), y la guía cruza TX con RX como debe. El 5 V y el GND de la clavija no van a la Pi, sino a las WAGO.
- **El XH original sobra en lo eléctrico:** 3 A con AWG 22, 250 V, −25 a +85 °C, 10 mΩ de resistencia de contacto (JST). El ZE29A consume menos de 500 mA. **El riesgo es mecánico:** JST lo clasifica como "friction lock" (de fricción, no un bloqueo positivo), no publica fuerza de retención ni ciclos de acoplamiento, y el manual de Winsen pide evitar golpes y vibraciones y fijar bien el sensor.
- **Un kit genérico de Amazon no es un JST original.** Hay clones etiquetados "2,54 mm" que en realidad miden 2,5 mm, calibres inferiores al anunciado, crimpados deficientes y cable CCA. No he visto este anuncio, así que hay que **inspeccionar el lote al recibirlo** ([6.2](#62-qué-comprobar-al-recibir-el-lote)).
- **Dos huecos en el plan de la guía** (deducciones mías): no hay herramienta comprada para terminar los hilos de señal con Dupont hembra (la crimpadora de la hoja parece de punteras) y 150 mm puede quedarse corto entre el sensor y las WAGO. Ver [5.11](#511-falta-una-herramienta-para-el-extremo-dupont) y [5.12](#512-150-mm-puede-ser-poco).

## 2. Especificaciones

### 2.1 Conector JST serie XH (original)

Fuente: [catálogo XH de JST en inglés](https://www.jst-mfg.com/product/pdf/eng/eXH.pdf), [copia de jst.co.uk de 2021-04-07](https://jst.co.uk/downloads/series/eXH_%2821-04-07%29.pdf) y [página de la serie en jst-mfg.com](https://www.jst-mfg.com/product/detail_e.php?series=277). Las cifras coinciden entre las tres fuentes salvo donde se indica.

| Característica | Valor | Fuente |
|---|---|---|
| Paso | **2,5 mm** | JST |
| Circuitos | 1 a 16 y 20 | JST (página de la serie) |
| Corriente nominal | 3 A CA/CC (con AWG 22) | JST |
| Tensión nominal | 250 V CA/CC | JST |
| Temperatura | −25 a +85 °C, incluido el calentamiento por la corriente | JST |
| Resistencia de contacto | 10 mΩ máx. inicial; 20 mΩ máx. tras ensayos ambientales | JST |
| Resistencia de aislamiento | 1.000 MΩ mín. | JST |
| Tensión soportada | 1.000 V CA durante 1 min | JST |
| Cable admitido | AWG 30 a 22 (0,05 a 0,33 mm²); aislante Ø 0,9 a 1,9 mm | JST |
| Contactos | Bronce fosforoso estañado; dorado o latón bajo pedido | JST |
| Carcasa | Poliamida, UL94V-0 (ver nota) | JST |
| Tipo de bloqueo | "Friction lock" (de fricción); la hoja de catálogo no habla de pestaña de bloqueo | JST (página de la serie) |
| Polarización | La página de la serie no la declara; solo dice que el cajetín cuadrado del conector de placa evita insertarlo torcido | JST (página de la serie y de jst.co.uk) |
| Normas | UL: reconocido, archivo E60389. CSA: LR20812. TÜV: J50014297. RoHS2 | [jst.co.uk](https://jst.co.uk/productSeries.php?pid=136) |
| Ciclos de acoplamiento | **No publicados** en los catálogos que leí | |
| Fuerza de retención del contacto, de inserción y de extracción | **No publicadas** (solo se dice que el contacto "N" es de baja fuerza de inserción) | |

Referencias de piezas relevantes (JST):

| Pieza | Referencia | Cable admitido | Aislante Ø | Nota de JST |
|---|---|---|---|---|
| Carcasa hembra de 4 circuitos | XHP-4 | | | Cota A = 7,5 mm, B = 12,3 mm |
| Conector de placa, entrada superior | B4B-XH-A | | | |
| Conector de placa, entrada lateral | S4B-XH-A | | | |
| Contacto normal | SXH-001T-P0.6 | AWG 28 a 22 | 0,9 a 1,9 mm | |
| Contacto de baja fuerza de inserción | SXH-001T-P0.6N | AWG 26 a 22 | 1,3 a 1,9 mm | JST avisa de que "sería menos resistente a la vibración" |
| Contacto para cable fino | SXH-002T-P0.6 | AWG 30 a 26 | 0,9 a 1,3 mm | |

Nota sobre el material de la carcasa: el PDF actual de jst-mfg.com, tal como lo extrajo mi herramienta, da PA 66 para la XHP-4, y la copia de jst.co.uk de 2021 da PA 6 con UL94V-0. No he podido resolver la diferencia; no afecta al uso.

### 2.2 Lado del sensor ZE29A (lo que importa al cable)

Fuente: [manual de Winsen V1.1](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf) ([copia local](../winsen-ze29a/datasheets/ze29a-c2h5oh.pdf)), leído con una herramienta que extrae el texto (no he visto las imágenes del PDF).

| Característica | Valor |
|---|---|
| Pin 1 | Vin, 5 V |
| Pin 2 | GND |
| Pin 3 | UART TXD, salida TTL 3,3 V |
| Pin 4 | UART RXD, entrada TTL 3,3 V |
| Comunicación | 9600 baudios, 8 bits, 1 stop, sin paridad |
| Alimentación | 5 V ±0,3 V; corriente de trabajo inferior a 500 mA |
| Tamaño del módulo | 85 × 33 × 18 mm |
| **Tipo y paso del conector** | **No indicado en el texto del manual ni en las páginas de producto que abrí** |
| Aviso sobre la alimentación | "Atención a la conexión de la alimentación de 5 V" (el manual no dice si hay protección contra polaridad inversa) |
| Aviso mecánico | Fijar el sensor a la estructura para que no se afloje con el uso largo; evitar golpes y vibraciones fuertes |

### 2.3 Calibres: referencia para comprobar el cable

Fuente: [Wikipedia, American wire gauge](https://en.wikipedia.org/wiki/American_wire_gauge), cobre macizo. En hilo trenzado el diámetro total sale un 13 % mayor que en macizo del mismo AWG (misma fuente).

| AWG | Diámetro del cobre (mm) | Sección (mm²) | Resistencia (Ω/km) | Cabe en contacto SXH-001T-P0.6 |
|---|---|---|---|---|
| 22 | 0,644 | 0,326 | 52,96 | Sí |
| 24 | 0,511 | 0,205 | 84,22 | Sí |
| 26 | 0,405 | 0,129 | 133,9 | Sí |
| 28 | 0,321 | 0,0810 | 212,9 | Sí (el "N" no) |

### 2.4 El cable que se compra (según la hoja y la guía)

| Dato | Valor | Fuente |
|---|---|---|
| Juegos | 25 | Guía de montaje, §1 fila 7 |
| Pines | 4 | Guía |
| Longitud | 150 mm | Guía |
| Calibre anunciado | 22 AWG | Guía |
| Precio | 8,99 € (unos 0,36 € por juego, cálculo mío) | Hoja de componentes |
| Marca, conductor (cobre o CCA), tipo de contacto, aislante, si el juego es macho + hembra o solo hembra | **Sin verificar** | No he visto el anuncio |

## 3. Documentos oficiales

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Catálogo de la serie XH (inglés) | eXH | PDF | [descargar](https://www.jst-mfg.com/product/pdf/eng/eXH.pdf) |
| Catálogo XH, copia de JST Reino Unido (2021-04-07) | eXH_(21-04-07) | PDF | [descargar](https://jst.co.uk/downloads/series/eXH_%2821-04-07%29.pdf) (la URL original lleva paréntesis) |
| Catálogo XH (japonés) | XH | PDF | [descargar](https://www.jst-mfg.com/product/pdf/jpn/XH.pdf?6ad80f29a5547) (no lo abrí) |
| Página de la serie XH con planos 2D/3D | serie 277 | Web | [jst-mfg.com](https://www.jst-mfg.com/product/detail_e.php?series=277) |
| Planos 2D de ejemplo | XHP-1, B2B-XH-A | PDF | [XHP-1](https://www.jst-mfg.com/product/index.php?type=10&series=277&doc=4&filename=XHP-1.pdf) · [B2B-XH-A](https://www.jst-mfg.com/product/index.php?type=10&series=277&doc=4&filename=B2B-XH-A.pdf) (la tabla de la página ofrece lo mismo para cada referencia, incluida la XHP-4) |
| Manuales de manejo (crimpado e inserción) | CHM-1-2321, CHM-1-2342, CHM-1-151 | PDF | [enlace de JST](https://www.jst-mfg.com/product/index.php?type=10&series=277&doc=11&filename=CHM-1-2321.pdf%7CCHM-1-2342.pdf%7CCHM-1-151.pdf) (el original lleva barras verticales, aquí codificadas) (**no pude abrirlo**: devuelve la portada) |
| Lista de normas registradas en el extranjero | | PDF | [descargar](https://www.jst-mfg.com/product/pdf/list_of_registered_overseas_standards.pdf) (no lo abrí) |
| Manual del módulo ZE29A-C2H5OH V1.1 | | PDF | [descargar](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf) ([copia local](../winsen-ze29a/datasheets/ze29a-c2h5oh.pdf)) |
| El mismo manual V1.1 con otro nombre de archivo | ze29a-alcohol-module-manualv1_0 | PDF | [descargar](https://www.winsen-sensor.com/d/files/ze29a-alcohol-module-manualv1_0.pdf) |
| Esquema reducido de la Pi 3B+ (conector J8) | RP-008339-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) · copia local en [`../raspberry-pi-3b-plus/datasheets/`](../raspberry-pi-3b-plus/datasheets/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) |
| Molex, Quality Crimping Handbook (rev. C, 2009) | TM-638000029 | PDF | [descargar](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf) ([copia local](../terminales-ojal-m4/datasheets/Quality_Crimp_Handbook.pdf)) |
| Cirris, fuerzas mínimas de arranque de crimpado por calibre | | Web | [página](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/) |
| WAGO 221-415, hoja de datos (copia de un distribuidor) | | Web | [radiolocman](https://www.radiolocman.com/datasheet/data.html?di=537187) |

No hay **declaración de conformidad ni hoja de seguridad** de este kit: es un producto genérico de Amazon y no he visto nada del vendedor. JST publica las normas de la serie original (UL, CSA, TÜV), pero eso **no se hereda** a un kit de otra marca.

### Qué dicen los documentos más relevantes

- **JST, catálogo XH:** da paso 2,5 mm, 3 A, 250 V, −25 a +85 °C, 10 mΩ de contacto y los rangos de cable de cada contacto. No da ciclos de acoplamiento, fuerza de retención ni números de arranque del crimpado. Con 0,5 A y 22 AWG el margen eléctrico es 6 veces (cálculo mío).
- **JST, página de la serie:** clasifica el bloqueo como "friction lock". La página de JST Reino Unido añade que los contactos son de viga plegada, pensados para circuitos secos de baja tensión y baja corriente. Para el contacto "N" de baja fuerza de inserción, JST avisa de que resiste peor la vibración.
- **Winsen, manual V1.1:** pinout de 4 pines y UART a 3,3 V (ver 2.2). No nombra el conector, ni el paso, ni un cable de acoplamiento.
- **Esquema de la Pi 3B+:** el conector J8 es una cabecera de 40 pines "0.1"" (2,54 mm). Pines 2 y 4 a 5 V, pin 6 a GND, pin 8 = GPIO14 (TXD0), pin 10 = GPIO15 (RXD0), pin 9 = GND, pin 11 = GPIO17. Lo leí en la imagen del esquema, no solo en el texto.
- **Molex, Quality Crimping Handbook:** criterios visuales de un crimpado de barril abierto (ver [6.2](#62-qué-comprobar-al-recibir-el-lote)).

## 4. Cableado e integración

### 4.1 Contraste con la guía de montaje

| Punto | Guía (`claude/guia-montaje-electrico.md`) | Fuente primaria | Veredicto |
|---|---|---|---|
| Orden de pines del ZE29A | 1 = 5 V, 2 = GND, 3 = TX, 4 = RX (§2.4) | Manual Winsen V1.1: 1 = Vin 5 V, 2 = GND, 3 = TXD, 4 = RXD | **Coincide** |
| Conector del módulo | "Conector Rx Tx GND 5V" en la foto; "comprobar que su J1 es XH" (§1 fila 6 y 7) | El manual no nombra conector ni paso | **Sin confirmar** |
| Serigrafía frente a numeración | "Rx Tx GND 5V" | Manual: pin 1 = 5 V ... pin 4 = RX | Orden inverso; coherente si el pin 1 está en el lado del 5 V |
| Señales en la Pi | Pin 8 (GPIO14, TXD) al pin 4 del ZE29A (RX); pin 10 (GPIO15, RXD) al pin 3 (TX) (§5.3) | Esquema Pi 3B+ RP-008339-DS-1: pin 8 = GPIO14 (TXD0), pin 10 = GPIO15 (RXD0) | **Coincide**; el cruce TX a RX es correcto |
| Niveles | UART de 3,3 V, directo a la Pi, sin conversor (§2.4) | Manual: TXD y RXD 3,3 V TTL; Pi con GPIO de 3,3 V ([ficha de la Pi](../raspberry-pi-3b-plus/README.md)) | **Coincide** |
| Consumo | 0,1 A típico (estimado), 0,5 A de pico (§3) | Manual: corriente de trabajo inferior a 500 mA; no da típico | El pico coincide; el típico es estimación de la guía |
| Cable de 22 AWG en WAGO 221-415 | Hilos rojo y negro de la clavija al polo 5 de cada WAGO (§5.2) | WAGO 221-415: hilo flexible de 0,14 a 4 mm² (24 a 12 AWG), pelado de 11 mm (copia de distribuidor) | Encaja (22 AWG = 0,33 mm²) |
| Alimentación del ZE29A | 5,20 V en la fuente, máximo 5,25 V (§2.6) | Manual: 5 V ±0,3 V, es decir, 4,7 a 5,3 V | Coincide; el margen hasta el mínimo es de 0,5 V |
| Longitud de 150 mm | La clavija trae 150 mm (§1 fila 7) | | **Sin verificar** que alcance (ver 5.12) |

La guía **no da el paso del conector** ni dice si la clavija se vende macho, hembra o ambos.

### 4.2 Cómo llega cada hilo a su sitio (según la guía)

| Hilo de la clavija | Va a | Con qué | Fuente |
|---|---|---|---|
| Pin 1, 5 V (rojo) | Polo 5 de la WAGO de +5 V | Hilo pelado en el borne de palanca (11 mm de pelado según la hoja de la WAGO) | Guía §5.2 |
| Pin 2, GND (negro) | Polo 5 de la WAGO de GND | Igual | Guía §5.2 |
| Pin 3, TX del sensor | Pin físico 10 de la Pi (GPIO15, RXD) | Dupont hembra en la Pi | Guía §5.3 |
| Pin 4, RX del sensor | Pin físico 8 de la Pi (GPIO14, TXD) | Dupont hembra en la Pi | Guía §5.3 |

**No hay pieza intermedia:** ni regleta de tornillo ni HAT. Cada hilo de señal debe acabar en una terminal Dupont hembra. La guía no dice cómo se hace (ver 5.11).

Observaciones mías sobre el lado de la Pi, a partir del esquema oficial:

- Los pines 8 y 10 son **consecutivos en la misma columna** de la cabecera. Un único alojamiento Dupont de 1 × 2 los cubre y es más estable que dos de 1 × 1.
- En esa misma columna están el pin 4 (5 V) y el pin 6 (GND), justo encima. **Si se cuenta una fila de más o de menos, un 5 V puede acabar en el RX del sensor o en un pin equivocado.** Conviene marcar la orientación del alojamiento.

### 4.3 Orientación y polaridad

- El orden de los hilos en la carcasa XH **lo decide quien crimpó el cable**, no JST. Los colores de un kit genérico no son un estándar. JST no define colores en lo que leí.
- La polarización mecánica no es una garantía. JST no la declara en la página de la serie; solo dice que el cajetín de 4 lados del conector de placa evita una inserción torcida. Eso no equivale a una polarización que impida girar la carcasa 180°. **Sin verificar con el módulo.**
- Aunque la carcasa solo entre de una forma, el cable puede tener los hilos en orden distinto al del módulo. Una carcasa XH "polarizada" no detecta eso.
- El manual del ZE29A no dice si el módulo se protege de la polaridad invertida. **Trátalo como si no lo hiciera.**

### 4.4 Comprobación con polímetro antes de dar tensión

Con todo apagado y desconectado. (Procedimiento mío, no sale de una fuente.)

1. **Encaja el conector en el J1** sin fuerza. Si hay que empujar, no es el paso correcto.
2. **Continuidad hilo a hilo.** Si el cable es de doble extremo, de un conector al otro. Si solo lleva carcasa en un lado, toca el contacto metálico con una sonda fina y el hilo pelado del otro. Cada hilo debe sonar de principio a fin y no sonar con sus vecinos.
3. **Identifica cada posición de la carcasa:** apunta el color de cada posición 1 a 4, contando desde el lado del pin 1 del módulo (el extremo de la serigrafía "5V", si la guía lee bien la foto).
4. **GND:** mide continuidad entre el hilo que crees GND y un punto de masa claro del módulo (cátodo de un condensador electrolítico, patilla de masa del regulador, tornillo metálico de fijación si lo hay).
5. **5 V frente a GND:** con el módulo sin alimentar, entre los hilos 5 V y GND no debe haber un cortocircuito (no puede dar casi 0 Ω de forma estable).
6. **Primera alimentación solo con 5 V y GND** (sin los hilos de señal conectados a la Pi), idealmente desde una fuente con limitación de corriente a unos 300-500 mA, o con el polímetro en serie en la escala de mA. Mide entre las patillas del J1 marcadas "5V" y "GND": debe estar dentro de 4,7 a 5,3 V (manual).
7. **Después conecta TX y RX a la Pi.** Si el sensor no responde al comando de lectura de estado (0x85 según la guía), apaga y cambia TX por RX. Un cruce mal puesto enfrenta dos salidas de 3,3 V; no lo dejes conectado así mucho tiempo (deducción mía).

## 5. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto | Evidencia |
|---|---|---|---|
| 1 | El J1 del ZE29A no es XH | Media (compra inútil) | Sin verificar |
| 2 | Paso 2,5 mm frente a "2,54 mm" en clones | Baja con 4 pines | Foros |
| 3 | Orden de hilos o colores distintos al del módulo | **Alta** (daño por 5 V invertido) | Deducción |
| 4 | 5 V y GND invertidos en el ZE29A | **Alta** | Manual solo avisa |
| 5 | Crimpado frío o contacto mal asentado | Media-alta | Foros y manual de Molex |
| 6 | Cable CCA o calibre menor del anunciado | Media | Foros, fuentes de cableado |
| 7 | Aislante demasiado grueso o fino para el contacto | Media | JST |
| 8 | Sin bloqueo positivo y vibración | Media-alta | JST y Winsen |
| 9 | Contactos de estaño con señales de bajo nivel | Baja-media | JST y deducción |
| 10 | GND abierto con 5 V presente | **Alta** si pasa (poco probable) | Deducción mía |
| 11 | Falta herramienta para el extremo Dupont | Media | Deducción sobre la guía |
| 12 | 150 mm puede ser poco | Media | Deducción sobre la guía |

### 5.1 El J1 del ZE29A no es XH

- El manual V1.1 y las páginas de producto de Winsen que abrí no dicen qué conector lleva el módulo ni su paso. Tampoco lo dicen la copia de [robu.in](https://robu.in/wp-content/uploads/2023/02/ZE29A-DATASHEET.pdf), la de [manuals.plus](https://manuals.plus/winsen/ze29a-c2h5oh-alcohol-sensor-module-manual) ni el [hilo del foro de Arduino](https://forum.arduino.cc/t/alkoholtestsensor-ze29a-c2h5oh-mit-arduino-verbinden-und-daten-lesen/1344484) (enero de 2025), donde nadie describe el conector. El manual tiene una sección "DIMENSION" con un dibujo que **no he podido ver**: puede que ahí salga el conector.
- La guía lee "Rx Tx GND 5V" y "placa WS19" en la foto del anuncio. No puedo confirmar ni el nombre de la placa ni el tipo de conector por la foto.
- **Cómo comprobarlo con el módulo en la mano** (mías):
  - Mide de centro a centro entre el primer y el último pin. Tres pasos dan: XH 7,5 mm (3 × 2,5, coincide con la cota A del catálogo), cabecera de 2,54 mm 7,62 mm, JST PH de 2,0 mm 6,0 mm. XH y 2,54 mm no se distinguen con un calibre: difieren 0,12 mm.
  - Prueba el encaje de una carcasa XH: debe entrar con suavidad y asentarse sin holgura.
- Si el módulo trae ya su cable, la compra del kit es un repuesto; si el conector es otro, hay que buscar la carcasa que corresponda.

### 5.2 Paso 2,5 mm frente a "2,54 mm"

- JST fabrica la serie XH a **2,5 mm**. Muchos vendedores la llaman "XH2.54". En un hilo de KiCad (abril de 2024) un usuario midió un kit de 460 piezas etiquetado 2,54 mm y resultó ser de 2,5 mm. Otro usuario sostiene que existen conectores "no JST" de aspecto idéntico con paso 2,54 mm. ([foro de KiCad](https://forum.kicad.info/t/jst-xh-3a-connectors/50145))
- En ese hilo se cita a un vendedor que dice que con **4 pines o menos ambos pasos son intercambiables**; es un comentario de foro, sin verificar. La diferencia acumulada con 4 pines es 3 × 0,04 = 0,12 mm (cálculo mío).
- Un mensaje de un hilo de Duet3D da por hecho que XH es 2,54 mm; JST dice 2,5. Es la confusión habitual, no una segunda especificación. ([foro de Duet3D](https://forum.duet3d.com/post/94362?page=2))
- Las tiendas que vi (por ejemplo [Tayda](https://www.taydaelectronics.com/4-pins-jst-xh-2-54-female-connector-with-wire-cable-26awg-30-cm.html), con 26 AWG y 30 cm) rotulan "JST XH-2.54" sin decir que el fabricante sea JST: el fabricante figura "N/A".

### 5.3 Orden de hilos o colores no estándar

No encontré una fuente que documente este fallo en kits XH concretos. Es una deducción mía: el orden lo fija el montador, y los colores solo son una convención. Si el cable es de doble extremo, también puede haber un montaje cruzado. **La prueba de continuidad de [4.4](#44-comprobación-con-polímetro-antes-de-dar-tensión) lo cubre.**

### 5.4 Polaridad invertida en el ZE29A

El manual de Winsen solo avisa de "prestar atención" a los 5 V; no da protección ni límites. Con una fuente a 5,20 V (guía) y un máximo de 5,3 V del módulo, hay poco margen incluso en el sentido correcto. **Sin datos del fabricante**: trátalo como sin protección.

### 5.5 Crimpado frío o contacto mal asentado

- El manual de crimpado de Molex ([Quality Crimping Handbook](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf) ([copia local](../terminales-ojal-m4/datasheets/Quality_Crimp_Handbook.pdf))) lista defectos típicos: hebras cortadas o rayadas, aislante bajo el crimpado del conductor, crimpado del aislante flojo o demasiado apretado, boca de campana ausente o excesiva, y altura de crimpado incorrecta.
- Sobre cables baratos de tipo Dupont (no XH), hay testimonios de crimpados sin hilo dentro, hilos rotos que dan contacto según se doble el cable, y extremos que se parten ([mikrocontroller.net, abril de 2021](https://www.mikrocontroller.net/topic/516562)). Un usuario de EEVblog ([marzo de 2019](https://eevblog.com/forum/beginners/voltage-drop-at-breadboard)) cita lo mismo: hilo demasiado fino, no de cobre y crimpados mal hechos. **No son kits XH**, pero la fabricación barata es la misma.
- **Un contacto que no ha enganchado en la carcasa** también falla. Es una deducción mía: el contacto debe oírse o notarse al asentarse y no deslizarse hacia atrás con un tirón suave.

### 5.6 Cable CCA o calibre menor del anunciado

- CCA es aluminio recubierto de cobre. Fluke Networks y Belden dicen que el aluminio tiene "aproximadamente un 55 % más" de resistencia que el cobre para el mismo diámetro, que se oxida al aire y que es más quebradizo (en un caso escolar, el 30 % de los enlaces falló por continuidad). Son cifras del aluminio y de cableado de red, no de este cable. ([Fluke](https://de.flukenetworks.com/blog/cabling-chronicles/cca-not-worth-savings-or-risk), [Belden](https://cn.belden.com/blog/not-in-my-network-copper-clad-aluminum-recipe-for-failure))
- En el hilo de mikrocontroller.net (13-4-2021) un usuario explica que en el CCA el cobre se disuelve en el estaño y el aluminio ya no moja: por eso estos cables "no se dejan soldar". Otro participante recomienda comprobar con un imán los conectores y rechazar los magnéticos.
- En el hilo de EEVblog, un usuario propone distinguir el material mirando el grosor tras pelar, con un imán (acero cobreado) o con una llama (aluminio cobreado).
- **Cálculo mío del efecto eléctrico en 150 mm** (5 V más GND, 0,30 m de bucle, 0,5 A, más dos contactos XH de 10 a 20 mΩ cada uno):

| Caso | Resistencia del cable | Con los contactos | Caída a 0,5 A |
|---|---|---|---|
| 22 AWG cobre | 15,9 mΩ | 36 a 56 mΩ | 18 a 28 mV |
| 28 AWG cobre | 63,9 mΩ | 84 a 104 mΩ | 42 a 52 mV |
| 28 AWG, +55 % (peor caso CCA) | 99 mΩ | 119 a 139 mΩ | 60 a 70 mV |

  El margen de la guía (5,20 V frente a 4,7 V mínimo del manual) es de 0,5 V. **La resistencia no es el problema; sí lo son la rotura de hebras, el crimpado débil y la oxidación.**
- Un "22 AWG" cuyo cobre mide mucho menos de 0,6 mm tras pelar no es 22 AWG (tabla de 2.3).

### 5.7 Aislante demasiado grueso o fino

JST define para cada contacto un aislante de Ø 0,9 a 1,9 mm (1,3 a 1,9 mm para el "N"). Un aislante fuera de esa ventana no queda bien sujeto en el crimpado del aislante y se suelta con la flexión. Es una consecuencia directa de la tabla de JST; **no sé el Ø del aislante de este kit**. Mídelo con calibre.

### 5.8 Sin bloqueo positivo y vibración

- JST declara "friction lock" para la serie XH. Los contactos "N" de baja fuerza de inserción resisten peor la vibración, según el propio JST. No sé qué contacto lleva este kit.
- Desenchufes por vibración o por tirones: en un foro de CNC (V1E, 25-1-2024) varios usuarios cuentan que las clavijas Dupont se sueltan y recomiendan pasar a JST-XH, o añadir pegamento caliente (ayudó pero no resolvió del todo), o aliviar la tracción con una brida. El autor del hilo descartó el cianoacrilato. ([foro V1E](https://forum.v1e.com/t/having-trouble-keeping-the-end-stops-plugged-in/42105))
- El manual de Winsen pide fijar el sensor y evitar golpes y vibraciones fuertes. La guía suspende la caja interior con muelles para eso, lo que **mueve la caja respecto a la fuente** y flexiona el cable que las une.

### 5.9 Contactos de estaño con señales de bajo nivel

Los contactos del XH son de bronce estañado (oro bajo pedido) y JST los describe como "para circuitos secos de baja tensión y baja corriente" (jst.co.uk). Con 3,3 V y corrientes mínimas en TX/RX, una capa de óxido puede dar fallos intermitentes que con 5 V y 0,5 A no se notan. **Es una preocupación mía, sin fuente específica.** El protocolo del ZE29A lleva suma de verificación (guía §2.4), así que el software puede detectar tramas corruptas y reintentar.

### 5.10 GND abierto con 5 V presente

Deducción mía, sin fuente: si el hilo de GND de la clavija se rompe o su contacto se oxida mientras el 5 V sigue llegando, el retorno de la corriente del sensor (hasta 500 mA) puede buscar camino por TX y RX hacia los GPIO de la Pi, que no están pensados para eso. Es poco probable, pero la gravedad es alta. Mitigación posible: ver [6.5](#65-gnd-de-la-uart).

### 5.11 Falta una herramienta para el extremo Dupont

- La guía manda los hilos de TX/RX "con Dupont hembra en la Pi" (§5.3), pero la lista de compra no incluye una crimpadora para terminales Dupont ni para XH. La crimpadora de la hoja (#28) es "autoajustable" con punteras: **parece una herramienta de punteras, no de terminales abiertos** (deducción mía, no he visto el anuncio). Los Dupont ELEGOO (#29) son cables ya hechos.
- Opciones: cortar un puente Dupont hembra por la mitad y empalmarlo (soldadura con termorretráctil, o empalme por crimpado), o comprar terminales Dupont y una crimpadora de barril abierto. En un hilo de Duet3D un usuario (sin nombre en la página) recomienda una Engineer PA-09, y en el de mikrocontroller.net se habla de una crimpadora PSK de Reichelt; **no he comprobado ninguna de las dos**.
- Una soldadura en un hilo trenzado concentra el esfuerzo en el punto rígido y puede romper por fatiga con vibración ([blog de Team FDM](https://www.teamfdm.com/blogs/entry/10-3d-printer-connectors-molex-jst-crimping/)): hay que aliviar la tracción.

### 5.12 150 mm puede ser poco

La guía pone la Pi y el ZE29A dentro de la caja interior suspendida y las WAGO "junto a la fuente", en la caja de arriba (§4). A la vez pide que el latiguillo micro-USB de la Pi mida 15 cm o menos (§1 fila 19). O la caja interior queda pegada a las WAGO, o esos 15 cm no llegan; la guía no lo aclara. El cable del sensor tiene que salir de la caja suspendida, dejar holgura para los muelles y llegar a la regleta, y pierde unos centímetros al pelar el extremo. **No tengo las cotas**: compruébalo en el 3D de la carcasa antes de dar por buena la longitud. Un tramo con holgura para los muelles es mejor que uno tenso.

## 6. Recomendaciones para el alcoholímetro

Son conclusiones mías a partir de lo anterior, no afirmaciones de las fuentes.

### 6.1 Antes de pedir más cable

1. **Identifica el J1 del ZE29A con el módulo delante** ([5.1](#51-el-j1-del-ze29a-no-es-xh)). Si Winsen o el vendedor lo responden por escrito, guárdalo. Pídele a Winsen el dibujo con el conector (la sección "DIMENSION" del manual).
2. Con 8,99 € por 25 juegos, el riesgo económico es bajo. El riesgo real es **montar una clavija sin comprobar** y dañar el sensor (108,46 € en la guía, §1 fila 6).
3. Para la máquina que vaya a un cliente, valora **carcasas y contactos originales JST** (XHP-4 y SXH-001T-P0.6) comprados a un distribuidor autorizado, y un crimpado con la herramienta adecuada. El hilo de [Digi-Key](https://forum.digikey.com/t/jst-connector-xh2-54/8243) (26-8-2020) explica que los contactos no vienen con las carcasas y lista referencias de crimpadoras; **no he verificado esas referencias**.

### 6.2 Qué comprobar al recibir el lote

Son 25 juegos: inspección completa y una muestra destructiva.

| Prueba | Cómo | Criterio |
|---|---|---|
| Visual | Lupa o móvil con zoom en cada crimpado | Hilos visibles en la zona de crimpado; sin hebras cortadas; aislante sin quedar bajo el crimpado del conductor (criterio de Molex); contacto sin deformar |
| Calibre | Pela 5 mm de un hilo de dos juegos y mide el cobre con calibre | 22 AWG = 0,64 mm macizo, algo más trenzado (tabla 2.3). Si da 0,3 mm, es 28 AWG |
| Material | Raspa una hebra con una cuchilla | Cobre por dentro. Plateado = aluminio (CCA). Con imán, si se pega, acero (fuente: EEVblog) |
| Aislante | Calibre sobre el aislante | 0,9 a 1,9 mm (JST); mejor 1,3 a 1,9 mm si el contacto es "N" |
| Continuidad | Polímetro, 4 hilos de todos los juegos | Cada hilo suena de punta a punta; ningún par vecino suena entre sí |
| Prueba de flexión | Mide continuidad moviendo el cable junto al crimpado | La lectura no salta (EEVblog aconseja medir cada cable tras enderezarlo y tirar de los extremos) |
| Tirón a mano | Tira de cada hilo, sin brusquedad | No se mueve nada; el contacto no se desliza dentro de la carcasa |
| Tirón medido (destructivo) | Dinamómetro o báscula colgante, tirando recto, en un contacto de 3 juegos | Ver tabla de abajo |
| Encaje | Enchufa y desenchufa cada carcasa en el J1 (o en un conector XH de prueba) | Entra y sale sin holgura; la fricción es perceptible |
| Orden | Procedimiento de [4.4](#44-comprobación-con-polímetro-antes-de-dar-tensión) | Anotar el color de cada posición; rechazar juegos distintos |

Fuerzas mínimas de arranque de crimpado de **terminales en general** (referencia, no son de XH ni de JST). Fuente: [Cirris](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/), en libras; el paso a N es cálculo mío (1 lb = 4,448 N). Cirris advierte de que es una tabla de referencia y de que hay que consultar las normas.

| AWG | UL 486A (terminales) | DIN 41611/3 | NASA-STD 8739.4 | SAE AS7928 |
|---|---|---|---|---|
| 22 | 8 lb (36 N) | 11,1 lb (49 N) | 13 lb (58 N) | 15 lb (67 N) |
| 24 | 5 lb (22 N) | 8,1 lb (36 N) | 8 lb (36 N) | 10 lb (44 N) |
| 26 | 3 lb (13 N) | 5,0 lb (22 N) | 8 lb (36 N) | 7 lb (31 N) |
| 28 | no figura | 3,2 lb (14 N) | 5 lb (22 N) | no figura |

**Criterio sugerido (mío):** que un crimpado de 22 AWG aguante al menos los 36 N de UL 486A, y mejor 49 N o más. Un blog de impresión 3D afirma que un buen crimpado de 22 AWG "aguanta varios kilos" ([Team FDM](https://www.teamfdm.com/blogs/entry/10-3d-printer-connectors-molex-jst-crimping/), de una persona, no normativo). Si un contacto cede muy por debajo, rechaza el lote.

### 6.3 Instalación y apoyo de los hilos contra la vibración

- **Alivio de tracción a cada lado:** sujeta el cable con una brida a un punto fijo a unos 30-50 mm de la carcasa, dejando un seno de cable con holgura entre las dos cajas (que se flexione allí y no en el crimpado). Anclajes adhesivos o con tornillo para brida; no aprietes tanto que aplastes el aislante.
- **Gota de adhesivo en la unión carcasa-cable:** si la pones, que no entre en el conector ni cubra los contactos, y que no impida desenchufar. Opciones razonables:
  - **Silicona RTV neutra (alcoxi):** el RTV de curado **acético** libera ácido acético y puede corroer metales y componentes electrónicos; el neutro no reacciona con el cobre ([Intertronics](https://intertronics.co.uk/2018/08/adhere-academy-are-rtv-silicone-sealants-corrosive/), [Chemical Concepts](https://www.chemical-concepts.com/whats-the-difference-acetoxy-vs-neutral-cure-silicones/)).
  - **Pegamento termofusible** como en el foro V1E: ayuda pero no es perfecto.
  - **Cianoacrílato:** lo evitaría cerca de los contactos (el autor del hilo del foro V1E lo descartó; el resto es mío, sin fuente).
- **Termorretráctil con adhesivo** sobre la unión: alternativa mía, sin fuente.
- **Lado de la Pi:** los Dupont tampoco tienen bloqueo. Un alojamiento 1 × 2 en los pines 8 y 10, con brida al cable, es más estable que dos individuales. Los foros mencionan "alojamientos Dupont con bloqueo" (foro V1E).
- **Tensión y 230 V:** el cable de 5 V debe ir **fuera del alcance de los bornes de 230 V** y bien sujeto, para que un hilo suelto no pueda tocar fase o neutro. La guía ya fija los cables de red a la carcasa por ese motivo.

### 6.4 Compra y repuestos

- Guarda 3-4 juegos para repuesto por máquina. Un cable estropeado para el sensor es un fallo de máquina parada.
- La serie XH original lleva décadas en catálogo y no vi avisos de descatalogación. El kit de Amazon es genérico y su ASIN o su vendedor pueden cambiar. **Compra de una tirada**, guarda la referencia del anuncio y una foto de las cajas.

### 6.5 GND de la UART

La guía lleva el GND del sensor solo a la WAGO y dice "no hagas más uniones de masa" (§5.2). Es una decisión de diseño que deberías valorar a la luz de 5.10: con un tercer hilo de GND al pin 6 de la Pi (junto a TX y RX, en un alojamiento 1 × 3 en los pines 6, 8 y 10) la señal tendría referencia local aunque se pierda el GND de la WAGO, a cambio de un lazo de masa entre dos caminos. No lo recomiendo ni lo desaconsejo: **decide tú**, mejor tras medir con la máquina montada.

## 7. Lo que no he podido verificar

- **Tipo y paso del conector J1 del ZE29A.** El texto del manual no lo dice; no he visto el dibujo "DIMENSION" ni la foto del anuncio.
- **El anuncio de Amazon de este kit (B0CBWZNP6Z) y el del ZE29A (B0H8NVXVG5):** Amazon bloquea el acceso; no he visto marca, conductor, contacto, aislante ni si el juego es macho, hembra o ambos.
- **Polarización de la carcasa XH** (si entra girada 180°): JST no lo declara en lo que leí.
- **Ciclos de acoplamiento y fuerza de retención del XH:** no están en los catálogos que leí.
- **Manuales de manejo de JST** (CHM-1-2321, CHM-1-2342, CHM-1-151) y la lista de normas registradas: el primero devolvió la portada, el segundo no lo abrí.
- **Qué dice exactamente el catálogo de JST sobre el material de la carcasa:** dos lecturas distintas (PA 6 y PA 66).
- **Que los datos del manual de Winsen salgan completos:** lo leí con una herramienta que resume el texto de los PDF; no he descargado el archivo ni visto sus imágenes. Los pines salieron iguales en cuatro lecturas (el manual de Winsen con sus dos nombres de archivo, la copia de robu.in y la de manuals.plus).
- **Evidencia sobre kits XH concretos de Amazon.es** (marcas, reseñas, CCA): se agotó el límite de búsquedas web de la sesión. Las fuentes que cito sobre calidad son foros y tiendas de otros países, y varias hablan de Dupont, no de XH.
- **Daño por polaridad invertida en el ZE29A** y **efecto de oxidación o *fretting* en contactos de estaño con 3,3 V:** sin datos del fabricante ni fuente.
- **Marcas de crimpadora recomendadas** (Engineer PA-09, PSK): citadas por usuarios, sin comprobar.
- **Longitud real necesaria** entre el sensor y las WAGO: faltan las cotas.

## 8. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos).

Todos los enlaces, ordenados por tipo y con nota de los que no pude abrir, en [`enlaces.md`](enlaces.md).
