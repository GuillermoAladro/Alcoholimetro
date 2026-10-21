# Separadores hexagonales de nailon M2,5 (kit de 350 piezas)

Kit de separadores (columnas) hexagonales de nailon con tornillos y tuercas M2,5. En el proyecto fijan la Raspberry Pi 3B+ en vertical sobre la pared trasera de la caja interior suspendida y, si se puede, el módulo del sensor ZE29A. Al ser de plástico, mantienen la placa separada de la chapa (que va a tierra).

- **Dónde va (según la guía de montaje, §1 fila 30 y §4):** caja interior suspendida de muelles (167 × 63,5 × 118 mm), Pi en vertical sobre la pared trasera, "con separadores M2.5", y ZE29A. La guía dice "para la Pi y el sensor".
- **Compra:** ASIN B0G4G7WQRM, 9,99 € (precio de la hoja de componentes del 19-20-10-2026). Son 0,0285 € por pieza (cálculo mío).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta, así que no he podido ver el anuncio: el precio y la referencia son los de tu hoja. Una búsqueda por el ASIN no devolvió el anuncio. **Marca, vendedor, material exacto (PA6 o PA66), color, qué longitudes trae el kit y cuántas piezas de cada tipo son desconocidos.**

Es una pieza genérica y casi no hay ficha del fabricante que leer. Esta ficha reúne tres cosas: lo que pide la Pi (planos oficiales), lo que se sabe del nailon (hojas de datos de BASF, Ensinger, Würth y Essentra) y lo que hay que medir al recibir el kit.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Uso en el proyecto](#4-uso-en-el-proyecto)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Qué comprobar al recibirlo (calibre y tornillo de prueba)](#6-qué-comprobar-al-recibirlo-calibre-y-tornillo-de-prueba)
7. [Alternativas](#7-alternativas)
8. [Recomendaciones para el alcoholímetro](#8-recomendaciones-para-el-alcoholímetro)
9. [Lo que no he podido verificar](#9-lo-que-no-he-podido-verificar)
10. [Fuentes](#10-fuentes)

---

## 1. Resumen para el proyecto

- **La geometría de la Pi cuadra con M2,5.** Cuatro agujeros de Ø2,75 mm, separados 58 × 49 mm y a 3,5 mm de los bordes (plano oficial RP-008337-DS-2 y DXF RP-008336-DS-1, leídos en local). Un tornillo M2,5 pasa con 0,25 mm de holgura en diámetro. **El plano acota un círculo de Ø6 mm alrededor de cada agujero, no de 6,2 mm**: el 6,2 no aparece en ningún documento que haya podido abrir (ver 2.2 y 4.5).
- **No he podido verificar que los agujeros de la Pi vayan a masa (GND).** Los documentos oficiales abiertos no lo dicen. Se comprueba en diez segundos con un polímetro, con la Pi sin alimentar (sección 4.2). Mientras no se sepa, hay que **tratarlos como GND**: la caja interior va a tierra de protección (guía §5.1), y la guía §5.2 dice "no hagas más uniones de masa".
- **El nailon solo aísla si no hay metal que puentee.** En un separador hembra-hembra corto, dos tornillos metálicos enfrentados (uno por la placa, otro por la chapa) pueden tocarse dentro (cálculo mío, sección 4.2). Con tornillos de nailon, o con separador macho-hembra y la espiga por la chapa, no hay camino metálico.
- **El nailon pierde rigidez y se relaja con la humedad y el tiempo.** En una hoja de BASF para PA66 sin refuerzo, el módulo pasa de 3.000 MPa (seco) a 1.100 MPa (acondicionado) y el límite elástico de 85 a 50 MPa. A 1.000 h bajo carga la rigidez efectiva es de unos 700 MPa. Un tornillo de nailon apretado pierde apriete con los meses (sección 5.2). El uso continuo a 40-50 °C está dentro de lo que dan las fuentes (de 85 a 110 °C según la fuente), pero no se sabe qué grado lleva tu kit.
- **Las roscas de nailon se pasan de rosca.** La norma DIN 34810 da 0,1 N·m para un M3 de PA66 y no cubre el M2,5; extrapolado, son unos 0,06 N·m (cálculo mío): **apretar casi a mano**. No uses fijador de roscas: Henkel dice que no es para plásticos termoplásticos.
- **El ZE29A no tiene taladros publicados.** El manual de Winsen no da dibujo ni agujeros; solo pide fijar el sensor a la estructura y evitar golpes y vibraciones excesivos. Este kit sirve para el sensor **solo si** el módulo lleva agujeros que admitan M2,5, y eso hay que medirlo con calibre (sección 4.4).
- **Con un kit de 350 piezas por 9,99 € hay que medir el lote.** Los kits parecidos que he visto traen entre una cuarta y una tercera parte de separadores (el resto son tornillos y tuercas). Qué longitudes trae el tuyo no se sabe (sección 2.3).

## 2. Especificaciones

### 2.1 Lo que se sabe del kit

| Característica | Valor | Fuente |
|---|---|---|
| Referencia | ASIN B0G4G7WQRM, 9,99 € | Hoja del usuario / guía de montaje, fila 30 |
| Contenido | 350 uds.: separadores hexagonales M2,5 de nailon, con tornillos y tuercas | Hoja del usuario |
| Precio por pieza | 0,0285 € | Cálculo mío (9,99 / 350) |
| Uso | La Pi y el sensor | Guía de montaje, §1 fila 30 |
| Marca, vendedor, país de origen | **Sin verificar** | Amazon bloquea el acceso |
| Material (PA6 o PA66), color, UL 94, temperatura de uso | **Sin verificar** | El anuncio no se ve |
| Longitudes y cantidad de cada una, tipos (macho-hembra o hembra-hembra), tamaño de la llave | **Sin verificar** | El anuncio no se ve |

### 2.2 Lo que pide la Raspberry Pi 3B+

Fuente: [plano mecánico RP-008337-DS-2](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf) (PDF, copia local en [`../raspberry-pi-3b-plus/datasheets/`](../raspberry-pi-3b-plus/datasheets/)) y [DXF RP-008336-DS-1](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008336-DS-1-raspberry-pi-3-b-plus-mechanical-drawing.dxf). Leí el PDF rasterizado (no tiene capa de texto) y analicé el DXF con un script.

| Característica | Valor | Notas |
|---|---|---|
| Tamaño de la placa | 85 × 56 mm, radio de esquina 3,0 mm | Plano |
| Agujeros de montaje | 4 × **Ø2,75 mm** | Plano. Una web de CAD da 2,7 mm ([Kapy](https://kapycad.com/en/academy/standards/raspberry-pi)); manda el plano |
| Separación entre agujeros | **58 × 49 mm** | Plano |
| Posición | A 3,5 mm de los bordes. Centros en (3,5; 3,5), (61,5; 3,5), (3,5; 52,5) y (61,5; 52,5) mm, con origen en la esquina inferior izquierda del dibujo | Plano y DXF (el DXF marca cada centro con un círculo de radio 0,25 mm en las capas PINS_TOP y PINS_BOTTOM; no da diámetro) |
| Círculo exterior alrededor de cada agujero | **Ø6 mm** | Plano (cota "6"). **No dice si es cobre, zona de exclusión o ambas.** El 6,2 mm de otros documentos no está en este plano |
| Altura de los conectores sobre la placa ("Z-Height") | Cabecera GPIO 8,5 mm; USB 16,0 mm; Ethernet 13,5 mm; HDMI 6,5 mm; audio 6 mm; CSI y DSI 5,5 mm | Plano. El plano no dice desde dónde se mide; **lo leo como desde la cara superior del PCB (interpretación mía)** |
| Cara inferior | **El plano no da alturas.** El DXF sí da la huella (XY): la ranura de la microSD (de 1,7 a 13,1 mm en X, de 22,1 a 34,1 en Y) y un rectángulo de 11 mm de ancho que sale 2,3 mm por el borde izquierdo (lo leo como la tarjeta insertada, interpretación mía), más un bloque de unos 12 × 12 mm hacia el centro | DXF, capa PARTS_BOTTOM |
| Componentes más cercanos a cada agujero (cara superior) | Agujero inferior izquierdo: el micro-USB de alimentación, a 3,35 mm del centro. Los otros tres: entre 3,5 y 3,6 mm (la cabecera GPIO en los dos de arriba y un componente pequeño en el inferior derecho) | Cálculo mío sobre el DXF (distancia del centro del agujero al contorno más cercano, sin contar los arcos) |
| Cara inferior, componentes cerca de los agujeros | A más de 4,3 mm del centro de cada agujero | Cálculo mío sobre el DXF |

Del tamaño de las cabezas y las llaves hexagonales que caben (cálculo mío con los datos anteriores):

| Pieza | Medida | Qué pasa |
|---|---|---|
| Hexágono de 5 mm entre caras (el de Würth, ver 2.3) | 5,77 mm entre esquinas | Cabe en el círculo de Ø6 |
| Hexágono de 6 mm entre caras | 6,93 mm entre esquinas | Si va en la cara superior, su esquina choca con el micro-USB en el agujero inferior izquierdo (3,35 mm). En la cara inferior no hay problema (componentes a más de 4,3 mm) |
| Cabeza de tornillo (cara superior) | Ø ≤ 6 mm | Cabe en el círculo Ø6 y deja 0,35 mm hasta el micro-USB en el agujero inferior izquierdo. Lo que se vea en el kit hay que medirlo |

### 2.3 Lo que dicen otros kits y fabricantes de separadores de nailon

El anuncio no se ve, así que estas filas no son datos de tu kit: son ejemplos de lo que se encuentra. Cada línea es de un producto distinto.

| Producto | Material | Llave / rosca | Inflamabilidad | Temperatura | Fuente |
|---|---|---|---|---|---|
| Würth WA-SPAIE 971060155 (M-H, cuerpo 6 mm) | Poliamida (no dice PA6 o PA66), negro | Llave 5; rosca M2,5; rosca interior de 4 mm y espiga de 8 mm | UL 94 HB | De −30 a +110 °C | [Hoja](https://docs.rs-online.com/57e3/0900766b816cd289.pdf) ([copia local](datasheets/0900766b816cd289.pdf)) |
| Würth WA-SPAIE 971200155 (cuerpo 20 mm) | Poliamida, negro | Llave 5; rosca interior de 10 mm y espiga de 8 mm | UL 94 HB | De −30 a +110 °C en la hoja; **de −55 a +150 °C en el listado de RS** | [Hoja](https://docs.rs-online.com/bd08/A700000007100033.pdf), [listado RS](https://uk.rs-online.com/web/p/standoffs/2052936/) |
| Essentra, separadores hexagonales aislantes | "Nylon 6", natural; también "Nylon 6 con latón" | Llave de 6,0 a 12,7 mm; rosca M2,5 a M6; longitudes de 8 a 55 mm | UL 94 V-2 | De −40 a 105 °C (solo en algunas variantes) | [Essentra](https://www.essentracomponents.com/en-gb/p/hexagonal-insulation-standoffs) |
| Essentra 36F / CBMFTS / NTS (con cinta adhesiva) | Nailon 6/6 | M-H; sin medidas en la página | UL 94 V-2 | De −40 a +85 °C | [Mouser](https://www.mouser.hk/new/essentra/essentra-36f-cbmfts-nts-hexagonal-standoffs) |
| Adafruit 3299 (kit de 380 piezas, M2,5) | Nailon negro | Separadores de 6, 8, 10 y 12 mm (M-H y H-H); tornillos de 4, 6 y 10 mm; 80 tuercas | No lo dice | No lo dice | [Copia en chipdip](https://static.chipdip.ru/lib/359/DOC011359023.pdf) |
| Kit M2,5 de 240 piezas (grosshoeflein.at) | Nailon | M-H de 6 a 25 mm (8 longitudes, 10 de cada); 80 tornillos M2,5 × 6; 80 tuercas | No lo dice | No lo dice | [Tienda](https://www.grosshoeflein.at/products/m25-nylon-hex-m-f-spacerscrewnut-assorted-kit-for-raspberry/221115198/) |
| Multicomp RPI-NYLON-STANDOFF-KIT (Farnell 2543622) | Nailon | 8 × M12.5-5N y 4 × HPS2.5-11; sin longitudes en la página | No lo dice | No lo dice | [Farnell](https://ie.farnell.com/multicomp/rpi-nylon-standoff-kit/threaded-standoffs-kit-raspberry/dp/2543622) |

- **Los kits con tornillos y tuercas tienen pocos separadores.** En el kit de Adafruit son 100 separadores de 380 piezas (cuenta mía a partir de su lista). En el de 240 piezas son 80. Un kit de 350 piezas puede traer del orden de un centenar de separadores (extrapolación mía; **el reparto del tuyo es desconocido**).
- **Las longitudes habituales son de 6 a 12 mm** en los kits de Adafruit y de The Pi Hut (6, 8, 10, 12 y 20 mm, [The Pi Hut](https://thepihut.com/products/m2-5-nylon-standoff-packs)); el de 240 piezas llega hasta 25 mm.
- **Los fabricantes no coinciden** ni en la inflamabilidad (HB o V-2) ni en el rango de temperatura (de 85 a 110 °C). El material del tuyo es desconocido.

### 2.4 El material: nailon 6/6 (PA66), de las hojas de datos

Ninguna de estas hojas es de tu kit. Sirven para saber **qué esperar** de un PA66 sin refuerzo. La que más importa es la de BASF, porque trae valores secos y acondicionados. Mis herramientas web resumen los PDF; no he descargado ninguno.

| Propiedad | Valor | Fuente |
|---|---|---|
| Módulo de tracción | 3.000 MPa en seco y 1.100 MPa acondicionado ("cond.") | [BASF Ultramid A3K](https://download.basf.com/p1/8a8082587fd4b608017fd64108ab6d3b/en/ULTRAMID_A3K_Product_Data_Sheet_Asia_PacificEurope_English.pdf) (la hoja no define "cond.") |
| Límite elástico | 85 MPa en seco y 50 MPa acondicionado | BASF A3K |
| Módulo de fluencia a 1.000 h | 700 MPa (deformación ≤ 0,5 %, 23 °C, acondicionado) | BASF A3K |
| Humedad absorbida en equilibrio | De 2,5 a 3,1 % a 23 °C y 50 % de humedad relativa; de 8 a 9 % de saturación en agua | BASF A3K |
| Saturación en agua | 8,5 % | Ensinger TECAMID 66 ([EE. UU.](https://www.polymershapes.com/wp-content/uploads/2020/04/Polymershapes_Ensigner_DataSheet-TECAMID-66-natural.pdf) ([copia local](datasheets/Polymershapes_Ensigner_DataSheet-TECAMID-66-natural.pdf))) |
| Temperatura de transición vítrea (Tg) | 47 °C | Ensinger TECAMID 66 ([UE](https://www.ensingerplastics.com/en/shapes/pa66-tecamid-66-natural)). No dice en qué estado de humedad |
| Fusión | 260 °C (BASF) y 258 °C (Ensinger); la Wikipedia da 265 °C para PA66 y 220 °C para PA6 | BASF A3K, Ensinger UE, [Wikipedia](https://en.wikipedia.org/wiki/Nylon) |
| Temperatura de uso continuo | **85 °C** (hoja de Ensinger de EE. UU.) y **100 °C** (hoja de Ensinger de la UE); corto plazo 149 °C y 170 °C | Ensinger, las dos hojas |
| Dilatación térmica | 11 × 10⁻⁵ 1/K (de 23 a 60 °C) | Ensinger UE |
| Inflamabilidad UL 94 | **HB** en la hoja de la UE de Ensinger; **V-2** en la de EE. UU. de Ensinger. BASF no da UL 94 para A3K (da ISO 3795 y FMVSS 302) | Ensinger UE, Ensinger EE. UU., BASF A3K |
| Resistividad volumétrica | 10¹³ Ω·m en seco y 10¹⁰ Ω·m acondicionado | BASF A3K |
| Índice de seguimiento (CTI) | 600 | BASF A3K |
| Rigidez dieléctrica | **No la da ninguna de las hojas que he abierto** | — |
| Cambio de dimensiones con la humedad | **No lo cuantifica ninguna hoja abierta.** Ensinger avisa de que la tendencia a absorber humedad puede afectar a la estabilidad dimensional. Un blog de un vendedor da de 0,3 a 0,5 %, sin referencias | Ensinger UE, [industrialmonitordirect](https://industrialmonitordirect.com/blogs/knowledgebase/troubleshooting-self-loosening-fasteners-in-nylon-enclosures) |

La Wikipedia dice lo esencial del efecto de la humedad: el nailon absorbe o suelta agua según la humedad ambiente, cambia de dimensiones y el agua actúa de plastificante, de modo que baja la Tg y la rigidez ([Wikipedia](https://en.wikipedia.org/wiki/Nylon)). Seco es buen aislante eléctrico, y la humedad cambia esa propiedad.

## 3. Documentos oficiales

No hay hoja de datos de tu kit. Estos son los documentos que aplican: los de la Pi (que dan la geometría) y las hojas del material y de otros separadores (que dan lo que se puede esperar).

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Plano mecánico de la Pi 3B+ | RP-008337-DS-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf) |
| Plano mecánico de la Pi 3B+ (CAD) | RP-008336-DS-1 | DXF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008336-DS-1-raspberry-pi-3-b-plus-mechanical-drawing.dxf) |
| Esquema reducido de la Pi 3B+ | RP-008339-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) |
| Product brief de la Pi 3B+ | RP-008338-DS-2 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) |
| Especificación HAT+ | RP-008281-DS-1 | PDF | [descargar](https://pip-assets.raspberrypi.com/categories/1215-raspberry-pi-hat/documents/RP-008281-DS-1-hat-plus-specification.pdf) ([copia local](datasheets/RP-008281-DS-1-hat-plus-specification.pdf)) |
| Especificación mecánica HAT (repositorio `raspberrypi/hats`) | `hat-board-mechanical.pdf` | PDF | [ver en GitHub](https://github.com/raspberrypi/hats/blob/master/hat-board-mechanical.pdf) (**no abierto**: GitHub rechazó la herramienta) |
| Hoja de datos BASF Ultramid A3K (PA66 sin refuerzo) | Sin referencia | PDF | [descargar](https://download.basf.com/p1/8a8082587fd4b608017fd64108ab6d3b/en/ULTRAMID_A3K_Product_Data_Sheet_Asia_PacificEurope_English.pdf) |
| Ensinger TECAMID 66 natural (UE) | Sin referencia | Web | [ver](https://www.ensingerplastics.com/en/shapes/pa66-tecamid-66-natural) |
| Ensinger TECAMID 66 natural (EE. UU., versión A1, 12-02-2019) | Sin referencia | PDF | [descargar](https://www.polymershapes.com/wp-content/uploads/2020/04/Polymershapes_Ensigner_DataSheet-TECAMID-66-natural.pdf) ([copia local](datasheets/Polymershapes_Ensigner_DataSheet-TECAMID-66-natural.pdf)) |
| Würth Elektronik WA-SPAIE 971060155 (separador M-H de 6 mm) | Rev. 001.002, 10-01-2019 | PDF | [descargar](https://docs.rs-online.com/57e3/0900766b816cd289.pdf) ([copia local](datasheets/0900766b816cd289.pdf)) |
| Würth Elektronik WA-SPAIE 971200155 (separador M-H de 20 mm) | Sin referencia | PDF | [descargar](https://docs.rs-online.com/bd08/A700000007100033.pdf) |
| Henkel Loctite Threadlocker Blue 242 | Revisión 5-10-2024 | PDF | [descargar](https://datasheets.tdx.henkel.com/LOCTITE-THREADLOCKER-BLUE-242-en_US.pdf) ([copia local](datasheets/LOCTITE-THREADLOCKER-BLUE-242-en_US.pdf)) |
| DIN 34810 (tornillos de plástico, M3 a M10) | DIN 34810:2018-04 | Norma de pago (solo leí un resumen web) | [resumen en fasten.it](https://fasten.it/en/norms/norm/din_34810) |
| Manual del Winsen ZE29A | V1.1 | PDF | [descargar](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf) ([copia local](../winsen-ze29a/datasheets/ze29a-c2h5oh.pdf)) |

### Qué dicen los más relevantes

**Plano mecánico de la Pi (RP-008337-DS-2)**

- Cuatro agujeros de Ø2,75 mm a 58 × 49 mm y a 3,5 mm de los bordes; cada uno dentro de un círculo acotado como Ø6 mm.
- Alturas de los conectores sobre la placa: GPIO 8,5, USB 16,0, Ethernet 13,5, HDMI 6,5, audio 6 y CSI/DSI 5,5 mm.
- No da alturas de la cara inferior, ni espesor del PCB, ni dice qué es el círculo de Ø6.

**HAT+ (RP-008281-DS-1)**

- Su texto no da cotas de agujeros ni de zonas de exclusión (tampoco 6,2 mm): remite a "los dibujos mecánicos".
- Pide, para la placa HAT+ apilada, separadores de al menos 15 mm (16 mm ideales), para dejar sitio al ventilador activo. No aplica aquí: el proyecto no apila ninguna placa sobre la Pi.
- Si el 6,2 mm sale de alguna parte, será de la especificación HAT clásica (`hat-board-mechanical.pdf`); esa no la pude abrir.

**BASF Ultramid A3K**

- La mayor parte de las cifras de la sección 2.4. Lo más útil: la rigidez y el límite elástico bajan a la mitad o menos con la humedad, y la rigidez en fluencia a 1.000 h es de 700 MPa. No da UL 94 ni rigidez dieléctrica.

**Würth WA-SPAIE**

- Material "poliamida" sin más, negro, UL 94 HB, de −30 a +110 °C, MSL 1 (no sensible a la humedad para soldadura), almacenar por debajo de 40 °C y 75 % de humedad relativa, tolerancia general DIN ISO 2768-1 clase m.
- Aviso de Würth: **no autorizado para equipos de alta seguridad o fiabilidad especial** (médico, automoción, aeroespacial y similares). Un alcoholímetro de pago no es ninguno de esos, pero conviene saberlo.
- No da pares de apriete.

**Loctite 242**

- "Not for use on plastic parts, particularly thermoplastic materials where stress cracking of the plastic could result." Es la hoja de un producto concreto (el 242); otros grados pueden decir otra cosa, pero el nailon es un termoplástico.

**Manual del ZE29A**

- Tamaño 85 × 33 × 18 mm, sin dibujo ni agujeros de montaje, y con una nota que dice que el aspecto y los tamaños dependen del producto físico.
- Pide fijar el módulo a la estructura para que no se afloje tras un uso prolongado, y no someterlo a golpes ni vibraciones excesivos.

## 4. Uso en el proyecto

### 4.1 Pi: tornillería y alturas

Datos del plano (sección 2.2). Todo lo marcado como "mío" es una deducción.

**Tornillos y separadores**

- **Rosca:** M2,5, paso 0,45 mm ([Wikipedia, ISO 262](https://en.wikipedia.org/wiki/ISO_metric_screw_thread)). Un diámetro menor de unos 2,01 mm (cálculo mío con la fórmula del mismo artículo). Es la medida que usan los separadores específicos para Pi: [Pololu](https://www.pololu.com/product/1952) dice que M2,5 coincide con los agujeros de la Pi y [The Pi Hut](https://thepihut.com/products/m2-5-nylon-standoff-packs) la llama la rosca recomendada.
- **Diámetro de agujero 2,75 mm frente a tornillo de 2,5 mm:** holgura de 0,125 mm por lado (cálculo mío). La placa puede moverse una décima de milímetro; los separadores la alinean.
- **Cabeza del tornillo:** como máximo Ø6 mm, para no pisar nada fuera del círculo acotado. Mide la del kit con calibre.
- **Llave del separador:** de 5 mm entre caras cabe en cualquiera de los agujeros, en las dos caras. Una de 6 mm solo cabe en la cara inferior (sección 2.2).
- **Largo del tornillo:** el plano no da el espesor de la placa. El largo útil del tornillo es el espesor de la placa más la rosca interior del separador, menos un margen; en el separador de 6 mm de Würth la rosca interior es de 4 mm. Si el tornillo toca fondo antes de apretar, la placa queda floja. Mídelo con tu kit.

**Altura de la columna**

- **Montaje previsto (componentes hacia fuera, cara inferior contra la pared):** la cabecera GPIO (8,5 mm) y el HDMI (6,5 mm) están en la cara superior y **no condicionan la altura**. La altura la fija la cara inferior: las soldaduras de las patillas y la ranura de la microSD con su tarjeta. **El plano no da la altura de nada de lo que hay debajo.** Mídela con la Pi en la mano: apoyada sobre una superficie plana, la separación entre la superficie y el PCB bajo los puntos más bajos. Esa medida más un margen es la altura mínima de la columna.
- **El HDMI** (eje a 32 mm del borde izquierdo, según la cota del plano) sale por el borde largo inferior: pide hueco para el enchufe, no altura de columna.
- **Si la placa se montara al revés (cara superior contra la pared):** la columna tendría que superar los 8,5 mm de la cabecera, y los 16 mm del USB si esa zona se apoyara. Con la guía no es el caso.
- **La microSD sale 2,3 mm por el borde izquierdo** (DXF, cara inferior). Para sacarla hace falta que ese borde quede accesible y que la columna deje sitio para el dedo o la pinza. Es mi lectura del dibujo.
- **Orden de magnitud de la profundidad (cálculo mío, sin medir):** columna + espesor del PCB + 16 mm del USB. Con columna de 6 mm son 22 mm más el PCB; con 10 mm, 26 mm más el PCB. La caja interior tiene 63,5 mm en esa dirección (guía). Los cables Dupont de los pines 8, 9, 10 y 11 y el cable HDMI también necesitan sitio por encima de la cabecera: hay que medirlo con los cables puestos.
- **Qué borde necesita sitio libre** (posiciones del DXF y del plano): HDMI, micro-USB de alimentación y audio salen por el borde largo inferior; los dos USB y el Ethernet, por el borde corto derecho; la microSD, por el izquierdo; la cabecera GPIO va junto al borde largo superior; CSI y DSI están en medio de la placa. Decide la orientación con estas cuatro caras.

**Rigidez de la placa**

- Los agujeros están en una zona de 58 × 49 mm y la placa mide 85 × 56 mm: **del lado derecho (USB y Ethernet) la placa sobresale 23,5 mm de los agujeros** (cálculo mío con el plano). Ahí se enchufan el adaptador Wi-Fi y los demás USB: cada inserción o extracción empuja en un voladizo (fuerza sin cuantificar). Con las cuatro columnas iguales y bien apretadas la placa no flexiona; con una más corta o floja, sí.
- Raspberry Pi advirtió en 2012, para la Model B rev. 2, de que apretar demasiado los tornillos puede aplastar la placa ([Raspberry Pi, 2012](https://www.raspberrypi.com/news/raspberry-pi-rev2-template-with-mounting-holes/)). Vale para cualquier tornillo; con nailon es más difícil que ocurra, pero el apriete a mano sigue siendo la regla (deducción mía).
- Un comentario de lector en ese artículo sugiere columnas de nailon o con muelle y arandelas de goma (opinión de un lector, no de Raspberry Pi).

### 4.2 ¿Los agujeros de la Pi van a masa? (sin verificar)

Es lo importante de esta pieza. **No he podido verificarlo en ningún documento.**

| Qué miré | Resultado |
|---|---|
| Plano mecánico RP-008337-DS-2 | Dibuja Ø2,75 y un círculo de Ø6 por agujero. No dice qué es el círculo |
| DXF RP-008336-DS-1 | Marca cada centro con un círculo de radio 0,25 mm en las capas PINS_TOP y PINS_BOTTOM. Sin diámetro y sin nombre de red |
| Esquema reducido RP-008339-DS-1 (texto extraído con `pdftotext`) | Una sola hoja (alimentación y relojes). Busqué "mount", "hole", "chassis" y "screw": sin resultados. Es un esquema reducido, así que su silencio no prueba nada |
| Product brief RP-008338-DS-2 | Sin referencia a agujeros ni masa de chasis |
| Especificación HAT+ RP-008281-DS-1 | No lo dice en el texto |
| Especificación HAT clásica (GitHub) | **No abierta**: GitHub rechazó la herramienta |
| [RS DesignSpark, febrero de 2021](https://www.rs-online.com/designspark/what-outputs-can-i-use-with-my-raspberry-pi-part-4-protecting-your-pi) | Lista lo que va a masa en la Pi (carcasas USB y Ethernet, pines GND de la cabecera, 0 V de la entrada de alimentación, masa de audio, carcasa y masa del HDMI, y masas de los conectores de cámara y pantalla). **No nombra los agujeros** |
| Foros de Raspberry Pi (varios hilos) | **No pude abrirlos** (error de la herramienta) |
| [Altium](https://resources.altium.com/p/pcb-grounding-techniques-for-plated-pcb-mounting-holes) (genérico, no es de la Pi) | Es práctica habitual que los agujeros metalizados se unan a una red de masa. Si un tornillo metálico los une a un chasis, el chasis puede cerrar lazos de masa de continua y meter ruido en modo común |

**Qué se puede decir:** que el plano dibuja un círculo de Ø6 alrededor de cada agujero es un dato; que sea cobre conectado a GND, **no lo he comprobado**. La práctica de diseño habitual (Altium, genérico) es unir los agujeros metalizados a una red de masa. No es una prueba, pero por prudencia los trato como si lo estuvieran.

**Cómo comprobarlo (diez segundos):** con la Pi sin alimentar y desenchufada, polímetro en continuidad (o en ohmios). Una punta en el anillo del agujero (si está cubierto de barniz, en el borde metalizado del agujero; cara superior y luego inferior), la otra en el pin 6 de la cabecera (GND). Repite en los cuatro agujeros. Con continuidad (pocos ohmios), están a GND. Anota el resultado en la ficha de la Pi.

**Por qué importa aquí (guía §5.1 y §5.2):**

- La caja interior va a tierra de protección con un cable verde-amarillo (guía §5.1: "Los muelles no sirven de tierra"). Una columna **metálica** entre un agujero a GND y esa caja uniría el 0 V de la fuente con la tierra de protección.
- La guía §5.2 dice: "No hagas más uniones de masa". El −V de la fuente es la masa común. La hoja de la LRS-50-5 da 1,25 kVAC de ensayo y 100 MΩ a 500 VDC entre salida y FG ([ficha de la Mean Well](../meanwell-lrs-50-5/README.md)): la salida está aislada de la tierra y, salvo que alguien la una, **flota** (deducción mía).
- Un circuito SELV (muy baja tensión de seguridad) no tiene conexión a tierra; uno que sí la tiene es PELV ([Wikipedia, Extra-low voltage](https://en.wikipedia.org/wiki/Extra-low_voltage), que cita IEC 61140). **Unir −V a la tierra por accidente cambia el tipo de circuito** y puede cerrar lazos de masa (Altium). Si el proyecto quiere unir −V a tierra a propósito (por ejemplo, por inmunidad a descargas; la ficha de la Mean Well dice que esa decisión no está investigada), que sea una decisión deliberada en un solo punto, no el efecto de unos tornillos.
- Es un asunto de clasificación del circuito, interferencias y lazos de masa, no de potencia: son 5 V.
- **Otros caminos a masa** no quedan cubiertos por estos separadores: la carcasa metálica del conector USB del adaptador Wi-Fi, la del HDMI y las de la pantalla, si tocan chapa. Una línea para otras fichas.

**Cuándo el nailon aísla de verdad (cálculo mío):**

- **Separador macho-hembra con la espiga por la chapa:** la espiga pasa por un agujero de la chapa y se asegura con una tuerca por detrás. Por el lado de la placa entra un tornillo, que puede ser metálico: su cabeza toca el anillo de la Pi (que va a GND, si lo está) y su caña queda dentro del nailon, siempre que sea más corta que la rosca interior. No hay camino metálico a la chapa.
- **Separador hembra-hembra con dos tornillos metálicos:** uno por el lado de la placa y otro por el de la chapa. En un separador corto los dos tornillos se tocan dentro. Ejemplo (supuestos míos: placa de 1,4 mm, que el plano no da, y chapa de 2 mm; el espesor de la pared trasera de la caja interior no lo sé, y el marco del Solo es de 2,6 mm): con tornillos de 6 mm entran 4,6 mm por el lado de la placa y 4 mm por el de la chapa, 8,6 mm en un separador de 6 mm. Se tocan. Mide el tuyo.
- **Tornillos de nailon en los dos extremos:** no hay metal, pero son los más frágiles (sección 5.3).

**Prueba con todo montado (propuesta mía):** con la máquina desenchufada, polímetro en ohmios entre el pin 6 de la Pi (GND) y la caja interior. Debe dar circuito abierto o varios megaohmios. Si da continuidad, hay un camino metálico (un tornillo, la pantalla, un conector). Es una prueba rápida y sirve también para las máquinas en serie.

**Distancia entre las soldaduras de 5 V y la chapa:** no he encontrado ninguna norma abierta que fije una distancia entre pistas de 5 V y un chasis (las normas de producto son de pago, **sin verificar**). Lo que sí se puede hacer es medir la holgura real entre la soldadura o la patilla más baja de la Pi y la chapa, que sea de varios milímetros y que ni la vibración (la caja se mueve) ni un cable puedan cerrarla. Criterio mío, sin cifra.

**Resistencia del nailon (cálculo mío):** un separador de 6 mm y llave de 5 mm tiene unos 16,7 mm² de sección. Con la resistividad acondicionada de BASF (10¹⁰ Ω·m), su resistencia es de 3,6 × 10¹² Ω y la fuga a 5,2 V es de 1,5 pA. A estas tensiones el aislamiento no es un problema. La CTI de 600 de BASF mide la resistencia a las fugas superficiales y es irrelevante a 5 V.

### 4.3 Vibración

La caja cuelga de muelles para proteger el sensor (guía §4). Lo que debe hacer la columna es mantener la Pi fija respecto a la caja, no filtrar vibración.

- **El riesgo es el aflojado, no la rotura.** Una espiga de nailon de M2,5 aguanta bastantes newtons: el límite elástico acondicionado de 50 MPa por una sección de unos 3 a 5 mm² (estimación mía) da de 150 a 250 N. Lo que cede es el apriete (sección 5.2).
- **Pares de apriete:** un par de unos 0,06 N·m en un M2,5 equivale a una fuerza de unos 2 N en un mango de 3 cm de radio (cálculo mío): casi nada.
- **No uses fijarroscas.** La hoja de Loctite 242 lo desaconseja en termoplásticos. Un blog de un vendedor (cifras sin referencias) recomienda un grado medio (Loctite 243) en cajas de nailon; no lo recomiendo para estos tornillos.
- **Tuercas autoblocantes:** las habituales son metálicas con un anillo de nailon (observación general, sin fuente), así que no sirven para espigas de nailon. Lo que sí vale: una contratuerca (dos tuercas apretadas entre sí) y una marca de pintura sobre tornillo y separador para ver si giran (ideas mías, sin fuente).
- **Arandelas de goma o amortiguadores:** no he encontrado ninguna fuente que las recomiende para una Pi. La caja ya está suspendida, y añadir goma bajo la placa la haría más flexible, que es lo contrario de lo que se busca (razonamiento mío).
- **Pruebas:** golpear suavemente la caja con el sistema en marcha y revisar `vcgencmd get_throttled` y la lectura del sensor, y volver a revisar el apriete a la semana y al mes (propuesta mía).

### 4.4 ZE29A: cómo fijarlo

- **Lo que dice el manual de Winsen** (V1.1, leído): 85 × 33 × 18 mm, sin dibujo mecánico y sin agujeros, y dice que el aspecto y los tamaños dependen del producto físico. Debe fijarse "a la estructura para que no se afloje tras un uso prolongado" y no sufrir golpes ni vibración excesiva.
- **Conclusión:** como el manual no publica taladros, la única forma de saberlo es medir el módulo con calibre al recibirlo. La ficha del [ZE29A](../winsen-ze29a/README.md) lo marca igual (sin taladros, sin plano).
- **Qué medir:** si la placa tiene agujeros, su diámetro (para M2,5 hace falta al menos 2,6 o 2,7 mm de paso libre; mi estimación), su posición respecto a los bordes y los componentes que haya cerca (la celda del sensor, el conector de 4 pines). Si no hay agujeros, el kit no sirve para atornillarlo.
- **Si no hay agujeros (ideas mías, sin fuente):** un soporte propio impreso o de chapa que sujete el módulo por los bordes, o una cuna con topes. Evita pegamentos con disolvente: la ficha del ZE29A recoge que el manual de la celda hermana ME2 pide mantener el sensor lejos de disolventes orgánicos, pinturas y aceites, y que la silicona es una sospecha sin fuente.
- **La guía dice "para la Pi y el sensor":** de lo segundo no hay confirmación de que este kit sirva. Esa es una discrepancia con la guía (4.5).

### 4.5 Verificación de la guía de montaje

| Afirmación de la guía | Lo que he encontrado | Veredicto |
|---|---|---|
| §1 fila 30: kit de columnas hexagonales de nailon M2,5 (350 uds.), 9,99 €, "para la Pi y el sensor" | Los agujeros de la Pi admiten M2,5 (Ø2,75 mm). Del sensor, sin taladros publicados | **Parcial.** Para la Pi coincide; para el sensor, sin verificar |
| §4: "Pi en vertical sobre la pared trasera, con separadores M2.5" | 4 agujeros de Ø2,75 a 58 × 49 mm: encajan con M2,5 | Coincide |
| §5.2: "No hagas más uniones de masa" | Se cumple con separadores y tornillos aislantes. **No sé si los agujeros de la Pi van a GND**, y un tornillo metálico entre ellos y la chapa lo rompería | Condicionado (4.2) |
| §5.1: caja interior unida a tierra con un cable flexible | Es la razón por la que no debe haber un camino metálico desde los agujeros | Compatible |
| Dato de partida de esta investigación: "zona de exclusión de 6,2 mm" | El plano de la Pi 3B+ acota **Ø6 mm**. No encontré 6,2 en ningún documento abierto | **Discrepancia** (puede venir de la especificación HAT, no abierta) |
| Dato de partida: "4 agujeros de 2,75 mm, 58 × 49 mm" | Plano y DXF coinciden | Coincide |
| §4: "El manual del ZE29A prohíbe golpes" | El manual pide no someter el módulo a golpes ni vibraciones excesivos | Coincide (la ficha del ZE29A ya lo señaló) |

## 5. Fallos, bugs y problemas conocidos

Es una pieza pasiva. Los problemas salen del material, del apriete y del lote. No he encontrado informes de fallos de este ASIN.

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Un tornillo metálico une la masa de la Pi con la chapa a tierra | Media-alta (seguridad y ruido), depende de 4.2 |
| 2 | Pérdida de apriete por fluencia, humedad y calor | Media |
| 3 | Rosca de nailon pasada de apriete, rota o floja | Media |
| 4 | Aflojado por vibración | Media-alta |
| 5 | Lote: roscas fuera de tolerancia, longitudes mezcladas, rebabas, plástico quebradizo | Media, sin verificar |
| 6 | Material, UL 94 y temperatura desconocidos | Baja-media |
| 7 | Placa que flexiona o se aplasta | Media |
| 8 | Altura insuficiente en la cara inferior | Media |
| 9 | ZE29A sin taladros | Media (montaje) |

### 5.1 Humedad y cambio de dimensiones

- El PA66 absorbe del 2,5 al 3,1 % de agua a 23 °C y 50 % de humedad relativa, y del 8 al 9 % en saturación (BASF A3K). La humedad **cambia dimensiones, plastifica y baja la rigidez** ([Wikipedia](https://en.wikipedia.org/wiki/Nylon), BASF).
- **Cuánto crece:** ninguna hoja abierta lo cuantifica. Un blog de un vendedor dice de 0,3 a 0,5 % (sin referencias). Con esa cifra, una espiga de 2,5 mm crece de 8 a 13 µm y un separador de 8 mm, de 0,02 a 0,04 mm (cálculo mío). No es un problema geométrico; sí lo es la pérdida de rigidez.
- **En la máquina:** el nailon acaba en equilibrio con el aire de la caja. Dentro de una caja caliente la humedad relativa es menor que la del local, así que el equilibrio quedaría algo por debajo del 2,5-3,1 % de BASF (razonamiento mío; la caja tiene rejillas). Aun así, cuenta con las propiedades acondicionadas, no con las secas.
- **Dos copias de la hoja de Ensinger de EE. UU. no coinciden** en la absorción a 24 h (0,45 % la de Polymershapes, de 2019, y 1,2 % la de [Modern Plastics](https://www.modernplastics.com/wp-content/uploads/2015/04/TECAMID-66.pdf), subida en 2015 según la ruta; las dos dan 8,5 % de saturación). No afecta a las conclusiones.

### 5.2 Fluencia y pérdida de apriete

- BASF da, para PA66 acondicionado, un módulo de fluencia a 1.000 h de **700 MPa**, el 64 % del módulo acondicionado de 1.100 MPa (cálculo mío). Un tornillo de nailon apretado mantiene una deformación constante y el esfuerzo cae; **del orden de un tercio de apriete perdido en 1.000 h a 23 °C** (aproximación mía; la hoja no da relajación).
- **A 40-50 °C cabe esperar más pérdida** (razonamiento mío). La Tg de Ensinger es 47 °C, que cae en el rango de trabajo de la caja, y la humedad la baja. BASF solo da la fluencia a 23 °C: **no hay dato a 40-50 °C**.
- Un blog de un vendedor explica el aflojado de elementos en cajas de nailon por fluencia, humedad, expansión térmica y poca fricción (nailon sobre acero 0,15-0,25). Sus cifras no llevan referencias; las uso solo como indicio.
- **Consecuencia (mía):** en nailon el apriete inicial no se mantiene. Hay que revisar las uniones y marcarlas.

### 5.3 Roscas frágiles

- DIN 34810 da (según una web de tornillería, **no he visto la norma**) un par de 0,1 N·m para M3, 0,25 para M4 y 0,5 para M5 en tornillos hexagonales de PA66. La norma cubre de M3 a M10: **el M2,5 no está.** Mi extrapolación (par proporcional al cubo del diámetro; casa con la progresión M3-M4-M5 de la norma dentro de un 6 %) da **unos 0,06 N·m**.
- Bossard remite a esa norma para sus pares de PA66: valores a 20 °C tras acondicionar en clima normal y velocidad de atornillado de 150 rpm como máximo ([Bossard](https://www.bossard.com/ch-en/assembly-technology-expert/technical-information-and-tools/technical-resources/preload-and-tightening-torques/tightening-torques-for-plastic-screws--polyamide-66)). La tabla de la página no se veía; hay un capítulo descargable que no pude abrir.
- **En la práctica:** destornillador manual, no eléctrico; parar al notar el tope. Una rosca de nailon que se pasa deja el tornillo girando sin sujetar.
- **Paso de rosca:** el M2,5 normal tiene paso 0,45 mm y existe uno fino de 0,35 mm ([Wikipedia, ISO 262](https://en.wikipedia.org/wiki/ISO_metric_screw_thread)). Un separador de paso fino no encajaría con un tornillo M2,5 normal. Una rosca más fina es menos profunda y, en plástico, más débil (observación mía, sin fuente). Se comprueba midiendo con calibre la distancia entre cinco crestas: 2,25 mm para 0,45 mm (cálculo mío).
- **Roscas mal formadas** en kits baratos: observación mía, sin fuente. Se ve con el tornillo de prueba (sección 6).

### 5.4 Calor y llama

- **Calor:** la caja funciona a 40-50 °C (guía; el ZE29A admite 40 °C como máximo). El uso continuo del PA66 es de 85 a 100 °C según Ensinger y el rango de Würth llega a +110 °C: hay margen, pero no sé qué lleva el tuyo (PA6 funde a 220 °C, no es un problema a 50 °C).
- **Llama:** Würth da UL 94 HB; Essentra V-2; Ensinger HB en una hoja y V-2 en otra. **No se puede saber el del anuncio.** Si el análisis de riesgos de la máquina exigiera V-2 o mejor a estas piezas, un kit sin clase no valdría. No he podido comprobar si lo exige (las normas de producto son de pago): **sin verificar**.
- Würth declara sus separadores como no autorizados para equipos de alta seguridad (sección 3).

### 5.5 Calidad del lote

No he encontrado reseñas ni pruebas independientes de este ASIN. Lo que sigue son riesgos por ser un kit barato (observaciones mías, sin fuente) y qué hacer con ellos:

- **Roscas fuera de tolerancia:** floja (la espiga baila en la tuerca) o dura. Se detecta con el tornillo de prueba (sección 6).
- **Longitudes mezcladas en la misma bolsa o separadores de la misma "longitud" distintos entre sí:** si las cuatro columnas de la Pi no son iguales, la placa queda inclinada y trabaja a flexión. Se mide con calibre.
- **Rebabas y restos de molde** en la rosca y en las caras del hexágono: dejan la placa mal asentada.
- **Plástico quebradizo o reciclado:** grietas, zonas blancas, motas oscuras.
- **Tolerancias:** Würth indica DIN ISO 2768-1 clase m en sus separadores. Para longitudes de 6 a 30 mm la tolerancia general de esa clase es de ±0,2 mm (**de memoria, sin verificar en esta sesión**). Es un buen criterio de aceptación para un kit barato: más de ±0,2 mm entre piezas de la misma longitud es mucho.
- **Cuántos separadores hay de la altura que necesitas:** un kit típico trae varias longitudes con pocas unidades de cada una (ver 2.3: 10 o 20 de cada). Para una Pi hacen falta cuatro iguales. El reparto del tuyo es desconocido; si la altura elegida solo trae diez piezas, alcanzan para dos máquinas y media.

### 5.6 Placa que flexiona o se aplasta

Ver 4.1. Las cuatro columnas deben ser iguales y la placa ha de quedar plana. Los enchufes USB y Ethernet, en un voladizo de 23,5 mm, son el punto flojo.

### 5.7 Datos contradictorios entre fuentes

- **Mismo producto, dos temperaturas:** el separador Würth 971200155 aparece con de −55 a +150 °C en el listado de RS y con de −30 a +110 °C en la hoja del fabricante. **Manda la hoja del fabricante.** Es una advertencia sobre los listados de los distribuidores, y también sobre el de tu anuncio.
- **Mismo material, dos clases UL 94:** Ensinger da HB en su página europea y V-2 en la hoja de EE. UU. (las muestras pueden ser distintas: perfiles extruidos de otro grosor). Un UL 94 sin grosor ni número de archivo no es una garantía.

## 6. Qué comprobar al recibirlo (calibre y tornillo de prueba)

Necesitas un calibre digital y un tornillo M2,5 metálico de buena calidad (la guía no trae ninguno: el surtido M3-M6 de la fila 26 no incluye M2,5; un paquete pequeño cuesta poco; disponibilidad en Amazon.es no la he comprobado).

| # | Prueba | Resultado esperado | Si no sale |
|---|---|---|---|
| 1 | **Abrir y clasificar:** separa por longitud y por tipo (macho-hembra y hembra-hembra). Cuenta | El reparto cubre lo que necesitas (cuatro iguales para la Pi, y los del sensor) | Reclama o añade un pedido |
| 2 | **Longitud con calibre:** mide 10 piezas de cada longitud | Dispersión pequeña (mi criterio: ±0,2 mm, ver 5.5) | Descarta la longitud; no mezcles |
| 3 | **Llave del hexágono:** mide entre caras en tres puntos | La misma en todas (5 mm en el Würth; tu kit, sin verificar) | Anota. En la cara inferior de la Pi caben hasta unos 7 mm; en la superior, no más de 5,5 mm (2.2, cálculo mío) |
| 4 | **Espiga con el calibre:** mide el diámetro de 10 espigas | **Próximo a 2,5 mm sin pasarse** (el valor exacto de la tolerancia, ISO 965, no lo he verificado) | Si es mayor de 2,5 mm, no rosca; si es mucho menor, baila |
| 4b | **Paso:** mide con calibre la distancia entre cinco crestas de una espiga | 2,25 mm (paso 0,45 mm) | Con 1,75 mm es paso fino (0,35 mm): no encaja con un tornillo M2,5 normal |
| 5 | **Tornillo de prueba:** M2,5 metálico en 10 roscas hembra | Entra a mano sin fuerza hasta el fondo, sin holgura lateral apreciable | Rosca floja o apretada: descarta esa pieza |
| 6 | **Espiga en una tuerca metálica M2,5:** repetir con 10 espigas | Igual | Igual |
| 7 | **Tornillos y tuercas del kit** entre sí | Entran a mano, sin atascarse | Descartar |
| 8 | **Visual con lupa:** rebabas, grietas, zonas blancas, restos | Ninguno | Descartar |
| 9 | **Profundidad de la rosca hembra:** con el tornillo de prueba y una marca | Que coincida con la que necesitas (en Würth, 4 mm) | Elige longitud de tornillo en consecuencia |
| 10 | **Prueba de rotura de una pieza sacrificada:** aprieta una pieza hasta que ceda y anota el tacto | Cede bastante por encima del apriete "firme a mano" | Si cede con un apriete que no pasa de "firme a mano", rechaza el lote |
| 11 | **Pasan por el agujero de la Pi:** espiga y tornillo en los agujeros de la Pi | Entra sin forzar (agujero de 2,75 mm) | Si hay que forzar, no es M2,5 |
| 12 | **Con todo montado y sin red:** polímetro en ohmios entre el pin 6 de la Pi (GND) y la caja interior | Circuito abierto o varios megaohmios (4.2) | Continuidad: busca el camino metálico (tornillo, pantalla, conector) |

Notas:

- **Guarda el kit cerrado** y seco (Würth indica por debajo de 40 °C y 75 % de humedad relativa; es dato de su producto).
- **Anota el lote y la fecha** y pide el mismo para las máquinas en serie.
- **No uses el tornillo de prueba metálico como pieza definitiva** si decides montar con tornillos de nailon.

## 7. Alternativas

Solo si el kit falla o si algún requisito (UL 94, temperatura) lo exige. Disponibilidad en Amazon.es: **sin verificar** en todos los casos.

| Alternativa | Qué dicen las fuentes | Comentario |
|---|---|---|
| **Würth WA-SPAIE** (por ejemplo, 971060155, cuerpo 6 mm, M-H M2,5) | PA negro, UL 94 HB, de −30 a +110 °C, tolerancia ISO 2768-1 m ([hoja](https://docs.rs-online.com/57e3/0900766b816cd289.pdf) ([copia local](datasheets/0900766b816cd289.pdf))) | La única con hoja del fabricante que he leído. No dice PA6 o PA66. No he comprobado el precio |
| **Essentra, separadores hexagonales aislantes** | Nailon 6, UL 94 V-2, M2,5 a M6, desde 8 mm ([Essentra](https://www.essentracomponents.com/en-gb/p/hexagonal-insulation-standoffs)) | UL 94 V-2 documentado. La longitud mínima de la página es 8 mm |
| **Multicomp RPI-NYLON-STANDOFF-KIT** (Farnell 2543622) | Nailon, hecho para Pi, RoHS, origen Taiwán ([Farnell](https://ie.farnell.com/multicomp/rpi-nylon-standoff-kit/threaded-standoffs-kit-raspberry/dp/2543622)) | Solo 12 piezas; longitudes no dadas |
| **Separadores de aluminio o latón** | Existen separadores de aluminio de 11 mm para Pi ([Pololu](https://www.pololu.com/product/1952)). Conducen | **No sirven aquí** si el agujero va a GND y la caja a tierra (4.2). Solo si se quiere unir −V a tierra a propósito |
| **Poliacetal (POM, Delrin)** | Uso continuo hasta 80 °C y puntual 100 °C; poca contracción; sensible a concentraciones de tensión ([Wikipedia](https://en.wikipedia.org/wiki/Polyoxymethylene)). Su absorción de agua **no la cuantifica esa página** | Se supone que absorbe mucho menos que el nailon (conocimiento general, **sin fuente abierta**). No he encontrado separadores de POM M2,5 con hoja de datos |
| **Soportes de montaje de Pi sin tornillos, amortiguadores de goma** | **No los he investigado** | Sin motivo documentado: la caja ya está suspendida y el montaje es de cuatro puntos |

## 8. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Mide primero la masa de los agujeros de la Pi** (4.2). Ese resultado decide si hace falta cuidar los tornillos o si es un seguro más.
2. **Monta la Pi con separadores macho-hembra**: espiga por la chapa, con tuerca por detrás; en el lado de la placa, tornillo (de nailon, o metálico más corto que la rosca interior) con la cabeza dentro del círculo de Ø6. Evita los hembra-hembra cortos con tornillos metálicos en los dos lados.
3. **Altura:** mide la cara inferior de tu Pi (soldaduras y ranura de la microSD) y elige la columna con un margen. A falta de dato, 6 mm es el mínimo que yo probaría y 8 o 10 mm da más aire para sacar la microSD (criterio mío, sin cifra del fabricante). Cuatro columnas iguales, medidas con calibre.
4. **Apriete casi a mano**, destornillador manual, y una marca de pintura en cada unión. Revisa a la semana, al mes y tras el transporte.
5. **No uses fijarroscas** en el nailon.
6. **Prueba de rotura y de ajuste** en dos o tres piezas del lote antes de montar (sección 6). Si el lote falla, usa las alternativas de la sección 7.
7. **Para el ZE29A, mide el módulo primero.** Si no tiene agujeros, no pidas más separadores: diseña el soporte. Y evita pegamentos con disolvente cerca de la celda.
8. **Guarda el resto del kit seco** y anota el lote. Para máquinas en serie, repite las pruebas de la sección 6 con cada pedido.
9. **Si el análisis de riesgos pide UL 94 V-2 o mejor,** compra separadores con ficha (Würth da HB; Essentra da V-2) y no uses este kit.

**Afecta a otras piezas (una línea cada una):**

- **Raspberry Pi 3B+:** conviene añadir a su ficha si los agujeros van a GND (4.2) y las alturas de la cara inferior que mida el usuario.
- **Winsen ZE29A:** sin taladros publicados: el kit no es una solución hasta medir el módulo.
- **Meanwell LRS-50-5 / guía §5.1:** la decisión de unir o no −V a tierra de protección está sin tomar y no debería resolverla un tornillo.
- **Tornillería M3-M6 (fila 26):** no incluye M2,5.

## 9. Lo que no he podido verificar

- **El anuncio de Amazon:** marca, vendedor, material (PA6 o PA66), color, longitudes y cantidades, tipos de separador, tuercas y tornillos, UL 94, temperatura, origen. Amazon bloquea mi herramienta; el ASIN no apareció en una búsqueda por él.
- **Si los agujeros de montaje de la Pi 3B+ van a GND.** No hay documento oficial abierto que lo diga; los hilos del foro de Raspberry Pi (t=226978, t=219941, t=298800, t=183551) no se abrieron.
- **El 6,2 mm de zona de exclusión.** El plano de la Pi 3B+ acota Ø6. La especificación HAT clásica (GitHub, `hat-board-mechanical.pdf`) no se abrió: GitHub rechazó la herramienta.
- **El espesor del PCB y las alturas de la cara inferior** de la Pi (soldaduras, ranura microSD): el plano no los da.
- **El par de apriete de un M2,5 de nailon:** DIN 34810 empieza en M3; el valor de 0,06 N·m es una extrapolación mía. No he visto la norma, solo una tabla en una web de tornillería.
- **La tabla de pares de PA66 de Bossard** y el capítulo descargable: no se veían.
- **Cambio de dimensiones con la humedad y rigidez dieléctrica del PA66:** ninguna hoja abierta lo cuantifica.
- **Fluencia a 40-50 °C:** BASF solo da 23 °C.
- **Qué exige la norma del producto** (EN 60335-2-82 u otra) al material aislante de estas piezas (UL 94, temperatura): las normas son de pago.
- **Tolerancias de rosca ISO 965 y de longitud ISO 2768-m:** de memoria, no verificadas.
- **Las cabezas y llaves del kit** (diámetro de la cabeza del tornillo, entre caras del hexágono).
- **Las fuerzas de inserción de los conectores USB y HDMI** sobre una placa en voladizo: sin valor.
- **Hojas de DuPont (Zytel), Röchling, Hellermann, Keystone, Harwin y Richco:** no las abrí (presupuesto de búsquedas web). Las cifras de PA66 salen de BASF, Ensinger, Würth y Essentra.
- **Distancia mínima entre pistas de 5 V y chasis:** no encontré norma abierta que la fije; las normas son de pago.
- **Disponibilidad en Amazon.es** de los separadores alternativos, de los tornillos M2,5 metálicos de prueba y precios.
- **Soportes de montaje sin tornillos, amortiguadores de goma, separadores de POM:** sin investigar o sin fuente.
- **La mayor parte de lo que cito de las hojas de BASF, Ensinger y Würth** lo leyó mi herramienta (que resume el PDF); no he abierto los PDF yo mismo. Si una cifra es crítica, comprueba el PDF.

## 10. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo y con nota en los que no pude abrir, en [`enlaces.md`](enlaces.md).
