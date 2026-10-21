# Enlaces guardados: separadores hexagonales de nailon M2,5 (kit de 350 piezas)

Todas las páginas consultadas para la [ficha](README.md), reunidas el 21-10-2026. "Leído" significa que mi herramienta devolvió el contenido (resumido, no descargado). "No abierto" significa que el enlace salió en una búsqueda o en otra página y no lo abrí. "Rechazado" o "error" significa que la herramienta no pudo traerlo.

## Raspberry Pi 3B+: planos y documentos oficiales

Copias locales de los cuatro primeros en [`../raspberry-pi-3b-plus/datasheets/`](../raspberry-pi-3b-plus/datasheets/).

- [Plano mecánico RP-008337-DS-2 (PDF)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf). Leído en local, rasterizado (no tiene capa de texto). Origen de Ø2,75, 58 × 49, 3,5 mm, círculo de Ø6 y alturas Z.
- [Plano mecánico RP-008336-DS-1 (DXF)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008336-DS-1-raspberry-pi-3-b-plus-mechanical-drawing.dxf). Analizado en local con un script (centros de agujeros, contornos de componentes de las dos caras).
- [Esquema reducido RP-008339-DS-1 (PDF)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf). Texto extraído en local: no habla de agujeros de montaje.
- [Product brief RP-008338-DS-2 (PDF)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf). Texto extraído en local: sin datos de montaje.
- [Plano de la caja oficial RP-008160-DS-1 (PDF)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008160-DS-1-raspberry-pi-3-b-plus-case-mechanical-drawing.pdf). Mirado en local: solo dimensiones exteriores de la caja; no se usa.
- [Catálogo oficial de la Pi 3B+](https://pip.raspberrypi.com/categories/532-raspberry-pi-3-model-b). Referencia de la ficha de la Pi.
- [Especificación HAT+ RP-008281-DS-1 (PDF)](https://pip-assets.raspberrypi.com/categories/1215-raspberry-pi-hat/documents/RP-008281-DS-1-hat-plus-specification.pdf) ([copia local](datasheets/RP-008281-DS-1-hat-plus-specification.pdf)). Leído. El texto no da cotas de agujeros ni zonas de exclusión; pide separadores de 15 mm o más para apilar una HAT+ (no aplica). La URL corta `datasheets.raspberrypi.com/hat/hat-plus-specification.pdf` redirige a esta.
- [Repositorio `raspberrypi/hats`](https://github.com/raspberrypi/hats). Leída la página principal (enlaza a las especificaciones mecánicas HAT y uHAT, sin cifras).
- [Especificación mecánica HAT: `hat-board-mechanical.pdf`](https://github.com/raspberrypi/hats/blob/master/hat-board-mechanical.pdf). **Rechazado:** la herramienta no pudo abrir el PDF de GitHub (política del sitio). No lo he rodeado.
- [Raspberry Pi, 2012: plantilla con agujeros de montaje de la Model B rev. 2](https://www.raspberrypi.com/news/raspberry-pi-rev2-template-with-mounting-holes/). Leída. Dice que los agujeros ayudan a los robots en la producción y avisa de que apretar mucho puede aplastar la placa. Los comentarios son de lectores.
- [Documentación de hardware de la Pi](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html). Ya recogida en la ficha de la Pi; no se ha vuelto a abrir.

## Raspberry Pi: agujeros de montaje y masa (búsqueda sin éxito)

- [Kapy CAD: patrón de agujeros de la Pi y HAT](https://kapycad.com/en/academy/standards/raspberry-pi). Leída. Ø2,7 mm, 58 × 49 mm, a 3,5 mm de dos bordes adyacentes. No habla de masa ni de zona de exclusión.
- [RS DesignSpark (feb. 2021): proteger la Pi](https://www.rs-online.com/designspark/what-outputs-can-i-use-with-my-raspberry-pi-part-4-protecting-your-pi). Leída. Lista las partes de la Pi conectadas a masa; no nombra los agujeros de montaje.
- [Altium: masa en agujeros metalizados](https://resources.altium.com/p/pcb-grounding-techniques-for-plated-pcb-mounting-holes). Leída. Genérica (no es de la Pi): práctica habitual de unir los agujeros metalizados a masa y riesgos de unirlos a un chasis.
- [Wikipedia: Extra-low voltage (SELV, PELV, FELV)](https://en.wikipedia.org/wiki/Extra-low_voltage). Leída. SELV sin conexión a tierra, PELV con ella (cita IEC 61140).
- [Pololu: separador de aluminio de 11 mm para Raspberry Pi](https://www.pololu.com/product/1952). Leída. M2,5, dice que coincide con los agujeros de la Pi. No habla de masa ni de nailon.
- [Pololu: producto 2713 (separadores)](https://www.pololu.com/product-info-merged/2713). Leída. Mismo contenido; sin datos de masa.
- [The Pi Hut: separadores de nailon M2,5](https://thepihut.com/products/m2-5-nylon-standoff-packs). Leída. Largos de 6, 8, 10, 12 y 20 mm, macho-hembra y hembra-hembra; "M2,5 es la rosca recomendada". No dice si el nailon evita cortocircuitos.
- Foro de Raspberry Pi, **error de la herramienta (no abiertos):** [Ground pi 3 to earth (t=226978)](https://forums.raspberrypi.com/viewtopic.php?t=226978), [Bricked Pi, Mounting Holes (t=219941)](https://forums.raspberrypi.com/viewtopic.php?t=219941), [Plain metal backplate (t=298800)](https://forums.raspberrypi.com/viewtopic.php?t=298800), [Mounting hole distance from PCB (t=183551)](https://forums.raspberrypi.com/viewtopic.php?t=183551).
- Salieron en búsquedas y **no los abrí:** [through-holes on PCB (t=76195)](https://www.raspberrypi.org/forums/viewtopic.php?p=544273&t=76195), [Where is the new mounting hole located (t=24213)](https://forums.raspberrypi.com/viewtopic.php?t=24213), [Poor choice of mounting holes (t=30556)](https://forums.raspberrypi.com/viewtopic.php?f=24&t=30556), [EEVblog: Plated mounting holes, grounded or not?](https://eevblog.com/forum/projects/plated-mounting-holes-grounded-or-not/msg488137).
- Abiertos sin datos útiles: [element14, "Raspberry Pi case question"](https://community.element14.com/products/raspberry-pi/f/forum/46284/raspberry-pi-case-question), [REXYGEN foro, post 827](https://forum.rexygen.com/post/827), [roboticsclub #1385 (no es de la Pi)](https://www.roboticsclub.org/redmine/issues/1385), [sudomod p=53150](https://sudomod.com/forum/viewtopic.php?p=53150), [All About Circuits: Ground wiring and loops](https://forum.allaboutcircuits.com/threads/ground-wiring-and-loops.198457/post-1880177), [eetree rasp_hat.pdf](https://www.eetree.cn/wiki/_media/rasp_hat.pdf) (es un esquema de KiCad de una HAT, no la especificación).

## Nailon (PA66): hojas de datos y propiedades

- [BASF Ultramid A3K, hoja de producto (PDF)](https://download.basf.com/p1/8a8082587fd4b608017fd64108ab6d3b/en/ULTRAMID_A3K_Product_Data_Sheet_Asia_PacificEurope_English.pdf). Leída. Módulo en seco y acondicionado, fluencia a 1.000 h, humedad, resistividad, CTI. No da UL 94 ni rigidez dieléctrica.
- [Ensinger TECAMID 66 natural, página europea](https://www.ensingerplastics.com/en/shapes/pa66-tecamid-66-natural). Leída (la página se truncó a los 100.000 caracteres de 169.000). UL 94 HB, Tg 47 °C, 100 °C continuo.
- [Ensinger TECAMID 66 natural, hoja de EE. UU. versión A1, 12-02-2019 (PDF, copia en Polymershapes)](https://www.polymershapes.com/wp-content/uploads/2020/04/Polymershapes_Ensigner_DataSheet-TECAMID-66-natural.pdf) ([copia local](datasheets/Polymershapes_Ensigner_DataSheet-TECAMID-66-natural.pdf)). Leída. UL 94 V-2, 85 °C continuo, 8,5 % de saturación. Unidades de algunas cifras mal extraídas.
- [Ensinger TECAMID 66, otra copia de la hoja de EE. UU. (Modern Plastics, 2015)](https://www.modernplastics.com/wp-content/uploads/2015/04/TECAMID-66.pdf). Leída. Misma estructura; absorción a 24 h de 1,2 % frente al 0,45 % de la versión de 2019.
- [Polymershapes: TECAMID 66 negro (PDF)](https://polymershapes.com/wp-content/uploads/2025/08/Polymershapes_Ensigner_DataSheet-TECAMID-66-black.pdf), [TECAMID 66 HI](https://www.polymershapes.com/wp-content/uploads/2020/04/Polymershapes_Ensigner_DataSheet-TECAMID-66-HI.pdf). Salieron en la búsqueda; **no abiertos**.
- [Wikipedia: Nylon](https://en.wikipedia.org/wiki/Nylon). Leída. Higroscopia, plastificación por agua, fusión de PA66 y PA6.
- [Wikipedia: Polyoxymethylene (POM)](https://en.wikipedia.org/wiki/Polyoxymethylene). Leída. Uso continuo hasta 80 °C; no cuantifica la absorción de agua.
- [industrialmonitordirect: aflojado de fijaciones en cajas de nailon](https://industrialmonitordirect.com/blogs/knowledgebase/troubleshooting-self-loosening-fasteners-in-nylon-enclosures). Leída. **Blog de un vendedor**, sin referencias; solo se usa como indicio.
- DuPont Zytel, Röchling, Keystone, Harwin, Richco, Hellermann: **no abiertos** (presupuesto de búsquedas).

## Separadores y kits de nailon

- [Würth WA-SPAIE 971060155, hoja (PDF)](https://docs.rs-online.com/57e3/0900766b816cd289.pdf) ([copia local](datasheets/0900766b816cd289.pdf)). Leída. Rev. 001.002, 10-01-2019; UL 94 HB, de −30 a +110 °C.
- [Würth WA-SPAIE 971200155, hoja (PDF)](https://docs.rs-online.com/bd08/A700000007100033.pdf). Leída. Mismas condiciones; rosca interior de 10 mm.
- [RS: Würth 971060155 (M2,5, 6 mm + 8 mm)](https://kr.rs-online.com/web/p/standoffs/1841664). Leída. Datos de dimensiones; no da UL 94 ni temperatura. Otros listados de RS de Würth (sin abrir): [1841916](https://za.rs-online.com/web/p/standoffs/1841916), [1841663](https://no.rs-online.com/web/p/standoffs/1841663), [1841660](https://nz.rs-online.com/web/p/standoffs/1841660), [1841999](https://za.rs-online.com/web/p/standoffs/1841999).
- [RS: Würth 971200155 (20 mm)](https://uk.rs-online.com/web/p/standoffs/2052936/). Leída. **Da de −55 a +150 °C, que contradice la hoja del fabricante.**
- [Essentra: separadores hexagonales aislantes](https://www.essentracomponents.com/en-gb/p/hexagonal-insulation-standoffs). Leída. Nailon 6, UL 94 V-2, M2,5 a M6.
- [Mouser: Essentra 36F / CBMFTS / NTS](https://www.mouser.hk/new/essentra/essentra-36f-cbmfts-nts-hexagonal-standoffs). Leída. Nailon 6/6, UL 94 V-2, de −40 a +85 °C, con cinta adhesiva.
- [Adafruit 3299: kit de nailon M2,5 de 380 piezas (copia en chipdip, PDF)](https://static.chipdip.ru/lib/359/DOC011359023.pdf). Leída.
- [Kit M2,5 de nailon de 240 piezas (grosshoeflein.at)](https://www.grosshoeflein.at/products/m25-nylon-hex-m-f-spacerscrewnut-assorted-kit-for-raspberry/221115198/). Leída.
- [vxb.com: kit de 350 piezas M3 de nailon](https://vxb.com/products/350pcs-m3-nylon-hex-spacer-standoff-kit-with-male). Leída. Es M3 (no M2,5) y no da el reparto; solo sirve de ejemplo de kit de 350.
- [Farnell: Multicomp RPI-NYLON-STANDOFF-KIT (2543622)](https://ie.farnell.com/multicomp/rpi-nylon-standoff-kit/threaded-standoffs-kit-raspberry/dp/2543622). Leída. Dibujo enlazado, **no abierto**: [farnell.com/cad/2631197.pdf](https://www.farnell.com/cad/2631197.pdf).
- Salieron en la búsqueda y no se abrieron: [makerlab M2,5/M3 nailon](https://www.makerlab-electronics.com/products/m2-5-m3-nylon), [RobotShop: Nylon Screws Nut Standoffs](https://ca.robotshop.com/products/nylon-screws-nut-standoffs-kit), [The Pi Hut: set blanco M2,5](https://thepihut.com/products/white-nylon-screw-and-stand-off-set-m2-5-thread), [Uxcell M2 × 6](https://www.walmart.com/ip/Uxcell-M2x6mm-6mm-Male-to-Female-Hex-Nylon-Spacer-Standoff-150pcs/977453618).
- **Amazon.es, ASIN B0G4G7WQRM:** no accesible (Amazon bloquea a mi herramienta). Una búsqueda por el ASIN y la descripción no devolvió el anuncio ni nada con ese código.

## Roscas, pares y fijación

- [Wikipedia: ISO metric screw thread](https://en.wikipedia.org/wiki/ISO_metric_screw_thread). Leída. M2,5: paso grueso 0,45 mm y fino 0,35 mm (ISO 262); clases 6g y 6H.
- [fasten.it: DIN 34810](https://fasten.it/en/norms/norm/din_34810). Leída. Alcance M3 a M10; pares de 0,1 N·m (M3), 0,25 (M4), 0,5 (M5), 0,8 (M6), 1,8 (M8), 3,5 (M10). **Resumen web de la norma de pago; no he visto la norma.**
- [Bossard: pares de apriete de tornillos de plástico, PA6.6](https://www.bossard.com/ch-en/assembly-technology-expert/technical-information-and-tools/technical-resources/preload-and-tightening-torques/tightening-torques-for-plastic-screws--polyamide-66) y [versión sueca](https://bossard.com/se-sv/assembly-technology-expert/teknisk-information-och-verktyg/teknisk-information/preload-and-tightening-torques/tightening-torques-for-plastic-screws--polyamide-66). Leídas: **la tabla no estaba en el texto**; solo las condiciones (20 °C, acondicionado, 150 rpm, DIN 34810). Hay un capítulo descargable que no se pudo abrir.
- [Henkel Loctite Threadlocker Blue 242 (PDF)](https://datasheets.tdx.henkel.com/LOCTITE-THREADLOCKER-BLUE-242-en_US.pdf) ([copia local](datasheets/LOCTITE-THREADLOCKER-BLUE-242-en_US.pdf)). Leída. "No es para plásticos termoplásticos" por riesgo de grietas por tensión.
- Salieron en la búsqueda y no se abrieron: [Accu: pares de apriete](https://accu-components.com/p/389-high-tensile-steel-fasteners-recommended-tightening-torques), [Engineers Edge: Nylon torque theory](https://ns2.engineersedge.com/engineering-forum/showthread.php/6470-Nylon-Torque-Theory), otras hojas de Loctite ([220](https://datasheets.tdx.henkel.com/LOCTITE-220-en_GL.pdf), [915](https://datasheets.tdx.henkel.com/LOCTITE-915-en_GL.pdf)).

## Sensor ZE29A y otras fichas del proyecto

- [Manual V1.1 del ZE29A (PDF)](https://www.winsen-sensor.com/d/files/manual/ze29a-c2h5oh.pdf) ([copia local](../winsen-ze29a/datasheets/ze29a-c2h5oh.pdf)). Leído de nuevo para esta ficha: 85 × 33 × 18 mm, sin dibujo ni agujeros; notas de fijación y de golpes.
- [Ficha del ZE29A](../winsen-ze29a/README.md), [ficha de la Raspberry Pi 3B+](../raspberry-pi-3b-plus/README.md) y [ficha de la Mean Well LRS-50-5](../meanwell-lrs-50-5/README.md) (aislamiento entre salida y FG).

## Copias locales de los documentos

Documentos descargados el 21-10-2026 y guardados en el repositorio. Si un documento tiene enlace original en esta ficha, aparece junto a él como "copia local".

**En esta carpeta (`datasheets/`):**

- [0900766b816cd289.pdf](datasheets/0900766b816cd289.pdf): Würth Elektronik, separador hexagonal de poliamida WA-SPAIE 971060155 (hoja de datos vía RS)
- [LOCTITE-THREADLOCKER-BLUE-242-en_US.pdf](datasheets/LOCTITE-THREADLOCKER-BLUE-242-en_US.pdf): Technical Data Sheet / Revision: October 5, 2024 / Supersedes: April 20, 2024
- [Polymershapes_Ensigner_DataSheet-TECAMID-66-natural.pdf](datasheets/Polymershapes_Ensigner_DataSheet-TECAMID-66-natural.pdf): TECAMID® 66 natural - Stock Shapes / Chemic al Des ignat ion / PA 66 (Polyamide 66)
- [RP-008281-DS-1-hat-plus-specification.pdf](datasheets/RP-008281-DS-1-hat-plus-specification.pdf): Raspberry Pi HAT+ Specification / 6df06cc-clean / 2024-12-05:
- [ULTRAMID-A3K-product-information-2026-09.pdf](datasheets/ULTRAMID-A3K-product-information-2026-09.pdf): BASF, Ultramid A3K (PA66), Product Information 09/2026 (archivo original: `ULTRAMID#U00ae+A3K.pdf`)

**Citados en esta ficha y guardados en otra carpeta:**

- [ze29a-c2h5oh.pdf](../winsen-ze29a/datasheets/ze29a-c2h5oh.pdf): Winsen ZE29A-C2H5OH: manual del módulo de sensor de alcohol, V1.1
