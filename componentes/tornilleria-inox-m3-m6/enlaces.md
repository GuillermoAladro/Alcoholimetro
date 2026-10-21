# Enlaces guardados: surtido de tornillos, tuercas y arandelas de acero inoxidable M3 a M6

Todas las páginas consultadas para la [ficha](README.md), reunidas el 21-10-2026. "Abierto" quiere decir que mi herramienta devolvió el contenido (resumido, sin descargar el archivo).

## Anuncio y proyecto

- Amazon.es, ASIN B0BGRY2JGX (`https://www.amazon.es/dp/B0BGRY2JGX`): **no abierto**. La herramienta devolvió `ROBOTS_DISALLOWED`. No lo reintenté ni lo rodeé.
- Una búsqueda del ASIN (con las palabras "acero inoxidable tornillos tuercas arandelas M3 M4 M5 M6 surtido") no devolvió ninguna página con ese ASIN: solo kits parecidos de otras tiendas (Bodega Aurrera, Mercado Libre, ManoMano, eBay, RS).
- Guía de montaje eléctrico del proyecto (v2, 20-10-2026), `claude/guia-montaje-electrico.md` del proyecto del usuario: §1 fila 26, §2.6, §3, §4, §5.1 y §6. Leída en una copia local; no tiene URL.
- Otras fichas del repositorio usadas: [fuente LRS-50-5](../meanwell-lrs-50-5/README.md), [módulo C14](../modulo-c14-fusible-interruptor/README.md), [pantalla](../pantalla-geeekpi-7-hdmi/README.md) y [cable USB-A a USB-C](../cable-usb-a-usb-c-90-30cm/README.md) (plantilla).

## Normas ISO (solo páginas de catálogo; las normas son de pago)

