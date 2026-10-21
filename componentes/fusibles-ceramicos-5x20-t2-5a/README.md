# Fusibles cerámicos 5×20 mm T2,5A (lentos), 250 V

Fusible de protección de la entrada de red de 230 V. Va en el portafusibles del módulo C14 (#15), delante de la fuente Mean Well LRS-50-5 (#14). Sustituye al fusible de 10 A que trae el módulo.

- **Compra:** ASIN B0956XYTN6, 9,99 € por 10 unidades (precio de la hoja de componentes del 19-20-10-2026).
- **Pieza que toca los 230 V:** un fusible falso o mal elegido no avisa. Esta ficha separa lo que dicen las normas y los fabricantes de lo que son cálculos y conclusiones mías.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta, así que no he podido ver el anuncio: el precio y la referencia son los de tu hoja y **no sé la marca, el marcado ni los certificados del fusible que llegará**.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales y normas](#3-documentos-oficiales-y-normas)
4. [Verificación de la elección T2,5A](#4-verificación-de-la-elección-t25a)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Recomendaciones para el alcoholímetro](#6-recomendaciones-para-el-alcoholímetro)
7. [Lo que no he podido verificar](#7-lo-que-no-he-podido-verificar)
8. [Fuentes](#8-fuentes)

---

## 1. Resumen para el proyecto

- **El T2,5A es una buena elección, pero los 22 A²s de la guía son de un solo fabricante.** 22,29 A²s es el valor nominal de Littelfuse 215 (copia de su hoja). Otros fusibles cerámicos T 5×20 H dan 11,7 (Schurter, típico), 16,6 (Eaton, típico) y 32 A²s (ESKA). Con cualquiera de ellos el margen frente al arranque de la fuente sigue siendo de 3,9× en el peor caso de mi cálculo y de 7× o más con la cifra de la guía (apartado 4.3).
- **Los 1,5 A²s de la guía no salen de la hoja de la LRS-50-5.** La hoja da 45 A en frío a 230 V y no da duración ni la capacidad del condensador. Mi cálculo da 0,7–2,4 A²s para 100–330 µF; 1,5 A²s equivale a unos 205 µF. Cuadra, pero es una hipótesis. Los 45 A sí están en la hoja.
- **El T2,5A no protege la carga, protege contra fallos.** La fuente toma como mucho 0,56 A (hoja) y la máquina unos 0,1–0,25 A. El fusible no tiene que abrir por debajo de 3,75 A (mínimo 60 min), garantiza abrir en 30 min a partir de 5,25 A y en 5 s a partir de 10 A. Su sitio: cortocircuitos y fallos de aislamiento entre el módulo C14 y la fuente.
- **"Cerámico" no basta: tiene que ser de verdad "H" (1500 A).** El marcado esperado es `T2.5AH250V`. La capacidad de corte no se puede comprobar en casa. Hay pruebas de aficionados con fusibles cerámicos genéricos de marketplace que no cumplían su curva. Detalles y pruebas de recepción en los apartados 5 y 6.
- **Dos discrepancias con mi planteamiento inicial y la guía:** la norma para este fusible es la hoja 5 de IEC 60127-2 (no la 3), y no he encontrado ninguna serie "215H" de Littelfuse (la 215 ya lleva H en el marcado). Detalle en el apartado 3.1.
- **El enchufe Schuko es reversible:** el fusible de una sola polaridad puede quedar en el neutro. Con él, un fallo de fase a chasis no pasa por el fusible. Hay que decidir si se acepta o si se fusionan los dos polos (apartado 4.6).

## 2. Especificaciones

### 2.1 Qué significa el marcado `T2.5AH250V`

| Elemento | Significado | De dónde sale |
|---|---|---|
| `T` | Retardado (time-lag). Los símbolos FF/F/M/T/TT son relativos: no fijan un tiempo de apertura, manda la curva del fabricante | Artículo de Viox, que cita IEC 60127-1 ([viox.com](https://viox.com/fr/cartridge-fuse-guide/)); fuente secundaria |
| `2.5A` | Corriente nominal. Los fusibles IEC pueden llevarla de forma continua al 100 %; los UL 248-14 solo al 75 % | Libro blanco de Schurter ([escies.org](https://escies.org/download/webDocumentFile?id=62211)). Littelfuse recomienda no pasar del 75 % a 25 °C ([catálogo Fuseology, pág. 4](https://electronicscatalogs.littelfuse.com/Fuseology-Selection-Guide/4/)) |
| `H` | Alta capacidad de corte: 1500 A a 250 VAC, factor de potencia 0,7–0,8 | Schurter SPT ([hoja](https://static.maritex.eu/file/display/uDMBx1Wpo_qWGmasJyt6eIcp2XA-1AuE/SPT_5x20.pdf)); Eaton y Bel dan también 1500 A |
| `250V` | Tensión nominal alterna | Todas las hojas. La SPT de Schurter añade 300 VDC |
| Orden del marcado | Corriente nominal, símbolo de capacidad de corte (H, L o E) y tensión nominal | Resumen de IEC 60127-2:2014 en [DIN Media](https://www.dinmedia.de/en/standard/din-en-60127-2/229904237) |

El símbolo de capacidad de corte es H (alta), L (baja) o E (mejorada) (DIN Media). Valores:

- **H = 1500 A:** confirmado en las hojas de Schurter, Eaton y Bel.
- **L = 35 A o 10 × In:** lo veo en hojas de fusibles de vidrio (Schurter MST: "35 A @ 250 VAC" y "10 In @ 250 VAC"; R-TECH: "35A or 10ln@250V AC"), no en el texto de la norma. **Sin verificar en la norma.**
- **E = 150 A:** viene de mi planteamiento inicial. **No lo he encontrado en ninguna fuente que haya podido abrir.**

### 2.2 El mismo T2,5A según cada fabricante

| Parámetro | Littelfuse 215 (`021502.5`) | Schurter SPT (`0001.2508`) | Eaton S505-2.5-R | ESKA 522.721 | Bel 5HT 2.5-R |
|---|---|---|---|---|---|
| Cuerpo | Cerámico | Cerámico | Cerámico | Cerámico (listado de Rapid) | Cerámico (Digi-Key) |
| Hoja IEC 60127-2 | "Standard Sheet 5" | /5 | No la nombra | EN 60127-2-5 | Hoja 5 |
| Capacidad de corte | 1500 A @ 250 VAC (tabla de la copia, columna confusa) | 1500 A @ 250 VAC | 1500 A | 1500 A (solo en la fila de 1 A) | 1500 A |
| Resistencia en frío | 0,0386 Ω nominal | No la da | 0,0395 Ω típica (<10 % In, 20 °C) | No la da | No la da |
| Caída de tensión a In | 180 mV máx. | 180 mV máx.; 100 mV típ. | 115 mV típ. | 180 mV | No la da |
| I²t de prearco (a 10 In) | **22,29 A²s** nominal | **11,7 A²s** típ. | **16,6 A²s** típ. | **32,00 A²s** | No lo da |
| Disipación a 1,5 In | 2,5 W máx. | 2,5 W máx.; 0,6 W típ. | No la da | No la da | No la da |
| Temperatura de trabajo | −55 a +125 °C | −55 a +125 °C | −55 a +125 °C "con derating" | No la da | No la da |

Fuentes: [Littelfuse 215, copia de Chipdip](https://static.chipdip.ru/lib/198/DOC043198391.pdf) y [ficha de producto 021502.5](https://littelfuse.com/products/fuses/cartridge-fuses/5x20mm-fuses/215/21502_5.aspx); [Schurter SPT](https://static.maritex.eu/file/display/uDMBx1Wpo_qWGmasJyt6eIcp2XA-1AuE/SPT_5x20.pdf); [Eaton S505](https://www.eaton.com/content/dam/eaton/products/electronic-components/resources/data-sheet/eaton-s505-ferrule-time-delay-ceramic-tube-fuses-data-sheet.pdf); [ESKA 522.700](https://static.rapidonline.com/pdf/523987_da_ml_01.pdf) (tabla extraída con columnas dudosas; la fila 522.721 de 2,5 A da 180 mV y 32,00 A²s); [Bel 5HT](https://www.alldatasheet.com/html-pdf/2166831/BEL/5HT%202.5-R/64/1/5HT%202.5-R.html) (espejo de alldatasheet, sin la tabla de 2,5 A).

Notas:

- **El I²t varía casi 3× entre fabricantes** que cumplen la misma hoja de la norma (11,7 a 32 A²s). Littelfuse dice que lo mide a 10 veces la corriente nominal. Schurter y Eaton dan valores típicos. No son intercambiables a ciegas.
- **Resistencia en frío:** 38,6 a 41,5 mΩ en las tres fuentes que la dan (Littelfuse, Eaton y la hoja de un fusible de vidrio de R-TECH, 41,5 mΩ). Las cifras de "40-50 mΩ" de mi planteamiento inicial coinciden con la caída de tensión a In dividida por In (100 mV / 2,5 A = 40 mΩ en Schurter; 115 mV / 2,5 A = 46 mΩ en Eaton): ese cociente incluye el calentamiento, la resistencia en frío es algo menor.
- **Caída máxima de 180 mV a 2,5 A:** la repiten Littelfuse, Schurter y ESKA. Es probable que sea el límite de la hoja 5 (deducción mía, no he leído la norma).
- **Dimensiones:** 5 × 20 mm. Los tapones llevan el marcado: según Littelfuse, un tapón lleva el logotipo, la corriente y la tensión, y el otro las marcas de aprobación.
- **Producción:** la ficha de producto de Littelfuse se abre (consulta del 21-10-2026) y hay al menos cinco fabricantes con el mismo T2,5A cerámico H (tabla anterior). Es un formato estándar, así que el riesgo de quedarse sin suministro es bajo. **No he buscado avisos de cambio de producto o descatalogación** (sin verificar).

## 3. Documentos oficiales y normas

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Littelfuse 215, hoja de datos (la de la guía) | Rev. 11/30/21 según la copia | PDF | [enlace de la guía](https://littelfuse.com/%7E/media/electronics/datasheets/fuses/littelfuse_fuse_215_datasheet.pdf.pdf) (**no se abrió**, ver apartado 7) · [copia de Chipdip, leída](https://static.chipdip.ru/lib/198/DOC043198391.pdf) |
| Littelfuse 215, ficha del 2,5 A | 021502.5 | Web | [littelfuse.com](https://littelfuse.com/products/fuses/cartridge-fuses/5x20mm-fuses/215/21502_5.aspx) |
| Littelfuse, Fuseology Design Guide (la de la guía) | | PDF | [enlace de la guía](https://info.littelfuse.com/hubfs/Fuseology%20Design%20Guide.pdf) (**no se abrió**) |
| Littelfuse, catálogo Fuseology Selection Guide, pág. 4 | | Web | [electronicscatalogs.littelfuse.com](https://electronicscatalogs.littelfuse.com/Fuseology-Selection-Guide/4/) |
| Schurter SPT 5×20 (2,5 A: 0001.2508) | IEC 60127-2/5 | PDF | [copia de Maritex](https://static.maritex.eu/file/display/uDMBx1Wpo_qWGmasJyt6eIcp2XA-1AuE/SPT_5x20.pdf) |
| Schurter, libro blanco "Fuse Selection: Find the Right Fuse!" | Código 0165.0607 / 10.11 | PDF | [copia en ESCIES](https://escies.org/download/webDocumentFile?id=62211) |
| Eaton Bussmann S505 | | PDF | [eaton.com](https://www.eaton.com/content/dam/eaton/products/electronic-components/resources/data-sheet/eaton-s505-ferrule-time-delay-ceramic-tube-fuses-data-sheet.pdf) |
| Bel Fuse 5HT / 5HTP | IEC 60127-2 hoja 5 | HTML (espejo) | [alldatasheet.com](https://www.alldatasheet.com/html-pdf/2166831/BEL/5HT%202.5-R/64/1/5HT%202.5-R.html) |
| ESKA 522.700 | EN 60127-2-5 | PDF | [Rapid](https://static.rapidonline.com/pdf/523987_da_ml_01.pdf) |
| Mean Well LRS-50, hoja de datos (la de la guía) | | PDF | [enlace de la guía](https://www.meanwell.com/Upload/PDF/LRS-50/LRS-50-SPEC.PDF) (**no se abrió**) |
| Mean Well LRS-50, copia de RS | LRS-50-SPEC 2015-12-31 | PDF | [docs.rs-online.com](https://docs.rs-online.com/19bc/0900766b814e41ec.pdf) |
| Mean Well LRS-50, copia de Mean Well Australia | LRS-50-SPEC 2025-04-07 | PDF | [meanwellaustralia.com.au](https://www.meanwellaustralia.com.au/sites/default/files/2025-05/MEAN%20WELL%20LRS-50%20DATA%20SHEET.pdf) |
| Mean Well, catálogo industrial, pág. 4 | LRS 35–100 W | Web | [meanwell.com](https://www.meanwell.com/catalog/product/files/basic-html/page4.html) |
| Mean Well, manual de instalación (la de la guía) | | PDF | [Enclosed_Type_EN.pdf](https://www.meanwell.com/Upload/PDF/Enclosed_Type_EN.pdf) |
| IEC 60127-2:2014, resumen | DIN EN 60127-2:2015-07 | Web | [DIN Media](https://www.dinmedia.de/en/standard/din-en-60127-2/229904237) |
| Schurter PG05, módulos de entrada sin filtro (1 y 2 polos) | 22.04.2015 | PDF | [docs.rs-online.com](https://docs.rs-online.com/34dc/0900766b81441f21.pdf) |
| IEC 62368-1, marcado de fusibles (resumen de UL) | F.3.5.3 | PDF | [japan.ul.com](https://japan.ul.com/wp-content/uploads/sites/27/2014/06/1_techbrief_equipmentmarkings.pdf) |

El texto de IEC 60127-1 y -2 y de EN 60335-1 es de pago: **no lo he leído**. Lo que sé de las normas viene de resúmenes y de las hojas de los fabricantes. Más enlaces en [`enlaces.md`](enlaces.md).

### 3.1 IEC 60127: qué es de la norma, qué es de los fabricantes y qué es mío

Hojas de la norma, según el resumen de [DIN Media](https://www.dinmedia.de/en/standard/din-en-60127-2/229904237) (edición 2014; las hojas 7 a 10 se añadieron en ella):

| Hoja | Tamaño | Característica | Capacidad de corte |
|---|---|---|---|
| 1 | 5×20 | Rápido | Alta (H) |
| 2 | 5×20 | Rápido | Baja (L) |
| 3 | 5×20 | Retardado | Baja (L) |
| 4 | 6,3×32 | Rápido | Baja (L) |
| **5** | **5×20** | **Retardado** | **Alta (H)** |
| 6 | 5×20 | Retardado | Mejorada (E) |
| 7 a 10 | 6,3×32 | Varias | Mejorada y alta |

**Discrepancias con mi planteamiento inicial:**

- **La hoja 3 no es el T cerámico H.** Según DIN Media, la 3 es 5×20 retardado de capacidad **baja** (la del vidrio). El T cerámico H es la **hoja 5**, y así lo declaran Littelfuse ("Standard Sheet 5"), Schurter ("/5"), Bel ("sheet 5") y ESKA ("EN 60127-2-5"). La hoja 2 es de fusible **rápido** de capacidad baja, no una hoja "de tamaño pequeño". La tabla encaja con una hoja de Schurter de fusible rápido cerámico (0001.1008, que dice "IEC 60127-2/1" y "H"), es decir, hoja 1 = rápido H ([enlace](https://it.schurter.com/de/datasheet/typ_SP_5x20.pdf)).
- **La edición 2014 consta como retirada** en DIN Media y sustituida por DIN EN 60127-2:2024-01. **No he comprobado si la numeración de las hojas cambió en la nueva edición.**
- **"215H":** no he encontrado ninguna serie Littelfuse "215H". La 215 ya es de alta capacidad de corte (marcado `T2.5AH250V` en su ficha del 2,5 A). Puede que mi planteamiento inicial se refiera a ese sufijo H del marcado.

**Qué viene de dónde (tiempo-corriente del T 2,5 A, hoja 5):**

| Múltiplo de In | Corriente | Tiempo de apertura | Quién lo da |
|---|---|---|---|
| 150 % | 3,75 A | No debe abrir antes de 60 min | Littelfuse, Schurter, Eaton |
| 210 % | 5,25 A | Abre en 30 min como máximo | Littelfuse, Schurter, Eaton |
| 275 % | 6,9 A | Entre 0,75 s y 80 s | Littelfuse, Schurter, Eaton |
| 400 % | 10 A | Entre 0,095 s y 5 s | Littelfuse, Schurter, Eaton |
| 1000 % | 25 A | Entre 10 ms y 150 ms | Littelfuse, Schurter, Eaton |

Los tres coinciden en todas las filas, y ESKA da los mismos límites en su banda de 1 A a 3,15 A (con la asignación mín./máx. dudosa en mi extracción). Probablemente son los límites de la hoja 5, pero **no he leído la norma**. Los I²t de la sección 2.2 son valores de cada fabricante, no un requisito normativo que yo haya visto.

## 4. Verificación de la elección T2,5A

### 4.1 Datos de la fuente (Mean Well LRS-50-5)

| Dato | Valor | Fuente |
|---|---|---|
| Tensión de entrada | 85–264 VAC, 47–63 Hz | Copias de RS (2015) y Mean Well Australia (2025) |
| Corriente de entrada (típ.) | 0,95 A a 115 VAC y **0,56 A a 230 VAC** | Mismas copias. El texto extraído da un solo par para toda la serie, **no por modelo** |
| Pico de arranque en frío | **45 A a 230 VAC** ("COLD START 45A/230VAC") | Mismas copias: confirma la guía. La copia de RS lo rotula "Typ."; el [catálogo, pág. 4](https://www.meanwell.com/catalog/product/files/basic-html/page4.html) lo rotula "max." y da 45, 65 y 50 A para cuatro columnas (LRS-35/50/75/100) sin poder asignarlos por modelo |
| Duración del pico | **No la da** | — |
| Fusible interno | **No lo cita** en lo que pude leer | Copias de la hoja y [manual de instalación](https://www.meanwell.com/Upload/PDF/Enclosed_Type_EN.pdf) |
| Corriente de fuga | < 0,75 mA a 240 VAC | Copias de la hoja |
| Protección de salida | Sobrecarga 110–150 %, modo hipo con recuperación automática | Copias de la hoja |

El manual de instalación pide no abrir la fuente ("Please do not remove the case of the power supply by yourself"), así que el fusible interno, si existe, no es reemplazable por el usuario.

**Cálculo mío con los datos de la hoja:** potencia de entrada a plena carga = 50 W / 0,83 = 60 W. Con 0,56 A × 230 V = 129 VA, el factor de potencia sale en torno a 0,47, coherente con una fuente sin corrección de factor de potencia. La máquina toma mucho menos: la guía estima unos 14 W típicos (0,1 A) y un pico de 26 W en el raíl de 5 V (entrada de unos 0,3 A).

### 4.2 Cálculo propio del I²t del arranque

> **Cálculo mío, no de la hoja.** Supuesto: el pico es la descarga exponencial de un condensador de entrada a través de una resistencia en serie (termistor y línea), y el pico de 45 A se alcanza a la tensión de cresta de 230 V.

- Tensión de cresta: 230 × √2 = 325 V. Resistencia equivalente: 325 V / 45 A = 7,2 Ω.
- Constante de tiempo: τ = R·C. I²t = ½ · Ipk² · τ. Es la misma fórmula del libro blanco de Schurter (I²t_aplicación = 0,5 · Ip² · τ).
- Como τ = R·C y R = Vpk/Ipk, queda **I²t = ½ · Ipk · Vpk · C**. El I²t crece con el pico y con la capacidad.
- **La capacidad del condensador de entrada de la LRS-50-5 no está en la hoja y no la he visto en una foto de la placa.** Tomo un rango.

| Condensador (hipótesis) | τ | I²t exponencial | I²t si se aproxima por un triángulo de base 3τ (más conservador) |
|---|---|---|---|
| 100 µF | 0,72 ms | 0,73 A²s | 1,46 A²s |
| 150 µF | 1,08 ms | 1,10 A²s | 2,20 A²s |
| 205 µF | 1,48 ms | **1,50 A²s** | 3,00 A²s |
| 330 µF | 2,39 ms | 2,42 A²s | 4,83 A²s |

Los 1,5 A²s de la guía corresponden a unos 205 µF (o a un triángulo de 2,2 ms de base). La guía no explica cómo salió. Para comparar uso dos casos: **1,5 A²s** (guía) y **3,0 A²s** (caso conservador mío).

**Si la fuente se reenciende en caliente** y el termistor (si lo lleva; la hoja solo da el pico en frío) no se ha enfriado, el pico sería mayor, y el I²t crece con él. Con 205 µF, un pico de 150 A daría 5,0 A²s. Es una hipótesis para explicar por qué Mean Well desaconseja el encendido y apagado seguido (guía, §2.6), no un dato.

### 4.3 Margen del T2,5A y de los valores vecinos

> **Cálculo mío.** I²t de cada fusible: valor nominal de Littelfuse 215 ([copia](https://static.chipdip.ru/lib/198/DOC043198391.pdf)). Criterio de envejecimiento: Schurter exige que el I²t del fusible sea mayor que el I²t del pulso dividido por un factor de 0,29 si se esperan 10.000 pulsos o 0,19 si se esperan 1.000.000 (retardado; 0,5 para 100 pulsos) ([libro blanco](https://escies.org/download/webDocumentFile?id=62211), tabla 2).

| Fusible | I²t de Littelfuse | Margen sobre 1,5 A²s | Margen sobre 3,0 A²s | Cumple Schurter 10.000 pulsos (1,5 / 3,0 A²s) | Cumple Schurter 1.000.000 pulsos (1,5 / 3,0 A²s) |
|---|---|---|---|---|---|
| T1A | 1,52 A²s | 1,0× | 0,5× | No / no | No / no |
| T1,25A | 3,20 A²s | 2,1× | 1,1× | No / no | No / no |
| T1,6A | 6,83 A²s | 4,6× | 2,3× | Sí / no | No / no |
| T2A | 11,68 A²s | 7,8× | 3,9× | Sí / sí | Sí / no |
| **T2,5A** | **22,29 A²s** | **14,9×** | **7,4×** | **Sí / sí** | **Sí / sí** |
| T3,15A | 43,26 A²s | 28,8× | 14,4× | Sí / sí | Sí / sí |

Lectura:

- **T1A y T1,25A no valen:** con el I²t de la guía, el T1A trabajaría al límite de fundirse en cada arranque.
- **T1,6A** solo pasa con 1,5 A²s y 10.000 pulsos. **T2A** pasa en tres de los cuatro casos y falla solo con el caso conservador (3,0 A²s) a 1.000.000 de pulsos: es el candidato si se quisiera un fusible algo más sensible, pero con menos margen.
- **T2,5A es el menor valor estándar que pasa los cuatro casos.** El T3,15A sobra y abre más tarde ante fallos.
- **Depende de la marca:** con el I²t más bajo de los que he visto para un T2,5A cerámico (Schurter, 11,7 A²s típico) el T2,5A pasa con 1,5 A²s en los dos criterios, pero no con 3,0 A²s a 1.000.000 de pulsos (necesita 15,8). Con Eaton (16,6), Littelfuse (22,29) o ESKA (32) pasa todo.
- **Pulsos reales:** si se enciende la máquina una vez al día, son unos 3.650 pulsos en diez años (cálculo mío): entre las filas de 100 y 10.000 pulsos. Los 1.000.000 solo se alcanzarían con reinicios constantes (microcortes, fuente en bucle).
- **Corriente permanente:** 0,56 A es el 22 % de 2,5 A. Con la regla del 75 % de Littelfuse haría falta al menos 0,75 A, y con un 20 % más de reducción por temperatura (apartado 5.7), 0,93 A. La corriente permanente no obliga a más que un T1A; **lo que fija el valor es el arranque.**

### 4.4 Qué protege un T2,5A y qué corriente de fallo hace falta

El fusible no protege la carga: la máquina toma 0,1–0,25 A y el T2,5A no abre por debajo de 3,75 A (mínimo 60 min). Una sobrecarga moderada del lado de 230 V (por ejemplo, 4 o 5 A) no la corta en un tiempo útil. Lo que protege (conclusión mía):

- Contra cortocircuitos y fallos fuertes en el tramo entre el portafusibles y la fuente: cable de 1,5 mm², fastones, interruptor (6 A según la guía) y la propia fuente.
- No protege el cable de red (#17) ni el tramo C14-portafusibles: están antes del fusible.
- La sobrecarga del lado de 5 V la limita la fuente (modo hipo, apartado 4.1).

**Corriente para abrir en un tiempo razonable** (tabla del apartado 3.1): 6,9 A abre en 80 s como máximo; 10 A en 5 s; 25 A en 150 ms. Por debajo de 5,25 A no hay ninguna garantía de apertura, y hasta 3,75 A el fusible no debe abrir antes de 60 min.

**Qué hace la instalación del bar** (cálculo mío, con un magnetotérmico de 16 A curva C como hipótesis; **no sé el que hay en cada bar**):

| Corriente de fallo | T2,5A (apertura garantizada) | Magnetotérmico C16 (curvas IEC/UNE-EN 60898-1) |
|---|---|---|
| 10 A (0,6 In) | Entre 0,095 y 5 s | No dispara |
| 18 A (1,13 In) | Máx. 5 s | Sin disparo hasta 1 h |
| 23 A (1,45 In) | Máx. 5 s (entre 400 % y 1000 % solo hay límite de 5 s) | Dispara en menos de 1 h |
| 41 A (2,55 In) | Máx. 150 ms | Entre 1 y 60 s (la hoja de Schneider es ambigua en qué calibres) |
| 80 a 160 A (5 a 10 In) | Máx. 150 ms | Disparo magnético instantáneo (curva C) |

Fuentes de la columna derecha: [Schneider Acti9](https://frrq.cvg.utn.edu.ar/pluginfile.php/7184/mod_resource/content/1/Curvas%20de%20disparo%20Acti9.PDF) (3600 s para 1,13 y 1,45 In; 60 s y 1 s para 2,55 In) y [Voltimum](https://content.voltimum.com/es/26860/14interruptoresmagnetotermicosydiferenciales_09_21.pdf) (curva C: 5 a 10 In; curva B: 3 a 5 In).

Conclusión: **entre unos 7 y unos 80 A el T2,5A corta mucho antes que el magnetotérmico de la instalación**. Por encima de 80-160 A los dos disparan en milisegundos, y entonces cuenta la capacidad de corte del fusible.

**Capacidad de corte frente a la corriente de cortocircuito posible** (cálculo mío con hipótesis; la medida buena la da un electricista con un medidor de impedancia de bucle): en un enchufe a 3 o 10 m del cuadro, con cable de 2,5 mm² (cobre, 0,0172 Ω·mm²/m) e impedancia de fuente de 0,1 a 0,3 Ω, salen entre unos 500 A y 1,6 kA. Un fusible H (1500 A) rinde en ese rango; un fusible de vidrio L (35 A o 10 × In) queda muy por debajo. Si la corriente posible en el enchufe del bar superase 1,5 kA, el fusible H no sería suficiente (punto a medir, apartado 6).

**Qué garantiza el REBT:** la ITC-BT-19 ([enlace de la guía](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf)), que sí pude abrir, trata la instalación y no trata fusibles internos de equipos. La ITC-BT-22 (protección contra sobreintensidades) no la pude abrir: **sin verificar**. Mi conclusión: la protección del bar protege el cable de la instalación, no el cableado interno de la máquina, y su curva puede tardar mucho en cortar fallos moderados. De ahí el fusible propio.

### 4.5 El fusible interno de la fuente: ¿redundante?

**No he podido verificar ni su valor ni su capacidad de corte:** la hoja no lo cita en lo que leí y el manual no lo menciona. Mi conclusión es que es **complementario, no redundante**: un fusible interno solo protege a la fuente de sus propios fallos y no protege el cable, los fastones ni el interruptor que quedan aguas arriba. Además, el interno no se sustituye y el externo sí.

### 4.6 Qué conductor lleva el fusible

- El enchufe Schuko se puede girar 180°, y el cable C13 y el módulo no distinguen fase de neutro. Según cómo se gire el enchufe, el pin que la guía llama "L tras el fusible" será en realidad el neutro. La guía pone el fusible en el pin L (§5.1); cómo lo cablea el vendedor del módulo C14 se verá en su ficha (#15).
- **Cálculo mío (razonamiento, no medida):**

| Fallo aguas abajo del fusible | Fusible en la fase | Fusible en el neutro |
|---|---|---|
| Cortocircuito fase-neutro | Abre | Abre (misma corriente) |
| Fase-chasis (a tierra) | Abre | **No abre**: la corriente no pasa por él; dependen el magnetotérmico y el diferencial |
| Con el fusible fundido | El interior queda sin tensión de fase | **El interior sigue a tensión de fase** aunque parezca desconectado |

- Fuentes sobre dos polos: Electropages explica que las fuentes con fusible en fase y en neutro existen por si se invierte la polaridad ([artículo](https://www.electropages.com/2017/08/when-is-dual-fusing-in-power-supplies-dangerous/)), con el riesgo de un fusible fundido que deja pensar que no hay tensión. InCompliance (de 1990, sobre normas antiguas) dice que IEC 601-1 e IEC 950 pedían fusibles en los dos polos en productos con tierra ([artículo](https://incompliancemag.com/the-use-of-overcurrent-protection-in-plug-and-socket-connected-equipment/)). Schurter vende módulos C14 con portafusibles de 1 polo (solo L) y de 2 polos ([PG05](https://docs.rs-online.com/34dc/0900766b81441f21.pdf)). **No he podido leer el texto vigente de IEC 62368-1 ni de EN 60335-1 sobre esto.**
- **Si el módulo del vendedor tiene un cajón con dos alojamientos:** comprueba con el polímetro cuál está cableado (apartado 6) antes de contar fusibles de repuesto.

## 5. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Fusible falso o con marcado o capacidad de corte falsos | Alta |
| 2 | Valores reales distintos del marcado en genéricos de marketplace | Alta |
| 3 | "Cerámico" no implica "H" | Media-alta |
| 4 | Cuerpo de vidrio en vez de cerámico | Alta |
| 5 | Envejecimiento por arranques repetidos | Media |
| 6 | Portafusibles con contacto flojo, oxidado o caliente | Media-alta |
| 7 | Temperatura dentro de la caja | Baja |
| 8 | Dispersión del I²t entre fabricantes | Media |
| 9 | Montar el fusible de 10 A del módulo o un valor equivocado | Alta |
| 10 | Fusible en el neutro (enchufe reversible) | Media |

### 5.1 Falsificaciones y capacidad de corte falsa

- **Hay un mercado de fusibles falsos documentado, sobre todo de enchufes británicos (BS 1362).** Un artículo de *Building* dice que se cree que más de 10 millones de fusibles falsos o de mala calidad llegaron al mercado británico, y que el DTI avisó a las autoridades ([building.co.uk](https://www.building.co.uk/circuit-faker/1021904.article)). El mismo artículo describe pruebas de Hager con magnetotérmicos falsos, no con fusibles: les faltaba la bobina de cortocircuito y las placas de arco eran de cobre, daban poca protección ante un cortocircuito y, en un vídeo de EIEMA, uno explotó. Otro artículo ([Daily Maverick](https://www.dailymaverick.co.za/article/2012-06-22-critical-electrical-protection-devices-in-sa-found-to-be-dangerous-counterfeits.md)) trata de magnetotérmicos y diferenciales, no de fusibles. **Sirven como indicio de que las falsificaciones fallan justo en la capacidad de corte, no como prueba sobre fusibles 5×20.**
- **Lo que se ha medido en fusibles:**
  - En un hilo de EEVblog ([Counterfeit fuse?](https://eevblog.com/forum/reviews/counterfeit-fuse/msg1184779)), el autor probó un lote de 100 fusibles de vidrio rápidos de AliExpress; los dos que menciona (0,5 A y 6 A) se fundieron a 2 A y a 12 A, y el resto del hilo los juzgó verosímiles. Otro participante dice haber pasado 33 A por un fusible marcado 3 A y que siguió conduciendo, y otro afirma que los de vidrio no deben usarse donde se exija un fusible cerámico de alta capacidad (red). Es un foro, no un laboratorio.
  - En otro hilo ([Blowing some fuses](https://www.eevblog.com/forum/chat/blowing-some-fuses/msg5802499)) se midieron fusibles cerámicos 5×20 rápidos de AliExpress: resistencias en frío de 92 mΩ (0,25 A), 102 mΩ (0,5 A) y 88 mΩ (1 A), muy parecidas entre sí. A 210 % y 275 % los de 0,25 A y 0,5 A no abrieron en 30 y 4 minutos. A 400 % el de 0,5 A abrió a los 2 s y el de 0,25 A no abrió en 4 minutos. Los participantes los llamaron "basura" y sospecharon que eran el mismo fusible con distinto sello. No se midió capacidad de corte.
  - En el hilo "Counterfeit fuse?" (página 25, [enlace](https://eevblog.com/forum/reviews/counterfeit-fuse/25)), sobre fusibles BS 1362: algunos falsos llevaban arena y buen aspecto, otros un hilo plano en vez de redondo, y uno se detectó solo porque no protegió. Son relatos, sin medidas.
- **Cómo se reconocen (consejos de terceros):** PATTA recomienda, para BS 1362, comprobar longitud, pesar el fusible (la falta de arena se nota en el peso), mirar si la impresión es nítida y si los tapones tienen hendiduras y no dejan ver el hilo, y verificar los números de licencia ([patta.co.uk](https://patta.co.uk/fake-fuses/)). Son pautas para otro fusible; **no tengo el peso ni las cotas de referencia de un 5×20**.
- **ESFI, CPSC y UL:** no encontré informes suyos sobre fusibles 5×20 falsos (sin verificar, ver apartado 7).

### 5.2 Valores reales distintos del marcado

Los datos anteriores (hilo de 88-102 mΩ, fusibles que no abren a 275 %) indican que un genérico puede no cumplir su curva. Para el T2,5A de este pedido **no hay medida**. Lo que puedes comprobar sin medios de laboratorio está en el apartado 6.

### 5.3 "Cerámico" no implica "H"

IEC 60127-2 tiene hojas de 5×20 retardado de capacidad baja (hoja 3), alta (hoja 5) y mejorada (hoja 6) (DIN Media). Que el cuerpo sea cerámico no dice cuál cumple. Un artículo de Viox lo expresa así: "céramique ne signifie pas automatiquement pouvoir de coupure élevé" ([viox.com](https://viox.com/fr/cartridge-fuse-guide/), fuente secundaria). **Hay que leer la H en el cuerpo.**

### 5.4 Vidrio frente a cerámico

- El cerámico va relleno de arena, que enfría el arco (Wikipedia: "filling a fuse body with sand provides additional cooling of the arc", [artículo](https://en.wikipedia.org/wiki/Fuse_(electrical))). El vidrio tiene poca capacidad de corte y suele limitarse a 15 A o menos a 250 VAC (Wikipedia), con hojas de vidrio que dan 35 A o 10 × In (Schurter MST, R-TECH).
- En un cortocircuito fuerte, dentro de un tubo de vidrio el plasma sigue conduciendo y el arco puede mantenerse (Wikipedia). Un usuario de EEVblog avisa de que un fusible de vidrio puede no cortar una corriente de fallo alta y reventar. **No he encontrado una prueba de laboratorio de explosión de un 5×20 de vidrio a 230 V**; es una deducción de las capacidades de corte.
- **No es una diferencia de I²t:** el T 2,5 A de vidrio de R-TECH da 36 A²s nominales, más que el Littelfuse cerámico. La razón de elegir cerámico es la capacidad de corte, no el I²t.

### 5.5 Envejecimiento por arranques repetidos

Schurter dice que los fusibles retardados suelen tener el hilo de fusión estañado y que con el tiempo el estaño se difunde en el hilo y cambia la característica tiempo-corriente. La tabla 2 del libro blanco aplica el factor de pulsos a esto ([escies.org](https://escies.org/download/webDocumentFile?id=62211)). **No cita "fatiga térmica" con ese nombre.** No hay cifras de cuántos arranques hacen fallar un 2,5 A concreto. Para esta máquina el riesgo es el reinicio frecuente (cortes de luz, encendido y apagado seguidos), no el uso normal.

### 5.6 Portafusibles: contacto flojo, oxidación, calor

- Según Schurter, IEC fija un máximo de 5 mΩ de resistencia de contacto entre fusible y clip. IEC prueba los portafusibles con un fusible ficticio de 40 mΩ, durante 500 h, y las partes accesibles no pueden pasar de 85 °C ([libro blanco](https://escies.org/download/webDocumentFile?id=62211)). Viox dice que el portafusibles forma parte del recorrido térmico del fusible.
- **Con 0,1-0,25 A el calentamiento por contacto es despreciable** (cálculo mío: 5 mΩ × 0,25² = 0,3 mW). **El riesgo de un contacto flojo en un portafusibles a 230 V es intermitencia y chispas, no el calor.**
- **No he encontrado fuentes sobre fusibles que se aflojan u oxidan en máquinas de bar.** Es una deducción mía por vibración y humedad: el módulo está en la trasera de la caja de arriba (guía, §4).

### 5.7 Temperatura dentro de la caja

- Schurter indica una reducción de alrededor del 20 % a 60 °C para fusibles estándar en un portafusibles; para su fusible SMD UMT 250, del 17 % ([libro blanco](https://escies.org/download/webDocumentFile?id=62211), fig. 1). Para el T2,5A cerámico eso sería unos 2,0 A efectivos a 60 °C.
- **A 40 °C no hay cifra de fuente.** Con una interpolación lineal mía entre 25 y 60 °C saldría de un 8 % menos (unos 2,3 A). Es una estimación, no un dato.
- Littelfuse tiene una curva de re-rating en la hoja 215, pero **mi herramienta solo extrajo el título, sin valores**, y sus PDF específicos de derating no abrieron (apartado 7).
- Ningún caso cambia la elección: a 0,56 A de máximo, la corriente es el 28 % de los 2,0 A de 60 °C. Lo que el calor sí puede hacer es acelerar el envejecimiento del estaño (Schurter, sin cifras) y bajar algo el I²t de prearco (**sin verificar**, deducción: el calentamiento es casi adiabático en pulsos de milisegundos).

### 5.8 Dispersión del I²t entre fabricantes

11,7 a 32 A²s para el mismo T2,5A cerámico H (apartado 2.2). Si se cambia de marca o si el pedido de Amazon cambia de fabricante entre lotes, el margen del apartado 4.3 cambia. El caso de peor margen que he visto (Schurter, 11,7) sigue pasando el criterio con 1,5 A²s.

### 5.9 Confundir el fusible del módulo con el de la máquina

El módulo trae un fusible de 10 A (guía, nota 15) y la guía exige cambiarlo. Un T2,5A abre en 5 s como máximo con 10 A; un fusible de 10 A no abriría con esa corriente (deducción mía). Si es del tipo habitual de 8-12 A, la tabla de Eaton para esa banda no lo obliga a abrir antes de 30 min con 15 A. **Riesgo mío:** que el de 10 A quede en una bolsa de repuestos y alguien lo vuelva a poner.

## 6. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Mantén el T2,5A cerámico H.** Es el valor más bajo que pasa el arranque con margen razonable en todos los casos del apartado 4.3. No bajes a T2A o menos sin conocer la capacidad del condensador y el I²t real de tu marca. No subas a T3,15A: no aporta nada y abre más tarde.
2. **Compra el fusible a un distribuidor con marca, o pruébalo a fondo.** Alternativas de marca con T2,5A cerámico H que he encontrado en hojas: Littelfuse 215 (`021502.5MXP` por el esquema de numeración de su hoja, sin verlo en un distribuidor), Schurter SPT (`0001.2508`), Eaton Bussmann S505 (`BK-S505-2-5-R` por la regla de numeración de la hoja, sin verlo en un distribuidor), Bel 5HT 2.5-R y ESKA 522.721. **No he visto precios de distribuidor** (sin verificar). Si un lote de Amazon pasa las pruebas siguientes, vale; si no, devuélvelo.
3. **A la recepción, de cada lote (con el cable de red desenchufado):**
   - Lee el marcado: debe poner corriente, `H` y `250V` (por ejemplo `T2.5AH250V`) y alguna marca de aprobación legible (VDE/ENEC, UL, CCC, PSE...). Un marcado de `T2.5A 250V` sin H o con letras borrosas es motivo para rechazarlo. Apunta el número de certificado y búscalo en la base de datos de la entidad.
   - Mide la **resistencia en frío del T2,5A**. Esperado: unos 39-42 mΩ (Littelfuse 38,6; Eaton 39,5). Mi criterio de aceptación: **30-50 mΩ**; fuera de eso, rechazar. Un valor muy bajo sugiere hilo demasiado grueso (no abriría a tiempo); uno muy alto, hilo demasiado fino o mal contacto (deducción mía). **Cómo medirlo:** un polímetro de mano en 2 hilos no vale: sus cables suman 0,1-0,3 Ω (cifra típica mía, sin fuente), más que el fusible. Usa un miliohmímetro de 4 hilos o el método de caída de tensión: una fuente de laboratorio en corriente constante a 0,25 A (el 10 % de In, como mide Eaton) y un voltímetro de mV con puntas separadas de los cables de corriente, colocadas en los tapones. A 38,6 mΩ y 0,25 A deben salir unos 9,7 mV; a 1 A, 38,6 mV. A 2,5 A, unos 97 mV (Schurter típico 100 mV; máximo 180 mV).
   - Pesa y compara varios de la misma tanda: diferencias grandes entre piezas indican mezcla de fabricantes o falta de relleno (criterio de PATTA, sin referencia de peso para 5×20).
   - Abre uno por tanda, cortando el tapón con una lima o una sierra: debe verse arena compacta y el hilo con el estañado. **Eso solo comprueba el relleno; la capacidad de corte de 1500 A no se puede comprobar sin un banco de ensayo.**
   - Prueba de apertura de una muestra (ensayo destructivo, con riesgo de proyecciones: protección ocular y una pantalla), con una fuente de laboratorio de baja tensión y corriente limitada, nunca con la red: a 10 A (400 %) debe abrir entre 0,095 y 5 s; a 6,9 A (275 %), entre 0,75 y 80 s. Si no abre, es un genérico falso o defectuoso (misma prueba que los hilos de EEVblog). **Es una prueba de la curva, no de la capacidad de corte.**
4. **Medir la corriente de cortocircuito posible en el enchufe del bar** con un medidor de impedancia de bucle (un electricista lo tiene). Si supera 1,5 kA, no basta un fusible H de 1500 A (apartado 4.4). Pregunta también qué magnetotérmico y diferencial protegen esa toma.
5. **Repuestos:** deja **2 fusibles por máquina** en el kit de servicio, en bolsa cerrada y seca, separados del resto. Con un paquete de 10 salen unas 3 máquinas (1 montado y 2 de repuesto). Guarda además 2-3 fusibles de cada lote sin usar, como referencia por si hay que comparar un fusible sospechoso.
6. **Si un T2,5A se funde, no es mantenimiento, es un síntoma.** Cámbialo una vez; si se vuelve a fundir, no pongas uno mayor y busca el fallo (cable, interruptor, fuente) con la máquina desconectada.
7. **Quita y tira el fusible de 10 A del módulo** (o guárdalo marcado y aparte): un 10 A en la máquina deja sin protección práctica el tramo de 1,5 mm² y la fuente ante fallos de 10-25 A (apartado 5.9).
8. **Etiqueta junto al portafusibles** (legible, resistente a la humedad y al calor), con este texto o similar:

   > FUSIBLE: T 2,5 A H 250 V (5×20 mm, cerámico, retardado).
   > Sustituir solo por el mismo tipo y valor. Desconectar el cable de red antes de abrir.

   **Por qué:** IEC 62368-1, apartado F.3.5.3, pide marcar los datos del fusible de recambio y explicar el código de marcado en las instrucciones si lo puede cambiar una persona normal ([resumen de UL](https://japan.ul.com/wp-content/uploads/sites/27/2014/06/1_techbrief_equipmentmarkings.pdf), fuente secundaria). **No he podido leer qué dice EN 60335-1 ni EN 60335-2-82 sobre el marcado de fusibles**, y la ITC-BT-19 no lo trata. Etiquetar es barato; confirma con un laboratorio o con el texto de la norma antes de la declaración de conformidad.
9. **Polo del fusible:** decide con un electricista si se acepta el fusible en un solo conductor (apartado 4.6) o si se usa un módulo con dos fusibles. Si se usan dos, cuenta el doble de repuestos.
10. **Prueba de funcionamiento del conjunto:** con el cable desenchufado, mide continuidad entre el pin de fase del C14 y el borne L de la fuente a través del fusible y el interruptor, y comprueba que con el fusible quitado no hay continuidad. Esto también te dice qué pin lleva el fusible (ficha de #15).
11. **No encender y apagar seguido** (ya en la guía): es el caso en que sube el I²t del arranque (apartado 4.2).
12. **Que un electricista revise la parte de 230 V y la tierra antes de enchufar** (aviso de la guía). El fusible no sustituye a la tierra.

## 7. Lo que no he podido verificar

- **El anuncio de Amazon (B0956XYTN6):** marca, marcado H, certificados, tolerancias. Amazon bloquea mi acceso.
- **La hoja oficial de Littelfuse 215** (enlace de la guía) y el **Fuseology Design Guide** (enlace de la guía): mi herramienta rechazó esas URL ("el usuario no respondió a una petición de permiso a tiempo"). Usé la copia de Chipdip (Rev. 11/30/21) y la página 4 del catálogo Fuseology. De la copia no pude leer bien la columna de capacidad de corte ni la tabla de aprobaciones. La curva de re-rating de temperatura de la hoja 215 es una gráfica sin valores en mi extracción. También se rechazaron las páginas 3, 5, 6 y 7 de ese catálogo y dos PDF de Littelfuse sobre derating (no abrieron). Por eso **no tengo la regla de Littelfuse de I²t por número de ciclos** y uso la de Schurter.
- **La hoja oficial de la LRS-50** (enlace de la guía): rechazada. Usé dos copias (RS 2015 y Mean Well Australia 2025) con extracción desordenada por columnas. **No he verificado:** que 0,56 A a 230 VAC sea del modelo de 5 V (la extracción lo da para toda la serie), la duración del pico de 45 A, la capacidad del condensador de entrada, si lleva termistor, el valor y la capacidad del fusible interno, y la curva de derating con la temperatura.
- **El texto de IEC 60127-1 y -2:** no lo he leído. Sin verificar: E = 150 A, L = 35 A o 10 × In (solo lo veo en hojas de vidrio), los límites normativos de I²t, y si la numeración de hojas cambió en la edición de 2024.
- **Datos sin publicar por el fabricante o ilegibles:** resistencia en frío y I²t de Bel 5HT; resistencia y temperatura de ESKA; resistencia en frío de Schurter. La tabla de ESKA tiene columnas dudosas.
- **ESFI, CPSC y UL:** no encontré informes sobre fusibles 5×20 falsos. Se agotó el presupuesto de búsquedas web antes de seguir. Las pruebas que cito son de foros (EEVblog) y de prensa británica de otro tipo de fusible.
- **Pesos y cotas de referencia** de un fusible 5×20 genuino para detectar falta de arena.
- **Fusibles aflojados u oxidados en máquinas de bar:** no hay fuente; las anotaciones son deducciones mías.
- **REBT:** la ITC-BT-22 no abrió (rechazada). No sé qué magnetotérmico hay en los bares ni la corriente de cortocircuito de la toma. **EN 60335-1 y EN 60335-2-82:** no he leído su marcado de fusibles ni su requisito de componentes.
- **Tiempos de 2,55 In del magnetotérmico:** la hoja de Schneider da 60 s y 1 s sin aclarar el calibre.
- **Precios y disponibilidad en distribuidores** de las alternativas con marca.
- **Cuál de los dos polos lleva el fusible en el módulo C14 (#15)** y si su cajón tiene dos alojamientos.

## 8. Fuentes

Todos los enlaces, ordenados por tipo y con nota en los que no se abrieron, en [`enlaces.md`](enlaces.md).
