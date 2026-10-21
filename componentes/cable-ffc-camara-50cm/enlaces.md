# Enlaces guardados: GeeekPi cable FFC de 15 pines, 50 cm

Todas las páginas consultadas para la [ficha](README.md), reunidas el 21-10-2026. No he podido descargar archivos: los PDF se dan como enlace directo para que los bajes tú. Las páginas de tiendas y foros cambian; guarda tu copia con fecha de las que sean críticas.

## Documentación oficial de Raspberry Pi

- [Documentación oficial de cámaras](https://www.raspberrypi.com/documentation/accessories/camera.html) (orientación del cable, "contactos lejos de la tapa", cables Standard-Standard y Standard-Mini; leída casi entera, la herramienta cortó los últimos 4000 caracteres)
- [Plano del cable de cámara de 200 mm (RP-008146-DS-1)](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf) ([copia local](datasheets/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf)) (PDF)
- [Product brief de la Camera Module 3 (RP-008151-DS-1)](https://pip-assets.raspberrypi.com/categories/786-raspberry-pi-camera-module-3/documents/RP-008151-DS-1-camera-module-3-product-brief.pdf) ([copia local](../raspberry-pi-camera-module-3/datasheets/RP-008151-DS-1-camera-module-3-product-brief.pdf)) (PDF)
- [Esquema de referencia de la Camera Module 3 (RP-008969-SD-3)](https://pip-assets.raspberrypi.com/categories/1207-design-files/documents/RP-008969-SD-3-Raspberry%20Pi%20Camera%20Module%203%20Reference%20Schematic.pdf) ([copia local](../raspberry-pi-camera-module-3/datasheets/RP-008969-SD-3-Raspberry_Pi_Camera_Module_3_Reference_Schematic.pdf)) (PDF; conector J1 SFW15R-1STE1LF, nota de carriles; la extracción no dio números de pin)
- [Esquema reducido de la Pi 3B+ (RP-008339-DS-1)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) (PDF; la guía enlaza `datasheets.raspberrypi.com/rpi3/raspberry-pi-3-b-plus-reduced-schematics.pdf`, que redirige aquí. La extracción dio los nombres de las señales CSI pero no los pines)
- [Product brief de la Pi 3B+ (RP-008338-DS-2)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) (PDF; solo dice "MIPI CSI camera port"; la guía enlaza `datasheets.raspberrypi.com/rpi3/raspberry-pi-3-b-plus-product-brief.pdf`, que redirige aquí)
- [Datasheet del ensamblaje de sensor Standard FOV normal (RP-009992-DS-1)](https://pip-assets.raspberrypi.com/categories/1207-design-files/documents/RP-009992-DS-1-camera-module-3-sensor-assembly-standard-normalfov-datasheet.pdf) (PDF; **la herramienta lo vio vacío o sin texto**: no aportó nada)
- [Raspberry Pi: kit de extensión de cámara](https://www.raspberrypi.com/news/camera-board-extension/) (ya citado en la ficha de la cámara)
- [Documentación del software de cámara (rpicam)](https://www.raspberrypi.com/documentation/computers/camera_software.html) (**no pude leer la sección de resolución de problemas**: la herramienta devolvió otras partes de la página)
- [Camera cables en raspberrypi.com](https://www.raspberrypi.com/products/camera-cables/) (**no abrió**: error de la herramienta)
- [MagPi: Get started with the Pi camera](https://magpi.raspberrypi.com/articles/get-started-pi-camera), redirige a [magazine.raspberrypi.com](https://magazine.raspberrypi.com/articles/get-started-pi-camera) (~2016: "conector hacia el HDMI, cara azul hacia Ethernet/USB")
- [Documentación antigua de la cámara, en un fork de GitHub (no oficial)](https://github.com/chapas/documentation/blob/master/usage/camera/README.md) ("silver connectors face the HDMI port")
- [picamerax: Getting Started](https://picamerax.readthedocs.io/en/latest/quickstart.html) (terceros; "blue side toward the Ethernet port")

## Cable oficial de 500 mm (SC1130, Standard-Mini)

- [DigiKey SC1130](https://digikey.cn/en/products/detail/raspberry-pi/SC1130/21658263) ("RPI 5 CAMERA CABLE 500MM", sin datasheet ni conectores)
- [CPC Farnell SC1130](https://cpc.farnell.com/raspberry-pi/sc1130/fpc-cables-camera-500mm/dp/SC20203)
- [Hoja de datos SC1130 en Farnell](https://www.farnell.com/datasheets/4759386.pdf) (PDF; **no pude abrirlo**: la herramienta no obtuvo permiso)
- [Kiwi Electronics, 500 mm](https://www.kiwi-electronics.com/en/raspberry-pi-camera-accessories-133/raspberry-pi-camera-cable-standard-mini-500mm-11590) y [Kiwi, 300 mm](https://www.kiwi-electronics.com/en/raspberry-pi-camera-cable-standard-mini-300mm-11589) (el de 300 mm solo lo vi en el listado de resultados, no abrí la página)
- [BerryBase, 500 mm](https://www.berrybase.de/raspberry-pi-camera-cable-standard-mini-500mm) (dice "blindado" y se contradice con "20 cm" en la tabla)
- [Besomi SC1130](https://besomi.com/ae_en/cxav0170-sc1130-raspberry-pi-camera-cable-500mm.html) (sin conectores ni paso)

## Tipo de cable, orientación y pinout

- [OpenFlexure: cable de cámara de 30 cm (tipo B)](https://build.openflexure.org/openflexure-microscope/master/parts/electronics/camera_cable_300mm.html) y [de 20 cm](https://build.openflexure.org/openflexure-microscope/master/parts/electronics/camera_cable_200mm.html) ("el tipo equivocado quema la cámara en unos segundos")
- [OpenFlexure, incidencia #392: "el cable debe tener una pestaña azul por cara"](https://gitlab.com/openflexure/openflexure-microscope/-/issues/392) (sin fecha ni comentarios en lo que pude leer)
- [Farnell: Multicomp PRO MP-FFCA10152003B, FFC 15P opposite side 200 mm](https://uk.farnell.com/multicomp-pro/mp-ffca10152003b/ffc-cord-15p-opposite-side-200mm/dp/3385343) (enlace visto en la página de OpenFlexure; no abrí la página)
- [Foro de OpenMV: cable de extensión que mata sensores](https://forums.openmv.io/t/openmv-camera-module-extension-cable-kills-image-sensors/7840) (otro producto; la causa es opinión de un usuario)
- [Arducam: Raspberry Pi MIPI CSI camera pinout](https://blog.arducam.com/?p=20543) (pinout de 15 pines y orientaciones incorrectas)
- [Arducam: MIPI Camera Cable](https://docs.arducam.com/Camera-Extension-Solution/MIPI-Camera-Cable/) (lista de longitudes; sin límite ni tipo)
- [Microchip: RPi CSI camera interface (pinout de 15 pines)](https://onlinedocs.microchip.com/oxy/GUID-BABA2044-2D69-4FCC-A1E3-98FD36992888-en-US-3/GUID-3B439A68-A4F9-43C5-AB4C-78DD6E1D8D7F.html)
- [Zephyr: binding raspberrypi,csi-connector](https://docs.zephyrproject.org/latest/build/dts/api/bindings/gpio/raspberrypi,csi-connector.html) (pinout de 15 pines)
- [Wikipedia: Flexible flat cable](https://en.wikipedia.org/wiki/Flexible_flat_cable) (tipos 1/A y 2/D, refuerzo, paso)
- [Foro de Pimoroni: Camera Cable Joiner](https://forums.pimoroni.com/t/camera-cable-joiner-question/24525) (contactos hacia la placa; no se sabe si el que responde es de Pimoroni)
- [Kurokesu: pinout](https://wiki.kurokesu.com/books/6875640-camera-module/page/pinout) (consultado: es un conector de 24 pines, no sirve para este cable)

## FFC genérico: especificaciones y normas

- [Molex SD-15267-001: FFC de 1,00 mm, tipos A y D (PDF)](https://www.farnell.com/cad/4000125.pdf) ([copia local](datasheets/4000125.pdf))
- [Molex 151660241: FFC de 0,5 mm, tipo A (PDF)](https://www.farnell.com/datasheets/4726909.pdf)
- [Molex 152670304: FFC de 1,00 mm, 14 circuitos, tipo D](https://www.molex.com/en-us/products/part-detail/152670304) (página de producto, sin PDF)
- [Especificación GCT de FFC estándar, rev. A (PDF)](https://static.chipdip.ru/lib/010/DOC042010627.pdf)
- [Würth WR-FFC tipo 2, 0,5 mm (PDF)](https://www.we-online.com/components/products/datasheet/687733100002.pdf) ([copia local](datasheets/687733100002.pdf))
- [W+P serie 599, Flex Flat Cable](https://wppro.com/en/series/599)
- [LCSC Cable: FFC/FPC](https://lcsccable.com/services/ffcfpc-cable) (marketing de un fabricante; cifras de radio y ciclos sin verificar)
- [DigiKey/Molex: FFC/FPC Connector and Cable Compatibility Basics](https://www.digikey.com/en/blog/ffc-fpc-connector-and-cable-compatibility-basics) (la herramienta solo devolvió el menú, no el cuerpo del artículo)
- [Teledyne FLIR: radio de curvatura de un cable FPC](https://flir.com/support-center/iis/machine-vision/knowledge-base/what-is-the-bend-radius-of-my-flex-cable)
- [SparkFun: SMOL, preguntas sobre cable FFC](https://community.sparkfun.com/t/smol-questions-regarding-ffc-cable-mounting/43424) (cita un ensayo de plegado de Molex con radio de 4 mm; no he visto el documento)

## Conectores ZIF y reparación

- [RS Components: Amphenol SFW15R-1STE1LF](https://uk.rs-online.com/web/p/fpc-connectors/1822728P) (1 mm, 15 contactos, ZIF, contacto inferior, sin bloqueo)
- [Amphenol FCI: series HFW/HLW/SFW/SLW de 1,00 mm (PDF en RS)](https://docs.rs-online.com/446a/0900766b816ade50.pdf) ([copia local](datasheets/0900766b816ade50.pdf)) (sin ciclos de inserción ni espesor de cable)
- [Adafruit 4728: conector CSI/DSI de repuesto](https://adafruit.com/product/4728)
- [The Pi Hut: conector CSI/DSI de repuesto](https://thepihut.com/collections/raspberry-pi-camera/products/replacement-csi-dsi-connector-for-raspberry-pi-repair-part)
- [Foro de NVIDIA: lengüeta del conector CSI rota](https://forums.developer.nvidia.com/t/csi-camera-connector-broke/76806)

## Longitud y señal

- [The Imaging Source: MIPI CSI-2 cameras and FPC cable length](https://www.theimagingsource.com/en-us/support/knowledge-base/mipi-csi-2-cameras-fpc-cable-length/) (guía de un fabricante de cámaras industriales; sin fecha)
- [Adafruit 2143: cable de cámara de 1 m](https://www.adafruit.com/products/2143)
- [Dibujo del cable Adafruit CFF100-15F1-XXX-BK (PDF)](https://cdn-shop.adafruit.com/product-files/2143/flex_cables_CFF100-15F1-XXX-BK.PDF) (**no pude abrirlo**: la herramienta no obtuvo permiso)
- [Robu.in: Arducam cable extension kit, hasta 15 m](https://robu.in/product/arducam-cable-extension-kit-for-raspberry-pi-camera-up-to-15-meter-extension-compatible-with-raspberry-pi-camera/) (tienda, sin datos técnicos)
- [element14: longitud del cable (hilo de la ficha de la cámara)](https://community.element14.com/products/raspberry-pi/f/forum/21209/camera-module---cable-length/34644)
- [element14: Raspberry Pi camera ribbon cable ("hasta 300 mm", anónimo)](https://community.element14.com/technologies/experts/f/forum/44063/raspberry-pi-camera-ribbon-cable)
- [Foro de Dexter Industries: cable demasiado corto](https://forum.dexterindustries.com/t/camera-cable-too-short-to-reach-servo-package-solved/2332) (sin datos útiles de longitud)

## Fallos y foros

- [element14: Raspberry Pi camera (puerto equivocado, cable mal asentado)](https://community.element14.com/products/raspberry-pi/f/forum/47406/raspberry-pi-camera/64367) y [otro mensaje del mismo hilo](https://community.element14.com/products/raspberry-pi/f/forum/47406/raspberry-pi-camera/64718)
- [Core Electronics: Camera Board V2 issue](https://forum.core-electronics.com.au/t/camera-board-v2-issue/1357)
- [Core Electronics: Issues with camera module](https://forum.core-electronics.com.au/t/issues-with-camera-module/2950)
- [Core Electronics: Raspberry Pi Camera/s, common issues](https://forum.core-electronics.com.au/t/raspberry-pi-camera-s-common-issues/9492)
- [Emlid: cámara que no funciona tras blindarla](https://community.emlid.com/t/raspi-camera-not-working-after-beinfg-shielded/2869)
- [industrialmonitordirect: Raspberry Pi Camera Timeout Error Resolution Guide](https://industrialmonitordirect.com/blogs/knowledgebase/raspberry-pi-camera-timeout-error-resolution-guide) (blog de un vendedor; tiene errores, por ejemplo dice que la Pi 3B+ usa cable de 22 pines; solo he tomado de él los mensajes de error, **sin verificar**)

## Marca GeeekPi / 52Pi y anuncios parecidos

- Amazon.es, ASIN B07DKB4M1H: **no lo abrí** (Amazon bloquea el acceso automático). La búsqueda por el ASIN no devolvió el anuncio.
- [52Pi: camera cable ribbon, SKU Z-0192 (pack de 3)](https://52pi.com/products/52pi-camera-cable-ribbon-for-raspberry-pi) y [la misma página en otra ruta](https://52pi.com/collections/all/products/52pi-camera-cable-ribbon-for-raspberry-pi)
- [52Pi: about us](https://52pi.com/pages/about-us) (no menciona GeeekPi ni Amazon)
- [Wiki de 52Pi](https://wiki.52pi.com/) y [su búsqueda de "ribbon cable"](https://wiki.52pi.com/index.php?title=Special:Search&search=ribbon+cable) (sin página de este cable)
- [Marcas registradas de 52pi Technology (Shanghai), Justia](https://trademarks.justia.com/owners/52pi-technology-shanghai-co-ltd-3431314) (solo "52PI"; no aparece GEEEKPI)
- [ubuy: marca GeeekPi](https://www.ubuy.hk/en/brand/geeekpi) (revendedor; sin relación con 52Pi)
- [geeekpi.com](https://www.geeekpi.com) (**la herramienta no pudo abrirlo**: robots.txt; no lo rodeé)
- [TinyTronics: cable de 50 cm, ref. RPICAMFPC50CM](https://www.tinytronics.nl/en/cables-and-connectors/cables-and-adapters/ffc/raspberry-pi-camera-cable-15-pin-fpc-flex-50cm) (sin marca, paso ni tipo)
- [desertcart: Pastall 6 cables](https://www.desertcart.tw/products/208589668) (ejemplo de metadatos poco fiables: "RF Connector")

## Copias locales de los documentos

Documentos descargados el 21-10-2026 y guardados en el repositorio. Si un documento tiene enlace original en esta ficha, aparece junto a él como "copia local".

**En esta carpeta (`datasheets/`):**

- [0900766b816ade50.pdf](datasheets/0900766b816ade50.pdf): Conectores flex serie HFW, paso 1,00 mm (hoja de datos vía RS; conector del cable de la cámara)
- [4000125.pdf](datasheets/4000125.pdf): Plano de un cable FFC con longitudes de 8, 9 y 10 pulgadas (4000125)
- [687733100002.pdf](datasheets/687733100002.pdf): Würth Elektronik 687733100002: plano con dimensiones y propiedades del artículo
- [RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf](datasheets/RP-008146-DS-1-standard-camera-cable-200mm-reference-drawing.pdf): Raspberry Pi, cable de cámara estándar de 200 mm: plano de referencia (RP-008146-DS-1)

**Citados en esta ficha y guardados en otra carpeta:**

- [RP-008151-DS-1-camera-module-3-product-brief.pdf](../raspberry-pi-camera-module-3/datasheets/RP-008151-DS-1-camera-module-3-product-brief.pdf): product brief RP-008151-DS-1
- [RP-008969-SD-3-Raspberry_Pi_Camera_Module_3_Reference_Schematic.pdf](../raspberry-pi-camera-module-3/datasheets/RP-008969-SD-3-Raspberry_Pi_Camera_Module_3_Reference_Schematic.pdf): CONTENTS: / PAGE1 - CONTENTS / PAGE2 - CAMERA (esquema RP-008969-SD-3)
