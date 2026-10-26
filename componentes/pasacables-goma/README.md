# Pasacables de goma (ojales protectores), surtido de 7 tamaños, 260 uds.

Anillos de goma o plástico que se encajan en los agujeros de la chapa por donde pasan cables. Protegen el aislante del cable contra el canto de la chapa. En esta máquina hay 230 V en la caja de arriba y una caja interior suspendida con muelles, así que el cable roza el canto y se mueve.

- **Dónde van (según la guía de montaje, §1 fila 31):** "en todos los agujeros de chapa por donde pase cable". §4 dice que los cables de la caja interior "salen por pasacables con holgura".
- **Compra:** ASIN B0B5DLWVZ2, 7,99 € (precio de la hoja de componentes del 19-20-10-2026). Número 31 de la hoja. Son unos 0,031 € por pieza (cálculo mío: 7,99 / 260).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Los cálculos y las deducciones propias llevan la etiqueta "mío" o "mía". Amazon bloquea el acceso a mi herramienta, así que **no he visto el anuncio**: el precio y la referencia son los de tu hoja. Una búsqueda del ASIN no devolvió ninguna página del producto, así que **material, tamaños, ranura, cantidades y certificaciones del surtido son desconocidos**.

Es una pieza genérica sin datasheet. Esta ficha documenta qué dicen las fichas de fabricantes serios, qué exige la normativa que he podido leer, qué falla en estos surtidos y qué hay que medir antes de comprar y al recibir.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales y normativa](#3-documentos-oficiales-y-normativa)
4. [Uso en el proyecto](#4-uso-en-el-proyecto)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Qué comprobar antes de comprar y al recibirlo](#6-qué-comprobar-antes-de-comprar-y-al-recibirlo)
7. [Alternativas](#7-alternativas)
8. [Recomendaciones para el alcoholímetro](#8-recomendaciones-para-el-alcoholímetro)
9. [Discrepancias con la guía de montaje](#9-discrepancias-con-la-guía-de-montaje)
10. [Lo que no he podido verificar](#10-lo-que-no-he-podido-verificar)
11. [Fuentes](#11-fuentes)

---

## 1. Resumen para el proyecto

- **El grosor de la chapa es el dato que decide todo y la guía no lo da.** Los "2,6 mm" de la guía son el solape del marco sobre el borde del Solo, (83,16 − 78) / 2 = 2,58 mm (cálculo mío, ya señalado en la ficha del [alargo de antena](../alargo-antena-rp-sma-30cm/README.md)), no un grosor. Los pasacables de goma de uso general se hacen para paneles finos: 1,6 mm en Heyco y en el TPE de Essentra, "típicamente 1,5 a 2 mm" en un surtido parecido de 260 piezas. Si la chapa es de 2,5 o 3 mm, **un surtido genérico probablemente no asienta** (deducción mía). Hay familias con ranura de 2,0 a 6,0 mm, pero hay que pedirlas por grosor ([sección 4.2](#42-ajuste-a-la-chapa-el-grosor)).
- **Varios pasos no son un agujero redondo con un cable.** La guía ya habla de una ranura de 14 × 9 mm para el conector del Solo; la ficha del FFC pide una ranura de unos 18 × 3 mm para un cable plano de 16 mm; la pantalla trae un HDMI de tamaño completo. Un pasacables redondo del surtido no sirve para una ranura: hace falta un perfil de borde o un pasacables ovalado ([sección 4.3](#43-ajuste-al-cable-y-a-los-conectores)).
- **El separador está junto a la fuente de 50 W.** La guía mueve el paso de cables a x ≈ +30 mm "porque la fuente lo tapa". Los pasacables de PVC de HellermannTyton están dados para −30 a +60 °C, y el PVC de Essentra, hasta 80 °C. La goma SBR y el nailon de Heyco llegan a 105 °C. Del anuncio no sé nada. Mide la temperatura en el separador antes de elegir material ([sección 5.3](#53-calor-cerca-de-la-fuente)).
- **El pasacables no es aislamiento ni alivio de tracción.** Solo evita que el canto corte el cable. Los hilos de la manguera H05VV-F, pelada como pide la guía, quedan con solo 0,7 mm de PVC (ficha del [cable de 230 V](../cable-h05vv-f-3g1-5-5m/README.md)). Según la guía, ni L ni N cruzan el separador, solo la tierra (deducción mía, a confirmar en el diseño).
- **Normativa.** Que los agujeros en metal tengan bordes redondeados o casquillo lo he podido leer en IEC 60950-1, **no en EN/IEC 60335-1** (de pago, vistas previas bloqueadas). Aparte, los pasacables de PVC pueden llevar ftalatos: la Directiva (UE) 2015/863 limita cuatro al 0,1 % en equipos eléctricos y la guía no menciona RoHS en su lista de directivas ([sección 3](#3-documentos-oficiales-y-normativa)).
- **Calidad.** No encontré pruebas independientes de estos surtidos. El único kit parecido que pude leer da una temperatura contradictoria (−5 a +40 °C en la ficha, hasta +80 °C en las preguntas frecuentes), no da cantidades por tamaño ni diámetros de agujero. Cuesta 7,99 €: es barata, pero es la pieza que protege el aislante de los cables, y de la tierra, en cada agujero. Pide una muestra y mídela antes de montar en serie ([sección 6](#6-qué-comprobar-antes-de-comprar-y-al-recibirlo)).

## 2. Especificaciones

### 2.1 Lo que se sabe del anuncio

| Característica | Valor | Fuente |
|---|---|---|
| Referencia de compra | ASIN B0B5DLWVZ2, 7,99 € | Hoja del usuario / guía de montaje, §1 fila 31 |
| Descripción | "De goma, 7 tamaños (260 uds.)" | Guía de montaje |
| Precio por pieza | 0,031 € | Cálculo mío |
| Material real (goma, PVC, TPE, silicona) | **Sin verificar** | Amazon bloquea el acceso |
| Tamaños: si el número es el agujero de la chapa (D) o el diámetro interior (d) | **Sin verificar** | |
| Cantidad por tamaño | **Sin verificar** | |
| Grosor de chapa admitido (ranura) | **Sin verificar** | |
| Temperatura de servicio | **Sin verificar** | |
| Dureza (Shore A), inflamabilidad (UL 94) | **Sin verificar** | |
| Declaración RoHS o REACH, marcado CE | **Sin verificar** | |
| Marca, vendedor, color | **Sin verificar** | |

### 2.2 Qué dan los fabricantes (para saber qué esperar)

Son fichas de otros productos, no del tuyo. Sirven de referencia de lo que **debería** declarar un pasacables decente. "Panel" es el grosor de chapa que admite la ranura.

| Familia | Material | Agujero en la chapa (mm) | Panel / ranura (mm) | Diámetro interior (mm) | Temperatura | Inflamabilidad | Fuente |
|---|---|---|---|---|---|---|---|
| HellermannTyton HV (26 tipos) | PVC (solo HV1502) y PVC-FR (el resto). Shore A 70 ± 5 el PVC y 56 ± 5 el PVC-FR | 6,0 a 52 | 0,8 a 6,0 (columna H2, interpretación mía) | Ø D de 4,0 a 44 (interpretación mía) | −30 a +60 °C | PVC: HB. PVC-FR: V0 (el datasheet cita UL 94) | [datasheet HV](https://docs.rs-online.com/6b0c/0900766b81491346.pdf) |
| Heyco RG, goma | SBR de serie; nitrilo (G1018, G1349), EPDM (G1037), isopreno (G1053) | 6,4 a 38,1 en la tabla de 1,6 mm; la línea llega a 60,3 | 1,6 en la tabla; la línea cubre 1,6 a 4,8 | 3,2 a 31,8 | −40 a +105 °C | No indicada | [Heyco](https://www.heyco.com/?p=124022), [PDF](https://www.heyco.com/wp-content/uploads/2024/06/6_19-rev.pdf) |
| Heyco goma para panel grueso | SBR | 7,9 a 63,5 (38 tamaños) | 6,4 y 9,5 | No lo vi | −40 a +105 °C | No indicada | [G1324](https://media.iewc.com/SpecificationSheets/G1324.pdf) |
| Heyco SB / SBT, buje de nailon | Nailon 6/6 | 9,5 a 152,4 según serie | Hasta 3,2 (SB de 22,2 a 50,8), 4,3 (SB 375-281), 6,4 (SBT y SB mayores) | Reductores: más pequeño que el agujero | Máx. 105 °C (índice del material 125 °C); el reductor, −18 a 105 °C | 94V-2; UL E15331; CSA 8919 | [Quick Specs 5-04](https://www.mouser.com/ds/2/184/5-04-23725.pdf), [5-02](https://www.mouser.com/ds/2/184/5-02-23593.pdf), [reductor](https://media.iewc.com/SpecificationSheets/2058.pdf) |
| Essentra 10325407 | PVC | 20,0 | 2,0 | 16,0 (exterior 28; alto 8) | Hasta 80 °C | No indicada | [página](https://www.essentracomponents.com/en-za/p/standard-open-grommets/042160069907) |
| Essentra 10325438 | PVC | 31,0 | 3,0 | 25,0 (exterior 35; alto 10) | Hasta 80 °C | No indicada | [página](https://www.essentracomponents.com/en-za/p/standard-open-grommets/042250069907) |
| Essentra 10089521 | TPE | 6,4 | Máx. 1,6 | 4 | −40 a +135 °C | UL 94 HB | [TME](https://www.tme.com/ca/en/details/ess-10089521/grommets/essentra/10089521/) (datasheet no leído) |
| Surtido de 260 piezas de otra tienda (no es tu anuncio) | "Goma negra flexible" | No indica | "Típicamente 1,5 a 2" | "M3 a M12 (diámetro interior)" | −5 a +40 °C en la ficha; "hasta +80 °C" en las preguntas | No indicada | [Probots](https://probots.co.in/rubber-grommet-assortment-kit-m3-to-m12-wire-protection-ring-260-pcs.html) |

Notas:

- **Qué quieren decir las columnas del datasheet de HellermannTyton.** El datasheet las rotula "Bundle Ø max.", "Hole Ø (FH)", "Ø D", "Height (H)" y "Height (H2)" y no las define (la columna del dibujo viene vacía). Dos copias del datasheet en RS (HV1207 y HV1302) tienen la misma tabla. En el listado de RS del HV1207, "Hole" (10 mm) es el agujero, "cable máximo" (6 mm) coincide con Ø D y "panel mínimo" (1,5 mm) coincide con H2. En el HV1302 coincide H2 = 3 mm con el "panel mínimo 3 mm" de RS. Por eso leo H2 como el grosor de chapa. Es una interpretación mía a partir de dos piezas.
- **En la goma de Heyco, el diámetro interior es unos 3,2 mm menor que el agujero** en los tamaños corrientes (6,4 → 3,2 o 4,0; 9,5 → 6,4; 12,7 → 9,5; 15,9 → 12,7). Cálculo mío con la tabla de Heyco. Es decir: el número "grande" es el agujero y el "pequeño" es lo que ciñe al cable.
- **El mismo pasacables lleva dos números.** RS titula el HV1207 como "pasacables de 10 mm para cable de 6 mm como máximo"; el datasheet lo lista con agujero 10 y Ø D 6. El surtido de Probots rotula por diámetro interior ("M3 a M12"). Un "6 mm" sin más puede ser un agujero de 6 o uno de 10.
- **Heyco no da dureza, inflamabilidad ni resistencia al ozono ni al aceite** en las hojas que abrí. Dice que el SBR tiene "buena resistencia al agua" y sirve para "la mayoría de productos químicos moderados".
- **Inflamabilidad.** HB, V-2 y V-0 son clases de UL 94 sobre una probeta de 127 × 12,7 mm: HB (horizontal) exige un avance de llama menor de 76 mm/min en probetas de menos de 3 mm o que se apague antes de 100 mm; V-0 (vertical) exige que se apague en 10 s sin goteo inflamado; V-2 en 30 s, con goteo inflamado permitido ([Wikipedia](https://en.wikipedia.org/wiki/UL_94)).
- **Fuerza de arranque.** Los bujes de nailon de Heyco resisten más de 35 libras de empuje hacia atrás (unos 156 N, cálculo mío). No encontré cifra para ningún pasacables de goma.

### 2.3 Tabla completa de HellermannTyton HV (para elegir por grosor)

Datasheet de octubre de 2015 ([PDF](https://docs.rs-online.com/6b0c/0900766b81491346.pdf)). Medidas en mm. Columnas tal como las da el datasheet; H2 = grosor de chapa (interpretación mía).

| Tipo | Bundle Ø máx. | Hole Ø | Ø D | H | H2 | Material | Color |
|---|---|---|---|---|---|---|---|
| HV1212 | 9,0 | 6,0 | 4,0 | 7,0 | 1,0 | PVC-FR | Negro |
| HV1201 | 9,5 | 6,4 | 4,0 | 5,6 | 1,6 | PVC-FR | Negro |
| HV1201B | 9,5 | 6,4 | 4,0 | 6,5 | **2,5** | PVC-FR | Negro |
| HV1215 | 10,0 | 8,0 | 6,0 | 5,0 | 1,0 | PVC-FR | Negro |
| HV1209 | 11,0 | 9,0 | 4,0 | 5,5 | 1,5 | PVC-FR | Negro |
| HV1208 | 14,0 | 9,5 | 8,0 | 8,0 | 1,5 | PVC-FR | Negro |
| HV1207 | 14,0 | 10,0 | 6,0 | 6,4 | 1,5 | PVC-FR | Negro |
| HV1218 | 14,0 | 10,0 | 6,0 | 9,0 | **4,0** | PVC-FR | Negro |
| HV1216 | 14,5 | 8,0 | 5,0 | 6,5 | 1,5 | PVC-FR | Negro |
| HV1210 | 15,0 | 9,0 | 6,0 | 10,5 | **2,0** | PVC-FR | Negro |
| HV1203 | 17,5 | 12,0 | 10,0 | 6,8 | **2,0** | PVC-FR | Negro |
| HV1204 | 17,5 | 12,0 | 10,0 | 8,8 | **4,0** | PVC-FR | Negro |
| HV1206 | 17,5 | 12,0 | 10,0 | 10,8 | **6,0** | PVC-FR | Negro |
| HV1205 | 17,5 | 13,5 | 10,0 | 8,7 | **4,0** | PVC-FR | Negro |
| HV1303 | 15,9 | 11,0 | 8,0 | 6,4 | 1,6 | PVC-FR | Negro |
| HV1301 | 15,9 | 11,0 | 8,0 | 7,0 | 1,0 | PVC-FR | Negro |
| HV1302 | 15,9 | 11,0 | 8,0 | 9,0 | **3,0** | PVC-FR | Negro |
| HV1304 | 15,9 | 11,0 | 8,0 | 10,8 | **6,0** | PVC-FR | Negro |
| HV1305 | 24,0 | 18,0 | 14,0 | 7,0 | **3,0** | PVC-FR | Negro o blanco |
| HV1101 | 25,5 | 19,0 | 12,0 | 10,0 | 1,6 | PVC-FR | Negro |
| HV1401 | 15,9 | 9,5 | 5,0 | 4,8 | 0,8 | PVC-FR | Negro |
| HV1402 | 23,0 | 18,5 | 6,0 | 7,0 | **2,0** | PVC-FR | Negro |
| HV1502 | 11,5 | 8,0 | 6,5 | 8,0 | 1,5 | PVC | Negro |
| HV1606 | 31,0 | 25,0 | 17,0 | 11,0 | **3,0** | PVC-FR | Gris |
| HV1607 | 43,0 | 37,0 | 29,0 | 11,0 | **3,0** | PVC-FR | Gris |
| HV1608 | 58,0 | 52,0 | 44,0 | 11,0 | **3,0** | PVC-FR | Gris |

En negrita, los de 2,0 mm o más. Que el datasheet los publique no quiere decir que se puedan comprar en Amazon.es: **no lo he comprobado** (RS, Mouser y TME son otras vías).

## 3. Documentos oficiales y normativa

Un surtido genérico no tiene datasheet. Estos son los documentos de referencia que he podido abrir, más las normas que aplican.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| HellermannTyton, serie HV (pasacables PVC y PVC-FR) | Datasheet, octubre de 2015 | PDF | [descargar](https://docs.rs-online.com/6b0c/0900766b81491346.pdf) |
| HellermannTyton HV1207 / HV1302 en RS | 633-02070 / 633-03020 | Web | [HV1207](https://uk.rs-online.com/web/p/cable-grommets/1879504?gb=s) · [HV1302](https://uk.rs-online.com/web/p/cable-grommets/1879302?gb=s) |
| Heyco Rubber Grommets, panel de 1,6 mm | 6_19 rev. (2024) | PDF | [descargar](https://www.heyco.com/wp-content/uploads/2024/06/6_19-rev.pdf) · [página](https://www.heyco.com/?p=124022) |
| Heyco Thick Panel Rubber Grommets | G1324 | PDF | [descargar](https://media.iewc.com/SpecificationSheets/G1324.pdf) |
| Heyco Thick Panel y Knock Out Snap Bushings | Quick Specs 5-04 | PDF | [descargar](https://www.mouser.com/ds/2/184/5-04-23725.pdf) |
| Heyco Snap Bushings | Quick Specs 5-02 | PDF | [descargar](https://www.mouser.com/ds/2/184/5-02-23593.pdf) |
| Heyco Reducer Snap Bushing | 2058 | PDF | [descargar](https://media.iewc.com/SpecificationSheets/2058.pdf) |
| Essentra, pasacables abiertos de PVC | 10325407 y 10325438 | Web | [Ø20 mm](https://www.essentracomponents.com/en-za/p/standard-open-grommets/042160069907) · [Ø31 mm](https://www.essentracomponents.com/en-za/p/standard-open-grommets/042250069907) |
| Essentra, pasacables de TPE | 10089521 | Web (datasheet bloqueado) | [TME](https://www.tme.com/ca/en/details/ess-10089521/grommets/essentra/10089521/) |
| IEC 60950-1:2005+A1:2009+A2:2013 (extracto) | Apartados 3.1.2 y 3.2.7 | Web, texto OCR | [ver](https://www.docketalarm.com/cases/PTAB/PGR2021-00056/VoltServer_Inc/02-16-2021-Petitioner/Exhibit-1023-54-Exhibit_1023_Part_3_of_11) |
| IS 302 (Parte 1):2024 / IEC 60335-1:2020, plantilla de informe de BIS | Solo el índice | PDF | [ver](https://www.bis.gov.in/wp-content/uploads/2025/09/3.pdf) |
| EVS-EN IEC 60335-2-82:2022 | Alcance y ediciones | Web | [ver](https://www.evs.ee/en/evs-en-iec-60335-2-82-2022) |
| Directiva Delegada (UE) 2015/863 (ftalatos en RoHS) | Anexo II de 2011/65/UE | HTML | [ver](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L0863) |
| Real Decreto 219/2013 (RoHS en España) | BOE | Web | [ver](https://www.boe.es/eli/es/rd/2013/03/22/219) |
| ITC-BT-19, instalaciones interiores: prescripciones generales | REBT | PDF | [ver](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-19.pdf)) |
| ITC-BT-36, instalaciones a muy baja tensión | REBT | PDF | [ver](https://www.plcmadrid.es/wp-content/uploads/rebt/itc36/ITC-BT-36.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-36.pdf)) |

### Qué dicen los más relevantes

**EN/IEC 60335-1 (cableado interno), lo que no he podido leer**

- Mi planteamiento inicial atribuía a EN 60335-1 tres exigencias: (a) cables protegidos de bordes cortantes y de partes móviles; (b) en un orificio de metal, bordes lisos o casquillo aislante resistente a la temperatura; (c) casquillo fijado de modo que no se quite sin herramienta. **No he podido leer la norma** (es de pago). Las vistas previas de VDE y de IEC no se abrieron (la herramienta las rechazó o bloqueó y no las rodeé), la plantilla de BIS y un informe CB de TDK-Lambda no traen el texto de la cláusula 23, y la copia india IS 302-1:2008 solo trae la carátula.
- Lo que sí consta: el índice de la plantilla de BIS (IS 302-1:2024 = IEC 60335-1:2020) titula la cláusula 23 como "HV test for basic insulation (int. wires)" y la 25 como "Supply connections and External Flexible Cables and cords". Es decir, **la cláusula 23 trata del cableado interno** y la 25, de la conexión a la red. El texto de los requisitos no figura.
- La norma de producto que cita la guía también cambia de edición: EVS-EN IEC 60335-2-82:2022 queda **retirada el 16-9-2026** y la sustituye la edición de 2026 (página de EVS). Qué dice la edición de 2026 sobre cableado: **sin verificar**.

**IEC 60950-1 (norma hermana), lo que sí he leído**

- El apartado 3.1.2, "Protección contra daño mecánico", dice que los agujeros en metal por donde pasan hilos aislados deben tener superficies lisas y bien redondeadas o llevar casquillos, y que las canalizaciones deben ser lisas y sin bordes cortantes. El apartado que la extracción numera 3.2.7 exige que los casquillos de entrada del cordón de red estén bien fijados y no se puedan quitar sin herramienta. ([extracto en docketalarm](https://www.docketalarm.com/cases/PTAB/PGR2021-00056/VoltServer_Inc/02-16-2021-Petitioner/Exhibit-1023-54-Exhibit_1023_Part_3_of_11); es OCR, la numeración exacta del segundo punto no la he comprobado en el original.)
- **Conclusión mía:** las exigencias (a) y (b) de mi planteamiento inicial son coherentes con esa norma hermana. La (c) en IEC 60950-1 es para los casquillos de **entrada del cordón de red**, no para el cableado interno. En esta máquina el cordón entra por un C14 desmontable, no por un agujero con casquillo (guía §2.7), así que (c) no parece aplicar a estos pasacables. Que IEC 60335-1 diga lo mismo: **sin verificar**.
- IEC 60950-1 fue sustituida por IEC 62368-1 (dato mío, sin fuente); la fuente LRS-50-5 cita EN 62368-1 y EN 60335-1 (guía §2.6). No he leído el texto equivalente de 62368-1.

**IEC 60529 (grado IP)**

- Las cifras de IP significan: primera cifra 5 = protegido contra el polvo y 6 = estanco al polvo; segunda cifra 4 = salpicaduras desde cualquier dirección y 5 = chorros de agua ([Wikipedia](https://en.wikipedia.org/wiki/IP_Code), fuente secundaria). La página no trata el caso de un agujero con pasacables, y **ninguna de las fichas de pasacables que abrí declara un grado IP**.
- **Conclusión mía:** la guía no fija un IP para la máquina, y tiene rejillas de ventilación arriba y abajo (§4). Un pasacables abierto aquí es protección del cable, no de sellado. Si en el futuro se quiere exigir un IP, el pasacables no sirve y habría que usar prensaestopas (sección 7).

**REBT (ITC-BT-19, ITC-BT-21, ITC-BT-36)**

- La ITC-BT-19 se aplica a las "instalaciones interiores" de edificios (sección 1). Sobre pasos por paredes y techos (sección 2.3) pide protección con tubo de resistencia mecánica adecuada y que los conductores de protección estén protegidos contra el deterioro en los pasos. **No contiene** nada sobre aristas, orificios, boquillas ni pasamuros de envolventes ([ITC-BT-19](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-19.pdf))).
- **La ITC-BT-21 no la he podido abrir** (la herramienta bloqueó la dirección). La ITC-BT-19 la cita para los tubos de canalizaciones empotradas y, de memoria (sin verificar), trata de tubos y canales protectoras. Qué dice sobre extremos de tubo o boquillas: **sin verificar**.
- La ITC-BT-36, sección 2.2, para circuitos MBTS/MBTP: la separación respecto a cualquier otro circuito se logra con separación física, con una vaina no metálica adicional, con una pantalla o vaina metálica a tierra, o con aislamiento para la tensión más alta en un cable multiconductor ([ITC-BT-36](https://www.plcmadrid.es/wp-content/uploads/rebt/itc36/ITC-BT-36.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-36.pdf))). No trata de que pasen por el mismo agujero.
- **Conclusión mía:** el REBT regula instalaciones de edificios, no el cableado interno de un aparato. No impone pasacables en esta máquina. Sirve de referencia para la regla de no mezclar red y 5 V (sección 4.5).

**RoHS y ftalatos**

- La Directiva Delegada (UE) 2015/863 añade al Anexo II de RoHS cuatro ftalatos, DEHP, BBP, DBP y DIBP, con un máximo del 0,1 % en peso en cada material homogéneo. Las disposiciones nacionales se aplican desde el 22-7-2019 (artículo 2.1), y para productos sanitarios y de vigilancia y control, desde el 22-7-2021 ([EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L0863)).
- La página del BOE del Real Decreto 219/2013 que abrí lista seis sustancias y **no cita los ftalatos ni la Directiva 2015/863**. No sé cómo los aplica España; **sin verificar**.
- **Conclusión mía:** si la máquina es un aparato eléctrico dentro del alcance de RoHS (lo creo probable, **sin verificar el alcance**), los pasacables de PVC plastificado sin declaración de material son un riesgo de cumplimiento. La guía §9 solo nombra baja tensión, compatibilidad electromagnética y radio.

## 4. Uso en el proyecto

### 4.1 Qué pasa por dónde (según la guía)

Fuente: guía de montaje, §1 filas 10, 13 y 31, §2.3, §4, §5.1 y §5.3, más las fichas indicadas. **El número de agujeros no consta en la guía**; esta lista sale de leer qué cables unen qué zonas (deducción mía). Los ficheros de diseño de la carcasa no los he podido leer.

| # | Paso | Qué lo atraviesa | Tamaño conocido | Observación |
|---|---|---|---|---|
| 1 | Separador → caja interior suspendida ("paso de cables", movido a x ≈ +30 mm) | Cables de la Pi (latiguillo micro-USB), del ZE29A (hilos de la clavija JST-XH) y tierra flexible | No consta | La guía dice que salen "con holgura". El latiguillo de 15 cm no deja holgura (ficha del [latiguillo](../latiguillo-micro-usb-22awg/README.md)) |
| 2 | Separador, ranura del Solo | Conector USB-A → USB-C acodado del Solo | **14 × 9 mm** (guía §1 fila 10) | Es una ranura, no un agujero redondo |
| 3 | Pi (caja interior) → cámara (caja de arriba) | Cable plano FFC de 15 pines | **16 mm de ancho** (ficha del [FFC](../cable-ffc-camara-50cm/README.md)); la ficha propone una ranura de unos 18 × 3 mm | Propuesta de esa ficha, no de la guía |
| 4 | Panel → caja suspendida | Tubo de silicona de la boquilla al ZE29A (opción A de la guía §4) | "6 mm", sin saber si interior o exterior (ficha del [tubo](../tubo-silicona-6mm/README.md)) | Pasa un tubo, no un cable: el pasacables tiene que ceñir su diámetro exterior, que hay que medir |
| 5 | Pi → pantalla | HDMI de tamaño completo (desde la Pi) y cable USB-C de alimentación de la pantalla (desde su borne USB-A, guía §1 fila 5 y §5.2) | Conector HDMI de tamaño completo: no cabe en los tamaños pequeños (observación mía, sin fuente) | El recorrido no consta |
| 6 | Caja suspendida → techo | Adaptador Wi-Fi AR9271 y alargo RP-SMA | El taladro de Ø6,5 mm del techo lleva conector con tuerca (ficha del [alargo](../alargo-antena-rp-sma-30cm/README.md)), no pasacables | El recorrido hasta el techo no consta |
| 7 | Tierra a la caja interior y al cajón | Verde-amarillo flexible "con holgura" (guía §5.1) | Hilo de 1,5 mm² con PVC de 0,7 mm (ficha del [cable de 230 V](../cable-h05vv-f-3g1-5-5m/README.md)) | Único conductor de la parte de red que cruza (deducción mía) |
| 8 | Entrada C14, antena, lente (Ø10), rejillas | Recortes para piezas, no pasos de cable | | No llevan pasacables, pero **sus bordes también deben estar sin rebabas** |

Los pasos 5 a 6 dependen de dónde esté cada pieza, que la guía no concreta. Si el HDMI es lo mayor que pasa por un hueco, el hueco lo fija el conector, no el cable.

### 4.2 Ajuste a la chapa: el grosor

- **La guía no da el grosor.** Lo único parecido es el "marco de acero de 2,6 mm" (§0 y §2.5), que es el solape sobre el borde del Solo, no el grosor ((83,16 − 78) / 2 = 2,58 mm, cálculo mío). Las fichas del módulo C14 y del alargo de antena ya piden medir la chapa por la misma razón.
- **Lo que admite la ranura de los pasacables que he visto:** 1,6 mm (Heyco, Essentra TPE); 2,0 y 3,0 mm (los dos Essentra de PVC de agujero grande); de 0,8 a 6,0 mm (HellermannTyton HV, según el listado de la tabla 2.3); "típicamente 1,5 a 2 mm" (el surtido de Probots). Un surtido de 7 tamaños pequeños de Amazon probablemente sea de 1 a 2 mm (suposición mía a partir de esos ejemplos).
- **Regla de ajuste (mía, sin fuente):** la ranura debería ser igual al grosor de la chapa, con una décima o dos de tolerancia. Si la chapa es más gruesa que la ranura, el borde del agujero no entra en el surco y el pasacables se sale al tirar del cable. Si es más fina, queda flojo y gira.
- **Cómo medir (mío):**
  1. Calibre de exteriores, mordazas sobre un canto desnudo de la pieza: el borde de otro agujero, una esquina o una pieza sobrante. Hazlo en el mismo tipo de chapa donde irá cada pasacables (la guía habla de techo, separador y bandeja, §5.1; pueden ser distintos).
  2. Mide en tres puntos y anota el menor y el mayor.
  3. Si miras con la pintura puesta, la pintura suma décimas de milímetro por cara (sin fuente): rasca un punto hasta el metal y mide.
  4. Compara con la ranura (H2 o "panel") del pasacables **en el catálogo**, no con el rótulo de la bolsa.
- **Qué elegir según el grosor medido** (con lo que he visto en fichas; la disponibilidad en Amazon.es no la he comprobado):

| Grosor medido | Opciones con ranura publicada |
|---|---|
| Hasta 1,6 mm | Surtido genérico (si lo declara), Heyco RG de 1,6 mm, Essentra TPE 10089521, HellermannTyton HV1201, HV1303, HV1101 |
| 2,0 mm | HV1203, HV1210, HV1402; Essentra 10325407 (Ø20) |
| 2,5 mm | HV1201B (agujero Ø6,4, interior 4,0) |
| 3,0 mm | HV1302, HV1305, HV1606 a HV1608; Essentra 10325438 (Ø31); Heyco SB (hasta 3,2 mm con agujero de 22,2 mm o más; el reductor, desde 9,5 mm) |
| 4,0 a 4,3 mm | HV1204, HV1205, HV1218; Heyco SB 375-281 (agujero de 9,5 mm, hasta 4,3 mm) |
| 6,0 a 6,4 mm | HV1206 y HV1304; Heyco SBT (hasta 6,4 mm, agujeros de 12,7 mm o más); Heyco goma de panel grueso (6,4 y 9,5 mm) |

- **No vi una serie "GR" de Heyco** en las fichas que abrí (mi planteamiento inicial mencionaba "Heyco GR/SB"). Las series que sí vi son RG (goma) y SB, SBT y UBT (nailon). Los SB cubren 3,2 mm, como pedía mi planteamiento inicial, pero a partir de agujeros de 9,5 mm (reductor) o de 22,2 mm (SB normal).

### 4.3 Ajuste al cable y a los conectores

- **Un pasacables ciñe, no sujeta.** El diámetro interior debe ser algo menor o igual que el del cable para que no baile. En la goma de Heyco el interior es unos 3,2 mm menor que el agujero (sección 2.2). Un pasacables flojo no cumple su función y deja el cable libre contra el canto.
- **El agujero lo fija lo más grande que pasa.** Si el cable lleva conector (USB-C, micro-USB, JST-XH, HDMI, RP-SMA), o es un cable plano, el agujero se dimensiona por el conector o por el ancho. Un pasacables redondo se elige por el cable solo si el conector se monta **después** de pasar el cable, o si el pasacables es de los que se colocan alrededor del cable ya montado (del anuncio no sé si los hay).
- **Ranuras.** La ranura de 14 × 9 mm del Solo y la de unos 18 × 3 mm del FFC no admiten pasacables redondos. Para una ranura, Wikipedia describe el "grommet edging": tiras extruidas o estampadas para aberturas grandes, irregulares o bordes rectos largos ([Wikipedia: Grommet](https://en.wikipedia.org/wiki/Grommet)); Heyco tiene una familia "Grommet Rolls and Channels" cuya página no pude abrir. La ficha del FFC ya propone la ranura con bordes protegidos. **Qué perfil concreto sirve: sin verificar.**
- **Alivio de tracción.** Un pasacables abierto no hace de alivio. Las fichas del cable USB y del borne USB-A piden una brida a 2-3 cm del conector. Mantenla.
- **Sellado.** Ninguna ficha de pasacables que abrí declara sellado ni IP. Aquí no se pide (sección 3, IEC 60529).

### 4.4 Cables que se mueven (la caja suspendida)

- **La caja interior se mueve sobre muelles y los cables salen "con holgura"** (guía §4). La guía no da la amplitud ni la frecuencia del movimiento: **pendiente**.
- **Radio de curvatura del cable.** Para la manguera H05VV-F los fabricantes dan 6×D en movimiento y 4×D fijo (Nexans IT), 5×D y 3×D (Faber) o 7,5×D y 4×D (RR Kabel); con un diámetro de 7,9 a 9,8 mm salen unos 49 a 71 mm en movimiento (cálculo de la ficha del [cable de 230 V](../cable-h05vv-f-3g1-5-5m/README.md)). Para el 2 × 0,75 mm² plano, 5×Ø en movimiento según Letronic (ficha del [cable 2 × 0,75](../cable-2x0-75-rojo-negro-10m/README.md)). Para el FFC, la ficha propone 10 mm como mínimo. Aplica al tramo entre el pasacables y la caja suspendida.
- **Rozamiento en el pasacables.** Cada movimiento frota el cable con el borde interior. Wikipedia describe los "sleeved grommets", con una extensión cónica flexible que reduce la tensión en el aislante ([Wikipedia: Grommet](https://en.wikipedia.org/wiki/Grommet)). **No encontré ninguna fuente sobre pasacables de fuelle ("bellows") ni sobre ciclos de vida de un pasacables bajo flexión.** Un fuelle o un manguito largo suena razonable, pero no puedo citarlo (opinión mía).
- **Recomendación de diseño (mía):** que el cable salga en la dirección del eje del agujero y que la caja se mueva sobre todo en ese eje; que la holgura sea un seno de unos pocos radios de curvatura, no un cable tirante; y que haya una brida en la parte fija y otra en la móvil, para que el movimiento se absorba entre las dos y no en el pasacables.

### 4.5 230 V, tierra y separación

- **Un pasacables no es aislamiento.** Solo evita que el canto corte el aislante. Si el cable se daña, el pasacables no impide el contacto con la chapa (razonamiento mío; IEC 60950-1 los trata como protección contra daño mecánico).
- **Aquí el hilo va sin funda.** La guía pela la manguera H05VV-F 3G1,5 y usa los tres hilos sueltos. Cada hilo queda con 0,7 mm de PVC y sin la funda que protegía el conjunto (ficha del [cable de 230 V](../cable-h05vv-f-3g1-5-5m/README.md)). Si algún día L o N cruzan un agujero, ese agujero debe llevar el mejor pasacables posible.
- **Según la guía, L y N no cruzan el separador.** La LRS-50-5 y la C14 están en la caja de arriba (§4); a la caja interior y al cajón solo van la tierra y los 5 V. Es deducción mía: hay que confirmarlo en el diseño.
- **Qué pasa si falla (razonamiento mío, sin cálculo).** Dos hilos de 5 V pelados que toquen la misma chapa quedan cortocircuitados entre sí; la guía no habla de fusible por rama (ver la ficha del [cable USB](../cable-usb-a-usb-c-90-30cm/README.md)), así que solo cortaría la fuente. Un hilo de red (L o N) contra la chapa de la máquina dependería de que la tierra sea buena y de que salten el fusible de 2,5 A o la protección de la instalación; no lo he calculado. Por eso conviene que L y N no pasen por agujeros de chapa.
- **Regla de separación.** Mantén red y 5 V en agujeros distintos o, mejor, en recorridos distintos. La ITC-BT-36 lo pide para MBTS en instalaciones (separación física, vaina adicional, pantalla a tierra o aislamiento para la tensión más alta); la norma de producto que manda aquí no la he leído (sección 3).

### 4.6 Cuántos hacen falta y qué tamaños

- **Cuántos agujeros:** no consta. De la tabla 4.1 salen entre 5 y 8 pasos según cómo se agrupen los cables (mío). Con N pasacables por máquina, un surtido de 260 da para 260 / N máquinas, siempre que cada tamaño tenga cantidad suficiente; la cantidad por tamaño del anuncio es desconocida.
- **Tamaños realmente necesarios:** dos o tres. El criterio es el objeto mayor que atraviesa cada paso. Con lo que consta: un haz de 5 V con la tierra, la ranura del Solo (14 × 9 mm), el FFC (16 mm de ancho) y, si procede, el HDMI. Las medidas reales (haz, conectores) hay que tomarlas con calibre en el montaje: **pendiente**.
- **El resto del surtido sobra.** Con 7 tamaños, si solo se usan dos o tres, quedan cuatro sin uso (mío). No es un problema de coste (0,031 € por pieza), pero la bolsa puede no incluir la talla que necesitas con la ranura que necesitas.
- **Ejemplos de cables de mi planteamiento inicial (5 mm la Pi, 4 mm la antena):** no constan en la guía; **sin verificar**. La ficha del alargo RP-SMA cita el coaxial RG316 (2,9 mm de diámetro exterior) como cable de referencia; el del anuncio no consta. Sus conectores son mayores que el cable, así que mandan ellos.

## 5. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Ranura que no encaja con el grosor de la chapa (el pasacables se sale o no asienta) | Alta si la chapa es de 2,5 mm o más; baja si es de 1,5 mm |
| 2 | Pasacables redondo para ranuras o conectores grandes | Media-alta |
| 3 | PVC plastificado: calor, envejecimiento y plastificante | Media |
| 4 | Calor junto a la fuente | Media, sin medir |
| 5 | Tamaños rotulados sin criterio (agujero o interior) | Media |
| 6 | Material sin declarar: ftalatos y RoHS | Media (cumplimiento) |
| 7 | Inflamabilidad sin declarar, junto a 230 V | Media |
| 8 | Cable cortado por rozamiento con el movimiento de los muelles | Media |
| 9 | Compatibilidad química (grasa, cerveza, limpiadores) | Baja-media, sin datos |
| 10 | Goma sensible al ozono (SBR, NBR) | Baja |
| 11 | Calidad variable del surtido y sin pruebas independientes | Media |

### 5.1 Ranura contra grosor de chapa

- Lo habitual en pasacables de uso general es 1,5 a 2 mm (Probots) o 1,6 mm (Heyco, Essentra TPE). La chapa de la máquina, si es de 2,5 a 3 mm, queda por encima de la ranura de esos modelos (suposición mía: no sé el grosor). Para esos grosores hay otras familias (tabla de la sección 4.2).
- **Síntoma:** el pasacables se deforma al meterlo, no asienta en el surco, o se sale al tirar del cable o con la vibración. Un pasacables fuera de su sitio deja el cable apoyado en el canto, que era justo lo que había que evitar.

### 5.2 PVC plastificado: endurecimiento, grietas y manchas

- **Lo que dicen las fuentes:** el PVC flexible lleva plastificantes que **no están unidos al polímero y pueden salir** (Wikipedia, [PVC](https://en.wikipedia.org/wiki/Polyvinyl_chloride) y [Plasticizer](https://en.wikipedia.org/wiki/Plasticizer)); sin ellos el PVC es duro y quebradizo; el PVC tradicional tiene un máximo de servicio de unos 60 °C, por encima del cual empieza la deformación por calor. Los pasacables HellermannTyton de PVC dan un máximo de 60 °C (datasheet HV).
- **Mi lectura:** un pasacables de PVC que pierde plastificante se endurece, se agrieta y puede dejar una película pegajosa o manchas en la superficie sobre la que apoya. Es una consecuencia razonable de lo anterior, **pero no la he encontrado descrita en una publicación de un fabricante de pasacables** (mi búsqueda sobre ese punto fue rechazada por el límite de búsquedas web del turno).
- **Quejas típicas en los surtidos de Amazon (olor a plastificante, colores que manchan):** vienen de mi planteamiento inicial; no he podido ver reseñas ni pruebas independientes. **Sin verificar.**
- El PVC no es la única opción: el EPDM aguanta ozono, intemperie y vapor (Wikipedia: [EPDM](https://en.wikipedia.org/wiki/Ethylene_propylene_diene_monomer_rubber)); el TPE de Essentra, de −40 a +135 °C (TME); el SBR de Heyco, de −40 a +105 °C.

### 5.3 Calor cerca de la fuente

- La LRS-50-5 va "tumbada en el separador" y la guía mueve el paso de cables a x ≈ +30 mm porque la fuente tapaba el sitio (§4). Es decir: hay pasacables cerca de una fuente de 50 W con carcasa perforada.
- Según la ficha de la [LRS-50-5](../meanwell-lrs-50-5/README.md), la hoja de la fuente solo da "−30 a +70 °C según la curva de derating" (curva que no se pudo leer), no lista protección contra sobretemperatura y hay que **medir la temperatura dentro de la caja cerrada**. Esa ficha también dice que su carcasa de chapa perforada puede quedar a potencial de red si falla el aislamiento y que hay que mantener los demás conductores alejados.
- El cable H05VV-F está dado para 60 °C (70 °C en el conductor dentro de equipos, según Nexans IT; ficha del [cable de 230 V](../cable-h05vv-f-3g1-5-5m/README.md)).
- **Conclusión mía:** si el separador pasa de unos 50 °C junto a la fuente, un PVC de 60 °C no tiene margen. Un EPDM, un TPE de 135 °C o un nailon de 105 °C sí. Y el pasacables del paso junto a la LRS no debe tocar su carcasa.

### 5.4 Tamaños mal rotulados

- Un mismo pasacables se anuncia con su diámetro de agujero (HV1207: "10 mm") o con su diámetro interior (HV1207: "6 mm"). El único surtido parecido que leí rotula "M3 a M12" por diámetro interior, sin dar los agujeros ni los exteriores.
- **Consecuencia:** puedes comprar un surtido "6, 8, 10, 12, 14, 16, 18" pensando en agujeros y recibir interiores. Entonces los agujeros reales serían de 3 a 4 mm mayores en cada talla (Heyco: unos 3,2 mm; HV1207: 4 mm; cálculo mío con las tablas). Y a la inversa.

### 5.5 Material sin declarar: ftalatos y RoHS

- La Directiva (UE) 2015/863 limita DEHP, BBP, DBP y DIBP al 0,1 % por material homogéneo (EUR-Lex). Un surtido de Amazon puede declararlo o no (**sin verificar**). Wikipedia dice que los ftalatos de bajo peso molecular como DEHP y DBP se están retirando del PVC.
- **Qué hacer (mío):** pide por escrito al vendedor la declaración de material y de RoHS/REACH. Para una máquina que se vende, conviene archivar la ficha de cada pasacables que se use (sección 8).

### 5.6 Inflamabilidad

- Las fichas distinguen: HellermannTyton HV es HB en PVC y V0 en PVC-FR; Heyco SB de nailon es 94V-2; el TPE de Essentra 10089521 es HB (TME). Heyco no declara nada para su goma. El resto de pasacables que vi no declaran.
- **Conclusión mía:** en una caja con 230 V y una fuente de 50 W conviene un pasacables con clase declarada (V-2 o V-0) en los pasos que estén a la vista de L y N. Lo que EN 60335-1 pide a los materiales no metálicos (cláusula 30): **sin verificar** (no he podido leerla).

### 5.7 Cable cortado por rozamiento

- Con la suspensión, el cable se mueve contra el borde interior del pasacables miles de veces. No encontré ciclos de vida de ningún pasacables. Wikipedia señala que la flexión repetida puede romper el aislante y que la forma del pasacables protege (Wikipedia: Grommet).
- Un pasacables duro (nailon) tiene el borde interior liso y rígido, que protege del canto de la chapa pero frota igual el cable (observación mía).

### 5.8 Compatibilidad química

- No encontré datos de compatibilidad de ningún pasacables con cerveza, grasa o limpiadores. Lo que hay: Heyco dice que su SBR tiene buena resistencia al agua y sirve para la mayoría de productos químicos moderados; el nitrilo (NBR) resiste aceites minerales y vegetales y combustibles (Wikipedia: [Nitrile rubber](https://en.wikipedia.org/wiki/Nitrile_rubber)); EPDM resiste agua y vapor (Wikipedia). Para EPDM y SBR frente a aceites o grasas: **sin verificar**.
- Dónde está el riesgo en esta máquina: los pasacables del separador están dentro de la caja, donde un derrame de cerveza llega por las rejillas. Es una observación mía; no hay dato de la guía sobre ello.

### 5.9 Ozono

- El SBR y el NBR son sensibles al agrietamiento por ozono bajo tensión; el EPDM, la silicona y el policloropreno, resistentes (Wikipedia: [Ozone cracking](https://en.wikipedia.org/wiki/Ozone_cracking)). Un pasacables apenas está en tensión, y el ozono es escaso dentro de una caja (mío). Riesgo bajo.

### 5.10 Calidad del surtido de Amazon

- **No encontré pruebas independientes ni reseñas técnicas de este ASIN ni de surtidos parecidos.** No pude buscar más (Amazon bloquea el acceso y el presupuesto de búsquedas del turno se agotó).
- **Lo único que vi:** el surtido parecido de Probots (260 piezas, siete compartimentos) no da cantidad por tamaño, agujeros ni exteriores, y su ficha dice −5 a +40 °C mientras las preguntas frecuentes dicen hasta +80 °C. Un anuncio que se contradice así no permite diseñar con él.
- **Qué esperar (mío):** que no haya ficha, que la "goma" sea en realidad PVC, TPE o silicona, y que haya variación entre lotes. Por eso existe la sección 6.

## 6. Qué comprobar antes de comprar y al recibirlo

Hazlo con una muestra de cada tamaño que vayas a usar. Estos ensayos son **míos**, no normalizados; los de dureza y envejecimiento tienen versiones normalizadas (ASTM D2240 para la dureza Shore, según Wikipedia; las de envejecimiento en horno no las he podido consultar).

| # | Qué | Cómo | Resultado esperado | Si no sale |
|---|---|---|---|---|
| 1 | **Grosor de la chapa** (antes de comprar) | Calibre en un canto desnudo, tres puntos | Un número con décimas de mm | No compres hasta tenerlo |
| 2 | **Ficha del vendedor** | Pregunta por escrito (texto abajo) | Material, agujero y ranura por talla, cantidades, temperatura, UL 94, RoHS/REACH | Sin respuesta = tratar como kit de prototipo |
| 3 | **Cotas de cada tamaño** | Calibre: agujero que requiere (diámetro del cuello), diámetro interior, ranura, diámetro de la cabeza, altura. Cinco piezas por tamaño | Cotas repetibles y coincidentes con el rótulo | Cualquier tamaño con más de 0,3 mm de dispersión (umbral mío) |
| 4 | **Olor** | Bolsa cerrada unas horas y luego abrirla | Sin olor fuerte a plastificante | Olor químico = PVC con plastificante volátil |
| 5 | **Tacto y estiramiento** | Estira el pasacables al doble de su interior y suéltalo | Vuelve a su forma sin deformación | Se queda estirado o se rompe |
| 6 | **Desgarro** | Corta una muesca de 2 mm en la ranura con una cuchilla y tira | No se propaga | Se desgarra enseguida |
| 7 | **Dureza** | A mano, comparando con una pieza de marca. Un durómetro Shore A **no sirve en un pasacables**: la norma pide piezas de al menos 6 mm de grosor (Wikipedia: Shore durometer) | Comparable a la pieza de marca (HV: 56 a 70 Shore A) | Mucho más duro o pegajoso |
| 8 | **Prueba de calor** | Horno de cocina a 60 °C una hora, con un termómetro independiente dentro (los hornos domésticos son poco precisos a temperaturas bajas: observación mía). Pesa antes y después | Sin deformación ni pegajosidad; peso casi igual | Cualquier deformación a 60 °C, que es el máximo del PVC de HellermannTyton |
| 9 | **Prueba de calor larga** | 70 °C durante 24 horas (la temperatura que Nexans da al conductor dentro de aparatos) | Igual que la anterior | Se endurece o se agrieta al doblar |
| 10 | **Mancha** | Una pieza sobre un trozo de chapa pintada, 24 h a 60 °C | Sin marcas | Película o mancha |
| 11 | **Asiento en la chapa real** | Monta el pasacables en un recorte de la misma chapa (mismo grosor, agujero de la talla): encaja en la ranura y no gira | No se mueve; se arranca con una fuerza claramente mayor que el peso del cable | Se sale o gira |
| 12 | **Cable dentro** | Mete el cable y los conectores que pasan y dóblalo en el tramo real | Pasa sin forzar; el cable queda ceñido pero no apretado | Se atasca o queda flojo |
| 13 | **Grasa y cerveza** | Sumerge una pieza 24 h y compara peso y forma | Hinchazón insignificante | Se hincha o se ablanda (umbral mío: más de un 5 % de peso) |
| 14 | **Llama** | Solo si va junto a L y N: pide la clase UL 94 al vendedor; no hagas un ensayo casero con llama | Clase declarada | Sin clase declarada: buscar otra pieza |

Texto para el vendedor (mío):

> "Hola, antes de comprar necesito por escrito, para el surtido ASIN B0B5DLWVZ2: 1) material exacto (goma, PVC, TPE, silicona); 2) por talla, diámetro del agujero de la chapa, diámetro interior, grosor de chapa que admite la ranura y cantidad de piezas; 3) temperatura de servicio; 4) clase de inflamabilidad UL 94 si la hay; 5) declaración RoHS/REACH (ftalatos). Gracias."

## 7. Alternativas

Solo hay motivo para cambiar si el grosor de la chapa no encaja, si hay un paso con ranura o si el material no está declarado. Todas están sin comprobar en Amazon.es.

| Alternativa | Qué resuelve | Dato verificado | Pega |
|---|---|---|---|
| Pasacables de PVC-FR con ranura por grosor (HellermannTyton HV) | Chapa de 2,0 a 6,0 mm; clase V0 | Datasheet de 2015; −30 a 60 °C; Shore 56 ± 5 A en PVC-FR; "Standards/Approvals: No" en RS | PVC: 60 °C. Agujeros desde 6,0 mm |
| Pasacables de goma de Heyco (RG) | Chapa de 1,6 a 4,8 mm (6,4 y 9,5 mm en la serie gruesa); −40 a 105 °C | Fichas de Heyco | Sin clase de inflamabilidad; SBR sensible al ozono |
| TPE de Essentra | −40 a 135 °C; UL 94 HB | Listado de TME | El que vi es para chapa de 1,6 mm como máximo |
| Buje de nailon de Heyco (SB, SBT) | Chapa de 3,2 a 6,4 mm; 105 °C; 94V-2; UL E15331 | Quick Specs 5-02 y 5-04 | Agujeros de 9,5 mm o más; tallas en pulgadas; rígido |
| Perfil de borde ("grommet edging"/tira) | Ranuras de 14 × 9 mm o 18 × 3 mm | Wikipedia (definición); Heyco tiene "Grommet Rolls and Channels" (página bloqueada) | No tengo una pieza concreta con ficha |
| Borde redondeado o rebordeado en la chapa | Un agujero con bordes lisos y redondeados | IEC 60950-1, apartado 3.1.2 (norma hermana) | Cuesta un paso de fabricación; no protege de la vibración |
| Prensaestopas (nailon M12, M16, M20 con contratuerca) | Alivio de tracción y sellado (IP66 a IP68 en los de tipo partido, según Wikipedia) | Wikipedia: función, materiales, roscas | El prensaestopas normal pide el cable libre de conector; casi todos los cables de esta máquina llevan conector. No he podido abrir fichas de Lapp o Phoenix |

**Sobre los prensaestopas (mío):** son mejores en alivio y sellado, pero un prensaestopas normal se monta con el cable por dentro de la junta, así que solo vale cuando se puede pasar el cable sin su conector. Aquí el cordón de red es desmontable por la C14 (guía §2.7) y los demás cables llevan conector, así que no veo motivo para usarlos. Wikipedia cita unos prensaestopas "partidos" para cables ya terminados; no he visto su ficha. Las medidas de rosca (agujero de la chapa, intervalo de cable) las debe dar la ficha del que elijas: no he podido leer ninguna.

## 8. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Mide la chapa antes de pedir nada** (sección 4.2). Es el dato que falta en la guía y condiciona los pasacables, el módulo C14 y el alargo de antena.
2. **Haz una lista de pasos** con el objeto mayor que atraviesa cada uno (haz, conector, ancho del FFC) y su forma (redonda o ranura). Con eso eliges dos o tres tallas y, para las ranuras, un perfil de borde.
3. **No uses este surtido en los agujeros junto a 230 V ni junto a la fuente** hasta haber pasado la tabla 6, o hasta tener la ficha del vendedor. Para el prototipo vale; para la serie, usa piezas con datasheet (HellermannTyton, Heyco o Essentra) y guarda la ficha y la declaración RoHS en el expediente.
4. **Si la chapa es de 2,5 mm o más**, compra por grosor (HV con H2 de 2,5 o 3,0 mm, o buje de nailon) en vez de rellenar con el surtido.
5. **En el paso junto a la LRS** elige un material de 105 °C o más (EPDM, TPE o nailon) y mide primero la temperatura del separador. Si da más de unos 50 °C, el PVC de 60 °C no vale (criterio mío).
6. **Las ranuras y los conectores grandes** (Solo, FFC, HDMI): perfil de borde en una ranura bien desbarbada, no un pasacables redondo. Confirma el perfil con una muestra de tu chapa.
7. **Desbarba y redondea todos los agujeros de cable**, lleven o no pasacables. La norma hermana (IEC 60950-1) admite bordes lisos y redondeados como alternativa al casquillo.
8. **Cables que se mueven:** un seno de cable sin tirantez, brida a cada lado, y comprueba el roce con la caja moviéndose a mano 100 veces.
9. **Mantén L y N fuera del separador.** Si algún día cruzan, un agujero propio con pasacables de clase conocida y, en el tramo que cruza, el cable con su funda (opción que describe la ficha del [cable de 230 V](../cable-h05vv-f-3g1-5-5m/README.md)).
10. **Repuestos:** una bolsa pequeña, solo de las tallas que uses, junto a cada lote de máquinas. El resto del surtido de 260 no aporta nada si las tallas que necesitas no encajan.
11. **Expediente CE:** apunta el fabricante, la referencia y la declaración RoHS de cada pasacables. La guía no menciona RoHS en sus directivas; conviene revisarlo con quien haga la declaración de conformidad (sección 9).

**Afecta a otras piezas (una línea cada una):**

- **FFC (#4):** su ranura de 18 × 3 mm no se resuelve con el surtido; necesita perfil de borde.
- **Cable USB acodado (#10):** la ranura de 14 × 9 mm del separador es igual.
- **Tubo de silicona (#8):** si pasa por un agujero de la chapa, necesita su propio paso con borde protegido; el diámetro de 6 mm es interior o exterior, sin aclarar.
- **Latiguillo micro-USB (#19):** el "≤ 15 cm" choca con la holgura que piden los pasacables de la caja suspendida (ya señalado en su ficha).
- **Módulo C14 (#15) y alargo (#13):** sus fichas ya piden el grosor de la chapa; es el mismo dato.
- **Norma de producto:** EVS indica que la edición de 2022 de EN IEC 60335-2-82 se retira el 16-9-2026, y que su alcance excluye las máquinas expendedoras (IEC 60335-2-75). La guía cita la -2-82 como probable: conviene confirmar cuál aplica.

## 9. Discrepancias con la guía de montaje

| # | La guía dice | Qué encuentro | Dónde |
|---|---|---|---|
| 1 | §1 fila 31: pasacables "en todos los agujeros de chapa por donde pase cable" | Es una regla razonable (IEC 60950-1 pide bordes redondeados o casquillo), pero un surtido de goma redondo **no resuelve** las ranuras de 14 × 9 mm y de unos 18 × 3 mm, y el grosor de chapa admitido es probablemente menor que el de la máquina | Secciones 3 y 4 |
| 2 | §0 y §2.5: "marco de acero de 2,6 mm" | No es un grosor: es el solape del marco sobre el borde del Solo, (83,16 − 78) / 2 = 2,58 mm (cálculo mío). El grosor de la chapa no consta | Sección 4.2 |
| 3 | §5.1: tierra a la caja interior y al cajón en "verde-amarillo flexible" | Correcto, pero ese hilo pelado de la H05VV-F tiene solo 0,7 mm de PVC; es el que más necesita pasacables | Sección 4.5 |
| 4 | §9 lista las directivas de baja tensión, compatibilidad electromagnética y radio | Falta RoHS (2011/65/UE), que limita ftalatos al 0,1 % desde la 2015/863; afecta a los pasacables de PVC. Si el producto entra en su alcance: **sin verificar** | Sección 3 |
| 5 | §9: norma de producto "probable" EN IEC 60335-2-82 | EVS dice que la edición de 2022 se retira el 16-9-2026 y que el alcance excluye las máquinas expendedoras (IEC 60335-2-75) | Secciones 3 y 8 |
| 6 | §4: los cables salen "con holgura" por pasacables | La guía no da el movimiento de la suspensión ni dónde van las holguras; con un latiguillo de 15 cm (#19) no hay holgura | Sección 4.4 |

Nota sobre mi planteamiento inicial (no es una discrepancia con la guía): se hablaba de "Heyco GR/SB" y de una chapa "≥ 2 mm". No vi una serie GR de Heyco en las fichas que abrí (sí RG, de goma, y SB, SBT y UBT, de nailon) y no he podido confirmar el grosor de la chapa (sección 4.2).

## 10. Lo que no he podido verificar

- **El anuncio de Amazon:** material, tamaños, cantidades, ranura, temperatura, certificaciones, vendedor. Amazon bloquea mi herramienta y el ASIN no aparece en otras webs que vi.
- **El texto de EN/IEC 60335-1** (cláusulas 22, 23, 25 y 30) y de EN IEC 60335-2-82:2026: de pago. Las vistas previas de VDE (rechazada) e IEC (bloqueada) no se abrieron. Lo que atribuye mi planteamiento inicial a esa norma lo he contrastado con IEC 60950-1, otra norma.
- **El numerado exacto de IEC 60950-1** (3.1.2 y 3.2.7): lo da una extracción en OCR.
- **ITC-BT-21:** no se abrió (bloqueada).
- **Cómo aplica España la restricción de ftalatos:** el Real Decreto 219/2013 que abrí no los cita.
- **Publicaciones de fabricantes sobre degradación del PVC y plastificantes:** no las encontré; mi búsqueda fue rechazada porque el límite de búsquedas web del turno estaba agotado. Lo que cito sale de Wikipedia.
- **Pruebas independientes y reseñas de surtidos de Amazon.**
- **Datos de ciclos de vida de pasacables bajo flexión**, de pasacables de fuelle, de fuerza de arranque de pasacables de goma, de compatibilidad con cerveza o grasa, y de resistencia a la temperatura de EPDM y SBR distinta de la de Heyco.
- **Fichas de prensaestopas** (Lapp, Phoenix Contact, Hummel): no las abrí.
- **Perfiles de borde concretos** ("edge trim" de HellermannTyton, Panduit, Essentra, Heyco): la página de Heyco fue rechazada.
- **Datasheet de Essentra 10089521** (bloqueado por la herramienta) y los planos de HellermannTyton (el del HV1302 es una imagen sin texto; el del HV1207 no lo abrí): **no tengo las cotas del dibujo ni la definición oficial de H2**.
- **Disponibilidad en Amazon.es** de HellermannTyton HV, Heyco y Essentra.
- **El grosor de la chapa, el número de agujeros de cable, sus tamaños y el movimiento de la suspensión:** no constan en la guía; los ficheros de diseño no los pude leer.
- **La temperatura real del separador** junto a la fuente.

## 11. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos).

Todos los enlaces, ordenados por tipo y con nota en los que no pude abrir, en [`enlaces.md`](enlaces.md).
