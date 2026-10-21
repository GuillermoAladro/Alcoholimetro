# Cable USB-A a USB-C acodado 90°, 30 cm

Cable corto que lleva los 5 V del borne USB-A de tornillo hasta el puerto USB-C del canto de abajo del lector SumUp Solo. Es la única conexión eléctrica entre la fuente y el Solo.

- **Dónde va (según la guía de montaje, §5.2):** regleta WAGO (5,20 V) → borne USB-A hembra de tornillo (hoja #18, B07V86XPL4) con D+ y D− unidos por un puente → **este cable** → USB-C del Solo. No cuelga de la Raspberry Pi.
- **Compra:** ASIN B0C8FS5FV2, 4,99 € (precio de la hoja de componentes del 19-20-10-2026).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta, así que no he podido ver el anuncio: el precio y la referencia son los de tu hoja. No he encontrado el ASIN en ningún otro sitio, así que **marca, vendedor, calibre de los hilos y certificaciones del anuncio son desconocidos**.

> **Actualización 21-10-2026 (anuncio de Amazon.es leído).** Después de escribir esta ficha pude abrir el anuncio con el navegador integrado, así que lo que dice arriba de que Amazon bloquea el acceso ya no vale para esta pieza. Lo que cambia: cable de 30 cm con una punta acodada a 90°, 5 V y 3,1 A de carga y 480 Mbit/s. No dice qué punta es la acodada ni consta la resistencia de 56 kΩ en el pin CC. Ver el [detalle y origen de cada dato](../../montaje-general/anuncios-amazon-21-10-2026.md).

Es una pieza genérica sin datasheet. Esta ficha documenta qué exige la normativa a un cable así, qué impacto tiene en este montaje y qué hay que medir al recibirlo.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Uso en el proyecto](#4-uso-en-el-proyecto)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Qué comprobar al recibirlo (polímetro)](#6-qué-comprobar-al-recibirlo-polímetro)
7. [Recomendaciones para el alcoholímetro](#7-recomendaciones-para-el-alcoholímetro)
8. [Lo que no he podido verificar](#8-lo-que-no-he-podido-verificar)
9. [Fuentes](#9-fuentes)

---

## 1. Resumen para el proyecto

- **El cable tiene que llevar datos (D+ y D−), no solo energía.** La guía junta D+ y D− en el borne para que el Solo vea un cargador "dedicado". Esa señal solo llega al Solo si los hilos D+/D− existen en el cable. Según la documentación de Microchip sobre carga por USB (BC 1.2), sin D+ y D− en el cable el dispositivo se queda limitado a 100 mA. Un cable "solo carga" (muy común a 4,99 €) rompería el diseño. **El anuncio no se ha podido ver: se desconoce si lleva datos.**
- **Debe llevar una resistencia de 56 kΩ (±5 %) entre el pin CC (A5) y VBUS.** Es lo que exige la especificación USB Type-C a un cable USB-A → USB-C. Con 10 kΩ el cable anuncia 3 A que una fuente USB-A no tiene por qué dar; sin resistencia, o con una de 5,1 kΩ, lo esperable es que el Solo no reconozca la fuente (deducción mía, a partir de [Espressif](https://docs.espressif.com/projects/esp-iot-solution/en/latest/usb/usb_overview/usb_typec_hardware_guide.html); no he encontrado fuente de que 5,1 kΩ dañe nada). Se mide con el polímetro en un minuto (sección 6).
- **La caída de tensión en 30 cm no es un problema a la corriente típica.** Con hilos de 28 AWG (los más finos habituales en cables USB) caen unos 0,11 V a 0,8 A y unos 0,28 V a 2,0 A solo en el cable (cálculo propio, sección 4.3). El umbral de 4,63 V es el de la Pi y **no aplica al Solo**; el mínimo de entrada del Solo no está publicado.
- **El conector acodado reduce el esfuerzo lateral en el puerto del Solo, pero concentra el esfuerzo en el codo (deducción mía).** En un montaje fijo el riesgo son los hilos rotos junto al sobremoldeado, no el desgaste del conector. Hay que sujetar el cable cerca del conector y comprobar que el sobremoldeado cabe en la **ranura de 14 × 9 mm** del separador.
- **El manual del Solo solo autoriza el cable y el adaptador incluidos.** Dice que cargarlo con otros puede causar incendio, descarga o daños. Este cable es de terceros: conviene preguntárselo a SumUp junto con el resto de permisos (ver sección 5).
- **Producto sin garantías de continuidad.** Un anuncio genérico puede cambiar de fabricante sin cambiar de ASIN (riesgo general; no lo he podido confirmar para este anuncio). Compra varias unidades de golpe, mídelas todas y guarda el mismo lote para las máquinas en serie.

## 2. Especificaciones

El anuncio no se ha podido leer, así que la tabla separa **lo que debe cumplir** cualquier cable de este tipo (con fuente) de **lo que se desconoce** del tuyo.

| Característica | Valor o requisito | Fuente |
|---|---|---|
| Referencia de compra | ASIN B0C8FS5FV2, 4,99 € | Hoja del usuario / [guía de montaje](#9-fuentes), fila 10 |
| Longitud | 30 cm | Guía de montaje |
| Conectores | USB-A macho y USB-C macho, uno de ellos acodado a 90° | Guía de montaje. **Qué extremo es el acodado y hacia dónde apunta el codo: sin verificar** |
| Resistencia Rp en CC | 56 kΩ ±5 % del pin A5 (CC) del USB-C a VBUS | [Zebra](https://docs.zebra.com/content/tcm/us/en/printers/mobile/zq220plus-zq120plus-ug/miscellaneous/usb-cable.html) (documentación de un producto, cita la especificación sin numerarla); [ECN Rp tolerance](https://docs.ampnuts.ru/eevblog.docs/Standards/USB%203.1/usb_31_030215/USB%20Type-C/USB%20Type-C%20ECNs/USB%20Type-C%20ECN%20Legacy%20Cable%20Rp%20Tolerance%20v4.pdf) (copia no oficial); [Chromium](https://chromium.org/chromium-os/developer-library/reference/hardware/cable-and-adapter-tips-and-tricks) (56 kΩ obligatorio, secciones 3.5.1 y 3.5.2 de la especificación) |
| Pines B6 y B7 | Omitidos en el conector USB-C | [Zebra](https://docs.zebra.com/content/tcm/us/en/printers/mobile/zq220plus-zq120plus-ug/miscellaneous/usb-cable.html) |
| VBUS y GND | Todos los pines VBUS unidos en el conector USB-C; todos los GND unidos | [Zebra](https://docs.zebra.com/content/tcm/us/en/printers/mobile/zq220plus-zq120plus-ug/miscellaneous/usb-cable.html) |
| Blindaje | Unido a GND en ambos extremos | [Zebra](https://docs.zebra.com/content/tcm/us/en/printers/mobile/zq220plus-zq120plus-ug/miscellaneous/usb-cable.html) |
| Corriente que debe aguantar | 3 A, aunque Rp sea de 56 kΩ | [Chromium](https://chromium.org/chromium-os/developer-library/reference/hardware/cable-and-adapter-tips-and-tricks) |
| Hilos D+ / D− | Necesarios en este montaje (puente de cargador dedicado en el borne) | [Microchip, carga por USB](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/); decisión de la guía |
| Calibre de los hilos de potencia | USB 2.0 permite 28 AWG como mínimo. Anuncio: **sin verificar** | Ver 4.3 |
| Resistencia máxima de conductor | 28 AWG: 23,20 Ω/100 m; 24 AWG: 9,09 Ω/100 m (cita de las tablas de USB 2.0, fuente secundaria) | [geekchamp](https://geekchamp.com/what-does-28awg-1p24awg-2c-mean-on-a-usb-cable/). Las tablas existen en la especificación (Table 6-2 y 6-6), ver sección 3 |
| Contacto USB-C, resistencia | Hasta 40 mΩ inicial y 50 mΩ después por contacto (ejemplos de fabricante) | [Molex](https://static.chipdip.ru/lib/641/DOC034641065.pdf), [GCT](https://www.farnell.com/datasheets/3565766.pdf) |
| Contacto USB-A, resistencia | Hasta 30 mΩ por contacto (ejemplos de fabricante) | [Lumberg](https://www.lumberg.com/en/products/product/2410+08), [Kyoritsu](https://www.kyohritsu.com/eclib/OTHER/FIG/CONNECTOR/3505.pdf) |
| Ciclos de conexión | USB-C: 10.000. USB-A: 1.500 | Mismas fichas de fabricante |
| Tensión del puerto cargador USB-A | 4,75 a 5,25 V (BC 1.2) | [Microchip](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/) |
| Certificación USB-IF | **Sin verificar.** Lo normal a este precio es que no tenga | Ver sección 3 |
| Marca, vendedor, blindaje real | **Sin verificar** | Amazon bloquea el acceso |

## 3. Documentos oficiales

Un cable genérico no tiene datasheet. Estas son las normas que aplican. Los ZIP de USB-IF no se pueden descargar desde mi herramienta, así que **no he leído su texto**: lo que cito de ellas sale de fuentes que las resumen (se indica en cada caso).

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| USB Type-C Cable and Connector Specification | Release 2.5 (listada el 08-04-2026) | ZIP, 28,38 MB | [descargar](https://www.usb.org/sites/default/files/USB%20Type-C%202.5%20Release%20202603.zip) ([copia local](../documentos-compartidos/usb/USB_Type-C_2.5_Release_202603.zip)) · [página](https://usb.org/document-library/usb-type-cr-cable-and-connector-specification-release-25) |
| USB 2.0 Specification | ZIP con ECN hasta abril de 2025 (listado 03-06-2025) | ZIP, 13,82 MB | [descargar](https://usb.org/sites/default/files/usb_20_20250603.zip) ([copia local](../documentos-compartidos/usb/usb_20_20250603.zip)) · [página](https://usb.org/document-library/usb-20-specification) |
| USB Battery Charging Specification v1.2 | BC 1.2 (listada 11-12-2019) | ZIP | [descargar](https://usb.org/sites/default/files/BCv1.2_070312_0.zip) ([copia local](../documentos-compartidos/usb/BCv1.2_070312_0.zip)) · [página](https://usb.org/document-library/battery-charging-v12-spec-and-adopters-agreement) |
| ECN "Legacy Cable Rp Tolerance" (Type-C Release 1.0, 11-08-2014) | Form 20140811-ECN | PDF, copia no oficial | [ver](https://docs.ampnuts.ru/eevblog.docs/Standards/USB%203.1/usb_31_030215/USB%20Type-C/USB%20Type-C%20ECNs/USB%20Type-C%20ECN%20Legacy%20Cable%20Rp%20Tolerance%20v4.pdf) |
| Google (Chromium OS): consejos sobre cables y adaptadores USB-C | Sin referencia | Web | [ver](https://chromium.org/chromium-os/developer-library/reference/hardware/cable-and-adapter-tips-and-tricks) |
| Programa de cumplimiento de USB-IF | Sin referencia | Web | [ver](https://usb.org/node/579) |
| Integrators List (productos certificados) | Sin referencia | Web | [cms.usb.org](https://cms.usb.org/) (la página del programa remite a `cms.usb.org/integrators-list`) |
| Manual del SumUp Solo (copia de terceros) | Sin referencia | Web | [manuals.plus](https://manuals.plus/sumup/solo-card-reader-manual) |
| Ficha técnica del Solo en Currys | BRI42258_TECH | PDF | [ver](https://ik.imagekit.io/pimberly/595e406f0f15f30010780448/cd32c72b/62ea63129b3cd64ff4000200/BRI42258_TECH.pdf) ([copia local](../sumup-solo/datasheets/BRI42258_TECH.pdf)) |

### Qué dicen los más relevantes

**Cables USB-A → USB-C (USB Type-C, secciones 3.5.1 y 3.5.2 según Chromium)**

- Un cable USB-C a USB-A (2.0 o 3.1) lleva **Rp de 56 kΩ** y no lleva Rd. La página de Google lo dice sin margen: es obligatorio. La resistencia indica lo que ofrece la fuente, no lo que aguanta el cable. ([Chromium](https://chromium.org/chromium-os/developer-library/reference/hardware/cable-and-adapter-tips-and-tricks))
- Los valores de 10 kΩ (3 A) y 22 kΩ (1,5 A) son de **adaptadores de corriente** con conector USB-C, no de cables A-C. ([Chromium](https://chromium.org/chromium-os/developer-library/reference/hardware/cable-and-adapter-tips-and-tricks), [Infineon](https://community.infineon.com/t5/Knowledge-Base-Articles/Termination-Resistors-Required-for-the-USB-Type-C-Connector/ta-p/253544))
- Un ECN de agosto de 2014 (Type-C Release 1.0) aprieta la tolerancia de Rp de ±20 % a **±5 %** en estos cables, para dejar margen a la caída de tensión por VBUS y GND dentro del cable. Eso da **53,2 a 58,8 kΩ** (cálculo propio). La copia que he leído no es de usb.org; no he comprobado cómo queda en la Release 2.5.
- "Todos los cables deben aguantar 3 A", incluso con Rp de 56 kΩ, porque el dispositivo puede detectar más corriente por BC 1.2 o por un método propio. ([Chromium](https://chromium.org/chromium-os/developer-library/reference/hardware/cable-and-adapter-tips-and-tricks))

**Cargador "dedicado" (DCP) y D+/D− (BC 1.2)**

- Un DCP une D+ con D− con una impedancia de **200 Ω como máximo**; el dispositivo lo detecta aplicando 0,5–0,7 V a una de las líneas y viendo más de 0,4 V en la otra. Un dispositivo que detecta un DCP puede subir su consumo hasta 1,5 A. ([Microchip](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/))
- "Todos los mecanismos de BC 1.2 requieren que D+ y D− estén presentes en el cable." Sin ellos, el dispositivo se queda en 100 mA. ([Microchip](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/))
- Con una Rp estándar, el dispositivo USB-C necesita "otro método" para saber qué corriente puede dar la fuente, como BC 1.2 o uno propio. Para un cargador con conector USB-C, Google recomienda que el puerto también soporte BC 1.2 y une D+ con D− en el conector. ([Chromium](https://chromium.org/chromium-os/developer-library/reference/hardware/cable-and-adapter-tips-and-tricks))
- **Aplicación aquí (deducción mía):** el DCP se hace en el borne USB-A (el puente), y la señal tiene que atravesar el cable hasta el Solo. Los dos hilos de datos añaden unos 0,14 Ω al lazo (28 AWG, 30 cm), muy por debajo de 200 Ω.
- **No he encontrado ningún documento de SumUp que diga que el Solo usa BC 1.2** ni qué hace sin él. Es una suposición de la guía.

**Tablas de USB 2.0 que afectan al cable**

- El índice de una copia no oficial de la especificación USB 2.0 (2011) lista la **Table 6-2 "Power Pair"** (p. 103), la **Table 6-6 "Conductor Resistance"** (p. 105) y la **sección 7.2.2 "Voltage Drop Budget"** (p. 175). Solo pude leer el índice, no los valores. ([copia en nefarius](https://git.nefarius.at/nefarius/USB-Bluetooth-Specs/src/branch/master/usb_20_0702115)) Las resistencias máximas que uso (28 AWG: 23,20 Ω/100 m; 24 AWG: 9,09 Ω/100 m) las cita un artículo de divulgación, **fuente secundaria**; coinciden con una tabla AWG de cobre macizo (21,29 y 8,42 Ω/100 m, [Wikipedia](https://en.wikipedia.org/wiki/American_wire_gauge)) con un margen del 8-9 % por trenzado.

## 4. Uso en el proyecto

### 4.1 Circuito

Fuente: [guía de montaje](#9-fuentes), §1 fila 10, §2.5, §3 y §5.2.

```
LRS-50-5 (5,20 V) → WAGO 221-415 polo 3 → 0,75 mm² → borne USB-A hembra de tornillo (#18)
   (VCC + GND; D+ y D− unidos con puente)
→ cable USB-A → USB-C acodado, 30 cm (#10) → USB-C del canto de abajo del Solo
```

- Consumo del Solo cargando: **0,8 A típico y 2,0 A de pico**, ambos **estimados** por la guía, no medidos. SumUp no publica la corriente de entrada.
- El conector baja por una **ranura de 14 × 9 mm del separador** (guía). La guía no dice si es el extremo USB-C o el USB-A el que pasa. **A confirmar con el cable en la mano** (ver 4.4).
- El Solo trae su propio cable USB-C y su base de carga. La web de SumUp dice que se puede cargar con la base conectada por USB-C o enchufando el USB-C del propio Solo ([SumUp](https://www.sumup.com/en-gb/card-reader-solo-learn-more/)). Qué tipo de cable incluye (A-C o C-C): **sin verificar**.

### 4.2 Por qué importan Rp y D+/D− en este montaje

1. **Rp (56 kΩ a VBUS).** Es lo que le dice al Solo que hay una fuente. Con el Solo conectado y el cable alimentado a 5,20 V, la tensión en CC sería de unos **0,43 V** (5,20 V × 5,1 / (56 + 5,1), cálculo propio con el Rd de 5,1 kΩ habitual del lado del dispositivo, que cita [Espressif](https://docs.espressif.com/projects/esp-iot-solution/en/latest/usb/usb_overview/usb_typec_hardware_guide.html)). Con Rp de 10 kΩ el Solo creería que puede tomar 3 A.
2. **D+/D−.** Con Rp de 56 kΩ el Solo ve "potencia USB por defecto". Sin enumeración (no hay host al otro lado) y sin detección de DCP, un dispositivo USB se queda en 100 mA ([Microchip](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/)). El puente de la guía pretende evitarlo. **Que el Solo reconozca ese puente: sin verificar.** Se comprueba midiendo la corriente de carga con y sin puente (sección 6).
3. **Alimentación sin cable USB-C directo.** La guía ya descarta meter 5 V "a pelo" en un USB-C. Este cable es lo que aporta la resistencia Rp que un cable A-C legal debe llevar.

### 4.3 Caída de tensión en el cable (cálculo propio)

Hipótesis: cable de 30 cm; resistencia máxima por conductor de USB 2.0 (28 AWG: 0,232 Ω/m; 24 AWG: 0,0909 Ω/m, fuente secundaria); lazo de ida y vuelta (VBUS + GND). La columna "con contactos" suma, **en su valor máximo de ficha**, un contacto USB-A de 30 mΩ y uno USB-C de 40 mΩ por línea (hay cuatro pines VBUS y cuatro GND en paralelo en el USB-C, así que es una cota superior). Se parte de **5,20 V en el borne USB-A**.

| Calibre | Corriente | Caída en el cable | Caída con contactos máximos | Tensión en el Solo (cable / con contactos) | Calor en el cable |
|---|---|---|---|---|---|
| 28 AWG | 0,8 A (típico, est.) | 111 mV | 223 mV | 5,09 / 4,98 V | 0,09 W |
| 28 AWG | 2,0 A (pico, est.) | 278 mV | 558 mV | 4,92 / 4,64 V | 0,56 W |
| 28 AWG | 3,0 A (si el Solo creyese una Rp de 3 A) | 418 mV | 838 mV | 4,78 / 4,36 V | 1,25 W |
| 24 AWG | 0,8 A | 44 mV | 156 mV | 5,16 / 5,04 V | 0,03 W |
| 24 AWG | 2,0 A | 109 mV | 389 mV | 5,09 / 4,81 V | 0,22 W |
| 24 AWG | 3,0 A | 164 mV | 584 mV | 5,04 / 4,62 V | 0,49 W |

- Los cables de 0,75 mm² que van de la WAGO al borne también restan: unos **92 mV a 2 A por cada metro de tendido** (ida y vuelta de 1 m cada una, cobre a 0,0172 Ω·mm²/m, cálculo propio).
- **Umbral de subtensión:** el de 4,63 V es el de la Raspberry Pi 3B+ ([ficha de la Pi](../raspberry-pi-3b-plus/README.md)). El Solo no cuelga de la Pi. Lo que importa aquí es la tensión **en el Solo**, y SumUp no publica su mínimo de entrada (sin verificar). El único dato de referencia para el puerto cargador USB-A es 4,75 a 5,25 V (BC 1.2, Microchip). Con 5,20 V en el borne, a 0,8 A el Solo recibe más de 4,95 V incluso en el peor caso; a 2,0 A y 28 AWG, el peor caso baja a 4,64 V, que es una cota pesimista (contactos al máximo de ficha).
- **Tope superior:** con el Solo cargado y poca corriente, la tensión en el Solo roza los 5,20 V, dentro de 5,25 V.
- **Conclusión (mía):** a la corriente típica da igual 28 que 24 AWG. A 2,0 A el 24 AWG deja bastante más margen. Como el calibre del anuncio se desconoce, hay que **medirlo** (sección 6).

### 4.4 Mecánica del conector acodado

- **Dirección del codo.** El USB-C es reversible, así que girar el conector 180° cambia hacia dónde sale el cable (arriba o abajo, o izquierda o derecha, según cómo sea el codo). El USB-A no se puede girar. Qué extremo es acodado y hacia dónde: **sin verificar**. Decídelo con el cable delante, probando sobre el separador.
- **Ranura de 14 × 9 mm.** Mide el sobremoldeado del conector que tenga que atravesarla con un calibre antes de dar por buena la ranura. Los sobremoldeados acodados suelen ser mayores que los rectos (observación mía, sin fuente).
- **Esfuerzo.** Los cables fallan sobre todo por mala descarga de tracción y por flexión repetida junto al conector, donde un hilo roto se vuelve circuito abierto ([EPEC](https://www.epectec.com/articles/what-causes-cable-assemblies-to-fail-and-how-to-avoid-them.html), artículo de un fabricante). En un montaje fijo el cable no se flexiona, pero sí hay vibración y tirones al abrir la máquina.
- **Ciclos de conexión.** 10.000 para USB-C y 1.500 para USB-A según las fichas de ejemplo (sección 2). En un montaje fijo, donde el cable apenas se desconecta, no son el límite (deducción mía).
- **Retención.** No he encontrado datos de fuerza de retención del USB-C ni del USB-A del borne. Un cable que pesa poco se mantiene por fricción; por eso conviene sujetarlo (sección 7).

## 5. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Cable sin Rp, con Rp de 10 kΩ/22 kΩ o con 5,1 kΩ | Alta si ocurre, se detecta al recibirlo |
| 2 | Cable "solo carga" sin D+/D− | Alta: anula el puente de la guía |
| 3 | Hilos de 28 AWG: caída de tensión y calor | Media-baja a 0,8 A, media a 2 A |
| 4 | Hilos rotos en el codo, soldaduras y crimpados malos | Media-alta (fallo intermitente) |
| 5 | Sobremoldeado que no cabe en la ranura | Media (montaje) |
| 6 | El manual del Solo solo autoriza el cable y el adaptador incluidos | Media (garantía y seguridad) |
| 7 | Anuncio que cambia de fabricante sin cambiar de ASIN | Media, sin confirmar |
| 8 | Sin certificación USB-IF | Baja si se mide, sin verificar |

### 5.1 Cables con la resistencia mal o sin ella

- **2015-2016.** El ingeniero de Google Benson Leung reseñó en Amazon cables USB-C baratos y encontró varios con la resistencia equivocada o ausente ([PCWorld, 5-11-2015](https://www.pcworld.com/article/424287/beware-bad-usb-c-cables-google-engineer-warnswhile-naming-names.html); [Slashdot](https://hardware.slashdot.org/story/15/11/05/1959216/google-engineer-warns-against-perils-of-buying-cheap-third-party-usb-c-cables)). Sus reseñas originales están en Amazon, que no puedo abrir; la de un cable que le estropeó dos analizadores USB-PD y su Chromebook Pixel (VBUS cableado a GND, según TechSpot) está en [amazon.com/review/R2XDBFUD9CTN2R](https://www.amazon.com/review/R2XDBFUD9CTN2R/) (**no abierta**). ([TechSpot](https://www.techspot.com/news/63707-terrible-usb-type-c-cable-fries-engineer-chromebook.html))
- **El fallo concreto de los cables A-C:** algunos fabricantes usaron 10 kΩ en vez de 56 kΩ, y un dispositivo USB-C puede pedir 3 A a un cargador que da 2 A o menos. ([HotHardware](https://hothardware.com/news/amazon-bans-shoddy-usb-c-cables))
- **OnePlus** reconoció en 2015 que el cable y el adaptador del OnePlus 2 llevaban 10 kΩ en vez de 56 kΩ y que podían dañar la fuente externa con dispositivos de carga rápida. ([PhoneArena](https://www.phonearena.com/news/OnePlus-confirms-that-its-USB-Type-C-cables-and-adapters-can-damage-external-power-sources_id76145))
- **Amazon** prohibió en 2016 los cables y adaptadores USB-C no conformes con la especificación de USB-IF ([HotHardware](https://hothardware.com/news/amazon-bans-shoddy-usb-c-cables)). Esa regla no garantiza que un anuncio de 2023 la cumpla.
- **Para este proyecto:**
  - La fuente es una LRS-50-5 de 10 A, así que no se hundiría: lo que se arriesga es el **cable y el borne** si el Solo cree tener 3 A. En el peor caso, 1,25 W en 30 cm de 28 AWG (cálculo propio).
  - Con Rp de 5,1 kΩ (Rd) o sin Rp lo esperable es que el Solo no reconozca una fuente: dos extremos "consumidores" no forman conexión válida ([Espressif](https://docs.espressif.com/projects/esp-iot-solution/en/latest/usb/usb_overview/usb_typec_hardware_guide.html)). Que cargue igualmente al ver VBUS depende del Solo y no está documentado. **Deducción mía, sin verificar.** No he encontrado fuente de que 5,1 kΩ dañe una fuente USB-A.

### 5.2 Cable "solo carga"

- Un cable "solo carga" omite, por definición, los hilos D+ y D−. Aquí eso anula el puente del borne (4.2). En los anuncios la pista suele ser que mencionen "solo carga" o que no digan nada de velocidad de datos; si dicen "480 Mbps" o "sincronización", lo normal es que lleven D+/D− (observación mía, sin fuente; no he podido ver el anuncio).
- **Se comprueba con el polímetro en la sección 6.** La guía, §5.2, habla de unir D+/D− en el borne pero no dice que el cable deba llevarlos.

### 5.3 Calibre y calor

- Los hilos de potencia de los cables USB van de 20 a 28 AWG según la corriente prevista, y 28 AWG es el extremo más fino ([Monoprice](https://www.monoprice.com/p/resources/usb-cable-wiring-what-every-user-should-know)). Las resistencias máximas de USB 2.0 para 28 y 24 AWG que cita geekchamp (sección 2) suponen que esos calibres están admitidos.
- Las marcas del tipo "28AWG/1P + 24AWG/2C" quieren decir un par de datos de 28 AWG y dos hilos de potencia de 24 AWG ([geekchamp](https://geekchamp.com/what-does-28awg-1p24awg-2c-mean-on-a-usb-cable/)). La marca impresa en la funda es la mejor pista que tendrás al recibirlo; no sustituye a medir.
- El calor no es el problema a 30 cm (de 0,1 a 0,6 W, sección 4.3). Lo es si el Solo cree que puede tomar 3 A (problema 1). La temperatura que importa es la del Solo: el manual indica hasta 40 °C en funcionamiento y la guía ya lo trata como riesgo de la máquina.

### 5.4 Contactos y codo en cables baratos

- **Qué falla en los cables baratos (conocimiento general, sin fuente propia):** soldaduras frías, hilos cortados al pelar, crimpados flojos, descarga de tracción de plástico sin refuerzo. Una fuente de fabricante lo resume así: mala descarga de tracción, flexión junto al conector y soldaduras defectuosas ([EPEC](https://www.epectec.com/articles/what-causes-cable-assemblies-to-fail-and-how-to-avoid-them.html)).
- **No he encontrado estadísticas de fallos de cables USB acodados** ni pruebas independientes de este ASIN.
- **Para este proyecto:** un cable acodado no ha de moverse en servicio. Prueba el codo moviéndolo mientras mides continuidad (sección 6, paso 6).
- **Conector USB-A en el borne:** los contactos USB-A de los ejemplos de ficha están dados para 1 a 2,5 A según la pieza ([Lumberg](https://www.lumberg.com/en/products/product/2410+08) da 1 A; [Kyoritsu](https://www.kyohritsu.com/eclib/OTHER/FIG/CONNECTOR/3505.pdf) da 1,5 A para USB 1.0 y 2,5 A para USB 2.0). El pico estimado de 2,0 A queda en esa franja. Afecta a la ficha del borne (#18); aquí solo lo señalo.

### 5.5 Manual del Solo

- El manual (copia de terceros) dice: cargar solo con el cable y el adaptador incluidos o autorizados; con otros "puede causar incendio, descarga eléctrica y daños" al dispositivo y al adaptador. Además dice no usar el aparato mientras carga y no cargar más de 12 h seguidas. ([manuals.plus](https://manuals.plus/sumup/solo-card-reader-manual))
- **Para este proyecto:** usar un cable de terceros y alimentar el Solo desde una fuente propia contradice el manual. La guía ya prevé escribir a SumUp. Añade ahí si se admite un cable y una fuente propios.

### 5.6 Sin certificación y marca desconocida

- USB-IF certifica productos por una de cinco vías y los lista en la Integrators List ([USB-IF](https://usb.org/node/579)). Los logotipos "Certified USB" de 2021 cubren cables USB-C con PD de 60 W o 240 W y USB4 ([audioXpress](https://audioxpress.com/news/new-certified-usb-logo-program-for-usb4-usb-type-c-and-usb-power-delivery-specifications)); **no he podido confirmar si un cable A-C USB 2.0 de 30 cm tiene programa de certificación**.
- Para un cable de 4,99 €, lo realista es que no tenga ninguna. Eso no es un fallo en sí: lo que lo sustituye es medirlo (sección 6).

## 6. Qué comprobar al recibirlo (polímetro)

Hazlo con **el cable desconectado de todo**. Necesitas un polímetro y una placa adaptadora (breakout) USB-C hembra, que da acceso a los pines del conector USB-C sin pinchar entre sus contactos de 0,5 mm; la disponibilidad en Amazon.es no la he comprobado. Pines del USB-A: 1 VBUS, 2 D−, 3 D+, 4 GND (asignación estándar de USB, sin enlace). En el USB-C: A5 es CC, A6 es D+, A7 es D−; los VBUS son A4/A9/B4/B9 y los GND A1/A12/B1/B12 (estos dos grupos y A5 figuran en la [ficha de Molex](https://static.chipdip.ru/lib/641/DOC034641065.pdf); A6/A7 son la asignación estándar).

| # | Medida | Resultado esperado | Si no sale |
|---|---|---|---|
| 1 | Marca de la funda y dimensiones del conector (calibre) | Calibre impreso 24 o 28 AWG; sobremoldeado que quepa en 14 × 9 mm | Anota qué es; sin marca = tratar como 28 AWG |
| 2 | **A5 (CC) ↔ VBUS del USB-C** | **53,2 a 58,8 kΩ** (56 kΩ ±5 %) | Rechazar. 10 kΩ o 22 kΩ es peligroso; infinito o 5,1 kΩ no funcionará |
| 3 | A5 (CC) ↔ GND y A5 ↔ B5 | Abierto (más de 1 MΩ) | Un valor cerca de 5,1 kΩ a GND es un Rd: rechazar |
| 4 | VBUS USB-A (pin 1) ↔ VBUS USB-C; GND USB-A (pin 4) ↔ GND USB-C | Continuidad (menos de unas décimas de ohmio con la escala baja) | Rechazar |
| 5 | **D+ (pin 3) ↔ A6; D− (pin 2) ↔ A7** | Continuidad en cada par; D+ ↔ D− abierto | Sin continuidad = cable "solo carga": rechazar |
| 6 | Repetir 4 y 5 **moviendo el cable junto a cada conector y el codo** | Sin saltos de lectura | Cualquier salto: rechazar |
| 7 | VBUS ↔ GND, VBUS ↔ D±, D± ↔ GND | Abierto | Cortocircuito: rechazar |
| 8 | Blindaje (carcasas metálicas de los dos conectores) | Continuidad entre carcasas; sin continuidad con VBUS | Anotar |
| 9 | **Caída bajo carga:** cable en el borne alimentado a 5,20 V y carga de unos 1 A en el extremo USB-C (resistencia de potencia de unos 5 Ω, o carga electrónica); medir la tensión en los dos extremos | Caída total (VBUS + GND) de unos 0,14 V para 28 AWG y unos 0,06 V para 24 AWG, más contactos | Más de unos 0,3 V a 1 A: sospechar de hilos finos o contactos malos (umbral mío) |
| 10 | **Con el Solo conectado:** medidor USB en línea o amperímetro, con y sin el puente D+/D− | Corriente de carga mayor con puente; temperatura de conectores estable tras 1 h | Si no cambia, el Solo no usa el puente: avisar a SumUp |

Notas sobre las medidas:

- Los polímetros baratos no resuelven bien 70 mΩ en la escala de ohmios (cada hilo de 28 AWG de 30 cm tiene unos 70 mΩ). Por eso el paso 9 mide caída bajo corriente.
- Las medidas 2 a 8 se hacen con el cable **sin tensión** y desconectado.
- Rp: el rango de 53,2 a 58,8 kΩ es el del ECN para cables A-C (sección 3). Un valor dentro de ±20 % (44,8 a 67,2 kΩ, la tolerancia general de Rp según [Infineon](https://community.infineon.com/t5/Knowledge-Base-Articles/Termination-Resistors-Required-for-the-USB-Type-C-Connector/ta-p/253544)) no es peligroso, pero incumple lo que pide el ECN: anótalo.
- Mide **todas** las unidades que compres, no una muestra: con un producto genérico el fallo no se reparte al azar.

## 7. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Pide tres o más unidades** del mismo ASIN, mídelas todas con la tabla de la sección 6 y archiva las que pasen. Apunta lote, vendedor y fecha del pedido.
2. **No sirve un cable "solo carga".** Antes de pedirlo, escribe al vendedor y pregunta por escrito: ¿lleva D+/D−?, ¿qué Rp lleva (56 kΩ)?, ¿calibre de VBUS/GND?, ¿qué extremo es acodado y hacia dónde? Guarda la respuesta.
3. **Mide la corriente real del Solo** con un medidor USB en línea durante una carga completa y con la pantalla en uso. Sustituye las estimaciones de 0,8 y 2,0 A de la guía. Con la corriente real, la tabla 4.3 dice si 28 AWG vale.
4. **Si el pico real pasa de 1,5 A, prefiere un cable con 24 AWG en VBUS/GND** (criterio mío). A 0,8 A la caída en el cable es de 0,04 a 0,11 V según el calibre (sección 4.3), poco en cualquier caso.
5. **Mecánica:** sujeta el cable con una abrazadera o brida a 2-3 cm del conector, deja holgura y no lo dobles pegado al sobremoldeado. Pásalo por la ranura con pasacables (la guía ya los usa en todos los agujeros).
6. **Ensayo de 24 horas** con el Solo cargando, midiendo la temperatura del Solo y del cable en la caja cerrada (la guía ya identifica el calor como riesgo n.º 5).
7. **Pregunta a SumUp** por escrito si admiten un cable y una fuente propios para el Solo (el manual solo autoriza los incluidos). Se puede incluir en el mensaje de la guía §9.
8. **Alternativas si el genérico falla:**
   - El **cable que trae el Solo**, si es A-C y de datos (tipo sin verificar).
   - Un cable de marca con ficha. El **StarTech R2ACR-30C-USB-CABLE** es USB 2.0, 30 cm, 3 A, con funda TPE y fibra de aramida, descarga de tracción probada a más de 5.000 flexiones de 180° y garantía de por vida según CDW; no da calibre ni certificación ([CDW](https://www.cdw.com/product/startech-1ft-30cm-usb-a-to-usb-c-fast-charging-cable-rugged-right-angle/7155188), [LDLC](https://www.ldlc.com/en/product/PB00666530.html)). Una tienda italiana lo marca como no disponible ([Yeppon](https://www.yeppon.it/products/startech-com-cavo-usb-1154053)). **Disponibilidad en Amazon.es: sin verificar**, y es requisito del proyecto que se pueda pedir ahí. No he medido su Rp.
9. **Repuestos:** una unidad medida de repuesto por máquina. Es el cable más barato y el fallo más fácil de arreglar en un bar.

**Afecta a otras piezas (una línea cada una):**

- **Borne USB-A (#18):** el pico de 2,0 A estimado queda en la franja de 1 a 2,5 A que dan algunas fichas de contactos USB-A (5.4).
- **Rama de 5 V del Solo:** la guía no menciona un fusible por rama. Un cortocircuito en este cable (28 AWG) o en el borne no lo cortaría la fuente hasta corrientes muy por encima de lo que aguanta el hilo; no he comprobado el límite de sobrecorriente de la LRS-50-5.
- **SumUp Solo:** el manual dice no usarlo mientras carga y no cargar más de 12 h seguidas; la guía lo plantea como carga permanente. Dos cifras de temperatura de operación distintas en el manual (de −10 a +40 °C y de 0 a 40 °C).

## 8. Lo que no he podido verificar

- **El anuncio de Amazon:** marca, vendedor, calibre de los hilos, blindaje, si lleva datos, qué extremo es acodado y hacia dónde, longitud real, certificaciones. Amazon bloquea mi herramienta; el ASIN no aparece en otras webs.
- **El texto de la especificación USB Type-C (Release 2.5):** no puedo descargar el ZIP. Lo que cito (secciones 3.5.1, 3.5.2 y 3.6.1, Rp de 56 kΩ, 3 A) sale de la página de Google (Chromium), la de Zebra y un ECN de 2014 en una copia no oficial. La numeración puede haber cambiado.
- **Los valores de las Table 6-2 y 6-6 de USB 2.0** (calibres y resistencias): solo vi el índice; las cifras son de un artículo secundario.
- **Si el SumUp Solo usa BC 1.2** o cualquier otra detección de cargador, su corriente máxima de entrada y su tensión mínima: SumUp no los publica en lo que he podido abrir. Las páginas de ayuda de SumUp no cargaron contenido útil y el manual lo he leído en una copia de terceros.
- **Qué cable incluye el Solo** (A-C o C-C).
- **Corriente real del Solo cargando:** 0,8 y 2,0 A son estimaciones de la guía.
- **Las reseñas originales de Benson Leung** (Amazon) y el artículo de Ars Technica (bloqueado por la herramienta): solo conozco su contenido por TechSpot, HotHardware, PCWorld y otros.
- **Programa de certificación USB-IF** para cables A-C USB 2.0.
- **Disponibilidad en Amazon.es** de la placa breakout USB-C y del StarTech.
- **Dimensiones típicas del sobremoldeado** acodado (USB-A y USB-C) frente a la ranura de 14 × 9 mm.
- **Política de devolución de Amazon.es** y marcado CE/RoHS del anuncio.

## 9. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos).

Todos los enlaces, ordenados por tipo y con nota en los que no pude abrir, en [`enlaces.md`](enlaces.md).
