# Cable bipolar 2 × 0,75 mm² rojo/negro, 10 m

Cable de la distribución de 5 V. Hace de **troncal** (de la LRS-50-5 a las dos regletas WAGO 221-415, una para +5 V y otra para GND) y de **ramas** (de las WAGO a los bornes USB-A del Solo y de la pantalla). Va dentro de la misma caja que los 230 V.

- **Compra:** ASIN B0D12QPF4Y, 14,10 € por 10 m (precio de la hoja de componentes del 19-20-10-2026). Número 21 de la hoja.
- **Aviso:** Amazon bloquea el acceso a mi herramienta. **No he visto el anuncio.** No sé qué metal, qué construcción de hilos, qué tensión asignada, qué aislante ni qué norma declara este cable concreto. Mi búsqueda por el ASIN no devolvió nada útil. El precio y la referencia son los de tu hoja.

> Investigación hecha el 21-10-2026. Cada dato indica de dónde sale. Lo que no he podido comprobar está marcado como **sin verificar**. Los cálculos y las deducciones propias llevan la etiqueta "cálculo mío" o "conclusión mía". **Las normas IEC/EN son de pago y no he leído su texto** (EN 60335-1, EN 60204-1, IEC 60364-5-52, EN 50525-2-11, IEC 60228…): las cifras vienen de fabricantes y de webs técnicas que las resumen. Está marcado donde importa.

## Índice

