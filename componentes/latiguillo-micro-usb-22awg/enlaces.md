# Enlaces guardados: latiguillo micro-USB macho, 22 AWG, 30 cm (6 uds.)

Todas las páginas consultadas para la [ficha](README.md), reunidas el 21-10-2026. Cada entrada dice si se abrió y qué aportó.

## Anuncio y proyecto

- Amazon.es, ASIN B0DP2NT8LY (`https://www.amazon.es/dp/B0DP2NT8LY`): **no abierto**. La herramienta devolvió `ROBOTS_DISALLOWED`; no lo he reintentado ni rodeado. No he encontrado el ASIN en ninguna otra web.
- Guía de montaje eléctrico del proyecto (v2, 20-10-2026), `claude/guia-montaje-electrico.md` del proyecto del usuario: §0, §1 fila 19, §2.1, §3, §4, §5.2 y §5.3. Leída en una copia local; no tiene URL.
- Fichas hermanas del repositorio: [Raspberry Pi 3B+](../raspberry-pi-3b-plus/README.md) (subtensión y copias locales de los documentos oficiales) [cable USB-A a USB-C acodado](../cable-usb-a-usb-c-90-30cm/README.md) (formato de referencia y nota sobre la rama sin fusible) y [WAGO 221](../wago-221-surtido/README.md) (rango de conductores).

## Especificación del conector micro-USB

