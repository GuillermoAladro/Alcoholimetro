# Surtido de tornillos, tuercas y arandelas de acero inoxidable M3 a M6

Tornillería general de la máquina. La fuente LRS-50-5 se atornilla con M3, el módulo C14 usa M3 si es de tornillos, y la toma de tierra lleva tuercas y arandelas M4. Es una pieza genérica sin ficha de fabricante: esta ficha documenta las normas que aplican, los riesgos reales de un surtido barato y qué hay que medir antes de montarlo.

- **Compra:** ASIN B0BGRY2JGX, 11,99 € (precio de la hoja de componentes del 19-20/10/2026, fila 26).

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Amazon bloquea el acceso a mi herramienta (la página devolvió `ROBOTS_DISALLOWED`), así que no he visto el anuncio: el precio y la referencia son los de tu hoja. Una búsqueda del ASIN no devolvió ninguna página que lo contenga. **Marca, vendedor, grado real del acero, clase de resistencia, contenido por tamaño y longitud, tipos de cabeza y número de piezas son desconocidos.**

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Especificaciones](#2-especificaciones)
3. [Documentos oficiales y normas](#3-documentos-oficiales-y-normas)
4. [Uso en el proyecto](#4-uso-en-el-proyecto)
5. [Fallos, bugs y problemas conocidos](#5-fallos-bugs-y-problemas-conocidos)
6. [Qué comprobar al recibirlo](#6-qué-comprobar-al-recibirlo)
7. [Recomendaciones para el alcoholímetro](#7-recomendaciones-para-el-alcoholímetro)
8. [Lo que no he podido verificar](#8-lo-que-no-he-podido-verificar)
9. [Fuentes](#9-fuentes)

---

## 1. Resumen para el proyecto

- **No se sabe qué lleva el surtido.** Un anuncio de "acero inoxidable M3-M6" no dice si es A2 o A4, si la clase es 50 o 70, ni qué longitudes trae. Los kits comparables que sí tienen ficha (RS Pro) ofrecen pocas longitudes por tamaño y no siempre las cortas que haría falta ([RS 393-169](https://docs.rs-online.com/3719/A700000007879596.pdf): M3 solo en 8 y 10 mm; [RS 281-978](https://docs.rs-online.com/3bcd/A700000007879576.pdf): M3 en 6, 10, 12 y 20 mm).
- **El A2-70 es resistente, pero el M3 se rompe con poco par.** A2-70 garantiza 700 MPa de rotura y 450 MPa de límite elástico ([Fastenal](https://www.fastenal.com/content/feds/pdf/2016/01/Mechanical%20Properties%20Metric%20Fasteners%20Jan%202016.pdf), [Berger](https://assets.berger-tools.co.uk/pdfs/Property_Classes_Screws_Nuts.pdf)). Pero un M3 A2-70 se aprieta a unos 0,8-1,1 N·m y su par de rotura mínimo es de 1,6 N·m ([tablas en 2.4](#24-pares-de-apriete-y-par-de-rotura)). El margen es corto, y el grippado lo recorta más (cálculo mío).
- **La calidad real del surtido es el mayor riesgo, y el imán no basta.** No he encontrado ensayos independientes de kits de Amazon.es, solo relatos de foros sobre inox mal etiquetado ([5.1](#51-calidad-real-del-acero-a2-304-frente-a-201-o-acero-cromado)). El A2/304 es poco magnético, pero se magnetiza algo al conformarlo en frío; un imán solo descarta lo que se pega con fuerza.
- **Longitud en la fuente: tornillo = espesor del soporte (más arandelas) + 3 mm o + 5 mm, y no más.** El dibujo de la hoja de la LRS-50 trae "2-M3 L=3.0" y "2-M3 L=5"; lo he visto igual en tres copias (2015, 2019 y 2025). **Qué agujeros son laterales y cuáles inferiores sigue sin confirmarse**, como dice la ficha #14. Hay que medir el soporte y la profundidad del agujero real ([4.2](#42-longitud-de-los-tornillos-de-la-lrs-50-5)).
- **Las arandelas Grower (DIN 127) no sirven para evitar el aflojamiento.** Bolt Science dice que no lo impiden y que pueden acelerarlo. Con vibración, lo que funciona es un fijador de roscas líquido, una arandela de cuña (Nord-Lock) o una unión bien diseñada ([5.3](#53-aflojamiento-por-vibración)). Las tuercas autoblocantes con inserto de nailon son las más propensas al grippado en inox.
- **Grippado (galling): el inox contra inox puede soldarse en frío.** Se evita apretando despacio, a mano, con pasta antigripante y sin llave de impacto ([5.2](#52-grippado-galling-tornillo-y-tuerca-de-inox)). El riesgo es mayor en las tuercas del espárrago de tierra M4, porque corren mucha rosca.
- **Mi recomendación (criterio mío):** el surtido sirve para el uso general. Para las uniones que dependen de la seguridad (tierra, fuente, módulo C14) compra bolsas sueltas de A2-70 a un distribuidor con trazabilidad; cuesta pocos euros ([7](#7-recomendaciones-para-el-alcoholímetro)).

## 2. Especificaciones

### 2.1 Lo que se sabe del anuncio

| Característica | Valor | Fuente |
|---|---|---|
| Referencia de compra | ASIN B0BGRY2JGX, 11,99 € | Hoja del usuario / [guía de montaje](#9-fuentes), §1 fila 26 |
| Descripción de la hoja | "Surtido de tornillos, tuercas y arandelas M3-M6 inox" | Guía de montaje |
| Grado del acero (A2/304, A4/316) | **Sin verificar** | Amazon bloquea el acceso |
| Clase de resistencia (50, 70, 80) | **Sin verificar** | |
| Contenido (tamaños, longitudes, cantidades) | **Sin verificar** | |
| Tipos de cabeza (Allen, hexagonal, botón, avellanada) | **Sin verificar** | |
| Tipo de tuercas (normal, autoblocante) y arandelas (planas, Grower, dentadas) | **Sin verificar** | |
| Rosca chapa, tornillos sin cabeza | **Sin verificar** | |
| Marca, vendedor, país, certificado de material | **Sin verificar** | |

### 2.2 Propiedades mecánicas por clase (ISO 3506)

Tornillos (ISO 3506-1) para rosca hasta M20, según [Berger](https://assets.berger-tools.co.uk/pdfs/Property_Classes_Screws_Nuts.pdf) y [Fastenal](https://www.fastenal.com/content/feds/pdf/2016/01/Mechanical%20Properties%20Metric%20Fasteners%20Jan%202016.pdf) (los dos coinciden):

| Clase | Rotura mínima Rm | Límite elástico mínimo Rp0,2 | Notas |
|---|---|---|---|
| 50 | 500 MPa | 210 MPa | Fastenal la llama "blanda" (soft) |
| 70 | 700 MPa | 450 MPa | Fastenal la llama "conformada en frío" (cold-worked) |
| 80 | 800 MPa | 600 MPa | Fastenal avisa de que es difícil de lograr en diámetros grandes |

- **Tuercas (ISO 3506-2):** tensión de prueba mínima de 500, 700 y 800 MPa para las clases 50, 70 y 80 (Berger, tabla de tuercas normales y altas). Tuerca y tornillo de la misma clase se pueden cargar juntos hasta el límite elástico del tornillo sin dañar la tuerca (Berger). Fastenal añade que sus pares solo se logran si la tuerca (o el agujero roscado) tiene una carga de prueba igual o mayor que la rotura mínima del tornillo.
- **El grado (A2, A4) no es la clase.** "A2" indica el tipo de acero (RS Pro lo equipara con el 304, [RS 281-978](https://docs.rs-online.com/3bcd/A700000007879576.pdf)); "-70" indica la resistencia. Un anuncio que diga solo "A2" o "304" no dice cuál es la clase. Que A4 equivalga a 316 es de memoria, sin verificar; no he leído la tabla de grados de la norma.
- **Clase 70 y magnetismo (deducción mía):** si la clase 70 se obtiene conformando en frío (Fastenal) y el conformado en frío magnetiza algo el austenítico ([Wikipedia](https://en.wikipedia.org/wiki/Stainless_steel)), una respuesta débil al imán en cabezas y roscas es esperable en un A2-70 genuino.

### 2.3 Dimensiones por tamaño

Paso de rosca gruesa, fuerzas y tamaños de tuerca y arandela salen de fuentes; las cabezas son de memoria (marcado). El área resistente es un cálculo mío: fuerza mínima de rotura de Fastenal dividida entre 700 MPa.

| Tamaño | M3 | M4 | M5 | M6 | Fuente |
|---|---|---|---|---|---|
| Paso de rosca gruesa (mm) | 0,5 | 0,7 | 0,8 | 1,0 | [Wikipedia: Nut](https://en.wikipedia.org/wiki/Nut_(hardware)), [Fastenal](https://crafter.fastenal.com/static-assets/pdfs/technical-resources/Torque-Tension-Relationship-for-Metric-Stainless-Steel-Fasteners-A2-and-A4-70-Feb-2016.pdf) |
| Fuerza de rotura mínima A2-70 (N) | 3522 | 6145 | 9928 | 14086 | Fastenal (torque-tension) |
| Límite elástico mínimo A2-70 (N) | 2264 | 3950 | 6382 | 9056 | Fastenal (torque-tension) |
| Área resistente (mm²) | 5,03 | 8,78 | 14,2 | 20,1 | Cálculo mío |
| Tuerca hexagonal: llave (mm) | 5,5 | 7 | 8 | 10 | Wikipedia: Nut ("across flats, ISO") |
| Tuerca hexagonal: altura (mm) | 2,4 | 3,2 | 4 | 5 | Wikipedia: Nut (columna "Hex nut H"); **sin norma indicada** |
| Tuerca autoblocante: altura (mm) | 4 | 5 | 5 | 6 | Wikipedia: Nut ("Nylon nut H") |
| Arandela plana ISO 7089: Ø interior / exterior / grosor (mm) | 3,2 / 7 / 0,5 | 4,3 / 9 / 0,8 | 5,3 / 10 / 1 | 6,4 / 12 / 1,6 | [Wikipedia: Washer](https://en.wikipedia.org/wiki/Washer_(hardware)) |
| Allen ISO 4762: Ø cabeza / altura / llave (mm) | 5,5 / 3 / 2,5 | 7 / 4 / 3 | 8,5 / 5 / 4 | 10 / 6 / 5 | **De memoria, sin verificar** |
| Botón ISO 7380-1: Ø cabeza / altura / llave (mm) | 5,7 / 1,65 / 2 | 7,6 / 2,2 / 2,5 | 9,5 / 2,75 / 3 | 10,5 / 3,3 / 4 | **De memoria, sin verificar** |

- **Aviso (de memoria, sin verificar):** en las tuercas M5 y M6 la altura de DIN 934 (4 y 5 mm) es menor que la de ISO 4032 (4,7 y 5,2 mm). La tabla de Wikipedia no dice a qué norma corresponde. Mide las tuercas con calibre cuando calcules pilas de tuercas, como las del espárrago de tierra.
- **Longitudes habituales (de memoria, sin verificar):** M3 de 4, 5, 6, 8, 10, 12, 16, 20... mm. Los kits de RS Pro muestran las que ofrece cada surtido: botón M3 de 8 y 10, M4 de 8 a 16, M5 de 10 a 16, M6 de 12 a 20 ([RS 393-169](https://docs.rs-online.com/3719/A700000007879596.pdf)).

### 2.4 Pares de apriete y par de rotura

No hay una cifra única: cada fuente supone un coeficiente de rozamiento y un porcentaje del límite elástico distintos. **ISO 3506-1:2020 no especifica pares de apriete**: su página dice que no cubre propiedades funcionales como las de par y fuerza de apriete ([ISO](https://www.iso.org/standard/70045.html)). Las tablas que circulan son de fabricantes y distribuidores.

| Tamaño (A2-70) | Fastenal, lubricado (K = 0,16, 75 % del límite elástico) | Fastenal, en seco (K = 0,35, 40 % del límite elástico) | Optimas y TR Fastenings, μ = 0,2 | Optimas y TR Fastenings, μ = 0,1 / 0,3 | Par de rotura mínimo (TR Fastenings) |
|---|---|---|---|---|---|
| M3 | 0,81 N·m | 0,95 N·m | 1,1 N·m (0,65 kN) | 1,0 / 1,35 N·m | 1,6 N·m |
| M4 | 1,90 N·m | 2,21 N·m | 2,6 N·m (2,4 kN) | 1,7 / 3,0 N·m | 3,8 N·m |
| M5 | 3,83 N·m | 4,47 N·m | 5,1 N·m (3,93 kN) | 3,4 / 6,1 N·m | 7,8 N·m |
| M6 | 6,52 N·m | 7,61 N·m | 8,8 N·m (5,54 kN) | 5,9 / 10,4 N·m | 13 N·m |

Fuentes: [Fastenal, torque-tension A2/A4-70](https://crafter.fastenal.com/static-assets/pdfs/technical-resources/Torque-Tension-Relationship-for-Metric-Stainless-Steel-Fasteners-A2-and-A4-70-Feb-2016.pdf); [Optimas](https://optimas.com/technical-resources/stainless-steel-fasteners-pre-load-and-tightening-torques/); [TR Fastenings](https://trfastenings.com/knowledge-base/metric-screws/stainless-steel-pre-load-and-tightening-torques).

- **Optimas y TR Fastenings dan los mismos números** (tabla "para orientación"). No declaran lubricación, porcentaje de límite elástico ni norma. Optimas no da A4-70 sino A4-80. TR Fastenings no nombra la norma de su par de rotura, y **no he podido confirmar que salga de ISO 3506-1** (la página de ISO de 2020 no lo menciona).
- **Fastenal explica sus supuestos:** par = K × D × F. En seco aprieta menos (40 % del límite elástico) "para evitar el grippado"; con lubricante aprieta más (75 %). Recomienda antigripante de grafito o de bisulfuro de molibdeno y apretar "lento y continuo".
- **Cálculo mío:** el par lubricado de Fastenal es ≈ 50 % del par de rotura de TR (0,81/1,6; 1,90/3,8; 3,83/7,8; 6,52/13). El de μ = 0,2 es ≈ 65-69 %. Por eso un M3 con rosca agarrotada se rompe antes de dar la vuelta.
- **Regla mía:** usa la columna "Fastenal, lubricado" como tope en uniones normales y menos en roscas de chapa fina (ver [4.3](#43-pares-propuestos-por-punto)).
- **Würth, Bossard y Reyher:** no he conseguido abrir sus tablas de pares. Son las que conviene contrastar.

### 2.5 Kits comparables con ficha (no son el tuyo)

| Kit | Norma y grado declarados | Contenido relevante | Magnetismo |
|---|---|---|---|
| [RS Pro 281-978](https://docs.rs-online.com/3bcd/A700000007879576.pdf), 3.168 piezas, M2 a M6 | Tornillos DIN 85 y DIN 963A (ranura), tuercas DIN 934, arandelas DIN 125. "A2 / 304" | M3: 40 × 6 mm, 40 × 10, 30 × 12, 30 × 20; 385 tuercas y 385 arandelas. Cantidades de M4 a M6: no constan | "Generalmente no magnético" |
| [RS Pro 393-169](https://docs.rs-online.com/3719/A700000007879596.pdf), 490 piezas, M3 a M6 | Botón con hueco hexagonal, "DIN 7380". "A2 304" | M3: 100 × 8 mm y 50 × 10. M4: 8, 10, 12 y 16 mm. M5: 10, 12 y 16. M6: 12, 16 y 20 | "Generalmente no magnético" |
| [Kit INFINITE en ManoMano](https://www.manomano.es/p/sechskantschrauben-set-304-edelstahl-m5x150-stuck-verschiedene-montagegroen-m5x101214162025mm-muttern-unterlegscheiben-federscheiben-rostschutz-209680352), 150 piezas, solo M5 | "AISI 304 (EN 10088)"; no cita A2 ni norma de fijación | 90 tornillos (6 longitudes), 20 tuercas, 20 arandelas planas, 20 Grower. La cabeza se describe de forma contradictoria | Sin dato |

**Lectura (mía, con solo tres ejemplos):** un surtido de este tipo trae tornillos de cabeza botón, alomada o hexagonal, tuercas hexagonales y arandelas planas, a veces Grower; pocas longitudes por tamaño; en estos tres kits no hay M3 de 4 o 5 mm. No sé si el tuyo es así.

## 3. Documentos oficiales y normas

Un surtido genérico no tiene datasheet. Estas son las normas que aplican y lo que he podido leer de ellas. Las normas ISO están de pago: solo he podido leer la ficha de catálogo de cada una y las tablas de fabricantes que las resumen.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| ISO 3506-1:2020, pernos, tornillos y espárragos de acero inoxidable | Edición 3, 2020-04, 37 págs. Reconfirmada en 2025 | Página (norma de pago) | [iso.org](https://www.iso.org/standard/70045.html) |
| ISO 3506-2:2020, tuercas | Edición 3, 2020-04, 27 págs. Reconfirmada en 2025 | Página (norma de pago) | [iso.org](https://www.iso.org/standard/70046.html) |
| ISO 3506-3:2025, tornillos sin cabeza (prisioneros) | Edición 3, publicada el 2025-01-10, 12 págs. | Página (norma de pago) | [iso.org](https://www.iso.org/standard/84037.html?browse=tc) |
| ISO 3506-3:2009 (sustituida) | Retirada el 2025-01-10 | Página | [iso.org](https://www.iso.org/es/contents/data/standard/04/62/46231.html) |
| ISO 3506-4:2009, tornillos autorroscantes (rosca chapa) | Listada como cancelada en una base de datos canadiense | Página | [CCN-SCC](https://ccn-scc.ca/standardsdb/standards/8145794) |
| Fastenal: propiedades mecánicas de elementos métricos | Enero de 2016 | PDF | [descargar](https://www.fastenal.com/content/feds/pdf/2016/01/Mechanical%20Properties%20Metric%20Fasteners%20Jan%202016.pdf) |
| Fastenal: relación par-tensión de inox A2 y A4-70 | Febrero de 2016 | PDF | [descargar](https://crafter.fastenal.com/static-assets/pdfs/technical-resources/Torque-Tension-Relationship-for-Metric-Stainless-Steel-Fasteners-A2-and-A4-70-Feb-2016.pdf) |
| Berger: clases de resistencia de tornillos y tuercas | Sin fecha | PDF | [descargar](https://assets.berger-tools.co.uk/pdfs/Property_Classes_Screws_Nuts.pdf) |
| Nord-Lock: catálogo de arandelas (versión en pulgadas) | Sin fecha | PDF | [descargar](https://mmintercom.com/upload/publish/197/NORD-LOCK%20Washers%20Catalogue.pdf) |
| Bossard / Nord-Lock: folleto (03-2023) | Arandelas de cuña, test de Junker | PDF | [descargar](https://www.bossard.com/dk-da/-/media/0d163628d10f470f99186aa4cd1221ec.pdf) |
| LOCTITE 243: hoja técnica (noviembre de 2020, copia de RS) | TDS | PDF | [descargar](https://docs.rs-online.com/e55b/A700000008786735.pdf) |
| LOCTITE 243: hoja de seguridad (copia de RS; **no abierta**) | SDS | PDF | [descargar](https://docs.rs-online.com/c7a7/0900766b80d76619.pdf) |
| Mean Well LRS-50-SPEC (2025-04-07): dibujo mecánico, caja 239A | Copia de Mean Well Australia | PDF | [descargar](https://www.meanwellaustralia.com.au/sites/default/files/2025-05/MEAN%20WELL%20LRS-50%20DATA%20SHEET.pdf) |
| Mean Well LRS-50-SPEC (2019-07-23, copia de pulsar.pl) | Mismo dibujo | PDF | [descargar](https://lib.pulsar.pl/karta/es/LRS-50-5.pdf) |
| Mean Well LRS-50-SPEC (2015-12-31, copia de RS) | Mismo dibujo | PDF | [descargar](https://docs.rs-online.com/19bc/0900766b814e41ec.pdf) |
| RS Pro 281-978: kit de 3.168 piezas | Hoja del kit | PDF | [descargar](https://docs.rs-online.com/3bcd/A700000007879576.pdf) |
| RS Pro 393-169: kit de 490 piezas botón | Hoja del kit | PDF | [descargar](https://docs.rs-online.com/3719/A700000007879596.pdf) |

**Las demás normas que aplican a la tornillería (no he podido abrirlas, ni las fichas de catálogo):**

| Norma | Tema | Estado | Fuente |
|---|---|---|---|
| ISO 4762 / DIN 912 | Tornillo de cabeza cilíndrica con hueco hexagonal (Allen) | DIN 912 sustituida por ISO 4762: **de memoria, sin verificar** | |
| ISO 7380-1 | Tornillo de cabeza botón con hueco hexagonal | Optimas lo lista como "ISO 7380" en su tabla de pares; el kit de RS Pro lo llama "DIN 7380" | [Optimas](https://international.optimas.com/technical-resources/socket-screws-tightening-torques), [RS 393-169](https://docs.rs-online.com/3719/A700000007879596.pdf) |
| ISO 4017 / DIN 933 | Tornillo hexagonal, rosca completa | **De memoria, sin verificar** | |
| ISO 4032 / DIN 934 | Tuerca hexagonal | RS Pro usa DIN 934 en su kit. Equivalencia con ISO 4032: **de memoria** | [RS 281-978](https://docs.rs-online.com/3bcd/A700000007879576.pdf) |
| ISO 7089 / DIN 125 | Arandela plana | DIN 125 "retirada y sustituida por ISO 7089" según Wikipedia; Form B es ISO 7090 | [Wikipedia: Washer](https://en.wikipedia.org/wiki/Washer_(hardware)) |
| DIN 127 B | Arandela elástica helicoidal (Grower) | La lista Wikipedia como norma aplicable. Estado de vigencia: **sin verificar** | [Wikipedia: Washer](https://en.wikipedia.org/wiki/Washer_(hardware)) |
| DIN 6798 | Arandela dentada (A exterior, J interior, V avellanada) | **De memoria, sin verificar** (Wikipedia no la cita) | |
| DIN 6796 | Arandela cónica (Belleville) para tornillos pretensados | Citada por Bolt Science y FastFix como alternativa | [Bolt Science](https://www.boltscience.com/pages/helicalspringwashers.htm), [FastFix](https://fastfixtechnology.com/other-industries/helical-spring-washers-are-they-really-effective) |
| DIN 985 / ISO 10511 (baja) y DIN 982 / ISO 7040 (alta) | Tuerca autoblocante con inserto de nailon | **De memoria, sin verificar** | |
| DIN 7991 (ISO 10642), DIN 965 (ISO 7046-1), DIN 85, DIN 963 | Tornillos avellanados y de cabeza alomada (con hueco hexagonal, cruz o ranura) | DIN 85 y DIN 963A figuran en el kit de RS Pro, cuya ficha se contradice (habla de cruz y de ranura); DIN 7991 figura en la tabla de Optimas. El resto: **de memoria** | [RS 281-978](https://docs.rs-online.com/3bcd/A700000007879576.pdf), [Optimas](https://international.optimas.com/technical-resources/socket-screws-tightening-torques) |
| ISO 4026 a 4029 / DIN 913 a 916 | Tornillos sin cabeza (prisioneros) con extremo plano, cónico, de espiga o de copa | Solo ISO 4029 (copa moleteada) figura en Wikipedia | [Wikipedia: Set screw](https://en.wikipedia.org/wiki/Set_screw) |
| ISO 1478 y DIN 7981, 7982, 7976 | Rosca chapa (autorroscante) | ISO 1478: tamaños ST2,2 a ST8, citado en la ficha de ISO 3506-4. El resto: **de memoria** | [CCN-SCC](https://ccn-scc.ca/standardsdb/standards/8145794) |
| DIN 65151 / ISO 16130 | Ensayo de vibración transversal (Junker) | Ambas citadas por Nord-Lock | [Nord-Lock](https://www.nord-lock.com/link/8bc1485d52684ff68b4ca5366646fa8d.aspx) |
| MIL-STD-889 | Metales distintos (potencial galvánico) | **No abierta.** Uso el índice anódico de Wikipedia | [Wikipedia: Galvanic corrosion](https://en.wikipedia.org/wiki/Galvanic_corrosion) |

### Qué dicen los más relevantes

**ISO 3506-1:2020 (tornillos).** Cubre las propiedades mecánicas y físicas de tornillos, pernos y espárragos de acero inoxidable con rosca métrica gruesa y fina, ensayados entre 10 y 35 °C. Define clases de resistencia para aceros austeníticos, martensíticos, ferríticos y dúplex. Sustituye a la edición de 2009, que está retirada. La página de ISO dice que **no** especifica propiedades funcionales como el par o la fuerza de apriete ([ISO](https://www.iso.org/standard/70045.html)).

**ISO 3506-2:2020 (tuercas).** Mismo alcance para tuercas, 27 páginas. La página dice que **no** especifica propiedades de par de resistencia al giro (*prevailing torque*): las tuercas autoblocantes no están cubiertas por sus clases ([ISO](https://www.iso.org/standard/70046.html)).

**ISO 3506-3:2025 (tornillos sin cabeza).** Tornillos sin cabeza y fijaciones parecidas que no trabajan a tracción, de acero austenítico y dúplex, de 1,6 a 24 mm. Las clasifica por **clases de dureza**, no por clases de resistencia. Sustituye a la de 2009, retirada el 10-1-2025 ([ISO 2025](https://www.iso.org/standard/84037.html?browse=tc), [ISO 2009](https://www.iso.org/es/contents/data/standard/04/62/46231.html)). Los tornillos sin cabeza no son para apretar piezas a tracción: Wikipedia avisa de que los pequeños sin plano se giran y se agarrotan si se sobrecargan ([Wikipedia: Set screw](https://en.wikipedia.org/wiki/Set_screw)).

**ISO 3506-4:2009 (rosca chapa).** Para tornillos autorroscantes de ST2,2 a ST8 (ISO 1478), de acero austenítico, martensítico y ferrítico. Una base de datos canadiense la lista como cancelada ([CCN-SCC](https://ccn-scc.ca/standardsdb/standards/8145794)); **no he comprobado su estado en iso.org**.

**Marcado (de memoria, sin verificar).** La norma pide marcar en la cabeza el grado y la clase (por ejemplo "A2-70") y la marca del fabricante, en tornillos hexagonales y Allen de M5 en adelante. El PDF de Fastenal solo muestra el pie de foto "ejemplo de marcado de cabeza A2-70, ISO 3506-1". Las cabezas M3 y M4 suelen ir sin marca; **la ausencia de marca en un M5 o M6 es una señal de alarma** (observación mía).

## 4. Uso en el proyecto

### 4.1 Dónde se usa cada tamaño

Fuentes: guía de montaje (§2.6, §3, §4, §5.1 y §6), fichas ya hechas y tu mensaje. Las cantidades son **deducciones mías** a confirmar con la carcasa real.

| Uso | Tamaño | Cantidad por máquina | Estado |
|---|---|---|---|
| Fuente LRS-50-5, fijada al separador | M3, longitud = soporte + 3 mm o + 5 mm ([4.2](#42-longitud-de-los-tornillos-de-la-lrs-50-5)) | 2 a 4. El dibujo trae 2 + 2 agujeros; no sé cuántos se usan | Asignación lateral/inferior **sin confirmar** (ficha #14) |
| Módulo C14, si es de tornillos | M3 | 2 | La [ficha #15](../modulo-c14-fusible-interruptor/README.md) cita Schurter: tornillos M3, hasta 8 mm de chapa, par máximo 0,5 N·m. Si el módulo del anuncio es de clip, no hace falta |
| Pantalla GeeekPi | M2.5 o M3 | 2 | La [ficha de la pantalla](../pantalla-geeekpi-7-hdmi/README.md) cita dos listas de la wiki contradictorias (M2.5 y M3) y no publica los agujeros. Mide la placa |
| Espárrago de tierra M4 × 20 (#25) | Tuercas M4 | 2 tuercas + 2 arandelas dentadas (#24) | Guía §6. Origen de las tuercas: **sin verificar** (no sé si el espárrago las trae) |
| Otros extremos de tierra (panel, caja interior, cajón) | M4 | Hasta 3 uniones de tornillo + tuerca + arandelas | Deducción mía a partir de la guía §5.1 (ojal M4 en ambos extremos). Las piezas soldadas ya tienen tierra |
| Separadores de nailon M2.5 (#30) | M2.5 | No es de este surtido (M3 a M6) | Otra ficha |
| Botón (#11) y antena (#13) | Su propia tuerca | 0 | Fichas respectivas |
| SumUp Solo | Sin tornillería documentada | ? | **Sin verificar** |
| M5 y M6 | Ningún uso en la guía ni en las fichas | ? | Tal vez carcasa, cajón o candados; **no he podido leer esos archivos del proyecto**. Decide cuántos necesitas |

### 4.2 Longitud de los tornillos de la LRS-50-5

**Qué dice la fuente.** El dibujo mecánico de la hoja (caja 239A, unidades en mm; la copia de 2025 añade "Tolerance:±1", las otras dos no la traen en el texto que extraje) trae dos llamadas de agujero roscado: **"2-M3 L=3.0" y "2-M3 L=5"**. Lo he visto igual en las copias de 2025, 2019 y 2015-12 ([Mean Well Australia](https://www.meanwellaustralia.com.au/sites/default/files/2025-05/MEAN%20WELL%20LRS-50%20DATA%20SHEET.pdf), [pulsar.pl](https://lib.pulsar.pl/karta/es/LRS-50-5.pdf), [RS](https://docs.rs-online.com/19bc/0900766b814e41ec.pdf)). Mi herramienta extrae el texto sin la posición, así que **no sé qué agujeros son laterales y cuáles inferiores**: sigue sin confirmarse, como dice la [ficha de la fuente](../meanwell-lrs-50-5/README.md) (apartado 4.3). La guía §2.6 da 3 mm para los laterales y 5 mm abajo; **repito esa asignación como "sin confirmar"**.

**Sobre la lectura "L=4,5" de la ficha #14.** En el texto del dibujo aparecen juntas las cifras "4.5" y "92.5", que parecen cotas. Es posible que la lectura "L=4,5" de una copia de 2015 viniera de ahí (hipótesis mía). Las tres copias que he abierto dan L=3.0.

**Qué significa "L".** La guía y la ficha #14 lo interpretan como profundidad máxima que puede penetrar el tornillo en la fuente. El manual de Mean Well remite al dibujo para esa longitud (ficha #14, apartado 3). **No sé si la tolerancia general de ±1 mm se aplica a L**: deja margen.

**Cómo se calcula (mío).**

```
Penetración real p = longitud del tornillo − espesor del soporte − arandelas (− avellanado)
Condición:           p ≤ L  (3,0 en los laterales, 5 en la base, si la asignación es esa)
Longitud máxima:     tornillo ≤ espesor del soporte + arandelas + L
```

Ejemplo ilustrativo con un soporte de 2,6 mm (es el espesor de chapa que cita la guía para el marco del Solo; **tu separador puede ser otro: mídelo**):

| Tornillo | Arandelas (0,5 mm cada una) | p | Con L = 3,0 | Con L = 5 |
|---|---|---|---|---|
| M3 × 5 | 0 | 2,4 mm | Cabe | Cabe |
| M3 × 6 | 0 | 3,4 mm | **Se pasa 0,4 mm** | Cabe |
| M3 × 6 | 1 | 2,9 mm | Cabe, sin margen | Cabe |
| M3 × 8 | 0 | 5,4 mm | **Se pasa** | **Se pasa 0,4 mm** |
| M3 × 8 | 1 | 4,9 mm | **Se pasa** | Cabe, sin margen |
| M3 × 8 | 2 | 4,4 mm | **Se pasa** | Cabe |

- **Todo esto se resuelve midiendo, no con la tabla.** Mide con calibre el espesor del soporte y de cada arandela, y la longitud del tornillo desde debajo de la cabeza hasta la punta. Mide la profundidad del agujero roscado con una varilla o la sonda de profundidad del calibre, con la fuente **desenchufada** y sin abrirla (el manual lo prohíbe y hay condensadores cargados; ficha #14, apartado 5.1).
- **Engranaje mínimo (regla general mía, sin fuente):** no bajes de unos 2,5 mm de rosca engranada en el agujero de 3 mm. Con menos, el tornillo sujeta poco.
- **Punta del tornillo:** tiene chaflán, así que la rosca completa llega menos lejos que la longitud total (observación mía). No cuentes con ello como margen: usa el valor del peor caso.
- **Con arandela de cuña o dentada,** súmale su grosor (la cuña de Nord-Lock NL3 en inox son 0,09 in, 2,3 mm, y 0,07 in, 1,8 mm, en acero según la tabla en pulgadas de su catálogo; **cuál va con cuál, sin verificar**).
- **Si el kit no trae la longitud exacta,** usa la inmediatamente menor y no la mayor, o añade arandelas planas. No acortes tornillos con una radial: deja rebabas y estropea los últimos hilos (observación mía). Si te falta, compra una bolsa de la longitud justa.
- **Si el tornillo sobrepasa:** puede tocar la placa de la fuente (ficha #14, apartado 4.3). Un tornillo metálico en el lado de red puede unir una pista de 230 V con el chasis. Con la tierra conectada, el resultado probable es que dispare el diferencial o el fusible; con la tierra rota, puede quedar el chasis con tensión (deducción mía). Es la razón de medir antes de cerrar la caja.

### 4.3 Pares propuestos por punto

Criterio mío, con los valores de [2.4](#24-pares-de-apriete-y-par-de-rotura) como tope y sin fuente específica para cada punto.

| Punto | Par propuesto | Motivo |
|---|---|---|
| Fuente LRS-50-5, M3 | ≤ 0,5 N·m con destornillador dinamométrico | La ficha #14 solo recoge el par de los bornes (M3,5), no el de los tornillos de fijación; los agujeros roscados admiten solo 3 o 5 mm de penetración. 0,5 N·m es el máximo que da Schurter para M3 en su módulo C14 ([ficha #15](../modulo-c14-fusible-interruptor/README.md)) |
| Módulo C14, M3 | ≤ 0,5 N·m | Máximo de Schurter, mismo dato |
| Tuercas M4 de tierra | 1,9 N·m como tope (Fastenal, lubricado) | Hay que comprobar la resistencia a 0,1 Ω (guía §6) |
| Otras uniones M3 / M4 / M5 / M6 | 0,8 / 1,9 / 3,8 / 6,5 N·m como tope | Fastenal, lubricado |

### 4.4 Si el surtido trae tornillos sin cabeza, avellanados o de rosca chapa

No sé si los trae. Si los trae, estas son las normas y las precauciones (las normas, en la tabla del [apartado 3](#3-documentos-oficiales-y-normas)):

| Tipo | Qué hay que saber | Fuente |
|---|---|---|
| **Sin cabeza (prisioneros, "grub")** | Sirven para fijar un cubo o un eje, **no para apretar piezas a tracción**. ISO 3506-3:2025 los clasifica por clases de dureza, no por clase de resistencia (por eso "A2-70" no se les aplica). Los extremos (plano, cónico, de copa) se eligen según el uso; los pequeños sin plano se giran y se agarrotan si se sobrecargan. Esta máquina no necesita ninguno según la guía | [ISO](https://www.iso.org/standard/84037.html?browse=tc), [Wikipedia: Set screw](https://en.wikipedia.org/wiki/Set_screw) |
| **Avellanados (DIN 7991 / ISO 10642 con Allen; DIN 963 y 965 con ranura o cruz)** | Necesitan un avellanado en la chapa, y la cabeza queda dentro del espesor: con chapas de 2 a 2,6 mm queda poco material bajo el avellanado (observación mía, sin cotas verificadas). Optimas da para el DIN 7991 en A2-70 los pares 0,5 / 1 / 2,5 / 4,5 N·m (M3 a M6), "para orientación" y sin supuestos | [Optimas](https://international.optimas.com/technical-resources/socket-screws-tightening-torques) |
| **Rosca chapa (autorroscantes)** | ISO 3506-4:2009 los cubre de ST2,2 a ST8 (rosca ISO 1478), pero figura como cancelada en una base de datos canadiense; estado en ISO: sin verificar. Forman o cortan su rosca en la chapa, sin tuerca. La guía no los usa | [CCN-SCC](https://ccn-scc.ca/standardsdb/standards/8145794) |
| **Cabeza botón (ISO 7380-1)** | Cabeza baja con hueco hexagonal pequeño (de memoria: llave de 2 mm en M3, 2,5 en M4, 3 en M5, 4 en M6). Menos agarre de la llave, así que menos par. Optimas da 0,5 / 1 / 2 / 4 N·m (M3 a M6) en A2-70 | [Optimas](https://international.optimas.com/technical-resources/socket-screws-tightening-torques) |

Los pares de Optimas para DIN 7991 e ISO 7380 salen de su tabla "Socket/Grub Screws Tightening Torques", de la que mi herramienta solo pudo leer los números por posición de columna (las cabeceras salían desordenadas), y que lleva una nota sobre tornillos sin cabeza no sometidos a tracción, así que no queda claro que sirva para tornillos que trabajan a tracción. **Trátalos como una referencia, sin verificar.**

## 5. Fallos, bugs y problemas conocidos

Las pruebas independientes de tornillería inox de Amazon que he encontrado son **relatos de foros**, no ensayos con medidas. Lo que sigue es de fuentes técnicas (normas, fabricantes, distribuidores) y de esos relatos, rotulados.

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Acero que no es A2 (201, ferrítico, hierro cromado) o clase menor de la anunciada | Alta si ocurre; moderada si solo el surtido general lo lleva |
| 2 | Grippado de tornillo y tuerca de inox | Media. Alta en las tuercas del espárrago de tierra |
| 3 | Rotura del M3 por exceso de par o por grippado | Media |
| 4 | Aflojamiento por vibración | Media-baja (máquina fija); no hay datos de vibración en el bar |
| 5 | Tornillo demasiado largo en la LRS-50-5 | Alta (seguridad) si se pasa |
| 6 | Corrosión galvánica con chapa pintada, latón, estaño y cinc | Baja en seco; media con derrames |
| 7 | Contenido que no cubre lo que necesita la máquina (longitudes, cabezas) | Media (montaje) |
| 8 | Piezas mezcladas o con rosca que no corresponde | Baja-media |
| 9 | Cabezas y llaves de baja calidad (huecos redondeados, cabezas que se cortan) | Baja-media |

### 5.1 Calidad real del acero: A2 / 304 frente a 201 o acero cromado

**Lo que dicen las fuentes técnicas**

- El acero inoxidable austenítico es normalmente no magnético; Wikipedia da una permeabilidad de 1,000 a 1,100 en cuatro grados austeníticos recocidos. El conformado en frío (el que se usa para hacer tornillos) puede dejarlo ligeramente magnético ([Wikipedia](https://en.wikipedia.org/wiki/Stainless_steel)). Los aceros ferríticos sí son magnéticos (misma fuente).
- La serie 200 (por ejemplo el 201) sustituye parte del níquel por manganeso y nitrógeno (misma fuente). **No he encontrado una fuente que compare su magnetismo con el del 304.** Que el 201 sea más magnético tras el conformado es una afirmación habitual y plausible con menos níquel, pero la marco como **sin verificar**.
- Hilo del foro YBW (barcos): un participante dice que el conformado en frío y el laminado de rosca magnetizan algo los elementos de fijación, que el material con aleación en el límite bajo de la norma es más magnético y que un 304 con carbono alto puede tener ferrita. El imán **no distingue A2 de A4** ([YBW](https://forums.ybw.com/threads/a2-a4-or-316.109146)).
- Otro foro (fabricantes de pastillas de guitarra) recoge que el inox "de tornillería" suele ser el 305 por endurecer poco al conformarlo, y que algunos grados 304 se vuelven claramente magnéticos tras el conformado ([Music Electronics Forum](https://music-electronics-forum.com/forum/instrumentation/pickup-makers/7598-warning-regarding-screws)).

**Incidentes y relatos (no son ensayos de laboratorio)**

- **YBW:** un participante cuenta que condenó una partida marcada A2 procedente de Tailandia por ser magnética, oxidada y con alto contenido en carbono, y que un laboratorio de EE. UU. analizó parte del material; dice que algunas piezas eran falsificaciones. No da el nombre del laboratorio ni del informe. Otro apunta que el problema no es el A2 en sí, sino las importaciones baratas marcadas A2 o A4 que no cumplen ([YBW](https://forums.ybw.com/threads/a2-a4-or-316.109146)).
- **Hilo de diciembre de 2024 en el foro "Boat Design and Construction" (myccr.com):** el autor dice que parte del inox de Amazon ha sido muy magnético (hablaba de anillas en D, no de tornillos) y que en cubetas de supuesto 316 encontró piezas de acero normal y roscas distintas mezcladas (una 10-32 entre 10-24), que detectó pasando el imán a cada pieza ([foro MYCCR](https://www.myccr.com/phpBB3_PROD/viewtopic.php?p=451956)).
- **Slickdeals:** comentarios de compradores: que las cabezas de los tornillos baratos de Amazon se cortan con mucha facilidad y que solo valen para proyectos de impresión 3D ([Slickdeals](https://slickdeals.net/f/17203402)). Es una opinión, no una medida.
- **No he encontrado** un ensayo con medidas (análisis XRF, dureza, par de rotura) de kits de tornillería de Amazon.es, ni canales técnicos con medidas que citar. Mi presupuesto de búsquedas se agotó antes de poder buscar en alemán o en vídeo. **Sin verificar.**

**Cómo comprobarlo** (detalle en [6](#6-qué-comprobar-al-recibirlo))

| Prueba | Qué dice | Límite |
|---|---|---|
| Imán fuerte (neodimio) | Si se pega con fuerza: no es austenítico (ferrítico o hierro cromado). Respuesta débil: inconclusa | No distingue A2 de A4 ni 304 de 201 con seguridad |
| Marca en la cabeza (A2-70) | Su ausencia en M5/M6 es una alarma | Se falsifica con facilidad (observación mía); M3/M4 suelen ir sin marca |
| Análisis XRF portátil (PMI) | Según YBW, un analizador XRF portátil distingue 316 de 304; es caro y exige operario | Fuente: un participante del foro. **El estudio de Thermo Fisher sobre fijaciones no se pudo abrir** |
| Prueba de chispa | Mencionada en YBW como método antiguo | Poco práctica; sin fuente técnica |
| Prueba de ácido o reactivo | **No he leído ninguna fuente sobre pruebas con ácido ni con reactivos para tornillería.** YBW solo cita el análisis químico y un "Metascope" | Sin verificar |
| Par de rotura de una muestra | Compara con 1,6 / 3,8 / 7,8 / 13 N·m (TR Fastenings, A2-70) | Los valores son de una tabla de distribuidor |
| Corrosión (24-48 h en agua salada y secar) | Óxido visible = no es inox de calidad | Prueba casera mía, sin norma |
| Certificado del lote | YBW: comprar a quien da certificado de ensayo de fábrica | Un kit de Amazon no lo trae (observación mía) |

### 5.2 Grippado (galling) de tornillo y tuerca de inox

**Qué es y por qué pasa.** Es un desgaste adhesivo en el que dos superficies en contacto se sueldan en frío. TWI lo describe como problema típico de tornillos de inox, aluminio y titanio, que resisten la corrosión gracias a una capa pasiva de óxido que la presión rompe; con la capa rota y las dos piezas del mismo material, los metales desnudos se funden y la rosca se bloquea. Apretar más puede romper la cabeza o arrancar la rosca ([TWI](https://www.twi-global.com/technical-knowledge/faqs/what-is-galling), [Wikipedia: Galling](https://en.wikipedia.org/wiki/Galling)).

**Causas citadas**

| Causa | Fuente |
|---|---|
| Rotura de la capa de óxido por la presión | [Fastenal Blueprint](https://blueprint.fastenal.com/thread-galling.html), [Bolt Depot](https://boltdepot.com/galling) |
| Velocidad alta de apriete (más calor) | Fastenal Blueprint, Bolt Depot, [SASSDA](https://sassda.co.za/?p=61322) |
| Tuercas autoblocantes de nailon (las más propensas) | Bolt Depot; Fastenal dice que el inserto de nailon aumenta mucho el riesgo |
| Mismo material en tornillo y tuerca | Fastenal Blueprint, TWI |
| Rosca cortada en vez de laminada; roscas dañadas o sucias | Fastenal Blueprint, Bolt Depot |
| Pasadas largas de la tuerca ("long run downs") | Fastenal (torque-tension) |
| Llave de impacto o de potencia | Bolt Depot, Fastenal (torque-tension) |
| Tamaños grandes (M10 y más), aunque cualquier tamaño puede gripar | [Anzor](https://anzor.co.nz/blog/what-is-stainless-galling) |

**Prevención citada**

- **Apretar despacio.** TWI: el inox necesita apretarse más despacio que el acero al carbono. Fastenal (torque-tension): par "lento y continuo". Bolt Depot: sin herramientas de potencia, rosca a mano hasta el final, y si empieza a atascarse, parar, esperar uno o dos minutos y reintentar con otra tuerca.
- **Lubricar.** Antigripante con bisulfuro de molibdeno, grafito, mica o talco (SASSDA); de grafito o MoS₂ (Fastenal); de base níquel o lanolina (Anzor); Bolt Depot cita Permatex, Tef-Gel y otros. Fastenal Blueprint avisa de que la lubricación **cambia la relación entre par y tensión**: con lubricante, el mismo par da más fuerza de apriete (lectura mía; ver 2.4).
- **Tuercas y tornillos de materiales distintos:** TWI y SASSDA proponen grados distintos (por ejemplo 304 en la tuerca y 316 en el tornillo) o al menos 50 Brinell de diferencia de dureza, comprobando la corrosión. **Un surtido de un solo grado no lo permite.** Fastenal Blueprint recomienda no emparejar aleaciones idénticas.
- **Rosca laminada** (más lisa que la cortada) y roscas limpias. SASSDA añade que tanto las superficies muy lisas como las muy rugosas gripan más.
- **Reducir el par.** Fastenal (torque-tension) apunta al 40 % del límite elástico en seco "para evitar el grippado".
- **Nickel Institute y Bossard:** mi búsqueda no devolvió ninguna guía suya sobre grippado. Las fuentes de arriba son distribuidores, una asociación de inox (SASSDA) e instituto de soldadura (TWI). **Sin verificar contra Nickel Institute y Bossard.**

**Riesgo concreto en este proyecto (mío)**

- **Tuercas del espárrago de tierra M4 × 20:** inox contra inox, dos tuercas por espárrago y mucha pasada de rosca (el espárrago es largo para que quepan los ojales). Es el punto más expuesto. No las aprietes con herramienta eléctrica: rosca a mano hasta el ojal, pasta en la rosca (no en las caras) y apriete final con llave dinamométrica.
- **Tornillos de la fuente (M3 en un agujero roscado de la carcasa):** si el material de la carcasa de la fuente no es inox (**sin verificar**: no he comprobado de qué es), no hay inox contra inox. Aun así, un M3 de inox que se agarrote en un agujero de 3 mm se rompe: apriétalo poco.
- **Los pares de la sección 2.4** y el hecho de que el par de rotura del M3 sea solo 1,45 veces el de apriete (1,6/1,1) explican por qué un M3 se rompe con facilidad si se agarrota.

### 5.3 Aflojamiento por vibración

**El ensayo.** El de Junker (DIN 65151, y según Nord-Lock también ISO 16130) somete una unión atornillada a movimiento transversal y mide la pérdida de fuerza de apriete. Nord-Lock lo describe como el ensayo de vibración más severo para uniones atornilladas ([Nord-Lock](https://www.nord-lock.com/link/8bc1485d52684ff68b4ca5366646fa8d.aspx), [Bossard](https://www.bossard.com/dk-da/-/media/0d163628d10f470f99186aa4cd1221ec.pdf)). Su ejemplo usa un tornillo M8 de clase 8.8 con 25 mm de apriete. **No hay datos de este ensayo para M3 de inox.** Nord-Lock es parte interesada: afirma que en su ensayo todas las demás soluciones fallaron.

| Solución | Lo que dicen las fuentes | Para este proyecto |
|---|---|---|
| **Arandela Grower (DIN 127 B)** | Bolt Science: no impiden el aflojamiento y, en muchos casos, lo aceleran (sus ensayos son con M8). Junker lo demostró en 1969. En 2004 DIN publicó una explicación de la retirada de varias normas de arandelas de seguridad, entre ellas las helicoidales ([Bolt Science](https://www.boltscience.com/pages/helicalspringwashers.htm), [FastFix](https://fastfixtechnology.com/other-industries/helical-spring-washers-are-they-really-effective)). Wikipedia cita un manual de la NASA de 1990 que concluye que una arandela de este tipo es inútil como bloqueo ([Wikipedia](https://en.wikipedia.org/wiki/Washer_(hardware))). Henkel (parte interesada) dice que mejora algo el número de ciclos hasta el aflojamiento ([Henkel](https://www.henkel-adhesives.com/dk/en/insights/all-insights/blog/why-is-loctite-threadlocker-better-than-a-spring-washer.html)) | No contar con ella. Si el surtido las trae, úsalas solo si quieres una arandela más; no como seguro |
| **Arandela dentada (DIN 6798)** | El folleto de Nord-Lock/Bossard compara arandelas planas, "Rip-Lock", "ripped lock washers" y las suyas, pero no nombra la DIN 6798 ni da resultados que pueda citar. No he encontrado el resultado de Junker de una arandela dentada, ni en inox | Útil para **morder la pintura** en la toma de tierra (guía §6); como antiaflojamiento, sin respaldo |
| **Tuerca autoblocante con inserto de nailon** | Bolt Depot y Fastenal: en inox son las más propensas al grippado. Fastenal encera las suyas para reducirlo, y el encerado se gasta con el calor y el tiempo. **El límite de temperatura de unos 120 °C que se suele citar para el nailon no lo he podido comprobar en ninguna fuente** | Evitarlas en inox sobre inox. Donde se usen, a mano y con cuidado |
| **Fijador de roscas anaeróbico, LOCTITE 243 (resistencia media)** | Hoja técnica (nov. 2020): azul, media, para desmontar con herramientas de mano. Rotura de 26 N·m en M10 de acero y **17 N·m en M10 de inox** (tuercas y tornillos de inox, 1 semana). La hoja dice que normalmente no se recomienda en plásticos, por el riesgo de fisuras por tensión en termoplásticos. La cura mejora con activador. Almacenar entre 8 y 21 °C ([TDS](https://docs.rs-online.com/e55b/A700000008786735.pdf)). Una guía de distribuidor lo da para M6 a M20 y recomienda el 222 por debajo de M6; con inox sin activador, la cura es más lenta; el antigripante o grasa gruesa hay que limpiarlos antes ([Aims](https://aimsindustrial.com.au/en-nz/blogs/product-guides/loctite-243-guide), fuente secundaria) | Opción práctica y barata para las M3 de la fuente y del C14. **No sobre los separadores de nailon** (fisuras). Incompatible en la misma rosca con pasta antigripante |
| **Arandela de cuña Nord-Lock** | Existe desde NL3 (M3) en versión inox "ss" (316L con superficie endurecida, para sitios sin cloruros ni ácidos) y "254 SMO". Dureza ≥ 520 HV0,05 en la inox; la superficie de apoyo debe ser **más blanda** que la arandela; **no recomendada** para madera ni plástico ni para uniones sin pretensión. Pares con pasta Cu/C en inox: NL3ss 0,6-0,7 ft·lb (≈ 0,8-0,95 N·m, conversión mía), NL4ss 1,4-1,5 (≈ 1,9-2,0), NL5ss 2,1-2,3 (≈ 2,85-3,1) ([catálogo](https://mmintercom.com/upload/publish/197/NORD-LOCK%20Washers%20Catalogue.pdf), en pulgadas, de EE. UU.) | La mejor solución documentada, pero cuesta más y añade ~1,8-2,3 mm de grosor por par. Solo si hay vibración real. **No he comprobado su uso sobre chapa pintada** |
| **Diseño de la unión** | Bolt Science: la forma más eficaz de evitar el aflojamiento es diseñar bien la unión y montarla bien | Pretensión suficiente, roscas limpias y soportes rígidos |

**Qué vibración hay en una máquina de bar:** no hay medida. La LRS-50-5 se ensaya a 5 G de 10 a 500 Hz (ficha #14). La caja interior va suspendida con muelles; la fuente va fija a la carcasa (guía §4). Es una máquina fija; los golpes de usuarios y puertas no están medidos.

### 5.4 Contacto con otros metales (corrosión galvánica)

Wikipedia da un **índice anódico** (en V) y diferencias admisibles: hasta 0,25 V en almacén sin control de clima, 0,50 V con temperatura y humedad controladas y 0,15 V en ambiente duro (exterior, humedad alta, sal) ([Wikipedia: Galvanic corrosion](https://en.wikipedia.org/wiki/Galvanic_corrosion)). **No he podido abrir MIL-STD-889**; la tabla de Wikipedia no la cita.

| Metal en contacto con el inox (−0,50) | Índice anódico | Diferencia | Lectura (mía) |
|---|---|---|---|
| Acero al carbono / de baja aleación | −0,85 | 0,35 V | Supera el límite de 0,25 V |
| Cinc / acero galvanizado / cincado | −1,25 / −1,20 | 0,75 / 0,70 V | Mayor |
| Latón y bronces | −0,40 (−0,45 los de alto cinc) | 0,10 (0,05) V | Admisible incluso en ambiente duro |
| Cobre | −0,35 | 0,15 V | En el límite del ambiente duro |
| Estaño / estañado | −0,65 (−0,60 si es recubrimiento) | 0,15 (0,10) V | En el límite del ambiente duro |

- **Chapa de acero pintada con tornillos de inox (mío):** donde la pintura está intacta no hay contacto. Donde se lija para la toma de tierra queda acero desnudo junto al inox. La diferencia es de 0,35 V, pero la corrosión depende del electrolito (derrames de bebida, condensación) y de la relación de áreas. Los tornillos son un cátodo pequeño sobre una chapa (ánodo) grande: es la situación favorable. La situación mala es la contraria (cátodo grande y ánodo pequeño). Wikipedia dice que, si se daña el recubrimiento del metal más activo, queda un cátodo grande y un ánodo pequeño, y la corrosión se acelera en esa zona.
- **Latón (separadores, pasacables metálicos) y cobre estañado (ojales):** diferencias de 0,10-0,15 V, aceptables. Los pasacables de la guía son de goma.
- **Arandelas dentadas M4 (#24):** su material no consta (**sin verificar**). Si son de acero cincado, el cinc (ánodo pequeño) frente al inox (cátodo grande) se consume deprisa si hay humedad. Mientras estén secas, es irrelevante (mío). Una dentada de inox evita el problema.
- **Solo con la fuente:** la carcasa de la LRS-50 es metálica perforada; no he comprobado si es de acero cincado o de otro metal (**sin verificar**).
- **Tierra de protección (mío):** la ruta eléctrica de un ojal pasa por las caras apretadas (arandela, ojal, tuerca), no por la rosca. Por eso se puede lubricar la rosca sin comprometer la tierra, si no se manchan las caras. La resistencia de contacto se mide (límite de 0,1 Ω, guía §6).

### 5.5 Rotura por exceso de par

Ver [2.4](#24-pares-de-apriete-y-par-de-rotura). El M3 A2-70 tiene un par de rotura mínimo de 1,6 N·m (TR Fastenings) frente a unos 1,1 N·m de apriete con μ = 0,2. Una llave Allen de 2,5 mm de 70 mm de largo alcanza ese par con poca fuerza (cálculo mío: 1,1 N·m con una palanca de 0,07 m son unos 16 N). **Usa un destornillador dinamométrico** con las cifras de 4.3.

### 5.6 Tornillo demasiado largo en la fuente

Ver [4.2](#42-longitud-de-los-tornillos-de-la-lrs-50-5). Es el único fallo de este surtido con riesgo para personas, por el contacto con el lado de red.

### 5.7 Contenido que no cubre las necesidades

Los kits comparables (RS Pro) traen pocas longitudes por tamaño y no siempre cortas (2.5). Si el tuyo no trae M3 de la longitud calculada en 4.2, hay que comprar bolsas sueltas. Es un fallo de adecuación, no de calidad.

### 5.8 Piezas mezcladas o con rosca equivocada

El relato de MYCCR (5.1) menciona cubetas de supuesto 316 con acero normal y roscas distintas mezcladas. Es una sola anécdota, pero se detecta con una tuerca y un imán al recibirlo.

### 5.9 Cabezas, llaves y huecos

Un participante de Slickdeals dice que las cabezas de los tornillos baratos de Amazon se cortan con facilidad (5.1). **No he encontrado datos sobre las llaves incluidas en kits.** Usa una llave Allen de buena calidad, bien encajada, y aprieta sin forzar.

## 6. Qué comprobar al recibirlo

Herramientas: calibre, imán de neodimio, balanza de 0,01 g, destornillador o llave dinamométrica (que cubra de 0,3 a 5 N·m; para apretar M3 basta con un destornillador de hasta 1-2 N·m, pero la prueba de rotura del paso 7 llega a 4 N·m), lupa y una bolsa pequeña de A2-70 comprada a un distribuidor como referencia.

| # | Comprobación | Resultado esperado | Si no sale |
|---|---|---|---|
| 1 | Contar y fotografiar el contenido; comparar con el anuncio; anotar lote y vendedor | Coincide | Reclamar a Amazon; no montar |
| 2 | Medir longitud (de debajo de la cabeza a la punta), Ø de rosca, cabeza y llave de cada tipo; comparar con la [tabla 2.3](#23-dimensiones-por-tamaño) | Medidas dentro de la norma | Anotar |
| 3 | Probar cada tornillo con su tuerca a mano en todo el recorrido | Gira sin forzar | Descartar el tamaño; sospechar mezcla de pasos (relato de MYCCR) |
| 4 | Imán fuerte sobre cabezas, tuercas y arandelas, por separado | Respuesta nula o muy débil | Se pega con fuerza: descartar esa pieza (no es austenítica). Débil: compara con la bolsa de referencia (mismo imán, misma distancia) |
| 5 | Marca de cabeza en M5 y M6 | "A2-70" o similar, con marca de fabricante | Sin marca: sospechar (observación mía; regla de marcado de memoria) |
| 6 | Pesar 10 piezas de un tamaño y compararlas con las de referencia | Peso similar (±5 %, umbral mío) | Si pesan claramente menos, desconfiar |
| 7 | Rotura de 3 a 5 tornillos M3 y M4 sacrificiales con llave dinamométrica y tuerca (prueba orientativa: la norma ensaya con un montaje que no he leído) | No rompen por debajo de 1,6 N·m (M3) y 3,8 N·m (M4) | Rompen mucho antes: clase inferior a 70. Valores de una tabla de distribuidor |
| 8 | Apretar y aflojar una tuerca con antigripante a los pares de 2.4 | Gira lisa; sin chirrido ni adherencia | Chirrido o resistencia: parar y repetir con otra tuerca (Bolt Depot) |
| 9 | Dejar 24-48 h unas piezas en agua con sal y secar | Sin óxido | Óxido: no es inox de calidad (prueba mía) |
| 10 | Archivar fotos, lote, fecha, vendedor | | |

**Comprobación de la fuente:** antes de montar la LRS-50-5, mide el soporte, las arandelas, la longitud del tornillo y la profundidad del agujero real (4.2).

## 7. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **Divide la tornillería por riesgo.** Para lo que importa a la seguridad (tuercas y arandelas de la tierra M4, tornillos M3 de la fuente y del C14), compra bolsas sueltas de A2-70 de la longitud justa a un distribuidor industrial que indique norma y clase (RS, Würth, Bossard, Fastenal o Reyher son nombres que aparecen en las fuentes; **disponibilidad, precio y trazabilidad en España: sin verificar**). RS Pro tiene kits con ficha (393-169 y 281-978), pero siguen siendo kits. Usa el surtido de Amazon para el resto.
2. **Mide antes de pedir.** Espesor del soporte de la fuente, profundidad real de los agujeros (4.2), grosor de la chapa del C14, y cuántas tuercas M4 entran en el espárrago de 20 mm. Con eso se elige la longitud exacta y se compran las bolsas justas.
3. **Aprieta con destornillador dinamométrico** y los pares de [4.3](#43-pares-propuestos-por-punto). Rosca a mano, sin llave de impacto, despacio.
4. **Pasta antigripante en las roscas de inox contra inox,** nunca en las caras de la toma de tierra. Si usas fijador de roscas en esa misma rosca, limpia antes la pasta (guía de distribuidor de LOCTITE).
5. **Evita las tuercas autoblocantes de nailon en inox.** En el espárrago de tierra usa tuerca y contratuerca (como ya dice la guía) con arandelas dentadas bajo el ojal.
6. **Fijador de roscas** (el LOCTITE 243 de resistencia media, o el 222 de baja por debajo de M6 según la guía del distribuidor, que no he podido contrastar con Henkel) solo en las M3 de la fuente y del C14, con una gota en la rosca del tornillo y lejos de la punta. Nunca cerca de los separadores de nailon (la hoja técnica avisa de fisuras en termoplásticos). Confirma la compatibilidad antes.
7. **Marca los tornillos tras apretar** con un trazo de rotulador de pintura sobre cabeza y soporte, para ver si se aflojan (práctica general mía). Revisa en la primera revisión y cada año.
8. **No dependas de las arandelas Grower** ni de las dentadas para evitar el aflojamiento.
9. **Almacenamiento y reconocimiento:**
   - Caja de compartimentos con etiqueta por tamaño y longitud ("M3 × 6 Allen A2").
   - Aparta el inox del acero al carbono (la limadura de acero oxida el inox; práctica general mía).
   - Haz una **bolsa por máquina** con la cantidad exacta de cada pieza, y repuestos: 20 % más, mínimo 2 por tamaño (criterio mío).
   - Anota en la hoja de montaje el tamaño y la longitud de cada punto, para que otro operario no mezcle.
   - Limita las variantes: con M3 (fuente y C14) y M4 (tierra) cubres lo documentado. Las M5 y M6 solo si la carcasa las usa.
10. **Tornillería de producción en serie:** cuando fabriques en serie, no dependas de un ASIN de surtido. Compra por tamaño con certificado y guarda una muestra patrón por lote. El anuncio puede cambiar de contenido sin cambiar de ASIN (riesgo general, no confirmado en este anuncio).
11. **Pide a Mean Well o al distribuidor** el dibujo con la asignación de L=3,0 y L=5 (lateral/inferior) y el espesor máximo del tornillo; también lo pide la ficha #14.

**Afecta a otras piezas (una línea cada una):**

- **Fuente LRS-50-5 (#14):** las tres copias que he abierto dan "2-M3 L=3.0" y "2-M3 L=5"; ninguna permite asignar lateral/inferior. Posible origen de la lectura "L=4,5" de una copia de 2015 en las cotas "4.5" y "92.5" del dibujo (mío).
- **Espárragos de tierra (#25) y arandelas dentadas (#24):** pila de las tuercas M4 (3,2 mm cada una, 0,8 mm la arandela plana) y material de las dentadas por comprobar (inox o cincado). Ver 5.4.
- **Módulo C14 (#15):** si es de tornillos, M3 con par máximo de 0,5 N·m (Schurter).
- **Separadores de nailon M2.5 (#30):** LOCTITE 243 no es recomendable sobre plásticos.

## 8. Lo que no he podido verificar

- **El anuncio de Amazon B0BGRY2JGX:** marca, vendedor, grado, clase, contenido, longitudes, cantidades, tipos de cabeza, tuercas y arandelas. La página devolvió `ROBOTS_DISALLOWED` y el ASIN no aparece en otras webs que encontrara.
- **Qué agujeros de la LRS-50-5 son laterales y cuáles inferiores,** y si la tolerancia de ±1 mm del dibujo se aplica a L. Lo que sí vi: "2-M3 L=3.0" y "2-M3 L=5" en tres copias de la hoja. No abrí el PDF oficial de meanwell.com (la ficha #14 dice que su herramienta lo rechazó).
- **Material de la carcasa de la LRS-50-5** y si el agujero roscado es ciego.
- **Las normas completas:** ISO 3506-1/-2/-3/-4, ISO 4762, ISO 7380, ISO 4017, ISO 4032, ISO 7089, DIN 127, DIN 6798, DIN 985, MIL-STD-889. Solo vi las fichas de catálogo de las tres primeras y tablas de fabricantes. Las dimensiones de cabeza (4762, 7380), el marcado en M5 y M6, las equivalencias DIN-ISO y la altura de DIN 934 frente a ISO 4032 son **de memoria**.
- **La tabla de grados de ISO 3506-1** (composición de A2, A4) y si el par de rotura de TR Fastenings sale de la norma.
- **Tablas de pares de Würth, Bossard y Reyher** y las guías de grippado de Nickel Institute y Bossard.
- **Ensayos independientes o con XRF** de kits de tornillería de Amazon.es. El estudio de Thermo Fisher sobre XRF en fijaciones no se pudo abrir.
- **Si el 201 es más magnético que el 304:** sin fuente propia.
- **Temperatura máxima de las tuercas de nailon (120 °C)** y número de reutilizaciones: sin fuente.
- **Resultados del ensayo de Junker** para arandelas dentadas, para inox y para tamaños M3-M5. Los datos de Nord-Lock son M8 8.8 y de parte interesada.
- **Vibración real** en un bar y en esta caja.
- **Uso de arandelas de cuña de Nord-Lock sobre chapa pintada.**
- **Los archivos del proyecto** (carcasa_chapa.py, cajones.py, candados.py y otros): no tengo acceso desde mi herramienta, así que no sé si la carcasa usa M5 o M6 ni qué espesor tiene el separador.
- **Política de devolución y garantía de Amazon.es** y marcado del anuncio.
- **Disponibilidad y precios en España** de los kits RS Pro citados.

## 9. Fuentes

Todos los enlaces, ordenados por tipo y con nota en los que no pude abrir, en [`enlaces.md`](enlaces.md).