- [ISO 3506-1:2020, pernos, tornillos y espárragos (iso.org)](https://www.iso.org/standard/70045.html). Abierto: edición 3, 2020-04, 37 págs., reconfirmada en 2025; dice que no especifica pares de apriete.
- [ISO 3506-2:2020, tuercas (iso.org)](https://www.iso.org/standard/70046.html). Abierto: edición 3, 27 págs.; no especifica propiedades de par de resistencia al giro (*prevailing torque*). Un primer intento de abrirlo, antes de que apareciera en una búsqueda, fue rechazado por la herramienta (`PROVENANCE_REQUIRED`) y no lo reintenté; después se abrió normalmente.
- [ISO 3506-3:2025, tornillos sin cabeza (iso.org)](https://www.iso.org/standard/84037.html?browse=tc). Abierto: edición 3, publicada el 2025-01-10, 12 págs., clases de dureza.
- [ISO 3506-3:2009 (iso.org, versión en español)](https://www.iso.org/es/contents/data/standard/04/62/46231.html). Abierto: retirada el 2025-01-10.
- [ANSI Webstore, ISO 3506-3:2009](https://webstore.ansi.org/standards/iso/iso35062009-1344417). Abierto: ficha de catálogo; la vista previa no se pudo leer.
- [CCN-SCC (Canadá), ISO 3506-4:2009, tornillos autorroscantes](https://ccn-scc.ca/standardsdb/standards/8145794). Abierto: ST2,2 a ST8, estado "cancelada". No lo he contrastado en iso.org.
- Vistas en una búsqueda y **no abiertas:** [genorma, EN ISO 3506-2:2020](https://genorma.com/en/standards/en-iso-3506-2-2020/amp), [EVS, EN ISO 3506-3:2010](https://www.evs.ee/en/evs-en-iso-3506-3-2010), [AFNOR, NF EN ISO 3506-3](https://www.boutique.afnor.org/en-gb/standard/nf-en-iso-35063/fasteners-mechanical-properties-of-corrosion-resistant-stainless-steel-fast/fa207994/440938).
- ISO 4762, 7380-1, 4017, 4032, 7089, 7090, 10511, 7040; DIN 912, 933, 934, 125, 127, 6798, 985, 982; MIL-STD-889: **no abiertas ni localizadas**. En la ficha están marcadas.

## Propiedades mecánicas y pares de apriete

- [Fastenal, "Mechanical Properties Metric Fasteners" (enero de 2016, PDF)](https://www.fastenal.com/content/feds/pdf/2016/01/Mechanical%20Properties%20Metric%20Fasteners%20Jan%202016.pdf) ([copia local](datasheets/Mechanical_Properties_Metric_Fasteners_Jan_2016.pdf)). Abierto: clases 50/70/80 de la serie austenítica (A1, A2, A4): 500/210, 700/450, 800/600 MPa. Sin pares, dureza ni alargamiento.
- [Fastenal, "Torque-Tension Relationship for Metric Stainless Steel Fasteners A2 and A4 70" (febrero de 2016, PDF)](https://crafter.fastenal.com/static-assets/pdfs/technical-resources/Torque-Tension-Relationship-for-Metric-Stainless-Steel-Fasteners-A2-and-A4-70-Feb-2016.pdf) ([copia local](datasheets/Torque-Tension-Relationship-for-Metric-Stainless-Steel-Fasteners-A2-and-A4-70-Feb-2016.pdf)). Abierto: M3 a M6 con fuerzas de rotura y de límite elástico, pares lubricado (K = 0,16) y en seco (K = 0,35) y avisos de grippado.
- [Berger, "Property Classes Screws Nuts" (PDF)](https://assets.berger-tools.co.uk/pdfs/Property_Classes_Screws_Nuts.pdf) ([copia local](datasheets/Property_Classes_Screws_Nuts.pdf)). Abierto: clases 50/70/80 de tornillos y tuercas (DIN ISO 3506-1 y -2), pareado de clases.
- [Optimas, pre-carga y pares de inox](https://optimas.com/technical-resources/stainless-steel-fasteners-pre-load-and-tightening-torques/). Abierto: A2-70 y A4-80 con μ = 0,1, 0,2 y 0,3; "para orientación", sin supuestos.
- [TR Fastenings, pre-carga y pares de inox (rosca métrica gruesa)](https://trfastenings.com/knowledge-base/metric-screws/stainless-steel-pre-load-and-tightening-torques). Abierto: la misma tabla y, además, el par de rotura mínimo (M3 A2-70: 1,6 N·m). Una cifra de A1-50 (M4, μ = 0,2) parece errata.
- [Optimas, pares de tornillos con hueco hexagonal (DIN 7991, ISO 7380...)](https://international.optimas.com/technical-resources/socket-screws-tightening-torques). Abierto: no trae el DIN 912/ISO 4762; trae DIN 6912, 7894, 7991 e ISO 7380. Cabeceras desordenadas.
- Vistas en una búsqueda y **no abiertas:** [accu-components, pares recomendados de inox](https://www.accu.co.uk/p/387-stainless-steel-fasteners-recommended-tightening-torques), [Anzor, pares métricos](https://anzor.co.nz/technical/stainless-steel-technical-info/tightening-torques/metric-tightening-torques), [norelem, pares de apriete (PDF)](https://www.norelem.fr/doc/fr/en/did.219929/07280-04-Tightening-torques_EN.pdf), [tubingchina](https://tubingchina.com/Tightening-Torques-for-Stainless-Steel-Bolts.htm), [NBK, propiedades (PDF)](https://alb02.internal.nbk1560.com/images/en/product/technical_data/teiketubuhin_seishitsu_NBK/teiketubuhin_seishitsu_NBK_1.pdf), [Pfeiffer Vacuum](https://www.pfeiffer-vacuum.com/global/de/knowledge/vacuum-technology/mechanical-components-in-vacuum/connections).
- Würth, Bossard (tablas de pares) y Reyher: **no localizados**.

## Grippado (galling)

- [TWI, qué es el galling](https://www.twi-global.com/technical-knowledge/faqs/what-is-galling). Abierto: definición, materiales sensibles, tres métodos de prevención.
- [Fastenal Blueprint, thread galling](https://blueprint.fastenal.com/thread-galling.html). Abierto.
- [Bolt Depot, galling](https://boltdepot.com/galling). Abierto.
- [SASSDA (asociación sudafricana de inox), galling](https://sassda.co.za/?p=61322). Abierto: lubricantes, 50 Brinell de diferencia, ASTM G98. Las tablas son imágenes.
- [Anzor, qué es el galling del inox](https://anzor.co.nz/blog/what-is-stainless-galling). Abierto.
- [Wikipedia, Galling](https://en.wikipedia.org/wiki/Galling). Abierto.
- Vistos en una búsqueda y **no abiertos:** [accu-components, thread galling](https://accu-components.com/us/p/151-what-is-thread-galling), [machinemfg](https://shop.machinemfg.com/how-to-prevent-galling-on-stainless-steel-bolts) (descartada por ser un vendedor), [Scribd, "Thread Galling"](https://www.scribd.com/document/370762473/Thread-Galling).
- Nickel Institute y Bossard (guías de grippado): **no localizados**.

## Aflojamiento, arandelas y fijadores de roscas

- [Bolt Science, arandelas elásticas helicoidales](https://www.boltscience.com/pages/helicalspringwashers.htm). Abierto: Junker 1969, retirada de normas de DIN en 2004, DIN 6796.
- [Bolt Science, ensayo de Junker](https://www.boltscience.com/pages/junkerstest.htm). Abierto, pero con poco contenido: sin normas ni conclusiones. El enlace [boltscience.com/pages/vibe1.htm](https://www.boltscience.com/pages/vibe1.htm) dio error de la herramienta.
- [FastFix, "Helical spring washers: are they really effective?"](https://fastfixtechnology.com/other-industries/helical-spring-washers-are-they-really-effective). Abierto.
- [Nord-Lock, Junker (vídeo, página de texto)](https://www.nord-lock.com/link/8bc1485d52684ff68b4ca5366646fa8d.aspx). Abierto: cita DIN 65151 e ISO 16130; sin resultados.
- [Nord-Lock, "how it works"](https://nord-lock.com/shop/everyday-applications/how-it-works). Abierto, pero solo mostró una página de contacto.
- [Bossard / Nord-Lock, folleto (03-2023, PDF)](https://www.bossard.com/dk-da/-/media/0d163628d10f470f99186aa4cd1221ec.pdf). Abierto.
- [Nord-Lock, catálogo de arandelas (versión en pulgadas, PDF)](https://mmintercom.com/upload/publish/197/NORD-LOCK%20Washers%20Catalogue.pdf) ([copia local](datasheets/NORD-LOCK_Washers_Catalogue.pdf)). Abierto. El enlace tal como salió en la búsqueda llevaba espacios; aquí están codificados.
- [Henkel, "¿Por qué un fijador LOCTITE es mejor que una arandela elástica?"](https://www.henkel-adhesives.com/dk/en/insights/all-insights/blog/why-is-loctite-threadlocker-better-than-a-spring-washer.html). Abierto: es un blog de marketing del fabricante, sin datos de Junker.
- [LOCTITE 243, ficha de RS](https://ie.rs-online.com/web/p/thread-lock/2432648). Abierto.
- [LOCTITE 243, hoja técnica (nov. 2020, copia de RS, PDF)](https://docs.rs-online.com/e55b/A700000008786735.pdf) ([copia local](datasheets/A700000008786735.pdf)). Abierto: ensayos ISO 10964 en M10, aviso de plásticos, activador.
- [LOCTITE 243, hoja de seguridad (copia de RS, PDF)](https://docs.rs-online.com/c7a7/0900766b80d76619.pdf). **No abierta.**
- [Aims Industrial, guía del LOCTITE 243](https://aimsindustrial.com.au/en-nz/blogs/product-guides/loctite-243-guide). Abierto: fuente secundaria (distribuidor); recomienda el 222 por debajo de M6.
- [Wikipedia, Locknut](https://en.wikipedia.org/wiki/Locknut). Abierto: no da el límite de temperatura de las tuercas de nailon.
- Vistos en una búsqueda y **no abiertos:** [Loctite Threadlocking Guide (Scribd)](https://es.scribd.com/doc/235616580/Loctite-Threadlocking-Guide), [Bossard, Nord-Lock](https://bossard.com/es/productos/product-applications/nord-lock), [Nord-Lock Brochure (PDF)](https://militarysystems-tech.com/sites/militarysystems/files/supplier_docs/Nord-Lock%20Brochure.pdf), [vídeo Junker de Nord-Lock (Vimeo)](https://vimeo.com/149122418).
- El límite de 120 °C de las tuercas de nailon: **sin fuente localizada**. Una búsqueda sobre ello se rechazó porque el presupuesto de búsquedas compartido se había agotado.

## Corrosión galvánica y acero inoxidable (generalidades)

- [Wikipedia, Galvanic corrosion](https://en.wikipedia.org/wiki/Galvanic_corrosion). Abierto: índice anódico y diferencias admisibles de 0,25, 0,50 y 0,15 V. No cita MIL-STD-889.
- [Wikipedia, Stainless steel](https://en.wikipedia.org/wiki/Stainless_steel). Abierto: magnetismo de austeníticos y ferríticos, serie 200.
- MIL-STD-889 y las tablas de Würth: **no localizados**.

## Calidad real del acero (foros y relatos; no hay ensayos)

- [YBW Forums, "A2 A4 or 316"](https://forums.ybw.com/threads/a2-a4-or-316.109146). Abierto: foro de navegantes; imán, XRF, partida de Tailandia con A2 falso. Relatos, sin informe citado.
- [MYCCR, hilo "Boat Design and Construction" (diciembre de 2024)](https://www.myccr.com/phpBB3_PROD/viewtopic.php?p=451956). Abierto: inox de Amazon muy magnético (anillas) y cajones de 316 con piezas mezcladas.
- [Slickdeals, hilo de tornillería (f/17203402)](https://slickdeals.net/f/17203402). Abierto: opiniones sobre tornillos baratos de Amazon.
- [Music Electronics Forum, "7598 warning regarding screws"](https://music-electronics-forum.com/forum/instrumentation/pickup-makers/7598-warning-regarding-screws). Abierto: inox no magnético, el 304 se magnetiza tras conformarlo en frío.
- [Thermo Fisher, PMI de fijaciones (resumen de aplicación, PDF)](https://assets.thermofisher.com/TFS-Assets/CAD/Application-Notes/PMI-Fasteners-AppSummary-2013Jan18b.pdf). **No abierto.** El servidor redirige a `documents.thermofisher.com` y la herramienta rechazó esa dirección (`PROVENANCE_REQUIRED`).
- [finishing.com, hilo 354/42](https://www.finishing.com/354/42.shtml): abierto, pero solo mostró el índice del blog, sin el hilo.
- Vistos en una búsqueda y **no abiertos:** [finishing.com 55/05](https://finishing.com/55/05.shtml), [CR4, "What type of steel is this"](https://cr4.globalspec.com/thread/68089/What-Type-of-Steel-is-This), [Mountain Project](https://www.mountainproject.com/v/112327725), [Fakespot (GRK)](https://www.fakespot.com/product/grk-772691120755-fasteners-12075-cab8134hp-cabinet-handypak-8-by-1-3-4-inch-100-screws-per-package-772691120755-1-75-inches), [ASTM E572 (análisis XRF de inox)](https://store.astm.org/e0572-02a.html).
- Reportajes de prensa, vídeos de canales técnicos con medidas y listas de la comunidad sobre kits de tornillería de Amazon.es: **no localizados**.

## Dibujo mecánico de la LRS-50 (copias de la hoja)

- [Mean Well Australia, LRS-50 DATA SHEET (2025-04-07, PDF)](https://www.meanwellaustralia.com.au/sites/default/files/2025-05/MEAN%20WELL%20LRS-50%20DATA%20SHEET.pdf) ([copia local](../meanwell-lrs-50-5/datasheets/MEAN_WELL_LRS-50_DATA_SHEET.pdf)). Abierto: "Case No.239A Unit:mm Tolerance:±1", "2-M3 L=3.0", "2-M3 L=5". Sin etiquetas lateral/inferior.
- [pulsar.pl, LRS-50-5 (2019-07-23, PDF traducido)](https://lib.pulsar.pl/karta/es/LRS-50-5.pdf) ([copia local](../meanwell-lrs-50-5/datasheets/LRS-50-5.pdf)). Abierto: mismo dibujo.
- [RS, LRS-50 (2015-12-31, PDF)](https://docs.rs-online.com/19bc/0900766b814e41ec.pdf). Abierto: mismo dibujo.
- Hoja oficial en meanwell.com: no intentada por mí. La [ficha #14](../meanwell-lrs-50-5/README.md) dice que la herramienta la rechazó.

## Kits comparables (no son el del proyecto)

- [RS Pro 281-978, kit de 3.168 piezas M2 a M6 (PDF)](https://docs.rs-online.com/3bcd/A700000007879576.pdf) ([copia local](datasheets/A700000007879576.pdf)). Abierto: DIN 85, DIN 963A, DIN 934, DIN 125; A2 304; M3 en 6, 10, 12 y 20 mm. La ficha se contradice en la cabeza (cruz y ranura).
- [RS Pro 393-169, kit de 490 piezas M3 a M6, cabeza botón (PDF)](https://docs.rs-online.com/3719/A700000007879596.pdf) ([copia local](datasheets/A700000007879596.pdf)). Abierto: "DIN 7380", A2 304, M3 en 8 y 10 mm.
- [ManoMano, kit INFINITE de 150 piezas M5](https://www.manomano.es/p/sechskantschrauben-set-304-edelstahl-m5x150-stuck-verschiedene-montagegroen-m5x101214162025mm-muttern-unterlegscheiben-federscheiben-rostschutz-209680352). Abierto: "AISI 304 (EN 10088)", incluye arandelas Grower. La descripción de la cabeza es contradictoria.
- [Bodega Aurrera, kit de 400 piezas M3 a M6](https://www.bodegaaurrera.com.mx/ip/herramientas-manuales/juego-de-tuercas-de-tornillos-con-cabeza-hexagonal-400-uds-m3-m4-m5-m6-surtido-de-acero-inoxidable-304-universal-para-coches-y-camiones/00939307216227). **No abierto** (error de la herramienta).
- Vistos en una búsqueda y **no abiertos:** [Mercado Libre, kit de 320 piezas](https://www.mercadolibre.com.co/shorts/clips/wb9Mab/kit-surtido-320-piezas-tornillos-tuercas-arandelas), [eBay, Kays Fasteners](https://www.ebay.es/str/kaysfasteners), [kit Kadrick de 1230 piezas (revendedor ruso)](https://www.alaniazapoved.ru/products/kadrick-1230-pcs-m2-m3-m4-m5-metric-screw-aassortment4mm-20mm-304-stainless-steel-hex-socket-button-head-cap-bolts-nuts-washers-kit-with-4-hex-wrenches/200809306).

## Dimensiones

- [Wikipedia, Nut (hardware)](https://en.wikipedia.org/wiki/Nut_(hardware)). Abierto: paso, llave y altura de tuerca y de tuerca de nailon, M3 a M6. No cita normas.
- [Wikipedia, Washer (hardware)](https://en.wikipedia.org/wiki/Washer_(hardware)). Abierto: ISO 7089/7090, DIN 125 (retirada y sustituida), DIN 127 B, NASA 1990.
- [Wikipedia, Set screw](https://en.wikipedia.org/wiki/Set_screw). Abierto: tipos de punta, ISO 4029.
- `en.wikipedia.org/wiki/Socket_head_cap_screw`: **no abierto** (la herramienta devolvió `URL_NOT_FOUND`). Las cabezas de ISO 4762 e ISO 7380-1 de la ficha son de memoria.

## Copias locales de los documentos

Documentos descargados el 21-10-2026 y guardados en el repositorio. Si un documento tiene enlace original en esta ficha, aparece junto a él como "copia local".

**En esta carpeta (`datasheets/`):**

- [A700000007879576.pdf](datasheets/A700000007879576.pdf): Kits de tornillos y pernos / CARACTERÍSTICA / Tornillos mecánicos (RS 281-978)
- [A700000007879596.pdf](datasheets/A700000007879596.pdf): Kits de tornillos y pernos / CARACTERÍSTICA / Tornillos de cabeza (RS 393-169)
- [A700000008786735.pdf](datasheets/A700000008786735.pdf): Technical Data Sheet / LOCTITE® 243™ / November -2020
- [Mechanical_Properties_Metric_Fasteners_Jan_2016.pdf](datasheets/Mechanical_Properties_Metric_Fasteners_Jan_2016.pdf): Engineering and Design Support / Mechanical Properties of Externally Threaded Fasteners per ISO 898‐1 (archivo original: `Mechanical Properties Metric Fasteners Jan 2016.pdf`)
- [NORD-LOCK_Washers_Catalogue.pdf](datasheets/NORD-LOCK_Washers_Catalogue.pdf): ENGLISH • UNC / NORD-LOCK WASHERS / The original wedge-locking solution (archivo original: `NORD-LOCK Washers Catalogue.pdf`)
- [Property_Classes_Screws_Nuts.pdf](datasheets/Property_Classes_Screws_Nuts.pdf): Property Classes of Screws and Nuts / Extract DIN ISO 898-1 / DIN ISO 898-2 / DIN ISO 3506-1 / DIN ISO 3506-2
- [Torque-Tension-Relationship-for-Metric-Stainless-Steel-Fasteners-A2-and-A4-70-Feb-2016.pdf](datasheets/Torque-Tension-Relationship-for-Metric-Stainless-Steel-Fasteners-A2-and-A4-70-Feb-2016.pdf): Torque Values for A2-70 or A4-70 Metric Stainless Steel Fasteners / Caution: Stainless steel fasteners tend to gall, especially wi

**Citados en esta ficha y guardados en otra carpeta:**

- [LRS-50-5.pdf](../meanwell-lrs-50-5/datasheets/LRS-50-5.pdf): Fuente de alimentación conmutada de salida / única de 50 W / Serie
- [MEAN_WELL_LRS-50_DATA_SHEET.pdf](../meanwell-lrs-50-5/datasheets/MEAN_WELL_LRS-50_DATA_SHEET.pdf): 50W Single Output Switching Power Supply / L R S - 5 0 series / User’s Manual
