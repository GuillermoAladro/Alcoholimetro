# Bornas de palanca WAGO 221, surtido de 75 (221-412, 221-413 y 221-415)

Regletas de palanca que reparten el raíl de 5,20 V. En cada máquina se usan **dos 221-415 de 5 polos**: una para +5 V y otra para GND. El polo 1 recibe el troncal de 0,75 mm² de la fuente y los polos 2 a 5 alimentan la Pi, el Solo, la pantalla y el sensor. Los 221-412 y 221-413 del surtido no se usan.

- **Dónde va (guía de montaje, §5.2):** LRS-50-5 (+V y −V) → troncal de 0,75 mm² con puntera → WAGO 221-415 (una por polaridad) → cuatro cargas.
- **Compra:** ASIN B09XB58ZXJ, 27,08 € por 75 unidades (precio de la hoja de componentes del 19-20-10-2026).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta, así que no he podido ver el anuncio: el precio y la referencia son los de tu hoja. El ASIN no aparece en ninguna otra web que haya podido abrir, así que **marca, vendedor, composición del surtido (cuántas de cada modelo) y autenticidad del lote son desconocidos**. La web de WAGO solo me abrió parcialmente (ver sección 3), y el PDF de WAGO en `wago.com` fue rechazado por la herramienta; leí dos copias de la hoja de datos alojadas por distribuidores.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales](#3-documentos-oficiales)
4. [Uso en el proyecto](#4-uso-en-el-proyecto)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Qué comprobar al recibirlas y al montar](#6-qué-comprobar-al-recibirlas-y-al-montar)
7. [Alternativas](#7-alternativas)
8. [Recomendaciones para el alcoholímetro](#8-recomendaciones-para-el-alcoholímetro)
9. [Lo que no he podido verificar](#9-lo-que-no-he-podido-verificar)
10. [Fuentes](#10-fuentes)

---

## 1. Resumen para el proyecto

- **Eléctricamente sobra de largo.** La hoja de datos de WAGO da 32 A y 450 V para el 221-415 (y 20 A / 600 V en la lista UL 486C). El pico de la máquina es de 5 A a 5,2 V (guía, §3), es decir, el 16 % de la corriente asignada. El 221 acepta cable multifilar de 0,2 a 4 mm² y flexible de 0,14 a 4 mm² **sin puntera**, así que el cable de 0,75 mm² y los hilos de 22 AWG (0,33 mm², cálculo propio) entran en el rango.
- **El riesgo real es de autenticidad, no de diseño.** En el mercado hay bornas "tipo WAGO" sin marca y copias. Big Clive (febrero de 2026) y GreatScott! (2022) han probado clones; Big Clive concluye que no deben ir en instalaciones permanentes. **No puedo ver el anuncio: no sé si tu lote es genuino.** Se comprueba al recibirlas (sección 6).
- **El precio del lote no es sospechoso por sí solo.** Encontré 221-415 anunciadas como WAGO a 0,50-0,60 € por unidad en packs de 25 de tiendas alemanas, la 221-413 a 0,35 € y la 221-412 a 0,28 € (precios con IVA alemán, sin envío). Un surtido de 25 + 25 + 25 saldría a unos 28-31 € a esos precios, y el tuyo es de 27,08 €. Esto no cuadra con la idea de que una 221-415 genuina cuesta 1-1,5 €: en las tiendas que abrí no es así (no miré distribuidores españoles). Ver 5.2.
- **No hay polo libre.** Un 221-415 tiene 5 puntos y el diseño usa los 5 (troncal + 4 cargas). El ventilador opcional de 40 mm de la guía (§0, riesgo 5) no tendría dónde conectarse; con el surtido tienes más bornas para añadir una.
- **Datos que se suelen citar y que no figuran en las hojas de WAGO que leí:** el rango de temperatura **−60 a +105 °C** (la hoja da 85 °C de ambiente, 105 °C de uso continuo y ningún límite inferior); el **certificado VDE** (la hoja de 2026 trae ENEC y UL, no VDE); y la norma **IEC 60947-7** (la hoja cita EN 60998). Ver sección 2.
- **Guía de montaje:** no da cifras de la WAGO, así que no hay cifra de la guía que contradecir. Lo comprobable es que usa solo la 221-415 y solo en 5 V: **confirmado**, no hay WAGO en el cableado de 230 V (§5.1 usa faston, ojales y punteras en la LRS).
- **Vibración: no he encontrado ninguna cifra publicada para el 221.** WAGO publica un vídeo ("Vibration-Proof Contact Quality…") y su laboratorio dice que hace ensayos IEC/EN 60068-2-6 en general. Conviene fijar las regletas a la chapa con los adaptadores 221-505 y poner descarga de tracción en los cables.

## 2. Especificaciones

Fuente principal: hoja de datos del 221-415 de WAGO, **versión "Stand 19.05.2026", 7 páginas, en alemán**, en una copia de [ottofischer.ch](https://www.ottofischer.ch/pim/1721f4dc-ce56-44e2-9334-09e62241dc1d/WAGO_221-415de.pdf) ([copia local](datasheets/WAGO_221-415de.pdf)) (leída). Segunda fuente: copia más antigua (06-04-2021, 8 páginas, emitida por WAGO Electronic (Tianjin)) en [LCSC](https://wmsc.lcsc.com/wmsc/upload/file/pdf/v2/lcsc/2106061734_WAGO-221-415_C2765050.pdf) (leída). Las dos son copias de distribuidores; **no pude abrir el PDF en `wago.com`** (ver sección 3). Donde difieren, lo indico.

| Característica | Valor | Fuente |
|---|---|---|
| Referencia | 221-415, GTIN 4055143234658 | Hoja 2026 y 2021 |
| Tipo | Borna de empalme de palanca ("COMPACT splicing connector"), 5 puntos de conexión, 1 potencial, entrada lateral, tecnología CAGE CLAMP | Hoja 2026 |
| Tensión asignada | 450 V (EN 60664); tensión de impulso 4 kV | Hoja 2026 |
| Corriente asignada | 32 A (EN 60664) | Hoja 2026 |
| Datos UL 486C | 600 V y 20 A, en la columna "Use Group C" (las columnas B y D van vacías) | Hoja 2026; la de 2021 da solo Use Group C |
| Categoría de sobretensión / grado de contaminación | La tabla de 2026 tiene tres columnas sin cabecera: categoría "III / III / II" y grado "3 / 2 / 2". Los 450 V, 4 kV y 32 A figuran solo en la **tercera: categoría II, grado 2**, que coincide con la hoja de 2021 y con [rlocman](https://www.rlocman.es/datasheet/data.html?di=537187) | Hojas 2026 y 2021 |
| Sección nominal | 4 mm² / 12 AWG | Hoja 2026 |
| Conductor macizo | 0,2 a 4 mm² (24 a 12 AWG) | Hoja 2026 |
| Conductor multifilar | 0,2 a 4 mm² (24 a 12 AWG) | Hoja 2026 |
| Conductor flexible (finos hilos) | 0,14 a 4 mm² (24 a 12 AWG) | Hoja 2026 |
| Con puntera | **La hoja no da un valor propio.** Dice que no hace falta tratar los conductores, "por ejemplo, con punteras" (cita corta traducida de la hoja alemana) | Hoja 2026 |
| Longitud de pelado | 11 mm (0,43 in) | Hoja 2026 y 2021 |
| Carcasa | Policarbonato (PC) transparente; elemento de maniobra naranja | Hoja 2026 |
| Grupo de material aislante / inflamabilidad | Grupo IIIa (2026); UL 94 V2 (2026 y 2021); carga de fuego 0,074 MJ (2026), 0,075 MJ (2021) | Hojas 2026 y 2021 |
| Material del contacto y del muelle | **No especificado** en las hojas (el "cobre electrolítico estañado" que se suele citar no figura) | Hojas 2026 y 2021 |
| Dimensiones (ancho × alto × fondo) | 30 × 8,4 × 18,6 mm (2026); 30 × 8,6 × 18,8 mm (2021); 29,9 × 8,3 × 18,6 mm en [rlocman](https://www.rlocman.es/datasheet/data.html?di=537187) | Tres fuentes, difieren décimas |
| Peso | 4 g (hojas 2026 y 2021); 4,048 g en rlocman | |
| Temperatura ambiente en servicio | 85 °C | Hojas 2026 y 2021 |
| Temperatura de uso continuo | 105 °C | Hojas 2026 y 2021 |
| Marcado de temperatura (EN 60998) | T85 | Hojas 2026 y 2021 |
| Límite inferior de temperatura | **No indicado** en la hoja de 2026. Un artículo comercial de LCSC Cables da −40 a +105 °C ([LCSC Cables](https://lcsccable.com/blog/?p=238), sin fuente primaria). **No he visto −60 °C en ninguna fuente** | Ver texto |
| Aprobaciones (hoja 2026) | CCA y ENEC 05, EN 60998, DEKRA (NTR NL-7990; 71-152284); cULus Listed UL 486C (E69654); UL 467 (E201573); ABS 23-2417173-PDA; LR LR2446364TA; PRS TE/1093/880590/23 | Hoja 2026 |
| Aprobaciones (hoja 2021) | CCA DEKRA (NTR NL-7642; 71-101731), ABS, DNV GL, LR, UL 467, UL 486C | Hoja 2021 |
| VDE | **No figura** en la hoja de 2026 | Hoja 2026 |
| Declaraciones de conformidad | UE y UK, de WAGO GmbH & Co. KG (la hoja las cita; no vi el enlace) | Hoja 2026 |
| País de origen | Alemania (DE) | Hoja 2021 |
| Puntos de prueba | Dos ranuras de prueba por borna, una en el sentido de entrada del conductor y otra en el lado opuesto, para puntas de medida estándar | [WAGO, serie 221](https://www.wago.com/gb/products/electrical-interconnections/discover-installation-terminal-blocks-and-connectors/221) |
| Accesorios compatibles | Puentes 221-941 y 221-942; adaptadores de montaje de la serie 221-500 (carril DIN o tornillo); 221-505, 221-515 y 221-525 para 5 polos (tornillo, horizontal o vertical) | Hoja 2021 |
| Estado del producto | Hoja con fecha 19-05-2026 (copia de ottofischer.ch). Un hilo de DigiKey de 15-10-2024 lo llama "obsoleto" en su catálogo (ver 5.2). Sin aviso de descatalogación de WAGO que haya podido abrir | Hoja 2026; [DigiKey TechForum](https://forum.digikey.com/t/alternatives-for-221-415-from-wago/45872) |
| Compra | ASIN B09XB58ZXJ, 27,08 € por 75 uds. (0,361 € por unidad, cálculo propio) | Hoja del usuario |
| Composición del surtido | **Sin verificar** (la guía solo dice "221-412, -413 y -415") | |

Notas:

- **Las dos hojas difieren** en los números de certificado y en las décimas de milímetro de las dimensiones. La de 2026 añade ENEC y PRS y quita DNV GL. Manda la más reciente, pero **ninguna es del propio `wago.com`**.
- **UL 486C (20 A, 600 V) y EN (32 A, 450 V) no se contradicen**: son dos listas de ensayo distintas, cada una con sus valores en la misma hoja (deducción mía). A 5 A y 5,2 V no importa cuál se use.
- **Las fuentes secundarias dan cifras de temperatura distintas.** SOS electronic (2014) dice "32 A / 450 V / 105 °C", mientras sus fichas de producto dicen 85 °C ([SOS electronic](https://www.soselectronic.com/articles/wago-high-currents-small-spaces-a-breeze-for-wago-221-1580)); es la misma diferencia entre "ambiente" (85 °C) y "uso continuo" (105 °C) de la hoja de WAGO. LCSC Cables da −40 a +105 °C sin citar fuente ([LCSC Cables](https://lcsccable.com/blog/?p=238)). La primaria (WAGO) no da límite inferior.
- **EN 60998**: la hoja cita la norma sin la parte. La página de laboratorio de WAGO nombra EN 60998-2-2 para el ensayo de extracción (ver la sección 3, laboratorio), que es la parte de las bornas sin tornillo (deducción mía). **No aparece IEC 60947-7 en las hojas del 221.**

## 3. Documentos oficiales

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Hoja de datos 221-415 en `wago.com` | Sin referencia (dirección vista en una tienda) | PDF | [datasheet](https://www.wago.com/de/products/datasheets/221-415.pdf?product=221-415&lang=de) (**no abierto**: la herramienta lo rechazó) |
| Hoja de datos 221-415, "Stand 19.05.2026", 7 págs. (copia de ottofischer.ch) | Artículo 221-415 | PDF, alemán | [descargar](https://www.ottofischer.ch/pim/1721f4dc-ce56-44e2-9334-09e62241dc1d/WAGO_221-415de.pdf) ([copia local](datasheets/WAGO_221-415de.pdf)) |
| Hoja de datos 221-415, 06-04-2021, 8 págs. (copia de LCSC) | Emitida por WAGO Electronic (Tianjin) | PDF | [descargar](https://wmsc.lcsc.com/wmsc/upload/file/pdf/v2/lcsc/2106061734_WAGO-221-415_C2765050.pdf) |
| Datos paramétricos 221-415 (rlocman) | di=537187 | Web | [ver](https://www.rlocman.es/datasheet/data.html?di=537187) |
| Página del producto 221-415 en WAGO (versión Reino Unido) | 221-415 | Web | [ver](https://www.wago.com/gb/installation-terminal-blocks-and-connectors/splicing-connector-with-levers/p/221-415) (sin pestañas de descargas en lo que pude leer) |
| Página de la serie 221 en WAGO | Sin referencia | Web | [ver](https://www.wago.com/gb/products/electrical-interconnections/discover-installation-terminal-blocks-and-connectors/221) |
| Instrucciones de manejo de la 221 en WAGO | "221 handling instructions" | Web | [ver](https://www.wago.com/us/221-handling-instructions) |
| Consejos de WAGO sobre punteras (no es específico del 221) | Sin referencia | Web | [ver](https://www.wago.com/de-en/building-technology/electrical-installers/helpful-tips/ferrules) |
| Laboratorio de ensayos de WAGO (vibración, choque, extracción) | Sin referencia | Web | [ver](https://www.wago.com/global/laboratory-tests) |
| Manuales / instrucciones del 221-415 en WAGO (páginas de búsqueda) | Sin referencia | Web | [instrucciones y seguridad](https://www.wago.com/de/search?text=221-415&f=%3Afacet_download_docCategory1%3ADL_13%3Afacet_download_docCategory2%3ADL_16%3AresultType%3Aall&sort=relevance&pageSize=20) · [hojas de datos](https://www.wago.com/de/search?text=221-415&f=%3Afacet_download_docCategory1%3ADL_13%3Afacet_download_docCategory2%3ADL_11%3AresultType%3Aall&sort=relevance&pageSize=20) (**no abiertas**, vistas en una tienda) |

> **Qué pude y qué no pude abrir.** De `wago.com` abrí siete páginas (producto 221-415 en versión Reino Unido y Canadá, serie 221 en Reino Unido y Canadá, instrucciones de manejo, consejos de punteras y laboratorio), pero **ninguna mostró las pestañas de descargas ni enlaces a PDF**. La herramienta rechazó tres direcciones: la página de producto de la versión global (la escribí de memoria, no salía de una búsqueda), el PDF de la hoja de datos en `wago.com` (visto en una tienda) y el folleto de la serie 221 en media.onlinecomponents.com. No los reintenté. **No he leído la hoja de instrucciones (instruction sheet) del 221-415 ni las declaraciones de conformidad**: no encontré su enlace directo. La propia hoja de 2026 pone `www.wago.com/221-415` en la cabecera de cada página; para bajar los documentos, usa la pestaña de descargas de esa página.

### Qué dicen los más relevantes

**Hoja de datos (2026)**

- Corriente asignada 32 A y 450 V según EN 60664; 4 kV de impulso. Para UL 486C: 20 A y 600 V.
- Rango de conductores 0,14 a 4 mm² (flexible) y 0,2 a 4 mm² (macizo y multifilar). Pelado de 11 mm.
- **Las punteras no son necesarias** (frase de la hoja, traducida). Tampoco se da un valor para "flexible con puntera".
- Temperatura ambiente 85 °C, uso continuo 105 °C, T85. Sin límite inferior.
- Material: carcasa de PC transparente. No dice nada del metal de la pletina ni del muelle.
- **No incluye** datos de caída de tensión ni de resistencia de contacto, ni ensayos de vibración, ni fuerza de extracción. (La de 2021 tampoco.)

**Instrucciones de manejo de WAGO (web, versión EE. UU.)**

- Pelar a 11 mm, con el indicador que lleva la borna en el lateral. Levantar la palanca, meter el cable y bajar la palanca. Para sacarlo, levantar la palanca y tirar. Rango 24-10 AWG para la serie. La página **no** dice cómo comprobar la inserción, ni nada de punteras ni de reutilización. ([WAGO](https://www.wago.com/us/221-handling-instructions))

**Consejos de WAGO sobre punteras (general, no del 221)**

- La puntera debe tener la longitud del pelado marcado en la borna. Una puntera con collarín de plástico puede reducir la sección máxima y no dejar que el conductor llegue al fondo. Crimpado hermético y paralelo a la superficie de contacto. ([WAGO](https://www.wago.com/de-en/building-technology/electrical-installers/helpful-tips/ferrules))

**Laboratorio de WAGO (general, sin cifras del 221)**

- Extracción según EN 60947-7-1 y EN 60998-2-2; vibración según IEC/EN 60068-2-6 en tres ejes; choque según IEC/EN 60068-2-27 (ejemplo típico 20 g, 11 ms); caída de tensión con esfuerzo de flexión según EN 60947-7-1 y EN 60999-1. La página **no menciona la serie 221** ni da resultados numéricos. ([WAGO](https://www.wago.com/global/laboratory-tests))

## 4. Uso en el proyecto

### 4.1 Circuito

Fuente: guía de montaje §1 (fila 20), §3, §4 y §5.2.

```
LRS-50-5 +V --(0,75 mm² + puntera)--> WAGO 221-415 "+5 V"  (5 polos, 1 potencial)
LRS-50-5 -V --(0,75 mm² + puntera)--> WAGO 221-415 "GND"
  polo 1  troncal (hasta 5 A de pico)
  polo 2  Pi            latiguillo micro-USB (22 AWG, <=15 cm)
  polo 3  Solo          0,75 mm² al borne USB-A (#18)
  polo 4  pantalla      0,75 mm² al borne USB-A (#18)
  polo 5  ZE29A         hilos de la clavija JST-XH (22 AWG)
```

- Todos los polos de un 221-415 son **el mismo potencial** (la hoja dice 5 puntos y 1 potencial): "polo 1" es solo una convención de la guía.
- La guía coloca la regleta "junto a la fuente", en la caja de arriba, que va **fija a la carcasa**. La caja interior suspendida no lleva regletas. Es decir, la WAGO no sufre el movimiento de los muelles (deducción mía), aunque sus cables a la Pi y al sensor sí van a la caja suspendida.
- Consumos de la guía (§3, ya marcados como estimaciones en parte): Pi 0,9 A típico y 2,0 A pico; Solo 0,8 A y 2,0 A (est.); pantalla 0,5 A; ZE29A 0,1 A (est.) y 0,5 A. Total ≈ 2,3 A típico y ≈ 5 A de pico.
- **Entran dos tipos de conductor:** 0,75 mm² con puntera (troncal y ramas del Solo y la pantalla) y 22 AWG desnudo (latiguillo micro-USB y clavija JST-XH). Cada uno va en **su propio polo** (la hoja habla de 5 puntos de conexión y 1 potencial). Que 22 AWG (0,33 mm²) y 0,75 mm² estén en la misma regleta no debería ser problema; que compartan polo, la guía no lo prevé y conviene no hacerlo (deducción mía).

### 4.2 Caída de tensión y calentamiento (cálculo propio)

**No hay cifra oficial de resistencia de contacto.** La hoja de datos no la da. Un artículo comercial dice "menos de 2 mΩ" y propone un objetivo de caída de tensión de 10 mV tras 2 horas a corriente asignada ([LCSC Cables](https://lcsccable.com/blog/?p=238)); es una fuente de un vendedor, sin método ni medición, así que **no la uso como dato**. Hago un análisis de sensibilidad.

Modelo: el cable del troncal entra en un polo (5 A de pico) y el de la carga sale por otro (el peor caso es la Pi, 2 A de pico). Se cuentan **dos contactos por riel** y **los dos rieles** (+5 V y GND). Se ignora la resistencia de la pletina interna.

| Resistencia por contacto (hipótesis) | Caída total en las dos regletas, Pi a 2 A | Caída total con 0,5 A | Calor en el contacto del troncal a 5 A |
|---|---|---|---|
| 0,5 mΩ | 7 mV | 6 mV | 12 mW |
| 1 mΩ | 14 mV | 11 mV | 25 mW |
| 2 mΩ | 28 mV | 22 mV | 50 mW |
| 5 mΩ | 70 mV | 55 mV | 125 mW |
| 10 mΩ (contacto malo) | 140 mV | 110 mV | 250 mW |
| 20 mΩ (contacto muy malo) | 280 mV | 220 mV | 500 mW |

- **Referencia:** el margen de la fuente de 5,20 V al umbral de subtensión de la Pi (4,63 V, según la guía §2.1) es de **0,57 V** para todo el camino. Un contacto sano (1-2 mΩ) gasta del 2 al 5 % de ese margen; un contacto malo (10 mΩ), el 25 %.
- **El cable pesa más que la borna.** 0,75 mm² de cobre a 0,0172 Ω·mm²/m son 22,9 mΩ/m. Un metro de ida y otro de vuelta a 5 A caen **unos 230 mV** (cálculo propio). Un metro de troncal pesa diez veces más que una borna en buen estado. Acorta el troncal.
- **La corriente pico es el 16 % de los 32 A** de la hoja (y el 25 % de los 20 A de UL). El calor a 5 A es de décimas de vatio incluso con un contacto malo. No es un problema térmico salvo que el contacto esté realmente flojo.
- **Efecto del multifilar de 0,75 mm² con puntera (deducción mía):** la puntera presenta una superficie lisa y maciza al muelle; un multifilar suelto presenta hilos finos que se pueden abrir. Con un crimpado hermético, la unión puntera-cable aporta muy poco; con uno defectuoso aporta más que la borna. Compruébalo con la caída medida (sección 6).
- **Dato de contexto, no del 221:** un usuario del foro de Mike Holt (FionaZuppa) midió una **222-412** (otra serie de WAGO) en el aire: el conector estaba a 86 °F con 19,7 A y a 102,7 °F con 30,7 A, y envuelto en aislante llegó a 163 °F con 30,3 A. Notó más resistencia que con un cable de prueba apretado, sin dar ohmios ([Mike Holt](https://forums.mikeholt.com/threads/wago-222-412-temp-tests.124069/latest)). Es otra serie y un solo aficionado: no lo uso como dato.

### 4.3 Montaje

1. **Pela 11 mm.** La borna lleva en el lateral un indicador de pelado ([WAGO, instrucciones](https://www.wago.com/us/221-handling-instructions)). Si usas puntera, que tenga la longitud del pelado marcado en la borna (consejo general de WAGO sobre punteras).
2. **Levanta la palanca del todo**, mete el cable hasta el fondo y baja la palanca hasta que quede plana. Hazlo así con cada polo.
3. **Comprueba por la carcasa transparente** que el cobre (o la puntera) llega al fondo y que no sobresalen hilos fuera de la entrada. (La carcasa es transparente según la hoja; el uso como comprobación visual es deducción mía.)
4. **Tirón suave** a cada cable (unos 10 N, "como levantar un kilo", orden de magnitud citado por un forero en un hilo sobre la prueba de extracción, [IET](https://engx.theiet.org/f/wiring-and-regulations/23796/wago-s-pull-test)). Un cable macizo puede retroceder un poco y se vuelve a empujar; un multifilar o con puntera no debería moverse. **El umbral de 10 N es de un foro, no de WAGO.**
5. **No mezcles polaridades en la misma regleta** (ver 4.5).
6. **Sujeta la regleta a la chapa** (adaptadores 221-505 de la lista de accesorios) y deja holgura y descarga de tracción en los cables.

### 4.4 Comprobación con el polímetro

Con la fuente apagada y los cables ya montados:

- **Continuidad entre cualquier par de polos de una misma regleta:** debe leer cerca de cero (resta la lectura de las puntas del polímetro juntas). Un valor claramente mayor delata un contacto malo o una borna falsa.
- **Entre las dos regletas** (+5 V y GND): debe haber **aislamiento** (sin continuidad). Si suena, hay un cortocircuito de cableado.
- **Con la fuente encendida y las cargas desconectadas:** 5,20 V entre la ranura de prueba de la regleta de +5 V y la de la regleta de GND (las ranuras de prueba de la hoja de WAGO; ver sección 2). Compara con los bornes +V y −V de la LRS: la diferencia es la caída del troncal y de sus contactos.
- **Con las cargas conectadas,** repite la medida y compara: la diferencia crece con la corriente. Es la suma de las caídas del troncal (22,9 mΩ/m, 4.2) y de los contactos. Se compara con la tabla 4.2.
- **Sentido correcto de cada hilo:** con la fuente apagada, confirma con continuidad que el hilo que va a "+" de la Pi, del borne del Solo y de la pantalla está en la regleta "+5 V" y no en la de GND.

### 4.5 Identificación de polos +5 V y GND

- La carcasa es transparente y la palanca naranja en todas las bornas: **la borna no distingue +5 V de GND**; el único código de color es el del cable que metes.
- La guía usa **rojo para +5 V y negro para GND** (cable 2 × 0,75 mm² rojo/negro, latiguillo micro-USB, hilos rojo y negro de la clavija JST-XH, §5.2). Respétalo en todos los polos.
- **Etiqueta cada regleta** ("+5 V" y "GND") con un rotulador permanente o etiqueta adhesiva, y colócalas en posiciones fijas distintas (por ejemplo, +5 V arriba y GND abajo, en el mismo orden en todas las máquinas). Es recomendación mía, sin fuente.
- **Antes de enchufar la Pi, la pantalla o el sensor, mide la polaridad** de cada polo con el polímetro (4.4). Una inversión de polaridad no tiene protección en la guía.

### 4.6 Reutilización

- La palanca se levanta para sacar el cable ([WAGO](https://www.wago.com/us/221-handling-instructions)), así que la borna se puede reabrir.
- **No he encontrado cifra de ciclos de reconexión** en las hojas. Un aficionado sospecha que el muelle pierda fuerza con el tiempo y la temperatura (hilo de Mike Holt sobre la 222, **opinión sin datos**).
- Para una máquina en serie, no reutilices la regleta que ha estado en una máquina con un problema; son baratas (sección 5.2).

### 4.7 Seguridad y normativa

- **5,2 V es baja tensión.** El riesgo para las personas es bajo; el riesgo es de incendio por un contacto flojo o de daño a los equipos por polaridad.
- **230 V:** la guía no usa WAGO en la red. §5.1 usa faston (C14), ojales (tierra) y punteras (bornes de la LRS). Verificado en la copia local de la guía.
- **Por rating, la 221 sí admite 230 V** (450 V en la hoja de WAGO), pero el diseño no lo necesita y no lo recomiendo aquí.
- **Marcado CE (guía §9):** si las bornas son genuinas, los certificados ENEC (EN 60998) y UL 486C de la hoja sirven de apoyo en el expediente. Un clon sin certificados lo debilita (deducción mía). Guarda factura, lote y hoja de datos de la pieza.

## 5. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Falsificaciones y clones sin marca | Alta si el lote no es genuino; sin verificar |
| 2 | Lote sin garantía de que sea genuino: se desconoce vendedor | Media |
| 3 | Polaridad invertida por falta de código de color | Alta si ocurre; fácil de evitar |
| 4 | Cable multifilar que no entra limpio o se abre | Media-baja |
| 5 | Puntera con collarín que no llega al fondo | Media |
| 6 | Palanca que se engancha con otros cables y se abre | Media-baja |
| 7 | Cables sin descarga de tracción | Media |
| 8 | Vibración (sin cifras del 221) | Media-baja |
| 9 | 5 polos exactos, sin polo libre | Baja (diseño) |
| 10 | Datos de temperatura contradictorios (el −60 °C no figura en WAGO) | Baja |
| 11 | Afirmación de que el 221-415 está "obsoleto" (DigiKey) | Baja |
| 12 | Sin protección por rama (la regleta no limita corriente) | Media-baja (diseño) |

### 5.1 Falsificaciones y clones (problema 1)

**Distinguir dos cosas.** Una *falsificación* copia la marca y el número de pieza. Un *clon sin marca* copia la forma pero no se anuncia como WAGO; en las tiendas, una búsqueda "wago 221" puede devolver los dos. Las fuentes que he encontrado hablan sobre todo de clones sin marca. No he encontrado un caso documentado de organismo (UL, TÜV, DEKRA…) contra un producto concreto; **la búsqueda no cubrió bases de datos de organismos**.

**Pruebas y publicaciones**

- **Big Clive, vídeo "There's a reason you should only use branded connectors" (24-02-2026).** Hackaday lo resume ([Hackaday, 01-03-2026](https://hackaday.com/2026/03/01/teardown-of-dangerous-fake-wago-connectors/)): algunos clones usan la propia **carcasa de plástico como parte de la estructura que sujeta los conductores**, y con el tiempo y el calor el plástico pierde tolerancias y las pinzas metálicas se aflojan. Conclusión de Clive: valen para una prueba rápida en el banco, **no para una instalación permanente**. La descripción del vídeo dice que los clones "no incluyen las características de seguridad primarias", enlaza dos anuncios de AliExpress y avisa de que probablemente no cumplen las normas nacionales ([vídeo](https://www.youtube.com/watch?v=RJoKmGda1bw); solo pude leer la descripción, **no vi el vídeo ni su transcripción**).
- **GreatScott!, "I tested 7 Wago Knock-Offs…" (10-04-2022).** Compró siete clones y los sometió a pruebas de resistencia, extracción, tamaño y precio, con un capítulo de certificados ([vídeo](https://www.youtube.com/watch?v=C8Xpjj47vgU), solo vi capítulos y descripción). Hackaday lo resume: los siete sirven para aficionados y pruebas cortas, pero solo los que llevan certificación independiente (por ejemplo VDE) inspiran confianza para instalar en vivienda ([Hackaday, 25-04-2022](https://hackaday.com/2022/04/25/testing-7-wago-like-wire-connectors-for-science-and-fire/)). **No tengo sus cifras.**
- **Foro IET (instaladores del Reino Unido), "unbranded fake wagos".** Un usuario encontró clones sin marca en una búsqueda de eBay por "wago 221" y dice que la diferencia visible es que **los clones no llevan texto negro impreso en las palancas naranjas**. Otro opina que "algunos fabricantes de clones tienen mal control de calidad, mientras que otros son muy buenos" y cita dos marcas, y un tercero responde que mientras cumplan la norma no ve problema ([IET](https://engx.theiet.org/f/wiring-and-regulations/21796/unbranded-fake-wagos)). Opiniones, sin ensayos.
- **Foro ipcamtalk.** Un usuario dice que las copias "se calientan rápido", tienen menos fuerza de retención y menos metal; **no da pruebas ni enlaces concretos** ([ipcamtalk](https://ipcamtalk.com/threads/anyone-out-there-tried-these-wago-connectors.76010/page-2)).
- **Foro Mike Holt (electricistas de EE. UU.).** Un usuario habla de proveedores que venden versiones sin listado y falsificaciones de cadenas de descuento y dice que lo práctico es pedir la documentación de listado; **nadie da un método visual** ([Mike Holt](https://forums.mikeholt.com/threads/wagos.2581369)).
- **Artículo de LCSC Cables** (vendedor, comercial): recomienda comprobar marcas de certificación en relieve que coincidan con la hoja de datos, carcasa de policarbonato y comprar a distribuidor autorizado; no da método de reconocimiento ([LCSC Cables](https://lcsccable.com/blog/?p=238)).

**Cómo reconocer una auténtica: lo que hay y lo que no**

| Rasgo | Estado |
|---|---|
| Carcasa transparente de policarbonato y palanca naranja | **Confirmado por la hoja de WAGO** (2026). No distingue por sí solo: los clones también lo hacen |
| Texto negro impreso en la palanca naranja | Dicho por un usuario del foro IET (opinión). **Sin verificar con foto de WAGO** |
| "WAGO" y número de pieza grabado en la borna | **Sin verificar**: no he visto una foto oficial ni una guía de WAGO para reconocer originales |
| Dimensiones: 30 × 8,4 × 18,6 mm | Hoja 2026. Las otras copias difieren en décimas (30 × 8,6 × 18,8 mm; 29,9 × 8,3 × 18,6 mm); una diferencia de más de 1 mm sería sospechosa (criterio mío) |
| Peso: 4 g | Hoja 2026 y 2021 (4,048 g en rlocman). Pesa diez a la vez en una báscula de 0,01 g y compáralo con una auténtica de referencia (idea mía) |
| Cobre electrolítico estañado | **Las hojas de WAGO no lo dicen** (no especifican contacto ni muelle). Sin verificar |
| Mecanismo (la pinza metálica sujeta el conductor, no el plástico) | Es el rasgo que Big Clive destaca; solo se ve abriendo la pieza. **No he visto fotos del interior de una auténtica** |
| Número de pieza, certificados y embalaje | **No he visto** un embalaje original ni una foto oficial de la pieza con su marcado. Sin verificar |

**Lo que sí puedes hacer con certeza:** comparar tus piezas con **una auténtica de referencia** comprada a un distribuidor con trazabilidad (ver sección 8), midiendo peso, dimensiones y aspecto, y hacer las pruebas de la sección 6.

### 5.2 Precio y lote (problemas 1 y 2)

Precios con IVA alemán y sin envío, vistos hoy en tiendas alemanas (las páginas no llevan fecha):

| Pieza | Precio | Por unidad | Tienda |
|---|---|---|---|
| 221-412, 100 uds. | 27,65 € | 0,28 € | [elektromax24](https://www.elektromax24.de/100-st.-wago-221-412-verbindungsklemme-2polig-compact-mit-hebel-transparent) |
| 221-413, 50 uds. | 17,55 € | 0,35 € | [elektromax24](https://www.elektromax24.de/50-st.-wago-221-413-verbindungsklemme-3polig-compact-mit-hebel-transparent) |
| 221-415, 25 uds. | 12,46 € | 0,50 € | [zaehlerschrank24](https://www.zaehlerschrank24.de/wago-klemmen-221-415.html) |
| 221-415, 25 uds. | 14,90 € | 0,60 € | [elektrikshop](https://www.elektrikshop.de/25-stk-compact-5-leiter-klemmen-mit-bet-hebel-221-415-wago.html) |
| Set de 25 + 25 + 25 (412, 413, 415), "original WAGO", Amazon.de Marketplace | 35,10 € | 0,47 € | [testsieger.de](https://www.testsieger.de/verbinder-und-klemmen/CA5U118871F93-genisys-wago-221-klemmen-set-25x-221-412-221-413-221-415-kabel-verbinder-in-der-wiederverschliessbaren-box-original-wago.html) (la página dice "original", **no lo verifica**) |
| **Tu surtido de 75 (hoja)** | **27,08 €** | **0,361 €** | Hoja del usuario |

- **A esos precios, 25 + 25 + 25 sueltas costarían entre 28,1 y 30,6 €** (cálculo propio, según la tienda de 221-415 que se elija). El surtido de 27,08 € queda al nivel del precio de las piezas sueltas, un 23 % por debajo del set de Amazon.de de la tabla.
- **Esto no cuadra con la idea de que una 221-415 genuina cuesta 1-1,5 € por unidad.** En las tiendas alemanas que abrí cuesta 0,50-0,60 € en packs de 25. Puede que 1-1,5 € sea el precio por unidad suelta o en distribuidores industriales; **no lo he comprobado**, y no he mirado distribuidores españoles.
- **Qué significa:** un precio de 0,36 € por unidad **no es prueba de falsedad ni de autenticidad**. Hay que ver la composición real (cuántas de cada) y el vendedor. Si el surtido es, por ejemplo, 50 de 221-412 y 10 de 221-415, el precio medio no es comparable. **Sin verificar: composición, vendedor, marca.**
- **Disponibilidad (problema 11).** Un hilo del DigiKey TechForum (15-10-2024) dice que el 221-415 "ha quedado obsoleto" y propone alternativas con números como 221-415/VE00-1000 y 221-425 ([DigiKey](https://forum.digikey.com/t/alternatives-for-221-415-from-wago/45872)). Es una nota sobre el catálogo de DigiKey, no de WAGO. La copia de la hoja de datos que leí lleva fecha **19-05-2026**, así que WAGO la documentaba en 2026. **Sin resolver:** no vi la página de producto de WAGO con su estado.

### 5.3 Polaridad invertida (problema 3)

Ver 4.5. Es el fallo más probable por error humano y el más caro: una inversión puede dañar la Pi, la pantalla o el sensor (deducción mía). La lista de la guía no incluye diodo de protección ni fusible por rama.

### 5.4 Cable multifilar y punteras (problemas 4 y 5)

- **WAGO dice que las punteras no son necesarias** en el 221 (hoja de 2026). El rango de flexible va de 0,14 a 4 mm².
- **Hilos finos que no entran limpios.** En un hilo de mikrocontroller.net, usuarios se quejan de que los hilos finos no entraban limpios y los retorcían a mano o los crimpaban juntos en una puntera; uno opina que retorcer es opcional ([mikrocontroller.net](https://www.mikrocontroller.net/topic/460755), 2018-2022, foro). En un hilo del IET sobre bornas rápidas en accesorios (no WAGO), alguien comenta que los hilos de un cable de 7 hilos pueden "abrirse hacia fuera dentro" de la borna y dar un contacto malo que no se ve ([IET](https://engx.theiet.org/f/wiring-and-regulations/23479/wago-s-conductor-preparation/93970)). **No he encontrado una fuente que describa aplastamiento o rotura de hilos sin puntera en un 221.**
- **Condiciones de WAGO para punteras en el 221, según un forero que las cita** ([mikrocontroller.net](https://www.mikrocontroller.net/topic/460755)): estañadas según DIN 46228, crimpado hermético de sección cuadrada, insertadas hasta el tope, hasta 2,5 mm² sin collarín y 1,5 mm² con collarín en la variante de 4 mm². **Es de segunda mano: no lo he visto en un documento de WAGO.** Si es cierto, 0,75 mm² con collarín está dentro.
- **Collarín de plástico:** WAGO advierte en general de que el collarín puede reducir la sección máxima e impedir que el conductor asiente del todo ([WAGO](https://www.wago.com/de-en/building-technology/electrical-installers/helpful-tips/ferrules)). **Prueba con las punteras reales del kit #28**: deben dejar la palanca plana y el cobre al fondo, a la vista.
- **Hilo de 22 AWG:** 0,33 mm² (cálculo propio) está dentro del rango de 0,14 a 4 mm² de la hoja. **No he encontrado informes de que la palanca no cierre con hilo fino.** La hoja solo admite conductor de cobre ("Kupfer"); si el cable barato fuera de otro material (aluminio cobreado), no estaría dentro de la hoja. Es una observación general mía, sin fuente; se comprueba al pelar.
- **Cable con aislante grueso:** no he encontrado fuentes. El aislante no debe entrar en la abrazadera: el pelado de 11 mm y la comprobación por la carcasa transparente sirven para esto (sección 6).
- **Mezclar 22 AWG y 0,75 mm² en la misma regleta:** no hay motivo para que falle, porque cada polo tiene su propio punto de conexión. Un distribuidor anuncia compatibilidad con "calibres mezclados" ([DigiKey, blog](https://www.digikey.com/en/blog/solve-splicing-problems-with-lever-wire-connectors), solo la descripción de la página; marketing).
- **Macizo vs multifilar:** en una prueba de tirón, a veces el hilo **macizo** retrocede un poco aunque queda sujeto; pasa menos con multifilar y flexible ([IET](https://engx.theiet.org/f/wiring-and-regulations/23796/wago-s-pull-test)). Un forero dice que solo usa la 221 con flexible porque en la clásica no conseguía meter el flexible. Aquí todo es multifilar.

### 5.5 Palanca que se abre (problema 6)

Un electricista advierte de que, al empujar los aparatos en una caja, **la palanca puede engancharse con un cable y abrirse**, y dejó de usarlas en neutros compartidos porque se aflojaban ([Mike Holt](https://forums.mikeholt.com/threads/wagos.2581369)). Es un caso de cajas de 230 V. En la máquina, la regleta va fija: mantén las palancas hacia el lado libre y los cables atados lejos de ellas.

### 5.6 Vibración (problema 8)

- **WAGO:** su laboratorio hace ensayos de vibración según IEC/EN 60068-2-6 (tres ejes) y de choque según IEC/EN 60068-2-27, **pero la página no cita el 221 ni da resultados** ([WAGO](https://www.wago.com/global/laboratory-tests)). La página de la serie 221 lista un vídeo de 39 segundos titulado "Vibration-Proof Contact Quality of the WAGO 221 Series Splicing Connector in the Test" ([WAGO](https://www.wago.com/ca-en/electrical-interconnections/installation-terminal-blocks-and-connectors/221)); el enlace al vídeo no figura en el texto que pude leer.
- **Resumen del vídeo según LAPP Australia:** la borna, montada en un soporte sobre una mesa vibratoria, mantiene la calidad de contacto "incluso con vibración de 2000 hercios". La página **no da norma, aceleración, duración ni medidas de resistencia** ([LAPP Australia](https://lappaustralia.com.au/en/wago-221-splicing-connector-vibration-test)). Vídeo enlazado: [youtube.com/embed/qIojOFLwqK4](https://www.youtube.com/embed/qIojOFLwqK4) (**no visto**).
- **Distribuidor SOS electronic (2014):** dice que sirven "dentro de motores, bombas y otros aparatos con posibles vibraciones", sin cifras ([SOS electronic](https://www.soselectronic.com/articles/wago-high-currents-small-spaces-a-breeze-for-wago-221-1580)). **Marketing.**
- **Aprobaciones navales** (ABS, LR, PRS) en la hoja de 2026. No he leído qué ensayos exigen; los reglamentos navales suelen incluir vibración (deducción mía, **sin verificar**).
- **Lo que no he encontrado:** ninguna cifra (g, Hz, horas) publicada para el 221 ni una recomendación de WAGO para máquinas con vibración.
- **En el proyecto (deducción mía):** la regleta va en la caja fija. La fuente de vibración más probable es el uso del bar (golpes en el panel, música alta), no motores. Lo razonable es fijarla (221-505), no dejarla colgando de los cables y poner descarga de tracción.

### 5.7 Sin protección por rama (problema 12)

La WAGO soporta 32 A y la LRS-50-5 da 10 A; la regleta no limita la corriente de ninguna rama. Un cortocircuito en el latiguillo de 22 AWG solo lo cortaría la protección de la fuente si supera su límite, que puede ser mucho mayor que lo que aguanta el hilo. No he comprobado ese límite (deducción mía; afecta a la ficha de la LRS-50-5 y a la del cable USB-A a USB-C).

## 6. Qué comprobar al recibirlas y al montar

Haz las pruebas con una muestra de varias unidades del lote (idealmente todas las 221-415 que vayas a usar; son pocas: 2 por máquina).

| # | Prueba | Resultado esperado | Si no sale |
|---|---|---|---|
| 1 | Foto del embalaje, del albarán y del anuncio; anota vendedor y lote | Datos guardados | Sin datos no hay reclamación |
| 2 | Aspecto: carcasa transparente, palanca naranja, texto negro en la palanca (IET) y marcas legibles | Parecido a una auténtica de referencia | Dudas = reclamar; compáralas con una pieza comprada a un distribuidor |
| 3 | Dimensiones con calibre: 30 × 8,4 × 18,6 mm (hoja 2026) | Diferencia de menos de unas décimas | Más de 1 mm: sospechosa (criterio mío) |
| 4 | Peso: 10 unidades en báscula de 0,01 g | Unos 40 g (4 g cada una, hoja) | Muy por debajo: menos metal (idea mía) |
| 5 | Abrir y cerrar la palanca cinco veces | Recorrido uniforme, sin crujidos ni grietas | Palanca floja, plástico blando o quebradizo: rechazar |
| 6 | Cable de 0,75 mm² con puntera y 22 AWG desnudo, cada uno en su polo; palanca plana | Cobre al fondo, a la vista | Palanca que no baja: cambiar de puntera o de pelado |
| 7 | Tirón suave (unos 10 N, orden de magnitud de foro) | El cable no se mueve | Se suelta: rechazar |
| 8 | Continuidad entre polos de la misma regleta | Cerca de 0 Ω | Valor alto o intermitente: rechazar |
| 9 | **Caída de tensión a 5 A en una pieza de prueba:** dos cables en dos polos, pelados 14 mm para que queden unos 3 mm de cobre desnudo fuera de la entrada; fuente de laboratorio con límite de 5 A (o la LRS con una carga de 1 Ω y 50 W o más) y polímetro en mV entre las dos partes desnudas | Unos 10-20 mV (dos contactos sanos de 1-2 mΩ, cálculo propio de 4.2 con 5 A) | Más de unos 50 mV (≈5 mΩ por contacto): sospechar. Umbral mío |
| 10 | **Calentamiento:** 5 A durante 1 hora, sentir o medir con termómetro IR | Subida de pocos grados | Calentamiento evidente: rechazar |
| 11 | Polaridad de cada polo con el polímetro (4.4) | Tal como el esquema | Corregir antes de conectar |
| 12 | Etiquetar las dos regletas (4.5) | Hecho | |

Notas:

- **Las pruebas 3, 4 y 9 comparan con valores de la hoja o con la tabla 4.2.** No tengo medidas de una auténtica; si quieres una referencia fiable, compra 2-3 unidades a un distribuidor y compáralas.
- Las punteras: pruébalas con la **crimpadora #28** de la hoja (ficha propia). Si la crimpadora no hace crimpado cuadrado/hermético, el contacto puede ser peor que el de un cable desnudo (idea mía; sin verificar el tipo de crimpado de esa herramienta).

## 7. Alternativas

Solo hay un motivo claro para cambiar algo: reducir el riesgo de autenticidad y ajustar la cantidad.

| Alternativa | Motivo | Estado |
|---|---|---|
| **Comprar solo 221-415 sueltas** en packs de 25 a un distribuidor con trazabilidad | Haría falta una por polaridad por máquina (2 por máquina; 25 uds. = 12 máquinas). Cuesta unos 12,5-15 € en las tiendas alemanas que abrí, menos que el surtido | Recomendado; **disponibilidad en distribuidores españoles: sin verificar** |
| **Adaptadores de montaje 221-505** (5 polos, para tornillo) | Fijar la regleta a la chapa. Figura en la lista de accesorios de la hoja de 2021 | Precio y disponibilidad: sin verificar |
| WAGO 2273 | Según un artículo comercial, la serie 2273 solo admite **conductor macizo** (20-14 AWG) ([LCSC Cables](https://lcsccable.com/blog/?p=238)). Aquí todo es multifilar | **Descartada** (fuente secundaria; no vi la hoja de la 2273) |
| 221-2411 (conector de paso con palanca; "2401" no la he visto en ninguna fuente) | En la web de WAGO y en una tienda aparece como conector de paso para 2 conductores ([testsieger.de](https://www.testsieger.de/verbinder-und-klemmen/5CVG05XKU0579-wago-durchgangsklemme-221-2411-hebelklemme-fuer-2-leiter-02-mm-4-mm-60-stk.html)); no sustituye a una regleta de 5 polos (deducción mía) | No investigada a fondo |
| Borne de tornillo en carril DIN, WAGO 2060 | No hay motivo técnico: el 221 sobra en corriente | No investigada |

## 8. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Antes de confiar en el lote, haz las pruebas de la sección 6** con las 221-415 que vayas a usar, y con una **auténtica de referencia** comprada a un distribuidor. Si el lote no pasa (peso, caída, plástico, palanca), no lo uses: son 0,5 €.
2. **Considera comprar las 221-415 aparte.** La guía solo usa la 221-415 (2 por máquina) y ya cuenta la WAGO entre los kits que sobran (§1). 25 unidades de una tienda con trazabilidad costaban 12,5-15 € en las tiendas alemanas que abrí (menos que el surtido) y cubren 12 máquinas. El surtido serviría para empalmes de prueba.
3. **Pregunta al vendedor (por escrito)** marca, composición (cuántas de cada) y si lleva marcado/embalaje de WAGO. Guarda la respuesta y la factura.
4. **Fija cada regleta a la chapa** (221-505 o brida a un soporte), con cables atados y holgura. No la dejes colgando.
5. **Pela a 11 mm y comprueba por la carcasa transparente** que el cobre (o la puntera) llega al fondo.
6. **Rotula las dos regletas "+5 V" y "GND"** y mide la polaridad antes de conectar la Pi (4.5).
7. **Acorta el troncal de 0,75 mm²** (22,9 mΩ/m: un metro ida y vuelta a 5 A son 230 mV). La borna importa menos que el cable.
8. **Si añades un ventilador u otra carga, prevé una tercera regleta** (no hay polo libre).
9. **Tras montar la máquina, repite la medida de caída y de calentamiento a plena carga** (sección 6, pruebas 9 y 10) y guárdalas como referencia para el servicio.
10. **Separa los cables de 5 V de los de 230 V.** La regleta va junto a la fuente (guía §4): que sus cables no rocen los bornes L/N de la LRS. (Cuestión de la ficha de la fuente; la menciono por la ubicación.)

**Afecta a otras piezas (una línea cada una):**

- **LRS-50-5 (#14):** la guía no pone fusible por rama; la regleta no limita la corriente (5.7).
- **Latiguillo micro-USB y clavija JST-XH (22 AWG):** entran en la 221; sin puntera es válido según la hoja. La ficha de la JST-XH ya recoge el rango de la 221.
- **Crimpadora y punteras (#28):** hay que comprobar que las punteras de 0,75 mm² encajan y cierran la palanca (5.4).
- **Cable de 5 V (#21):** ver el cálculo de caída en 4.2.

## 9. Lo que no he podido verificar

- **El anuncio de Amazon.es:** marca, vendedor, composición del surtido (si es 25 + 25 + 25 u otra), embalaje, si es WAGO genuino, devoluciones. Amazon bloquea mi herramienta y el ASIN no aparece en otras webs que abrí.
- **La hoja de datos en `wago.com`** (la herramienta rechazó el PDF) y **la hoja de instrucciones y las declaraciones de conformidad:** no encontré el enlace directo. Las cifras vienen de dos copias de distribuidores (2026 y 2021).
- **Cualquier cifra de resistencia de contacto, caída de tensión, fuerza de extracción, vibración o choque del 221.** Las hojas no las dan. La cifra de "menos de 2 mΩ" es de un vendedor.
- **El límite inferior de temperatura:** ni −60 °C ni −40 °C figuran en una fuente de WAGO. −40 °C sale de un artículo de un vendedor.
- **VDE:** no figura en la hoja de 2026. No lo he buscado en la base de VDE.
- **El material del contacto y del muelle** ("cobre estañado"): las hojas no lo especifican.
- **Condiciones de WAGO para punteras en el 221** (DIN 46228, 2,5 mm² sin collarín, 1,5 mm² con collarín): solo vi una cita de un forero, no el documento de WAGO.
- **Cómo reconocer una auténtica con fotos oficiales** (marcado moldeado, texto de la palanca, interior): no hay guía de WAGO que haya podido abrir. El rasgo del texto negro en la palanca es de un foro.
- **Los vídeos de Big Clive, GreatScott! y WAGO:** solo leí descripciones y capítulos; no vi imágenes ni transcripciones.
- **Casos de organismos (UL, DEKRA, VDE, autoridades de consumo)** contra clones del 221: no los encontré; la búsqueda fue limitada.
- **Que el 221-415 sigue en producción:** hay una hoja de 19-05-2026, pero un hilo de DigiKey de 2024 lo llama obsoleto.
- **Precios en España:** solo miré tiendas alemanas; no sé el precio de la 221-415 en distribuidores españoles ni el de los adaptadores 221-505.
- **Comportamiento de la palanca con hilo de 22 AWG y con puntera de 0,75 mm² con collarín:** no hay informes; se prueba al recibirlas.
- **Ciclos de reconexión** de la palanca.
- **Una página de WAGO sobre falsificaciones o cómo reconocer originales:** no la encontré en las búsquedas que hice.
- **Los hilos de foro que no abrí** (comentarios de Hackaday, otros hilos de Mike Holt, ipcamtalk y IET).

## 10. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo y con nota en los que no pude abrir, en [`enlaces.md`](enlaces.md).
