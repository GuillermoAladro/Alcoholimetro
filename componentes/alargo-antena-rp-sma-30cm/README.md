# Alargo de antena RP-SMA macho-hembra, 30 cm (2 unidades)

Cable coaxial corto con un conector RP-SMA "macho" en un extremo y un RP-SMA "hembra" de panel en el otro. Saca la antena Wi-Fi del adaptador USB AR9271 (#12), que va dentro de la caja de chapa, hasta el techo de la carcasa: el extremo macho se enrosca en el adaptador y la antena de 2 dBi se enrosca en el extremo hembra, que va atornillado al techo en un taladro de Ø6,5 mm (guía §4).

- **Compra:** ASIN B0FJRPC7MN, 9,99 € por 2 unidades (precio de la hoja de componentes del 19-20-10-2026; unos 5 € por unidad, cálculo mío).
- **Lo que dice la hoja del anuncio:** "RP-SMA macho-hembra, 30 cm (2 uds.)". Nada más: tipo de cable, tuerca, junta y grosor de rosca **no los conozco**.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mis herramientas, así que no he visto el anuncio: el precio y la referencia son los de tu hoja. Es una pieza genérica sin ficha del fabricante: lo que sigue es la norma de interfaz, los datos de cables y conectores equivalentes de fabricantes conocidos, y qué comprobar al recibirla. Hacia el final se agotó el presupuesto de búsquedas web de la sesión (ver [§7](#7-lo-que-no-he-podido-verificar)).

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Integración en el proyecto](#4-integración-en-el-proyecto)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Recomendaciones para el alcoholímetro](#6-recomendaciones-para-el-alcoholímetro)
7. [Lo que no he podido verificar](#7-lo-que-no-he-podido-verificar)
8. [Fuentes](#8-fuentes)

---

## 1. Resumen para el proyecto

- **"Macho" y "hembra" en RP-SMA se definen por la rosca, y el pin va al revés de lo que se espera.** Macho (plug) = rosca interior y hueco central. Hembra (jack) = rosca exterior y **pin central**. Esto contradice la suposición con que se planteó esta ficha ("jack sin pin central"): Wikipedia y la nota de aplicación de Taoglas coinciden. Por tanto el cable correcto lleva el macho en el lado del adaptador (que lleva un jack con pin) y el jack de panel en el lado de la antena (que lleva un plug con hueco); es lo habitual en Wi-Fi, pero ninguna fuente que leí lo dice expresamente. Wikipedia avisa de que algunas fuentes usan la convención opuesta, así que hay que comprobarlo con el cable en la mano antes de taladrar ([§4.1](#41-polaridad-y-qué-has-recibido)).
- **El cable casi no cuesta señal.** Con RG174, 30 cm pierden unos 0,5 dB a 2,4 GHz (dato de Taoglas a 2,34 GHz y cálculo mío). Con conectores, de 0,9 a 1,4 dB en total según el tipo de cable ([§4.3](#43-balance-de-enlace)). Es poco frente a dejar la antena dentro de una caja de acero, que es lo que la guía descarta.
- **Montaje en panel: rosca 1/4"-36 UNS-2A, agujero de Ø6,5 mm, par de 0,45 a 0,57 N·m.** Lo verifican la hoja de Würth y la ficha de Amphenol en RS; Fairview aporta el par ([§2.4](#24-interfaz-de-panel)). La guía acierta con Ø6,5 mm. **Falta un dato: el grosor del techo.** La guía no lo da; el "2,6 mm" de §2.5 es el solape del marco sobre el borde del Solo ((83,16 - 78) / 2 = 2,58 mm, cálculo mío), no el grosor de la chapa.
- **Lo que de verdad puede fallar en una máquina de bar:** la antena del techo se parte por palanca, la tuerca se afloja con la vibración, el agujero deja entrar líquido, y el cable corto entre la caja suspendida y el techo se dobla por debajo de su radio mínimo ([§5](#5-fallos-bugs-y-problemas-conocidos)).
- **Decisión de masa que la guía no ve:** el conector de panel toca el techo, que está a tierra de protección (guía §5.1). Eso probablemente une la malla del coaxial, y por tanto el 0 V del adaptador, con tierra, algo que la guía §5.2 dice que no se haga ([§4.5](#45-masa-y-tierra)).
- **Cumplimiento:** el alargo solo resta potencia. No he encontrado ninguna fuente que diga si añadir un alargo a un adaptador ya certificado obliga a reevaluar. La norma EN 300 328 incluye el cable y el conector en el "conjunto de antena" ([§4.7](#47-cumplimiento)).

## 2. Especificaciones

### 2.1 Lo que sé del producto concreto

| Dato | Valor | Fuente |
|---|---|---|
| Anuncio | RP-SMA macho-hembra, 30 cm, 2 unidades | Hoja de componentes, fila 13 de la guía §1 |
| Precio | 9,99 € (unos 5 € por unidad, cálculo mío) | Hoja de componentes |
| Función | Sacar la antena del adaptador AR9271 por el techo | Guía §2.9 y §4 |
| Tipo de cable (RG174, RG316, RG178, 1,13 mm...) | **Sin verificar** | No he visto el anuncio |
| Si "30 cm" es longitud entre extremos de conector | **Sin verificar.** Fairview mide así sus ensamblajes (de extremo a extremo de conector) | [Fairview FMC0212174LF](https://www.fairviewmicrowave.com/images/productPDF/FMC0212174LF.pdf) ([copia local](datasheets/FMC0212174LF.pdf)) |
| Tuerca, arandela, junta, longitud de rosca, planos "D" | **Sin verificar** | |
| VSWR, pérdida de inserción, fabricante | **Sin verificar** (un alargo genérico no suele publicarlos) | |

### 2.2 Los cuatro conectores: SMA y RP-SMA

Fuentes: [Wikipedia, SMA connector](https://en.wikipedia.org/wiki/SMA_connector) y [Taoglas, nota de aplicación APN-12-8-001](https://www.taoglas.com/wp-content/uploads/pdf/TAOGLAS-Reverse-Polarity-SMA-Application-Note-APN-12-8-001.A.pdf) ([copia local](datasheets/TAOGLAS-Reverse-Polarity-SMA-Application-Note-APN-12-8-001.A.pdf)). Coinciden en la tabla.

| Nombre | Rosca | Contacto central | Nombres equivalentes |
|---|---|---|---|
| SMA macho | Interior (tuerca giratoria) | Pin | SMA plug |
| SMA hembra | Exterior | Hueco (receptáculo) | SMA jack |
| **RP-SMA macho** | **Interior** | **Hueco** | **RP-SMA plug** |
| **RP-SMA hembra** | **Exterior** | **Pin** | **RP-SMA jack** |

- "Polaridad inversa" se refiere **solo al género del contacto central**, no a la polaridad eléctrica (Wikipedia y Taoglas).
- RP-SMA y SMA normal **no encajan** entre sí (Wikipedia). Qué pasa si se fuerzan: el pin choca con el pin y la rosca no cierra; es deducción mía, no la he visto en una fuente.
- Taoglas da una pista de identificación: mira primero la rosca (interior = plug, exterior = jack) y después el centro (pin = jack RP, hueco = plug RP). La nota tiene una errata: los pies de las figuras 3 y 4 no coinciden con su propia cuadrícula. El texto sí es coherente.
- Por qué existe RP-SMA: los fabricantes de equipos de 2,4 GHz lo usan para cumplir la sección 15.203 de la FCC, que impide al usuario conectar antenas de más ganancia (Taoglas; Wikipedia lo marca "citation needed"). Ver [§4.7](#47-cumplimiento).
- **En un equipo Wi-Fi normal, el equipo lleva el jack (rosca exterior y pin) y la antena lleva el plug (rosca interior y hueco).** Es lo habitual y lo que supone esta ficha, pero **ninguna de las fuentes que leí lo dice expresamente**. Se confirma desenroscando la antena del adaptador ([§4.1](#41-polaridad-y-qué-has-recibido)).

Qué debe llevar cada extremo del cable de este proyecto (deducción mía a partir de la tabla):

| Extremo | Va a | Debe ser | Rosca | Centro |
|---|---|---|---|---|
| A, "macho" | Conector del adaptador AR9271 | RP-SMA macho (plug) | Interior | Hueco |
| B, "hembra", de panel | Antena de 2 dBi | RP-SMA hembra (jack) de panel | Exterior | Pin |

### 2.3 Coaxiales candidatos

No sé qué cable lleva el anuncio. Estas son las opciones habituales con cifras de fabricante. Pérdida en 30 cm = atenuación por metro × 0,3 (cálculo mío).

| Cable | Ø exterior | Atenuación cerca de 2,4 GHz | 30 cm (cálculo mío) | Radio mínimo publicado | Fuente |
|---|---|---|---|---|---|
| RG174 | 2,79 mm | 53,0 dB/100 ft a 2,34 GHz (1,74 dB/m). A 1 GHz, 34,0 dB/100 ft | 0,52 dB a 2,34 GHz; unos 0,53 dB a 2,44 GHz (escalado por √f) | Belden: 28 mm (instalación). koax24: 14 mm una vez, 28 mm con flexión repetida. Prysmian: 5 × Ø (13,5 mm) sin carga, 10 × Ø (27 mm) con carga | [Belden 8216](https://www.mouser.lt/datasheet/3/6/1/8216_techdata.pdf) ([copia local](datasheets/8216_techdata.pdf)), [Taoglas CAB.T01](https://www.mouser.com/datasheet/2/398/CAB.T01-238242.pdf), [koax24](https://blog.koax24.de/en/tag/rg316-en/), [Prysmian](https://www.prysmian.com/sites/www.prysmian.com/files/media/documents/hf25e.pdf) |
| RG316 | 2,9 mm | 30 dB/100 ft a 1 GHz y 54,5 dB/100 ft a 3 GHz; **sin punto a 2,4 GHz** | Unos 0,48 dB (interpolación mía, con margen de unos ±2 dB/100 ft) | 15 mm (flexión repetida) | [Fairview RG316-DS](https://fairviewmicrowave.com/content/dam/infinite-electronics/product-assets/fairview-microwave/product-datasheets/RG316DS.pdf) ([copia local](datasheets/RG316DS.pdf)) |
| RG178 | 1,8 mm | 2,61 dB/m a 2,4 GHz | 0,78 dB | 10 y 18 mm, y 27 mm "dinámico" (las etiquetas salieron ambiguas) | [Huber+Suhner RG 178 B/U](https://shop.richardsonrfpd.com/docs/rfpd/hubersuhnerrg_178_budatasheet.pdf) |
| LMR-100A | 2,79 mm | 35,2 dB/100 ft a 2,0 GHz y 39,8 a 2,5 GHz | Unos 0,39 dB (interpolación mía) | 6,4 mm instalación, 25,4 mm repetido | [Times Microwave LMR-100A](https://www.mouser.com/datasheet/2/18/1/LMR_100A-1842100.pdf) |
| Micro-coaxial "1.13" | 1,13 mm | 3,2 dB/m a 2,4 GHz | 0,96 dB | 4,5 mm | [Delock 89608](https://www.tme.com/Document/9f18bac6f129c1d4cdbdfd13c1a69db6/DELOCK-89608_EN.pdf) |

Notas:

- **El RG174 está especificado por los fabricantes solo hasta 1 GHz.** La hoja de Belden termina en 1 GHz; Fairview da "DC a 1000 MHz"; koax24 lo recomienda hasta 1 GHz y el RG316 hasta 2,5 GHz. Taoglas, en cambio, publica su atenuación hasta 2,34 GHz y una impedancia de 50 ± 5 Ω de 10 MHz a 3 GHz (lectura probable: el texto extraído pierde el signo ± y el guion). Las cifras de Taoglas coinciden con las de Belden en las frecuencias en que ambas existen (por ejemplo 34,0 a 1 GHz), así que parecen copiadas de Belden. A 30 cm la diferencia importa poco.
- Mi escalado del RG174 por √f a 2,44 GHz sale en 54,1 dB/100 ft; como cota superior, escalando por f salen 55,3. Ambas dan 0,53 a 0,54 dB en 30 cm.
- Belden (8216): conductor central de acero cobreado (BCCS) de 26 AWG (7 × 34), dieléctrico de PE de 1,5 mm, malla de cobre estañado con 90 % de cobertura, funda de PVC de 2,79 mm. **El acero cobreado en el centro es normal en un RG174 auténtico**, no es señal de falsificación.
- El RG316 lleva dieléctrico de PTFE, conductor central y malla plateados y funda de FEP (Fairview), y trabaja de -55 a +200 °C. Un "RG316" con funda de PVC negra y malla estañada no sería lo que dice (deducción mía).
- Otra referencia de bajas pérdidas: un cable Delock RP-SMA plug a RP-SMA jack de 2 m, tipo CFD200, declara 0,55 dB/m a 2,4 GHz y 0,86 dB/m a 5,7 GHz, con 4,8 mm de diámetro ([Delock 88430](https://media.bechtle.com/asrc/180712/1c4b3d4ee288fc9434f5175bf56070570/c3/-/ffa136914a8e4f869f52ffe48a8401c7/antenna-cable-sma-rp-m-sma-rp-f-2m-data-sheet-1)). En 30 cm serían unos 0,17 dB (cálculo mío), pero un cable así de grueso no cabe en un recorrido apretado.
- Resistencia en continua de un RG174 de 30 cm (cálculo mío con Belden): conductor central 0,095 Ω (97 Ω/1000 ft) y malla 0,011 Ω (10,7 Ω/1000 ft). Taoglas da un máximo de 148,96 Ω/km para el conductor (0,045 Ω en 30 cm). Ambas cifras discrepan entre sí. **Un polímetro normal no distingue entre ellas.**

### 2.4 Interfaz de panel

| Característica | Valor | Fuente |
|---|---|---|
| Rosca del cuerpo | **1/4"-36 UNS-2A** (verificada) | [Würth 60311052111534](https://www.we-online.com/components/products/datasheet/60311052111534.pdf) ([copia local](datasheets/60311052111534.pdf)). Wikipedia: SMA tiene 1/4 de pulgada y 36 hilos por pulgada |
| Agujero de panel | Ø6,5 ± 0,05 mm. La hoja de Würth anota también "6 ± 0,05" y "5,85 flat" sin explicarlo | Würth |
| Agujero en RP-SMA hembra de panel de Amphenol (crimpado, para RG58) | **6,5 × 6 mm**. Son dos cotas: sugiere un agujero con plano (tipo "D"), inferencia mía | [RS, Amphenol RF RSMA6411A1-3GT50G-1-50](https://uk.rs-online.com/web/p/coaxial-connectors/7009574) |
| Grosor máximo de panel | Würth: 2,8 mm. Amphenol SMA6411A4 (SMA, no RP, crimpado para RG174/RG316): 3,2 mm | Würth; [Electrokit](https://www.electrokit.com/en/sma-hona-rg174-crimp) |
| Tuerca | El dibujo de Würth rotula "8 Hex" (la hoja no dice la unidad ni si es entre caras: probablemente 8 mm). El cuerpo del conector usa llave de 5/16" (7,94 mm) | Würth; Fairview; Wikipedia |
| Arandela | Arandela de bloqueo (Würth: latón, dorado sobre níquel). Delock incluye tuerca y arandela de bloqueo | Würth; [Delock 89919](https://www.tme.eu/Document/091f545f3eb67bc0de9b3b8997560ef5/DELOCK-89919_EN.pdf) |
| Junta | Junta de silicona roja en una de las hojas de Würth (60311082111559). Ambas piden el par indicado para alcanzar IP67 | Würth |
| Longitud de rosca en un cable de venta al público | 10 mm, con tuerca y arandela (Delock 89919, SMA hembra de panel con cable 1,13 mm) | Delock |
| Par de apriete del panel | 57 N·cm (0,57 N·m, unas 5 in·lbf) para alcanzar IP67 | Würth |
| Par de un ensamblaje SMA de latón (Fairview) | 4 in·lbf (0,45 N·m) | Fairview FMC0212174LF |
| Par de acoplamiento SMA (Wikipedia) | 3 a 5 in·lbf (0,34 a 0,56 N·m) en latón; 7 a 10 in·lbf (0,79 a 1,13 N·m) en acero inoxidable, con llave de 5/16" | Wikipedia |
| Ciclos de acoplamiento | 500 | Würth |
| Retención del contacto central | 26,7 N mínimo | Würth 60311082111559 |
| Impedancia | 50 Ω | Würth; Amphenol |

Los dos conectores de Würth son SMA hembra de PCB, no un conector de cable ni RP-SMA. Los uso solo como referencia de la interfaz de panel del SMA, que es la misma que usa el RP-SMA. **Lo que lleva tu cable concreto no lo sé.**

### 2.5 Pérdidas de los conectores y ROE (VSWR)

- Würth (conector de PCB, de 0 a 6 GHz): pérdida de inserción máxima 0,14 dB (una hoja) y 0,2 dB (la otra); VSWR máximo 1,3.
- Fairview, ensamblaje SMA macho a SMA hembra de panel con RG174: VSWR 1,35:1, **solo hasta 1 GHz** (su rango declarado).
- Cálculo mío de pérdida por desadaptación: VSWR 1,35 son 16,5 dB de pérdida de retorno y 0,10 dB de pérdida; VSWR 1,5, 14,0 dB y 0,18 dB; VSWR 2,0, 9,5 dB y 0,51 dB.
- **Un alargo genérico de Amazon no suele publicar ninguna de estas cifras.** No puedo decir cuál es la ROE de tu cable sin medirlo con un analizador de redes (VNA) que llegue a 2,5 GHz.

## 3. Documentos oficiales

No hay ficha del fabricante de este alargo. Estos son los documentos de piezas equivalentes de fabricantes conocidos, que fijan las cifras de referencia.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Taoglas, Reverse Polarity SMA Connectors (nota de aplicación) | APN-12-8-001 | PDF | [descargar](https://www.taoglas.com/wp-content/uploads/pdf/TAOGLAS-Reverse-Polarity-SMA-Application-Note-APN-12-8-001.A.pdf) ([copia local](datasheets/TAOGLAS-Reverse-Polarity-SMA-Application-Note-APN-12-8-001.A.pdf)) |
| Würth Elektronik, SMA hembra acodado THT (interfaz de panel, IP67) | 60311052111534 | PDF | [descargar](https://www.we-online.com/components/products/datasheet/60311052111534.pdf) ([copia local](datasheets/60311052111534.pdf)) |
| Würth Elektronik, SMA hembra acodado THT (la hoja que cita la junta de silicona) | 60311082111559 | PDF | [descargar](https://www.we-online.com/components/products/datasheet/60311082111559.pdf) |
| Fairview Microwave, ensamblaje RG174 SMA macho a SMA hembra de panel | FMC0212174LF | PDF | [descargar](https://www.fairviewmicrowave.com/images/productPDF/FMC0212174LF.pdf) ([copia local](datasheets/FMC0212174LF.pdf)) |
| Belden 8216 (RG174), datos técnicos | 8216 | PDF | [descargar](https://www.mouser.lt/datasheet/3/6/1/8216_techdata.pdf) ([copia local](datasheets/8216_techdata.pdf)) |
| Taoglas, especificación de ensamblaje con 100 mm de RG-174 (atenuación a 2,34 GHz) | CAB.T01 / SPE-12-8-153/B/WY | PDF | [descargar](https://www.mouser.com/datasheet/2/398/CAB.T01-238242.pdf) |
| Taoglas, mismo cable en otro ensamblaje | CAB.0101 | PDF | [descargar](https://taoglas.com/datasheets/CAB.0101.pdf) |
| Fairview Microwave, cable RG174 | RG174 | PDF | [descargar](https://www.fairviewmicrowave.com/content/dam/infinite-electronics/product-assets/fairview-microwave/product-datasheets/RG174.pdf) |
| Prysmian (Draka), cable RG174, 19-08-2008 | hf25e v1.0 | PDF | [descargar](https://www.prysmian.com/sites/www.prysmian.com/files/media/documents/hf25e.pdf) |
| Fairview Microwave, cable RG316 | RG316-DS | PDF | [descargar](https://fairviewmicrowave.com/content/dam/infinite-electronics/product-assets/fairview-microwave/product-datasheets/RG316DS.pdf) ([copia local](datasheets/RG316DS.pdf)) |
| Huber+Suhner, cable RG 178 B/U | RG178 B/U | PDF | [descargar](https://shop.richardsonrfpd.com/docs/rfpd/hubersuhnerrg_178_budatasheet.pdf) |
| Times Microwave, LMR-100A | 1842100 | PDF | [descargar](https://www.mouser.com/datasheet/2/18/1/LMR_100A-1842100.pdf) |
| Delock, cable de antena 1,13 mm (MHF I a MHF I, 20 cm) | 89608 | PDF | [descargar](https://www.tme.com/Document/9f18bac6f129c1d4cdbdfd13c1a69db6/DELOCK-89608_EN.pdf) |
| Delock, cable de antena SMA hembra de panel a MHF I, 1 m | 89919 | PDF | [descargar](https://www.tme.eu/Document/091f545f3eb67bc0de9b3b8997560ef5/DELOCK-89919_EN.pdf) |
| Delock, cable RP-SMA plug a RP-SMA jack, CFD200, 2 m | 88430 | PDF | [descargar](https://media.bechtle.com/asrc/180712/1c4b3d4ee288fc9434f5175bf56070570/c3/-/ffa136914a8e4f869f52ffe48a8401c7/antenna-cable-sma-rp-m-sma-rp-f-2m-data-sheet-1) |
| Taoglas, antena dipolo de cable 2,4 GHz (guía de distancia a metal) | CBD01.07.0100C | PDF | [descargar](https://www.taoglas.com/datasheets/CBD01.07.0100C.pdf) ([copia local](datasheets/CBD01.07.0100C.pdf)) |
| ETSI EN 300 328 V2.2.2 (banda de 2,4 GHz) | EN 300 328 | PDF | [descargar](https://www.etsi.org/deliver/etsi_en/300300_300399/300328/02.02.02_60/en_300328v020202p.pdf) ([copia local](../adaptador-wifi-ar9271/datasheets/en_300328v020202p.pdf)) |
| 47 CFR 15.203, requisito de antena (FCC) | 15.203 | Web | [eCFR](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-15/subpart-C/subject-group-ECFR1a3a8a3e4f5cd5e/section-15.203) |
| Amphenol RF, RP-SMA hembra de panel, crimpado (ficha en RS) | RSMA6411A1-3GT50G-1-50 | Web | [RS](https://uk.rs-online.com/web/p/coaxial-connectors/7009574) |

No hay declaración de conformidad, hoja de seguridad ni certificado de este alargo: es un accesorio pasivo genérico y no he visto nada del vendedor.

### Qué dicen los documentos más relevantes

- **Taoglas APN-12-8-001:** define el plug RP-SMA (rosca interior, hueco central) y el jack RP-SMA (rosca exterior, pin). Dice que RP-SMA se creó para que no se conectaran antenas profesionales de más ganancia a equipos comerciales y que hoy ambos tipos se venden libremente.
- **Würth 60311052111534 y 60311082111559:** son los únicos con dibujo de panel completo. Rosca 1/4"-36 UNS-2A, agujero de Ø6,5 mm, panel de hasta 2,8 mm, tuerca "8 Hex", par de 57 N·cm y IP67 solo si se respeta ese par. Una de las dos hojas cita además la junta de silicona. Son conectores de PCB, no de cable.
- **Taoglas CAB.T01:** recoge la atenuación del RG-174 a 100 MHz (8,4 dB/100 ft), 400 MHz (19,0), 900 MHz (31,0), 1 GHz (34,0), 1,8 GHz (49,4) y 2,34 GHz (53,0). **Taoglas CAB.0101** repite esa tabla y describe un ensamblaje de 100 mm con un SMA hembra de panel con O-ring, lo que muestra que existen versiones selladas.
- **Fairview FMC0212174LF:** par de 4 in·lbf, VSWR 1,35:1 hasta 1 GHz, funda de 2,59 mm, longitud medida de extremo a extremo de conector, temperatura de -20 a +80 °C. Ofrece "pruebas RF" opcionales para documentar el rendimiento, lo que marca la diferencia con un cable sin ficha.
- **Delock 89919:** cable de 1,13 mm con SMA hembra de panel, rosca de 10 mm y tuerca con arandela de bloqueo; 3,2 dB/m a 2,4 GHz.

## 4. Integración en el proyecto

### 4.1 Polaridad y qué has recibido

El anuncio dice "macho-hembra" a secas. Esa etiqueta es ambigua por tres motivos:

1. En RP-SMA el contacto central va al revés: el "macho" (plug) no tiene pin y la "hembra" (jack) sí.
2. Wikipedia avisa de que algunas fuentes usan la convención opuesta. Que el vendedor etiquete por el contacto central en vez de por la rosca es una hipótesis mía, no un dato.
3. El cable puede ser SMA estándar con la etiqueta equivocada.

**Prueba visual (sin herramientas), con el cable y el adaptador en la mano:**

| Mira | Extremo A (al adaptador) | Extremo B (a la antena) |
|---|---|---|
| Rosca | Interior (tuerca giratoria con rosca por dentro) | Exterior |
| Centro | **Hueco** (receptáculo) | **Pin** |

- Si el extremo A tiene rosca interior **y pin**, es SMA estándar y no encaja en el adaptador.
- Si el extremo B tiene rosca exterior **y hueco**, es SMA estándar y no encaja en la antena.
- Si A y B son los dos iguales (los dos con rosca interior o los dos con rosca exterior), no es un alargo para este uso.

**Prueba de encaje (la que manda):**

1. Desenrosca la antena del adaptador. Mira su conector: debe tener rosca exterior y un pin central (jack RP-SMA). Mira la base de la antena: rosca interior y hueco (plug RP-SMA). Si es al revés, esta ficha no se aplica a tu adaptador.
2. Enrosca el extremo A en el adaptador, a mano. Debe entrar suave y cerrar con un tope firme. Si queda un hueco de rosca sin cerrar, es pin contra pin: no fuerces (deducción mía).
3. Enrosca la antena en el extremo B, también a mano.
4. Hazlo **antes** de taladrar y de tirar el embalaje, por si hay que devolverlo.

**Prueba con polímetro (no sirve para saber el género, sí para saber si el cable está bien).** Con el cable desconectado, procedimiento mío:

| Medida | Debe dar |
|---|---|
| Pin o hueco central de A a pin o hueco central de B | Continuidad, menos de 1 Ω |
| Cuerpo de A a cuerpo de B | Continuidad, menos de 1 Ω |
| Centro de A a cuerpo de A, y centro de B a cuerpo de B | Circuito abierto (sin pitido) |
| Centro de A a cuerpo de B, y viceversa | Circuito abierto |
| Repite las dos primeras mientras doblas el cable y tiras de los conectores | La lectura no salta |

- No metas una punta gruesa en el hueco del plug RP-SMA: puede abrir el contacto. Usa un hilo macizo fino. **No tengo fuente para el diámetro del pin; no lo fuerces.**
- Un polímetro normal no distingue un cable bueno de uno malo en 2,4 GHz. Solo detecta cortes, cortos e intermitencias.

**Prueba funcional (mía):** con el adaptador conectado y la antena puesta, mide la señal con `iw dev wlan1 link` (o el nombre de tu interfaz) en el mismo sitio y con el cable puesto y sin él, promediando varias lecturas. Cabe esperar de 0,5 a 1,5 dB de diferencia (los cálculos de §4.3). Si baja de 3 dB, sospecha del cable.

### 4.2 Montaje en el techo

Datos de §2.4 y razonamiento mío:

- **Taladro:** Ø6,5 mm es lo que dan Würth y Amphenol, y es lo que pone la guía §4. Un agujero redondo de Ø6,5 mm admite tanto un cuerpo redondo como uno con planos.
- **Planos "D":** la ficha de Amphenol en RS da para su RP-SMA hembra de panel un agujero de 6,5 × 6 mm, que sugiere un plano (inferencia mía). Si tu conector tiene planos y el agujero es redondo, el conector puede girar al enroscar y desenroscar la antena y retorcer el cable. Mide el cuerpo roscado con calibre: si tiene un plano a unos 6,0 mm (el dibujo de Würth anota "6 ± 0,05" y "5,85 flat" sin explicarlo), lima un plano en el agujero. Si el cuerpo es redondo, no hace falta nada.
- **Grosor:** el conector debe tener rosca libre suficiente para el grosor de la chapa, más la arandela, más la tuerca, más lo que necesite la antena para engancharse. Mi cuenta orientativa para 2,6 mm (como referencia, no es el grosor del techo): 2,6 + 1 (arandela) + 2 (tuerca) = 5,6 mm, y el resto para la antena. La rosca de 10 mm de Delock sobra; una de 6 mm no. **Mide con calibre la rosca libre de tu conector y el grosor de tu techo antes de taladrar.** Grosor máximo de panel de las piezas que he visto: 2,8 mm (Würth) y 3,2 mm (Amphenol).
- **Orden habitual en un conector de panel de cable (mío, sin fuente):** el conector entra desde dentro, y la arandela y la tuerca van por fuera, de modo que la antena se enrosca en la rosca que sobresale por encima de la tuerca. Por eso la rosca libre debe cubrir chapa, arandela, tuerca y el enganche de la antena. Compruébalo con tu cable.
- **Par:** unos 0,45 a 0,57 N·m (4 a 5 in·lbf) con llave de 5/16" u 8 mm. No más: el SMA se estropea con facilidad al apretar de más (Siretta lo avisa; IntoFPV recoge la misma advertencia de usuarios).
- **Sellado:** con un agujero en la cara superior, un derrame se mete por la holgura entre rosca y chapa. Würth cita una junta de silicona y el par indicado para su IP67; Taoglas (CAB.0101) describe un SMA hembra de panel con O-ring. Un cable genérico puede no traer junta (sin verificar). Con la brida por dentro, ponle una junta o un O-ring entre la brida y la chapa, o una gota de silicona neutra. Siretta recomienda arandelas de seguridad y anillos de sellado donde haya vibración o intemperie.
- **Pintura:** la guía lija la pintura para la tierra (§6). Si quieres que el conector haga masa con el techo, una arandela dentada debería morder la pintura (mío, sin fuente); si no quieres, ver [§4.5](#45-masa-y-tierra).

### 4.3 Balance de enlace

**Datos de partida:**

- Potencia de salida del chip AR9271: **no la sé para tu adaptador.** Dos módulos con ese chip dan valores muy distintos: ThinkPenguin (TPE-N150USB, con antenas internas) especifica +16 dBm en HT20/HT40 hasta MCS5, +14 en MCS6 y +11 en MCS7 (tolerancia ±2 dB); SparkLAN (WUBA-171GN) especifica +21 dBm en HT20 MCS7 y +23 dBm en 802.11b (±2 dB). Uso 16 y 21 dBm como dos casos.
- Antena: 2 dBi (guía §2.9; sin verificar en el anuncio).
- Pérdida añadida por el alargo: cable (§2.3) más dos conectores adicionales a 0,15 dB cada uno (suposición mía a partir de los 0,14 y 0,2 dB máximos de Würth) más ≤ 0,1 dB de desadaptación (VSWR 1,35). Todo es cálculo mío.

| Cable | Pérdida del cable (30 cm) | Pérdida añadida total | EIRP con 16 dBm | EIRP con 21 dBm |
|---|---|---|---|---|
| Sin alargo (antena directa) | 0 | 0 | 18,0 dBm | 23,0 dBm |
| RG174 | 0,53 dB | unos 0,9 dB | 17,1 dBm | 22,1 dBm |
| RG316 | 0,48 dB | unos 0,9 dB | 17,1 dBm | 22,1 dBm |
| RG178 | 0,78 dB | unos 1,2 dB | 16,8 dBm | 21,8 dBm |
| Micro-coaxial 1,13 mm | 0,96 dB | unos 1,4 dB | 16,6 dBm | 21,6 dBm |

Qué se deduce (cálculo mío):

- El alargo resta **de 0,9 a 1,4 dB** en transmisión. En recepción empeora la sensibilidad en lo mismo (un atenuador pasivo tiene una figura de ruido igual a su pérdida: teoría general, sin fuente en esta ficha). La pérdida es **simétrica** en el enlace con el punto de acceso.
- Un dB menos equivale a un 11 % menos de alcance en espacio libre (10^(-1/20) = 0,89). En interior es más complejo, pero el orden de magnitud es el mismo.
- Sensibilidad típica del AR9271 (ThinkPenguin): -92 dBm en MCS0 HT20 y -73 dBm en MCS7. Con el alargo quedarían unos -91 y -72 dBm.
- **Un cable defectuoso (conector mal crimpado, malla discontinua) puede perder mucho más que lo que dice la tabla.** El balance solo vale para un cable sano.
- **Con 21 dBm de potencia y 2 dBi la EIRP supera los 20 dBm.** Eso no depende del alargo, que solo la baja, pero indica que conviene saber qué potencia da de verdad tu adaptador y qué dominio regulatorio usa el driver (ver [§4.7](#47-cumplimiento)).
- La alternativa (la antena de la Pi dentro de la caja de acero) la descarta la guía §2.1. Qué atenuación mete la caja no lo he medido ni lo he visto en ninguna fuente.

### 4.4 El techo de acero como plano de masa

Todo lo siguiente es teoría general; no he encontrado una nota de aplicación específica para una antena de 2 dBi sobre una chapa de acero. Dónde se mueve cada fuente:

- **Qué antena es:** 2 dBi se parece a un dipolo de media onda (2,15 dBi según Wikipedia). Una antena "rubber duck" suele ser un monopolo helicoidal acortado, con menos ganancia que uno de cuarto de onda (Wikipedia). **No sé cuál lleva el adaptador** (sin verificar).
- **Longitud de onda:** a 2,44 GHz son unos 12,3 cm; un cuarto de onda mide 3,1 cm y media onda, 6,1 cm (cálculo mío).
- **Plano de masa para un monopolo:** Wikipedia dice que debe extenderse al menos media longitud de onda (6,1 cm) desde el elemento; electronics-notes dice un cuarto (3,1 cm). Un plano menor inclina el lóbulo principal hacia arriba y baja la ganancia entre 2 y 5 dB (Wikipedia). El techo mide más que el Solo (83 mm, guía §2.5) y probablemente bastante más, pero no tengo las cotas. Si mide decenas de centímetros, cumple ambas cifras siempre que el taladro **no esté pegado al borde**: mi sugerencia es dejar al menos 6 a 7 cm hasta cualquier borde.
- **Dipolo cerca del metal:** Taoglas exige 15 mm de distancia a metal para su dipolo de cable y recomienda 54 mm de una superficie metálica grande para que la adaptación se parezca a la de espacio libre. Es para esa antena concreta y no para una de panel con rosca, pero indica que un dipolo pegado a una chapa se desadapta. Un usuario del foro de Pycom opina que un dipolo debería ser relativamente inmune a una caja de acero; es una opinión sin medida ([foro de Pycom](https://forum.pycom.io/post/18083)).
- **Orientación:** un dipolo vertical da cobertura omnidireccional en el plano horizontal y polarización vertical; su radiación cae a cero a lo largo del eje (Wikipedia). Mantenerla **vertical y recta** también es la recomendación de Taoglas ("tan recta como sea posible"). Una antena **horizontal pegada a la chapa** puede sufrir cancelación por la imagen (Wikipedia dice que un plano de masa refuerza o anula la señal según la altura; la conclusión para este caso es mía): evítala.
- **Si el punto de acceso del bar queda justo encima de la máquina**, está en el nulo de la antena vertical. En interior hay reflexiones, pero conviene probarlo (deducción mía).
- **Distancia a otras superficies metálicas:** Taoglas pide 15 mm de separación para su dipolo. Aplica a paredes o estantes metálicos cerca de la antena, no a la propia base sobre el techo.
- **Efecto del techo en el interior:** la chapa también separa la antena de la electrónica de debajo (razonamiento mío). No tengo cifras.

### 4.5 Masa y tierra

Lo que dice la guía:

- §5.2: la masa común es el -V de la fuente y "no hagas más uniones de masa".
- §5.1: el techo está soldado al cuerpo y por tanto a tierra de protección.

Lo que pasa con este conector (deducción mía):

- El cuerpo del conector de panel es la malla del coaxial. Si toca el techo, la malla queda unida a tierra de protección. En el otro extremo, la malla va al conector del adaptador USB, cuya masa de radio normalmente es la masa USB, es decir el 0 V de la Pi (esto último no lo he verificado).
- Resultado probable: **una unión 0 V - tierra de protección más**, por el cable de antena. No lo considero peligroso con un raíl de 5 V y sin otros cables externos a tierra, pero no tengo fuente: que lo mire el electricista que la guía ya recomienda para la parte de 230 V. Sí crea un lazo de masa que la guía no previó.
- Hay dos maneras de evitarlo: aislar el conector del techo (un conector aislado o arandelas de plástico, idea sugerida por un usuario del foro de Pycom) o aceptar la unión y medirla.
- Aislarlo deja la malla flotante en el techo, pero la antena sigue referida al adaptador por el propio coaxial.
- **Mide con el polímetro** continuidad entre el GND de 5 V y la tierra del chasis **antes y después** de montar el conector, y decide con eso. Está en tu mano; no hay fuente que lo resuelva.

### 4.6 Recorrido del cable

- **Radio mínimo:** para RG174 la cifra más prudente publicada es la de Belden, 28 mm (instalación). koax24 da 14 mm para una curva fija y 28 mm con flexión repetida. Para el 1,13 mm, Delock da 4,5 mm. Un arco de 90° con 28 mm de radio gasta unos 44 mm de cable (cálculo mío).
- **Longitud real:** si los 30 cm van de extremo a extremo de conector, quedan unos 25 cm de cable libre. La guía pone la Pi en la caja interior suspendida y el techo en la caja de arriba (guía §4): hay que comprobar en el 3D que el recorrido, con curvas de 28 mm y holgura para los muelles, cabe en esos 30 cm. **No tengo las cotas.**
- **Flexión:** la caja interior se mueve sobre muelles y el techo no. El cable hace de puente: déjale un seno con holgura y sujétalo con una brida a pocos centímetros del conector del adaptador (un usuario del foro de Peplink aconseja atar los cables unas pulgadas por detrás de los conectores).
- **Tensión sobre el conector del adaptador:** el conector de antena del adaptador USB es de PCB. Siretta señala el desprendimiento del conector de PCB por el par de la antena como fallo típico. El cable debe ir sujeto para no tirar de él.
- **230 V:** la funda del RG174 no es aislamiento de red. Belden da 1100 V como tensión nominal del cable y 30 V en su homologación UL AWM 1354. Mantén el coaxial **fuera del alcance** de los bornes de 230 V (el C14 y la fuente están en la misma caja de arriba), bien sujeto y separado.

### 4.7 Cumplimiento

**Lo que sé:**

- **UE:** la norma de la banda de 2,4 GHz que he leído es ETSI EN 300 328 V2.2.2 (no he comprobado si hay una versión más reciente). Define el "conjunto de antena" (cláusula 3.1) como la antena (integral o dedicada), su línea de alimentación (por ejemplo un cable coaxial) y, si los hay, su conector y conmutadores. Define la "antena dedicada" como antena desmontable que se evalúa junto con el equipo radio. Y la cláusula 4.3.1.2.3 (equipos FHSS) fija un límite de 20 dBm que se aplica a cualquier combinación de nivel de potencia y de conjunto de antena previsto. No he visto el apartado equivalente para equipos no FHSS (4.3.2.2.3 salió cortado).
- **EE. UU.:** 47 CFR 15.203 exige que la antena sea permanente o con acoplamiento único, y prohíbe el conector estándar de antena. RP-SMA es el recurso del sector para cumplirlo (Taoglas). Esto es de EE. UU. y no lo he visto trasladado a la UE.
- **El alargo no emite.** Solo atenúa. Nunca aumenta la EIRP del conjunto adaptador más antena.

**Lo que no sé:**

- **Si sustituir "antena directa" por "antena más alargo" obliga a reevaluar el adaptador**: no he encontrado ninguna fuente que lo diga. La definición de "conjunto de antena" de ETSI incluye el cable, así que un cambio de cable es técnicamente un cambio de conjunto de antena. Para el producto final, la guía §9 ya prevé la declaración de conformidad (RD 188/2016): ese expediente debería incluir el alargo y la antena exactos.
- **Qué certificación tiene tu adaptador AR9271**: es genérico. La ficha de ThinkPenguin solo cita RoHS y la de SparkLAN no lista ninguna. La del adaptador la hace otro agente (#12).
- **Límite español de potencia** (CNAF): no lo he buscado.
- **Que `WLAN Country ES` limite la potencia del driver `ath9k_htc`**: no lo he verificado.

Una línea que afecta a otra pieza: SparkLAN marca su módulo con el AR9271 como fin de vida y no recomendado para nuevos diseños. Es un dato del módulo concreto, no del chip en general ([SparkLAN WUBA-171GN](https://www.sparklan.com/product/wuba-171gn)); conviene vigilarlo en la ficha del #12.

### 4.8 Contraste con la guía de montaje

| Punto | Guía (`claude/guia-montaje-electrico.md`) | Fuente primaria o comprobación | Veredicto |
|---|---|---|---|
| Tipo de conectores | "RP-SMA macho-hembra" (§1 fila 13) | RP-SMA macho = plug (rosca interior, hueco); hembra = jack (rosca exterior, pin) (Wikipedia, Taoglas) | **Ambiguo en el anuncio**; comprobar por encaje ([§4.1](#41-polaridad-y-qué-has-recibido)) |
| Taladro de la antena | Ø6,5 mm para el RP-SMA, con su tuerca (§4) | Würth: Ø6,5 ± 0,05 mm, rosca 1/4"-36 UNS-2A. Amphenol en RS: 6,5 × 6 mm | **Coincide**; falta saber si el cuerpo lleva planos |
| Grosor de la chapa | "Marco de acero de 2,6 mm encima del borde" (§2.5) | (83,16 - 78) / 2 = 2,58 mm: es el solape del marco sobre el borde del Solo, no el grosor de la chapa (cálculo mío con las cotas de la guía) | **El grosor del techo no consta en la guía**; el máximo de panel que he visto es 2,8 mm (Würth) y 3,2 mm (Amphenol) |
| Antena | Desmontable de 2 dBi (§2.9) | No lo he podido ver en el anuncio del #12 | **Sin verificar** |
| Masa | Una sola masa común, "no hagas más uniones de masa" (§5.2); el techo está a tierra por soldadura (§5.1) | El conector de panel une la malla del coaxial con el techo | **Posible conflicto** ([§4.5](#45-masa-y-tierra)) |
| Longitud | 30 cm (§1 fila 13) | Depende del recorrido entre la caja suspendida y el techo | **Sin verificar** ([§4.6](#46-recorrido-del-cable)) |
| Normativa de radio | RD 188/2016 porque la Pi y el adaptador emiten (§9) | ETSI EN 300 328 incluye cable y conector en el conjunto de antena | **Coincide**; el alargo debe figurar en el expediente |

## 5. Fallos, bugs y problemas conocidos

**No he encontrado reseñas ni pruebas del anuncio B0FJRPC7MN ni estudios de alargos RP-SMA de Amazon.** Lo que sigue sale de documentación de fabricantes, foros y de piezas parecidas. Las comprobaciones son mías.

| # | Problema | Gravedad para el proyecto | Evidencia |
|---|---|---|---|
| 1 | Género o rosca equivocados (SMA estándar, o plug y jack invertidos) | Alta si pasa, y se detecta al recibirlo | Wikipedia; Taoglas |
| 2 | Rosca libre insuficiente para chapa, arandela, tuerca y antena | Media-alta | Deducción sobre Würth y Delock |
| 3 | Agujero redondo y conector con planos, o al revés | Media | Würth; Amphenol |
| 4 | Sin junta: un derrame entra por el taladro | Media | Würth; Taoglas; Siretta |
| 5 | Tuerca o conector que se afloja por vibración | Media | Foros Peplink e IntoFPV |
| 6 | Antena del techo partida o doblada por palanca | Media-alta | Deducción; Siretta (par sobre el conector) |
| 7 | Conector del adaptador USB arrancado por el par del cable | Media | Siretta |
| 8 | Cable con corte, intermitencia o corto (crimpado deficiente) | Media | Foro NanoVNA; Siretta |
| 9 | Cable que no es el que dice (RG174, RG316, 1,13 mm) | Baja a 30 cm | Datasheets |
| 10 | Radio de curvatura inferior al mínimo | Media | Belden; koax24 |
| 11 | Unión 0 V - tierra por el contacto con el techo | Media (decisión de diseño) | Deducción sobre guía §5.1-5.2 |
| 12 | Funda de PVC cerca de 230 V | Media | Belden (30 V UL) |
| 13 | Cumplimiento: cambio del conjunto de antena | Baja-media, sin fuente | ETSI |
| 14 | Techo de acero que desadapta la antena | Baja-media | Taoglas; Wikipedia |

### 5.1 Género o rosca equivocados

Ver [§4.1](#41-polaridad-y-qué-has-recibido). No he visto el anuncio, así que no puedo decir si usa la convención por rosca o por contacto. Por eso la prueba de encaje de [§4.1](#41-polaridad-y-qué-has-recibido) es obligatoria.

### 5.2 Rosca libre insuficiente

Los conectores de panel de venta al público tienen una rosca de longitud fija (10 mm en el Delock 89919) y el panel máximo de las piezas de Würth es de 2,8 mm. **El grosor del techo no consta en la guía.** Si la rosca es corta, la antena engancha solo uno o dos hilos y se suelta (deducción mía).

### 5.3 Planos "D"

La ficha de Amphenol en RS da para su RP-SMA hembra de panel un agujero de 6,5 × 6 mm, que sugiere un plano (inferencia mía). Si el cuerpo tiene planos y el agujero es redondo, el conector puede girar al montar y desmontar la antena; el cable se retuerce y el conector del adaptador sufre. Con un agujero en D y un cuerpo redondo, el conector no entra (deducción mía).

### 5.4 Sin junta

Würth declara IP67 en el panel si se respeta el par de 57 N·cm, y una de sus hojas cita la junta de silicona. Si el conector de tu cable lleva junta o solo tuerca y arandela, no lo sé (sin verificar para este anuncio). Tu techo es una superficie donde puede caer cerveza.

### 5.5 Aflojado por vibración

Peplink (enero de 2019): un usuario con 29 unidades vio cómo las tuercas de los conectores SMA se aflojaban y perdían la conexión celular, aunque llevaban arandela dentada. Un participante sugirió vibración del panel y propuso fijador de roscas, aisladores y arandelas tipo Nord-Lock; otro sugirió apretar a pocas in·lbf y atar los cables unas pulgadas por detrás de los conectores. Nadie confirmó el resultado en el hilo. IntoFPV (septiembre de 2020): usuarios discuten entre apretar poco, apretar con llave y el fijador de roscas, que alguno desaconseja porque el conector es parte de la masa de la antena. Son testimonios de foro, de otros equipos. ([Peplink](https://forum.peplink.com/t/pepwave-max-br1-mini-antenna-mounts-coming-lose/19708), [IntoFPV](https://intofpv.com/t-sma-connection-get-loose))

### 5.6 Antena partida por palanca

Es una deducción mía: la antena sobresale del techo de una máquina pública. Cualquier golpe o tirón actúa como palanca sobre el conector de panel. La mitigación es el par correcto, una antena que pueda inclinarse sin esfuerzo y, si el cliente la puede tocar, valorar la alternativa de [§6](#6-recomendaciones-para-el-alcoholímetro).

### 5.7 Conector del adaptador arrancado

Siretta cita como fallo típico el desprendimiento del conector de PCB por el par que le transmite la antena. En este proyecto el conector es el del adaptador USB, que puede torcerse si el cable cuelga sin sujeción.

### 5.8 Cable con corte o intermitencia

- Un autor de foro (John VE6EY) comprobó con un NanoVNA que **la mitad de sus cables** daba lecturas intermitentes y que muchos solo funcionaban hasta que se doblaban un poco. Eran cables viejos recuperados de televisión por cable, no RP-SMA. ([play.fallows.ca](https://play.fallows.ca/wp/radio/shortwave-radio/test-your-cables-regularly-with-nanovna))
- Siretta lista como fallos típicos las discontinuidades de contacto por transiciones del coaxial mal sujetas y la discontinuidad de masa en el paso por la caja. ([guía de diseño de Siretta](https://www.siretta.com/2026/02/rf-cable-assembly-design-guide/))
- Pruebas: [§4.1](#41-polaridad-y-qué-has-recibido).

### 5.9 Cable que no es el que dice

Datos para comprobarlo con calibre (sin saber lo que pone el anuncio):

| Cable | Ø exterior | Funda |
|---|---|---|
| RG174 | 2,7 a 2,79 mm | PVC negra (Belden, Prysmian, Fairview) |
| RG316 | 2,45 a 2,9 mm | FEP, tostada en Fairview |
| RG178 | 1,8 mm | FEP (Huber+Suhner) |
| 1,13 mm | 1,13 mm | |

A 30 cm las pérdidas de los cuatro tipos están entre 0,5 y 1,0 dB, así que el riesgo real no es la pérdida sino la calidad del crimpado y de los conectores. El diámetro no distingue RG174 de RG316 (ambos entre 2,5 y 2,9 mm); la funda y el aspecto de la malla (estañada o plateada) sí orientan (deducción mía).

### 5.10 Radio de curvatura

Ver [§4.6](#46-recorrido-del-cable). Siretta aconseja evitar radios cerrados y curvas bruscas para proteger la constancia de la impedancia y la vida del cable, y cita el daño por doblado como fallo típico del micro-coaxial. Para el RG174, Belden (28 mm) y koax24 (28 mm con flexión repetida) dan la cifra más conservadora.

### 5.11 Unión 0 V - tierra

Ver [§4.5](#45-masa-y-tierra).

### 5.12 Funda del coaxial cerca de 230 V

Ver [§4.6](#46-recorrido-del-cable). La homologación UL AWM 1354 del RG174 de Belden es de 30 V.

### 5.13 Cumplimiento

Ver [§4.7](#47-cumplimiento).

### 5.14 El techo de acero desadapta la antena

Ver [§4.4](#44-el-techo-de-acero-como-plano-de-masa). Sin medida no sé cuánto.

## 6. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Antes de taladrar**, haz la prueba de encaje de [§4.1](#41-polaridad-y-qué-has-recibido) con el cable, el adaptador y la antena reales. Si no encaja, devuélvelo.
2. **Mide tres cosas con calibre** al recibir el cable: el Ø exterior (§5.9), el Ø y los planos del cuerpo roscado (§4.2) y la rosca libre, y compárala con el grosor del techo. **Averigua el grosor del techo** (la guía no lo da).
3. **Prueba de continuidad y de intermitencia** con el polímetro ([§4.1](#41-polaridad-y-qué-has-recibido)) en las dos unidades. Una de ellas es tu repuesto: no la estropees con pruebas destructivas.
4. **Compara la señal** con y sin alargo con `iw dev wlan1 link`. Si el alargo pierde más de 3 dB, cámbialo.
5. **Taladro en el techo:** Ø6,5 mm, al menos 6 o 7 cm del borde, y plano en el agujero solo si el conector lo trae. Arandela de bloqueo y tuerca por fuera, a 0,45-0,57 N·m con llave de 5/16" o 8 mm, y una junta o un O-ring o silicona neutra bajo la brida.
6. **Decide la masa** ([§4.5](#45-masa-y-tierra)) midiendo 0 V frente a tierra antes y después de montar el conector.
7. **Antena vertical y recta**, sin doblarla sobre el techo. Prueba la señal con el punto de acceso en la posición real del bar.
8. **Sujeta el cable** con una brida a pocos centímetros de cada conector, con un seno que absorba el movimiento de los muelles, a más de 28 mm de radio y lejos del 230 V.
9. **Si el cable no cabe en 30 cm** (comprobarlo en el 3D), pide uno de 50 cm del mismo tipo en lugar de tensarlo.
10. **Si el cable de Amazon da problemas**, pasa a un ensamblaje de un fabricante que publique VSWR y atenuación (Fairview, Taoglas, Delock) o que documente pruebas RF (Fairview las ofrece como servicio opcional en sus ensamblajes). Cuesta más; el balance de enlace muestra que el cable no es el límite de alcance. No he comprobado que esos fabricantes tengan un RP-SMA macho a hembra de panel de 30 cm.
11. **Alternativa de diseño (mía, sin fuente):** si la antena del techo molesta, se parte o deja entrar líquido, una antena interna pegada tras una ventana de plástico, a más de 15 mm del metal (Taoglas), evitaría el agujero. Exigiría medir la señal.
12. **Cada máquina usa un alargo.** Las 2 unidades cubren una máquina más un repuesto, o dos máquinas sin repuesto. Apunta el ASIN y haz una foto del embalaje, porque el anuncio puede cambiar de proveedor sin cambiar de ASIN (precaución mía, sin fuente).

## 7. Lo que no he podido verificar

- **El anuncio de Amazon:** tipo de cable, longitud real, tuerca, junta, rosca, planos "D", marca, convención de género. Amazon bloquea el acceso.
- **Si el adaptador del #12 lleva un jack RP-SMA con pin** y la antena un plug con hueco. Es lo habitual, pero ninguna fuente de las que leí lo dice.
- **Potencia de salida y certificación del adaptador concreto.** Solo tengo dos módulos distintos con el mismo chip como orientación.
- **Grosor del techo.** La guía no lo da; los "2,6 mm" de §2.5 coinciden con el solape del marco sobre el Solo, (83,16 - 78) / 2 = 2,58 mm (cálculo mío). Si el grosor real también fuera 2,6 mm, estaría dentro de los 2,8 mm de Würth y los 3,2 mm de Amphenol.
- **Atenuación del RG174 exactamente a 2,4 GHz.** Solo hay datos de Taoglas hasta 2,34 GHz. Los valores de RG316 y LMR-100A a 2,4 GHz son interpolaciones mías.
- **VSWR del cable a 2,4 GHz.** Sin analizador de redes no se sabe.
- **Que un alargo pasivo exija reevaluar el equipo radio** (UE y España): sin fuente.
- **El límite español de potencia** (CNAF) y el efecto del dominio regulatorio `ES` en el driver.
- **Efecto del techo de acero sobre una antena de 2 dBi concreta:** solo teoría general y la hoja de un dipolo de otro fabricante.
- **Reseñas o pruebas de alargos RP-SMA de Amazon:** no las encontré; el presupuesto de búsquedas se agotó al final.
- **Páginas bloqueadas:** el blog de Pasternack sobre RP-SMA y las páginas y PDF de L-com y Pasternack (protección anti-robots). La página de Amphenol RF 132245 abrió sin datos de panel y el PDF de Amphenol SMA6411A4 llegó vacío.
- **Diámetro del pin central del SMA** (para sondear sin dañar el conector): no tengo fuente.
- **Qué atenuación mete la caja de acero a la antena interna de la Pi:** no la he visto en ninguna fuente.

## 8. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo y con nota de los que no pude abrir, en [`enlaces.md`](enlaces.md).