- [USB 2.0 Micro-USB Cables and Connectors Specification, Rev. 1.01 (4-4-2007), copia en git.nefarius.at](https://git.nefarius.at/nefarius/USB-Bluetooth-Specs/media/branch/master/usb_20_0702115/Micro-USB_final/Micro-USB_1_01.pdf) ([copia local](datasheets/Micro-USB_1_01.pdf)): **leída** (tres consultas). Copia de terceros, no de usb.org. Da: pines y colores típicos (Tabla 4-2), resistencia de contacto de 30 mΩ (5.2), 1,8 A mínimo en los contactos 1 y 5 (5.3.2), +30 °C de subida (5.3), fuerzas de inserción y extracción (6.2 y 6.3), 70 mΩ para adaptadores (4.5.8) y temperatura de funcionamiento (6.1). No da calibre, vibración ni dimensiones del sobremoldeado en el texto extraído (Figura 4-5, p. 18, no legible).
- [La misma ruta con `raw`](https://git.nefarius.at/nefarius/USB-Bluetooth-Specs/raw/branch/master/usb_20_0702115/Micro-USB_final/Micro-USB_1_01.pdf) ([copia local](datasheets/Micro-USB_1_01.pdf)): devuelve un puntero de Git LFS (1.231.932 bytes), no el PDF. Sirve `media` en lugar de `raw`.
- [Página oficial de la especificación USB 2.0 (usb.org)](https://usb.org/document-library/usb-20-specification): enlace tomado de la ficha hermana del cable USB-C. **No abierto.** No he comprobado si el ZIP oficial incluye la carpeta Micro-USB.

## Raspberry Pi 3B+: documentos oficiales

- [Product brief RP-008338-DS-2](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf) · [copia local](../raspberry-pi-3b-plus/datasheets/RP-008338-DS-2-raspberry-pi-3-b-plus-product-brief.pdf): leído en local. 5 V / 2,5 A por micro-USB o GPIO; aviso de que solo debe conectarse a una fuente de 5 V / 2,5 A.
- [Esquema reducido RP-008339-DS-1 (V1.0, 19-3-2018)](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf) · [copia local](../raspberry-pi-3b-plus/datasheets/RP-008339-DS-1-raspberry-pi-3-b-plus-reduced-schematics.pdf): leído en local (texto y página renderizada). Sección "POWER IN": J1 `10103594-0001LF`, F1 `MF-MSMF250/X`, D7 `SMBJ5.0A`, C84 47 µF, puntos de prueba PP2, PP7 y PP3 a PP6; pines 2, 3 y 4 del J1 sin conectar.
- [Plano mecánico RP-008337-DS-2](https://pip-assets.raspberrypi.com/categories/532-raspberry-pi-3-model-b/documents/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf) · [copia local](../raspberry-pi-3b-plus/datasheets/RP-008337-DS-2-raspberry-pi-3-b-plus-mechanical-drawing.pdf): leído (imagen renderizada). Micro-USB a 10,6 mm del borde, HDMI a 32 mm.
- [Aviso de cambio Rev 9 (RP-003337-PC-1)](https://pip-assets.raspberrypi.com/categories/797-pcn/documents/RP-003337-PC-1-Pi3B_%20Revision%209%20PCN.pdf): no reabierto; resumen en la ficha de la Pi (solo cambia el PMIC).
- [Documentación de hardware de Raspberry Pi](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html): **abierta, pero llega cortada a mi herramienta**; la sección "Power supply" (sale en el índice de la página) no se leyó. Dos consultas, sin esa parte.
- [Documentación antigua de potencia (`raspberrypi.org/documentation/hardware/raspberrypi/power/README.md`)](https://www.raspberrypi.org/documentation/hardware/raspberrypi/power/README.md): **no abierto**; la herramienta lo bloqueó (la URL la recordé yo, no salió en ninguna búsqueda).

## Foros y casos (alimentación de la Pi)

- [raspberrypi/linux#2512, avisos de subtensión](https://github.com/raspberrypi/linux/issues/2512): leído. Mediciones en PP1/2, PP7, GPIO y fuente; cable cambiado; límite de registro de 3 mensajes cada 5 min; comentarios sobre 26-28 AWG.
- [element14: tensión mínima de alimentación de la Pi 3B+](https://community.element14.com/products/raspberry-pi/f/forum/38347/what-is-the-minimun-supply-voltage-for-the-pi3b-plus): leído (hilo completo). Origen del 4,63 V (APX803, ±0,07 V frente a ±5 % según la documentación), 4,98 V insuficiente y 5,1 V suficiente, recomendación de 20-22 AWG.
- [element14: la misma discusión, respuesta citada en la ficha de la Pi](https://community.element14.com/products/raspberry-pi/f/forum/38347/what-is-the-minimun-supply-voltage-for-the-pi3b-plus/138377): no la abrí por separado.
- [element14: element14 (AU) power supply for Raspberry Pi, poor voltage](https://community.element14.com/products/raspberry-pi/f/forum/21109/element14-au-power-supply-for-raspberry-pi---poor-voltage): leído. Pi original: lecturas en TP1/TP2 y caída en F3.
- [element14: Power Supply issues](https://community.element14.com/products/raspberry-pi/f/forum/18522/power-supply-issues): leído. Pi original: caída en F3 de 120-140 mV, pantalla HDMI por debajo de 4,8 V.
- [element14: How much current can I put into my RPi](https://community.element14.com/products/raspberry-pi/f/forum/19139/how-much-current-can-i-put-into-my-rpi/22931): leído. Pi original: alimentar por el GPIO se salta el fusible.
- [Pimoroni: "broken power supply USB"](https://forums.pimoroni.com/t/broken-power-supply-usb/16874): leído. Conector micro-USB roto; alternativa por los pines de 5 V.
- [Raspberry Shake: "Power Supply socket issue"](https://community.raspberryshake.org/t/power-supply-socket-issue/4788/2): leído. Conector micro-USB agrietado; sin causa ni cifras.
- [Pi My Life Up: aviso de bajo voltaje](https://pimylifeup.com/raspberry-pi-low-voltage-warning/): leído. Cita 5 V / 2,5 A para la 3B+; **no da el umbral** de 4,63 V.
- [Core Electronics: alimentador oficial de la Pi 3+](https://core-electronics.com.au/raspberry-pi-3-power-supply.html.plain.md): leído. 5,1 V a 2,5 A; sin longitud ni calibre del cable.
- [The Pi Hut: alimentador oficial 12,5 W micro-USB](https://thepihut.com/products/raspberry-pi-zero-usa-power-supply): leído. +5,1 V, 2,5 A, cable de 1,5 m en 18 AWG (datos de una tienda, no de una hoja oficial).

## Componentes del camino de alimentación de la Pi

- [Heilind: Amphenol FCI 10103594-0001LF](https://estore.heilind.com/04T-JWPF-VSLE-S/brg10103594-0001lf.html): leído. 1,8 A, 10.000 ciclos, carcasa LCP, 100 VAC. Sin enlace al PDF del fabricante en el contenido.
- [DigiKey: Amphenol FCI 10103594-0001LF](https://digikey.cn/en/products/detail/amphenol-icc-fci/10103594-0001LF/2350351): leído. Solo descripción (micro-B, 5 posiciones, SMD acodado con anclaje pasante); sin corriente ni PDF en el contenido.
- [DigiKey: Bourns MF-MSMF250/16X-2](https://azcus.digikey.com/en/products/detail/bourns-inc/MF-MSMF250-16X-2/2563289): leído. Mantiene 2,5 A, dispara a 5 A, 16 V, 15 mΩ mínimo inicial, R1 máximo 100 mΩ, 100 A, 5 s. Sin resistencia inicial máxima ni PDF en el contenido.
- [e-sonic: Bourns MF-MSMF250/16-2](https://e-sonic.com/en/bourns/mfmsmf250162-10751633.html): leído. Misma familia (pieza descatalogada; reemplazo: 16X-2). 2,5 A / 5 A / 16 V / 15 mΩ mínimo.
- [e-sonic: datasheet de esa pieza](https://www.e-sonic.com/en/datasheet/mfmsmf250162-10751633/): **no abierto**; la herramienta lo bloqueó.
- [Datasheet de Bourns, ruta `mfmsmf.pdf` en bourns.com](https://www.bourns.com/docs/Product-Datasheets/mfmsmf.pdf): **no abierto**; bloqueado. La URL era una suposición mía, no salió en ninguna búsqueda; no la uses como enlace.
- [Avnet: MF-MSMF250/16X-2](https://www.avnet.com/americas/product/bourns/mf-msmf250-16x-2/evolve-864161/): abierta, sin especificaciones en el contenido.
- Vistos en una búsqueda y **no abiertos**: [alldatasheet, MF-R250](https://www.alldatasheet.net/html-pdf/549377/BOURNS/MF-R250/216/1/MF-R250.html) (es otra serie de Bourns, la MF-R), [Master Electronics](https://www.masterelectronics.com/en/bourns/mfmsmf25016x2-10751634.html), [Findchips](https://origin-www.findchips.com/detail/mf-msmf250%2F16x-2/Bourns-Inc).

## Calibre, resistencia del hilo y CCA

- [Wikipedia: American wire gauge](https://en.wikipedia.org/wiki/American_wire_gauge): leído. Resistencia por metro de 20 a 28 AWG (cobre macizo a 20 °C) y columnas de corriente admisible.
- [Wikipedia: Copper-clad aluminium wire](https://en.wikipedia.org/wiki/Copper-clad_aluminium_wire): leído. No da % IACS ni resistividad; dice que tiene más resistencia en continua y es difícil de soldar.
- [Fluke Networks: CCA, nota de aplicación (copia en cccassoc.org)](https://cccassoc.org/wp-content/uploads/2020/03/FLUKE_Application_Note_Copper_Clad_Aluminum_CCA_Cables.pdf) ([copia local](datasheets/FLUKE_Application_Note_Copper_Clad_Aluminum_CCA_Cables.pdf)): leído. Aluminio macizo, un 55 % más de resistencia en continua que el cobre; prueba de rascado; desequilibrio de resistencia en continua como indicador.
- [EEVblog: micro-USB test jig and results (2013)](https://eevblog.com/forum/reviews/quick-and-dirty-micro-usb-test-jig-and-results): leído. Tabla de resistencias medidas de cables micro-USB.
- [Grant Trebbin: USB cable resistance (2015)](https://www.grant-trebbin.com/2015/08/usb-cable-resistance.html): leído. Un hilo de un cable corto barato midió 76 mΩ.
- [EPEC: causas de fallo en cables](https://www.epectec.com/articles/what-causes-cable-assemblies-to-fail-and-how-to-avoid-them.html): no reabierto; citado de la ficha del cable USB-A a USB-C.
- Vistos en una búsqueda y **no abiertos**: [Fluke Networks, consejos para identificar CCA](https://de.flukenetworks.com/blog/cabling-chronicles/cca-not-worth-savings-or-risk), [Belden, "CCA cable: 5 reasons to stay away"](https://cn.belden.com/blog/cca-cable-5-reasons-to-stay-away), [Belden, receta del fallo](https://fr.belden.com/blog/not-in-my-network-copper-clad-aluminum-recipe-for-failure), [ICC](https://icc.com/?p=15374), [Ampcom](https://www.ampcom.com/blogs/industry-insights/cca-vs-solid-copper-ethernet-risks-1), [Helukabel](https://www.helukabel.com.vn/vn-en/cca-inner-concuctor-instead-of-aluminium-or-copper.html), [Cables and Kits](https://www.cablesandkits.com/learning-center/?p=696). Hablan de cableado de red, no de cables micro-USB.

## Otros resultados de búsqueda que no abrí

- Subtensión y alimentación: [OctoPrint](https://community.octoprint.org/t/cant-get-rid-of-undervoltage-errors/31978), [Core Electronics, foro](https://forum.core-electronics.com.au/t/pi-3b-3-5-lcd-battery-powered/12044), [RetroPie](https://retropie.org.uk/forum/post/6221), [Node-RED](https://discourse.nodered.org/t/ras-pi-supply-voltage/8791), [info-beamer](https://community.info-beamer.com/t/suggestion-for-a-good-power-supply-for-raspberry-pi3/78), [gist de Paraphraser](https://gist.github.com/Paraphraser/17fb6320d0e896c6446fb886e1207c7e), [peppe8o](https://peppe8o.com/?p=8903), [Binus](https://binus.ac.id/malang/2020/06/efek-under-voltage-pada-raspi/), [linuxconfig](https://linuxconfig.org/?p=20195).
- Conector roto o aflojado: [element14, "Is my Pi broken"](https://community.element14.com/products/raspberry-pi/f/forum/18916/is-my-pi-broken), [element14, "Pi 3 board failure"](https://community.element14.com/products/raspberry-pi/f/forum/30630/pi-3-board-failure/103594), [sudomod](https://sudomod.com/forum/viewtopic.php?p=67020), [Pimoroni, On/Off SHIM](https://forums.pimoroni.com/t/on-off-shim-bad-usb-port/5817).
- Alimentación por GPIO: [element14, "Is it safe to power a Raspberry Pi from battery"](https://community.element14.com/products/raspberry-pi/f/forum/1491/is-it-safe-to-power-a-raspberry-pi-from-battery-s/82820), [element14, "Raspberry Pi fuse"](https://community.element14.com/products/raspberry-pi/f/forum/11461/raspberry-pi-fuse---have-you-ever-tripped-it), [RetroPie, NESPi](https://retropie.org.uk/forum/post/124092), [StereoPi](https://forum.stereopi.com/viewtopic.php?f=5&p=1295).
- Venta del alimentador oficial: [CanaKit](https://www.canakit.com/raspberry-pi-adapter-power-supply-2-5a.html), [Cool Components](https://coolcomponents.co.uk/products/official-2-5amp-5-1v-power-supply-for-raspberry-pi-3-model-b).

## Copias locales de los documentos

Documentos descargados el 21-10-2026 y guardados en el repositorio. Si un documento tiene enlace original en esta ficha, aparece junto a él como "copia local".

**En esta carpeta (`datasheets/`):**

- [FLUKE_Application_Note_Copper_Clad_Aluminum_CCA_Cables.pdf](datasheets/FLUKE_Application_Note_Copper_Clad_Aluminum_CCA_Cables.pdf): Application Note: Copper Clad Aluminum(CCA) Cables / Introduction / There are growing concerns in the network equipment industry a
- [Micro-USB_1_01.pdf](datasheets/Micro-USB_1_01.pdf): USB-IF, Micro-USB Cables and Connectors Specification, rev. 1.01 (04-2007; copia no oficial en git.nefarius.at)
