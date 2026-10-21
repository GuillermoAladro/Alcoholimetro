# Pendientes que salen de las fichas de componentes

Resumen de lo que las 31 fichas dejan abierto: decisiones tuyas, medidas que hay que tomar con calibre o polímetro, y documentos que faltan. Cada punto remite a la ficha donde está el detalle y la fuente. Esta lista se ha reunido el 21-10-2026 a partir de las fichas; si una ficha cambia, manda la ficha. Ese mismo día se leyeron los anuncios de Amazon.es de diez piezas ([resumen](../montaje-general/anuncios-amazon-21-10-2026.md)): lo que cerró y lo que sigue abierto está en el apartado 5.

## 1. Decisiones de diseño

| # | Decisión | Por qué está abierta | Fichas |
|---|---|---|---|
| 1 | Protección del raíl de 5 V (fusible o PTC por rama, o troncal más grueso) | La LRS-50-5 limita entre 10,6 y 14,4 A y el cable de 0,75 mm² está dado para 6 A | [#14](meanwell-lrs-50-5/README.md), [#21](cable-2x0-75-rojo-negro-10m/README.md) |
| 2 | Sección del conductor de tierra: 1,5 mm² (guía) o 2,5 mm² | La ITC-BT-19 §2.3 pide 2,5 mm² (con protección mecánica) o 4 mm² (sin ella) para conductores de protección fuera del cable de alimentación, en instalación fija. Lo que exige EN 60335-1 cl. 27 no se pudo leer. Los ojales M4 de la hoja son de 0,5 a 1,5 mm² | [#22](cable-h05vv-f-3g1-5-5m/README.md), [#23](terminales-ojal-m4/README.md) |
| 3 | Un solo espárrago de tierra con cinco ojales, o dos espárragos / bloque de tierra | Un solo punto y una sola soldadura es el punto único de fallo; la única guía encontrada recomienda 2-3 ojales por espárrago | [#23](terminales-ojal-m4/README.md), [#24](arandelas-dentadas-m4/README.md), [#25](esparragos-soldar-m4x20/README.md) |
| 4 | Cómo soldar el espárrago: pistola de descarga de condensador en un taller de chapa, o alternativa (tuerca soldada, remache roscado) | Probablemente el espárrago sea de descarga de condensador y una soldadora de puntos normal no sirve (razonamiento de la ficha). Faltan material y espesor de la chapa | [#25](esparragos-soldar-m4x20/README.md) |
| 5 | Herramienta de crimpado para terminales preaislados (ojales y faston) y para Dupont/JST | La crimpadora de la hoja es para punteras; no hay fuente que respalde que crimpe bien ojales ni faston | [#23](terminales-ojal-m4/README.md), [#27](kit-faston-aislados/README.md), [#28](crimpadora-y-punteras/README.md), [#29](cables-dupont-elegoo-120/README.md) |
| 6 | Terminal faston para el cable de 1,5 mm²: azul de nailon, o rojo solo si el envase dice "hasta 1,5 mm²" | 1,5 mm² cae justo entre el rojo y el azul y los fabricantes no coinciden | [#27](kit-faston-aislados/README.md) |
| 7 | Conexión de la Pi a la UART y al pulsador: alojamiento Dupont 2×3 sobre los pines 7 a 12, o placa de bornes | Los pines 8 y 10 comparten fila y el 9 y el 11 van en la otra; un alojamiento 1×2 no cubre los cuatro | [#29](cables-dupont-elegoo-120/README.md), [#7](cables-jst-xh-4-pin/README.md) |
| 8 | Alimentación del Solo y de la pantalla por borne USB-A | El pico de 2 A de la guía supera la clasificación habitual de 1 a 1,5 A de un USB-A. Nada confirma que el Solo reconozca el puente D+/D− como cargador | [#18](borne-usb-a-hembra-tornillo/README.md), [#9](sumup-solo/README.md) |
| 9 | Unir o no el −V (masa de 5 V) a tierra, y en qué punto | La fuente aísla 1,25 kVAC entre salida y tierra, así que el −V flota. Unirlo debe ser una decisión en un solo punto, no un efecto de los tornillos | [#30](separadores-nylon-m2-5/README.md), [#14](meanwell-lrs-50-5/README.md) |
| 10 | Pasacables: tipo según el grosor real de la chapa | Los de uso general sirven para chapa de hasta 1,6 mm; para 2 a 6 mm hay que comprar por grosor. El "marco de 2,6 mm" de la guía es un solape, no el grosor | [#31](pasacables-goma/README.md) |
| 11 | Cable de 0,75 mm² y 22 AWG: junto a 230 V | Regleta de la fuente: 1 L, 2 N, 3 FG, 4 −V, 5 +V (corrección de Auditor 6.1-S). Falta definir separación y fijación AC/DC; los cables baratos rojo/negro se anuncian sin vaina y a 50 V | [#21](cable-2x0-75-rojo-negro-10m/README.md) |
| 12 | Qué diseño de máquina manda: `decisiones-diseno.md` y la guía (19-20 oct) o `diseno-cajon-A.md` (21-10) | El diseño A quita el pulsador, añade un portafusibles por rama, cambia el Wi-Fi (el Solo se conecta a la Pi) y mueve la fuente y el C14. [MONTAJE-GENERAL, apartado 6.3](../MONTAJE-GENERAL.md) | Varias |
| 13 | Módulo C14: medirlo y decidir, sustituirlo por uno bipolar de esquema documentado, o aceptar el riesgo de un solo polo | El anuncio no da el esquema, sus dos dibujos no coinciden y dos reseñas dicen que están mal. Con un Schuko reversible, un fusible de un solo polo puede quedar en el neutro | [#15](modulo-c14-fusible-interruptor/README.md) |

## 2. Medidas y pruebas por hacer (con la pieza en la mano)

| # | Qué medir | Valor de referencia de la ficha | Ficha |
|---|---|---|---|
| 1 | Continuidad entre el anillo de un agujero de montaje de la Pi y el pin 6 (GND) | Sin documento oficial que lo diga | [#30](separadores-nylon-m2-5/README.md) |
| 2 | Con todo montado, pin 6 de la Pi frente a la caja interior | Debe dar circuito abierto | [#30](separadores-nylon-m2-5/README.md) |
| 3 | Dimensiones y taladros del ZE29A con calibre | El manual no da dibujo ni taladros | [#30](separadores-nylon-m2-5/README.md), [#6](winsen-ze29a/README.md) |
| 4 | Espesor y material de la chapa del cuerpo | Desconocido; de él dependen espárrago y pasacables | [#25](esparragos-soldar-m4x20/README.md), [#31](pasacables-goma/README.md) |
| 5 | Lazo de 10 m del cable de 0,75 mm² (dos conductores unidos, método de cuatro hilos) | 0,46 a 0,52 Ω con cobre; CCA saldría con 0,67 a 0,71 Ω (cálculo de la ficha) | [#21](cable-2x0-75-rojo-negro-10m/README.md) |
| 6 | 1 m de H05VV-F 3G1,5 (cuatro hilos, 2 A) | Máximo 13,3 mΩ a 20 °C; 23 a 27 mV en la medida | [#22](cable-h05vv-f-3g1-5-5m/README.md) |
| 7 | Calibre y material (CCA) de los Dupont de ELEGOO | Ninguna fuente da el calibre; cinco tiendas dicen aluminio cobreado | [#29](cables-dupont-elegoo-120/README.md) |
| 8 | Polaridad, asiento y caída del latiguillo micro-USB; rascado para CCA | Tabla de 10 medidas en la ficha | [#19](latiguillo-micro-usb-22awg/README.md) |
| 9 | Tirón de crimpados de ojal y faston (5 de prueba por herramienta) | Al menos 133 N para 16 AWG | [#23](terminales-ojal-m4/README.md), [#27](kit-faston-aislados/README.md) |
| 10 | Tirón de punteras de 0,75 y 1,5 mm² | 30 N y 40 N como mínimo (IEC 60999-1, según Phoenix) | [#28](crimpadora-y-punteras/README.md) |
| 11 | Longitud de los tornillos y profundidad de los agujeros M3 de la LRS-50-5 | Penetración 3 mm en un lado y 5 mm en el otro; la asignación no está confirmada | [#26](tornilleria-inox-m3-m6/README.md), [#14](meanwell-lrs-50-5/README.md) |
| 12 | Lengüetas del módulo C14 (anchura y grosor) y si el interruptor es bipolar y qué polo lleva el fusible | Sin confirmar tras leer el anuncio el 21-10-2026. Protocolo en la ficha, §4.3 | [#15](modulo-c14-fusible-interruptor/README.md), [#27](kit-faston-aislados/README.md) |
| 13 | Temperatura del separador (junto a la fuente) y de la caja | Sin dato de fabricante; condiciona el material del pasacables y del cable | [#31](pasacables-goma/README.md), [#22](cable-h05vv-f-3g1-5-5m/README.md) |
| 14 | Tensión de salida de la fuente y tensión en los pines de la Pi con carga | Pi: umbral de 4,63 V según comentarios de usuarios (no oficial) | [#14](meanwell-lrs-50-5/README.md), [#19](latiguillo-micro-usb-22awg/README.md) |
| 15 | Continuidad de tierra de cada pieza metálica hasta el borne de entrada | 0,1 Ω máximo con 10 a 25 A | [#25](esparragos-soldar-m4x20/README.md), [#24](arandelas-dentadas-m4/README.md) |
| 16 | Imanes, calibre y marcado de la tornillería inox al recibirla | Protocolo en la ficha | [#26](tornilleria-inox-m3-m6/README.md) |
| 17 | Paso y tipo del conector J1 del ZE29A con calibre; que el pin 1 sea el extremo «5V» y que el TX en reposo dé unos 3,3 V | Serigrafía «Rx Tx GND 5V» en una foto del anuncio | [#6](winsen-ze29a/README.md), [#7](cables-jst-xh-4-pin/README.md) |
| 18 | Cara de los contactos del cable FFC | El anuncio no la dice; hace falta «caras opuestas» | [#4](cable-ffc-camara-50cm/README.md) |
| 19 | Par de faston del pulsador que cierra al pulsar | Sin rótulos; no hay NO, COM ni NC | [#11](pulsador-arcade-30mm/README.md) |
| 20 | Continuidad del borne USB-A: tornillo «+» al pin 1 y «−» al pin 4 | Tornillos S, +, D−, D+ y − (anuncio) | [#18](borne-usb-a-hembra-tornillo/README.md) |

## 3. Cosas que hay que aclarar por escrito o con el fabricante

- SumUp: temperatura de trabajo, carga continua y uso desatendido en la base ([#9](sumup-solo/README.md)).
- Ajuste de tensión de la LRS-50-5 (quizá 5,10 a 5,15 V) y su asignación de tornillos ([#14](meanwell-lrs-50-5/README.md)).
- Conexión a masa del pasante RP-SMA frente a la regla de "no hacer más uniones de masa" ([#13](alargo-antena-rp-sma-30cm/README.md)).
- Si la clavija del ZE29A es JST-XH: el anuncio no da el paso del J1 y la foto sugiere una carcasa de 11 a 12 mm ([#6](winsen-ze29a/README.md), [#7](cables-jst-xh-4-pin/README.md)). Diámetros interior y exterior del tubo de silicona ([#8](tubo-silicona-6mm/README.md)).

## 4. Documentos que aún no están en el repositorio

El 21-10-2026 se subieron 144 documentos descargados por ti (carpeta `datasheets/` de cada ficha y [`documentos-compartidos/`](documentos-compartidos/README.md) para los que citan varias fichas). Los PDF del Camera Module 3 (RP-008151, RP-008153, RP-008969, RP-008146, avisos PCN 42 y 43, STEP y BOM) ya están en [`raspberry-pi-camera-module-3/datasheets/`](raspberry-pi-camera-module-3/datasheets/).

- En cada `enlaces.md`, un enlace a PDF que **no** lleva la etiqueta "copia local" sigue sin estar descargado. Son unas 300 líneas de enlace en total, con espejos y versiones repetidas del mismo documento, así que el número de documentos distintos es menor.
- Las copias locales no se han leído enteras: se comprobó que abren, su tipo y su primera página. Los números de las fichas que salieron de resúmenes de terceros (no del PDF) siguen sin verificar contra la copia local salvo que la ficha diga "verificado con copia local".
- Algunos de los documentos subidos son vistas previas o extractos de normas de pago (IEC 60320-1, IEC 60335-2-82, HD 308 S2) o documentos con derechos de terceros (zips de USB-IF, informes de ensayo). El repositorio es público: conviene decidir si se dejan o se quitan y se queda solo el enlace.

## 5. Cerrado el 21-10-2026 con los anuncios de Amazon.es

Leídos en el navegador integrado. Cada dato lleva su origen en [`montaje-general/anuncios-amazon-21-10-2026.md`](../montaje-general/anuncios-amazon-21-10-2026.md).

- **Pulsador (#11):** no tiene NO, COM ni NC. Son 4 faston de 2,8 mm, dos del interruptor y dos del LED. Queda por medir cuál es cuál.
- **USB-C del Solo (#9):** está en el canto de abajo (foto). Queda sin medir la distancia a la esquina y el tamaño de la ranura.
- **Borne USB-A (#18):** tornillos S, +, D−, D+ y −. La corriente máxima no consta.
- **Pantalla (#5):** un solo USB-C «Power IN» y un HDMI de tamaño completo, en el mismo canto. El cable «USB to USB-C» no dice si es A o C en el extremo grande.
- **Clavija XH (#7), cable FFC (#4), latiguillo (#19) y cable acodado (#10):** contenido y medidas anunciados. Siguen abiertos el color por posición, la cara de los contactos, la polaridad y la punta acodada.
- **C14 (#15):** **no** se cierra. El anuncio no da el esquema interno y sus dos dibujos no coinciden.