1. [Resumen para el proyecto](#1-resumen-para-el-proyecto)
2. [Qué cable es y qué se puede asegurar sin ficha](#2-qué-cable-es-y-qué-se-puede-asegurar-sin-ficha)
3. [Especificaciones de referencia](#3-especificaciones-de-referencia)
4. [Documentos y normas](#4-documentos-y-normas)
5. [Sección y cobre real](#5-sección-y-cobre-real)
6. [Corriente admisible, calor y caída de tensión](#6-corriente-admisible-calor-y-caída-de-tensión)
7. [Aislamiento y separación de los 230 V](#7-aislamiento-y-separación-de-los-230-v)
8. [Llama, humos y normativa de producto](#8-llama-humos-y-normativa-de-producto)
9. [Fallos, bugs y problemas conocidos](#9-fallos-bugs-y-problemas-conocidos)
10. [Montaje: terminales, polaridad, fijación y curvatura](#10-montaje-terminales-polaridad-fijación-y-curvatura)
11. [Qué comprobar al recibirlo](#11-qué-comprobar-al-recibirlo)
12. [Alternativas](#12-alternativas)
13. [Recomendaciones para el alcoholímetro](#13-recomendaciones-para-el-alcoholímetro)
14. [Lo que no he podido verificar](#14-lo-que-no-he-podido-verificar)
15. [Fuentes](#15-fuentes)

---

## 1. Resumen para el proyecto

- **"Aguanta 6 A" es correcto como corriente asignada de un cordón de 0,75 mm².** Fichas de Nexans y de Bricable dan 6 A para el H03VVH2-F, y el manual de Mean Well (según la [ficha de la LRS-50-5](../meanwell-lrs-50-5/README.md)) da 6 A para AWG 18. Las tablas de instalación dan más (8,5 a 12 A según condiciones, fuentes secundarias, [apartado 6.1](#61-qué-dicen-las-fuentes-sobre-los-6-a)). El pico de 5 A de la guía deja un 17 % de margen sobre 6 A; el consumo típico (2,3 A) es el 38 %. En 0,5 m de troncal a 5 A caen como máximo 130 mV y se disipan 0,65 W (cálculo mío, [apartado 6.3](#63-caída-de-tensión-y-calor-en-05-m-a-5-a)).
- **El riesgo de esta pieza es el cobre y el aislamiento, no la corriente.** Se venden como "2 × 0,75 mm²" cables rojo/negro de cobre aluminizado (CCA) con 2 × 24 hilos de 0,20 mm ([Kabelscheune](https://www.kabelscheune.de/Lautsprecherkabel/Lautsprecherkabel-2x0-75-mm-CCA-rot-schwarz.html)) y cables "Cu" cuyos hilos, sumados, dan 0,50 y 0,55 mm² (dos fichas de [Electrokit](https://www.electrokit.com/en/kabel-2x0.75mmcu-rod/svart-10m), cálculo mío). El CCA tiene ~46-54 % más resistencia que el cobre (cálculo mío) y los hilos se rompen más al flexionar ([ACI](https://www.aci.org.uk/news/aci-warns-dangerous-turkish-flexible-cord)).
- **Corrección a la cifra de partida:** **24,7 Ω/km no figura en ninguna fuente que abrí.** La tabla de IEC 60228 (copiada por Lapp) da para 0,75 mm² **24,5 Ω/km** (clases 1-2, rígidos) y **26,0 Ω/km** (clases 5-6, flexibles; 26,7 si el cobre es estañado). Un cable flexible de 0,75 mm² debe medir ≤ 26,0 Ω/km a 20 °C ([apartado 5.1](#51-qué-exige-la-norma-del-conductor)).
- **Junto a los 230 V, la tensión asignada del cable importa.** Anuncios de cable rojo/negro y de "Flachlitze" HO3VH-H 2 × 0,75 llevan **50 V como tensión máxima** ([Electrokit](https://www.electrokit.com/en/kabel-2x0.75mmcu-rod/svart-10m), [toom](https://toom.de/p/flachlitze-schwarz-2-x-075-mm-10-m/9062075)) y no tienen vaina. El REBT, para instalaciones (no para esta máquina), admite cables MBTS junto a otros circuitos solo con separación física, vaina no metálica adicional, pantalla a tierra o aislamiento para la tensión más alta ([ITC-BT-36 §2.2](https://normatia.com/es/normativa/rebt/2025/itc-bt-36-instalaciones-a-muy-baja-tension/)). **No pude leer EN 60335-1**, que es la que manda aquí ([apartado 7](#7-aislamiento-y-separación-de-los-230-v)).
- **Este cable no va a la clavija del sensor.** Los contactos JST-XH admiten de AWG 30 a 22 (0,33 mm² como máximo, [ficha de los JST-XH](../cables-jst-xh-4-pin/README.md)), y la guía §5.2 conecta el ZE29A con los hilos de 22 AWG de su clavija, directos a la WAGO. Tu planteamiento decía "y a la clavija del sensor": no cuadra con la guía.
- **La comprobación que distingue casi todo es una medida de 2 A en los 10 m** (20 m de conductor): cobre bueno da 0,46-0,52 Ω (0,92-1,04 V a 2 A); CCA o cobre de 0,5 mm², 0,67-0,78 Ω o más ([apartado 5.4](#54-qué-resistencia-debe-dar-el-rollo-de-10-m)). La resistencia sola no separa el CCA de 0,75 mm² del cobre de 0,5 mm²; hay que contar hilos y medir su diámetro ([apartado 11](#11-qué-comprobar-al-recibirlo)).

## 2. Qué cable es y qué se puede asegurar sin ficha

### 2.1 Tipos probables

Cuatro familias de cable explican casi todo lo que se vende como "2 × 0,75 mm² rojo/negro". Solo la primera tiene una norma armonizada que he podido confirmar.

| Tipo | Qué es | Tensión asignada | Temperatura | Norma | Fuente |
|---|---|---|---|---|---|
| **H03VVH2-F** ("manguera plana", cable de alimentación plano) | Dos conductores de cobre clase 5, aislante PVC y vaina PVC. Núcleos marrón y azul, vaina blanca o negra | 300/300 V | De −5 o 0 a +70 °C según el fabricante (ver [apartado 3](#3-especificaciones-de-referencia)) | EN 50525-2-11; en España UNE 21031-5 | [Nexans](https://www.nexans.no/en/products/Building-Wires-and-Cables/Standard-wires-and-cables/Standard-Installation-cables-and-wires/PL---PMH/H03VVH2-F--536929547.html), [Letronic](https://letronic.de/en/produkte/kabel/pdf/679/h03vvh2-f.pdf), [Bricable](https://cadena88.com/sites/default/files/content/products/files/9038r2x075b5/202406111040164063540.pdf) |
| **2192Y** (nombre británico del mismo cable plano) | Igual: plano con vaina, núcleos marrón y azul | 300/300 V | −15 a +70 °C | BS EN 50525-2-11 | [electrical4less](https://www.electrical4less.co.uk/product/2-core-0-75mm-flat-flexible-pvc-cable-2192y-1m/) |
| **H03VH-H** ("Flachlitze", "Zwillingslitze", cable paralelo sin vaina) | Dos conductores con su aislante unidos por un puente, sin vaina exterior | El anuncio de toom da **50 V como máximo** y lo destina a "instalaciones de baja tensión" | No consta | **No he podido confirmar qué norma lo cubre.** No aparece en el índice de EN 50525-2-12 ([VDE-Verlag](https://www.vde-verlag.de/previewpdf/70285002.pdf)) | [toom](https://toom.de/p/flachlitze-schwarz-2-x-075-mm-10-m/9062075) |
| **Cable de altavoz o "zip cord"** sin norma | Par paralelo rojo/negro, sin vaina, de cobre o de CCA | Electrokit: 50 V. Kabelscheune: no consta | Electrokit: −10 a +70 °C | Ninguna citada. Electrokit declara clase CPR Eca | [Electrokit](https://www.electrokit.com/en/kabel-2x0.75mmcu-rod/svart-10m), [Kabelscheune](https://www.kabelscheune.de/Lautsprecherkabel/Lautsprecherkabel-2x0-75-mm-CCA-rot-schwarz.html) |
| **Cable de CC** (DC) | Par rojo/negro 2 × 0,75 mm² para alimentación de equipos | BKL: 12 V, 10 A | No consta | No citada | [BKL](https://www.buerklin.com/en/p/82F478/) |
| **UL 2468 / UL 1007** | Designaciones UL que aparecen en algunos anuncios | — | — | **Sin verificar:** no abrí ninguna fuente de UL | — |

### 2.2 Lo que se puede asegurar sin ficha del vendedor

- **Casi nada del tipo.** Un cable rojo/negro no sigue el código de colores de los cables armonizados (marrón y azul para dos hilos; Letronic cita VDE 0293 / HD 308). Por tanto, lo normal es que un 2 × 0,75 rojo/negro **no sea un H03VVH2-F** y no tenga norma armonizada. Es conclusión mía.
- **"2 × 0,75 mm²" es un nombre comercial.** La sección real se comprueba contando hilos y midiendo su diámetro (n × π × d² / 4): 24 hilos de 0,20 mm dan 0,754 mm²; 16 hilos de 0,20 mm dan 0,503 mm²; 58 hilos de 0,11 mm dan 0,551 mm² (cálculos míos). Eso no dice nada del metal.
- **El precio no es una señal.** Tu hoja da 1,41 €/m. toom pide 7,99 € por 10 m de un HO3VH-H de 50 V; Electrokit, 99 SEK con IVA por 10 m de uno de 50 V. No he convertido monedas ni comparado calidades.
- **Sin marcas impresas, el cable no se identifica.** En un cable armonizado debe ir impreso el origen, la marca armonizada y la designación (ver [ficha del cable Schuko](../cable-schuko-c13-2m/README.md#marcado-qué-debe-ir-impreso)). Un cable "sin nada" puede ser cualquier cosa de la tabla.

### 2.3 Lo que debe decir el anuncio (o el vendedor, por escrito)

1. **Material del conductor:** cobre (Cu, OFC o cobre estañado), nunca "CCA", "Cu/Al" ni "aleación".
2. **Construcción:** número y diámetro de los hilos (p. ej. 24 × 0,20 mm).
3. **Tensión asignada y temperatura:** 300/300 V (o más) y 70 °C. Si pone 50 V, 30 V o no pone nada, no es documentación.
4. **Aislante y vaina:** PVC; si lleva vaina (dos capas) o es solo un aislante por hilo.
5. **Norma o marca:** EN 50525-2-11 / H03VVH2-F / marca <HAR>, o ensayo UL.
6. **Declaración RoHS** y, si es posible, REACH ([apartado 8](#8-llama-humos-y-normativa-de-producto)).

## 3. Especificaciones de referencia

**No son las del anuncio.** Son datos de cables documentados, para saber qué esperar. Dos tablas: el cable plano con vaina (el único con ficha de fabricante de una norma armonizada) y lo que anuncian otros vendedores de cable rojo/negro.

### 3.1 H03VVH2-F 2 × 0,75 mm² (el cable plano armonizado)

| Característica | Valor | Fuente |
|---|---|---|
| Tensión asignada Uo/U | 300/300 V | [Nexans NO](https://www.nexans.no/en/products/Building-Wires-and-Cables/Standard-wires-and-cables/Standard-Installation-cables-and-wires/PL---PMH/H03VVH2-F--536929547.html), [Letronic](https://letronic.de/en/produkte/kabel/pdf/679/h03vvh2-f.pdf), [Bricable](https://cadena88.com/sites/default/files/content/products/files/9038r2x075b5/202406111040164063540.pdf) |
| Norma | EN 50525-2-11 (Nexans); también HD 21.5, IEC 60227-1 y NF C32-201/5 (Nexans FR); UNE 21031-5 (Bricable) | [Nexans FR](https://www.nexans.fr/en/products/Building/Residential/Flexibles-wires/H03VVH2-F-536932485/product~10026200~.html), Bricable |
| Conductor | Cobre, clase 5 (flexible) según EN 60228. Diámetro del conductor 1,1 mm | [Nexans NO](https://www.nexans.no/en/products/Building-Wires-and-Cables/Standard-wires-and-cables/Standard-Installation-cables-and-wires/PL---PMH/H03VVH2-F--536929547.html) |
| Dimensiones exteriores | 3,3 × 5,6 mm (Bricable); 3,8 × 5,7 mm (Nexans FR); 4,0 × 5,6 mm (Letronic) | Las tres fuentes anteriores. No coinciden entre fabricantes |
| Peso del cable | 32 kg/km (Nexans FR); 33,4 (Bricable); 35 (Nexans NO); 40,0 (Letronic) | Idem |
| Peso del cobre | 14,4 kg/km | [Letronic](https://letronic.de/en/produkte/datenblatt/681/h03vvh2-f) |
| Temperatura | Letronic: −5 a +70 °C en movimiento, −30 a +70 °C fijo. Nexans NO: 0 a 70 °C. Nexans FR: −5 a 60 °C | Idem |
| Radio de curvatura | Letronic: 3 × Ø fijo, 5 × Ø en movimiento. Nexans FR: 11,7 mm estático. electrical4less: 6 × el diámetro | Idem, [electrical4less](https://www.electrical4less.co.uk/product/2-core-0-75mm-flat-flexible-pvc-cable-2192y-1m/) |
| Corriente | 6 A (Bricable; Nexans FR "6 A al aire libre") | Bricable, Nexans FR |
| Llama | IEC 60332-1 (F2) según Nexans NO; C2 (NF C 32-070) según Nexans FR. **No es libre de halógenos** (Nexans NO) | Nexans NO y FR |
| Uso | Aparatos portátiles ligeros domésticos (lámparas, radios); Nexans FR excluye calefacción y cocina. electrical4less: solo interior seco | Idem |
| Colores | Núcleos marrón y azul claro; vaina blanca. Código HD 308 sin verde-amarillo (Letronic) | Nexans FR, Letronic |

### 3.2 Cables rojo/negro de 2 × 0,75 mm² anunciados por otros vendedores

| Vendedor y artículo | Conductor | Construcción | Tensión y temperatura | Dimensiones | Observación |
|---|---|---|---|---|---|
| [Electrokit 41023634](https://www.electrokit.com/en/kabel-2x0.75mmcu-rod/svart-10m) (10 m, 99 SEK con IVA) | Cobre OFC | 2 × 58 × 0,11 mm | 50 V; −10 a +70 °C; PVC; clase CPR Eca | 2,5 × 5,0 mm | Dice "0,75 mm² (AWG 18)", pero 58 × 0,11 mm suman **0,55 mm²** por conductor (cálculo mío); AWG 18 son 0,823 mm² |
| [Electrokit, ficha "LSK 2×0,75 100 m rojo/negro CU"](https://www.electrokit.com/upload/quick/ce/5b/ff38_41023634-41023637.pdf) | Cobre OFC | 2 × 16 × 0,2 mm | No consta | 2,2 × 4,4 mm | 16 × 0,2 mm suman **0,50 mm²** por conductor (cálculo mío). La ficha es de otro artículo (el 15083), no del de 10 m |
| [Kabelscheune, cable de altavoz CCA](https://www.kabelscheune.de/Lautsprecherkabel/Lautsprecherkabel-2x0-75-mm-CCA-rot-schwarz.html) | **Cobre/aluminio (CCA)** | 2 × 24 × 0,20 mm | No consta | 5,2 × 2,4 mm | 24 × 0,20 suman 0,754 mm²: la geometría cuadra, el metal no |
| [toom, "Flachlitze" HO3VH-H](https://toom.de/p/flachlitze-schwarz-2-x-075-mm-10-m/9062075) | No consta | No consta | **50 V máximo** | No consta | Negro (no rojo/negro). Fabricante S.C. Cableteam (Rumanía). 7,99 € por 10 m |
| [BKL 072071](https://www.buerklin.com/en/p/82F478/) | No consta | No consta | 12 V, 10 A | No consta | Cable de CC con clavija de 2,1 × 5,5 mm. Declara RoHS y libre de SVHC. Solo para empresas |

### 3.3 Referencias del cobre

| Dato | Valor | Fuente |
|---|---|---|
| Conductividad del cobre recocido (100 % IACS) | 58 × 10⁶ S/m a 20 °C, es decir, 0,01724 Ω·mm²/m | [Wikipedia: IACS](https://en.wikipedia.org/wiki/International_Annealed_Copper_Standard) (la resistividad es cálculo mío) |
| AWG 18 / 20 / 22 (cobre macizo, 20 °C) | 0,823 mm², 20,95 mΩ/m / 0,518 mm², 33,31 mΩ/m / 0,326 mm², 52,96 mΩ/m | [Wikipedia: AWG](https://en.wikipedia.org/wiki/American_wire_gauge) |
| Densidad del cobre y del aluminio | 8,96 y 2,70 g/cm³ | Valores míos, de memoria, **sin fuente** |
| Coeficiente de temperatura del cobre | 0,00393 /K | Valor mío, de memoria, **sin fuente** (factor a 25 °C: +2 %) |

## 4. Documentos y normas

Un cable genérico no tiene datasheet. La "ficha" es la norma del conductor y la del cable, más lo que declare el vendedor. **No he podido leer el texto de ninguna norma.** Enlazo fichas de fabricantes que las citan, tablas que las copian y páginas oficiales con el sumario.

| Documento | Referencia | Formato | Enlace |
|---|---|---|---|
| Resistencia de conductores por clase y sección (copia de la norma de conductores) | DIN EN 60228 (VDE 0295), tabla "T11" de Lapp | PDF | [Descargar](https://t3.lappcdn.com/fileadmin/DAM/Miltronic_Denmark/4_servicecenter/T11.pdf) ([copia local](datasheets/T11.pdf)) |
| Misma tabla en una web técnica | IEC 60228 (la página cita también IEC 60287 por error) | Web | [mycableengineering](https://mycableengineering.com/knowledge-base/iec-60228-dc-resistance) |
| Ficha del H03VVH2-F (Letronic) | Artículo 2852075610 | PDF | [Descargar](https://letronic.de/en/produkte/kabel/pdf/679/h03vvh2-f.pdf) |
| Ficha del H03VVH2-F (Nexans, Noruega) | EN 50525-2-11 | Web | [Ver](https://www.nexans.no/en/products/Building-Wires-and-Cables/Standard-wires-and-cables/Standard-Installation-cables-and-wires/PL---PMH/H03VVH2-F--536929547.html) |
| Ficha del H03VVH2-F 2×0,75 en bobina de 5 m (Nexans, Francia) | Ref. 10026200; EN 50525-2-11, HD 21.5, IEC 60227-1 | Web | [Ver](https://www.nexans.fr/en/products/Building/Residential/Flexibles-wires/H03VVH2-F-536932485/product~10026200~.html) |
| Ficha de la manguera plana H03VVH2-F / H05VVH2-F (Bricable) | UNE 21031-5 | PDF | [Descargar](https://cadena88.com/sites/default/files/content/products/files/9038r2x075b5/202406111040164063540.pdf) |
| Cable plano 2192Y 2 × 0,75 (electrical4less) | BS EN 50525-2-11 | Web | [Ver](https://www.electrical4less.co.uk/product/2-core-0-75mm-flat-flexible-pvc-cable-2192y-1m/) |
| EN 50525-2-12 (sumario) | DIN EN 50525-2-12 (VDE 0285-525-2-12):2012-01 | PDF (solo sumario) | [Ver](https://www.vde-verlag.de/previewpdf/70285002.pdf) |
| EN 50525-2-11 (ficha de venta) | DIN EN 50525-2-11:2012-01 | Web | [DIN Media](https://www.dinmedia.de/en/standard/din-en-50525-2-11/146332248) (citada en la [ficha del cable Schuko](../cable-schuko-c13-2m/README.md), **no la reabrí**) |
| Corriente admisible de cables flexibles (resumen de VDE 0298-4, tabla 11) | Bayka TD06 | PDF | [Inglés](https://www.bayka.de/wp-content/uploads/2022/11/TD06EN-current-carrying-capacity-flexible-copper-cables-and-wires.pdf) ([copia local](datasheets/TD06EN-current-carrying-capacity-flexible-copper-cables-and-wires.pdf)) · [Alemán](https://www.bayka.de/wp-content/uploads/2022/03/TD06DE-Strombelastbarkeit-flexible-Kupferkabel-und-Leitungen.pdf) |
| Corriente admisible en máquinas (resumen atribuido a EN 60204-1) | Kollmorgen | Web | [Ver](https://www.kollmorgen.com/content/strombelastbarkeit-0) |
| REBT, instalaciones a muy baja tensión | ITC-BT-36 | Web | [Normatia](https://normatia.com/es/normativa/rebt/2025/itc-bt-36-instalaciones-a-muy-baja-tension/) |
| REBT, prescripciones generales (intensidades, colores, aislamiento) | ITC-BT-19 | PDF | [Descargar](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-19.pdf)) |
| CPR para cables (preguntas frecuentes de Nexans) | EN 50575 | Web | [Ver](https://www.nexans.co.uk/en/business/buildings/building/Fire-safety/Construction-Products-Regulation/FAQ-on-CPR.html) |
| CPR y la industria del cable (Prysmian) | EN 50575 | PDF | [Descargar](https://tr.prysmian.com/sites/tr.prysmian.com/files/2025-01/Construction_Products_Regulations_and_Cable_Industry.pdf) ([copia local](datasheets/Construction_Products_Regulations_and_Cable_Industry.pdf)) |
| Aviso de ACI sobre cable flexible de CCA | 21-9-2018 | Web | [Ver](https://www.aci.org.uk/news/aci-warns-dangerous-turkish-flexible-cord) |
| Aviso de ACI sobre cable CAT 5e de CCA | ACI/131/12, dic. 2012 | Web/PDF | [Ver](https://www.aci.org.uk/download_file/view/6/191) |
| Fluke Networks sobre CCA | Blog | Web | [Ver](https://de.flukenetworks.com/blog/cabling-chronicles/cca-not-worth-savings-or-risk) |
| Mello, diferencias entre CCA y aluminio | Whitepaper | PDF | [Descargar](https://www.mikeholt.com/files/PDF/64ae21784d8c117de3647122_Mello%20Whitepaper-Performance%20Differences%20Between%20CCA%20and%20Al.pdf) |
| Prueba de cables de altavoz de cobre y CCA a 5,2 V y 3 A | techtest.org | Web | [Ver](https://techtest.org/7-lautsprecherkabel-querschnitte-und-typen-im-vergleich/) |
| Fijación del cableado interno y SELV (whitepaper de un laboratorio) | "Weekly Whitepaper #69" | PDF | [Descargar](https://uploads-ssl.webflow.com/5964a1de0dff681f24a9308b/5b69410c762831d5962091e1_Weekly%20Whitepaper%20%2369%20-%20Understanding%20Fixing%20of%20Wiring.pdf) |
| WAGO 221-415, datos | Copia en rlocman | Web | [Ver](https://www.rlocman.es/datasheet/data.html?di=537187) |
| Puntera AI 0,75-8 GY (Phoenix Contact) | 3200519 | Web | [Ver](https://www.phoenixcontact.com/en-sa/products/ferrule-ai-075-8-gy-3200519) |
| RoHS, PVC, zip cord, cobre aluminizado | Wikipedia | Web | [RoHS](https://en.wikipedia.org/wiki/Restriction_of_Hazardous_Substances_Directive) · [PVC](https://en.wikipedia.org/wiki/Polyvinyl_chloride) · [zip cord](https://en.wikipedia.org/wiki/Zip_cord) · [CCA](https://en.wikipedia.org/wiki/Copper-clad_aluminium_wire) |
| Directiva de baja tensión 2014/35/UE | EUR-Lex | Web | [Ver](https://eur-lex.europa.eu/eli/dir/2014/35/oj/eng) (mi herramienta solo recibió la cabecera, **no el texto**) |

### Qué dicen los más relevantes

- **Tabla de resistencia (DIN EN 60228 vía Lapp T11):** máximo a 20 °C para 0,5 / 0,75 / 1,0 / 1,5 mm²: clase 2, 36,0 / 24,5 / 18,1 / 12,1 Ω/km; clases 5 y 6, 39,0 / **26,0** / 19,5 / 13,3; estañado clases 5 y 6, 40,1 / 26,7 / 20,0 / 13,7. [mycableengineering](https://mycableengineering.com/knowledge-base/iec-60228-dc-resistance) da lo mismo para 0,75 mm² (24,5 / 26,0 / 26,7). La fila de 0,75 mm² de Lapp lista, entre otras, 7 × 0,37 mm y ~24 × 0,20 mm; no pude asignar cada configuración a su clase.
- **EN 50525-2-12 (sumario del VDE):** cubre cables con vaina "H03VVH8-F", "H03VVH2H8-F", "H05VVH8-F" y "H05VVH2H8-F" (tablas D.1 y D.2 con 300/300 V y 300/500 V). **H03VH-H no aparece** en el sumario. Qué norma lo cubre: **sin verificar**.
- **ITC-BT-36 §2.2 y ITC-BT-19:** ver [apartado 7](#7-aislamiento-y-separación-de-los-230-v).
- **ACI 2018:** cable flexible de PVC de 1,5 y 2,5 mm² marcado "Made in Turkey" y "Ermaks", con conductores de CCA. Resistencia por encima del límite de las normas británica y europea; los de 2,5 mm² "apenas" alcanzaban la capacidad de uno de 1,0 mm². El CCA se rompe más al flexionar: pérdida de continuidad o punto caliente con arco.

## 5. Sección y cobre real

### 5.1 Qué exige la norma del conductor

| Sección | Clase 2 (rígido) | Clases 5-6 (flexible), cobre | Clases 5-6, cobre estañado | Fuente |
|---|---|---|---|---|
| 0,5 mm² | 36,0 Ω/km | 39,0 Ω/km | 40,1 Ω/km | [Lapp T11](https://t3.lappcdn.com/fileadmin/DAM/Miltronic_Denmark/4_servicecenter/T11.pdf) ([copia local](datasheets/T11.pdf)) |
| **0,75 mm²** | 24,5 | **26,0** | 26,7 | Lapp T11, mycableengineering |
| 1,0 mm² | 18,1 | 19,5 | 20,0 | Lapp T11 |
| 1,5 mm² | 12,1 | 13,3 | 13,7 | Lapp T11 |

- Son **máximos a 20 °C**. Un cable de cobre flexible de 0,75 mm² medirá entre 23 Ω/km (cobre ideal con la sección exacta, cálculo mío con 58 MS/m) y 26,0 Ω/km.
- **24,7 Ω/km no sale en estas tablas.** Está entre el valor del cobre ideal y el máximo de la clase 5; no sé de dónde viene.
- Un cable de 0,75 mm² de cobre debe medir **≤ 26,0 Ω/km**; si mide más, no cumple la norma de conductores que su sección declara.

### 5.2 Pruebas y casos publicados

Lo que he encontrado. **No hay ninguno de un cable de 2 × 0,75 mm² vendido en Amazon.** Solo busqué una vez en alemán; **no encontré pruebas de Which?, Test-Achats, OCU ni Stiftung Warentest** sobre este tipo de cable (no es que no existan: no las vi).

| Fuente | Qué encontró | Tipo |
|---|---|---|
| [ACI, 2018](https://www.aci.org.uk/news/aci-warns-dangerous-turkish-flexible-cord) | Cable flexible de PVC de 1,5 y 2,5 mm² con CCA: resistencia mayor que el máximo de las normas; 2,5 mm² "apenas" equivalía a 1,0 mm² en capacidad. Los hilos se rompen al flexionar | Asociación de cables homologados, ensayo de muestras |
| [ACI, 2012](https://www.aci.org.uk/download_file/view/6/191) | Cable CAT 5e de CCA: las versiones baratas tienen "menos del 20 % de cobre"; fallos de resistencia a más de 70-90 m. Es cable de red, no de potencia | Misma entidad |
| [Fluke Networks](https://de.flukenetworks.com/blog/cabling-chronicles/cca-not-worth-savings-or-risk) | La resistencia del aluminio es "aproximadamente un 55 % mayor" que la del cobre del mismo diámetro; el rascado muestra el aluminio plateado; **el peso se puede falsear con lastre** | Fabricante de instrumentos, cable de red |
| [Mello (Mike Holt)](https://www.mikeholt.com/files/PDF/64ae21784d8c117de3647122_Mello%20Whitepaper-Performance%20Differences%20Between%20CCA%20and%20Al.pdf) | CCA: 10 % de la sección es cobre (27 % de la masa); la capa de cobre es la que toca los conectores | Whitepaper alojado por Mike Holt; autor no identificado en lo que recibí. Compara cable de potencia de edificio (AWG 10 y 12) |
| [techtest.org](https://techtest.org/7-lautsprecherkabel-querschnitte-und-typen-im-vergleich/) | Medida a 5,2 V y 3 A en 4 m (lazo de 8 m): el cable de **0,75 de CCA perdió "más de 1 V"**. No da ohmios | Web de aficionado, una sola medida |
| [Electrokit](https://www.electrokit.com/en/kabel-2x0.75mmcu-rod/svart-10m), [su ficha](https://www.electrokit.com/upload/quick/ce/5b/ff38_41023634-41023637.pdf) | Cables "Cu 2 × 0,75" cuyos hilos suman 0,55 y 0,50 mm² (cálculo mío). Puede ser una errata de la ficha o un cable más fino que el anunciado: no lo sé | Vendedor |
| [Kabelscheune](https://www.kabelscheune.de/Lautsprecherkabel/Lautsprecherkabel-2x0-75-mm-CCA-rot-schwarz.html) | Se vende como "2 × 0,75 mm²" un cable de CCA de 2 × 24 × 0,20 mm | Vendedor, con el metal declarado |
| [Wikipedia: CCA](https://en.wikipedia.org/wiki/Copper-clad_aluminium_wire) | Para CC el CCA tiene más resistencia. Afirma que no hay historial de recalentamiento en conexiones de CCA y que no conoce falsificaciones de cable de edificio de baja tensión en CCA | Enciclopedia; la página no cita cifras |

La ficha del [cable Schuko](../cable-schuko-c13-2m/README.md#61-conductores-más-finos-de-lo-marcado) recoge alertas europeas de Safety Gate por cables "demasiado finos" en alargaderas, luces y cargadores. **No las reabrí.**

### 5.3 Estimación mía del CCA

Cálculo mío: el cobre y el aluminio conducen en paralelo, así que la conductividad es la media ponderada por la sección. Con 10 % de cobre ([Mello](https://www.mikeholt.com/files/PDF/64ae21784d8c117de3647122_Mello%20Whitepaper-Performance%20Differences%20Between%20CCA%20and%20Al.pdf)) y una conductividad del aluminio de 35,5 a 37,7 MS/m (la segunda es la que cita techtest.org; la primera es mi valor de memoria, 61 % IACS):

| Dato | Valor |
|---|---|
| Conductividad del CCA con 10 % de cobre | 37,8 a 39,7 MS/m (65 a 69 % del cobre) |
| Resistencia relativa al cobre | **×1,46 a ×1,54** (+46 % a +54 %) |
| Resistencia de un conductor de 0,75 mm² | 33,6 a 35,3 mΩ/m, frente a 23,0 mΩ/m del cobre ideal |
| Densidad | 3,33 g/cm³; el cobre es el 26,9 % de la masa (coincide con el 27 % de Mello) |
| Masa de los dos conductores de 0,75 mm² | 5,0 g/m, frente a 13,4 g/m del cobre: 85 a 90 g menos en 10 m (90 g con el factor de cableado que sale de la ficha de Letronic, 14,4 / 13,4) |

- **La medida de techtest.org** (más de 1 V a 3 A en un lazo de 8 m) implica **más de 41 mΩ/m por conductor**, es decir, **más de ×1,8** frente al cobre ideal (cálculo mío; la medida incluye contactos que no sé cuánto suman). Es más que mi estimación del 10 %: cuadraría con un CCA de menos cobre o con una sección inferior a la anunciada. Una medida, de una web sin metodología publicada.
- El porcentaje de cobre de un cable concreto es **desconocido**; el ACI sugiere que algunos cables lo reducen mucho (2,5 mm² que valen como 1,0 mm²).

### 5.4 Qué resistencia debe dar el rollo de 10 m

Los 10 m de cable, con los dos conductores unidos en un extremo, forman un lazo de **20 m de conductor**. Cálculo mío, a 20 °C. A 25 °C suma un 2 %; mide la longitud real.

| Caso | Resistencia del lazo de 10 m | Tensión a 2 A | Origen |
|---|---|---|---|
| Cobre de 0,75 mm² exactos | 0,460 Ω | 0,92 V | 58 MS/m |
| Cobre de 0,75 mm², máximo de IEC 60228 clase 5 | **0,520 Ω** | **1,04 V** | 26,0 Ω/km |
| Cobre estañado de 0,75 mm², máximo | 0,534 Ω | 1,07 V | 26,7 Ω/km |
| Cobre de 0,5 mm² exactos | 0,690 Ω | 1,38 V | 58 MS/m |
| Cobre de 0,5 mm², máximo de clase 5 | 0,780 Ω | 1,56 V | 39,0 Ω/km |
| CCA de 0,75 mm², 10 % de cobre | 0,67 a 0,71 Ω | 1,34 a 1,41 V | apartado 5.3 |
| CCA según la medida de techtest.org | ≥ 0,83 Ω | ≥ 1,67 V | apartado 5.3 |

**Cómo leerlo (conclusión mía):**

- **≤ 0,55 Ω:** compatible con cobre de 0,75 mm². Es lo que se espera del cable bueno.
- **0,60 a 0,75 Ω:** o es CCA de 0,75 mm² o es cobre de unos 0,5-0,6 mm². **La resistencia no separa los dos casos**: hay que mirar el diámetro de los hilos y el color de la fractura.
- **> 0,75 Ω:** no es un 0,75 mm² de cobre.
- Los contactos de las pinzas añaden: usa el método de cuatro hilos del [apartado 11](#11-qué-comprobar-al-recibirlo).

## 6. Corriente admisible, calor y caída de tensión

### 6.1 Qué dicen las fuentes sobre los 6 A

| Fuente | Valor para 0,75 mm² | Condición | Tipo |
|---|---|---|---|
| [Nexans FR](https://www.nexans.fr/en/products/Building/Residential/Flexibles-wires/H03VVH2-F-536932485/product~10026200~.html) | 6 A al aire libre | Ficha del H03VVH2-F | Fabricante |
| [Bricable](https://cadena88.com/sites/default/files/content/products/files/9038r2x075b5/202406111040164063540.pdf) | 6 A | Ficha del H03VVH2-F | Fabricante |
| Cordones Schuko-C13 de 0,75 mm² | 6 A (RS PRO, International Configurations) | Ver [ficha del cable Schuko](../cable-schuko-c13-2m/README.md#4-sección-y-tipo-de-cable-qué-dice-cada-fuente) | Fabricantes; no reabiertas |
| Manual de Mean Well | AWG 18 (0,75 mm²) hasta 6 A; reducir al 80 % con cinco o más hilos | Ver [ficha de la LRS-50-5](../meanwell-lrs-50-5/README.md) | Fabricante; no reabierto |
| [Bayka, resumen de VDE 0298-4 tabla 11](https://www.bayka.de/wp-content/uploads/2022/03/TD06DE-Strombelastbarkeit-flexible-Kupferkabel-und-Leitungen.pdf) | **15, 6, 6 y 12 A** en cuatro columnas (nº de hilos cargados: 1, 2, 3, "2 o 3") | "Frei in Luft" y "auf oder an Flächen". **No pude asignar cada valor a su columna.** Temperatura no indicada | Secundaria |
| [Kollmorgen, atribuido a EN 60204-1](https://www.kollmorgen.com/content/strombelastbarkeit-0) | 10,4 A (cable en bandeja abierta), 8,5 A (un cable en canal), 6,8 A (dos cables en canal) | A 40 °C de ambiente, PVC. **No cita el número de tabla** (yo la recuerdo como tabla 6, sin verificar) | Secundaria |
| [ITC-BT-19 §2.2.3](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-19.pdf)) | **Sin valor:** remite a UNE 20460-5-523 y a su tabla 1 (aire a 40 °C) | La extracción no devolvió los valores de la tabla 1, así que no sé si lista 0,75 mm² | Reglamento |
| IEC 60364-5-52 | **No abierta** | — | — |

**Conclusión mía:**

- **6 A es la corriente asignada del cordón de 0,75 mm²**, el valor prudente que dan los fabricantes. Las tablas de instalación y de máquinas permiten más (8,5 a 12 A) con condiciones. La guía acierta.
- **La corriente de diseño del troncal es de 5 A de pico y 2,3 A típicos** (guía §3). Está por debajo de 6 A. Las ramas llevan como mucho 2 A (Solo, pico estimado) y 0,5 A (pantalla), es decir, mucho menos.
- **Los márgenes bajan con el calor y el agrupamiento.** Con los factores de la web de Kollmorgen (30 °C 1,15; 40 °C 1,00; 45 °C 0,91; 50 °C 0,82; 55 °C 0,71; 60 °C 0,58, referidos a 40 °C): el valor de 8,5 A baja a 7,0 A a 50 °C y a 4,9 A a 60 °C (cálculo mío). Bayka da, para cables multiconductor agrupados, 0,75 con 5 hilos, 0,65 con 7 y 0,55 con 10 (tabla 26 de VDE 0298-4, según esa página). Con cuatro pares juntos (8 hilos) el factor sería de ~0,6 (interpolación mía): 6 A × 0,6 = 3,6 A, todavía por encima de los 2 A de la rama más cargada.
- **La corriente que el cable puede ver en una avería no es 5 A.** La LRS-50-5 limita en 10,6 a 14,4 A (ver [ficha de la LRS](../meanwell-lrs-50-5/README.md), cálculo suyo con la protección de 110-150 %). Un cortocircuito en una rama a 0,75 mm² puede superar 6 A, y la fuente reintenta en modo *hiccup*. No sé qué ciclo de trabajo tiene ese modo (la hoja que leyó la ficha de la LRS no lo da). Es una cuestión de diseño del raíl, no de este cable ([apartado 13](#13-recomendaciones-para-el-alcoholímetro)).

### 6.2 Calor

Cálculo mío con 26,0 mΩ/m por conductor (máximo de la norma), lazo de ida y vuelta:

| Corriente | Potencia por metro de par | Subida de temperatura estimada, al aire libre |
|---|---|---|
| 2,3 A (típico) | 0,28 W/m | ~1,5 K |
| 5 A (pico) | 1,3 W/m | ~7 K |
| 6 A | 1,9 W/m | ~10 K |
| 12 A | 7,5 W/m | ~40 K (es la hipótesis de partida) |

La última fila es una **suposición**: tomo los 12 A de la tabla 11 de VDE 0298-4 como la corriente que sube el conductor 40 K sobre 30 °C (hasta los 70 °C del PVC) y escalo con I². Es una estimación al aire libre; **en un haz o dentro de una caja con 40-50 °C la subida será mayor**. A 5 A el calor es pequeño; no es una razón para dudar del 0,75 mm² de cobre.

### 6.3 Caída de tensión y calor en 0,5 m a 5 A

Cálculo mío: dos conductores de 0,5 m (ida y vuelta), a 20 °C.

| Cable | Resistencia por conductor | Lazo | Caída a 5 A | Calor a 5 A | Caída a 2,3 A |
|---|---|---|---|---|---|
| Cobre 0,75 mm² exactos | 11,5 mΩ | 23,0 mΩ | 115 mV | 0,57 W | 53 mV |
| Cobre 0,75 mm², máximo de la norma | 13,0 mΩ | 26,0 mΩ | **130 mV** | 0,65 W | 60 mV |
| Cobre estañado, máximo | 13,4 mΩ | 26,7 mΩ | 134 mV | 0,67 W | 61 mV |
| Cobre 0,5 mm², máximo | 19,5 mΩ | 39,0 mΩ | 195 mV | 0,97 W | 90 mV |
| CCA 0,75 mm² (10 % de cobre, estimación) | 16,8 a 17,7 mΩ | 33,6 a 35,3 mΩ | 168 a 177 mV | 0,84 a 0,88 W | 77 a 81 mV |
| Según la medida de techtest.org | ≥ 20,8 mΩ | ≥ 41,6 mΩ | ≥ 208 mV | ≥ 1,04 W | ≥ 96 mV |

- Por **metro de tendido** (lazo de 2 m de conductor), el cobre en el máximo de la norma pierde 260 mV a 5 A; el CCA, 336-353 mV. A 60 °C en el conductor, la resistencia sube un 16 % (factor mío con 0,00393 /K): 150 mV en los 0,5 m de cobre.
- Un 5 A de pico real solo se da si todas las cargas llegan al pico a la vez (guía §3). Con 2,3 A típicos, la caída del cobre es de 60 mV.

### 6.4 Efecto sobre la Pi (umbral de 4,63 V)

La guía ajusta la fuente a 5,20 V. La [ficha de la LRS-50-5](../meanwell-lrs-50-5/README.md) calcula un mínimo teórico de 5,08 V en el peor caso de tolerancias, sin contar el cable. La [ficha de la Pi](../raspberry-pi-3b-plus/README.md) da el umbral de aviso en **4,63 V ±5 %**; el extremo alto sería 4,86 V (cálculo mío). El latiguillo de la Pi (22 AWG, 0,15 m, 2 A de pico) resta 32 mV (cálculo mío con 52,96 mΩ/m de la tabla AWG).

Tensión en la entrada de la Pi, restando la caída del troncal a 5 A y la del latiguillo a 2 A (cálculo mío; no incluye WAGO, conector micro-USB ni el circuito de la propia placa):

| Troncal (longitud y cable) | Con la fuente a 5,20 V | Con la fuente a 5,08 V |
|---|---|---|
| 0,5 m, cobre en el máximo | 5,04 V | 4,92 V |
| 1,0 m, cobre en el máximo | 4,91 V | 4,79 V |
| 0,5 m, CCA (estimación) | 4,99 V | 4,87 V |
| 1,0 m, CCA (estimación) | 4,82 V | 4,70 V |
| 0,5 m, según la medida de techtest.org | 4,96 V | 4,84 V |
| 1,0 m, según la medida de techtest.org | 4,75 V | **4,63 V** |

- Con cobre bueno y 0,5 m de troncal, el cable no es el problema (≥ 4,92 V frente a 4,63 V; también por encima del extremo alto de 4,86 V).
- Con CCA, o con un troncal de 1 m, el margen se come: en el peor caso apilado (fuente en 5,08 V, pico de 5 A simultáneo y umbral en el extremo alto) la Pi podría avisar. Es un caso extremo de tolerancias apiladas, no una predicción.
- **Conclusión mía:** troncal de **0,5 m o menos**, medir con `vcgencmd get_throttled` (debe dar `0x0`, guía §2.1) y con un polímetro en la propia Pi, con la máquina en su pico (arranque del Solo y de la pantalla).
- **Lado alto:** la caída del cable ayuda con el límite de 5,25 V de la pantalla y de 5,3 V del ZE29A. No es un argumento para un cable fino.

## 7. Aislamiento y separación de los 230 V

La guía mete el cable de 5 V en la misma caja que la entrada de red. La LRS-50-5 tiene todos sus bornes en una misma regleta de cinco: **1 AC/L, 2 AC/N, 3 FG, 4 DC −V, 5 DC +V** (plano local del fabricante, p. 4; corrección de Auditor 6.1-S, 21-10-2026). FG queda entre N y −V. La separación y fijación del cableado AC/DC deben diseñarse; el orden anterior de esta ficha era erróneo.

### 7.1 Lo que sí he podido leer

| Fuente | Qué dice | Alcance |
|---|---|---|
| [ITC-BT-36 §1 y §2.2](https://normatia.com/es/normativa/rebt/2025/itc-bt-36-instalaciones-a-muy-baja-tension/) (REBT, texto en Normatia) | MBTS es hasta 50 V c.a. o 75 V c.c. Los conductores MBTS y los de cualquier otro circuito se separan con **una** de estas medidas: separación física; **vaina no metálica además del aislamiento principal**; pantalla metálica a tierra; o, en un mismo cable o grupo de conductores, **aislamiento de los conductores MBTS para la tensión más alta que deban soportar**. El texto que recibí no habla de compartir caja | Reglamento de **instalaciones**. **No es la norma de producto de la máquina**; sirve de referencia |
| [ITC-BT-19 §2.9, tabla 3](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-19.pdf)) | Aislamiento de una instalación MBTS/MBTP: ensayo a **250 V c.c.**, mínimo **0,25 MΩ**; hasta 500 V: 500 V c.c. y 0,5 MΩ | Instalaciones. Se mide con las cargas desconectadas |
| [Whitepaper de un laboratorio](https://uploads-ssl.webflow.com/5964a1de0dff681f24a9308b/5b69410c762831d5962091e1_Weekly%20Whitepaper%20%2369%20-%20Understanding%20Fixing%20of%20Wiring.pdf) (no cita ninguna norma ni cláusula) | El cableado de baja tensión debe ser apto para la tensión más alta con la que pueda entrar en contacto. La terminación de un cable cuenta como fallo único: si, al soltarse, el cable puede llegar a un circuito de red, necesita **aislamiento doble o reforzado**. Una brida junto a la terminación o un doble crimpado son sujeción secundaria. Un exceso de holgura que pueda unir red y SELV exige aislamiento doble o reforzado | Genérico (UL, CSA, EN, IEC); autor no identificado en lo que recibí. **No es una norma** |
| [Datos de cable](#3-especificaciones-de-referencia) | H03/H05 de PVC: 300/300 V. Anuncios de cable rojo/negro y HO3VH-H: 50 V | Fabricantes y vendedores |
| [Ficha de la LRS-50-5](../meanwell-lrs-50-5/README.md) | Aislamiento entrada-salida de 4 kVAC en la hoja de datos de 2025; el lado de 5 V está aislado **en la fuente** | La fuente, no el cableado |

### 7.2 Lo que no pude leer

- **EN 60335-1** (cláusulas de cableado interno, conexiones y aislamiento) e IEC 60335-2-82: de pago. La vista previa de IEC 60335-1 en VDE-Verlag está bloqueada por robots.txt para mi herramienta. **No puedo decir qué tensión de ensayo exige (1500 V, 2000 V) ni si basta el aislamiento básico del cable.** Las cifras de 1500/2000 V de mi planteamiento inicial **no las he visto**. La única tensión de ensayo que vi en un cable es la de fábrica del H05VV-F (2.000 V, [Letronic](https://www.letronic.de/en/produkte/datenblatt/353/h05vv-f-acc-to-vde-0285), citado en la ficha del cable Schuko), que no es este cable ni esta norma.
- **EN 62368-1, EN 60204-1 (cap. 14), IEC 60364-4-41:** no los he leído.
- **Los espesores de aislamiento y las tensiones de ensayo de EN 50525-2-11** (de pago).

### 7.3 Qué hay que mirar en el anuncio

1. **Tensión asignada.** Si dice 300/300 V o 300/500 V, el aislante de cada hilo está pensado para tensión de red monofásica (230 V), en el sentido de ITC-BT-36. Si dice 50 V, 12 V o nada, **no tienes base para meterlo junto a L, N o FG sin más medidas.**
2. **Vaina.** Un cable plano con vaina (H03VVH2-F) tiene dos capas (aislante y vaina) por hilo. Un cable paralelo sin vaina (HO3VH-H, zip cord, cable de altavoz) tiene una sola capa, que además se raspa con facilidad en un borde de chapa.
3. **Espesor del aislante.** Solo se puede estimar a ojo del diámetro exterior: con un hilo aislado de ~2,5 mm (suposición mía a partir del ancho de 5,6 mm del cable plano) y un conductor de 1,1 mm (Nexans NO), la pared sale de ~0,7 mm (cálculo mío). No pude leer el espesor mínimo normalizado.
4. **Norma o marca de laboratorio** (EN 50525-2-11, <HAR>, UL). Sin marca, el cable no se puede identificar.

### 7.4 Conclusiones mías

1. **Trata el cableado de 5 V como un SELV que puede tocar la red si algo falla**, aunque el cable sea bueno. Un hilo suelto de un cable rojo junto al borne L pone 230 V en el raíl de 5 V: la Pi, el Solo y la pantalla podrían recibir la tensión de red. Por eso: puntera en +V y −V; ningún hilo suelto; sujeción secundaria (brida) a 2-3 cm de la terminación; holgura mínima; los cables de 5 V **no comparten brida ni recorrido con L, N o FG**, y si se cruzan, que sea en ángulo recto.
2. **Cable.** Lo más sencillo: cable plano con vaina de 300/300 V documentado, o el cable de 5 V dentro de una funda de PVC o termorretráctil donde pase a menos de unos centímetros de los 230 V. Si tu cable de Amazon no declara 300 V y vaina, la funda es la solución más barata. Las distancias concretas **no las he podido fundamentar** en una norma que haya podido leer.
3. **Mide el aislamiento** con la máquina montada, sin red, con las cargas desconectadas y L y N unidos: entre el +V/−V unidos y el conjunto L/N/FG. La referencia es la tabla 3 de la ITC-BT-19 (250 V, 0,25 MΩ para MBTS). La hoja de la LRS da 100 MΩ a 500 V entre entrada, salida y FG ([ficha de la LRS](../meanwell-lrs-50-5/README.md)). Es una referencia de instalación, no un ensayo de producto.
4. **Tierra del raíl.** ITC-BT-36 §3 (misma fuente) pide que las partes activas MBTS no se conecten a tierra ni a partes activas de otros circuitos. La guía §5.2 no une el −V a ningún otro punto, y eso es coherente. La [ficha de la LRS](../meanwell-lrs-50-5/README.md) deja abierta la pregunta de unir −V a FG por inmunidad a descargas: si algún día se hace, el circuito pasaría a ser MBTP, que admite tierra funcional (ITC-BT-36 §1 y §4). Es una lectura mía del texto.
5. **Pregunta al electricista** que revise los 230 V (guía, cabecera) por el cableado de 5 V de la misma caja, y a un laboratorio o consultor de EN 60335-1 antes del marcado CE.

## 8. Llama, humos y normativa de producto

### 8.1 Llama y humos

- El H03VVH2-F de Nexans cumple IEC 60332-1 (F2) y C2 según NF C 32-070; **no es libre de halógenos** ([Nexans NO](https://www.nexans.no/en/products/Building-Wires-and-Cables/Standard-wires-and-cables/Standard-Installation-cables-and-wires/PL---PMH/H03VVH2-F--536929547.html), [Nexans FR](https://www.nexans.fr/en/products/Building/Residential/Flexibles-wires/H03VVH2-F-536932485/product~10026200~.html)).
- Electrokit declara clase CPR **Eca** para sus cables rojo/negro. Que Eca corresponda al ensayo de una llama vertical (EN 60332-1-2) es conocimiento mío, **sin fuente**.
- El cloro del PVC retarda la llama; al quemarse libera **cloruro de hidrógeno** (HCl), que es corrosivo y tóxico ([Wikipedia: PVC](https://en.wikipedia.org/wiki/Polyvinyl_chloride)). En una máquina cerrada sería un problema añadido a un incendio. No he buscado cables libres de halógenos (LSZH): no hay motivo para exigirlos aquí, pero existen (conclusión mía).
- **No hagas la prueba de la llama en casa.** No distingue cobre de CCA, y quemar PVC genera HCl. Si quieres comprobar si es un PVC autoextinguible, hazlo con 5 cm de cable, fuera, con ventilación y sin respirar los humos (consejo mío).

### 8.2 RoHS y REACH

- **RoHS 2:** el DEHP, BBP, DBP y DIBP están limitados al 0,1 % desde la Directiva (UE) 2015/863 y se aplican a los productos puestos en el mercado **desde el 22 de julio de 2019**, salvo exenciones ([Wikipedia: RoHS](https://en.wikipedia.org/wiki/Restriction_of_Hazardous_Substances_Directive)). **No pude contrastarlo con EUR-Lex** (mi herramienta recibió solo la cabecera). El PVC flexible lleva plastificantes ftalatos, que no están unidos al polímero y migran ([Wikipedia: PVC](https://en.wikipedia.org/wiki/Polyvinyl_chloride)).
- Un cable que forma parte de una máquina forma parte de un aparato eléctrico: la máquina completa necesitará la declaración RoHS (conclusión mía; **no he comprobado la categoría ni el ámbito de la máquina**). **La guía §9 lista la directiva de baja tensión, la de compatibilidad electromagnética y la de equipos radioeléctricos, pero no RoHS.** Es un hueco que conviene revisar.
- Un vendedor serio da la declaración: BKL marca su cable de CC como RoHS y libre de SVHC ([BKL](https://www.buerklin.com/en/p/82F478/)). Pídela al vendedor de Amazon.
- **REACH:** no he abierto ninguna fuente (ECHA). No cito sustancias candidatas ni límites.

### 8.3 CPR (reglamento de productos de construcción)

- El CPR y EN 50575 se aplican a los cables para instalación **permanente en edificios** (cables para el suministro de electricidad y comunicaciones en edificios, según [Nexans](https://www.nexans.co.uk/en/business/buildings/building/Fire-safety/Construction-Products-Regulation/FAQ-on-CPR.html)). Marcado CE obligatorio desde el 1-7-2017 (fin del periodo de coexistencia, misma fuente). Prysmian los describe como cables de potencia, control y comunicaciones en cualquier estructura ([Prysmian](https://tr.prysmian.com/sites/tr.prysmian.com/files/2025-01/Construction_Products_Regulations_and_Cable_Industry.pdf) ([copia local](datasheets/Construction_Products_Regulations_and_Cable_Industry.pdf))).
- **Ninguna de las dos fuentes nombra los cables flexibles ni los cables internos de aparatos.** Mi lectura: un cable dentro de la máquina **no es un producto de construcción** y no necesita clase CPR. Es lectura mía; **no he leído el reglamento ni EN 50575**.
- Aunque no sea obligatorio, hay vendedores que lo declaran (Electrokit: Eca). No es una garantía de nada para este uso.

### 8.4 Marcado CE y directiva de baja tensión

- El alcance de la directiva 2014/35/UE es de **50 a 1.000 V en c.a. y de 75 a 1.500 V en c.c.** Es conocimiento mío: EUR-Lex solo devolvió la cabecera, y la herramienta de lectura me dio las mismas cifras desde su memoria, no desde la página. Un cable de 5 V vendido suelto queda por debajo y, por eso, no suele llevar declaración de baja tensión ni marca <HAR>.
- La máquina sí está dentro de la directiva por sus 230 V; el cable de 5 V es una pieza de ella. La norma de producto probable es la serie EN 60335 (guía §9). No he leído nada de ella.
- **Reglamento general de seguridad de los productos (GPSR):** no lo he investigado. El anuncio de Amazon debería llevar los datos del fabricante, pero no lo he comprobado.

## 9. Fallos, bugs y problemas conocidos

| # | Problema | Gravedad para el proyecto |
|---|---|---|
| 1 | Cobre aluminizado (CCA) en lugar de cobre | Media-alta |
| 2 | Sección real menor que la anunciada (0,5-0,55 mm² en vez de 0,75) | Media |
| 3 | Aislamiento sin tensión asignada documentada o de 50 V, y sin vaina, junto a los 230 V | **Alta (seguridad)** |
| 4 | Hilo suelto, terminal mal crimpado o cable sin sujeción junto a los bornes L/FG | **Alta (seguridad)** |
| 5 | Cortocircuito en una rama: la fuente da 10,6-14,4 A y el cable está dimensionado a 6 A | Media, de diseño |
| 6 | Rollo doblado en cuatro, pliegues y PVC frío que se agrieta | Baja-media |
| 7 | Aislante pegado al conductor y muescas al pelar | Baja, sin fuente |
| 8 | Cobre oxidado, colores que se desvanecen, PVC que endurece | Baja, sin fuente |
| 9 | Longitud real menor de 10 m | Baja, sin fuente |
| 10 | Negro de GND confundible con una fase de la ITC-BT-19 | Baja |
| 11 | Humos de PVC, sin documentación de llama | Baja-media |

### 9.1 Cobre aluminizado (CCA)

Ver [apartado 5](#5-sección-y-cobre-real). Resumen: +46-54 % de resistencia (estimación mía), hilos que se rompen al flexionar (ACI), y a veces con menos cobre del que se supone (ACI 2018, techtest.org). Para la corriente de este proyecto (5 A de pico, ≤ 0,5 m de troncal) sigue funcionando eléctricamente; el problema es el margen de tensión y la rotura de hilos junto a los terminales ([6.4](#64-efecto-sobre-la-pi-umbral-de-463-v)). En los terminales, la capa de cobre es la que toca el borne ([Mello](https://www.mikeholt.com/files/PDF/64ae21784d8c117de3647122_Mello%20Whitepaper-Performance%20Differences%20Between%20CCA%20and%20Al.pdf)); Wikipedia afirma que no hay historial de recalentamiento de conexiones de CCA. Ambas fuentes hablan de cable de edificio, no de hilo de 0,2 mm.

### 9.2 Sección menor que la anunciada

Dos fichas de Electrokit para cable "2 × 0,75 mm² Cu rojo/negro" dan construcciones que suman 0,55 y 0,50 mm² por conductor (cálculo mío). **No sé si son erratas.** El ejemplo sirve para una regla: **cuenta los hilos** antes de fiarte de la etiqueta ([apartado 11](#11-qué-comprobar-al-recibirlo)). La ficha del cable Schuko recoge alertas de Safety Gate por cables "demasiado finos" en otros productos.

### 9.3 Aislamiento junto a los 230 V

Ver [apartado 7](#7-aislamiento-y-separación-de-los-230-v). Un cable de 50 V y sin vaina, atado junto a L y N, es la combinación peligrosa. El orden correcto de la regleta LRS-50-5 es L, N, FG, −V, +V; FG es adyacente a N y −V (corregido por Auditor 6.1-S).

### 9.4 Terminación y sujeción

Un fallo de terminación es un fallo único con consecuencias: un hilo que se suelta y toca L o FG pone tensión de red en el raíl de 5 V (whitepaper del [apartado 7.1](#71-lo-que-sí-he-podido-leer)). Se evita con punteras, sujeción secundaria y recorrido separado ([apartado 10](#10-montaje-terminales-polaridad-fijación-y-curvatura)).

### 9.5 Cortocircuito en una rama

- La LRS-50-5 limita entre 10,6 y 14,4 A (ver [ficha de la LRS](../meanwell-lrs-50-5/README.md)). El cable de 0,75 mm² está asignado a 6 A.
- Un cortocircuito en el cable de la pantalla o del Solo, o un hilo que toque la chapa, sigue limitado por la fuente. En modo *hiccup* la corriente media es menor, pero **no sé cuánto** ni cuánto tarda el PVC en llegar a 70 °C.
- **Con 0,75 mm² es difícil proteger el cable con un fusible:** el margen entre el pico (5 A) y el valor del cable (6 A) es de 1 A, demasiado estrecho para que el fusible no salte con el pico (conclusión mía). La [ficha de la pantalla](../pantalla-geeekpi-7-hdmi/README.md) ya sugiere un fusible o PTC en la rama de la pantalla. Es un asunto del diseño del raíl.

### 9.6 Rollo doblado, pliegues y PVC frío

- Tu planteamiento decía que el rollo sale de fábrica doblado en cuatro. **No tengo datos del embalaje de este anuncio.** Un pliegue brusco en un cable plano puede agrietar el PVC o abrir el puente entre los dos hilos (conclusión mía).
- Los fabricantes dan un mínimo de **−5 °C en movimiento** (Letronic) o **−15 °C de uso** (electrical4less). Es otoño: **no desenrolles ni flexiones el cable recién llegado de un transporte frío**; déjalo varias horas a temperatura ambiente (conclusión mía).

### 9.7 Aislante pegado, cobre oxidado, colores y endurecimiento

- **Sin fuente.** Los cables baratos a veces dejan el aislante pegado a los hilos finos y se pelan mal; los hilos de cobre sin estañar se oscurecen con la humedad. Es conocimiento general mío, no una cita.
- El PVC flexible lleva plastificantes que **migran** con el tiempo ([Wikipedia: PVC](https://en.wikipedia.org/wiki/Polyvinyl_chloride)), y esa pérdida puede volverlo más rígido (conclusión mía; la página no habla de envejecimiento). La temperatura máxima del PVC es de 70 °C según los fabricantes: mantén el cable alejado de la carcasa de la LRS ([apartado 10](#10-montaje-terminales-polaridad-fijación-y-curvatura)).
- El cobre estañado resiste mejor la humedad (conocimiento mío, sin fuente); tiene un máximo de resistencia un 2,7 % mayor (26,7 frente a 26,0 Ω/km, Lapp T11).

### 9.8 Negro como GND

La ITC-BT-19 §2.2.4 asigna **marrón, negro o gris a las fases**, azul claro al neutro y verde-amarillo a la protección ([ITC-BT-19](https://www.plcmadrid.es/wp-content/uploads/rebt/itc19/ITC-BT-19.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-19.pdf))). En tu montaje, los 230 V usan marrón, azul y verde-amarillo (guía §5.1), así que no hay confusión hoy; un electricista que abra la caja podría tomar el negro de 5 V por una fase. **Etiqueta** el raíl de 5 V.

## 10. Montaje: terminales, polaridad, fijación y curvatura

### 10.1 Terminales

| Dónde | Terminal | Datos | Fuente |
|---|---|---|---|
| Bornes +V y −V de la LRS-50-5 | Puntera de 0,75 mm² | Phoenix AI 0,75-8 GY: gris, zona de contacto de 8 mm, manguito de 14 mm. **La página no da la longitud de pelado**; usa la de contacto de la puntera que compres y mídela | [Phoenix Contact](https://www.phoenixcontact.com/en-sa/products/ferrule-ai-075-8-gy-3200519) |
| WAGO 221-415 | Cable pelado | Hilo flexible de 0,14 a 4 mm² (AWG 24-12), **pelado de 11 mm**. 32 A, 450 V, T85. La página no dice si admite punteras | [rlocman (WAGO)](https://www.rlocman.es/datasheet/data.html?di=537187) |
| Bornes USB-A de tornillo (#18) | Puntera si el borne la admite | Ver su ficha; no la he comprobado | — |
| Clavija JST-XH del sensor | **No aplica** | Contactos XH hasta AWG 22 (0,33 mm²); no entra un 0,75 mm² | [Ficha de los JST-XH](../cables-jst-xh-4-pin/README.md) |

- **El color de la puntera no es fiable.** Phoenix usa gris para 0,75 mm². Un vendedor de Electrokit lista una "ändhylsa 0,75 mm vit" (blanco), según el nombre de la dirección (no abrí la página). Lee el marcado de sección impreso.
- La crimpadora y las punteras (#28) tienen su ficha aparte; no la repito. No sé si el borne de la LRS admite una puntera de 0,75 mm² con collarín: la ficha de la LRS lo deja como **sin verificar**.
- **No estañes con soldador los extremos que van a un borne de tornillo** (criterio general mío, sin fuente). Para la WAGO, el cable flexible va pelado.
- Pelar: usa un pelacables automático para AWG 18 y comprueba al pelar que **no hay hilos cortados** (una muesca resta sección).

### 10.2 Identificación de polos

- **Rojo = +5 V, negro = GND**, en todo el montaje. Es la convención habitual de continua; el cable USB tiene rojo y negro para VBUS y GND (conocimiento mío, sin fuente).
- **Antes de conectar ninguna carga**, con la LRS encendida y sin cargas, mide con el polímetro rojo (+) y negro (−) en cada borne USB-A, en cada polo de la WAGO y en el extremo del latiguillo de la Pi. La tensión es de 5 V, pero la caja contiene 230 V: sigue las precauciones de la guía. Una polaridad invertida en un borne de tornillo se paga con la Pi, el Solo o la pantalla.
- Comprueba también **la continuidad de cada color de extremo a extremo**: en un par paralelo cada conductor es independiente y un color mal puesto en fábrica no es imposible (conclusión mía).

### 10.3 Fijación

- Sujeta con bridas **sin apretar** (que el cable gire dentro) o con abrazaderas de tornillo o adhesivas; la brida apretada sobre un par plano sin vaina puede aplastar el aislante (conclusión mía).
- Una brida de sujeción secundaria **a 2-3 cm de cada terminación** (whitepaper del apartado 7.1).
- **Lejos de lo caliente.** El PVC llega a 70 °C como mucho (fabricantes). El manual de Mean Well pide 10-15 cm de separación si el equipo vecino es una fuente de calor ([ficha de la LRS](../meanwell-lrs-50-5/README.md)). No encontré una temperatura de carcasa de la LRS-50-5 que pueda citar: no apoyes el cable sobre la chapa perforada de la fuente y **mide la temperatura** en la prueba final.
- **Separado de los 230 V**: recorrido propio, sin bridas compartidas con L, N o FG ([apartado 7.4](#74-conclusiones-mías)).
- Pasacables de goma (#31) en todos los agujeros de chapa por donde pase el cable (guía).

### 10.4 Radio de curvatura

Cálculo mío con las reglas de los fabricantes (Letronic: 3 × Ø fijo y 5 × Ø en movimiento; electrical4less: 6 × el diámetro; Nexans FR: 11,7 mm estático) aplicadas a un cable plano de ~4,0 × 5,6 mm:

| Curvatura | Fijo (3 × Ø) | En movimiento (5 × Ø) |
|---|---|---|
| Doblando la cara plana (espesor 4,0 mm) | 12 mm | 20 mm |
| Doblando de canto (5,6 mm) | 17 mm | 28 mm |

- Los fabricantes no aclaran a qué lado del cable plano se refiere Ø. Para un cable más fino (p. ej. el de Kabelscheune, 2,4 × 5,2 mm), las cifras serían proporcionalmente menores. Es una interpretación mía.
- Evita curvar de canto un par paralelo: tiende a abrir el puente.
- Separa el puente solo lo necesario para llegar a cada borne.

## 11. Qué comprobar al recibirlo

Todo esto es **conclusión mía**, salvo lo que cito. Sin red de 230 V.

**A. A simple vista**

1. **Marcado impreso.** Fabricante, tensión (300/300 V), temperatura, norma o <HAR>. Si no hay nada, apúntalo: es un cable sin documentación.
2. **Doblez del rollo.** Desenróllalo a temperatura ambiente y pasa los dedos por cada pliegue: aplastamientos, grietas, puente abierto, cobre a la vista.
3. **Longitud.** Mide con cinta los 10 m. Apúntala: sirve para la prueba eléctrica.

**B. Medidas mecánicas (con calibre)**

4. **Dimensiones exteriores.** Compáralas con la ficha o el anuncio.
5. **Corta una muestra de 10 cm y pélala.** Cuenta los hilos y mide uno con un micrómetro o un calibre. Calcula n × π × d² / 4 por conductor (24 × 0,20 mm = 0,754 mm²). **Si da menos de 0,7 mm², no es un 0,75 mm².**
6. **Color de los hilos.** Raspa un hilo con una cuchilla: el cobre es rojizo por dentro; el aluminio, plateado. Dobla varios hilos de ida y vuelta 90°: el CCA se rompe antes que el cobre, y la fractura deja ver el núcleo plateado. **Compara con un hilo de cobre que sepas bueno**; el color de un extremo pelado puede engañar (un lector de techtest.org dice que los extremos de CCA parecen de cobre).
7. **Peso.** Pesa los 10 m en una báscula de cocina. La diferencia esperada entre cobre y CCA es de ~90 g (cálculo mío) sobre un cable que pesa unos 320-400 g (32-40 kg/km, para el cable plano con vaina; el sin vaina pesa menos). **Prueba débil**: la masa del PVC varía de un fabricante a otro, y el peso se puede falsear con lastre (Fluke Networks, para cable de red).
8. **El imán no sirve** para distinguir CCA: ni el cobre ni el aluminio son magnéticos. Solo detectaría hilos de cobre sobre acero (conocimiento mío, sin fuente). **Tampoco la llama** ([8.1](#81-llama-y-humos)).

**C. Medida eléctrica (la prueba clave)**

9. **Método (cuatro hilos).** Une los dos conductores en un extremo (retuércelos y atorníllalos). En el otro extremo, conecta una fuente de laboratorio en limitación de corriente a **2 A** y mide con un polímetro en voltios la tensión **directamente entre los dos conductores del cable**, con pinzas aparte de las de la fuente. Divide por la corriente medida. Mide la temperatura ambiente.
10. **Resultado esperado (20 °C):** ver la [tabla del apartado 5.4](#54-qué-resistencia-debe-dar-el-rollo-de-10-m). Cobre bueno: 0,92-1,04 V a 2 A; hasta 1,1 V es compatible. Entre 1,1 y 1,2 V es dudoso: repite con la longitud y la temperatura reales. De 1,2 a 1,5 V es CCA o cobre fino. Por encima de 1,5 V, peor aún. Corrige por temperatura (+0,4 % por kelvin sobre 20 °C, factor mío) y por la longitud real.
11. **Por qué 10 m:** con 20 m de conductor, la tensión a 2 A es de ~1 V, unas cinco veces la de un cordón de 2 m (ver la [ficha del cable Schuko](../cable-schuko-c13-2m/README.md)), y se mide con un polímetro normal.

**D. Aislamiento**

12. **Entre los dos conductores**, con el rollo suelto y seco, mide con un medidor de aislamiento. **No pases de la tensión que soporte el cable**: si el anuncio dice 50 V, no apliques 250 V. Para un cable de 300/300 V, 250 V c.c. es el ensayo de la tabla 3 de la ITC-BT-19 para circuitos MBTS (0,25 MΩ como mínimo; para el cable suelto debería salir muy por encima). Es una referencia de instalación, no un ensayo de producto.

**E. Ya montado**

13. Polaridad y tensión en cada carga con la máquina en su pico ([6.4](#64-efecto-sobre-la-pi-umbral-de-463-v), [10.2](#102-identificación-de-polos)).
14. Inspección de la separación respecto a los 230 V ([7.4](#74-conclusiones-mías)).

## 12. Alternativas

Solo hay motivo si el cable de Amazon no se puede documentar. Datos de las fichas que abrí, no de una compra:

| Opción | Datos | Observación |
|---|---|---|
| **Cable plano H03VVH2-F 2 × 0,75** | 300/300 V, EN 50525-2-11, cobre clase 5, vaina, núcleos marrón y azul ([Nexans](https://www.nexans.no/en/products/Building-Wires-and-Cables/Standard-wires-and-cables/Standard-Installation-cables-and-wires/PL---PMH/H03VVH2-F--536929547.html), [Letronic](https://letronic.de/en/produkte/kabel/pdf/679/h03vvh2-f.pdf)) | La única opción con norma y ficha. No es rojo/negro: etiqueta el +5 V y el GND. No he comprobado precios ni disponibilidad. **Sin verificar** que se venda en Amazon.es |
| **Electrokit 2 × 0,75 Cu rojo/negro** | Cobre OFC, 50 V, 70 °C, Eca, 99 SEK por 10 m ([Electrokit](https://www.electrokit.com/en/kabel-2x0.75mmcu-rod/svart-10m)) | Construcción que suma 0,55 mm² (cálculo mío); 50 V; agotado hasta el 30-10-2026. **No lo recomiendo sin medirlo** |
| **Cable unipolar flexible de 0,75 mm² (H05V-K / H07V-K) en rojo y negro** | — | Existe y su tensión asignada es mayor que la de un cable de altavoz (conocimiento mío); **no abrí ninguna ficha**. Tendrías que usar dos cables sueltos |
| **Troncal de 1,0 mm²** | Máximo de IEC 60228: 19,5 Ω/km frente a 26,0 (Lapp T11): 25 % menos de caída | Solo si el troncal ha de ser largo; con 0,5 m no hace falta. Comprueba que cabe en el borne |
| **Troncal de 1,5 mm²** | 13,3 Ω/km (Lapp T11); un cordón de 1,5 mm² se asigna a 16 A (International Configurations, ver la [ficha del cable Schuko](../cable-schuko-c13-2m/README.md)), frente a 10,6-14,4 A de la LRS | Idea mía: con el troncal por encima de la corriente de la fuente, solo las ramas necesitarían protección propia. **Sin verificar**; es diseño del raíl. Comprueba que 1,5 mm² cabe en el borne de la LRS |

## 13. Recomendaciones para el alcoholímetro

Son conclusiones mías, no afirmaciones de las fuentes.

1. **No fíes la compra del anuncio.** Pide al vendedor, por escrito: material del conductor (cobre, no CCA), construcción de hilos (n × Ø), tensión asignada (≥ 300 V), temperatura, norma o marca y declaración RoHS. Si no responde, trátalo como un cable **no documentado** y mide tú.
2. **Haz la prueba de 2 A en los 10 m** y cuenta y mide los hilos dentro del plazo de devolución. Criterio: ≤ 0,55 Ω a 20 °C (≤ 1,1 V a 2 A) y ≥ 0,70 mm² por conductor. Si no, devuélvelo.
3. **Aislamiento junto a los 230 V.** Si el cable no declara 300/300 V y no tiene vaina, métele funda en los tramos cercanos a los bornes de red o cámbialo por un cable con vaina. Con cualquiera de los dos: punteras, sujeción secundaria y recorrido propio ([apartado 7.4](#74-conclusiones-mías)).
4. **Troncal de 0,5 m o menos** y medida en la Pi con la máquina en su pico ([6.4](#64-efecto-sobre-la-pi-umbral-de-463-v)). Si el troncal ha de ser más largo o el cable resulta de CCA, pasa a 1,0 mm² de cobre.
5. **Decide la protección del raíl con la ficha de la LRS y la de la pantalla**: un fusible o PTC por rama, o un troncal más grueso ([9.5](#95-cortocircuito-en-una-rama)). No es de esta pieza, pero depende de ella.
6. **No uses este cable para la clavija del sensor** (22 AWG, guía §5.2); no cabe en los contactos JST-XH.
7. **Etiqueta el raíl de 5 V** (rojo +5 V, negro GND) y no uses el negro de 230 V.
8. **Añade RoHS a la lista de directivas** de la guía §9, y pide la declaración del cable.
9. **Mide la temperatura de la caja de arriba** con la máquina cerrada: el PVC es de 70 °C como mucho y el pico de la LRS se suma al del Solo y de la Pi.
10. **Guarda la foto de la bobina y del marcado, la factura y el lote**, y deja un metro de repuesto de la misma bobina para repetir medidas si hay un fallo.

## 14. Lo que no he podido verificar

- **El anuncio de Amazon (B0D12QPF4Y):** no lo abrí; la búsqueda por el ASIN no devolvió nada. No sé el metal, la construcción de hilos, la tensión, el aislante, la norma, el embalaje ni la longitud real.
- **El texto de las normas** (de pago): IEC 60228, EN 50525-1, EN 50525-2-11, EN 60335-1 (cableado interno y aislamiento), IEC 60335-2-82, EN 62368-1, EN 60204-1, IEC 60364-5-52, UNE 20460-5-523, DIN VDE 0298-4, IEC 60799. **Las cifras de 1500/2000 V de aislamiento no las he visto.**
- **Qué norma cubre el H03VH-H** (no está en el sumario de EN 50525-2-12) y si su tensión asignada es de 300/300 V o de 50 V: el único dato es el anuncio de toom.
- **UL 2468 y UL 1007:** no abrí ninguna fuente de UL.
- **ITC-BT-19, tabla 1 (intensidades):** la extracción no devolvió los valores; no sé si incluye 0,75 mm².
- **Tabla 11 de VDE 0298-4:** solo tengo un resumen de Bayka con cuatro columnas sin asignar. **Tabla de EN 60204-1:** solo la web de Kollmorgen, que no cita el número de tabla.
- **Pruebas de Which?, Test-Achats, OCU y Stiftung Warentest** sobre cable 2 × 0,75: no las encontré (una búsqueda en alemán). No hay ninguna prueba independiente de un cable de este anuncio.
- **Si el cable de Amazon es CCA, está subdimensionado o es bueno:** no hay forma de saberlo sin medirlo.
- **Alcance y fechas de RoHS 2015/863, texto de la directiva de baja tensión (50-1.000 V, 75-1.500 V), REACH y GPSR:** mi herramienta recibió solo la cabecera de EUR-Lex; el resto es de Wikipedia o de mi conocimiento. Marcado donde aparece.
- **Si el CPR se aplica a cables internos de máquinas:** ninguna fuente lo dice expresamente; es lectura mía.
- **Que Eca equivalga al ensayo de una llama vertical.**
- **Coeficiente de temperatura (0,00393 /K), densidades y la conductividad del aluminio de 35,5 MS/m:** valores míos, de memoria. La de 37,7 MS/m viene de techtest.org.
- **El ciclo de trabajo del modo *hiccup* de la LRS** y cuánto tarda un 0,75 mm² en calentarse con 10,6-14,4 A.
- **La subida de 7 K a 5 A:** escalado mío desde 12 A = 40 K, no es una medida.
- **Longitud de pelado de la puntera de 0,75 mm² y sección máxima del borne de la LRS.**
- **Bornes USB-A (#18) y regleta WAGO (#20):** no he visto sus fichas; los datos de la WAGO son de una copia de distribuidor y no dicen nada sobre punteras.
- **Páginas bloqueadas o fallidas:** Faber Kabel (acceso denegado a mi herramienta, no insistí), plcmadrid.es ITC-BT-36 (permiso sin respuesta, usé Normatia), de.wikipedia.org (permiso sin respuesta), vista previa de IEC 60335-1 en VDE-Verlag (robots.txt). Ver [`enlaces.md`](enlaces.md).
- **Ninguna compra ni medida física:** todas las comprobaciones del apartado 11 son recomendaciones mías, no hechas.

## 15. Fuentes

Copias locales de los documentos descargados: [lista en enlaces.md](enlaces.md#copias-locales-de-los-documentos) y carpeta [`datasheets/`](datasheets/).

Todos los enlaces, ordenados por tipo, en [`enlaces.md`](enlaces.md).
