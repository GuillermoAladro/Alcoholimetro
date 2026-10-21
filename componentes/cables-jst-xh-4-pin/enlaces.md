# Enlaces guardados: cables JST-XH de 4 pines

Todas las páginas consultadas para la [ficha](README.md), reunidas el 21-10-2026. Las que no pude abrir o abrí solo en parte llevan nota.

## JST: serie XH (paso 2,5 mm)

- [Página de la serie XH en jst-mfg.com](https://www.jst-mfg.com/product/detail_e.php?series=277) (características, especificaciones, enlaces a documentos y planos)
- [Página de la serie XH en jst-mfg.com, índice de documentos y planos](https://www.jst-mfg.com/product/index.php?series=277)
- [Página de la serie XH en jst.co.uk](https://jst.co.uk/productSeries.php?pid=136) (características, normas UL/CSA/TÜV, enlaces)
- [Catálogo XH en inglés (PDF)](https://www.jst-mfg.com/product/pdf/eng/eXH.pdf)
- Copia en el servidor de JST Reino Unido (PDF, 7-4-2021): `https://jst.co.uk/downloads/series/eXH_(21-04-07).pdf` (con los paréntesis codificados: [enlace](https://jst.co.uk/downloads/series/eXH_%2821-04-07%29.pdf))
- Copia del mismo catálogo alojada por el MIT, sin fecha: [pcb.mit.edu](https://pcb.mit.edu/labs/lab_01_KiCAD/eXH.pdf)
- [Catálogo XH en japonés (PDF)](https://www.jst-mfg.com/product/pdf/jpn/XH.pdf?6ad80f29a5547) (**no lo abrí**)
- Planos 2D de ejemplo: [XHP-1](https://www.jst-mfg.com/product/index.php?type=10&series=277&doc=4&filename=XHP-1.pdf) · [B2B-XH-A](https://www.jst-mfg.com/product/index.php?type=10&series=277&doc=4&filename=B2B-XH-A.pdf) (no los abrí; la tabla de la página de la serie ofrece los de cada referencia)
- Manuales de manejo (crimpado e inserción): `https://www.jst-mfg.com/product/index.php?type=10&series=277&doc=11&filename=CHM-1-2321.pdf|CHM-1-2342.pdf|CHM-1-151.pdf` (**no pude abrirlo**: con el primer nombre solo devolvió la portada de JST)
- [Lista de normas registradas en el extranjero](https://www.jst-mfg.com/product/pdf/list_of_registered_overseas_standards.pdf) (**no la abrí**)
- [DigiKey, ficha de la serie XH](https://www.digikey.be/en/resources/datasheets/jst/xh-connector) (solo una página de aterrizaje, sin PDF) y [DigiKey, resumen de producto](https://www.digikey.ch/en/product-highlight/j/jst/xh-series-connectors) (no da especificaciones)
- [Wiki de Adom: JST XH 4 pines](https://wiki.adom.inc/api/v1/pages/jst-xh-4pin/files/README.md) (terceros: dice paso 2,50 mm y 3 A; no cita la fuente)

## Winsen ZE29A (manual y páginas de producto)

- [Manual V1.1, ze29a-c2h5oh.pdf](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf) ([copia local](../winsen-ze29a/datasheets/ze29a-c2h5oh.pdf)) (leído con una herramienta que extrae el texto; no vi las imágenes)
- [Mismo manual V1.1 con otro nombre de archivo](https://www.winsen-sensor.com/d/files/ze29a-alcohol-module-manualv1_0.pdf)
- [Copia del manual en robu.in](https://robu.in/wp-content/uploads/2023/02/ZE29A-DATASHEET.pdf)
- [Copia en HTML en manuals.plus](https://manuals.plus/winsen/ze29a-c2h5oh-alcohol-sensor-module-manual)
- [Página de producto de Winsen](https://www.winsen-sensor.com/product/ze29a-c2h5oh.html) y [la misma en otra ruta](https://winsen-sensor.com/sensors/alcohol-sensor/ze29a-c2h5oh.html) (sin conector ni paso)
- [Tienda de Winsen](https://shop.winsen-sensor.com/products/ze29a-c2h5oh-electrochemical-alcohol-module) (sin conector ni accesorios; módulo suelto)
- [Winsentech, ZE29A](https://www.winsentech.com/Electrochemical_Alcohol_Sensor_ZE29A.html) (sin conector)
- [DirectIndustry, ZE29A](https://www.directindustry.com/prod/zhengzhou-winsen-electronics-technology-co-ltd/product-244812-2710964.html) (sin datos de conector)
- [Foro de Arduino sobre el ZE29A](https://forum.arduino.cc/t/alkoholtestsensor-ze29a-c2h5oh-mit-arduino-verbinden-und-daten-lesen/1344484) (enero de 2025; nadie describe el conector)

## Raspberry Pi 3B+ (pines de la UART)

- [Esquema reducido RP-008339-DS-1](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf), con [copia local](../raspberry-pi-3b-plus/datasheets/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf): hoja "GPIO EXPANSION", conector J8 de 40 pines, pin 8 = GPIO14 (TXD0), pin 10 = GPIO15 (RXD0)
- [Documentación de hardware de Raspberry Pi](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html): confirma cabecera con paso de 2,54 mm y GPIO de 3,3 V; no da la numeración física en texto

## Crimpado, tracción y cable

- [Molex, Quality Crimping Handbook (rev. C, 2009)](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/2931/Quality%20Crimp%20Handbook.pdf) ([copia local](../terminales-ojal-m4/datasheets/Quality_Crimp_Handbook.pdf)): criterios de inspección visual, pruebas de tracción y altura de crimpado
- [Cirris: fuerza mínima de arranque por calibre](https://cirris.com/crimp-pull-testers-pullout-force-per-wire-size/) (UL 486A, DIN 41611/3, NASA-STD 8739.4, SAE AS7928; valores en libras)
- [Wikipedia: American wire gauge](https://en.wikipedia.org/wiki/American_wire_gauge) (diámetros y resistencias)
- [Wikipedia: cable de aluminio revestido de cobre](https://en.wikipedia.org/wiki/Copper-clad_aluminium_wire) (no da cifras de resistencia ni habla de oxidación)
- [Fluke Networks: CCA, cómo identificarlo](https://de.flukenetworks.com/blog/cabling-chronicles/cca-not-worth-savings-or-risk)
- [Belden: CCA, receta del fallo](https://cn.belden.com/blog/not-in-my-network-copper-clad-aluminum-recipe-for-failure)
- [WAGO 221-415, hoja de datos en radiolocman](https://www.radiolocman.com/datasheet/data.html?di=537187) (copia de distribuidor; no abrí la de WAGO)

## Clones, calidad y fallos (foros y terceros)

- [Foro de KiCad: JST-XH, 2,5 frente a 2,54 mm y calidad de las copias](https://forum.kicad.info/t/jst-xh-3a-connectors/50145) (abril de 2024)
- [Foro de Duet3D: cambiar conectores por XH](https://forum.duet3d.com/post/94362?page=2)
- [Foro de Digi-Key: "JST connector XH2.54"](https://forum.digikey.com/t/jst-connector-xh2-54/8243) (agosto de 2020; solo leí el mensaje principal)
- [Foro V1E: clavijas que se sueltan](https://forum.v1e.com/t/having-trouble-keeping-the-end-stops-plugged-in/42105) (25-1-2024)
- [Team FDM: conectores de impresora 3D, Molex, JST y crimpado](https://www.teamfdm.com/blogs/entry/10-3d-printer-connectors-molex-jst-crimping/)
- [mikrocontroller.net: "Woher vernünftige Dupont-Wires beziehen?"](https://www.mikrocontroller.net/topic/516562) (abril de 2021, en alemán)
- [EEVblog: voltage drop at breadboard](https://eevblog.com/forum/beginners/voltage-drop-at-breadboard) (marzo de 2019)
- [Tayda: cable XH-2.54 de 4 pines, 26 AWG, 30 cm](https://www.taydaelectronics.com/4-pins-jst-xh-2-54-female-connector-with-wire-cable-26awg-30-cm.html) (ejemplo de anuncio de tienda, "JST XH-2.54" con fabricante N/A)
- [Walmart: 10 juegos "For Jst Xh2.54mm" 24 AWG 4P](https://www.walmart.com/ip/13073011408) (ejemplo de anuncio genérico; sin precio ni reseñas)

## Adhesivos para fijar los hilos

- [Intertronics: ¿son corrosivas las siliconas RTV?](https://intertronics.co.uk/2018/08/adhere-academy-are-rtv-silicone-sealants-corrosive/)
- [Chemical Concepts: silicona acética frente a neutra](https://www.chemical-concepts.com/whats-the-difference-acetoxy-vs-neutral-cure-silicones/) (solo leí los primeros 100.000 caracteres)

## Compra

- Anuncio de Amazon.es, ASIN B0CBWZNP6Z: **no abierto** (Amazon bloquea el acceso a mis herramientas; los datos son los de la hoja del usuario y la guía de montaje). Una búsqueda por el ASIN no devolvió nada útil.
- Anuncio del ZE29A, ASIN B0H8NVXVG5: **no abierto**.

## Guía de montaje del proyecto

- `claude/guia-montaje-electrico.md` (v2, 20-10-2026), §1 filas 6 y 7, §2.4, §3, §4, §5.2 y §5.3. La leí en la copia local que me pasó el coordinador.

## Otro enlace citado en la ficha

- [JST: manuales de manejo de la serie XH (CHM-1-2321, CHM-1-2342 y CHM-1-151)](https://www.jst-mfg.com/product/index.php?type=10&series=277&doc=11&filename=CHM-1-2321.pdf%7CCHM-1-2342.pdf%7CCHM-1-151.pdf): crimpado e inserción.

## Copias locales de los documentos

Documentos descargados el 21-10-2026 y guardados en el repositorio. Si un documento tiene enlace original en esta ficha, aparece junto a él como "copia local".

**Citados en esta ficha y guardados en otra carpeta:**

- [Quality_Crimp_Handbook.pdf](../terminales-ojal-m4/datasheets/Quality_Crimp_Handbook.pdf): Quality Crimp Handbook / QUALITY CRIMPING / HANDBOOK
- [ze29a-c2h5oh.pdf](../winsen-ze29a/datasheets/ze29a-c2h5oh.pdf): Winsen ZE29A-C2H5OH: manual del módulo de sensor de alcohol, V1.1
