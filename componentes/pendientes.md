# Pendientes que salen de las fichas de componentes

Resumen de lo que las 31 fichas dejan abierto: decisiones tuyas, medidas que hay que tomar con calibre o polímetro, y documentos que faltan. Cada punto remite a la ficha donde está el detalle y la fuente. Esta lista se ha reunido el 21-10-2026 a partir de las fichas; si una ficha cambia, manda la ficha.

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
| 11 | Cable de 0,75 mm² y 22 AWG: junto a 230 V | En la regleta de la fuente el +V queda junto a FG y FG junto a L; los cables baratos rojo/negro se anuncian sin vaina y a 50 V | [#21](cable-2x0-75-rojo-negro-10m/README.md) |

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
| 12 | Lengüetas del módulo C14 (anchura y grosor) y si el interruptor es bipolar y qué polo lleva el fusible | Sin confirmar | [#15](modulo-c14-fusible-interruptor/README.md), [#27](kit-faston-aislados/README.md) |
| 13 | Temperatura del separador (junto a la fuente) y de la caja | Sin dato de fabricante; condiciona el material del pasacables y del cable | [#31](pasacables-goma/README.md), [#22](cable-h05vv-f-3g1-5-5m/README.md) |
| 14 | Tensión de salida de la fuente y tensión en los pines de la Pi con carga | Pi: umbral de 4,63 V según comentarios de usuarios (no oficial) | [#14](meanwell-lrs-50-5/README.md), [#19](latiguillo-micro-usb-22awg/README.md) |
| 15 | Continuidad de tierra de cada pieza metálica hasta el borne de entrada | 0,1 Ω máximo con 10 a 25 A | [#25](esparragos-soldar-m4x20/README.md), [#24](arandelas-dentadas-m4/README.md) |
| 16 | Imanes, calibre y marcado de la tornillería inox al recibirla | Protocolo en la ficha | [#26](tornilleria-inox-m3-m6/README.md) |

## 3. Cosas que hay que aclarar por escrito o con el fabricante

- SumUp: temperatura de trabajo, carga continua y uso desatendido en la base ([#9](sumup-solo/README.md)).
- Ajuste de tensión de la LRS-50-5 (quizá 5,10 a 5,15 V) y su asignación de tornillos ([#14](meanwell-lrs-50-5/README.md)).
- Conexión a masa del pasante RP-SMA frente a la regla de "no hacer más uniones de masa" ([#13](alargo-antena-rp-sma-30cm/README.md)).
- Si la clavija del ZE29A es JST-XH ([#6](winsen-ze29a/README.md), [#7](cables-jst-xh-4-pin/README.md)) y diámetros interior y exterior del tubo de silicona ([#8](tubo-silicona-6mm/README.md)).

## 4. Documentos que aún no están en el repositorio

- Camera Module 3: faltan por descargar RP-008151-DS-1, RP-008153-DS-1 (dibujo mecánico, necesario para las cotas del agujero de Ø10 mm del objetivo), RP-008969-SD-3, RP-008146-DS-1, los avisos PCN 42/43, el STEP y el BOM. Los enlaces están en [`raspberry-pi-camera-module-3/enlaces.md`](raspberry-pi-camera-module-3/enlaces.md).
- En el resto de fichas los PDF están enlazados pero no descargados en el repositorio. Solo la Pi y la SanDisk tienen carpeta `datasheets/`.
