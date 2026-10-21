# Cable de red Schuko (CEE 7/7) a C13, 2 m

Une la toma de pared del bar con la base C14 de la máquina (pieza #15, con fusible e interruptor). Es lo único que conecta la máquina con la red de 230 V. El consumo de la máquina es de unos 14 W (0,1 A) según la guía de montaje; el pico de arranque de la fuente (unos 45 A) dura milisegundos.

- **Compra:** ASIN B00AOAJAUC, 7,00 € (precio de la hoja de componentes del 19-20-10-2026). Número 17 de la hoja.
- **Aviso:** Amazon bloquea el acceso a mi herramienta. **No he visto el anuncio.** No sé qué sección de cable, qué tipo de cable, qué marcas ni qué longitud real tiene este cable concreto. El precio y la referencia son los de tu hoja.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Los cálculos y las deducciones propias llevan la etiqueta "cálculo mío" o "conclusión mía". **Las normas IEC/EN son de pago y no he leído su texto**: las cifras de sección y longitud vienen de fabricantes (Schurter, Interpower) que las resumen. Está marcado donde importa.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales y normas](#3-documentos-oficiales-y-normas)
4. [Sección y tipo de cable: qué dice cada fuente](#4-sección-y-tipo-de-cable-qué-dice-cada-fuente)
5. [Integración en la máquina](#5-integración-en-la-máquina)
6. [Fallos, bugs y problemas conocidos](#6-fallos-bugs-y-problemas-conocidos)
7. [Qué comprobar al recibirlo](#7-qué-comprobar-al-recibirlo)
8. [Recomendaciones para el alcoholímetro](#8-recomendaciones-para-el-alcoholímetro)
9. [Lo que no he podido verificar](#9-lo-que-no-he-podido-verificar)
10. [Fuentes](#10-fuentes)

---

## 1. Resumen para el proyecto

- **A 0,1 A cualquier cable correcto sobra; el riesgo es de calidad, no de corriente.** Un cordón Schuko–C13 correcto es un cable H05VV-F de 3 hilos de 0,75 mm² (o 1,0 mm²), con enchufe CEE 7/7 y conector C13 de 10 A. Con 0,1 A, el calentamiento del cable es de ~1 mW (cálculo mío, [apartado 5.3](#53-calor-y-caída-de-tensión-a-01-a)). Lo que puede fallar es un cable con menos cobre del marcado, una tierra sin continuidad, un conector que se afloja o un cable al alcance del público.
- **Discrepancia con la premisa de partida: no he encontrado ningún límite de "2,5 A para 0,75 mm²" en IEC 60320.** Schurter (que resume la norma) da para un conector de **10 A** una sección mínima de **0,75 mm²** si el cable mide 2 m o menos, y **1 mm²** si es más largo. El "2,5 A" es una clase de conector (los de 2,5 A, tipo C5/C7: conocimiento mío) a la que también corresponde 0,75 mm², no un tope de corriente de ese cable. Detalle y contradicciones en el [apartado 4](#4-sección-y-tipo-de-cable-qué-dice-cada-fuente).
- **"2 m" es el límite exacto de la regla de 0,75 mm².** La longitud que cuenta es la visible entre los dos extremos, y los enchufes moldeados varían ±60 mm ([Schurter](https://schurter.com/en/knowledge/power-cords)). Un cable de "2 m" con 0,75 mm² puede estar formalmente 6 cm fuera de la regla. Con 1,0 mm² no hay duda. Para uso profesional con CE, la opción limpia es 3G1,0 mm² (es lo que usa Schaffner en sus cordones de red con bloqueo para Europa).
- **El C13 no tiene bloqueo y la guía lo trata como "anclaje".** El REBT (ITC-BT-43, apartado 2.5) admite un cable flexible "fijado al aparato por medio de un conector", pero también exige protegerlo contra la tracción y **prohíbe anudarlo o atarlo al receptor**. Atar el cable con bridas como único anclaje es dudoso con ese texto. Para vibración y tirones existen C13 con bloqueo que encajan en una base C14 normal (IEC Lock+, Schaffner IL 13: unos 200 N típicos).
- **La hoja de compra no dice sección, tipo de cable, marcas (VDE/ENEC, HAR) ni si el enchufe es acodado.** Hay que pedirlo al vendedor o comprobarlo al recibir ([apartado 7](#7-qué-comprobar-al-recibirlo)). No tengo datos de este anuncio, y por precio conviene comprobarlo: hay alertas de la UE y avisos de la ACI sobre cables de red con conductores finos o de cobre aluminizado, aunque **no he encontrado ninguno de un cordón C13 concreto**.
- **La polaridad de la pared es imprevisible** (Schuko reversible). Eso afecta a la protección del módulo C14 (#15), no a este cable. Aquí solo compruebo la identificación de colores y la continuidad pin a pin ([apartado 5.1](#51-polaridad-colores-y-continuidad-pin-a-pin)).

## 2. Especificaciones

Valores de referencia de un cordón correcto del tipo que describe la hoja. **No son los del anuncio concreto, que no he visto.**

| Característica | Valor | Fuente |
|---|---|---|
| Enchufe | CEE 7/7: híbrido con clips de tierra laterales (para tomas Schuko CEE 7/3) y un contacto hembra para el pivote de tierra de tomas CEE 7/5 (Francia/Bélgica) | [Wikipedia: CEE 7](https://en.wikipedia.org/wiki/CEE_7), [Wikipedia: Schuko](https://en.wikipedia.org/wiki/Schuko) |
| Patillas de fase y neutro | Ø 4,8 mm, 19 mm de largo, separación de 19 mm (cifras dadas para el CEE 7/4) | [Wikipedia: Schuko](https://en.wikipedia.org/wiki/Schuko) |
| Valor nominal del enchufe | 16 A, 250 V; DIN 49441 lo titula "16 A 250 V~" | [Wikipedia: CEE 7](https://en.wikipedia.org/wiki/CEE_7) |
| Corriente del enchufe según el cable | 10 A / 250 V con cable de 0,75 o 1,0 mm²; 16 A / 250 V con 1,5 mm² (ficha de un enchufe moldeado CEE 7/7) | [Signal & Power YP-23](https://www.signalandpower.com/collections/all/products/cee7-7-schuko-power-cord-plug-yp-23) |
| Norma del enchufe | DIN VDE 0620-1 (licencia VDE 40005197 en esa ficha); DIN 49441 | [Signal & Power YP-23](https://www.signalandpower.com/collections/all/products/cee7-7-schuko-power-cord-plug-yp-23), [Wikipedia: CEE 7](https://en.wikipedia.org/wiki/CEE_7) |
| Simetría | La toma Schuko es simétrica y sin polarizar: el enchufe entra de dos formas y la fase puede estar en cualquiera de las dos patillas | [Wikipedia: Schuko](https://en.wikipedia.org/wiki/Schuko) |
| Conector | C13 (clase I, con tierra), 10 A, 250 V | [Wikipedia: IEC 60320](https://en.wikipedia.org/wiki/IEC_60320), [Schaffner IL 13](https://docs.rs-online.com/3280/A700000015073926.pdf) ([copia local](datasheets/A700000015073926.pdf)) |
| Temperatura máxima de la patilla | 70 °C para C13/C14 (120 °C es de C15/C16) | [Wikipedia: IEC 60320](https://en.wikipedia.org/wiki/IEC_60320), [Schaffner IL 13](https://docs.rs-online.com/3280/A700000015073926.pdf) ([copia local](datasheets/A700000015073926.pdf)) |
| Alcance de IEC 60320-1 | Tensión asignada hasta 250 V c.a., corriente hasta 16 A. Ambiente de uso de −5 a +40 °C, con media de 24 h de hasta 35 °C | [Vista previa IEC 60320-1 ed. 3.0 (ANSI)](https://webstore.ansi.org/preview-pages/IEC/preview_iec60320-1%7Bed3.0%7Den.pdf) ([copia local](datasheets/preview_iec60320-1_ed3.0_en.pdf)) |
| Tipo de cable | H05VV-F: PVC, 300/500 V, tipo "ordinary duty" | [Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285), [BASEC](https://www.basec.org.uk/uploads/certificates/227-001-030.pdf) |
| Norma del cable | EN 50525-2-11 (2011). DIN la publica como DIN EN 50525-2-11:2012-01 y dice que sustituye a DIN VDE 0281-12 y 0281-5. Aviso mío: VDE 0281-5 es la versión alemana de HD 21.5 (conocimiento mío, no leído en la fuente) | [DIN Media](https://www.dinmedia.de/en/standard/din-en-50525-2-11/146332248) |
| Resistencia del conductor (3G0,75) | Máx. 26 Ω/km a 20 °C (clase 5). Para 3G1,0: 19,5; para 3G1,5: 13,3 | [Nexans](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485.html), [Multicomp Pro](https://cdn3.components.ru/pdf/902384.pdf) |
| Diámetro exterior (3G0,75) | Según fabricante: 6,0–7,6 mm (Helukabel), 6,8 mm nominal (Letronic), 6,47 mm (RS PRO), 7,6 mm (Nexans) | [Helukabel](https://shop.helukabel.com/us-en/h05vv-f-05vv-f-m29450/30125), [Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285), [RS PRO](https://uk.rs-online.com/web/p/power-cable/7756110), [Nexans](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485.html) |
| Peso y cobre (3G0,75) | Cable: 60 kg/km (Nexans, Letronic, Helukabel). Cobre: 21,6 kg/km (Letronic; Helukabel da el mismo "Cu factor") | [Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285), [Nexans](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485.html) |
| Tensión de prueba del cable | 2.000 V | [Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285) |
| Temperatura del cable | Letronic: −5 a +70 °C en movimiento, −30 a +70 °C fijo. Nexans (3G1,5): servicio máx. 60 °C, y 70 °C dentro de aparatos sin contacto con la piel; instalación mín. 5 °C | [Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285), [Nexans 3G1,5](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485/product~021121007~.html) |
| Colores de los hilos | Marrón, azul, verde-amarillo (Letronic cita VDE 0293 / HD 308) | [Multicomp Pro](https://cdn3.components.ru/pdf/902384.pdf), [Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285) |
| Radio de curvatura mínimo | Nexans (3G1,5): 6×D en movimiento, 4×D fijo. Multicomp: 8×D al flexionar. Para D = 7,6 mm: 30 a 61 mm (cálculo mío) | [Nexans 3G1,5](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485/product~021121007~.html), [Multicomp Pro](https://cdn3.components.ru/pdf/902384.pdf) |
| Longitud de un cordón | Es la longitud visible entre los dos extremos (EN 60320-1, cláusula 21, según Schurter). Los enchufes moldeados varían ±60 mm | [Schurter](https://schurter.com/en/knowledge/power-cords) |
| Consumo de la máquina | ~14 W, 0,1 A. Pico de arranque ~45 A | Guía de montaje §2.6, §3 (no verificado por mí: es de la ficha #14) |

## 3. Documentos oficiales y normas

Un cable de red no tiene "datasheet" propio: la ficha es la norma del cable, la del conector y la del enchufe, más el certificado del fabricante. **No he podido abrir el texto de ninguna de estas normas** (de pago). Enlazo las páginas oficiales, las vistas previas legales y las fichas de fabricantes que sí abrí.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Conectores de aparato (C13/C14) | IEC 60320-1 / EN IEC 60320-1:2021 (cancela EN 60320-1:2015) | Portada y vista previa | [Vista previa ed. 3.0 (ANSI)](https://webstore.ansi.org/preview-pages/IEC/preview_iec60320-1%7Bed3.0%7Den.pdf) ([copia local](datasheets/preview_iec60320-1_ed3.0_en.pdf)) · [Portada eslovaca de la edición 2021](https://normy.normoff.gov.sk/norma/134085/nahlad) |
| Cables flexibles de PVC (H05VV-F) | EN 50525-2-11:2011 (DIN EN 50525-2-11:2012-01) | Ficha de venta | [DIN Media](https://www.dinmedia.de/en/standard/din-en-50525-2-11/146332248) |
| Certificado de un fabricante de cable H05VV-F | BASEC 227/001/030 (caducó el 31-07-2021) | PDF | [Descargar](https://www.basec.org.uk/uploads/certificates/227-001-030.pdf) |
| Cables flexibles de PVC (IEC) | IEC 60227-5 (cables flexibles) | No abierto | Sin enlace: no lo he visto en ninguna página |
| Cables de goma (H05RR-F) | EN 50525-2-21 | No abierto | Sin enlace: no lo he visto en ninguna página |
| Cordones y cordones de interconexión | IEC 60799 | Vista previa bloqueada para mi herramienta (robots) | Sin enlace verificado |
| Enchufes y tomas | IEC 60884-1; DIN VDE 0620-1; DIN 49441; DIN 49440-1 | Solo citados por otras páginas | [Wikipedia: CEE 7](https://en.wikipedia.org/wiki/CEE_7), [Wikipedia: Schuko](https://en.wikipedia.org/wiki/Schuko) |
| Seguridad de aparatos | IEC 60335-1 (cláusula 25: conexión a la red y cables exteriores) | Solo su título, en el índice de la vista previa de la parte 2-82 | [Vista previa de IEC 60335-2-82 (ANSI)](https://webstore.ansi.org/preview-pages/IEC/preview_iec60335-2-82%7Bed2.1%7Db.pdf) ([copia local](../documentos-compartidos/normas/preview_iec60335-2-82_ed2.1_b.pdf)) |
| Máquinas recreativas y de servicio personal | IEC 60335-2-82:2024 (4.ª ed.) | Ficha y vista previa | [EVS](https://evs.ee/en/iec-60335-2-82-2024) · [Vista previa ed. 2.1 (ANSI)](https://webstore.ansi.org/preview-pages/IEC/preview_iec60335-2-82%7Bed2.1%7Db.pdf) ([copia local](../documentos-compartidos/normas/preview_iec60335-2-82_ed2.1_b.pdf)) |
| REBT, receptores | ITC-BT-43, apartado 2.5 | PDF | [Copia en plcmadrid.es](https://www.plcmadrid.es/wp-content/uploads/ITC-BT-43.pdf) ([copia local](datasheets/ITC-BT-43.pdf)) · [Normatia](https://normatia.com/es/normativa/rebt/2025/itc-bt-43-instalacion-de-receptores-prescripciones-generales/) |
| REBT, colores de conductores | ITC-BT-19, apartado 2.2.4 | PDF | [Copia en plcmadrid.es](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-19.pdf)) |
| Cordón con bloqueo IEC Lock (Schaffner/TE) | IL 13, IL 13 P, IL 19 | PDF | [Descargar](https://docs.rs-online.com/3280/A700000015073926.pdf) ([copia local](datasheets/A700000015073926.pdf)) |
| Conector hembra de aparato Schurter con muesca V-Lock (ilustra el principio; no es una base C14) | 6600-3, variantes con sufijo ".21" | PDF | [Descargar](https://www.schurter.com/pdf/english/typ_6600-3.pdf) ([copia local](datasheets/typ_6600-3.pdf)) |
| Base C14 de 10 A con V-Lock (Schurter), listada por Farnell | GSF1.1201.31.21 | Página de distribuidor | [Farnell](https://uk.farnell.com/v-lock-iec-power-cords) |
| Catálogo de cordones internacionales (Interpower) | Marcado, colores y diámetros | PDF | [Descargar](https://blog.interpower.com/hubfs/Interpower_March2018/Docs/intl-cord-set-config-darker.pdf) ([copia local](datasheets/intl-cord-set-config-darker.pdf)) · [Catálogo 2004](https://www.interpower.com/docs/6000_eem_2004.pdf) |
| Catálogo de International Configurations | Tabla "0,75 mm² a 6 A, 1,0 a 10 A, 1,5 a 16 A" | PDF | [Descargar](https://internationalconfigurations.com/docs/Catalog_CS09/CS09_12.pdf) |
| Ficha de H05VV-F (Multicomp Pro) | Resistencia y tabla por sección | PDF | [Descargar](https://cdn3.components.ru/pdf/902384.pdf) |
| Ficha de un cordón con C13 moldeado (RS PRO) | 3 × 0,75 mm², 10 A, IEC 60227 | PDF | [Descargar](https://www.farnell.com/datasheets/3179146.pdf) ([copia local](datasheets/3179146.pdf)) |

### Qué dicen los más relevantes

- **IEC 60320-1** (vista previa de la ed. 3.0): el alcance es hasta 250 V y 16 A. El índice tiene la cláusula 16 (fuerzas de inserción y extracción, con máxima en 16.2 y mínima en 16.3), la 22.2 (anclaje del cable en el conector, con ensayo de tracción en 22.2.3) y la Tabla 9 ("tipo y sección nominal de los cables"). **No pude ver ni las fuerzas ni la tabla.** La numeración puede haber cambiado en la edición de 2021.
- **EN 50525-2-11:** es la norma europea del H05VV-F. Según DIN, cubre cables de PVC flexibles de hasta 300/500 V "para la conexión de aparatos domésticos a la red fija". Sustituye a las partes de HD 21 que antes cubrían este cable ([DIN Media](https://www.dinmedia.de/en/standard/din-en-50525-2-11/146332248)). El certificado de BASEC la cita como "BS EN 50525-2-11:2011", con aislante tipo TI2 y cubierta tipo TM2, conductor de clase 5 de 0,75 a 4 mm² y marcado de origen más hilo trazador ([BASEC](https://www.basec.org.uk/uploads/certificates/227-001-030.pdf)).
- **ITC-BT-43, apartado 2.5** (texto en la [copia de plcmadrid.es](https://www.plcmadrid.es/wp-content/uploads/ITC-BT-43.pdf) ([copia local](datasheets/ITC-BT-43.pdf))):
  - el receptor se conecta "por intermedio de un cable apto para usos móviles";
  - para uso doméstico o análogo, el cable flexible debe estar "fijado permanentemente al aparato" o "fijado al aparato por medio de un conector";
  - los cables, a la entrada del aparato, "estarán protegidos contra los riesgos de tracción";
  - "No se permitirá anudar los cables o atarlos al receptor";
  - tensión asignada del cable: la de alimentación y "nunca inferior a 300/300 V";
  - sección: "no serán inferiores a 0,5 mm²";
  - clavijas conformes a UNE 20315 o UNE EN 50075.
- **ITC-BT-19, apartado 2.2.4:** neutro de color azul claro, protección de verde-amarillo, fases en marrón, negro o gris ([plcmadrid.es](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-19.pdf))). Es el código de colores de la instalación; los cordones usan el de HD 308 (marrón, azul, verde-amarillo).
- **IEC 60335-2-82:2024:** según EVS cubre máquinas recreativas y de servicio personal comerciales de hasta 250 V monofásicas; se basa en IEC 60335-1:2020. En el índice de la vista previa aparece la cláusula 25, "Conexión a la red y cables exteriores flexibles", pero **su texto no es visible**. Una máquina de este tipo probablemente cae aquí (así lo dice la guía §9); no lo he comprobado.

## 4. Sección y tipo de cable: qué dice cada fuente

La pregunta de partida era qué sección lleva un cable Schuko–C13 de 2 m y por qué. Las fuentes son fabricantes que resumen la norma; **ninguna es el texto de IEC 60320-1 ni de IEC 60799.**

| Fuente | Qué dice | Tipo |
|---|---|---|
| [Schurter](https://schurter.com/en/knowledge/power-cords) | Tabla por clase de conector: **10 A** (en frío): 0,75 mm² mínimo, cable 60227 IEC 53 o 60245 IEC 53. 16 A: 1 mm². 2,5 A: 0,75 mm² (0,5 mm² si el cable mide ≤ 2 m y es clase II). 6 A: 0,75 mm², cable 60227 IEC 52. Para cables de más de 2 m: 1 mm² con 10 A y 1,5 mm² con 16 A | Fabricante, resume la norma |
| [Interpower, hoja de configuraciones internacionales](https://blog.interpower.com/hubfs/Interpower_March2018/Docs/intl-cord-set-config-darker.pdf) ([copia local](datasheets/intl-cord-set-config-darker.pdf)) | Nota al pie: "Cord set may not exceed 2 meters on .75mm2 cable. Reference IEC 60320-1". La hoja aplica notas parecidas de 2 m a las filas de 1,0 y 0,5 mm² (no sé a qué corriente corresponde cada una) | Fabricante |
| [Machine Design, nota de Interpower (2006)](https://www.machinedesign.com/archive/molded-power-cords-danish-medical) | Cordones moldeados para equipos de hasta 10 A / 250 V: existencias de cable HAR de 0,75 mm² en 2,0 m y de 1,00 mm² en 2,5 m | Fabricante, nota antigua |
| [International Configurations, catálogo](https://internationalconfigurations.com/docs/Catalog_CS09/CS09_12.pdf) | "0.75 mm2 @6 Ampere, 1.0 mm2 @ 10 Ampere, 1.5 mm2 @ 16 Ampere" (cordones de 2,5 m y 1,8 m) | Fabricante |
| [RS PRO, cable 3G0,75](https://uk.rs-online.com/web/p/power-cable/7756110) | Corriente asignada del cable: 6 A | Distribuidor |
| [Schaffner IL 13](https://docs.rs-online.com/3280/A700000015073926.pdf) ([copia local](datasheets/A700000015073926.pdf)) | Cordones con C13 de 10 A, versión Europa: H05VV-F **3 × 1,00 mm²**; C19 (versión Europa): 3 × 1,50 mm² | Fabricante |
| [Signal & Power YP-23](https://www.signalandpower.com/collections/all/products/cee7-7-schuko-power-cord-plug-yp-23) | Enchufe CEE 7/7: 10 A con 0,75 o 1,0 mm²; 16 A solo con 1,5 mm² | Fabricante de enchufes |
| [Foro mikrocontroller.net](https://www.mikrocontroller.net/topic/356904) | Un usuario copia (de Sengpiel, no de la norma) una tabla de VDE 0100-520: aparatos hasta 2,5 A y cable ≤ 2 m: 0,5 mm²; aparatos hasta 10 A con conectores de hasta 10 A: 0,75 mm² | Foro, tercera mano |
| [ITC-BT-43](https://www.plcmadrid.es/wp-content/uploads/ITC-BT-43.pdf) ([copia local](datasheets/ITC-BT-43.pdf)) | Mínimo legal en España para cables de receptores: 0,5 mm² | Reglamento |

**Lectura mía:**

- Las fuentes coinciden en lo importante: **0,75 mm² es la sección mínima para un conector de 10 A si el cable no pasa de 2 m**, y 1,0 mm² si pasa. No he encontrado ninguna que ponga 2,5 A como tope de ese cable.
- La cifra de "2,5 A" que se manejaba al plantear la ficha aparece en la tabla de Schurter como **clase de conector**, no como límite de corriente de un cable de 0,75 mm². Es probable que viniera de ahí. **No puedo descartar que exista una tabla con esa cifra en el texto de la norma que no he visto**, pero ninguna fuente la apoya.
- Hay una diferencia de criterio entre fuentes: Schurter y la ficha de International Configurations permiten 10 A con 0,75 mm² hasta 2 m; el catálogo general de la misma empresa y RS PRO asocian 0,75 mm² a 6 A. Mi explicación: 6 A es la corriente del cable largo; el permiso de 10 A con 0,75 mm² vale solo para cordones cortos. **No resuelvo la diferencia**: faltaría el texto de IEC 60320-1 y de IEC 60799.
- Por qué se permite 0,75 mm² con 10 A en cordones de hasta 2 m: explicación mía, sin fuente. A ese largo la resistencia del cable es pequeña (0,104 Ω en el lazo de 2 m) y el calentamiento es limitado.
- **Tipo de cable:** para un conector de 10 A, Schurter pide el tipo 60227 IEC 53 (PVC) o 60245 IEC 53 (goma). El tipo 60227 IEC 52 se reserva a los conectores de 2,5 y 6 A. Según la designación armonizada, IEC 53 corresponde a H05VV-F (y 60245 IEC 53 a H05RR-F) e IEC 52 a H03VV-F (conocimiento mío, no leído en la fuente). Un comentarista del foro de [electrical-contractor.net](https://www.electrical-contractor.net/forums/ubbthreads.php/posts/215964.html) cree que a veces se usa cable ligero equivalente a H03VV-F en cordones C13, "contra la intención de IEC" (opinión, sin norma).
- **Para esta máquina** (0,1 A), tanto 0,75 mm² como 1,0 mm² a 2 m sobran de largo. Lo que importa es que el cable sea H05VV-F (o H05RR-F) y que la sección real sea la marcada.

### Marcado: qué debe ir impreso

Lo que he visto impreso en cable armonizado (no es la lista de la norma):

- Nexans imprime en la cubierta: nombre del fabricante, **◄HAR►** y **H05VV-F** ([Nexans](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485.html)).
- La marca armonizada **<HAR>** puede ir en la cubierta, en un hilo interior o con un hilo trazador ([Interpower](https://www.interpower.com/docs/6000_eem_2004.pdf)).
- Helukabel marca además la longitud en metros en la cubierta ([Helukabel](https://shop.helukabel.com/us-en/h05vv-f-05vv-f-m29450/30125)).
- BASEC certifica el cable con marca de origen y, opcionalmente, un hilo de color ([BASEC](https://www.basec.org.uk/uploads/certificates/227-001-030.pdf)).
- Los enchufes y conectores certificados llevan el logotipo del organismo (VDE, ENEC) y un número de licencia: p. ej. licencia VDE 40005197 en [Signal & Power](https://www.signalandpower.com/collections/all/products/cee7-7-schuko-power-cord-plug-yp-23) y certificado VDE 40017345 en el [conector 6600-3 de Schurter](https://www.schurter.com/pdf/english/typ_6600-3.pdf) ([copia local](datasheets/typ_6600-3.pdf)). El anuncio de un cordón CEE 7/7–C13 en Galaxus lista "ENEC10 y VDE" ([Good Connections](https://www.galaxus.de/en/s4/product/good-connections-mains-cable-earthing-contact-plug-type-ef-cee-77-angled-to-c13-straight-white-075-m-18210747)).

**No he podido leer el artículo de EN 50525-1 que fija qué es obligatorio imprimir.** Mi regla práctica (conclusión mía): al menos fabricante o marca de origen, **<HAR>** (o marca del organismo), "H05VV-F" y "3G0,75" (o 3 x 0,75). Si falta cualquiera, no vale como prueba de nada.

## 5. Integración en la máquina

### 5.1 Polaridad, colores y continuidad pin a pin

- **El Schuko es reversible.** El enchufe entra de dos formas y la fase puede estar en cualquiera de las dos patillas ([Wikipedia: Schuko](https://en.wikipedia.org/wiki/Schuko)). Por tanto, el hilo marrón del cordón puede ser fase o neutro en la pared. Qué implica para un fusible o un interruptor unipolar en el C14 se trata en la **ficha del módulo C14 (#15)**; aquí no lo repito.
- **Código de colores del cordón:** marrón (L), azul (N), verde-amarillo (PE). En cordones armonizados el código es el de HD 308 ([Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285)). Un cordón moldeado no deja ver los colores sin cortarlo: solo comprobarás la identidad por continuidad (apartado 7).
- **Tierra:** el CEE 7/7 tiene **clips de tierra a los dos lados del cuerpo y, además, un contacto hembra** para el pivote de las tomas francesas/belgas ([Wikipedia: CEE 7](https://en.wikipedia.org/wiki/CEE_7)). El cable debe llevar tierra a los tres puntos del enchufe y al pin de tierra del C13. Compruébalo con continuidad: clip izquierdo, clip derecho y contacto hembra, cada uno contra el pin de tierra del C13.
- **Posición de L y N en el C13:** el C13 es polarizado y con tierra ([Wikipedia: IEC 60320](https://en.wikipedia.org/wiki/IEC_60320)), pero **no he podido ver el dibujo de la norma** para indicar qué contacto es L y cuál N. Para el cordón no hace falta: solo hay que comprobar que cada patilla del enchufe va a un único contacto del C13 y que no hay cruces.
- **Tomas de pared sin tierra o mal cableadas:** si la toma del bar no tiene tierra o está mal cableada, la máquina (clase I) queda sin protección aunque el cordón esté perfecto. Comprueba cada toma con un comprobador de tomas antes de instalar (conclusión mía; no he buscado la normativa española sobre tomas sin tierra: **sin verificar**).

### 5.2 Tierra y el límite de 0,1 Ω de la guía

La guía §6 mide desde el pin de tierra del C14 hasta cada pieza metálica con un límite de 0,1 Ω. Ese camino **no incluye el cordón**. El hilo de tierra del cordón añade, como máximo según la norma del conductor, 52 mΩ más los contactos (cálculo mío: 26,0 Ω/km × 2 m). Es normal y no hay que corregir nada, pero hay que saber que el camino completo desde el clip del enchufe hasta la carcasa es un poco mayor que lo que mide la guía.

### 5.3 Calor y caída de tensión a 0,1 A

Cálculo mío con los valores máximos de la norma del conductor (26,0 Ω/km a 20 °C, [Nexans](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485.html)). Resistencia del lazo fase + neutro de 2 m: 2 × 52 mΩ = **0,104 Ω**.

| Situación | Potencia en el cable | Caída de tensión |
|---|---|---|
| 0,1 A (la máquina) | 1,0 mW | 10 mV |
| 0,061 A (14 W / 230 V, sin factor de potencia) | 0,4 mW | 6 mV |
| Pico de arranque de 45 A (milisegundos) | Energía ≈ 0,16 J con I²t = 1,5 A²s (valor de la guía §2.7) | 4,7 V al pico (2 %) |

- El calentamiento del cobre por el arranque es de ~0,014 K (cálculo mío: 28,8 g de cobre de fase y neutro). El cable no se calienta.
- Los contactos de enchufe y conector añaden resistencia (no tengo cifra de norma). Aun suponiendo 0,1 Ω por contacto, peor de lo normal (suposición mía), serían 4 mW con 4 contactos y 0,1 A. **Un contacto flojo o sucio puede dar un punto caliente con carga alta, pero con 0,1 A no hay riesgo térmico.** El problema de un contacto flojo en esta máquina es otro: cortes intermitentes de la red que reinician la fuente y la Pi (ver [apartado 6](#6-fallos-bugs-y-problemas-conocidos)).
- Como contexto: a 10 A (la corriente asignada del C13) el lazo de 2 m disiparía unos 10 W en el cable (cálculo mío). La máquina está a una centésima de eso.

### 5.4 Retención y vibración

La norma de los conectores (IEC 60320-1) define acoplamientos **sin bloqueo**: hay una fuerza máxima y una mínima de extracción (cláusula 16 en la ed. 3.0; **no vi los valores**). El C13 se saca si se tira del cable, a propósito. En un bar hay vibraciones, golpes de limpieza y tirones. Opciones:

| Opción | Cómo funciona | Encaja en una C14 genérica | Fuente |
|---|---|---|---|
| **IEC Lock+ / IL 13 (Schaffner/TE)** | C13 con un mecanismo interno que agarra el pin de tierra; se suelta con un deslizador. Fuerza de bloqueo típica 200 N (Schaffner) o 300 N (Scolmore LOCK+). Versiones recta, acodada hacia arriba y hacia abajo | Sí: "cualquier base IEC estándar" | [Canford](https://www.canford.co.uk/AC-MAINS-POWER-LEADS-IEC-LOCK+), [Schaffner IL 13](https://docs.rs-online.com/3280/A700000015073926.pdf) ([copia local](datasheets/A700000015073926.pdf)), [Argosy (Scolmore)](https://www.argosycable.com/product/lock-c13-updown-iec-connector), [Electropages](https://electropages.com/2022/08/innovative-iec-connector-two-locking-systems-power-connector-range) |
| **V-Lock (Schurter)** | Un pasador del conector entra en una muesca de la base; se suelta con una palanca amarilla. Mínimo 200 N de extracción | **No**: exige una base con muesca (sufijo ".21"; Farnell lista la GSF1.1201.31.21, C14 de 10 A) | [Farnell](https://uk.farnell.com/v-lock-iec-power-cords), [Schurter 6600-3](https://www.schurter.com/pdf/english/typ_6600-3.pdf) ([copia local](datasheets/typ_6600-3.pdf)) (conector hembra con la misma muesca) |
| **Bloqueos de tornillo o sin herramientas (Interpower)** | Abrazadera alrededor del C13 que se fija a la base | **Solo con bases de montaje con tornillos** | [Interpower](https://www.interpower.com/ic/designers/in-depth-product-line-information/More-information-on-Connector-Locks.html) |
| **Abrazadera de cable propia en el panel** | El cable queda sujeto a la carcasa para que el tirón vaya a la abrazadera y no al conector | Sí, es mecánica de la carcasa | Conclusión mía |
| **Bridas** | Atar el cable a un punto fijo | Sí, pero ver REBT abajo | ITC-BT-43 |

- **REBT:** ITC-BT-43 §2.5 dice que no se permite anudar los cables o atarlos al receptor ([copia en plcmadrid.es](https://www.plcmadrid.es/wp-content/uploads/ITC-BT-43.pdf) ([copia local](datasheets/ITC-BT-43.pdf))). Es una prohibición dirigida a quien sustituye un anclaje por un nudo. **Mi lectura: las bridas como único anclaje no son prudentes; una abrazadera diseñada para cable, o un conector con bloqueo, sí.** No he encontrado una interpretación oficial.
- Todos los bloqueos **grapan el C13 al pin de tierra o a la base**: antes de comprar 10 cordones, prueba uno en la base C14 del módulo #15, que es genérica y no he visto. Puede que el pin de tierra no tenga la forma o la tolerancia del estándar.
- Interpower avisa de que "un conector parcialmente acoplado podría causar un incendio", así que el C13 debe quedar del todo encajado, con o sin bloqueo ([Interpower](https://www.interpower.com/ic/designers/in-depth-product-line-information/More-information-on-Connector-Locks.html)).
- **Qué dice la guía:** "con una C14 el cable es desmontable y el propio conector C13 hace de anclaje" (§2.7). Es cierto en un sentido y engañoso en otro:
  - Cierto: el REBT admite el cable "fijado al aparato por medio de un conector" (ITC-BT-43 §2.5).
  - Engañoso: el "anclaje del cable" de la norma de conectores (IEC 60320-1, cláusula 22.2) es el agarre del cable *al conector*. Entre C13 y C14 solo hay fricción. Un tirón saca el conector. Está pensado así, pero en un bar es una desconexión probable, no un anclaje.

### 5.5 Cable acodado y pegar la máquina a la pared

- Existen enchufes CEE 7/7 acodados: por ejemplo, el cordón CEE 7/7 acodado – C13 recto de [Good Connections](https://www.galaxus.de/en/s4/product/good-connections-mains-cable-earthing-contact-plug-type-ef-cee-77-angled-to-c13-straight-white-075-m-18210747) (0,75 mm², 10 A; en el anuncio que abrí es de 0,5 m) y la familia de cordones con IEC Lock+ de [Canford](https://www.canford.co.uk/AC-MAINS-POWER-LEADS-IEC-LOCK+) con enchufe Schuko acodado en 1, 2, 3 y 5 m.
- Los C13 acodados con bloqueo (arriba/abajo) también existen ([Argosy, Scolmore LOCK+](https://www.argosycable.com/product/lock-c13-updown-iec-connector)).
- **Radio de curvatura** (cálculo mío con los datos de fabricante): 3G0,75 con D ≤ 7,6 mm necesita 30 mm (4×D, fijo) a 46 mm (6×D, movimiento) o 61 mm (8×D, flexión). Con un C13 recto, la máquina necesita unos 5–6 cm de espacio detrás del conector sin ningún tirón. Un C13 acodado hacia abajo, o un enchufe acodado en la pared, quita ese problema.

### 5.6 Cable de 2 m en una máquina pública

- La guía pone el C14 en la trasera, detrás del Solo. Aun así, **el cable es lo único accesible desde fuera**: se puede tirar, pisar, desenchufar para limpiar o cortar.
- Protecciones razonables (conclusión mía): llevar el cable pegado a la pared por detrás de la máquina; usar un enchufe acodado para que el cable no sobresalga; bloqueo en el C13; que el enchufe de pared no sea de libre acceso para el cliente. No hay nada de esto en una norma que haya podido leer.
- **EN 60335-1 y los tipos X, Y y Z:** esos tipos describen cómo se fija a un aparato un cable que forma parte de él. Un cordón desmontable que acaba en una base C14 no es "cable fijado al aparato"; el aparato lleva una base de conexión, no un cordón. **Es mi lectura; no he podido leer la cláusula 25 de IEC/EN 60335-1.** La vista previa de IEC 60335-2-82 solo muestra su título ("Supply connection and external flexible cords"). Las fichas de Schurter de sus bases C14 las describen como "diseñadas para aplicaciones según IEC 60335-1" (por ejemplo el [6100-3](https://store.comet.bg/download-file.php?id=17470), copia alojada por un distribuidor), pero eso no resuelve la cláusula 25.
- **REBT:** ver el apartado 3. Un conector que fija el cable al aparato es admisible; la protección contra tracción y la prohibición de atar siguen vigentes.

### 5.7 Enchufe moldeado o desmontable; ajuste en la toma empotrada

- **Moldeado (no rebobinable)** es lo habitual en los cordones baratos y es lo recomendable aquí: nadie puede quedarse con un hilo mal apretado ni cambiar el cable. Según Wikipedia, la mayoría de los enchufes Schuko moldeados modernos son híbridos CEE 7/7 ([Wikipedia: Schuko](https://en.wikipedia.org/wiki/Schuko)). La ficha de Signal & Power describe un CEE 7/7 completamente moldeado, con PVC y rango de −40 a +75 °C ([Signal & Power](https://www.signalandpower.com/collections/all/products/cee7-7-schuko-power-cord-plug-yp-23)).
- **Diámetro del cuerpo frente a la toma empotrada:** la toma Schuko tiene un rebaje de 17,5 mm de profundidad y unas muescas laterales no conductoras para enchufes pesados ([Wikipedia: Schuko](https://en.wikipedia.org/wiki/Schuko)). **No he encontrado el diámetro máximo del cuerpo del enchufe ni el diámetro del rebaje.** Los enchufes baratos de cuerpo grande a veces no entran del todo en tomas empotradas: es posible, no lo he podido comprobar. Un enchufe acodado de cuerpo bajo evita el problema.
- **Toma española:** ITC-BT-43 §2.5 pide clavijas conformes a UNE 20315 o UNE EN 50075. Que la toma habitual en España sea de tipo Schuko es conocimiento mío (no lo he leído en una fuente). El CEE 7/7 está pensado para encajar y hacer tierra en tomas Schuko CEE 7/3 ([Wikipedia: CEE 7](https://en.wikipedia.org/wiki/CEE_7)).

## 6. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Conductores más finos de lo marcado (sección real menor) | Alta |
| 2 | Cobre aluminizado (CCA) en lugar de cobre | Alta |
| 3 | Tierra sin continuidad o mal conectada | Alta |
| 4 | Conector C13 flojo o sin bloqueo | Media-alta |
| 5 | Cable ligero (tipo H03VV-F) en un conector de 10 A | Media |
| 6 | Cordón de más de 2 m con 0,75 mm² | Baja |
| 7 | Marcas VDE/ENEC o <HAR> falsas o ausentes | Media, sin datos |
| 8 | Cuerpo del enchufe demasiado grande para la toma | Baja-media, sin verificar |
| 9 | Polaridad invertida en la pared | Ver ficha #15 |
| 10 | PVC que se endurece | Baja, sin fuente |

### 6.1 Conductores más finos de lo marcado

Es el defecto documentado más repetido. Los casos que sí he podido leer:

- **Alertas de la UE (Safety Gate, antes RAPEX).** Tres alargaderas del informe 2021-50 llevan la frase "el cable dentro del cordón de red es demasiado fino": EMOS de 6 tomas y 5 m (A11/00109/21), ENTAC de 40 m (A12/01756/21) y Sky de 5 m (A11/00107/21). La cuarta alerta del mismo informe es una cadena de luces con el cable "demasiado fino" (A12/01742/21). Riesgo: sobrecalentamiento, quemaduras o incendio. Medida: retirada del mercado (en la de luces, rechazo en frontera). Ninguna da la sección en mm² ([informe 2021-50, copia en certifico.com](https://certifico.com/component/attachments/download/26654)).
- Semana 20 de 2020: dos cadenas de luces y un aparato de luz con el cable "demasiado fino" ([informe, copia en certifico.com](https://certifico.com/component/attachments/download/17947)).
- **A12/01404/20:** un cargador para scooters (YZPOWER-42): la sección de los conductores del cable de alimentación está por debajo del mínimo de la norma (EN 60228 y EN 60335); el producto se destruyó ([copia en una hoja de avisos del ayuntamiento de Bromley](https://bromley.gov.uk/leaflet/329531/22/680/d)).
- **Alerta de CEFTA:** una lámpara infantil con la sección de los conductores "por debajo del mínimo" y sin cifras ([CEFTA](https://transparency.cefta.int/ProductSafety/PublicReadOnly?id=647)).
- **Ninguna de estas es un cordón Schuko–C13**: son alargaderas, luces y cargadores. No he encontrado (ni buscado a fondo, por falta de presupuesto de búsquedas) una alerta de un cordón C13 de 0,75 mm². **Sin verificar para cordones C13.** No pude consultar CPSC, OCU ni Test-Achats.
- Mecanismo de fallo: una sección efectiva menor calienta más el cable. La ACI lo describe para hilos de CCA que se rompen al flexionar ([ACI](https://www.aci.org.uk/news/aci-warns-dangerous-turkish-flexible-cord)), y un resumen de la Universidad Sapienza señala que el daño mecánico reduce localmente la sección y puede dar calentamiento o arco ([Sapienza](https://iris.uniroma1.it/handle/11573/543411)).

### 6.2 Cobre aluminizado (CCA)

- La **ACI** (aci.org.uk, Reino Unido) avisó en 2018 de un cable flexible de PVC de 1,5 y 2,5 mm² marcado "Made in Turkey / Ermaks" con conductores de **cobre aluminizado**. Su resistencia superaba el máximo de las normas británica y europea; los de 2,5 mm² "apenas" alcanzaban la capacidad de un conductor de 1,0 mm². Los hilos de CCA se rompen con más facilidad al flexionar, con riesgo de pérdida de continuidad o de un punto caliente con arco ([ACI](https://www.aci.org.uk/news/aci-warns-dangerous-turkish-flexible-cord)). La ACI no da cifras de resistencia en esa nota.
- Estimación mía con la regla de mezclas (no es una fuente): un CCA con 10 % de cobre en volumen conduce ~65 % que el cobre, es decir, ~1,5 veces más resistencia (~70 mΩ por conductor de 2 m en vez de 46–52 mΩ) y pesa ~37 % de la masa del cobre en el conductor. Los porcentajes reales de cada fabricante son **desconocidos**.
- No he encontrado un caso de CCA en un cordón C13 concreto. **Sin verificar.**

### 6.3 Tierra sin continuidad o mal conectada

- Es un defecto lógico de un cordón mal montado: el hilo de tierra no llega al clip, al contacto hembra o al pin del C13. **No he encontrado una fuente con estadísticas ni casos de cordones C13**; lo trato como riesgo a comprobar siempre (apartado 7). Si la tierra falla, la carcasa metálica de la máquina queda sin protección: es el peligro más grave de esta pieza.
- La guía §6 pide medir 0,1 Ω hasta cada pieza metálica. Un polímetro vale como primera comprobación; la medida fiable usa 10–25 A, como dice la propia guía.

### 6.4 Conector C13 flojo

- Conector sin bloqueo (IEC 60320-1 define acoplamientos con fuerza máxima y mínima de extracción; ver [apartado 5.4](#54-retención-y-vibración)). En un bar hay tirones, golpes y limpieza.
- Un corte de red por un contacto flojo hace que la fuente LRS-50-5 arranque de nuevo (pico de ~45 A cada vez) y que la Pi pierda la alimentación sin apagarse: riesgo de corrupción de la tarjeta (ver fichas de la microSD y de la Pi). **Conclusión mía.**

### 6.5 Cable ligero en un conector de 10 A

El cable ligero (60227 IEC 52, equivalente a H03VV-F) está pensado para conectores de 2,5 y 6 A según [Schurter](https://schurter.com/en/knowledge/power-cords). Un foro lo cita como práctica extendida e incorrecta ([electrical-contractor.net](https://www.electrical-contractor.net/forums/ubbthreads.php/posts/215964.html)). Signal & Power dice que el CEE 7/7 acepta H03VV-F solo con 0,75 mm² ([ficha](https://www.signalandpower.com/collections/all/products/cee7-7-schuko-power-cord-plug-yp-23)). A 0,1 A no importa eléctricamente, pero el cable ligero tiene una cubierta más fina y es más fácil de dañar. Comprueba el diámetro.

### 6.6 Longitud frente a sección

El cordón de "2 m" con 0,75 mm² está en el límite de la regla de Schurter. Con ±60 mm de tolerancia por enchufe, podrías tener 2,06 m visibles. Con 1,0 mm² no hay problema. Impacto térmico a 0,1 A: nulo; impacto en el expediente CE: puede dar una pega formal.

### 6.7 Marcas falsas o ausentes

No he encontrado ninguna fuente sobre marcas falsas en cordones. Lo trato como riesgo a comprobar: el número de licencia VDE/ENEC debe poder buscarse en la base del organismo (no he abierto ninguna base de certificados: **sin verificar**). Una marca VDE sin número es sospechosa.

### 6.8 PVC que se endurece

Sin fuente. Los intervalos de uso dados por fabricantes son −5 a +70 °C en movimiento (Letronic) o instalación a 5 °C como mínimo (Nexans). En un bar interior con temperatura normal no es un caso de uso extremo.

## 7. Qué comprobar al recibirlo

Todo esto es **conclusión mía**, salvo lo que cito. Mientras no se enchufe a la red.

**A. A simple vista**

1. **Marcado del cable.** Debe verse impreso de forma duradera: fabricante, **<HAR>**, "H05VV-F" y "3G0,75" (o 3×0,75). Si pone "H03VV-F" o no pone nada, descártalo.
2. **Enchufe.** Cuerpo moldeado y completo, sin tapa ni tornillos; pines de Ø 4,8 mm, macizos y no huecos (criterio mío; las cotas son de CEE 7/4: 4,8 × 19 mm, separados 19 mm, según [Wikipedia](https://en.wikipedia.org/wiki/Schuko)); los **dos clips de tierra laterales** y el **contacto hembra** de tierra del CEE 7/7 ([Wikipedia](https://en.wikipedia.org/wiki/CEE_7)). Marcas de homologación con número en el cuerpo del enchufe y del conector.
3. **Longitud.** Mide la parte visible entre los dos extremos. Si pasa de 2 m con 0,75 mm², apúntalo.

**B. Medidas mecánicas**

4. **Diámetro exterior** de la cubierta con calibre: un H05VV-F 3G0,75 mide entre 6,0 y 7,6 mm según fabricantes (apartado 2). Por debajo de ~6 mm, desconfía.
5. **Peso por metro** (cálculo mío): corta 1 m de una muestra y pésalo. Un H05VV-F 3G0,75 pesa unos 60 g/m (Nexans, Letronic, Helukabel); la muestra con conductores de CCA pesaría ~14 g/m menos (cálculo mío con 10 % de cobre). Un cordón completo con enchufes pesa más: no sirve para comparar el cable.
6. **Hilos de una muestra cortada.** Corta un cordón de prueba del lote (no el que vayas a usar), pela un conductor y: cuenta los hilos y mide su diámetro (los de clase 5 son muy finos); rasca un hilo con una cuchilla: el cobre es rojizo por dentro, el aluminio es plateado; dóblalo varias veces, el CCA se rompe antes. El aislante del cable correcto debe ser PVC flexible.

**C. Medidas eléctricas (sin tensión de red)**

7. **Continuidad pin a pin**, con el cable desconectado:
   - Cada patilla del enchufe, a un único contacto del C13.
   - El clip de tierra izquierdo, el derecho y el contacto hembra, todos al pin de tierra del C13.
   - Sin continuidad entre fase–neutro, fase–tierra y neutro–tierra.
8. **Resistencia de cada hilo, con método de 4 hilos** (conclusión mía). Un polímetro normal tiene unas décimas de ohmio de error en las puntas (estimación mía), más que los 52 mΩ que se quieren medir. Con una fuente de laboratorio en corriente constante de 2 A (baja tensión, sin red): mide la caída con un voltímetro aparte en las puntas del cable. Valores de referencia (cálculo mío, a 20 °C, 2 m):

| Cable | Resistencia por conductor | Lazo fase + neutro | Caída a 2 A en el lazo |
|---|---|---|---|
| 0,75 mm² de cobre, máx. según norma | ≤ 52 mΩ | ≤ 104 mΩ | ≤ 208 mV |
| 0,75 mm² real, cobre ideal (1/58 Ω·mm²/m) | 46 mΩ | 92 mΩ | 184 mV |
| 1,0 mm² de cobre, máx. según norma | ≤ 39 mΩ | ≤ 78 mΩ | ≤ 156 mV |
| 0,5 mm² de cobre (si el cable es más fino de lo marcado) | 78 mΩ | 156 mΩ | 312 mV |
| 0,75 mm² de CCA con 10 % de cobre (estimación) | ~70 mΩ | ~140 mΩ | ~285 mV |

   Las resistencias por kilómetro son de [Nexans](https://latrivenetacavi.nexans.com/en/products/industrial-and-logistics/industrial-Eca-class/H05VV-F38485.html) y [Multicomp Pro](https://cdn3.components.ru/pdf/902384.pdf); el de 0,5 mm² es proporcional (26 × 0,75 / 0,5). El factor de temperatura a 25 °C es +2 % (cálculo mío). **El lazo medido incluye los contactos** del enchufe y del conector (decenas de mΩ en total, estimación mía), así que un resultado entre 104 y 140 mΩ no demuestra nada: compara con un cordón de marca conocida de la misma longitud, o mide el conductor de una muestra cortada.
9. **Aislamiento**, con un medidor de aislamiento de 500 V entre fase–neutro, fase–tierra y neutro–tierra del cordón desconectado: debe ser muy alto (megaohmios). No tengo una cifra de norma para citar. El cable H05VV-F se ensaya en fábrica a 2.000 V ([Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285)).

**D. Ya montado**

10. Enchufa el cordón en la base C14 del módulo #15 y comprueba que encaja de verdad (no suelto) y que, si es de los que bloquean, engancha el pin de tierra.
11. Mide la tierra de la toma de pared del bar con un comprobador de tomas **antes** de instalar la máquina.

## 8. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Exige ficha al vendedor** (o descarta el anuncio) antes de comprar más de uno:
   - tipo de cable: **H05VV-F** (no H03VV-F);
   - sección real: **3G0,75 mm²** mínimo (3G1,0 mejor, y obligatorio si hay dudas con los 2 m);
   - conductor de **cobre** (clase 5, IEC 60228), con resistencia ≤ 26 Ω/km;
   - enchufe **CEE 7/7 moldeado** con número de licencia VDE/ENEC y conector C13 con la misma marca;
   - declaración UE de conformidad (Directiva de baja tensión) y datos del fabricante;
   - cable con la marca **<HAR>** impresa.
   El anuncio de 7 € no tiene por qué darlo: si no lo da, trátalo como "sin garantía" y mide tú.
2. **Prefiere una marca con ficha y número de certificado** a un genérico. Marcas con ficha de fabricante que he visto: Schurter (cordones V-Lock, p. ej. 6051.2003 "Euro plug a C13, 2 m, 10 A 250 V" en [Farnell](https://uk.farnell.com/v-lock-iec-power-cords), en venta a unos 12 £ sin IVA; la ficha no dice si el enchufe es CEE 7/7), Schaffner/TE (IL 13, H05VV-F 3 × 1,00 mm² en Europa), Scolmore/Canford (IEC Lock+ con Schuko acodado, 3 × 1,0 mm² H05VV-F). No he investigado Lapp, Hylec, Qualtek ni Hellermann (me quedé sin presupuesto de búsquedas), aunque se pidió mirarlos.
3. **Para uso en bar**, el cordón recomendado es: H05VV-F 3G1,0 mm², enchufe CEE 7/7 acodado moldeado, C13 con bloqueo (IEC Lock+ o IL 13 si la base C14 genérica lo admite). La alternativa más barata es un cordón sin bloqueo + abrazadera de cable en la carcasa, no bridas atadas al aparato.
4. **Coordina la base C14 (#15) con el cordón**: un C14 genérico no tiene muesca V-Lock. Si quieres V-Lock, hay que cambiar la base por una Schurter ".21" u otra compatible (ver ficha #15).
5. **Antes de enchufar nada:** continuidad pin a pin con la tierra (apartado 7) y comprobador de la toma de pared.
6. **Lleva el cable protegido y fuera de alcance**: pegado a la pared, con enchufe acodado, y el enchufe de pared sin acceso fácil para clientes.
7. **Lleva repuestos** de la misma referencia (o la ficha de la referencia) por si hace falta cambiarlo en el bar, y apunta en la ficha de mantenimiento el lote y la fecha.
8. **Para el expediente CE:** documenta el tipo de cordón (tipo de cable, sección y longitud) en el manual y en la lista de materiales. La longitud de 2 m con 0,75 mm² es el único punto formalmente discutible; con 1,0 mm² desaparece.
9. **Pregunta a un electricista** sobre la cláusula 25 de IEC/EN 60335-1 y sobre el estado de la toma, como dice la guía para toda la parte de 230 V.

## 9. Lo que no he podido verificar

- **El anuncio de Amazon (B00AOAJAUC):** no lo abrí. No sé la sección del cable, el tipo, las marcas, el enchufe (acodado o recto), la longitud real ni si es moldeado.
- **El texto de las normas** (de pago): IEC 60320-1 (la tabla de secciones y longitudes, las fuerzas de extracción), IEC 60799, IEC 60227-5, EN 50525-1, EN 50525-2-11, EN 50525-2-21, IEC 60884-1, DIN VDE 0620-1, IEC 60335-1 (cláusula 25) e IEC 60335-2-82. Las cifras de sección y longitud son de fabricantes (Schurter e Interpower/International Configurations), no de las normas.
- **Que "2,5 A máx. para 0,75 mm²" no exista** en alguna tabla: solo digo que ninguna fuente que abrí lo apoya.
- **Cómo EN 60335-1 trata un cordón desmontable con base C14** (si hace falta algún requisito de anclaje): es mi lectura de los tipos X, Y y Z.
- **Alertas de cordones C13 de baja calidad:** no encontré ninguna específica. No consulté CPSC (EE. UU.), OCU, Test-Achats ni Stiftung Warentest. El presupuesto de búsquedas web se agotó (es compartido entre agentes). Las alertas que cito son de alargaderas, luces y cargadores.
- **Cifras de CCA:** son una estimación mía (regla de mezclas), no datos de fabricante.
- **Diámetro máximo del cuerpo del enchufe** y diámetro del rebaje de la toma Schuko/UNE 20315.
- **Posición de L y N en el contacto C13** (dibujo de la norma).
- **Fuerza de extracción** mínima y máxima del C13/C14.
- **Normativa española sobre tomas sin tierra** en bares o locales.
- **Guía IET de continuidad de tierra** (la citada en la guía): mi herramienta no pudo abrirla.
- **Marcas Lapp, Hylec, Qualtek y Hellermann:** no las investigué.
- **Si IEC Lock+ y IL 13 encajan en la base del módulo #15:** no vi esa base.
- **PVC que se endurece:** no encontré fuente.
- **Ninguna compra ni medida física:** todas las comprobaciones del apartado 7 son recomendaciones mías, no hechas.

## 10. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo, en [`enlaces.md`](enlaces.md).
