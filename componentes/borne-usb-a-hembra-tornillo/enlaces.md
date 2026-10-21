# Enlaces guardados: borne USB-A hembra con terminales de tornillo (2 uds.)

Todas las páginas consultadas para la [ficha](README.md), reunidas el 21-10-2026. Donde dice "no abierto" es que la herramienta no pudo leerlo o que solo vi el enlace en una lista de resultados.

## Anuncio y proyecto

- Amazon.es, ASIN B07V86XPL4 (`https://www.amazon.es/dp/B07V86XPL4`): **no abierto** (Amazon bloquea el acceso). Una búsqueda del ASIN en la web no devolvió nada relacionado con la pieza.
- Guía de montaje eléctrico del proyecto (v2, 20-10-2026), `claude/guia-montaje-electrico.md` del proyecto del usuario: §0, §1 fila 18, §3, §5.2. Leída en una copia local; no tiene URL.

## Normas y documentos de USB-IF (para descargar)

Los enlaces de USB-IF los tomé de la [ficha #10](../cable-usb-a-usb-c-90-30cm/enlaces.md), que los vio en usb.org. **No los abrí yo.**

- [USB Battery Charging Specification v1.2 (página)](https://usb.org/document-library/battery-charging-v12-spec-and-adopters-agreement) · [ZIP](https://usb.org/sites/default/files/BCv1.2_070312_0.zip) ([copia local](../documentos-compartidos/usb/BCv1.2_070312_0.zip))
- [USB 2.0 Specification (página)](https://usb.org/document-library/usb-20-specification) · [ZIP, 13,82 MB](https://usb.org/sites/default/files/usb_20_20250603.zip) ([copia local](../documentos-compartidos/usb/usb_20_20250603.zip))
- [usb_20.pdf, copia no oficial de 2011 (git.nefarius.at)](https://git.nefarius.at/nefarius/USB-Bluetooth-Specs/media/branch/master/usb_20_0702115/usb_20.pdf): solo se leyó el índice (el cuerpo no es legible con la herramienta). Capítulo 6, sección 6.5.3 "Series A and Series B Receptacles", p. 94, y 6.7 "Electrical, Mechanical, and Environmental Compliance Standards", p. 106.

## Detección de cargador (D+/D−, BC 1.2, Apple, Samsung)

- [Molex, ficha USB-C citada en la ficha #10 (copia en chipdip)](https://static.chipdip.ru/lib/641/DOC034641065.pdf): fuente de las asignaciones de pines VBUS, GND y CC del USB-C usadas en la prueba de continuidad (no abierta por este agente; enlace tomado de la ficha #10).
- [TI TPS2513/TPS2513A/TPS2514/TPS2514A, SLVSBY8B (copia en chipdip)](https://static.chipdip.ru/lib/162/DOC013162143.pdf): leído. Modos de puente BC 1.2, Divider 1/2/3 y 1,2 V (págs. 9-11) y Tabla 4 de corrientes.
- [TI, ti.com/lit/gpn/TPS2513](https://ti.com/lit/gpn/TPS2513): enlace oficial visto en una búsqueda; **no abierto**.
- [TI, ti.com/lit/ds/symlink/tps2514a.pdf](https://www.ti.com/lit/ds/symlink/tps2514a.pdf): intenté abrirlo y la herramienta **no obtuvo permiso**; no lo reintenté.
- [Microchip: carga por USB (BC 1.2, DCP, D+/D−)](https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/power-delivery/battery-charging/): leído.
- [happytrees: USB charger data pins](https://happytrees.org/USB_charger_data_pins): leído. Tabla de cargadores con D+/D− unidos y las tensiones de Apple y Samsung. Fuente de aficionado, sin autor claro.
- [Wikipedia: USB hardware](https://en.wikipedia.org/wiki/USB_hardware): leído. Orden y colores de los pines, tolerancia de VBUS, ciclos de conexión, límite de 200 Ω del DCP. No lo usé para las tensiones de Apple (el resumen que obtuve de la herramienta no coincidía con las otras fuentes).
- Vistos en una búsqueda y **no abiertos**: [alldatasheet: TPS2514DBVT](https://html.alldatasheet.es/html-pdf/848394/TI1/TPS2514DBVT/698/11/TPS2514DBVT.html), [alldatasheet: TPS2513A](https://html.alldatasheet.net/html-pdf/542943/DIODES/TPS2513A/2447/11/TPS2513A.html), [ti.com.cn: TPS2513A-Q1](https://www.ti.com.cn/product/TPS2513A-Q1), [LCSC: PJ5102SG](https://wmsc.lcsc.com/wmsc/upload/file/pdf/v2/lcsc/2112021130_PJSEMI-PJ5102SG_C469392.pdf), [LCSC: AT5102SG](https://wmsc.lcsc.com/wmsc/upload/file/pdf/v2/lcsc/2208221800_Agertech-AT5102SG_C5141738.pdf).

## Conectores USB-A hembra (fabricantes)

- [Molex PS-105057-001, USB 105057-0001 (copia en RS)](https://docs.rs-online.com/6a44/A700000008643305.pdf) ([copia local](datasheets/A700000008643305.pdf)): leído. 1,5 A, 30/100 mΩ, subida de 30 °C a 1,5 A, fuerzas de enchufado y desenchufado.
- [RS UK, Molex 105057-0001](https://uk.rs-online.com/web/p/products/8967579): leído (1,5 A, 30 V). Otras dos hojas enlazadas ahí: [Type A 2.0mm shielded USB PCB receptacle](https://docs.rs-online.com/1d8d/0900766b8144c2a4.pdf) (**se abrió vacía, sin texto**) y [105057-0001 Part Details](https://docs.rs-online.com/15f7/0900766b815ec912.pdf) (**no abierta**).
- [DigiKey UK, Molex 1050570001](https://www.digikey.co.uk/en/products/detail/molex/1050570001/3045207): abierta; no muestra la tabla de atributos.
- [Würth 61400826021, ficha](https://www.we-online.com/components/products/datasheet/61400826021.pdf) ([copia local](datasheets/61400826021.pdf)): leída. USB 2.0 tipo A doble, 1,5 A, 20 mΩ, 1.500 ciclos.
- [Kycon KUSBVLPX (Mouser)](https://www.mouser.be/new/kycon/kycon-kusbvlpx-usb-receptacles): leído. 1 A, 30 mΩ.
- [Kycon KUSBVXHT alta retención (Mouser)](https://www.mouser.in/new/kycon/kycon-high-retention-usb/): leído. 1,5 A, extracción 15 N mín., enchufado 35 N máx.
- [Mill-Max, zócalos USB (PDF)](https://www.mill-max.com/sites/default/files/external/assets/2017-12/USB%20Sockets.pdf) ([copia local](datasheets/USB_Sockets.pdf)): leído. 1 A por contacto para 30 °C de subida, p. 150.
- [Kyoritsu, conector USB A/B](https://www.kyohritsu.com/eclib/OTHER/FIG/CONNECTOR/3505.pdf): leído (es una página web). 1,5 A (USB 1.0) y 2,5 A (USB 2.0).
- [Future Electronics, GCT USB1135-15-9-L-B](https://www.futureelectronics.com/p/5134155): leído. USB 3.0 tipo A de 9 contactos, 3 A.
- [GCT USB1135, ficha](https://gct.co/files/drawings/usb1135.pdf): **no abierta** (el servidor rechazó la herramienta; no la rodeé).
- [Amphenol GSB19111KHR (DigiKey)](https://azcus.digikey.com/en/products/detail/amphenol-icc-commercial-products/GSB19111KHR/16819057): **no abierta** (el servidor rechazó la herramienta).
- Vistos en una búsqueda y **no abiertos**: [GCT USB1135 en DigiKey](https://www.digikey.it/en/products/detail/gct/USB1135-15-9-L-B/13545895), [GCT USB1130-15-A](https://www.digikey.nl/en/products/detail/gct/USB1130-15-A/13546504), [GCT USB1130-15-A en Future](https://www.futureelectronics.com/p/interconnect--usb-to-ttl-rs232-rs422-rs485-cables/usb1130-15-a-gct-5161878), [GCT USB1015 (DigiKey)](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/5335/USB1015_Spec.pdf), [Farnell 3621527](https://www.farnell.com/datasheets/3621527.pdf).
- [Multicomp USB-A-S-RA (Farnell, PDF)](https://www.farnell.com/datasheets/2856485.pdf) ([copia local](datasheets/2856485.pdf)): leído. 1,5 A, 30 mΩ, –20 a +60 °C.
- [Hoja "USB 2.0 - A Connector" en chipdip (pie de página de Distrelec)](https://static.chipdip.ru/lib/628/DOC041628005.pdf): leída. 1,5 A por pin, 30 mΩ.
- Multicomp Pro MC32603 (USB-A **macho** acodado), [Farnell 3157114](https://www.farnell.com/datasheets/3157114.pdf): leído; es un enchufe y no un receptáculo, 1,5 A. Otros resultados de la búsqueda sin abrir: [chipdip DOC041628393](https://static.chipdip.ru/lib/628/DOC041628393.pdf), [chipdip DOC041628000](https://static.chipdip.ru/lib/628/DOC041628000.pdf), [Farnell cad 3154543](https://www.farnell.com/cad/3154543.pdf), [components.ru 6674251](https://cdn.components.ru/media/PDF/6674251.pdf), [Molex PS-48204 (copia MAN)](https://extranet.mandieselturbo.com/electronics/datasheets/Molex/48204%20Series/PS-48204-001-001.pdf), [Würth 1725344 (RS)](https://nz.rs-online.com/web/p/usb-connectors/1725344), [eicom 1652453](https://cdn.eicom.ru/media/PDF/1652453.pdf).
- Lumberg 2410 08 (USB-A macho acodado, 1 A): [página](https://www.lumberg.com/en/products/product/2410+08), citada en la [ficha #10](../cable-usb-a-usb-c-90-30cm/README.md); **no la abrí**.

## Placas "USB-A hembra a bornes" comparables

- [CamdenBoss CIM/USBA en Farnell (PDF)](https://www.farnell.com/datasheets/3927991.pdf) ([copia local](datasheets/3927991.pdf)) y [element14](https://nz.element14.com/camdenboss/cim-usba/tb-interface-usb-a-recpt-tb/dp/221181701): leídos. Módulo de carril DIN, 30 V CC y 100 mA, tornillo M3, 0,2-4 mm², par máx. 0,5 N·m.
- [CPC/Farnell, USB2 A Screw Termination Keystone Socket (KUA2bk), PDF](https://www.farnell.com/datasheets/2905819.pdf) ([copia local](datasheets/2905819.pdf)): leído. "500 mA a 5 V", "para datos, no para carga". Página del producto [cpc.farnell.com](https://cpc.farnell.com/tuk/kua2bkdpm/usb2-a-d-universal-screw-term/dp/CN22299): no abierta.
- [Delock 66653, características](https://www.delock.com/produkt/66653/merkmale.html): leído. Hasta 500 mA, paso 2,54 mm. Su [PDF](https://delock.com/produkt/66653/pdf.html?sprache=en): no abierto.
- [Danbit: USB 2.0 Type-A hembra a 4 bornes (USB4AF-TERM)](https://danbit.dk/en/stik/25543-usb-20-type-a-female-to-4-pin-screw-terminal-connector-shielded.html): leído; no da corriente, paso ni calibre.
- [SparkFun: USB Type A Female Breakout, guía](https://learn.sparkfun.com/tutorials/usb-type-a-female-breakout-hookup-guide/all): leída. Sin protecciones citadas; rotulado VCC, D−, D+, GND. Otras páginas del mismo producto vistas y no abiertas: [Core Electronics](https://core-electronics.com.au/usb-type-a-female-breakout.html), [Little Bird](https://littlebirdelectronics.com.au/products/sparkfun-usb-type-a-female-breakout), [bipom](https://www.bipom.com/products/us/2899934.html).
- [Open Electronics: Breakout Board with Female USB Connector](https://oe2.open-electronics.org/?p=56711): leído. Placa de 23 × 17 × 11 mm con pads; sin dato de corriente.
- Vistos en una búsqueda y **no abiertos**: [Jaycar PA0954](https://jaycar.com.au/p/PA0954), [SmartElex](https://stgaws.robu.in/product/smartelex-usb-type-a-female-breakout-module), [Embedded Related](https://www.embeddedrelated.com/parts/p/12700).

## Borneros de tornillo, pares y calibres

- [Phoenix Contact, ficha 1751251 (copia en el servidor de MAN Energy Solutions)](https://extranet.mandieselturbo.com/electronics/datasheets/Phoenix/MKDS%20Series/1751251_04_en_04.pdf): leída. Paso 3,5 mm, 0,14-1,5 mm², puntera 0,25-0,5 mm², 0,22-0,25 N·m.
- [Multicomp, bornero de PCB 5,08 mm (Farnell, PDF)](https://www.farnell.com/datasheets/1600406.pdf): leído. 0,2-4 mm², 7,0 lb-pulgada.
- Phoenix Contact, páginas "pdf" de los productos [5452257](https://www.phoenixcontact.com/us/products/5452257/pdf), [5442219](https://www.phoenixcontact.com/us/products/5442219/pdf) y [5442578](https://www.phoenixcontact.com/us/products/5442578/pdf): **no se abrieron** (el servidor devolvió HTTP 429, "demasiadas peticiones"; no reintenté). [5452258](https://www.phoenixcontact.com/us/products/5452258/pdf) y [5453033 en proax.ca](https://proax.ca/en/product/200685/phx5453033): solo vistos.
- Vistos en una búsqueda y no abiertos: [Master Electronics 1715815](https://www.masterelectronics.com/cn/datasheet/1715815-12138717/), [Talmir](https://www.talmir.co.il/gallery/1564071234.pdf), [Novapart 4179082](https://novapart.co/datasheet/farnell:4179082/).
- [JLCPCB: guía de borneros de PCB](https://jlcpcb.com/blog/pcb-terminal-blocks-guide): leída. Aflojado por vibración y ciclos térmicos, tensión mecánica en la pata, rangos de AWG por tipo de bloque. Es el blog de un fabricante de placas, sin datos de par.
- Vistos en una búsqueda y no abiertos: [Novapart: selección de borneros](https://novapart.co/posts/terminal-block-selection-screw-push-in-pluggable/), [Wevolver](https://www.wevolver.com/article/terminal-block-selection-types-ratings-and-wiring), [Machine Design: keeping wires and cables connected](https://www.machinedesign.com/archive/article/21814274/keeping-wires-and-cables-connected), [Viox](https://viox.com/screw-vs-spring-vs-push-in-terminal-blocks/), [Incurelab](https://incurelab.com/wp/securing-electric-motor-terminal-screws-against-vibration-and-arcing), [eng-tips](https://eng-tips.com/viewthread.cfm?qid=93666), [PTR Hartmann](https://ptr-hartmann.com/know-how/connection-technology/general/products-with-flanges).

## Pistas de cobre (IPC-2221)

- [NextPCB: calculadora de ancho de pista, guía IPC-2221](https://www.nextpcb.com/blog/pcb-trace-width-calculator-ipc-2221-guide): leída. Fórmula, k = 0,048 (externa), tabla de 1, 2 y 3 A. El ejemplo desarrollado de la página tiene un error (lo señalo en la ficha); uso su fórmula y su tabla, que coinciden entre sí.
- Vistos en una búsqueda y no abiertos: [circuit.rocks](https://circuit.rocks/pages/pcb-trace-width-calculator), [elektroda](https://www.elektroda.com/qa,pcb-trace-width-current-copper.html), [AllPCB](https://www.allpcb.com/blog/pcb-knowledge/calculating-minimum-trace-width-for-20a-high-current-pcbs-a-practical-guide.html), [NextPCB: diseño de alta corriente](https://www.nextpcb.com/blog/pcb-trace-width-calculation-high-current-design-and-thermal-analysis).

## Seguridad y normativa

- [ITC-BT-36, Instalaciones a muy baja tensión (plcmadrid.es)](https://www.plcmadrid.es/wp-content/uploads/ITC-BT-36.pdf) ([copia local](../documentos-compartidos/normas/ITC-BT-36.pdf)): leída. Apartado 1 (MBTS/MBTP/MBTF, 50 V CA / 75 V CC), 2.1 (fuentes), 2.2 (separación y conductos).
- Vistos en una búsqueda y no abiertos: [Normatia: ITC-BT-36](https://normatia.com/es/normativa/rebt/2025/itc-bt-36-instalaciones-a-muy-baja-tension/), [REBT 2002 (UPM)](https://www.etsist.upm.es/estaticos/catedra-coitt/web_ICT/Documentacion/REBT_2002.pdf).
- [onsemi TND6506, nota técnica sobre protección USB-C](https://www.onsemi.com/download/white-papers/pdf/tnd6506-d.pdf): leída para buscar polaridad inversa. **No la trata** (solo corriente inversa y sobretensión en VBUS). Otros vistos en la búsqueda y no abiertos: [TI SLYY105](https://ti.com/lit/SLYY105), [Slashdot: algunos cables USB-C reversibles pueden dañar](https://hardware.slashdot.org/story/16/02/05/2241255/some-reversible-usb-c-cablesadapters-could-cause-irreversible-damage), [components101](https://components101.com/node/841).

## Alternativas

- [Control Design: módulo de carga WAGO para carril](https://www.controldesign.com/vendors/products/2015/wago-rail-mount-charging-module): leído. Entrada de 10 a 30 V CC, USB 2.0 tipo A, hasta 1,5 A. Otra copia: [controldesign.com/directory](https://www.controldesign.com/directory/product/11325001/wago-power-distribution-wago-rail-mount-charging-module), no abierta.
- Vistos en una búsqueda y no abiertos: [Danbit: hub USB para carril DIN](https://www.danbit.dk/en/usb-hubs/13084-4-ports-usb-20-hub-for-din-rail-with-7-24vdc-supply-input.html), [Maplin: doble USB-A 5 V 2,4 A con panel](https://pro.maplin.co.uk/products/dual-usb-a-5v-2-4a-socket-with-mounting-panel-20a-a13-226194b2), [Farnell 1870837](https://www.farnell.com/datasheets/1870837.pdf), [Schlegel en DirectIndustry](https://www.directindustry.com/product-manufacturer/schlegel-built-in-electrical-socket-223188-3847.html), [static.chipdip.ru DOC027657103](https://static.chipdip.ru/lib/657/DOC027657103.pdf).

## Otras fichas del repositorio

- [Cable USB-A a USB-C acodado 90° (#10)](../cable-usb-a-usb-c-90-30cm/README.md): Rp de 56 kΩ, D+/D− en el cable, caída de tensión, ficha de Molex del USB-C.
- [SumUp Solo](../sumup-solo/README.md): batería de 6,16 Wh, consumo no publicado, manual que pide el cargador original.
- [Pantalla GeeekPi 7"](../pantalla-geeekpi-7-hdmi/README.md): consumo sin dato oficial, duda A→C o C→C, propuesta de fusible o PTC.
- [Mean Well LRS-50-5](../meanwell-lrs-50-5/README.md): OCP en 110-150 %, aislamiento, normas.

## Copias locales de los documentos

Documentos descargados el 21-10-2026 y guardados en el repositorio. Si un documento tiene enlace original en esta ficha, aparece junto a él como "copia local".

**En esta carpeta (`datasheets/`):**

- [2856485.pdf](datasheets/2856485.pdf): USB 2.0 Type A Receptacle / Single Port, Right Angle PCB / Specifications:
- [2905819.pdf](datasheets/2905819.pdf): USB2 A Screw Termination Keystone Socket / KUA2bk / KUA2wh (Farnell, ficha)
- [3927991.pdf](datasheets/3927991.pdf): R E L AY B A S E S / I N T E R FA C E M O D U L E S / I N T E R FA C E M O D U L E S & R E L AY B A S E S (CamdenBoss)
- [61400826021.pdf](datasheets/61400826021.pdf): Würth Elektronik 61400826021: plano acotado (tolerancia general ±0,10 mm)
- [A700000008643305.pdf](datasheets/A700000008643305.pdf): PRODUCT SPECIFICATION / TITLE / USB SERIES CONNECTOR
- [USB_Sockets.pdf](datasheets/USB_Sockets.pdf): MAXIMUM SOLUTIONS / Mill-Max USB Connectors / Standard USB Features (archivo original: `USB Sockets.pdf`)

**Citados en esta ficha y guardados en otra carpeta:**

- [BCv1.2_070312_0.zip](../documentos-compartidos/usb/BCv1.2_070312_0.zip): USB-IF, Battery Charging Specification Rev. 1.2 (ZIP)
- [ITC-BT-36.pdf](../documentos-compartidos/normas/ITC-BT-36.pdf): ITC-BT-36: instalaciones a muy baja tensión (REBT)
- [usb_20_20250603.zip](../documentos-compartidos/usb/usb_20_20250603.zip): USB-IF, USB 2.0 Specification (ZIP, 06-2025)
